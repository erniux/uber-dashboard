from decimal import Decimal

from django.db.models import Count, Sum, Value
from django.db.models.functions import Coalesce, TruncMonth

from apps.metrics.models import OperatingCost, UberTrip
from apps.metrics.services.dashboard_metrics import (
    DECIMAL_OUTPUT,
    DECIMAL_ZERO,
    get_filtered_trips,
)


def get_filtered_costs(*, start_date=None, end_date=None):
    queryset = OperatingCost.objects.all()

    if start_date:
        queryset = queryset.filter(cost_date__gte=start_date)

    if end_date:
        queryset = queryset.filter(cost_date__lte=end_date)

    return queryset


def _safe_decimal(value):
    return value if value is not None else Decimal("0.00")


def _quantize(value):
    return _safe_decimal(value).quantize(Decimal("0.01"))


def _build_combo_rows(trips_queryset, total_cost):
    combo_rows = list(
        trips_queryset.values("service_type", "service_group", "day_of_week", "time_bucket").annotate(
            trips_count=Count("id"),
            gross_amount_total=Coalesce(Sum("gross_amount"), DECIMAL_ZERO, output_field=DECIMAL_OUTPUT),
        )
    )

    total_combo_trips = sum(row["trips_count"] for row in combo_rows)

    for row in combo_rows:
        allocated_cost = (
            (total_cost * Decimal(row["trips_count"]) / Decimal(total_combo_trips)).quantize(Decimal("0.01"))
            if total_combo_trips
            else Decimal("0.00")
        )
        utility_amount = (_safe_decimal(row["gross_amount_total"]) - allocated_cost).quantize(Decimal("0.01"))
        adjusted_roi = (
            (utility_amount / allocated_cost * Decimal("100")).quantize(Decimal("0.01"))
            if allocated_cost
            else Decimal("0.00")
        )

        row["allocated_cost"] = allocated_cost
        row["utility_amount"] = utility_amount
        row["adjusted_roi"] = adjusted_roi
        row["display_name"] = " | ".join(
            filter(
                None,
                [
                    row.get("service_type") or row.get("service_group") or "-",
                    row.get("day_of_week") or "-",
                    row.get("time_bucket") or "-",
                ],
            )
        )

    combo_rows.sort(
        key=lambda row: (
            row["adjusted_roi"],
            row["utility_amount"],
            row["trips_count"],
        ),
        reverse=True,
    )
    return combo_rows


def get_cost_dashboard(*, start_date=None, end_date=None):
    trips_queryset = get_filtered_trips(start_date=start_date, end_date=end_date)
    costs_queryset = get_filtered_costs(start_date=start_date, end_date=end_date)

    trip_totals = trips_queryset.aggregate(
        gross_amount_total=Coalesce(Sum("gross_amount"), DECIMAL_ZERO, output_field=DECIMAL_OUTPUT),
    )
    total_income = _quantize(trip_totals["gross_amount_total"])
    total_cost = _quantize(costs_queryset.aggregate(
        total_cost=Coalesce(Sum("amount"), DECIMAL_ZERO, output_field=DECIMAL_OUTPUT),
    )["total_cost"])
    utility_amount = _quantize(total_income - total_cost)
    adjusted_roi = _quantize((utility_amount / total_cost * Decimal("100")) if total_cost else Decimal("0.00"))

    trip_months = list(
        trips_queryset.annotate(period=TruncMonth("requested_date"))
        .values("period")
        .annotate(income_total=Coalesce(Sum("gross_amount"), DECIMAL_ZERO, output_field=DECIMAL_OUTPUT))
        .order_by("period")
    )
    cost_months = {
        row["period"]: _safe_decimal(row["cost_total"])
        for row in costs_queryset.annotate(period=TruncMonth("cost_date"))
        .values("period")
        .annotate(cost_total=Coalesce(Sum("amount"), DECIMAL_ZERO, output_field=DECIMAL_OUTPUT))
    }

    month_keys = sorted({row["period"] for row in trip_months} | set(cost_months.keys()))
    income_by_month = {row["period"]: _safe_decimal(row["income_total"]) for row in trip_months}
    monthly_profits = [
        _quantize(income_by_month.get(month_key, Decimal("0.00")) - cost_months.get(month_key, Decimal("0.00")))
        for month_key in month_keys
        if month_key is not None
    ]
    average_monthly_profit = (
        _quantize(sum(monthly_profits, Decimal("0.00")) / Decimal(len(monthly_profits)))
        if monthly_profits
        else Decimal("0.00")
    )

    combo_rows = _build_combo_rows(trips_queryset, total_cost)
    category_counts = list(
        costs_queryset.values("category")
        .annotate(entries_count=Count("id"))
        .order_by("-entries_count", "category")
    )

    best_combo = combo_rows[0] if combo_rows else None
    worst_combo = combo_rows[-1] if combo_rows else None

    return {
        "period_income": total_income,
        "period_cost": total_cost,
        "period_utility": utility_amount,
        "adjusted_roi": adjusted_roi,
        "average_monthly_utility": average_monthly_profit,
        "best_combo": best_combo,
        "worst_combo": worst_combo,
        "top_combos": combo_rows[:5],
        "cost_entries_count": costs_queryset.count(),
        "cost_category_counts": category_counts,
        "filters": {
            "start_date": start_date.isoformat() if start_date else None,
            "end_date": end_date.isoformat() if end_date else None,
        },
    }
