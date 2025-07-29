# 🚀 Quick Start - Django Server

## Option 1: Automated Setup (Recommended)

```bash
cd backend

# Run the automated setup script
python setup.py

# Start the server
python run_server.py
```

## Option 2: Manual Setup

### 1. Setup Environment

```bash
cd backend

# Create virtual environment (if not exists)
python -m venv venv

# Activate virtual environment
# macOS/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Create Environment File

```bash
# Create .env file with default values
python setup.py
```

### 4. Edit .env File

Open `.env` file and update these values:

```bash
# For SQLite (easiest for development)
DATABASE_URL=sqlite:///db.sqlite3

# For PostgreSQL (if you have it installed)
# DATABASE_URL=postgresql://username:password@localhost:5432/sajilo_life_db
```

### 5. Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. Create Superuser

```bash
python manage.py createsuperuser
```

### 7. Start Server

```bash
python manage.py runserver
```

## 🎯 Server is Running!

- **API Base URL**: http://localhost:8000/api/
- **Admin Panel**: http://localhost:8000/admin/
- **API Documentation**: http://localhost:8000/api/schema/swagger-ui/

## 📱 Connect Mobile App

Update your mobile app's API configuration to point to:

```
http://localhost:8000/api/
```

## 🔧 Common Commands

```bash
# Start server
python manage.py runserver


# Start server accessible from other devices
python manage.py runserver 0.0.0.0:8000

# Create superuser
python manage.py createsuperuser

# Run tests
python manage.py test

# Check server status
curl http://localhost:8000/api/
```

## 🐛 Troubleshooting

### Database Issues

```bash
# Reset database (WARNING: deletes all data)
python manage.py flush

# Check database connection
python manage.py dbshell
```

✅ **API Endpoints**

- Authentication (/api/auth/)
- Delivery requests (/api/delivery/)
- Partner management (/api/partners/)
- Sync operations (/api/sync/)

The Django server is now ready to serve the Sajilo Life delivery platform! 🎉
