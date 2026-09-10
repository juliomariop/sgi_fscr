import React, { useState, useEffect } from 'react';
import { 
  Presentation, Plus, Download, Edit2, Trash2, FileText, Upload, Paperclip,
  CheckCircle, Clock, AlertTriangle, UserCheck, CheckSquare, Calendar,
  ArrowRight, FileCheck, HelpCircle, ClipboardList, Activity
} from 'lucide-react';
import Modal from '../components/Modal';
import { downloadCSV } from '../utils/exportUtils';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAppUsers } from '../hooks/useAppUsers';

export default function ManagementReviews() {
  const APP_USERS = useAppUsers();

  const [reviews, setReviews] = useLocalStorage('sgi_reviews', [
    { id: 1, period: '2025', date: '2026-02-15', status: 'Cerrada', mode: 'Adjunto', document: 'Acta_Rev_Direccion_2025.pdf', conclusions: 'El sistema es adecuado y conveniente. Se aprobaron recursos para 2026.' },
    { id: 2, period: '2026', date: '2027-02-10', status: 'Programada', mode: 'Manual', document: null, conclusions: '' }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedReviewId, setSelectedReviewId] = useState(null);
  const [detailTab, setDetailTab] = useState('inputs'); // inputs, outputs, followup
  const [newFollowupText, setNewFollowupText] = useState('');
  const [newFollowupResp, setNewFollowupResp] = useState('');
  const [newFollowupDeadline, setNewFollowupDeadline] = useState('');

  const [formData, setFormData] = useState({
    period: new Date().getFullYear().toString(), date: '', status: 'Programada', mode: 'Adjunto', document: null,
    in_previas: '', in_cambios: '', in_politica_objetivos: '', in_satisfaccion: '', in_nc_correctivas: '',
    in_desempeno_procesos: '', in_auditorias: '', in_recursos: '', in_comunicaciones: '', in_consulta_trabajadores: '', 
    in_oportunidades_mejora: '',
    out_conclusiones: '', out_oportunidades: '', out_cambiosSGI: '', out_recursos: '', out_implicaciones: '', conclusions: ''
  });

  // Normalize reviews to prevent crashes and load default contents
  const normalizedReviews = reviews.map(r => {
    const defaultFollowups = r.id === 1 ? [
      { id: 1, description: 'Adquirir luxómetro y sonómetro calibrados para inspecciones de Higiene.', responsible: APP_USERS[0]?.name || 'Coordinador SST', deadline: '2026-04-30', status: 'Completado' },
      { id: 2, description: 'Modificar caracterización del proceso comercial B2B.', responsible: APP_USERS[1]?.name || 'Líder Comercial', deadline: '2026-03-31', status: 'Completado' },
      { id: 3, description: 'Iniciar cotización y compra del software de gestión HSEQ.', responsible: APP_USERS[2]?.name || 'Gerente General', deadline: '2026-06-15', status: 'En Ejecución' },
      { id: 4, description: 'Implementar calzado de seguridad ergonómico para operaciones.', responsible: APP_USERS[3]?.name || 'Líder de Operaciones', deadline: '2026-05-20', status: 'Completado' }
    ] : [];

    return {
      ...r,
      mode: r.mode || 'Adjunto',
      in_previas: r.in_previas || (r.id === 1 ? 'Se cerraron el 90% de los compromisos de la revisión 2024. Quedó pendiente la capacitación especializada en RESPEL, la cual se programó para el primer trimestre de 2025.' : ''),
      in_cambios: r.in_cambios || (r.id === 1 ? 'Ingreso de una nueva línea de negocio comercial. Aumento de personal operativo en un 15%.' : ''),
      in_politica_objetivos: r.in_politica_objetivos || (r.id === 1 ? 'Cumplimiento global de objetivos en un 94%. El indicador de accidentalidad cerró por debajo del límite tolerado.' : ''),
      in_satisfaccion: r.in_satisfaccion || (r.id === 1 ? 'El índice NPS de satisfacción del cliente cerró en 89%. Las partes interesadas solicitan respuestas más rápidas en cotizaciones.' : ''),
      in_nc_correctivas: r.in_nc_correctivas || (r.id === 1 ? 'Se abrieron 14 planes de acción: 11 cerrados eficazmente y 3 en seguimiento de verificación de eficacia.' : ''),
      in_desempeno_procesos: r.in_desempeno_procesos || (r.id === 1 ? 'Los procesos estratégicos y de apoyo cumplieron sus KPIs. El proceso operativo presentó demoras puntuales en la entrega de informes de calibración.' : ''),
      in_auditorias: r.in_auditorias || (r.id === 1 ? 'Se ejecutó la auditoría interna en octubre 2025 y la externa de SGS en diciembre 2025, obteniendo la renovación de la certificación.' : ''),
      in_recursos: r.in_recursos || (r.id === 1 ? 'Presupuesto ejecutado al 98%. Se requiere refuerzo en los equipos de medición (luxómetro y sonómetro).' : ''),
      in_comunicaciones: r.in_comunicaciones || (r.id === 1 ? 'Se atendieron 3 quejas de vecinos por ruidos y se implementaron barreras acústicas temporales.' : ''),
      in_consulta_trabajadores: r.in_consulta_trabajadores || (r.id === 1 ? 'El COPASST sesionó activamente. Se recibió sugerencia de mejorar el calzado de seguridad operacional.' : ''),
      in_oportunidades_mejora: r.in_oportunidades_mejora || (r.id === 1 ? 'Digitalización total de las listas de chequeo preoperacionales para eliminar el soporte en papel.' : ''),
      out_conclusiones: r.out_conclusiones || (r.id === 1 ? 'El SGI es idóneo, adecuado y eficaz. Se evidencia compromiso de la alta dirección y la cultura de prevención.' : ''),
      out_oportunidades: r.out_oportunidades || (r.id === 1 ? 'Aprobar el proyecto de software HSEQ en la nube para automatizar reportes (inversión de $4,500 USD).' : ''),
      out_cambiosSGI: r.out_cambiosSGI || (r.id === 1 ? 'Modificar la caracterización del proceso comercial para incluir el nuevo canal digital B2B.' : ''),
      out_recursos: r.out_recursos || (r.id === 1 ? 'Asignar presupuesto adicional para la adquisición de equipos de medición certificados y renovación del calzado de seguridad.' : ''),
      out_implicaciones: r.out_implicaciones || (r.id === 1 ? 'Alinear el plan estratégico HSEQ 2026 con la meta corporativa de reducción de la huella de carbono en un 5%.' : ''),
      conclusions: r.conclusions || (r.id === 1 ? 'El SGI es idóneo, adecuado y eficaz. Se evidencia compromiso de la alta dirección y la cultura de prevención.' : ''),
      followups: r.followups || defaultFollowups
    };
  });

  // Auto-select first review
  useEffect(() => {
    if (normalizedReviews.length > 0 && !selectedReviewId) {
      setSelectedReviewId(normalizedReviews[0].id);
    }
  }, [normalizedReviews, selectedReviewId]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, document: file.name });
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({ 
        ...item, 
        mode: item.mode || 'Adjunto',
        in_previas: item.in_previas || '',
        in_cambios: item.in_cambios || '',
        in_politica_objetivos: item.in_politica_objetivos || '',
        in_satisfaccion: item.in_satisfaccion || '',
        in_nc_correctivas: item.in_nc_correctivas || '',
        in_desempeno_procesos: item.in_desempeno_procesos || '',
        in_auditorias: item.in_auditorias || '',
        in_recursos: item.in_recursos || '',
        in_comunicaciones: item.in_comunicaciones || '',
        in_consulta_trabajadores: item.in_consulta_trabajadores || '',
        in_oportunidades_mejora: item.in_oportunidades_mejora || '',
        out_conclusiones: item.out_conclusiones || '',
        out_oportunidades: item.out_oportunidades || '',
        out_cambiosSGI: item.out_cambiosSGI || '',
        out_recursos: item.out_recursos || '',
        out_implicaciones: item.out_implicaciones || ''
      });
    } else {
      setEditingItem(null);
      setFormData({ 
        period: new Date().getFullYear().toString(), date: '', status: 'Programada', mode: 'Adjunto', document: null,
        in_previas: '', in_cambios: '', in_politica_objetivos: '', in_satisfaccion: '', in_nc_correctivas: '',
        in_desempeno_procesos: '', in_auditorias: '', in_recursos: '', in_comunicaciones: '', in_consulta_trabajadores: '', 
        in_oportunidades_mejora: '',
        out_conclusiones: '', out_oportunidades: '', out_cambiosSGI: '', out_recursos: '', out_implicaciones: '', conclusions: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingItem) {
      setReviews(reviews.map(r => r.id === editingItem.id ? { 
        ...formData, 
        id: r.id,
        followups: editingItem.followups || [] 
      } : r));
    } else {
      const newReview = { 
        ...formData, 
        id: Date.now(),
        followups: [] 
      };
      setReviews([...reviews, newReview]);
      setSelectedReviewId(newReview.id);
    }
    handleCloseModal();
  };

  const handleAddFollowup = (e, reviewId) => {
    e.preventDefault();
    if (!newFollowupText.trim() || !newFollowupResp || !newFollowupDeadline) return;

    const newTask = {
      id: Date.now(),
      description: newFollowupText.trim(),
      responsible: newFollowupResp,
      deadline: newFollowupDeadline,
      status: 'Pendiente'
    };

    const updated = normalizedReviews.map(r => {
      if (r.id === reviewId) {
        return {
          ...r,
          followups: [...(r.followups || []), newTask]
        };
      }
      return r;
    });

    setReviews(updated);
    setNewFollowupText('');
    setNewFollowupResp('');
    setNewFollowupDeadline('');
  };

  const handleDeleteFollowup = (reviewId, taskId) => {
    if (window.confirm("¿Está seguro de eliminar esta acción de seguimiento?")) {
      const updated = normalizedReviews.map(r => {
        if (r.id === reviewId) {
          return {
            ...r,
            followups: (r.followups || []).filter(t => t.id !== taskId)
          };
        }
        return r;
      });
      setReviews(updated);
    }
  };

  const handleUpdateFollowupStatus = (reviewId, taskId, newStatus) => {
    const updated = normalizedReviews.map(r => {
      if (r.id === reviewId) {
        const updatedFollowups = (r.followups || []).map(t => 
          t.id === taskId ? { ...t, status: newStatus } : t
        );
        return {
          ...r,
          followups: updatedFollowups
        };
      }
      return r;
    });
    setReviews(updated);
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Está seguro de eliminar esta revisión por la dirección?")) {
      const remaining = reviews.filter(r => r.id !== id);
      setReviews(remaining);
      if (selectedReviewId === id) {
        setSelectedReviewId(remaining[0]?.id || null);
      }
    }
  };

  const selectedReview = normalizedReviews.find(r => r.id === selectedReviewId);
  const totalTasks = selectedReview ? (selectedReview.followups || []).length : 0;
  const completedTasks = selectedReview ? (selectedReview.followups || []).filter(t => t.status === 'Completado').length : 0;
  const pct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const inputsConfig = selectedReview ? [
    { label: 'Acciones de Revisiones Previas', value: selectedReview.in_previas, icon: <ArrowRight size={12}/> },
    { label: 'Cambios Contexto Interno/Externo', value: selectedReview.in_cambios, icon: <ArrowRight size={12}/> },
    { label: 'Cumplimiento de Política y Objetivos', value: selectedReview.in_politica_objetivos, icon: <ArrowRight size={12}/> },
    { label: 'Satisfacción y Partes Interesadas', value: selectedReview.in_satisfaccion, icon: <ArrowRight size={12}/> },
    { label: 'No Conformidades y Acciones Correctivas', value: selectedReview.in_nc_correctivas, icon: <ArrowRight size={12}/> },
    { label: 'Desempeño y Conformidad Legal', value: selectedReview.in_desempeno_procesos, icon: <ArrowRight size={12}/> },
    { label: 'Resultados de Auditorías', value: selectedReview.in_auditorias, icon: <ArrowRight size={12}/> },
    { label: 'Adecuación de Recursos', value: selectedReview.in_recursos, icon: <ArrowRight size={12}/> },
    { label: 'Comunicaciones y Quejas', value: selectedReview.in_comunicaciones, icon: <ArrowRight size={12}/> },
    { label: 'Participación y Consulta (SST)', value: selectedReview.in_consulta_trabajadores, icon: <ArrowRight size={12}/> },
    { label: 'Oportunidades de Mejora Continua', value: selectedReview.in_oportunidades_mejora, icon: <ArrowRight size={12}/> }
  ] : [];

  const outputsConfig = selectedReview ? [
    { label: 'Conclusiones sobre Conveniencia, Adecuación y Eficacia', value: selectedReview.out_conclusiones, color: 'rgba(14, 165, 233, 0.05)', borderColor: 'rgba(14, 165, 233, 0.2)', titleColor: 'var(--accent-primary)' },
    { label: 'Decisiones sobre Oportunidades de Mejora Continua', value: selectedReview.out_oportunidades, color: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.2)', titleColor: 'var(--success)' },
    { label: 'Necesidades de Cambio en el Sistema de Gestión (SGI)', value: selectedReview.out_cambiosSGI, color: 'rgba(245, 158, 11, 0.05)', borderColor: 'rgba(245, 158, 11, 0.2)', titleColor: 'var(--warning)' },
    { label: 'Necesidades de Recursos y Financiamiento', value: selectedReview.out_recursos, color: 'rgba(99, 102, 241, 0.05)', borderColor: 'rgba(99, 102, 241, 0.2)', titleColor: 'var(--info)' },
    { label: 'Implicaciones para el Direccionamiento Estratégico', value: selectedReview.out_implicaciones, color: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.2)', titleColor: 'var(--danger)' }
  ] : [];

  const handleExport = () => downloadCSV(normalizedReviews, "Revisiones_Direccion");

  return (
    <>
      <style>{`
        .review-row {
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        .review-row:hover {
          background-color: var(--bg-secondary) !important;
        }
        .review-row.active {
          background-color: var(--bg-tertiary) !important;
          border-left: 3px solid var(--accent-primary) !important;
        }
        
        .input-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          padding: 0.75rem;
          border-radius: 6px;
          font-size: 0.8rem;
        }
        
        .input-card-title {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--accent-primary);
          text-transform: uppercase;
          margin-bottom: 0.25rem;
          display: flex;
          align-items: center;
          gap: 4px;
        }
      `}</style>

      <div style={{display:'flex', justifyContent:'space-between', marginBottom:'1.5rem', alignItems:'center', flexWrap:'wrap', gap:'1rem'}}>
        <div>
          <p style={{color:'var(--text-secondary)', marginBottom:'0.25rem'}}>Revisión por la Dirección (ISO 9001/14001/45001 - Cl. 9.3)</p>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>Revisiones por la Dirección</h2>
        </div>
        <div style={{display:'flex', gap:'0.5rem', flexWrap:'wrap'}}>
          <button className="btn-secondary" onClick={handleExport}><Download size={16}/> Exportar Datos</button>
          <button className="btn-primary" onClick={() => handleOpenModal()}><Plus size={16}/> Programar Revisión</button>
        </div>
      </div>

      <div className="card" style={{padding:0, overflow:'hidden'}}>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Periodo Evaluado</th>
                <th>Fecha de Reunión</th>
                <th>Estado</th>
                <th>Conclusiones Principales</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {normalizedReviews.length === 0 ? (
                <tr><td colSpan="5" style={{textAlign:'center', padding:'2rem'}}>No hay revisiones registradas.</td></tr>
              ) : normalizedReviews.map(r => {
                let badgeClass = r.status === 'Cerrada' ? 'badge-success' : 'badge-info';

                return (
                  <tr 
                    key={r.id} 
                    className={`review-row ${r.id === selectedReviewId ? 'active' : ''}`}
                    onClick={() => setSelectedReviewId(r.id)}
                  >
                    <td><strong>{r.period}</strong></td>
                    <td>{r.date}</td>
                    <td><span className={`badge ${badgeClass}`}>{r.status}</span></td>
                    <td>
                      {r.status === 'Cerrada' ? (
                        <>
                          <div style={{fontSize:'0.85rem', maxWidth:'300px'}}>
                            {r.mode === 'Manual' ? 'Revisión ingresada manualmente (Ver detalles)' : r.conclusions}
                          </div>
                          {r.document && (
                            <div 
                              style={{fontSize:'0.75rem', color:'var(--info)', marginTop:'0.25rem', display:'flex', alignItems:'center', gap:'0.25rem', cursor:'pointer'}} 
                              title="Descargar Informe"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.alert(`[HSEQ] Descargando informe de revisión: "${r.document}"`);
                              }}
                            >
                              <Paperclip size={12}/> {r.document}
                            </div>
                          )}
                        </>
                      ) : (
                        <span style={{fontSize:'0.85rem', color:'var(--text-muted)'}}>Pendiente</span>
                      )}
                    </td>
                    <td>
                      <div style={{display:'flex', gap:'0.25rem'}}>
                        <button className="btn-icon" style={{padding:'0.25rem', color:'var(--text-muted)'}} onClick={(e) => { e.stopPropagation(); handleOpenModal(r); }}><Edit2 size={14}/></button>
                        <button className="btn-icon" style={{padding:'0.25rem', color:'var(--danger)'}} onClick={(e) => { e.stopPropagation(); handleDelete(r.id); }}><Trash2 size={14}/></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SELECTED REVIEW DETAIL SHEET */}
      {selectedReview && (
        <div className="card fade-in" style={{ marginTop: '1.5rem', padding: '1.25rem', borderLeft: '4px solid var(--accent-primary)', marginBottom: '2rem' }}>
          
          {/* Ficha Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <span className="badge badge-info" style={{ marginBottom: '0.25rem', display: 'inline-block' }}><Presentation size={10} style={{ marginRight: '4px' }} /> Ficha de Control de Revisión por la Dirección</span>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>Revisión Periodo {selectedReview.period}</h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Fecha Reunión: <strong>{selectedReview.date}</strong> | Modalidad: <strong>{selectedReview.mode}</strong> | Estado: <span className="badge badge-success" style={{ fontSize: '0.68rem', padding: '0.05rem 0.3rem' }}>{selectedReview.status}</span>
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button className="btn-secondary" style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem' }} onClick={() => handleOpenModal(selectedReview)}>
                <Edit2 size={12} style={{ marginRight: '4px' }} /> Editar Revisión
              </button>
            </div>
          </div>

          {/* Sub tab navigation */}
          <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            <button 
              className={`btn-secondary ${detailTab === 'inputs' ? 'active' : ''}`}
              style={{ border: 'none', fontSize: '0.8rem', padding: '0.3rem 0.6rem', background: detailTab === 'inputs' ? 'rgba(14, 165, 233, 0.1)' : 'transparent', color: detailTab === 'inputs' ? 'var(--accent-primary)' : 'var(--text-secondary)' }}
              onClick={() => setDetailTab('inputs')}
            >
              <Activity size={12} style={{ marginRight: '3px' }} /> Entradas SGI
            </button>
            <button 
              className={`btn-secondary ${detailTab === 'outputs' ? 'active' : ''}`}
              style={{ border: 'none', fontSize: '0.8rem', padding: '0.3rem 0.6rem', background: detailTab === 'outputs' ? 'rgba(16, 185, 129, 0.1)' : 'transparent', color: detailTab === 'outputs' ? 'var(--success)' : 'var(--text-secondary)' }}
              onClick={() => setDetailTab('outputs')}
            >
              <FileCheck size={12} style={{ marginRight: '3px' }} /> Decisiones y Salidas
            </button>
            <button 
              className={`btn-secondary ${detailTab === 'followup' ? 'active' : ''}`}
              style={{ border: 'none', fontSize: '0.8rem', padding: '0.3rem 0.6rem', background: detailTab === 'followup' ? 'rgba(245, 158, 11, 0.1)' : 'transparent', color: detailTab === 'followup' ? 'var(--warning)' : 'var(--text-secondary)' }}
              onClick={() => setDetailTab('followup')}
            >
              <ClipboardList size={12} style={{ marginRight: '3px' }} /> Plan de Seguimiento ({totalTasks})
            </button>
          </div>

          {/* Tab 1: Inputs */}
          {detailTab === 'inputs' && (
            <div>
              {selectedReview.mode === 'Adjunto' && (
                <div style={{ background: 'rgba(14, 165, 233, 0.04)', border: '1px solid rgba(14, 165, 233, 0.2)', padding: '0.65rem', borderRadius: '6px', display: 'flex', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--accent-primary)', marginBottom: '0.75rem', alignItems: 'flex-start' }}>
                  <HelpCircle size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    El informe fue cargado como archivo digital adjunto. Las entradas detalladas se encuentran redactadas en el documento de soporte.
                  </div>
                </div>
              )}
              <div className="grid-2 fade-in" style={{ gap: '0.75rem', maxHeight: '350px', overflowY: 'auto', paddingRight: '4px' }}>
                {inputsConfig.map((inp, idx) => (
                  <div key={idx} className="input-card">
                    <div className="input-card-title">
                      {inp.icon} {inp.label}
                    </div>
                    <p style={{ margin: 0, color: 'var(--text-primary)', lineHeight: '1.4' }}>
                      {inp.value || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Sin información registrada en esta entrada.</span>}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: Outputs */}
          {detailTab === 'outputs' && (
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {selectedReview.mode === 'Adjunto' && (
                <div style={{ background: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: '6px', border: '1px solid var(--border-color)', borderLeft: '4px solid var(--accent-primary)' }}>
                  <h5 style={{ fontSize: '0.8rem', fontWeight: 700, margin: '0 0 0.4rem', color: 'var(--text-secondary)' }}>Conclusiones Generales del Acta Adjunta</h5>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                    {selectedReview.conclusions || 'El SGI es idóneo, adecuado y eficaz. Se evidencia compromiso de la alta dirección y la cultura de prevención.'}
                  </p>
                </div>
              )}
              
              <div className="grid-2" style={{ gap: '0.75rem' }}>
                {outputsConfig.map((out, idx) => (
                  <div key={idx} style={{ background: out.color, border: '1px solid ' + out.borderColor, padding: '0.75rem', borderRadius: '6px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: out.titleColor, textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                      {out.label}
                    </div>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                      {out.value || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Sin decisiones específicas registradas.</span>}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Followup */}
          {detailTab === 'followup' && (
            <div className="fade-in">
              
              {/* Progress Bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', marginBottom: '0.75rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Progreso de Acciones de Seguimiento</span>
                    <span style={{ color: 'var(--success)' }}>{completedTasks} / {totalTasks} Completadas ({pct}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: 'var(--success)', transition: 'width 0.4s ease' }} />
                  </div>
                </div>
              </div>

              {/* Tasks List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', maxHeight: '180px', overflowY: 'auto', marginBottom: '0.75rem', paddingRight: '2px' }}>
                {selectedReview.followups.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.78rem', border: '1px dashed var(--border-color)', borderRadius: '6px' }}>
                    No hay compromisos o acciones de seguimiento pendientes de registrar para esta revisión.
                  </div>
                ) : (
                  selectedReview.followups.map(task => (
                    <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.45rem 0.65rem', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', gap: '0.5rem' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-primary)', fontWeight: 600, textDecoration: task.status === 'Completado' ? 'line-through' : 'none', opacity: task.status === 'Completado' ? 0.6 : 1 }}>
                          {task.description}
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                          <span>Responsable: <strong>{task.responsible}</strong></span>
                          <span>•</span>
                          <span>Límite: <strong>{task.deadline}</strong></span>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '2px', alignItems: 'center', flexShrink: 0 }}>
                        <button 
                          type="button"
                          style={{
                            padding: '0.15rem 0.35rem',
                            fontSize: '0.68rem',
                            borderRadius: '4px 0 0 4px',
                            background: task.status === 'Pendiente' ? 'var(--warning)' : 'var(--bg-secondary)',
                            color: task.status === 'Pendiente' ? 'black' : 'var(--text-secondary)',
                            border: '1px solid ' + (task.status === 'Pendiente' ? 'var(--warning)' : 'var(--border-color)'),
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                          onClick={() => handleUpdateFollowupStatus(selectedReview.id, task.id, 'Pendiente')}
                        >
                          Pendiente
                        </button>
                        <button 
                          type="button"
                          style={{
                            padding: '0.15rem 0.35rem',
                            fontSize: '0.68rem',
                            borderRadius: '0',
                            background: task.status === 'En Ejecución' ? 'var(--info)' : 'var(--bg-secondary)',
                            color: task.status === 'En Ejecución' ? 'white' : 'var(--text-secondary)',
                            border: '1px solid ' + (task.status === 'En Ejecución' ? 'var(--info)' : 'var(--border-color)'),
                            borderLeft: 'none',
                            borderRight: 'none',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                          onClick={() => handleUpdateFollowupStatus(selectedReview.id, task.id, 'En Ejecución')}
                        >
                          Proceso
                        </button>
                        <button 
                          type="button"
                          style={{
                            padding: '0.15rem 0.35rem',
                            fontSize: '0.68rem',
                            borderRadius: '0 4px 4px 0',
                            background: task.status === 'Completado' ? 'var(--success)' : 'var(--bg-secondary)',
                            color: task.status === 'Completado' ? 'white' : 'var(--text-secondary)',
                            border: '1px solid ' + (task.status === 'Completado' ? 'var(--success)' : 'var(--border-color)'),
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                          onClick={() => handleUpdateFollowupStatus(selectedReview.id, task.id, 'Completado')}
                        >
                          Cumplido
                        </button>
                        
                        <button 
                          type="button"
                          className="btn-icon"
                          style={{ padding: '0.15rem', marginLeft: '0.3rem', color: 'var(--danger)' }}
                          onClick={() => handleDeleteFollowup(selectedReview.id, task.id)}
                          title="Eliminar compromiso"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add Followup Form */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.65rem' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Crear Compromiso de Seguimiento (Acción)</div>
                <form onSubmit={(e) => handleAddFollowup(e, selectedReview.id)} style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <input 
                    type="text" 
                    placeholder="Describa la acción correctiva o de mejora..." 
                    className="form-control" 
                    style={{ flex: '2 1 200px', fontSize: '0.78rem', padding: '0.3rem 0.5rem' }} 
                    value={newFollowupText}
                    onChange={e => setNewFollowupText(e.target.value)}
                    required 
                  />
                  
                  <select 
                    className="form-control" 
                    style={{ flex: '1 1 120px', fontSize: '0.78rem', padding: '0.3rem 0.5rem' }}
                    value={newFollowupResp}
                    onChange={e => setNewFollowupResp(e.target.value)}
                    required
                  >
                    <option value="">Responsable...</option>
                    {APP_USERS.map(user => (
                      <option key={user.id} value={user.name}>{user.name}</option>
                    ))}
                  </select>
                  
                  <input 
                    type="date" 
                    className="form-control" 
                    style={{ flex: '1 1 110px', fontSize: '0.78rem', padding: '0.3rem 0.5rem' }}
                    value={newFollowupDeadline}
                    onChange={e => setNewFollowupDeadline(e.target.value)}
                    required
                  />
                  
                  <button type="submit" className="btn-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.2rem', flexShrink: 0 }}>
                    <Plus size={12} /> Registrar
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
        title={editingItem ? "Editar Revisión" : "Programar Revisión por la Dirección"}
      >
        <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
          <div style={{display:'flex', gap:'1rem'}}>
            <div className="form-group" style={{flex:1}}>
              <label className="form-label">Periodo Evaluado (Año)</label>
              <input type="text" className="form-control" value={formData.period} onChange={e => setFormData({...formData, period: e.target.value})} required />
            </div>
            <div className="form-group" style={{flex:1}}>
              <label className="form-label">Fecha de Reunión</label>
              <input type="date" className="form-control" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Estado</label>
            <select className="form-control" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} required>
              <option value="Programada">Programada</option>
              <option value="En Proceso">En Proceso</option>
              <option value="Cerrada">Cerrada</option>
            </select>
          </div>
          
          {formData.status === 'Cerrada' && (
            <div style={{borderTop:'1px solid var(--border-color)', paddingTop:'1rem', marginTop:'0.5rem'}}>
              <h4 style={{fontSize:'1rem', marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.5rem'}}><FileText size={18} style={{color:'var(--accent-primary)'}}/> Informe de Revisión por la Dirección</h4>
              
              <div className="form-group" style={{marginBottom:'1rem'}}>
                <label className="form-label">Modalidad de Carga</label>
                <div style={{display:'flex', gap:'1rem'}}>
                  <label style={{display:'flex', alignItems:'center', gap:'0.5rem', cursor:'pointer', fontSize:'0.9rem'}}>
                    <input type="radio" name="mode" value="Adjunto" checked={formData.mode === 'Adjunto'} onChange={() => setFormData({...formData, mode: 'Adjunto'})} />
                    Adjuntar Informe en PDF / Word
                  </label>
                  <label style={{display:'flex', alignItems:'center', gap:'0.5rem', cursor:'pointer', fontSize:'0.9rem'}}>
                    <input type="radio" name="mode" value="Manual" checked={formData.mode === 'Manual'} onChange={() => setFormData({...formData, mode: 'Manual'})} />
                    Ingreso Manual (Estructura ISO)
                  </label>
                </div>
              </div>

              {formData.mode === 'Adjunto' ? (
                <>
                  <div className="form-group">
                    <label className="form-label">Archivo del Informe</label>
                    <div style={{display:'flex', alignItems:'center', gap:'0.5rem', background:'var(--bg-secondary)', padding:'0.5rem', borderRadius:'var(--radius-sm)', border:'1px dashed var(--border-color)'}}>
                      <input type="file" id="file-upload-rev" style={{display:'none'}} accept=".doc,.docx,.pdf" onChange={handleFileChange} />
                      <label htmlFor="file-upload-rev" className="btn-secondary" style={{cursor:'pointer', margin:0, padding:'0.3rem 0.75rem', fontSize:'0.8rem'}}>
                        <Upload size={14} style={{marginRight:'4px'}}/> {formData.document ? 'Cambiar Informe' : 'Subir Informe'}
                      </label>
                      <span style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>
                        {formData.document ? formData.document : 'Formatos: Word, PDF.'}
                      </span>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Conclusiones Principales (Opcional)</label>
                    <textarea className="form-control" value={formData.conclusions} onChange={e => setFormData({...formData, conclusions: e.target.value})} rows="2" placeholder="Resumen rápido de las decisiones..."></textarea>
                  </div>
                </>
              ) : (
                <div style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
                  <div style={{background:'var(--bg-secondary)', padding:'1rem', borderRadius:'var(--radius-sm)'}}>
                    <h5 style={{fontSize:'0.9rem', marginBottom:'0.5rem', color:'var(--accent-primary)'}}>Entradas para la Revisión (ISO 9001, 14001, 45001)</h5>
                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label" style={{fontSize:'0.8rem'}}>Estado de las acciones de las revisiones por la dirección previas</label>
                        <textarea className="form-control" value={formData.in_previas} onChange={e => setFormData({...formData, in_previas: e.target.value})} rows="2"></textarea>
                      </div>
                      <div className="form-group">
                        <label className="form-label" style={{fontSize:'0.8rem'}}>Cambios en las cuestiones externas e internas relevantes, necesidades y expectativas</label>
                        <textarea className="form-control" value={formData.in_cambios} onChange={e => setFormData({...formData, in_cambios: e.target.value})} rows="2"></textarea>
                      </div>
                      <div className="form-group">
                        <label className="form-label" style={{fontSize:'0.8rem'}}>Grado de cumplimiento de la Política y Objetivos</label>
                        <textarea className="form-control" value={formData.in_politica_objetivos} onChange={e => setFormData({...formData, in_politica_objetivos: e.target.value})} rows="2"></textarea>
                      </div>
                      <div className="form-group">
                        <label className="form-label" style={{fontSize:'0.8rem'}}>Satisfacción del cliente y retroalimentación de partes interesadas</label>
                        <textarea className="form-control" value={formData.in_satisfaccion} onChange={e => setFormData({...formData, in_satisfaccion: e.target.value})} rows="2"></textarea>
                      </div>
                      <div className="form-group">
                        <label className="form-label" style={{fontSize:'0.8rem'}}>No conformidades, acciones correctivas e incidentes</label>
                        <textarea className="form-control" value={formData.in_nc_correctivas} onChange={e => setFormData({...formData, in_nc_correctivas: e.target.value})} rows="2"></textarea>
                      </div>
                      <div className="form-group">
                        <label className="form-label" style={{fontSize:'0.8rem'}}>Desempeño de los procesos, conformidad y cumplimiento de requisitos legales</label>
                        <textarea className="form-control" value={formData.in_desempeno_procesos} onChange={e => setFormData({...formData, in_desempeno_procesos: e.target.value})} rows="2"></textarea>
                      </div>
                      <div className="form-group">
                        <label className="form-label" style={{fontSize:'0.8rem'}}>Resultados de Auditorías (Internas y Externas)</label>
                        <textarea className="form-control" value={formData.in_auditorias} onChange={e => setFormData({...formData, in_auditorias: e.target.value})} rows="2"></textarea>
                      </div>
                      <div className="form-group">
                        <label className="form-label" style={{fontSize:'0.8rem'}}>Adecuación de los recursos para mantener un SGI eficaz</label>
                        <textarea className="form-control" value={formData.in_recursos} onChange={e => setFormData({...formData, in_recursos: e.target.value})} rows="2"></textarea>
                      </div>
                      <div className="form-group">
                        <label className="form-label" style={{fontSize:'0.8rem'}}>Comunicaciones pertinentes (incluidas quejas)</label>
                        <textarea className="form-control" value={formData.in_comunicaciones} onChange={e => setFormData({...formData, in_comunicaciones: e.target.value})} rows="2"></textarea>
                      </div>
                      <div className="form-group">
                        <label className="form-label" style={{fontSize:'0.8rem'}}>Participación y consulta de los trabajadores (ISO 45001)</label>
                        <textarea className="form-control" value={formData.in_consulta_trabajadores} onChange={e => setFormData({...formData, in_consulta_trabajadores: e.target.value})} rows="2"></textarea>
                      </div>
                      <div className="form-group" style={{gridColumn: 'span 2'}}>
                        <label className="form-label" style={{fontSize:'0.8rem'}}>Oportunidades de mejora continua (Información de entrada)</label>
                        <textarea className="form-control" value={formData.in_oportunidades_mejora} onChange={e => setFormData({...formData, in_oportunidades_mejora: e.target.value})} rows="2"></textarea>
                      </div>
                    </div>
                  </div>

                  <div style={{background:'var(--bg-secondary)', padding:'1rem', borderRadius:'var(--radius-sm)'}}>
                    <h5 style={{fontSize:'0.9rem', marginBottom:'0.5rem', color:'var(--success)'}}>Salidas de la Revisión por la Dirección</h5>
                    <div className="grid-2">
                      <div className="form-group" style={{gridColumn: 'span 2'}}>
                        <label className="form-label" style={{fontSize:'0.8rem'}}>Conclusiones sobre la conveniencia, adecuación y eficacia continua del SGI</label>
                        <textarea className="form-control" value={formData.out_conclusiones} onChange={e => setFormData({...formData, out_conclusiones: e.target.value})} rows="2"></textarea>
                      </div>
                      <div className="form-group">
                        <label className="form-label" style={{fontSize:'0.8rem'}}>Decisiones y acciones relacionadas con oportunidades de mejora continua</label>
                        <textarea className="form-control" value={formData.out_oportunidades} onChange={e => setFormData({...formData, out_oportunidades: e.target.value})} rows="2"></textarea>
                      </div>
                      <div className="form-group">
                        <label className="form-label" style={{fontSize:'0.8rem'}}>Necesidades de Cambio en el Sistema de Gestión</label>
                        <textarea className="form-control" value={formData.out_cambiosSGI} onChange={e => setFormData({...formData, out_cambiosSGI: e.target.value})} rows="2"></textarea>
                      </div>
                      <div className="form-group">
                        <label className="form-label" style={{fontSize:'0.8rem'}}>Necesidades de Recursos</label>
                        <textarea className="form-control" value={formData.out_recursos} onChange={e => setFormData({...formData, out_recursos: e.target.value})} rows="2"></textarea>
                      </div>
                      <div className="form-group">
                        <label className="form-label" style={{fontSize:'0.8rem'}}>Cualquier implicación para la dirección estratégica de la organización</label>
                        <textarea className="form-control" value={formData.out_implicaciones} onChange={e => setFormData({...formData, out_implicaciones: e.target.value})} rows="2"></textarea>
                      </div>
                    </div>
                  </div>
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
    </>
  );
}
