import { AsyncClient } from "mira-core";
export function multiParamInsert(client: AsyncClient, name: string, points: number) {
    const sql = `
    INSERT INTO customers (name, points) VALUES ($1, $2);
  `;
    return client.executeVoid({ name: "multiParamInsert", sql, values: [name, points] as const });
}
