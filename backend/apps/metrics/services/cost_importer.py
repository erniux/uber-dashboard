import csv
import io
from datetime import datetime
from decimal import Decimal, InvalidOperation

from apps.metrics.models import OperatingCost


CATEGORY_MAP = {
    "gasolina": "fuel",
    "combustible": "fuel",
    "mantenimiento": "maintenance",
    "peajes": "tolls",
    "casetas": "tolls",
    "impuestos": "taxes",
    "refrendo": "taxes",
    "verificacion": "verification",
    "verificación": "verification",
    "seguro": "insurance",
}


def normalize_category(concept):
    normalized = (concept or "").strip().lower()
    return CATEGORY_MAP.get(normalized, "other")


def import_costs_from_csv(uploaded_file):
    try:
        decoded = uploaded_file.read().decode("utf-8-sig")
    except Exception as exc:
        raise ValueError("No fue posible leer el archivo CSV.") from exc

    reader = csv.DictReader(io.StringIO(decoded))
    expected_columns = {"fecha", "concepto", "monto", "medio"}
    if not reader.fieldnames or not expected_columns.issubset({field.strip().lower() for field in reader.fieldnames}):
        raise ValueError("El CSV debe incluir las columnas: fecha, concepto, monto, medio.")

    created_entries = []
    row_errors = []

    for index, row in enumerate(reader, start=2):
        try:
            raw_date = (row.get("fecha") or "").strip()
            raw_concept = (row.get("concepto") or "").strip()
            raw_amount = (row.get("monto") or "").strip()
            raw_payment_method = (row.get("medio") or "").strip()

            if not raw_date or not raw_concept or not raw_amount:
                raise ValueError("Faltan campos obligatorios.")

            cost_date = datetime.strptime(raw_date, "%d/%m/%Y").date()
            amount = Decimal(raw_amount).quantize(Decimal("0.01"))

            entry = OperatingCost.objects.create(
                category=normalize_category(raw_concept),
                title=raw_concept.capitalize(),
                description=raw_payment_method,
                amount=amount,
                cost_date=cost_date,
            )
            created_entries.append(entry)
        except (ValueError, InvalidOperation) as exc:
            row_errors.append(
                {
                    "row": index,
                    "error": str(exc),
                }
            )

    return {
        "created_count": len(created_entries),
        "error_count": len(row_errors),
        "errors": row_errors,
        "created_entries": created_entries,
    }
