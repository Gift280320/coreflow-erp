import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // 1) Create or find company
  let company = await prisma.company.findFirst();
  if (!company) {
    company = await prisma.company.create({
      data: { name: 'CoreFlow Inc' },
    });
    console.log('✅ Company created');
  }

  // 2) Create roles
  const roles = [
    'SUPER_ADMIN',
    'ADMIN',
    'ACCOUNTANT',
    'PROCUREMENT_OFFICER',
    'HR_MANAGER',
    'INVENTORY_MANAGER',
    'SALES_REP',
  ];

  const roleMap: Record<string, any> = {};
  for (const roleName of roles) {
    let role = await prisma.role.findUnique({
      where: { name: roleName },
    });
    if (!role) {
      role = await prisma.role.create({
        data: { name: roleName },
      });
      console.log(`✅ Role created: ${roleName}`);
    }
    roleMap[roleName] = role;
  }

  // 3) Create users
  const users = [
    { email: 'superadmin@coreflow.com', password: 'Admin123!', firstName: 'Super', lastName: 'Admin', role: 'SUPER_ADMIN' },
    { email: 'admin@coreflow.com', password: 'Admin123!', firstName: 'Admin', lastName: 'User', role: 'ADMIN' },
    { email: 'accountant@coreflow.com', password: 'Account123!', firstName: 'Grace', lastName: 'Muthoni', role: 'ACCOUNTANT' },
    { email: 'procurement@coreflow.com', password: 'Procure123!', firstName: 'James', lastName: 'Ochieng', role: 'PROCUREMENT_OFFICER' },
    { email: 'hr@coreflow.com', password: 'HR123!', firstName: 'Sarah', lastName: 'Wanjiru', role: 'HR_MANAGER' },
    { email: 'inventory@coreflow.com', password: 'Inventory123!', firstName: 'Peter', lastName: 'Kamau', role: 'INVENTORY_MANAGER' },
    { email: 'sales@coreflow.com', password: 'Sales123!', firstName: 'Mary', lastName: 'Akinyi', role: 'SALES_REP' },
  ];

  for (const userData of users) {
    const existing = await prisma.user.findUnique({
      where: { email: userData.email },
    });
    if (existing) {
      console.log(`ℹ️ User ${userData.email} already exists`);
      continue;
    }
    const hashed = await bcrypt.hash(userData.password, 10);
    await prisma.user.create({
      data: {
        email: userData.email,
        password: hashed,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: {
          connect: { name: userData.role },
        },
        company: {
          connect: { id: company.id },
        },
        isActive: true,
      },
    });
    console.log(`✅ User created: ${userData.email} (${userData.role})`);
  }

  console.log('🎉 All users created!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
