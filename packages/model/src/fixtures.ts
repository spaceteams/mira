import { Schema } from './schema'
import { Statement } from './statement'

export type Fixture = {
  dialects: string[]
  schemaSql: string
  schema: Schema
  sql: string
  statement: Statement
}

export const simple: Fixture = {
  dialects: ['postgresql', 'sqlite', 'mysql', 'mariadb'],
  schemaSql:
    'CREATE TABLE employees (id INT PRIMARY KEY, name TEXT, age INTEGER);',
  schema: {
    tables: [
      {
        name: 'employees',
        columnNames: ['id', 'name', 'age'],
        columns: {
          id: { type: 'INT' },
          name: { type: 'TEXT' },
          age: { type: 'INTEGER' },
        },
      },
    ],
  },
  sql: 'SELECT name FROM employees WHERE age > $1;',
  statement: {
    columns: [
      {
        name: 'name',
        dataType: { type: 'TEXT' },
      },
    ],
    variables: [
      {
        name: 'whereAgeGt',
        dataType: { type: 'INTEGER' },
        position: 0,
      },
    ],
  },
}

export const joinAndAggregate: Fixture = {
  dialects: ['postgresql', 'mysql', 'mariadb'],
  schemaSql: `
    CREATE TABLE orders (order_id INT PRIMARY KEY, product TEXT, quantity INTEGER);
    CREATE TABLE order_details (order_id INTEGER, price DECIMAL);
  `,
  schema: {
    tables: [
      {
        name: 'orders',
        columnNames: ['order_id', 'product', 'quantity'],
        columns: {
          order_id: { type: 'INT' },
          product: { type: 'TEXT' },
          quantity: { type: 'INTEGER' },
        },
      },
      {
        name: 'order_details',
        columnNames: ['order_id', 'price'],
        columns: {
          order_id: { type: 'INTEGER' },
          price: { type: 'DECIMAL' },
        },
      },
    ],
  },
  sql: `
    SELECT o.product, SUM(od.price) AS total_price
    FROM orders o
    JOIN order_details od ON o.order_id = od.order_id
    WHERE o.quantity > $1
    GROUP BY o.product;
`,
  statement: {
    columns: [
      {
        name: 'product',
        dataType: { type: 'TEXT' },
      },
      {
        name: 'total_price',
        dataType: { type: 'DECIMAL' },
      },
    ],
    variables: [
      {
        name: 'whereQuantityGt',
        dataType: { type: 'INTEGER' },
        position: 0,
      },
    ],
  },
}

export const star: Fixture = {
  dialects: ['postgresql', 'sqlite', 'mysql', 'mariadb'],
  schemaSql: joinAndAggregate.schemaSql,
  schema: joinAndAggregate.schema,
  sql: 'SELECT * FROM orders',
  statement: {
    columns: [
      {
        name: 'order_id',
        dataType: { type: 'INT' },
      },
      {
        name: 'product',
        dataType: { type: 'TEXT' },
      },
      {
        name: 'quantity',
        dataType: { type: 'INTEGER' },
      },
    ],
    variables: [],
  },
}

export const partialStar: Fixture = {
  dialects: ['postgresql', 'sqlite', 'mysql', 'mariadb'],
  schemaSql: joinAndAggregate.schemaSql,
  schema: joinAndAggregate.schema,
  sql: 'SELECT o.* FROM orders o JOIN order_details od ON o.order_id = od.order_id',
  statement: {
    columns: [
      {
        name: 'order_id',
        dataType: { type: 'INT' },
      },
      {
        name: 'product',
        dataType: { type: 'TEXT' },
      },
      {
        name: 'quantity',
        dataType: { type: 'INTEGER' },
      },
    ],
    variables: [],
  },
}

export const subquery: Fixture = {
  dialects: ['postgresql', 'sqlite', 'mysql', 'mariadb'],
  schemaSql: `
    CREATE TABLE students (student_id INT PRIMARY KEY, name TEXT, major TEXT);
    CREATE TABLE grades (student_id INTEGER, grade DECIMAL);
  `,
  schema: {
    tables: [
      {
        name: 'students',
        columnNames: ['student_id', 'name', 'major'],
        columns: {
          student_id: { type: 'INT' },
          name: { type: 'TEXT' },
          major: { type: 'TEXT' },
        },
      },
      {
        name: 'grades',
        columnNames: ['student_id', 'grade'],
        columns: {
          student_id: { type: 'INTEGER' },
          grade: { type: 'DECIMAL' },
        },
      },
    ],
  },
  sql: `
    SELECT name, major FROM students
    WHERE student_id IN (
        SELECT student_id FROM grades WHERE grade > $1
    );
  `,
  statement: {
    columns: [
      {
        name: 'name',
        dataType: { type: 'TEXT' },
      },
      {
        name: 'major',
        dataType: { type: 'TEXT' },
      },
    ],
    variables: [
      {
        name: 'whereGradeGt',
        dataType: { type: 'DECIMAL' },
        position: 0,
      },
    ],
  },
}

export const conditionalStatement: Fixture = {
  dialects: ['postgresql', 'sqlite', 'mysql', 'mariadb'],
  schemaSql:
    'CREATE TABLE employees (id INT PRIMARY KEY, name TEXT, department TEXT, salary DECIMAL);',
  schema: {
    tables: [
      {
        name: 'employees',
        columnNames: ['id', 'name', 'department', 'salary'],
        columns: {
          id: { type: 'INT' },
          name: { type: 'TEXT' },
          department: { type: 'TEXT' },
          salary: { type: 'DECIMAL' },
        },
      },
    ],
  },
  sql: `
        SELECT name,
        CASE
            WHEN department = 'HR' THEN salary * 1.1
            WHEN department = 'Engineering' THEN salary * 1.2
            ELSE salary
        END AS adjusted_salary
        FROM employees WHERE salary > $1;
    `,
  statement: {
    columns: [
      {
        name: 'name',
        dataType: { type: 'TEXT' },
      },
      {
        name: 'adjusted_salary',
        dataType: { type: 'DECIMAL' },
      },
    ],
    variables: [
      {
        name: 'whereSalaryGt',
        dataType: { type: 'DECIMAL' },
        position: 0,
      },
    ],
  },
}

export const cte: Fixture = {
  dialects: ['postgresql', 'sqlite', 'mysql', 'mariadb'],
  schemaSql:
    'CREATE TABLE orders (order_id INT PRIMARY KEY, product TEXT, order_date DATE, quantity INTEGER);',
  schema: {
    tables: [
      {
        name: 'orders',
        columnNames: ['order_id', 'product', 'order_date', 'quantity'],
        columns: {
          order_id: { type: 'INT' },
          product: { type: 'TEXT' },
          order_date: { type: 'DATE' },
          quantity: { type: 'INTEGER' },
        },
      },
    ],
  },
  sql: `
    WITH ranked_orders AS (
        SELECT product, order_date, quantity,
            RANK() OVER (PARTITION BY product ORDER BY order_date) AS rank_num
        FROM orders
    )
    SELECT product, order_date, quantity
    FROM ranked_orders
    WHERE rank_num <= $1;
    `,
  statement: {
    columns: [
      {
        name: 'product',
        dataType: { type: 'TEXT' },
      },
      {
        name: 'order_date',
        dataType: { type: 'DATE' },
      },
      {
        name: 'quantity',
        dataType: { type: 'INTEGER' },
      },
    ],
    variables: [
      {
        name: 'whereRankNumLte',
        dataType: { type: 'INTEGER' },
        position: 0,
      },
    ],
  },
}

export const windowFunctions: Fixture = {
  dialects: ['postgresql', 'mysql', 'mariadb'],
  schemaSql:
    'CREATE TABLE sales (sale_id INT PRIMARY KEY, product TEXT, sale_date DATE, amount DECIMAL);',
  schema: {
    tables: [
      {
        name: 'sales',
        columnNames: ['sale_id', 'product', 'sale_date', 'amount'],
        columns: {
          sale_id: { type: 'INT' },
          product: { type: 'TEXT' },
          sale_date: { type: 'DATE' },
          amount: { type: 'DECIMAL' },
        },
      },
    ],
  },
  sql: `
  SELECT product, sale_date, amount,
    LAG(amount) OVER (PARTITION BY product ORDER BY sale_date) AS prev_sale_amount,
    SUM(amount) OVER (PARTITION BY product ORDER BY sale_date) AS cumulative_amount
  FROM sales
  WHERE sale_date BETWEEN $1 AND $2;
    `,
  statement: {
    columns: [
      {
        name: 'product',
        dataType: { type: 'TEXT' },
      },
      {
        name: 'sale_date',
        dataType: { type: 'DATE' },
      },
      {
        name: 'amount',
        dataType: { type: 'DECIMAL' },
      },
      {
        name: 'prev_sale_amount',
        dataType: { type: 'DECIMAL' },
      },
      {
        name: 'cumulative_amount',
        dataType: { type: 'DECIMAL' },
      },
    ],
    variables: [
      {
        name: 'whereSaleDateBetween',
        dataType: { type: 'DATE' },
        position: 0,
      },
      {
        name: 'whereSaleDateBetween',
        dataType: { type: 'DATE' },
        position: 1,
      },
    ],
  },
}

export const multiParamInsert: Fixture = {
  dialects: ['postgresql', 'sqlite', 'mysql', 'mariadb'],
  schemaSql:
    'CREATE TABLE customers (customer_id INT PRIMARY KEY, name TEXT, points INTEGER)',
  schema: {
    tables: [
      {
        name: 'customers',
        columnNames: ['customer_id', 'name', 'points'],
        columns: {
          customer_id: { type: 'INT' },
          name: { type: 'TEXT' },
          points: { type: 'INTEGER' },
        },
      },
    ],
  },
  sql: `
    INSERT INTO customers (name, points) VALUES ($1, $2);
  `,
  statement: {
    columns: [],
    variables: [
      {
        name: 'name',
        dataType: { type: 'TEXT' },
        position: 0,
      },
      {
        name: 'points',
        dataType: { type: 'INTEGER' },
        position: 1,
      },
    ],
  },
}

export const insertOnConflictUpdate: Fixture = {
  dialects: ['postgresql'],
  schemaSql:
    'CREATE TABLE customers (customer_id SERIAL PRIMARY KEY, name TEXT, points INTEGER)',
  schema: {
    tables: [
      {
        name: 'customers',
        columnNames: ['customer_id', 'name', 'points'],
        columns: {
          customer_id: { type: 'SERIAL' },
          name: { type: 'TEXT' },
          points: { type: 'INTEGER' },
        },
      },
    ],
  },
  sql: `
    INSERT INTO customers (customer_id, name) VALUES ($1, $2)
    ON CONFLICT (customer_id) DO
      UPDATE SET name = $3;
  `,
  statement: {
    columns: [],
    variables: [
      {
        name: 'customerId',
        dataType: { type: 'SERIAL' },
        position: 0,
      },
      {
        name: 'name',
        dataType: { type: 'TEXT' },
        position: 1,
      },
      {
        name: 'onConflictSetName',
        dataType: { type: 'TEXT' },
        position: 2,
      },
    ],
  },
}

export const multiParamUpdate: Fixture = {
  dialects: ['postgresql', 'sqlite', 'mysql', 'mariadb'],
  schemaSql: multiParamInsert.schemaSql,
  schema: multiParamInsert.schema,
  sql: `
  UPDATE customers SET points = points + $1 WHERE name = $2;
  `,
  statement: {
    columns: [],
    variables: [
      {
        name: 'setPointsPlus',
        dataType: { type: 'INTEGER' },
        position: 0,
      },
      {
        name: 'whereNameEq',
        dataType: { type: 'TEXT' },
        position: 1,
      },
    ],
  },
}

export const multiParamDelete: Fixture = {
  dialects: ['postgresql', 'sqlite', 'mysql'],
  schemaSql:
    'CREATE TABLE orders (order_id INT PRIMARY KEY, order_date DATE, status TEXT);',
  schema: {
    tables: [
      {
        name: 'orders',
        columnNames: ['order_id', 'order_date', 'status'],
        columns: {
          order_id: { type: 'INT' },
          order_date: { type: 'DATE' },
          status: { type: 'TEXT' },
        },
      },
    ],
  },
  sql: 'DELETE FROM orders WHERE order_date < $1 AND status = $2;',
  statement: {
    columns: [],
    variables: [
      {
        name: 'whereOrderDateLt',
        dataType: { type: 'DATE' },
        position: 0,
      },
      {
        name: 'whereStatusEq',
        dataType: { type: 'TEXT' },
        position: 1,
      },
    ],
  },
}

export const nestedSubqueryWithWindow: Fixture = {
  dialects: ['postgresql', 'sqlite', 'mysql', 'mariadb'],
  schemaSql: `
  CREATE TABLE products (product_id INT PRIMARY KEY, name TEXT, category TEXT);
  CREATE TABLE sales (sale_id INT PRIMARY KEY, product_id INTEGER, sale_date DATE, revenue DECIMAL);
  `,
  schema: {
    tables: [
      {
        name: 'products',
        columnNames: ['product_id', 'name', 'category'],
        columns: {
          product_id: { type: 'INT' },
          name: { type: 'TEXT' },
          category: { type: 'TEXT' },
        },
      },
      {
        name: 'sales',
        columnNames: ['sale_id', 'product_id', 'sale_date', 'revenue'],
        columns: {
          sale_id: { type: 'INT' },
          product_id: { type: 'INTEGER' },
          sale_date: { type: 'DATE' },
          revenue: { type: 'DECIMAL' },
        },
      },
    ],
  },
  sql: `
  SELECT name, category, sale_date, revenue,
    RANK() OVER (PARTITION BY category ORDER BY revenue DESC) AS rank_num
  FROM (
      SELECT p.name, p.category, s.sale_date, s.revenue
      FROM products p
      JOIN sales s ON p.product_id = s.product_id
      WHERE s.sale_date BETWEEN $1 AND $2
  ) AS subquery
  WHERE rank_num <= $3;
  `,
  statement: {
    columns: [
      {
        name: 'name',
        dataType: { type: 'TEXT' },
      },
      {
        name: 'category',
        dataType: { type: 'TEXT' },
      },
      {
        name: 'sale_date',
        dataType: { type: 'DATE' },
      },
      {
        name: 'revenue',
        dataType: { type: 'DECIMAL' },
      },
      {
        name: 'rank_num',
        dataType: { type: 'INTEGER' },
      },
    ],
    variables: [
      {
        name: 'whereSaleDateBetween',
        dataType: { type: 'DATE' },
        position: 0,
      },
      {
        name: 'whereSaleDateBetween',
        dataType: { type: 'DATE' },
        position: 1,
      },
      {
        name: 'whereRankNumLte',
        dataType: { type: 'INTEGER' },
        position: 2,
      },
    ],
  },
}

export const complexInsert: Fixture = {
  dialects: ['postgresql', 'sqlite', 'mysql', 'mariadb'],
  schemaSql: `
  CREATE TABLE employees (employee_id INT PRIMARY KEY, name TEXT, department TEXT, salary DECIMAL);
  CREATE TABLE bonuses (employee_id INTEGER, bonus DECIMAL);
  `,
  schema: {
    tables: [
      {
        name: 'employees',
        columnNames: ['employee_id', 'name', 'department', 'salary'],
        columns: {
          employee_id: { type: 'INT' },
          name: { type: 'TEXT' },
          department: { type: 'TEXT' },
          salary: { type: 'DECIMAL' },
        },
      },
      {
        name: 'bonuses',
        columnNames: ['employee_id', 'bonus'],
        columns: {
          employee_id: { type: 'INTEGER' },
          bonus: { type: 'DECIMAL' },
        },
      },
    ],
  },
  sql: `
  INSERT INTO bonuses (employee_id, bonus)
  SELECT employee_id, salary * $1 AS bonus_amount
  FROM employees
  WHERE department = $2;
  `,
  statement: {
    columns: [],
    variables: [
      {
        name: 'salaryMul',
        dataType: { type: 'DECIMAL' },
        position: 0,
      },
      {
        name: 'whereDepartmentEq',
        dataType: { type: 'TEXT' },
        position: 1,
      },
    ],
  },
}

export const migrateAndCast: Fixture = {
  dialects: ['postgresql'],
  schemaSql: `
  CREATE TABLE employees (employee_id INT PRIMARY KEY, name TEXT, department TEXT, salary DECIMAL);
  ALTER TABLE employees
    ADD rating NUMERIC(19, 2),
    DROP department;
  `,
  schema: {
    tables: [
      {
        name: 'employees',
        columnNames: ['employee_id', 'name', 'salary', 'rating'],
        columns: {
          employee_id: { type: 'INT' },
          name: { type: 'TEXT' },
          salary: { type: 'DECIMAL' },
          rating: { type: 'NUMERIC', length: 19, scale: 2 },
        },
      },
    ],
  },
  sql: `
  select
    CAST(salary AS int) salary_int,
    rating::text rating_text
  from employees
  `,
  statement: {
    columns: [
      { name: 'salary_int', dataType: { type: 'INT' } },
      { name: 'rating_text', dataType: { type: 'TEXT' } },
    ],
    variables: [],
  },
}

export const allRegressionCases: [string, Fixture][] = [
  ['simple', simple],
  ['joinAndAggregate', joinAndAggregate],
  ['star', star],
  ['partialStar', partialStar],
  ['subquery', subquery],
  ['conditionalStatement', conditionalStatement],
  ['cte', cte],
  ['windowFunctions', windowFunctions],
  ['multiParamInsert', multiParamInsert],
  ['insertOnConflictUpdate', insertOnConflictUpdate],
  ['multiParamUpdate', multiParamUpdate],
  ['multiParamDelete', multiParamDelete],
  ['nestedSubqueryWithWindow', nestedSubqueryWithWindow],
  ['complexInsert', complexInsert],
  ['migrateAndCast', migrateAndCast],
]
