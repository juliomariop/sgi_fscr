import React, { useState, useEffect } from 'react';
import { 
  Sliders, Users, Activity, Plus, Trash2, Key, ShieldCheck, Mail, Search, RefreshCw, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { logActivity } from '../utils/activityLogger';

const DEFAULT_PARAMS = {
  projectTypes: ["Eléctrico", "Telecomunicaciones", "Civil", "Ambiental", "Industrial"],
  clients: ["Consorcio Vial del Norte", "Ecopetrol", "Claro", "Movistar"],
  cities: ["Bogotá", "Medellín", "Cali", "Barranquilla", "Bucaramanga"]
};

export default function AdminSettings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('params'); // 'params', 'users', 'logs'
  const [globalParams, setGlobalParams] = useLocalStorage('sgi_global_parameters', DEFAULT_PARAMS);

  // States for parameters editing
  const [newProjectType, setNewProjectType] = useState('');
  const [newClient, setNewClient] = useState('');
  const [newCity, setNewCity] = useState('');

  // States for user management
  const [profiles, setProfiles] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // States for activity logs
  const [activityLogs, setActivityLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logSearch, setLogSearch] = useState('');

  // Settle parameters structure fallback in case localstorage returned something else
  const currentParams = {
    projectTypes: globalParams?.projectTypes || DEFAULT_PARAMS.projectTypes,
    clients: globalParams?.clients || DEFAULT_PARAMS.clients,
    cities: globalParams?.cities || DEFAULT_PARAMS.cities
  };

  // Fetch registered users (profiles)
  const fetchProfiles = async () => {
    setUsersLoading(true);
    try {
      if (import.meta.env.VITE_MOCK_AUTH === 'true' || !isSupabaseConfigured) {
        // Mock Mode: read from localStorage sgi_users
        const mockUsers = JSON.parse(localStorage.getItem('sgi_users') || '[]');
        // Ensure the logged in user is in the list
        if (!mockUsers.some(u => u.email === user.email)) {
          mockUsers.push({ email: user.email, name: user.name || 'Administrador', role: user.role });
          localStorage.setItem('sgi_users', JSON.stringify(mockUsers));
        }
        setProfiles(mockUsers.map((u, i) => ({
          id: u.id || `mock-${i}`,
          email: u.email,
          name: u.name || u.email.split('@')[0],
          role: u.role || 'Líder de Calidad',
          created_at: u.created_at || new Date().toISOString()
        })));
        setIsOfflineMode(true);
      } else {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProfiles(data || []);
        setIsOfflineMode(false);
      }
    } catch (err) {
      console.error("Error fetching profiles:", err);
      // Fallback
      const localFallback = [{ id: '1', email: user.email, name: user.name || 'Admin', role: user.role, created_at: new Date().toISOString() }];
      setProfiles(localFallback);
      setIsOfflineMode(true);
    } finally {
      setUsersLoading(false);
    }
  };

  // Fetch activity logs
  const fetchActivityLogs = async () => {
    setLogsLoading(true);
    try {
      if (import.meta.env.VITE_MOCK_AUTH === 'true' || !isSupabaseConfigured) {
        const localLogs = JSON.parse(localStorage.getItem('sgi_activity_logs') || '[]');
        setActivityLogs(localLogs);
      } else {
        const { data, error } = await supabase
          .from('activity_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(200);

        if (error) {
          if (error.code === '42P01') { // table not created yet
            const localLogs = JSON.parse(localStorage.getItem('sgi_activity_logs') || '[]');
            setActivityLogs(localLogs);
          } else {
            throw error;
          }
        } else {
          setActivityLogs(data || []);
        }
      }
    } catch (err) {
      console.error("Error fetching activity logs:", err);
      const localLogs = JSON.parse(localStorage.getItem('sgi_activity_logs') || '[]');
      setActivityLogs(localLogs);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      fetchProfiles();
    } else if (activeTab === 'logs') {
      fetchActivityLogs();
    }
  }, [activeTab]);

  // Parameters handlers
  const handleAddParam = (type, value) => {
    if (!value.trim()) return;
    const cleanValue = value.trim();

    if (type === 'projectType') {
      if (currentParams.projectTypes.includes(cleanValue)) return alert("El tipo de proyecto ya existe");
      setGlobalParams({
        ...currentParams,
        projectTypes: [...currentParams.projectTypes, cleanValue]
      });
      setNewProjectType('');
      logActivity(user, "Parámetro Creado", `Agregado tipo de proyecto: ${cleanValue}`);
    } else if (type === 'client') {
      if (currentParams.clients.includes(cleanValue)) return alert("El cliente ya existe");
      setGlobalParams({
        ...currentParams,
        clients: [...currentParams.clients, cleanValue]
      });
      setNewClient('');
      logActivity(user, "Parámetro Creado", `Agregado cliente: ${cleanValue}`);
    } else if (type === 'city') {
      if (currentParams.cities.includes(cleanValue)) return alert("La ciudad ya existe");
      setGlobalParams({
        ...currentParams,
        cities: [...currentParams.cities, cleanValue]
      });
      setNewCity('');
      logActivity(user, "Parámetro Creado", `Agregada ciudad: ${cleanValue}`);
    }
  };

  const handleDeleteParam = (type, indexToDelete) => {
    if (!window.confirm("¿Está seguro de eliminar este parámetro? Esto puede afectar los selectores en las encuestas y otros formularios.")) return;

    if (type === 'projectType') {
      const removedVal = currentParams.projectTypes[indexToDelete];
      setGlobalParams({
        ...currentParams,
        projectTypes: currentParams.projectTypes.filter((_, idx) => idx !== indexToDelete)
      });
      logActivity(user, "Parámetro Eliminado", `Eliminado tipo de proyecto: ${removedVal}`);
    } else if (type === 'client') {
      const removedVal = currentParams.clients[indexToDelete];
      setGlobalParams({
        ...currentParams,
        clients: currentParams.clients.filter((_, idx) => idx !== indexToDelete)
      });
      logActivity(user, "Parámetro Eliminado", `Eliminado cliente: ${removedVal}`);
    } else if (type === 'city') {
      const removedVal = currentParams.cities[indexToDelete];
      setGlobalParams({
        ...currentParams,
        cities: currentParams.cities.filter((_, idx) => idx !== indexToDelete)
      });
      logActivity(user, "Parámetro Eliminado", `Eliminada ciudad: ${removedVal}`);
    }
  };

  // User role modification handler
  const handleRoleChange = async (profileId, email, newRole) => {
    try {
      if (import.meta.env.VITE_MOCK_AUTH === 'true' || !isSupabaseConfigured) {
        const mockUsers = JSON.parse(localStorage.getItem('sgi_users') || '[]');
        const updated = mockUsers.map(u => u.email === email ? { ...u, role: newRole } : u);
        localStorage.setItem('sgi_users', JSON.stringify(updated));
        alert("Rol actualizado localmente de forma exitosa.");
        fetchProfiles();
      } else {
        const { error } = await supabase
          .from('profiles')
          .update({ role: newRole })
          .eq('id', profileId);

        if (error) throw error;
        alert(`Rol del usuario ${email} actualizado a ${newRole} con éxito.`);
        fetchProfiles();
      }
      logActivity(user, "Cambio de Rol", `Modificado rol de ${email} a ${newRole}`);
    } catch (err) {
      console.error("Error updating role:", err);
      alert("Error al actualizar el rol: " + err.message);
    }
  };

  // Password reset handler
  const handleResetPassword = async (email) => {
    if (!window.confirm(`¿Enviar correo de restablecimiento de contraseña a ${email}?`)) return;
    try {
      if (import.meta.env.VITE_MOCK_AUTH === 'true' || !isSupabaseConfigured) {
        alert(`[MODO LOCAL] Se ha simulado el envío de restablecimiento de contraseña a ${email}.`);
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + '/login'
        });
        if (error) throw error;
        alert(`Se ha enviado un correo con instrucciones para restablecer la contraseña a ${email}.`);
      }
      logActivity(user, "Restablecer Contraseña", `Solicitado enlace de restablecimiento para ${email}`);
    } catch (err) {
      console.error("Error resetting password:", err);
      alert("Error al enviar solicitud: " + err.message);
    }
  };

  // Filters
  const filteredProfiles = profiles.filter(p => 
    p.email.toLowerCase().includes(userSearch.toLowerCase()) || 
    p.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    p.role.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredLogs = activityLogs.filter(l => 
    l.user_email.toLowerCase().includes(logSearch.toLowerCase()) || 
    l.user_name.toLowerCase().includes(logSearch.toLowerCase()) || 
    l.action.toLowerCase().includes(logSearch.toLowerCase()) || 
    (l.details && l.details.toLowerCase().includes(logSearch.toLowerCase()))
  );

  return (
    <div className="view-container">
      <div className="view-header" style={{ marginBottom: '1.5rem' }}>
        <h2><Sliders size={22} style={{ verticalAlign: 'middle', marginRight: '8px', color: 'var(--accent-primary)' }} /> Panel de Control de Administración</h2>
        <p className="subtitle">Gestione la parametrización de variables globales, permisos de usuarios y audite el historial de actividad.</p>
      </div>

      {/* Tabs Menu */}
      <div className="tab-menu" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button 
          className={`tab-btn ${activeTab === 'params' ? 'active' : ''}`}
          onClick={() => setActiveTab('params')}
          style={{
            padding: '0.5rem 1rem',
            background: activeTab === 'params' ? 'var(--accent-primary)' : 'transparent',
            color: activeTab === 'params' ? 'white' : 'var(--text-secondary)',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Sliders size={15} /> Parametrización SGI
        </button>
        <button 
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
          style={{
            padding: '0.5rem 1rem',
            background: activeTab === 'users' ? 'var(--accent-primary)' : 'transparent',
            color: activeTab === 'users' ? 'white' : 'var(--text-secondary)',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Users size={15} /> Usuarios Activos
        </button>
        <button 
          className={`tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
          style={{
            padding: '0.5rem 1rem',
            background: activeTab === 'logs' ? 'var(--accent-primary)' : 'transparent',
            color: activeTab === 'logs' ? 'white' : 'var(--text-secondary)',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Activity size={15} /> Historial de Auditoría
        </button>
      </div>

      {/* Offline Alert */}
      {isOfflineMode && activeTab === 'users' && (
        <div style={{ background: 'rgba(245, 158, 11, 0.1)', borderLeft: '4px solid var(--warning)', padding: '0.75rem 1rem', borderRadius: '6px', marginBottom: '1.25rem', fontSize: '0.82rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={16} style={{ color: 'var(--warning)' }} />
          <span><strong>Modo de Desarrollo o Sin Conexión</strong>: Mostrando y gestionando base de usuarios local guardada en localStorage (`sgi_users`).</span>
        </div>
      )}

      {/* Tab Contents: Params */}
      {activeTab === 'params' && (
        <div className="grid-3" style={{ gap: '1.5rem' }}>
          {/* Card: Project Types */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', margin: 0, color: 'var(--text-primary)' }}>
              Tipos de Proyecto
            </h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Ej: Civil / HSEQ" 
                style={{ margin: 0 }}
                value={newProjectType}
                onChange={e => setNewProjectType(e.target.value)}
              />
              <button className="btn-primary" style={{ padding: '0.5rem' }} onClick={() => handleAddParam('projectType', newProjectType)}>
                <Plus size={16} />
              </button>
            </div>
            <div style={{ maxHeight: '250px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
              {currentParams.projectTypes.map((pt, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', borderBottom: idx === currentParams.projectTypes.length - 1 ? 'none' : '1px solid var(--border-color)', background: 'var(--bg-secondary)', fontSize: '0.85rem' }}>
                  <span>{pt}</span>
                  <button className="btn-icon" style={{ color: 'var(--danger)', padding: 0 }} onClick={() => handleDeleteParam('projectType', idx)}>
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Card: Clients */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', margin: 0, color: 'var(--text-primary)' }}>
              Clientes / Razón Social
            </h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Ej: Ecopetrol" 
                style={{ margin: 0 }}
                value={newClient}
                onChange={e => setNewClient(e.target.value)}
              />
              <button className="btn-primary" style={{ padding: '0.5rem' }} onClick={() => handleAddParam('client', newClient)}>
                <Plus size={16} />
              </button>
            </div>
            <div style={{ maxHeight: '250px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
              {currentParams.clients.map((c, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', borderBottom: idx === currentParams.clients.length - 1 ? 'none' : '1px solid var(--border-color)', background: 'var(--bg-secondary)', fontSize: '0.85rem' }}>
                  <span>{c}</span>
                  <button className="btn-icon" style={{ color: 'var(--danger)', padding: 0 }} onClick={() => handleDeleteParam('client', idx)}>
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Card: Cities */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', margin: 0, color: 'var(--text-primary)' }}>
              Ciudades de Operación
            </h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Ej: Cali" 
                style={{ margin: 0 }}
                value={newCity}
                onChange={e => setNewCity(e.target.value)}
              />
              <button className="btn-primary" style={{ padding: '0.5rem' }} onClick={() => handleAddParam('city', newCity)}>
                <Plus size={16} />
              </button>
            </div>
            <div style={{ maxHeight: '250px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
              {currentParams.cities.map((city, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', borderBottom: idx === currentParams.cities.length - 1 ? 'none' : '1px solid var(--border-color)', background: 'var(--bg-secondary)', fontSize: '0.85rem' }}>
                  <span>{city}</span>
                  <button className="btn-icon" style={{ color: 'var(--danger)', padding: 0 }} onClick={() => handleDeleteParam('city', idx)}>
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab Contents: Users */}
      {activeTab === 'users' && (
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--border-color)', padding: '0.25rem 0.5rem', borderRadius: '6px', background: 'var(--bg-secondary)', minWidth: '250px' }}>
              <Search size={14} style={{ color: 'var(--text-secondary)' }} />
              <input 
                type="text" 
                placeholder="Buscar por nombre, correo o rol..."
                value={userSearch} 
                onChange={e => setUserSearch(e.target.value)}
                style={{ border: 'none', background: 'transparent', margin: 0, padding: '0.25rem 0.5rem', width: '100%', fontSize: '0.82rem' }}
              />
            </div>
            <button className="btn-secondary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }} onClick={fetchProfiles}>
              <RefreshCw size={12} style={{ marginRight: '4px' }} /> Actualizar Lista
            </button>
          </div>

          <div className="table-responsive">
            {usersLoading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Cargando usuarios registrados...</div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Correo Electrónico</th>
                    <th>Fecha de Registro</th>
                    <th>Rol de Acceso</th>
                    <th style={{ textAlign: 'center' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProfiles.length === 0 ? (
                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No se encontraron usuarios</td></tr>
                  ) : filteredProfiles.map(p => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 600 }}>{p.name}</td>
                      <td>{p.email}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(p.created_at).toLocaleDateString()} {new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                      <td>
                        <select 
                          className="form-control"
                          value={p.role} 
                          disabled={p.email.toLowerCase() === 'jjairojimenez@gmail.com' || p.email === user.email}
                          onChange={e => handleRoleChange(p.id, p.email, e.target.value)}
                          style={{ margin: 0, padding: '0.25rem 0.5rem', fontSize: '0.8rem', minWidth: '180px' }}
                        >
                          <option value="Administrador General">Administrador General</option>
                          <option value="Líder de Calidad">Líder de Calidad</option>
                          <option value="Coordinador SST">Coordinador SST</option>
                        </select>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                          <button 
                            className="btn-secondary" 
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }} 
                            title="Restablecer Contraseña"
                            onClick={() => handleResetPassword(p.email)}
                          >
                            <Key size={11} /> Clave
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Tab Contents: Activity Logs */}
      {activeTab === 'logs' && (
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--border-color)', padding: '0.25rem 0.5rem', borderRadius: '6px', background: 'var(--bg-secondary)', minWidth: '300px' }}>
              <Search size={14} style={{ color: 'var(--text-secondary)' }} />
              <input 
                type="text" 
                placeholder="Buscar por usuario, acción o detalles..."
                value={logSearch} 
                onChange={e => setLogSearch(e.target.value)}
                style={{ border: 'none', background: 'transparent', margin: 0, padding: '0.25rem 0.5rem', width: '100%', fontSize: '0.82rem' }}
              />
            </div>
            <button className="btn-secondary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }} onClick={fetchActivityLogs}>
              <RefreshCw size={12} style={{ marginRight: '4px' }} /> Actualizar Bitácora
            </button>
          </div>

          <div style={{ maxHeight: '600px', overflowY: 'auto', padding: '0.5rem 0.25rem' }}>
            {logsLoading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Cargando bitácora de auditoría...</div>
            ) : filteredLogs.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No se encontraron registros de actividad en la bitácora.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingLeft: '1rem', borderLeft: '2px solid var(--border-color)', position: 'relative' }}>
                {filteredLogs.map((log) => {
                  const logDate = new Date(log.created_at);
                  const isActionSystem = log.action.includes('Eliminado') || log.action.includes('Falla');
                  return (
                    <div key={log.id} style={{ position: 'relative', background: 'var(--bg-secondary)', padding: '0.85rem 1rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                      {/* Timeline dot */}
                      <span style={{
                        position: 'absolute',
                        left: '-1.45rem',
                        top: '1rem',
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: isActionSystem ? 'var(--danger)' : 'var(--accent-primary)',
                        border: '2px solid var(--card-bg)'
                      }}></span>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: isActionSystem ? 'var(--danger)' : 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <ShieldCheck size={14} /> {log.action}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {logDate.toLocaleDateString()} {logDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>

                      <p style={{ fontSize: '0.82rem', margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>
                        {log.details || 'Sin detalles especificados'}
                      </p>

                      <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        <span><strong>Usuario:</strong> {log.user_name} ({log.user_email})</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
