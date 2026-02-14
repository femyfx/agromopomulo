from server import app
from fastapi.testclient import TestClient

client = TestClient(app)

response = client.get("/api/settings")
print("Status code:", response.status_code)
print("Response body:", response.json())
