import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { submitOrder } from "@/lib/promosinkApi";
import { getShippingRates } from "@/lib/easypost";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !session.user.tenantId || !session.user.customerAccountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      shipToName,
      shipToAddress1,
      shipToAddress2,
      shipToCity,
      shipToState,
      shipToZip,
      shipToCountry,
      poNumber,
      inHandsDate,
      notes,
      shippingMethodId,
    } = await request.json();

    // Get cart
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

    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      );
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}`;

    // Get shipping cost (simplified - in production, store this from the selected option)
    const shippingCost = 0; // Will be calculated from selected option

    // Create order in database
    const order = await prisma.order.create({
      data: {
        tenantId: session.user.tenantId as string,
        customerAccountId: session.user.customerAccountId as string,
        orderNumber,
        poNumber,
        shipToName,
        shipToAddress1,
        shipToAddress2: shipToAddress2 || null,
        shipToCity,
        shipToState,
        shipToZip,
        shipToCountry: shipToCountry || "US",
        inHandsDate: inHandsDate ? new Date(inHandsDate) : null,
        notes: notes || null,
        shippingMethod: shippingMethodId,
        shippingCost,
        status: "RECEIVED",
      },
    });

    // Create order lines
    for (const item of cart.items) {
      await prisma.orderLine.create({
        data: {
          orderId: order.id,
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        },
      });

      // Create order decorations if present
      if (item.decorationMethodId && item.decorationConfig) {
        const config = item.decorationConfig as any;
        for (const location of config.locations || []) {
          await prisma.orderDecoration.create({
            data: {
              orderId: order.id,
              decorationMethodId: item.decorationMethodId,
              location: location.location,
              config: location.config,
              quantity: item.quantity,
              unitPrice: item.decorationPrice || 0,
              setupCharge: item.setupCharge || 0,
            },
          });
        }
      }
    }

    // Submit to Promos Ink API
    const orderPayload = {
      orderNumber,
      customerAccountId: session.user.customerAccountId as string,
      poNumber,
      shipTo: {
        name: shipToName,
        address1: shipToAddress1,
        address2: shipToAddress2,
        city: shipToCity,
        state: shipToState,
        zip: shipToZip,
        country: shipToCountry || "US",
      },
      inHandsDate: inHandsDate || undefined,
      shippingMethod: shippingMethodId,
      shippingCost,
      items: cart.items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
      decorations: cart.items
        .filter((item) => item.decorationMethodId && item.decorationConfig)
        .map((item) => ({
          method: item.decorationMethod!.code,
          location: (item.decorationConfig as any).locations?.[0]?.location || "",
          quantity: item.quantity,
          unitPrice: item.decorationPrice || 0,
          setupCharge: item.setupCharge || 0,
          config: item.decorationConfig,
        })),
      notes: notes || undefined,
    };

    const apiResponse = await submitOrder(orderPayload);

    if (apiResponse.success && apiResponse.data) {
      // Update order with external ID
      await prisma.order.update({
        where: { id: order.id },
        data: { externalId: apiResponse.data.externalId },
      });
    }

    // Clear cart
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error) {
    console.error("Submit order error:", error);
    return NextResponse.json(
      { error: "Failed to submit order" },
      { status: 500 }
    );
  }
}

