from django.urls import path

from apps.core.views import SessionLoginView, SessionLogoutView, SessionStatusView


urlpatterns = [
    path("auth/login/", SessionLoginView.as_view(), name="session-login"),
    path("auth/logout/", SessionLogoutView.as_view(), name="session-logout"),
    path("auth/me/", SessionStatusView.as_view(), name="session-status"),
]
