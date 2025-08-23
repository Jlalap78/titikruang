"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Send, X, RotateCw } from "lucide-react";
import { motion } from "framer-motion";

export default function HelpBot() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hai! Ada yang bisa saya bantu?" },
  ]);
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);
  const bottomRef = useRef(null);
  const MAX_CONTEXT = 100;

  const quickReplies = [
    "Apa itu TitikRuang?",
    "Bagaimana cara ikut diskusi?",
    "Tunjukkan FAQ",
  ];

  const scrollToFAQ = () => {
    const el = document.getElementById("faq");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const goToDiskusi = () => {
    window.location.href = "/diskusi";
  };

  const handleNavigationCommand = (msg) => {
    const cmd = msg.toLowerCase();
    if (cmd.includes("faq")) scrollToFAQ();
    else if (cmd.includes("diskusi")) goToDiskusi();
    else if (cmd.includes("beranda")) window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const sendMessage = async (overrideInput = null) => {
    const content = overrideInput ?? input;
    if (!content.trim()) return;

    const userMessage = { role: "user", content };
    const updatedMessages = [...messages, userMessage].slice(-MAX_CONTEXT);

    setMessages([...updatedMessages, { role: "assistant", content: "" }]);
    setInput("");
    setLoading(true);
    handleNavigationCommand(content);

    try {
      const res = await fetch("/api/ask-bot", {
        method: "POST",
        body: JSON.stringify({ prompt: content }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      const replyText = data.reply || "(tidak ada jawaban)";
      let current = "";

      for (let i = 0; i < replyText.length; i++) {
        current += replyText[i];
        await new Promise((r) => setTimeout(r, 12));
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { role: "assistant", content: current },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "assistant", content: "❌ Gagal menjawab. Coba lagi." },
      ]);
    }

    setLoading(false);
  };

  const handleReset = () => {
    setMessages([{ role: "assistant", content: "Halo! Ada yang bisa saya bantu?" }]);
    fetch("/api/ask-bot", {
      method: "POST",
      body: JSON.stringify({ prompt: "__reset__" }),
      headers: { "Content-Type": "application/json" },
    });
  };

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-[99] bg-gradient-to-br from-purple-600 to-indigo-600 hover:scale-105 transition-transform p-3 rounded-full shadow-xl"
      >
        {open ? <X className="text-white" /> : <Bot className="text-white" />}
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-24 right-6 z-[9999] w-80 max-h-[80vh] bg-white rounded-xl shadow-2xl flex flex-col border"
        >
          {/* Header */}
          <div className="bg-indigo-600 text-white p-3 rounded-t-xl font-semibold flex justify-between items-center">
            🤖 HelpBot
            <button onClick={handleReset}>
              <RotateCw size={16} className="text-white opacity-80 hover:opacity-100" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-3 overflow-y-auto space-y-2 text-sm scroll-smooth">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`whitespace-pre-line px-3 py-2 rounded-xl max-w-[90%] ${
                  m.role === "user" ? "ml-auto bg-indigo-100" : "bg-gray-100"
                }`}
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="text-gray-400 italic px-3 py-2">Mengetik<span className="dot-flash">...</span></div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick Replies */}
          <div className="flex flex-wrap gap-2 p-2 border-t bg-gray-50">
            {quickReplies.map((text, idx) => (
              <button
                key={idx}
                onClick={() => sendMessage(text)}
                className="text-xs bg-white border border-gray-300 px-3 py-1 rounded-full hover:bg-indigo-100"
              >
                {text}
              </button>
            ))}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex border-t p-2 gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 text-sm outline-none px-3 py-2 rounded-full border bg-gray-50"
              placeholder="Tanyakan sesuatu..."
            />
            <button type="submit" className="text-indigo-600 hover:text-indigo-800">
              <Send size={18} />
            </button>
          </form>
        </motion.div>
      )}

      {/* Dot Flash Style */}
      <style>{`
        .dot-flash::after {
          content: '.';
          animation: dots 1.2s infinite steps(4, end);
        }

        @keyframes dots {
          0%, 20% { content: '.'; }
          40% { content: '..'; }
          60% { content: '...'; }
          80%, 100% { content: '.'; }
        }
      `}</style>
    </>
  );
}
