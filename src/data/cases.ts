/* ─────────────────────────────────────────────────────────────
   PROJECTS — the single source of truth.

   The home stack, the Work list, the routes, the prev/next nav and
   the detail pages all read from this array.

   Names, numbering, URLs, roles, timelines, stacks and tags are the
   author's own. The prose (blurb, problem, built, hardPart, outcome)
   is written from those facts plus each live site; it invents no
   metric or claim. p01 (VPN), p05 and p08 (staging offline) could not
   be viewed — their copy is written from the brief and is worth a
   second read. Media for p01/p05/p08 is still a placeholder.
   ───────────────────────────────────────────────────────────── */

export type Case = {
  slug: string
  number: string
  title: string
  blurb: string
  tags: string[]
  role: string
  timeline: string
  stack: string[]
  liveUrl?: string
  repoUrl?: string
  /** Shown on the home page — a curated few, media complete. */
  featured?: boolean
  /** Drives the per-project accent. */
  ink: string
  problem: string
  built: string
  /** The one technical decision worth defending in a review. */
  hardPart: string
  outcome: string
  /** Frame sequence for the scroll-scrubbed phone (featured only). */
  frames: { dir: string; count: number }
  /** Detail-page screenshots. */
  shots: string[]
  /** Small mark shown in place of a "Project NN" label on the Work page. */
  logo: string
  /** Desktop screenshot that follows the cursor on hover. */
  preview: string
}

const media = (n: string, shots = 2) => ({
  logo: `/projects/logo-${n}.webp`,
  preview: `/projects/preview-${n}.webp`,
  frames: { dir: `/frames/case${n}`, count: 48 },
  shots: Array.from(
    { length: shots },
    (_, i) => `/projects/shot-${n}-${String(i + 1).padStart(2, '0')}.webp`,
  ),
})

export const cases: Case[] = [
  {
    slug: "sdgs-universitas-brawijaya",
    number: "01",
    title: "SDGs Universitas Brawijaya",
    blurb: "Dasbor pemantauan capaian SDGs internal Universitas Brawijaya dengan akses berjenjang per peran.",
    tags: ["#WEB", "#DASHBOARD", "#RBAC"],
    role: "UI/UX Designer",
    timeline: "2026 · 4 bulan",
    stack: ["Figma", "Shadcn"],
    // Internal, reachable only over VPN.
    liveUrl: undefined,
    ink: "#252f4c",
    problem: "Universitas mengumpulkan capaian SDGs dari banyak unit, tetapi datanya tersebar dan sulit dipantau dalam satu tampilan yang bisa dibaca pimpinan maupun operator.",
    built: "Rancangan antarmuka dasbor dengan hak akses berbeda tiap peran: operator unit mengisi data, pimpinan memantau ringkasannya. Alur dan komponen disusun di Figma lalu ditata dengan Shadcn.",
    hardPart: "Menyeimbangkan satu tampilan untuk dua jenis pengguna yang kebutuhannya berbeda — yang mengisi data dan yang membacanya — tanpa membuat salah satunya kelebihan atau kekurangan konteks.",
    outcome: "Tim punya satu rujukan visual capaian SDGs; peran menentukan apa yang bisa dilihat dan diubah.",
    ...media("01"),
  },
  {
    slug: "brawijaya-multi-usaha",
    number: "02",
    title: "Brawijaya Multi Usaha",
    blurb: "Profil perusahaan induk Brawijaya Multi Usaha yang memayungi banyak unit bisnis dalam satu halaman.",
    tags: ["#WEB", "#LANDINGPAGE", "#PROFILING"],
    role: "UI/UX Designer",
    timeline: "2026 · 4 bulan",
    stack: ["Figma", "Shadcn"],
    liveUrl: "https://brawijayamultiusaha.co.id/",
    featured: true,
    ink: "#252f4c",
    problem: "Brawijaya Multi Usaha menaungi beragam unit usaha, tetapi belum ada satu wajah resmi yang menjelaskan grup ini dan mengarahkan pengunjung ke tiap unitnya.",
    built: "Desain landing page company profile: narasi grup di atas, lalu unit-unit usaha sebagai pintu masuk. Struktur dan komponen dirancang di Figma dengan sistem Shadcn.",
    hardPart: "Menampung banyak unit dengan identitas berbeda dalam satu halaman tanpa membuatnya terasa seperti daftar yang datar — tiap unit harus terasa punya tempat.",
    outcome: "Grup punya satu halaman resmi yang menjelaskan dirinya dan menautkan pengunjung ke tiap unit usaha.",
    ...media("02"),
  },
  {
    slug: "brawijaya-core",
    number: "03",
    title: "Brawijaya Core",
    blurb: "Situs perusahaan Brawijaya Core dengan panel admin agar kontennya dikelola tanpa developer.",
    tags: ["#WEB", "#LANDINGPAGE", "#PROFILING"],
    role: "Full-stack Developer",
    timeline: "2025 · 2 bulan",
    stack: ["Laravel", "TypeScript", "Tailwind", "MySQL", "Filament", "Shadcn"],
    liveUrl: "https://www.brawijayacore.com/",
    featured: true,
    ink: "#545441",
    problem: "Brawijaya Core butuh situs profil yang isinya bisa diperbarui sendiri oleh tim, bukan halaman statis yang setiap perubahannya harus lewat developer.",
    built: "Situs dibangun penuh dengan Laravel dan MySQL, dengan panel admin Filament sehingga tim bisa menyunting konten. Tampilan depan memakai Tailwind dan Shadcn.",
    hardPart: "Memberi panel admin yang cukup fleksibel untuk tim non-teknis tanpa membuka celah yang bisa merusak tampilan halaman depan.",
    outcome: "Tim memperbarui konten situs sendiri lewat panel admin, tanpa menunggu developer.",
    ...media("03"),
  },
  {
    slug: "smart-test-brawijaya-core",
    number: "04",
    title: "Smart Test by Brawijaya Core",
    blurb: "Aplikasi ujian daring Brawijaya Core untuk mengerjakan tes dan melihat hasilnya dalam satu dasbor.",
    tags: ["#WEBAPP", "#LMS", "#DASHBOARD"],
    role: "UI/UX Designer, Frontend Developer",
    timeline: "2026 · 2 bulan",
    stack: ["Figma", "Next.js", "TypeScript", "Tailwind", "Shadcn"],
    liveUrl: "https://test.brawijayacore.com/",
    featured: true,
    ink: "#3a3f52",
    problem: "Proses tes yang manual menyulitkan peserta mengerjakan dan penyelenggara memantau hasil secara langsung.",
    built: "Merancang lalu membangun antarmuka ujian: peserta mengerjakan soal, penyelenggara melihat hasil di dasbor. Desain di Figma, diimplementasi dengan Next.js dan Shadcn.",
    hardPart: "Menjaga alur ujian tetap jelas dan tenang saat dipakai — status soal, waktu, dan pengiriman jawaban harus selalu terbaca tanpa membuat peserta ragu.",
    outcome: "Tes dikerjakan daring dan hasilnya langsung terlihat di satu dasbor.",
    ...media("04"),
  },
  {
    slug: "brawijaya-catering",
    number: "05",
    title: "Brawijaya Catering",
    blurb: "Landing dan katalog menu Brawijaya Catering, dari paket harian sampai pesanan acara.",
    tags: ["#WEB", "#LANDINGPAGE", "#CATALOG"],
    role: "UI/UX Designer, Frontend Developer",
    timeline: "2026 · 2 bulan",
    stack: ["Figma", "Next.js", "TypeScript", "Tailwind", "Shadcn", "GSAP"],
    // Staging offline (404 saat ditulis).
    liveUrl: undefined,
    ink: "#4a4a3a",
    problem: "Layanan katering butuh etalase yang menunjukkan paket dan menu dengan jelas, tidak sekadar daftar harga di pesan singkat.",
    built: "Landing page dengan katalog menu dan paket, dirancang di Figma lalu dibangun dengan Next.js. Gerak halus antar bagian memakai GSAP.",
    hardPart: "Menyajikan banyak pilihan menu tanpa membuat halaman terasa penuh — animasi harus membantu keterbacaan, bukan menutupinya.",
    outcome: "Calon pelanggan bisa menelusuri paket dan menu di satu halaman sebelum memesan.",
    ...media("05"),
  },
  {
    slug: "brawijaya-tour-and-travel",
    number: "06",
    title: "Brawijaya Tour and Travel",
    blurb: "Landing Brawijaya Tour and Travel dengan katalog paket wisata yang bisa ditelusuri.",
    tags: ["#WEB", "#LANDINGPAGE", "#CATALOG"],
    role: "UI/UX Designer, Frontend Developer",
    timeline: "2025 · 2 bulan",
    stack: ["Figma", "Next.js", "TypeScript", "Tailwind", "Shadcn", "GSAP"],
    liveUrl: "https://www.brawijayatourandtravel.com/",
    ink: "#3a4258",
    problem: "Paket wisata perlu dipajang secara menarik dan mudah dibandingkan, bukan hanya diinfokan lewat brosur.",
    built: "Landing page dengan katalog paket perjalanan, dirancang di Figma dan dibangun dengan Next.js serta gerak GSAP untuk kesan hidup.",
    hardPart: "Membuat setiap paket wisata terasa mengundang lewat gambar dan gerak, sambil menjaga halaman tetap cepat dibuka.",
    outcome: "Paket wisata tampil di satu etalase yang bisa ditelusuri calon pelanggan.",
    ...media("06"),
  },
  {
    slug: "depo-agro",
    number: "07",
    title: "Depo Agro",
    blurb: "Etalase Depo Agro — katalog kebutuhan pertanian dari benih sampai alat, tertata rapi.",
    tags: ["#WEB", "#LANDINGPAGE", "#CATALOG"],
    role: "UI/UX Designer, Frontend Developer",
    timeline: "2025 · 2 bulan",
    stack: ["Figma", "Next.js", "TypeScript", "Tailwind", "Shadcn"],
    liveUrl: "https://www.depoagro.id/",
    ink: "#3f4a3a",
    problem: "Beragam produk pertanian sulit ditampilkan dengan rapi sehingga pengunjung cepat menemukan yang dicari.",
    built: "Landing dengan katalog produk berkategori, dirancang di Figma dan dibangun dengan Next.js serta Shadcn.",
    hardPart: "Menata banyak jenis produk agar tetap mudah dijelajah — pengelompokan dan hierarki harus terbaca sejak layar pertama.",
    outcome: "Produk Depo Agro tampil terkategori dan mudah ditelusuri di satu etalase.",
    ...media("07"),
  },
  {
    slug: "assets-bmu",
    number: "08",
    title: "Assets BMU",
    blurb: "Aplikasi internal pencatatan dan pengelolaan aset Brawijaya Multi Usaha.",
    tags: ["#WEB", "#ASSETMANAGEMENT", "#DASHBOARD"],
    role: "Backend & Frontend Developer",
    timeline: "2026 · 2 bulan",
    stack: ["Express.js", "Next.js", "PostgreSQL", "Prisma", "TypeScript", "Tailwind", "Shadcn"],
    // Staging offline (404 saat ditulis).
    liveUrl: undefined,
    ink: "#54543f",
    problem: "Aset perusahaan yang tersebar sulit dilacak keberadaan dan kondisinya tanpa satu sistem pencatatan.",
    built: "Aplikasi pencatatan aset: API dengan Express dan PostgreSQL lewat Prisma, antarmuka dasbor dengan Next.js dan Shadcn.",
    hardPart: "Menjaga catatan aset tetap konsisten saat banyak data masuk — skema dan relasi harus rapi agar riwayat tiap aset tidak kabur.",
    outcome: "Aset tercatat di satu tempat, lengkap dengan kondisi dan riwayatnya.",
    ...media("08"),
  },
  {
    slug: "feedback-bmu",
    number: "09",
    title: "Feedback BMU",
    blurb: "Kanal masukan Brawijaya Multi Usaha — formulir publik plus dasbor untuk menindaklanjuti.",
    tags: ["#WEB", "#FORM", "#DASHBOARD"],
    role: "UI/UX Designer, Frontend Developer",
    timeline: "2025 · 1 bulan",
    stack: ["Figma", "Next.js", "TypeScript", "Tailwind", "Shadcn"],
    liveUrl: "https://feedback.brawijayamultiusaha.co.id/",
    ink: "#2b3450",
    problem: "Masukan dari publik dan mitra datang lewat banyak jalur dan sulit dikumpulkan serta ditindaklanjuti secara rapi.",
    built: "Formulir masukan publik yang ringkas, ditambah dasbor internal untuk membaca dan memilah kiriman. Desain di Figma, dibangun dengan Next.js.",
    hardPart: "Membuat formulir yang cukup singkat agar orang mau mengisi, tetapi tetap menangkap konteks yang cukup untuk ditindaklanjuti tim.",
    outcome: "Masukan masuk lewat satu kanal dan tim meninjaunya dari satu dasbor.",
    ...media("09"),
  },
  {
    slug: "due-diligence-form-bmu",
    number: "10",
    title: "Due Diligence Form BMU",
    blurb: "Formulir uji tuntas (due diligence) legal BMU dengan dasbor peninjauan berkas.",
    tags: ["#WEB", "#FORM", "#DASHBOARD"],
    role: "UI/UX Designer, Frontend Developer",
    timeline: "2025 · 1 bulan",
    stack: ["Figma", "Next.js", "TypeScript", "Tailwind", "Shadcn"],
    liveUrl: "https://legal.brawijayamultiusaha.co.id/",
    ink: "#2b3450",
    problem: "Proses uji tuntas legal butuh pengumpulan data dan dokumen yang terstruktur, bukan berkas yang berserak lewat surel.",
    built: "Formulir uji tuntas bertahap dengan unggah dokumen, ditambah dasbor untuk meninjau kiriman. Dirancang di Figma dan dibangun dengan Next.js.",
    hardPart: "Memecah formulir panjang menjadi tahap yang tidak melelahkan sambil menjaga kelengkapan data yang wajib untuk keperluan legal.",
    outcome: "Data uji tuntas terkumpul terstruktur dan bisa ditinjau dari satu dasbor.",
    ...media("10"),
  },
  {
    slug: "coe-cbsa",
    number: "11",
    title: "CoE CBSA",
    blurb: "Situs pusat unggulan agroindustri berkelanjutan berbasis masyarakat, Universitas Brawijaya.",
    tags: ["#WEB", "#LANDINGPAGE", "#CMS"],
    role: "Full-stack Developer",
    timeline: "2026 · 4 bulan",
    stack: ["Figma", "Laravel", "TypeScript", "Tailwind", "MySQL", "Shadcn", "GSAP"],
    liveUrl: "https://stg-coecbsa.vercel.app/",
    ink: "#2f3a5c",
    problem: "Pusat unggulan ini menggabungkan riset, teknologi, dan pemberdayaan masyarakat, tetapi belum punya satu wadah yang menyampaikan program dan kolaborasinya.",
    built: "Situs company profile plus CMS: konten dikelola lewat Laravel dan MySQL, tampilan depan memakai Tailwind dan gerak GSAP. Arah desain disiapkan di Figma.",
    hardPart: "Menyusun banyak jenis konten program agar mudah dikelola tim sekaligus tetap terbaca sebagai satu narasi utuh di halaman depan.",
    outcome: "Pusat unggulan punya satu situs yang menjelaskan program dan mengundang kolaborasi, dengan konten yang dikelola sendiri.",
    ...media("11"),
  },
  {
    slug: "kembara-id",
    number: "12",
    title: "Kembara.id",
    blurb: "Kembara.id — sewa perlengkapan gunung dengan pembayaran otomatis, dari tenda sampai carrier.",
    tags: ["#WEBAPP", "#PRODUCT", "#B2C"],
    role: "Full-stack Developer",
    timeline: "2026 · 2 bulan",
    stack: ["Laravel", "Next.js", "TypeScript", "Tailwind", "MySQL", "Shadcn", "GSAP", "Render", "Vercel", "Midtrans"],
    liveUrl: "https://stg-kembara.vercel.app/",
    featured: true,
    ink: "#3a4258",
    problem: "Menyewa perlengkapan gunung biasanya masih manual: cek ketersediaan lewat chat, bayar terpisah, dan tidak ada satu tempat memesan.",
    built: "Produk sendiri: katalog sewa alat dengan pemesanan dan pembayaran otomatis lewat Midtrans. Backend Laravel di Render, front-end Next.js di Vercel.",
    hardPart: "Menjaga ketersediaan alat tetap akurat saat pesanan dan pembayaran berjalan bersamaan — status barang harus benar sebelum uang berpindah.",
    outcome: "Penyewaan bisa dipesan dan dibayar otomatis di satu tempat, tanpa bolak-balik chat.",
    ...media("12"),
  },
  {
    slug: "saku-mini-wallet",
    number: "13",
    title: "Saku Mini Wallet",
    blurb: "Saku Mini Wallet — saldo, arus uang, dan aktivitas dompet dalam satu ringkasan.",
    tags: ["#WEBAPP", "#PRODUCT", "#FINTECH"],
    role: "Full-stack Developer",
    timeline: "2026 · 2 bulan",
    stack: ["Laravel", "Next.js", "TypeScript", "Tailwind", "MySQL", "Shadcn", "GSAP", "Render", "Vercel"],
    liveUrl: "https://stg-saku.vercel.app/",
    ink: "#4a4a3a",
    problem: "Mencatat uang masuk-keluar di dompet kecil sering berantakan tanpa satu ringkasan yang jelas.",
    built: "Dompet mini oleh Kembara.id: saldo, arus uang, dan aktivitas terbaru dalam satu halaman. Backend Laravel di Render, front-end Next.js di Vercel.",
    hardPart: "Menampilkan uang secara akurat: setiap saldo dan mutasi harus konsisten dan tidak pernah menyesatkan, sekecil apa pun angkanya.",
    outcome: "Pengguna melihat saldo, arus uang, dan aktivitas terbarunya dalam satu ringkasan.",
    ...media("13", 3),
  },
  {
    slug: "dibiedu-lms",
    number: "14",
    title: "DibiEdu LMS",
    blurb: "DibiEdu — LMS untuk kelas bootcamp: materi, kursus, dan dasbor peserta.",
    tags: ["#WEBAPP", "#LMS", "#DASHBOARD"],
    role: "Full-stack Developer",
    timeline: "2026 · 2 bulan",
    stack: ["Laravel", "Next.js", "TypeScript", "Tailwind", "MySQL", "Shadcn", "GSAP", "Render", "Vercel"],
    liveUrl: "https://dibiedu-lms.vercel.app/",
    ink: "#63593f",
    problem: "Kelas bootcamp butuh satu tempat untuk materi, kursus, dan pemantauan peserta, bukan berkas yang tersebar.",
    built: "LMS lengkap: daftar kursus, materi, dan dasbor peserta. Backend Laravel di Render, front-end Next.js di Vercel.",
    hardPart: "Menyusun materi dan progres peserta agar tetap jelas saat jumlah kursus bertambah — navigasi tidak boleh ikut rumit.",
    outcome: "Materi, kursus, dan progres peserta bootcamp berada di satu tempat.",
    ...media("14", 4),
  },
]

/** The home page stack — the curated, media-complete few. */
export const featured = cases.filter((c) => c.featured)

export const getCase = (slug?: string) => cases.find((c) => c.slug === slug)

export const caseNeighbours = (slug: string) => {
  const i = cases.findIndex((c) => c.slug === slug)
  if (i === -1) return { prev: undefined, next: undefined }
  return {
    prev: i > 0 ? cases[i - 1] : cases[cases.length - 1],
    next: i < cases.length - 1 ? cases[i + 1] : cases[0],
  }
}
