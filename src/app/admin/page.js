"use client";

import { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { collection, getDocs, onSnapshot } from "firebase/firestore";
import { BarChart2, Users, CheckCircle, Activity, User, Mail, Phone, MessageCircle } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { startOfMonth, endOfMonth, startOfDay, endOfDay, startOfHour, endOfHour, format, addMonths, addDays, addHours } from "date-fns";

// Inisialisasi hanya sekali

export default function AdminPage() {
  // State for live data
  const [userStats, setUserStats] = useState({ total: 0, growth: [] });
  const [keywords, setKeywords] = useState([]);
  const [satisfaction, setSatisfaction] = useState({ avg: 0, count: 0 });
  const [impact, setImpact] = useState({ positive: 0, neutral: 0, negative: 0 });
  const [userActivity, setUserActivity] = useState([]);
  const [userGrowth, setUserGrowth] = useState([]);
  const [growthView, setGrowthView] = useState('month'); // 'month', 'year', 'day', 'hour'
  const [activeTab, setActiveTab] = useState("dashboard");
  const [userList, setUserList] = useState([]);
  const [adminList, setAdminList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Info for Information section
  const info = { email: "jeryl@gmail.com", phone: "0023-333-526136" };

  useEffect(() => {
    async function fetchData() {
      // Total users from userProfiles collection
      let userCount = 0;
      try {
        const userSnap = await getDocs(collection(db, "userProfiles"));
        userCount = userSnap.size;
      } catch (e) {
        // fallback: show 0 if error
        userCount = 0;
        console.error("Error getting userProfiles:", e);
      }
      setUserStats(prev => ({ ...prev, total: userCount }));

      // Keyword analysis: judol & pinjol
      try {
        let allTexts = [];
        const ruangSnap = await getDocs(collection(db, "ruang"));
        const diskusiSnap = await getDocs(collection(db, "diskusi"));
        ruangSnap.forEach(doc => allTexts.push(doc.data().text || ""));
        diskusiSnap.forEach(doc => allTexts.push(doc.data().text || ""));
        // Simple keyword count
        const wordCounts = { judol: 0, pinjol: 0 };
        allTexts.forEach(text => {
          wordCounts.judol += (text.match(/judol/gi) || []).length;
          wordCounts.pinjol += (text.match(/pinjol/gi) || []).length;
        });
        setKeywords([
          { word: "judol", count: wordCounts.judol },
          { word: "pinjol", count: wordCounts.pinjol },
        ]);
      } catch (e) {
        console.error("Error fetching ruang/diskusi for keywords:", e);
        setKeywords([{ word: "judol", count: 0 }, { word: "pinjol", count: 0 }]);
      }

      // User satisfaction: from kuisbintang (assume rating field)
      try {
        const kuisSnap = await getDocs(collection(db, "kuisbintang"));
        let totalRating = 0, ratingCount = 0;
        kuisSnap.forEach(doc => {
          if (doc.data().rating) {
            totalRating += doc.data().rating;
            ratingCount++;
          }
        });
        setSatisfaction({ avg: ratingCount ? (totalRating / ratingCount).toFixed(2) : 0, count: ratingCount });
      } catch (e) {
        console.error("Error fetching kuisbintang:", e);
        setSatisfaction({ avg: 0, count: 0 });
      }

      // Impact: from simulasi pinjaman (assume impact field: positive/neutral/negative)
      try {
        const simSnap = await getDocs(collection(db, "simulasipinjaman"));
        let pos = 0, neu = 0, neg = 0;
        simSnap.forEach(doc => {
          const imp = doc.data().impact;
          if (imp === "positive") pos++;
          else if (imp === "neutral") neu++;
          else if (imp === "negative") neg++;
        });
        setImpact({ positive: pos, neutral: neu, negative: neg });
      } catch (e) {
        console.error("Error fetching simulasipinjaman:", e);
        setImpact({ positive: 0, neutral: 0, negative: 0 });
      }

      // User activity: recent messages from ruang/diskusi
      try {
        let activity = [];
        const ruangSnap2 = await getDocs(collection(db, "ruang"));
        const diskusiSnap2 = await getDocs(collection(db, "diskusi"));
        ruangSnap2.forEach(doc => activity.push({ name: doc.data().senderName || doc.data().uid, text: doc.data().text, time: doc.data().timestamp }));
        diskusiSnap2.forEach(doc => activity.push({ name: doc.data().senderName || doc.data().uid, text: doc.data().text, time: doc.data().timestamp }));
        activity = activity.slice(-5).reverse();
        setUserActivity(activity);
      } catch (e) {
        console.error("Error assembling userActivity:", e);
        setUserActivity([]);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    let unsub;
    function processUserProfiles(snapshot) {
      const dates = [];
      snapshot.forEach(doc => {
        const createdAt = doc.data().createdAt;
        let date = createdAt && createdAt.seconds ? new Date(createdAt.seconds * 1000) : null;
        if (date) dates.push(date);
      });
      if (dates.length === 0) {
        setUserGrowth([]);
        return;
      }
      // Find min/max date
      const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
      const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
      let growthArr = [];
      let cumulative = 0;
      if (growthView === 'year') {
        for (let y = minDate.getFullYear(); y <= maxDate.getFullYear(); y++) {
          const count = dates.filter(d => d.getFullYear() === y).length;
          cumulative += count;
          growthArr.push({ period: `${y}`, count: cumulative });
        }
      } else if (growthView === 'month') {
        let cur = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
        const end = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
        while (cur <= end) {
          const key = `${cur.getFullYear()}-${String(cur.getMonth()+1).padStart(2,'0')}`;
          const count = dates.filter(d => d.getFullYear() === cur.getFullYear() && d.getMonth() === cur.getMonth()).length;
          cumulative += count;
          growthArr.push({ period: key, count: cumulative });
          cur.setMonth(cur.getMonth() + 1);
        }
      } else if (growthView === 'day') {
        let cur = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
        const end = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate());
        while (cur <= end) {
          const key = `${cur.getFullYear()}-${String(cur.getMonth()+1).padStart(2,'0')}-${String(cur.getDate()).padStart(2,'0')}`;
          const count = dates.filter(d => d.getFullYear() === cur.getFullYear() && d.getMonth() === cur.getMonth() && d.getDate() === cur.getDate()).length;
          cumulative += count;
          growthArr.push({ period: key, count: cumulative });
          cur.setDate(cur.getDate() + 1);
        }
      } else if (growthView === 'hour') {
        let cur = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate(), minDate.getHours());
        const end = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate(), maxDate.getHours());
        while (cur <= end) {
          const key = `${cur.getFullYear()}-${String(cur.getMonth()+1).padStart(2,'0')}-${String(cur.getDate()).padStart(2,'0')} ${String(cur.getHours()).padStart(2,'0')}:00`;
          const count = dates.filter(d => d.getFullYear() === cur.getFullYear() && d.getMonth() === cur.getMonth() && d.getDate() === cur.getDate() && d.getHours() === cur.getHours()).length;
          cumulative += count;
          growthArr.push({ period: key, count: cumulative });
          cur.setHours(cur.getHours() + 1);
        }
      }
      setUserGrowth(growthArr);
    }
    unsub = onSnapshot(collection(db, "userProfiles"), processUserProfiles);
    return () => unsub && unsub();
  }, [growthView]);

  // Real-time user list (only active when 'users' tab is selected)
  // Gabungkan data user dari Firestore userProfiles dan API /api/admins
  useEffect(() => {
    if (activeTab !== "users") return;
    let unsub;
    async function fetchAndMergeUsers() {
      // Ambil data dari Firestore userProfiles
      const firestoreUsers = [];
      unsub = onSnapshot(collection(db, "userProfiles"), async (snapshot) => {
        snapshot.forEach(doc => {
          firestoreUsers.push({ uid: doc.id, ...doc.data() });
        });
        // Ambil data dari API /api/admins
        try {
          const res = await fetch("/api/admins");
          const apiUsers = res.ok ? await res.json() : [];
          // Gabungkan berdasarkan UID/email
          const merged = apiUsers.map(apiUser => {
            // Cari user Firestore dengan UID yang sama
            const firestoreUser = firestoreUsers.find(u => u.uid === apiUser.uid || u.email === apiUser.email);
            return {
              ...apiUser,
              name: (apiUser.providerId === "password" || (Array.isArray(apiUser.provider) && apiUser.provider.includes("password")))
                ? (firestoreUser?.name || apiUser.name || apiUser.displayName || "-")
                : (apiUser.displayName || firestoreUser?.name || apiUser.name || "-"),
            };
          });
          setUserList(merged);
        } catch (err) {
          setUserList(firestoreUsers);
        }
      });
    }
    fetchAndMergeUsers();
    return () => unsub && unsub();
  }, [activeTab]);

  // Fallback fetch from your /api/users endpoint (if you have it)

  // Fetch data user hanya saat tab "users" dibuka
  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        const res = await fetch("/api/admins");
        if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
        const data = await res.json();
        setUserList(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (activeTab === "users") {
      fetchUsers();
    }
  }, [activeTab]);

  useEffect(() => {
    // Ambil data admin (jika endpoint mengembalikan data admin, misal email admin)
    fetch("/api/admins")
      .then(res => res.json())
      .then(data => setAdminList(data))
      .catch(err => console.error("Gagal ambil data admin:", err));
  }, []);

  // Gabungkan email user dan admin (jika adminList berisi array email)
  const allEmails = [
    ...userList.map(u => u.email).filter(Boolean),
    ...adminList.map(a => a.email).filter(Boolean)
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3061F2] via-[#EEF2FF] to-[#F2BF27]/30 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white/80 backdrop-blur-xl border-r border-gray-200 p-6 flex flex-col gap-6 shadow-xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-[#3061F2] rounded-full p-2">
            <BarChart2 className="w-7 h-7 text-white" />
          </div>
          <span className="font-bold text-xl text-[#3061F2]">adminity</span>
        </div>
        <nav className="flex flex-col gap-2">
          <button
            className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#EEF2FF] font-semibold transition ${activeTab === "dashboard" ? "bg-[#EEF2FF] text-[#3061F2]" : "text-[#3061F2]"}`}
            onClick={() => setActiveTab("dashboard")}
          >
            <BarChart2 className="w-5 h-5" /> Dashboard
          </button>
          <button
            className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#EEF2FF] font-semibold transition ${activeTab === "users" ? "bg-[#EEF2FF] text-[#3061F2]" : "text-[#3061F2]"}`}
            onClick={() => setActiveTab("users")}
          >
            <Users className="w-5 h-5" /> Users
          </button>
          <a href="#" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#EEF2FF] text-[#3061F2] font-semibold transition"><Activity className="w-5 h-5" /> Analytics</a>
        </nav>
        <div className="mt-auto text-xs text-gray-400">© 2025 adminity</div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 bg-white/60 backdrop-blur-xl">
        {activeTab === "dashboard" && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="rounded-2xl shadow-lg p-6 flex flex-col gap-2 bg-gradient-to-r from-[#3061F2] to-[#F2BF27] text-white">
                <div className="flex items-center gap-2 mb-2"><Users className="w-6 h-6" /><span className="font-bold text-lg">{userStats.total}</span></div>
                <span className="text-sm font-medium opacity-80">Total Pengguna TitikRuang</span>
              </div>
              <div className="rounded-2xl shadow-lg p-6 flex flex-col gap-2 bg-gradient-to-r from-orange-400 to-orange-200 text-white">
                <div className="flex items-center gap-2 mb-2"><MessageCircle className="w-6 h-6" /><span className="font-bold text-lg">{keywords.map(k => `${k.word}: ${k.count}`).join(", ")}</span></div>
                <span className="text-sm font-medium opacity-80">Kata Permasalahan Judol & Pinjol</span>
              </div>
              <div className="rounded-2xl shadow-lg p-6 flex flex-col gap-2 bg-gradient-to-r from-pink-400 to-pink-200 text-white">
                <div className="flex items-center gap-2 mb-2"><CheckCircle className="w-6 h-6" /><span className="font-bold text-lg">{satisfaction.avg}</span></div>
                <span className="text-sm font-medium opacity-80">Kepuasan User (dari {satisfaction.count} rating)</span>
              </div>
              <div className="rounded-2xl shadow-lg p-6 flex flex-col gap-2 bg-gradient-to-r from-green-400 to-green-200 text-white">
                <div className="flex items-center gap-2 mb-2"><Activity className="w-6 h-6" /><span className="font-bold text-lg">{impact.positive} Positif, {impact.neutral} Netral, {impact.negative} Negatif</span></div>
                <span className="text-sm font-medium opacity-80">Dampak TitikRuang terhadap Pemulihan</span>
              </div>
            </div>

            {/* User Growth Chart: Total Registered Users */}
            <div className="bg-white/80 rounded-2xl shadow p-6 mb-8">
              <div className="font-bold text-[#3061F2] mb-2">Grafik Total Pengguna Terdaftar TitikRuang</div>
              {/* Chart filter controls */}
              <div className="flex gap-2 mb-4">
                <button className={`px-3 py-1 rounded-xl font-semibold ${growthView==='year'?'bg-[#3061F2] text-white':'bg-gray-100 text-[#3061F2]'}`} onClick={()=>setGrowthView('year')}>Per Tahun</button>
                <button className={`px-3 py-1 rounded-xl font-semibold ${growthView==='month'?'bg-[#3061F2] text-white':'bg-gray-100 text-[#3061F2]'}`} onClick={()=>setGrowthView('month')}>Per Bulan</button>
                <button className={`px-3 py-1 rounded-xl font-semibold ${growthView==='day'?'bg-[#3061F2] text-white':'bg-gray-100 text-[#3061F2]'}`} onClick={()=>setGrowthView('day')}>Per Hari</button>
                <button className={`px-3 py-1 rounded-xl font-semibold ${growthView==='hour'?'bg-[#3061F2] text-white':'bg-gray-100 text-[#3061F2]'}`} onClick={()=>setGrowthView('hour')}>Per Jam</button>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={userGrowth} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" stroke="#3061F2" />
                  <YAxis stroke="#3061F2" allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#F2BF27" strokeWidth={3} dot={{ r: 5, stroke: '#3061F2', strokeWidth: 2, fill: '#F2BF27' }} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>

              {/* Debug table for periods and counts */}
              <div className="mt-6">
                <div className="font-bold text-[#3061F2] mb-2">Debug: Periods & Counts</div>
                <table className="w-full text-xs border">
                  <thead>
                    <tr className="bg-gray-100 text-[#3061F2]">
                      <th className="py-1 px-2 border">Period</th>
                      <th className="py-1 px-2 border">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userGrowth.map((row, i) => (
                      <tr key={i} className="border-b">
                        <td className="py-1 px-2 border">{row.period}</td>
                        <td className="py-1 px-2 border">{row.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent user activity list */}
            <div className="bg-white/80 rounded-2xl shadow p-6 mb-8">
              <div className="font-bold text-[#3061F2] mb-2">User Activity Terbaru</div>
              <ul className="space-y-3 mt-2">
                {userActivity.map((act, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <User className="w-7 h-7 text-[#3061F2] bg-[#EEF2FF] rounded-full p-1" />
                    <div>
                      <div className="font-semibold text-gray-700">{act.name}</div>
                      <div className="text-xs text-gray-500">{act.text}</div>
                      <div className="text-xs text-gray-400">{act.time ? (act.time.seconds ? new Date(act.time.seconds * 1000).toLocaleString() : String(act.time)) : ""}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Application Sales Table */}
            <div className="bg-white/80 rounded-2xl shadow p-6 mb-8">
              <div className="font-bold text-[#3061F2] mb-2">Application Sales</div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 border-b">
                    <th className="py-2 text-left">Application</th>
                    <th className="py-2 text-left">Sales</th>
                    <th className="py-2 text-left">Change</th>
                    <th className="py-2 text-left">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2">Able Pro</td><td>16,300</td><td>$53</td><td className="text-green-600">$15,652</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Photoshop</td><td>26,421</td><td>$35</td><td className="text-green-600">$18,785</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Gurubale</td><td>8,265</td><td>$98</td><td className="text-blue-600">$9,652</td>
                  </tr>
                  <tr>
                    <td className="py-2">Flatable</td><td>10,652</td><td>$20</td><td className="text-blue-600">$7,856</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Project Risk & User Activity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-white/80 rounded-2xl shadow p-6 flex flex-col items-center">
                <div className="font-bold text-[#3061F2] mb-2">Project Risk</div>
                <div className="flex flex-col items-center gap-2 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-200 flex items-center justify-center text-2xl font-bold text-white shadow">5</div>
                  <span className="text-sm text-gray-500">Balanced</span>
                  <button className="mt-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#3061F2] to-[#F2BF27] text-white font-bold shadow hover:scale-105 transition">Download Overall Report</button>
                </div>
                <div className="text-xs text-gray-400">Nr AWS 2455 | Created 30th Sep</div>
              </div>
              <div className="bg-white/80 rounded-2xl shadow p-6">
                <div className="font-bold text-[#3061F2] mb-2">User Activity</div>
                <ul className="space-y-3">
                  {userActivity.map((act, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <User className="w-7 h-7 text-[#3061F2] bg-[#EEF2FF] rounded-full p-1" />
                      <div>
                        <div className="font-semibold text-gray-700">{act.name}</div>
                        <div className="text-xs text-gray-500">{act.text}</div>
                        <div className="text-xs text-gray-400">{act.time ? (act.time.seconds ? new Date(act.time.seconds * 1000).toLocaleString() : String(act.time)) : ""}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Latest Updates & Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white/80 rounded-2xl shadow p-6">
                <div className="font-bold text-[#3061F2] mb-2">Latest Updates</div>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm"><span className="bg-red-100 text-red-600 rounded-full px-2 py-1">ID</span> + 5 New Products were added! <span className="text-green-600">Congratulations!</span></li>
                  <li className="flex items-center gap-2 text-sm"><span className="bg-yellow-100 text-yellow-600 rounded-full px-2 py-1">DB</span> Database backup completed!</li>
                </ul>
              </div>
              <div className="bg-white/80 rounded-2xl shadow p-6 flex items-center gap-6">
                <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Profile" className="w-16 h-16 rounded-full object-cover border-2 border-[#3061F2]" />
                <div>
                  <div className="font-bold text-[#3061F2]">Information</div>
                  <div className="text-sm text-gray-700 flex items-center gap-2"><Mail className="w-4 h-4" /> {info.email}</div>
                  <div className="text-sm text-gray-700 flex items-center gap-2"><Phone className="w-4 h-4" /> {info.phone}</div>
                </div>
              </div>
            </div>
          </>
        )}

          {activeTab === "users" && (
            <div className="bg-white/80 rounded-2xl shadow p-6">
              <h2 className="font-bold text-[#3061F2] mb-4 text-xl">
                Daftar User Firebase
              </h2>

              {loading && <p>Loading…</p>}
              {error && <p className="text-red-600">Error: {error}</p>}

              {!loading && !error && (
                <div className="overflow-auto border rounded bg-white shadow">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-100 text-left text-gray-700">
                      <tr>
                        <th className="py-2 px-3 border">Email</th>
                        <th className="py-2 px-3 border">Nama</th>
                        <th className="py-2 px-3 border">Provider</th>
                        <th className="py-2 px-3 border">Tanggal Daftar</th>
                        <th className="py-2 px-3 border">UID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userList.length === 0 && (
                        <tr>
                          <td
                            colSpan={5}
                            className="p-4 text-center text-gray-500"
                          >
                            Belum ada user terdaftar.
                          </td>
                        </tr>
                      )}
                      {userList.map((user, i) => {
                        // Nama user provider 'password' diambil dari Firestore (userProfiles.name)
                        // Nama user provider 'password' diambil dari Firestore userProfiles.name
                        // Field 'name' ini diisi saat user melakukan registrasi melalui form di login/page.js:
                        // await setDoc(doc(db, "userProfiles", userCred.user.uid), { name: name, createdAt: new Date() }, { merge: true });
                        let name = "-";
                        if (
                          (user.providerId === "password" || (Array.isArray(user.provider) && user.provider.includes("password")))
                        ) {
                          name = user.name || "-";
                        } else if (user.displayName) {
                          name = user.displayName;
                        } else if (user.name) {
                          name = user.name;
                        }
                        return (
                          <tr key={user.uid || i} className="border-t">
                            <td className="py-2 px-3">{user.email ?? "-"}</td>
                            <td className="py-2 px-3">{name}</td>
                            <td className="py-2 px-3">
                              {Array.isArray(user.provider)
                                ? user.provider.join(", ")
                                : user.provider ?? user.providerId ?? "-"}
                            </td>
                            <td className="py-2 px-3">
                              {user.created
                                ? new Date(user.created).toLocaleString()
                                : "-"}
                            </td>
                            <td className="py-2 px-3 font-mono text-xs">
                              {user.uid}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
      </main>
    </div>
  );
}
