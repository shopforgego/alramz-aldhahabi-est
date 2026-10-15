import { Pool } from "pg";
import { config } from "./config";

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: config.databaseUrl,
      max: 3,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 12000,
      ssl: false,
    });
  }
  return pool;
}

export async function dbQuery(text: string, params: unknown[] = []) {
  return getPool().query(text, params);
}
