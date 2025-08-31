from django.core.management.base import BaseCommand
from django.db import transaction
from wagtail.models import Page, Site as WagtailSite, PageViewRestriction
from website.models_pages import PortfolioIndexPage, ServicesIndexPage


def ensure_one(model_cls, model_key: str, title_key: str):
    """Collect candidates by content_type.model (any app) and by exact title.
    Pick canonical from website app; if none exists, create one under root.
    Return (keep, extras) where extras excludes keep.
    """
    candidates = list(Page.objects.filter(content_type__model=model_key).specific())
    by_title = list(Page.objects.filter(title__iexact=title_key).specific())
    seen = {p.id for p in candidates}
    candidates.extend([p for p in by_title if p.id not in seen])

    if not candidates:
        root = Page.get_first_root_node()
        keep = model_cls(title=title_key.capitalize())
        root.add_child(instance=keep)
        keep.save_revision().publish()
        return keep, []

    keep = None
    extras = []
    for p in candidates:
        ct = p.content_type
        if ct.app_label == "website" and ct.model == model_key and keep is None:
            keep = p
        else:
            extras.append(p)

    if keep is None:
        root = Page.get_first_root_node()
        keep = model_cls(title=title_key.capitalize())
        root.add_child(instance=keep)
        keep.save_revision().publish()

    extras = [p for p in extras if p.id != keep.id]
    return keep, extras


class Command(BaseCommand):
    help = (
        "Aggressively dedupe Services/Portfolio index pages across titles and content types; move children and delete duplicates."
    )

    def handle(self, *args, **opts):
        total_moves = 0
        total_deletes = 0

        for model_cls, model_key, title_key in [
            (ServicesIndexPage, "servicesindexpage", "services"),
            (PortfolioIndexPage, "portfolioindexpage", "portfolio"),
        ]:
            keep, extras = ensure_one(model_cls, model_key, title_key)
            if not keep.live:
                keep.save_revision().publish()
            self.stdout.write(
                self.style.WARNING(f"[{model_key}] Keeping id={keep.id} {keep.title}")
            )
            for dup in extras:
                self.stdout.write(
                    f"  - Consolidating duplicate id={dup.id} type={dup.content_type.app_label}.{dup.content_type.model} title='{dup.title}'"
                )
                for child in dup.get_children().specific():
                    child.move(keep, pos="last-child")
                    total_moves += 1
                # Clean up objects that may protect deletion
                # 1) Remove any alias pages pointing to this duplicate
                for alias in Page.objects.filter(alias_of=dup).specific():
                    alias.delete()
                # 2) Remove any view restrictions on this duplicate
                PageViewRestriction.objects.filter(page=dup).delete()
                # 2b) Remove any group page permissions on this duplicate (best-effort)
                try:
                    from wagtail.models import GroupPagePermission  # type: ignore

                    GroupPagePermission.objects.filter(page=dup).delete()
                except Exception:
                    pass
                # 2c) Remove any redirects to this page (best-effort)
                try:
                    from wagtail.contrib.redirects.models import Redirect  # type: ignore

                    Redirect.objects.filter(redirect_page=dup).delete()
                except Exception:
                    pass
                # 3) Reassign any Sites that incorrectly use this page as root
                for site in WagtailSite.objects.filter(root_page=dup):
                    # Prefer the duplicate's parent as the new root if available; fallback to keep's parent
                    new_root = dup.get_parent() if dup.get_parent() else keep.get_parent()
                    if new_root is None:
                        new_root = Page.get_first_root_node()
                    site.root_page = new_root
                    site.save()
                # Attempt deletion; if it fails, unpublish and leave a warning
                try:
                    # Use a savepoint to catch commit-time FK failures
                    with transaction.atomic():
                        dup.delete()
                    total_deletes += 1
                except Exception:
                    # Fallback: archive in place to avoid title-based detection
                    if dup.live:
                        dup.unpublish()
                    # Change title/slug so it won't be detected by title __iexact
                    original_title = dup.title
                    dup.title = f"Archived {original_title} (dup {dup.id})"
                    # unique slug
                    dup.slug = f"archived-{dup.slug}-{dup.id}"
                    # Point as alias to keep for clarity (best-effort)
                    try:
                        dup.alias_of = keep
                    except Exception:
                        pass
                    dup.save()
                    self.stdout.write(
                        self.style.ERROR(
                            f"    ! Could not delete id={dup.id} due to FK constraints. Archived and unpublished."
                        )
                    )

        self.stdout.write(
            self.style.SUCCESS(f"Done. moved={total_moves} deleted={total_deletes}")
        )
