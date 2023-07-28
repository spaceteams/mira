import { ClientBase } from "pg";
import { execute } from "transactor";
export function windowFunctions(whereSaleDateBetween1: Date, whereSaleDateBetween2: Date, client: ClientBase) {
    const sql = `
  SELECT product, sale_date, amount,
    LAG(amount) OVER (PARTITION BY product ORDER BY sale_date) AS prev_sale_amount,
    SUM(amount) OVER (PARTITION BY product ORDER BY sale_date) AS cumulative_amount
  FROM sales
  WHERE sale_date BETWEEN $1 AND $2;
    `;
    return execute<{
        product: string;
        sale_date: Date;
        amount: number;
        prev_sale_amount: number;
        cumulative_amount: number;
    }>({ sql, values: [whereSaleDateBetween1, whereSaleDateBetween2] as const }, client);
}