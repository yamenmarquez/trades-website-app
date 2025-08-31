from django.db import models
from wagtail.models import Page
from wagtail.fields import RichTextField, StreamField
from wagtail.images.blocks import ImageChooserBlock
from wagtail.snippets.models import register_snippet
from wagtail.admin.panels import FieldPanel, FieldRowPanel

@register_snippet
class Theme(models.Model):
    name = models.CharField(max_length=64)
    brand_color = models.CharField(max_length=7, default="#0ea5e9")
    accent = models.CharField(max_length=7, default="#22c55e")
    neutral = models.CharField(max_length=7, default="#0f172a")
    font_heading = models.CharField(max_length=64, default="Inter")
    font_body = models.CharField(max_length=64, default="Inter")
    radius = models.CharField(max_length=8, default="1rem")
    layout_variant = models.CharField(max_length=32, default="bold-build")
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)

    panels = [
        FieldPanel("name"),
        FieldRowPanel([FieldPanel("brand_color"), FieldPanel("accent"), FieldPanel("neutral")]),
        FieldRowPanel([FieldPanel("font_heading"), FieldPanel("font_body")]),
        FieldRowPanel([FieldPanel("radius"), FieldPanel("layout_variant")]),
    ]

    def __str__(self):
        return self.name

    class Meta:
        ordering = ["name"]

@register_snippet
class Service(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = RichTextField(blank=True)
    icon = models.CharField(max_length=40, blank=True)  # lucide icon name

    panels = [FieldPanel("name"), FieldPanel("slug"), FieldPanel("description"), FieldPanel("icon")]

    def __str__(self):
        return self.name

class MediaAsset(models.Model):
    image = models.ForeignKey(
        "wagtailimages.Image", on_delete=models.SET_NULL, null=True, blank=True, related_name="+"
    )
    alt = models.CharField(max_length=160, blank=True)
    tags = models.CharField(max_length=160, blank=True)  # comma separated
    width = models.IntegerField(null=True, blank=True)
    height = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return self.alt or f"Asset {self.pk}"

class ProjectIndexPage(Page):
    intro = RichTextField(blank=True)
    content_panels = Page.content_panels + [FieldPanel("intro")]

class ProjectPage(Page):
    services = models.ManyToManyField(Service, blank=True)
    city = models.CharField(max_length=120, blank=True)
    date = models.DateField(null=True, blank=True)

    gallery = StreamField([
        ("image", ImageChooserBlock()),
    ], use_json_field=True, blank=True)

    description = RichTextField(blank=True)

    content_panels = Page.content_panels + [
        FieldPanel("services"),
        FieldPanel("city"),
        FieldPanel("date"),
        FieldPanel("gallery"),
        FieldPanel("description"),
    ]

@register_snippet
class Testimonial(models.Model):
    name = models.CharField(max_length=120)
    rating = models.PositiveSmallIntegerField(default=5)
    text = models.TextField()
    source = models.URLField(blank=True)

    panels = [
        FieldPanel("name"),
        FieldPanel("rating"),
        FieldPanel("text"),
        FieldPanel("source"),
    ]

    def __str__(self):
        return f"{self.name} ({self.rating}★)"
