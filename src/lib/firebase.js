import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  addDoc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  doc,
  runTransaction,
  serverTimestamp,
  where,
  onSnapshot,
} from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";

// ✅ Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyApCy23siP1bGcpM0sHnF9f91TqQ2Re0HY",
  authDomain: "anonymouschatforum.firebaseapp.com",
  projectId: "anonymouschatforum",
  storageBucket: "anonymouschatforum.appspot.com",
  messagingSenderId: "230830743478",
  appId: "1:230830743478:web:548ad86e945d53b982eb17",
  measurementId: "G-E2HPWW6TC4",
};

// ✅ Initialize Firebase
export const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

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

// ✅ Send a message
export const sendMessage1 = async (
  channelId,
  { text, uid, imageUrl = null }
) => {
  return await addDoc(collection(db, "channels", channelId, "messages"), {
    text,
    uid,
    imageUrl,
    timestamp: serverTimestamp(),
    reactions: {},
  });
};

// ✅ Toggle reaction (emoji => array of uid)
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

// 👤 USERS
export const createUserIfNotExists = async (uid) => {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) {
    await setDoc(userRef, {
      createdAt: serverTimestamp(),
    });
  }
};

// 👥 GROUP MANAGEMENT
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

// 💬 MESSAGES (in groups/{groupId}/messages)
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

// 😀 REACTIONS (on messages)
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

// 🔄 Final Export
export { db, auth, serverTimestamp };
