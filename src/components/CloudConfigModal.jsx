import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { 
  getOneDriveSettings, 
  saveOneDriveSettings, 
  getStoredTokens, 
  clearStoredTokens, 
  getAuthUrl, 
  exchangeCodeForToken 
} from '../services/oneDriveService';
import { Cloud, Key, Folder, RefreshCw, AlertCircle, CheckCircle, Info, Lock, AlertTriangle, ExternalLink } from 'lucide-react';

export default function CloudConfigModal({ isOpen, onClose }) {
  const [enabled, setEnabled] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [clientId, setClientId] = useState('');
  const [tenantId, setTenantId] = useState('common');
  const [folderName, setFolderName] = useState('SGI_Enterprise');
  
  // Connection state
  const [tokenData, setTokenData] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Load settings on open
  useEffect(() => {
    if (isOpen) {
      const settings = getOneDriveSettings();
      setEnabled(settings.enabled);
      setIsDemoMode(settings.isDemoMode);
      setClientId(settings.clientId);
      setTenantId(settings.tenantId || 'common');
      setFolderName(settings.folderName || 'SGI_Enterprise');
      
      const tokens = getStoredTokens();
      setTokenData(tokens);
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [isOpen]);

  // Listener for OAuth message from popup
  useEffect(() => {
    const handleAuthMessage = async (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.data && event.data.type === 'MS_AUTH_CODE') {
        const code = event.data.code;
        setIsConnecting(true);
        setErrorMsg('');
        setSuccessMsg('');
        
        try {
          const tokens = await exchangeCodeForToken(clientId, tenantId, code);
          setTokenData(tokens);
          setSuccessMsg('¡Cuenta Microsoft vinculada con éxito!');
        } catch (err) {
          console.error(err);
          setErrorMsg(`Error al conectar: ${err.message || 'No se pudo intercambiar el código.'}`);
        } finally {
          setIsConnecting(false);
        }
      }
    };

    window.addEventListener('message', handleAuthMessage);
    return () => {
      window.removeEventListener('message', handleAuthMessage);
    };
  }, [clientId, tenantId]);

  const handleSave = () => {
    if (enabled && !isDemoMode && !clientId) {
      setErrorMsg("Debe ingresar el ID de Cliente si el Modo Real está activo.");
      return;
    }

    const settings = {
      enabled,
      isDemoMode,
      clientId: clientId.trim(),
      tenantId: tenantId.trim() || 'common',
      folderName: folderName.trim() || 'SGI_Enterprise'
    };

    saveOneDriveSettings(settings);
    
    // Notify application that settings changed
    window.dispatchEvent(new CustomEvent('onedrive-settings-changed', { detail: settings }));
    
    setSuccessMsg('Configuración guardada correctamente.');
    setTimeout(() => {
      onClose();
    }, 800);
  };

  const handleConnect = () => {
    if (!clientId) {
      setErrorMsg("Ingrese el ID de Cliente para poder iniciar sesión.");
      return;
    }
    setErrorMsg('');
    setSuccessMsg('');
    
    const authUrl = getAuthUrl(clientId, tenantId);
    const width = 600;
    const height = 650;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    
    window.open(
      authUrl,
      'microsoft_auth_popup',
      `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes`
    );
  };

  const handleDisconnect = () => {
    clearStoredTokens();
    setTokenData(null);
    setSuccessMsg('Cuenta Microsoft desconectada.');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Integración Microsoft OneDrive Cloud">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '550px' }}>
        
        {/* Banner General */}
        <div style={{ display: 'flex', gap: '0.75rem', background: 'rgba(14, 165, 233, 0.08)', border: '1px solid rgba(14, 165, 233, 0.2)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)' }}>
          <Cloud size={20} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: 'var(--text-primary)' }}>Almacenamiento Corporativo HSEQ</h4>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Conecta el Gestor Documental a una cuenta corporativa de OneDrive. Toda la documentación subida en el Explorador se almacenará de manera estructurada en la nube de Microsoft.
            </p>
          </div>
        </div>

        {/* Mensajes de feedback */}
        {errorMsg && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', color: 'var(--danger)', fontSize: '0.75rem' }}>
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', color: 'var(--success)', fontSize: '0.75rem' }}>
            <CheckCircle size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Habilitar / Deshabilitar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
          <div>
            <label style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block' }}>Habilitar Microsoft OneDrive</label>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Activa o desactiva la conexión con la nube.</span>
          </div>
          <input 
            type="checkbox" 
            checked={enabled} 
            onChange={(e) => setEnabled(e.target.checked)} 
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
        </div>

        {enabled && (
          <>
            {/* Modo Demostración vs Real */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
              <div>
                <label style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block' }}>Modo Demostración (Simulador)</label>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Simula el flujo completo y genera enlaces ficticios sin credenciales de Azure.</span>
              </div>
              <input 
                type="checkbox" 
                checked={isDemoMode} 
                onChange={(e) => setIsDemoMode(e.target.checked)} 
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
            </div>

            {/* Configuración Azure AD */}
            <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', background: isDemoMode ? 'rgba(0,0,0,0.02)' : 'var(--bg-primary)', opacity: isDemoMode ? 0.75 : 1 }}>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)' }}>
                <Key size={16} /> Credenciales de Aplicación Azure AD
              </h4>

              {isDemoMode && (
                <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.5rem 0.75rem', borderRadius: '4px', borderLeft: '3px solid var(--warning)', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  <Info size={16} style={{ flexShrink: 0 }} />
                  <span>El Modo Demo está activo. Los campos de credenciales reales a continuación son opcionales para pruebas rápidas.</span>
                </div>
              )}

              <div className="grid-2" style={{ gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Application (client) ID</label>
                  <input 
                    type="text" 
                    placeholder="Ej: d7c83fbc-613d-4c32-..." 
                    value={clientId} 
                    onChange={(e) => setClientId(e.target.value)}
                    disabled={isConnecting}
                    style={{ width: '100%', padding: '0.4rem 0.6rem', fontSize: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Directory (tenant) ID</label>
                  <input 
                    type="text" 
                    placeholder="common (o tenant específico)" 
                    value={tenantId} 
                    onChange={(e) => setTenantId(e.target.value)}
                    disabled={isConnecting}
                    style={{ width: '100%', padding: '0.4rem 0.6rem', fontSize: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Carpeta en OneDrive</label>
                <input 
                  type="text" 
                  placeholder="SGI_Enterprise" 
                  value={folderName} 
                  onChange={(e) => setFolderName(e.target.value)}
                  style={{ width: '100%', padding: '0.4rem 0.6rem', fontSize: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>

            {/* Estado de Conexión de Cuenta */}
            {!isDemoMode && (
              <div className="card" style={{ padding: '1rem', border: '1px solid var(--border-color)' }}>
                <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)' }}>
                  <Lock size={16} /> Estado de Vinculación Microsoft 365
                </h4>

                {tokenData ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.4rem 0.6rem', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '4px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--success)', fontWeight: 600 }}>Conectado</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{tokenData.accountName}</span>
                    </div>
                    <button 
                      className="btn-secondary" 
                      onClick={handleDisconnect} 
                      style={{ alignSelf: 'flex-end', fontSize: '0.75rem', color: 'var(--danger)', borderColor: 'var(--danger)', padding: '0.25rem 0.5rem' }}
                    >
                      Desconectar Cuenta Microsoft
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '0.5rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--warning)', alignItems: 'center' }}>
                      <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                      <span>Se requiere autorización. Conecta el OneDrive Corporativo con el botón de abajo.</span>
                    </div>
                    
                    <button 
                      className="btn-primary" 
                      onClick={handleConnect} 
                      disabled={isConnecting || !clientId}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#0078d4', borderColor: '#0078d4' }}
                    >
                      {isConnecting ? (
                        <>
                          <RefreshCw size={14} className="spin" />
                          Verificando autorización...
                        </>
                      ) : (
                        <>
                          <ExternalLink size={14} />
                          Iniciar Sesión con Microsoft 365
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Acciones */}
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={handleSave}>Guardar Configuración</button>
        </div>

      </div>
    </Modal>
  );
}
