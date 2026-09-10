import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { 
  exportToPDF, 
  exportToExcel, 
  DEFAULT_REVIEWERS, 
  DEFAULT_APPROVERS 
} from '../utils/exportUtils';
import { FileText, Table, Check, Edit2 } from 'lucide-react';

export default function ExportModal({
  isOpen,
  onClose,
  exportType = 'pdf', // 'pdf' or 'excel'
  defaultTitle = '',
  defaultCode = '',
  defaultVersion = '01',
  defaultValidity = new Date().toISOString().split('T')[0],
  history = [], // Auto-loaded history (read-only)
  layout = 'standard', // 'standard' or 'strategic'
  
  // For Excel exports
  columns = [],
  data = [],
  
  // For PDF exports
  contentHtml = ''
}) {
  const [title, setTitle] = useState(defaultTitle);
  const [code, setCode] = useState(defaultCode);
  const [version, setVersion] = useState(defaultVersion);
  const [validity, setValidity] = useState(defaultValidity);

  // Initialize reviewers and approvers
  const [reviewers, setReviewers] = useState(DEFAULT_REVIEWERS);
  const [approvers, setApprovers] = useState(DEFAULT_APPROVERS);

  // Selection states
  const [selectedReviewers, setSelectedReviewers] = useState({});
  const [selectedApprovers, setSelectedApprovers] = useState({});

  useEffect(() => {
    if (isOpen) {
      setTitle(defaultTitle);
      setCode(defaultCode);
      // If history exists, use the latest version from the history log as default
      if (history && history.length > 0) {
        const latest = history[history.length - 1];
        setVersion(latest.version || defaultVersion);
        if (latest.date) setValidity(latest.date);
      } else {
        setVersion(defaultVersion);
        setValidity(defaultValidity);
      }
      setReviewers(DEFAULT_REVIEWERS);
      setApprovers(DEFAULT_APPROVERS);

      // Initialize all as checked by default
      const initialRevs = {};
      DEFAULT_REVIEWERS.forEach((_, idx) => {
        initialRevs[idx] = true;
      });
      setSelectedReviewers(initialRevs);

      const initialApps = {};
      DEFAULT_APPROVERS.forEach((_, idx) => {
        initialApps[idx] = true;
      });
      setSelectedApprovers(initialApps);
    }
  }, [isOpen, defaultTitle, defaultCode, defaultVersion, defaultValidity, history]);


  const handleExport = async () => {
    try {
      const activeReviewers = reviewers.filter((_, i) => !!selectedReviewers[i]);
      const activeApprovers = approvers.filter((_, i) => !!selectedApprovers[i]);

      if (exportType === 'pdf') {
        exportToPDF({
          title,
          code,
          version,
          validity,
          contentHtml,
          history,
          reviewers: activeReviewers,
          approvers: activeApprovers,
          layout
        });
      } else {
        await exportToExcel({
          title,
          code,
          version,
          validity,
          columns,
          data,
          history,
          reviewers: activeReviewers,
          approvers: activeApprovers
        });
      }
      onClose();
    } catch (err) {
      console.error('Error generating export:', err);
      alert('Error al generar la exportación: ' + err.message);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Configurar Exportación: ${defaultTitle}`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* Document Metadata Settings */}
        <div className="card" style={{ padding: '1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
            Control de Documento (Encabezado HSEQ)
          </h4>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
            🔒 Los metadatos del encabezado se derivan del control de cambios oficial y están bloqueados para edición.
          </p>
          <div className="grid-2" style={{ gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Código del Documento</label>
              <input 
                type="text" 
                value={code} 
                readOnly
                style={{ width: '100%', padding: '0.4rem 0.6rem', fontSize: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', cursor: 'not-allowed' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Versión Actual</label>
              <input 
                type="text" 
                value={version} 
                readOnly
                style={{ width: '100%', padding: '0.4rem 0.6rem', fontSize: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', cursor: 'not-allowed' }}
              />
            </div>
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Fecha de Vigencia</label>
            <input 
              type="date" 
              value={validity} 
              readOnly
              style={{ width: '100%', padding: '0.4rem 0.6rem', fontSize: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', cursor: 'not-allowed' }}
            />
          </div>
        </div>

        {/* Change Control (Read-Only) */}
        <div className="card" style={{ padding: '1rem', border: '1px solid var(--border-color)' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
            Historial de Control de Cambios
          </h4>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '0 0 0.75rem 0' }}>
            🔒 Este registro histórico es de lectura obligatoria y se incrustará al pie del documento.
          </p>
          <div style={{ maxHeight: '110px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
            <table className="table" style={{ fontSize: '0.75rem', margin: 0 }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)' }}>
                  <th style={{ padding: '4px 8px', fontSize: '0.75rem' }}>Ver.</th>
                  <th style={{ padding: '4px 8px', fontSize: '0.75rem' }}>Fecha</th>
                  <th style={{ padding: '4px 8px', fontSize: '0.75rem' }}>Cambios</th>
                </tr>
              </thead>
              <tbody>
                {history && history.length > 0 ? (
                  history.map((h, i) => (
                    <tr key={i}>
                      <td style={{ padding: '4px 8px', fontWeight: 'bold', borderBottom: '1px solid var(--border-color)' }}>{h.version}</td>
                      <td style={{ padding: '4px 8px', whiteSpace: 'nowrap', borderBottom: '1px solid var(--border-color)' }}>{h.date}</td>
                      <td style={{ padding: '4px 8px', borderBottom: '1px solid var(--border-color)' }}>{h.changes || h.changeReason}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', padding: '8px', color: 'var(--text-muted)' }}>
                      Ningún cambio registrado. Se creará versión inicial.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reviewers and Approvers (Selectable) */}
        <div className="card" style={{ padding: '1rem', border: '1px solid var(--border-color)' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
            Seleccionar Firmas HSEQ a Imprimir
          </h4>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '0 0 0.75rem 0' }}>
            Selecciona las firmas autorizadas que deseas incluir en este reporte/documento.
          </p>
          
          <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '4px' }}>
            {/* Reviewers List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Revisado Por:</span>
              {reviewers.map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.4rem 0.6rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.78rem' }}>
                  <input 
                    type="checkbox"
                    id={`rev-${i}`}
                    checked={!!selectedReviewers[i]}
                    onChange={(e) => setSelectedReviewers({ ...selectedReviewers, [i]: e.target.checked })}
                    style={{ cursor: 'pointer' }}
                  />
                  <label htmlFor={`rev-${i}`} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', margin: 0 }}>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{r.role || r.cargo}</div>
                    </div>
                    {r.signatureImage && (
                      <div style={{ background: '#fff', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center' }}>
                        <img src={r.signatureImage} alt={`Firma de ${r.name}`} style={{ height: '22px', maxWidth: '80px', objectFit: 'contain' }} />
                      </div>
                    )}
                  </label>
                </div>
              ))}
            </div>

            {/* Approvers List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Aprobado Por:</span>
              {approvers.map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.4rem 0.6rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.78rem' }}>
                  <input 
                    type="checkbox"
                    id={`app-${i}`}
                    checked={!!selectedApprovers[i]}
                    onChange={(e) => setSelectedApprovers({ ...selectedApprovers, [i]: e.target.checked })}
                    style={{ cursor: 'pointer' }}
                  />
                  <label htmlFor={`app-${i}`} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', margin: 0 }}>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{a.name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{a.role || a.cargo}</div>
                    </div>
                    {a.signatureImage && (
                      <div style={{ background: '#fff', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center' }}>
                        <img src={a.signatureImage} alt={`Firma de ${a.name}`} style={{ height: '22px', maxWidth: '80px', objectFit: 'contain' }} />
                      </div>
                    )}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {exportType === 'pdf' ? <FileText size={16} /> : <Table size={16} />}
            Generar {exportType.toUpperCase()}
          </button>
        </div>
      </div>
    </Modal>
  );
}
