from django.db import models
from wagtail.fields import RichTextField
from wagtail.admin.panels import FieldPanel

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

# Removed legacy Project pages from this app to avoid duplication; use website.ProjectPage

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
