import requests
import sys
import json
from datetime import datetime
import io

class AgroMopumuloAPITester:
    def __init__(self, base_url="https://smartagro.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_result(self, test_name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {test_name} - PASSED")
        else:
            print(f"❌ {test_name} - FAILED: {details}")
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, files=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {}
        
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'
        
        if not files:
            headers['Content-Type'] = 'application/json'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                if files:
                    response = requests.post(url, files=files, headers={k: v for k, v in headers.items() if k != 'Content-Type'}, timeout=30)
                else:
                    response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=30)

            success = response.status_code == expected_status
            
            if success:
                try:
                    response_data = response.json() if response.content else {}
                    self.log_result(name, True)
                    return True, response_data
                except:
                    self.log_result(name, True)
                    return True, {}
            else:
                error_detail = f"Expected {expected_status}, got {response.status_code}"
                try:
                    error_response = response.json()
                    error_detail += f" - {error_response.get('detail', '')}"
                except:
                    error_detail += f" - {response.text[:200]}"
                
                self.log_result(name, False, error_detail)
                return False, {}

        except Exception as e:
            self.log_result(name, False, f"Exception: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test health check endpoint"""
        return self.run_test("Health Check", "GET", "health", 200)

    def test_register_admin(self):
        """Test admin registration"""
        test_data = {
            "email": f"admin_{datetime.now().strftime('%H%M%S')}@test.com",
            "password": "TestPass123!",
            "nama": "Test Admin"
        }
        
        success, response = self.run_test("Admin Registration", "POST", "auth/register", 200, test_data)
        if success and 'token' in response:
            self.token = response['token']
            self.admin_email = test_data['email']
            return True
        return False

    def test_login_admin(self):
        """Test admin login"""
        if not hasattr(self, 'admin_email'):
            self.log_result("Admin Login", False, "No admin email available")
            return False
            
        login_data = {
            "email": self.admin_email,
            "password": "TestPass123!"
        }
        
        success, response = self.run_test("Admin Login", "POST", "auth/login", 200, login_data)
        if success and 'token' in response:
            self.token = response['token']
            return True
        return False

    def test_get_me(self):
        """Test get current user"""
        return self.run_test("Get Current User", "GET", "auth/me", 200)

    def test_opd_crud(self):
        """Test OPD CRUD operations"""
        # Create OPD
        opd_data = {
            "nama": "Dinas Pertanian Test",
            "kode": "DISP001",
            "alamat": "Jl. Test No. 123"
        }
        
        success, response = self.run_test("Create OPD", "POST", "opd", 200, opd_data)
        if not success:
            return False
        
        opd_id = response.get('id')
        if not opd_id:
            self.log_result("Create OPD - Get ID", False, "No ID returned")
            return False

        # Get all OPD
        success, _ = self.run_test("Get All OPD", "GET", "opd", 200)
        if not success:
            return False

        # Get single OPD
        success, _ = self.run_test("Get Single OPD", "GET", f"opd/{opd_id}", 200)
        if not success:
            return False

        # Update OPD
        update_data = {"nama": "Dinas Pertanian Updated"}
        success, _ = self.run_test("Update OPD", "PUT", f"opd/{opd_id}", 200, update_data)
        if not success:
            return False

        # Delete OPD (save for later to avoid affecting partisipasi tests)
        self.opd_id_to_delete = opd_id
        return True

    def test_partisipasi_crud(self):
        """Test Partisipasi CRUD operations"""
        # First create an OPD for partisipasi
        opd_data = {
            "nama": "OPD untuk Partisipasi Test",
            "kode": "OPD001"
        }
        
        success, opd_response = self.run_test("Create OPD for Partisipasi", "POST", "opd", 200, opd_data)
        if not success:
            return False
        
        opd_id = opd_response.get('id')
        
        # Create Partisipasi
        partisipasi_data = {
            "email": "participant@test.com",
            "nama_lengkap": "Test Participant",
            "nip": "123456789",
            "opd_id": opd_id,
            "alamat": "Jl. Participant No. 456",
            "nomor_whatsapp": "081234567890",
            "jumlah_pohon": 15,
            "jenis_pohon": "Mangga",
            "lokasi_tanam": "Kebun Test"
        }
        
        success, response = self.run_test("Create Partisipasi", "POST", "partisipasi", 200, partisipasi_data)
        if not success:
            return False
        
        partisipasi_id = response.get('id')
        if not partisipasi_id:
            self.log_result("Create Partisipasi - Get ID", False, "No ID returned")
            return False

        # Get all Partisipasi
        success, _ = self.run_test("Get All Partisipasi", "GET", "partisipasi", 200)
        if not success:
            return False

        # Get single Partisipasi
        success, _ = self.run_test("Get Single Partisipasi", "GET", f"partisipasi/{partisipasi_id}", 200)
        if not success:
            return False

        # Update Partisipasi status
        update_data = {"status": "verified"}
        success, _ = self.run_test("Update Partisipasi", "PUT", f"partisipasi/{partisipasi_id}", 200, update_data)
        if not success:
            return False

        # Delete Partisipasi
        success, _ = self.run_test("Delete Partisipasi", "DELETE", f"partisipasi/{partisipasi_id}", 200)
        if not success:
            return False

        return True

    def test_settings_crud(self):
        """Test Settings CRUD operations"""
        # Get settings
        success, _ = self.run_test("Get Settings", "GET", "settings", 200)
        if not success:
            return False

        # Update settings
        settings_data = {
            "hero_title": "Test Hero Title",
            "hero_subtitle": "Test Hero Subtitle"
        }
        
        success, _ = self.run_test("Update Settings", "PUT", "settings", 200, settings_data)
        return success

    def test_stats_api(self):
        """Test Stats API"""
        return self.run_test("Get Stats", "GET", "stats", 200)

    def test_export_apis(self):
        """Test Export APIs"""
        # Test Excel export
        success, _ = self.run_test("Export Excel", "GET", "export/excel", 200)
        if not success:
            return False

        # Test PDF export
        success, _ = self.run_test("Export PDF", "GET", "export/pdf", 200)
        return success

    def test_gallery_crud(self):
        """Test Gallery CRUD operations"""
        # Create Gallery item
        gallery_data = {
            "title": "Test Gallery Item",
            "image_url": "https://example.com/test.jpg",
            "description": "Test description"
        }
        
        success, response = self.run_test("Create Gallery", "POST", "gallery", 200, gallery_data)
        if not success:
            return False
        
        gallery_id = response.get('id')
        
        # Get all Gallery
        success, _ = self.run_test("Get All Gallery", "GET", "gallery", 200)
        if not success:
            return False

        # Delete Gallery
        if gallery_id:
            success, _ = self.run_test("Delete Gallery", "DELETE", f"gallery/{gallery_id}", 200)
            return success
        
        return True

    def test_edukasi_crud(self):
        """Test Edukasi CRUD operations"""
        # Create Edukasi
        edukasi_data = {
            "judul": "Test Edukasi",
            "konten": "Test content for edukasi",
            "gambar_url": "https://example.com/edukasi.jpg"
        }
        
        success, response = self.run_test("Create Edukasi", "POST", "edukasi", 200, edukasi_data)
        if not success:
            return False
        
        edukasi_id = response.get('id')
        
        # Get all Edukasi
        success, _ = self.run_test("Get All Edukasi", "GET", "edukasi", 200)
        if not success:
            return False

        # Update Edukasi
        if edukasi_id:
            update_data = {"judul": "Updated Edukasi Title"}
            success, _ = self.run_test("Update Edukasi", "PUT", f"edukasi/{edukasi_id}", 200, update_data)
            if not success:
                return False

            # Delete Edukasi
            success, _ = self.run_test("Delete Edukasi", "DELETE", f"edukasi/{edukasi_id}", 200)
            return success
        
        return True

    def cleanup(self):
        """Clean up test data"""
        if hasattr(self, 'opd_id_to_delete'):
            self.run_test("Delete Test OPD", "DELETE", f"opd/{self.opd_id_to_delete}", 200)

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Agro Mopomulo API Tests...")
        print(f"📍 Testing against: {self.base_url}")
        print("=" * 60)

        # Health check first
        if not self.test_health_check()[0]:
            print("❌ Health check failed - stopping tests")
            return False

        # Authentication tests
        if not self.test_register_admin():
            print("❌ Admin registration failed - stopping tests")
            return False

        if not self.test_login_admin():
            print("❌ Admin login failed - stopping tests")
            return False

        if not self.test_get_me()[0]:
            print("❌ Get current user failed")
            return False

        # CRUD tests
        if not self.test_opd_crud():
            print("❌ OPD CRUD tests failed")
            return False

        if not self.test_partisipasi_crud():
            print("❌ Partisipasi CRUD tests failed")
            return False

        if not self.test_settings_crud():
            print("❌ Settings tests failed")
            return False

        if not self.test_gallery_crud():
            print("❌ Gallery CRUD tests failed")
            return False

        if not self.test_edukasi_crud():
            print("❌ Edukasi CRUD tests failed")
            return False

        # Stats and export tests
        if not self.test_stats_api()[0]:
            print("❌ Stats API test failed")
            return False

        if not self.test_export_apis():
            print("❌ Export APIs test failed")
            return False

        # Cleanup
        self.cleanup()

        return True

def main():
    tester = AgroMopumuloAPITester()
    
    success = tester.run_all_tests()
    
    print("\n" + "=" * 60)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} passed")
    
    if tester.tests_passed < tester.tests_run:
        print("\n❌ Failed Tests:")
        for result in tester.test_results:
            if not result['success']:
                print(f"  - {result['test']}: {result['details']}")
    
    print(f"\n{'🎉 All tests passed!' if success else '⚠️  Some tests failed'}")
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())