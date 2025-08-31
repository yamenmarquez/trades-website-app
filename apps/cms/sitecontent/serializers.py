from rest_framework import serializers
from .models import Theme, Service, Testimonial


class ThemeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Theme
        fields = [
            "id",
            "name",
            "brand_color",
            "accent",
            "neutral",
            "font_heading",
            "font_body",
            "radius",
            "layout_variant",
        ]


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ["id", "name", "slug", "description", "icon"]


class TestimonialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimonial
        fields = ["id", "name", "rating", "text", "source"]


## Removed ProjectPage serializers from this app; website app exposes Projects via Pages.