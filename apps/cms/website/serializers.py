from rest_framework import serializers
from wagtail.images import get_image_model
from .models import Service, Project, MediaAsset, Testimonial, ServiceArea, Lead
from website.models import SiteSettings

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

    @staticmethod
    def from_site(site):
        s = SiteSettings.for_site(site)
        return {
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
        }
