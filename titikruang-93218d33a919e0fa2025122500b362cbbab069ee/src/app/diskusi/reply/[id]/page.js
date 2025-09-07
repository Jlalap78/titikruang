"use client";

import { useEffect, useState, useRef } from "react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data"; // emoji-mart
import { useParams, useSearchParams } from "next/navigation";
import {
  collection,
  doc,
  onSnapshot,
  addDoc,
  serverTimestamp,
  getDoc,
  setDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db, app } from "../../../../lib/firebase";
import styles from "./page.module.css";

export default function ReplyPage() {
  const params = useParams();
  const messageId = params?.id;
  const search = useSearchParams();
  const groupId = search?.get("groupId") || null;

  const [user, setUser] = useState(null); // { uid, displayName }
  const [message, setMessage] = useState(null);
  const [replies, setReplies] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false); // <-- emoji picker state
  const endRef = useRef(null);

  useEffect(() => {
    const auth = getAuth(app);
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setUser(null);
        return;
      }
      try {
        const uRef = doc(db, "users", u.uid);
        const snap = await getDoc(uRef);
        if (snap.exists() && snap.data()?.displayName) {
          setUser({ uid: u.uid, displayName: snap.data().displayName });
        } else {
          const stableName = u.displayName || `User${u.uid.slice(0, 6)}`;
          await setDoc(uRef, { displayName: stableName }, { merge: true });
          setUser({ uid: u.uid, displayName: stableName });
        }
      } catch (err) {
        console.error("user load error", err);
        setUser({ uid: u.uid, displayName: u.displayName || `User${u.uid.slice(0, 6)}` });
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!groupId || !messageId) return;
    const mRef = doc(db, "groups", groupId, "messages", messageId);
    const unsubMsg = onSnapshot(
      mRef,
      (snap) => setMessage({ id: snap.id, ...snap.data() }),
      (err) => console.error("msg listen err:", err)
    );

    const repliesCol = collection(db, "groups", groupId, "messages", messageId, "replies");
    const q = query(repliesCol, orderBy("timestamp", "asc"));
    const unsubRep = onSnapshot(
      q,
      (snap) => setReplies(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (err) => console.error("replies listen err:", err)
    );

    return () => {
      unsubMsg();
      unsubRep();
    };
  }, [groupId, messageId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [replies, message]);

  const handleSend = async () => {
    if (!text.trim() || !groupId || !messageId) return;
    setLoading(true);
    try {
      await addDoc(
        collection(db, "groups", groupId, "messages", messageId, "replies"),
        {
          text: text.trim(),
          uid: user?.uid || null,
          displayName: user?.displayName || "Anon",
          timestamp: serverTimestamp(),
        }
      );
      setText("");
      setShowEmoji(false);
    } catch (err) {
      console.error("send reply err:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!groupId) {
    return <div className={styles.container}>Missing groupId — buka thread via link: ?groupId=GROUP_ID</div>;
  }

  return (
    <div
      className="min-h-screen w-full flex justify-center items-start reply-container"
      style={{
        background: "linear-gradient(180deg, #e6f5ff 0%, #cfeeff 40%, #b6e0ff 100%)",
        padding: "40px 20px",
      }}
    >
      <div className={styles.cardWrapper}>
        <div className={styles.cardBg}>
          <div className={styles.card}>
            <a href={`/diskusi/${groupId}`} className={styles.back}>← Kembali ke diskusi</a>
            <h2 className={styles.title}>Thread Reply</h2>

            <div className={styles.threadArea || ""}>
              {/* original message: align left if not ours, right if ours */}
              <div className={`${styles.message} ${message?.uid === user?.uid ? styles.mine : ""}`}>
                {message ? (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                          {message.avatar || "🙂"}
                        </div>
                        <strong style={{ fontWeight: 700 }}>{message.displayName || "Anon"}</strong>
                      </div>
                      <span style={{ color: "#6b7280", fontSize: 12 }}>
                        {message.timestamp?.toDate ? message.timestamp.toDate().toLocaleString() : "—"}
                      </span>
                    </div>
                    <div style={{ fontSize: 15, color: "#0f172a", whiteSpace: "pre-wrap" }}>{message.text}</div>
                  </>
                ) : (
                  <div>Memuat pesan…</div>
                )}
              </div>

              {/* replies list: left for others, right for our messages */}
              <div className={styles.replies}>
                {replies.length === 0 && <div style={{ color: "rgba(15,23,42,0.6)", textAlign: "center" }}>Belum ada balasan.</div>}
                {replies.map((r) => {
                  const mine = r.uid && user && r.uid === user.uid;
                  return (
                    <div key={r.id} className={`${styles.reply} ${mine ? styles.mine : styles.theirs}`}>
                      <div className={styles.replyBubble}>
                        <div className={styles.replyMeta}>
                          <span className={styles.replyName}>{r.displayName || (r.uid ? r.uid.slice(0, 6) : "Anon")}</span>
                          <span className={styles.replyTime}>{r.timestamp?.toDate ? r.timestamp.toDate().toLocaleString() : "—"}</span>
                        </div>
                        <div className={styles.replyText}>{r.text}</div>
                      </div>
                    </div>
                  );
                })}
                <div ref={endRef} />
              </div>
            </div>

            {/* input row with emoji picker (emoji-mart) */}
            <div className={styles.inputRow} style={{ position: "relative" }}>
              <div style={{ width: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <button
                  type="button"
                  onClick={() => setShowEmoji((s) => !s)}
                  style={{ background: "transparent", border: "none", fontSize: 20 }}
                  aria-label="Toggle Emoji"
                >
                  😊
                </button>
              </div>

              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={user ? "Tulis balasan..." : "Masuk untuk membalas..."}
                className={styles.input}
                disabled={!user}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSend();
                }}
              />

              <button onClick={handleSend} className={styles.send} disabled={!user || loading}>
                {loading ? "Kirim..." : "Kirim"}
              </button>

              {showEmoji && (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    bottom: "100%",
                    marginBottom: 10,
                    zIndex: 60,
                  }}
                >
                  <div style={{ background: "white", borderRadius: 8, boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }}>
                    <Picker
                      data={data}
                      onEmojiSelect={(e) => {
                        setText((t) => t + e.native);
                        setShowEmoji(false);
                      }}
                      theme="auto"
                      emojiSize={20}
                      previewPosition="none"
                      style={{ width: 320, borderRadius: 8 }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}