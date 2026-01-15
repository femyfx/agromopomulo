"""
Test file for new features:
1. OPD filter in admin partisipasi page
2. Tentang (About) settings in admin settings page
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthAndAuth:
    """Basic health and authentication tests"""
    
    def test_health_check(self):
        """Test API health endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("✓ Health check passed")
    
    def test_login_success(self):
        """Test admin login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin2@test.com",
            "password": "admin123"
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "user" in data
        print(f"✓ Login successful for {data['user']['email']}")
        return data["token"]


class TestOPDFilter:
    """Tests for OPD filter feature in partisipasi page"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin2@test.com",
            "password": "admin123"
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Authentication failed")
    
    def test_get_all_opd(self):
        """Test that OPD list endpoint returns data for filter dropdown"""
        response = requests.get(f"{BASE_URL}/api/opd")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0, "OPD list should not be empty"
        
        # Verify OPD structure
        for opd in data:
            assert "id" in opd
            assert "nama" in opd
        print(f"✓ OPD list returned {len(data)} items for filter dropdown")
    
    def test_get_all_partisipasi(self):
        """Test that partisipasi list includes opd_id for filtering"""
        response = requests.get(f"{BASE_URL}/api/partisipasi")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
        if len(data) > 0:
            # Verify partisipasi has opd_id and opd_nama for filtering
            for p in data:
                assert "opd_id" in p, "Partisipasi should have opd_id for filtering"
                assert "opd_nama" in p, "Partisipasi should have opd_nama for display"
            print(f"✓ Partisipasi list returned {len(data)} items with OPD info")
        else:
            print("⚠ No partisipasi data found (empty list)")
    
    def test_filter_partisipasi_by_opd(self):
        """Test filtering partisipasi by specific OPD"""
        # Get OPD list first
        opd_response = requests.get(f"{BASE_URL}/api/opd")
        assert opd_response.status_code == 200
        opd_list = opd_response.json()
        
        if len(opd_list) == 0:
            pytest.skip("No OPD data available for filter test")
        
        # Get partisipasi list
        partisipasi_response = requests.get(f"{BASE_URL}/api/partisipasi")
        assert partisipasi_response.status_code == 200
        partisipasi_list = partisipasi_response.json()
        
        # Verify we can filter by OPD (client-side filtering)
        test_opd_id = opd_list[0]["id"]
        filtered = [p for p in partisipasi_list if p.get("opd_id") == test_opd_id]
        
        print(f"✓ Filter test: {len(filtered)} partisipasi found for OPD '{opd_list[0]['nama']}'")


class TestTentangSettings:
    """Tests for Tentang (About) settings feature"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin2@test.com",
            "password": "admin123"
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Authentication failed")
    
    def test_get_settings_with_tentang_fields(self):
        """Test that settings endpoint returns tentang fields"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        data = response.json()
        
        # Verify tentang fields exist in settings response
        assert "tentang_title" in data, "Settings should have tentang_title field"
        assert "tentang_content" in data, "Settings should have tentang_content field"
        assert "tentang_visi" in data, "Settings should have tentang_visi field"
        assert "tentang_misi" in data, "Settings should have tentang_misi field"
        
        print(f"✓ Settings returned with tentang fields:")
        print(f"  - tentang_title: {data.get('tentang_title', 'N/A')[:50]}...")
        print(f"  - tentang_content: {str(data.get('tentang_content', 'N/A'))[:50]}...")
        print(f"  - tentang_visi: {str(data.get('tentang_visi', 'N/A'))[:50]}...")
        print(f"  - tentang_misi: {str(data.get('tentang_misi', 'N/A'))[:50]}...")
    
    def test_update_tentang_settings(self, auth_token):
        """Test updating tentang settings"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        # Update tentang settings
        update_data = {
            "tentang_title": "TEST_Program Agro Mopomulo Updated",
            "tentang_content": "TEST_Updated content for testing purposes",
            "tentang_visi": "TEST_Updated visi for testing",
            "tentang_misi": "- TEST_Misi 1\n- TEST_Misi 2\n- TEST_Misi 3"
        }
        
        response = requests.put(
            f"{BASE_URL}/api/settings",
            json=update_data,
            headers=headers
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify update was successful
        assert data.get("tentang_title") == update_data["tentang_title"]
        assert data.get("tentang_content") == update_data["tentang_content"]
        assert data.get("tentang_visi") == update_data["tentang_visi"]
        assert data.get("tentang_misi") == update_data["tentang_misi"]
        
        print("✓ Tentang settings updated successfully")
    
    def test_verify_tentang_settings_persisted(self, auth_token):
        """Test that tentang settings are persisted after update"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        # First update
        update_data = {
            "tentang_title": "TEST_Persisted Title",
            "tentang_content": "TEST_Persisted Content",
            "tentang_visi": "TEST_Persisted Visi",
            "tentang_misi": "- TEST_Persisted Misi"
        }
        
        update_response = requests.put(
            f"{BASE_URL}/api/settings",
            json=update_data,
            headers=headers
        )
        assert update_response.status_code == 200
        
        # Then GET to verify persistence
        get_response = requests.get(f"{BASE_URL}/api/settings")
        assert get_response.status_code == 200
        data = get_response.json()
        
        assert data.get("tentang_title") == update_data["tentang_title"]
        assert data.get("tentang_content") == update_data["tentang_content"]
        assert data.get("tentang_visi") == update_data["tentang_visi"]
        assert data.get("tentang_misi") == update_data["tentang_misi"]
        
        print("✓ Tentang settings persisted correctly in database")
    
    def test_public_tentang_page_uses_settings(self):
        """Test that public Tentang page can fetch settings"""
        # The public page uses the same settings endpoint
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        data = response.json()
        
        # Verify the data is available for public page
        assert data.get("tentang_title") is not None
        print("✓ Public Tentang page can access settings data")


class TestCleanup:
    """Cleanup test data"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin2@test.com",
            "password": "admin123"
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Authentication failed")
    
    def test_restore_default_tentang_settings(self, auth_token):
        """Restore default tentang settings after tests"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        # Restore to default values
        default_data = {
            "tentang_title": "Program Agro Mopomulo",
            "tentang_content": "Mopomulo berasal dari bahasa Gorontalo yang berarti \"menanam\". Program Agro Mopomulo adalah inisiatif Pemerintah Kabupaten Gorontalo Utara untuk meningkatkan kesadaran dan partisipasi masyarakat dalam pelestarian lingkungan.\n\nDengan konsep \"Satu Orang Sepuluh Pohon\", program ini menargetkan setiap ASN dan warga untuk berkontribusi menanam minimal 10 pohon, baik pohon produktif maupun pohon pelindung.",
            "tentang_visi": "Mewujudkan Kabupaten Gorontalo Utara sebagai daerah yang hijau, asri, dan berkelanjutan dengan partisipasi aktif seluruh lapisan masyarakat dalam pelestarian lingkungan.",
            "tentang_misi": "- Meningkatkan kesadaran lingkungan masyarakat\n- Memperluas area hijau di seluruh wilayah\n- Mendukung ketahanan pangan daerah\n- Membangun budaya peduli lingkungan"
        }
        
        response = requests.put(
            f"{BASE_URL}/api/settings",
            json=default_data,
            headers=headers
        )
        assert response.status_code == 200
        print("✓ Default tentang settings restored")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
