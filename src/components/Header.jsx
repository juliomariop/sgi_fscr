import React from 'react';
import { Bell, Search, UserCircle, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="top-header">
      <div className="header-left">
        <button className="btn-icon mobile-menu-btn" style={{display: 'none'}}><Menu size={20}/></button>
        <div className="search-bar">
          <Search size={16} style={{color: 'var(--text-secondary)'}}/>
          <input type="text" placeholder="Buscar en el sistema..." />
        </div>
      </div>
      <div className="header-actions" id="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button className="btn-secondary" style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Bell size={16} style={{ color: 'var(--text-secondary)' }}/>
        </button>
        <div style={{
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.6rem', 
          background: 'var(--bg-secondary)', 
          border: '1px solid var(--border-color)',
          padding: '0.4rem 0.8rem', 
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
            <UserCircle size={16} />
          </span>
          <span id="current-user-display" style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-primary)' }}>
            {user?.email || 'Cargando...'}
          </span>
          <button className="btn-icon" onClick={logout} title="Cerrar Sesión" style={{ marginLeft: '0.25rem', padding: '0.2rem', color: 'var(--text-muted)' }}>
            <LogOut size={14}/>
          </button>
        </div>
      </div>
    </header>
  );
}
