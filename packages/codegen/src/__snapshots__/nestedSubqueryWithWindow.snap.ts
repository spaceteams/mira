import { ClientBase } from "pg";
import { execute } from "transactor";
export function nestedSubqueryWithWindow(whereSaleDateBetween1: Date, whereSaleDateBetween2: Date, whereRankLte: number, client?: ClientBase) {
    const sql = `
  SELECT name, category, sale_date, revenue,
    RANK() OVER (PARTITION BY category ORDER BY revenue DESC) AS rank
  FROM (
      SELECT p.name, p.category, s.sale_date, s.revenue
      FROM products p
      JOIN sales s ON p.product_id = s.product_id
      WHERE s.sale_date BETWEEN $1 AND $2
  ) AS subquery
  WHERE rank <= $3;
  `;
    return execute<{
        name: string;
        category: string;
        sale_date: Date;
        revenue: number;
        rank: number;
    }>({ sql, values: [whereSaleDateBetween1, whereSaleDateBetween2, whereRankLte] as const }, client);
}
