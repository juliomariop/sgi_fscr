import { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured, isSupabaseOnline, setSupabaseOffline } from '../services/supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = window.localStorage.getItem('sgi_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [loading, setLoading] = useState(() => {
    try {
      const saved = window.localStorage.getItem('sgi_current_user');
      return !saved;
    } catch (e) {
      return true;
    }
  });

  const [isAuthReady, setIsAuthReady] = useState(false);

  const getProfileAndSetUser = (sessionUser) => {
    if (!sessionUser) {
      setUser(null);
      return;
    }
    const isJairo = sessionUser.email?.toLowerCase().trim() === 'jjairojimenez@gmail.com';
    
    // Set state immediately using session metadata to prevent UI hangs or blocks!
    const initialUser = {
      ...sessionUser,
      name: sessionUser.user_metadata?.name || sessionUser.email,
      role: isJairo ? 'Administrador General' : (sessionUser.user_metadata?.role || 'Líder de Calidad')
    };
    setUser(initialUser);

    // Fetch details in the background, deferred by setTimeout to prevent database query deadlocks inside auth transition lock
    setTimeout(async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('name, role')
          .eq('id', sessionUser.id)
          .single();

        if (!error && data) {
          setUser(prev => prev && prev.id === sessionUser.id ? {
            ...prev,
            name: data.name,
            role: isJairo ? 'Administrador General' : data.role
          } : prev);
        }
      } catch (e) {
        console.warn("AuthContext: Error fetching profile in background:", e);
      }
    }, 0);
  };

  useEffect(() => {
    if (import.meta.env.VITE_MOCK_AUTH === 'true' || !isSupabaseConfigured || !isSupabaseOnline) {
      setUser({ 
        email: 'admin@sgi.com', 
        name: 'Administrador General', 
        role: 'Administrador General' 
      });
      setLoading(false);
      setIsAuthReady(true);
      return;
    }

    let isMounted = true;
    let subscription = null;

    const initAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        const session = data?.session || null;
        if (session?.user && isMounted) {
          getProfileAndSetUser(session.user);
        } else if (isMounted) {
          setUser(null);
        }
      } catch (err) {
        console.warn("Auth initialization failed. Retaining local cached session:", err);
        try {
          const saved = window.localStorage.getItem('sgi_current_user');
          if (!saved && isMounted) {
            setUser(null);
          }
        } catch (e) {
          if (isMounted) setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          setIsAuthReady(true);
        }
      }
    };

    initAuth();

    try {
      const res = supabase.auth.onAuthStateChange((_event, session) => {
        if (!isMounted) return;
        try {
          if (session?.user) {
            getProfileAndSetUser(session.user);
          } else {
            setUser(null);
          }
        } catch (err) {
          console.error("Error in auth state change handler:", err);
        } finally {
          setLoading(false);
        }
      });
      
      subscription = res?.data?.subscription || res?.subscription || null;
    } catch (err) {
      console.error("Error setting up onAuthStateChange listener:", err);
      setLoading(false);
    }

    return () => {
      isMounted = false;
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  }, []);

  const login = async (email, password) => {
    if (import.meta.env.VITE_MOCK_AUTH === 'true' || !isSupabaseConfigured) {
      const localUsers = JSON.parse(localStorage.getItem('sgi_users') || '[]');
      const found = localUsers.find(u => u.email.toLowerCase() === email.toLowerCase()) || { email, name: email.split('@')[0], role: 'Líder de Calidad' };
      setUser({
        email: found.email,
        name: found.name,
        role: found.role
      });
      return { data: { user: { email } }, error: null };
    }
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      return { data, error };
    } catch (err) {
      console.error("Login exception:", err);
      return { data: null, error: err };
    }
  };

  const signUp = async (email, password, name, role) => {
    const isJairo = email.toLowerCase().trim() === 'jjairojimenez@gmail.com';
    const finalRole = isJairo ? 'Administrador General' : role;

    if (import.meta.env.VITE_MOCK_AUTH === 'true' || !isSupabaseConfigured) {
      const localUsers = JSON.parse(localStorage.getItem('sgi_users') || '[]');
      if (!localUsers.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        const newUser = { email, name, role: finalRole };
        const updated = [...localUsers, newUser];
        localStorage.setItem('sgi_users', JSON.stringify(updated));
      }
      return { data: { user: { email } }, error: null };
    }
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, role: finalRole }
        }
      });
      return { data, error };
    } catch (err) {
      console.error("SignUp exception:", err);
      return { data: null, error: err };
    }
  };

  const logout = async () => {
    // 1. Clear local UI state instantly to guarantee responsiveness
    setUser(null);
    try {
      window.localStorage.removeItem('sgi_current_user');
      
      // Also clear all Supabase auth keys from localStorage to prevent old session residue
      Object.keys(window.localStorage).forEach(key => {
        if (key.startsWith('sb-')) {
          window.localStorage.removeItem(key);
        }
      });
    } catch (e) {}

    // 2. Perform a local sign out in the Supabase client (instant, clears memory and listeners)
    if (isSupabaseConfigured && import.meta.env.VITE_MOCK_AUTH !== 'true') {
      try {
        await supabase.auth.signOut({ scope: 'local' });
      } catch (err) {
        console.warn("Supabase local signOut failed:", err);
      }
    }
  };

  useEffect(() => {
    try {
      if (user) {
        window.localStorage.setItem('sgi_current_user', JSON.stringify(user));
      } else {
        window.localStorage.removeItem('sgi_current_user');
      }
    } catch (e) {
      console.error("Error saving user state to localStorage:", e);
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, logout, signUp, loading, isAuthReady }}>
      {children}
    </AuthContext.Provider>
  );
};

