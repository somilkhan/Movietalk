import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

function normalizedDatabaseUrl(value: string) {
  try {
    const url = new URL(value);

    // PostgreSQL/pg currently treats `require` as an alias for `verify-full`.
    // Make the stronger behavior explicit so the connection remains secure
    // when pg-connection-string changes its semantics in a future major.
    if (process.env.NODE_ENV === "production") {
      url.searchParams.set("sslmode", "verify-full");
    }

    return url.toString();
  } catch {
    return value;
  }
}

let pool: pg.Pool | undefined;
let db: ReturnType<typeof drizzle>;

if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: normalizedDatabaseUrl(process.env.DATABASE_URL),
    max: Number(process.env.DATABASE_POOL_MAX ?? 10),
    idleTimeoutMillis: Number(process.env.DATABASE_IDLE_TIMEOUT_MS ?? 30000),
    connectionTimeoutMillis: Number(process.env.DATABASE_CONNECTION_TIMEOUT_MS ?? 10000),
  });
  db = drizzle(pool, { schema });
} else {
  console.warn("[DB] DATABASE_URL not set — database-backed features are unavailable.");
  const unavailable = () => {
    throw new Error("DATABASE_URL is not configured");
  };

  db = {
    select: unavailable,
    insert: unavailable,
    delete: unavailable,
    update: unavailable,
    execute: unavailable,
    query: {},
  } as unknown as ReturnType<typeof drizzle>;
}

export { pool, db };
export * from "./schema";
