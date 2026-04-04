import { prisma } from "../lib/db";

/**
 * Script to create an admin user for testing.
 * Run with: pnpm db:create-admin
 * 
 * For production, use bcryptjs to hash passwords:
 * import { hash } from "bcryptjs";
 * const hashedPassword = await hash("Admin@1234!", 12);
 */
async function createAdmin() {
  const adminEmail = "admin@subsms.local";
  const adminPassword = "Admin@1234!"; // In production, hash this!

  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log("✅ Admin user already exists");
      console.log(`   Email: ${adminEmail}`);
      return;
    }

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: "Admin User",
        password: adminPassword, // In production, use hashed password
        role: "admin",
        emailVerified: new Date(),
      },
    });

    // Create linked Contact record
    await prisma.contact.create({
      data: {
        userId: admin.id,
        firstName: "Admin",
        lastName: "User",
      },
    });

    console.log("✅ Admin user created successfully");
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log(`   Role: admin`);
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
