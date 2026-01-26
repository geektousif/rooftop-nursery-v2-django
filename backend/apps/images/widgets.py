from django import forms


class ImageKitUploadWidget(forms.Widget):
    """Custom widget for direct ImageKit upload in Django admin"""

    template_name = "admin/widgets/imagekit_widget.html"

    class Media:
        js = ("https://unpkg.com/@imagekit/javascript@5.0.0/dist/imagekit.min.js",)
    #     css = {"all": ("admin/css/imagekit_uploader.css",)}

    def __init__(self, attrs=None):
        default_attrs = {"class": "imagekit-field", "product_name": "", "variant_name": ""}
        if attrs:
            default_attrs.update(attrs)
        super().__init__(default_attrs)

    # def get_context(self, name, value, attrs):
    #     context = super().get_context(name, value, attrs)

        # print("context", context["widget"]["attrs"])
        # print("attrs", attrs)
        # Pass additional context to template if available
        # These will be set in the form's __init__
        # if attrs:
        #     context["widget"]["attrs"] = attrs

        # return context
    #
    # def format_value(self, value):
    #     """Format the current value for display"""
    #     if value and isinstance(value, str):
    #         return value
    #     return ""
