import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

function normalizedDatabaseUrl(value: string) {
  try {
    const url = new URL(value);
    // Supabase provides standard PostgreSQL connection strings. Keep TLS
    // enabled for production database connections without depending on a
    // provider-specific hostname or SSL mode.
    if (process.env.NODE_ENV === "production") {
      url.searchParams.set("sslmode", "require");
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
  console.warn("[DB] DATABASE_URL not set — auth/watchlist/ratings disabled.");
  const stubDb = {
    select: () => { throw new Error("DATABASE_URL not configured"); },
    insert: () => { throw new Error("DATABASE_URL not configured"); },
    delete: () => { throw new Error("DATABASE_URL not configured"); },
    update: () => { throw new Error("DATABASE_URL not configured"); },
    execute: () => { throw new Error("DATABASE_URL not configured"); },
    query: {} as any,
  } as unknown as ReturnType<typeof drizzle>;
  db = stubDb;
}

export { pool, db };
export * from "./schema";
