from django.urls import path, include

urlpatterns = [
    path("", include("website.api")),  # expose DRF router at /api/
]
