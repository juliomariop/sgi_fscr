import React, { useState } from 'react';
import { 
  BookOpen, Plus, Calendar, Edit2, Trash2, Download, Filter, 
  QrCode, ClipboardList, CheckCircle, Clock, AlertTriangle, 
  Video, FileText, Check, ShieldCheck, Printer, PlayCircle, Eye, Save
} from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import Modal from '../components/Modal';
import { downloadCSV } from '../utils/exportUtils';

// Default Fallback Questionnaires
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

export default function Inductions() {
  const [activeTab, setActiveTab] = useState('results'); // results, exams
  const [selectedConfigExam, setSelectedConfigExam] = useState('terceros'); // terceros, administrativa, electrico, telecomunicaciones

  const [records, setRecords] = useLocalStorage('sgi_inducciones_records', [
    {
      id: 1001,
      name: 'Carlos Mendoza',
      document: '80123456',
      type: 'Empleado',
      project: 'Proyecto Eléctrico',
      city: 'Bogotá',
      cargo: 'Liniero de Redes',
      signature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="40"><text x="10" y="25" style="font: italic bold 16px Hand; fill: %230284c7;">C. Mendoza</text></svg>',
      date: '2026-06-12 09:15',
      reinductionDate: '2027-06-12',
      evalType: 'Operativa - Proyecto Eléctrico',
      score: 100,
      passed: true,
      certCode: 'IND-2026-001'
    },
    {
      id: 1002,
      name: 'Laura Sofia Pinzón',
      document: '1014998776',
      type: 'Empleado',
      project: 'Telecomunicaciones',
      city: 'Bucaramanga',
      cargo: 'Técnico de Fibra Óptica',
      signature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="40"><text x="10" y="25" style="font: italic bold 16px Hand; fill: %230284c7;">L. Pinzon</text></svg>',
      date: '2026-06-25 14:20',
      reinductionDate: '2027-06-25',
      evalType: 'Operativa - Telecomunicaciones',
      score: 80,
      passed: true,
      certCode: 'IND-2026-002'
    },
    {
      id: 1003,
      name: 'Marlon Ferney Castro',
      document: '91887223',
      type: 'Contratista',
      project: null,
      city: 'Cali',
      cargo: 'Supervisor HSE Contratista',
      signature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="40"><text x="10" y="25" style="font: italic bold 16px Hand; fill: %230284c7;">M. Castro</text></svg>',
      date: '2026-07-02 11:05',
      reinductionDate: '2027-07-02',
      evalType: 'Terceros (Contratista/Proveedor/Visitante)',
      score: 100,
      passed: true,
      certCode: 'IND-2026-003'
    },
    {
      id: 1004,
      name: 'Andrea Restrepo',
      document: '52988344',
      type: 'Empleado',
      project: 'Ninguno / Admin',
      city: 'Medellín',
      cargo: 'Auxiliar Contable',
      signature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="40"><text x="10" y="25" style="font: italic bold 16px Hand; fill: %230284c7;">A. Restrepo</text></svg>',
      date: '2026-07-05 08:00',
      reinductionDate: '2027-07-05',
      evalType: 'Administrativa',
      score: 60,
      passed: false,
      certCode: ''
    }
  ]);

  const [materials, setMaterials] = useLocalStorage('sgi_inducciones_materiales', [
    { 
      id: 1, 
      type: 'video', 
      title: 'Video de Inducción de Seguridad General SGI', 
      url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', 
      description: 'Video institucional con las normas básicas de comportamiento, evacuación y HSEQ en las instalaciones.' 
    },
    { 
      id: 2, 
      type: 'presentacion', 
      title: 'Manual HSEQ de Bienvenida para Terceros y Colaboradores', 
      url: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=800', 
      description: 'Diapositivas y material teórico sobre políticas integradas de calidad, medio ambiente y seguridad laboral.' 
    }
  ]);

  const [exams, setExams] = useLocalStorage('sgi_inducciones_cuestionarios', DEFAULT_CUESTIONARIOS);

  // Administration filters
  const [filterType, setFilterType] = useState('Todos');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');

  // Material Modal
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [materialForm, setMaterialForm] = useState({ title: '', type: 'video', url: '', description: '' });

  // Certificate Display Modal
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // QR Modal
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrUrl, setQrUrl] = useState('');
  const [qrTitle, setQrTitle] = useState('');

  // Stats Calculations
  const totalTrained = records.length;
  const passedCount = records.filter(r => r.passed).length;
  const failedCount = totalTrained - passedCount;
  const approvalRate = totalTrained > 0 ? Math.round((passedCount / totalTrained) * 100) : 0;
  
  const employeesCount = records.filter(r => r.type === 'Empleado').length;
  const contractorsCount = records.filter(r => r.type === 'Contratista').length;
  const providersCount = records.filter(r => r.type === 'Proveedor').length;
  const visitorsCount = records.filter(r => r.type === 'Visitante').length;

  const filteredRecords = records.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) || r.document.includes(searchTerm);
    const matchesType = filterType === 'Todos' || r.type === filterType;
    const matchesStatus = filterStatus === 'Todos' || 
      (filterStatus === 'Aprobado' && r.passed) || 
      (filterStatus === 'Reprobado' && !r.passed);
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleDeleteRecord = (id) => {
    if (window.confirm('¿Está seguro de eliminar este registro de inducción?')) {
      setRecords(records.filter(r => r.id !== id));
    }
  };

  const handleExport = () => {
    downloadCSV(
      records.map(r => ({
        Nombre: r.name,
        Documento: r.document,
        Rol: r.type,
        Proyecto: r.project || 'N/A',
        Ciudad: r.city,
        Cargo: r.cargo,
        Fecha: r.date,
        Evaluacion: r.evalType,
        Puntaje: `${r.score}%`,
        Aprobado: r.passed ? 'SI' : 'NO',
        Codigo_Certificado: r.certCode || 'N/A'
      })),
      'Control_Inducciones_HSEQ'
    );
  };

  const handleOpenMaterialModal = (material = null) => {
    if (material) {
      setEditingMaterial(material);
      setMaterialForm({ ...material });
    } else {
      setEditingMaterial(null);
      setMaterialForm({ title: '', type: 'video', url: '', description: '' });
    }
    setIsMaterialModalOpen(true);
  };

  const handleMaterialSubmit = (e) => {
    e.preventDefault();
    if (editingMaterial) {
      setMaterials(materials.map(m => m.id === editingMaterial.id ? { ...materialForm, id: m.id } : m));
    } else {
      setMaterials([...materials, { ...materialForm, id: Date.now() }]);
    }
    setIsMaterialModalOpen(false);
  };

  const handleDeleteMaterial = (id) => {
    if (window.confirm('¿Desea eliminar este material didáctico?')) {
      setMaterials(materials.filter(m => m.id !== id));
    }
  };

  const handleShowQr = (title, path) => {
    const fullUrl = `${window.location.origin}${path}`;
    setQrTitle(title);
    setQrUrl(fullUrl);
    setIsQrModalOpen(true);
  };

  // Exam Configuration Handlers
  const handleUpdateConfigTitle = (val) => {
    setExams({
      ...exams,
      [selectedConfigExam]: {
        ...exams[selectedConfigExam],
        title: val
      }
    });
  };

  const handleUpdateConfigQuestionText = (qIdx, val) => {
    const updatedQs = exams[selectedConfigExam].questions.map((q, idx) => {
      if (idx === qIdx) return { ...q, text: val };
      return q;
    });
    setExams({
      ...exams,
      [selectedConfigExam]: {
        ...exams[selectedConfigExam],
        questions: updatedQs
      }
    });
  };

  const handleUpdateConfigOptionText = (qIdx, optIdx, val) => {
    const updatedQs = exams[selectedConfigExam].questions.map((q, idx) => {
      if (idx === qIdx) {
        const updatedOpts = q.options.map((opt, oIdx) => {
          if (oIdx === optIdx) return val;
          return opt;
        });
        return { ...q, options: updatedOpts };
      }
      return q;
    });
    setExams({
      ...exams,
      [selectedConfigExam]: {
        ...exams[selectedConfigExam],
        questions: updatedQs
      }
    });
  };

  const handleUpdateConfigCorrect = (qIdx, correctIdx) => {
    const updatedQs = exams[selectedConfigExam].questions.map((q, idx) => {
      if (idx === qIdx) return { ...q, correct: correctIdx };
      return q;
    });
    setExams({
      ...exams,
      [selectedConfigExam]: {
        ...exams[selectedConfigExam],
        questions: updatedQs
      }
    });
  };

  const handleResetExamConfig = () => {
    if (window.confirm('¿Está seguro de restaurar este examen a las preguntas predeterminadas de fábrica?')) {
      setExams({
        ...exams,
        [selectedConfigExam]: DEFAULT_CUESTIONARIOS[selectedConfigExam]
      });
      window.alert('Examen restaurado con éxito.');
    }
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>Control de Inducción y Reinducción HSEQ</h2>
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Monitoreo legal de capacitaciones de ingreso para colaboradores, contratistas y visitantes.
          </p>
        </div>
      </div>

      {/* Main Tab bar */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
        <button 
          className={`btn-secondary ${activeTab === 'results' ? 'active' : ''}`}
          style={{ border: 'none', background: activeTab === 'results' ? 'rgba(14, 165, 233, 0.1)' : 'transparent', color: activeTab === 'results' ? 'var(--accent-primary)' : 'var(--text-secondary)', fontWeight: 600, padding: '0.35rem 0.75rem', fontSize: '0.82rem' }}
          onClick={() => setActiveTab('results')}
        >
          Control de Inducciones y Asistencia
        </button>
        <button 
          className={`btn-secondary ${activeTab === 'exams' ? 'active' : ''}`}
          style={{ border: 'none', background: activeTab === 'exams' ? 'rgba(79, 70, 229, 0.1)' : 'transparent', color: activeTab === 'exams' ? 'var(--accent-primary)' : 'var(--text-secondary)', fontWeight: 600, padding: '0.35rem 0.75rem', fontSize: '0.82rem' }}
          onClick={() => setActiveTab('exams')}
        >
          Parametrizar Exámenes HSEQ (Admin)
        </button>
      </div>

      {/* TAB 1: RESULTS VIEW */}
      {activeTab === 'results' && (
        <div className="fade-in">
          {/* STATS PANELS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(14, 165, 233, 0.1)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                {totalTrained}
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Personas Inducidas</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>Total General</div>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                {approvalRate}%
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Tasa de Aprobación</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>{passedCount} Aprobados</div>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                {employeesCount}
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Empleados Directos</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>Inducción Interna</div>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                {contractorsCount + providersCount + visitorsCount}
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Personal Externo</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>Terceros Habilitados</div>
              </div>
            </div>
          </div>

          <div className="grid-2" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
            {/* ACCESS POINTS & QR CODES */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <QrCode size={18} /> Códigos QR de Acceso Público
              </h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                Imprima o comparta estos accesos para que los colaboradores y contratistas registren su asistencia y realicen su evaluación desde sus propios teléfonos móviles.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {/* QR Attendance */}
                <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem', textAlign: 'center', background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', justifyBetween: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>1. REGISTRO ASISTENCIA</span>
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(`${window.location.origin}/induccion-asistencia`)}`}
                    alt="QR Asistencia" 
                    style={{ width: '110px', height: '110px', display: 'block', border: '1px solid var(--border-color)', padding: '4px', background: '#ffffff', cursor: 'pointer' }}
                    onClick={() => handleShowQr('Registro de Asistencia de Inducción', '/induccion-asistencia')}
                  />
                  <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
                    <a href="/induccion-asistencia" target="_blank" className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', textDecoration: 'none', display: 'block' }}>
                      <Eye size={12} style={{ marginRight: '3px' }} /> Abrir Formulario
                    </a>
                    <button type="button" className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }} onClick={() => handleShowQr('Registro de Asistencia', '/induccion-asistencia')}>
                      <Printer size={12} style={{ marginRight: '3px' }} /> Imprimir QR
                    </button>
                  </div>
                </div>

                {/* QR Evaluation */}
                <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem', textAlign: 'center', background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', justifyBetween: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>2. EVALUACIÓN Y CERTIFICADO</span>
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(`${window.location.origin}/induccion-evaluacion`)}`}
                    alt="QR Evaluación" 
                    style={{ width: '110px', height: '110px', display: 'block', border: '1px solid var(--border-color)', padding: '4px', background: '#ffffff', cursor: 'pointer' }}
                    onClick={() => handleShowQr('Evaluación y Certificación de Inducción', '/induccion-evaluacion')}
                  />
                  <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
                    <a href="/induccion-evaluacion" target="_blank" className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', textDecoration: 'none', display: 'block' }}>
                      <Eye size={12} style={{ marginRight: '3px' }} /> Abrir Evaluación
                    </a>
                    <button type="button" className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }} onClick={() => handleShowQr('Evaluación y Certificado', '/induccion-evaluacion')}>
                      <Printer size={12} style={{ marginRight: '3px' }} /> Imprimir QR
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* DIDACTIC MATERIALS MANAGER */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <BookOpen size={18} /> Material Didáctico y de Estudio
                </h3>
                <button className="btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => handleOpenMaterialModal(null)}>
                  <Plus size={12} /> Agregar Recurso
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', overflowY: 'auto', maxHeight: '270px', paddingRight: '4px' }}>
                {materials.map(m => (
                  <div key={m.id} style={{ padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-primary)', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <div style={{
                      padding: '0.4rem',
                      borderRadius: '6px',
                      background: m.type === 'video' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(14, 165, 233, 0.1)',
                      color: m.type === 'video' ? 'var(--danger)' : 'var(--accent-primary)',
                      flexShrink: 0
                    }}>
                      {m.type === 'video' ? <Video size={20} /> : <FileText size={20} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ margin: 0, fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{m.title}</h4>
                      <p style={{ margin: '0.15rem 0 0.35rem 0', fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: '1.3' }}>{m.description}</p>
                      <a href={m.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.72rem', color: 'var(--accent-primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                        <PlayCircle size={10} /> Ver Recurso Educativo
                      </a>
                    </div>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      <button className="btn-icon" style={{ padding: '0.2rem' }} onClick={() => handleOpenMaterialModal(m)}><Edit2 size={12} /></button>
                      <button className="btn-icon" style={{ padding: '0.2rem', color: 'var(--danger)' }} onClick={() => handleDeleteMaterial(m.id)}><Trash2 size={12} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* INDUCTION RECORDS TABLE */}
          <div className="card" style={{ padding: 0 }}>
            <div style={{ display: 'flex', padding: '1rem', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '0.92rem', fontWeight: 800, margin: 0 }}>Historial y Estado de Inducciones</h3>
              
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', flex: 1, justifyEnd: 'flex-end', maxWidth: '600px' }}>
                <input 
                  type="text" 
                  className="form-control" 
                  style={{ flex: 1, minWidth: '150px', fontSize: '0.8rem', padding: '0.35rem 0.6rem' }} 
                  placeholder="Buscar por nombre o cédula..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                <select 
                  className="form-control" 
                  style={{ width: '120px', fontSize: '0.8rem', padding: '0.35rem 0.6rem' }}
                  value={filterType}
                  onChange={e => setFilterType(e.target.value)}
                >
                  <option value="Todos">Todos los roles</option>
                  <option value="Empleado">Empleado</option>
                  <option value="Contratista">Contratista</option>
                  <option value="Proveedor">Proveedor</option>
                  <option value="Visitante">Visitante</option>
                </select>
                <select 
                  className="form-control" 
                  style={{ width: '110px', fontSize: '0.8rem', padding: '0.35rem 0.6rem' }}
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                >
                  <option value="Todos">Todos</option>
                  <option value="Aprobado">Aprobado</option>
                  <option value="Reprobado">Reprobado</option>
                </select>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Fecha Reg.</th>
                    <th>Cédula</th>
                    <th>Nombre / Persona</th>
                    <th>Proyecto / Ciudad / Cargo</th>
                    <th>Tipo de Evaluación</th>
                    <th>Puntaje</th>
                    <th>Certificado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                        No se encontraron registros de inducción correspondientes a los filtros seleccionados.
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map(rec => {
                      const reinductionDue = rec.passed && new Date(rec.reinductionDate) < new Date();
                      return (
                        <tr key={rec.id}>
                          <td style={{ fontSize: '0.8rem' }}>{rec.date}</td>
                          <td style={{ fontWeight: 600 }}>{rec.document}</td>
                          <td>
                            <div style={{ fontWeight: 700 }}>{rec.name}</div>
                            <span className={`badge ${
                              rec.type === 'Empleado' ? 'badge-info' : 
                              rec.type === 'Contratista' ? 'badge-danger' : 
                              rec.type === 'Proveedor' ? 'badge-warning' : 'badge-success'
                            }`} style={{ fontSize: '0.62rem', padding: '0.05rem 0.25rem', marginTop: '0.15rem', display: 'inline-block' }}>
                              {rec.type}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.8rem', lineHeight: '1.3' }}>
                            <div><strong>Proyecto:</strong> {rec.project || 'N/A'}</div>
                            <div><strong>Ciudad:</strong> {rec.city} | <strong>Cargo:</strong> {rec.cargo}</div>
                          </td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{rec.evalType}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: rec.passed ? 'var(--success)' : 'var(--danger)' }}>
                                {rec.score}%
                              </span>
                              <span className={`badge ${rec.passed ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.58rem', padding: '0.05rem 0.2rem' }}>
                                {rec.passed ? 'Aprobó' : 'Reprobó'}
                              </span>
                            </div>
                            {rec.passed && (
                              <div style={{ fontSize: '0.68rem', color: reinductionDue ? 'var(--danger)' : 'var(--text-muted)', marginTop: '0.15rem' }}>
                                Vence: {rec.reinductionDate} {reinductionDue && '(Vencida)'}
                              </div>
                            )}
                          </td>
                          <td>
                            {rec.passed ? (
                              <button 
                                type="button"
                                className="btn-secondary" 
                                style={{ padding: '0.2rem 0.45rem', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                                onClick={() => {
                                  setSelectedRecord(rec);
                                  setIsCertModalOpen(true);
                                }}
                              >
                                <ShieldCheck size={12} style={{ color: 'var(--success)' }} /> Ver Certificado
                              </button>
                            ) : (
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No aplica</span>
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.25rem' }}>
                              {rec.signature && (
                                <button 
                                  className="btn-icon" 
                                  style={{ padding: '0.25rem' }} 
                                  onClick={() => {
                                    window.alert(`[HSEQ] Visualizando firma manuscrita cargada del participante.`);
                                  }}
                                  title="Ver Firma"
                                >
                                  <Eye size={13} />
                                </button>
                              )}
                              <button className="btn-icon" style={{ padding: '0.25rem', color: 'var(--danger)' }} onClick={() => handleDeleteRecord(rec.id)}><Trash2 size={13} /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EXAM PARAMETERIZATION VIEW */}
      {activeTab === 'exams' && (
        <div className="card fade-in" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '5px' }}>
                <ClipboardList size={18} style={{ color: 'var(--accent-primary)' }} /> Parametrización de Exámenes y Cuestionarios HSEQ
              </h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Modifique las preguntas, respuestas y la opción correcta de los 4 tipos de exámenes de inducción.
              </p>
            </div>
            <button type="button" className="btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={handleResetExamConfig}>
              Restaurar Predeterminados
            </button>
          </div>

          {/* Selector of Exam */}
          <div className="form-group" style={{ maxWidth: '400px', marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ fontWeight: 700 }}>1. Seleccione el examen a editar:</label>
            <select 
              className="form-control"
              value={selectedConfigExam}
              onChange={e => setSelectedConfigExam(e.target.value)}
            >
              <option value="terceros">Terceros (Contratistas, Proveedores y Visitantes)</option>
              <option value="administrativa">Empleados - Evaluación Administrativa</option>
              <option value="electrico">Empleados - Evaluación Operativa Eléctrica</option>
              <option value="telecomunicaciones">Empleados - Evaluación Operativa Telecomunicaciones</option>
            </select>
          </div>

          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700 }}>Título de la Evaluación</label>
              <input 
                type="text" 
                className="form-control" 
                value={exams[selectedConfigExam]?.title || ''} 
                onChange={e => handleUpdateConfigTitle(e.target.value)} 
                required 
              />
            </div>
          </div>

          {/* List of 5 Questions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {(exams[selectedConfigExam]?.questions || []).map((q, idx) => (
              <div key={q.id} style={{ border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1rem', background: 'var(--bg-primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--accent-primary)', textTransform: 'uppercase' }}>Pregunta {idx + 1}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>ID: {q.id}</span>
                </div>

                <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                  <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700 }}>Enunciado de la Pregunta</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem' }}
                    value={q.text} 
                    onChange={e => handleUpdateConfigQuestionText(idx, e.target.value)} 
                    required 
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700, margin: 0 }}>Opciones de Respuesta y Selección de la Correcta:</label>
                  {q.options.map((opt, optIdx) => (
                    <div key={optIdx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input 
                        type="radio" 
                        name={`correct-${q.id}`} 
                        checked={q.correct === optIdx}
                        onChange={() => handleUpdateConfigCorrect(idx, optIdx)}
                        title="Marcar como respuesta correcta"
                      />
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        {String.fromCharCode(97 + optIdx)})
                      </span>
                      <input 
                        type="text" 
                        className="form-control" 
                        style={{ fontSize: '0.78rem', padding: '0.3rem 0.5rem', flex: 1 }}
                        value={opt} 
                        onChange={e => handleUpdateConfigOptionText(idx, optIdx, e.target.value)} 
                        required 
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <button 
              type="button" 
              className="btn-primary" 
              style={{ background: 'var(--success)', border: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}
              onClick={() => {
                // The hook auto-saves, but we provide an explicit trigger confirmation
                window.alert('¡Toda la configuración del examen HSEQ se ha guardado y aplicado en local con éxito!');
              }}
            >
              <Save size={14} /> Guardar Cambios en Servidor Local
            </button>
          </div>
        </div>
      )}

      {/* ADD/EDIT MATERIAL MODAL */}
      <Modal isOpen={isMaterialModalOpen} onClose={() => setIsMaterialModalOpen(false)} title={editingMaterial ? 'Editar Material de Inducción' : 'Nuevo Material Didáctico'}>
        <form onSubmit={handleMaterialSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Título del Recurso</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Ej. Video de Reglamento de Higiene" 
              value={materialForm.title} 
              onChange={e => setMaterialForm({ ...materialForm, title: e.target.value })} 
              required 
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Tipo de Recurso</label>
              <select 
                className="form-control" 
                value={materialForm.type} 
                onChange={e => setMaterialForm({ ...materialForm, type: e.target.value })}
              >
                <option value="video">Video (URL / Embed)</option>
                <option value="presentacion">Presentación / Diapositivas</option>
              </select>
            </div>
            <div className="form-group" style={{ flex: 2 }}>
              <label className="form-label">URL del Recurso</label>
              <input 
                type="url" 
                className="form-control" 
                placeholder="https://..." 
                value={materialForm.url} 
                onChange={e => setMaterialForm({ ...materialForm, url: e.target.value })} 
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Descripción</label>
            <textarea 
              className="form-control" 
              rows="3" 
              placeholder="Breve descripción del contenido para guiar al estudiante..." 
              value={materialForm.description} 
              onChange={e => setMaterialForm({ ...materialForm, description: e.target.value })} 
              required 
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <button type="button" className="btn-secondary" onClick={() => setIsMaterialModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn-primary">Guardar Recurso</button>
          </div>
        </form>
      </Modal>

      {/* QR ZOOM MODAL */}
      <Modal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} title={qrTitle}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', padding: '1rem 0' }}>
          <img 
            src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrUrl)}`}
            alt="QR Code" 
            style={{ width: '220px', height: '220px', border: '1px solid var(--border-color)', padding: '6px', background: '#ffffff', borderRadius: '6px' }}
          />
          <div style={{ background: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)', width: '100%', wordBreak: 'break-all', fontSize: '0.8rem', textAlign: 'center' }}>
            <strong>URL de Acceso:</strong><br/>
            <a href={qrUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)' }}>{qrUrl}</a>
          </div>
          <button 
            type="button" 
            className="btn-primary" 
            style={{ width: '100%' }}
            onClick={() => {
              window.print();
            }}
          >
            Imprimir Código QR para cartelera
          </button>
        </div>
      </Modal>

      {/* INDUCTION CERTIFICATE MODAL */}
      <Modal isOpen={isCertModalOpen} onClose={() => setIsCertModalOpen(false)} title="Certificado de Inducción HSEQ">
        {selectedRecord && (
          <div style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Diploma design */}
            <div style={{
              border: '6px double var(--accent-primary)',
              borderRadius: '8px',
              padding: '1.5rem',
              background: '#ffffff',
              color: '#0f172a',
              boxShadow: 'var(--shadow-lg)',
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}>
              
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid var(--accent-primary)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ margin: 0, color: '#0ea5e9', fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    SGI Enterprise
                  </h3>
                  <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                    SISTEMA DE GESTIÓN INTEGRADO HSEQ
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="badge" style={{ background: '#10b981', color: '#ffffff', fontWeight: 800, padding: '0.2rem 0.5rem', fontSize: '0.7rem', display: 'inline-block' }}>
                    APROBADO
                  </span>
                </div>
              </div>

              {/* Certificate Title */}
              <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                <h4 style={{ margin: 0, fontSize: '0.85rem', color: '#475569', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px' }}>
                  Certificado de Aprobación de Inducción
                </h4>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0.35rem 0' }}>
                  {selectedRecord.certCode}
                </div>
              </div>

              <div style={{ fontSize: '0.82rem', lineHeight: '1.6', textAlign: 'center', color: '#334155', marginBottom: '1.25rem' }}>
                Hace constar que el colaborador / contratista:<br/>
                <strong style={{ fontSize: '1.1rem', color: '#0f172a', display: 'block', margin: '0.25rem 0' }}>{selectedRecord.name}</strong>
                Con Documento de Identidad: <strong>C.C. {selectedRecord.document}</strong><br/>
                En rol de <strong>{selectedRecord.type}</strong> {selectedRecord.project ? `(${selectedRecord.project})` : ''} ocupando el cargo de <strong>{selectedRecord.cargo}</strong> en la ciudad de <strong>{selectedRecord.city}</strong>, ha completado satisfactoriamente la inducción de seguridad y aprobado la evaluación correspondiente:
                <strong style={{ display: 'block', marginTop: '0.4rem', color: '#0ea5e9' }}>{selectedRecord.evalType}</strong>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', background: '#f8fafc', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '1.25rem', fontSize: '0.75rem' }}>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase' }}>Fecha de Ejecución:</span>
                  <strong>{selectedRecord.date}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase' }}>Vencimiento de Inducción:</span>
                  <strong style={{ color: '#b91c1c' }}>{selectedRecord.reinductionDate}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '1.5rem', borderTop: '1px dashed #cbd5e1', paddingTop: '0.75rem' }}>
                <div>
                  <div style={{ borderBottom: '1px solid #94a3b8', width: '120px', height: '35px' }}></div>
                  <span style={{ fontSize: '0.65rem', color: '#64748b', display: 'block', marginTop: '0.25rem' }}>Auditor / Coordinador HSEQ</span>
                </div>

                <div>
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${encodeURIComponent(`${window.location.origin}/induccion-evaluacion?verify=${selectedRecord.certCode}`)}`} 
                    alt="QR Cert" 
                    style={{ width: '60px', height: '60px', display: 'block', border: '1px solid #cbd5e1', padding: '2px' }}
                  />
                  <span style={{ fontSize: '0.55rem', color: '#64748b', display: 'block', textAlign: 'center', marginTop: '0.15rem' }}>Verificar QR</span>
                </div>
              </div>

            </div>

            {/* Print and Close Actions */}
            <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
              <button 
                type="button" 
                className="btn-secondary" 
                style={{ flex: 1 }}
                onClick={() => {
                  window.print();
                }}
              >
                Imprimir Certificado
              </button>
              <button 
                type="button" 
                className="btn-primary" 
                style={{ flex: 1 }}
                onClick={() => setIsCertModalOpen(false)}
              >
                Entendido
              </button>
            </div>

          </div>
        )}
      </Modal>
    </>
  );
}
