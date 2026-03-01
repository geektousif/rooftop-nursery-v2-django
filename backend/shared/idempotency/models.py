from django.db import models


class IdempotencyKey(models.Model):
    key = models.CharField(max_length=255, unique=True)
    response_hash = models.CharField(max_length=64)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["key"]),
        ]
