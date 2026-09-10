import React, { useState } from 'react';
import { Flag, Target, Eye, ShieldCheck, Plus, Trash2, Edit2, Download, History, BookOpen } from 'lucide-react';
import Modal from '../components/Modal';
import ExportModal from '../components/ExportModal';
import { downloadCSV } from '../utils/exportUtils';
import { useLocalStorage } from '../hooks/useLocalStorage';

export default function StrategicElements() {
  const [exportConfig, setExportConfig] = useState({
    isOpen: false,
    exportType: 'pdf',
    title: '',
    code: '',
    version: '01',
    validity: '',
    contentHtml: '',
    history: [],
    layout: 'standard'
  });
  const [mission, setMission] = useLocalStorage('sgi_mission', {
    text: 'Proveer soluciones integrales de alta calidad a nuestros clientes, garantizando la sostenibilidad y el bienestar de nuestros colaboradores.',
    version: 'V.01', date: '2025-01-10', signedBy: 'CEO General'
  });
  
  const [vision, setVision] = useLocalStorage('sgi_vision', {
    text: 'Ser reconocidos en 2030 como líderes en nuestro sector por nuestra innovación y responsabilidad.',
    version: 'V.01', date: '2025-01-10', signedBy: 'Junta Directiva'
  });

  const [policies, setPolicies] = useLocalStorage('sgi_policies', [
    { 
      id: 1, 
      name: 'Política Integrada HSEQ', 
      text: '1. Cumplir con la legislación aplicable.\n2. Proteger el medio ambiente.\n3. Prevenir lesiones y enfermedades.', 
      version: 'V.03', 
      date: '2026-02-15', 
      signedBy: 'Gerencia General',
      history: [
        { id: 1, text: '1. Cumplir con la legislación aplicable.\n2. Proteger el medio ambiente.', version: 'V.01', date: '2025-01-10', signedBy: 'Gerencia General', changeReason: 'Creación inicial de la política.' },
        { id: 2, text: '1. Cumplir con la legislación aplicable.\n2. Proteger el medio ambiente.\n3. Implementar capacitaciones periódicas.', version: 'V.02', date: '2025-08-01', signedBy: 'Coordinador HSEQ', changeReason: 'Actualización por requerimientos de auditoría de capacitación.' },
        { id: 3, text: '1. Cumplir con la legislación aplicable.\n2. Proteger el medio ambiente.\n3. Prevenir lesiones y enfermedades.', version: 'V.03', date: '2026-02-15', signedBy: 'Gerencia General', changeReason: 'Ajuste normativo según directrices de la ISO 45001.' }
      ]
    },
    { 
      id: 2, 
      name: 'Política de Tratamiento de Datos', 
      text: 'Garantizar el derecho al hábeas data de todos nuestros clientes y empleados.', 
      version: 'V.01', 
      date: '2024-11-20', 
      signedBy: 'Dpto. Legal',
      history: [
        { id: 1, text: 'Garantizar el derecho al hábeas data de todos nuestros clientes y empleados.', version: 'V.01', date: '2024-11-20', signedBy: 'Dpto. Legal', changeReason: 'Creación inicial de la política.' }
      ]
    }
  ]);

  const [missionHistory, setMissionHistory] = useLocalStorage('sgi_mission_history', [
    { id: 1, text: 'Proveer soluciones integrales de alta calidad a nuestros clientes, garantizando la sostenibilidad y el bienestar de nuestros colaboradores.', version: 'V.01', date: '2025-01-10', signedBy: 'CEO General', changeReason: 'Creación inicial del elemento estratégico.' }
  ]);

  const [visionHistory, setVisionHistory] = useLocalStorage('sgi_vision_history', [
    { id: 1, text: 'Ser reconocidos en 2030 como líderes en nuestro sector por nuestra innovación y responsabilidad.', version: 'V.01', date: '2025-01-10', signedBy: 'Junta Directiva', changeReason: 'Creación inicial del elemento estratégico.' }
  ]);

  const [lastUpdated, setLastUpdated] = useLocalStorage('sgi_strategic_last_updated', '2026-05-30');

  // Modal Control States
  const [isMisVisModalOpen, setIsMisVisModalOpen] = useState(false);
  const [misVisForm, setMisVisForm] = useState({ 
    mission: { text: '', version: '', date: '', signedBy: '', changeReason: '' }, 
    vision: { text: '', version: '', date: '', signedBy: '', changeReason: '' } 
  });

  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [policyForm, setPolicyForm] = useState({ name: '', text: '', version: 'V.01', date: '', signedBy: '', changeReason: '' });

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyModalConfig, setHistoryModalConfig] = useState({ title: '', logs: [] });

  // Misión y Visión logic
  const handleOpenMisVis = () => {
    setMisVisForm({ 
      mission: { ...mission, changeReason: '' }, 
      vision: { ...vision, changeReason: '' } 
    });
    setIsMisVisModalOpen(true);
  };

  const handleSaveMisVis = (e) => {
    e.preventDefault();

    const missionChanged = misVisForm.mission.text !== mission.text || 
                           misVisForm.mission.version !== mission.version ||
                           misVisForm.mission.signedBy !== mission.signedBy;

    const visionChanged = misVisForm.vision.text !== vision.text || 
                          misVisForm.vision.version !== vision.version ||
                          misVisForm.vision.signedBy !== vision.signedBy;

    if (missionChanged) {
      const newMissionEntry = {
        id: Date.now(),
        text: misVisForm.mission.text,
        version: misVisForm.mission.version,
        date: misVisForm.mission.date || new Date().toISOString().split('T')[0],
        signedBy: misVisForm.mission.signedBy,
        changeReason: misVisForm.mission.changeReason || 'Actualización de rutina.'
      };
      setMissionHistory([...missionHistory, newMissionEntry]);
      setMission({
        text: misVisForm.mission.text,
        version: misVisForm.mission.version,
        date: newMissionEntry.date,
        signedBy: misVisForm.mission.signedBy
      });
    }

    if (visionChanged) {
      const newVisionEntry = {
        id: Date.now() + 1,
        text: misVisForm.vision.text,
        version: misVisForm.vision.version,
        date: misVisForm.vision.date || new Date().toISOString().split('T')[0],
        signedBy: misVisForm.vision.signedBy,
        changeReason: misVisForm.vision.changeReason || 'Actualización de rutina.'
      };
      setVisionHistory([...visionHistory, newVisionEntry]);
      setVision({
        text: misVisForm.vision.text,
        version: misVisForm.vision.version,
        date: newVisionEntry.date,
        signedBy: misVisForm.vision.signedBy
      });
    }

    if (missionChanged || visionChanged) {
      setLastUpdated(new Date().toISOString().split('T')[0]);
    }
    
    setIsMisVisModalOpen(false);
  };

  // Políticas logic
  const handleOpenPolicy = (item = null) => {
    if (item) {
      setEditingPolicy(item);
      setPolicyForm({ ...item, changeReason: '' });
    } else {
      setEditingPolicy(null);
      setPolicyForm({ name: '', text: '', version: 'V.01', date: new Date().toISOString().split('T')[0], signedBy: '', changeReason: '' });
    }
    setIsPolicyModalOpen(true);
  };

  const handleSavePolicy = (e) => {
    e.preventDefault();
    
    const currentHistory = editingPolicy?.history || [
      {
        id: 1,
        text: editingPolicy?.text || '',
        version: editingPolicy?.version || 'V.01',
        date: editingPolicy?.date || new Date().toISOString().split('T')[0],
        signedBy: editingPolicy?.signedBy || '',
        changeReason: 'Historial inicial de la política.'
      }
    ];

    const didChange = !editingPolicy ||
                      policyForm.text !== editingPolicy.text ||
                      policyForm.version !== editingPolicy.version ||
                      policyForm.signedBy !== editingPolicy.signedBy ||
                      policyForm.name !== editingPolicy.name;

    let newHistory = [...currentHistory];
    if (didChange && editingPolicy) {
      newHistory.push({
        id: Date.now(),
        text: policyForm.text,
        version: policyForm.version,
        date: policyForm.date || new Date().toISOString().split('T')[0],
        signedBy: policyForm.signedBy,
        changeReason: policyForm.changeReason || 'Actualización de rutina.'
      });
    }

    const updatedPolicy = {
      name: policyForm.name,
      text: policyForm.text,
      version: policyForm.version,
      date: policyForm.date || new Date().toISOString().split('T')[0],
      signedBy: policyForm.signedBy,
      history: editingPolicy ? newHistory : [
        {
          id: Date.now(),
          text: policyForm.text,
          version: policyForm.version,
          date: policyForm.date || new Date().toISOString().split('T')[0],
          signedBy: policyForm.signedBy,
          changeReason: 'Creación inicial de la política.'
        }
      ]
    };

    if (editingPolicy) {
      setPolicies(policies.map(p => p.id === editingPolicy.id ? { ...updatedPolicy, id: p.id } : p));
    } else {
      setPolicies([...policies, { ...updatedPolicy, id: Date.now() }]);
    }
    
    setLastUpdated(new Date().toISOString().split('T')[0]);
    setIsPolicyModalOpen(false);
  };

  const handleDeletePolicy = (id) => {
    if (window.confirm("¿Está seguro de eliminar esta política?")) {
      setPolicies(policies.filter(p => p.id !== id));
      setLastUpdated(new Date().toISOString().split('T')[0]);
    }
  };

  // View Version History Logs
  const handleOpenHistory = (type, policyItem = null) => {
    if (type === 'mission') {
      setHistoryModalConfig({
        title: 'Control de Cambios - Misión',
        logs: missionHistory
      });
    } else if (type === 'vision') {
      setHistoryModalConfig({
        title: 'Control de Cambios - Visión',
        logs: visionHistory
      });
    } else if (type === 'policy' && policyItem) {
      // Create lazy fallback history if none exists for backward compatibility
      const policyHistory = policyItem.history || [
        { id: 1, text: policyItem.text, version: policyItem.version, date: policyItem.date, signedBy: policyItem.signedBy, changeReason: 'Historial migrado del estado inicial.' }
      ];
      setHistoryModalConfig({
        title: `Control de Cambios - ${policyItem.name}`,
        logs: policyHistory
      });
    }
    setIsHistoryModalOpen(true);
  };

  const handleExportMission = () => {
    const formattedHistory = missionHistory.map(h => ({
      version: h.version,
      date: h.date,
      changes: h.changeReason
    }));
    
    setExportConfig({
      isOpen: true,
      exportType: 'pdf',
      title: 'Misión Organizacional',
      code: 'DIR-MS-001',
      version: mission.version,
      validity: mission.date,
      layout: 'strategic',
      contentHtml: `
        <div style="font-size: 17px; line-height: 1.8; color: #000; text-align: justify; padding: 15px 5px;">
          <p style="text-indent: 0; font-size: 17px; line-height: 1.8; margin: 0;">${mission.text}</p>
        </div>
      `,
      history: formattedHistory
    });
  };

  const handleExportVision = () => {
    const formattedHistory = visionHistory.map(h => ({
      version: h.version,
      date: h.date,
      changes: h.changeReason
    }));

    setExportConfig({
      isOpen: true,
      exportType: 'pdf',
      title: 'Visión Organizacional',
      code: 'DIR-VS-001',
      version: vision.version,
      validity: vision.date,
      layout: 'strategic',
      contentHtml: `
        <div style="font-size: 17px; line-height: 1.8; color: #000; text-align: justify; padding: 15px 5px;">
          <p style="text-indent: 0; font-size: 17px; line-height: 1.8; margin: 0;">${vision.text}</p>
        </div>
      `,
      history: formattedHistory
    });
  };

  const handleExportSinglePolicy = (p) => {
    const pHistory = p.history || [
      { id: 1, text: p.text, version: p.version, date: p.date, signedBy: p.signedBy, changeReason: 'Historial migrado del estado inicial.' }
    ];
    const formattedHistory = pHistory.map(h => ({
      version: h.version,
      date: h.date,
      changes: h.changeReason
    }));

    const formattedText = p.text.split('\n').map(line => {
      if (line.trim().match(/^\d+\./)) {
        return `<li style="margin-bottom: 12px; font-size: 15px;">${line.replace(/^\d+\.\s*/, '')}</li>`;
      }
      return `<p style="margin-bottom: 12px; text-indent: 12px; font-size: 15px;">${line}</p>`;
    }).join('');

    const bodyHtml = formattedText.includes('<li') 
      ? `<ol style="padding-left: 20px; font-size: 15px; line-height: 1.8; color: #000; margin: 0;">${formattedText}</ol>`
      : `<div style="font-size: 15px; line-height: 1.8; color: #000; text-align: justify; margin: 0;">${formattedText}</div>`;

    setExportConfig({
      isOpen: true,
      exportType: 'pdf',
      title: p.name,
      code: `SGI-PO-${p.id.toString().padStart(3, '0')}`,
      version: p.version,
      validity: p.date,
      layout: 'strategic',
      contentHtml: `
        <div style="font-size: 15px; line-height: 1.8; color: #000; text-align: justify; padding: 10px 5px;">
          ${bodyHtml}
        </div>
      `,
      history: formattedHistory
    });
  };

  const handleExportPolicies = () => downloadCSV(policies, "Politicas_Corporativas");

  return (
    <>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem', flexWrap:'wrap', gap:'1rem'}}>
        <div>
          <p style={{color:'var(--text-secondary)', marginBottom:'0.25rem'}}>
            Contexto de la Organización y Liderazgo (Cl. 4.1, 5.1, 5.2)
          </p>
          <span className="badge badge-info">
            <Flag size={12} style={{marginRight:'4px'}}/> Última actualización: {lastUpdated}
          </span>
        </div>
        <div style={{display:'flex', gap:'0.5rem', flexWrap:'wrap'}}>
          <button className="btn-primary" onClick={handleOpenMisVis}>
            <Edit2 size={16} /> Editar Misión y Visión
          </button>
        </div>
      </div>

      {/* Misión and Visión Cards */}
      <div className="grid-2" style={{marginBottom:'1.5rem', alignItems:'stretch'}}>
        <div className="card" style={{marginBottom:0, height:'100%', display:'flex', flexDirection:'column'}}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--accent-primary)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem', fontWeight: 600 }}>
              <Target size={20} color="var(--accent-primary)"/> Misión
            </h3>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <button className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={handleExportMission}>
                <Download size={12} style={{ marginRight: '4px' }} /> Exportar PDF
              </button>
              <button className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => handleOpenHistory('mission')}>
                <History size={12} style={{ marginRight: '4px' }} /> Historial
              </button>
            </div>
          </div>
          <p style={{fontSize:'0.9rem', color:'var(--text-secondary)', lineHeight:1.6, flex:1, whiteSpace:'pre-wrap', marginBottom:'1rem'}}>
            {mission.text || <em>Misión no definida.</em>}
          </p>
          <div style={{fontSize:'0.8rem', color:'var(--text-muted)', borderTop:'1px solid var(--border-color)', paddingTop:'0.5rem', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem'}}>
            <div><strong>Versión:</strong> {mission.version}</div>
            <div><strong>Fecha:</strong> {mission.date}</div>
            <div style={{gridColumn:'1 / -1'}}><strong>Aprobado por:</strong> {mission.signedBy}</div>
          </div>
        </div>

        <div className="card" style={{marginBottom:0, height:'100%', display:'flex', flexDirection:'column'}}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--info)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem', fontWeight: 600 }}>
              <Eye size={20} color="var(--info)"/> Visión
            </h3>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <button className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={handleExportVision}>
                <Download size={12} style={{ marginRight: '4px' }} /> Exportar PDF
              </button>
              <button className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => handleOpenHistory('vision')}>
                <History size={12} style={{ marginRight: '4px' }} /> Historial
              </button>
            </div>
          </div>
          <p style={{fontSize:'0.9rem', color:'var(--text-secondary)', lineHeight:1.6, flex:1, whiteSpace:'pre-wrap', marginBottom:'1rem'}}>
            {vision.text || <em>Visión no definida.</em>}
          </p>
          <div style={{fontSize:'0.8rem', color:'var(--text-muted)', borderTop:'1px solid var(--border-color)', paddingTop:'0.5rem', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem'}}>
            <div><strong>Versión:</strong> {vision.version}</div>
            <div><strong>Fecha:</strong> {vision.date}</div>
            <div style={{gridColumn:'1 / -1'}}><strong>Aprobado por:</strong> {vision.signedBy}</div>
          </div>
        </div>
      </div>

      {/* Políticas Card */}
      <div className="card" style={{marginBottom:'1.5rem'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'2px solid var(--success)', paddingBottom:'0.5rem', marginBottom:'1rem', flexWrap:'wrap', gap:'1rem'}}>
          <h3 style={{display:'flex', alignItems:'center', gap:'0.5rem', fontSize: '1.2rem', fontWeight: 600}}>
            <ShieldCheck size={20} color="var(--success)"/> Políticas del Sistema de Gestión
          </h3>
          <div style={{display:'flex', gap:'0.5rem', flexWrap:'wrap'}}>
            <button className="btn-secondary" style={{fontSize:'0.8rem', padding:'0.3rem 0.6rem'}} onClick={() => handleOpenPolicy()}>
              <Plus size={14}/> Nueva Política
            </button>
          </div>
        </div>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Política</th>
                <th>Declaración</th>
                <th>Datos Aprobación</th>
                <th style={{textAlign:'center'}}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {policies.length === 0 ? (
                <tr><td colSpan="4" style={{textAlign:'center', color:'var(--text-secondary)', padding:'2rem'}}>No hay políticas registradas</td></tr>
              ) : policies.map(p => (
                <tr key={p.id}>
                  <td style={{fontWeight:600, width:'20%'}}>{p.name}</td>
                  <td style={{fontSize:'0.85rem', color:'var(--text-secondary)', whiteSpace:'pre-wrap', width:'45%'}}>{p.text}</td>
                  <td style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>
                    <div><strong>Ver:</strong> {p.version}</div>
                    <div><strong>Fecha:</strong> {p.date}</div>
                    <div><strong>Firma:</strong> {p.signedBy}</div>
                  </td>
                  <td style={{textAlign:'center', width:'130px'}}>
                    <div style={{display:'flex', gap:'0.25rem', justifyContent:'center'}}>
                      <button className="btn-icon" style={{padding:'0.25rem', color:'var(--success)'}} title="Exportar PDF" onClick={() => handleExportSinglePolicy(p)}><Download size={14}/></button>
                      <button className="btn-icon" style={{padding:'0.25rem', color:'var(--accent-primary)'}} title="Historial de Cambios" onClick={() => handleOpenHistory('policy', p)}><History size={14}/></button>
                      <button className="btn-icon" style={{padding:'0.25rem', color:'var(--text-muted)'}} title="Editar" onClick={() => handleOpenPolicy(p)}><Edit2 size={14}/></button>
                      <button className="btn-icon" style={{padding:'0.25rem', color:'var(--danger)'}} title="Eliminar" onClick={() => handleDeletePolicy(p.id)}><Trash2 size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Misión y Visión */}
      <Modal isOpen={isMisVisModalOpen} onClose={() => setIsMisVisModalOpen(false)} title="Editar Misión y Visión">
        <form onSubmit={handleSaveMisVis} style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
          <div style={{borderBottom:'1px solid var(--border-color)', paddingBottom:'1.25rem'}}>
            <h4 style={{marginBottom:'0.75rem', color:'var(--accent-primary)', fontWeight: 600}}>Misión</h4>
            <div className="form-group">
              <textarea className="form-control" rows="3" value={misVisForm.mission.text} onChange={e => setMisVisForm({...misVisForm, mission: {...misVisForm.mission, text: e.target.value}})} required placeholder="Declaración de la Misión"></textarea>
            </div>
            <div style={{display:'flex', gap:'0.75rem', marginBottom: '0.75rem'}}>
              <div className="form-group" style={{flex:1}}><label className="form-label">Versión</label><input type="text" className="form-control" value={misVisForm.mission.version} onChange={e => setMisVisForm({...misVisForm, mission: {...misVisForm.mission, version: e.target.value}})} required /></div>
              <div className="form-group" style={{flex:1}}><label className="form-label">Fecha</label><input type="date" className="form-control" value={misVisForm.mission.date} onChange={e => setMisVisForm({...misVisForm, mission: {...misVisForm.mission, date: e.target.value}})} required /></div>
              <div className="form-group" style={{flex:2}}><label className="form-label">Aprobado por</label><input type="text" className="form-control" value={misVisForm.mission.signedBy} onChange={e => setMisVisForm({...misVisForm, mission: {...misVisForm.mission, signedBy: e.target.value}})} required /></div>
            </div>
            <div className="form-group">
              <label className="form-label">Motivo del Cambio HSEQ (Misión)</label>
              <input type="text" className="form-control" placeholder="Ej: Ajuste por actualización del mapa de procesos..." value={misVisForm.mission.changeReason || ''} onChange={e => setMisVisForm({...misVisForm, mission: {...misVisForm.mission, changeReason: e.target.value}})} required={misVisForm.mission.text !== mission.text || misVisForm.mission.version !== mission.version} />
            </div>
          </div>
          
          <div style={{paddingBottom:'0.5rem'}}>
            <h4 style={{marginBottom:'0.75rem', color:'var(--info)', fontWeight: 600}}>Visión</h4>
            <div className="form-group">
              <textarea className="form-control" rows="3" value={misVisForm.vision.text} onChange={e => setMisVisForm({...misVisForm, vision: {...misVisForm.vision, text: e.target.value}})} required placeholder="Declaración de la Visión"></textarea>
            </div>
            <div style={{display:'flex', gap:'0.75rem', marginBottom: '0.75rem'}}>
              <div className="form-group" style={{flex:1}}><label className="form-label">Versión</label><input type="text" className="form-control" value={misVisForm.vision.version} onChange={e => setMisVisForm({...misVisForm, vision: {...misVisForm.vision, version: e.target.value}})} required /></div>
              <div className="form-group" style={{flex:1}}><label className="form-label">Fecha</label><input type="date" className="form-control" value={misVisForm.vision.date} onChange={e => setMisVisForm({...misVisForm, vision: {...misVisForm.vision, date: e.target.value}})} required /></div>
              <div className="form-group" style={{flex:2}}><label className="form-label">Aprobado por</label><input type="text" className="form-control" value={misVisForm.vision.signedBy} onChange={e => setMisVisForm({...misVisForm, vision: {...misVisForm.vision, signedBy: e.target.value}})} required /></div>
            </div>
            <div className="form-group">
              <label className="form-label">Motivo del Cambio HSEQ (Visión)</label>
              <input type="text" className="form-control" placeholder="Ej: Ampliación del horizonte estratégico a 2030..." value={misVisForm.vision.changeReason || ''} onChange={e => setMisVisForm({...misVisForm, vision: {...misVisForm.vision, changeReason: e.target.value}})} required={misVisForm.vision.text !== vision.text || misVisForm.vision.version !== vision.version} />
            </div>
          </div>

          <div style={{display:'flex', justifyContent:'flex-end', gap:'0.5rem', marginTop:'1rem'}}>
            <button type="button" className="btn-secondary" onClick={() => setIsMisVisModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn-primary">Guardar Cambios</button>
          </div>
        </form>
      </Modal>

      {/* Modal Políticas */}
      <Modal isOpen={isPolicyModalOpen} onClose={() => setIsPolicyModalOpen(false)} title={editingPolicy ? "Editar Política" : "Nueva Política"}>
        <form onSubmit={handleSavePolicy} style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
          <div className="form-group">
            <label className="form-label">Nombre de la Política</label>
            <input type="text" className="form-control" value={policyForm.name} onChange={e => setPolicyForm({...policyForm, name: e.target.value})} required placeholder="Ej: Política de Calidad" />
          </div>
          <div className="form-group">
            <label className="form-label">Declaración / Texto de la Política</label>
            <textarea className="form-control" rows="4" value={policyForm.text} onChange={e => setPolicyForm({...policyForm, text: e.target.value})} required placeholder="Escriba aquí los compromisos de la política..."></textarea>
          </div>
          <div style={{display:'flex', gap:'1rem'}}>
            <div className="form-group" style={{flex:1}}>
              <label className="form-label">Versión</label>
              <input type="text" className="form-control" value={policyForm.version} onChange={e => setPolicyForm({...policyForm, version: e.target.value})} required />
            </div>
            <div className="form-group" style={{flex:1}}>
              <label className="form-label">Fecha de Aprobación</label>
              <input type="date" className="form-control" value={policyForm.date} onChange={e => setPolicyForm({...policyForm, date: e.target.value})} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Firmado por / Aprobado por</label>
            <input type="text" className="form-control" value={policyForm.signedBy} onChange={e => setPolicyForm({...policyForm, signedBy: e.target.value})} required />
          </div>

          <div className="form-group">
            <label className="form-label">Motivo del Cambio / Justificación</label>
            <input type="text" className="form-control" placeholder="Ej: Ajuste por nueva norma legal, adición de compromiso..." value={policyForm.changeReason || ''} onChange={e => setPolicyForm({...policyForm, changeReason: e.target.value})} required={!!editingPolicy && (policyForm.text !== editingPolicy.text || policyForm.version !== editingPolicy.version)} />
          </div>

          <div style={{display:'flex', justifyContent:'flex-end', gap:'0.5rem', marginTop:'1rem'}}>
            <button type="button" className="btn-secondary" onClick={() => setIsPolicyModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn-primary">{editingPolicy ? "Actualizar" : "Guardar"}</button>
          </div>
        </form>
      </Modal>

      {/* Modal Historial de Cambios */}
      <Modal isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)} title={historyModalConfig.title}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '70vh', overflowY: 'auto' }}>
          {historyModalConfig.logs.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '1rem' }}>No hay registros en el historial de cambios.</p>
          ) : (
            [...historyModalConfig.logs].reverse().map((log, index) => (
              <div key={log.id || index} style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem', background: 'var(--bg-primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed var(--border-color)', paddingBottom: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span className="badge badge-info" style={{ fontWeight: 700 }}>Versión {log.version}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{log.date}</span>
                </div>
                
                <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <BookOpen size={12} /> Declaración Registrada
                  </label>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', paddingLeft: '4px', borderLeft: '2px solid var(--border-color)', margin: '4px 0' }}>
                    {log.text}
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <div><strong>Firma de Aprobación:</strong> {log.signedBy}</div>
                  <div><strong>Motivo del Cambio:</strong> {log.changeReason}</div>
                </div>
              </div>
            ))
          )}
        </div>
        <div style={{display:'flex', justifyContent:'flex-end', marginTop:'1.5rem'}}>
          <button type="button" className="btn-primary" onClick={() => setIsHistoryModalOpen(false)}>Cerrar Historial</button>
        </div>
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
        layout={exportConfig.layout}
      />
    </>
  );
}
