import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import NetInfo from '@react-native-community/netinfo';

interface NetworkContextType {
  isConnected: boolean;
  isOnline: boolean;
  syncPendingRequests: () => Promise<void>;
  addPendingSync: (request: any) => void;
  getPendingSyncRequests: () => any[];
  clearPendingSync: (requestId: string) => void;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

interface NetworkProviderProps {
  children: ReactNode;
}

export const NetworkProvider: React.FC<NetworkProviderProps> = ({
  children,
}) => {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [pendingSyncRequests, setPendingSyncRequests] = useState<any[]>([]);

  // Sync pending requests with server
  const syncPendingRequests = useCallback(async () => {
    if (!isOnline || pendingSyncRequests.length === 0) {
      return;
    }

    try {
      // Process each pending request
      for (const request of pendingSyncRequests) {
        try {
          // Attempt to sync with server
          // This would typically call your API service
          console.log('Syncing request:', request);

          // If successful, remove from pending
          clearPendingSync(request.id);
        } catch (error) {
          console.error('Failed to sync request:', error);
          // Keep in pending queue for retry
        }
      }
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }, [isOnline, pendingSyncRequests]);

  // Monitor network connectivity
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: any) => {
      const connected = state.isConnected ?? false;
      setIsConnected(connected);
      setIsOnline(connected);

      // Auto-sync when coming back online
      if (connected && pendingSyncRequests.length > 0) {
        syncPendingRequests();
      }
    });

    return () => unsubscribe();
  }, [pendingSyncRequests, syncPendingRequests]);

  // Add request to pending sync queue
  const addPendingSync = (request: any) => {
    setPendingSyncRequests(prev => [
      ...prev,
      { ...request, id: Date.now().toString() },
    ]);
  };

  // Get all pending sync requests
  const getPendingSyncRequests = () => {
    return pendingSyncRequests;
  };

  // Clear a specific pending sync request
  const clearPendingSync = (requestId: string) => {
    setPendingSyncRequests(prev => prev.filter(req => req.id !== requestId));
  };

  const value: NetworkContextType = {
    isConnected,
    isOnline,
    syncPendingRequests,
    addPendingSync,
    getPendingSyncRequests,
    clearPendingSync,
  };

  return (
    <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>
  );
};

export const useNetwork = (): NetworkContextType => {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};
