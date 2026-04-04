import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSQLite3 } from "@prisma/adapter-better-sqlite3";
import Database from "better-sqlite3";
import path from "path";

/**
 * Database seed script.
 * Creates the default admin user and sample data for development.
 *
 * Run with: npx tsx prisma/seed.ts
 */

const dbPath = path.join(process.cwd(), "prisma", "dev.db");
const database = new Database(dbPath);
const adapter = new PrismaBetterSQLite3(database);
const prisma = new PrismaClient({ adapter });

async function seedAdminUser() {
  const existingAdmin = await prisma.user.findUnique({
    where: { email: "admin@subsms.local" },
  });

  if (existingAdmin) {
    console.log("✓ Admin user already exists — skipping.");
    return;
  }

  const hashedPassword = await bcrypt.hash("Admin@1234!", 12);

  const admin = await prisma.user.create({
    data: {
      name: "System Admin",
      email: "admin@subsms.local",
      password: hashedPassword,
      role: "admin",
    },
  });

  await prisma.contact.create({
    data: {
      userId: admin.id,
      firstName: "System",
      lastName: "Admin",
    },
  });

  console.log("✓ Admin user created: admin@subsms.local / Admin@1234!");
}

async function seedSampleTaxes() {
  const existingTaxes = await prisma.tax.count();
  if (existingTaxes > 0) {
    console.log("✓ Taxes already seeded — skipping.");
    return;
  }

  await prisma.tax.createMany({
    data: [
      { name: "GST 18%", type: "percentage", rate: 18 },
      { name: "GST 12%", type: "percentage", rate: 12 },
      { name: "GST 5%", type: "percentage", rate: 5 },
      { name: "No Tax", type: "percentage", rate: 0 },
    ],
  });

  console.log("✓ Sample taxes seeded.");
}

async function seedSamplePaymentTerms() {
  const existingTerms = await prisma.paymentTerms.count();
  if (existingTerms > 0) {
    console.log("✓ Payment terms already seeded — skipping.");
    return;
  }

  await prisma.paymentTerms.createMany({
    data: [
      { name: "Due on Receipt", dueDays: 0, description: "Payment is due immediately upon receipt." },
      { name: "Net 15", dueDays: 15, description: "Payment is due within 15 days." },
      { name: "Net 30", dueDays: 30, description: "Payment is due within 30 days." },
      { name: "Net 60", dueDays: 60, description: "Payment is due within 60 days." },
    ],
  });

  console.log("✓ Sample payment terms seeded.");
}

async function seedSampleProducts() {
  const existingProducts = await prisma.product.count();
  if (existingProducts > 0) {
    console.log("✓ Products already seeded — skipping.");
    return;
  }

  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: "SubsMS Starter",
        type: "service",
        salesPrice: 1200,
        costPrice: 0,
        description: "Perfect for small teams getting started with subscription management.",
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        name: "SubsMS Professional",
        type: "service",
        salesPrice: 3500,
        costPrice: 0,
        description: "Advanced features for growing businesses with complex billing needs.",
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        name: "SubsMS Enterprise",
        type: "service",
        salesPrice: 8000,
        costPrice: 0,
        description: "Full-scale solution for large organizations with custom integrations.",
        isActive: true,
      },
    }),
  ]);

  await prisma.productVariant.createMany({
    data: [
      { productId: products[2].id, attribute: "Support", value: "Standard", extraPrice: 0 },
      { productId: products[2].id, attribute: "Support", value: "Priority", extraPrice: 2000 },
      { productId: products[2].id, attribute: "Support", value: "Dedicated", extraPrice: 5000 },
    ],
  });

  console.log("✓ Sample products seeded (3 products + 3 variants).");
}

async function seedSamplePlans() {
  const existingPlans = await prisma.recurringPlan.count();
  if (existingPlans > 0) {
    console.log("✓ Recurring plans already seeded — skipping.");
    return;
  }

  await prisma.recurringPlan.createMany({
    data: [
      {
        name: "Monthly Plan",
        billingPeriod: "monthly",
        price: 1200,
        minQuantity: 1,
        closable: true,
        pausable: true,
        renewable: true,
      },
      {
        name: "Yearly Plan",
        billingPeriod: "yearly",
        price: 12000,
        minQuantity: 1,
        closable: true,
        pausable: false,
        renewable: true,
      },
      {
        name: "Lifetime Plan",
        billingPeriod: "yearly",
        price: 60000,
        minQuantity: 1,
        closable: false,
        pausable: false,
        renewable: false,
        autoClose: false,
      },
    ],
  });

  console.log("✓ Sample recurring plans seeded (Monthly, Yearly, Lifetime).");
}

async function main() {
  console.log("\n🌱 Seeding database...\n");

  await seedAdminUser();
  await seedSampleTaxes();
  await seedSamplePaymentTerms();
  await seedSampleProducts();
  await seedSamplePlans();

  console.log("\n✅ Database seeded successfully!\n");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
