import formidable from 'formidable';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import admin from '../../lib/firebaseAdmin';

export const config = {
  api: { bodyParser: false },
};

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Form parse error:', err);
      return res.status(500).json({ error: 'Form parsing failed' });
    }

    const uploadedFile = files.file;

    if (!uploadedFile) {
      return res.status(400).json({ error: 'No file uploaded (field "file" missing)' });
    }

    if (!uploadedFile.mimetype.startsWith('image/')) {
      return res.status(400).json({ error: 'Uploaded file is not an image' });
    }

    try {
      // Upload ke Cloudinary
      const uploadResult = await cloudinary.uploader.upload(uploadedFile.filepath, {
        folder: 'uploads',
        resource_type: 'image',
      });

      // Simpan metadata ke Firestore
      await admin.firestore().collection('uploads').add({
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Hapus file sementara
      fs.unlinkSync(uploadedFile.filepath);

      res.status(200).json({ url: uploadResult.secure_url });
    } catch (uploadErr) {
      console.error('Upload error:', uploadErr);
      res.status(500).json({ error: 'Upload failed' });
    }
  });
}
