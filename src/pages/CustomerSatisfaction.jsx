import React, { useState, useMemo } from 'react';
import { 
  Smile, Frown, Meh, Plus, Edit2, Trash2, Download, Filter, Paperclip, Upload, 
  AlertCircle, QrCode, Link, Check, Clipboard, Star, Eye, HelpCircle, X
} from 'lucide-react';
import Modal from '../components/Modal';
import ExportModal from '../components/ExportModal';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from '../context/AuthContext';
import { logActivity } from '../utils/activityLogger';

const DEFAULT_PARAMS = {
  projectTypes: ["Eléctrico", "Telecomunicaciones", "Civil", "Ambiental", "Industrial"],
  clients: ["Consorcio Vial del Norte", "Ecopetrol", "Claro", "Movistar"],
  cities: ["Bogotá", "Medellín", "Cali", "Barranquilla", "Bucaramanga"]
};

export default function CustomerSatisfaction() {
  const { user } = useAuth();
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

  const projectTypes = projectOptions;
  const clients = clientOptions;
  const cities = cityOptions;

  const [surveys, setSurveys] = useLocalStorage('sgi_customer_surveys', [
    { id: 1, date: '2026-05-15', client: 'Empresa ABC', projectType: 'Eléctrico', product: 'Servicio Consultoría', score: 9, rawScore: 92, comments: 'Excelente servicio, muy rápidos.', evidenceFile: null, source: 'Interno', answersDetail: { q1: 9, q2: 9, q3: 9, q4: 9, q5: 9, q6: 9, q7: 10, q8: 9, q9: 9, q10: 5, q11: 5 } },
    { id: 2, date: '2026-05-10', client: 'Constructora XYZ', projectType: 'Eléctrico', product: 'Materiales Construcción', score: 6, rawScore: 61, comments: 'Hubo retrasos en la entrega.', evidenceFile: 'encuesta_xyz.pdf', source: 'Interno', answersDetail: { q1: 6, q2: 5, q3: 7, q4: 6, q5: 6, q6: 6, q7: 6, q8: 6, q9: 7, q10: 3, q11: 3 } },
    { id: 3, date: '2025-04-28', client: 'Tech Solutions', projectType: 'Telecomunicaciones', product: 'Licencias Software', score: 8, rawScore: 82, comments: 'Buen soporte técnico.', evidenceFile: null, source: 'Interno', answersDetail: { q1: 8, q2: 8, q3: 8, q4: 8, q5: 8, q6: 8, q7: 8, q8: 8, q9: 9, q10: 5, q11: 4 } }
  ]);

  const QUESTIONS_METADATA = [
    { id: 'q1', category: 'CALIDAD', text: 'Cumplimiento de especificaciones', max: 10 },
    { id: 'q2', category: 'CALIDAD', text: 'Cumplimiento de fechas y plazos', max: 10 },
    { id: 'q3', category: 'RECURSO HUMANO', text: 'Capacidad del líder profesional', max: 10 },
    { id: 'q4', category: 'RECURSO HUMANO', text: 'Desempeño del personal operativo', max: 10 },
    { id: 'q5', category: 'GESTIÓN AMBIENTAL', text: 'Clasificación y manejo de residuos', max: 10 },
    { id: 'q6', category: 'GESTIÓN AMBIENTAL', text: 'Cumplimiento ambiental general', max: 10 },
    { id: 'q7', category: 'GESTIÓN DE LA SST', text: 'Cultura de Seguridad y Salud', max: 10 },
    { id: 'q8', category: 'GESTIÓN DE LA SST', text: 'Cumplimiento de requisitos SST', max: 10 },
    { id: 'q9', category: 'ORGANIZACIÓN', text: 'Experiencia de la empresa', max: 10 },
    { id: 'q10', category: 'ORGANIZACIÓN', text: 'Disponibilidad de herramientas y equipos', max: 5 },
    { id: 'q11', category: 'ORGANIZACIÓN', text: 'Atención a solicitudes del cliente', max: 5 }
  ];

  const getAnswersDetailFallback = (npsScore) => {
    const ratio = npsScore / 10;
    return {
      q1: Math.round(10 * ratio),
      q2: Math.round(10 * ratio),
      q3: Math.round(10 * ratio),
      q4: Math.round(10 * ratio),
      q5: Math.round(10 * ratio),
      q6: Math.round(10 * ratio),
      q7: Math.round(10 * ratio),
      q8: Math.round(10 * ratio),
      q9: Math.round(10 * ratio),
      q10: Math.round(5 * ratio),
      q11: Math.round(5 * ratio),
    };
  };

  const calculateQuestionAverages = (items) => {
    const sumAnswers = {
      q1: 0, q2: 0, q3: 0, q4: 0, q5: 0, q6: 0, q7: 0, q8: 0, q9: 0, q10: 0, q11: 0
    };
    const count = items.length;
    if (count === 0) return sumAnswers;

    items.forEach(s => {
      const details = s.answersDetail || getAnswersDetailFallback(s.score);
      Object.keys(sumAnswers).forEach(qKey => {
        sumAnswers[qKey] += details[qKey] || 0;
      });
    });

    const averages = {};
    Object.keys(sumAnswers).forEach(qKey => {
      averages[qKey] = Number((sumAnswers[qKey] / count).toFixed(1));
    });
    return averages;
  };

  const [activeTab, setActiveTab] = useState('results'); // results, parameters
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [enterDetails, setEnterDetails] = useState(false);
  const [answersForm, setAnswersForm] = useState({
    q1: 10, q2: 10, q3: 10, q4: 10, q5: 10, q6: 10, q7: 10, q8: 10, q9: 10, q10: 5, q11: 5
  });
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0], client: clients[0] || '', projectType: projectTypes[0] || 'Eléctrico', city: cities[0] || '', product: '', score: 10, rawScore: 100, comments: '', evidenceFile: null
  });

  const [yearFilter, setYearFilter] = useState('Todos');
  const [typeFilter, setTypeFilter] = useState('Todos');
  const [clientFilter, setClientFilter] = useState('Todos');
  const [cityFilter, setCityFilter] = useState('Todos');

  const availableYears = ['Todos', ...new Set(surveys.map(s => s.date.split('-')[0]))].sort((a,b) => b.localeCompare(a));
  
  const filteredSurveys = surveys.filter(s => {
    const matchYear = yearFilter === 'Todos' || s.date.startsWith(yearFilter);
    const matchType = typeFilter === 'Todos' || s.projectType === typeFilter;
    const matchClient = clientFilter === 'Todos' || s.client === clientFilter;
    const matchCity = cityFilter === 'Todos' || (s.city && s.city === cityFilter);
    return matchYear && matchType && matchClient && matchCity;
  });

  const total = filteredSurveys.length;
  const avgScore = total > 0 ? (filteredSurveys.reduce((acc, curr) => acc + curr.score, 0) / total).toFixed(1) : 0;
  
  const promoters = filteredSurveys.filter(s => s.score >= 9).length;
  const passives = filteredSurveys.filter(s => s.score >= 7 && s.score <= 8).length;
  const detractors = filteredSurveys.filter(s => s.score <= 6).length;
  const nps = total > 0 ? Math.round(((promoters - detractors) / total) * 100) : 0;

  const validRawScores = filteredSurveys.map(s => s.rawScore !== undefined ? s.rawScore : s.score * 10);
  const globalAverageScore = validRawScores.length > 0 ? Math.round(validRawScores.reduce((sum, s) => sum + s, 0) / validRawScores.length) : 0;
  const globalAveragePct = globalAverageScore;
  const questionAverages = calculateQuestionAverages(filteredSurveys);

  const surveyUrl = `${window.location.origin}/encuesta-cliente`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(surveyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, evidenceFile: file.name });
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({ 
        ...item, 
        client: item.client || clients[0] || '',
        projectType: item.projectType || projectTypes[0] || 'Eléctrico', 
        city: item.city || cities[0] || '',
        evidenceFile: item.evidenceFile || null,
        rawScore: item.rawScore !== undefined ? item.rawScore : item.score * 10
      });
      if (item.answersDetail) {
        setAnswersForm(item.answersDetail);
        setEnterDetails(true);
      } else {
        setAnswersForm(getAnswersDetailFallback(item.score));
        setEnterDetails(false);
      }
    } else {
      setEditingItem(null);
      setFormData({ 
        date: new Date().toISOString().split('T')[0], 
        client: clients[0] || '', 
        projectType: projectTypes[0] || 'Eléctrico', 
        city: cities[0] || '',
        product: '', 
        score: 10, 
        rawScore: 100,
        comments: '', 
        evidenceFile: null 
      });
      setAnswersForm({ q1: 10, q2: 10, q3: 10, q4: 10, q5: 10, q6: 10, q7: 10, q8: 10, q9: 10, q10: 5, q11: 5 });
      setEnterDetails(false);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleFormScoreChange = (qId, val) => {
    const qMeta = QUESTIONS_METADATA.find(q => q.id === qId);
    const maxVal = qMeta ? qMeta.max : 10;
    const numericValue = Math.max(0, Math.min(maxVal, Number(val)));
    const updatedAnswers = { ...answersForm, [qId]: numericValue };
    setAnswersForm(updatedAnswers);
    
    // Calculate total and nps
    const totalPoints = Object.values(updatedAnswers).reduce((sum, curr) => sum + curr, 0);
    const npsScore = Math.max(1, Math.min(10, Math.round(totalPoints / 10)));
    
    setFormData(prev => ({
      ...prev,
      score: npsScore,
      rawScore: totalPoints
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalDetail = enterDetails ? answersForm : getAnswersDetailFallback(formData.score);
    const finalRaw = enterDetails ? formData.rawScore : formData.score * 10;
    const finalRecord = {
      ...formData,
      rawScore: finalRaw,
      answersDetail: finalDetail
    };

    if (editingItem) {
      setSurveys(surveys.map(s => s.id === editingItem.id ? { ...finalRecord, id: s.id } : s));
      logActivity(user, "Modificación de Encuesta HSEQ", `Modificada encuesta de satisfacción del cliente: ${finalRecord.client}`);
    } else {
      setSurveys([{ ...finalRecord, id: Date.now(), source: 'Interno' }, ...surveys]);
      logActivity(user, "Creación de Encuesta HSEQ", `Registrada encuesta de satisfacción de forma manual para el cliente: ${finalRecord.client}`);
    }
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Está seguro de eliminar esta encuesta?")) {
      const surveyToDelete = surveys.find(s => s.id === id);
      setSurveys(surveys.filter(s => s.id !== id));
      if (surveyToDelete) {
        logActivity(user, "Eliminación de Encuesta HSEQ", `Eliminada encuesta de satisfacción con ID: ${id} del cliente: ${surveyToDelete.client}`);
      }
    }
  };

  const [exportConfig, setExportConfig] = useState({
    isOpen: false,
    exportType: 'excel',
    title: 'Reporte de Satisfacción de Clientes',
    code: 'SGI-FSCR-SAT-001',
    version: '1.0',
    validity: new Date().toLocaleDateString(),
    columns: [],
    data: [],
    history: [],
    contentHtml: ''
  });

  const handleExport = () => {
    const cols = [
      { label: 'Fecha', key: 'date' },
      { label: 'Cliente', key: 'client' },
      { label: 'Tipo de Proyecto', key: 'projectType' },
      { label: 'Producto / Servicio', key: 'product' },
      { label: 'Puntaje NPS (1-10)', key: 'score' },
      { label: 'Calificación Bruta (0-100)', key: 'rawScore' },
      { label: 'Origen', key: 'source' },
      { label: 'Comentarios', key: 'comments' }
    ];

    const questionAveragesExport = calculateQuestionAverages(filteredSurveys);
    const validRawScoresExport = filteredSurveys.map(s => s.rawScore !== undefined ? s.rawScore : s.score * 10);
    const globalAverageScoreExport = validRawScoresExport.length > 0 ? Math.round(validRawScoresExport.reduce((sum, s) => sum + s, 0) / validRawScoresExport.length) : 0;

    const questionsHtml = QUESTIONS_METADATA.map(q => {
      const avg = questionAveragesExport[q.id] || 0;
      const pct = Math.round((avg / q.max) * 100);
      let color = '#ef4444'; // Red
      if (pct >= 85) color = '#10b981'; // Green
      else if (pct >= 70) color = '#f59e0b'; // Yellow

      return `
        <div style="margin-bottom: 7px; border-bottom: 1px solid #f1f5f9; padding-bottom: 4px;">
          <div style="display: flex; justify-content: space-between; font-size: 8px; font-weight: bold; margin-bottom: 2px;">
            <span style="color: #475569;">[${q.category}] ${q.text}</span>
            <span style="color: #0f172a;">${avg} / ${q.max} (${pct}%)</span>
          </div>
          <div style="background: #e2e8f0; height: 5px; border-radius: 3px; overflow: hidden; width: 100%;">
            <div style="background: ${color}; width: ${pct}%; height: 100%; border-radius: 3px;"></div>
          </div>
        </div>
      `;
    }).join('');

    const reportHtml = `
      <div style="font-family: system-ui, sans-serif; color: #0f172a; padding: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="margin: 0; font-size: 15px; color: #1e3a8a; font-weight: 800; text-transform: uppercase;">Informe de Análisis de Satisfacción del Cliente (NPS)</h2>
          <p style="margin: 3px 0 0 0; font-size: 10px; color: #64748b;">Generado automáticamente por el Sistema de Gestión Integrado (SGI)</p>
          <p style="margin: 3px 0 0 0; font-size: 9px; color: #475569; font-weight: bold;">
            Filtro - Proyecto: ${typeFilter} | Año: ${yearFilter}
          </p>
        </div>

        <!-- KPI Box -->
        <div style="display: flex; justify-content: space-between; margin-bottom: 20px; gap: 10px; text-align: center;">
          <div style="flex: 1; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; background: #f8fafc;">
            <span style="font-size: 9px; color: #64748b; text-transform: uppercase; font-weight: bold; display: block; margin-bottom: 4px;">Total Encuestas</span>
            <strong style="font-size: 18px; color: #0f172a;">${total}</strong>
          </div>
          <div style="flex: 1; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; background: #f8fafc;">
            <span style="font-size: 9px; color: #64748b; text-transform: uppercase; font-weight: bold; display: block; margin-bottom: 4px;">Net Promoter Score</span>
            <strong style="font-size: 18px; color: ${nps > 50 ? '#10b981' : nps > 0 ? '#f59e0b' : '#ef4444'};">${nps}</strong>
          </div>
          <div style="flex: 1; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; background: #f8fafc;">
            <span style="font-size: 9px; color: #64748b; text-transform: uppercase; font-weight: bold; display: block; margin-bottom: 4px;">Puntaje Promedio (1-10)</span>
            <strong style="font-size: 18px; color: #0f172a;">${avgScore}</strong>
          </div>
          <div style="flex: 1; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; background: #f8fafc;">
            <span style="font-size: 9px; color: #64748b; text-transform: uppercase; font-weight: bold; display: block; margin-bottom: 4px;">Promotores / Detractores</span>
            <strong style="font-size: 14px; color: #0f172a; display: block; margin-top: 4px;">
              <span style="color: #10b981;">${promoters}</span> / <span style="color: #ef4444;">${detractors}</span>
            </strong>
          </div>
        </div>

        <!-- Graphic Visualizations Copy -->
        <div style="display: flex; gap: 15px; margin-bottom: 25px; align-items: stretch;">
          <!-- Left side: General Average Gauge -->
          <div style="flex: 1; border: 1px solid #cbd5e1; border-radius: 8px; padding: 15px; background: #ffffff; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 200px;">
            <h4 style="margin: 0 0 15px 0; font-size: 10px; color: #1e293b; text-transform: uppercase; font-weight: 800;">Análisis General</h4>
            <div style="width: 100px; height: 100px; border-radius: 50%; border: 8px solid #e2e8f0; display: flex; align-items: center; justify-content: center; margin: 10px auto; border-top-color: #1e3a8a; border-right-color: #1e3a8a;">
              <span style="font-size: 22px; font-weight: 900; color: #1e3a8a;">${globalAverageScoreExport}%</span>
            </div>
            <p style="margin: 10px 0 0 0; font-size: 8px; color: #64748b; font-weight: bold;">Calificación Promedio Ponderada</p>
          </div>

          <!-- Right side: Question by Question progress bars -->
          <div style="flex: 2; border: 1px solid #cbd5e1; border-radius: 8px; padding: 15px; background: #ffffff; min-height: 200px;">
            <h4 style="margin: 0 0 15px 0; font-size: 10px; color: #1e293b; text-transform: uppercase; font-weight: 800;">Análisis por Pregunta HSEQ</h4>
            ${questionsHtml}
          </div>
        </div>

        <!-- Table of responses -->
        <h4 style="margin: 0 0 8px 0; font-size: 11px; color: #1e293b; text-transform: uppercase; font-weight: 800;">Detalle de Encuestas de Satisfacción</h4>
        <table style="width: 100%; border-collapse: collapse; font-size: 8px; text-align: left;">
          <thead>
            <tr style="background: #1e3a8a; color: white;">
               <th style="padding: 6px 4px; border: 1px solid #cbd5e1; font-weight: bold; width: 10%;">Fecha</th>
               <th style="padding: 6px 4px; border: 1px solid #cbd5e1; font-weight: bold; width: 22%;">Cliente</th>
               <th style="padding: 6px 4px; border: 1px solid #cbd5e1; font-weight: bold; width: 16%;">Tipo Proyecto</th>
               <th style="padding: 6px 4px; border: 1px solid #cbd5e1; font-weight: bold; width: 20%;">Servicio Evaluado</th>
               <th style="padding: 6px 4px; border: 1px solid #cbd5e1; font-weight: bold; width: 10%; text-align: center;">Puntaje NPS</th>
               <th style="padding: 6px 4px; border: 1px solid #cbd5e1; font-weight: bold; width: 22%;">Comentarios</th>
            </tr>
          </thead>
          <tbody>
            ${filteredSurveys.length === 0 ? `
              <tr><td colSpan="6" style="padding: 10px; text-align: center; color: #94a3b8;">No se encontraron encuestas.</td></tr>
            ` : filteredSurveys.map(s => `
              <tr>
                <td style="padding: 5px 4px; border: 1px solid #cbd5e1;">${s.date}</td>
                <td style="padding: 5px 4px; border: 1px solid #cbd5e1; font-weight: bold;">${s.client}</td>
                <td style="padding: 5px 4px; border: 1px solid #cbd5e1;">${s.projectType}</td>
                <td style="padding: 5px 4px; border: 1px solid #cbd5e1;">${s.product}</td>
                <td style="padding: 5px 4px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold;">${s.score}</td>
                <td style="padding: 5px 4px; border: 1px solid #cbd5e1; color: #475569;">${s.comments || ''}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    setExportConfig({
      isOpen: true,
      exportType: 'excel',
      title: typeFilter === 'Todos' ? 'Reporte de Satisfacción de Clientes' : `Reporte de Satisfacción - Proyectos de tipo ${typeFilter}`,
      code: 'SGI-FSCR-SAT-001',
      version: '1.0',
      validity: new Date().toLocaleDateString(),
      columns: cols,
      data: filteredSurveys,
      history: [
        { date: new Date().toISOString().split('T')[0], version: '1.0', description: 'Creación del módulo y automatización NPS', author: 'Líder HSEQ' }
      ],
      contentHtml: reportHtml
    });
  };

  return (
    <>
      {/* Title Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>Satisfacción del Cliente</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 0, fontSize: '0.8rem' }}>Medición de Calidad, Servicio e Indicador NPS HSEQ</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button className="btn-secondary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }} onClick={() => setIsQrModalOpen(true)}>
            <QrCode size={13} /> Compartir Encuesta (QR)
          </button>
          <button className="btn-secondary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }} onClick={handleExport}>
            <Download size={13} /> Exportar Datos
          </button>
          <button className="btn-primary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }} onClick={() => handleOpenModal()}>
            <Plus size={14} /> Registrar Encuesta
          </button>
        </div>
      </div>

      {/* Tabs Menu */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '1.25rem', gap: '0.5rem' }}>
        <button 
          onClick={() => setActiveTab('results')}
          style={{
            padding: '0.6rem 1rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'results' ? '3px solid var(--accent-primary)' : '3px solid transparent',
            color: activeTab === 'results' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'results' ? 700 : 500,
            cursor: 'pointer',
            fontSize: '0.82rem',
            transition: 'all 0.15s'
          }}
        >
          Resultados de Satisfacción (NPS)
        </button>
        <button 
          onClick={() => setActiveTab('parameters')}
          style={{
            padding: '0.6rem 1rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'parameters' ? '3px solid var(--accent-primary)' : '3px solid transparent',
            color: activeTab === 'parameters' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'parameters' ? 700 : 500,
            cursor: 'pointer',
            fontSize: '0.82rem',
            transition: 'all 0.15s'
          }}
        >
          Parámetros de Evaluación HSEQ
        </button>
      </div>

      {activeTab === 'results' ? (
        <>
          {/* Quick Sharing Banner inline */}
          <div className="card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', marginBottom: '1.25rem', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 350px' }}>
              <h4 style={{ margin: '0 0 2px 0', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Link size={14} style={{ color: 'var(--accent-primary)' }} /> Canal Auto-Procesable de Encuestas
              </h4>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Comparta este enlace o código QR con los clientes. Las respuestas se agregarán y ponderarán de forma automática.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '2 1 300px', maxWidth: '520px', width: '100%' }}>
              <input 
                type="text" 
                className="form-control" 
                readOnly 
                value={surveyUrl} 
                style={{ fontSize: '0.78rem', background: 'var(--bg-primary)', cursor: 'default', margin: 0 }}
              />
              <button className="btn-secondary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }} onClick={handleCopyLink}>
                {copied ? <Check size={13} style={{ color: 'var(--success)' }} /> : <Clipboard size={13} />} {copied ? 'Copiado' : 'Copiar'}
              </button>
              <button className="btn-secondary" style={{ padding: '0.45rem', display: 'inline-flex', alignItems: 'center' }} onClick={() => setIsQrModalOpen(true)} title="Ver Código QR">
                <QrCode size={14} />
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="card" style={{ marginBottom: '1.25rem', padding: '0.75rem 1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Filter size={13} style={{ color: 'var(--text-secondary)' }} />
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Año:</label>
                <select className="form-control" style={{ padding: '0.25rem 0.5rem', width: 'auto', margin: 0, fontSize: '0.78rem' }} value={yearFilter} onChange={e => setYearFilter(e.target.value)}>
                  {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Tipo de Proyecto:</label>
                <select className="form-control" style={{ padding: '0.25rem 0.5rem', width: 'auto', margin: 0, fontSize: '0.78rem' }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                  <option value="Todos">Todos</option>
                  {projectTypes.map(pt => (
                    <option key={pt} value={pt}>{pt}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Cliente:</label>
                <select className="form-control" style={{ padding: '0.25rem 0.5rem', width: 'auto', margin: 0, fontSize: '0.78rem' }} value={clientFilter} onChange={e => setClientFilter(e.target.value)}>
                  <option value="Todos">Todos</option>
                  {clients.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Ciudad / Sede:</label>
                <select className="form-control" style={{ padding: '0.25rem 0.5rem', width: 'auto', margin: 0, fontSize: '0.78rem' }} value={cityFilter} onChange={e => setCityFilter(e.target.value)}>
                  <option value="Todos">Todas</option>
                  {cities.map(ct => (
                    <option key={ct} value={ct}>{ct}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid-4" style={{ marginBottom: '1.25rem', gap: '1rem' }}>
            <div className="card" style={{ marginBottom: 0, borderLeft: '4px solid var(--accent-primary)', padding: '1rem 1.25rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Total Encuestas</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{total}</div>
            </div>
            <div className="card" style={{ marginBottom: 0, borderLeft: `4px solid ${nps > 50 ? 'var(--success)' : nps > 0 ? 'var(--warning)' : 'var(--danger)'}`, padding: '1rem 1.25rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>NPS (Net Promoter Score)</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: nps > 50 ? 'var(--success)' : nps > 0 ? 'var(--warning)' : 'var(--danger)' }}>{nps}</div>
            </div>
            <div className="card" style={{ marginBottom: 0, borderLeft: '4px solid var(--success)', padding: '1rem 1.25rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Puntaje Promedio (1-10)</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{avgScore}</div>
            </div>
            <div className="card" style={{ marginBottom: 0, borderLeft: '4px solid var(--info)', padding: '1rem 1.25rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Promotores / Detractores</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '0.45rem' }}>
                <span style={{ color: 'var(--success)' }}>{promoters} Prom.</span> / <span style={{ color: 'var(--danger)' }}>{detractors} Detr.</span>
              </div>
            </div>
          </div>

          {/* Dashboard Gráfico de Análisis */}
          <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            {/* Left Column: circular gauge for overall score */}
            <div className="card" style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', textAlign: 'center', minHeight: '320px' }}>
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', alignSelf: 'flex-start' }}>Análisis General</h4>
              
              <div style={{ position: 'relative', width: '140px', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <svg width="140" height="140" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                  {/* Background Circle */}
                  <circle cx="50" cy="50" r="42" fill="none" stroke="var(--bg-tertiary)" strokeWidth="8" />
                  {/* Foreground Circle */}
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="42" 
                    fill="none" 
                    stroke="var(--accent-primary)" 
                    strokeWidth="8" 
                    strokeDasharray="264" 
                    strokeDashoffset={264 - (264 * (globalAveragePct / 100))}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                  />
                </svg>
                <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>{globalAverageScore}%</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>Satisfacción</span>
                </div>
              </div>
              
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                Puntaje promedio general acumulado para los criterios evaluados ({total} encuestas).
              </p>
            </div>

            {/* Right Column: progress bar question by question */}
            <div className="card" style={{ flex: '2 1 500px', padding: '1.25rem', display: 'flex', flexDirection: 'column', minHeight: '320px' }}>
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase' }}>Análisis Desglosado por Pregunta HSEQ</h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', overflowY: 'auto', flex: 1, paddingRight: '0.5rem', maxHeight: '350px' }}>
                {QUESTIONS_METADATA.map(q => {
                  const avg = questionAverages[q.id] || 0;
                  const pct = Math.round((avg / q.max) * 100);
                  
                  let color = 'var(--danger)';
                  if (pct >= 85) color = 'var(--success)';
                  else if (pct >= 70) color = 'var(--warning)';

                  return (
                    <div key={q.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: '0.78rem' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          <span style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase', fontWeight: 800 }}>{q.category}</span>
                          {q.text}
                        </span>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.8rem', whiteSpace: 'nowrap', marginLeft: '10px' }}>
                          {avg} / {q.max} <span style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: 500 }}>({pct}%)</span>
                        </span>
                      </div>
                      <div style={{ background: 'var(--bg-tertiary)', height: '7px', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ background: color, width: `${pct}%`, height: '100%', borderRadius: '4px', transition: 'width 0.6s ease' }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Cliente / Proyecto</th>
                    <th>Producto / Servicio Evaluado</th>
                    <th title="Puntaje de 1 a 10" style={{ textAlign: 'center' }}>Puntaje (NPS)</th>
                    <th style={{ textAlign: 'center' }}>Calificación Bruta</th>
                    <th>Origen</th>
                    <th>Comentarios e Evidencia</th>
                    <th style={{ width: '80px' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSurveys.length === 0 ? (
                    <tr><td colSpan="8" style={{ textAlign: 'center', padding: '3rem' }}>No hay encuestas registradas para los filtros activos.</td></tr>
                  ) : filteredSurveys.map(s => {
                    let icon = <Smile size={14} />;
                    let badgeClass = 'badge-success';
                    let level = 'Promotor';

                    if (s.score <= 6) {
                      icon = <Frown size={14} />;
                      badgeClass = 'badge-danger';
                      level = 'Detractor';
                    } else if (s.score <= 8) {
                      icon = <Meh size={14} />;
                      badgeClass = 'badge-warning';
                      level = 'Pasivo';
                    }

                    return (
                      <tr key={s.id}>
                        <td style={{ fontSize: '0.8rem' }}>{s.date}</td>
                        <td>
                          <strong style={{ fontSize: '0.82rem' }}>{s.client}</strong>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{s.projectType}</div>
                        </td>
                        <td style={{ fontSize: '0.8rem' }}>{s.product}</td>
                        <td style={{ textAlign: 'center' }}>
                          <span className={`badge ${badgeClass}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontWeight: 'bold' }}>
                            {s.score} - {icon} {level}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '0.85rem' }}>
                          {s.rawScore !== undefined ? `${s.rawScore}/100` : 'N/A'}
                        </td>
                        <td>
                          <span className={`badge ${s.source === 'Público' ? 'badge-success' : 'badge-info'}`} style={{ fontSize: '0.65rem' }}>
                            {s.source || 'Interno'}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.78rem', maxWidth: '280px', lineHeight: '1.4' }}>{s.comments}</div>
                          {s.evidenceFile && (
                            <div style={{ fontSize: '0.7rem', color: 'var(--info)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }} title="Descargar Evidencia" onClick={() => alert('Simulando descarga de: ' + s.evidenceFile)}>
                              <Paperclip size={11} /> {s.evidenceFile}
                            </div>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.25rem', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', gap: '0.25rem' }}>
                              <button className="btn-icon" style={{ padding: '0.25rem' }} onClick={() => handleOpenModal(s)}><Edit2 size={13} /></button>
                              <button className="btn-icon" style={{ padding: '0.25rem', color: 'var(--danger)' }} onClick={() => handleDelete(s.id)}><Trash2 size={13} /></button>
                            </div>
                            {level === 'Detractor' && (
                              <button className="btn-secondary" style={{ padding: '0.2rem 0.4rem', fontSize: '0.65rem', borderColor: 'var(--danger)', color: 'var(--danger)', marginTop: '4px', whiteSpace: 'nowrap' }} title="Levantar acción en el módulo de Acción y Mejora">
                                <AlertCircle size={10} style={{ marginRight: '2px' }} /> Crear Plan
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Parameters Tab details mirroring the user's provided matrix image */
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '2px solid var(--accent-primary)', paddingBottom: '8px', marginBottom: '1.25rem' }}>
            <Clipboard size={18} style={{ color: 'var(--accent-primary)' }} />
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>Matriz de Parámetros y Criterios de Evaluación HSEQ</h3>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '1rem' }}>
            Esta tabla define los conceptos de evaluación técnica y HSEQ que se aplican a los servicios y obras ejecutados. El puntaje máximo ponderado suma **100 Puntos**, que luego se mapean automáticamente a la escala NPS corporativa (1-10) del sistema de calidad.
          </p>

          <div className="table-responsive">
            <table className="table" style={{ borderCollapse: 'collapse', width: '100%', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)', borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{ padding: '10px', textAlign: 'left', fontWeight: 'bold' }}>CONCEPTO DE EVALUACIÓN</th>
                  <th style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold', width: '180px' }}>PONDERACIÓN</th>
                  <th style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold', width: '180px' }}>CALIFICACIÓN</th>
                </tr>
              </thead>
              <tbody>
                {/* 1. Calidad */}
                <tr style={{ background: 'rgba(37, 99, 235, 0.05)', fontWeight: 'bold' }}>
                  <td style={{ padding: '8px 10px', color: 'var(--accent-primary)' }}>EN CUANTO A LA CALIDAD</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', color: 'var(--accent-primary)' }}>20 PUNTOS</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center' }}>-</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 10px 8px 20px' }}>¿Se cumplió con las especificaciones técnicas asignadas por el cliente?</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', color: 'var(--text-muted)' }}>0 - 10</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center' }}>Manual / Digital</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '8px 10px 8px 20px' }}><strong>CUMPLIMIENTO:</strong> ¿Se cumplió en la fecha de inicio y terminación acordadas en el contrato?</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', color: 'var(--text-muted)' }}>0 - 10</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center' }}>Manual / Digital</td>
                </tr>

                {/* 2. Recurso Humano */}
                <tr style={{ background: 'rgba(245, 158, 11, 0.05)', fontWeight: 'bold' }}>
                  <td style={{ padding: '8px 10px', color: 'var(--warning)' }}>EN CUANTO AL RECURSO HUMANO</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', color: 'var(--warning)' }}>20 PUNTOS</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center' }}>-</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 10px 8px 20px' }}><strong>PERSONAL PROFESIONAL:</strong> Capacidad técnica del Líder del proyecto asignado para dar cumplimiento a los requisitos del contrato (Especificaciones, costos y calidad de la obra)</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', color: 'var(--text-muted)' }}>0 - 10</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center' }}>Manual / Digital</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '8px 10px 8px 20px' }}><strong>PERSONAL OPERATIVO:</strong> Capacidad técnica del personal operativo para solucionar las necesidades del proyecto</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', color: 'var(--text-muted)' }}>0 - 10</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center' }}>Manual / Digital</td>
                </tr>

                {/* 3. Ambiental */}
                <tr style={{ background: 'rgba(16, 185, 129, 0.05)', fontWeight: 'bold' }}>
                  <td style={{ padding: '8px 10px', color: 'var(--success)' }}>EN CUANTO A LO AMBIENTAL</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', color: 'var(--success)' }}>20 PUNTOS</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center' }}>-</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 10px 8px 20px' }}><strong>GESTIÓN DE RESIDUOS:</strong> ¿Considera eficaz la disposición final de residuos por parte de la organización?</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', color: 'var(--text-muted)' }}>0 - 10</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center' }}>Manual / Digital</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '8px 10px 8px 20px' }}><strong>GESTIÓN AMBIENTAL:</strong> Cumplimiento de los requisitos ambientales asociados al proyecto</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', color: 'var(--text-muted)' }}>0 - 10</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center' }}>Manual / Digital</td>
                </tr>

                {/* 4. SST */}
                <tr style={{ background: 'rgba(239, 68, 68, 0.05)', fontWeight: 'bold' }}>
                  <td style={{ padding: '8px 10px', color: 'var(--danger)' }}>EN CUANTO AL SST</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', color: 'var(--danger)' }}>20 PUNTOS</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center' }}>-</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 10px 8px 20px' }}><strong>GESTIÓN DE LA SST:</strong> ¿Considera que en la Organización existe una cultura de la Seguridad y Salud en el trabajo?</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', color: 'var(--text-muted)' }}>0 - 10</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center' }}>Manual / Digital</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '8px 10px 8px 20px' }}><strong>GESTIÓN DE LA SST:</strong> Cumplimiento de todos los requerimientos relacionados con la Seguridad y Salud de los trabajadores</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', color: 'var(--text-muted)' }}>0 - 10</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center' }}>Manual / Digital</td>
                </tr>

                {/* 5. Organización */}
                <tr style={{ background: 'rgba(107, 114, 128, 0.05)', fontWeight: 'bold' }}>
                  <td style={{ padding: '8px 10px', color: 'var(--text-secondary)' }}>EN CUANTO A LA ORGANIZACIÓN</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', color: 'var(--text-secondary)' }}>20 PUNTOS</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center' }}>-</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 10px 8px 20px' }}>Experiencia de la empresa en la ejecución del proyecto</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', color: 'var(--text-muted)' }}>0 - 10</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center' }}>Manual / Digital</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 10px 8px 20px' }}>Disponibilidad de equipo, materiales y herramienta en obra para atender las necesidades del proyecto</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', color: 'var(--text-muted)' }}>0 - 5</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center' }}>Manual / Digital</td>
                </tr>
                <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                  <td style={{ padding: '8px 10px 8px 20px' }}>Atención de solicitudes del cliente</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', color: 'var(--text-muted)' }}>0 - 5</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center' }}>Manual / Digital</td>
                </tr>

                {/* Total */}
                <tr style={{ background: 'var(--accent-primary)', color: 'white', fontWeight: 'bold' }}>
                  <td style={{ padding: '10px' }}>TOTAL MÁXIMO</td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>100 PUNTOS</td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>100</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Manual registry modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingItem ? "Editar Encuesta" : "Registrar Encuesta de Satisfacción"}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
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
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Proyecto / Tipo</label>
              <select 
                className="form-control" 
                value={formData.projectType || ''} 
                onChange={e => setFormData({ ...formData, projectType: e.target.value })} 
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
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Fecha del Registro</label>
              <input type="date" className="form-control" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required />
            </div>
            <div className="form-group" style={{ flex: 2 }}>
              <label className="form-label">Producto o Servicio Evaluado</label>
              <input type="text" className="form-control" value={formData.product} onChange={e => setFormData({ ...formData, product: e.target.value })} required placeholder="Ej: Servicio de Mantenimiento / Obra..." />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', margin: '0.25rem 0' }}>
            <input 
              type="checkbox" 
              id="enterDetailsToggle" 
              checked={enterDetails} 
              onChange={e => {
                setEnterDetails(e.target.checked);
                if (e.target.checked) {
                  const totalPoints = Object.values(answersForm).reduce((sum, curr) => sum + curr, 0);
                  const npsScore = Math.max(1, Math.min(10, Math.round(totalPoints / 10)));
                  setFormData(prev => ({ ...prev, score: npsScore, rawScore: totalPoints }));
                }
              }} 
            />
            <label htmlFor="enterDetailsToggle" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer' }}>
              Calificar criterio por criterio (Detallado)
            </label>
          </div>

          {!enterDetails ? (
            <div className="form-group">
              <label className="form-label">Puntaje NPS Equiv. (1 al 10)</label>
              <input type="number" min="1" max="10" className="form-control" value={formData.score} onChange={e => setFormData({ ...formData, score: Number(e.target.value) })} required />
              <small style={{ color: 'var(--text-muted)' }}>9-10: Promotor | 7-8: Pasivo | 1-6: Detractor</small>
            </div>
          ) : (
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem', display: 'block' }}>
                CALIFICACIÓN POR CRITERIOS HSEQ
              </span>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', maxHeight: '200px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                {QUESTIONS_METADATA.map(q => (
                  <div key={q.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {q.category} - {q.text} (Max {q.max})
                    </label>
                    <input 
                      type="number" 
                      min="0" 
                      max={q.max} 
                      className="form-control" 
                      value={answersForm[q.id]} 
                      onChange={e => handleFormScoreChange(q.id, e.target.value)} 
                      required 
                    />
                  </div>
                ))}
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem', fontSize: '0.78rem', fontWeight: 'bold' }}>
                <span>Puntaje Bruto: {formData.rawScore || 0}/100</span>
                <span>NPS Equivalente: {formData.score || 1}/10</span>
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Comentarios / Sugerencias</label>
            <textarea className="form-control" value={formData.comments || ''} onChange={e => setFormData({ ...formData, comments: e.target.value })} rows="3"></textarea>
          </div>
          
          <div className="form-group">
            <label className="form-label">Evidencia (Encuesta Escaneada)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-color)' }}>
              <input 
                type="file" 
                id="file-upload-survey" 
                style={{ display: 'none' }} 
                accept=".doc,.docx,.xls,.xlsx,.ppt,.pptx,.pdf,image/*"
                onChange={handleFileChange}
              />
              <label htmlFor="file-upload-survey" className="btn-secondary" style={{ cursor: 'pointer', margin: 0, padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}>
                <Upload size={14} style={{ marginRight: '4px' }} /> {formData.evidenceFile ? 'Cambiar Evidencia' : 'Subir Evidencia'}
              </label>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {formData.evidenceFile ? formData.evidenceFile : 'Formatos: Word, Excel, PDF, Imágenes.'}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <button type="button" className="btn-secondary" onClick={handleCloseModal}>Cancelar</button>
            <button type="submit" className="btn-primary">{editingItem ? "Actualizar" : "Guardar"}</button>
          </div>
        </form>
      </Modal>

      {/* QR sharing modal */}
      {isQrModalOpen && (
        <div className="modal-overlay active">
          <div className="modal-content" style={{ maxWidth: '480px', width: '95%', textAlign: 'center' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <QrCode size={20} style={{ color: 'var(--accent-primary)' }} />
                <h2 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 800 }}>Compartir Encuesta de Satisfacción</h2>
              </div>
              <button className="btn-icon" onClick={() => setIsQrModalOpen(false)}><X size={20} /></button>
            </div>
            
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', padding: '1rem 0' }}>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                Escanee este código QR con un smartphone o copie el enlace inferior para enviarlo directamente a sus clientes:
              </p>

              {/* QR Image API */}
              <div style={{ border: '4px solid white', borderRadius: '8px', boxShadow: 'var(--shadow-md)', display: 'inline-block', padding: '0.5rem', background: 'white' }}>
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(surveyUrl)}`}
                  alt="Código QR de Encuesta" 
                  style={{ width: '180px', height: '180px', display: 'block' }}
                />
              </div>

              <div style={{ width: '100%', marginTop: '0.5rem' }}>
                <input 
                  type="text" 
                  className="form-control" 
                  readOnly 
                  value={surveyUrl} 
                  style={{ fontSize: '0.78rem', background: 'var(--bg-secondary)', textSelect: 'all', textAlign: 'center', marginBottom: '0.5rem' }}
                />
                
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                  <button className="btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }} onClick={handleCopyLink}>
                    {copied ? <Check size={13} /> : <Clipboard size={13} />} {copied ? '¡Enlace Copiado!' : 'Copiar Enlace'}
                  </button>
                  <button className="btn-secondary" style={{ padding: '0.45rem 1rem', fontSize: '0.78rem' }} onClick={() => setIsQrModalOpen(false)}>
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
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

