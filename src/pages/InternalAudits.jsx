import React, { useState, useEffect, useMemo } from 'react';
import { 
  ClipboardList, Plus, Calendar, Edit2, Trash2, Download, CheckCircle, 
  Clock, AlertTriangle, Upload, Paperclip, AlertCircle, FileText, UserCheck, 
  HelpCircle, CheckSquare, Search, Award
} from 'lucide-react';
import Modal from '../components/Modal';
import ExportModal from '../components/ExportModal';
import { downloadCSV } from '../utils/exportUtils';
import { useLocalStorage } from '../hooks/useLocalStorage';

const DEFAULT_PARAMS = {
  projectTypes: ["Eléctrico", "Telecomunicaciones", "Civil", "Ambiental", "Industrial"],
  clients: ["Consorcio Vial del Norte", "Ecopetrol", "Claro", "Movistar"],
  cities: ["Bogotá", "Medellín", "Cali", "Barranquilla", "Bucaramanga"]
};

const auditorsCV = {
  'Diego Castro': {
    name: 'Diego Castro',
    role: 'Auditor HSEQ Líder (Interno)',
    education: 'Especialista en Sistemas Integrados de Gestión HSEQ - Universidad Nacional',
    certifications: 'Auditor Líder Certificado ISO 9001, 14001, 45001 (Registro IRCA Nro 60412)',
    experience: '8 años de experiencia en auditorías de sistemas de gestión en sectores logístico, de servicios y comercial.',
    skills: 'Auditoría basada en riesgos (ISO 31000), metodologías de causa raíz (Ishikawa, 5 Porqués), GTC 45, legislación ambiental.',
    cvFile: 'hoja_vida_diego_castro.pdf'
  },
  'Ente Certificador (SGS)': {
    name: 'Ing. Fernando Rueda (SGS)',
    role: 'Auditor Externo de Certificación',
    education: 'Ingeniero Químico, Magíster en Gestión Ambiental y Seguridad Industrial',
    certifications: 'Auditor Certificador Senior SGS, Registro IRCA Lead Auditor Nro 44012',
    experience: 'Más de 15 años realizando auditorías de certificación de tercera parte en Latinoamérica para normas ISO.',
    skills: 'Evaluación de conformidad legal de tercera parte, auditorías integradas de tercera parte, ISO 19011.',
    cvFile: 'cv_auditor_sgs_fernando.pdf'
  },
  'Equipo Auditor Interno': {
    name: 'Equipo Auditor Interno (SGI)',
    role: 'Auditores de Calidad Cruzada',
    education: 'Profesionales del Comité de Calidad HSEQ',
    certifications: 'Curso de Formación de Auditores Internos HSEQ (24 Horas) - Organismo Certificador',
    experience: 'Equipo conformado por líderes de proceso entrenados en auditoría interna cruzada.',
    skills: 'Conocimiento profundo del mapa de procesos corporativo, auditorías operacionales cruzadas.',
    cvFile: 'perfil_equipo_auditor.pdf'
  }
};

const getAuditorCV = (name) => {
  return auditorsCV[name] || {
    name: name || 'Equipo Auditor',
    role: 'Auditor Interno SGI',
    education: 'Profesional HSEQ capacitado en ISO 19011',
    certifications: 'Curso de Auditor Interno HSEQ',
    experience: 'Experiencia en auditorías cruzadas del SGI.',
    skills: 'Conocimiento de normas ISO de calidad, ambiental y seguridad.',
    cvFile: 'perfil_auditor_sgi.pdf'
  };
};

export default function InternalAudits() {
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

  const [audits, setAudits] = useLocalStorage('sgi_audits', [
    { 
      id: 1, 
      type: 'Interna', 
      norm: 'ISO 9001:2015', 
      date: '2026-10-15', 
      auditor: 'Diego Castro', 
      status: 'Programada', 
      project: 'Eléctrico',
      city: 'Bogotá',
      client: 'Consorcio Vial del Norte',
      findings_nc: 0, 
      findings_obs: 0, 
      findings_om: 0, 
      reportFile: null,
      reportSummary: 'Auditoría interna de calidad planificada para revisar los procesos de compras, gestión de proveedores y control operacional.',
      checklist: [
        { id: 1, question: '¿La organización ha determinado las partes interesadas relevantes y sus requisitos HSEQ? (Cl. 4.2)', complies: 'Pendiente' },
        { id: 2, question: '¿La política de calidad está disponible, documentada y comunicada dentro del SGI? (Cl. 5.2)', complies: 'Pendiente' },
        { id: 3, question: '¿Se aplican de forma rigurosa los controles de cambios e historial de versiones? (Cl. 7.5)', complies: 'Pendiente' },
        { id: 4, question: '¿Existe evidencia de evaluación y reevaluación de proveedores críticos según los plazos? (Cl. 8.4)', complies: 'Pendiente' }
      ]
    },
    { 
      id: 2, 
      type: 'Externa', 
      norm: 'ISO 14001:2015', 
      date: '2026-04-10', 
      auditor: 'Ente Certificador (SGS)', 
      status: 'Ejecutada', 
      project: 'Civil',
      city: 'Cali',
      client: 'Ecopetrol',
      findings_nc: 2, 
      findings_obs: 1, 
      findings_om: 3, 
      reportFile: 'informe_sgs_2026.pdf',
      reportSummary: 'Auditoría externa de certificación ambiental de tercera parte. Se reportaron 2 no conformidades menores asociadas a la gestión e identificación de residuos RESPEL y 1 observación sobre el plan de contingencias de transporte.',
      checklist: [
        { id: 5, question: '¿Se han determinado los aspectos e impactos ambientales significativos del servicio? (Cl. 6.1.2)', complies: 'Cumple' },
        { id: 6, question: '¿La organización dispone de manifiestos autorizados para la disposición de RESPEL? (Cl. 8.1)', complies: 'No Cumple' },
        { id: 7, question: '¿Se planifican, ejecutan y documentan las lecciones aprendidas de simulacros? (Cl. 8.2)', complies: 'Cumple' },
        { id: 8, question: '¿Se realiza seguimiento mensual a los indicadores de ecoeficiencia de agua y energía? (Cl. 9.1)', complies: 'Observación' }
      ]
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedAuditId, setSelectedAuditId] = useState(null);
  const [detailTab, setDetailTab] = useState('results'); // results, checklist, CV
  const [newQuestionText, setNewQuestionText] = useState('');
  const [activeFindingsTab, setActiveFindingsTab] = useState(null);
  const [newFindingText, setNewFindingText] = useState('');

  const [programObjective, setProgramObjective] = useLocalStorage('sgi_audit_program_objective', 'Evaluar la conformidad, eficacia e implementación de los procesos del Sistema de Gestión Integrado (SGI) bajo los estándares ISO 9001, ISO 14001 e ISO 45001.');

  const [exportConfig, setExportConfig] = useState({
    isOpen: false,
    exportType: 'excel',
    title: 'Programa y Cronograma de Auditorías HSEQ',
    code: 'SGI-PRG-AUD-001',
    version: '1.0',
    validity: new Date().toLocaleDateString(),
    columns: [],
    data: [],
    history: [],
    contentHtml: ''
  });

  const [formData, setFormData] = useState({
    type: 'Interna', norm: '', date: '', auditor: 'Diego Castro', status: 'Programada', findings_nc: 0, findings_obs: 0, findings_om: 0, reportFile: '', reportSummary: '',
    project: '', city: '', client: ''
  });

  // Normalize audits to ensure they have summary, checklist arrays and findings lists
  const normalizedAudits = audits.map(a => {
    const defaultChecklist = [
      { id: 101, question: '¿Se evidencia el compromiso de la dirección con el SGI? (Cl. 5.1)', complies: 'Pendiente' },
      { id: 102, question: '¿Se realiza seguimiento a los objetivos y metas integrados del sistema? (Cl. 6.2)', complies: 'Pendiente' },
      { id: 103, question: '¿Se controlan los riesgos de los procesos de manera activa? (Cl. 6.1)', complies: 'Pendiente' }
    ];

    const defaultNCList = a.id === 2 ? [
      'Incumplimiento en la actualización de manifiestos de transporte para residuos RESPEL del mes de marzo.',
      'Falta de rotulado de seguridad e identificación de riesgos químicos en el área de almacenamiento temporal.'
    ] : Array(a.findings_nc || 0).fill('Hallazgo de no conformidad registrado.');
    
    const defaultOBSList = a.id === 2 ? [
      'Se observó que el plan de contingencias de transporte no ha sido simulado con el transportador actual.'
    ] : Array(a.findings_obs || 0).fill('Observación registrada en la auditoría.');
    
    const defaultOMList = a.id === 2 ? [
      'Se sugiere automatizar las alarmas de vencimiento de las licencias de disposición final.',
      'Posibilidad de instalar sensores de movimiento para optimizar el consumo de energía en pasillos.',
      'Oportunidad de realizar capacitaciones virtuales cortas sobre separación en la fuente para contratistas.'
    ] : Array(a.findings_om || 0).fill('Oportunidad de mejora sugerida.');

    return {
      ...a,
      reportSummary: a.reportSummary || 'Sin observaciones o conclusiones del informe registradas.',
      checklist: a.checklist || defaultChecklist,
      findings_nc_list: a.findings_nc_list || defaultNCList,
      findings_obs_list: a.findings_obs_list || defaultOBSList,
      findings_om_list: a.findings_om_list || defaultOMList
    };
  });

  // Auto-select first audit
  useEffect(() => {
    if (normalizedAudits.length > 0 && !selectedAuditId) {
      setSelectedAuditId(normalizedAudits[0].id);
    }
  }, [normalizedAudits, selectedAuditId]);

  const total = audits.length;
  const ejecutadas = audits.filter(a => a.status === 'Ejecutada').length;
  const pendientes = total - ejecutadas;
  const cumplimiento = total > 0 ? Math.round((ejecutadas / total) * 100) : 0;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, reportFile: file.name });
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({ 
        ...item, 
        findings_nc: item.findings_nc || 0,
        findings_obs: item.findings_obs || 0,
        findings_om: item.findings_om || 0,
        reportFile: item.reportFile || '',
        reportSummary: item.reportSummary || ''
      });
    } else {
      setEditingItem(null);
      setFormData({ 
        type: 'Interna', 
        norm: '', 
        date: new Date().toISOString().split('T')[0], 
        auditor: 'Diego Castro', 
        status: 'Programada', 
        findings_nc: 0, 
        findings_obs: 0, 
        findings_om: 0, 
        reportFile: '',
        reportSummary: '',
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
      const syncList = (list, count, defaultMsg) => {
        const currentList = list || [];
        if (currentList.length === count) return currentList;
        if (currentList.length < count) {
          const padding = Array(count - currentList.length).fill(defaultMsg);
          return [...currentList, ...padding];
        }
        return currentList.slice(0, count);
      };

      const findings_nc_list = syncList(editingItem.findings_nc_list, formData.findings_nc, 'Hallazgo de no conformidad registrado.');
      const findings_obs_list = syncList(editingItem.findings_obs_list, formData.findings_obs, 'Observación registrada en la auditoría.');
      const findings_om_list = syncList(editingItem.findings_om_list, formData.findings_om, 'Oportunidad de mejora sugerida.');

      setAudits(audits.map(a => a.id === editingItem.id ? { 
        ...formData, 
        id: a.id, 
        checklist: editingItem.checklist || [],
        findings_nc_list,
        findings_obs_list,
        findings_om_list
      } : a));
    } else {
      const findings_nc_list = Array(formData.findings_nc || 0).fill('Hallazgo de no conformidad registrado.');
      const findings_obs_list = Array(formData.findings_obs || 0).fill('Observación registrada en la auditoría.');
      const findings_om_list = Array(formData.findings_om || 0).fill('Oportunidad de mejora sugerida.');

      const newAudit = { 
        ...formData, 
        id: Date.now(), 
        checklist: [],
        findings_nc_list,
        findings_obs_list,
        findings_om_list
      };
      setAudits([...audits, newAudit]);
      setSelectedAuditId(newAudit.id);
    }
    handleCloseModal();
  };

  const handleAddFinding = (e, type) => {
    e.preventDefault();
    if (!newFindingText.trim() || !selectedAuditId) return;

    const listKey = type === 'nc' ? 'findings_nc_list' : type === 'obs' ? 'findings_obs_list' : 'findings_om_list';
    const countKey = type === 'nc' ? 'findings_nc' : type === 'obs' ? 'findings_obs' : 'findings_om';

    const updated = normalizedAudits.map(a => {
      if (a.id === selectedAuditId) {
        const currentList = a[listKey] || [];
        const newList = [...currentList, newFindingText.trim()];
        return {
          ...a,
          [listKey]: newList,
          [countKey]: newList.length
        };
      }
      return a;
    });

    setAudits(updated);
    setNewFindingText('');
  };

  const handleDeleteFinding = (type, index) => {
    if (!selectedAuditId) return;
    if (window.confirm("¿Está seguro de eliminar la descripción de este hallazgo?")) {
      const listKey = type === 'nc' ? 'findings_nc_list' : type === 'obs' ? 'findings_obs_list' : 'findings_om_list';
      const countKey = type === 'nc' ? 'findings_nc' : type === 'obs' ? 'findings_obs' : 'findings_om';

      const updated = normalizedAudits.map(a => {
        if (a.id === selectedAuditId) {
          const currentList = a[listKey] || [];
          const newList = currentList.filter((_, idx) => idx !== index);
          return {
            ...a,
            [listKey]: newList,
            [countKey]: newList.length
          };
        }
        return a;
      });

      setAudits(updated);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Está seguro de eliminar esta auditoría?")) {
      const remaining = audits.filter(a => a.id !== id);
      setAudits(remaining);
      if (selectedAuditId === id) {
        setSelectedAuditId(remaining[0]?.id || null);
      }
    }
  };

  // Checklist updates
  const handleUpdateQuestionCompliance = (auditId, qId, value) => {
    const updated = normalizedAudits.map(a => {
      if (a.id === auditId) {
        const updatedChecklist = a.checklist.map(q => 
          q.id === qId ? { ...q, complies: value } : q
        );
        return { ...a, checklist: updatedChecklist };
      }
      return a;
    });
    setAudits(updated);
  };

  const handleAddChecklistQuestion = (e, auditId) => {
    e.preventDefault();
    if (!newQuestionText) return;
    
    const newQuestion = {
      id: Date.now(),
      question: newQuestionText,
      complies: 'Pendiente'
    };

    const updated = normalizedAudits.map(a => {
      if (a.id === auditId) {
        return {
          ...a,
          checklist: [...(a.checklist || []), newQuestion]
        };
      }
      return a;
    });

    setAudits(updated);
    setNewQuestionText('');
  };

  const handleDeleteChecklistQuestion = (auditId, qId) => {
    if (window.confirm("¿Está seguro de eliminar esta pregunta de la lista de verificación?")) {
      const updated = normalizedAudits.map(a => {
        if (a.id === auditId) {
          return {
            ...a,
            checklist: (a.checklist || []).filter(q => q.id !== qId)
          };
        }
        return a;
      });
      setAudits(updated);
    }
  };

  const handleExport = () => {
    const cols = [
      { label: 'Fecha Programada', key: 'date' },
      { label: 'Tipo', key: 'type' },
      { label: 'Norma / Criterio', key: 'norm' },
      { label: 'Auditor Asignado', key: 'auditor' },
      { label: 'Estado', key: 'status' },
      { label: 'NC', key: 'findings_nc' },
      { label: 'OBS', key: 'findings_obs' },
      { label: 'OM', key: 'findings_om' },
      { label: 'Resumen / Conclusiones', key: 'reportSummary' }
    ];

    const auditsDetailHtml = normalizedAudits.map(a => {
      let isMet = 'Pendiente';
      if (a.status === 'Ejecutada') isMet = 'SÍ';
      else if (a.status === 'Cancelada') isMet = 'NO';
      else if (a.status === 'Reprogramada') isMet = 'Reprogramada';

      const checklistHtml = a.checklist && a.checklist.length > 0 ? a.checklist.map(q => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 6px 4px; color: #475569;">${q.question}</td>
          <td style="padding: 6px 4px; text-align: center; font-weight: bold; color: ${q.complies === 'Cumple' ? '#10b981' : q.complies === 'No Cumple' ? '#ef4444' : q.complies === 'Observación' ? '#f59e0b' : '#64748b'};">${q.complies}</td>
        </tr>
      `).join('') : '<tr><td colspan="2" style="padding: 6px; color: #94a3b8; font-style: italic;">No se definieron preguntas.</td></tr>';

      const ncHtml = a.findings_nc_list && a.findings_nc_list.length > 0 
        ? a.findings_nc_list.map(f => `<li style="margin-bottom: 3px;">${f}</li>`).join('') 
        : '<span style="color: #94a3b8; font-style: italic;">Ninguno</span>';
        
      const obsHtml = a.findings_obs_list && a.findings_obs_list.length > 0 
        ? a.findings_obs_list.map(f => `<li style="margin-bottom: 3px;">${f}</li>`).join('') 
        : '<span style="color: #94a3b8; font-style: italic;">Ninguno</span>';

      const omHtml = a.findings_om_list && a.findings_om_list.length > 0 
        ? a.findings_om_list.map(f => `<li style="margin-bottom: 3px;">${f}</li>`).join('') 
        : '<span style="color: #94a3b8; font-style: italic;">Ninguno</span>';

      return `
        <div style="border: 1px solid #cbd5e1; border-radius: 8px; padding: 15px; margin-bottom: 25px; background: #ffffff; page-break-inside: avoid;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #1e3a8a; padding-bottom: 6px; margin-bottom: 12px;">
            <strong style="font-size: 11px; color: #1e3a8a; font-weight: 800;">Auditoría ${a.type} - ${a.norm}</strong>
            <span style="font-size: 8.5px; padding: 2px 8px; border-radius: 4px; font-weight: bold; background: ${a.status === 'Ejecutada' ? '#d1fae5; color: #065f46;' : a.status === 'Cancelada' ? '#fee2e2; color: #991b1b;' : '#fef3c7; color: #92400e;'};">${a.status}</span>
          </div>

          <table style="width: 100%; font-size: 8px; border-collapse: collapse; margin-bottom: 12px;">
            <tr>
              <td style="width: 25%; padding: 4px 0; font-weight: bold; color: #64748b;">Fecha Programada:</td>
              <td style="width: 25%; padding: 4px 0; color: #0f172a;">${a.date}</td>
              <td style="width: 25%; padding: 4px 0; font-weight: bold; color: #64748b;">¿Cumplió el Programa?:</td>
              <td style="width: 25%; padding: 4px 0; font-weight: bold; color: ${isMet === 'SÍ' ? '#10b981' : isMet === 'NO' ? '#ef4444' : '#f59e0b'};">${isMet}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; font-weight: bold; color: #64748b;">Auditor Asignado:</td>
              <td style="padding: 4px 0; color: #0f172a;">${a.auditor}</td>
              <td style="padding: 4px 0; font-weight: bold; color: #64748b;">Resumen de Hallazgos:</td>
              <td style="padding: 4px 0; color: #0f172a;">NC: ${a.findings_nc || 0} | Obs: ${a.findings_obs || 0} | OM: ${a.findings_om || 0}</td>
            </tr>
          </table>

          <div style="margin-bottom: 12px;">
            <strong style="font-size: 8.5px; color: #1e293b; display: block; margin-bottom: 4px;">Resumen/Conclusiones de la Auditoría:</strong>
            <p style="margin: 0; font-size: 8px; color: #475569; line-height: 1.4; background: #f8fafc; padding: 8px; border-radius: 4px; border-left: 3px solid #cbd5e1;">${a.reportSummary}</p>
          </div>

          <div style="display: flex; gap: 15px;">
            <div style="flex: 1.2;">
              <strong style="font-size: 8.5px; color: #1e293b; display: block; margin-bottom: 6px;">Lista de Verificación (Checklist):</strong>
              <table style="width: 100%; font-size: 7.5px; border-collapse: collapse;">
                <thead>
                  <tr style="background: #f1f5f9; text-align: left; font-weight: bold; border-bottom: 1px solid #cbd5e1;">
                    <th style="padding: 5px 4px; color: #334155;">Pregunta / Requisito Evaluado</th>
                    <th style="padding: 5px 4px; text-align: center; width: 80px; color: #334155;">Cumplimiento</th>
                  </tr>
                </thead>
                <tbody>
                  ${checklistHtml}
                </tbody>
              </table>
            </div>

            <div style="flex: 0.8; font-size: 7.5px; border-left: 1px solid #e2e8f0; padding-left: 15px;">
              <strong style="font-size: 8.5px; color: #1e293b; display: block; margin-bottom: 6px;">Detalle de Hallazgos Registrados:</strong>
              <div style="margin-bottom: 8px;">
                <strong style="color: #ef4444; display: block; margin-bottom: 3px; font-size: 8px;">No Conformidades (NC)</strong>
                <ul style="margin: 0; padding-left: 12px; color: #475569; line-height: 1.3;">${ncHtml}</ul>
              </div>
              <div style="margin-bottom: 8px;">
                <strong style="color: #f59e0b; display: block; margin-bottom: 3px; font-size: 8px;">Observaciones (OBS)</strong>
                <ul style="margin: 0; padding-left: 12px; color: #475569; line-height: 1.3;">${obsHtml}</ul>
              </div>
              <div>
                <strong style="color: #10b981; display: block; margin-bottom: 3px; font-size: 8px;">Oportunidades de Mejora (OM)</strong>
                <ul style="margin: 0; padding-left: 12px; color: #475569; line-height: 1.3;">${omHtml}</ul>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    const scheduleTableHtml = `
      <div style="border: 1px solid #cbd5e1; border-radius: 8px; padding: 15px; background: #ffffff; margin-bottom: 25px;">
        <h4 style="margin: 0 0 10px 0; font-size: 10px; color: #1e293b; text-transform: uppercase; font-weight: 800; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">Cronograma y Estado de Cumplimiento</h4>
        <table style="width: 100%; border-collapse: collapse; font-size: 8px; text-align: left;">
          <thead>
            <tr style="background: #1e3a8a; color: white;">
               <th style="padding: 6px 4px; border: 1px solid #cbd5e1; font-weight: bold; width: 15%;">Fecha Programada</th>
               <th style="padding: 6px 4px; border: 1px solid #cbd5e1; font-weight: bold; width: 12%;">Tipo</th>
               <th style="padding: 6px 4px; border: 1px solid #cbd5e1; font-weight: bold; width: 18%;">Norma / Criterio</th>
               <th style="padding: 6px 4px; border: 1px solid #cbd5e1; font-weight: bold; width: 20%;">Auditor Asignado</th>
               <th style="padding: 6px 4px; border: 1px solid #cbd5e1; font-weight: bold; width: 13%;">Estado</th>
               <th style="padding: 6px 4px; border: 1px solid #cbd5e1; font-weight: bold; text-align: center; width: 12%;">¿Se Cumplió?</th>
               <th style="padding: 6px 4px; border: 1px solid #cbd5e1; font-weight: bold; text-align: center; width: 10%;">NC / OBS / OM</th>
            </tr>
          </thead>
          <tbody>
            ${normalizedAudits.map(a => {
              let isMet = 'Pendiente';
              let colorMet = '#64748b'; // Gray
              if (a.status === 'Ejecutada') {
                isMet = 'SÍ';
                colorMet = '#10b981'; // Green
              } else if (a.status === 'Cancelada') {
                isMet = 'NO';
                colorMet = '#ef4444'; // Red
              } else if (a.status === 'Reprogramada') {
                isMet = 'Reprogramada';
                colorMet = '#f59e0b'; // Yellow
              }

              return `
                <tr>
                  <td style="padding: 5px 4px; border: 1px solid #cbd5e1;">${a.date}</td>
                  <td style="padding: 5px 4px; border: 1px solid #cbd5e1; font-weight: bold;">${a.type}</td>
                  <td style="padding: 5px 4px; border: 1px solid #cbd5e1;">${a.norm}</td>
                  <td style="padding: 5px 4px; border: 1px solid #cbd5e1;">${a.auditor}</td>
                  <td style="padding: 5px 4px; border: 1px solid #cbd5e1;">${a.status}</td>
                  <td style="padding: 5px 4px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; color: ${colorMet};">${isMet}</td>
                  <td style="padding: 5px 4px; border: 1px solid #cbd5e1; text-align: center;">${a.status === 'Ejecutada' ? `${a.findings_nc || 0} / ${a.findings_obs || 0} / ${a.findings_om || 0}` : '-'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;

    const reportHtml = `
      <div style="font-family: system-ui, sans-serif; color: #0f172a; padding: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="margin: 0; font-size: 14px; color: #1e3a8a; font-weight: 800; text-transform: uppercase;">Programa y Cronograma Anual de Auditorías HSEQ</h2>
          <p style="margin: 3px 0 0 0; font-size: 9.5px; color: #64748b;">Sistemas Integrados de Gestión (SGI) - ISO 9001 / ISO 14001 / ISO 45001</p>
        </div>

        <!-- Objetivo del Programa -->
        <div style="margin-bottom: 20px; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; background: #f8fafc;">
          <h4 style="margin: 0 0 6px 0; font-size: 9.5px; color: #1e3a8a; text-transform: uppercase; font-weight: 800; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px;">Objetivo del Programa de Auditorías</h4>
          <p style="margin: 0; font-size: 9px; color: #334155; line-height: 1.4; font-style: italic;">
            "${programObjective}"
          </p>
        </div>

        <!-- Resumen Estadístico -->
        <div style="display: flex; justify-content: space-between; margin-bottom: 20px; gap: 10px; text-align: center;">
          <div style="flex: 1; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px; background: #f8fafc;">
            <span style="font-size: 8px; color: #64748b; text-transform: uppercase; font-weight: bold; display: block; margin-bottom: 3px;">Auditorías Programadas</span>
            <strong style="font-size: 16px; color: #0f172a;">${total}</strong>
          </div>
          <div style="flex: 1; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px; background: #f8fafc;">
            <span style="font-size: 8px; color: #64748b; text-transform: uppercase; font-weight: bold; display: block; margin-bottom: 3px;">Tasa de Cumplimiento</span>
            <strong style="font-size: 16px; color: #10b981;">${cumplimiento}%</strong>
          </div>
          <div style="flex: 1; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px; background: #f8fafc;">
            <span style="font-size: 8px; color: #64748b; text-transform: uppercase; font-weight: bold; display: block; margin-bottom: 3px;">Ejecutadas vs Pendientes</span>
            <strong style="font-size: 16px; color: #0f172a;">${ejecutadas} / ${pendientes}</strong>
          </div>
        </div>

        <!-- Cronograma General -->
        ${scheduleTableHtml}

        <!-- Detalle de Cada Auditoría -->
        <h4 style="margin: 0 0 10px 0; font-size: 10.5px; color: #1e293b; text-transform: uppercase; font-weight: 800; border-bottom: 2px solid #cbd5e1; padding-bottom: 4px; page-break-before: always;">Detalle de Programación y Habilitación Técnica</h4>
        ${auditsDetailHtml}
      </div>
    `;

    setExportConfig({
      isOpen: true,
      exportType: 'excel',
      title: 'Programa y Cronograma de Auditorías HSEQ',
      code: 'SGI-PRG-AUD-001',
      version: '1.0',
      validity: new Date().toLocaleDateString(),
      columns: cols,
      data: normalizedAudits,
      history: [
        { date: new Date().toISOString().split('T')[0], version: '1.0', description: 'Establecimiento y seguimiento del programa de auditorías internas', author: 'Coordinador SGI' }
      ],
      contentHtml: reportHtml
    });
  };

  const selectedAudit = normalizedAudits.find(a => a.id === selectedAuditId);
  const selectedAuditorCV = selectedAudit ? getAuditorCV(selectedAudit.auditor) : null;

  return (
    <>
      <style>{`
        .audit-row {
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        .audit-row:hover {
          background-color: var(--bg-secondary) !important;
        }
        .audit-row.active {
          background-color: var(--bg-tertiary) !important;
          border-left: 3px solid var(--accent-primary) !important;
        }
        
        .cv-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.5rem;
          margin-bottom: 0.75rem;
        }
        .cv-detail-row {
          margin-bottom: 0.6rem;
          font-size: 0.82rem;
        }
        .cv-detail-title {
          font-size: 0.68rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          margin-bottom: 0.15rem;
        }
      `}</style>

      {/* Page Header */}
      <div style={{display:'flex', justifyContent:'space-between', marginBottom:'1.5rem', alignItems:'center', flexWrap:'wrap', gap:'1rem'}}>
        <div>
          <p style={{color:'var(--text-secondary)', marginBottom:'0.25rem'}}>Programa de Auditorías Internas y Externas</p>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>Auditorías Internas (ISO 19011 / 9.2)</h2>
        </div>
        <div style={{display:'flex', gap:'0.5rem', flexWrap:'wrap'}}>
          <button className="btn-secondary" onClick={handleExport}><Download size={16}/> Exportar Programa</button>
          <button className="btn-primary" onClick={() => handleOpenModal()}><Plus size={16}/> Programar Auditoría</button>
        </div>
      </div>

      {/* Objetivo del Programa HSEQ */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem', borderLeft: '4px solid var(--accent-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 500px' }}>
          <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Objetivo del Programa de Auditorías
          </h4>
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.4', fontStyle: 'italic' }}>
            "{programObjective}"
          </p>
        </div>
        <button 
          className="btn-secondary" 
          style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
          onClick={() => {
            const obj = prompt("Edite el objetivo del programa de auditoría:", programObjective);
            if (obj !== null && obj.trim() !== '') setProgramObjective(obj.trim());
          }}
        >
          Editar Objetivo
        </button>
      </div>

      {/* Stats Cards Panel */}
      <div className="grid-3" style={{marginBottom:'1.5rem'}}>
        <div className="card stat-card">
          <div className="stat-icon" style={{background:'rgba(59, 130, 246, 0.1)', color:'var(--accent-primary)'}}>
            <ClipboardList size={24}/>
          </div>
          <div className="stat-info">
            <h3>{total}</h3>
            <p>Auditorías Programadas</p>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{background:'rgba(16, 185, 129, 0.1)', color:'var(--success)'}}>
            <CheckCircle size={24}/>
          </div>
          <div className="stat-info">
            <h3>{cumplimiento}%</h3>
            <p>Cumplimiento del Programa</p>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{background: pendientes > 0 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: pendientes > 0 ? 'var(--warning)' : 'var(--success)'}}>
            <AlertTriangle size={24}/>
          </div>
          <div className="stat-info">
            <h3>{ejecutadas} / {pendientes}</h3>
            <p>Ejecutadas vs Pendientes</p>
          </div>
        </div>
      </div>

      {/* Directory list of audits */}
      <div className="card" style={{padding:0, overflow:'hidden'}}>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Proyecto / Ubicación / Cliente</th>
                <th>Norma / Criterio</th>
                <th>Fecha Programada</th>
                <th>Auditor Asignado</th>
                <th>Estado</th>
                <th>Hallazgos Reportados</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {normalizedAudits.length === 0 ? (
                <tr><td colSpan="8" style={{textAlign:'center', padding:'2rem'}}>No hay auditorías programadas.</td></tr>
              ) : normalizedAudits.map(a => {
                let badgeClass = 'badge-warning';
                if (a.status === 'Ejecutada') badgeClass = 'badge-success';
                else if (a.status === 'Cancelada') badgeClass = 'badge-danger';
                else if (a.status === 'Reprogramada') badgeClass = 'badge-info';

                return (
                  <tr 
                    key={a.id}
                    className={`audit-row ${a.id === selectedAuditId ? 'active' : ''}`}
                    onClick={() => setSelectedAuditId(a.id)}
                  >
                    <td><strong>{a.type}</strong></td>
                    <td>
                      {a.project && <div style={{fontSize:'0.78rem', color:'var(--accent-primary)', fontWeight:600}}>Proy: {a.project}</div>}
                      {a.city && <div style={{fontSize:'0.75rem', color:'var(--text-muted)'}}>Ciudad: {a.city}</div>}
                      {a.client && <div style={{fontSize:'0.75rem', color:'var(--success)'}}>Cliente: {a.client}</div>}
                      {!a.project && !a.city && !a.client && <span style={{color:'var(--text-muted)', fontSize:'0.8rem'}}>-</span>}
                    </td>
                    <td>{a.norm}</td>
                    <td><Calendar size={14} style={{verticalAlign:'middle', marginRight:'4px'}}/> {a.date}</td>
                    <td style={{ fontWeight: 600 }}>{a.auditor}</td>
                    <td><span className={`badge ${badgeClass}`}>{a.status}</span></td>
                    <td>
                      {a.status === 'Ejecutada' ? (
                        <div style={{display:'flex', gap:'0.4rem', fontSize:'0.75rem', flexWrap:'wrap'}}>
                          <span title="No Conformidades" className="badge badge-danger" style={{ fontSize: '0.68rem', padding: '0.1rem 0.35rem' }}>NC: {a.findings_nc || 0}</span>
                          <span title="Observaciones" className="badge badge-warning" style={{ fontSize: '0.68rem', padding: '0.1rem 0.35rem', color: 'black' }}>OBS: {a.findings_obs || 0}</span>
                          <span title="Oportunidades de Mejora" className="badge badge-success" style={{ fontSize: '0.68rem', padding: '0.1rem 0.35rem' }}>OM: {a.findings_om || 0}</span>
                        </div>
                      ) : (
                        <span style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>-</span>
                      )}
                    </td>
                    <td>
                      <div style={{display:'flex', gap:'0.25rem', alignItems:'center'}}>
                        <button className="btn-icon" style={{padding:'0.25rem'}} onClick={(e) => { e.stopPropagation(); handleOpenModal(a); }}><Edit2 size={14}/></button>
                        <button className="btn-icon" style={{padding:'0.25rem', color:'var(--danger)'}} onClick={(e) => { e.stopPropagation(); handleDelete(a.id); }}><Trash2 size={14}/></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SELECTED AUDIT DETAIL SHEET (Loaded under table) */}
      {selectedAudit && (
        <div className="card fade-in" style={{ marginTop: '1.5rem', padding: '1.25rem', borderLeft: '4px solid var(--accent-primary)', marginBottom: '2rem' }}>
          
          {/* Ficha Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <span className="badge badge-info" style={{ marginBottom: '0.25rem', display: 'inline-block' }}><ClipboardList size={10} style={{ marginRight: '4px' }} /> Ficha de Control de Auditoría</span>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>Auditoría {selectedAudit.type} - {selectedAudit.norm}</h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Fecha Planificada: <strong>{selectedAudit.date}</strong> | Auditor: <strong>{selectedAudit.auditor}</strong> | Estado: <span className="badge badge-success" style={{ fontSize: '0.68rem', padding: '0.05rem 0.3rem' }}>{selectedAudit.status}</span>
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button className="btn-secondary" style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem' }} onClick={() => handleOpenModal(selectedAudit)}>
                <Edit2 size={12} style={{ marginRight: '4px' }} /> Editar Auditoría
              </button>
            </div>
          </div>

          {/* Sub tab navigation inside Ficha */}
          <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            <button 
              className={`btn-secondary ${detailTab === 'results' ? 'active' : ''}`}
              style={{ border: 'none', fontSize: '0.8rem', padding: '0.3rem 0.6rem', background: detailTab === 'results' ? 'rgba(14, 165, 233, 0.1)' : 'transparent', color: detailTab === 'results' ? 'var(--accent-primary)' : 'var(--text-secondary)' }}
              onClick={() => setDetailTab('results')}
            >
              <FileText size={12} style={{ marginRight: '3px' }} /> Informe y Resultados
            </button>
            <button 
              className={`btn-secondary ${detailTab === 'checklist' ? 'active' : ''}`}
              style={{ border: 'none', fontSize: '0.8rem', padding: '0.3rem 0.6rem', background: detailTab === 'checklist' ? 'rgba(16, 185, 129, 0.1)' : 'transparent', color: detailTab === 'checklist' ? 'var(--success)' : 'var(--text-secondary)' }}
              onClick={() => setDetailTab('checklist')}
            >
              <CheckSquare size={12} style={{ marginRight: '3px' }} /> Lista de Verificación ({selectedAudit.checklist.length})
            </button>
            <button 
              className={`btn-secondary ${detailTab === 'CV' ? 'active' : ''}`}
              style={{ border: 'none', fontSize: '0.8rem', padding: '0.3rem 0.6rem', background: detailTab === 'CV' ? 'rgba(245, 158, 11, 0.1)' : 'transparent', color: detailTab === 'CV' ? 'var(--warning)' : 'var(--text-secondary)' }}
              onClick={() => setDetailTab('CV')}
            >
              <UserCheck size={12} style={{ marginRight: '3px' }} /> Hoja de Vida del Auditor
            </button>
          </div>

          {/* Tab 1: Results and Reports */}
          {detailTab === 'results' && (
            <div className="grid-2 fade-in" style={{ gap: '1.25rem' }}>
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Resumen del Informe de Auditoría</h4>
                <div style={{ background: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: '6px', border: '1px solid var(--border-color)', minHeight: '120px' }}>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                    {selectedAudit.reportSummary || 'Sin resumen registrado en las conclusiones del informe.'}
                  </p>
                </div>
                {selectedAudit.reportFile && (
                  <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: 0 }}>
                      <Paperclip size={14} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={selectedAudit.reportFile}>
                        {selectedAudit.reportFile}
                      </span>
                    </div>
                    <button 
                      type="button" 
                      className="btn-secondary" 
                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '2px' }}
                      onClick={() => {
                        window.alert(`[HSEQ] Descargando informe soporte de auditoría: "${selectedAudit.reportFile}"`);
                      }}
                    >
                      <Download size={10} /> Descargar Informe
                    </button>
                  </div>
                )}
              </div>

              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Resultados de la Evaluación (Hallazgos)</h4>
                {selectedAudit.status === 'Ejecutada' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    
                    {/* Findings widgets */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                      <div 
                        style={{ 
                          background: activeFindingsTab === 'nc' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(239, 68, 68, 0.04)', 
                          border: activeFindingsTab === 'nc' ? '1.5px solid var(--danger)' : '1px solid rgba(239, 68, 68, 0.15)', 
                          padding: '0.5rem', 
                          borderRadius: '6px', 
                          textAlign: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          transform: activeFindingsTab === 'nc' ? 'scale(1.02)' : 'none'
                        }}
                        onClick={() => setActiveFindingsTab(activeFindingsTab === 'nc' ? null : 'nc')}
                        title="Ver detalle de No Conformidades"
                      >
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--danger)' }}>{selectedAudit.findings_nc || 0}</div>
                        <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--danger)', textTransform: 'uppercase' }}>No Conformidades</div>
                      </div>
                      
                      <div 
                        style={{ 
                          background: activeFindingsTab === 'obs' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(245, 158, 11, 0.04)', 
                          border: activeFindingsTab === 'obs' ? '1.5px solid var(--warning)' : '1px solid rgba(245, 158, 11, 0.15)', 
                          padding: '0.5rem', 
                          borderRadius: '6px', 
                          textAlign: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          transform: activeFindingsTab === 'obs' ? 'scale(1.02)' : 'none'
                        }}
                        onClick={() => setActiveFindingsTab(activeFindingsTab === 'obs' ? null : 'obs')}
                        title="Ver detalle de Observaciones"
                      >
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--warning)' }}>{selectedAudit.findings_obs || 0}</div>
                        <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--warning)', textTransform: 'uppercase' }}>Observaciones</div>
                      </div>
                      
                      <div 
                        style={{ 
                          background: activeFindingsTab === 'om' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(16, 185, 129, 0.04)', 
                          border: activeFindingsTab === 'om' ? '1.5px solid var(--success)' : '1px solid rgba(16, 185, 129, 0.15)', 
                          padding: '0.5rem', 
                          borderRadius: '6px', 
                          textAlign: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          transform: activeFindingsTab === 'om' ? 'scale(1.02)' : 'none'
                        }}
                        onClick={() => setActiveFindingsTab(activeFindingsTab === 'om' ? null : 'om')}
                        title="Ver detalle de Oportunidades de Mejora"
                      >
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--success)' }}>{selectedAudit.findings_om || 0}</div>
                        <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--success)', textTransform: 'uppercase' }}>Oportunidades</div>
                      </div>
                    </div>

                    {/* Collapsible Findings Details List */}
                    {activeFindingsTab && (() => {
                      const findingsList = activeFindingsTab === 'nc' 
                        ? (selectedAudit.findings_nc_list || []) 
                        : activeFindingsTab === 'obs' 
                          ? (selectedAudit.findings_obs_list || []) 
                          : (selectedAudit.findings_om_list || []);

                      return (
                        <div style={{ 
                          marginTop: '0.75rem', 
                          background: 'var(--bg-secondary)', 
                          padding: '0.75rem', 
                          borderRadius: '6px', 
                          border: '1px solid var(--border-color)', 
                          animation: 'fadeIn 0.2s ease-out' 
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                            <h5 style={{ 
                              fontSize: '0.78rem', 
                              fontWeight: 700, 
                              margin: 0, 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '4px', 
                              color: activeFindingsTab === 'nc' ? 'var(--danger)' : activeFindingsTab === 'obs' ? 'var(--warning)' : 'var(--success)' 
                            }}>
                              <AlertCircle size={13} style={{ flexShrink: 0 }} /> 
                              {activeFindingsTab === 'nc' ? 'Desglose de No Conformidades' : activeFindingsTab === 'obs' ? 'Desglose de Observaciones' : 'Desglose de Oportunidades de Mejora'} 
                              ({findingsList.length})
                            </h5>
                            <button 
                              type="button" 
                              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.7rem', cursor: 'pointer', fontWeight: 600 }}
                              onClick={() => setActiveFindingsTab(null)}
                            >
                              Ocultar
                            </button>
                          </div>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', maxHeight: '160px', overflowY: 'auto', paddingRight: '2px' }}>
                            {findingsList.length === 0 ? (
                              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '0.4rem 0' }}>
                                No hay descripciones registradas para esta categoría. Registre una a continuación.
                              </p>
                            ) : (
                              findingsList.map((findingText, idx) => (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: 'var(--bg-primary)', padding: '0.45rem 0.6rem', border: '1px solid var(--border-color)', borderRadius: '6px', gap: '0.5rem' }}>
                                  <span style={{ fontSize: '0.78rem', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                                    <strong>{idx + 1}.</strong> {findingText}
                                  </span>
                                  <button 
                                    type="button" 
                                    className="btn-icon" 
                                    style={{ padding: '2px', color: 'var(--danger)', flexShrink: 0 }}
                                    onClick={() => handleDeleteFinding(activeFindingsTab, idx)}
                                    title="Eliminar hallazgo"
                                  >
                                    <Trash2 size={11} />
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                          
                          <form onSubmit={(e) => handleAddFinding(e, activeFindingsTab)} style={{ display: 'flex', gap: '0.4rem', marginTop: '0.65rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
                            <input 
                              type="text" 
                              placeholder={activeFindingsTab === 'nc' ? "Redactar nueva No Conformidad..." : activeFindingsTab === 'obs' ? "Redactar nueva Observación..." : "Redactar nueva Oportunidad..."}
                              className="form-control" 
                              style={{ flex: 1, fontSize: '0.75rem', padding: '0.25rem 0.5rem' }} 
                              value={newFindingText}
                              onChange={e => setNewFindingText(e.target.value)}
                              required 
                            />
                            <button type="submit" className="btn-primary" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '2px' }}>
                              <Plus size={11} /> Agregar
                            </button>
                          </form>
                        </div>
                      );
                    })()}

                    {/* Action required alert */}
                    {(selectedAudit.findings_nc > 0 || selectedAudit.findings_obs > 0) && (
                      <div style={{ background: 'rgba(239, 68, 68, 0.03)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.65rem', borderRadius: '6px', display: 'flex', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--danger)', marginTop: '0.25rem', alignItems: 'flex-start' }}>
                        <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div>
                          <strong>Compromiso Correctivo Requerido:</strong> Se detectaron hallazgos. Se debe abrir una acción correctiva en el módulo de **Acción y Mejora** para subsanar las desviaciones documentadas en el informe.
                        </div>
                      </div>
                    )}

                  </div>
                ) : (
                  <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '6px', border: '1px solid var(--border-color)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    <Clock size={20} style={{ margin: '0 auto 0.4rem', color: 'var(--text-muted)' }} />
                    La auditoría está programada y aún no se han registrado hallazgos o evaluaciones.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Checklist / Lista de Verificación */}
          {detailTab === 'checklist' && (
            <div className="fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, margin: 0, color: 'var(--text-secondary)' }}>Preguntas de la Lista de Verificación ({selectedAudit.norm})</h4>
                <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>
                  {selectedAudit.checklist.filter(q => q.complies === 'Cumple').length} / {selectedAudit.checklist.length} Cumple
                </span>
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                {/* Scrollable list of verification questions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', maxHeight: '180px', overflowY: 'auto', marginBottom: '0.75rem', paddingRight: '2px' }}>
                  {selectedAudit.checklist.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)', fontSize: '0.78rem', border: '1px dashed var(--border-color)', borderRadius: '6px' }}>
                      No hay preguntas en la lista de verificación. Registre una usando el formulario inferior.
                    </div>
                  ) : (
                    selectedAudit.checklist.map(item => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.45rem 0.65rem', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', gap: '0.5rem' }}>
                        <div style={{ flex: 1, minWidth: 0, fontSize: '0.78rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                          {item.question}
                        </div>
                        
                        {/* Selector de conformidad interactivo */}
                        <div style={{ display: 'flex', gap: '2px', flexShrink: 0, alignItems: 'center' }}>
                          <button 
                            type="button"
                            style={{
                              padding: '0.15rem 0.35rem',
                              fontSize: '0.68rem',
                              borderRadius: '4px 0 0 4px',
                              background: item.complies === 'Cumple' ? 'var(--success)' : 'var(--bg-secondary)',
                              color: item.complies === 'Cumple' ? 'white' : 'var(--text-secondary)',
                              border: '1px solid ' + (item.complies === 'Cumple' ? 'var(--success)' : 'var(--border-color)'),
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                            onClick={() => handleUpdateQuestionCompliance(selectedAudit.id, item.id, 'Cumple')}
                          >
                            Cumple
                          </button>
                          <button 
                            type="button"
                            style={{
                              padding: '0.15rem 0.35rem',
                              fontSize: '0.68rem',
                              borderRadius: '0',
                              background: item.complies === 'No Cumple' ? 'var(--danger)' : 'var(--bg-secondary)',
                              color: item.complies === 'No Cumple' ? 'white' : 'var(--text-secondary)',
                              border: '1px solid ' + (item.complies === 'No Cumple' ? 'var(--danger)' : 'var(--border-color)'),
                              borderLeft: 'none',
                              borderRight: 'none',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                            onClick={() => handleUpdateQuestionCompliance(selectedAudit.id, item.id, 'No Cumple')}
                          >
                            No
                          </button>
                          <button 
                            type="button"
                            style={{
                              padding: '0.15rem 0.35rem',
                              fontSize: '0.68rem',
                              borderRadius: '0 4px 4px 0',
                              background: item.complies === 'Observación' ? 'var(--warning)' : 'var(--bg-secondary)',
                              color: item.complies === 'Observación' ? 'black' : 'var(--text-secondary)',
                              border: '1px solid ' + (item.complies === 'Observación' ? 'var(--warning)' : 'var(--border-color)'),
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                            onClick={() => handleUpdateQuestionCompliance(selectedAudit.id, item.id, 'Observación')}
                          >
                            Obs
                          </button>
                          <button 
                            type="button"
                            className="btn-icon"
                            style={{ padding: '0.15rem', marginLeft: '0.2rem', color: 'var(--danger)' }}
                            onClick={() => handleDeleteChecklistQuestion(selectedAudit.id, item.id)}
                            title="Eliminar pregunta"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>

                      </div>
                    ))
                  )}
                </div>

                {/* Inline Fast Add Checklist Question Form */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.65rem' }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Agregar Pregunta de Control (Checklist)</div>
                  <form onSubmit={(e) => handleAddChecklistQuestion(e, selectedAudit.id)} style={{ display: 'flex', gap: '0.4rem' }}>
                    <input 
                      type="text" 
                      placeholder="Describa el punto de verificación o cláusula legal..." 
                      className="form-control" 
                      style={{ flex: 1, fontSize: '0.78rem', padding: '0.3rem 0.5rem' }} 
                      value={newQuestionText}
                      onChange={e => setNewQuestionText(e.target.value)}
                      required 
                    />
                    <button type="submit" className="btn-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <Plus size={12} /> Registrar
                    </button>
                  </form>
                </div>

              </div>
            </div>
          )}

          {/* Tab 3: Auditor CV / Hoja de Vida */}
          {detailTab === 'CV' && selectedAuditorCV && (
            <div className="fade-in">
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Competencias del Auditor Asignado</h4>
              
              <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <div className="cv-card-header">
                  <div>
                    <span className="badge badge-info" style={{ fontSize: '0.62rem', padding: '0.1rem 0.3rem', marginBottom: '0.2rem', display: 'inline-block' }}><Award size={10} style={{ marginRight: '2px' }} /> Perfil Técnico Certificado</span>
                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{selectedAuditorCV.name}</h4>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{selectedAuditorCV.role}</p>
                  </div>
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '3px' }}
                    onClick={() => {
                      window.alert(`[HSEQ] Descargando Hoja de Vida firmada del auditor: "${selectedAuditorCV.cvFile}"`);
                    }}
                  >
                    <Download size={11} /> Descargar CV (PDF)
                  </button>
                </div>

                <div className="grid-2" style={{ gap: '0.85rem' }}>
                  <div>
                    <div className="cv-detail-row">
                      <div className="cv-detail-title">Educación Profesional</div>
                      <div style={{ color: 'var(--text-primary)' }}>{selectedAuditorCV.education}</div>
                    </div>
                    <div className="cv-detail-row">
                      <div className="cv-detail-title">Certificaciones HSEQ</div>
                      <div style={{ color: 'var(--text-primary)' }}>{selectedAuditorCV.certifications}</div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="cv-detail-row">
                      <div className="cv-detail-title">Experiencia en Auditoría</div>
                      <div style={{ color: 'var(--text-primary)', lineHeight: '1.3' }}>{selectedAuditorCV.experience}</div>
                    </div>
                    <div className="cv-detail-row">
                      <div className="cv-detail-title">Competencias / Habilidades Clave</div>
                      <div style={{ color: 'var(--text-primary)' }}>{selectedAuditorCV.skills}</div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      )}

      {/* REGISTRATION MODAL */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingItem ? "Editar Auditoría" : "Programar Auditoría"}
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
              <label className="form-label">Tipo de Auditoría</label>
              <select className="form-control" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} required>
                <option value="Interna">Interna (1ra Parte)</option>
                <option value="Proveedores">Proveedores (2da Parte)</option>
                <option value="Externa">Externa / Certificación (3ra Parte)</option>
              </select>
            </div>
            <div className="form-group" style={{flex:1}}>
              <label className="form-label">Fecha Programada</label>
              <input type="date" className="form-control" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Norma / Criterio a Evaluar</label>
            <input type="text" className="form-control" value={formData.norm} onChange={e => setFormData({...formData, norm: e.target.value})} required placeholder="Ej: ISO 9001:2015, ISO 14001:2015, RUC..." />
          </div>
          <div className="form-group">
            <label className="form-label">Auditor o Equipo Auditor</label>
            <select className="form-control" value={formData.auditor} onChange={e => setFormData({...formData, auditor: e.target.value})} required>
              <option value="Diego Castro">Diego Castro (Auditor HSEQ Líder Interno)</option>
              <option value="Ente Certificador (SGS)">Ente Certificador (SGS - Externo)</option>
              <option value="Equipo Auditor Interno">Equipo Auditor Interno (SGI Cruzado)</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Estado</label>
            <select className="form-control" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} required>
              <option value="Programada">Programada</option>
              <option value="Ejecutada">Ejecutada</option>
              <option value="Reprogramada">Reprogramada</option>
              <option value="Cancelada">Cancelada</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Resumen de las Conclusiones del Informe</label>
            <textarea className="form-control" value={formData.reportSummary} onChange={e => setFormData({...formData, reportSummary: e.target.value})} rows="2" placeholder="Resumen del desarrollo, conclusiones principales o alcance de la auditoría..."></textarea>
          </div>

          {formData.status === 'Ejecutada' && (
            <div style={{borderTop:'1px solid var(--border-color)', paddingTop:'1rem', marginTop:'0.5rem'}}>
              <h4 style={{fontSize:'0.9rem', marginBottom:'0.75rem', fontWeight: 700, color: 'var(--danger)'}}>Resultados de Hallazgos</h4>
              
              <div style={{display:'flex', gap:'1rem', marginBottom:'1rem'}}>
                <div className="form-group" style={{flex:1}}>
                  <label className="form-label" style={{color:'var(--danger)'}}>No Conformidades (NC)</label>
                  <input type="number" min="0" className="form-control" value={formData.findings_nc} onChange={e => setFormData({...formData, findings_nc: Number(e.target.value)})} />
                </div>
                <div className="form-group" style={{flex:1}}>
                  <label className="form-label" style={{color:'var(--warning)'}}>Observaciones (OBS)</label>
                  <input type="number" min="0" className="form-control" value={formData.findings_obs} onChange={e => setFormData({...formData, findings_obs: Number(e.target.value)})} />
                </div>
                <div className="form-group" style={{flex:1}}>
                  <label className="form-label" style={{color:'var(--success)'}}>Oportunidades (OM)</label>
                  <input type="number" min="0" className="form-control" value={formData.findings_om} onChange={e => setFormData({...formData, findings_om: Number(e.target.value)})} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Subir Informe de Auditoría (Soporte PDF/Word)</label>
                <div style={{display:'flex', alignItems:'center', gap:'0.5rem', background:'var(--bg-secondary)', padding:'0.75rem', borderRadius:'var(--radius-md)', border:'1px dashed var(--border-color)', justifyContent: 'center', cursor: 'pointer'}} onClick={() => document.getElementById('file-upload-audit').click()}>
                  <input 
                    type="file" 
                    id="file-upload-audit" 
                    style={{display:'none'}} 
                    accept=".doc,.docx,.xls,.xlsx,.ppt,.pptx,.pdf,image/*"
                    onChange={handleFileChange}
                  />
                  <Upload size={20} style={{ color: 'var(--text-muted)' }} />
                  <span style={{fontSize:'0.78rem', color: formData.reportFile ? 'var(--success)' : 'var(--text-secondary)', fontWeight: 600}}>
                    {formData.reportFile ? `✓ ${formData.reportFile}` : 'Seleccione archivo del informe de soporte'}
                  </span>
                </div>
              </div>

              {(formData.findings_nc > 0 || formData.findings_obs > 0) && (
                <div style={{background:'rgba(239, 68, 68, 0.05)', padding:'0.75rem', borderRadius:'var(--radius-sm)', border:'1px solid var(--danger)', marginTop:'1rem', fontSize:'0.82rem', color:'var(--danger)', display:'flex', gap:'0.5rem'}}>
                  <AlertCircle size={16} style={{flexShrink:0}}/>
                  <div><strong>Acción Obligatoria:</strong> Al reportar hallazgos de desviación (NC o OBS), recuerde levantar el respectivo Plan de Acción Correctiva en el módulo de Acción y Mejora para su tratamiento normativo.</div>
                </div>
              )}
            </div>
          )}
          
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
        contentHtml={exportConfig.contentHtml}
      />
    </>
  );
}
