# atp-tour-santiago

Web de tenis: campeonatos, jugadores, brackets y timeline de partidos.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4
- ESLint + Prettier
- Prisma + PostgreSQL (próximamente)
- Vitest + Playwright (próximamente)

## Scripts

| Comando             | Descripción                                                 |
| ------------------- | ----------------------------------------------------------- |
| `pnpm dev`          | Inicia el servidor de desarrollo en `http://localhost:3000` |
| `pnpm build`        | Compila la app para producción                              |
| `pnpm start`        | Sirve el build de producción                                |
| `pnpm lint`         | Corre ESLint                                                |
| `pnpm typecheck`    | Corre `tsc --noEmit`                                        |
| `pnpm format`       | Aplica Prettier a todo el repo                              |
| `pnpm format:check` | Verifica formato sin escribir                               |

## Estructura

```
.
├── app/           # App Router (layout, page, route handlers)
├── public/        # Assets estáticos
├── lib/           # Lógica de dominio + clientes (Prisma, etc.)
├── components/    # Componentes compartidos (próximamente)
├── prisma/        # Schema + migraciones (próximamente)
└── e2e/           # Tests Playwright (próximamente)
```

## Documentación

La especificación del proyecto vive en Engram bajo el topic key
`sdd/init-repo/...` (proposal, spec, design, tasks).
