import React, { useState, useMemo } from 'react';
import { Trash2, Plus, Download, Edit2, CheckCircle, Clock, FileCheck, Droplet, Zap, Leaf, Eye, Paperclip, BarChart2, Filter } from 'lucide-react';
import Modal from '../components/Modal';
import ExportModal from '../components/ExportModal';
import { downloadCSV } from '../utils/exportUtils';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAppUsers } from '../hooks/useAppUsers';

const DEFAULT_PARAMS = {
  projectTypes: ["Eléctrico", "Telecomunicaciones", "Civil", "Ambiental", "Industrial"],
  clients: ["Consorcio Vial del Norte", "Ecopetrol", "Claro", "Movistar"],
  cities: ["Bogotá", "Medellín", "Cali", "Barranquilla", "Bucaramanga"]
};

const wasteTypes = [
  { id: 'ordinario', name: 'No aprovechables', color: '#94a3b8' },
  { id: 'reciclable', name: 'Reciclable (Cartón, Plástico)', color: 'var(--success)' },
  { id: 'peligroso', name: 'Peligroso (RESPEL)', color: 'var(--danger)' },
  { id: 'raee', name: 'RAEE (Eléctricos / Electrónicos)', color: '#a855f7' },
  { id: 'rcd', name: 'Construcción y Demolición (RCD)', color: '#f97316' },
  { id: 'madera', name: 'Especial madera', color: '#854d0e' }
];

const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const defaultWasteLog = {
  date: '',
  type: 'peligroso',
  weightKg: '',
  manifestNumber: '',
  certificateName: '',
  status: 'Entregado', // Entregado, Disposición Final Certificada
  project: '',
  city: '',
  client: ''
};

const defaultResourceLog = {
  year: '2026',
  month: 'Mayo',
  waterConsumption: '',
  waterCost: '',
  energyConsumption: '',
  energyCost: '',
  recordedBy: '',
  project: '',
  city: '',
  client: ''
};

export default function WasteManagement() {
  const APP_USERS = useAppUsers();
  const [globalParams] = useLocalStorage('sgi_global_parameters', DEFAULT_PARAMS);

  const projectOptions = useMemo(() => {
    return (globalParams?.projectTypes && globalParams.projectTypes.length > 0) 
      ? globalParams.projectTypes 
      : DEFAULT_PARAMS.projectTypes;
  }, [globalParams?.projectTypes]);

  const cityOptions = useMemo(() => {
    return (globalParams?.cities && globalParams.cities.length > 0) 
      ? globalParams.cities 
      : DEFAULT_PARAMS.cities;
  }, [globalParams?.cities]);

  const clientOptions = useMemo(() => {
    return (globalParams?.clients && globalParams.clients.length > 0) 
      ? globalParams.clients 
      : DEFAULT_PARAMS.clients;
  }, [globalParams?.clients]);

  const [wasteLogs, setWasteLogs] = useLocalStorage('sgi_waste_logs', [
    { id: 1, date: '2026-05-10', type: 'reciclable', weightKg: 120, manifestNumber: 'REC-2026-987', certificateName: 'cert_recicla_mayo.pdf', status: 'Disposición Final Certificada', project: 'Eléctrico', city: 'Bogotá', client: 'Consorcio Vial del Norte' },
    { id: 2, date: '2026-05-15', type: 'peligroso', weightKg: 45, manifestNumber: 'HAZ-2026-432', certificateName: 'cert_respel_mayo.pdf', status: 'Disposición Final Certificada', project: 'Civil', city: 'Cali', client: 'Ecopetrol' },
    { id: 3, date: '2026-05-22', type: 'ordinario', weightKg: 340, manifestNumber: 'ORD-Local', certificateName: '', status: 'Entregado', project: 'Telecomunicaciones', city: 'Medellín', client: 'Claro' }
  ]);

  const [resourceLogs, setResourceLogs] = useLocalStorage('sgi_resource_logs', [
    { id: 101, year: '2026', month: 'Enero', waterConsumption: 120, waterCost: 480, energyConsumption: 3200, energyCost: 1280, recordedBy: 'Carlos Gómez', project: 'Eléctrico', city: 'Bogotá', client: 'Consorcio Vial del Norte' },
    { id: 102, year: '2026', month: 'Febrero', waterConsumption: 115, waterCost: 460, energyConsumption: 3100, energyCost: 1240, recordedBy: 'Diego Castro', project: 'Eléctrico', city: 'Bogotá', client: 'Consorcio Vial del Norte' },
    { id: 103, year: '2026', month: 'Marzo', waterConsumption: 130, waterCost: 520, energyConsumption: 3400, energyCost: 1360, recordedBy: 'Carlos Gómez', project: 'Civil', city: 'Cali', client: 'Ecopetrol' },
    { id: 104, year: '2026', month: 'Abril', waterConsumption: 110, waterCost: 440, energyConsumption: 2900, energyCost: 1160, recordedBy: 'Diego Castro', project: 'Civil', city: 'Cali', client: 'Ecopetrol' },
    { id: 105, year: '2026', month: 'Mayo', waterConsumption: 98, waterCost: 390, energyConsumption: 2800, energyCost: 1120, recordedBy: 'Carlos Gómez', project: 'Telecomunicaciones', city: 'Medellín', client: 'Claro' }
  const [globalParams] = useLocalStorage('sgi_global_parameters', DEFAULT_PARAMS);

  const [filterProject, setFilterProject] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterClient, setFilterClient] = useState('');

  const projectOptions = useMemo(() => {
    return (globalParams?.projectTypes && globalParams.projectTypes.length > 0) 
      ? globalParams.projectTypes 
      : DEFAULT_PARAMS.projectTypes;
  }, [globalParams?.projectTypes]);

  const cityOptions = useMemo(() => {
    return (globalParams?.cities && globalParams.cities.length > 0) 
      ? globalParams.cities 
      : DEFAULT_PARAMS.cities;
  }, [globalParams?.cities]);

  const clientOptions = useMemo(() => {
    return (globalParams?.clients && globalParams.clients.length > 0) 
      ? globalParams.clients 
      : DEFAULT_PARAMS.clients;
  }, [globalParams?.clients]);

  const filteredWasteLogs = wasteLogs.filter(w => {
    const matchProject = !filterProject || w.project === filterProject;
    const matchCity = !filterCity || w.city === filterCity;
    const matchClient = !filterClient || w.client === filterClient;
    return matchProject && matchCity && matchClient;
  });

  const filteredResourceLogs = resourceLogs.filter(r => {
    const matchProject = !filterProject || r.project === filterProject;
    const matchCity = !filterCity || r.city === filterCity;
    const matchClient = !filterClient || r.client === filterClient;
    return matchProject && matchCity && matchClient;
  });

  const [activeTab, setActiveTab] = useState('waste'); // waste, resources

  // History and meta for Waste Management
  const [wasteHistory, setWasteHistory] = useLocalStorage('sgi_waste_history', [
    { version: '01', date: '2025-01-10', changes: 'Emisión Inicial de la Bitácora de Gestión de Residuos HSEQ.' }
  ]);
  const [meta, setMeta] = useLocalStorage('sgi_waste_meta', {
    version: 1,
    validity: '2026-12-31',
    lastUpdated: '2026-05-30'
  });

  const [exportConfig, setExportConfig] = useState({
    isOpen: false,
    exportType: 'pdf',
    title: '',
    code: '',
    version: '01',
    validity: '',
    columns: [],
    data: [],
    history: [],
    contentHtml: ''
  });

  const [isWasteModalOpen, setIsWasteModalOpen] = useState(false);
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [wasteForm, setWasteForm] = useState(defaultWasteLog);
  const [resourceForm, setResourceForm] = useState(defaultResourceLog);

  // Waste handlers
  const handleOpenWasteModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setWasteForm(item);
    } else {
      setEditingItem(null);
      setWasteForm({
        ...defaultWasteLog,
        date: new Date().toISOString().split('T')[0]
      });
    }
    setIsWasteModalOpen(true);
  };

  const handleWasteSubmit = (e) => {
    e.preventDefault();
    const cleanForm = {
      ...wasteForm,
      weightKg: parseFloat(wasteForm.weightKg),
      status: wasteForm.certificateName ? 'Disposición Final Certificada' : 'Entregado'
    };

    if (editingItem) {
      setWasteLogs(wasteLogs.map(w => w.id === editingItem.id ? { ...cleanForm, id: w.id } : w));
    } else {
      setWasteLogs([...wasteLogs, { ...cleanForm, id: Date.now() }]);
    }
    setIsWasteModalOpen(false);
  };

  const handleWasteDelete = (id) => {
    if (window.confirm("¿Está seguro de eliminar esta bitácora de residuo?")) {
      setWasteLogs(wasteLogs.filter(w => w.id !== id));
    }
  };

  // Resource handlers
  const handleOpenResourceModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setResourceForm(item);
    } else {
      setEditingItem(null);
      setResourceForm({
        ...defaultResourceLog,
        recordedBy: APP_USERS[0]?.name || ''
      });
    }
    setIsResourceModalOpen(true);
  };

  const handleResourceSubmit = (e) => {
    e.preventDefault();
    const cleanForm = {
      ...resourceForm,
      waterConsumption: parseFloat(resourceForm.waterConsumption),
      waterCost: parseFloat(resourceForm.waterCost),
      energyConsumption: parseFloat(resourceForm.energyConsumption),
      energyCost: parseFloat(resourceForm.energyCost)
    };

    if (editingItem) {
      setResourceLogs(resourceLogs.map(r => r.id === editingItem.id ? { ...cleanForm, id: r.id } : r));
    } else {
      setResourceLogs([...resourceLogs, { ...cleanForm, id: Date.now() }]);
    }
    setIsResourceModalOpen(false);
  };

  const handleResourceDelete = (id) => {
    if (window.confirm("¿Está seguro de eliminar esta lectura mensual de recursos?")) {
      setResourceLogs(resourceLogs.filter(r => r.id !== id));
    }
  };

  const handleExport = () => {
    // 1. KPI stats
    const totalW = wasteLogs.reduce((sum, w) => sum + w.weightKg, 0);
    const hazW = wasteLogs.filter(w => w.type === 'peligroso').reduce((sum, w) => sum + w.weightKg, 0);
    const recW = wasteLogs.filter(w => w.type === 'reciclable').reduce((sum, w) => sum + w.weightKg, 0);
    const recPct = totalW > 0 ? ((recW / totalW) * 100).toFixed(1) : '0';

    // Group waste logs by type
    const wasteSummary = wasteLogs.reduce((acc, curr) => {
      acc[curr.type] = (acc[curr.type] || 0) + curr.weightKg;
      return acc;
    }, {});

    const maxW = Math.max(...wasteTypes.map(t => wasteSummary[t.id] || 0), 10);

    // 2. Resource consumption calculations
    const totalWater = resourceLogs.reduce((sum, r) => sum + parseFloat(r.waterConsumption || 0), 0);
    const totalEnergy = resourceLogs.reduce((sum, r) => sum + parseFloat(r.energyConsumption || 0), 0);

    // Generate bar chart elements (SVG)
    const barWidth = 25;
    const barSpacing = 30;
    const barXOffset = 80;
    const chartBarsSvg = wasteTypes.map((type, idx) => {
      const weight = wasteSummary[type.id] || 0;
      const barHeight = maxW > 0 ? (weight / maxW) * 120 : 0;
      const x = barXOffset + idx * (barWidth + barSpacing);
      const y = 160 - barHeight;
      return `
        <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" fill="${type.color || '#94a3b8'}" rx="3" />
        <text x="${x + barWidth / 2}" y="${y - 8}" text-anchor="middle" font-size="10" font-weight="bold" fill="#334155">${weight} Kg</text>
        <text x="${x + barWidth / 2}" y="175" text-anchor="middle" font-size="8" font-weight="bold" fill="#475569" transform="rotate(-15, ${x + barWidth / 2}, 175)">${type.name.split(' ')[0]}</text>
      `;
    }).join('');

    // Generate historical resource consumption line chart elements (SVG)
    const maxWaterVal = Math.max(...resourceLogs.map(r => parseFloat(r.waterConsumption || 0)), 10);
    const maxEnergyVal = Math.max(...resourceLogs.map(r => parseFloat(r.energyConsumption || 0)), 100);

    const stepX = resourceLogs.length > 1 ? (380 / (resourceLogs.length - 1)) : 380;
    const waterPoints = resourceLogs.map((r, idx) => {
      const x = 50 + idx * stepX;
      const y = 120 - (parseFloat(r.waterConsumption || 0) / maxWaterVal) * 90;
      return `${x},${y}`;
    }).join(' ');

    const energyPoints = resourceLogs.map((r, idx) => {
      const x = 50 + idx * stepX;
      const y = 120 - (parseFloat(r.energyConsumption || 0) / maxEnergyVal) * 90;
      return `${x},${y}`;
    }).join(' ');

    const resourceLabels = resourceLogs.map((r, idx) => {
      const x = 50 + idx * stepX;
      return `<text x="${x}" y="140" text-anchor="middle" font-size="9" fill="#64748b">${r.month.substring(0,3)}</text>`;
    }).join('');

    const gridLines = [30, 60, 90, 120].map(y => `<line x1="50" y1="${y}" x2="450" y2="${y}" stroke="#e2e8f0" stroke-dasharray="2" />`).join('');

    const reportContentHtml = `
      <div style="font-family: 'Arial', sans-serif; color: #1e293b; max-width: 800px; margin: 0 auto; line-height: 1.5;">
        
        <h3 style="color: #0f172a; border-bottom: 2px solid #16a34a; padding-bottom: 6px; font-size: 18px; margin-top: 10px; font-weight: 700;">
          1. RESUMEN DE INDICADORES DE DESEMPEÑO AMBIENTAL
        </h3>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 20px;">
          <tr>
            <td style="width: 33%; padding: 12px; background-color: #f8fafc; border: 1px solid #e2e8f0; text-align: center;">
              <span style="font-size: 11px; color: #64748b; font-weight: bold; text-transform: uppercase; display: block;">Residuos Totales</span>
              <div style="font-size: 22px; font-weight: 800; color: #0f172a; margin-top: 4px;">${totalW.toFixed(1)} Kg</div>
            </td>
            <td style="width: 33%; padding: 12px; background-color: #fef2f2; border: 1px solid #fee2e2; text-align: center;">
              <span style="font-size: 11px; color: #ef4444; font-weight: bold; text-transform: uppercase; display: block;">Peligrosos (RESPEL)</span>
              <div style="font-size: 22px; font-weight: 800; color: #dc2626; margin-top: 4px;">${hazW.toFixed(1)} Kg</div>
            </td>
            <td style="width: 33%; padding: 12px; background-color: #f0fdf4; border: 1px solid #dcfce7; text-align: center;">
              <span style="font-size: 11px; color: #15803d; font-weight: bold; text-transform: uppercase; display: block;">Tasa de Aprovechamiento</span>
              <div style="font-size: 22px; font-weight: 800; color: #16a34a; margin-top: 4px;">${recPct}%</div>
              <span style="font-size: 10px; color: #16a34a; display: block; margin-top: 2px;">(${recW.toFixed(1)} Kg reciclados)</span>
            </td>
          </tr>
        </table>

        <!-- Waste Chart -->
        <div style="border: 1px solid #e2e8f0; padding: 15px; border-radius: 6px; background-color: #ffffff; text-align: center; margin-bottom: 25px; page-break-inside: avoid;">
          <h4 style="font-size: 12px; margin: 0 0 15px 0; color: #1e293b; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">
            Distribución por Tipo de Residuo Entregado (Kg)
          </h4>
          <svg viewBox="0 0 450 200" style="width: 100%; height: 160px; overflow: visible; margin: 0 auto; display: block;">
            <!-- Axis lines -->
            <line x1="50" y1="160" x2="430" y2="160" stroke="#94a3b8" stroke-width="1.5" />
            <line x1="50" y1="20" x2="50" y2="160" stroke="#94a3b8" stroke-width="1.5" />
            <!-- Y Axis labels -->
            <text x="40" y="25" text-anchor="end" font-size="9" fill="#64748b">${maxW.toFixed(0)}</text>
            <text x="40" y="90" text-anchor="end" font-size="9" fill="#64748b">${(maxW / 2).toFixed(0)}</text>
            <text x="40" y="160" text-anchor="end" font-size="9" fill="#64748b">0</text>
            <!-- Bars -->
            ${chartBarsSvg}
          </svg>
        </div>

        <h3 style="color: #0f172a; border-bottom: 2px solid #16a34a; padding-bottom: 6px; font-size: 18px; margin-top: 20px; font-weight: 700; page-break-before: always;">
          2. HISTÓRICO MENSUAL DE ECOEFICIENCIA (CONSUMOS)
        </h3>

        <table style="width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 20px;">
          <tr>
            <td style="width: 50%; padding: 12px; background-color: #f0f9ff; border: 1px solid #e0f2fe; text-align: center;">
              <span style="font-size: 11px; color: #0284c7; font-weight: bold; text-transform: uppercase; display: block;">Agua Consumida Acumulada</span>
              <div style="font-size: 22px; font-weight: 800; color: #0369a1; margin-top: 4px;">${totalWater.toFixed(1)} m³</div>
            </td>
            <td style="width: 50%; padding: 12px; background-color: #faf5ff; border: 1px solid #f3e8ff; text-align: center;">
              <span style="font-size: 11px; color: #7c3aed; font-weight: bold; text-transform: uppercase; display: block;">Energía Consumida Acumulada</span>
              <div style="font-size: 22px; font-weight: 800; color: #6d28d9; margin-top: 4px;">${totalEnergy.toFixed(0)} kWh</div>
            </td>
          </tr>
        </table>

        <!-- Line Chart: Resources -->
        <div style="border: 1px solid #e2e8f0; padding: 15px; border-radius: 6px; background-color: #ffffff; text-align: center; margin-bottom: 25px; page-break-inside: avoid;">
          <h4 style="font-size: 12px; margin: 0 0 15px 0; color: #1e293b; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">
            Evolución Mensual de Consumo de Recursos
          </h4>
          <svg viewBox="0 0 500 160" style="width: 100%; height: 130px; overflow: visible; margin: 0 auto; display: block;">
            ${gridLines}
            <!-- Axis lines -->
            <line x1="50" y1="120" x2="450" y2="120" stroke="#94a3b8" stroke-width="1.2" />
            <line x1="50" y1="15" x2="50" y2="120" stroke="#94a3b8" stroke-width="1.2" />
            
            <!-- Lines -->
            <polyline fill="none" stroke="#0284c7" stroke-width="2.5" points="${waterPoints}" />
            <polyline fill="none" stroke="#7c3aed" stroke-width="2.5" points="${energyPoints}" />
            
            <!-- Dots & labels -->
            ${resourceLogs.map((r, idx) => {
              const x = 50 + idx * stepX;
              const yWater = 120 - (parseFloat(r.waterConsumption || 0) / maxWaterVal) * 90;
              const yEnergy = 120 - (parseFloat(r.energyConsumption || 0) / maxEnergyVal) * 90;
              return `
                <circle cx="${x}" cy="${yWater}" r="4" fill="#0284c7" />
                <text x="${x}" y="${yWater - 6}" font-size="8" font-weight="bold" fill="#0369a1" text-anchor="middle">${r.waterConsumption}m³</text>
                
                <circle cx="${x}" cy="${yEnergy}" r="4" fill="#7c3aed" />
                <text x="${x}" y="${yEnergy - 6}" font-size="8" font-weight="bold" fill="#6d28d9" text-anchor="middle">${r.energyConsumption}kWh</text>
              `;
            }).join('')}
            
            <!-- X Axis Labels -->
            ${resourceLabels}
          </svg>
          <div style="display: flex; justify-content: center; gap: 20px; font-size: 10px; margin-top: 10px; font-weight: bold;">
            <span style="color: #0284c7;">■ Consumo de Agua (m³)</span>
            <span style="color: #7c3aed;">■ Consumo de Energía (kWh)</span>
          </div>
        </div>

        <h3 style="color: #0f172a; border-bottom: 2px solid #16a34a; padding-bottom: 6px; font-size: 16px; margin-top: 25px; font-weight: 700; page-break-before: always;">
          3. HISTORIAL DE MEDICIÓN - BITÁCORA DE RESIDUOS
        </h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 11px;">
          <thead>
            <tr style="background-color: #f8fafc; text-align: left; border-bottom: 2px solid #cbd5e1;">
              <th style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Fecha</th>
              <th style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Tipo Residuo</th>
              <th style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Peso (Kg)</th>
              <th style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Manifiesto de Carga</th>
              <th style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Certificado Disposición</th>
              <th style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Estado</th>
            </tr>
          </thead>
          <tbody>
            ${wasteLogs.map(w => {
              const typeConfig = wasteTypes.find(t => t.id === w.type) || { name: w.type };
              return `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 8px; border: 1px solid #e2e8f0;">${w.date}</td>
                  <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">${typeConfig.name}</td>
                  <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold; text-align: right;">${w.weightKg} Kg</td>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;">${w.manifestNumber || 'N/A'}</td>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;">${w.certificateName || 'N/A'}</td>
                  <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold; color: ${w.status.includes('Certi') ? '#16a34a' : '#ea580c'};">${w.status}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <h3 style="color: #0f172a; border-bottom: 2px solid #16a34a; padding-bottom: 6px; font-size: 16px; margin-top: 30px; font-weight: 700;">
          4. HISTORIAL DE MEDICIÓN - CONSUMOS MENSUALES (ECOEFICIENCIA)
        </h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 11px;">
          <thead>
            <tr style="background-color: #f8fafc; text-align: left; border-bottom: 2px solid #cbd5e1;">
              <th style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Año</th>
              <th style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Mes</th>
              <th style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Consumo Agua (m³)</th>
              <th style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Costo Agua ($)</th>
              <th style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Consumo Energía (kWh)</th>
              <th style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Costo Energía ($)</th>
              <th style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Registrado Por</th>
            </tr>
          </thead>
          <tbody>
            ${resourceLogs.map(r => `
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 8px; border: 1px solid #e2e8f0;">${r.year}</td>
                <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">${r.month}</td>
                <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: #0284c7;">${r.waterConsumption} m³</td>
                <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: right;">$${r.waterCost}</td>
                <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: #7c3aed;">${r.energyConsumption} kWh</td>
                <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: right;">$${r.energyCost}</td>
                <td style="padding: 8px; border: 1px solid #e2e8f0;">${r.recordedBy}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    const cols = activeTab === 'waste'
      ? [
          { header: 'Fecha de Entrega', key: 'date' },
          { header: 'Tipo de Residuo', key: 'typeName' },
          { header: 'Peso en Kilogramos (Kg)', key: 'weightKg' },
          { header: 'Número de Manifiesto', key: 'manifestNumber' },
          { header: 'Certificado de Disposición', key: 'certificateName' },
          { header: 'Estado del Residuo', key: 'status' }
        ]
      : [
          { header: 'Año', key: 'year' },
          { header: 'Mes de Lectura', key: 'month' },
          { header: 'Consumo de Agua (m3)', key: 'waterConsumption' },
          { header: 'Costo de Agua ($)', key: 'waterCost' },
          { header: 'Consumo Energía (kWh)', key: 'energyConsumption' },
          { header: 'Costo Energía ($)', key: 'energyCost' },
          { header: 'Responsable de Registro', key: 'recordedBy' }
        ];

    const dataToExport = activeTab === 'waste'
      ? wasteLogs.map(w => {
          const typeConfig = wasteTypes.find(t => t.id === w.type) || { name: w.type };
          return {
            date: w.date,
            typeName: typeConfig.name,
            weightKg: w.weightKg,
            manifestNumber: w.manifestNumber || 'N/A',
            certificateName: w.certificateName || 'N/A',
            status: w.status
          };
        })
      : resourceLogs.map(r => ({
          year: r.year,
          month: r.month,
          waterConsumption: r.waterConsumption,
          waterCost: r.waterCost,
          energyConsumption: r.energyConsumption,
          energyCost: r.energyCost,
          recordedBy: r.recordedBy
        }));

    setExportConfig({
      isOpen: true,
      exportType: 'pdf',
      title: activeTab === 'waste' ? 'Reporte y Control de Gestión de Residuos' : 'Reporte de Consumo Mensual y Ecoeficiencia',
      code: activeTab === 'waste' ? 'SGI-REP-RES-001' : 'SGI-REP-ECO-001',
      version: `0${meta.version}`,
      validity: meta.validity,
      columns: cols,
      data: dataToExport,
      history: wasteHistory,
      contentHtml: reportContentHtml
    });
  };

  // Helper stats waste
  const totalWaste = wasteLogs.reduce((sum, w) => sum + w.weightKg, 0);
  const hazardousWaste = wasteLogs.filter(w => w.type === 'peligroso').reduce((sum, w) => sum + w.weightKg, 0);
  const recycledWaste = wasteLogs.filter(w => w.type === 'reciclable').reduce((sum, w) => sum + w.weightKg, 0);

  // Stats calculation for SVG Waste Bar chart
  const wasteSummaryMap = wasteLogs.reduce((acc, curr) => {
    acc[curr.type] = (acc[curr.type] || 0) + curr.weightKg;
    return acc;
  }, {});

  const maxWeight = Math.max(...wasteTypes.map(t => wasteSummaryMap[t.id] || 0), 10);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>ISO 14001 - Cláusula 8.1</p>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Gestión de Residuos y Ecoeficiencia</h2>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button className="btn-secondary" onClick={handleExport}><Download size={16} /> Exportar Reporte</button>
          {activeTab === 'waste' ? (
            <button className="btn-primary" onClick={() => handleOpenWasteModal()}><Plus size={16} /> Registrar Residuo</button>
          ) : (
            <button className="btn-primary" onClick={() => handleOpenResourceModal()}><Plus size={16} /> Registrar Consumo</button>
          )}
        </div>
      </div>

      {/* BARRA DE FILTROS DE PARAMETRIZACIÓN SGI */}
      <div style={{
        background: 'var(--bg-secondary)', 
        padding: '0.66rem 1rem', 
        borderRadius: '8px', 
        border: '1px solid var(--border-color)', 
        marginBottom: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.85rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-primary)', fontWeight: 700, fontSize: '0.82rem' }}>
          <Filter size={15} /> Filtros SGI:
        </div>

        <div style={{ flex: '1 1 160px', minWidth: '130px' }}>
          <select 
            className="form-control" 
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.6rem', margin: 0 }}
            value={filterProject}
            onChange={e => setFilterProject(e.target.value)}
          >
            <option value="">Todos los Proyectos</option>
            {projectOptions.map((p, idx) => (
              <option key={idx} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div style={{ flex: '1 1 160px', minWidth: '130px' }}>
          <select 
            className="form-control" 
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.6rem', margin: 0 }}
            value={filterCity}
            onChange={e => setFilterCity(e.target.value)}
          >
            <option value="">Todas las Ciudades</option>
            {cityOptions.map((c, idx) => (
              <option key={idx} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div style={{ flex: '1 1 160px', minWidth: '130px' }}>
          <select 
            className="form-control" 
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.6rem', margin: 0 }}
            value={filterClient}
            onChange={e => setFilterClient(e.target.value)}
          >
            <option value="">Todos los Clientes</option>
            {clientOptions.map((c, idx) => (
              <option key={idx} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {(filterProject || filterCity || filterClient) && (
          <button 
            className="btn-secondary" 
            style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', color: 'var(--danger)', borderColor: 'var(--danger)' }}
            onClick={() => {
              setFilterProject('');
              setFilterCity('');
              setFilterClient('');
            }}
          >
            Limpiar Filtros
          </button>
        )}
      </div>

      {/* Main navigation tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button 
          className={`btn-secondary ${activeTab === 'waste' ? 'active' : ''}`} 
          style={{ border: 'none', background: activeTab === 'waste' ? 'rgba(16, 185, 129, 0.1)' : 'transparent', color: activeTab === 'waste' ? 'var(--success)' : 'var(--text-secondary)', fontWeight: 600 }}
          onClick={() => setActiveTab('waste')}
        >
          <Trash2 size={14} style={{ marginRight: '4px' }} /> Control de Residuos (Kg)
        </button>
        <button 
          className={`btn-secondary ${activeTab === 'resources' ? 'active' : ''}`} 
          style={{ border: 'none', background: activeTab === 'resources' ? 'rgba(14, 165, 233, 0.1)' : 'transparent', color: activeTab === 'resources' ? 'var(--accent-primary)' : 'var(--text-secondary)', fontWeight: 600 }}
          onClick={() => setActiveTab('resources')}
        >
          <Leaf size={14} style={{ marginRight: '4px' }} /> Consumo de Recursos (Ecoeficiencia)
        </button>
      </div>

      {/* WASTE TAB VIEW */}
      {activeTab === 'waste' && (
        <>
          {/* KPI Cards Grid */}
          <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem' }}>
              <div style={{ background: '#f1f5f9', color: '#64748b', padding: '0.75rem', borderRadius: '50%' }}>
                <Trash2 size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Residuos Totales</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{totalWaste} Kg</div>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem' }}>
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '0.75rem', borderRadius: '50%' }}>
                <Trash2 size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Peligrosos / RESPEL</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{hazardousWaste} Kg</div>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '0.75rem', borderRadius: '50%' }}>
                <Leaf size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Aprovechados / Reciclados</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)' }}>{recycledWaste} Kg ({totalWaste > 0 ? ((recycledWaste / totalWaste) * 100).toFixed(0) : 0}%)</div>
              </div>
            </div>
          </div>

          <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
            {/* SVG Visual Chart */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <BarChart2 size={16} color="var(--accent-primary)" /> Distribución por Tipo de Residuo (Kg)
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1, justifyContent: 'center' }}>
                {wasteTypes.map(type => {
                  const weight = wasteSummaryMap[type.id] || 0;
                  const pct = maxWeight > 0 ? (weight / maxWeight) * 100 : 0;
                  return (
                    <div key={type.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 500 }}>{type.name}</span>
                        <span style={{ fontWeight: 600 }}>{weight} Kg</span>
                      </div>
                      <div style={{ background: 'var(--bg-tertiary)', height: '16px', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ background: type.color, width: `${pct}%`, height: '100%', borderRadius: '4px', transition: 'width 0.5s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Meta de Desempeño Ambiental</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '1rem' }}>
                Conforme a la norma <strong>ISO 14001</strong>, nos comprometemos a reducir la generación total de residuos ordinarios y aumentar la tasa de aprovechamiento de materiales reciclables por encima del <strong>35%</strong>.
              </p>
              <div style={{ background: 'var(--bg-primary)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--success)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Tasa actual de aprovechamiento:</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--success)' }}>
                  {totalWaste > 0 ? ((recycledWaste / totalWaste) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
          </div>

          {/* List Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Proyecto / Ubicación / Cliente</th>
                    <th>Tipo Residuo</th>
                    <th>Peso (Kg)</th>
                    <th>Nro Manifiesto de Carga</th>
                    <th>Certificado de Disposición</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWasteLogs.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        No hay bitácoras de residuos registradas con los filtros seleccionados.
                      </td>
                    </tr>
                  ) : (
                    filteredWasteLogs.map(w => {
                      const typeConfig = wasteTypes.find(t => t.id === w.type) || { name: w.type, color: '#333' };
                      return (
                        <tr key={w.id}>
                          <td>{w.date}</td>
                          <td>
                            {w.project && <div style={{fontSize:'0.78rem', color:'var(--accent-primary)', fontWeight:600}}>Proy: {w.project}</div>}
                            {w.city && <div style={{fontSize:'0.75rem', color:'var(--text-muted)'}}>Ciudad: {w.city}</div>}
                            {w.client && <div style={{fontSize:'0.75rem', color:'var(--success)'}}>Cliente: {w.client}</div>}
                            {!w.project && !w.city && !w.client && <span style={{color:'var(--text-muted)', fontSize:'0.8rem'}}>-</span>}
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: typeConfig.color }} />
                              <span style={{ fontWeight: 500 }}>{typeConfig.name}</span>
                            </div>
                          </td>
                          <td style={{ fontWeight: 600 }}>{w.weightKg} Kg</td>
                          <td>{w.manifestNumber || 'N/A'}</td>
                          <td>
                            {w.certificateName ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--success)' }}>
                                <Paperclip size={12} /> {w.certificateName}
                              </div>
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Pendiente</span>
                            )}
                          </td>
                          <td>
                            <span className={`badge ${w.status === 'Disposición Final Certificada' ? 'badge-success' : 'badge-warning'}`}>
                              {w.status === 'Disposición Final Certificada' ? <FileCheck size={12} /> : <Clock size={12} />} {w.status}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.25rem' }}>
                              <button className="btn-icon" style={{ padding: '0.25rem' }} onClick={() => handleOpenWasteModal(w)}><Edit2 size={14} /></button>
                              <button className="btn-icon" style={{ padding: '0.25rem', color: 'var(--danger)' }} onClick={() => handleWasteDelete(w.id)}><Trash2 size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ECO-EFFICIENCY RESOURCES VIEW */}
      {activeTab === 'resources' && (
        <>
          <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
            {/* Water Box */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Droplet size={18} color="var(--info)" /> Consumo Mensual de Agua (m³)
                </h3>
                <span className="badge badge-info">Año 2026</span>
              </div>
              
              {/* SVG Sparkline Water */}
              <div style={{ background: 'var(--bg-primary)', height: '140px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', padding: '1rem 0.5rem', position: 'relative' }}>
                {resourceLogs.slice(-6).map((log, idx) => {
                  const maxVal = Math.max(...resourceLogs.map(r => r.waterConsumption), 10);
                  const h = maxVal > 0 ? (log.waterConsumption / maxVal) * 80 : 0;
                  return (
                    <div key={log.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '40px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>{log.waterConsumption}</span>
                      <div style={{ background: 'var(--info)', width: '14px', height: `${h}px`, borderRadius: '4px 4px 0 0', transition: 'height 0.5s' }} />
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{log.month.substring(0, 3)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Energy Box */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Zap size={18} color="var(--warning)" /> Consumo Mensual de Energía (kWh)
                </h3>
                <span className="badge badge-warning">Año 2026</span>
              </div>
              
              {/* SVG Sparkline Energy */}
              <div style={{ background: 'var(--bg-primary)', height: '140px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', padding: '1rem 0.5rem', position: 'relative' }}>
                {resourceLogs.slice(-6).map((log, idx) => {
                  const maxVal = Math.max(...resourceLogs.map(r => r.energyConsumption), 100);
                  const h = maxVal > 0 ? (log.energyConsumption / maxVal) * 80 : 0;
                  return (
                    <div key={log.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '40px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>{log.energyConsumption}</span>
                      <div style={{ background: 'var(--warning)', width: '14px', height: `${h}px`, borderRadius: '4px 4px 0 0', transition: 'height 0.5s' }} />
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{log.month.substring(0, 3)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* List Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Año / Mes</th>
                    <th>Proyecto / Ubicación / Cliente</th>
                    <th>Consumo Agua (m³)</th>
                    <th>Costo Agua ($)</th>
                    <th>Consumo Energía (kWh)</th>
                    <th>Costo Energía ($)</th>
                    <th>Evaluado / Grabado Por</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResourceLogs.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        No hay consumos de recursos registrados con los filtros seleccionados.
                      </td>
                    </tr>
                  ) : (
                    filteredResourceLogs.map(r => (
                      <tr key={r.id}>
                        <td>
                          <strong style={{ fontWeight: 600 }}>{r.year} - {r.month}</strong>
                          {r.project && <div style={{fontSize:'0.75rem', color:'var(--accent-primary)', marginTop:'2px'}}>Proy: {r.project}</div>}
                          {r.city && <div style={{fontSize:'0.72rem', color:'var(--text-muted)'}}>Ciudad: {r.city}</div>}
                          {r.client && <div style={{fontSize:'0.72rem', color:'var(--success)'}}>Cliente: {r.client}</div>}
                        </td>
                        <td>{r.waterConsumption} m³</td>
                        <td style={{ color: 'var(--text-secondary)' }}>${r.waterCost}</td>
                        <td>{r.energyConsumption} kWh</td>
                        <td style={{ color: 'var(--text-secondary)' }}>${r.energyCost}</td>
                        <td>{r.recordedBy}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.25rem' }}>
                            <button className="btn-icon" style={{ padding: '0.25rem' }} onClick={() => handleOpenResourceModal(r)}><Edit2 size={14} /></button>
                            <button className="btn-icon" style={{ padding: '0.25rem', color: 'var(--danger)' }} onClick={() => handleResourceDelete(r.id)}><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* WASTE LOG MODAL */}
      <Modal isOpen={isWasteModalOpen} onClose={() => setIsWasteModalOpen(false)} title={editingItem ? "Modificar Registro de Residuo" : "Registrar Entrega de Residuos"}>
        <form onSubmit={handleWasteSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Proyecto</label>
              <select 
                className="form-control" 
                value={wasteForm.project || ''} 
                onChange={e => setWasteForm({ ...wasteForm, project: e.target.value })} 
                required 
              >
                <option value="">Seleccione proyecto...</option>
                {projectOptions.map((p, idx) => (
                  <option key={idx} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Ciudad / Ubicación</label>
              <select 
                className="form-control" 
                value={wasteForm.city || ''} 
                onChange={e => setWasteForm({ ...wasteForm, city: e.target.value })} 
                required 
              >
                <option value="">Seleccione ciudad...</option>
                {cityOptions.map((c, idx) => (
                  <option key={idx} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Cliente / Razón Social</label>
              <select 
                className="form-control" 
                value={wasteForm.client || ''} 
                onChange={e => setWasteForm({ ...wasteForm, client: e.target.value })} 
                required 
              >
                <option value="">Seleccione cliente...</option>
                {clientOptions.map((c, idx) => (
                  <option key={idx} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Fecha de Retiro</label>
              <input 
                type="date" 
                className="form-control" 
                value={wasteForm.date} 
                onChange={e => setWasteForm({ ...wasteForm, date: e.target.value })} 
                required 
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Tipo de Residuo</label>
              <select 
                className="form-control" 
                value={wasteForm.type} 
                onChange={e => setWasteForm({ ...wasteForm, type: e.target.value })}
              >
                {wasteTypes.map(wt => <option key={wt.id} value={wt.id}>{wt.name}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Peso Generado (Kilos)</label>
              <input 
                type="number" 
                step="0.1"
                className="form-control" 
                placeholder="Ej: 45.5" 
                value={wasteForm.weightKg} 
                onChange={e => setWasteForm({ ...wasteForm, weightKg: e.target.value })} 
                required 
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Nro de Manifiesto / Guía</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Ej: REC-2026-987" 
                value={wasteForm.manifestNumber} 
                onChange={e => setWasteForm({ ...wasteForm, manifestNumber: e.target.value })} 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Nombre del Certificado de Disposición (Opcional)</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Ej: certificado_final_mayo.pdf (Indica que ya fue certificado)" 
              value={wasteForm.certificateName} 
              onChange={e => setWasteForm({ ...wasteForm, certificateName: e.target.value })} 
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <button type="button" className="btn-secondary" onClick={() => setIsWasteModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn-primary">Guardar Registro</button>
          </div>
        </form>
      </Modal>

      {/* RESOURCE LOG MODAL */}
      <Modal isOpen={isResourceModalOpen} onClose={() => setIsResourceModalOpen(false)} title={editingItem ? "Modificar Registro de Consumos" : "Registrar Consumos Mensuales"}>
        <form onSubmit={handleResourceSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Proyecto</label>
              <select 
                className="form-control" 
                value={resourceForm.project || ''} 
                onChange={e => setResourceForm({ ...resourceForm, project: e.target.value })} 
                required 
              >
                <option value="">Seleccione proyecto...</option>
                {projectOptions.map((p, idx) => (
                  <option key={idx} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Ciudad / Ubicación</label>
              <select 
                className="form-control" 
                value={resourceForm.city || ''} 
                onChange={e => setResourceForm({ ...resourceForm, city: e.target.value })} 
                required 
              >
                <option value="">Seleccione ciudad...</option>
                {cityOptions.map((c, idx) => (
                  <option key={idx} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Cliente / Razón Social</label>
              <select 
                className="form-control" 
                value={resourceForm.client || ''} 
                onChange={e => setResourceForm({ ...resourceForm, client: e.target.value })} 
                required 
              >
                <option value="">Seleccione cliente...</option>
                {clientOptions.map((c, idx) => (
                  <option key={idx} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Año</label>
              <select 
                className="form-control" 
                value={resourceForm.year} 
                onChange={e => setResourceForm({ ...resourceForm, year: e.target.value })}
              >
                <option value="2026">2026</option>
                <option value="2027">2027</option>
              </select>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Mes</label>
              <select 
                className="form-control" 
                value={resourceForm.month} 
                onChange={e => setResourceForm({ ...resourceForm, month: e.target.value })}
              >
                {months.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--info)' }}>
              <Droplet size={14} /> Consumo e Impuesto de Agua Potable
            </h4>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 500 }}>Consumo en m³</label>
                <input 
                  type="number" 
                  className="form-control" 
                  placeholder="Ej: 110" 
                  value={resourceForm.waterConsumption} 
                  onChange={e => setResourceForm({ ...resourceForm, waterConsumption: e.target.value })} 
                  required 
                />
              </div>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 500 }}>Costo de Factura ($)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  placeholder="Ej: 400" 
                  value={resourceForm.waterCost} 
                  onChange={e => setResourceForm({ ...resourceForm, waterCost: e.target.value })} 
                  required 
                />
              </div>
            </div>
          </div>

          <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--warning)' }}>
              <Zap size={14} /> Consumo e Impuesto de Energía Eléctrica
            </h4>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 500 }}>Consumo en kWh</label>
                <input 
                  type="number" 
                  className="form-control" 
                  placeholder="Ej: 3200" 
                  value={resourceForm.energyConsumption} 
                  onChange={e => setResourceForm({ ...resourceForm, energyConsumption: e.target.value })} 
                  required 
                />
              </div>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 500 }}>Costo de Factura ($)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  placeholder="Ej: 1200" 
                  value={resourceForm.energyCost} 
                  onChange={e => setResourceForm({ ...resourceForm, energyCost: e.target.value })} 
                  required 
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Registrador / Responsable de Lectura</label>
            <select 
              className="form-control" 
              value={resourceForm.recordedBy} 
              onChange={e => setResourceForm({ ...resourceForm, recordedBy: e.target.value })}
              required
            >
              <option value="">Seleccione Responsable</option>
              {APP_USERS.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <button type="button" className="btn-secondary" onClick={() => setIsResourceModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn-primary">Guardar Consumo</button>
          </div>
        </form>
      </Modal>

      <ExportModal
        isOpen={exportConfig.isOpen}
        onClose={() => setExportConfig({ ...exportConfig, isOpen: false })}
        exportType={exportConfig.exportType}
        defaultTitle={exportConfig.title}
        defaultCode={exportConfig.code}
        defaultVersion={exportConfig.version}
        defaultValidity={exportConfig.validity}
        columns={exportConfig.columns}
        data={exportConfig.data}
        history={exportConfig.history}
        contentHtml={exportConfig.contentHtml}
      />
    </>
  );
}
