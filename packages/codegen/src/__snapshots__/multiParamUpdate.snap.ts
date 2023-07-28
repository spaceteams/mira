import { ClientBase } from "pg";
import { execute } from "transactor";
export function multiParamUpdate(setPointsPlus: number, whereNameEq: string, client: ClientBase) {
    const sql = `
  UPDATE customers SET points = points + $1 WHERE name = $2;
  `;
    return execute({ sql, values: [setPointsPlus, whereNameEq] as const }, client);
}
