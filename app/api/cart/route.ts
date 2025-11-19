import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id as string },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
            decorationMethod: true,
          },
        },
      },
    });

    if (!cart) {
      return NextResponse.json({ items: [], total: 0 });
    }

    const total = cart.items.reduce((sum, item) => {
      const itemTotal = (item.unitPrice + (item.decorationPrice || 0)) * item.quantity;
      return sum + itemTotal + (item.setupCharge || 0);
    }, 0);

    return NextResponse.json({
      items: cart.items,
      total,
    });
  } catch (error) {
    console.error("Get cart error:", error);
    return NextResponse.json(
      { error: "Failed to get cart" },
      { status: 500 }
    );
  }
}

