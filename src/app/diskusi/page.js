"use client";

import { useEffect, useState } from "react";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  deleteField,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Dialog } from "@headlessui/react";
import { useRouter } from "next/navigation";

// import beberapa ikon
import { ChatBubbleLeftIcon, UsersIcon, SparklesIcon, HeartIcon } from "@heroicons/react/24/solid";

export default function DiskusiPage() {
  const router = useRouter();
  const [user, setUser] = useState(undefined);
  const [groups, setGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [newMemberUid, setNewMemberUid] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isEditDesc, setIsEditDesc] = useState(false);
  const [editedDesc, setEditedDesc] = useState("");

  // daftar ikon default
  const defaultIcons = [
    ChatBubbleLeftIcon,
    UsersIcon,
    SparklesIcon,
    HeartIcon,
  ];

  // Auth listener
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      } else {
        await signInAnonymously(auth);
      }
    });
    return () => unsubscribe();
  }, []);

  // Redirect kalau sudah tahu user tapi belum login
  useEffect(() => {
    if (user === undefined) return;
    if (!user) {
      router.replace("/login");
    }
  }, [user, router]);

  // Realtime groups
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(collection(db, "groups"), async (snapshot) => {
      const updatedGroups = [];
      for (const docSnap of snapshot.docs) {
        const groupData = docSnap.data();
        const memberDoc = await getDoc(
          doc(db, "groups", docSnap.id, "members", user.uid)
        );
        updatedGroups.push({
          id: docSnap.id,
          ...groupData,
          isMember: memberDoc.exists(),
        });
      }
      setGroups(updatedGroups);
    });
    return () => unsub();
  }, [user]);

  const handleCreateGroup = async () => {
    if (!newGroupName.trim() || !user) return;
    const groupRef = doc(collection(db, "groups"));
    await setDoc(groupRef, {
      name: newGroupName,
      description: newGroupDesc,
      createdAt: serverTimestamp(),
      createdBy: user.uid,
    });
    await setDoc(doc(db, "groups", groupRef.id, "members", user.uid), {
      role: "admin",
    });
    setNewGroupName("");
    setNewGroupDesc("");
    setIsOpen(false);
  };

  const handleJoin = async (groupId) => {
    await setDoc(doc(db, "groups", groupId, "members", user.uid), {
      role: "member",
    });
  };

  const openMemberManager = (group) => {
    onSnapshot(collection(db, "groups", group.id, "members"), (snap) => {
      const memberList = snap.docs.map((doc) => ({
        uid: doc.id,
        role: doc.data().role,
      }));
      setSelectedGroup({ ...group, members: memberList });
      setEditedDesc(group.description || "");
    });
  };

  const addMember = async () => {
    if (!newMemberUid || !selectedGroup) return;
    await setDoc(doc(db, "groups", selectedGroup.id, "members", newMemberUid), {
      role: "member",
    });
    setNewMemberUid("");
  };

  const removeMember = async (uid) => {
    if (!selectedGroup) return;
    const memberRef = doc(db, "groups", selectedGroup.id, "members", uid);
    await deleteDoc(memberRef);
    const groupRef = doc(db, "groups", selectedGroup.id);
    await updateDoc(groupRef, {
      [`members.${uid}`]: deleteField(),
    });
  };

  const updateDescription = async () => {
    if (!selectedGroup) return;
    const groupRef = doc(db, "groups", selectedGroup.id);
    await updateDoc(groupRef, { description: editedDesc });
    setIsEditDesc(false);
  };

  const isAdmin = (group) => group.createdBy === user?.uid;

  if (user === undefined) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="p-6 max-w-6xl mx-auto">
        {/* heading */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">
            Diskusi Komunitas
          </h1>
          <p className="text-gray-600 text-lg">
            Jelajahi berbagai topik yang relevan dengan kehidupan sehari-hari.
            Gabung obrolan dan temukan perspektif baru.
          </p>
        </div>

        {/* grid of groups */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => {
            const Icon =
              defaultIcons[
                Math.abs(group.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) %
                  defaultIcons.length
              ];
            return (
              <div
                key={group.id}
                className="bg-white rounded shadow p-4 hover:shadow-md transition"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200">
                    {group.imageUrl ? (
                      <img
                        src={group.imageUrl}
                        alt="Group"
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <Icon className="w-6 h-6 text-gray-600" />
                    )}
                  </div>
                  <h2 className="text-lg font-semibold">{group.name}</h2>
                </div>
                <p className="text-gray-500 text-sm mb-2">
                  {group.description || "Belum ada deskripsi."}
                </p>
                <p className="text-gray-600 text-sm mb-4">
                  Status: {group.isMember ? "✅ Anggota" : "❌ Bukan anggota"}
                </p>
                <div className="flex justify-between">
                  {group.isMember ? (
                    <a
                      href={`/diskusi/${group.id}`}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Masuk
                    </a>
                  ) : (
                    <button
                      onClick={() => handleJoin(group.id)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded text-sm"
                    >
                      Gabung
                    </button>
                  )}
                  {isAdmin(group) && (
                    <button
                      onClick={() => openMemberManager(group)}
                      className="text-gray-600 text-sm underline"
                    >
                      Kelola
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* modal buat grup */}
        <Dialog
          open={isOpen}
          onClose={() => setIsOpen(false)}
          className="relative z-10"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-sm bg-white p-6 rounded shadow">
              <Dialog.Title className="text-lg font-bold mb-2">
                Buat Grup Baru
              </Dialog.Title>
              <input
                className="w-full border px-3 py-2 rounded mb-3"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Nama Grup"
              />
              <textarea
                className="w-full border px-3 py-2 rounded mb-3"
                value={newGroupDesc}
                onChange={(e) => setNewGroupDesc(e.target.value)}
                placeholder="Deskripsi Grup"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500"
                >
                  Batal
                </button>
                <button
                  onClick={handleCreateGroup}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Buat
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>

        {/* modal kelola member + edit deskripsi */}
        {selectedGroup && (
          <Dialog
            open={true}
            onClose={() => setSelectedGroup(null)}
            className="relative z-20"
          >
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <Dialog.Panel className="w-full max-w-md bg-white p-6 rounded shadow">
                <Dialog.Title className="text-lg font-bold mb-4">
                  Kelola Grup: {selectedGroup.name}
                </Dialog.Title>

                {/* Edit deskripsi */}
                {isEditDesc ? (
                  <div className="mb-4">
                    <textarea
                      className="w-full border px-3 py-2 rounded mb-2"
                      value={editedDesc}
                      onChange={(e) => setEditedDesc(e.target.value)}
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setIsEditDesc(false)}
                        className="text-gray-500"
                      >
                        Batal
                      </button>
                      <button
                        onClick={updateDescription}
                        className="bg-blue-600 text-white px-3 py-1 rounded"
                      >
                        Simpan
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4">
                    <p className="text-gray-600 mb-2">
                      {selectedGroup.description || "Belum ada deskripsi."}
                    </p>
                    <button
                      onClick={() => setIsEditDesc(true)}
                      className="text-sm text-blue-600 underline"
                    >
                      Edit Deskripsi
                    </button>
                  </div>
                )}

                {/* Kelola member */}
                <ul className="mb-4">
                  {selectedGroup.members?.map((member) => (
                    <li
                      key={member.uid}
                      className="flex justify-between items-center border-b py-1"
                    >
                      <span>
                        {member.uid} ({member.role})
                      </span>
                      {member.uid !== user?.uid && (
                        <button
                          onClick={() => removeMember(member.uid)}
                          className="text-red-600 text-sm"
                        >
                          Hapus
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
                <input
                  className="w-full border px-3 py-2 rounded mb-3"
                  value={newMemberUid}
                  onChange={(e) => setNewMemberUid(e.target.value)}
                  placeholder="UID untuk ditambahkan"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setSelectedGroup(null)}
                    className="text-gray-500"
                  >
                    Tutup
                  </button>
                  <button
                    onClick={addMember}
                    className="bg-green-600 text-white px-4 py-2 rounded"
                  >
                    Tambah
                  </button>
                </div>
              </Dialog.Panel>
            </div>
          </Dialog>
        )}
      </div>
    </div>
  );
}
