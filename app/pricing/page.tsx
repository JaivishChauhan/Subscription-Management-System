import { ShopClient } from "./_components/ShopClient";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  const dbProducts = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      recurringPrices: {
        include: { recurringPlan: true }
      }
    }
  });

  const products = dbProducts.map((p) => {
    // Find yearly plan if available
    const yearlyPricing = p.recurringPrices.find(rp => rp.recurringPlan.billingPeriod === "yearly");
    
    // Simulate features depending on description or notes
    const features = p.description 
      ? p.description.split(",").map(s => s.trim()).filter(Boolean)
      : ["High Availability", "Standard Support"];

    return {
      id: p.id,
      name: p.name,
      price: p.salesPrice,
      // Fallback yearly price if a plan doesn't explicitly define it
      yearlyPrice: yearlyPricing ? yearlyPricing.price : (p.salesPrice * 0.8 * 12),
      features: features,
      featured: p.name.includes("Pro") || p.name.includes("Enterprise"),
    };
  });

  // Extract distinct categories or define static ones for now
  const categories = ["All", "Service Plans", "One-time Tools", "Enterprise"];

  return <ShopClient products={products} categories={categories} />;
}
