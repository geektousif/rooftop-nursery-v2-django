from apps.categories.urls.common import get_common_urls

from ..views import AdminTreeAPI, CategoryTreeNodeAPIView

tree_api = AdminTreeAPI(base_view=CategoryTreeNodeAPIView, base_url="")
urlpatterns = get_common_urls(tree_api)  # This will generate protected URLs
