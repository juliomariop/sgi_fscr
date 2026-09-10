import React, { useState, useEffect, useMemo } from 'react';
import { 
  Settings, Plus, Filter, Edit2, Trash2, Download, CheckCircle, Clock, 
  AlertTriangle, Paperclip, Upload, Kanban, Calendar, Table, UploadCloud
} from 'lucide-react';
import Modal from '../components/Modal';
import ExportModal from '../components/ExportModal';
import { downloadCSV } from '../utils/exportUtils';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAppUsers } from '../hooks/useAppUsers';

const DEFAULT_PARAMS = {
  projectTypes: ["Eléctrico", "Telecomunicaciones", "Civil", "Ambiental", "Industrial"],
  clients: ["Consorcio Vial del Norte", "Ecopetrol", "Claro", "Movistar"],
  cities: ["Bogotá", "Medellín", "Cali", "Barranquilla", "Bucaramanga"]
};

export default function Maintenances() {
  const APP_USERS = useAppUsers();

  const [globalParams] = useLocalStorage('sgi_global_parameters', DEFAULT_PARAMS);

  const projectOptions = useMemo(() => {
    return (globalParams?.projectTypes && globalParams.projectTypes.length > 0) 
      ? globalParams.projectTypes 
      : DEFAULT_PARAMS.projectTypes;
  }, [globalParams?.projectTypes]);

  const cityOptions = useMemo(() => {
    return (globalParams?.cities && globalParams.cities.length > 0) 
      ? globalParams.cities 
      : DEFAULT_PARAMS.cities;
  }, [globalParams?.cities]);

  const clientOptions = useMemo(() => {
    return (globalParams?.clients && globalParams.clients.length > 0) 
      ? globalParams.clients 
      : DEFAULT_PARAMS.clients;
  }, [globalParams?.clients]);

  const [maintenances, setMaintenances] = useLocalStorage('sgi_maintenances', [
    { id: 1, category: 'Locativos', equipment: 'Fachada principal', date: '2026-06-20', execDate: '', responsible: 'Analista de Operaciones', evidence: '', status: 'Pendiente', needsAction: false, project: 'Eléctrico', city: 'Bogotá', client: 'Consorcio Vial del Norte' },
    { id: 2, category: 'Aires', equipment: 'Aire Piso 2', date: '2026-05-15', execDate: '2026-05-16', responsible: 'Analista de Operaciones', evidence: 'Mantenimiento preventivo, cambio de filtros.', attachedFile: 'reporte_clima.pdf', status: 'Realizado', needsAction: true, actionType: 'Reemplazo de Equipo', actionArea: 'Servicios Generales', actionDetail: 'Se detectó que el compresor está quemado y requiere cambio completo.', actionStatus: 'Pendiente', project: 'Civil', city: 'Cali', client: 'Ecopetrol' },
    { id: 3, category: 'Calibración', equipment: 'Balanza Analítica L-01', date: '2026-01-10', execDate: '', responsible: 'Líder de Calidad', evidence: '', status: 'Vencido', needsAction: false, project: 'Industrial', city: 'Medellín', client: 'Claro' }
  ]);
  
  const [filter, setFilter] = useState('Todos');

  // History and meta for Maintenance Plans
  const [maintenanceHistory, setMaintenanceHistory] = useLocalStorage('sgi_maintenance_history', [
    { version: '01', date: '2025-01-10', changes: 'Emisión Inicial del Cronograma y Plan de Mantenimiento Preventivo HSEQ.' }
  ]);
  const [meta, setMeta] = useLocalStorage('sgi_maintenance_meta', {
    version: 1,
    validity: '2026-12-31',
    lastUpdated: '2026-05-30'
  });

  const [exportConfig, setExportConfig] = useState({
    isOpen: false,
    exportType: 'excel',
    title: '',
    code: '',
    version: '01',
    validity: '',
    columns: [],
    data: [],
    history: [],
    contentHtml: ''
  });

  const [activeView, setActiveView] = useState('kanban'); // kanban, calendar, table

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    category: 'Locativos', equipment: '', date: '', execDate: '', responsible: '', evidence: '', status: 'Pendiente', attachedFile: '',
    needsAction: false, actionType: 'Reemplazo de Equipo', actionArea: 'Compras y Logística', actionDetail: '', actionStatus: 'Pendiente',
    project: '', city: '', client: ''
  });

  const categoriesList = ['Locativos', 'Aires', 'Equipos Eléctricos', 'Calibración'];
  const categories = ['Todos', ...categoriesList];
  
  // Quick fix on categories sync for legacy data (if 'Aires Acondicionados' -> 'Aires', or 'Calibración de Equipos' -> 'Calibración')
  const normalizedMaintenances = maintenances.map(m => {
    let cat = m.category;
    if (cat === 'Aires Acondicionados') cat = 'Aires';
    if (cat === 'Calibración de Equipos') cat = 'Calibración';
    return { 
      ...m, 
      category: cat,
      needsAction: m.needsAction || false,
      actionType: m.actionType || 'Reemplazo de Equipo',
      actionArea: m.actionArea || 'Compras y Logística',
      actionDetail: m.actionDetail || '',
      actionStatus: m.actionStatus || 'Pendiente'
    };
  });

  const [filterProject, setFilterProject] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterClient, setFilterClient] = useState('');

  const filtered = normalizedMaintenances.filter(m => {
    const matchCat = filter === 'Todos' || m.category === filter;
    const matchProject = !filterProject || m.project === filterProject;
    const matchCity = !filterCity || m.city === filterCity;
    const matchClient = !filterClient || m.client === filterClient;
    return matchCat && matchProject && matchCity && matchClient;
  });

  // Set default responsible
  useEffect(() => {
    if (APP_USERS.length > 0 && !formData.responsible) {
      setFormData(prev => ({ ...prev, responsible: APP_USERS[0].name }));
    }
  }, [APP_USERS, formData.responsible]);

  // Dashboard calculations
  const totalProg = normalizedMaintenances.length;
  const totalRealizados = normalizedMaintenances.filter(m => m.status === 'Realizado').length;
  const totalPendientes = totalProg - totalRealizados;
  const compliance = totalProg > 0 ? Math.round((totalRealizados / totalProg) * 100) : 0;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, attachedFile: file.name });
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({ 
        ...item,
        needsAction: item.needsAction || false,
        actionType: item.actionType || 'Reemplazo de Equipo',
        actionArea: item.actionArea || 'Compras y Logística',
        actionDetail: item.actionDetail || '',
        actionStatus: item.actionStatus || 'Pendiente'
      });
    } else {
      setEditingItem(null);
      setFormData({ 
        category: 'Locativos', 
        equipment: '', 
        date: new Date().toISOString().split('T')[0], 
        execDate: '', 
        responsible: APP_USERS[0]?.name || '', 
        evidence: '', 
        status: 'Pendiente', 
        attachedFile: '',
        needsAction: false,
        actionType: 'Reemplazo de Equipo',
        actionArea: 'Compras y Logística',
        actionDetail: '',
        actionStatus: 'Pendiente',
        project: '',
        city: '',
        client: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingItem) {
      setMaintenances(maintenances.map(m => m.id === editingItem.id ? { ...formData, id: m.id } : m));
    } else {
      setMaintenances([...maintenances, { ...formData, id: Date.now() }]);
    }
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Está seguro de eliminar este mantenimiento?")) {
      setMaintenances(maintenances.filter(m => m.id !== id));
    }
  };

  const handleUpdateActionStatus = (id, newStatus) => {
    setMaintenances(maintenances.map(m => {
      if (m.id === id) {
        return { ...m, actionStatus: newStatus };
      }
      return m;
    }));
  };

  const handleExport = () => {
    const cols = [
      { header: 'Categoría', key: 'category' },
      { header: 'Equipo / Ubicación', key: 'equipment' },
      { header: 'Fecha Programada', key: 'date' },
      { header: 'Fecha de Ejecución', key: 'execDate' },
      { header: 'Responsable', key: 'responsible' },
      { header: '¿Se Cumplió?', key: 'complied' },
      { header: 'Observaciones de Ejecución', key: 'evidence' },
      { header: 'Requerimientos / Acciones', key: 'requirements' }
    ];

    const dataToExport = normalizedMaintenances.map(m => ({
      category: m.category,
      equipment: m.equipment,
      date: m.date,
      execDate: m.execDate || 'Pendiente',
      responsible: m.responsible,
      complied: m.status === 'Realizado' ? 'SÍ' : 'NO',
      evidence: m.evidence || 'Sin observaciones registradas',
      requirements: m.needsAction 
        ? `${m.actionType} - Detalle: ${m.actionDetail} (${m.actionStatus})` 
        : 'No requiere acciones correctivas'
    }));

    // Generate dynamic HTML for PDF exports as well
    const reportHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #1e293b;">
        <h3 style="color: #0f172a; border-bottom: 2px solid #0284c7; padding-bottom: 6px; font-size: 16px; margin-top: 10px; font-weight: 700;">
          1. RESUMEN DE CUMPLIMIENTO DEL PLAN DE MANTENIMIENTO
        </h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 20px; text-align: center;">
          <tr>
            <td style="padding: 10px; border: 1px solid #cbd5e1; background: #f8fafc;">
              <span style="font-size: 11px; color: #64748b; font-weight: bold; text-transform: uppercase;">Mantenimientos Programados</span>
              <div style="font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 4px;">${totalProg}</div>
            </td>
            <td style="padding: 10px; border: 1px solid #cbd5e1; background: #f0fdf4;">
              <span style="font-size: 11px; color: #16a34a; font-weight: bold; text-transform: uppercase;">Mantenimientos Ejecutados</span>
              <div style="font-size: 20px; font-weight: 800; color: #16a34a; margin-top: 4px;">${totalRealizados}</div>
            </td>
            <td style="padding: 10px; border: 1px solid #cbd5e1; background: #fef2f2;">
              <span style="font-size: 11px; color: #ef4444; font-weight: bold; text-transform: uppercase;">Pendientes / Vencidos</span>
              <div style="font-size: 20px; font-weight: 800; color: #dc2626; margin-top: 4px;">${totalPendientes}</div>
            </td>
            <td style="padding: 10px; border: 1px solid #cbd5e1; background: #eff6ff;">
              <span style="font-size: 11px; color: #2563eb; font-weight: bold; text-transform: uppercase;">Porcentaje de Cumplimiento</span>
              <div style="font-size: 20px; font-weight: 800; color: #2563eb; margin-top: 4px;">${compliance}%</div>
            </td>
          </tr>
        </table>

        <h3 style="color: #0f172a; border-bottom: 2px solid #0284c7; padding-bottom: 6px; font-size: 16px; margin-top: 20px; font-weight: 700;">
          2. DETALLE DEL CRONOGRAMA DE MANTENIMIENTO
        </h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 11px;">
          <thead>
            <tr style="background: #f1f5f9; text-align: left; border-bottom: 2px solid #cbd5e1;">
              <th style="padding: 6px; border: 1px solid #cbd5e1;">Categoría</th>
              <th style="padding: 6px; border: 1px solid #cbd5e1;">Equipo / Ubicación</th>
              <th style="padding: 6px; border: 1px solid #cbd5e1;">Fecha Prog.</th>
              <th style="padding: 6px; border: 1px solid #cbd5e1;">Fecha Ejec.</th>
              <th style="padding: 6px; border: 1px solid #cbd5e1;">Responsable</th>
              <th style="padding: 6px; border: 1px solid #cbd5e1; text-align: center;">¿Cumplió?</th>
              <th style="padding: 6px; border: 1px solid #cbd5e1;">Observaciones de Ejecución</th>
              <th style="padding: 6px; border: 1px solid #cbd5e1;">Requerimientos / Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${normalizedMaintenances.map(m => `
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 6px; border: 1px solid #cbd5e1;">${m.category}</td>
                <td style="padding: 6px; border: 1px solid #cbd5e1; font-weight: bold;">${m.equipment}</td>
                <td style="padding: 6px; border: 1px solid #cbd5e1;">${m.date}</td>
                <td style="padding: 6px; border: 1px solid #cbd5e1;">${m.execDate || 'Pendiente'}</td>
                <td style="padding: 6px; border: 1px solid #cbd5e1;">${m.responsible}</td>
                <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; color: ${m.status === 'Realizado' ? '#16a34a' : '#ef4444'};">${m.status === 'Realizado' ? 'SÍ' : 'NO'}</td>
                <td style="padding: 6px; border: 1px solid #cbd5e1;">${m.evidence || 'Sin observaciones'}</td>
                <td style="padding: 6px; border: 1px solid #cbd5e1; font-size: 10px; color: ${m.needsAction ? '#b91c1c' : '#475569'};">
                  ${m.needsAction ? `<strong>${m.actionType}</strong>: ${m.actionDetail} (${m.actionStatus})` : 'Ninguno'}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    setExportConfig({
      isOpen: true,
      exportType: 'excel',
      title: 'Cronograma y Control del Plan de Mantenimiento Preventivo',
      code: 'COP-CRON-MNT-001',
      version: `0${meta.version}`,
      validity: meta.validity,
      columns: cols,
      data: dataToExport,
      history: maintenanceHistory,
      contentHtml: reportHtml
    });
  };

  const monthsNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const kanbanColumns = [
    { id: 'Pendiente', title: 'Pendientes / Programados', color: 'var(--warning)', bg: 'rgba(245, 158, 11, 0.03)' },
    { id: 'Realizado', title: 'Realizados / Cerrados', color: 'var(--success)', bg: 'rgba(16, 185, 129, 0.03)' },
    { id: 'Vencido', title: 'Vencidos / Fuera de Plazo', color: 'var(--danger)', bg: 'rgba(239, 68, 68, 0.03)' },
    { id: 'Cancelado', title: 'Cancelados / Suspendidos', color: 'var(--text-secondary)', bg: 'rgba(148, 163, 184, 0.03)' }
  ];

  return (
    <>
      <style>{`
        /* Kanban Grid Styles */
        .kanban-board {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .kanban-col {
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-color);
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          min-height: 420px;
        }

        .kanban-col-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid var(--border-color);
          padding-bottom: 0.4rem;
        }

        .kanban-col-title {
          font-weight: 700;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .kanban-cards-container {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
          overflow-y: auto;
          flex: 1;
        }

        /* Maintenance Kanban Card */
        .maint-card {
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 0.75rem;
          box-shadow: var(--shadow-sm);
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }

        .maint-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
          border-color: var(--accent-primary);
        }

        .maint-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .maint-card-title {
          font-weight: 700;
          font-size: 0.82rem;
          color: var(--text-primary);
          line-height: 1.3;
        }

        .maint-card-meta {
          font-size: 0.7rem;
          color: var(--text-secondary);
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        /* Calendar grid */
        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
          gap: 0.85rem;
          margin-bottom: 2rem;
        }

        .calendar-month-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 0.75rem;
          display: flex;
          flex-direction: column;
          min-height: 140px;
        }

        .calendar-month-title {
          font-weight: 700;
          font-size: 0.8rem;
          color: var(--text-secondary);
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.3rem;
          margin-bottom: 0.4rem;
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }

        .calendar-task-item {
          font-size: 0.72rem;
          padding: 0.2rem 0.35rem;
          border-radius: 4px;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          margin-bottom: 0.3rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          transition: background-color 0.15s;
        }

        .calendar-task-item:hover {
          background-color: var(--bg-tertiary);
          border-color: var(--accent-primary);
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }

      `}</style>

      {/* Page Header */}
      <div style={{display:'flex', justifyContent:'space-between', marginBottom:'1.5rem', alignItems:'center', flexWrap:'wrap', gap:'1rem'}}>
        <div>
          <p style={{color:'var(--text-secondary)', marginBottom:'0.25rem'}}>Plan de Mantenimiento de Infraestructura y Equipos</p>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>Plan de Mantenimiento</h2>
        </div>
        <div style={{display:'flex', gap:'0.5rem', flexWrap:'wrap'}}>
          <button className="btn-secondary" onClick={handleExport}><Download size={16}/> Exportar Plan</button>
          <button className="btn-primary" onClick={() => handleOpenModal()}><Plus size={16}/> Programar Mantenimiento</button>
        </div>
      </div>

      {/* Dashboard KPI cards */}
      <div className="grid-3" style={{marginBottom:'1.5rem'}}>
        <div className="card stat-card">
          <div className="stat-icon" style={{background:'rgba(59, 130, 246, 0.1)', color:'var(--accent-primary)'}}>
            <Settings size={24}/>
          </div>
          <div className="stat-info">
            <h3>{totalProg}</h3>
            <p>Mantenimientos Programados</p>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{background:'rgba(16, 185, 129, 0.1)', color:'var(--success)'}}>
            <CheckCircle size={24}/>
          </div>
          <div className="stat-info">
            <h3>{compliance}%</h3>
            <p>Cumplimiento General</p>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{background: totalPendientes > 0 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: totalPendientes > 0 ? 'var(--warning)' : 'var(--success)'}}>
            <AlertTriangle size={24}/>
          </div>
          <div className="stat-info">
            <h3>{totalRealizados} / {totalPendientes}</h3>
            <p>Realizados vs Pendientes</p>
          </div>
        </div>
      </div>

      {/* Main Tab View Switcher & Search filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button 
            className={`btn-secondary ${activeView === 'kanban' ? 'active' : ''}`}
            style={{ border: 'none', background: activeView === 'kanban' ? 'rgba(14, 165, 233, 0.1)' : 'transparent', color: activeView === 'kanban' ? 'var(--accent-primary)' : 'var(--text-secondary)', fontWeight: 600 }}
            onClick={() => setActiveView('kanban')}
          >
            <Kanban size={14} style={{ marginRight: '4px' }} /> Tablero Kanban
          </button>
          <button 
            className={`btn-secondary ${activeView === 'calendar' ? 'active' : ''}`}
            style={{ border: 'none', background: activeView === 'calendar' ? 'rgba(245, 158, 11, 0.1)' : 'transparent', color: activeView === 'calendar' ? 'var(--warning)' : 'var(--text-secondary)', fontWeight: 600 }}
            onClick={() => setActiveView('calendar')}
          >
            <Calendar size={14} style={{ marginRight: '4px' }} /> Cronograma Anual
          </button>
          <button 
            className={`btn-secondary ${activeView === 'table' ? 'active' : ''}`}
            style={{ border: 'none', background: activeView === 'table' ? 'rgba(16, 185, 129, 0.1)' : 'transparent', color: activeView === 'table' ? 'var(--success)' : 'var(--text-secondary)', fontWeight: 600 }}
            onClick={() => setActiveView('table')}
          >
            <Table size={14} style={{ marginRight: '4px' }} /> Historial (Tabla)
          </button>
          <button 
            className={`btn-secondary ${activeView === 'requests' ? 'active' : ''}`}
            style={{ border: 'none', background: activeView === 'requests' ? 'rgba(239, 68, 68, 0.1)' : 'transparent', color: activeView === 'requests' ? 'var(--danger)' : 'var(--text-secondary)', fontWeight: 600 }}
            onClick={() => setActiveView('requests')}
          >
            <AlertTriangle size={14} style={{ marginRight: '4px' }} /> Solicitudes Compra/Cambio ({normalizedMaintenances.filter(m => m.needsAction).length})
          </button>
        </div>
      </div>

      {/* Filters by Category */}
      <div className="card" style={{marginBottom:'1.5rem', padding:'0.75rem 1.5rem'}}>
        <div style={{display:'flex', alignItems:'center', gap:'0.75rem', flexWrap:'wrap', marginBottom: '0.75rem'}}>
          <span style={{fontSize:'0.85rem', fontWeight:600, color:'var(--text-secondary)'}}><Filter size={14} style={{verticalAlign:'middle', marginRight:'4px'}}/> Filtrar Categoría:</span>
          {categories.map(c => (
            <button 
              key={c} 
              onClick={() => setFilter(c)} 
              style={{
                padding:'0.35rem 0.75rem', borderRadius:'9999px', fontSize:'0.8rem', fontWeight:600, 
                border:`2px solid ${c === filter ? 'var(--accent-primary)' : 'var(--border-color)'}`, 
                background: c === filter ? 'var(--accent-primary)' : 'var(--bg-secondary)', 
                color: c === filter ? 'white' : 'var(--text-secondary)', 
                cursor:'pointer', transition:'all 0.2s'
              }}
            >
              {c}
            </button>
          ))}
        </div>

        {/* BARRA DE FILTROS DE PARAMETRIZACIÓN SGI */}
        <div style={{
          background: 'var(--bg-secondary)', 
          padding: '0.6rem 0.85rem', 
          borderRadius: '6px', 
          border: '1px solid var(--border-color)', 
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--accent-primary)', fontWeight: 700, fontSize: '0.8rem' }}>
            <Filter size={14} /> Filtros SGI:
          </div>

          <div style={{ flex: '1 1 150px', minWidth: '130px' }}>
            <select 
              className="form-control" 
              style={{ fontSize: '0.78rem', padding: '0.3rem 0.5rem', margin: 0 }}
              value={filterProject}
              onChange={e => setFilterProject(e.target.value)}
            >
              <option value="">Todos los Proyectos</option>
              {projectOptions.map((p, idx) => (
                <option key={idx} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div style={{ flex: '1 1 150px', minWidth: '130px' }}>
            <select 
              className="form-control" 
              style={{ fontSize: '0.78rem', padding: '0.3rem 0.5rem', margin: 0 }}
              value={filterCity}
              onChange={e => setFilterCity(e.target.value)}
            >
              <option value="">Todas las Ciudades</option>
              {cityOptions.map((c, idx) => (
                <option key={idx} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div style={{ flex: '1 1 150px', minWidth: '130px' }}>
            <select 
              className="form-control" 
              style={{ fontSize: '0.78rem', padding: '0.3rem 0.5rem', margin: 0 }}
              value={filterClient}
              onChange={e => setFilterClient(e.target.value)}
            >
              <option value="">Todos los Clientes</option>
              {clientOptions.map((c, idx) => (
                <option key={idx} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {(filterProject || filterCity || filterClient) && (
            <button 
              className="btn-secondary" 
              style={{ fontSize: '0.72rem', padding: '0.25rem 0.5rem', color: 'var(--danger)', borderColor: 'var(--danger)' }}
              onClick={() => {
                setFilterProject('');
                setFilterCity('');
                setFilterClient('');
              }}
            >
              Limpiar Filtros
            </button>
          )}
        </div>
      </div>

      {/* KANBAN BOARD VIEW */}
      {activeView === 'kanban' && (
        <div className="kanban-board fade-in">
          {kanbanColumns.map(col => {
            const tasksInCol = filtered.filter(t => t.status === col.id);
            return (
              <div key={col.id} className="kanban-col" style={{ borderTop: `4px solid ${col.color}`, background: col.bg }}>
                
                <div className="kanban-col-header">
                  <span className="kanban-col-title" style={{ color: col.color }}>
                    {col.id === 'Pendiente' && <Clock size={14} />}
                    {col.id === 'Realizado' && <CheckCircle size={14} />}
                    {col.id === 'Vencido' && <AlertTriangle size={14} />}
                    {col.id === 'Cancelado' && <Settings size={14} />}
                    {col.title}
                  </span>
                  <span className="badge" style={{ background: col.color, color: col.id === 'Pendiente' ? 'black' : 'white', fontSize: '0.7rem', padding: '0.15rem 0.35rem' }}>
                    {tasksInCol.length}
                  </span>
                </div>

                <div className="kanban-cards-container">
                  {tasksInCol.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem 1rem', border: '1px dashed var(--border-color)', borderRadius: '6px', fontSize: '0.78rem', color: 'var(--text-muted)', margin: 'auto 0' }}>
                      Sin mantenimientos
                    </div>
                  ) : (
                    tasksInCol.map(t => (
                      <div key={t.id} className="maint-card">
                        <div className="maint-card-header">
                          <span className="badge" style={{ fontSize: '0.62rem', padding: '0.1rem 0.3rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                            {t.category}
                          </span>
                          <div style={{ display: 'flex', gap: '2px' }}>
                            <button className="btn-icon" style={{ padding: '0.15rem' }} onClick={() => handleOpenModal(t)} title="Editar"><Edit2 size={11} /></button>
                            <button className="btn-icon" style={{ padding: '0.15rem', color: 'var(--danger)' }} onClick={() => handleDelete(t.id)} title="Eliminar"><Trash2 size={11} /></button>
                          </div>
                        </div>
                        <div className="maint-card-title">
                          {t.equipment}
                          {t.needsAction && (
                            <div style={{ marginTop: '0.25rem' }}>
                              <span 
                                className={`badge ${t.actionStatus === 'Cerrado' ? 'badge-success' : t.actionStatus === 'En Proceso' ? 'badge-info' : 'badge-warning'}`}
                                style={{ fontSize: '0.62rem', padding: '0.1rem 0.25rem', display: 'inline-block' }}
                                title={t.actionDetail}
                              >
                                ⚠️ Solic. {t.actionArea} ({t.actionStatus})
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="maint-card-meta">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={11} style={{ color: 'var(--text-muted)' }} />
                            <span>Prog: <strong>{t.date}</strong></span>
                          </div>
                          {t.execDate && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--success)' }}>
                              <CheckCircle size={11} />
                              <span>Ejec: <strong>{t.execDate}</strong></span>
                            </div>
                          )}
                          <div>
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Resp: <strong>{t.responsible}</strong></span>
                          </div>
                        </div>

                        {/* Attached Evidence file */}
                        {t.attachedFile && (
                          <div 
                            style={{ 
                              fontSize: '0.72rem', 
                              color: 'var(--info)', 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '0.2rem', 
                              background: 'var(--bg-secondary)', 
                              padding: '0.25rem 0.45rem', 
                              borderRadius: '4px', 
                              border: '1px solid var(--border-color)',
                              cursor: 'pointer',
                              marginTop: '0.15rem'
                            }}
                            onClick={() => alert('Descargando reporte de ejecución: ' + t.attachedFile)}
                            title="Descargar reporte de ejecución"
                          >
                            <Paperclip size={11} />
                            <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', flex: 1 }}>{t.attachedFile}</span>
                          </div>
                        )}

                        {/* Fast execute action */}
                        {t.status !== 'Realizado' && t.status !== 'Cancelado' && (
                          <button 
                            type="button" 
                            className="btn-primary" 
                            style={{ width: '100%', fontSize: '0.72rem', padding: '0.25rem 0.45rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}
                            onClick={() => {
                              setEditingItem(t);
                              setFormData({
                                ...t,
                                status: 'Realizado',
                                execDate: new Date().toISOString().split('T')[0]
                              });
                              setIsModalOpen(true);
                            }}
                          >
                            <CheckCircle size={11} /> Registrar Ejecución
                          </button>
                        )}

                      </div>
                    ))
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* MONTHLY PROGRAM TIMELINE GRID */}
      {activeView === 'calendar' && (
        <div className="calendar-grid fade-in">
          {monthsNames.map((monthName, idx) => {
            const tasksInMonth = filtered.filter(m => {
              if (!m.date) return false;
              const monthVal = parseInt(m.date.split('-')[1]) - 1;
              return monthVal === idx;
            });

            return (
              <div key={monthName} className="calendar-month-card">
                <div className="calendar-month-title">{monthName}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', overflowY: 'auto', flex: 1 }}>
                  {tasksInMonth.length === 0 ? (
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: 'auto' }}>Sin planificar</span>
                  ) : (
                    tasksInMonth.map(t => {
                      let dotColor = 'var(--warning)';
                      if (t.status === 'Realizado') dotColor = 'var(--success)';
                      else if (t.status === 'Vencido') dotColor = 'var(--danger)';
                      else if (t.status === 'Cancelado') dotColor = 'var(--text-muted)';
                      
                      return (
                        <div 
                          key={t.id} 
                          className="calendar-task-item"
                          onClick={() => handleOpenModal(t)}
                          title={`Ver detalle: ${t.equipment} (${t.status})`}
                        >
                          <span className="status-dot" style={{ background: dotColor }} />
                          <span style={{ fontWeight: 600, fontSize: '0.7rem' }}>
                            Día {parseInt(t.date.split('-')[2]) || '?'}:
                          </span>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                            {t.equipment}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DETAILED TABLE LIST */}
      {activeView === 'table' && (
        <div className="card fade-in" style={{padding:0, overflow:'hidden'}}>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th>Proyecto / Ubicación / Cliente</th>
                  <th>Equipo/Área</th>
                  <th>Fecha Programada</th>
                  <th>Fecha Ejecución</th>
                  <th>Responsable</th>
                  <th>Estado</th>
                  <th>Soporte de Ejecución</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan="9" style={{textAlign:'center', padding:'2rem'}}>No hay mantenimientos planificados en esta categoría.</td></tr>
                ) : filtered.map(m => {
                  let badgeClass = 'badge-info';
                  if (m.status === 'Realizado') badgeClass = 'badge-success';
                  else if (m.status === 'Vencido') badgeClass = 'badge-danger';
                  else if (m.status === 'Pendiente') badgeClass = 'badge-warning';
                  else if (m.status === 'Cancelado') badgeClass = 'badge-secondary';

                  return (
                    <tr key={m.id}>
                      <td><span className="badge" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>{m.category}</span></td>
                      <td>
                        {m.project && <div style={{fontSize:'0.78rem', color:'var(--accent-primary)', fontWeight:600}}>Proy: {m.project}</div>}
                        {m.city && <div style={{fontSize:'0.75rem', color:'var(--text-muted)'}}>Ciudad: {m.city}</div>}
                        {m.client && <div style={{fontSize:'0.75rem', color:'var(--success)'}}>Cliente: {m.client}</div>}
                        {!m.project && !m.city && !m.client && <span style={{color:'var(--text-muted)', fontSize:'0.8rem'}}>-</span>}
                      </td>
                      <td>
                        <strong>{m.equipment}</strong>
                        {m.needsAction && (
                          <div style={{ marginTop: '0.2rem' }}>
                            <span 
                              className={`badge ${m.actionStatus === 'Cerrado' ? 'badge-success' : m.actionStatus === 'En Proceso' ? 'badge-info' : 'badge-warning'}`}
                              style={{ fontSize: '0.65rem', padding: '0.1rem 0.25rem' }}
                              title={m.actionDetail}
                            >
                              ⚠️ {m.actionArea}: {m.actionStatus}
                            </span>
                          </div>
                        )}
                      </td>
                      <td>{m.date}</td>
                      <td>{m.execDate || '-'}</td>
                      <td style={{ fontWeight: 600 }}>{m.responsible}</td>
                      <td><span className={`badge ${badgeClass}`}>{m.status}</span></td>
                      <td>
                        {m.attachedFile ? (
                          <button 
                            className="btn-secondary" 
                            style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                            onClick={() => alert('Descargando reporte de ejecución: ' + m.attachedFile)}
                          >
                            <Paperclip size={11}/> {m.attachedFile.length > 15 ? m.attachedFile.substring(0, 13) + '...' : m.attachedFile}
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Sin reporte</span>
                        )}
                      </td>
                      <td>
                        <div style={{display:'flex', gap:'0.25rem'}}>
                          <button className="btn-icon" style={{padding:'0.25rem', color:'var(--text-muted)'}} onClick={() => handleOpenModal(m)}><Edit2 size={14}/></button>
                          <button className="btn-icon" style={{padding:'0.25rem', color:'var(--danger)'}} onClick={() => handleDelete(m.id)}><Trash2 size={14}/></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REQUESTS LIST VIEW */}
      {activeView === 'requests' && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
          {normalizedMaintenances.filter(m => m.needsAction).length === 0 ? (
            <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <AlertTriangle size={32} style={{ margin: '0 auto 1rem auto', color: 'var(--text-muted)' }} />
              <h4>No hay solicitudes de compra o cambio registradas</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Las solicitudes se crean al registrar la ejecución de un mantenimiento y marcar la opción correspondiente.</p>
            </div>
          ) : (
            normalizedMaintenances.filter(m => m.needsAction).map(r => {
              let statusColor = 'var(--warning)';
              if (r.actionStatus === 'Cerrado') statusColor = 'var(--success)';
              else if (r.actionStatus === 'En Proceso') statusColor = 'var(--info)';

              return (
                <div key={r.id} className="card" style={{ padding: '1.25rem', borderLeft: `4px solid ${statusColor}`, marginBottom: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      <span className="badge badge-info" style={{ fontWeight: 600 }}>{r.actionArea}</span>
                      <span className="badge badge-danger" style={{ fontWeight: 600 }}>{r.actionType}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Estado Solicitud:</span>
                      <select 
                        className="form-control" 
                        style={{ width: 'auto', padding: '0.2rem 0.5rem', fontSize: '0.75rem', height: 'auto', display: 'inline-block' }} 
                        value={r.actionStatus} 
                        onChange={(e) => handleUpdateActionStatus(r.id, e.target.value)}
                      >
                        <option value="Pendiente">Pendiente</option>
                        <option value="En Proceso">En Proceso</option>
                        <option value="Cerrado">Cerrado</option>
                      </select>
                    </div>
                  </div>
                  <h4 style={{ margin: '0.25rem 0', fontSize: '1rem', fontWeight: 700 }}>{r.equipment}</h4>
                  <p style={{ margin: '0.25rem 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Mantenimiento: <strong>{r.category}</strong> | Programado: <strong>{r.date}</strong> | Ejecutado: <strong>{r.execDate || 'No ejecutado aún'}</strong> | Responsable: <strong>{r.responsible}</strong>
                  </p>
                  <div style={{ background: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: '6px', marginTop: '0.75rem', fontSize: '0.82rem', border: '1px solid var(--border-color)', lineHeight: 1.4 }}>
                    <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.25rem' }}>Detalle de la Falla y Requerimiento:</strong>
                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{r.actionDetail || 'Sin detalles especificados.'}</p>
                  </div>
                  {r.evidence && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <strong>Observaciones del Mantenimiento:</strong> {r.evidence}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* REGISTRATION MODAL */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingItem ? "Editar Mantenimiento" : "Programar Mantenimiento"}
      >
        <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Proyecto</label>
              <select 
                className="form-control" 
                value={formData.project || ''} 
                onChange={e => setFormData({ ...formData, project: e.target.value })} 
                required 
              >
                <option value="">Seleccione proyecto...</option>
                {projectOptions.map((p, idx) => (
                  <option key={idx} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Ciudad / Ubicación</label>
              <select 
                className="form-control" 
                value={formData.city || ''} 
                onChange={e => setFormData({ ...formData, city: e.target.value })} 
                required 
              >
                <option value="">Seleccione ciudad...</option>
                {cityOptions.map((c, idx) => (
                  <option key={idx} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Cliente / Razón Social</label>
              <select 
                className="form-control" 
                value={formData.client || ''} 
                onChange={e => setFormData({ ...formData, client: e.target.value })} 
                required 
              >
                <option value="">Seleccione cliente...</option>
                {clientOptions.map((c, idx) => (
                  <option key={idx} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Categoría de Mantenimiento</label>
            <select className="form-control" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required>
              {categoriesList.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Equipo / Área</label>
            <input type="text" className="form-control" value={formData.equipment} onChange={e => setFormData({...formData, equipment: e.target.value})} required placeholder="Ej: Aire Acondicionado Oficinas Centrales..." />
          </div>
          <div style={{display:'flex', gap:'1rem'}}>
            <div className="form-group" style={{flex:1}}>
              <label className="form-label">Fecha Programada</label>
              <input type="date" className="form-control" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
            </div>
            <div className="form-group" style={{flex:1}}>
              <label className="form-label">Líder Responsable</label>
              <select className="form-control" value={formData.responsible} onChange={e => setFormData({...formData, responsible: e.target.value})} required>
                <option value="">Seleccione Usuario...</option>
                {APP_USERS.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
              </select>
            </div>
          </div>
          
          <div style={{borderTop:'1px solid var(--border-color)', paddingTop:'1rem', marginTop:'0.5rem'}}>
            <h4 style={{fontSize:'0.9rem', marginBottom:'0.75rem', fontWeight: 700, color: 'var(--accent-primary)'}}>Ejecución y Cierre</h4>
            
            <div style={{display:'flex', gap:'1rem'}}>
              <div className="form-group" style={{flex:1}}>
                <label className="form-label">Estado de Cierre</label>
                <select className="form-control" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} required>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Realizado">Realizado</option>
                  <option value="Vencido">Vencido</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>
              <div className="form-group" style={{flex:1}}>
                <label className="form-label">Fecha de Ejecución Real</label>
                <input type="date" className="form-control" value={formData.execDate} onChange={e => setFormData({...formData, execDate: e.target.value})} />
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Observaciones y Reporte de Ejecución</label>
              <textarea className="form-control" value={formData.evidence} onChange={e => setFormData({...formData, evidence: e.target.value})} rows="2" placeholder="Describa el trabajo realizado, repuestos utilizados u observaciones técnicas..."></textarea>
            </div>

            <div className="form-group" style={{ marginTop: '0.75rem' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={formData.needsAction || false} 
                  onChange={e => setFormData({ ...formData, needsAction: e.target.checked })} 
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>¿Reportar requerimiento de Compra o Cambio de Equipo?</span>
              </label>
            </div>

            {formData.needsAction && (
              <div className="fade-in" style={{ background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div className="form-group" style={{ flex: 1, margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Tipo de Requerimiento</label>
                    <select 
                      className="form-control" 
                      style={{ fontSize: '0.78rem' }}
                      value={formData.actionType || 'Reemplazo de Equipo'} 
                      onChange={e => setFormData({ ...formData, actionType: e.target.value })}
                    >
                      <option value="Reemplazo de Equipo">Reemplazo de Equipo</option>
                      <option value="Compra de Repuesto">Compra de Repuesto</option>
                      <option value="Servicio Técnico Especializado">Servicio Técnico Especializado</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ flex: 1, margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Área / Departamento Destino</label>
                    <select 
                      className="form-control" 
                      style={{ fontSize: '0.78rem' }}
                      value={formData.actionArea || 'Compras y Logística'} 
                      onChange={e => setFormData({ ...formData, actionArea: e.target.value })}
                    >
                      <option value="Compras y Logística">Compras y Logística</option>
                      <option value="Servicios Generales">Servicios Generales</option>
                      <option value="Tecnología / TI">Tecnología / TI</option>
                      <option value="Infraestructura">Infraestructura</option>
                    </select>
                  </div>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Detalle de la Falla / Solicitud</label>
                  <textarea 
                    className="form-control" 
                    rows="2" 
                    style={{ fontSize: '0.78rem' }}
                    value={formData.actionDetail || ''} 
                    onChange={e => setFormData({ ...formData, actionDetail: e.target.value })} 
                    placeholder="Describa qué se dañó y qué requiere el área encargada (ej. Aire acondicionado Piso 2 tiene el motor dañado y requiere cambio total)..."
                    required={formData.needsAction}
                  ></textarea>
                </div>
              </div>
            )}
            
            <div className="form-group">
              <label className="form-label">Subir Informe de Ejecución / Soporte Técnico</label>
              <div style={{display:'flex', alignItems:'center', gap:'0.5rem', background:'var(--bg-secondary)', padding:'0.75rem', borderRadius:'var(--radius-md)', border:'1px dashed var(--border-color)', justifyContent: 'center', cursor: 'pointer'}} onClick={() => document.getElementById('file-upload-maint').click()}>
                <input 
                  type="file" 
                  id="file-upload-maint" 
                  style={{display:'none'}} 
                  accept=".doc,.docx,.xls,.xlsx,.pdf,image/*"
                  onChange={handleFileChange}
                />
                <UploadCloud size={20} style={{ color: 'var(--text-muted)' }} />
                <span style={{fontSize:'0.78rem', color: formData.attachedFile ? 'var(--success)' : 'var(--text-secondary)', fontWeight: 600}}>
                  {formData.attachedFile ? `✓ ${formData.attachedFile}` : 'Seleccione archivo de soporte de ejecución'}
                </span>
              </div>
            </div>
          </div>

          <div style={{display:'flex', justifyContent:'flex-end', gap:'0.5rem', marginTop:'1rem'}}>
            <button type="button" className="btn-secondary" onClick={handleCloseModal}>Cancelar</button>
            <button type="submit" className="btn-primary">{editingItem ? "Actualizar" : "Guardar"}</button>
          </div>
        </form>
      </Modal>

      <ExportModal
        isOpen={exportConfig.isOpen}
        onClose={() => setExportConfig({ ...exportConfig, isOpen: false })}
        exportType={exportConfig.exportType}
        defaultTitle={exportConfig.title}
        defaultCode={exportConfig.code}
        defaultVersion={exportConfig.version}
        defaultValidity={exportConfig.validity}
        columns={exportConfig.columns}
        data={exportConfig.data}
        history={exportConfig.history}
        contentHtml={exportConfig.contentHtml}
      />
    </>
  );
}
