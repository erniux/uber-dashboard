from .settings import *  # noqa: F403,F401


INSTALLED_APPS = [app for app in INSTALLED_APPS if app != "corsheaders"]  # noqa: F405
MIDDLEWARE = [mw for mw in MIDDLEWARE if mw != "corsheaders.middleware.CorsMiddleware"]  # noqa: F405

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "test_db.sqlite3",  # noqa: F405
    }
}
