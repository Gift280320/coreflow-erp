require('dotenv').config();
const { Client } = require('pg');
const bcrypt = require('bcryptjs');

async function seed() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  // Insert company
  const companyRes = await client.query(`
    INSERT INTO companies (id, name, subdomain, currency, timezone, "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'Acme Corp', 'acme', 'USD', 'UTC', now(), now())
    ON CONFLICT (subdomain) DO NOTHING
    RETURNING id
  `);
  let companyId;
  if (companyRes.rows.length > 0) {
    companyId = companyRes.rows[0].id;
  } else {
    const existing = await client.query(`SELECT id FROM companies WHERE subdomain = 'acme'`);
    companyId = existing.rows[0].id;
  }

  // Insert roles
  const roleSuper = await client.query(`
    INSERT INTO roles (id, name, description, "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'SuperAdmin', 'Full system access', now(), now())
    ON CONFLICT (name) DO NOTHING
    RETURNING id
  `);
  let superRoleId;
  if (roleSuper.rows.length > 0) {
    superRoleId = roleSuper.rows[0].id;
  } else {
    const existing = await client.query(`SELECT id FROM roles WHERE name = 'SuperAdmin'`);
    superRoleId = existing.rows[0].id;
  }

  // Insert admin user
  const hashedPassword = await bcrypt.hash('Admin123!', 10);
  await client.query(`
    INSERT INTO users (id, email, password, "firstName", "lastName", "roleId", "companyId", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'admin@coreflow.com', $1, 'Super', 'Admin', $2, $3, now(), now())
    ON CONFLICT (email) DO NOTHING
  `, [hashedPassword, superRoleId, companyId]);

  console.log('✅ Seed completed.');
  await client.end();
}

seed().catch(e => {
  console.error(e);
  process.exit(1);
});
