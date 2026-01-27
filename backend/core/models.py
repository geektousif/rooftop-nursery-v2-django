import uuid

from django.db import models
from django_softdelete.models import SoftDeleteModel


class UUIDv7(models.Func):
    function = "uuidv7"
    output_field = models.UUIDField()  # type: ignore


class UUIDModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid7, editable=False)

    class Meta:
        abstract = True


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class BaseModel(UUIDModel, TimeStampedModel, SoftDeleteModel):
    class Meta:  # type: ignore
        abstract = True
