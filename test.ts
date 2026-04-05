import { prisma } from "./lib/db"
async function main() {
  const subs = await prisma.subscription.findMany({
    include: { recurringPlan: true },
  })
  console.log(subs)
}
main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
