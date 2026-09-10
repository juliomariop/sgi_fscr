import React, { useState } from 'react';
import { 
  Download, Plus, Trash2, Edit2, Archive, Globe, TrendingUp, Users, Cpu, 
  Leaf, Scale, Home, UserCheck, Shuffle, MessageSquare, HardDrive, Compass,
  Search, Filter, AlertTriangle, Eye, Shield, CheckCircle
} from 'lucide-react';
import Modal from '../components/Modal';
import ExportModal from '../components/ExportModal';
import { downloadCSV } from '../utils/exportUtils';
import { useLocalStorage } from '../hooks/useLocalStorage';

// Metadata and settings for PESTAL / AMOFHIT categories
const categoriesConfig = {
  // External
  'Político': { icon: Globe, color: '#0ea5e9', desc: 'Estabilidad de gobierno, subsidios, políticas tributarias y comerciales.' },
  'Económico': { icon: TrendingUp, color: '#f59e0b', desc: 'Inflación, tasas de cambio, poder adquisitivo y tasas de interés.' },
  'Social': { icon: Users, color: '#10b981', desc: 'Tendencias demográficas, hábitos de consumo y aspectos culturales.' },
  'Tecnológico': { icon: Cpu, color: '#a855f7', desc: 'Innovaciones, patentes, software HSEQ e infraestructura digital.' },
  'Ambiental': { icon: Leaf, color: '#10b981', desc: 'Cambio climático, gestión de residuos y regulaciones ecológicas.' },
  'Legal': { icon: Scale, color: '#ef4444', desc: 'Normas laborales, decretos de salud/seguridad y licencias sectoriales.' },
  // Internal
  'Infraestructura': { icon: Home, color: '#64748b', desc: 'Plantas de producción, oficinas, herramientas y maquinaria.' },
  'Personal': { icon: UserCheck, color: '#ec4899', desc: 'Competencias, clima laboral, rotación y programas de capacitación.' },
  'Procesos': { icon: Shuffle, color: '#06b6d4', desc: 'Eficiencia de operaciones, cuellos de botella y control de calidad.' },
  'Comunicación': { icon: MessageSquare, color: '#d97706', desc: 'Canales internos, flujo de información y atención a quejas.' },
  'Tecnológico (Interno)': { icon: HardDrive, color: '#6366f1', desc: 'Seguridad informática, sistemas ERP y herramientas de red.' },
  'Estratégico': { icon: Compass, color: '#f43f5e', desc: 'Direccionamiento, liquidez financiera y cultura organizacional.' }
};

const externalCategories = ['Político', 'Económico', 'Social', 'Tecnológico', 'Ambiental', 'Legal'];
const internalCategories = ['Infraestructura', 'Personal', 'Procesos', 'Comunicación', 'Tecnológico (Interno)', 'Estratégico'];

export default function Pestal() {
  const [items, setItems] = useLocalStorage('sgi_pestal_items', [
    { id: 1, type: 'Político', factor: 'Lanzamiento de nuevas subvenciones para la digitalización industrial', opportunity: 'Postular la empresa para cofinanciar el nuevo ERP HSEQ', risk: 'Retrasos en la aprobación por burocracia gubernamental', importance: 'Alta' },
    { id: 2, type: 'Económico', factor: 'Alza de la tasa de inflación anual proyectada en 6.5%', opportunity: 'Negociación de contratos a largo plazo con proveedores clave', risk: 'Incremento en el costo de insumos de producción e inventario', importance: 'Alta' },
    { id: 3, type: 'Personal', factor: 'Aumento del índice de rotación en cargos operativos y soldadores', opportunity: 'Reestructurar el programa de incentivos no salariales y bienestar', risk: 'Pérdida de know-how y demoras en el cumplimiento de despachos', importance: 'Alta' },
    { id: 4, type: 'Legal', factor: 'Actualización regulatoria de los estándares mínimos del SG-SST', opportunity: 'Auditar previamente el sistema para garantizar cumplimiento anticipado', risk: 'Multas y sanciones administrativas por incumplir fechas límites de reporte', importance: 'Alta' },
    { id: 5, type: 'Ambiental', factor: 'Implementación de la ley de plásticos de un solo uso en empaques', opportunity: 'Desarrollar empaques compostables que diferencien la marca en el mercado', risk: 'Aumento del costo unitario del empaque primario reciclable', importance: 'Media' }
  ]);

  const [meta, setMeta] = useLocalStorage('sgi_pestal_meta', {
    version: 1,
    validity: '2026-12-31',
    lastUpdated: new Date().toISOString().split('T')[0]
  });

  const [pestalHistory, setPestalHistory] = useLocalStorage('sgi_pestal_history', [
    { version: '01', date: '2025-01-10', changes: 'Emisión Inicial de la Matriz de Contexto PESTAL.' }
  ]);

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

  const [activeTab, setActiveTab] = useState('externo'); // externo, interno, matriz
  const [searchTerm, setSearchTerm] = useState('');
  const [importanceFilter, setImportanceFilter] = useState('Todas');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    type: 'Político', factor: '', opportunity: '', risk: '', importance: 'Media'
  });

  const categories = [...externalCategories, ...internalCategories];

  const handleOpenModal = (item = null, forceCategory = null) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({
        type: forceCategory || (activeTab === 'interno' ? 'Infraestructura' : 'Político'),
        factor: '',
        opportunity: '',
        risk: '',
        importance: 'Media'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingItem) {
      setItems(items.map(i => i.id === editingItem.id ? { ...formData, id: i.id } : i));
    } else {
      setItems([...items, { ...formData, id: Date.now() }]);
    }
    setMeta({ ...meta, lastUpdated: new Date().toISOString().split('T')[0] });
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Está seguro de eliminar este factor del análisis de contexto?")) {
      setItems(items.filter(i => i.id !== id));
      setMeta({ ...meta, lastUpdated: new Date().toISOString().split('T')[0] });
    }
  };

  const handleExport = () => {
    const cols = [
      { header: 'Categoría', key: 'type' },
      { header: 'Factor de Análisis', key: 'factor' },
      { header: 'Oportunidad Identificada', key: 'opportunity' },
      { header: 'Riesgo / Amenaza Identificada', key: 'risk' },
      { header: 'Importancia', key: 'importance' }
    ];
    setExportConfig({
      isOpen: true,
      exportType: 'excel',
      title: 'Matriz PESTAL y Contexto Organizacional',
      code: 'SGI-MAT-CTX-001',
      version: `0${meta.version}`,
      validity: meta.validity,
      columns: cols,
      data: items,
      history: pestalHistory
    });
  };

  const handleNewVersion = () => {
    const changeReason = window.prompt("Ingrese el motivo del cambio para la versión 0" + meta.version + ":");
    if (!changeReason) {
      alert("Se requiere un motivo del cambio para archivar e incrementar la versión.");
      return;
    }

    const currentVersionStr = `0${meta.version}`;
    const nextVersionVal = meta.version + 1;

    const obsoleteDoc = {
      id: Date.now(),
      code: `CTX-V${meta.version}`,
      name: `Matriz Contexto Interno/Externo V${meta.version}`,
      type: 'Matriz',
      version: `V.${currentVersionStr}`,
      date: meta.lastUpdated,
      status: 'Obsoleto'
    };
    
    const existingDocs = JSON.parse(localStorage.getItem('sgi_docs') || '[]');
    existingDocs.push(obsoleteDoc);
    localStorage.setItem('sgi_docs', JSON.stringify(existingDocs));

    // Update history
    const newHistoryEntry = {
      version: currentVersionStr,
      date: meta.lastUpdated,
      changes: changeReason
    };
    setPestalHistory([...pestalHistory, newHistoryEntry]);

    setMeta({
      version: nextVersionVal,
      validity: meta.validity,
      lastUpdated: new Date().toISOString().split('T')[0]
    });
    alert(`Matriz V.${currentVersionStr} guardada con éxito en el histórico de Obsoletos. Iniciando versión 0${nextVersionVal}`);
  };

  const getImportanceBadge = (imp) => {
    if (imp === 'Alta') return 'badge-danger';
    if (imp === 'Media') return 'badge-warning';
    return 'badge-success';
  };

  // Filter logic
  const filteredItems = items.filter(item => {
    const matchesSearch = item.factor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.opportunity.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.risk.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.type.toLowerCase().includes(searchTerm.toLowerCase());
                          
    const matchesImportance = importanceFilter === 'Todas' || item.importance === importanceFilter;
    
    return matchesSearch && matchesImportance;
  });

  // Stats for the Dashboard Cards
  const totalFactors = items.length;
  const highFactors = items.filter(i => i.importance === 'Alta').length;
  const totalOpportunities = items.filter(i => i.opportunity.trim().length > 0).length;
  const totalRisks = items.filter(i => i.risk.trim().length > 0).length;

  return (
    <>
      {/* Header and metadata */}
      <div style={{display:'flex', justifyContent:'space-between', marginBottom:'1.5rem', alignItems:'center', flexWrap:'wrap', gap:'1rem'}}>
        <div>
          <p style={{color:'var(--text-secondary)', marginBottom:'0.25rem'}}>ISO 9001 / 14001 / 45001 - Cláusula 4.1</p>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.25rem' }}>Análisis de Contexto Externo e Interno</h2>
          <div style={{display:'flex', gap:'0.75rem', alignItems:'center', flexWrap: 'wrap'}}>
            <span className="badge badge-info" style={{ fontWeight: 600 }}>Diagnóstico Organizacional</span>
            <span style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>| <strong>Versión:</strong> V.{meta.version.toString().padStart(2, '0')}</span>
            <span style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>| <strong>Vencimiento:</strong> {meta.validity}</span>
            <span style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>| <strong>Último Cambio:</strong> {meta.lastUpdated}</span>
          </div>
        </div>
        <div style={{display:'flex', gap:'0.5rem', flexWrap:'wrap'}}>
          <button className="btn-secondary" onClick={handleExport}><Download size={16}/> Exportar Matriz</button>
          <button className="btn-secondary" onClick={handleNewVersion} style={{color:'var(--warning)', borderColor:'var(--warning)'}}><Archive size={16}/> Archivar Versión</button>
          <button className="btn-primary" onClick={() => handleOpenModal()}><Plus size={16}/> Nuevo Factor</button>
        </div>
      </div>

      {/* Summary KPI Panel */}
      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
          <div style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', padding: '0.6rem', borderRadius: '50%', display: 'flex' }}><Shield size={20} /></div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total Factores</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{totalFactors}</div>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '0.6rem', borderRadius: '50%', display: 'flex' }}><CheckCircle size={20} /></div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Oportunidades</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--success)' }}>{totalOpportunities}</div>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '0.6rem', borderRadius: '50%', display: 'flex' }}><AlertTriangle size={20} /></div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Riesgos y Amenazas</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--danger)' }}>{totalRisks}</div>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', padding: '0.6rem', borderRadius: '50%', display: 'flex' }}><AlertTriangle size={20} /></div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Importancia Crítica</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--warning)' }}>{highFactors}</div>
          </div>
        </div>
      </div>

      {/* Tabs and Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className={`btn-secondary ${activeTab === 'externo' ? 'active' : ''}`}
            style={{ border: 'none', background: activeTab === 'externo' ? 'rgba(14, 165, 233, 0.1)' : 'transparent', color: activeTab === 'externo' ? 'var(--accent-primary)' : 'var(--text-secondary)', fontWeight: 600 }}
            onClick={() => setActiveTab('externo')}
          >
            Contexto Externo (PESTAL)
          </button>
          <button 
            className={`btn-secondary ${activeTab === 'interno' ? 'active' : ''}`}
            style={{ border: 'none', background: activeTab === 'interno' ? 'rgba(236, 72, 153, 0.1)' : 'transparent', color: activeTab === 'interno' ? '#ec4899' : 'var(--text-secondary)', fontWeight: 600 }}
            onClick={() => setActiveTab('interno')}
          >
            Contexto Interno (Capacidades)
          </button>
          <button 
            className={`btn-secondary ${activeTab === 'matriz' ? 'active' : ''}`}
            style={{ border: 'none', background: activeTab === 'matriz' ? 'rgba(16, 185, 129, 0.1)' : 'transparent', color: activeTab === 'matriz' ? 'var(--success)' : 'var(--text-secondary)', fontWeight: 600 }}
            onClick={() => setActiveTab('matriz')}
          >
            Matriz Completa (Tabular)
          </button>
        </div>

        {/* Real-time search & filters */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '220px' }}>
            <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}><Search size={14} /></span>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Buscar factor..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.25rem', padding: '0.4rem 0.75rem 0.4rem 2.25rem', fontSize: '0.85rem' }}
            />
          </div>
          <select 
            className="form-control" 
            value={importanceFilter} 
            onChange={e => setImportanceFilter(e.target.value)}
            style={{ width: '150px', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
          >
            <option value="Todas">Importancia: Todas</option>
            <option value="Alta">Alta</option>
            <option value="Media">Media</option>
            <option value="Baja">Baja</option>
          </select>
        </div>
      </div>

      {/* DRILL DOWN / QUADRANTS VIEW */}
      {(activeTab === 'externo' || activeTab === 'interno') && (
        <div className="grid-3" style={{ gap: '1.25rem' }}>
          {(activeTab === 'externo' ? externalCategories : internalCategories).map(cat => {
            const catConfig = categoriesConfig[cat];
            const CatIcon = catConfig.icon;
            
            // Filter list items for this category
            const catItems = filteredItems.filter(i => i.type === cat);

            return (
              <div 
                key={cat} 
                className="card fade-in" 
                style={{ 
                  padding: '1.25rem', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  minHeight: '260px',
                  borderTop: `4px solid ${catConfig.color}`,
                  justifyContent: 'space-between',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.3s ease'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ display: 'inline-flex', padding: '0.4rem', borderRadius: '8px', background: `${catConfig.color}15`, color: catConfig.color }}>
                        <CatIcon size={18} />
                      </span>
                      <h4 style={{ fontWeight: 600, fontSize: '1rem', margin: 0 }}>{cat}</h4>
                    </div>
                    <button 
                      className="btn-icon" 
                      style={{ padding: '0.2rem', borderRadius: '50%', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                      onClick={() => handleOpenModal(null, cat)}
                      title={`Añadir factor a ${cat}`}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: '1.3', marginBottom: '1rem', minHeight: '30px' }}>{catConfig.desc}</p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
                    {catItems.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '1.5rem 0', color: 'var(--text-muted)', fontSize: '0.78rem', border: '1px dashed var(--border-color)', borderRadius: '6px' }}>
                        Sin registros
                      </div>
                    ) : (
                      catItems.map(item => (
                        <div 
                          key={item.id} 
                          style={{ 
                            background: 'var(--bg-primary)', 
                            border: '1px solid var(--border-color)', 
                            borderRadius: '6px', 
                            padding: '0.6rem 0.75rem',
                            position: 'relative'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem', gap: '0.5rem' }}>
                            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: '1.3' }}>{item.factor}</div>
                            <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
                              <button className="btn-icon" style={{ padding: '0.15rem', color: 'var(--text-muted)' }} onClick={() => handleOpenModal(item)}><Edit2 size={10}/></button>
                              <button className="btn-icon" style={{ padding: '0.15rem', color: 'var(--danger)' }} onClick={() => handleDelete(item.id)}><Trash2 size={10}/></button>
                            </div>
                          </div>
                          
                          {item.opportunity && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.15rem' }}>
                              <span style={{ color: 'var(--success)', fontWeight: 600 }}>Oportunidad:</span> {item.opportunity}
                            </div>
                          )}
                          {item.risk && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                              <span style={{ color: 'var(--danger)', fontWeight: 600 }}>Riesgo:</span> {item.risk}
                            </div>
                          )}
                          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <span className={`badge ${getImportanceBadge(item.importance)}`} style={{ fontSize: '0.62rem', padding: '0.15rem 0.4rem' }}>
                              Importancia {item.importance}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MATRIX TABLE TABULAR VIEW */}
      {activeTab === 'matriz' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Origen / Categoría</th>
                  <th>Factor Crítico Analizado</th>
                  <th>Oportunidad de Mejora</th>
                  <th>Amenaza / Riesgo HSEQ</th>
                  <th>Importancia</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                      No se encontraron factores que coincidan con la búsqueda o filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map(item => {
                    const isExt = externalCategories.includes(item.type);
                    const catConfig = categoriesConfig[item.type] || { color: '#64748b' };
                    return (
                      <tr key={item.id}>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: isExt ? 'var(--accent-primary)' : '#ec4899' }}>
                              {isExt ? 'Externo' : 'Interno'}
                            </span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600, fontSize: '0.85rem' }}>
                              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: catConfig.color }} />
                              {item.type}
                            </span>
                          </div>
                        </td>
                        <td style={{ fontWeight: 500, fontSize: '0.88rem', maxWidth: '250px' }}>{item.factor}</td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '250px' }}>{item.opportunity || 'N/A'}</td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '250px' }}>{item.risk || 'N/A'}</td>
                        <td>
                          <span className={`badge ${getImportanceBadge(item.importance)}`}>
                            {item.importance}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.25rem' }}>
                            <button className="btn-icon" style={{ padding: '0.25rem' }} onClick={() => handleOpenModal(item)}><Edit2 size={14} /></button>
                            <button className="btn-icon" style={{ padding: '0.25rem', color: 'var(--danger)' }} onClick={() => handleDelete(item.id)}><Trash2 size={14} /></button>
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

      {/* FORM MODAL */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingItem ? "Modificar Factor de Contexto" : "Añadir Factor al Diagnóstico"}
      >
        <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
          <div className="form-group">
            <label className="form-label">Categoría o Dimensión</label>
            <select className="form-control" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} required>
              <optgroup label="Factores Externos (PESTAL)">
                {externalCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </optgroup>
              <optgroup label="Factores Internos (Capacidades)">
                {internalCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </optgroup>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Factor Identificado</label>
            <input 
              type="text" 
              className="form-control" 
              value={formData.factor} 
              onChange={e => setFormData({...formData, factor: e.target.value})} 
              required 
              placeholder="Ej: Cambio de normatividad laboral, baja liquidez en caja, etc..." 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Oportunidad Potencial</label>
            <textarea 
              className="form-control" 
              value={formData.opportunity} 
              onChange={e => setFormData({...formData, opportunity: e.target.value})} 
              rows="2"
              placeholder="Describa el beneficio o mejora que se puede estructurar..."
            ></textarea>
          </div>
          <div className="form-group">
            <label className="form-label">Amenaza / Riesgo Asociado</label>
            <textarea 
              className="form-control" 
              value={formData.risk} 
              onChange={e => setFormData({...formData, risk: e.target.value})} 
              rows="2"
              placeholder="Describa el peligro, consecuencia o desviación potencial HSEQ..."
            ></textarea>
          </div>
          <div className="form-group">
            <label className="form-label">Prioridad / Nivel de Importancia</label>
            <select className="form-control" value={formData.importance} onChange={e => setFormData({...formData, importance: e.target.value})} required>
              <option value="Alta">Alta (Acción prioritaria)</option>
              <option value="Media">Media (Monitoreo regular)</option>
              <option value="Baja">Baja (Registro y control)</option>
            </select>
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
      />
    </>
  );
}
