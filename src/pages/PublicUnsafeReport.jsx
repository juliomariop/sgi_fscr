import React, { useState, useRef, useEffect } from 'react';
import { ShieldAlert, CheckCircle2, ShieldAlert as UnsafeIcon, Smartphone, Camera, Brush, RefreshCw, ArrowLeft } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const DEFAULT_PARAMS = {
  projectTypes: ["Eléctrico", "Telecomunicaciones", "Civil", "Ambiental", "Industrial"],
  clients: ["Consorcio Vial del Norte", "Ecopetrol", "Claro", "Movistar"],
  cities: ["Bogotá", "Medellín", "Cali", "Barranquilla", "Bucaramanga"]
};

export default function PublicUnsafeReport() {
  const [globalParams] = useLocalStorage('sgi_global_parameters', DEFAULT_PARAMS);
  const projectTypes = globalParams?.projectTypes || DEFAULT_PARAMS.projectTypes;
  const clients = globalParams?.clients || DEFAULT_PARAMS.clients;
  const cities = globalParams?.cities || DEFAULT_PARAMS.cities;

  const [reports, setReports] = useLocalStorage('sgi_unsafe_reports', []);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const originalStyle = document.body.style.overflow;
    document.body.style.overflow = 'auto';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  const [formData, setFormData] = useState({
    category: 'Condición Insegura',
    projectType: projectTypes[0] || 'Eléctrico',
    client: clients[0] || '',
    city: cities[0] || '',
    reporterName: '',
    reporterTitle: '',
    reporterType: 'Empleado directo',
    area: '',
    description: '',
    consequences: '',
    photoName: '',
    suggestedCorrectiveAction: '',
    severity: 'Media'
  });

  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Initialize canvas with basic drawing settings
  useEffect(() => {
    if (submitted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#0284c7'; // Nice blue signature color
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
  }, [submitted]);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    
    // Support touch or mouse
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
    e.preventDefault();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, photoName: file.name }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Get signature data
    const canvas = canvasRef.current;
    let signatureData = null;
    if (canvas) {
      signatureData = canvas.toDataURL(); // Base64
    }

    const newReport = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ...formData,
      signature: signatureData,
      status: 'Abierto', // Abierto, En Proceso, Resuelto
      actions: []
    };

    setReports([newReport, ...reports]);
    setSubmitted(true);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at top, #0f172a 0%, #020617 100%)',
      padding: '1.5rem',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#f8fafc'
    }}>
      {/* Smartphone Shell Frame */}
      <div style={{
        width: '100%',
        maxWidth: '430px',
        background: 'rgba(30, 41, 59, 0.7)',
        borderRadius: '40px',
        border: '6px solid #334155',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        backdropFilter: 'blur(20px)'
      }}>
        
        {/* Device Notch */}
        <div style={{
          width: '140px',
          height: '24px',
          background: '#334155',
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          borderBottomLeftRadius: '16px',
          borderBottomRightRadius: '16px',
          zIndex: 10,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{ width: '40px', height: '4px', background: '#1e293b', borderRadius: '2px' }}></div>
        </div>

        {/* Header Content */}
        <div style={{
          padding: '2rem 1.5rem 1.25rem',
          background: 'linear-gradient(to bottom, #0f172a, rgba(15, 23, 42, 0.8))',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'inline-flex',
            padding: '0.5rem',
            background: 'rgba(239, 68, 68, 0.1)',
            borderRadius: '50%',
            marginBottom: '0.5rem',
            marginTop: '0.5rem'
          }}>
            <ShieldAlert size={28} color="#ef4444" />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, letterSpacing: '-0.025em' }}>SGI Reporte en Campo</h2>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '4px 0 0' }}>Reporte Exprés de Actos y Condiciones Inseguras</p>
        </div>

        {/* Content Body */}
        <div style={{
          padding: '1.5rem',
          flex: 1,
          overflowY: 'auto',
          maxHeight: '70vh'
        }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <div style={{
                display: 'inline-flex',
                padding: '0.75rem',
                background: 'rgba(16, 185, 129, 0.1)',
                borderRadius: '50%',
                marginBottom: '1.25rem'
              }}>
                <CheckCircle2 size={48} color="#10b981" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.5rem' }}>¡Reporte Registrado!</h3>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.5rem' }}>
                Tu reporte ha sido enviado de forma segura al equipo HSEQ del Sistema de Gestión Integrado para su investigación y control oportuno.
              </p>
              
              <button 
                onClick={() => {
                  setSubmitted(false);
                  setFormData({
                    category: 'Condición Insegura',
                    reporterName: '',
                    reporterTitle: '',
                    reporterType: 'Empleado directo',
                    area: '',
                    description: '',
                    consequences: '',
                    photoName: '',
                    suggestedCorrectiveAction: '',
                    severity: 'Media'
                  });
                }}
                className="btn-primary"
                style={{
                  width: '100%',
                  marginTop: '2rem',
                  padding: '0.75rem',
                  borderRadius: '12px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  background: '#0ea5e9',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                <RefreshCw size={16} /> Hacer otro reporte
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* SECCIÓN I: INFORMACIÓN GENERAL */}
              <div style={{ border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '0.85rem', background: 'rgba(30, 41, 59, 0.2)' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', display: 'block', marginBottom: '0.6rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '0.2rem' }}>
                  I. Información General
                </span>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {/* Fecha de Reporte */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8' }}>Fecha de Reporte</label>
                    <input
                      type="date"
                      value={new Date().toISOString().split('T')[0]}
                      disabled
                      style={{
                        background: 'rgba(15, 23, 42, 0.6)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: '8px',
                        padding: '0.5rem',
                        color: '#94a3b8',
                        fontSize: '0.8rem',
                        cursor: 'not-allowed'
                      }}
                    />
                  </div>

                  {/* Tipo de Proyecto */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8' }}>Tipo de Proyecto *</label>
                    <select
                      value={formData.projectType || ''}
                      onChange={e => setFormData({ ...formData, projectType: e.target.value })}
                      style={{
                        background: '#0f172a',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        padding: '0.5rem 0.65rem',
                        color: 'white',
                        fontSize: '0.8rem'
                      }}
                      required
                    >
                      {projectTypes.map(pt => (
                        <option key={pt} value={pt}>{pt}</option>
                      ))}
                    </select>
                  </div>

                  {/* Cliente */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8' }}>Cliente *</label>
                    <input
                      type="text"
                      placeholder="Seleccione o escriba cliente..."
                      value={formData.client || ''}
                      onChange={e => setFormData({ ...formData, client: e.target.value })}
                      list="public-unsafe-clients"
                      style={{
                        background: '#0f172a',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        padding: '0.5rem 0.65rem',
                        color: 'white',
                        fontSize: '0.8rem'
                      }}
                      required
                    />
                    <datalist id="public-unsafe-clients">
                      {clients.map(c => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  </div>

                  {/* Ciudad / Sede */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8' }}>Ciudad / Sede *</label>
                    <input
                      type="text"
                      placeholder="Seleccione o escriba ciudad..."
                      value={formData.city || ''}
                      onChange={e => setFormData({ ...formData, city: e.target.value })}
                      list="public-unsafe-cities"
                      style={{
                        background: '#0f172a',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        padding: '0.5rem 0.65rem',
                        color: 'white',
                        fontSize: '0.8rem'
                      }}
                      required
                    />
                    <datalist id="public-unsafe-cities">
                      {cities.map(ct => (
                        <option key={ct} value={ct} />
                      ))}
                    </datalist>
                  </div>

                  {/* Nombre de quien reporta */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8' }}>Nombre de quien reporta</label>
                    <input
                      type="text"
                      placeholder="Nombre completo (Opcional)"
                      value={formData.reporterName}
                      onChange={e => setFormData({ ...formData, reporterName: e.target.value })}
                      style={{
                        background: '#0f172a',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        padding: '0.5rem 0.65rem',
                        color: 'white',
                        fontSize: '0.8rem'
                      }}
                    />
                  </div>

                  {/* Cargo / Área / Departamento */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8' }}>Cargo / Área / Departamento</label>
                    <input
                      type="text"
                      placeholder="Ej: Auxiliar de bodega, Supervisor..."
                      value={formData.reporterTitle}
                      onChange={e => setFormData({ ...formData, reporterTitle: e.target.value })}
                      style={{
                        background: '#0f172a',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        padding: '0.5rem 0.65rem',
                        color: 'white',
                        fontSize: '0.8rem'
                      }}
                    />
                  </div>

                  {/* Tipo de Persona */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8' }}>Tipo de Persona</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.15rem' }}>
                      {['Empleado directo', 'Contratista', 'Visitante'].map(type => (
                        <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#cbd5e1', cursor: 'pointer' }}>
                          <input
                            type="radio"
                            name="reporterType"
                            checked={formData.reporterType === type}
                            onChange={() => setFormData({ ...formData, reporterType: type })}
                            style={{ accentColor: '#38bdf8' }}
                          />
                          {type}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECCIÓN II: CLASIFICACIÓN DEL PELIGRO */}
              <div style={{ border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '0.85rem', background: 'rgba(30, 41, 59, 0.2)' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', display: 'block', marginBottom: '0.6rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '0.2rem' }}>
                  II. Clasificación del Peligro
                </span>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '0.6rem', borderRadius: '8px', border: formData.category === 'Condición Insegura' ? '2px solid #f59e0b' : '1px solid #334155', background: formData.category === 'Condición Insegura' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(30, 41, 59, 0.3)', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: formData.category === 'Condición Insegura' ? '#f59e0b' : '#cbd5e1' }}>
                      <input
                        type="radio"
                        name="hazardCategory"
                        checked={formData.category === 'Condición Insegura'}
                        onChange={() => setFormData({ ...formData, category: 'Condición Insegura' })}
                        style={{ accentColor: '#f59e0b' }}
                      />
                      Condición Insegura
                    </div>
                    <span style={{ fontSize: '0.68rem', color: '#94a3b8', paddingLeft: '20px', lineHeight: '1.25' }}>
                      Elementos, equipos o instalaciones en mal estado (ej. cables expuestos, pisos resbaladizos).
                    </span>
                  </label>

                  <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '0.6rem', borderRadius: '8px', border: formData.category === 'Acto Inseguro' ? '2px solid #ef4444' : '1px solid #334155', background: formData.category === 'Acto Inseguro' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(30, 41, 59, 0.3)', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: formData.category === 'Acto Inseguro' ? '#ef4444' : '#cbd5e1' }}>
                      <input
                        type="radio"
                        name="hazardCategory"
                        checked={formData.category === 'Acto Inseguro'}
                        onChange={() => setFormData({ ...formData, category: 'Acto Inseguro' })}
                        style={{ accentColor: '#ef4444' }}
                      />
                      Acto Inseguro
                    </div>
                    <span style={{ fontSize: '0.68rem', color: '#94a3b8', paddingLeft: '20px', lineHeight: '1.25' }}>
                      Acción humana inadecuada por parte de un trabajador (ej. no usar EPP, operar sin autorización).
                    </span>
                  </label>

                  {/* Nivel de Riesgo */}
                  <div style={{ marginTop: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '0.6rem' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '0.4rem' }}>Nivel de Riesgo Estimado</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                      {[
                        { val: 'Bajo', label: 'Bajo', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
                        { val: 'Medio', label: 'Medio', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
                        { val: 'Alto', label: 'Alto', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' },
                        { val: 'Crítico', label: 'Crítico', color: '#d946ef', bg: 'rgba(217, 70, 239, 0.15)' }
                      ].map(level => {
                        const isSelected = formData.severity === level.val;
                        return (
                          <button
                            key={level.val}
                            type="button"
                            onClick={() => setFormData({ ...formData, severity: level.val })}
                            style={{
                              padding: '0.45rem',
                              borderRadius: '8px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              border: isSelected ? `2px solid ${level.color}` : '1px solid #334155',
                              background: isSelected ? level.bg : 'rgba(30, 41, 59, 0.3)',
                              color: isSelected ? level.color : '#cbd5e1',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              textAlign: 'center'
                            }}
                          >
                            {level.val}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </div>

              {/* SECCIÓN III: LOCALIZACIÓN Y DESCRIPCIÓN */}
              <div style={{ border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '0.85rem', background: 'rgba(30, 41, 59, 0.2)' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', display: 'block', marginBottom: '0.6rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '0.2rem' }}>
                  III. Localización y Descripción
                </span>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {/* Ubicación Exacta */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8' }}>Ubicación exacta</label>
                    <input
                      type="text"
                      placeholder="Ej: Bodega principal, pasillo del 2do piso..."
                      value={formData.area}
                      onChange={e => setFormData({ ...formData, area: e.target.value })}
                      style={{
                        background: '#0f172a',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        padding: '0.5rem 0.65rem',
                        color: 'white',
                        fontSize: '0.8rem'
                      }}
                      required
                    />
                  </div>

                  {/* Descripción Detallada */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8' }}>Descripción detallada de la situación</label>
                    <textarea
                      placeholder="¿Qué se observó exactamente? Sea claro y objetivo..."
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      rows="3"
                      style={{
                        background: '#0f172a',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        padding: '0.5rem 0.65rem',
                        color: 'white',
                        fontSize: '0.8rem',
                        resize: 'none',
                        lineHeight: '1.35'
                      }}
                      required
                    />
                  </div>

                  {/* Posibles Consecuencias */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8' }}>Posibles consecuencias o daños esperados</label>
                    <textarea
                      placeholder="¿Qué podría pasar si no se corrige la situación?"
                      value={formData.consequences}
                      onChange={e => setFormData({ ...formData, consequences: e.target.value })}
                      rows="2"
                      style={{
                        background: '#0f172a',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        padding: '0.5rem 0.65rem',
                        color: 'white',
                        fontSize: '0.8rem',
                        resize: 'none',
                        lineHeight: '1.35'
                      }}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* SECCIÓN IV: EVIDENCIA Y RECOMENDACIONES (OPCIONAL) */}
              <div style={{ border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '0.85rem', background: 'rgba(30, 41, 59, 0.2)' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#a855f7', textTransform: 'uppercase', display: 'block', marginBottom: '0.6rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '0.2rem' }}>
                  IV. Evidencia y Recomendaciones (Opcional)
                </span>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {/* Soporte Fotográfico */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8' }}>Soporte fotográfico / video</label>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      background: '#0f172a',
                      padding: '0.4rem 0.6rem',
                      borderRadius: '8px',
                      border: '1px dashed #475569'
                    }}>
                      <input
                        type="file"
                        id="unsafe-photo-file"
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                        accept="image/*,video/*"
                      />
                      <label htmlFor="unsafe-photo-file" style={{
                        cursor: 'pointer',
                        padding: '0.3rem 0.6rem',
                        background: '#334155',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontWeight: 700,
                        color: 'white'
                      }}>
                        <Camera size={12} /> Adjuntar Archivo
                      </label>
                      <span style={{ fontSize: '0.68rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '170px' }}>
                        {formData.photoName || 'Sin archivo seleccionado'}
                      </span>
                    </div>
                  </div>

                  {/* Acción correctiva sugerida */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8' }}>Acción correctiva inmediata sugerida</label>
                    <textarea
                      placeholder="¿Qué acción recomienda para mitigar el peligro de inmediato?"
                      value={formData.suggestedCorrectiveAction}
                      onChange={e => setFormData({ ...formData, suggestedCorrectiveAction: e.target.value })}
                      rows="2"
                      style={{
                        background: '#0f172a',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        padding: '0.5rem 0.65rem',
                        color: 'white',
                        fontSize: '0.8rem',
                        resize: 'none',
                        lineHeight: '1.35'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Signature Canvas */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Brush size={12} /> Firma Digital de Validación
                  </label>
                  <button
                    type="button"
                    onClick={clearCanvas}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ef4444',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Borrar
                  </button>
                </div>
                <canvas
                  ref={canvasRef}
                  width="360"
                  height="120"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  style={{
                    background: 'white',
                    borderRadius: '10px',
                    border: '1px solid #475569',
                    width: '100%',
                    height: '120px',
                    touchAction: 'none',
                    cursor: 'crosshair'
                  }}
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                style={{
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.75rem',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  marginTop: '0.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.4)'
                }}
              >
                Enviar Reporte HSEQ
              </button>

            </form>
          )}
        </div>

        {/* Footer info */}
        <div style={{
          padding: '1rem',
          textAlign: 'center',
          fontSize: '0.65rem',
          color: '#64748b',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          background: 'rgba(15, 23, 42, 0.4)'
        }}>
          Cumple con ISO 45001 • SGI Enterprise Colombia
        </div>
      </div>
    </div>
  );
}
