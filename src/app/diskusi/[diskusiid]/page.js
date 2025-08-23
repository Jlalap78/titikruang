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
  if (!id) return COMMUNITY_PALETTE[0];
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h << 5) - h + id.charCodeAt(i);
    h |= 0;
  }
  return COMMUNITY_PALETTE[Math.abs(h) % COMMUNITY_PALETTE.length];
}

export default function DiskusiDetailPage() {
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

  // selama cek auth, tampilkan pesan singkat (atau loading)
  if (checkingAuth) {
    return (
      <div className="p-4 max-w-2xl mx-auto">Memeriksa status login...</div>
    );
  }

  // jika sudah diarahkan ke /login, komponen ini biasanya tidak akan dirender lagi,
  // tapi tetap aman untuk melanjutkan render ketika user sudah login.
  return (
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
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* message input row */}
            <div className="mt-6 pt-4">
              {/* buat container relatif supaya picker absolute berada tepat di atas input */}
              <div className="relative flex items-center gap-3">
                <button
                  onClick={() => setShowEmoji((s) => !s)}
                  className="p-2 rounded-md z-30 bg-white/70 hover:bg-white transition"
                  aria-label="Toggle Emoji"
                >
                  😊
                </button>

                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Tulis pesan..."
                  className="flex-1 border border-gray-200 p-3 rounded-lg"
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />

                <button
                  onClick={sendMessage}
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
