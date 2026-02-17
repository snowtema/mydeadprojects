import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import postgres from "postgres";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

// Load .env.local
const envPath = resolve(root, ".env.local");
const envContent = readFileSync(envPath, "utf-8");
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eq = trimmed.indexOf("=");
  if (eq === -1) continue;
  const key = trimmed.slice(0, eq).trim();
  const val = trimmed.slice(eq + 1).trim();
  process.env[key] ??= val;
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("ERROR: DATABASE_URL is not set in .env.local");
  process.exit(1);
}

const sql = postgres(url);

try {
  console.log("Adding position_x and position_y to projects...");
  await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS position_x REAL`;
  await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS position_y REAL`;
  console.log("Done.");
} catch (e) {
  console.error("Migration failed:", e.message);
  process.exit(1);
} finally {
  await sql.end();
}
