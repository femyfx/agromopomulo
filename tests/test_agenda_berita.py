"""
Test suite for Agenda and Berita features
- Agenda CRUD operations
- Berita CRUD operations
- Popup interval settings
- Public endpoints (upcoming agenda, active berita)
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://agro-digital-2.preview.emergentagent.com')

# Test credentials
ADMIN_EMAIL = "admin@gorontaloutara.go.id"
ADMIN_PASSWORD = "Admin123!"


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for admin user"""
    response = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
    )
    if response.status_code == 200:
        return response.json().get("token")
    pytest.skip("Authentication failed - skipping authenticated tests")


@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Get headers with auth token"""
    return {"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"}


class TestHealthCheck:
    """Basic health check tests"""
    
    def test_health_endpoint(self):
        """Test health endpoint is accessible"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("✓ Health check passed")


class TestAdminLogin:
    """Admin authentication tests"""
    
    def test_admin_login_success(self):
        """Test admin login with valid credentials"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["email"] == ADMIN_EMAIL
        print(f"✓ Admin login successful for {ADMIN_EMAIL}")
    
    def test_admin_login_invalid_credentials(self):
        """Test admin login with invalid credentials"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "wrong@email.com", "password": "wrongpassword"}
        )
        assert response.status_code == 401
        print("✓ Invalid credentials correctly rejected")


class TestAgendaCRUD:
    """Agenda CRUD operation tests"""
    
    def test_get_all_agenda(self):
        """Test GET all agenda (public endpoint)"""
        response = requests.get(f"{BASE_URL}/api/agenda")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/agenda returned {len(data)} items")
        return data
    
    def test_get_upcoming_agenda(self):
        """Test GET upcoming agenda (public endpoint)"""
        response = requests.get(f"{BASE_URL}/api/agenda/upcoming")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # All items should have status 'upcoming' or 'ongoing'
        for item in data:
            assert item["status"] in ["upcoming", "ongoing"]
        print(f"✓ GET /api/agenda/upcoming returned {len(data)} items")
    
    def test_create_agenda(self, auth_headers):
        """Test CREATE agenda (authenticated)"""
        agenda_data = {
            "nama_kegiatan": "TEST_Penanaman Pohon Bersama",
            "hari": "Selasa",
            "tanggal": "2026-03-15",
            "lokasi_kecamatan": "Anggrek",
            "lokasi_desa": "Anggrek Utara",
            "deskripsi": "Kegiatan penanaman pohon bersama masyarakat desa"
        }
        response = requests.post(
            f"{BASE_URL}/api/agenda",
            json=agenda_data,
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["nama_kegiatan"] == agenda_data["nama_kegiatan"]
        assert data["hari"] == agenda_data["hari"]
        assert data["tanggal"] == agenda_data["tanggal"]
        assert data["lokasi_kecamatan"] == agenda_data["lokasi_kecamatan"]
        assert data["lokasi_desa"] == agenda_data["lokasi_desa"]
        assert data["status"] == "upcoming"
        assert "id" in data
        print(f"✓ Created agenda: {data['nama_kegiatan']}")
        return data["id"]
    
    def test_update_agenda(self, auth_headers):
        """Test UPDATE agenda (authenticated)"""
        # First create an agenda
        create_data = {
            "nama_kegiatan": "TEST_Agenda untuk Update",
            "hari": "Rabu",
            "tanggal": "2026-04-10",
            "lokasi_kecamatan": "Sumalata",
            "lokasi_desa": "Sumalata Timur"
        }
        create_response = requests.post(
            f"{BASE_URL}/api/agenda",
            json=create_data,
            headers=auth_headers
        )
        assert create_response.status_code == 200
        agenda_id = create_response.json()["id"]
        
        # Update the agenda
        update_data = {
            "nama_kegiatan": "TEST_Agenda Updated",
            "status": "ongoing"
        }
        update_response = requests.put(
            f"{BASE_URL}/api/agenda/{agenda_id}",
            json=update_data,
            headers=auth_headers
        )
        assert update_response.status_code == 200
        updated = update_response.json()
        assert updated["nama_kegiatan"] == "TEST_Agenda Updated"
        assert updated["status"] == "ongoing"
        print(f"✓ Updated agenda: {updated['nama_kegiatan']}")
        
        # Verify with GET
        get_response = requests.get(f"{BASE_URL}/api/agenda")
        assert get_response.status_code == 200
        agenda_list = get_response.json()
        found = next((a for a in agenda_list if a["id"] == agenda_id), None)
        assert found is not None
        assert found["nama_kegiatan"] == "TEST_Agenda Updated"
        print("✓ Update verified via GET")
        
        return agenda_id
    
    def test_delete_agenda(self, auth_headers):
        """Test DELETE agenda (authenticated)"""
        # First create an agenda
        create_data = {
            "nama_kegiatan": "TEST_Agenda untuk Delete",
            "hari": "Kamis",
            "tanggal": "2026-05-20",
            "lokasi_kecamatan": "Tomilito",
            "lokasi_desa": "Tomilito Selatan"
        }
        create_response = requests.post(
            f"{BASE_URL}/api/agenda",
            json=create_data,
            headers=auth_headers
        )
        assert create_response.status_code == 200
        agenda_id = create_response.json()["id"]
        
        # Delete the agenda
        delete_response = requests.delete(
            f"{BASE_URL}/api/agenda/{agenda_id}",
            headers=auth_headers
        )
        assert delete_response.status_code == 200
        print(f"✓ Deleted agenda: {agenda_id}")
        
        # Verify deletion
        get_response = requests.get(f"{BASE_URL}/api/agenda")
        agenda_list = get_response.json()
        found = next((a for a in agenda_list if a["id"] == agenda_id), None)
        assert found is None
        print("✓ Deletion verified - agenda no longer exists")


class TestBeritaCRUD:
    """Berita CRUD operation tests"""
    
    def test_get_all_berita(self):
        """Test GET all berita (public endpoint)"""
        response = requests.get(f"{BASE_URL}/api/berita")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/berita returned {len(data)} items")
        return data
    
    def test_get_active_berita(self):
        """Test GET active berita for popup (public endpoint)"""
        response = requests.get(f"{BASE_URL}/api/berita/active")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # All items should have is_active = True
        for item in data:
            assert item["is_active"] == True
        print(f"✓ GET /api/berita/active returned {len(data)} active items")
    
    def test_create_berita(self, auth_headers):
        """Test CREATE berita (authenticated)"""
        berita_data = {
            "judul": "TEST_Berita Penanaman Sukses",
            "deskripsi_singkat": "Kegiatan penanaman pohon di Kecamatan Anggrek berjalan sukses",
            "isi_berita": "Kegiatan penanaman pohon yang dilaksanakan pada hari Senin di Kecamatan Anggrek berjalan dengan sukses. Sebanyak 500 pohon berhasil ditanam oleh masyarakat dan ASN.",
            "gambar_url": "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800",
            "gambar_type": "link"
        }
        response = requests.post(
            f"{BASE_URL}/api/berita",
            json=berita_data,
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["judul"] == berita_data["judul"]
        assert data["deskripsi_singkat"] == berita_data["deskripsi_singkat"]
        assert data["isi_berita"] == berita_data["isi_berita"]
        assert data["is_active"] == True
        assert "id" in data
        print(f"✓ Created berita: {data['judul']}")
        return data["id"]
    
    def test_update_berita(self, auth_headers):
        """Test UPDATE berita (authenticated)"""
        # First create a berita
        create_data = {
            "judul": "TEST_Berita untuk Update",
            "deskripsi_singkat": "Deskripsi singkat berita",
            "isi_berita": "Isi lengkap berita untuk testing update"
        }
        create_response = requests.post(
            f"{BASE_URL}/api/berita",
            json=create_data,
            headers=auth_headers
        )
        assert create_response.status_code == 200
        berita_id = create_response.json()["id"]
        
        # Update the berita
        update_data = {
            "judul": "TEST_Berita Updated",
            "is_active": False
        }
        update_response = requests.put(
            f"{BASE_URL}/api/berita/{berita_id}",
            json=update_data,
            headers=auth_headers
        )
        assert update_response.status_code == 200
        updated = update_response.json()
        assert updated["judul"] == "TEST_Berita Updated"
        assert updated["is_active"] == False
        print(f"✓ Updated berita: {updated['judul']}")
        
        # Verify with GET by ID
        get_response = requests.get(f"{BASE_URL}/api/berita/{berita_id}")
        assert get_response.status_code == 200
        fetched = get_response.json()
        assert fetched["judul"] == "TEST_Berita Updated"
        assert fetched["is_active"] == False
        print("✓ Update verified via GET")
        
        return berita_id
    
    def test_delete_berita(self, auth_headers):
        """Test DELETE berita (authenticated)"""
        # First create a berita
        create_data = {
            "judul": "TEST_Berita untuk Delete",
            "deskripsi_singkat": "Berita ini akan dihapus",
            "isi_berita": "Isi berita untuk testing delete"
        }
        create_response = requests.post(
            f"{BASE_URL}/api/berita",
            json=create_data,
            headers=auth_headers
        )
        assert create_response.status_code == 200
        berita_id = create_response.json()["id"]
        
        # Delete the berita
        delete_response = requests.delete(
            f"{BASE_URL}/api/berita/{berita_id}",
            headers=auth_headers
        )
        assert delete_response.status_code == 200
        print(f"✓ Deleted berita: {berita_id}")
        
        # Verify deletion
        get_response = requests.get(f"{BASE_URL}/api/berita/{berita_id}")
        assert get_response.status_code == 404
        print("✓ Deletion verified - berita returns 404")
    
    def test_toggle_berita_active(self, auth_headers):
        """Test toggling berita active status"""
        # Create a berita
        create_data = {
            "judul": "TEST_Berita Toggle Active",
            "deskripsi_singkat": "Testing toggle active",
            "isi_berita": "Isi berita untuk testing toggle"
        }
        create_response = requests.post(
            f"{BASE_URL}/api/berita",
            json=create_data,
            headers=auth_headers
        )
        assert create_response.status_code == 200
        berita_id = create_response.json()["id"]
        assert create_response.json()["is_active"] == True
        
        # Toggle to inactive
        update_response = requests.put(
            f"{BASE_URL}/api/berita/{berita_id}",
            json={"is_active": False},
            headers=auth_headers
        )
        assert update_response.status_code == 200
        assert update_response.json()["is_active"] == False
        print("✓ Toggled berita to inactive")
        
        # Verify not in active list
        active_response = requests.get(f"{BASE_URL}/api/berita/active")
        active_list = active_response.json()
        found = next((b for b in active_list if b["id"] == berita_id), None)
        assert found is None
        print("✓ Inactive berita not in active list")
        
        # Toggle back to active
        update_response2 = requests.put(
            f"{BASE_URL}/api/berita/{berita_id}",
            json={"is_active": True},
            headers=auth_headers
        )
        assert update_response2.status_code == 200
        assert update_response2.json()["is_active"] == True
        print("✓ Toggled berita back to active")


class TestPopupSettings:
    """Berita popup interval settings tests"""
    
    def test_get_settings_with_popup_interval(self):
        """Test GET settings includes berita_popup_interval"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        data = response.json()
        assert "berita_popup_interval" in data
        assert isinstance(data["berita_popup_interval"], int)
        print(f"✓ Settings has berita_popup_interval: {data['berita_popup_interval']} seconds")
    
    def test_update_popup_interval(self, auth_headers):
        """Test UPDATE popup interval setting"""
        # Get current settings
        get_response = requests.get(f"{BASE_URL}/api/settings")
        original_interval = get_response.json().get("berita_popup_interval", 5)
        
        # Update to new value
        new_interval = 10
        update_response = requests.put(
            f"{BASE_URL}/api/settings",
            json={"berita_popup_interval": new_interval},
            headers=auth_headers
        )
        assert update_response.status_code == 200
        assert update_response.json()["berita_popup_interval"] == new_interval
        print(f"✓ Updated popup interval to {new_interval} seconds")
        
        # Verify persistence
        verify_response = requests.get(f"{BASE_URL}/api/settings")
        assert verify_response.json()["berita_popup_interval"] == new_interval
        print("✓ Popup interval update persisted")
        
        # Restore original value
        requests.put(
            f"{BASE_URL}/api/settings",
            json={"berita_popup_interval": original_interval},
            headers=auth_headers
        )


class TestCleanup:
    """Cleanup test data"""
    
    def test_cleanup_test_agenda(self, auth_headers):
        """Clean up TEST_ prefixed agenda items"""
        response = requests.get(f"{BASE_URL}/api/agenda")
        agenda_list = response.json()
        deleted_count = 0
        for agenda in agenda_list:
            if agenda["nama_kegiatan"].startswith("TEST_"):
                delete_response = requests.delete(
                    f"{BASE_URL}/api/agenda/{agenda['id']}",
                    headers=auth_headers
                )
                if delete_response.status_code == 200:
                    deleted_count += 1
        print(f"✓ Cleaned up {deleted_count} test agenda items")
    
    def test_cleanup_test_berita(self, auth_headers):
        """Clean up TEST_ prefixed berita items"""
        response = requests.get(f"{BASE_URL}/api/berita")
        berita_list = response.json()
        deleted_count = 0
        for berita in berita_list:
            if berita["judul"].startswith("TEST_"):
                delete_response = requests.delete(
                    f"{BASE_URL}/api/berita/{berita['id']}",
                    headers=auth_headers
                )
                if delete_response.status_code == 200:
                    deleted_count += 1
        print(f"✓ Cleaned up {deleted_count} test berita items")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
