import { supabase, isSupabaseConfigured } from '../services/supabase';

/**
 * Registers an administrative or user activity log entry.
 * Safely falls back to localStorage in dev, mock or offline environments.
 * 
 * @param {object} user - Current user object from useAuth()
 * @param {string} action - Action description (e.g., "Creación de Documento", "Cambio de Rol")
 * @param {string|object} details - Optional extra details/metadata about the action
 */
export async function logActivity(user, action, details = null) {
  if (!user) return;
  try {
    const timestamp = new Date().toISOString();
    const detailsStr = typeof details === 'object' ? JSON.stringify(details) : details;

    // Dev/Mock Mode or Supabase Offline Fallback
    if (import.meta.env.VITE_MOCK_AUTH === 'true' || !isSupabaseConfigured) {
      const localLogs = JSON.parse(localStorage.getItem('sgi_activity_logs') || '[]');
      const newLog = {
        id: Math.random().toString(36).substring(2, 9),
        user_email: user.email,
        user_name: user.name || user.email.split('@')[0],
        action,
        details: detailsStr,
        created_at: timestamp
      };
      // Keep up to 1000 logs locally
      localStorage.setItem('sgi_activity_logs', JSON.stringify([newLog, ...localLogs].slice(0, 1000)));
      return;
    }

    // Supabase Online Mode: insert directly into public.activity_logs
    const { error } = await supabase.from('activity_logs').insert({
      user_id: user.id || null,
      user_email: user.email,
      user_name: user.name || user.email.split('@')[0],
      action,
      details: detailsStr
    });

    if (error) {
      // If table is not created yet, fallback to localStorage to prevent app crashes!
      if (error.code === '42P01') { // undefined_table
        console.warn("activity_logs table not found in Supabase. Falling back to localStorage logging.");
        const localLogs = JSON.parse(localStorage.getItem('sgi_activity_logs') || '[]');
        const newLog = {
          id: Math.random().toString(36).substring(2, 9),
          user_email: user.email,
          user_name: user.name || user.email.split('@')[0],
          action,
          details: detailsStr,
          created_at: timestamp
        };
        localStorage.setItem('sgi_activity_logs', JSON.stringify([newLog, ...localLogs].slice(0, 1000)));
      } else {
        throw error;
      }
    }
  } catch (err) {
    console.warn("logActivity: Failed to save log to Supabase:", err);
  }
}
