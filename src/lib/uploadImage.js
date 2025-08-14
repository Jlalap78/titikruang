// lib/uploadImage.js
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export async function uploadImageAndSaveMessage(file, groupId, uid) {
  try {
    // 1. Upload ke Cloudinary
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "chat_images"); // Ganti dengan preset name kamu

    const cloudinaryRes = await fetch(
      "https://api.cloudinary.com/v1_1/doaw5ymiw/image/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    if (!cloudinaryRes.ok) {
      throw new Error("Gagal mengunggah gambar ke Cloudinary");
    }

    const data = await cloudinaryRes.json();

    // 2. Simpan URL ke Firestore
    await addDoc(collection(db, "groups", groupId, "messages"), {
      text: "",
      imageUrl: data.secure_url,
      uid,
      timestamp: serverTimestamp(),
    });

    console.log("✅ Gambar berhasil diunggah dan pesan tersimpan");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}
