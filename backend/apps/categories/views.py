from treenode.views.autoapi import AutoTreeAPI

from apps.core.treenode_auth_required import treenode_auth_required


class CategoryAutoTreeAPI(AutoTreeAPI):
    def protect_view(self, view, model):
        """
        Public read, admin-only write
        """
        return treenode_auth_required(view, admin_write=True)
