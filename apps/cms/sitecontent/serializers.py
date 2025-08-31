from rest_framework import serializers
from .models import Theme, Service, Testimonial, ProjectPage


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


class ProjectImageSerializer(serializers.Serializer):
    src = serializers.CharField()
    width = serializers.IntegerField()
    height = serializers.IntegerField()
    alt = serializers.CharField(required=False, allow_blank=True)


class ProjectPageSerializer(serializers.ModelSerializer):
    images = serializers.SerializerMethodField()

    class Meta:
        model = ProjectPage
        fields = [
            "id",
            "title",
            "slug",
            "city",
            "date",
            "images",
            "url",
        ]

    def get_images(self, obj: ProjectPage):
        request = self.context.get("request")
        base = f"{request.scheme}://{request.get_host()}" if request else ""
        items = []
        try:
            for block in obj.gallery:
                if block.block_type == "image" and block.value:
                    img = block.value
                    try:
                        # Generate a sensible rendition for thumbnails/lightbox preview
                        rendition = img.get_rendition("width-1200|format-webp")
                        src = base + rendition.url
                        width = rendition.width
                        height = rendition.height
                    except Exception:
                        # Fallback to original
                        src = base + (img.file.url if hasattr(img, "file") else "")
                        width = getattr(img, "width", 1200) or 1200
                        height = getattr(img, "height", 800) or 800

                    items.append({
                        "src": src,
                        "width": width,
                        "height": height,
                        "alt": obj.title,
                    })
        except Exception:
            pass
        return items