import { useEffect, useMemo, useRef, useState } from "react";

const API_ROOT = import.meta.env.VITE_API_ROOT ?? "http://127.0.0.1:8000/api";
const METRICS_API_BASE = `${API_ROOT}/metrics`;
const PAYLOADS_API_BASE = `${API_ROOT}/payloads`;
const PROCESSING_API_BASE = `${API_ROOT}/processing`;
const AUTH_API_BASE = API_ROOT;

const COPY = {
  es: {
    dashboard: "Inicio",
    trips: "Viajes",
    earnings: "Ganancias",
    costs: "Costos",
    heatmaps: "Mapas",
    reports: "Reportes",
    settings: "Configuración",
    signIn: "Iniciar sesión",
    loginCopy: "Entra a tu data product para explorar viajes, ganancias y operación.",
    username: "Usuario",
    password: "Contraseña",
    enter: "Entrar",
    entering: "Entrando...",
    dark: "Modo oscuro",
    light: "Modo claro",
    lang: "EN",
    signOut: "Salir",
    todayTrips: "Viajes",
    completedTrips: "Completados",
    totalTripsLabel: "Total",
    canceledTrips: "Cancelados",
    totalTrips: "Viajes totales",
    avgFare: "Tarifa promedio",
    todayEarnings: "Ganancias totales",
    dashboardPeriod: "Periodo",
    periodToday: "Hoy",
    periodWeek: "Semana",
    periodMonth: "Mes",
    periodYear: "Año",
    periodCustom: "Rango manual",
    recentTrips: "Viajes recientes",
    serviceMix: "Viajes por servicio",
    processingStatus: "Estado de la operación",
    costSummary: "Resumen de costos",
    addCost: "Registrar costo",
    recentCosts: "Costos del periodo",
    uploadCostsCsv: "Subir CSV de costos",
    chooseCsvFile: "Seleccionar archivo .csv",
    csvImportedSuccess: "El CSV de costos se importó correctamente.",
    category: "Categoría",
    amount: "Monto",
    costDate: "Fecha del costo",
    title: "Concepto",
    description: "Descripción",
    saveCost: "Guardar costo",
    periodIncome: "Ingresos del periodo",
    periodCost: "Costo total del periodo",
    periodUtility: "Utilidad del periodo",
    adjustedRoi: "ROI ajustado del periodo",
    averageMonthlyUtility: "Utilidad mensual promedio",
    periodCostEntries: "Costos registrados del periodo",
    bestCombo: "Mejor combinación real",
    worstCombo: "Peor combinación real",
    topCombos: "Top 5 combinaciones reales",
    fuel: "Gasolina",
    maintenance: "Mantenimiento",
    tolls: "Peajes",
    taxes: "Impuestos",
    verification: "Verificación vehicular",
    insurance: "Seguro",
    other: "Otro",
    costSavedSuccess: "El costo se guardó correctamente.",
    utility: "Utilidad",
    tripsCount: "Viajes",
    roi: "ROI",
    serviceDetail: "Servicio",
    dayDetail: "Día",
    slotDetail: "Franja",
    incomeDetail: "Ingreso",
    allocatedCostDetail: "Costo asignado",
    step2: "Pendientes por descargar",
    step3: "Detalles listos para procesar",
    step4: "Viajes normalizados",
    allTrips: "Todos los viajes",
    tripDetail: "Detalle del viaje",
    advancedSearch: "Filtros y búsqueda avanzada",
    exportData: "Exportar datos",
    dailyEarnings: "Ganancias diarias",
    weeklyMonthly: "Semanal / mensual",
    byService: "Ganancias por servicio",
    trends: "Tendencias de ganancias",
    tripsHeatmap: "Mapa de calor de viajes",
    pickupHotspots: "Zonas de origen",
    dropoffHotspots: "Zonas de destino",
    timeHeatmap: "Mapa de calor por tiempo",
    mapTripsWithCoords: "Viajes con coordenadas",
    mapRoutesVisible: "Rutas visibles",
    mapLoading: "Cargando mapa...",
    mapEmpty: "No hay viajes con coordenadas para el rango seleccionado.",
    mapDisplayLabel: "Mostrar en mapa",
    mapLegendPickup: "Origen",
    mapLegendDropoff: "Destino",
    mapShowPickup: "Solo origen",
    mapShowDropoff: "Solo destino",
    mapShowBoth: "Ambos",
    processingRuns: "Ejecuciones de procesamiento",
    dataQuality: "Calidad de datos",
    customReports: "Reportes personalizados",
    exportReports: "Exportar reportes",
    systemConfig: "Configuración del sistema",
    processingControls: "Controles de procesamiento",
    userSettings: "Preferencias de usuario",
    dataSources: "Fuentes de datos",
    uploadActivities: "Subir activities",
    uploadDetails: "Subir details",
    activityPayloads: "Payloads de activities",
    detailPayloads: "Payloads de details",
    uploadActivitiesForTrips: "Subir actividades para extraer viajes",
    uploadActivityDetails: "Subir detalle de actividades",
    recentTodayHistory: "Historial reciente de hoy",
    tooltip: "Ayuda",
    extractTripsHelp: "Lee los payloads de activities, extrae los UUIDs de details y arma la lista pendiente por subir.",
    processTripsHelp: "Toma los details reales que ya subiste y los convierte en viajes listos para métricas.",
    prepareMetricsHelp: "Ejecuta la preparación disponible para refrescar el estado y las métricas con la data cargada.",
    detailsHelpIntro: "Puedes cargar details de tres formas. Solo necesitas una por envío.",
    detailsHelpFile: "Archivo JSON individual: útil para una sola actividad.",
    detailsHelpBulk: "Bulk de archivos JSON: útil cuando ya descargaste muchos details.",
    detailsHelpPaste: "Pegar payload JSON: útil para pruebas rápidas o cargas manuales.",
    detailsHelpRequired: "El nombre del lote es recomendable. No necesitas llenar UUID manual si viene dentro del JSON.",
    batchName: "Nombre del lote",
    optionalUuid: "UUID opcional",
    optionalManualUuid: "UUID opcional para carga manual",
    chooseJsonFile: "Seleccionar archivo .json",
    chooseManyJson: "Seleccionar varios archivos .json",
    pasteActivityJson: "Pega un objeto JSON para carga individual o un arreglo JSON para carga masiva",
    pasteDetailJson: "Pega un objeto JSON, un arreglo JSON o usa selección múltiple de archivos",
    sending: "Enviando...",
    filesReady: "archivo(s) listos para carga masiva",
    dropJson: "Arrastra y suelta aquí tus archivos JSON",
    dropHint: "o usa el selector tradicional",
    lastUpload: "Última carga",
    uploadHistory: "Historial reciente",
    pendingUuidList: "UUIDs pendientes por subir",
    copyUuids: "Copiar UUIDs",
    pendingUuidHelp: "Estos UUIDs ya fueron detectados desde activities, pero todavía falta subir sus details reales.",
    created: "Creados",
    updated: "Actualizados",
    failed: "Fallidos",
    duplicates: "Duplicados",
    totalReceived: "Recibidos",
    runActivities: "Extraer detalle de actividades",
    runDetails: "Procesar viajes",
    runPipeline: "Preparar métricas",
    detailUploadSuccess: "El detail se subió correctamente.",
    detailUploadSuccessUuid: "El detail {uuid} se subió correctamente.",
    detailAlreadyPendingUuid: "El UUID {uuid} ya se subió y está pendiente de procesarse.",
    detailAlreadyProcessedUuid: "El UUID {uuid} ya se subió y ya fue procesado.",
    detailProcessSuccess: "Los details pendientes se procesaron correctamente.",
    detailProcessSuccessUuid: "El UUID {uuid} fue procesado correctamente.",
    activityProcessSuccess: "La lista de details pendientes se generó correctamente.",
    metricsPrepareSuccess: "Las métricas se prepararon correctamente.",
    empty: "Sin datos disponibles.",
    loading: "Cargando dashboard...",
    checking: "Validando sesión...",
    from: "Desde",
    to: "Hasta",
    apply: "Aplicar",
    clear: "Limpiar",
    type: "Tipo",
    service: "Servicio",
    distance: "Distancia",
    duration: "Duración",
    earningsAmount: "Ganancia",
    status: "Status",
    uploaded: "Cargado",
    requestedAt: "Fecha y hora",
    timeSlot: "Franja horaria",
    expand: "Expandir",
    collapse: "Ocultar",
  },
  en: {
    dashboard: "Dashboard",
    trips: "Trips",
    earnings: "Earnings",
    costs: "Costs",
    heatmaps: "Heatmaps",
    reports: "Reports",
    settings: "Settings",
    signIn: "Sign in",
    loginCopy: "Enter your data product to explore trips, earnings and operations.",
    username: "Username",
    password: "Password",
    enter: "Enter",
    entering: "Signing in...",
    dark: "Dark mode",
    light: "Light mode",
    lang: "ES",
    signOut: "Sign out",
    todayTrips: "Trips",
    completedTrips: "Completed",
    totalTripsLabel: "Total",
    canceledTrips: "Canceled",
    totalTrips: "Total trips",
    avgFare: "Average fare",
    todayEarnings: "Total earnings",
    dashboardPeriod: "Period",
    periodToday: "Today",
    periodWeek: "Week",
    periodMonth: "Month",
    periodYear: "Year",
    periodCustom: "Custom range",
    recentTrips: "Recent Trips",
    serviceMix: "Trips by Service",
    processingStatus: "Operations status",
    costSummary: "Cost summary",
    addCost: "Add cost",
    recentCosts: "Costs in range",
    uploadCostsCsv: "Upload costs CSV",
    chooseCsvFile: "Choose .csv file",
    csvImportedSuccess: "Costs CSV imported successfully.",
    category: "Category",
    amount: "Amount",
    costDate: "Cost date",
    title: "Title",
    description: "Description",
    saveCost: "Save cost",
    periodIncome: "Period income",
    periodCost: "Period total cost",
    periodUtility: "Period profit",
    adjustedRoi: "Adjusted period ROI",
    averageMonthlyUtility: "Average monthly profit",
    periodCostEntries: "Costs recorded in period",
    bestCombo: "Best real combination",
    worstCombo: "Worst real combination",
    topCombos: "Top 5 real combinations",
    fuel: "Fuel",
    maintenance: "Maintenance",
    tolls: "Tolls",
    taxes: "Taxes",
    verification: "Vehicle inspection",
    insurance: "Insurance",
    other: "Other",
    costSavedSuccess: "Cost saved successfully.",
    utility: "Profit",
    tripsCount: "Trips",
    roi: "ROI",
    serviceDetail: "Service",
    dayDetail: "Day",
    slotDetail: "Time slot",
    incomeDetail: "Income",
    allocatedCostDetail: "Allocated cost",
    step2: "Pending downloads",
    step3: "Details ready to process",
    step4: "Normalized trips",
    allTrips: "All Trips",
    tripDetail: "Trip Detail",
    advancedSearch: "Filters / Advanced Search",
    exportData: "Export Data",
    dailyEarnings: "Daily Earnings",
    weeklyMonthly: "Weekly / Monthly",
    byService: "Earnings by Service",
    trends: "Earnings Trends",
    tripsHeatmap: "Trips Heatmap",
    pickupHotspots: "Pickup Hotspots",
    dropoffHotspots: "Dropoff Hotspots",
    timeHeatmap: "Time-based Heatmap",
    mapTripsWithCoords: "Trips with coordinates",
    mapRoutesVisible: "Visible routes",
    mapLoading: "Loading map...",
    mapEmpty: "No trips with coordinates were found for the selected range.",
    mapDisplayLabel: "Show on map",
    mapLegendPickup: "Pickup",
    mapLegendDropoff: "Dropoff",
    mapShowPickup: "Pickup only",
    mapShowDropoff: "Dropoff only",
    mapShowBoth: "Both",
    processingRuns: "Processing Runs",
    dataQuality: "Data Quality",
    customReports: "Custom Reports",
    exportReports: "Export Reports",
    systemConfig: "System Config",
    processingControls: "Processing Controls",
    userSettings: "User Settings",
    dataSources: "Data Sources",
    uploadActivities: "Upload activities",
    uploadDetails: "Upload details",
    activityPayloads: "Activity payloads",
    detailPayloads: "Detail payloads",
    uploadActivitiesForTrips: "Upload activities to extract trips",
    uploadActivityDetails: "Upload activity details",
    recentTodayHistory: "Today's recent history",
    tooltip: "Help",
    extractTripsHelp: "Reads activity payloads, extracts detail UUIDs and builds the pending upload list.",
    processTripsHelp: "Takes the real details you already uploaded and converts them into trips ready for metrics.",
    prepareMetricsHelp: "Runs the available preparation steps to refresh status and metrics with the loaded data.",
    detailsHelpIntro: "You can load details in three ways. You only need one per submission.",
    detailsHelpFile: "Single JSON file: useful for one activity.",
    detailsHelpBulk: "Bulk JSON files: useful when you already downloaded many details.",
    detailsHelpPaste: "Paste JSON payload: useful for quick tests or manual uploads.",
    detailsHelpRequired: "Batch name is recommended. You do not need to fill UUID manually if it already exists inside the JSON.",
    batchName: "Batch name",
    optionalUuid: "Optional UUID",
    optionalManualUuid: "Optional UUID for manual upload",
    chooseJsonFile: "Choose .json file",
    chooseManyJson: "Choose multiple .json files",
    pasteActivityJson: "Paste a JSON object for single upload or a JSON array for bulk upload",
    pasteDetailJson: "Paste a JSON object, a JSON array or use multi-file selection",
    sending: "Sending...",
    filesReady: "file(s) ready for bulk upload",
    dropJson: "Drag and drop your JSON files here",
    dropHint: "or use the standard file picker",
    lastUpload: "Last upload",
    uploadHistory: "Recent history",
    pendingUuidList: "UUIDs pending upload",
    copyUuids: "Copy UUIDs",
    pendingUuidHelp: "These UUIDs were detected from activities, but their real detail payloads are still missing.",
    created: "Created",
    updated: "Updated",
    failed: "Failed",
    duplicates: "Duplicates",
    totalReceived: "Received",
    runActivities: "Extract activity details",
    runDetails: "Process trips",
    runPipeline: "Prepare metrics",
    detailUploadSuccess: "The detail was uploaded successfully.",
    detailUploadSuccessUuid: "Detail {uuid} was uploaded successfully.",
    detailAlreadyPendingUuid: "UUID {uuid} was already uploaded and is pending processing.",
    detailAlreadyProcessedUuid: "UUID {uuid} was already uploaded and has already been processed.",
    detailProcessSuccess: "Pending details were processed successfully.",
    detailProcessSuccessUuid: "UUID {uuid} was processed successfully.",
    activityProcessSuccess: "The pending detail list was generated successfully.",
    metricsPrepareSuccess: "Metrics were prepared successfully.",
    empty: "No data available.",
    loading: "Loading dashboard...",
    checking: "Checking session...",
    from: "From",
    to: "To",
    apply: "Apply",
    clear: "Clear",
    type: "Type",
    service: "Service",
    distance: "Distance",
    duration: "Duration",
    earningsAmount: "Earnings",
    status: "Status",
    uploaded: "Uploaded",
    requestedAt: "Date & time",
    timeSlot: "Time slot",
    expand: "Expand",
    collapse: "Hide",
  },
};

const money = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 2 });
const number = new Intl.NumberFormat("es-MX", { maximumFractionDigits: 2 });

function formatMoney(value) { return money.format(Number(value ?? 0)); }
function formatNumber(value, suffix = "") { return `${number.format(Number(value ?? 0))}${suffix}`; }
function withUuid(template, uuid) { return template.replace("{uuid}", uuid); }
function formatDateTime(value, language = "es") {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return new Intl.DateTimeFormat(language === "es" ? "es-MX" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed);
}

function isSameCalendarDay(value, year, month, day) {
  if (!value) return false;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return false;
  return (
    parsed.getFullYear() === year &&
    parsed.getMonth() === month &&
    parsed.getDate() === day
  );
}

function getHistoryEventAt(payload, year, month, day) {
  const candidates = [
    payload?.uploaded_at,
    payload?.last_processed_at,
    payload?.created_at,
    payload?.updated_at,
  ];

  const match = candidates.find((value) => isSameCalendarDay(value, year, month, day));
  return match || "";
}

function getDashboardTripsLabel(labels, period) {
  if (period === "week") return `${labels.todayTrips} · ${labels.periodWeek}`;
  if (period === "month") return `${labels.todayTrips} · ${labels.periodMonth}`;
  if (period === "year") return `${labels.todayTrips} · ${labels.periodYear}`;
  if (period === "custom") return `${labels.todayTrips} · ${labels.periodCustom}`;
  return `${labels.todayTrips} · ${labels.periodToday}`;
}

function getPeriodToken(labels, period) {
  if (period === "week") return labels.periodWeek;
  if (period === "month") return labels.periodMonth;
  if (period === "year") return labels.periodYear;
  if (period === "custom") return labels.periodCustom;
  return labels.periodToday;
}

function getPeriodMetricLabel(baseLabel, labels, period) {
  return `${baseLabel} · ${getPeriodToken(labels, period)}`;
}

function getServiceDisplayLabel(row) {
  const group = row?.service_group || "";
  const type = row?.service_type || "";

  if (type && group && type.toLowerCase() !== group.toLowerCase()) {
    return `${type} · ${group}`;
  }

  return type || group || "-";
}

function translateComboPart(part, language) {
  const value = String(part || "").trim();
  if (!value) return "-";

  const dictionary = language === "es"
    ? {
        monday: "Lunes",
        tuesday: "Martes",
        wednesday: "Miércoles",
        thursday: "Jueves",
        friday: "Viernes",
        saturday: "Sábado",
        sunday: "Domingo",
        morning: "Mañana",
        afternoon: "Tarde",
        night: "Noche",
        "late night": "Madrugada",
        late_night: "Madrugada",
      }
    : {
        lunes: "Monday",
        martes: "Tuesday",
        miércoles: "Wednesday",
        miercoles: "Wednesday",
        jueves: "Thursday",
        viernes: "Friday",
        sábado: "Saturday",
        sabado: "Saturday",
        domingo: "Sunday",
        mañana: "Morning",
        tarde: "Afternoon",
        noche: "Night",
        madrugada: "Late night",
      };

  return dictionary[value.toLowerCase()] || value;
}

function formatComboDisplayName(displayName, language) {
  if (!displayName) {
    return { service: "-", moment: "-" };
  }

  const [service, day, slot] = String(displayName).split("|").map((part) => part.trim());

  return {
    service: service || "-",
    moment: day || slot ? `${translateComboPart(day, language)} · ${translateComboPart(slot, language)}` : "-",
  };
}

function getComboTooltipRows(row, labels, language) {
  const combo = formatComboDisplayName(row?.display_name, language);
  const [, rawDay = "", rawSlot = ""] = String(row?.display_name || "").split("|").map((part) => part.trim());

  return [
    { label: labels.serviceDetail, value: combo.service },
    { label: labels.dayDetail, value: translateComboPart(rawDay, language) },
    { label: labels.slotDetail, value: translateComboPart(rawSlot, language) },
    { label: labels.tripsCount, value: formatNumber(row?.trips_count) },
    { label: labels.incomeDetail, value: formatMoney(row?.gross_amount_total) },
    { label: labels.allocatedCostDetail, value: formatMoney(row?.allocated_cost) },
    { label: labels.utility, value: formatMoney(row?.utility_amount) },
    { label: labels.roi, value: formatNumber(row?.adjusted_roi, "%") },
  ];
}

function getCostCategorySummary(entries) {
  const totals = {
    fuel: 0,
    maintenance: 0,
    tolls: 0,
    taxes: 0,
  };

  entries.forEach((entry) => {
    if (entry?.category in totals) {
      totals[entry.category] += Number(entry.amount || 0);
    }
  });

  return totals;
}

function getCostCategoryCountSummary(summary, options) {
  const optionMap = new Map(options.map((option) => [option.key, option.label]));

  return (summary?.cost_category_counts || [])
    .slice(0, 3)
    .map((row) => `${row.entries_count} ${optionMap.get(row.category) || row.category}`)
    .join(" · ");
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || payload.message || "Request failed.");
  return payload;
}

async function lookupExistingDetail(externalUuid) {
  if (!externalUuid) return null;
  const url = new URL(`${PAYLOADS_API_BASE}/detail-lookup/`);
  url.searchParams.set("external_uuid", externalUuid);
  return fetchJson(url.toString());
}

let leafletLoaderPromise = null;

function ensureLeafletLoaded() {
  if (window.L) return Promise.resolve(window.L);
  if (leafletLoaderPromise) return leafletLoaderPromise;

  leafletLoaderPromise = new Promise((resolve, reject) => {
    const existingStyle = document.getElementById("leaflet-style");
    if (!existingStyle) {
      const style = document.createElement("link");
      style.id = "leaflet-style";
      style.rel = "stylesheet";
      style.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(style);
    }

    const existingScript = document.getElementById("leaflet-script");
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(window.L));
      existingScript.addEventListener("error", () => reject(new Error("No fue posible cargar Leaflet.")));
      return;
    }

    const script = document.createElement("script");
    script.id = "leaflet-script";
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.onload = () => resolve(window.L);
    script.onerror = () => reject(new Error("No fue posible cargar Leaflet."));
    document.head.appendChild(script);
  });

  return leafletLoaderPromise;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function TripMap({ points, labels, displayMode, language }) {
  const mapElementRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const mapLayerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    ensureLeafletLoaded()
      .then((L) => {
        if (cancelled || !mapElementRef.current) return;

        if (!mapInstanceRef.current) {
          mapInstanceRef.current = L.map(mapElementRef.current, {
            zoomControl: true,
            scrollWheelZoom: true,
          }).setView([19.432608, -99.133209], 11);

          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "&copy; OpenStreetMap contributors",
          }).addTo(mapInstanceRef.current);

          mapLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current);
        }

        const map = mapInstanceRef.current;
        const layerGroup = mapLayerRef.current;
        const bounds = [];

        layerGroup.clearLayers();

        points.forEach((point) => {
          const pickup = point.pickup_lat != null && point.pickup_lng != null
            ? [Number(point.pickup_lat), Number(point.pickup_lng)]
            : null;
          const dropoff = point.dropoff_lat != null && point.dropoff_lng != null
            ? [Number(point.dropoff_lat), Number(point.dropoff_lng)]
            : null;

          const buildTooltipContent = ({ currentLabel, currentAddress, pairedLabel, pairedAddress }) => `
            <div class="map-popup">
              <strong>${escapeHtml(point.service_type || point.service_group || point.uuid)}</strong>
              <span>UUID: ${escapeHtml(point.uuid)}</span>
              <span>${escapeHtml(labels.requestedAt)}: ${escapeHtml(formatDateTime(point.requested_at, language))}</span>
              <span>${escapeHtml(labels.timeSlot)}: ${escapeHtml(point.time_bucket || "-")}</span>
              <span>${escapeHtml(labels.status)}: ${escapeHtml(point.status || "-")}</span>
              <span>${escapeHtml(labels.earningsAmount)}: ${escapeHtml(formatMoney(point.gross_amount))}</span>
              <span>${escapeHtml(currentLabel)}: ${escapeHtml(currentAddress || "-")}</span>
              <span>${escapeHtml(pairedLabel)}: ${escapeHtml(pairedAddress || "-")}</span>
            </div>
          `;

          if (pickup && displayMode !== "dropoff") {
            const tooltipContent = buildTooltipContent({
              currentLabel: labels.mapLegendPickup,
              currentAddress: point.pickup_address,
              pairedLabel: labels.mapLegendDropoff,
              pairedAddress: point.dropoff_address,
            });
            const pickupMarker = L.circleMarker(pickup, {
              radius: 6,
              color: "#22c55e",
              weight: 2,
              fillColor: "#22c55e",
              fillOpacity: 0.8,
            }).bindTooltip(tooltipContent, {
              direction: "top",
              sticky: true,
              opacity: 1,
              className: "map-tooltip",
            }).addTo(layerGroup);
            pickupMarker.on("mouseover", () => pickupMarker.openTooltip());
            bounds.push(pickup);
          }

          if (dropoff && displayMode !== "pickup") {
            const tooltipContent = buildTooltipContent({
              currentLabel: labels.mapLegendDropoff,
              currentAddress: point.dropoff_address,
              pairedLabel: labels.mapLegendPickup,
              pairedAddress: point.pickup_address,
            });
            const dropoffMarker = L.circleMarker(dropoff, {
              radius: 6,
              color: "#8b5cf6",
              weight: 2,
              fillColor: "#8b5cf6",
              fillOpacity: 0.8,
            }).bindTooltip(tooltipContent, {
              direction: "top",
              sticky: true,
              opacity: 1,
              className: "map-tooltip",
            }).addTo(layerGroup);
            dropoffMarker.on("mouseover", () => dropoffMarker.openTooltip());
            bounds.push(dropoff);
          }

          if (pickup && dropoff && displayMode === "both") {
            L.polyline([pickup, dropoff], {
              color: "#62d2b1",
              weight: 3,
              opacity: 0.55,
            }).addTo(layerGroup);
          }
        });

        if (bounds.length) {
          map.fitBounds(bounds, { padding: [28, 28], maxZoom: 14 });
        } else {
          map.setView([19.432608, -99.133209], 11);
        }

        window.setTimeout(() => map.invalidateSize(), 0);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [displayMode, labels, language, points]);

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        mapLayerRef.current = null;
      }
    };
  }, []);

  return (
    <div className="map-live-wrap">
      <div ref={mapElementRef} className="map-live" />
      {!points.length ? <div className="map-live__empty">{labels.mapEmpty}</div> : null}
      <div className="map-live__legend">
        {displayMode !== "dropoff" ? <span><i className="map-live__dot map-live__dot--pickup" />{labels.mapLegendPickup}</span> : null}
        {displayMode !== "pickup" ? <span><i className="map-live__dot map-live__dot--dropoff" />{labels.mapLegendDropoff}</span> : null}
      </div>
    </div>
  );
}

function buildMetricsUrl(path, filters) {
  const url = new URL(`${METRICS_API_BASE}/${path}`);
  if (filters.startDate) url.searchParams.set("start_date", filters.startDate);
  if (filters.endDate) url.searchParams.set("end_date", filters.endDate);
  return url.toString();
}

function toDateInputValue(date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDashboardPeriodFilters(period) {
  const now = new Date();
  const endDate = toDateInputValue(now);
  const start = new Date(now);

  if (period === "week") {
    start.setDate(now.getDate() - 6);
  } else if (period === "month") {
    start.setMonth(now.getMonth() - 1);
  } else if (period === "year") {
    start.setFullYear(now.getFullYear() - 1);
  }

  return {
    startDate: toDateInputValue(start),
    endDate,
  };
}

function parsePayloadInput(rawText) {
  if (!rawText.trim()) throw new Error("Pega un JSON válido antes de enviarlo.");
  try {
    return JSON.parse(rawText);
  } catch {
    throw new Error("El contenido no es un JSON válido.");
  }
}

function inferExternalUuid(parsedValue) {
  if (!parsedValue || typeof parsedValue !== "object" || Array.isArray(parsedValue)) return "";
  return parsedValue.external_uuid ?? parsedValue.uuid ?? parsedValue?.metadata?.uuid ?? "";
}

function normalizeBulkItems(parsedValue) {
  if (!Array.isArray(parsedValue) || parsedValue.length === 0) {
    throw new Error("Para carga masiva debes enviar un arreglo JSON con al menos un elemento.");
  }

  return parsedValue.map((item, index) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw new Error(`El item ${index + 1} no es un objeto JSON válido.`);
    }

    return "raw_data" in item
      ? { external_uuid: item.external_uuid ?? item.uuid ?? null, raw_data: item.raw_data }
      : { external_uuid: item.external_uuid ?? item.uuid ?? null, raw_data: item };
  });
}

function Login({ labels, credentials, setCredentials, onSubmit, busy }) {
  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="brand-mark">Uber</div>
        <h1>{labels.signIn}</h1>
        <p>{labels.loginCopy}</p>
        <form onSubmit={onSubmit} className="auth-form">
          <label><span>{labels.username}</span><input value={credentials.username} onChange={(e) => setCredentials((c) => ({ ...c, username: e.target.value }))} /></label>
          <label><span>{labels.password}</span><input type="password" value={credentials.password} onChange={(e) => setCredentials((c) => ({ ...c, password: e.target.value }))} /></label>
          <button type="submit">{busy ? labels.entering : labels.enter}</button>
        </form>
      </section>
    </main>
  );
}

function ShellCard({ title, subtitle, children, actions = null, collapsible = false, defaultCollapsed = false, labels = COPY.es, className = "" }) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  return (
    <section className={`shell-card ${className}`.trim()}>
      <div className="shell-card__head">
        <div><p>{subtitle}</p><h3>{title}</h3></div>
        <div className="shell-card__actions">
          {actions}
          {collapsible ? (
            <button className="ghost ghost--compact" type="button" onClick={() => setCollapsed((value) => !value)}>
              {collapsed ? labels.expand : labels.collapse}
            </button>
          ) : null}
        </div>
      </div>
      {!collapsed ? children : null}
    </section>
  );
}

function HelpTooltip({ label, text }) {
  return (
    <div className="tooltip">
      <button className="tooltip__trigger" type="button" aria-label={label}>
        ?
      </button>
      <div className="tooltip__content">
        <span>{text}</span>
      </div>
    </div>
  );
}

export default function App() {
  const [theme, setTheme] = useState(() => window.localStorage.getItem("uber-theme") || "dark");
  const [language, setLanguage] = useState(() => window.localStorage.getItem("uber-language") || "es");
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [authLoading, setAuthLoading] = useState(true);
  const [authBusy, setAuthBusy] = useState(false);
  const [user, setUser] = useState(null);
  const [dashboardPeriod, setDashboardPeriod] = useState("week");
  const [dashboardFilters, setDashboardFilters] = useState(() => getDashboardPeriodFilters("week"));
  const [dashboardDraftFilters, setDashboardDraftFilters] = useState(() => getDashboardPeriodFilters("week"));
  const [dashboardSummary, setDashboardSummary] = useState(null);
  const [dashboardServices, setDashboardServices] = useState([]);
  const [dashboardTrips, setDashboardTrips] = useState([]);
  const [dashboardCostSummary, setDashboardCostSummary] = useState(null);
  const [mapFilters, setMapFilters] = useState(() => getDashboardPeriodFilters("week"));
  const [mapDraftFilters, setMapDraftFilters] = useState(() => getDashboardPeriodFilters("week"));
  const [mapDisplayMode, setMapDisplayMode] = useState("both");
  const [mapPoints, setMapPoints] = useState([]);
  const [mapLoading, setMapLoading] = useState(true);
  const [costFilters, setCostFilters] = useState({ startDate: "", endDate: "" });
  const [costDraftFilters, setCostDraftFilters] = useState({ startDate: "", endDate: "" });
  const [costSummary, setCostSummary] = useState(null);
  const [costEntries, setCostEntries] = useState([]);
  const [costBusy, setCostBusy] = useState(false);
  const [costCsvBusy, setCostCsvBusy] = useState(false);
  const [costForm, setCostForm] = useState({
    category: "fuel",
    title: "",
    description: "",
    amount: "",
    costDate: toDateInputValue(new Date()),
  });
  const [costCsvFile, setCostCsvFile] = useState(null);
  const [filters, setFilters] = useState({ startDate: "", endDate: "" });
  const [draftFilters, setDraftFilters] = useState({ startDate: "", endDate: "" });
  const [summary, setSummary] = useState(null);
  const [services, setServices] = useState([]);
  const [timeBuckets, setTimeBuckets] = useState([]);
  const [trips, setTrips] = useState([]);
  const [runs, setRuns] = useState([]);
  const [queue, setQueue] = useState(null);
  const [payloads, setPayloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTick, setRefreshTick] = useState(0);
  const [busyAction, setBusyAction] = useState("");
  const [busyUpload, setBusyUpload] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadSummary, setUploadSummary] = useState(null);
  const [toast, setToast] = useState(null);
  const [lastDetailUuid, setLastDetailUuid] = useState("");
  const [uploads, setUploads] = useState({
    activity: { sourceName: "viajes-base", externalUuid: "", rawText: "", selectedFiles: [] },
    detail: { sourceName: "viajes-completos", externalUuid: "", rawText: "", selectedFiles: [] },
  });
  const labels = COPY[language] || COPY.es;
  const bestComboCard = formatComboDisplayName(dashboardCostSummary?.best_combo?.display_name, language);
  const worstComboCard = formatComboDisplayName(dashboardCostSummary?.worst_combo?.display_name, language);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem("uber-theme", theme);
  }, [theme]);

  useEffect(() => {
    window.localStorage.setItem("uber-language", language);
  }, [language]);

  useEffect(() => {
    if (!toast) return undefined;
    const timeoutId = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  useEffect(() => {
    let cancelled = false;
    fetchJson(`${AUTH_API_BASE}/auth/me/`, { credentials: "include" })
      .then((payload) => { if (!cancelled && payload.authenticated) setUser(payload.user); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setAuthLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!user) return undefined;
    let cancelled = false;
    if (!summary || !queue) {
      setLoading(true);
    }
    Promise.all([
      fetchJson(buildMetricsUrl("summary/", filters)),
      fetchJson(buildMetricsUrl("by-service/", filters)),
      fetchJson(buildMetricsUrl("by-time-bucket/", filters)),
      fetchJson(buildMetricsUrl("trips/", filters)),
      fetchJson(`${PROCESSING_API_BASE}/runs/`),
      fetchJson(`${PAYLOADS_API_BASE}/work-queue/`),
      fetchJson(`${PAYLOADS_API_BASE}/`),
    ])
      .then(([summaryData, serviceData, timeData, tripData, runsData, queueData, payloadData]) => {
        if (cancelled) return;
        setSummary(summaryData);
        setServices(serviceData);
        setTimeBuckets(timeData);
        setTrips(tripData);
        setRuns(runsData);
        setQueue(queueData);
        setPayloads(Array.isArray(payloadData) ? payloadData : []);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user, filters, refreshTick]);

  useEffect(() => {
    if (!user) return undefined;
    let cancelled = false;

    Promise.all([
      fetchJson(buildMetricsUrl("summary/", dashboardFilters)),
      fetchJson(buildMetricsUrl("by-service/", dashboardFilters)),
      fetchJson(buildMetricsUrl("trips/", dashboardFilters)),
      fetchJson(buildMetricsUrl("cost-dashboard/", dashboardFilters)),
    ]).then(([summaryData, serviceData, tripData, costSummaryData]) => {
      if (cancelled) return;
      setDashboardSummary(summaryData);
      setDashboardServices(serviceData);
      setDashboardTrips(tripData);
      setDashboardCostSummary(costSummaryData);
    });

    return () => { cancelled = true; };
  }, [user, dashboardFilters, refreshTick]);

  useEffect(() => {
    if (!user) return undefined;
    let cancelled = false;
    setMapLoading(true);

    fetchJson(buildMetricsUrl("map-points/", mapFilters))
      .then((rows) => {
        if (cancelled) return;
        setMapPoints(Array.isArray(rows) ? rows : []);
      })
      .finally(() => {
        if (!cancelled) setMapLoading(false);
      });

    return () => { cancelled = true; };
  }, [user, mapFilters, refreshTick]);

  useEffect(() => {
    if (!user) return undefined;
    let cancelled = false;

    Promise.all([
      fetchJson(buildMetricsUrl("cost-dashboard/", costFilters)),
      fetchJson(buildMetricsUrl("cost-entries/", costFilters)),
    ]).then(([summaryData, entriesData]) => {
      if (cancelled) return;
      setCostSummary(summaryData);
      setCostEntries(entriesData);
    });

    return () => { cancelled = true; };
  }, [user, costFilters, refreshTick]);

  const topMenus = useMemo(() => ([
    { key: "dashboard", label: labels.dashboard },
    { key: "trips", label: labels.trips },
    { key: "earnings", label: labels.earnings },
    { key: "costs", label: labels.costs },
    { key: "heatmaps", label: labels.heatmaps },
    { key: "reports", label: labels.reports },
    { key: "settings", label: labels.settings },
  ]), [labels]);

  const todaysPayloads = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const day = today.getDate();

    return payloads
      .map((payload) => ({
        ...payload,
        history_event_at: getHistoryEventAt(payload, year, month, day),
      }))
      .filter((payload) => Boolean(payload.history_event_at))
      .map((payload) => {
        const eventAt = new Date(payload.history_event_at);
        return { ...payload, history_event_at: Number.isNaN(eventAt.getTime()) ? payload.history_event_at : eventAt.toISOString() };
      })
      .sort((left, right) => new Date(right.history_event_at) - new Date(left.history_event_at));
  }, [payloads]);

  const dashboardPeriodOptions = useMemo(() => ([
    { key: "today", label: labels.periodToday },
    { key: "week", label: labels.periodWeek },
    { key: "month", label: labels.periodMonth },
    { key: "year", label: labels.periodYear },
  ]), [labels]);

  const costCategoryOptions = useMemo(() => ([
    { key: "fuel", label: labels.fuel },
    { key: "maintenance", label: labels.maintenance },
    { key: "tolls", label: labels.tolls },
    { key: "taxes", label: labels.taxes },
    { key: "verification", label: labels.verification },
    { key: "insurance", label: labels.insurance },
    { key: "other", label: labels.other },
  ]), [labels]);
  const dashboardCostCategorySummary = useMemo(
    () => getCostCategoryCountSummary(dashboardCostSummary, costCategoryOptions),
    [dashboardCostSummary, costCategoryOptions],
  );

  const costCategorySummary = useMemo(() => getCostCategorySummary(costEntries), [costEntries]);
  const mapSummary = useMemo(() => {
    const pickupTrips = mapPoints.filter((point) => point.pickup_lat != null && point.pickup_lng != null);
    const dropoffTrips = mapPoints.filter((point) => point.dropoff_lat != null && point.dropoff_lng != null);
    const routesVisible = mapPoints.filter(
      (point) => point.pickup_lat != null && point.pickup_lng != null && point.dropoff_lat != null && point.dropoff_lng != null,
    ).length;
    const tripsWithCoordinates = mapDisplayMode === "pickup"
      ? pickupTrips.length
      : mapDisplayMode === "dropoff"
        ? dropoffTrips.length
        : mapPoints.length;

    return {
      tripsWithCoordinates,
      pickupPoints: mapDisplayMode === "dropoff" ? 0 : pickupTrips.length,
      dropoffPoints: mapDisplayMode === "pickup" ? 0 : dropoffTrips.length,
      routesVisible: mapDisplayMode === "both" ? routesVisible : 0,
    };
  }, [mapDisplayMode, mapPoints]);

  async function login(event) {
    event.preventDefault();
    setAuthBusy(true);
    try {
      const payload = await fetchJson(`${AUTH_API_BASE}/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(credentials),
      });
      setUser(payload.user);
      setCredentials({ username: "", password: "" });
    } finally {
      setAuthBusy(false);
    }
  }

  async function logout() {
    await fetchJson(`${AUTH_API_BASE}/auth/logout/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({}),
    }).catch(() => {});
    setUser(null);
  }

  async function runAction(url, key, successMessage = "") {
    setBusyAction(key);
    try {
      await fetchJson(url, { method: "POST" });
      if (successMessage) {
        setToast({ tone: "success", message: successMessage });
      }
      setRefreshTick((v) => v + 1);
    } catch (error) {
      setToast({ tone: "error", message: error.message });
      throw error;
    } finally {
      setBusyAction("");
    }
  }

  function updateUploadState(payloadType, field, nextValue) {
    setUploads((current) => ({
      ...current,
      [payloadType]: {
        ...current[payloadType],
        [field]: nextValue,
      },
    }));
  }

  async function saveCostEntry(event) {
    event.preventDefault();
    setCostBusy(true);
    try {
      await fetchJson(`${METRICS_API_BASE}/cost-entries/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: costForm.category,
          title: costForm.title,
          description: costForm.description,
          amount: costForm.amount,
          cost_date: costForm.costDate,
        }),
      });
      setToast({ tone: "success", message: labels.costSavedSuccess });
      setCostForm({
        category: "fuel",
        title: "",
        description: "",
        amount: "",
        costDate: toDateInputValue(new Date()),
      });
      setRefreshTick((v) => v + 1);
    } catch (error) {
      setToast({ tone: "error", message: error.message });
    } finally {
      setCostBusy(false);
    }
  }

  async function uploadCostCsv(event) {
    event.preventDefault();
    if (!costCsvFile) {
      setToast({ tone: "error", message: labels.chooseCsvFile });
      return;
    }

    setCostCsvBusy(true);
    try {
      const formData = new FormData();
      formData.append("file", costCsvFile);

      await fetchJson(`${METRICS_API_BASE}/cost-entries/upload-csv/`, {
        method: "POST",
        body: formData,
      });

      setCostCsvFile(null);
      setToast({ tone: "success", message: labels.csvImportedSuccess });
      setRefreshTick((v) => v + 1);
    } catch (error) {
      setToast({ tone: "error", message: error.message });
    } finally {
      setCostCsvBusy(false);
    }
  }

  async function handleFileSelection(payloadType, event) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    try {
      if (payloadType === "detail" && files.length > 1) {
        const parsedFiles = await Promise.all(
          files.map(async (file) => {
            const parsed = parsePayloadInput(await file.text());
            if (Array.isArray(parsed)) throw new Error(`El archivo ${file.name} contiene un arreglo JSON. Usa un objeto por archivo.`);
            return { fileName: file.name, external_uuid: inferExternalUuid(parsed) || null, raw_data: parsed };
          }),
        );
        updateUploadState(payloadType, "selectedFiles", parsedFiles);
        updateUploadState(payloadType, "sourceName", `bulk-detail-files-${parsedFiles.length}`);
        updateUploadState(payloadType, "rawText", "");
        updateUploadState(payloadType, "externalUuid", "");
        setUploadMessage(`${parsedFiles.length} ${labels.filesReady}`);
        return;
      }

      const file = files[0];
      const text = await file.text();
      const parsed = parsePayloadInput(text);
      updateUploadState(payloadType, "selectedFiles", []);
      updateUploadState(payloadType, "rawText", text);
      updateUploadState(payloadType, "sourceName", file.name);
      const inferredUuid = Array.isArray(parsed) ? "" : inferExternalUuid(parsed);
      if (inferredUuid) updateUploadState(payloadType, "externalUuid", inferredUuid);
      setUploadMessage(file.name);
    } catch (error) {
      setUploadMessage(error.message);
    }
  }

  async function handleDroppedFiles(payloadType, files) {
    if (!files?.length) return;
    await handleFileSelection(payloadType, { target: { files } });
  }

  async function sendPayloadUpload(payloadType) {
    const form = uploads[payloadType];
    setBusyUpload(payloadType);
    setUploadMessage("");
    setUploadSummary(null);
    try {
      let uploadedUuid = "";
      if (payloadType === "detail" && form.selectedFiles.length > 0) {
        const result = await fetchJson(`${PAYLOADS_API_BASE}/upload-bulk/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            payload_type: payloadType,
            source_name: form.sourceName,
            items: form.selectedFiles.map((item) => ({ external_uuid: item.external_uuid, raw_data: item.raw_data })),
          }),
        });
        setUploadSummary(result.summary || null);
        uploadedUuid = form.selectedFiles.length === 1 ? (form.selectedFiles[0].external_uuid || "") : "";
      } else {
        const parsed = parsePayloadInput(form.rawText);
        if (Array.isArray(parsed)) {
          const result = await fetchJson(`${PAYLOADS_API_BASE}/upload-bulk/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              payload_type: payloadType,
              source_name: form.sourceName,
              items: normalizeBulkItems(parsed),
            }),
          });
          setUploadSummary(result.summary || null);
          uploadedUuid = parsed.length === 1 ? (parsed[0]?.external_uuid ?? parsed[0]?.uuid ?? "") : "";
        } else {
          uploadedUuid = form.externalUuid || inferExternalUuid(parsed) || "";
          if (payloadType === "detail" && uploadedUuid) {
            const existingDetail = await lookupExistingDetail(uploadedUuid);
            if (existingDetail?.found && existingDetail?.payload?.has_real_payload) {
              const isProcessed = existingDetail.payload.processing_status === "processed";
              const duplicateMessage = isProcessed
                ? withUuid(labels.detailAlreadyProcessedUuid, uploadedUuid)
                : withUuid(labels.detailAlreadyPendingUuid, uploadedUuid);

              setUploadMessage(duplicateMessage);
              setToast({ tone: "error", message: duplicateMessage });
              return;
            }
          }
          await fetchJson(`${PAYLOADS_API_BASE}/upload/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              payload_type: payloadType,
              source_name: form.sourceName,
              external_uuid: form.externalUuid || inferExternalUuid(parsed) || null,
              raw_data: parsed,
            }),
          });
          setUploadSummary({
            total_received: 1,
            created: 1,
            updated: 0,
            duplicates: 0,
            failed: 0,
          });
        }
      }

      setUploads((current) => ({
        ...current,
        [payloadType]: { ...current[payloadType], externalUuid: "", rawText: "", selectedFiles: [] },
      }));
      setUploadMessage(payloadType === "activity" ? labels.uploadActivities : labels.uploadDetails);
      if (payloadType === "detail") {
        setLastDetailUuid(uploadedUuid);
        setToast({
          tone: "success",
          message: uploadedUuid ? withUuid(labels.detailUploadSuccessUuid, uploadedUuid) : labels.detailUploadSuccess,
        });
      }
      setRefreshTick((v) => v + 1);
    } catch (error) {
      setUploadMessage(error.message);
      setToast({ tone: "error", message: error.message });
    } finally {
      setBusyUpload("");
    }
  }

  if (authLoading) return <main className="loading">{labels.checking}</main>;
  if (!user) return <Login labels={labels} credentials={credentials} setCredentials={setCredentials} onSubmit={login} busy={authBusy} />;
  if ((loading && (!summary || !queue || !dashboardSummary || !dashboardCostSummary)) || !summary || !queue || !dashboardSummary || !dashboardCostSummary) {
    return <main className="loading">{labels.loading}</main>;
  }

  return (
    <main className="product-shell">
      {toast ? <div className={`toast toast--${toast.tone}`}>{toast.message}</div> : null}
      <header className="topbar">
        <div className="brand-mark">Uber</div>
        <nav className="topnav">
          {topMenus.map((item) => (
            <button key={item.key} className={activeMenu === item.key ? "topnav__item topnav__item--active" : "topnav__item"} onClick={() => setActiveMenu(item.key)}>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="topbar__actions">
          <button onClick={() => setLanguage((current) => (current === "es" ? "en" : "es"))}>{labels.lang}</button>
          <button onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}>{theme === "dark" ? labels.light : labels.dark}</button>
          <button onClick={logout}>{labels.signOut}</button>
        </div>
      </header>

      <section className="content-grid">
        {activeMenu === "dashboard" ? (
          <>
            <div className="stat-grid stat-grid--five">
              <ShellCard title={formatMoney(dashboardCostSummary?.period_income)} subtitle={getPeriodMetricLabel(labels.periodIncome, labels, dashboardPeriod)} />
              <ShellCard title={formatMoney(dashboardCostSummary?.period_cost)} subtitle={getPeriodMetricLabel(labels.periodCost, labels, dashboardPeriod)} />
              <ShellCard title={formatMoney(dashboardCostSummary?.period_utility)} subtitle={getPeriodMetricLabel(labels.periodUtility, labels, dashboardPeriod)} />
              <ShellCard title={formatNumber(dashboardCostSummary?.adjusted_roi, "%")} subtitle={getPeriodMetricLabel(labels.adjustedRoi, labels, dashboardPeriod)} />
              <ShellCard title={formatNumber(dashboardCostSummary?.cost_entries_count)} subtitle={getPeriodMetricLabel(labels.periodCostEntries, labels, dashboardPeriod)}>
                <div className="mini-kpis">
                  <span>{dashboardCostCategorySummary || labels.empty}</span>
                </div>
              </ShellCard>
            </div>
            <div className="period-strip">
              <span>{labels.dashboardPeriod}</span>
              <div className="period-strip__actions">
                {dashboardPeriodOptions.map((option) => (
                  <button
                    key={option.key}
                    className={dashboardPeriod === option.key ? "period-chip period-chip--active" : "period-chip"}
                    type="button"
                    onClick={() => {
                      const nextFilters = getDashboardPeriodFilters(option.key);
                      setDashboardPeriod(option.key);
                      setDashboardDraftFilters(nextFilters);
                      setDashboardFilters(nextFilters);
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="filter-strip">
              <label><span>{labels.from}</span><input type="date" value={dashboardDraftFilters.startDate} onChange={(e) => setDashboardDraftFilters((current) => ({ ...current, startDate: e.target.value }))} /></label>
              <label><span>{labels.to}</span><input type="date" value={dashboardDraftFilters.endDate} onChange={(e) => setDashboardDraftFilters((current) => ({ ...current, endDate: e.target.value }))} /></label>
              <button type="button" onClick={() => { setDashboardPeriod("custom"); setDashboardFilters(dashboardDraftFilters); }}>{labels.apply}</button>
              <button
                className="ghost"
                type="button"
                onClick={() => {
                  const nextFilters = getDashboardPeriodFilters("week");
                  setDashboardPeriod("week");
                  setDashboardDraftFilters(nextFilters);
                  setDashboardFilters(nextFilters);
                }}
              >
                {labels.clear}
              </button>
            </div>
            <div className="stat-grid">
              <ShellCard title={formatNumber(dashboardSummary.completed_trips)} subtitle={getDashboardTripsLabel(labels, dashboardPeriod)}>
                <div className="mini-kpis">
                  <span><strong>{labels.completedTrips}:</strong> {formatNumber(dashboardSummary.completed_trips)}</span>
                  <span><strong>{labels.canceledTrips}:</strong> {formatNumber(dashboardSummary.canceled_trips)}</span>
                  <span><strong>{labels.totalTripsLabel}:</strong> {formatNumber(dashboardSummary.total_trips)}</span>
                </div>
              </ShellCard>
              <ShellCard title={formatNumber(dashboardSummary.total_trips)} subtitle={labels.totalTrips}><span className="stat-foot">{formatNumber(dashboardSummary.completion_rate, "%")}</span></ShellCard>
              <ShellCard title={formatMoney(dashboardSummary.gross_per_trip)} subtitle={labels.avgFare}><span className="stat-foot">{formatNumber(dashboardSummary.average_duration_minutes, " min")}</span></ShellCard>
              <ShellCard title={formatMoney(dashboardSummary.total_gross_amount)} subtitle={labels.todayEarnings}><span className="stat-foot">{formatMoney(dashboardSummary.gross_per_hour)}</span></ShellCard>
            </div>
            <div className="dashboard-grid">
              <ShellCard title={labels.recentTrips} subtitle={labels.dashboard}>
                <div className="list-table">
                  {dashboardTrips.slice(0, 5).map((trip) => <div key={trip.uuid} className="list-row"><strong>{trip.uuid}</strong><span>{trip.service_type}</span><span>{formatMoney(trip.gross_amount)}</span></div>)}
                </div>
              </ShellCard>
              <ShellCard title={labels.serviceMix} subtitle={labels.earnings}>
                <div className="bars">
                  {dashboardServices.slice(0, 5).map((row) => <div key={`${row.service_group}-${row.service_type}`} className="bar-row"><span>{getServiceDisplayLabel(row)}</span><div className="bar"><i style={{ width: `${Math.max(12, Number(row.trips_count) * 8)}px` }} /></div><strong>{row.trips_count}</strong></div>)}
                </div>
              </ShellCard>
              <ShellCard
                title={labels.processingStatus}
                subtitle={labels.reports}
                actions={(
                  <div className="action-with-help">
                    <button
                      className="ghost"
                      type="button"
                      onClick={() => runAction(`${PROCESSING_API_BASE}/activities/run/`, "pipeline").then(() => runAction(`${PROCESSING_API_BASE}/details/run/`, "pipeline", labels.metricsPrepareSuccess))}
                    >
                      {busyAction === "pipeline" ? "..." : labels.runPipeline}
                    </button>
                    <HelpTooltip label={labels.tooltip} text={labels.prepareMetricsHelp} />
                  </div>
                )}
              >
                <div className="mini-grid">
                  <div><span>{labels.step2}</span><strong>{queue.summary.pending_download_count}</strong></div>
                  <div><span>{labels.step3}</span><strong>{queue.summary.uploaded_pending_processing_count}</strong></div>
                  <div><span>{labels.step4}</span><strong>{queue.summary.processed_detail_count}</strong></div>
                </div>
              </ShellCard>
            </div>
            <ShellCard title={labels.topCombos} subtitle={labels.costSummary} className="shell-card--overflow-visible">
              <div className="list-table">
                {(dashboardCostSummary?.top_combos || []).map((row, index) => (
                  <div key={`${row.display_name}-${index}`} className="list-row list-row--tooltip">
                    <strong>{index + 1}. {row.display_name}</strong>
                    <span>{labels.tripsCount}: {row.trips_count} · {labels.roi}: {formatNumber(row.adjusted_roi, "%")}</span>
                    <span>{labels.utility}: {formatMoney(row.utility_amount)}</span>
                    <div className="list-row__tooltip">
                      {getComboTooltipRows(row, labels, language).map((item) => (
                        <div key={`${row.display_name}-${item.label}`} className="list-row__tooltip-item">
                          <span>{item.label}</span>
                          <strong>{item.value}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ShellCard>
            <div className="feature-grid">
              <ShellCard title={formatMoney(dashboardCostSummary?.average_monthly_utility)} subtitle={labels.averageMonthlyUtility} />
              <ShellCard title={bestComboCard.service} subtitle={labels.bestCombo}>
                <div className="mini-kpis">
                  <span>{bestComboCard.moment}</span>
                </div>
                <span className="stat-foot">{formatMoney(dashboardCostSummary?.best_combo?.utility_amount)}</span>
              </ShellCard>
              <ShellCard title={worstComboCard.service} subtitle={labels.worstCombo}>
                <div className="mini-kpis">
                  <span>{worstComboCard.moment}</span>
                </div>
                <span className="stat-foot">{formatMoney(dashboardCostSummary?.worst_combo?.utility_amount)}</span>
              </ShellCard>
              <ShellCard title={formatNumber(dashboardCostSummary?.cost_entries_count)} subtitle={getPeriodMetricLabel(labels.periodCostEntries, labels, dashboardPeriod)} />
            </div>
          </>
        ) : null}

        {activeMenu === "trips" ? (
          <div className="section-stack">
            <div className="feature-grid">
              <ShellCard title={labels.allTrips} subtitle={labels.trips}><p>{labels.service}: UberTrip</p></ShellCard>
              <ShellCard title={labels.tripDetail} subtitle={labels.trips}><p>UberTrip + RawPayload.raw_data</p></ShellCard>
              <ShellCard title={labels.advancedSearch} subtitle={labels.trips}><p>Rango, status, servicio, distancia y ganancia.</p></ShellCard>
              <ShellCard title={labels.exportData} subtitle={labels.trips}><p>CSV / Excel</p></ShellCard>
            </div>
            <ShellCard title={labels.allTrips} subtitle={labels.trips}>
              <div className="filter-strip">
                <label><span>{labels.from}</span><input type="date" value={draftFilters.startDate} onChange={(e) => setDraftFilters((c) => ({ ...c, startDate: e.target.value }))} /></label>
                <label><span>{labels.to}</span><input type="date" value={draftFilters.endDate} onChange={(e) => setDraftFilters((c) => ({ ...c, endDate: e.target.value }))} /></label>
                <button onClick={() => setFilters(draftFilters)}>{labels.apply}</button>
                <button className="ghost" onClick={() => { const empty = { startDate: "", endDate: "" }; setDraftFilters(empty); setFilters(empty); }}>{labels.clear}</button>
              </div>
              <div className="table-wrap">
                <table><thead><tr><th>UUID</th><th>{labels.service}</th><th>{labels.distance}</th><th>{labels.duration}</th><th>{labels.earningsAmount}</th><th>{labels.status}</th></tr></thead><tbody>{trips.map((trip) => <tr key={trip.uuid}><td>{trip.uuid}</td><td>{trip.service_type}</td><td>{formatNumber(trip.distance_km, " km")}</td><td>{formatNumber(trip.duration_minutes, " min")}</td><td>{formatMoney(trip.gross_amount)}</td><td>{trip.status}</td></tr>)}</tbody></table>
              </div>
            </ShellCard>
          </div>
        ) : null}

        {activeMenu === "earnings" ? (
          <div className="section-stack">
            <div className="feature-grid">
              <ShellCard title={labels.dailyEarnings} subtitle={labels.earnings}><strong>{formatMoney(summary.total_gross_amount)}</strong></ShellCard>
              <ShellCard title={labels.weeklyMonthly} subtitle={labels.earnings}><strong>{formatMoney(summary.gross_per_hour)}</strong></ShellCard>
              <ShellCard title={labels.byService} subtitle={labels.earnings}><strong>{services.length}</strong></ShellCard>
              <ShellCard title={labels.trends} subtitle={labels.earnings}><strong>{timeBuckets.length}</strong></ShellCard>
            </div>
            <div className="dashboard-grid">
              <ShellCard title={labels.byService} subtitle={labels.earnings}>
                <div className="bars">
                  {services.map((row) => <div key={`${row.service_group}-${row.service_type}`} className="bar-row"><span>{getServiceDisplayLabel(row)}</span><div className="bar"><i style={{ width: `${Math.max(18, Number(row.gross_amount_total) * 4)}px` }} /></div><strong>{formatMoney(row.gross_amount_total)}</strong></div>)}
                </div>
              </ShellCard>
              <ShellCard title={labels.trends} subtitle={labels.earnings}>
                <div className="bars">
                  {timeBuckets.map((row) => <div key={row.time_bucket} className="bar-row"><span>{row.time_bucket || "-"}</span><div className="bar"><i style={{ width: `${Math.max(18, Number(row.trips_count) * 18)}px` }} /></div><strong>{row.trips_count}</strong></div>)}
                </div>
              </ShellCard>
            </div>
          </div>
        ) : null}

        {activeMenu === "costs" ? (
          <div className="section-stack">
            <div className="filter-strip">
              <label><span>{labels.from}</span><input type="date" value={costDraftFilters.startDate} onChange={(e) => setCostDraftFilters((c) => ({ ...c, startDate: e.target.value }))} /></label>
              <label><span>{labels.to}</span><input type="date" value={costDraftFilters.endDate} onChange={(e) => setCostDraftFilters((c) => ({ ...c, endDate: e.target.value }))} /></label>
              <button onClick={() => setCostFilters(costDraftFilters)}>{labels.apply}</button>
              <button className="ghost" onClick={() => { const empty = { startDate: "", endDate: "" }; setCostDraftFilters(empty); setCostFilters(empty); }}>{labels.clear}</button>
            </div>
            <div className="feature-grid">
              <ShellCard title={formatMoney(costCategorySummary.taxes)} subtitle={labels.taxes} />
              <ShellCard title={formatMoney(costCategorySummary.fuel)} subtitle={labels.fuel} />
              <ShellCard title={formatMoney(costCategorySummary.maintenance)} subtitle={labels.maintenance} />
              <ShellCard title={formatMoney(costCategorySummary.tolls)} subtitle={labels.tolls} />
            </div>
            <div className="dashboard-grid dashboard-grid--costs">
              <ShellCard title={labels.addCost} subtitle={labels.costSummary}>
                <div className="section-stack">
                  <form className="upload-form" onSubmit={uploadCostCsv}>
                    <label><span>{labels.uploadCostsCsv}</span><input type="file" accept=".csv,text/csv" onChange={(e) => setCostCsvFile(e.target.files?.[0] || null)} /></label>
                    <button type="submit">{costCsvBusy ? labels.sending : labels.uploadCostsCsv}</button>
                  </form>
                  <form className="upload-form" onSubmit={saveCostEntry}>
                    <label>
                      <span>{labels.category}</span>
                      <select value={costForm.category} onChange={(e) => setCostForm((current) => ({ ...current, category: e.target.value }))}>
                        {costCategoryOptions.map((option) => <option key={option.key} value={option.key}>{option.label}</option>)}
                      </select>
                    </label>
                    <label><span>{labels.title}</span><input value={costForm.title} onChange={(e) => setCostForm((current) => ({ ...current, title: e.target.value }))} /></label>
                    <label><span>{labels.description}</span><textarea rows="5" value={costForm.description} onChange={(e) => setCostForm((current) => ({ ...current, description: e.target.value }))} /></label>
                    <label><span>{labels.amount}</span><input type="number" step="0.01" value={costForm.amount} onChange={(e) => setCostForm((current) => ({ ...current, amount: e.target.value }))} /></label>
                    <label><span>{labels.costDate}</span><input type="date" value={costForm.costDate} onChange={(e) => setCostForm((current) => ({ ...current, costDate: e.target.value }))} /></label>
                    <button type="submit">{costBusy ? labels.sending : labels.saveCost}</button>
                  </form>
                </div>
              </ShellCard>
              <ShellCard title={labels.costSummary} subtitle={labels.recentCosts}>
                <div className="mini-grid">
                  <div><span>{labels.taxes}</span><strong>{formatMoney(costCategorySummary.taxes)}</strong></div>
                  <div><span>{labels.fuel}</span><strong>{formatMoney(costCategorySummary.fuel)}</strong></div>
                  <div><span>{labels.maintenance}</span><strong>{formatMoney(costCategorySummary.maintenance)}</strong></div>
                  <div><span>{labels.tolls}</span><strong>{formatMoney(costCategorySummary.tolls)}</strong></div>
                </div>
              </ShellCard>
            </div>
            <ShellCard title={labels.recentCosts} subtitle={labels.costSummary}>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>{labels.costDate}</th><th>{labels.category}</th><th>{labels.title}</th><th>{labels.amount}</th></tr>
                  </thead>
                  <tbody>
                    {costEntries.length ? costEntries.map((entry) => (
                      <tr key={entry.id}>
                        <td>{entry.cost_date}</td>
                        <td>{costCategoryOptions.find((option) => option.key === entry.category)?.label || entry.category}</td>
                        <td>{entry.title}</td>
                        <td>{formatMoney(entry.amount)}</td>
                      </tr>
                    )) : <tr><td colSpan="4">{labels.empty}</td></tr>}
                  </tbody>
                </table>
              </div>
            </ShellCard>
          </div>
        ) : null}

        {activeMenu === "heatmaps" ? (
          <div className="section-stack">
            <div className="filter-strip">
              <label><span>{labels.from}</span><input type="date" value={mapDraftFilters.startDate} onChange={(e) => setMapDraftFilters((current) => ({ ...current, startDate: e.target.value }))} /></label>
              <label><span>{labels.to}</span><input type="date" value={mapDraftFilters.endDate} onChange={(e) => setMapDraftFilters((current) => ({ ...current, endDate: e.target.value }))} /></label>
              <div className="filter-strip__group">
                <span>{labels.mapDisplayLabel}</span>
                <div className="chip-row">
                  <button className={`period-chip ${mapDisplayMode === "pickup" ? "period-chip--active" : ""}`} type="button" onClick={() => setMapDisplayMode("pickup")}>{labels.mapShowPickup}</button>
                  <button className={`period-chip ${mapDisplayMode === "dropoff" ? "period-chip--active" : ""}`} type="button" onClick={() => setMapDisplayMode("dropoff")}>{labels.mapShowDropoff}</button>
                  <button className={`period-chip ${mapDisplayMode === "both" ? "period-chip--active" : ""}`} type="button" onClick={() => setMapDisplayMode("both")}>{labels.mapShowBoth}</button>
                </div>
              </div>
              <button type="button" onClick={() => setMapFilters(mapDraftFilters)}>{labels.apply}</button>
              <button className="ghost" type="button" onClick={() => { const nextFilters = getDashboardPeriodFilters("week"); setMapDraftFilters(nextFilters); setMapFilters(nextFilters); }}>{labels.clear}</button>
            </div>
            <div className="feature-grid">
              <ShellCard title={formatNumber(mapSummary.tripsWithCoordinates)} subtitle={labels.mapTripsWithCoords} />
              <ShellCard title={formatNumber(mapSummary.pickupPoints)} subtitle={labels.pickupHotspots} />
              <ShellCard title={formatNumber(mapSummary.dropoffPoints)} subtitle={labels.dropoffHotspots} />
              <ShellCard title={formatNumber(mapSummary.routesVisible)} subtitle={labels.mapRoutesVisible} />
            </div>
            <ShellCard title={labels.tripsHeatmap} subtitle={labels.heatmaps}>
              {mapLoading ? <div className="map-live__empty map-live__empty--static">{labels.mapLoading}</div> : <TripMap points={mapPoints} labels={labels} displayMode={mapDisplayMode} language={language} />}
            </ShellCard>
          </div>
        ) : null}

        {activeMenu === "reports" ? (
          <div className="section-stack">
            <div className="feature-grid">
              <ShellCard title={labels.processingRuns} subtitle={labels.reports}><strong>{runs.length}</strong></ShellCard>
              <ShellCard title={labels.dataQuality} subtitle={labels.reports}><strong>{payloads.length}</strong></ShellCard>
              <ShellCard title={labels.customReports} subtitle={labels.reports}><p>Earnings / zonas / eficiencia</p></ShellCard>
              <ShellCard title={labels.exportReports} subtitle={labels.reports}><p>PDF / CSV</p></ShellCard>
            </div>
            <div className="dashboard-grid">
              <ShellCard title={labels.processingRuns} subtitle={labels.reports}>
                <div className="table-wrap">
                  <table><thead><tr><th>{labels.type}</th><th>{labels.status}</th><th>Total</th><th>OK</th><th>Fail</th></tr></thead><tbody>{runs.map((run) => <tr key={run.id}><td>{run.process_type}</td><td>{run.status}</td><td>{run.total_records}</td><td>{run.processed_records}</td><td>{run.failed_records}</td></tr>)}</tbody></table>
                </div>
              </ShellCard>
              <ShellCard title={labels.dataQuality} subtitle={labels.reports}>
                <div className="mini-grid">
                  <div><span>Pending downloads</span><strong>{queue.summary.pending_download_count}</strong></div>
                  <div><span>Uploaded pending</span><strong>{queue.summary.uploaded_pending_processing_count}</strong></div>
                  <div><span>{labels.step4}</span><strong>{queue.summary.processed_detail_count}</strong></div>
                </div>
              </ShellCard>
            </div>
          </div>
        ) : null}

        {activeMenu === "settings" ? (
          <div className="section-stack">
            <div className="dashboard-grid dashboard-grid--settings">
              <ShellCard title={labels.uploadActivitiesForTrips} subtitle={labels.settings} collapsible labels={labels}>
                <div className="upload-form">
                  <label><span>{labels.batchName}</span><input value={uploads.activity.sourceName} onChange={(e) => updateUploadState("activity", "sourceName", e.target.value)} /></label>
                  <label><span>{labels.optionalUuid}</span><input value={uploads.activity.externalUuid} onChange={(e) => updateUploadState("activity", "externalUuid", e.target.value)} /></label>
                  <div className="dropzone" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); handleDroppedFiles("activity", Array.from(e.dataTransfer.files || [])); }}>
                    <strong>{labels.dropJson}</strong>
                    <span>{labels.dropHint}</span>
                  </div>
                  <label><span>{labels.chooseJsonFile}</span><input type="file" accept=".json,application/json" onChange={(e) => handleFileSelection("activity", e)} /></label>
                  <label><span>{labels.pasteActivityJson}</span><textarea rows="8" value={uploads.activity.rawText} onChange={(e) => updateUploadState("activity", "rawText", e.target.value)} /></label>
                  <div className="action-stack">
                    <button onClick={() => sendPayloadUpload("activity")}>{busyUpload === "activity" ? labels.sending : labels.uploadActivities}</button>
                    <div className="action-with-help">
                      <button className="ghost" onClick={() => runAction(`${PROCESSING_API_BASE}/activities/run/`, "activities", labels.activityProcessSuccess)}>{busyAction === "activities" ? "..." : labels.runActivities}</button>
                      <HelpTooltip label={labels.tooltip} text={labels.extractTripsHelp} />
                    </div>
                  </div>
                </div>
              </ShellCard>
              <ShellCard title={labels.recentTodayHistory} subtitle={labels.settings} collapsible labels={labels}>
                <div className="table-wrap">
                  <table><thead><tr><th>{labels.type}</th><th>UUID</th><th>{labels.status}</th><th>{labels.uploaded}</th></tr></thead><tbody>{todaysPayloads.length ? todaysPayloads.map((payload) => <tr key={`${payload.payload_type}-${payload.id}`}><td>{payload.payload_type}</td><td>{payload.external_uuid || "-"}</td><td>{payload.processing_status}</td><td>{payload.history_event_at}</td></tr>) : <tr><td colSpan="4">{labels.empty}</td></tr>}</tbody></table>
                </div>
              </ShellCard>
            </div>

            <div className="dashboard-grid dashboard-grid--settings">
              <ShellCard
                title={labels.uploadActivityDetails}
                subtitle={labels.settings}
                collapsible
                labels={labels}
                actions={(
                  <div className="tooltip">
                    <button className="ghost ghost--compact" type="button">{labels.tooltip}</button>
                    <div className="tooltip__content">
                      <strong>{labels.detailsHelpIntro}</strong>
                      <span>{labels.detailsHelpFile}</span>
                      <span>{labels.detailsHelpBulk}</span>
                      <span>{labels.detailsHelpPaste}</span>
                      <span>{labels.detailsHelpRequired}</span>
                    </div>
                  </div>
                )}
              >
                <div className="upload-form">
                  <label><span>{labels.batchName}</span><input value={uploads.detail.sourceName} onChange={(e) => updateUploadState("detail", "sourceName", e.target.value)} /></label>
                  <label><span>{labels.optionalManualUuid}</span><input value={uploads.detail.externalUuid} onChange={(e) => updateUploadState("detail", "externalUuid", e.target.value)} /></label>
                  <div className="dropzone" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); handleDroppedFiles("detail", Array.from(e.dataTransfer.files || [])); }}>
                    <strong>{labels.dropJson}</strong>
                    <span>{labels.dropHint}</span>
                  </div>
                  <label><span>{labels.chooseManyJson}</span><input type="file" accept=".json,application/json" multiple onChange={(e) => handleFileSelection("detail", e)} /></label>
                  {uploads.detail.selectedFiles.length > 0 ? <p className="upload-help">{uploads.detail.selectedFiles.length} {labels.filesReady}</p> : null}
                  <label><span>{labels.pasteDetailJson}</span><textarea rows="8" value={uploads.detail.rawText} onChange={(e) => updateUploadState("detail", "rawText", e.target.value)} /></label>
                  <div className="action-stack">
                    <button onClick={() => sendPayloadUpload("detail")}>{busyUpload === "detail" ? labels.sending : labels.uploadDetails}</button>
                    <div className="action-with-help">
                      <button className="ghost" onClick={() => runAction(`${PROCESSING_API_BASE}/details/run/`, "details", lastDetailUuid ? withUuid(labels.detailProcessSuccessUuid, lastDetailUuid) : labels.detailProcessSuccess)}>{busyAction === "details" ? "..." : labels.runDetails}</button>
                      <HelpTooltip label={labels.tooltip} text={labels.processTripsHelp} />
                    </div>
                  </div>
                </div>
              </ShellCard>
              <ShellCard title={labels.pendingUuidList} subtitle={labels.settings} collapsible labels={labels} actions={<button className="ghost" onClick={() => navigator.clipboard?.writeText(queue.pending_download_items.map((item) => item.external_uuid).filter(Boolean).join("\n"))}>{labels.copyUuids}</button>}>
                <p className="upload-help">{labels.pendingUuidHelp}</p>
                <div className="table-wrap">
                  <table><thead><tr><th>UUID</th><th>{labels.status}</th><th>{labels.uploaded}</th></tr></thead><tbody>{queue.pending_download_items.map((item) => <tr key={`pending-${item.id}`}><td>{item.external_uuid}</td><td>{item.processing_status}</td><td>{item.uploaded_at || "-"}</td></tr>)}</tbody></table>
                </div>
              </ShellCard>
            </div>

            <div className="dashboard-grid dashboard-grid--settings-bottom">
              <ShellCard title={labels.lastUpload} subtitle={labels.settings} collapsible defaultCollapsed labels={labels}>
                {uploadSummary ? (
                  <div className="mini-grid">
                    <div><span>{labels.totalReceived}</span><strong>{uploadSummary.total_received ?? 0}</strong></div>
                    <div><span>{labels.created}</span><strong>{uploadSummary.created ?? 0}</strong></div>
                    <div><span>{labels.updated}</span><strong>{uploadSummary.updated ?? 0}</strong></div>
                    <div><span>{labels.duplicates}</span><strong>{uploadSummary.duplicates ?? 0}</strong></div>
                    <div><span>{labels.failed}</span><strong>{uploadSummary.failed ?? 0}</strong></div>
                  </div>
                ) : (
                  <p>{labels.empty}</p>
                )}
              </ShellCard>
              <ShellCard title={labels.dataSources} subtitle={labels.settings} collapsible defaultCollapsed labels={labels}>
                <div className="mini-grid">
                  <div><span>{labels.step2}</span><strong>{queue.summary.pending_download_count}</strong></div>
                  <div><span>{labels.step3}</span><strong>{queue.summary.uploaded_pending_processing_count}</strong></div>
                  <div><span>{labels.step4}</span><strong>{queue.summary.processed_detail_count}</strong></div>
                </div>
              </ShellCard>
            </div>
            {uploadMessage ? <div className="upload-status">{uploadMessage}</div> : null}
          </div>
        ) : null}
      </section>
    </main>
  );
}
