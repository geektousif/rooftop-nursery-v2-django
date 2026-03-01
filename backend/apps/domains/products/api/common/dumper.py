from datetime import date, datetime
from decimal import Decimal

from django.db.models import Model
from django.db.models.query import QuerySet


def dump(obj):
    if obj is None:
        return None

    if isinstance(obj, QuerySet):
        return [dump(o) for o in obj]

    if isinstance(obj, (list, tuple, set)):
        return [dump(o) for o in obj]

    if isinstance(obj, Model):
        data = {}

        # model fields
        for field in obj._meta.fields:
            value = getattr(obj, field.name)
            data[field.name] = dump(value)

        # prefetched & custom attributes
        for attr in dir(obj):
            if attr.startswith("_"):
                continue
            if attr in data:
                continue

            try:
                value = getattr(obj, attr)
            except Exception:
                continue

            # reverse relations & to_attr
            if isinstance(value, (QuerySet, list)):
                data[attr] = dump(value)

        return data

    if isinstance(obj, (datetime, date)):
        return obj.isoformat()

    if isinstance(obj, Decimal):
        return float(obj)

    return obj
