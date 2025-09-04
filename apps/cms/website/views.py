from rest_framework import viewsets, mixins, permissions, throttling
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from wagtail.models import Site as WagtailSite
from .models import Testimonial, ServiceArea, Lead
from .models_pages import ServicePage, ProjectPage
try:
    from .models_local import GeoArea, ServiceCoverage
except Exception:  # pragma: no cover
    GeoArea = None  # type: ignore
    ServiceCoverage = None  # type: ignore
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

    def get_queryset(self):
        qs = super().get_queryset()
        service = self.request.query_params.get('service')
        city = self.request.query_params.get('city')
        if service:
            qs = qs.filter(services__name__iexact=service) | qs.filter(services__name__icontains=service)
        if city and GeoArea is not None:
            qs = qs.filter(geoareas__slug=city) | qs.filter(city__iexact=city)
        return qs.distinct()


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


class ConfigViewSet(viewsets.ViewSet):
    """
    Site configuration including theme colors, contact info, etc.
    """
    permission_classes = [PublicReadOnly]
    
    def list(self, request):
        site = WagtailSite.find_for_request(request) or WagtailSite.objects.first()
        data = ConfigSerializer.from_site(site)
        return Response(data)

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


# ---- Local SEO Endpoints ----
if GeoArea is not None:
    class GeoAreaViewSet(viewsets.ReadOnlyModelViewSet):
        queryset = GeoArea.objects.all().order_by('name')
        serializer_class = __import__('website.serializers', fromlist=['GeoAreaSerializer']).GeoAreaSerializer
        permission_classes = [PublicReadOnly]
        lookup_field = 'slug'

        def get_queryset(self):
            qs = super().get_queryset()
            t = self.request.query_params.get('type')
            parent = self.request.query_params.get('parent')
            if t:
                qs = qs.filter(type=t)
            if parent:
                qs = qs.filter(parent_city__slug=parent)
            return qs

if ServiceCoverage is not None:
    class ServiceCoverageViewSet(viewsets.ReadOnlyModelViewSet):
        queryset = ServiceCoverage.objects.select_related('service', 'geoarea').all()
        serializer_class = __import__('website.serializers', fromlist=['ServiceCoverageSerializer']).ServiceCoverageSerializer
        permission_classes = [PublicReadOnly]
        lookup_field = 'id'

        def get_queryset(self):
            qs = super().get_queryset()
            service = self.request.query_params.get('service')
            city = self.request.query_params.get('city')
            ready = self.request.query_params.get('ready')
            if service:
                qs = qs.filter(service__slug=service)
            if city:
                qs = qs.filter(geoarea__slug=city)
            if ready in ('1', 'true', 'True'):
                ids = [c.id for c in qs if c.status == 'ready' and c.passes_quality_minimum()]
                qs = qs.filter(id__in=ids)
            return qs

    @api_view(['GET'])
    @permission_classes([PublicReadOnly])
    def coverage_detail(request, service, city):
        try:
            c = ServiceCoverage.objects.select_related('service', 'geoarea').get(service__slug=service, geoarea__slug=city)
        except ServiceCoverage.DoesNotExist:  # type: ignore
            return Response({'detail': 'Not found'}, status=404)
        if not (c.status == 'ready' and c.passes_quality_minimum()):
            return Response({'detail': 'Not found'}, status=404)
        ser = __import__('website.serializers', fromlist=['ServiceCoverageSerializer']).ServiceCoverageSerializer(c, context={'request': request})
        return Response(ser.data)
