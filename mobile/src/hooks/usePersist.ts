import { useDispatch } from 'react-redux';
import { persistor } from '../store';
import { PURGE } from 'redux-persist';

export const usePersist = () => {
  const dispatch = useDispatch();

  const purgeStore = async () => {
    try {
      await persistor.purge();
      dispatch({ type: PURGE });
      console.log('Store purged successfully');
    } catch (error) {
      console.error('Error purging store:', error);
    }
  };

  const flushStore = async () => {
    try {
      await persistor.flush();
      console.log('Store flushed successfully');
    } catch (error) {
      console.error('Error flushing store:', error);
    }
  };

  const pauseStore = () => {
    persistor.pause();
    console.log('Store paused');
  };

  const resumeStore = () => {
    persistor.resume();
    console.log('Store resumed');
  };

  const getPersistorState = () => {
    return persistor.getState();
  };

  return {
    purgeStore,
    flushStore,
    pauseStore,
    resumeStore,
    getPersistorState,
  };
};
