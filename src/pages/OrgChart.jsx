import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, Download } from 'lucide-react';
import Modal from '../components/Modal';
import { useLocalStorage } from '../hooks/useLocalStorage';
import html2canvas from 'html2canvas';

// Componente recursivo para dibujar el árbol
const TreeNode = ({ node, onEdit, onDelete, level = 0, parentLayout = 'horizontal', isFirstChild = false, isLastChild = false }) => {
  const hasChildren = node.children && node.children.length > 0;
  const childrenLayout = node.layout || 'horizontal';

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: childrenLayout === 'vertical' ? 'flex-start' : 'center',
      width: '100%',
      position: 'relative'
    }}>
      {/* Tarjeta y sus conectores verticales/horizontales */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        position: 'relative', 
        flexShrink: 0,
        width: '100%'
      }}>
        {/* Si el diseño del padre es vertical, dibujamos conectores a la izquierda */}
        {parentLayout === 'vertical' && (
          <>
            {/* Línea vertical del tronco */}
            <div style={{
              position: 'absolute',
              left: '-30px',
              top: isFirstChild ? '50%' : '0',
              bottom: isLastChild ? '50%' : '0',
              width: '2px',
              background: 'var(--accent-primary, #4f46e5)',
              zIndex: 1
            }}></div>
            
            {/* Línea horizontal de la rama */}
            <div style={{
              position: 'absolute',
              left: '-30px',
              width: '30px',
              top: '50%',
              height: '2px',
              background: 'var(--accent-primary, #4f46e5)',
              zIndex: 1
            }}></div>
          </>
        )}

        {/* Conectores si el padre es horizontal */}
        {level > 0 && parentLayout === 'horizontal' && (
          <div style={{ 
            position: 'relative', 
            width: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            height: '20px'
          }}>
            {/* Línea horizontal izquierda */}
            {!isFirstChild && (
              <div style={{
                position: 'absolute',
                left: '0',
                right: '50%',
                top: '0',
                height: '2px',
                background: 'var(--accent-primary, #4f46e5)',
                zIndex: 1
              }}></div>
            )}
            {/* Línea horizontal derecha */}
            {!isLastChild && (
              <div style={{
                position: 'absolute',
                left: '50%',
                right: '0',
                top: '0',
                height: '2px',
                background: 'var(--accent-primary, #4f46e5)',
                zIndex: 1
              }}></div>
            )}
            {/* Línea vertical hacia la tarjeta */}
            <div style={{
              width: '2px',
              height: '20px',
              background: 'var(--accent-primary, #4f46e5)',
              zIndex: 1
            }}></div>
          </div>
        )}
        
        {/* Tarjeta del Nodo */}
        <div className="card" style={{ 
          padding: '0.85rem 1rem', 
          borderTop: '4px solid var(--accent-primary, #4f46e5)', 
          minWidth: '220px', 
          textAlign: 'center', 
          margin: '0 0.75rem',
          position: 'relative',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          background: '#ffffff', // Fondo explícito blanco para captura limpia de html2canvas
          zIndex: 2
        }}>
          <h4 style={{ fontSize: '0.92rem', marginBottom: '0.35rem', color: '#1e293b', fontWeight: 700 }}>{node.role}</h4>
          <div style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 500 }}>
            {node.name && node.name.includes(' / ') ? (
              node.name.split(' / ').map((name, idx) => (
                <span key={idx} style={{ display: 'block', borderTop: idx > 0 ? '1px dashed var(--border-color, #e2e8f0)' : 'none', marginTop: idx > 0 ? '4px' : '0', paddingTop: idx > 0 ? '4px' : '0' }}>{name}</span>
              ))
            ) : (
              node.name || <span style={{color:'var(--text-muted, #94a3b8)', fontStyle:'italic', fontSize:'0.72rem'}}>Vacante</span>
            )}
          </div>
          
          <div data-html2canvas-ignore="true" style={{ position: 'absolute', top: '4px', right: '4px', display: 'flex', gap: '4px' }}>
            <button className="btn-icon" style={{ padding: '4px', color: 'var(--text-muted, #94a3b8)' }} onClick={() => onEdit(node)} title="Editar"><Edit2 size={12}/></button>
            {level > 0 && <button className="btn-icon" style={{ padding: '4px', color: 'var(--danger, #ef4444)' }} onClick={() => onDelete(node.id)} title="Eliminar"><Trash2 size={12}/></button>}
          </div>
        </div>
      </div>

      {/* Hijos */}
      {hasChildren && (
        childrenLayout === 'vertical' ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%' }}>
            {/* Tronco que baja de la tarjeta del padre a la sección de hijos */}
            <div style={{ 
              width: '2px', 
              height: '15px', 
              background: 'var(--accent-primary, #4f46e5)', 
              marginLeft: '122px', 
              flexShrink: 0 
            }}></div>
            
            {/* Contenedor de los hijos con sangría */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'flex-start', 
              paddingLeft: '30px', 
              marginLeft: '122px', 
              gap: '15px',
              width: '100%'
            }}>
              {node.children.map((child, idx) => (
                <TreeNode 
                  key={child.id} 
                  node={child} 
                  onEdit={onEdit} 
                  onDelete={onDelete} 
                  level={level + 1} 
                  parentLayout={childrenLayout}
                  isFirstChild={idx === 0}
                  isLastChild={idx === node.children.length - 1}
                />
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Tronco vertical que baja del padre */}
            <div style={{ width: '2px', height: '20px', background: 'var(--accent-primary, #4f46e5)' }}></div>
            {/* Contenedor de los hijos */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 0 }}>
              {node.children.map((child, idx) => (
                <TreeNode 
                  key={child.id} 
                  node={child} 
                  onEdit={onEdit} 
                  onDelete={onDelete} 
                  level={level + 1} 
                  parentLayout={childrenLayout}
                  isFirstChild={idx === 0}
                  isLastChild={idx === node.children.length - 1}
                />
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
};

const NEW_ORG_DATA = {
  id: 'root',
  role: 'Gerente',
  name: 'Francisco Collavini',
  layout: 'horizontal',
  children: [
    {
      id: 'nodo-adm',
      role: 'Dirección Administrativa',
      name: 'Jose Domingo',
      layout: 'horizontal',
      children: [
        {
          id: 'nodo-control',
          role: 'Centro de Control de la gestión',
          name: 'Andres Rodriguez',
          children: []
        },
        {
          id: 'nodo-sig',
          role: 'Sistemas Integrados de Gestión',
          name: 'John Jimenez (Calidad) / Sandy Gutierrez (SST) / Lucerys Oñate (SST) / Miriam Ardila (Ambiental) / Yorleidys Villalobo (PESV)',
          layout: 'horizontal',
          children: [
            {
              id: 'nodo-elec',
              role: 'P. Electrico',
              name: 'coord SST / Inspectores SST',
              children: []
            },
            {
              id: 'nodo-telecom',
              role: 'P. telecomunicaciones',
              name: 'coord SST / Inspectores SST',
              children: []
            }
          ]
        },
        {
          id: 'nodo-jur',
          role: 'Gestión Jurídica',
          name: 'Carol Fabregas',
          children: []
        }
      ]
    },
    {
      id: 'nodo-lic',
      role: 'Licitaciones y contrataciones',
      name: 'Paola Berdugo',
      children: []
    },
    {
      id: 'nodo-th',
      role: 'Gestión de Talento Humano',
      name: 'Valeria Pedroza',
      children: []
    },
    {
      id: 'nodo-fin',
      role: 'Dirección contable y financiera',
      name: 'Jorge Jaraba',
      children: []
    },
    {
      id: 'nodo-maint',
      role: 'Mantenimiento de Plantas',
      name: 'Vanessa Bello',
      children: []
    },
    {
      id: 'nodo-sis',
      role: 'Gestión de Sistemas',
      name: 'Edwin Vasquez',
      children: []
    },
    {
      id: 'nodo-log',
      role: 'Logística y almacén',
      name: 'Claudia Guzman',
      children: []
    },
    {
      id: 'nodo-proj',
      role: 'Gestión de Proyectos',
      name: '',
      layout: 'horizontal',
      children: [
        {
          id: 'nodo-proj-elec',
          role: 'P. Electricos',
          name: 'Yelmis Gomez',
          layout: 'horizontal',
          children: [
            { id: 'nodo-proj-elec-afinia', role: 'P. AFINIA', name: '', children: [] },
            { id: 'nodo-proj-elec-aire', role: 'P. AIR-E BQ', name: '', children: [] },
            { id: 'nodo-proj-elec-emsa', role: 'P. EMSA', name: '', children: [] },
            { id: 'nodo-proj-elec-dispac', role: 'P. DISPAC', name: '', children: [] },
            { id: 'nodo-proj-elec-electrohuila', role: 'P. ELECTROHUILA', name: '', children: [] },
            { id: 'nodo-proj-elec-hseq', role: 'HSEQ', name: '', children: [] }
          ]
        },
        {
          id: 'nodo-proj-telecom',
          role: 'P. Telecomunicaciones',
          name: 'Calixto Maestre',
          layout: 'horizontal',
          children: [
            { id: 'nodo-proj-telecom-tigo', role: 'P. Tigo', name: '', children: [] },
            { id: 'nodo-proj-telecom-movistar', role: 'P. Movistar', name: '', children: [] }
          ]
        }
      ]
    }
  ]
};

export default function OrgChart() {
  const [orgData, setOrgData] = useLocalStorage('sgi_org_chart', NEW_ORG_DATA);

  const [meta, setMeta] = useLocalStorage('sgi_org_chart_meta', {
    version: 'V.10',
    approvalDate: '2026-06-26'
  });

  // Auto-migration effect
  useEffect(() => {
    if (meta.version !== 'V.10') {
      setOrgData(NEW_ORG_DATA);
      setMeta({
        version: 'V.10',
        approvalDate: '2026-06-26'
      });
    }
  }, [meta.version]);

  const [zoom, setZoom] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNode, setEditingNode] = useState(null);
  const [isAddingMode, setIsAddingMode] = useState(false); // true si estamos añadiendo un hijo a un nodo
  const [formData, setFormData] = useState({ role: '', name: '', parentId: '', originalParentId: '', layout: 'horizontal' });

  // Nuevas variables de estado para el visor de archivos externos
  const [viewMode, setViewMode] = useLocalStorage('sgi_org_chart_view_mode', 'interactive');
  const [uploadedFile, setUploadedFile] = useLocalStorage('sgi_org_chart_uploaded_file', null);
  const [embedLink, setEmbedLink] = useLocalStorage('sgi_org_chart_embed_link', '');
  
  const [embedLinkInput, setEmbedLinkInput] = useState('');
  const [imgZoom, setImgZoom] = useState(1);

  // flat nodes list for selection
  const getFlatNodes = (node, excludeId = null) => {
    if (excludeId && node.id === excludeId) return [];
    const list = [{ id: node.id, role: node.role, name: node.name }];
    if (node.children) {
      for (let child of node.children) {
        list.push(...getFlatNodes(child, excludeId));
      }
    }
    return list;
  };

  const getNodesForParentSelect = (rootNode, nodeToMove) => {
    if (!nodeToMove || nodeToMove.id === rootNode.id) return [];
    return getFlatNodes(rootNode, nodeToMove.id);
  };

  const findParentNode = (node, childId) => {
    if (!node.children) return null;
    if (node.children.some(c => c.id === childId)) return node;
    for (let child of node.children) {
      const p = findParentNode(child, childId);
      if (p) return p;
    }
    return null;
  };

  const moveNode = (rootNode, nodeId, newParentId) => {
    let nodeToMove = null;
    
    const extract = (node) => {
      if (!node.children) return false;
      const index = node.children.findIndex(c => c.id === nodeId);
      if (index !== -1) {
        nodeToMove = node.children[index];
        node.children = node.children.filter(c => c.id !== nodeId);
        return true;
      }
      for (let child of node.children) {
        if (extract(child)) return true;
      }
      return false;
    };
    
    const rootCopy = JSON.parse(JSON.stringify(rootNode));
    extract(rootCopy);
    
    if (!nodeToMove) return rootNode;
    
    const insert = (node) => {
      if (node.id === newParentId) {
        node.children = [...(node.children || []), nodeToMove];
        return true;
      }
      if (node.children) {
        for (let child of node.children) {
          if (insert(child)) return true;
        }
      }
      return false;
    };
    
    insert(rootCopy);
    return rootCopy;
  };

  // Utilidad para buscar y modificar nodos en el árbol
  const findNode = (node, id) => {
    if (node.id === id) return node;
    if (node.children) {
      for (let child of node.children) {
        const found = findNode(child, id);
        if (found) return found;
      }
    }
    return null;
  };

  const updateNode = (node, id, newData) => {
    if (node.id === id) return { ...node, ...newData };
    if (node.children) {
      return { ...node, children: node.children.map(child => updateNode(child, id, newData)) };
    }
    return node;
  };

  const deleteNode = (node, id) => {
    if (node.children) {
      node.children = node.children.filter(child => child.id !== id);
      node.children = node.children.map(child => deleteNode({ ...child }, id));
    }
    return node;
  };

  const addChildNode = (node, parentId, newNode) => {
    if (node.id === parentId) {
      return { ...node, children: [...(node.children || []), newNode] };
    }
    if (node.children) {
      return { ...node, children: node.children.map(child => addChildNode(child, parentId, newNode)) };
    }
    return node;
  };

  const handleEdit = (node) => {
    setEditingNode(node);
    setIsAddingMode(false);
    const parent = findParentNode(orgData, node.id);
    setFormData({ 
      role: node.role, 
      name: node.name,
      parentId: parent ? parent.id : '',
      originalParentId: parent ? parent.id : '',
      layout: node.layout || 'horizontal'
    });
    setIsModalOpen(true);
  };

  const handleAddChild = () => {
    if (!editingNode) return;
    setIsAddingMode(true);
    setFormData({ role: '', name: '', parentId: '', originalParentId: '', layout: 'horizontal' });
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Está seguro de eliminar este rol y todos los que dependen de él?")) {
      setOrgData(prev => deleteNode({ ...prev }, id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isAddingMode) {
      // Añadir hijo
      const newNode = { id: `nodo-${Date.now()}`, role: formData.role, name: formData.name, layout: 'horizontal', children: [] };
      setOrgData(prev => addChildNode({ ...prev }, editingNode.id, newNode));
    } else {
      // Actualizar nodo
      let updated = updateNode({ ...orgData }, editingNode.id, { role: formData.role, name: formData.name, layout: formData.layout });
      // Si el nodo padre cambió, moverlo
      if (formData.parentId && formData.parentId !== formData.originalParentId) {
        updated = moveNode(updated, editingNode.id, formData.parentId);
      }
      setOrgData(updated);
    }
    setIsModalOpen(false);
  };

  const handleFileSelected = (file) => {
    if (file.size > 5 * 1024 * 1024) {
      alert("El archivo supera el límite de 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setUploadedFile({
        name: file.name,
        type: file.type,
        data: reader.result
      });
      setEmbedLink('');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveEmbedLink = () => {
    if (!embedLinkInput.trim()) return;
    setEmbedLink(embedLinkInput.trim());
    setUploadedFile(null);
  };

  const handleClearFile = () => {
    if (window.confirm("¿Está seguro de eliminar este archivo o enlace?")) {
      setUploadedFile(null);
      setEmbedLink('');
      setEmbedLinkInput('');
    }
  };

  useEffect(() => {
    if (embedLink) {
      setEmbedLinkInput(embedLink);
    }
  }, [embedLink]);

  const handleExportImage = () => {
    const treeElement = document.getElementById('interactive-org-tree');
    if (!treeElement) {
      alert("No se pudo encontrar el contenedor del organigrama.");
      return;
    }

    const originalZoom = zoom;

    // Temporalmente quitamos escalados y transiciones para hacer captura a escala real 1:1
    treeElement.style.transform = 'none';
    treeElement.style.transition = 'none';

    setTimeout(() => {
      html2canvas(treeElement, {
        backgroundColor: '#ffffff',
        scale: 2, // Calidad de alta resolución
        useCORS: true,
        allowTaint: true,
        scrollX: 0,
        scrollY: 0,
        windowWidth: treeElement.scrollWidth,
        windowHeight: treeElement.scrollHeight
      }).then((canvas) => {
        // Restauramos el zoom interactivo original
        treeElement.style.transform = `scale(${originalZoom})`;
        treeElement.style.transition = 'transform 0.15s ease-out';

        // Descarga
        const imgData = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = imgData;
        link.download = `Organigrama_FSCR_Ingenieria_${new Date().toISOString().split('T')[0]}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }).catch((err) => {
        treeElement.style.transform = `scale(${originalZoom})`;
        treeElement.style.transition = 'transform 0.15s ease-out';
        console.error(err);
        alert("Ocurrió un error al generar la imagen del organigrama.");
      });
    }, 150);
  };

  const handleExport = () => {
    if (viewMode === 'interactive') {
      handleExportImage();
    } else if (uploadedFile) {
      // Descargar el archivo externo de forma directa
      const link = document.createElement('a');
      link.href = uploadedFile.data;
      link.download = uploadedFile.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      window.print();
    }
  };

  return (
    <>
      <div style={{display:'flex', justifyContent:'space-between', marginBottom:'1.5rem', alignItems:'center', flexWrap:'wrap', gap:'1rem'}}>
        <div>
          <p style={{color:'var(--text-secondary)', marginBottom:'0.25rem'}}>Estructura Organizacional</p>
          <div style={{display:'flex', alignItems:'center', gap:'0.5rem', flexWrap:'wrap'}}>
            <h2 style={{fontSize:'1.5rem', fontWeight:600, margin:0}}>Organigrama</h2>
            <span style={{fontSize:'0.8rem', color:'var(--text-muted)', marginLeft:'0.5rem'}}>| <strong>Versión:</strong> {meta.version}</span>
            <span style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>| <strong>Fecha Aprobación:</strong> {meta.approvalDate}</span>
          </div>
        </div>
        <div style={{display:'flex', gap:'0.5rem', flexWrap:'wrap', alignItems:'center'}}>
          {viewMode === 'interactive' && (
            <div style={{display:'flex', gap:'4px', background:'var(--bg-secondary)', padding:'2px', borderRadius:'var(--radius-md)', border:'1px solid var(--border-color)', marginRight:'0.5rem'}}>
              <button className="btn-icon btn-secondary" style={{padding:'0.3rem 0.6rem', fontSize:'0.75rem'}} onClick={() => setZoom(z => Math.max(0.4, z - 0.1))} title="Alejar">-</button>
              <span style={{fontSize:'0.75rem', padding:'0 0.5rem', alignSelf:'center', fontWeight:600}}>{Math.round(zoom * 100)}%</span>
              <button className="btn-icon btn-secondary" style={{padding:'0.3rem 0.6rem', fontSize:'0.75rem'}} onClick={() => setZoom(z => Math.min(1.5, z + 0.1))} title="Acercar">+</button>
              <button className="btn-secondary" style={{padding:'0.3rem 0.6rem', fontSize:'0.75rem', height:'auto'}} onClick={() => setZoom(1)} title="Restablecer">100%</button>
            </div>
          )}
          <button className="btn-primary" onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Download size={16}/> Exportar como Imagen
          </button>
          <button className="btn-secondary" onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            Imprimir PDF
          </button>
        </div>
      </div>

      {/* Selector de modo de vista (Tabs) */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
        <button 
          className={viewMode === 'interactive' ? 'btn-primary' : 'btn-secondary'} 
          style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', height: 'auto' }} 
          onClick={() => setViewMode('interactive')}
        >
          Organigrama Interactivo (Sistema)
        </button>
        <button 
          className={viewMode === 'file' ? 'btn-primary' : 'btn-secondary'} 
          style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', height: 'auto' }} 
          onClick={() => setViewMode('file')}
        >
          Visor de Archivo Externo (Excel/PDF/Imagen)
        </button>
      </div>

      {viewMode === 'interactive' ? (
        <div 
          className="card" 
          style={{ 
            padding: '3rem 1rem', 
            overflowX: 'auto', 
            overflowY: 'auto',
            minHeight: '65vh', 
            display: 'flex', 
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            position: 'relative'
          }}
        >
          <div 
            id="interactive-org-tree"
            style={{ 
              transform: `scale(${zoom})`, 
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease-out',
              display: 'inline-block',
              margin: '0 auto',
              padding: '2rem',
              background: '#ffffff' // Fondo blanco absoluto para captura de html2canvas
            }}
          >
            <TreeNode node={orgData} onEdit={handleEdit} onDelete={handleDelete} />
          </div>
        </div>
      ) : (
        !uploadedFile && !embedLink ? (
          <div className="card" style={{ padding: '3rem 2rem', minHeight: '65vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2rem' }}>
            <div style={{ maxWidth: '500px', width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>Cargar Organigrama Externo</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Sube un archivo PDF o una imagen del organigrama generado desde Excel, o pega un enlace de incrustación de OneDrive.</p>
              </div>
              
              {/* Dropzone para archivos */}
              <div style={{
                border: '2px dashed var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                padding: '2.5rem 1.5rem',
                background: 'var(--bg-secondary)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.75rem'
              }}
              onClick={() => document.getElementById('file-upload-input').click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) handleFileSelected(file);
              }}
              >
                <input 
                  type="file" 
                  id="file-upload-input" 
                  accept="image/*,application/pdf" 
                  style={{ display: 'none' }} 
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) handleFileSelected(file);
                  }}
                />
                <Plus size={32} style={{ color: 'var(--accent-primary)' }} />
                <div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--accent-primary)' }}>Selecciona un archivo</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}> o arrástralo aquí</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Formatos soportados: PDF, PNG, JPG (Máx. 5MB)</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
                <span>O BIEN</span>
                <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
              </div>

              {/* Campo para enlace de OneDrive */}
              <div className="form-group" style={{ textAlign: 'left' }}>
                <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Enlace de Incrustación de OneDrive (Excel Live)</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Ej: https://onedrive.live.com/embed?cid=..." 
                    value={embedLinkInput}
                    onChange={(e) => setEmbedLinkInput(e.target.value)}
                  />
                  <button className="btn-primary" onClick={handleSaveEmbedLink}>Vincular</button>
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.35rem', display: 'block' }}>
                  Obtén este enlace en OneDrive Web seleccionando el archivo de Excel y eligiendo "Incrustar" (Embed).
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="card" style={{ padding: '1rem', minHeight: '65vh', position: 'relative', display: 'flex', flexDirection: 'column' }}>
            
            {/* Barra de herramientas superior del visor */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {uploadedFile ? `Archivo Cargado: ${uploadedFile.name}` : 'Enlace OneDrive Activo'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {uploadedFile?.type?.includes('image') && (
                  <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-secondary)', padding: '2px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginRight: '0.5rem' }}>
                    <button className="btn-icon btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={() => setImgZoom(z => Math.max(0.5, z - 0.1))} title="Alejar">-</button>
                    <span style={{ fontSize: '0.75rem', padding: '0 0.5rem', alignSelf: 'center', fontWeight: 600 }}>{Math.round(imgZoom * 100)}%</span>
                    <button className="btn-icon btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={() => setImgZoom(z => Math.min(2.5, z + 0.1))} title="Acercar">+</button>
                    <button className="btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', height: 'auto' }} onClick={() => setImgZoom(1)} title="Restablecer">100%</button>
                  </div>
                )}
                <button className="btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }} onClick={handleClearFile}>
                  Cambiar / Eliminar Archivo
                </button>
              </div>
            </div>

            {/* Visualización real */}
            <div style={{ 
              flex: 1, 
              overflow: 'auto', 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              minHeight: '55vh'
            }}>
              {embedLink ? (
                <iframe 
                  src={embedLink} 
                  style={{ width: '100%', height: '65vh', border: 'none' }} 
                  allowFullScreen 
                  title="Excel OrgChart Viewer"
                />
              ) : uploadedFile?.type === 'application/pdf' ? (
                <iframe 
                  src={uploadedFile.data} 
                  style={{ width: '100%', height: '65vh', border: 'none' }} 
                  title="PDF OrgChart Viewer"
                />
              ) : (
                <div style={{ overflow: 'auto', width: '100%', height: '65vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <img 
                    src={uploadedFile?.data} 
                    alt="Organigrama Cargado" 
                    style={{ 
                      transform: `scale(${imgZoom})`, 
                      transformOrigin: 'center center',
                      transition: 'transform 0.15s ease-out',
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain'
                    }} 
                  />
                </div>
              )}
            </div>
          </div>
        )
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isAddingMode ? `Añadir Dependencia a: ${editingNode?.role}` : "Editar Rol"}>
        <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
          <div className="form-group">
            <label className="form-label">Cargo / Rol</label>
            <input type="text" className="form-control" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} required placeholder="Ej: Director Financiero" />
          </div>
          <div className="form-group">
            <label className="form-label">Nombre del Colaborador (Opcional)</label>
            <input type="text" className="form-control" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ej: Juan Pérez" />
          </div>

          {!isAddingMode && (
            <div className="form-group">
              <label className="form-label">Diseño de Subordinados (Hijos)</label>
              <select 
                className="form-control" 
                value={formData.layout || 'horizontal'} 
                onChange={e => setFormData({...formData, layout: e.target.value})}
              >
                <option value="horizontal">Horizontal (Estándar)</option>
                <option value="vertical">Vertical (Compacto / Colgante)</option>
              </select>
            </div>
          )}
          
          {!isAddingMode && editingNode?.id !== 'root' && (
            <div className="form-group">
              <label className="form-label">Superior Inmediato (Reporta a)</label>
              <select 
                className="form-control" 
                value={formData.parentId} 
                onChange={e => setFormData({...formData, parentId: e.target.value})}
                required
              >
                {getNodesForParentSelect(orgData, editingNode).map(n => (
                  <option key={n.id} value={n.id}>{n.role} {n.name ? `(${n.name})` : '(Vacante)'}</option>
                ))}
              </select>
            </div>
          )}
          
          {!isAddingMode && (
            <div style={{borderTop:'1px solid var(--border-color)', paddingTop:'1rem', marginTop:'0.5rem'}}>
              <button type="button" className="btn-secondary" style={{width:'100%', justifyContent:'center'}} onClick={handleAddChild}>
                <Plus size={16}/> Añadir un Cargo Subordinado (Dependencia)
              </button>
            </div>
          )}

          <div style={{display:'flex', justifyContent:'flex-end', gap:'0.5rem', marginTop:'1rem'}}>
            <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn-primary">{isAddingMode ? "Crear Cargo" : "Guardar Cambios"}</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
