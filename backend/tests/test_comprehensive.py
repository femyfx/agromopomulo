"""
Comprehensive Backend API Tests for Agro Mopomulo Dashboard
Pre-deployment testing - covers all API endpoints
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@gorontaloutara.go.id"
ADMIN_PASSWORD = "Admin123!"


class TestHealthAndAuth:
    """Health check and authentication tests"""
    
    def test_health_check(self):
        """Test health endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("✓ Health check passed")
    
    def test_admin_login_success(self):
        """Test admin login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["email"] == ADMIN_EMAIL
        print(f"✓ Admin login successful for {ADMIN_EMAIL}")
        return data["token"]
    
    def test_admin_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "wrong@email.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("✓ Invalid login correctly rejected")
    
    def test_auth_me_with_token(self):
        """Test /auth/me endpoint with valid token"""
        # First login
        login_res = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        token = login_res.json()["token"]
        
        # Then get user info
        response = requests.get(f"{BASE_URL}/api/auth/me", headers={
            "Authorization": f"Bearer {token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == ADMIN_EMAIL
        print("✓ Auth me endpoint works correctly")


class TestOPDEndpoints:
    """OPD CRUD tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for protected endpoints"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json()["token"]
    
    def test_get_all_opd(self):
        """Test GET /api/opd - public endpoint"""
        response = requests.get(f"{BASE_URL}/api/opd")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/opd returned {len(data)} OPDs")
    
    def test_create_opd(self, auth_token):
        """Test POST /api/opd - create new OPD"""
        response = requests.post(
            f"{BASE_URL}/api/opd",
            json={
                "nama": "TEST_OPD_Dinas Uji Coba",
                "kode": "TEST001",
                "alamat": "Jl. Test No. 1",
                "jumlah_personil": 50,
                "kategori": "OPD"
            },
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["nama"] == "TEST_OPD_Dinas Uji Coba"
        assert data["kategori"] == "OPD"
        assert data["jumlah_personil"] == 50
        print(f"✓ Created OPD: {data['nama']}")
        return data["id"]
    
    def test_create_opd_desa_kategori(self, auth_token):
        """Test creating OPD with DESA kategori"""
        response = requests.post(
            f"{BASE_URL}/api/opd",
            json={
                "nama": "TEST_DESA_Desa Uji Coba",
                "kode": "DESA001",
                "kategori": "DESA",
                "jumlah_personil": 30
            },
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["kategori"] == "DESA"
        print(f"✓ Created DESA: {data['nama']}")
        return data["id"]
    
    def test_update_opd(self, auth_token):
        """Test PUT /api/opd/{id} - update OPD"""
        # First create
        create_res = requests.post(
            f"{BASE_URL}/api/opd",
            json={"nama": "TEST_OPD_Update Test", "kategori": "OPD", "jumlah_personil": 10},
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        opd_id = create_res.json()["id"]
        
        # Then update
        response = requests.put(
            f"{BASE_URL}/api/opd/{opd_id}",
            json={"nama": "TEST_OPD_Updated Name", "jumlah_personil": 100},
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["nama"] == "TEST_OPD_Updated Name"
        assert data["jumlah_personil"] == 100
        print(f"✓ Updated OPD: {data['nama']}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/opd/{opd_id}", headers={"Authorization": f"Bearer {auth_token}"})
    
    def test_delete_opd(self, auth_token):
        """Test DELETE /api/opd/{id}"""
        # First create
        create_res = requests.post(
            f"{BASE_URL}/api/opd",
            json={"nama": "TEST_OPD_Delete Test", "kategori": "OPD"},
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        opd_id = create_res.json()["id"]
        
        # Then delete
        response = requests.delete(
            f"{BASE_URL}/api/opd/{opd_id}",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        
        # Verify deleted
        get_res = requests.get(f"{BASE_URL}/api/opd/{opd_id}")
        assert get_res.status_code == 404
        print("✓ OPD deleted successfully")


class TestPartisipasiEndpoints:
    """Partisipasi CRUD tests"""
    
    @pytest.fixture
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json()["token"]
    
    @pytest.fixture
    def test_opd(self, auth_token):
        """Create a test OPD for partisipasi tests"""
        response = requests.post(
            f"{BASE_URL}/api/opd",
            json={"nama": "TEST_OPD_For_Partisipasi", "kategori": "OPD", "jumlah_personil": 20},
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        opd_id = response.json()["id"]
        yield opd_id
        # Cleanup
        requests.delete(f"{BASE_URL}/api/opd/{opd_id}", headers={"Authorization": f"Bearer {auth_token}"})
    
    def test_get_all_partisipasi(self):
        """Test GET /api/partisipasi"""
        response = requests.get(f"{BASE_URL}/api/partisipasi")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/partisipasi returned {len(data)} records")
    
    def test_create_partisipasi(self, auth_token, test_opd):
        """Test POST /api/partisipasi - public endpoint"""
        response = requests.post(
            f"{BASE_URL}/api/partisipasi",
            json={
                "email": "test_partisipasi@test.com",
                "nama_lengkap": "TEST_Partisipan Uji Coba",
                "nip": "TEST123456789",
                "opd_id": test_opd,
                "alamat": "Jl. Test No. 1",
                "nomor_whatsapp": "081234567890",
                "jumlah_pohon": 15,
                "jenis_pohon": "Mangga",
                "sumber_bibit": "Pemerintah Daerah",
                "lokasi_tanam": "Desa Test",
                "titik_lokasi": "0.5432, 123.4567"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["nama_lengkap"] == "TEST_Partisipan Uji Coba"
        assert data["jumlah_pohon"] == 15
        assert data["status"] == "pending"
        print(f"✓ Created partisipasi: {data['nama_lengkap']}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/partisipasi/{data['id']}", headers={"Authorization": f"Bearer {auth_token}"})
    
    def test_partisipasi_invalid_opd(self):
        """Test creating partisipasi with invalid OPD"""
        response = requests.post(
            f"{BASE_URL}/api/partisipasi",
            json={
                "email": "test@test.com",
                "nama_lengkap": "Test",
                "nip": "123",
                "opd_id": "invalid-opd-id",
                "alamat": "Test",
                "nomor_whatsapp": "08123",
                "jumlah_pohon": 10,
                "jenis_pohon": "Mangga",
                "sumber_bibit": "Test",
                "lokasi_tanam": "Test"
            }
        )
        assert response.status_code == 400
        print("✓ Invalid OPD correctly rejected")


class TestSettingsEndpoints:
    """Settings CRUD tests"""
    
    @pytest.fixture
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json()["token"]
    
    def test_get_settings(self):
        """Test GET /api/settings - public endpoint"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        data = response.json()
        assert "hero_title" in data
        assert "hero_subtitle" in data
        assert "berita_popup_interval" in data
        print(f"✓ GET /api/settings - hero_title: {data['hero_title'][:30]}...")
    
    def test_update_settings(self, auth_token):
        """Test PUT /api/settings"""
        # Get current settings
        current = requests.get(f"{BASE_URL}/api/settings").json()
        
        # Update
        response = requests.put(
            f"{BASE_URL}/api/settings",
            json={
                "hero_title": "TEST_Updated Hero Title",
                "berita_popup_interval": 10
            },
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["hero_title"] == "TEST_Updated Hero Title"
        assert data["berita_popup_interval"] == 10
        print("✓ Settings updated successfully")
        
        # Restore original
        requests.put(
            f"{BASE_URL}/api/settings",
            json={
                "hero_title": current.get("hero_title", "Gerakan Agro Mopomulo"),
                "berita_popup_interval": current.get("berita_popup_interval", 5)
            },
            headers={"Authorization": f"Bearer {auth_token}"}
        )
    
    def test_settings_tentang_fields(self, auth_token):
        """Test tentang fields in settings"""
        response = requests.put(
            f"{BASE_URL}/api/settings",
            json={
                "tentang_title": "TEST_Tentang Title",
                "tentang_content": "TEST_Tentang Content",
                "tentang_visi": "TEST_Visi",
                "tentang_misi": "TEST_Misi"
            },
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["tentang_title"] == "TEST_Tentang Title"
        print("✓ Tentang settings updated successfully")


class TestStatsAndProgress:
    """Stats and Progress endpoints tests"""
    
    def test_get_stats(self):
        """Test GET /api/stats"""
        response = requests.get(f"{BASE_URL}/api/stats")
        assert response.status_code == 200
        data = response.json()
        assert "total_pohon" in data
        assert "total_partisipan" in data
        assert "total_opd" in data
        assert "opd_stats" in data
        assert "jenis_pohon_stats" in data
        print(f"✓ Stats: {data['total_pohon']} pohon, {data['total_partisipan']} partisipan")
    
    def test_get_progress(self):
        """Test GET /api/progress"""
        response = requests.get(f"{BASE_URL}/api/progress")
        assert response.status_code == 200
        data = response.json()
        assert "progress_list" in data
        assert "summary" in data
        assert "total_target" in data["summary"]
        assert "total_tertanam" in data["summary"]
        assert "overall_progress" in data["summary"]
        print(f"✓ Progress: {data['summary']['overall_progress']}% overall")


class TestAgendaEndpoints:
    """Agenda CRUD tests"""
    
    @pytest.fixture
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json()["token"]
    
    def test_get_all_agenda(self):
        """Test GET /api/agenda"""
        response = requests.get(f"{BASE_URL}/api/agenda")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/agenda returned {len(data)} items")
    
    def test_get_upcoming_agenda(self):
        """Test GET /api/agenda/upcoming"""
        response = requests.get(f"{BASE_URL}/api/agenda/upcoming")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/agenda/upcoming returned {len(data)} items")
    
    def test_create_agenda(self, auth_token):
        """Test POST /api/agenda"""
        response = requests.post(
            f"{BASE_URL}/api/agenda",
            json={
                "nama_kegiatan": "TEST_Agenda Penanaman",
                "hari": "Senin",
                "tanggal": "2026-02-15",
                "lokasi_kecamatan": "Kwandang",
                "lokasi_desa": "Desa Test",
                "deskripsi": "Test agenda description"
            },
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["nama_kegiatan"] == "TEST_Agenda Penanaman"
        assert data["status"] == "upcoming"
        print(f"✓ Created agenda: {data['nama_kegiatan']}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/agenda/{data['id']}", headers={"Authorization": f"Bearer {auth_token}"})
    
    def test_update_agenda_status(self, auth_token):
        """Test updating agenda status"""
        # Create
        create_res = requests.post(
            f"{BASE_URL}/api/agenda",
            json={
                "nama_kegiatan": "TEST_Agenda Status Update",
                "hari": "Selasa",
                "tanggal": "2026-02-20",
                "lokasi_kecamatan": "Test",
                "lokasi_desa": "Test"
            },
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        agenda_id = create_res.json()["id"]
        
        # Update status
        response = requests.put(
            f"{BASE_URL}/api/agenda/{agenda_id}",
            json={"status": "ongoing"},
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        assert response.json()["status"] == "ongoing"
        print("✓ Agenda status updated to ongoing")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/agenda/{agenda_id}", headers={"Authorization": f"Bearer {auth_token}"})


class TestBeritaEndpoints:
    """Berita CRUD tests"""
    
    @pytest.fixture
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json()["token"]
    
    def test_get_all_berita(self):
        """Test GET /api/berita"""
        response = requests.get(f"{BASE_URL}/api/berita")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/berita returned {len(data)} items")
    
    def test_get_active_berita(self):
        """Test GET /api/berita/active"""
        response = requests.get(f"{BASE_URL}/api/berita/active")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/berita/active returned {len(data)} items")
    
    def test_create_berita(self, auth_token):
        """Test POST /api/berita"""
        response = requests.post(
            f"{BASE_URL}/api/berita",
            json={
                "judul": "TEST_Berita Uji Coba",
                "deskripsi_singkat": "Deskripsi singkat berita test",
                "isi_berita": "Isi lengkap berita test untuk pengujian sistem",
                "gambar_url": "https://example.com/image.jpg",
                "gambar_type": "link"
            },
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["judul"] == "TEST_Berita Uji Coba"
        assert data["is_active"] == True
        print(f"✓ Created berita: {data['judul']}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/berita/{data['id']}", headers={"Authorization": f"Bearer {auth_token}"})
    
    def test_toggle_berita_active(self, auth_token):
        """Test toggling berita is_active status"""
        # Create
        create_res = requests.post(
            f"{BASE_URL}/api/berita",
            json={
                "judul": "TEST_Berita Toggle",
                "deskripsi_singkat": "Test",
                "isi_berita": "Test content"
            },
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        berita_id = create_res.json()["id"]
        
        # Toggle to inactive
        response = requests.put(
            f"{BASE_URL}/api/berita/{berita_id}",
            json={"is_active": False},
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        assert response.json()["is_active"] == False
        print("✓ Berita toggled to inactive")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/berita/{berita_id}", headers={"Authorization": f"Bearer {auth_token}"})


class TestGalleryEndpoints:
    """Gallery CRUD tests"""
    
    @pytest.fixture
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json()["token"]
    
    def test_get_all_gallery(self):
        """Test GET /api/gallery"""
        response = requests.get(f"{BASE_URL}/api/gallery")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/gallery returned {len(data)} items")
    
    def test_create_gallery(self, auth_token):
        """Test POST /api/gallery"""
        response = requests.post(
            f"{BASE_URL}/api/gallery",
            json={
                "title": "TEST_Gallery Item",
                "image_url": "https://example.com/gallery.jpg",
                "description": "Test gallery description"
            },
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "TEST_Gallery Item"
        print(f"✓ Created gallery: {data['title']}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/gallery/{data['id']}", headers={"Authorization": f"Bearer {auth_token}"})


class TestEdukasiEndpoints:
    """Edukasi CRUD tests"""
    
    @pytest.fixture
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json()["token"]
    
    def test_get_all_edukasi(self):
        """Test GET /api/edukasi"""
        response = requests.get(f"{BASE_URL}/api/edukasi")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/edukasi returned {len(data)} items")
    
    def test_create_edukasi(self, auth_token):
        """Test POST /api/edukasi"""
        response = requests.post(
            f"{BASE_URL}/api/edukasi",
            json={
                "judul": "TEST_Edukasi Penanaman",
                "konten": "Konten edukasi tentang cara menanam pohon yang benar",
                "gambar_url": "https://example.com/edukasi.jpg"
            },
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["judul"] == "TEST_Edukasi Penanaman"
        print(f"✓ Created edukasi: {data['judul']}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/edukasi/{data['id']}", headers={"Authorization": f"Bearer {auth_token}"})
    
    def test_update_edukasi(self, auth_token):
        """Test PUT /api/edukasi/{id}"""
        # Create
        create_res = requests.post(
            f"{BASE_URL}/api/edukasi",
            json={"judul": "TEST_Edukasi Update", "konten": "Original content"},
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        edukasi_id = create_res.json()["id"]
        
        # Update
        response = requests.put(
            f"{BASE_URL}/api/edukasi/{edukasi_id}",
            json={"konten": "Updated content"},
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        assert response.json()["konten"] == "Updated content"
        print("✓ Edukasi updated successfully")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/edukasi/{edukasi_id}", headers={"Authorization": f"Bearer {auth_token}"})


class TestExportEndpoints:
    """Export endpoints tests"""
    
    @pytest.fixture
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json()["token"]
    
    def test_export_excel(self, auth_token):
        """Test GET /api/export/excel"""
        response = requests.get(
            f"{BASE_URL}/api/export/excel",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        assert "spreadsheetml" in response.headers.get("content-type", "")
        print("✓ Export Excel works correctly")
    
    def test_export_pdf(self, auth_token):
        """Test GET /api/export/pdf"""
        response = requests.get(
            f"{BASE_URL}/api/export/pdf",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        assert "pdf" in response.headers.get("content-type", "")
        print("✓ Export PDF works correctly")


# Cleanup test data after all tests
@pytest.fixture(scope="session", autouse=True)
def cleanup_test_data():
    """Cleanup TEST_ prefixed data after all tests"""
    yield
    # Login
    login_res = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    })
    if login_res.status_code != 200:
        return
    token = login_res.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Cleanup OPDs
    opd_res = requests.get(f"{BASE_URL}/api/opd")
    if opd_res.status_code == 200:
        for opd in opd_res.json():
            if opd["nama"].startswith("TEST_"):
                requests.delete(f"{BASE_URL}/api/opd/{opd['id']}", headers=headers)
    
    # Cleanup Partisipasi
    part_res = requests.get(f"{BASE_URL}/api/partisipasi")
    if part_res.status_code == 200:
        for p in part_res.json():
            if p["nama_lengkap"].startswith("TEST_"):
                requests.delete(f"{BASE_URL}/api/partisipasi/{p['id']}", headers=headers)
    
    print("\n✓ Test data cleanup completed")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
