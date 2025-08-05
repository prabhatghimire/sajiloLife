import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNetwork } from './NetworkContext';

export interface DeliveryRequest {
  id: string;
  pickupAddress: string;
  dropAddress: string;
  customerName: string;
  customerPhone: string;
  deliveryNote?: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  syncStatus: 'synced' | 'pending_sync' | 'failed';
  createdAt: string;
  updatedAt: string;
  partnerId?: string;
  estimatedPrice?: number;
}

interface DeliveryContextType {
  deliveryRequests: DeliveryRequest[];
  createDeliveryRequest: (
    request: Omit<
      DeliveryRequest,
      'id' | 'status' | 'syncStatus' | 'createdAt' | 'updatedAt'
    >,
  ) => Promise<void>;
  updateDeliveryRequest: (
    id: string,
    updates: Partial<DeliveryRequest>,
  ) => Promise<void>;
  deleteDeliveryRequest: (id: string) => Promise<void>;
  getDeliveryRequest: (id: string) => DeliveryRequest | undefined;
  syncDeliveryRequests: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const DeliveryContext = createContext<DeliveryContextType | undefined>(
  undefined,
);

interface DeliveryProviderProps {
  children: ReactNode;
}

const STORAGE_KEY = 'delivery_requests';

export const DeliveryProvider: React.FC<DeliveryProviderProps> = ({
  children,
}) => {
  const [deliveryRequests, setDeliveryRequests] = useState<DeliveryRequest[]>(
    [],
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { isOnline, addPendingSync, clearPendingSync } = useNetwork();

  // Load delivery requests from local storage on mount
  useEffect(() => {
    loadDeliveryRequests();
  }, []);

  // Load requests from AsyncStorage
  const loadDeliveryRequests = async () => {
    try {
      setLoading(true);
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const requests = JSON.parse(stored);
        setDeliveryRequests(requests);
      }
    } catch (err) {
      setError('Failed to load delivery requests');
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Save requests to AsyncStorage
  const saveDeliveryRequests = async (requests: DeliveryRequest[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
    } catch (err) {
      setError('Failed to save delivery requests');
      console.error('Save error:', err);
    }
  };

  // Create new delivery request
  const createDeliveryRequest = async (
    requestData: Omit<
      DeliveryRequest,
      'id' | 'status' | 'syncStatus' | 'createdAt' | 'updatedAt'
    >,
  ) => {
    const newRequest: DeliveryRequest = {
      ...requestData,
      id: Date.now().toString(),
      status: 'pending',
      syncStatus: isOnline ? 'synced' : 'pending_sync',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedRequests = [...deliveryRequests, newRequest];
    setDeliveryRequests(updatedRequests);
    await saveDeliveryRequests(updatedRequests);

    // If offline, add to pending sync
    if (!isOnline) {
      addPendingSync(newRequest);
    }
  };

  // Update delivery request
  const updateDeliveryRequest = async (
    id: string,
    updates: Partial<DeliveryRequest>,
  ) => {
    const updatedRequests = deliveryRequests.map(request =>
      request.id === id
        ? {
            ...request,
            ...updates,
            updatedAt: new Date().toISOString(),
            syncStatus: (isOnline ? 'synced' : 'pending_sync') as
              | 'synced'
              | 'pending_sync'
              | 'failed',
          }
        : request,
    );

    setDeliveryRequests(updatedRequests);
    await saveDeliveryRequests(updatedRequests);

    // If offline, add to pending sync
    if (!isOnline) {
      const updatedRequest = updatedRequests.find(req => req.id === id);
      if (updatedRequest) {
        addPendingSync(updatedRequest);
      }
    }
  };

  // Delete delivery request
  const deleteDeliveryRequest = async (id: string) => {
    const updatedRequests = deliveryRequests.filter(
      request => request.id !== id,
    );
    setDeliveryRequests(updatedRequests);
    await saveDeliveryRequests(updatedRequests);
  };

  // Get specific delivery request
  const getDeliveryRequest = (id: string) => {
    return deliveryRequests.find(request => request.id === id);
  };

  // Sync delivery requests with server
  const syncDeliveryRequests = async () => {
    if (!isOnline) {
      return;
    }

    try {
      setLoading(true);
      const pendingRequests = deliveryRequests.filter(
        req => req.syncStatus === 'pending_sync',
      );

      for (const request of pendingRequests) {
        try {
          // Here you would make API calls to sync with server
          // For now, we'll just mark as synced
          await updateDeliveryRequest(request.id, { syncStatus: 'synced' });
          clearPendingSync(request.id);
        } catch (err) {
          await updateDeliveryRequest(request.id, { syncStatus: 'failed' });
          console.error('Sync failed for request:', request.id, err);
        }
      }
    } catch (err) {
      setError('Failed to sync delivery requests');
      console.error('Sync error:', err);
    } finally {
      setLoading(false);
    }
  };

  const value: DeliveryContextType = {
    deliveryRequests,
    createDeliveryRequest,
    updateDeliveryRequest,
    deleteDeliveryRequest,
    getDeliveryRequest,
    syncDeliveryRequests,
    loading,
    error,
  };

  return (
    <DeliveryContext.Provider value={value}>
      {children}
    </DeliveryContext.Provider>
  );
};

export const useDelivery = (): DeliveryContextType => {
  const context = useContext(DeliveryContext);
  if (context === undefined) {
    throw new Error('useDelivery must be used within a DeliveryProvider');
  }
  return context;
};
