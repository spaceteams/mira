import { Client } from "mira-core";
export function nestedSubqueryWithWindow(client: Client, whereSaleDateBetween1: Date, whereSaleDateBetween2: Date, whereRankNumLte: number) {
    const sql = `
  SELECT name, category, sale_date, revenue,
    RANK() OVER (PARTITION BY category ORDER BY revenue DESC) AS rank_num
  FROM (
      SELECT p.name, p.category, s.sale_date, s.revenue
      FROM products p
      JOIN sales s ON p.product_id = s.product_id
      WHERE s.sale_date BETWEEN $1 AND $2
  ) AS subquery
  WHERE rank_num <= $3;
  `;
    return client.execute<{
        name: string;
        category: string;
        sale_date: Date;
        revenue: number;
        rank_num: number;
    }>({ name: "nestedSubqueryWithWindow", sql, values: [whereSaleDateBetween1, whereSaleDateBetween2, whereRankNumLte] as const });
}
