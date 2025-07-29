# Sajilo Life Backend - Django API Server

## 🚀 Quick Start

### 1. Setup Virtual Environment

```bash
cd backend

# Create virtual environment (if not already created)
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Environment Configuration

Create a `.env` file in the backend directory:

```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/sajilo_life_db

# Django Settings
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# JWT Settings
JWT_SECRET_KEY=your-jwt-secret-key
JWT_ACCESS_TOKEN_LIFETIME=60
JWT_REFRESH_TOKEN_LIFETIME=1440

# Redis (for Celery)
REDIS_URL=redis://localhost:6379/0

# Email Settings (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

### 4. Database Setup

```bash
# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

### 5. Run the Server

```bash
# Development server
python manage.py runserver

# Or with specific host/port
python manage.py runserver 0.0.0.0:8000
```

## 📊 Database Models

### DeliveryRequest

- Customer and partner information
- Pickup and dropoff locations with coordinates
- Status tracking (pending, assigned, picked_up, in_transit, delivered, cancelled, failed)
- Distance and duration estimates
- Offline sync support

### SyncLog

- Tracks sync operations for offline support
- Retry mechanism for failed syncs
- Error logging and monitoring

### User Management

- Role-based authentication (customer, partner, admin)
- JWT token authentication
- User profiles and preferences

## 🔌 API Endpoints

### Authentication

```
POST /api/auth/login/ - User login
POST /api/auth/register/ - User registration
POST /api/auth/refresh/ - Refresh JWT token
POST /api/auth/logout/ - User logout
```

### Delivery Requests

```
GET    /api/delivery/requests/ - List delivery requests
POST   /api/delivery/requests/ - Create new delivery request
GET    /api/delivery/requests/{id}/ - Get delivery request details
PUT    /api/delivery/requests/{id}/ - Update delivery request
DELETE /api/delivery/requests/{id}/ - Delete delivery request
PATCH  /api/delivery/requests/{id}/status/ - Update delivery status
```

### Partner Management

```
GET    /api/partners/ - List delivery partners
GET    /api/partners/{id}/ - Get partner details
POST   /api/partners/assign/{request_id}/ - Assign partner to delivery
```

### Sync Operations

```
POST   /api/sync/bulk/ - Bulk sync offline requests
GET    /api/sync/status/ - Get sync status
POST   /api/sync/retry/{log_id}/ - Retry failed sync
```

## 🛠 Development Commands

### Database Operations

```bash
# Create new migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Reset database (WARNING: deletes all data)
python manage.py flush

# Create test data
python manage.py loaddata fixtures/test_data.json
```

### Testing

```bash
# Run all tests
python manage.py test

# Run specific app tests
python manage.py test delivery

# Run with coverage
pytest --cov=delivery --cov-report=html
```

### Code Quality

```bash
# Format code
black .

# Check code style
flake8 .

# Sort imports
isort .
```

### Management Commands

```bash
# Create test users
python manage.py create_test_users

# Sync offline requests
python manage.py sync_offline_requests

# Clean old sync logs
python manage.py clean_sync_logs
```

## 🔧 Configuration

### Settings Structure

- `sajilo_life/settings.py` - Main Django settings
- `sajilo_life/urls.py` - Main URL configuration
- `delivery/urls.py` - Delivery app URLs
- `users/urls.py` - User management URLs
- `partners/urls.py` - Partner management URLs

### Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- `SECRET_KEY` - Django secret key
- `DEBUG` - Debug mode (True/False)
- `ALLOWED_HOSTS` - Comma-separated list of allowed hosts
- `JWT_SECRET_KEY` - JWT signing key
- `REDIS_URL` - Redis connection for Celery

## 📱 Mobile App Integration

### API Base URL

```
http://localhost:8000/api/
```

### Authentication Headers

```javascript
headers: {
  'Authorization': 'Bearer <jwt_token>',
  'Content-Type': 'application/json'
}
```

### Offline Sync Flow

1. Mobile app creates requests locally when offline
2. Requests are marked with `is_synced=False`
3. When online, app sends bulk sync request
4. Server processes and validates requests
5. Server returns sync status for each request

## 🚀 Production Deployment

### Using Gunicorn

```bash
gunicorn sajilo_life.wsgi:application --bind 0.0.0.0:8000 --workers 4
```

### Using Docker

```bash
# Build image
docker build -t sajilo-life-backend .

# Run container
docker run -p 8000:8000 sajilo-life-backend
```

### Environment Variables for Production

```bash
DEBUG=False
ALLOWED_HOSTS=your-domain.com,www.your-domain.com
DATABASE_URL=postgresql://user:pass@host:5432/dbname
SECRET_KEY=your-production-secret-key
```

## 📋 API Documentation

### Swagger/OpenAPI

Access the interactive API documentation at:

```
http://localhost:8000/api/schema/swagger-ui/
```

### Postman Collection

Import the Postman collection from:

```
docs/postman/Sajilo_Life_API.postman_collection.json
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**

   - Check PostgreSQL is running
   - Verify DATABASE_URL in .env
   - Ensure database exists

2. **Migration Errors**

   - Delete migrations folder and recreate
   - Check for conflicting migrations
   - Reset database if needed

3. **JWT Token Issues**

   - Verify JWT_SECRET_KEY is set
   - Check token expiration settings
   - Ensure proper token format

4. **CORS Errors**
   - Add frontend domain to CORS_ALLOWED_ORIGINS
   - Check CORS settings in settings.py

### Logs

Check logs in the `logs/` directory:

- `django.log` - Django application logs
- `celery.log` - Background task logs
- `error.log` - Error logs

## 📞 Support

For technical support or questions:

- Check the API documentation
- Review the logs for error details
- Test with Postman collection
- Contact the development team

## 🎯 Next Steps

1. **Set up PostgreSQL database**
2. **Configure environment variables**
3. **Run migrations**
4. **Create superuser**
5. **Start the development server**
6. **Test API endpoints**
7. **Connect mobile app**

The backend is now ready to serve the Sajilo Life delivery platform!
