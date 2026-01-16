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
2. ✅ Form Partisipasi ASN (Email, Nama, NIP, OPD, Alamat, WhatsApp, Jumlah Pohon, Jenis Pohon, Lokasi Tanam)
3. ✅ Super Admin Panel dengan JWT authentication
4. ✅ Kelola OPD (CRUD) dengan Jumlah Personil
5. ✅ Kelola Partisipasi (CRUD + filtering + status management)
6. ✅ Filter Partisipasi berdasarkan OPD
7. ✅ Upload Logo Pemda
8. ✅ Edit Hero Section
9. ✅ Edit Halaman Tentang Program (Judul, Deskripsi, Visi, Misi)
10. ✅ Export PDF/Excel
11. ✅ Import Excel
12. ✅ Progress Penanaman per OPD (Target = 10 pohon × Jumlah Personil)
13. ✅ Grafik Vertikal Bar Chart untuk Kontribusi OPD

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
- **NEW** Jumlah Personil field di OPD management
- **NEW** Progress Penanaman per OPD dengan rumus: Target = 10 pohon × Personil
- **NEW** Grafik bar chart diubah menjadi vertikal di Kontribusi OPD dan Laporan

### Key API Endpoints
- `/api/opd` - CRUD OPD dengan jumlah_personil
- `/api/partisipasi` - CRUD Partisipasi
- `/api/settings` - Settings termasuk tentang page content
- `/api/stats` - Statistik keseluruhan
- `/api/progress` - Progress per OPD dengan kalkulasi target
- `/api/export/excel`, `/api/export/pdf` - Export laporan

### Progress Calculation Formula
- **Target Pohon per OPD** = Jumlah Personil × 10
- **Progress (%)** = (Pohon Tertanam / Target Pohon) × 100

### Prioritized Backlog
**P0 (Implemented):**
- Core dashboard ✅
- Form partisipasi ✅
- Admin CRUD operations ✅
- Export/Import ✅
- Filter OPD di partisipasi ✅
- Edit halaman Tentang ✅
- Jumlah Personil di OPD ✅
- Progress Penanaman ✅
- Grafik Vertikal ✅

**P1 (Future):**
- WhatsApp notification integration
- Advanced reporting with date filters
- Bulk status update for partisipasi

**P2 (Nice to have):**
- Interactive map with Leaflet
- Photo upload for partisipasi evidence
- Dashboard analytics with trends

### Test Credentials
- Admin Email: admin2@test.com
- Admin Password: admin123

### Next Tasks
1. Add date range filtering for reports
2. Test multi-step participation form end-to-end
3. WhatsApp notification integration
