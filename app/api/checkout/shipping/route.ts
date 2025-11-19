import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { authOptions } from "@/lib/auth";
import { getShippingRates } from "@/lib/easypost";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { toAddress } = await request.json();

    // Get cart items to calculate package weight
    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id as string },
      include: {
        items: {
          include: {
            variant: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      );
    }

    // Calculate total weight (simplified - in production, use actual package dimensions)
    const totalWeight = cart.items.reduce((sum, item) => {
      return sum + item.variant.weight * item.quantity;
    }, 0);

    // Mock from address (in production, use warehouse address)
    const fromAddress = {
      name: "Promos Ink",
      street1: "123 Warehouse St",
      city: "Los Angeles",
      state: "CA",
      zip: "90001",
      country: "US",
    };

    const packages = [
      {
        weight: totalWeight,
        length: 12,
        width: 12,
        height: 6,
      },
    ];

    const options = await getShippingRates(fromAddress, toAddress, packages);

    return NextResponse.json({ options });
  } catch (error) {
    console.error("Shipping rates error:", error);
    return NextResponse.json(
      { error: "Failed to get shipping rates" },
      { status: 500 }
    );
  }
}

