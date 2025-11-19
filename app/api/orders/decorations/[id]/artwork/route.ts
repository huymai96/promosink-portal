import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { put } from "@vercel/blob";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const isProof = formData.get("isProof") === "true";

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Upload to Vercel Blob
    let blobUrl: string;
    let fileName = file.name;
    let fileType = file.type;

    try {
      const blob = await put(file.name, file, {
        access: "public",
      });
      blobUrl = blob.url;
    } catch (error: any) {
      // If BLOB_READ_WRITE_TOKEN is not set, use a mock URL
      if (error.message?.includes("BLOB_READ_WRITE_TOKEN") || !process.env.BLOB_READ_WRITE_TOKEN) {
        console.log("Vercel Blob token not configured, using mock URL");
        blobUrl = `https://demo.promosink.com/uploads/${Date.now()}-${file.name}`;
      } else {
        throw error;
      }
    }

    const decoration = await prisma.orderDecoration.findUnique({
      where: { id: params.id },
      include: {
        order: true,
      },
    });

    if (!decoration) {
      return NextResponse.json(
        { error: "Decoration not found" },
        { status: 404 }
      );
    }

    // Verify user has access to this order
    if (
      decoration.order.customerAccountId !== session.user.customerAccountId
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Create artwork asset
    const asset = await prisma.artworkAsset.create({
      data: {
        orderDecorationId: decoration.id,
        blobUrl,
        fileName,
        fileType,
        isProof: isProof || false,
        version: 1,
      },
    });

    // If it's a proof, create a proof record
    if (isProof) {
      await prisma.proof.create({
        data: {
          orderDecorationId: decoration.id,
          status: "PENDING_CUSTOMER",
        },
      });
    }

    return NextResponse.json({ success: true, asset });
  } catch (error) {
    console.error("Upload artwork error:", error);
    return NextResponse.json(
      { error: "Failed to upload artwork" },
      { status: 500 }
    );
  }
}

