import { AsyncClient } from "mira-core";
export function multiParamUpdate(client: AsyncClient, setPointsPlus: number, whereNameEq: string) {
    const sql = `
  UPDATE customers SET points = points + $1 WHERE name = $2;
  `;
    return client.executeVoid({ name: "multiParamUpdate", sql, values: [setPointsPlus, whereNameEq] as const });
}
