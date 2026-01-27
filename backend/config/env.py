import os
from pathlib import Path

import environ

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

envconfig = environ.Env()

environ.Env.read_env(os.path.join(BASE_DIR, ".env"))


env = {
    "SECRET_KEY": envconfig.str("SECRET_KEY"),
    # SECURITY WARNING: don't run with debug turned on in production!
    "DEBUG": envconfig.bool("DEBUG", default=False),
    "ALLOWED_HOSTS": envconfig.list("ALLOWED_HOSTS"),
    "DATABASE_URL": envconfig.db("DATABASE_URL"),
    "IMAGEKIT_PRIVATE_KEY": envconfig.str("IMAGEKIT_PRIVATE_KEY"),
    "IMAGEKIT_PUBLIC_KEY": envconfig.str("IMAGEKIT_PUBLIC_KEY"),
    "IMAGEKIT_URL_ENDPOINT": envconfig.str("IMAGEKIT_URL_ENDPOINT"),
}
