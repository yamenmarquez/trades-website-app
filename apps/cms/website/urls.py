from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ServiceViewSet, ProjectViewSet, TestimonialViewSet,
    ServiceAreaViewSet, LeadViewSet, config_view, themes_alias
)

router = DefaultRouter()
router.register('services', ServiceViewSet, basename='services')
router.register('projects', ProjectViewSet, basename='projects')
router.register('testimonials', TestimonialViewSet, basename='testimonials')
router.register('areas', ServiceAreaViewSet, basename='areas')
router.register('leads', LeadViewSet, basename='leads')

urlpatterns = [
    path('', include(router.urls)),
    path('config/', config_view, name='config'),
    path('themes/', themes_alias, name='themes'),
]
