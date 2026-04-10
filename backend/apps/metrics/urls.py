from django.urls import path

from apps.metrics.views import (
    MetricsByDayView,
    MetricsByServiceView,
    MetricsByTimeBucketView,
    MetricsSummaryView,
    TripsListView,
)


urlpatterns = [
    path("summary/", MetricsSummaryView.as_view(), name="metrics-summary"),
    path("by-day/", MetricsByDayView.as_view(), name="metrics-by-day"),
    path("by-service/", MetricsByServiceView.as_view(), name="metrics-by-service"),
    path("by-time-bucket/", MetricsByTimeBucketView.as_view(), name="metrics-by-time-bucket"),
    path("trips/", TripsListView.as_view(), name="metrics-trips"),
]
