import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, User, CreditCard, Briefcase, FileSignature, CheckCircle, RefreshCw, MapPin } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { logActivity } from '../utils/activityLogger';

const DEFAULT_PARAMS = {
  projectTypes: ["Eléctrico", "Telecomunicaciones", "Civil", "Ambiental", "Industrial"],
  clients: ["Consorcio Vial del Norte", "Ecopetrol", "Claro", "Movistar"],
  cities: ["Bogotá", "Medellín", "Cali", "Barranquilla", "Bucaramanga"]
};

export default function PublicInductionAttendance() {
  const navigate = useNavigate();
  const [records, setRecords] = useLocalStorage('sgi_inducciones_records', []);

  useEffect(() => {
    const originalStyle = document.body.style.overflow;
    document.body.style.overflow = 'auto';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  const [globalParams] = useLocalStorage('sgi_global_parameters', DEFAULT_PARAMS);
  const projectTypes = globalParams?.projectTypes || DEFAULT_PARAMS.projectTypes;
  const cities = globalParams?.cities || DEFAULT_PARAMS.cities;

  const [formData, setFormData] = useState({
    name: '',
    document: '',
    type: 'Contratista', // Empleado, Contratista, Proveedor, Visitante
    project: '', // dynamically initialized
    city: '',
    cargo: ''
  });

  useEffect(() => {
    if (projectTypes && projectTypes.length > 0 && !formData.project) {
      setFormData(prev => ({ ...prev, project: projectTypes[0] }));
    }
  }, [projectTypes, formData.project]);

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Canvas drawing state
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);

  // Set up canvas drawing coordinates
  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const coords = getCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const coords = getCoordinates(e);

    ctx.lineTo(coords.x, coords.y);
    ctx.strokeStyle = '#0284c7'; // Nice HSEQ blue
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    setHasSigned(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.document.trim() || !formData.city.trim() || !formData.cargo.trim()) {
      alert('Por favor complete todos los campos obligatorios.');
      return;
    }
    if (!hasSigned) {
      alert('Por favor realice su firma manuscrita para registrar la asistencia.');
      return;
    }

    const canvas = canvasRef.current;
    const signatureData = canvas.toDataURL('image/png');

    // Create the induction record
    const newRecord = {
      id: Date.now(),
      name: formData.name.trim(),
      document: formData.document.trim(),
      type: formData.type,
      project: formData.type === 'Empleado' ? formData.project : null,
      city: formData.city.trim(),
      cargo: formData.cargo.trim(),
      signature: signatureData,
      date: new Date().toLocaleString(),
      reinductionDate: '',
      evalType: '',
      score: 0,
      passed: false,
      certCode: ''
    };

    // Save record to local storage
    setRecords([newRecord, ...records]);
    setIsSubmitted(true);

    // Log the attendance registration activity
    logActivity(
      { email: 'anonimo@colaborador.com', name: formData.name.trim() },
      "Registro de Asistencia de Inducción",
      `Registro de asistencia para inducción del colaborador: ${formData.name.trim()} (${formData.document.trim()}), Tipo: ${formData.type}, Ciudad: ${formData.city.trim()}`
    );
  };

  if (isSubmitted) {
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
        alignItems: 'center', 
        padding: '2rem 1rem', 
        background: 'var(--bg-primary)'
      }}>
        <div className="card fade-in" style={{ maxWidth: '480px', width: '100%', padding: '2rem', textAlign: 'center', boxShadow: 'var(--shadow-xl)', borderTop: '4px solid var(--success)' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.1)',
            color: 'var(--success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto'
          }}>
            <CheckCircle size={36} />
          </div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>¡Asistencia Registrada!</h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '1.5rem' }}>
            Hola <strong>{formData.name}</strong>, tu asistencia a la inducción ha sido guardada en la base de datos de HSEQ. Ahora debes realizar la evaluación correspondiente.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button 
              type="button" 
              className="btn-primary" 
              onClick={() => navigate(`/induccion-evaluacion?doc=${formData.document}`)}
              style={{ width: '100%', padding: '0.6rem', fontSize: '0.85rem' }}
            >
              Iniciar Evaluación de Inducción
            </button>
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={() => {
                setIsSubmitted(false);
                setFormData({
                  name: '',
                  document: '',
                  type: 'Contratista',
                  project: projectTypes[0] || 'Eléctrico',
                  city: '',
                  cargo: ''
                });
                setHasSigned(false);
              }}
              style={{ width: '100%', padding: '0.6rem', fontSize: '0.85rem' }}
            >
              Registrar otra persona
            </button>
          </div>
        </div>
      </div>
    );
  }

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
      padding: '2rem 1rem', 
      background: 'var(--bg-primary)'
    }}>
      <div className="card fade-in" style={{ maxWidth: '520px', width: '100%', padding: '1.5rem', boxShadow: 'var(--shadow-xl)', borderTop: '4px solid var(--accent-primary)' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '0.25rem' }}>
            <BookOpen size={20} style={{ color: 'var(--accent-primary)' }} />
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>Registro de Asistencia</h3>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Inducción y Reinducción - SGI Enterprise</span>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <User size={14} /> Nombre Completo
            </label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Ej. Juan Andrés Pérez" 
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CreditCard size={14} /> Documento de Identidad (Cédula)
            </label>
            <input 
              type="number" 
              className="form-control" 
              placeholder="Ej. 1020304050" 
              value={formData.document}
              onChange={e => setFormData({ ...formData, document: e.target.value })}
              required 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Tipo de Personal</label>
              <select 
                className="form-control"
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="Empleado">Empleado Directo</option>
                <option value="Contratista">Contratista</option>
                <option value="Proveedor">Proveedor</option>
                <option value="Visitante">Visitante</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={14} /> Ciudad de Trabajo
              </label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Ej. Bogotá, Medellín..." 
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                list="cities-list"
                required 
              />
              <datalist id="cities-list">
                {cities.map(c => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Conditional Project Selection for Employees */}
          {formData.type === 'Empleado' && (
            <div className="form-group fade-in" style={{ background: 'var(--bg-secondary)', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <label className="form-label">Seleccione el Proyecto</label>
              <select 
                className="form-control"
                value={formData.project}
                onChange={e => setFormData({ ...formData, project: e.target.value })}
              >
                {projectTypes.map(pt => (
                  <option key={pt} value={pt}>{pt}</option>
                ))}
                <option value="Ninguno / Admin">Ninguno / Administrativo</option>
              </select>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Briefcase size={14} /> Cargo / Ocupación
            </label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Ej. Liniero, Ingeniero, Auxiliar..." 
              value={formData.cargo}
              onChange={e => setFormData({ ...formData, cargo: e.target.value })}
              required 
            />
          </div>

          {/* SIGNATURE CANVAS */}
          <div className="form-group" style={{ marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px', margin: 0 }}>
                <FileSignature size={14} /> Firma Digital Manuscrita
              </label>
              <button 
                type="button" 
                onClick={clearCanvas} 
                style={{
                  fontSize: '0.68rem',
                  padding: '0.15rem 0.45rem',
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: 'var(--danger)',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                <RefreshCw size={10} style={{ marginRight: '2px' }} /> Limpiar
              </button>
            </div>
            
            <div style={{ border: '2px dashed var(--border-color)', borderRadius: '6px', background: 'var(--bg-secondary)', overflow: 'hidden' }}>
              <canvas 
                ref={canvasRef}
                width={480}
                height={120}
                style={{ width: '100%', height: '120px', display: 'block', cursor: 'crosshair', touchAction: 'none' }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
            </div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.15rem' }}>
              Dibuje su firma con el dedo (táctil) o con el mouse dentro del recuadro.
            </span>
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: '100%', padding: '0.65rem', fontSize: '0.85rem', marginTop: '0.5rem' }}
          >
            Registrar Asistencia e Inducción
          </button>

        </form>

      </div>
    </div>
  );
}
