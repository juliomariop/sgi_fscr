import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, User, CreditCard, Briefcase, FileSignature, CheckCircle, RefreshCw } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export default function PublicAttendance({ isSimulator = false, simulatorTrainingId = null, onParticipantAdded = null }) {
  const { trainingId: routeTrainingId } = useParams();
  const trainingId = isSimulator ? simulatorTrainingId : routeTrainingId;
  const navigate = useNavigate();

  const [trainings, setTrainings] = useLocalStorage('sgi_trainings', []);
  const [training, setTraining] = useState(null);

  const [formData, setFormData] = useState({ name: '', document: '', area: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Canvas drawing state
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);

  // Load training details
  useEffect(() => {
    if (trainings.length > 0 && trainingId) {
      const found = trainings.find(t => String(t.id) === String(trainingId));
      if (found) {
        setTraining(found);
      } else {
        setError('Capacitación no encontrada.');
      }
    }
  }, [trainings, trainingId]);

  // Set up canvas drawing context
  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    // Support both mouse and touch events
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
    ctx.lineWidth = 2.5;
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
    if (!formData.name.trim() || !formData.document.trim() || !formData.area.trim()) {
      alert('Por favor complete todos los campos.');
      return;
    }
    if (!hasSigned) {
      alert('Por favor dibuje su firma de asistencia.');
      return;
    }

    const canvas = canvasRef.current;
    const signatureData = canvas.toDataURL('image/png');

    const newParticipant = {
      name: formData.name.trim(),
      document: formData.document.trim(),
      area: formData.area.trim(),
      signature: signatureData,
      registeredAt: new Date().toLocaleString()
    };

    // Update in local state / local storage
    const updatedTrainings = trainings.map(t => {
      if (String(t.id) === String(trainingId)) {
        const existingParticipants = t.participants || [];
        // Avoid duplicates by document
        if (existingParticipants.some(p => p.document === newParticipant.document)) {
          return t;
        }
        return { ...t, participants: [...existingParticipants, newParticipant] };
      }
      return t;
    });

    setTrainings(updatedTrainings);

    // Call callback for live simulation sync if provided
    if (onParticipantAdded) {
      onParticipantAdded(newParticipant);
    }

    setIsSubmitted(true);
  };

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', maxWidth: '400px', margin: '4rem auto' }} className="card">
        <h3 style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</h3>
        <p style={{ color: 'var(--text-secondary)' }}>El código QR puede ser incorrecto o la capacitación fue eliminada.</p>
      </div>
    );
  }

  if (!training) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Cargando detalles de la capacitación...</p>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="card fade-in" style={{ padding: '2rem', textAlign: 'center', maxWidth: '450px', margin: isSimulator ? '0' : '3rem auto', borderTop: '4px solid var(--success)' }}>
        <div style={{ display: 'inline-flex', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
          <CheckCircle size={48} />
        </div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>¡Registro Exitoso!</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          Tu firma y asistencia para la capacitación <strong>"{training.topic}"</strong> han sido registradas de forma conforme en el Sistema de Gestión Integrado (SGI).
        </p>
        {!isSimulator && (
          <div style={{ fontSize: '0.75rem', background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '6px', color: 'var(--text-muted)' }}>
            Esta es una demostración. Si estás escaneando desde un teléfono externo y quieres ver los cambios en la nube, asegúrate de utilizar el simulador o iniciar sesión en el mismo navegador.
          </div>
        )}
        {isSimulator && (
          <button 
            type="button" 
            className="btn-secondary" 
            style={{ width: '100%', fontSize: '0.8rem' }}
            onClick={() => {
              setIsSubmitted(false);
              setFormData({ name: '', document: '', area: '' });
              setHasSigned(false);
              setTimeout(() => clearCanvas(), 50);
            }}
          >
            Registrar Otro Asistente
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="card fade-in" style={{ padding: '1.25rem', maxWidth: '450px', margin: isSimulator ? '0' : '2rem auto', borderTop: '4px solid var(--accent-primary)', boxShadow: 'var(--shadow-md)' }}>
      {/* Header Info */}
      <div style={{ textAlign: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
        <span className="badge badge-info" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', marginBottom: '0.4rem' }}>
          <BookOpen size={11} /> Registro de Asistencia HSEQ
        </span>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: 'var(--text-primary)' }}>{training.topic}</h3>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          Facilitador: <strong>{training.trainer}</strong> | Fecha: <strong>{training.date}</strong>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="form-group">
          <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Nombre Completo</label>
          <div style={{ position: 'relative' }}>
            <User size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="form-control" 
              style={{ paddingLeft: '2.25rem', fontSize: '0.85rem' }} 
              value={formData.name} 
              onChange={e => setFormData({ ...formData, name: e.target.value })} 
              placeholder="Ej. Juan Pérez" 
              required 
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Documento de Identidad (Cédula)</label>
          <div style={{ position: 'relative' }}>
            <CreditCard size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="form-control" 
              style={{ paddingLeft: '2.25rem', fontSize: '0.85rem' }} 
              value={formData.document} 
              onChange={e => setFormData({ ...formData, document: e.target.value })} 
              placeholder="Ej. 102345678" 
              required 
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Área / Cargo</label>
          <div style={{ position: 'relative' }}>
            <Briefcase size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="form-control" 
              style={{ paddingLeft: '2.25rem', fontSize: '0.85rem' }} 
              value={formData.area} 
              onChange={e => setFormData({ ...formData, area: e.target.value })} 
              placeholder="Ej. Operaciones / Operario" 
              required 
            />
          </div>
        </div>

        {/* Signature Canvas drawing pad */}
        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
            <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px', margin: 0 }}>
              <FileSignature size={13} style={{ color: 'var(--accent-primary)' }} /> Firma del Participante
            </label>
            {hasSigned && (
              <button type="button" onClick={clearCanvas} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600 }}>
                Limpiar Firma
              </button>
            )}
          </div>
          
          <div style={{ border: '1px solid var(--border-color)', borderRadius: '6px', overflow: 'hidden', background: '#f8fafc' }}>
            <canvas
              ref={canvasRef}
              width={380}
              height={140}
              style={{ display: 'block', width: '100%', cursor: 'crosshair', touchAction: 'none' }}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
          </div>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
            Dibuje su firma con el dedo o mouse dentro del cuadro gris.
          </span>
        </div>

        <button 
          type="submit" 
          className="btn-primary" 
          style={{ width: '100%', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
        >
          <CheckCircle size={16} /> Confirmar Asistencia
        </button>
      </form>
    </div>
  );
}
