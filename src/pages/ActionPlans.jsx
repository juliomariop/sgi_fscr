import React, { useState, useEffect, useMemo } from 'react';
import { Target, Plus, Download, Edit2, Trash2, CheckCircle, Clock, AlertCircle, Upload, Paperclip, AlertTriangle, X, FileText, CheckSquare, Activity } from 'lucide-react';
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

const defaultPlan = {
  source: 'Auditorías', type: 'Correctiva', desc: '', 
  methodology: '5 Por qués',
  whys: ['', '', '', '', ''],
  ishikawa: { man: '', machine: '', material: '', method: '', measurement: '', environment: '' },
  rootCause: '',
  immediateAction: '', immediateResponsible: '', immediateDate: '', immediateFollowDate: '', immediateFollowResp: '', immediateEvidence: null,
  tasks: [],
  status: 'Abierta', efficacy: '', efficacySummary: '', efficacyEvidence: null,
  project: '', city: '', client: ''
};

export default function ActionPlans() {
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

  const [plans, setPlans] = useLocalStorage('sgi_action_plans', [
    { 
      id: 'PA-001', source: 'Auditorías', type: 'Correctiva', desc: 'Falta de firmas en actas de capacitación', 
      methodology: '5 Por qués', whys: ['No se pasó el listado', 'El formato se quedó en otra sala', '', '', ''], ishikawa: {}, rootCause: 'Falta de procedimiento claro para recolección de firmas',
      immediateAction: 'Recolectar firmas faltantes', immediateResponsible: 'Jefe RRHH', immediateDate: '2026-06-01', immediateFollowDate: '2026-06-05', immediateFollowResp: 'Auditor', immediateEvidence: null,
      tasks: [{ id: 1, action: 'Actualizar procedimiento', execDate: '2026-06-15', execResp: 'Jefe RRHH', followDate: '2026-06-20', followResp: 'Auditor', evidence: null }],
      status: 'En Ejecución', efficacy: '', efficacySummary: '', efficacyEvidence: null, project: 'Eléctrico', city: 'Bogotá', client: 'Consorcio Vial del Norte'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [detailTab, setDetailTab] = useState('analysis'); // analysis, tasks, efficacy
  const [formData, setFormData] = useState(defaultPlan);

  const [exportConfig, setExportConfig] = useState({
    isOpen: false,
    exportType: 'excel',
    title: 'Matriz de Planes de Acción SGI',
    code: 'SGI-MAT-AC-001',
    version: '1.0',
    validity: new Date().toLocaleDateString(),
    columns: [],
    data: [],
    history: [],
    contentHtml: ''
  });

  // Auto-select first plan
  useEffect(() => {
    if (plans.length > 0 && !selectedPlanId) {
      setSelectedPlanId(plans[0].id);
    }
  }, [plans, selectedPlanId]);

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({ 
        ...defaultPlan, ...item, 
        whys: item.whys || ['', '', '', '', ''], 
        ishikawa: item.ishikawa || { man: '', machine: '', material: '', method: '', measurement: '', environment: '' },
        tasks: item.tasks || []
      });
    } else {
      setEditingItem(null);
      setFormData(defaultPlan);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingItem) {
      setPlans(plans.map(p => p.id === editingItem.id ? { ...formData, id: p.id } : p));
    } else {
      const newId = `PA-${String(plans.length + 1).padStart(3, '0')}`;
      setPlans([...plans, { ...formData, id: newId }]);
      setSelectedPlanId(newId);
    }
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Está seguro de eliminar este Plan de Acción?")) {
      const remaining = plans.filter(p => p.id !== id);
      setPlans(remaining);
      if (selectedPlanId === id) {
        setSelectedPlanId(remaining[0]?.id || null);
      }
    }
  };

  const handleExport = () => {
    const cols = [
      { label: 'Código Plan (ID)', key: 'id' },
      { label: 'Origen del Hallazgo', key: 'source' },
      { label: 'Descripción / Hallazgo', key: 'desc' },
      { label: 'Análisis Causa Raíz', key: 'rootCause' },
      { label: 'Tarea / Acción', key: 'taskAction' },
      { label: 'Responsable de Tarea', key: 'taskResp' },
      { label: 'Fecha Límite Tarea', key: 'taskDate' },
      { label: 'Estado del Plan', key: 'status' },
      { label: '¿Fue Eficaz?', key: 'efficacy' }
    ];

    const exportData = [];
    plans.forEach(p => {
      const isEfficacious = p.efficacy === 'Eficaz' ? 'SÍ' : p.efficacy === 'No Eficaz' ? 'NO' : 'Pendiente';
      const parsedCause = p.rootCause || 'Sin análisis de causa raíz registrado';
      
      if (p.tasks && p.tasks.length > 0) {
        p.tasks.forEach(t => {
          exportData.push({
            id: p.id,
            source: p.source,
            desc: p.desc,
            rootCause: parsedCause,
            taskAction: t.action || 'Sin descripción',
            taskResp: t.execResp || 'Sin asignar',
            taskDate: t.execDate || '-',
            status: p.status,
            efficacy: isEfficacious
          });
        });
      } else {
        exportData.push({
          id: p.id,
          source: p.source,
          desc: p.desc,
          rootCause: parsedCause,
          taskAction: 'Ninguna tarea registrada',
          taskResp: '-',
          taskDate: '-',
          status: p.status,
          efficacy: isEfficacious
        });
      }
    });

    const reportHtml = `
      <div style="font-family: system-ui, sans-serif; color: #0f172a; padding: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="margin: 0; font-size: 14px; color: #1e3a8a; font-weight: 800; text-transform: uppercase;">Matriz Consolidada de Planes de Acción SGI</h2>
          <p style="margin: 3px 0 0 0; font-size: 9.5px; color: #64748b;">Sistemas Integrados de Gestión - ISO 9001 / ISO 14001 / ISO 45001</p>
        </div>

        <div style="border: 1px solid #cbd5e1; border-radius: 8px; padding: 15px; background: #ffffff;">
          <h4 style="margin: 0 0 10px 0; font-size: 10px; color: #1e293b; text-transform: uppercase; font-weight: 800; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">Matriz de Seguimiento de Acciones Correctivas, Preventivas y de Mejora</h4>
          <table style="width: 100%; border-collapse: collapse; font-size: 8px; text-align: left;">
            <thead>
              <tr style="background: #1e3a8a; color: white;">
                 <th style="padding: 6px 4px; border: 1px solid #cbd5e1; font-weight: bold; width: 8%;">ID</th>
                 <th style="padding: 6px 4px; border: 1px solid #cbd5e1; font-weight: bold; width: 12%;">Origen</th>
                 <th style="padding: 6px 4px; border: 1px solid #cbd5e1; font-weight: bold; width: 22%;">Descripción / Hallazgo</th>
                 <th style="padding: 6px 4px; border: 1px solid #cbd5e1; font-weight: bold; width: 18%;">Análisis Causa Raíz</th>
                 <th style="padding: 6px 4px; border: 1px solid #cbd5e1; font-weight: bold; width: 20%;">Tareas / Acciones</th>
                 <th style="padding: 6px 4px; border: 1px solid #cbd5e1; font-weight: bold; width: 10%;">Estado</th>
                 <th style="padding: 6px 4px; border: 1px solid #cbd5e1; font-weight: bold; width: 10%;">¿Eficaz?</th>
              </tr>
            </thead>
            <tbody>
              ${plans.map(p => {
                let colorStatus = '#ef4444'; // Red
                if (p.status === 'Cerrado') colorStatus = '#10b981'; // Green
                else if (p.status === 'En Ejecución') colorStatus = '#f59e0b'; // Yellow

                const isEfficacious = p.efficacy === 'Eficaz' ? 'SÍ' : p.efficacy === 'No Eficaz' ? 'NO' : 'Pendiente';
                const colorEficacia = p.efficacy === 'Eficaz' ? '#10b981' : p.efficacy === 'No Eficaz' ? '#ef4444' : '#64748b';

                const tasksHtml = p.tasks && p.tasks.length > 0
                  ? p.tasks.map(t => `<div style="margin-bottom: 4px; padding-bottom: 4px; border-bottom: 1px dashed #e2e8f0;">- ${t.action || 'Sin descripción'} <span style="font-size: 7px; color: #64748b;">(${t.execResp || 'Sin asignar'} - ${t.execDate || '-'})</span></div>`).join('')
                  : '<span style="color: #94a3b8; font-style: italic;">Ninguna tarea programada</span>';

                return `
                  <tr>
                    <td style="padding: 5px 4px; border: 1px solid #cbd5e1; font-weight: bold;">${p.id}</td>
                    <td style="padding: 5px 4px; border: 1px solid #cbd5e1;">${p.source}</td>
                    <td style="padding: 5px 4px; border: 1px solid #cbd5e1; font-style: italic;">"${p.desc}"</td>
                    <td style="padding: 5px 4px; border: 1px solid #cbd5e1;">${p.rootCause || 'Sin análisis registrado'}</td>
                    <td style="padding: 5px 4px; border: 1px solid #cbd5e1;">${tasksHtml}</td>
                    <td style="padding: 5px 4px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; color: ${colorStatus};">${p.status}</td>
                    <td style="padding: 5px 4px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; color: ${colorEficacia};">${isEfficacious}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    setExportConfig({
      isOpen: true,
      exportType: 'excel',
      title: 'Matriz de Planes de Acción SGI',
      code: 'SGI-MAT-AC-001',
      version: '1.0',
      validity: new Date().toLocaleDateString(),
      columns: cols,
      data: exportData,
      history: [
        { date: new Date().toISOString().split('T')[0], version: '1.0', description: 'Emisión inicial y consolidación de matriz de planes de acción correctivos y preventivos', author: 'Líder HSEQ' }
      ],
      contentHtml: reportHtml
    });
  };

  const handleFileChange = (field, e) => {
    const file = e.target.files[0];
    if (file) setFormData({ ...formData, [field]: file.name });
  };

  const addTask = () => {
    setFormData({
      ...formData,
      tasks: [...formData.tasks, { id: Date.now(), action: '', execDate: '', execResp: '', followDate: '', followResp: '', evidence: null }]
    });
  };

  const updateTask = (id, field, value) => {
    setFormData({
      ...formData,
      tasks: formData.tasks.map(t => t.id === id ? { ...t, [field]: value } : t)
    });
  };

  const removeTask = (id) => {
    setFormData({
      ...formData,
      tasks: formData.tasks.filter(t => t.id !== id)
    });
  };

  const handleTaskFileChange = (id, e) => {
    const file = e.target.files[0];
    if (file) {
      updateTask(id, 'evidence', file.name);
    }
  };

  const abiertas = plans.filter(p => p.status === 'Abierta').length;
  const enEjecucion = plans.filter(p => p.status === 'En Ejecución').length;
  const cerradas = plans.filter(p => p.status === 'Cerrado').length;
  const total = plans.length;

  const selectedPlan = plans.find(p => p.id === selectedPlanId);

  return (
    <>
      <style>{`
        .plan-row {
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        .plan-row:hover {
          background-color: var(--bg-secondary) !important;
        }
        .plan-row.active {
          background-color: var(--bg-tertiary) !important;
          border-left: 3px solid var(--accent-primary) !important;
        }
      `}</style>

      <div style={{display:'flex', justifyContent:'space-between', marginBottom:'1.5rem', alignItems:'center', flexWrap:'wrap', gap:'1rem'}}>
        <div>
          <p style={{color:'var(--text-secondary)', marginBottom:'0.25rem'}}>Gestión de Planes de Acción y Mejora Continua</p>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>Planes de Acción</h2>
        </div>
        <div style={{display:'flex', gap:'0.5rem', flexWrap:'wrap'}}>
          <button className="btn-secondary" onClick={handleExport}><Download size={16}/> Exportar Datos</button>
          <button className="btn-primary" onClick={() => handleOpenModal()}><Plus size={16}/> Nuevo Plan de Acción</button>
        </div>
      </div>

      <div className="grid-3" style={{marginBottom:'1.5rem'}}>
        <div className="card stat-card">
          <div className="stat-icon" style={{background:'rgba(239, 68, 68, 0.1)', color:'var(--danger)'}}>
            <AlertCircle size={24}/>
          </div>
          <div className="stat-info">
            <h3>{abiertas}</h3>
            <p>Acciones Abiertas</p>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{background:'rgba(245, 158, 11, 0.1)', color:'var(--warning)'}}>
            <Clock size={24}/>
          </div>
          <div className="stat-info">
            <h3>{enEjecucion}</h3>
            <p>En Ejecución</p>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{background:'rgba(16, 185, 129, 0.1)', color:'var(--success)'}}>
            <CheckCircle size={24}/>
          </div>
          <div className="stat-info">
            <h3>{cerradas} / {total}</h3>
            <p>Cerradas / Total</p>
          </div>
        </div>
      </div>

      <div className="card" style={{padding:0, overflow:'hidden'}}>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>ID / Tipo</th>
                <th>Proyecto / Ubicación / Cliente</th>
                <th>Origen</th>
                <th>Descripción del Hallazgo</th>
                <th>Estado</th>
                <th>Eficacia / Soportes</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {plans.length === 0 ? (
                <tr><td colSpan="7" style={{textAlign:'center', padding:'2rem'}}>No hay planes de acción registrados.</td></tr>
              ) : plans.map(p => {
                let badgeClass = 'badge-success';
                if (p.status === 'Abierta') badgeClass = 'badge-danger';
                else if (p.status === 'En Ejecución') badgeClass = 'badge-warning';

                let efficacyColor = p.efficacy === 'Eficaz' ? 'var(--success)' : p.efficacy === 'No Eficaz' ? 'var(--danger)' : 'var(--text-muted)';

                return (
                  <tr 
                    key={p.id}
                    className={`plan-row ${p.id === selectedPlanId ? 'active' : ''}`}
                    onClick={() => setSelectedPlanId(p.id)}
                  >
                    <td>
                      <strong>{p.id}</strong>
                      <div style={{fontSize:'0.75rem', color:'var(--text-muted)'}}>{p.type}</div>
                    </td>
                    <td>
                      {p.project && <div style={{fontSize:'0.78rem', color:'var(--accent-primary)', fontWeight:600}}>Proy: {p.project}</div>}
                      {p.city && <div style={{fontSize:'0.75rem', color:'var(--text-muted)'}}>Ciudad: {p.city}</div>}
                      {p.client && <div style={{fontSize:'0.75rem', color:'var(--success)'}}>Cliente: {p.client}</div>}
                      {!p.project && !p.city && !p.client && <span style={{color:'var(--text-muted)', fontSize:'0.8rem'}}>-</span>}
                    </td>
                    <td><span style={{fontSize:'0.85rem', fontWeight:600}}>{p.source}</span></td>
                    <td style={{fontSize:'0.85rem', maxWidth:'300px'}}>{p.desc}</td>
                    <td><span className={`badge ${badgeClass}`}>{p.status}</span></td>
                    <td>
                      {p.status === 'Cerrado' ? (
                        <div style={{display:'flex', flexDirection:'column', gap:'0.25rem'}}>
                          <span style={{fontSize:'0.85rem', fontWeight:600, color: efficacyColor}}>{p.efficacy || 'Sin evaluar'}</span>
                          {p.efficacyEvidence && (
                            <span 
                              style={{fontSize:'0.75rem', color:'var(--info)', display:'flex', alignItems:'center', gap:'0.25rem', cursor:'pointer'}} 
                              title="Descargar Evidencia"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.alert(`[HSEQ] Descargando evidencia de eficacia: "${p.efficacyEvidence}"`);
                              }}
                            >
                              <Paperclip size={12}/> {p.efficacyEvidence}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>-</span>
                      )}
                    </td>
                    <td>
                      <div style={{display:'flex', gap:'0.25rem'}}>
                        <button className="btn-icon" style={{padding:'0.25rem', color:'var(--text-muted)'}} onClick={(e) => { e.stopPropagation(); handleOpenModal(p); }}><Edit2 size={14}/></button>
                        <button className="btn-icon" style={{padding:'0.25rem', color:'var(--danger)'}} onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}><Trash2 size={14}/></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SELECTED PLAN DETAIL SHEET */}
      {selectedPlan && (
        <div className="card fade-in" style={{ marginTop: '1.5rem', padding: '1.25rem', borderLeft: '4px solid var(--accent-primary)', marginBottom: '2rem' }}>
          
          {/* Ficha Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <span className="badge badge-info" style={{ marginBottom: '0.25rem', display: 'inline-block' }}><Target size={10} style={{ marginRight: '4px' }} /> Ficha de Control de Acción Correctiva</span>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>Plan {selectedPlan.id} - {selectedPlan.type}</h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Origen: <strong>{selectedPlan.source}</strong> | Estado: <span className="badge badge-success" style={{ fontSize: '0.68rem', padding: '0.05rem 0.3rem' }}>{selectedPlan.status}</span>
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button className="btn-secondary" style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem' }} onClick={() => handleOpenModal(selectedPlan)}>
                <Edit2 size={12} style={{ marginRight: '4px' }} /> Gestionar Plan
              </button>
            </div>
          </div>

          {/* Sub tab navigation */}
          <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            <button 
              className={`btn-secondary ${detailTab === 'analysis' ? 'active' : ''}`}
              style={{ border: 'none', fontSize: '0.8rem', padding: '0.3rem 0.6rem', background: detailTab === 'analysis' ? 'rgba(14, 165, 233, 0.1)' : 'transparent', color: detailTab === 'analysis' ? 'var(--accent-primary)' : 'var(--text-secondary)' }}
              onClick={() => setDetailTab('analysis')}
            >
              <Activity size={12} style={{ marginRight: '3px' }} /> Análisis y Corrección
            </button>
            <button 
              className={`btn-secondary ${detailTab === 'tasks' ? 'active' : ''}`}
              style={{ border: 'none', fontSize: '0.8rem', padding: '0.3rem 0.6rem', background: detailTab === 'tasks' ? 'rgba(16, 185, 129, 0.1)' : 'transparent', color: detailTab === 'tasks' ? 'var(--success)' : 'var(--text-secondary)' }}
              onClick={() => setDetailTab('tasks')}
            >
              <CheckSquare size={12} style={{ marginRight: '3px' }} /> Tareas del Plan ({selectedPlan.tasks?.length || 0})
            </button>
            <button 
              className={`btn-secondary ${detailTab === 'efficacy' ? 'active' : ''}`}
              style={{ border: 'none', fontSize: '0.8rem', padding: '0.3rem 0.6rem', background: detailTab === 'efficacy' ? 'rgba(245, 158, 11, 0.1)' : 'transparent', color: detailTab === 'efficacy' ? 'var(--warning)' : 'var(--text-secondary)' }}
              onClick={() => setDetailTab('efficacy')}
            >
              <FileText size={12} style={{ marginRight: '3px' }} /> Verificación de Eficacia
            </button>
          </div>

          {/* Tab 1: Analysis and Immediate Action */}
          {detailTab === 'analysis' && (
            <div className="grid-2 fade-in" style={{ gap: '1.25rem' }}>
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Análisis de Causa Raíz ({selectedPlan.methodology})</h4>
                
                {/* 5 Whys View */}
                {selectedPlan.methodology === '5 Por qués' ? (
                  <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {(selectedPlan.whys || []).filter(w => w).map((w, idx) => (
                        <div key={idx} style={{ fontSize: '0.78rem', color: 'var(--text-primary)' }}>
                          <strong>¿Por qué? {idx + 1}:</strong> {w}
                        </div>
                      ))}
                      {(selectedPlan.whys || []).filter(w => w).length === 0 && (
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No se registraron las preguntas del análisis de causas.</span>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Ishikawa View */
                  <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', marginBottom: '0.75rem' }}>
                    <div className="grid-2" style={{ gap: '0.5rem', fontSize: '0.75rem' }}>
                      {Object.entries(selectedPlan.ishikawa || {}).filter(([_, v]) => v).map(([k, v]) => {
                        const labels = { man: 'Mano de Obra', machine: 'Maquinaria', material: 'Materiales', method: 'Método', measurement: 'Medición', environment: 'Medio Ambiente' };
                        return (
                          <div key={k}>
                            <strong>{labels[k] || k}:</strong> {v}
                          </div>
                        );
                      })}
                      {Object.values(selectedPlan.ishikawa || {}).filter(v => v).length === 0 && (
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic', gridColumn: 'span 2' }}>No se registraron factores en el diagrama de espina de pescado.</span>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Root Cause Conclusion */}
                <div style={{ background: 'rgba(239, 68, 68, 0.03)', border: '1px solid rgba(239, 68, 68, 0.15)', padding: '0.75rem', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--danger)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Causa Raíz Identificada Definitiva</div>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                    {selectedPlan.rootCause || 'Sin redactar conclusión del análisis de causas.'}
                  </p>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Acción Inmediata (Corrección Rápida)</h4>
                <div style={{ background: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '0.5rem' }}>
                    {selectedPlan.immediateAction || 'No se registró acción inmediata.'}
                  </div>
                  <div className="grid-2" style={{ gap: '0.5rem', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    <div>Ejecuta: <strong>{selectedPlan.immediateResponsible || '-'}</strong></div>
                    <div>Fecha Límite: <strong>{selectedPlan.immediateDate || '-'}</strong></div>
                    <div>Verifica: <strong>{selectedPlan.immediateFollowResp || '-'}</strong></div>
                    <div>Fecha Verif: <strong>{selectedPlan.immediateFollowDate || '-'}</strong></div>
                  </div>
                  {selectedPlan.immediateEvidence && (
                    <div style={{ marginTop: '0.65rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-primary)', padding: '0.35rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '0.72rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }} title={selectedPlan.immediateEvidence}>
                        📄 {selectedPlan.immediateEvidence}
                      </span>
                      <button 
                        type="button" 
                        className="btn-secondary" 
                        style={{ padding: '0.1rem 0.35rem', fontSize: '0.68rem' }}
                        onClick={() => window.alert(`[HSEQ] Descargando evidencia acción inmediata: "${selectedPlan.immediateEvidence}"`)}
                      >
                        Descargar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Plan Tasks */}
          {detailTab === 'tasks' && (
            <div className="fade-in">
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Plan de Tareas para Mitigar la Causa Raíz</h4>
              
              <div className="table-responsive" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                <table className="table" style={{ fontSize: '0.78rem' }}>
                  <thead>
                    <tr>
                      <th>Descripción de la Tarea</th>
                      <th>Ejecutor</th>
                      <th>Fecha Ejec.</th>
                      <th>Seguimiento por</th>
                      <th>Fecha Seg.</th>
                      <th>Evidencia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(!selectedPlan.tasks || selectedPlan.tasks.length === 0) ? (
                      <tr><td colSpan="6" style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)' }}>No hay tareas agregadas en el plan de acción.</td></tr>
                    ) : (
                      selectedPlan.tasks.map(t => (
                        <tr key={t.id}>
                          <td><strong>{t.action}</strong></td>
                          <td>{t.execResp}</td>
                          <td>{t.execDate}</td>
                          <td>{t.followResp}</td>
                          <td>{t.followDate}</td>
                          <td>
                            {t.evidence ? (
                              <button 
                                type="button" 
                                className="btn-secondary" 
                                style={{ padding: '0.15rem 0.35rem', fontSize: '0.68rem', display: 'flex', alignItems: 'center', gap: '2px' }}
                                onClick={() => window.alert(`[HSEQ] Descargando evidencia de tarea: "${t.evidence}"`)}
                              >
                                <Paperclip size={10} /> Descargar
                              </button>
                            ) : (
                              <span style={{ color: 'var(--text-muted)' }}>-</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 3: Efficacy and Verification */}
          {detailTab === 'efficacy' && (
            <div className="grid-2 fade-in" style={{ gap: '1.25rem' }}>
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Evaluación de la Eficacia</h4>
                <div style={{ background: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: '6px', border: '1px solid var(--border-color)', minHeight: '90px' }}>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: selectedPlan.efficacySummary ? 'var(--text-primary)' : 'var(--text-muted)', lineHeight: '1.4' }}>
                    {selectedPlan.efficacySummary || 'Aún no se ha documentado el resumen de verificación de eficacia. Se debe evaluar una vez cerradas todas las tareas del plan.'}
                  </p>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Eficacia y Cierre del Plan</h4>
                {selectedPlan.status === 'Cerrado' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>Eficacia:</span>
                      <span className={`badge ${selectedPlan.efficacy === 'Eficaz' ? 'badge-success' : 'badge-danger'}`} style={{ fontWeight: 700 }}>
                        {selectedPlan.efficacy || 'Sin Evaluar'}
                      </span>
                    </div>
                    {selectedPlan.efficacyEvidence && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid var(--border-color)', marginTop: '0.25rem' }}>
                        <span style={{ fontSize: '0.72rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }} title={selectedPlan.efficacyEvidence}>
                          📄 {selectedPlan.efficacyEvidence}
                        </span>
                        <button 
                          type="button" 
                          className="btn-secondary" 
                          style={{ padding: '0.15rem 0.35rem', fontSize: '0.68rem' }}
                          onClick={() => window.alert(`[HSEQ] Descargando soporte de eficacia: "${selectedPlan.efficacyEvidence}"`)}
                        >
                          Descargar
                        </button>
                      </div>
                    )}

                    {selectedPlan.efficacy === 'No Eficaz' ? (
                      <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.65rem', borderRadius: '6px', display: 'flex', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--danger)', marginTop: '0.25rem', alignItems: 'flex-start' }}>
                        <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div>
                          <strong>Acción Fallida:</strong> La evaluación determinó que el plan fue "No Eficaz". Se debe levantar un plan correctivo adicional para mitigar la causa raíz.
                        </div>
                      </div>
                    ) : (
                      <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '0.65rem', borderRadius: '6px', display: 'flex', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--success)', marginTop: '0.25rem', alignItems: 'flex-start' }}>
                        <CheckCircle size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div>
                          <strong>Plan Exitoso:</strong> La acción correctiva fue eficaz para eliminar la causa raíz del hallazgo.
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '6px', border: '1px dashed var(--border-color)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    <Clock size={20} style={{ margin: '0 auto 0.4rem', color: 'var(--text-muted)' }} />
                    El plan sigue activo (`{selectedPlan.status}`). La verificación de eficacia se realiza tras el cierre de todas las acciones operativas.
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Se usa renderizado condicional simple para el Modal si se necesita más ancho, 
          pero usaremos el estándar con inline styles para acomodar todo */}
      {isModalOpen && (
        <div className="modal-overlay active">
          <div className="modal-content" style={{maxWidth: '900px', width: '95%', maxHeight: '90vh', overflowY: 'auto'}}>
            <div className="modal-header">
              <h2>{editingItem ? "Gestionar Plan de Acción" : "Crear Plan de Acción"}</h2>
              <button className="btn-icon" onClick={handleCloseModal}><X size={20}/></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
                
                {/* 1. IDENTIFICACIÓN */}
                <div style={{background:'var(--bg-secondary)', padding:'1rem', borderRadius:'var(--radius-sm)'}}>
                  <h5 style={{fontSize:'1rem', marginBottom:'1rem', color:'var(--accent-primary)', borderBottom:'1px solid var(--border-color)', paddingBottom:'0.5rem'}}>1. Identificación del Hallazgo</h5>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', marginBottom: '1rem' }}>
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

                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Origen</label>
                      <select className="form-control" value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})} required>
                        <option value="Auditorías">Auditorías</option>
                        <option value="Indicadores">Indicadores</option>
                        <option value="Riesgos">Riesgos</option>
                        <option value="PQRs">PQRs</option>
                        <option value="Incumplimiento Legal">Incumplimiento Legal</option>
                        <option value="Otros">Otros</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Tipo de Acción</label>
                      <select className="form-control" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} required>
                        <option value="Correctiva">Acción Correctiva</option>
                        <option value="Oportunidad de Mejora">Oportunidad de Mejora</option>
                      </select>
                    </div>
                    <div className="form-group" style={{gridColumn: 'span 2'}}>
                      <label className="form-label">Descripción del Hallazgo / Problema</label>
                      <textarea className="form-control" value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})} rows="2" required></textarea>
                    </div>
                  </div>
                </div>

                {/* 2. ANÁLISIS DE CAUSA RAÍZ */}
                <div style={{background:'var(--bg-secondary)', padding:'1rem', borderRadius:'var(--radius-sm)'}}>
                  <h5 style={{fontSize:'1rem', marginBottom:'1rem', color:'var(--accent-primary)', borderBottom:'1px solid var(--border-color)', paddingBottom:'0.5rem'}}>2. Análisis de Causa Raíz</h5>
                  <div className="form-group" style={{marginBottom:'1rem'}}>
                    <label className="form-label">Metodología a utilizar</label>
                    <select className="form-control" style={{maxWidth:'300px'}} value={formData.methodology} onChange={e => setFormData({...formData, methodology: e.target.value})}>
                      <option value="5 Por qués">5 Por Qués</option>
                      <option value="Ishikawa">Diagrama de Ishikawa (6 M's)</option>
                    </select>
                  </div>

                  {formData.methodology === '5 Por qués' ? (
                    <div style={{display:'flex', flexDirection:'column', gap:'0.5rem', marginBottom:'1rem'}}>
                      {[1, 2, 3, 4, 5].map((num, idx) => (
                        <div key={num} style={{display:'flex', alignItems:'center', gap:'0.5rem'}}>
                          <span style={{fontWeight:600, color:'var(--text-secondary)', width:'80px'}}>¿Por qué {num}?</span>
                          <input type="text" className="form-control" value={formData.whys[idx]} onChange={e => {
                            const newWhys = [...formData.whys];
                            newWhys[idx] = e.target.value;
                            setFormData({...formData, whys: newWhys});
                          }} placeholder={`Causa nivel ${num}`} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid-2" style={{marginBottom:'1rem'}}>
                      {['man', 'machine', 'material', 'method', 'measurement', 'environment'].map((mKey) => {
                        const labels = { man: 'Mano de Obra', machine: 'Maquinaria', material: 'Materiales', method: 'Método', measurement: 'Medición', environment: 'Medio Ambiente' };
                        return (
                          <div className="form-group" key={mKey}>
                            <label className="form-label" style={{fontSize:'0.8rem'}}>{labels[mKey]}</label>
                            <input type="text" className="form-control" value={formData.ishikawa?.[mKey] || ''} onChange={e => setFormData({...formData, ishikawa: {...formData.ishikawa, [mKey]: e.target.value}})} />
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label" style={{color:'var(--danger)'}}>Causa Raíz Identificada Definitiva</label>
                    <textarea className="form-control" value={formData.rootCause} onChange={e => setFormData({...formData, rootCause: e.target.value})} rows="2" required placeholder="Conclusión del análisis..."></textarea>
                  </div>
                </div>

                {/* 3. ACCIÓN INMEDIATA */}
                <div style={{background:'var(--bg-secondary)', padding:'1rem', borderRadius:'var(--radius-sm)'}}>
                  <h5 style={{fontSize:'1rem', marginBottom:'1rem', color:'var(--accent-primary)', borderBottom:'1px solid var(--border-color)', paddingBottom:'0.5rem'}}>3. Acción Correctiva / Inmediata (Corrección)</h5>
                  <div className="grid-2">
                    <div className="form-group" style={{gridColumn: 'span 2'}}>
                      <label className="form-label">Acción Inmediata</label>
                      <input type="text" className="form-control" value={formData.immediateAction} onChange={e => setFormData({...formData, immediateAction: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Responsable</label>
                      <select className="form-control" value={formData.immediateResponsible} onChange={e => setFormData({...formData, immediateResponsible: e.target.value})} required>
                        <option value="">Seleccione Usuario...</option>
                        {APP_USERS.map(u => <option key={u.email} value={u.name}>{u.name}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Fecha Ejecución / Cierre</label>
                      <input type="date" className="form-control" value={formData.immediateDate} onChange={e => setFormData({...formData, immediateDate: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Responsable Seguimiento</label>
                      <select className="form-control" value={formData.immediateFollowResp} onChange={e => setFormData({...formData, immediateFollowResp: e.target.value})} required>
                        <option value="">Seleccione Usuario...</option>
                        {APP_USERS.map(u => <option key={u.email} value={u.name}>{u.name}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Fecha Seguimiento</label>
                      <input type="date" className="form-control" value={formData.immediateFollowDate} onChange={e => setFormData({...formData, immediateFollowDate: e.target.value})} />
                    </div>
                    <div className="form-group" style={{gridColumn: 'span 2'}}>
                      <label className="form-label">Evidencia de Ejecución</label>
                      <div style={{display:'flex', alignItems:'center', gap:'0.5rem', background:'rgba(0,0,0,0.05)', padding:'0.5rem', borderRadius:'var(--radius-sm)'}}>
                        <input type="file" id="file-immed" style={{display:'none'}} onChange={(e) => handleFileChange('immediateEvidence', e)} />
                        <label htmlFor="file-immed" className="btn-secondary" style={{cursor:'pointer', margin:0, padding:'0.3rem 0.75rem', fontSize:'0.8rem'}}>
                          <Upload size={14} style={{marginRight:'4px'}}/> {formData.immediateEvidence ? 'Cambiar Evidencia' : 'Subir Evidencia'}
                        </label>
                        <span style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>{formData.immediateEvidence || 'Ningún archivo adjunto'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. TAREAS DEL PLAN */}
                <div style={{background:'var(--bg-secondary)', padding:'1rem', borderRadius:'var(--radius-sm)'}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid var(--border-color)', paddingBottom:'0.5rem', marginBottom:'1rem'}}>
                    <h5 style={{fontSize:'1rem', color:'var(--accent-primary)', margin:0}}>4. Plan de Acción (Para eliminar causa raíz)</h5>
                    <button type="button" className="btn-secondary" onClick={addTask} style={{padding:'0.2rem 0.5rem', fontSize:'0.8rem'}}><Plus size={14}/> Añadir Tarea</button>
                  </div>
                  
                  {formData.tasks.length === 0 ? (
                    <div style={{textAlign:'center', padding:'1rem', color:'var(--text-muted)', fontSize:'0.85rem'}}>No hay tareas agregadas. Presione "Añadir Tarea" para comenzar.</div>
                  ) : (
                    <div style={{overflowX:'auto'}}>
                      <table className="table" style={{minWidth: '800px'}}>
                        <thead>
                          <tr style={{fontSize:'0.75rem'}}>
                            <th>Acción</th>
                            <th>Resp. Ejecución</th>
                            <th>F. Ejecución</th>
                            <th>Resp. Seguimiento</th>
                            <th>F. Seguimiento</th>
                            <th>Evidencia</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {formData.tasks.map(t => (
                            <tr key={t.id}>
                              <td><input type="text" className="form-control" style={{fontSize:'0.8rem', padding:'0.25rem'}} value={t.action} onChange={e => updateTask(t.id, 'action', e.target.value)} required /></td>
                              <td>
                                <select className="form-control" style={{fontSize:'0.8rem', padding:'0.25rem'}} value={t.execResp} onChange={e => updateTask(t.id, 'execResp', e.target.value)} required>
                                  <option value="">Seleccione...</option>
                                  {APP_USERS.map(u => <option key={u.email} value={u.name}>{u.name}</option>)}
                                </select>
                              </td>
                              <td><input type="date" className="form-control" style={{fontSize:'0.8rem', padding:'0.25rem'}} value={t.execDate} onChange={e => updateTask(t.id, 'execDate', e.target.value)} required /></td>
                              <td>
                                <select className="form-control" style={{fontSize:'0.8rem', padding:'0.25rem'}} value={t.followResp} onChange={e => updateTask(t.id, 'followResp', e.target.value)} required>
                                  <option value="">Seleccione...</option>
                                  {APP_USERS.map(u => <option key={u.email} value={u.name}>{u.name}</option>)}
                                </select>
                              </td>
                              <td><input type="date" className="form-control" style={{fontSize:'0.8rem', padding:'0.25rem'}} value={t.followDate} onChange={e => updateTask(t.id, 'followDate', e.target.value)} required /></td>
                              <td>
                                <div style={{display:'flex', alignItems:'center', gap:'0.25rem'}}>
                                  <input type="file" id={`task-file-${t.id}`} style={{display:'none'}} onChange={e => handleTaskFileChange(t.id, e)} />
                                  <label htmlFor={`task-file-${t.id}`} className="btn-secondary" style={{cursor:'pointer', padding:'0.2rem', margin:0}} title="Subir Evidencia">
                                    <Upload size={12}/>
                                  </label>
                                  <span style={{fontSize:'0.7rem', maxWidth:'80px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}} title={t.evidence}>{t.evidence || '-'}</span>
                                </div>
                              </td>
                              <td>
                                <button type="button" className="btn-icon" style={{color:'var(--danger)'}} onClick={() => removeTask(t.id)}><Trash2 size={14}/></button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* 5. SEGUIMIENTO Y EFICACIA */}
                <div style={{background:'var(--bg-secondary)', padding:'1rem', borderRadius:'var(--radius-sm)'}}>
                  <h5 style={{fontSize:'1rem', marginBottom:'1rem', color:'var(--accent-primary)', borderBottom:'1px solid var(--border-color)', paddingBottom:'0.5rem'}}>5. Verificación de Eficacia y Cierre</h5>
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Estado del Plan</label>
                      <select className="form-control" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} required>
                        <option value="Abierta">Abierta</option>
                        <option value="En Ejecución">En Ejecución</option>
                        <option value="Cerrado">Cerrado</option>
                      </select>
                    </div>
                    {formData.status === 'Cerrado' && (
                      <div className="form-group">
                        <label className="form-label">Resultado de Eficacia</label>
                        <select className="form-control" value={formData.efficacy} onChange={e => setFormData({...formData, efficacy: e.target.value})} required>
                          <option value="">Seleccione...</option>
                          <option value="Eficaz">Eficaz</option>
                          <option value="No Eficaz">No Eficaz</option>
                        </select>
                      </div>
                    )}
                    {formData.status === 'Cerrado' && (
                      <>
                        <div className="form-group" style={{gridColumn: 'span 2'}}>
                          <label className="form-label">Resumen de Verificación de Eficacia (Por qué fue o no eficaz)</label>
                          <textarea className="form-control" value={formData.efficacySummary} onChange={e => setFormData({...formData, efficacySummary: e.target.value})} rows="3" required></textarea>
                        </div>
                        <div className="form-group" style={{gridColumn: 'span 2'}}>
                          <label className="form-label">Evidencia de Verificación de Eficacia</label>
                          <div style={{display:'flex', alignItems:'center', gap:'0.5rem', background:'rgba(0,0,0,0.05)', padding:'0.5rem', borderRadius:'var(--radius-sm)'}}>
                            <input type="file" id="file-eff" style={{display:'none'}} onChange={(e) => handleFileChange('efficacyEvidence', e)} />
                            <label htmlFor="file-eff" className="btn-secondary" style={{cursor:'pointer', margin:0, padding:'0.3rem 0.75rem', fontSize:'0.8rem'}}>
                              <Upload size={14} style={{marginRight:'4px'}}/> {formData.efficacyEvidence ? 'Cambiar Evidencia' : 'Subir Evidencia'}
                            </label>
                            <span style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>{formData.efficacyEvidence || 'Ningún archivo adjunto'}</span>
                          </div>
                        </div>
                        {formData.efficacy === 'No Eficaz' && (
                          <div style={{gridColumn: 'span 2', background:'rgba(239, 68, 68, 0.05)', padding:'0.75rem', borderRadius:'var(--radius-sm)', border:'1px solid var(--danger)', marginTop:'0.5rem', fontSize:'0.85rem', color:'var(--danger)', display:'flex', gap:'0.5rem'}}>
                            <AlertTriangle size={16} style={{flexShrink:0}}/>
                            <div><strong>Alerta:</strong> La acción fue evaluada como "No Eficaz". Se debe levantar un nuevo plan de acción para atacar la causa raíz correctamente.</div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div style={{display:'flex', justifyContent:'flex-end', gap:'0.5rem', marginTop:'1rem'}}>
                  <button type="button" className="btn-secondary" onClick={handleCloseModal}>Cancelar</button>
                  <button type="submit" className="btn-primary">{editingItem ? "Actualizar Plan" : "Guardar Plan"}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

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
