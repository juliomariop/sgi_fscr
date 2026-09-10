import React, { useState, useEffect } from 'react';
import { 
  Clock, Download, Target, Plus, Edit2, Trash2, Shield, UserCheck, 
  AlertCircle, RefreshCw, Eye, Search, Layers, Activity, HelpCircle,
  Users, CheckCircle2, Calendar, ClipboardList
} from 'lucide-react';
import Modal from '../components/Modal';
import { downloadCSV } from '../utils/exportUtils';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAppUsers } from '../hooks/useAppUsers';

export default function Stakeholders() {
  const APP_USERS = useAppUsers();

  const initialStakeholders = [
    { 
      id: 1, 
      name: 'Clientes de la Organización', 
      type: 'Externo', 
      needs: 'Servicios HSEQ estables, productos sin defectos y entregas justo a tiempo.', 
      legalReqs: 'Estatuto del Consumidor, acuerdos contractuales comerciales de nivel de servicio (SLA).', 
      power: 'Alto', 
      interest: 'Alto', 
      strategy: 'Gestionar de cerca (Asociación estratégica y comunicación continua)', 
      responsible: APP_USERS[0]?.name || 'Dir. Comercial', 
      evidence: 'Encuestas de CSAT trimestrales e informes de PQR',
      activities: [
        { id: 101, description: 'Realizar encuesta de satisfacción del cliente Q2', dueDate: '2026-06-15', status: 'En Proceso', responsible: APP_USERS[0]?.name || 'Dir. Comercial' },
        { id: 102, description: 'Revisión y respuesta a quejas y reclamos (PQRs) del mes', dueDate: '2026-06-30', status: 'Pendiente', responsible: APP_USERS[0]?.name || 'Dir. Comercial' },
        { id: 103, description: 'Renovación de contratos de SLA con cláusulas de calidad', dueDate: '2026-07-15', status: 'Completado', responsible: APP_USERS[0]?.name || 'Dir. Comercial' }
      ]
    },
    { 
      id: 2, 
      name: 'Colaboradores y Personal Interno', 
      type: 'Interno', 
      needs: 'Ambiente de trabajo seguro (cero accidentes), capacitaciones, estabilidad laboral y compensación justa.', 
      legalReqs: 'Código Sustantivo del Trabajo, Resoluciones del SG-SST (MinTrabajo).', 
      power: 'Medio', 
      interest: 'Alto', 
      strategy: 'Mantener informados (Comités paritarios y retroalimentación fluida)', 
      responsible: APP_USERS[1]?.name || 'Gestión Humana', 
      evidence: 'Actas del COPASST e informes de Clima Organizacional',
      activities: [
        { id: 201, description: 'Capacitación en inducción de Seguridad y Salud en el Trabajo', dueDate: '2026-06-10', status: 'Completado', responsible: APP_USERS[1]?.name || 'Gestión Humana' },
        { id: 202, description: 'Realización de exámenes médicos ocupacionales periódicos', dueDate: '2026-07-05', status: 'En Proceso', responsible: APP_USERS[1]?.name || 'Gestión Humana' },
        { id: 203, description: 'Elección de nuevos representantes para el COPASST', dueDate: '2026-08-20', status: 'Pendiente', responsible: APP_USERS[1]?.name || 'Gestión Humana' }
      ]
    },
    { 
      id: 3, 
      name: 'Proveedores Críticos e Insumos', 
      type: 'Externo', 
      needs: 'Términos de pago claros, especificaciones técnicas precisas y relaciones comerciales estables.', 
      legalReqs: 'Contratos comerciales y pólizas de garantía.', 
      power: 'Medio', 
      interest: 'Medio', 
      strategy: 'Monitorear (Evaluación y reevaluación semestral)', 
      responsible: APP_USERS[2]?.name || 'Compras', 
      evidence: 'Informes de reevaluación de proveedores',
      activities: [
        { id: 301, description: 'Evaluación de desempeño HSEQ de proveedores críticos', dueDate: '2026-06-25', status: 'En Proceso', responsible: APP_USERS[2]?.name || 'Compras' },
        { id: 302, description: 'Auditoría de cumplimiento de SST en instalaciones del proveedor principal', dueDate: '2026-09-10', status: 'Pendiente', responsible: APP_USERS[0]?.name || 'HSEQ' }
      ]
    }
  ];

  const [stakeholders, setStakeholders] = useLocalStorage('sgi_stakeholders', initialStakeholders);

  const [meta, setMeta] = useState({
    version: 'V.04',
    validity: '2026-12-31',
    lastUpdated: '2026-06-04'
  });

  // Ensure every stakeholder has activities key
  const normalizedStakeholders = stakeholders.map(s => ({
    ...s,
    activities: s.activities || []
  }));

  const [activeView, setActiveView] = useState('matrix'); // matrix, table
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const [newActivityForm, setNewActivityForm] = useState({
    description: '',
    dueDate: '',
    responsible: ''
  });
  
  const [formData, setFormData] = useState({
    name: '', type: 'Externo', needs: '', legalReqs: '', power: 'Alto', interest: 'Alto', strategy: '', responsible: '', evidence: ''
  });

  // Auto-select first stakeholder if none is selected
  useEffect(() => {
    if (normalizedStakeholders.length > 0 && !selectedId) {
      setSelectedId(normalizedStakeholders[0].id);
    }
  }, [normalizedStakeholders, selectedId]);

  // Set default responsible in new activity form
  useEffect(() => {
    if (APP_USERS.length > 0 && !newActivityForm.responsible) {
      setNewActivityForm(prev => ({ ...prev, responsible: APP_USERS[0].name }));
    }
  }, [APP_USERS, newActivityForm.responsible]);

  // Automatically update suggested strategy based on selected Power and Interest values
  useEffect(() => {
    if (!editingItem) {
      let suggestedStrategy = '';
      if (formData.power === 'Alto' && formData.interest === 'Alto') {
        suggestedStrategy = 'Gestionar de cerca (Asociación estratégica y comunicación continua)';
      } else if (formData.power === 'Alto' && (formData.interest === 'Medio' || formData.interest === 'Bajo')) {
        suggestedStrategy = 'Mantener satisfechos (Alinear expectativas y consultas previas)';
      } else if ((formData.power === 'Medio' || formData.power === 'Bajo') && formData.interest === 'Alto') {
        suggestedStrategy = 'Mantener informados (Boletines, comités y participación en SST)';
      } else {
        suggestedStrategy = 'Monitorear (Control administrativo de rutina y evaluaciones periódicas)';
      }
      setFormData(prev => ({ ...prev, strategy: suggestedStrategy }));
    }
  }, [formData.power, formData.interest, editingItem]);

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        type: 'Externo',
        needs: '',
        legalReqs: '',
        power: 'Alto',
        interest: 'Alto',
        strategy: 'Gestionar de cerca (Asociación estratégica y comunicación continua)',
        responsible: APP_USERS[0]?.name || '',
        evidence: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingItem) {
      setStakeholders(stakeholders.map(i => i.id === editingItem.id ? { ...formData, id: i.id, activities: editingItem.activities || [] } : i));
    } else {
      const newStakeholder = { ...formData, id: Date.now(), activities: [] };
      setStakeholders([...stakeholders, newStakeholder]);
      setSelectedId(newStakeholder.id);
    }
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Está seguro de eliminar esta parte interesada?")) {
      const updated = stakeholders.filter(i => i.id !== id);
      setStakeholders(updated);
      if (selectedId === id) {
        setSelectedId(updated[0]?.id || null);
      }
    }
  };

  // Activity Handlers
  const handleAddActivity = (e, stakeholderId) => {
    e.preventDefault();
    if (!newActivityForm.description || !newActivityForm.dueDate || !newActivityForm.responsible) return;

    const newActivity = {
      id: Date.now(),
      description: newActivityForm.description,
      dueDate: newActivityForm.dueDate,
      status: 'Pendiente',
      responsible: newActivityForm.responsible
    };

    setStakeholders(prev => prev.map(s => {
      if (s.id === stakeholderId) {
        return {
          ...s,
          activities: [...(s.activities || []), newActivity]
        };
      }
      return s;
    }));

    setNewActivityForm(prev => ({
      ...prev,
      description: '',
      dueDate: ''
    }));
  };

  const handleUpdateActivityStatus = (stakeholderId, activityId, newStatus) => {
    setStakeholders(prev => prev.map(s => {
      if (s.id === stakeholderId) {
        const updated = (s.activities || []).map(a => 
          a.id === activityId ? { ...a, status: newStatus } : a
        );
        return { ...s, activities: updated };
      }
      return s;
    }));
  };

  const handleDeleteActivity = (stakeholderId, activityId) => {
    if (window.confirm("¿Está seguro de eliminar esta actividad de seguimiento?")) {
      setStakeholders(prev => prev.map(s => {
        if (s.id === stakeholderId) {
          const updated = (s.activities || []).filter(a => a.id !== activityId);
          return { ...s, activities: updated };
        }
        return s;
      }));
    }
  };

  const handleExport = () => downloadCSV(normalizedStakeholders, "Partes_Interesadas_HSEQ");

  // Filtering
  const filteredStakeholders = normalizedStakeholders.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.needs.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.strategy.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Quadrants segregation
  const getQuadrant = (item) => {
    const p = item.power;
    const i = item.interest;
    
    if (p === 'Alto' && i === 'Alto') return 'closely';
    if (p === 'Alto') return 'satisfied';
    if (i === 'Alto') return 'informed';
    return 'monitor';
  };

  const closely = filteredStakeholders.filter(s => getQuadrant(s) === 'closely');
  const satisfied = filteredStakeholders.filter(s => getQuadrant(s) === 'satisfied');
  const informed = filteredStakeholders.filter(s => getQuadrant(s) === 'informed');
  const monitor = filteredStakeholders.filter(s => getQuadrant(s) === 'monitor');

  // Stats
  const totalCount = stakeholders.length;
  const criticalCount = stakeholders.filter(s => s.power === 'Alto' && s.interest === 'Alto').length;
  const externalCount = stakeholders.filter(s => s.type === 'Externo').length;
  const internalCount = stakeholders.filter(s => s.type === 'Interno').length;

  const selectedStakeholder = normalizedStakeholders.find(s => s.id === selectedId);

  // Render a stakeholder card in the quadrant grid
  const renderStakeholderChip = (item) => {
    const isActive = item.id === selectedId;
    const completedActivities = item.activities.filter(a => a.status === 'Completado').length;
    const totalActivities = item.activities.length;
    
    return (
      <div 
        key={item.id} 
        className={`sh-card ${isActive ? 'active' : ''}`}
        onClick={() => setSelectedId(item.id)}
      >
        <div className="sh-card-header">
          <div className="sh-card-name">{item.name}</div>
          <span className={`badge ${item.type === 'Interno' ? 'badge-success' : 'badge-info'}`} style={{ fontSize: '0.62rem', padding: '0.1rem 0.3rem' }}>
            {item.type}
          </span>
        </div>
        <div className="sh-card-meta">
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
            Resp: <strong>{item.responsible.split(' ')[0] || item.responsible}</strong>
          </span>
          <span style={{ 
            fontSize: '0.68rem', 
            fontWeight: 600, 
            color: totalActivities === 0 ? 'var(--text-muted)' : (completedActivities === totalActivities ? 'var(--success)' : 'var(--accent-primary)'),
            display: 'flex',
            alignItems: 'center',
            gap: '2px'
          }}>
            <Activity size={10} /> {completedActivities}/{totalActivities} act.
          </span>
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{`
        /* Dynamic Matrix Grid Layout Styling */
        .matrix-wrapper {
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          box-shadow: var(--shadow-sm);
        }

        .matrix-grid-layout {
          display: grid;
          grid-template-columns: 45px 1fr 1fr;
          grid-template-rows: 250px 250px auto;
          gap: 1rem;
        }

        .quadrant-box {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 1rem;
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
          transition: all 0.25s ease;
          position: relative;
        }

        .quadrant-box:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .quadrant-title-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.4rem;
          padding-bottom: 0.4rem;
          border-bottom: 1px dashed var(--border-color);
        }

        .quadrant-title-text {
          font-weight: 700;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .quadrant-badge-count {
          font-size: 0.68rem;
          padding: 0.15rem 0.35rem;
        }

        .quadrant-subtitle {
          font-size: 0.7rem;
          color: var(--text-muted);
          margin-bottom: 0.6rem;
          line-height: 1.35;
          font-style: italic;
        }

        .quadrant-chips-container {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
          overflow-y: auto;
          flex: 1;
          padding-right: 2px;
        }

        /* Stakeholder chip */
        .sh-card {
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 0.6rem 0.75rem;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }

        .sh-card:hover {
          border-color: var(--accent-primary);
          transform: translateX(2px);
          background: var(--bg-secondary);
        }

        .sh-card.active {
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.2);
          background: var(--bg-tertiary);
        }

        .sh-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 0.5rem;
        }

        .sh-card-name {
          font-weight: 600;
          font-size: 0.82rem;
          color: var(--text-primary);
          line-height: 1.3;
        }

        .sh-card-meta {
          font-size: 0.7rem;
          color: var(--text-secondary);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .quad-closely {
          border-top: 4px solid var(--danger);
          background: linear-gradient(180deg, rgba(239, 68, 68, 0.03) 0%, rgba(239, 68, 68, 0.005) 100%);
        }
        .quad-closely .quadrant-title-text { color: var(--danger); }

        .quad-satisfied {
          border-top: 4px solid var(--accent-primary);
          background: linear-gradient(180deg, rgba(14, 165, 233, 0.03) 0%, rgba(14, 165, 233, 0.005) 100%);
        }
        .quad-satisfied .quadrant-title-text { color: var(--accent-primary); }

        .quad-informed {
          border-top: 4px solid var(--warning);
          background: linear-gradient(180deg, rgba(245, 158, 11, 0.03) 0%, rgba(245, 158, 11, 0.005) 100%);
        }
        .quad-informed .quadrant-title-text { color: var(--warning); }

        .quad-monitor {
          border-top: 4px solid var(--text-muted);
          background: linear-gradient(180deg, rgba(148, 163, 184, 0.03) 0%, rgba(148, 163, 184, 0.005) 100%);
        }
        .quad-monitor .quadrant-title-text { color: var(--text-secondary); }

      `}</style>

      {/* Page Header */}
      <div style={{display:'flex', justifyContent:'space-between', marginBottom:'1.5rem', alignItems:'center', flexWrap:'wrap', gap:'1rem'}}>
        <div>
          <p style={{color:'var(--text-secondary)', marginBottom:'0.25rem'}}>Análisis y Requisitos del Cliente y Partes Interesadas (Cl. 4.2)</p>
          <div style={{display:'flex', gap:'0.5rem', alignItems:'center'}}>
            <span className="badge badge-info"><Clock size={12} style={{marginRight:'4px'}}/> Última actualización: {meta.lastUpdated}</span>
            <span style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>| <strong>Versión:</strong> {meta.version}</span>
            <span style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>| <strong>Vigencia:</strong> {meta.validity}</span>
          </div>
        </div>
        <div style={{display:'flex', gap:'0.5rem', flexWrap:'wrap'}}>
          <button className="btn-secondary" onClick={handleExport}><Download size={16}/> Descargar Matriz</button>
          <button className="btn-primary" onClick={() => handleOpenModal()}><Plus size={16}/> Registrar Parte Interesada</button>
        </div>
      </div>

      {/* KPI Cards Panel */}
      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
          <div style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', padding: '0.6rem', borderRadius: '50%', display: 'flex' }}><Shield size={20} /></div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total Registradas</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{totalCount}</div>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '0.6rem', borderRadius: '50%', display: 'flex' }}><AlertCircle size={20} /></div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Prioridad Alta (Seguimiento)</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--danger)' }}>{criticalCount}</div>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
          <div style={{ background: 'rgba(14, 165, 233, 0.1)', color: 'var(--accent-primary)', padding: '0.6rem', borderRadius: '50%', display: 'flex' }}><UserCheck size={20} /></div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Externas (Clientes/Entorno)</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-primary)' }}>{externalCount}</div>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '0.6rem', borderRadius: '50%', display: 'flex' }}><Users size={20} /></div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Internas (Empleados/Gobierno)</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--success)' }}>{internalCount}</div>
          </div>
        </div>
      </div>

      {/* Navigation and Search controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className={`btn-secondary ${activeView === 'matrix' ? 'active' : ''}`}
            style={{ border: 'none', background: activeView === 'matrix' ? 'rgba(14, 165, 233, 0.1)' : 'transparent', color: activeView === 'matrix' ? 'var(--accent-primary)' : 'var(--text-secondary)', fontWeight: 600 }}
            onClick={() => setActiveView('matrix')}
          >
            Matriz de Influencia (2x2)
          </button>
          <button 
            className={`btn-secondary ${activeView === 'table' ? 'active' : ''}`}
            style={{ border: 'none', background: activeView === 'table' ? 'rgba(16, 185, 129, 0.1)' : 'transparent', color: activeView === 'table' ? 'var(--success)' : 'var(--text-secondary)', fontWeight: 600 }}
            onClick={() => setActiveView('table')}
          >
            Listado Completo (Tabular)
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '240px' }}>
            <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}><Search size={14} /></span>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Buscar parte interesada..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.25rem', padding: '0.4rem 0.75rem 0.4rem 2.25rem', fontSize: '0.85rem' }}
            />
          </div>
        </div>
      </div>

      {/* MATRIX 2X2 DYNAMIC GRID VIEW */}
      {activeView === 'matrix' && (
        <div className="matrix-wrapper fade-in">
          <div className="matrix-grid-layout">
            
            {/* Y Axis Label (Col 1, spanning rows 1 and 2) */}
            <div style={{
              gridColumn: '1',
              gridRow: '1 / span 2',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingRight: '0.75rem',
              borderRight: '2px solid var(--border-color)',
              color: 'var(--text-secondary)',
              fontWeight: '700',
              fontSize: '0.72rem',
              letterSpacing: '0.05em',
              textTransform: 'uppercase'
            }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--danger)', fontWeight: 800 }}>ALTO ↑</span>
              <span style={{
                writingMode: 'vertical-lr',
                transform: 'rotate(180deg)',
                margin: 'auto 0',
                textAlign: 'center',
                whiteSpace: 'nowrap'
              }}>
                Influencia y Poder (Decisión)
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800 }}>BAJO ↓</span>
            </div>

            {/* Row 1, Col 2: Poder Alto, Interés Bajo -> Mantener Satisfechos */}
            <div className="quadrant-box quad-satisfied" style={{ gridColumn: '2', gridRow: '1' }}>
              <div className="quadrant-title-bar">
                <span className="quadrant-title-text"><Shield size={14} /> Mantener Satisfechos</span>
                <span className="badge badge-info quadrant-badge-count">{satisfied.length}</span>
              </div>
              <div className="quadrant-subtitle">
                Poder Alto / Interés Bajo. Cumplir requisitos legales y consultar en decisiones críticas.
              </div>
              <div className="quadrant-chips-container">
                {satisfied.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem', border: '1px dashed var(--border-color)', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ninguno en este cuadrante</div>
                ) : satisfied.map(item => renderStakeholderChip(item))}
              </div>
            </div>

            {/* Row 1, Col 3: Poder Alto, Interés Alto -> Gestionar de Cerca */}
            <div className="quadrant-box quad-closely" style={{ gridColumn: '3', gridRow: '1' }}>
              <div className="quadrant-title-bar">
                <span className="quadrant-title-text"><AlertCircle size={14} /> Gestionar de Cerca</span>
                <span className="badge badge-danger quadrant-badge-count">{closely.length}</span>
              </div>
              <div className="quadrant-subtitle">
                Poder Alto / Interés Alto. Relación y comunicación clave. Prioridad máxima de seguimiento.
              </div>
              <div className="quadrant-chips-container">
                {closely.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem', border: '1px dashed var(--border-color)', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ninguno en este cuadrante</div>
                ) : closely.map(item => renderStakeholderChip(item))}
              </div>
            </div>

            {/* Row 2, Col 2: Poder Bajo, Interés Bajo -> Monitorear */}
            <div className="quadrant-box quad-monitor" style={{ gridColumn: '2', gridRow: '2' }}>
              <div className="quadrant-title-bar">
                <span className="quadrant-title-text"><Clock size={14} /> Monitorear (Esfuerzo Mínimo)</span>
                <span className="badge badge-secondary quadrant-badge-count" style={{ background: '#64748b' }}>{monitor.length}</span>
              </div>
              <div className="quadrant-subtitle">
                Poder Bajo / Interés Bajo. Monitoreo regular sin planes adicionales a menos que cambie su estatus.
              </div>
              <div className="quadrant-chips-container">
                {monitor.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem', border: '1px dashed var(--border-color)', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ninguno en este cuadrante</div>
                ) : monitor.map(item => renderStakeholderChip(item))}
              </div>
            </div>

            {/* Row 2, Col 3: Poder Bajo, Interés Alto -> Mantener Informados */}
            <div className="quadrant-box quad-informed" style={{ gridColumn: '3', gridRow: '2' }}>
              <div className="quadrant-title-bar">
                <span className="quadrant-title-text"><Users size={14} /> Mantener Informados</span>
                <span className="badge badge-warning quadrant-badge-count">{informed.length}</span>
              </div>
              <div className="quadrant-subtitle">
                Poder Bajo / Interés Alto. Mantener canales de diálogo e informar sobre el desempeño HSEQ.
              </div>
              <div className="quadrant-chips-container">
                {informed.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem', border: '1px dashed var(--border-color)', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ninguno en este cuadrante</div>
                ) : informed.map(item => renderStakeholderChip(item))}
              </div>
            </div>

            {/* X Axis Label (Col 2-3, Row 3) */}
            <div style={{
              gridColumn: '2 / span 2',
              gridRow: '3',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '0.75rem',
              marginTop: '0.5rem',
              borderTop: '2px solid var(--border-color)',
              color: 'var(--text-secondary)',
              fontWeight: '700',
              fontSize: '0.72rem',
              letterSpacing: '0.05em',
              textTransform: 'uppercase'
            }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800 }}>← BAJO INTERÉS</span>
              <span style={{ textAlign: 'center', flex: 1 }}>Interés en el Sistema HSEQ</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--danger)', fontWeight: 800 }}>ALTO INTERÉS →</span>
            </div>

          </div>
        </div>
      )}

      {/* STAKEHOLDER DETAIL AND ACTIVITY TRACKING SHEET (Loaded under the matrix) */}
      {activeView === 'matrix' && selectedStakeholder && (
        <div className="card fade-in" style={{ padding: '1.25rem', borderLeft: '4px solid var(--accent-primary)', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <span className="badge badge-info" style={{ marginBottom: '0.25rem', display: 'inline-block' }}><ClipboardList size={10} style={{ marginRight: '4px' }} /> Ficha de Gestión y Control</span>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>{selectedStakeholder.name}</h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Estrategia del Sistema: <strong style={{ color: 'var(--accent-primary)' }}>{selectedStakeholder.strategy}</strong>
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button className="btn-secondary" style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem' }} onClick={() => handleOpenModal(selectedStakeholder)}>
                <Edit2 size={12} style={{ marginRight: '4px' }} /> Editar
              </button>
              <button className="btn-secondary" style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem', color: 'var(--danger)' }} onClick={() => handleDelete(selectedStakeholder.id)}>
                <Trash2 size={12} style={{ marginRight: '4px' }} /> Eliminar
              </button>
            </div>
          </div>

          <div className="grid-2" style={{ gap: '1.25rem' }}>
            {/* Left Column: Stakeholder Specifications */}
            <div>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.6rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Target size={14} /> Requisitos y Expectativas (ISO 9001: 4.2)
              </h4>
              <div style={{ background: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Necesidades y Expectativas</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', marginTop: '0.2rem', lineHeight: '1.35' }}>{selectedStakeholder.needs}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Requisitos Legales / Contractuales</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', marginTop: '0.2rem', lineHeight: '1.35' }}>{selectedStakeholder.legalReqs || 'No aplica o ninguno registrado.'}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.6rem', marginTop: '0.1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Líder Responsable</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.1rem' }}>{selectedStakeholder.responsible}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Evidencia de Control</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', marginTop: '0.1rem' }}>{selectedStakeholder.evidence || 'Ninguna registrada'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Activity Tracker Panel */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 700, margin: 0, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Activity size={14} /> Plan de Actividades y Seguimiento
                </h4>
                <span className="badge badge-info" style={{ fontSize: '0.68rem' }}>
                  {selectedStakeholder.activities.filter(a => a.status === 'Completado').length} / {selectedStakeholder.activities.length} Completado
                </span>
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                {/* Scrollable list of activities */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', maxHeight: '160px', overflowY: 'auto', marginBottom: '0.85rem', paddingRight: '2px' }}>
                  {selectedStakeholder.activities.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '1.25rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.78rem', border: '1px dashed var(--border-color)', borderRadius: '6px' }}>
                      No hay actividades programadas. Utilice el formulario inferior para agregar una.
                    </div>
                  ) : (
                    selectedStakeholder.activities.map(activity => (
                      <div key={activity.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.45rem 0.65rem', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', gap: '0.5rem' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: activity.status === 'Completado' ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: activity.status === 'Completado' ? 'line-through' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={activity.description}>
                            {activity.description}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '0.15rem', display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                            <span>Vence: <strong>{activity.dueDate}</strong></span>
                            <span>|</span>
                            <span>Resp: <strong>{activity.responsible}</strong></span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <select 
                            value={activity.status} 
                            onChange={(e) => handleUpdateActivityStatus(selectedStakeholder.id, activity.id, e.target.value)}
                            style={{
                              fontSize: '0.68rem',
                              padding: '0.15rem 0.35rem',
                              borderRadius: '4px',
                              border: '1px solid var(--border-color)',
                              background: activity.status === 'Completado' ? 'rgba(16, 185, 129, 0.1)' : activity.status === 'En Proceso' ? 'rgba(245, 158, 11, 0.1)' : 'var(--bg-secondary)',
                              color: activity.status === 'Completado' ? 'var(--success)' : activity.status === 'En Proceso' ? 'var(--warning)' : 'var(--text-secondary)',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            <option value="Pendiente">Pendiente</option>
                            <option value="En Proceso">En Proceso</option>
                            <option value="Completado">Completado</option>
                          </select>
                          <button 
                            className="btn-icon" 
                            style={{ padding: '0.15rem', color: 'var(--danger)' }} 
                            onClick={() => handleDeleteActivity(selectedStakeholder.id, activity.id)}
                            title="Eliminar Actividad"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Inline Fast Add Activity Form */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Nueva Actividad de Seguimiento</div>
                  <form onSubmit={(e) => handleAddActivity(e, selectedStakeholder.id)} style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <input 
                      type="text" 
                      placeholder="Describa la actividad..." 
                      className="form-control" 
                      style={{ flex: '2 1 180px', fontSize: '0.78rem', padding: '0.3rem 0.5rem' }} 
                      value={newActivityForm.description}
                      onChange={e => setNewActivityForm({ ...newActivityForm, description: e.target.value })}
                      required 
                    />
                    <input 
                      type="date" 
                      className="form-control" 
                      style={{ flex: '1 1 100px', fontSize: '0.78rem', padding: '0.3rem 0.5rem' }} 
                      value={newActivityForm.dueDate}
                      onChange={e => setNewActivityForm({ ...newActivityForm, dueDate: e.target.value })}
                      required 
                    />
                    <select 
                      className="form-control" 
                      style={{ flex: '1 1 110px', fontSize: '0.78rem', padding: '0.3rem 0.5rem' }} 
                      value={newActivityForm.responsible}
                      onChange={e => setNewActivityForm({ ...newActivityForm, responsible: e.target.value })}
                      required
                    >
                      <option value="">Líder...</option>
                      {APP_USERS.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                    </select>
                    <button type="submit" className="btn-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <Plus size={12} /> Asignar
                    </button>
                  </form>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL TABLE LIST */}
      {activeView === 'table' && (
        <div className="card fade-in" style={{padding:0, overflow:'hidden', marginBottom:'2rem'}}>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Parte Interesada</th>
                  <th>Tipo</th>
                  <th>Necesidades y Expectativas</th>
                  <th>Requisitos Legales</th>
                  <th title="Nivel de Poder/Influencia">Poder</th>
                  <th title="Nivel de Interés">Interés</th>
                  <th>Estrategia Sugerida</th>
                  <th>Líder Responsable</th>
                  <th>Evidencia</th>
                  <th>Actividades</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredStakeholders.length === 0 ? (
                  <tr><td colSpan="11" style={{textAlign:'center', padding:'2rem'}}>No hay partes interesadas registradas.</td></tr>
                ) : filteredStakeholders.map(item => {
                  const completed = item.activities.filter(a => a.status === 'Completado').length;
                  const total = item.activities.length;
                  return (
                    <tr key={item.id}>
                      <td><strong>{item.name}</strong></td>
                      <td>{item.type}</td>
                      <td style={{fontSize:'0.8rem', maxWidth:'180px'}}>{item.needs}</td>
                      <td style={{fontSize:'0.8rem', maxWidth:'180px'}}>{item.legalReqs}</td>
                      <td>
                        <span className={`badge ${item.power === 'Alto' ? 'badge-danger' : item.power === 'Medio' ? 'badge-warning' : 'badge-success'}`}>{item.power}</span>
                      </td>
                      <td>
                        <span className={`badge ${item.interest === 'Alto' ? 'badge-danger' : item.interest === 'Medio' ? 'badge-warning' : 'badge-success'}`}>{item.interest}</span>
                      </td>
                      <td style={{fontSize:'0.8rem', maxWidth:'150px'}}>{item.strategy}</td>
                      <td style={{fontSize:'0.8rem', fontWeight:600}}>{item.responsible}</td>
                      <td style={{fontSize:'0.8rem'}}>{item.evidence}</td>
                      <td>
                        <span className="badge badge-info" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <Activity size={10} /> {completed}/{total}
                        </span>
                      </td>
                      <td>
                        <div style={{display:'flex', gap:'0.25rem'}}>
                          <button className="btn-icon" style={{padding:'0.25rem', color:'var(--text-muted)'}} title="Editar" onClick={() => handleOpenModal(item)}>
                            <Edit2 size={14} />
                          </button>
                          <button className="btn-icon" style={{padding:'0.25rem', color:'var(--danger)'}} title="Eliminar" onClick={() => handleDelete(item.id)}>
                            <Trash2 size={14} />
                          </button>
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

      {/* FORM MODAL */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingItem ? "Editar Parte Interesada" : "Registrar Parte Interesada"}
      >
        <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
          <div className="form-group">
            <label className="form-label">Nombre de la Parte Interesada</label>
            <input type="text" className="form-control" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="Ej: Clientes, Empleados, Accionistas..." />
          </div>
          <div className="form-group">
            <label className="form-label">Tipo de Relación</label>
            <select className="form-control" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} required>
              <option value="Externo">Externo (Fuera de la organización)</option>
              <option value="Interno">Interno (Fuerza laboral / Gobierno interno)</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Necesidades y Expectativas (Cláusula 4.2)</label>
            <textarea className="form-control" value={formData.needs} onChange={e => setFormData({...formData, needs: e.target.value})} rows="2" required placeholder="¿Qué esperan de nosotros?"></textarea>
          </div>
          <div className="form-group">
            <label className="form-label">Requisitos Legales / Contractuales</label>
            <textarea className="form-control" value={formData.legalReqs} onChange={e => setFormData({...formData, legalReqs: e.target.value})} rows="2" placeholder="Leyes, contratos HSEQ o convenios específicos..."></textarea>
          </div>
          <div style={{display:'flex', gap:'1rem'}}>
            <div className="form-group" style={{flex:1}}>
              <label className="form-label">Nivel de Poder/Influencia</label>
              <select className="form-control" value={formData.power} onChange={e => setFormData({...formData, power: e.target.value})} required>
                <option value="Alto">Alto (Decisión o veto crítico)</option>
                <option value="Medio">Medio (Influencia moderada)</option>
                <option value="Bajo">Bajo (Sin influencia directa)</option>
              </select>
            </div>
            <div className="form-group" style={{flex:1}}>
              <label className="form-label">Nivel de Interés en HSEQ</label>
              <select className="form-control" value={formData.interest} onChange={e => setFormData({...formData, interest: e.target.value})} required>
                <option value="Alto">Alto (Altamente afectado)</option>
                <option value="Medio">Medio (Atento al desempeño)</option>
                <option value="Bajo">Bajo (Poco impacto percibido)</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Estrategia de Abordaje (Auto-sugerida)</label>
            <input type="text" className="form-control" value={formData.strategy} onChange={e => setFormData({...formData, strategy: e.target.value})} required />
          </div>
          <div style={{display:'flex', gap:'1rem'}}>
            <div className="form-group" style={{flex:1}}>
              <label className="form-label">Líder Responsable de Gestión</label>
              <select className="form-control" value={formData.responsible} onChange={e => setFormData({...formData, responsible: e.target.value})} required>
                <option value="">Seleccione Responsable...</option>
                {APP_USERS.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
              </select>
            </div>
            <div className="form-group" style={{flex:1}}>
              <label className="form-label">Evidencia de Gestión</label>
              <input type="text" className="form-control" value={formData.evidence} onChange={e => setFormData({...formData, evidence: e.target.value})} required placeholder="Ej: Minutas, encuestas..." />
            </div>
          </div>
          <div style={{display:'flex', justifyContent:'flex-end', gap:'0.5rem', marginTop:'1rem'}}>
            <button type="button" className="btn-secondary" onClick={handleCloseModal}>Cancelar</button>
            <button type="submit" className="btn-primary">{editingItem ? "Actualizar" : "Guardar"}</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
