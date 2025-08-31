from rest_framework.routers import DefaultRouter
from rest_framework.viewsets import ReadOnlyModelViewSet
from .models import Theme, Service, Testimonial, ProjectPage
from .serializers import ThemeSerializer, ServiceSerializer, TestimonialSerializer, ProjectPageSerializer


class ThemeViewSet(ReadOnlyModelViewSet):
    serializer_class = ThemeSerializer

    def get_queryset(self):
        # Return most recently updated theme(s) first so the frontend picks the latest change
        return Theme.objects.all().order_by("-updated_at", "name")


class ServiceViewSet(ReadOnlyModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer


class TestimonialViewSet(ReadOnlyModelViewSet):
    queryset = Testimonial.objects.all()
    serializer_class = TestimonialSerializer


class ProjectViewSet(ReadOnlyModelViewSet):
    queryset = ProjectPage.objects.none()
    serializer_class = ProjectPageSerializer

    def get_queryset(self):
        return ProjectPage.objects.live().public()

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx


router = DefaultRouter()
router.register(r"themes", ThemeViewSet, basename="themes")
router.register(r"services", ServiceViewSet, basename="services")
router.register(r"testimonials", TestimonialViewSet, basename="testimonials")
router.register(r"projects", ProjectViewSet, basename="projects")

urlpatterns = router.urls