import React, { useState } from 'react';
import { Server, Shield, Plus, Edit2, Trash2, Download } from 'lucide-react';
import Modal from '../components/Modal';
import { downloadCSV } from '../utils/exportUtils';
import { useLocalStorage } from '../hooks/useLocalStorage';

export default function Infosec() {
  const [assets, setAssets] = useLocalStorage('sgi_infosec_assets', [
    { id: 1, name: 'Base de Datos Clientes', type: 'Datos', owner: 'TI', c: 3, i: 3, d: 3 },
    { id: 2, name: 'Servidor Principal', type: 'Hardware', owner: 'TI', c: 2, i: 3, d: 3 },
    { id: 3, name: 'Código Fuente App', type: 'Software', owner: 'Desarrollo', c: 3, i: 3, d: 2 },
    { id: 4, name: 'Manuales Públicos', type: 'Documento', owner: 'Calidad', c: 1, i: 2, d: 3 }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '', type: 'Datos', owner: '', c: 1, i: 1, d: 1
  });

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({ ...item });
    } else {
      setEditingItem(null);
      setFormData({ name: '', type: 'Datos', owner: '', c: 1, i: 1, d: 1 });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingItem) {
      setAssets(assets.map(a => a.id === editingItem.id ? { ...formData, id: a.id } : a));
    } else {
      setAssets([...assets, { ...formData, id: Date.now() }]);
    }
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Está seguro de eliminar este activo de información?")) {
      setAssets(assets.filter(a => a.id !== id));
    }
  };

  const handleExport = () => downloadCSV(assets, "Inventario_Activos_Info");

  return (
    <>
      <div style={{display:'flex', justifyContent:'space-between', marginBottom:'1.5rem', alignItems:'center', flexWrap:'wrap', gap:'1rem'}}>
        <div>
          <p style={{color:'var(--text-secondary)', marginBottom:'0.25rem'}}>Inventario de Activos de Información (ISO 27001)</p>
          <span className="badge badge-info"><Shield size={12} style={{marginRight:'4px'}}/> Evaluación CID (1-3)</span>
        </div>
        <div style={{display:'flex', gap:'0.5rem', flexWrap:'wrap'}}>
          <button className="btn-secondary" onClick={handleExport}><Download size={16}/> Exportar Inventario</button>
          <button className="btn-primary" onClick={() => handleOpenModal()}><Plus size={16}/> Nuevo Activo</button>
        </div>
      </div>

      <div className="card" style={{padding:0, overflow:'hidden'}}>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Activo</th>
                <th>Tipo</th>
                <th>Custodio</th>
                <th title="Confidencialidad">C</th>
                <th title="Integridad">I</th>
                <th title="Disponibilidad">D</th>
                <th>Nivel Riesgo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {assets.length === 0 ? (
                <tr><td colSpan="8" style={{textAlign:'center', padding:'2rem'}}>No hay registros.</td></tr>
              ) : assets.map(a => {
                const score = a.c + a.i + a.d;
                let riskClass = score >= 8 ? 'badge-danger' : score >= 6 ? 'badge-warning' : 'badge-success';
                let riskText = score >= 8 ? 'Alto' : score >= 6 ? 'Medio' : 'Bajo';

                return (
                  <tr key={a.id}>
                    <td><strong>{a.name}</strong></td>
                    <td>{a.type}</td>
                    <td>{a.owner}</td>
                    <td style={{textAlign:'center'}}>{a.c}</td>
                    <td style={{textAlign:'center'}}>{a.i}</td>
                    <td style={{textAlign:'center'}}>{a.d}</td>
                    <td><span className={`badge ${riskClass}`}>{score}/9 - {riskText}</span></td>
                    <td>
                      <div style={{display:'flex', gap:'0.25rem'}}>
                        <button className="btn-icon" style={{padding:'0.25rem', color:'var(--text-muted)'}} onClick={() => handleOpenModal(a)}><Edit2 size={14}/></button>
                        <button className="btn-icon" style={{padding:'0.25rem', color:'var(--danger)'}} onClick={() => handleDelete(a.id)}><Trash2 size={14}/></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingItem ? "Editar Activo de Información" : "Nuevo Activo de Información"}
      >
        <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
          <div className="form-group">
            <label className="form-label">Nombre del Activo</label>
            <input type="text" className="form-control" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          </div>
          <div style={{display:'flex', gap:'1rem'}}>
            <div className="form-group" style={{flex:1}}>
              <label className="form-label">Tipo de Activo</label>
              <select className="form-control" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} required>
                <option value="Datos">Datos</option>
                <option value="Hardware">Hardware</option>
                <option value="Software">Software</option>
                <option value="Servicios">Servicios</option>
                <option value="Personas">Personas</option>
                <option value="Documento">Documento</option>
                <option value="Intangible">Intangible</option>
              </select>
            </div>
            <div className="form-group" style={{flex:1}}>
              <label className="form-label">Propietario / Custodio</label>
              <input type="text" className="form-control" value={formData.owner} onChange={e => setFormData({...formData, owner: e.target.value})} required />
            </div>
          </div>
          
          <div style={{background:'var(--bg-secondary)', padding:'1rem', borderRadius:'var(--radius-md)'}}>
            <h4 style={{fontSize:'0.85rem', marginBottom:'1rem', color:'var(--text-secondary)'}}>Evaluación de Seguridad (1=Baja, 2=Media, 3=Alta)</h4>
            <div style={{display:'flex', gap:'1rem'}}>
              <div className="form-group" style={{flex:1}}>
                <label className="form-label">Confidencialidad (C)</label>
                <select className="form-control" value={formData.c} onChange={e => setFormData({...formData, c: Number(e.target.value)})} required>
                  <option value="1">1 - Pública</option>
                  <option value="2">2 - Interna</option>
                  <option value="3">3 - Restringida</option>
                </select>
              </div>
              <div className="form-group" style={{flex:1}}>
                <label className="form-label">Integridad (I)</label>
                <select className="form-control" value={formData.i} onChange={e => setFormData({...formData, i: Number(e.target.value)})} required>
                  <option value="1">1 - Baja</option>
                  <option value="2">2 - Media</option>
                  <option value="3">3 - Alta</option>
                </select>
              </div>
              <div className="form-group" style={{flex:1}}>
                <label className="form-label">Disponibilidad (D)</label>
                <select className="form-control" value={formData.d} onChange={e => setFormData({...formData, d: Number(e.target.value)})} required>
                  <option value="1">1 - Baja</option>
                  <option value="2">2 - Media</option>
                  <option value="3">3 - Alta</option>
                </select>
              </div>
            </div>
          </div>

          <div style={{display:'flex', justifyContent:'flex-end', gap:'0.5rem', marginTop:'1rem'}}>
            <button type="button" className="btn-secondary" onClick={handleCloseModal}>Cancelar</button>
            <button type="submit" className="btn-primary">{editingItem ? "Actualizar" : "Guardar"}</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
