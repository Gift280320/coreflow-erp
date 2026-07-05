require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();   // <-- no options

async function main() {
  const company = await prisma.company.upsert({
    where: { subdomain: 'acme' },
    update: {},
    create: {
      name: 'Acme Corp',
      subdomain: 'acme',
      currency: 'USD',
      timezone: 'UTC',
    },
  });

  const superAdminRole = await prisma.role.upsert({
    where: { name: 'SuperAdmin' },
    update: {},
    create: { name: 'SuperAdmin', description: 'Full system access' },
  });

  const adminRole = await prisma.role.upsert({
    where: { name: 'CompanyAdmin' },
    update: {},
    create: { name: 'CompanyAdmin', description: 'Company admin' },
  });

  const hashed = await bcrypt.hash('Admin123!', 10);
  await prisma.user.upsert({
    where: { email: 'admin@coreflow.com' },
    update: {},
    create: {
      email: 'admin@coreflow.com',
      password: hashed,
      firstName: 'Super',
      lastName: 'Admin',
      roleId: superAdminRole.id,
      companyId: company.id,
    },
  });

  console.log('✅ Seed completed.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
