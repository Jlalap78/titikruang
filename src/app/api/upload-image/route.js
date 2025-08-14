// src/app/api/upload-image/route.js
import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: doaw5ymiw,
  api_key: 723472226413537,
  api_secret: I2eRpKDM2310srV6FonhcaXbMbk,
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { dataUrl, filename, folder = 'chatImages' } = body;

    if (!dataUrl) {
      return NextResponse.json({ error: 'Missing dataUrl' }, { status: 400 });
    }

    // Cloudinary accepts base64 dataUrl directly
    // you may set transformations or folder here
    const result = await cloudinary.uploader.upload(dataUrl, {
      folder,
      public_id: filename ? filename.replace(/\.[^/.]+$/, '') : undefined,
      overwrite: false,
      resource_type: 'image',
      // eager, transformation, quality, etc. can be added
    });

    return NextResponse.json({ url: result.secure_url });
  } catch (err) {
    console.error('Cloudinary upload error', err);
    return NextResponse.json({ error: 'Upload failed', detail: err.message }, { status: 500 });
  }
}
