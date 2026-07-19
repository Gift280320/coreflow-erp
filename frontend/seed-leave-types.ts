import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const defaultLeaveTypes = [
  { name: 'Annual Leave', code: 'AL', description: 'Standard annual leave', daysAllowed: 21, isActive: true },
  { name: 'Sick Leave', code: 'SL', description: 'Statutory sick leave', daysAllowed: 14, isActive: true },
  { name: 'Maternity Leave', code: 'ML', description: 'Maternity leave', daysAllowed: 90, isActive: true },
  { name: 'Paternity Leave', code: 'PL', description: 'Paternity leave', daysAllowed: 14, isActive: true },
  { name: 'Compensatory Leave', code: 'CL', description: 'Compensatory time off', daysAllowed: 5, isActive: true },
  { name: 'Unpaid Leave', code: 'UL', description: 'Unpaid leave', daysAllowed: 0, isActive: true },
];

async function main() {
  console.log('🌱 Seeding leave types...');
  for (const lt of defaultLeaveTypes) {
    const existing = await prisma.leaveType.findUnique({
      where: { code: lt.code },
    });
    if (!existing) {
      await prisma.leaveType.create({ data: lt });
      console.log(`✅ Created leave type: ${lt.name} (${lt.code})`);
    } else {
      console.log(`⏩ Leave type already exists: ${lt.name} (${lt.code})`);
    }
  }
  console.log('🎉 Leave types seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
