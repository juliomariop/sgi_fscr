import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, QrCode, Filter, Eye, CheckCircle2, AlertCircle, Clock, Trash2, 
  Download, Plus, Link as LinkIcon, Smartphone, Check, X, ShieldAlert as ReportIcon, ListTodo
} from 'lucide-react';
import Modal from '../components/Modal';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { downloadCSV } from '../utils/exportUtils';
import { useNavigate } from 'react-router-dom';
import { useAppUsers } from '../hooks/useAppUsers';

export default function UnsafeReports() {
  const navigate = useNavigate();
  const [reports, setReports] = useLocalStorage('sgi_unsafe_reports', [
    {
      id: 1,
      date: '2026-06-10',
      time: '14:20',
      category: 'Condición Insegura',
      area: 'Pasillo de Despachos 03',
      description: 'Derrame de aceite lubricante en zona de tránsito de montacargas, sin señalizar ni contener.',
      consequences: 'Caída de peatones o colisión de montacargas por pérdida de tracción.',
      reporterName: 'Luis Torres',
      reporterTitle: 'Supervisor de Logística',
      reporterType: 'Empleado directo',
      photoName: 'derrame_aceite_03.jpg',
      signature: null,
      status: 'En Proceso',
      suggestedCorrectiveAction: 'Esparcir material absorbente y señalizar la zona con conos reflectivos.',
      severity: 'Alta',
      closureResponsible: 'Diego Castro',
      sigResponsible: 'Carlos Gómez',
      commitmentDate: '2026-06-15',
      closureDate: '',
      closurePhotoName: '',
      actions: [
        { id: 10, date: '2026-06-10', desc: 'Se aplicó aserrín absorbente provisional.', responsible: 'Diego Castro' }
      ]
    },
    {
      id: 2,
      date: '2026-06-11',
      time: '08:45',
      category: 'Acto Inseguro',
      area: 'Andamios Bloque C',
      description: 'Ayudante de soldador realizando labores a 3 metros de altura con el arnés desenganchado de la línea de vida.',
      consequences: 'Caída de altura con alta probabilidad de fatalidad o invalidez.',
      reporterName: 'Anónimo',
      reporterTitle: 'Contratista de Pintura',
      reporterType: 'Contratista',
      photoName: null,
      signature: null,
      status: 'Abierto',
      suggestedCorrectiveAction: 'Detener la labor, retroalimentar al trabajador y verificar puntos de anclaje antes de reanudar.',
      severity: 'Crítico',
      closureResponsible: '',
      sigResponsible: 'Carlos Gómez',
      commitmentDate: '2026-06-13',
      closureDate: '',
      closurePhotoName: '',
      actions: []
    }
  ]);

  const [actionPlans, setActionPlans] = useLocalStorage('sgi_action_plans', []);

  const users = useAppUsers();

  const getResponseTime = (report) => {
    if (!report.actions || report.actions.length === 0) return 'Sin acciones de campo aún';
    const start = new Date(report.date);
    const firstAction = report.actions.reduce((earliest, act) => {
      const actDate = new Date(act.date);
      return actDate < earliest ? actDate : earliest;
    }, new Date(report.actions[0].date));
    
    const diffTime = firstAction - start;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 ? `${diffDays} día(s)` : '0 día(s)';
  };

  const getTotalClosureTime = (report) => {
    if (!report.closureDate) return 'Pendiente de cierre';
    const start = new Date(report.date);
    const end = new Date(report.closureDate);
    const diffTime = end - start;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 ? `${diffDays} día(s)` : '0 día(s)';
  };

  const handleUpdateField = (field, value) => {
    setReports(reports.map(r => {
      if (r.id === selectedReportId) {
        return { ...r, [field]: value };
      }
      return r;
    }));
  };

  // UI state
  const [selectedReportId, setSelectedReportId] = useState(() => reports[0]?.id || null);
  const [categoryFilter, setCategoryFilter] = useState('Todos');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  
  // Action sub-form
  const [newActionText, setNewActionText] = useState('');
  const [newActionResp, setNewActionResp] = useState('');

  // Selected report memo
  const selectedReport = useMemo(() => {
    return reports.find(r => r.id === selectedReportId);
  }, [reports, selectedReportId]);

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      const matchCat = categoryFilter === 'Todos' || r.category === categoryFilter;
      const matchStat = statusFilter === 'Todos' || r.status === statusFilter;
      return matchCat && matchStat;
    });
  }, [reports, categoryFilter, statusFilter]);

  // Handle delete
  const handleDeleteReport = (id) => {
    if (window.confirm('¿Está seguro de eliminar este reporte de seguridad?')) {
      const updated = reports.filter(r => r.id !== id);
      setReports(updated);
      if (selectedReportId === id) {
        setSelectedReportId(updated[0]?.id || null);
      }
    }
  };

  // Add action log to report
  const handleAddActionLog = (e) => {
    e.preventDefault();
    if (!newActionText || !newActionResp) return;

    const newLog = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      desc: newActionText,
      responsible: newActionResp
    };

    setReports(reports.map(r => {
      if (r.id === selectedReportId) {
        return {
          ...r,
          actions: [...(r.actions || []), newLog],
          status: r.status === 'Abierto' ? 'En Proceso' : r.status
        };
      }
      return r;
    }));

    setNewActionText('');
    setNewActionResp('');
    alert('[Reportes] Acción registrada y vinculada con éxito.');
  };

  // Change report status directly
  const handleUpdateStatus = (status) => {
    setReports(reports.map(r => {
      if (r.id === selectedReportId) {
        const updated = { ...r, status };
        if (status === 'Resuelto') {
          updated.closureDate = updated.closureDate || new Date().toISOString().split('T')[0];
        } else {
          updated.closureDate = '';
        }
        return updated;
      }
      return r;
    }));
  };

  // Generate Action Plan (Corrective action plan in ActionPlans.jsx module)
  const handleGenerateActionPlan = () => {
    if (!selectedReport) return;
    
    // Check if plan already generated
    const exists = actionPlans.find(plan => plan.desc.includes(`Reporte HSEQ #${selectedReport.id}`));
    if (exists) {
      alert(`Este reporte ya cuenta con el Plan de Acción Correctivo: ${exists.id}`);
      navigate('/actionPlans');
      return;
    }

    const paId = `PA-${String(actionPlans.length + 1).padStart(3, '0')}`;
    const newPlan = {
      id: paId,
      source: 'Reportes de Actos/Condiciones',
      type: 'Correctiva',
      desc: `Reporte HSEQ #${selectedReport.id} (${selectedReport.category}) - Lugar: ${selectedReport.area}. Descripción: ${selectedReport.description}`,
      methodology: 'Investigación Rápida HSEQ',
      whys: ['', '', '', '', ''],
      rootCause: `Condición insegura no reportada oportunamente o incumplimiento de norma en ${selectedReport.area}.`,
      immediateAction: `Inspección de seguridad, subsanación física de la condición y/o retroalimentación disciplinaria al personal en sitio.`,
      immediateResponsible: 'Diego Castro (Coordinador SST)',
      immediateDate: new Date().toISOString().split('T')[0],
      immediateFollowDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      immediateFollowResp: 'Fernando Rueda (Líder HSEQ)',
      tasks: [],
      status: 'Abierta',
      efficacy: '',
      efficacySummary: '',
      efficacyEvidence: null
    };

    setActionPlans([...actionPlans, newPlan]);
    alert(`Se ha generado de forma exitosa el Plan de Acción HSEQ Correctiva ${paId}.`);
    navigate('/actionPlans');
  };

  // Copy link
  const copyPublicLink = () => {
    const link = `${window.location.origin}/reporte-publico`;
    navigator.clipboard.writeText(link);
    alert('Enlace del Formulario Público copiado al portapapeles:\n' + link);
  };

  // CSV export
  const handleExport = () => {
    downloadCSV(
      reports.map(r => ({
        ID: r.id,
        Fecha: r.date,
        Hora: r.time,
        Nombre_Reportante: r.reporterName || 'Anónimo',
        Cargo_Area_Reportante: r.reporterTitle || 'No especifica',
        Tipo_Persona: r.reporterType || 'Empleado directo',
        Clasificacion_Peligro: r.category,
        Ubicacion_Exacta: r.area,
        Descripcion_Detallada: r.description,
        Consecuencias_Esperadas: r.consequences || 'No especifica',
        Soporte_Foto: r.photoName || 'Ninguno',
        Accion_Sugerida: r.suggestedCorrectiveAction || 'Ninguno',
        Severidad: r.severity,
        Estado: r.status,
        Responsable_Cierre: r.closureResponsible || 'No asignado',
        SIG_Responsable: r.sigResponsible || 'No asignado',
        Fecha_Compromiso: r.commitmentDate || 'Sin fecha',
        Fecha_Cierre: r.closureDate || 'Sin fecha',
        Tiempo_Respuesta: getResponseTime(r),
        Tiempo_Cierre_Total: getTotalClosureTime(r),
        Evidencia_Cierre_Foto: r.closurePhotoName || 'Ninguno',
        Acciones_Tomadas: (r.actions || []).map(a => `${a.date}: ${a.desc} (${a.responsible})`).join(' | ')
      })),
      "Reporte_Actos_Condiciones_Inseguras"
    );
  };

  return (
    <>
      <style>{`
        .unsafe-row {
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        .unsafe-row:hover {
          background-color: var(--bg-secondary) !important;
        }
        .unsafe-row.active {
          background-color: var(--bg-tertiary) !important;
          border-left: 4px solid var(--accent-primary) !important;
        }
      `}</style>

      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Control Operacional HSEQ (ISO 45001 - Cláusula 8.1)</p>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert style={{ color: 'var(--warning)' }} /> Reportes de Actos y Condiciones Inseguras
          </h2>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button className="btn-secondary" onClick={handleExport}><Download size={16} /> Exportar Reportes</button>
          <button className="btn-secondary" onClick={copyPublicLink}><LinkIcon size={16} /> Copiar Enlace Público</button>
          <button className="btn-primary" onClick={() => setIsQrModalOpen(true)}><QrCode size={16} /> Generar QR de Reporte</button>
        </div>
      </div>

      {/* Filtering Row */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '0.75rem 1.5rem' }}>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={14} style={{ color: 'var(--text-secondary)' }} />
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Categoría:</label>
            <select className="form-control" style={{ padding: '0.25rem 0.5rem', width: 'auto' }} value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
              <option value="Todos">Todos</option>
              <option value="Acto Inseguro">Acto Inseguro</option>
              <option value="Condición Insegura">Condición Insegura</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Estado:</label>
            <select className="form-control" style={{ padding: '0.25rem 0.5rem', width: 'auto' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="Todos">Todos</option>
              <option value="Abierto">Abierto</option>
              <option value="En Proceso">En Proceso</option>
              <option value="Resuelto">Resuelto</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary KPI row */}
      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        <div className="card" style={{ borderLeft: '4px solid var(--accent-primary)', marginBottom: 0 }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Reportes Totales</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.25rem' }}>{reports.length}</div>
        </div>
        <div className="card" style={{ borderLeft: '4px solid var(--danger)', marginBottom: 0 }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Abiertos (Sin atender)</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--danger)', marginTop: '0.25rem' }}>{reports.filter(r => r.status === 'Abierto').length}</div>
        </div>
        <div className="card" style={{ borderLeft: '4px solid var(--warning)', marginBottom: 0 }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>En Seguimiento / Proceso</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--warning)', marginTop: '0.25rem' }}>{reports.filter(r => r.status === 'En Proceso').length}</div>
        </div>
        <div className="card" style={{ borderLeft: '4px solid var(--success)', marginBottom: 0 }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Resueltos / Cerrados</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--success)', marginTop: '0.25rem' }}>{reports.filter(r => r.status === 'Resuelto').length}</div>
        </div>
      </div>

      {/* Main split grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1.5rem', alignItems: 'start', marginBottom: '2rem' }}>
        
        {/* Left Column: Table List */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Fecha y Lugar</th>
                  <th>Categoría</th>
                  <th>Severidad</th>
                  <th>Estado</th>
                  <th>Eliminar</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.length === 0 ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No hay reportes de incidentes.</td></tr>
                ) : filteredReports.map(r => {
                  let badgeCat = r.category === 'Acto Inseguro' ? 'badge-danger' : 'badge-warning';
                  let badgeSev = r.severity === 'Alta' ? 'badge-danger' : r.severity === 'Media' ? 'badge-warning' : 'badge-success';
                  let badgeStat = r.status === 'Resuelto' ? 'badge-success' : r.status === 'En Proceso' ? 'badge-warning' : 'badge-danger';
                  
                  return (
                    <tr 
                      key={r.id}
                      className={`unsafe-row ${r.id === selectedReportId ? 'active' : ''}`}
                      onClick={() => setSelectedReportId(r.id)}
                    >
                      <td>
                        <strong>{r.date}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{r.area}</div>
                      </td>
                      <td><span className={`badge ${badgeCat}`} style={{ fontSize: '0.7rem' }}>{r.category}</span></td>
                      <td><span className={`badge ${badgeSev}`} style={{ fontSize: '0.7rem' }}>{r.severity}</span></td>
                      <td><span className={`badge ${badgeStat}`}>{r.status}</span></td>
                      <td>
                        <button 
                          className="btn-icon" 
                          style={{ color: 'var(--danger)', padding: '0.25rem' }} 
                          onClick={(e) => { e.stopPropagation(); handleDeleteReport(r.id); }}
                          title="Eliminar Reporte"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Interaction & Details drawer */}
        {selectedReport ? (
          <div className="card fade-in" style={{ padding: '1.5rem', borderLeft: `4px solid ${selectedReport.category === 'Acto Inseguro' ? 'var(--danger)' : 'var(--warning)'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <span className="badge badge-info" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '0.25rem' }}>
                  <ReportIcon size={10} /> Detalle de Autoreporte HSEQ
                </span>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{selectedReport.category}</h3>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Registrado el <strong>{selectedReport.date}</strong> a las <strong>{selectedReport.time}</strong>
                </p>
              </div>
              
              {/* Direct status buttons */}
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <button 
                  className={`btn-secondary ${selectedReport.status === 'Abierto' ? 'active' : ''}`}
                  style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem', color: 'var(--danger)' }}
                  onClick={() => handleUpdateStatus('Abierto')}
                >
                  Abierto
                </button>
                <button 
                  className={`btn-secondary ${selectedReport.status === 'En Proceso' ? 'active' : ''}`}
                  style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem', color: 'var(--warning)' }}
                  onClick={() => handleUpdateStatus('En Proceso')}
                >
                  En Proceso
                </button>
                <button 
                  className={`btn-secondary ${selectedReport.status === 'Resuelto' ? 'active' : ''}`}
                  style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem', color: 'var(--success)' }}
                  onClick={() => handleUpdateStatus('Resuelto')}
                >
                  Cerrar
                </button>
              </div>
            </div>

            {/* Core details divided in structured sections */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* SECCIÓN I: INFORMACIÓN GENERAL */}
              <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.75rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--accent-primary)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.15rem' }}>
                  I. Información General
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.8rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Fecha y Hora:</span>
                    <strong>{selectedReport.date} {selectedReport.time || ''}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Tipo de Persona:</span>
                    <span className="badge badge-info" style={{ fontWeight: 600 }}>{selectedReport.reporterType || 'Empleado directo'}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Reporta:</span>
                    <strong>{selectedReport.reporterName || 'Anónimo'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Cargo / Área / Dep:</span>
                    <strong>{selectedReport.reporterTitle || 'No especifica'}</strong>
                  </div>
                </div>
              </div>

              {/* SECCIÓN II: CLASIFICACIÓN DEL PELIGRO */}
              <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.75rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--warning)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.15rem' }}>
                  II. Clasificación del Peligro
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem', marginBottom: '4px' }}>Tipo de Peligro:</span>
                    <select
                      className="form-control"
                      style={{ padding: '0.3rem', fontSize: '0.75rem', width: '100%', height: '30px' }}
                      value={selectedReport.category}
                      onChange={e => handleUpdateField('category', e.target.value)}
                    >
                      <option value="Condición Insegura">Condición Insegura</option>
                      <option value="Acto Inseguro">Acto Inseguro</option>
                    </select>
                  </div>
                  
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem', marginBottom: '4px' }}>Nivel de Riesgo:</span>
                    <select
                      className="form-control"
                      style={{ padding: '0.3rem', fontSize: '0.75rem', width: '100%', height: '30px' }}
                      value={selectedReport.severity || 'Media'}
                      onChange={e => handleUpdateField('severity', e.target.value)}
                    >
                      <option value="Bajo">Bajo</option>
                      <option value="Medio">Medio</option>
                      <option value="Alto">Alto</option>
                      <option value="Crítico">Crítico</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECCIÓN III: LOCALIZACIÓN Y DESCRIPCIÓN */}
              <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.75rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--success)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.15rem' }}>
                  III. Localización y Descripción
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Ubicación exacta:</span>
                    <input 
                      type="text" 
                      className="form-control" 
                      style={{ padding: '0.3rem', fontSize: '0.75rem', width: '100%', marginTop: '0.2rem', height: '30px' }}
                      value={selectedReport.area}
                      onChange={e => handleUpdateField('area', e.target.value)}
                    />
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Descripción detallada de la situación:</span>
                    <textarea 
                      className="form-control" 
                      style={{ padding: '0.3rem', fontSize: '0.75rem', width: '100%', marginTop: '0.2rem', resize: 'vertical' }}
                      rows={2}
                      value={selectedReport.description}
                      onChange={e => handleUpdateField('description', e.target.value)}
                    />
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Posibles consecuencias o daños esperados:</span>
                    <textarea 
                      className="form-control" 
                      style={{ padding: '0.3rem', fontSize: '0.75rem', width: '100%', marginTop: '0.2rem', resize: 'vertical', color: 'var(--danger)', fontWeight: 500 }}
                      rows={2}
                      value={selectedReport.consequences || ''}
                      onChange={e => handleUpdateField('consequences', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* SECCIÓN IV: EVIDENCIAS Y RECOMENDACIONES */}
              <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.75rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--accent-primary)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.15rem' }}>
                  IV. Evidencias y Recomendaciones
                </span>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8rem' }}>
                  
                  {/* Recomendación sugerida */}
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Acción correctiva inmediata sugerida:</span>
                    <textarea 
                      className="form-control"
                      style={{ padding: '0.3rem', fontSize: '0.75rem', width: '100%', marginTop: '0.2rem', resize: 'vertical' }}
                      rows={2}
                      value={selectedReport.suggestedCorrectiveAction || ''}
                      onChange={e => handleUpdateField('suggestedCorrectiveAction', e.target.value)}
                    />
                  </div>

                  {/* Dual Evidences: Reporte vs Cierre */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    
                    {/* Evidencia Inicial */}
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem', marginBottom: '4px' }}>Evidencia al Reportar:</span>
                      {selectedReport.photoName ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--bg-primary)', padding: '0.35rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                          <Smartphone size={14} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                          <span style={{ fontSize: '0.72rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={selectedReport.photoName}>
                            {selectedReport.photoName}
                          </span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Sin soporte fotográfico</span>
                      )}
                    </div>

                    {/* Evidencia al Cierre */}
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem', marginBottom: '4px' }}>Evidencia al Cierre:</span>
                      {selectedReport.closurePhotoName ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(16, 185, 129, 0.1)', padding: '0.35rem', borderRadius: '4px', border: '1px solid var(--success)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', overflow: 'hidden' }}>
                            <CheckCircle2 size={14} style={{ color: 'var(--success)', flexShrink: 0 }} />
                            <span style={{ fontSize: '0.72rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--success)' }} title={selectedReport.closurePhotoName}>
                              {selectedReport.closurePhotoName}
                            </span>
                          </div>
                          <button 
                            type="button" 
                            style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.7rem', padding: 0 }}
                            onClick={() => handleUpdateField('closurePhotoName', '')}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <button 
                          type="button"
                          className="btn-secondary"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                          onClick={() => {
                            const dummyName = `evidencia_cierre_${selectedReport.id}_${Date.now().toString().slice(-4)}.jpg`;
                            handleUpdateField('closurePhotoName', dummyName);
                          }}
                        >
                          <Plus size={12} /> Cargar Evidencia Cierre
                        </button>
                      )}
                    </div>

                  </div>

                  {/* Asignación de Responsables */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.6rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem', marginBottom: '4px' }}>Responsable del Cierre:</span>
                      <select
                        className="form-control"
                        style={{ padding: '0.3rem', fontSize: '0.75rem', width: '100%', height: '30px' }}
                        value={selectedReport.closureResponsible || ''}
                        onChange={e => handleUpdateField('closureResponsible', e.target.value)}
                      >
                        <option value="">-- No Asignado --</option>
                        {users.map(u => <option key={u.email || u.name} value={u.name}>{u.name}</option>)}
                      </select>
                    </div>

                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem', marginBottom: '4px' }}>Personal SIG Auditores:</span>
                      <select
                        className="form-control"
                        style={{ padding: '0.3rem', fontSize: '0.75rem', width: '100%', height: '30px' }}
                        value={selectedReport.sigResponsible || ''}
                        onChange={e => handleUpdateField('sigResponsible', e.target.value)}
                      >
                        <option value="">-- No Asignado --</option>
                        {users.map(u => <option key={u.email || u.name} value={u.name}>{u.name}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Fechas de Gestión */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem', marginBottom: '4px' }}>Fecha Compromiso:</span>
                      <input 
                        type="date"
                        className="form-control"
                        style={{ padding: '0.2rem 0.3rem', fontSize: '0.75rem', width: '100%', height: '30px' }}
                        value={selectedReport.commitmentDate || ''}
                        onChange={e => handleUpdateField('commitmentDate', e.target.value)}
                      />
                    </div>

                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem', marginBottom: '4px' }}>Fecha Cierre:</span>
                      <input 
                        type="date"
                        className="form-control"
                        style={{ padding: '0.2rem 0.3rem', fontSize: '0.75rem', width: '100%', height: '30px' }}
                        value={selectedReport.closureDate || ''}
                        onChange={e => handleUpdateField('closureDate', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Tiempos de Respuesta y de Cierre */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', background: 'var(--bg-primary)', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.65rem' }}>Tiempo de Respuesta:</span>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-primary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} /> {getResponseTime(selectedReport)}
                      </div>
                    </div>

                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.65rem' }}>Tiempo Total de Cierre:</span>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: selectedReport.closureDate ? 'var(--success)' : 'var(--warning)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={12} /> {getTotalClosureTime(selectedReport)}
                      </div>
                    </div>
                  </div>

                  {/* Signature display */}
                  {selectedReport.signature && (
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem', marginBottom: '4px' }}>Firma del Reportante:</span>
                      <div style={{ background: '#fff', padding: '0.15rem', borderRadius: '4px', border: '1px solid var(--border-color)', display: 'inline-block' }}>
                        <img 
                          src={selectedReport.signature} 
                          alt="Firma del reportante" 
                          style={{ height: '30px', display: 'block' }} 
                        />
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* Action plan bridge button */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>¿Requiere plan de mejora robusto?</span>
                <button 
                  className="btn-secondary"
                  style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '3px' }}
                  onClick={handleGenerateActionPlan}
                >
                  <ListTodo size={12} /> Vincular Plan Acción Correctiva
                </button>
              </div>

              {/* Mini Tracker of local quick actions */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Historial de Acciones de Control en Campo</h4>
                
                {(!selectedReport.actions || selectedReport.actions.length === 0) ? (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No se han documentado acciones correctivas inmediatas todavía.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.75rem' }}>
                    {selectedReport.actions.map(action => (
                      <div 
                        key={action.id} 
                        style={{ fontSize: '0.75rem', padding: '0.4rem 0.6rem', background: 'var(--bg-secondary)', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '0.15rem' }}>
                          <span>{action.responsible}</span>
                          <span style={{ color: 'var(--text-muted)' }}>{action.date}</span>
                        </div>
                        <div style={{ color: 'var(--text-secondary)' }}>{action.desc}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Form to log quick action */}
                <form onSubmit={handleAddActionLog} style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                  <input 
                    type="text" 
                    className="form-control" 
                    style={{ flex: 2, fontSize: '0.75rem', padding: '0.3rem 0.5rem' }} 
                    placeholder="Acción tomada provisionalmente..." 
                    value={newActionText}
                    onChange={e => setNewActionText(e.target.value)}
                    required
                  />
                  <input 
                    type="text" 
                    className="form-control" 
                    style={{ flex: 1, fontSize: '0.75rem', padding: '0.3rem 0.5rem' }} 
                    placeholder="Encargado" 
                    value={newActionResp}
                    onChange={e => setNewActionResp(e.target.value)}
                    required
                  />
                  <button 
                    type="submit" 
                    className="btn-primary" 
                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '2px' }}
                  >
                    <Check size={12} /> Registrar
                  </button>
                </form>
              </div>

            </div>
          </div>
        ) : (
          <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Seleccione un reporte para visualizar los detalles y registrar acciones correctivas.
          </div>
        )}

      </div>

      {/* QR MODAL GENERATOR */}
      <Modal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} title="Código QR HSEQ: Reporte de Campo Seguro">
        <div style={{ textAlign: 'center', padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
            Imprime y pega este código QR en carteleras, lockers o zonas comunes de la planta. Los colaboradores podrán reportar actos y condiciones inseguras al instante desde su celular.
          </p>

          {/* Dynamic QR Code Image */}
          <div style={{
            background: 'white',
            padding: '1.25rem',
            borderRadius: '16px',
            border: '2px solid var(--border-color)',
            boxShadow: 'var(--shadow-md)',
            display: 'inline-flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${window.location.origin}/reporte-publico`)}`} 
              alt="QR Reporte de Campo Seguro" 
              style={{ width: '200px', height: '200px', display: 'block' }}
            />
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '10px', width: '100%', fontSize: '0.82rem', border: '1px solid var(--border-color)', wordBreak: 'break-all' }}>
            <strong>URL de Reporte Seguro:</strong><br />
            <span style={{ color: 'var(--accent-primary)', textDecoration: 'underline' }}>
              {window.location.origin}/reporte-publico
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
            <button className="btn-secondary" style={{ flex: 1 }} onClick={copyPublicLink}><LinkIcon size={14} style={{ marginRight: '4px' }} /> Copiar Link</button>
            <button className="btn-primary" style={{ flex: 1 }} onClick={() => setIsQrModalOpen(false)}><CheckCircle2 size={14} style={{ marginRight: '4px' }} /> Entendido</button>
          </div>
        </div>
      </Modal>
    </>
  );
}
