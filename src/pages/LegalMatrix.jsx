import React, { useState, useEffect } from 'react';
import { 
  Clock, Download, Plus, Filter, CheckCircle, AlertTriangle, XCircle, Info, 
  Edit2, Trash2, History, Upload, Paperclip, Calendar, User, Cloud, RefreshCw,
  ShieldCheck, FileText, ClipboardList
} from 'lucide-react';
import Modal from '../components/Modal';
import ExportModal from '../components/ExportModal';
import { downloadCSV } from '../utils/exportUtils';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAppUsers } from '../hooks/useAppUsers';
import { getOneDriveSettings, uploadFile } from '../services/oneDriveService';

export default function LegalMatrix() {
  const APP_USERS = useAppUsers();

  const [reqs, setReqs] = useLocalStorage('sgi_legal_reqs', [
    { 
      id: 1, category: 'SST', norm: 'Ley 1562 de 2012', year: 2012, article: 'Art. 1', description: 'Sistema de Riesgos Laborales', status: 'Cumple',
      responsible: 'Ing. SST',
      followUpActivity: 'Auditoría interna anual al SGSST',
      followUpDate: '2026-05-30',
      complianceEvidence: 'Informe de auditoría SGSST 2026',
      complianceDate: '2026-05-30',
      complianceResponsible: 'Ing. SST',
      evidenceHistory: [
        {
          id: 201,
          fileName: 'Informe_Auditoria_Interna_2026.pdf',
          date: '2026-05-30',
          verifier: 'Ing. SST',
          description: 'Informe final de auditoría interna de estándares mínimos'
        }
      ]
    },
    { 
      id: 2, category: 'Ambiental', norm: 'Decreto 1076 de 2015', year: 2015, article: 'Cap 2', description: 'Licencias Ambientales', status: 'Cumple Parcialmente',
      responsible: 'Líder Ambiental',
      followUpActivity: 'Revisión y renovación de permisos de vertimientos',
      followUpDate: '2026-05-15',
      complianceEvidence: 'Radicado solicitud corporación autónoma',
      complianceDate: '2026-05-15',
      complianceResponsible: 'Líder Ambiental',
      evidenceHistory: []
    },
    { 
      id: 3, category: 'General', norm: 'Resolución 0312 de 2019', year: 2019, article: 'Estándares mínimos', description: 'SGSST', status: 'No Cumple',
      responsible: 'Gerencia HSEQ',
      followUpActivity: 'Elaboración del plan de mejoramiento de estándares mínimos',
      followUpDate: '2026-04-20',
      complianceEvidence: 'Plan de acción asignado',
      complianceDate: '2026-04-20',
      complianceResponsible: 'Gerencia HSEQ',
      evidenceHistory: []
    }
  ]);

  const [filter, setFilter] = useState('Todos');
  
  // History and meta for legal matrix
  const [legalMatrixHistory, setLegalMatrixHistory] = useLocalStorage('sgi_legal_matrix_history', [
    { version: '01', date: '2025-01-10', changes: 'Emisión Inicial de la Matriz de Requisitos Legales HSEQ.' }
  ]);
  const [meta, setMeta] = useLocalStorage('sgi_legal_matrix_meta', {
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  const [formData, setFormData] = useState({
    category: 'SST', norm: '', year: new Date().getFullYear(), article: '', description: '', status: 'Cumple',
    responsible: '', followUpActivity: '', followUpDate: new Date().toISOString().split('T')[0]
  });

  // Detailed view state variables
  const [selectedReqId, setSelectedReqId] = useState(null);
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

  // Auto-select first req
  useEffect(() => {
    if (reqs.length > 0 && !selectedReqId) {
      setSelectedReqId(reqs[0].id);
    }
  }, [reqs, selectedReqId]);

  const selectedReq = reqs.find(r => r.id === selectedReqId);

  const baseCategories = ['SST', 'Ambiental', 'Contractual', 'General'];
  const categories = ['Todos', ...baseCategories];

  // Safeguard/normalization for older localStorage items
  const normalizedReqs = reqs.map(r => ({
    ...r,
    responsible: r.responsible || 'No asignado',
    followUpActivity: r.followUpActivity || 'Sin actividad',
    followUpDate: r.followUpDate || '',
    evidenceHistory: r.evidenceHistory || []
  }));

  const filtered = filter === 'Todos' ? normalizedReqs : normalizedReqs.filter(r => r.category === filter);

  const total = normalizedReqs.length;
  const cumple = normalizedReqs.filter(r => r.status === 'Cumple').length;
  const parcial = normalizedReqs.filter(r => r.status === 'Cumple Parcialmente').length;
  const noCumple = normalizedReqs.filter(r => r.status === 'No Cumple').length;
  const pctCumplimiento = total > 0 ? Math.round(((cumple) / total) * 100) : 0;

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        category: item.category || 'SST',
        norm: item.norm || '',
        year: item.year ?? new Date().getFullYear(),
        article: item.article || '',
        description: item.description || '',
        status: item.status || 'Cumple',
        responsible: item.responsible || '',
        followUpActivity: item.followUpActivity || '',
        followUpDate: item.followUpDate || new Date().toISOString().split('T')[0]
      });
    } else {
      setEditingItem(null);
      setFormData({ 
        category: 'SST', 
        norm: '', 
        year: new Date().getFullYear(), 
        article: '', 
        description: '', 
        status: 'Cumple',
        responsible: APP_USERS[0]?.name || '',
        followUpActivity: '',
        followUpDate: new Date().toISOString().split('T')[0]
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingItem) {
      setReqs(reqs.map(r => r.id === editingItem.id ? { ...formData, id: r.id } : r));
    } else {
      setReqs([...reqs, { ...formData, id: Date.now(), evidenceHistory: [] }]);
    }
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Está seguro de eliminar este requisito legal?")) {
      const remaining = reqs.filter(r => r.id !== id);
      setReqs(remaining);
      if (selectedReqId === id) {
        setSelectedReqId(remaining[0]?.id || null);
      }
    }
  };

  const handleAddEvidence = async (e) => {
    e.preventDefault();
    if (!selectedReq) return;
    
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
        console.error("Error al subir soporte legal a OneDrive:", err);
        alert(`Error al subir soporte legal a OneDrive: ${err.message || err}`);
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

    const updatedHistory = [...(selectedReq.evidenceHistory || []), newRecord];
    const updatedReq = {
      ...selectedReq,
      complianceEvidence: newRecord.description || newRecord.fileName || 'Soporte cargado',
      complianceResponsible: newRecord.verifier,
      complianceDate: newRecord.date,
      evidenceHistory: updatedHistory
    };

    setReqs(reqs.map(r => r.id === selectedReq.id ? updatedReq : r));

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
    if (!selectedReq) return;
    if (window.confirm("¿Está seguro de eliminar este soporte del historial?")) {
      const updatedHistory = (selectedReq.evidenceHistory || []).filter(e => e.id !== evidenceId);
      
      let latestEvidence = 'Sin soportes';
      let latestVerifier = 'No asignado';
      let latestDate = '';
      
      if (updatedHistory.length > 0) {
        const latest = updatedHistory[updatedHistory.length - 1];
        latestEvidence = latest.description || latest.fileName;
        latestVerifier = latest.verifier;
        latestDate = latest.date;
      }

      const updatedReq = {
        ...selectedReq,
        complianceEvidence: latestEvidence,
        complianceResponsible: latestVerifier,
        complianceDate: latestDate,
        evidenceHistory: updatedHistory
      };

      setReqs(reqs.map(r => r.id === selectedReq.id ? updatedReq : r));
    }
  };

  const handleExport = () => {
    const cols = [
      { header: 'Categoría', key: 'category' },
      { header: 'Norma Aplicable', key: 'norm' },
      { header: 'Año de Emisión', key: 'year' },
      { header: 'Artículos Aplicables', key: 'article' },
      { header: 'Descripción del Requisito', key: 'description' },
      { header: 'Responsable', key: 'responsible' },
      { header: 'Estado Cumplimiento', key: 'status' },
      { header: 'Actividad de Seguimiento', key: 'followUpActivity' },
      { header: 'Fecha Seguimiento', key: 'followUpDate' },
      { header: 'Evidencia de Cumplimiento', key: 'complianceEvidence' },
      { header: 'Fecha Evidencia', key: 'complianceDate' }
    ];

    const dataToExport = normalizedReqs.map(r => ({
      category: r.category,
      norm: r.norm,
      year: r.year,
      article: r.article,
      description: r.description,
      responsible: r.responsible,
      status: r.status,
      followUpActivity: r.followUpActivity,
      followUpDate: r.followUpDate,
      complianceEvidence: r.complianceEvidence || '',
      complianceDate: r.complianceDate || ''
    }));

    setExportConfig({
      isOpen: true,
      exportType: 'excel',
      title: 'Matriz de Requisitos Legales y Otros',
      code: 'LEG-MAT-001',
      version: `0${meta.version}`,
      validity: meta.validity,
      columns: cols,
      data: dataToExport,
      history: legalMatrixHistory
    });
  };

  return (
    <>
      <style>{`
        .legal-row {
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        .legal-row:hover {
          background-color: var(--bg-secondary) !important;
        }
        .legal-row.active {
          background-color: var(--bg-tertiary) !important;
          border-left: 4px solid var(--accent-primary) !important;
        }
      `}</style>

      <div style={{display:'flex', justifyContent:'space-between', marginBottom:'1.5rem', alignItems:'center', flexWrap:'wrap', gap:'1rem'}}>
        <div>
          <p style={{color:'var(--text-secondary)', marginBottom:'0.25rem'}}>Identificación y Evaluación de Cumplimiento de Requisitos Legales y Normativos</p>
          <span className="badge badge-info"><Clock size={12} style={{marginRight:'4px'}}/> Última actualización: 2026-05-30</span>
        </div>
        <div style={{display:'flex', gap:'0.5rem', flexWrap:'wrap'}}>
          <button className="btn-secondary" onClick={handleExport}><Download size={16}/> Exportar Excel</button>
          <button className="btn-primary" onClick={() => handleOpenModal()}><Plus size={16}/> Nuevo Requisito</button>
        </div>
      </div>

      <div className="grid-4" style={{marginBottom:'1.5rem'}}>
        <div className="card" style={{marginBottom:0, borderLeft:'4px solid var(--accent-primary)', padding:'1.25rem'}}>
          <div style={{fontSize:'0.8rem', color:'var(--text-secondary)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.5rem'}}>Total Requisitos</div>
          <div style={{fontSize:'2rem', fontWeight:700}}>{total}</div>
        </div>
        <div className="card" style={{marginBottom:0, borderLeft:'4px solid var(--success)', padding:'1.25rem'}}>
          <div style={{fontSize:'0.8rem', color:'var(--text-secondary)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.5rem'}}>Cumplimiento %</div>
          <div style={{fontSize:'2rem', fontWeight:700, color:'var(--success)'}}>{pctCumplimiento}%</div>
          <div className="progress-bar" style={{marginTop:'0.5rem'}}>
            <div className="progress-fill" style={{width:`${pctCumplimiento}%`, background:'var(--success)'}}></div>
          </div>
        </div>
        <div className="card" style={{marginBottom:0, borderLeft:'4px solid var(--warning)', padding:'1.25rem'}}>
          <div style={{fontSize:'0.8rem', color:'var(--text-secondary)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.5rem'}}>Cumple Parcialmente</div>
          <div style={{fontSize:'2rem', fontWeight:700, color:'var(--warning)'}}>{parcial}</div>
        </div>
        <div className="card" style={{marginBottom:0, borderLeft:'4px solid var(--danger)', padding:'1.25rem'}}>
          <div style={{fontSize:'0.8rem', color:'var(--text-secondary)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.5rem'}}>No Cumple</div>
          <div style={{fontSize:'2rem', fontWeight:700, color:'var(--danger)'}}>{noCumple}</div>
        </div>
      </div>

      <div className="card" style={{marginBottom:'1.5rem', padding:'0.75rem 1.5rem'}}>
        <div style={{display:'flex', alignItems:'center', gap:'0.75rem', flexWrap:'wrap'}}>
          <span style={{fontSize:'0.85rem', fontWeight:600, color:'var(--text-secondary)'}}><Filter size={14} style={{verticalAlign:'middle', marginRight:'4px'}}/> Categoría:</span>
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
      </div>

      <div className="card" style={{padding:0, overflow:'hidden'}}>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Categoría / Responsable</th>
                <th>Norma / Año</th>
                <th>Artículos Aplicables</th>
                <th>Descripción del Requisito</th>
                <th>Estado / Seguimiento</th>
                <th>Soportes</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="7" style={{textAlign:'center', padding:'2rem'}}>No hay registros.</td></tr>
              ) : filtered.map(r => {
                let badgeClass = 'badge-success';
                let Icon = CheckCircle;
                if (r.status === 'Cumple Parcialmente') { badgeClass = 'badge-warning'; Icon = AlertTriangle; }
                else if (r.status === 'No Cumple') { badgeClass = 'badge-danger'; Icon = XCircle; }
                else if (r.status === 'No Aplica') { badgeClass = 'badge-info'; Icon = Info; }

                return (
                  <tr 
                    key={r.id}
                    className={`legal-row ${r.id === selectedReqId ? 'active' : ''}`}
                    onClick={() => setSelectedReqId(r.id)}
                  >
                    <td style={{fontWeight:500}}>
                      {r.category}
                      <div style={{fontSize:'0.72rem', color:'var(--text-muted)', marginTop:'2px'}}><strong>Resp:</strong> {r.responsible}</div>
                    </td>
                    <td><strong style={{color:'var(--accent-primary)'}}>{r.norm}</strong> <span style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>({r.year})</span></td>
                    <td style={{fontSize:'0.85rem'}}>{r.article}</td>
                    <td style={{fontSize:'0.85rem', maxWidth:'300px'}}>{r.description}</td>
                    <td>
                      <span className={`badge ${badgeClass}`}>
                        <Icon size={12} style={{marginRight:'4px'}}/> {r.status}
                      </span>
                      {r.followUpDate && (
                        <div style={{fontSize:'0.68rem', color:'var(--text-muted)', marginTop:'4px'}} title="Fecha de Seguimiento">
                          📅 {r.followUpDate}
                        </div>
                      )}
                    </td>
                    <td style={{fontSize:'0.8rem', maxWidth:'150px'}}>
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
                        <span style={{color:'var(--text-muted)'}}>Sin soportes</span>
                      )}
                    </td>
                    <td>
                      <div style={{display:'flex', gap:'0.25rem'} } onClick={e => e.stopPropagation()}>
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

      {/* FICHA DE DETALLE DEL REQUISITO LEGAL SELECCIONADO */}
      {selectedReq && (
        <div className="card fade-in" style={{ marginTop: '1.5rem', padding: '1.25rem', borderLeft: '4px solid var(--accent-primary)', marginBottom: '2rem' }}>
          
          {/* Header de la Ficha */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <span className="badge badge-info" style={{ marginBottom: '0.25rem', display: 'inline-block' }}>
                <ShieldCheck size={10} style={{ marginRight: '4px' }} /> Ficha de Requisito Legal y Normativo
              </span>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
                {selectedReq.norm} (Artículos: {selectedReq.article})
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Categoría: <strong>{selectedReq.category}</strong> | Responsable Asignado: <strong>{selectedReq.responsible || 'No asignado'}</strong>
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button className="btn-secondary" style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem' }} onClick={() => handleOpenModal(selectedReq)}>
                <Edit2 size={12} style={{ marginRight: '4px' }} /> Editar Requisito
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
              <FileText size={12} style={{ marginRight: '3px' }} /> Detalle del Requisito
            </button>
            <button 
              className={`btn-secondary ${detailTab === 'control' ? 'active' : ''}`}
              style={{ border: 'none', fontSize: '0.8rem', padding: '0.3rem 0.6rem', background: detailTab === 'control' ? 'rgba(16, 185, 129, 0.1)' : 'transparent', color: detailTab === 'control' ? 'var(--success)' : 'var(--text-secondary)' }}
              onClick={() => setDetailTab('control')}
            >
              <ClipboardList size={12} style={{ marginRight: '3px' }} /> Control y Seguimiento ({selectedReq.evidenceHistory?.length || 0})
            </button>
          </div>

          {/* TAB 1: Detalle del Requisito */}
          {detailTab === 'detail' && (
            <div className="grid-2 fade-in" style={{ gap: '1.25rem' }}>
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Descripción del Requisito / Obligación</h4>
                <div style={{ background: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: '6px', border: '1px solid var(--border-color)', minHeight: '120px', fontSize: '0.82rem', lineHeight: '1.4' }}>
                  <p style={{ margin: 0 }}>{selectedReq.description}</p>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Evaluación de Cumplimiento</h4>
                <div className="grid-2" style={{ gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
                  <div>Norma / Año: <strong>{selectedReq.norm} ({selectedReq.year})</strong></div>
                  <div>Artículos: <strong>{selectedReq.article}</strong></div>
                  <div>Categoría: <strong>{selectedReq.category}</strong></div>
                  <div>Responsable: <strong>{selectedReq.responsible || 'No asignado'}</strong></div>
                  
                  <div style={{ gridColumn: 'span 2', borderTop: '1px solid var(--border-color)', paddingTop: '0.4rem', marginTop: '0.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Estado Actual:</span>
                    <span className={`badge ${selectedReq.status === 'Cumple' ? 'badge-success' : selectedReq.status === 'Cumple Parcialmente' ? 'badge-warning' : selectedReq.status === 'No Cumple' ? 'badge-danger' : 'badge-info'}`}>
                      {selectedReq.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Control, Seguimiento y Soportes */}
          {detailTab === 'control' && (
            <div className="grid-2 fade-in" style={{ gap: '1.25rem' }}>
              
              {/* Columna Izquierda: Actividad de Seguimiento y Historial de Soportes */}
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Actividad de Seguimiento y Control</h4>
                <div style={{ background: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: '6px', border: '1px solid var(--border-color)', display:'flex', flexDirection:'column', gap:'0.5rem', fontSize: '0.82rem', marginBottom: '1rem' }}>
                  <p style={{ margin: 0, lineHeight: '1.4' }}>{selectedReq.followUpActivity || 'No se registraron actividades de seguimiento.'}</p>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '0.4rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Responsable: <strong>{selectedReq.responsible || 'No asignado'}</strong></span>
                    <span>Fecha Límite/Seguimiento: <strong style={{color:'var(--accent-primary)'}}>{selectedReq.followUpDate || 'No asignada'}</strong></span>
                  </div>
                </div>

                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Soportes de Evidencia Registrados</h4>
                <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingRight: '4px' }}>
                  {(!selectedReq.evidenceHistory || selectedReq.evidenceHistory.length === 0) ? (
                    <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '6px', border: '1px dashed var(--border-color)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                      Sin soportes de evidencias registrados.
                    </div>
                  ) : (
                    selectedReq.evidenceHistory.map((ev) => (
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

              {/* Columna Derecha: Registrar nueva evidencia/soporte */}
              <div>
                <form onSubmit={handleAddEvidence} style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', background: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ fontSize: '0.82rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: 'var(--accent-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem' }}>Adjuntar Nuevo Soporte de Evidencia</h4>
                  
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.72rem' }}>Descripción del Soporte</label>
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
                        id="legal-evidence-file-upload-inline" 
                        style={{ display: 'none' }} 
                        onChange={e => {
                          const file = e.target.files[0];
                          if (file) {
                            setSelectedEvidenceFile(file);
                            setNewEvidenceData({ ...newEvidenceData, fileName: file.name });
                          }
                        }}
                      />
                      <label htmlFor="legal-evidence-file-upload-inline" className="btn-secondary" style={{ cursor: 'pointer', margin: 0, padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}>
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
        title={editingItem ? "Editar Requisito Legal" : "Nuevo Requisito Legal"}
      >
        <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem'}}>
            <div className="form-group">
              <label className="form-label">Categoría</label>
              <select className="form-control" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required>
                {baseCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Responsable Asignado</label>
              <select className="form-control" value={formData.responsible} onChange={e => setFormData({...formData, responsible: e.target.value})} required>
                <option value="">Seleccione Usuario...</option>
                {APP_USERS.map(u => <option key={u.email} value={u.name}>{u.name}</option>)}
              </select>
            </div>
          </div>
          
          <div style={{display:'flex', gap:'1rem'}}>
            <div className="form-group" style={{flex:2}}>
              <label className="form-label">Norma</label>
              <input type="text" className="form-control" value={formData.norm} onChange={e => setFormData({...formData, norm: e.target.value})} required placeholder="Ej: Ley 1562" />
            </div>
            <div className="form-group" style={{flex:1}}>
              <label className="form-label">Año</label>
              <input type="number" className="form-control" value={formData.year} onChange={e => setFormData({...formData, year: Number(e.target.value)})} required />
            </div>
          </div>
          
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem'}}>
            <div className="form-group">
              <label className="form-label">Artículos Aplicables</label>
              <input type="text" className="form-control" value={formData.article} onChange={e => setFormData({...formData, article: e.target.value})} required placeholder="Ej: Art. 1, Cap 2..." />
            </div>
            <div className="form-group">
              <label className="form-label">Fecha de Seguimiento</label>
              <input type="date" className="form-control" value={formData.followUpDate || ''} onChange={e => setFormData({...formData, followUpDate: e.target.value})} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Descripción del Requisito</label>
            <textarea className="form-control" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows="3" required placeholder="Obligaciones del requisito legal..."></textarea>
          </div>

          <div className="form-group">
            <label className="form-label">Actividad de Seguimiento</label>
            <textarea className="form-control" value={formData.followUpActivity} onChange={e => setFormData({...formData, followUpActivity: e.target.value})} rows="2" required placeholder="Acciones o controles de seguimiento..."></textarea>
          </div>

          <div className="form-group">
            <label className="form-label">Estado de Cumplimiento</label>
            <select className="form-control" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} required>
              <option value="Cumple">Cumple</option>
              <option value="Cumple Parcialmente">Cumple Parcialmente</option>
              <option value="No Cumple">No Cumple</option>
              <option value="No Aplica">No Aplica</option>
            </select>
          </div>

          <div style={{display:'flex', justifyContent:'flex-end', gap:'0.5rem', marginTop:'1rem'}}>
            <button type="button" className="btn-secondary" onClick={handleCloseModal}>Cancelar</button>
            <button type="submit" className="btn-primary">{editingItem ? "Actualizar" : "Guardar"}</button>
          </div>
        </form>
      </Modal>

      {/* OVERLAY DE CARGA PARA ONEDRIVE */}
      {isUploadingEvidence && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
          background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
          gap: '1rem', zIndex: 99999, color: 'white'
        }}>
          <RefreshCw size={36} className="spin" color="#0078d4" style={{ animation: 'spin 1.2s linear infinite' }} />
          <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>Subiendo soporte a Microsoft OneDrive...</span>
          <div style={{ width: '300px', height: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${uploadEvidenceProgress}%`, height: '100%', background: '#0078d4', transition: 'width 0.1s ease-out' }}></div>
          </div>
          <span style={{ fontSize: '0.85rem' }}>{uploadEvidenceProgress}% completado</span>
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
      />
    </>
  );
}
