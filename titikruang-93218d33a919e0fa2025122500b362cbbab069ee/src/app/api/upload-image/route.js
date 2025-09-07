import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { dataUrl, filename, folder = "chatImages" } = body;

    if (!dataUrl) {
      return NextResponse.json({ error: "Missing dataUrl" }, { status: 400 });
    }

    const result = await cloudinary.uploader.upload(dataUrl, {
      folder,
      public_id: filename ? filename.replace(/\.[^/.]+$/, "") : undefined,
      overwrite: false,
      resource_type: "image",
    });

    return NextResponse.json({ url: result.secure_url });
  } catch (err) {
    console.error("Cloudinary upload error", err);
    return NextResponse.json(
      { error: "Upload failed", detail: err.message },
      { status: 500 }
    );
  }
}
