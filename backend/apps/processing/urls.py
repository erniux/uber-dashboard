from django.urls import path

from .views import ProcessRunsListView, RunActivitiesProcessingView, RunDetailProcessingView

urlpatterns = [
    path("activities/run/", RunActivitiesProcessingView.as_view(), name="run-activities-processing"),
    path("details/run/", RunDetailProcessingView.as_view(), name="processing-details-run"),
    path("runs/", ProcessRunsListView.as_view(), name="processing-runs-list"),
]
