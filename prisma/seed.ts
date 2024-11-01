import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user if it doesn't exist
  const adminEmail = 'contact@dansantos.pro';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('Iotanu546', 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'Admin',
        isAdmin: true,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=Admin`,
      },
    });
    console.log('Admin user created successfully');
  } else {
    console.log('Admin user already exists');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });