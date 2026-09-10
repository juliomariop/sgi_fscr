import React, { useState, useEffect } from 'react';
import { Users, Plus, Download, Edit2, Trash2, CheckCircle, Clock, FileText, Paperclip, Calendar, Shield, Award, Clipboard } from 'lucide-react';
import Modal from '../components/Modal';
import { downloadCSV } from '../utils/exportUtils';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAppUsers } from '../hooks/useAppUsers';

const committeeTypes = [
  { id: 'copasst', name: 'COPASST', desc: 'Comité Paritario de Seguridad y Salud en el Trabajo', mandate: 'Vigila y promueve la salud ocupacional en todos los niveles.', color: 'var(--accent-primary)' },
  { id: 'convivencia', name: 'Comité de Convivencia', desc: 'Comité de Convivencia Laboral', mandate: 'Previene el acoso laboral y protege a los colaboradores contra riesgos psicosociales.', color: 'var(--success)' },
  { id: 'pesv', name: 'Comité Seguridad Vial', desc: 'Comité del Plan Estratégico de Seguridad Vial (PESV)', mandate: 'Diseña y supervisa las políticas de movilidad segura y prevención vial.', color: 'var(--warning)' }
];

const defaultMeeting = {
  actNumber: '',
  date: '',
  attendees: '',
  topics: '',
  attachments: '',
  commitments: [] // Array of { id, desc, responsible, dueDate, status }
};

export default function Committees() {
  const APP_USERS = useAppUsers();
  
  const [committeesData, setCommitteesData] = useLocalStorage('sgi_committees', [
    {
      id: 1,
      type: 'copasst',
      actNumber: 'COPASST-2026-001',
      date: '2026-05-15',
      attendees: 'Carlos Gómez (Coordinador), Ana María Torres (Representante de trabajadores), Diego Castro (Vigía)',
      topics: 'Inspección periódica de extintores del primer piso, revisión de reportes de actos inseguros y planeación de simulacro anual.',
      attachments: 'acta_copasst_firmada.pdf',
      commitments: [
        { id: 101, desc: 'Reubicar el extintor de CO2 del pasillo administrativo para mayor accesibilidad', responsible: 'Carlos Gómez', dueDate: '2026-05-22', status: 'Completado' },
        { id: 102, desc: 'Actualizar hoja de vida y tarjetas de control de camillas de primeros auxilios', responsible: 'Diego Castro', dueDate: '2026-05-28', status: 'Pendiente' }
      ]
    },
    {
      id: 2,
      type: 'convivencia',
      actNumber: 'COCOLA-2026-001',
      date: '2026-05-18',
      attendees: 'Laura Espitia (Presidente), Pedro Infante (Secretario), Jairo Jiménez (Asesor)',
      topics: 'Revisión del buzón de quejas (cero reportes recibidos), preparación de la campaña de comunicación asertiva y respeto laboral.',
      attachments: 'acta_cocolas_mayo.pdf',
      commitments: [
        { id: 201, desc: 'Diseñar e imprimir 4 infografías sobre relaciones saludables en el trabajo', responsible: 'Laura Espitia', dueDate: '2026-06-10', status: 'Pendiente' }
      ]
    },
    {
      id: 3,
      type: 'pesv',
      actNumber: 'PESV-2026-001',
      date: '2026-05-20',
      attendees: 'Pedro Infante (Líder PESV), Carlos Gómez (SST), Fernando Rueda (Jefe de Logística)',
      topics: 'Evaluación del cumplimiento de inspecciones preoperacionales vehiculares en la flota de reparto, análisis de incidentes en ruta norte.',
      attachments: 'pesv_acta_1.pdf',
      commitments: [
        { id: 301, desc: 'Auditar aleatoriamente 10 planillas físicas preoperacionales de conductores', responsible: 'Pedro Infante', dueDate: '2026-05-25', status: 'Completado' },
        { id: 302, desc: 'Realizar capacitación en manejo defensivo y fatiga al personal logístico', responsible: 'Fernando Rueda', dueDate: '2026-06-15', status: 'Pendiente' }
      ]
    }
  ]);

  const [activeCommittee, setActiveCommittee] = useState('copasst');
  const [activeSubTab, setActiveSubTab] = useState('members'); // members, actas, compromisos
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(defaultMeeting);
  
  // Temporary commitment input fields in creation modal
  const [newCommitmentDesc, setNewCommitmentDesc] = useState('');
  const [newCommitmentResp, setNewCommitmentResp] = useState('');
  const [newCommitmentDate, setNewCommitmentDate] = useState('');

  // Committee members state
  const [members, setMembers] = useLocalStorage('sgi_committees_members', [
    // COPASST
    { id: 1, committeeId: 'copasst', name: 'Carlos Gómez', jobTitle: 'Coordinador SST', committeeRole: 'Presidente' },
    { id: 2, committeeId: 'copasst', name: 'Ana María Torres', jobTitle: 'Auxiliar Administrativa', committeeRole: 'Secretaria' },
    { id: 3, committeeId: 'copasst', name: 'Diego Castro', jobTitle: 'Supervisor de Operaciones', committeeRole: 'Vocal / Vigía' },
    // COCOLA
    { id: 4, committeeId: 'convivencia', name: 'Laura Espitia', jobTitle: 'Especialista Gestión Humana', committeeRole: 'Presidente' },
    { id: 5, committeeId: 'convivencia', name: 'Pedro Infante', jobTitle: 'Analista de Nómina', committeeRole: 'Secretario' },
    { id: 6, committeeId: 'convivencia', name: 'Jairo Jiménez', jobTitle: 'Asesor HSEQ Externo', committeeRole: 'Asesor / Invitado' },
    // PESV
    { id: 7, committeeId: 'pesv', name: 'Pedro Infante', jobTitle: 'Analista de Nómina', committeeRole: 'Líder PESV' },
    { id: 8, committeeId: 'pesv', name: 'Carlos Gómez', jobTitle: 'Coordinador SST', committeeRole: 'Vocal SST' },
    { id: 9, committeeId: 'pesv', name: 'Fernando Rueda', jobTitle: 'Jefe de Logística', committeeRole: 'Vocal Operaciones' }
  ]);

  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [memberFormData, setMemberFormData] = useState({ name: '', jobTitle: '', committeeRole: 'Vocal' });

  // Meeting detailed view states
  const [selectedMeetingId, setSelectedMeetingId] = useState(null);
  const [meetingTab, setMeetingTab] = useState('detail'); // detail, participants, commitments

  // Inline commitment form in meeting detail panel
  const [inlineCommDesc, setInlineCommDesc] = useState('');
  const [inlineCommResp, setInlineCommResp] = useState('');
  const [inlineCommDate, setInlineCommDate] = useState('');

  const currentCommitteeConfig = committeeTypes.find(c => c.id === activeCommittee);
  const currentActas = committeesData.filter(c => c.type === activeCommittee);

  // Sync selected meeting
  useEffect(() => {
    if (currentActas.length > 0) {
      if (!selectedMeetingId || !currentActas.some(a => a.id === selectedMeetingId)) {
        setSelectedMeetingId(currentActas[0].id);
      }
    } else {
      setSelectedMeetingId(null);
    }
  }, [activeCommittee, committeesData]);

  const selectedMeeting = committeesData.find(c => c.id === selectedMeetingId);

  const handleCommitteeChange = (cId) => {
    setActiveCommittee(cId);
    setActiveSubTab('members');
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({ ...defaultMeeting, ...item });
    } else {
      setEditingItem(null);
      setFormData({
        ...defaultMeeting,
        type: activeCommittee,
        date: new Date().toISOString().split('T')[0]
      });
    }
    setNewCommitmentDesc('');
    setNewCommitmentResp(APP_USERS[0]?.name || '');
    setNewCommitmentDate('');
    setIsModalOpen(true);
  };

  const handleAddCommitment = () => {
    if (!newCommitmentDesc.trim()) return;
    const newComm = {
      id: Date.now() + Math.random(),
      desc: newCommitmentDesc,
      responsible: newCommitmentResp || APP_USERS[0]?.name || 'Responsable',
      dueDate: newCommitmentDate || new Date().toISOString().split('T')[0],
      status: 'Pendiente'
    };
    setFormData({
      ...formData,
      commitments: [...formData.commitments, newComm]
    });
    setNewCommitmentDesc('');
    setNewCommitmentDate('');
  };

  const handleRemoveCommitment = (cId) => {
    setFormData({
      ...formData,
      commitments: formData.commitments.filter(c => c.id !== cId)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanData = {
      ...formData,
      type: activeCommittee
    };

    if (editingItem) {
      setCommitteesData(committeesData.map(c => c.id === editingItem.id ? { ...cleanData, id: c.id } : c));
    } else {
      const newId = Date.now();
      setCommitteesData([...committeesData, { ...cleanData, id: newId, participantsList: [] }]);
      setSelectedMeetingId(newId);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Está seguro de eliminar esta acta de reunión del comité?")) {
      const remaining = committeesData.filter(c => c.id !== id);
      setCommitteesData(remaining);
      if (selectedMeetingId === id) {
        setSelectedMeetingId(remaining.filter(c => c.type === activeCommittee)[0]?.id || null);
      }
    }
  };

  const toggleCommitmentStatus = (actId, commId) => {
    setCommitteesData(committeesData.map(c => {
      if (c.id === actId) {
        return {
          ...c,
          commitments: c.commitments.map(comm => {
            if (comm.id === commId) {
              return {
                ...comm,
                status: comm.status === 'Completado' ? 'Pendiente' : 'Completado'
              };
            }
            return comm;
          })
        };
      }
      return c;
    }));
  };

  // Member Handlers
  const handleOpenMemberModal = (member = null) => {
    if (member) {
      setEditingMember(member);
      setMemberFormData({
        name: member.name,
        jobTitle: member.jobTitle,
        committeeRole: member.committeeRole
      });
    } else {
      setEditingMember(null);
      setMemberFormData({ name: '', jobTitle: '', committeeRole: 'Vocal' });
    }
    setIsMemberModalOpen(true);
  };

  const handleSaveMember = (e) => {
    e.preventDefault();
    if (editingMember) {
      setMembers(members.map(m => m.id === editingMember.id ? { ...m, ...memberFormData } : m));
    } else {
      setMembers([...members, { ...memberFormData, id: Date.now(), committeeId: activeCommittee }]);
    }
    setIsMemberModalOpen(false);
  };

  const handleDeleteMember = (mId) => {
    if (window.confirm("¿Está seguro de retirar a este integrante del comité?")) {
      setMembers(members.filter(m => m.id !== mId));
    }
  };

  // Inline meeting commitments handlers
  const handleAddInlineCommitment = (e) => {
    e.preventDefault();
    if (!inlineCommDesc.trim() || !selectedMeetingId) return;

    const newComm = {
      id: Date.now(),
      desc: inlineCommDesc.trim(),
      responsible: inlineCommResp || APP_USERS[0]?.name || 'Responsable',
      dueDate: inlineCommDate || new Date().toISOString().split('T')[0],
      status: 'Pendiente'
    };

    setCommitteesData(committeesData.map(c => {
      if (c.id === selectedMeetingId) {
        return {
          ...c,
          commitments: [...(c.commitments || []), newComm]
        };
      }
      return c;
    }));

    setInlineCommDesc('');
    setInlineCommDate('');
  };

  const handleRemoveInlineCommitment = (commId) => {
    if (!selectedMeetingId) return;
    if (window.confirm("¿Está seguro de eliminar este compromiso?")) {
      setCommitteesData(committeesData.map(c => {
        if (c.id === selectedMeetingId) {
          return {
            ...c,
            commitments: (c.commitments || []).filter(cm => cm.id !== commId)
          };
        }
         return c;
      }));
    }
  };

  const handleExport = () => {
    const list = committeesData.filter(c => c.type === activeCommittee);
    downloadCSV(
      list.map(c => ({
        Acta_Nro: c.actNumber,
        Fecha: c.date,
        Asistentes: c.attendees,
        Temas_Tratados: c.topics,
        Compromisos_Total: c.commitments.length,
        Compromisos_Pendientes: c.commitments.filter(comm => comm.status === 'Pendiente').length
      })),
      `Actas_${activeCommittee.toUpperCase()}`
    );
  };

  // Filtered members for current committee
  const currentMembers = members.filter(m => m.committeeId === activeCommittee);

  // Extract all commitments for the current active committee
  const currentCommitments = [];
  currentActas.forEach(act => {
    (act.commitments || []).forEach(comm => {
      currentCommitments.push({
        ...comm,
        actId: act.id,
        actNumber: act.actNumber,
        actDate: act.date
      });
    });
  });

  return (
    <>
      <style>{`
        .meeting-row {
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        .meeting-row:hover {
          background-color: var(--bg-secondary) !important;
        }
        .meeting-row.active {
          background-color: var(--bg-tertiary) !important;
          border-left: 4px solid var(--accent-primary) !important;
        }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>ISO 45001 - Cláusula 5.4</p>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Comités y Participación</h2>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button className="btn-secondary" onClick={handleExport}><Download size={16} /> Exportar Actas</button>
          {activeSubTab === 'members' && (
            <button className="btn-primary" onClick={() => handleOpenMemberModal()}><Plus size={16} /> Agregar Integrante</button>
          )}
          {activeSubTab === 'actas' && (
            <button className="btn-primary" onClick={() => handleOpenModal()}><Plus size={16} /> Registrar Acta</button>
          )}
        </div>
      </div>

      {/* Committee Selectors */}
      <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
        {committeeTypes.map(c => {
          const isActive = activeCommittee === c.id;
          const count = committeesData.filter(item => item.type === c.id).length;
          return (
            <div 
              key={c.id} 
              className="card fade-in" 
              style={{ 
                cursor: 'pointer', 
                border: isActive ? `2px solid ${c.color}` : '1px solid var(--border-color)',
                boxShadow: isActive ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                padding: '1.25rem',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all var(--transition-speed)',
                transform: isActive ? 'translateY(-2px)' : 'none'
              }}
              onClick={() => handleCommitteeChange(c.id)}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ 
                    background: isActive ? `${c.color}22` : 'var(--bg-tertiary)', 
                    color: isActive ? c.color : 'var(--text-secondary)',
                    padding: '0.4rem', 
                    borderRadius: '50%',
                    display: 'inline-flex',
                    alignItems: 'center'
                  }}>
                    <Users size={20} />
                  </span>
                  <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>{count} Actas</span>
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{c.name}</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.3' }}>{c.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Box */}
      <div className="card" style={{ background: 'var(--bg-secondary)', borderLeft: `4px solid ${currentCommitteeConfig.color}`, padding: '1rem 1.5rem', marginBottom: '1.5rem' }}>
        <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.25rem' }}>Propósito e Integración de la Mesa</h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{currentCommitteeConfig.mandate}</p>
      </div>

      {/* Sub Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button 
          className={`btn-secondary ${activeSubTab === 'members' ? 'active' : ''}`} 
          style={{ border: 'none', background: activeSubTab === 'members' ? 'rgba(99, 102, 241, 0.1)' : 'transparent', color: activeSubTab === 'members' ? 'var(--accent-primary)' : 'var(--text-secondary)', fontWeight: 600 }}
          onClick={() => setActiveSubTab('members')}
        >
          Integrantes del Comité ({currentMembers.length})
        </button>
        <button 
          className={`btn-secondary ${activeSubTab === 'actas' ? 'active' : ''}`} 
          style={{ border: 'none', background: activeSubTab === 'actas' ? 'rgba(14, 165, 233, 0.1)' : 'transparent', color: activeSubTab === 'actas' ? 'var(--accent-primary)' : 'var(--text-secondary)', fontWeight: 600 }}
          onClick={() => setActiveSubTab('actas')}
        >
          Actas y Reuniones ({currentActas.length})
        </button>
        <button 
          className={`btn-secondary ${activeSubTab === 'compromisos' ? 'active' : ''}`} 
          style={{ border: 'none', background: activeSubTab === 'compromisos' ? 'rgba(16, 185, 129, 0.1)' : 'transparent', color: activeSubTab === 'compromisos' ? 'var(--success)' : 'var(--text-secondary)', fontWeight: 600 }}
          onClick={() => setActiveSubTab('compromisos')}
        >
          Planes de Acción ({currentCommitments.filter(cm => cm.status === 'Pendiente').length} pend.)
        </button>
      </div>

      {/* TAB 1: INTEGRANTES DEL COMITE */}
      {activeSubTab === 'members' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Nombre del Integrante</th>
                  <th>Cargo en la Empresa</th>
                  <th>Cargo en el Comité</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentMembers.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                      No hay integrantes registrados en este comité.
                    </td>
                  </tr>
                ) : (
                  currentMembers.map(m => (
                    <tr key={m.id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{m.name}</td>
                      <td>{m.jobTitle}</td>
                      <td>
                        <span className="badge badge-info" style={{ fontWeight: 600 }}>{m.committeeRole}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          <button className="btn-icon" style={{ padding: '0.25rem' }} onClick={() => handleOpenMemberModal(m)}><Edit2 size={14} /></button>
                          <button className="btn-icon" style={{ padding: '0.25rem', color: 'var(--danger)' }} onClick={() => handleDeleteMember(m.id)}><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ACTAS Y REUNIONES (CON DETALLE MAESTRO-DETALLE) */}
      {activeSubTab === 'actas' && (
        <>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Nro. Acta</th>
                    <th>Fecha</th>
                    <th>Temas Tratados</th>
                    <th>Asistentes Generales</th>
                    <th>Compromisos</th>
                    <th>Soportes firmados</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {currentActas.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                        No se han registrado actas de reunión para este comité.
                      </td>
                    </tr>
                  ) : (
                    currentActas.map(item => (
                      <tr 
                        key={item.id} 
                        className={`meeting-row ${item.id === selectedMeetingId ? 'active' : ''}`}
                        onClick={() => setSelectedMeetingId(item.id)}
                      >
                        <td style={{ fontWeight: 600 }}>{item.actNumber}</td>
                        <td>{item.date}</td>
                        <td style={{ maxWidth: '280px', fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.topics}</td>
                        <td style={{ maxWidth: '200px', fontSize: '0.85rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.attendees}</td>
                        <td>
                          <span className={`badge ${(item.commitments || []).filter(c => c.status === 'Pendiente').length > 0 ? 'badge-warning' : 'badge-success'}`}>
                            {(item.commitments || []).filter(c => c.status === 'Completado').length}/{(item.commitments || []).length}
                          </span>
                        </td>
                        <td>
                          {item.participantsList && item.participantsList.length > 0 ? (
                            <span className="badge badge-success" style={{ fontWeight: 600 }}>
                              {item.participantsList.length} asistencia(s)
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Sin firmas QR</span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.25rem' }} onClick={e => e.stopPropagation()}>
                            <button className="btn-icon" style={{ padding: '0.25rem' }} onClick={() => handleOpenModal(item)}><Edit2 size={14} /></button>
                            <button className="btn-icon" style={{ padding: '0.25rem', color: 'var(--danger)' }} onClick={() => handleDelete(item.id)}><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* DETALLE DEL ACTA SELECCIONADA */}
          {selectedMeeting && (
            <div className="card fade-in" style={{ marginTop: '1.5rem', padding: '1.25rem', borderLeft: `4px solid ${currentCommitteeConfig.color}`, marginBottom: '2rem' }}>
              
              {/* Header de la Ficha */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <span className="badge badge-info" style={{ marginBottom: '0.25rem', display: 'inline-block' }}>
                    <Clipboard size={10} style={{ marginRight: '4px' }} /> Control de Reunión de Comité
                  </span>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
                    Acta Nro. {selectedMeeting.actNumber}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Fecha de Reunión: <strong>{selectedMeeting.date}</strong> | Comité: <strong>{currentCommitteeConfig.name}</strong>
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button className="btn-secondary" style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem' }} onClick={() => handleOpenModal(selectedMeeting)}>
                    <Edit2 size={12} style={{ marginRight: '4px' }} /> Editar Acta
                  </button>
                </div>
              </div>

              {/* Sub-Navegación de Pestañas de la Ficha */}
              <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <button 
                  className={`btn-secondary ${meetingTab === 'detail' ? 'active' : ''}`}
                  style={{ border: 'none', fontSize: '0.8rem', padding: '0.3rem 0.6rem', background: meetingTab === 'detail' ? 'rgba(14, 165, 233, 0.1)' : 'transparent', color: meetingTab === 'detail' ? 'var(--accent-primary)' : 'var(--text-secondary)' }}
                  onClick={() => setMeetingTab('detail')}
                >
                  <FileText size={12} style={{ marginRight: '3px' }} /> Detalle y QR de Asistencia
                </button>
                <button 
                  className={`btn-secondary ${meetingTab === 'participants' ? 'active' : ''}`}
                  style={{ border: 'none', fontSize: '0.8rem', padding: '0.3rem 0.6rem', background: meetingTab === 'participants' ? 'rgba(99, 102, 241, 0.1)' : 'transparent', color: meetingTab === 'participants' ? 'var(--accent-primary)' : 'var(--text-secondary)' }}
                  onClick={() => setMeetingTab('participants')}
                >
                  <Users size={12} style={{ marginRight: '3px' }} /> Asistentes Firmados ({selectedMeeting.participantsList?.length || 0})
                </button>
                <button 
                  className={`btn-secondary ${meetingTab === 'commitments' ? 'active' : ''}`}
                  style={{ border: 'none', fontSize: '0.8rem', padding: '0.3rem 0.6rem', background: meetingTab === 'commitments' ? 'rgba(16, 185, 129, 0.1)' : 'transparent', color: meetingTab === 'commitments' ? 'var(--success)' : 'var(--text-secondary)' }}
                  onClick={() => setMeetingTab('commitments')}
                >
                  <Clipboard size={12} style={{ marginRight: '3px' }} /> Planes de Acción de esta Acta ({selectedMeeting.commitments?.length || 0})
                </button>
              </div>

              {/* Ficha Tab 1: Detalle y Asistencia (QR) */}
              {meetingTab === 'detail' && (
                <div className="grid-2 fade-in" style={{ gap: '1.25rem' }}>
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Temas Tratados y Conclusiones</h4>
                    <div style={{ background: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: '6px', border: '1px solid var(--border-color)', minHeight: '120px', fontSize: '0.82rem', lineHeight: '1.4' }}>
                      <p style={{ margin: '0 0 0.5rem 0', whiteSpace: 'pre-line' }}>{selectedMeeting.topics}</p>
                      {selectedMeeting.attachments && (
                        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.4rem', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-primary)' }}>
                          <Paperclip size={12} /> Soporte de Acta: <strong>{selectedMeeting.attachments}</strong>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Control de Asistencia Digital (QR)</h4>
                    <div style={{ background: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: '6px', border: '1px solid var(--border-color)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <div style={{ background: 'white', padding: '0.35rem', borderRadius: '4px', border: '1px solid var(--border-color)', display: 'inline-flex' }}>
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${encodeURIComponent(`${window.location.origin}/asistencia-comite/${selectedMeeting.id}`)}`} 
                          alt="QR Asistencia Comité" 
                          style={{ width: '130px', height: '130px', display: 'block' }}
                        />
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Escanear QR para firmar</span>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.3' }}>
                          Permite que los integrantes firmen el registro de asistencia directamente desde sus teléfonos móviles.
                        </p>
                        <button 
                          className="btn-secondary" 
                          style={{ padding: '0.3rem 0.5rem', fontSize: '0.74rem', width: 'fit-content', marginTop: '0.2rem' }}
                          onClick={() => window.open(`/asistencia-comite/${selectedMeeting.id}`, '_blank')}
                        >
                          Simular Registro de Asistencia
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Ficha Tab 2: Asistentes Firmados */}
              {meetingTab === 'participants' && (
                <div className="fade-in">
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Registro de Asistentes Confirmados (Firmas Electrónicas)</h4>
                  
                  {(!selectedMeeting.participantsList || selectedMeeting.participantsList.length === 0) ? (
                    <div style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '6px', border: '1px dashed var(--border-color)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      Nadie ha firmado asistencia para esta reunión todavía. Escanea el código QR de arriba para registrar la primera asistencia.
                    </div>
                  ) : (
                    <div className="table-responsive" style={{ border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                      <table className="table" style={{ fontSize: '0.8rem' }}>
                        <thead style={{ background: 'var(--bg-secondary)' }}>
                          <tr>
                            <th>Nombre</th>
                            <th>Identificación</th>
                            <th>Cargo Empresa</th>
                            <th>Cargo Comité</th>
                            <th>Firma Digital</th>
                            <th>Fecha Registro</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedMeeting.participantsList.map(p => (
                            <tr key={p.id}>
                              <td style={{ fontWeight: 600 }}>{p.name}</td>
                              <td>{p.document}</td>
                              <td>{p.jobTitle}</td>
                              <td><span className="badge badge-info" style={{ fontSize: '0.72rem' }}>{p.committeeRole}</span></td>
                              <td>
                                {p.signature ? (
                                  <img 
                                    src={p.signature} 
                                    alt="Firma" 
                                    style={{ height: '28px', display: 'block', background: 'white', padding: '1px', border: '1px solid var(--border-color)', borderRadius: '2px' }} 
                                  />
                                ) : (
                                  <span style={{ color: 'var(--text-muted)' }}>Sin firma</span>
                                )}
                              </td>
                              <td style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{p.registeredAt}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Ficha Tab 3: Planes de Acción específicos de la reunión */}
              {meetingTab === 'commitments' && (
                <div className="grid-2 fade-in" style={{ gap: '1.25rem' }}>
                  
                  {/* Lista de planes de acción/compromisos de esta acta */}
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Lista de Compromisos Establecidos</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '250px', overflowY: 'auto' }}>
                      {(!selectedMeeting.commitments || selectedMeeting.commitments.length === 0) ? (
                        <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '6px', border: '1px dashed var(--border-color)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          No se han asignado compromisos para esta reunión. Utilice el formulario de la derecha para registrar uno.
                        </div>
                      ) : (
                        selectedMeeting.commitments.map(comm => (
                          <div key={comm.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, minWidth: 0 }}>
                              <span style={{ fontSize: '0.82rem', fontWeight: 600, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={comm.desc}>
                                {comm.desc}
                              </span>
                              <div style={{ display: 'flex', gap: '0.6rem', fontSize: '0.72rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                                <span>👤 Resp: <strong>{comm.responsible}</strong></span>
                                <span>📅 Límite: <strong>{comm.dueDate}</strong></span>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <button 
                                className={`badge ${comm.status === 'Completado' ? 'badge-success' : 'badge-warning'}`}
                                style={{ border: 'none', cursor: 'pointer', padding: '0.2rem 0.4rem', fontSize: '0.72rem' }}
                                onClick={() => toggleCommitmentStatus(selectedMeeting.id, comm.id)}
                              >
                                {comm.status}
                              </button>
                              <button 
                                type="button" 
                                className="btn-icon" 
                                style={{ color: 'var(--danger)', padding: '0.2rem' }} 
                                onClick={() => handleRemoveInlineCommitment(comm.id)}
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Formulario rápido para agregar compromiso */}
                  <div>
                    <form onSubmit={handleAddInlineCommitment} style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', background: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                      <h4 style={{ fontSize: '0.82rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: 'var(--success)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem' }}>Registrar Nuevo Plan de Acción</h4>
                      
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.72rem' }}>Descripción de la Tarea / Compromiso</label>
                        <input 
                          type="text" 
                          className="form-control text-sm" 
                          style={{ padding: '0.3rem', fontSize: '0.78rem' }}
                          value={inlineCommDesc} 
                          onChange={e => setInlineCommDesc(e.target.value)} 
                          placeholder="Ej. Realizar adecuación de extintores" 
                          required 
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label className="form-label" style={{ fontSize: '0.72rem' }}>Fecha Límite</label>
                          <input 
                            type="date" 
                            className="form-control text-sm" 
                            style={{ padding: '0.2rem', fontSize: '0.78rem' }}
                            value={inlineCommDate} 
                            onChange={e => setInlineCommDate(e.target.value)} 
                            required 
                          />
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label className="form-label" style={{ fontSize: '0.72rem' }}>Responsable</label>
                          <select 
                            className="form-control text-sm" 
                            style={{ padding: '0.2rem', fontSize: '0.78rem' }}
                            value={inlineCommResp} 
                            onChange={e => setInlineCommResp(e.target.value)} 
                            required
                          >
                            <option value="">Seleccione...</option>
                            {APP_USERS.map(u => <option key={u.email} value={u.name}>{u.name}</option>)}
                          </select>
                        </div>
                      </div>

                      <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.4rem', padding: '0.35rem', fontSize: '0.78rem', background: 'var(--success)' }}>
                        Crear Compromiso
                      </button>
                    </form>
                  </div>
                </div>
              )}

            </div>
          )}
        </>
      )}

      {/* TAB 3: LISTADO GLOBAL DE COMPROMISOS Y PLANES DE ACCION */}
      {activeSubTab === 'compromisos' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Acta Origen</th>
                  <th>Compromiso / Plan de Acción</th>
                  <th>Responsable</th>
                  <th>Fecha Límite</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {currentCommitments.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                      No se han asignado compromisos para este comité aún.
                    </td>
                  </tr>
                ) : (
                  currentCommitments.map(c => (
                    <tr key={c.id}>
                      <td style={{ fontSize: '0.85rem' }}>
                        <div style={{ fontWeight: 600 }}>{c.actNumber}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{c.actDate}</div>
                      </td>
                      <td style={{ fontSize: '0.85rem', fontWeight: 500 }}>{c.desc}</td>
                      <td>{c.responsible}</td>
                      <td>{c.dueDate}</td>
                      <td>
                        <span className={`badge ${c.status === 'Completado' ? 'badge-success' : 'badge-warning'}`}>
                          {c.status === 'Completado' ? <CheckCircle size={12} style={{ marginRight:'2px' }} /> : <Clock size={12} style={{ marginRight:'2px' }} />} {c.status}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="btn-secondary" 
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', borderColor: c.status === 'Completado' ? 'var(--warning)' : 'var(--success)' }} 
                          onClick={() => toggleCommitmentStatus(c.actId, c.id)}
                        >
                          Marcar como {c.status === 'Completado' ? 'Pendiente' : 'Completado'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL REGISTRAR REUNION (ACTA) */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? `Editar Acta - ${currentCommitteeConfig.name}` : `Registrar Acta - ${currentCommitteeConfig.name}`}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Número de Acta</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Ej: COPASST-2026-002" 
                value={formData.actNumber} 
                onChange={e => setFormData({ ...formData, actNumber: e.target.value })} 
                required 
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Fecha de Reunión</label>
              <input 
                type="date" 
                className="form-control" 
                value={formData.date} 
                onChange={e => setFormData({ ...formData, date: e.target.value })} 
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Asistentes a la Reunión</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Nombres y cargos de los asistentes..." 
              value={formData.attendees} 
              onChange={e => setFormData({ ...formData, attendees: e.target.value })} 
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Temas Tratados y Resumen de la Acta</label>
            <textarea 
              className="form-control" 
              rows="3" 
              placeholder="Describa brevemente los puntos de la agenda tratados y las conclusiones..." 
              value={formData.topics} 
              onChange={e => setFormData({ ...formData, topics: e.target.value })}
              required 
            />
          </div>

          {/* ADDING DYNAMIC COMMITMENTS SECTION */}
          <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem', background: 'var(--bg-primary)' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clipboard size={14} color="var(--accent-primary)" /> Asignación de Compromisos
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Descripción del compromiso..." 
                value={newCommitmentDesc} 
                onChange={e => setNewCommitmentDesc(e.target.value)} 
              />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select 
                  className="form-control" 
                  value={newCommitmentResp} 
                  onChange={e => setNewCommitmentResp(e.target.value)}
                  style={{ flex: 1 }}
                >
                  <option value="">Seleccione Responsable</option>
                  {APP_USERS.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                </select>
                <input 
                  type="date" 
                  className="form-control" 
                  value={newCommitmentDate} 
                  onChange={e => setNewCommitmentDate(e.target.value)} 
                  style={{ flex: 1 }}
                />
                <button type="button" className="btn-primary" onClick={handleAddCommitment} style={{ padding: '0.5rem 0.75rem' }}>Agregar</button>
              </div>
            </div>

            {formData.commitments && formData.commitments.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '150px', overflowY: 'auto', paddingRight: '4px' }}>
                {formData.commitments.map((comm, idx) => (
                  <div key={comm.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)', padding: '0.4rem 0.6rem', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
                    <div style={{ flex: 1, paddingRight: '8px' }}>
                      <div style={{ fontWeight: 500 }}>{comm.desc}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Responsable: {comm.responsible} | Límite: {comm.dueDate}</div>
                    </div>
                    <button type="button" className="btn-icon" style={{ padding: '0.2rem', color: 'var(--danger)' }} onClick={() => handleRemoveCommitment(comm.id)}><Trash2 size={12} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Soporte/Cargue Acta Escaneada (Opcional)</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Ej: acta_firmada.pdf (Nombre del archivo cargado)" 
              value={formData.attachments} 
              onChange={e => setFormData({ ...formData, attachments: e.target.value })} 
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn-primary">Registrar Acta</button>
          </div>
        </form>
      </Modal>

      {/* MODAL INTEGRANTES DEL COMITE */}
      <Modal isOpen={isMemberModalOpen} onClose={() => setIsMemberModalOpen(false)} title={editingMember ? "Editar Integrante del Comité" : "Agregar Integrante al Comité"}>
        <form onSubmit={handleSaveMember} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Nombre Completo</label>
            <input 
              type="text" 
              className="form-control" 
              value={memberFormData.name} 
              onChange={e => setMemberFormData({ ...memberFormData, name: e.target.value })} 
              placeholder="Ej. Juan Pérez" 
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Cargo en la Empresa</label>
            <input 
              type="text" 
              className="form-control" 
              value={memberFormData.jobTitle} 
              onChange={e => setMemberFormData({ ...memberFormData, jobTitle: e.target.value })} 
              placeholder="Ej. Operario de Producción" 
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Cargo en el Comité</label>
            <select 
              className="form-control" 
              value={memberFormData.committeeRole} 
              onChange={e => setMemberFormData({ ...memberFormData, committeeRole: e.target.value })} 
              required
            >
              <option value="Presidente">Presidente</option>
              <option value="Secretario">Secretario</option>
              <option value="Vocal">Vocal</option>
              <option value="Vigía">Vigía</option>
              <option value="Representante Trabajadores">Representante Trabajadores</option>
              <option value="Representante Empleador">Representante Empleador</option>
              <option value="Invitado / Asesor">Invitado / Asesor</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem' }}>
            <button type="button" className="btn-secondary" onClick={() => setIsMemberModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn-primary">Guardar Integrante</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
