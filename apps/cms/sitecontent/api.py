from rest_framework.routers import DefaultRouter
from django.urls import path
from website.views import themes_alias


router = DefaultRouter()

urlpatterns = [
    path("themes/", themes_alias, name="themes"),
]