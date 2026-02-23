# Gentleman-Skills (Local)

> Skills disponibles para el proyecto Gestor de Contratos y Actas.

Skills son conjuntos de instrucciones especializadas que enseñan al asistente de IA cómo trabajar con frameworks, librerías y patrones específicos.

## Philosophy

- **Patrones locales** - Skills configurados específicamente para este proyecto.
- **SDD (Spec-Driven Development)** - Metodología de gestión de cambios.
- **Engram** - Sistema de memoria para persistencia entre sesiones.

---

## SDD (Spec-Driven Development)

Gestión de cambios siguiendo la metodología SDD.

| Skill | Descripción | Trigger |
|-------|-------------|---------|
| [sdd-init](.opencode/skills/sdd-init) | Inicializa SDD en el proyecto | `/sdd:init`, `sdd init`, `iniciar sdd` |
| [sdd-explore](.opencode/skills/sdd-explore) | Explora e investiga ideas | `/sdd:explore`, `sdd explore` |
| [sdd-propose](.opencode/skills/sdd-propose) | Crea propuesta de cambio | `/sdd:new`, `sdd new <name>` |
| [sdd-spec](.opencode/skills/sdd-spec) | Escribe especificaciones | `/sdd:spec`, `sdd spec` |
| [sdd-design](.opencode/skills/sdd-design) | Crea diseño técnico | `/sdd:design`, `sdd design` |
| [sdd-tasks](.opencode/skills/sdd-tasks) | Lista de tareas de implementación | `/sdd:tasks`, `sdd tasks` |
| [sdd-apply](.opencode/skills/sdd-apply) | Implementa el código | `/sdd:apply`, `sdd apply` |
| [sdd-verify](.opencode/skills/sdd-verify) | Verifica la implementación | `/sdd:verify`, `sdd verify` |
| [sdd-archive](.opencode/skills/sdd-archive) | Archiva el cambio completado | `/sdd:archive`, `sdd archive` |

---

## Frontend

Skills para frameworks y librerías frontend.

| Skill | Descripción | Trigger |
|-------|-------------|---------|
| [react-19](.opencode/skill/react-19) | React 19 patterns con React Compiler | `react`, `react 19`, `componente react`, `use client` |
| [nextjs-15](.opencode/skill/nextjs-15) | Next.js 15 App Router patterns | `nextjs`, `next.js`, `next 15`, `app router`, `server action` |
| [tailwind-4](.opencode/skill/tailwind-4) | Tailwind CSS 4 patterns | `tailwind`, `tailwindcss`, `estilos`, `css` |
| [typescript](.opencode/skill/typescript) | TypeScript strict patterns | `typescript`, `ts`, `tipos`, `interfaces` |
| [zod-4](.opencode/skill/zod-4) | Zod 4 schema validation | `zod`, `validación`, `schemas`, `parse` |
| [zustand-5](.opencode/skill/zustand-5) | Zustand 5 state management | `zustand`, `state management`, `store react` |

---

## Backend & AI

| Skill | Descripción | Trigger |
|-------|-------------|---------|
| [ai-sdk-5](.opencode/skill/ai-sdk-5) | Vercel AI SDK 5 patterns | `ai sdk`, `ai-sdk`, `chat ai`, `streaming` |
| [django-drf](.opencode/skill/django-drf) | Django REST Framework patterns | `django`, `drf`, `rest api`, `viewset`, `serializer` |

---

## Testing

| Skill | Descripción | Trigger |
|-------|-------------|---------|
| [playwright](.opencode/skill/playwright) | Playwright E2E testing | `playwright`, `e2e`, `end to end`, `browser testing` |
| [pytest](.opencode/skill/pytest) | Python pytest patterns | `pytest`, `tests python`, `testing`, `fixtures` |

---

## Project Management

| Skill | Descripción | Trigger |
|-------|-------------|---------|
| [jira-task](.opencode/skill/jira-task) | Jira task creation | `jira task`, `crear tarea`, `nueva tarea`, `ticket` |
| [jira-epic](.opencode/skill/jira-epic) | Jira epic creation | `jira epic`, `crear epic`, `epic grande`, `iniciativa` |

---

## Utilities

| Skill | Descripción | Trigger |
|-------|-------------|---------|
| [skill-creator](.opencode/skill/skill-creator) | Create new skill | `crear skill`, `new skill`, `agregar skill`, `agent skill` |
| [pr-review](.opencode/skill/pr-review) | GitHub PR review | `review pr`, `revisar pr`, `check pr`, `pr url` |

---

## Memory System (Engram)

Sistema de memoria para persistencia entre sesiones.

### Triggers

| Comando | Descripción |
|---------|-------------|
| `guardar`, `save memory`, `record` | Guarda información importante en memoria |
| `buscar`, `search memory` | Busca en la memoria existente |
| `qué hicimos`, `what did we do` | Recupera el contexto de sesiones anteriores |

### Funciones Disponibles

- `engram_mem_save` — Guardar observaciones importantes
- `engram_mem_search` — Buscar en memoria
- `engram_mem_context` — Ver contexto de sesiones recientes
- `engram_mem_session_start` — Iniciar sesión
- `engram_mem_session_end` — Cerrar sesión

---

## Uso

### Activar Skills

Los skill se cargan automáticamente cuando el contexto detecta el trigger correspondiente. También puedes activarlos manualmente:

```
/sdd:init                    → Inicializa SDD
/react-19                    → Activa skill de React 19
/nextjs-15                   → Activa skill de Next.js
/zustand-5                   → Activa skill de Zustand
/tailwind-4                  → Activa skill de Tailwind
/zod-4                       → Activa skill de Zod
```

### Estructura de un Skill

```
.opencode/skills/
├── skill-name/
│   └── SKILL.md          # Archivo principal del skill (requerido)
```

Cada skill contiene:
1. **Trigger conditions** - Cuándo cargar el skill
2. **Patterns and rules** - Convenciones de código a seguir
3. **Code examples** - Implementaciones de referencia
4. **Anti-patterns** - Qué evitar

---

## Referencias

- [Gentleman-Skills](https://github.com/Gentleman-Programming/Gentleman-Skills) - Repositorio original de skills
- [Engram](https://github.com/gentleman-programming/engram) - Sistema de memoria

---

Hecho para el proyecto Gestor de Contratos y Actas.
