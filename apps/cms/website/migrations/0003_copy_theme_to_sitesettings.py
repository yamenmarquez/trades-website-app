from django.db import migrations


def copy_theme_to_sitesettings(apps, schema_editor):
    try:
        Site = apps.get_model('wagtailcore', 'Site')
    except LookupError:
        return
    try:
        SiteSettings = apps.get_model('website', 'SiteSettings')
    except LookupError:
        return
    # Theme may have been defined in sitecontent app previously
    Theme = None
    for app_label in ('website', 'sitecontent'):
        try:
            Theme = apps.get_model(app_label, 'Theme')
            break
        except LookupError:
            continue
    if not Theme:
        return

    site = Site.objects.first()
    if not site:
        return
    try:
        s = SiteSettings.for_site(site)
    except Exception:
        # If settings table not ready, skip
        return
    t = Theme.objects.first()
    if not t:
        return
    for f in ['primary', 'accent', 'neutral', 'radius', 'font_body', 'font_heading', 'layout_variant']:
        if hasattr(t, f) and hasattr(s, f):
            setattr(s, f, getattr(t, f))
    s.save()


class Migration(migrations.Migration):
    dependencies = [
    ('website', '0002_portfolioindexpage_servicesindexpage_projectpage_and_more'),
    ]

    operations = [
        migrations.RunPython(copy_theme_to_sitesettings, migrations.RunPython.noop)
    ]
