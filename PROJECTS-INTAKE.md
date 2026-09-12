# Formulir Isian Project & Dokumentasi

Dokumen ini dipakai untuk mengisi project asli ke dalam situs. Isi bagian teks,
kumpulkan file sesuai aturan penamaan, lalu kirimkan — semuanya langsung terbaca
tanpa perlu penjelasan tambahan.

Nomor `p01`–`p09` di bawah mengacu ke field `number` di `src/data/cases.ts`.
Boleh ditambah `p10`, `p11`, dan seterusnya — halaman Work otomatis membuat
halaman pagination baru setiap kelipatan 4.

---

## 1. Kebutuhan dokumentasi per project

| Media | Jumlah | Tampilan | Rasio / ukuran | Dipakai di |
|---|---|---|---|---|
| Logo project | **1** | — | persegi, latar transparan, ≥256px | baris di halaman Work |
| Preview hover | **1** | Desktop | 3:2 landscape, ≥1200px lebar | panel melayang yang mengikuti cursor |
| Screenshot detail | **2–3** | Desktop | 16:10 landscape, ≥1440px lebar | halaman detail project |
| Screen recording | **1** | Mobile | 9:19.5 potrait, 6–10 detik | mockup HP di halaman utama |

**Screen recording hanya untuk 3 project unggulan.** Hanya tiga project teratas
yang tampil di halaman utama dengan mockup HP, jadi enam project sisanya tidak
perlu direkam sama sekali.

### Kebutuhan tambahan, sekali saja untuk seluruh situs

| Media | Jumlah | Tampilan | Rasio | Dipakai di |
|---|---|---|---|---|
| Layar HP untuk hero | **10** | Mobile | 9:19.5 potrait | deretan HP melengkung di hero |

Boleh diambil dari project mana pun, termasuk mengulang project yang sama dengan
layar berbeda. Yang penting variatif secara visual, karena tampil berdampingan.

### Total keseluruhan (9 project)

- 9 logo
- 9 screenshot desktop untuk preview hover
- 18–27 screenshot desktop untuk halaman detail
- 3 screen recording mobile
- 10 screenshot mobile untuk hero

---

## 2. Aturan penamaan file

Format: `p<nomor>-<jenis>[-<urutan>].<ext>`

```
p01-logo.png              logo project 01
p01-preview.png           screenshot desktop untuk panel hover
p01-desktop-01.png        screenshot desktop halaman detail, urutan 1
p01-desktop-02.png        urutan 2
p01-desktop-03.png        urutan 3 (opsional)
p01-mobile-rec.mp4        screen recording mobile (hanya project unggulan)

arc-01.png … arc-10.png   10 layar HP untuk hero
```

Aturannya:

- Nomor selalu **dua digit**: `p01`, bukan `p1`. Supaya urutannya benar saat disortir.
- Urutan screenshot juga dua digit: `-01`, `-02`.
- Ekstensi bebas: `.png`, `.jpg`, `.webp`. Video `.mp4` atau `.mov`.
- Huruf kecil semua, pemisah tanda hubung, tanpa spasi.

**Taruh semua file di folder `public/raw/`.** Konversi, kompresi, dan penempatan
ke path akhir saya yang kerjakan — jangan diubah ukurannya sendiri.

---

## 3. Cara mengambil dokumentasi

**Screenshot desktop.** Lebar browser 1440px atau 1600px. Sembunyikan bookmark
bar dan ekstensi. Ambil area konten saja, tanpa taskbar. Kalau halamannya
panjang, screenshot bagian yang paling menjelaskan produknya, bukan hanya bagian
paling atas.

**Screen recording mobile.** Rekam di HP asli, resolusi asli (1170×2532 iPhone
atau 1080×2340 Android), 6–10 detik. **Gerakkan pelan dan stabil** — kecepatan
putar dikendalikan oleh scroll pengunjung, jadi rekaman yang tersentak akan
terlihat patah-patah. Bersihkan dulu: tanpa notifikasi, baterai penuh, jam rapi.

**Logo project.** Kalau tidak punya, kosongkan saja — saya buatkan monogram dari
inisial nama project.

---

## 4. Formulir isian project

Salin blok di bawah untuk setiap project, lalu isi. Bagian yang paling menentukan
kualitas halaman detail adalah **BAGIAN TERSULIT** — itu yang benar-benar dibaca
oleh reviewer teknis.

```
### p01
Nama project        :
Slug URL            :   (huruf kecil, tanda hubung, contoh: sistem-informasi-lph)
Deskripsi 1 kalimat :
Tag (2–3)           :   contoh: #FULLSTACK #REALTIME
Peran saya          :
Waktu pengerjaan    :   contoh: 3 bulan · 2025
Stack               :   contoh: Next.js, Express.js, PostgreSQL
URL live            :   (kosongkan kalau tidak publik)
URL repo            :   (kosongkan kalau privat)
Tampil di beranda   :   ya / tidak      (maksimal 3 yang "ya")

MASALAHNYA          :
   2–4 kalimat. Kondisi sebelum project ini ada, dan kenapa itu merugikan.

YANG SAYA BANGUN    :
   3–5 kalimat. Apa yang dibuat dan keputusan bentuknya.

BAGIAN TERSULIT     :
   Satu masalah teknis yang Anda banggakan. Ceritakan kenapa sulit dan
   bagaimana Anda menyelesaikannya. Ini bagian terpenting.

HASILNYA            :
   Angka kalau ada — jumlah pengguna, waktu yang dihemat, kecepatan,
   penurunan error. Kalau tidak ada angka, tulis perubahan nyatanya.
```

---

## 5. Daftar project saat ini

Semua isi di bawah masih **placeholder karangan** dan harus diganti. Nomor `pNN`
dipakai untuk penamaan file.

| # | Slug sekarang | Judul placeholder | Beranda |
|---|---|---|---|
| p01 | `realtime-order-dashboard` | Realtime order dashboard | ya |
| p02 | `field-survey-offline` | Offline-first field survey | ya |
| p03 | `component-library` | Design system and component library | ya |
| p04 | `invoice-automation` | Invoice automation service | tidak |
| p05 | `booking-platform` | Multi-tenant booking platform | tidak |
| p06 | `analytics-pipeline` | Event analytics pipeline | tidak |
| p07 | `design-tokens-cli` | Design token CLI | tidak |
| p08 | `inventory-sync` | Inventory sync bridge | tidak |
| p09 | `docs-search` | Documentation search | tidak |

Slug boleh diganti sesuai project asli. Kalau diganti, URL detailnya ikut berubah
menjadi `dannzone.site/case/<slug-baru>`.

---

## 6. Kalau belum sempat semuanya

Urutan prioritas, supaya situs tetap terlihat utuh meski dokumentasinya belum
lengkap:

1. **Teks untuk p01–p03.** Placeholder teks paling cepat ketahuan palsu.
2. **9 screenshot preview hover.** Satu per project, paling terasa efeknya.
3. **10 layar HP untuk hero.** Hero adalah hal pertama yang dilihat orang.
4. **Screenshot detail** untuk project yang dibuka orang.
5. **3 screen recording.** Paling repot, paling terakhir.

Kirim sebagian dulu juga tidak masalah — saya pasang yang sudah ada, sisanya
tetap memakai placeholder sampai filenya datang.
