from django.urls import path
from .views import UberCallbackView

urlpatterns = [
    path("uber/callback/", UberCallbackView.as_view(), name="uber-callback"),
]