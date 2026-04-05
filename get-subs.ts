import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()
async function main() {
  const subs = await prisma.subscription.findMany()
  console.log(subs)
}
main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
