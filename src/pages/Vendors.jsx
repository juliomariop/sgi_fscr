import React, { useState, useEffect } from 'react';
import { 
  Truck, Plus, Download, Edit2, Trash2, CheckCircle, Clock, AlertTriangle, 
  ShieldCheck, Star, Search, UserCheck, BarChart2, UploadCloud, FileText, 
  X, ClipboardList
} from 'lucide-react';
import Modal from '../components/Modal';
import ExportModal from '../components/ExportModal';
import { downloadCSV } from '../utils/exportUtils';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAppUsers } from '../hooks/useAppUsers';

const riskLevels = ['Bajo', 'Medio', 'Alto'];
const complianceStates = ['Vigente', 'Vencido', 'No Requiere', 'Pendiente'];

const defaultVendor = {
  name: '',
  nit: '',
  service: '',
  riskLevel: 'Medio',
  socialSecurity: 'Vigente', // Vigente, Vencido, No Requiere
  induction: 'Pendiente',     // Completado, Pendiente, No Requiere
  arlCertificate: 'Vigente'  // Vigente, Vencido, No Requiere
};

const defaultEvaluation = {
  vendorId: '',
  vendorName: '',
  date: '',
  nextEvalDate: '',
  evaluator: '',
  qualityScore: 100,
  deliveryScore: 100,
  sstScore: 100,
  remarks: '',
  fileName: ''
};

// Helper function to auto-generate requirements based on vendor service details
const getVendorRequirements = (vendor) => {
  if (vendor.requirements) return vendor.requirements;
  
  const serviceLower = (vendor.service || '').toLowerCase();
  const defaultReqs = [
    { id: 1, name: 'Planilla de Pago Seguridad Social (PILA) del mes corriente', category: 'SST', mandatory: true, complies: vendor.socialSecurity === 'Vigente' ? 'Cumple' : (vendor.socialSecurity === 'No Requiere' ? 'No Aplica' : 'No Cumple') },
    { id: 2, name: 'Certificación de afiliación a ARL vigente', category: 'SST', mandatory: true, complies: vendor.arlCertificate === 'Vigente' ? 'Cumple' : (vendor.arlCertificate === 'No Requiere' ? 'No Aplica' : 'No Cumple') },
    { id: 3, name: 'Inducción de SST y toma de conciencia HSEQ', category: 'SST', mandatory: true, complies: vendor.induction === 'Completado' ? 'Cumple' : 'No Cumple' }
  ];

  if (serviceLower.includes('altura') || serviceLower.includes('techo') || serviceLower.includes('construc') || serviceLower.includes('mantenimiento') || vendor.riskLevel === 'Alto') {
    defaultReqs.push({ id: 4, name: 'Certificado vigente para Trabajo Seguro en Alturas (Avanzado)', category: 'SST', mandatory: true, complies: 'Cumple' });
    defaultReqs.push({ id: 5, name: 'Exámenes médicos ocupacionales de aptitud para alturas', category: 'SST', mandatory: true, complies: 'Cumple' });
  }
  
  if (serviceLower.includes('residuo') || serviceLower.includes('respel') || serviceLower.includes('ambiental') || serviceLower.includes('transporte')) {
    defaultReqs.push({ id: 6, name: 'Licencia Ambiental y Manifiesto de Transporte de RESPEL', category: 'Ambiental', mandatory: true, complies: 'Cumple' });
    defaultReqs.push({ id: 7, name: 'Plan de contingencias para manejo de derrames y químicos', category: 'Ambiental', mandatory: true, complies: 'No Cumple' });
  }

  if (vendor.riskLevel === 'Alto') {
    defaultReqs.push({ id: 8, name: 'Plan de Trabajo HSEQ y Matriz de Riesgos del servicio firmado', category: 'Gestión', mandatory: true, complies: 'Pendiente' });
  }

  return defaultReqs;
};

export default function Vendors() {
  const APP_USERS = useAppUsers();

  const [vendors, setVendors] = useLocalStorage('sgi_vendors_list', [
    {
      id: 1,
      name: 'Contratistas del Norte S.A.S',
      nit: '900.123.456-1',
      service: 'Mantenimiento de techos y trabajo en alturas',
      riskLevel: 'Alto',
      socialSecurity: 'Vigente',
      induction: 'Completado',
      arlCertificate: 'Vigente',
      requirements: [
        { id: 1, name: 'Planilla de Pago Seguridad Social (PILA) del mes corriente', category: 'SST', mandatory: true, complies: 'Cumple' },
        { id: 2, name: 'Certificación de afiliación a ARL vigente', category: 'SST', mandatory: true, complies: 'Cumple' },
        { id: 3, name: 'Inducción de SST y toma de conciencia HSEQ', category: 'SST', mandatory: true, complies: 'Cumple' },
        { id: 4, name: 'Certificado vigente para Trabajo Seguro en Alturas (Avanzado)', category: 'SST', mandatory: true, complies: 'Cumple' },
        { id: 5, name: 'Exámenes médicos ocupacionales de aptitud para alturas', category: 'SST', mandatory: true, complies: 'No Cumple' }
      ]
    },
    {
      id: 2,
      name: 'Servicios Ambientales del Centro',
      nit: '890.345.678-2',
      service: 'Gestión y transporte de residuos peligrosos (RESPEL)',
      riskLevel: 'Medio',
      socialSecurity: 'Vigente',
      induction: 'Completado',
      arlCertificate: 'Vigente',
      requirements: [
        { id: 6, name: 'Licencia Ambiental expedida por autoridad competente', category: 'Ambiental', mandatory: true, complies: 'Cumple' },
        { id: 7, name: 'Manifiesto de transporte y carga de RESPEL', category: 'Ambiental', mandatory: true, complies: 'Cumple' },
        { id: 8, name: 'Planilla de Seguridad Social (PILA)', category: 'SST', mandatory: true, complies: 'Cumple' },
        { id: 9, name: 'Plan de contingencias para transporte de materiales', category: 'Ambiental', mandatory: true, complies: 'No Cumple' }
      ]
    },
    {
      id: 3,
      name: 'Papelería e Insumos HSEQ Ltda',
      nit: '800.567.890-5',
      service: 'Suministro de papelería y papelería corporativa',
      riskLevel: 'Bajo',
      socialSecurity: 'No Requiere',
      induction: 'Pendiente',
      arlCertificate: 'No Requiere',
      requirements: [
        { id: 10, name: 'Registro Único Tributario (RUT) actualizado', category: 'Legal', mandatory: true, complies: 'Cumple' },
        { id: 11, name: 'Cámara de Comercio (vigencia < 30 días)', category: 'Legal', mandatory: true, complies: 'Cumple' },
        { id: 12, name: 'Certificación Bancaria', category: 'Financiero', mandatory: false, complies: 'Pendiente' }
      ]
    }
  ]);

  const [evaluations, setEvaluations] = useLocalStorage('sgi_vendors_evaluations', [
    {
      id: 101,
      vendorId: 1,
      vendorName: 'Contratistas del Norte S.A.S',
      date: '2026-05-14',
      nextEvalDate: '2026-11-14',
      evaluator: 'Fernando Rueda',
      qualityScore: 92,
      deliveryScore: 88,
      sstScore: 98,
      remarks: 'Excelente cumplimiento de las medidas de seguridad para trabajo en alturas. Buen soporte documental.',
      fileName: 'evaluacion_alturas_norte_firmada.pdf'
    },
    {
      id: 102,
      vendorId: 2,
      vendorName: 'Servicios Ambientales del Centro',
      date: '2026-05-18',
      nextEvalDate: '2027-05-18',
      evaluator: 'Diego Castro',
      qualityScore: 85,
      deliveryScore: 90,
      sstScore: 85,
      remarks: 'Cumple a tiempo, requiere mejorar la rapidez en la entrega de los manifiestos de disposición final.',
      fileName: 'evaluacion_residuos_centro.pdf'
    }
  ]);

  const [activeTab, setActiveTab] = useState('directory'); // directory, evaluations
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [isEvalModalOpen, setIsEvalModalOpen] = useState(false);
  
  const [editingItem, setEditingItem] = useState(null);
  
  const [vendorForm, setVendorForm] = useState(defaultVendor);
  const [evalForm, setEvalForm] = useState(defaultEvaluation);

  const [selectedVendorId, setSelectedVendorId] = useState(null);
  const [lastAutoCalc, setLastAutoCalc] = useState('');

  // History and meta for Vendors & Contractors
  const [vendorsHistory, setVendorsHistory] = useLocalStorage('sgi_vendors_history', [
    { version: '01', date: '2025-01-10', changes: 'Emisión Inicial de la Matriz de Control y Evaluación de Proveedores HSEQ.' }
  ]);
  const [meta, setMeta] = useLocalStorage('sgi_vendors_meta', {
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

  // Service Habilitation States
  const [detailTab, setDetailTab] = useState('requirements'); // requirements, serviceHabilitation
  const [habilitations, setHabilitations] = useLocalStorage('sgi_vendors_habilitations', [
    {
      id: 201,
      vendorId: 1,
      activityName: 'Impermeabilización de cubiertas - Bloque A',
      arlLink: 'https://onedrive.live.com/view?id=arl_contratistas_norte',
      vehicleDocLink: 'https://onedrive.live.com/view?id=soat_vehiculo_norte',
      workPermitLink: 'https://onedrive.live.com/view?id=permiso_alturas_norte',
      inductionCertLink: 'https://onedrive.live.com/view?id=induccion_norte',
      code: 'HAB-2026-042',
      date: '2026-06-12',
      status: 'Habilitado'
    },
    {
      id: 202,
      vendorId: 1,
      activityName: 'Instalación de tanques de agua en techos',
      arlLink: 'https://onedrive.live.com/view?id=arl_contratistas_norte_2',
      vehicleDocLink: '',
      workPermitLink: 'https://onedrive.live.com/view?id=permiso_alturas_norte_2',
      inductionCertLink: '',
      code: 'HAB-2026-043',
      date: '2026-07-01',
      status: 'Pendiente'
    },
    {
      id: 203,
      vendorId: 2,
      activityName: 'Recolección de lodos de planta de tratamiento',
      arlLink: 'https://onedrive.live.com/view?id=arl_servicios_ambientales',
      vehicleDocLink: 'https://onedrive.live.com/view?id=tarjeta_propiedad_camion',
      workPermitLink: 'https://onedrive.live.com/view?id=permiso_quimicos_centro',
      inductionCertLink: 'https://onedrive.live.com/view?id=induccion_ambientales',
      code: 'HAB-2026-044',
      date: '2026-06-15',
      status: 'Habilitado'
    }
  ]);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [activeHabilitation, setActiveHabilitation] = useState(null);
  const [newActivityName, setNewActivityName] = useState('');

  const [newReqForm, setNewReqForm] = useState({
    name: '',
    category: 'SST',
    mandatory: true
  });

  // Normalize vendors to ensure all have requirements arrays
  const normalizedVendors = vendors.map(v => ({
    ...v,
    requirements: v.requirements || getVendorRequirements(v)
  }));

  // Auto-select first vendor in list on start
  useEffect(() => {
    if (normalizedVendors.length > 0 && !selectedVendorId) {
      setSelectedVendorId(normalizedVendors[0].id);
    }
  }, [normalizedVendors, selectedVendorId]);

  // Recalculate next reevaluation date automatically based on risk level and evaluation date
  useEffect(() => {
    const calcKey = `${evalForm.vendorId}-${evalForm.date}`;
    if (evalForm.date && evalForm.vendorId && calcKey !== lastAutoCalc) {
      const selectedVendor = vendors.find(v => String(v.id) === String(evalForm.vendorId));
      if (selectedVendor) {
        const months = selectedVendor.riskLevel === 'Alto' ? 6 : 12;
        const d = new Date(evalForm.date + 'T00:00:00'); // avoid timezone shifts
        d.setMonth(d.getMonth() + months);
        setEvalForm(prev => ({
          ...prev,
          nextEvalDate: d.toISOString().split('T')[0]
        }));
        setLastAutoCalc(calcKey);
      }
    }
  }, [evalForm.date, evalForm.vendorId, vendors, lastAutoCalc]);

  // Filter vendors
  const filteredVendors = normalizedVendors.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.nit.includes(searchTerm) ||
    v.service.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Vendor handlers
  const handleOpenVendorModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setVendorForm(item);
    } else {
      setEditingItem(null);
      setVendorForm(defaultVendor);
    }
    setIsVendorModalOpen(true);
  };

  const handleVendorSubmit = (e) => {
    e.preventDefault();
    if (editingItem) {
      setVendors(vendors.map(v => v.id === editingItem.id ? { ...vendorForm, id: v.id, requirements: editingItem.requirements || [] } : v));
      setEvaluations(evaluations.map(ev => ev.vendorId === editingItem.id ? { ...ev, vendorName: vendorForm.name } : ev));
    } else {
      const tempVendor = { ...vendorForm, id: Date.now() };
      const newRequirements = getVendorRequirements(tempVendor);
      const finalVendor = { ...tempVendor, requirements: newRequirements };
      setVendors([...vendors, finalVendor]);
      setSelectedVendorId(finalVendor.id);
    }
    setIsVendorModalOpen(false);
  };

  const handleVendorDelete = (id) => {
    if (window.confirm("¿Está seguro de eliminar este contratista? Se perderá su historial.")) {
      const remaining = vendors.filter(v => v.id !== id);
      setVendors(remaining);
      setEvaluations(evaluations.filter(ev => ev.vendorId !== id));
      if (selectedVendorId === id) {
        setSelectedVendorId(remaining[0]?.id || null);
      }
    }
  };

  // Requirement handlers (in detail ficha)
  const handleUpdateRequirementStatus = (vendorId, reqId, newCompliance) => {
    const updated = normalizedVendors.map(v => {
      if (v.id === vendorId) {
        const updatedReqs = v.requirements.map(r => 
          r.id === reqId ? { ...r, complies: newCompliance } : r
        );
        return { ...v, requirements: updatedReqs };
      }
      return v;
    });
    setVendors(updated);
  };

  const handleAddRequirement = (e, vendorId) => {
    e.preventDefault();
    if (!newReqForm.name) return;

    const newReq = {
      id: Date.now(),
      name: newReqForm.name,
      category: newReqForm.category,
      mandatory: newReqForm.mandatory,
      complies: 'Pendiente'
    };

    const updated = normalizedVendors.map(v => {
      if (v.id === vendorId) {
        return {
          ...v,
          requirements: [...(v.requirements || []), newReq]
        };
      }
      return v;
    });

    setVendors(updated);
    setNewReqForm({ name: '', category: 'SST', mandatory: true });
  };

  const handleDeleteRequirement = (vendorId, reqId) => {
    if (window.confirm("¿Está seguro de eliminar este requisito de obligatorio cumplimiento?")) {
      const updated = normalizedVendors.map(v => {
        if (v.id === vendorId) {
          return {
            ...v,
            requirements: (v.requirements || []).filter(r => r.id !== reqId)
          };
        }
        return v;
      });
      setVendors(updated);
    }
  };

  // Evaluation handlers
  const handleOpenEvalModal = (item = null, selectedVendor = null) => {
    if (item) {
      setEditingItem(item);
      setEvalForm(item);
    } else {
      const targetVendor = selectedVendor || normalizedVendors[0];
      setEditingItem(null);
      setEvalForm({
        ...defaultEvaluation,
        vendorId: targetVendor ? targetVendor.id : '',
        vendorName: targetVendor ? targetVendor.name : '',
        date: new Date().toISOString().split('T')[0],
        evaluator: APP_USERS[0]?.name || '',
        fileName: ''
      });
    }
    setIsEvalModalOpen(true);
  };

  const handleEvalSubmit = (e) => {
    e.preventDefault();
    const vendorObj = vendors.find(v => String(v.id) === String(evalForm.vendorId));
    const finalForm = {
      ...evalForm,
      vendorName: vendorObj ? vendorObj.name : evalForm.vendorName,
      fileName: evalForm.fileName || 'reporte_evaluacion_desempeno.pdf' // Fallback simulation filename
    };

    if (editingItem) {
      setEvaluations(evaluations.map(ev => ev.id === editingItem.id ? { ...finalForm, id: ev.id } : ev));
    } else {
      setEvaluations([...evaluations, { ...finalForm, id: Date.now() }]);
    }
    setIsEvalModalOpen(false);
  };

  const handleEvalDelete = (id) => {
    if (window.confirm("¿Está seguro de eliminar esta evaluación?")) {
      setEvaluations(evaluations.filter(ev => ev.id !== id));
    }
  };

  // Service Habilitation Handlers
  const handleAddHabilitation = (e) => {
    e.preventDefault();
    if (!newActivityName || !selectedVendorId) return;

    const newHab = {
      id: Date.now(),
      vendorId: selectedVendorId,
      activityName: newActivityName,
      arlLink: '',
      vehicleDocLink: '',
      workPermitLink: '',
      inductionCertLink: '',
      code: `HAB-2026-${String(habilitations.length + 42).padStart(3, '0')}`, // seed base offset 42
      date: new Date().toISOString().split('T')[0],
      status: 'Pendiente'
    };

    setHabilitations([...habilitations, newHab]);
    setNewActivityName('');
  };

  const handleUpdateHabilitationLink = (habId, field, linkValue) => {
    const updated = habilitations.map(h => {
      if (h.id === habId) {
        const newHab = { ...h, [field]: linkValue };
        // Check if all 4 documents are provided
        if (newHab.arlLink && newHab.vehicleDocLink && newHab.workPermitLink && newHab.inductionCertLink) {
          newHab.status = 'Habilitado';
        } else {
          newHab.status = 'Pendiente';
        }
        return newHab;
      }
      return h;
    });
    setHabilitations(updated);
  };

  const handleDeleteHabilitation = (habId) => {
    if (window.confirm("¿Está seguro de eliminar esta solicitud de habilitación?")) {
      setHabilitations(habilitations.filter(h => h.id !== habId));
    }
  };

  const handleExport = () => {
    const cols = [
      { header: 'NIT', key: 'nit' },
      { header: 'Proveedor / Contratista', key: 'name' },
      { header: 'Servicio / Actividad Prestada', key: 'service' },
      { header: 'Nivel de Riesgo', key: 'riskLevel' },
      { header: 'Planilla Seguridad Social', key: 'socialSecurity' },
      { header: 'Inducción SST', key: 'induction' },
      { header: 'Certificado ARL', key: 'arlCertificate' },
      { header: 'Fecha Última Evaluación', key: 'evalDate' },
      { header: 'Próxima Reevaluación', key: 'nextEvalDate' },
      { header: 'Evaluador', key: 'evaluator' },
      { header: 'Puntaje Calidad', key: 'qualityScore' },
      { header: 'Puntaje Entrega', key: 'deliveryScore' },
      { header: 'Puntaje SST', key: 'sstScore' },
      { header: 'Promedio Desempeño', key: 'avgScore' },
      { header: 'Clasificación Desempeño', key: 'classification' },
      { header: 'Observaciones / Hallazgos', key: 'remarks' }
    ];

    const dataToExport = normalizedVendors.map(v => {
      // Find latest evaluation for this vendor
      const vendorEvals = evaluations.filter(e => String(e.vendorId) === String(v.id));
      const latestEval = vendorEvals.length > 0 ? vendorEvals[vendorEvals.length - 1] : null;
      
      const avgScoreVal = latestEval 
        ? ((parseInt(latestEval.qualityScore) + parseInt(latestEval.deliveryScore) + parseInt(latestEval.sstScore)) / 3).toFixed(1)
        : 'Sin registro';
        
      const classificationText = latestEval
        ? getScoreClassification(parseFloat(avgScoreVal)).label
        : 'Sin evaluación';

      return {
        nit: v.nit,
        name: v.name,
        service: v.service,
        riskLevel: v.riskLevel,
        socialSecurity: v.socialSecurity,
        induction: v.induction,
        arlCertificate: v.arlCertificate,
        evalDate: latestEval ? latestEval.date : 'N/A',
        nextEvalDate: latestEval ? latestEval.nextEvalDate : 'N/A',
        evaluator: latestEval ? latestEval.evaluator : 'N/A',
        qualityScore: latestEval ? latestEval.qualityScore : 'N/A',
        deliveryScore: latestEval ? latestEval.deliveryScore : 'N/A',
        sstScore: latestEval ? latestEval.sstScore : 'N/A',
        avgScore: avgScoreVal,
        classification: classificationText,
        remarks: latestEval ? latestEval.remarks : 'Sin observaciones'
      };
    });

    setExportConfig({
      isOpen: true,
      exportType: 'excel',
      title: 'Matriz de Control y Evaluación de Desempeño de Contratistas',
      code: 'COP-MAT-PROV-001',
      version: `0${meta.version}`,
      validity: meta.validity,
      columns: cols,
      data: dataToExport,
      history: vendorsHistory
    });
  };

  // Helper to determine score color and label
  const getScoreClassification = (score) => {
    if (score >= 90) return { label: 'Sobresaliente', class: 'badge-success' };
    if (score >= 70) return { label: 'Conforme', class: 'badge-info' };
    if (score >= 60) return { label: 'Condicional', class: 'badge-warning' };
    return { label: 'Crítico / Rechazado', class: 'badge-danger' };
  };

  // Semaphores visual helpers
  const getBadgeForStatus = (status) => {
    if (status === 'Vigente' || status === 'Completado') return 'badge-success';
    if (status === 'Pendiente') return 'badge-warning';
    if (status === 'Vencido') return 'badge-danger';
    return 'badge-info'; // No Requiere / No Aplica
  };

  // Extract selected vendor's detailed info
  const selectedVendor = normalizedVendors.find(v => v.id === selectedVendorId);
  const vendorEvals = evaluations.filter(e => String(e.vendorId) === String(selectedVendorId));
  const lastEval = vendorEvals[vendorEvals.length - 1];
  const lastEvalAvg = lastEval ? ((parseInt(lastEval.qualityScore) + parseInt(lastEval.deliveryScore) + parseInt(lastEval.sstScore)) / 3).toFixed(0) : 0;
  const isOverdue = lastEval && lastEval.nextEvalDate && new Date(lastEval.nextEvalDate + 'T23:59:59') < new Date();

  return (
    <>
      <style>{`
        .vendor-row {
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        .vendor-row:hover {
          background-color: var(--bg-secondary) !important;
        }
        .vendor-row.active {
          background-color: var(--bg-tertiary) !important;
          border-left: 3px solid var(--accent-primary) !important;
        }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>ISO 9001 - Cláusula 8.4</p>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Proveedores y Contratistas</h2>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button className="btn-secondary" onClick={handleExport}><Download size={16} /> Exportar Matriz Completa</button>
          {activeTab === 'directory' ? (
            <button className="btn-primary" onClick={() => handleOpenVendorModal()}><Plus size={16} /> Agregar Proveedor</button>
          ) : (
            <button className="btn-primary" onClick={() => handleOpenEvalModal()} disabled={vendors.length === 0}><Plus size={16} /> Evaluar Desempeño</button>
          )}
        </div>
      </div>

      {/* Navigation Subtabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button 
          className={`btn-secondary ${activeTab === 'directory' ? 'active' : ''}`} 
          style={{ border: 'none', background: activeTab === 'directory' ? 'rgba(14, 165, 233, 0.1)' : 'transparent', color: activeTab === 'directory' ? 'var(--accent-primary)' : 'var(--text-secondary)', fontWeight: 600 }}
          onClick={() => setActiveTab('directory')}
        >
          <Truck size={14} style={{ marginRight: '4px' }} /> Control de Contratistas ({vendors.length})
        </button>
        <button 
          className={`btn-secondary ${activeTab === 'evaluations' ? 'active' : ''}`} 
          style={{ border: 'none', background: activeTab === 'evaluations' ? 'rgba(16, 185, 129, 0.1)' : 'transparent', color: activeTab === 'evaluations' ? 'var(--success)' : 'var(--text-secondary)', fontWeight: 600 }}
          onClick={() => setActiveTab('evaluations')}
        >
          <BarChart2 size={14} style={{ marginRight: '4px' }} /> Historial de Evaluaciones ({evaluations.length})
        </button>
      </div>

      {/* Search Input for directory */}
      {activeTab === 'directory' && (
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', maxWidth: '400px', width: '100%' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}><Search size={16} /></span>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Buscar por Nombre, NIT o Servicio..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              style={{ paddingLeft: '2.25rem' }}
            />
          </div>
        </div>
      )}

      {/* DIRECTORY VIEW */}
      {activeTab === 'directory' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Proveedor / NIT</th>
                  <th>Servicio Prestado</th>
                  <th>Nivel de Riesgo</th>
                  <th>Planilla SS</th>
                  <th>Inducción HSEQ</th>
                  <th>Planilla ARL</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredVendors.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                      No se encontraron contratistas.
                    </td>
                  </tr>
                ) : (
                  filteredVendors.map(v => (
                    <tr 
                      key={v.id} 
                      className={`vendor-row ${v.id === selectedVendorId ? 'active' : ''}`}
                      onClick={() => setSelectedVendorId(v.id)}
                    >
                      <td>
                        <div style={{ fontWeight: 600 }}>{v.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>NIT: {v.nit}</div>
                      </td>
                      <td style={{ maxWidth: '250px', fontSize: '0.85rem' }}>{v.service}</td>
                      <td>
                        <span className={`badge ${
                          v.riskLevel === 'Alto' ? 'badge-danger' : 
                          v.riskLevel === 'Medio' ? 'badge-warning' : 'badge-success'
                        }`}>
                          Riesgo {v.riskLevel}
                        </span>
                      </td>
                      {/* Semaforo SS */}
                      <td>
                        <span className={`badge ${getBadgeForStatus(v.socialSecurity)}`}>
                          {v.socialSecurity}
                        </span>
                      </td>
                      {/* Semaforo Induccion */}
                      <td>
                        <span className={`badge ${getBadgeForStatus(v.induction)}`}>
                          {v.induction}
                        </span>
                      </td>
                      {/* Semaforo ARL */}
                      <td>
                        <span className={`badge ${getBadgeForStatus(v.arlCertificate)}`}>
                          {v.arlCertificate}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                          <button 
                            className="btn-secondary" 
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} 
                            onClick={(e) => { e.stopPropagation(); handleOpenEvalModal(null, v); }}
                          >
                            <UserCheck size={12} style={{ marginRight: '4px' }} /> Evaluar
                          </button>
                          <button className="btn-icon" style={{ padding: '0.25rem' }} onClick={(e) => { e.stopPropagation(); handleOpenVendorModal(v); }}><Edit2 size={14} /></button>
                          <button className="btn-icon" style={{ padding: '0.25rem', color: 'var(--danger)' }} onClick={(e) => { e.stopPropagation(); handleVendorDelete(v.id); }}><Trash2 size={14} /></button>
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

      {/* CONTRACTOR CONTROL SHEET (FICHA DE CONTROL) */}
      {activeTab === 'directory' && selectedVendor && (
        <div className="card fade-in" style={{ marginTop: '1.5rem', padding: '1.25rem', borderLeft: '4px solid var(--accent-primary)', marginBottom: '2rem' }}>
          
          {/* Ficha Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <span className="badge badge-info" style={{ marginBottom: '0.25rem', display: 'inline-block' }}><ShieldCheck size={10} style={{ marginRight: '4px' }} /> Ficha de Control y Conformidad Legal</span>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>{selectedVendor.name}</h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Servicio: <strong>{selectedVendor.service}</strong> | NIT: <strong>{selectedVendor.nit}</strong>
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button className="btn-secondary" style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem' }} onClick={() => handleOpenVendorModal(selectedVendor)}>
                <Edit2 size={12} style={{ marginRight: '4px' }} /> Editar Contratista
              </button>
            </div>
          </div>

          {/* Ficha Sub-tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            <button 
              className={`btn-secondary ${detailTab === 'requirements' ? 'active' : ''}`}
              style={{ border: 'none', background: detailTab === 'requirements' ? 'rgba(14, 165, 233, 0.1)' : 'transparent', color: detailTab === 'requirements' ? 'var(--accent-primary)' : 'var(--text-secondary)', fontWeight: 600, padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
              onClick={() => setDetailTab('requirements')}
            >
              Requisitos y Evaluación de Desempeño
            </button>
            <button 
              className={`btn-secondary ${detailTab === 'serviceHabilitation' ? 'active' : ''}`}
              style={{ border: 'none', background: detailTab === 'serviceHabilitation' ? 'rgba(16, 185, 129, 0.1)' : 'transparent', color: detailTab === 'serviceHabilitation' ? 'var(--success)' : 'var(--text-secondary)', fontWeight: 600, padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
              onClick={() => setDetailTab('serviceHabilitation')}
            >
              Habilitación para Prestación del Servicio
            </button>
          </div>

          {detailTab === 'requirements' ? (
            /* Two Column Layout Grid */
            <div className="grid-2" style={{ gap: '1.25rem' }}>
              
              {/* Left Column: Mandatory requirements checklist */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 700, margin: 0, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <ClipboardList size={14} /> Requisitos de Obligatorio Cumplimiento
                  </h4>
                  <span className="badge badge-info" style={{ fontSize: '0.68rem' }}>
                    {selectedVendor.requirements.filter(r => r.complies === 'Cumple').length} / {selectedVendor.requirements.length} Cumplidos
                  </span>
                </div>

                <div style={{ background: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  
                  {/* Scrollable list of requirements */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', maxHeight: '210px', overflowY: 'auto', marginBottom: '0.85rem', paddingRight: '2px' }}>
                    {selectedVendor.requirements.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '1.25rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.78rem', border: '1px dashed var(--border-color)', borderRadius: '6px' }}>
                        No hay requisitos registrados para este contratista.
                      </div>
                    ) : (
                      selectedVendor.requirements.map(req => (
                        <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.45rem 0.65rem', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', gap: '0.5rem' }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                              <span className={`badge ${req.category === 'SST' ? 'badge-danger' : req.category === 'Ambiental' ? 'badge-success' : 'badge-info'}`} style={{ fontSize: '0.58rem', padding: '0.05rem 0.25rem' }}>
                                {req.category}
                              </span>
                              {req.mandatory && (
                                <span style={{ fontSize: '0.65rem', color: 'var(--danger)', fontWeight: 700 }}>[OBLIGATORIO]</span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.15rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={req.name}>
                              {req.name}
                            </div>
                          </div>
                          
                          {/* Requirement Compliance Toggle Action */}
                          <div style={{ display: 'flex', gap: '2px', flexShrink: 0, alignItems: 'center' }}>
                            <button 
                              type="button"
                              style={{
                                padding: '0.18rem 0.4rem',
                                fontSize: '0.68rem',
                                borderRadius: '4px 0 0 4px',
                                background: req.complies === 'Cumple' ? 'var(--success)' : 'var(--bg-secondary)',
                                color: req.complies === 'Cumple' ? 'white' : 'var(--text-secondary)',
                                border: '1px solid ' + (req.complies === 'Cumple' ? 'var(--success)' : 'var(--border-color)'),
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                              onClick={() => handleUpdateRequirementStatus(selectedVendor.id, req.id, 'Cumple')}
                            >
                              Cumple
                            </button>
                            <button 
                              type="button"
                              style={{
                                padding: '0.18rem 0.4rem',
                                fontSize: '0.68rem',
                                borderRadius: '0',
                                background: req.complies === 'No Cumple' ? 'var(--danger)' : 'var(--bg-secondary)',
                                color: req.complies === 'No Cumple' ? 'white' : 'var(--text-secondary)',
                                border: '1px solid ' + (req.complies === 'No Cumple' ? 'var(--danger)' : 'var(--border-color)'),
                                borderLeft: 'none',
                                borderRight: 'none',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                              onClick={() => handleUpdateRequirementStatus(selectedVendor.id, req.id, 'No Cumple')}
                            >
                              No
                            </button>
                            <button 
                              type="button"
                              style={{
                                padding: '0.18rem 0.4rem',
                                fontSize: '0.68rem',
                                borderRadius: '0 4px 4px 0',
                                background: req.complies === 'Pendiente' ? 'var(--warning)' : 'var(--bg-secondary)',
                                color: req.complies === 'Pendiente' ? 'black' : 'var(--text-secondary)',
                                border: '1px solid ' + (req.complies === 'Pendiente' ? 'var(--warning)' : 'var(--border-color)'),
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                              onClick={() => handleUpdateRequirementStatus(selectedVendor.id, req.id, 'Pendiente')}
                            >
                              Pnd
                            </button>
                            <button 
                              type="button"
                              className="btn-icon"
                              style={{ padding: '0.15rem', marginLeft: '0.25rem', color: 'var(--danger)' }}
                              onClick={() => handleDeleteRequirement(selectedVendor.id, req.id)}
                              title="Eliminar Requisito"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Form to append specific requirement */}
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.65rem' }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Agregar Requisito del Servicio</div>
                    <form onSubmit={(e) => handleAddRequirement(e, selectedVendor.id)} style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <input 
                        type="text" 
                        placeholder="Describa el requisito..." 
                        className="form-control" 
                        style={{ flex: '2 1 180px', fontSize: '0.78rem', padding: '0.3rem 0.5rem' }} 
                        value={newReqForm.name}
                        onChange={e => setNewReqForm({ ...newReqForm, name: e.target.value })}
                        required 
                      />
                      <select 
                        className="form-control" 
                        style={{ flex: '1 1 90px', fontSize: '0.78rem', padding: '0.3rem 0.5rem' }}
                        value={newReqForm.category}
                        onChange={e => setNewReqForm({ ...newReqForm, category: e.target.value })}
                      >
                        <option value="SST">SST</option>
                        <option value="Ambiental">Ambiental</option>
                        <option value="Legal">Legal</option>
                        <option value="Calidad">Calidad</option>
                        <option value="Especial">Especial</option>
                      </select>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', cursor: 'pointer', userSelect: 'none' }}>
                        <input 
                          type="checkbox" 
                          checked={newReqForm.mandatory}
                          onChange={e => setNewReqForm({ ...newReqForm, mandatory: e.target.checked })}
                        />
                        Oblig.
                      </label>
                      <button type="submit" className="btn-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.2rem', marginLeft: 'auto' }}>
                        <Plus size={12} /> Registrar
                      </button>
                    </form>
                  </div>

                </div>
              </div>

              {/* Right Column: Performance evaluation & reevaluation date */}
              <div>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.6rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Star size={14} /> Desempeño ISO 9001 y Reevaluación
                </h4>
                <div style={{ background: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', height: '100%', display: 'flex', flexDirection: 'column', gap: '0.65rem', justifyContent: 'center' }}>
                  {vendorEvals.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '1rem 0.5rem' }}>
                      <AlertTriangle size={20} style={{ color: 'var(--warning)', marginBottom: '0.4rem' }} />
                      <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>Sin evaluación registrada</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem', marginBottom: '0.65rem' }}>
                        Este proveedor no posee una evaluación de desempeño HSEQ en este período.
                      </div>
                      <button 
                        type="button" 
                        className="btn-primary" 
                        style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem', margin: '0 auto' }}
                        onClick={() => handleOpenEvalModal(null, selectedVendor)}
                      >
                        <UserCheck size={12} style={{ marginRight: '4px' }} /> Registrar Evaluación
                      </button>
                    </div>
                  ) : (
                    <div>
                      {/* Score Summary */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', background: 'var(--bg-primary)', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-color)', marginBottom: '0.65rem' }}>
                        <div style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '50%',
                          background: 'rgba(14, 165, 233, 0.1)',
                          color: 'var(--accent-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '1rem',
                          border: '2px solid var(--accent-primary)',
                          flexShrink: 0
                        }}>
                          {lastEvalAvg}%
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Último Desempeño</div>
                          <div style={{ fontSize: '0.8rem', fontWeight: 700, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            C: {lastEval.qualityScore} | E: {lastEval.deliveryScore} | S: {lastEval.sstScore}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Evaluado el {lastEval.date} por {lastEval.evaluator}</div>
                        </div>
                      </div>

                      {/* Overdue/Vigente Alert */}
                      <div style={{
                        background: isOverdue ? 'rgba(239, 68, 68, 0.05)' : 'rgba(16, 185, 129, 0.05)',
                        border: '1px solid ' + (isOverdue ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'),
                        padding: '0.65rem',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.45rem',
                        marginBottom: '0.65rem'
                      }}>
                        {isOverdue ? <AlertTriangle size={16} style={{ color: 'var(--danger)', flexShrink: 0, marginTop: '2px' }} /> : <Clock size={16} style={{ color: 'var(--success)', flexShrink: 0, marginTop: '2px' }} />}
                        <div>
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: isOverdue ? 'var(--danger)' : 'var(--success)' }}>
                            {isOverdue ? '¡Reevaluación Vencida!' : 'Reevaluación Planificada'}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', marginTop: '0.1rem' }}>
                            Próxima fecha: <strong>{lastEval.nextEvalDate}</strong>
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.1rem', lineHeight: '1.3' }}>
                            {isOverdue ? 'Vencida según la frecuencia del nivel de riesgo.' : 'La vigencia está activa. En monitoreo legal ordinario.'}
                          </div>
                        </div>
                      </div>

                      {/* Evaluation Attachment */}
                      {lastEval.fileName ? (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-primary)', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', minWidth: 0 }}>
                            <FileText size={14} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={lastEval.fileName}>
                              {lastEval.fileName}
                            </span>
                          </div>
                          <button 
                            type="button" 
                            className="btn-secondary" 
                            style={{ padding: '0.15rem 0.45rem', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '2px' }}
                            onClick={() => {
                              window.alert(`[HSEQ] Descargando archivo soporte de evaluación: "${lastEval.fileName}"`);
                            }}
                          >
                            <Download size={10} /> Descargar
                          </button>
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', padding: '0.4rem', border: '1px dashed var(--border-color)', borderRadius: '6px' }}>
                          Sin soporte de evaluación adjunto.
                        </div>
                      )}

                    </div>
                  )}
                </div>
              </div>

            </div>
          ) : (
            /* Service Habilitation Tab Panel */
            <div>
              {/* Activity Creation Form */}
              <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.85rem', marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.2px' }}>Solicitar Habilitación para Nueva Actividad o Servicio</h4>
                <form onSubmit={handleAddHabilitation} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <input 
                    type="text" 
                    className="form-control" 
                    style={{ flex: 1, minWidth: '250px', fontSize: '0.78rem', padding: '0.35rem 0.6rem' }} 
                    placeholder="Describa la actividad (ej: Mantenimiento Eléctrico de Subestación - Bloque A)..."
                    value={newActivityName}
                    onChange={e => setNewActivityName(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn-primary" style={{ padding: '0.35rem 0.8rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Plus size={14} /> Crear Solicitud
                  </button>
                </form>
              </div>

              {/* Habilitation List */}
              {habilitations.filter(h => h.vendorId === selectedVendor.id).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem', border: '1px dashed var(--border-color)', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  No hay solicitudes de habilitación registradas para prestar servicios en planta.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {habilitations.filter(h => h.vendorId === selectedVendor.id).map(hab => (
                    <div key={hab.id} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem' }}>
                      
                      {/* Header of Habilitation Card */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>{hab.activityName}</h4>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Solicitado el: <strong>{hab.date}</strong> | Código: <strong>{hab.code}</strong></span>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span className={`badge ${hab.status === 'Habilitado' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.7rem', fontWeight: 700 }}>
                            {hab.status === 'Habilitado' ? '✓ Habilitado' : '⚡ Pendiente Soportes'}
                          </span>
                          <button 
                            type="button" 
                            className="btn-icon" 
                            style={{ color: 'var(--danger)', padding: '0.2rem' }} 
                            onClick={() => handleDeleteHabilitation(hab.id)}
                            title="Eliminar Solicitud"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* 4 Mandatory Docs Link Inputs Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
                        
                        {/* ARL */}
                        <div style={{ background: 'var(--bg-primary)', padding: '0.55rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                          <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '4px' }}>1. ARL del Personal:</span>
                          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                            <input 
                              type="text"
                              className="form-control"
                              style={{ fontSize: '0.75rem', padding: '0.2rem 0.4rem', height: '26px' }}
                              placeholder="Link soporte ARL..."
                              value={hab.arlLink || ''}
                              onChange={e => handleUpdateHabilitationLink(hab.id, 'arlLink', e.target.value)}
                            />
                            {hab.arlLink ? (
                              <a href={hab.arlLink} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ padding: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '26px', width: '26px' }} title="Ver Documento">
                                <FileText size={12} style={{ color: 'var(--success)' }} />
                              </a>
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '26px', width: '26px', background: 'var(--bg-secondary)', borderRadius: '4px', border: '1px solid var(--border-color)' }} title="Soporte Pendiente">
                                <AlertTriangle size={12} style={{ color: 'var(--warning)' }} />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Vehiculo */}
                        <div style={{ background: 'var(--bg-primary)', padding: '0.55rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                          <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '4px' }}>2. Documentos del Vehículo:</span>
                          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                            <input 
                              type="text"
                              className="form-control"
                              style={{ fontSize: '0.75rem', padding: '0.2rem 0.4rem', height: '26px' }}
                              placeholder="Link SOAT / Tecno..."
                              value={hab.vehicleDocLink || ''}
                              onChange={e => handleUpdateHabilitationLink(hab.id, 'vehicleDocLink', e.target.value)}
                            />
                            {hab.vehicleDocLink ? (
                              <a href={hab.vehicleDocLink} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ padding: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '26px', width: '26px' }} title="Ver Documento">
                                <FileText size={12} style={{ color: 'var(--success)' }} />
                              </a>
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '26px', width: '26px', background: 'var(--bg-secondary)', borderRadius: '4px', border: '1px solid var(--border-color)' }} title="Soporte Pendiente">
                                <AlertTriangle size={12} style={{ color: 'var(--warning)' }} />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Permisos de trabajo */}
                        <div style={{ background: 'var(--bg-primary)', padding: '0.55rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                          <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '4px' }}>3. Permiso de Trabajo HSEQ:</span>
                          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                            <input 
                              type="text"
                              className="form-control"
                              style={{ fontSize: '0.75rem', padding: '0.2rem 0.4rem', height: '26px' }}
                              placeholder="Link análisis/permiso..."
                              value={hab.workPermitLink || ''}
                              onChange={e => handleUpdateHabilitationLink(hab.id, 'workPermitLink', e.target.value)}
                            />
                            {hab.workPermitLink ? (
                              <a href={hab.workPermitLink} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ padding: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '26px', width: '26px' }} title="Ver Documento">
                                <FileText size={12} style={{ color: 'var(--success)' }} />
                              </a>
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '26px', width: '26px', background: 'var(--bg-secondary)', borderRadius: '4px', border: '1px solid var(--border-color)' }} title="Soporte Pendiente">
                                <AlertTriangle size={12} style={{ color: 'var(--warning)' }} />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Induccion */}
                        <div style={{ background: 'var(--bg-primary)', padding: '0.55rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                          <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '4px' }}>4. Constancia de Inducción:</span>
                          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                            <input 
                              type="text"
                              className="form-control"
                              style={{ fontSize: '0.75rem', padding: '0.2rem 0.4rem', height: '26px' }}
                              placeholder="Link constancia/acta..."
                              value={hab.inductionCertLink || ''}
                              onChange={e => handleUpdateHabilitationLink(hab.id, 'inductionCertLink', e.target.value)}
                            />
                            {hab.inductionCertLink ? (
                              <a href={hab.inductionCertLink} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ padding: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '26px', width: '26px' }} title="Ver Documento">
                                <FileText size={12} style={{ color: 'var(--success)' }} />
                              </a>
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '26px', width: '26px', background: 'var(--bg-secondary)', borderRadius: '4px', border: '1px solid var(--border-color)' }} title="Soporte Pendiente">
                                <AlertTriangle size={12} style={{ color: 'var(--warning)' }} />
                              </div>
                            )}
                          </div>
                        </div>

                      </div>

                      {/* Action Button: Certificado */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '0.6rem' }}>
                        {hab.status === 'Habilitado' ? (
                          <button 
                            type="button" 
                            className="btn-primary" 
                            style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem', background: 'var(--success)', border: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                            onClick={() => {
                              setActiveHabilitation(hab);
                              setIsCertModalOpen(true);
                            }}
                          >
                            <ShieldCheck size={14} /> Generar Certificado de Habilitación
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <AlertTriangle size={12} style={{ color: 'var(--warning)' }} /> Complete los 4 documentos para emitir el certificado.
                          </span>
                        )}
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* EVALUATIONS VIEW */}
      {activeTab === 'evaluations' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Fecha Eval.</th>
                  <th>Contratista</th>
                  <th>Calidad</th>
                  <th>Logística / Entrega</th>
                  <th>HSEQ / SST</th>
                  <th>Promedio</th>
                  <th>Próxima Reevaluación</th>
                  <th>Archivo Soporte</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {evaluations.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                      Aún no hay evaluaciones registradas en el sistema.
                    </td>
                  </tr>
                ) : (
                  evaluations.map(ev => {
                    const avg = ((parseInt(ev.qualityScore) + parseInt(ev.deliveryScore) + parseInt(ev.sstScore)) / 3).toFixed(1);
                    const classification = getScoreClassification(parseFloat(avg));
                    const isEvalOverdue = ev.nextEvalDate && new Date(ev.nextEvalDate + 'T23:59:59') < new Date();
                    return (
                      <tr key={ev.id}>
                        <td>{ev.date}</td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{ev.vendorName}</div>
                          {ev.remarks && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}><strong>Obs:</strong> {ev.remarks}</div>}
                        </td>
                        <td>{ev.qualityScore}/100</td>
                        <td>{ev.deliveryScore}/100</td>
                        <td>{ev.sstScore}/100</td>
                        <td style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--accent-primary)' }}>{avg}%</td>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{ev.nextEvalDate || 'No programada'}</div>
                          {ev.nextEvalDate && (
                            <span className={`badge ${isEvalOverdue ? 'badge-danger' : 'badge-success'}`} style={{ fontSize: '0.6rem', marginTop: '0.15rem', display: 'inline-block' }}>
                              {isEvalOverdue ? 'Vencido / Reevaluar' : 'Vigente'}
                            </span>
                          )}
                        </td>
                        <td>
                          {ev.fileName ? (
                            <button 
                              className="btn-secondary" 
                              style={{ padding: '0.2rem 0.45rem', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                              onClick={() => {
                                window.alert(`[HSEQ] Descargando archivo soporte de evaluación: "${ev.fileName}"`);
                              }}
                            >
                              <Download size={10} /> {ev.fileName.length > 15 ? ev.fileName.substring(0, 13) + '...' : ev.fileName}
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Sin soporte</span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.25rem' }}>
                            <button className="btn-icon" style={{ padding: '0.25rem' }} onClick={() => handleOpenEvalModal(ev)}><Edit2 size={14} /></button>
                            <button className="btn-icon" style={{ padding: '0.25rem', color: 'var(--danger)' }} onClick={() => handleEvalDelete(ev.id)}><Trash2 size={14} /></button>
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
      )}

      {/* VENDOR MODAL */}
      <Modal isOpen={isVendorModalOpen} onClose={() => setIsVendorModalOpen(false)} title={editingItem ? "Modificar Contratista" : "Registrar Contratista / Proveedor"}>
        <form onSubmit={handleVendorSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Razón Social / Nombre Comercial</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Ej: Contratistas del Norte S.A.S" 
              value={vendorForm.name} 
              onChange={e => setVendorForm({ ...vendorForm, name: e.target.value })} 
              required 
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">NIT o Cédula</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Ej: 900.123.456-1" 
                value={vendorForm.nit} 
                onChange={e => setVendorForm({ ...vendorForm, nit: e.target.value })} 
                required 
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Nivel de Riesgo del Servicio</label>
              <select 
                className="form-control" 
                value={vendorForm.riskLevel} 
                onChange={e => setVendorForm({ ...vendorForm, riskLevel: e.target.value })}
              >
                {riskLevels.map(rl => <option key={rl} value={rl}>{rl}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Descripción del Servicio / Insumo</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Ej: Mantenimiento de subestaciones, aseo..." 
              value={vendorForm.service} 
              onChange={e => setVendorForm({ ...vendorForm, service: e.target.value })} 
              required 
            />
          </div>

          <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-primary)' }}>
              <ShieldCheck size={14} /> Semáforo de Cumplimiento Legal (SST)
            </h4>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 500 }}>Planilla Seg. Social</label>
                <select 
                  className="form-control" 
                  value={vendorForm.socialSecurity} 
                  onChange={e => setVendorForm({ ...vendorForm, socialSecurity: e.target.value })}
                  style={{ fontSize: '0.8rem', padding: '0.5rem' }}
                >
                  {complianceStates.map(cs => <option key={cs} value={cs}>{cs}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 500 }}>Inducción HSEQ</label>
                <select 
                  className="form-control" 
                  value={vendorForm.induction} 
                  onChange={e => setVendorForm({ ...vendorForm, induction: e.target.value })}
                  style={{ fontSize: '0.8rem', padding: '0.5rem' }}
                >
                  <option value="Completado">Completado</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="No Requiere">No Requiere</option>
                </select>
              </div>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 500 }}>Certificación ARL</label>
                <select 
                  className="form-control" 
                  value={vendorForm.arlCertificate} 
                  onChange={e => setVendorForm({ ...vendorForm, arlCertificate: e.target.value })}
                  style={{ fontSize: '0.8rem', padding: '0.5rem' }}
                >
                  {complianceStates.map(cs => <option key={cs} value={cs}>{cs}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <button type="button" className="btn-secondary" onClick={() => setIsVendorModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn-primary">Guardar Proveedor</button>
          </div>
        </form>
      </Modal>

      {/* EVALUATION MODAL */}
      <Modal isOpen={isEvalModalOpen} onClose={() => setIsEvalModalOpen(false)} title={editingItem ? "Modificar Evaluación" : "Nueva Evaluación de Desempeño"}>
        <form onSubmit={handleEvalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Seleccione Proveedor</label>
              <select 
                className="form-control" 
                value={evalForm.vendorId} 
                onChange={e => setEvalForm({ ...evalForm, vendorId: e.target.value })}
                disabled={!!editingItem}
                required
              >
                {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Fecha de Evaluación</label>
              <input 
                type="date" 
                className="form-control" 
                value={evalForm.date} 
                onChange={e => setEvalForm({ ...evalForm, date: e.target.value })} 
                required 
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Evaluador HSEQ</label>
              <select 
                className="form-control" 
                value={evalForm.evaluator} 
                onChange={e => setEvalForm({ ...evalForm, evaluator: e.target.value })}
                required
              >
                <option value="">Seleccione Evaluador</option>
                {APP_USERS.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Fecha Próxima Reevaluación</label>
              <input 
                type="date" 
                className="form-control" 
                value={evalForm.nextEvalDate} 
                onChange={e => setEvalForm({ ...evalForm, nextEvalDate: e.target.value })} 
                required 
              />
            </div>
          </div>

          {/* SIMULATED FILE ATTACHMENT UPLOADER */}
          <div className="form-group">
            <label className="form-label">Subir Acta / Soporte de Evaluación Firmada</label>
            <div 
              style={{
                border: '2px dashed var(--border-color)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center',
                background: 'var(--bg-secondary)',
                cursor: 'pointer',
                position: 'relative'
              }}
              onClick={() => document.getElementById('file-upload-input').click()}
            >
              <input 
                id="file-upload-input" 
                type="file" 
                style={{ display: 'none' }} 
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setEvalForm(prev => ({ ...prev, fileName: file.name }));
                  }
                }} 
              />
              {evalForm.fileName ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{ color: 'var(--success)', fontWeight: 700, fontSize: '0.8rem' }}>✓ Soporte Adjunto con éxito</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 600 }}>{evalForm.fileName}</span>
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.68rem', marginTop: '0.4rem', border: '1px solid var(--border-color)' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setEvalForm(prev => ({ ...prev, fileName: '' }));
                    }}
                  >
                    Remover archivo
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
                  <UploadCloud size={24} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Seleccione o arrastre el archivo de evaluación (.pdf, .docx, .xlsx)</span>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Tamaño máximo recomendado: 10MB</div>
                </div>
              )}
            </div>
          </div>

          <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-primary)' }}>
              <Star size={14} /> Calificación de Desempeño (0 - 100)
            </h4>
            
            <div className="form-group" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                <label style={{ fontWeight: 500 }}>Calidad del Insumo / Servicio prestado</label>
                <strong>{evalForm.qualityScore}%</strong>
              </div>
              <input 
                type="range" 
                min="0" max="100" step="5"
                style={{ width: '100%', cursor: 'pointer' }}
                value={evalForm.qualityScore}
                onChange={e => setEvalForm({ ...evalForm, qualityScore: parseInt(e.target.value) })}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                <label style={{ fontWeight: 500 }}>Logística y Oportunidad en la Entrega</label>
                <strong>{evalForm.deliveryScore}%</strong>
              </div>
              <input 
                type="range" 
                min="0" max="100" step="5"
                style={{ width: '100%', cursor: 'pointer' }}
                value={evalForm.deliveryScore}
                onChange={e => setEvalForm({ ...evalForm, deliveryScore: parseInt(e.target.value) })}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                <label style={{ fontWeight: 500 }}>Seguridad y Cumplimiento HSEQ/SST</label>
                <strong>{evalForm.sstScore}%</strong>
              </div>
              <input 
                type="range" 
                min="0" max="100" step="5"
                style={{ width: '100%', cursor: 'pointer' }}
                value={evalForm.sstScore}
                onChange={e => setEvalForm({ ...evalForm, sstScore: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Observaciones y Retroalimentación</label>
            <textarea 
              className="form-control" 
              rows="3" 
              placeholder="Describa fortalezas, debilidades o compromisos correctivos acordados..." 
              value={evalForm.remarks} 
              onChange={e => setEvalForm({ ...evalForm, remarks: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <button type="button" className="btn-secondary" onClick={() => setIsEvalModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn-primary">{editingItem ? 'Actualizar' : 'Guardar Evaluación'}</button>
          </div>
        </form>
      </Modal>

      {/* CERTIFICADO DE HABILITACIÓN MODAL */}
      <Modal isOpen={isCertModalOpen} onClose={() => setIsCertModalOpen(false)} title="Certificado de Habilitación de Contratista">
        {activeHabilitation && selectedVendor && (
          <div style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Certificate Border Box */}
            <div style={{
              border: '6px double var(--success)',
              borderRadius: '8px',
              padding: '1.5rem',
              background: '#ffffff',
              color: '#0f172a',
              boxShadow: 'var(--shadow-lg)',
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}>
              
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid var(--success)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ margin: 0, color: '#16a34a', fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    SGI Enterprise Colombia
                  </h3>
                  <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                    Sistema de Gestión Integrado HSEQ (ISO 9001 / ISO 45001)
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="badge badge-success" style={{ background: '#16a34a', color: '#ffffff', fontWeight: 800, padding: '0.2rem 0.5rem', fontSize: '0.7rem', display: 'inline-block' }}>
                    APROBADO
                  </span>
                </div>
              </div>

              {/* Certificate Title */}
              <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                <h4 style={{ margin: 0, fontSize: '0.85rem', color: '#475569', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px' }}>
                  Constancia de Habilitación para Ejecución de Trabajos
                </h4>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0.35rem 0' }}>
                  {activeHabilitation.code}
                </div>
              </div>

              {/* Vendor & Activity details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.82rem', lineHeight: '1.45', background: '#f8fafc', padding: '0.85rem', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase' }}>Contratista Autorizado:</span>
                  <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{selectedVendor.name}</strong>
                  <span style={{ display: 'block', fontSize: '0.72rem', color: '#475569' }}>NIT: {selectedVendor.nit} | Nivel de Riesgo del Proveedor: <strong>{selectedVendor.riskLevel}</strong></span>
                </div>

                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.5rem' }}>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase' }}>Actividad / Servicio Habilitado:</span>
                  <strong style={{ fontSize: '0.88rem', color: '#1e293b' }}>{activeHabilitation.activityName}</strong>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.5rem', fontSize: '0.75rem' }}>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase' }}>Fecha de Emisión:</span>
                    <strong>{activeHabilitation.date}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase' }}>Vence el:</span>
                    <strong style={{ color: '#b91c1c' }}>{new Date(new Date(activeHabilitation.date + 'T00:00:00').getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}</strong>
                  </div>
                </div>
              </div>

              {/* Verified Documents */}
              <div style={{ marginBottom: '1.25rem' }}>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Requisitos de Seguridad Validados:</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.45rem', fontSize: '0.78rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#16a34a', fontWeight: 600 }}>
                    <CheckCircle size={14} /> ARL del Personal Cargado
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#16a34a', fontWeight: 600 }}>
                    <CheckCircle size={14} /> Documentos del Vehículo Vigentes
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#16a34a', fontWeight: 600 }}>
                    <CheckCircle size={14} /> Permisos de Trabajo Autorizados
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#16a34a', fontWeight: 600 }}>
                    <CheckCircle size={14} /> Inducción SST Aprobada
                  </div>
                </div>
              </div>

              {/* Footer credentials & Seal */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '1.5rem', borderTop: '1px dashed #cbd5e1', paddingTop: '0.75rem' }}>
                <div>
                  <div style={{ borderBottom: '1px solid #94a3b8', width: '120px', height: '35px' }}></div>
                  <span style={{ fontSize: '0.65rem', color: '#64748b', display: 'block', marginTop: '0.25rem' }}>Coordinador HSEQ / SIG</span>
                </div>

                {/* Dynamic QR Code Verification for the Habilitation */}
                <div>
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=65x65&data=${encodeURIComponent(`${window.location.origin}/vendors?verify=${activeHabilitation.code}`)}`} 
                    alt="QR Certificado" 
                    style={{ width: '65px', height: '65px', display: 'block', border: '1px solid #cbd5e1', padding: '2px' }}
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
