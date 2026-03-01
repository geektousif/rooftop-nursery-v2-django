from apps.categories.urls.common import get_common_urls

from ..views import CategoryTreeNodeAPIView, VendorTreeAPI

tree_api = VendorTreeAPI(base_view=CategoryTreeNodeAPIView, base_url="")
urlpatterns = get_common_urls(tree_api)  # This will generate protected URLs
