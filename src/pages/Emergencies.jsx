import React, { useState, useMemo } from 'react';
import { 
  Flame, Plus, Download, Edit2, Trash2, CheckCircle, Clock, ShieldAlert, 
  Heart, Shield, FileText, Clipboard, AlertTriangle, UploadCloud, Paperclip, Filter
} from 'lucide-react';
import Modal from '../components/Modal';
import { downloadCSV } from '../utils/exportUtils';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAppUsers } from '../hooks/useAppUsers';

const DEFAULT_PARAMS = {
  projectTypes: ["Eléctrico", "Telecomunicaciones", "Civil", "Ambiental", "Industrial"],
  clients: ["Consorcio Vial del Norte", "Ecopetrol", "Claro", "Movistar"],
  cities: ["Bogotá", "Medellín", "Cali", "Barranquilla", "Bucaramanga"]
};

const specialties = ['Primeros Auxilios', 'Control de Incendios', 'Evacuación y Rescate', 'Logística y Apoyo'];
const equipmentTypes = ['Extintores', 'Camillas de Emergencia', 'Botiquines de Primeros Auxilios', 'Estaciones Lavaojos / Duchas'];

const defaultDrill = {
  scenario: '',
  date: '',
  expectedTime: '',
  actualTime: '',
  participantsCount: '',
  evaluator: '',
  lessonsLearned: '',
  status: 'Planificado', // Planificado, Ejecutado
  project: '',
  city: '',
  client: ''
};

const defaultBrigade = {
  name: '',
  specialty: 'Primeros Auxilios',
  role: 'Brigadista', // Líder, Sublíder, Brigadista
  phone: '',
  status: 'Activo', // Activo, Inactivo
  project: '',
  city: '',
  client: ''
};

const defaultInspection = {
  date: '',
  inspector: '',
  equipmentType: 'Extintores',
  inspectedQuantity: '',
  approvedQuantity: '',
  rejectedQuantity: '',
  remarks: '',
  status: 'Aprobado', // Aprobado, Pendiente de Corrección
  attachedFile: '',
  project: '',
  city: '',
  client: ''
};

export default function Emergencies() {
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

  const [drills, setDrills] = useLocalStorage('sgi_emergencies_drills', [
    {
      id: 1,
      scenario: 'Simulacro de Evacuación General por Sismo en Oficinas y Planta',
      date: '2026-05-12',
      expectedTime: '03:30',
      actualTime: '03:15',
      participantsCount: 45,
      evaluator: APP_USERS[0]?.name || 'Carlos Gómez',
      lessonsLearned: 'Excelente tiempo de respuesta. Sin embargo, se identificó que el punto de encuentro B requiere mantenimiento de pintura y demarcación en el suelo.',
      status: 'Ejecutado',
      project: 'Eléctrico',
      city: 'Bogotá',
      client: 'Consorcio Vial del Norte'
    }
  ]);

  const [brigade, setBrigade] = useLocalStorage('sgi_emergencies_brigade', [
    { id: 1, name: 'Ana María Torres', specialty: 'Primeros Auxilios', role: 'Líder', phone: '+57 300 123 4567', status: 'Activo', project: 'Eléctrico', city: 'Bogotá', client: 'Consorcio Vial del Norte' },
    { id: 2, name: 'Diego Castro', specialty: 'Evacuación y Rescate', role: 'Brigadista', phone: '+57 301 987 6543', status: 'Activo', project: 'Civil', city: 'Cali', client: 'Ecopetrol' },
    { id: 3, name: 'Carlos Gómez', specialty: 'Control de Incendios', role: 'Brigadista', phone: '+57 312 456 7890', status: 'Activo', project: 'Telecomunicaciones', city: 'Medellín', client: 'Claro' }
  ]);

  const [inspections, setInspections] = useLocalStorage('sgi_emergencies_inspections', [
    {
      id: 1,
      date: '2026-05-10',
      inspector: 'Diego Castro',
      equipmentType: 'Extintores',
      inspectedQuantity: 12,
      approvedQuantity: 11,
      rejectedQuantity: 1,
      remarks: 'Extintor Nro 4 del almacén principal descargado. Se solicita recarga y reemplazo inmediato.',
      status: 'Pendiente de Corrección',
      attachedFile: 'informe_inspeccion_extintores_q1.pdf',
      project: 'Civil',
      city: 'Cali',
      client: 'Ecopetrol'
    }
  ]);

  const [activeTab, setActiveTab] = useState('drills'); // drills, brigade, inspections

  const [filterProject, setFilterProject] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterClient, setFilterClient] = useState('');

  const filteredDrills = drills.filter(d => {
    const matchProject = !filterProject || d.project === filterProject;
    const matchCity = !filterCity || d.city === filterCity;
    const matchClient = !filterClient || d.client === filterClient;
    return matchProject && matchCity && matchClient;
  });

  const filteredBrigade = brigade.filter(b => {
    const matchProject = !filterProject || b.project === filterProject;
    const matchCity = !filterCity || b.city === filterCity;
    const matchClient = !filterClient || b.client === filterClient;
    return matchProject && matchCity && matchClient;
  });

  const filteredInspections = inspections.filter(i => {
    const matchProject = !filterProject || i.project === filterProject;
    const matchCity = !filterCity || i.city === filterCity;
    const matchClient = !filterClient || i.client === filterClient;
    return matchProject && matchCity && matchClient;
  });
  
  // Modals status
  const [isDrillModalOpen, setIsDrillModalOpen] = useState(false);
  const [isBrigadeModalOpen, setIsBrigadeModalOpen] = useState(false);
  const [isInspectionModalOpen, setIsInspectionModalOpen] = useState(false);

  const [editingItem, setEditingItem] = useState(null);
  
  // Forms States
  const [drillForm, setDrillForm] = useState(defaultDrill);
  const [brigadeForm, setBrigadeForm] = useState(defaultBrigade);
  const [inspectionForm, setInspectionForm] = useState(defaultInspection);

  // Drill functions
  const handleOpenDrillModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setDrillForm(item);
    } else {
      setEditingItem(null);
      setDrillForm({ ...defaultDrill, date: new Date().toISOString().split('T')[0], evaluator: APP_USERS[0]?.name || '' });
    }
    setIsDrillModalOpen(true);
  };

  const handleDrillSubmit = (e) => {
    e.preventDefault();
    if (editingItem) {
      setDrills(drills.map(d => d.id === editingItem.id ? { ...drillForm, id: d.id } : d));
    } else {
      setDrills([...drills, { ...drillForm, id: Date.now() }]);
    }
    setIsDrillModalOpen(false);
  };

  const handleDrillDelete = (id) => {
    if (window.confirm("¿Está seguro de eliminar este registro de simulacro?")) {
      setDrills(drills.filter(d => d.id !== id));
    }
  };

  // Brigade functions
  const handleOpenBrigadeModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setBrigadeForm(item);
    } else {
      setEditingItem(null);
      setBrigadeForm(defaultBrigade);
    }
    setIsBrigadeModalOpen(true);
  };

  const handleBrigadeSubmit = (e) => {
    e.preventDefault();
    if (editingItem) {
      setBrigade(brigade.map(b => b.id === editingItem.id ? { ...brigadeForm, id: b.id } : b));
    } else {
      setBrigade([...brigade, { ...brigadeForm, id: Date.now() }]);
    }
    setIsBrigadeModalOpen(false);
  };

  const handleBrigadeDelete = (id) => {
    if (window.confirm("¿Está seguro de retirar a este integrante de la brigada?")) {
      setBrigade(brigade.filter(b => b.id !== id));
    }
  };

  // Inspections functions
  const handleOpenInspectionModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setInspectionForm(item);
    } else {
      setEditingItem(null);
      setInspectionForm({ 
        ...defaultInspection, 
        date: new Date().toISOString().split('T')[0], 
        inspector: APP_USERS[0]?.name || '',
        attachedFile: ''
      });
    }
    setIsInspectionModalOpen(true);
  };

  const handleInspectionSubmit = (e) => {
    e.preventDefault();
    const approved = parseInt(inspectionForm.approvedQuantity || 0);
    const rejected = parseInt(inspectionForm.rejectedQuantity || 0);
    const total = approved + rejected;
    const cleanForm = {
      ...inspectionForm,
      inspectedQuantity: total,
      status: rejected > 0 ? 'Pendiente de Corrección' : 'Aprobado',
      attachedFile: inspectionForm.attachedFile || 'informe_ejecucion_inspeccion.pdf' // Fallback simulated file
    };

    if (editingItem) {
      setInspections(inspections.map(i => i.id === editingItem.id ? { ...cleanForm, id: i.id } : i));
    } else {
      setInspections([...inspections, { ...cleanForm, id: Date.now() }]);
    }
    setIsInspectionModalOpen(false);
  };

  const handleInspectionDelete = (id) => {
    if (window.confirm("¿Está seguro de eliminar este registro de inspección?")) {
      setInspections(inspections.filter(i => i.id !== id));
    }
  };

  // Exports
  const handleExport = () => {
    if (activeTab === 'drills') {
      downloadCSV(drills.map(d => ({ Escenario: d.scenario, Fecha: d.date, Esperado: d.expectedTime, Real: d.actualTime, Participantes: d.participantsCount, Evaluador: d.evaluator, Lecciones: d.lessonsLearned, Estado: d.status })), "Simulacros_Evacuacion");
    } else if (activeTab === 'brigade') {
      downloadCSV(brigade.map(b => ({ Nombre: b.name, Especialidad: b.specialty, Cargo: b.role, Telefono: b.phone, Estado: b.status })), "Brigadistas_Emergencia");
    } else {
      downloadCSV(inspections.map(i => ({ Fecha: i.date, Inspector: i.inspector, Tipo_Equipo: i.equipmentType, Cantidad_Inspeccionada: i.inspectedQuantity, Aprobados: i.approvedQuantity, Rechazados: i.rejectedQuantity, Observaciones: i.remarks, Soporte: i.attachedFile, Estado: i.status })), "Inspeccion_Equipos_Seguridad");
    }
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>ISO 14001 / ISO 45001 - Cláusula 8.2</p>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Emergencias y Simulacros</h2>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button className="btn-secondary" onClick={handleExport}><Download size={16} /> Exportar Datos</button>
          
          {activeTab === 'drills' && <button className="btn-primary" onClick={() => handleOpenDrillModal()}><Plus size={16} /> Programar Simulacro</button>}
          {activeTab === 'brigade' && <button className="btn-primary" onClick={() => handleOpenBrigadeModal()}><Plus size={16} /> Agregar Brigadista</button>}
          {activeTab === 'inspections' && <button className="btn-primary" onClick={() => handleOpenInspectionModal()}><Plus size={16} /> Nueva Inspección</button>}
        </div>
      </div>

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
          <Filter size={15} /> Filtros SGI:
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

      {/* Main Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button 
          className={`btn-secondary ${activeTab === 'drills' ? 'active' : ''}`} 
          style={{ border: 'none', background: activeTab === 'drills' ? 'rgba(14, 165, 233, 0.1)' : 'transparent', color: activeTab === 'drills' ? 'var(--accent-primary)' : 'var(--text-secondary)', fontWeight: 600 }}
          onClick={() => setActiveTab('drills')}
        >
          <Flame size={14} style={{ marginRight: '4px' }} /> Simulacros e Incendios ({drills.length})
        </button>
        <button 
          className={`btn-secondary ${activeTab === 'brigade' ? 'active' : ''}`} 
          style={{ border: 'none', background: activeTab === 'brigade' ? 'rgba(16, 185, 129, 0.1)' : 'transparent', color: activeTab === 'brigade' ? 'var(--success)' : 'var(--text-secondary)', fontWeight: 600 }}
          onClick={() => setActiveTab('brigade')}
        >
          <Shield size={14} style={{ marginRight: '4px' }} /> Brigada de Emergencias ({brigade.filter(b => b.status === 'Activo').length})
        </button>
        <button 
          className={`btn-secondary ${activeTab === 'inspections' ? 'active' : ''}`} 
          style={{ border: 'none', background: activeTab === 'inspections' ? 'rgba(245, 158, 11, 0.1)' : 'transparent', color: activeTab === 'inspections' ? 'var(--warning)' : 'var(--text-secondary)', fontWeight: 600 }}
          onClick={() => setActiveTab('inspections')}
        >
          <Clipboard size={14} style={{ marginRight: '4px' }} /> Inspecciones de Equipos ({inspections.length})
        </button>
      </div>

      {/* DRILLS TAB */}
      {activeTab === 'drills' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Proyecto / Ubicación / Cliente</th>
                  <th>Escenario de Simulacro</th>
                  <th>Tiempo Esperado vs Real</th>
                  <th>Participantes</th>
                  <th>Evaluador</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredDrills.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No hay simulacros registrados con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  filteredDrills.map(d => (
                    <tr key={d.id}>
                      <td>{d.date}</td>
                      <td>
                        {d.project && <div style={{fontSize:'0.78rem', color:'var(--accent-primary)', fontWeight:600}}>Proy: {d.project}</div>}
                        {d.city && <div style={{fontSize:'0.75rem', color:'var(--text-muted)'}}>Ciudad: {d.city}</div>}
                        {d.client && <div style={{fontSize:'0.75rem', color:'var(--success)'}}>Cliente: {d.client}</div>}
                        {!d.project && !d.city && !d.client && <span style={{color:'var(--text-muted)', fontSize:'0.8rem'}}>-</span>}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{d.scenario}</div>
                        {d.lessonsLearned && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}><strong>Lecciones:</strong> {d.lessonsLearned}</div>}
                      </td>
                      <td>
                        <div>Plan: {d.expectedTime} min</div>
                        <div style={{ color: d.actualTime <= d.expectedTime ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>Real: {d.actualTime} min</div>
                      </td>
                      <td>{d.participantsCount} personas</td>
                      <td>{d.evaluator}</td>
                      <td>
                        <span className={`badge ${d.status === 'Ejecutado' ? 'badge-success' : 'badge-warning'}`}>
                          {d.status === 'Ejecutado' ? <CheckCircle size={12} /> : <Clock size={12} />} {d.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          <button className="btn-icon" style={{ padding: '0.25rem' }} onClick={() => handleOpenDrillModal(d)}><Edit2 size={14} /></button>
                          <button className="btn-icon" style={{ padding: '0.25rem', color: 'var(--danger)' }} onClick={() => handleDrillDelete(d.id)}><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* BRIGADE TAB */}
      {activeTab === 'brigade' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Integrante</th>
                  <th>Proyecto / Ubicación / Cliente</th>
                  <th>Rol Brigada</th>
                  <th>Especialidad Principal</th>
                  <th>Contacto de Emergencia</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredBrigade.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No hay brigadistas registrados con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  filteredBrigade.map(b => (
                    <tr key={b.id}>
                      <td style={{ fontWeight: 600 }}>{b.name}</td>
                      <td>
                        {b.project && <div style={{fontSize:'0.78rem', color:'var(--accent-primary)', fontWeight:600}}>Proy: {b.project}</div>}
                        {b.city && <div style={{fontSize:'0.75rem', color:'var(--text-muted)'}}>Ciudad: {b.city}</div>}
                        {b.client && <div style={{fontSize:'0.75rem', color:'var(--success)'}}>Cliente: {b.client}</div>}
                        {!b.project && !b.city && !b.client && <span style={{color:'var(--text-muted)', fontSize:'0.8rem'}}>-</span>}
                      </td>
                      <td>
                        <span className={`badge ${b.role === 'Líder' ? 'badge-danger' : b.role === 'Sublíder' ? 'badge-warning' : 'badge-info'}`}>
                          {b.role}
                        </span>
                      </td>
                      <td>{b.specialty}</td>
                      <td>{b.phone}</td>
                      <td>
                        <span className={`badge ${b.status === 'Activo' ? 'badge-success' : 'badge-danger'}`}>
                          {b.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          <button className="btn-icon" style={{ padding: '0.25rem' }} onClick={() => handleOpenBrigadeModal(b)}><Edit2 size={14} /></button>
                          <button className="btn-icon" style={{ padding: '0.25rem', color: 'var(--danger)' }} onClick={() => handleBrigadeDelete(b.id)}><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* INSPECTIONS TAB */}
      {activeTab === 'inspections' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Proyecto / Ubicación / Cliente</th>
                  <th>Inspector</th>
                  <th>Tipo de Equipo</th>
                  <th>Total Inspected</th>
                  <th>Aprobados / Rechazados</th>
                  <th>Observaciones</th>
                  <th>Informe de Ejecución</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredInspections.length === 0 ? (
                  <tr>
                    <td colSpan="10" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No hay inspecciones registradas con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  filteredInspections.map(i => (
                    <tr key={i.id}>
                      <td>{i.date}</td>
                      <td>
                        {i.project && <div style={{fontSize:'0.78rem', color:'var(--accent-primary)', fontWeight:600}}>Proy: {i.project}</div>}
                        {i.city && <div style={{fontSize:'0.75rem', color:'var(--text-muted)'}}>Ciudad: {i.city}</div>}
                        {i.client && <div style={{fontSize:'0.75rem', color:'var(--success)'}}>Cliente: {i.client}</div>}
                        {!i.project && !i.city && !i.client && <span style={{color:'var(--text-muted)', fontSize:'0.8rem'}}>-</span>}
                      </td>
                      <td style={{ fontWeight: 500 }}>{i.inspector}</td>
                      <td>{i.equipmentType}</td>
                      <td>{i.inspectedQuantity} unidades</td>
                      <td>
                        <span style={{ color: 'var(--success)', fontWeight: 600 }}>{i.approvedQuantity} Ok</span> / 
                        <span style={{ color: 'var(--danger)', fontWeight: 600, marginLeft: '4px' }}>{i.rejectedQuantity} Fails</span>
                      </td>
                      <td style={{ maxWidth: '200px', fontSize: '0.85rem' }}>{i.remarks}</td>
                      <td>
                        {i.attachedFile ? (
                          <button 
                            className="btn-secondary" 
                            style={{ padding: '0.2rem 0.45rem', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                            onClick={() => {
                              window.alert(`[HSEQ] Descargando soporte de inspección: "${i.attachedFile}"`);
                            }}
                            title="Descargar informe de inspección"
                          >
                            <Paperclip size={11} /> {i.attachedFile.length > 15 ? i.attachedFile.substring(0, 13) + '...' : i.attachedFile}
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Sin soporte</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${i.status === 'Aprobado' ? 'badge-success' : 'badge-danger'}`}>
                          {i.status === 'Aprobado' ? <CheckCircle size={12} /> : <AlertTriangle size={12} />} {i.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          <button className="btn-icon" style={{ padding: '0.25rem' }} onClick={() => handleOpenInspectionModal(i)}><Edit2 size={14} /></button>
                          <button className="btn-icon" style={{ padding: '0.25rem', color: 'var(--danger)' }} onClick={() => handleInspectionDelete(i.id)}><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL SIMULACROS */}
      <Modal isOpen={isDrillModalOpen} onClose={() => setIsDrillModalOpen(false)} title={editingItem ? "Modificar Simulacro" : "Registrar Nuevo Simulacro"}>
        <form onSubmit={handleDrillSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Proyecto</label>
              <select 
                className="form-control" 
                value={drillForm.project || ''} 
                onChange={e => setDrillForm({ ...drillForm, project: e.target.value })} 
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
                value={drillForm.city || ''} 
                onChange={e => setDrillForm({ ...drillForm, city: e.target.value })} 
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
                value={drillForm.client || ''} 
                onChange={e => setDrillForm({ ...drillForm, client: e.target.value })} 
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
            <label className="form-label">Escenario / Descripción del Simulacro</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Ej: Simulacro de sismo y rescate..." 
              value={drillForm.scenario} 
              onChange={e => setDrillForm({ ...drillForm, scenario: e.target.value })} 
              required 
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Fecha Planificada/Ejecutada</label>
              <input 
                type="date" 
                className="form-control" 
                value={drillForm.date} 
                onChange={e => setDrillForm({ ...drillForm, date: e.target.value })} 
                required 
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Estado</label>
              <select 
                className="form-control" 
                value={drillForm.status} 
                onChange={e => setDrillForm({ ...drillForm, status: e.target.value })}
              >
                <option value="Planificado">Planificado</option>
                <option value="Ejecutado">Ejecutado</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Tiempo Esperado (MM:SS)</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Ej: 03:00" 
                value={drillForm.expectedTime} 
                onChange={e => setDrillForm({ ...drillForm, expectedTime: e.target.value })} 
                required 
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Tiempo Real (MM:SS)</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Ej: 03:15" 
                value={drillForm.actualTime} 
                onChange={e => setDrillForm({ ...drillForm, actualTime: e.target.value })} 
                disabled={drillForm.status !== 'Ejecutado'}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Nro de Participantes</label>
              <input 
                type="number" 
                className="form-control" 
                placeholder="Ej: 25" 
                value={drillForm.participantsCount} 
                onChange={e => setDrillForm({ ...drillForm, participantsCount: e.target.value })} 
                required 
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Evaluador HSEQ</label>
              <select 
                className="form-control" 
                value={drillForm.evaluator} 
                onChange={e => setDrillForm({ ...drillForm, evaluator: e.target.value })}
              >
                <option value="">Seleccione Evaluador</option>
                {APP_USERS.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Lecciones Aprendidas / Observaciones</label>
            <textarea 
              className="form-control" 
              rows="3" 
              placeholder="Describa el comportamiento de las personas, fallas en alarmas, etc..." 
              value={drillForm.lessonsLearned} 
              onChange={e => setDrillForm({ ...drillForm, lessonsLearned: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <button type="button" className="btn-secondary" onClick={() => setIsDrillModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn-primary">Guardar</button>
          </div>
        </form>
      </Modal>
 
      {/* MODAL BRIGADA */}
      <Modal isOpen={isBrigadeModalOpen} onClose={() => setIsBrigadeModalOpen(false)} title={editingItem ? "Modificar Brigadista" : "Agregar Integrante a Brigada"}>
        <form onSubmit={handleBrigadeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Proyecto</label>
              <select 
                className="form-control" 
                value={brigadeForm.project || ''} 
                onChange={e => setBrigadeForm({ ...brigadeForm, project: e.target.value })} 
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
                value={brigadeForm.city || ''} 
                onChange={e => setBrigadeForm({ ...brigadeForm, city: e.target.value })} 
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
                value={brigadeForm.client || ''} 
                onChange={e => setBrigadeForm({ ...brigadeForm, client: e.target.value })} 
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
            <label className="form-label">Nombre Completo del Colaborador</label>
            <select 
              className="form-control" 
              value={brigadeForm.name} 
              onChange={e => setBrigadeForm({ ...brigadeForm, name: e.target.value })}
              required
            >
              <option value="">Seleccione Colaborador</option>
              {APP_USERS.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Rol en la Brigada</label>
              <select 
                className="form-control" 
                value={brigadeForm.role} 
                onChange={e => setBrigadeForm({ ...brigadeForm, role: e.target.value })}
              >
                <option value="Líder">Líder</option>
                <option value="Sublíder">Sublíder</option>
                <option value="Brigadista">Brigadista</option>
              </select>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Especialidad Principal</label>
              <select 
                className="form-control" 
                value={brigadeForm.specialty} 
                onChange={e => setBrigadeForm({ ...brigadeForm, specialty: e.target.value })}
              >
                {specialties.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Celular de Contacto</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Ej: +57 300 0000..." 
                value={brigadeForm.phone} 
                onChange={e => setBrigadeForm({ ...brigadeForm, phone: e.target.value })} 
                required 
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Estado</label>
              <select 
                className="form-control" 
                value={brigadeForm.status} 
                onChange={e => setBrigadeForm({ ...brigadeForm, status: e.target.value })}
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <button type="button" className="btn-secondary" onClick={() => setIsBrigadeModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn-primary">Guardar</button>
          </div>
        </form>
      </Modal>

      {/* MODAL INSPECCION */}
      <Modal isOpen={isInspectionModalOpen} onClose={() => setIsInspectionModalOpen(false)} title={editingItem ? "Modificar Inspección" : "Registrar Inspección de Seguridad"}>
        <form onSubmit={handleInspectionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Proyecto</label>
              <select 
                className="form-control" 
                value={inspectionForm.project || ''} 
                onChange={e => setInspectionForm({ ...inspectionForm, project: e.target.value })} 
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
                value={inspectionForm.city || ''} 
                onChange={e => setInspectionForm({ ...inspectionForm, city: e.target.value })} 
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
                value={inspectionForm.client || ''} 
                onChange={e => setInspectionForm({ ...inspectionForm, client: e.target.value })} 
                required 
              >
                <option value="">Seleccione cliente...</option>
                {clientOptions.map((c, idx) => (
                  <option key={idx} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Fecha Inspección</label>
              <input 
                type="date" 
                className="form-control" 
                value={inspectionForm.date} 
                onChange={e => setInspectionForm({ ...inspectionForm, date: e.target.value })} 
                required 
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Inspector Asignado</label>
              <select 
                className="form-control" 
                value={inspectionForm.inspector} 
                onChange={e => setInspectionForm({ ...inspectionForm, inspector: e.target.value })}
                required
              >
                <option value="">Seleccione Inspector</option>
                {APP_USERS.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Tipo de Equipo / Instalación</label>
            <select 
              className="form-control" 
              value={inspectionForm.equipmentType} 
              onChange={e => setInspectionForm({ ...inspectionForm, equipmentType: e.target.value })}
            >
              {equipmentTypes.map(et => <option key={et} value={et}>{et}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Unidades en Buen Estado</label>
              <input 
                type="number" 
                className="form-control" 
                placeholder="Ej: 10" 
                value={inspectionForm.approvedQuantity} 
                onChange={e => setInspectionForm({ ...inspectionForm, approvedQuantity: e.target.value })} 
                required 
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Unidades con Fallos/Vencidas</label>
              <input 
                type="number" 
                className="form-control" 
                placeholder="Ej: 0" 
                value={inspectionForm.rejectedQuantity} 
                onChange={e => setInspectionForm({ ...inspectionForm, rejectedQuantity: e.target.value })} 
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Observaciones y Hallazgos Detallados</label>
            <textarea 
              className="form-control" 
              rows="3" 
              placeholder="Describa el estado específico (ej: Extintor 2 cargado y con seguro, botiquín 1 con alcohol faltante)..." 
              value={inspectionForm.remarks} 
              onChange={e => setInspectionForm({ ...inspectionForm, remarks: e.target.value })}
            />
          </div>

          {/* ATTACHMENT REPORT UPLOADER */}
          <div className="form-group">
            <label className="form-label">Subir Informe de Ejecución / Soporte de Inspección</label>
            <div 
              style={{
                border: '1.5px dashed var(--border-color)',
                padding: '0.85rem',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center',
                background: 'var(--bg-secondary)',
                cursor: 'pointer'
              }}
              onClick={() => document.getElementById('file-upload-insp').click()}
            >
              <input 
                id="file-upload-insp" 
                type="file" 
                style={{ display: 'none' }} 
                accept=".doc,.docx,.xls,.xlsx,.pdf,image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setInspectionForm(prev => ({ ...prev, attachedFile: file.name }));
                  }
                }} 
              />
              {inspectionForm.attachedFile ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                  <span style={{ color: 'var(--success)', fontWeight: 700, fontSize: '0.78rem' }}>✓ {inspectionForm.attachedFile}</span>
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    style={{ padding: '0.1rem 0.35rem', fontSize: '0.65rem', border: '1px solid var(--border-color)' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setInspectionForm(prev => ({ ...prev, attachedFile: '' }));
                    }}
                  >
                    Quitar
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
                  <UploadCloud size={18} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Haga clic para adjuntar soporte (.pdf, .png, .jpg, .xlsx)
                  </span>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <button type="button" className="btn-secondary" onClick={() => setIsInspectionModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn-primary">Registrar Inspección</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
