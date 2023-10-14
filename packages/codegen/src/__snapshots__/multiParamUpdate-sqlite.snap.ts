import { Client } from "mira-core";
export function multiParamUpdate(client: Client, setPointsPlus: number, whereNameEq: string) {
    const sql = `
  UPDATE customers SET points = points + $1 WHERE name = $2;
  `;
    return client.executeVoid({ name: "multiParamUpdate", sql, values: [setPointsPlus, whereNameEq] as const });
}
