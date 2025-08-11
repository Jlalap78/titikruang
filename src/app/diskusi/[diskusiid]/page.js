'use client';

import { useEffect, useState, useRef } from 'react';
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
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../../../lib/firebase';
import Image from 'next/image';
import { Smile, Image as ImageIcon, Send, Trash2, Edit3 } from 'lucide-react';
import { filterMessage, containsBlockedWord } from "../../../lib/filterMessage"; // ✅ Tambahan import

export default function DiskusiDetailPage({ params }) {
  const groupId = params.diskusiid;
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [members, setMembers] = useState([]);
  const fileInputRef = useRef();

  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!currentUser || !groupId) return;

    const membersRef = collection(db, 'groups', groupId, 'members');
    const unsubscribeMembers = onSnapshot(membersRef, (snapshot) => {
      setMembers(snapshot.docs.map((doc) => doc.id));
    });

    const messagesRef = collection(db, 'groups', groupId, 'messages');
    const q = query(messagesRef, orderBy('createdAt'));
    const unsubscribeMessages = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        // ✅ Sensor text sebelum render
        text: filterMessage(doc.data().text || "")
      }));
      setMessages(msgs);
      scrollToBottom();
    });

    return () => {
      unsubscribeMembers();
      unsubscribeMessages();
    };
  }, [groupId, currentUser]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !members.includes(currentUser.uid)) return;



    const messageRef = collection(db, 'groups', groupId, 'messages');
    await addDoc(messageRef, {
      text: filterMessage(newMessage), // ✅ Pastikan tersimpan dalam bentuk yang sudah difilter
      uid: currentUser.uid,
      createdAt: serverTimestamp(),
    });
    setNewMessage('');
  };

  const deleteMessage = async (id) => {
    await deleteDoc(doc(db, 'groups', groupId, 'messages', id));
  };

  const updateMessage = async (id, newText) => {
    if (containsBlockedWord(newText)) {
      alert("Pesan mengandung kata terlarang!");
      return;
    }
    await updateDoc(doc(db, 'groups', groupId, 'messages', id), { text: filterMessage(newText) });
  };

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4">
      <h1 className="text-xl font-bold mb-2">Group Chat</h1>

      <div className="space-y-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-3 rounded-xl max-w-[75%] flex flex-col shadow-md ${
              msg.uid === currentUser.uid ? 'ml-auto bg-blue-100' : 'mr-auto bg-gray-100'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 bg-blue-400 text-white text-xs font-bold flex items-center justify-center rounded-full">
                {msg.uid?.slice(0, 2).toUpperCase()}
              </div>
              <span className="text-xs text-gray-500">
                {msg.createdAt?.toDate().toLocaleString() || 'Sending...'}
              </span>
            </div>
            <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
            {msg.uid === currentUser.uid && (
              <div className="flex gap-1 mt-1 text-xs">
                <button onClick={() => deleteMessage(msg.id)} className="text-red-500 hover:underline">
                  <Trash2 size={14} />
                </button>
                {/* Add inline edit here if needed */}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Tulis pesan..."
          className="border p-2 rounded w-full"
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage} className="bg-blue-500 text-white px-4 py-2 rounded">
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
