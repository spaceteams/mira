import { Client } from "@lyra/core";
export function multiParamInsert(client: Client, name: string, points: number) {
    const sql = `
    INSERT INTO customers (name, points) VALUES ($1, $2);
  `;
    return client.executeVoid({ name: "multiParamInsert", sql, values: [name, points] as const });
}
