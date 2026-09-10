import React, { useState, useEffect } from 'react';
import { FileText, Plus, Search, Edit2, Trash2, Download, Folder, ArrowLeft, History, CheckCircle, AlertCircle, FileArchive, Upload, Paperclip, Clock, Cloud, RefreshCw } from 'lucide-react';
import Modal from '../components/Modal';
import ExportModal from '../components/ExportModal';
import CloudConfigModal from '../components/CloudConfigModal';
import { downloadCSV } from '../utils/exportUtils';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAppUsers } from '../hooks/useAppUsers';
import { useAuth } from '../context/AuthContext';
import { getOneDriveSettings, uploadFile } from '../services/oneDriveService';
import { logActivity } from '../utils/activityLogger';

const isoFolders = [
  'Capítulo 4: Contexto de la Organización',
  'Capítulo 5: Liderazgo',
  'Capítulo 6: Planificación',
  'Capítulo 7: Apoyo',
  'Capítulo 8: Operación',
  'Capítulo 9: Evaluación del Desempeño',
  'Capítulo 10: Mejora'
];

const typeAcronyms = {
  'Procedimiento': 'PR',
  'Instructivo': 'IN',
  'Manual': 'MN',
  'Formato': 'FT',
  'Caracterización': 'CT',
  'Política': 'PO',
  'Plan': 'PL'
};

const getFolderAcronym = (folderName) => {
  if (!folderName) return 'XX';
  if (folderName.startsWith('Capítulo')) return 'SGI';
  const clean = folderName.replace(/Capítulo \d+: /g, '').replace(/ de | la | del | el | los | las /gi, ' ');
  return clean.split(' ').map(w => w[0]?.toUpperCase()).join('').substring(0, 3);
};

export default function SystemDocs() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Administrador General' || user?.email?.toLowerCase().trim() === 'jjairojimenez@gmail.com';
  const APP_USERS = useAppUsers();
  const [folders, setFolders] = useState([...isoFolders]);
  const [currentFolder, setCurrentFolder] = useState(null);

  const [exportConfig, setExportConfig] = useState({
    isOpen: false,
    exportType: 'pdf',
    title: '',
    code: '',
    version: '01',
    validity: '',
    contentHtml: '',
    columns: [],
    data: [],
    history: []
  });

  const [docs, setDocs] = useLocalStorage('sgi_docs', [
    { 
      id: 1, code: 'MN-SGI-001', name: 'Manual del SGI', type: 'Manual', version: 'V.03', date: '2025-01-10', status: 'Vigente', folder: 'Capítulo 4: Contexto de la Organización',
      requiresReview: false, reviewer: '', approver: 'Admin', fileName: 'Manual_SGI_V3.pdf',
      history: [{ version: 'V.01', date: '2023-01-10', user: 'Admin', changes: 'Emisión Inicial' }]
    }
  ]);

  useEffect(() => {
    const saved = localStorage.getItem('sgi_processes');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.length > 0) {
        setFolders([...isoFolders, ...parsed.map(p => p.name)]);
      }
    }
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    folder: '', type: 'Procedimiento', name: '', version: 'V.01', requiresReview: false, reviewer: '', fileName: null
  });

  const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);
  const [changeData, setChangeData] = useState({ reason: '', isDelete: false });

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyItem, setHistoryItem] = useState(null);

  // OneDrive state
  const [oneDriveSettings, setOneDriveSettings] = useState(() => getOneDriveSettings());
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Sync OneDrive settings custom event listener
  useEffect(() => {
    const handleSettingsChange = (e) => {
      setOneDriveSettings(e.detail);
    };
    window.addEventListener('onedrive-settings-changed', handleSettingsChange);
    
    return () => {
      window.removeEventListener('onedrive-settings-changed', handleSettingsChange);
    };
  }, []);

  // Filter docs for current view
  const visibleDocs = docs.filter(d => 
    (currentFolder === 'Obsoletos' ? d.folder === 'Obsoletos' : d.folder === currentFolder && d.folder !== 'Obsoletos') &&
    (d.name.toLowerCase().includes(searchTerm.toLowerCase()) || d.code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const generateCode = (type, folder) => {
    const tAcro = typeAcronyms[type] || 'DOC';
    const fAcro = getFolderAcronym(folder);
    
    // Count existing docs in this folder with this type
    const existing = docs.filter(d => d.folder === folder && d.type === type);
    const num = (existing.length + 1).toString().padStart(3, '0');
    return `${tAcro}-${fAcro}-${num}`;
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({ 
        folder: item.folder, type: item.type, name: item.name, version: item.version, 
        requiresReview: item.requiresReview, reviewer: item.reviewer || '', fileName: item.fileName || null,
        origin: item.origin || 'Interno',
        docType: item.docType || (item.type === 'Formato' ? 'Formato' : item.type === 'Procedimiento' ? 'Procedimiento' : item.type === 'Instructivo' ? 'Instructivo' : item.type === 'Matriz' ? 'Matriz' : 'Otro'),
        location: item.location || ''
      });
      // Do not open directly, we need reason for change
      setIsChangeModalOpen(true);
      setChangeData({ reason: '', isDelete: false });
    } else {
      setEditingItem(null);
      setFormData({ 
        folder: currentFolder !== 'Obsoletos' ? currentFolder : folders[0], 
        type: 'Procedimiento', name: '', version: 'V.01', requiresReview: false, reviewer: '', fileName: null,
        origin: 'Interno',
        docType: 'Procedimiento',
        location: ''
      });
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFile(null);
  };

  const handleSubmitNew = async (e) => {
    e.preventDefault();
    
    let oneDriveUrl = null;
    let oneDriveId = null;
    let finalFileName = formData.fileName;

    if (oneDriveSettings.enabled && selectedFile) {
      setIsUploading(true);
      setUploadProgress(0);
      try {
        const result = await uploadFile(selectedFile, oneDriveSettings.folderName, (percent) => {
          setUploadProgress(percent);
        });
        if (result && result.success) {
          oneDriveUrl = result.webUrl;
          oneDriveId = result.id;
          finalFileName = result.name;
        }
      } catch (err) {
        console.error("Error al subir a OneDrive:", err);
        alert(`Error al subir a OneDrive: ${err.message || err}.`);
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    const code = generateCode(formData.type, formData.folder);
    const newDoc = {
      ...formData,
      fileName: finalFileName,
      oneDriveUrl,
      oneDriveId,
      id: Date.now(),
      code,
      date: new Date().toISOString().split('T')[0],
      status: 'Pendiente de Aprobación',
      approver: '',
      history: [{ version: formData.version, date: new Date().toISOString().split('T')[0], user: user?.name || 'Usuario Activo', changes: 'Emisión Inicial' }]
    };
    setDocs([...docs, newDoc]);
    handleCloseModal();
    logActivity(user, "Creación de Documento", `Creado documento: ${newDoc.name} (${newDoc.code})`);
  };

  const handleSubmitEditChange = async (e) => {
    e.preventDefault();
    
    if (changeData.isDelete) {
      if (isAdmin) {
        // Admin deletes immediately
        setDocs(docs.map(d => {
          if (d.id === editingItem.id) {
            const historyArray = d.history || [];
            return {
              ...d,
              folder: 'Obsoletos',
              status: 'Obsoleto',
              history: [...historyArray, { version: d.version, date: new Date().toISOString().split('T')[0], user: user?.name || 'Admin', changes: `Eliminado: ${changeData.reason}` }]
            };
          }
          return d;
        }));
        logActivity(user, "Eliminación de Documento", `Eliminado y movido a Obsoletos: ${editingItem.name} (${editingItem.code}). Motivo: ${changeData.reason}`);
      } else {
        // Non-admin: request deletion
        setDocs(docs.map(d => {
          if (d.id === editingItem.id) {
            const historyArray = d.history || [];
            return {
              ...d,
              status: 'Pendiente de Eliminación',
              deleteReason: changeData.reason,
              history: [...historyArray, { version: d.version, date: new Date().toISOString().split('T')[0], user: user?.name || 'Usuario', changes: `Solicitud de Eliminación (Pendiente de Aprobación): ${changeData.reason}` }]
            };
          }
          return d;
        }));
        logActivity(user, "Solicitud de Baja de Documento", `Solicitada baja de: ${editingItem.name} (${editingItem.code}). Motivo: ${changeData.reason}`);
      }
      setIsChangeModalOpen(false);
      setIsModalOpen(false);
      return;
    }

    // Logic to update -> duplicate as obsolete, set current as pending
    let oneDriveUrl = editingItem.oneDriveUrl || null;
    let oneDriveId = editingItem.oneDriveId || null;
    let finalFileName = formData.fileName;

    if (oneDriveSettings.enabled && selectedFile) {
      setIsUploading(true);
      setUploadProgress(0);
      try {
        const result = await uploadFile(selectedFile, oneDriveSettings.folderName, (percent) => {
          setUploadProgress(percent);
        });
        if (result && result.success) {
          oneDriveUrl = result.webUrl;
          oneDriveId = result.id;
          finalFileName = result.name;
        }
      } catch (err) {
        console.error("Error al subir a OneDrive:", err);
        alert(`Error al subir a OneDrive: ${err.message || err}.`);
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    const oldDoc = { ...editingItem, id: Date.now() + Math.random(), folder: 'Obsoletos', status: 'Obsoleto' };
    const historyArray = editingItem.history || [];
    const updatedDoc = {
      ...editingItem,
      ...formData,
      fileName: finalFileName,
      oneDriveUrl,
      oneDriveId,
      status: 'Pendiente de Aprobación',
      date: new Date().toISOString().split('T')[0],
      history: [...historyArray, { version: formData.version, date: new Date().toISOString().split('T')[0], user: user?.name || 'Usuario Activo', changes: changeData.reason }]
    };
    setDocs(docs.map(d => d.id === editingItem.id ? updatedDoc : d).concat(oldDoc));
    logActivity(user, "Modificación de Documento", `Actualizado documento: ${updatedDoc.name} (${updatedDoc.code}). Cambios: ${changeData.reason}`);
    
    setIsChangeModalOpen(false);
    setIsModalOpen(false);
  };

  const handleDeleteClick = (item) => {
    setEditingItem(item);
    setChangeData({ reason: '', isDelete: true });
    setIsChangeModalOpen(true);
  };

  const handleApprove = (id) => {
    if (window.confirm("¿Aprobar y liberar este documento como Vigente?")) {
      const doc = docs.find(d => d.id === id);
      setDocs(docs.map(d => d.id === id ? { ...d, status: 'Vigente', approver: user?.name || 'Admin', date: new Date().toISOString().split('T')[0] } : d));
      if (doc) {
        logActivity(user, "Aprobación de Documento", `Aprobado documento: ${doc.name} (${doc.code})`);
      }
    }
  };

  const handleApproveDelete = (id) => {
    if (window.confirm("¿Aprobar la baja definitiva de este documento y moverlo a Obsoletos?")) {
      const doc = docs.find(d => d.id === id);
      setDocs(docs.map(d => {
        if (d.id === id) {
          const historyArray = d.history || [];
          return {
            ...d,
            folder: 'Obsoletos',
            status: 'Obsoleto',
            history: [...historyArray, { version: d.version, date: new Date().toISOString().split('T')[0], user: user?.name || 'Admin', changes: `Baja autorizada por Administrador General` }]
          };
        }
        return d;
      }));
      if (doc) {
        logActivity(user, "Baja de Documento Aprobada", `Aprobada la baja definitiva de: ${doc.name} (${doc.code})`);
      }
    }
  };

  const handleRejectDelete = (id) => {
    if (window.confirm("¿Rechazar la solicitud de eliminación y mantener el documento como Vigente?")) {
      const doc = docs.find(d => d.id === id);
      setDocs(docs.map(d => {
        if (d.id === id) {
          const historyArray = d.history || [];
          return {
            ...d,
            status: 'Vigente',
            history: [...historyArray, { version: d.version, date: new Date().toISOString().split('T')[0], user: user?.name || 'Admin', changes: `Solicitud de baja rechazada por Administrador General` }]
          };
        }
        return d;
      }));
      if (doc) {
        logActivity(user, "Baja de Documento Rechazada", `Rechazada la baja definitiva de: ${doc.name} (${doc.code})`);
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFormData({ ...formData, fileName: file.name });
    }
  };

  const openHistory = (item) => {
    setHistoryItem(item);
    setIsHistoryModalOpen(true);
  };

  const handleExportDoc = (d) => {
    try {
      const isExcel = d.type === 'Formato' || d.type === 'Matriz' || d.type === 'Caracterización';
      const formattedHistory = (d.history || []).map(h => ({
        version: h.version,
        date: h.date,
        changes: h.changes || h.changeReason || ''
      }));

      if (isExcel) {
        const cols = [
          { header: 'Fecha de Registro', key: 'date' },
          { header: 'Responsable HSEQ', key: 'responsible' },
          { header: 'Actividad / Detalle', key: 'detail' },
          { header: 'Estado / Conformidad', key: 'status' },
          { header: 'Observación y Plan de Acción', key: 'remarks' }
        ];
        const mockData = [
          { date: d.date, responsible: d.approver || 'Líder HSEQ', detail: `Ejecución y registro para ${d.name}`, status: 'Conforme', remarks: 'Se verifica el cumplimiento de los compromisos operacionales establecidos.' }
        ];
        setExportConfig({
          isOpen: true,
          exportType: 'excel',
          title: d.name,
          code: d.code,
          version: (d.version || '').replace('V.', ''),
          validity: d.date || new Date().toISOString().split('T')[0],
          columns: cols,
          data: mockData,
          history: formattedHistory
        });
      } else {
        let contentHtml = '';
        if (d.type === 'Manual') {
          contentHtml = `
            <div style="font-size: 12px; line-height: 1.6; text-align: justify; margin: 15px 0;">
              <h3 style="color: #1e3a8a; border-bottom: 2px solid #1e3a8a; padding-bottom: 5px; font-size: 13px;">1. INTRODUCCIÓN Y ALCANCE</h3>
              <p>Este manual describe la estructura y directrices del Sistema de Gestión Integral (SGI) de FSCR Ingeniería S.A.S., abarcando los procesos de diseño, planeación, ejecución y auditoría HSEQ en nuestras obras e instalaciones operativas.</p>
              <h3 style="color: #1e3a8a; border-bottom: 2px solid #1e3a8a; padding-bottom: 5px; margin-top: 20px; font-size: 13px;">2. POLÍTICA INTEGRADA Y OBJETIVOS</h3>
              <p>La organización está comprometida con la excelencia en el servicio, el cumplimiento estricto de la legislación nacional vigente, el cuidado ambiental y la prevención sistemática de enfermedades y accidentes laborales.</p>
              <h3 style="color: #1e3a8a; border-bottom: 2px solid #1e3a8a; padding-bottom: 5px; margin-top: 20px; font-size: 13px;">3. CONTROL OPERACIONAL</h3>
              <p>Se establecen auditorías bimestrales, inspecciones de campo y simulacros periódicos para verificar la eficiencia de los controles ambientales, higiénicos y de seguridad industrial.</p>
            </div>
          `;
        } else if (d.type === 'Procedimiento') {
          contentHtml = `
            <div style="font-size: 12px; line-height: 1.6; text-align: justify; margin: 15px 0;">
              <h3 style="color: #1e3a8a; border-bottom: 2px solid #1e3a8a; padding-bottom: 5px; font-size: 13px;">1. OBJETIVO Y CAMPO DE APLICACIÓN</h3>
              <p>Garantizar que todos los colaboradores y contratistas sigan los lineamientos y protocolos técnicos específicos para mitigar riesgos críticos durante la ejecución de los servicios operacionales en sitio.</p>
              <h3 style="color: #1e3a8a; border-bottom: 2px solid #1e3a8a; padding-bottom: 5px; margin-top: 20px; font-size: 13px;">2. RESPONSABLE DE LA EJECUCIÓN</h3>
              <p>El Líder de Operaciones en conjunto con el Ingeniero SST son los encargados de vigilar la adherencia diaria a este procedimiento y diligenciar los formatos asociados de control preventivo.</p>
              <h3 style="color: #1e3a8a; border-bottom: 2px solid #1e3a8a; padding-bottom: 5px; margin-top: 20px; font-size: 13px;">3. CONTROL DE DESVIACIONES</h3>
              <p>Cualquier condición o acto subestándar identificado debe reportarse de inmediato, procediendo a detener la tarea si el riesgo es inminente y abriendo el respectivo plan de acción correctiva.</p>
            </div>
          `;
        } else {
          contentHtml = `
            <div style="font-size: 12px; line-height: 1.6; text-align: justify; margin: 15px 0;">
              <h3 style="color: #1e3a8a; border-bottom: 2px solid #1e3a8a; padding-bottom: 5px; font-size: 13px;">1. PROPÓSITO DEL LINEAMIENTO</h3>
              <p>Establecer un marco estandarizado HSEQ de consulta y cumplimiento obligatorio para el óptimo desempeño de las actividades diarias del área de ${d.folder || 'Sistemas Integrados'}.</p>
              <h3 style="color: #1e3a8a; border-bottom: 2px solid #1e3a8a; padding-bottom: 5px; margin-top: 20px; font-size: 13px;">2. PROCEDIMIENTO GENERAL</h3>
              <p>Se detalla la secuencia de pasos de control preliminar, verificación y reporte de evidencia física/digital que valida la calidad y seguridad de los entregables.</p>
            </div>
          `;
        }
        setExportConfig({
          isOpen: true,
          exportType: 'pdf',
          title: d.name,
          code: d.code,
          version: (d.version || '').replace('V.', ''),
          validity: d.date || new Date().toISOString().split('T')[0],
          contentHtml,
          history: formattedHistory
        });
      }
    } catch (err) {
      console.error('Error en handleExportDoc:', err);
      alert('Error al abrir exportación del documento: ' + err.message);
    }
  };

  const handleExport = () => {
    try {
      const cols = [
        { header: 'Proceso / Capítulo', key: 'folder' },
        { header: 'Código', key: 'code' },
        { header: 'Versión', key: 'version' },
        { header: 'Vigencia', key: 'date' },
        { header: 'Nombre del Documento', key: 'name' },
        { header: 'Ubicación / Almacenamiento', key: 'location' },
        { header: 'Origen (Interno / Externo)', key: 'origin' },
        { header: 'Tipo', key: 'docType' },
        { header: 'Estado', key: 'status' }
      ];

      const exportData = docs.map(d => {
        const origin = d.origin || 'Interno';
        const docType = d.docType || (
          d.type === 'Formato' ? 'Formato' : 
          d.type === 'Procedimiento' ? 'Procedimiento' : 
          d.type === 'Instructivo' ? 'Instructivo' : 
          d.type === 'Matriz' ? 'Matriz' : 'Otro'
        );
        const location = d.location || (d.oneDriveUrl ? `OneDrive: ${d.fileName}` : `Servidor Local SGI - Carpeta: ${d.folder}`);

        return {
          folder: d.folder,
          code: d.code,
          version: d.version,
          date: d.date,
          name: d.name,
          location: location,
          origin: origin,
          docType: docType,
          status: d.status
        };
      });

      const reportHtml = `
        <div style="font-family: system-ui, sans-serif; color: #0f172a; padding: 10px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="margin: 0; font-size: 14px; color: #1e3a8a; font-weight: 800; text-transform: uppercase;">Listado Maestro de Documentos SGI</h2>
            <p style="margin: 3px 0 0 0; font-size: 9.5px; color: #64748b;">Sistemas Integrados de Gestión (SGI) - FSCR Ingeniería S.A.S.</p>
          </div>

          <div style="border: 1px solid #cbd5e1; border-radius: 8px; padding: 15px; background: #ffffff;">
            <h4 style="margin: 0 0 10px 0; font-size: 10px; color: #1e293b; text-transform: uppercase; font-weight: 800; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">Inventario Consolidado de Documentos del Sistema de Gestión</h4>
            <table style="width: 100%; border-collapse: collapse; font-size: 8px; text-align: left;">
              <thead>
                <tr style="background: #1e3a8a; color: white;">
                   <th style="padding: 6px 4px; border: 1px solid #cbd5e1; font-weight: bold; width: 15%;">Proceso / Carpeta</th>
                   <th style="padding: 6px 4px; border: 1px solid #cbd5e1; font-weight: bold; width: 10%;">Código</th>
                   <th style="padding: 6px 4px; border: 1px solid #cbd5e1; font-weight: bold; width: 8%;">Versión</th>
                   <th style="padding: 6px 4px; border: 1px solid #cbd5e1; font-weight: bold; width: 10%;">Vigencia</th>
                   <th style="padding: 6px 4px; border: 1px solid #cbd5e1; font-weight: bold; width: 22%;">Nombre del Documento</th>
                   <th style="padding: 6px 4px; border: 1px solid #cbd5e1; font-weight: bold; width: 15%;">Ubicación</th>
                   <th style="padding: 6px 4px; border: 1px solid #cbd5e1; font-weight: bold; width: 8%;">Origen</th>
                   <th style="padding: 6px 4px; border: 1px solid #cbd5e1; font-weight: bold; width: 8%;">Tipo</th>
                   <th style="padding: 6px 4px; border: 1px solid #cbd5e1; font-weight: bold; width: 8%;">Estado</th>
                </tr>
              </thead>
              <tbody>
                ${exportData.map(d => {
                  let badgeColor = '#ef4444'; // Red
                  const statusStr = d.status || '';
                  if (statusStr === 'Vigente') badgeColor = '#10b981'; // Green
                  else if (statusStr.startsWith('Pendiente')) badgeColor = '#f59e0b'; // Yellow

                  const docTypeStr = (d.docType || 'Otro').toLowerCase();

                  return `
                    <tr>
                      <td style="padding: 5px 4px; border: 1px solid #cbd5e1; font-weight: 500;">${d.folder || ''}</td>
                      <td style="padding: 5px 4px; border: 1px solid #cbd5e1; font-weight: bold; color: #1e3a8a;">${d.code || ''}</td>
                      <td style="padding: 5px 4px; border: 1px solid #cbd5e1; text-align: center;">${d.version || ''}</td>
                      <td style="padding: 5px 4px; border: 1px solid #cbd5e1; text-align: center;">${d.date || ''}</td>
                      <td style="padding: 5px 4px; border: 1px solid #cbd5e1;">${d.name || ''}</td>
                      <td style="padding: 5px 4px; border: 1px solid #cbd5e1; font-size: 7px; color: #64748b;">${d.location || ''}</td>
                      <td style="padding: 5px 4px; border: 1px solid #cbd5e1; text-align: center;">${d.origin || ''}</td>
                      <td style="padding: 5px 4px; border: 1px solid #cbd5e1; text-align: center; text-transform: capitalize;">${docTypeStr}</td>
                      <td style="padding: 5px 4px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; color: ${badgeColor};">${statusStr}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;

      setExportConfig({
        isOpen: true,
        exportType: 'excel',
        title: 'Listado Maestro de Documentos SGI',
        code: 'SGI-LIS-DOC-001',
        version: '3.0',
        validity: new Date().toISOString().split('T')[0],
        columns: cols,
        data: exportData,
        history: [
          { date: '2023-01-10', version: '1.0', changes: 'Emisión inicial del listado maestro', user: 'Líder HSEQ' },
          { date: '2024-05-15', version: '2.0', changes: 'Revisión periódica y actualización de la estructura documental', user: 'Líder HSEQ' },
          { date: new Date().toISOString().split('T')[0], version: '3.0', changes: 'Consolidación completa con control de documentos internos/externos y ubicación física/digital', user: 'Administrador General' }
        ],
        contentHtml: reportHtml
      });
    } catch (err) {
      console.error('Error en handleExport:', err);
      alert('Error al abrir exportación del listado maestro: ' + err.message);
    }
  };

  // RENDER GRID DE CARPETAS
  if (!currentFolder) {
    return (
      <>
        <div style={{display:'flex', justifyContent:'space-between', marginBottom:'1.5rem', alignItems:'center', flexWrap:'wrap', gap:'1rem'}}>
          <div>
            <p style={{color:'var(--text-secondary)', marginBottom:'0.25rem'}}>Estructura Documental del Sistema</p>
            <h2 style={{fontSize:'1.5rem', fontWeight:600}}>Carpetas Maestras</h2>
          </div>
          <div style={{display:'flex', gap:'0.5rem', flexWrap:'wrap'}}>
            <button className="btn-secondary" onClick={handleExport}><Download size={16}/> Listado General Maestro</button>
            <button className="btn-secondary" onClick={() => window.dispatchEvent(new CustomEvent('open-cloud-config'))} style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
              <Cloud size={16} color={oneDriveSettings.enabled ? '#0078d4' : 'var(--text-muted)'} />
              {oneDriveSettings.enabled ? (oneDriveSettings.isDemoMode ? 'OneDrive (Demo)' : 'OneDrive Conectado') : 'Conectar OneDrive'}
            </button>
          </div>
        </div>

        <div className="grid-4" style={{marginBottom:'2rem'}}>
          {folders.map(f => {
            const count = docs.filter(d => d.folder === f && d.folder !== 'Obsoletos').length;
            return (
              <div key={f} className="card folder-card" onClick={() => setCurrentFolder(f)} style={{cursor:'pointer', transition:'transform 0.2s', borderTop:'4px solid var(--accent-primary)'}}>
                <div style={{display:'flex', alignItems:'center', gap:'1rem'}}>
                  <Folder size={32} style={{color:'var(--accent-primary)'}}/>
                  <div>
                    <h4 style={{fontSize:'0.9rem', marginBottom:'0.25rem'}}>{f}</h4>
                    <span style={{fontSize:'0.75rem', color:'var(--text-muted)'}}>{count} Documentos</span>
                  </div>
                </div>
              </div>
            );
          })}
          
          <div className="card folder-card" onClick={() => setCurrentFolder('Obsoletos')} style={{cursor:'pointer', transition:'transform 0.2s', borderTop:'4px solid var(--danger)', background:'rgba(239, 68, 68, 0.05)'}}>
            <div style={{display:'flex', alignItems:'center', gap:'1rem'}}>
              <FileArchive size={32} style={{color:'var(--danger)'}}/>
              <div>
                <h4 style={{fontSize:'0.9rem', marginBottom:'0.25rem', color:'var(--danger)'}}>Obsoletos e Historial</h4>
                <span style={{fontSize:'0.75rem', color:'var(--text-muted)'}}>{docs.filter(d => d.folder === 'Obsoletos').length} Archivos Muertos</span>
              </div>
            </div>
          </div>
        </div>

        <ExportModal
          isOpen={exportConfig.isOpen}
          onClose={() => setExportConfig({ ...exportConfig, isOpen: false })}
          exportType={exportConfig.exportType}
          defaultTitle={exportConfig.title}
          defaultCode={exportConfig.code}
          defaultVersion={exportConfig.version}
          defaultValidity={exportConfig.validity}
          contentHtml={exportConfig.contentHtml}
          columns={exportConfig.columns}
          data={exportConfig.data}
          history={exportConfig.history}
        />
      </>
    );
  }

  // RENDER CONTENIDO DE CARPETA
  return (
    <>
      <div style={{display:'flex', justifyContent:'space-between', marginBottom:'1.5rem', alignItems:'center', flexWrap:'wrap', gap:'1rem'}}>
        <div style={{display:'flex', alignItems:'center', gap:'1rem'}}>
          <button className="btn-icon" onClick={() => setCurrentFolder(null)} style={{background:'var(--bg-secondary)', padding:'0.5rem'}} title="Volver a Carpetas">
            <ArrowLeft size={18}/>
          </button>
          <div>
            <p style={{color:'var(--text-secondary)', marginBottom:'0.25rem'}}>Contenido de Carpeta</p>
            <h2 style={{fontSize:'1.25rem', fontWeight:600}}>{currentFolder}</h2>
          </div>
        </div>
        {currentFolder !== 'Obsoletos' && (
          <div style={{display:'flex', gap:'0.5rem', flexWrap:'wrap'}}>
            <button className="btn-secondary" onClick={() => window.dispatchEvent(new CustomEvent('open-cloud-config'))} style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
              <Cloud size={16} color={oneDriveSettings.enabled ? '#0078d4' : 'var(--text-muted)'} />
              {oneDriveSettings.enabled ? (oneDriveSettings.isDemoMode ? 'OneDrive (Demo)' : 'OneDrive Conectado') : 'Conectar OneDrive'}
            </button>
            <button className="btn-primary" onClick={() => handleOpenModal()}><Plus size={16}/> Nuevo Documento</button>
          </div>
        )}
      </div>

      <div className="card" style={{marginBottom:'1.5rem', padding:'1rem 1.5rem'}}>
        <div style={{display:'flex', alignItems:'center', gap:'0.75rem', background:'var(--bg-secondary)', padding:'0.5rem 1rem', borderRadius:'var(--radius-md)', border:'1px solid var(--border-color)'}}>
          <Search size={18} style={{color:'var(--text-muted)'}}/>
          <input 
            type="text" 
            placeholder="Buscar por código o nombre del documento..." 
            style={{border:'none', background:'transparent', outline:'none', width:'100%', color:'var(--text-primary)'}}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="card" style={{padding:0, overflow:'hidden'}}>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre del Documento</th>
                <th>Tipo / Versión</th>
                <th>Estado y Aprobación</th>
                <th>Historial</th>
                {currentFolder !== 'Obsoletos' && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {visibleDocs.length === 0 ? (
                <tr><td colSpan="6" style={{textAlign:'center', padding:'2rem'}}>No hay documentos en esta carpeta.</td></tr>
              ) : visibleDocs.map(d => {
                let badgeClass = 'badge-success';
                let Icon = CheckCircle;
                if (d.status === 'Obsoleto') { badgeClass = 'badge-danger'; Icon = Trash2; }
                else if (d.status === 'Pendiente de Aprobación') { badgeClass = 'badge-warning'; Icon = AlertCircle; }
                else if (d.status === 'Pendiente de Eliminación') { badgeClass = 'badge-danger'; Icon = AlertCircle; }

                return (
                  <tr key={d.id}>
                    <td><strong style={{color:'var(--accent-primary)'}}>{d.code}</strong></td>
                    <td style={{fontWeight:500}}>
                      {d.name}
                      {d.fileName && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '0.25rem' }}>
                          {d.oneDriveUrl ? (
                            <a href={d.oneDriveUrl} target="_blank" rel="noopener noreferrer" style={{fontSize:'0.75rem', color:'#0078d4', display:'inline-flex', alignItems:'center', gap:'0.25rem', textDecoration:'none', fontWeight: 600}} title="Abrir en Microsoft OneDrive">
                              <Cloud size={12}/> {d.fileName} (Abrir en OneDrive)
                            </a>
                          ) : null}
                          <div style={{fontSize:'0.75rem', color:'var(--info)', display:'flex', alignItems:'center', gap:'0.25rem', cursor:'pointer'}} title="Exportar Documento Oficial HSEQ" onClick={() => handleExportDoc(d)}>
                            <Paperclip size={12}/> {d.oneDriveUrl ? 'Generar Plantilla HSEQ' : `${d.fileName} (Exportar HSEQ)`}
                          </div>
                        </div>
                      )}
                    </td>
                    <td>
                      <div>{d.type}</div>
                      <div style={{fontSize:'0.75rem', color:'var(--text-muted)', marginTop:'0.25rem'}}>Versión: {d.version}</div>
                    </td>
                    <td>
                      <span className={`badge ${badgeClass}`} style={{marginBottom:'0.25rem', display:'inline-flex'}}>
                        <Icon size={12} style={{marginRight:'4px'}}/> {d.status}
                      </span>
                      {d.status === 'Vigente' && <div style={{fontSize:'0.75rem', color:'var(--text-secondary)'}}>Aprobado por: {d.approver} ({d.date})</div>}
                      {d.status === 'Pendiente de Aprobación' && isAdmin && (
                        <div style={{marginTop:'0.25rem'}}>
                          <button className="btn-secondary" style={{padding:'0.2rem 0.5rem', fontSize:'0.7rem', color:'var(--success)', borderColor:'var(--success)'}} onClick={() => handleApprove(d.id)}>
                            Autorizar
                          </button>
                        </div>
                      )}
                      {d.status === 'Pendiente de Eliminación' && isAdmin && (
                        <div style={{marginTop:'0.25rem', display:'flex', gap:'0.25rem'}}>
                          <button className="btn-secondary" style={{padding:'0.2rem 0.5rem', fontSize:'0.7rem', color:'var(--danger)', borderColor:'var(--danger)'}} onClick={() => handleApproveDelete(d.id)}>
                            Autorizar Baja
                          </button>
                          <button className="btn-secondary" style={{padding:'0.2rem 0.5rem', fontSize:'0.7rem', color:'var(--text-muted)', borderColor:'var(--border-color)'}} onClick={() => handleRejectDelete(d.id)}>
                            Rechazar
                          </button>
                        </div>
                      )}
                    </td>
                    <td>
                      <button className="btn-secondary" style={{padding:'0.25rem 0.5rem', fontSize:'0.75rem'}} onClick={() => openHistory(d)}>
                        <History size={12} style={{marginRight:'4px'}}/> Ver Control
                      </button>
                    </td>
                    {currentFolder !== 'Obsoletos' && (
                      <td>
                        <div style={{display:'flex', gap:'0.25rem'}}>
                          <button className="btn-icon" style={{padding:'0.25rem', color:'var(--text-muted)'}} title="Modificar Documento (Generar Nueva Versión)" onClick={() => handleOpenModal(d)}><Edit2 size={14}/></button>
                          <button className="btn-icon" style={{padding:'0.25rem', color:'var(--danger)'}} title="Eliminar / Pasar a Obsoletos" onClick={() => handleDeleteClick(d)}><Trash2 size={14}/></button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CREAR NUEVO */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Nuevo Documento">
        <form onSubmit={handleSubmitNew} style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
          <div className="form-group">
            <label className="form-label">Carpeta / Proceso</label>
            <select className="form-control" value={formData.folder} onChange={e => setFormData({...formData, folder: e.target.value})} required disabled={currentFolder !== 'Obsoletos' && currentFolder !== null}>
              {folders.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div style={{display:'flex', gap:'1rem'}}>
            <div className="form-group" style={{flex:1}}>
              <label className="form-label">Tipo de Documento</label>
              <select className="form-control" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} required>
                {Object.keys(typeAcronyms).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group" style={{flex:2}}>
              <label className="form-label">Código (Autogenerado)</label>
              <input type="text" className="form-control" value={generateCode(formData.type, formData.folder)} readOnly disabled style={{background:'var(--bg-secondary)', fontWeight:600}} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Nombre del Documento</label>
            <input type="text" className="form-control" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          </div>

          <div style={{display:'flex', gap:'1rem'}}>
            <div className="form-group" style={{flex:1}}>
              <label className="form-label">Origen</label>
              <select className="form-control" value={formData.origin || 'Interno'} onChange={e => setFormData({...formData, origin: e.target.value})} required>
                <option value="Interno">Interno</option>
                <option value="Externo">Externo</option>
              </select>
            </div>
            <div className="form-group" style={{flex:1}}>
              <label className="form-label">Tipo de Listado Maestro</label>
              <select className="form-control" value={formData.docType || 'Procedimiento'} onChange={e => setFormData({...formData, docType: e.target.value})} required>
                <option value="Formato">Formato</option>
                <option value="Procedimiento">Procedimiento</option>
                <option value="Instructivo">Instructivo</option>
                <option value="Matriz">Matriz</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Ubicación / Almacenamiento (Opcional)</label>
            <input type="text" className="form-control" placeholder="Ej: Servidor General / OneDrive / Archivo Físico" value={formData.location || ''} onChange={e => setFormData({...formData, location: e.target.value})} />
          </div>
          
          <div className="form-group">
            <label className="form-label">Archivo Adjunto (Opcional)</label>
            <div style={{display:'flex', alignItems:'center', gap:'0.5rem', background:'var(--bg-secondary)', padding:'0.5rem', borderRadius:'var(--radius-sm)', border:'1px dashed var(--border-color)'}}>
              <input 
                type="file" 
                id="file-upload" 
                style={{display:'none'}} 
                accept=".doc,.docx,.xls,.xlsx,.ppt,.pptx,.pdf,image/*"
                onChange={handleFileChange}
              />
              <label htmlFor="file-upload" className="btn-secondary" style={{cursor:'pointer', margin:0, padding:'0.3rem 0.75rem', fontSize:'0.8rem'}}>
                <Upload size={14} style={{marginRight:'4px'}}/> Seleccionar
              </label>
              <span style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>
                {formData.fileName ? formData.fileName : 'Ningún archivo seleccionado'}
              </span>
            </div>
            <small style={{color:'var(--text-muted)', fontSize:'0.75rem'}}>Formatos: Word, Excel, PowerPoint, PDF o Imágenes.</small>
          </div>

          <div style={{display:'flex', gap:'1rem'}}>
            <div className="form-group" style={{flex:1}}>
              <label className="form-label">Versión Inicial</label>
              <input type="text" className="form-control" value={formData.version} onChange={e => setFormData({...formData, version: e.target.value})} required />
            </div>
            <div className="form-group" style={{flex:1, display:'flex', alignItems:'flex-end', paddingBottom:'0.5rem'}}>
              <label style={{display:'flex', alignItems:'center', gap:'0.5rem', cursor:'pointer', fontSize:'0.85rem'}}>
                <input type="checkbox" checked={formData.requiresReview} onChange={e => setFormData({...formData, requiresReview: e.target.checked})} />
                Requiere Revisión Previa
              </label>
            </div>
          </div>
          {formData.requiresReview && (
            <div className="form-group">
              <label className="form-label">Usuario Revisor</label>
              <select className="form-control" value={formData.reviewer} onChange={e => setFormData({...formData, reviewer: e.target.value})} required>
                <option value="">Seleccione Usuario...</option>
                {APP_USERS.map(u => <option key={u.email} value={u.name}>{u.name}</option>)}
              </select>
            </div>
          )}
          <div style={{display:'flex', justifyContent:'flex-end', gap:'0.5rem', marginTop:'1rem'}}>
            <button type="button" className="btn-secondary" onClick={handleCloseModal}>Cancelar</button>
            <button type="submit" className="btn-primary">Radicar (Pendiente Aprobación)</button>
          </div>
        </form>
      </Modal>

      {/* MODAL CONTROL DE CAMBIOS (EDIT/DELETE) */}
      <Modal isOpen={isChangeModalOpen} onClose={() => setIsChangeModalOpen(false)} title={changeData.isDelete ? "Confirmar Eliminación de Documento" : "Control de Cambios (Nueva Versión)"}>
        {!changeData.isDelete ? (
          <form onSubmit={handleSubmitEditChange} style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
            <div style={{background:'var(--bg-secondary)', padding:'1rem', borderRadius:'var(--radius-md)'}}>
              <p style={{fontSize:'0.85rem', marginBottom:'0.5rem'}}>Modificando: <strong>{editingItem?.code} - {editingItem?.name}</strong></p>
              <p style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>La versión actual ({editingItem?.version}) pasará a la carpeta de obsoletos.</p>
            </div>
            
            <div className="form-group">
              <label className="form-label">Nombre del Documento (Si aplica cambio)</label>
              <input type="text" className="form-control" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            </div>

            <div style={{display:'flex', gap:'1rem'}}>
              <div className="form-group" style={{flex:1}}>
                <label className="form-label">Origen</label>
                <select className="form-control" value={formData.origin || 'Interno'} onChange={e => setFormData({...formData, origin: e.target.value})} required>
                  <option value="Interno">Interno</option>
                  <option value="Externo">Externo</option>
                </select>
              </div>
              <div className="form-group" style={{flex:1}}>
                <label className="form-label">Tipo de Listado Maestro</label>
                <select className="form-control" value={formData.docType || 'Procedimiento'} onChange={e => setFormData({...formData, docType: e.target.value})} required>
                  <option value="Formato">Formato</option>
                  <option value="Procedimiento">Procedimiento</option>
                  <option value="Instructivo">Instructivo</option>
                  <option value="Matriz">Matriz</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Ubicación / Almacenamiento (Opcional)</label>
              <input type="text" className="form-control" placeholder="Ej: Servidor General / OneDrive / Archivo Físico" value={formData.location || ''} onChange={e => setFormData({...formData, location: e.target.value})} />
            </div>

            <div className="form-group">
              <label className="form-label">Nueva Versión</label>
              <input type="text" className="form-control" value={formData.version} onChange={e => setFormData({...formData, version: e.target.value})} required />
            </div>

            <div className="form-group">
              <label className="form-label">Actualizar Archivo (Opcional)</label>
              <div style={{display:'flex', alignItems:'center', gap:'0.5rem', background:'var(--bg-secondary)', padding:'0.5rem', borderRadius:'var(--radius-sm)', border:'1px dashed var(--border-color)'}}>
                <input 
                  type="file" 
                  id="file-upload-edit" 
                  style={{display:'none'}} 
                  accept=".doc,.docx,.xls,.xlsx,.ppt,.pptx,.pdf,image/*"
                  onChange={handleFileChange}
                />
                <label htmlFor="file-upload-edit" className="btn-secondary" style={{cursor:'pointer', margin:0, padding:'0.3rem 0.75rem', fontSize:'0.8rem'}}>
                  <Upload size={14} style={{marginRight:'4px'}}/> Cambiar Archivo
                </label>
                <span style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>
                  {formData.fileName ? formData.fileName : 'Mantener archivo actual'}
                </span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Motivo del Cambio / Detalle (OBLIGATORIO)</label>
              <textarea className="form-control" value={changeData.reason} onChange={e => setChangeData({...changeData, reason: e.target.value})} rows="3" required placeholder="Describa qué se modificó en esta nueva versión..."></textarea>
            </div>
            <div style={{display:'flex', justifyContent:'flex-end', gap:'0.5rem', marginTop:'1rem'}}>
              <button type="button" className="btn-secondary" onClick={() => setIsChangeModalOpen(false)}>Cancelar</button>
              <button type="submit" className="btn-primary">Guardar Nueva Versión</button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmitEditChange} style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
            <div style={{background:'rgba(239, 68, 68, 0.05)', border:'1px solid var(--danger)', padding:'1rem', borderRadius:'var(--radius-md)'}}>
              <p style={{fontSize:'0.85rem', color:'var(--danger)', marginBottom:'0.5rem'}}><AlertCircle size={16} style={{verticalAlign:'middle'}}/> Advertencia de Eliminación</p>
              <p style={{fontSize:'0.8rem'}}>El documento <strong>{editingItem?.code} - {editingItem?.name}</strong> será retirado del listado maestro y enviado a Obsoletos.</p>
            </div>
            <div className="form-group">
              <label className="form-label">Motivo de Eliminación (OBLIGATORIO)</label>
              <textarea className="form-control" value={changeData.reason} onChange={e => setChangeData({...changeData, reason: e.target.value})} rows="3" required placeholder="Ej: Reemplazado por el procedimiento PR-SST-05..."></textarea>
            </div>
            <div style={{display:'flex', justifyContent:'flex-end', gap:'0.5rem', marginTop:'1rem'}}>
              <button type="button" className="btn-secondary" onClick={() => setIsChangeModalOpen(false)}>Cancelar</button>
              <button type="submit" className="btn-primary" style={{background:'var(--danger)', borderColor:'var(--danger)'}}>Confirmar Eliminación</button>
            </div>
          </form>
        )}
      </Modal>

      {/* MODAL HISTORIAL DE CAMBIOS */}
      <Modal isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)} title="Historial y Control de Cambios">
        {historyItem && (
          <div style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
            <div style={{borderBottom:'1px solid var(--border-color)', paddingBottom:'1rem'}}>
              <h4 style={{fontSize:'1.1rem'}}>{historyItem.code} - {historyItem.name}</h4>
              <p style={{fontSize:'0.85rem', color:'var(--text-secondary)'}}>Estado Actual: {historyItem.status} | Versión: {historyItem.version}</p>
            </div>
            
            <div style={{display:'flex', flexDirection:'column', gap:'0.75rem'}}>
              {(historyItem.history || []).slice().reverse().map((h, i) => (
                <div key={i} style={{background:'var(--bg-secondary)', padding:'1rem', borderRadius:'var(--radius-md)', borderLeft:'3px solid var(--accent-primary)'}}>
                  <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.5rem'}}>
                    <strong style={{fontSize:'0.9rem'}}>Versión {h.version}</strong>
                    <span style={{fontSize:'0.8rem', color:'var(--text-muted)'}}><Clock size={12} style={{verticalAlign:'middle', marginRight:'2px'}}/> {h.date}</span>
                  </div>
                  <p style={{fontSize:'0.85rem', marginBottom:'0.5rem', color:'var(--text-primary)'}}>{h.changes}</p>
                  <div style={{fontSize:'0.75rem', color:'var(--text-secondary)'}}>Usuario: {h.user}</div>
                </div>
              ))}
              {(!historyItem.history || historyItem.history.length === 0) && (
                <div style={{textAlign:'center', padding:'1rem', color:'var(--text-muted)', fontSize:'0.85rem'}}>
                  No hay registro de historial para este documento.
                </div>
              )}
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
        contentHtml={exportConfig.contentHtml}
        columns={exportConfig.columns}
        data={exportConfig.data}
        history={exportConfig.history}
      />



      {isUploading && (
        <>
          <style>{`
            @keyframes oneDriveSpinner {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            .onedrive-spin {
              animation: oneDriveSpinner 1.2s linear infinite;
            }
          `}</style>
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
            background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)',
            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
            gap: '1rem', zIndex: 99999, color: 'white'
          }}>
            <RefreshCw size={36} className="onedrive-spin" color="#0078d4" />
            <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>Subiendo archivo a Microsoft OneDrive...</span>
            <div style={{ width: '300px', height: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${uploadProgress}%`, height: '100%', background: '#0078d4', transition: 'width 0.1s ease-out' }}></div>
            </div>
            <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>{uploadProgress}% completado</span>
          </div>
        </>
      )}
    </>
  );
}
