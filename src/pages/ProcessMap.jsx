import React, { useState, useEffect } from 'react';
import { 
  Clock, Plus, Trash2, Edit2, FileText, Download, Upload, ShieldAlert, 
  Activity, Users, Settings, ChevronRight, CheckCircle, AlertTriangle, Play, HelpCircle,
  Target, Monitor, Briefcase, ShoppingCart, Wrench, BarChart, Laptop, Scale, Folder
} from 'lucide-react';
import Modal from '../components/Modal';
import ExportModal from '../components/ExportModal';
import { useLocalStorage } from '../hooks/useLocalStorage';

const iconMap = {
  Users: Users,
  Target: Target,
  Monitor: Monitor,
  FileText: FileText,
  Briefcase: Briefcase,
  ShoppingCart: ShoppingCart,
  Wrench: Wrench,
  BarChart: BarChart,
  Laptop: Laptop,
  Scale: Scale,
  Folder: Folder,
  Settings: Settings
};

const ProcessIcon = ({ name, size = 16, className = "" }) => {
  const IconComponent = iconMap[name] || Settings;
  return <IconComponent size={size} className={className} />;
};

const DEFAULT_PROCESSES = [
  { id: 1, name: 'Dirección Administrativa', type: 'Estratégico', leader: 'Director Administrativo', objective: 'Liderar, organizar y coordinar el correcto funcionamiento de las áreas administrativas.', charFile: '', iconName: 'Users', parentId: null },
  { id: 2, name: 'Centro de Control y Seguimiento', type: 'Estratégico', leader: 'Coordinador de Control y Seguimiento', objective: 'Monitorear y evaluar el cumplimiento de las metas y objetivos organizacionales.', charFile: '', iconName: 'Target', parentId: null },
  { id: 3, name: 'Sistemas Integrados de Gestión', type: 'Estratégico', leader: 'Líder HSEQ', objective: 'Asegurar el cumplimiento de los estándares de Calidad, Seguridad, Salud en el Trabajo y Medio Ambiente.', charFile: '', iconName: 'Monitor', parentId: null },
  { id: 4, name: 'Licitaciones y Contrataciones', type: 'Misional', leader: 'Coordinador de Licitaciones', objective: 'Gestionar la participación en convocatorias públicas y privadas para la adjudicación de contratos.', charFile: '', iconName: 'FileText', parentId: null },
  { id: 5, name: 'Gestión de Proyectos', type: 'Misional', leader: 'Gerente de Proyectos', objective: 'Planificar, ejecutar y controlar el desarrollo de los proyectos contratados con eficiencia.', charFile: '', iconName: 'Briefcase', parentId: null },
  { id: 6, name: 'Gestión del Talento Humano', type: 'Apoyo', leader: 'Coordinador de Gestión Humana', objective: 'Garantizar el reclutamiento, bienestar y desarrollo del personal idóneo.', charFile: '', iconName: 'Users', parentId: null },
  { id: 7, name: 'Gestión Logística y Almacén', type: 'Apoyo', leader: 'Jefe de Compras y Almacén', objective: 'Controlar el abastecimiento, distribución y almacenamiento de los recursos y suministros.', charFile: '', iconName: 'ShoppingCart', parentId: null },
  { id: 8, name: 'Mantenimiento de Planta y Equipos', type: 'Apoyo', leader: 'Coordinador de Mantenimiento', objective: 'Garantizar la operatividad y conservación de la infraestructura y maquinaria.', charFile: '', iconName: 'Wrench', parentId: null },
  { id: 9, name: 'Dirección Contable y Financiera', type: 'Apoyo', leader: 'Director Financiero', objective: 'Gestionar los recursos financieros, contables y fiscales de la organización.', charFile: '', iconName: 'BarChart', parentId: null },
  { id: 10, name: 'Departamento de TI', type: 'Apoyo', leader: 'Administrador de Sistemas', objective: 'Soportar y mantener los sistemas de información, redes y equipos tecnológicos.', charFile: '', iconName: 'Laptop', parentId: null },
  { id: 11, name: 'Gestión Jurídica', type: 'Apoyo', leader: 'Asesor Jurídico', objective: 'Asesorar a la empresa en aspectos legales y mitigar riesgos riesgos jurídicos.', charFile: '', iconName: 'Scale', parentId: null },
  { id: 12, name: 'Gestión de Archivo', type: 'Apoyo', leader: 'Encargado de Gestión Documental', objective: 'Organizar, conservar y facilitar el acceso a la información física y digital.', charFile: '', iconName: 'Folder', parentId: null }
];

const getProcessIcon = (process) => {
  if (process.iconName && iconMap[process.iconName]) {
    return process.iconName;
  }
  const name = (process.name || '').toLowerCase();
  if (name.includes('talento') || name.includes('humano') || name.includes('personal')) return 'Users';
  if (name.includes('compras') || name.includes('logística') || name.includes('almacén') || name.includes('proveedor')) return 'ShoppingCart';
  if (name.includes('mantenimiento') || name.includes('planta') || name.includes('equipo') || name.includes('infraestructura')) return 'Wrench';
  if (name.includes('ti') || name.includes('sistemas') || name.includes('tecnología') || name.includes('informática')) return 'Laptop';
  if (name.includes('jurídica') || name.includes('legal') || name.includes('contrato')) return 'Scale';
  if (name.includes('archivo') || name.includes('documento') || name.includes('archivo')) return 'Folder';
  if (name.includes('licitaciones') || name.includes('contratación')) return 'FileText';
  if (name.includes('proyecto') || name.includes('obra')) return 'Briefcase';
  if (name.includes('control') || name.includes('seguimiento') || name.includes('auditoría') || name.includes('indicador')) return 'Target';
  if (name.includes('sig') || name.includes('hseq') || name.includes('calidad') || name.includes('gestión')) return 'Monitor';
  
  if (process.type === 'Estratégico') return 'Target';
  if (process.type === 'Misional') return 'Briefcase';
  if (process.type === 'Apoyo') return 'Settings';
  return 'Settings';
};

export default function ProcessMap() {
  const [processes, setProcesses] = useLocalStorage('sgi_processes', DEFAULT_PROCESSES);

  const [meta, setMeta] = useLocalStorage('sgi_processes_meta', {
    version: 'V.10',
    validity: '2027-06-26',
    lastUpdated: '2026-06-26'
  });

  const [processesHistory, setProcessesHistory] = useLocalStorage('sgi_processes_history', [
    { version: 'V.01', date: '2025-01-10', changes: 'Creación del mapa de procesos inicial.' },
    { version: 'V.02', date: '2025-06-15', changes: 'Ajuste de líderes de proceso y objetivos HSEQ.' },
    { version: 'V.03', date: '2025-11-20', changes: 'Actualización de procesos de apoyo y vinculación de TI.' },
    { version: 'V.04', date: '2026-05-30', changes: 'Revisión periódica anual sin cambios estructurales.' },
    { version: 'V.05', date: '2026-06-26', changes: 'Rediseño del mapa de procesos bajo el esquema PHVA y actualización de procesos de apoyo y estratégicos.' },
    { version: 'V.06', date: '2026-06-26', changes: 'Reclasificación de Dirección General Administrativa como proceso de apoyo posicionado al inicio.' },
    { version: 'V.07', date: '2026-06-26', changes: 'Implementación de jerarquía de subprocesos y corrección de persistencia en localStorage.' },
    { version: 'V.08', date: '2026-06-26', changes: 'Sincronización robusta con Supabase y resolución definitiva de persistencia de cambios.' },
    { version: 'V.09', date: '2026-06-26', changes: 'Re-migración de datos para corregir posicionamiento y clasificación de Dirección General Administrativa.' },
    { version: 'V.10', date: '2026-06-26', changes: 'Restablecimiento de Dirección Administrativa como proceso estratégico y soporte plano original del mapa.' }
  ]);

  const [exportConfig, setExportConfig] = useLocalStorage('sgi_processes_export_config', {
    isOpen: false,
    exportType: 'pdf',
    title: 'Mapa de Procesos y Caracterización HSEQ',
    code: 'SGI-MAP-001',
    version: 'V.10',
    validity: '2026-06-26',
    contentHtml: '',
    history: []
  });

  const [systemDocs, setSystemDocs] = useState([]);
  const [selectedProcess, setSelectedProcess] = useState(processes[0] || null);
  const [activeFichaTab, setActiveFichaTab] = useState('caracterizacion'); // caracterizacion, documentos, indicadores, riesgos

  // Modals status
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProcess, setEditingProcess] = useState(null);
  const [formData, setFormData] = useState({
    name: '', type: 'Misional', leader: '', objective: '', charFile: '', parentId: null
  });

  const [previewProcess, setPreviewProcess] = useState(null);
  // Load documents for linking
  useEffect(() => {
    const savedDocs = localStorage.getItem('sgi_docs');
    if (savedDocs) {
      setSystemDocs(JSON.parse(savedDocs));
    }
  }, []);

  // Migration logic to seed new corporate processes and update document folders
  useEffect(() => {
    if (meta.version !== 'V.10') {
      setProcesses(DEFAULT_PROCESSES);
      setMeta({
        version: 'V.10',
        validity: '2027-06-26',
        lastUpdated: '2026-06-26'
      });

      // Migrate existing documents to new folder names
      const savedDocs = localStorage.getItem('sgi_docs');
      if (savedDocs) {
        try {
          const docsArr = JSON.parse(savedDocs);
          const nameMap = {
            'Direccionamiento Estratégico': 'Dirección General Administrativa',
            'Dirección Administrativa': 'Dirección General Administrativa',
            'Gestión de Calidad': 'Sistemas Integrados de Gestión',
            'Comercial y Ventas': 'Licitaciones y Contrataciones',
            'Producción / Operación': 'Gestión de Proyectos',
            'Talento Humano': 'Gestión del Talento Humano',
            'Gestión TI': 'Departamento de TI'
          };
          let migrated = false;
          const updatedDocs = docsArr.map(doc => {
            if (nameMap[doc.folder]) {
              migrated = true;
              return { ...doc, folder: nameMap[doc.folder] };
            }
            return doc;
          });
          if (migrated) {
            localStorage.setItem('sgi_docs', JSON.stringify(updatedDocs));
            setSystemDocs(updatedDocs);
          }
        } catch (e) {
          console.error("Error migrating documents folder names:", e);
        }
      }

      // Migrate existing risks processes field
      const savedRisks = localStorage.getItem('sgi_risks_iso');
      if (savedRisks) {
        try {
          const risksArr = JSON.parse(savedRisks);
          let migratedRisks = false;
          const updatedRisks = risksArr.map(r => {
            if (r.process === 'Direccionamiento Estratégico' || r.process === 'Dirección Administrativa') {
              migratedRisks = true;
              return { ...r, process: 'Dirección General Administrativa' };
            }
            return r;
          });
          if (migratedRisks) {
            localStorage.setItem('sgi_risks_iso', JSON.stringify(updatedRisks));
          }
        } catch (e) {
          console.error("Error migrating risks processes:", e);
        }
      }
    }
  }, [meta.version]);
  // Update selected process if processes list changes (e.g. edited)
  useEffect(() => {
    if (selectedProcess) {
      const updated = processes.find(p => p.id === selectedProcess.id);
      if (updated) {
        setSelectedProcess(updated);
      } else if (processes.length > 0) {
        setSelectedProcess(processes[0]);
      }
    }
  }, [processes]);

  const est = processes.filter(p => p.type === 'Estratégico' && !p.parentId);
  const eva = processes.filter(p => p.type === 'Evaluación' && !p.parentId);
  const mis = processes.filter(p => p.type === 'Misional' && !p.parentId);
  const apo = processes.filter(p => p.type === 'Apoyo' && !p.parentId);

  const handleOpenModal = (p = null) => {
    if (p) {
      setEditingProcess(p);
      setFormData({
        name: p.name || '',
        type: p.type || 'Misional',
        leader: p.leader || '',
        objective: p.objective || '',
        charFile: p.charFile || '',
        parentId: p.parentId || null
      });
    } else {
      setEditingProcess(null);
      setFormData({ name: '', type: 'Misional', leader: '', objective: '', charFile: '', parentId: null });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    let dataToSave = { ...formData };
    if (dataToSave.parentId) {
      const parent = processes.find(p => p.id === dataToSave.parentId);
      if (parent) {
        dataToSave.type = parent.type;
      }
    }
    if (editingProcess) {
      setProcesses(processes.map(p => p.id === editingProcess.id ? { ...dataToSave, id: p.id } : p));
    } else {
      setProcesses([...processes, { ...dataToSave, id: Date.now() }]);
    }
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Está seguro de eliminar este proceso?")) {
      setProcesses(processes.filter(p => p.id !== id));
    }
  };

  const handleExportPDF = () => {
    const estAndEva = [...est, ...eva];
    const formattedHistory = processesHistory.map(h => ({
      version: h.version,
      date: h.date,
      changes: h.changes
    }));

    const contentHtml = `
      <div style="font-family: Arial, sans-serif; font-size: 11px; line-height: 1.5; color: #1e293b; margin: 15px 0;">
        <h3 style="color: #1e3a8a; border-bottom: 2px solid #1e3a8a; padding-bottom: 5px; margin-bottom: 12px; font-size: 13px; text-transform: uppercase;">
          MAPA DE PROCESOS CORPORATIVOS (PHVA)
        </h3>
        <p style="font-size: 11px; color: #475569; margin-bottom: 15px; line-height: 1.5; text-align: justify;">
          El Sistema de Gestión Integrado (SGI) de la organización se estructura bajo un enfoque basado en procesos alineados con el ciclo PHVA (Planear, Hacer, Verificar, Actuar), clasificándose en Procesos Estratégicos, Procesos Misionales (Cadena de Valor) y Procesos de Apoyo.
        </p>

        <!-- Procesos Estratégicos -->
        <h4 style="color: #ea580c; font-size: 11px; margin-top: 15px; margin-bottom: 6px; font-weight: bold; border-left: 3px solid #f97316; padding-left: 6px; text-transform: uppercase;">
          1. Procesos Estratégicos
        </h4>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; border: 1px solid #334155; font-size: 10px;">
          <thead>
            <tr style="background-color: #fff7ed; color: #ea580c;">
              <th style="border: 1px solid #334155; padding: 6px; font-weight: bold; text-align: left; width: 30%;">Proceso</th>
              <th style="border: 1px solid #334155; padding: 6px; font-weight: bold; text-align: left; width: 25%;">Líder / Responsable</th>
              <th style="border: 1px solid #334155; padding: 6px; font-weight: bold; text-align: left; width: 45%;">Objetivo Principal</th>
            </tr>
          </thead>
          <tbody>
            ${estAndEva.map(p => {
              const subs = processes.filter(sub => sub.parentId === p.id);
              return `
              <tr>
                <td style="border: 1px solid #334155; padding: 6px; font-weight: bold; color: #1e293b;">
                  <div>${p.name}</div>
                  ${subs.length > 0 ? `
                    <div style="font-size: 8px; color: #475569; margin-top: 4px; padding-left: 6px; border-left: 2px dashed #94a3b8; font-weight: normal;">
                      <strong>Subprocesos:</strong> ${subs.map(s => s.name).join(', ')}
                    </div>
                  ` : ''}
                </td>
                <td style="border: 1px solid #334155; padding: 6px;">${p.leader}</td>
                <td style="border: 1px solid #334155; padding: 6px; font-size: 9.5px; color: #475569;">${p.objective}</td>
              </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <!-- Procesos Misionales -->
        <h4 style="color: #1d4ed8; font-size: 11px; margin-top: 15px; margin-bottom: 6px; font-weight: bold; border-left: 3px solid #3b82f6; padding-left: 6px; text-transform: uppercase;">
          2. Procesos Misionales (Cadena de Valor)
        </h4>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; border: 1px solid #334155; font-size: 10px;">
          <thead>
            <tr style="background-color: #eff6ff; color: #1d4ed8;">
              <th style="border: 1px solid #334155; padding: 6px; font-weight: bold; text-align: left; width: 30%;">Proceso</th>
              <th style="border: 1px solid #334155; padding: 6px; font-weight: bold; text-align: left; width: 25%;">Líder / Responsable</th>
              <th style="border: 1px solid #334155; padding: 6px; font-weight: bold; text-align: left; width: 45%;">Objetivo Principal</th>
            </tr>
          </thead>
          <tbody>
            ${mis.map(p => {
              const subs = processes.filter(sub => sub.parentId === p.id);
              return `
              <tr>
                <td style="border: 1px solid #334155; padding: 6px; font-weight: bold; color: #1e293b;">
                  <div>${p.name}</div>
                  ${subs.length > 0 ? `
                    <div style="font-size: 8px; color: #475569; margin-top: 4px; padding-left: 6px; border-left: 2px dashed #94a3b8; font-weight: normal;">
                      <strong>Subprocesos:</strong> ${subs.map(s => s.name).join(', ')}
                    </div>
                  ` : ''}
                </td>
                <td style="border: 1px solid #334155; padding: 6px;">${p.leader}</td>
                <td style="border: 1px solid #334155; padding: 6px; font-size: 9.5px; color: #475569;">${p.objective}</td>
              </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <!-- Procesos de Apoyo -->
        <h4 style="color: #059669; font-size: 11px; margin-top: 15px; margin-bottom: 6px; font-weight: bold; border-left: 3px solid #10b981; padding-left: 6px; text-transform: uppercase;">
          3. Procesos de Apoyo / Soporte
        </h4>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; border: 1px solid #334155; font-size: 10px;">
          <thead>
            <tr style="background-color: #f0fdf4; color: #059669;">
              <th style="border: 1px solid #334155; padding: 6px; font-weight: bold; text-align: left; width: 30%;">Proceso</th>
              <th style="border: 1px solid #334155; padding: 6px; font-weight: bold; text-align: left; width: 25%;">Líder / Responsable</th>
              <th style="border: 1px solid #334155; padding: 6px; font-weight: bold; text-align: left; width: 45%;">Objetivo Principal</th>
            </tr>
          </thead>
          <tbody>
            ${apo.map(p => {
              const subs = processes.filter(sub => sub.parentId === p.id);
              return `
              <tr>
                <td style="border: 1px solid #334155; padding: 6px; font-weight: bold; color: #1e293b;">
                  <div>${p.name}</div>
                  ${subs.length > 0 ? `
                    <div style="font-size: 8px; color: #475569; margin-top: 4px; padding-left: 6px; border-left: 2px dashed #94a3b8; font-weight: normal;">
                      <strong>Subprocesos:</strong> ${subs.map(s => s.name).join(', ')}
                    </div>
                  ` : ''}
                </td>
                <td style="border: 1px solid #334155; padding: 6px;">${p.leader}</td>
                <td style="border: 1px solid #334155; padding: 6px; font-size: 9.5px; color: #475569;">${p.objective}</td>
              </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;

    setExportConfig({
      isOpen: true,
      exportType: 'pdf',
      title: 'Mapa de Procesos Corporativos',
      code: 'SGI-MAP-001',
      version: meta.version,
      validity: meta.validity,
      contentHtml,
      history: formattedHistory
    });
  };

  // Semantic query helpers to load related HSEQ data for selected process
  const getProcessDocs = (proc) => {
    if (!proc) return [];
    // Match documents in the master list whose folder matches the process name
    return systemDocs.filter(doc => doc.folder === proc.name && doc.status !== 'Obsoleto');
  };

  const getProcessIndicators = (proc) => {
    if (!proc) return [];
    const allBsc = JSON.parse(localStorage.getItem('sgi_bsc') || '[]');
    return allBsc.filter(item => {
      const resp = (item.responsible || '').toLowerCase();
      const leader = (proc.leader || '').toLowerCase();
      const procName = proc.name.toLowerCase();
      const obj = (item.obj || '').toLowerCase();
      const kpi = (item.kpi || '').toLowerCase();
      
      // Semantic matching keywords or matching roles
      return resp.includes(leader) || 
             leader.includes(resp) ||
             obj.includes(procName) ||
             kpi.includes(procName) ||
             ((proc.name === 'Direccionamiento Estratégico' || proc.name === 'Dirección Administrativa' || proc.name === 'Dirección General Administrativa') && item.perspective === 'Financiera') ||
             (proc.name === 'Gestión de Calidad' && item.perspective === 'Procesos') ||
             (proc.name === 'Talento Humano' && item.perspective === 'Aprendizaje') ||
             (proc.name === 'Comercial y Ventas' && item.perspective === 'Clientes');
    });
  };

  const getProcessRisks = (proc) => {
    if (!proc) return [];
    const allIsoRisks = JSON.parse(localStorage.getItem('sgi_risks_iso') || '[]');
    const allIsoOpps = JSON.parse(localStorage.getItem('sgi_opportunities_iso') || '[]');
    const allSstRisks = JSON.parse(localStorage.getItem('sgi_risks_sst') || '[]');
    
    const filterFn = (item) => {
      const processField = (item.process || '').toLowerCase();
      const procName = proc.name.toLowerCase();
      const resp = (item.responsible || '').toLowerCase();
      const leader = (proc.leader || '').toLowerCase();
      
      const isDirectMatch = processField.includes(procName) || procName.includes(processField);
      const isNameMismatchSafe = (procName.includes('dirección') && procName.includes('administrativa')) &&
                                 (processField.includes('dirección') && processField.includes('administrativa'));
      
      return isDirectMatch || 
             isNameMismatchSafe ||
             (resp && resp.includes(leader)) ||
             (leader && leader.includes(resp));
    };

    const matchedIso = allIsoRisks.filter(filterFn).map(r => ({ 
      ...r, 
      origin: 'Riesgo Corporativo (ISO)',
      risk: r.description,
      level: r.score > 9 ? 'Alto' : r.score > 4 ? 'Medio' : 'Bajo',
      control: r.treatment
    }));
    
    const matchedOpps = allIsoOpps.filter(filterFn).map(o => ({ 
      ...o, 
      origin: 'Oportunidad Corporativa (ISO)',
      risk: o.description,
      level: o.score >= 10 ? 'Alta Prioridad' : o.score >= 5 ? 'Media Prioridad' : 'Baja Prioridad',
      control: o.treatment
    }));

    const matchedSst = allSstRisks.filter(filterFn).map(r => ({ ...r, origin: 'Peligro/Riesgo Ocupacional (SST)' }));
    
    return [...matchedIso, ...matchedOpps, ...matchedSst];
  };

  const currentDocs = getProcessDocs(selectedProcess);
  const currentIndicators = getProcessIndicators(selectedProcess);
  const currentRisks = getProcessRisks(selectedProcess);

  const getRiskColor = (level) => {
    const l = (level || '').toLowerCase();
    if (l === 'crítico' || l === 'extremo' || l === 'alto') return 'badge-danger';
    if (l === 'medio' || l === 'moderado' || l === 'media prioridad') return 'badge-warning';
    if (l === 'alta prioridad') return 'badge-info';
    return 'badge-success';
  };

  const ProcessNode = ({ process, typeClass }) => {
    const isSelected = selectedProcess?.id === process.id;
    const iconName = getProcessIcon(process);
    
    // Find sub-processes under this process
    const subProcesses = processes.filter(p => p.parentId === process.id);
    
    return (
      <div 
        className={`process-node-item ${typeClass} ${isSelected ? 'selected' : ''}`} 
        onClick={() => setSelectedProcess(process)}
        title="Haga clic para ver resumen y ficha técnica"
        style={{ minHeight: subProcesses.length > 0 ? 'auto' : '85px', padding: '0.8rem 0.6rem', width: '100%' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', justifyContent: 'center' }}>
          <div className={`node-icon-circle ${typeClass}`}>
            <ProcessIcon name={iconName} size={16} />
          </div>
          <span className="node-name" style={{ wordBreak: 'break-word' }}>{process.name}</span>
        </div>

        {subProcesses.length > 0 && (
          <div style={{ 
            marginTop: '0.65rem', 
            borderTop: '1px dashed var(--border-color)', 
            paddingTop: '0.5rem', 
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
            textAlign: 'left'
          }}>
            {subProcesses.map(sub => {
              const subIcon = getProcessIcon(sub);
              const isSubSelected = selectedProcess?.id === sub.id;
              return (
                <div 
                  key={sub.id}
                  onClick={(e) => {
                    e.stopPropagation(); // Evitar seleccionar el proceso padre
                    setSelectedProcess(sub);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '5px 8px',
                    borderRadius: 'var(--radius-sm)',
                    background: isSubSelected ? 'var(--bg-secondary)' : 'var(--bg-primary)',
                    border: `1px solid ${isSubSelected ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                    cursor: 'pointer',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    transition: 'all 0.15s ease'
                  }}
                  title={`Subproceso: ${sub.name}. Haga clic para ver detalles.`}
                >
                  <ProcessIcon name={subIcon} size={12} className={typeClass} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-primary)' }}>{sub.name}</span>
                </div>
              );
            })}
          </div>
        )}
        
        {process.charFile && (
          <div className="node-char-badge" title="Ficha de caracterización vinculada">
            <FileText size={10} />
          </div>
        )}
      </div>
    );
  };

  const renderSupportProcesses = () => {
    if (apo.length === 0) {
      return <span style={{color:'var(--text-muted)', fontSize:'0.8rem', textAlign:'center', display:'block'}}>Sin procesos de apoyo</span>;
    }

    if (apo.length === 7) {
      return (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="support-row-5">
            {apo.slice(0, 5).map(p => (
              <ProcessNode key={p.id} process={p} typeClass="support" />
            ))}
          </div>
          <div className="support-row-2">
            {apo.slice(5).map(p => (
              <div key={p.id}>
                <ProcessNode key={p.id} process={p} typeClass="support" />
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (apo.length === 1) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <div style={{ width: '280px' }}>
            <ProcessNode process={apo[0]} typeClass="support" />
          </div>
        </div>
      );
    }

    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem', width: '100%' }}>
        {apo.map(p => (
          <ProcessNode key={p.id} process={p} typeClass="support" />
        ))}
      </div>
    );
  };

  return (
    <>
      <style>{`
        /* Custom Process Map Layout Styles */
        .process-map-layout {
          display: flex;
          gap: 1.5rem;
          width: 100%;
          min-width: 1000px;
          margin-bottom: 2rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          box-shadow: var(--shadow-sm);
          overflow-x: auto;
        }

        .vertical-pillar {
          width: 65px;
          background: linear-gradient(180deg, #1e3a8a 0%, #3b82f6 50%, #1e3a8a 100%);
          color: white;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 0;
          box-shadow: var(--shadow-md);
          border: 1px solid rgba(255, 255, 255, 0.1);
          flex-shrink: 0;
        }

        .pillar-cap {
          width: 44px;
          height: 44px;
          background: #1e40af;
          color: white;
          font-weight: 800;
          font-size: 1.3rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
          box-shadow: 0 4px 6px rgba(0,0,0,0.15);
          user-select: none;
        }

        .pillar-cap.top-cap {
          clip-path: polygon(50% 0%, 100% 35%, 100% 100%, 0% 100%, 0% 35%);
        }

        .pillar-cap.bottom-cap {
          clip-path: polygon(0% 0%, 100% 0%, 100% 65%, 50% 100%, 0% 65%);
        }

        .pillar-text-container {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pillar-text {
          writing-mode: vertical-rl;
          transform: rotate(180deg);
          text-align: center;
          font-weight: 700;
          font-size: 0.72rem;
          letter-spacing: 1.5px;
          color: rgba(255, 255, 255, 0.95);
          text-transform: uppercase;
          max-height: 380px;
          line-height: 1.4;
          padding: 1rem 0;
        }

        /* Flow Central Box */
        .flow-middle-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          justify-content: space-between;
        }

        .flow-row-outer {
          display: flex;
          align-items: center;
          width: 100%;
        }

        /* Arrow connections */
        .flow-arrow-horizontal {
          width: 32px;
          height: 18px;
          background-color: #2563eb;
          clip-path: polygon(0% 20%, 60% 20%, 60% 0%, 100% 50%, 60% 100%, 60% 80%, 0% 80%);
          margin: 0 0.5rem;
          flex-shrink: 0;
        }

        .flow-arrow-down-orange {
          width: 18px;
          height: 24px;
          background-color: #f97316;
          clip-path: polygon(20% 0%, 80% 0%, 80% 55%, 100% 55%, 50% 100%, 0% 55%, 20% 55%);
          margin: 0.15rem auto;
        }

        .flow-arrow-up-green {
          width: 18px;
          height: 24px;
          background-color: #10b981;
          clip-path: polygon(50% 0%, 100% 45%, 80% 45%, 80% 100%, 20% 100%, 20% 45%, 0% 45%);
          margin: 0.15rem auto;
        }

        /* Process Category Cards */
        .category-block {
          flex: 1;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: var(--shadow-sm);
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
        }

        .category-block.strategic { border-color: rgba(249, 115, 22, 0.3); }
        .category-block.misional { border-color: rgba(59, 130, 246, 0.4); border-width: 2px; }
        .category-block.support { border-color: rgba(16, 185, 129, 0.3); }

        .category-header {
          padding: 0.5rem 1rem;
          font-weight: 700;
          font-size: 0.85rem;
          color: white;
          text-align: center;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .category-header.strategic { background: linear-gradient(90deg, #ea580c 0%, #f97316 100%); }
        .category-header.misional { background: linear-gradient(90deg, #1d4ed8 0%, #3b82f6 100%); }
        .category-header.support { background: linear-gradient(90deg, #059669 0%, #10b981 100%); }

        .category-content {
          padding: 1rem;
        }
        .category-content.strategic { background: rgba(249, 115, 22, 0.02); }
        .category-content.misional { background: rgba(59, 130, 246, 0.01); }
        .category-content.support { background: rgba(16, 185, 129, 0.02); }

        /* Grid layouts */
        .strategic-grid {
          display: flex;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .strategic-grid > div {
          flex: 1 1 200px;
          max-width: 250px;
        }

        .misional-stack {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .support-grid-container {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .support-row-5 {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 0.75rem;
        }

        .support-row-2 {
          display: flex;
          justify-content: center;
          gap: 1rem;
        }

        .support-row-2 > div {
          width: calc(20% - 0.6rem); /* Align width with the 5-column grid above */
          min-width: 150px;
        }

        /* Node Cards styling */
        .process-node-item {
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 0.8rem 0.6rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          cursor: pointer;
          transition: all 0.2s ease-in-out;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          position: relative;
          text-align: center;
          min-height: 85px;
        }

        .process-node-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.08);
        }

        .process-node-item.selected {
          background: var(--bg-secondary);
        }

        /* Border highlights based on categories */
        .process-node-item.strategic { border-color: rgba(249, 115, 22, 0.2); }
        .process-node-item.strategic.selected {
          border-color: #f97316;
          box-shadow: 0 0 8px rgba(249, 115, 22, 0.2);
        }

        .process-node-item.misional { border-color: rgba(59, 130, 246, 0.2); }
        .process-node-item.misional.selected {
          border-color: #3b82f6;
          box-shadow: 0 0 8px rgba(59, 130, 246, 0.2);
        }

        .process-node-item.support { border-color: rgba(16, 185, 129, 0.2); }
        .process-node-item.support.selected {
          border-color: #10b981;
          box-shadow: 0 0 8px rgba(16, 185, 129, 0.2);
        }

        /* Circular Icon containers */
        .node-icon-circle {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .node-icon-circle.strategic { background: rgba(249, 115, 22, 0.1); color: #ea580c; }
        .node-icon-circle.misional { background: rgba(59, 130, 246, 0.1); color: #1d4ed8; }
        .node-icon-circle.support { background: rgba(16, 185, 129, 0.1); color: #059669; }

        .node-name {
          font-size: 0.76rem;
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.3;
          flex: none;
          text-align: center;
        }

        .node-char-badge {
          position: absolute;
          top: -6px;
          right: -6px;
          background: var(--bg-primary);
          color: #3b82f6;
          border: 1px solid var(--border-color);
          border-radius: 50%;
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow-sm);
        }

        /* Ficha section */
        .ficha-tab-btn {
          border: none;
          background: transparent;
          color: var(--text-secondary);
          font-size: 0.85rem;
          font-weight: 600;
          padding: 0.5rem 1rem;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all 0.2s;
        }

        .ficha-tab-btn.active {
          color: var(--accent-primary);
          border-bottom-color: var(--accent-primary);
        }

        .ficha-tab-btn:hover {
          color: var(--text-primary);
        }

        /* Details list */
        .details-list-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.65rem 0.75rem;
          border-bottom: 1px solid var(--border-color);
          font-size: 0.85rem;
        }

        .details-list-item:last-child {
          border-bottom: none;
        }
      `}</style>

      <div style={{display:'flex', justifyContent:'space-between', marginBottom:'1.5rem', alignItems:'center', flexWrap:'wrap', gap:'1rem'}}>
        <div>
          <p style={{color:'var(--text-secondary)', marginBottom:'0.25rem'}}>Mapa de Procesos Corporativos</p>
          <div style={{display:'flex', gap:'0.5rem', alignItems:'center'}}>
            <span className="badge badge-info"><Clock size={12} style={{marginRight:'4px'}}/> Último Cambio: {meta.lastUpdated}</span>
            <span style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>| <strong>Versión SGI:</strong> {meta.version}</span>
            <span style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>| <strong>Vigencia:</strong> {meta.validity}</span>
          </div>
        </div>
        <div style={{display:'flex', gap:'0.5rem'}}>
          <button className="btn-secondary" onClick={handleExportPDF}><Download size={16}/> Exportar Mapa</button>
          <button className="btn-primary" onClick={() => handleOpenModal()}><Plus size={16}/> Registrar Proceso</button>
        </div>
      </div>
      
      {/* Premium visual map */}
      <div className="process-map-layout fade-in">
        {/* Left vertical pillar */}
        <div className="vertical-pillar">
          <div className="pillar-cap top-cap">P</div>
          <div className="pillar-text-container">
            <div className="pillar-text">Necesidades y Expectativas de las Partes Interesadas</div>
          </div>
          <div className="pillar-cap bottom-cap">A</div>
        </div>

        {/* Central Flow blocks */}
        <div className="flow-middle-container">
          
          {/* Strategic Row */}
          <div className="flow-row-outer">
            <div style={{ width: '48px', flexShrink: 0 }}></div> {/* Left space placeholder */}
            <div className="category-block strategic">
              <div className="category-header strategic">Procesos Estratégicos</div>
              <div className="category-content strategic">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', width: '100%' }}>
                  {[...est, ...eva].length > 0 ? (
                    [...est, ...eva].map(p => <ProcessNode key={p.id} process={p} typeClass="strategic" />)
                  ) : (
                    <span style={{color:'var(--text-muted)', fontSize:'0.8rem', textAlign:'center', width:'100%'}}>Sin procesos definidos</span>
                  )}
                </div>
              </div>
            </div>
            <div style={{ width: '48px', flexShrink: 0 }}></div> {/* Right space placeholder */}
          </div>

          <div className="flow-arrow-down-orange"></div>

          {/* Misional Row */}
          <div className="flow-row-outer">
            <div className="flow-arrow-horizontal"></div> {/* Connection arrow from left pillar */}
            <div className="category-block misional">
              <div className="category-header misional">Procesos Misionales</div>
              <div className="category-content misional">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', width: '100%' }}>
                  {mis.length > 0 ? (
                    mis.map(p => <ProcessNode key={p.id} process={p} typeClass="misional" />)
                  ) : (
                    <span style={{color:'var(--text-muted)', fontSize:'0.8rem', textAlign:'center', width:'100%'}}>Sin procesos operativos</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flow-arrow-horizontal"></div> {/* Connection arrow to right pillar */}
          </div>

          <div className="flow-arrow-up-green"></div>

          {/* Support Row */}
          <div className="flow-row-outer">
            <div style={{ width: '48px', flexShrink: 0 }}></div> {/* Left space placeholder */}
            <div className="category-block support">
              <div className="category-header support">Procesos de Apoyo</div>
              <div className="category-content support">
                {renderSupportProcesses()}
              </div>
            </div>
            <div style={{ width: '48px', flexShrink: 0 }}></div> {/* Right space placeholder */}
          </div>

        </div>

        {/* Right vertical pillar */}
        <div className="vertical-pillar">
          <div className="pillar-cap top-cap">H</div>
          <div className="pillar-text-container">
            <div className="pillar-text">Satisfacción de las Partes Interesadas</div>
          </div>
          <div className="pillar-cap bottom-cap">V</div>
        </div>
      </div>

      {/* DYNAMIC SELECTED PROCESS DETAIL PANEL */}
      {selectedProcess && (
        <div className="card fade-in" style={{ padding: '1.5rem', borderLeft: `5px solid ${selectedProcess.type === 'Estratégico' || selectedProcess.type === 'Evaluación' ? '#f97316' : selectedProcess.type === 'Misional' ? '#3b82f6' : '#10b981'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Ficha de Control e Integración HSEQ</span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginTop: '0.15rem' }}>
                <Settings size={18} color={selectedProcess.type === 'Estratégico' || selectedProcess.type === 'Evaluación' ? '#ea580c' : selectedProcess.type === 'Misional' ? '#1d4ed8' : '#059669'} /> {selectedProcess.name}
              </h3>
            </div>
            
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button className="btn-secondary" style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }} onClick={() => handleOpenModal(selectedProcess)}>
                <Edit2 size={12} /> Editar Proceso
              </button>
              <button className="btn-secondary" style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => handleDelete(selectedProcess.id)}>
                <Trash2 size={12} /> Eliminar
              </button>
            </div>
          </div>

          {/* Ficha Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)' }}>
            <button className={`ficha-tab-btn ${activeFichaTab === 'caracterizacion' ? 'active' : ''}`} onClick={() => setActiveFichaTab('caracterizacion')}>
              Ficha Técnica
            </button>
            <button className={`ficha-tab-btn ${activeFichaTab === 'documentos' ? 'active' : ''}`} onClick={() => setActiveFichaTab('documentos')}>
              Documentos ({currentDocs.length})
            </button>
            <button className={`ficha-tab-btn ${activeFichaTab === 'indicadores' ? 'active' : ''}`} onClick={() => setActiveFichaTab('indicadores')}>
              Indicadores BSC ({currentIndicators.length})
            </button>
            <button className={`ficha-tab-btn ${activeFichaTab === 'riesgos' ? 'active' : ''}`} onClick={() => setActiveFichaTab('riesgos')}>
              Riesgos HSEQ ({currentRisks.length})
            </button>
          </div>

          {/* Tab Content Rendering */}
          <div style={{ minHeight: '180px' }}>
            {/* CARACTERIZACION TAB */}
            {activeFichaTab === 'caracterizacion' && (
              <div className="grid-2 fade-in" style={{ gap: '2rem' }}>
                <div>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <strong style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Líder / Dueño del Proceso:</strong>
                    <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>{selectedProcess.leader}</span>
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Objetivo del Proceso:</strong>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginTop: '0.25rem' }}>{selectedProcess.objective}</p>
                  </div>
                </div>

                <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <strong style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Documento de Caracterización:</strong>
                  {selectedProcess.charFile ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-primary)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                      <FileText size={24} color="var(--accent-primary)" />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedProcess.charFile}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Ficha Oficial Vinculada</div>
                      </div>
                      <button className="btn-icon" onClick={() => alert('Simulando descarga...')} title="Descargar Ficha"><Download size={14} /></button>
                    </div>
                  ) : (
                    <div style={{ background: 'var(--bg-primary)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-color)', textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      No se ha enlazado ficha de caracterización.
                      <button className="btn-primary" style={{ display: 'flex', margin: '0.5rem auto 0 auto', padding: '0.35rem 0.65rem', fontSize: '0.75rem' }} onClick={() => handleOpenModal(selectedProcess)}>
                        <Upload size={12} /> Vincular Archivo
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* DOCUMENTOS TAB */}
            {activeFichaTab === 'documentos' && (
              <div className="fade-in">
                {currentDocs.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <FileText size={28} style={{ margin: '0 auto 0.5rem auto', display: 'block', color: 'var(--text-muted)' }} />
                    No hay documentos creados en la carpeta <strong>"{selectedProcess.name}"</strong>.
                    <p style={{ fontSize: '0.78rem', marginTop: '0.25rem' }}>Para agregar, dirígete al módulo de <strong>Documentación del Sistema</strong> e inserta un archivo asignándolo a este proceso.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                    {currentDocs.map(doc => (
                      <div key={doc.id} className="details-list-item">
                        <div>
                          <strong style={{ color: 'var(--text-primary)' }}>{doc.code}</strong> - {doc.name}
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '6px' }}>({doc.type})</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                          <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>{doc.status}</span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>V. {doc.version}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* INDICADORES TAB */}
            {activeFichaTab === 'indicadores' && (
              <div className="fade-in">
                {currentIndicators.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <Activity size={28} style={{ margin: '0 auto 0.5rem auto', display: 'block', color: 'var(--text-muted)' }} />
                    No hay indicadores del Balanced Scorecard (BSC) vinculados a este proceso.
                    <p style={{ fontSize: '0.78rem', marginTop: '0.25rem' }}>Puedes formular un objetivo estratégico de tipo <strong>"{selectedProcess.type}"</strong> asignándole al líder del proceso.</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    {currentIndicators.map(ind => {
                      let progress = (ind.actual / ind.target) * 100;
                      let color = 'var(--success)';
                      if (ind.perspective === 'Procesos' && ind.actual > ind.target) {
                        progress = (ind.target / ind.actual) * 100;
                        color = 'var(--danger)';
                      } else if (progress < 70) {
                        color = 'var(--danger)';
                      } else if (progress < 95) {
                        color = 'var(--warning)';
                      }
                      progress = Math.min(100, Math.max(0, progress));

                      return (
                        <div key={ind.id} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                            <span>{ind.perspective}</span>
                            <span>Resp: {ind.responsible}</span>
                          </div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{ind.obj}</div>
                          
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                            <span>KPI: {ind.kpi}</span>
                            <strong>Actual: {ind.actual}{ind.unit} / Meta: {ind.target}{ind.unit}</strong>
                          </div>
                          
                          <div className="progress-bar" style={{ height: '6px' }}>
                            <div className="progress-fill" style={{ width: `${progress}%`, background: color }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* RIESGOS TAB */}
            {activeFichaTab === 'riesgos' && (
              <div className="fade-in">
                {currentRisks.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <ShieldAlert size={28} style={{ margin: '0 auto 0.5rem auto', display: 'block', color: 'var(--text-muted)' }} />
                    No hay riesgos o peligros identificados asociados a este proceso.
                    <p style={{ fontSize: '0.78rem', marginTop: '0.25rem' }}>Para agregar un riesgo, puedes registrarlo en la matriz de <strong>Riesgos ISO 31000</strong> o <strong>Peligros GTC 45 (SST)</strong> vinculándolo a este proceso.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                    {currentRisks.map((risk, idx) => (
                      <div key={risk.id || idx} className="details-list-item">
                        <div>
                          <strong style={{ color: 'var(--accent-primary)', fontSize: '0.75rem', display: 'block', textTransform: 'uppercase', marginBottom: '2px' }}>{risk.origin}</strong>
                          <span style={{ fontWeight: 500 }}>{risk.risk || risk.danger || 'Riesgo sin especificar'}</span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '8px' }}>- Control: {risk.control || risk.currentControls || 'No definido'}</span>
                        </div>
                        <div>
                          <span className={`badge ${getRiskColor(risk.level || risk.riskLevel || 'Bajo')}`}>
                            {risk.level || risk.riskLevel || 'Bajo'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* EDIT/NEW PROCESS MODAL */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingProcess ? "Editar Proceso" : "Nuevo Proceso"}
      >
        <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
          <div className="form-group">
            <label className="form-label">Nombre del Proceso</label>
            <input type="text" className="form-control" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="Ej: Talento Humano, Compras..." />
          </div>
          <div className="form-group">
            <label className="form-label">Proceso Padre (Opcional - para crear subproceso)</label>
            <select 
              className="form-control" 
              value={formData.parentId || ''} 
              onChange={e => setFormData({...formData, parentId: e.target.value ? parseInt(e.target.value) : null})}
            >
              <option value="">-- Ninguno (Proceso Principal) --</option>
              {processes
                .filter(p => p.id !== editingProcess?.id && !p.parentId)
                .map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.type})</option>
                ))
              }
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Tipo de Proceso</label>
            <select className="form-control" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} required disabled={!!formData.parentId}>
              <option value="Estratégico">Estratégico</option>
              <option value="Misional">Misional / Operativo</option>
              <option value="Apoyo">Apoyo / Soporte</option>
              <option value="Evaluación">Evaluación y Control</option>
            </select>
            {formData.parentId && <small style={{color:'var(--text-muted)', display: 'block', marginTop: '2px'}}>El tipo se hereda del proceso padre.</small>}
          </div>
          <div className="form-group">
            <label className="form-label">Líder del Proceso (Cargo)</label>
            <input type="text" className="form-control" value={formData.leader} onChange={e => setFormData({...formData, leader: e.target.value})} required placeholder="Ej: Gerente de Calidad, Jefe de Operaciones..." />
          </div>
          <div className="form-group">
            <label className="form-label">Objetivo Principal del Proceso</label>
            <textarea className="form-control" value={formData.objective} onChange={e => setFormData({...formData, objective: e.target.value})} rows="3" required placeholder="Describa el propósito y alcance del proceso..."></textarea>
          </div>
          <div style={{borderTop:'1px solid var(--border-color)', paddingTop:'1rem', marginTop:'0.5rem'}}>
            <h4 style={{fontSize:'0.9rem', marginBottom:'0.5rem', fontWeight: 600}}>Caracterización / Ficha del Proceso</h4>
            <div className="form-group">
              <label className="form-label">Documento Asociado (Desde Control Documental)</label>
              {systemDocs.filter(d => d.folder === formData.name && d.status !== 'Obsoleto').length > 0 ? (
                <select className="form-control" value={formData.charFile} onChange={e => setFormData({...formData, charFile: e.target.value})}>
                  <option value="">-- No vincular ningún documento --</option>
                  {systemDocs.filter(d => d.folder === formData.name && d.status !== 'Obsoleto').map(doc => (
                    <option key={doc.id} value={doc.name}>{doc.code} - {doc.name} ({doc.type})</option>
                  ))}
                </select>
              ) : (
                <div style={{background:'var(--bg-primary)', padding:'0.75rem', borderRadius:'var(--radius-sm)', border:'1px dashed var(--border-color)', fontSize:'0.82rem', color:'var(--text-muted)'}}>
                  No hay documentos creados bajo la carpeta <strong>"{formData.name || 'este proceso'}"</strong> en el Explorador de Archivos.
                </div>
              )}
              <small style={{color:'var(--text-muted)', display: 'block', marginTop: '0.25rem'}}>Deje en blanco si no tiene un archivo digital registrado aún.</small>
            </div>
          </div>
          <div style={{display:'flex', justifyContent:'flex-end', gap:'0.5rem', marginTop:'1rem'}}>
            <button type="button" className="btn-secondary" onClick={handleCloseModal}>Cancelar</button>
            <button type="submit" className="btn-primary">{editingProcess ? "Actualizar" : "Guardar"}</button>
          </div>
        </form>
      </Modal>

      {/* Modal Previsualización Caracterización */}
      <Modal 
        isOpen={!!previewProcess} 
        onClose={() => setPreviewProcess(null)} 
        title={`Caracterización: ${previewProcess?.name}`}
      >
        {previewProcess && (
          <div style={{display:'flex', flexDirection:'column', gap:'1.5rem', alignItems:'center', padding:'2rem 0'}}>
            {previewProcess.charFile ? (
              <>
                <FileText size={48} style={{color:'var(--info)'}}/>
                <div style={{textAlign:'center'}}>
                  <p style={{fontSize:'1.1rem', fontWeight:600, marginBottom:'0.5rem'}}>{previewProcess.charFile}</p>
                  <p style={{color:'var(--text-secondary)', fontSize:'0.9rem'}}>El archivo está adjunto y disponible para descarga o visualización completa.</p>
                </div>
                <div style={{display:'flex', gap:'1rem'}}>
                  <button className="btn-secondary" onClick={() => alert('Simulando descarga...')}>
                    <Download size={16}/> Descargar
                  </button>
                </div>
              </>
            ) : (
              <>
                <FileText size={48} style={{color:'var(--text-muted)'}}/>
                <div style={{textAlign:'center'}}>
                  <p style={{fontSize:'1.1rem', fontWeight:600, marginBottom:'0.5rem'}}>No hay archivo de caracterización</p>
                  <p style={{color:'var(--text-secondary)', fontSize:'0.9rem'}}>El administrador aún no ha cargado la ficha de este proceso.</p>
                </div>
                <button className="btn-primary" onClick={() => { setEditingProcess(previewProcess); setFormData(previewProcess); setPreviewProcess(null); setIsModalOpen(true); }}>
                  <Upload size={16}/> Subir / Enlazar Ficha
                </button>
              </>
            )}
            
            <div style={{width:'100%', borderTop:'1px solid var(--border-color)', marginTop:'1rem', paddingTop:'1rem'}}>
              <h4 style={{fontSize:'0.9rem', marginBottom:'0.5rem'}}>Resumen del Proceso</h4>
              <p style={{fontSize:'0.85rem'}}><strong>Líder:</strong> {previewProcess.leader}</p>
              <p style={{fontSize:'0.85rem'}}><strong>Objetivo:</strong> {previewProcess.objective}</p>
            </div>
          </div>
        )}
      </Modal>

      <ExportModal
        isOpen={exportConfig.isOpen}
        onClose={() => setExportConfig({ ...exportConfig, isOpen: false })}
        exportType={exportConfig.exportType}
        defaultTitle={exportConfig.title}
        defaultCode={exportConfig.code}
        defaultVersion={exportConfig.version}
        defaultValidity={exportConfig.validity}
        contentHtml={exportConfig.contentHtml}
        history={exportConfig.history}
      />
    </>
  );
}
