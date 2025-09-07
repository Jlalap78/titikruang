import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { filterMessage, containsBlockedWord } from "./filterMessage";

// Kirim pesan ke grup / ruang
export async function sendMessage(path, { text, uid, imageUrl = null }) {
  if (containsBlockedWord(text)) {
    alert("Pesan mengandung kata terlarang!");
    return;
  }

  const cleanText = filterMessage(text);

  await addDoc(collection(db, ...path), {
    text: cleanText,
    uid,
    imageUrl,
    timestamp: serverTimestamp(),
  });
}
