@AGENTS.md

## Stack

### Frontend Web

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui + Radix UI
- **Data Fetching**: Server Components + Server Actions
- **Responsive**: Mobile First
- **Package Manager**: pnpm

## Commands

| Command                  | Description                  |
| ------------------------ | ---------------------------- |
| `pnpm install`           | Install dependencies         |
| `pnpm dev`               | Start dev server (port 5173) |
| `pnpm build`             | Production build             |
| `pnpm start`             | Run production build         |
| `pnpm lint`              | Run ESLint                   |
| `pnpm exec tsc --noEmit` | Type-check without emitting  |

> The `dev` script must include `-p 5173` (e.g. `"dev": "next dev -p 5173"`).

## Ports

### Development

- **Web**: 5173 (`http://localhost:5173`)

## Git Workflow

### Branches

- `main`: Production branch
- `develop`: Development branch
- `feature/*`: New features
- `fix/*`: Bug fixes
- `hotfix/*`: Critical production fixes

### Commits

- Write commit messages in **English**
- Use conventional commits format (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`)
- Be descriptive about the "why", not just the "what"

## Project Rules

### Code Quality

1. **TypeScript Strict Mode**: Always enabled
2. **No `any` types**: Use proper types or `unknown`
3. **Error Handling**:
   - Always handle errors explicitly
   - Use proper HTTP status codes
   - Return user-friendly error messages
   - Log errors with context
4. **Corner Cases**:
   - Check for null/undefined before operations
   - Validate array lengths before access
   - Handle edge cases in pagination
   - Validate user input thoroughly (Zod schemas)
5. **UX-Focused Errors**:
   - Spanish error messages for end users
   - Clear, actionable error messages
   - Avoid exposing internal details
   - Include helpful suggestions when possible

### Naming Conventions

- **Files & folders**: `kebab-case` (e.g. `get-user.ts`, `auth-store.ts`)
- **React components**: `PascalCase` for the component, file may stay `kebab-case`
- **Hooks**: `use-*` prefix (e.g. `use-pagination.ts`)
- **Types/Interfaces**: `PascalCase`

### Server vs Client Components

- **Default to Server Components.** Only add `"use client"` when the component needs state, effects, browser APIs, or event handlers.
- **Data fetching lives on the server**: fetch directly inside Server Components (`async` components) or in Server Actions.
- **Mutations go through Server Actions** (`"use server"`), not client-side fetch calls.
- Keep `"use client"` boundaries as low in the tree as possible (leaf components, not whole pages).
- **No `screens/` wrapper.** `app/**/page.tsx` holds the actual page content directly (imports feature components from `src/features/<feature>/components/` and composes them). Don't create a `<XScreen />` component that a `page.tsx` does nothing but render — that's an extra file to open for no reason. Only pull page content into its own component when a client boundary must be isolated (e.g. the whole page needs `"use client"` for a dialog/local state) — in that case the client component still lives next to the page or in `components/`, not in a dedicated `screens/` folder.

### Imports

- Use the `@/*` path alias for `src/` imports.
- A `feature` must **not** import from another `feature` directly. Share through `src/components`, `src/lib`, or `src/hooks`.
- Order: external packages → `@/` internal → relative.

### Environment Variables

- Client-exposed vars must be prefixed `NEXT_PUBLIC_*`.
- Validate all env vars with a Zod schema (e.g. `src/lib/env.ts`) and import from there, never `process.env` directly in feature code.

### Accessibility

- Prefer Radix primitives (handle a11y by default).
- All interactive elements must be keyboard-navigable and have accessible labels.
- **Use semantic HTML, not `div` for everything.** `<header>` for a page/section's title block, `<section>` for a distinct thematic block of content (usually with an `aria-label` or `aria-labelledby` pointing at its heading), `<aside>` for secondary/supplementary panels next to the main content (side info cards, "documents" panels, etc.), `<nav>` for navigation link lists, `<main>` once per page (already provided by `app/(app)/layout.tsx` — pages must not render their own `<main>`). Reach for `<div>` only for pure layout/styling wrappers that carry no semantic meaning (flex/grid containers, spacing wrappers).

### Validation & API Contracts (Zod)

**Zod is the single source of truth for all validation.** This applies to user input _and_ to every API/external response.

1. **All validation goes through Zod.** No manual `if (typeof x !== ...)` checks, no hand-written validation. Define a schema and `parse`/`safeParse`.
2. **Infer types from schemas, never write them by hand.** Use `z.infer<typeof Schema>` so the type and the runtime check can never drift apart.
   ```ts
   export const UserSchema = z.object({
     id: z.string().uuid(),
     email: z.string().email(),
     name: z.string().min(1),
   });
   export type User = z.infer<typeof UserSchema>;
   ```
3. **Validate every API response before using it.** Data crossing the network boundary (`apiFetch`, external services) is `unknown` until a Zod schema validates it. Never trust the shape of a response.
4. **Centralize validated fetching in `apiFetch`.** The single HTTP exit point takes a schema and returns typed, validated data:
   ```ts
   export async function apiFetch<T>(
     url: string,
     schema: z.ZodType<T>,
     init?: RequestInit,
   ): Promise<T> {
     const res = await fetch(url, init);
     if (!res.ok) throw new ApiError(res.status, await res.text());
     const json: unknown = await res.json();
     return schema.parse(json); // throws ZodError on contract mismatch
   }
   ```
5. **Standardized response envelope.** All API responses follow the same validated shape. Define a generic wrapper so success/error handling is uniform:

   ```ts
   export const ApiResponseSchema = <T extends z.ZodTypeAny>(data: T) =>
     z.object({
       success: z.literal(true),
       data,
       meta: z.object({ page: z.number(), total: z.number() }).optional(),
     });

   export const ApiErrorSchema = z.object({
     success: z.literal(false),
     error: z.object({
       code: z.string(),
       message: z.string(), // user-facing, in Spanish
     }),
   });
   ```

6. **Schema location**:
   - Domain/shared schemas → `src/lib/validations/<domain>.ts`
   - Response/contract schemas → next to the data fetcher in `src/data/<resource>/types.ts`
   - Server Action input schemas → next to the action in `src/actions/<resource>/`
7. **Server Actions validate input with `safeParse`** and return field errors on failure (never throw raw to the client):
   ```ts
   const parsed = LoginSchema.safeParse(input);
   if (!parsed.success) {
     return { success: false, errors: parsed.error.flatten().fieldErrors };
   }
   ```
8. **Server Action signature — match how it's actually called.** The `(prevState, formData: FormData)` shape exists for one reason: `useActionState` + `<form action={...}>` requires it. If a Server Action is invoked that way, use that signature and parse fields with `formData.get(...)`.
   If instead it's called manually from a client handler (e.g. React Hook Form's `handleSubmit(data => action(data))`), take the typed input directly — `async (input: MyInput) => {...}` — and `safeParse(input)`. Don't build a `FormData` object by hand just to unwrap it again on the server; that's serializing data you already have typed and validated, for no benefit.
9. **Forms**: use `@hookform/resolvers/zod` so the same schema validates the form and the Server Action — one schema, both layers.
10. **On contract mismatch** (response fails its schema): log the `ZodError` with context via the error tracker, and surface a generic Spanish message to the user — never the raw validation error.

### Testing

- **Unit/Component**: Vitest + React Testing Library
- **E2E**: Playwright
- Co-locate unit tests next to source as `*.test.ts(x)`.

## Project Structure

```
my-app/
├── app/                          # Routes ONLY (App Router)
│   ├── layout.tsx                # Root layout: Providers
│   ├── page.tsx                  # Home route
│   ├── loading.tsx               # Root loading UI
│   ├── error.tsx                 # Root error boundary
│   ├── not-found.tsx             # 404 page
│   ├── (auth)/                   # Auth route group
│   │   ├── layout.tsx
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── forgot-password/
│   │       └── page.tsx
│   |
├── src/                          # All source code (non-routes)
│   │
│   ├── actions/                  # Server Actions ("use server")
│   │   ├── auth/
│   │   │   ├── login.ts
│   │   │   └── logout.ts
│   │   └── users/
│   │       ├── update-user.ts
│   │       └── types.ts
│   │
│   ├── data/                     # Server-side data fetching (Server Components)
│   │   ├── users/
│   │   │   ├── get-user.ts
│   │   │   └── types.ts
│   │   └── client.ts             # apiFetch<T>() — single HTTP exit point
│   │
│   ├── features/                 # Architecture core
│   │   └── <feature>/
│   │       ├── components/        # Feature-exclusive UI
│   │       ├── store/             # Zustand slice (client state only)
│   │       └── types/             # Feature TypeScript interfaces
│   │
│   ├── components/               # Reusable global components
│   │   ├── ui/                   # Primitives (Button, Input, Badge, Card…)
│   │   └── forms/                # InputField, SelectField (RHF wrappers)
│   │
│   ├── hooks/                    # Generic/global client hooks
│   │   ├── use-pagination.ts
│   │   └── use-color-scheme.ts
│   │
│   ├── store/                    # Global client state (Zustand)
│   │   ├── auth-store.ts         # user, isAuthenticated, logout
│   │   └── alert-modal-store.ts  # show(type, options), hide()
│   │
│   ├── lib/                      # Utilities and configuration
│   │   ├── auth.ts               # Auth helpers
│   │   ├── utils.ts              # cn(), generic helpers
│   │   ├── formats.ts            # formatDate(), formatCurrency()
│   │   ├── constants.ts          # Navigation/theme constants
│   │   ├── env.ts                # Validated env (Zod)
│   │   └── validations/          # Zod schemas per domain
│   │
│   ├── context/                  # React Contexts (client)
│   │   └── notification-context.tsx
│   │
│   ├── adapters/                 # External library wrappers
│   │   └── error-tracking.ts     # ErrorTracker (over Sentry)
│   │
│   └── types/                    # Shared global types
│       └── api.ts
│
├── public/                       # Static assets (images, fonts, icons)
├── app/globals.css               # Design tokens (CSS variables)
├── tsconfig.json
├── next.config.ts
└── package.json
```

> **Note on Tailwind**: Next.js 15 ships with Tailwind v4 by default, where configuration lives in CSS (`globals.css`) via `@theme`, not a `tailwind.config.js`. Only add a JS config if you opted into Tailwind v3.
