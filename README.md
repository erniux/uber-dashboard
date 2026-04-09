# uber-dashboard

Backend para ingestión, normalización y procesamiento de payloads de Uber usando **Django + Django REST Framework + PostgreSQL + Docker**.

Este proyecto forma parte de mi portafolio de aplicaciones y está orientado a construir un flujo sólido de procesamiento de datos, donde la **fuente principal de verdad es la base de datos**, no los archivos.

---

## Objetivo del proyecto

`uber-dashboard` busca centralizar y procesar información operativa de Uber a partir de payloads crudos, siguiendo un flujo controlado, trazable y preparado para escalar hacia métricas y visualización.

El sistema permite:

- recibir payloads tipo `activity`
- extraer UUIDs de viajes o eventos relacionados
- crear registros placeholder para `detail`
- importar el JSON real de cada `detail`
- procesar detalles pendientes
- registrar cada ejecución mediante corridas de proceso (`ProcessRun`)

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