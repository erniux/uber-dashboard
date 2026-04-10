from rest_framework.response import Response
from rest_framework.views import APIView
from django.conf import settings


class UberCallbackView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request, *args, **kwargs):
        code = request.query_params.get("code")
        state = request.query_params.get("state")
        error = request.query_params.get("error")

        return Response(
            {
                "message": "Uber callback recibido.",
                "code": code,
                "state": state,
                "error": error,
                "configured_redirect_uri": settings.UBER_REDIRECT_URI,
                "environment": settings.UBER_ENVIRONMENT,
            }
        )