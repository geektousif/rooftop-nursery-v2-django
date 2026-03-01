"""
Manually created schema for categories app. This is used to generate OpenAPI schema for the app.
"""

from drf_spectacular.utils import extend_schema
from rest_framework.decorators import api_view

from apps.categories.serializers import CategorySchemaSerializer


def category_schema(summary, many=False):
    return extend_schema(
        summary=summary,
        tags=["Categories"],
        responses={
            200: CategorySchemaSerializer(many=many),
            404: None,
        },
    )


def schema_view(methods=None, **schema_kwargs):
    """
    If methods is None, allow all common methods.
    """
    if methods is None:
        methods = ["GET", "POST", "PUT", "PATCH", "DELETE"]

    def decorator(view):
        drf_view = api_view(methods)(view)
        return extend_schema(**schema_kwargs)(drf_view)

    return decorator
