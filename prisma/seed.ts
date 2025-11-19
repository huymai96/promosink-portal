import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create default tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: "default" },
    update: {},
    create: {
      slug: "default",
      name: "Default Tenant",
      primaryColor: "#4F46E5",
      secondaryColor: "#6366F1",
    },
  });

  console.log("Created tenant:", tenant.slug);

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@promosink.com" },
    update: {},
    create: {
      email: "admin@promosink.com",
      password: adminPassword,
      name: "Admin User",
      role: "ADMIN",
      tenantId: tenant.id,
    },
  });

  console.log("Created admin user:", admin.email);

  // Create customer account
  const customerAccount = await prisma.customerAccount.create({
    data: {
      tenantId: tenant.id,
      name: "Acme Corporation",
      accountNumber: "ACME-001",
    },
  });

  console.log("Created customer account:", customerAccount.name);

  // Create customer user
  const customerPassword = await bcrypt.hash("customer123", 10);
  const customerUser = await prisma.user.create({
    data: {
      email: "customer@acme.com",
      password: customerPassword,
      name: "Customer User",
      role: "CUSTOMER_USER",
      tenantId: tenant.id,
      customerUser: {
        create: {
          customerAccountId: customerAccount.id,
        },
      },
    },
  });

  console.log("Created customer user:", customerUser.email);

  // Create decoration methods
  const decorationMethods = await Promise.all([
    prisma.decorationMethod.upsert({
      where: { code: "SCREEN" },
      update: {},
      create: {
        code: "SCREEN",
        name: "Screen Printing",
      },
    }),
    prisma.decorationMethod.upsert({
      where: { code: "EMB" },
      update: {},
      create: {
        code: "EMB",
        name: "Embroidery",
      },
    }),
    prisma.decorationMethod.upsert({
      where: { code: "DTG" },
      update: {},
      create: {
        code: "DTG",
        name: "Direct to Garment",
      },
    }),
    prisma.decorationMethod.upsert({
      where: { code: "DTF" },
      update: {},
      create: {
        code: "DTF",
        name: "Direct to Film",
      },
    }),
  ]);

  console.log("Created decoration methods");

  // Create price tables
  const screenMethod = decorationMethods[0];
  await prisma.decorationPriceTable.createMany({
    data: [
      // Global/default pricing
      {
        decorationMethodId: screenMethod.id,
        customerAccountId: null,
        minQty: 1,
        maxQty: 11,
        maxColors: 1,
        pricePerUnit: 5.0,
        setupCharge: 25.0,
      },
      {
        decorationMethodId: screenMethod.id,
        customerAccountId: null,
        minQty: 12,
        maxQty: 47,
        maxColors: 1,
        pricePerUnit: 4.0,
        setupCharge: 25.0,
      },
      {
        decorationMethodId: screenMethod.id,
        customerAccountId: null,
        minQty: 48,
        maxQty: null,
        maxColors: 1,
        pricePerUnit: 3.0,
        setupCharge: 25.0,
      },
      // Customer-specific pricing
      {
        decorationMethodId: screenMethod.id,
        customerAccountId: customerAccount.id,
        minQty: 1,
        maxQty: 11,
        maxColors: 1,
        pricePerUnit: 4.5,
        setupCharge: 20.0,
      },
      {
        decorationMethodId: screenMethod.id,
        customerAccountId: customerAccount.id,
        minQty: 12,
        maxQty: null,
        maxColors: 1,
        pricePerUnit: 3.5,
        setupCharge: 20.0,
      },
    ],
  });

  console.log("Created price tables");

  // Create warehouses
  const warehouses = await Promise.all([
    prisma.warehouse.create({
      data: {
        code: "LA",
        name: "Los Angeles Warehouse",
        address: "123 Warehouse St, Los Angeles, CA 90001",
      },
    }),
    prisma.warehouse.create({
      data: {
        code: "NY",
        name: "New York Warehouse",
        address: "456 Distribution Ave, New York, NY 10001",
      },
    }),
  ]);

  console.log("Created warehouses");

  // Create supplier
  const supplier = await prisma.supplier.create({
    data: {
      name: "SanMar",
      code: "SANMAR",
    },
  });

  console.log("Created supplier");

  // Create sample products
  const products = [
    {
      styleCode: "TSH-001",
      name: "Classic T-Shirt",
      description: "100% cotton classic fit t-shirt",
      brand: "Gildan",
      category: "T-Shirts",
      gender: "Unisex",
      fabric: "100% Cotton",
      imageUrl: "https://via.placeholder.com/500",
      variants: [
        {
          color: "Black",
          size: "S",
          supplierSku: "TSH-001-BLK-S",
          weight: 5.5,
        },
        {
          color: "Black",
          size: "M",
          supplierSku: "TSH-001-BLK-M",
          weight: 5.5,
        },
        {
          color: "Black",
          size: "L",
          supplierSku: "TSH-001-BLK-L",
          weight: 5.5,
        },
        {
          color: "Navy",
          size: "S",
          supplierSku: "TSH-001-NAV-S",
          weight: 5.5,
        },
        {
          color: "Navy",
          size: "M",
          supplierSku: "TSH-001-NAV-M",
          weight: 5.5,
        },
        {
          color: "Navy",
          size: "L",
          supplierSku: "TSH-001-NAV-L",
          weight: 5.5,
        },
      ],
    },
    {
      styleCode: "POLO-001",
      name: "Classic Polo",
      description: "100% cotton polo shirt",
      brand: "Hanes",
      category: "Polos",
      gender: "Unisex",
      fabric: "100% Cotton",
      imageUrl: "https://via.placeholder.com/500",
      variants: [
        {
          color: "White",
          size: "M",
          supplierSku: "POLO-001-WHT-M",
          weight: 7.0,
        },
        {
          color: "White",
          size: "L",
          supplierSku: "POLO-001-WHT-L",
          weight: 7.0,
        },
        {
          color: "Navy",
          size: "M",
          supplierSku: "POLO-001-NAV-M",
          weight: 7.0,
        },
        {
          color: "Navy",
          size: "L",
          supplierSku: "POLO-001-NAV-L",
          weight: 7.0,
        },
      ],
    },
    {
      styleCode: "SWEAT-001",
      name: "Hooded Sweatshirt",
      description: "50/50 cotton/polyester hooded sweatshirt",
      brand: "Gildan",
      category: "Sweatshirts",
      gender: "Unisex",
      fabric: "50% Cotton / 50% Polyester",
      imageUrl: "https://via.placeholder.com/500",
      variants: [
        {
          color: "Black",
          size: "M",
          supplierSku: "SWEAT-001-BLK-M",
          weight: 24.0,
        },
        {
          color: "Black",
          size: "L",
          supplierSku: "SWEAT-001-BLK-L",
          weight: 24.0,
        },
        {
          color: "Gray",
          size: "M",
          supplierSku: "SWEAT-001-GRY-M",
          weight: 24.0,
        },
        {
          color: "Gray",
          size: "L",
          supplierSku: "SWEAT-001-GRY-L",
          weight: 24.0,
        },
      ],
    },
  ];

  for (const productData of products) {
    const { variants, ...productFields } = productData;
    const product = await prisma.product.create({
      data: {
        ...productFields,
        tenantId: tenant.id,
        supplierId: supplier.id,
        variants: {
          create: variants.map((variant) => ({
            ...variant,
            inventorySnapshots: {
              create: warehouses.map((warehouse) => ({
                warehouseId: warehouse.id,
                onHand: Math.floor(Math.random() * 100) + 10,
                onOrder: Math.floor(Math.random() * 50),
              })),
            },
          })),
        },
      },
    });

    console.log(`Created product: ${product.styleCode}`);
  }

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

