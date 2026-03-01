from django.conf import settings
from imagekitio import ImageKit

imagekit = ImageKit(
    private_key=settings.IMAGEKIT_STORAGE["PRIVATE_KEY"],
)
