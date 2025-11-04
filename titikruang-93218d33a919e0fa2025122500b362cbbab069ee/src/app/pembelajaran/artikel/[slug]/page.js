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
 "artikel2": {
    title: "Yuk Cari Tahu: Laporkan Pinjol Ilegal, Lindungi Dirimu Sekarang!",
    date: "30 Agustus 2025",
    content: `
      <p class="mb-4">Pernah nggak sih, lagi buka ponsel, tiba-tiba muncul notifikasi pinjaman online (pinjol) yang katanya “cair dalam 5 menit”, terus di lain waktu kamu lihat iklan judi online (judol) yang mengiming-imingi “modal kecil, cuan besar”? Sekilas sih nggak ada hubungannya. Tapi di lapangan, pinjol dan judol sering saling terkait, bahkan bikin korban terjebak lingkaran utang dan kerugian finansial.</p>
      <p class="mb-4">Di artikel ini, kita bakal kupas kenapa keduanya bisa jadi “pasangan berbahaya” di era digital, dan kenapa literasi finansial itu penting banget buat nagelawan mereka.</p>
      <h3 class="text-xl font-bold mt-8 mb-2">Pinjol: Manis di Depan, Perih di Belakang</h3>
      <p class="mb-4">Data dari Otoritas Jasa Keuangan (OJK) menunjukkan, per Februari 2025, total outstanding pinjaman di Indonesia tembus Rp 80,07 triliun dengan tingkat kredit macet (TWP90) sebesar 2,78%. Ditambah lagi, dominasi peminjam berada di rentang usia 19-34 tahun.</p>
      <p class="mb-4">Masalahnya, nggak semua pinjol itu legal. Satuan Tugas Pemberantasan Aktivitas Keuangan Ilegal (Satgas Pasti) telah menghentikan 13.228 entitas keuangan ilegal sejak 2017 hingga 31 Mei 2025. Pinjol ilegal ini sering memberikan bunga mencekik, ancaman ke peminjam, sampai menyebar data pribadi.</p>
      <h3 class="text-xl font-bold mt-8 mb-2">Judol: Janji Jackpot, tapi Berujung Bokek</h3>
      <p class="mb-4">Sementara itu, judi online makin gencar merambah media sosial dan platform streaming. Kementerian Komunikasi dan Informatika (Kominfo) mencatat, sepanjang Juli 2023–Mei 2024, sudah ada 1,9 juta situs dan konten judi online yang diblokir.</p>
      <p class="mb-4">Judi online bukan cuma bikin orang kehilangan uang, tapi juga memicu masalah psikologis, gangguan keluarga, kesehatan mental terganggu, bahkan kriminalitas.</p>

    <h3 class="text-xl font-bold mt-8 mb-2">Kenapa Pinjol & Judol jadi Dua Hal yang Terhubung?</h3>
    <p class="mb-4">Banyak korban judol akhirnya terjerat pinjol karena mereka butuh modal cepat buat “balik modal” setelah kalah main. Fenomena ini justru jadi kayak nambah bensin ke api, karena utang makin numpuk, dan peluang menang tetap kecil (karena sistem judi memang dirancang untuk bikin pemain kalah). Di sisi lain, pinjol ilegal nggak peduli uangnya dipakai buat apa, selama si peminjam bisa bayar bunga yang tinggi.</p>

    <h3 class="text-xl font-bold mt-8 mb-2">Lingkaran Setan yang Harus Diputus</h3>
    <p class="mb-4">Kalau sudah terjebak, sulit banget buat keluar. Dari pengalaman beberapa lembaga pendamping korban, siklusnya sering begini:</p>
    <ol class="list-decimal ml-6 mb-4">
      <li>Kalah judi lalu minjem ke pinjol.</li>
      <li>Bayar bunga pinjol pakai pinjaman dari pinjol lain.</li>
      <li>Tekanan mental dan ekonomi makin parah.</li>
      <li>Hubungan sosial terganggu, bahkan kehilangan pekerjaan.</li>
    </ol>

    <h3 class="text-xl font-bold mt-8 mb-2">Cara Lindungi Diri dari Duo Maut Ini</h3>
    <p class="mb-4">Untuk menghindari bahaya pinjol dan judol, kamu tentunya bisa melakukan hal-hal di bawah ini untuk membentengi diri dari bahayanya!</p>
    <ul class="list-disc ml-6 mb-4">
      <li>Cek legalitas pinjol di situs resmi OJK (<a href="https://www.ojk.go.id" target="_blank" rel="noopener">ojk.go.id</a>).</li>
      <li>Blokir situs/iklan judi online di perangkatmu dan laporkan iklan yang menyesatkan.</li>
      <li>Kalau sudah terlanjur, banyak layanan pendampingan gratis dari pemerintah, lembaga sosial, dan komunitas.</li>
      <li>Tingkatkan literasi keuangan, jangan gampang tergiur janji manis iklan.</li>
    </ul>

    <p class="mb-4">Pinjol dan judol itu ibarat dua sisi mata uang yang sama: sama-sama bikin dompet bocor dan mental terguncang. Bahayanya, keduanya bisa dicegah kalau kita punya bekal literasi digital dan finansial yang kuat. Ingat, nggak ada uang instan yang benar-benar gratis. Kalau ada yang janji manis, besar kemungkinan ada “jebakan Batman” nya di belakang.</p>

    <h3 class="text-xl font-bold mt-8 mb-2 text-black">Referensi</h3>
    <ul class="list-disc ml-6 mb-4">
      <li class="muted">CNN Indonesia. (2025, June 11). <em>Pengguna Pinjol Didominasi Usia 19 - 34 Tahun</em>. Retrieved August 11, 2025, from <a href="https://www.cnnindonesia.com/ekonomi/20250601165027-78-1238257/pengguna-pinjol-didominasi-usia-19-34-tahun" target="_blank" rel="noopener">cnnindonesia.com</a></li>
      <li class="muted">Oswald, I. G. (2025, June 20). <em>Generasi Digital, Utangnya Brutal: 90% Kredit Macet Datang dari Anak Muda</em>. Retrieved August 11, 2025, from <a href="https://fintech.id/7973697/generasi-digital-utangnya-brutal-90-kredit-macet-datang-dari-anak-muda" target="_blank" rel="noopener">fintech.id</a></li>
      <li class="muted">Puspita, M. D. (2025, June 21). <em>Daftar Pinjol Resmi OJK per Juni 2025</em>. <a href="https://www.tempo.co/ekonomi/daftar-pinjol-resmi-ojk-per-juni-2025-1755625#goog_r" target="_blank" rel="noopener">tempo.co</a></li>
      <li class="muted">Yanwardhana, E. (2024, May 25). <em>Lapor Pak Jokowi, Kominfo Sudah Blokir 1,9 Juta Konten Judi Online</em>. Retrieved August 11, 2025, from <a href="https://www.cnbcindonesia.com/tech/20240522155826-37-540565/lapor-pak-jokowi-kominfo-sudah-blokir-19-juta-konten-judi-online" target="_blank" rel="noopener">cnbcindonesia.com</a></li>
    </ul>
    `,
  },
  "artikel3": {
    title: "Lingkaran Judol dan Pinjol: Dari Godaan Keuntungan hingga Jeratan Hutang",
    date: "10 September 2025",
    content: `
      <h3 class="text-xl font-bold mt-8 mb-2">Dari Coba-Coba ke Keterjeratan</h3>

    <p>Fenomena judi online (judol) di Indonesia kini bukan lagi sekadar soal hiburan atau keberuntungan sesaat. Ia menjelma menjadi jebakan sistemik yang menggerogoti keuangan sekaligus mental masyarakat. Data dari Pusat Pelaporan dan Analisis Transaksi Keuangan (PPATK) mencatat, pada kuartal I 2025 transaksi judol mencapai Rp6,2 triliun. Sebanyak 71 persen pemainnya berasal dari kelompok berpenghasilan di bawah Rp5 juta per bulan. Lebih mengkhawatirkan lagi, kelompok usia 10–20 tahun sudah menyumbang 1,67 persen dari total pelaku judol.</p>

    <p>Dalam wawancara dengan salah satu mantan pemain judol, pola awal keterjeratan ini tampak jelas. “Awalnya cuma coba-coba,” ujarnya, mengenang masa ketika mulai bermain pada 2021. Dari teman, ia mengenal situs dengan iming-iming “modal kecil, untung besar”. Dua tahun bermain membuatnya sempat menang jutaan, tapi akhirnya rugi hingga puluhan juta. “Kalau kalah, rasanya pengen terus main buat balik modal,” katanya.</p>

    <h3 class="text-xl font-bold mt-8 mb-2">Dari Kerugian ke Pinjol: Jalan Pintas yang Berujung Ancaman</h3>

    <p>Ketika kehabisan uang, ia mencoba menutup kerugian dengan pinjaman online (pinjol). “Pasti itu, karena orang sekitar udah tahu kita main judol, jadi nggak ada yang mau minjemin uang,” ungkapnya. Namun, solusi cepat itu justru menjerat lebih dalam. “Baru lima hari sebelum jatuh tempo aja udah diancam,” kenangnya.</p>

    <p>Kondisi ini bukan kasus tunggal. Data Otoritas Jasa Keuangan (OJK) menunjukkan, peminjam berusia 19–34 tahun menjadi yang terbanyak dengan total pinjaman mencapai Rp38,18 triliun hingga Februari 2025. Sekitar 2,6 juta di antaranya kini kesulitan membayar utang, lebih dari separuh berusia di bawah 35 tahun.</p>

    <p>Kisah ini menegaskan bahwa judol dan pinjol bukan hanya dua masalah ekonomi, melainkan dua lingkaran setan yang saling memperkuat. Tanpa ruang pemulihan yang empatik, banyak orang akan terus terjebak dalam diam dan rasa bersalah yang berulang.</p>

    <h2 class="text-xl font-bold mt-8 mb-2" >Referensi</h2>
    <ul>
      <li class="muted">Kompas. (2023, November 22). Jutaan anak muda kesulitan bayar pinjol. <a href="https://www.kompas.id/artikel/jutaan-anak-muda-kesulitan-bayar-pinjol?" target="_blank" rel="noopener">kompas.id</a></li>
      <li class="muted">Kompas. (2025, Mei 9). Jakarta dan Jabar terbesar kasus judi online, usia 10-20 tahun sudah terpapar. <a href="https://nasional.kompas.com/read/2025/05/09/07450401/jakarta-dan-jabar-terbesar-kasus-judi-online-usia-10-20-tahun-sudah-terpapar?page=all" target="_blank" rel="noopener">nasional.kompas.com</a></li>
    </ul>
    `,
  },
  "artikel4": {
    title: "Kecanduan Judi Online: Saat Perilaku Impulsif Mengalahkan Rasionalitas",
    date: "23 September 2025",
    content: `
      <p>Iklan gim slot dan janji “menang besar” kini mudah ditemukan di media sosial. Sekilas terlihat seperti hiburan, tapi di balik itu banyak orang yang terjebak dalam lingkaran kecanduan. Menurut psikolog klinis Danny Sanjaya Arfensia, S.Psi., M.Psi., Psikolog., fenomena judi online (judol) berdampak luas, “kalau secara klinisnya bukan hanya merugikan dirinya sendiri, tetapi secara aspek sosialnya juga tentu terpengaruh.”</p>
      <h1 class="text-xl font-bold mt-8 mb-2">Ketika Perilaku Impulsif Mengambil Alih</h1>

    <p>Iklan gim slot dan janji “menang besar” kini mudah ditemukan di media sosial. Sekilas terlihat seperti hiburan, tapi di balik itu banyak orang yang terjebak dalam lingkaran kecanduan. Menurut psikolog klinis Danny Sanjaya Arfensia, S.Psi., M.Psi., Psikolog., fenomena judi online (judol) berdampak luas: <em>“kalau secara klinisnya bukan hanya merugikan dirinya sendiri, tetapi secara aspek sosialnya juga tentu terpengaruh.”</em></p>

    <h2 class="text-xl font-bold mt-8 mb-2">Ketika Perilaku Impulsif Mengambil Alih</h2>
    <p>Danny menjelaskan bahwa pola perilaku pemain judol mirip dengan bentuk adiksi lain. “Kalau berbicara soal adiksi-pun kan sebetulnya tidak hanya tentang ini, kita juga berbicara soal bentuk fanatisme online, itu kan juga termasuk kecanduan begitu kan.” Namun, akar masalahnya sering kali ada pada perilaku impulsif.</p>

    <blockquote>
      “Kecanduan sendiri itu mostly tentang orang-orang… yang saya lihat itu… impulsif seperti itu. Impulsif itu kayak mereka condong mengambil keputusan secara cepat, tetapi tidak memikirkan dampak kebelakangnya.”
    </blockquote>

    <p>Menurut Danny, impulsifitas tidak muncul begitu saja. “Tidak mungkin dalam konteks ini mereka menjadi impulsif dengan sendirinya, bisa jadi pula mereka memang sejak awal punya bakat/bibit-bibit untuk menjadi orang impulsif, entah itu dari orang tuanya, atau dari lingkungan sekitar yang memberikan pendidikan kepada mereka.” Orang impulsif, lanjutnya, “kurang atau bahkan tidak dibekali dengan cara berpikir jangka panjang, jadi cuma memikirkan keputusan cepat yang bisa diambil, namun ia tidak memikirkan dampak ke dirinya dan dampak ke lingkungan setempatnya.”</p>

    <h2 class="text-xl font-bold mt-8 mb-2">Algoritma dan Tekanan Sosial</h2>
    <p>Sifat impulsif diperkuat oleh sistem permainan yang memancing pemain untuk terus bermain. “Yah kayak dia dapat keuntungan secara cepat lewat judol, nah disini mungkin algoritmanya membuat orang tersebut menang-menang-menang terus begitu, setelah itu giliran ke sekian dia jadi kalah atau malahan harus beli token (kode) atau segala macamnya yang lain,” jelas Danny.</p>

    <p>Selain itu, media sosial dan rasa takut tertinggal (FOMO) juga berperan besar. “Kalau orang FOMO, ini berarti kan dia takut kelewatan, takut ketinggalan zaman, takut tidak update,” ujarnya. “Kebanyakan orang itu akan nge-follow orang yang diminati oleh dia… Nah, kalau menurut saya sendiri pasti terdapat hubungannya karena sekali lagi setiap orang itu tidak mau ketinggalan zaman, ditambah juga adanya sosial media ini juga kan membentuk seseorang.”</p>

    <p>Dorongan untuk eksis sering membuat seseorang lupa akan kemampuan finansialnya. “Misalnya, kebutuhan-kebutuhan akan eksistensialnya seseorang (gadget baru, baju baru, dll), ini yang membuat mereka kemudian tidak ingat akan kondisi finansial mereka. Ya, intinya sangat berhubungan antara FOMO, judol, pinjol, yang memaksa ia untuk mendapatkan uang.”</p>

    <h2 class="text-xl font-bold mt-8 mb-2">Pelarian dari Masalah dan Upaya Pulih</h2>
    <p>Dalam kondisi stres, banyak orang menjadikan judi online sebagai pelarian. “Jadi, semacam pelarian gitu atas permasalahan yang mereka hadapi, apalagi dalam kondisi yang kalut, yang dia sebenarnya tidak dapat berpikir jernih,” kata Danny.</p>

    <p>Untuk pemulihan, ia menjelaskan bahwa pendekatan psikologi bisa dilakukan secara individu maupun kelompok. “Jadi salah satu cara yang sering digunakan oleh psikolog itu dengan mengumpulkan orang-orang yang memiliki permasalahan serupa atau bahkan tidak serupa, ini dilakukan supaya mereka bisa saling memiliki experience yang berbeda-beda dan dapat mengambil insight dari sudut pandang yang berbeda.”</p>

    <p>Ia juga menilai sistem anonim dapat membantu. “Ada orang-orang itu, yang tidak berani buat menceritakan permasalahannya dengan menunjukkan dirinya begitu,” ujarnya.</p>

    <h2 class="text-xl font-bold mt-8 mb-2">Mengembalikan Kendali</h2>
    <p>Kecanduan judi online bukan hanya persoalan finansial, tapi juga bagaimana hal tersebut memicu seseorang kehilangan kendali atas diri dan pikirannya. Dorongan impulsif, tekanan sosial, dan pelarian dari stres menciptakan siklus yang sulit diputus. Pemulihan dimulai dengan kesadaran, dukungan sosial, dan ruang aman yang memungkinkan individu untuk mengekspresikan diri tanpa takut dihakimi.</p>

    <div class="note">
      Jika kamu ingin, saya bisa: membuat versi singkat untuk social card, mengonversi ke Markdown untuk CMS, menambahkan metadata (penulis, tanggal, tag), atau membuat versi bahasa Inggris.
    </div>

    <p class="muted">Sumber kutipan: wawancara dengan Danny Sanjaya Arfensia, S.Psi., M.Psi., Psikolog.</p>
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
