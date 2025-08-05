import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { storage } from './storage';
import Config from 'react-native-config';
import { getApiBaseUrl } from '../config/api';

// Types for API requests and responses
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

export interface AuthResponse {
  message: string;
  user: {
    id: number;
    username: string;
    email: string;
    role: string;
    first_name: string;
    last_name: string;
    phone?: string;
  };
  tokens: {
    access: string;
    refresh: string;
  };
}

export interface UserProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface DeliveryRequest {
  id: number;
  customer_name: string;
  pickup_address: string;
  dropoff_address: string;
  delivery_notes?: string;
  status: 'pending' | 'assigned' | 'in_transit' | 'delivered' | 'cancelled';
  status_display: string;
  created_at: string;
  updated_at: string;
  is_synced: boolean;
  local_id?: string;
  partner?: number;
  partner_name?: string;
  partner_phone?: string;
  pickup_lat?: string;
  pickup_lng?: string;
  dropoff_lat?: string;
  dropoff_lng?: string;
  customer_phone?: string;
  estimated_distance?: string;
  estimated_duration?: number;
  actual_distance?: string;
  actual_duration?: number;
}

export interface DeliveryRequestResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: DeliveryRequest[];
}

export interface CreateDeliveryRequest {
  pickup_address: string;
  dropoff_address: string;
  customer_name: string;
  customer_phone: string;
  delivery_notes?: string;
  pickup_lat?: number;
  pickup_lng?: number;
  dropoff_lat?: number;
  dropoff_lng?: number;
  local_id?: string;
}

export interface Partner {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: 'online' | 'offline' | 'busy';
  current_location?: {
    lat: number;
    lng: number;
  };
  rating?: number;
  total_deliveries?: number;
}

export interface DeliveryStatistics {
  total_requests: number;
  completed_requests: number;
  pending_requests: number;
  cancelled_requests: number;
}

export interface PartnerStatistics {
  total_deliveries: number;
  completed_deliveries: number;
  average_rating: number;
  total_earnings: number;
}

// Custom base query with auth token handling
const baseQuery = fetchBaseQuery({
  baseUrl: Config.API_BASE_URL || getApiBaseUrl(),
  prepareHeaders: async headers => {
    try {
      const token = await storage.getItem('access_token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
    } catch (error) {
      console.log('Error getting token:', error);
    }
    headers.set('content-type', 'application/json');
    return headers;
  },
});

// Custom base query with token refresh
const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Try to get a new token
    const refreshToken = await storage.getItem('refresh_token');
    if (refreshToken) {
      const refreshResult = await baseQuery(
        {
          url: '/auth/token/refresh/',
          method: 'POST',
          body: { refresh: refreshToken },
        },
        api,
        extraOptions,
      );

      if (refreshResult.data) {
        const { access } = refreshResult.data as { access: string };
        await storage.setItem('access_token', access);

        // Retry the original query
        result = await baseQuery(args, api, extraOptions);
      } else {
        // Refresh failed, clear tokens
        await storage.removeItem('access_token');
        await storage.removeItem('refresh_token');
        await storage.removeItem('user');
      }
    }
  }

  return result;
};

// Create the API slice
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Auth', 'Delivery', 'Partner', 'Profile'],
  endpoints: builder => ({
    // Auth endpoints
    login: builder.mutation<AuthResponse, LoginCredentials>({
      query: credentials => ({
        url: '/auth/login/',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),

    register: builder.mutation<AuthResponse, RegisterData>({
      query: userData => ({
        url: '/auth/register/',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['Auth'],
    }),

    logout: builder.mutation<void, string>({
      query: refreshToken => ({
        url: '/auth/logout/',
        method: 'POST',
        body: { refresh_token: refreshToken },
      }),
      invalidatesTags: ['Auth', 'Profile'],
    }),

    getProfile: builder.query<UserProfile, void>({
      query: () => '/auth/profile/',
      providesTags: ['Profile'],
    }),

    updateProfile: builder.mutation<UserProfile, Partial<UserProfile>>({
      query: data => ({
        url: '/auth/profile/',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Profile'],
    }),

    changePassword: builder.mutation<
      void,
      { old_password: string; new_password: string }
    >({
      query: data => ({
        url: '/auth/change-password/',
        method: 'POST',
        body: data,
      }),
    }),

    // Delivery endpoints
    getDeliveryRequests: builder.query<
      DeliveryRequestResponse,
      { status?: string; page?: number }
    >({
      query: params => ({
        url: '/delivery/requests/',
        params,
      }),
      providesTags: result =>
        result
          ? [
              ...result.results.map(({ id }) => ({
                type: 'Delivery' as const,
                id,
              })),
              { type: 'Delivery', id: 'LIST' },
            ]
          : [{ type: 'Delivery', id: 'LIST' }],
    }),

    getDeliveryRequest: builder.query<DeliveryRequest, number>({
      query: id => `/delivery/requests/${id}/`,
      providesTags: (result, error, id) => [{ type: 'Delivery', id }],
    }),

    createDeliveryRequest: builder.mutation<
      DeliveryRequest,
      CreateDeliveryRequest
    >({
      query: data => ({
        url: '/delivery/requests/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Delivery', id: 'LIST' }],
    }),

    updateDeliveryRequest: builder.mutation<
      DeliveryRequest,
      { id: number; data: Partial<DeliveryRequest> }
    >({
      query: ({ id, data }) => ({
        url: `/delivery/requests/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Delivery', id },
        { type: 'Delivery', id: 'LIST' },
      ],
    }),

    updateDeliveryStatus: builder.mutation<
      DeliveryRequest,
      { id: number; status: string }
    >({
      query: ({ id, status }) => ({
        url: `/delivery/requests/${id}/status/`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Delivery', id },
        { type: 'Delivery', id: 'LIST' },
      ],
    }),

    deleteDeliveryRequest: builder.mutation<void, number>({
      query: id => ({
        url: `/delivery/requests/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Delivery', id: 'LIST' }],
    }),

    syncOffline: builder.mutation<void, any>({
      query: data => ({
        url: '/delivery/sync/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Delivery', id: 'LIST' }],
    }),

    bulkSync: builder.mutation<void, any>({
      query: data => ({
        url: '/delivery/sync/bulk/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Delivery', id: 'LIST' }],
    }),

    getPendingSync: builder.query<any[], void>({
      query: () => '/delivery/sync/pending/',
    }),

    getDeliveryStatistics: builder.query<DeliveryStatistics, void>({
      query: () => '/delivery/statistics/',
    }),

    assignPartner: builder.mutation<
      void,
      { requestId: number; partnerId: number }
    >({
      query: ({ requestId, partnerId }) => ({
        url: `/delivery/requests/${requestId}/assign-partner/`,
        method: 'POST',
        body: { partner_id: partnerId },
      }),
      invalidatesTags: (result, error, { requestId }) => [
        { type: 'Delivery', id: requestId },
        { type: 'Delivery', id: 'LIST' },
      ],
    }),

    // Partner endpoints
    getPartners: builder.query<Partner[], { status?: string; page?: number }>({
      query: params => ({
        url: '/partners/',
        params,
      }),
      providesTags: result =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Partner' as const, id })),
              { type: 'Partner', id: 'LIST' },
            ]
          : [{ type: 'Partner', id: 'LIST' }],
    }),

    getPartner: builder.query<Partner, number>({
      query: id => `/partners/${id}/`,
      providesTags: (result, error, id) => [{ type: 'Partner', id }],
    }),

    createPartner: builder.mutation<Partner, Partial<Partner>>({
      query: data => ({
        url: '/partners/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Partner', id: 'LIST' }],
    }),

    updatePartner: builder.mutation<
      Partner,
      { id: number; data: Partial<Partner> }
    >({
      query: ({ id, data }) => ({
        url: `/partners/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Partner', id },
        { type: 'Partner', id: 'LIST' },
      ],
    }),

    updatePartnerStatus: builder.mutation<
      Partner,
      { id: number; status: string }
    >({
      query: ({ id, status }) => ({
        url: `/partners/${id}/status/`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Partner', id },
        { type: 'Partner', id: 'LIST' },
      ],
    }),

    updatePartnerLocation: builder.mutation<
      Partner,
      { id: number; lat: number; lng: number }
    >({
      query: ({ id, lat, lng }) => ({
        url: `/partners/${id}/location/`,
        method: 'PATCH',
        body: { lat, lng },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Partner', id }],
    }),

    getNearbyPartners: builder.query<
      Partner[],
      { lat: number; lng: number; radius: number }
    >({
      query: ({ lat, lng, radius }) => ({
        url: '/partners/nearby/',
        params: { lat, lng, radius_km: radius },
      }),
      providesTags: [{ type: 'Partner', id: 'NEARBY' }],
    }),

    getAvailablePartners: builder.query<Partner[], void>({
      query: () => '/partners/available/',
      providesTags: [{ type: 'Partner', id: 'AVAILABLE' }],
    }),

    getPartnerStatistics: builder.query<PartnerStatistics, number | void>({
      query: id => `/partners/statistics/${id || ''}/`,
    }),

    goOnline: builder.mutation<void, void>({
      query: () => ({
        url: '/partners/go-online/',
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'Partner', id: 'AVAILABLE' }],
    }),

    goOffline: builder.mutation<void, void>({
      query: () => ({
        url: '/partners/go-offline/',
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'Partner', id: 'AVAILABLE' }],
    }),

    assignPartnerToRequest: builder.mutation<
      void,
      { partnerId: number; requestId: number }
    >({
      query: ({ partnerId, requestId }) => ({
        url: '/partners/assign/',
        method: 'POST',
        body: { partner_id: partnerId, request_id: requestId },
      }),
      invalidatesTags: [
        { type: 'Delivery', id: 'LIST' },
        { type: 'Partner', id: 'AVAILABLE' },
      ],
    }),
  }),
});

// Export hooks for use in components
export const {
  // Auth hooks
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,

  // Delivery hooks
  useGetDeliveryRequestsQuery,
  useGetDeliveryRequestQuery,
  useCreateDeliveryRequestMutation,
  useUpdateDeliveryRequestMutation,
  useUpdateDeliveryStatusMutation,
  useDeleteDeliveryRequestMutation,
  useSyncOfflineMutation,
  useBulkSyncMutation,
  useGetPendingSyncQuery,
  useGetDeliveryStatisticsQuery,
  useAssignPartnerMutation,

  // Partner hooks
  useGetPartnersQuery,
  useGetPartnerQuery,
  useCreatePartnerMutation,
  useUpdatePartnerMutation,
  useUpdatePartnerStatusMutation,
  useUpdatePartnerLocationMutation,
  useGetNearbyPartnersQuery,
  useGetAvailablePartnersQuery,
  useGetPartnerStatisticsQuery,
  useGoOnlineMutation,
  useGoOfflineMutation,
  useAssignPartnerToRequestMutation,
} = apiSlice;
