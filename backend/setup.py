#!/usr/bin/env python3
"""
Setup script for Sajilo Life Django backend
"""
import os
import sys
import subprocess
from pathlib import Path

def create_env_file():
    """Create .env file with default values"""
    env_content = """# Django Settings
SECRET_KEY=django-insecure-your-secret-key-here-change-this-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0

# Database Configuration
# For PostgreSQL (recommended for production)
DATABASE_URL=postgresql://username:password@localhost:5432/sajilo_life_db

# For SQLite (development only)
# DATABASE_URL=sqlite:///db.sqlite3

# JWT Settings
JWT_SECRET_KEY=your-jwt-secret-key-change-this-in-production
JWT_ACCESS_TOKEN_LIFETIME=60
JWT_REFRESH_TOKEN_LIFETIME=1440

# Redis Configuration (for Celery background tasks)
REDIS_URL=redis://localhost:6379/0

# Email Settings (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# CORS Settings
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Logging
LOG_LEVEL=INFO
LOG_FILE=logs/django.log

# API Documentation
SPECTACULAR_SETTINGS_TITLE=Sajilo Life API
SPECTACULAR_SETTINGS_DESCRIPTION=API for Sajilo Life delivery platform
SPECTACULAR_SETTINGS_VERSION=1.0.0

# Security Settings
CSRF_TRUSTED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
"""
    
    env_file = Path('.env')
    if env_file.exists():
        print("⚠️  .env file already exists")
        response = input("Do you want to overwrite it? (y/N): ")
        if response.lower() != 'y':
            return True
    
    with open('.env', 'w') as f:
        f.write(env_content)
    print("✅ .env file created")
    print("   Please edit .env file with your actual values")
    return True

def setup_database():
    """Setup database configuration"""
    print("\n📊 Database Setup")
    print("Choose your database:")
    print("1. SQLite (recommended for development)")
    print("2. PostgreSQL (recommended for production)")
    
    choice = input("Enter your choice (1 or 2): ")
    
    if choice == "1":
        # Use SQLite
        print("✅ Using SQLite database")
        print("   Database will be created automatically")
        return True
    elif choice == "2":
        # Use PostgreSQL
        print("⚠️  PostgreSQL setup required")
        print("   Please ensure PostgreSQL is installed and running")
        print("   Update DATABASE_URL in .env file")
        return True
    else:
        print("❌ Invalid choice")
        return False

def install_dependencies():
    """Install Python dependencies"""
    print("\n📦 Installing dependencies...")
    try:
        subprocess.run([sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'], check=True)
        print("✅ Dependencies installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        return False

def run_migrations():
    """Run database migrations"""
    print("\n🔄 Running migrations...")
    try:
        subprocess.run([sys.executable, 'manage.py', 'makemigrations'], check=True)
        subprocess.run([sys.executable, 'manage.py', 'migrate'], check=True)
        print("✅ Migrations completed")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Migration failed: {e}")
        return False

def create_superuser():
    """Create superuser"""
    print("\n👤 Creating superuser...")
    try:
        subprocess.run([sys.executable, 'manage.py', 'createsuperuser'], check=True)
        print("✅ Superuser created")
        return True
    except subprocess.CalledProcessError as e:
        print(f"⚠️  Could not create superuser: {e}")
        print("   You can create one later with: python manage.py createsuperuser")
        return False

def create_logs_directory():
    """Create logs directory"""
    logs_dir = Path('logs')
    logs_dir.mkdir(exist_ok=True)
    print("✅ Logs directory created")

def main():
    """Main setup function"""
    print("=" * 50)
    print("🚀 Sajilo Life Backend Setup")
    print("=" * 50)
    
    # Change to backend directory
    backend_dir = Path(__file__).parent
    os.chdir(backend_dir)
    
    # Check Python version
    if sys.version_info < (3, 8):
        print("❌ Python 3.8 or higher is required")
        sys.exit(1)
    
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} detected")
    
    # Check virtual environment
    if not (hasattr(sys, 'real_prefix') or (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix)):
        print("⚠️  Virtual environment not detected")
        print("   It's recommended to use a virtual environment")
        response = input("Continue anyway? (y/N): ")
        if response.lower() != 'y':
            sys.exit(1)
    
    # Setup steps
    steps = [
        ("Create .env file", create_env_file),
        ("Setup database", setup_database),
        ("Install dependencies", install_dependencies),
        ("Create logs directory", create_logs_directory),
        ("Run migrations", run_migrations),
        ("Create superuser", create_superuser),
    ]
    
    for step_name, step_func in steps:
        print(f"\n🔄 {step_name}...")
        if not step_func():
            print(f"❌ {step_name} failed")
            response = input("Continue with next step? (y/N): ")
            if response.lower() != 'y':
                break
    
    print("\n" + "=" * 50)
    print("🎉 Setup completed!")
    print("=" * 50)
    print("\n📋 Next steps:")
    print("1. Edit .env file with your actual values")
    print("2. Start the server: python run_server.py")
    print("3. Access the API at: http://localhost:8000/api/")
    print("4. View API docs at: http://localhost:8000/api/schema/swagger-ui/")
    print("\n📚 For more information, see README.md")

if __name__ == '__main__':
    main() 