from django.db import models

from shared.models import BaseModel

# Create your models here.


class Banner(BaseModel):
    class PositionType(models.TextChoices):
        HERO_SLIDER = "HERO_SLIDER", "Hero Slider"
        SIDEBAR_AD = "SIDEBAR_AD", "Sidebar Ad"
        FOOTER = "FOOTER", "Footer"

    title = models.CharField(max_length=100, null=True, blank=True)
    image_url = models.URLField()
    mobile_image_url = models.URLField(null=True, blank=True)
    link_url = models.URLField()
    position_type = models.CharField(max_length=20, choices=PositionType.choices)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    sort_order = models.PositiveIntegerField()

    class Meta(BaseModel.Meta):
        ordering = ["-created_at"]


class StorefrontSetting(BaseModel):
    key = models.CharField(
        max_length=50, unique=True
    )  # site_title, support_phone, tax_rate, shipping_threshold
    value = models.TextField()
    type = models.CharField(max_length=20)  # string, boolean, number, json
    description = models.TextField()
