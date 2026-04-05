import { prisma } from "../lib/db"

/**
 * Script to create an admin user for testing.
 * Run with: pnpm db:create-admin
 *
 * For production, use bcryptjs to hash passwords:
 * import { hash } from "bcryptjs";
 * const hashedPassword = await hash("Admin@1234!", 12);
 */
async function createAdmin() {
  const adminEmail = "admin@subsms.local"
  const adminPassword = "Admin@1234!" // In production, hash this!

  const internalEmail = "internal@subsms.local"
  const internalPassword = "Internal@1234!"

  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    })

    if (existingAdmin) {
      console.log("✅ Admin user already exists")
      console.log(`   Email: ${adminEmail}`)
    } else {
      // Create admin user
      const admin = await prisma.user.create({
        data: {
          email: adminEmail,
          name: "Admin User",
          password: adminPassword, // In production, use hashed password
          role: "admin",
          emailVerified: new Date(),
        },
      })

      // Create linked Contact record
      await prisma.contact.create({
        data: {
          userId: admin.id,
          firstName: "Admin",
          lastName: "User",
        },
      })

      console.log("✅ Admin user created successfully")
      console.log(`   Email: ${adminEmail}`)
      console.log(`   Password: ${adminPassword}`)
      console.log(`   Role: admin`)
    }

    // Check if internal already exists
    const existingInternal = await prisma.user.findUnique({
      where: { email: internalEmail },
    })

    if (existingInternal) {
      console.log("✅ Internal user already exists")
      console.log(`   Email: ${internalEmail}`)
    } else {
      // Create internal user
      const internal = await prisma.user.create({
        data: {
          email: internalEmail,
          name: "Internal User",
          password: internalPassword, // In production, use hashed password
          role: "internal",
          emailVerified: new Date(),
        },
      })

      // Create linked Contact record
      await prisma.contact.create({
        data: {
          userId: internal.id,
          firstName: "Internal",
          lastName: "User",
        },
      })

      console.log("✅ Internal user created successfully")
      console.log(`   Email: ${internalEmail}`)
      console.log(`   Password: ${internalPassword}`)
      console.log(`   Role: internal`)
    }
  } catch (error) {
    console.error("❌ Error creating admin user:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()
