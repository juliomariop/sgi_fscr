import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Award, CheckCircle, ArrowRight, ShieldCheck, Heart, User, Clipboard, Star } from 'lucide-react';
import { logActivity } from '../utils/activityLogger';

const DEFAULT_PARAMS = {
  projectTypes: ["Eléctrico", "Telecomunicaciones", "Civil", "Ambiental", "Industrial"],
  clients: ["Consorcio Vial del Norte", "Ecopetrol", "Claro", "Movistar"],
  cities: ["Bogotá", "Medellín", "Cali", "Barranquilla", "Bucaramanga"]
};

export default function PublicCustomerSurvey() {
  const [surveys, setSurveys] = useLocalStorage('sgi_customer_surveys', []);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    // Dynamic body scroll override for stand-alone public page
    const originalStyle = document.body.style.overflow;
    document.body.style.overflow = 'auto';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  const [globalParams] = useLocalStorage('sgi_global_parameters', DEFAULT_PARAMS);
  const projectTypes = globalParams?.projectTypes || DEFAULT_PARAMS.projectTypes;
  const clientOptions = globalParams?.clients || DEFAULT_PARAMS.clients;

  // Client Identification fields
  const [clientName, setClientName] = useState('');
  const [projectType, setProjectType] = useState('');
  const [projectName, setProjectName] = useState('');
  const [evaluatorName, setEvaluatorName] = useState('');
  const [comments, setComments] = useState('');

  useEffect(() => {
    if (projectTypes && projectTypes.length > 0 && !projectType) {
      setProjectType(projectTypes[0]);
    }
  }, [projectTypes, projectType]);

  // Questions score state (defaults to maximum values)
  const [answers, setAnswers] = useState({
    q1: 10,
    q2: 10,
    q3: 10,
    q4: 10,
    q5: 10,
    q6: 10,
    q7: 10,
    q8: 10,
    q9: 10,
    q10: 5,
    q11: 5
  });

  const handleScoreChange = (qId, val) => {
    setAnswers(prev => ({ ...prev, [qId]: val }));
  };

  // Submit handler
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!clientName.trim() || !projectName.trim()) {
      alert('Por favor complete la información básica de cliente y proyecto.');
      return;
    }

    // Calculate sum of scores
    const totalPoints = Object.values(answers).reduce((sum, current) => sum + current, 0);

    // Map 100 points scale to 1-10 NPS scale
    // e.g. 100 -> 10, 85 -> 9, 74 -> 7, 50 -> 5
    const npsScore = Math.max(1, Math.min(10, Math.round(totalPoints / 10)));

    const newSurvey = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      client: clientName.trim(),
      projectType,
      product: projectName.trim(),
      score: npsScore, // NPS (1-10)
      rawScore: totalPoints, // Raw score (0-100)
      comments: comments.trim() ? `${comments.trim()} (Evaluado por: ${evaluatorName || 'Anónimo'})` : `Evaluado por: ${evaluatorName || 'Anónimo'}`,
      evidenceFile: null,
      source: 'Público',
      answersDetail: { ...answers }
    };

    setSurveys([newSurvey, ...surveys]);
    setIsSubmitted(true);

    // Register anonymous survey reception to activity logs
    logActivity(
      { email: 'anonimo@cliente.com', name: 'Cliente SGI' },
      "Encuesta HSEQ Recibida (Pública)",
      `Recibida encuesta de satisfacción de cliente: ${newSurvey.client} para el proyecto: ${newSurvey.product} (${newSurvey.projectType})`
    );
  };

  // Render a responsive horizontal score picker
  const renderScorePicker = (qId, maxVal) => {
    const currentValue = answers[qId];
    const options = Array.from({ length: maxVal + 1 }, (_, i) => i);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
          {options.map(val => (
            <button
              key={val}
              type="button"
              onClick={() => handleScoreChange(qId, val)}
              style={{
                flex: '1 1 32px',
                minWidth: '32px',
                height: '32px',
                borderRadius: '4px',
                border: '1px solid var(--border-color)',
                background: currentValue === val ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                color: currentValue === val ? 'white' : 'var(--text-primary)',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '0.78rem',
                transition: 'all 0.15s ease'
              }}
            >
              {val}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          <span>Deficiente (0)</span>
          <span>Excelente ({maxVal})</span>
        </div>
      </div>
    );
  };

  if (isSubmitted) {
    return (
      <div style={{
        maxWidth: '560px',
        margin: '2rem auto',
        padding: '2rem',
        textAlign: 'center',
        background: 'var(--bg-primary)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{
          display: 'inline-flex',
          background: 'rgba(16, 185, 129, 0.1)',
          padding: '1rem',
          borderRadius: '50%',
          color: 'var(--success)',
          marginBottom: '1rem'
        }}>
          <CheckCircle size={48} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>
          ¡Evaluación Enviada con Éxito!
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
          Su opinión es de gran valor para nosotros. Nos ayuda a asegurar los más altos estándares de calidad, seguridad, salud en el trabajo y cuidado ambiental en la ejecución de todos nuestros proyectos.
        </p>
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          <ShieldCheck size={14} style={{ color: 'var(--accent-primary)' }} />
          <span>Sistema de Gestión Integrado HSEQ - FSCR</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '680px', margin: '1rem auto', padding: '1rem' }}>
      
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #16254a 100%)',
        color: 'white',
        padding: '1.5rem',
        borderRadius: '8px 8px 0 0',
        textAlign: 'center',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800 }}>EVALUACIÓN DE SATISFACCIÓN DEL CLIENTE</h2>
        <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.75)' }}>
          Sistema de Gestión Integrado HSEQ
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{
        background: 'var(--bg-primary)',
        border: '1px solid var(--border-color)',
        borderRadius: '0 0 8px 8px',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        boxShadow: 'var(--shadow-md)'
      }}>
        
        {/* Intro */}
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.6', background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '6px', borderLeft: '3px solid var(--accent-primary)' }}>
          Agradecemos su colaboración calificando el desempeño de nuestra empresa en la ejecución de sus proyectos. Por favor seleccione la puntuación correspondiente para cada criterio de evaluación.
        </p>

        {/* Section: Basic Data */}
        <div>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 800, margin: '0 0 0.85rem 0', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clipboard size={14} style={{ color: 'var(--accent-primary)' }} /> 1. Información del Proyecto
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ flex: 2, minWidth: '220px', marginBottom: 0 }}>
                <label className="form-label">Nombre del Cliente / Razón Social *</label>
                <select 
                  className="form-control" 
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  required 
                >
                  <option value="">Seleccione cliente...</option>
                  {clientOptions.map((c, idx) => (
                    <option key={idx} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ flex: 1, minWidth: '150px', marginBottom: 0 }}>
                <label className="form-label">Tipo de Proyecto *</label>
                <select 
                  className="form-control"
                  value={projectType}
                  onChange={e => setProjectType(e.target.value)}
                  required
                >
                  {projectTypes.map(pt => (
                    <option key={pt} value={pt}>{pt}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ flex: 1, minWidth: '220px', marginBottom: 0 }}>
                <label className="form-label">Nombre de la Obra o Servicio Ejecutado *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Ej: Montaje de Redes Eléctricas BT"
                  value={projectName}
                  onChange={e => setProjectName(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group" style={{ flex: 1, minWidth: '220px', marginBottom: 0 }}>
                <label className="form-label">Nombre del Evaluador (Cargo / Persona)</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Ej: Ing. Residente de Interventoría"
                  value={evaluatorName}
                  onChange={e => setEvaluatorName(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section: Evaluation Parameters */}
        <div>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 800, margin: '0 0 1rem 0', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Star size={14} style={{ color: 'var(--accent-primary)' }} /> 2. Conceptos de Evaluación
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Category: Calidad */}
            <div style={{ border: '1px solid var(--border-color)', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{ background: 'rgba(37, 99, 235, 0.05)', padding: '0.5rem 0.75rem', fontWeight: 700, fontSize: '0.78rem', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid var(--border-color)' }}>
                En Cuanto a la Calidad (Máx: 20 Puntos)
              </div>
              <div style={{ padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>
                    ¿Se cumplió con las especificaciones técnicas asignadas por el cliente?
                  </label>
                  {renderScorePicker('q1', 10)}
                </div>
                <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '0.85rem' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>
                    <strong>Cumplimiento:</strong> ¿Se cumplió en la fecha de inicio y terminación acordadas en el contrato?
                  </label>
                  {renderScorePicker('q2', 10)}
                </div>
              </div>
            </div>

            {/* Category: Recurso Humano */}
            <div style={{ border: '1px solid var(--border-color)', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{ background: 'rgba(245, 158, 11, 0.05)', padding: '0.5rem 0.75rem', fontWeight: 700, fontSize: '0.78rem', color: 'var(--warning)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid var(--border-color)' }}>
                En Cuanto al Recurso Humano (Máx: 20 Puntos)
              </div>
              <div style={{ padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>
                    <strong>Personal Profesional:</strong> Capacidad técnica del Líder del proyecto asignado para dar cumplimiento a los requisitos del contrato (Especificaciones, costos y calidad de la obra)
                  </label>
                  {renderScorePicker('q3', 10)}
                </div>
                <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '0.85rem' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>
                    <strong>Personal Operativo:</strong> Capacidad técnica del personal operativo para solucionar las necesidades del proyecto
                  </label>
                  {renderScorePicker('q4', 10)}
                </div>
              </div>
            </div>

            {/* Category: Ambiental */}
            <div style={{ border: '1px solid var(--border-color)', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '0.5rem 0.75rem', fontWeight: 700, fontSize: '0.78rem', color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid var(--border-color)' }}>
                En Cuanto a lo Ambiental (Máx: 20 Puntos)
              </div>
              <div style={{ padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>
                    <strong>Gestión de Residuos:</strong> ¿Considera eficaz la disposición final de residuos por parte de la organización?
                  </label>
                  {renderScorePicker('q5', 10)}
                </div>
                <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '0.85rem' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>
                    <strong>Gestión Ambiental:</strong> Cumplimiento de los requisitos ambientales asociados al proyecto
                  </label>
                  {renderScorePicker('q6', 10)}
                </div>
              </div>
            </div>

            {/* Category: SST */}
            <div style={{ border: '1px solid var(--border-color)', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '0.5rem 0.75rem', fontWeight: 700, fontSize: '0.78rem', color: 'var(--danger)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid var(--border-color)' }}>
                En Cuanto a Seguridad y Salud en el Trabajo (Máx: 20 Puntos)
              </div>
              <div style={{ padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>
                    <strong>Gestión de la SST:</strong> ¿Considera que en la Organización existe una cultura de la Seguridad y Salud en el trabajo?
                  </label>
                  {renderScorePicker('q7', 10)}
                </div>
                <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '0.85rem' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>
                    <strong>Gestión de la SST:</strong> Cumplimiento de todos los requerimientos relacionados con la Seguridad y Salud de los trabajadores
                  </label>
                  {renderScorePicker('q8', 10)}
                </div>
              </div>
            </div>

            {/* Category: Organización */}
            <div style={{ border: '1px solid var(--border-color)', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{ background: 'rgba(107, 114, 128, 0.05)', padding: '0.5rem 0.75rem', fontWeight: 700, fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid var(--border-color)' }}>
                En Cuanto a la Organización (Máx: 20 Puntos)
              </div>
              <div style={{ padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>
                    Experiencia de la empresa en la ejecución del proyecto
                  </label>
                  {renderScorePicker('q9', 10)}
                </div>
                <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '0.85rem' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>
                    Disponibilidad de equipo, materiales y herramienta en obra para atender las necesidades del proyecto
                  </label>
                  {renderScorePicker('q10', 5)}
                </div>
                <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '0.85rem' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>
                    Atención de solicitudes del cliente
                  </label>
                  {renderScorePicker('q11', 5)}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Section: Comments */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Comentarios Adicionales o Recomendaciones de Mejora</label>
          <textarea 
            className="form-control" 
            rows="3" 
            placeholder="Escriba aquí sus comentarios..."
            value={comments}
            onChange={e => setComments(e.target.value)}
          ></textarea>
        </div>

        {/* Submit */}
        <button type="submit" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '0.75rem', fontWeight: 'bold' }}>
          Enviar Encuesta de Satisfacción <ArrowRight size={16} />
        </button>

      </form>
    </div>
  );
}
