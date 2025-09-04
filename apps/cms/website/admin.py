from django.contrib import admin
from wagtail.snippets.models import register_snippet
from .models import Lead


@register_snippet
class LeadAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'phone', 'created_at']
    list_filter = ['created_at']
    search_fields = ['name', 'email', 'phone']
    readonly_fields = ['created_at']
    
    def has_add_permission(self, request):
        # Don't allow adding leads through admin - they come from forms
        return False