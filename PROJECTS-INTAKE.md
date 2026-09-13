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

**Taruh semua file di folder `raw/`** (di root repo, bukan di dalam `public/`).
Konversi, kompresi, dan penempatan ke path akhir saya yang kerjakan lewat
`python scripts/process_raw.py` — jangan diubah ukurannya sendiri.

Folder `raw/` sengaja di luar `public/` karena apa pun di dalam `public/` ikut
ter-deploy apa adanya. File mentahnya ~16MB dan tidak perlu ikut ke produksi.
Folder ini juga di-gitignore, jadi file aslinya tetap di komputer Anda saja.

---

## 3. Cara mengambil dokumentasi

**Screenshot desktop.** Lebar browser 1440px atau 1600px. Sembunyikan bookmark
bar dan ekstensi. Ambil area konten saja, tanpa taskbar. Kalau halamannya
panjang, screenshot bagian yang paling menjelaskan produknya, bukan hanya bagian
paling atas.

**Screen recording desktop tidak dipakai.** Tidak ada komponen di situs ini yang
memutar rekaman desktop, jadi file `-desktop-rec.mp4` diabaikan. Tidak usah
direkam lagi.

**Screen recording mobile.** Rekam di HP asli, resolusi asli (1170×2532 iPhone
atau 1080×2340 Android), 6–10 detik. **Gerakkan pelan dan stabil** — kecepatan
putar dikendalikan oleh scroll pengunjung, jadi rekaman yang tersentak akan
terlihat patah-patah. Bersihkan dulu: tanpa notifikasi, baterai penuh, jam rapi.

Kalau rekamannya dimulai sebelum halaman selesai render, tidak masalah —
`process_raw.py` mendeteksi sendiri bagian yang masih blank di awal dan hanya
mengambil rentang yang benar-benar ada isinya.

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

## 5. Daftar project

Nomor `pNN` dipakai untuk penamaan file. Kolom **Media** menandai dokumentasi
yang sudah masuk dan sudah terpasang di situs.

| # | Project | URL | Media | Beranda |
|---|---|---|---|---|
| p01 | SDGs Universitas Brawijaya | internal, perlu VPN | — | |
| p02 | Brawijaya Multi Usaha | brawijayamultiusaha.co.id | ✅ | ya |
| p03 | Brawijaya Core | brawijayacore.com | ✅ | ya |
| p04 | Smart Test by Brawijaya Core | test.brawijayacore.com | ✅ | ya |
| p05 | Brawijaya Catering | menyusul | — | |
| p06 | Brawijaya Tour and Travel | brawijayatourandtravel.com | — | |
| p07 | Depo Agro | depoagro.id | — | |
| p08 | Feedback BMU | feedback.brawijayamultiusaha.co.id | — | |
| p09 | Due Diligence Form BMU | legal.brawijayamultiusaha.co.id | — | |
| p10 | CoE CBSA | stg-coecbsa.vercel.app (staging) | — | |
| p11 | Kembara.id | stg-kembara.vercel.app (staging) | — | |
| p12 | Saku Mini Wallet | stg-saku.vercel.app (staging) | — | |
| p13 | DibiEdu LMS | dibiedu-lms.vercel.app | — | |

Yang tampil di beranda ditentukan oleh field `featured` di `cases.ts`, bukan
urutan. Sekarang p02–p04 karena hanya itu yang medianya sudah ada.

### Teks masih kosong untuk SEMUA project

Nama, nomor dan URL sudah asli. Tapi deskripsi, peran, waktu, stack, dan empat
bagian cerita (masalah / yang dibangun / bagian tersulit / hasil) semuanya masih
bertanda `TODO — belum diisi`.

Itu disengaja. Ini project klien sungguhan, jadi menuliskan cerita karangan yang
terdengar masuk akal tentang Brawijaya Multi Usaha atau Depo Agro jauh lebih
berbahaya daripada meninggalkan kolom kosong yang jelas terlihat kosong. Tidak
ada satu kalimat pun yang saya karang.

### Kredensial demo tidak saya simpan

Login demo untuk p12 yang Anda kirim **tidak** saya masukkan ke dalam kode.
Repository ini publik — apa pun yang di-commit ikut terpublikasi. Kalau login
demo itu memang boleh dilihat umum, beri tahu saya dan akan saya tampilkan di
halaman detailnya; kalau tidak, biarkan seperti sekarang.

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
