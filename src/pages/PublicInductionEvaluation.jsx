import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  BookOpen, User, CreditCard, CheckCircle, XCircle, AlertTriangle, 
  HelpCircle, ShieldCheck, Printer, FileText, Check, ArrowRight, X
} from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

// Cuestionarios predeterminados (default fallback)
const DEFAULT_CUESTIONARIOS = {
  terceros: {
    title: 'Evaluación de Inducción para Terceros (Contratistas, Proveedores y Visitantes)',
    questions: [
      {
        id: 'q1',
        text: '¿Cuál es el canal de reporte principal ante cualquier incidente o acto inseguro en planta?',
        options: [
          'Ignorarlo para no retrasar las tareas operativas.',
          'Informar inmediatamente al Supervisor HSEQ o al líder de la planta.',
          'Esperar hasta el final de la semana para reportarlo en portería.'
        ],
        correct: 1
      },
      {
        id: 'q2',
        text: '¿Cuál de las siguientes conductas es de carácter obligatorio durante el tránsito por las instalaciones?',
        options: [
          'Correr en las escaleras para agilizar las tareas.',
          'Transitar únicamente por los senderos peatonales demarcados y usar calzado cerrado y adecuado.',
          'Retirarse los cascos y gafas de protección en áreas de almacenamiento.'
        ],
        correct: 1
      },
      {
        id: 'q3',
        text: 'En caso de que suene la alarma de evacuación de emergencia, ¿qué acción debe tomar?',
        options: [
          'Terminar la labor pendiente y apagar todos los equipos antes de salir.',
          'Salir ordenadamente hacia el Punto de Encuentro asignado sin correr y siguiendo los brigadistas.',
          'Buscar sus pertenencias y salir rápidamente por el parqueadero de vehículos.'
        ],
        correct: 1
      },
      {
        id: 'q4',
        text: '¿Quién es el responsable de suministrar, revisar y usar los Elementos de Protección Personal (EPP)?',
        options: [
          'El personal de vigilancia al ingresar a la portería.',
          'El contratista/proveedor suministra los EPP y cada trabajador es responsable de su correcto uso y mantenimiento.',
          'La empresa contratante debe regalar todos los EPP al visitante.'
        ],
        correct: 1
      },
      {
        id: 'q5',
        text: '¿Está permitido realizar actividades de mantenimiento sin haber diligenciado el correspondiente Permiso de Trabajo HSEQ?',
        options: [
          'Sí, si es una actividad rápida de menos de 10 minutos.',
          'No, cualquier labor de riesgo requiere análisis de seguridad (AST) y permiso firmado por HSEQ antes de iniciar.',
          'Sí, siempre y cuando el vigilante nos haya dejado entrar.'
        ],
        correct: 1
      }
    ]
  },
  administrativa: {
    title: 'Evaluación de Inducción Administrativa (Empleados Directos)',
    questions: [
      {
        id: 'q1',
        text: '¿Cuál es el pilar principal de la Política del Sistema de Gestión Integrado (SGI)?',
        options: [
          'Aumentar únicamente la velocidad de entrega de los reportes administrativos.',
          'La satisfacción del cliente, la prevención de accidentes/enfermedades laborales y la protección del medio ambiente.',
          'Minimizar el gasto en papelería de oficina únicamente.'
        ],
        correct: 1
      },
      {
        id: 'q2',
        text: '¿Qué es una No Conformidad en nuestro sistema de gestión?',
        options: [
          'Una sugerencia constructiva enviada al buzón del comité.',
          'El incumplimiento de un requisito establecido del sistema, norma técnica (ISO) o del cliente.',
          'Un reclamo de cliente que no requiere análisis de causa raíz.'
        ],
        correct: 1
      },
      {
        id: 'q3',
        text: '¿Cuál de los siguientes es un objetivo clave de la norma ISO 9001 en la organización?',
        options: [
          'Eliminar todos los puestos operativos en planta.',
          'Garantizar la mejora continua y eficacia de todos los procesos institucionales.',
          'Hacer que la empresa sea más burocrática.'
        ],
        correct: 1
      },
      {
        id: 'q4',
        text: 'Si detecta una oportunidad de mejora en sus tareas diarias, ¿cómo debe gestionarla?',
        options: [
          'No reportarla para evitar reuniones adicionales.',
          'Registrarla o informarla al líder de proceso para evaluar un Plan de Acción preventivo/correctivo.',
          'Discutirla de manera informal con un compañero sin dejar registro.'
        ],
        correct: 1
      },
      {
        id: 'q5',
        text: '¿Qué norma internacional establece las directrices para la gestión de Seguridad y Salud en el Trabajo aplicada en el SGI?',
        options: [
          'ISO 14001:2015',
          'ISO 45001:2018',
          'ISO 27001:2022'
        ],
        correct: 1
      }
    ]
  },
  electrico: {
    title: 'Evaluación Operativa - Proyecto Eléctrico',
    questions: [
      {
        id: 'q1',
        text: '¿Cuáles son las "5 Reglas de Oro" de la seguridad eléctrica para trabajos sin tensión?',
        options: [
          'Desconectar, bloquear, verificar ausencia de tensión, poner a tierra y cortocircuitar, y delimitar la zona de trabajo.',
          'Usar guantes, apagar el breaker, avisar al compañero, subir la escalera y medir.',
          'Cortar los cables, usar cinta aislante, colocarse botas de caucho, terminar rápido y energizar.'
        ],
        correct: 0
      },
      {
        id: 'q2',
        text: '¿Cuál es el EPP indispensable y obligatorio para verificar la ausencia de tensión eléctrica?',
        options: [
          'Gafas protectoras de sol y guantes de tela común.',
          'Guantes dieléctricos certificados y un multímetro/detector de tensión calibrado.',
          'Una pinza metálica común para probar chispas.'
        ],
        correct: 1
      },
      {
        id: 'q3',
        text: 'Ante una descarga eléctrica o quemadura de un compañero, ¿cuál es el primer paso en el protocolo?',
        options: [
          'Aplicar agua fría o cremas sobre la quemadura de forma inmediata.',
          'Desenergizar la fuente de energía de forma segura, llamar a emergencias y no retirar la ropa adherida.',
          'Mover al paciente rápidamente arrastrándolo de los brazos.'
        ],
        correct: 1
      },
      {
        id: 'q4',
        text: '¿Qué significa la sigla LOTO en el ámbito de seguridad industrial eléctrica?',
        options: [
          'Lockout / Tagout (Bloqueo y Etiquetado de fuentes de energía peligrosa).',
          'Límites Operativos de Tensión y Oscilación.',
          'Logística Operativa de Trabajos y Obras.'
        ],
        correct: 0
      },
      {
        id: 'q5',
        text: '¿A qué distancia mínima de seguridad se debe mantener de una línea de media tensión (ej. 13.2 kV) según el RETIE?',
        options: [
          'A una distancia mínima de 30 centímetros.',
          'A una distancia mínima de 2.3 metros (límites de aproximación técnica).',
          'No hay distancias mínimas si se trabaja bajo clima seco.'
        ],
        correct: 1
      }
    ]
  },
  telecomunicaciones: {
    title: 'Evaluación Operativa - Proyecto Telecomunicaciones',
    questions: [
      {
        id: 'q1',
        text: '¿A partir de qué altura se considera trabajo en alturas con riesgo de caída según la normatividad vigente?',
        options: [
          '1.0 metros.',
          '2.0 metros (o cualquier diferencia de nivel con riesgo de caída de personas).',
          '5.0 metros.'
        ],
        correct: 1
      },
      {
        id: 'q2',
        text: '¿Cuáles son los componentes principales de un sistema personal de protección contra caídas (SPCC)?',
        options: [
          'Escalera portátil, arnés común y botas de cuero.',
          'Arnés de cuerpo entero certificado, eslingas (de posicionamiento y con absorbedor de choque), y puntos de anclaje seguros.',
          'Cinturón de lona estándar y cuerda de nylon amarrada a la torre.'
        ],
        correct: 1
      },
      {
        id: 'q3',
        text: 'Durante el trabajo en postes o torres de telecomunicaciones, ¿qué peligro ambiental/biológico es clave vigilar?',
        options: [
          'Avisperos/abejas en las cajas de paso o postes y ráfagas de viento fuertes que puedan desestabilizar la escalera.',
          'Presencia de humedad leve en la base del poste únicamente.',
          'Ruido de tráfico vehicular común.'
        ],
        correct: 0
      },
      {
        id: 'q4',
        text: '¿Cuál es la forma correcta de ascender y descender por una escalera portátil colocada en un poste?',
        options: [
          'Subir de espaldas para vigilar los cables de tensión.',
          'Mantener siempre tres puntos de contacto (dos manos y un pie, o dos pies y una mano) y utilizar portaherramientas.',
          'Subir de forma rápida cargando los cables pesados al hombro.'
        ],
        correct: 1
      },
      {
        id: 'q5',
        text: 'Ante la sospecha de radiación no ionizante por antenas de radiofrecuencia (RF) activas, ¿cuál es la medida clave?',
        options: [
          'Usar bloqueador solar de alto espectro.',
          'Verificar la desenergización/apagado de las antenas transmisoras antes de intervenir y respetar las distancias límite.',
          'Evitar mirar fijamente al transmisor.'
        ],
        correct: 1
      }
    ]
  }
};

export default function PublicInductionEvaluation() {
  const location = useLocation();
  const navigate = useNavigate();

  const [records, setRecords] = useLocalStorage('sgi_inducciones_records', []);
  const [exams] = useLocalStorage('sgi_inducciones_cuestionarios', DEFAULT_CUESTIONARIOS);

  // Step state: ident (identification), quest (questionnaire), result (results/certificate)
  const [step, setStep] = useState('ident');
  const [documentInput, setDocumentInput] = useState('');
  const [currentRecord, setCurrentRecord] = useState(null);

  // Manual registration in case they skipped attendance
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualData, setManualData] = useState({
    name: '',
    document: '',
    type: 'Contratista',
    project: 'Proyecto Eléctrico',
    city: '',
    cargo: ''
  });

  // Questionnaire state
  const [selectedEvalType, setSelectedEvalType] = useState('terceros');
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [passed, setPassed] = useState(false);
  const [showCertDetails, setShowCertDetails] = useState(false);

  useEffect(() => {
    const originalStyle = document.body.style.overflow;
    document.body.style.overflow = 'auto';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  // Parse document from query string if available
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const docParam = params.get('doc');
    const verifyParam = params.get('verify');

    if (verifyParam && records.length > 0) {
      const found = records.find(r => r.certCode === verifyParam);
      if (found) {
        setCurrentRecord(found);
        setPassed(true);
        setScore(found.score);
        setShowCertDetails(true);
        setStep('result');
      }
    } else if (docParam) {
      setDocumentInput(docParam);
      handleSearch(docParam);
    }
  }, [location.search, records]);

  const handleSearch = (doc) => {
    const targetDoc = doc || documentInput;
    if (!targetDoc) return;

    const found = records.find(r => String(r.document) === String(targetDoc));
    if (found) {
      setCurrentRecord(found);
      if (found.passed && found.certCode) {
        // Already passed, show certificate directly
        setPassed(true);
        setScore(found.score);
        setShowCertDetails(true);
        setStep('result');
      } else {
        // Auto-select questionnaire based on user details
        if (found.type === 'Empleado') {
          if (found.project === 'Proyecto Eléctrico') {
            setSelectedEvalType('electrico');
          } else if (found.project === 'Telecomunicaciones') {
            setSelectedEvalType('telecomunicaciones');
          } else {
            setSelectedEvalType('administrativa');
          }
        } else {
          setSelectedEvalType('terceros');
        }
        setStep('ident');
        setShowManualForm(false);
      }
    } else {
      setCurrentRecord(null);
      setShowManualForm(true);
      setManualData(prev => ({ ...prev, document: targetDoc }));
    }
  };

  const handleStartEvaluation = () => {
    let participantRecord = currentRecord;

    if (showManualForm) {
      if (!manualData.name.trim() || !manualData.document.trim() || !manualData.city.trim() || !manualData.cargo.trim()) {
        alert('Por favor complete todos los datos obligatorios.');
        return;
      }

      // Create a manual record stub
      const newRecord = {
        id: Date.now(),
        name: manualData.name.trim(),
        document: manualData.document.trim(),
        type: manualData.type,
        project: manualData.type === 'Empleado' ? manualData.project : null,
        city: manualData.city.trim(),
        cargo: manualData.cargo.trim(),
        signature: '',
        date: new Date().toLocaleString(),
        reinductionDate: '',
        evalType: '',
        score: 0,
        passed: false,
        certCode: ''
      };

      setRecords([newRecord, ...records]);
      setCurrentRecord(newRecord);
      participantRecord = newRecord;
    }

    // Set questions based on selected type from dynamic local storage config
    const config = exams[selectedEvalType] || DEFAULT_CUESTIONARIOS[selectedEvalType];
    setCurrentQuestions(config.questions);
    setUserAnswers({});
    setShowCertDetails(false);
    setStep('quest');
  };

  const handleSelectAnswer = (qId, optionIdx) => {
    setUserAnswers(prev => ({ ...prev, [qId]: optionIdx }));
  };

  const handleSubmitEvaluation = (e) => {
    e.preventDefault();

    // Check if all questions are answered
    if (Object.keys(userAnswers).length < currentQuestions.length) {
      alert('Por favor responda todas las preguntas del cuestionario.');
      return;
    }

    // Calculate score
    let correctCount = 0;
    currentQuestions.forEach(q => {
      if (userAnswers[q.id] === q.correct) {
        correctCount++;
      }
    });

    const finalScore = Math.round((correctCount / currentQuestions.length) * 100);
    const finalPassed = finalScore >= 80;

    // Generate cert code if passed
    const code = finalPassed ? `IND-2026-${String(records.length + 101).padStart(3, '0')}` : '';
    const executionDate = new Date();
    const formattedDate = executionDate.toLocaleDateString();
    
    // Set reinduction date to 1 year later
    const reinductionDate = finalPassed 
      ? new Date(executionDate.getFullYear() + 1, executionDate.getMonth(), executionDate.getDate()).toLocaleDateString()
      : '';

    const evalName = (exams[selectedEvalType] || DEFAULT_CUESTIONARIOS[selectedEvalType]).title;

    // Update in records local storage
    const updatedRecords = records.map(r => {
      if (String(r.document) === String(currentRecord.document)) {
        return {
          ...r,
          score: finalScore,
          passed: finalPassed,
          certCode: code,
          evalType: evalName,
          date: r.date || new Date().toLocaleString(),
          reinductionDate: reinductionDate
        };
      }
      return r;
    });

    // In case record wasn't in list yet
    const foundIdx = updatedRecords.findIndex(r => String(r.document) === String(currentRecord.document));
    if (foundIdx === -1) {
      const newRec = {
        ...currentRecord,
        score: finalScore,
        passed: finalPassed,
        certCode: code,
        evalType: evalName,
        date: new Date().toLocaleString(),
        reinductionDate: reinductionDate
      };
      setRecords([newRec, ...records]);
      setCurrentRecord(newRec);
    } else {
      setRecords(updatedRecords);
      setCurrentRecord(updatedRecords.find(r => String(r.document) === String(currentRecord.document)));
    }

    setScore(finalScore);
    setPassed(finalPassed);
    setShowCertDetails(false); // Do not show certificate details until click
    setStep('result');
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      overflowY: 'auto', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'flex-start', 
      padding: '2.5rem 1rem', 
      background: 'var(--bg-primary)'
    }}>
      <div className="card fade-in" style={{ maxWidth: '580px', width: '100%', padding: '1.5rem', boxShadow: 'var(--shadow-xl)', marginBottom: '2rem' }}>
        
        {/* STEP 1: IDENTIFICATION */}
        {step === 'ident' && (
          <div className="fade-in">
            <div style={{ textAlign: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '0.25rem' }}>
                <ShieldCheck size={22} style={{ color: 'var(--accent-primary)' }} />
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Evaluación de Inducción</h3>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ingrese su cédula para iniciar el cuestionario de seguridad</span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <input 
                type="number"
                className="form-control"
                style={{ flex: 1 }}
                placeholder="Número de Cédula..."
                value={documentInput}
                onChange={e => setDocumentInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
              />
              <button type="button" className="btn-primary" onClick={() => handleSearch()}>
                Validar Cédula
              </button>
            </div>

            {/* If record found, show selection */}
            {currentRecord && !showManualForm && (
              <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem', marginBottom: '1.25rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.88rem', fontWeight: 700 }}>Participante Encontrado:</h4>
                <div style={{ fontSize: '0.8rem', lineHeight: '1.5', color: 'var(--text-primary)' }}>
                  <div><strong>Nombre:</strong> {currentRecord.name}</div>
                  <div><strong>Rol:</strong> {currentRecord.type} {currentRecord.project ? `(${currentRecord.project})` : ''}</div>
                  <div><strong>Cargo:</strong> {currentRecord.cargo} | <strong>Ciudad:</strong> {currentRecord.city}</div>
                </div>

                <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem' }}>
                  <label className="form-label">Tipo de Evaluación a Presentar</label>
                  <select 
                    className="form-control"
                    value={selectedEvalType}
                    onChange={e => setSelectedEvalType(e.target.value)}
                  >
                    <option value="terceros">Cuestionario de Terceros (Visitante, Contratista, Proveedor)</option>
                    <option value="administrativa">Cuestionario Administrativo (Empleados de Oficina)</option>
                    <option value="electrico">Cuestionario Operativo - Proyecto Eléctrico</option>
                    <option value="telecomunicaciones">Cuestionario Operativo - Telecomunicaciones</option>
                  </select>
                </div>

                <button 
                  type="button" 
                  className="btn-primary" 
                  style={{ width: '100%', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  onClick={handleStartEvaluation}
                >
                  Comenzar Evaluación <ArrowRight size={14} />
                </button>
              </div>
            )}

            {/* If not found, show manual form */}
            {showManualForm && (
              <div className="fade-in" style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '8px', padding: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', color: 'var(--warning)', marginBottom: '0.5rem' }}>
                  <AlertTriangle size={16} />
                  <strong style={{ fontSize: '0.82rem' }}>Cédula no registrada en asistencia</strong>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0 0 1rem 0', lineHeight: '1.4' }}>
                  No encontramos un registro de asistencia para este documento. Por favor diligencie sus datos básicos a continuación para registrar la asistencia y habilitar la evaluación en un solo paso:
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Nombre Completo</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      style={{ fontSize: '0.8rem', padding: '0.3rem 0.5rem' }}
                      value={manualData.name}
                      onChange={e => setManualData({ ...manualData, name: e.target.value })}
                      placeholder="Ej. Pedro Picapiedra"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Rol / Tipo Persona</label>
                      <select 
                        className="form-control"
                        style={{ fontSize: '0.8rem', padding: '0.3rem 0.5rem' }}
                        value={manualData.type}
                        onChange={e => setManualData({ ...manualData, type: e.target.value })}
                      >
                        <option value="Contratista">Contratista</option>
                        <option value="Proveedor">Proveedor</option>
                        <option value="Visitante">Visitante</option>
                        <option value="Empleado">Empleado Directo</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Ciudad</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        style={{ fontSize: '0.8rem', padding: '0.3rem 0.5rem' }}
                        value={manualData.city}
                        onChange={e => setManualData({ ...manualData, city: e.target.value })}
                        placeholder="Ej. Bogotá"
                      />
                    </div>
                  </div>

                  {manualData.type === 'Empleado' && (
                    <div className="form-group" style={{ background: 'var(--bg-secondary)', padding: '0.5rem', borderRadius: '4px' }}>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Proyecto del Empleado</label>
                      <select 
                        className="form-control"
                        style={{ fontSize: '0.8rem', padding: '0.3rem 0.5rem' }}
                        value={manualData.project}
                        onChange={e => setManualData({ ...manualData, project: e.target.value })}
                      >
                        <option value="Proyecto Eléctrico">Proyecto Eléctrico</option>
                        <option value="Telecomunicaciones">Telecomunicaciones</option>
                        <option value="Ninguno / Admin">Ninguno / Administrativo</option>
                      </select>
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Cargo</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      style={{ fontSize: '0.8rem', padding: '0.3rem 0.5rem' }}
                      value={manualData.cargo}
                      onChange={e => setManualData({ ...manualData, cargo: e.target.value })}
                      placeholder="Ej. Coordinador"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Seleccione Tipo de Cuestionario</label>
                    <select 
                      className="form-control"
                      style={{ fontSize: '0.8rem', padding: '0.3rem 0.5rem' }}
                      value={selectedEvalType}
                      onChange={e => setSelectedEvalType(e.target.value)}
                    >
                      <option value="terceros">Cuestionario de Terceros (Visitante, Contratista, Proveedor)</option>
                      <option value="administrativa">Cuestionario Administrativo (Empleados)</option>
                      <option value="electrico">Cuestionario Operativo - Proyecto Eléctrico</option>
                      <option value="telecomunicaciones">Cuestionario Operativo - Telecomunicaciones</option>
                    </select>
                  </div>
                </div>

                <button 
                  type="button" 
                  className="btn-primary" 
                  style={{ width: '100%', marginTop: '1rem' }}
                  onClick={handleStartEvaluation}
                >
                  Registrar e Iniciar Evaluación
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: QUESTIONNAIRE */}
        {step === 'quest' && (
          <div className="fade-in">
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {(exams[selectedEvalType] || DEFAULT_CUESTIONARIOS[selectedEvalType]).title}
              </h3>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Responda las 5 preguntas. Necesita al menos 80% (4 correctas) para aprobar y obtener su certificado.
              </p>
            </div>

            <form onSubmit={handleSubmitEvaluation} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {currentQuestions.map((q, idx) => (
                <div key={q.id} style={{ background: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', gap: '6px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.6rem' }}>
                    <span style={{ color: 'var(--accent-primary)' }}>{idx + 1}.</span>
                    <span>{q.text}</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                    {q.options.map((opt, optIdx) => (
                      <label 
                        key={optIdx} 
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '8px',
                          padding: '0.5rem 0.65rem',
                          background: userAnswers[q.id] === optIdx ? 'rgba(14, 165, 233, 0.05)' : 'var(--bg-primary)',
                          border: '1px solid ' + (userAnswers[q.id] === optIdx ? 'var(--accent-primary)' : 'var(--border-color)'),
                          borderRadius: '6px',
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                          lineHeight: '1.3'
                        }}
                      >
                        <input 
                          type="radio" 
                          name={q.id} 
                          style={{ marginTop: '2px' }}
                          checked={userAnswers[q.id] === optIdx}
                          onChange={() => handleSelectAnswer(q.id, optIdx)}
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setStep('ident')}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 2 }}>
                  Finalizar y Calificar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3: RESULTS & THANKS LANDING SCREEN */}
        {step === 'result' && currentRecord && (
          <div className="fade-in" style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              ¡Gracias por completar la inducción!
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.4' }}>
              Tus respuestas y registro de capacitación de ingreso han sido procesados y guardados en el Sistema de Gestión Integrado (HSEQ).
            </p>
            
            {passed ? (
              <div style={{ background: 'rgba(16, 185, 129, 0.03)', border: '1px solid rgba(16, 185, 129, 0.15)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.1)',
                  color: 'var(--success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.75rem auto'
                }}>
                  <CheckCircle size={32} />
                </div>
                <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--success)', fontWeight: 800, letterSpacing: '0.5px' }}>
                  ESTADO: INDUCCIÓN APROBADA
                </h4>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0.25rem 0', color: 'var(--text-primary)' }}>
                  {score}%
                </div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Puntaje obtenido. Su capacitación está activa y legalmente vigente por un período de 1 año.
                </p>
              </div>
            ) : (
              <div style={{ background: 'rgba(239, 68, 68, 0.03)', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: 'var(--danger)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.75rem auto'
                }}>
                  <XCircle size={32} />
                </div>
                <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--danger)', fontWeight: 800, letterSpacing: '0.5px' }}>
                  ESTADO: INDUCCIÓN PERDIDA
                </h4>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0.25rem 0', color: 'var(--text-primary)' }}>
                  {score}%
                </div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Puntaje insuficiente (Mínimo requerido: 80% o 4/5 correctas). Debe reintentar la evaluación para poder habilitar su ingreso.
                </p>
              </div>
            )}

            {passed ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                {!showCertDetails ? (
                  <button 
                    type="button" 
                    className="btn-primary" 
                    style={{ width: '100%', padding: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    onClick={() => setShowCertDetails(true)}
                  >
                    <ShieldCheck size={16} /> Ver y Descargar Certificado de Inducción
                  </button>
                ) : (
                  <div className="fade-in" style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    
                    {/* The diploma card layout */}
                    <div style={{
                      border: '6px double var(--accent-primary)',
                      borderRadius: '8px',
                      padding: '1.25rem',
                      background: '#ffffff',
                      color: '#0f172a',
                      boxShadow: 'var(--shadow-lg)',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      position: 'relative'
                    }}>
                      <button 
                        type="button"
                        style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
                        onClick={() => setShowCertDetails(false)}
                      >
                        <X size={16} />
                      </button>

                      {/* Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid var(--accent-primary)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                        <div>
                          <h3 style={{ margin: 0, color: '#0ea5e9', fontSize: '1.1rem', fontWeight: 800, textTransform: 'uppercase' }}>
                            SGI Enterprise
                          </h3>
                          <span style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>
                            SISTEMA DE GESTIÓN INTEGRADO HSEQ
                          </span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span className="badge" style={{ background: '#10b981', color: '#ffffff', fontWeight: 800, padding: '0.15rem 0.4rem', fontSize: '0.65rem', display: 'inline-block' }}>
                            APROBADO
                          </span>
                        </div>
                      </div>

                      {/* Title */}
                      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                        <h4 style={{ margin: 0, fontSize: '0.78rem', color: '#475569', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>
                          Certificado de Aprobación de Inducción
                        </h4>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0.2rem 0' }}>
                          {currentRecord.certCode}
                        </div>
                      </div>

                      <div style={{ fontSize: '0.78rem', lineHeight: '1.5', textAlign: 'center', color: '#334155', marginBottom: '1rem' }}>
                        Hace constar que el colaborador / contratista:<br/>
                        <strong style={{ fontSize: '0.95rem', color: '#0f172a', display: 'block', margin: '0.2rem 0' }}>{currentRecord.name}</strong>
                        Con Documento de Identidad: <strong>C.C. {currentRecord.document}</strong><br/>
                        En rol de <strong>{currentRecord.type}</strong> {currentRecord.project ? `(${currentRecord.project})` : ''} ocupando el cargo de <strong>{currentRecord.cargo}</strong> en la ciudad de <strong>{currentRecord.city}</strong>, ha completado satisfactoriamente la inducción de seguridad y aprobado la evaluación correspondiente:
                        <strong style={{ display: 'block', marginTop: '0.3rem', color: '#0ea5e9', fontSize: '0.8rem' }}>{currentRecord.evalType}</strong>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: '#f8fafc', padding: '0.55rem', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '1rem', fontSize: '0.7rem' }}>
                        <div>
                          <span style={{ color: '#64748b', display: 'block', fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase' }}>Fecha de Emisión:</span>
                          <strong>{currentRecord.date}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#64748b', display: 'block', fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase' }}>Vence el:</span>
                          <strong style={{ color: '#b91c1c' }}>{currentRecord.reinductionDate}</strong>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '1.25rem', borderTop: '1px dashed #cbd5e1', paddingTop: '0.65rem' }}>
                        <div>
                          <div style={{ borderBottom: '1px solid #94a3b8', width: '100px', height: '30px' }}></div>
                          <span style={{ fontSize: '0.6rem', color: '#64748b', display: 'block', marginTop: '0.2rem' }}>Auditor / Coordinador HSEQ</span>
                        </div>

                        <div>
                          <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=55x55&data=${encodeURIComponent(`${window.location.origin}/induccion-evaluacion?verify=${currentRecord.certCode}`)}`} 
                            alt="QR Cert" 
                            style={{ width: '55px', height: '55px', display: 'block', border: '1px solid #cbd5e1', padding: '2px' }}
                          />
                          <span style={{ fontSize: '0.5rem', color: '#64748b', display: 'block', textAlign: 'center', marginTop: '0.1rem' }}>Verificar QR</span>
                        </div>
                      </div>

                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                      <button 
                        type="button" 
                        className="btn-secondary" 
                        style={{ flex: 1 }}
                        onClick={() => {
                          window.print();
                        }}
                      >
                        <Printer size={14} style={{ marginRight: '4px' }} /> Imprimir / PDF
                      </button>
                      <button 
                        type="button" 
                        className="btn-primary" 
                        style={{ flex: 1 }}
                        onClick={() => {
                          setStep('ident');
                          setDocumentInput('');
                          setCurrentRecord(null);
                          setShowCertDetails(false);
                        }}
                      >
                        Otro Registro
                      </button>
                    </div>

                  </div>
                )}
              </div>
            ) : (
              /* FAILED ACTION BUTTONS */
              <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  style={{ flex: 1 }} 
                  onClick={() => {
                    setStep('ident');
                    setDocumentInput('');
                    setCurrentRecord(null);
                  }}
                >
                  Regresar
                </button>
                <button 
                  type="button" 
                  className="btn-primary" 
                  style={{ flex: 2 }}
                  onClick={() => {
                    const config = exams[selectedEvalType] || DEFAULT_CUESTIONARIOS[selectedEvalType];
                    setCurrentQuestions(config.questions);
                    setUserAnswers({});
                    setStep('quest');
                  }}
                >
                  Reintentar Evaluación
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
