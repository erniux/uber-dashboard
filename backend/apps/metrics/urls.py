from django.urls import path

from apps.metrics.views import (
    CostDashboardView,
    MetricsByDayView,
    MetricsByServiceView,
    MetricsByTimeBucketView,
    MetricsSummaryView,
    OperatingCostCsvUploadView,
    OperatingCostListCreateView,
    TripMapPointsView,
    TripsListView,
)


urlpatterns = [
    path("summary/", MetricsSummaryView.as_view(), name="metrics-summary"),
    path("by-day/", MetricsByDayView.as_view(), name="metrics-by-day"),
    path("by-service/", MetricsByServiceView.as_view(), name="metrics-by-service"),
    path("by-time-bucket/", MetricsByTimeBucketView.as_view(), name="metrics-by-time-bucket"),
    path("trips/", TripsListView.as_view(), name="metrics-trips"),
    path("map-points/", TripMapPointsView.as_view(), name="metrics-map-points"),
    path("cost-entries/", OperatingCostListCreateView.as_view(), name="metrics-cost-entries"),
    path("cost-entries/upload-csv/", OperatingCostCsvUploadView.as_view(), name="metrics-cost-entries-upload-csv"),
    path("cost-dashboard/", CostDashboardView.as_view(), name="metrics-cost-dashboard"),
]
