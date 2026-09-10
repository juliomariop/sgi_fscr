import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, Plus, Calendar, Edit2, Trash2, Download, Filter, Paperclip, 
  Upload, Kanban, Table, CheckCircle, Clock, AlertTriangle, UploadCloud,
  QrCode, ClipboardList, CheckSquare, X, Star, FileText, Smartphone
} from 'lucide-react';
import Modal from '../components/Modal';
import ExportModal from '../components/ExportModal';
import { downloadCSV } from '../utils/exportUtils';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAppUsers } from '../hooks/useAppUsers';
import PublicAttendance from './PublicAttendance';
import PublicEvaluation from './PublicEvaluation';

const DEFAULT_PARAMS = {
  projectTypes: ["Eléctrico", "Telecomunicaciones", "Civil", "Ambiental", "Industrial"],
  clients: ["Consorcio Vial del Norte", "Ecopetrol", "Claro", "Movistar"],
  cities: ["Bogotá", "Medellín", "Cali", "Barranquilla", "Bucaramanga"]
};

export default function Trainings() {
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

  const [trainings, setTrainings] = useLocalStorage('sgi_trainings', [
    { 
      id: 1, 
      category: 'Calidad', 
      topic: 'Actualización ISO 9001:2015', 
      date: '2026-06-15', 
      objective: 'Comprender los requisitos de la norma.', 
      trainer: 'Líder de Calidad', 
      observations: 'Se espera la asistencia de todo el personal líder', 
      attachedFile: null, 
      status: 'Pendiente',
      project: 'Eléctrico',
      city: 'Bogotá',
      client: 'Consorcio Vial del Norte',
      participants: [],
      evaluationConfig: {
        enabled: true,
        passingScorePercent: 80,
        questions: [
          { id: 'q1', text: 'El capacitador demostró dominio del tema evaluado', type: 'rating' },
          { id: 'q2', text: 'El material expuesto fue útil para mis actividades diarias', type: 'rating' },
          { id: 'q3', text: '¿Bajo qué cláusula de la ISO 9001 se exige la Competencia y Formación?', type: 'quiz', options: ['Cláusula 5.3', 'Cláusula 7.2', 'Cláusula 9.1'], correctAnswer: 'Cláusula 7.2' }
        ]
      },
      evaluations: []
    },
    { 
      id: 2, 
      category: 'SST', 
      topic: 'Manejo de Extintores y Prevención', 
      date: '2026-05-10', 
      objective: 'Capacitar en el uso adecuado de equipos contra incendio.', 
      trainer: 'Analista de Operaciones', 
      observations: 'Práctica realizada en el patio principal', 
      attachedFile: 'asistencia_extintores.pdf', 
      status: 'Realizada',
      project: 'Civil',
      city: 'Cali',
      client: 'Ecopetrol',
      participants: [
        { name: 'Juan Pérez', document: '10203040', area: 'Operaciones / Operario', signature: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='40'><text x='10' y='25' style='font: italic bold 16px Hand; fill: %230284c7;'>Juan P.</text></svg>", registeredAt: '2026-05-10 09:15' },
        { name: 'María Gómez', document: '10305070', area: 'Calidad / Inspectora', signature: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='40'><text x='10' y='25' style='font: italic bold 16px Hand; fill: %230284c7;'>M. Gomez</text></svg>", registeredAt: '2026-05-10 09:18' }
      ],
      evaluationConfig: {
        enabled: true,
        passingScorePercent: 80,
        questions: [
          { id: 'q1', text: 'El facilitador resolvió de forma clara las inquietudes planteadas', type: 'rating' },
          { id: 'q2', text: '¿Qué tipo de extintor se utiliza para apagar fuegos Clase C (Eléctricos)?', type: 'quiz', options: ['Extintor de Agua', 'Extintor de CO2 / Multipropósito', 'Extintor de Espuma'], correctAnswer: 'Extintor de CO2 / Multipropósito' }
        ]
      },
      evaluations: [
        { document: '10203040', name: 'Juan Pérez', answers: { q1: 5, q2: 'Extintor de CO2 / Multipropósito' }, score: 100, passed: true, submittedAt: '2026-05-10 10:05' },
        { document: '10305070', name: 'María Gómez', answers: { q1: 4, q2: 'Extintor de Agua' }, score: 0, passed: false, submittedAt: '2026-05-10 10:08' }
      ]
    },
    { 
      id: 3, 
      category: 'Ambiental', 
      topic: 'Sensibilización Ambiental y RESPEL', 
      date: '2026-07-01', 
      objective: 'Reducir el impacto ambiental y segregar adecuadamente los residuos.', 
      trainer: 'Líder de Calidad', 
      observations: '', 
      attachedFile: null, 
      status: 'Pendiente',
      project: 'Industrial',
      city: 'Medellín',
      client: 'Claro',
      participants: [],
      evaluationConfig: { enabled: false, passingScorePercent: 80, questions: [] },
      evaluations: []
    }
  ]);

  const [filter, setFilter] = useState('Todas');
  const [activeView, setActiveView] = useState('kanban'); // kanban, calendar, table

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    category: 'TTHH', topic: '', date: '', objective: '', trainer: '', observations: '', attachedFile: '', status: 'Pendiente',
    project: '', city: '', client: ''
  });

  // QR & Simulator Modals state
  const [activeTraining, setActiveTraining] = useState(null);
  const [isAsistenciaModalOpen, setIsAsistenciaModalOpen] = useState(false);
  const [isEvaluacionModalOpen, setIsEvaluacionModalOpen] = useState(false);
  const [isConfigEvalModalOpen, setIsConfigEvalModalOpen] = useState(false);

  // Simulator Visibility
  const [showAsistenciaSimulator, setShowAsistenciaSimulator] = useState(true);
  const [showEvaluacionSimulator, setShowEvaluacionSimulator] = useState(true);

  // Evaluation Config Form State
  const [evalConfigData, setEvalConfigData] = useState({
    enabled: false,
    passingScorePercent: 80,
    questions: []
  });

  const categoriesList = ['TTHH', 'Ambiental', 'Calidad', 'SST', 'PESV', 'Otra'];
  const categories = ['Todas', ...categoriesList];

  // Normalization logic
  const normalizedTrainings = trainings.map(t => {
    let currentStatus = t.status;
    if (currentStatus === 'Pendiente' && t.date && new Date(t.date + 'T23:59:59') < new Date()) {
      currentStatus = 'Vencida';
    }
    return { 
      ...t, 
      status: currentStatus,
      participants: t.participants || [],
      evaluationConfig: t.evaluationConfig || { enabled: false, passingScorePercent: 80, questions: [] },
      evaluations: t.evaluations || []
    };
  });

  // History and meta for Training / Formation
  const [trainingsHistory, setTrainingsHistory] = useLocalStorage('sgi_trainings_history', [
    { version: '01', date: '2025-01-10', changes: 'Emisión Inicial del Plan HSEQ de Capacitaciones y Formación Continua.' }
  ]);
  const [meta, setMeta] = useLocalStorage('sgi_trainings_meta', {
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
    history: [],
    contentHtml: ''
  });

  const [filterProject, setFilterProject] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterClient, setFilterClient] = useState('');

  const filtered = normalizedTrainings.filter(t => {
    const matchCat = filter === 'Todas' || t.category === filter;
    const matchProject = !filterProject || t.project === filterProject;
    const matchCity = !filterCity || t.city === filterCity;
    const matchClient = !filterClient || t.client === filterClient;
    return matchCat && matchProject && matchCity && matchClient;
  });

  useEffect(() => {
    if (APP_USERS.length > 0 && !formData.trainer) {
      setFormData(prev => ({ ...prev, trainer: APP_USERS[0].name }));
    }
  }, [APP_USERS, formData.trainer]);

  // Dashboard Stats
  const total = normalizedTrainings.length;
  const realizadas = normalizedTrainings.filter(t => t.status === 'Realizada').length;
  const pendientes = total - realizadas;
  const cumplimiento = total > 0 ? Math.round((realizadas / total) * 100) : 0;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, attachedFile: file.name });
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({ ...item });
    } else {
      setEditingItem(null);
      setFormData({ 
        category: 'TTHH', 
        topic: '', 
        date: new Date().toISOString().split('T')[0], 
        objective: '', 
        trainer: APP_USERS[0]?.name || '', 
        observations: '', 
        attachedFile: '', 
        status: 'Pendiente',
        project: '',
        city: '',
        client: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingItem) {
      setTrainings(trainings.map(t => t.id === editingItem.id ? { ...formData, id: t.id } : t));
    } else {
      setTrainings([...trainings, { 
        ...formData, 
        id: Date.now(),
        participants: [],
        evaluationConfig: { enabled: false, passingScorePercent: 80, questions: [] },
        evaluations: []
      }]);
    }
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Está seguro de eliminar esta capacitación?")) {
      setTrainings(trainings.filter(t => t.id !== id));
      if (activeTraining?.id === id) {
        setActiveTraining(null);
      }
    }
  };

  const handleExport = () => {
    const cols = [
      { header: 'Fecha Programada', key: 'date' },
      { header: 'Tema de Capacitación', key: 'topic' },
      { header: 'Categoría', key: 'category' },
      { header: 'Facilitador', key: 'trainer' },
      { header: '¿Se Realizó la Formación?', key: 'wasRealized' },
      { header: 'Asistentes Registrados', key: 'attendanceCount' },
      { header: 'Promedio Asistencia', key: 'attendanceAvg' },
      { header: 'Promedio Calificación', key: 'ratingAvg' },
      { header: 'Evaluaciones Realizadas', key: 'evaluationsCount' },
      { header: 'Observaciones / Cierre', key: 'observations' }
    ];

    const dataToExport = normalizedTrainings.map(t => {
      // Average score of evaluations
      const avgScore = t.evaluations?.length > 0 
        ? (t.evaluations.reduce((sum, ev) => sum + ev.score, 0) / t.evaluations.length).toFixed(1) + '%'
        : 'Sin calificaciones';

      // Attendance average (participants vs APP_USERS roster size)
      const attendeeCount = t.participants?.length || 0;
      const attendanceAverage = APP_USERS.length > 0
        ? ((attendeeCount / APP_USERS.length) * 100).toFixed(1) + '%'
        : '100.0%';

      return {
        date: t.date,
        topic: t.topic,
        category: t.category,
        trainer: t.trainer,
        wasRealized: t.status === 'Realizada' ? 'SÍ' : 'NO',
        attendanceCount: attendeeCount,
        attendanceAvg: attendanceAverage,
        ratingAvg: avgScore,
        evaluationsCount: t.evaluations?.length || 0,
        observations: t.observations || 'Sin observaciones'
      };
    });

    // Dynamic HTML for PDF export
    const reportHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #1e293b;">
        <h3 style="color: #0f172a; border-bottom: 2px solid #16a34a; padding-bottom: 6px; font-size: 16px; margin-top: 10px; font-weight: 700;">
          1. RESUMEN DE CUMPLIMIENTO DEL PLAN DE FORMACIÓN HSEQ
        </h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 20px; text-align: center;">
          <tr>
            <td style="padding: 10px; border: 1px solid #cbd5e1; background: #f8fafc;">
              <span style="font-size: 11px; color: #64748b; font-weight: bold; text-transform: uppercase;">Capacitaciones Programadas</span>
              <div style="font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 4px;">${total}</div>
            </td>
            <td style="padding: 10px; border: 1px solid #cbd5e1; background: #f0fdf4;">
              <span style="font-size: 11px; color: #16a34a; font-weight: bold; text-transform: uppercase;">Capacitaciones Realizadas</span>
              <div style="font-size: 20px; font-weight: 800; color: #16a34a; margin-top: 4px;">${realizadas}</div>
            </td>
            <td style="padding: 10px; border: 1px solid #cbd5e1; background: #eff6ff;">
              <span style="font-size: 11px; color: #2563eb; font-weight: bold; text-transform: uppercase;">Porcentaje de Cumplimiento</span>
              <div style="font-size: 20px; font-weight: 800; color: #2563eb; margin-top: 4px;">${cumplimiento}%</div>
            </td>
          </tr>
        </table>

        <h3 style="color: #0f172a; border-bottom: 2px solid #16a34a; padding-bottom: 6px; font-size: 16px; margin-top: 20px; font-weight: 700;">
          2. DETALLE DEL CRONOGRAMA DE FORMACIÓN
        </h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 11px;">
          <thead>
            <tr style="background: #f1f5f9; text-align: left; border-bottom: 2px solid #cbd5e1;">
              <th style="padding: 6px; border: 1px solid #cbd5e1;">Fecha</th>
              <th style="padding: 6px; border: 1px solid #cbd5e1;">Tema / Capacitación</th>
              <th style="padding: 6px; border: 1px solid #cbd5e1;">Categoría</th>
              <th style="padding: 6px; border: 1px solid #cbd5e1;">Facilitador</th>
              <th style="padding: 6px; border: 1px solid #cbd5e1; text-align: center;">¿Se Realizó?</th>
              <th style="padding: 6px; border: 1px solid #cbd5e1; text-align: right;">Asistentes</th>
              <th style="padding: 6px; border: 1px solid #cbd5e1; text-align: right;">Prom. Asistencia</th>
              <th style="padding: 6px; border: 1px solid #cbd5e1; text-align: right;">Prom. Calificación</th>
              <th style="padding: 6px; border: 1px solid #cbd5e1;">Observaciones</th>
            </tr>
          </thead>
          <tbody>
            ${normalizedTrainings.map(t => {
              const ratingAvg = t.evaluations?.length > 0 
                ? (t.evaluations.reduce((sum, ev) => sum + ev.score, 0) / t.evaluations.length).toFixed(1) + '%'
                : 'N/A';
              const attendeeCount = t.participants?.length || 0;
              const attendanceAverage = APP_USERS.length > 0
                ? ((attendeeCount / APP_USERS.length) * 100).toFixed(1) + '%'
                : '100.0%';
              return `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 6px; border: 1px solid #cbd5e1;">${t.date}</td>
                  <td style="padding: 6px; border: 1px solid #cbd5e1; font-weight: bold;">${t.topic}</td>
                  <td style="padding: 6px; border: 1px solid #cbd5e1;">${t.category}</td>
                  <td style="padding: 6px; border: 1px solid #cbd5e1;">${t.trainer}</td>
                  <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; color: ${t.status === 'Realizada' ? '#16a34a' : '#ef4444'};">${t.status === 'Realizada' ? 'SÍ' : 'NO'}</td>
                  <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: right;">${attendeeCount}</td>
                  <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: right; font-weight: bold;">${attendanceAverage}</td>
                  <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: right; font-weight: bold; color: #0284c7;">${ratingAvg}</td>
                  <td style="padding: 6px; border: 1px solid #cbd5e1;">${t.observations || 'Sin observaciones'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;

    setExportConfig({
      isOpen: true,
      exportType: 'excel',
      title: 'Plan Anual de Capacitación y Formación Continua',
      code: 'THH-PLAN-CAP-001',
      version: `0${meta.version}`,
      validity: meta.validity,
      columns: cols,
      data: dataToExport,
      history: trainingsHistory,
      contentHtml: reportHtml
    });
  };

  // Export Attendance CSV
  const handleExportAttendance = (training) => {
    if (!training.participants || training.participants.length === 0) {
      alert("No hay asistentes registrados para exportar.");
      return;
    }
    const data = training.participants.map(p => ({
      Nombre: p.name,
      Documento: p.document,
      Area: p.area,
      FechaRegistro: p.registeredAt
    }));
    downloadCSV(data, `Asistencia_${training.topic.replace(/ /g, "_")}`);
  };

  // Export Evaluations CSV
  const handleExportEvaluations = (training) => {
    if (!training.evaluations || training.evaluations.length === 0) {
      alert("No hay evaluaciones registradas para exportar.");
      return;
    }
    const data = training.evaluations.map(e => ({
      Nombre: e.name,
      Documento: e.document,
      Score: `${e.score}%`,
      Resultado: e.passed ? 'APROBADO' : 'REPROBADO',
      FechaEnvio: e.submittedAt
    }));
    downloadCSV(data, `Evaluaciones_${training.topic.replace(/ /g, "_")}`);
  };

  // Open QR Asistencia Dialog
  const handleOpenAsistenciaQR = (training) => {
    setActiveTraining(training);
    setIsAsistenciaModalOpen(true);
  };

  // Open QR Evaluacion Dialog
  const handleOpenEvaluacionQR = (training) => {
    setActiveTraining(training);
    setIsEvaluacionModalOpen(true);
  };

  // Open Config Evaluation Dialog
  const handleOpenConfigEval = (training) => {
    setActiveTraining(training);
    setEvalConfigData({
      enabled: training.evaluationConfig?.enabled || false,
      passingScorePercent: training.evaluationConfig?.passingScorePercent || 80,
      questions: training.evaluationConfig?.questions || []
    });
    setIsConfigEvalModalOpen(true);
  };

  // Save Evaluation Configuration
  const handleSaveEvalConfig = (e) => {
    e.preventDefault();
    setTrainings(trainings.map(t => {
      if (t.id === activeTraining.id) {
        return { ...t, evaluationConfig: evalConfigData };
      }
      return t;
    }));
    setIsConfigEvalModalOpen(false);
    alert("Configuración de evaluación guardada con éxito.");
  };

  // Add Question to Builder
  const handleAddQuestion = () => {
    const newQ = {
      id: `q-${Date.now()}`,
      text: '',
      type: 'rating',
      options: ['', '', ''],
      correctAnswer: ''
    };
    setEvalConfigData({
      ...evalConfigData,
      questions: [...evalConfigData.questions, newQ]
    });
  };

  // Remove Question from Builder
  const handleRemoveQuestion = (qId) => {
    setEvalConfigData({
      ...evalConfigData,
      questions: evalConfigData.questions.filter(q => q.id !== qId)
    });
  };

  const handleUpdateQuestion = (qId, field, val) => {
    setEvalConfigData({
      ...evalConfigData,
      questions: evalConfigData.questions.map(q => {
        if (q.id === qId) {
          return { ...q, [field]: val };
        }
        return q;
      })
    });
  };

  // Pre-populate Standard HSEQ Template
  const handleLoadStandardTemplate = () => {
    setEvalConfigData({
      enabled: true,
      passingScorePercent: 80,
      questions: [
        { id: 'q1', text: 'El capacitador demostró dominio del tema evaluado', type: 'rating' },
        { id: 'q2', text: 'El material expuesto fue útil para mis actividades diarias', type: 'rating' },
        { id: 'q3', text: '¿Cuál es el objetivo principal de este tema de capacitación?', type: 'quiz', options: ['Cumplir con un requisito obligatorio', 'Adquirir competencias y prevenir riesgos en el proceso', 'Evitar sanciones y multas operativas'], correctAnswer: 'Adquirir competencias y prevenir riesgos en el proceso' }
      ]
    });
  };

  // Handle participant added in simulator
  const handleParticipantAdded = (participant) => {
    setTrainings(prev => prev.map(t => {
      if (t.id === activeTraining.id) {
        const list = t.participants || [];
        if (list.some(p => p.document === participant.document)) return t;
        const updated = { ...t, participants: [...list, participant] };
        // Sync active training so modal updates live
        setActiveTraining(updated);
        return updated;
      }
      return t;
    }));
  };

  // Handle evaluation submitted in simulator
  const handleEvaluationSubmitted = (newEval) => {
    setTrainings(prev => prev.map(t => {
      if (t.id === activeTraining.id) {
        const list = t.evaluations || [];
        if (list.some(e => e.document === newEval.document)) return t;
        const updated = { ...t, evaluations: [...list, newEval] };
        // Sync active training so modal updates live
        setActiveTraining(updated);
        return updated;
      }
      return t;
    }));
  };

  const monthsNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const kanbanColumns = [
    { id: 'Pendiente', title: 'Pendientes / Programadas', color: 'var(--warning)', bg: 'rgba(245, 158, 11, 0.03)' },
    { id: 'Realizada', title: 'Realizadas / Ejecutadas', color: 'var(--success)', bg: 'rgba(16, 185, 129, 0.03)' },
    { id: 'Vencida', title: 'Vencidas / Fuera de Plazo', color: 'var(--danger)', bg: 'rgba(239, 68, 68, 0.03)' },
    { id: 'Cancelada', title: 'Canceladas / Suspendidas', color: 'var(--text-secondary)', bg: 'rgba(148, 163, 184, 0.03)' }
  ];

  return (
    <>
      <style>{`
        .kanban-board {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .kanban-col {
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-color);
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          min-height: 420px;
        }
        .kanban-col-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid var(--border-color);
          padding-bottom: 0.4rem;
        }
        .kanban-col-title {
          font-weight: 700;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }
        .kanban-cards-container {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
          overflow-y: auto;
          flex: 1;
        }
        .maint-card {
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 0.75rem;
          box-shadow: var(--shadow-sm);
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }
        .maint-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
          border-color: var(--accent-primary);
        }
        .maint-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .maint-card-title {
          font-weight: 700;
          font-size: 0.82rem;
          color: var(--text-primary);
          line-height: 1.3;
        }
        .maint-card-meta {
          font-size: 0.7rem;
          color: var(--text-secondary);
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }
        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
          gap: 0.85rem;
          margin-bottom: 2rem;
        }
        .calendar-month-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 0.75rem;
          display: flex;
          flex-direction: column;
          min-height: 140px;
        }
        .calendar-month-title {
          font-weight: 700;
          font-size: 0.8rem;
          color: var(--text-secondary);
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.3rem;
          margin-bottom: 0.4rem;
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }
        .calendar-task-item {
          font-size: 0.72rem;
          padding: 0.2rem 0.35rem;
          border-radius: 4px;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          margin-bottom: 0.3rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          transition: background-color 0.15s;
        }
        .calendar-task-item:hover {
          background-color: var(--bg-tertiary);
          border-color: var(--accent-primary);
        }
        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        /* Phone Simulator Styling */
        .phone-simulator {
          width: 100%;
          max-width: 320px;
          height: 480px;
          margin: 0 auto;
          border: 10px solid #1e293b;
          border-radius: 30px;
          box-shadow: var(--shadow-lg);
          overflow-y: auto;
          background: var(--bg-primary);
          position: relative;
        }
        .phone-simulator::-webkit-scrollbar {
          width: 4px;
        }
        .phone-simulator::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 2px;
        }

        .action-btn-group {
          display: flex;
          gap: 0.3rem;
          margin-top: 0.25rem;
          border-top: 1px solid var(--border-color);
          padding-top: 0.4rem;
        }
        .action-card-btn {
          flex: 1;
          padding: 0.3rem;
          font-size: 0.68rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 3px;
          border-radius: 4px;
          cursor: pointer;
          border: 1px solid var(--border-color);
          background: var(--bg-secondary);
          color: var(--text-secondary);
          transition: all 0.2s;
        }
        .action-card-btn:hover {
          background: var(--bg-tertiary);
          color: var(--text-primary);
          border-color: var(--accent-primary);
        }
      `}</style>

      {/* Page Header */}
      <div style={{display:'flex', justifyContent:'space-between', marginBottom:'1.5rem', alignItems:'center', flexWrap:'wrap', gap:'1rem'}}>
        <div>
          <p style={{color:'var(--text-secondary)', marginBottom:'0.25rem'}}>Plan de Formación y Toma de Conciencia (ISO 9001, 14001, 45001)</p>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>Plan de Formación</h2>
        </div>
        <div style={{display:'flex', gap:'0.5rem', flexWrap:'wrap'}}>
          <button className="btn-secondary" onClick={handleExport}><Download size={16}/> Exportar Plan</button>
          <button className="btn-primary" onClick={() => handleOpenModal()}><Plus size={16}/> Programar Formación</button>
        </div>
      </div>

      {/* KPI Cards Panel */}
      <div className="grid-3" style={{marginBottom:'1.5rem'}}>
        <div className="card" style={{marginBottom:0, borderLeft:'4px solid var(--accent-primary)', padding:'1.25rem'}}>
          <div style={{fontSize:'0.8rem', color:'var(--text-secondary)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.5rem'}}>Total Programadas</div>
          <div style={{fontSize:'2rem', fontWeight:700}}>{total}</div>
        </div>
        <div className="card" style={{marginBottom:0, borderLeft:'4px solid var(--success)', padding:'1.25rem'}}>
          <div style={{fontSize:'0.8rem', color:'var(--text-secondary)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.5rem'}}>Cumplimiento del Plan</div>
          <div style={{fontSize:'2rem', fontWeight:700, color:'var(--success)'}}>{cumplimiento}%</div>
          <div className="progress-bar" style={{marginTop:'0.5rem'}}>
            <div className="progress-fill" style={{width:`${cumplimiento}%`, background:'var(--success)'}}></div>
          </div>
        </div>
        <div className="card" style={{marginBottom:0, borderLeft:'4px solid var(--warning)', padding:'1.25rem'}}>
          <div style={{fontSize:'0.8rem', color:'var(--text-secondary)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.5rem'}}>Pendientes / Realizadas</div>
          <div style={{fontSize:'1.5rem', fontWeight:700}}><span style={{color:'var(--warning)'}}>{pendientes}</span> / <span style={{color:'var(--success)'}}>{realizadas}</span></div>
        </div>
      </div>

      {/* Main Tab View Switcher & Search filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className={`btn-secondary ${activeView === 'kanban' ? 'active' : ''}`}
            style={{ border: 'none', background: activeView === 'kanban' ? 'rgba(14, 165, 233, 0.1)' : 'transparent', color: activeView === 'kanban' ? 'var(--accent-primary)' : 'var(--text-secondary)', fontWeight: 600 }}
            onClick={() => setActiveView('kanban')}
          >
            <Kanban size={14} style={{ marginRight: '4px' }} /> Tablero Kanban
          </button>
          <button 
            className={`btn-secondary ${activeView === 'calendar' ? 'active' : ''}`}
            style={{ border: 'none', background: activeView === 'calendar' ? 'rgba(245, 158, 11, 0.1)' : 'transparent', color: activeView === 'calendar' ? 'var(--warning)' : 'var(--text-secondary)', fontWeight: 600 }}
            onClick={() => setActiveView('calendar')}
          >
            <Calendar size={14} style={{ marginRight: '4px' }} /> Cronograma Anual
          </button>
          <button 
            className={`btn-secondary ${activeView === 'table' ? 'active' : ''}`}
            style={{ border: 'none', background: activeView === 'table' ? 'rgba(16, 185, 129, 0.1)' : 'transparent', color: activeView === 'table' ? 'var(--success)' : 'var(--text-secondary)', fontWeight: 600 }}
            onClick={() => setActiveView('table')}
          >
            <Table size={14} style={{ marginRight: '4px' }} /> Historial (Tabla)
          </button>
        </div>
      </div>

      {/* Filter by Category */}
      <div className="card" style={{marginBottom:'1.5rem', padding:'0.75rem 1.5rem'}}>
        <div style={{display:'flex', alignItems:'center', gap:'0.75rem', flexWrap:'wrap', marginBottom: '0.75rem'}}>
          <span style={{fontSize:'0.85rem', fontWeight:600, color:'var(--text-secondary)'}}><Filter size={14} style={{verticalAlign:'middle', marginRight:'4px'}}/> Filtrar Categoría:</span>
          {categories.map(c => (
            <button 
              key={c} 
              onClick={() => setFilter(c)} 
              style={{
                padding:'0.35rem 0.75rem', borderRadius:'9999px', fontSize:'0.8rem', fontWeight:600, 
                border:`2px solid ${c === filter ? 'var(--accent-primary)' : 'var(--border-color)'}`, 
                background: c === filter ? 'var(--accent-primary)' : 'var(--bg-secondary)', 
                color: c === filter ? 'white' : 'var(--text-secondary)', 
                cursor:'pointer', transition:'all 0.2s'
              }}
            >
              {c}
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

      {/* KANBAN BOARD VIEW */}
      {activeView === 'kanban' && (
        <div className="kanban-board fade-in">
          {kanbanColumns.map(col => {
            const tasksInCol = filtered.filter(t => t.status === col.id);
            return (
              <div key={col.id} className="kanban-col" style={{ borderTop: `4px solid ${col.color}`, background: col.bg }}>
                
                <div className="kanban-col-header">
                  <span className="kanban-col-title" style={{ color: col.color }}>
                    {col.id === 'Pendiente' && <Clock size={14} />}
                    {col.id === 'Realizada' && <CheckCircle size={14} />}
                    {col.id === 'Vencida' && <AlertTriangle size={14} />}
                    {col.id === 'Cancelada' && <BookOpen size={14} />}
                    {col.title}
                  </span>
                  <span className="badge" style={{ background: col.color, color: col.id === 'Pendiente' ? 'black' : 'white', fontSize: '0.7rem', padding: '0.15rem 0.35rem' }}>
                    {tasksInCol.length}
                  </span>
                </div>

                <div className="kanban-cards-container">
                  {tasksInCol.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem 1rem', border: '1px dashed var(--border-color)', borderRadius: '6px', fontSize: '0.78rem', color: 'var(--text-muted)', margin: 'auto 0' }}>
                      Sin capacitaciones
                    </div>
                  ) : (
                    tasksInCol.map(t => (
                      <div key={t.id} className="maint-card">
                        <div className="maint-card-header">
                          <span className="badge" style={{ fontSize: '0.62rem', padding: '0.1rem 0.3rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                            {t.category}
                          </span>
                          <div style={{ display: 'flex', gap: '2px' }}>
                            <button className="btn-icon" style={{ padding: '0.15rem' }} onClick={() => handleOpenModal(t)} title="Editar"><Edit2 size={11} /></button>
                            <button className="btn-icon" style={{ padding: '0.15rem', color: 'var(--danger)' }} onClick={() => handleDelete(t.id)} title="Eliminar"><Trash2 size={11} /></button>
                          </div>
                        </div>
                        <div className="maint-card-title">{t.topic}</div>
                        
                        <div className="maint-card-meta">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={11} style={{ color: 'var(--text-muted)' }} />
                            <span>Fecha: <strong>{t.date}</strong></span>
                          </div>
                          <div>
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Facilitador: <strong>{t.trainer}</strong></span>
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                            <span>👥 {t.participants?.length || 0} Asis.</span>
                            {t.evaluationConfig?.enabled && (
                              <span>📝 {t.evaluations?.length || 0} Eval.</span>
                            )}
                          </div>
                        </div>

                        {t.attachedFile && (
                          <div 
                            style={{ 
                              fontSize: '0.72rem', 
                              color: 'var(--info)', 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '0.2rem', 
                              background: 'var(--bg-secondary)', 
                              padding: '0.25rem 0.45rem', 
                              borderRadius: '4px', 
                              border: '1px solid var(--border-color)',
                              cursor: 'pointer',
                              marginTop: '0.15rem'
                            }}
                            onClick={() => alert('Descargando lista de asistencia: ' + t.attachedFile)}
                            title="Descargar evidencia subida"
                          >
                            <Paperclip size={11} />
                            <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', flex: 1 }}>{t.attachedFile}</span>
                          </div>
                        )}

                        {/* QR and Evaluation Action Bar */}
                        <div className="action-btn-group">
                          <button className="action-card-btn" onClick={() => handleOpenAsistenciaQR(t)} title="Generar QR de Asistencia">
                            <QrCode size={12} style={{ color: 'var(--accent-primary)' }} /> Asistencia QR
                          </button>
                          <button className="action-card-btn" onClick={() => handleOpenConfigEval(t)} title="Configurar Test de Evaluación">
                            <CheckSquare size={12} style={{ color: 'var(--text-muted)' }} /> Eval Config
                          </button>
                          {t.evaluationConfig?.enabled && (
                            <button className="action-card-btn" onClick={() => handleOpenEvaluacionQR(t)} title="Generar QR de Evaluación">
                              <ClipboardList size={12} style={{ color: 'var(--success)' }} /> Eval QR
                            </button>
                          )}
                        </div>

                        {/* Fast execute action */}
                        {t.status !== 'Realizada' && t.status !== 'Cancelada' && (
                          <button 
                            type="button" 
                            className="btn-primary" 
                            style={{ width: '100%', fontSize: '0.72rem', padding: '0.25rem 0.45rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}
                            onClick={() => {
                              setEditingItem(t);
                              setFormData({
                                ...t,
                                status: 'Realizada',
                                date: t.date || new Date().toISOString().split('T')[0]
                              });
                              setIsModalOpen(true);
                            }}
                          >
                            <CheckCircle size={11} /> Registrar Ejecución
                          </button>
                        )}

                      </div>
                    ))
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* MONTHLY PROGRAM TIMELINE GRID */}
      {activeView === 'calendar' && (
        <div className="calendar-grid fade-in">
          {monthsNames.map((monthName, idx) => {
            const tasksInMonth = filtered.filter(t => {
              if (!t.date) return false;
              const monthVal = parseInt(t.date.split('-')[1]) - 1;
              return monthVal === idx;
            });

            return (
              <div key={monthName} className="calendar-month-card">
                <div className="calendar-month-title">{monthName}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', overflowY: 'auto', flex: 1 }}>
                  {tasksInMonth.length === 0 ? (
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: 'auto' }}>Sin planificar</span>
                  ) : (
                    tasksInMonth.map(t => {
                      let dotColor = 'var(--warning)';
                      if (t.status === 'Realizada') dotColor = 'var(--success)';
                      else if (t.status === 'Vencida') dotColor = 'var(--danger)';
                      else if (t.status === 'Cancelada') dotColor = 'var(--text-muted)';
                      
                      return (
                        <div 
                          key={t.id} 
                          className="calendar-task-item"
                          onClick={() => handleOpenModal(t)}
                          title={`Ver detalle: ${t.topic} (${t.status})`}
                        >
                          <span className="status-dot" style={{ background: dotColor }} />
                          <span style={{ fontWeight: 600, fontSize: '0.7rem' }}>
                            Día {parseInt(t.date.split('-')[2]) || '?'}:
                          </span>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                            {t.topic}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DETAILED TABLE LIST */}
      {activeView === 'table' && (
        <div className="card fade-in" style={{padding:0, overflow:'hidden'}}>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th>Proyecto / Ubicación / Cliente</th>
                  <th>Tema / Capacitación</th>
                  <th>Fecha</th>
                  <th>Objetivo</th>
                  <th>Capacitador</th>
                  <th>Estado</th>
                  <th>Asist. / Eval.</th>
                  <th>Acciones QR y Test</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan="10" style={{textAlign:'center', padding:'2rem'}}>No hay capacitaciones planificadas.</td></tr>
                ) : filtered.map(t => {
                  let badgeClass = 'badge-info';
                  if (t.status === 'Realizada') badgeClass = 'badge-success';
                  else if (t.status === 'Vencida') badgeClass = 'badge-danger';
                  else if (t.status === 'Pendiente') badgeClass = 'badge-warning';
                  else if (t.status === 'Cancelada') badgeClass = 'badge-secondary';

                  return (
                    <tr key={t.id}>
                      <td><span className="badge" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>{t.category}</span></td>
                      <td>
                        {t.project && <div style={{fontSize:'0.78rem', color:'var(--accent-primary)', fontWeight:600}}>Proy: {t.project}</div>}
                        {t.city && <div style={{fontSize:'0.75rem', color:'var(--text-muted)'}}>Ciudad: {t.city}</div>}
                        {t.client && <div style={{fontSize:'0.75rem', color:'var(--success)'}}>Cliente: {t.client}</div>}
                        {!t.project && !t.city && !t.client && <span style={{color:'var(--text-muted)', fontSize:'0.8rem'}}>-</span>}
                      </td>
                      <td><strong>{t.topic}</strong></td>
                      <td><Calendar size={14} style={{verticalAlign:'middle', marginRight:'4px'}}/> {t.date}</td>
                      <td style={{fontSize:'0.85rem', maxWidth:'180px'}}>{t.objective}</td>
                      <td style={{ fontWeight: 600 }}>{t.trainer}</td>
                      <td><span className={`badge ${badgeClass}`}>{t.status}</span></td>
                      <td>
                        <div style={{fontSize:'0.8rem', display:'flex', flexDirection:'column', gap:'1px'}}>
                          <span>👥 {t.participants?.length || 0} asistencias</span>
                          {t.evaluationConfig?.enabled && (
                            <span style={{color:'var(--success)'}}>📝 {t.evaluations?.length || 0} evaluaciones</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div style={{display:'flex', gap:'0.25rem'}}>
                          <button className="btn-secondary" style={{padding:'0.25rem 0.5rem', fontSize:'0.72rem', display:'inline-flex', alignItems:'center', gap:'3px'}} onClick={() => handleOpenAsistenciaQR(t)} title="Código QR de Asistencia">
                            <QrCode size={12}/> QR Asist.
                          </button>
                          <button className="btn-secondary" style={{padding:'0.25rem 0.5rem', fontSize:'0.72rem', display:'inline-flex', alignItems:'center', gap:'3px'}} onClick={() => handleOpenConfigEval(t)} title="Configurar Evaluación">
                            <CheckSquare size={12}/> Config.
                          </button>
                          {t.evaluationConfig?.enabled && (
                            <button className="btn-secondary" style={{padding:'0.25rem 0.5rem', fontSize:'0.72rem', display:'inline-flex', alignItems:'center', gap:'3px', background:'rgba(16, 185, 129, 0.05)', color:'var(--success)', borderColor:'rgba(16,185,129,0.2)'}} onClick={() => handleOpenEvaluacionQR(t)} title="Código QR de Evaluación">
                              <ClipboardList size={12}/> QR Eval.
                            </button>
                          )}
                        </div>
                      </td>
                      <td>
                        <div style={{display:'flex', gap:'0.25rem'}}>
                          <button className="btn-icon" style={{padding:'0.25rem', color:'var(--text-muted)'}} onClick={() => handleOpenModal(t)}><Edit2 size={14}/></button>
                          <button className="btn-icon" style={{padding:'0.25rem', color:'var(--danger)'}} onClick={() => handleDelete(t.id)}><Trash2 size={14}/></button>
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

      {/* REGISTRATION & SCHEDULING MODAL */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingItem ? "Editar Formación" : "Programar Formación"}
      >
        <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
          
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

          <div style={{display:'flex', gap:'1rem'}}>
            <div className="form-group" style={{flex:1}}>
              <label className="form-label">Categoría</label>
              <select className="form-control" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required>
                {categoriesList.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group" style={{flex:2}}>
              <label className="form-label">Tema / Nombre de la Capacitación</label>
              <input type="text" className="form-control" value={formData.topic} onChange={e => setFormData({...formData, topic: e.target.value})} required placeholder="Ej. Inducción de Seguridad en Oficina..." />
            </div>
          </div>
          <div style={{display:'flex', gap:'1rem'}}>
            <div className="form-group" style={{flex:1}}>
              <label className="form-label">Fecha Programada</label>
              <input type="date" className="form-control" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
            </div>
            <div className="form-group" style={{flex:2}}>
              <label className="form-label">Facilitador / Expositor</label>
              <select className="form-control" value={formData.trainer} onChange={e => setFormData({...formData, trainer: e.target.value})} required>
                <option value="">Seleccione Usuario...</option>
                {APP_USERS.map(u => <option key={u.email} value={u.name}>{u.name}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Objetivo de la Formación</label>
            <textarea className="form-control" value={formData.objective} onChange={e => setFormData({...formData, objective: e.target.value})} rows="2" required placeholder="Describa el objetivo de aprendizaje de la capacitación..."></textarea>
          </div>
          
          <div style={{borderTop:'1px solid var(--border-color)', paddingTop:'1rem', marginTop:'0.5rem'}}>
            <h4 style={{fontSize:'0.9rem', marginBottom:'0.75rem', fontWeight: 700, color: 'var(--accent-primary)'}}>Ejecución y Cierre</h4>
            
            <div className="form-group">
              <label className="form-label">Estado de Cierre</label>
              <select className="form-control" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} required>
                <option value="Pendiente">Pendiente</option>
                <option value="Realizada">Realizada</option>
                <option value="Vencida">Vencida</option>
                <option value="Cancelada">Cancelada</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Observaciones y Hallazgos de Ejecución</label>
              <textarea className="form-control" value={formData.observations} onChange={e => setFormData({...formData, observations: e.target.value})} rows="2" placeholder="Describa cómo se desarrolló, nivel de participación, novedades o compromisos..."></textarea>
            </div>
            
            <div className="form-group">
              <label className="form-label">Subir Lista de Asistencia / Acta de Capacitación</label>
              <div style={{display:'flex', alignItems:'center', gap:'0.5rem', background:'var(--bg-secondary)', padding:'0.75rem', borderRadius:'var(--radius-md)', border:'1px dashed var(--border-color)', justifyContent: 'center', cursor: 'pointer'}} onClick={() => document.getElementById('file-upload-train').click()}>
                <input 
                  type="file" 
                  id="file-upload-train" 
                  style={{display:'none'}} 
                  accept=".doc,.docx,.xls,.xlsx,.ppt,.pptx,.pdf,image/*"
                  onChange={handleFileChange}
                />
                <UploadCloud size={20} style={{ color: 'var(--text-muted)' }} />
                <span style={{fontSize:'0.78rem', color: formData.attachedFile ? 'var(--success)' : 'var(--text-secondary)', fontWeight: 600}}>
                  {formData.attachedFile ? `✓ ${formData.attachedFile}` : 'Seleccione archivo de soporte de asistencia'}
                </span>
              </div>
            </div>
          </div>

          <div style={{display:'flex', justifyContent:'flex-end', gap:'0.5rem', marginTop:'1rem'}}>
            <button type="button" className="btn-secondary" onClick={handleCloseModal}>Cancelar</button>
            <button type="submit" className="btn-primary">{editingItem ? "Actualizar" : "Guardar"}</button>
          </div>
        </form>
      </Modal>

      {/* 1. ASISTENCIA QR MODAL WITH SMARTPHONE SIMULATOR */}
      {isAsistenciaModalOpen && activeTraining && (
        <div className="modal-overlay active">
          <div className="modal-content" style={{ maxWidth: '850px', width: '95%' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <QrCode size={20} style={{ color: 'var(--accent-primary)' }} />
                <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Registro de Asistencia por Código QR</h2>
              </div>
              <button className="btn-icon" onClick={() => setIsAsistenciaModalOpen(false)}><X size={20}/></button>
            </div>
            
            <div className="modal-body" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
              <div style={{ background: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: '6px', border: '1px solid var(--border-color)', marginBottom: '1rem' }}>
                <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', fontWeight: 700 }}>{activeTraining.topic}</h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Facilitador: <strong>{activeTraining.trainer}</strong> | Fecha: <strong>{activeTraining.date}</strong>
                </span>
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'stretch' }}>
                {/* Left block: QR Code and URL */}
                <div style={{ flex: 1, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', justifyContent: 'center', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-primary)' }}>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', textAlign: 'center', margin: 0 }}>
                    Los participantes deben escanear este código QR con sus cámaras móviles para ingresar a la firma digital:
                  </p>
                  
                  {/* Public QR Code API Call */}
                  <div style={{ border: '4px solid white', borderRadius: '8px', boxShadow: 'var(--shadow-md)', display: 'inline-block', padding: '0.5rem', background: 'white' }}>
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`${window.location.origin}/asistencia-publica/${activeTraining.id}`)}`}
                      alt="Código QR de Asistencia" 
                      style={{ width: '180px', height: '180px', display: 'block' }}
                    />
                  </div>

                  <a 
                    href={`${window.location.origin}/asistencia-publica/${activeTraining.id}`} 
                    target="_blank" 
                    rel="noreferrer"
                    style={{ fontSize: '0.78rem', color: 'var(--accent-primary)', textDecoration: 'underline', wordBreak: 'break-all', textAlign: 'center' }}
                  >
                    Abrir enlace en pestaña nueva ↗
                  </a>

                  <button 
                    type="button" 
                    className="btn-secondary" 
                    style={{ fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    onClick={() => setShowAsistenciaSimulator(!showAsistenciaSimulator)}
                  >
                    <Smartphone size={13} /> {showAsistenciaSimulator ? 'Ocultar Simulador Celular' : 'Ver Simulador Celular'}
                  </button>
                </div>

                {/* Right block: Simulator Phone */}
                {showAsistenciaSimulator && (
                  <div style={{ flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-secondary)', padding: '1rem' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Smartphone size={13} /> Simulador de Escaneo de Celular (Demo)
                    </div>
                    
                    <div className="phone-simulator">
                      <PublicAttendance 
                        isSimulator={true} 
                        simulatorTrainingId={activeTraining.id} 
                        onParticipantAdded={handleParticipantAdded} 
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Real-time Registered Participants List */}
              <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>
                    Participantes Registrados en Tiempo Real ({activeTraining.participants?.length || 0})
                  </h4>
                  {activeTraining.participants?.length > 0 && (
                    <button 
                      type="button" 
                      className="btn-secondary" 
                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '2px' }}
                      onClick={() => handleExportAttendance(activeTraining)}
                    >
                      <Download size={11} /> Exportar Asistencia (CSV)
                    </button>
                  )}
                </div>

                <div className="table-responsive" style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                  <table className="table" style={{ fontSize: '0.78rem' }}>
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Documento</th>
                        <th>Área / Cargo</th>
                        <th>Fecha Registro</th>
                        <th>Firma Registrada</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(!activeTraining.participants || activeTraining.participants.length === 0) ? (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                            Esperando firmas... Los participantes aparecerán aquí inmediatamente al escanear el QR o usar el simulador.
                          </td>
                        </tr>
                      ) : (
                        activeTraining.participants.map((p, idx) => (
                          <tr key={idx} className="fade-in">
                            <td><strong>{p.name}</strong></td>
                            <td>{p.document}</td>
                            <td>{p.area}</td>
                            <td>{p.registeredAt}</td>
                            <td>
                              {p.signature ? (
                                <div style={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '2px', display: 'inline-block' }}>
                                  <img src={p.signature} alt="Firma" style={{ maxHeight: '24px', display: 'block' }} />
                                </div>
                              ) : (
                                <span style={{ color: 'var(--text-muted)' }}>Sin Firma</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', padding: '0.75rem 1.25rem' }}>
              <button type="button" className="btn-secondary" onClick={() => setIsAsistenciaModalOpen(false)}>Cerrar Panel de Control</button>
            </div>
          </div>
        </div>
      )}

      {/* 2. EVALUACION QR MODAL WITH SMARTPHONE SIMULATOR */}
      {isEvaluacionModalOpen && activeTraining && (
        <div className="modal-overlay active">
          <div className="modal-content" style={{ maxWidth: '850px', width: '95%' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ClipboardList size={20} style={{ color: 'var(--success)' }} />
                <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Evaluación de la Formación por Código QR</h2>
              </div>
              <button className="btn-icon" onClick={() => setIsEvaluacionModalOpen(false)}><X size={20}/></button>
            </div>
            
            <div className="modal-body" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
              <div style={{ background: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: '6px', border: '1px solid var(--border-color)', marginBottom: '1rem' }}>
                <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', fontWeight: 700 }}>{activeTraining.topic}</h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Aprobar con: <strong>{activeTraining.evaluationConfig?.passingScorePercent || 80}% mínimo</strong> | Preguntas: <strong>{activeTraining.evaluationConfig?.questions?.length || 0}</strong>
                </span>
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'stretch' }}>
                {/* Left Block: QR and Links */}
                <div style={{ flex: 1, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', justifyContent: 'center', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-primary)' }}>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', textAlign: 'center', margin: 0 }}>
                    Los participantes deben escanear este código QR para responder la evaluación de conocimientos y desempeño:
                  </p>
                  
                  {/* Public QR Code API Call */}
                  <div style={{ border: '4px solid white', borderRadius: '8px', boxShadow: 'var(--shadow-md)', display: 'inline-block', padding: '0.5rem', background: 'white' }}>
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`${window.location.origin}/evaluacion-publica/${activeTraining.id}`)}`}
                      alt="Código QR de Evaluación" 
                      style={{ width: '180px', height: '180px', display: 'block' }}
                    />
                  </div>

                  <a 
                    href={`${window.location.origin}/evaluacion-publica/${activeTraining.id}`} 
                    target="_blank" 
                    rel="noreferrer"
                    style={{ fontSize: '0.78rem', color: 'var(--success)', textDecoration: 'underline', wordBreak: 'break-all', textAlign: 'center' }}
                  >
                    Abrir enlace en pestaña nueva ↗
                  </a>

                  <button 
                    type="button" 
                    className="btn-secondary" 
                    style={{ fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    onClick={() => setShowEvaluacionSimulator(!showEvaluacionSimulator)}
                  >
                    <Smartphone size={13} /> {showEvaluacionSimulator ? 'Ocultar Simulador Celular' : 'Ver Simulador Celular'}
                  </button>
                </div>

                {/* Right Block: Simulator */}
                {showEvaluacionSimulator && (
                  <div style={{ flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-secondary)', padding: '1rem' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Smartphone size={13} /> Simulador de Evaluación en Celular
                    </div>
                    
                    <div className="phone-simulator">
                      <PublicEvaluation 
                        isSimulator={true} 
                        simulatorTrainingId={activeTraining.id} 
                        onEvaluationSubmitted={handleEvaluationSubmitted} 
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Real-time Registered Evaluation Submissions */}
              <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>
                    Resultados y Calificaciones Recibidas ({activeTraining.evaluations?.length || 0})
                  </h4>
                  {activeTraining.evaluations?.length > 0 && (
                    <button 
                      type="button" 
                      className="btn-secondary" 
                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '2px' }}
                      onClick={() => handleExportEvaluations(activeTraining)}
                    >
                      <Download size={11} /> Exportar Evaluaciones (CSV)
                    </button>
                  )}
                </div>

                <div className="table-responsive" style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                  <table className="table" style={{ fontSize: '0.78rem' }}>
                    <thead>
                      <tr>
                        <th>Participante</th>
                        <th>Documento</th>
                        <th>Fecha de Envío</th>
                        <th>Puntaje Obtenido</th>
                        <th>Estado de Aprobación</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(!activeTraining.evaluations || activeTraining.evaluations.length === 0) ? (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                            Esperando evaluaciones... Los resultados se reflejarán inmediatamente cuando los participantes respondan.
                          </td>
                        </tr>
                      ) : (
                        activeTraining.evaluations.map((e, idx) => (
                          <tr key={idx} className="fade-in">
                            <td><strong>{e.name}</strong></td>
                            <td>{e.document}</td>
                            <td>{e.submittedAt}</td>
                            <td>
                              <strong style={{ fontSize: '0.85rem', color: e.passed ? 'var(--success)' : 'var(--danger)' }}>
                                {e.score}%
                              </strong>
                            </td>
                            <td>
                              <span className={`badge ${e.passed ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.68rem' }}>
                                {e.passed ? 'APROBADO' : 'REPROBADO'}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', padding: '0.75rem 1.25rem' }}>
              <button type="button" className="btn-secondary" onClick={() => setIsEvaluacionModalOpen(false)}>Cerrar Panel de Evaluación</button>
            </div>
          </div>
        </div>
      )}

      {/* 3. CONFIGURACION DE EVALUACION BUILDER MODAL */}
      {isConfigEvalModalOpen && activeTraining && (
        <div className="modal-overlay active">
          <div className="modal-content" style={{ maxWidth: '750px', width: '95%' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckSquare size={20} style={{ color: 'var(--accent-primary)' }} />
                <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Configurar Evaluación de Capacitación</h2>
              </div>
              <button className="btn-icon" onClick={() => setIsConfigEvalModalOpen(false)}><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSaveEvalConfig}>
              <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ background: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.05rem', fontWeight: 700 }}>{activeTraining.topic}</h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Facilitador: <strong>{activeTraining.trainer}</strong> | Fecha: <strong>{activeTraining.date}</strong>
                  </span>
                </div>

                {/* Enable / Disable toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  <input 
                    type="checkbox" 
                    id="enable-eval-check" 
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    checked={evalConfigData.enabled}
                    onChange={e => setEvalConfigData({ ...evalConfigData, enabled: e.target.checked })}
                  />
                  <label htmlFor="enable-eval-check" style={{ fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', margin: 0 }}>
                    Habilitar evaluación y toma de conocimientos para esta capacitación
                  </label>
                </div>

                {evalConfigData.enabled && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div className="form-group" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, margin: 0 }}>Puntaje Mínimo para Aprobar (%):</label>
                        <input 
                          type="number" 
                          className="form-control" 
                          style={{ width: '80px', padding: '0.25rem 0.5rem', fontSize: '0.8rem' }} 
                          min="0" max="100"
                          value={evalConfigData.passingScorePercent}
                          onChange={e => setEvalConfigData({ ...evalConfigData, passingScorePercent: parseInt(e.target.value) || 80 })}
                          required
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button type="button" className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }} onClick={handleLoadStandardTemplate}>
                          Cargar Plantilla Estándar HSEQ
                        </button>
                        <button type="button" className="btn-primary" style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }} onClick={handleAddQuestion}>
                          + Agregar Pregunta
                        </button>
                      </div>
                    </div>

                    {/* Question Builder List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {evalConfigData.questions.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', border: '1px dashed var(--border-color)', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          No hay preguntas creadas. Presione "+ Agregar Pregunta" o "Cargar Plantilla Estándar HSEQ" para iniciar.
                        </div>
                      ) : (
                        evalConfigData.questions.map((q, idx) => (
                          <div key={q.id} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-primary)' }}>Pregunta #{idx + 1}</span>
                              <button type="button" className="btn-icon" style={{ color: 'var(--danger)', padding: '0.2rem' }} onClick={() => handleRemoveQuestion(q.id)}>
                                <Trash2 size={13} />
                              </button>
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                              <div className="form-group" style={{ flex: 3, minWidth: '220px', margin: 0 }}>
                                <label className="form-label" style={{ fontSize: '0.75rem' }}>Enunciado de la Pregunta</label>
                                <input 
                                  type="text" 
                                  className="form-control" 
                                  style={{ fontSize: '0.8rem', padding: '0.3rem' }} 
                                  value={q.text}
                                  onChange={e => handleUpdateQuestion(q.id, 'text', e.target.value)}
                                  placeholder="Ej. Califique el material de apoyo"
                                  required
                                />
                              </div>
                              <div className="form-group" style={{ flex: 1, minWidth: '120px', margin: 0 }}>
                                <label className="form-label" style={{ fontSize: '0.75rem' }}>Tipo de Pregunta</label>
                                <select 
                                  className="form-control" 
                                  style={{ fontSize: '0.8rem', padding: '0.25rem' }} 
                                  value={q.type}
                                  onChange={e => handleUpdateQuestion(q.id, 'type', e.target.value)}
                                >
                                  <option value="rating">Calificación en Estrellas (1-5)</option>
                                  <option value="quiz">Test Opción Múltiple</option>
                                </select>
                              </div>
                            </div>

                            {/* Options fields if type is quiz (multiple choice test) */}
                            {q.type === 'quiz' && (
                              <div style={{ background: 'var(--bg-secondary)', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Opciones del Cuestionario:</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                  {(q.options || ['', '', '']).map((opt, oIdx) => (
                                    <div key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                      <span style={{ fontSize: '0.7rem', fontWeight: 700, width: '70px', color: 'var(--text-muted)' }}>Opción {String.fromCharCode(65 + oIdx)}:</span>
                                      <input 
                                        type="text" 
                                        className="form-control" 
                                        style={{ fontSize: '0.78rem', padding: '0.2rem' }}
                                        value={opt}
                                        onChange={e => {
                                          const nextOpts = [...(q.options || ['', '', ''])];
                                          nextOpts[oIdx] = e.target.value;
                                          handleUpdateQuestion(q.id, 'options', nextOpts);
                                        }}
                                        placeholder={`Escribe la opción ${String.fromCharCode(65 + oIdx)}`}
                                        required
                                      />
                                    </div>
                                  ))}
                                </div>
                                <div className="form-group" style={{ margin: '0.25rem 0 0 0' }}>
                                  <label className="form-label" style={{ fontSize: '0.72rem', color: 'var(--success)', fontWeight: 700 }}>Respuesta Correcta de Selección:</label>
                                  <select 
                                    className="form-control" 
                                    style={{ fontSize: '0.78rem', padding: '0.2rem' }}
                                    value={q.correctAnswer}
                                    onChange={e => handleUpdateQuestion(q.id, 'correctAnswer', e.target.value)}
                                    required
                                  >
                                    <option value="">Seleccione cuál es la respuesta correcta...</option>
                                    {(q.options || []).filter(o => o).map((o, idx) => (
                                      <option key={idx} value={o}>{o}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            )}

                          </div>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>
              
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsConfigEvalModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Guardar Cambios de Configuración</button>
              </div>
            </form>
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
