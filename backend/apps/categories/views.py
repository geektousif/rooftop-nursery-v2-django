from django.forms import model_to_dict
from django.http import HttpResponseNotFound, JsonResponse
from treenode.views.autoapi import AutoTreeAPI
from treenode.views.crud import TreeNodeBaseAPIView

from apps.categories.models import Category
from core.treenode_auth_required import treenode_auth_required


class PublicTreeAPI(AutoTreeAPI):
    def protect_view(self, view, model):

        return treenode_auth_required(
            view,
            read_only_public=True,
        )


class VendorTreeAPI(AutoTreeAPI):
    def protect_view(self, view, model):
        return treenode_auth_required(
            view,
            allow_roles={"vendor"},
        )


class AdminTreeAPI(AutoTreeAPI):
    def protect_view(self, view, model):
        return treenode_auth_required(
            view,
            admin_only_write=True,
        )


class CategoryTreeNodeAPIView(TreeNodeBaseAPIView):
    model = Category

    def get(self, request, pk=None):
        if self.action == "detail":
            try:
                obj = self.get_queryset().get(pk=pk)
                return JsonResponse(model_to_dict(obj))
            except self.model.DoesNotExist:
                return HttpResponseNotFound("Node not found.")

        if self.action == "list":
            nodes = self.get_queryset().order_by("_path")
            data = [model_to_dict(obj) for obj in nodes]
            return JsonResponse(data, safe=False)

        return super().get(request, pk)
