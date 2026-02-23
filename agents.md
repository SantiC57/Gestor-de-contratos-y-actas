# Agentes y Skills Disponibles

Este documento lista todos los agentes y skills disponibles en el proyecto con sus respectivos triggers de activación.

## Memory System (Engram)

El sistema de memoria **Engram** está disponible para guardar y recuperar información entre sesiones.

### Triggers para Engram

| Comando | Descripción |
|---------|-------------|
| `guardar`, `save memory`, `record` | Guarda información importante en memoria |
| `buscar`, `search memory`, `record` | Busca en la memoria existente |
| `qué hicimos`, `what did we do` | Recupera el contexto de sesiones anteriores |

### Funciones de Engram

- `engram_mem_save` — Guardar observaciones importantes
- `engram_mem_search` — Buscar en memoria
- `engram_mem_context` — Ver contexto de sesiones recientes
- `engram_mem_session_start` — Iniciar sesión
- `engram_mem_session_end` — Cerrar sesión

---

## SDD (Spec-Driven Development)

Skills para gestión de cambios siguiendo la metodología SDD.

| Skill | Trigger | Descripción |
|-------|---------|-------------|
| **sdd-init** | `/sdd:init`, `sdd init`, `iniciar sdd` | Inicializa SDD en el proyecto |
| **sdd-explore** | `/sdd:explore`, `sdd explore` | Explora e investiga ideas |
| **sdd-propose** | `/sdd:new`, `sdd new <name>` | Crea propuesta de cambio |
| **sdd-spec** | `/sdd:spec`, `sdd spec` | Escribe especificaciones |
| **sdd-design** | `/sdd:design`, `sdd design` | Crea diseño técnico |
| **sdd-tasks** | `/sdd:tasks`, `sdd tasks` | Lista de tareas de implementación |
| **sdd-apply** | `/sdd:apply`, `sdd apply` | Implementa el código |
| **sdd-verify** | `/sdd:verify`, `sdd verify` | Verifica la implementación |
| **sdd-archive** | `/sdd:archive`, `sdd archive` | Archiva el cambio completado |

---

## Framework & Library Skills

### React 19

- **Trigger:** `react`, `react 19`, `componente react`, `use client`
- **Descripción:** Patrones de React 19 con React Compiler
- **Skill:** `react-19`

### Next.js 15

- **Trigger:** `nextjs`, `next.js`, `next 15`, `app router`, `server action`
- **Descripción:** Patrones de Next.js 15 App Router
- **Skill:** `nextjs-15`

### Zustand 5

- **Trigger:** `zustand`, `state management`, `store react`
- **Descripción:** Patrones de gestión de estado con Zustand 5
- **Skill:** `zustand-5`

### Tailwind CSS 4

- **Trigger:** `tailwind`, `tailwindcss`, `estilos`, `css`
- **Descripción:** Patrones de Tailwind CSS 4
- **Skill:** `tailwind-4`

### TypeScript

- **Trigger:** `typescript`, `ts`, `tipos`, `interfaces`
- **Descripción:** Patrones y mejores prácticas de TypeScript strict
- **Skill:** `typescript`

### Zod 4

- **Trigger:** `zod`, `validación`, `schemas`, `parse`
- **Descripción:** Validación de esquemas con Zod 4 (cambios desde v3)
- **Skill:** `zod-4`

### Vercel AI SDK 5

- **Trigger:** `ai sdk`, `ai-sdk`, `chat ai`, `streaming`
- **Descripción:** Patrones de AI SDK 5 (cambios desde v4)
- **Skill:** `ai-sdk-5`

---

## Backend Skills

### Django REST Framework

- **Trigger:** `django`, `drf`, `rest api`, `viewset`, `serializer`
- **Descripción:** Patrones de Django REST Framework
- **Skill:** `django-drf`

### pytest

- **Trigger:** `pytest`, `tests python`, `testing`, `fixtures`
- **Descripción:** Patrones de testing con pytest
- **Skill:** `pytest`

---

## Testing & Review

### Playwright

- **Trigger:** `playwright`, `e2e`, `end to end`, `browser testing`
- **Descripción:** Patrones de testing E2E con Playwright
- **Skill:** `playwright`

### PR Review

- **Trigger:** `review pr`, `revisar pr`, `check pr`, `pr url`
- **Descripción:** Revisa Pull Requests en GitHub
- **Skill:** `pr-review`

---

## Project Management

### Jira Task

- **Trigger:** `jira task`, `crear tarea`, `nueva tarea`, `ticket`
- **Descripción:** Crea tareas en Jira
- **Skill:** `jira-task`

### Jira Epic

- **Trigger:** `jira epic`, `crear epic`, `epic grande`, `iniciativa`
- **Descripción:** Crea epics para features grandes
- **Skill:** `jira-epic`

---

## Utilities

### Skill Creator

- **Trigger:** `crear skill`, `new skill`, `agregar skill`, `agent skill`
- **Descripción:** Crea nuevos skills para el agente
- **Skill:** `skill-creator`

### Find Skills

- **Trigger:** `buscar skill`, `find skill`, `existe skill`, `cómo hacer`
- **Descripción:** Descubre e instala skills disponibles
- **Skill:** `find-skills`

---

## Uso

Para activar un skill, simplemente menciona el trigger en tu mensaje o usa el comando directo:

```
/sdd:init                    → Inicializa SDD
/react-19                    → Activa skill de React 19
/nextjs-15                   → Activa skill de Next.js
/zustand-5                   → Activa skill de Zustand
/tailwind-4                  → Activa skill de Tailwind
```

Los skills se cargan automáticamente cuando el contexto detecta el trigger correspondiente.
