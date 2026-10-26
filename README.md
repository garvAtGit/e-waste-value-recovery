# E-Waste Value Recovery Platform (Delhi Pilot)

A full-stack circular electronics and e-waste value recovery platform designed to route retired, damaged, and non-functional consumer hardware through evidence-backed recovery pathways across Delhi NCR:
- **Cash Buyback & Trade-In** (Commercial re-commerce)
- **Component Recovery & Authorised Repair** (Life extension & refurbishment)
- **Charitable Donation & Community Reuse** (Working hardware redeployment)
- **Certified Material Recycling & Hazardous Containment** (Environmental compliance & safe disposal)

---

## Key Features

1. **Deterministic Device Assessment (`/find-option`):**
   - Multi-criteria diagnostics across device category, functional condition, specific hardware fault, and consumer priority.
   - Built-in hazardous lithium-battery safety safeguards blocking commercial transport of compromised devices.
2. **Provider Directory & Delhi Pilot Registry (`/directory`):**
   - Exact-pincode matching without state-level false inferences.
   - Clear distinction between counter walk-in drop-off depots, dynamic doorstep pickup, and corporate offices.
3. **End-to-End Recovery Case Tracking (`/cases/[id]` & `/dashboard`):**
   - Strict 10-status finite state machine with append-only audit history.
   - Separate verification tiers: `user_reported` vs `provider_verified`.
4. **Operations & Verification Console (`/admin`):**
   - Administrative review of candidate providers with immutable audit logging.
   - Secure verification of user case outcomes.
5. **Platform Impact & Lifecycle Analytics (`/analytics`):**
   - Real-time conversion funnel, pathway breakdown, and lifecycle assessment (LCA) environmental metrics (e-waste diverted in kg, embodied GHG emissions deferred in kg CO₂e).

---

## Technology Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **Database & Security:** Supabase (PostgreSQL with Row Level Security policies)
- **Testing:** Node.js native test runner (`node:test`, `node:assert/strict`)

---

## Getting Started

### 1. Prerequisites
- Node.js 20+ (tested on Node v22)
- npm 10+

### 2. Environment Variables
Copy the example environment configuration:
```bash
cp .env.example .env.local
```

Set the following variables in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_API_KEY=your-secure-admin-secret-at-least-16-chars
```

> **Note on Offline Development:** In development (`NODE_ENV !== "production"`), the application operates seamlessly with an in-memory fallback store if Supabase credentials are not configured.

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Test Suites & Verification

The project includes 9 automated test suites with 100% pass coverage:

```bash
# Run all 9 test suites
npm test

# Run individual suites
npx tsx tests/schema-validation.test.ts
npx tsx tests/provider-directory.test.ts
npx tsx tests/comparison-engine.test.ts
npx tsx tests/pilot-scenarios.test.ts
npx tsx tests/matrix-combinations.test.ts
npx tsx tests/recovery-cases.test.ts
npx tsx tests/admin-operations.test.ts
npx tsx tests/analytics-engine.test.ts
npx tsx tests/production-readiness.test.ts
```

### Type Checking & Linting
```bash
npx tsc --noEmit
npm run lint
npm run build
```

---

## Database Migrations

PostgreSQL schemas and Row Level Security policies are located in `supabase/migrations/`:
- `20261026000000_provider_directory.sql` — Provider directory tables and service areas.
- `20261026000001_comparison_outcomes.sql` — Comparison telemetry and outcomes.
- `20261026000002_service_categories_junction.sql` — Junction table for service-category relationships.
- `20261026000003_recovery_cases_and_admin.sql` — Recovery cases, status history, admin audit logs, and RLS policies.
