from rest_framework import viewsets, mixins, permissions, throttling
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from wagtail.models import Site as WagtailSite
from .models import Service, Project, Testimonial, ServiceArea, Lead
from .serializers import (
    ServiceSerializer, ProjectSerializer, TestimonialSerializer,
    ServiceAreaSerializer, LeadSerializer, ConfigSerializer
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
    queryset = Service.objects.all().order_by('name')
    serializer_class = ServiceSerializer
    permission_classes = [PublicReadOnly]


class ProjectViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Project.objects.filter(published=True).order_by('-created_at')
    serializer_class = ProjectSerializer
    permission_classes = [PublicReadOnly]
    lookup_field = 'slug'


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
