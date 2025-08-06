import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

export interface APIError {
  type:
    | 'validation_error'
    | 'auth_error'
    | 'permission_error'
    | 'not_found'
    | 'server_error'
    | 'network_error'
    | 'unknown_error'
    | 'api_error';
  message: string;
  errors?: Record<string, string[]>;
}

export const handleAPIError = (
  error: FetchBaseQueryError | { error: string },
): APIError => {
  console.log('API Error received:', JSON.stringify(error, null, 2));

  if ('status' in error) {
    // Server responded with error status
    const { status, data } = error;
    console.log(
      'Error status:',
      status,
      'Error data:',
      JSON.stringify(data, null, 2),
    );

    switch (status) {
      case 400:
        return {
          type: 'validation_error',
          message: (data as any)?.message || 'Invalid request data',
          errors: (data as any)?.errors || {},
        };
      case 401:
        return {
          type: 'auth_error',
          message: 'Authentication required',
        };
      case 403:
        return {
          type: 'permission_error',
          message: 'You do not have permission to perform this action',
        };
      case 404:
        return {
          type: 'not_found',
          message: 'Resource not found',
        };
      case 500:
        return {
          type: 'server_error',
          message: 'Server error occurred',
        };
      default:
        return {
          type: 'api_error',
          message: (data as any)?.message || 'An error occurred',
        };
    }
  } else if ('error' in error) {
    // Network error or other error
    console.log('Network error:', error.error);
    if (error.error === 'FETCH_ERROR') {
      return {
        type: 'network_error',
        message: 'Network error. Please check your connection.',
      };
    }
    return {
      type: 'unknown_error',
      message: error.error || 'An unknown error occurred',
    };
  } else {
    return {
      type: 'unknown_error',
      message: 'An unknown error occurred',
    };
  }
};

// Helper function to check if an error is a specific type
export const isErrorType = (
  error: APIError,
  type: APIError['type'],
): boolean => {
  return error.type === type;
};

// Helper function to get validation errors for a specific field
export const getFieldError = (
  error: APIError,
  field: string,
): string | undefined => {
  if (
    error.type === 'validation_error' &&
    error.errors &&
    error.errors[field]
  ) {
    return error.errors[field][0]; // Return first error for the field
  }
  return undefined;
};
