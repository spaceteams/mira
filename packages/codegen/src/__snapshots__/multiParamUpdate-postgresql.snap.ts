import { Client } from "postgresql-client";
export function multiParamUpdate(setPointsPlus: number, whereNameEq: string, client?: Client) {
    const sql = `
  UPDATE customers SET points = points + $1 WHERE name = $2;
  `;
    return (client || Client).executeVoid({ sql, values: [setPointsPlus, whereNameEq] as const });
}
