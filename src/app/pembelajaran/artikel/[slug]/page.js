"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

const articles = {
  "artikel1": {
    title: "Pinjol & Judol: Dua Masalah Digital yang Bisa Jadi “Duo Maut” Penghancur  Kehidupan Kita",
    date: "14 Agustus 2025",
    content: `
      <p class="mb-4">Pernah nggak sih, lagi buka ponsel, tiba-tiba muncul notifikasi pinjaman online (pinjol) yang katanya “cair dalam 5 menit”, terus di lain waktu kamu lihat iklan judi online (judol) yang mengiming-imingi “modal kecil, cuan besar”? Sekilas sih nggak ada hubungannya. Tapi di lapangan, pinjol dan judol sering saling terkait, bahkan bikin korban terjebak lingkaran utang dan kerugian finansial.</p>
      <p class="mb-4">Di artikel ini, kita bakal kupas kenapa keduanya bisa jadi “pasangan berbahaya” di era digital, dan kenapa literasi finansial itu penting banget buat nagelawan mereka.</p>
      <h3 class="text-xl font-bold mt-8 mb-2 text-[#3061F2]">Pinjol: Manis di Depan, Perih di Belakang</h3>
      <p class="mb-4">Data dari Otoritas Jasa Keuangan (OJK) menunjukkan, per Februari 2025, menurut data OJK, total outstanding pinjaman di Indonesia tembus Rp 80,07 triliun dengan tingkat kredit macet (TWP90) sebesar 2,78%. Ditambah lagi, dominasi peminjam berada di rentang usia 19-34 tahun.</p>
      <p class="mb-4">Masalahnya, nggak semua pinjol itu legal. Satuan Tugas Pemberantasan Aktivitas Keuangan Ilegal (Satgas Pasti) telah menghentikan 13.228 entitas keuangan ilegal sejak 2017 hingga 31 Mei 2025. Pinjol ilegal ini sering memberikan bunga mencekik, ancaman ke peminjam, sampai menyebar data pribadi.</p>
      <h3 class="text-xl font-bold mt-8 mb-2 text-[#3061F2]">Judol: Janji Jackpot, tapi Berujung Bokek</h3>
      <p class="mb-4">Sementara itu, judi online makin gencar merambah media sosial dan platform streaming. Kementerian Komunikasi dan Informatika (Kominfo) mencatat, sepanjang Juli 2023-Mei 2024, sudah ada 1,9 juta situs dan konten judi online yang diblokir.</p>
      <p class="mb-4">Judi online bukan cuma bikin orang kehilangan uang, tapi juga memicu masalah psikologis, gangguan keluarga, kesehatan mental terganggu, bahkan kriminalitas.</p>
      <h3 class="text-xl font-bold mt-8 mb-2 text-[#3061F2]">Kenapa Pinjol & Judol jadi Dua Hal yang Terhubung?</h3>
      <p class="mb-4">Banyak korban judol akhirnya terjerat pinjol karena mereka butuh modal cepat buat “balik modal” setelah kalah main. Fenomena ini justru jadi kayak nambah bensin ke api, karena utang makin numpuk, dan peluang menang tetap kecil (karena sistem judi memang dirancang untuk bikin pemain kalah). Di sisi lain, pinjol ilegal nggak peduli uangnya dipakai buat apa, selama si peminjam bisa bayar bunga yang tinggi.</p>
      <h3 class="text-xl font-bold mt-8 mb-2 text-[#3061F2]">Lingkaran Setan yang Harus Diputus</h3>
      <p class="mb-4">Kalau sudah terjebak, sulit banget buat keluar. Dari pengalaman beberapa lembaga pendamping korban, siklusnya sering begini:</p>
      <ol class="list-decimal ml-6 mb-4">
        <li>Kalah judi lalu minjem ke pinjol.</li>
        <li>Bayar bunga pinjol pakai pinjaman dari pinjol lain.</li>
        <li>Tekanan mental dan ekonomi makin parah.</li>
        <li>Hubungan sosial terganggu, bahkan kehilangan pekerjaan.</li>
      </ol>
      <h3 class="text-xl font-bold mt-8 mb-2 text-[#3061F2]">Cara Lindungi Diri dari Duo Maut Ini</h3>
      <p class="mb-4">Untuk menghindari bahaya pinjol dan judol, kamu tentunya bisa melakukan hal-hal di bawah ini untuk membentengi diri dari bahayanya!</p>
      <ul class="list-disc ml-6 mb-4">
        <li>Cek legalitas pinjol di situs resmi OJK</li>
        <li>Blokir situs/iklan judi online di perangkatmu</li>
        <li>Kalau sudah terlanjur, banyak layanan pendampingan gratis dari pemerintah, Lembaga Sosial dan juga Kawan-kawan lain di komunitas</li>
        <li>Tingkatkan literasi keuangan, jangan gampang tergiur janji manis iklan.</li>
      </ul>
      <p class="mb-4">Pinjol dan judol itu ibarat dua sisi mata uang yang sama: sama-sama bikin dompet bocor dan mental terguncang. Bahayanya, keduanya bisa dicegah kalau kita punya bekal literasi digital dan finansial yang kuat. Ingat, nggak ada uang instan yang benar-benar gratis. Kalau ada yang janji manis, besar kemungkinan ada “jebakan Batman” nya di belakang.</p>
      <h3 class="text-xl font-bold mt-8 mb-2 text-black">Referensi</h3>
      <ul class="list-disc ml-6 mb-4">
        <li>CNN Indonesia. (2025, June 11). <i>Pengguna Pinjol Didominasi Usia 19 - 34 Tahun</i>. CNN Indonesia. Retrieved August 11, 2025, from <a href="https://www.cnnindonesia.com/ekonomi/20250601165027-78-1238257/pengguna-pinjol-didominasi-usia-19-34-tahun" target="_blank" class="text-blue-600 underline">cnnindonesia.com</a></li>
        <li>Oswald, I. G. (2025, June 20). <i>Generasi Digital, Utangnya Brutal: 90% Kredit Macet Datang dari Anak Muda</i>. Retrieved August 11, 2025, from <a href="https://fintech.id/7973697/generasi-digital-utangnya-brutal-90-kredit-macet-datang-dari-anak-muda" target="_blank" class="text-blue-600 underline">fintech.id</a></li>
        <li>Puspita, M. D. (2025, June 21). <i>Daftar Pinjol Resmi OJK per Juni 2025</i>. tempo.co. Retrieved August 11, 2025, from <a href="https://www.tempo.co/ekonomi/daftar-pinjol-resmi-ojk-per-juni-2025-1755625#goog_r" target="_blank" class="text-blue-600 underline">tempo.co</a></li>
        <li>Yanwardhana, E. (2024, May 25). <i>Lapor Pak Jokowi, Kominfo Sudah Blokir 1,9 Juta Konten Judi Online</i>. CNBC Indonesia. Retrieved August 11, 2025, from <a href="https://www.cnbcindonesia.com/tech/20240522155826-37-540565/lapor-pak-jokowi-kominfo-sudah-blokir-19-juta-konten-judi-online" target="_blank" class="text-blue-600 underline">cnbcindonesia.com</a></li>
      </ul>
    `,
  },
  "25-universitas-terbaik-indonesia-2025": {
    title: "25 Universitas Terbaik Indonesia Tahun 2025 versi THE WUR",
    date: "July 25, 2025",
    content: `
      <p>Berikut adalah daftar 25 universitas terbaik di Indonesia versi THE WUR tahun 2025...</p>
      <ul>
        <li>1. Universitas Indonesia</li>
        <li>2. ITB</li>
        <li>3. UGM</li>
        <!-- Tambahkan isi artikelmu di sini -->
      </ul>
    `,
  },
};

export default function ArtikelDetail() {
  const { slug } = useParams();
  const article = articles[slug];

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Artikel tidak ditemukan</h1>
        <Link href="/pembelajaran" className="text-blue-600 underline">
          Kembali ke Pembelajaran
        </Link>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen py-10 px-4 overflow-x-hidden">
      {/* Background gambar utama */}
      <div
        className="absolute inset-0 w-full h-full z-0"
        style={{
          backgroundImage: "url('/bgartikel.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 1, // FULL opacity, hilangkan putih
        }}
      />
      {/* Background dekorasi samping */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Gradient kiri */}
        <div className="absolute left-0 top-0 h-full w-32 bg-gradient-to-r from-[#3061F2]/20 to-transparent" />
        {/* Gradient kanan */}
        <div className="absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-[#F2780C]/20 to-transparent" />
        {/* Ornamen bulat kiri */}
        <div className="absolute left-4 top-32 w-16 h-16 bg-[#3061F2]/30 rounded-full blur-lg" />
        {/* Ornamen bulat kanan */}
        <div className="absolute right-8 bottom-24 w-20 h-20 bg-[#F2780C]/30 rounded-full blur-lg" />
      </div>
      {/* Header Artikel sticky di luar konten utama */}
      <motion.header
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="sticky top-0 z-30 flex items-center justify-between w-full px-6 py-4 shadow rounded-xl"
        style={{
          minHeight: "64px",
          backgroundImage: "url('/bgheaderartikel.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Kiri: Logo + TitikRuang */}
        <div className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="TitikRuang Logo"
            width={36}
            height={36}
            className="rounded-lg"
          />
          <span className="font-bold text-xl text-[#3061F2]">TitikRuang</span>
        </div>
        {/* Tengah: Judul/label bebas */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-center flex-1"
        >
          <span className="font-semibold text-2xl text-gray-700">
            Artikel Pembelajaran
          </span>
        </motion.div>
        {/* Kanan: Tombol kembali */}
        <motion.div
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Link href="/pembelajaran">
            <button className="bg-[#3061F2] text-white px-6 py-3 rounded-xl hover:bg-[#F2780C] transition font-semibold shadow text-lg">
              Kembali
            </button>
          </Link>
        </motion.div>
      </motion.header>
      {/* Konten utama */}
      <div className="relative z-10 max-w-3xl mx-auto bg-white/80 rounded-xl p-6 shadow-lg">
        {/* Gambar di atas judul */}
        <img
          src="/artikel1.png"
          alt="Pinjol & Judol"
          className="w-full rounded-xl mb-2 object-contain"
        />
        <p className="text-xs text-gray-500 mb-6 text-center">
          Sumber gambar: Ilustrasi oleh Aveny Raisa Maarif 
        </p>
        <h1 className="text-3xl md:text-4xl font-extrabold text-black mb-2">{article.title}</h1>
        <p className="text-gray-500 mb-6">{article.date}</p>
        <div
          className="prose prose-lg"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </div>
    </main>
  );
}
