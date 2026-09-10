import React, { useState, useEffect } from 'react';
import { Clock, Download, Plus, Target, CheckCircle, AlertTriangle, Edit2, Trash2, Info, Activity, Archive } from 'lucide-react';
import Modal from '../components/Modal';
import ExportModal from '../components/ExportModal';
import { downloadCSV } from '../utils/exportUtils';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAppUsers } from '../hooks/useAppUsers';

export default function IntegratedObjectives() {
  const APP_USERS = useAppUsers();

  const [meta, setMeta] = useLocalStorage('sgi_objectives_meta', {
    version: 1,
    validity: '2026-12-31',
    lastUpdated: '2026-06-18'
  });

  const [objectivesHistory, setObjectivesHistory] = useLocalStorage('sgi_objectives_history', [
    { version: '01', date: '2025-01-10', changes: 'Emisión Inicial de los Objetivos Integrales HSEQ.' }
  ]);

  const [exportConfig, setExportConfig] = useState({
    isOpen: false,
    exportType: 'excel',
    title: '',
    code: '',
    version: '01',
    validity: '',
    columns: [],
    data: [],
    history: []
  });
  
  // Consumir el storage unificado
  const [objectives, setObjectives] = useLocalStorage('sgi_objectives', [
    { 
      id: 1, name: 'Reducir accidentes laborales', system: 'SST', target: 0, current: 1, status: 'No Cumple',
      what: 'Implementar programa cero accidentes', resources: 'Presupuesto SST $5M', responsible: 'Diego Castro', when: '2026-12-31', how: 'Auditorías mensuales',
      perspective: 'Procesos', kpi: 'Tasa de Accidentalidad', unit: ' inc.', origin: 'Investigación de Accidentes', evidence: 'Estadísticas de incidentes',
      monthlyValues: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
      formula: '(Nº Accidentes / HHT) * 200,000', frequency: 'Mensual',
      measurements: [
        { date: '2026-04-30', qualitative: 'Cumple', quantitative: 0, responsible: 'Diego Castro', analysis: 'Fórmula de accidentes dio 0.' },
        { date: '2026-05-30', qualitative: 'No Cumple', quantitative: 1, responsible: 'Diego Castro', analysis: 'Se presentó un incidente en la bodega.' }
      ]
    },
    { 
      id: 2, name: 'Disminuir consumo de agua', system: 'Ambiental', target: 90, current: 95, status: 'Cumple',
      what: 'Instalar ahorradores', resources: 'Presupuesto $1M', responsible: 'Líder Ambiental', when: '2026-10-31', how: 'Revisión de facturas',
      perspective: 'Procesos', kpi: 'Porcentaje de Ahorro', unit: '%', origin: 'PESTAL - Medio Ambiente', evidence: 'Facturas de acueducto',
      monthlyValues: [90, 92, 90, 93, 95, 0, 0, 0, 0, 0, 0, 0],
      formula: '((Consumo Base - Consumo Actual) / Consumo Base) * 100', frequency: 'Mensual',
      measurements: [
        { date: '2026-05-30', qualitative: 'Cumple', quantitative: 95, responsible: 'Líder Ambiental', analysis: 'La instalación de los grifos ahorradores redujo el consumo.' }
      ]
    },
    { 
      id: 3, name: 'Aumentar satisfacción cliente', system: 'Calidad', target: 90, current: 92, status: 'Cumple',
      what: 'Llamadas de seguimiento', resources: 'CRM y personal', responsible: 'Dir. Comercial', when: '2026-12-31', how: 'Encuestas post-venta',
      perspective: 'Clientes', kpi: 'Índice CSAT', unit: '%', origin: 'Partes Interesadas - Clientes', evidence: 'Reporte de Encuestas',
      monthlyValues: [90, 91, 93, 92, 92, 0, 0, 0, 0, 0, 0, 0],
      formula: '(Clientes Satisfechos / Total Encuestados) * 100', frequency: 'Mensual',
      measurements: []
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Combined Form State
  const [formData, setFormData] = useState({
    perspective: 'Procesos', system: 'Calidad', name: '', kpi: '', target: 0, current: 0, unit: '%',
    what: '', resources: '', responsible: '', when: '', how: '', origin: '', evidence: '',
    formula: '', frequency: 'Mensual', policyCommitment: ''
  });

  const [isMeasurementModalOpen, setIsMeasurementModalOpen] = useState(false);
  const [measuringItem, setMeasuringItem] = useState(null);
  const [measurementData, setMeasurementData] = useState({ date: new Date().toISOString().split('T')[0], qualitative: 'Cumple', quantitative: 0, responsible: '', analysis: '' });

  const [systems, setSystems] = useState(['Calidad', 'Ambiental', 'SST', 'Integrado', 'Direccionamiento Estratégico', 'Talento Humano', 'Comercial y Ventas', 'Producción / Operación', 'Gestión TI']);

  useEffect(() => {
    const saved = localStorage.getItem('sgi_processes');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.length > 0) {
        setSystems(['Calidad', 'Ambiental', 'SST', 'Integrado', ...parsed.map(p => p.name)]);
      }
    }
  }, []);

  // Retrocompatibility normalizer
  const normalizedObjectives = React.useMemo(() => {
    return objectives.map(item => ({
      ...item,
      perspective: item.perspective || 'Procesos',
      kpi: item.kpi || item.name || 'Indicador',
      unit: item.unit || '%',
      origin: item.origin || 'Gestión Integrada',
      evidence: item.evidence || item.how || 'Reportes de Seguimiento',
      monthlyValues: item.monthlyValues || [item.current || 0, item.current || 0, item.current || 0, item.current || 0, item.current || 0, 0, 0, 0, 0, 0, 0, 0],
      system: item.system || 'Calidad',
      what: item.what || 'Plan de acción formulado desde Balanced Scorecard.',
      resources: item.resources || 'Presupuesto de área.',
      responsible: item.responsible || 'Responsable HSEQ',
      when: item.when || '2026-12-31',
      how: item.how || item.evidence || 'Revisión periódica',
      measurements: item.measurements || [],
      formula: item.formula || 'No definida',
      frequency: item.frequency || 'Mensual',
      policyCommitment: item.policyCommitment || (
        item.system === 'SST' ? 'Prevención de lesiones, enfermedades laborales y promoción de la salud (SST)' :
        item.system === 'Ambiental' ? 'Protección del medio ambiente y prevención de la contaminación (Ambiental)' :
        item.system === 'Calidad' ? 'Satisfacción de clientes y mejora continua (Calidad)' :
        'Compromiso integrado y sostenibilidad global (General)'
      )
    }));
  }, [objectives]);

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        perspective: item.perspective || 'Procesos',
        system: item.system || 'Calidad',
        name: item.name || '',
        kpi: item.kpi || '',
        target: item.target || 0,
        current: item.current || 0,
        unit: item.unit || '%',
        what: item.what || '',
        resources: item.resources || '',
        responsible: item.responsible || '',
        when: item.when || '',
        how: item.how || '',
        origin: item.origin || '',
        evidence: item.evidence || '',
        formula: item.formula || '',
        frequency: item.frequency || 'Mensual',
        policyCommitment: item.policyCommitment || ''
      });
    } else {
      setEditingItem(null);
      setFormData({
        perspective: 'Procesos',
        system: 'Calidad',
        name: '',
        kpi: '',
        target: 0,
        current: 0,
        unit: '%',
        what: '',
        resources: '',
        responsible: APP_USERS[0]?.name || '',
        when: new Date().toISOString().split('T')[0],
        how: '',
        origin: '',
        evidence: '',
        formula: '',
        frequency: 'Mensual',
        policyCommitment: 'Satisfacción de clientes y mejora continua (Calidad)'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Auto-calculate qualitative status
    let newStatus = 'Sin Medición';
    const kpiLower = formData.kpi.toLowerCase();
    if (formData.perspective === 'Procesos' || kpiLower.includes('nc') || kpiLower.includes('quejas') || kpiLower.includes('accidentes')) {
      newStatus = formData.current <= formData.target ? 'Cumple' : 'No Cumple';
    } else {
      newStatus = formData.current >= formData.target ? 'Cumple' : 'No Cumple';
    }

    const cleanItem = {
      ...formData,
      status: newStatus
    };

    if (editingItem) {
      setObjectives(objectives.map(o => o.id === editingItem.id ? { 
        ...o, 
        ...cleanItem,
        monthlyValues: o.monthlyValues || Array(12).fill(0),
        measurements: o.measurements || [] 
      } : o));
    } else {
      setObjectives([...objectives, { 
        ...cleanItem, 
        id: Date.now(), 
        monthlyValues: Array(12).fill(0), 
        measurements: [] 
      }]);
    }
    handleCloseModal();
  };

  const handleOpenMeasurement = (item) => {
    setMeasuringItem(item);
    setMeasurementData({ 
      date: new Date().toISOString().split('T')[0], 
      qualitative: 'Cumple', 
      quantitative: 0, 
      responsible: APP_USERS[0]?.name || '',
      analysis: ''
    });
    setIsMeasurementModalOpen(true);
  };

  const handleSubmitMeasurement = (e) => {
    e.preventDefault();
    const newMeasurements = [...(measuringItem.measurements || []), measurementData];
    
    // Sincronizar el log mensual con el BSC
    const measDate = new Date(measurementData.date);
    const monthIdx = measDate.getMonth();
    const newMonthlyValues = [...(measuringItem.monthlyValues || Array(12).fill(0))];
    newMonthlyValues[monthIdx] = measurementData.quantitative;

    const newCurrent = measurementData.quantitative;

    // Adopt qualitative status manually selected by the user
    const newStatus = measurementData.qualitative;
    
    setObjectives(objectives.map(o => {
      if (o.id === measuringItem.id) {
        return { 
          ...o, 
          measurements: newMeasurements, 
          monthlyValues: newMonthlyValues,
          current: newCurrent, 
          actual: newCurrent,
          status: newStatus 
        };
      }
      return o;
    }));
    
    setIsMeasurementModalOpen(false);

    if (newStatus === 'No Cumple') {
      setTimeout(() => {
        alert(`¡ATENCIÓN! La medición cuantitativa no cumple con la meta (${measurementData.quantitative} vs ${measuringItem.target}). Se debe registrar un Plan de Acción Correctiva.`);
      }, 300);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Está seguro de eliminar este objetivo?")) {
      setObjectives(objectives.filter(o => o.id !== id));
    }
  };

  const handleExport = () => {
    const cols = [
      { header: 'Política Integral', key: 'policyCommitment' },
      { header: 'Sistema HSEQ', key: 'system' },
      { header: 'Objetivo Estratégico', key: 'name' },
      { header: 'Indicador (KPI)', key: 'kpi' },
      { header: 'Fórmula', key: 'formula' },
      { header: 'Frecuencia', key: 'frequency' },
      { header: 'Meta', key: 'target' },
      { header: 'Resultado Actual', key: 'current' },
      { header: 'Unidad', key: 'unit' },
      { header: 'Estado', key: 'status' },
      { header: 'Líder Responsable', key: 'responsible' }
    ];
    setExportConfig({
      isOpen: true,
      exportType: 'excel',
      title: 'Objetivos Integrales HSEQ',
      code: 'SGI-MAT-OBJ-001',
      version: `0${meta.version}`,
      validity: meta.validity,
      columns: cols,
      data: normalizedObjectives,
      history: objectivesHistory
    });
  };

  const handleNewVersion = () => {
    const changeReason = window.prompt("Ingrese el motivo del cambio para la versión 0" + meta.version + " de los Objetivos Integrales:");
    if (!changeReason) {
      alert("Se requiere un motivo del cambio para archivar e incrementar la versión.");
      return;
    }

    const currentVersionStr = `0${meta.version}`;
    const nextVersionVal = meta.version + 1;

    const obsoleteDoc = {
      id: Date.now(),
      code: `OBJ-V${meta.version}`,
      name: `Objetivos Integrales HSEQ V${meta.version}`,
      type: 'Matriz',
      version: `V.${currentVersionStr}`,
      date: meta.lastUpdated,
      status: 'Obsoleto'
    };
    
    const existingDocs = JSON.parse(localStorage.getItem('sgi_docs') || '[]');
    existingDocs.push(obsoleteDoc);
    localStorage.setItem('sgi_docs', JSON.stringify(existingDocs));

    // Update history
    const newHistoryEntry = {
      version: currentVersionStr,
      date: meta.lastUpdated,
      changes: changeReason
    };
    setObjectivesHistory([...objectivesHistory, newHistoryEntry]);

    setMeta({
      version: nextVersionVal,
      validity: meta.validity,
      lastUpdated: new Date().toISOString().split('T')[0]
    });
    alert(`Objetivos Integrales V.${currentVersionStr} guardados con éxito en el histórico de Obsoletos. Iniciando versión 0${nextVersionVal}`);
  };

  const total = normalizedObjectives.length;
  const cumplen = normalizedObjectives.filter(o => o.status === 'Cumple').length;
  const noCumplen = normalizedObjectives.filter(o => o.status === 'No Cumple').length;
  const sinMedicion = normalizedObjectives.filter(o => o.status === 'Sin Medición').length;

  return (
    <>
      <div style={{display:'flex', justifyContent:'space-between', marginBottom:'1.5rem', alignItems:'center', flexWrap:'wrap', gap:'1rem'}}>
        <div>
          <p style={{color:'var(--text-secondary)', marginBottom:'0.25rem'}}>Objetivos HSEQ Integrados (ISO 9001/14001/45001 - Cláusula 6.2)</p>
          <span className="badge badge-info">
            <Clock size={12} style={{marginRight:'4px'}}/> Última actualización: {meta.lastUpdated} | Versión: 0{meta.version}
          </span>
        </div>
        <div style={{display:'flex', gap:'0.5rem', flexWrap:'wrap'}}>
          <button className="btn-secondary" onClick={handleExport}><Download size={16}/> Exportar Excel</button>
          <button className="btn-secondary" onClick={handleNewVersion} style={{color:'var(--warning)', borderColor:'var(--warning)'}}>
            <Archive size={16} style={{marginRight:'4px'}}/> Archivar Versión
          </button>
          <button className="btn-primary" onClick={() => handleOpenModal()}><Plus size={16}/> Nuevo Objetivo HSEQ</button>
        </div>
      </div>

      <div className="card" style={{marginBottom:'1.5rem', background:'var(--bg-secondary)', border:'1px solid var(--border-color)', display:'flex', gap:'1rem', alignItems:'flex-start'}}>
        <Info size={24} style={{color:'var(--accent-primary)', flexShrink:0}}/>
        <div>
          <h4 style={{fontSize:'0.9rem', marginBottom:'0.5rem'}}>Política Integrada y Dirección Estratégica</h4>
          <p style={{fontSize:'0.85rem', color:'var(--text-secondary)', lineHeight:1.5}}>
            <strong>Misión:</strong> Proveer servicios de alta calidad cumpliendo normativas. 
            <br/><strong>Política:</strong> Satisfacción al cliente, protección del medio ambiente y garantía de la seguridad laboral.
            <br/><span style={{fontSize:'0.75rem', color:'var(--text-muted)'}}>*Los objetivos se encuentran vinculados bidireccionalmente con el Balanced Scorecard.*</span>
          </p>
        </div>
      </div>

      <div className="grid-4" style={{marginBottom:'1.5rem'}}>
        <div className="card" style={{marginBottom:0, borderLeft:'4px solid var(--accent-primary)', padding:'1.25rem'}}>
          <div style={{fontSize:'0.8rem', color:'var(--text-secondary)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.5rem'}}>Total Objetivos</div>
          <div style={{fontSize:'2rem', fontWeight:700}}>{total}</div>
        </div>
        <div className="card" style={{marginBottom:0, borderLeft:'4px solid var(--success)', padding:'1.25rem'}}>
          <div style={{fontSize:'0.8rem', color:'var(--text-secondary)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.5rem'}}>Cumplen Meta</div>
          <div style={{fontSize:'2rem', fontWeight:700, color:'var(--success)'}}>{cumplen}</div>
        </div>
        <div className="card" style={{marginBottom:0, borderLeft:'4px solid var(--danger)', padding:'1.25rem'}}>
          <div style={{fontSize:'0.8rem', color:'var(--text-secondary)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.5rem'}}>No Cumplen</div>
          <div style={{fontSize:'2rem', fontWeight:700, color:'var(--danger)'}}>{noCumplen}</div>
        </div>
        <div className="card" style={{marginBottom:0, borderLeft:'4px solid var(--warning)', padding:'1.25rem'}}>
          <div style={{fontSize:'0.8rem', color:'var(--text-secondary)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.5rem'}}>Sin Medición</div>
          <div style={{fontSize:'2rem', fontWeight:700, color:'var(--warning)'}}>{sinMedicion}</div>
        </div>
      </div>

      <div className="grid-3" style={{marginBottom:'1.5rem'}}>
        {normalizedObjectives.map(obj => {
          let badgeClass = 'badge-warning';
          let borderClass = 'var(--warning)';
          
          if (obj.status === 'No Cumple') {
            badgeClass = 'badge-danger';
            borderClass = 'var(--danger)';
          } else if (obj.status === 'Cumple') {
            badgeClass = 'badge-success';
            borderClass = 'var(--success)';
          }

          return (
            <div key={obj.id} className="card" style={{borderTop:`3px solid ${borderClass}`, position:'relative', padding:'1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '500px'}}>
              <div>
                <div style={{position:'absolute', top:'10px', right:'10px', display:'flex', gap:'0.25rem'}}>
                  <button className="btn-icon" style={{padding:'0.15rem', color:'var(--text-muted)'}} onClick={() => handleOpenModal(obj)} title="Editar Plan">
                    <Edit2 size={12}/>
                  </button>
                  <button className="btn-icon" style={{padding:'0.15rem', color:'var(--danger)'}} onClick={() => handleDelete(obj.id)}>
                    <Trash2 size={12}/>
                  </button>
                </div>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.5rem', alignItems: 'center'}}>
                  <span className="badge badge-info">{obj.system}</span>
                  <span className={`badge ${badgeClass}`}>{obj.status}</span>
                </div>
                
                <h4 style={{marginBottom:'0.75rem', fontSize:'1rem', minHeight:'30px', paddingRight:'2rem', lineHeight: '1.3'}}>{obj.name}</h4>
                <div style={{fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem'}}>
                  <strong>KPI:</strong> {obj.kpi} | <strong>Perspectiva:</strong> {obj.perspective}
                </div>
                <div style={{fontSize: '0.72rem', color: 'var(--accent-primary)', marginBottom: '0.75rem', fontWeight: 600}}>
                  🎯 Política: {obj.policyCommitment}
                </div>

                {/* Cuadro de Medición Cuantitativa */}
                <div style={{fontSize:'0.75rem', color:'var(--text-muted)', marginBottom:'0.75rem', background:'var(--bg-secondary)', padding:'0.4rem 0.6rem', borderRadius:'var(--radius-sm)'}}>
                  <div><strong>Fórmula:</strong> {obj.formula}</div>
                  <div style={{marginTop:'0.25rem'}}><strong>Frecuencia:</strong> {obj.frequency}</div>
                </div>

                <div style={{fontSize:'0.8rem', color:'var(--text-secondary)', marginBottom:'0.75rem', background:'var(--bg-secondary)', padding:'0.5rem', borderRadius:'var(--radius-sm)'}}>
                  <div style={{marginBottom:'0.25rem'}}><strong>Acción:</strong> {obj.what}</div>
                  <div style={{marginBottom:'0.25rem'}}><strong>Responsable:</strong> {obj.responsible}</div>
                  <div><strong>Plazo:</strong> {obj.when}</div>
                </div>

                <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.85rem', color:'var(--text-secondary)', marginBottom:'0.5rem'}}>
                  <span>Meta: <strong style={{fontSize:'1.1rem', color:'var(--text-primary)'}}>{obj.target}{obj.unit}</strong></span>
                  <span>Actual: <strong style={{fontSize:'1.1rem', color: obj.status === 'No Cumple' ? 'var(--danger)' : obj.status === 'Cumple' ? 'var(--success)' : 'var(--text-primary)'}}>{obj.current}{obj.unit}</strong></span>
                </div>

                {/* SVG Sparkline trend */}
                {(() => {
                  const monthlyData = obj.monthlyValues || Array(12).fill(0);
                  const maxMonthly = Math.max(...monthlyData, obj.target, 1);
                  const points = monthlyData.map((val, idx) => {
                    const x = idx * 15;
                    const y = 28 - (val / maxMonthly) * 26;
                    return `${x},${y}`;
                  }).join(' ');

                  return (
                    <div style={{ marginTop: '0.5rem', marginBottom: '0.75rem', borderTop: '1px dashed var(--border-color)', paddingTop: '0.5rem' }}>
                      <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span>Línea de Tendencia</span>
                        <span>Máx: {maxMonthly}{obj.unit}</span>
                      </div>
                      <svg viewBox="0 0 170 30" style={{ width: '100%', height: '30px', overflow: 'visible' }}>
                        {/* Target line */}
                        {(() => {
                          const targetY = 28 - (obj.target / maxMonthly) * 26;
                          return <line x1="0" y1={targetY} x2="170" y2={targetY} stroke="rgba(148, 163, 184, 0.3)" strokeDasharray="2" strokeWidth="0.5" />;
                        })()}
                        {/* Polyline */}
                        <polyline fill="none" stroke={borderClass} strokeWidth="1.2" points={points} />
                        {/* Dots */}
                        {monthlyData.map((val, idx) => {
                          if (val === 0) return null;
                          const x = idx * 15;
                          const y = 28 - (val / maxMonthly) * 26;
                          return <circle key={idx} cx={x} cy={y} r="1.5" fill={borderClass} />;
                        })}
                      </svg>
                    </div>
                  );
                })()}
              </div>

              <div>
                <button className="btn-primary" style={{width: '100%', padding:'0.4rem', fontSize:'0.8rem', cursor: 'pointer'}} onClick={() => handleOpenMeasurement(obj)}>
                  <Activity size={12} style={{marginRight:'4px'}}/> Registrar Medición
                </button>
                
                {obj.measurements && obj.measurements.length > 0 && (
                  <div style={{marginTop:'0.75rem', borderTop:'1px solid var(--border-color)', paddingTop:'0.5rem'}}>
                    <div style={{fontSize:'0.72rem', fontWeight:600, color:'var(--text-muted)', marginBottom:'0.25rem'}}>
                      Historial de Mediciones ({obj.measurements.length})
                    </div>
                    <div style={{maxHeight:'70px', overflowY:'auto'}}>
                      {obj.measurements.slice().reverse().map((m, i) => (
                        <div key={i} style={{fontSize:'0.7rem', display:'flex', flexDirection:'column', padding:'0.2rem 0', borderBottom:'1px dashed var(--border-color)'}}>
                          <div style={{display:'flex', justifyContent:'space-between'}}>
                            <span style={{color: 'var(--text-secondary)'}}>{m.date} | {m.responsible}</span>
                            <span style={{color: m.qualitative === 'Cumple' ? 'var(--success)' : 'var(--danger)'}}>
                              <strong>{m.quantitative}{obj.unit}</strong> ({m.qualitative})
                            </span>
                          </div>
                          {m.analysis && (
                            <div style={{fontStyle:'italic', color:'var(--text-muted)', fontSize:'0.65rem', marginTop:'2px', whiteSpace:'normal', wordBreak:'break-word'}}>
                              <strong>Análisis:</strong> {m.analysis}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* ISO PLANNING FORM MODAL */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingItem ? "Editar Objetivo HSEQ (ISO 6.2 & BSC)" : "Nuevo Objetivo HSEQ (ISO 6.2 & BSC)"}
      >
        <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Sistema o Proceso HSEQ</label>
              <select 
                className="form-control" 
                value={formData.system} 
                onChange={e => {
                  const val = e.target.value;
                  let defaultCommitment = formData.policyCommitment;
                  if (val === 'SST') defaultCommitment = 'Prevención de lesiones, enfermedades laborales y promoción de la salud (SST)';
                  else if (val === 'Ambiental') defaultCommitment = 'Protección del medio ambiente y prevención de la contaminación (Ambiental)';
                  else if (val === 'Calidad') defaultCommitment = 'Satisfacción de clientes y mejora continua (Calidad)';
                  else defaultCommitment = 'Compromiso integrado y sostenibilidad global (General)';
                  
                  setFormData({...formData, system: val, policyCommitment: defaultCommitment});
                }} 
                required
              >
                {systems.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Perspectiva Estratégica (BSC)</label>
              <select className="form-control" value={formData.perspective} onChange={e => setFormData({...formData, perspective: e.target.value})} required>
                <option value="Financiera">Financiera</option>
                <option value="Clientes">Clientes</option>
                <option value="Procesos">Procesos</option>
                <option value="Aprendizaje">Aprendizaje</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Compromiso de la Política Integral HSEQ</label>
            <select 
              className="form-control" 
              value={formData.policyCommitment} 
              onChange={e => setFormData({...formData, policyCommitment: e.target.value})} 
              required
            >
              <option value="Satisfacción de clientes y mejora continua (Calidad)">Satisfacción de clientes y mejora continua (Calidad)</option>
              <option value="Protección del medio ambiente y prevención de la contaminación (Ambiental)">Protección del medio ambiente y prevención de la contaminación (Ambiental)</option>
              <option value="Prevención de lesiones, enfermedades laborales y promoción de la salud (SST)">Prevención de lesiones, enfermedades laborales y promoción de la salud (SST)</option>
              <option value="Cumplimiento de requisitos legales y regulatorios vigentes (Legal)">Cumplimiento de requisitos legales y regulatorios vigentes (Legal)</option>
              <option value="Compromiso integrado y sostenibilidad global (General)">Compromiso integrado y sostenibilidad global (General)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Nombre del Objetivo</label>
            <input type="text" className="form-control" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          </div>

          <div className="form-group">
            <label className="form-label">Indicador Clave (KPI)</label>
            <input type="text" className="form-control" value={formData.kpi} onChange={e => setFormData({...formData, kpi: e.target.value})} required />
          </div>

          {/* Campos de Fórmula y Frecuencia */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Fórmula de Medición (Cálculo Cuantitativo)</label>
              <input type="text" className="form-control" value={formData.formula} onChange={e => setFormData({...formData, formula: e.target.value})} required placeholder="Ej: (Accidentes / HHT) * 200,000" />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Frecuencia</label>
              <select className="form-control" value={formData.frequency} onChange={e => setFormData({...formData, frequency: e.target.value})} required>
                <option value="Mensual">Mensual</option>
                <option value="Trimestral">Trimestral</option>
                <option value="Semestral">Semestral</option>
                <option value="Anual">Anual</option>
              </select>
            </div>
          </div>

          <div style={{display:'flex', gap:'1rem'}}>
            <div className="form-group" style={{flex:1}}>
              <label className="form-label">Meta Cuantitativa Esperada</label>
              <input type="number" step="any" className="form-control" value={formData.target} onChange={e => setFormData({...formData, target: Number(e.target.value)})} required />
            </div>
            <div className="form-group" style={{flex:1}}>
              <label className="form-label">Valor Actual</label>
              <input type="number" step="any" className="form-control" value={formData.current} onChange={e => setFormData({...formData, current: Number(e.target.value)})} required />
            </div>
            <div className="form-group" style={{width:'80px'}}>
              <label className="form-label">Unidad</label>
              <input type="text" className="form-control" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} placeholder="Ej: %" required />
            </div>
          </div>
          
          <div style={{borderTop:'1px solid var(--border-color)', paddingTop:'1rem', marginTop:'0.5rem'}}>
            <h4 style={{fontSize:'0.85rem', color:'var(--accent-primary)', marginBottom:'0.75rem', fontWeight: 700}}>Planificación ISO 6.2.2</h4>
            
            <div className="form-group">
              <label className="form-label">¿Qué se va a hacer?</label>
              <textarea className="form-control" value={formData.what} onChange={e => setFormData({...formData, what: e.target.value})} required rows="2" placeholder="Acciones operativas a implementar..."></textarea>
            </div>
            
            <div style={{display:'grid', gridTemplateColumns: '1fr 1fr', gap:'1rem', marginTop: '0.5rem'}}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">¿Qué recursos se requieren?</label>
                <input type="text" className="form-control" value={formData.resources} onChange={e => setFormData({...formData, resources: e.target.value})} required />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">¿Quién será responsable?</label>
                <select className="form-control" value={formData.responsible} onChange={e => setFormData({...formData, responsible: e.target.value})} required>
                  <option value="">Seleccione Usuario...</option>
                  {APP_USERS.map(u => <option key={u.email} value={u.name}>{u.name}</option>)}
                </select>
              </div>
            </div>

            <div style={{display:'grid', gridTemplateColumns: '1fr 1fr', gap:'1rem', marginTop: '0.75rem'}}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">¿Cuándo finalizará? (Plazo)</label>
                <input type="date" className="form-control" value={formData.when} onChange={e => setFormData({...formData, when: e.target.value})} required />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">¿Cómo se evaluarán los resultados?</label>
                <input type="text" className="form-control" value={formData.how} onChange={e => setFormData({...formData, how: e.target.value})} required placeholder="Ej: Auditorías, revisión de indicadores..." />
              </div>
            </div>
          </div>

          <div style={{display:'flex', gap:'1rem', marginTop: '0.5rem'}}>
            <div className="form-group" style={{flex:1, margin: 0}}>
              <label className="form-label">Origen de la Meta</label>
              <input type="text" className="form-control" value={formData.origin} onChange={e => setFormData({...formData, origin: e.target.value})} required placeholder="Ej: PESTAL..." />
            </div>
            <div className="form-group" style={{flex:1, margin: 0}}>
              <label className="form-label">Evidencia de Medición</label>
              <input type="text" className="form-control" value={formData.evidence} onChange={e => setFormData({...formData, evidence: e.target.value})} required />
            </div>
          </div>

          <div style={{display:'flex', justifyContent:'flex-end', gap:'0.5rem', marginTop:'1rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem'}}>
            <button type="button" className="btn-secondary" onClick={handleCloseModal}>Cancelar</button>
            <button type="submit" className="btn-primary">{editingItem ? "Actualizar Plan" : "Guardar Plan"}</button>
          </div>
        </form>
      </Modal>

      {/* MEASUREMENT MODAL */}
      <Modal 
        isOpen={isMeasurementModalOpen} 
        onClose={() => setIsMeasurementModalOpen(false)} 
        title={`Registrar Medición: ${measuringItem?.name}`}
      >
        <form onSubmit={handleSubmitMeasurement} style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
          <div style={{background:'var(--bg-secondary)', padding:'1rem', borderRadius:'var(--radius-md)', marginBottom:'0.5rem'}}>
            <div style={{fontSize:'0.85rem', color:'var(--text-secondary)', marginBottom:'0.25rem'}}>Meta a alcanzar:</div>
            <div style={{fontSize:'1.5rem', fontWeight:700}}>{measuringItem?.target}{measuringItem?.unit}</div>
          </div>

          <div style={{display:'flex', gap:'1rem'}}>
            <div className="form-group" style={{flex:1, margin: 0}}>
              <label className="form-label">Fecha de Medición</label>
              <input type="date" className="form-control" value={measurementData.date} onChange={e => setMeasurementData({...measurementData, date: e.target.value})} required />
            </div>
            <div className="form-group" style={{flex:1, margin: 0}}>
              <label className="form-label">Responsable de Medición</label>
              <select className="form-control" value={measurementData.responsible} onChange={e => setMeasurementData({...measurementData, responsible: e.target.value})} required>
                <option value="">Seleccione Usuario...</option>
                {APP_USERS.map(u => <option key={u.email} value={u.name}>{u.name}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Breve Análisis del Resultado (¿Por qué se llegó a la medición?)</label>
            <textarea 
              className="form-control" 
              rows="2" 
              value={measurementData.analysis} 
              onChange={e => setMeasurementData({...measurementData, analysis: e.target.value})} 
              required 
              placeholder="Ej: Se redujo el consumo por la instalación de válvulas ahorradoras en baños principales..."
            ></textarea>
          </div>

          <div style={{display:'flex', gap:'1rem', alignItems:'center'}}>
            <div className="form-group" style={{flex:1, margin: 0}}>
              <label className="form-label">Resultado Cuantitativo</label>
              <input type="number" step="any" className="form-control" value={measurementData.quantitative} onChange={e => setMeasurementData({...measurementData, quantitative: Number(e.target.value)})} required />
            </div>
            <div className="form-group" style={{flex:1, margin: 0}}>
              <label className="form-label">Resultado Cualitativo</label>
              <div style={{display:'flex', gap:'0.5rem', marginTop:'0.25rem'}}>
                <button type="button" className={`btn-primary`} style={{flex:1, background: measurementData.qualitative === 'Cumple' ? 'var(--success)' : 'var(--bg-secondary)', color: measurementData.qualitative === 'Cumple' ? 'white' : 'var(--text-primary)', border: '1px solid ' + (measurementData.qualitative === 'Cumple' ? 'var(--success)' : 'var(--border-color)'), cursor: 'pointer'}} onClick={() => setMeasurementData({...measurementData, qualitative: 'Cumple'})}>
                  <CheckCircle size={14} style={{marginRight:'4px'}}/> Cumple
                </button>
                <button type="button" className={`btn-primary`} style={{flex:1, background: measurementData.qualitative === 'No Cumple' ? 'var(--danger)' : 'var(--bg-secondary)', color: measurementData.qualitative === 'No Cumple' ? 'white' : 'var(--text-primary)', border: '1px solid ' + (measurementData.qualitative === 'No Cumple' ? 'var(--danger)' : 'var(--border-color)'), cursor: 'pointer'}} onClick={() => setMeasurementData({...measurementData, qualitative: 'No Cumple'})}>
                  <AlertTriangle size={14} style={{marginRight:'4px'}}/> No Cumple
                </button>
              </div>
            </div>
          </div>

          <div style={{display:'flex', justifyContent:'flex-end', gap:'0.5rem', marginTop:'1rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem'}}>
            <button type="button" className="btn-secondary" onClick={() => setIsMeasurementModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn-primary">Guardar Registro</button>
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
      />
    </>
  );
}
