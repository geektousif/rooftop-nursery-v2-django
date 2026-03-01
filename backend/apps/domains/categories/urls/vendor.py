from ..views import CategoryTreeNodeAPIView, VendorTreeAPI
from .common import get_common_urls

CategoryTreeView = VendorTreeAPI(base_view=CategoryTreeNodeAPIView, base_url="api/v1/vendor")

urlpatterns = get_common_urls(CategoryTreeView)
