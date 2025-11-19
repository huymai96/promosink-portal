import { prisma } from "@/lib/prisma";

export interface ProductFilters {
  category?: string;
  brand?: string;
  gender?: string;
  search?: string;
}

export async function getProducts(
  tenantId: string,
  filters: ProductFilters = {},
  limit = 50,
  offset = 0
) {
  const where: any = {
    tenantId,
  };

  if (filters.category) {
    where.category = filters.category;
  }

  if (filters.brand) {
    where.brand = filters.brand;
  }

  if (filters.gender) {
    where.gender = filters.gender;
  }

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { styleCode: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        variants: {
          include: {
            inventorySnapshots: {
              include: {
                warehouse: true,
              },
              orderBy: {
                snapshotDate: "desc",
              },
              take: 1, // Latest snapshot per warehouse
            },
          },
        },
      },
      take: limit,
      skip: offset,
      orderBy: { name: "asc" },
    }),
    prisma.product.count({ where }),
  ]);

  return { products, total };
}

export async function getProductByStyleCode(tenantId: string, styleCode: string) {
  return prisma.product.findUnique({
    where: {
      tenantId_styleCode: {
        tenantId,
        styleCode,
      },
    },
    include: {
      supplier: true,
      variants: {
        include: {
          inventorySnapshots: {
            include: {
              warehouse: true,
            },
            orderBy: {
              snapshotDate: "desc",
            },
            take: 1,
          },
        },
        orderBy: [
          { color: "asc" },
          { size: "asc" },
        ],
      },
    },
  });
}

export async function getCategories(tenantId: string) {
  const products = await prisma.product.findMany({
    where: { tenantId },
    select: { category: true },
    distinct: ["category"],
  });

  return products.map((p) => p.category).sort();
}

export async function getBrands(tenantId: string) {
  const products = await prisma.product.findMany({
    where: { tenantId },
    select: { brand: true },
    distinct: ["brand"],
  });

  return products.map((p) => p.brand).filter(Boolean).sort();
}

