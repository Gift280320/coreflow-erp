require('dotenv').config();
const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const client = new Client({ connectionString: process.env.DATABASE_URL });

async function seed() {
  await client.connect();

  // Ensure company exists
  let companyRes = await client.query(`SELECT id FROM companies WHERE subdomain = 'acme'`);
  let companyId;
  if (companyRes.rows.length === 0) {
    const insert = await client.query(
      `INSERT INTO companies (id, name, subdomain, currency, timezone, "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), 'Acme Corp', 'acme', 'USD', 'UTC', now(), now())
       RETURNING id`
    );
    companyId = insert.rows[0].id;
    console.log('✅ Company created');
  } else {
    companyId = companyRes.rows[0].id;
  }

  // Ensure SuperAdmin role exists
  let roleRes = await client.query(`SELECT id FROM roles WHERE name = 'SuperAdmin'`);
  let roleId;
  if (roleRes.rows.length === 0) {
    const insert = await client.query(
      `INSERT INTO roles (id, name, description, "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), 'SuperAdmin', 'Full system access', now(), now())
       RETURNING id`
    );
    roleId = insert.rows[0].id;
    console.log('✅ SuperAdmin role created');
  } else {
    roleId = roleRes.rows[0].id;
  }

  // Hash password and create admin user
  const hashed = await bcrypt.hash('Admin123!', 10);
  await client.query(
    `INSERT INTO users (id, email, password, "firstName", "lastName", "roleId", "companyId", "createdAt", "updatedAt")
     VALUES (gen_random_uuid(), 'admin@coreflow.com', $1, 'Super', 'Admin', $2, $3, now(), now())
     ON CONFLICT (email) DO NOTHING`,
    [hashed, roleId, companyId]
  );

  console.log('✅ Admin user created (or already exists)');
  await client.end();
}

seed().catch(e => {
  console.error(e);
  process.exit(1);
});
