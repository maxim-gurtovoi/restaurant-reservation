/**
 * After restoring `prisma/migrations/20260310110812_init_db/migration.sql`, the
 * checksum in `_prisma_migrations` may no longer match. This script prints the
 * exact UPDATE for PostgreSQL (no DB connection required).
 *
 * Usage: node scripts/prisma-repair-init-checksum.mjs
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationPath = path.join(
  __dirname,
  "..",
  "prisma",
  "migrations",
  "20260310110812_init_db",
  "migration.sql",
);

const buf = fs.readFileSync(migrationPath);
const checksum = crypto.createHash("sha256").update(buf).digest("hex");

console.log(
  [
    "-- Repair checksum for restored baseline migration (run once on DB that already applied init).",
    `-- Source file: ${path.relative(process.cwd(), migrationPath)}`,
    `UPDATE "_prisma_migrations"`,
    `SET checksum = '${checksum}',`,
    `    "applied_steps_count" = 1`,
    `WHERE "migration_name" = '20260310110812_init_db';`,
    "",
  ].join("\n"),
);
