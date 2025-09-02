from rest_framework import serializers
from wagtail.images import get_image_model
from .models import Service, Project, MediaAsset, Testimonial, ServiceArea, Lead
from .models_pages import ServicePage, ProjectPage
try:
    from .models_local import GeoArea, ServiceCoverage
except Exception:  # pragma: no cover
    GeoArea = None  # type: ignore
    ServiceCoverage = None  # type: ignore
from website.models import SiteSettings
try:
    from .models_settings import LocalSEOSettings
except Exception:  # pragma: no cover
    LocalSEOSettings = None  # type: ignore

Image = get_image_model()


def rendition_url_abs(request, image, spec='width-1200|format-webp'):
    try:
        r = image.get_rendition(spec)
        url = r.url
    except Exception:
        url = image.file.url
    if request is not None and not url.startswith('http'):
        return request.build_absolute_uri(url)
    return url


class MediaAssetSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = MediaAsset
        fields = ['id', 'alt', 'url']

    def get_url(self, obj):
        request = self.context.get('request')
        return rendition_url_abs(request, obj.image)


class ServiceSerializer(serializers.ModelSerializer):
    hero = serializers.SerializerMethodField()
    tags = serializers.SerializerMethodField()

    class Meta:
        model = Service
        fields = ['id', 'name', 'slug', 'description', 'hero', 'tags']

    def get_hero(self, obj):
        if not obj.hero:
            return None
        request = self.context.get('request')
        return rendition_url_abs(request, obj.hero)

    def get_tags(self, obj):
        try:
            return [t.name for t in obj.tags.all()]
        except Exception:
            return []


class ServicePageSerializer(serializers.ModelSerializer):
    # Keep legacy shape: name, slug, description, icon
    name = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()
    icon = serializers.SerializerMethodField()

    class Meta:
        model = ServicePage
        fields = ["id", "name", "slug", "description", "icon"]

    def get_name(self, obj):
        return obj.title

    def get_description(self, obj):
        # Use intro rich text as description string
        return getattr(obj, "intro", "") or ""

    def get_icon(self, obj):
        # No icon concept on page; keep null/None
        return None


class TestimonialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimonial
        fields = ['name', 'rating', 'source', 'quote', 'date']


class ServiceAreaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceArea
        fields = ['name', 'slug', 'city', 'state', 'zip_code']


class ProjectSerializer(serializers.ModelSerializer):
    services = ServiceSerializer(many=True, read_only=True)
    gallery = MediaAssetSerializer(many=True, read_only=True)
    before = serializers.SerializerMethodField()
    after = serializers.SerializerMethodField()
    tags = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = ['title', 'slug', 'services', 'city', 'gallery', 'before', 'after', 'tags', 'published', 'created_at']

    def get_before(self, obj):
        if not obj.before_image:
            return None
        request = self.context.get('request')
        return rendition_url_abs(request, obj.before_image)

    def get_after(self, obj):
        if not obj.after_image:
            return None
        request = self.context.get('request')
        return rendition_url_abs(request, obj.after_image)

    def get_tags(self, obj):
        try:
            return [t.name for t in obj.tags.all()]
        except Exception:
            return []


class ProjectPageSerializer(serializers.ModelSerializer):
    # Public shape compatible with requested schema
    images = serializers.SerializerMethodField()
    url = serializers.SerializerMethodField()

    class Meta:
        model = ProjectPage
        fields = ["id", "title", "slug", "city", "images", "url"]

    def get_url(self, obj):
        try:
            request = self.context.get("request")
            if request is None:
                return None
            return request.build_absolute_uri(obj.url)
        except Exception:
            return None

    def get_images(self, obj: ProjectPage):
        request = self.context.get("request")
        base = f"{request.scheme}://{request.get_host()}" if request else ""
        items = []
        try:
            for block in obj.gallery:
                if block.block_type == "image" and block.value:
                    img = block.value
                    try:
                        rendition = img.get_rendition("width-1200|format-webp")
                        url = base + rendition.url
                    except Exception:
                        url = base + (img.file.url if hasattr(img, "file") else "")

                    items.append({
                        "url": url,
                        "alt": obj.title,
                    })
        except Exception:
            pass
        return items


class LeadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lead
        fields = ['name', 'email', 'phone', 'message', 'source_path', 'utm']


class ConfigSerializer(serializers.Serializer):
    primary = serializers.CharField()
    accent = serializers.CharField()
    neutral = serializers.CharField()
    radius = serializers.CharField()
    font_body = serializers.CharField()
    font_heading = serializers.CharField()
    layout_variant = serializers.CharField()
    phone = serializers.CharField(allow_blank=True)
    whatsapp = serializers.CharField(allow_blank=True)
    email = serializers.EmailField(allow_blank=True)
    address = serializers.CharField(allow_blank=True)
    # Local SEO toggles
    local_seo_enabled = serializers.BooleanField(default=False)
    primary_city_slug = serializers.CharField(allow_blank=True, required=False)
    gbp_url = serializers.CharField(allow_blank=True, required=False)
    service_radius_km = serializers.IntegerField(required=False)
    default_utm_source = serializers.CharField(allow_blank=True, required=False)
    default_utm_campaign = serializers.CharField(allow_blank=True, required=False)

    @staticmethod
    def from_site(site):
        s = SiteSettings.for_site(site)
        data = {
            'primary': s.primary,
            'accent': s.accent,
            'neutral': s.neutral,
            'radius': s.radius,
            'font_body': s.font_body,
            'font_heading': s.font_heading,
            'layout_variant': s.layout_variant,
            'phone': s.phone,
            'whatsapp': s.whatsapp,
            'email': s.email,
            'address': s.address,
            'local_seo_enabled': False,
        }
        if LocalSEOSettings is not None:
            try:
                ls = LocalSEOSettings.for_site(site)
                data.update({
                    'local_seo_enabled': bool(getattr(ls, 'local_seo_enabled', False)),
                    'primary_city_slug': getattr(ls, 'primary_city_slug', ''),
                    'gbp_url': getattr(ls, 'gbp_url', ''),
                    'service_radius_km': getattr(ls, 'service_radius_km', 0),
                    'default_utm_source': getattr(ls, 'default_utm_source', ''),
                    'default_utm_campaign': getattr(ls, 'default_utm_campaign', ''),
                })
            except Exception:
                pass
        return data


# ---- Local SEO ----
if GeoArea is not None:
    class GeoAreaSerializer(serializers.ModelSerializer):
        parent_city_slug = serializers.SerializerMethodField()

        class Meta:
            model = GeoArea
            fields = ["id", "type", "name", "slug", "parent_city_slug", "center_lat", "center_lng"]

        def get_parent_city_slug(self, obj):
            return obj.parent_city.slug if obj.parent_city_id else None

if ServiceCoverage is not None:
    class ServiceCoverageSerializer(serializers.ModelSerializer):
        service = serializers.SerializerMethodField()
        geo = serializers.SerializerMethodField()
        hero_image = serializers.SerializerMethodField()
        ready = serializers.SerializerMethodField()
        reviews_summary = serializers.SerializerMethodField()

        class Meta:
            model = ServiceCoverage
            fields = [
                "id",
                "service",
                "geo",
                "status",
                "hero_image",
                "ready",
                "reviews_summary",
            ]

        def get_service(self, obj):
            return {"slug": obj.service.slug, "name": obj.service.title}

        def get_geo(self, obj):
            return {"slug": obj.geoarea.slug, "name": obj.geoarea.name, "type": obj.geoarea.type}

        def get_hero_image(self, obj):
            if not obj.hero_media:
                return None
            request = self.context.get("request")
            try:
                url = obj.hero_media.get_rendition("width-1200|format-webp").url
            except Exception:
                url = getattr(getattr(obj.hero_media, "file", None), "url", None)
            if request is not None and url and not url.startswith("http"):
                url = request.build_absolute_uri(url)
            return {"url": url, "alt": obj.service.title}

        def get_ready(self, obj):
            try:
                return obj.status == "ready" and obj.passes_quality_minimum()
            except Exception:
                return False

        def get_reviews_summary(self, obj):
            try:
                # Aggregate per geoarea; tie to service only if later model supports it
                from .models import Testimonial  # avoid import cycle at module load
                qs = Testimonial.objects.filter(geoarea=obj.geoarea).exclude(rating__isnull=True)
                count = qs.count()
                if count < 3:
                    return None
                # simple average
                total = 0
                for t in qs.values_list('rating', flat=True):
                    total += int(t or 0)
                avg = round(total / count, 2) if count else None
                return {"count": count, "avg": avg}
            except Exception:
                return None
