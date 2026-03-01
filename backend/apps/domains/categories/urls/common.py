from django.urls import path


def get_common_urls(view):
    return [
        path("", view.base_view.as_view(), {"action": "list"}, "category-list"),
        path("<uuid:pk>/", view.base_view.as_view(), {"action": "detail"}, "category-detail"),
        path("tree/", view.base_view.as_view(), {"action": "tree"}, "category-tree"),
        path(
            "<uuid:pk>/children/",
            view.base_view.as_view(),
            {"action": "children"},
            "category-children",
        ),  # noqa: D501
        # All descendants
        path(
            "<uuid:pk>/descendants/",
            view.base_view.as_view(),
            {"action": "descendants"},
            "category-descendants",
        ),  # noqa: D501
        # Ancestors + Self + Descendants
        path(
            "<uuid:pk>/family/",
            view.base_view.as_view(),
            {"action": "family"},
            "category-family",
        ),  # noqa: D501
    ]
