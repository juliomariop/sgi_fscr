import React, { useState } from 'react';
import { Layers, Mail, Lock, User, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logActivity } from '../utils/activityLogger';

export default function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, signUp } = useAuth();

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegistering) {
        if (!email || !password || !name || !role) {
          setError('Todos los campos son obligatorios');
          setLoading(false);
          return;
        }
        const { error: signUpError } = await signUp(email, password, name, role);
        if (signUpError) {
          setError(signUpError.message || 'Error al registrar usuario');
        } else {
          // If signup requires confirmation it will say so, otherwise log in automatically
          const { data, error: loginError } = await login(email, password);
          if (loginError) {
            setError('Usuario registrado. Por favor intente iniciar sesión o verifique su correo.');
          } else {
            const registeredUser = data?.user ? {
              id: data.user.id,
              email: data.user.email,
              name: name,
              role: role
            } : { email, name, role };
            await logActivity(registeredUser, "Registro de Usuario", `Usuario registrado e inicio de sesión automático: ${email}`);
            navigate('/dashboard');
          }
        }
      } else {
        if (!email || !password) {
          setError('Email y contraseña obligatorios');
          setLoading(false);
          return;
        }
        const { data, error: loginError } = await login(email, password);
        if (loginError) {
          setError(loginError.message || 'Credenciales inválidas');
        } else {
          const loggedUser = data?.user ? {
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.name || data.user.email.split('@')[0]
          } : { email };
          await logActivity(loggedUser, "Inicio de Sesión", "El usuario inició sesión en el sistema");
          navigate('/dashboard');
        }
      }
    } catch (err) {
      console.error(err);
      setError('Ocurrió un error inesperado durante la autenticación');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div style={{
      display: 'flex', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
      background: 'var(--bg-primary)', zIndex: 9999, justifyContent: 'center', alignItems: 'center',
      overflowY: 'auto', padding: '1rem'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ textAlign: 'center' }}>
          <img src="/logo.png" alt="Logo FSCR" style={{ width: '96px', height: '64px', borderRadius: '8px', marginBottom: '0.75rem', objectFit: 'contain', display: 'inline-block', background: '#fff', padding: '4px', border: '1px solid var(--border-color)' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>SGI Enterprise</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Sistema de Gestión Integral</p>
        </div>

        {/* Tab Selector */}
        <div style={{ display: 'flex', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: '4px' }}>
          <button 
            type="button" 
            style={{ 
              flex: 1, padding: '0.5rem', border: 'none', background: !isRegistering ? 'var(--bg-primary)' : 'transparent', 
              color: !isRegistering ? 'var(--text-primary)' : 'var(--text-secondary)', borderRadius: 'calc(var(--radius-md) - 2px)', 
              cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', transition: 'all 0.2s' 
            }}
            onClick={() => { setIsRegistering(false); setError(''); }}
          >
            Ingresar
          </button>
          <button 
            type="button" 
            style={{ 
              flex: 1, padding: '0.5rem', border: 'none', background: isRegistering ? 'var(--bg-primary)' : 'transparent', 
              color: isRegistering ? 'var(--text-primary)' : 'var(--text-secondary)', borderRadius: 'calc(var(--radius-md) - 2px)', 
              cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', transition: 'all 0.2s' 
            }}
            onClick={() => { setIsRegistering(true); setError(''); }}
          >
            Registrarse
          </button>
        </div>

        {error && (
          <div style={{ 
            background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', 
            color: 'var(--danger)', padding: '0.75rem', borderRadius: 'var(--radius-md)', 
            fontSize: '0.875rem', textAlign: 'left' 
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {isRegistering && (
            <>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={14} /> Nombre Completo
                </label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Ej: Ana Silva" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Briefcase size={14} /> Cargo en la Empresa
                </label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Ej: Coordinador HSEQ, Líder de Calidad" 
                  value={role} 
                  onChange={e => {
                    const val = e.target.value;
                    if (val.toLowerCase().trim() === 'administrador general') {
                      alert("El cargo de 'Administrador General' está reservado y no se puede seleccionar.");
                      return;
                    }
                    setRole(val);
                  }} 
                  required 
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={14} /> Correo Electrónico
            </label>
            <input 
              type="email" 
              className="form-control" 
              placeholder="ejemplo@empresa.com" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lock size={14} /> Contraseña
            </label>
            <input 
              type="password" 
              className="form-control" 
              placeholder="••••••••" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', marginTop: '0.5rem' }} 
            disabled={loading}
          >
            {loading ? 'Procesando...' : isRegistering ? 'Registrar y Entrar' : 'Iniciar Sesión'}
          </button>
        </form>


      </div>
    </div>
  );
}

