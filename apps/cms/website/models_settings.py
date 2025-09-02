from django.db import models
from wagtail.contrib.settings.models import BaseSiteSetting, register_setting


@register_setting
class LocalSEOSettings(BaseSiteSetting):
    local_seo_enabled = models.BooleanField(default=False)
    primary_city_slug = models.SlugField(max_length=140, blank=True)
    gbp_url = models.URLField(blank=True)
    service_radius_km = models.IntegerField(default=0)
    default_utm_source = models.CharField(max_length=80, blank=True)
    default_utm_campaign = models.CharField(max_length=80, blank=True)
