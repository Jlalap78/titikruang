'use client';

import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import { useRouter } from 'next/navigation';

import {
  Smile,
  Image as ImageIcon,
  Send,
  X,
  MessageCircle,
} from 'lucide-react';

import {
  initAuth,
  listenAuth,
  getMessagesQuery1,
  sendMessage1,
  toggleReaction1,

  // replies (fungsi BARU – sudah kamu punya di lib/firebase.js versi terakhir)
  listenReplies1,
  sendReply1,
  toggleReplyReaction1,
} from '../../lib/firebase';

import {
  onSnapshot,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { db } from '../../lib/firebase';

import { filterMessage } from '../../lib/filterMessage';

// --- name/avatar pools
const adjectives = ['Happy', 'Blue', 'Mighty', 'Sneaky', 'Brave', 'Chill', 'Silly', 'Witty', 'Lucky', 'Zany'];
const animals = ['Tiger', 'Panda', 'Otter', 'Eagle', 'Penguin', 'Koala', 'Fox', 'Shark', 'Bear', 'Cat'];
const avatarEmojis = ['🐯', '🐼', '🦊', '🦈', '🐻', '🐧', '🦅', '🐨', '🐱', '🦦'];

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
    const ref = doc(db, 'userProfiles', uid);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      const data = snap.data();
      return {
        funnyName: data.funnyName || data.name || data.displayName || `${uid.slice(0, 6)}`,
        avatar: data.avatar || data.emoji || '🙂',
      };
    } else {
      const { name, emoji } = makeRandomNameAndEmoji();
      await setDoc(ref, { funnyName: name, avatar: emoji }, { merge: true });
      return { funnyName: name, avatar: emoji };
    }
  } catch (err) {
    console.error('ensureUserProfile error', err);
    return { funnyName: `${uid.slice(0, 6)}`, avatar: '🙂' };
  }
}

// helper for anonymous reaction id stored locally so guests can react
function getOrCreateAnonUid() {
  if (typeof window === 'undefined') return null;
  let anon = localStorage.getItem('anonUid');
  if (!anon) {
    anon = 'anon_' + Math.random().toString(36).slice(2, 10);
    localStorage.setItem('anonUid', anon);
  }
  return anon;
}

/**
 * NSFW model loader & checker (client-side)
 * - model is cached in module scope
 */
let _nsfwModel = null;
async function loadNSFWModelIfNeeded() {
  if (_nsfwModel) return _nsfwModel;
  await import('@tensorflow/tfjs'); // dynamic import
  const nsfwjs = await import('nsfwjs');
  _nsfwModel = await nsfwjs.load();
  return _nsfwModel;
}

async function isImageSafe(file, threshold = 0.6) {
  try {
    const model = await loadNSFWModelIfNeeded();
    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    await new Promise((res, rej) => {
      img.onload = () => res();
      img.onerror = () => rej(new Error('Gagal memuat gambar untuk pemeriksaan NSFW'));
    });

    const predictions = await model.classify(img);
    URL.revokeObjectURL(img.src);

    const unsafeLabels = ['Porn', 'Hentai', 'Sexy'];
    const foundUnsafe = predictions.some(p => unsafeLabels.includes(p.className) && p.probability >= threshold);

    return { safe: !foundUnsafe, predictions };
  } catch (err) {
    console.error('NSFW check error:', err);
    return { safe: false, predictions: [] };
  }
}

/**
 * Upload helper to Cloudinary using unsigned preset with progress (XHR)
 * Returns { url } or throws
 */
function uploadToCloudinaryWithProgress(file, onProgress) {
  return new Promise((resolve, reject) => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      return reject(new Error('Cloudinary env vars not configured (NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET).'));
    }

    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', uploadPreset);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && typeof onProgress === 'function') {
        const percent = (event.loaded / event.total) * 100;
        onProgress(percent);
      }
    };

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const res = JSON.parse(xhr.responseText);
            if (res.secure_url) {
              resolve({ url: res.secure_url, raw: res });
            } else {
              reject(new Error(res.error?.message || 'Upload failed (no secure_url)'));
            }
          } catch (err) {
            reject(new Error('Failed parsing Cloudinary response'));
          }
        } else {
          let errMsg = `Cloudinary upload failed: ${xhr.status}`;
          try {
            const parsed = JSON.parse(xhr.responseText || '{}');
            errMsg = parsed.error?.message || errMsg;
          } catch (e) {}
          reject(new Error(errMsg));
        }
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload to Cloudinary'));
    xhr.send(fd);
  });
}

export default function DiskusiPage() {
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState(null);
  const [input, setInput] = useState('');
  const [profiles, setProfiles] = useState({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewImage, setPreviewImage] = useState(null);
  const [nsfwChecking, setNsfwChecking] = useState(false);
  const [notAllowedMsg, setNotAllowedMsg] = useState('');
  const [anonUid, setAnonUid] = useState(null);

  // Replies (thread)
  const [expanded, setExpanded] = useState({}); // { [msgId]: bool }
  const [repliesMap, setRepliesMap] = useState({}); // { [msgId]: Array<reply> }
  const [replyInputs, setReplyInputs] = useState({}); // { [msgId]: string }
  const repliesUnsubsRef = useRef({}); // { [msgId]: unsubscribe }

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const activeChannel = 'general';
  const isGuest = !user || user.isAnonymous;
  const router = useRouter();

  // init auth
  useEffect(() => {
    initAuth();
    const unsub = listenAuth(async (loggedInUser) => {
      setUser(loggedInUser);
      if (loggedInUser) {
        const profile = await ensureUserProfile(loggedInUser.uid);
        setProfiles(prev => ({ ...prev, [loggedInUser.uid]: profile }));
        setAnonUid(null);
      } else {
        const a = getOrCreateAnonUid();
        setAnonUid(a);
      }
    });
    return () => unsub();
  }, []);

  // messages listener (REALTIME)
  useEffect(() => {
    const q = getMessagesQuery1(activeChannel);
    const unsub = onSnapshot(q, async (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setMessages(docs);

      // prefetch missing profiles (author of messages)
      const uids = Array.from(new Set(docs.map(m => m.uid).filter(Boolean)));
      const missing = uids.filter(uid => !profiles[uid]);
      if (missing.length > 0) {
        try {
          const results = await Promise.all(missing.map(uid => ensureUserProfile(uid)));
          const map = {};
          missing.forEach((uid, idx) => (map[uid] = results[idx]));
          setProfiles(prev => ({ ...prev, ...map }));
        } catch (e) {
          console.error('prefetch profiles error', e);
        }
      }
    });
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChannel]); // don't include profiles

  // Auto-scroll ke bawah saat masuk halaman & saat jumlah pesan berubah
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  }, []);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // small helper to show message when action is not allowed for guests
  const showNotAllowed = (msg) => {
    setNotAllowedMsg(msg);
    setTimeout(() => setNotAllowedMsg(''), 3500);
  };

  // send message (text + optional image)
  const handleSend = async () => {
    if (!input.trim() && !previewImage?.file) return;

    // hanya user login non-anonymous yang boleh create message (sesuai rules)
    if (isGuest) {
      showNotAllowed('Tidak bisa mengirim pesan/gambar jika belum login non-anonymous');
      return;
    }

    if (!profiles[user.uid]) {
      const p = await ensureUserProfile(user.uid);
      setProfiles(prev => ({ ...prev, [user.uid]: p }));
    }
    const senderProfile = profiles[user.uid] || (await ensureUserProfile(user.uid));

    let imageUrl = null;

    if (previewImage?.file) {
      try {
        setUploadingImage(true);
        setUploadProgress(0);

        const { file } = previewImage;
        const { safe } = await isImageSafe(file, 0.6);
        if (!safe) {
          alert('Gambar terdeteksi mengandung konten dewasa (NSFW). Upload dibatalkan.');
          setUploadingImage(false);
          setUploadProgress(0);
          return;
        }

        const res = await uploadToCloudinaryWithProgress(file, (p) => {
          setUploadProgress(Number(p.toFixed(1)));
        });

        if (!res || !res.url) throw new Error('Upload gagal (no url)');

        imageUrl = res.url;
      } catch (err) {
        console.error('Upload image error:', err);
        alert('Gagal mengunggah gambar: ' + (err.message || 'unknown'));
        setUploadingImage(false);
        setUploadProgress(0);
        return;
      } finally {
        setUploadingImage(false);
        setUploadProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }

    await sendMessage1(activeChannel, {
      text: input ? filterMessage(input.trim()) : '',
      uid: user.uid,
      senderName: senderProfile.funnyName,
      avatar: senderProfile.avatar,
      reactions: {},
      imageUrl: imageUrl,
      timestamp: serverTimestamp(),
    });

    setInput('');
    setPreviewImage(null);
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleEmojiSelect = (emoji) => {
    const char = emoji.native || emoji.emoji || '';
    setInput(prev => prev + char);
    setShowEmojiPicker(false);
  };

  // file select -> validation + NSFW check -> set preview if safe
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isGuest) {
      e.target.value = '';
      showNotAllowed('Anda harus login non-anonymous untuk mengunggah gambar');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const MAX_MB = 5;

    if (!allowedTypes.includes(file.type)) {
      alert('Hanya file JPG, PNG, atau WebP yang diizinkan.');
      e.target.value = '';
      return;
    }

    if (file.size > MAX_MB * 1024 * 1024) {
      alert(`Ukuran gambar maksimal ${MAX_MB} MB`);
      e.target.value = '';
      return;
    }

    try {
      setNsfwChecking(true);
      const { safe } = await isImageSafe(file, 0.6);
      setNsfwChecking(false);

      if (!safe) {
        alert('Gagal: Gambar terdeteksi mengandung konten dewasa (NSFW).');
        e.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage({ file, url: reader.result });
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setNsfwChecking(false);
      console.error('Error saat cek NSFW:', err);
      alert('Terjadi error saat memeriksa gambar. Coba lagi nanti.');
      e.target.value = '';
    }
  };

  const handleReaction = async (msgId, emoji) => {
    // reactions boleh oleh semua user login (anon & non-anon) — sesuai rules
    const actor = user?.uid || getOrCreateAnonUid();
    try {
      await toggleReaction1(activeChannel, msgId, emoji, actor);
    } catch (err) {
      console.error('reaction error', err);
    }
  };

  // === THREAD / REPLIES ===
  const toggleThread = (msgId) => {
    setExpanded(prev => {
      const next = { ...prev, [msgId]: !prev[msgId] };
      const isOpen = next[msgId];

      // subscribe/unsubscribe replies
      if (isOpen && !repliesUnsubsRef.current[msgId]) {
        const unsub = listenReplies1(activeChannel, msgId, async (list) => {
          setRepliesMap(prevMap => ({ ...prevMap, [msgId]: list }));

          // prefetch reply authors' profiles
          const uids = Array.from(new Set(list.map(r => r.uid).filter(Boolean)));
          const missing = uids.filter(uid => !profiles[uid]);
          if (missing.length > 0) {
            try {
              const results = await Promise.all(missing.map(uid => ensureUserProfile(uid)));
              const map = {};
              missing.forEach((uid, idx) => (map[uid] = results[idx]));
              setProfiles(prev => ({ ...prev, ...map }));
            } catch (e) {
              console.error('prefetch reply profiles error', e);
            }
          }
        });
        repliesUnsubsRef.current[msgId] = unsub;
      } else if (!isOpen && repliesUnsubsRef.current[msgId]) {
        repliesUnsubsRef.current[msgId]();
        delete repliesUnsubsRef.current[msgId];
      }

      return next;
    });
  };

  const handleSendReply = async (msgId) => {
    if (isGuest) {
      showNotAllowed('Hanya user login non-anonymous yang bisa reply');
      return;
    }
    const text = (replyInputs[msgId] || '').trim();
    if (!text) return;

    try {
      await sendReply1(activeChannel, msgId, {
        text: filterMessage(text),
        uid: user.uid,
        imageUrl: null,
      });
      setReplyInputs(prev => ({ ...prev, [msgId]: '' }));
    } catch (e) {
    }
  };

  const handleReplyReaction = async (msgId, replyId, emoji) => {
    const actor = user?.uid || getOrCreateAnonUid();
    try {
      await toggleReplyReaction1(activeChannel, msgId, replyId, emoji, actor);
    } catch (e) {
      console.error('toggleReplyReaction error', e);
    }
  };

  // ensure anon id exists for guests
  useEffect(() => {
    if (!user) {
      const a = getOrCreateAnonUid();
      setAnonUid(a);
    }
  }, [user]);

  // Unsubscribe semua reply listener lama
  useEffect(() => {
    Object.values(repliesUnsubsRef.current).forEach(unsub => unsub && unsub());
    repliesUnsubsRef.current = {};

    // Subscribe reply untuk setiap pesan
    messages.forEach(msg => {
      const unsub = listenReplies1(activeChannel, msg.id, (list) => {
        setRepliesMap(prevMap => ({ ...prevMap, [msg.id]: list }));
      });
      repliesUnsubsRef.current[msg.id] = unsub;
    });

    // Cleanup saat messages berubah/unmount
    return () => {
      Object.values(repliesUnsubsRef.current).forEach(unsub => unsub && unsub());
      repliesUnsubsRef.current = {};
    };
  }, [messages, activeChannel]);

  return (
    <main>
      <div className="min-h-screen bg-gradient-to-br from-[#3061F2] via-white to-[#F2BF27]/10 text-gray-800">
        <div className="flex flex-col h-screen bg-[#EAF0FA] text-black font-sans">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-white/60 backdrop-blur-md border-b border-[#F2BF27] sticky top-0 z-10">
            <div className="hidden md:block">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600"
                onClick={() => router.push('/')}

              >
                Beranda
              </button>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Search"
                className="bg-white text-sm px-3 py-1 rounded-md border border-[#F2BF27] shadow-sm focus:outline-none"
              />
              {isGuest && (
                <Link href="/login">
                  <button className="bg-[#F25050] text-white px-4 py-2 rounded-xl hover:bg-[#F2780C]">
                    Masuk
                  </button>
                </Link>
              )}
            </div>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
            {messages.map((msg) => {
              const profile = profiles[msg.uid] || { funnyName: msg.senderName || 'Anon', avatar: msg.avatar || '🙂' };
              const replies = repliesMap[msg.id] || [];
              const replyCount = repliesMap[msg.id]?.length || 0;

              return (
                <div key={msg.id} className="flex flex-col gap-2 bg-white rounded-xl shadow p-4 hover:shadow-md transition">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#F28907] flex items-center justify-center text-lg shadow">
                      {profile.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 mb-1">
                        <span className="font-semibold text-black">
                          {profile.funnyName}
                        </span>{' '}
                        {msg.timestamp?.toDate?.().toLocaleString?.() ?? '...'}
                      </p>
                      {msg.text && <p className="text-gray-800">{filterMessage(msg.text)}</p>}
                      {msg.imageUrl && (
                        <div className="mt-2">
                          <Image src={msg.imageUrl} alt="Sent image" width={300} height={300} className="rounded-lg object-cover" unoptimized />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions: Reactions + Reply */}
                  <div className="flex items-center gap-2 pl-14 pt-1">
                    {['👍', '😂', '🔥'].map((emoji) => {
                      const actor = user?.uid || anonUid || getOrCreateAnonUid();
                      const count = msg.reactions?.[emoji]?.length || 0;
                      const hasReacted = msg.reactions?.[emoji]?.includes(actor);
                      return (
                        <button
                          key={emoji}
                          onClick={() => handleReaction(msg.id, emoji)}
                          className={`flex items-center gap-1 text-sm px-2 py-1 rounded-full border transition ${hasReacted
                            ? 'bg-[#3061F2] text-white border-[#3061F2]'
                            : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                            }`}
                          title="Berikan reaksi"
                        >
                          {emoji}
                          {count > 0 && <span>{count}</span>}
                        </button>
                      );
                    })}

                    {/* Reply toggle (expand thread) */}
                    <button
                      onClick={() => toggleThread(msg.id)}
                      className="flex items-center gap-1 text-sm px-2 py-1 rounded-full border bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                      title="Tampilkan/Sembunyikan balasan"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{replyCount}</span>
                    </button>

                    {/* Link ke halaman thread khusus */}
                    <Link
                      href={`/ruang/reply/${msg.id}`}
                      className="text-xs text-[#3061F2] hover:underline ml-1"
                      title="Buka halaman thread"
                    >
                      Komen →
                    </Link>
                  </div>

                  {/* Thread (expand) */}
                  {expanded[msg.id] && (
                    <div className="pl-14 pt-2 space-y-3">
                      {replies.length === 0 && (
                        <div className="text-sm text-gray-500">Belum ada balasan.</div>
                      )}

                      {/* Ambil 2 reply dengan jumlah total reaksi terbanyak */}
                      {replies
                        .slice()
                        .sort((a, b) => {
                          const aCount = Object.values(a.reactions || {}).reduce((sum, arr) => sum + arr.length, 0);
                          const bCount = Object.values(b.reactions || {}).reduce((sum, arr) => sum + arr.length, 0);
                          return bCount - aCount;
                        })
                        .slice(0, 2)
                        .map((rep) => {
                          const rprof = profiles[rep.uid] || { funnyName: rep.senderName || (rep.uid ? rep.uid.slice(0, 6) : 'Anon'), avatar: rep.avatar || '🙂' };
                          const rReactions = rep.reactions || {};
                          return (
                            <div key={rep.id} className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#F2BF27]/60 flex items-center justify-center text-base">
                                {rprof.avatar}
                              </div>
                              <div className="flex-1">
                                <p className="text-xs text-gray-500">
                                  <span className="font-semibold text-black">{rprof.funnyName}</span>{' '}
                                  {rep.timestamp?.toDate?.().toLocaleString?.() ?? '...'}
                                </p>
                                {rep.text && <p className="text-sm text-gray-800">{filterMessage(rep.text)}</p>}

                                {/* reply reactions */}
                                <div className="flex items-center gap-2 pt-1">
                                  {['👍', '😂', '🔥'].map((emoji) => {
                                    const actor = user?.uid || anonUid || getOrCreateAnonUid();
                                    const arr = rReactions?.[emoji] || [];
                                    const hasReacted = arr.includes(actor);
                                    const count = arr.length;
                                    return (
                                      <button
                                        key={emoji}
                                        onClick={() => handleReplyReaction(msg.id, rep.id, emoji)}
                                        className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border transition ${hasReacted
                                          ? 'bg-[#3061F2] text-white border-[#3061F2]'
                                          : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                                          }`}
                                        title="Reaksi balasan"
                                      >
                                        {emoji}
                                        {count > 0 && <span>{count}</span>}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          );
                        })}

                      {/* Tombol lihat lebih lanjut jika reply lebih dari 2 */}
                      {replies.length > 2 && (
                        <div>
                          <a
                            href={`/ruang/reply/${msg.id}`}
                            className="text-sm text-[#3061F2] hover:underline"
                            title="Lihat thread reply"
                          >
                            lihat lebih banyak →
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Preview before send */}
          {previewImage && (
            <div className="px-6 py-2 bg-white border-t flex items-center gap-3">
              <div className="relative w-20 h-20">
                <Image src={previewImage.url} alt="Preview" fill className="object-cover rounded-md" unoptimized />
                <button
                  onClick={() => setPreviewImage(null)}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                  title="Hapus pratinjau"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 flex items-center gap-3">
                <button
                  onClick={handleSend}
                  disabled={uploadingImage || isGuest}
                  className={`bg-[#3061F2] text-white px-3 py-2 rounded-md hover:bg-[#27A4F2] ${isGuest ? 'opacity-60 cursor-not-allowed' : ''}`}
                  title={isGuest ? 'Login untuk mengirim gambar' : (uploadingImage ? 'Mengunggah...' : 'Kirim Gambar')}
                >
                  {uploadingImage ? 'Mengunggah...' : 'Kirim Gambar'}
                </button>

                {uploadingImage && (
                  <div className="flex-1 h-2 bg-gray-200 rounded">
                    <div className="h-2 bg-[#F2780C] rounded" style={{ width: `${uploadProgress}%` }} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Input bar */}
          <div className="bg-white/80 backdrop-blur-md px-6 py-4 border-t border-[#F2BF27] relative">
            {showEmojiPicker && (
              <div className="absolute bottom-16 left-6 z-50">
                <Picker
                  data={data}
                  onEmojiSelect={handleEmojiSelect}
                  theme="light"
                />
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                className={`text-[#3061F2] hover:text-[#F2780C] transition ${isGuest ? 'opacity-60 cursor-not-allowed' : ''}`}
                onClick={() => {
                  if (isGuest) {
                    showNotAllowed('Anda harus login untuk mengirim gambar');
                    return;
                  }
                  fileInputRef.current && fileInputRef.current.click();
                }}
                disabled={uploadingImage || nsfwChecking || isGuest}
                title={isGuest ? '🔒 Login untuk mengirim gambar' : (uploadingImage ? 'Mengunggah...' : (nsfwChecking ? 'Memeriksa gambar...' : 'Kirim gambar'))}
              >
                <ImageIcon className="w-5 h-5" />
              </button>

              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileSelect}
              />

              <button
                className={`text-[#3061F2] hover:text-[#F2780C] transition ${isGuest ? 'opacity-60 cursor-not-allowed' : ''}`}
                onClick={() => {
                  if (isGuest) {
                    showNotAllowed('Anda harus login untuk memasukkan emoji ke pesan');
                    return;
                  }
                  setShowEmojiPicker(prev => !prev);
                }}
                disabled={isGuest}
                title={isGuest ? '🔒 Login untuk memilih emoji' : 'Pilih emoji'}
              >
                <Smile className="w-5 h-5" />
              </button>

              <input
                type="text"
                placeholder={isGuest ? `🔒 Login untuk mengirim pesan ` : `Message #${activeChannel}`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (isGuest) {
                      e.preventDefault();
                      showNotAllowed('Harus login untuk mengirim pesan');
                      return;
                    }
                    handleSend();
                  }
                }}
                readOnly={isGuest}
                className={`flex-1 px-4 py-2 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#27A4F2] ${isGuest ? 'opacity-60 cursor-not-allowed' : ''}`}
                title={isGuest ? '🔒 Login untuk mengetik pesan' : 'Ketik pesan'}
              />

              <button
                onClick={() => {
                  if (isGuest) {
                    showNotAllowed('Tidak bisa mengirim pesan dan gambar jika belum login');
                    return;
                  }
                  handleSend();
                }}
                className={`bg-[#3061F2] hover:bg-[#27A4F2] text-white p-2 rounded-lg transition ${isGuest ? 'opacity-60 cursor-not-allowed' : ''}`}
                disabled={isGuest || uploadingImage}
                title={isGuest ? '🔒 Login untuk mengirim pesan' : 'Kirim'}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-gray-500 mt-2">
              {nsfwChecking ? 'Memeriksa gambar...' : notAllowedMsg}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
