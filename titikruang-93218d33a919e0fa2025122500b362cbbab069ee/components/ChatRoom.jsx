"use client";
import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { v4 as uuidv4 } from "uuid";

export default function ChatRoom() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("createdAt"));
    const unsub = onSnapshot(q, (snap) => {
      const msgs = [];
      snap.forEach((doc) => msgs.push({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });
    return () => unsub();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    let imageUrl = null;

    if (image) {
      const imageRef = ref(storage, `uploads/${uuidv4()}`);
      const snap = await uploadBytes(imageRef, image);
      imageUrl = await getDownloadURL(snap.ref);
    }

    await addDoc(collection(db, "messages"), {
      text: input,
      imageUrl: imageUrl || null,
      createdAt: serverTimestamp(),
    });

    setInput("");
    setImage(null);
    setPreview(null);
  };

  return (
    <div className="p-4 bg-[#F2F2F2] min-h-screen text-black">
      <div className="space-y-2 mb-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className="bg-white p-3 rounded-xl shadow-md text-sm"
          >
            {msg.text && <p className="mb-1">{msg.text}</p>}
            {msg.imageUrl && (
              <img
                src={msg.imageUrl}
                alt="uploaded"
                className="max-w-xs rounded-lg mt-2"
              />
            )}
          </div>
        ))}
      </div>

      {preview && (
        <div className="mb-2">
          <p className="text-sm mb-1">Image Preview:</p>
          <img src={preview} alt="preview" className="max-w-xs rounded" />
        </div>
      )}

      <form onSubmit={sendMessage} className="flex flex-col gap-2">
        <textarea
          rows="2"
          className="p-2 rounded-md border border-gray-300"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
        />
        <div className="flex items-center justify-between gap-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="text-sm"
          />
          <button
            type="submit"
            className="bg-[#3061F2] text-white px-4 py-2 rounded-md hover:bg-[#27A4F2]"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
