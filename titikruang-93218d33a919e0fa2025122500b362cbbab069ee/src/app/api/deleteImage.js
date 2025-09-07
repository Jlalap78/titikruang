import { v2 as cloudinary } from "cloudinary";
import { db } from "@/lib/firebase";
import { doc, deleteDoc } from "firebase/firestore";

// Konfigurasi Cloudinary (gunakan ENV)
cloudinary.config({
  cloud_name: doaw5ymiw,
  api_key: 723472226413537,
  api_secret: I2eRpKDM2310srV6FonhcaXbMbk,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { publicId, messageId, groupId } = req.body;

    // 1. Hapus dari Cloudinary
    await cloudinary.uploader.destroy(publicId);

    // 2. Hapus dokumen pesan di Firestore
    await deleteDoc(doc(db, "groups", groupId, "messages", messageId));

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
