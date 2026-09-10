import React, { useState, useEffect, useMemo } from 'react';
import { 
  Clock, Download, Plus, Filter, Edit2, Trash2, 
  ShieldCheck, FileText, ClipboardList, Upload, 
  CheckCircle, RefreshCw, AlertTriangle, Paperclip 
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

export default function EnvAspects() {
  const APP_USERS = useAppUsers();
  const [globalParams] = useLocalStorage('sgi_global_parameters', DEFAULT_PARAMS);

  const [aspects, setAspects] = useLocalStorage('sgi_env_aspects', [
    { 
      id: 1, 
      process: 'Producción', 
      activityName: 'Troquelado y ensamble de piezas',
      project: 'Eléctrico',
      city: 'Bogotá',
      client: 'Consorcio Vial del Norte',
      aspect: 'Generación de residuos sólidos (chatarra metálica)', 
      impact: 'Agotamiento de recursos naturales / Contaminación del suelo', 
      cond: 'Normal', 
      reqType: 'Ninguno', 
      severity: 3, 
      frequency: 3, 
      scope: 2, 
      status: 'Activo',
      lifecycleStage: 'Producción / Manufactura',
      wasteDescription: 'Generación de viruta, retales y chatarra de acero durante el troquelado de las láminas. Se estima 50kg/mes.',
      controlMeasure: 'Venta a gestor autorizado para reciclaje (siderúrgica)',
      responsible: 'Líder de Calidad',
      evidenceFile: 'manifiesto_chatarra_mayo.pdf',
      controlStatus: 'Implementado',
      followUpNotes: 'Se entregaron los retales al gestor RECIMETALES. Se adjunta manifiesto de disposición correspondiente.'
    },
    { 
      id: 2, 
      process: 'Mantenimiento', 
      activityName: 'Cambio de aceite de compresores',
      project: 'Civil',
      city: 'Cali',
      client: 'Ecopetrol',
      aspect: 'Generación de residuos peligrosos (aceite usado)', 
      impact: 'Contaminación de fuentes hídricas / Suelo', 
      cond: 'Anormal', 
      reqType: 'Legal', 
      severity: 4, 
      frequency: 2, 
      scope: 3, 
      status: 'Activo',
      lifecycleStage: 'Uso / Consumo',
      wasteDescription: 'Drenaje de aceite lubricante usado en compresores de aire del taller central.',
      controlMeasure: 'Almacenamiento en dique de contención y recolección por gestor con licencia ambiental',
      responsible: 'Analista de Operaciones',
      evidenceFile: null,
      controlStatus: 'En Proceso',
      followUpNotes: 'Aceites almacenados temporalmente en el dique de seguridad. Pendiente programación de recolección.'
    }
  ]);

  const [filter, setFilter] = useState('Todos');
  const [selectedAspectId, setSelectedAspectId] = useState(null);
  const [detailTab, setDetailTab] = useState('detail'); // detail, control

  // History and meta for environmental aspects
  const [envAspectsHistory, setEnvAspectsHistory] = useLocalStorage('sgi_env_aspects_history', [
    { version: '01', date: '2025-01-10', changes: 'Emisión Inicial de la Matriz de Aspectos e Impactos Ambientales.' }
  ]);
  const [meta, setMeta] = useLocalStorage('sgi_env_aspects_meta', {
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
    history: []
  });

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    process: '', activityName: '', aspect: '', impact: '', cond: 'Normal', reqType: 'Ninguno', 
    severity: 1, frequency: 1, scope: 1, status: 'Activo', lifecycleStage: 'Producción / Manufactura',
    wasteDescription: '', controlMeasure: '', responsible: '', evidenceFile: null, controlStatus: 'Pendiente',
    followUpNotes: '', project: '', city: '', client: ''
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
    if (formData.city && !baseList.includes(formData.city)) {
      return [...baseList, formData.city];
    }
    return baseList;
  }, [globalParams?.cities, formData.city]);

  const clientOptions = useMemo(() => {
    const baseList = (globalParams?.clients && globalParams.clients.length > 0) 
      ? globalParams.clients 
      : DEFAULT_PARAMS.clients;
    if (formData.client && !baseList.includes(formData.client)) {
      return [...baseList, formData.client];
    }
    return baseList;
  }, [globalParams?.clients, formData.client]);

  // Inline follow-up state (for the bottom detailed panel)
  const [followUpForm, setFollowUpForm] = useState({
    controlStatus: 'Pendiente',
    followUpNotes: '',
    evidenceFile: null
  });

  // Lifecycle stages list
  const lifecycleStages = [
    'Adquisición de materias primas',
    'Diseño y desarrollo',
    'Producción / Manufactura',
    'Distribución y Transporte',
    'Uso / Consumo',
    'Fin de vida / Disposición final'
  ];

  // Auto-select first aspect
  useEffect(() => {
    if (aspects.length > 0 && !selectedAspectId) {
      setSelectedAspectId(aspects[0].id);
    }
  }, [aspects, selectedAspectId]);

  // Sync inline follow-up form when selected aspect changes
  const selectedAspect = aspects.find(a => a.id === selectedAspectId);
  useEffect(() => {
    if (selectedAspect) {
      setFollowUpForm({
        controlStatus: selectedAspect.controlStatus || 'Pendiente',
        followUpNotes: selectedAspect.followUpNotes || '',
        evidenceFile: selectedAspect.evidenceFile || null
      });
    }
  }, [selectedAspectId, selectedAspect]);

  const calcScore = a => (a.severity || 1) * (a.frequency || 1) * (a.scope || 1);
  const isSig = a => a.reqType === 'Legal' || calcScore(a) >= 9;

  // Normalized aspects mapping (safeguard older records)
  const normalizedAspects = aspects.map(a => {
    let calculatedReqType = a.reqType;
    if (!calculatedReqType) {
      calculatedReqType = a.legalReq ? 'Legal' : 'Ninguno';
    }
    return {
      ...a,
      reqType: calculatedReqType,
      activityName: a.activityName || 'General',
      lifecycleStage: a.lifecycleStage || 'Producción / Manufactura',
      wasteDescription: a.wasteDescription || '',
      controlMeasure: a.controlMeasure || 'Medida por definir',
      responsible: a.responsible || 'Líder de Calidad',
      controlStatus: a.controlStatus || 'Pendiente',
      followUpNotes: a.followUpNotes || '',
      project: a.project || '',
      city: a.city || '',
      client: a.client || ''
    };
  });

  const [filterProject, setFilterProject] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterClient, setFilterClient] = useState('');

  const processes = ['Todos', ...new Set(normalizedAspects.map(a => a.process))];
  const filtered = normalizedAspects.filter(a => {
    const matchProcess = filter === 'Todos' || a.process === filter;
    const matchProject = !filterProject || a.project === filterProject;
    const matchCity = !filterCity || a.city === filterCity;
    const matchClient = !filterClient || a.client === filterClient;
    return matchProcess && matchProject && matchCity && matchClient;
  });

  const total = normalizedAspects.length;
  const sigCount = normalizedAspects.filter(a => isSig(a)).length;
  const noSigCount = total - sigCount;

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({ 
        ...item,
        activityName: item.activityName || '',
        lifecycleStage: item.lifecycleStage || 'Producción / Manufactura',
        wasteDescription: item.wasteDescription || '',
        controlMeasure: item.controlMeasure || '',
        responsible: item.responsible || (APP_USERS[0]?.name || ''),
        controlStatus: item.controlStatus || 'Pendiente',
        followUpNotes: item.followUpNotes || '',
        reqType: item.reqType || (item.legalReq ? 'Legal' : 'Ninguno'),
        project: item.project || '',
        city: item.city || '',
        client: item.client || ''
      });
    } else {
      setEditingItem(null);
      setFormData({ 
        process: '', activityName: '', aspect: '', impact: '', cond: 'Normal', reqType: 'Ninguno', 
        severity: 1, frequency: 1, scope: 1, status: 'Activo', lifecycleStage: 'Producción / Manufactura',
        wasteDescription: '', controlMeasure: '', responsible: APP_USERS[0]?.name || '', evidenceFile: null, 
        controlStatus: 'Pendiente', followUpNotes: '', project: '', city: '', client: '' 
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingItem) {
      setAspects(aspects.map(a => a.id === editingItem.id ? { ...formData, id: a.id } : a));
    } else {
      const newId = Date.now();
      setAspects([...aspects, { ...formData, id: newId }]);
      setSelectedAspectId(newId);
    }
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Está seguro de eliminar este aspecto ambiental?")) {
      const remaining = aspects.filter(a => a.id !== id);
      setAspects(remaining);
      if (selectedAspectId === id) {
        setSelectedAspectId(remaining[0]?.id || null);
      }
    }
  };

  // Handle inline follow-up save
  const handleSaveFollowUp = (e) => {
    e.preventDefault();
    if (!selectedAspectId) return;

    setAspects(aspects.map(a => {
      if (a.id === selectedAspectId) {
        return {
          ...a,
          controlStatus: followUpForm.controlStatus,
          followUpNotes: followUpForm.followUpNotes,
          evidenceFile: followUpForm.evidenceFile
        };
      }
      return a;
    }));

    alert("[HSEQ] Seguimiento y estado del control actualizados con éxito.");
  };

  const handleInlineFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFollowUpForm({ ...followUpForm, evidenceFile: file.name });
    }
  };

  const handleModalFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, evidenceFile: file.name });
    }
  };

  const handleExport = () => {
    const cols = [
      { header: 'ID', key: 'id' },
      { header: 'Proceso', key: 'process' },
      { header: 'Actividad', key: 'activityName' },
      { header: 'Proyecto', key: 'project' },
      { header: 'Ciudad', key: 'city' },
      { header: 'Cliente / Razón Social', key: 'client' },
      { header: 'Etapa Ciclo de Vida', key: 'lifecycleStage' },
      { header: 'Aspecto Ambiental', key: 'aspect' },
      { header: 'Impacto Ambiental', key: 'impact' },
      { header: 'Condición', key: 'cond' },
      { header: 'Tipo Requisito', key: 'reqType' },
      { header: 'Gravedad (S)', key: 'severity' },
      { header: 'Frecuencia (F)', key: 'frequency' },
      { header: 'Alcance (A)', key: 'scope' },
      { header: 'Puntaje', key: 'score' },
      { header: 'Significancia', key: 'significance' },
      { header: 'Medida de Control', key: 'controlMeasure' },
      { header: 'Responsable', key: 'responsible' },
      { header: 'Estado del Control', key: 'controlStatus' },
      { header: 'Última Verificación / Seguimiento', key: 'followUpNotes' }
    ];

    const dataToExport = normalizedAspects.map(a => ({
      id: a.id,
      process: a.process,
      activityName: a.activityName,
      project: a.project || 'N/A',
      city: a.city || 'N/A',
      client: a.client || 'N/A',
      lifecycleStage: a.lifecycleStage,
      aspect: a.aspect,
      impact: a.impact,
      cond: a.cond,
      reqType: a.reqType || 'Ninguno',
      severity: a.severity,
      frequency: a.frequency,
      scope: a.scope,
      score: calcScore(a),
      significance: isSig(a) ? 'Significativo' : 'No Significativo',
      controlMeasure: a.controlMeasure,
      responsible: a.responsible,
      controlStatus: a.controlStatus,
      followUpNotes: a.followUpNotes || 'Sin observaciones'
    }));

    setExportConfig({
      isOpen: true,
      exportType: 'excel',
      title: 'Matriz de Aspectos e Impactos Ambientales',
      code: 'AMB-MAT-ASP-001',
      version: `0${meta.version}`,
      validity: meta.validity,
      columns: cols,
      data: dataToExport,
      history: envAspectsHistory
    });
  };

  return (
    <>
      <style>{`
        .aspect-row {
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        .aspect-row:hover {
          background-color: var(--bg-secondary) !important;
        }
        .aspect-row.active {
          background-color: var(--bg-tertiary) !important;
          border-left: 4px solid var(--accent-primary) !important;
        }
      `}</style>

      {/* Header */}
      <div style={{display:'flex', justifyContent:'space-between', marginBottom:'1.5rem', alignItems:'center', flexWrap:'wrap', gap:'1rem'}}>
        <div>
          <p style={{color:'var(--text-secondary)', marginBottom:'0.25rem'}}>Aspectos e Impactos Ambientales (ISO 14001:2015)</p>
          <span className="badge badge-info"><Clock size={12} style={{marginRight:'4px'}}/> Gestión de Ciclo de Vida y Residuos</span>
        </div>
        <div style={{display:'flex', gap:'0.5rem', flexWrap:'wrap'}}>
          <button className="btn-secondary" onClick={handleExport}><Download size={16}/> Exportar Datos</button>
          <button className="btn-primary" onClick={() => handleOpenModal()}><Plus size={16}/> Nuevo Aspecto</button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid-3" style={{marginBottom:'1.5rem'}}>
        <div className="card" style={{marginBottom:0, borderLeft:'4px solid var(--accent-primary)', padding:'1.25rem'}}>
          <div style={{fontSize:'0.8rem', color:'var(--text-secondary)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.5rem'}}>Total Aspectos Identificados</div>
          <div style={{fontSize:'2rem', fontWeight:700}}>{total}</div>
        </div>
        <div className="card" style={{marginBottom:0, borderLeft:'4px solid var(--danger)', padding:'1.25rem'}}>
          <div style={{fontSize:'0.8rem', color:'var(--text-secondary)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.5rem'}}>Aspectos Significativos / Legales</div>
          <div style={{fontSize:'2rem', fontWeight:700, color:'var(--danger)'}}>{sigCount}</div>
        </div>
        <div className="card" style={{marginBottom:0, borderLeft:'4px solid var(--success)', padding:'1.25rem'}}>
          <div style={{fontSize:'0.8rem', color:'var(--text-secondary)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.5rem'}}>Aspectos Controlados / Tolerables</div>
          <div style={{fontSize:'2rem', fontWeight:700, color:'var(--success)'}}>{noSigCount}</div>
        </div>
      </div>

      {/* Filter Selector */}
      <div className="card" style={{marginBottom:'1.5rem', padding:'0.75rem 1.5rem'}}>
        <div style={{display:'flex', alignItems:'center', gap:'0.75rem', flexWrap:'wrap', marginBottom: '0.75rem'}}>
          <span style={{fontSize:'0.85rem', fontWeight:600, color:'var(--text-secondary)'}}><Filter size={14} style={{verticalAlign:'middle', marginRight:'4px'}}/> Filtro Proceso:</span>
          {processes.map(p => (
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

      {/* Table grid */}
      <div className="card" style={{padding:0, overflow:'hidden'}}>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Proceso / Actividad</th>
                <th>Etapa Ciclo de Vida</th>
                <th>Aspecto Ambiental</th>
                <th>Impacto Ambiental</th>
                <th>Condición</th>
                <th>Tipo Requisito</th>
                <th title="Severidad">S</th>
                <th title="Frecuencia">F</th>
                <th title="Alcance">A</th>
                <th>Puntaje</th>
                <th>Estado Control</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="12" style={{textAlign:'center', padding:'2rem'}}>No hay registros de aspectos ambientales.</td></tr>
              ) : filtered.map(a => {
                const s = calcScore(a);
                const sig = isSig(a);
                
                let controlBadge = 'badge-danger';
                if (a.controlStatus === 'Implementado') controlBadge = 'badge-success';
                else if (a.controlStatus === 'En Proceso') controlBadge = 'badge-warning';

                return (
                  <tr 
                    key={a.id}
                    className={`aspect-row ${a.id === selectedAspectId ? 'active' : ''}`}
                    onClick={() => setSelectedAspectId(a.id)}
                  >
                    <td>
                      <strong style={{fontSize:'0.88rem'}}>{a.process}</strong>
                      <div style={{fontSize:'0.75rem', color:'var(--text-secondary)'}}>{a.activityName || 'General'}</div>
                      {a.project && <div style={{fontSize:'0.72rem', color:'var(--accent-primary)', marginTop:'2px'}}><strong>Proy:</strong> {a.project}</div>}
                      {a.city && <div style={{fontSize:'0.72rem', color:'var(--text-muted)'}}><strong>Ciudad:</strong> {a.city}</div>}
                      {a.client && <div style={{fontSize:'0.72rem', color:'var(--success)'}}><strong>Cliente:</strong> {a.client}</div>}
                    </td>
                    <td>
                      <span style={{fontSize:'0.78rem', fontWeight:600, color:'var(--text-primary)'}}>{a.lifecycleStage}</span>
                    </td>
                    <td style={{fontSize:'0.82rem', maxWidth:'200px'}}>{a.aspect}</td>
                    <td style={{fontSize:'0.82rem', maxWidth:'200px'}}>{a.impact}</td>
                    <td>
                      <span className={`badge ${a.cond === 'Normal' ? 'badge-info' : a.cond === 'Emergencia' ? 'badge-danger' : 'badge-warning'}`}>
                        {a.cond}
                      </span>
                    </td>
                    <td>
                      {a.reqType === 'Legal' && <span className="badge badge-danger">Legal</span>}
                      {a.reqType === 'Contractual' && <span className="badge badge-info">Contractual</span>}
                      {a.reqType === 'Otro' && <span className="badge badge-warning">Otro</span>}
                      {(a.reqType === 'Ninguno' || !a.reqType) && <span style={{color:'var(--text-muted)'}}>-</span>}
                    </td>
                    <td style={{textAlign:'center'}}>{a.severity}</td>
                    <td style={{textAlign:'center'}}>{a.frequency}</td>
                    <td style={{textAlign:'center'}}>{a.scope}</td>
                    <td style={{textAlign:'center', fontWeight:700, color: sig ? 'var(--danger)' : 'var(--text-primary)'}}>{s}</td>
                    <td><span className={`badge ${controlBadge}`}>{a.controlStatus || 'Pendiente'}</span></td>
                    <td>
                      <div style={{display:'flex', gap:'0.25rem'}} onClick={e => e.stopPropagation()}>
                        <button className="btn-icon" style={{padding:'0.25rem', color:'var(--text-muted)'}} onClick={() => handleOpenModal(a)}><Edit2 size={14}/></button>
                        <button className="btn-icon" style={{padding:'0.25rem', color:'var(--danger)'}} onClick={() => handleDelete(a.id)}><Trash2 size={14}/></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SELECTED ASPECT DETAIL SHEET */}
      {selectedAspect && (
        <div className="card fade-in" style={{ marginTop: '1.5rem', padding: '1.25rem', borderLeft: '4px solid var(--accent-primary)', marginBottom: '2rem' }}>
          
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <span className="badge badge-info" style={{ marginBottom: '0.25rem', display: 'inline-block' }}>
                <ShieldCheck size={10} style={{ marginRight: '4px' }} /> Ficha de Aspecto e Impacto Ambiental
              </span>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
                {selectedAspect.aspect}
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Proceso: <strong>{selectedAspect.process}</strong> | Proyecto: <strong>{selectedAspect.project || 'General'}</strong> | Ciudad: <strong>{selectedAspect.city || 'No asignada'}</strong> | Cliente: <strong>{selectedAspect.client || 'N/A'}</strong> | Actividad: <strong>{selectedAspect.activityName}</strong>
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button className="btn-secondary" style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem' }} onClick={() => handleOpenModal(selectedAspect)}>
                <Edit2 size={12} style={{ marginRight: '4px' }} /> Editar Aspecto
              </button>
            </div>
          </div>

          {/* Sub Navigation */}
          <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            <button 
              className={`btn-secondary ${detailTab === 'detail' ? 'active' : ''}`}
              style={{ border: 'none', fontSize: '0.8rem', padding: '0.3rem 0.6rem', background: detailTab === 'detail' ? 'rgba(14, 165, 233, 0.1)' : 'transparent', color: detailTab === 'detail' ? 'var(--accent-primary)' : 'var(--text-secondary)' }}
              onClick={() => setDetailTab('detail')}
            >
              <FileText size={12} style={{ marginRight: '3px' }} /> Detalle e Impacto
            </button>
            <button 
              className={`btn-secondary ${detailTab === 'control' ? 'active' : ''}`}
              style={{ border: 'none', fontSize: '0.8rem', padding: '0.3rem 0.6rem', background: detailTab === 'control' ? 'rgba(16, 185, 129, 0.1)' : 'transparent', color: detailTab === 'control' ? 'var(--success)' : 'var(--text-secondary)' }}
              onClick={() => setDetailTab('control')}
            >
              <ClipboardList size={12} style={{ marginRight: '3px' }} /> Control, Seguimiento y Evidencias
            </button>
          </div>

          {/* TAB 1: Aspect details & waste description */}
          {detailTab === 'detail' && (
            <div className="grid-2 fade-in" style={{ gap: '1.25rem' }}>
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Descripción del Aspecto / Generación de Residuos</h4>
                <div style={{ background: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: '6px', border: '1px solid var(--border-color)', minHeight: '90px' }}>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: selectedAspect.wasteDescription ? 'var(--text-primary)' : 'var(--text-muted)', lineHeight: '1.4' }}>
                    {selectedAspect.wasteDescription || 'No se ingresó una descripción detallada para la generación de residuos o este aspecto.'}
                  </p>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Evaluación de Significancia</h4>
                <div className="grid-2" style={{ gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
                  <div>Severidad (S): <strong>{selectedAspect.severity} / 5</strong></div>
                  <div>Frecuencia (F): <strong>{selectedAspect.frequency} / 5</strong></div>
                  <div>Alcance (A): <strong>{selectedAspect.scope} / 5</strong></div>
                  <div>Puntaje Total: <strong>{calcScore(selectedAspect)} / 125</strong></div>
                  <div style={{ gridColumn: 'span 2' }}>Tipo Requisito: <strong>{selectedAspect.reqType || 'Ninguno'}</strong></div>
                  
                  <div style={{ gridColumn: 'span 2', borderTop: '1px solid var(--border-color)', paddingTop: '0.4rem', marginTop: '0.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Significancia:</span>
                    <span className={`badge ${isSig(selectedAspect) ? 'badge-danger' : 'badge-success'}`}>
                      {isSig(selectedAspect) ? (selectedAspect.reqType === 'Legal' ? 'Requisito Legal / Significativo' : 'Significativo') : 'No Significativo'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Control, Follow-up & Evidence */}
          {detailTab === 'control' && (
            <div className="grid-2 fade-in" style={{ gap: '1.25rem' }}>
              
              {/* Info panel of current controls */}
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Plan de Medidas de Control</h4>
                <div style={{ background: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: '6px', border: '1px solid var(--border-color)', display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Medida de Control / Actividad:</span>
                    <strong style={{ fontSize: '0.82rem' }}>{selectedAspect.controlMeasure || 'Ninguna medida registrada'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.4rem' }}>
                    <span>Responsable: <strong>{selectedAspect.responsible}</strong></span>
                    <span>Estado: <strong style={{ color: selectedAspect.controlStatus === 'Implementado' ? 'var(--success)' : selectedAspect.controlStatus === 'En Proceso' ? 'var(--warning)' : 'var(--danger)' }}>{selectedAspect.controlStatus}</strong></span>
                  </div>
                </div>

                {/* Evidence Download */}
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', marginTop: '0.75rem', color: 'var(--text-secondary)' }}>Soporte de Evidencia</h4>
                {selectedAspect.evidenceFile ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: 0 }}>
                      <Paperclip size={14} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={selectedAspect.evidenceFile}>
                        {selectedAspect.evidenceFile}
                      </span>
                    </div>
                    <button 
                      type="button" 
                      className="btn-secondary" 
                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '2px' }}
                      onClick={() => {
                        window.alert(`[HSEQ] Descargando evidencia de control ambiental: "${selectedAspect.evidenceFile}"`);
                      }}
                    >
                      Descargar
                    </button>
                  </div>
                ) : (
                  <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '6px', border: '1px dashed var(--border-color)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                    Sin evidencias de cumplimiento registradas.
                  </div>
                )}
              </div>

              {/* Interactive Update Form */}
              <form onSubmit={handleSaveFollowUp} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '0.82rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: 'var(--accent-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem' }}>Registrar Seguimiento y Evidencias</h4>
                
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.72rem' }}>Estado de Control</label>
                  <select 
                    className="form-control" 
                    style={{ fontSize: '0.78rem', padding: '0.2rem' }}
                    value={followUpForm.controlStatus}
                    onChange={e => setFollowUpForm({ ...followUpForm, controlStatus: e.target.value })}
                    required
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="En Proceso">En Proceso</option>
                    <option value="Implementado">Implementado</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.72rem' }}>Comentarios o Resultados del Seguimiento</label>
                  <textarea 
                    className="form-control" 
                    rows="2" 
                    style={{ fontSize: '0.78rem', padding: '0.3rem' }}
                    value={followUpForm.followUpNotes}
                    onChange={e => setFollowUpForm({ ...followUpForm, followUpNotes: e.target.value })}
                    placeholder="Describa el avance, inspecciones realizadas o hallazgos..."
                    required
                  ></textarea>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.72rem' }}>Adjuntar Reporte / Evidencia</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-primary)', padding: '0.35rem 0.5rem', borderRadius: '4px', border: '1px dashed var(--border-color)' }}>
                    <input 
                      type="file" 
                      id="file-followup-upload" 
                      style={{ display: 'none' }}
                      onChange={handleInlineFileChange} 
                    />
                    <label htmlFor="file-followup-upload" className="btn-secondary" style={{ cursor: 'pointer', margin: 0, padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}>
                      <Upload size={12} style={{ marginRight: '3px' }} /> Subir Evidencia
                    </label>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '150px' }}>
                      {followUpForm.evidenceFile || 'Formatos: PDF, XLS, Doc.'}
                    </span>
                  </div>
                </div>

                <button type="submit" className="btn-primary" style={{ padding: '0.35rem 0.5rem', fontSize: '0.78rem', alignSelf: 'flex-end', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '0.25rem' }}>
                  <CheckCircle size={12} /> Guardar Seguimiento
                </button>
              </form>

            </div>
          )}

        </div>
      )}

      {/* Main Creation/Editing Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingItem ? "Editar Aspecto Ambiental" : "Nuevo Aspecto Ambiental"}
      >
        <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', gap:'1rem', maxHeight:'80vh', overflowY:'auto', paddingRight:'5px'}}>
          
          <div style={{background:'var(--bg-secondary)', padding:'0.75rem', borderRadius:'6px', border:'1px solid var(--border-color)'}}>
            <h5 style={{fontSize:'0.82rem', fontWeight:700, color:'var(--accent-primary)', margin:'0 0 0.5rem 0'}}>1. Identificación y Ciclo de Vida</h5>
            <div className="grid-2" style={{gap:'0.75rem'}}>
              <div className="form-group">
                <label className="form-label">Proceso</label>
                <input type="text" className="form-control" value={formData.process} onChange={e => setFormData({...formData, process: e.target.value})} placeholder="Ej. Producción" required />
              </div>
              <div className="form-group">
                <label className="form-label">Actividad Específica</label>
                <input type="text" className="form-control" value={formData.activityName} onChange={e => setFormData({...formData, activityName: e.target.value})} placeholder="Ej. Troquelado de láminas" required />
              </div>
              <div className="form-group">
                <label className="form-label">Proyecto</label>
                <select 
                  className="form-control" 
                  value={formData.project || ''} 
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
                <label className="form-label">Ciudad / Ubicación</label>
                <select 
                  className="form-control" 
                  value={formData.city || ''} 
                  onChange={e => setFormData({...formData, city: e.target.value})} 
                  required 
                >
                  <option value="">Seleccione la ciudad / ubicación...</option>
                  {cityOptions.map((c, idx) => (
                    <option key={idx} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{gridColumn:'span 2'}}>
                <label className="form-label">Cliente / Razón Social</label>
                <select 
                  className="form-control" 
                  value={formData.client || ''} 
                  onChange={e => setFormData({ ...formData, client: e.target.value })} 
                  required 
                >
                  <option value="">Seleccione el cliente / razón social...</option>
                  {clientOptions.map((c, idx) => (
                    <option key={idx} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{gridColumn:'span 2'}}>
                <label className="form-label">Etapa de Ciclo de Vida del Producto</label>
                <select className="form-control" value={formData.lifecycleStage} onChange={e => setFormData({...formData, lifecycleStage: e.target.value})} required>
                  {lifecycleStages.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div style={{background:'var(--bg-secondary)', padding:'0.75rem', borderRadius:'6px', border:'1px solid var(--border-color)'}}>
            <h5 style={{fontSize:'0.82rem', fontWeight:700, color:'var(--accent-primary)', margin:'0 0 0.5rem 0'}}>2. Aspecto, Impacto y Evaluación</h5>
            <div style={{display:'flex', flexDirection:'column', gap:'0.75rem'}}>
              <div className="form-group">
                <label className="form-label">Aspecto Ambiental (Causa)</label>
                <input type="text" className="form-control" value={formData.aspect} onChange={e => setFormData({...formData, aspect: e.target.value})} placeholder="Ej. Generación de chatarra" required />
              </div>
              <div className="form-group">
                <label className="form-label">Impacto Ambiental (Efecto)</label>
                <input type="text" className="form-control" value={formData.impact} onChange={e => setFormData({...formData, impact: e.target.value})} placeholder="Ej. Agotamiento de recursos" required />
              </div>
              
              <div className="form-group">
                <label className="form-label">Descripción de Generación (Residuos / Naturaleza)</label>
                <textarea className="form-control" rows="2" value={formData.wasteDescription} onChange={e => setFormData({...formData, wasteDescription: e.target.value})} placeholder="Describa cómo se genera el residuo, cantidad estimada, almacenamiento temporal..." required></textarea>
              </div>

              <div style={{display:'flex', gap:'1rem'}}>
                <div className="form-group" style={{flex:1}}>
                  <label className="form-label">Condición Operacional</label>
                  <select className="form-control" value={formData.cond} onChange={e => setFormData({...formData, cond: e.target.value})} required>
                    <option value="Normal">Normal</option>
                    <option value="Anormal">Anormal</option>
                    <option value="Emergencia">Emergencia</option>
                  </select>
                </div>
                <div className="form-group" style={{flex:1}}>
                  <label className="form-label">Tipo de Requisito</label>
                  <select className="form-control" value={formData.reqType || 'Ninguno'} onChange={e => setFormData({...formData, reqType: e.target.value})}>
                    <option value="Ninguno">Ninguno</option>
                    <option value="Legal">Legal</option>
                    <option value="Contractual">Contractual</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
              </div>

              <div style={{display:'flex', gap:'1rem'}}>
                <div className="form-group" style={{flex:1}}>
                  <label className="form-label">Severidad (1-5)</label>
                  <input type="number" min="1" max="5" className="form-control" value={formData.severity} onChange={e => setFormData({...formData, severity: Number(e.target.value)})} required />
                </div>
                <div className="form-group" style={{flex:1}}>
                  <label className="form-label">Frecuencia (1-5)</label>
                  <input type="number" min="1" max="5" className="form-control" value={formData.frequency} onChange={e => setFormData({...formData, frequency: Number(e.target.value)})} required />
                </div>
                <div className="form-group" style={{flex:1}}>
                  <label className="form-label">Alcance (1-5)</label>
                  <input type="number" min="1" max="5" className="form-control" value={formData.scope} onChange={e => setFormData({...formData, scope: Number(e.target.value)})} required />
                </div>
              </div>
            </div>
          </div>

          <div style={{background:'var(--bg-secondary)', padding:'0.75rem', borderRadius:'6px', border:'1px solid var(--border-color)'}}>
            <h5 style={{fontSize:'0.82rem', fontWeight:700, color:'var(--accent-primary)', margin:'0 0 0.5rem 0'}}>3. Medida de Control y Cumplimiento</h5>
            <div className="grid-2" style={{gap:'0.75rem'}}>
              <div className="form-group" style={{gridColumn:'span 2'}}>
                <label className="form-label">Medida de Control / Actividad de Seguimiento</label>
                <input type="text" className="form-control" value={formData.controlMeasure} onChange={e => setFormData({...formData, controlMeasure: e.target.value})} placeholder="Ej. Clasificación en recipientes etiquetados y entrega a gestor" required />
              </div>
              <div className="form-group">
                <label className="form-label">Responsable del Cumplimiento</label>
                <select className="form-control" value={formData.responsible} onChange={e => setFormData({...formData, responsible: e.target.value})} required>
                  <option value="">Seleccione Usuario...</option>
                  {APP_USERS.map(u => <option key={u.email} value={u.name}>{u.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Estado de Control Inicial</label>
                <select className="form-control" value={formData.controlStatus} onChange={e => setFormData({...formData, controlStatus: e.target.value})} required>
                  <option value="Pendiente">Pendiente</option>
                  <option value="En Proceso">En Proceso</option>
                  <option value="Implementado">Implementado</option>
                </select>
              </div>
              
              <div className="form-group" style={{gridColumn:'span 2'}}>
                <label className="form-label">Comentarios / Notas de Seguimiento</label>
                <textarea className="form-control" rows="2" value={formData.followUpNotes} onChange={e => setFormData({...formData, followUpNotes: e.target.value})} placeholder="Avance del plan de control o justificación..."></textarea>
              </div>

              <div className="form-group" style={{gridColumn:'span 2'}}>
                <label className="form-label">Cargar Soporte de Evidencia Inicial</label>
                <div style={{display:'flex', alignItems:'center', gap:'0.5rem', background:'var(--bg-primary)', padding:'0.5rem', borderRadius:'var(--radius-sm)', border:'1px dashed var(--border-color)'}}>
                  <input type="file" id="file-modal-upload" style={{display:'none'}} onChange={handleModalFileChange} />
                  <label htmlFor="file-modal-upload" className="btn-secondary" style={{cursor:'pointer', margin:0, padding:'0.3rem 0.75rem', fontSize:'0.8rem'}}>
                    <Upload size={14} style={{marginRight:'4px'}}/> Subir Evidencia
                  </label>
                  <span style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>
                    {formData.evidenceFile || 'Ningún archivo soporte adjunto'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div style={{display:'flex', justifyContent:'flex-end', gap:'0.5rem', marginTop:'1rem'}}>
            <button type="button" className="btn-secondary" onClick={handleCloseModal}>Cancelar</button>
            <button type="submit" className="btn-primary">{editingItem ? "Actualizar Aspecto" : "Guardar Aspecto"}</button>
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
