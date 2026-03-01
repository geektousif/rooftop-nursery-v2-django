from imagekitio import ImageKit

from config.env import env

imagekit = ImageKit(
    private_key=env.get("IMAGEKIT_PRIVATE_KEY"),
)


def sign_image_auth():
    return imagekit.helper.get_authentication_parameters()
