import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    try {
      const blob = await put(file.name, file, {
        access: "public",
      });

      return NextResponse.json({ url: blob.url });
    } catch (error: any) {
      // If BLOB_READ_WRITE_TOKEN is not set, return a mock URL
      if (error.message?.includes("BLOB_READ_WRITE_TOKEN") || !process.env.BLOB_READ_WRITE_TOKEN) {
        console.log("Vercel Blob token not configured, using mock URL");
        return NextResponse.json({
          url: `https://demo.promosink.com/uploads/${Date.now()}-${file.name}`,
          demo: true,
        });
      }
      throw error;
    }
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

