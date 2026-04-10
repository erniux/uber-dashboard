from datetime import date

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.metrics.services.dashboard_metrics import (
    get_daily_breakdown,
    get_service_breakdown,
    get_summary_metrics,
    get_time_bucket_breakdown,
)
from apps.metrics.models import UberTrip


def parse_optional_date(value, param_name):
    if not value:
        return None

    try:
        return date.fromisoformat(value)
    except ValueError as exc:
        raise ValueError(
            f"El parámetro '{param_name}' debe tener formato YYYY-MM-DD."
        ) from exc


class BaseMetricsView(APIView):
    def get_date_filters(self, request):
        start_date = parse_optional_date(
            request.query_params.get("start_date"),
            "start_date",
        )
        end_date = parse_optional_date(
            request.query_params.get("end_date"),
            "end_date",
        )

        if start_date and end_date and start_date > end_date:
            raise ValueError("El parámetro 'start_date' no puede ser mayor que 'end_date'.")

        return start_date, end_date

    def handle_error(self, exc):
        return Response(
            {
                "message": "No fue posible obtener las métricas solicitadas.",
                "error": str(exc),
            },
            status=status.HTTP_400_BAD_REQUEST,
        )


class MetricsSummaryView(BaseMetricsView):
    def get(self, request, *args, **kwargs):
        try:
            start_date, end_date = self.get_date_filters(request)
            result = get_summary_metrics(start_date=start_date, end_date=end_date)
            return Response(result, status=status.HTTP_200_OK)
        except ValueError as exc:
            return self.handle_error(exc)


class MetricsByServiceView(BaseMetricsView):
    def get(self, request, *args, **kwargs):
        try:
            start_date, end_date = self.get_date_filters(request)
            result = get_service_breakdown(start_date=start_date, end_date=end_date)
            return Response(result, status=status.HTTP_200_OK)
        except ValueError as exc:
            return self.handle_error(exc)


class MetricsByTimeBucketView(BaseMetricsView):
    def get(self, request, *args, **kwargs):
        try:
            start_date, end_date = self.get_date_filters(request)
            result = get_time_bucket_breakdown(start_date=start_date, end_date=end_date)
            return Response(result, status=status.HTTP_200_OK)
        except ValueError as exc:
            return self.handle_error(exc)


class MetricsByDayView(BaseMetricsView):
    def get(self, request, *args, **kwargs):
        try:
            start_date, end_date = self.get_date_filters(request)
            result = get_daily_breakdown(start_date=start_date, end_date=end_date)
            return Response(result, status=status.HTTP_200_OK)
        except ValueError as exc:
            return self.handle_error(exc)


class TripsListView(BaseMetricsView):
    def get(self, request, *args, **kwargs):
        try:
            start_date, end_date = self.get_date_filters(request)
            queryset = UberTrip.objects.all().order_by("-requested_at", "-created_at")

            if start_date:
                queryset = queryset.filter(requested_date__gte=start_date)
            if end_date:
                queryset = queryset.filter(requested_date__lte=end_date)

            service_group = request.query_params.get("service_group")
            status_filter = request.query_params.get("status")

            if service_group:
                queryset = queryset.filter(service_group=service_group)

            if status_filter == "completed":
                queryset = queryset.filter(is_completed=True)
            elif status_filter == "canceled":
                queryset = queryset.filter(is_canceled=True)

            rows = [
                {
                    "uuid": trip.uuid,
                    "requested_date": trip.requested_date,
                    "requested_at": trip.requested_at,
                    "service_type": trip.service_type,
                    "service_group": trip.service_group,
                    "distance_km": trip.distance_km,
                    "duration_minutes": trip.duration_minutes,
                    "gross_amount": trip.gross_amount,
                    "status": "completed" if trip.is_completed else "canceled" if trip.is_canceled else trip.status_type.lower(),
                }
                for trip in queryset[:50]
            ]

            return Response(rows, status=status.HTTP_200_OK)
        except ValueError as exc:
            return self.handle_error(exc)
