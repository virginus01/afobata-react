// prisma/seed.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Example seed data
  await prisma.test.createMany({
    data: [
      { name: "Alice", email: "alice@example.com", age: 30 },
      { name: "Bob", email: "bob@example.com", age: 25 },
    ],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
