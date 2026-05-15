import mysql from "mysql2/promise";

function must(name: string) {
  const v = process.env[name];
  if (v === undefined) throw new Error(`${name} is missing`);
  return v;
}

const common = {
  host: must("DB_HOST"),
  port: Number(process.env.DB_PORT || 3306),
  user: must("DB_USER"),
  password: process.env.DB_PASSWORD || "",
  waitForConnections: true,
  connectionLimit: 10,
};

const mainPool = mysql.createPool({ ...common, database: must("DB_NAME") });
const logsPool = mysql.createPool({ ...common, database: must("LOGS_DB_NAME") });

export async function queryMain<T = any>(sql: string, params: any[] = []) {
  const [rows] = await mainPool.execute(sql, params);
  return rows as T;
}
export async function queryLogs<T = any>(sql: string, params: any[] = []) {
  const [rows] = await logsPool.execute(sql, params);
  return rows as T;
}
