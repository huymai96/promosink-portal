import { prisma } from "@/lib/prisma";

export type DecorationMethodCode = "SCREEN" | "EMB" | "DTG" | "DTF";

export interface PricingInput {
  customerAccountId: string | null;
  method: DecorationMethodCode;
  quantity: number;
  colorCount?: number;
  stitchCount?: number;
}

export interface PricingOutput {
  unitPrice: number;
  setupCharge: number;
  totalPrice: number;
}

/**
 * Calculate decoration pricing based on customer-specific or global price tables
 */
export async function calculateDecorationPrice(
  input: PricingInput
): Promise<PricingOutput> {
  const { customerAccountId, method, quantity, colorCount, stitchCount } = input;

  // Find the decoration method
  const decorationMethod = await prisma.decorationMethod.findUnique({
    where: { code: method },
  });

  if (!decorationMethod) {
    throw new Error(`Decoration method ${method} not found`);
  }

  // Try to find customer-specific pricing first, then fall back to global
  const priceTable = await prisma.decorationPriceTable.findFirst({
    where: {
      decorationMethodId: decorationMethod.id,
      OR: [
        { customerAccountId: customerAccountId || null },
        { customerAccountId: null }, // global/default
      ],
      minQty: { lte: quantity },
      OR: [
        { maxQty: null },
        { maxQty: { gte: quantity } },
      ],
      // For screen printing, check color count
      ...(method === "SCREEN" && colorCount
        ? {
            OR: [
              { maxColors: null },
              { maxColors: { gte: colorCount } },
            ],
          }
        : {}),
      // For embroidery, check stitch count
      ...(method === "EMB" && stitchCount
        ? {
            OR: [
              { maxStitches: null },
              { maxStitches: { gte: stitchCount } },
            ],
          }
        : {}),
    },
    orderBy: [
      { customerAccountId: "desc" }, // Prefer customer-specific
      { minQty: "desc" }, // Prefer higher min qty (more specific)
    ],
  });

  if (!priceTable) {
    // Default pricing if no table found
    return {
      unitPrice: 0,
      setupCharge: 0,
      totalPrice: 0,
    };
  }

  const unitPrice = priceTable.pricePerUnit;
  const setupCharge = priceTable.setupCharge || 0;
  const totalPrice = unitPrice * quantity + setupCharge;

  return {
    unitPrice,
    setupCharge,
    totalPrice,
  };
}

