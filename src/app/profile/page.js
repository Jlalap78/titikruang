"use client";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { getAuth, signOut } from "firebase/auth";
import { db } from "../../lib/firebase";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [editField, setEditField] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [editCountry, setEditCountry] = useState("ID");
  const router = useRouter();

  useEffect(() => {
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

    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      setUser(u);
      if (u) {
        const ref = doc(db, "userProfiles", u.uid);
        let snap = await getDoc(ref);
        let data = snap.exists() ? snap.data() : null;
        // If profile missing or missing funnyName/avatar, force update with random
        if (!data || !data.funnyName || !data.avatar) {
          const { name, emoji } = makeRandomNameAndEmoji();
          const defaultProfile = {
            name: u.displayName || "Anon",
            avatar: emoji,
            funnyName: name,
            bio: data?.bio || "Tulis bio tentangmu",
          };
          await setDoc(ref, defaultProfile, { merge: true });
          data = { ...data, ...defaultProfile };
        }
        setProfile(data);
      } else {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  if (!user || !profile) {
    return <div className="p-8 text-center">Memuat profil...</div>;
  }

  const handleSignOut = async () => {
    await signOut(getAuth());
    router.push("/login");
  };

  return (
    <div className="min-h-[80vh] max-w-md mx-auto mt-12 bg-gradient-to-br from-[#f7fafc] via-[#e3e8ff] to-[#ffe7c7] rounded-3xl shadow-2xl p-8 flex flex-col relative border border-[#e3e8ff]">
      {/* Tombol Kembali Modern 2025 */}
      <button
        onClick={() => router.push("/")}
        className="absolute top-4 left-4 z-10 flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#3061F2] to-[#F2BF27] text-white shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-200 border border-[#e3e8ff]"
        aria-label="Kembali ke Beranda"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        <span className="font-semibold text-sm">Beranda</span>
      </button>
      {/* Avatar only, no change button */}
      <div className="flex flex-col items-center gap-4 mt-2">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#3061F2] via-[#F2BF27] to-[#ffe7c7] flex items-center justify-center text-5xl shadow-lg border-4 border-[#e3e8ff]">
          {profile.avatar || "🙂"}
        </div>
      </div>

      {/* Info Profil */}
      <div className="mt-8">
        <h2 className="text-[#3061F2] font-bold mb-2 text-lg tracking-wide">Info Profil</h2>
        <div className="space-y-3 text-base">
          <div className="flex justify-between items-center bg-white/80 rounded-xl px-4 py-2 shadow-sm">
            <span className="text-gray-500">Nama</span>
            <span className="font-semibold text-[#2d3748]">{user.displayName || profile.name || "-"}</span>
          </div>
          <div className="flex justify-between items-center bg-white/80 rounded-xl px-4 py-2 shadow-sm">
            <span className="text-gray-500">Username</span>
            <span className="font-semibold text-[#2d3748]">{profile.avatar} {profile.funnyName || "-"}</span>
          </div>
          <div className="flex justify-between items-center bg-white/80 rounded-xl px-4 py-2 shadow-sm">
            <span className="text-gray-500">Bio</span>
            <div className="flex items-center gap-2 min-w-[180px] justify-end">
              <span className="truncate max-w-[120px] text-right text-[#2d3748]">{profile.bio || "Tulis bio tentangmu"}</span>
              <button
                className="p-1 rounded-full bg-[#e3e8ff] hover:bg-[#3061F2] transition duration-200 shadow-sm flex items-center justify-center group border border-[#e3e8ff]"
                style={{ minWidth: 18, minHeight: 18 }}
                onClick={() => { setEditField('bio'); setEditValue(profile.bio || ""); }}
                aria-label="Edit bio"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-[#3061F2] group-hover:text-white group-hover:scale-110 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.536-6.536a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L9 13zm0 0V17h4" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Info Pribadi */}
      <div className="mt-8 flex-1">
        <h2 className="text-[#3061F2] font-bold mb-2 text-lg tracking-wide">Info Pribadi</h2>
        <div className="space-y-3 text-base">
          <div className="flex items-center justify-between bg-white/80 rounded-xl px-4 py-2 shadow-sm">
            <span className="text-gray-500">User ID</span>
            <span className="truncate max-w-[180px] text-right text-[#2d3748]">{user.uid}</span>
          </div>
          <div className="flex items-center justify-between bg-white/80 rounded-xl px-4 py-2 shadow-sm">
            <span className="text-gray-500">E-mail</span>
            <span className="truncate max-w-[180px] text-right text-[#2d3748]">{user.email}</span>
          </div>
          <div className="flex justify-between items-center bg-white/80 rounded-xl px-4 py-2 shadow-sm">
            <span className="text-gray-500">Nomor HP</span>
            <div className="flex items-center gap-2 min-w-[180px] justify-end">
              <span className="truncate max-w-[120px] text-right text-[#2d3748]">{profile.phone || "-"}</span>
              <button
                className="p-1 rounded-full bg-[#e3ffe3] hover:bg-[#38a169] transition duration-200 shadow-sm flex items-center justify-center group border border-[#e3ffe3]"
                style={{ minWidth: 18, minHeight: 18 }}
                onClick={() => { setEditField('phone'); setEditValue(profile.phone || ""); }}
                aria-label="Edit phone"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-[#38a169] group-hover:text-white group-hover:scale-110 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a2 2 0 011.7 1.06l1.52 2.72a2 2 0 01-.45 2.45l-2.1 1.68a11.05 11.05 0 005.12 5.12l1.68-2.1a2 2 0 012.45-.45l2.72 1.52A2 2 0 0121 17.72V21a2 2 0 01-2 2h-1C7.82 23 1 16.18 1 8V7a2 2 0 012-2z" /></svg>
              </button>
            </div>
          </div>
          <div className="flex justify-between items-center bg-white/80 rounded-xl px-4 py-2 shadow-sm">
            <span className="text-gray-500">Jenis Kelamin</span>
            <div className="flex items-center gap-2 min-w-[180px] justify-end">
              <span className="truncate max-w-[120px] text-right text-[#2d3748]">{profile.gender || "-"}</span>
              <button
                className="p-1 rounded-full bg-[#ffe3f7] hover:bg-[#d53f8c] transition duration-200 shadow-sm flex items-center justify-center group border border-[#ffe3f7]"
                style={{ minWidth: 18, minHeight: 18 }}
                onClick={() => { setEditField('gender'); setEditValue(profile.gender || ""); }}
                aria-label="Edit gender"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-[#d53f8c] group-hover:text-white group-hover:scale-110 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              </button>
            </div>
          </div>
          <div className="flex justify-between items-center bg-white/80 rounded-xl px-4 py-2 shadow-sm">
            <span className="text-gray-500">Tanggal Lahir</span>
            <div className="flex items-center gap-2 min-w-[180px] justify-end">
              <span className="truncate max-w-[120px] text-right text-[#2d3748]">{profile.birthdate || "-"}</span>
              <button
                className="p-1 rounded-full bg-[#fffbe3] hover:bg-[#F2BF27] transition duration-200 shadow-sm flex items-center justify-center group border border-[#fffbe3]"
                style={{ minWidth: 18, minHeight: 18 }}
                onClick={() => { setEditField('birthdate'); setEditValue(profile.birthdate || ""); }}
                aria-label="Edit birthdate"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-[#F2BF27] group-hover:text-white group-hover:scale-110 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </button>
            </div>
  {/* Edit Modal */}
  {editField && (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-6 min-w-[320px] relative border border-[#e3e8ff]">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-red-400" onClick={() => setEditField(null)}>✕</button>
        {editField === 'bio' && (
          <>
            <h3 className="font-semibold mb-2 text-[#3061F2]">Edit Bio (max 20 kata)</h3>
            <textarea value={editValue} onChange={e => setEditValue(e.target.value)} rows={3} className="w-full border rounded p-2 mb-2" maxLength={200} />
            <div className="text-xs text-gray-500 mb-2">{editValue.trim().split(/\s+/).filter(Boolean).length} / 20 kata</div>
            <button className="bg-[#3061F2] text-white px-4 py-2 rounded shadow" disabled={editValue.trim().split(/\s+/).filter(Boolean).length > 20} onClick={async () => {
              if (editValue.trim().split(/\s+/).filter(Boolean).length > 20) return;
              await setDoc(doc(db, "userProfiles", user.uid), { bio: editValue }, { merge: true });
              setProfile(p => ({ ...p, bio: editValue }));
              setEditField(null);
            }}>Simpan</button>
          </>
        )}
        {editField === 'phone' && (
          <>
            <h3 className="font-semibold mb-2">Edit Nomor HP</h3>
            <select value={editCountry} onChange={e => setEditCountry(e.target.value)} className="mb-2 border rounded p-2 w-full">
              <option value="ID">🇮🇩 Indonesia (+62)</option>
              <option value="MY">🇲🇾 Malaysia (+60)</option>
              <option value="SG">🇸🇬 Singapore (+65)</option>
              <option value="US">🇺🇸 USA (+1)</option>
              <option value="IN">🇮🇳 India (+91)</option>
              {/* Add more countries as needed */}
            </select>
            <input type="tel" value={editValue} onChange={e => setEditValue(e.target.value)} className="w-full border rounded p-2 mb-2" placeholder="Nomor HP" />
            <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={async () => {
              await setDoc(doc(db, "userProfiles", user.uid), { phone: editValue, country: editCountry }, { merge: true });
              setProfile(p => ({ ...p, phone: editValue, country: editCountry }));
              setEditField(null);
            }}>Simpan</button>
          </>
        )}
        {editField === 'gender' && (
          <>
            <h3 className="font-semibold mb-2">Edit Jenis Kelamin</h3>
            <div className="flex gap-4 mb-2">
              <button className={`flex-1 border rounded p-2 flex flex-col items-center ${editValue === 'Laki-laki' ? 'border-blue-600' : ''}`} onClick={() => setEditValue('Laki-laki')}>
                <span className="text-3xl">👨</span>
                <span className="mt-1">Laki-laki</span>
              </button>
              <button className={`flex-1 border rounded p-2 flex flex-col items-center ${editValue === 'Perempuan' ? 'border-pink-600' : ''}`} onClick={() => setEditValue('Perempuan')}>
                <span className="text-3xl">👩</span>
                <span className="mt-1">Perempuan</span>
              </button>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded w-full" disabled={!editValue} onClick={async () => {
              await setDoc(doc(db, "userProfiles", user.uid), { gender: editValue }, { merge: true });
              setProfile(p => ({ ...p, gender: editValue }));
              setEditField(null);
            }}>Simpan</button>
          </>
        )}
        {editField === 'birthdate' && (
          <>
            <h3 className="font-semibold mb-2">Edit Tanggal Lahir</h3>
            <input type="date" value={editValue} onChange={e => setEditValue(e.target.value)} className="w-full border rounded p-2 mb-2" />
            <button className="bg-blue-600 text-white px-4 py-2 rounded w-full" disabled={!editValue} onClick={async () => {
              await setDoc(doc(db, "userProfiles", user.uid), { birthdate: editValue }, { merge: true });
              setProfile(p => ({ ...p, birthdate: editValue }));
              setEditField(null);
            }}>Simpan</button>
          </>
        )}
      </div>
    </div>
  )}
          </div>
        </div>
      </div>

      {/* Tutup Akun */}
      <div className="pt-6">
        <button
          onClick={handleSignOut}
          className="mx-auto block text-red-600 font-semibold"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}
