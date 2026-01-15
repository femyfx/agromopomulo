"""
Test file for new features:
1. Jumlah Personil field in OPD management
2. Progress endpoint for calculating planting progress per OPD
   Formula: Target = 10 trees × personnel count
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


class TestOPDJumlahPersonil:
    """Tests for jumlah_personil field in OPD management"""
    
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
    
    def test_opd_list_has_jumlah_personil(self):
        """Test that OPD list includes jumlah_personil field"""
        response = requests.get(f"{BASE_URL}/api/opd")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0, "OPD list should not be empty"
        
        # Verify jumlah_personil field exists in all OPDs
        for opd in data:
            assert "id" in opd
            assert "nama" in opd
            assert "jumlah_personil" in opd, "OPD should have jumlah_personil field"
            assert isinstance(opd["jumlah_personil"], int) or opd["jumlah_personil"] is None
        
        print(f"✓ OPD list returned {len(data)} items with jumlah_personil field")
        for opd in data:
            print(f"  - {opd['nama']}: {opd.get('jumlah_personil', 0)} personil")
    
    def test_create_opd_with_jumlah_personil(self, auth_token):
        """Test creating OPD with jumlah_personil field"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        # Create OPD with jumlah_personil
        create_data = {
            "nama": "TEST_OPD_Personil",
            "kode": "TEST001",
            "alamat": "Test Address",
            "jumlah_personil": 25
        }
        
        response = requests.post(
            f"{BASE_URL}/api/opd",
            json=create_data,
            headers=headers
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify jumlah_personil was saved
        assert data["nama"] == create_data["nama"]
        assert data["jumlah_personil"] == 25
        
        print(f"✓ Created OPD with jumlah_personil: {data['jumlah_personil']}")
        
        # Cleanup - delete the test OPD
        delete_response = requests.delete(
            f"{BASE_URL}/api/opd/{data['id']}",
            headers=headers
        )
        assert delete_response.status_code == 200
        print("✓ Test OPD cleaned up")
    
    def test_update_opd_jumlah_personil(self, auth_token):
        """Test updating jumlah_personil field"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        # First create a test OPD
        create_data = {
            "nama": "TEST_OPD_Update",
            "kode": "TEST002",
            "jumlah_personil": 10
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/opd",
            json=create_data,
            headers=headers
        )
        assert create_response.status_code == 200
        opd_id = create_response.json()["id"]
        
        # Update jumlah_personil
        update_data = {"jumlah_personil": 50}
        update_response = requests.put(
            f"{BASE_URL}/api/opd/{opd_id}",
            json=update_data,
            headers=headers
        )
        assert update_response.status_code == 200
        updated_data = update_response.json()
        assert updated_data["jumlah_personil"] == 50
        
        print(f"✓ Updated jumlah_personil from 10 to {updated_data['jumlah_personil']}")
        
        # Verify persistence with GET
        get_response = requests.get(f"{BASE_URL}/api/opd/{opd_id}")
        assert get_response.status_code == 200
        assert get_response.json()["jumlah_personil"] == 50
        print("✓ jumlah_personil persisted correctly")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/opd/{opd_id}", headers=headers)
        print("✓ Test OPD cleaned up")
    
    def test_create_opd_default_jumlah_personil(self, auth_token):
        """Test that jumlah_personil defaults to 0 if not provided"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        # Create OPD without jumlah_personil
        create_data = {
            "nama": "TEST_OPD_Default",
            "kode": "TEST003"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/opd",
            json=create_data,
            headers=headers
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify default value
        assert data["jumlah_personil"] == 0 or data["jumlah_personil"] is None
        print(f"✓ Default jumlah_personil: {data.get('jumlah_personil', 0)}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/opd/{data['id']}", headers=headers)


class TestProgressEndpoint:
    """Tests for /api/progress endpoint"""
    
    def test_progress_endpoint_returns_data(self):
        """Test that progress endpoint returns expected structure"""
        response = requests.get(f"{BASE_URL}/api/progress")
        assert response.status_code == 200
        data = response.json()
        
        # Verify structure
        assert "progress_list" in data
        assert "summary" in data
        assert isinstance(data["progress_list"], list)
        
        print(f"✓ Progress endpoint returned {len(data['progress_list'])} OPD progress records")
    
    def test_progress_list_structure(self):
        """Test that progress_list has correct fields"""
        response = requests.get(f"{BASE_URL}/api/progress")
        assert response.status_code == 200
        data = response.json()
        
        if len(data["progress_list"]) > 0:
            item = data["progress_list"][0]
            
            # Verify required fields
            assert "opd_id" in item
            assert "opd_nama" in item
            assert "jumlah_personil" in item
            assert "target_pohon" in item
            assert "pohon_tertanam" in item
            assert "progress_persen" in item
            
            print("✓ Progress list has all required fields:")
            print(f"  - opd_nama: {item['opd_nama']}")
            print(f"  - jumlah_personil: {item['jumlah_personil']}")
            print(f"  - target_pohon: {item['target_pohon']}")
            print(f"  - pohon_tertanam: {item['pohon_tertanam']}")
            print(f"  - progress_persen: {item['progress_persen']}%")
    
    def test_progress_calculation_formula(self):
        """Test that target_pohon = jumlah_personil × 10"""
        response = requests.get(f"{BASE_URL}/api/progress")
        assert response.status_code == 200
        data = response.json()
        
        for item in data["progress_list"]:
            expected_target = item["jumlah_personil"] * 10
            assert item["target_pohon"] == expected_target, \
                f"Target calculation wrong for {item['opd_nama']}: expected {expected_target}, got {item['target_pohon']}"
        
        print("✓ Target calculation formula verified: target = personil × 10")
    
    def test_progress_percentage_calculation(self):
        """Test that progress_persen = (pohon_tertanam / target_pohon) × 100"""
        response = requests.get(f"{BASE_URL}/api/progress")
        assert response.status_code == 200
        data = response.json()
        
        for item in data["progress_list"]:
            if item["target_pohon"] > 0:
                expected_pct = round((item["pohon_tertanam"] / item["target_pohon"]) * 100, 1)
                # Allow for small floating point differences
                assert abs(item["progress_persen"] - expected_pct) < 0.2, \
                    f"Progress % wrong for {item['opd_nama']}: expected {expected_pct}, got {item['progress_persen']}"
        
        print("✓ Progress percentage calculation verified")
    
    def test_progress_summary_structure(self):
        """Test that summary has correct fields"""
        response = requests.get(f"{BASE_URL}/api/progress")
        assert response.status_code == 200
        data = response.json()
        
        summary = data["summary"]
        assert "total_personil" in summary
        assert "total_target" in summary
        assert "total_tertanam" in summary
        assert "overall_progress" in summary
        
        print("✓ Summary has all required fields:")
        print(f"  - total_personil: {summary['total_personil']}")
        print(f"  - total_target: {summary['total_target']}")
        print(f"  - total_tertanam: {summary['total_tertanam']}")
        print(f"  - overall_progress: {summary['overall_progress']}%")
    
    def test_progress_summary_calculations(self):
        """Test that summary totals are calculated correctly"""
        response = requests.get(f"{BASE_URL}/api/progress")
        assert response.status_code == 200
        data = response.json()
        
        # Calculate expected totals from progress_list
        expected_personil = sum(item["jumlah_personil"] for item in data["progress_list"])
        expected_target = sum(item["target_pohon"] for item in data["progress_list"])
        expected_tertanam = sum(item["pohon_tertanam"] for item in data["progress_list"])
        
        summary = data["summary"]
        assert summary["total_personil"] == expected_personil
        assert summary["total_target"] == expected_target
        assert summary["total_tertanam"] == expected_tertanam
        
        # Verify overall progress calculation
        if expected_target > 0:
            expected_overall = round((expected_tertanam / expected_target) * 100, 1)
            assert abs(summary["overall_progress"] - expected_overall) < 0.2
        
        print("✓ Summary calculations verified")
    
    def test_progress_sorted_by_percentage(self):
        """Test that progress_list is sorted by progress_persen descending"""
        response = requests.get(f"{BASE_URL}/api/progress")
        assert response.status_code == 200
        data = response.json()
        
        progress_list = data["progress_list"]
        if len(progress_list) > 1:
            for i in range(len(progress_list) - 1):
                assert progress_list[i]["progress_persen"] >= progress_list[i+1]["progress_persen"], \
                    "Progress list should be sorted by progress_persen descending"
        
        print("✓ Progress list is sorted by percentage (descending)")


class TestExistingOPDData:
    """Tests to verify existing OPD data has jumlah_personil"""
    
    def test_existing_opd_have_personil_data(self):
        """Verify existing OPDs have jumlah_personil values"""
        response = requests.get(f"{BASE_URL}/api/opd")
        assert response.status_code == 200
        data = response.json()
        
        opd_with_personil = [opd for opd in data if opd.get("jumlah_personil", 0) > 0]
        
        print(f"✓ Found {len(opd_with_personil)} OPDs with personil data:")
        for opd in opd_with_personil:
            print(f"  - {opd['nama']}: {opd['jumlah_personil']} personil")
        
        # At least some OPDs should have personil data based on main agent's note
        assert len(opd_with_personil) > 0, "Expected some OPDs to have jumlah_personil data"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
