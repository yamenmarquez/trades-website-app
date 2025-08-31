from django.db import models
from wagtail.models import Page
from wagtail.fields import RichTextField, StreamField
from wagtail.admin.panels import FieldPanel
from wagtail import blocks
from wagtail.images.blocks import ImageChooserBlock
from wagtail.images import get_image_model_string
from taggit.managers import TaggableManager

ImageStr = get_image_model_string()


class ServicesIndexPage(Page):
    """Container for ServicePage children."""

    subpage_types = ["website.ServicePage"]
    parent_page_types = ["wagtailcore.Page"]
    max_count = 1  # enforce exactly one services index page

    intro = RichTextField(blank=True)

    content_panels = Page.content_panels + [FieldPanel("intro")]


class ServicePage(Page):
    """A single service landing page."""

    parent_page_types = ["website.ServicesIndexPage"]
    subpage_types = []

    hero = models.ForeignKey(
        ImageStr, null=True, blank=True, on_delete=models.SET_NULL, related_name="+"
    )
    intro = RichTextField(blank=True)
    body = StreamField(
        [
            (
                "paragraph",
                blocks.RichTextBlock(
                    features=["bold", "italic", "link", "ol", "ul", "h2", "h3", "hr"]
                ),
            ),
            ("image", ImageChooserBlock()),
            (
                "faq",
                blocks.StructBlock([
                    ("q", blocks.CharBlock()),
                    ("a", blocks.RichTextBlock()),
                ]),
            ),
        ],
        use_json_field=True,
        blank=True,
    )

    content_panels = Page.content_panels + [
        FieldPanel("hero"),
        FieldPanel("intro"),
        FieldPanel("body"),
    ]


class PortfolioIndexPage(Page):
    """Container for ProjectPage children."""

    subpage_types = ["website.ProjectPage"]
    parent_page_types = ["wagtailcore.Page"]
    max_count = 1  # enforce exactly one portfolio index page

    intro = RichTextField(blank=True)

    content_panels = Page.content_panels + [FieldPanel("intro")]


class ProjectPage(Page):
    """A single portfolio project page."""

    parent_page_types = ["website.PortfolioIndexPage"]
    subpage_types = []

    city = models.CharField(max_length=120, blank=True)
    # Keep services as tags for simplicity/filtering
    services = TaggableManager(blank=True)
    before_image = models.ForeignKey(
        ImageStr, null=True, blank=True, on_delete=models.SET_NULL, related_name="+"
    )
    after_image = models.ForeignKey(
        ImageStr, null=True, blank=True, on_delete=models.SET_NULL, related_name="+"
    )
    gallery = StreamField([("image", ImageChooserBlock())], use_json_field=True, blank=True)

    content_panels = Page.content_panels + [
        FieldPanel("city"),
        FieldPanel("services"),
        FieldPanel("before_image"),
        FieldPanel("after_image"),
        FieldPanel("gallery"),
    ]
