from ..views import AdminTreeAPI, CategoryTreeNodeAPIView
from .common import get_common_urls

CategoryTreeView = AdminTreeAPI(base_view=CategoryTreeNodeAPIView, base_url="api/v1/admin")

urlpatterns = get_common_urls(CategoryTreeView)
