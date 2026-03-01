from logging import getLogger

from django import forms

from apps.domains.products.models.image import ProductImage

from .widgets import ImageKitUploadWidget as ImageKitWidget

log = getLogger(__name__)


class ProductImageForm(forms.ModelForm):
    """Custom form with ImageKit upload widget"""

    # Hidden field to store ImageKit URL
    # image_url = forms.CharField(widget=forms.HiddenInput(), required=False)

    # Hidden field to store ImageKit file ID
    # image_provider_id = forms.CharField(widget=forms.HiddenInput(), required=False)

    # File upload field (triggers ImageKit direct upload)
    # image_upload = forms.FileField(
    #     required=False, widget=ImageKitUploadWidget, label="Upload Image"
    # )

    class Meta:
        model = ProductImage
        # fields = [
        #     "image_upload",
        #     "image_url",
        #     "image_provider_id",
        #     "is_display_image",
        #     "display_order",
        # ]
        fields = ["image_url", "image_provider_id", "is_display_image", "display_order"]
        widgets = {
            "image_url": ImageKitWidget(),  # Widget gets attrs in __init__ below
            "image_provider_id": forms.HiddenInput(),
        }

    # def __init__(self, *args, **kwargs):
    #     super().__init__(*args, **kwargs)
    #
    #     file_name_attrs = {}
    #
    #     # Get product and variant names from the instance
    #     if self.instance and self.instance.variant:
    #         product_name = self.instance.variant.product.name
    #         variant_name = self.instance.variant.name
    #
    #
    #         # Pass to widget as data attributes
    #         file_name_attrs = {"product_name": product_name, "variant_name": variant_name}
    #
    #     self.fields["image_url"].widget.attrs.update(file_name_attrs)
    #     print(self.fields["image_url"].widget.attrs)
    #
    #         # Creating new image inside variant admin
    #     print(self.attrs)

    # def save(self, commit=True):
    #     instance = super().save(commit=False)
    #
    #     # image_url and image_provider_id are populated by JavaScript
    #     # No need to handle file upload here - it goes directly to ImageKit
    #
    #     if commit:
    #         instance.save()
    #     return instance
