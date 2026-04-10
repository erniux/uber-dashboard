import { useEffect, useMemo, useState } from "react";

const API_ROOT = import.meta.env.VITE_API_ROOT ?? "http://127.0.0.1:8000/api";
const METRICS_API_BASE = `${API_ROOT}/metrics`;
const PAYLOADS_API_BASE = `${API_ROOT}/payloads`;
const PROCESSING_API_BASE = `${API_ROOT}/processing`;
const AUTH_API_BASE = API_ROOT;

const COPY = {
  es: {
    dashboard: "Dashboard",
    trips: "Trips",
    earnings: "Earnings",
    heatmaps: "Heatmaps",
    reports: "Reports",
    settings: "Settings",
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
    todayTrips: "Viajes hoy",
    totalTrips: "Viajes totales",
    avgFare: "Tarifa promedio",
    todayEarnings: "Ganancias totales",
    recentTrips: "Viajes recientes",
    serviceMix: "Trips by Service",
    processingStatus: "Estado del pipeline",
    step2: "Pendientes por descargar",
    step3: "Detalles listos para procesar",
    step4: "Viajes normalizados",
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
    processingRuns: "Processing Runs",
    dataQuality: "Data Quality",
    customReports: "Custom Reports",
    exportReports: "Export Reports",
    systemConfig: "System Config",
    processingControls: "Processing Controls",
    userSettings: "User Settings",
    dataSources: "Data Sources",
    uploadActivities: "Subir activities",
    uploadDetails: "Subir details",
    activityPayloads: "Payloads de activities",
    detailPayloads: "Payloads de details",
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
    runActivities: "Preparar viajes base",
    runDetails: "Procesar viajes completos",
    runPipeline: "Ejecutar flujo completo",
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
  },
  en: {
    dashboard: "Dashboard",
    trips: "Trips",
    earnings: "Earnings",
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
    todayTrips: "Trips today",
    totalTrips: "Total trips",
    avgFare: "Average fare",
    todayEarnings: "Total earnings",
    recentTrips: "Recent Trips",
    serviceMix: "Trips by Service",
    processingStatus: "Pipeline status",
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
    runActivities: "Prepare base trips",
    runDetails: "Process full trips",
    runPipeline: "Run full flow",
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
  },
};

const money = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 2 });
const number = new Intl.NumberFormat("es-MX", { maximumFractionDigits: 2 });

function formatMoney(value) { return money.format(Number(value ?? 0)); }
function formatNumber(value, suffix = "") { return `${number.format(Number(value ?? 0))}${suffix}`; }

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || payload.message || "Request failed.");
  return payload;
}

function buildMetricsUrl(path, filters) {
  const url = new URL(`${METRICS_API_BASE}/${path}`);
  if (filters.startDate) url.searchParams.set("start_date", filters.startDate);
  if (filters.endDate) url.searchParams.set("end_date", filters.endDate);
  return url.toString();
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

function ShellCard({ title, subtitle, children, actions = null }) {
  return (
    <section className="shell-card">
      <div className="shell-card__head">
        <div><p>{subtitle}</p><h3>{title}</h3></div>
        {actions}
      </div>
      {children}
    </section>
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
  const [uploads, setUploads] = useState({
    activity: { sourceName: "viajes-base", externalUuid: "", rawText: "", selectedFiles: [] },
    detail: { sourceName: "viajes-completos", externalUuid: "", rawText: "", selectedFiles: [] },
  });
  const labels = COPY[language] || COPY.es;

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem("uber-theme", theme);
  }, [theme]);

  useEffect(() => {
    window.localStorage.setItem("uber-language", language);
  }, [language]);

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
    setLoading(true);
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
        setPayloads(Array.isArray(payloadData) ? payloadData.slice(0, 8) : []);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user, filters, refreshTick]);

  const topMenus = useMemo(() => ([
    { key: "dashboard", label: labels.dashboard },
    { key: "trips", label: labels.trips },
    { key: "earnings", label: labels.earnings },
    { key: "heatmaps", label: labels.heatmaps },
    { key: "reports", label: labels.reports },
    { key: "settings", label: labels.settings },
  ]), [labels]);

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

  async function runAction(url, key) {
    setBusyAction(key);
    try {
      await fetchJson(url, { method: "POST" });
      setRefreshTick((v) => v + 1);
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
        } else {
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
      setRefreshTick((v) => v + 1);
    } catch (error) {
      setUploadMessage(error.message);
    } finally {
      setBusyUpload("");
    }
  }

  if (authLoading) return <main className="loading">{labels.checking}</main>;
  if (!user) return <Login labels={labels} credentials={credentials} setCredentials={setCredentials} onSubmit={login} busy={authBusy} />;
  if (loading || !summary || !queue) return <main className="loading">{labels.loading}</main>;

  return (
    <main className="product-shell">
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
            <div className="stat-grid">
              <ShellCard title={formatNumber(summary.completed_trips)} subtitle={labels.todayTrips}><span className="stat-foot">{formatMoney(summary.gross_per_trip)}</span></ShellCard>
              <ShellCard title={formatNumber(summary.total_trips)} subtitle={labels.totalTrips}><span className="stat-foot">{formatNumber(summary.completion_rate, "%")}</span></ShellCard>
              <ShellCard title={formatMoney(summary.gross_per_trip)} subtitle={labels.avgFare}><span className="stat-foot">{formatNumber(summary.average_duration_minutes, " min")}</span></ShellCard>
              <ShellCard title={formatMoney(summary.total_gross_amount)} subtitle={labels.todayEarnings}><span className="stat-foot">{formatMoney(summary.gross_per_hour)}</span></ShellCard>
            </div>
            <div className="dashboard-grid">
              <ShellCard title={labels.recentTrips} subtitle={labels.dashboard}>
                <div className="list-table">
                  {trips.slice(0, 5).map((trip) => <div key={trip.uuid} className="list-row"><strong>{trip.uuid}</strong><span>{trip.service_type}</span><span>{formatMoney(trip.gross_amount)}</span></div>)}
                </div>
              </ShellCard>
              <ShellCard title={labels.serviceMix} subtitle={labels.earnings}>
                <div className="bars">
                  {services.slice(0, 5).map((row) => <div key={`${row.service_group}-${row.service_type}`} className="bar-row"><span>{row.service_group}</span><div className="bar"><i style={{ width: `${Math.max(12, Number(row.trips_count) * 8)}px` }} /></div><strong>{row.trips_count}</strong></div>)}
                </div>
              </ShellCard>
              <ShellCard title={labels.processingStatus} subtitle={labels.reports}>
                <div className="mini-grid">
                  <div><span>{labels.step2}</span><strong>{queue.summary.pending_download_count}</strong></div>
                  <div><span>{labels.step3}</span><strong>{queue.summary.uploaded_pending_processing_count}</strong></div>
                  <div><span>{labels.step4}</span><strong>{queue.summary.processed_detail_count}</strong></div>
                </div>
              </ShellCard>
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
                  {services.map((row) => <div key={`${row.service_group}-${row.service_type}`} className="bar-row"><span>{row.service_group}</span><div className="bar"><i style={{ width: `${Math.max(18, Number(row.gross_amount_total) * 4)}px` }} /></div><strong>{formatMoney(row.gross_amount_total)}</strong></div>)}
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

        {activeMenu === "heatmaps" ? (
          <div className="section-stack">
            <div className="feature-grid">
              <ShellCard title={labels.tripsHeatmap} subtitle={labels.heatmaps}><p>pickup_lat / pickup_lng</p></ShellCard>
              <ShellCard title={labels.pickupHotspots} subtitle={labels.heatmaps}><p>Demanda por zonas</p></ShellCard>
              <ShellCard title={labels.dropoffHotspots} subtitle={labels.heatmaps}><p>Finalización por zonas</p></ShellCard>
              <ShellCard title={labels.timeHeatmap} subtitle={labels.heatmaps}><p>hour_of_day / day_of_week</p></ShellCard>
            </div>
            <ShellCard title={labels.tripsHeatmap} subtitle={labels.heatmaps}>
              <div className="map-placeholder">
                <div className="map-glow map-glow--one" />
                <div className="map-glow map-glow--two" />
                <div className="map-glow map-glow--three" />
              </div>
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
            <div className="feature-grid">
              <ShellCard title={labels.systemConfig} subtitle={labels.settings}><p>Timezone, currency y formato.</p></ShellCard>
              <ShellCard title={labels.processingControls} subtitle={labels.settings}><p>Conectado a /processing/*</p></ShellCard>
              <ShellCard title={labels.userSettings} subtitle={labels.settings}><p>Tema e idioma</p></ShellCard>
              <ShellCard title={labels.dataSources} subtitle={labels.settings}><p>Payloads y rutas de importación</p></ShellCard>
            </div>
            <div className="dashboard-grid dashboard-grid--settings">
              <ShellCard title={labels.activityPayloads} subtitle={labels.uploadActivities}>
                <div className="upload-form">
                  <label><span>{labels.batchName}</span><input value={uploads.activity.sourceName} onChange={(e) => updateUploadState("activity", "sourceName", e.target.value)} /></label>
                  <label><span>{labels.optionalUuid}</span><input value={uploads.activity.externalUuid} onChange={(e) => updateUploadState("activity", "externalUuid", e.target.value)} /></label>
                  <div className="dropzone" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); handleDroppedFiles("activity", Array.from(e.dataTransfer.files || [])); }}>
                    <strong>{labels.dropJson}</strong>
                    <span>{labels.dropHint}</span>
                  </div>
                  <label><span>{labels.chooseJsonFile}</span><input type="file" accept=".json,application/json" onChange={(e) => handleFileSelection("activity", e)} /></label>
                  <label><span>{labels.pasteActivityJson}</span><textarea rows="8" value={uploads.activity.rawText} onChange={(e) => updateUploadState("activity", "rawText", e.target.value)} /></label>
                  <button onClick={() => sendPayloadUpload("activity")}>{busyUpload === "activity" ? labels.sending : labels.uploadActivities}</button>
                </div>
              </ShellCard>
              <ShellCard title={labels.detailPayloads} subtitle={labels.uploadDetails}>
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
                  <button onClick={() => sendPayloadUpload("detail")}>{busyUpload === "detail" ? labels.sending : labels.uploadDetails}</button>
                </div>
              </ShellCard>
            </div>
            <div className="dashboard-grid">
              <ShellCard title={labels.processingControls} subtitle={labels.settings}>
                <div className="action-stack">
                  <button onClick={() => runAction(`${PROCESSING_API_BASE}/activities/run/`, "activities")}>{busyAction === "activities" ? "..." : labels.runActivities}</button>
                  <button onClick={() => runAction(`${PROCESSING_API_BASE}/details/run/`, "details")}>{busyAction === "details" ? "..." : labels.runDetails}</button>
                  <button onClick={() => runAction(`${PROCESSING_API_BASE}/activities/run/`, "pipeline").then(() => runAction(`${PROCESSING_API_BASE}/details/run/`, "pipeline"))}>{busyAction === "pipeline" ? "..." : labels.runPipeline}</button>
                </div>
              </ShellCard>
              <ShellCard title={labels.userSettings} subtitle={labels.settings}>
                <div className="action-stack">
                  <button onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}>{theme === "dark" ? labels.light : labels.dark}</button>
                  <button onClick={() => setLanguage((current) => (current === "es" ? "en" : "es"))}>{labels.lang}</button>
                </div>
              </ShellCard>
            </div>
            <div className="dashboard-grid dashboard-grid--settings">
              <ShellCard title={labels.lastUpload} subtitle={labels.settings}>
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
              <ShellCard title={labels.uploadHistory} subtitle={labels.settings}>
                <div className="table-wrap">
                  <table><thead><tr><th>{labels.type}</th><th>UUID</th><th>{labels.status}</th><th>{labels.uploaded}</th></tr></thead><tbody>{payloads.map((payload) => <tr key={`${payload.payload_type}-${payload.id}`}><td>{payload.payload_type}</td><td>{payload.external_uuid || "-"}</td><td>{payload.processing_status}</td><td>{payload.uploaded_at}</td></tr>)}</tbody></table>
                </div>
              </ShellCard>
            </div>
            <div className="dashboard-grid dashboard-grid--settings">
              <ShellCard title={labels.pendingUuidList} subtitle={labels.settings} actions={<button className="ghost" onClick={() => navigator.clipboard?.writeText(queue.pending_download_items.map((item) => item.external_uuid).filter(Boolean).join("\n"))}>{labels.copyUuids}</button>}>
                <p className="upload-help">{labels.pendingUuidHelp}</p>
                <div className="table-wrap">
                  <table><thead><tr><th>UUID</th><th>{labels.status}</th><th>{labels.uploaded}</th></tr></thead><tbody>{queue.pending_download_items.map((item) => <tr key={`pending-${item.id}`}><td>{item.external_uuid}</td><td>{item.processing_status}</td><td>{item.uploaded_at || "-"}</td></tr>)}</tbody></table>
                </div>
              </ShellCard>
              <ShellCard title={labels.dataSources} subtitle={labels.settings}>
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
