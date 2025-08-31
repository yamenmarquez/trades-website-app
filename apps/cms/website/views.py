from rest_framework import viewsets, mixins, permissions, throttling
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from wagtail.models import Site as WagtailSite
from .models import Testimonial, ServiceArea, Lead
from .models_pages import ServicePage, ProjectPage
from .serializers import (
    TestimonialSerializer,
    ServiceAreaSerializer,
    LeadSerializer,
    ConfigSerializer,
    ServicePageSerializer,
    ProjectPageSerializer,
)


class PublicReadOnly(permissions.AllowAny):
    def has_permission(self, request, view):
        return True


class LeadsThrottle(throttling.SimpleRateThrottle):
    scope = 'leads'

    def get_cache_key(self, request, view):
        ip = request.META.get('REMOTE_ADDR')
        return f'leads:{ip}'


class ServiceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ServicePage.objects.live().public().order_by('title')
    serializer_class = ServicePageSerializer
    permission_classes = [PublicReadOnly]
    lookup_field = 'slug'
    pagination_class = None

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx


class ProjectViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ProjectPage.objects.live().public().order_by('-first_published_at')
    serializer_class = ProjectPageSerializer
    permission_classes = [PublicReadOnly]
    lookup_field = 'slug'
    pagination_class = None

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx


class TestimonialViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Testimonial.objects.all().order_by('-date')
    serializer_class = TestimonialSerializer
    permission_classes = [PublicReadOnly]


class ServiceAreaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ServiceArea.objects.all().order_by('name')
    serializer_class = ServiceAreaSerializer
    permission_classes = [PublicReadOnly]
    lookup_field = 'slug'


class LeadViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    queryset = Lead.objects.all()
    serializer_class = LeadSerializer
    permission_classes = [PublicReadOnly]
    throttle_classes = [LeadsThrottle]


@api_view(['GET'])
@permission_classes([PublicReadOnly])
def config_view(request):
    site = WagtailSite.find_for_request(request) or WagtailSite.objects.first()
    data = ConfigSerializer.from_site(site)
    return Response(data)


@api_view(['GET'])
@permission_classes([PublicReadOnly])
def themes_alias(request):
    """Alias /api/themes/ to SiteSettings tokens for backward compatibility."""
    site = WagtailSite.find_for_request(request) or WagtailSite.objects.first()
    data = ConfigSerializer.from_site(site)
    return Response(data)
