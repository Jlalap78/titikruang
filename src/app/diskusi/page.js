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
import { useRouter, usePathname } from "next/navigation";
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

export default function DiskusiPage(props) {
  const router = useRouter();
  const pathname = usePathname();
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

  useEffect(() => {
    // cek cookie sederhana; sesuaikan nama cookie/token sesuai implementasi Anda
    const hasToken = document.cookie
      .split(";")
      .some((c) => c.trim().startsWith("token=") || c.trim().startsWith("session="));

    if (!hasToken) {
      // arahkan ke halaman login dan sertakan target kembali
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [router, pathname]);

  if (user === undefined) {
    return null;
  }

  return (
    <div className="min-h-screen relative">
      {/* background image (pastikan file bglamandiskusi.jpg ada di public/) */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/bglamandiskusi.jpg')" }}
        aria-hidden="true"
      />
      {/* optional overlay untuk kontras teks */}
      <div className="absolute inset-0 bg-white/40 pointer-events-none" aria-hidden="true" />
      <div className="p-6 max-w-6xl mx-auto relative">
        {/* heading (lebih kecil + rounded + spacing) */}
        <header
          className="relative shadow z-50 py-3 rounded-lg overflow-hidden"
          style={{
            backgroundImage: "url('/bgheaderartikel2.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          {/* overlay tipis supaya teks tetap terbaca */}
          <div className="absolute inset-0 bg-white/30 pointer-events-none" aria-hidden="true" />
          <div className="max-w-7xl mx-auto px-4 md:px-6 relative">
            <div className="flex items-center justify-between gap-4 py-2">
              <div className="flex items-center gap-3">
                <a href="/" className="flex items-center gap-3">
                  <img
                    src="/logo3.png"
                    alt="TitikRuang"
                    className="w-10 h-10 object-contain rounded"
                  />
                  <span className="sr-only">TitikRuang</span>
                </a>
                <div>
                  <h1 className="text-lg md:text-xl font-semibold text-sky-700">
                    Diskusi Komunitas
                  </h1>
                  <p className="text-xs md:text-sm text-gray-600">
                    Jelajahi topik relevan untuk sehari-hari — gabung obrolan dan temukan perspektif.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href="/"
                  className="inline-block bg-white text-sky-700 border border-sky-200 px-3 py-1 rounded-md shadow-sm hover:shadow-md text-sm"
                >
                  Beranda
                </a>
              </div>
            </div>
          </div>
        </header>
        {/* spacer agar konten tidak menempel ke header */}
        <div className="h-4 md:h-6" />

        {/* grid of groups */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group, i) => {
            const Icon =
              defaultIcons[
                Math.abs(
                  group.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0)
                ) % defaultIcons.length
              ];
            const color = pickColorById(group.id);
            return (
              <div
                key={group.id}
                className="community-card enter-up rounded shadow p-4 transition"
                style={{
                  background: color,
                  color: "#0f172a",
                  animationDelay: `${i * 80}ms`,
                  borderRadius: 8,
                }}
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
