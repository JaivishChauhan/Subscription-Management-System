/**
 * Clear all sessions from the database
 * Run with: pnpm tsx scripts/clear-sessions.ts
 */

import { prisma } from "../lib/db"

async function clearSessions() {
  try {
    console.log("Clearing all sessions...")

    const result = await prisma.session.deleteMany({})

    console.log(`✅ Cleared ${result.count} sessions`)

    // Also clear any accounts that might have stale tokens
    console.log("Clearing OAuth accounts...")
    const accountResult = await prisma.account.deleteMany({})
    console.log(`✅ Cleared ${accountResult.count} OAuth accounts`)

    console.log("\n✨ All sessions cleared. Users will need to log in again.")
  } catch (error) {
    console.error("❌ Error clearing sessions:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

clearSessions()
