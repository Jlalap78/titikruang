import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export async function uploadImageAndSaveMessage(file, groupId, uid) {
  try {
    // ✅ Ambil Cloudinary cloud_name dari ENV
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET; // juga dari ENV

    if (!cloudName || !uploadPreset) {
      throw new Error("Cloudinary config belum diatur di environment variables");
    }

    // 1. Upload ke Cloudinary
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const cloudinaryRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
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
