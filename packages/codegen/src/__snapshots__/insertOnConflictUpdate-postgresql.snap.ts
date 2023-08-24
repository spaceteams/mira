import { AsyncClient } from "model";
export function insertOnConflictUpdate(client: AsyncClient, customerId: number, name: string, onConflictSetName: string) {
    const sql = `
    INSERT INTO customers (customer_id, name) VALUES ($1, $2)
    ON CONFLICT (customer_id) DO
      UPDATE SET name = $3;
  `;
    return client.executeVoid({ name: "insertOnConflictUpdate", sql, values: [customerId, name, onConflictSetName] as const });
}
