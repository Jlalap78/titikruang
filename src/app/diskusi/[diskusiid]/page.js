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
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../../../lib/firebase";
import { Smile, Send, Trash2, ArrowLeft } from "lucide-react";
import { filterMessage } from "../../../lib/filterMessage";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import ChatMessage from "../../../components/ChatMessage";

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
  const name = `${Adj}${animal}${number}`;
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

const COMMUNITY_PALETTE = [
  { bg: "linear-gradient(135deg,#FEF3C7 0%,#FFF7ED 100%)", text: "#92400E" },
  { bg: "linear-gradient(135deg,#E0F2FE 0%,#BAE6FD 100%)", text: "#075985" },
  { bg: "linear-gradient(135deg,#EEF2FF 0%,#E9D5FF 100%)", text: "#3730A3" },
  { bg: "linear-gradient(135deg,#ECFDF5 0%,#D1FAE5 100%)", text: "#065F46" },
  { bg: "linear-gradient(135deg,#FFF1F2 0%,#FFE4E6 100%)", text: "#9F1239" },
  { bg: "linear-gradient(135deg,#FFF7ED 0%,#FFF1D6 100%)", text: "#92400E" },
];

function pickColorById(id) {
<<<<<<< HEAD
  // Use gradients from ruang/page.js
  const gradients = [
    'from-[#3061F2] to-[#F2780C]',
    'from-[#F25050] to-[#F2BF27]',
    'from-[#27A4F2] to-[#F28907]',
    'from-[#F2BF27] to-[#3061F2]',
    'from-[#6D9BFF] to-[#F25050]',
    'from-[#F2780C] to-[#27A4F2]',
    'from-[#F28907] to-[#F2BF27]',
    'from-[#F2BF27] to-[#F25050]',
    'from-[#3061F2] to-[#6D9BFF]',
    'from-[#F25050] to-[#27A4F2]',
  ];
  if (!id) return gradients[0];
=======
  if (!id) return COMMUNITY_PALETTE[0];
>>>>>>> 2bd6121dc2e1eb7e350515c27c240d2799bc5034
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h << 5) - h + id.charCodeAt(i);
    h |= 0;
  }
<<<<<<< HEAD
  return gradients[Math.abs(h) % gradients.length];
}

export default function DiskusiDetailPage() {
  // State untuk popup konfirmasi hapus pesan
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, msgId: null });
  // Edit message state
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  // Reply edit state (for threaded replies - kept as is)
  const [editingReply, setEditingReply] = useState(null); // { msgId, replyId } | null
  const [replyEditText, setReplyEditText] = useState('');
=======
  return COMMUNITY_PALETTE[Math.abs(h) % COMMUNITY_PALETTE.length];
}

export default function DiskusiDetailPage() {
>>>>>>> 2bd6121dc2e1eb7e350515c27c240d2799bc5034
  const params = useParams();
  const groupId = params.diskusiid;
  const auth = getAuth();
  const router = useRouter();

  // auth state
  const [currentUser, setCurrentUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [members, setMembers] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [showEmoji, setShowEmoji] = useState(false);
  const [anonUid, setAnonUid] = useState(null);

  // replies / thread state
  const [expanded, setExpanded] = useState({}); // { [msgId]: bool }
  const [repliesMap, setRepliesMap] = useState({}); // { [msgId]: Array<reply> }
  const [replyInputs, setReplyInputs] = useState({}); // { [msgId]: string }
  const repliesUnsubsRef = useRef({}); // store unsubscribe functions per message

  const messagesEndRef = useRef(null);

<<<<<<< HEAD
  // input ref to focus when replying
  const inputRef = useRef(null);

  // reply-as-WhatsApp state (the quoted message above input)
  const [replyingTo, setReplyingTo] = useState(null); // { id, text, name, avatar, uid } | null

=======
>>>>>>> 2bd6121dc2e1eb7e350515c27c240d2799bc5034
  // set anon UID sekali saja
  useEffect(() => {
    setAnonUid(getOrCreateAnonUid());
  }, []);

  // cek auth: jika tidak login redirect ke /login
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setCheckingAuth(false);
      if (!user) {
        // arahkan ke halaman login jika belum login
        router.push("/login");
      }
    });
    return () => unsub();
  }, [auth, router]);

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

  // subscribe replies for each message -> keep repliesMap updated
  useEffect(() => {
    // cleanup any existing listeners first
    Object.values(repliesUnsubsRef.current).forEach((u) => u && u());
    repliesUnsubsRef.current = {};

    messages.forEach((msg) => {
      const repliesCol = collection(
        db,
        "groups",
        groupId,
        "messages",
        msg.id,
        "replies"
      );
      const q = query(repliesCol, orderBy("timestamp"));
      const unsub = onSnapshot(
        q,
        (snap) => {
          const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          setRepliesMap((prev) => ({ ...prev, [msg.id]: list }));
        },
        (err) => {
          console.error("replies listener error for", msg.id, err);
        }
      );
      repliesUnsubsRef.current[msg.id] = unsub;
    });

    return () => {
      Object.values(repliesUnsubsRef.current).forEach((u) => u && u());
      repliesUnsubsRef.current = {};
    };
  }, [messages, groupId]);

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
<<<<<<< HEAD
    const payload = {
=======
    await addDoc(messageRef, {
>>>>>>> 2bd6121dc2e1eb7e350515c27c240d2799bc5034
      text: filterMessage(newMessage.trim()),
      uid: currentUser.uid,
      name: senderProfile.funnyName,
      avatar: senderProfile.avatar,
      reactions: {},
      createdAt: serverTimestamp(),
<<<<<<< HEAD
    };

    // jika ada reply (WhatsApp style), simpan subfield replyTo di message
    if (replyingTo) {
      payload.replyTo = {
        id: replyingTo.id,
        text: replyingTo.text,
        name: replyingTo.name,
        avatar: replyingTo.avatar,
        uid: replyingTo.uid || null,
      };
    }

    await addDoc(messageRef, payload);
    setNewMessage("");
    setReplyingTo(null);
=======
    });
    setNewMessage("");
>>>>>>> 2bd6121dc2e1eb7e350515c27c240d2799bc5034
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

  const toggleThread = (msgId) => {
    setExpanded((prev) => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  const handleSendReply = async (msgId) => {
    const text = (replyInputs[msgId] || "").trim();
    if (!text) return;
    if (!currentUser || !members.includes(currentUser.uid)) {
      // optionally show message to login/join
      return;
    }
    try {
      await addDoc(
        collection(db, "groups", groupId, "messages", msgId, "replies"),
        {
          text: filterMessage(text),
          uid: currentUser.uid,
          timestamp: serverTimestamp(),
          reactions: {},
        }
      );
      setReplyInputs((prev) => ({ ...prev, [msgId]: "" }));
    } catch (err) {
      console.error("send reply error", err);
    }
  };

  const handleReplyReaction = async (msgId, replyId, emoji) => {
    const actor = currentUser?.uid || anonUid;
    if (!actor) return;
    const ref = doc(
      db,
      "groups",
      groupId,
      "messages",
      msgId,
      "replies",
      replyId
    );
    try {
      const snap = await getDoc(ref);
      if (!snap.exists()) return;
      const data = snap.data() || {};
      const reactions = data.reactions || {};
      const arr = Array.isArray(reactions[emoji]) ? reactions[emoji] : [];
      const updated = arr.includes(actor)
        ? arr.filter((id) => id !== actor)
        : [...arr, actor];
      await updateDoc(ref, { reactions: { ...reactions, [emoji]: updated } });
    } catch (err) {
      console.error("reply reaction error", err);
    }
  };

<<<<<<< HEAD
  // Fix: Add handleDelete function inside the component
  async function handleDelete() {
    try {
      if (deleteConfirm.isReply) {
        await deleteDoc(doc(db, 'groups', groupId, 'messages', deleteConfirm.parentMsgId, 'replies', deleteConfirm.msgId));
      } else {
        await deleteDoc(doc(db, 'groups', groupId, 'messages', deleteConfirm.msgId));
      }
    } catch (e) {
      console.error('delete msg error', e);
    }
    setDeleteConfirm({ show: false, msgId: null });
  }

=======
>>>>>>> 2bd6121dc2e1eb7e350515c27c240d2799bc5034
  // selama cek auth, tampilkan pesan singkat (atau loading)
  if (checkingAuth) {
    return (
      <div className="p-4 max-w-2xl mx-auto">Memeriksa status login...</div>
    );
  }

  // jika sudah diarahkan ke /login, komponen ini biasanya tidak akan dirender lagi,
  // tapi tetap aman untuk melanjutkan render ketika user sudah login.
  return (
<<<<<<< HEAD
    <main>
      {/* Modern 2025-style popup for delete confirmation, always rendered at top level */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl px-10 py-8 flex flex-col items-center gap-6 min-w-[340px] max-w-[95vw] border border-[#F2BF27]/40 ring-2 ring-[#3061F2]/10">
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-gradient-to-br from-[#F25050] to-[#F2BF27] rounded-full p-2 shadow-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </span>
              <span className="text-xl font-bold text-gray-800 drop-shadow">Hapus pesan ini?</span>
            </div>
            <div className="text-base font-normal text-gray-500 text-center">Balasan akan ikut terhapus.</div>
            <div className="flex gap-5 mt-2">
              <button
                className="px-6 py-2 rounded-full bg-gradient-to-r from-[#3061F2] to-[#F2BF27] text-white font-bold shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#3061F2]"
                onClick={handleDelete}
              >Iya, Hapus</button>
              <button
                className="px-6 py-2 rounded-full bg-white/80 text-[#3061F2] font-bold shadow hover:bg-gray-100 hover:scale-105 transition-all duration-150 border border-[#3061F2]/30 focus:outline-none focus:ring-2 focus:ring-[#F2BF27]"
                onClick={() => setDeleteConfirm({ show: false, msgId: null })}
              >Tidak</button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-br from-[#1E3A8A] via-[#EEF2FF] to-[#F2BF27]/20 text-gray-800">
        <div className="flex flex-col h-screen text-black font-sans">
          <div className="w-full max-w-3xl mx-auto flex flex-col h-screen">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-white/70 backdrop-blur-xl border-b border-[#F2BF27]/60 sticky top-0 z-10">
              <div className="hidden md:block">
                <button
                  className="bg-[#3061F2] text-white px-4 py-2 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                  onClick={() => router.push('/diskusi')}
                >
                  Kembali
                </button>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Search"
                  className="bg-white/80 text-sm px-3 py-2 rounded-xl border border-[#F2BF27]/60 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#27A4F2]"
                />
              </div>
            </div>

            {/* Messages list */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-5">
              {messages.map((msg, idx) => {
                const profile = profiles[msg.uid] || { funnyName: msg.name || 'AnonUser', avatar: msg.avatar || '🙂' };
                const replies = repliesMap[msg.id] || [];
                const isOwner = currentUser && msg.uid === currentUser.uid;
                const avatarGradient = pickColorById(msg.uid || idx);
                // Use a soft blue for user's own messages, keep others as before
                const userMsgBg = 'bg-[#E6F7FF]'; // soft blue for user's own chat
                const otherMsgBg = 'bg-white/80';
                const msgBg = isOwner ? userMsgBg : otherMsgBg;
                // Align user's chat to right, others to left. Make message size smaller.
                const alignment = isOwner ? 'ml-auto' : 'mr-auto';
                return (
                  <div
                    key={msg.id}
                    className={`group relative flex flex-col gap-2 ${msgBg} ${alignment} backdrop-blur-md rounded-2xl shadow-sm hover:shadow-lg p-3 ring-1 ring-gray-200/60 hover:ring-gray-300 transition-all max-w-[70%]`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-lg shadow ring-2 ring-offset-2 ring-[#3061F2]/30`}
                      >
                        {profile.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-500 mb-1 flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-black truncate">{profile.funnyName}</span>
                          <span className="tabular-nums">{msg.createdAt?.toDate?.().toLocaleString?.() ?? '...'}</span>
                          {msg.editedAt && (
                            <span className="text-xs italic text-gray-400">(edited)</span>
                          )}
                        </p>

                        {/* Quoted / replied-to message (WhatsApp-style) */}
                        {msg.replyTo && (
                          <div className="mb-2 px-3 py-1 rounded-lg bg-gray-100/60 text-xs text-gray-700 opacity-80 border-l-2 border-[#3061F2]">
                            <p className="font-semibold text-xs leading-tight">{msg.replyTo.name}</p>
                            <p className="text-xs leading-tight truncate">{filterMessage(msg.replyTo.text)}</p>
                          </div>
                        )}

                        {editingId === msg.id ? (
                          <div className="space-y-2">
                            <textarea
                              className="w-full border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#27A4F2] bg-white/80"
                              value={editText}
                              onChange={e => setEditText(e.target.value)}
                              rows={3}
                            />
                            <div className="flex gap-2 text-sm">
                              <button
                                onClick={async () => {
                                  const newText = editText.trim();
                                  if (!newText) return;
                                  try {
                                    await updateDoc(doc(db, "groups", groupId, "messages", msg.id), {
                                      text: filterMessage(newText),
                                      editedAt: serverTimestamp(),
                                    });
                                  } catch (e) {
                                    console.error('update msg error', e);
                                  }
                                  setEditingId(null);
                                  setEditText('');
                                }}
                                className="inline-flex items-center gap-1 bg-[#3061F2] text-white px-3 py-1.5 rounded-xl hover:bg-[#27A4F2] transition"
                                title="Simpan"
                              >
                                Simpan
                              </button>
                              <button
                                onClick={() => { setEditingId(null); setEditText(''); }}
                                className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-xl hover:bg-gray-300 transition"
                              >
                                Batal
                              </button>
                            </div>
                          </div>
                        ) : (
                          msg.text && <p className="text-gray-800 leading-relaxed break-words">{filterMessage(msg.text)}</p>
                        )}

                        {/* Hover actions: reply (for everyone) and owner edit/delete */}
                        <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition flex items-center gap-1">
                          {isOwner && editingId !== msg.id && (
                            <>
                              <button
                                className="p-2 rounded-xl bg-blue-100 hover:bg-blue-300 transition duration-200 shadow-sm flex items-center justify-center group"
                                onClick={() => { setEditingId(msg.id); setEditText(msg.text || ''); }}
                                title="Edit pesan"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600 group-hover:scale-110 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.536-6.536a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L9 13zm0 0V17h4" /></svg>
                              </button>
                              <button
                                className="p-2 rounded-xl bg-red-100 hover:bg-red-300 transition duration-200 shadow-sm flex items-center justify-center group"
                                onClick={() => setDeleteConfirm({ show: true, msgId: msg.id })}
                                title="Hapus pesan"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-600 group-hover:scale-110 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            </>
                          )}

                          {/* Reply (curved arrow) - muncul di sisi kanan saat hover */}
                          <button
                            onClick={() => {
                              setReplyingTo({
                                id: msg.id,
                                text: msg.text || "",
                                name: profile.funnyName,
                                avatar: profile.avatar,
                                uid: msg.uid || null,
                              });
                              // fokus ke input agar user langsung ketik
                              setTimeout(() => inputRef.current?.focus(), 20);
                            }}
                            className="p-2 rounded-xl bg-white/80 ring-1 ring-gray-200 hover:bg-gray-50 hover:ring-gray-300"
                            title="Balas pesan"
                          >
                            {/* curved arrow icon — menggunakan unicode ↩ */}
                            ↩
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Actions: Reactions only (comment/reply buttons removed) */}
                    <div className="flex items-center gap-2 pl-14 pt-1">
                      {['👍', '😂', '🔥'].map((emoji) => {
                        const actor = currentUser?.uid || anonUid;
                        const count = msg.reactions?.[emoji]?.length || 0;
                        const hasReacted = msg.reactions?.[emoji]?.includes(actor);
=======
    <div
      className="min-h-screen w-full flex justify-center items-start"
      style={{
        // halaman: gradasi biru laut
        background:
          "linear-gradient(180deg, #e6f5ff 0%, #cfeeff 40%, #b6e0ff 100%)",
        padding: "48px 24px",
      }}
    >
      {/* central column with soft blue gradient border */}
      <div
        className="w-full max-w-3xl rounded-2xl p-1"
        style={{
          background:
            "linear-gradient(90deg, rgba(173,216,230,0.55), rgba(240,248,255,0.15))",
        }}
      >
        {/* inner white card (content area) */}
        <div
          className="rounded-2xl shadow-2xl"
          style={{
            // gunakan bgartikel.jpg sebagai background utama untuk area group chat
            backgroundImage: "url('/bgdiskusi.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backdropFilter: "saturate(120%) blur(6px)",
          }}
        >
          {/* sticky header inside the centered card */}
          <header
            className="sticky top-4 z-40 w-full flex items-center justify-between px-7 py-4 border-b border-gray-100"
            style={{
              backgroundImage: "url('/bgheaderdiskusi1.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundBlendMode: "overlay",
              // overlay agar teks tombol/label tetap kontras
              backgroundColor: "rgba(255, 255, 255, 0)",
              backdropFilter: "blur(6px) saturate(120%)",
            }}
          >
            <div className="flex items-center gap-3">
              <Image
                src="/logo2.jpg"
                alt="TitikRuang"
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="text-lg font-semibold">Group Chat</div>
            </div>

            <button
              onClick={() => router.push("/diskusi")}
              className="ml-auto bg-[#3061F2] text-white px-4 py-2 rounded-md shadow hover:brightness-95 transition"
              aria-label="Kembali"
            >
              Kembali
            </button>
          </header>

          {/* body: messages list + input area */}
          <div
            className="px-6 py-6"
            style={{
              // pastikan area pesan bisa tampil di atas background artikel
              background: "transparent",
            }}
          >
            {/* optional subheader / meta */}
            <div className="mb-4 text-sm text-gray-600">
              {/* ... you can show group name / member count here ... */}
            </div>

            {/* messages container: keep same mapping logic you already have */}
            <div className="space-y-4">
              {messages.map((msg) => {
                const profile = profiles[msg.uid] || {
                  funnyName: msg.name || "AnonUser",
                  avatar: msg.avatar || "🙂",
                };
                const replies = repliesMap[msg.id] || [];
                const replyCount = replies.length;
                return (
                  <div
                    key={msg.id}
                    className={`relative p-4 rounded-xl max-w-[85%] flex flex-col shadow-md bg-white ${
                      msg.uid === currentUser?.uid ? "ml-auto" : "mr-auto"
                    }`}
                    style={{
                      backgroundColor: "rgba(255,255,255,1)",
                      border: "1px solid rgba(0,0,0,0.04)",
                    }}
                  >
                    {/* decorative left gradient stripe */}
                    <span
                      className="absolute -left-2 top-6 w-1.5 h-14 rounded-r-full"
                      style={{
                        background:
                          "linear-gradient(180deg,#CDE7FF,#E8F1FF 40%, #F2BF27)",
                      }}
                      aria-hidden
                    />

                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-xl">{profile.avatar}</div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">
                          {profile.funnyName}
                        </span>
                        <span className="text-xs text-gray-400">
                          {msg.createdAt?.toDate?.().toLocaleString?.() ||
                            "Sending..."}
                        </span>
                      </div>
                    </div>

                    <div className="text-sm whitespace-pre-wrap text-gray-800">
                      {msg.text}
                    </div>

                    <div className="flex gap-3 mt-3 text-xs items-center">
                      {['👍', '❤', '😥'].map((emoji) => {
                        const arr = Array.isArray(msg.reactions?.[emoji])
                          ? msg.reactions[emoji]
                          : [];
                        const actor = currentUser?.uid || anonUid;
                        const hasReacted = arr.includes(actor);
>>>>>>> 2bd6121dc2e1eb7e350515c27c240d2799bc5034
                        return (
                          <button
                            key={emoji}
                            onClick={() => toggleReaction(msg.id, emoji)}
<<<<<<< HEAD
                            className={`flex items-center gap-1 text-sm px-2 py-1 rounded-full border transition active:scale-95 ${hasReacted
                              ? 'bg-[#3061F2] text-white border-[#3061F2]'
                              : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                              }`}
                            title="Berikan reaksi"
                          >
                            {emoji}
                            {count > 0 && <span className="tabular-nums">{count}</span>}
                          </button>
                        );
                      })}
                    </div>

                    {/* Thread (expand) - tetap ada tapi tidak dipicu dari reply button (kamu bisa expose toggleThread di UI lain jika mau) */}
                    {expanded[msg.id] && (
                      <div className="pl-14 pt-2 space-y-3">
                        {replies.length === 0 && (
                          <div className="text-sm text-gray-500">Belum ada balasan.</div>
                        )}

                        {/* Show ALL replies (sorted asc) to allow edit/delete */}
                        {replies.map((rep) => {
                          const rprof = profiles[rep.uid] || { funnyName: rep.name || (rep.uid ? rep.uid.slice(0, 6) : 'Anon'), avatar: rep.avatar || '🙂' };
                          const rReactions = rep.reactions || {};
                          const isReplyOwner = currentUser && rep.uid === currentUser.uid;
                          const isEditingThis = editingReply && editingReply.replyId === rep.id && editingReply.msgId === msg.id;
                          return (
                            <div key={rep.id} className="group flex items-start gap-3 bg-gray-50/80 rounded-2xl p-3 ring-1 ring-gray-200/60 hover:bg-gray-50 transition">
                              <div className="w-8 h-8 rounded-full bg-[#F2BF27]/70 flex items-center justify-center text-base ring-2 ring-offset-2 ring-[#F2BF27]/40">
                                {rprof.avatar}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-500 flex flex-wrap items-center gap-2">
                                  <span className="font-semibold text-black">{rprof.funnyName}</span>
                                  <span className="tabular-nums">{rep.timestamp?.toDate?.().toLocaleString?.() ?? '...'}</span>
                                  {rep.editedAt && (
                                    <span className="text-[10px] italic text-gray-400">(edited)</span>
                                  )}
                                </p>

                                {isEditingThis ? (
                                  <div className="space-y-2 mt-1">
                                    <textarea
                                      className="w-full border rounded-xl p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/80"
                                      value={replyEditText}
                                      onChange={e => setReplyEditText(e.target.value)}
                                      rows={2}
                                    />
                                    <div className="flex items-center gap-2 text-xs">
                                      <button
                                        onClick={async () => {
                                          if (!replyEditText.trim()) return;
                                          try {
                                            await updateDoc(doc(db, 'groups', groupId, 'messages', msg.id, 'replies', rep.id), {
                                              text: filterMessage(replyEditText.trim()),
                                              editedAt: serverTimestamp(),
                                            });
                                          } catch (e) {
                                            console.error('update reply error', e);
                                          }
                                          setEditingReply(null);
                                          setReplyEditText('');
                                        }}
                                        className="inline-flex items-center gap-1 bg-blue-500 text-white px-3 py-1.5 rounded-xl hover:bg-blue-600 transition"
                                        title="Simpan"
                                      >
                                        Simpan
                                      </button>
                                      <button
                                        onClick={() => { setEditingReply(null); setReplyEditText(''); }}
                                        className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-xl hover:bg-gray-300 transition"
                                      >
                                        Batal
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  rep.text && <p className="text-sm text-gray-800 mt-0.5 break-words">{filterMessage(rep.text)}</p>
                                )}

                                {/* reply actions (hover) */}
                                {isReplyOwner && !isEditingThis && (
                                  <div className="opacity-0 group-hover:opacity-100 flex gap-1 mt-2 transition">
                                    <button
                                      onClick={() => { setEditingReply({ msgId: msg.id, replyId: rep.id }); setReplyEditText(rep.text || ''); }}
                                      className="p-1.5 rounded-lg bg-white/80 ring-1 ring-gray-200 hover:bg-gray-50 hover:ring-gray-300"
                                      title="Edit balasan"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => setDeleteConfirm({ show: true, msgId: rep.id, isReply: true, parentMsgId: msg.id })}
                                      className="p-1.5 rounded-lg bg-red-100 hover:bg-red-300 transition duration-200 shadow-sm flex items-center justify-center group"
                                      title="Hapus balasan"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-600 group-hover:scale-110 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                  </div>
                                )}

                                {/* reply reactions */}
                                <div className="flex items-center gap-2 pt-2">
                                  {['👍', '😂', '🔥'].map((emoji) => {
                                    const actor = currentUser?.uid || anonUid;
                                    const arr = rReactions?.[emoji] || [];
                                    const hasReacted = arr.includes(actor);
                                    const count = arr.length;
                                    return (
                                      <button
                                        key={emoji}
                                        onClick={() => handleReplyReaction(msg.id, rep.id, emoji)}
                                        className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border transition active:scale-95 ${hasReacted
                                          ? 'bg-[#3061F2] text-white border-[#3061F2]'
                                          : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                                          }`}
                                        title="Reaksi balasan"
                                      >
                                        {emoji}
                                        {count > 0 && <span className="tabular-nums">{count}</span>}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {/* Link ke halaman thread jika panjang */}
                        {replies.length > 6 && (
                          <div>
                            <a
                              href={`/diskusi/reply/${msg.id}?groupId=${groupId}`}
                              className="text-xs text-[#3061F2] hover:underline"
                              title="Lihat semua balasan"
                            >
                              Lihat lebih lanjut →
                            </a>
                          </div>
                        )}
=======
                            className={`hover:scale-110 transition ${
                              hasReacted ? "font-bold text-blue-600" : ""
                            }`}
                          >
                            {emoji} {arr.length > 0 ? arr.length : ""}
                          </button>
                        );
                      })}

                      {/* Reply toggle + count */}
                      <button
                        onClick={() => toggleThread(msg.id)}
                        className="ml-2 text-sm px-2 py-1 rounded-full border bg-gray-100 text-gray-700 hover:bg-gray-200"
                        title="Balas pesan ini"
                      >
                        💬 {replyCount}
                      </button>
                    </div>

                    {msg.uid === currentUser?.uid && (
                      <div className="flex gap-1 mt-2 text-xs">
                        <button
                          onClick={() => deleteMessage(msg.id, msg.uid)}
                          className="text-red-500 hover:underline"
                        >
                          Hapus
                        </button>
                      </div>
                    )}

                    {/* Expanded thread preview */}
                    {expanded[msg.id] && (
                      <div className="pl-4 pt-3 space-y-3">
                        {replies.length === 0 && (
                          <div className="text-sm text-gray-500">
                            Belum ada balasan.
                          </div>
                        )}

                        {replies
                          .slice()
                          .sort((a, b) => {
                            const aCount = Object.values(
                              a.reactions || {}
                            ).reduce((sum, arr) => sum + (arr?.length || 0), 0);
                            const bCount = Object.values(
                              b.reactions || {}
                            ).reduce((sum, arr) => sum + (arr?.length || 0), 0);
                            return bCount - aCount;
                          })
                          .slice(0, 2)
                          .map((rep) => {
                            const rprof = profiles[rep.uid] || {
                              funnyName:
                                rep.name ||
                                (rep.uid ? rep.uid.slice(0, 6) : "Anon"),
                              avatar: rep.avatar || "🙂",
                            };
                            const rReactions = rep.reactions || {};
                            return (
                              <div
                                key={rep.id}
                                className="flex items-start gap-3"
                              >
                                <div className="w-8 h-8 rounded-full bg-[#F2BF27]/60 flex items-center justify-center text-base">
                                  {rprof.avatar}
                                </div>
                                <div className="flex-1">
                                  <p className="text-xs text-gray-500">
                                    <span className="font-semibold text-black">
                                      {rprof.funnyName}
                                    </span>{" "}
                                    {rep.timestamp
                                      ?.toDate?.()
                                      .toLocaleString?.() ?? "..."}
                                  </p>
                                  {rep.text && (
                                    <p className="text-sm text-gray-800">
                                      {filterMessage(rep.text)}
                                    </p>
                                  )}

                                  <div className="flex items-center gap-2 pt-1">
                                    {['👍', '❤', '😥'].map((emoji) => {
                                      const arr = rReactions?.[emoji] || [];
                                      const actor = currentUser?.uid || anonUid;
                                      const has = arr.includes(actor);
                                      return (
                                        <button
                                          key={emoji}
                                          onClick={() =>
                                            handleReplyReaction(
                                              msg.id,
                                              rep.id,
                                              emoji
                                            )
                                          }
                                          className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border transition ${
                                            has
                                              ? "bg-[#3061F2] text-white border-[#3061F2]"
                                              : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                                          }`}
                                        >
                                          {emoji}
                                          {arr.length > 0 && (
                                            <span>{arr.length}</span>
                                          )}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            );
                          })}

                        {/* show "lihat lebih banyak" jika ada lebih dari 2 balasan */}
                        {replies.length > 2 && (
                          <div className="pt-2">
                            <a
                              href={`/diskusi/reply/${msg.id}?groupId=${groupId}`}
                              className="text-sm text-[#3061F2] hover:underline"
                            >
                              lihat lebih banyak →
                            </a>
                          </div>
                        )}

                        {/* reply input */}
                        <div className="flex gap-2 items-center pt-2">
                          <input
                            type="text"
                            placeholder="Tulis balasan..."
                            value={replyInputs[msg.id] || ""}
                            onChange={(e) =>
                              setReplyInputs((prev) => ({
                                ...prev,
                                [msg.id]: e.target.value,
                              }))
                            }
                            className="flex-1 px-3 py-2 border rounded-md"
                          />
                          <button
                            onClick={() => handleSendReply(msg.id)}
                            className="px-3 py-2 bg-[#3061F2] text-white rounded-md"
                            disabled={
                              !currentUser ||
                              !members.includes(currentUser?.uid)
                            }
                          >
                            Balas
                          </button>
                        </div>
>>>>>>> 2bd6121dc2e1eb7e350515c27c240d2799bc5034
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

<<<<<<< HEAD
            {/* Input bar */}
            <div className="bg-white/80 backdrop-blur-xl px-4 sm:px-6 py-4 border-t border-[#F2BF27]/60">
              {/* Emoji picker */}
              {showEmoji && (
                <div className="absolute bottom-24 left-6 z-50">
                  <Picker
                    data={data}
                    onEmojiSelect={(emoji) => {
                      setNewMessage((v) => v + (emoji?.native || ""));
                      setShowEmoji(false);
                    }}
                    theme="light"
                  />
                </div>
              )}

              {/* Reply preview (WhatsApp style) */}
              {replyingTo && (
                <div className="mx-auto max-w-4xl px-3 sm:px-4 mb-2">
                  <div className="flex items-start gap-3 bg-gray-100/90 border-l-4 border-[#3061F2] rounded-xl p-2 text-sm">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-base">
                      {replyingTo.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold leading-tight">{replyingTo.name}</p>
                      <p className="text-xs text-gray-700 truncate leading-tight">{filterMessage(replyingTo.text)}</p>
                    </div>
                    <button
                      onClick={() => setReplyingTo(null)}
                      className="text-gray-500 ml-2 p-1 hover:text-gray-800"
                      title="Batal balas"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}

              <div className="mx-auto max-w-4xl flex items-center gap-2 sm:gap-3 bg-white/80 ring-1 ring-gray-200 rounded-2xl px-3 sm:px-4 py-2.5 shadow-sm">
                <button
                  className={`text-[#3061F2] hover:text-[#F2780C] transition`}
                  onClick={() => setShowEmoji((s) => !s)}
                  title={'Pilih emoji'}
=======
            {/* message input row */}
            <div className="mt-6 pt-4">
              {/* buat container relatif supaya picker absolute berada tepat di atas input */}
              <div className="relative flex items-center gap-3">
                <button
                  onClick={() => setShowEmoji((s) => !s)}
                  className="p-2 rounded-md z-30 bg-white/70 hover:bg-white transition"
                  aria-label="Toggle Emoji"
>>>>>>> 2bd6121dc2e1eb7e350515c27c240d2799bc5034
                >
                  😊
                </button>

                <input
<<<<<<< HEAD
                  ref={inputRef}
=======
>>>>>>> 2bd6121dc2e1eb7e350515c27c240d2799bc5034
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Tulis pesan..."
<<<<<<< HEAD
                  className="flex-1 px-3 sm:px-4 py-2 text-sm rounded-xl border border-gray-200 bg-white/90 focus:outline-none focus:ring-2 focus:ring-[#27A4F2]"
=======
                  className="flex-1 border border-gray-200 p-3 rounded-lg"
>>>>>>> 2bd6121dc2e1eb7e350515c27c240d2799bc5034
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />

                <button
                  onClick={sendMessage}
<<<<<<< HEAD
                  className="bg-[#3061F2] hover:bg-[#27A4F2] text-white p-2 rounded-xl shadow-sm hover:shadow-md transition"
                >
                  Kirim
                </button>
=======
                  className="bg-[#3061F2] text-white px-4 py-2 rounded-md"
                >
                  Kirim
                </button>

                {/* Emoji picker: absolute, z-index tinggi, tidak akan terpotong karena kita hapus overflow-hidden */}
                {showEmoji && (
                  <div
                    className="absolute left-0 bottom-full mb-3 z-50"
                    style={{ transform: "translateY(-8px)" }}
                  >
                    <div className="bg-white rounded-lg shadow p-1">
                      <Picker
                        data={data}
                        onEmojiSelect={(emoji) => {
                          // emoji.native contains the actual character
                          setNewMessage((v) => v + (emoji?.native || ""));
                          setShowEmoji(false);
                        }}
                        theme="light"
                      />
                    </div>
                  </div>
                )}
>>>>>>> 2bd6121dc2e1eb7e350515c27c240d2799bc5034
              </div>
            </div>
          </div>
        </div>
      </div>
<<<<<<< HEAD
    </main>
=======
    </div>
>>>>>>> 2bd6121dc2e1eb7e350515c27c240d2799bc5034
  );
}
