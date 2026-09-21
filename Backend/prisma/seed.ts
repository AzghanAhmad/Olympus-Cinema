import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as argon2 from 'argon2';
import 'dotenv/config';
import { seedCinemaCatalog } from '../src/bootstrap/cinema-seed';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminPasswordHash = await argon2.hash('Crystal@999');
  const passwordHash = await argon2.hash('Password123!');

  await prisma.user.upsert({
    where: { email: 'admin-crystalmaldives@gmail.com' },
    update: {
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: true,
    },
    create: {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin-crystalmaldives@gmail.com',
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'staff@cinema.local' },
    update: {},
    create: {
      firstName: 'Staff',
      lastName: 'Member',
      email: 'staff@cinema.local',
      passwordHash,
      role: UserRole.STAFF,
      status: UserStatus.ACTIVE,
      emailVerified: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'user@cinema.local' },
    update: {},
    create: {
      firstName: 'Sample',
      lastName: 'User',
      email: 'user@cinema.local',
      phone: '+1234567890',
      passwordHash,
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      emailVerified: true,
    },
  });

  await seedCinemaCatalog(prisma);

  console.log('Seed complete.');
  console.log('Admin: admin-crystalmaldives@gmail.com / Crystal@999');
  console.log('Staff: staff@cinema.local / Password123!');
  console.log('User:  user@cinema.local / Password123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
