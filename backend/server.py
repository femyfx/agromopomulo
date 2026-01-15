from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi.responses import StreamingResponse
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
import io
from openpyxl import Workbook, load_workbook
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.units import inch
import base64

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Config
JWT_SECRET = os.environ.get('JWT_SECRET')
if not JWT_SECRET:
    raise ValueError("JWT_SECRET environment variable is required")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

app = FastAPI(title="Dashboard Agro Mopomulo API")
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# ============== MODELS ==============

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    nama: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    nama: str
    role: str

class OPDCreate(BaseModel):
    nama: str
    kode: Optional[str] = None
    alamat: Optional[str] = None

class OPDUpdate(BaseModel):
    nama: Optional[str] = None
    kode: Optional[str] = None
    alamat: Optional[str] = None

class OPDResponse(BaseModel):
    id: str
    nama: str
    kode: Optional[str] = None
    alamat: Optional[str] = None
    created_at: str

class PartisipasiCreate(BaseModel):
    email: EmailStr
    nama_lengkap: str
    nip: str
    opd_id: str
    alamat: str
    nomor_whatsapp: str
    jumlah_pohon: int
    jenis_pohon: str
    sumber_bibit: str
    lokasi_tanam: str
    titik_lokasi: Optional[str] = None
    bukti_url: Optional[str] = None

class PartisipasiUpdate(BaseModel):
    email: Optional[EmailStr] = None
    nama_lengkap: Optional[str] = None
    nip: Optional[str] = None
    opd_id: Optional[str] = None
    alamat: Optional[str] = None
    nomor_whatsapp: Optional[str] = None
    jumlah_pohon: Optional[int] = None
    jenis_pohon: Optional[str] = None
    sumber_bibit: Optional[str] = None
    lokasi_tanam: Optional[str] = None
    titik_lokasi: Optional[str] = None
    bukti_url: Optional[str] = None
    status: Optional[str] = None

class PartisipasiResponse(BaseModel):
    id: str
    email: str
    nama_lengkap: str
    nip: str
    opd_id: str
    opd_nama: Optional[str] = None
    alamat: str
    nomor_whatsapp: str
    jumlah_pohon: int
    jenis_pohon: str
    sumber_bibit: Optional[str] = None
    lokasi_tanam: str
    titik_lokasi: Optional[str] = None
    bukti_url: Optional[str] = None
    status: str
    created_at: str

class SettingsUpdate(BaseModel):
    logo_url: Optional[str] = None
    hero_title: Optional[str] = None
    hero_subtitle: Optional[str] = None
    hero_image_url: Optional[str] = None

class SettingsResponse(BaseModel):
    id: str
    logo_url: Optional[str] = None
    hero_title: str
    hero_subtitle: str
    hero_image_url: Optional[str] = None

class GalleryCreate(BaseModel):
    title: str
    image_url: str
    description: Optional[str] = None

class GalleryResponse(BaseModel):
    id: str
    title: str
    image_url: str
    description: Optional[str] = None
    created_at: str

class EdukasiCreate(BaseModel):
    judul: str
    konten: str
    gambar_url: Optional[str] = None

class EdukasiUpdate(BaseModel):
    judul: Optional[str] = None
    konten: Optional[str] = None
    gambar_url: Optional[str] = None

class EdukasiResponse(BaseModel):
    id: str
    judul: str
    konten: str
    gambar_url: Optional[str] = None
    created_at: str

# ============== AUTH HELPERS ==============

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token telah kadaluarsa")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token tidak valid")

# ============== AUTH ENDPOINTS ==============

@api_router.post("/auth/register", response_model=dict)
async def register(user: UserCreate):
    existing = await db.users.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email sudah terdaftar")
    
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "email": user.email,
        "password": hash_password(user.password),
        "nama": user.nama,
        "role": "admin",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)
    token = create_token(user_id, user.email, "admin")
    return {"token": token, "user": {"id": user_id, "email": user.email, "nama": user.nama, "role": "admin"}}

@api_router.post("/auth/login", response_model=dict)
async def login(user: UserLogin):
    existing = await db.users.find_one({"email": user.email}, {"_id": 0})
    if not existing or not verify_password(user.password, existing["password"]):
        raise HTTPException(status_code=401, detail="Email atau password salah")
    
    token = create_token(existing["id"], existing["email"], existing["role"])
    return {"token": token, "user": {"id": existing["id"], "email": existing["email"], "nama": existing["nama"], "role": existing["role"]}}

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({"id": current_user["user_id"]}, {"_id": 0, "password": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User tidak ditemukan")
    return user

# ============== OPD ENDPOINTS ==============

@api_router.get("/opd", response_model=List[OPDResponse])
async def get_all_opd():
    opd_list = await db.opd.find({}, {"_id": 0}).to_list(1000)
    return opd_list

@api_router.get("/opd/{opd_id}", response_model=OPDResponse)
async def get_opd(opd_id: str):
    opd = await db.opd.find_one({"id": opd_id}, {"_id": 0})
    if not opd:
        raise HTTPException(status_code=404, detail="OPD tidak ditemukan")
    return opd

@api_router.post("/opd", response_model=OPDResponse)
async def create_opd(opd: OPDCreate, current_user: dict = Depends(get_current_user)):
    opd_id = str(uuid.uuid4())
    opd_doc = {
        "id": opd_id,
        "nama": opd.nama,
        "kode": opd.kode,
        "alamat": opd.alamat,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.opd.insert_one(opd_doc)
    return {**opd_doc}

@api_router.put("/opd/{opd_id}", response_model=OPDResponse)
async def update_opd(opd_id: str, opd: OPDUpdate, current_user: dict = Depends(get_current_user)):
    update_data = {k: v for k, v in opd.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="Tidak ada data untuk diupdate")
    
    result = await db.opd.update_one({"id": opd_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="OPD tidak ditemukan")
    
    updated = await db.opd.find_one({"id": opd_id}, {"_id": 0})
    return updated

@api_router.delete("/opd/{opd_id}")
async def delete_opd(opd_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.opd.delete_one({"id": opd_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="OPD tidak ditemukan")
    return {"message": "OPD berhasil dihapus"}

# ============== PARTISIPASI ENDPOINTS ==============

@api_router.get("/partisipasi", response_model=List[PartisipasiResponse])
async def get_all_partisipasi():
    partisipasi_list = await db.partisipasi.find({}, {"_id": 0}).to_list(10000)
    # Fetch all OPDs once to avoid N+1 query
    opd_list = await db.opd.find({}, {"_id": 0, "id": 1, "nama": 1}).to_list(1000)
    opd_map = {o["id"]: o["nama"] for o in opd_list}
    # Enrich with OPD nama using the map
    for p in partisipasi_list:
        p["opd_nama"] = opd_map.get(p.get("opd_id"), "Unknown")
    return partisipasi_list

@api_router.get("/partisipasi/{partisipasi_id}", response_model=PartisipasiResponse)
async def get_partisipasi(partisipasi_id: str):
    p = await db.partisipasi.find_one({"id": partisipasi_id}, {"_id": 0})
    if not p:
        raise HTTPException(status_code=404, detail="Partisipasi tidak ditemukan")
    opd = await db.opd.find_one({"id": p.get("opd_id")}, {"_id": 0})
    p["opd_nama"] = opd["nama"] if opd else "Unknown"
    return p

@api_router.post("/partisipasi", response_model=PartisipasiResponse)
async def create_partisipasi(data: PartisipasiCreate):
    # Verify OPD exists
    opd = await db.opd.find_one({"id": data.opd_id}, {"_id": 0})
    if not opd:
        raise HTTPException(status_code=400, detail="OPD tidak ditemukan")
    
    partisipasi_id = str(uuid.uuid4())
    doc = {
        "id": partisipasi_id,
        **data.model_dump(),
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.partisipasi.insert_one(doc)
    return {**doc, "opd_nama": opd["nama"]}

@api_router.put("/partisipasi/{partisipasi_id}", response_model=PartisipasiResponse)
async def update_partisipasi(partisipasi_id: str, data: PartisipasiUpdate, current_user: dict = Depends(get_current_user)):
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="Tidak ada data untuk diupdate")
    
    result = await db.partisipasi.update_one({"id": partisipasi_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Partisipasi tidak ditemukan")
    
    updated = await db.partisipasi.find_one({"id": partisipasi_id}, {"_id": 0})
    opd = await db.opd.find_one({"id": updated.get("opd_id")}, {"_id": 0})
    updated["opd_nama"] = opd["nama"] if opd else "Unknown"
    return updated

@api_router.delete("/partisipasi/{partisipasi_id}")
async def delete_partisipasi(partisipasi_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.partisipasi.delete_one({"id": partisipasi_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Partisipasi tidak ditemukan")
    return {"message": "Partisipasi berhasil dihapus"}

# ============== SETTINGS ENDPOINTS ==============

@api_router.get("/settings", response_model=SettingsResponse)
async def get_settings():
    settings = await db.settings.find_one({}, {"_id": 0})
    if not settings:
        # Return defaults
        default_settings = {
            "id": str(uuid.uuid4()),
            "logo_url": None,
            "hero_title": "Gerakan Agro Mopomulo",
            "hero_subtitle": "Satu Orang Sepuluh Pohon untuk Masa Depan Daerah",
            "hero_image_url": "https://images.unsplash.com/photo-1765333534690-ad3a985e7c42?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwxfHxsdXNoJTIwZ3JlZW4lMjBmb3Jlc3QlMjBsYW5kc2NhcGUlMjBpbmRvbmVzaWF8ZW58MHx8fHwxNzY4NDQ1ODE1fDA&ixlib=rb-4.1.0&q=85"
        }
        await db.settings.insert_one(default_settings)
        return default_settings
    return settings

@api_router.put("/settings", response_model=SettingsResponse)
async def update_settings(data: SettingsUpdate, current_user: dict = Depends(get_current_user)):
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    
    existing = await db.settings.find_one({}, {"_id": 0})
    if existing:
        await db.settings.update_one({"id": existing["id"]}, {"$set": update_data})
        updated = await db.settings.find_one({"id": existing["id"]}, {"_id": 0})
        return updated
    else:
        settings_id = str(uuid.uuid4())
        new_settings = {
            "id": settings_id,
            "logo_url": data.logo_url,
            "hero_title": data.hero_title or "Gerakan Agro Mopomulo",
            "hero_subtitle": data.hero_subtitle or "Satu Orang Sepuluh Pohon untuk Masa Depan Daerah",
            "hero_image_url": data.hero_image_url
        }
        await db.settings.insert_one(new_settings)
        return new_settings

@api_router.post("/upload/image")
async def upload_image(file: UploadFile = File(...)):
    contents = await file.read()
    base64_data = base64.b64encode(contents).decode('utf-8')
    content_type = file.content_type or 'image/png'
    data_url = f"data:{content_type};base64,{base64_data}"
    return {"url": data_url}

@api_router.post("/settings/upload-logo")
async def upload_logo(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    contents = await file.read()
    base64_data = base64.b64encode(contents).decode('utf-8')
    content_type = file.content_type or 'image/png'
    data_url = f"data:{content_type};base64,{base64_data}"
    
    existing = await db.settings.find_one({}, {"_id": 0})
    if existing:
        await db.settings.update_one({"id": existing["id"]}, {"$set": {"logo_url": data_url}})
    else:
        settings_id = str(uuid.uuid4())
        new_settings = {
            "id": settings_id,
            "logo_url": data_url,
            "hero_title": "Gerakan Agro Mopomulo",
            "hero_subtitle": "Satu Orang Sepuluh Pohon untuk Masa Depan Daerah",
            "hero_image_url": None
        }
        await db.settings.insert_one(new_settings)
    
    return {"logo_url": data_url}

# ============== GALLERY ENDPOINTS ==============

@api_router.get("/gallery", response_model=List[GalleryResponse])
async def get_all_gallery():
    items = await db.gallery.find({}, {"_id": 0}).to_list(1000)
    return items

@api_router.post("/gallery", response_model=GalleryResponse)
async def create_gallery(data: GalleryCreate, current_user: dict = Depends(get_current_user)):
    gallery_id = str(uuid.uuid4())
    doc = {
        "id": gallery_id,
        **data.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.gallery.insert_one(doc)
    return doc

@api_router.delete("/gallery/{gallery_id}")
async def delete_gallery(gallery_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.gallery.delete_one({"id": gallery_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item galeri tidak ditemukan")
    return {"message": "Item galeri berhasil dihapus"}

# ============== EDUKASI ENDPOINTS ==============

@api_router.get("/edukasi", response_model=List[EdukasiResponse])
async def get_all_edukasi():
    items = await db.edukasi.find({}, {"_id": 0}).to_list(1000)
    return items

@api_router.post("/edukasi", response_model=EdukasiResponse)
async def create_edukasi(data: EdukasiCreate, current_user: dict = Depends(get_current_user)):
    edukasi_id = str(uuid.uuid4())
    doc = {
        "id": edukasi_id,
        **data.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.edukasi.insert_one(doc)
    return doc

@api_router.put("/edukasi/{edukasi_id}", response_model=EdukasiResponse)
async def update_edukasi(edukasi_id: str, data: EdukasiUpdate, current_user: dict = Depends(get_current_user)):
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="Tidak ada data untuk diupdate")
    result = await db.edukasi.update_one({"id": edukasi_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Edukasi tidak ditemukan")
    updated = await db.edukasi.find_one({"id": edukasi_id}, {"_id": 0})
    return updated

@api_router.delete("/edukasi/{edukasi_id}")
async def delete_edukasi(edukasi_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.edukasi.delete_one({"id": edukasi_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Edukasi tidak ditemukan")
    return {"message": "Edukasi berhasil dihapus"}

# ============== STATS ENDPOINTS ==============

@api_router.get("/stats")
async def get_stats():
    total_pohon = 0
    total_partisipan = 0
    
    partisipasi_list = await db.partisipasi.find({"status": {"$in": ["pending", "verified", "approved"]}}, {"_id": 0}).to_list(10000)
    total_partisipan = len(partisipasi_list)
    total_pohon = sum(p.get("jumlah_pohon", 0) for p in partisipasi_list)
    
    # Stats per OPD
    opd_stats = {}
    for p in partisipasi_list:
        opd_id = p.get("opd_id")
        if opd_id not in opd_stats:
            opd_stats[opd_id] = {"jumlah_pohon": 0, "jumlah_partisipan": 0}
        opd_stats[opd_id]["jumlah_pohon"] += p.get("jumlah_pohon", 0)
        opd_stats[opd_id]["jumlah_partisipan"] += 1
    
    # Enrich with OPD names
    opd_list = await db.opd.find({}, {"_id": 0}).to_list(1000)
    opd_map = {o["id"]: o["nama"] for o in opd_list}
    
    opd_stats_list = []
    for opd_id, stats in opd_stats.items():
        opd_stats_list.append({
            "opd_id": opd_id,
            "opd_nama": opd_map.get(opd_id, "Unknown"),
            "jumlah_pohon": stats["jumlah_pohon"],
            "jumlah_partisipan": stats["jumlah_partisipan"]
        })
    
    # Stats per jenis pohon
    jenis_pohon_stats = {}
    for p in partisipasi_list:
        jenis = p.get("jenis_pohon", "Lainnya")
        if jenis not in jenis_pohon_stats:
            jenis_pohon_stats[jenis] = 0
        jenis_pohon_stats[jenis] += p.get("jumlah_pohon", 0)
    
    jenis_pohon_list = [{"jenis": k, "jumlah": v} for k, v in jenis_pohon_stats.items()]
    
    # Lokasi tanam stats
    lokasi_stats = {}
    for p in partisipasi_list:
        lokasi = p.get("lokasi_tanam", "Tidak diketahui")
        if lokasi not in lokasi_stats:
            lokasi_stats[lokasi] = {"jumlah_pohon": 0, "jumlah_partisipan": 0}
        lokasi_stats[lokasi]["jumlah_pohon"] += p.get("jumlah_pohon", 0)
        lokasi_stats[lokasi]["jumlah_partisipan"] += 1
    
    lokasi_list = [{"lokasi": k, **v} for k, v in lokasi_stats.items()]
    
    return {
        "total_pohon": total_pohon,
        "total_partisipan": total_partisipan,
        "total_opd": len(opd_list),
        "opd_stats": sorted(opd_stats_list, key=lambda x: x["jumlah_pohon"], reverse=True),
        "jenis_pohon_stats": sorted(jenis_pohon_list, key=lambda x: x["jumlah"], reverse=True),
        "lokasi_stats": sorted(lokasi_list, key=lambda x: x["jumlah_pohon"], reverse=True)
    }

# ============== EXPORT ENDPOINTS ==============

@api_router.get("/export/excel")
async def export_excel(current_user: dict = Depends(get_current_user)):
    partisipasi_list = await db.partisipasi.find({}, {"_id": 0}).to_list(10000)
    opd_list = await db.opd.find({}, {"_id": 0}).to_list(1000)
    opd_map = {o["id"]: o["nama"] for o in opd_list}
    
    wb = Workbook()
    ws = wb.active
    ws.title = "Data Partisipasi"
    
    headers = ["No", "Nama Lengkap", "NIP", "Email", "OPD", "Alamat", "No. WhatsApp", "Jumlah Pohon", "Jenis Pohon", "Lokasi Tanam", "Status", "Tanggal"]
    ws.append(headers)
    
    for idx, p in enumerate(partisipasi_list, 1):
        ws.append([
            idx,
            p.get("nama_lengkap", ""),
            p.get("nip", ""),
            p.get("email", ""),
            opd_map.get(p.get("opd_id"), "Unknown"),
            p.get("alamat", ""),
            p.get("nomor_whatsapp", ""),
            p.get("jumlah_pohon", 0),
            p.get("jenis_pohon", ""),
            p.get("lokasi_tanam", ""),
            p.get("status", ""),
            p.get("created_at", "")[:10] if p.get("created_at") else ""
        ])
    
    output = io.BytesIO()
    wb.save(output)
    output.seek(0)
    
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=data_partisipasi_agro_mopomulo.xlsx"}
    )

@api_router.get("/export/pdf")
async def export_pdf(current_user: dict = Depends(get_current_user)):
    partisipasi_list = await db.partisipasi.find({}, {"_id": 0}).to_list(10000)
    opd_list = await db.opd.find({}, {"_id": 0}).to_list(1000)
    opd_map = {o["id"]: o["nama"] for o in opd_list}
    
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=landscape(A4), rightMargin=30, leftMargin=30, topMargin=30, bottomMargin=30)
    
    elements = []
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('CustomTitle', parent=styles['Heading1'], fontSize=16, spaceAfter=20, alignment=1)
    
    elements.append(Paragraph("Laporan Data Partisipasi Program Agro Mopomulo", title_style))
    elements.append(Paragraph(f"Kabupaten Gorontalo Utara - {datetime.now().strftime('%d %B %Y')}", styles['Normal']))
    elements.append(Spacer(1, 20))
    
    data = [["No", "Nama", "NIP", "OPD", "Pohon", "Jenis", "Lokasi", "Status"]]
    for idx, p in enumerate(partisipasi_list[:100], 1):
        data.append([
            str(idx),
            p.get("nama_lengkap", "")[:20],
            p.get("nip", ""),
            opd_map.get(p.get("opd_id"), "")[:15],
            str(p.get("jumlah_pohon", 0)),
            p.get("jenis_pohon", "")[:15],
            p.get("lokasi_tanam", "")[:15],
            p.get("status", "")
        ])
    
    table = Table(data, repeatRows=1)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.Color(0.02, 0.59, 0.41)),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    
    elements.append(table)
    doc.build(elements)
    
    buffer.seek(0)
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=laporan_agro_mopomulo.pdf"}
    )

# ============== IMPORT ENDPOINTS ==============

@api_router.post("/import/excel")
async def import_excel(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    contents = await file.read()
    wb = load_workbook(filename=io.BytesIO(contents))
    ws = wb.active
    
    opd_list = await db.opd.find({}, {"_id": 0}).to_list(1000)
    opd_name_map = {o["nama"].lower(): o["id"] for o in opd_list}
    
    imported = 0
    errors = []
    
    rows = list(ws.iter_rows(min_row=2, values_only=True))
    for row_idx, row in enumerate(rows, 2):
        if len(row) < 9:
            errors.append(f"Baris {row_idx}: Data tidak lengkap")
            continue
        
        nama, nip, email, opd_nama, alamat, wa, jumlah, jenis, lokasi = row[:9]
        
        opd_id = opd_name_map.get(str(opd_nama).lower().strip()) if opd_nama else None
        if not opd_id:
            errors.append(f"Baris {row_idx}: OPD '{opd_nama}' tidak ditemukan")
            continue
        
        try:
            partisipasi_id = str(uuid.uuid4())
            doc = {
                "id": partisipasi_id,
                "email": str(email).strip() if email else "",
                "nama_lengkap": str(nama).strip() if nama else "",
                "nip": str(nip).strip() if nip else "",
                "opd_id": opd_id,
                "alamat": str(alamat).strip() if alamat else "",
                "nomor_whatsapp": str(wa).strip() if wa else "",
                "jumlah_pohon": int(jumlah) if jumlah else 0,
                "jenis_pohon": str(jenis).strip() if jenis else "",
                "lokasi_tanam": str(lokasi).strip() if lokasi else "",
                "status": "imported",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.partisipasi.insert_one(doc)
            imported += 1
        except Exception as e:
            errors.append(f"Baris {row_idx}: {str(e)}")
    
    return {"imported": imported, "errors": errors}

# ============== HEALTH CHECK ==============

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "Agro Mopomulo API"}

# Include router and middleware
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
