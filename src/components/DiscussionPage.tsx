// components/DiscussionPage.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { onSnapshot, collection, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function DiscussionPage({ topic, title }: { topic: string; title: string }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(collection(db, `messages_${topic}`), orderBy('timestamp'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, [topic]);

  const sendMessage = async () => {
    if (input.trim() === '') return;
    await addDoc(collection(db, `messages_${topic}`), {
      text: input,
      timestamp: serverTimestamp(),
      user: 'Anonim',
    });
    setInput('');
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold text-[#F25050] mb-6">Diskusi: {title}</h1>
      <div className="border rounded-lg p-4 h-[500px] overflow-y-auto bg-white space-y-2 shadow">
        {messages.map((msg) => (
          <div key={msg.id} className="p-2 bg-gray-100 rounded">{msg.user}: {msg.text}</div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2 mt-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          className="flex-1 px-4 py-2 rounded border"
          placeholder="Tulis pesan..."
        />
        <button onClick={sendMessage} className="bg-[#F25050] text-white px-4 py-2 rounded hover:bg-[#F2780C]">
          Kirim
        </button>
      </div>
    </div>
  );
}
