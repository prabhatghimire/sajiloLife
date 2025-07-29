# Sajilo Life - Delivery App

A comprehensive delivery management system with React Native mobile app and Django backend, featuring offline support, Google Maps integration, and real-time synchronization.

## Project Structure

```
sajilo-life/
├── mobile/                 # React Native mobile app
├── backend/                # Django REST API
├── docs/                   # Documentation and design docs
└── README.md              # This file
```

## Features

### Mobile App (React Native)

- 📍 Google Maps integration for pickup/drop-off location selection
- 📝 Delivery request form with validation
- 🔄 Offline support with auto-sync
- 📱 Request history and status tracking
- 🎨 Modern, intuitive UI/UX

### Backend API (Django)

- 🔐 Role-based authentication (Admin, Partner, Customer)
- 📊 CRUD operations for delivery requests
- 🤝 Partner assignment and management
- 📡 Offline sync handling
- 📚 Comprehensive API documentation

## Quick Start

### Prerequisites

- Node.js (v18+)
- Python (v3.9+)
- React Native CLI
- PostgreSQL (for backend)
- Google Maps API key (need to set google api key androidManifest.xml before running)

### Mobile App Setup

```bash
cd mobile
npm install

# For React Native CLI
npx react-native run-android
# or
npx react-native run-ios
```

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

## Environment Configuration

### Mobile App (.env)

```
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
API_BASE_URL=http://localhost:8000/api
```

### Backend (.env)

```
SECRET_KEY=your_django_secret_key
DATABASE_URL=postgresql://user:password@localhost:5432/sajilo_life
DEBUG=True
```

## API Documentation

The backend includes Swagger documentation available at:

- Swagger UI: `http://localhost:8000/swagger/`
- ReDoc: `http://localhost:8000/redoc/`

## Testing

### Mobile App

```bash
cd mobile
npm test
```

### Backend

```bash
cd backend
python manage.py test
```

## Architecture Overview

### Mobile App Architecture

- **State Management**: Redux Toolkit
- **Navigation**: React Navigation
- **Maps**: React Native Maps with Google Maps
- **Offline Storage**: AsyncStorage + SQLite
- **HTTP Client**: Axios with interceptors

### Backend Architecture

- **Framework**: Django + Django REST Framework
- **Database**: PostgreSQL
- **Authentication**: JWT tokens
- **API Documentation**: drf-spectacular
- **Testing**: pytest-django

## Development Phases

1. **Phase 1**: Core API development and mobile app setup
2. **Phase 2**: Maps integration and delivery form
3. **Phase 3**: Offline support and sync mechanism
4. **Phase 4**: Authentication and role management
5. **Phase 5**: Testing and documentation
