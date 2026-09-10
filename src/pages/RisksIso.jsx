import React, { useState, useEffect, useMemo } from 'react';
import { Clock, Plus, Filter, Edit2, Trash2, Download, AlertTriangle, Paperclip, Upload, ShieldCheck, FileText, ClipboardList, CheckCircle, Archive } from 'lucide-react';
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

export default function RisksIso() {
  const APP_USERS = useAppUsers();
  const [globalParams] = useLocalStorage('sgi_global_parameters', DEFAULT_PARAMS);
  const currentParams = {
    projectTypes: globalParams?.projectTypes || DEFAULT_PARAMS.projectTypes,
    clients: globalParams?.clients || DEFAULT_PARAMS.clients,
    cities: globalParams?.cities || DEFAULT_PARAMS.cities
  };

  const [meta, setMeta] = useLocalStorage('sgi_risks_iso_meta', {
    version: 1,
    validity: '2026-12-31',
    lastUpdated: '2026-06-18'
  });

  const [risksIsoHistory, setRisksIsoHistory] = useLocalStorage('sgi_risks_iso_history', [
    { version: '01', date: '2025-01-10', changes: 'Emisión Inicial de la Matriz de Riesgos ISO 31000.' }
  ]);

  const [oppsIsoHistory, setOppsIsoHistory] = useLocalStorage('sgi_opps_iso_history', [
    { version: '01', date: '2025-01-10', changes: 'Emisión Inicial de la Matriz de Oportunidades ISO 9001.' }
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
  
  // Tab activa: 'riesgos' o 'oportunidades'
  const [activeTab, setActiveTab] = useState('riesgos');

  // Matriz de Riesgos (ISO 31000 - Tradicional)
  const [risks, setRisks] = useLocalStorage('sgi_risks_iso', [
    { id: 1, process: 'Gestión Comercial', description: 'Pérdida de clientes por competidores', category: 'Legal y Contractual', prob: 3, impact: 4, score: 12, treatment: 'Fidelización y campañas', causes: 'Guerra de precios', causeOrigin: 'Externo', consequences: 'Disminución de ingresos', time: '3 meses', cost: '$5M', responsible: 'Dir. Comercial', evidence: 'Plan de fidelización', evidenceFile: 'plan_fidelizacion_2026.pdf', treatmentStatus: 'En Proceso', projectType: 'Eléctrico', client: 'Consorcio Vial del Norte', city: 'Bogotá' },
    { id: 2, process: 'Producción / Operación', description: 'Derrame de sustancias', category: 'Ambiental', prob: 2, impact: 5, score: 10, treatment: 'Bandejas antiderrame', causes: 'Mala manipulación', causeOrigin: 'Interno', consequences: 'Contaminación suelo', time: '1 mes', cost: '$2M', responsible: 'Coord. Ambiental', evidence: 'Fotos de bandejas instaladas', evidenceFile: 'evidencia_bandejas.jpg', treatmentStatus: 'Implementado', projectType: 'Civil', client: 'Ecopetrol', city: 'Cali' }
  ]);

  // Matriz de Oportunidades (ISO 9001 - Nueva Metodología)
  const [opportunities, setOpportunities] = useLocalStorage('sgi_opportunities_iso', [
    { id: 1, process: 'Comercial y Ventas', description: 'Expansión a nuevos mercados en LATAM mediante e-commerce', category: 'Crecimiento de Mercado', feasibility: 4, benefit: 5, score: 20, exploitationStrategy: 'Explotar', causes: 'Incremento de demanda digital', causeOrigin: 'Externo', consequences: 'Aumento de cuota de mercado en 15%', time: '6 meses', cost: '$12M', responsible: 'Dir. Comercial', evidence: 'Estudio de mercado y plan comercial', evidenceFile: 'plan_comercial_latam.pdf', treatmentStatus: 'En Explotación', projectType: 'Telecomunicaciones', client: 'Claro', city: 'Medellín' },
    { id: 2, process: 'Gestión de Calidad', description: 'Automatización de reportes HSEQ con IA para reducir tiempos de digitación', category: 'Innovación Tecnológica', feasibility: 3, benefit: 4, score: 12, exploitationStrategy: 'Mejorar/Incrementar', causes: 'Disponibilidad de herramientas no-code', causeOrigin: 'Interno', consequences: 'Ahorro de 20 horas mensuales por analista', time: '2 meses', cost: '$3M', responsible: 'Gestor Calidad', evidence: 'Prototipo aprobado e instalado', evidenceFile: 'demo_automatizacion.png', treatmentStatus: 'En Evaluación', projectType: 'Industrial', client: 'Movistar', city: 'Barranquilla' }
  ]);

  const [filter, setFilter] = useState('Todos');
  const [selectedRiskId, setSelectedRiskId] = useState(null);
  const [selectedOppId, setSelectedOppId] = useState(null);
  const [detailTab, setDetailTab] = useState('detail'); // detail, treatment
  
  const [riskFollowUpForm, setRiskFollowUpForm] = useState({
    treatmentStatus: 'En Proceso',
    evidence: '',
    evidenceFile: null
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Formulario único reactivo
  const [formData, setFormData] = useState({
    process: 'Direccionamiento Estratégico', description: '', category: 'SST', prob: 1, impact: 1, 
    feasibility: 1, benefit: 1, exploitationStrategy: 'Explotar',
    treatment: '', causes: '', causeOrigin: 'Interno', consequences: '', time: '', cost: '', responsible: '', evidence: '',
    evidenceFile: null, treatmentStatus: 'Pendiente',
    projectType: '', client: '', city: ''
  });

  const [availableProcesses, setAvailableProcesses] = useState(['Direccionamiento Estratégico', 'Gestión de Calidad', 'Comercial y Ventas', 'Producción / Operación', 'Talento Humano', 'Gestión TI']);

  useEffect(() => {
    const saved = localStorage.getItem('sgi_processes');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.length > 0) {
        setAvailableProcesses(parsed.map(p => p.name));
      }
    }
  }, []);

  // Auto-seleccionar primer elemento al cambiar/cargar
  useEffect(() => {
    if (risks.length > 0 && !selectedRiskId) {
      setSelectedRiskId(risks[0].id);
    }
  }, [risks, selectedRiskId]);

  useEffect(() => {
    if (opportunities.length > 0 && !selectedOppId) {
      setSelectedOppId(opportunities[0].id);
    }
  }, [opportunities, selectedOppId]);

  // Normalización para evitar errores de consistencia en registros viejos
  const normalizedRisks = useMemo(() => risks.map(r => ({
    ...r,
    evidenceFile: r.evidenceFile || null,
    treatmentStatus: r.treatmentStatus || 'Pendiente'
  })), [risks]);

  const normalizedOpps = useMemo(() => opportunities.map(o => ({
    ...o,
    feasibility: o.feasibility || 1,
    benefit: o.benefit || 1,
    exploitationStrategy: o.exploitationStrategy || 'Explotar',
    evidenceFile: o.evidenceFile || null,
    treatmentStatus: o.treatmentStatus || 'Identificada'
  })), [opportunities]);

  const selectedRisk = useMemo(() => normalizedRisks.find(r => r.id === selectedRiskId), [normalizedRisks, selectedRiskId]);
  const selectedOpp = useMemo(() => normalizedOpps.find(o => o.id === selectedOppId), [normalizedOpps, selectedOppId]);

  const selectedItem = activeTab === 'riesgos' ? selectedRisk : selectedOpp;

  // Sincronizar formulario de seguimiento cuando cambia el item seleccionado o la pestaña
  useEffect(() => {
    if (activeTab === 'riesgos' && selectedRisk) {
      setRiskFollowUpForm({
        treatmentStatus: selectedRisk.treatmentStatus || 'Pendiente',
        evidence: selectedRisk.evidence || '',
        evidenceFile: selectedRisk.evidenceFile || null
      });
    } else if (activeTab === 'oportunidades' && selectedOpp) {
      setRiskFollowUpForm({
        treatmentStatus: selectedOpp.treatmentStatus || 'Identificada',
        evidence: selectedOpp.evidence || '',
        evidenceFile: selectedOpp.evidenceFile || null
      });
    }
  }, [selectedRisk, selectedOpp, activeTab]);

  const riskCategories = ['SST', 'Ambiental', 'PESV', 'Legal y Contractual'];
  const oppCategories = ['Crecimiento de Mercado', 'Innovación Tecnológica', 'Eficiencia de Procesos', 'Mejora de Producto/Servicio', 'Alianzas Estratégicas'];

  const filteredRisks = filter === 'Todos' ? normalizedRisks : normalizedRisks.filter(r => r.process === filter);
  const filteredOpps = filter === 'Todos' ? normalizedOpps : normalizedOpps.filter(o => o.process === filter);

  // Métricas del Dashboard Superior
  // 1. Riesgos
  const totalRisks = normalizedRisks.length;
  const highRisksCount = normalizedRisks.filter(r => r.score > 9).length;
  const medRisksCount = normalizedRisks.filter(r => r.score > 4 && r.score <= 9).length;
  const lowRisksCount = normalizedRisks.filter(r => r.score <= 4).length;

  // 2. Oportunidades
  const totalOpps = normalizedOpps.length;
  const highOppsCount = normalizedOpps.filter(o => o.score >= 10).length;
  const exploOppsCount = normalizedOpps.filter(o => o.treatmentStatus === 'En Explotación').length;
  const doneOppsCount = normalizedOpps.filter(o => o.treatmentStatus === 'Aprovechada').length;

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({ 
        ...item,
        treatmentStatus: item.treatmentStatus || (activeTab === 'riesgos' ? 'Pendiente' : 'Identificada'),
        evidenceFile: item.evidenceFile || null,
        feasibility: item.feasibility || 1,
        benefit: item.benefit || 1,
        exploitationStrategy: item.exploitationStrategy || 'Explotar'
      });
    } else {
      setEditingItem(null);
      setFormData({ 
        process: 'Direccionamiento Estratégico', 
        projectType: currentParams.projectTypes[0] || '',
        client: currentParams.clients[0] || '',
        city: currentParams.cities[0] || '',
        description: '', 
        category: activeTab === 'riesgos' ? 'SST' : 'Eficiencia de Procesos', 
        prob: 1, 
        impact: 1, 
        feasibility: 1,
        benefit: 1,
        exploitationStrategy: 'Explotar',
        treatment: '', 
        causes: '', 
        causeOrigin: 'Interno', 
        consequences: '', 
        time: '', 
        cost: '', 
        responsible: APP_USERS[0]?.name || '', 
        evidence: '',
        treatmentStatus: activeTab === 'riesgos' ? 'Pendiente' : 'Identificada', 
        evidenceFile: null
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (activeTab === 'riesgos') {
      const score = formData.prob * formData.impact;
      const dataToSave = { ...formData, score };
      if (editingItem) {
        setRisks(risks.map(r => r.id === editingItem.id ? { ...dataToSave, id: r.id } : r));
      } else {
        const newId = Date.now();
        setRisks([...risks, { ...dataToSave, id: newId }]);
        setSelectedRiskId(newId);
      }
    } else {
      const score = formData.feasibility * formData.benefit;
      const dataToSave = { ...formData, score };
      if (editingItem) {
        setOpportunities(opportunities.map(o => o.id === editingItem.id ? { ...dataToSave, id: o.id } : o));
      } else {
        const newId = Date.now();
        setOpportunities([...opportunities, { ...dataToSave, id: newId }]);
        setSelectedOppId(newId);
      }
    }
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Está seguro de eliminar este registro?")) {
      if (activeTab === 'riesgos') {
        const remaining = risks.filter(r => r.id !== id);
        setRisks(remaining);
        if (selectedRiskId === id) {
          setSelectedRiskId(remaining[0]?.id || null);
        }
      } else {
        const remaining = opportunities.filter(o => o.id !== id);
        setOpportunities(remaining);
        if (selectedOppId === id) {
          setSelectedOppId(remaining[0]?.id || null);
        }
      }
    }
  };

  const handleSaveRiskEvidence = (e) => {
    e.preventDefault();
    if (activeTab === 'riesgos') {
      if (!selectedRiskId) return;
      setRisks(risks.map(r => {
        if (r.id === selectedRiskId) {
          return {
            ...r,
            treatmentStatus: riskFollowUpForm.treatmentStatus,
            evidence: riskFollowUpForm.evidence,
            evidenceFile: riskFollowUpForm.evidenceFile
          };
        }
        return r;
      }));
    } else {
      if (!selectedOppId) return;
      setOpportunities(opportunities.map(o => {
        if (o.id === selectedOppId) {
          return {
            ...o,
            treatmentStatus: riskFollowUpForm.treatmentStatus,
            evidence: riskFollowUpForm.evidence,
            evidenceFile: riskFollowUpForm.evidenceFile
          };
        }
        return o;
      }));
    }
    alert("[HSEQ] Registro de avance y evidencia actualizados con éxito.");
  };

  const handleInlineRiskFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setRiskFollowUpForm({ ...riskFollowUpForm, evidenceFile: file.name });
    }
  };

  const handleExport = () => {
    if (activeTab === 'riesgos') {
      const cols = [
        { header: 'Proceso', key: 'process' },
        { header: 'Descripción del Riesgo', key: 'description' },
        { header: 'Categoría', key: 'category' },
        { header: 'Probabilidad', key: 'prob' },
        { header: 'Impacto', key: 'impact' },
        { header: 'Nivel de Riesgo', key: 'score' },
        { header: 'Medida de Tratamiento', key: 'treatment' },
        { header: 'Causas', key: 'causes' },
        { header: 'Origen de la Causa', key: 'causeOrigin' },
        { header: 'Consecuencias', key: 'consequences' },
        { header: 'Responsable', key: 'responsible' },
        { header: 'Estado de Tratamiento', key: 'treatmentStatus' }
      ];
      setExportConfig({
        isOpen: true,
        exportType: 'excel',
        title: 'Matriz General de Riesgos (ISO 31000)',
        code: 'SGI-MAT-RSK-001',
        version: `0${meta.version}`,
        validity: meta.validity,
        columns: cols,
        data: normalizedRisks,
        history: risksIsoHistory
      });
    } else {
      const cols = [
        { header: 'Proceso', key: 'process' },
        { header: 'Descripción de la Oportunidad', key: 'description' },
        { header: 'Categoría', key: 'category' },
        { header: 'Factibilidad', key: 'feasibility' },
        { header: 'Beneficio', key: 'benefit' },
        { header: 'Puntaje Priorización', key: 'score' },
        { header: 'Estrategia de Explotación', key: 'exploitationStrategy' },
        { header: 'Causas', key: 'causes' },
        { header: 'Consecuencias/Beneficios', key: 'consequences' },
        { header: 'Responsable', key: 'responsible' },
        { header: 'Estado de Explotación', key: 'treatmentStatus' }
      ];
      setExportConfig({
        isOpen: true,
        exportType: 'excel',
        title: 'Matriz de Oportunidades (ISO 9001)',
        code: 'SGI-MAT-OPP-001',
        version: `0${meta.version}`,
        validity: meta.validity,
        columns: cols,
        data: normalizedOpps,
        history: oppsIsoHistory
      });
    }
  };

  const handleNewVersion = () => {
    const matrixName = activeTab === 'riesgos' ? 'Riesgos' : 'Oportunidades';
    const changeReason = window.prompt(`Ingrese el motivo del cambio para la versión 0${meta.version} de la Matriz de ${matrixName}:`);
    if (!changeReason) {
      alert("Se requiere un motivo del cambio para archivar e incrementar la versión.");
      return;
    }

    const currentVersionStr = `0${meta.version}`;
    const nextVersionVal = meta.version + 1;

    const obsoleteDoc = {
      id: Date.now(),
      code: activeTab === 'riesgos' ? `RSK-V${meta.version}` : `OPP-V${meta.version}`,
      name: `Matriz de ${matrixName} ISO V${meta.version}`,
      type: 'Matriz',
      version: `V.${currentVersionStr}`,
      date: meta.lastUpdated,
      status: 'Obsoleto'
    };

    const existingDocs = JSON.parse(localStorage.getItem('sgi_docs') || '[]');
    existingDocs.push(obsoleteDoc);
    localStorage.setItem('sgi_docs', JSON.stringify(existingDocs));

    const newHistoryEntry = {
      version: currentVersionStr,
      date: meta.lastUpdated,
      changes: changeReason
    };

    if (activeTab === 'riesgos') {
      setRisksIsoHistory([...risksIsoHistory, newHistoryEntry]);
    } else {
      setOppsIsoHistory([...oppsIsoHistory, newHistoryEntry]);
    }

    setMeta({
      version: nextVersionVal,
      validity: meta.validity,
      lastUpdated: new Date().toISOString().split('T')[0]
    });
    alert(`Matriz de ${matrixName} V.${currentVersionStr} guardada con éxito en el histórico de Obsoletos. Iniciando versión 0${nextVersionVal}`);
  };

  return (
    <>
      <style>{`
        .risk-row {
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        .risk-row:hover {
          background-color: var(--bg-secondary) !important;
        }
        .risk-row.active {
          background-color: var(--bg-tertiary) !important;
          border-left: 4px solid var(--accent-primary) !important;
        }
      `}</style>

      {/* Título y Acciones superiores */}
      <div style={{display:'flex', justifyContent:'space-between', marginBottom:'1.5rem', alignItems:'center', flexWrap:'wrap', gap:'1rem'}}>
        <div>
          <p style={{color:'var(--text-secondary)', marginBottom:'0.25rem'}}>
            {activeTab === 'riesgos' ? 'Matriz General de Riesgos (ISO 31000)' : 'Matriz de Oportunidades y Planes de Explotación (ISO 9001)'}
          </p>
          <span className="badge badge-info">
            <Clock size={12} style={{marginRight:'4px'}}/> Última actualización: {meta.lastUpdated} | Versión: 0{meta.version}
          </span>
        </div>
        <div style={{display:'flex', gap:'0.5rem', flexWrap:'wrap'}}>
          <button className="btn-secondary" onClick={handleExport}>
            <Download size={16}/> Exportar Excel
          </button>
          <button className="btn-secondary" onClick={handleNewVersion} style={{color:'var(--warning)', borderColor:'var(--warning)'}}>
            <Archive size={16} style={{marginRight:'4px'}}/> Archivar Versión
          </button>
          <button className="btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={16}/> {activeTab === 'riesgos' ? 'Registrar Riesgo' : 'Registrar Oportunidad'}
          </button>
        </div>
      </div>

      {/* Conmutador de Pestañas Premium */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem', paddingBottom: '0.25rem' }}>
        <button
          className={`btn-secondary ${activeTab === 'riesgos' ? 'active' : ''}`}
          style={{
            border: 'none',
            borderBottom: activeTab === 'riesgos' ? '3px solid var(--accent-primary)' : '3px solid transparent',
            borderRadius: '0',
            padding: '0.75rem 1.5rem',
            fontSize: '0.95rem',
            fontWeight: 600,
            background: 'transparent',
            color: activeTab === 'riesgos' ? 'var(--text-primary)' : 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onClick={() => setActiveTab('riesgos')}
        >
          <AlertTriangle size={18} style={{ color: 'var(--danger)' }} />
          Matriz de Riesgos
        </button>
        <button
          className={`btn-secondary ${activeTab === 'oportunidades' ? 'active' : ''}`}
          style={{
            border: 'none',
            borderBottom: activeTab === 'oportunidades' ? '3px solid var(--accent-primary)' : '3px solid transparent',
            borderRadius: '0',
            padding: '0.75rem 1.5rem',
            fontSize: '0.95rem',
            fontWeight: 600,
            background: 'transparent',
            color: activeTab === 'oportunidades' ? 'var(--text-primary)' : 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onClick={() => setActiveTab('oportunidades')}
        >
          <CheckCircle size={18} style={{ color: 'var(--success)' }} />
          Matriz de Oportunidades HSEQ
        </button>
      </div>

      {/* Dashboard Superior Adaptativo */}
      {activeTab === 'riesgos' ? (
        <div className="grid-4" style={{marginBottom:'1.5rem'}}>
          <div className="card" style={{marginBottom:0, borderLeft:'4px solid var(--accent-primary)', padding:'1.25rem'}}>
            <div style={{fontSize:'0.8rem', color:'var(--text-secondary)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.5rem'}}>Riesgos Totales</div>
            <div style={{fontSize:'2rem', fontWeight:700}}>{totalRisks}</div>
          </div>
          <div className="card" style={{marginBottom:0, borderLeft:'4px solid var(--danger)', padding:'1.25rem'}}>
            <div style={{fontSize:'0.8rem', color:'var(--text-secondary)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.5rem'}}>Alto / Inaceptable</div>
            <div style={{fontSize:'2rem', fontWeight:700, color:'var(--danger)'}}>{highRisksCount}</div>
          </div>
          <div className="card" style={{marginBottom:0, borderLeft:'4px solid var(--warning)', padding:'1.25rem'}}>
            <div style={{fontSize:'0.8rem', color:'var(--text-secondary)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.5rem'}}>Medio</div>
            <div style={{fontSize:'2rem', fontWeight:700, color:'var(--warning)'}}>{medRisksCount}</div>
          </div>
          <div className="card" style={{marginBottom:0, borderLeft:'4px solid var(--success)', padding:'1.25rem'}}>
            <div style={{fontSize:'0.8rem', color:'var(--text-secondary)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.5rem'}}>Bajo / Aceptable</div>
            <div style={{fontSize:'2rem', fontWeight:700, color:'var(--success)'}}>{lowRisksCount}</div>
          </div>
        </div>
      ) : (
        <div className="grid-4" style={{marginBottom:'1.5rem'}}>
          <div className="card" style={{marginBottom:0, borderLeft:'4px solid var(--accent-primary)', padding:'1.25rem'}}>
            <div style={{fontSize:'0.8rem', color:'var(--text-secondary)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.5rem'}}>Oportunidades Totales</div>
            <div style={{fontSize:'2rem', fontWeight:700}}>{totalOpps}</div>
          </div>
          <div className="card" style={{marginBottom:0, borderLeft:'4px solid var(--info)', padding:'1.25rem'}}>
            <div style={{fontSize:'0.8rem', color:'var(--text-secondary)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.5rem'}}>Prioridad Alta</div>
            <div style={{fontSize:'2rem', fontWeight:700, color:'var(--accent-primary)'}}>{highOppsCount}</div>
          </div>
          <div className="card" style={{marginBottom:0, borderLeft:'4px solid var(--warning)', padding:'1.25rem'}}>
            <div style={{fontSize:'0.8rem', color:'var(--text-secondary)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.5rem'}}>En Explotación</div>
            <div style={{fontSize:'2rem', fontWeight:700, color:'var(--warning)'}}>{exploOppsCount}</div>
          </div>
          <div className="card" style={{marginBottom:0, borderLeft:'4px solid var(--success)', padding:'1.25rem'}}>
            <div style={{fontSize:'0.8rem', color:'var(--text-secondary)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.5rem'}}>Aprovechadas</div>
            <div style={{fontSize:'2rem', fontWeight:700, color:'var(--success)'}}>{doneOppsCount}</div>
          </div>
        </div>
      )}

      {/* Filtro por Proceso */}
      <div className="card" style={{marginBottom:'1.5rem', padding:'0.75rem 1.5rem', display:'flex', alignItems:'center', gap:'0.75rem', flexWrap:'wrap'}}>
        <span style={{fontSize:'0.85rem', fontWeight:600, color:'var(--text-secondary)'}}><Filter size={14} style={{verticalAlign:'middle', marginRight:'4px'}}/> Filtro Proceso:</span>
        <button 
          onClick={() => setFilter('Todos')} 
          style={{padding:'0.35rem 0.75rem', borderRadius:'9999px', fontSize:'0.8rem', fontWeight:600, border:`2px solid ${'Todos' === filter ? 'var(--accent-primary)' : 'var(--border-color)'}`, background: 'Todos' === filter ? 'var(--accent-primary)' : 'var(--bg-secondary)', color: 'Todos' === filter ? 'white' : 'var(--text-secondary)', cursor:'pointer', transition:'all 0.2s'}}
        >Todos</button>
        {availableProcesses.map(p => (
          <button 
            key={p} 
            onClick={() => setFilter(p)} 
            style={{padding:'0.35rem 0.75rem', borderRadius:'9999px', fontSize:'0.8rem', fontWeight:600, border:`2px solid ${p === filter ? 'var(--accent-primary)' : 'var(--border-color)'}`, background: p === filter ? 'var(--accent-primary)' : 'var(--bg-secondary)', color: p === filter ? 'white' : 'var(--text-secondary)', cursor:'pointer', transition:'all 0.2s'}}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Tabla según la pestaña activa */}
      {activeTab === 'riesgos' ? (
        <div className="card" style={{padding:0, overflow:'hidden'}}>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Proceso</th>
                  <th>Riesgo / Categoría</th>
                  <th>Causas y Consecuencias</th>
                  <th title="Valoración (Probabilidad x Impacto)">Val.</th>
                  <th>Medida de Control / Tratamiento</th>
                  <th>Responsable</th>
                  <th>Evidencia de Cumplimiento</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredRisks.length === 0 ? (
                  <tr><td colSpan="8" style={{textAlign:'center', padding:'2rem'}}>No hay registros de riesgos.</td></tr>
                ) : filteredRisks.map(r => {
                  let badge = 'badge-info';
                  if (r.score > 9) badge = 'badge-danger';
                  else if (r.score > 4) badge = 'badge-warning';
                  else badge = 'badge-success';

                  return (
                    <tr 
                      key={r.id}
                      className={`risk-row ${r.id === selectedRiskId ? 'active' : ''}`}
                      onClick={() => setSelectedRiskId(r.id)}
                    >
                      <td style={{fontWeight:500}}>{r.process}</td>
                      <td style={{fontSize:'0.85rem'}}>
                        <strong>{r.description}</strong><br/>
                        <span className="badge badge-info" style={{marginTop:'0.25rem', display:'inline-block'}}>{r.category}</span>
                      </td>
                      <td style={{fontSize:'0.8rem'}}>
                        <div><strong>Origen:</strong> {r.causeOrigin}</div>
                        <div><strong>Causa:</strong> {r.causes}</div>
                        <div style={{color:'var(--danger)'}}><strong>Efecto:</strong> {r.consequences}</div>
                      </td>
                      <td style={{textAlign:'center'}}>
                        <span className={`badge ${badge}`} style={{fontSize:'1rem'}}>{r.score}</span>
                        <div style={{fontSize:'0.7rem', color:'var(--text-muted)', marginTop:'0.2rem'}}>P:{r.prob} I:{r.impact}</div>
                      </td>
                      <td style={{fontSize:'0.8rem', maxWidth:'200px'}}>
                        <strong>Acción:</strong> {r.treatment}<br/>
                        <span style={{fontSize:'0.75rem', color:'var(--text-secondary)'}}><Clock size={10} style={{verticalAlign:'middle', marginRight:'2px'}}/> {r.time}</span> | <span style={{fontSize:'0.75rem', color:'var(--success)'}}>{r.cost}</span>
                      </td>
                      <td style={{fontWeight:600, fontSize:'0.85rem'}}>{r.responsible}</td>
                      <td style={{fontSize:'0.8rem'}}>
                        <div style={{fontStyle:'italic', color:'var(--text-secondary)', marginBottom:'0.25rem'}}>{r.evidence}</div>
                        {r.evidenceFile ? (
                          <button 
                            className="btn-secondary" 
                            style={{padding:'0.2rem 0.5rem', fontSize:'0.72rem', display:'inline-flex', alignItems: 'center', gap:'3px'}}
                            onClick={(e) => {
                              e.stopPropagation();
                              alert(`Descargando evidencia de cumplimiento: ${r.evidenceFile}`);
                            }}
                          >
                            <Paperclip size={11}/> {r.evidenceFile}
                          </button>
                        ) : (
                          <span style={{fontSize:'0.75rem', color:'var(--text-muted)', fontStyle:'italic'}}>Sin soporte</span>
                        )}
                      </td>
                      <td>
                        <div style={{display:'flex', gap:'0.25rem'}} onClick={e => e.stopPropagation()}>
                          <button className="btn-icon" style={{padding:'0.25rem', color:'var(--text-muted)'}} title="Editar" onClick={() => handleOpenModal(r)}><Edit2 size={14}/></button>
                          <button className="btn-icon" style={{padding:'0.25rem', color:'var(--danger)'}} title="Eliminar" onClick={() => handleDelete(r.id)}><Trash2 size={14}/></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card" style={{padding:0, overflow:'hidden'}}>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Proceso</th>
                  <th>Oportunidad / Categoría</th>
                  <th>Causas y Beneficios</th>
                  <th title="Prioridad (Viabilidad x Beneficio)">Prioridad</th>
                  <th>Estrategia e Implementación</th>
                  <th>Responsable</th>
                  <th>Evidencia de Cumplimiento</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredOpps.length === 0 ? (
                  <tr><td colSpan="8" style={{textAlign:'center', padding:'2rem'}}>No hay registros de oportunidades.</td></tr>
                ) : filteredOpps.map(o => {
                  let badge = 'badge-success';
                  if (o.score >= 10) badge = 'badge-info';
                  else if (o.score >= 5) badge = 'badge-warning';

                  return (
                    <tr 
                      key={o.id}
                      className={`risk-row ${o.id === selectedOppId ? 'active' : ''}`}
                      onClick={() => setSelectedOppId(o.id)}
                    >
                      <td style={{fontWeight:500}}>{o.process}</td>
                      <td style={{fontSize:'0.85rem'}}>
                        <strong>{o.description}</strong><br/>
                        <span className="badge badge-info" style={{marginTop:'0.25rem', display:'inline-block'}}>{o.category}</span>
                      </td>
                      <td style={{fontSize:'0.8rem'}}>
                        <div><strong>Origen:</strong> {o.causeOrigin}</div>
                        <div><strong>Causa:</strong> {o.causes}</div>
                        <div style={{color:'var(--success)'}}><strong>Beneficio:</strong> {o.consequences}</div>
                      </td>
                      <td style={{textAlign:'center'}}>
                        <span className={`badge ${badge}`} style={{fontSize:'1rem'}}>{o.score}</span>
                        <div style={{fontSize:'0.7rem', color:'var(--text-muted)', marginTop:'0.2rem'}}>V:{o.feasibility} B:{o.benefit}</div>
                      </td>
                      <td style={{fontSize:'0.8rem', maxWidth:'200px'}}>
                        <div><strong>Estrategia:</strong> <span className="badge badge-secondary" style={{color:'var(--accent-primary)', background:'rgba(14, 165, 233, 0.1)'}}>{o.exploitationStrategy}</span></div>
                        <div style={{marginTop:'0.25rem'}}><strong>Plan:</strong> {o.treatment}</div>
                        <span style={{fontSize:'0.75rem', color:'var(--text-secondary)'}}><Clock size={10} style={{verticalAlign:'middle', marginRight:'2px'}}/> {o.time}</span> | <span style={{fontSize:'0.75rem', color:'var(--success)'}}>{o.cost}</span>
                      </td>
                      <td style={{fontWeight:600, fontSize:'0.85rem'}}>{o.responsible}</td>
                      <td style={{fontSize:'0.8rem'}}>
                        <div style={{fontStyle:'italic', color:'var(--text-secondary)', marginBottom:'0.25rem'}}>{o.evidence}</div>
                        {o.evidenceFile ? (
                          <button 
                            className="btn-secondary" 
                            style={{padding:'0.2rem 0.5rem', fontSize:'0.72rem', display:'inline-flex', alignItems: 'center', gap:'3px'}}
                            onClick={(e) => {
                              e.stopPropagation();
                              alert(`Descargando evidencia de cumplimiento: ${o.evidenceFile}`);
                            }}
                          >
                            <Paperclip size={11}/> {o.evidenceFile}
                          </button>
                        ) : (
                          <span style={{fontSize:'0.75rem', color:'var(--text-muted)', fontStyle:'italic'}}>Sin soporte</span>
                        )}
                      </td>
                      <td>
                        <div style={{display:'flex', gap:'0.25rem'}} onClick={e => e.stopPropagation()}>
                          <button className="btn-icon" style={{padding:'0.25rem', color:'var(--text-muted)'}} title="Editar" onClick={() => handleOpenModal(o)}><Edit2 size={14}/></button>
                          <button className="btn-icon" style={{padding:'0.25rem', color:'var(--danger)'}} title="Eliminar" onClick={() => handleDelete(o.id)}><Trash2 size={14}/></button>
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

      {/* FICHA DETALLADA INFERIOR REACTIVA */}
      {selectedItem && (
        <div className="card fade-in" style={{ marginTop: '1.5rem', padding: '1.25rem', borderLeft: `4px solid ${activeTab === 'riesgos' ? 'var(--danger)' : 'var(--success)'}`, marginBottom: '2rem' }}>
          
          {/* Cabecera Ficha */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <span className={`badge ${activeTab === 'riesgos' ? 'badge-danger' : 'badge-success'}`} style={{ marginBottom: '0.25rem', display: 'inline-block' }}>
                <ShieldCheck size={10} style={{ marginRight: '4px' }} /> 
                {activeTab === 'riesgos' ? 'Ficha de Gestión de Riesgo (ISO 31000)' : 'Ficha de Gestión de Oportunidad (ISO 9001)'}
              </span>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
                {selectedItem.description}
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Proceso: <strong>{selectedItem.process}</strong> | Categoría: <strong>{selectedItem.category}</strong>
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button className="btn-secondary" style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem' }} onClick={() => handleOpenModal(selectedItem)}>
                <Edit2 size={12} style={{ marginRight: '4px' }} /> Editar {activeTab === 'riesgos' ? 'Riesgo' : 'Oportunidad'}
              </button>
            </div>
          </div>

          {/* Navegación interna Ficha */}
          <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            <button 
              className={`btn-secondary ${detailTab === 'detail' ? 'active' : ''}`}
              style={{ border: 'none', fontSize: '0.8rem', padding: '0.3rem 0.6rem', background: detailTab === 'detail' ? 'rgba(14, 165, 233, 0.1)' : 'transparent', color: detailTab === 'detail' ? 'var(--accent-primary)' : 'var(--text-secondary)' }}
              onClick={() => setDetailTab('detail')}
            >
              <FileText size={12} style={{ marginRight: '3px' }} /> 
              {activeTab === 'riesgos' ? 'Diagnóstico y Análisis' : 'Diagnóstico y Viabilidad'}
            </button>
            <button 
              className={`btn-secondary ${detailTab === 'treatment' ? 'active' : ''}`}
              style={{ border: 'none', fontSize: '0.8rem', padding: '0.3rem 0.6rem', background: detailTab === 'treatment' ? 'rgba(16, 185, 129, 0.1)' : 'transparent', color: detailTab === 'treatment' ? 'var(--success)' : 'var(--text-secondary)' }}
              onClick={() => setDetailTab('treatment')}
            >
              <ClipboardList size={12} style={{ marginRight: '3px' }} /> 
              {activeTab === 'riesgos' ? 'Plan de Tratamiento y Evidencias' : 'Plan de Explotación y Seguimiento'}
            </button>
          </div>

          {/* CONTENIDO TAB 1: Diagnóstico */}
          {detailTab === 'detail' && (
            <div className="grid-2 fade-in" style={{ gap: '1.25rem' }}>
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                  {activeTab === 'riesgos' ? 'Análisis de Causa y Efecto' : 'Análisis de Causa y Beneficio'}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Causas Identificadas ({selectedItem.causeOrigin}):</span>
                    <strong style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}>{selectedItem.causes}</strong>
                  </div>
                  <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                      {activeTab === 'riesgos' ? 'Consecuencias / Impactos en el Sistema:' : 'Beneficios / Resultados Esperados:'}
                    </span>
                    <strong style={{ fontSize: '0.82rem', color: activeTab === 'riesgos' ? 'var(--danger)' : 'var(--success)' }}>
                      {selectedItem.consequences}
                    </strong>
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                  {activeTab === 'riesgos' ? 'Valoración del Riesgo' : 'Evaluación de la Oportunidad'}
                </h4>
                <div className="grid-2" style={{ gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
                  {activeTab === 'riesgos' ? (
                    <>
                      <div>Probabilidad (P): <strong>{selectedItem.prob} / 5</strong></div>
                      <div>Impacto (I): <strong>{selectedItem.impact} / 5</strong></div>
                    </>
                  ) : (
                    <>
                      <div>Viabilidad (V): <strong>{selectedItem.feasibility} / 5</strong></div>
                      <div>Beneficio Estratégico (B): <strong>{selectedItem.benefit} / 5</strong></div>
                    </>
                  )}
                  
                  <div style={{ gridColumn: 'span 2', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem', marginTop: '0.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{activeTab === 'riesgos' ? 'Nivel de Riesgo Evaluado:' : 'Puntaje de Prioridad:'}</span>
                    <span 
                      className={`badge ${
                        activeTab === 'riesgos' 
                          ? (selectedItem.score > 9 ? 'badge-danger' : selectedItem.score > 4 ? 'badge-warning' : 'badge-success')
                          : (selectedItem.score >= 10 ? 'badge-info' : selectedItem.score >= 5 ? 'badge-warning' : 'badge-success')
                      }`} 
                      style={{ fontSize: '0.9rem', padding: '0.2rem 0.6rem' }}
                    >
                      {selectedItem.score} - {
                        activeTab === 'riesgos' 
                          ? (selectedItem.score > 9 ? 'Alto / Crítico' : selectedItem.score > 4 ? 'Medio / Moderado' : 'Bajo / Aceptable')
                          : (selectedItem.score >= 10 ? 'Alta Prioridad' : selectedItem.score >= 5 ? 'Prioridad Media' : 'Baja Prioridad')
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CONTENIDO TAB 2: Plan e Implementación */}
          {detailTab === 'treatment' && (
            <div className="grid-2 fade-in" style={{ gap: '1.25rem' }}>
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                  {activeTab === 'riesgos' ? 'Medida de Control / Tratamiento' : 'Plan de Acción y Explotación'}
                </h4>
                <div style={{ background: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: '6px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {activeTab === 'oportunidades' && (
                    <div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Estrategia de Explotación (ISO 31000):</span>
                      <strong style={{ fontSize: '0.82rem', color: 'var(--accent-primary)' }}>{selectedItem.exploitationStrategy}</strong>
                    </div>
                  )}
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                      {activeTab === 'riesgos' ? 'Acción de Control Planificada:' : 'Acción Estratégica Planificada:'}
                    </span>
                    <strong style={{ fontSize: '0.82rem' }}>{selectedItem.treatment}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.4rem' }}>
                    <span>Plazo: <strong>{selectedItem.time}</strong></span>
                    <span>Presupuesto: <strong>{selectedItem.cost}</strong></span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                    <span>Responsable: <strong>{selectedItem.responsible}</strong></span>
                    <span>Estado: <strong style={{ 
                      color: selectedItem.treatmentStatus === 'Implementado' || selectedItem.treatmentStatus === 'Aprovechada' 
                        ? 'var(--success)' 
                        : selectedItem.treatmentStatus === 'En Proceso' || selectedItem.treatmentStatus === 'En Explotación' 
                        ? 'var(--accent-primary)' 
                        : selectedItem.treatmentStatus === 'En Evaluación'
                        ? 'var(--warning)'
                        : 'var(--text-muted)' 
                    }}>{selectedItem.treatmentStatus || (activeTab === 'riesgos' ? 'Pendiente' : 'Identificada')}</strong></span>
                  </div>
                </div>

                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', marginTop: '0.75rem', color: 'var(--text-secondary)' }}>Soporte de Evidencia</h4>
                {selectedItem.evidenceFile ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: 0 }}>
                      <Paperclip size={14} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={selectedItem.evidenceFile}>
                        {selectedItem.evidenceFile}
                      </span>
                    </div>
                    <button 
                      type="button" 
                      className="btn-secondary" 
                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
                      onClick={() => alert(`Descargando soporte de cumplimiento: "${selectedItem.evidenceFile}"`)}
                    >
                      Descargar
                    </button>
                  </div>
                ) : (
                  <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '6px', border: '1px dashed var(--border-color)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                    Sin evidencias digitales adjuntas.
                  </div>
                )}
              </div>

              {/* Formulario Interactivo de Avances */}
              <form onSubmit={handleSaveRiskEvidence} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '0.82rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: 'var(--accent-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem' }}>
                  {activeTab === 'riesgos' ? 'Registrar Avance y Evidencia' : 'Registrar Explotación y Avance'}
                </h4>
                
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.72rem' }}>Estado de la Gestión</label>
                  <select 
                    className="form-control" 
                    style={{ fontSize: '0.78rem', padding: '0.2rem' }}
                    value={riskFollowUpForm.treatmentStatus}
                    onChange={e => setRiskFollowUpForm({ ...riskFollowUpForm, treatmentStatus: e.target.value })}
                    required
                  >
                    {activeTab === 'riesgos' ? (
                      <>
                        <option value="Pendiente">Pendiente</option>
                        <option value="En Proceso">En Proceso</option>
                        <option value="Implementado">Implementado</option>
                      </>
                    ) : (
                      <>
                        <option value="Identificada">Identificada</option>
                        <option value="En Evaluación">En Evaluación</option>
                        <option value="En Explotación">En Explotación</option>
                        <option value="Aprovechada">Aprovechada</option>
                        <option value="Descartada">Descartada</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.72rem' }}>Descripción / Notas de Evidencia</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    style={{ fontSize: '0.78rem' }}
                    value={riskFollowUpForm.evidence}
                    onChange={e => setRiskFollowUpForm({ ...riskFollowUpForm, evidence: e.target.value })}
                    placeholder={activeTab === 'riesgos' ? "Ej. Registro fotográfico, plan de capacitación..." : "Ej. Informe de resultados, acta de alianzas..."}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.72rem' }}>Adjuntar Archivo de Soporte</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-primary)', padding: '0.35rem 0.5rem', borderRadius: '4px', border: '1px dashed var(--border-color)' }}>
                    <input 
                      type="file" 
                      id="file-risk-followup" 
                      style={{ display: 'none' }}
                      onChange={handleInlineRiskFileChange} 
                    />
                    <label htmlFor="file-risk-followup" className="btn-secondary" style={{ cursor: 'pointer', margin: 0, padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}>
                      <Upload size={12} style={{ marginRight: '3px' }} /> Cargar Evidencia
                    </label>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '150px' }}>
                      {riskFollowUpForm.evidenceFile || 'PDF, XLS, PNG...'}
                    </span>
                  </div>
                </div>

                <button type="submit" className="btn-primary" style={{ padding: '0.35rem 0.5rem', fontSize: '0.78rem', alignSelf: 'flex-end', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '0.25rem' }}>
                  <CheckCircle size={12} /> Guardar Avance
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* MODAL REGISTRO / EDICIÓN DINÁMICO */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingItem 
          ? (activeTab === 'riesgos' ? "Editar Riesgo ISO 31000" : "Editar Oportunidad ISO 9001") 
          : (activeTab === 'riesgos' ? "Registrar Riesgo ISO 31000" : "Registrar Oportunidad ISO 9001")
        }
      >
        <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', gap:'1rem', maxHeight:'75vh', overflowY:'auto', paddingRight:'0.5rem'}}>
          
          <div style={{borderBottom:'1px solid var(--border-color)', paddingBottom:'1rem', marginBottom:'0.5rem'}}>
            <h4 style={{fontSize:'0.9rem', color:'var(--accent-primary)', marginBottom:'1rem'}}>1. Identificación HSEQ</h4>
            <div style={{display:'flex', gap:'1rem'}}>
              <div className="form-group" style={{flex:1}}>
                <label className="form-label">Proceso Relacionado</label>
                <select className="form-control" value={formData.process} onChange={e => setFormData({...formData, process: e.target.value})} required>
                  {availableProcesses.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="form-group" style={{flex:1}}>
                <label className="form-label">Categoría</label>
                <select className="form-control" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required>
                  {activeTab === 'riesgos' 
                    ? riskCategories.map(c => <option key={c} value={c}>{c}</option>)
                    : oppCategories.map(c => <option key={c} value={c}>{c}</option>)
                  }
                </select>
              </div>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:'0.75rem', marginTop:'0.75rem'}}>
              <div className="form-group">
                <label className="form-label">Tipo de Proyecto</label>
                <select className="form-control" value={formData.projectType || ''} onChange={e => setFormData({...formData, projectType: e.target.value})}>
                  <option value="">-- Seleccionar Tipo --</option>
                  {currentParams.projectTypes.map(pt => <option key={pt} value={pt}>{pt}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Cliente / Razón Social</label>
                <select className="form-control" value={formData.client || ''} onChange={e => setFormData({...formData, client: e.target.value})}>
                  <option value="">-- Seleccionar Cliente --</option>
                  {currentParams.clients.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Ciudad de Operación</label>
                <select className="form-control" value={formData.city || ''} onChange={e => setFormData({...formData, city: e.target.value})}>
                  <option value="">-- Seleccionar Ciudad --</option>
                  {currentParams.cities.map(ct => <option key={ct} value={ct}>{ct}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group" style={{marginTop:'0.75rem'}}>
              <label className="form-label">{activeTab === 'riesgos' ? 'Descripción del Riesgo' : 'Descripción de la Oportunidad'}</label>
              <textarea className="form-control" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows="2" required placeholder={activeTab === 'riesgos' ? "Ej. Fugas de datos, fallos en la cadena..." : "Ej. Implementar nuevo canal de distribución..."}></textarea>
            </div>
          </div>

          <div style={{borderBottom:'1px solid var(--border-color)', paddingBottom:'1rem', marginBottom:'0.5rem'}}>
            <h4 style={{fontSize:'0.9rem', color:'var(--accent-primary)', marginBottom:'1rem'}}>
              {activeTab === 'riesgos' ? '2. Análisis de Causas y Consecuencias' : '2. Análisis de Causas y Beneficios'}
            </h4>
            <div style={{display:'flex', gap:'1rem'}}>
              <div className="form-group" style={{flex:1}}>
                <label className="form-label">Origen de la Causa</label>
                <select className="form-control" value={formData.causeOrigin} onChange={e => setFormData({...formData, causeOrigin: e.target.value})} required>
                  <option value="Interno">Interno</option>
                  <option value="Externo">Externo</option>
                </select>
              </div>
              <div className="form-group" style={{flex:2}}>
                <label className="form-label">Causas</label>
                <input type="text" className="form-control" value={formData.causes} onChange={e => setFormData({...formData, causes: e.target.value})} required placeholder="Ej: Avances tecnológicos, deficiencias operativas..." />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">
                {activeTab === 'riesgos' ? 'Consecuencias (Impacto negativo en el sistema)' : 'Beneficios / Resultados Esperados (Efecto positivo)'}
              </label>
              <input type="text" className="form-control" value={formData.consequences} onChange={e => setFormData({...formData, consequences: e.target.value})} required />
            </div>

            {/* Cuadro de Evaluación según metodología */}
            {activeTab === 'riesgos' ? (
              <div style={{display:'flex', gap:'1rem', marginTop:'1rem', background:'var(--bg-secondary)', padding:'1rem', borderRadius:'var(--radius-md)'}}>
                <div className="form-group" style={{flex:1, marginBottom:0}}>
                  <label className="form-label">Probabilidad (1-5)</label>
                  <input type="number" min="1" max="5" className="form-control" value={formData.prob} onChange={e => setFormData({...formData, prob: Number(e.target.value)})} required />
                </div>
                <div className="form-group" style={{flex:1, marginBottom:0}}>
                  <label className="form-label">Impacto (1-5)</label>
                  <input type="number" min="1" max="5" className="form-control" value={formData.impact} onChange={e => setFormData({...formData, impact: Number(e.target.value)})} required />
                </div>
                <div className="form-group" style={{flex:1, marginBottom:0}}>
                  <label className="form-label">Nivel de Riesgo</label>
                  <div style={{fontSize:'1.5rem', fontWeight:700, color: (formData.prob * formData.impact) > 9 ? 'var(--danger)' : (formData.prob * formData.impact) > 4 ? 'var(--warning)' : 'var(--success)', marginTop:'0.25rem'}}>
                    {formData.prob * formData.impact}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{display:'flex', gap:'1rem', marginTop:'1rem', background:'var(--bg-secondary)', padding:'1rem', borderRadius:'var(--radius-md)'}}>
                <div className="form-group" style={{flex:1, marginBottom:0}}>
                  <label className="form-label">Viabilidad (1-5)</label>
                  <input type="number" min="1" max="5" className="form-control" value={formData.feasibility} onChange={e => setFormData({...formData, feasibility: Number(e.target.value)})} required />
                </div>
                <div className="form-group" style={{flex:1, marginBottom:0}}>
                  <label className="form-label">Beneficio (1-5)</label>
                  <input type="number" min="1" max="5" className="form-control" value={formData.benefit} onChange={e => setFormData({...formData, benefit: Number(e.target.value)})} required />
                </div>
                <div className="form-group" style={{flex:1, marginBottom:0}}>
                  <label className="form-label">Puntaje Prioridad</label>
                  <div style={{fontSize:'1.5rem', fontWeight:700, color: (formData.feasibility * formData.benefit) >= 10 ? 'var(--accent-primary)' : (formData.feasibility * formData.benefit) >= 5 ? 'var(--warning)' : 'var(--success)', marginTop:'0.25rem'}}>
                    {formData.feasibility * formData.benefit}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <h4 style={{fontSize:'0.9rem', color:'var(--accent-primary)', marginBottom:'1rem'}}>
              {activeTab === 'riesgos' ? '3. Plan de Tratamiento' : '3. Estrategia y Plan de Explotación'}
            </h4>
            
            {activeTab === 'oportunidades' && (
              <div className="form-group">
                <label className="form-label">Estrategia de Explotación (ISO 31000)</label>
                <select className="form-control" value={formData.exploitationStrategy} onChange={e => setFormData({...formData, exploitationStrategy: e.target.value})} required>
                  <option value="Explotar">Explotar (Asegurar materialización)</option>
                  <option value="Compartir">Compartir (Asociación con terceros)</option>
                  <option value="Mejorar/Incrementar">Mejorar/Incrementar (Aumentar probabilidad/beneficio)</option>
                  <option value="Aceptar">Aceptar (Aprovechar si surge espontáneamente)</option>
                </select>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">
                {activeTab === 'riesgos' ? 'Acciones de Tratamiento / Control' : 'Plan de Acción / Actividades de Explotación'}
              </label>
              <textarea className="form-control" value={formData.treatment} onChange={e => setFormData({...formData, treatment: e.target.value})} rows="2" required></textarea>
            </div>
            <div style={{display:'flex', gap:'1rem'}}>
              <div className="form-group" style={{flex:1}}>
                <label className="form-label">Tiempo de Implementación</label>
                <input type="text" className="form-control" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} required placeholder="Ej: 3 meses, 2 Semanas..." />
              </div>
              <div className="form-group" style={{flex:1}}>
                <label className="form-label">Costos Estimados</label>
                <input type="text" className="form-control" value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} required placeholder="Ej: $10.000 USD, Ninguno" />
              </div>
            </div>
            <div style={{display:'flex', gap:'1rem'}}>
              <div className="form-group" style={{flex:1}}>
                <label className="form-label">Responsable de Gestión</label>
                <select className="form-control" value={formData.responsible} onChange={e => setFormData({...formData, responsible: e.target.value})} required>
                  <option value="">Seleccione Usuario...</option>
                  {APP_USERS.map(u => <option key={u.email} value={u.name}>{u.name}</option>)}
                </select>
              </div>
              <div className="form-group" style={{flex:1}}>
                <label className="form-label">Estado de la Gestión</label>
                <select className="form-control" value={formData.treatmentStatus} onChange={e => setFormData({...formData, treatmentStatus: e.target.value})} required>
                  {activeTab === 'riesgos' ? (
                    <>
                      <option value="Pendiente">Pendiente</option>
                      <option value="En Proceso">En Proceso</option>
                      <option value="Implementado">Implementado</option>
                    </>
                  ) : (
                    <>
                      <option value="Identificada">Identificada</option>
                      <option value="En Evaluación">En Evaluación</option>
                      <option value="En Explotación">En Explotación</option>
                      <option value="Aprovechada">Aprovechada</option>
                      <option value="Descartada">Descartada</option>
                    </>
                  )}
                </select>
              </div>
            </div>
            <div style={{display:'flex', gap:'1rem'}}>
              <div className="form-group" style={{flex:1}}>
                <label className="form-label">Evidencia de Avance / Soporte (Texto)</label>
                <input type="text" className="form-control" value={formData.evidence} onChange={e => setFormData({...formData, evidence: e.target.value})} required placeholder="Ej: Acta de cierre, contratos..." />
              </div>
              <div className="form-group" style={{flex:1}}>
                <label className="form-label">Cargar Soporte Documental (Archivo)</label>
                <div style={{display:'flex', alignItems:'center', gap:'0.5rem', background:'var(--bg-primary)', padding:'0.5rem', borderRadius:'var(--radius-sm)', border:'1px dashed var(--border-color)', height:'38px'}}>
                  <input type="file" id="file-modal-upload-risk" style={{display:'none'}} onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setFormData({...formData, evidenceFile: file.name});
                    }
                  }} />
                  <label htmlFor="file-modal-upload-risk" className="btn-secondary" style={{cursor:'pointer', margin:0, padding:'0.3rem 0.75rem', fontSize:'0.8rem'}}>
                    <Upload size={14} style={{marginRight:'4px'}}/> Cargar
                  </label>
                  <span style={{fontSize:'0.8rem', color:'var(--text-muted)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'120px'}} title={formData.evidenceFile || 'Ningún soporte'}>
                    {formData.evidenceFile || 'Sin archivo'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div style={{display:'flex', justifyContent:'flex-end', gap:'0.5rem', marginTop:'1rem', position:'sticky', bottom:0, background:'var(--bg-card)', paddingBottom:'0.5rem', paddingTop:'1rem', borderTop:'1px solid var(--border-color)'}}>
            <button type="button" className="btn-secondary" onClick={handleCloseModal}>Cancelar</button>
            <button type="submit" className="btn-primary">{editingItem ? "Actualizar Registro" : "Guardar"}</button>
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
