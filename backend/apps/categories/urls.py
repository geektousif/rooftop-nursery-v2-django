from django.urls import path

from .views import CategoryTreeNodeAPIView, PublicTreeAPI

CategoryTreeView = PublicTreeAPI(base_view=CategoryTreeNodeAPIView, base_url="api/v1")

urlpatterns = [
    path("", CategoryTreeView.base_view.as_view(), {"action": "list"}, "category-list"),
    path(
        "<uuid:pk>/", CategoryTreeView.base_view.as_view(), {"action": "detail"}, "category-detail"
    ),
    path("tree/", CategoryTreeView.base_view.as_view(), {"action": "tree"}, "category-tree"),
    path(
        "<uuid:pk>/children/",
        CategoryTreeView.base_view.as_view(),
        {"action": "children"},
        "category-children",
    ),  # noqa: D501
    # All descendants
    path(
        "<uuid:pk>/descendants/",
        CategoryTreeView.base_view.as_view(),
        {"action": "descendants"},
        "category-descendants",
    ),  # noqa: D501
    # Ancestors + Self + Descendants
    path(
        "<uuid:pk>/family/",
        CategoryTreeView.base_view.as_view(),
        {"action": "family"},
        "category-family",
    ),  # noqa: D501
]
