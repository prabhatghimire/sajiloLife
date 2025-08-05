import { useDispatch, useSelector } from 'react-redux';
import {
  useGetDeliveryRequestsQuery,
  useGetDeliveryRequestQuery,
  useCreateDeliveryRequestMutation,
  useUpdateDeliveryRequestMutation,
  useUpdateDeliveryStatusMutation,
  useBulkSyncMutation,
  CreateDeliveryRequest,
} from '../services/apiSlice';
import {
  saveOfflineRequest,
  loadLocalRequests,
} from '../store/slices/deliverySlice';
import { handleAPIError } from '../services/errorHandler';

export const useDelivery = (deliveryId?: number) => {
  const dispatch = useDispatch();
  const delivery = useSelector((state: any) => state.delivery);
  const network = useSelector((state: any) => state.network);

  // RTK Query hooks for API calls
  const {
    data: apiRequests,
    isLoading: isLoadingRequests,
    error: requestsError,
    refetch: refetchRequests,
  } = useGetDeliveryRequestsQuery({});

  // Debug logging
  console.log('API Requests Data:', apiRequests);
  console.log('API Requests Loading:', isLoadingRequests);
  console.log('API Requests Error:', requestsError);

  const { data: currentDelivery, isLoading: isLoadingDelivery } =
    useGetDeliveryRequestQuery(deliveryId!, {
      skip: !deliveryId,
    });

  const [createRequest, { isLoading: isCreating }] =
    useCreateDeliveryRequestMutation();
  const [updateRequest] = useUpdateDeliveryRequestMutation();
  const [updateStatus] = useUpdateDeliveryStatusMutation();
  const [bulkSync] = useBulkSyncMutation();

  // Combine API data with local data
  const requests = apiRequests || delivery.requests || [];
  const currentRequest = currentDelivery || delivery.currentRequest;
  const isLoading = isLoadingRequests || delivery.isLoading;

  const createDeliveryRequest = async (requestData: CreateDeliveryRequest) => {
    try {
      if (network.isConnected) {
        // Online: Send to server via RTK Query
        const result = await createRequest(requestData).unwrap();
        return result;
      } else {
        // Offline: Save locally
        const result = await dispatch(
          saveOfflineRequest(requestData) as any,
        ).unwrap();
        return result;
      }
    } catch (error) {
      const apiError = handleAPIError(error as any);
      throw apiError;
    }
  };

  const updateDeliveryRequest = async (id: number, data: any) => {
    try {
      const result = await updateRequest({ id, data }).unwrap();
      return result;
    } catch (error) {
      const apiError = handleAPIError(error as any);
      throw apiError;
    }
  };

  const updateDeliveryStatus = async (id: number, status: string) => {
    try {
      const result = await updateStatus({ id, status }).unwrap();
      return result;
    } catch (error) {
      const apiError = handleAPIError(error as any);
      throw apiError;
    }
  };

  const syncOfflineData = async () => {
    try {
      if (!network.isConnected) {
        throw new Error('No internet connection');
      }

      // Get offline requests from local database
      const offlineRequests = delivery.requests.filter(
        (req: any) => !req.is_synced,
      );

      if (offlineRequests.length === 0) {
        return { synced: [], failed: [] };
      }

      // Send bulk sync request
      const result = await bulkSync({ requests: offlineRequests }).unwrap();
      return result;
    } catch (error) {
      const apiError = handleAPIError(error as any);
      throw apiError;
    }
  };

  const loadLocalData = () => {
    dispatch(loadLocalRequests() as any);
  };

  const refreshData = () => {
    refetchRequests();
  };

  return {
    // State
    requests,
    currentRequest,
    isLoading,
    error: requestsError || delivery.error,
    syncStatus: delivery.syncStatus,
    lastSync: delivery.lastSync,

    // Loading states
    isCreating,
    isLoadingRequests,
    isLoadingDelivery,

    // Actions
    createDeliveryRequest,
    updateDeliveryRequest,
    updateDeliveryStatus,
    syncOfflineData,
    loadLocalData,
    refreshData,
  };
};
