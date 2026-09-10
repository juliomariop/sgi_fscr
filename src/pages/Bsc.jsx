import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, AlertTriangle, CheckCircle, Clock, Edit2, Trash2, ShieldAlert, Activity, Download, Archive } from 'lucide-react';
import Modal from '../components/Modal';
import ExportModal from '../components/ExportModal';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAppUsers } from '../hooks/useAppUsers';

export default function Bsc() {
  const APP_USERS = useAppUsers();

  const [meta, setMeta] = useLocalStorage('sgi_bsc_meta', {
    version: 1,
    validity: '2026-12-31',
    lastUpdated: '2026-06-18'
  });

  const [bscHistory, setBscHistory] = useLocalStorage('sgi_bsc_history', [
    { version: '01', date: '2025-01-10', changes: 'Emisión Inicial de la Matriz Balanced Scorecard (Perspectivas HSEQ).' }
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
    },
    {
      id: 4, name: 'Aumentar rentabilidad', system: 'Calidad', target: 20, current: 18, status: 'Cumple',
      what: 'Plan de acción formulado desde Balanced Scorecard.', resources: 'Presupuesto del área.', responsible: 'Gerente Financiero', when: '2026-12-31', how: 'Revisión de estados financieros mensuales',
      perspective: 'Financiera', kpi: 'Margen Neto', unit: '%', origin: 'PESTAL - Oportunidad Económica', evidence: 'Estados Financieros',
      monthlyValues: [15, 16, 17, 17.5, 18, 0, 0, 0, 0, 0, 0, 0],
      formula: '(Utilidad Neta / Ventas Totales) * 100', frequency: 'Mensual',
      measurements: []
    },
    {
      id: 5, name: 'Capacitar personal', system: 'Talento Humano', target: 100, current: 80, status: 'No Cumple',
      what: 'Plan de acción formulado desde Balanced Scorecard.', resources: 'Presupuesto del área.', responsible: 'Gestión Humana', when: '2026-12-31', how: 'Registros de Asistencia',
      perspective: 'Aprendizaje', kpi: 'Ejecución Plan', unit: '%', origin: 'PESTAL - Riesgo Personal', evidence: 'Registros de Asistencia',
      monthlyValues: [40, 50, 65, 80, 80, 0, 0, 0, 0, 0, 0, 0],
      formula: '(Horas Capacitadas / Horas Programadas) * 100', frequency: 'Trimestral',
      measurements: []
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Crossed Form State
  const [formData, setFormData] = useState({
    perspective: 'Financiera', system: 'Calidad', name: '', kpi: '', target: 0, current: 0, unit: '%',
    what: '', resources: '', responsible: '', when: '', how: '', origin: '', evidence: '',
    formula: '', frequency: 'Mensual'
  });

  // Monthly values modal state
  const [isMonthlyModalOpen, setIsMonthlyModalOpen] = useState(false);
  const [selectedBscItem, setSelectedBscItem] = useState(null);
  const [monthlyInputs, setMonthlyInputs] = useState(Array(12).fill(0));

  // Measurement Modal State
  const [isMeasurementModalOpen, setIsMeasurementModalOpen] = useState(false);
  const [measuringItem, setMeasuringItem] = useState(null);
  const [measurementData, setMeasurementData] = useState({ date: new Date().toISOString().split('T')[0], qualitative: 'Cumple', quantitative: 0, responsible: '', analysis: '' });

  // Filters and dynamic processes list
  const [systemFilter, setSystemFilter] = useState('Todos');
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

  // Migración automática de datos existentes en 'sgi_bsc'
  useEffect(() => {
    const rawBsc = localStorage.getItem('sgi_bsc');
    if (rawBsc) {
      try {
        const bscItems = JSON.parse(rawBsc);
        const rawObjs = localStorage.getItem('sgi_objectives');
        const objItems = rawObjs ? JSON.parse(rawObjs) : [];
        
        let modified = false;
        const mergedList = [...objItems];
        
        bscItems.forEach(b => {
          const nameToMatch = b.obj || b.kpi || '';
          const match = mergedList.find(o => o.id === b.id || o.name.toLowerCase().trim() === nameToMatch.toLowerCase().trim());
          if (!match) {
            mergedList.push({
              id: b.id || Date.now() + Math.random(),
              name: b.obj || b.kpi,
              perspective: b.perspective || 'Financiera',
              system: 'Calidad',
              kpi: b.kpi || b.obj,
              target: b.target || 0,
              current: b.actual || 0,
              status: (b.actual >= b.target) ? 'Cumple' : 'No Cumple',
              what: 'Plan de acción formulado desde Balanced Scorecard.',
              resources: 'Presupuesto del área.',
              responsible: b.responsible || 'Responsable HSEQ',
              when: '2026-12-31',
              how: b.evidence || 'Revisión periódica',
              origin: b.origin || 'Direccionamiento Estratégico',
              evidence: b.evidence || 'Registro digital',
              monthlyValues: b.monthlyValues || Array(12).fill(0),
              measurements: [],
              formula: b.formula || 'No definida',
              frequency: b.frequency || 'Mensual'
            });
            modified = true;
          } else {
            if (!match.monthlyValues && b.monthlyValues) {
              match.monthlyValues = b.monthlyValues;
              match.perspective = b.perspective || match.perspective;
              match.kpi = b.kpi || match.kpi;
              match.unit = b.unit || match.unit;
              match.origin = b.origin || match.origin;
              match.evidence = b.evidence || match.evidence;
              match.formula = b.formula || match.formula;
              match.frequency = b.frequency || match.frequency;
              modified = true;
            }
          }
        });
        
        if (modified) {
          setObjectives(mergedList);
        }
        localStorage.removeItem('sgi_bsc');
      } catch (err) {
        console.error("Error migrating BSC items:", err);
      }
    }
  }, [objectives, setObjectives]);

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
      frequency: item.frequency || 'Mensual'
    }));
  }, [objectives]);

  const filteredObjectives = React.useMemo(() => {
    return normalizedObjectives.filter(o => systemFilter === 'Todos' || o.system === systemFilter);
  }, [normalizedObjectives, systemFilter]);

  const getObjectiveProgress = (item) => {
    if (item.target === 0 && item.current === 0) return 100;
    const kpiLower = (item.kpi || '').toLowerCase();
    if (item.perspective === 'Procesos' || kpiLower.includes('nc') || kpiLower.includes('quejas') || kpiLower.includes('accidentes')) {
      if (item.current <= item.target) return 100;
      return Math.max(0, Math.round((item.target / item.current) * 100));
    } else {
      if (item.target === 0) return 0;
      return Math.min(100, Math.max(0, Math.round((item.current / item.target) * 100)));
    }
  };

  const overallCompliance = React.useMemo(() => {
    if (filteredObjectives.length === 0) return 0;
    const sum = filteredObjectives.reduce((acc, curr) => acc + getObjectiveProgress(curr), 0);
    return Math.round(sum / filteredObjectives.length);
  }, [filteredObjectives]);

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        perspective: item.perspective || 'Financiera',
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
        frequency: item.frequency || 'Mensual'
      });
    } else {
      setEditingItem(null);
      setFormData({
        perspective: 'Financiera',
        system: 'Calidad',
        name: '',
        kpi: '',
        target: 0,
        current: 0,
        unit: '%',
        what: '',
        resources: '',
        responsible: '',
        when: new Date().toISOString().split('T')[0],
        how: '',
        origin: '',
        evidence: '',
        formula: '',
        frequency: 'Mensual'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSubmit = (e) => {
    e.preventDefault();

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

  const handleDelete = (id) => {
    if (window.confirm("¿Está seguro de eliminar este objetivo?")) {
      setObjectives(objectives.filter(o => o.id !== id));
    }
  };

  const handleExport = () => {
    const cols = [
      { header: 'Perspectiva', key: 'perspective' },
      { header: 'Proceso HSEQ', key: 'system' },
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
      title: 'Balanced Scorecard - Cuadro de Mando',
      code: 'SGI-MAT-BSC-001',
      version: `0${meta.version}`,
      validity: meta.validity,
      columns: cols,
      data: filteredObjectives,
      history: bscHistory
    });
  };

  const handleNewVersion = () => {
    const changeReason = window.prompt("Ingrese el motivo del cambio para la versión 0" + meta.version + " del Balanced Scorecard:");
    if (!changeReason) {
      alert("Se requiere un motivo del cambio para archivar e incrementar la versión.");
      return;
    }

    const currentVersionStr = `0${meta.version}`;
    const nextVersionVal = meta.version + 1;

    const obsoleteDoc = {
      id: Date.now(),
      code: `BSC-V${meta.version}`,
      name: `Cuadro de Mando Balanced Scorecard V${meta.version}`,
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
    setBscHistory([...bscHistory, newHistoryEntry]);

    setMeta({
      version: nextVersionVal,
      validity: meta.validity,
      lastUpdated: new Date().toISOString().split('T')[0]
    });
    alert(`Cuadro de Mando V.${currentVersionStr} guardado con éxito en el histórico de Obsoletos. Iniciando versión 0${nextVersionVal}`);
  };

  const handleOpenMonthlyModal = (item) => {
    setSelectedBscItem(item);
    setMonthlyInputs(item.monthlyValues || Array(12).fill(0));
    setIsMonthlyModalOpen(true);
  };

  const handleSaveMonthlyValues = (e) => {
    e.preventDefault();
    if (!selectedBscItem) return;

    const values = monthlyInputs.map(Number);
    const nonZero = values.filter(v => v !== 0);
    
    let newCurrent = selectedBscItem.current;
    const kpiLower = selectedBscItem.kpi.toLowerCase();
    
    if (selectedBscItem.perspective === 'Procesos' || kpiLower.includes('nc') || kpiLower.includes('quejas') || kpiLower.includes('accidentes')) {
      newCurrent = values.reduce((a, b) => a + b, 0);
    } else {
      newCurrent = nonZero.length > 0 ? Number((nonZero.reduce((a, b) => a + b, 0) / nonZero.length).toFixed(1)) : 0;
    }

    let newStatus = 'Sin Medición';
    if (selectedBscItem.perspective === 'Procesos' || kpiLower.includes('nc') || kpiLower.includes('quejas') || kpiLower.includes('accidentes')) {
      newStatus = newCurrent <= selectedBscItem.target ? 'Cumple' : 'No Cumple';
    } else {
      newStatus = newCurrent >= selectedBscItem.target ? 'Cumple' : 'No Cumple';
    }

    setObjectives(objectives.map(o => {
      if (o.id === selectedBscItem.id) {
        return {
          ...o,
          monthlyValues: values,
          current: newCurrent,
          actual: newCurrent,
          status: newStatus
        };
      }
      return o;
    }));

    setIsMonthlyModalOpen(false);
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

  const monthsLabel = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ];

  return (
    <>
      <div style={{display:'flex', justifyContent:'space-between', marginBottom:'1.5rem', alignItems:'center', flexWrap:'wrap', gap:'1rem'}}>
        <div>
          <p style={{color:'var(--text-secondary)', marginBottom:'0.25rem'}}>Balanced Scorecard Estratégico (Integrado con Objetivos HSEQ)</p>
          <span className="badge badge-info">
            <Clock size={12} style={{marginRight:'4px'}}/> Última actualización: {meta.lastUpdated} | Versión: 0{meta.version}
          </span>
        </div>
        <div style={{display:'flex', gap:'0.5rem', flexWrap:'wrap'}}>
          <button className="btn-secondary" onClick={handleExport}><Download size={16}/> Exportar Excel</button>
          <button className="btn-secondary" onClick={handleNewVersion} style={{color:'var(--warning)', borderColor:'var(--warning)'}}>
            <Archive size={16} style={{marginRight:'4px'}}/> Archivar Versión
          </button>
          <button className="btn-primary" onClick={() => handleOpenModal()}><Target size={16}/> Formular Nuevo Objetivo</button>
        </div>
      </div>

      {/* FILTRO Y VISTA DE CUMPLIMIENTO GLOBAL */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        
        {/* Filtro Card */}
        <div className="card" style={{ marginBottom: 0, padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Filtrar por Proceso HSEQ</label>
            <select 
              className="form-control" 
              value={systemFilter} 
              onChange={e => setSystemFilter(e.target.value)}
              style={{ fontSize: '0.85rem', padding: '0.4rem 0.6rem' }}
            >
              <option value="Todos">Todos los Procesos</option>
              {systems.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Cumplimiento Global Card */}
        <div className="card" style={{ marginBottom: 0, padding: '1.25rem', borderLeft: '4px solid var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
            <h4 style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cumplimiento Global</h4>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Avance promedio de los {filteredObjectives.length} indicadores actuales</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {/* SVG Circular Progress Gauge */}
            <svg width="60" height="60" viewBox="0 0 36 36" style={{ overflow: 'visible' }}>
              <path
                fill="none"
                stroke="var(--border-color)"
                strokeWidth="3.2"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                fill="none"
                stroke={overallCompliance >= 90 ? 'var(--success)' : overallCompliance >= 70 ? 'var(--warning)' : 'var(--danger)'}
                strokeWidth="3.2"
                strokeDasharray={`${overallCompliance}, 100`}
                strokeLinecap="round"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                style={{ transition: 'stroke-dasharray 0.4s ease-out' }}
              />
              <text x="18" y="21" textAnchor="middle" fontSize="9" fontWeight="bold" fill="var(--text-primary)">
                {overallCompliance}%
              </text>
            </svg>
          </div>
        </div>

      </div>
      
      <div className="grid-3" style={{marginBottom:'2rem'}}>
        {filteredObjectives.map(item => {
          let progress = (item.current / item.target) * 100;
          let statusColor = 'var(--success)';
          
          const kpiLower = item.kpi.toLowerCase();
          if (item.perspective === 'Procesos' || kpiLower.includes('nc') || kpiLower.includes('quejas') || kpiLower.includes('accidentes')) { 
            progress = (item.target / item.current) * 100;
            if (item.current > item.target) {
              statusColor = 'var(--danger)';
            }
          } else {
            if (progress < 70) {
              statusColor = 'var(--danger)';
            } else if (progress < 95) {
              statusColor = 'var(--warning)';
            }
          }
          
          progress = Math.min(100, Math.max(0, progress));

          return (
            <div key={item.id} className="card" style={{borderTop:`3px solid ${statusColor}`, position:'relative', display:'flex', flexDirection:'column', justifyContent:'space-between', minHeight: '460px', padding: '1.25rem'}}>
              <div>
                <div style={{position:'absolute', top:'10px', right:'10px', display:'flex', gap:'0.25rem'}}>
                  <button className="btn-icon" style={{padding:'0.15rem', color:'var(--text-muted)'}} onClick={() => handleOpenModal(item)}>
                    <Edit2 size={12}/>
                  </button>
                  <button className="btn-icon" style={{padding:'0.15rem', color:'var(--danger)'}} onClick={() => handleDelete(item.id)}>
                    <Trash2 size={12}/>
                  </button>
                </div>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.5rem', marginTop:'0.5rem', alignItems: 'center'}}>
                  <span style={{fontSize:'0.75rem', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase'}}>{item.perspective}</span>
                  <span className="badge badge-info" style={{fontSize: '0.65rem'}}>{item.system}</span>
                </div>
                
                <h4 style={{marginBottom:'0.75rem', fontSize:'0.95rem', minHeight:'36px', lineHeight: '1.3'}}>{item.name}</h4>
                
                <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.8rem', color:'var(--text-secondary)', marginBottom:'0.5rem'}}>
                  <span>Meta: <strong>{item.target}{item.unit}</strong></span>
                  <strong style={{color: statusColor}}>Actual: {item.current}{item.unit}</strong>
                </div>
                
                {/* Cuadro de Medición Cuantitativa */}
                <div style={{fontSize:'0.75rem', color:'var(--text-muted)', marginBottom:'0.75rem', background:'var(--bg-secondary)', padding:'0.4rem 0.6rem', borderRadius:'var(--radius-sm)'}}>
                  <div><strong>Fórmula:</strong> {item.formula}</div>
                  <div style={{marginTop:'0.25rem'}}><strong>Frecuencia:</strong> {item.frequency}</div>
                </div>

                {/* Progress fill */}
                <div className="progress-bar" style={{ marginBottom: '0.75rem' }}>
                  <div className="progress-fill" style={{width:`${progress}%`, background:statusColor}}></div>
                </div>

                {/* SVG Sparkline trend */}
                {(() => {
                  const monthlyData = item.monthlyValues || Array(12).fill(0);
                  const maxMonthly = Math.max(...monthlyData, item.target, 1);
                  const points = monthlyData.map((val, idx) => {
                    const x = idx * 15;
                    const y = 28 - (val / maxMonthly) * 26;
                    return `${x},${y}`;
                  }).join(' ');

                  return (
                    <div style={{ marginTop: '0.6rem', borderTop: '1px dashed var(--border-color)', paddingTop: '0.4rem', marginBottom: '0.75rem' }}>
                      <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span>Tendencia Mensual (Ene-Dic)</span>
                        <span>Máx: {maxMonthly}{item.unit}</span>
                      </div>
                      <svg viewBox="0 0 170 30" style={{ width: '100%', height: '30px', overflow: 'visible' }}>
                        {/* Target line */}
                        {(() => {
                          const targetY = 28 - (item.target / maxMonthly) * 26;
                          return <line x1="0" y1={targetY} x2="170" y2={targetY} stroke="rgba(148, 163, 184, 0.3)" strokeDasharray="2" strokeWidth="0.5" />;
                        })()}
                        {/* Polyline */}
                        <polyline fill="none" stroke={statusColor} strokeWidth="1.2" points={points} />
                        {/* Dots */}
                        {monthlyData.map((val, idx) => {
                          if (val === 0) return null;
                          const x = idx * 15;
                          const y = 28 - (val / maxMonthly) * 26;
                          return <circle key={idx} cx={x} cy={y} r="1.5" fill={statusColor} />;
                        })}
                      </svg>
                    </div>
                  );
                })()}

                <div style={{fontSize:'0.75rem', color:'var(--text-muted)', display:'flex', justifyContent:'space-between', marginTop: '0.25rem'}}>
                  <span><strong>KPI:</strong> {item.kpi}</span>
                  <span><strong>Resp:</strong> {item.responsible}</span>
                </div>
                <div style={{fontSize:'0.68rem', color:'var(--text-secondary)', marginTop:'0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                  <strong>Plazo:</strong> {item.when} | <strong>Recursos:</strong> {item.resources}
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.75rem' }}>
                  <button 
                    className="btn-primary" 
                    style={{ flex: 1, padding: '0.35rem 0.5rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '3px', justifyContent: 'center', cursor: 'pointer' }}
                    onClick={() => handleOpenMeasurement(item)}
                  >
                    <Activity size={12} /> Registrar Medición
                  </button>
                  <button 
                    className="btn-secondary" 
                    style={{ flex: 1, padding: '0.35rem 0.5rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '3px', justifyContent: 'center', cursor: 'pointer' }}
                    onClick={() => handleOpenMonthlyModal(item)}
                  >
                    <Clock size={12} /> Log Mensual
                  </button>
                </div>

                {/* Historial de Mediciones */}
                {item.measurements && item.measurements.length > 0 && (
                  <div style={{marginTop:'0.75rem', borderTop:'1px solid var(--border-color)', paddingTop:'0.5rem'}}>
                    <div style={{fontSize:'0.7rem', fontWeight:600, color:'var(--text-muted)', marginBottom:'0.25rem'}}>
                      Historial de Mediciones ({item.measurements.length})
                    </div>
                    <div style={{maxHeight:'70px', overflowY:'auto'}}>
                      {item.measurements.slice().reverse().map((m, i) => (
                        <div key={i} style={{fontSize:'0.7rem', display:'flex', flexDirection:'column', padding:'0.25rem 0', borderBottom:'1px dashed var(--border-color)'}}>
                          <div style={{display:'flex', justifyContent:'space-between'}}>
                            <span style={{color: 'var(--text-secondary)'}}>{m.date}</span>
                            <span style={{color: m.qualitative === 'Cumple' ? 'var(--success)' : 'var(--danger)'}}>
                              <strong>{m.quantitative}{item.unit}</strong> ({m.qualitative})
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

      {/* COMBINED OBJECTIVE FORM MODAL */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingItem ? "Editar Objetivo Estratégico (BSC & ISO 6.2)" : "Nuevo Objetivo Estratégico (BSC & ISO 6.2)"}
      >
        <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Perspectiva Estratégica</label>
              <select className="form-control" value={formData.perspective} onChange={e => setFormData({...formData, perspective: e.target.value})} required>
                <option value="Financiera">Financiera</option>
                <option value="Clientes">Clientes</option>
                <option value="Procesos">Procesos</option>
                <option value="Aprendizaje">Aprendizaje</option>
              </select>
            </div>
            
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Sistema o Proceso HSEQ</label>
              <select className="form-control" value={formData.system} onChange={e => setFormData({...formData, system: e.target.value})} required>
                {systems.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Nombre del Objetivo</label>
            <input type="text" className="form-control" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="Ej: Reducir accidentes laborales" />
          </div>

          <div className="form-group">
            <label className="form-label">Indicador Clave (KPI)</label>
            <input type="text" className="form-control" value={formData.kpi} onChange={e => setFormData({...formData, kpi: e.target.value})} required placeholder="Ej: Tasa de Accidentalidad" />
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
              <label className="form-label">Meta Cuantitativa</label>
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
            <h4 style={{fontSize:'0.85rem', color:'var(--accent-primary)', marginBottom:'0.75rem', fontWeight: 700}}>Planificación de Acción HSEQ (ISO 6.2.2)</h4>
            
            <div className="form-group">
              <label className="form-label">¿Qué se va a hacer? (Acción principal)</label>
              <textarea className="form-control" value={formData.what} onChange={e => setFormData({...formData, what: e.target.value})} required rows="2" placeholder="Describa la acción a realizar..."></textarea>
            </div>
            
            <div style={{display:'grid', gridTemplateColumns: '1fr 1fr', gap:'1rem', marginTop: '0.5rem'}}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">¿Qué recursos se requieren?</label>
                <input type="text" className="form-control" value={formData.resources} onChange={e => setFormData({...formData, resources: e.target.value})} required placeholder="Presupuesto, insumos..." />
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
                <input type="text" className="form-control" value={formData.how} onChange={e => setFormData({...formData, how: e.target.value})} required placeholder="Ej: Revisión mensual, auditoría..." />
              </div>
            </div>
          </div>

          <div style={{display:'flex', gap:'1rem', marginTop: '0.5rem'}}>
            <div className="form-group" style={{flex:1, margin: 0}}>
              <label className="form-label">Origen de la Meta</label>
              <input type="text" className="form-control" value={formData.origin} onChange={e => setFormData({...formData, origin: e.target.value})} required placeholder="PESTAL, Partes interesadas..." />
            </div>
            <div className="form-group" style={{flex:1, margin: 0}}>
              <label className="form-label">Evidencia de Medición</label>
              <input type="text" className="form-control" value={formData.evidence} onChange={e => setFormData({...formData, evidence: e.target.value})} required placeholder="Facturas, certificados, actas..." />
            </div>
          </div>

          <div style={{display:'flex', justifyContent:'flex-end', gap:'0.5rem', marginTop:'1rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem'}}>
            <button type="button" className="btn-secondary" onClick={handleCloseModal}>Cancelar</button>
            <button type="submit" className="btn-primary">{editingItem ? "Actualizar" : "Guardar"}</button>
          </div>
        </form>
      </Modal>

      {/* MONTHLY LOG MODAL */}
      <Modal
        isOpen={isMonthlyModalOpen}
        onClose={() => setIsMonthlyModalOpen(false)}
        title={`Registro de Log Mensual: ${selectedBscItem?.kpi}`}
      >
        <form onSubmit={handleSaveMonthlyValues} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
            Ingrese los valores correspondientes para cada mes. La tasa promedio o acumulada HSEQ se recalculará automáticamente.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginTop: '0.5rem' }}>
            {monthsLabel.map((month, idx) => (
              <div key={month} className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.2rem' }}>{month}</label>
                <input 
                  type="number" 
                  step="any"
                  className="form-control" 
                  style={{ padding: '0.3rem 0.5rem', fontSize: '0.85rem' }}
                  value={monthlyInputs[idx] || 0}
                  onChange={e => {
                    const newInputs = [...monthlyInputs];
                    newInputs[idx] = Number(e.target.value);
                    setMonthlyInputs(newInputs);
                  }}
                  required
                />
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
            <button type="button" className="btn-secondary" onClick={() => setIsMonthlyModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn-primary">Guardar Historial</button>
          </div>
        </form>
      </Modal>

      {/* REGISTRAR MEDICIÓN MODAL */}
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

          <div style={{display:'flex', justifyContent:'flex-end', gap:'0.5rem', marginTop:'1.25rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem'}}>
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
