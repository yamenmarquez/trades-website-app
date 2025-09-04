from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ServiceViewSet,
    ProjectViewSet,
    TestimonialViewSet,
    ServiceAreaViewSet,
    LeadViewSet,
    ConfigViewSet,
    config_view,
)

# Optional local SEO viewsets
try:  # pragma: no cover
    from .views import GeoAreaViewSet, ServiceCoverageViewSet
    HAS_LOCAL = True
except Exception:  # pragma: no cover
    GeoAreaViewSet = None  # type: ignore
    ServiceCoverageViewSet = None  # type: ignore
    HAS_LOCAL = False



router = DefaultRouter()
router.register(r"services", ServiceViewSet, basename="services")
router.register(r"projects", ProjectViewSet, basename="projects")
router.register(r"testimonials", TestimonialViewSet, basename="testimonials")
router.register(r"areas", ServiceAreaViewSet, basename="areas")
router.register(r"leads", LeadViewSet, basename="leads")
router.register(r"config", ConfigViewSet, basename="config")
if HAS_LOCAL and GeoAreaViewSet is not None:
    router.register(r"geoareas", GeoAreaViewSet, basename="geoareas")
if HAS_LOCAL and ServiceCoverageViewSet is not None:
    router.register(r"coverage", ServiceCoverageViewSet, basename="coverage")


urlpatterns = [
    path("", include(router.urls)),
]

# Add coverage detail endpoint if ServiceCoverage exists
if HAS_LOCAL:
    from .views import coverage_detail
    urlpatterns.append(
        path("coverage/<str:service>/<str:city>/", coverage_detail, name="coverage-detail")
    )
