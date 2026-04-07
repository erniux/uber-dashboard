from django.urls import path
from .views import (
    RawPayloadCreateView,
    RawPayloadListView,
    RawPayloadBulkCreateView,
)

urlpatterns = [
    path("", RawPayloadListView.as_view(), name="payload-list"),
    path("upload/", RawPayloadCreateView.as_view(), name="payload-upload"),
    path("upload-bulk/", RawPayloadBulkCreateView.as_view(), name="payload-upload-bulk"),
]