import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashed = await bcrypt.hash('Admin123!', 10);
  const user = await prisma.user.update({
    where: { email: 'superadmin@coreflow.com' },
    data: { password: hashed },
  });
  console.log('✅ Password reset for:', user.email);
}

main().catch(console.error).finally(() => prisma.$disconnect());