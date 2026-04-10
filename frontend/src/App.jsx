import { useEffect, useState } from "react";

const METRICS_API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000/api/metrics";
const PAYLOADS_API_BASE = import.meta.env.VITE_PAYLOADS_API_BASE_URL ?? "http://127.0.0.1:8000/api/payloads";
const PROCESSING_API_BASE =
  import.meta.env.VITE_PROCESSING_API_BASE_URL ?? "http://127.0.0.1:8000/api/processing";

const currencyFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 2,
});

const decimalFormatter = new Intl.NumberFormat("es-MX", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

function buildMetricsUrl(path, filters) {
  const url = new URL(`${METRICS_API_BASE}/${path}`);

  if (filters.startDate) {
    url.searchParams.set("start_date", filters.startDate);
  }

  if (filters.endDate) {
    url.searchParams.set("end_date", filters.endDate);
  }

  return url.toString();
}

function formatMoney(value) {
  return currencyFormatter.format(Number(value ?? 0));
}

function formatDecimal(value, suffix = "") {
  return `${decimalFormatter.format(Number(value ?? 0))}${suffix}`;
}

function KpiCard({ eyebrow, title, value, tone = "default" }) {
  return (
    <article className={`kpi-card kpi-card--${tone}`}>
      <p className="eyebrow">{eyebrow}</p>
      <h3>{title}</h3>
      <strong>{value}</strong>
    </article>
  );
}

async function copyText(text) {
  if (!text) {
    return;
  }

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

function PanelShell({ eyebrow, title, children, defaultCollapsed = false, actions = null, className = "" }) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <section className={`panel ${className}`}>
      <div className="panel-heading">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
        </div>
        <div className="panel-actions">
          {actions}
          <button
            className="ghost-button ghost-button--compact"
            type="button"
            onClick={() => setCollapsed((value) => !value)}
          >
            {collapsed ? "Expandir" : "Ocultar"}
          </button>
        </div>
      </div>

      {!collapsed ? children : null}
    </section>
  );
}

function DataTable({ title, columns, rows, emptyMessage, eyebrow = "Detalle", defaultCollapsed = false }) {
  return (
    <PanelShell eyebrow={eyebrow} title={title} defaultCollapsed={defaultCollapsed}>
      {rows.length === 0 ? (
        <p className="empty-state">{emptyMessage}</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column.key}>{column.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={`${title}-${index}`}>
                  {columns.map((column) => (
                    <td key={column.key}>{column.render ? column.render(row[column.key], row) : row[column.key]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PanelShell>
  );
}

async function copyListToClipboard(rows) {
  const text = rows.map((row) => row.external_uuid).filter(Boolean).join("\n");
  await copyText(text);
}

function QueuePanel({ title, eyebrow, caption, rows, buttonLabel }) {
  async function handleCopy() {
    await copyListToClipboard(rows);
  }

  return (
    <PanelShell
      eyebrow={eyebrow}
      title={title}
      className="panel--queue"
      defaultCollapsed={rows.length > 10}
      actions={
        <button className="ghost-button ghost-button--compact" type="button" onClick={handleCopy} disabled={!rows.length}>
          {buttonLabel}
        </button>
      }
    >
      {rows.length === 0 ? <p className="empty-state">{caption}</p> : (
        <>
          <p className="queue-caption">{caption}</p>
          <div className="uuid-chip-list">
            {rows.map((row) => (
              <div key={row.id} className="uuid-chip">
                <code>{row.external_uuid}</code>
                <button
                  type="button"
                  className="chip-copy"
                  onClick={() => copyText(row.external_uuid)}
                  title={`Copiar ${row.external_uuid}`}
                >
                  Copiar
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </PanelShell>
  );
}

function WorkflowStatusPanel({ queueSummary }) {
  const cards = [
    { label: "Paso 1 · Activities por procesar", value: queueSummary.pending_activity_count },
    { label: "Paso 2 · UUIDs detail por descargar", value: queueSummary.pending_download_count },
    { label: "Paso 3 · Details reales subidos", value: queueSummary.uploaded_pending_processing_count },
    { label: "Paso 4 · Details procesados", value: queueSummary.processed_detail_count },
  ];

  return (
    <PanelShell eyebrow="Estado del flujo" title="¿En dónde estás parado?" className="panel--workflow">
      <div className="workflow-grid">
        {cards.map((card) => (
          <div key={card.label} className="workflow-card">
            <span>{card.label}</span>
            <strong>{formatDecimal(card.value)}</strong>
          </div>
        ))}
      </div>
    </PanelShell>
  );
}

function WorkflowGuidePanel() {
  const steps = [
    "Paso 1: sube los chunks de activities y procesalos.",
    "Paso 2: usa los UUIDs generados para descargar manualmente los details desde Uber.",
    "Paso 3: sube los payloads reales de details al sistema.",
    "Paso 4: procesa esos details reales para convertirlos en UberTrip.",
  ];

  return (
    <section className="panel panel--guide">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Cómo leer esto</p>
          <h2>Guía rápida del flujo</h2>
        </div>
      </div>

      <div className="guide-list">
        {steps.map((step) => (
          <p key={step}>{step}</p>
        ))}
      </div>

      <p className="guide-note">
        Nota importante: en la base de datos puede haber muchos `detail` con status `pending`, pero eso no significa
        que todos estén listos para procesarse. Los placeholders vacíos siguen en paso 2 hasta que subas su JSON real.
      </p>
    </section>
  );
}

function DetailLookupPanel({ lookupUuid, setLookupUuid, lookupResult, lookupLoading, onLookup }) {
  function renderStatus() {
    if (!lookupResult) {
      return "Escribe un UUID detail para saber exactamente en qué paso va.";
    }

    if (!lookupResult.found) {
      return lookupResult.message;
    }

    const stepLabels = {
      step_2_pending_download: "Paso 2 · Por descargar desde Uber",
      step_3_uploaded: "Paso 3 · Detail subido y pendiente de procesar",
      step_4_processed: "Paso 4 · Detail procesado",
    };

    return stepLabels[lookupResult.current_step] || "Estado desconocido";
  }

  return (
    <section className="panel panel--lookup">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Rastreo por UUID</p>
          <h2>Buscar un detail específico</h2>
        </div>
      </div>

      <div className="lookup-form">
        <input
          value={lookupUuid}
          onChange={(event) => setLookupUuid(event.target.value)}
          placeholder="Pega aquí un UUID detail"
        />
        <button className="action-button" type="button" onClick={onLookup} disabled={lookupLoading}>
          {lookupLoading ? "Buscando..." : "Buscar"}
        </button>
      </div>

      <div className="lookup-result">
        <p>{renderStatus()}</p>
        {lookupResult?.found ? (
          <div className="lookup-meta">
            <div>
              <span>Status</span>
              <strong>{lookupResult.payload.processing_status}</strong>
            </div>
            <div>
              <span>Intentos</span>
              <strong>{lookupResult.payload.processing_attempts}</strong>
            </div>
            <div>
              <span>Origen</span>
              <strong title={lookupResult.payload.source_name || "Sin origen"}>
                {lookupResult.payload.source_name || "Sin origen"}
              </strong>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function DetailQueuePanel({ pendingDownloadRows, uploadedPendingRows, queueSummary }) {
  return (
    <>
      <WorkflowStatusPanel queueSummary={queueSummary} />
      <WorkflowGuidePanel />
      <div className="table-grid">
        <QueuePanel
          title="Detail UUIDs por descargar"
          eyebrow="Paso 2"
          caption="Estos UUIDs todavía no tienen payload real dentro del sistema. Por eso pueden seguir apareciendo como pending en SQL y Process details no los cambia."
          rows={pendingDownloadRows}
          buttonLabel="Copiar UUIDs"
        />
        <QueuePanel
          title="Paso 3 · Details subidos"
          eyebrow="Paso 3"
          caption="Estos sí son los details reales que ya subiste. Aquí sí funciona el botón Process details para moverlos al paso 4."
          rows={uploadedPendingRows}
          buttonLabel="Copiar UUIDs"
        />
      </div>
    </>
  );
}

function inferQueueMessage(queueSummary) {
  if (queueSummary.pending_activity_count > 0) {
    return "Tienes activities pendientes por procesar. Ese es el paso 1.";
  }

  if (queueSummary.pending_download_count > 0) {
    return "Tienes UUIDs detail por descargar. Es normal que esos placeholders sigan en pending hasta que subas el JSON real.";
  }

  if (queueSummary.uploaded_pending_processing_count > 0) {
    return "Ya estás en el paso 3. Esos details reales sí pasarán al paso 4 cuando ejecutes Process details.";
  }

  if (queueSummary.processed_detail_count > 0) {
    return "El flujo ya avanzó hasta details procesados. Puedes revisar métricas o cargar nuevos chunks.";
  }

  return "Aún no hay actividad en el pipeline. Empieza subiendo activities.";
}

function parsePayloadInput(rawText) {
  if (!rawText.trim()) {
    throw new Error("Pega un JSON válido antes de enviarlo.");
  }

  try {
    return JSON.parse(rawText);
  } catch (error) {
    throw new Error("El contenido no es un JSON válido.");
  }
}

function normalizeBulkItems(parsedValue) {
  if (!Array.isArray(parsedValue) || parsedValue.length === 0) {
    throw new Error("Para carga masiva debes enviar un arreglo JSON con al menos un elemento.");
  }

  return parsedValue.map((item, index) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw new Error(`El item ${index + 1} no es un objeto JSON válido.`);
    }

    if ("raw_data" in item) {
      return {
        external_uuid: item.external_uuid ?? item.uuid ?? null,
        raw_data: item.raw_data,
      };
    }

    return {
      external_uuid: item.external_uuid ?? item.uuid ?? null,
      raw_data: item,
    };
  });
}

function inferExternalUuid(parsedValue) {
  if (!parsedValue || typeof parsedValue !== "object" || Array.isArray(parsedValue)) {
    return "";
  }

  return parsedValue.external_uuid ?? parsedValue.uuid ?? parsedValue?.metadata?.uuid ?? "";
}

function UploadPanel({
  title,
  payloadType,
  value,
  sourceName,
  externalUuid,
  selectedFilesCount,
  onChange,
  onPickFile,
  onSubmit,
  busy,
}) {
  const isDetail = payloadType === "detail";
  const [collapsed, setCollapsed] = useState(payloadType === "detail");

  return (
    <section className="sidebar-card">
      <div className="sidebar-card__header">
        <div>
          <p className="eyebrow">Carga</p>
          <h3>{title}</h3>
        </div>
        <div className="panel-actions">
          <span className="pill">{payloadType}</span>
          <button
            className="ghost-button ghost-button--compact"
            type="button"
            onClick={() => setCollapsed((value) => !value)}
          >
            {collapsed ? "Expandir" : "Ocultar"}
          </button>
        </div>
      </div>

      {!collapsed ? (
        <>
          <label className="field">
            <span>Nombre del lote</span>
            <input value={sourceName} onChange={(event) => onChange("sourceName", event.target.value)} />
          </label>

          <label className="field">
            <span>{isDetail ? "UUID opcional para carga manual" : "UUID opcional"}</span>
            <input value={externalUuid} onChange={(event) => onChange("externalUuid", event.target.value)} />
          </label>

          <label className="field">
            <span>{isDetail ? "Seleccionar varios archivos `.json`" : "Seleccionar archivo `.json`"}</span>
            <input
              type="file"
              accept=".json,application/json"
              multiple={isDetail}
              onChange={onPickFile}
            />
          </label>

          {isDetail && selectedFilesCount > 0 ? (
            <p className="helper-text">{selectedFilesCount} archivo(s) listos para carga masiva.</p>
          ) : null}

          <label className="field">
            <span>
              {isDetail
                ? "Pega un objeto JSON, un arreglo JSON o usa selección múltiple de archivos"
                : "Pega un objeto JSON para carga individual o un arreglo JSON para carga masiva"}
            </span>
            <textarea rows="10" value={value} onChange={(event) => onChange("rawText", event.target.value)} />
          </label>

          <button className="action-button" type="button" onClick={onSubmit} disabled={busy}>
            {busy ? "Enviando..." : "Subir archivo"}
          </button>
        </>
      ) : null}
    </section>
  );
}

function ActionPanel({ onRunActivities, onRunDetails, onRunPipeline, busyAction }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <section className="sidebar-card">
      <div className="sidebar-card__header">
        <div>
          <p className="eyebrow">Acciones</p>
          <h3>Siguiente paso</h3>
        </div>
        <button
          className="ghost-button ghost-button--compact"
          type="button"
          onClick={() => setCollapsed((value) => !value)}
        >
          {collapsed ? "Expandir" : "Ocultar"}
        </button>
      </div>

      {!collapsed ? (
        <div className="stacked-actions">
          <button
            className="action-button"
            type="button"
            onClick={onRunActivities}
            disabled={busyAction === "activities" || busyAction === "pipeline"}
          >
            {busyAction === "activities" ? "Preparando..." : "Preparar viajes base"}
          </button>

          <button
            className="action-button"
            type="button"
            onClick={onRunDetails}
            disabled={busyAction === "details" || busyAction === "pipeline"}
          >
            {busyAction === "details" ? "Procesando..." : "Procesar viajes completos"}
          </button>

          <button
            className="action-button action-button--dark"
            type="button"
            onClick={onRunPipeline}
            disabled={busyAction === "pipeline"}
          >
            {busyAction === "pipeline" ? "Corriendo flujo..." : "Ejecutar flujo completo"}
          </button>
        </div>
      ) : null}
    </section>
  );
}

export default function App() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") {
      return "light";
    }

    const storedTheme = window.localStorage.getItem("uber-dashboard-theme");
    if (storedTheme === "dark" || storedTheme === "light") {
      return storedTheme;
    }

    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  const [filters, setFilters] = useState({ startDate: "", endDate: "" });
  const [draftFilters, setDraftFilters] = useState({ startDate: "", endDate: "" });
  const [uploads, setUploads] = useState({
    activity: { sourceName: "viajes-base", externalUuid: "", rawText: "", selectedFiles: [] },
    detail: { sourceName: "viajes-completos", externalUuid: "", rawText: "", selectedFiles: [] },
  });
  const [summary, setSummary] = useState(null);
  const [serviceRows, setServiceRows] = useState([]);
  const [timeBucketRows, setTimeBucketRows] = useState([]);
  const [dailyRows, setDailyRows] = useState([]);
  const [recentPayloads, setRecentPayloads] = useState([]);
  const [detailQueue, setDetailQueue] = useState({
    summary: {
      pending_activity_count: 0,
      pending_download_count: 0,
      uploaded_pending_processing_count: 0,
      processed_detail_count: 0,
    },
    pending_download_items: [],
    uploaded_pending_processing_items: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshTick, setRefreshTick] = useState(0);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [busyUpload, setBusyUpload] = useState("");
  const [busyAction, setBusyAction] = useState("");
  const [lookupUuid, setLookupUuid] = useState("");
  const [lookupResult, setLookupResult] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem("uber-dashboard-theme", theme);
  }, [theme]);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setLoading(true);
      setError("");

      try {
        const [summaryResponse, serviceResponse, timeBucketResponse, dailyResponse, payloadsResponse, detailQueueResponse] =
          await Promise.all([
            fetch(buildMetricsUrl("summary/", filters)),
            fetch(buildMetricsUrl("by-service/", filters)),
            fetch(buildMetricsUrl("by-time-bucket/", filters)),
            fetch(buildMetricsUrl("by-day/", filters)),
            fetch(`${PAYLOADS_API_BASE}/`),
            fetch(`${PAYLOADS_API_BASE}/work-queue/`),
          ]);

        const responses = [
          summaryResponse,
          serviceResponse,
          timeBucketResponse,
          dailyResponse,
          payloadsResponse,
          detailQueueResponse,
        ];
        const failedResponse = responses.find((response) => !response.ok);

        if (failedResponse) {
          const payload = await failedResponse.json().catch(() => ({}));
          throw new Error(payload.error || "No fue posible cargar el dashboard.");
        }

        const [summaryData, serviceData, timeBucketData, dailyData, payloadsData, detailQueueData] = await Promise.all(
          responses.map((response) => response.json()),
        );

        if (cancelled) {
          return;
        }

        setSummary(summaryData);
        setServiceRows(serviceData);
        setTimeBucketRows(timeBucketData);
        setDailyRows(dailyData);
        setRecentPayloads(Array.isArray(payloadsData) ? payloadsData.slice(0, 8) : []);
        setDetailQueue(
          detailQueueData && typeof detailQueueData === "object" && !Array.isArray(detailQueueData)
            ? detailQueueData
            : {
                summary: {
                  pending_activity_count: 0,
                  pending_download_count: 0,
                  uploaded_pending_processing_count: 0,
                  processed_detail_count: 0,
                },
                pending_download_items: [],
                uploaded_pending_processing_items: [],
              },
        );
      } catch (fetchError) {
        if (!cancelled) {
          setError(fetchError.message || "Ocurrió un error al cargar el dashboard.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [filters, refreshTick]);

  function handleSubmit(event) {
    event.preventDefault();
    setFilters(draftFilters);
  }

  function resetFilters() {
    const nextFilters = { startDate: "", endDate: "" };
    setDraftFilters(nextFilters);
    setFilters(nextFilters);
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

    if (files.length === 0) {
      return;
    }

    try {
      if (payloadType === "detail" && files.length > 1) {
        const parsedFiles = await Promise.all(
          files.map(async (file) => {
            const text = await file.text();
            const parsed = parsePayloadInput(text);
            if (Array.isArray(parsed)) {
              throw new Error(`El archivo ${file.name} contiene un arreglo JSON. Para selección múltiple usa un objeto por archivo.`);
            }

            return {
              fileName: file.name,
              external_uuid: inferExternalUuid(parsed) || null,
              raw_data: parsed,
            };
          }),
        );

        updateUploadState(payloadType, "selectedFiles", parsedFiles);
        updateUploadState(payloadType, "sourceName", `bulk-detail-files-${parsedFiles.length}`);
        updateUploadState(payloadType, "rawText", "");
        updateUploadState(payloadType, "externalUuid", "");
        setActionMessage(`${parsedFiles.length} archivos detail listos para carga masiva.`);
        return;
      }

      const file = files[0];
      const text = await file.text();
      const parsed = parsePayloadInput(text);

      updateUploadState(payloadType, "selectedFiles", []);
      updateUploadState(payloadType, "rawText", text);

      const inferredUuid = Array.isArray(parsed) ? "" : inferExternalUuid(parsed);
      if (inferredUuid) {
        updateUploadState(payloadType, "externalUuid", inferredUuid);
      }

      updateUploadState(payloadType, "sourceName", file.name);
      setActionMessage(`Archivo ${file.name} listo para ${payloadType}.`);
    } catch (fileError) {
      setActionMessage(fileError.message);
    }
  }

  async function sendPayloadUpload(payloadType) {
    const form = uploads[payloadType];
    setBusyUpload(payloadType);
    setActionMessage("");

    try {
      if (payloadType === "detail" && form.selectedFiles.length > 0) {
        const response = await fetch(`${PAYLOADS_API_BASE}/upload-bulk/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            payload_type: payloadType,
            source_name: form.sourceName,
            items: form.selectedFiles.map((item) => ({
              external_uuid: item.external_uuid,
              raw_data: item.raw_data,
            })),
          }),
        });

        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(payload.error || payload.message || "No se pudo subir el lote de details.");
        }

        setUploads((current) => ({
          ...current,
          [payloadType]: {
            ...current[payloadType],
            externalUuid: "",
            rawText: "",
            selectedFiles: [],
          },
        }));

        setActionMessage(`Carga masiva de details completada con ${form.selectedFiles.length} archivo(s).`);
        setRefreshTick((value) => value + 1);
        return;
      }

      const parsed = parsePayloadInput(form.rawText);
      let response;

      if (Array.isArray(parsed)) {
        response = await fetch(`${PAYLOADS_API_BASE}/upload-bulk/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            payload_type: payloadType,
            source_name: form.sourceName,
            items: normalizeBulkItems(parsed),
          }),
        });
      } else {
        response = await fetch(`${PAYLOADS_API_BASE}/upload/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            payload_type: payloadType,
            source_name: form.sourceName,
            external_uuid: form.externalUuid || inferExternalUuid(parsed) || null,
            raw_data: parsed,
          }),
        });
      }

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || payload.message || "No se pudo subir el payload.");
      }

      setUploads((current) => ({
        ...current,
        [payloadType]: {
          ...current[payloadType],
          externalUuid: "",
          rawText: "",
          selectedFiles: [],
        },
      }));

      setActionMessage(
        Array.isArray(parsed)
          ? `Carga masiva de ${payloadType} completada.`
          : `Payload ${payloadType} cargado correctamente.`,
      );
      setRefreshTick((value) => value + 1);
    } catch (uploadError) {
      setActionMessage(uploadError.message);
    } finally {
      setBusyUpload("");
    }
  }

  async function runProcessingAction(actionKey, endpoint) {
    setBusyAction(actionKey);
    setActionMessage("");

    try {
      const response = await fetch(`${PROCESSING_API_BASE}/${endpoint}`, {
        method: "POST",
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || payload.message || "No se pudo ejecutar el procesamiento.");
      }

      setActionMessage(payload.message || "Procesamiento ejecutado correctamente.");
      setRefreshTick((value) => value + 1);
      return payload;
    } catch (processingError) {
      setActionMessage(processingError.message);
      throw processingError;
    } finally {
      setBusyAction("");
    }
  }

  async function runFullPipeline() {
    setBusyAction("pipeline");
    setActionMessage("");

    try {
      const activitiesResponse = await fetch(`${PROCESSING_API_BASE}/activities/run/`, { method: "POST" });
      const activitiesPayload = await activitiesResponse.json().catch(() => ({}));

      if (!activitiesResponse.ok) {
        throw new Error(activitiesPayload.error || activitiesPayload.message || "Falló el procesamiento de activities.");
      }

      const detailsResponse = await fetch(`${PROCESSING_API_BASE}/details/run/`, { method: "POST" });
      const detailsPayload = await detailsResponse.json().catch(() => ({}));

      if (!detailsResponse.ok) {
        throw new Error(detailsPayload.error || detailsPayload.message || "Falló el procesamiento de details.");
      }

      setActionMessage("Pipeline completo ejecutado: activities y details procesados.");
      setRefreshTick((value) => value + 1);
    } catch (pipelineError) {
      setActionMessage(pipelineError.message);
    } finally {
      setBusyAction("");
    }
  }

  async function runLookup() {
    if (!lookupUuid.trim()) {
      setLookupResult(null);
      setActionMessage("Escribe un UUID detail para consultarlo.");
      return;
    }

    setLookupLoading(true);
    setActionMessage("");

    try {
      const response = await fetch(
        `${PAYLOADS_API_BASE}/detail-lookup/?external_uuid=${encodeURIComponent(lookupUuid.trim())}`,
      );
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.message || "No se pudo consultar el UUID.");
      }

      setLookupResult(payload);
    } catch (lookupError) {
      setLookupResult(null);
      setActionMessage(lookupError.message);
    } finally {
      setLookupLoading(false);
    }
  }

  const serviceColumns = [
    { key: "service_type", label: "Servicio" },
    { key: "service_group", label: "Grupo" },
    { key: "trips_count", label: "Viajes" },
    { key: "gross_amount_total", label: "Ingreso", render: (value) => formatMoney(value) },
    { key: "average_gross_amount", label: "Ticket promedio", render: (value) => formatMoney(value) },
  ];

  const timeBucketColumns = [
    { key: "time_bucket", label: "Bucket horario" },
    { key: "trips_count", label: "Viajes" },
    { key: "completed_trips", label: "Completados" },
    { key: "gross_amount_total", label: "Ingreso", render: (value) => formatMoney(value) },
    { key: "distance_km_total", label: "Distancia", render: (value) => formatDecimal(value, " km") },
  ];

  const dailyColumns = [
    { key: "requested_date", label: "Fecha" },
    { key: "trips_count", label: "Viajes" },
    { key: "completed_trips", label: "Completados" },
    { key: "canceled_trips", label: "Cancelados" },
    { key: "gross_amount_total", label: "Ingreso", render: (value) => formatMoney(value) },
  ];

  const payloadColumns = [
    { key: "payload_type", label: "Tipo" },
    { key: "external_uuid", label: "UUID" },
    { key: "processing_status", label: "Status" },
    { key: "processing_attempts", label: "Intentos" },
    { key: "uploaded_at", label: "Cargado" },
  ];

  function toggleTheme() {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }

  return (
    <main className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand__top">
            <div>
              <p className="eyebrow">Uber Dashboard</p>
              <h1>Consola operativa</h1>
            </div>
            <button className="ghost-button ghost-button--compact theme-toggle" type="button" onClick={toggleTheme}>
              {theme === "dark" ? "Modo claro" : "Modo nocturno"}
            </button>
          </div>
          <p>
            Sube payloads, ejecuta el pipeline y revisa cómo impactan de inmediato en la capa analítica.
          </p>
        </div>

        <UploadPanel
          title="Payloads de activities"
          payloadType="activity"
          value={uploads.activity.rawText}
          sourceName={uploads.activity.sourceName}
          externalUuid={uploads.activity.externalUuid}
          selectedFilesCount={uploads.activity.selectedFiles.length}
          onChange={(field, nextValue) => updateUploadState("activity", field, nextValue)}
          onPickFile={(event) => handleFileSelection("activity", event)}
          onSubmit={() => sendPayloadUpload("activity")}
          busy={busyUpload === "activity"}
        />

        <UploadPanel
          title="Payloads de details"
          payloadType="detail"
          value={uploads.detail.rawText}
          sourceName={uploads.detail.sourceName}
          externalUuid={uploads.detail.externalUuid}
          selectedFilesCount={uploads.detail.selectedFiles.length}
          onChange={(field, nextValue) => updateUploadState("detail", field, nextValue)}
          onPickFile={(event) => handleFileSelection("detail", event)}
          onSubmit={() => sendPayloadUpload("detail")}
          busy={busyUpload === "detail"}
        />

        <ActionPanel
          onRunActivities={() => runProcessingAction("activities", "activities/run/")}
          onRunDetails={() => runProcessingAction("details", "details/run/")}
          onRunPipeline={runFullPipeline}
          busyAction={busyAction}
        />

        <div className="sidebar-toast">
          {actionMessage || inferQueueMessage(detailQueue.summary)}
        </div>
      </aside>

      <section className="content">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Vista analítica</p>
            <h2>Resultados del pipeline listos para inspección visual.</h2>
            <p className="hero-text">
              Cada carga o procesamiento que hagas desde el panel lateral puede reflejarse aquí al instante
              refrescando métricas, breakdowns y payloads recientes.
            </p>
          </div>

          <form className="filter-card" onSubmit={handleSubmit}>
            <div className="filter-grid">
              <label>
                <span>Desde</span>
                <input
                  type="date"
                  value={draftFilters.startDate}
                  onChange={(event) =>
                    setDraftFilters((current) => ({ ...current, startDate: event.target.value }))
                  }
                />
              </label>

              <label>
                <span>Hasta</span>
                <input
                  type="date"
                  value={draftFilters.endDate}
                  onChange={(event) =>
                    setDraftFilters((current) => ({ ...current, endDate: event.target.value }))
                  }
                />
              </label>
            </div>

            <div className="filter-actions">
              <button type="submit">Aplicar filtros</button>
              <button type="button" className="ghost-button" onClick={resetFilters}>
                Limpiar
              </button>
            </div>
          </form>
        </section>

        {error ? <section className="alert">{error}</section> : null}

        {loading || !summary ? (
          <section className="loading-panel">Cargando métricas del dashboard...</section>
        ) : (
          <>
            <section className="kpi-grid">
              <KpiCard eyebrow="Volumen" title="Viajes totales" value={formatDecimal(summary.total_trips)} tone="warm" />
              <KpiCard eyebrow="Ingresos" title="Ingreso total" value={formatMoney(summary.total_gross_amount)} tone="sun" />
              <KpiCard eyebrow="Eficiencia" title="Ingreso por km" value={formatMoney(summary.gross_per_km)} tone="cool" />
              <KpiCard eyebrow="Ritmo" title="Ingreso por hora" value={formatMoney(summary.gross_per_hour)} tone="default" />
            </section>

            <section className="insight-grid">
              <div className="panel panel--tall">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">Indicadores</p>
                    <h2>Resumen ejecutivo</h2>
                  </div>
                </div>

                <div className="metric-list">
                  <div>
                    <span>Completados</span>
                    <strong>{formatDecimal(summary.completed_trips)}</strong>
                  </div>
                  <div>
                    <span>Cancelados</span>
                    <strong>{formatDecimal(summary.canceled_trips)}</strong>
                  </div>
                  <div>
                    <span>Ticket promedio</span>
                    <strong>{formatMoney(summary.gross_per_trip)}</strong>
                  </div>
                  <div>
                    <span>Tasa de completado</span>
                    <strong>{formatDecimal(summary.completion_rate, "%")}</strong>
                  </div>
                  <div>
                    <span>Tasa de cancelación</span>
                    <strong>{formatDecimal(summary.cancellation_rate, "%")}</strong>
                  </div>
                  <div>
                    <span>Duración promedio</span>
                    <strong>{formatDecimal(summary.average_duration_minutes, " min")}</strong>
                  </div>
                </div>
              </div>

              <div className="panel panel--accent">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">Contexto</p>
                    <h2>Filtro activo</h2>
                  </div>
                </div>

                <div className="filter-summary">
                  <div>
                    <span>Inicio</span>
                    <strong>{summary.filters.start_date || "Sin límite"}</strong>
                  </div>
                  <div>
                    <span>Fin</span>
                    <strong>{summary.filters.end_date || "Sin límite"}</strong>
                  </div>
                  <div>
                    <span>Distancia total</span>
                    <strong>{formatDecimal(summary.total_distance_km, " km")}</strong>
                  </div>
                  <div>
                    <span>Duración total</span>
                    <strong>{formatDecimal(summary.total_duration_minutes, " min")}</strong>
                  </div>
                </div>
              </div>
            </section>

            <section className="table-grid">
              <DataTable
                title="Ingresos por servicio"
                columns={serviceColumns}
                rows={serviceRows}
                emptyMessage="No hay servicios para el rango seleccionado."
              />
              <DataTable
                title="Desempeño por bucket horario"
                columns={timeBucketColumns}
                rows={timeBucketRows}
                emptyMessage="No hay buckets horarios para el rango seleccionado."
              />
            </section>

            <DetailQueuePanel
              pendingDownloadRows={detailQueue.pending_download_items}
              uploadedPendingRows={detailQueue.uploaded_pending_processing_items}
              queueSummary={detailQueue.summary}
            />

            <section className="table-grid">
              <DetailLookupPanel
                lookupUuid={lookupUuid}
                setLookupUuid={setLookupUuid}
                lookupResult={lookupResult}
                lookupLoading={lookupLoading}
                onLookup={runLookup}
              />
              <DataTable
                title="Tendencia diaria"
                columns={dailyColumns}
                rows={dailyRows}
                emptyMessage="No hay datos diarios para el rango seleccionado."
              />
            </section>

            <section className="table-grid">
              <DataTable
                title="UUIDs / estados recientes"
                columns={payloadColumns}
                rows={recentPayloads}
                emptyMessage="Todavía no hay payloads cargados."
              />
            </section>
          </>
        )}
      </section>
    </main>
  );
}
