from django.db import models
from django.utils.text import slugify
from wagtail.snippets.models import register_snippet
from wagtail.admin.panels import FieldPanel, MultiFieldPanel
from wagtail.fields import RichTextField, StreamField
from wagtail import blocks
from wagtail.images import get_image_model_string


@register_snippet
class GeoArea(models.Model):
    TYPE_CHOICES = (
        ("city", "City"),
        ("neighborhood", "Neighborhood"),
    )

    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default="city")
    name = models.CharField(max_length=160)
    slug = models.SlugField(max_length=180, unique=True, blank=True)
    parent_city = models.ForeignKey("self", null=True, blank=True, on_delete=models.SET_NULL, related_name="neighborhoods")
    geojson = models.TextField(null=True, blank=True)
    center_lat = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    center_lng = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    population_note = models.TextField(blank=True)
    neighbors = models.ManyToManyField('self', symmetrical=True, blank=True, related_name='neighbor_of')
    permits_links = StreamField([
        ("link", blocks.StructBlock([
            ("label", blocks.CharBlock()),
            ("url", blocks.URLBlock()),
        ])),
    ], use_json_field=True, blank=True)

    panels = [
        FieldPanel("type"),
        FieldPanel("name"),
        FieldPanel("slug"),
        FieldPanel("parent_city"),
        FieldPanel("geojson"),
        FieldPanel("center_lat"),
        FieldPanel("center_lng"),
        FieldPanel("population_note"),
    FieldPanel("permits_links"),
    ]

    class Meta:
        ordering = ["type", "name"]
        indexes = [
            models.Index(fields=["slug"]),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


@register_snippet
class ServiceCoverage(models.Model):
    STATUS_CHOICES = (
        ("draft", "Draft"),
        ("ready", "Ready"),
    )

    service = models.ForeignKey("website.ServicePage", on_delete=models.CASCADE, related_name="coverages")
    geoarea = models.ForeignKey(GeoArea, on_delete=models.CASCADE, related_name="coverages")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="draft")

    unique_intro = RichTextField(blank=True)
    pain_points_local = StreamField([
        ("point", blocks.StructBlock([
            ("title", blocks.CharBlock()),
            ("text", blocks.RichTextBlock()),
        ])),
    ], use_json_field=True, blank=True)
    process_steps_local = StreamField([
        ("step", blocks.StructBlock([
            ("title", blocks.CharBlock()),
            ("text", blocks.RichTextBlock()),
        ])),
    ], use_json_field=True, blank=True)
    permits_local = StreamField([
        ("permit", blocks.StructBlock([
            ("title", blocks.CharBlock()),
            ("text", blocks.RichTextBlock()),
        ])),
    ], use_json_field=True, blank=True)
    starting_price_local = models.CharField(max_length=80, blank=True)
    cta_local = models.CharField(max_length=120, blank=True)
    hero_media = models.ForeignKey(get_image_model_string(), null=True, blank=True, on_delete=models.SET_NULL, related_name="+")
    schema_overrides = models.JSONField(default=dict, blank=True)

    panels = [
        MultiFieldPanel([
            FieldPanel("service"),
            FieldPanel("geoarea"),
            FieldPanel("status"),
        ], heading="Target"),
        FieldPanel("unique_intro"),
        FieldPanel("pain_points_local"),
        FieldPanel("process_steps_local"),
        FieldPanel("permits_local"),
        MultiFieldPanel([
            FieldPanel("starting_price_local"),
            FieldPanel("cta_local"),
            FieldPanel("hero_media"),
        ], heading="Presentation"),
        FieldPanel("schema_overrides"),
    ]

    class Meta:
        unique_together = ("service", "geoarea")
        indexes = [
            models.Index(fields=["service", "geoarea"]),
        ]

    def __str__(self):
        return f"{self.service.title} in {self.geoarea.name}"

    # Quality gate: words >= 700, modules >= 6, images >= 6
    def passes_quality_minimum(self) -> bool:
        word_count = 0
        modules = 0
        images = 0

        def count_richtext(rt: str):
            import re
            text = re.sub(r"<[^>]+>", " ", rt or "")
            return len([w for w in text.split() if w])

        word_count += count_richtext(self.unique_intro or "")
        for stream in (self.pain_points_local, self.process_steps_local, self.permits_local):
            try:
                for blk in stream:
                    modules += 1
                    val = blk.value
                    if isinstance(val, dict):
                        text = val.get("text") or ""
                        if hasattr(text, "source"):
                            text = text.source
                        word_count += count_richtext(str(text))
            except Exception:
                pass
        if self.hero_media:
            images += 1
        # heuristic images in streams: count occurrences of <img in rich text
        import re
        for stream in (self.pain_points_local, self.process_steps_local, self.permits_local):
            try:
                for blk in stream:
                    val = blk.value
                    if isinstance(val, dict):
                        text = str(val.get("text") or "")
                        images += len(re.findall(r"<img ", text))
            except Exception:
                pass

        base_ok = (word_count >= 700) and (modules >= 6) and (images >= 6)
        try:
            from .models import Testimonial  # avoid cycle at import time
            has_local_testimonial = Testimonial.objects.filter(geoarea=self.geoarea).exists()
        except Exception:
            has_local_testimonial = False
        return base_ok and has_local_testimonial
