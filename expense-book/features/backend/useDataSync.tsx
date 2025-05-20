import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllDataAndSave } from './initialDataAPIFetch';

const SYNC_INTERVAL = 2 * 60 * 1000; // 2 minutes in ms

export default function useDataSync() {
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.context.user);
  const intervalRef = useRef<NodeJS.Timeout | number | null>(null);

  useEffect(() => {
    let isMounted = true;

    const startSync = async () => {
      if (!user?.userId) return;
      const netState = await NetInfo.fetch();
      if (netState.isConnected) {
        // Get last login date
        const lastLogin = await AsyncStorage.getItem('lastLogin') || '1990-01-01';
        // Fetch and save new data
        await fetchAllDataAndSave( user, lastLogin, dispatch);
        // Update last login date
        await AsyncStorage.setItem('lastLogin', new Date().toISOString());
      }
    };

    // Initial sync on mount
    startSync();

    // Set up interval
    intervalRef.current = setInterval(async () => {
      if (!isMounted) return;
      const netState = await NetInfo.fetch();
      if (netState.isConnected) {
        await startSync();
      }
    }, SYNC_INTERVAL);

    // Cleanup on unmount
    return () => {
      isMounted = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // Only rerun if user changes
  }, [user, dispatch]);
}