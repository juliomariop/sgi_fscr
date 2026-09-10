import React, { useState } from 'react';
import { Download, Plus, Edit2, Trash2, CheckCircle, Clock, AlertCircle, Upload, Paperclip, AlertTriangle, X, RefreshCw } from 'lucide-react';
import { downloadCSV } from '../utils/exportUtils';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAppUsers } from '../hooks/useAppUsers';

const defaultChange = {
  // 1. Identificación
  title: '', process: '', requestDate: new Date().toISOString().split('T')[0], applicant: '',
  
  // 2. Planificación (ISO 9001 6.3)
  purpose: '', consequences: '', systemIntegrity: '', resources: '', responsibilities: '',
  
  // 3. Tareas
  tasks: [],
  
  // 4. Aprobación y Cierre
  status: 'Solicitado', approver: '', evidenceFile: null
};

export default function ChangeManagement() {
  const APP_USERS = useAppUsers();
  const [changes, setChanges] = useLocalStorage('sgi_changes', [
    {
      id: 'GC-2026-001', title: 'Migración a nuevo ERP', date: '2026-05-15', applicant: 'Gerente General', priority: 'Alta',
      purpose: 'Mejorar la trazabilidad financiera y operativa integrada', consequences: 'Riesgo de pérdida temporal de datos, curva de aprendizaje en personal', systemIntegrity: 'Modificación de manuales de usuario y política de seguridad', resources: 'Presupuesto de $15,000 USD y 2 servidores nuevos', responsibilities: 'Director TI, Jefe de Sistemas',
      tasks: [{ id: 1, action: 'Cotización y compra', execDate: '2026-05-15', execResp: 'Compras', followDate: '2026-05-20', followResp: 'Director TI', evidence: null }],
      status: 'En Ejecución', approver: 'Gerente General', evidenceFile: null
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(defaultChange);

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({ ...defaultChange, ...item, tasks: item.tasks || [] });
    } else {
      setEditingItem(null);
      setFormData(defaultChange);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingItem) {
      setChanges(changes.map(c => c.id === editingItem.id ? { ...formData, id: c.id } : c));
    } else {
      const newId = `GC-${String(changes.length + 1).padStart(3, '0')}`;
      setChanges([...changes, { ...formData, id: newId }]);
    }
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Está seguro de eliminar esta solicitud de cambio?")) {
      setChanges(changes.filter(c => c.id !== id));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setFormData({ ...formData, evidenceFile: file.name });
  };

  const addTask = () => {
    setFormData({
      ...formData,
      tasks: [...formData.tasks, { id: Date.now(), action: '', execDate: '', execResp: '', followDate: '', followResp: '', evidence: null }]
    });
  };

  const updateTask = (id, field, value) => {
    setFormData({
      ...formData,
      tasks: formData.tasks.map(t => t.id === id ? { ...t, [field]: value } : t)
    });
  };

  const removeTask = (id) => {
    setFormData({
      ...formData,
      tasks: formData.tasks.filter(t => t.id !== id)
    });
  };

  const handleTaskFileChange = (id, e) => {
    const file = e.target.files[0];
    if (file) {
      updateTask(id, 'evidence', file.name);
    }
  };

  const handleExport = () => downloadCSV(changes, "Gestion_Cambios");

  const solicitados = changes.filter(c => c.status === 'Solicitado').length;
  const enEjecucion = changes.filter(c => c.status === 'Planeado' || c.status === 'En Ejecución').length;
  const implementados = changes.filter(c => c.status === 'Implementado').length;

  return (
    <>
      <div style={{display:'flex', justifyContent:'space-between', marginBottom:'1.5rem', alignItems:'center', flexWrap:'wrap', gap:'1rem'}}>
        <div>
          <p style={{color:'var(--text-secondary)', marginBottom:'0.25rem'}}>Gestión de Cambios SGI (ISO 9001:2015 6.3)</p>
        </div>
        <div style={{display:'flex', gap:'0.5rem', flexWrap:'wrap'}}>
          <button className="btn-secondary" onClick={handleExport}><Download size={16}/> Exportar Datos</button>
          <button className="btn-primary" onClick={() => handleOpenModal()}><Plus size={16}/> Nueva Solicitud</button>
        </div>
      </div>

      <div className="grid-3" style={{marginBottom:'1.5rem'}}>
        <div className="card stat-card">
          <div className="stat-icon" style={{background:'rgba(239, 68, 68, 0.1)', color:'var(--danger)'}}>
            <AlertCircle size={24}/>
          </div>
          <div className="stat-info">
            <h3>{solicitados}</h3>
            <p>Nuevas Solicitudes</p>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{background:'rgba(245, 158, 11, 0.1)', color:'var(--warning)'}}>
            <RefreshCw size={24}/>
          </div>
          <div className="stat-info">
            <h3>{enEjecucion}</h3>
            <p>Planeados / Ejecución</p>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{background:'rgba(16, 185, 129, 0.1)', color:'var(--success)'}}>
            <CheckCircle size={24}/>
          </div>
          <div className="stat-info">
            <h3>{implementados}</h3>
            <p>Implementados</p>
          </div>
        </div>
      </div>

      <div className="card" style={{padding:0, overflow:'hidden'}}>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>ID / Fecha</th>
                <th>Título del Cambio</th>
                <th>Proceso / Solicitante</th>
                <th>Estado</th>
                <th>Aprobador / Evidencia</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {changes.length === 0 ? (
                <tr><td colSpan="6" style={{textAlign:'center', padding:'2rem'}}>No hay cambios registrados.</td></tr>
              ) : changes.map(c => {
                let badgeClass = 'badge-success';
                if (c.status === 'Solicitado') badgeClass = 'badge-danger';
                else if (c.status === 'Planeado' || c.status === 'En Ejecución') badgeClass = 'badge-warning';
                else if (c.status === 'Rechazado') badgeClass = 'badge-danger';

                return (
                  <tr key={c.id}>
                    <td>
                      <strong>{c.id}</strong>
                      <div style={{fontSize:'0.75rem', color:'var(--text-muted)'}}>{c.requestDate}</div>
                    </td>
                    <td style={{fontSize:'0.85rem', maxWidth:'250px', fontWeight:600}}>{c.title}</td>
                    <td>
                      <span style={{fontSize:'0.85rem'}}>{c.process}</span>
                      <div style={{fontSize:'0.75rem', color:'var(--text-secondary)'}}>{c.applicant}</div>
                    </td>
                    <td><span className={`badge ${badgeClass}`}>{c.status}</span></td>
                    <td>
                      <div style={{fontSize:'0.85rem'}}>{c.approver || '-'}</div>
                      {c.evidenceFile && (
                        <div style={{marginTop:'0.25rem'}}>
                          <span style={{fontSize:'0.75rem', color:'var(--info)', display:'inline-flex', alignItems:'center', gap:'0.25rem', cursor:'pointer'}} title="Descargar Evidencia">
                            <Paperclip size={12}/> {c.evidenceFile}
                          </span>
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{display:'flex', gap:'0.25rem'}}>
                        <button className="btn-icon" style={{padding:'0.25rem', color:'var(--text-muted)'}} onClick={() => handleOpenModal(c)}><Edit2 size={14}/></button>
                        <button className="btn-icon" style={{padding:'0.25rem', color:'var(--danger)'}} onClick={() => handleDelete(c.id)}><Trash2 size={14}/></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay active">
          <div className="modal-content" style={{maxWidth: '900px', width: '95%', maxHeight: '90vh', overflowY: 'auto'}}>
            <div className="modal-header">
              <h2>{editingItem ? "Gestionar Cambio" : "Solicitud de Cambio"}</h2>
              <button className="btn-icon" onClick={handleCloseModal}><X size={20}/></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
                
                {/* 1. IDENTIFICACIÓN */}
                <div style={{background:'var(--bg-secondary)', padding:'1rem', borderRadius:'var(--radius-sm)'}}>
                  <h5 style={{fontSize:'1rem', marginBottom:'1rem', color:'var(--accent-primary)', borderBottom:'1px solid var(--border-color)', paddingBottom:'0.5rem'}}>1. Identificación del Cambio</h5>
                  <div className="grid-2">
                    <div className="form-group" style={{gridColumn: 'span 2'}}>
                      <label className="form-label">Título / Descripción del Cambio</label>
                      <input type="text" className="form-control" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required placeholder="Ej. Actualización de plataforma tecnológica..." />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Proceso Afectado</label>
                      <input type="text" className="form-control" value={formData.process} onChange={e => setFormData({...formData, process: e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Fecha de Solicitud</label>
                      <input type="date" className="form-control" value={formData.requestDate} onChange={e => setFormData({...formData, requestDate: e.target.value})} required />
                    </div>
                    <div className="form-group" style={{gridColumn: 'span 2'}}>
                      <label className="form-label">Solicitante / Líder</label>
                      <select className="form-control" value={formData.applicant} onChange={e => setFormData({...formData, applicant: e.target.value})} required>
                        <option value="">Seleccione Usuario...</option>
                        {APP_USERS.map(u => <option key={u.email} value={u.name}>{u.name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* 2. PLANIFICACIÓN (ISO 6.3) */}
                <div style={{background:'var(--bg-secondary)', padding:'1rem', borderRadius:'var(--radius-sm)'}}>
                  <h5 style={{fontSize:'1rem', marginBottom:'1rem', color:'var(--accent-primary)', borderBottom:'1px solid var(--border-color)', paddingBottom:'0.5rem'}}>2. Planificación (Cláusula 6.3)</h5>
                  <div className="grid-2">
                    <div className="form-group" style={{gridColumn: 'span 2'}}>
                      <label className="form-label">a) Propósito de los cambios</label>
                      <textarea className="form-control" value={formData.purpose} onChange={e => setFormData({...formData, purpose: e.target.value})} rows="2" required placeholder="Por qué se debe hacer el cambio..."></textarea>
                    </div>
                    <div className="form-group" style={{gridColumn: 'span 2'}}>
                      <label className="form-label">a) Consecuencias potenciales (Riesgos y oportunidades asociadas)</label>
                      <textarea className="form-control" value={formData.consequences} onChange={e => setFormData({...formData, consequences: e.target.value})} rows="2" required placeholder="Qué riesgos existen al implementar el cambio..."></textarea>
                    </div>
                    <div className="form-group" style={{gridColumn: 'span 2'}}>
                      <label className="form-label">b) Integridad del Sistema de Gestión</label>
                      <textarea className="form-control" value={formData.systemIntegrity} onChange={e => setFormData({...formData, systemIntegrity: e.target.value})} rows="2" required placeholder="A qué políticas o procedimientos impacta..."></textarea>
                    </div>
                    <div className="form-group" style={{gridColumn: 'span 2'}}>
                      <label className="form-label">c) Disponibilidad de Recursos</label>
                      <textarea className="form-control" value={formData.resources} onChange={e => setFormData({...formData, resources: e.target.value})} rows="2" required placeholder="Presupuesto, tecnología, personal necesario..."></textarea>
                    </div>
                    <div className="form-group" style={{gridColumn: 'span 2'}}>
                      <label className="form-label">d) Asignación o reasignación de responsabilidades y autoridades</label>
                      <textarea className="form-control" value={formData.responsibilities} onChange={e => setFormData({...formData, responsibilities: e.target.value})} rows="2" required placeholder="Quién asume el control, quién autoriza los pasos..."></textarea>
                    </div>
                  </div>
                </div>

                {/* 3. TAREAS DE EJECUCIÓN */}
                <div style={{background:'var(--bg-secondary)', padding:'1rem', borderRadius:'var(--radius-sm)'}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid var(--border-color)', paddingBottom:'0.5rem', marginBottom:'1rem'}}>
                    <h5 style={{fontSize:'1rem', color:'var(--accent-primary)', margin:0}}>3. Plan de Acción (Actividades)</h5>
                    <button type="button" className="btn-secondary" onClick={addTask} style={{padding:'0.2rem 0.5rem', fontSize:'0.8rem'}}><Plus size={14}/> Añadir Tarea</button>
                  </div>
                  
                  {formData.tasks.length === 0 ? (
                    <div style={{textAlign:'center', padding:'1rem', color:'var(--text-muted)', fontSize:'0.85rem'}}>No hay tareas agregadas para la implementación del cambio.</div>
                  ) : (
                    <div style={{overflowX:'auto'}}>
                      <table className="table" style={{minWidth: '800px'}}>
                        <thead>
                          <tr style={{fontSize:'0.75rem'}}>
                            <th>Acción</th>
                            <th>Resp. Ejecución</th>
                            <th>F. Ejecución</th>
                            <th>Resp. Seguimiento</th>
                            <th>F. Seguimiento</th>
                            <th>Evidencia</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {formData.tasks.map(t => (
                            <tr key={t.id}>
                              <td><input type="text" className="form-control" style={{fontSize:'0.8rem', padding:'0.25rem'}} value={t.action} onChange={e => updateTask(t.id, 'action', e.target.value)} required /></td>
                              <td>
                                <select className="form-control" style={{fontSize:'0.8rem', padding:'0.25rem'}} value={t.execResp} onChange={e => updateTask(t.id, 'execResp', e.target.value)} required>
                                  <option value="">Seleccione...</option>
                                  {APP_USERS.map(u => <option key={u.email} value={u.name}>{u.name}</option>)}
                                </select>
                              </td>
                              <td><input type="date" className="form-control" style={{fontSize:'0.8rem', padding:'0.25rem'}} value={t.execDate} onChange={e => updateTask(t.id, 'execDate', e.target.value)} required /></td>
                              <td>
                                <select className="form-control" style={{fontSize:'0.8rem', padding:'0.25rem'}} value={t.followResp} onChange={e => updateTask(t.id, 'followResp', e.target.value)} required>
                                  <option value="">Seleccione...</option>
                                  {APP_USERS.map(u => <option key={u.email} value={u.name}>{u.name}</option>)}
                                </select>
                              </td>
                              <td><input type="date" className="form-control" style={{fontSize:'0.8rem', padding:'0.25rem'}} value={t.followDate} onChange={e => updateTask(t.id, 'followDate', e.target.value)} required /></td>
                              <td>
                                <div style={{display:'flex', alignItems:'center', gap:'0.25rem'}}>
                                  <input type="file" id={`task-file-${t.id}`} style={{display:'none'}} onChange={e => handleTaskFileChange(t.id, e)} />
                                  <label htmlFor={`task-file-${t.id}`} className="btn-secondary" style={{cursor:'pointer', padding:'0.2rem', margin:0}} title="Subir Evidencia">
                                    <Upload size={12}/>
                                  </label>
                                  <span style={{fontSize:'0.7rem', maxWidth:'80px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}} title={t.evidence}>{t.evidence || '-'}</span>
                                </div>
                              </td>
                              <td>
                                <button type="button" className="btn-icon" style={{color:'var(--danger)'}} onClick={() => removeTask(t.id)}><Trash2 size={14}/></button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* 4. APROBACIÓN Y CIERRE */}
                <div style={{background:'var(--bg-secondary)', padding:'1rem', borderRadius:'var(--radius-sm)'}}>
                  <h5 style={{fontSize:'1rem', marginBottom:'1rem', color:'var(--accent-primary)', borderBottom:'1px solid var(--border-color)', paddingBottom:'0.5rem'}}>4. Aprobación y Cierre</h5>
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Estado del Cambio</label>
                      <select className="form-control" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} required>
                        <option value="Solicitado">Solicitado (Pendiente Aprobación)</option>
                        <option value="Planeado">Planeado</option>
                        <option value="En Ejecución">En Ejecución</option>
                        <option value="Implementado">Implementado (Cerrado)</option>
                        <option value="Rechazado">Rechazado</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Aprobado Por</label>
                      <select className="form-control" value={formData.approver} onChange={e => setFormData({...formData, approver: e.target.value})}>
                        <option value="">Ninguno / Seleccione Usuario...</option>
                        {APP_USERS.map(u => <option key={u.email} value={u.name}>{u.name}</option>)}
                      </select>
                    </div>
                    <div className="form-group" style={{gridColumn: 'span 2'}}>
                      <label className="form-label">Evidencia General del Cierre</label>
                      <div style={{display:'flex', alignItems:'center', gap:'0.5rem', background:'rgba(0,0,0,0.05)', padding:'0.5rem', borderRadius:'var(--radius-sm)'}}>
                        <input type="file" id="file-closure" style={{display:'none'}} onChange={handleFileChange} />
                        <label htmlFor="file-closure" className="btn-secondary" style={{cursor:'pointer', margin:0, padding:'0.3rem 0.75rem', fontSize:'0.8rem'}}>
                          <Upload size={14} style={{marginRight:'4px'}}/> {formData.evidenceFile ? 'Cambiar Evidencia' : 'Subir Evidencia'}
                        </label>
                        <span style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>{formData.evidenceFile || 'Ningún archivo adjunto'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{display:'flex', justifyContent:'flex-end', gap:'0.5rem', marginTop:'1rem'}}>
                  <button type="button" className="btn-secondary" onClick={handleCloseModal}>Cancelar</button>
                  <button type="submit" className="btn-primary">{editingItem ? "Actualizar Gestión" : "Guardar Solicitud"}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
