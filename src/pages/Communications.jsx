import React, { useState } from 'react';
import { 
  MessageSquare, Plus, Search, Edit2, Trash2, Download, Info, CheckCircle, 
  Layers, Send, User, Calendar, Cpu, Compass
} from 'lucide-react';
import Modal from '../components/Modal';
import ExportModal from '../components/ExportModal';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAppUsers } from '../hooks/useAppUsers';

const DEFAULT_PROCESSES = [
  { id: 1, name: 'Dirección Administrativa', type: 'Estratégico' },
  { id: 2, name: 'Centro de Control y Seguimiento', type: 'Estratégico' },
  { id: 3, name: 'Sistemas Integrados de Gestión', type: 'Estratégico' },
  { id: 4, name: 'Licitaciones y Contrataciones', type: 'Misional' },
  { id: 5, name: 'Gestión de Proyectos', type: 'Misional' },
  { id: 6, name: 'Gestión del Talento Humano', type: 'Apoyo' },
  { id: 7, name: 'Gestión Logística y Almacén', type: 'Apoyo' },
  { id: 8, name: 'Mantenimiento de Planta y Equipos', type: 'Apoyo' },
  { id: 9, name: 'Dirección Contable y Financiera', type: 'Apoyo' },
  { id: 10, name: 'Departamento de TI', type: 'Apoyo' },
  { id: 11, name: 'Gestión Jurídica', type: 'Apoyo' },
  { id: 12, name: 'Gestión de Archivo', type: 'Apoyo' }
];

const DEFAULT_COMMUNICATIONS = [
  // Dirección Administrativa (ID 1)
  { id: 101, processId: 1, what: 'Políticas corporativas y directrices estratégicas de la alta dirección', toWhom: 'Todo el personal y contratistas', when: 'Anualmente o en caso de actualización', how: 'Correo electrónico institucional y cartelera digital', type: 'Interna', responsible: 'Director Administrativo' },
  { id: 102, processId: 1, what: 'Resultados financieros anuales e informes de sostenibilidad', toWhom: 'Accionistas, juntas directivas y entes de control', when: 'Anualmente durante la asamblea', how: 'Reunión presencial, informe impreso y correo electrónico', type: 'Externa', responsible: 'Director Administrativo' },
  
  // Centro de Control y Seguimiento (ID 2)
  { id: 201, processId: 2, what: 'Reportes de desempeño operacional e indicadores clave (KPIs)', toWhom: 'Dirección General y Directores de Proceso', when: 'Mensualmente', how: 'Dashboard digital (BSC) y reunión de comités', type: 'Interna', responsible: 'Coordinador de Control y Seguimiento' },
  { id: 202, processId: 2, what: 'Estados de metas de producción y alarmas de desvíos críticos', toWhom: 'Gerentes de proyectos y líderes de operaciones', when: 'Semanalmente', how: 'Mensajería instantánea y correo interno', type: 'Interna', responsible: 'Coordinador de Control y Seguimiento' },

  // Sistemas Integrados de Gestión (ID 3)
  { id: 301, processId: 3, what: 'Desempeño del SGI HSEQ, políticas integradas y objetivos anuales', toWhom: 'Todo el personal de la empresa', when: 'Semestralmente y en inducción', how: 'Capacitaciones presenciales y folleto digital', type: 'Interna', responsible: 'Líder HSEQ' },
  { id: 302, processId: 3, what: 'Resultados de auditorías internas, externas y planes de acción', toWhom: 'Dirección General y auditados interesados', when: 'Luego de cada ciclo de auditoría', how: 'Reunión de cierre y reporte en PDF', type: 'Interna', responsible: 'Líder HSEQ' },

  // Licitaciones y Contrataciones (ID 4)
  { id: 401, processId: 4, what: 'Propuestas comerciales y pliegos de condiciones técnicas', toWhom: 'Clientes y entidades licitantes (Públicos/Privados)', when: 'Según cronograma de cada licitación', how: 'Portal web de compras (SECOP II) y correo formal', type: 'Externa', responsible: 'Coordinador de Licitaciones' },
  
  // Gestión de Proyectos (ID 5)
  { id: 501, processId: 5, what: 'Avances físicos de obra/proyecto y actas de comités técnicos', toWhom: 'Clientes y empresas de interventoría', when: 'Semanalmente', how: 'Reuniones semanales y correo formal', type: 'Externa', responsible: 'Gerente de Proyectos' },

  // Gestión del Talento Humano (ID 6)
  { id: 601, processId: 6, what: 'Programación de evaluaciones de desempeño y feedback laboral', toWhom: 'Todo el personal contratado', when: 'Semestralmente', how: 'Intranet corporativa y correo electrónico', type: 'Interna', responsible: 'Coordinador de Gestión Humana' },

  // Gestión Logística y Almacén (ID 7)
  { id: 701, processId: 7, what: 'Evaluación del desempeño e indicadores de proveedores', toWhom: 'Proveedores activos y subcontratistas', when: 'Semestralmente', how: 'Correo electrónico y carta formal', type: 'Externa', responsible: 'Jefe de Compras y Almacén' },

  // Mantenimiento de Planta y Equipos (ID 8)
  { id: 801, processId: 8, what: 'Cronograma anual de mantenimientos preventivos e instructivos', toWhom: 'Operarios y jefes de planta', when: 'Anualmente y antes del mantenimiento', how: 'Cartelera informativa y correo electrónico', type: 'Interna', responsible: 'Coordinador de Mantenimiento' },

  // Dirección Contable y Financiera (ID 9)
  { id: 901, processId: 9, what: 'Declaraciones de impuestos y reportes fiscales oficiales', toWhom: 'Entes de control gubernamental (DIAN)', when: 'Según calendario tributario nacional', how: 'Portal transaccional MUISCA', type: 'Externa', responsible: 'Director Financiero' },

  // Departamento de TI (ID 10)
  { id: 1001, processId: 10, what: 'Políticas de seguridad de la información y ventanas de mantenimiento', toWhom: 'Todo el personal con cuenta activa', when: 'Ante incidencias o mantenimientos programados', how: 'Correo electrónico masivo y banners en intranet', type: 'Interna', responsible: 'Administrador de Sistemas' },

  // Gestión Jurídica (ID 11)
  { id: 1101, processId: 11, what: 'Revisiones de contratos comerciales y alertas legislativas', toWhom: 'Dirección General y áreas solicitantes', when: 'Previo a firma contractual', how: 'Correo institucional y memorando interno', type: 'Interna', responsible: 'Asesor Jurídico' },

  // Gestión de Archivo (ID 12)
  { id: 1201, processId: 12, what: 'Directrices de conservación y tablas de retención documental', toWhom: 'Todos los líderes de proceso', when: 'Cada vez que cambie la directiva legal', how: 'Capacitaciones internas y folletos PDF', type: 'Interna', responsible: 'Encargado de Gestión Documental' }
];

export default function Communications() {
  const APP_USERS = useAppUsers();

  // Load active processes from local storage or fall back to defaults
  const [processes] = useLocalStorage('sgi_processes', DEFAULT_PROCESSES);

  // Load communications matrix data
  const [communications, setCommunications] = useLocalStorage('sgi_communications', DEFAULT_COMMUNICATIONS);

  // Load metadata and changes history
  const [commHistory] = useLocalStorage('sgi_comm_history', [
    { version: '01', date: '2025-01-10', changes: 'Emisión Inicial de la Matriz de Comunicaciones HSEQ.' }
  ]);
  const [meta] = useLocalStorage('sgi_comm_meta', {
    version: 1,
    validity: '2026-12-31',
    lastUpdated: '2026-05-30'
  });

  const [activeProcessId, setActiveProcessId] = useState(() => {
    return processes.length > 0 ? processes[0].id : 1;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    what: '',
    toWhom: '',
    when: '',
    how: '',
    type: 'Interna',
    responsible: ''
  });

  // Export state
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

  // Active process detail
  const activeProcess = processes.find(p => p.id === activeProcessId) || processes[0];

  // Group processes by type for clean visual sections
  const strategicProcesses = processes.filter(p => p.type === 'Estratégico');
  const misionalProcesses = processes.filter(p => p.type === 'Misional');
  const apoyoProcesses = processes.filter(p => p.type === 'Apoyo');

  // Filter communications for the active process & search query
  const activeCommunications = communications.filter(c => {
    const matchesProcess = c.processId === activeProcessId;
    const matchesSearch = searchQuery === '' || 
      (c.what || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.toWhom || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.how || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.responsible || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProcess && matchesSearch;
  });

  // KPI Calculations
  const totalComm = communications.length;
  const internalCount = communications.filter(c => c.type === 'Interna').length;
  const externalCount = totalComm - internalCount;

  // Handlers
  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        what: item.what,
        toWhom: item.toWhom,
        when: item.when,
        how: item.how,
        type: item.type || 'Interna',
        responsible: item.responsible || ''
      });
    } else {
      setEditingItem(null);
      setFormData({
        what: '',
        toWhom: '',
        when: '',
        how: '',
        type: 'Interna',
        responsible: activeProcess ? activeProcess.leader || '' : ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingItem) {
      // Edit
      setCommunications(communications.map(c => 
        c.id === editingItem.id ? { ...c, ...formData } : c
      ));
    } else {
      // Create
      const newRecord = {
        id: Date.now(),
        processId: activeProcessId,
        ...formData
      };
      setCommunications([...communications, newRecord]);
    }
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Está seguro de eliminar este registro de comunicación?')) {
      setCommunications(communications.filter(c => c.id !== id));
    }
  };

  const handleExportClick = (type = 'process') => {
    const cols = [
      { header: 'Proceso', key: 'processName' },
      { header: '¿Qué se comunica?', key: 'what' },
      { header: '¿A quién se comunica?', key: 'toWhom' },
      { header: '¿Cuándo se comunica?', key: 'when' },
      { header: '¿Cómo / Canal?', key: 'how' },
      { header: 'Tipo de Comunicación', key: 'type' },
      { header: 'Responsable', key: 'responsible' }
    ];

    let dataToExport = [];
    let reportHtml = '';

    if (type === 'consolidated') {
      // Map all communications
      dataToExport = communications.map(c => {
        const procName = processes.find(p => p.id === c.processId)?.name || 'General';
        return {
          processName: procName,
          what: c.what,
          toWhom: c.toWhom,
          when: c.when,
          how: c.how,
          type: c.type,
          responsible: c.responsible
        };
      });

      reportHtml = `
        <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #1e293b;">
          <h3 style="color: #0f172a; border-bottom: 2px solid #2563eb; padding-bottom: 6px; font-size: 16px; margin-top: 10px; font-weight: 700;">
            MATRIZ DE COMUNICACIONES HSEQ - CONSOLIDADA
          </h3>
          <p style="font-size: 11px; color: #64748b; margin-bottom: 20px;">
            Esta matriz define los requisitos de comunicación interna y externa para asegurar el flujo correcto de la información en todos los procesos del Sistema de Gestión Integrado (SGI).
          </p>

          ${processes.map(proc => {
            const procComm = dataToExport.filter(c => c.processName === proc.name);
            if (procComm.length === 0) return '';
            return `
              <div style="margin-top: 25px; page-break-inside: avoid;">
                <h4 style="background-color: #f1f5f9; padding: 6px 10px; font-size: 12px; margin: 0; color: #1e293b; border-left: 4px solid #2563eb; font-weight: bold; text-transform: uppercase;">
                  Proceso: ${proc.name} (${proc.type})
                </h4>
                <table style="width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 10px; margin-bottom: 15px;">
                  <thead>
                    <tr style="background: #f8fafc; text-align: left; border-bottom: 1.5px solid #cbd5e1;">
                      <th style="padding: 6px; border: 1px solid #cbd5e1; width: 30%; font-weight: bold;">¿Qué se comunica?</th>
                      <th style="padding: 6px; border: 1px solid #cbd5e1; width: 20%; font-weight: bold;">¿A quién?</th>
                      <th style="padding: 6px; border: 1px solid #cbd5e1; width: 15%; font-weight: bold;">¿Cuándo?</th>
                      <th style="padding: 6px; border: 1px solid #cbd5e1; width: 15%; font-weight: bold;">¿Cómo / Canal?</th>
                      <th style="padding: 6px; border: 1px solid #cbd5e1; width: 10%; font-weight: bold;">Tipo</th>
                      <th style="padding: 6px; border: 1px solid #cbd5e1; width: 10%; font-weight: bold;">Responsable</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${procComm.map(c => `
                      <tr style="border-bottom: 1px solid #e2e8f0;">
                        <td style="padding: 6px; border: 1px solid #cbd5e1; font-weight: bold;">${c.what}</td>
                        <td style="padding: 6px; border: 1px solid #cbd5e1;">${c.toWhom}</td>
                        <td style="padding: 6px; border: 1px solid #cbd5e1;">${c.when}</td>
                        <td style="padding: 6px; border: 1px solid #cbd5e1;">${c.how}</td>
                        <td style="padding: 6px; border: 1px solid #cbd5e1; font-weight: bold; color: ${c.type === 'Interna' ? '#0369a1' : '#b91c1c'};">${c.type}</td>
                        <td style="padding: 6px; border: 1px solid #cbd5e1;">${c.responsible}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            `;
          }).join('')}
        </div>
      `;
    } else {
      // Single process map
      const activeProcName = activeProcess?.name || 'General';
      dataToExport = communications
        .filter(c => c.processId === activeProcessId)
        .map(c => ({
          processName: activeProcName,
          what: c.what,
          toWhom: c.toWhom,
          when: c.when,
          how: c.how,
          type: c.type,
          responsible: c.responsible
        }));

      reportHtml = `
        <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #1e293b;">
          <h3 style="color: #0f172a; border-bottom: 2px solid #2563eb; padding-bottom: 6px; font-size: 16px; margin-top: 10px; font-weight: 700;">
            MATRIZ DE COMUNICACIONES HSEQ - PROCESO: ${activeProcName.toUpperCase()}
          </h3>
          <p style="font-size: 11px; color: #64748b; margin-bottom: 20px;">
            Esta matriz define los requisitos de comunicación interna y externa aplicables al proceso de <strong>${activeProcName}</strong> dentro de la organización.
          </p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 10px;">
            <thead>
              <tr style="background: #f1f5f9; text-align: left; border-bottom: 2px solid #cbd5e1;">
                <th style="padding: 6px; border: 1px solid #cbd5e1; width: 30%; font-weight: bold;">¿Qué se comunica?</th>
                <th style="padding: 6px; border: 1px solid #cbd5e1; width: 20%; font-weight: bold;">¿A quién?</th>
                <th style="padding: 6px; border: 1px solid #cbd5e1; width: 15%; font-weight: bold;">¿Cuándo?</th>
                <th style="padding: 6px; border: 1px solid #cbd5e1; width: 15%; font-weight: bold;">¿Cómo / Canal?</th>
                <th style="padding: 6px; border: 1px solid #cbd5e1; width: 10%; font-weight: bold;">Tipo</th>
                <th style="padding: 6px; border: 1px solid #cbd5e1; width: 10%; font-weight: bold;">Responsable</th>
              </tr>
            </thead>
            <tbody>
              ${dataToExport.length === 0 ? `
                <tr>
                  <td colSpan="6" style="padding: 15px; text-align: center; color: #94a3b8;">No se encontraron registros de comunicación.</td>
                </tr>
              ` : dataToExport.map(c => `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 6px; border: 1px solid #cbd5e1; font-weight: bold;">${c.what}</td>
                  <td style="padding: 6px; border: 1px solid #cbd5e1;">${c.toWhom}</td>
                  <td style="padding: 6px; border: 1px solid #cbd5e1;">${c.when}</td>
                  <td style="padding: 6px; border: 1px solid #cbd5e1;">${c.how}</td>
                  <td style="padding: 6px; border: 1px solid #cbd5e1; font-weight: bold; color: ${c.type === 'Interna' ? '#0369a1' : '#b91c1c'};">${c.type}</td>
                  <td style="padding: 6px; border: 1px solid #cbd5e1;">${c.responsible}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    setExportConfig({
      isOpen: true,
      exportType: 'excel',
      title: type === 'consolidated' 
        ? 'Matriz de Comunicaciones HSEQ Consolidada' 
        : `Matriz de Comunicaciones - Proceso ${activeProcess?.name || 'General'}`,
      code: 'SGI-MAT-COM-001',
      version: `0${meta.version}`,
      validity: meta.validity,
      columns: cols,
      data: dataToExport,
      history: commHistory,
      contentHtml: reportHtml
    });
  };

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* KPI Row */}
        <div className="grid-3" style={{ gap: '1rem' }}>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
            <div style={{ background: 'rgba(37, 99, 235, 0.1)', padding: '0.75rem', borderRadius: '50%', color: 'var(--accent-primary)', display: 'flex' }}>
              <MessageSquare size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', fontWeight: 500 }}>Total Comunicaciones</span>
              <strong style={{ fontSize: '1.4rem', color: 'var(--text-primary)' }}>{totalComm}</strong>
            </div>
          </div>
          
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
            <div style={{ background: 'rgba(3, 105, 161, 0.1)', padding: '0.75rem', borderRadius: '50%', color: '#0284c7', display: 'flex' }}>
              <Cpu size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', fontWeight: 500 }}>Comunicaciones Internas</span>
              <strong style={{ fontSize: '1.4rem', color: 'var(--text-primary)' }}>{internalCount}</strong>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
            <div style={{ background: 'rgba(185, 28, 28, 0.1)', padding: '0.75rem', borderRadius: '50%', color: '#dc2626', display: 'flex' }}>
              <Compass size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', fontWeight: 500 }}>Comunicaciones Externas</span>
              <strong style={{ fontSize: '1.4rem', color: 'var(--text-primary)' }}>{externalCount}</strong>
            </div>
          </div>
        </div>

        {/* Process Tabs Sidebar & Operations Table layout */}
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          
          {/* Sidebar Tabs */}
          <div style={{ flex: '1 1 260px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="card" style={{ padding: '1rem', position: 'sticky', top: '10px' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0 0 0.85rem 0', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Layers size={15} style={{ color: 'var(--accent-primary)' }} /> Procesos del Mapa
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
                
                {strategicProcesses.length > 0 && (
                  <div>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--warning)', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: '0.35rem' }}>Estratégicos</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {strategicProcesses.map(p => (
                        <button 
                          key={p.id}
                          className={`nav-link-sub-btn ${activeProcessId === p.id ? 'active' : ''}`}
                          style={{ 
                            width: '100%', 
                            textAlign: 'left', 
                            display: 'block', 
                            border: 'none', 
                            background: activeProcessId === p.id ? 'var(--accent-primary)' : 'transparent', 
                            color: activeProcessId === p.id ? 'white' : 'var(--text-secondary)',
                            padding: '0.45rem 0.65rem', 
                            borderRadius: '4px', 
                            cursor: 'pointer', 
                            transition: 'all 0.15s', 
                            fontSize: '0.78rem', 
                            fontWeight: activeProcessId === p.id ? 700 : 500 
                          }}
                          onClick={() => setActiveProcessId(p.id)}
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {misionalProcesses.length > 0 && (
                  <div>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--accent-primary)', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: '0.35rem' }}>Misionales / Operativos</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {misionalProcesses.map(p => (
                        <button 
                          key={p.id}
                          className={`nav-link-sub-btn ${activeProcessId === p.id ? 'active' : ''}`}
                          style={{ 
                            width: '100%', 
                            textAlign: 'left', 
                            display: 'block', 
                            border: 'none', 
                            background: activeProcessId === p.id ? 'var(--accent-primary)' : 'transparent', 
                            color: activeProcessId === p.id ? 'white' : 'var(--text-secondary)',
                            padding: '0.45rem 0.65rem', 
                            borderRadius: '4px', 
                            cursor: 'pointer', 
                            transition: 'all 0.15s', 
                            fontSize: '0.78rem', 
                            fontWeight: activeProcessId === p.id ? 700 : 500 
                          }}
                          onClick={() => setActiveProcessId(p.id)}
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {apoyoProcesses.length > 0 && (
                  <div>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--success)', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: '0.35rem' }}>Apoyo</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {apoyoProcesses.map(p => (
                        <button 
                          key={p.id}
                          className={`nav-link-sub-btn ${activeProcessId === p.id ? 'active' : ''}`}
                          style={{ 
                            width: '100%', 
                            textAlign: 'left', 
                            display: 'block', 
                            border: 'none', 
                            background: activeProcessId === p.id ? 'var(--accent-primary)' : 'transparent', 
                            color: activeProcessId === p.id ? 'white' : 'var(--text-secondary)',
                            padding: '0.45rem 0.65rem', 
                            borderRadius: '4px', 
                            cursor: 'pointer', 
                            transition: 'all 0.15s', 
                            fontSize: '0.78rem', 
                            fontWeight: activeProcessId === p.id ? 700 : 500 
                          }}
                          onClick={() => setActiveProcessId(p.id)}
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>

          {/* Table of active process communications */}
          <div style={{ flex: '3 1 500px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="card" style={{ padding: '1.25rem' }}>
              
              {/* Header control bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                    Matriz de Comunicaciones: {activeProcess ? activeProcess.name : 'Seleccionado'}
                  </h2>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                    Definición de qué, a quién, cuándo y cómo se comunica en este proceso.
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button className="btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }} onClick={() => handleExportClick('consolidated')}>
                    <Download size={13} /> Consolidado HSEQ
                  </button>
                  <button className="btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }} onClick={() => handleExportClick('process')}>
                    <Download size={13} /> Exportar Proceso
                  </button>
                  <button className="btn-primary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }} onClick={() => handleOpenModal()}>
                    <Plus size={14} /> Nueva Comunicación
                  </button>
                </div>
              </div>

              {/* Search filter bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '1rem', width: '100%', maxWidth: '360px' }}>
                <Search size={14} style={{ color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  className="form-control-raw"
                  placeholder="Buscar en esta matriz..." 
                  style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.8rem', color: 'var(--text-primary)' }}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Table rendering */}
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th style={{ width: '35%' }}>¿Qué comunica?</th>
                      <th style={{ width: '20%' }}>¿A quién comunica?</th>
                      <th style={{ width: '15%' }}>¿Cuándo comunica?</th>
                      <th style={{ width: '15%' }}>¿Cómo / Canal?</th>
                      <th style={{ width: '10%', textTransform: 'none' }}>Tipo</th>
                      <th style={{ width: '5%' }}>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeCommunications.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                          <Info size={28} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block', margin: '0 auto' }} />
                          No se encontraron requisitos de comunicación registrados para este proceso.
                        </td>
                      </tr>
                    ) : (
                      activeCommunications.map(c => (
                        <tr key={c.id}>
                          <td>
                            <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-primary)' }}>{c.what}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <User size={10} /> Emite: <strong>{c.responsible || 'No asignado'}</strong>
                            </div>
                          </td>
                          <td style={{ fontSize: '0.8rem' }}>{c.toWhom}</td>
                          <td style={{ fontSize: '0.8rem' }}>{c.when}</td>
                          <td style={{ fontSize: '0.8rem' }}>{c.how}</td>
                          <td>
                            <span className={`badge ${c.type === 'Interna' ? 'badge-info' : 'badge-danger'}`} style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem' }}>
                              {c.type || 'Interna'}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.25rem' }}>
                              <button className="btn-icon" style={{ padding: '0.25rem' }} onClick={() => handleOpenModal(c)} title="Editar"><Edit2 size={13} /></button>
                              <button className="btn-icon" style={{ padding: '0.25rem', color: 'var(--danger)' }} onClick={() => handleDelete(c.id)} title="Eliminar"><Trash2 size={13} /></button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          </div>
          
        </div>
      </div>

      {/* Operations modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        title={editingItem ? 'Editar Comunicación HSEQ' : 'Añadir Nueva Comunicación HSEQ'}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div className="form-group">
            <label className="form-label">¿Qué se comunica? (Contenido del Mensaje) *</label>
            <textarea 
              className="form-control" 
              rows="3"
              placeholder="Ej: Reportes de desvíos en el cronograma de obra e informes de interventoría..."
              value={formData.what} 
              onChange={e => setFormData({ ...formData, what: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">¿A quién se comunica? (Receptores) *</label>
            <input 
              type="text" 
              className="form-control"
              placeholder="Ej: Cliente externo, interventoría y Dirección General"
              value={formData.toWhom} 
              onChange={e => setFormData({ ...formData, toWhom: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
              <label className="form-label">¿Cuándo se comunica? (Frecuencia/Disparador) *</label>
              <input 
                type="text" 
                className="form-control"
                placeholder="Ej: Semanalmente / Ante accidentes laborales"
                value={formData.when} 
                onChange={e => setFormData({ ...formData, when: e.target.value })}
                required
              />
            </div>
            <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
              <label className="form-label">¿Cómo se comunica? (Canal/Medio) *</label>
              <input 
                type="text" 
                className="form-control"
                placeholder="Ej: Reunión semanal, correo formal y actas firmadas"
                value={formData.how} 
                onChange={e => setFormData({ ...formData, how: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
              <label className="form-label">Tipo de Comunicación *</label>
              <select 
                className="form-control"
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
                required
              >
                <option value="Interna">Interna (Personal, Contratistas)</option>
                <option value="Externa">Externa (Clientes, Autoridades, DIAN, Proveedores)</option>
              </select>
            </div>
            
            <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
              <label className="form-label">Emisor / Responsable *</label>
              <input 
                type="text" 
                className="form-control"
                placeholder="Ej: Gerente de Proyectos / Líder HSEQ"
                value={formData.responsible} 
                onChange={e => setFormData({ ...formData, responsible: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <button type="button" className="btn-secondary" onClick={handleCloseModal}>Cancelar</button>
            <button type="submit" className="btn-primary">
              {editingItem ? 'Guardar Cambios' : 'Registrar Comunicación'}
            </button>
          </div>

        </form>
      </Modal>

      {/* Export unifier modal */}
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
