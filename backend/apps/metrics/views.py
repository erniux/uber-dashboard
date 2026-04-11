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
from apps.metrics.models import OperatingCost, UberTrip
from apps.metrics.serializers import OperatingCostSerializer
from apps.metrics.services.cost_importer import import_costs_from_csv
from apps.metrics.services.cost_metrics import get_cost_dashboard


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


class TripMapPointsView(BaseMetricsView):
    def get(self, request, *args, **kwargs):
        try:
            start_date, end_date = self.get_date_filters(request)
            queryset = UberTrip.objects.all().order_by("-requested_at", "-created_at")

            if start_date:
                queryset = queryset.filter(requested_date__gte=start_date)
            if end_date:
                queryset = queryset.filter(requested_date__lte=end_date)

            queryset = queryset.exclude(
                pickup_lat__isnull=True,
                dropoff_lat__isnull=True,
            )

            rows = [
                {
                    "uuid": trip.uuid,
                    "requested_date": trip.requested_date,
                    "requested_at": trip.requested_at,
                    "service_type": trip.service_type,
                    "service_group": trip.service_group,
                    "status": "completed" if trip.is_completed else "canceled" if trip.is_canceled else trip.status_type.lower(),
                    "time_bucket": trip.time_bucket,
                    "gross_amount": trip.gross_amount,
                    "pickup_address": trip.pickup_address,
                    "dropoff_address": trip.dropoff_address,
                    "pickup_lat": trip.pickup_lat,
                    "pickup_lng": trip.pickup_lng,
                    "dropoff_lat": trip.dropoff_lat,
                    "dropoff_lng": trip.dropoff_lng,
                }
                for trip in queryset[:300]
            ]

            return Response(rows, status=status.HTTP_200_OK)
        except ValueError as exc:
            return self.handle_error(exc)


class OperatingCostListCreateView(BaseMetricsView):
    def get(self, request, *args, **kwargs):
        try:
            start_date, end_date = self.get_date_filters(request)
            queryset = OperatingCost.objects.all().order_by("-cost_date", "-created_at")

            if start_date:
                queryset = queryset.filter(cost_date__gte=start_date)
            if end_date:
                queryset = queryset.filter(cost_date__lte=end_date)

            serializer = OperatingCostSerializer(queryset[:100], many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except ValueError as exc:
            return self.handle_error(exc)

    def post(self, request, *args, **kwargs):
        serializer = OperatingCostSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        cost_entry = serializer.save()
        return Response(OperatingCostSerializer(cost_entry).data, status=status.HTTP_201_CREATED)


class CostDashboardView(BaseMetricsView):
    def get(self, request, *args, **kwargs):
        try:
            start_date, end_date = self.get_date_filters(request)
            result = get_cost_dashboard(start_date=start_date, end_date=end_date)
            return Response(result, status=status.HTTP_200_OK)
        except ValueError as exc:
            return self.handle_error(exc)


class OperatingCostCsvUploadView(APIView):
    def post(self, request, *args, **kwargs):
        uploaded_file = request.FILES.get("file")
        if not uploaded_file:
            return Response(
                {
                    "message": "Debes enviar un archivo CSV en el campo 'file'.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            result = import_costs_from_csv(uploaded_file)
            return Response(
                {
                    "message": "CSV de costos importado correctamente.",
                    "summary": {
                        "created": result["created_count"],
                        "failed": result["error_count"],
                    },
                    "errors": result["errors"],
                },
                status=status.HTTP_201_CREATED,
            )
        except ValueError as exc:
            return Response(
                {
                    "message": "No fue posible importar el CSV.",
                    "error": str(exc),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
