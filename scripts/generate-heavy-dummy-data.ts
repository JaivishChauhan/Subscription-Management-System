import "dotenv/config"
import { prisma } from "../lib/db"
import { faker } from "@faker-js/faker"
import bcrypt from "bcryptjs"

// Make things look lowercase and "manually typed"
const toManual = (str: string) => {
  if (!str) return str
  const s = str.toLowerCase().trim()
  // Occasional missing spaces or simple typos could be added, but lowercase gives the right "quick manual" feel
  return s
}

async function main() {
  console.log("Starting heavy automated dummy data generation...")
  const hrTimeStart = process.hrtime()

  const passwordHash = await bcrypt.hash("password123", 10)

  // 1. Taxes
  console.log("Generating Taxes...")
  await prisma.tax.createMany({
    data: [
      {
        name: "gst 18%",
        type: "percentage",
        rate: 18.0,
        description: "standard gst",
      },
      {
        name: "cgst 9%",
        type: "percentage",
        rate: 9.0,
        description: "central gst",
      },
      {
        name: "sgst 9%",
        type: "percentage",
        rate: 9.0,
        description: "state gst",
      },
      {
        name: "igst 18%",
        type: "percentage",
        rate: 18.0,
        description: "integrated gst",
      },
      {
        name: "out of state",
        type: "fixed",
        rate: 0.0,
        description: "no tax out of state",
      },
    ].map((t) => ({ ...t, isActive: true })),
    skipDuplicates: true,
  })

  // 2. Payment Terms
  console.log("Generating Payment Terms...")
  await prisma.paymentTerms.createMany({
    data: [
      { name: "due on receipt", dueDays: 0, description: "pay immediately" },
      { name: "net 15", dueDays: 15, description: "pay within 15 days" },
      { name: "net 30", dueDays: 30, description: "standard net 30" },
      { name: "net 60", dueDays: 60, description: "extended net 60" },
    ],
    skipDuplicates: true,
  })
  const paymentTerms = await prisma.paymentTerms.findMany()

  // 3. Products & Product Variants
  console.log("Generating Products...")
  const productsData = Array.from({ length: 40 }).map(() => {
    const isSoftware = faker.datatype.boolean({ probability: 0.8 })
    const prodName = isSoftware
      ? faker.helpers.arrayElement([
          "cloud storage 1tb",
          "crm pro license",
          "api access tier 1",
          "analytics add-on",
          "priority support",
          "custom domain mapping",
          "white-labeling setup",
          "managed database",
          "enterprise workspace",
          "email campaigns addon",
        ])
      : faker.helpers.arrayElement([
          "hardware lease",
          "router rental",
          "welcome physical kit",
          "server rack space",
          "branded merchandise",
        ])
    return {
      name: prodName,
      type: isSoftware ? "service" : "goods",
      salesPrice: parseFloat(
        faker.commerce.price({ min: 10, max: 2000, dec: 2 })
      ),
      costPrice: parseFloat(faker.commerce.price({ min: 1, max: 50, dec: 2 })),
      description: toManual(
        faker.company.catchPhrase() + " " + faker.company.buzzPhrase()
      ),
      notes: toManual(faker.lorem.sentence()),
      isActive: faker.datatype.boolean({ probability: 0.9 }),
    }
  })

  await prisma.product.createMany({ data: productsData })
  const products = await prisma.product.findMany()

  console.log("Generating Product Variants...")
  const variantsData: any[] = []
  for (const product of products) {
    if (faker.datatype.boolean({ probability: 0.4 })) {
      variantsData.push({
        productId: product.id,
        attribute: faker.helpers.arrayElement([
          "sla",
          "compute",
          "bandwidth",
          "region",
        ]),
        value: faker.helpers.arrayElement([
          "us-east",
          "eu-west",
          "99.9%",
          "unlimited",
          "standard",
        ]),
        extraPrice: parseFloat(
          faker.commerce.price({ min: 5, max: 50, dec: 2 })
        ),
      })
      variantsData.push({
        productId: product.id,
        attribute: "tier",
        value: faker.helpers.arrayElement(["basic", "pro", "enterprise"]),
        extraPrice: parseFloat(
          faker.commerce.price({ min: 50, max: 500, dec: 2 })
        ),
      })
    }
  }
  if (variantsData.length > 0) {
    await prisma.productVariant.createMany({ data: variantsData })
  }
  const variants = await prisma.productVariant.findMany()

  // 4. Recurring Plans & Prices
  console.log("Generating Recurring Plans...")
  const plansData = Array.from({ length: 15 }).map(() => ({
    name: toManual(
      faker.word.adjective() +
        " " +
        faker.helpers.arrayElement([
          "starter",
          "growth",
          "business",
          "pro",
          "enterprise",
          "scale",
        ])
    ),
    billingPeriod: faker.helpers.arrayElement([
      "daily",
      "weekly",
      "monthly",
      "monthly",
      "yearly",
      "yearly",
    ]),
    price: parseFloat(faker.commerce.price({ min: 199, max: 9999, dec: 2 })),
    minQuantity: faker.number.int({ min: 1, max: 5 }),
    autoClose: faker.datatype.boolean({ probability: 0.1 }),
    closable: faker.datatype.boolean({ probability: 0.9 }),
    pausable: faker.datatype.boolean({ probability: 0.5 }),
    renewable: true,
    isActive: true,
  }))
  await prisma.recurringPlan.createMany({ data: plansData })
  const plans = await prisma.recurringPlan.findMany()

  console.log("Generating Recurring Prices...")
  const recurringPrices: any[] = []
  for (const plan of plans) {
    // Pick 5 random products for each plan
    const samplePros = faker.helpers.arrayElements(products, 5)
    for (const p of samplePros) {
      recurringPrices.push({
        productId: p.id,
        recurringPlanId: plan.id,
        price: parseFloat(
          faker.commerce.price({
            min: plan.price * 0.8,
            max: plan.price * 1.5,
            dec: 2,
          })
        ),
      })
    }
  }
  await prisma.recurringPrice.createMany({
    data: recurringPrices,
    skipDuplicates: true,
  })

  // 5. Users & Contacts
  console.log("Generating Users & Contacts...")
  // include some internal/admin
  const specialUsers = [
    {
      name: "admin sumit",
      email: "admin2@demo.com",
      role: "admin",
      password: passwordHash,
    },
    {
      name: "staff rahul",
      email: "staff2@demo.com",
      role: "internal",
      password: passwordHash,
    },
    {
      name: "portal rohan",
      email: "portal2@demo.com",
      role: "portal",
      password: passwordHash,
    },
  ]

  const userList = Array.from({ length: 150 }).map(() => {
    const fn = faker.person.firstName()
    const ln = faker.person.lastName()
    return {
      name: toManual(`${fn} ${ln}`),
      email: toManual(faker.internet.email({ firstName: fn, lastName: ln })),
      role: faker.helpers.weightedArrayElement([
        { weight: 80, value: "portal" },
        { weight: 15, value: "internal" },
        { weight: 5, value: "admin" },
      ]),
      password: passwordHash,
      phone: toManual(faker.phone.number()),
    }
  })

  await prisma.user.createMany({
    data: [...specialUsers, ...userList],
    skipDuplicates: true,
  })
  const users = await prisma.user.findMany({ where: { role: "portal" } })
  const internalUsers = await prisma.user.findMany({
    where: { role: { in: ["internal", "admin"] } },
  })

  console.log("Generating Contacts for portal users...")
  const contactsData: any[] = []
  users.forEach((u) => {
    const names = u.name.split(" ")
    contactsData.push({
      userId: u.id,
      firstName: names[0] || toManual(faker.person.firstName()),
      lastName: names.slice(1).join(" ") || toManual(faker.person.lastName()),
      company: faker.datatype.boolean({ probability: 0.3 })
        ? toManual(faker.company.name())
        : null,
      phone: u.phone,
      address: toManual(faker.location.streetAddress()),
      city: toManual(faker.location.city()),
      state: toManual(faker.location.state()),
      zip: faker.location.zipCode(),
      country: toManual(faker.location.country()),
      notes: faker.datatype.boolean({ probability: 0.2 })
        ? toManual(faker.lorem.sentence())
        : null,
    })
  })
  await prisma.contact.createMany({ data: contactsData, skipDuplicates: true })
  const contacts = await prisma.contact.findMany()

  // 6. Subscriptions
  console.log("Generating Subscriptions...")
  for (let i = 0; i < 200; i++) {
    const contact = faker.helpers.arrayElement(contacts)
    const plan = faker.helpers.arrayElement(plans)
    const term = faker.helpers.arrayElement(paymentTerms)
    const salesperson = faker.helpers.arrayElement(internalUsers)

    const statuses = ["draft", "quotation", "confirmed", "active", "closed"]
    const status = faker.helpers.weightedArrayElement([
      { weight: 10, value: "draft" },
      { weight: 10, value: "quotation" },
      { weight: 20, value: "confirmed" },
      { weight: 50, value: "active" },
      { weight: 10, value: "closed" },
    ])

    const startDate = faker.date.past({ years: 1 })
    const sub = await prisma.subscription.create({
      data: {
        subscriptionNumber: `sub-${faker.string.alphanumeric(6).toLowerCase()}`,
        status,
        contactId: contact.id,
        userId: contact.userId,
        salespersonId: salesperson.id,
        recurringPlanId: plan.id,
        paymentTermsId: term.id,
        startDate:
          status === "active" || status === "closed" ? startDate : null,
        expirationDate:
          status === "active" ? faker.date.future({ years: 1 }) : undefined,
        notes: faker.datatype.boolean() ? toManual(faker.lorem.words(5)) : null,
        lines: {
          create: Array.from({
            length: faker.number.int({ min: 1, max: 4 }),
          }).map(() => {
            const p = faker.helpers.arrayElement(products)
            const v = variants.find((val) => val.productId === p.id)
            const qty = faker.number.int({ min: 1, max: 10 })
            return {
              productId: p.id,
              variantId: v?.id ?? null,
              quantity: qty,
              unitPrice: p.salesPrice,
              taxAmount: p.salesPrice * 0.18,
              subtotal: p.salesPrice * qty,
            }
          }),
        },
      },
    })

    // Create an Invoice for confirmed/active/closed subs
    if (["confirmed", "active", "closed"].includes(status)) {
      const invStatus =
        status === "confirmed"
          ? "confirmed"
          : faker.helpers.arrayElement(["paid", "confirmed", "cancelled"])

      const relatedLines = await prisma.subscriptionLine.findMany({
        where: { subscriptionId: sub.id },
        include: { product: true },
      })
      let subT = 0,
        taxT = 0
      const invLines = relatedLines.map((sl) => {
        subT += sl.subtotal
        taxT += sl.taxAmount
        return {
          productId: sl.productId,
          variantId: sl.variantId,
          name: toManual(sl.product.name),
          quantity: sl.quantity,
          unitPrice: sl.unitPrice,
          taxAmount: sl.taxAmount,
          subtotal: sl.subtotal,
        }
      })

      const invoice = await prisma.invoice.create({
        data: {
          invoiceNumber: `inv-${faker.string.alphanumeric(6).toLowerCase()}`,
          status: invStatus,
          subscriptionId: sub.id,
          contactId: sub.contactId,
          userId: sub.userId,
          subtotal: subT,
          taxTotal: taxT,
          discountTotal: 0,
          total: subT + taxT,
          amountDue: invStatus === "paid" ? 0 : subT + taxT,
          dueDate: faker.date.soon({ days: term.dueDays || 30 }),
          paidAt: invStatus === "paid" ? faker.date.recent({ days: 30 }) : null,
          notes: faker.datatype.boolean()
            ? toManual(faker.lorem.sentence())
            : null,
          lines: {
            create: invLines,
          },
        },
      })

      // Create Payment if paid
      if (invStatus === "paid") {
        await prisma.payment.create({
          data: {
            invoiceId: invoice.id,
            createdById: salesperson.id,
            paymentMethod: faker.helpers.arrayElement([
              "credit_card",
              "bank_transfer",
              "cash",
              "stripe",
            ]),
            amount: invoice.total,
            paymentDate: invoice.paidAt!,
            gatewayOrderId: `go_${faker.string.alphanumeric(8).toLowerCase()}`,
            gatewayPaymentId: `gp_${faker.string.alphanumeric(12).toLowerCase()}`,
            notes: toManual("auto generated payment"),
          },
        })
      }
    }
  }

  // 7. Discounts
  console.log("Generating Discounts...")
  const discountsData = Array.from({ length: 20 }).map(() => ({
    name: toManual(
      faker.helpers.arrayElement([
        "welcome promo",
        "christmas deal",
        "founder discount",
        "annual bonus",
        "loyalty gift",
      ])
    ),
    code: faker.string.alphanumeric({ length: 8, casing: "lower" }),
    type: faker.helpers.arrayElement(["percentage", "fixed"]),
    value: faker.number.int({ min: 5, max: 30 }),
    minPurchase: faker.number.int({ min: 0, max: 1000 }),
    startDate: faker.date.past({ years: 1 }),
    endDate: faker.date.future({ years: 1 }),
    usageLimit: faker.number.int({ min: 10, max: 100 }),
    usageCount: faker.number.int({ min: 0, max: 10 }),
    isActive: faker.datatype.boolean({ probability: 0.8 }),
  }))
  await prisma.discount.createMany({ data: discountsData })
  const discounts = await prisma.discount.findMany()

  console.log("Generating Discount Products mapping...")
  const discProdData: any[] = []
  discounts.forEach((d) => {
    const selected = faker.helpers.arrayElements(
      products,
      faker.number.int({ min: 1, max: 5 })
    )
    selected.forEach((p) => {
      discProdData.push({ discountId: d.id, productId: p.id })
    })
  })
  await prisma.discountProduct.createMany({
    data: discProdData,
    skipDuplicates: true,
  })

  // 8. Quotation Templates
  console.log("Generating Quotation Templates...")
  for (let i = 0; i < 15; i++) {
    const plan = faker.helpers.arrayElement(plans)
    await prisma.quotationTemplate.create({
      data: {
        name: toManual(
          faker.company.buzzAdjective() +
            " " +
            faker.helpers.arrayElement([
              "business proposal",
              "standard quote",
              "renewal package",
            ])
        ),
        validityDays: faker.number.int({ min: 7, max: 60 }),
        recurringPlanId: plan.id,
        lines: {
          create: Array.from({
            length: faker.number.int({ min: 1, max: 4 }),
          }).map(() => ({
            productName: toManual(
              faker.helpers.arrayElement([
                "cloud instance",
                "support tier",
                "api proxy",
                "managed database",
                "onboarding session",
              ])
            ),
            description: toManual(
              faker.helpers.arrayElement([
                "premium sla",
                "yearly commitment",
                "volume compute",
                "high availability",
              ])
            ),
            quantity: faker.number.int({ min: 1, max: 5 }),
            unitPrice: parseFloat(
              faker.commerce.price({ min: 50, max: 1000, dec: 2 })
            ),
          })),
        },
      },
    })
  }

  // 9. Activity Logs
  console.log("Generating Activity Logs...")
  const actions = [
    "SUBSCRIPTION_CREATED",
    "INVOICE_PAID",
    "USER_LOGGED_IN",
    "PRODUCT_UPDATED",
    "DISCOUNT_APPLIED",
  ]
  const entities = ["Subscription", "Invoice", "User", "Product", "Discount"]
  const logsData = Array.from({ length: 300 }).map(() => {
    const actor = faker.helpers.arrayElement(internalUsers)
    return {
      type: faker.helpers.arrayElement(actions),
      entityType: faker.helpers.arrayElement(entities),
      entityId: faker.string.uuid(),
      actorId: actor.id,
      details: JSON.stringify({
        note: toManual("system action log auto-entry"),
        ip: faker.internet.ipv4(),
      }),
      createdAt: faker.date.recent({ days: 90 }),
    }
  })
  await prisma.activityLog.createMany({ data: logsData })

  // 10. Services & Bundles additional heavy fill
  // (Assuming there are some from main seed, we just add random manual ones to pad it out)
  console.log("Generating extra Services & Bundles...")
  const newServices = Array.from({ length: 40 }).map(() => ({
    name: toManual(faker.company.name() + " tool"),
    slug: faker.string.alphanumeric(10).toLowerCase() + "-svc",
    category: faker.helpers.arrayElement([
      "productivity",
      "ai",
      "communication",
      "security",
      "cloud",
    ]),
    color: faker.color.rgb(),
    monthlyPrice: parseFloat(
      faker.commerce.price({ min: 5, max: 150, dec: 2 })
    ),
    yearlyPrice: parseFloat(
      faker.commerce.price({ min: 40, max: 1500, dec: 2 })
    ),
    description: toManual(faker.company.catchPhrase()),
    isActive: true,
  }))
  await prisma.service.createMany({ data: newServices })
  const allServices = await prisma.service.findMany()

  const newBundles: any[] = []
  for (let i = 0; i < 20; i++) {
    const servicesForBundle = faker.helpers.arrayElements(
      allServices,
      faker.number.int({ min: 2, max: 5 })
    )
    const isCustom = faker.datatype.boolean({ probability: 0.3 })
    const u = isCustom ? faker.helpers.arrayElement(users) : null

    newBundles.push({
      name: toManual(faker.word.adjective() + " pack"),
      slug: faker.string.alphanumeric(8).toLowerCase() + "-bndl",
      description: toManual("combo special value"),
      type: isCustom
        ? "custom"
        : faker.helpers.arrayElement(["predefined", "suggested"]),
      discountType: "percentage",
      discountValue: faker.number.int({ min: 5, max: 25 }),
      createdById: u ? u.id : null,
      isActive: true,
    })
  }
  await prisma.bundle.createMany({ data: newBundles })
  const allBundles = await prisma.bundle.findMany({
    where: { slug: { endsWith: "-bndl" } },
  })

  const bundleServices: any[] = []
  allBundles.forEach((b) => {
    let order = 1
    const servicesForBundle = faker.helpers.arrayElements(
      allServices,
      faker.number.int({ min: 2, max: 5 })
    )
    servicesForBundle.forEach((s) => {
      bundleServices.push({
        bundleId: b.id,
        serviceId: s.id,
        order: order++,
      })
    })
  })
  await prisma.bundleService.createMany({
    data: bundleServices,
    skipDuplicates: true,
  })

  const diff = process.hrtime(hrTimeStart)
  console.log(
    `Heavy Dummy Data Generated in ${(diff[0] * 1e9 + diff[1]) / 1e6} ms!`
  )
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
