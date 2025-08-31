from django.core.management.base import BaseCommand
from django.db import transaction
from wagtail.models import Page
from website.models_pages import PortfolioIndexPage, ServicesIndexPage


def get_keep(model_cls):
    # Prefer the instance from website (should exist after refactor)
    keep = model_cls.objects.order_by("id").first()
    if not keep:
        # Fallback: create under root
        root = Page.get_first_root_node()
        keep = model_cls(title=model_cls.__name__.replace("IndexPage", ""))
        root.add_child(instance=keep)
        keep.save_revision().publish()
    if not keep.live:
        keep.save_revision().publish()
    return keep


class Command(BaseCommand):
    help = (
        "Delete draft duplicate root indexes for Portfolio/Services that are not website.*IndexPage. "
        "Move children to canonical before deletion."
    )

    def handle(self, *args, **opts):
        ops_move = ops_del = 0

        targets = [
            ("portfolio", "portfolioindexpage", PortfolioIndexPage),
            ("services", "servicesindexpage", ServicesIndexPage),
        ]

        for title_key, model_key, model_cls in targets:
            keep = get_keep(model_cls)

            # Root pages only (depth = root.depth + 1)
            root_depth = Page.get_first_root_node().depth + 1
            by_title = Page.objects.filter(title__iexact=title_key, depth=root_depth).specific()
            by_model = (
                Page.objects.filter(content_type__model=model_key)
                .exclude(id=keep.id)
                .specific()
            )

            ids_seen = {keep.id}
            candidates = []
            for p in list(by_title) + list(by_model):
                if p.id not in ids_seen:
                    candidates.append(p)
                    ids_seen.add(p.id)

            for dup in candidates:
                if dup.id == keep.id:
                    continue
                # Move children, if any
                children = list(dup.get_children().specific())
                for ch in children:
                    ch.move(keep, pos="last-child")
                    ops_move += 1
                # Delete: if live, unpublish first; then try delete in savepoint; fallback archive
                if dup.live:
                    dup.unpublish()
                try:
                    with transaction.atomic():
                        dup.delete()
                    ops_del += 1
                    self.stdout.write(
                        f"Deleted duplicate id={dup.id} type={dup.content_type.app_label}.{dup.content_type.model} title='{dup.title}'"
                    )
                except Exception:
                    # Fallback: archive and keep unpublished
                    original_title = dup.title
                    dup.title = f"Archived {original_title} (dup {dup.id})"
                    dup.slug = f"archived-{dup.slug}-{dup.id}"
                    dup.save()
                    self.stdout.write(
                        self.style.WARNING(
                            f"Could not fully delete id={dup.id}; archived and unpublished."
                        )
                    )

        self.stdout.write(self.style.SUCCESS(f"Done. moved={ops_move} deleted={ops_del}"))
