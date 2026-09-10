import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Layers, Moon, Sun, LayoutDashboard, Target, ChevronDown, 
  FolderTree, ShieldAlert, Lock, Settings, BarChart2, Activity, Sliders
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({});
  const [isDark, setIsDark] = useState(() => localStorage.getItem('sgi_v4_theme') === 'dark-theme');

  // Auto-open menu based on current path on mount and navigation
  useEffect(() => {
    const path = location.pathname;
    setOpenMenus(prev => {
      const updated = { ...prev };
      if (['/strategicElements', '/pestal', '/processMap', '/orgChart', '/stakeholders', '/bsc', '/committees', '/communications'].includes(path)) {
        updated['planeacion'] = true;
      }
      if (['/systemDocs'].includes(path)) {
        updated['docs'] = true;
      }
      if (['/risksIso', '/risksSst', '/envAspects', '/legalMatrix', '/changeManagement', '/integratedObjectives'].includes(path)) {
        updated['riesgos'] = true;
      }
      if (['/vendors', '/waste', '/emergencies', '/controlSst', '/unsafeReports'].includes(path)) {
        updated['control_operacional'] = true;
      }
      if (['/maintenances', '/trainings', '/induccion'].includes(path)) {
        updated['mantenimiento'] = true;
      }
      if (['/customerSatisfaction', '/internalAudits', '/managementReviews'].includes(path)) {
        updated['evaluacion'] = true;
      }
      if (['/pqrs', '/actionPlans', '/accidents'].includes(path)) {
        updated['mejora'] = true;
      }
      return updated;
    });
  }, [location.pathname]);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    document.body.classList.toggle('dark-theme', newDark);
    document.body.classList.toggle('light-theme', !newDark);
    localStorage.setItem('sgi_v4_theme', newDark ? 'dark-theme' : 'light-theme');
  };

  const toggleMenu = (menu) => {
    setOpenMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  return (
    <aside className="sidebar active">
      <div className="sidebar-header">
        <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/logo.png" alt="Logo FSCR" style={{ width: '32px', height: '32px', borderRadius: '4px', objectFit: 'contain' }} />
          <h2>SGI Enterprise</h2>
        </div>
      </div>
      
      <div className="user-profile">
        <div className="avatar" id="avatar-icon">{user?.email?.substring(0, 2).toUpperCase() || 'AD'}</div>
        <div className="user-info">
          <span className="user-name">{user?.email?.split('@')[0] || 'Administrador'}</span>
          <span className="user-role">SGI Global</span>
        </div>
        <button className="btn-icon" style={{color: 'white'}} onClick={toggleTheme} title="Cambiar Tema">
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      <nav className="main-nav">
        <ul>
          <li className="nav-item">
            <NavLink to="/dashboard" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={18}/> Dashboard
            </NavLink>
          </li>
          
          <li className={`nav-item ${openMenus['planeacion'] ? 'open' : ''}`}>
            <a className="nav-link toggle-submenu" onClick={() => toggleMenu('planeacion')}>
              <Target size={18}/> Planeación Est. <ChevronDown size={14} className="chevron"/>
            </a>
            <ul className="submenu">
              <li><NavLink to="/strategicElements" className="nav-link-sub">Elementos Estratégicos</NavLink></li>
              <li><NavLink to="/pestal" className="nav-link-sub">Matriz PESTAL</NavLink></li>
              <li><NavLink to="/processMap" className="nav-link-sub">Mapa de Procesos</NavLink></li>
              <li><NavLink to="/orgChart" className="nav-link-sub">Organigrama</NavLink></li>
              <li><NavLink to="/stakeholders" className="nav-link-sub">Partes Interesadas</NavLink></li>
              <li><NavLink to="/bsc" className="nav-link-sub">Balanced Scorecard</NavLink></li>
              <li><NavLink to="/committees" className="nav-link-sub">Comités y Participación</NavLink></li>
              <li><NavLink to="/communications" className="nav-link-sub">Matriz de Comunicaciones</NavLink></li>
            </ul>
          </li>

          <li className={`nav-item ${openMenus['docs'] ? 'open' : ''}`}>
            <a className="nav-link toggle-submenu" onClick={() => toggleMenu('docs')}>
              <FolderTree size={18}/> Documentación del Sistema <ChevronDown size={14} className="chevron"/>
            </a>
            <ul className="submenu">
              <li><NavLink to="/systemDocs" className="nav-link-sub">Explorador de Archivos</NavLink></li>
              <li><a className="nav-link-sub" style={{cursor: 'pointer'}} onClick={() => window.dispatchEvent(new CustomEvent('open-cloud-config'))}>Configurar OneDrive</a></li>
            </ul>
          </li>

          <li className={`nav-item ${openMenus['riesgos'] ? 'open' : ''}`}>
            <a className="nav-link toggle-submenu" onClick={() => toggleMenu('riesgos')}>
              <ShieldAlert size={18}/> Gestión de Riesgos <ChevronDown size={14} className="chevron"/>
            </a>
            <ul className="submenu">
              <li><NavLink to="/risksIso" className="nav-link-sub">Riesgos y Oportunidades</NavLink></li>
              <li><NavLink to="/risksSst" className="nav-link-sub">Peligros y riesgos</NavLink></li>
              <li><NavLink to="/envAspects" className="nav-link-sub">Asp. Ambientales</NavLink></li>
              <li><NavLink to="/legalMatrix" className="nav-link-sub">Matriz Legal</NavLink></li>
              <li><NavLink to="/changeManagement" className="nav-link-sub">Gestión de Cambios</NavLink></li>
              <li><NavLink to="/integratedObjectives" className="nav-link-sub">Objetivos Integrados</NavLink></li>
            </ul>
          </li>

          <li className={`nav-item ${openMenus['control_operacional'] ? 'open' : ''}`}>
            <a className="nav-link toggle-submenu" onClick={() => toggleMenu('control_operacional')}>
              <Sliders size={18}/> Control Operacional <ChevronDown size={14} className="chevron"/>
            </a>
            <ul className="submenu">
              <li><NavLink to="/vendors" className="nav-link-sub">Proveedores y Contratistas</NavLink></li>
              <li><NavLink to="/waste" className="nav-link-sub">Gestión de Residuos</NavLink></li>
              <li><NavLink to="/emergencies" className="nav-link-sub">Emergencias y Simulacros</NavLink></li>
              <li><NavLink to="/controlSst" className="nav-link-sub">Control SST</NavLink></li>
              <li><NavLink to="/unsafeReports" className="nav-link-sub">Reporte Actos/Cond. Inseguras</NavLink></li>
            </ul>
          </li>

          <li className={`nav-item ${openMenus['mantenimiento'] ? 'open' : ''}`}>
            <a className="nav-link toggle-submenu" onClick={() => toggleMenu('mantenimiento')}>
              <Settings size={18}/> Mantenimiento y Formación <ChevronDown size={14} className="chevron"/>
            </a>
            <ul className="submenu">
              <li><NavLink to="/maintenances" className="nav-link-sub">Plan de Mantenimiento</NavLink></li>
              <li><NavLink to="/trainings" className="nav-link-sub">Plan de Formaciones</NavLink></li>
              <li><NavLink to="/induccion" className="nav-link-sub">Control de Inducción</NavLink></li>
            </ul>
          </li>

          <li className={`nav-item ${openMenus['evaluacion'] ? 'open' : ''}`}>
            <a className="nav-link toggle-submenu" onClick={() => toggleMenu('evaluacion')}>
              <BarChart2 size={18}/> Seguimiento y Medición <ChevronDown size={14} className="chevron"/>
            </a>
            <ul className="submenu">
              <li><NavLink to="/customerSatisfaction" className="nav-link-sub">Satisfacción del Cliente</NavLink></li>
              <li><NavLink to="/internalAudits" className="nav-link-sub">Auditorías Internas</NavLink></li>
              <li><NavLink to="/managementReviews" className="nav-link-sub">Revisión por la Dirección</NavLink></li>
            </ul>
          </li>

          <li className={`nav-item ${openMenus['mejora'] ? 'open' : ''}`}>
            <a className="nav-link toggle-submenu" onClick={() => toggleMenu('mejora')}>
              <Activity size={18}/> Acción y Mejora <ChevronDown size={14} className="chevron"/>
            </a>
            <ul className="submenu">
              <li><NavLink to="/pqrs" className="nav-link-sub">Gestión de PQR's</NavLink></li>
              <li><NavLink to="/actionPlans" className="nav-link-sub">Planes de Acción</NavLink></li>
              <li><NavLink to="/accidents" className="nav-link-sub">Investigación de Accidentes</NavLink></li>
            </ul>
          </li>

          {user?.role === 'Administrador General' && (
            <li className="nav-item">
              <NavLink to="/admin" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
                <Sliders size={18}/> Panel de Control
              </NavLink>
            </li>
          )}
        </ul>
      </nav>
    </aside>
  );
}
