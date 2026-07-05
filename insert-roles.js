require('dotenv').config();
const { Client } = require('pg');

const client = new Client({ connectionString: process.env.DATABASE_URL });

async function run() {
  await client.connect();

  // Insert CompanyAdmin
  await client.query(
    `INSERT INTO roles (id, name, description, "createdAt", "updatedAt") 
     VALUES (gen_random_uuid(), $1, $2, now(), now()) 
     ON CONFLICT (name) DO NOTHING`,
    ['CompanyAdmin', 'Company Administrator']
  );

  // Insert HR
  await client.query(
    `INSERT INTO roles (id, name, description, "createdAt", "updatedAt") 
     VALUES (gen_random_uuid(), $1, $2, now(), now()) 
     ON CONFLICT (name) DO NOTHING`,
    ['HR', 'Human Resources']
  );

  // Get all roles
  const res = await client.query('SELECT id, name FROM roles ORDER BY name');
  console.log('Roles:', res.rows);
  await client.end();
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
