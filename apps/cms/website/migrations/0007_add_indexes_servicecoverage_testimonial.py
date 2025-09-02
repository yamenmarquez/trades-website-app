from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("website", "0006_localseosettings"),
    ]

    operations = [
        migrations.AddIndex(
            model_name="servicecoverage",
            index=models.Index(fields=["service", "geoarea"], name="svc_geo_idx"),
        ),
        migrations.AddIndex(
            model_name="testimonial",
            index=models.Index(fields=["geoarea"], name="testimonial_geo_idx"),
        ),
    ]
