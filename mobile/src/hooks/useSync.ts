import { useDispatch, useSelector } from 'react-redux';
import { useBulkSyncMutation } from '../services/apiSlice';
import { checkSyncStatus, clearSyncHistory } from '../store/slices/syncSlice';
import { handleAPIError } from '../services/errorHandler';

export const useSync = () => {
  const dispatch = useDispatch();
  const sync = useSelector((state: any) => state.sync);
  const network = useSelector((state: any) => state.network);

  const [bulkSync] = useBulkSyncMutation();

  const performSync = async (offlineRequests: any[]) => {
    try {
      if (!network.isConnected) {
        throw new Error('No internet connection');
      }

      if (offlineRequests.length === 0) {
        return { synced: [], failed: [] };
      }

      // Use RTK Query for bulk sync
      const result = await bulkSync({ requests: offlineRequests }).unwrap();
      return result;
    } catch (error) {
      const apiError = handleAPIError(error as any);
      throw apiError;
    }
  };

  const checkSyncStatusAction = () => {
    dispatch(checkSyncStatus());
  };

  const clearSyncHistoryAction = () => {
    dispatch(clearSyncHistory());
  };

  return {
    // State
    isSyncing: sync.isSyncing,
    lastSyncTime: sync.lastSyncTime,
    syncError: sync.syncError,
    syncHistory: sync.syncHistory,
    pendingSyncCount: sync.pendingSyncCount,
    autoSyncEnabled: sync.autoSyncEnabled,
    syncInterval: sync.syncInterval,

    // Actions
    performSync,
    checkSyncStatus: checkSyncStatusAction,
    clearSyncHistory: clearSyncHistoryAction,
  };
};
