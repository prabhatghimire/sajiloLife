#!/usr/bin/env python3
"""
Quick start script for Sajilo Life Django backend
"""
import os
import sys
import subprocess
from pathlib import Path

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 8):
        print("❌ Python 3.8 or higher is required")
        sys.exit(1)
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} detected")

def check_virtual_environment():
    """Check if virtual environment is activated"""
    if hasattr(sys, 'real_prefix') or (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix):
        print("✅ Virtual environment is activated")
        return True
    else:
        print("⚠️  Virtual environment not detected")
        print("   Run: source venv/bin/activate (macOS/Linux)")
        print("   Run: venv\\Scripts\\activate (Windows)")
        return False

def check_dependencies():
    """Check if required packages are installed"""
    try:
        import django
        import djangorestframework
        import psycopg2
        print("✅ Required packages are installed")
        return True
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        print("   Run: pip install -r requirements.txt")
        return False

def check_env_file():
    """Check if .env file exists"""
    env_file = Path('.env')
    if env_file.exists():
        print("✅ .env file found")
        return True
    else:
        print("⚠️  .env file not found")
        print("   Create .env file with required environment variables")
        return False

def check_database():
    """Check database connection"""
    try:
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sajilo_life.settings')
        import django
        django.setup()
        
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        print("✅ Database connection successful")
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        print("   Check your DATABASE_URL in .env file")
        return False

def run_migrations():
    """Run database migrations"""
    try:
        print("🔄 Running migrations...")
        subprocess.run([sys.executable, 'manage.py', 'migrate'], check=True)
        print("✅ Migrations completed")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Migration failed: {e}")
        return False

def create_superuser():
    """Create superuser if none exists"""
    try:
        from django.contrib.auth import get_user_model
        User = get_user_model()
        if not User.objects.filter(is_superuser=True).exists():
            print("🔄 Creating superuser...")
            subprocess.run([sys.executable, 'manage.py', 'createsuperuser'], check=True)
            print("✅ Superuser created")
        else:
            print("✅ Superuser already exists")
        return True
    except Exception as e:
        print(f"⚠️  Could not create superuser: {e}")
        return False

def start_server():
    """Start the Django development server"""
    print("🚀 Starting Django development server...")
    print("   Server will be available at: http://localhost:8000")
    print("   API documentation: http://localhost:8000/api/schema/swagger-ui/")
    print("   Press Ctrl+C to stop the server")
    print("-" * 50)
    
    try:
        subprocess.run([sys.executable, 'manage.py', 'runserver'])
    except KeyboardInterrupt:
        print("\n👋 Server stopped")

def main():
    """Main function"""
    print("=" * 50)
    print("🚀 Sajilo Life Backend - Quick Start")
    print("=" * 50)
    
    # Change to backend directory
    backend_dir = Path(__file__).parent
    os.chdir(backend_dir)
    
    # Run checks
    checks = [
        check_python_version(),
        check_virtual_environment(),
        check_dependencies(),
        check_env_file(),
    ]
    
    if all(checks):
        print("\n✅ All checks passed!")
        
        # Database setup
        if check_database():
            run_migrations()
            create_superuser()
            
            # Start server
            print("\n" + "=" * 50)
            start_server()
        else:
            print("\n❌ Please fix database connection issues before starting server")
    else:
        print("\n❌ Please fix the issues above before starting server")
        print("\n📋 Quick setup guide:")
        print("1. Create virtual environment: python -m venv venv")
        print("2. Activate virtual environment")
        print("3. Install dependencies: pip install -r requirements.txt")
        print("4. Create .env file with required variables")
        print("5. Set up PostgreSQL database")
        print("6. Run this script again")

if __name__ == '__main__':
    main() 