"use client";

import { useEffect, useState } from "react";
import { getAuth, signInAnonymously, onAuthStateChanged, getIdTokenResult } from "firebase/auth";
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
import { db, app } from "../../lib/firebase";
import { Dialog } from "@headlessui/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FaUserTie,
  FaGraduationCap,
  FaBriefcase,
  FaEnvelope,
  FaPhoneAlt,
  FaWhatsapp,
  FaInstagram,
  FaFacebook,
  FaTwitter,
  FaYoutube,
  FaLinkedin,
  FaTiktok,
} from "react-icons/fa";
import Image from "next/image";

// import beberapa ikon
import {
  ChatBubbleLeftIcon,
  UsersIcon,
  SparklesIcon,
  HeartIcon,
} from "@heroicons/react/24/solid";

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
  const [loading, setLoading] = useState(true);

  // daftar ikon default
  const defaultIcons = [ChatBubbleLeftIcon, UsersIcon, SparklesIcon, HeartIcon];

  const COMMUNITY_PALETTE = [
    "linear-gradient(135deg,#FEF3C7 0%,#FFF7ED 100%)",
    "linear-gradient(135deg,#E0F2FE 0%,#BAE6FD 100%)",
    "linear-gradient(135deg,#EEF2FF 0%,#E9D5FF 100%)",
    "linear-gradient(135deg,#ECFDF5 0%,#D1FAE5 100%)",
    "linear-gradient(135deg,#FFF1F2 0%,#FFE4E6 100%)",
    "linear-gradient(135deg,#FFF7ED 0%,#FFF1D6 100%)",
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

  // Auth listener
  useEffect(() => {
    const authObj = getAuth(app);
    const unsub = onAuthStateChanged(authObj, async (u) => {
      // simpan user ke state agar komponen tidak selalu undefined
      setUser(u);

      // jika tidak ada user -> redirect ke login
      if (!u) {
        router.replace("/login");
        return;
      }

      try {
        const idToken = await getIdTokenResult(u, true);
        const isGuest = !!u.isAnonymous || !!idToken?.claims?.guest;
        if (isGuest) {
          router.replace("/login");
        }
      } catch (err) {
        console.error("cek auth diskusi:", err);
        router.replace("/login");
      }
    });
    return () => unsub();
  }, [router]);

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
    setLoading(true);
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
      setLoading(false);
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
    if (!user) return;
    // optimistic update — ubah state lokal langsung supaya UI responsif
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, isMember: true } : g))
    );

    try {
      await setDoc(doc(db, "groups", groupId, "members", user.uid), {
        role: "member",
      });
      // success: onSnapshot akan mengonfirmasi / melengkapi data
    } catch (err) {
      console.error("handleJoin error:", err);
      // rollback jika gagal
      setGroups((prev) =>
        prev.map((g) => (g.id === groupId ? { ...g, isMember: false } : g))
      );
    }
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
    <div className="min-h-screen relative">
      {/* Modern lightweight gradient background, no image */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#3061F2] via-[#EEF2FF] to-[#F2BF27]/30" aria-hidden="true" />
      {/* glassmorphism overlay for modern look */}
      <div className="absolute inset-0 bg-white/30 backdrop-blur-xl pointer-events-none" aria-hidden="true" />
      <div className="p-6 max-w-6xl mx-auto relative">
        {/* heading (modern glassmorphism) */}
        <header
          className="relative shadow-lg z-50 py-3 rounded-2xl overflow-hidden border border-[#3061F2]/20 bg-white/60 backdrop-blur-xl"
          style={{
            // Remove backgroundImage, use only glassmorphism and gradients
            background: 'rgba(255,255,255,0.6)',
          }}
        >
          <div className="absolute inset-0 bg-white/20 backdrop-blur-sm pointer-events-none" aria-hidden="true" />
          <div className="max-w-7xl mx-auto px-4 md:px-6 relative">
            <div className="flex items-center justify-between gap-4 py-2">
              <div className="flex items-center gap-3">
                <a href="/" className="flex items-center gap-3">
                  <img
                    src="/logo3.png"
                    alt="TitikRuang"
                    className="w-10 h-10 object-contain rounded-xl shadow-lg border border-[#3061F2]/30"
                  />
                  <span className="sr-only">TitikRuang</span>
                </a>
                <div>
                  <h1 className="text-lg md:text-xl font-semibold text-[#3061F2] drop-shadow">Diskusi Komunitas</h1>
                  <p className="text-xs md:text-sm text-gray-600">Jelajahi topik relevan untuk sehari-hari — gabung obrolan dan temukan perspektif.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href="/"
                  className="inline-block bg-gradient-to-r from-[#3061F2] to-[#F2BF27] text-white border border-[#3061F2]/30 px-4 py-2 rounded-xl shadow hover:scale-105 hover:shadow-xl transition-all text-sm font-semibold"
                >
                  Beranda
                </a>
              </div>
            </div>
          </div>
        </header>
        <div className="h-4 md:h-6" />
        {/* Loading animation while groups are loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 border-4 border-[#3061F2] border-t-[#F2BF27] rounded-full animate-spin mb-4" />
            <div className="text-lg font-semibold text-[#3061F2]">Memuat komunitas...</div>
          </div>
        )}
        {/* grid of groups (modern card style) */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {groups.map((group, i) => {
              const Icon = defaultIcons[Math.abs(group.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % defaultIcons.length];
              // Assign a different color for each box from the palette
              const palette = [
                'bg-gradient-to-br from-[#F2BF27]/60 to-[#3061F2]/10',
                'bg-gradient-to-br from-[#27A4F2]/30 to-[#F25050]/10',
                'bg-gradient-to-br from-[#F2780C]/30 to-[#EEF2FF]/10',
                'bg-gradient-to-br from-[#3061F2]/20 to-[#F2BF27]/10',
                'bg-gradient-to-br from-[#F25050]/20 to-[#F28907]/10',
                'bg-gradient-to-br from-[#6D9BFF]/20 to-[#F2BF27]/10',
                'bg-gradient-to-br from-[#F2BF27]/30 to-[#3061F2]/10',
              ];
              const colorClass = palette[i % palette.length];
              return (
                <div
                  key={group.id}
                  className={`community-card enter-up rounded-2xl shadow-xl p-5 transition-all border border-[#3061F2]/10 bg-white/70 backdrop-blur-lg hover:scale-[1.03] hover:shadow-2xl hover:border-[#3061F2]/30 ${colorClass}`}
                  style={{
                    color: "#0f172a",
                    animationDelay: `${i * 80}ms`,
                    borderRadius: 16,
                  }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-[#3061F2]/20 to-[#F2BF27]/20 shadow ring-2 ring-[#3061F2]/10">
                      {group.imageUrl ? (
                        <img
                          src={group.imageUrl}
                          alt="Group"
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <Icon className="w-7 h-7 text-[#3061F2]" />
                      )}
                    </div>
                    <h2 className="text-lg font-bold text-[#3061F2] drop-shadow">{group.name}</h2>
                  </div>
                  <p className="text-gray-600 text-sm mb-2 font-medium">{group.description || "Belum ada deskripsi."}</p>
                  <p className="text-gray-500 text-xs mb-4">Status: {group.isMember ? "✅ Anggota" : "❌ Bukan anggota"}</p>
                  <div className="flex justify-between items-center mt-2">
                    {group.isMember ? (
                      <a
                        href={`/diskusi/${group.id}`}
                        className="bg-gradient-to-r from-[#3061F2] to-[#F2BF27] text-white px-4 py-2 rounded-xl shadow hover:scale-105 hover:shadow-xl transition-all text-sm font-semibold"
                      >
                        Masuk
                      </a>
                    ) : (
                      <button
                        onClick={() => handleJoin(group.id)}
                        className="bg-gradient-to-r from-[#F2BF27] to-[#3061F2] text-white px-4 py-2 rounded-xl shadow hover:scale-105 hover:shadow-xl transition-all text-sm font-semibold"
                      >
                        Gabung
                      </button>
                    )}
                    {isAdmin(group) && (
                      <button
                        onClick={() => openMemberManager(group)}
                        className="text-[#3061F2] text-sm underline font-semibold hover:text-[#F2BF27] transition-all"
                      >
                        Kelola
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {/* modal buat grup (modern style) */}
        <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-10">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-sm bg-white/80 backdrop-blur-xl p-7 rounded-2xl shadow-2xl border border-[#3061F2]/20">
              <Dialog.Title className="text-xl font-bold mb-3 text-[#3061F2]">Buat Grup Baru</Dialog.Title>
              <input
                className="w-full border border-[#3061F2]/20 px-4 py-2 rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-[#3061F2] bg-white/90"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Nama Grup"
              />
              <textarea
                className="w-full border border-[#3061F2]/20 px-4 py-2 rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-[#3061F2] bg-white/90"
                value={newGroupDesc}
                onChange={(e) => setNewGroupDesc(e.target.value)}
                placeholder="Deskripsi Grup"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 px-4 py-2 rounded-xl hover:bg-gray-100 transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={handleCreateGroup}
                  className="bg-gradient-to-r from-[#3061F2] to-[#F2BF27] text-white px-5 py-2 rounded-xl shadow hover:scale-105 hover:shadow-xl transition-all font-semibold"
                >
                  Buat
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
        {/* modal kelola member + edit deskripsi (modern style) */}
        {selectedGroup && (
          <Dialog open={true} onClose={() => setSelectedGroup(null)} className="relative z-20">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <Dialog.Panel className="w-full max-w-md bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-[#3061F2]/20">
                <Dialog.Title className="text-xl font-bold mb-4 text-[#3061F2]">Kelola Grup: {selectedGroup.name}</Dialog.Title>
                {/* Edit deskripsi */}
                {isEditDesc ? (
                  <div className="mb-4">
                    <textarea
                      className="w-full border border-[#3061F2]/20 px-4 py-2 rounded-xl mb-2 focus:outline-none focus:ring-2 focus:ring-[#3061F2] bg-white/90"
                      value={editedDesc}
                      onChange={(e) => setEditedDesc(e.target.value)}
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setIsEditDesc(false)}
                        className="text-gray-500 px-4 py-2 rounded-xl hover:bg-gray-100 transition-all"
                      >
                        Batal
                      </button>
                      <button
                        onClick={updateDescription}
                        className="bg-gradient-to-r from-[#3061F2] to-[#F2BF27] text-white px-5 py-2 rounded-xl shadow hover:scale-105 hover:shadow-xl transition-all font-semibold"
                      >
                        Simpan
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4">
                    <p className="text-gray-600 mb-2">{selectedGroup.description || "Belum ada deskripsi."}</p>
                    <button
                      onClick={() => setIsEditDesc(true)}
                      className="text-sm text-[#3061F2] underline font-semibold hover:text-[#F2BF27] transition-all"
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
                      className="flex justify-between items-center border-b py-2 border-gray-200/40"
                    >
                      <span className="font-medium text-gray-700">{member.uid} <span className="text-xs text-gray-400">({member.role})</span></span>
                      {member.uid !== user?.uid && (
                        <button
                          onClick={() => removeMember(member.uid)}
                          className="text-red-600 text-sm px-3 py-1 rounded-xl hover:bg-red-50 transition-all"
                        >
                          Hapus
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
                <input
                  className="w-full border border-[#3061F2]/20 px-4 py-2 rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-[#3061F2] bg-white/90"
                  value={newMemberUid}
                  onChange={(e) => setNewMemberUid(e.target.value)}
                  placeholder="UID untuk ditambahkan"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setSelectedGroup(null)}
                    className="text-gray-500 px-4 py-2 rounded-xl hover:bg-gray-100 transition-all"
                  >
                    Tutup
                  </button>
                  <button
                    onClick={addMember}
                    className="bg-gradient-to-r from-[#F2BF27] to-[#3061F2] text-white px-5 py-2 rounded-xl shadow hover:scale-105 hover:shadow-xl transition-all font-semibold"
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
