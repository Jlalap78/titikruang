"use client";

import { useEffect, useState, useRef } from "react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data"; // penting, biar stylenya muncul

import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  deleteDoc,
  updateDoc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../../../lib/firebase";
import { Smile, Send, Trash2, ArrowLeft } from "lucide-react";
import { filterMessage } from "../../../lib/filterMessage";
import { useRouter, useParams } from "next/navigation";

// --- name/avatar pools
const adjectives = [
  "Happy",
  "Blue",
  "Mighty",
  "Sneaky",
  "Brave",
  "Chill",
  "Silly",
  "Witty",
  "Lucky",
  "Zany",
];
const animals = [
  "Tiger",
  "Panda",
  "Otter",
  "Eagle",
  "Penguin",
  "Koala",
  "Fox",
  "Shark",
  "Bear",
  "Cat",
];
const avatarEmojis = [
  "🐯",
  "🐼",
  "🦊",
  "🦈",
  "🐻",
  "🐧",
  "🦅",
  "🐨",
  "🐱",
  "🦦",
];

function makeRandomNameAndEmoji() {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  const number = Math.floor(Math.random() * 90) + 10;
  const name = `${adj}${animal}${number}`;
  const emoji = avatarEmojis[Math.floor(Math.random() * avatarEmojis.length)];
  return { name, emoji };
}

async function ensureUserProfile(uid) {
  try {
    const ref = doc(db, "userProfiles", uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      return {
        funnyName: data.funnyName || data.name || `${uid.slice(0, 6)}`,
        avatar: data.avatar || "🙂",
      };
    } else {
      const { name, emoji } = makeRandomNameAndEmoji();
      await setDoc(ref, { funnyName: name, avatar: emoji }, { merge: true });
      return { funnyName: name, avatar: emoji };
    }
  } catch (err) {
    console.error("ensureUserProfile error", err);
    return { funnyName: `${uid.slice(0, 6)}`, avatar: "🙂" };
  }
}

function getOrCreateAnonUid() {
  if (typeof window === "undefined") return null;
  let anon = localStorage.getItem("anonUid");
  if (!anon) {
    anon = "anon_" + Math.random().toString(36).slice(2, 10);
    localStorage.setItem("anonUid", anon);
  }
  return anon;
}

export default function DiskusiDetailPage() {
  const params = useParams();
  const groupId = params.diskusiid;
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const router = useRouter();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [members, setMembers] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [showEmoji, setShowEmoji] = useState(false);
  const [anonUid, setAnonUid] = useState(null);

  const messagesEndRef = useRef(null);

  // set anon UID sekali saja
  useEffect(() => {
    setAnonUid(getOrCreateAnonUid());
  }, []);

  // scroll otomatis setelah pesan baru
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // listeners
  useEffect(() => {
    if (!groupId) return;

    const membersRef = collection(db, "groups", groupId, "members");
    const unsubMembers = onSnapshot(membersRef, (snapshot) => {
      setMembers(snapshot.docs.map((doc) => doc.id));
    });

    const messagesRef = collection(db, "groups", groupId, "messages");
    const q = query(messagesRef, orderBy("createdAt"));
    const unsubMessages = onSnapshot(q, async (snapshot) => {
      const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMessages(docs);

      // prefetch missing profiles
      const uids = Array.from(new Set(docs.map((m) => m.uid).filter(Boolean)));
      const missing = uids.filter((uid) => !profiles[uid]);
      if (missing.length > 0) {
        try {
          const results = await Promise.all(
            missing.map((uid) => ensureUserProfile(uid))
          );
          const map = {};
          missing.forEach((uid, idx) => (map[uid] = results[idx]));
          setProfiles((prev) => ({ ...prev, ...map }));
        } catch (e) {
          console.error("prefetch profiles error", e);
        }
      }
    });

    return () => {
      unsubMembers();
      unsubMessages();
    };
  }, [groupId, profiles]);

  const sendMessage = async () => {
    if (
      !newMessage.trim() ||
      !currentUser ||
      !members.includes(currentUser.uid)
    )
      return;

    if (!profiles[currentUser.uid]) {
      const p = await ensureUserProfile(currentUser.uid);
      setProfiles((prev) => ({ ...prev, [currentUser.uid]: p }));
    }
    const senderProfile =
      profiles[currentUser.uid] || (await ensureUserProfile(currentUser.uid));

    const messageRef = collection(db, "groups", groupId, "messages");
    await addDoc(messageRef, {
      text: filterMessage(newMessage.trim()),
      uid: currentUser.uid,
      name: senderProfile.funnyName,
      avatar: senderProfile.avatar,
      reactions: {},
      createdAt: serverTimestamp(),
    });
    setNewMessage("");
  };

  const toggleReaction = async (msgId, emoji) => {
    const actor = currentUser?.uid || anonUid;
    if (!actor) return;

    const msg = messages.find((m) => m.id === msgId);
    if (!msg) return;

    const reactions = msg.reactions || {};
    const arr = Array.isArray(reactions[emoji]) ? reactions[emoji] : [];
    let updated;
    if (arr.includes(actor)) {
      updated = arr.filter((id) => id !== actor);
    } else {
      updated = [...arr, actor];
    }

    await updateDoc(doc(db, "groups", groupId, "messages", msgId), {
      reactions: { ...reactions, [emoji]: updated },
    });
  };

  const deleteMessage = async (id, uid) => {
    if (uid !== currentUser?.uid) return; // proteksi
    await deleteDoc(doc(db, "groups", groupId, "messages", id));
  };

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4">
      <button
        onClick={() => router.push("/diskusi")}
        className="flex items-center gap-1 text-blue-600 hover:underline mb-2"
      >
        <ArrowLeft size={18} /> Kembali
      </button>

      <h1 className="text-xl font-bold mb-2">Group Chat</h1>

      <div className="space-y-2">
        {messages.map((msg) => {
          const profile = profiles[msg.uid] || {
            funnyName: msg.name || "AnonUser",
            avatar: msg.avatar || "🙂",
          };
          return (
            <div
              key={msg.id}
              className={`p-3 rounded-xl max-w-[75%] flex flex-col shadow-md ${
                msg.uid === currentUser?.uid
                  ? "ml-auto bg-blue-100"
                  : "mr-auto bg-gray-100"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{profile.avatar}</span>
                <span className="font-semibold text-sm">
                  {profile.funnyName}
                </span>
                <span className="text-xs text-gray-500">
                  {msg.createdAt?.toDate?.().toLocaleString?.() || "Sending..."}
                </span>
              </div>

              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>

              <div className="flex gap-2 mt-2 text-xs">
                {["👍", "😂", "🔥", "❤️"].map((emoji) => {
                  const arr = Array.isArray(msg.reactions?.[emoji])
                    ? msg.reactions[emoji]
                    : [];
                  const actor = currentUser?.uid || anonUid;
                  const hasReacted = arr.includes(actor);
                  return (
                    <button
                      key={emoji}
                      onClick={() => toggleReaction(msg.id, emoji)}
                      className={`hover:scale-110 transition ${
                        hasReacted ? "font-bold text-blue-600" : ""
                      }`}
                    >
                      {emoji} {arr.length > 0 ? arr.length : ""}
                    </button>
                  );
                })}
              </div>

              {msg.uid === currentUser?.uid && (
                <div className="flex gap-1 mt-1 text-xs">
                  <button
                    onClick={() => deleteMessage(msg.id, msg.uid)}
                    className="text-red-500 hover:underline"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex items-center gap-2 relative">
        <button onClick={() => setShowEmoji(!showEmoji)} className="p-2">
          <Smile size={20} />
        </button>

        {showEmoji && (
          <div className="absolute bottom-12 left-0 z-50">
            <Picker
              onSelect={(emoji) => {
                setNewMessage((prev) => prev + emoji.native);
                setShowEmoji(false);
              }}
              theme="light"
            />
          </div>
        )}

        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Tulis pesan..."
          className="border p-2 rounded w-full"
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
