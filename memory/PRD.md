# Dashboard Digital Program Agro Mopomulo
## Kabupaten Gorontalo Utara

### Problem Statement
Membangun aplikasi web dashboard profesional bergaya e-Government / Smart City untuk program "Agro Mopomulo" (Satu Orang Sepuluh Pohon) di Kabupaten Gorontalo Utara.

### Architecture
- **Frontend**: React + TailwindCSS + Shadcn UI + Framer Motion + Recharts
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Authentication**: JWT-based

### User Personas
1. **Public User (ASN)**: ASN yang ingin berpartisipasi dalam program penanaman pohon
2. **Super Admin (Pemda)**: Admin yang mengelola OPD, partisipasi, dan pengaturan dashboard

### Core Requirements
1. ✅ Dashboard dengan statistik pohon
2. ✅ Form Partisipasi ASN dengan dropdown kategori (OPD/Desa/Publik)
3. ✅ Super Admin Panel dengan JWT authentication
4. ✅ Kelola OPD dengan Kategori (OPD, DESA, PUBLIK) dan Jumlah Personil
5. ✅ Kelola Partisipasi dengan kolom Cek Lokasi (link ke Google Maps)
6. ✅ Filter Partisipasi berdasarkan OPD
7. ✅ Upload Logo Pemda
8. ✅ Edit Hero Section
9. ✅ Edit Halaman Tentang Program (Judul, Deskripsi, Visi, Misi)
10. ✅ Export PDF/Excel
11. ✅ Import Excel
12. ✅ Progress Penanaman per OPD (Target = 10 pohon × Jumlah Personil)
13. ✅ Grafik Vertikal Bar Chart untuk Kontribusi OPD
14. ✅ Dropdown Kategori di Form Partisipasi (OPD/Desa/Publik)
15. ✅ Input Koordinat Manual (Latitude & Longitude terpisah)
16. ✅ Tombol "Pilih Lokasi Saat Ini" untuk GPS otomatis
17. ✅ Preview koordinat dengan link "Lihat di Maps"
18. ✅ Kolom "Cek Lokasi" di Kelola Partisipasi (link ke Google Maps)
19. ✅ **NEW** Menu Kelola Agenda di Admin Panel (CRUD lengkap)
20. ✅ **NEW** Menu Kelola Berita di Admin Panel (CRUD lengkap)
21. ✅ **NEW** News Popup di halaman publik dengan interval konfigurasi
22. ✅ **NEW** Section Agenda Penanaman di HomePage
23. ✅ **NEW** Section Berita Terbaru di HomePage

### What's Been Implemented (January 2026)
- Full-stack e-Government dashboard
- 8 public pages: Beranda, Tentang, Kontribusi OPD, Peta Penanaman, Laporan, Galeri, Edukasi, Partisipasi
- Admin panel with 9 sections: Dashboard, Kelola OPD, Kelola Partisipasi, Laporan, Kelola Galeri, Kelola Edukasi, **Kelola Agenda**, **Kelola Berita**, Pengaturan
- JWT authentication system
- All CRUD operations for OPD, Partisipasi, Galeri, Edukasi, **Agenda, Berita**
- Settings management (logo upload, hero section, tentang page content, **berita popup interval**)
- Export PDF/Excel dan Import Excel functionality
- Real-time statistics dashboard
- Responsive design with professional e-Government styling
- Kolom "Cek Lokasi" di tabel Kelola Partisipasi
- **NEW (28 Jan 2026):** Fitur Agenda & Berita lengkap dengan popup

### Admin Kelola Agenda
**Fitur:**
- Tambah/Edit/Hapus agenda kegiatan penanaman
- Input: Nama Kegiatan, Hari, Tanggal, Kecamatan, Desa, Deskripsi
- Status: Akan Datang, Berlangsung, Selesai
- Card view dengan status badge

### Admin Kelola Berita
**Fitur:**
- Tambah/Edit/Hapus berita
- Input: Judul, Deskripsi Singkat, Isi Berita, Gambar (URL atau Upload)
- Toggle Aktif/Nonaktif berita
- Pengaturan Interval Popup Berita (dalam detik)
- Card view dengan gambar preview

### News Popup (HomePage)
- Muncul otomatis setelah 2 detik halaman dimuat
- Menampilkan berita aktif secara bergantian sesuai interval
- Tombol "Baca Selengkapnya" untuk membuka modal detail
- Tombol "Tutup semua notifikasi" untuk dismiss

### Key API Endpoints
- `/api/opd` - CRUD OPD dengan jumlah_personil dan kategori
- `/api/partisipasi` - CRUD Partisipasi
- `/api/settings` - Settings termasuk berita_popup_interval
- `/api/stats` - Statistik keseluruhan
- `/api/progress` - Progress per OPD dengan kalkulasi target
- `/api/export/excel`, `/api/export/pdf` - Export laporan
- **`/api/agenda`** - CRUD Agenda kegiatan
- **`/api/agenda/upcoming`** - Agenda yang akan datang/berlangsung
- **`/api/berita`** - CRUD Berita
- **`/api/berita/active`** - Berita yang aktif saja

### Prioritized Backlog
**P0 (Implemented):**
- All core features ✅
- Agenda & Berita features ✅

**P1 (Upcoming):**
- Import Data Partisipasi dari Excel
- Filter Laporan berdasarkan rentang tanggal
- Interactive map with Leaflet

**P2 (Nice to have):**
- WhatsApp notification integration
- Photo upload for partisipasi evidence
- Dashboard analytics with trends

### Test Credentials
- Admin Email: admin@gorontaloutara.go.id
- Admin Password: Admin123!

### Next Tasks
1. Import data partisipasi dari Excel
2. Add date range filtering for reports
3. Interactive map with Leaflet showing all planting locations
