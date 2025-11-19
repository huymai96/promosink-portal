import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { comment } = await request.json();

    const proof = await prisma.proof.findUnique({
      where: { id },
      include: {
        orderDecoration: {
          include: {
            order: true,
          },
        },
      },
    });

    if (!proof) {
      return NextResponse.json(
        { error: "Proof not found" },
        { status: 404 }
      );
    }

    // Verify user has access to this order
    if (
      proof.orderDecoration.order.customerAccountId !==
      session.user.customerAccountId
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.proof.update({
      where: { id },
      data: {
        status: "APPROVED",
        customerComment: comment || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Approve proof error:", error);
    return NextResponse.json(
      { error: "Failed to approve proof" },
      { status: 500 }
    );
  }
}

