from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("apps.core.urls")),
    path("api/payloads/", include("apps.payloads.urls")),
    path("api/processing/", include("apps.processing.urls")),
    path("api/metrics/", include("apps.metrics.urls")),
    path("api/integrations/", include("apps.integrations.urls")),
]
