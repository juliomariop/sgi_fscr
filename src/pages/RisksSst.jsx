import React, { useState, useEffect, useMemo } from 'react';
import { Clock, Plus, Filter, Edit2, Trash2, Download, Archive, History, Upload, Paperclip, Calendar, User, Cloud, RefreshCw, CheckCircle, FileText, ClipboardList } from 'lucide-react';
import Modal from '../components/Modal';
import ExportModal from '../components/ExportModal';
import { downloadCSV } from '../utils/exportUtils';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAppUsers } from '../hooks/useAppUsers';
import { getOneDriveSettings, uploadFile } from '../services/oneDriveService';

const GTC45_CLASSIFICATION = {
  "Biológico": [
    "Virus",
    "Bacterias",
    "Hongos",
    "Ricketsias",
    "Parásitos",
    "Picaduras",
    "Mordeduras",
    "Fluidos o excrementos"
  ],
  "Físico": [
    "Ruido (de impacto, intermitente, continuo)",
    "Iluminación (luz visible por exceso o deficiencia)",
    "Vibración (cuerpo entero, segmentaria)",
    "Temperaturas extremas (calor y frío)",
    "Presión atmosférica (normal y ajustada)",
    "Radiaciones ionizantes (rayos x, gama, beta y alfa)",
    "Radiaciones no ionizantes (laser, ultravioleta, infrarroja, radiofrecuencia, microondas)"
  ],
  "Químico": [
    "Polvos orgánicos e inorgánicos",
    "Fibras",
    "Líquidos (nieblas y rocíos)",
    "Gases y vapores",
    "Humos metálicos y no metálicos",
    "Material particulado"
  ],
  "Psicosocial": [
    "Gestión organizacional (estilo de mando, pago, contratación, participación, inducción, capacitación, bienestar, cambios)",
    "Características de la organización del trabajo (comunicación, tecnología, demandas)",
    "Características del grupo social de trabajo (relaciones, cohesión, interacciones, trabajo en equipo)",
    "Condiciones de la tarea (carga mental, contenido, demandas emocionales, control, roles, monotonía)",
    "Interfaz persona - tarea (conocimientos, habilidades, iniciativa, autonomía, reconocimiento)",
    "Jornada de trabajo (pausas, trabajo nocturno, rotación, horas extras, descansos)"
  ],
  "Biomecánicos": [
    "Postura (prolongada, mantenida, forzada, anti gravitacional)",
    "Esfuerzo",
    "Movimiento repetitivo",
    "Manipulación manual de cargas"
  ],
  "Condiciones de seguridad": [
    "Mecánico (elementos o partes de máquinas, herramientas, equipos, piezas, materiales proyectados)",
    "Eléctrico (alta y baja tensión, estática)",
    "Locativo (almacenamiento, superficies de trabajo irregulares, deslizantes, desnivel, caídas)",
    "Tecnológico (explosión, fuga, derrame, incendio)",
    "Accidentes de tránsito",
    "Públicos (robos, atracos, asaltos, atentados, orden público, etc.)",
    "Trabajo en alturas",
    "Espacios confinados"
  ],
  "Fenómenos naturales": [
    "Sismo",
    "Terremoto",
    "Vendaval",
    "Inundación",
    "Derrumbe",
    "Precipitaciones (lluvias, granizadas, heladas)"
  ]
};

const getSubtypesForType = (type) => {
  if (!type) return [];
  const normalized = type.trim().toLowerCase();
  if (normalized.startsWith('biológico')) return GTC45_CLASSIFICATION["Biológico"];
  if (normalized.startsWith('físico')) return GTC45_CLASSIFICATION["Físico"];
  if (normalized.startsWith('químico')) return GTC45_CLASSIFICATION["Químico"];
  if (normalized.startsWith('psicosocial')) return GTC45_CLASSIFICATION["Psicosocial"];
  if (normalized.startsWith('biomecán')) return GTC45_CLASSIFICATION["Biomecánicos"];
  if (normalized.startsWith('condiciones')) return GTC45_CLASSIFICATION["Condiciones de seguridad"];
  if (normalized.startsWith('fenómenos')) return GTC45_CLASSIFICATION["Fenómenos naturales"];
  return [];
};

const DEFAULT_PARAMS = {
  projectTypes: ["Eléctrico", "Telecomunicaciones", "Civil", "Ambiental", "Industrial"],
  clients: ["Consorcio Vial del Norte", "Ecopetrol", "Claro", "Movistar"],
  cities: ["Bogotá", "Medellín", "Cali", "Barranquilla", "Bucaramanga"]
};

export default function RisksSst() {
  const APP_USERS = useAppUsers();
  const [globalParams] = useLocalStorage('sgi_global_parameters', DEFAULT_PARAMS);

  const [meta, setMeta] = useLocalStorage('sgi_risks_sst_meta', {
    version: 1,
    validity: '2026-12-31',
    lastUpdated: '2026-05-30'
  });

  const [risksSstHistory, setRisksSstHistory] = useLocalStorage('sgi_risks_sst_history', [
    { version: '01', date: '2025-01-10', changes: 'Emisión Inicial de la Matriz de Peligros y Riesgos GTC 45.' }
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

  const [risks, setRisks] = useLocalStorage('sgi_risks_sst', [
    { 
      id: 1, area: 'Planta Operativa', task: 'Mantenimiento Red Eléctrica', hazard: 'Contacto eléctrico directo', type: 'Condiciones de seguridad', gtcDescription: 'Eléctrico (alta y baja tensión, estática)', nd: 6, ne: 3, np: 18, nc: 60, nr: 1080, interpretation: 'I', controls: 'EPP Dieléctrico, Bloqueo de energías', controlResponsible: 'Supervisor Mantenimiento', complianceEvidence: 'Registro entrega EPP', complianceResponsible: 'Ing. SST',
      complianceDate: '2026-05-28',
      project: 'Proyecto Infraestructura Eléctrica',
      zoneCity: 'Planta Principal - Bogotá',
      client: 'Consorcio Vial del Norte',
      razonSocial: 'Consorcio Vial del Norte S.A.S.',
      exposedCount: 4,
      routine: 'Rutinaria',
      employeeParticipation: 'Sí',
      lastEvaluationDate: '2026-05-28',
      evidenceHistory: [
        {
          id: 101,
          fileName: 'EPP_Dielectrico_Firma.pdf',
          date: '2026-05-28',
          verifier: 'Ing. SST',
          description: 'Registro firmado de entrega de EPP dieléctrico'
        }
      ]
    },
    { 
      id: 2, area: 'Oficinas', task: 'Digitación', hazard: 'Posturas prolongadas', type: 'Biomecánicos', gtcDescription: 'Postura (prolongada, mantenida, forzada, anti gravitacional)', nd: 2, ne: 3, np: 6, nc: 10, nr: 60, interpretation: 'III', controls: 'Pausas activas, Silla ergonómica', controlResponsible: 'Cada trabajador', complianceEvidence: 'Planilla pausas activas', complianceResponsible: 'RRHH',
      complianceDate: '2026-05-25',
      project: 'Proyecto Administrativo',
      zoneCity: 'Oficina Principal - Medellín',
      client: 'Ecopetrol',
      razonSocial: 'Ecopetrol S.A.',
      exposedCount: 12,
      routine: 'Rutinaria',
      employeeParticipation: 'Sí',
      lastEvaluationDate: '2026-05-25',
      evidenceHistory: [
        {
          id: 102,
          fileName: 'Planilla_Pausas_Activas_Q1.xlsx',
          date: '2026-05-25',
          verifier: 'RRHH',
          description: 'Control de asistencia a sesiones de pausas activas'
        }
      ]
    }
  ]);

  const [filter, setFilter] = useState('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  const [formData, setFormData] = useState({
    area: '', task: '', hazard: '', type: 'Biomecánicos', gtcDescription: 'Postura (prolongada, mantenida, forzada, anti gravitacional)', nd: 2, ne: 3, nc: 10, controls: '', controlResponsible: '', complianceEvidence: '', complianceResponsible: '', complianceDate: '', evidenceHistory: [],
    project: '', zoneCity: '', client: '', exposedCount: 1,
    routine: 'Rutinaria', employeeParticipation: 'Sí', lastEvaluationDate: new Date().toISOString().split('T')[0]
  });

  const projectOptions = useMemo(() => {
    const baseList = (globalParams?.projectTypes && globalParams.projectTypes.length > 0) 
      ? globalParams.projectTypes 
      : DEFAULT_PARAMS.projectTypes;
    if (formData.project && !baseList.includes(formData.project)) {
      return [...baseList, formData.project];
    }
    return baseList;
  }, [globalParams?.projectTypes, formData.project]);

  const cityOptions = useMemo(() => {
    const baseList = (globalParams?.cities && globalParams.cities.length > 0) 
      ? globalParams.cities 
      : DEFAULT_PARAMS.cities;
    if (formData.zoneCity && !baseList.includes(formData.zoneCity)) {
      return [...baseList, formData.zoneCity];
    }
    return baseList;
  }, [globalParams?.cities, formData.zoneCity]);

  const clientOptions = useMemo(() => {
    const baseList = (globalParams?.clients && globalParams.clients.length > 0) 
      ? globalParams.clients 
      : DEFAULT_PARAMS.clients;
    if (formData.client && !baseList.includes(formData.client)) {
      return [...baseList, formData.client];
    }
    return baseList;
  }, [globalParams?.clients, formData.client]);

  // Detailed sheet state variables
  const [selectedRiskId, setSelectedRiskId] = useState(null);
  const [detailTab, setDetailTab] = useState('detail'); // 'detail' or 'control'

  const [newEvidenceData, setNewEvidenceData] = useState({
    fileName: '',
    date: new Date().toISOString().split('T')[0],
    verifier: '',
    description: ''
  });
  const [selectedEvidenceFile, setSelectedEvidenceFile] = useState(null);
  const [isUploadingEvidence, setIsUploadingEvidence] = useState(false);
  const [uploadEvidenceProgress, setUploadEvidenceProgress] = useState(0);
  const [oneDriveSettings, setOneDriveSettings] = useState(() => getOneDriveSettings());

  // Sync OneDrive settings
  useEffect(() => {
    const handleSettingsChange = (e) => {
      setOneDriveSettings(e.detail);
    };
    window.addEventListener('onedrive-settings-changed', handleSettingsChange);
    return () => {
      window.removeEventListener('onedrive-settings-changed', handleSettingsChange);
    };
  }, []);

  // Auto-select first risk
  useEffect(() => {
    if (risks.length > 0 && !selectedRiskId) {
      setSelectedRiskId(risks[0].id);
    }
  }, [risks, selectedRiskId]);

  const selectedRisk = risks.find(r => r.id === selectedRiskId);

  const [filterProject, setFilterProject] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterClient, setFilterClient] = useState('');

  const areas = ['Todos', ...new Set(risks.map(r => r.area))];
  const filteredRisks = risks.filter(r => {
    const matchArea = filter === 'Todos' || r.area === filter;
    const matchProject = !filterProject || r.project === filterProject;
    const matchCity = !filterCity || r.zoneCity === filterCity || r.city === filterCity;
    const matchClient = !filterClient || r.client === filterClient;
    return matchArea && matchProject && matchCity && matchClient;
  });

  const total = risks.length;
  const highCount = risks.filter(r => r.interpretation === 'I' || r.interpretation === 'II').length;
  const medCount = risks.filter(r => r.interpretation === 'III').length;
  const lowCount = risks.filter(r => r.interpretation === 'IV').length;

  const calculateInterpretation = (nr) => {
    if (nr >= 600) return 'I';
    if (nr >= 150) return 'II';
    if (nr >= 40) return 'III';
    return 'IV';
  };

  const handleTypeChange = (e) => {
    const selectedType = e.target.value;
    const subtypes = getSubtypesForType(selectedType);
    setFormData({
      ...formData,
      type: selectedType,
      gtcDescription: subtypes[0] || ''
    });
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        area: item.area || '',
        task: item.task || '',
        hazard: item.hazard || '',
        type: item.type || 'Biomecánicos',
        gtcDescription: item.gtcDescription || '',
        nd: item.nd ?? 2,
        ne: item.ne ?? 3,
        nc: item.nc ?? 10,
        controls: item.controls || '',
        controlResponsible: item.controlResponsible || '',
        complianceEvidence: item.complianceEvidence || '',
        complianceResponsible: item.complianceResponsible || '',
        complianceDate: item.complianceDate || '',
        evidenceHistory: item.evidenceHistory || [],
        project: item.project || '',
        zoneCity: item.zoneCity || '',
        client: item.client || '',
        exposedCount: item.exposedCount ?? 1,
        routine: item.routine || 'Rutinaria',
        employeeParticipation: item.employeeParticipation || 'Sí',
        lastEvaluationDate: item.lastEvaluationDate || new Date().toISOString().split('T')[0]
      });
    } else {
      setEditingItem(null);
      const defaultType = 'Biomecánicos';
      const defaultSubtypes = GTC45_CLASSIFICATION[defaultType];
      setFormData({ 
        area: '', 
        task: '', 
        hazard: '', 
        type: defaultType, 
        gtcDescription: defaultSubtypes[0], 
        nd: 2, 
        ne: 3, 
        nc: 10, 
        controls: '', 
        controlResponsible: '', 
        complianceEvidence: '', 
        complianceResponsible: '',
        complianceDate: '',
        evidenceHistory: [],
        project: '',
        zoneCity: '',
        client: '',
        exposedCount: 1,
        routine: 'Rutinaria',
        employeeParticipation: 'Sí',
        lastEvaluationDate: new Date().toISOString().split('T')[0]
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const np = formData.nd * formData.ne;
    const nr = np * formData.nc;
    const interpretation = calculateInterpretation(nr);
    
    let history = formData.evidenceHistory || [];
    if (history.length === 0 && formData.complianceEvidence) {
      history = [{
        id: Date.now(),
        fileName: '',
        date: formData.complianceDate || new Date().toISOString().split('T')[0],
        verifier: formData.complianceResponsible || 'No asignado',
        description: formData.complianceEvidence
      }];
    }

    const newItem = { 
      ...formData, 
      np, 
      nr, 
      interpretation,
      evidenceHistory: history,
      complianceDate: formData.complianceDate || (history[0] ? history[0].date : '')
    };

    if (editingItem) {
      setRisks(risks.map(r => r.id === editingItem.id ? { ...newItem, id: r.id } : r));
    } else {
      setRisks([...risks, { ...newItem, id: Date.now() }]);
    }
    handleCloseModal();
  };

  const handleAddEvidence = async (e) => {
    e.preventDefault();
    if (!selectedRisk) return;
    
    let finalFileName = newEvidenceData.fileName;
    let fileUrl = null;

    if (oneDriveSettings.enabled && selectedEvidenceFile) {
      setIsUploadingEvidence(true);
      setUploadEvidenceProgress(0);
      try {
        const result = await uploadFile(selectedEvidenceFile, oneDriveSettings.folderName, (percent) => {
          setUploadEvidenceProgress(percent);
        });
        if (result && result.success) {
          fileUrl = result.webUrl;
          finalFileName = result.name;
        }
      } catch (err) {
        console.error("Error al subir evidencia a OneDrive:", err);
        alert(`Error al subir evidencia a OneDrive: ${err.message || err}`);
        setIsUploadingEvidence(false);
        return;
      }
      setIsUploadingEvidence(false);
    }

    const newRecord = {
      id: Date.now(),
      fileName: finalFileName || '',
      fileUrl,
      date: newEvidenceData.date,
      verifier: newEvidenceData.verifier || 'No asignado',
      description: newEvidenceData.description
    };

    const updatedHistory = [...(selectedRisk.evidenceHistory || []), newRecord];
    const updatedRisk = {
      ...selectedRisk,
      complianceEvidence: newRecord.description || newRecord.fileName || 'Evidencia cargada',
      complianceResponsible: newRecord.verifier,
      complianceDate: newRecord.date,
      evidenceHistory: updatedHistory
    };

    const updatedRisks = risks.map(r => r.id === selectedRisk.id ? updatedRisk : r);
    setRisks(updatedRisks);

    // Reset Form
    setNewEvidenceData({
      fileName: '',
      date: new Date().toISOString().split('T')[0],
      verifier: '',
      description: ''
    });
    setSelectedEvidenceFile(null);
  };

  const handleDeleteEvidence = (evidenceId) => {
    if (!selectedRisk) return;
    if (window.confirm("¿Está seguro de eliminar esta evidencia del historial?")) {
      const updatedHistory = (selectedRisk.evidenceHistory || []).filter(e => e.id !== evidenceId);
      
      let latestEvidence = 'Sin evidencias';
      let latestVerifier = 'No asignado';
      let latestDate = '';
      
      if (updatedHistory.length > 0) {
        const latest = updatedHistory[updatedHistory.length - 1];
        latestEvidence = latest.description || latest.fileName;
        latestVerifier = latest.verifier;
        latestDate = latest.date;
      }

      const updatedRisk = {
        ...selectedRisk,
        complianceEvidence: latestEvidence,
        complianceResponsible: latestVerifier,
        complianceDate: latestDate,
        evidenceHistory: updatedHistory
      };

      const updatedRisks = risks.map(r => r.id === selectedRisk.id ? updatedRisk : r);
      setRisks(updatedRisks);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Está seguro de eliminar este peligro?")) {
      const remaining = risks.filter(r => r.id !== id);
      setRisks(remaining);
      if (selectedRiskId === id) {
        setSelectedRiskId(remaining[0]?.id || null);
      }
    }
  };

  const handleExport = () => {
    const cols = [
      { header: 'Proyecto', key: 'project' },
      { header: 'Zona / Ciudad', key: 'zoneCity' },
      { header: 'Cliente / Razón Social', key: 'client' },
      { header: 'Área / Proceso', key: 'area' },
      { header: 'Actividad / Tarea', key: 'task' },
      { header: 'Rutinaria (S/N)', key: 'routine' },
      { header: 'Peligro / Factor de Riesgo', key: 'hazard' },
      { header: 'Clasificación (GTC 45)', key: 'type' },
      { header: 'Descripción (GTC 45)', key: 'gtcDescription' },
      { header: 'Participación Personal', key: 'employeeParticipation' },
      { header: 'Expuestos', key: 'exposedCount' },
      { header: 'Deficiencia (ND)', key: 'nd' },
      { header: 'Exposición (NE)', key: 'ne' },
      { header: 'Probabilidad (NP)', key: 'np' },
      { header: 'Consecuencia (NC)', key: 'nc' },
      { header: 'Nivel Riesgo (NR)', key: 'nr' },
      { header: 'Interpretación', key: 'interpretation' },
      { header: 'Última Evaluación', key: 'lastEvaluationDate' },
      { header: 'Controles Propuestos', key: 'controls' },
      { header: 'Responsable Control', key: 'controlResponsible' },
      { header: 'Evidencia Cumplimiento', key: 'complianceEvidence' },
      { header: 'Responsable SST', key: 'complianceResponsible' }
    ];
    setExportConfig({
      isOpen: true,
      exportType: 'excel',
      title: 'Matriz de Identificación de Peligros y Riesgos (GTC 45)',
      code: 'SST-MAT-GTC45-001',
      version: `0${meta.version}`,
      validity: meta.validity,
      columns: cols,
      data: risks,
      history: risksSstHistory
    });
  };

  const handleNewVersion = () => {
    const changeReason = window.prompt("Ingrese el motivo del cambio para la versión 0" + meta.version + ":");
    if (!changeReason) {
      alert("Se requiere un motivo del cambio para archivar e incrementar la versión.");
      return;
    }

    const currentVersionStr = `0${meta.version}`;
    const nextVersionVal = meta.version + 1;

    const obsoleteDoc = {
      id: Date.now(),
      code: `SST-V${meta.version}`,
      name: `Matriz de Peligros GTC 45 SST V${meta.version}`,
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
    setRisksSstHistory([...risksSstHistory, newHistoryEntry]);

    setMeta({
      version: nextVersionVal,
      validity: meta.validity,
      lastUpdated: new Date().toISOString().split('T')[0]
    });
    alert(`Matriz V.${currentVersionStr} guardada con éxito en el histórico de Obsoletos. Iniciando versión 0${nextVersionVal}`);
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

      <div style={{display:'flex', justifyContent:'space-between', marginBottom:'1.5rem', alignItems:'center', flexWrap:'wrap', gap:'1rem'}}>
        <div>
          <p style={{color:'var(--text-secondary)', marginBottom:'0.25rem'}}>Peligros y riesgos (Matriz GTC 45)</p>
          <span className="badge badge-info">
            <Clock size={12} style={{marginRight:'4px'}}/> Última actualización: {meta.lastUpdated} | Versión: 0{meta.version}
          </span>
        </div>
        <div style={{display:'flex', gap:'0.5rem', flexWrap:'wrap'}}>
          <button className="btn-secondary" onClick={handleExport}><Download size={16}/> Exportar Excel</button>
          <button className="btn-secondary" onClick={handleNewVersion} style={{color:'var(--warning)', borderColor:'var(--warning)'}}>
            <Archive size={16} style={{marginRight:'4px'}}/> Archivar Versión
          </button>
          <button className="btn-primary" onClick={() => handleOpenModal()}><Plus size={16}/> Nuevo Peligro</button>
        </div>
      </div>

      <div className="grid-4" style={{marginBottom:'1.5rem'}}>
        <div className="card" style={{marginBottom:0, borderLeft:'4px solid var(--accent-primary)', padding:'1.25rem'}}>
          <div style={{fontSize:'0.8rem', color:'var(--text-secondary)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.5rem'}}>Total Peligros</div>
          <div style={{fontSize:'2rem', fontWeight:700}}>{total}</div>
        </div>
        <div className="card" style={{marginBottom:0, borderLeft:'4px solid var(--danger)', padding:'1.25rem'}}>
          <div style={{fontSize:'0.8rem', color:'var(--text-secondary)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.5rem'}}>No Aceptables (I y II)</div>
          <div style={{fontSize:'2rem', fontWeight:700, color:'var(--danger)'}}>{highCount}</div>
        </div>
        <div className="card" style={{marginBottom:0, borderLeft:'4px solid var(--warning)', padding:'1.25rem'}}>
          <div style={{fontSize:'0.8rem', color:'var(--text-secondary)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.5rem'}}>Aceptable con control (III)</div>
          <div style={{fontSize:'2rem', fontWeight:700, color:'var(--warning)'}}>{medCount}</div>
        </div>
        <div className="card" style={{marginBottom:0, borderLeft:'4px solid var(--success)', padding:'1.25rem'}}>
          <div style={{fontSize:'0.8rem', color:'var(--text-secondary)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.5rem'}}>Aceptables (IV)</div>
          <div style={{fontSize:'2rem', fontWeight:700, color:'var(--success)'}}>{lowCount}</div>
        </div>
      </div>

      <div className="card" style={{marginBottom:'1.5rem', padding:'0.75rem 1.5rem'}}>
        <div style={{display:'flex', alignItems:'center', gap:'0.75rem', flexWrap:'wrap', marginBottom: '0.75rem'}}>
          <span style={{fontSize:'0.85rem', fontWeight:600, color:'var(--text-secondary)'}}><Filter size={14} style={{verticalAlign:'middle', marginRight:'4px'}}/> Filtro Área:</span>
          {areas.map(p => (
            <button 
              key={p} 
              onClick={() => setFilter(p)} 
              style={{
                padding:'0.35rem 0.75rem', borderRadius:'9999px', fontSize:'0.8rem', fontWeight:600, 
                border:`2px solid ${p === filter ? 'var(--accent-primary)' : 'var(--border-color)'}`, 
                background: p === filter ? 'var(--accent-primary)' : 'var(--bg-secondary)', 
                color: p === filter ? 'white' : 'var(--text-secondary)', 
                cursor:'pointer', transition:'all 0.2s'
              }}
            >
              {p}
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

      <div className="card" style={{padding:0, overflow:'hidden'}}>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Área / Proyecto</th>
                <th>Tarea</th>
                <th>Peligro / Tipo</th>
                <th title="Nivel Deficiencia">ND</th>
                <th title="Nivel Exposición">NE</th>
                <th title="Nivel Probabilidad">NP</th>
                <th title="Nivel Consecuencia">NC</th>
                <th title="Nivel Riesgo">NR</th>
                <th>Interp.</th>
                <th title="Cantidad de Expuestos">Exp.</th>
                <th>Controles y Responsable</th>
                <th>Evidencia Cump.</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredRisks.length === 0 ? (
                <tr><td colSpan="13" style={{textAlign:'center', padding:'2rem'}}>No hay registros.</td></tr>
              ) : filteredRisks.map(r => {
                let badge = 'badge-success';
                if (r.interpretation === 'I' || r.interpretation === 'II') badge = 'badge-danger';
                else if (r.interpretation === 'III') badge = 'badge-warning';

                return (
                  <tr 
                    key={r.id}
                    className={`risk-row ${r.id === selectedRiskId ? 'active' : ''}`}
                    onClick={() => setSelectedRiskId(r.id)}
                  >
                    <td style={{fontWeight:500}}>
                      {r.area}
                      {r.project && <div style={{fontSize:'0.72rem', color:'var(--accent-primary)', marginTop:'2px'}}><strong>Proy:</strong> {r.project}</div>}
                      {r.zoneCity && <div style={{fontSize:'0.72rem', color:'var(--text-muted)'}}><strong>Zona:</strong> {r.zoneCity}</div>}
                      {r.client && <div style={{fontSize:'0.72rem', color:'var(--success)'}}><strong>Cliente:</strong> {r.client}</div>}
                    </td>
                    <td style={{fontSize:'0.85rem'}}>
                      {r.task}
                      <div style={{marginTop:'4px'}}>
                        <span className={`badge ${r.routine === 'No Rutinaria' ? 'badge-warning' : 'badge-info'}`} style={{fontSize:'0.65rem', padding:'1px 4px'}}>
                          {r.routine || 'Rutinaria'}
                        </span>
                      </div>
                    </td>
                    <td style={{fontSize:'0.85rem'}}>
                      <strong>{r.hazard}</strong>
                      {r.gtcDescription && (
                        <div style={{fontSize:'0.75rem', color:'var(--accent-primary)', marginTop:'2px'}}>
                          GTC 45: {r.gtcDescription}
                        </div>
                      )}
                      <div style={{display: 'flex', gap: '4px', marginTop: '4px', flexWrap: 'wrap'}}>
                        <span className="badge badge-secondary" style={{fontSize:'0.65rem', padding:'1px 4px', background:'var(--bg-secondary)', color:'var(--text-secondary)', border:'1px solid var(--border-color)'}}>{r.type}</span>
                        <span className={`badge ${r.employeeParticipation === 'No' ? 'badge-danger' : 'badge-success'}`} style={{fontSize:'0.65rem', padding:'1px 4px'}}>
                          Part: {r.employeeParticipation || 'Sí'}
                        </span>
                      </div>
                    </td>
                    <td style={{textAlign:'center'}}>{r.nd}</td>
                    <td style={{textAlign:'center'}}>{r.ne}</td>
                    <td style={{textAlign:'center'}}>{r.np}</td>
                    <td style={{textAlign:'center'}}>{r.nc}</td>
                    <td style={{textAlign:'center', fontWeight:600}}>{r.nr}</td>
                    <td style={{textAlign:'center'}}>
                      <span className={`badge ${badge}`}>{r.interpretation}</span>
                      {r.lastEvaluationDate && (
                        <div style={{fontSize:'0.68rem', color:'var(--text-muted)', marginTop:'4px'}} title="Última actualización de la evaluación">
                          🔄 {r.lastEvaluationDate}
                        </div>
                      )}
                    </td>
                    <td style={{textAlign:'center', fontWeight:600}}>{r.exposedCount || 0}</td>
                    <td style={{fontSize:'0.8rem', maxWidth:'200px'}}>
                      <div>{r.controls}</div>
                      <div style={{color:'var(--text-muted)', marginTop:'0.25rem'}}><strong>Resp:</strong> {r.controlResponsible}</div>
                    </td>
                    <td style={{fontSize:'0.8rem', maxWidth:'160px'}}>
                      {r.evidenceHistory && r.evidenceHistory.length > 0 ? (
                        <div>
                          <span className="badge badge-success" style={{display:'inline-flex', alignItems:'center', gap:'2px', fontWeight: 600}}>
                            <CheckCircle size={10}/> {r.evidenceHistory.length} soporte(s)
                          </span>
                          <div style={{fontSize:'0.72rem', color:'var(--text-muted)', marginTop:'2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                            {r.complianceEvidence}
                          </div>
                        </div>
                      ) : (
                        <span className="badge badge-warning" style={{fontSize:'0.65rem'}}>Sin evidencia</span>
                      )}
                    </td>
                    <td>
                      <div style={{display:'flex', gap:'0.25rem'}} onClick={e => e.stopPropagation()}>
                        <button className="btn-icon" style={{padding:'0.25rem', color:'var(--text-muted)'}} onClick={() => handleOpenModal(r)}><Edit2 size={14}/></button>
                        <button className="btn-icon" style={{padding:'0.25rem', color:'var(--danger)'}} onClick={() => handleDelete(r.id)}><Trash2 size={14}/></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* FICHA DE PELIGRO Y RIESGO SELECCIONADO (A la EnvAspects) */}
      {selectedRisk && (
        <div className="card fade-in" style={{ marginTop: '1.5rem', padding: '1.25rem', borderLeft: '4px solid var(--accent-primary)', marginBottom: '2rem' }}>
          
          {/* Header de la Ficha */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <span className="badge badge-info" style={{ marginBottom: '0.25rem', display: 'inline-block' }}>
                <CheckCircle size={10} style={{ marginRight: '4px' }} /> Ficha de Peligro y Riesgo Ocupacional GTC 45
              </span>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
                {selectedRisk.hazard}
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Proyecto: <strong>{selectedRisk.project || 'General'}</strong> | Zona/Ciudad: <strong>{selectedRisk.zoneCity || 'No asignada'}</strong> | Cliente: <strong>{selectedRisk.client || 'N/A'}</strong> | Área: <strong>{selectedRisk.area}</strong> | Tarea: <strong>{selectedRisk.task}</strong>
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button className="btn-secondary" style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem' }} onClick={() => handleOpenModal(selectedRisk)}>
                <Edit2 size={12} style={{ marginRight: '4px' }} /> Editar Peligro
              </button>
            </div>
          </div>

          {/* Sub Navegación de Pestañas */}
          <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            <button 
              className={`btn-secondary ${detailTab === 'detail' ? 'active' : ''}`}
              style={{ border: 'none', fontSize: '0.8rem', padding: '0.3rem 0.6rem', background: detailTab === 'detail' ? 'rgba(14, 165, 233, 0.1)' : 'transparent', color: detailTab === 'detail' ? 'var(--accent-primary)' : 'var(--text-secondary)' }}
              onClick={() => setDetailTab('detail')}
            >
              <FileText size={12} style={{ marginRight: '3px' }} /> Detalle y Evaluación
            </button>
            <button 
              className={`btn-secondary ${detailTab === 'control' ? 'active' : ''}`}
              style={{ border: 'none', fontSize: '0.8rem', padding: '0.3rem 0.6rem', background: detailTab === 'control' ? 'rgba(16, 185, 129, 0.1)' : 'transparent', color: detailTab === 'control' ? 'var(--success)' : 'var(--text-secondary)' }}
              onClick={() => setDetailTab('control')}
            >
              <ClipboardList size={12} style={{ marginRight: '3px' }} /> Controles y Evidencias ({selectedRisk.evidenceHistory?.length || 0})
            </button>
          </div>

          {/* TAB 1: Detalle y Evaluación del Riesgo */}
          {detailTab === 'detail' && (
            <div className="grid-2 fade-in" style={{ gap: '1.25rem' }}>
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Identificación del Peligro</h4>
                <div style={{ background: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: '6px', border: '1px solid var(--border-color)', minHeight: '120px', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.82rem' }}>
                  <div>Proyecto: <strong>{selectedRisk.project || 'General'}</strong></div>
                  <div>Zona / Ciudad: <strong>{selectedRisk.zoneCity || 'No asignada'}</strong></div>
                  <div>Cliente: <strong>{selectedRisk.client || 'N/A'}</strong></div>
                  <div>Clasificación GTC 45: <strong>{selectedRisk.type}</strong></div>
                  {selectedRisk.gtcDescription && <div>Descripción GTC 45: <strong>{selectedRisk.gtcDescription}</strong></div>}
                  <div>Tipo de Actividad: <strong style={{ color: selectedRisk.routine === 'No Rutinaria' ? 'var(--warning)' : 'var(--accent-primary)' }}>{selectedRisk.routine || 'Rutinaria'}</strong></div>
                  <div>Participación del Personal: <strong style={{ color: selectedRisk.employeeParticipation === 'No' ? 'var(--danger)' : 'var(--success)' }}>{selectedRisk.employeeParticipation || 'Sí'}</strong></div>
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.4rem', marginTop: '0.2rem' }}>
                    Detalle Específico: <strong>{selectedRisk.hazard}</strong>
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Valoración Cualitativa / Cuantitativa</h4>
                <div className="grid-2" style={{ gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
                  <div>Nivel Deficiencia (ND): <strong>{selectedRisk.nd}</strong></div>
                  <div>Nivel Exposición (NE): <strong>{selectedRisk.ne}</strong></div>
                  <div>Nivel Probabilidad (NP): <strong>{selectedRisk.np}</strong></div>
                  <div>Nivel Consecuencia (NC): <strong>{selectedRisk.nc}</strong></div>
                  <div>Nivel de Riesgo (NR): <strong>{selectedRisk.nr}</strong></div>
                  <div>Personal Expuesto: <strong>{selectedRisk.exposedCount || 0} trab.</strong></div>
                  <div style={{ gridColumn: 'span 2' }}>Última Evaluación: <strong>{selectedRisk.lastEvaluationDate || 'No disponible'}</strong></div>
                  
                  <div style={{ gridColumn: 'span 2', borderTop: '1px solid var(--border-color)', paddingTop: '0.4rem', marginTop: '0.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Interpretación (Nivel):</span>
                    <span className={`badge ${selectedRisk.interpretation === 'I' || selectedRisk.interpretation === 'II' ? 'badge-danger' : selectedRisk.interpretation === 'III' ? 'badge-warning' : 'badge-success'}`}>
                      Nivel {selectedRisk.interpretation} - {selectedRisk.interpretation === 'I' || selectedRisk.interpretation === 'II' ? 'No Aceptable' : selectedRisk.interpretation === 'III' ? 'Aceptable con Control' : 'Aceptable'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Controles y Evidencias de Cumplimiento */}
          {detailTab === 'control' && (
            <div className="grid-2 fade-in" style={{ gap: '1.25rem' }}>
              
              {/* Columna Izquierda: Medidas de control y lista de evidencias cargadas */}
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Medidas de Control Propuestas</h4>
                <div style={{ background: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: '6px', border: '1px solid var(--border-color)', display:'flex', flexDirection:'column', gap:'0.5rem', fontSize: '0.82rem', marginBottom: '1rem' }}>
                  <p style={{ margin: 0, lineHeight: '1.4' }}>{selectedRisk.controls || 'No se registraron medidas de control.'}</p>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '0.4rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Responsable Control: <strong>{selectedRisk.controlResponsible}</strong></span>
                  </div>
                </div>

                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Soportes de Evidencias Cargados</h4>
                <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingRight: '4px' }}>
                  {(!selectedRisk.evidenceHistory || selectedRisk.evidenceHistory.length === 0) ? (
                    <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '6px', border: '1px dashed var(--border-color)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                      Sin soportes de evidencias registrados.
                    </div>
                  ) : (
                    selectedRisk.evidenceHistory.map((ev) => (
                      <div key={ev.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, minWidth: 0 }}>
                          <span style={{ fontSize: '0.82rem', fontWeight: 600, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={ev.description || ev.fileName}>
                            {ev.description || ev.fileName}
                          </span>
                          <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            <span>📅 {ev.date}</span>
                            <span>👤 {ev.verifier}</span>
                          </div>
                          {ev.fileName && (
                            <div style={{ marginTop: '2px' }}>
                              {ev.fileUrl ? (
                                <a href={ev.fileUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.72rem', color: '#0078d4', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                                  <Cloud size={10}/> {ev.fileName} (Ver en nube)
                                </a>
                              ) : (
                                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                                  <Paperclip size={10}/> {ev.fileName} (Local)
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <button 
                          type="button"
                          className="btn-icon" 
                          onClick={() => handleDeleteEvidence(ev.id)} 
                          style={{ color: 'var(--danger)', padding: '0.2rem' }}
                          title="Eliminar soporte"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Columna Derecha: Registrar nueva evidencia */}
              <div>
                <form onSubmit={handleAddEvidence} style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', background: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ fontSize: '0.82rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: 'var(--accent-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem' }}>Adjuntar Nuevo Soporte / Evidencia</h4>
                  
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.72rem' }}>Descripción de la Evidencia</label>
                    <input 
                      type="text" 
                      className="form-control text-sm" 
                      style={{ padding: '0.3rem', fontSize: '0.78rem' }}
                      value={newEvidenceData.description} 
                      onChange={e => setNewEvidenceData({...newEvidenceData, description: e.target.value})} 
                      placeholder="Ej. Planilla firmada de inducción" 
                      required 
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.72rem' }}>Fecha</label>
                      <input 
                        type="date" 
                        className="form-control text-sm" 
                        style={{ padding: '0.2rem', fontSize: '0.78rem' }}
                        value={newEvidenceData.date} 
                        onChange={e => setNewEvidenceData({...newEvidenceData, date: e.target.value})} 
                        required 
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.72rem' }}>Verificador</label>
                      <select 
                        className="form-control text-sm" 
                        style={{ padding: '0.2rem', fontSize: '0.78rem' }}
                        value={newEvidenceData.verifier} 
                        onChange={e => setNewEvidenceData({...newEvidenceData, verifier: e.target.value})} 
                        required
                      >
                        <option value="">Seleccione...</option>
                        {APP_USERS.map(u => <option key={u.email} value={u.name}>{u.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.72rem' }}>Archivo Adjunto</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-primary)', padding: '0.3rem 0.5rem', borderRadius: '4px', border: '1px dashed var(--border-color)' }}>
                      <input 
                        type="file" 
                        id="evidence-file-upload-inline" 
                        style={{ display: 'none' }} 
                        onChange={e => {
                          const file = e.target.files[0];
                          if (file) {
                            setSelectedEvidenceFile(file);
                            setNewEvidenceData({ ...newEvidenceData, fileName: file.name });
                          }
                        }}
                      />
                      <label htmlFor="evidence-file-upload-inline" className="btn-secondary" style={{ cursor: 'pointer', margin: 0, padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}>
                        <Upload size={12} style={{ marginRight: '3px' }}/> Seleccionar
                      </label>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                        {newEvidenceData.fileName || 'Ninguno'}
                      </span>
                    </div>
                    {oneDriveSettings.enabled && (
                      <span style={{ fontSize: '0.68rem', color: '#0078d4', display: 'block', marginTop: '2px' }}>
                        ☁️ Se subirá automáticamente a OneDrive
                      </span>
                    )}
                  </div>

                  <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.4rem', padding: '0.35rem', fontSize: '0.78rem' }}>
                    Guardar Soporte
                  </button>
                </form>
              </div>

            </div>
          )}
        </div>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingItem ? "Editar Peligro (GTC 45)" : "Nuevo Peligro (GTC 45)"}
      >
        <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'1rem'}}>
            <div className="form-group">
              <label className="form-label">Proyecto</label>
              <select 
                className="form-control" 
                value={formData.project} 
                onChange={e => setFormData({...formData, project: e.target.value})} 
                required 
              >
                <option value="">Seleccione el proyecto...</option>
                {projectOptions.map((p, idx) => (
                  <option key={idx} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Zona / Ciudad</label>
              <select 
                className="form-control" 
                value={formData.zoneCity} 
                onChange={e => setFormData({...formData, zoneCity: e.target.value})} 
                required 
              >
                <option value="">Seleccione la zona / ciudad...</option>
                {cityOptions.map((c, idx) => (
                  <option key={idx} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Cliente / Razón Social</label>
              <select 
                className="form-control" 
                value={formData.client} 
                onChange={e => setFormData({ ...formData, client: e.target.value })} 
                required 
              >
                <option value="">Seleccione el cliente / razón social...</option>
                {clientOptions.map((c, idx) => (
                  <option key={idx} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem'}}>
            <div className="form-group">
              <label className="form-label">Participación Personal</label>
              <select className="form-control" value={formData.employeeParticipation} onChange={e => setFormData({...formData, employeeParticipation: e.target.value})} required>
                <option value="Sí">Sí (Hubo participación)</option>
                <option value="No">No (No hubo participación)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Tipo de Actividad</label>
              <select className="form-control" value={formData.routine} onChange={e => setFormData({...formData, routine: e.target.value})} required>
                <option value="Rutinaria">Rutinaria</option>
                <option value="No Rutinaria">No Rutinaria</option>
              </select>
            </div>
          </div>

          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem'}}>
            <div className="form-group">
              <label className="form-label">Área / Proceso</label>
              <input type="text" className="form-control" value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} required placeholder="Ej: Planta de Producción..." />
            </div>
            <div className="form-group">
              <label className="form-label">Tarea</label>
              <input type="text" className="form-control" value={formData.task} onChange={e => setFormData({...formData, task: e.target.value})} required placeholder="Ej: Mantenimiento de Equipos..." />
            </div>
          </div>
          
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem'}}>
            <div className="form-group">
              <label className="form-label">Clasificación (GTC 45)</label>
              <select className="form-control" value={formData.type} onChange={handleTypeChange} required>
                <option value="Biológico">Biológico</option>
                <option value="Físico">Físico</option>
                <option value="Químico">Químico</option>
                <option value="Psicosocial">Psicosocial</option>
                <option value="Biomecánicos">Biomecánicos</option>
                <option value="Condiciones de seguridad">Condiciones de seguridad</option>
                <option value="Fenómenos naturales">Fenómenos naturales</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Peligro / Descripción GTC 45</label>
              <select 
                className="form-control" 
                value={formData.gtcDescription} 
                onChange={e => setFormData({...formData, gtcDescription: e.target.value})} 
                required
              >
                {getSubtypesForType(formData.type).map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Detalle del Peligro / Peligro Específico</label>
            <input type="text" className="form-control" value={formData.hazard} onChange={e => setFormData({...formData, hazard: e.target.value})} required placeholder="Ej: Contacto eléctrico directo, caídas de diferente nivel..." />
          </div>

          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:'1rem'}}>
            <div className="form-group">
              <label className="form-label">ND (Deficiencia)</label>
              <select className="form-control" value={formData.nd} onChange={e => setFormData({...formData, nd: Number(e.target.value)})} required>
                <option value="10">10 - Muy Alto</option>
                <option value="6">6 - Alto</option>
                <option value="2">2 - Medio</option>
                <option value="0">0 - Bajo</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">NE (Exposición)</label>
              <select className="form-control" value={formData.ne} onChange={e => setFormData({...formData, ne: Number(e.target.value)})} required>
                <option value="4">4 - Continua</option>
                <option value="3">3 - Frecuente</option>
                <option value="2">2 - Ocasional</option>
                <option value="1">1 - Esporádica</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">NC (Consecuencia)</label>
              <select className="form-control" value={formData.nc} onChange={e => setFormData({...formData, nc: Number(e.target.value)})} required>
                <option value="100">100 - Mortal</option>
                <option value="60">60 - Muy Grave</option>
                <option value="25">25 - Grave</option>
                <option value="10">10 - Leve</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Nro Expuestos</label>
              <input type="number" className="form-control" min="1" value={formData.exposedCount} onChange={e => setFormData({...formData, exposedCount: Number(e.target.value)})} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Controles Existentes</label>
            <textarea className="form-control" value={formData.controls} onChange={e => setFormData({...formData, controls: e.target.value})} rows="2" required></textarea>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem'}}>
            <div className="form-group">
              <label className="form-label">Responsable de Controles</label>
              <select className="form-control" value={formData.controlResponsible} onChange={e => setFormData({...formData, controlResponsible: e.target.value})} required>
                <option value="">Seleccione Usuario...</option>
                {APP_USERS.map(u => <option key={u.email} value={u.name}>{u.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Responsable Cumplimiento</label>
              <select className="form-control" value={formData.complianceResponsible} onChange={e => setFormData({...formData, complianceResponsible: e.target.value})} required>
                <option value="">Seleccione Usuario...</option>
                {APP_USERS.map(u => <option key={u.email} value={u.name}>{u.name}</option>)}
              </select>
            </div>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'1.2fr 1fr 1fr', gap:'1rem'}}>
            <div className="form-group">
              <label className="form-label">Evidencia de Cumplimiento</label>
              <input type="text" className="form-control" value={formData.complianceEvidence} onChange={e => setFormData({...formData, complianceEvidence: e.target.value})} required placeholder="Ej: Registro entrega de EPP" />
            </div>
            <div className="form-group">
              <label className="form-label">Fecha de la Evidencia</label>
              <input type="date" className="form-control" value={formData.complianceDate || ''} onChange={e => setFormData({...formData, complianceDate: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Fecha Actualización Eval.</label>
              <input type="date" className="form-control" value={formData.lastEvaluationDate || ''} onChange={e => setFormData({...formData, lastEvaluationDate: e.target.value})} required />
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
      />



      {/* OVERLAY DE CARGA PARA ONEDRIVE */}
      {isUploadingEvidence && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
          background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
          gap: '1rem', zIndex: 99999, color: 'white'
        }}>
          <RefreshCw size={36} className="spin" color="#0078d4" style={{ animation: 'spin 1.2s linear infinite' }} />
          <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>Subiendo evidencia a Microsoft OneDrive...</span>
          <div style={{ width: '300px', height: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${uploadEvidenceProgress}%`, height: '100%', background: '#0078d4', transition: 'width 0.1s ease-out' }}></div>
          </div>
          <span style={{ fontSize: '0.85rem' }}>{uploadEvidenceProgress}% completado</span>
        </div>
      )}
    </>
  );
}
