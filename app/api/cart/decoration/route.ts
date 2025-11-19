import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateDecorationPrice } from "@/lib/pricing";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { cartItemId, config } = await request.json();

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true },
    });

    if (!cartItem || cartItem.cart.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Cart item not found" },
        { status: 404 }
      );
    }

    // For now, use the first location's method
    // In production, you might want to support multiple methods per item
    const method = config.method as "SCREEN" | "EMB" | "DTG" | "DTF";
    const firstLocation = config.locations[0];
    
    const colorCount = firstLocation?.config.numberOfColors;
    const stitchCount = firstLocation?.config.stitchCount;

    // Calculate pricing
    const pricing = await calculateDecorationPrice({
      customerAccountId: session.user.customerAccountId as string | null,
      method,
      quantity: cartItem.quantity,
      colorCount,
      stitchCount,
    });

    // Get decoration method
    const decorationMethod = await prisma.decorationMethod.findUnique({
      where: { code: method },
    });

    if (!decorationMethod) {
      return NextResponse.json(
        { error: "Decoration method not found" },
        { status: 404 }
      );
    }

    // Update cart item
    await prisma.cartItem.update({
      where: { id: cartItemId },
      data: {
        decorationMethodId: decorationMethod.id,
        decorationConfig: config,
        decorationPrice: pricing.unitPrice,
        setupCharge: pricing.setupCharge,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Save decoration error:", error);
    return NextResponse.json(
      { error: "Failed to save decoration" },
      { status: 500 }
    );
  }
}

