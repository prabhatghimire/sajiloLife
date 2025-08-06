// API Configuration
export const API_CONFIG = {
  // Development - local machine
  development: {
    baseUrl: 'http://localhost:8000/api',
  },

  // For Android emulator - use 10.0.2.2 instead of localhost
  android: {
    baseUrl: 'http://10.0.2.2:8000/api',
  },

  // For iOS simulator - use localhost
  ios: {
    baseUrl: 'http://localhost:8000/api',
  },

  // For physical device - use your computer's IP address
  // Replace with your actual IP address
  production: {
    baseUrl: 'http://192.168.1.81:8000/api', // Your computer's IP
  },
};

// Get the appropriate base URL based on platform
export const getApiBaseUrl = () => {
  // For physical device, use this:
  return API_CONFIG.production.baseUrl;

  // For Android emulator, use this:
  // return API_CONFIG.android.baseUrl;

  // For iOS simulator, use this:
  // return API_CONFIG.development.baseUrl;
};

// For Android emulator, use this:
// return API_CONFIG.android.baseUrl;

// For physical device, use this:
// return API_CONFIG.production.baseUrl;
