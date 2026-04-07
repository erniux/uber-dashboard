from django.urls import path
from .views import RunActivitiesProcessingView, RunDetailProcessingView

urlpatterns = [
    path("activities/run/", RunActivitiesProcessingView.as_view(), name="run-activities-processing"),
    path("details/run/", RunDetailProcessingView.as_view(), name="processing-details-run"),

]