"use client";

import { useState } from "react";
import Image from "next/image";

export default function ChatMessage({
  msg,
  messages,
  profiles,
  currentUser,
  anonUid,
  sendMessage, // (text, parentId)
  toggleReaction,
  deleteMessage,
}) {
  const [showReplies, setShowReplies] = useState(false);
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState("");

  const replies = (messages || [])
    .filter((m) => m.parentId === msg.id)
    .sort(
      (a, b) =>
        (a.createdAt?.toMillis?.() || 0) - (b.createdAt?.toMillis?.() || 0)
    );

  const profile = profiles[msg.uid] || {
    funnyName: msg.name || "AnonUser",
    avatar: msg.avatar || "🙂",
  };

  const onSendReply = async () => {
    if (!replyText?.trim()) return;
    await sendMessage(replyText.trim(), msg.id);
    setReplyText("");
    setReplying(false);
    setShowReplies(true);
  };

  return (
    <div
      className={`relative p-4 rounded-xl max-w-[85%] flex flex-col shadow-md bg-white ${
        msg.uid === currentUser?.uid ? "ml-auto" : "mr-auto"
      }`}
      style={{ border: "1px solid rgba(0,0,0,0.04)" }}
    >
      <div className="flex items-start gap-3 mb-2">
        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
          {profile.avatar?.startsWith?.("http") ? (
            <Image
              src={profile.avatar}
              alt={profile.funnyName}
              width={40}
              height={40}
              className="object-cover"
            />
          ) : (
            <div className="w-10 h-10 flex items-center justify-center text-lg">
              {profile.avatar}
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-sm">{profile.funnyName}</div>
              <div className="text-xs text-gray-400">
                {msg.createdAt?.toDate?.().toLocaleString?.() || "Sending..."}
              </div>
            </div>
            <div className="text-xs text-gray-400" />
          </div>

          <div className="mt-3 text-sm whitespace-pre-wrap text-gray-800">
            {msg.text}
          </div>

          <div className="flex gap-3 mt-3 text-xs items-center">
            <button
              onClick={() => toggleReaction(msg.id, "👍")}
              className="hover:scale-110 transition"
            >
              👍{" "}
              {Array.isArray(msg.reactions?.["👍"])
                ? msg.reactions["👍"].length
                : ""}
            </button>

            <button
              onClick={() => {
                setReplying((s) => !s);
                setShowReplies(true);
              }}
              className="ml-2 text-sm text-gray-600 hover:underline"
            >
              Reply
            </button>

            {replies.length > 0 && (
              <button
                onClick={() => setShowReplies((s) => !s)}
                className="ml-2 text-sm text-blue-600 hover:underline"
              >
                Lihat thread → ({replies.length})
              </button>
            )}
          </div>

          {showReplies && replies.length > 0 && (
            <div className="mt-3 space-y-2 pl-6">
              {replies.map((r) => {
                const rp = profiles[r.uid] || {
                  funnyName: r.name || "AnonUser",
                  avatar: r.avatar || "🙂",
                };
                return (
                  <div
                    key={r.id}
                    className="p-3 rounded-lg bg-gray-50 border text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-semibold">{rp.funnyName}</div>
                      <div className="text-xs text-gray-400">
                        {r.createdAt?.toDate?.().toLocaleString?.()}
                      </div>
                    </div>
                    <div className="mt-1 text-sm">{r.text}</div>
                  </div>
                );
              })}
            </div>
          )}

          {replying && (
            <div className="mt-3 flex items-center gap-2">
              <input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="flex-1 border border-gray-200 p-2 rounded-md"
                placeholder="Tulis balasan..."
                onKeyDown={(e) => e.key === "Enter" && onSendReply()}
              />
              <button
                onClick={onSendReply}
                className="bg-[#3061F2] text-white px-3 py-2 rounded-md"
              >
                Kirim
              </button>
              <button
                onClick={() => setReplying(false)}
                className="text-sm text-gray-500"
              >
                Batal
              </button>
            </div>
          )}
        </div>
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
    </div>
  );
}
