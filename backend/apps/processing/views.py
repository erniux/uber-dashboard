from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.processing.models import ProcessRun
from apps.processing.services.activity_processor import process_pending_activities
from apps.processing.services.detail_processor import process_pending_details


class RunActivitiesProcessingView(APIView):
    def post(self, request, *args, **kwargs):
        try:
            result = process_pending_activities()
            return Response(
                {
                    "message": "Procesamiento de activities ejecutado correctamente.",
                    "result": result,
                },
                status=status.HTTP_200_OK,
            )
        except Exception as exc:
            return Response(
                {
                    "message": "Ocurrio un error al ejecutar el procesamiento de activities.",
                    "error": str(exc),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class RunDetailProcessingView(APIView):
    def post(self, request, *args, **kwargs):
        try:
            result = process_pending_details()
            return Response(
                {
                    "message": "Procesamiento de details ejecutado correctamente.",
                    "result": result,
                },
                status=status.HTTP_200_OK,
            )
        except Exception as exc:
            return Response(
                {
                    "message": "Ocurrio un error al ejecutar el procesamiento de details.",
                    "error": str(exc),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class ProcessRunsListView(APIView):
    def get(self, request, *args, **kwargs):
        rows = [
            {
                "id": run.id,
                "process_type": run.process_type,
                "status": run.status,
                "total_records": run.total_records,
                "processed_records": run.processed_records,
                "failed_records": run.failed_records,
                "started_at": run.started_at,
                "finished_at": run.finished_at,
                "created_at": run.created_at,
                "notes": run.notes,
                "error_message": run.error_message,
            }
            for run in ProcessRun.objects.all()[:30]
        ]

        return Response(rows, status=status.HTTP_200_OK)
