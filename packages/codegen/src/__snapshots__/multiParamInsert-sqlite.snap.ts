import { Client } from "sqlite-client";
export function multiParamInsert(name: string, points: number, client?: Client) {
    const sql = `
    INSERT INTO customers (name, points) VALUES ($1, $2);
  `;
    return (client || Client).executeVoid({ sql, values: [name, points] as const });
}