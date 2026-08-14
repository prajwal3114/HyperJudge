const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting DB seed...');

  // 1. Create dummy admin
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password_hash: 'hashed_password_stub', // use bcrypt in real app
      role: 'ADMIN',
    },
  });

  // 2. Create sample problem
  const problem = await prisma.problem.upsert({
    where: { slug: 'two-sum' },
    update: {},
    create: {
      title: 'Two Sum',
      slug: 'two-sum',
      time_limit_ms: 2000,
      memory_limit_mb: 256,
      status: 'PUBLISHED',
      author_id: admin.id,
    },
  });

  // 3. Create minimal public test cases (DO NOT SEED HIDDEN CASES IN DEV AUTOMATICALLY UNLESS NEEDED)
  await prisma.testCase.upsert({
    where: {
      problem_id_sequence_number: { problem_id: problem.id, sequence_number: 1 },
    },
    update: {},
    create: {
      problem_id: problem.id,
      sequence_number: 1,
      input_data: '4\n2 7 11 15\n9',
      expected_output: '0 1',
      is_hidden: false,
    },
  });

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
