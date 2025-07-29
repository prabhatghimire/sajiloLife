# Delivery API Endpoints Documentation

This document provides a comprehensive overview of all available delivery API endpoints in the Sajilo Life application.

## Base URL

```
http://localhost:8000/api/delivery/
```

## Authentication

All endpoints require authentication. Include the Bearer token in the Authorization header:

```
Authorization: Bearer <your_access_token>
```

## Endpoints Overview

### 1. List All Delivery Requests

**GET** `/api/delivery/requests/`

Retrieves all delivery requests with optional filtering, searching, and pagination.

**Query Parameters:**

- `status` (optional): Filter by status (`pending`, `assigned`, `picked_up`, `in_transit`, `delivered`, `cancelled`, `failed`)
- `is_synced` (optional): Filter by sync status (`true`, `false`)
- `search` (optional): Search in pickup_address, dropoff_address, customer_name
- `ordering` (optional): Order by field (`created_at`, `status`, `-created_at`, `-status`)
- `page` (optional): Page number for pagination
- `page_size` (optional): Number of items per page

**Response:**

```json
{
  "count": 10,
  "next": "http://localhost:8000/api/delivery/requests/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "customer": {
        "id": 1,
        "email": "customer@example.com",
        "first_name": "John",
        "last_name": "Doe"
      },
      "partner": 2,
      "partner_name": "Jane Smith",
      "partner_phone": "+1234567890",
      "pickup_address": "123 Main St, City",
      "dropoff_address": "456 Oak Ave, Town",
      "pickup_lat": "40.7128",
      "pickup_lng": "-74.0060",
      "dropoff_lat": "40.7589",
      "dropoff_lng": "-73.9851",
      "customer_name": "John Doe",
      "customer_phone": "+1234567890",
      "delivery_notes": "Fragile items",
      "status": "pending",
      "status_display": "Pending",
      "estimated_distance": "5.2",
      "estimated_duration": 15,
      "actual_distance": null,
      "actual_duration": null,
      "created_at": "2024-01-01T12:00:00Z",
      "updated_at": "2024-01-01T12:00:00Z",
      "is_synced": true,
      "local_id": null
    }
  ]
}
```

### 2. Get Single Delivery Request

**GET** `/api/delivery/requests/{id}/`

Retrieves a specific delivery request by ID.

**Response:**

```json
{
  "id": 1,
  "customer": {
    "id": 1,
    "email": "customer@example.com",
    "first_name": "John",
    "last_name": "Doe"
  },
  "partner": 2,
  "partner_name": "Jane Smith",
  "partner_phone": "+1234567890",
  "pickup_address": "123 Main St, City",
  "dropoff_address": "456 Oak Ave, Town",
  "pickup_lat": "40.7128",
  "pickup_lng": "-74.0060",
  "dropoff_lat": "40.7589",
  "dropoff_lng": "-73.9851",
  "customer_name": "John Doe",
  "customer_phone": "+1234567890",
  "delivery_notes": "Fragile items",
  "status": "pending",
  "status_display": "Pending",
  "estimated_distance": "5.2",
  "estimated_duration": 15,
  "actual_distance": null,
  "actual_duration": null,
  "created_at": "2024-01-01T12:00:00Z",
  "updated_at": "2024-01-01T12:00:00Z",
  "is_synced": true,
  "local_id": null
}
```

### 3. Create Delivery Request

**POST** `/api/delivery/requests/`

Creates a new delivery request.

**Request Body:**

```json
{
  "pickup_address": "123 Main St, City",
  "dropoff_address": "456 Oak Ave, Town",
  "pickup_lat": "40.7128",
  "pickup_lng": "-74.0060",
  "dropoff_lat": "40.7589",
  "dropoff_lng": "-73.9851",
  "customer_name": "John Doe",
  "customer_phone": "+1234567890",
  "delivery_notes": "Fragile items, handle with care",
  "local_id": "local_1234567890"
}
```

**Response:** `201 Created`

```json
{
  "id": 1,
  "customer": {
    "id": 1,
    "email": "customer@example.com",
    "first_name": "John",
    "last_name": "Doe"
  },
  "partner": null,
  "partner_name": null,
  "partner_phone": null,
  "pickup_address": "123 Main St, City",
  "dropoff_address": "456 Oak Ave, Town",
  "pickup_lat": "40.7128",
  "pickup_lng": "-74.0060",
  "dropoff_lat": "40.7589",
  "dropoff_lng": "-73.9851",
  "customer_name": "John Doe",
  "customer_phone": "+1234567890",
  "delivery_notes": "Fragile items, handle with care",
  "status": "pending",
  "status_display": "Pending",
  "estimated_distance": null,
  "estimated_duration": null,
  "actual_distance": null,
  "actual_duration": null,
  "created_at": "2024-01-01T12:00:00Z",
  "updated_at": "2024-01-01T12:00:00Z",
  "is_synced": true,
  "local_id": "local_1234567890"
}
```

### 4. Update Delivery Request

**PATCH** `/api/delivery/requests/{id}/`

Updates an existing delivery request.

**Request Body:**

```json
{
  "pickup_address": "Updated pickup address",
  "delivery_notes": "Updated notes"
}
```

**Response:** `200 OK`

```json
{
  "id": 1,
  "pickup_address": "Updated pickup address",
  "delivery_notes": "Updated notes"
  // ... other fields
}
```

### 5. Update Delivery Status

**PATCH** `/api/delivery/requests/{id}/status/`

Updates the status of a delivery request.

**Request Body:**

```json
{
  "status": "assigned"
}
```

**Valid Status Values:**

- `pending` → `assigned`
- `assigned` → `picked_up`
- `picked_up` → `in_transit`
- `in_transit` → `delivered`
- Any status → `cancelled` or `failed`

**Response:** `200 OK`

```json
{
  "id": 1,
  "status": "assigned",
  "status_display": "Assigned to Partner"
}
```

### 6. Delete Delivery Request

**DELETE** `/api/delivery/requests/{id}/`

Deletes a delivery request.

**Response:** `204 No Content`

### 7. Get Delivery Statistics

**GET** `/api/delivery/statistics/`

Retrieves delivery statistics for the authenticated user.

**Response:**

```json
{
  "total_requests": 100,
  "pending_requests": 15,
  "active_requests": 25,
  "completed_requests": 55,
  "cancelled_requests": 5,
  "success_rate": 91.67,
  "average_delivery_time": 45.5,
  "total_distance": 1250.75
}
```

### 8. Get Pending Sync Requests

**GET** `/api/delivery/sync/pending/`

Retrieves delivery requests that are pending synchronization.

**Response:**

```json
[
  {
    "id": 1,
    "local_id": "local_1234567890",
    "pickup_address": "123 Main St",
    "dropoff_address": "456 Oak Ave",
    "customer_name": "John Doe",
    "customer_phone": "+1234567890",
    "delivery_notes": "Fragile items",
    "created_at": "2024-01-01T12:00:00Z",
    "is_synced": false
  }
]
```

### 9. Offline Sync

**POST** `/api/delivery/sync/`

Synchronizes a single offline delivery request.

**Request Body:**

```json
{
  "local_id": "local_1234567890",
  "pickup_address": "123 Main St, City",
  "dropoff_address": "456 Oak Ave, Town",
  "pickup_lat": "40.7128",
  "pickup_lng": "-74.0060",
  "dropoff_lat": "40.7589",
  "dropoff_lng": "-73.9851",
  "customer_name": "John Doe",
  "customer_phone": "+1234567890",
  "delivery_notes": "Fragile items",
  "created_at": "2024-01-01T12:00:00Z"
}
```

**Response:** `201 Created`

```json
{
  "id": 1,
  "local_id": "local_1234567890",
  "is_synced": true
  // ... other fields
}
```

### 10. Bulk Sync

**POST** `/api/delivery/sync/bulk/`

Synchronizes multiple offline delivery requests.

**Request Body:**

```json
{
  "requests": [
    {
      "local_id": "local_1111111111",
      "pickup_address": "111 Main St",
      "dropoff_address": "222 Oak Ave",
      "customer_name": "User 1",
      "customer_phone": "+1111111111",
      "delivery_notes": "Bulk sync 1"
    },
    {
      "local_id": "local_2222222222",
      "pickup_address": "333 Main St",
      "dropoff_address": "444 Oak Ave",
      "customer_name": "User 2",
      "customer_phone": "+2222222222",
      "delivery_notes": "Bulk sync 2"
    }
  ]
}
```

**Response:** `200 OK`

```json
{
  "synced": [
    {
      "id": 1,
      "local_id": "local_1111111111",
      "is_synced": true
    }
  ],
  "failed": [
    {
      "local_id": "local_2222222222",
      "error": "Invalid phone number format"
    }
  ]
}
```

### 11. Assign Partner

**POST** `/api/delivery/requests/{id}/assign-partner/`

Assigns a delivery partner to a delivery request.

**Request Body:**

```json
{
  "partner_id": 2
}
```

**Response:** `200 OK`

```json
{
  "message": "Partner assigned successfully",
  "delivery_request": {
    "id": 1,
    "partner": 2,
    "partner_name": "Jane Smith",
    "status": "assigned"
  }
}
```

### 12. Get Sync Logs

**GET** `/api/delivery/requests/{id}/sync-logs/`

Retrieves sync logs for a specific delivery request.

**Response:**

```json
{
  "count": 3,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "request": 1,
      "sync_status": "success",
      "error_message": "",
      "retry_count": 0,
      "synced_at": "2024-01-01T12:00:00Z",
      "created_at": "2024-01-01T12:00:00Z"
    }
  ]
}
```

## Error Responses

### 400 Bad Request

```json
{
  "error": "Invalid data provided",
  "details": {
    "pickup_address": ["This field is required."],
    "customer_phone": ["Enter a valid phone number."]
  }
}
```

### 401 Unauthorized

```json
{
  "detail": "Authentication credentials were not provided."
}
```

### 403 Forbidden

```json
{
  "detail": "You do not have permission to perform this action."
}
```

### 404 Not Found

```json
{
  "detail": "Not found."
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal server error occurred."
}
```

## Usage Examples

### JavaScript/TypeScript (Fetch API)

```javascript
// Get all deliveries
const response = await fetch('/api/delivery/requests/', {
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});
const deliveries = await response.json();

// Create a delivery
const newDelivery = await fetch('/api/delivery/requests/', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    pickup_address: '123 Main St',
    dropoff_address: '456 Oak Ave',
    customer_name: 'John Doe',
    customer_phone: '+1234567890',
  }),
});
```

### Python (Requests)

```python
import requests

# Get all deliveries
response = requests.get(
    'http://localhost:8000/api/delivery/requests/',
    headers={'Authorization': f'Bearer {token}'}
)
deliveries = response.json()

# Create a delivery
response = requests.post(
    'http://localhost:8000/api/delivery/requests/',
    headers={'Authorization': f'Bearer {token}'},
    json={
        'pickup_address': '123 Main St',
        'dropoff_address': '456 Oak Ave',
        'customer_name': 'John Doe',
        'customer_phone': '+1234567890'
    }
)
```

## Notes

1. **Authentication**: All endpoints require a valid JWT token in the Authorization header.
2. **Permissions**: Users can only access their own delivery requests, partners can access assigned deliveries, and admins can access all deliveries.
3. **Status Transitions**: Delivery status changes follow a specific workflow and validation rules.
4. **Offline Support**: The API supports offline synchronization for mobile applications.
5. **Pagination**: List endpoints support pagination with configurable page sizes.
6. **Filtering**: Multiple filter options are available for efficient data retrieval.
7. **Search**: Full-text search is available across address and customer name fields.

## Testing

You can test all these endpoints using the provided test script:

```bash
cd backend
python test_delivery_api.py
```

Or use the interactive API documentation at:

```
http://localhost:8000/api/docs/
```
