from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('website', '0004_geoarea_projectpage_geoareas_servicecoverage'),
    ]

    operations = [
        migrations.AddField(
            model_name='testimonial',
            name='geoarea',
            field=models.ForeignKey(blank=True, null=True, on_delete=models.deletion.SET_NULL, related_name='testimonials', to='website.geoarea'),
        ),
    ]
