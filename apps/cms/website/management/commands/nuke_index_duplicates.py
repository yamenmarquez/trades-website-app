from django.core.management.base import BaseCommand
from django.db import transaction
from wagtail.models import Page, Site
from website.models_pages import PortfolioIndexPage, ServicesIndexPage


def pick_canonical(cands, model_key):
    """Prefer website.<model_key> + live + menor profundidad + id más bajo."""

    def key(p):
        ct = p.content_type
        return (
            0 if (ct.app_label == "website" and ct.model == model_key) else 1,
            0 if getattr(p, "live", False) else 1,
            getattr(p, "depth", 9999),
            p.id,
        )

    return sorted(cands, key=key)[0]


def gather_candidates(title_key: str, model_key: str):
    by_model = list(Page.objects.filter(content_type__model=model_key).specific())
    by_title = list(Page.objects.filter(title__iexact=title_key).specific())
    seen = set()
    out = []
    for p in by_model + by_title:
        if p.id not in seen:
            seen.add(p.id)
            out.append(p)
    return out


def ensure_keep(model_cls, title_key: str, model_key: str):
    cands = gather_candidates(title_key, model_key)
    if not cands:
        root = Page.get_first_root_node()
        keep = model_cls(title=title_key.capitalize())
        root.add_child(instance=keep)
        keep.save_revision().publish()
        return keep, []
    keep = pick_canonical(cands, model_key)
    extras = [p for p in cands if p.id != keep.id]
    if not getattr(keep, "live", False):
        keep.save_revision().publish()
    return keep, extras


def unlock_if_needed(p: Page):
    # Wagtail Page has locked flag and unlock() helper
    if getattr(p, "locked", False):
        try:
            p.unlock()
        except Exception:
            pass


class Command(BaseCommand):
    help = (
        "Aggressively consolidate to a single Services/Portfolio index across the entire tree. "
        "Moves children, unlocks/unpublishes, reassigns Site root if needed, deletes duplicates."
    )

    @transaction.atomic
    def handle(self, *args, **opts):
        total_moves = total_deletes = 0

        for Model, model_key, title_key in [
            (ServicesIndexPage, "servicesindexpage", "services"),
            (PortfolioIndexPage, "portfolioindexpage", "portfolio"),
        ]:
            keep, extras = ensure_keep(Model, title_key, model_key)
            self.stdout.write(
                self.style.WARNING(
                    f"[{model_key}] keeping id={keep.id} title='{keep.title}' depth={keep.depth} live={getattr(keep,'live',False)}"
                )
            )

            # Reasigna sitios que apunten al duplicado (raro pero bloquea delete)
            for dup in extras:
                for s in Site.objects.filter(root_page=dup):
                    s.root_page = keep
                    s.save()

            for dup in extras:
                self.stdout.write(
                    f"  - consolidating dup id={dup.id} type={dup.content_type.app_label}.{dup.content_type.model} title='{dup.title}' depth={dup.depth} live={getattr(dup,'live',False)}"
                )
                # mueve hijos
                for child in dup.get_children().specific():
                    child.move(keep, pos="last-child")
                    total_moves += 1

                # desbloquea, despublica y borra
                unlock_if_needed(dup)
                if getattr(dup, "live", False):
                    try:
                        dup.unpublish()
                    except Exception:
                        pass
                try:
                    dup.delete()
                    total_deletes += 1
                except Exception as e:
                    # último recurso: renombrar para que no moleste
                    dup.title = f"Archived {dup.title} (dup {dup.id})"
                    dup.slug = f"archived-{dup.slug}-{dup.id}"
                    dup.save()
                    self.stdout.write(
                        self.style.ERROR(f"    ! could not delete dup id={dup.id}: {e}; archived instead")
                    )

        self.stdout.write(self.style.SUCCESS(f"Done. moved={total_moves} deleted={total_deletes}"))
