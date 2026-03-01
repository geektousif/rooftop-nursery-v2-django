from django.db import models

from shared.models import BaseModel


# Create your models here.
class WebhookEvents(BaseModel):
    event_type = models.CharField(max_length=255)
    payload = models.JSONField()
    processed = models.BooleanField(default=False)
    processing_error = models.TextField(null=True, blank=True)
