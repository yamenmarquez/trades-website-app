from django.db import migrations


def drop_theme_model(apps, schema_editor):
    try:
        _ = apps.get_model('sitecontent', 'Theme')  # pragma: no cover
    except LookupError:
        return
    # If table exists, let DeleteModel handle it; here we noop.
    return


class Migration(migrations.Migration):
    dependencies = [
        ('sitecontent', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(drop_theme_model, migrations.RunPython.noop),
        migrations.DeleteModel(name='Theme'),
    ]
