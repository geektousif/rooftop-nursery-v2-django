import logging

from django.forms import model_to_dict
from django.http import HttpResponseNotFound, JsonResponse
from treenode.views.autoapi import AutoTreeAPI
from treenode.views.crud import TreeNodeBaseAPIView

from core.constants import UserRoles

from .models import Category
from .services import inject_dispatch_auth, treenode_auth_required

logger = logging.getLogger(__name__)


class CategoryTreeNodeAPIView(TreeNodeBaseAPIView):
    schema = None
    model = Category
    http_method_names = ["get", "post", "put", "patch", "delete", "head", "options"]

    def dispatch(self, request, *args, **kwargs):
        logger.info("=== CategoryTreeNodeAPIView.dispatch ===")
        logger.info(f"Body: {request.body}")
        logger.info(f"Args: {args}")
        logger.info(f"Kwargs: {kwargs}")
        logger.info(f"http_method_names: {self.http_method_names}")
        logger.info(f"Has post attr: {hasattr(self, 'post')}")
        logger.info(f"Post callable: {callable(getattr(self, 'post', None))}")

        result = super().dispatch(request, *args, **kwargs)
        logger.info(f"Dispatch result: {result}")
        return result

    def get(self, request, pk=None):
        if self.action == "detail":
            try:
                obj = self.get_queryset().get(pk=pk)
                return JsonResponse(model_to_dict(obj))
            except self.model.DoesNotExist:
                return HttpResponseNotFound("Node not found.")

        if self.action == "list":
            nodes = self.get_queryset().order_by("_path")

            # data = [model_to_dict(obj) for obj in nodes]
            data = list(nodes.values())

            return JsonResponse(data, safe=False)

        return super().get(request, pk)

    def post(self, request):
        logger.info("POST method called!")
        return super().post(request)


class PublicTreeAPI(AutoTreeAPI):
    def protect_view(self, view, model):
        logger.info("open view")
        return inject_dispatch_auth(
            view,
            treenode_auth_required(read_only_public=True),
        )


class VendorTreeAPI(AutoTreeAPI):
    def protect_view(self, view, model):
        return inject_dispatch_auth(
            view,
            treenode_auth_required(allow_roles={UserRoles.VENDOR, UserRoles.ADMIN}),
        )


class AdminTreeAPI(AutoTreeAPI):
    def protect_view(self, view, model):
        logger.info("protecting view")
        return inject_dispatch_auth(
            view,
            treenode_auth_required(admin_only_write=True, allow_roles={UserRoles.ADMIN}),
        )
