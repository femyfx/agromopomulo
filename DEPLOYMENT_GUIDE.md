# 🚀 Panduan Deployment: Agro Mopomulo Dashboard
## Vercel (Frontend) + Railway (Backend) + MongoDB Atlas (Database)

---

## 📋 Daftar Isi
1. [Setup MongoDB Atlas (Database)](#1-setup-mongodb-atlas-database)
2. [Setup Railway (Backend FastAPI)](#2-setup-railway-backend-fastapi)
3. [Setup Vercel (Frontend React)](#3-setup-vercel-frontend-react)
4. [Konfigurasi Environment Variables](#4-konfigurasi-environment-variables)
5. [Testing & Troubleshooting](#5-testing--troubleshooting)

---

## 1. Setup MongoDB Atlas (Database)

### Langkah 1.1: Buat Akun MongoDB Atlas
1. Buka https://www.mongodb.com/cloud/atlas
2. Klik **"Try Free"** atau **"Start Free"**
3. Daftar dengan email atau Google account

### Langkah 1.2: Buat Cluster Gratis
1. Setelah login, klik **"Build a Database"**
2. Pilih **"M0 FREE"** (Shared cluster - GRATIS)
3. Pilih Cloud Provider: **AWS**
4. Pilih Region: **Singapore (ap-southeast-1)** - terdekat dengan Indonesia
5. Cluster Name: `agro-mopomulo` (atau nama lain)
6. Klik **"Create"**

### Langkah 1.3: Setup Database User
1. Di sidebar, klik **"Database Access"**
2. Klik **"Add New Database User"**
3. Authentication Method: **Password**
4. Username: `agro_admin`
5. Password: Buat password kuat (simpan baik-baik!)
6. Database User Privileges: **Read and write to any database**
7. Klik **"Add User"**

### Langkah 1.4: Setup Network Access
1. Di sidebar, klik **"Network Access"**
2. Klik **"Add IP Address"**
3. Klik **"Allow Access from Anywhere"** (0.0.0.0/0)
   - Ini penting agar Railway/Vercel bisa akses
4. Klik **"Confirm"**

### Langkah 1.5: Dapatkan Connection String
1. Di sidebar, klik **"Database"**
2. Klik **"Connect"** pada cluster Anda
3. Pilih **"Connect your application"**
4. Driver: **Python** | Version: **3.12 or later**
5. Copy connection string, akan terlihat seperti:
```
mongodb+srv://Bank_Data_Admin:<Cahaya123>@bdp.it0buo0.mongodb.net/?appName=BDP
```
6. **GANTI** `<password>` dengan password yang Anda buat
7. **TAMBAHKAN** nama database setelah `.net/`:
```
mongodb+srv://agro_admin:PASSWORD_ANDA@agro-mopomulo.xxxxx.mongodb.net/agro_mopomulo_db?retryWrites=true&w=majority
```

✅ **Simpan connection string ini!** Akan digunakan nanti.

---

## 2. Setup Railway (Backend FastAPI)

### Mengapa Railway?
- ✅ Gratis $5 credit/bulan (cukup untuk proyek kecil-menengah)
- ✅ Support Python/FastAPI dengan baik
- ✅ Auto-deploy dari GitHub
- ✅ Mudah setup environment variables

### Langkah 2.1: Persiapan Kode Backend

Pastikan struktur folder backend seperti ini:
```
backend/
├── server.py
├── requirements.txt
├── Procfile          ← BUAT FILE INI
└── runtime.txt       ← BUAT FILE INI (opsional)
```

**Buat file `Procfile`** (tanpa ekstensi):
```
web: uvicorn server:app --host 0.0.0.0 --port $PORT
```

**Buat file `runtime.txt`** (opsional):
```
python-3.11.0
```

### Langkah 2.2: Push ke GitHub
1. Buat repository baru di GitHub
2. Push folder `backend/` ke repository tersebut
3. Atau gunakan fitur "Save to GitHub" di Emergent

### Langkah 2.3: Setup Railway
1. Buka https://railway.app
2. Login dengan GitHub account
3. Klik **"New Project"**
4. Pilih **"Deploy from GitHub repo"**
5. Pilih repository backend Anda
6. Railway akan auto-detect sebagai Python project

### Langkah 2.4: Konfigurasi Environment Variables di Railway
1. Klik pada service yang baru dibuat
2. Pergi ke tab **"Variables"**
3. Tambahkan variabel berikut:

| Variable | Value |
|----------|-------|
| `MONGO_URL` | `mongodb+srv://agro_admin:PASSWORD@cluster.mongodb.net/agro_mopomulo_db?retryWrites=true&w=majority` |
| `DB_NAME` | `agro_mopomulo_db` |
| `JWT_SECRET_KEY` | `your-super-secret-key-change-this-in-production` |
| `CORS_ORIGINS` | `https://your-vercel-app.vercel.app` |

### Langkah 2.5: Generate Domain
1. Pergi ke tab **"Settings"**
2. Scroll ke **"Domains"**
3. Klik **"Generate Domain"**
4. Catat URL yang diberikan, contoh: `https://agro-backend-production.up.railway.app`

✅ **Simpan URL backend ini!** Akan digunakan untuk frontend.

---

## 3. Setup Vercel (Frontend React)

### Langkah 3.1: Persiapan Kode Frontend

Pastikan struktur folder frontend seperti ini:
```
frontend/
├── public/
├── src/
├── package.json
├── .env.production    ← BUAT FILE INI
└── vercel.json        ← BUAT FILE INI (opsional)
```

**Buat file `.env.production`**:
```
REACT_APP_BACKEND_URL=https://agro-backend-production.up.railway.app
```
(Ganti dengan URL Railway Anda)

**Buat file `vercel.json`** (untuk handle routing React):
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

### Langkah 3.2: Push ke GitHub
1. Buat repository baru di GitHub (atau gunakan yang sama dengan backend)
2. Push folder `frontend/` ke repository tersebut

### Langkah 3.3: Setup Vercel
1. Buka https://vercel.com
2. Login dengan GitHub account
3. Klik **"Add New..."** → **"Project"**
4. Import repository frontend Anda
5. Vercel akan auto-detect sebagai React/Create React App

### Langkah 3.4: Konfigurasi Build Settings
1. Framework Preset: **Create React App**
2. Root Directory: `frontend` (jika frontend dalam subfolder)
3. Build Command: `yarn build` atau `npm run build`
4. Output Directory: `build`

### Langkah 3.5: Environment Variables di Vercel
1. Expand **"Environment Variables"**
2. Tambahkan:

| Name | Value |
|------|-------|
| `REACT_APP_BACKEND_URL` | `https://agro-backend-production.up.railway.app` |

3. Klik **"Deploy"**

### Langkah 3.6: Dapatkan URL Produksi
Setelah deploy selesai, Anda akan mendapat URL seperti:
- `https://agro-mopomulo.vercel.app`

✅ **Update CORS di Railway!**
Kembali ke Railway dan update `CORS_ORIGINS` dengan URL Vercel Anda.

---

## 4. Konfigurasi Environment Variables

### Ringkasan Semua Environment Variables:

**Backend (Railway):**
```env
MONGO_URL=mongodb+srv://agro_admin:PASSWORD@cluster.mongodb.net/agro_mopomulo_db?retryWrites=true&w=majority
DB_NAME=agro_mopomulo_db
JWT_SECRET_KEY=ganti-dengan-secret-key-yang-kuat-minimal-32-karakter
CORS_ORIGINS=https://agro-mopomulo.vercel.app
```

**Frontend (Vercel):**
```env
REACT_APP_BACKEND_URL=https://agro-backend-production.up.railway.app
```

---

## 5. Testing & Troubleshooting

### Test Backend
```bash
# Test health endpoint
curl https://agro-backend-production.up.railway.app/api/health

# Expected response:
# {"status":"healthy","service":"Agro Mopomulo API"}
```

### Test Frontend
1. Buka URL Vercel di browser
2. Pastikan halaman tampil dengan benar
3. Coba login ke admin panel
4. Cek Console browser untuk error

### Common Issues:

**1. CORS Error**
- Pastikan `CORS_ORIGINS` di Railway sudah benar
- Pastikan URL tidak ada trailing slash

**2. Database Connection Failed**
- Cek `MONGO_URL` sudah benar
- Cek Network Access di MongoDB Atlas (allow 0.0.0.0/0)
- Cek password tidak ada karakter special yang perlu di-encode

**3. 404 on Page Refresh (Vercel)**
- Pastikan `vercel.json` sudah ada dengan rewrites config

**4. API Calls Failed**
- Cek `REACT_APP_BACKEND_URL` sudah benar
- Pastikan backend sudah running di Railway

---

## 💰 Estimasi Biaya Bulanan

| Service | Free Tier | Estimasi Biaya |
|---------|-----------|----------------|
| MongoDB Atlas | 512 MB storage | **GRATIS** |
| Railway | $5 credit/bulan | **GRATIS** (untuk traffic rendah) |
| Vercel | 100 GB bandwidth | **GRATIS** |
| **TOTAL** | | **$0/bulan** |

*Untuk proyek skala kabupaten dengan traffic rendah-menengah, kemungkinan besar GRATIS!*

---

## 📞 Support

Jika ada masalah:
1. Railway: https://docs.railway.app
2. Vercel: https://vercel.com/docs
3. MongoDB Atlas: https://docs.atlas.mongodb.com

---

## ✅ Checklist Deployment

- [ ] MongoDB Atlas cluster created
- [ ] Database user created
- [ ] Network access configured (0.0.0.0/0)
- [ ] Connection string saved
- [ ] Backend pushed to GitHub
- [ ] Railway project created
- [ ] Railway environment variables set
- [ ] Railway domain generated
- [ ] Frontend pushed to GitHub
- [ ] Vercel project created
- [ ] Vercel environment variables set
- [ ] CORS updated in Railway
- [ ] Test backend health endpoint
- [ ] Test frontend in browser
- [ ] Test admin login
- [ ] 🎉 DONE!
