# Sajilo Life - Database Design Document

## 1. Entity Relationship Diagram (ERD)

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     User        │    │ DeliveryRequest │    │ DeliveryPartner │
│                 │    │                 │    │                 │
│ • id (PK)       │    │ • id (PK)       │    │ • id (PK)       │
│ • username      │    │ • customer (FK) │    │ • user (FK)     │
│ • email         │    │ • partner (FK)  │    │ • vehicle_type  │
│ • phone         │    │ • pickup_addr   │    │ • is_available  │
│ • role          │    │ • dropoff_addr  │    │ • current_lat   │
│ • is_active     │    │ • status        │    │ • current_lng   │
│ • created_at    │    │ • notes         │    │ • rating        │
│ • updated_at    │    │ • created_at    │    │ • updated_at    │
│                 │    │ • updated_at    │    │ • updated_at    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         │                       │                       │
         │              ┌─────────────────┐              │
         │              │  SyncLog        │              │
         │              │                 │              │
         └──────────────► • id (PK)       │◄─────────────┘
                        │ • request (FK)  │
                        │ • sync_status   │
                        │ • error_message │
                        │ • synced_at     │
                        │ • created_at    │
                        └─────────────────┘
```

## 2. Database Schema

### User Model

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(150) UNIQUE NOT NULL,
    email VARCHAR(254) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password VARCHAR(128) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'customer',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### DeliveryRequest Model

```sql
CREATE TABLE delivery_requests (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES users(id),
    partner_id INTEGER REFERENCES delivery_partners(id),
    pickup_address TEXT NOT NULL,
    dropoff_address TEXT NOT NULL,
    pickup_lat DECIMAL(10, 8),
    pickup_lng DECIMAL(11, 8),
    dropoff_lat DECIMAL(10, 8),
    dropoff_lng DECIMAL(11, 8),
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    delivery_notes TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    estimated_distance DECIMAL(8, 2),
    estimated_duration INTEGER,
    actual_distance DECIMAL(8, 2),
    actual_duration INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_synced BOOLEAN DEFAULT TRUE,
    local_id VARCHAR(50) -- For offline sync
);
```

### DeliveryPartner Model

```sql
CREATE TABLE delivery_partners (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    vehicle_type VARCHAR(50) NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    current_lat DECIMAL(10, 8),
    current_lng DECIMAL(11, 8),
    rating DECIMAL(3, 2) DEFAULT 0.0,
    total_deliveries INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### SyncLog Model

```sql
CREATE TABLE sync_logs (
    id SERIAL PRIMARY KEY,
    request_id INTEGER REFERENCES delivery_requests(id),
    sync_status VARCHAR(20) NOT NULL,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    synced_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 3. Index Strategy

### Primary Indexes

- All primary keys are automatically indexed
- Foreign key columns for performance

### Secondary Indexes

```sql
-- User table indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);

-- DeliveryRequest table indexes
CREATE INDEX idx_delivery_requests_customer ON delivery_requests(customer_id);
CREATE INDEX idx_delivery_requests_partner ON delivery_requests(partner_id);
CREATE INDEX idx_delivery_requests_status ON delivery_requests(status);
CREATE INDEX idx_delivery_requests_created ON delivery_requests(created_at);
CREATE INDEX idx_delivery_requests_synced ON delivery_requests(is_synced);
CREATE INDEX idx_delivery_requests_local_id ON delivery_requests(local_id);

-- DeliveryPartner table indexes
CREATE INDEX idx_delivery_partners_user ON delivery_partners(user_id);
CREATE INDEX idx_delivery_partners_available ON delivery_partners(is_available);
CREATE INDEX idx_delivery_partners_location ON delivery_partners(current_lat, current_lng);

-- SyncLog table indexes
CREATE INDEX idx_sync_logs_request ON sync_logs(request_id);
CREATE INDEX idx_sync_logs_status ON sync_logs(sync_status);
CREATE INDEX idx_sync_logs_created ON sync_logs(created_at);
```

### Composite Indexes

```sql
-- For location-based queries
CREATE INDEX idx_delivery_partners_location_available
ON delivery_partners(current_lat, current_lng, is_available);

-- For status and date queries
CREATE INDEX idx_delivery_requests_status_date
ON delivery_requests(status, created_at);
```

## 4. Data Types and Constraints

### Enums and Choices

```python
# User roles
USER_ROLES = [
    ('admin', 'Admin'),
    ('partner', 'Delivery Partner'),
    ('customer', 'Customer'),
]

# Delivery status
DELIVERY_STATUS = [
    ('pending', 'Pending'),
    ('assigned', 'Assigned to Partner'),
    ('picked_up', 'Picked Up'),
    ('in_transit', 'In Transit'),
    ('delivered', 'Delivered'),
    ('cancelled', 'Cancelled'),
    ('failed', 'Failed'),
]

# Vehicle types
VEHICLE_TYPES = [
    ('motorcycle', 'Motorcycle'),
    ('bicycle', 'Bicycle'),
    ('car', 'Car'),
    ('van', 'Van'),
]

# Sync status
SYNC_STATUS = [
    ('pending', 'Pending'),
    ('success', 'Success'),
    ('failed', 'Failed'),
    ('retry', 'Retry'),
]
```

### Validation Rules

- Email must be valid format
- Phone numbers must be valid format
- Coordinates must be within valid ranges
- Status transitions must follow business rules
- Distance and duration must be positive numbers

## 5. Relationships and Constraints

### Foreign Key Constraints

```sql
-- DeliveryRequest -> User (customer)
ALTER TABLE delivery_requests
ADD CONSTRAINT fk_delivery_requests_customer
FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE;

-- DeliveryRequest -> DeliveryPartner
ALTER TABLE delivery_requests
ADD CONSTRAINT fk_delivery_requests_partner
FOREIGN KEY (partner_id) REFERENCES delivery_partners(id) ON DELETE SET NULL;

-- DeliveryPartner -> User
ALTER TABLE delivery_partners
ADD CONSTRAINT fk_delivery_partners_user
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- SyncLog -> DeliveryRequest
ALTER TABLE sync_logs
ADD CONSTRAINT fk_sync_logs_request
FOREIGN KEY (request_id) REFERENCES delivery_requests(id) ON DELETE CASCADE;
```

### Check Constraints

```sql
-- Valid status values
ALTER TABLE delivery_requests
ADD CONSTRAINT check_valid_status
CHECK (status IN ('pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled', 'failed'));

-- Valid coordinates
ALTER TABLE delivery_requests
ADD CONSTRAINT check_valid_coordinates
CHECK (
    (pickup_lat IS NULL OR (pickup_lat >= -90 AND pickup_lat <= 90)) AND
    (pickup_lng IS NULL OR (pickup_lng >= -180 AND pickup_lng <= 180)) AND
    (dropoff_lat IS NULL OR (dropoff_lat >= -90 AND dropoff_lat <= 90)) AND
    (dropoff_lng IS NULL OR (dropoff_lng >= -180 AND dropoff_lng <= 180))
);

-- Valid rating
ALTER TABLE delivery_partners
ADD CONSTRAINT check_valid_rating
CHECK (rating >= 0 AND rating <= 5);
```

## 6. Data Migration Strategy

### Initial Migration

```python
# Django migration example
class Migration(migrations.Migration):
    dependencies = []

    operations = [
        migrations.CreateModel(
            name='User',
            fields=[
                ('id', models.AutoField(primary_key=True)),
                ('username', models.CharField(max_length=150, unique=True)),
                ('email', models.EmailField(max_length=254, unique=True)),
                ('phone', models.CharField(max_length=20, blank=True)),
                ('password', models.CharField(max_length=128)),
                ('role', models.CharField(max_length=20, default='customer')),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
        ),
        # ... other models
    ]
```

### Data Seeding

```python
# Sample data for testing
def seed_sample_data():
    # Create admin user
    admin_user = User.objects.create_user(
        username='admin',
        email='admin@sajilo.life',
        password='admin123',
        role='admin'
    )

    # Create sample partners
    partner1 = User.objects.create_user(
        username='partner1',
        email='partner1@sajilo.life',
        password='partner123',
        role='partner'
    )

    DeliveryPartner.objects.create(
        user=partner1,
        vehicle_type='motorcycle',
        is_available=True,
        current_lat=27.7172,
        current_lng=85.3240
    )
```

## 7. Backup and Recovery Strategy

### Backup Strategy

- **Daily Backups**: Full database backup
- **Hourly Incremental**: Transaction log backups
- **Point-in-time Recovery**: Maintain backup history for 30 days
- **Offsite Storage**: Encrypted backups stored in cloud

### Recovery Procedures

1. **Full Recovery**: Restore from latest full backup
2. **Point-in-time Recovery**: Restore to specific timestamp
3. **Partial Recovery**: Restore specific tables or data
4. **Test Recovery**: Regular recovery testing

## 8. Performance Optimization

### Query Optimization

- Use database indexes effectively
- Implement query caching
- Optimize JOIN operations
- Use database views for complex queries

### Connection Pooling

- Configure connection pool size
- Monitor connection usage
- Implement connection timeout
- Use read replicas for read-heavy operations

### Monitoring

- Database performance metrics
- Query execution time monitoring
- Index usage statistics
- Connection pool monitoring
