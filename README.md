# atp-tour-santiago

Web de gestión del torneo de tenis ATP Tour Santiago: campeonatos, jugadores,
brackets y timeline de partidos.

> Estado actual: **scaffolding completo + dominio modelado**. UI, Server
> Actions y endpoints HTTP son cambios posteriores.

## Stack

| Capa            | Tecnología                                    |
| --------------- | --------------------------------------------- |
| Framework       | [Next.js 16](https://nextjs.org) (App Router) |
| UI              | React 19 + Tailwind CSS v4                    |
| Lenguaje        | TypeScript 5 (strict)                         |
| ORM             | Prisma 7 (driver-adapter pattern)             |
| Base de datos   | SQLite local (`prisma/dev.db`)                |
| Validación      | Zod 4                                         |
| Tests unitarios | Vitest 4 (jsdom, coverage v8, umbral 70%)     |
| Tests E2E       | Playwright 1.61 (Chromium)                    |
| Package manager | pnpm 9+                                       |
| CI              | GitHub Actions                                |

## Quick start

Requisitos: **Node 20+** y **pnpm 9+**.

```bash
# 1. Clonar e instalar dependencias
git clone https://github.com/IanCelisB/atp-tour-santiago.git
cd atp-tour-santiago
pnpm install

# 2. Configurar variables de entorno
cp .env.example .env

# 3. Generar el cliente Prisma y aplicar migraciones
pnpm db:generate
pnpm db:migrate

# 4. Levantar el dev server
pnpm dev
```

Abrí `http://localhost:3000` y vas a ver el shell de Next.js con el smoke
test de Playwright pasando contra esa URL.

## Scripts

| Comando              | Qué hace                                     |
| -------------------- | -------------------------------------------- |
| `pnpm dev`           | Dev server en `http://localhost:3000`        |
| `pnpm build`         | Build de producción                          |
| `pnpm start`         | Sirve el build                               |
| `pnpm lint`          | ESLint                                       |
| `pnpm typecheck`     | `tsc --noEmit`                               |
| `pnpm format`        | Aplica Prettier                              |
| `pnpm format:check`  | Verifica formato sin escribir                |
| `pnpm test`          | Suite Vitest (sin watch)                     |
| `pnpm test:watch`    | Vitest en modo watch                         |
| `pnpm test:coverage` | Vitest con coverage v8 (umbral 70%)          |
| `pnpm test:e2e`      | Playwright E2E (auto-boot del dev server)    |
| `pnpm db:generate`   | Regenerar cliente Prisma                     |
| `pnpm db:migrate`    | Crear y aplicar migración en dev             |
| `pnpm db:push`       | Push schema sin migración (solo prototyping) |
| `pnpm db:reset`      | Reset DB y re-correr migraciones             |
| `pnpm db:studio`     | Abrir Prisma Studio                          |
| `pnpm db:validate`   | Validar `schema.prisma`                      |

## Gate de calidad local

Antes de pushear, corré la batería completa (es lo mismo que corre CI):

```bash
pnpm install && \
  pnpm lint && \
  pnpm typecheck && \
  pnpm test && \
  pnpm test:coverage && \
  pnpm test:e2e && \
  pnpm build
```

## Estructura del repo

```
.
├── app/                  # App Router (Server Components, Server Actions, route handlers)
├── components/           # Componentes UI compartidos (a futuro)
├── lib/                  # Lógica de dominio + clientes (Prisma, slugify, etc.)
│   ├── domain/           # Funciones puras: FSM de estados, generador de bracket
│   └── validators/       # Schemas Zod (campeonato, jugador, partido, foto)
├── prisma/               # Schema + migraciones + dev.db (gitignored)
├── e2e/                  # Tests Playwright
├── public/               # Assets estáticos
└── uploads/              # Fotos locales (gitignored)
```

## Modelo de dominio

Cuatro entidades con sus invariantes validadas por Zod en `lib/validators/`:

- **Campeonato** — metadata del torneo, FSM de estados
  (`DRAFT → UPCOMING → IN_PROGRESS → COMPLETED` + `CANCELLED` desde cualquier
  estado no-terminal), rango de fechas, slug auto-derivado.
- **Jugador** — nombre, país (ISO-3166 alpha-3), ranking opcional positivo,
  slug auto-derivado.
- **Partido** — relación a campeonato (cascade) y dos jugadores
  (auto-match prohibido), ganador invariante por estado, posición de bracket
  única por campeonato.
- **Foto** — adjunta a jugador **O** partido (XOR FK), URL local
  (`/uploads/...`).

El generador de bracket (`lib/domain/bracket.ts`) usa seeding Grand Slam
estricto: seeds 1-2 en mitades opuestas, seeds 3-4 separados. Rechaza N que
no sea potencia de 2 (sin byes en esta iteración).

## Workflow de desarrollo

Este proyecto sigue **Spec-Driven Development (SDD)**. Cada cambio mayor
pasa por cinco fases antes de tocar código:

1. **Proposal** — intención, alcance, rollback
2. **Spec** — requisitos + escenarios Given/When/Then
3. **Design** — decisiones de arquitectura
4. **Tasks** — work units por PR (chained si >400 LOC)
5. **Apply** — implementación estricta TDD (RED → GREEN → TRIANGULATE → REFACTOR)
6. **Verify** — pruebas contra los escenarios del spec

Los artefactos viven en **Engram** bajo el topic key `sdd/<change-name>/...`.
Ver `AGENTS.md` para la receta completa de recuperación.

## Convenciones

- **Commits:** Conventional Commits. Sin "Co-Authored-By". Sin atribución a IA.
- **PRs:** stacked-to-main (cada PR mergea directo a `main`). Un work unit
  por PR. Techo duro: 400 líneas modificadas.
- **Tests:** strict TDD para código nuevo. Tests viajan con el código que
  verifican. Docs viajan con el cambio visible al usuario.

## Out of scope (por ahora)

Auth, i18n, upload de imágenes (solo el schema), base de datos de producción,
deployment, Husky/lint-staged, Renovate, shadcn/ui, visualización del bracket
y timeline de partidos. Estas features están listadas en
`sdd/init-repo/proposal` y se abordarán en cambios futuros.

## Deploy a Render

One-click deploy con Render Blueprints:

1. Pushear el código a GitHub.
2. Ir a <https://dashboard.render.com/> → **New +** → **Blueprint**.
3. Seleccionar el repo `atp-tour-santiago`.
4. Render detecta `render.yaml` automáticamente. Click **Apply**.
5. En **Environment** del servicio, setear:
   - `GOOGLE_CLIENT_ID` (de Google Cloud Console)
   - `GOOGLE_CLIENT_SECRET` (de Google Cloud Console)
6. En **Google Cloud Console → Credentials**, agregar la URL de Render a:
   - Authorized JavaScript origins
   - Authorized redirect URIs (`/api/auth/google/callback`)

El SQLite vive en un disco persistente de 1 GB en `/var/data/prisma/prod.db`.
Ver `DEPLOY.md` para detalles completos.

## CI

Cada push y PR a `main` corre el gate completo en GitHub Actions
(`.github/workflows/ci.yml`). El path filter evita que cambios de docs
consuman minutos de CI.

## Licencia

Privado / sin licencia pública definida todavía.
