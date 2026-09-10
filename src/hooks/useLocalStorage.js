import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured, isSupabaseOnline } from '../services/supabase';
import { useAuth } from '../context/AuthContext';

export function useLocalStorage(key, initialValue) {
  const { user, isAuthReady } = useAuth();
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  useEffect(() => {
    if (!isAuthReady) return;

    let active = true;
    let subscription = null;

    async function syncData() {
      if (import.meta.env.VITE_MOCK_AUTH === 'true' || !isSupabaseConfigured || !isSupabaseOnline) return;
      const isPublicKey = ['sgi_customer_surveys', 'sgi_trainings', 'sgi_unsafe_reports', 'sgi_inducciones_records'].includes(key);
      if ((!user || !user.id) && !isPublicKey) return; // Verify user authentication status directly and synchronously!

      try {
        // 1. Fetch current data from Supabase
        const { data: appData, error } = await supabase
          .from('app_data')
          .select('data, updated_at')
          .eq('key', key)
          .single();

        if (error && error.code === 'PGRST116') {
          // Row not found in Supabase: Seed it with the local value (or initialValue)
          const currentValue = window.localStorage.getItem(key);
          const valueToSeed = currentValue ? JSON.parse(currentValue) : initialValue;
          const nowStr = new Date().toISOString();
          
          await supabase
            .from('app_data')
            .upsert({ key, data: valueToSeed, updated_at: nowStr });
          window.localStorage.setItem(key + '_local_updated_at', nowStr);
        } else if (appData && active) {
          const remoteUpdatedAt = appData.updated_at;
          const localUpdatedAtStr = window.localStorage.getItem(key + '_local_updated_at');

          // If remote update is older than local update, do not overwrite local state
          if (localUpdatedAtStr && remoteUpdatedAt && new Date(remoteUpdatedAt) < new Date(localUpdatedAtStr)) {
            console.log(`[useLocalStorage] Ignoring older remote data for key ${key}. Remote: ${remoteUpdatedAt}, Local: ${localUpdatedAtStr}`);
            return;
          }

          // Compare with local storage. If different, update state and local storage
          const localStr = window.localStorage.getItem(key);
          const dbStr = JSON.stringify(appData.data);
          
          if (localStr !== dbStr) {
            setStoredValue(appData.data);
            window.localStorage.setItem(key, dbStr);
            if (remoteUpdatedAt) {
              window.localStorage.setItem(key + '_local_updated_at', remoteUpdatedAt);
            }
          } else if (remoteUpdatedAt && !localUpdatedAtStr) {
            window.localStorage.setItem(key + '_local_updated_at', remoteUpdatedAt);
          }
        }

        // 2. Subscribe to Postgres changes on this key for real-time updates
        if (subscription) {
          try {
            subscription.unsubscribe();
          } catch (e) {}
        }

        subscription = supabase
          .channel(`realtime:${key}`)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'app_data', filter: `key=eq.${key}` },
            (payload) => {
              console.log(`Realtime update received for ${key}:`, payload);
              if (active && payload.new && payload.new.data) {
                const remoteUpdatedAt = payload.new.updated_at;
                const localUpdatedAtStr = window.localStorage.getItem(key + '_local_updated_at');

                // If remote update is older or same as local update, skip
                if (localUpdatedAtStr && remoteUpdatedAt && new Date(remoteUpdatedAt) <= new Date(localUpdatedAtStr)) {
                  console.log(`[useLocalStorage] Ignoring older/same realtime update for ${key}. Remote: ${remoteUpdatedAt}, Local: ${localUpdatedAtStr}`);
                  return;
                }

                const newDbStr = JSON.stringify(payload.new.data);
                const localStr = window.localStorage.getItem(key);
                if (localStr !== newDbStr) {
                  setStoredValue(payload.new.data);
                  window.localStorage.setItem(key, newDbStr);
                  if (remoteUpdatedAt) {
                    window.localStorage.setItem(key + '_local_updated_at', remoteUpdatedAt);
                  }
                } else if (remoteUpdatedAt && (!localUpdatedAtStr || new Date(remoteUpdatedAt) > new Date(localUpdatedAtStr))) {
                  window.localStorage.setItem(key + '_local_updated_at', remoteUpdatedAt);
                }
              }
            }
          )
          .subscribe((status, err) => {
            console.log(`Realtime subscription status for ${key}:`, status, err || '');
          });
      } catch (err) {
        console.error("Error in useLocalStorage sync:", err);
      }
    }

    syncData();

    return () => {
      active = false;
      if (subscription) {
        try {
          subscription.unsubscribe();
        } catch (e) {}
      }
    };
  }, [key, user?.id, isAuthReady]);

  const setValue = async (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      const strValue = JSON.stringify(valueToStore);
      window.localStorage.setItem(key, strValue);

      const nowStr = new Date().toISOString();
      window.localStorage.setItem(key + '_local_updated_at', nowStr);

      // Save to Supabase if authenticated/public key and not in mock mode
      if (import.meta.env.VITE_MOCK_AUTH !== 'true' && isSupabaseConfigured && isSupabaseOnline) {
        const isPublicKey = ['sgi_customer_surveys', 'sgi_trainings', 'sgi_unsafe_reports', 'sgi_inducciones_records'].includes(key);
        if ((user && user.id) || isPublicKey) {
          const { error } = await supabase
            .from('app_data')
            .upsert({ key, data: valueToStore, updated_at: nowStr });
          if (error) {
            console.error(`Error saving ${key} to Supabase:`, error);
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}


