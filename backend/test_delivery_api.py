#!/usr/bin/env python3
"""
Test script to demonstrate all delivery API endpoints.
This script shows all the available delivery API calls.
"""

import requests
import json
from typing import Dict, Any

# Configuration
BASE_URL = "http://localhost:8000/api"
AUTH_TOKEN = None  # Set this after login

def login_and_get_token(email: str, password: str) -> str:
    """Login and get authentication token."""
    url = f"{BASE_URL}/auth/login/"
    data = {
        "email": email,
        "password": password
    }
    
    response = requests.post(url, json=data)
    if response.status_code == 200:
        token_data = response.json()
        return token_data.get('tokens', {}).get('access')
    else:
        print(f"Login failed: {response.status_code} - {response.text}")
        return None

def get_headers() -> Dict[str, str]:
    """Get headers with authentication token."""
    headers = {
        "Content-Type": "application/json"
    }
    if AUTH_TOKEN:
        headers["Authorization"] = f"Bearer {AUTH_TOKEN}"
    return headers

def test_get_all_deliveries():
    """Test GET /api/delivery/requests/ - Get all delivery requests."""
    print("\n=== Testing GET All Deliveries ===")
    url = f"{BASE_URL}/delivery/requests/"
    
    # Test with different query parameters
    params_list = [
        {},  # No filters
        {"status": "pending"},  # Filter by status
        {"status": "completed"},  # Filter by status
        {"page": 1},  # Pagination
        {"search": "test"},  # Search
        {"ordering": "-created_at"},  # Ordering
    ]
    
    for params in params_list:
        print(f"\nRequesting with params: {params}")
        response = requests.get(url, headers=get_headers(), params=params)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Success: Found {len(data.get('results', data))} deliveries")
            if data.get('results'):
                print(f"   First delivery: {data['results'][0].get('id')}")
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")

def test_get_single_delivery(delivery_id: int):
    """Test GET /api/delivery/requests/{id}/ - Get single delivery request."""
    print(f"\n=== Testing GET Single Delivery (ID: {delivery_id}) ===")
    url = f"{BASE_URL}/delivery/requests/{delivery_id}/"
    
    response = requests.get(url, headers=get_headers())
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Success: Delivery {data.get('id')}")
        print(f"   Status: {data.get('status')}")
        print(f"   Pickup: {data.get('pickup_address')}")
        print(f"   Dropoff: {data.get('dropoff_address')}")
    else:
        print(f"❌ Error: {response.status_code} - {response.text}")

def test_create_delivery():
    """Test POST /api/delivery/requests/ - Create new delivery request."""
    print("\n=== Testing CREATE Delivery ===")
    url = f"{BASE_URL}/delivery/requests/"
    
    data = {
        "pickup_address": "123 Main St, City",
        "dropoff_address": "456 Oak Ave, Town",
        "customer_name": "John Doe",
        "customer_phone": "+1234567890",
        "delivery_notes": "Fragile items, handle with care",
        "pickup_lat": "40.7128",
        "pickup_lng": "-74.0060",
        "dropoff_lat": "40.7589",
        "dropoff_lng": "-73.9851"
    }
    
    response = requests.post(url, headers=get_headers(), json=data)
    
    if response.status_code == 201:
        data = response.json()
        print(f"✅ Success: Created delivery {data.get('id')}")
        return data.get('id')
    else:
        print(f"❌ Error: {response.status_code} - {response.text}")
        return None

def test_update_delivery(delivery_id: int):
    """Test PATCH /api/delivery/requests/{id}/ - Update delivery request."""
    print(f"\n=== Testing UPDATE Delivery (ID: {delivery_id}) ===")
    url = f"{BASE_URL}/delivery/requests/{delivery_id}/"
    
    data = {
        "delivery_notes": "Updated notes - please deliver to back entrance"
    }
    
    response = requests.patch(url, headers=get_headers(), json=data)
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Success: Updated delivery {data.get('id')}")
        print(f"   New notes: {data.get('delivery_notes')}")
    else:
        print(f"❌ Error: {response.status_code} - {response.text}")

def test_update_delivery_status(delivery_id: int, status: str):
    """Test PATCH /api/delivery/requests/{id}/status/ - Update delivery status."""
    print(f"\n=== Testing UPDATE Delivery Status (ID: {delivery_id}, Status: {status}) ===")
    url = f"{BASE_URL}/delivery/requests/{delivery_id}/status/"
    
    data = {"status": status}
    
    response = requests.patch(url, headers=get_headers(), json=data)
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Success: Updated status to {data.get('status')}")
    else:
        print(f"❌ Error: {response.status_code} - {response.text}")

def test_delete_delivery(delivery_id: int):
    """Test DELETE /api/delivery/requests/{id}/ - Delete delivery request."""
    print(f"\n=== Testing DELETE Delivery (ID: {delivery_id}) ===")
    url = f"{BASE_URL}/delivery/requests/{delivery_id}/"
    
    response = requests.delete(url, headers=get_headers())
    
    if response.status_code == 204:
        print(f"✅ Success: Deleted delivery {delivery_id}")
    else:
        print(f"❌ Error: {response.status_code} - {response.text}")

def test_get_delivery_statistics():
    """Test GET /api/delivery/statistics/ - Get delivery statistics."""
    print("\n=== Testing GET Delivery Statistics ===")
    url = f"{BASE_URL}/delivery/statistics/"
    
    response = requests.get(url, headers=get_headers())
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Success: Retrieved statistics")
        print(f"   Total requests: {data.get('total_requests')}")
        print(f"   Pending requests: {data.get('pending_requests')}")
        print(f"   Completed requests: {data.get('completed_requests')}")
        print(f"   Success rate: {data.get('success_rate')}%")
    else:
        print(f"❌ Error: {response.status_code} - {response.text}")

def test_get_pending_sync():
    """Test GET /api/delivery/sync/pending/ - Get pending sync requests."""
    print("\n=== Testing GET Pending Sync ===")
    url = f"{BASE_URL}/delivery/sync/pending/"
    
    response = requests.get(url, headers=get_headers())
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Success: Found {len(data)} pending sync requests")
    else:
        print(f"❌ Error: {response.status_code} - {response.text}")

def test_offline_sync():
    """Test POST /api/delivery/sync/ - Offline sync."""
    print("\n=== Testing OFFLINE SYNC ===")
    url = f"{BASE_URL}/delivery/sync/"
    
    data = {
        "local_id": "local_1234567890",
        "pickup_address": "789 Sync St, City",
        "dropoff_address": "321 Sync Ave, Town",
        "customer_name": "Sync User",
        "customer_phone": "+1234567890",
        "delivery_notes": "Synced from offline",
        "created_at": "2024-01-01T12:00:00Z"
    }
    
    response = requests.post(url, headers=get_headers(), json=data)
    
    if response.status_code == 201:
        data = response.json()
        print(f"✅ Success: Synced offline delivery {data.get('id')}")
        return data.get('id')
    else:
        print(f"❌ Error: {response.status_code} - {response.text}")
        return None

def test_bulk_sync():
    """Test POST /api/delivery/sync/bulk/ - Bulk sync."""
    print("\n=== Testing BULK SYNC ===")
    url = f"{BASE_URL}/delivery/sync/bulk/"
    
    data = {
        "requests": [
            {
                "local_id": "local_1111111111",
                "pickup_address": "111 Bulk St, City",
                "dropoff_address": "222 Bulk Ave, Town",
                "customer_name": "Bulk User 1",
                "customer_phone": "+1111111111",
                "delivery_notes": "Bulk sync 1"
            },
            {
                "local_id": "local_2222222222",
                "pickup_address": "333 Bulk St, City",
                "dropoff_address": "444 Bulk Ave, Town",
                "customer_name": "Bulk User 2",
                "customer_phone": "+2222222222",
                "delivery_notes": "Bulk sync 2"
            }
        ]
    }
    
    response = requests.post(url, headers=get_headers(), json=data)
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Success: Bulk synced {len(data.get('synced', []))} deliveries")
        print(f"   Failed: {len(data.get('failed', []))}")
    else:
        print(f"❌ Error: {response.status_code} - {response.text}")

def test_assign_partner(delivery_id: int, partner_id: int):
    """Test POST /api/delivery/requests/{id}/assign-partner/ - Assign partner."""
    print(f"\n=== Testing ASSIGN PARTNER (Delivery: {delivery_id}, Partner: {partner_id}) ===")
    url = f"{BASE_URL}/delivery/requests/{delivery_id}/assign-partner/"
    
    data = {"partner_id": partner_id}
    
    response = requests.post(url, headers=get_headers(), json=data)
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Success: Assigned partner to delivery")
    else:
        print(f"❌ Error: {response.status_code} - {response.text}")

def test_get_sync_logs(delivery_id: int):
    """Test GET /api/delivery/requests/{id}/sync-logs/ - Get sync logs."""
    print(f"\n=== Testing GET SYNC LOGS (Delivery: {delivery_id}) ===")
    url = f"{BASE_URL}/delivery/requests/{delivery_id}/sync-logs/"
    
    response = requests.get(url, headers=get_headers())
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Success: Found {len(data.get('results', data))} sync logs")
    else:
        print(f"❌ Error: {response.status_code} - {response.text}")

def main():
    """Main test function."""
    global AUTH_TOKEN
    
    print("🚀 Delivery API Test Suite")
    print("=" * 50)
    
    # Login first
    print("\n🔐 Logging in...")
    AUTH_TOKEN = login_and_get_token("test@example.com", "password123")
    
    if not AUTH_TOKEN:
        print("❌ Cannot proceed without authentication token")
        return
    
    print(f"✅ Logged in successfully")
    
    # Test all endpoints
    test_get_all_deliveries()
    
    # Create a new delivery for testing
    new_delivery_id = test_create_delivery()
    
    if new_delivery_id:
        test_get_single_delivery(new_delivery_id)
        test_update_delivery(new_delivery_id)
        test_update_delivery_status(new_delivery_id, "assigned")
        test_get_sync_logs(new_delivery_id)
        # Don't delete for now to keep it for testing
    
    test_get_delivery_statistics()
    test_get_pending_sync()
    
    # Test sync operations
    synced_delivery_id = test_offline_sync()
    test_bulk_sync()
    
    if synced_delivery_id:
        test_assign_partner(synced_delivery_id, 1)  # Assuming partner ID 1 exists
    
    print("\n" + "=" * 50)
    print("✅ All delivery API tests completed!")
    print("\n📋 Summary of available endpoints:")
    print("   GET    /api/delivery/requests/           - List all deliveries")
    print("   GET    /api/delivery/requests/{id}/      - Get single delivery")
    print("   POST   /api/delivery/requests/           - Create delivery")
    print("   PATCH  /api/delivery/requests/{id}/      - Update delivery")
    print("   PATCH  /api/delivery/requests/{id}/status/ - Update status")
    print("   DELETE /api/delivery/requests/{id}/      - Delete delivery")
    print("   GET    /api/delivery/statistics/         - Get statistics")
    print("   GET    /api/delivery/sync/pending/       - Get pending sync")
    print("   POST   /api/delivery/sync/               - Offline sync")
    print("   POST   /api/delivery/sync/bulk/          - Bulk sync")
    print("   POST   /api/delivery/requests/{id}/assign-partner/ - Assign partner")
    print("   GET    /api/delivery/requests/{id}/sync-logs/ - Get sync logs")

if __name__ == "__main__":
    main() 