# Supabase Setup & Provider Directory Migration Guide

This guide details how to create your Supabase PostgreSQL database, apply the provider directory migration, configure Row Level Security (RLS), and run the E-Waste Value Recovery provider directory.

---

## 1. Creating a Supabase Project

1. Log in to [Supabase](https://supabase.com).
2. Click **New Project** and select your preferred organization.
3. Choose a project name (e.g. `e-waste-value-recovery`), set a secure database password, and select the region nearest your primary user base.
4. Wait approximately 1–2 minutes for the database to provision.

---

## 2. Applying the SQL Migration

The repository includes a self-contained SQL migration that defines the schema, constraints, indexes, triggers, Row Level Security policies, and development fixtures.

### Option A: Using the Supabase Web Dashboard (Recommended)

1. In your Supabase project dashboard, navigate to the **SQL Editor** tab on the left sidebar.
2. Click **New query**.
3. Open [`supabase/migrations/20261026000000_provider_directory.sql`](file:///c:/Users/thees/Compound/Desktop/E-Waste/supabase/migrations/20261026000000_provider_directory.sql) in this repository and copy its entire contents.
4. Paste the SQL into the Supabase SQL Editor and click **Run**.
5. Verify in the output that all four tables (`providers`, `provider_services`, `provider_accepted_categories`, `provider_service_areas`) were created successfully.

### Option B: Using the Supabase CLI

If you have the Supabase CLI installed:

```bash
# Link to your remote project
supabase link --project-ref your-project-ref

# Apply pending migrations
supabase db push
```

---

## 3. Row Level Security (RLS) & Access Control

The migration enables RLS on **every table**:

| Table | RLS Status | Public Policy | Privileged Write Access |
| :--- | :---: | :--- | :--- |
| `providers` | **Enabled** | `SELECT` allowed ONLY where `approval_status = 'approved'` | Denied to anon/public. Service role only. |
| `provider_services` | **Enabled** | `SELECT` allowed ONLY for services belonging to approved providers | Denied to anon/public. Service role only. |
| `provider_accepted_categories` | **Enabled** | `SELECT` allowed ONLY for categories belonging to approved providers | Denied to anon/public. Service role only. |
| `provider_service_areas` | **Enabled** | `SELECT` allowed ONLY for service areas belonging to approved providers | Denied to anon/public. Service role only. |

### Anonymous Writes Prevention
- Anonymous and public authenticated roles **cannot** insert, update, or delete provider records.
- Provider listings must be inserted by an administrator or via server-side batch operations using the privileged `SUPABASE_SERVICE_ROLE_KEY`.

---

## 4. Configuring Environment Variables

1. In your Supabase dashboard, navigate to **Project Settings** &rarr; **API**.
2. Locate the **Project URL** and the public **anon key**.
3. Create a local environment file `.env.local` by copying the template:

```bash
cp .env.example .env.local
```

4. Populate the keys in `.env.local`:

```ini
# Public keys (safe for browser exposure)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key

# Privileged service role key (SERVER ONLY - NEVER expose to browser)
# Required only for administrative data import scripts:
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key
```

> **Security Note:** Never commit `.env.local` or any file containing real keys to version control. `.env.local` is already included in `.gitignore`.

---

## 5. Graceful Fallback & Development Fixtures

If Supabase credentials are not configured, the application **will not crash**. Instead:

- The directory at `/directory` operates in **Local Demonstration Mode**.
- It renders three clearly marked development sample records (`is_sample_data = true`):
  1. `[DEMO] Apex Certified Material Recovery` (Authorised Recycler & Component Salvager)
  2. `[DEMO] Digital Inclusion Alliance` (Non-profit Charity for Education)
  3. `[DEMO] Precision Hardware Lab` (Repair Workshop)
- An expandable setup banner is displayed with configuration guidance.
- When live credentials are provided and migrations applied, the application automatically queries your live PostgreSQL database.

---

## 6. Strict Non-Inferential Location Matching

In accordance with consumer trust principles:
- Location and pincode queries search strictly against verified, documented service areas (`provider_service_areas`).
- **No state-level inference:** A provider operating in a state is **not** assumed to serve every pincode in that state.
- If a provider's coverage is undocumented or unknown, the card explicitly states:
  *"Service area not documented or unknown. Do not assume regional coverage without contacting the provider."*
