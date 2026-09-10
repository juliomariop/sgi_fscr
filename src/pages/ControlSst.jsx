import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldAlert, Plus, Download, Edit2, Trash2, CheckCircle, Clock, AlertTriangle, 
  FileText, Shield, UserCheck, Flame, Zap, HardHat, Compass, Thermometer, 
  Activity, Wind, Clipboard, RefreshCw, Upload, Eye, Check, X, ClipboardCheck
} from 'lucide-react';
import Modal from '../components/Modal';
import { downloadCSV, printHseqDocument } from '../utils/exportUtils';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAppUsers } from '../hooks/useAppUsers';

const DEFAULT_PARAMS = {
  projectTypes: ["Eléctrico", "Telecomunicaciones", "Civil", "Ambiental", "Industrial"],
  clients: ["Consorcio Vial del Norte", "Ecopetrol", "Claro", "Movistar"],
  cities: ["Bogotá", "Medellín", "Cali", "Barranquilla", "Bucaramanga"]
};

export default function ControlSst() {
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

  // TAB STATE
  const [activeTab, setActiveTab] = useState('heights'); // heights, ats, highrisk, indicators
  const [searchTerm, setSearchTerm] = useState('');

  // ACCIDENTS AND SLIDER FOR INDICATORS
  const [accidents] = useLocalStorage('sgi_accidents', []);
  const [manHours, setManHours] = useLocalStorage('sgi_sst_manhours', 200000);

  // HEIGHTS PERMITS STATE (Resolución 4272/2021)
  const [heightsPermits, setHeightsPermits] = useLocalStorage('sgi_sst_heights_permits', [
    {
      id: 1,
      date: '2026-06-08',
      location: 'Cubierta Nave Central - Bloque A',
      description: 'Cambio de tejas de traslúcido rotas',
      worker: 'Juan Pérez',
      helper: 'Carlos Ruiz',
      supervisor: 'Diego Castro',
      epccChecklist: {
        harness: true,
        sling: true,
        lifeline: true,
        anchorPoints: true,
        helmet: true,
        connectors: true
      },
      healthSelfDeclaration: true,
      status: 'Aprobado',
      approvalRemarks: 'Se verificaron los puntos de anclaje antes de subir. Andamio certificado y verificado.',
      approvalFile: 'permiso_alturas_0806.pdf',
      project: 'Eléctrico',
      city: 'Bogotá',
      client: 'Consorcio Vial del Norte'
    },
    {
      id: 2,
      date: '2026-06-09',
      location: 'Fachada Exterior - Bloque B (Piso 3)',
      description: 'Lavado de vidrios exteriores',
      worker: 'Pedro Gómez',
      helper: 'Luis Torres',
      supervisor: 'Diego Castro',
      epccChecklist: {
        harness: true,
        sling: true,
        lifeline: true,
        anchorPoints: true,
        helmet: true,
        connectors: false
      },
      healthSelfDeclaration: true,
      status: 'Pendiente',
      approvalRemarks: '',
      approvalFile: null,
      project: 'Civil',
      city: 'Cali',
      client: 'Ecopetrol'
    }
  ]);

  // ATS STATE
  const [atsList, setAtsList] = useLocalStorage('sgi_sst_ats', [
    {
      id: 1,
      date: '2026-06-08',
      process: 'Operaciones e Infraestructura',
      activity: 'Soldadura en caliente de tubería contra incendios',
      tools: 'Equipo de soldadura, pulidora, esmeril, andamio multidireccional',
      team: 'Carlos Ruiz, Juan Pérez, Pedro Gómez',
      project: 'Industrial',
      city: 'Medellín',
      client: 'Claro',
      steps: [
        { id: 101, step: 'Delimitación y señalización del área de trabajo', hazard: 'Ingreso de personal no autorizado, caídas al mismo nivel', consequences: 'Golpes, tropiezos, traumas leves', controls: 'Instalación de cinta de peligro, malla de seguridad y conos' },
        { id: 102, step: 'Alistamiento e inspección de equipos y herramientas', hazard: 'Herramientas defectuosas, choque eléctrico, cortocircuitos', consequences: 'Electrocución, cortes, quemaduras', controls: 'Inspección preoperacional de cables, verificación LOTO y EPP' },
        { id: 103, step: 'Ejecución de corte y pulido de tuberías', hazard: 'Proyección de partículas a alta velocidad, ruido excesivo', consequences: 'Lesiones oculares, hipoacusia, heridas corporales', controls: 'Uso de careta de pulido, gafas de seguridad y protectores auditivos' },
        { id: 104, step: 'Soldadura de acoples a tuberías aéreas', hazard: 'Humos metálicos, caída de alturas (+1.5m), quemaduras directas', consequences: 'Quemaduras graves, caídas, intoxicación respiratoria', controls: 'Uso de arnés anclado a línea de vida, respirador para humos y careta de soldar' }
      ]
    }
  ]);

  // HIGH RISK PERMITS STATE
  const [highRiskPermits, setHighRiskPermits] = useLocalStorage('sgi_sst_highrisk_permits', [
    {
      id: 1,
      date: '2026-06-08',
      type: 'Trabajo en Caliente',
      location: 'Taller de Mantenimiento - Línea 2',
      description: 'Soldadura de vigas de soporte estructural',
      supervisor: 'Diego Castro',
      status: 'Aprobado',
      project: 'Industrial',
      city: 'Medellín',
      client: 'Claro',
      checklist: {
        lotoApplied: 'No Aplica',
        gasAtmosphere: 'No Aplica',
        fireWatcher: 'Luis Torres',
        extinguisherReady: 'Cumple',
        hotPpe: 'Cumple'
      },
      oxygenLevel: '',
      lelLevel: '',
      coLevel: '',
      approvalRemarks: 'Vigía de fuego en sitio con extintor tipo ABC de 20 lbs listo. Área despejada de inflamables.'
    },
    {
      id: 2,
      date: '2026-06-09',
      type: 'Espacio Confinado',
      location: 'Tanque de Almacenamiento RESPEL 02',
      description: 'Inspección interna de lodos de decantación',
      supervisor: 'Diego Castro',
      status: 'Pendiente',
      project: 'Ambiental',
      city: 'Bucaramanga',
      client: 'Consorcio Vial del Norte',
      checklist: {
        lotoApplied: 'Cumple',
        gasAtmosphere: 'Pendiente',
        fireWatcher: 'No Aplica',
        extinguisherReady: 'No Aplica',
        hotPpe: 'No Aplica'
      },
      oxygenLevel: '20.9',
      lelLevel: '0',
      coLevel: '2',
      approvalRemarks: ''
    }
  ]);

  // ROW SELECTION
  const [selectedHeightsId, setSelectedHeightsId] = useState(null);
  const [selectedAtsId, setSelectedAtsId] = useState(null);
  const [selectedHighRiskId, setSelectedHighRiskId] = useState(null);

  // AUTO-SELECT FIRST RECORD ON MOUNT OR TAB CHANGE
  useEffect(() => {
    if (activeTab === 'heights' && heightsPermits.length > 0 && !selectedHeightsId) {
      setSelectedHeightsId(heightsPermits[0].id);
    }
    if (activeTab === 'ats' && atsList.length > 0 && !selectedAtsId) {
      setSelectedAtsId(atsList[0].id);
    }
    if (activeTab === 'highrisk' && highRiskPermits.length > 0 && !selectedHighRiskId) {
      setSelectedHighRiskId(highRiskPermits[0].id);
    }
  }, [activeTab, heightsPermits, atsList, highRiskPermits, selectedHeightsId, selectedAtsId, selectedHighRiskId]);

  // MODALS STATE
  const [isHeightsModalOpen, setIsHeightsModalOpen] = useState(false);
  const [isAtsModalOpen, setIsAtsModalOpen] = useState(false);
  const [isHighRiskModalOpen, setIsHighRiskModalOpen] = useState(false);

  // FORMS STATE
  const [heightsForm, setHeightsForm] = useState({
    date: new Date().toISOString().split('T')[0],
    location: '',
    description: '',
    worker: '',
    helper: '',
    supervisor: '',
    epccChecklist: {
      harness: false,
      sling: false,
      lifeline: false,
      anchorPoints: false,
      helmet: false,
      connectors: false
    },
    healthSelfDeclaration: false,
    project: '',
    city: '',
    client: ''
  });

  const [atsForm, setAtsForm] = useState({
    date: new Date().toISOString().split('T')[0],
    process: 'Operaciones e Infraestructura',
    activity: '',
    tools: '',
    team: '',
    project: '',
    city: '',
    client: ''
  });
  const [atsSteps, setAtsSteps] = useState([]); // Dynamic list of steps for ATS modal
  const [newStep, setNewStep] = useState({ step: '', hazard: '', consequences: '', controls: '' });

  const [highRiskForm, setHighRiskForm] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'Trabajo en Caliente',
    location: '',
    description: '',
    supervisor: '',
    checklist: {
      lotoApplied: 'Pendiente',
      gasAtmosphere: 'Pendiente',
      fireWatcher: '',
      extinguisherReady: 'Pendiente',
      hotPpe: 'Pendiente'
    },
    oxygenLevel: '',
    lelLevel: '',
    coLevel: '',
    project: '',
    city: '',
    client: ''
  });

  // FICHA INTERACTIVE FORMS
  const [heightsApprovalForm, setHeightsApprovalForm] = useState({
    status: 'Pendiente',
    approvalRemarks: '',
    approvalFile: null
  });

  const [highRiskApprovalForm, setHighRiskApprovalForm] = useState({
    status: 'Pendiente',
    approvalRemarks: ''
  });

  // GET ACTIVE SELECTIONS
  const selectedHeightsPermit = useMemo(() => {
    return heightsPermits.find(p => p.id === selectedHeightsId);
  }, [heightsPermits, selectedHeightsId]);

  const selectedAts = useMemo(() => {
    return atsList.find(a => a.id === selectedAtsId);
  }, [atsList, selectedAtsId]);

  const selectedHighRiskPermit = useMemo(() => {
    return highRiskPermits.find(p => p.id === selectedHighRiskId);
  }, [highRiskPermits, selectedHighRiskId]);

  // SYNC FICHA APPROVAL FORMS WHEN SELECTION CHANGES
  useEffect(() => {
    if (selectedHeightsPermit) {
      setHeightsApprovalForm({
        status: selectedHeightsPermit.status || 'Pendiente',
        approvalRemarks: selectedHeightsPermit.approvalRemarks || '',
        approvalFile: selectedHeightsPermit.approvalFile || null
      });
    }
  }, [selectedHeightsId, selectedHeightsPermit]);

  useEffect(() => {
    if (selectedHighRiskPermit) {
      setHighRiskApprovalForm({
        status: selectedHighRiskPermit.status || 'Pendiente',
        approvalRemarks: selectedHighRiskPermit.approvalRemarks || ''
      });
    }
  }, [selectedHighRiskId, selectedHighRiskPermit]);

  // SEARCH & SGI PARAMETERS FILTERS
  const [filterProject, setFilterProject] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterClient, setFilterClient] = useState('');

  const filteredHeights = heightsPermits.filter(p => {
    const matchSearch = p.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.worker.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchProject = !filterProject || p.project === filterProject;
    const matchCity = !filterCity || p.city === filterCity;
    const matchClient = !filterClient || p.client === filterClient;
    return matchSearch && matchProject && matchCity && matchClient;
  });

  const filteredAts = atsList.filter(a => {
    const matchSearch = a.activity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.process.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.tools.toLowerCase().includes(searchTerm.toLowerCase());
    const matchProject = !filterProject || a.project === filterProject;
    const matchCity = !filterCity || a.city === filterCity;
    const matchClient = !filterClient || a.client === filterClient;
    return matchSearch && matchProject && matchCity && matchClient;
  });

  const filteredHighRisk = highRiskPermits.filter(p => {
    const matchSearch = p.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchProject = !filterProject || p.project === filterProject;
    const matchCity = !filterCity || p.city === filterCity;
    const matchClient = !filterClient || p.client === filterClient;
    return matchSearch && matchProject && matchCity && matchClient;
  });

  // METRICS COMPUTATIONS
  const heightsMetrics = useMemo(() => {
    return {
      total: heightsPermits.length,
      approved: heightsPermits.filter(p => p.status === 'Aprobado').length,
      pending: heightsPermits.filter(p => p.status === 'Pendiente').length,
      cancelled: heightsPermits.filter(p => p.status === 'Cancelado').length
    };
  }, [heightsPermits]);

  const highRiskMetrics = useMemo(() => {
    return {
      total: highRiskPermits.length,
      caliente: highRiskPermits.filter(p => p.type === 'Trabajo en Caliente').length,
      confinado: highRiskPermits.filter(p => p.type === 'Espacio Confinado').length,
      electrico: highRiskPermits.filter(p => p.type === 'Eléctrico').length
    };
  }, [highRiskPermits]);

  // HEIGHTS PERMITS HANDLERS
  const handleOpenHeightsModal = () => {
    setHeightsForm({
      date: new Date().toISOString().split('T')[0],
      location: '',
      description: '',
      worker: '',
      helper: '',
      supervisor: APP_USERS[0]?.name || '',
      epccChecklist: {
        harness: false,
        sling: false,
        lifeline: false,
        anchorPoints: false,
        helmet: false,
        connectors: false
      },
      healthSelfDeclaration: false,
      project: '',
      city: '',
      client: ''
    });
    setIsHeightsModalOpen(true);
  };

  const handleHeightsSubmit = (e) => {
    e.preventDefault();
    const newId = Date.now();
    const newPermit = {
      ...heightsForm,
      id: newId,
      status: 'Pendiente',
      approvalRemarks: '',
      approvalFile: null
    };
    setHeightsPermits([...heightsPermits, newPermit]);
    setSelectedHeightsId(newId);
    setIsHeightsModalOpen(false);
  };

  const handleHeightsApprovalSubmit = (e) => {
    e.preventDefault();
    if (!selectedHeightsId) return;
    setHeightsPermits(heightsPermits.map(p => p.id === selectedHeightsId ? {
      ...p,
      status: heightsApprovalForm.status,
      approvalRemarks: heightsApprovalForm.approvalRemarks,
      approvalFile: heightsApprovalForm.approvalFile
    } : p));
    alert('[Control SST] Permiso de alturas actualizado correctamente.');
  };

  const handleHeightsFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setHeightsApprovalForm(prev => ({ ...prev, approvalFile: file.name }));
    }
  };

  const handleHeightsDelete = (id) => {
    if (window.confirm('¿Está seguro de eliminar este permiso de alturas?')) {
      const remaining = heightsPermits.filter(p => p.id !== id);
      setHeightsPermits(remaining);
      if (selectedHeightsId === id) {
        setSelectedHeightsId(remaining[0]?.id || null);
      }
    }
  };

  // ATS HANDLERS
  const handleOpenAtsModal = () => {
    setAtsForm({
      date: new Date().toISOString().split('T')[0],
      process: 'Operaciones e Infraestructura',
      activity: '',
      tools: '',
      team: '',
      project: '',
      city: '',
      client: ''
    });
    setAtsSteps([]);
    setNewStep({ step: '', hazard: '', consequences: '', controls: '' });
    setIsAtsModalOpen(true);
  };

  const handleAddAtsStep = (e) => {
    e.preventDefault();
    if (!newStep.step || !newStep.hazard) return;
    setAtsSteps([...atsSteps, { ...newStep, id: Date.now() }]);
    setNewStep({ step: '', hazard: '', consequences: '', controls: '' });
  };

  const handleRemoveAtsStep = (id) => {
    setAtsSteps(atsSteps.filter(s => s.id !== id));
  };

  const handleAtsSubmit = (e) => {
    e.preventDefault();
    if (atsSteps.length === 0) {
      alert('Debe registrar por lo menos un paso en el ATS.');
      return;
    }
    const newId = Date.now();
    const newAts = {
      ...atsForm,
      id: newId,
      steps: atsSteps
    };
    setAtsList([...atsList, newAts]);
    setSelectedAtsId(newId);
    setIsAtsModalOpen(false);
  };

  const handleAtsDelete = (id) => {
    if (window.confirm('¿Está seguro de eliminar este ATS?')) {
      const remaining = atsList.filter(a => a.id !== id);
      setAtsList(remaining);
      if (selectedAtsId === id) {
        setSelectedAtsId(remaining[0]?.id || null);
      }
    }
  };

  // HIGH RISK PERMITS HANDLERS
  const handleOpenHighRiskModal = () => {
    setHighRiskForm({
      date: new Date().toISOString().split('T')[0],
      type: 'Trabajo en Caliente',
      location: '',
      description: '',
      supervisor: APP_USERS[0]?.name || '',
      checklist: {
        lotoApplied: 'Pendiente',
        gasAtmosphere: 'Pendiente',
        fireWatcher: '',
        extinguisherReady: 'Pendiente',
        hotPpe: 'Pendiente'
      },
      oxygenLevel: '',
      lelLevel: '',
      coLevel: '',
      project: '',
      city: '',
      client: ''
    });
    setIsHighRiskModalOpen(true);
  };

  const handleHighRiskSubmit = (e) => {
    e.preventDefault();
    const newId = Date.now();
    const newPermit = {
      ...highRiskForm,
      id: newId,
      status: 'Pendiente',
      approvalRemarks: ''
    };
    setHighRiskPermits([...highRiskPermits, newPermit]);
    setSelectedHighRiskId(newId);
    setIsHighRiskModalOpen(false);
  };

  const handleHighRiskApprovalSubmit = (e) => {
    e.preventDefault();
    if (!selectedHighRiskId) return;
    setHighRiskPermits(highRiskPermits.map(p => p.id === selectedHighRiskId ? {
      ...p,
      status: highRiskApprovalForm.status,
      approvalRemarks: highRiskApprovalForm.approvalRemarks
    } : p));
    alert('[Control SST] Permiso de alto riesgo actualizado correctamente.');
  };

  const handleHighRiskDelete = (id) => {
    if (window.confirm('¿Está seguro de eliminar este permiso?')) {
      const remaining = highRiskPermits.filter(p => p.id !== id);
      setHighRiskPermits(remaining);
      if (selectedHighRiskId === id) {
        setSelectedHighRiskId(remaining[0]?.id || null);
      }
    }
  };

  // EXPORT TO CSV HANDLER
  const handleExport = () => {
    if (activeTab === 'heights') {
      downloadCSV(heightsPermits.map(p => ({
        Fecha: p.date,
        Ubicación: p.location,
        Descripción: p.description,
        Trabajador: p.worker,
        Ayudante: p.helper,
        Supervisor: p.supervisor,
        Estado: p.status,
        Comentarios_Aprobación: p.approvalRemarks
      })), "Permisos_Trabajo_Alturas");
    } else if (activeTab === 'ats') {
      const flatAts = [];
      atsList.forEach(a => {
        a.steps.forEach((s, idx) => {
          flatAts.push({
            ATS_ID: a.id,
            Fecha: a.date,
            Proceso: a.process,
            Actividad: a.activity,
            Paso: idx + 1,
            Descripcion_Paso: s.step,
            Peligro: s.hazard,
            Consecuencia: s.consequences,
            Control: s.controls
          });
        });
      });
      downloadCSV(flatAts, "Analisis_Trabajo_Seguro_ATS");
    } else {
      downloadCSV(highRiskPermits.map(p => ({
        Fecha: p.date,
        Tipo_Tarea: p.type,
        Ubicación: p.location,
        Descripción: p.description,
        Supervisor: p.supervisor,
        Estado: p.status,
        Nivel_Oxigeno: p.oxygenLevel || 'N/A',
        Nivel_Gases_LEL: p.lelLevel || 'N/A',
        LOTO_Bloqueo: p.checklist.lotoApplied,
        Vigia_Fuego: p.checklist.fireWatcher || 'N/A',
        Comentarios: p.approvalRemarks
      })), "Permisos_Tareas_Alto_Riesgo");
    }
  };

  return (
    <>
      <style>{`
        .sst-row {
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        .sst-row:hover {
          background-color: var(--bg-secondary) !important;
        }
        .sst-row.active {
          background-color: var(--bg-tertiary) !important;
          border-left: 4px solid var(--accent-primary) !important;
        }
        .checklist-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 0.5rem;
        }
        .checklist-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--bg-secondary);
          padding: 0.5rem;
          border-radius: 4px;
          border: 1px solid var(--border-color);
          font-size: 0.82rem;
          font-weight: 500;
        }
        .step-builder {
          background: var(--bg-secondary);
          padding: 0.75rem;
          border-radius: 6px;
          border: 1px solid var(--border-color);
          margin-bottom: 0.5rem;
        }
      `}</style>

      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Control Operacional HSEQ (SST)</p>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert style={{ color: 'var(--danger)' }} /> Módulo Control SST
          </h2>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button className="btn-secondary" onClick={handleExport}><Download size={16} /> Exportar CSV</button>
          {activeTab === 'heights' && (
            <button className="btn-primary" onClick={handleOpenHeightsModal}><Plus size={16} /> Registrar Permiso Alturas</button>
          )}
          {activeTab === 'ats' && (
            <button className="btn-primary" onClick={handleOpenAtsModal}><Plus size={16} /> Crear Análisis ATS</button>
          )}
          {activeTab === 'highrisk' && (
            <button className="btn-primary" onClick={handleOpenHighRiskModal}><Plus size={16} /> Crear Permiso Alto Riesgo</button>
          )}
        </div>
      </div>

      {/* METRICS ROW (Heights or High Risk dependent) */}
      {activeTab === 'heights' && (
        <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
          <div className="card" style={{ borderLeft: '4px solid var(--accent-primary)', marginBottom: 0 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Permisos Totales</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.25rem' }}>{heightsMetrics.total}</div>
          </div>
          <div className="card" style={{ borderLeft: '4px solid var(--success)', marginBottom: 0 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Aprobados / Activos</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--success)', marginTop: '0.25rem' }}>{heightsMetrics.approved}</div>
          </div>
          <div className="card" style={{ borderLeft: '4px solid var(--warning)', marginBottom: 0 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Pendientes por Validar</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--warning)', marginTop: '0.25rem' }}>{heightsMetrics.pending}</div>
          </div>
          <div className="card" style={{ borderLeft: '4px solid var(--danger)', marginBottom: 0 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Cancelados / Rechazados</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--danger)', marginTop: '0.25rem' }}>{heightsMetrics.cancelled}</div>
          </div>
        </div>
      )}

      {activeTab === 'ats' && (
        <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
          <div className="card" style={{ borderLeft: '4px solid var(--accent-primary)', marginBottom: 0 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Análisis ATS Totales</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.25rem' }}>{atsList.length}</div>
          </div>
          <div className="card" style={{ borderLeft: '4px solid var(--info)', marginBottom: 0 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Procesos Cubiertos</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--info)', marginTop: '0.25rem' }}>
              {new Set(atsList.map(a => a.process)).size}
            </div>
          </div>
          <div className="card" style={{ borderLeft: '4px solid var(--success)', marginBottom: 0 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Pasos de Tareas Documentados</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--success)', marginTop: '0.25rem' }}>
              {atsList.reduce((acc, curr) => acc + (curr.steps?.length || 0), 0)}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'highrisk' && (
        <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
          <div className="card" style={{ borderLeft: '4px solid var(--accent-primary)', marginBottom: 0 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Total Permisos Alto Riesgo</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.25rem' }}>{highRiskMetrics.total}</div>
          </div>
          <div className="card" style={{ borderLeft: '4px solid var(--danger)', marginBottom: 0 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Trabajos en Caliente</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--danger)', marginTop: '0.25rem' }}>{highRiskMetrics.caliente}</div>
          </div>
          <div className="card" style={{ borderLeft: '4px solid var(--warning)', marginBottom: 0 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Espacios Confinados</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--warning)', marginTop: '0.25rem' }}>{highRiskMetrics.confinado}</div>
          </div>
          <div className="card" style={{ borderLeft: '4px solid var(--info)', marginBottom: 0 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Eléctrico (Bloqueo LOTO)</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--info)', marginTop: '0.25rem' }}>{highRiskMetrics.electrico}</div>
          </div>
        </div>
      )}

      {/* BARRA DE FILTROS DE PARAMETRIZACIÓN SGI */}
      <div style={{
        background: 'var(--bg-secondary)', 
        padding: '0.66rem 1rem', 
        borderRadius: '8px', 
        border: '1px solid var(--border-color)', 
        marginBottom: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.85rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-primary)', fontWeight: 700, fontSize: '0.82rem' }}>
          <ShieldAlert size={15} /> Filtros SGI:
        </div>

        <div style={{ flex: '1 1 160px', minWidth: '130px' }}>
          <select 
            className="form-control" 
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.6rem', margin: 0 }}
            value={filterProject}
            onChange={e => setFilterProject(e.target.value)}
          >
            <option value="">Todos los Proyectos</option>
            {projectOptions.map((p, idx) => (
              <option key={idx} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div style={{ flex: '1 1 160px', minWidth: '130px' }}>
          <select 
            className="form-control" 
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.6rem', margin: 0 }}
            value={filterCity}
            onChange={e => setFilterCity(e.target.value)}
          >
            <option value="">Todas las Ciudades</option>
            {cityOptions.map((c, idx) => (
              <option key={idx} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div style={{ flex: '1 1 160px', minWidth: '130px' }}>
          <select 
            className="form-control" 
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.6rem', margin: 0 }}
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
            style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', color: 'var(--danger)', borderColor: 'var(--danger)' }}
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

      {/* TABS NAVIGATION */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button 
          className={`btn-secondary ${activeTab === 'heights' ? 'active' : ''}`}
          style={{ border: 'none', background: activeTab === 'heights' ? 'rgba(14, 165, 233, 0.1)' : 'transparent', color: activeTab === 'heights' ? 'var(--accent-primary)' : 'var(--text-secondary)', fontWeight: 600 }}
          onClick={() => { setActiveTab('heights'); setSearchTerm(''); }}
        >
          <HardHat size={14} style={{ marginRight: '4px' }} /> Permiso Alturas ({heightsPermits.length})
        </button>
        <button 
          className={`btn-secondary ${activeTab === 'ats' ? 'active' : ''}`}
          style={{ border: 'none', background: activeTab === 'ats' ? 'rgba(16, 185, 129, 0.1)' : 'transparent', color: activeTab === 'ats' ? 'var(--success)' : 'var(--text-secondary)', fontWeight: 600 }}
          onClick={() => { setActiveTab('ats'); setSearchTerm(''); }}
        >
          <Clipboard size={14} style={{ marginRight: '4px' }} /> Análisis de Trabajo Seguro - ATS ({atsList.length})
        </button>
        <button 
          className={`btn-secondary ${activeTab === 'highrisk' ? 'active' : ''}`}
          style={{ border: 'none', background: activeTab === 'highrisk' ? 'rgba(244, 63, 94, 0.1)' : 'transparent', color: activeTab === 'highrisk' ? 'var(--danger)' : 'var(--text-secondary)', fontWeight: 600 }}
          onClick={() => { setActiveTab('highrisk'); setSearchTerm(''); }}
        >
          <Shield size={14} style={{ marginRight: '4px' }} /> Tareas de Alto Riesgo ({highRiskPermits.length})
        </button>
        <button 
          className={`btn-secondary ${activeTab === 'indicators' ? 'active' : ''}`}
          style={{ border: 'none', background: activeTab === 'indicators' ? 'rgba(168, 85, 247, 0.1)' : 'transparent', color: activeTab === 'indicators' ? 'rgb(168, 85, 247)' : 'var(--text-secondary)', fontWeight: 600 }}
          onClick={() => { setActiveTab('indicators'); setSearchTerm(''); }}
        >
          <Activity size={14} style={{ marginRight: '4px' }} /> Indicadores SST
        </button>
      </div>

      {/* SEARCH BAR */}
      {activeTab !== 'indicators' && (
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', maxWidth: '400px', width: '100%' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <input 
              type="text" 
              className="form-control" 
              placeholder={
                activeTab === 'heights' ? "Buscar por ubicación, trabajador..." :
                activeTab === 'ats' ? "Buscar por actividad, proceso..." :
                "Buscar por tipo de tarea, ubicación..."
              }
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
            />
          </div>
        </div>
      )}

      {/* TAB VIEWS */}

      {/* VIEW 1: HEIGHTS PERMITS */}
      {activeTab === 'heights' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Fecha y Lugar</th>
                  <th>Proyecto / Ubicación / Cliente</th>
                  <th>Descripción del Trabajo</th>
                  <th>Personal Involucrado</th>
                  <th>Ayudante de Seguridad</th>
                  <th>Coordinador Emisor</th>
                  <th>Estado</th>
                  <th>Soporte Digital</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredHeights.length === 0 ? (
                  <tr><td colSpan="9" style={{ textAlign: 'center', padding: '2rem' }}>No hay registros de alturas.</td></tr>
                ) : filteredHeights.map(p => {
                  let badgeClass = 'badge-warning';
                  if (p.status === 'Aprobado') badgeClass = 'badge-success';
                  if (p.status === 'Cancelado') badgeClass = 'badge-danger';
                  return (
                    <tr 
                      key={p.id} 
                      className={`sst-row ${p.id === selectedHeightsId ? 'active' : ''}`}
                      onClick={() => setSelectedHeightsId(p.id)}
                    >
                      <td>
                        <strong>{p.date}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{p.location}</div>
                      </td>
                      <td>
                        {p.project && <div style={{fontSize:'0.78rem', color:'var(--accent-primary)', fontWeight:600}}>Proy: {p.project}</div>}
                        {p.city && <div style={{fontSize:'0.75rem', color:'var(--text-muted)'}}>Ciudad: {p.city}</div>}
                        {p.client && <div style={{fontSize:'0.75rem', color:'var(--success)'}}>Cliente: {p.client}</div>}
                        {!p.project && !p.city && !p.client && <span style={{color:'var(--text-muted)', fontSize:'0.8rem'}}>-</span>}
                      </td>
                      <td style={{ fontSize: '0.85rem', maxWidth: '200px' }}>{p.description}</td>
                      <td style={{ fontWeight: 600 }}>{p.worker}</td>
                      <td style={{ fontSize: '0.85rem' }}>{p.helper}</td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{p.supervisor}</td>
                      <td><span className={`badge ${badgeClass}`}>{p.status}</span></td>
                      <td>
                        {p.approvalFile ? (
                          <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <FileText size={12} /> {p.approvalFile}
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Sin soporte digital</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.25rem' }} onClick={e => e.stopPropagation()}>
                          <button className="btn-icon" style={{ padding: '0.25rem', color: 'var(--danger)' }} onClick={() => handleHeightsDelete(p.id)} title="Eliminar"><Trash2 size={14} /></button>
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

      {/* VIEW 2: ATS */}
      {activeTab === 'ats' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Fecha y Proceso</th>
                  <th>Proyecto / Ubicación / Cliente</th>
                  <th>Actividad</th>
                  <th>Herramientas Planificadas</th>
                  <th>Equipo de Trabajo</th>
                  <th>Cantidad de Pasos</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredAts.length === 0 ? (
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>No hay análisis ATS registrados.</td></tr>
                ) : filteredAts.map(a => (
                  <tr 
                    key={a.id}
                    className={`sst-row ${a.id === selectedAtsId ? 'active' : ''}`}
                    onClick={() => setSelectedAtsId(a.id)}
                  >
                    <td>
                      <strong>{a.date}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{a.process}</div>
                    </td>
                    <td>
                      {a.project && <div style={{fontSize:'0.78rem', color:'var(--accent-primary)', fontWeight:600}}>Proy: {a.project}</div>}
                      {a.city && <div style={{fontSize:'0.75rem', color:'var(--text-muted)'}}>Ciudad: {a.city}</div>}
                      {a.client && <div style={{fontSize:'0.75rem', color:'var(--success)'}}>Cliente: {a.client}</div>}
                      {!a.project && !a.city && !a.client && <span style={{color:'var(--text-muted)', fontSize:'0.8rem'}}>-</span>}
                    </td>
                    <td style={{ fontWeight: 600, fontSize: '0.88rem', maxWidth: '220px' }}>{a.activity}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '200px' }}>{a.tools}</td>
                    <td style={{ fontSize: '0.8rem' }}>{a.team}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge badge-info" style={{ fontSize: '0.9rem' }}>{a.steps?.length || 0}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.25rem' }} onClick={e => e.stopPropagation()}>
                        <button className="btn-icon" style={{ padding: '0.25rem', color: 'var(--danger)' }} onClick={() => handleAtsDelete(a.id)} title="Eliminar"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: HIGH RISK PERMITS */}
      {activeTab === 'highrisk' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Fecha y Lugar</th>
                  <th>Proyecto / Ubicación / Cliente</th>
                  <th>Tipo de Tarea</th>
                  <th>Descripción de la Tarea</th>
                  <th>Supervisor Emisor</th>
                  <th>Detalle Controles</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredHighRisk.length === 0 ? (
                  <tr><td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>No hay permisos de alto riesgo registrados.</td></tr>
                ) : filteredHighRisk.map(p => {
                  let badgeClass = 'badge-warning';
                  if (p.status === 'Aprobado') badgeClass = 'badge-success';
                  if (p.status === 'Cancelado') badgeClass = 'badge-danger';
                  
                  let typeBadge = 'badge-danger'; // caliente
                  if (p.type === 'Espacio Confinado') typeBadge = 'badge-warning';
                  if (p.type === 'Eléctrico') typeBadge = 'badge-info';
                  if (p.type === 'Excavación' || p.type === 'Izaje de Cargas') typeBadge = 'badge-success';
                  
                  return (
                    <tr 
                      key={p.id}
                      className={`sst-row ${p.id === selectedHighRiskId ? 'active' : ''}`}
                      onClick={() => setSelectedHighRiskId(p.id)}
                    >
                      <td>
                        <strong>{p.date}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{p.location}</div>
                      </td>
                      <td>
                        {p.project && <div style={{fontSize:'0.78rem', color:'var(--accent-primary)', fontWeight:600}}>Proy: {p.project}</div>}
                        {p.city && <div style={{fontSize:'0.75rem', color:'var(--text-muted)'}}>Ciudad: {p.city}</div>}
                        {p.client && <div style={{fontSize:'0.75rem', color:'var(--success)'}}>Cliente: {p.client}</div>}
                        {!p.project && !p.city && !p.client && <span style={{color:'var(--text-muted)', fontSize:'0.8rem'}}>-</span>}
                      </td>
                      <td><span className={`badge ${typeBadge}`}>{p.type}</span></td>
                      <td style={{ fontSize: '0.85rem', maxWidth: '220px' }}>{p.description}</td>
                      <td style={{ fontWeight: 600 }}>{p.supervisor}</td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        {p.type === 'Trabajo en Caliente' && `Vigía: ${p.checklist.fireWatcher || 'N/A'}`}
                        {p.type === 'Espacio Confinado' && `O2: ${p.oxygenLevel || 'N/A'}% | CO: ${p.coLevel || 'N/A'}ppm`}
                        {p.type === 'Eléctrico' && `LOTO: ${p.checklist.lotoApplied}`}
                        {p.type !== 'Trabajo en Caliente' && p.type !== 'Espacio Confinado' && p.type !== 'Eléctrico' && 'Estándar HSEQ'}
                      </td>
                      <td><span className={`badge ${badgeClass}`}>{p.status}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.25rem' }} onClick={e => e.stopPropagation()}>
                          <button className="btn-icon" style={{ padding: '0.25rem', color: 'var(--danger)' }} onClick={() => handleHighRiskDelete(p.id)} title="Eliminar"><Trash2 size={14} /></button>
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

      {/* VIEW 4: INDICATORS */}
      {activeTab === 'indicators' && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
          
          {/* Slider Row */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: 700 }}>Ajuste de Exposición Laboral</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Horas Hombre de Exposición del Período: <strong>{manHours.toLocaleString()} h</strong>
                </label>
                <input 
                  type="range" 
                  min="50000" 
                  max="1000000" 
                  step="10000" 
                  value={manHours} 
                  onChange={e => setManHours(Number(e.target.value))} 
                  style={{ width: '100%', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                />
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', borderLeft: '2px solid var(--border-color)', paddingLeft: '1rem' }}>
                Ajuste el valor para recalcular las tasas de accidentalidad en tiempo real según las horas reales ejecutadas.
              </div>
            </div>
          </div>

          {/* Accident Metrics Row */}
          <div className="grid-3">
            {/* KPI 1: Accidentes Totales */}
            <div className="card" style={{ borderTop: '4px solid var(--danger)', marginBottom: 0 }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Accidentes Reportados</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.25rem', color: 'var(--danger)' }}>{accidents.length}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Leves: {accidents.filter(a => a.classification === 'Leve').length} | Graves: {accidents.filter(a => a.classification === 'Grave').length}
              </div>
            </div>

            {/* KPI 2: IFA (Índice de Frecuencia) */}
            {(() => {
              const ifa = ((accidents.length * 240000) / manHours).toFixed(2);
              const isHigh = Number(ifa) > 2.0;
              return (
                <div className="card" style={{ borderTop: `4px solid ${isHigh ? 'var(--danger)' : 'var(--success)'}`, marginBottom: 0 }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Índice de Frecuencia (IFA)</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.25rem', color: isHigh ? 'var(--danger)' : 'var(--success)' }}>{ifa}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    Fórmula: (Nº Acc. * 240k) / HHT. Meta estándar: &lt; 2.0
                  </div>
                </div>
              );
            })()}

            {/* KPI 3: IGA (Índice de Gravedad) */}
            {(() => {
              const totalDays = accidents.reduce((acc, curr) => acc + (curr.classification === 'Leve' ? 2 : curr.classification === 'Grave' ? 15 : curr.classification === 'Severo' ? 30 : 60), 0);
              const iga = ((totalDays * 240000) / manHours).toFixed(2);
              const isHigh = Number(iga) > 10.0;
              return (
                <div className="card" style={{ borderTop: `4px solid ${isHigh ? 'var(--danger)' : 'var(--success)'}`, marginBottom: 0 }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Índice de Gravedad (IGA)</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.25rem', color: isHigh ? 'var(--danger)' : 'var(--success)' }}>{iga}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    Días perdidos est: {totalDays} | Meta estándar: &lt; 10.0
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Graphical Analysis Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', flexWrap: 'wrap' }}>
            
            {/* Chart 1: Bar Chart of SST elements */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 700 }}>Comparativo de Documentos y Permisos HSEQ</h3>
              {(() => {
                const heightsCount = heightsPermits.length;
                const atsCount = atsList.length;
                const highRiskCount = highRiskPermits.length;
                const maxVal = Math.max(heightsCount, atsCount, highRiskCount, 1);
                const heightsHeight = (heightsCount / maxVal) * 120;
                const atsHeight = (atsCount / maxVal) * 120;
                const highRiskHeight = (highRiskCount / maxVal) * 120;

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <svg viewBox="0 0 400 180" style={{ width: '100%', height: '180px', overflow: 'visible' }}>
                      {/* Grid Lines */}
                      <line x1="40" y1="140" x2="380" y2="140" stroke="var(--border-color)" strokeWidth="1" />
                      <line x1="40" y1="80" x2="380" y2="80" stroke="var(--border-color)" strokeDasharray="3" strokeWidth="0.5" />
                      <line x1="40" y1="20" x2="380" y2="20" stroke="var(--border-color)" strokeDasharray="3" strokeWidth="0.5" />

                      {/* Bar 1: Alturas */}
                      <rect x="70" y={140 - heightsHeight} width="40" height={heightsHeight} fill="var(--accent-primary)" rx="4" style={{ transition: 'all 0.3s' }} />
                      <text x="90" y={135 - heightsHeight} textAnchor="middle" fill="var(--text-primary)" fontSize="10" fontWeight="bold">{heightsCount}</text>
                      
                      {/* Bar 2: ATS */}
                      <rect x="180" y={140 - atsHeight} width="40" height={atsHeight} fill="var(--success)" rx="4" style={{ transition: 'all 0.3s' }} />
                      <text x="200" y={135 - atsHeight} textAnchor="middle" fill="var(--text-primary)" fontSize="10" fontWeight="bold">{atsCount}</text>

                      {/* Bar 3: Alto Riesgo */}
                      <rect x="290" y={140 - highRiskHeight} width="40" height={highRiskHeight} fill="var(--danger)" rx="4" style={{ transition: 'all 0.3s' }} />
                      <text x="310" y={135 - highRiskHeight} textAnchor="middle" fill="var(--text-primary)" fontSize="10" fontWeight="bold">{highRiskCount}</text>

                      {/* X Labels */}
                      <text x="90" y="155" textAnchor="middle" fill="var(--text-secondary)" fontSize="9">Permisos Alturas</text>
                      <text x="200" y="155" textAnchor="middle" fill="var(--text-secondary)" fontSize="9">Análisis ATS</text>
                      <text x="310" y="155" textAnchor="middle" fill="var(--text-secondary)" fontSize="9">Alto Riesgo</text>
                    </svg>
                  </div>
                );
              })()}
            </div>

            {/* Chart 2: High Risk task types distribution */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 700 }}>Tareas de Alto Riesgo por Categoría</h3>
              {(() => {
                const caliente = highRiskPermits.filter(p => p.type === 'Trabajo en Caliente').length;
                const confinado = highRiskPermits.filter(p => p.type === 'Espacio Confinado').length;
                const electrico = highRiskPermits.filter(p => p.type === 'Eléctrico').length;
                const totalHR = caliente + confinado + electrico || 1;

                const calientePct = Math.round((caliente / totalHR) * 100);
                const confinadoPct = Math.round((confinado / totalHR) * 100);
                const electricoPct = Math.round((electrico / totalHR) * 100);

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '0.5rem' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.25rem' }}>
                        <span>Trabajo en Caliente</span>
                        <strong>{caliente} ({calientePct}%)</strong>
                      </div>
                      <div className="progress-bar" style={{ height: '8px' }}>
                        <div className="progress-fill" style={{ width: `${calientePct}%`, background: 'var(--danger)' }}></div>
                      </div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.25rem' }}>
                        <span>Espacio Confinado</span>
                        <strong>{confinado} ({confinadoPct}%)</strong>
                      </div>
                      <div className="progress-bar" style={{ height: '8px' }}>
                        <div className="progress-fill" style={{ width: `${confinadoPct}%`, background: 'var(--warning)' }}></div>
                      </div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.25rem' }}>
                        <span>Eléctrico (Bloqueo LOTO)</span>
                        <strong>{electrico} ({electricoPct}%)</strong>
                      </div>
                      <div className="progress-bar" style={{ height: '8px' }}>
                        <div className="progress-fill" style={{ width: `${electricoPct}%`, background: 'var(--info)' }}></div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

          </div>
        </div>
      )}


      {/* LOWER INTERACTIVE PANEL (DETAIL SHEETS) */}

      {/* HEIGHTS PERMIT DETAILS */}
      {activeTab === 'heights' && selectedHeightsPermit && (
        <div className="card fade-in" style={{ marginTop: '1.5rem', padding: '1.25rem', borderLeft: '4px solid var(--accent-primary)', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <span className="badge badge-info" style={{ marginBottom: '0.25rem', display: 'inline-block' }}><Compass size={10} style={{ marginRight: '4px' }} /> Ficha de Permiso de Trabajo en Alturas</span>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{selectedHeightsPermit.description}</h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Fecha: <strong>{selectedHeightsPermit.date}</strong> | Ubicación: <strong>{selectedHeightsPermit.location}</strong>
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button 
                className="btn-secondary" 
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                onClick={() => printHseqDocument('heights', selectedHeightsPermit)}
              >
                <FileText size={12} /> Imprimir PDF HSEQ
              </button>
              <span className={`badge ${selectedHeightsPermit.status === 'Aprobado' ? 'badge-success' : selectedHeightsPermit.status === 'Cancelado' ? 'badge-danger' : 'badge-warning'}`} style={{ fontSize: '0.85rem', padding: '0.25rem 0.5rem' }}>
                {selectedHeightsPermit.status}
              </span>
            </div>
          </div>

          <div className="grid-2" style={{ gap: '1.25rem' }}>
            {/* Left Col: EPCC checklists */}
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Verificación de Equipos Contra Caídas (EPCC)</h4>
              <div className="checklist-grid" style={{ marginBottom: '0.75rem' }}>
                <div className="checklist-item">
                  {selectedHeightsPermit.epccChecklist?.harness ? <Check size={14} style={{ color: 'var(--success)' }} /> : <X size={14} style={{ color: 'var(--danger)' }} />}
                  Arnés Multipropósito
                </div>
                <div className="checklist-item">
                  {selectedHeightsPermit.epccChecklist?.sling ? <Check size={14} style={{ color: 'var(--success)' }} /> : <X size={14} style={{ color: 'var(--danger)' }} />}
                  Eslinga de Posicionamiento
                </div>
                <div className="checklist-item">
                  {selectedHeightsPermit.epccChecklist?.lifeline ? <Check size={14} style={{ color: 'var(--success)' }} /> : <X size={14} style={{ color: 'var(--danger)' }} />}
                  Línea de Vida / Conectores
                </div>
                <div className="checklist-item">
                  {selectedHeightsPermit.epccChecklist?.anchorPoints ? <Check size={14} style={{ color: 'var(--success)' }} /> : <X size={14} style={{ color: 'var(--danger)' }} />}
                  Puntos de Anclaje Probados
                </div>
                <div className="checklist-item">
                  {selectedHeightsPermit.epccChecklist?.helmet ? <Check size={14} style={{ color: 'var(--success)' }} /> : <X size={14} style={{ color: 'var(--danger)' }} />}
                  Casco con Barbuquejo
                </div>
                <div className="checklist-item">
                  {selectedHeightsPermit.epccChecklist?.connectors ? <Check size={14} style={{ color: 'var(--success)' }} /> : <X size={14} style={{ color: 'var(--danger)' }} />}
                  Mosquetones / Eslinga Absorción
                </div>
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>Declaración Física del Colaborador:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '0.25rem' }}>
                  <UserCheck size={14} style={{ color: 'var(--success)' }} />
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {selectedHeightsPermit.worker} declara encontrarse en condiciones óptimas de salud.
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  Ayudante de Seguridad HSEQ asignado: <strong>{selectedHeightsPermit.helper}</strong>
                </div>
              </div>
            </div>

            {/* Right Col: Approval / Sign form */}
            <form onSubmit={handleHeightsApprovalSubmit} style={{ background: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: '6px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem', margin: 0 }}>Validación y Aprobación del Supervisor</h4>
              
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.72rem' }}>Estado del Permiso de Alturas</label>
                <select 
                  className="form-control" 
                  style={{ fontSize: '0.78rem', padding: '0.25rem' }}
                  value={heightsApprovalForm.status}
                  onChange={e => setHeightsApprovalForm({ ...heightsApprovalForm, status: e.target.value })}
                  required
                >
                  <option value="Pendiente">Pendiente por Validar</option>
                  <option value="Aprobado">Aprobado / Trabajo Autorizado</option>
                  <option value="Cancelado">Cancelado / Trabajos Suspendidos</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.72rem' }}>Comentarios / Observaciones de Seguridad</label>
                <textarea 
                  className="form-control" 
                  style={{ fontSize: '0.78rem' }}
                  rows="2"
                  value={heightsApprovalForm.approvalRemarks}
                  onChange={e => setHeightsApprovalForm({ ...heightsApprovalForm, approvalRemarks: e.target.value })}
                  placeholder="Registre estado de andamios, condiciones de viento, EPP..."
                ></textarea>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.72rem' }}>Cargar Documento de Permiso Escaneado (PDF/Foto)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-primary)', padding: '0.35rem 0.5rem', borderRadius: '4px', border: '1px dashed var(--border-color)' }}>
                  <input 
                    type="file" 
                    id="file-heights-approval" 
                    style={{ display: 'none' }}
                    onChange={handleHeightsFileChange} 
                  />
                  <label htmlFor="file-heights-approval" className="btn-secondary" style={{ cursor: 'pointer', margin: 0, padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}>
                    <Upload size={12} style={{ marginRight: '3px' }} /> Adjuntar Soporte
                  </label>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>
                    {heightsApprovalForm.approvalFile || 'Sin archivo digital...'}
                  </span>
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ padding: '0.35rem 0.5rem', fontSize: '0.78rem', alignSelf: 'flex-end', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '0.25rem' }}>
                <CheckCircle size={12} /> Guardar Autorización
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ATS DETAILS VIEW */}
      {activeTab === 'ats' && selectedAts && (
        <div className="card fade-in" style={{ marginTop: '1.5rem', padding: '1.25rem', borderLeft: '4px solid var(--success)', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <div>
              <span className="badge badge-success" style={{ marginBottom: '0.25rem', display: 'inline-block' }}><ClipboardCheck size={10} style={{ marginRight: '4px' }} /> Desglose Técnico del ATS</span>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{selectedAts.activity}</h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                Proceso: <strong>{selectedAts.process}</strong> | Fecha: <strong>{selectedAts.date}</strong> | Herramientas: <strong>{selectedAts.tools}</strong>
              </p>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Equipo Responsable en Sitio: <strong style={{ color: 'var(--text-primary)' }}>{selectedAts.team}</strong>
              </p>
            </div>
            <div>
              <button 
                className="btn-secondary" 
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                onClick={() => printHseqDocument('ats', selectedAts)}
              >
                <FileText size={12} /> Imprimir PDF HSEQ
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto', background: 'var(--bg-secondary)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
            <table className="table" style={{ margin: 0, fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-tertiary)' }}>
                  <th style={{ width: '40px', textAlign: 'center' }}>Paso</th>
                  <th style={{ width: '250px' }}>Paso de la Tarea</th>
                  <th style={{ width: '220px' }}>Peligros Identificados</th>
                  <th style={{ width: '200px' }}>Consecuencias</th>
                  <th>Medidas de Control Requeridas</th>
                </tr>
              </thead>
              <tbody>
                {selectedAts.steps?.map((step, idx) => (
                  <tr key={step.id || idx}>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--accent-primary)' }}>{idx + 1}</td>
                    <td style={{ fontWeight: 600 }}>{step.step}</td>
                    <td style={{ color: 'var(--danger)' }}>{step.hazard}</td>
                    <td style={{ fontSize: '0.78rem' }}>{step.consequences}</td>
                    <td style={{ fontWeight: 500, color: 'var(--success)' }}>{step.controls}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* HIGH RISK PERMIT DETAILS */}
      {activeTab === 'highrisk' && selectedHighRiskPermit && (
        <div className="card fade-in" style={{ marginTop: '1.5rem', padding: '1.25rem', borderLeft: '4px solid var(--danger)', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <span className="badge badge-danger" style={{ marginBottom: '0.25rem', display: 'inline-block' }}><Shield size={10} style={{ marginRight: '4px' }} /> Permiso Especial de Trabajo de Alto Riesgo</span>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{selectedHighRiskPermit.description}</h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Tipo: <strong style={{ color: 'var(--danger)' }}>{selectedHighRiskPermit.type}</strong> | Ubicación: <strong>{selectedHighRiskPermit.location}</strong> | Supervisor: <strong>{selectedHighRiskPermit.supervisor}</strong>
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button 
                className="btn-secondary" 
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                onClick={() => printHseqDocument('highrisk', selectedHighRiskPermit)}
              >
                <FileText size={12} /> Imprimir PDF HSEQ
              </button>
              <span className={`badge ${selectedHighRiskPermit.status === 'Aprobado' ? 'badge-success' : selectedHighRiskPermit.status === 'Cancelado' ? 'badge-danger' : 'badge-warning'}`} style={{ fontSize: '0.85rem', padding: '0.25rem 0.5rem' }}>
                {selectedHighRiskPermit.status}
              </span>
            </div>
          </div>

          <div className="grid-2" style={{ gap: '1.25rem' }}>
            {/* Left Col: Special parameters based on risk type */}
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Verificación de Controles Operacionales Especiales</h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {selectedHighRiskPermit.type === 'Espacio Confinado' && (
                  <div style={{ background: 'rgba(234, 179, 8, 0.05)', border: '1px solid rgba(234, 179, 8, 0.2)', padding: '0.75rem', borderRadius: '6px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                      <Wind size={12} /> Monitoreo Atmosférico (Gases)
                    </div>
                    <div className="grid-3" style={{ gap: '0.5rem', fontSize: '0.8rem', fontWeight: 600 }}>
                      <div style={{ background: 'var(--bg-primary)', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                        Oxígeno (O2): <span style={{ color: selectedHighRiskPermit.oxygenLevel === '20.9' ? 'var(--success)' : 'var(--danger)' }}>{selectedHighRiskPermit.oxygenLevel || 'N/A'}%</span>
                      </div>
                      <div style={{ background: 'var(--bg-primary)', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                        Inflamables LEL: <span style={{ color: selectedHighRiskPermit.lelLevel === '0' ? 'var(--success)' : 'var(--danger)' }}>{selectedHighRiskPermit.lelLevel || 'N/A'}%</span>
                      </div>
                      <div style={{ background: 'var(--bg-primary)', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                        Monóxido (CO): <span style={{ color: Number(selectedHighRiskPermit.coLevel || 0) <= 25 ? 'var(--success)' : 'var(--danger)' }}>{selectedHighRiskPermit.coLevel || 'N/A'} ppm</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="checklist-grid" style={{ marginBottom: '0.25rem' }}>
                  <div className="checklist-item">
                    <Zap size={14} style={{ color: selectedHighRiskPermit.checklist?.lotoApplied === 'Cumple' ? 'var(--success)' : 'var(--text-muted)' }} />
                    Bloqueo LOTO: <strong>{selectedHighRiskPermit.checklist?.lotoApplied}</strong>
                  </div>
                  <div className="checklist-item">
                    <Activity size={14} style={{ color: selectedHighRiskPermit.checklist?.gasAtmosphere === 'Cumple' ? 'var(--success)' : 'var(--text-muted)' }} />
                    Atmósfera OK: <strong>{selectedHighRiskPermit.checklist?.gasAtmosphere}</strong>
                  </div>
                  <div className="checklist-item">
                    <Flame size={14} style={{ color: selectedHighRiskPermit.checklist?.extinguisherReady === 'Cumple' ? 'var(--success)' : 'var(--text-muted)' }} />
                    Extintor ABC: <strong>{selectedHighRiskPermit.checklist?.extinguisherReady}</strong>
                  </div>
                  <div className="checklist-item">
                    <HardHat size={14} style={{ color: selectedHighRiskPermit.checklist?.hotPpe === 'Cumple' ? 'var(--success)' : 'var(--text-muted)' }} />
                    EPP Especial: <strong>{selectedHighRiskPermit.checklist?.hotPpe}</strong>
                  </div>
                </div>

                {selectedHighRiskPermit.type === 'Trabajo en Caliente' && selectedHighRiskPermit.checklist?.fireWatcher && (
                  <div style={{ background: 'var(--bg-secondary)', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.78rem' }}>
                    Vigía de Fuego asignado en campo: <strong>{selectedHighRiskPermit.checklist.fireWatcher}</strong>
                  </div>
                )}
              </div>
            </div>

            {/* Right Col: Approval form */}
            <form onSubmit={handleHighRiskApprovalSubmit} style={{ background: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: '6px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--danger)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem', margin: 0 }}>Autorización de Tarea Crítica</h4>
              
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.72rem' }}>Estado de Permiso de Alto Riesgo</label>
                <select 
                  className="form-control" 
                  style={{ fontSize: '0.78rem', padding: '0.25rem' }}
                  value={highRiskApprovalForm.status}
                  onChange={e => setHighRiskApprovalForm({ ...highRiskApprovalForm, status: e.target.value })}
                  required
                >
                  <option value="Pendiente">Pendiente por Aprobar</option>
                  <option value="Aprobado">Aprobado / Trabajo Iniciado</option>
                  <option value="Cancelado">Cancelado / Denegado</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.72rem' }}>Comentarios del Supervisor HSEQ</label>
                <textarea 
                  className="form-control" 
                  style={{ fontSize: '0.78rem' }}
                  rows="3"
                  value={highRiskApprovalForm.approvalRemarks}
                  onChange={e => setHighRiskApprovalForm({ ...highRiskApprovalForm, approvalRemarks: e.target.value })}
                  placeholder="Escriba requerimientos especiales de ventilación, bloqueo o vigía..."
                ></textarea>
              </div>

              <button type="submit" className="btn-primary" style={{ padding: '0.35rem 0.5rem', fontSize: '0.78rem', alignSelf: 'flex-end', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '0.25rem' }}>
                <CheckCircle size={12} /> Guardar Decisión
              </button>
            </form>
          </div>
        </div>
      )}


      {/* MODAL 1: REGISTRAR TRABAJO EN ALTURAS */}
      <Modal 
        isOpen={isHeightsModalOpen} 
        onClose={() => setIsHeightsModalOpen(false)} 
        title="Crear Permiso de Trabajo en Alturas (Resolución 4272/2021)"
      >
        <form onSubmit={handleHeightsSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '78vh', overflowY: 'auto', paddingRight: '0.4rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Proyecto</label>
              <select 
                className="form-control" 
                value={heightsForm.project || ''} 
                onChange={e => setHeightsForm({ ...heightsForm, project: e.target.value })} 
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
                value={heightsForm.city || ''} 
                onChange={e => setHeightsForm({ ...heightsForm, city: e.target.value })} 
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
                value={heightsForm.client || ''} 
                onChange={e => setHeightsForm({ ...heightsForm, client: e.target.value })} 
                required 
              >
                <option value="">Seleccione cliente...</option>
                {clientOptions.map((c, idx) => (
                  <option key={idx} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem' }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', marginBottom: '0.65rem' }}>1. Información General</h4>
            <div className="grid-2" style={{ gap: '0.75rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Fecha del Permiso</label>
                <input type="date" className="form-control" value={heightsForm.date} onChange={e => setHeightsForm({ ...heightsForm, date: e.target.value })} required />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Ubicación de Trabajo</label>
                <input type="text" className="form-control" placeholder="Ej: Cubierta Bloque B" value={heightsForm.location} onChange={e => setHeightsForm({ ...heightsForm, location: e.target.value })} required />
              </div>
            </div>
            <div className="form-group" style={{ marginTop: '0.75rem' }}>
              <label className="form-label">Descripción de la Tarea a Realizar</label>
              <textarea className="form-control" placeholder="Describa el trabajo en alturas..." value={heightsForm.description} onChange={e => setHeightsForm({ ...heightsForm, description: e.target.value })} rows="2" required></textarea>
            </div>
          </div>

          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem' }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', marginBottom: '0.65rem' }}>2. Personal Autorizado y Emisor</h4>
            <div className="grid-3" style={{ gap: '0.75rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Trabajador Ejecutor</label>
                <select className="form-control" value={heightsForm.worker} onChange={e => setHeightsForm({ ...heightsForm, worker: e.target.value })} required>
                  <option value="">Seleccionar Ejecutor...</option>
                  {APP_USERS.map(u => <option key={u.email} value={u.name}>{u.name}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Ayudante de Seguridad</label>
                <select className="form-control" value={heightsForm.helper} onChange={e => setHeightsForm({ ...heightsForm, helper: e.target.value })} required>
                  <option value="">Seleccionar Ayudante...</option>
                  {APP_USERS.map(u => <option key={u.email} value={u.name}>{u.name}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Supervisor / Emisor</label>
                <select className="form-control" value={heightsForm.supervisor} onChange={e => setHeightsForm({ ...heightsForm, supervisor: e.target.value })} required>
                  <option value="">Seleccionar Coordinador...</option>
                  {APP_USERS.map(u => <option key={u.email} value={u.name}>{u.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem' }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', marginBottom: '0.65rem' }}>3. Checklist de Equipos Contra Caídas (EPCC)</h4>
            <div className="checklist-grid">
              <label className="checklist-item" style={{ cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={heightsForm.epccChecklist.harness} 
                  onChange={e => setHeightsForm({ ...heightsForm, epccChecklist: { ...heightsForm.epccChecklist, harness: e.target.checked } })} 
                />
                Arnés de 4 Argollas
              </label>
              <label className="checklist-item" style={{ cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={heightsForm.epccChecklist.sling} 
                  onChange={e => setHeightsForm({ ...heightsForm, epccChecklist: { ...heightsForm.epccChecklist, sling: e.target.checked } })} 
                />
                Eslinga con absorbedor
              </label>
              <label className="checklist-item" style={{ cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={heightsForm.epccChecklist.lifeline} 
                  onChange={e => setHeightsForm({ ...heightsForm, epccChecklist: { ...heightsForm.epccChecklist, lifeline: e.target.checked } })} 
                />
                Línea de vida vertical
              </label>
              <label className="checklist-item" style={{ cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={heightsForm.epccChecklist.anchorPoints} 
                  onChange={e => setHeightsForm({ ...heightsForm, epccChecklist: { ...heightsForm.epccChecklist, anchorPoints: e.target.checked } })} 
                />
                Puntos de anclaje
              </label>
              <label className="checklist-item" style={{ cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={heightsForm.epccChecklist.helmet} 
                  onChange={e => setHeightsForm({ ...heightsForm, epccChecklist: { ...heightsForm.epccChecklist, helmet: e.target.checked } })} 
                />
                Casco con barbuquejo
              </label>
              <label className="checklist-item" style={{ cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={heightsForm.epccChecklist.connectors} 
                  onChange={e => setHeightsForm({ ...heightsForm, epccChecklist: { ...heightsForm.epccChecklist, connectors: e.target.checked } })} 
                />
                Mosquetones y ganchos
              </label>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', marginBottom: '0.65rem' }}>4. Autodeclaración de Aptitud de Salud</h4>
            <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', userSelect: 'none', fontWeight: 600, fontSize: '0.85rem' }}>
                <input 
                  type="checkbox" 
                  checked={heightsForm.healthSelfDeclaration} 
                  onChange={e => setHeightsForm({ ...heightsForm, healthSelfDeclaration: e.target.checked })} 
                  required
                />
                Declaro bajo juramento que no tengo síntomas de mareo, vértigo ni problemas de salud física/mental hoy.
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
            <button type="button" className="btn-secondary" onClick={() => setIsHeightsModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn-primary">Registrar Permiso</button>
          </div>
        </form>
      </Modal>


      {/* MODAL 2: CREAR ANÁLISIS ATS */}
      <Modal 
        isOpen={isAtsModalOpen} 
        onClose={() => setIsAtsModalOpen(false)} 
        title="Registrar Análisis de Trabajo Seguro (ATS)"
      >
        <form onSubmit={handleAtsSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '78vh', overflowY: 'auto', paddingRight: '0.4rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Proyecto</label>
              <select 
                className="form-control" 
                value={atsForm.project || ''} 
                onChange={e => setAtsForm({ ...atsForm, project: e.target.value })} 
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
                value={atsForm.city || ''} 
                onChange={e => setAtsForm({ ...atsForm, city: e.target.value })} 
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
                value={atsForm.client || ''} 
                onChange={e => setAtsForm({ ...atsForm, client: e.target.value })} 
                required 
              >
                <option value="">Seleccione cliente...</option>
                {clientOptions.map((c, idx) => (
                  <option key={idx} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem' }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', marginBottom: '0.65rem' }}>1. Encabezado General</h4>
            <div className="grid-2" style={{ gap: '0.75rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Fecha del Análisis</label>
                <input type="date" className="form-control" value={atsForm.date} onChange={e => setAtsForm({ ...atsForm, date: e.target.value })} required />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Proceso Asociado</label>
                <select className="form-control" value={atsForm.process} onChange={e => setAtsForm({ ...atsForm, process: e.target.value })} required>
                  <option value="Direccionamiento Estratégico">Direccionamiento Estratégico</option>
                  <option value="Operaciones e Infraestructura">Operaciones e Infraestructura</option>
                  <option value="Comercial y Logística">Comercial y Logística</option>
                  <option value="Talento Humano">Talento Humano</option>
                  <option value="Tecnología y TI">Tecnología y TI</option>
                </select>
              </div>
            </div>
            <div className="form-group" style={{ marginTop: '0.75rem' }}>
              <label className="form-label">Actividad Crítica a Evaluar</label>
              <input type="text" className="form-control" placeholder="Ej: Reparación eléctrica de transformador" value={atsForm.activity} onChange={e => setAtsForm({ ...atsForm, activity: e.target.value })} required />
            </div>
            <div className="grid-2" style={{ gap: '0.75rem', marginTop: '0.75rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Herramientas a Utilizar</label>
                <input type="text" className="form-control" placeholder="Ej: Alicates aislados, destornilladores, multímetro" value={atsForm.tools} onChange={e => setAtsForm({ ...atsForm, tools: e.target.value })} required />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Equipo de Trabajo (Nombres separados por comas)</label>
                <input type="text" className="form-control" placeholder="Ej: Juan Pérez, Carlos Ruiz" value={atsForm.team} onChange={e => setAtsForm({ ...atsForm, team: e.target.value })} required />
              </div>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>2. Estructuración Dinámica del ATS (Pasos de Trabajo)</h4>
            
            {/* Step Form Builder */}
            <div className="step-builder">
              <div style={{ fontWeight: 700, fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Configurar Paso de la Tarea</div>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.72rem' }}>Paso de la Tarea</label>
                <input type="text" className="form-control" style={{ fontSize: '0.78rem' }} placeholder="Describa el paso físico..." value={newStep.step} onChange={e => setNewStep({ ...newStep, step: e.target.value })} />
              </div>
              <div className="grid-3" style={{ gap: '0.5rem', marginTop: '0.5rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.72rem' }}>Peligros Potenciales</label>
                  <input type="text" className="form-control" style={{ fontSize: '0.78rem' }} placeholder="Caídas, cortes..." value={newStep.hazard} onChange={e => setNewStep({ ...newStep, hazard: e.target.value })} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.72rem' }}>Consecuencias</label>
                  <input type="text" className="form-control" style={{ fontSize: '0.78rem' }} placeholder="Fracturas, heridas..." value={newStep.consequences} onChange={e => setNewStep({ ...newStep, consequences: e.target.value })} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.72rem' }}>Medidas de Control</label>
                  <input type="text" className="form-control" style={{ fontSize: '0.78rem' }} placeholder="Uso de arnés, guardas..." value={newStep.controls} onChange={e => setNewStep({ ...newStep, controls: e.target.value })} />
                </div>
              </div>
              <button type="button" className="btn-secondary" style={{ marginTop: '0.65rem', padding: '0.25rem 0.5rem', fontSize: '0.75rem', width: '100%' }} onClick={handleAddAtsStep}>
                <Plus size={12} style={{ marginRight: '3px' }} /> Agregar Paso a la Lista
              </button>
            </div>

            {/* List of current steps */}
            <div style={{ background: 'var(--bg-primary)', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Pasos Registrados en el ATS ({atsSteps.length})</div>
              {atsSteps.length === 0 ? (
                <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', padding: '1rem' }}>No se han agregado pasos al análisis todavía.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: '180px', overflowY: 'auto' }}>
                  {atsSteps.map((s, idx) => (
                    <div key={s.id || idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem', background: 'var(--bg-secondary)', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.75rem' }}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <strong>Paso {idx + 1}:</strong> {s.step} <br/>
                        <span style={{ fontSize: '0.7rem', color: 'var(--danger)' }}>Peligro: {s.hazard}</span> | <span style={{ fontSize: '0.7rem', color: 'var(--success)' }}>Control: {s.controls}</span>
                      </div>
                      <button type="button" className="btn-icon" style={{ color: 'var(--danger)', padding: '0.15rem' }} onClick={() => handleRemoveAtsStep(s.id)}><X size={12} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
            <button type="button" className="btn-secondary" onClick={() => setIsAtsModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={atsSteps.length === 0}>Guardar ATS</button>
          </div>
        </form>
      </Modal>


      {/* MODAL 3: CREAR PERMISO DE ALTO RIESGO */}
      <Modal 
        isOpen={isHighRiskModalOpen} 
        onClose={() => setIsHighRiskModalOpen(false)} 
        title="Crear Permiso de Trabajo de Alto Riesgo"
      >
        <form onSubmit={handleHighRiskSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '78vh', overflowY: 'auto', paddingRight: '0.4rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Proyecto</label>
              <select 
                className="form-control" 
                value={highRiskForm.project || ''} 
                onChange={e => setHighRiskForm({ ...highRiskForm, project: e.target.value })} 
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
                value={highRiskForm.city || ''} 
                onChange={e => setHighRiskForm({ ...highRiskForm, city: e.target.value })} 
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
                value={highRiskForm.client || ''} 
                onChange={e => setHighRiskForm({ ...highRiskForm, client: e.target.value })} 
                required 
              >
                <option value="">Seleccione cliente...</option>
                {clientOptions.map((c, idx) => (
                  <option key={idx} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem' }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', marginBottom: '0.65rem' }}>1. Información Básica de la Tarea</h4>
            <div className="grid-3" style={{ gap: '0.75rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Fecha</label>
                <input type="date" className="form-control" value={highRiskForm.date} onChange={e => setHighRiskForm({ ...highRiskForm, date: e.target.value })} required />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Tipo de Tarea Crítica</label>
                <select className="form-control" value={highRiskForm.type} onChange={e => setHighRiskForm({ ...highRiskForm, type: e.target.value })} required>
                  <option value="Trabajo en Caliente">Trabajo en Caliente (Soldar/Corte)</option>
                  <option value="Espacio Confinado">Espacio Confinado</option>
                  <option value="Eléctrico">Eléctrico / Energías Peligrosas (LOTO)</option>
                  <option value="Excavación">Excavación / Zanjas</option>
                  <option value="Izaje de Cargas">Izaje de Cargas Crítico</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Área / Ubicación</label>
                <input type="text" className="form-control" placeholder="Ej: Cuarto eléctrico principal" value={highRiskForm.location} onChange={e => setHighRiskForm({ ...highRiskForm, location: e.target.value })} required />
              </div>
            </div>
            <div className="form-group" style={{ marginTop: '0.75rem' }}>
              <label className="form-label">Descripción Detallada del Trabajo</label>
              <textarea className="form-control" value={highRiskForm.description} onChange={e => setHighRiskForm({ ...highRiskForm, description: e.target.value })} rows="2" required placeholder="Escriba la labor de alto riesgo..."></textarea>
            </div>
            <div className="form-group" style={{ marginTop: '0.75rem' }}>
              <label className="form-label">Supervisor / Autorizador HSEQ</label>
              <select className="form-control" value={highRiskForm.supervisor} onChange={e => setHighRiskForm({ ...highRiskForm, supervisor: e.target.value })} required>
                <option value="">Seleccione Autorizador...</option>
                {APP_USERS.map(u => <option key={u.email} value={u.name}>{u.name}</option>)}
              </select>
            </div>
          </div>

          {/* Conditional Input sections depending on type */}
          {highRiskForm.type === 'Espacio Confinado' && (
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem', background: 'rgba(234, 179, 8, 0.05)', padding: '0.75rem', borderRadius: '6px' }}>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--warning)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '3px' }}><Wind size={14} /> Controles Atmosféricos Iniciales</h4>
              <div className="grid-3" style={{ gap: '0.75rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Nivel de Oxígeno (%)</label>
                  <input type="text" className="form-control" placeholder="Ej: 20.9" value={highRiskForm.oxygenLevel} onChange={e => setHighRiskForm({ ...highRiskForm, oxygenLevel: e.target.value })} required />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Nivel Gases Inflamables LEL (%)</label>
                  <input type="text" className="form-control" placeholder="Ej: 0" value={highRiskForm.lelLevel} onChange={e => setHighRiskForm({ ...highRiskForm, lelLevel: e.target.value })} required />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Monóxido de Carbono CO (ppm)</label>
                  <input type="text" className="form-control" placeholder="Ej: 2" value={highRiskForm.coLevel} onChange={e => setHighRiskForm({ ...highRiskForm, coLevel: e.target.value })} required />
                </div>
              </div>
            </div>
          )}

          {highRiskForm.type === 'Trabajo en Caliente' && (
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem', background: 'rgba(239, 68, 68, 0.05)', padding: '0.75rem', borderRadius: '6px' }}>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--danger)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '3px' }}><Flame size={14} /> Controles Trabajo en Caliente</h4>
              <div className="grid-2" style={{ gap: '0.75rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Vigía de Fuego Asignado</label>
                  <select className="form-control" value={highRiskForm.checklist.fireWatcher} onChange={e => setHighRiskForm({ ...highRiskForm, checklist: { ...highRiskForm.checklist, fireWatcher: e.target.value } })} required>
                    <option value="">Seleccione Vigía...</option>
                    {APP_USERS.map(u => <option key={u.email} value={u.name}>{u.name}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Extintor e Inspección en Sitio</label>
                  <select className="form-control" value={highRiskForm.checklist.extinguisherReady} onChange={e => setHighRiskForm({ ...highRiskForm, checklist: { ...highRiskForm.checklist, extinguisherReady: e.target.value } })} required>
                    <option value="Pendiente">Pendiente</option>
                    <option value="Cumple">Cumple (Extintor ABC Vigente)</option>
                    <option value="No Cumple">No Cumple</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <div>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', marginBottom: '0.65rem' }}>2. Checklist de Verificación Crítica HSEQ</h4>
            <div className="checklist-grid">
              <div className="checklist-item">
                <input 
                  type="checkbox" 
                  checked={highRiskForm.checklist.lotoApplied === 'Cumple'} 
                  onChange={e => setHighRiskForm({ ...highRiskForm, checklist: { ...highRiskForm.checklist, lotoApplied: e.target.checked ? 'Cumple' : 'Pendiente' } })} 
                />
                LOTO / Bloqueo aplicado
              </div>
              <div className="checklist-item">
                <input 
                  type="checkbox" 
                  checked={highRiskForm.checklist.gasAtmosphere === 'Cumple'} 
                  onChange={e => setHighRiskForm({ ...highRiskForm, checklist: { ...highRiskForm.checklist, gasAtmosphere: e.target.checked ? 'Cumple' : 'Pendiente' } })} 
                />
                Atmósfera Segura verificada
              </div>
              <div className="checklist-item">
                <input 
                  type="checkbox" 
                  checked={highRiskForm.checklist.hotPpe === 'Cumple'} 
                  onChange={e => setHighRiskForm({ ...highRiskForm, checklist: { ...highRiskForm.checklist, hotPpe: e.target.checked ? 'Cumple' : 'Pendiente' } })} 
                />
                EPP Especial disponible
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
            <button type="button" className="btn-secondary" onClick={() => setIsHighRiskModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn-primary">Crear Permiso</button>
          </div>
        </form>
      </Modal>

    </>
  );
}
