from django.core.management.base import BaseCommand
from wagtail.models import Page
from website.models_pages import PortfolioIndexPage, ServicesIndexPage


def get_or_create_keep(model_cls, title):
    keep = model_cls.objects.order_by("id").first()
    if not keep:
        root = Page.get_first_root_node()
        keep = model_cls(title=title.capitalize())
        root.add_child(instance=keep)
        keep.save_revision().publish()
    if not keep.live:
        keep.save_revision().publish()
    return keep


class Command(BaseCommand):
    help = "Delete root-level duplicates for 'Portfolio' and 'Services' not using website.*IndexPage. Moves children to canonical idx first."

    def handle(self, *args, **opts):
        root = Page.get_first_root_node()
        root_depth = root.depth + 1
        ops_move = ops_del = 0

        mapping = {
            "portfolio": (PortfolioIndexPage, "portfolioindexpage"),
            "services": (ServicesIndexPage, "servicesindexpage"),
        }

        for title_key, (Model, model_key) in mapping.items():
            keep = get_or_create_keep(Model, title_key)
            # todas las páginas raíz con ese título
            by_title = list(Page.objects.filter(title__iexact=title_key, depth=root_depth).specific())

            for dup in by_title:
                if dup.id == keep.id:
                    continue
                # mover hijos si hay
                for ch in dup.get_children().specific():
                    ch.move(keep, pos="last-child")
                    ops_move += 1
                # despublicar si hace falta y borrar
                if dup.live:
                    dup.unpublish()
                dup.delete()
                ops_del += 1
                self.stdout.write(f"Deleted root duplicate id={dup.id} type={dup.content_type.app_label}.{dup.content_type.model} title='{dup.title}'")

        self.stdout.write(self.style.SUCCESS(f"Done. moved={ops_move} deleted={ops_del}"))
