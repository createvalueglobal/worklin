<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Worklin Project Guide

## Overview
Worklin is a Next.js 16.2.2 application with Supabase authentication, role-based access (professional/company/admin), and Stripe subscriptions. It connects professionals with companies for job opportunities.

## Key Technologies
- **Framework**: Next.js 16.2.2 with App Router, React 19.2.4
- **Auth/Database**: Supabase (PostgreSQL, SSR-compatible auth, Google OAuth)
- **Payments**: Stripe (subscriptions, webhooks)
- **UI**: TailwindCSS v4, Framer Motion, Lucide React icons
- **Validation**: Zod schemas, React Hook Form
- **Language**: TypeScript, Spanish UI text

## Architecture & Conventions
- **Routing**: App Router with route groups `(auth)`, `(company)`, `(professional)`, `(public)`, `(admin)`
- **Components**: Organized in `components/features/` (auth, company, professional), `components/common/`, `components/ui/`
- **Data Layer**: `lib/repositories/` for DB access, `lib/services/` for business logic, `lib/validators/` for schemas
- **API**: Server actions in `app/api/`, use Supabase server client
- **Naming**: Kebab-case files, PascalCase components
- **Imports**: Absolute paths with `@/` alias
- **Styling**: Tailwind classes, dark theme (`bg-[#0a0a0f]`), Framer Motion animations

## Authentication & Roles
- **Flow**: Google OAuth → Callback sets role → Onboarding → Dashboard
- **Middleware**: Enforces auth, role access, onboarding completion
- **Roles**: `professional`, `company`, `admin` - stored in `users.role`
- **Clients**: Use appropriate Supabase client (client.ts for browser, server.ts for SSR, admin.ts for RLS bypass)

## Common Patterns
- **Auth Checks**: Always verify user and role in API routes/pages
- **Validation**: Use Zod schemas from `lib/validators/`
- **Error Handling**: Try/catch, return JSON errors with status codes
- **Data Fetching**: Server components for initial data, client for interactivity
- **Onboarding**: Forced for new users, role-specific steps

## Pitfalls to Avoid
- **Supabase SSR**: Use correct cookie handling in middleware/API
- **Role Sync**: Ensure `users.role` matches intended access
- **RLS Bypass**: Admin client only server-side
- **Stripe Webhooks**: Exact secret required for testing
- **Environment Vars**: Missing keys break auth/payments

## Setup & Development
See [README.md](README.md) for installation, environment setup, and Stripe testing.

## Key Files
- `middleware.ts`: Auth/role enforcement
- `app/(auth)/auth/callback/route.ts`: OAuth handling
- `lib/services/onboarding.service.ts`: Onboarding logic
- `types/professional.ts`: DB interfaces

## Skills Available
This workspace has installed skills for UI enhancements (animate, audit, bolder, colorize, delight, impeccable, layout, polish, typeset) and find-skills. Use them for design tasks.

# Worklin Project Guide

## Overview
Worklin is a Next.js 16.2.2 application with Supabase authentication, role-based access (professional/company/admin), and Stripe subscriptions. It connects professionals with companies for job opportunities.

## Key Technologies
- **Framework**: Next.js 16.2.2 with App Router, React 19.2.4
- **Auth/Database**: Supabase (PostgreSQL, SSR-compatible auth, Google OAuth)
- **Payments**: Stripe (subscriptions, webhooks)
- **UI**: TailwindCSS v4, Framer Motion, Lucide React icons
- **Validation**: Zod schemas, React Hook Form
- **Language**: TypeScript, Spanish UI text

## Architecture & Conventions
- **Routing**: App Router with route groups `(auth)`, `(company)`, `(professional)`, `(public)`, `(admin)`
- **Components**: Organized in `components/features/` (auth, company, professional), `components/common/`, `components/ui/`
- **Data Layer**: `lib/repositories/` for DB access, `lib/services/` for business logic, `lib/validators/` for schemas
- **API**: Server actions in `app/api/`, use Supabase server client
- **Naming**: Kebab-case files, PascalCase components
- **Imports**: Absolute paths with `@/` alias
- **Styling**: Tailwind classes, dark theme (`bg-[#0a0a0f]`), Framer Motion animations

## Authentication & Roles
- **Flow**: Google OAuth → Callback sets role → Onboarding → Dashboard
- **Middleware**: Enforces auth, role access, onboarding completion
- **Roles**: `professional`, `company`, `admin` - stored in `users.role`
- **Clients**: Use appropriate Supabase client (client.ts for browser, server.ts for SSR, admin.ts for RLS bypass)

## Common Patterns
- **Auth Checks**: Always verify user and role in API routes/pages
- **Validation**: Use Zod schemas from `lib/validators/`
- **Error Handling**: Try/catch, return JSON errors with status codes
- **Data Fetching**: Server components for initial data, client for interactivity
- **Onboarding**: Forced for new users, role-specific steps

## Pitfalls to Avoid
- **Supabase SSR**: Use correct cookie handling in middleware/API
- **Role Sync**: Ensure `users.role` matches intended access
- **RLS Bypass**: Admin client only server-side
- **Stripe Webhooks**: Exact secret required for testing
- **Environment Vars**: Missing keys break auth/payments

## Setup & Development
See [README.md](README.md) for installation, environment setup, and Stripe testing.

## Key Files
- `middleware.ts`: Auth/role enforcement
- `app/(auth)/auth/callback/route.ts`: OAuth handling
- `lib/services/onboarding.service.ts`: Onboarding logic
- `types/professional.ts`: DB interfaces

## Skills Available
This workspace has installed skills for UI enhancements (animate, audit, bolder, colorize, delight, impeccable, layout, polish, typeset) and find-skills. Use them for design tasks.
