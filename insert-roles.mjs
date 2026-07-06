import dotenv from 'dotenv';
import { Client } from 'pg';
dotenv.config();
const client = new Client({ connectionString: process.env.DATABASE_URL });
async function run() {
  await client.connect();
  await client.query(
    `INSERT INTO roles (id, name, description, "createdAt", "updatedAt")
     VALUES (gen_random_uuid(), $1, $2, now(), now())
     ON CONFLICT (name) DO NOTHING`,
    ['CompanyAdmin', 'Company Administrator']
  );
  await client.query(
    `INSERT INTO roles (id, name, description, "createdAt", "updatedAt")
     VALUES (gen_random_uuid(), $1, $2, now(), now())
     ON CONFLICT (name) DO NOTHING`,
    ['HR', 'Human Resources']
  );
  const res = await client.query('SELECT id, name FROM roles');
  console.log(res.rows);
  await client.end();
}
run().catch(console.error);
