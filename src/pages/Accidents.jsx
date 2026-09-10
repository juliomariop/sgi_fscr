import React, { useState, useMemo } from 'react';
import { 
  Target, Plus, Download, Edit2, Trash2, CheckCircle, Clock, 
  AlertTriangle, ShieldAlert, FileText, Activity, Link, 
  ExternalLink, PlusCircle, CheckSquare, X, Calendar, MapPin, 
  Briefcase, Save, Award, Upload, Paperclip
} from 'lucide-react';
import Modal from '../components/Modal';
import { downloadCSV } from '../utils/exportUtils';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAppUsers } from '../hooks/useAppUsers';
import { useNavigate } from 'react-router-dom';

const DEFAULT_PARAMS = {
  projectTypes: ["Eléctrico", "Telecomunicaciones", "Civil", "Ambiental", "Industrial"],
  clients: ["Consorcio Vial del Norte", "Ecopetrol", "Claro", "Movistar"],
  cities: ["Bogotá", "Medellín", "Cali", "Barranquilla", "Bucaramanga"]
};

const bodyParts = [
  'Cabeza / Cuello',
  'Ojos',
  'Manos / Dedos',
  'Brazos / Hombros',
  'Espalda / Tronco',
  'Pies / Dedos del pie',
  'Piernas / Rodillas',
  'Sistémico (Inhalación / Intoxicación)',
  'Múltiple'
];

const accidentClassifications = [
  'Leve',
  'Grave',
  'Severo',
  'Mortal'
];

const defaultAccident = {
  employeeName: '',
  date: '',
  time: '',
  bodyPart: 'Manos / Dedos',
  classification: 'Leve',
  description: '',
  witnesses: '',
  project: '',
  city: '',
  client: '',
  cargo: '',
  furatUrl: '', // Stores the uploaded FURAT file name
  technicalReportUrl: '', // Stores the uploaded Technical Report file name
  lessonsLearnedSummary: '',
  lessonsLearnedTrainingId: null,
  whys: ['', '', '', '', ''],
  rootCause: '',
  status: 'Reportado', // Reportado, Investigado, Cerrado
  actionPlanId: null
};

export default function Accidents() {
  const APP_USERS = useAppUsers();
  const navigate = useNavigate();

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

  const [accidents, setAccidents] = useLocalStorage('sgi_accidents', [
    {
      id: 1,
      employeeName: 'Carlos Gómez',
      date: '2026-05-10',
      time: '10:30',
      bodyPart: 'Manos / Dedos',
      classification: 'Leve',
      description: 'Atrapamiento de dedo índice de mano derecha en troqueladora al realizar limpieza de virutas.',
      witnesses: 'Jorge Pérez (Operario de planta)',
      project: 'Eléctrico',
      city: 'Cali',
      client: 'Consorcio Vial del Norte',
      cargo: 'Auxiliar Eléctrico',
      furatUrl: 'furat_carlos_gomez_80123.pdf',
      technicalReportUrl: 'informe_investigacion_cgomez_2026.pdf',
      lessonsLearnedSummary: 'No intervenir equipos en movimiento. Aplicar obligatoriamente la regla de oro de desenergización y bloqueo mecánico (procedimiento LOTO).',
      lessonsLearnedTrainingId: 2,
      whys: [
        'El operario introdujo el dedo en la zona de peligro.',
        'La máquina no estaba completamente apagada al limpiar.',
        'No se aplicó el protocolo de bloqueo y etiquetado (LOTO).',
        'El operario tenía afán de terminar el mantenimiento.',
        'Falta de supervisión y refuerzo del protocolo de bloqueo.'
      ],
      rootCause: 'Falta de disciplina operativa y supervisión estricta en el uso del procedimiento LOTO.',
      status: 'Investigado',
      actionPlanId: 'PA-001'
    }
  ]);

  const [actionPlans, setActionPlans] = useLocalStorage('sgi_action_plans', []);
  const [trainings, setTrainings] = useLocalStorage('sgi_trainings', []);

  // Modal control states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(defaultAccident);
  const [activeTab, setActiveTab] = useState('Reportados'); // Reportados, Investigados

  // Detailed management states
  const [selectedAccident, setSelectedAccident] = useState(null);
  const [detailTab, setDetailTab] = useState('info'); // info, actionplan, lessons
  const [detailFuratUrl, setDetailFuratUrl] = useState('');
  const [detailReportUrl, setDetailReportUrl] = useState('');
  const [detailLessonsSummary, setDetailLessonsSummary] = useState('');
  const [detailLessonsTrainingId, setDetailLessonsTrainingId] = useState('');
  const [detailWhys, setDetailWhys] = useState(['', '', '', '', '']);
  const [detailRootCause, setDetailRootCause] = useState('');

  // Plan de acción task states
  const [newTaskAction, setNewTaskAction] = useState('');
  const [newTaskResp, setNewTaskResp] = useState('');
  const [newTaskDate, setNewTaskDate] = useState('');
  const [newTaskFollowResp, setNewTaskFollowResp] = useState('');
  const [newTaskFollowDate, setNewTaskFollowDate] = useState('');

  // Lección aprendida training states
  const [newTrainingDate, setNewTrainingDate] = useState('');
  const [newTrainingTrainer, setNewTrainingTrainer] = useState('');
  const [isCreatingTraining, setIsCreatingTraining] = useState(false);

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({ ...defaultAccident, ...item });
    } else {
      setEditingItem(null);
      setFormData(defaultAccident);
    }
    setIsModalOpen(true);
  };

  const handleOpenDetailModal = (accident) => {
    setSelectedAccident(accident);
    setDetailFuratUrl(accident.furatUrl || '');
    setDetailReportUrl(accident.technicalReportUrl || '');
    setDetailLessonsSummary(accident.lessonsLearnedSummary || '');
    setDetailLessonsTrainingId(accident.lessonsLearnedTrainingId ? String(accident.lessonsLearnedTrainingId) : '');
    setDetailWhys(accident.whys || ['', '', '', '', '']);
    setDetailRootCause(accident.rootCause || '');
    setDetailTab('info');
    setIsCreatingTraining(false);
    setNewTrainingDate('');
    setNewTrainingTrainer(APP_USERS[0]?.name || '');
    setIsDetailModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingItem) {
      setAccidents(accidents.map(a => a.id === editingItem.id ? { ...formData, id: a.id } : a));
    } else {
      setAccidents([...accidents, { ...formData, id: Date.now() }]);
    }
    setIsModalOpen(false);
  };

  const handleSaveDetailChanges = () => {
    const updated = accidents.map(a => {
      if (a.id === selectedAccident.id) {
        return {
          ...a,
          furatUrl: detailFuratUrl,
          technicalReportUrl: detailReportUrl,
          lessonsLearnedSummary: detailLessonsSummary,
          lessonsLearnedTrainingId: detailLessonsTrainingId ? Number(detailLessonsTrainingId) : null,
          whys: detailWhys,
          rootCause: detailRootCause,
          status: detailRootCause ? 'Investigado' : 'Reportado'
        };
      }
      return a;
    });
    setAccidents(updated);
    setIsDetailModalOpen(false);
    alert('Gestión e investigación del accidente guardada exitosamente.');
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Está seguro de eliminar este registro de accidente?")) {
      setAccidents(accidents.filter(a => a.id !== id));
    }
  };

  const generateActionPlan = (accident, shouldNavigate = true) => {
    const paId = `PA-${String(actionPlans.length + 1).padStart(3, '0')}`;
    const newPlan = {
      id: paId,
      source: 'Incidentes/Accidentes',
      type: 'Correctiva',
      desc: `Accidente de Trabajo - ${accident.employeeName}. Lesión: ${accident.bodyPart}. Suceso: ${accident.description}`,
      methodology: '5 Por qués',
      whys: accident.whys || ['', '', '', '', ''],
      rootCause: accident.rootCause || 'Pendiente de determinar',
      immediateAction: 'Realizar re-inducción de seguridad y evaluar controles de la máquina.',
      immediateResponsible: APP_USERS[0]?.name || 'Responsable HSEQ',
      immediateDate: new Date().toISOString().split('T')[0],
      immediateFollowDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      immediateFollowResp: APP_USERS[1]?.name || 'Coordinador HSEQ',
      tasks: [],
      status: 'Abierta',
      efficacy: '',
      efficacySummary: '',
      efficacyEvidence: null
    };

    setActionPlans([...actionPlans, newPlan]);
    
    const updated = accidents.map(a => a.id === accident.id ? { ...a, actionPlanId: paId } : a);
    setAccidents(updated);

    if (selectedAccident && selectedAccident.id === accident.id) {
      setSelectedAccident({ ...selectedAccident, actionPlanId: paId });
    }

    alert(`Se ha generado con éxito el Plan de Acción Correctiva ${paId}`);
    
    if (shouldNavigate) {
      navigate('/actionPlans');
    }
  };

  const handleAddTaskToPlan = () => {
    const planId = selectedAccident.actionPlanId;
    if (!planId) return;

    if (!newTaskAction.trim() || !newTaskResp.trim() || !newTaskDate.trim()) {
      alert('Por favor complete los campos obligatorios de la tarea (acción, responsable y fecha).');
      return;
    }

    const plan = actionPlans.find(p => p.id === planId);
    if (!plan) return;

    const newTask = {
      id: Date.now(),
      action: newTaskAction.trim(),
      execDate: newTaskDate,
      execResp: newTaskResp.trim(),
      followDate: newTaskFollowDate || newTaskDate,
      followResp: newTaskFollowResp.trim() || APP_USERS[0]?.name || 'Responsable Seguimiento HSEQ',
      evidence: null
    };

    const updatedTasks = [...(plan.tasks || []), newTask];
    const updatedPlans = actionPlans.map(p => p.id === plan.id ? { 
      ...p, 
      tasks: updatedTasks,
      status: p.status === 'Abierta' ? 'En Ejecución' : p.status 
    } : p);

    setActionPlans(updatedPlans);
    setNewTaskAction('');
    setNewTaskResp('');
    setNewTaskDate('');
    setNewTaskFollowResp('');
    setNewTaskFollowDate('');
    alert('Tarea agregada al Plan de Acción.');
  };

  const handleCreateLessonsTraining = () => {
    if (!newTrainingDate) {
      alert('Por favor seleccione la fecha programada para la capacitación.');
      return;
    }

    const newTrainingId = Date.now();
    const newTraining = {
      id: newTrainingId,
      category: 'SST',
      topic: `Divulgación Lección Aprendida Accidente - ${selectedAccident.employeeName}`,
      date: newTrainingDate,
      objective: 'Difundir la lección aprendida y acciones de control resultantes del accidente laboral.',
      trainer: newTrainingTrainer || APP_USERS[0]?.name || 'Líder HSEQ',
      observations: `Causa raíz analizada: ${detailRootCause || selectedAccident.rootCause || 'Pendiente'}`,
      attachedFile: null,
      status: 'Pendiente',
      participants: [],
      evaluationConfig: { enabled: false, passingScorePercent: 80, questions: [] },
      evaluations: []
    };

    setTrainings([...trainings, newTraining]);
    setDetailLessonsTrainingId(String(newTrainingId));
    setIsCreatingTraining(false);
    alert('Nueva capacitación creada y agendada en el Plan de Formación SST.');
  };

  const handleExport = () => {
    downloadCSV(
      accidents.map(a => ({
        ID: a.id,
        Colaborador: a.employeeName,
        Cargo: a.cargo || 'N/A',
        Proyecto: a.project || 'N/A',
        Ciudad: a.city || 'N/A',
        Fecha: a.date,
        Hora: a.time,
        Parte_Afectada: a.bodyPart,
        Clasificacion: a.classification,
        Furat_Adjunto: a.furatUrl || 'N/A',
        Informe_Tecnico_Adjunto: a.technicalReportUrl || 'N/A',
        Plan_Accion_Asociado: a.actionPlanId || 'N/A',
        Leccion_Aprendida_Capacitacion_ID: a.lessonsLearnedTrainingId || 'N/A',
        Estado: a.status,
        Causa_Raiz: a.rootCause || 'N/A'
      })),
      "Registro_Accidentes_Trabajo"
    );
  };

  const filteredAccidents = accidents.filter(a => {
    if (activeTab === 'Reportados') return a.status === 'Reportado';
    return a.status === 'Investigado';
  });

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>ISO 45001 - Cláusula 10.2</p>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Reporte e Investigación de Accidentes</h2>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button className="btn-secondary" onClick={handleExport}><Download size={16} /> Exportar Reporte</button>
          <button className="btn-primary" onClick={() => handleOpenModal()}><Plus size={16} /> Reportar Accidente</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button 
          className={`btn-secondary ${activeTab === 'Reportados' ? 'active' : ''}`} 
          style={{ border: 'none', background: activeTab === 'Reportados' ? 'rgba(239, 68, 68, 0.1)' : 'transparent', color: activeTab === 'Reportados' ? 'var(--danger)' : 'var(--text-secondary)', fontWeight: 600 }}
          onClick={() => setActiveTab('Reportados')}
        >
          Pendientes de Investigación ({accidents.filter(a => a.status === 'Reportado').length})
        </button>
        <button 
          className={`btn-secondary ${activeTab === 'Investigados' ? 'active' : ''}`} 
          style={{ border: 'none', background: activeTab === 'Investigados' ? 'rgba(16, 185, 129, 0.1)' : 'transparent', color: activeTab === 'Investigados' ? 'var(--success)' : 'var(--text-secondary)', fontWeight: 600 }}
          onClick={() => setActiveTab('Investigados')}
        >
          Investigados ({accidents.filter(a => a.status === 'Investigado').length})
        </button>
      </div>

      {/* List */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Fecha / Hora</th>
                <th>Colaborador / Cargo / Proyecto</th>
                <th>Parte / Clasificación</th>
                <th>Evidencias y Cierre HSEQ</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccidents.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No hay registros en esta sección.
                  </td>
                </tr>
              ) : (
                filteredAccidents.map(a => (
                  <tr key={a.id}>
                    <td>
                      <div>{a.date}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Hora: {a.time}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{a.employeeName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {a.cargo && <span><strong>Cargo:</strong> {a.cargo}</span>}
                        {(a.project || a.city) && <span><strong>Ubicación:</strong> {a.project} {a.city ? `(${a.city})` : ''}</span>}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.82rem', marginBottom: '0.25rem' }}>{a.bodyPart}</div>
                      <span className={`badge ${
                        a.classification === 'Leve' ? 'badge-info' : 
                        a.classification === 'Grave' ? 'badge-warning' : 
                        a.classification === 'Severo' ? 'badge-danger' : 'badge-danger'
                      }`} style={{ color: a.classification === 'Mortal' ? '#fff' : '', background: a.classification === 'Mortal' ? 'var(--text-primary)' : '' }}>
                        {a.classification}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        {a.furatUrl ? (
                          <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }} title={`Archivo: ${a.furatUrl}`}>
                            <Paperclip size={10} /> FURAT
                          </span>
                        ) : (
                          <span className="badge" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>Sin FURAT</span>
                        )}

                        {a.technicalReportUrl ? (
                          <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }} title={`Archivo: ${a.technicalReportUrl}`}>
                            <FileText size={10} /> Informe Técnico
                          </span>
                        ) : (
                          <span className="badge" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>Sin Informe</span>
                        )}

                        {a.actionPlanId ? (
                          <span className="badge badge-info" style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }} title={`Plan de Acción: ${a.actionPlanId}`}>
                            🛠️ {a.actionPlanId}
                          </span>
                        ) : (
                          <span className="badge" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>Sin Plan</span>
                        )}

                        {a.lessonsLearnedTrainingId ? (
                          <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }} title="Lección Aprendida Divulgada">
                            🎓 Divulgada
                          </span>
                        ) : (
                          <span className="badge" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>Sin Lección</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${a.status === 'Investigado' ? 'badge-success' : 'badge-warning'}`}>
                        {a.status === 'Investigado' ? <CheckCircle size={12} /> : <Clock size={12} />} {a.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                        <button className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => handleOpenDetailModal(a)}>
                          <Activity size={12} /> Cierre y Gestión
                        </button>
                        <button className="btn-icon" style={{ padding: '0.25rem', color: 'var(--text-muted)' }} onClick={() => handleOpenModal(a)}><Edit2 size={14} /></button>
                        <button className="btn-icon" style={{ padding: '0.25rem', color: 'var(--danger)' }} onClick={() => handleDelete(a.id)}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL REGISTRAR ACCIDENTE */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? "Modificar Reporte" : "Reportar Nuevo Accidente de Trabajo"}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Nombre del Colaborador Afectado</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Ej: Juan Pérez" 
              value={formData.employeeName} 
              onChange={e => setFormData({ ...formData, employeeName: e.target.value })} 
              required 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
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

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Cargo del Colaborador</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Ej: Soldador" 
                value={formData.cargo || ''} 
                onChange={e => setFormData({ ...formData, cargo: e.target.value })} 
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Adjuntar Evidencia FURAT</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input 
                  type="file" 
                  id="furat-file-input"
                  style={{ display: 'none' }}
                  onChange={e => {
                    const file = e.target.files[0];
                    if (file) setFormData(prev => ({ ...prev, furatUrl: file.name }));
                  }}
                />
                <label htmlFor="furat-file-input" className="btn-secondary" style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', margin: 0 }}>
                  <Upload size={14} /> {formData.furatUrl ? 'Cambiar' : 'Subir FURAT'}
                </label>
                {formData.furatUrl && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '140px' }} title={formData.furatUrl}>
                    📎 {formData.furatUrl}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Fecha del Suceso</label>
              <input 
                type="date" 
                className="form-control" 
                value={formData.date} 
                onChange={e => setFormData({ ...formData, date: e.target.value })} 
                required 
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Hora aproximada</label>
              <input 
                type="time" 
                className="form-control" 
                value={formData.time} 
                onChange={e => setFormData({ ...formData, time: e.target.value })} 
                required 
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Parte del Cuerpo Afectada</label>
              <select 
                className="form-control" 
                value={formData.bodyPart} 
                onChange={e => setFormData({ ...formData, bodyPart: e.target.value })}
              >
                {bodyParts.map(bp => <option key={bp} value={bp}>{bp}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Clasificación Inicial</label>
              <select 
                className="form-control" 
                value={formData.classification} 
                onChange={e => setFormData({ ...formData, classification: e.target.value })}
              >
                {accidentClassifications.map(ac => <option key={ac} value={ac}>{ac}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Descripción de lo ocurrido (¿Qué pasó y cómo?)</label>
            <textarea 
              className="form-control" 
              rows="3" 
              placeholder="Describa el mecanismo del accidente de forma precisa..." 
              value={formData.description} 
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Testigos (Nombre y cargo, si aplica)</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Ej: Carlos Silva (Soldador)" 
              value={formData.witnesses} 
              onChange={e => setFormData({ ...formData, witnesses: e.target.value })} 
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn-primary">Reportar Accidente</button>
          </div>
        </form>
      </Modal>

      {/* MODAL DETALLE, INVESTIGACIÓN Y GESTIÓN DE CIERRE */}
      <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title="Gestión Integral y Cierre de Accidente">
        {selectedAccident && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '78vh', overflowY: 'auto', paddingRight: '4px' }}>
            
            {/* Header info card */}
            <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', padding: '0.85rem 1rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800 }}>{selectedAccident.employeeName}</h4>
                <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Clasificación: <strong>{selectedAccident.classification}</strong> • Fecha: <strong>{selectedAccident.date}</strong>
                </p>
              </div>
              <span className={`badge ${selectedAccident.status === 'Investigado' ? 'badge-success' : 'badge-warning'}`} style={{ fontWeight: 800, padding: '0.2rem 0.5rem' }}>
                {selectedAccident.status}
              </span>
            </div>

            {/* Sub-tabs header */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem', gap: '0.25rem' }}>
              <button 
                type="button" 
                className={`btn-secondary ${detailTab === 'info' ? 'active' : ''}`}
                style={{ flex: 1, padding: '0.45rem 0.5rem', fontSize: '0.78rem', border: 'none', background: detailTab === 'info' ? 'rgba(14, 165, 233, 0.1)' : 'transparent', color: detailTab === 'info' ? 'var(--accent-primary)' : 'var(--text-secondary)', fontWeight: 700 }}
                onClick={() => setDetailTab('info')}
              >
                <Activity size={13} style={{ marginRight: '3px' }} /> 1. Investigación y FURAT
              </button>
              <button 
                type="button" 
                className={`btn-secondary ${detailTab === 'actionplan' ? 'active' : ''}`}
                style={{ flex: 1, padding: '0.45rem 0.5rem', fontSize: '0.78rem', border: 'none', background: detailTab === 'actionplan' ? 'rgba(79, 70, 229, 0.1)' : 'transparent', color: detailTab === 'actionplan' ? 'var(--accent-primary)' : 'var(--text-secondary)', fontWeight: 700 }}
                onClick={() => setDetailTab('actionplan')}
              >
                <CheckSquare size={13} style={{ marginRight: '3px' }} /> 2. Plan de Acción e Informe
              </button>
              <button 
                type="button" 
                className={`btn-secondary ${detailTab === 'lessons' ? 'active' : ''}`}
                style={{ flex: 1, padding: '0.45rem 0.5rem', fontSize: '0.78rem', border: 'none', background: detailTab === 'lessons' ? 'rgba(16, 185, 129, 0.1)' : 'transparent', color: detailTab === 'lessons' ? 'var(--accent-primary)' : 'var(--text-secondary)', fontWeight: 700 }}
                onClick={() => setDetailTab('lessons')}
              >
                <Award size={13} style={{ marginRight: '3px' }} /> 3. Lección Aprendida
              </button>
            </div>

            {/* TAB CONTENT 1: INFO & INVESTIGATION */}
            {detailTab === 'info' && (
              <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', fontSize: '0.78rem', background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div><strong>Parte Afectada:</strong> {selectedAccident.bodyPart}</div>
                  <div><strong>Hora:</strong> {selectedAccident.time}</div>
                  <div><strong>Proyecto:</strong> {selectedAccident.project || 'No especificado'}</div>
                  <div><strong>Ciudad:</strong> {selectedAccident.city || 'No registrada'}</div>
                  <div><strong>Cargo:</strong> {selectedAccident.cargo || 'No especificado'}</div>
                  <div><strong>Testigos:</strong> {selectedAccident.witnesses || 'Ninguno'}</div>
                  <div style={{ gridColumn: 'span 2', marginTop: '0.25rem', paddingTop: '0.25rem', borderTop: '1px solid var(--border-color)' }}>
                    <strong>Descripción:</strong> {selectedAccident.description}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8rem' }}>Evidencia de Radicado FURAT</label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input 
                      type="file" 
                      id="detail-furat-file-input"
                      style={{ display: 'none' }}
                      onChange={e => {
                        const file = e.target.files[0];
                        if (file) setDetailFuratUrl(file.name);
                      }}
                    />
                    <label htmlFor="detail-furat-file-input" className="btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', margin: 0 }}>
                      <Upload size={14} /> {detailFuratUrl ? 'Cambiar Archivo' : 'Subir FURAT'}
                    </label>
                    {detailFuratUrl && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        📎 {detailFuratUrl}
                      </span>
                    )}
                  </div>
                </div>

                {/* 5 Whys Analysis */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                  <h5 style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.5rem' }}>Metodología de 5 Porqués</h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {detailWhys.map((why, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-primary)', minWidth: '60px' }}>Por qué {idx + 1}:</span>
                        <input 
                          type="text" 
                          className="form-control" 
                          style={{ fontSize: '0.78rem', padding: '0.3rem 0.5rem' }}
                          placeholder={`Causa de nivel {idx + 1}`} 
                          value={why} 
                          onChange={e => {
                            const newWhys = [...detailWhys];
                            newWhys[idx] = e.target.value;
                            setDetailWhys(newWhys);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8rem' }}>Causa Raíz Identificada</label>
                  <textarea 
                    className="form-control" 
                    rows="2" 
                    placeholder="Describa la causa raíz última hallada en la investigación..." 
                    value={detailRootCause}
                    onChange={e => setDetailRootCause(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: ACTION PLAN */}
            {detailTab === 'actionplan' && (
              <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                
                {/* Technical Report File Upload */}
                <div style={{ background: 'rgba(79, 70, 229, 0.03)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.4rem' }}>
                    <FileText size={14} /> Informe Técnico de Investigación de Accidentes
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input 
                      type="file" 
                      id="detail-report-file-input"
                      style={{ display: 'none' }}
                      onChange={e => {
                        const file = e.target.files[0];
                        if (file) setDetailReportUrl(file.name);
                      }}
                    />
                    <label htmlFor="detail-report-file-input" className="btn-secondary" style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', margin: 0 }}>
                      <Upload size={12} /> {detailReportUrl ? 'Cambiar Informe' : 'Subir Informe Técnico'}
                    </label>
                    {detailReportUrl && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        📎 {detailReportUrl}
                      </span>
                    )}
                  </div>
                </div>

                {!selectedAccident.actionPlanId ? (
                  <div style={{ border: '1px dashed var(--border-color)', padding: '2rem 1.5rem', borderRadius: '8px', textAlign: 'center', background: 'var(--bg-secondary)' }}>
                    <AlertTriangle size={36} color="var(--warning)" style={{ margin: '0 auto 0.75rem auto' }} />
                    <h5 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800 }}>Generar Plan de Acción</h5>
                    <p style={{ margin: '0.25rem 0 1.25rem 0', fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                      Cree el plan de acción correctiva para estructurar las tareas preventivas y mitigar reincidencias de este accidente en la planta.
                    </p>
                    <button 
                      type="button" 
                      className="btn-primary" 
                      style={{ margin: '0 auto' }}
                      onClick={() => generateActionPlan(selectedAccident, false)}
                    >
                      <Plus size={14} /> Crear Plan de Acción Correctiva
                    </button>
                  </div>
                ) : (
                  <>
                    {(() => {
                      const plan = actionPlans.find(p => p.id === selectedAccident.actionPlanId);
                      if (!plan) return <p style={{ fontSize: '0.8rem', color: 'var(--danger)' }}>Plan de Acción {selectedAccident.actionPlanId} no encontrado en base de datos.</p>;
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          <div style={{ background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.78rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                              <span><strong>Código de Plan:</strong> {plan.id}</span>
                              <span><strong>Origen:</strong> {plan.source}</span>
                            </div>
                            <div><strong>Acción Inmediata:</strong> {plan.immediateAction}</div>
                            
                            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                              <label style={{ fontSize: '0.75rem', fontWeight: 700, margin: 0 }}>Estado del Plan:</label>
                              <select 
                                className="form-control" 
                                style={{ width: '130px', fontSize: '0.75rem', padding: '0.2rem 0.4rem' }}
                                value={plan.status}
                                onChange={e => {
                                  const updated = actionPlans.map(p => p.id === plan.id ? { ...p, status: e.target.value } : p);
                                  setActionPlans(updated);
                                }}
                              >
                                <option value="Abierta">Abierta</option>
                                <option value="En Ejecución">En Ejecución</option>
                                <option value="Cerrado">Cerrado</option>
                              </select>
                            </div>
                          </div>

                          <h5 style={{ fontSize: '0.82rem', fontWeight: 800, margin: '0.25rem 0 0 0' }}>Tareas Planificadas (Metodología Plan de Acción)</h5>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '180px', overflowY: 'auto' }}>
                            {(!plan.tasks || plan.tasks.length === 0) ? (
                              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: '0.25rem 0' }}>
                                Sin tareas registradas. Registre tareas preventivas abajo.
                              </p>
                            ) : (
                              plan.tasks.map(t => (
                                <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.78rem' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <input 
                                      type="checkbox" 
                                      checked={t.evidence !== null}
                                      onChange={() => {
                                        const updatedTasks = plan.tasks.map(tsk => tsk.id === t.id ? { ...tsk, evidence: tsk.evidence ? null : 'Completado en modulo de accidentes' } : tsk);
                                        const updatedPlans = actionPlans.map(p => p.id === plan.id ? { ...p, tasks: updatedTasks } : p);
                                        setActionPlans(updatedPlans);
                                      }}
                                    />
                                    <div>
                                      <div style={{ textDecoration: t.evidence ? 'line-through' : 'none', fontWeight: 600 }}>{t.action}</div>
                                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Ejecución: {t.execResp} ({t.execDate})</div>
                                    </div>
                                  </div>
                                  <button 
                                    type="button" 
                                    className="btn-icon" 
                                    style={{ color: 'var(--danger)', padding: '0.2rem' }}
                                    onClick={() => {
                                      const updatedTasks = plan.tasks.filter(tsk => tsk.id !== t.id);
                                      const updatedPlans = actionPlans.map(p => p.id === plan.id ? { ...p, tasks: updatedTasks } : p);
                                      setActionPlans(updatedPlans);
                                    }}
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              ))
                            )}
                          </div>

                          {/* Add task to action plan */}
                          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                            <h6 style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.4rem' }}>Agregar Tarea Correctiva/Preventiva</h6>
                            
                            <div className="form-group" style={{ marginBottom: '0.4rem' }}>
                              <input 
                                type="text" 
                                className="form-control" 
                                style={{ fontSize: '0.78rem', padding: '0.35rem 0.5rem' }}
                                placeholder="Describa la tarea a realizar..." 
                                value={newTaskAction}
                                onChange={e => setNewTaskAction(e.target.value)}
                              />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.4rem' }}>
                              <input 
                                type="text" 
                                className="form-control" 
                                style={{ fontSize: '0.78rem', padding: '0.35rem 0.5rem' }}
                                placeholder="Responsable ejecución..." 
                                value={newTaskResp}
                                onChange={e => setNewTaskResp(e.target.value)}
                              />
                              <input 
                                type="date" 
                                className="form-control" 
                                style={{ fontSize: '0.78rem', padding: '0.35rem 0.5rem' }}
                                value={newTaskDate}
                                onChange={e => setNewTaskDate(e.target.value)}
                              />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              <input 
                                type="text" 
                                className="form-control" 
                                style={{ fontSize: '0.78rem', padding: '0.35rem 0.5rem' }}
                                placeholder="Responsable seguimiento..." 
                                value={newTaskFollowResp}
                                onChange={e => setNewTaskFollowResp(e.target.value)}
                              />
                              <input 
                                type="date" 
                                className="form-control" 
                                style={{ fontSize: '0.78rem', padding: '0.35rem 0.5rem' }}
                                value={newTaskFollowDate}
                                onChange={e => setNewTaskFollowDate(e.target.value)}
                              />
                            </div>

                            <button 
                              type="button" 
                              className="btn-primary" 
                              style={{ width: '100%', padding: '0.35rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}
                              onClick={handleAddTaskToPlan}
                            >
                              <PlusCircle size={13} /> Registrar Tarea en Plan de Acción
                            </button>
                          </div>
                        </div>
                      );
                    })()}
                  </>
                )}
              </div>
            )}

            {/* TAB CONTENT 3: LESSONS LEARNED */}
            {detailTab === 'lessons' && (
              <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8rem' }}>Resumen de Lección Aprendida</label>
                  <textarea 
                    className="form-control" 
                    rows="3" 
                    placeholder="Describa el aprendizaje y advertencias de seguridad extraídas del suceso..." 
                    value={detailLessonsSummary}
                    onChange={e => setDetailLessonsSummary(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8rem' }}>Asociar Sesión de Capacitación Existente</label>
                  <select 
                    className="form-control"
                    value={detailLessonsTrainingId || ''}
                    onChange={e => setDetailLessonsTrainingId(e.target.value)}
                  >
                    <option value="">-- Seleccionar capacitación del plan de formación --</option>
                    {trainings.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.topic} ({t.date}) - {t.status}
                      </option>
                    ))}
                  </select>
                </div>

                {detailLessonsTrainingId && (() => {
                  const training = trainings.find(t => String(t.id) === String(detailLessonsTrainingId));
                  if (!training) return null;
                  return (
                    <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.78rem' }}>
                      <strong>Capacitación Vinculada:</strong>
                      <div style={{ marginTop: '0.2rem', color: 'var(--text-secondary)' }}>
                        <div>Tema: {training.topic}</div>
                        <div>Fecha: {training.date} | Expositor: {training.trainer}</div>
                        <div>Estado: <strong>{training.status}</strong></div>
                      </div>
                    </div>
                  );
                })()}

                {/* Create training sub-form */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                  {!isCreatingTraining ? (
                    <button 
                      type="button" 
                      className="btn-secondary" 
                      style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '0.75rem' }}
                      onClick={() => setIsCreatingTraining(true)}
                    >
                      <Plus size={13} /> Agendar Capacitación de Divulgación HSEQ
                    </button>
                  ) : (
                    <div style={{ background: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.78rem' }}>Programar Nueva Capacitación SST</span>
                        <button type="button" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setIsCreatingTraining(false)}>
                          <X size={14} />
                        </button>
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.7rem' }}>Tema de Capacitación</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          style={{ fontSize: '0.75rem', padding: '0.3rem 0.5rem' }}
                          value={`Divulgación Lección Aprendida Accidente - ${selectedAccident.employeeName}`}
                          disabled
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label" style={{ fontSize: '0.7rem' }}>Fecha Programada</label>
                          <input 
                            type="date" 
                            className="form-control" 
                            style={{ fontSize: '0.75rem', padding: '0.3rem 0.5rem' }}
                            value={newTrainingDate}
                            onChange={e => setNewTrainingDate(e.target.value)}
                            required
                          />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label" style={{ fontSize: '0.7rem' }}>Expositor / Facilitador</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            style={{ fontSize: '0.75rem', padding: '0.3rem 0.5rem' }}
                            placeholder="Ej. Coordinador HSEQ"
                            value={newTrainingTrainer}
                            onChange={e => setNewTrainingTrainer(e.target.value)}
                          />
                        </div>
                      </div>

                      <button 
                        type="button" 
                        className="btn-primary" 
                        style={{ padding: '0.35rem', fontSize: '0.75rem', width: '100%', marginTop: '0.25rem' }}
                        onClick={handleCreateLessonsTraining}
                      >
                        Crear e Integrar en Plan de Formación
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Modal actions footer */}
            <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '1rem' }}>
              <button 
                type="button" 
                className="btn-secondary" 
                style={{ flex: 1 }} 
                onClick={() => setIsDetailModalOpen(false)}
              >
                Cerrar
              </button>
              <button 
                type="button" 
                className="btn-primary" 
                style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                onClick={handleSaveDetailChanges}
              >
                <Save size={14} /> Guardar Cambios de Gestión
              </button>
            </div>

          </div>
        )}
      </Modal>
    </>
  );
}
