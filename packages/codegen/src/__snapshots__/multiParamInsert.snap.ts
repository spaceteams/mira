import { ClientBase } from "pg";
import { execute } from "transactor";
export function multiParamInsert(name: string, points: number, client: ClientBase) {
    const sql = `
    INSERT INTO customers (name, points) VALUES ($1, $2);
  `;
    return execute({ sql, values: [name, points] as const }, client);
}
