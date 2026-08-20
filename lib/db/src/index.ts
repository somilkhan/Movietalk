import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

function normalizedDatabaseUrl(value: string) {
  try {
    const url = new URL(value);
    // pg-connection-string will change the meaning of `require` in a future
    // major release. Keep Neon/Postgres connections explicitly on verify-full.
    url.searchParams.set("sslmode", "verify-full");
    return url.toString();
  } catch {
    return value;
  }
}

let pool: pg.Pool | undefined;
let db: ReturnType<typeof drizzle>;

if (process.env.DATABASE_URL) {
  pool = new Pool({ connectionString: normalizedDatabaseUrl(process.env.DATABASE_URL) });
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
