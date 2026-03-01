from django.db import models


class OutboxEvent(models.Model):
    event_type = models.CharField(max_length=255)
    payload = models.JSONField()
    processed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["processed"]),
        ]
