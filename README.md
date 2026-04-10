# uber-dashboard

Backend para ingestión, normalización y procesamiento de payloads de Uber usando **Django + Django REST Framework + PostgreSQL + Docker**.

Este proyecto forma parte de mi portafolio de aplicaciones y está orientado a construir un flujo sólido de procesamiento de datos, donde la **fuente principal de verdad es la base de datos**, no los archivos.

---

## Objetivo del proyecto

`uber-dashboard` busca centralizar y procesar información operativa de Uber a partir de payloads crudos, siguiendo un flujo controlado, trazable y preparado para escalar hacia métricas, análisis y visualización.

El sistema permite:

- recibir payloads tipo `activity`
- extraer UUIDs de viajes o eventos relacionados
- crear registros placeholder para `detail`
- importar el JSON real de cada `detail`
- procesar details pendientes
- registrar cada ejecución mediante corridas de proceso (`ProcessRun`)
- preparar una capa de normalización analítica mediante el modelo `UberTrip`

A futuro, este proyecto integrará lógica de métricas y análisis para construir un dashboard operativo y analítico sobre actividad de Uber.

---

## Stack tecnológico

- **Backend:** Django
- **API:** Django REST Framework
- **Base de datos:** PostgreSQL
- **Contenedores:** Docker / Docker Compose

> Actualmente el proyecto trabaja con ejecución manual vía endpoints y management commands. La base del flujo está diseñada para crecer después hacia capas analíticas y visualización.

---

## Arquitectura actual

```text
backend/
├─ config/
├─ apps/
│  ├─ payloads/
│  ├─ processing/
│  ├─ core/
│  └─ metrics/
└─ uber_details_input/
```

### Apps principales

#### `payloads`
Se encarga de recibir, validar, guardar y listar payloads crudos.

#### `processing`
Contiene la lógica de procesamiento de `activity` y `detail`, además del registro de corridas de proceso.

#### `metrics`
Contiene la capa analítica en construcción, donde se normalizarán los details procesados en modelos útiles para métricas y explotación de datos, como `UberTrip`.

---

## Modelos principales

### `RawPayload`
Modelo base para almacenar payloads crudos en la base de datos.

Campos relevantes:

- `payload_type`: tipo de payload (`activity` o `detail`)
- `external_uuid`: identificador externo
- `source_name`: nombre del archivo o fuente
- `raw_data`: contenido JSON completo
- `ingestion_status`: estado de ingestión
- `processing_status`: estado de procesamiento
- `processing_attempts`
- `processing_error`
- `last_processed_at`

### `ProcessRun`
Registra cada ejecución manual del sistema de procesamiento.

Campos relevantes:

- `process_type`
- `status`
- `started_at`
- `finished_at`
- `total_records`
- `processed_records`
- `failed_records`
- `notes`
- `error_message`

### `UberTrip`
Modelo analítico para almacenar información normalizada a partir de payloads `detail`.

Actualmente está diseñado para soportar campos como:

- referencia al `RawPayload` original
- UUID del viaje
- tipo y grupo de servicio
- fecha y hora de solicitud
- día de la semana, hora del día y bucket horario
- distancia y duración normalizadas
- direcciones y coordenadas de pickup/dropoff
- montos del viaje
- atributos extra en JSON para extensibilidad

Este modelo será la base para la siguiente fase del proyecto: métricas, indicadores y visualización.

---

## Flujo funcional actual

El flujo correcto del sistema es:

```text
activity
→ crea detail placeholder
→ importación de JSON real a raw_data
→ procesamiento de details
→ normalización analítica (siguiente fase)
```

### 1. Ingesta de `activity`
Se recibe un payload `activity` mediante API.

### 2. Procesamiento de `activity`
El sistema analiza el JSON, extrae UUIDs y crea registros `detail` placeholder en la base de datos.

### 3. Importación de `detail` real
Se importan archivos JSON reales de details y se actualiza el campo `raw_data` del `RawPayload` correspondiente.

### 4. Procesamiento de `detail`
Se procesan los details que ya tienen payload real en la base de datos.

### 5. Normalización de viajes
Siguiente fase del proyecto: convertir details procesados en registros analíticos `UberTrip` mediante extracción y normalización de campos clave.

---

## Qué ya funciona

Actualmente el proyecto ya tiene implementado lo siguiente:

- carga individual de payloads
- carga masiva de payloads
- listado de payloads
- procesamiento de activities
- extracción recursiva de UUIDs
- creación de detail placeholders
- command para importar archivos detail JSON
- servicio `process_pending_details()`
- endpoint para correr procesamiento de details
- registro de corridas mediante `ProcessRun`
- repositorio Git/GitHub inicializado
- modelo `UberTrip` definido como base de normalización analítica

---

## Endpoints disponibles

### Payloads

#### Listar payloads
```http
GET /api/payloads/
```

#### Subida individual
```http
POST /api/payloads/upload/
```

#### Subida masiva
```http
POST /api/payloads/upload-bulk/
```

### Processing

#### Ejecutar procesamiento de activities
```http
POST /api/processing/activities/run/
```

#### Ejecutar procesamiento de details
```http
POST /api/processing/details/run/
```

---

## Management commands disponibles

### Importar archivos JSON reales de details

```bash
docker compose exec backend python manage.py import_detail_files
```

Este comando toma archivos JSON desde el directorio de entrada de details, identifica el UUID correspondiente y actualiza el `raw_data` del `RawPayload` tipo `detail` en la base de datos.

---

## Principios técnicos del proyecto

Este proyecto sigue estas decisiones de diseño:

- la base de datos es la fuente principal
- los archivos solo se usan como medio de importación
- `activity` y `detail` se procesan por separado
- el estado del sistema se controla con campos de estatus, no con banderas booleanas simples
- cada corrida de proceso queda registrada para trazabilidad
- la normalización analítica se separa del almacenamiento crudo

---

## Ejecución local

### Levantar el proyecto
```bash
docker compose up --build
```

### Entrar al shell de Django
```bash
docker compose exec backend python manage.py shell
```

### Ejecutar importación de details
```bash
docker compose exec backend python manage.py import_detail_files
```

### Ejecutar procesamiento de activities
```http
POST /api/processing/activities/run/
```

### Ejecutar procesamiento de details
```http
POST /api/processing/details/run/
```

---

## Estado actual del desarrollo

A la fecha, el proyecto ya cuenta con un pipeline base funcional:

- ingesta de payloads
- procesamiento de activities
- creación de placeholders de details
- importación de details reales
- procesamiento vía servicio y endpoint
- trazabilidad mediante `ProcessRun`

Además, ya se definió el modelo `UberTrip`, que será la base de la siguiente fase: convertir payloads procesados en información útil para análisis y métricas.

---

## Siguiente paso del proyecto

El siguiente paso técnico es conectar `process_pending_details()` con una capa de normalización que:

- lea el `raw_data` real del detail
- extraiga campos clave
- haga upsert en `UberTrip`
- deje listos los datos para métricas y consultas analíticas

Esto permitirá que el proyecto evolucione de un pipeline de procesamiento crudo a una aplicación con valor analítico real.

---

## Casos de uso del proyecto

Este proyecto está diseñado como base para:

- pipelines de procesamiento de datos operativos
- sistemas de ingestión y normalización de JSON
- trazabilidad de procesos backend
- dashboards analíticos sobre datos transaccionales
- explotación de datos por servicio, horario, distancia y monto
- evolución futura hacia métricas y visualización

---

## Roadmap

Siguientes pasos planeados para el proyecto:

- conectar `detail_processor.py` con `UberTrip`
- implementar extracción de campos clave desde `raw_data`
- realizar upsert de viajes normalizados
- integrar lógica de métricas
- exponer resultados agregados por API
- construir frontend para visualización
- generar indicadores operativos y analíticos
- fortalecer validaciones y observabilidad del pipeline

---

## Enfoque de portafolio

`uber-dashboard` representa una aplicación backend orientada a procesamiento de datos reales con una arquitectura modular y escalable.

Este proyecto demuestra habilidades en:

- diseño de APIs con Django REST Framework
- modelado de datos en PostgreSQL
- ingestión y procesamiento de JSON
- trazabilidad de procesos backend
- separación entre datos crudos y datos normalizados
- organización por servicios y responsabilidades
- trabajo con Docker en entorno de desarrollo
- control de versiones con Git y GitHub

---

## Estado del repositorio

Proyecto en desarrollo activo y ya versionado en GitHub.

La base funcional del pipeline ya está implementada y probada. El siguiente enfoque será la capa de normalización y métricas para convertir el procesamiento técnico en información útil para análisis y toma de decisiones.

---

## Autora

**Erna Tercero Rodríguez**

Proyecto desarrollado como parte de mi portafolio profesional en backend, data workflows y procesamiento de información.
