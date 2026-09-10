import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured, isSupabaseOnline } from '../services/supabase';
import { APP_USERS as defaultUsers } from '../data/users';
import { useAuth } from '../context/AuthContext';

export function useAppUsers() {
  const { user, isAuthReady } = useAuth();
  const [users, setUsers] = useState(defaultUsers);

  useEffect(() => {
    if (!isAuthReady) return;

    // If mock auth is active or Supabase is not online/configured, load from local storage
    if (import.meta.env.VITE_MOCK_AUTH === 'true' || !isSupabaseConfigured || !isSupabaseOnline) {
      const saved = localStorage.getItem('sgi_users');
      if (saved) {
        try {
          setUsers(JSON.parse(saved));
        } catch (e) {
          console.error("Error parsing sgi_users from local storage", e);
        }
      } else {
        // Seed default users in localStorage for consistency
        localStorage.setItem('sgi_users', JSON.stringify(defaultUsers));
      }
      return;
    }

    if (!user || !user.id) return; // Verify authentication synchronously!

    let active = true;

    // If real database connection, load from 'profiles' table
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('email, name, role')
          .order('name', { ascending: true });

        if (error) {
          console.error("Error fetching profiles from Supabase:", error);
          return;
        }

        if (data && data.length > 0 && active) {
          setUsers(data);
        }
      } catch (err) {
        console.error("Exception fetching profiles:", err);
      }
    };

    fetchUsers();

    // Subscribe to changes in the profiles table in real time
    const channel = supabase
      .channel('public:profiles')
      .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'profiles' },
          () => {
            if (active) fetchUsers();
          }
      )
      .subscribe();

    return () => {
      active = false;
      if (channel) {
        try {
          channel.unsubscribe();
        } catch (e) {
          console.warn("useAppUsers: Error unsubscribing from channel:", e);
        }
      }
    };
  }, [isSupabaseOnline, user?.id, isAuthReady]);

  return users;
}
