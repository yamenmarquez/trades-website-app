from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ServiceViewSet, ProjectViewSet, TestimonialViewSet,
    ServiceAreaViewSet, LeadViewSet, config_view, themes_alias
)
try:
    from .views import GeoAreaViewSet, ServiceCoverageViewSet, coverage_detail
    HAS_LOCAL = True
except Exception:
    HAS_LOCAL = False

router = DefaultRouter()
router.register('services', ServiceViewSet, basename='services')
router.register('projects', ProjectViewSet, basename='projects')
router.register('testimonials', TestimonialViewSet, basename='testimonials')
router.register('areas', ServiceAreaViewSet, basename='areas')
router.register('leads', LeadViewSet, basename='leads')
if HAS_LOCAL:
    router.register('geoareas', GeoAreaViewSet, basename='geoareas')
    router.register('coverage', ServiceCoverageViewSet, basename='coverage')

urlpatterns = [
    path('', include(router.urls)),
    path('config/', config_view, name='config'),
    path('themes/', themes_alias, name='themes'),
    *([path('coverage/<slug:service>/<slug:city>/', coverage_detail, name='coverage-detail')] if HAS_LOCAL else []),
]
