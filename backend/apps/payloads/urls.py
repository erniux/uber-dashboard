from django.urls import path
from .views import (
    RawPayloadCreateView,
    RawPayloadListView,
    RawPayloadBulkCreateView,
    PayloadWorkQueueView,
    PayloadDetailLookupView,
)

urlpatterns = [
    path("", RawPayloadListView.as_view(), name="payload-list"),
    path("work-queue/", PayloadWorkQueueView.as_view(), name="payload-work-queue"),
    path("detail-lookup/", PayloadDetailLookupView.as_view(), name="payload-detail-lookup"),
    path("upload/", RawPayloadCreateView.as_view(), name="payload-upload"),
    path("upload-bulk/", RawPayloadBulkCreateView.as_view(), name="payload-upload-bulk"),
]
