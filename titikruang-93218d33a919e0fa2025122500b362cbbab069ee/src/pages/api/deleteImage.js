import { v2 as cloudinary } from "cloudinary";
import { db } from "../../lib/firebase";
import { doc, deleteDoc } from "firebase/firestore";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { publicId } = req.body;
    if (!publicId) {
      return res.status(400).json({ error: "publicId diperlukan" });
    }

    const result = await cloudinary.v2.uploader.destroy(publicId);
    return res.status(200).json({ success: true, result });
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    return res.status(500).json({ error: "Gagal menghapus gambar" });
  }
}