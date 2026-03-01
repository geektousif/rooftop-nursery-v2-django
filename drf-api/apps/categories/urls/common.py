from django.urls import path

from apps.categories.schema import schema_view


def get_common_urls(tree_api):
    base_view_instance = tree_api.base_view.as_view()
    protected_view = tree_api.protect_view(base_view_instance, tree_api.base_view.model)

    return [
        # List (GET) and Create (POST) - same URL!
        path(
            "",
            schema_view(summary="List/Create categories", tags=["Categories"])(protected_view),
            {"action": "list"},  # action is used by get() method
            name="category-list",
        ),
        # Retrieve (GET), Update (PUT/PATCH), Delete (DELETE) - same URL!
        path(
            "<uuid:pk>/",
            schema_view(
                summary="Retrieve/Update/Delete category",
                tags=["Categories"],
            )(protected_view),
            {"action": "detail"},
            name="category-detail",
        ),
        # Tree endpoint
        path(
            "tree/",
            schema_view(summary="Full category tree", tags=["Categories"])(protected_view),
            {"action": "tree"},
            name="category-tree",
        ),
        # Children endpoint
        path(
            "<uuid:pk>/children/",
            schema_view(summary="Category children", tags=["Categories"])(protected_view),
            {"action": "children"},
            name="category-children",
        ),
        # Descendants endpoint
        path(
            "<uuid:pk>/descendants/",
            schema_view(summary="Category descendants", tags=["Categories"])(protected_view),
            {"action": "descendants"},
            name="category-descendants",
        ),
        # Family endpoint
        path(
            "<uuid:pk>/family/",
            schema_view(summary="Category family", tags=["Categories"])(protected_view),
            {"action": "family"},
            name="category-family",
        ),
    ]
