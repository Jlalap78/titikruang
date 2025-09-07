"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
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
import { usePathname } from "next/navigation";
import Link from "next/link";

/**
 * DATA QUIZ:
 * - tiap soal punya feedbackCorrect & feedbackWrong (unik per soal)
 * - kategori: orangtua, mahasiswa, pekerja
 */
const quizData = {
  orangtua: [
    {
      question:
        "Anakmu tiba-tiba menarik diri dari keluarga dan terlihat sering menyendiri sambil main HP. Kamu curiga dia terlibat pinjol atau judol. Apa yang sebaiknya kamu lakukan?",
      options: [
        "Abaikan dulu, nanti juga cerita sendiri",
        "Cek HP-nya diam-diam tanpa izin",
        "Ajak ngobrol baik-baik dan ciptakan ruang aman untuk bercerita",
        "Langsung marah agar jera",
      ],
      answer: "Ajak ngobrol baik-baik dan ciptakan ruang aman untuk bercerita",
      feedbackCorrect:
        "Karena dengan pendekatan yang tenang dan terbuka, anak akan lebih nyaman untuk jujur dan terbuka tentang masalahnya",
      feedbackWrong:
        "Jawaban yang benar ini ya - Karena dengan pendekatan yang tenang dan terbuka, anak akan lebih nyaman untuk jujur dan terbuka tentang masalahnya",
    },
    {
      question:
        "Kamu menemukan aplikasi pinjol di HP anakmu. Ia bilang hanya ‘iseng’ dan belum pernah pinjam. Apa langkah pertama yang perlu kamu lakukan?",
      options: [
        "Lapor polisi agar jera",
        "Hapus aplikasinya dan edukasi anak tentang risikonya",
        "Biarkan saja, anak-anak zaman sekarang biasa seperti itu",
        "Pinjamkan uang agar dia tidak tergoda pinjol",
      ],
      answer: "Hapus aplikasinya dan edukasi anak tentang risikonya",
      feedbackCorrect:
        " Menghapus aplikasi saja tidak cukup karena anak juga perlu paham apa saja bahaya yang bisa timbul agar tidak mengulanginya",
      feedbackWrong:
        "Jawaban yang benar ini ya - Menghapus aplikasi saja tidak cukup karena anak juga perlu paham apa saja bahaya yang bisa timbul agar tidak mengulanginya",
    },
    {
      question:
        "Kamu sendiri sedang punya kebutuhan mendesak, dan tergoda iklan pinjol berbungan rendah. Tapi kamu belum paham risikonya. Apa tindakan bijak selanjutnya?",
      options: [
        "Langsung ajukan saja, asal bisa bayar",
        "Tanya anak atau kerabat yang paham teknologi",
        "Cari informasi resmi di situs OJK",
        "Tunda kebutuhanmu sampai ada uang",
      ],
      answer: "Cari informasi resmi di situs OJK",
      feedbackCorrect:
        "Informasi dari sumber resmi seperti OJK penting agar keputusan yang diambil tidak gegabah dan terhindar dari risiko.",
      feedbackWrong:
        "Jawaban yang benar ini ya - Informasi dari sumber resmi seperti OJK penting agar keputusan yang diambil tidak gegabah dan terhindar dari risiko.",
    },
    {
      question:
        "Anakmu tiba-tiba minta uang dalam jumlah besar dan terlihat stres, tapi tidak mau cerita alasannya. Kemudian kamu lihat ada notifikasi pinjol masuk di HP-nya. Apa yang sebaiknya kamu lakukan pertama kali?",
      options: [
        "Memarahi anak agar jera",
        "Langsung melunasi pinjamannya tanpa tanya",
        "Mengajak anak bicara dari hati ke hati soal masalah keuangan dan risikonya",
        "Biarkan saja, biar dia belajar dari kesalahan",
      ],
      answer:
        "Mengajak anak bicara dari hati ke hati soal masalah keuangan dan risikonya",
      feedbackCorrect:
        "Dengan berdialog secara tenang, anak tidak merasa disalahkan dan lebih mudah diajak mencari solusi bersama",
      feedbackWrong:
        "Jawaban yang benar ini ya - Dengan berdialog secara tenang, anak tidak merasa disalahkan dan lebih mudah diajak mencari solusi bersama",
    },
    {
      question:
        "Kamu tidak paham soal dunia digital, tapi ingin memastikan anakmu aman dari pengaruh pinjol dan judol. Apa langkah awal yang bisa kamu ambil sebagai orang tua?",
      options: [
        "Minta orang terdekat mengajarkanmu tentang dunia digital",
        "Pasrahkan saja semua ke guru atau sekolah",
        "Cek aktivitas anak tanpa sepengetahuan mereka",
        "Blokir semua akses internet",
      ],
      answer: "Minta orang terdekat mengajarkanmu tentang dunia digital",
      feedbackCorrect:
        "Belajar dari orang terdekat membuat proses lebih mudah dan membantumu lebih paham bagaimana mendampingi anak di dunia digital",
      feedbackWrong:
        "Jawaban yang benar ini ya - Belajar dari orang terdekat membuat proses lebih mudah dan membantumu lebih paham bagaimana mendampingi anak di dunia digital",
    },
  ],
  mahasiswa: [
    {
      question:
        "Saat uang bulanan hampir habis, kamu melihat promo pinjol yang menawarkan ‘cair cepat tanpa ribet’. Kamu butuh dana darurat. Apa langkah bijak sebelum mengambil keputusan?",
      options: [
        "Langsung ajukan pinjaman karena kebutuhan mendesak",
        "Cek legalitas aplikasi di OJK dan pelajari konsekuensinya",
        "Tanya ke teman apakah aman",
        "Pinjam dari aplikasi lalu bayar pakai pinjaman lain",
      ],
      answer: "Cek legalitas aplikasi di OJK dan pelajari konsekuensinya",
      feedbackCorrect:
        "Sebelum memutuskan pinjam, penting untuk memastikan aplikasi tersebut legal dan memahami risikonya agar tidak menyesal kemudian",
      feedbackWrong:
        "Jawaban yang benar ini ya - Sebelum memutuskan pinjam, penting untuk memastikan aplikasi tersebut legal dan memahami risikonya agar tidak menyesal kemudian",
    },
    {
      question:
        "Seorang teman mengajakmu investasi di aplikasi game yang menjanjikan uang cepat, tapi kamu curiga itu judi terselubung. Apa yang sebaiknya kamu lakukan?",
      options: [
        "Coba dulu dengan nominal kecil",
        "Sebarkan ke teman lain ",
        "Tolak dan ajak teman diskusi risikonya",
        "Biarkan saja, itu bukan urusanmu",
      ],
      answer: "Tolak dan ajak teman diskusi risikonya",
      feedbackCorrect:
        "Menolak ajakan yang mencurigakan lebih baik dilakukan dengan cara yang persuasif agar teman juga sadar akan risikonya.",
      feedbackWrong:
        "Jawaban yang benar ini ya - Menolak ajakan yang mencurigakan lebih baik dilakukan dengan cara yang persuasif agar teman juga sadar akan risikonya.",
    },
    {
      question:
        "Kamu merasa malu membicarakan masalah keuanganmu ke orang tua. Di sisi lain, kamu butuh uang untuk bayar UKT dan tergoda pinjol. Apa yang sebaiknya kamu pertimbangkan?",
      options: [
        "Ambil pinjol diam-diam dan cicil pelan-pelan",
        "Cari informasi bantuan dari kampus terlebih dahulu",
        "Minta bantuan teman, nanti diganti",
        "Berhenti kuliah sementara",
      ],
      answer: "Cari informasi bantuan dari kampus terlebih dahulu",
      feedbackCorrect:
        "Mengakses bantuan resmi dari kampus adalah pilihan yang lebih aman daripada mengambil pinjaman yang berisiko",
      feedbackWrong:
        "Jawaban yang benar ini ya - Mengakses bantuan resmi dari kampus adalah pilihan yang lebih aman daripada mengambil pinjaman yang berisiko",
    },
    {
      question:
        "Ada teman sekelas yang mulai kecanduan judol dan mulai absen kuliah. Apa yang bisa kamu lakukan sebagai teman?",
      options: [
        "Biarkan saja, itu hidupnya",
        "Pinjamkan uang agar dia tidak stres",
        "Ajak bicara perlahan dan tawarkan bantuan atau arahkan ke konselor kampus",
        "Ikut main supaya bisa dekat dan bantu dari dalam",
      ],
      answer:
        " Ajak bicara perlahan dan tawarkan bantuan atau arahkan ke konselor kampus",
      feedbackCorrect:
        "Memberi dukungan dan mendorong teman mencari bantuan profesional bisa menjadi langkah penting dalam membantu mereka keluar dari masalah",
      feedbackWrong:
        "Jawaban yang benar ini ya - Memberi dukungan dan mendorong teman mencari bantuan profesional bisa menjadi langkah penting dalam membantu mereka keluar dari masalah",
    },
    {
      question:
        "Kamu ingin beli gadget baru untuk kuliah, tapi danamu belum cukup. Kamu tergoda pinjol karena temanmu berhasil pakai itu. Keputusan apa yang akan kamu ambil?",
      options: [
        "Ambil pinjol tapi pilih bunganya kecil",
        "Pikirkan kembali apa yang menjadi kebutuhan dan keinginan",
        "Beli sekarang, pikir cicilannya nanti",
        "Tunda saja sampai dapat uang",
      ],
      answer: "Pikirkan kembali apa yang menjadi kebutuhan dasar dan keinginan",
      feedbackCorrect:
        "Mengenali perbedaan antara kebutuhan dan keinginan bisa membantumu mengambil keputusan finansial yang lebih bijak",
      feedbackWrong:
        "Jawaban yang benar ini ya - Mengenali perbedaan antara kebutuhan dan keinginan bisa membantumu mengambil keputusan finansial yang lebih bijak",
    },
  ],
  pekerja: [
    {
      question:
        "Kamu harus menanggung biaya orang tua yang sakit, tapi gajimu belum cukup bulan ini. Teman menyarankan ambil pinjol karena ‘prosesnya cepat’. Apa yang kamu lakukan lebih dulu?",
      options: [
        "Langsung pinjam agar masalah cepat selesai",
        "Cek bunga, tenor, dan legalitas pinjaman di OJK serta pelajari risikonya",
        "Tanya ke teman kantor yang pernah pinjam",
        "Minta pinjaman ke keluarga lalu ganti nanti",
      ],
      answer:
        "Cek bunga, tenor, dan legalitas pinjaman di OJK serta pelajari risikonya",
      feedbackCorrect:
        "Memahami syarat dan legalitas pinjaman adalah langkah awal agar tidak terjebak dalam hutang yang bermasalah",
      feedbackWrong:
        "Jawaban yang benar ini ya - Memahami syarat dan legalitas pinjaman adalah langkah awal agar tidak terjebak dalam hutang yang bermasalah",
    },
    {
      question:
        "Teman kerjamu tiba-tiba menawarkan bisnis sampingan yang ternyata judi online terselubung. Kamu khawatir akan dimusuhi jika menolak. Apa tindakan yang tepat?",
      options: [
        "Tolak dengan sopan dan simpan bukti tawaran",
        "Ikut saja agar aman di tempat kerja",
        "Ajak rekan lain itu biar kompak",
        "Laporkan langsung ke HRD tanpa bukti",
      ],
      answer: "Tolak dengan sopan dan simpan bukti tawaran",
      feedbackCorrect:
        "Menolak ajakan secara baik dan menyimpan bukti bisa melindungimu jika terjadi sesuatu di kemudian hari.",
      feedbackWrong:
        "Jawaban yang benar ini ya - Menolak ajakan secara baik dan menyimpan bukti bisa melindungimu jika terjadi sesuatu di kemudian hari.",
    },
    {
      question:
        "Kamu stres karena pengeluaran bulanan selalu lebih besar dari pemasukan. Kamu mulai berpikir pinjol bisa menjadi solusi. Apa langkah realistis yang bisa kamu lakukan sebelum memutuskan?",
      options: [
        "Buat catatan keuangan dan evaluasi pengeluaran",
        "Ambil pinjol kecil dulu untuk belajar",
        "Pinjam ke beberapa aplikasi sekaligus",
        "Tidak usah berpikir terlalu panjang, langsung pinjam saja",
      ],
      answer: "Buat catatan keuangan dan evaluasi pengeluaran",
      feedbackCorrect:
        "Dengan mencatat pengeluaran, kamu bisa tahu ke mana uangmu pergi dan mencari solusi sebelum memutuskan meminjam.",
      feedbackWrong:
        "Jawaban yang benar ini ya -  Dengan mencatat pengeluaran, kamu bisa tahu ke mana uangmu pergi dan mencari solusi sebelum memutuskan meminjam.",
    },
    {
      question:
        "Rekan kerja mengajakmu main game taruhan online sebagai hiburan di kantor. Katanya ‘sekadar iseng’. Apa yang kamu lakukan?",
      options: [
        "Ikut saja asal tidak ketahuan atasan",
        "Tolak dan beri tahu dengan baik bahwa itu berisiko",
        "Ajak lebih banyak rekan untuk main bareng",
        "Coba dulu agar tidak penasaran",
      ],
      answer: "Tolak dan beri tahu dengan baik bahwa itu berisiko",
      feedbackCorrect:
        "Menyampaikan risiko secara baik bisa membantu rekanmu sadar bahwa hal tersebut tidak layak untuk dicoba.",
      feedbackWrong:
        "Jawaban yang benar ini ya - Menyampaikan risiko secara baik bisa membantu rekanmu sadar bahwa hal tersebut tidak layak untuk dicoba.",
    },
  ],
};

/**
 * Pesan penyemangat per kategori.
 * - correct/wrong arrays untuk random feedback (tambahan pada feedback per soal)
 * - final array menentukan pesan akhir berdasarkan skor (min benar)
 */
const categoryMessages = {
  orangtua: {
    correct: ["Keren! ", "Hebat! "],
    wrong: ["Jangan menyerah", "Tetap semangat !"],
    final: [
      {
        min: 4,
        msg: "Bagus! Kamu cukup peka terhadap risiko. Tetap lanjutkan belajar dan bantu orang sekitarmu juga ya!",
      },
      {
        min: 3,
        msg: "Kamu sudah punya bekal dasar. Tinggal asah lagi biar makin paham risiko dunia digital dan keuangan.",
      },
      {
        min: 1 - 2,
        msg: "Masih banyak yang perlu dipelajari. Yuk, lebih hati-hati dan terus gali informasi biar nggak salah langkah!",
      },
    ],
  },
  mahasiswa: {
    correct: ["Mantap! ", "Keren! "],
    wrong: ["Tenang — belajar pelan-pelan tapi pasti 📘", "Keep going! "],
    final: [
      {
        min: 4,
        msg: "Bagus! Kamu cukup peka terhadap risiko. Tetap lanjutkan belajar dan bantu orang sekitarmu juga ya!",
      },
      {
        min: 3,
        msg: "Kamu sudah punya bekal dasar. Tinggal asah lagi biar makin paham risiko dunia digital dan keuangan.",
      },
      {
        min: 1 - 2,
        msg: "Masih banyak yang perlu dipelajari. Yuk, lebih hati-hati dan terus gali informasi biar nggak salah langkah!",
      },
    ],
  },
  pekerja: {
    correct: ["Keren! ", "Hebat! "],
    wrong: [
      "Santai — setiap kesalahan jadi pelajaran kerja ⚒️",
      "Terus latihan",
    ],
    final: [
      {
        min: 4,
        msg: "Bagus! Kamu cukup peka terhadap risiko. Tetap lanjutkan belajar dan bantu orang sekitarmu juga ya!",
      },
      {
        min: 3,
        msg: "Kamu sudah punya bekal dasar. Tinggal asah lagi biar makin paham risiko dunia digital dan keuangan.",
      },
      {
        min: 1 - 2,
        msg: "Masih banyak yang perlu dipelajari. Yuk, lebih hati-hati dan terus gali informasi biar nggak salah langkah!",
      },
    ],
  },
};

/* KATEGORI untuk tampilan kartu */
const categories = [
  {
    id: "orangtua",
    title: "Orang Tua",
    desc: "Apa yang harus kamu lakukan sebagai orang tua?",
    icon: <FaUserTie className="text-red-500 text-2xl" />,
  },
  {
    id: "mahasiswa",
    title: "Mahasiswa",
    desc: "Apa yang harus kamu lakukan jika menghadapi ini?",
    icon: <FaGraduationCap className="text-blue-500 text-2xl" />,
  },
  {
    id: "pekerja",
    title: "Pekerja",
    desc: "Apa yang harus dilakukan jika saya mengalami ini?",
    icon: <FaBriefcase className="text-yellow-500 text-2xl" />,
  },
];

export default function Page() {
  // state utama
  const [kategori, setKategori] = useState(null); // null berarti pilih kategori
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null); // opsi yang dipilih (string)
  const [localFeedback, setLocalFeedback] = useState(""); // feedback per soal (from quizData)
  const [categoryExtra, setCategoryExtra] = useState(""); // tambahan pesan per kategori (random)
  const [finished, setFinished] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const isKuis = pathname.includes("kuis");

  // handle jawaban
  const handleAnswer = (opt) => {
    if (selected) return; // cegah klik ulang
    const current = quizData[kategori][currentQ];
    const isCorrect = opt === current.answer;

    setSelected(opt);
    // feedback spesifik per soal (benar/salah)
    const perSoal = isCorrect ? current.feedbackCorrect : current.feedbackWrong;

    // pesan tambahan random dari categoryMessages
    const catMsgs = categoryMessages[kategori];
    const extra = isCorrect
      ? catMsgs.correct[Math.floor(Math.random() * catMsgs.correct.length)]
      : catMsgs.wrong[Math.floor(Math.random() * catMsgs.wrong.length)];

    // gabungkan (tampil perSoal dulu, lalu extra)
    setLocalFeedback(`${perSoal} • ${extra}`);

    if (isCorrect) setScore((s) => s + 1);

    // delay sebelum lanjut soal/selesai supaya user baca feedback
    setTimeout(() => {
      if (currentQ + 1 < quizData[kategori].length) {
        setCurrentQ((q) => q + 1);
        setSelected(null);
        setLocalFeedback("");
        setCategoryExtra("");
      } else {
        setFinished(true);
      }
    }, 4000);
  };

  const resetAll = () => {
    setKategori(null);
    setCurrentQ(0);
    setScore(0);
    setSelected(null);
    setLocalFeedback("");
    setCategoryExtra("");
    setFinished(false);
  };

  // pesan akhir berdasarkan kategori dan skor
  const getFinalMessage = () => {
    const data = categoryMessages[kategori].final;
    // pilih pesan dengan min terbesar yang <= score
    for (let i = 0; i < data.length; i++) {
      // data array tertulis dari tinggi->rendah di definisi; kita cek descending
    }
    // safer approach: sort by min desc then find first where score >= min
    const sorted = [...data].sort((a, b) => b.min - a.min);
    const found = sorted.find((d) => score >= d.min);
    return found ? found.msg : "Semangat terus!";
  };

  return (
    <div
      className={`min-h-screen flex flex-col ${
        !kategori ? "bg-blue-50" : "bg-white"
      }`}
    >
      {/* HEADER */}
      {!kategori ? (
        // Header untuk pemilihan kategori
        <header className="bg-white text-gray-900 shadow sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between p-4 relative">
            {/* Kiri: Logo statis */}
            <div className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="TitikRuang Logo"
                width={40}
                height={40}
              />
              <div className="text-2xl font-bold whitespace-nowrap">
                TitikRuang
              </div>
            </div>

            {/* Tengah: Judul dan Subjudul */}
            <div className="hidden md:flex flex-col items-center absolute left-1/2 transform -translate-x-1/2">
              <span className="text-red-500 font-bold text-lg">
                Kuis Bintang
              </span>
              <span className="text-gray-500 text-sm">
                Tes pengetahuanmu & dapatkan wawasan baru
              </span>
            </div>

            {/* Kanan: Tombol Beranda aktif */}
            <div className="hidden md:block">
              <Link href="/">
                <button className="bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600">
                  Beranda
                </button>
              </Link>
            </div>

            {/* Hamburger Menu */}
            <button
              className="md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <span className="text-black text-xl">
                {mobileOpen ? "✕" : "☰"}
              </span>
            </button>
          </div>
        </header>
      ) : (
        // Header untuk mengerjakan kuis
        <header className="bg-orange-500 text-white py-4 shadow">
          <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
            <div>
              <h1 className="font-bold text-lg">
                Kategori: {kategori.toUpperCase()}
              </h1>
              <p className="text-sm opacity-90">
                Soal {currentQ + 1} / {quizData[kategori].length}
              </p>
            </div>
            <div className="text-sm opacity-90">
              Selamat mengerjakan — fokus dan semangat!
            </div>
          </div>
        </header>
      )}

      {/* MAIN */}
      <main className="flex-1 max-w-5xl mx-auto px-4 py-10 w-full">
        {/* Pilih Kategori */}
        {!kategori && (
          <>
            <h2 className="text-center text-xl font-semibold mb-6">
              Pilih Kategori Kuis
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {categories.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setKategori(c.id)}
                  className="cursor-pointer bg-white p-6 rounded-xl shadow hover:shadow-lg border border-gray-200 transition"
                >
                  <div className="flex items-center gap-3 mb-3">
                    {c.icon}
                    <div>
                      <h3 className="text-lg font-semibold">{c.title}</h3>
                      <p className="text-sm text-gray-600">{c.desc}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <button className="px-3 py-2 bg-blue-500 text-white rounded">
                      Pilih {c.title}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Saat Mengerjakan Kuis */}
        {kategori && !finished && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="mb-4 text-center">
                <h3 className="text-orange-500 font-semibold">
                  Soal {currentQ + 1} dari {quizData[kategori].length}
                </h3>
              </div>

              <h2 className="text-lg font-medium text-gray-800 mb-6 text-center">
                {quizData[kategori][currentQ].question}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quizData[kategori][currentQ].options.map((opt) => {
                  // tentukan warna tombol tergantung state selected
                  let base = "text-white p-4 rounded-lg shadow transition ";
                  let colorClass = "bg-blue-500 hover:bg-blue-500";

                  if (selected) {
                    const correct = quizData[kategori][currentQ].answer;
                    if (opt === correct) colorClass = "bg-green-600";
                    else if (opt === selected) colorClass = "bg-red-600";
                    else colorClass = "bg-gray-300 text-gray-700";
                  }

                  return (
                    <button
                      key={opt}
                      onClick={() => handleAnswer(opt)}
                      className={`${base} ${colorClass}`}
                      disabled={!!selected}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {/* feedback per soal (unik) */}
              {localFeedback && (
                <div className="mt-5 text-center">
                  <p className="inline-block bg-gray-100 px-4 py-2 rounded-lg text-gray-800 shadow-sm">
                    {localFeedback}
                  </p>
                </div>
              )}
            </div>

            {/* small controls / progress */}
            <div className="mt-6 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Skor sementara:{" "}
                <span className="font-semibold text-gray-800">{score}</span>
              </div>
              <div>
                <button
                  onClick={() => {
                    /* back to category */ resetAll();
                  }}
                  className="text-sm px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Keluar & Pilih Ulang
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Halaman Hasil */}
        {kategori && finished && (
          <div className="max-w-xl mx-auto text-center">
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <h2 className="text-2xl font-bold mb-3">Kuis Selesai!</h2>
              <p className="mb-4">
                Kategori: <span className="font-semibold">{kategori}</span>
              </p>
              <p className="mb-4">
                Skor kamu:{" "}
                <span className="font-semibold">
                  {score} / {quizData[kategori].length}
                </span>
              </p>
              <p className="mb-6 text-lg">{getFinalMessage()}</p>

              <div className="flex justify-center gap-3">
                <button
                  onClick={resetAll}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Selesai
                </button>
                <button
                  onClick={() => {
                    setCurrentQ(0);
                    setScore(0);
                    setFinished(false);
                    setSelected(null);
                    setLocalFeedback("");
                  }}
                  className="px-4 py-2 bg-green-100 text-green-800 rounded hover:bg-green-200"
                >
                  Ulangi Kategori Ini
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      {!kategori ? (
        // FOOTER SAAT PEMILIHAN KATEGORI (full)
        <footer className="text-white bg-gradient-to-r from-[#3061F2] via-[#27A4F2] to-[#F2780C] relative pt-0">
          <svg
            className="w-full h-20 md:h-28 block"
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="#ffffff"
              d="M0,64 C480,160 960,0 1440,96 L1440,0 L0,0 Z"
            />
          </svg>
          <div className="max-w-7xl mx-auto px-4 pb-6 text-white text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 border-b border-white/30 pb-4">
              {/* Kolom 1: Logo */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Image
                    src="/logo3.png"
                    alt="TitikRuang Logo"
                    width={64}
                    height={64}
                    className="transition duration-300 hover:animate-glow"
                  />
                  <h3 className="text-xl font-bold h-30">TitikRuang</h3>
                </div>
                <p>DENGAR PULIH BANGKIT</p>
              </div>

              {/* Kolom 2: Tentang */}
              <div>
                <h4 className="text-base font-semibold mb-2">Tentang</h4>
                <ul className="space-y-1">
                  <li>
                    <a href="/tentangkami" className="hover:underline">
                      Visi & Misi
                    </a>
                  </li>
                  <li>
                    <a href="/tentangkami" className="hover:underline">
                      Penelitian
                    </a>
                  </li>
                  <li>
                    <a href="/tentangkami" className="hover:underline">
                      Tim
                    </a>
                  </li>
                </ul>
              </div>

              {/* Kolom 3: Bantuan */}
              <div>
                <h4 className="text-base font-semibold mb-2">Bantuan</h4>
                <ul className="space-y-1">
                  <li>
                    <a href="/policy" className="hover:underline">
                      Syarat dan Ketentuan
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://forms.gle/tSPWuMTtUTF3pRHv8"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      Laporkan Penyalahgunaan
                    </a>
                  </li>
                  <li>
                    <a href="/kontakkami" className="hover:underline">
                      Kontak
                    </a>
                  </li>
                </ul>
              </div>

              {/* Kolom 4: Hubungi Kami */}
              <div>
                <h4 className="text-base font-semibold mb-2">Hubungi Kami</h4>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <FaEnvelope />
                    <a
                      href="mailto:titikruangofficial@gmail.com"
                      className="hover:underline"
                    >
                      titikruangofficial@gmail.com
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaWhatsapp />
                    <a
                      href="https://wa.me/10000"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      0815 7441 0000
                    </a>
                  </div>
                </div>
              </div>

              {/* Kolom 5: Ikuti Kami */}
              <div>
                <h4 className="text-base font-semibold mb-2">Ikuti Kami</h4>
                <div className="flex gap-3 text-xl">
                  <a
                    href="https://www.instagram.com/officialtitikruang"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaInstagram className="hover:text-pink-500" />
                  </a>
                  <a
                    href="https://www.facebook.com/akunmu"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaFacebook className="hover:text-blue-600" />
                  </a>
                  <a
                    href="https://www.youtube.com/@TitikRuangOfficial"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaYoutube className="hover:text-red-600" />
                  </a>
                  <a
                    href="http://linkedin.com/in/titik-ruang-860043379"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaLinkedin className="hover:text-blue-700" />
                  </a>
                </div>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="mt-1 flex flex-col sm:flex-row items-center justify-between text-sm">
              <div className="mt-1 sm:mt-0 flex items-center gap-2">
                <span>Dibina oleh</span>
                <img src="/logofooter.png" className="h-10" />
              </div>
            </div>
          </div>
        </footer>
      ) : (
        // FOOTER SAAT MENGERJAKAN KUIS/HASIL (sederhana)
        <footer className="bg-blue-200 text-blue-900 py-4 border-t border-blue-300">
          <div className="max-w-5xl mx-auto px-4 text-center text-sm flex items-center justify-center gap-2">
            <span className="font-bold text-blue-600">★</span>
            Powered by Quiz Pintar © 2025
          </div>
        </footer>
      )}
    </div>
  );
}
