from imagekitio import ImageKit

from core.config import env

imagekit = ImageKit(
    private_key=env.get("IMAGEKIT_PRIVATE_KEY"),
)

# Store URL endpoint for reuse
auth_params = imagekit.helper.get_authentication_parameters()
