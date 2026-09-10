import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Target, FileText, MessageSquare, AlertCircle, CheckCircle, Clock, Users, TrendingUp, RefreshCw, ShieldAlert } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Extraer el identificador del usuario para filtrado (simulado)
  const isAdmin = user?.role === 'Administrador General' || user?.email?.toLowerCase().trim() === 'jjairojimenez@gmail.com';
  const userIdentifier = user?.email ? user.email.split('@')[0].toLowerCase() : 'admin';
  const userNameDisplay = user?.name || (isAdmin ? 'Administrador General' : userIdentifier === 'calidad' ? 'Líder de Calidad' : 'Analista de Operaciones');
  const userRole = isAdmin ? 'Administrador General' : (user?.role || '');

  const [actionPlans] = useLocalStorage('sgi_action_plans', []);
  const [pqrs] = useLocalStorage('sgi_pqrs', []);
  const [docs] = useLocalStorage('sgi_docs', []);
  const [stakeholders] = useLocalStorage('sgi_stakeholders', []);
  const [objectives] = useLocalStorage('sgi_objectives', []);
  const [changes] = useLocalStorage('sgi_changes', []);
  const [risksIso] = useLocalStorage('sgi_risks_iso', []);
  const [oppsIso] = useLocalStorage('sgi_opportunities_iso', []);
  const [risksSst] = useLocalStorage('sgi_risks_sst', []);
  const [vendors] = useLocalStorage('sgi_vendors_list', []);
  const [evaluations] = useLocalStorage('sgi_vendors_evaluations', []);
  const [maintenances] = useLocalStorage('sgi_maintenances', []);
  const [trainings] = useLocalStorage('sgi_trainings', []);
  const [unsafeReports] = useLocalStorage('sgi_unsafe_reports', []);

  // Filtrado de Datos para el usuario logueado
  const filterByResponsibility = (itemRespField) => {
    if (isAdmin) return true;
    if (!itemRespField) return false;
    
    const cleanField = itemRespField.toLowerCase().trim();
    const cleanName = user?.name ? user.name.toLowerCase().trim() : '';
    const cleanEmail = user?.email ? user.email.toLowerCase().trim() : '';
    
    return cleanField.includes(userIdentifier) || 
           (cleanName && cleanField.includes(cleanName)) ||
           (cleanEmail && cleanField.includes(cleanEmail));
  };

  // Planes de Acción Asignados
  const myActionPlans = actionPlans.filter(plan => {
    if (plan.status === 'Cerrado') return false;
    const isImmediateResp = filterByResponsibility(plan.immediateResponsible) || filterByResponsibility(plan.immediateFollowResp);
    const isTaskResp = (plan.tasks || []).some(t => filterByResponsibility(t.execResp) || filterByResponsibility(t.followResp));
    return isImmediateResp || isTaskResp;
  });

  // PQRs Asignadas
  const myPqrs = pqrs.filter(p => p.status !== 'Cerrado' && filterByResponsibility(p.responsible));

  // Documentos Pendientes de Revisión, Aprobación o Eliminación
  const myDocs = docs.filter(d => {
    if (d.status !== 'Pendiente de Aprobación' && d.status !== 'Pendiente de Eliminación') return false;
    return filterByResponsibility(d.reviewer) || filterByResponsibility(d.approver);
  });

  // Partes Interesadas
  const myStakeholders = stakeholders.filter(s => filterByResponsibility(s.responsible));

  // Objetivos Integrales
  const myObjectives = objectives.filter(o => filterByResponsibility(o.responsible));

  // Gestiones del Cambio
  const myChanges = changes.filter(c => {
    if (c.status === 'Completado' || c.status === 'Cancelado') return false;
    const isApplicantOrApprover = filterByResponsibility(c.applicant) || filterByResponsibility(c.approver);
    const isTaskResp = (c.tasks || []).some(t => filterByResponsibility(t.execResp) || filterByResponsibility(t.followResp));
    return isApplicantOrApprover || isTaskResp;
  });

  // Riesgos ISO, Oportunidades ISO & Riesgos SST
  const myRisksIso = risksIso.filter(r => filterByResponsibility(r.responsible));
  const myOppsIso = oppsIso.filter(o => filterByResponsibility(o.responsible));
  const myRisksSst = risksSst.filter(r => filterByResponsibility(r.controlResponsible) || filterByResponsibility(r.complianceResponsible));
  const myRisks = [
    ...myRisksIso.map(r => ({ id: r.id, desc: `[Riesgo] ${r.description}`, type: 'ISO', resp: r.responsible })), 
    ...myOppsIso.map(o => ({ id: o.id, desc: `[Oportunidad] ${o.description}`, type: 'ISO', resp: o.responsible })), 
    ...myRisksSst.map(r => ({ id: r.id, desc: `[Peligro SST] ${r.hazard || r.description || r.task}`, type: 'SST', resp: r.controlResponsible || r.complianceResponsible }))
  ];

  const totalPending = myActionPlans.length + myPqrs.length + myDocs.length + myStakeholders.length + myObjectives.length + myChanges.length + myRisks.length;

  // Calcular Alertas HSEQ y Vencimientos Críticos
  const alertsList = React.useMemo(() => {
    const list = [];
    const todayStr = '2026-06-18';
    const today = new Date(todayStr);
    const limitDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 días después

    // 1. Evaluaciones de Proveedores
    evaluations.forEach(ev => {
      if (ev.nextEvalDate) {
        const nextDate = new Date(ev.nextEvalDate);
        if (nextDate <= today) {
          list.push({
            id: `ev-vencida-${ev.id}`,
            type: 'Evaluación Vencida',
            title: `Evaluación de ${ev.vendorName} venció el ${ev.nextEvalDate}`,
            severity: 'critical',
            path: '/vendors',
            message: 'Se requiere realizar la re-evaluación periódica obligatoria de este contratista.'
          });
        } else if (nextDate <= limitDate) {
          list.push({
            id: `ev-proxima-${ev.id}`,
            type: 'Evaluación Próxima',
            title: `Evaluación de ${ev.vendorName} vence pronto (${ev.nextEvalDate})`,
            severity: 'warning',
            path: '/vendors',
            message: 'Programe la evaluación periódica de desempeño del contratista.'
          });
        }
      }
    });

    // 2. Certificados ARL e Inducción de Contratistas
    vendors.forEach(v => {
      if (v.arlCertificate === 'Vencido') {
        list.push({
          id: `arl-vencida-${v.id}`,
          type: 'ARL Vencida',
          title: `Contratista ${v.name} tiene certificado de ARL Vencido`,
          severity: 'critical',
          path: '/vendors',
          message: 'Se debe suspender el ingreso a planta hasta presentar planilla PILA y certificado vigente.'
        });
      }
      if (v.induction === 'Pendiente') {
        list.push({
          id: `ind-pendiente-${v.id}`,
          type: 'Inducción Pendiente',
          title: `Contratista ${v.name} tiene Inducción HSEQ Pendiente`,
          severity: 'warning',
          path: '/vendors',
          message: 'Realizar inducción de seguridad antes de iniciar labores en sitio.'
        });
      }
    });

    // 3. Mantenimientos
    maintenances.forEach(m => {
      if (m.status === 'Vencido') {
        list.push({
          id: `maint-vencido-${m.id}`,
          type: 'Mantenimiento Vencido',
          title: `Mantenimiento de ${m.equipment} se encuentra Vencido`,
          severity: 'critical',
          path: '/maintenances',
          message: `Programado para el ${m.date}. Afecta la seguridad industrial.`
        });
      } else if (m.status === 'Pendiente' && m.date) {
        const mDate = new Date(m.date);
        if (mDate <= today) {
          list.push({
            id: `maint-atrasado-${m.id}`,
            type: 'Mantenimiento Atrasado',
            title: `Mantenimiento atrasado de ${m.equipment} (${m.date})`,
            severity: 'critical',
            path: '/maintenances',
            message: 'La fecha programada ya pasó. Requiere ejecución inmediata.'
          });
        }
      }
    });

    // 4. Formaciones / Capacitaciones
    trainings.forEach(t => {
      if (t.status === 'Vencido') {
        list.push({
          id: `train-vencido-${t.id}`,
          type: 'Capacitación Vencida',
          title: `Capacitación "${t.topic}" se encuentra Vencida`,
          severity: 'critical',
          path: '/trainings',
          message: `Fecha programada era el ${t.date}. Incumple plan de formación.`
        });
      } else if (t.status === 'Pendiente' && t.date) {
        const tDate = new Date(t.date);
        if (tDate <= today) {
          list.push({
            id: `train-atrasada-${t.id}`,
            type: 'Capacitación Atrasada',
            title: `Capacitación atrasada: "${t.topic}" (${t.date})`,
            severity: 'warning',
            path: '/trainings',
            message: 'Se debe reprogramar o registrar la asistencia correspondiente.'
          });
        }
      }
    });

    // 5. Reportes de actos/condiciones inseguras abiertos
    unsafeReports.forEach(r => {
      if (r.status === 'Abierto') {
        list.push({
          id: `unsafe-abierto-${r.id}`,
          type: 'Acto/Condición Abierta',
          title: `Reporte de ${r.category} abierto en ${r.area}`,
          severity: r.severity === 'Alta' ? 'critical' : 'warning',
          path: '/unsafeReports',
          message: `Descripción: "${r.description}". Requiere plan correctivo inmediato.`
        });
      }
    });

    return list;
  }, [vendors, evaluations, maintenances, trainings, unsafeReports]);

  return (
    <>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--accent-primary)', marginBottom: '0.25rem' }}>Hola, {userNameDisplay}</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            {isAdmin 
              ? 'Bienvenido a tu panel de control SGI Enterprise como Administrador General. Estás visualizando todas las pendientes de la organización.'
              : 'Bienvenido a tu panel de control SGI Enterprise. Este es tu resumen de tareas pendientes.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--danger)' }}>{totalPending}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pendientes Totales</div>
          </div>
        </div>
      </div>

      {/* PANEL DE ALERTAS CRÍTICAS */}
      {alertsList.length > 0 && (
        <div className="card fade-in" style={{ borderLeft: '4px solid var(--danger)', marginBottom: '2rem', padding: '1.25rem', background: 'rgba(239, 68, 68, 0.01)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
            <ShieldAlert style={{ color: 'var(--danger)' }} />
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--danger)' }}>Alertas HSEQ y Vencimientos Críticos</h3>
            <span className="badge badge-danger" style={{ fontSize: '0.8rem', padding: '2px 8px', borderRadius: '12px' }}>{alertsList.length}</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '220px', overflowY: 'auto', paddingRight: '0.5rem' }}>
            {alertsList.map(alert => (
              <div 
                key={alert.id}
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '0.6rem 0.8rem', 
                  background: 'var(--bg-secondary)', 
                  borderRadius: 'var(--radius-sm)', 
                  border: `1px solid ${alert.severity === 'critical' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`,
                  fontSize: '0.85rem'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span 
                      style={{ 
                        fontSize: '0.65rem', 
                        fontWeight: 700, 
                        color: '#fff', 
                        background: alert.severity === 'critical' ? 'var(--danger)' : 'var(--warning)', 
                        padding: '1px 6px', 
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                        lineHeight: '1.2'
                      }}
                    >
                      {alert.type}
                    </span>
                    <strong style={{ color: 'var(--text-primary)' }}>{alert.title}</strong>
                  </div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{alert.message}</span>
                </div>
                <button 
                  className="btn-secondary" 
                  style={{ 
                    padding: '0.25rem 0.5rem', 
                    fontSize: '0.72rem', 
                    borderColor: alert.severity === 'critical' ? 'var(--danger)' : 'var(--warning)',
                    color: alert.severity === 'critical' ? 'var(--danger)' : 'var(--warning)',
                    cursor: 'pointer'
                  }}
                  onClick={() => navigate(alert.path)}
                >
                  Gestionar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid-3" style={{ marginBottom: '2rem' }}>
        {/* Planes de Acción */}
        <div className="card" style={{ borderTop: '4px solid var(--warning)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Target size={18} color="var(--warning)" /> Planes de Acción
            </h4>
            <span className="badge badge-warning" style={{ fontSize: '1rem' }}>{myActionPlans.length}</span>
          </div>
          {myActionPlans.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No tienes tareas de planes de acción asignadas.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {myActionPlans.slice(0, 3).map(p => (
                <div 
                  key={p.id} 
                  className="dashboard-pending-item"
                  style={{ fontSize: '0.85rem', padding: '0.5rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}
                  onClick={() => navigate('/actionPlans')}
                  title="Ir a Planes de Acción"
                >
                  <strong>{p.id}</strong>: {p.desc}
                  {isAdmin && <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: '6px' }}>({p.immediateResponsible})</span>}
                </div>
              ))}
              {myActionPlans.length > 3 && (
                <p 
                  style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', cursor: 'pointer', display: 'inline-block', width: 'fit-content' }} 
                  onClick={() => navigate('/actionPlans')}
                >
                  + {myActionPlans.length - 3} más...
                </p>
              )}
            </div>
          )}
        </div>

        {/* PQRs */}
        <div className="card" style={{ borderTop: '4px solid var(--info)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageSquare size={18} color="var(--info)" /> PQR's Asignadas
            </h4>
            <span className="badge badge-info" style={{ fontSize: '1rem' }}>{myPqrs.length}</span>
          </div>
          {myPqrs.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No tienes PQRs pendientes por resolver.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {myPqrs.slice(0, 3).map(p => (
                <div 
                  key={p.id} 
                  className="dashboard-pending-item"
                  style={{ fontSize: '0.85rem', padding: '0.5rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}
                  onClick={() => navigate('/pqrs')}
                  title="Ir a PQRs Asignadas"
                >
                  <strong>{p.id}</strong>: {p.desc}
                  {isAdmin && <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: '6px' }}>({p.responsible})</span>}
                </div>
              ))}
              {myPqrs.length > 3 && (
                <p 
                  style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', cursor: 'pointer', display: 'inline-block', width: 'fit-content' }} 
                  onClick={() => navigate('/pqrs')}
                >
                  + {myPqrs.length - 3} más...
                </p>
              )}
            </div>
          )}
        </div>

        {/* Documentos */}
        <div className="card" style={{ borderTop: '4px solid var(--danger)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={18} color="var(--danger)" /> Doc. por Revisar
            </h4>
            <span className="badge badge-danger" style={{ fontSize: '1rem' }}>{myDocs.length}</span>
          </div>
          {myDocs.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No tienes documentos pendientes de revisión o aprobación.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {myDocs.slice(0, 3).map(d => (
                <div 
                  key={d.id} 
                  className="dashboard-pending-item"
                  style={{ fontSize: '0.85rem', padding: '0.5rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}
                  onClick={() => navigate('/systemDocs')}
                  title="Ir a Documentación del Sistema"
                >
                  <strong>{d.code}</strong>: {d.name}
                  <span className={`badge ${d.status === 'Pendiente de Eliminación' ? 'badge-danger' : 'badge-warning'}`} style={{ fontSize: '0.7rem', padding: '1px 4px', marginLeft: '6px', display: 'inline-flex' }}>
                    {d.status === 'Pendiente de Eliminación' ? 'Baja' : 'Aprobación'}
                  </span>
                  {isAdmin && <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: '6px' }}>({d.reviewer || d.approver || 'General'})</span>}
                </div>
              ))}
              {myDocs.length > 3 && (
                <p 
                  style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', cursor: 'pointer', display: 'inline-block', width: 'fit-content' }} 
                  onClick={() => navigate('/systemDocs')}
                >
                  + {myDocs.length - 3} más...
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom: '2rem' }}>
        {/* Partes Interesadas */}
        <div className="card" style={{ borderTop: '4px solid var(--accent-primary)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={18} color="var(--accent-primary)" /> Partes Interesadas
            </h4>
            <span className="badge" style={{ fontSize: '1rem', background: 'var(--accent-primary)', color: '#fff' }}>{myStakeholders.length}</span>
          </div>
          {myStakeholders.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No tienes estrategias asignadas.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {myStakeholders.slice(0, 3).map(s => (
                <div 
                  key={s.id} 
                  className="dashboard-pending-item"
                  style={{ fontSize: '0.85rem', padding: '0.5rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}
                  onClick={() => navigate('/stakeholders')}
                  title="Ir a Partes Interesadas"
                >
                  <strong>{s.name}</strong>: {s.strategy}
                  {isAdmin && <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: '6px' }}>({s.responsible})</span>}
                </div>
              ))}
              {myStakeholders.length > 3 && (
                <p 
                  style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', cursor: 'pointer', display: 'inline-block', width: 'fit-content' }} 
                  onClick={() => navigate('/stakeholders')}
                >
                  + {myStakeholders.length - 3} más...
                </p>
              )}
            </div>
          )}
        </div>

        {/* Objetivos Integrales */}
        <div className="card" style={{ borderTop: '4px solid var(--success)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={18} color="var(--success)" /> Objetivos Integrales
            </h4>
            <span className="badge badge-success" style={{ fontSize: '1rem' }}>{myObjectives.length}</span>
          </div>
          {myObjectives.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No tienes objetivos bajo tu responsabilidad.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {myObjectives.slice(0, 3).map(o => (
                <div 
                  key={o.id} 
                  className="dashboard-pending-item"
                  style={{ fontSize: '0.85rem', padding: '0.5rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}
                  onClick={() => navigate('/integratedObjectives')}
                  title="Ir a Objetivos Integrales"
                >
                  <strong>{o.name}</strong>: {o.system}
                  {isAdmin && <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: '6px' }}>({o.responsible})</span>}
                </div>
              ))}
              {myObjectives.length > 3 && (
                <p 
                  style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', cursor: 'pointer', display: 'inline-block', width: 'fit-content' }} 
                  onClick={() => navigate('/integratedObjectives')}
                >
                  + {myObjectives.length - 3} más...
                </p>
              )}
            </div>
          )}
        </div>

        {/* Gestión del Cambio */}
        <div className="card" style={{ borderTop: '4px solid var(--info)', padding: '1.5rem', opacity: 0.9 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <RefreshCw size={18} color="var(--info)" /> Gestión del Cambio
            </h4>
            <span className="badge badge-info" style={{ fontSize: '1rem' }}>{myChanges.length}</span>
          </div>
          {myChanges.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No estás involucrado en gestiones del cambio actuales.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {myChanges.slice(0, 3).map(c => (
                <div 
                  key={c.id} 
                  className="dashboard-pending-item"
                  style={{ fontSize: '0.85rem', padding: '0.5rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}
                  onClick={() => navigate('/changeManagement')}
                  title="Ir a Gestión del Cambio"
                >
                  <strong>{c.id}</strong>: {c.title}
                  {isAdmin && <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: '6px' }}>(Solicitante: {c.applicant})</span>}
                </div>
              ))}
              {myChanges.length > 3 && (
                <p 
                  style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', cursor: 'pointer', display: 'inline-block', width: 'fit-content' }} 
                  onClick={() => navigate('/changeManagement')}
                >
                  + {myChanges.length - 3} más...
                </p>
              )}
            </div>
          )}
        </div>

        {/* Gestión de Riesgos */}
        <div className="card" style={{ borderTop: '4px solid var(--warning)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={18} color="var(--warning)" /> Gestión de Riesgos
            </h4>
            <span className="badge badge-warning" style={{ fontSize: '1rem' }}>{myRisks.length}</span>
          </div>
          {myRisks.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No eres responsable de ningún riesgo.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {myRisks.slice(0, 3).map((r, i) => (
                <div 
                  key={`${r.id}-${i}`} 
                  className="dashboard-pending-item"
                  style={{ fontSize: '0.85rem', padding: '0.5rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}
                  onClick={() => navigate(r.type === 'ISO' ? '/risksIso' : '/risksSst')}
                  title={`Ir a Gestión de Riesgos ${r.type}`}
                >
                  <strong>{r.type} {r.id}</strong>: {r.desc}
                  {isAdmin && <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: '6px' }}>({r.resp})</span>}
                </div>
              ))}
              {myRisks.length > 3 && (
                <p 
                  style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', cursor: 'pointer', display: 'inline-block', width: 'fit-content' }} 
                  onClick={() => navigate(myRisks[0].type === 'ISO' ? '/risksIso' : '/risksSst')}
                >
                  + {myRisks.length - 3} más...
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
