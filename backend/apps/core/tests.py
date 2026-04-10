from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase


User = get_user_model()


class SessionAuthApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="operador",
            password="segura123",
            first_name="Uber",
            last_name="Operator",
            email="operador@example.com",
        )

    def test_login_returns_authenticated_user_payload(self):
        response = self.client.post(
            "/api/auth/login/",
            {"username": "operador", "password": "segura123"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["authenticated"])
        self.assertEqual(response.data["user"]["username"], "operador")

    def test_login_rejects_invalid_credentials(self):
        response = self.client.post(
            "/api/auth/login/",
            {"username": "operador", "password": "incorrecta"},
            format="json",
        )

        self.assertEqual(response.status_code, 401)
        self.assertFalse(response.data["authenticated"])

    def test_me_reflects_session_status(self):
        anonymous_response = self.client.get("/api/auth/me/")
        self.assertEqual(anonymous_response.status_code, 200)
        self.assertFalse(anonymous_response.data["authenticated"])

        self.client.post(
            "/api/auth/login/",
            {"username": "operador", "password": "segura123"},
            format="json",
        )

        authenticated_response = self.client.get("/api/auth/me/")
        self.assertEqual(authenticated_response.status_code, 200)
        self.assertTrue(authenticated_response.data["authenticated"])
        self.assertEqual(authenticated_response.data["user"]["full_name"], "Uber Operator")

    def test_logout_clears_session(self):
        self.client.post(
            "/api/auth/login/",
            {"username": "operador", "password": "segura123"},
            format="json",
        )

        logout_response = self.client.post("/api/auth/logout/", {}, format="json")
        self.assertEqual(logout_response.status_code, 200)
        self.assertFalse(logout_response.data["authenticated"])

        me_response = self.client.get("/api/auth/me/")
        self.assertFalse(me_response.data["authenticated"])
