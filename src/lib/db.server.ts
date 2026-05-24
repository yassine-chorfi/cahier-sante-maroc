import mysql from "mysql2/promise";
import type { ExecuteValues } from "mysql2";

const config = {
  host: process.env.DB_HOST ?? "127.0.0.1",
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? "root",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME ?? "cahier_sante_maroc",
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true,
};

const pool = mysql.createPool(config);

export async function query<T>(sql: string, params: Record<string, ExecuteValues> = {}) {
  const [rows] = await pool.execute(sql, params);
  return rows as T[];
}

export async function transaction<T>(work: (conn: mysql.PoolConnection) => Promise<T>) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await work(conn);
    await conn.commit();
    return result;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}
