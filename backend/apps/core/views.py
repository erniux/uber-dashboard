from django.contrib.auth import authenticate, login, logout
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView


def build_user_payload(user):
    return {
        "id": user.id,
        "username": user.username,
        "full_name": user.get_full_name() or user.username,
        "email": user.email,
    }


@method_decorator(csrf_exempt, name="dispatch")
class SessionLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = (request.data.get("username") or "").strip()
        password = request.data.get("password") or ""

        if not username or not password:
            return Response(
                {"authenticated": False, "message": "Usuario y contraseña son obligatorios."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = authenticate(request, username=username, password=password)
        if user is None:
            return Response(
                {"authenticated": False, "message": "Las credenciales no son válidas."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        login(request, user)
        return Response(
            {
                "authenticated": True,
                "message": "Sesión iniciada correctamente.",
                "user": build_user_payload(user),
            },
            status=status.HTTP_200_OK,
        )


@method_decorator(csrf_exempt, name="dispatch")
class SessionLogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        logout(request)
        return Response(
            {"authenticated": False, "message": "Sesión cerrada correctamente."},
            status=status.HTTP_200_OK,
        )


class SessionStatusView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        if request.user.is_authenticated:
            return Response(
                {
                    "authenticated": True,
                    "user": build_user_payload(request.user),
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            {
                "authenticated": False,
                "user": None,
            },
            status=status.HTTP_200_OK,
        )
