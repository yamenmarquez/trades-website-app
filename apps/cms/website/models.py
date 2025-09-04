from django.db import models
from django.utils.text import slugify
from django.core.validators import MinValueValidator, MaxValueValidator
from modelcluster.fields import ParentalKey
from modelcluster.models import ClusterableModel
from taggit.models import TaggedItemBase
from taggit.managers import TaggableManager
from wagtail.models import Page
from wagtail.fields import RichTextField, StreamField
from wagtail.admin.panels import FieldPanel, MultiFieldPanel, FieldRowPanel
from wagtail import blocks
from wagtail.images.blocks import ImageChooserBlock
from wagtail.images import get_image_model_string
from wagtail.snippets.models import register_snippet
from wagtail.contrib.settings.models import BaseSiteSetting, register_setting


# ---------- MediaAsset ----------
@register_snippet
class MediaAsset(models.Model):
    image = models.ForeignKey(get_image_model_string(), on_delete=models.CASCADE, related_name='+')
    alt = models.CharField(max_length=255)

    def __str__(self):
        return self.alt or f'Asset {self.pk}'

    panels = [
        FieldPanel('image'),
        FieldPanel('alt'),
    ]


# ---------- Service (legacy model; no longer registered as snippet) ----------
class Service(models.Model):
    name = models.CharField(max_length=120, unique=True)
    slug = models.SlugField(max_length=140, unique=True, blank=True)
    description = RichTextField(features=['bold', 'italic', 'link', 'ol', 'ul'])
    hero = models.ForeignKey(get_image_model_string(), on_delete=models.SET_NULL, null=True, blank=True, related_name='+')
    tags = TaggableManager(blank=True)

    panels = [
        FieldPanel('name'),
        FieldPanel('slug'),
        FieldPanel('description'),
        FieldPanel('hero'),
        FieldPanel('tags'),
    ]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


# ---------- ServiceArea (snippet) ----------
@register_snippet
class ServiceArea(models.Model):
    name = models.CharField(max_length=120, unique=True)
    slug = models.SlugField(max_length=140, unique=True, blank=True)
    city = models.CharField(max_length=120, blank=True)
    state = models.CharField(max_length=80, blank=True)
    zip_code = models.CharField(max_length=20, blank=True)
    
    # 🔗 NUEVO: enlace opcional a la GeoArea "real" para SEO
    geo = models.ForeignKey(
        'website.GeoArea', null=True, blank=True, on_delete=models.SET_NULL,
        related_name="service_areas",
        help_text="Link to the real SEO geo area for service coverage"
    )

    panels = [
        FieldPanel('name'),
        FieldPanel('slug'),
        FieldPanel('city'),
        FieldPanel('state'),
        FieldPanel('zip_code'),
        # 🔗 NUEVO: permite seleccionar la ciudad SEO real
        FieldPanel('geo'),
    ]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


# ---------- Testimonial (snippet) ----------
@register_snippet
class Testimonial(models.Model):
    name = models.CharField(max_length=120)
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    source = models.CharField(max_length=120, blank=True)
    quote = models.TextField()
    date = models.DateField(null=True, blank=True)
    # Optional local SEO anchor
    geoarea = models.ForeignKey('website.GeoArea', null=True, blank=True, on_delete=models.SET_NULL, related_name='testimonials')

    panels = [
        FieldPanel('name'),
        FieldPanel('rating'),
        FieldPanel('source'),
        FieldPanel('quote'),
        FieldPanel('date'),
    FieldPanel('geoarea'),
    ]

    def __str__(self):
        return f'{self.name} ({self.rating}★)'

    class Meta:
        indexes = [
            models.Index(fields=['geoarea']),
        ]

    @property
    def short_quote(self):
        return (self.quote[:80] + '…') if len(self.quote) > 80 else self.quote

    # Wagtail Snippet admin options
    @classmethod
    def get_admin_display_title(cls):  # optional nicer header
        return 'Testimonials'

    @property
    def admin_display_title(self):
        return f"{self.name} ({self.rating}★) - {getattr(self.geoarea, 'name', '—')}"


# ---------- Project (legacy snippet) ----------
class ProjectTag(TaggedItemBase):
    content_object = ParentalKey('Project', related_name='tagged_items', on_delete=models.CASCADE)


class Project(ClusterableModel):
    """Legacy snippet used for migration only. Keep registered to avoid data loss
    in existing DBs until migration runs. Do not surface duplicates elsewhere.
    """
    title = models.CharField(max_length=160)
    slug = models.SlugField(max_length=180, unique=True, blank=True)
    services = models.ManyToManyField('website.Service', related_name='projects', blank=True)
    city = models.CharField(max_length=120, blank=True)
    gallery = models.ManyToManyField('website.MediaAsset', related_name='projects', blank=True)
    before_image = models.ForeignKey(get_image_model_string(), on_delete=models.SET_NULL, null=True, blank=True, related_name='+')
    after_image = models.ForeignKey(get_image_model_string(), on_delete=models.SET_NULL, null=True, blank=True, related_name='+')
    published = models.BooleanField(default=True)
    tags = TaggableManager(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    panels = [
        FieldPanel('title'),
        FieldPanel('slug'),
        FieldPanel('services'),
        FieldPanel('city'),
        FieldPanel('gallery'),
        FieldPanel('before_image'),
        FieldPanel('after_image'),
        FieldPanel('published'),
        FieldPanel('tags'),
    ]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


# ---------- Blog Pages ----------
class BlogIndexPage(Page):
    intro = RichTextField(blank=True)

    content_panels = Page.content_panels + [
        FieldPanel('intro'),
    ]


class BlogPage(Page):
    excerpt = models.CharField(max_length=240, blank=True)
    header_image = models.ForeignKey(get_image_model_string(), on_delete=models.SET_NULL, null=True, blank=True, related_name='+')
    body = StreamField([
        ('heading', blocks.CharBlock(classname='full title')),
        ('paragraph', blocks.RichTextBlock(features=['bold', 'italic', 'link', 'ol', 'ul', 'h2', 'h3', 'hr'])),
        ('image', ImageChooserBlock()),
    ], use_json_field=True, blank=True)

    content_panels = Page.content_panels + [
        FieldPanel('excerpt'),
        FieldPanel('header_image'),
        FieldPanel('body'),
    ]


# ---------- Generic Home with blocks ----------
class HomePage(Page):
    body = StreamField([
        ('hero', blocks.StructBlock([
            ('heading', blocks.CharBlock()),
            ('subheading', blocks.TextBlock(required=False)),
            ('cta_label', blocks.CharBlock(required=False)),
            ('cta_href', blocks.CharBlock(required=False)),
            ('image', ImageChooserBlock(required=False)),
        ])),
        ('services', blocks.ListBlock(blocks.StructBlock([
            ('title', blocks.CharBlock()),
            ('description', blocks.TextBlock(required=False)),
            ('icon', ImageChooserBlock(required=False)),
        ]))),
        ('reviews', blocks.ListBlock(blocks.StructBlock([
            ('name', blocks.CharBlock()),
            ('rating', blocks.IntegerBlock(min_value=1, max_value=5)),
            ('quote', blocks.TextBlock()),
        ]))),
        ('gallery', blocks.ListBlock(ImageChooserBlock())),
        ('cta', blocks.StructBlock([
            ('heading', blocks.CharBlock()),
            ('subheading', blocks.TextBlock(required=False)),
            ('cta_label', blocks.CharBlock()),
            ('cta_href', blocks.CharBlock()),
        ])),
    ], use_json_field=True, blank=True)

    content_panels = Page.content_panels + [
        FieldPanel('body'),
    ]


# ---------- Site Settings (Theme/Config) ----------
@register_setting
class SiteSettings(BaseSiteSetting):
    # Theme tokens
    primary = models.CharField(max_length=7, default='#1a73e8')   # hex
    accent = models.CharField(max_length=7, default='#ef4444')
    neutral = models.CharField(max_length=7, default='#111827')
    radius = models.CharField(max_length=10, default='14px')
    font_body = models.CharField(max_length=80, default='Inter, ui-sans-serif, system-ui')
    font_heading = models.CharField(max_length=80, default='Poppins, ui-sans-serif, system-ui')
    layout_variant = models.CharField(max_length=40, default='modern-pro')

    # Contact
    phone = models.CharField(max_length=40, blank=True)
    whatsapp = models.CharField(max_length=80, blank=True)
    email = models.EmailField(blank=True)
    address = models.CharField(max_length=240, blank=True)

    panels = [
        MultiFieldPanel([
            FieldRowPanel([FieldPanel('primary'), FieldPanel('accent'), FieldPanel('neutral')]),
            FieldRowPanel([FieldPanel('radius'), FieldPanel('layout_variant')]),
            FieldRowPanel([FieldPanel('font_body'), FieldPanel('font_heading')]),
        ], heading='Theme'),
        MultiFieldPanel([
            FieldPanel('phone'),
            FieldPanel('whatsapp'),
            FieldPanel('email'),
            FieldPanel('address'),
        ], heading='Contact'),
    ]


# ---------- Leads ----------
class Lead(models.Model):
    name = models.CharField(max_length=120)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=40, blank=True)
    message = models.TextField(blank=True)
    source_path = models.CharField(max_length=240, blank=True)
    utm = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.name} - {self.email or self.phone or "lead"}'


# Import additional Page models so Django registers them; avoid circular imports by
# importing at the end of the module in a try/except and ignoring lint.
try:  # noqa: E402
    from . import models_pages  # type: ignore  # noqa: F401,E402
except Exception:  # pragma: no cover
    # During initial migrations this import may fail; it's safe to ignore.
    pass
