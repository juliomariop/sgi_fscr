import React, { useState, useEffect, useMemo } from 'react';
import { MessageSquare, Plus, Edit2, Trash2, Download, Paperclip, Upload, Clock, CheckCircle } from 'lucide-react';
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

export default function Pqrs() {
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

  const [pqrs, setPqrs] = useLocalStorage('sgi_pqrs', [
    { id: 'PQR-001', type: 'Reclamo', process: 'Operaciones', responsible: 'Juan Pérez', desc: 'Retraso de 3 días en entrega de producto', status: 'Abierto', date: '2026-05-20', response: '', supportFile: null, responseFile: null, annotations: 'El cliente solicita pronta solución o elevará queja a superintendencia.', project: 'Eléctrico', city: 'Bogotá', client: 'Consorcio Vial del Norte' },
    { id: 'PQR-002', type: 'Queja', process: 'Servicio al Cliente', responsible: 'María Gómez', desc: 'Mala atención en canal telefónico', status: 'Análisis', date: '2026-05-18', response: '', supportFile: 'correo_queja.pdf', responseFile: null, annotations: 'Se revisó grabación del canal telefónico y se citó a descargos al asesor.', project: 'Civil', city: 'Cali', client: 'Ecopetrol' },
    { id: 'PQR-003', type: 'Petición', process: 'Comercial', responsible: 'Carlos Díaz', desc: 'Solicitud de certificado de calidad', status: 'Cerrado', date: '2026-05-10', response: 'Enviado al correo', supportFile: null, responseFile: 'certificado_enviado.pdf', annotations: 'El certificado se envió a través de correo certificado y digital el 12 de mayo.', project: 'Industrial', city: 'Medellín', client: 'Claro' }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedPqrId, setSelectedPqrId] = useState(null);
  const [detailTab, setDetailTab] = useState('detail'); // detail, response

  const [formData, setFormData] = useState({
    type: 'Petición', process: '', responsible: '', desc: '', status: 'Abierto', date: new Date().toISOString().split('T')[0], response: '', supportFile: null, responseFile: null, annotations: '',
    project: '', city: '', client: ''
  });

  const [exportConfig, setExportConfig] = useState({
    isOpen: false,
    exportType: 'excel',
    title: 'Libro de Registro y Control de PQRS',
    code: 'SGI-REG-PQR-001',
    version: '1.0',
    validity: new Date().toLocaleDateString(),
    columns: [],
    data: [],
    history: [],
    contentHtml: ''
  });

  // Normalize PQRs to ensure they all have annotations
  const normalizedPqrs = pqrs.map(p => ({
    ...p,
    process: p.process || 'Sin Asignar',
    responsible: p.responsible || 'Sin Asignar',
    response: p.response || 'Sin Respuesta',
    annotations: p.annotations || 'Sin Anotaciones'
  }));

  // Auto-select first PQR
  useEffect(() => {
    if (pqrs.length > 0 && !selectedPqrId) {
      setSelectedPqrId(pqrs[0].id);
    }
  }, [pqrs, selectedPqrId]);

  const handleSupportFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setFormData({ ...formData, supportFile: file.name });
  };

  const handleResponseFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setFormData({ ...formData, responseFile: file.name });
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({ 
        ...item,
        process: item.process || '',
        responsible: item.responsible || '',
        supportFile: item.supportFile || null,
        responseFile: item.responseFile || null,
        annotations: item.annotations || ''
      });
    } else {
      setEditingItem(null);
      setFormData({ 
        type: 'Petición', process: '', responsible: '', desc: '', status: 'Abierto', date: new Date().toISOString().split('T')[0], response: '', supportFile: null, responseFile: null, annotations: '',
        project: '', city: '', client: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingItem) {
      setPqrs(pqrs.map(p => p.id === editingItem.id ? { ...formData, id: p.id } : p));
    } else {
      const newId = `PQR-${String(pqrs.length + 1).padStart(3, '0')}`;
      setPqrs([...pqrs, { ...formData, id: newId }]);
      setSelectedPqrId(newId);
    }
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Está seguro de eliminar esta PQR?")) {
      const remaining = pqrs.filter(p => p.id !== id);
      setPqrs(remaining);
      if (selectedPqrId === id) {
        setSelectedPqrId(remaining[0]?.id || null);
      }
    }
  };

  const handleExport = () => {
    const cols = [
      { label: 'Código PQR', key: 'id' },
      { label: 'Fecha Radicación', key: 'date' },
      { label: 'Tipo de Solicitud', key: 'type' },
      { label: 'Proceso Asociado', key: 'process' },
      { label: 'Responsable Asignado', key: 'responsible' },
      { label: 'Descripción / Petición', key: 'desc' },
      { label: 'Estado del Caso', key: 'status' },
      { label: 'Respuesta Oficial (Gestión)', key: 'response' },
      { label: 'Anotaciones / Seguimiento', key: 'annotations' },
      { label: 'Soporte Radicado', key: 'supportFile' },
      { label: 'Soporte Cierre', key: 'responseFile' }
    ];

    const reportHtml = `
      <div style="font-family: system-ui, sans-serif; color: #0f172a; padding: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="margin: 0; font-size: 14px; color: #1e3a8a; font-weight: 800; text-transform: uppercase;">Libro de Registro y Control de PQRS</h2>
          <p style="margin: 3px 0 0 0; font-size: 9.5px; color: #64748b;">Sistemas Integrados de Gestión (SGI) - ISO 9001 / ISO 14001 / ISO 45001</p>
        </div>

        <div style="border: 1px solid #cbd5e1; border-radius: 8px; padding: 15px; background: #ffffff;">
          <h4 style="margin: 0 0 10px 0; font-size: 10px; color: #1e293b; text-transform: uppercase; font-weight: 800; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">Historial de Casos Radicados y Gestión Completa</h4>
          <table style="width: 100%; border-collapse: collapse; font-size: 8px; text-align: left;">
            <thead>
              <tr style="background: #1e3a8a; color: white;">
                 <th style="padding: 6px 4px; border: 1px solid #cbd5e1; font-weight: bold; width: 10%;">ID / Fecha</th>
                 <th style="padding: 6px 4px; border: 1px solid #cbd5e1; font-weight: bold; width: 12%;">Tipo</th>
                 <th style="padding: 6px 4px; border: 1px solid #cbd5e1; font-weight: bold; width: 15%;">Proceso</th>
                 <th style="padding: 6px 4px; border: 1px solid #cbd5e1; font-weight: bold; width: 25%;">Descripción del Caso</th>
                 <th style="padding: 6px 4px; border: 1px solid #cbd5e1; font-weight: bold; width: 12%;">Responsable</th>
                 <th style="padding: 6px 4px; border: 1px solid #cbd5e1; font-weight: bold; width: 10%;">Estado</th>
                 <th style="padding: 6px 4px; border: 1px solid #cbd5e1; font-weight: bold; width: 16%;">Respuesta / Anotación</th>
              </tr>
            </thead>
            <tbody>
              ${normalizedPqrs.map(p => {
                let colorStatus = '#ef4444'; // Red
                if (p.status === 'Cerrado') colorStatus = '#10b981'; // Green
                else if (p.status === 'Análisis') colorStatus = '#f59e0b'; // Yellow

                return `
                  <tr>
                    <td style="padding: 5px 4px; border: 1px solid #cbd5e1;"><strong>${p.id}</strong><div style="font-size: 7px; color: #64748b;">${p.date}</div></td>
                    <td style="padding: 5px 4px; border: 1px solid #cbd5e1; font-weight: bold;">${p.type}</td>
                    <td style="padding: 5px 4px; border: 1px solid #cbd5e1;">${p.process}</td>
                    <td style="padding: 5px 4px; border: 1px solid #cbd5e1; font-style: italic;">"${p.desc}"</td>
                    <td style="padding: 5px 4px; border: 1px solid #cbd5e1;">${p.responsible}</td>
                    <td style="padding: 5px 4px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; color: ${colorStatus};">${p.status}</td>
                    <td style="padding: 5px 4px; border: 1px solid #cbd5e1;">
                      <div style="font-weight: bold; color: #1e3a8a;">Rta: ${p.response}</div>
                      ${p.annotations && p.annotations !== 'Sin Anotaciones' ? `<div style="font-size: 7px; color: #64748b; font-style: italic; border-top: 1px dashed #cbd5e1; margin-top: 2px; padding-top: 2px;">Notas: ${p.annotations}</div>` : ''}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    setExportConfig({
      isOpen: true,
      exportType: 'excel',
      title: 'Libro de Registro y Control de PQRS',
      code: 'SGI-REG-PQR-001',
      version: '1.0',
      validity: new Date().toLocaleDateString(),
      columns: cols,
      data: normalizedPqrs,
      history: [
        { date: new Date().toISOString().split('T')[0], version: '1.0', description: 'Registro y seguimiento unificado de peticiones, quejas, reclamos y sugerencias', author: 'Coordinador SGI' }
      ],
      contentHtml: reportHtml
    });
  };

  const selectedPqr = normalizedPqrs.find(p => p.id === selectedPqrId);

  return (
    <>
      <style>{`
        .pqr-row {
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        .pqr-row:hover {
          background-color: var(--bg-secondary) !important;
        }
        .pqr-row.active {
          background-color: var(--bg-tertiary) !important;
          border-left: 3px solid var(--accent-primary) !important;
        }
      `}</style>

      <div style={{display:'flex', justifyContent:'space-between', marginBottom:'1.5rem', alignItems:'center', flexWrap:'wrap', gap:'1rem'}}>
        <div>
          <p style={{color:'var(--text-secondary)', marginBottom:'0.25rem'}}>Gestión de Peticiones, Quejas, Reclamos y Sugerencias</p>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>Gestión de PQRs</h2>
        </div>
        <div style={{display:'flex', gap:'0.5rem', flexWrap:'wrap'}}>
          <button className="btn-secondary" onClick={handleExport}><Download size={16}/> Exportar PQRS</button>
          <button className="btn-primary" onClick={() => handleOpenModal()}><Plus size={16}/> Registrar PQR</button>
        </div>
      </div>

      <div className="card" style={{padding:0, overflow:'hidden'}}>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>ID / Fecha</th>
                <th>Proyecto / Ubicación / Cliente</th>
                <th>Tipo / Proceso</th>
                <th>Descripción</th>
                <th>Responsable</th>
                <th>Estado</th>
                <th>Respuesta y Soportes</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pqrs.length === 0 ? (
                <tr><td colSpan="8" style={{textAlign:'center', padding:'2rem'}}>No hay registros.</td></tr>
              ) : pqrs.map(p => {
                let badgeClass = 'badge-success';
                if (p.status === 'Abierto') badgeClass = 'badge-danger';
                else if (p.status === 'Análisis') badgeClass = 'badge-warning';

                return (
                  <tr 
                    key={p.id}
                    className={`pqr-row ${p.id === selectedPqrId ? 'active' : ''}`}
                    onClick={() => setSelectedPqrId(p.id)}
                  >
                    <td>
                      <strong>{p.id}</strong>
                      <div style={{fontSize:'0.75rem', color:'var(--text-muted)'}}>{p.date}</div>
                    </td>
                    <td>
                      {p.project && <div style={{fontSize:'0.78rem', color:'var(--accent-primary)', fontWeight:600}}>Proy: {p.project}</div>}
                      {p.city && <div style={{fontSize:'0.75rem', color:'var(--text-muted)'}}>Ciudad: {p.city}</div>}
                      {p.client && <div style={{fontSize:'0.75rem', color:'var(--success)'}}>Cliente: {p.client}</div>}
                      {!p.project && !p.city && !p.client && <span style={{color:'var(--text-muted)', fontSize:'0.8rem'}}>-</span>}
                    </td>
                    <td>
                      <span style={{fontWeight:600}}>{p.type}</span>
                      <div style={{fontSize:'0.75rem', color:'var(--text-secondary)'}}>{p.process || 'Sin Asignar'}</div>
                    </td>
                    <td style={{fontSize:'0.85rem', maxWidth:'250px'}}>{p.desc}</td>
                    <td>{p.responsible || '-'}</td>
                    <td><span className={`badge ${badgeClass}`}>{p.status}</span></td>
                    <td>
                      <div style={{fontSize:'0.85rem', maxWidth:'200px', marginBottom:'0.25rem'}}>{p.response || '-'}</div>
                      <div style={{display:'flex', flexDirection:'column', gap:'0.25rem'}}>
                        {p.supportFile && (
                          <span 
                            style={{fontSize:'0.75rem', color:'var(--info)', display:'flex', alignItems:'center', gap:'0.25rem', cursor:'pointer'}} 
                            title="Descargar Soporte Inicial"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.alert(`[HSEQ] Descargando soporte inicial: "${p.supportFile}"`);
                            }}
                          >
                            <Paperclip size={12}/> {p.supportFile}
                          </span>
                        )}
                        {p.responseFile && (
                          <span 
                            style={{fontSize:'0.75rem', color:'var(--success)', display:'flex', alignItems:'center', gap:'0.25rem', cursor:'pointer'}} 
                            title="Descargar Evidencia de Cierre"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.alert(`[HSEQ] Descargando evidencia de respuesta/cierre: "${p.responseFile}"`);
                            }}
                          >
                            <Paperclip size={12}/> {p.responseFile}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{display:'flex', gap:'0.25rem'}}>
                        <button className="btn-icon" style={{padding:'0.25rem', color:'var(--text-muted)'}} onClick={(e) => { e.stopPropagation(); handleOpenModal(p); }}><Edit2 size={14}/></button>
                        <button className="btn-icon" style={{padding:'0.25rem', color:'var(--danger)'}} onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}><Trash2 size={14}/></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SELECTED PQR DETAIL SHEET */}
      {selectedPqr && (
        <div className="card fade-in" style={{ marginTop: '1.5rem', padding: '1.25rem', borderLeft: '4px solid var(--accent-primary)', marginBottom: '2rem' }}>
          
          {/* Ficha Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <span className="badge badge-info" style={{ marginBottom: '0.25rem', display: 'inline-block' }}><MessageSquare size={10} style={{ marginRight: '4px' }} /> Ficha de Control de PQR</span>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>Registro {selectedPqr.id} - {selectedPqr.type}</h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Fecha Registro: <strong>{selectedPqr.date}</strong> | Proceso: <strong>{selectedPqr.process || 'Sin Asignar'}</strong> | Responsable: <strong>{selectedPqr.responsible || 'Sin Asignar'}</strong>
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button className="btn-secondary" style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem' }} onClick={() => handleOpenModal(selectedPqr)}>
                <Edit2 size={12} style={{ marginRight: '4px' }} /> Gestionar / Responder
              </button>
            </div>
          </div>

          {/* Sub tab navigation */}
          <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            <button 
              className={`btn-secondary ${detailTab === 'detail' ? 'active' : ''}`}
              style={{ border: 'none', fontSize: '0.8rem', padding: '0.3rem 0.6rem', background: detailTab === 'detail' ? 'rgba(14, 165, 233, 0.1)' : 'transparent', color: detailTab === 'detail' ? 'var(--accent-primary)' : 'var(--text-secondary)' }}
              onClick={() => setDetailTab('detail')}
            >
              Descripción de PQR
            </button>
            <button 
              className={`btn-secondary ${detailTab === 'response' ? 'active' : ''}`}
              style={{ border: 'none', fontSize: '0.8rem', padding: '0.3rem 0.6rem', background: detailTab === 'response' ? 'rgba(16, 185, 129, 0.1)' : 'transparent', color: detailTab === 'response' ? 'var(--success)' : 'var(--text-secondary)' }}
              onClick={() => setDetailTab('response')}
            >
              Gestión, Cierre e Informe
            </button>
          </div>

          {/* Tab 1: PQR Description and Attachments */}
          {detailTab === 'detail' && (
            <div className="grid-2 fade-in" style={{ gap: '1.25rem' }}>
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Descripción del Caso</h4>
                <div style={{ background: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: '6px', border: '1px solid var(--border-color)', minHeight: '90px' }}>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: '1.4', fontStyle: 'italic' }}>
                    "{selectedPqr.desc}"
                  </p>
                </div>
              </div>
              
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Soportes de Evidencia Inicial</h4>
                {selectedPqr.supportFile ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: 0 }}>
                      <Paperclip size={14} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={selectedPqr.supportFile}>
                        {selectedPqr.supportFile}
                      </span>
                    </div>
                    <button 
                      type="button" 
                      className="btn-secondary" 
                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '2px' }}
                      onClick={() => {
                        window.alert(`[HSEQ] Descargando evidencia soporte inicial: "${selectedPqr.supportFile}"`);
                      }}
                    >
                      <Download size={10} /> Descargar
                    </button>
                  </div>
                ) : (
                  <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '6px', border: '1px dashed var(--border-color)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                    No se adjuntó soporte de evidencia al radicar la PQR.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Response and Cierre */}
          {detailTab === 'response' && (
            <div className="grid-2 fade-in" style={{ gap: '1.25rem' }}>
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Respuesta formal emitida al solicitante</h4>
                <div style={{ background: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: '6px', border: '1px solid var(--border-color)', minHeight: '90px', marginBottom: '1rem' }}>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: selectedPqr.response ? 'var(--text-primary)' : 'var(--text-muted)', lineHeight: '1.4' }}>
                    {selectedPqr.response || 'Aún no se ha redactado una respuesta oficial. Edite la PQR para registrar la gestión.'}
                  </p>
                </div>

                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Anotaciones de Seguimiento / Notas Internas</h4>
                <div style={{ background: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: '6px', border: '1px solid var(--border-color)', minHeight: '60px' }}>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: selectedPqr.annotations ? 'var(--text-primary)' : 'var(--text-muted)', lineHeight: '1.4', fontStyle: 'italic' }}>
                    {selectedPqr.annotations || 'Sin anotaciones de seguimiento internas registradas.'}
                  </p>
                </div>
              </div>
              
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Soporte de Cierre (Evidencia del Cierre / Respuesta)</h4>
                {selectedPqr.responseFile ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: 0 }}>
                      <Paperclip size={14} style={{ color: 'var(--success)', flexShrink: 0 }} />
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={selectedPqr.responseFile}>
                        {selectedPqr.responseFile}
                      </span>
                    </div>
                    <button 
                      type="button" 
                      className="btn-secondary" 
                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '2px' }}
                      onClick={() => {
                        window.alert(`[HSEQ] Descargando soporte de cierre/respuesta: "${selectedPqr.responseFile}"`);
                      }}
                    >
                      <Download size={10} /> Descargar
                    </button>
                  </div>
                ) : (
                  <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '6px', border: '1px dashed var(--border-color)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                    No se ha cargado soporte de respuesta o cierre.
                  </div>
                )}
                
                {/* Status-based Alert */}
                {selectedPqr.status !== 'Cerrado' ? (
                  <div style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '0.65rem', borderRadius: '6px', display: 'flex', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--warning)', marginTop: '0.75rem', alignItems: 'flex-start' }}>
                    <Clock size={15} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--warning)' }} />
                    <div>
                      <strong>Caso Pendiente de Gestión:</strong> Esta PQR está en estado `{selectedPqr.status}`. Se recomienda realizar el análisis de causa raíz y responder antes del vencimiento legal del PQR.
                    </div>
                  </div>
                ) : (
                  <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '0.65rem', borderRadius: '6px', display: 'flex', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--success)', marginTop: '0.75rem', alignItems: 'flex-start' }}>
                    <CheckCircle size={15} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--success)' }} />
                    <div>
                      <strong>Caso Cerrado con Éxito:</strong> La PQR ha sido gestionada y cerrada formalmente. La respuesta fue entregada de forma conforme.
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingItem ? "Gestionar PQR" : "Registrar PQR"}
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
              <label className="form-label">Tipo</label>
              <select className="form-control" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} required>
                <option value="Petición">Petición</option>
                <option value="Queja">Queja</option>
                <option value="Reclamo">Reclamo</option>
                <option value="Sugerencia">Sugerencia</option>
                <option value="Felicitación">Felicitación</option>
              </select>
            </div>
            <div className="form-group" style={{flex:1}}>
              <label className="form-label">Fecha</label>
              <input type="date" className="form-control" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
            </div>
          </div>
          <div style={{display:'flex', gap:'1rem'}}>
            <div className="form-group" style={{flex:1}}>
              <label className="form-label">Proceso Involucrado</label>
              <input type="text" className="form-control" value={formData.process} onChange={e => setFormData({...formData, process: e.target.value})} placeholder="Ej: Operaciones" />
            </div>
            <div className="form-group" style={{flex:1}}>
              <label className="form-label">Responsable del Análisis</label>
              <select className="form-control" value={formData.responsible} onChange={e => setFormData({...formData, responsible: e.target.value})}>
                <option value="">Ninguno / Seleccione Usuario...</option>
                {APP_USERS.map(u => <option key={u.email} value={u.name}>{u.name}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Descripción Detallada</label>
            <textarea className="form-control" value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})} rows="3" required></textarea>
          </div>
          
          <div className="form-group">
            <label className="form-label">Soporte Inicial (Evidencia PQR)</label>
            <div style={{display:'flex', alignItems:'center', gap:'0.5rem', background:'var(--bg-secondary)', padding:'0.5rem', borderRadius:'var(--radius-sm)', border:'1px dashed var(--border-color)'}}>
              <input type="file" id="file-support" style={{display:'none'}} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={handleSupportFileChange} />
              <label htmlFor="file-support" className="btn-secondary" style={{cursor:'pointer', margin:0, padding:'0.3rem 0.75rem', fontSize:'0.8rem'}}>
                <Upload size={14} style={{marginRight:'4px'}}/> {formData.supportFile ? 'Cambiar Soporte' : 'Subir Soporte'}
              </label>
              <span style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>{formData.supportFile || 'Formatos: PDF, Imágenes, Word.'}</span>
            </div>
          </div>

          <div style={{borderTop:'1px solid var(--border-color)', margin:'0.5rem 0'}}></div>

          <div className="form-group">
            <label className="form-label">Estado de la PQR</label>
            <select className="form-control" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} required>
              <option value="Abierto">Abierto</option>
              <option value="Análisis">En Análisis / Gestión</option>
              <option value="Cerrado">Cerrado</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Respuesta al Solicitante / Gestión Realizada</label>
            <textarea className="form-control" value={formData.response} onChange={e => setFormData({...formData, response: e.target.value})} rows="2"></textarea>
          </div>

          <div className="form-group">
            <label className="form-label">Anotaciones de Seguimiento / Notas Internas</label>
            <textarea className="form-control" value={formData.annotations} onChange={e => setFormData({...formData, annotations: e.target.value})} rows="2" placeholder="Notas internas sobre el estado de la gestión..."></textarea>
          </div>

          <div className="form-group">
            <label className="form-label">Evidencia de Respuesta o Cierre</label>
            <div style={{display:'flex', alignItems:'center', gap:'0.5rem', background:'var(--bg-secondary)', padding:'0.5rem', borderRadius:'var(--radius-sm)', border:'1px dashed var(--border-color)'}}>
              <input type="file" id="file-response" style={{display:'none'}} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={handleResponseFileChange} />
              <label htmlFor="file-response" className="btn-secondary" style={{cursor:'pointer', margin:0, padding:'0.3rem 0.75rem', fontSize:'0.8rem'}}>
                <Upload size={14} style={{marginRight:'4px'}}/> {formData.responseFile ? 'Cambiar Evidencia' : 'Subir Evidencia'}
              </label>
              <span style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>{formData.responseFile || 'Formatos: PDF, Imágenes, Word.'}</span>
            </div>
          </div>
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
