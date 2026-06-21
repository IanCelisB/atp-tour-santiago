<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

---

# AGENTS.md — Project Operating Manual

This file is the **canonical reference for AI agents and human contributors**
working on this codebase. It is read by Claude Code, OpenCode, Cursor, and any
other agent that follows the `AGENTS.md` convention.

If something here conflicts with a more specific doc (spec, design, task list),
the more specific doc wins. If you cannot resolve the conflict, stop and ask.

## Detected Stack

| Layer           | Choice                | Version | Notes                                              |
| --------------- | --------------------- | ------- | -------------------------------------------------- |
| Framework       | Next.js (App Router)  | 16.2.9  | No `src/` dir; alias `@/*` → repo root             |
| UI              | React                 | 19.2.4  |                                                    |
| Styling         | Tailwind CSS          | 4       |                                                    |
| Language        | TypeScript            | 5       | Strict mode                                        |
| ORM             | Prisma                | 7.8     | Driver-adapter pattern (no built-in SQLite driver) |
| Database        | SQLite (local file)   | —       | `prisma/dev.db`, configured via `prisma.config.ts` |
| Validation      | Zod                   | 4.4     | v4 breaking changes vs v3 — check migration guide  |
| Unit tests      | Vitest                | 4.1     | jsdom env, v8 coverage, 70% threshold              |
| E2E tests       | Playwright            | 1.61    | Chromium only, `e2e/` dir                          |
| Package manager | pnpm                  | 9+      | `pnpm-lock.yaml` is the source of truth            |
| Lint / format   | ESLint 9 + Prettier 3 | —       | `prettier-plugin-tailwindcss` for class sort       |
| CI              | GitHub Actions        | —       | `.github/workflows/ci.yml`                         |

## Project Conventions

| Convention     | Rule                                                                                                                                                 |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Commits        | **Conventional Commits only.** Format: `<type>(<scope>): <subject>`. No "Co-Authored-By" lines. No AI attribution.                                   |
| Types          | `feat`, `fix`, `chore`, `ci`, `docs`, `refactor`, `test`, `style`, `perf`                                                                            |
| Branching      | `stacked-to-main` — every PR merges directly to `main`, no long-lived feature branches                                                               |
| PR scope       | One work unit per PR. Hard ceiling: 400 changed lines. Split into chained PRs above that.                                                            |
| Commits per PR | One logical change per commit. Tests travel with the code they verify. Docs travel with the user-visible change.                                     |
| Strict TDD     | For any new logic: RED → GREEN → TRIANGULATE → REFACTOR. No production code without a failing test first.                                            |
| File layout    | `app/` (routes), `lib/` (domain + clients), `components/` (UI atoms/molecules), `prisma/` (schema + migrations), `e2e/` (Playwright). NO `src/` dir. |
| Aliases        | Always use `@/lib/...`, never relative paths that escape the file's directory.                                                                       |
| Path casing    | macOS devs: case-sensitive matters in CI. Always match the real on-disk casing.                                                                      |

## Scripts

| Command              | What it does                                                                  |
| -------------------- | ----------------------------------------------------------------------------- |
| `pnpm dev`           | Start Next.js dev server on `http://localhost:3000`                           |
| `pnpm build`         | Production build (also runs as final CI gate)                                 |
| `pnpm start`         | Serve the production build                                                    |
| `pnpm lint`          | Run ESLint (config-next + TypeScript rules)                                   |
| `pnpm typecheck`     | `tsc --noEmit` against strict TS config                                       |
| `pnpm format`        | Write Prettier formatting across the repo                                     |
| `pnpm format:check`  | Verify formatting without writing (CI-safe)                                   |
| `pnpm test`          | Run Vitest suite once (no watch)                                              |
| `pnpm test:watch`    | Vitest watch mode for local dev                                               |
| `pnpm test:coverage` | Vitest with v8 coverage — enforces 70% on lines/branches/functions/statements |
| `pnpm test:e2e`      | Playwright E2E (auto-boots `pnpm dev` via webServer config)                   |
| `pnpm db:generate`   | Regenerate Prisma client                                                      |
| `pnpm db:migrate`    | Create + apply a new migration in dev                                         |
| `pnpm db:push`       | Push schema without migration (rapid prototyping only)                        |
| `pnpm db:reset`      | Reset DB and re-run all migrations                                            |
| `pnpm db:studio`     | Open Prisma Studio                                                            |
| `pnpm db:validate`   | Validate `schema.prisma` without connecting                                   |

**Local quality gate (matches CI):**

```bash
pnpm install && \
  pnpm lint && \
  pnpm typecheck && \
  pnpm test && \
  pnpm test:coverage && \
  pnpm test:e2e && \
  pnpm build
```

## Strict TDD Mode

This project runs in **strict TDD mode**. Test runner: `pnpm vitest`.

The full rules live in `~/.config/opencode/skills/sdd-apply/strict-tdd.md`
when invoked via OpenCode. Core contract for any new logic:

1. **RED** — Write the failing test first. It must reference code that does not
   exist yet (or call a function with a behavior that is not yet implemented).
2. **GREEN** — Write the minimum code to make the test pass. Hardcoded return
   values are acceptable on the first pass.
3. **TRIANGULATE** — Add at least one more test case with different inputs.
   Force real logic out of any `return 42;`-style fake-it.
4. **REFACTOR** — Improve naming, extract helpers, kill duplication. Tests must
   stay green after every micro-step.

**Skip TDD** only for purely structural changes (config files, type exports,
markdown docs). Document the skip explicitly in your apply-progress evidence
table.

**Assertion quality:** never write a test that proves nothing (tautologies,
empty-collection assertions without setup, smoke renders with no behavior
check, mock-heavy tests for one-line transforms). Extract logic to pure
functions and test the pure function.

## Engram Persistent Memory — Recovery Recipe

Project context, decisions, and prior-session state live in **Engram**, a
persistent memory layer that survives across sessions and compactions.

**Search memory** when:

- The user references past work ("remember", "what did we do", "recordar")
- You are about to start work that may have been done before
- The user's first message references the project, a feature, or a problem

**Search order:**

1. `mem_context` — checks recent session history (fast, cheap)
2. `mem_search(query, project: "atptoursantiago")` — full-text search across observations
3. `mem_get_observation(id)` — retrieve the full untruncated content of a match

**Always run searches in parallel.** Never chain them sequentially.

```typescript
// Example: recovering the init-repo spec
const results = await mem_search({
  query: 'sdd/init-repo/spec',
  project: 'atptoursantiago',
});
const spec = await mem_get_observation({ id: results[0].id });
```

**Topic keys** for evolving topics — reuse the same `topic_key` to update
rather than create a new observation. Examples in this project:
`sdd/init-repo/proposal`, `sdd/init-repo/spec`, `sdd/init-repo/design`,
`sdd/init-repo/tasks`, `sdd/init-repo/apply-progress`.

**Proactive save triggers** — call `mem_save` immediately after any of:

- Architecture or design decision made
- Bug fix completed (include root cause)
- Feature implemented with non-obvious approach
- Configuration change or environment setup done
- Non-obvious discovery about the codebase
- Pattern established (naming, structure, convention)
- User preference or constraint learned

## SDD Workflow Pointers

This project follows **Spec-Driven Development** via the SDD skill chain.
Each major change goes through five phases:

1. **`sdd-explore`** — clarify requirements before committing to a change
2. **`sdd-propose`** — write the change proposal (intent, scope, approach)
3. **`sdd-spec`** — write delta specs with requirements and scenarios
4. **`sdd-design`** — create the technical design / architecture approach
5. **`sdd-tasks`** — break the change into implementation tasks (chained PRs if >400 LOC)
6. **`sdd-apply`** — implement the tasks (this is where you are now)
7. **`sdd-verify`** — prove the implementation matches specs/design/tasks
8. **`sdd-archive`** — sync delta specs into the baseline on success

**Canonical references for this repo:**

| Artifact                       | Engram topic key               | Status                         |
| ------------------------------ | ------------------------------ | ------------------------------ |
| `sdd/init-repo/proposal`       | `sdd/init-repo/proposal`       | Baseline (PR 1)                |
| `sdd/init-repo/spec`           | `sdd/init-repo/spec`           | Baseline (PR 1)                |
| `sdd/init-repo/design`         | `sdd/init-repo/design`         | Baseline (PR 1)                |
| `sdd/init-repo/tasks`          | `sdd/init-repo/tasks`          | 36/41 done (PRs 1-4 ✅)        |
| `sdd/init-repo/apply-progress` | `sdd/init-repo/apply-progress` | PR 4 complete (this PR = PR 5) |

To see the most recent decisions for this project:

```typescript
await mem_context({ project: 'atptoursantiago' });
```

## Out of Scope (Do NOT Implement)

The following are **deliberately deferred** beyond the `init-repo` change.
Do not propose, design, or implement them unless the user reopens scope:

- Authentication / authorization (NextAuth, Clerk, etc.)
- Internationalization (i18n / next-intl)
- Image upload Server Action (schema only this iteration)
- Production database (Postgres + docker-compose)
- Deployment (Vercel, Docker, Fly.io, etc.)
- Husky / lint-staged pre-commit hooks
- Renovate / Dependabot
- shadcn/ui or any component library
- Bracket visualization, match timeline UI

## When You Are Stuck

1. Search Engram first (`mem_search` with relevant keywords).
2. Read the relevant spec scenario — it is your acceptance criterion.
3. Read the relevant design decision — it constrains your approach.
4. Match existing code patterns in the file/area you are touching.
5. If still stuck after 5 minutes of investigation, **stop and ask the user**.
   Do NOT guess at architecture-level decisions.

## Persona & Style

- Reply in the user's current language (Spanish Rioplatense with voseo, or English).
- Be direct, but caring. Frustration is allowed when evidence shows the user can do better.
- Prefer one focused question over a menu of options.
- Verify technical claims before stating them — investigate first, then answer.
- Never inject Rioplatense slang or CAPS emphasis into code, UI strings, or docs.
