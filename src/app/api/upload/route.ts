import { NextRequest, NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "xunique-management/documents";
    const customFilename = (formData.get("filename") as string) || undefined;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided for upload." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Determine resource type: images as image, pdfs/docs/archives/etc as auto or raw
    const mimeType = file.type || "";
    let resource_type: "auto" | "image" | "raw" = "auto";
    if (mimeType.startsWith("image/")) {
      resource_type = "image";
    }

    const result = await uploadToCloudinary(buffer, {
      folder,
      filename: customFilename || file.name,
      resource_type,
    });

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      secure_url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      bytes: result.bytes,
      original_filename: file.name,
    });
  } catch (error: any) {
    console.error("Cloudinary upload error:", error);
    return NextResponse.json(
      { error: error.message || "Cloudinary upload failed." },
      { status: 500 }
    );
  }
}
