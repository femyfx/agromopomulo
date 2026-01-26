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
5. ✅ Kelola Partisipasi (CRUD + filtering + status management)
6. ✅ Filter Partisipasi berdasarkan OPD
7. ✅ Upload Logo Pemda
8. ✅ Edit Hero Section
9. ✅ Edit Halaman Tentang Program (Judul, Deskripsi, Visi, Misi)
10. ✅ Export PDF/Excel
11. ✅ Import Excel
12. ✅ Progress Penanaman per OPD (Target = 10 pohon × Jumlah Personil)
13. ✅ Grafik Vertikal Bar Chart untuk Kontribusi OPD
14. ✅ Dropdown Kategori di Form Partisipasi (OPD/Desa/Publik)
15. ✅ **NEW** Input Koordinat Manual (Latitude & Longitude terpisah)
16. ✅ **NEW** Tombol "Pilih Lokasi Saat Ini" untuk GPS otomatis
17. ✅ **NEW** Preview koordinat dengan link "Lihat di Maps"

### What's Been Implemented (January 2026)
- Full-stack e-Government dashboard
- 8 public pages: Beranda, Tentang, Kontribusi OPD, Peta Penanaman, Laporan, Galeri, Edukasi, Partisipasi
- Admin panel with 6 sections: Dashboard, Kelola OPD, Kelola Partisipasi, Kelola Galeri, Kelola Edukasi, Pengaturan
- JWT authentication system
- All CRUD operations for OPD, Partisipasi, Galeri, Edukasi
- Settings management (logo upload, hero section, tentang page content)
- Export PDF/Excel dan Import Excel functionality
- Real-time statistics dashboard
- Responsive design with professional e-Government styling
- **NEW** Input koordinat dengan Latitude & Longitude terpisah
- **NEW** Tombol untuk mendapatkan lokasi GPS otomatis dari browser
- **NEW** Preview koordinat dengan link ke Google Maps

### Koordinat GPS Feature
- **Input Manual**: Latitude dan Longitude dalam field terpisah
- **Lokasi Otomatis**: Tombol "Pilih Lokasi Saat Ini" menggunakan Browser Geolocation API
- **Preview**: Menampilkan koordinat gabungan dengan link ke Google Maps
- **Validasi**: Menerima format desimal (contoh: 0.8424, 122.7891)

### Key API Endpoints
- `/api/opd` - CRUD OPD dengan jumlah_personil dan kategori
- `/api/partisipasi` - CRUD Partisipasi (titik_lokasi = latitude + longitude)
- `/api/settings` - Settings termasuk tentang page content
- `/api/stats` - Statistik keseluruhan
- `/api/progress` - Progress per OPD dengan kalkulasi target
- `/api/export/excel`, `/api/export/pdf` - Export laporan

### Prioritized Backlog
**P0 (Implemented):**
- All core features ✅

**P1 (Future):**
- WhatsApp notification integration
- Advanced reporting with date filters
- Bulk status update for partisipasi
- Interactive map with Leaflet

**P2 (Nice to have):**
- Photo upload for partisipasi evidence
- Dashboard analytics with trends

### Test Credentials
- Admin Email: admin2@test.com
- Admin Password: admin123

### Next Tasks
1. Add date range filtering for reports
2. WhatsApp notification integration
3. Interactive map with Leaflet showing all planting locations
