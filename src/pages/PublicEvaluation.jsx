import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Award, Star, CheckSquare, ChevronRight, HelpCircle, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export default function PublicEvaluation({ isSimulator = false, simulatorTrainingId = null, onEvaluationSubmitted = null }) {
  const { trainingId: routeTrainingId } = useParams();
  const trainingId = isSimulator ? simulatorTrainingId : routeTrainingId;

  const [trainings, setTrainings] = useLocalStorage('sgi_trainings', []);
  const [training, setTraining] = useState(null);

  const [idDocument, setIdDocument] = useState('');
  const [participantName, setParticipantName] = useState('');
  const [participantArea, setParticipantArea] = useState('');
  const [isIdentified, setIsIdentified] = useState(false);
  const [isNotRegisteredYet, setIsNotRegisteredYet] = useState(false);

  const [answers, setAnswers] = useState({}); // { questionId: value }
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [scoreResult, setScoreResult] = useState({ score: 0, passed: true, maxScore: 0 });
  const [error, setError] = useState('');

  useEffect(() => {
    const originalStyle = document.body.style.overflow;
    document.body.style.overflow = 'auto';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  // Load training
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

  // Identify participant
  const handleIdentify = (e) => {
    e.preventDefault();
    if (!idDocument.trim()) return;

    // Check if document exists in participants list
    const foundParticipant = training.participants?.find(p => String(p.document) === String(idDocument.trim()));

    if (foundParticipant) {
      setParticipantName(foundParticipant.name);
      setParticipantArea(foundParticipant.area);
      setIsIdentified(true);
      setIsNotRegisteredYet(false);
    } else {
      // Allow them to register on-the-fly to prevent blockage
      setIsNotRegisteredYet(true);
    }
  };

  const handleRegisterAndStart = (e) => {
    e.preventDefault();
    if (!participantName.trim() || !participantArea.trim()) {
      alert('Por favor complete todos los campos.');
      return;
    }
    setIsIdentified(true);
  };

  const handleRatingSelect = (qId, val) => {
    setAnswers({ ...answers, [qId]: val });
  };

  const handleChoiceSelect = (qId, val) => {
    setAnswers({ ...answers, [qId]: val });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Ensure all questions are answered
    const config = training.evaluationConfig || { questions: [] };
    const unanswered = config.questions.filter(q => answers[q.id] === undefined || answers[q.id] === '');
    
    if (unanswered.length > 0) {
      alert(`Por favor responda todas las preguntas. Falta responder: ${unanswered.length}`);
      return;
    }

    // Calculate score for quiz questions (multiple choice with correct answer)
    let correctCount = 0;
    let quizCount = 0;
    
    config.questions.forEach(q => {
      if (q.type === 'quiz') {
        quizCount++;
        if (String(answers[q.id]).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase()) {
          correctCount++;
        }
      }
    });

    const scorePercent = quizCount > 0 ? Math.round((correctCount / quizCount) * 100) : 100;
    const minPassing = config.passingScorePercent || 80;
    const passed = scorePercent >= minPassing;

    const newEvaluation = {
      document: idDocument.trim(),
      name: participantName.trim(),
      answers,
      score: scorePercent,
      passed,
      submittedAt: new Date().toLocaleString()
    };

    // If they registered on the fly, also add them to the attendance list
    let updatedTrainings = [...trainings];
    if (isNotRegisteredYet) {
      const mockSignature = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='40'><text x='10' y='25' style='font: italic bold 16px Hand; fill: %230284c7;'>Firma Virtual</text></svg>";
      const newParticipant = {
        name: participantName.trim(),
        document: idDocument.trim(),
        area: participantArea.trim(),
        signature: mockSignature,
        registeredAt: new Date().toLocaleString()
      };

      updatedTrainings = trainings.map(t => {
        if (String(t.id) === String(trainingId)) {
          const participants = t.participants || [];
          const evaluations = t.evaluations || [];
          return {
            ...t,
            participants: [...participants, newParticipant],
            evaluations: [...evaluations, newEvaluation]
          };
        }
        return t;
      });
    } else {
      updatedTrainings = trainings.map(t => {
        if (String(t.id) === String(trainingId)) {
          const evaluations = t.evaluations || [];
          // Avoid duplicates by document
          if (evaluations.some(ev => ev.document === newEvaluation.document)) {
            return t;
          }
          return { ...t, evaluations: [...evaluations, newEvaluation] };
        }
        return t;
      });
    }

    setTrainings(updatedTrainings);
    setScoreResult({ score: scorePercent, passed, quizCount, correctCount });
    setIsSubmitted(true);

    if (onEvaluationSubmitted) {
      onEvaluationSubmitted(newEvaluation);
    }
  };

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', maxWidth: '400px', margin: '4rem auto' }} className="card">
        <h3 style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</h3>
        <p style={{ color: 'var(--text-secondary)' }}>El código QR puede ser incorrecto o la evaluación no fue configurada.</p>
      </div>
    );
  }

  if (!training) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Cargando evaluación...</p>
      </div>
    );
  }

  const evalConfig = training.evaluationConfig;
  if (!evalConfig || !evalConfig.enabled || !evalConfig.questions || evalConfig.questions.length === 0) {
    return (
      <div className="card" style={{ padding: '2rem', textAlign: 'center', maxWidth: '400px', margin: '4rem auto', borderTop: '4px solid var(--warning)' }}>
        <div style={{ color: 'var(--warning)', marginBottom: '0.75rem' }}>
          <AlertTriangle size={36} style={{ display: 'inline-block' }} />
        </div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Evaluación No Disponible</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          El facilitador no ha activado o configurado preguntas de evaluación para esta capacitación.
        </p>
      </div>
    );
  }

  // Submitted successfully screen
  if (isSubmitted) {
    return (
      <div className="card fade-in" style={{ padding: '2rem', textAlign: 'center', maxWidth: '450px', margin: isSimulator ? '0' : '3rem auto', borderTop: `4px solid ${scoreResult.passed ? 'var(--success)' : 'var(--danger)'}` }}>
        <div style={{ display: 'inline-flex', background: scoreResult.passed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: scoreResult.passed ? 'var(--success)' : 'var(--danger)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
          <Award size={48} />
        </div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>¡Evaluación Enviada!</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          Tus respuestas para la capacitación <strong>"{training.topic}"</strong> han sido evaluadas.
        </p>

        {scoreResult.quizCount > 0 ? (
          <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Resultado de la Prueba:</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: scoreResult.passed ? 'var(--success)' : 'var(--danger)' }}>
              {scoreResult.score}%
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', marginTop: '0.25rem', fontWeight: 600 }}>
              {scoreResult.correctCount} correctas de {scoreResult.quizCount} preguntas.
            </div>
            <span className={`badge ${scoreResult.passed ? 'badge-success' : 'badge-danger'}`} style={{ marginTop: '0.5rem', display: 'inline-block' }}>
              {scoreResult.passed ? 'APROBADO' : 'NO APROBADO'}
            </span>
          </div>
        ) : (
          <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 600 }}>
              ¡Agradecemos tu retroalimentación y participación!
            </p>
          </div>
        )}

        {isSimulator && (
          <button 
            type="button" 
            className="btn-secondary" 
            style={{ width: '100%', fontSize: '0.8rem' }}
            onClick={() => {
              setIsSubmitted(false);
              setIsIdentified(false);
              setIsNotRegisteredYet(false);
              setIdDocument('');
              setParticipantName('');
              setParticipantArea('');
              setAnswers({});
            }}
          >
            Evaluar Otro Asistente
          </button>
        )}
      </div>
    );
  }

  // 1. Participant identification screen
  if (!isIdentified) {
    return (
      <div className="card fade-in" style={{ padding: '1.25rem', maxWidth: '450px', margin: isSimulator ? '0' : '2rem auto', borderTop: '4px solid var(--warning)', boxShadow: 'var(--shadow-md)' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', marginBottom: '0.4rem', color: 'black' }}>
            <FileText size={11} /> Evaluación de Formación
          </span>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>{training.topic}</h3>
          <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Por favor, identifícate para iniciar tu evaluación.
          </p>
        </div>

        {!isNotRegisteredYet ? (
          <form onSubmit={handleIdentify} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Documento de Identidad (Cédula)</label>
              <input 
                type="text" 
                className="form-control" 
                value={idDocument} 
                onChange={e => setIdDocument(e.target.value)} 
                placeholder="Escribe tu cédula para validar" 
                required 
              />
            </div>
            <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
              Validar Asistencia <ChevronRight size={16} />
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterAndStart} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} className="fade-in">
            <div style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.78rem', color: 'var(--warning)', display: 'flex', gap: '0.4rem' }}>
              <AlertTriangle size={15} style={{ flexShrink: 0 }} />
              <div>
                <strong>No registrado:</strong> Tu cédula no está en la lista de asistencia. Completa tus datos para registrar asistencia y evaluación juntas.
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Nombre Completo</label>
              <input type="text" className="form-control" value={participantName} onChange={e => setParticipantName(e.target.value)} placeholder="Ej. Juan Pérez" required />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Área / Cargo</label>
              <input type="text" className="form-control" value={participantArea} onChange={e => setParticipantArea(e.target.value)} placeholder="Ej. Ventas / Analista" required />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setIsNotRegisteredYet(false)}>Atrás</button>
              <button type="submit" className="btn-primary" style={{ flex: 2 }}>Registrar e Iniciar</button>
            </div>
          </form>
        )}
      </div>
    );
  }

  // 2. Quiz / Questionnaire answering screen
  return (
    <div className="card fade-in" style={{ padding: '1.25rem', maxWidth: '450px', margin: isSimulator ? '0' : '2rem auto', borderTop: '4px solid var(--accent-primary)', boxShadow: 'var(--shadow-md)' }}>
      <div style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Evaluando capacitación</span>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.15rem 0', color: 'var(--text-primary)' }}>{training.topic}</h3>
        <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          Participante: <strong>{participantName}</strong> ({participantArea})
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {evalConfig.questions.map((q, index) => (
          <div key={q.id} style={{ background: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.75rem', alignItems: 'flex-start' }}>
              <HelpCircle size={15} style={{ color: 'var(--accent-primary)', marginTop: '2px', flexShrink: 0 }} />
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: '1.4' }}>
                {index + 1}. {q.text}
              </div>
            </div>

            {/* Render stars rating question type */}
            {q.type === 'rating' && (
              <div style={{ display: 'flex', gap: '0.65rem', justifyContent: 'center', margin: '0.25rem 0' }}>
                {[1, 2, 3, 4, 5].map((val) => {
                  const ratingValue = answers[q.id];
                  const isActive = ratingValue !== undefined && val <= ratingValue;
                  return (
                    <button
                      key={val}
                      type="button"
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.2rem', transition: 'transform 0.15s ease' }}
                      onClick={() => handleRatingSelect(q.id, val)}
                      className="star-btn"
                    >
                      <Star 
                        size={28} 
                        fill={isActive ? 'var(--warning)' : 'transparent'} 
                        color={isActive ? 'var(--warning)' : 'var(--text-muted)'} 
                        style={{ transform: isActive ? 'scale(1.1)' : 'scale(1)' }}
                      />
                    </button>
                  );
                })}
              </div>
            )}

            {/* Render multiple choice quiz question type */}
            {q.type === 'quiz' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {(q.options || []).map((opt) => {
                  const isSelected = answers[q.id] === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      style={{
                        textAlign: 'left',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '6px',
                        border: `1.5px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                        background: isSelected ? 'rgba(14, 165, 233, 0.05)' : 'var(--bg-primary)',
                        color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)',
                        fontSize: '0.78rem',
                        fontWeight: isSelected ? 600 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                      onClick={() => handleChoiceSelect(q.id, opt)}
                    >
                      <span style={{ 
                        display: 'inline-block', 
                        width: '18px', 
                        height: '18px', 
                        borderRadius: '50%', 
                        border: '1.5px solid currentColor', 
                        marginRight: '8px', 
                        textAlign: 'center', 
                        verticalAlign: 'middle',
                        lineHeight: '15px',
                        fontSize: '9px'
                      }}>
                        {isSelected ? '✓' : ''}
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        <button 
          type="submit" 
          className="btn-primary" 
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
        >
          <CheckCircle size={16} /> Enviar Evaluación
        </button>
      </form>
    </div>
  );
}
