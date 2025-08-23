import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  // ...tambahkan jika ada
};

// inisialisasi aman untuk HMR / multiple imports
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// debug singkat (hapus di produksi)
if (typeof window !== "undefined") {
  console.debug("firebase exports:", {
    app: !!app,
    auth: !!auth,
    db: !!db,
    googleProvider: !!googleProvider,
  });
}

// ✅ Anonymous Auth Init
export const initAuth = () => {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      signInAnonymously(auth).catch((error) => {
        console.error("Auth Error:", error);
      });
    }
  });
};

// ✅ Listen for Auth State Changes
export const listenAuth = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// ✅ Get message query for a channel
export const getMessagesQuery1 = (channelId) => {
  return query(
    collection(db, "channels", channelId, "messages"),
    orderBy("timestamp", "asc")
  );
};

// ✅ Send a message (TIDAK diubah; tetap seperti aslinya)
export const sendMessage1 = async (
  channelId,
  { text, uid, imageUrl = null, senderName, avatar, reactions = {}, timestamp }
) => {
  return await addDoc(collection(db, "channels", channelId, "messages"), {
    text,
    uid,
    imageUrl,
    senderName, // pastikan selalu diisi!
    avatar, // pastikan selalu diisi!
    reactions,
    timestamp,
    replyCount: 0,
  });
};

// ✅ Toggle reaction (emoji => array of uid) untuk pesan utama
export const toggleReaction1 = async (channelId, messageId, emoji, uid) => {
  const ref = doc(db, "channels", channelId, "messages", messageId);

  await runTransaction(db, async (transaction) => {
    const docSnap = await transaction.get(ref);
    if (!docSnap.exists()) return;

    const data = docSnap.data();
    const current = data.reactions?.[emoji] || [];

    const hasReacted = current.includes(uid);
    const updated = hasReacted
      ? current.filter((id) => id !== uid)
      : [...current, uid];

    transaction.update(ref, {
      [`reactions.${emoji}`]: updated,
    });
  });
};

/* -------------------------------------------------
   💬 REPLIES: 1-level thread (fungsi BARU, suffix "1")
   Struktur: channels/{channelId}/messages/{messageId}/replies/{replyId}
--------------------------------------------------*/

// 🔔 Realtime jumlah reply (mengacu ke field replyCount di parent)
export const listenReplyCount1 = (channelId, messageId, callback) => {
  const parentRef = doc(db, "channels", channelId, "messages", messageId);
  return onSnapshot(parentRef, (snap) => {
    const data = snap.data() || {};
    callback(typeof data.replyCount === "number" ? data.replyCount : 0);
  });
};

// 🔔 Realtime daftar reply (urutan ascending berdasarkan timestamp)
export const listenReplies1 = (channelId, messageId, callback) => {
  const q = query(
    collection(db, "channels", channelId, "messages", messageId, "replies"),
    orderBy("timestamp", "asc")
  );
  return onSnapshot(q, (snapshot) => {
    const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(docs);
  });
};

// ➕ Kirim reply (sekalian increment replyCount di parent)
// Catatan: validasi "hanya user non-anonymous" sebaiknya di UI; di sini fokus data layer.
export const sendReply1 = async (
  channelId,
  messageId,
  { text, uid, imageUrl = null, senderName, avatar }
) => {
  const parentRef = doc(db, "channels", channelId, "messages", messageId);

  const replyRef = await addDoc(collection(parentRef, "replies"), {
    text,
    uid,
    imageUrl,
    senderName, // pastikan selalu diisi!
    avatar, // pastikan selalu diisi!
    timestamp: serverTimestamp(),
    reactions: {},
  });

  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(parentRef);
    if (!snap.exists()) return;
    const curr = snap.data()?.replyCount || 0;
    transaction.update(parentRef, { replyCount: curr + 1 });
  });

  return replyRef.id;
};

// 😀 Toggle reaction pada REPLY (format sama: reactions.{emoji} = [uid...])
export const toggleReplyReaction1 = async (
  channelId,
  messageId,
  replyId,
  emoji,
  uid
) => {
  const ref = doc(
    db,
    "channels",
    channelId,
    "messages",
    messageId,
    "replies",
    replyId
  );

  await runTransaction(db, async (transaction) => {
    const docSnap = await transaction.get(ref);
    if (!docSnap.exists()) return;

    const data = docSnap.data();
    const current = data.reactions?.[emoji] || [];

    const hasReacted = current.includes(uid);
    const updated = hasReacted
      ? current.filter((id) => id !== uid)
      : [...current, uid];

    transaction.update(ref, {
      [`reactions.${emoji}`]: updated,
    });
  });
};

/* -------------------------------------------------
   👤 USERS (tetap)
--------------------------------------------------*/

export const createUserIfNotExists = async (uid) => {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) {
    await setDoc(userRef, {
      createdAt: serverTimestamp(),
    });
  }
};

/* -------------------------------------------------
   👥 GROUP MANAGEMENT (tetap)
--------------------------------------------------*/

export const getGroupsQuery = () =>
  query(collection(db, "groups"), orderBy("createdAt", "desc"));

export const createGroup = async (name, userId) => {
  const userGroupsQuery = query(
    collection(db, "groups"),
    where("createdBy", "==", userId)
  );
  const snapshot = await getDocs(userGroupsQuery);

  if (snapshot.size >= 10) {
    throw new Error("Kamu sudah membuat maksimal 10 grup.");
  }

  const groupRef = await addDoc(collection(db, "groups"), {
    name,
    createdAt: serverTimestamp(),
    createdBy: userId,
  });

  await setDoc(doc(db, "groups", groupRef.id, "members", userId), {
    role: "admin",
    joinedAt: serverTimestamp(),
  });

  return groupRef.id;
};

export const getUserGroups = async (userId) => {
  const snapshot = await getDocs(collection(db, "groups"));
  const groups = [];

  for (const groupDoc of snapshot.docs) {
    const memberRef = doc(db, "groups", groupDoc.id, "members", userId);
    const memberSnap = await getDoc(memberRef);
    if (memberSnap.exists()) {
      groups.push({ id: groupDoc.id, ...groupDoc.data() });
    }
  }

  return groups;
};

export const addMember = async (groupId, adminId, userIdToAdd) => {
  const adminRef = doc(db, "groups", groupId, "members", adminId);
  const adminSnap = await getDoc(adminRef);

  if (!adminSnap.exists() || adminSnap.data().role !== "admin") {
    throw new Error("Hanya admin yang bisa menambahkan anggota.");
  }

  await setDoc(doc(db, "groups", groupId, "members", userIdToAdd), {
    role: "member",
    joinedAt: serverTimestamp(),
  });
};

export const removeMember = async (groupId, adminId, userIdToRemove) => {
  const adminRef = doc(db, "groups", groupId, "members", adminId);
  const adminSnap = await getDoc(adminRef);

  if (!adminSnap.exists() || adminSnap.data().role !== "admin") {
    throw new Error("Hanya admin yang bisa menghapus anggota.");
  }

  await updateDoc(doc(db, "groups", groupId), {
    [`members.${userIdToRemove}`]: deleteField(),
  });

  await setDoc(
    doc(db, "groups", groupId, "members", userIdToRemove),
    {},
    { merge: true }
  );
};

/* -------------------------------------------------
   💬 GROUP MESSAGES (tetap)
--------------------------------------------------*/

export const getMessagesQuery = (groupId) => {
  return query(
    collection(db, "groups", groupId, "messages"),
    orderBy("timestamp", "asc")
  );
};

export const sendMessage = async (
  groupId,
  { text, uid, senderName, imageUrl = null }
) => {
  if (!uid || !senderName || !text) {
    throw new Error("Missing required fields: uid, senderName, or text");
  }

  return await addDoc(collection(db, "groups", groupId, "messages"), {
    text,
    uid,
    senderName,
    imageUrl,
    timestamp: serverTimestamp(),
    reactions: {},
  });
};

// 😀 REACTIONS (on group messages)
export const toggleReaction = async (groupId, messageId, emoji, uid) => {
  const ref = doc(db, "groups", groupId, "messages", messageId);

  await runTransaction(db, async (transaction) => {
    const docSnap = await transaction.get(ref);
    if (!docSnap.exists()) return;

    const data = docSnap.data();
    const current = data.reactions?.[emoji] || [];

    const hasReacted = current.includes(uid);
    const updated = hasReacted
      ? current.filter((id) => id !== uid)
      : [...current, uid];

    transaction.update(ref, {
      [`reactions.${emoji}`]: updated,
    });
  });
};

// Tambahan: fungsi untuk mendapatkan profil pengguna (dari msg.senderId)
export const getUserProfile = async (userId) => {
  const userSnap = await getDoc(doc(db, "users", userId));
  if (userSnap.exists()) {
    const userData = userSnap.data();
    return {
      id: userId,
      funnyName: userData.funnyName || "Anon",
      avatar: userData.avatar || "🙂",
    };
  } else {
    return null;
  }
};

// Contoh penggunaan di komponen pesan
/*
const MessageComponent = ({ msg }) => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const userProfile = await getUserProfile(msg.senderId);
      setProfile(userProfile);
    };

    fetchProfile();
  }, [msg.senderId]);

  return (
    <div>
      {profile ? (
        <>
          <img src={profile.avatar} alt={profile.funnyName} />
          <span>{profile.funnyName}</span>
        </>
      ) : (
        "Loading..."
      )}
      <p>{msg.text}</p>
    </div>
  );
};
*/
