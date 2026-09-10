import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, User, CreditCard, Briefcase, FileSignature, CheckCircle, Award } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export default function PublicCommitteeAttendance() {
  const { meetingId } = useParams();
  const navigate = useNavigate();

  const [committees, setCommittees] = useLocalStorage('sgi_committees', []);
  const [meeting, setMeeting] = useState(null);

  const [formData, setFormData] = useState({ name: '', document: '', jobTitle: '', committeeRole: 'Vocal' });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Canvas drawing state
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);

  // Load meeting details
  useEffect(() => {
    if (committees.length > 0 && meetingId) {
      const found = committees.find(c => String(c.id) === String(meetingId));
      if (found) {
        setMeeting(found);
      } else {
        setError('Reunión de comité no encontrada.');
      }
    }
  }, [committees, meetingId]);

  // Set up canvas drawing context coordinates
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
    if (!formData.name.trim() || !formData.document.trim() || !formData.jobTitle.trim()) {
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
      id: Date.now(),
      name: formData.name.trim(),
      document: formData.document.trim(),
      jobTitle: formData.jobTitle.trim(),
      committeeRole: formData.committeeRole,
      signature: signatureData,
      registeredAt: new Date().toLocaleString()
    };

    // Update in localStorage
    const updatedCommittees = committees.map(c => {
      if (String(c.id) === String(meetingId)) {
        const existingParticipants = c.participantsList || [];
        // Avoid duplicates by document
        if (existingParticipants.some(p => p.document === newParticipant.document)) {
          return c;
        }
        return { ...c, participantsList: [...existingParticipants, newParticipant] };
      }
      return c;
    });

    setCommittees(updatedCommittees);
    setIsSubmitted(true);
  };

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', maxWidth: '400px', margin: '4rem auto' }} className="card">
        <h3 style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</h3>
        <p style={{ color: 'var(--text-secondary)' }}>El código QR puede ser incorrecto o la reunión fue eliminada.</p>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Cargando detalles de la reunión...</p>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="card fade-in" style={{ padding: '2rem', textAlign: 'center', maxWidth: '450px', margin: '3rem auto', borderTop: '4px solid var(--success)' }}>
        <div style={{ display: 'inline-flex', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
          <CheckCircle size={48} />
        </div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>¡Firma Registrada!</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          Tu firma de asistencia para la reunión <strong>"{meeting.actNumber}"</strong> ha sido registrada con éxito en el Sistema de Gestión Integrado (SGI).
        </p>
        <div style={{ fontSize: '0.75rem', background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '6px', color: 'var(--text-muted)' }}>
          Ya puedes cerrar esta ventana del navegador. El administrador visualizará tu registro al instante.
        </div>
      </div>
    );
  }

  return (
    <div className="card fade-in" style={{ padding: '1.25rem', maxWidth: '450px', margin: '2rem auto', borderTop: '4px solid var(--accent-primary)', boxShadow: 'var(--shadow-md)' }}>
      {/* Header Info */}
      <div style={{ textAlign: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
        <span className="badge badge-info" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', marginBottom: '0.4rem' }}>
          <BookOpen size={11} /> Registro de Asistencia a Comité
        </span>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: 'var(--text-primary)' }}>{meeting.actNumber}</h3>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          Fecha de Reunión: <strong>{meeting.date}</strong> | Comité: <strong>{meeting.type?.toUpperCase()}</strong>
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
              placeholder="Ej. Carlos Gómez" 
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Cargo en la Empresa</label>
            <div style={{ position: 'relative' }}>
              <Briefcase size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                className="form-control" 
                style={{ paddingLeft: '2.25rem', fontSize: '0.85rem' }} 
                value={formData.jobTitle} 
                onChange={e => setFormData({ ...formData, jobTitle: e.target.value })} 
                placeholder="Ej. Supervisor SST" 
                required 
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Cargo en el Comité</label>
            <div style={{ position: 'relative' }}>
              <Award size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
              <select 
                className="form-control" 
                style={{ paddingLeft: '2.25rem', fontSize: '0.85rem' }} 
                value={formData.committeeRole} 
                onChange={e => setFormData({ ...formData, committeeRole: e.target.value })} 
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
          </div>
        </div>

        {/* Signature Canvas drawing pad */}
        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
            <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px', margin: 0 }}>
              <FileSignature size={13} style={{ color: 'var(--accent-primary)' }} /> Firma Digital del Integrante
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
          <CheckCircle size={16} /> Registrar Asistencia a Comité
        </button>
      </form>
    </div>
  );
}
