# Sahayak Books Cloudflare D1 & Worker Architecture

This directory contains the production-ready database architecture, migrations, seed generators, and Cloudflare Worker API foundation for **Sahayak Books**.

---

## Directory Structure

```text
cloudflare/
├── migrations/
│   ├── 0001_initial_schema.sql  (20 relational tables with foreign keys & hashed session security)
│   └── 0002_indexes.sql         (Optimized indexes for performance)
├── generated/
│   └── seed-production.sql      (Generated SQL insert statements from data/db.json)
├── worker/
│   ├── wrangler.toml.example    (Wrangler configuration template)
│   └── src/
│       ├── index.ts             (Worker API entry point with real D1 health check & CORS)
│       └── db/                  (Modular D1 query helper functions)
├── scripts/
│   └── migrate-json-to-d1.ts    (Migration validator, dry-run reporter, and SQL seed generator)
└── README.md                    (This guide)
```

---

## Wrangler & D1 Operations Guide

### 1. Create the Production D1 Database in Cloudflare
```bash
npx wrangler@latest d1 create sahayakbooks-production --location=apac
```
*Note: Copy the returned `database_id` and update your `wrangler.toml` file.*

### 2. Check Unapplied Migrations (Remote)
```bash
npx wrangler@latest d1 migrations list sahayakbooks-production --remote
```

### 3. Apply Schema Migrations (Remote)
```bash
npx wrangler@latest d1 migrations apply sahayakbooks-production --remote
```

### 4. Generate Production SQL Seed from Local `data/db.json`
Run the migration script to validate relationships, detect R2 assets, and generate the seed SQL file:
```bash
npx tsx cloudflare/scripts/migrate-json-to-d1.ts
```

### 5. Import Generated Seed into Production D1
```bash
npx wrangler@latest d1 execute sahayakbooks-production --remote --file=generated/seed-production.sql
```

---

## Security & Architecture Highlights
- **Session Security**: Sessions are stored using secure cryptographic hashes (`token_hash`) instead of plaintext tokens.
- **Health Check**: `/api/health` performs a live lightweight `SELECT 1` query against D1 to verify database connectivity.
- **Relationship Integrity**: The migration script performs exhaustive relationship validation (detecting missing authors, missing books, duplicate emails, duplicate slugs, and R2 media asset mappings) prior to SQL generation.
