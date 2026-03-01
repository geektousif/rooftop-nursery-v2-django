from ..views import CategoryTreeNodeAPIView, PublicTreeAPI
from .common import get_common_urls

CategoryTreeView = PublicTreeAPI(base_view=CategoryTreeNodeAPIView, base_url="api/v1")

urlpatterns = get_common_urls(CategoryTreeView)
