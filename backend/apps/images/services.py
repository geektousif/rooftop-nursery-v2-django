from imagekitio import ImageKit

from config.env import env

from .models import ProductImage

imagekit = ImageKit(
    private_key=env.get("IMAGEKIT_PRIVATE_KEY"),
)


def sign_image_auth():
    return imagekit.helper.get_authentication_parameters()


def save_returned_image_url(data):

    if ProductImage.objects.filter(variant=data["variant"], is_display_image=True).exists():
        ProductImage.objects.filter(variant=data["variant"], is_display_image=True).update(
            is_display_image=False
        )

    if ProductImage.objects.filter(
        variant=data["variant"], display_order=data["display_order"]
    ).exists():
        ProductImage.objects.filter(
            variant=data["variant"], display_order=data["display_order"]
        ).update(display_order=data["display_order"] + 1)

    return ProductImage.objects.create(
        variant=data["variant"],
        image_url=data["url"],
        image_provider_id=data["file_id"],
        is_display_image=data["is_display_image"],
        display_order=data["display_order"],
    )
