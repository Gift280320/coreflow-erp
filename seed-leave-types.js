import dotenv from 'dotenv';
import { Client } from 'pg';
dotenv.config();

const client = new Client({ connectionString: process.env.DATABASE_URL });

async function seed() {
  await client.connect();
  const leaveTypes = [
    { name: 'Annual Leave', description: 'Statutory annual leave (21 working days)', daysPerYear: 21, isActive: true },
    { name: 'Sick Leave', description: 'Statutory sick leave (7 days full pay, 7 days half pay)', daysPerYear: 14, isActive: true },
    { name: 'Maternity Leave', description: 'Statutory maternity leave (90 days)', daysPerYear: 90, isActive: true },
    { name: 'Paternity Leave', description: 'Statutory paternity leave (14 days)', daysPerYear: 14, isActive: true },
    { name: 'Compassionate Leave', description: 'Statutory compassionate leave (5 days)', daysPerYear: 5, isActive: true },
    { name: 'Study Leave', description: 'Study leave (varies, default 15 days)', daysPerYear: 15, isActive: true },
    { name: 'Compensatory Leave', description: 'Compensatory time off (varies)', daysPerYear: 10, isActive: true },
  ];

  for (const type of leaveTypes) {
    await client.query(
      `INSERT INTO leave_types (id, name, description, "daysPerYear", "isActive", "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, now(), now())
       ON CONFLICT (name) DO NOTHING`,
      [type.name, type.description, type.daysPerYear, type.isActive]
    );
  }
  console.log('✅ Default leave types seeded.');
  await client.end();
}

seed().catch(console.error);
