import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export const downloadCSV = (data, filename) => {
  if (!data || !data.length) {
    alert("No hay datos para exportar");
    return;
  }

  // Obtener las cabeceras
  const headers = Object.keys(data[0]);
  
  // Construir el CSV
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(fieldName => {
        let val = row[fieldName];
        if (val === null || val === undefined) val = '';
        val = val.toString().replace(/"/g, '""');
        // Si tiene comas o saltos de linea, envolver en comillas
        if (val.search(/("|,|\n)/g) >= 0) {
          val = `"${val}"`;
        }
        return val;
      }).join(',')
    )
  ].join('\n');

  // Crear Blob y descargar
  const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const printHseqDocument = (docType, docData) => {
  if (!docData) return;

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert("Por favor habilite las ventanas emergentes (pop-ups) para ver el documento.");
    return;
  }

  let title = '';
  let code = '';
  let version = '';
  let validity = '';
  let bodyContent = '';

  if (docType === 'heights') {
    title = 'PERMISO DE TRABAJO SEGURO EN ALTURAS';
    code = 'SST-PRM-ALT-002';
    version = '02';
    validity = '30/05/2026';

    const epccItems = [
      { label: 'Arnés de 4 Argollas', checked: docData.epccChecklist?.harness },
      { label: 'Eslinga de Posicionamiento', checked: docData.epccChecklist?.sling },
      { label: 'Línea de vida / Conectores', checked: docData.epccChecklist?.lifeline },
      { label: 'Puntos de anclaje probados', checked: docData.epccChecklist?.anchorPoints },
      { label: 'Casco con barbuquejo', checked: docData.epccChecklist?.helmet },
      { label: 'Mosquetones y ganchos', checked: docData.epccChecklist?.connectors },
    ];

    bodyContent = `
      <h3 style="margin-top: 1.5rem; border-bottom: 2px solid #000; padding-bottom: 0.3rem;">1. DATOS GENERALES</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 1rem;">
        <tr>
          <td style="padding: 0.4rem; border: 1px solid #ddd; width: 25%;"><strong>Fecha del Permiso:</strong></td>
          <td style="padding: 0.4rem; border: 1px solid #ddd; width: 25%;">${docData.date}</td>
          <td style="padding: 0.4rem; border: 1px solid #ddd; width: 25%;"><strong>Lugar de Trabajo:</strong></td>
          <td style="padding: 0.4rem; border: 1px solid #ddd; width: 25%;">${docData.location}</td>
        </tr>
        <tr>
          <td style="padding: 0.4rem; border: 1px solid #ddd;"><strong>Trabajador Autorizado:</strong></td>
          <td style="padding: 0.4rem; border: 1px solid #ddd;">${docData.worker}</td>
          <td style="padding: 0.4rem; border: 1px solid #ddd;"><strong>Ayudante de Seguridad:</strong></td>
          <td style="padding: 0.4rem; border: 1px solid #ddd;">${docData.helper}</td>
        </tr>
        <tr>
          <td style="padding: 0.4rem; border: 1px solid #ddd;"><strong>Supervisor / Emisor:</strong></td>
          <td style="padding: 0.4rem; border: 1px solid #ddd;">${docData.supervisor}</td>
          <td style="padding: 0.4rem; border: 1px solid #ddd;"><strong>Estado de Autorización:</strong></td>
          <td style="padding: 0.4rem; border: 1px solid #ddd; font-weight: bold; color: ${docData.status === 'Aprobado' ? 'green' : 'red'};">${docData.status}</td>
        </tr>
        <tr>
          <td style="padding: 0.4rem; border: 1px solid #ddd;"><strong>Descripción de Tarea:</strong></td>
          <td colspan="3" style="padding: 0.4rem; border: 1px solid #ddd;">${docData.description}</td>
        </tr>
      </table>

      <h3 style="border-bottom: 2px solid #000; padding-bottom: 0.3rem;">2. CHECKLIST DE EQUIPOS CONTRA CAÍDAS (EPCC)</h3>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; margin-bottom: 1.5rem;">
        ${epccItems.map(item => `
          <div style="display: flex; align-items: center; gap: 0.5rem; border: 1px solid #ddd; padding: 0.5rem; background: #fafafa; border-radius: 4px;">
            <span style="font-size: 1.2rem; font-weight: bold; color: ${item.checked ? 'green' : 'red'};">${item.checked ? '☑' : '☒'}</span>
            <span style="font-size: 0.9rem;">${item.label}</span>
          </div>
        `).join('')}
      </div>

      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 0.75rem; border-radius: 6px; margin-bottom: 1.5rem;">
        <strong>Auto-declaración de Aptitud de Salud:</strong>
        <p style="margin: 0.25rem 0 0 0; font-size: 0.85rem; color: #166534;">
          El colaborador ${docData.worker} certifica que no padece vértigo, mareos, ni alteraciones físicas o mentales al momento de firmar y ejecutar esta labor.
        </p>
      </div>

      <h3 style="border-bottom: 2px solid #000; padding-bottom: 0.3rem;">3. VALIDACIÓN Y OBSERVACIONES DEL EMISOR</h3>
      <div style="border: 1px solid #ddd; padding: 0.75rem; min-height: 80px; margin-bottom: 2rem; border-radius: 4px;">
        ${docData.approvalRemarks || 'Sin observaciones especiales registradas por el emisor.'}
      </div>
    `;
  } else if (docType === 'ats') {
    title = 'ANÁLISIS DE TRABAJO SEGURO (ATS)';
    code = 'SST-ATS-001';
    version = '01';
    validity = '30/05/2026';

    bodyContent = `
      <h3 style="margin-top: 1.5rem; border-bottom: 2px solid #000; padding-bottom: 0.3rem;">1. INFORMACIÓN DE LA ACTIVIDAD</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 1.5rem;">
        <tr>
          <td style="padding: 0.4rem; border: 1px solid #ddd; width: 25%;"><strong>Fecha de Análisis:</strong></td>
          <td style="padding: 0.4rem; border: 1px solid #ddd; width: 25%;">${docData.date}</td>
          <td style="padding: 0.4rem; border: 1px solid #ddd; width: 25%;"><strong>Proceso Asociado:</strong></td>
          <td style="padding: 0.4rem; border: 1px solid #ddd; width: 25%;">${docData.process}</td>
        </tr>
        <tr>
          <td style="padding: 0.4rem; border: 1px solid #ddd;"><strong>Actividad Crítica:</strong></td>
          <td colspan="3" style="padding: 0.4rem; border: 1px solid #ddd; font-weight: bold;">${docData.activity}</td>
        </tr>
        <tr>
          <td style="padding: 0.4rem; border: 1px solid #ddd;"><strong>Herramientas / Equipos:</strong></td>
          <td colspan="3" style="padding: 0.4rem; border: 1px solid #ddd;">${docData.tools}</td>
        </tr>
        <tr>
          <td style="padding: 0.4rem; border: 1px solid #ddd;"><strong>Equipo de Trabajo:</strong></td>
          <td colspan="3" style="padding: 0.4rem; border: 1px solid #ddd;">${docData.team}</td>
        </tr>
      </table>

      <h3 style="border-bottom: 2px solid #000; padding-bottom: 0.3rem;">2. ANÁLISIS DE RIESGOS PASO A PASO</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 2rem;">
        <thead>
          <tr style="background: #f1f5f9;">
            <th style="border: 1px solid #000; padding: 0.5rem; width: 5%; text-align: center;">Paso</th>
            <th style="border: 1px solid #000; padding: 0.5rem; width: 30%;">Paso de la Tarea</th>
            <th style="border: 1px solid #000; padding: 0.5rem; width: 25%;">Peligros Identificados</th>
            <th style="border: 1px solid #000; padding: 0.5rem; width: 20%;">Consecuencias</th>
            <th style="border: 1px solid #000; padding: 0.5rem;">Medidas de Control</th>
          </tr>
        </thead>
        <tbody>
          ${docData.steps?.map((step, idx) => `
            <tr>
              <td style="border: 1px solid #ddd; padding: 0.5rem; text-align: center; font-weight: bold;">${idx + 1}</td>
              <td style="border: 1px solid #ddd; padding: 0.5rem; font-weight: 500;">${step.step}</td>
              <td style="border: 1px solid #ddd; padding: 0.5rem; color: #b91c1c;">${step.hazard}</td>
              <td style="border: 1px solid #ddd; padding: 0.5rem;">${step.consequences}</td>
              <td style="border: 1px solid #ddd; padding: 0.5rem; font-weight: bold; color: #15803d;">${step.controls}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } else if (docType === 'highrisk') {
    title = 'PERMISO PARA TAREAS DE ALTO RIESGO';
    code = 'SST-PRM-AR-001';
    version = '01';
    validity = '30/05/2026';

    const specialControls = [];
    if (docData.type === 'Espacio Confinado') {
      specialControls.push(`
        <div style="border: 1px solid #eab308; background: #fefdf0; padding: 0.75rem; border-radius: 4px; margin-bottom: 1rem;">
          <strong style="color: #a16207;">MONITOREO DE ATMÓSFERA Y GASES:</strong>
          <table style="width: 100%; border-collapse: collapse; margin-top: 0.5rem; background: #fff;">
            <tr>
              <td style="border: 1px solid #ddd; padding: 0.4rem; text-align: center;"><strong>Oxígeno (O2)</strong></td>
              <td style="border: 1px solid #ddd; padding: 0.4rem; text-align: center;"><strong>Inflamables (LEL)</strong></td>
              <td style="border: 1px solid #ddd; padding: 0.4rem; text-align: center;"><strong>Monóxido (CO)</strong></td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 0.4rem; text-align: center; color: green; font-weight: bold;">${docData.oxygenLevel || 'N/A'}%</td>
              <td style="border: 1px solid #ddd; padding: 0.4rem; text-align: center; color: green; font-weight: bold;">${docData.lelLevel || 'N/A'}%</td>
              <td style="border: 1px solid #ddd; padding: 0.4rem; text-align: center; color: green; font-weight: bold;">${docData.coLevel || 'N/A'} ppm</td>
            </tr>
          </table>
        </div>
      `);
    }

    if (docData.type === 'Trabajo en Caliente') {
      specialControls.push(`
        <div style="border: 1px solid #ef4444; background: #fef2f2; padding: 0.75rem; border-radius: 4px; margin-bottom: 1rem;">
          <strong style="color: #b91c1c;">CONTROLES DE CALIENTE / CORTE:</strong>
          <ul style="margin: 0.25rem 0 0 1rem; font-size: 0.85rem;">
            <li>Vigía de Fuego asignado: <strong>${docData.checklist?.fireWatcher || 'N/A'}</strong></li>
            <li>Extintor en sitio: <strong>${docData.checklist?.extinguisherReady}</strong></li>
          </ul>
        </div>
      `);
    }

    bodyContent = `
      <h3 style="margin-top: 1.5rem; border-bottom: 2px solid #000; padding-bottom: 0.3rem;">1. DATOS GENERALES</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 1.5rem;">
        <tr>
          <td style="padding: 0.4rem; border: 1px solid #ddd; width: 25%;"><strong>Fecha del Permiso:</strong></td>
          <td style="padding: 0.4rem; border: 1px solid #ddd; width: 25%;">${docData.date}</td>
          <td style="padding: 0.4rem; border: 1px solid #ddd; width: 25%;"><strong>Tipo de Tarea Crítica:</strong></td>
          <td style="padding: 0.4rem; border: 1px solid #ddd; width: 25%; font-weight: bold; color: #b91c1c;">${docData.type}</td>
        </tr>
        <tr>
          <td style="padding: 0.4rem; border: 1px solid #ddd;"><strong>Ubicación de Trabajo:</strong></td>
          <td style="padding: 0.4rem; border: 1px solid #ddd;">${docData.location}</td>
          <td style="padding: 0.4rem; border: 1px solid #ddd;"><strong>Supervisor HSEQ:</strong></td>
          <td style="padding: 0.4rem; border: 1px solid #ddd;">${docData.supervisor}</td>
        </tr>
        <tr>
          <td style="padding: 0.4rem; border: 1px solid #ddd;"><strong>Descripción del Trabajo:</strong></td>
          <td colspan="3" style="padding: 0.4rem; border: 1px solid #ddd;">${docData.description}</td>
        </tr>
        <tr>
          <td style="padding: 0.4rem; border: 1px solid #ddd;"><strong>Estado Autorización:</strong></td>
          <td colspan="3" style="padding: 0.4rem; border: 1px solid #ddd; font-weight: bold; color: ${docData.status === 'Aprobado' ? 'green' : 'red'};">${docData.status}</td>
        </tr>
      </table>

      ${specialControls.join('')}

      <h3 style="border-bottom: 2px solid #000; padding-bottom: 0.3rem;">2. CHECKLIST DE CONTROLES OPERATIVOS</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 1.5rem; font-size: 0.85rem;">
        <tr>
          <td style="padding: 0.5rem; border: 1px solid #ddd; width: 60%;"><strong>Bloqueo y Tarjeteo (LOTO) aplicado a energías peligrosas:</strong></td>
          <td style="padding: 0.5rem; border: 1px solid #ddd; font-weight: bold; text-align: center;">${docData.checklist?.lotoApplied}</td>
        </tr>
        <tr>
          <td style="padding: 0.5rem; border: 1px solid #ddd;"><strong>Prueba de atmósfera segura verificada:</strong></td>
          <td style="padding: 0.5rem; border: 1px solid #ddd; font-weight: bold; text-align: center;">${docData.checklist?.gasAtmosphere}</td>
        </tr>
        <tr>
          <td style="padding: 0.5rem; border: 1px solid #ddd;"><strong>EPP Especial para la tarea disponible y en buen estado:</strong></td>
          <td style="padding: 0.5rem; border: 1px solid #ddd; font-weight: bold; text-align: center;">${docData.checklist?.hotPpe}</td>
        </tr>
      </table>

      <h3 style="border-bottom: 2px solid #000; padding-bottom: 0.3rem;">3. OBSERVACIONES Y REQUERIMIENTOS DEL SUPERVISOR</h3>
      <div style="border: 1px solid #ddd; padding: 0.75rem; min-height: 80px; margin-bottom: 2rem; border-radius: 4px;">
        ${docData.approvalRemarks || 'Sin observaciones registradas.'}
      </div>
    `;
  }

  // STANDARD HSEQ SIGNATURES SECTION
  const signaturesHtml = `
    <h3 style="border-bottom: 2px solid #000; padding-bottom: 0.3rem; page-break-inside: avoid;">4. REGISTRO DE FIRMAS DE ACEPTACIÓN</h3>
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-top: 1.5rem; page-break-inside: avoid;">
      <div style="border-top: 1px solid #000; text-align: center; padding-top: 0.5rem; font-size: 0.8rem;">
        <br/><br/>
        <strong>Firma del Ejecutor / Trabajador</strong><br/>
        Cédula: __________________
      </div>
      <div style="border-top: 1px solid #000; text-align: center; padding-top: 0.5rem; font-size: 0.8rem;">
        <br/><br/>
        <strong>Firma del Ayudante / Vigía</strong><br/>
        Cédula: __________________
      </div>
      <div style="border-top: 1px solid #000; text-align: center; padding-top: 0.5rem; font-size: 0.8rem;">
        <br/><br/>
        <strong>Firma del Coordinador SST / Emisor</strong><br/>
        Firma Digital Registrada
      </div>
    </div>
  `;

  // DRAW THE ENTIRE WINDOW HTML
  printWindow.document.write(`
    <html>
      <head>
        <title>${title} - ${docData.id}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            color: #000;
            margin: 20px;
            line-height: 1.4;
          }
          table {
            font-size: 0.85rem;
          }
          h3 {
            font-size: 0.95rem;
            margin-bottom: 0.5rem;
            font-weight: bold;
            color: #1e293b;
          }
          @media print {
            body {
              margin: 10mm;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <!-- Control Documental Header -->
        <table style="width: 100%; border-collapse: collapse; border: 2px solid #000; margin-bottom: 1.2rem;">
          <tr>
            <td rowspan="3" style="width: 20%; border: 1px solid #000; text-align: center; padding: 0.5rem; vertical-align: middle;">
              <div style="font-weight: 800; font-size: 1.35rem; color: #0ea5e9; font-family: 'Outfit', sans-serif;">SGI HSEQ</div>
              <div style="font-size: 0.6rem; color: #64748b; font-weight: 600; text-transform: uppercase; margin-top: 2px;">Enterprise System</div>
            </td>
            <td rowspan="3" style="width: 50%; border: 1px solid #000; text-align: center; padding: 0.5rem; vertical-align: middle; font-size: 1.05rem; font-weight: bold; text-transform: uppercase;">
              \${title}
            </td>
            <td style="width: 30%; border: 1px solid #000; padding: 0.25rem 0.5rem; font-size: 0.78rem;"><strong>Código:</strong> \${code}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #000; padding: 0.25rem 0.5rem; font-size: 0.78rem;"><strong>Versión:</strong> \${version}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #000; padding: 0.25rem 0.5rem; font-size: 0.78rem;"><strong>Vigencia:</strong> \${validity}</td>
          </tr>
        </table>

        <!-- Document Body -->
        \${bodyContent}

        <!-- Signatures -->
        \${signaturesHtml}

        <script>
          // Automatic trigger print on load
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          }
        </script>
      </body>
    </html>
  `);

  printWindow.document.close();
};

export const DEFAULT_REVIEWERS = [
  { name: 'LUCERYS OÑATE', role: 'LÍDER SST', signatureImage: '/firma_lucerys.png' },
  { name: 'SANDY GUTIERREZ', role: 'LÍDER SST', signatureImage: '/firma_sandy.png' },
  { name: 'JOHN JIMENEZ', role: 'LÍDER CALIDAD', signatureImage: '/firma_john.png' },
  { name: 'MIRIAM ARDILA', role: 'LIDER DE GESTIÓN AMBIENTAL', signatureImage: '/firma_miriam.png' }
];

export const DEFAULT_APPROVERS = [
  { name: 'FRANCISCO COLLAVINI', role: 'GERENTE', signatureImage: '/firma_francisco.png' }
];

export const exportToPDF = ({
  title,
  code = 'SGI-DOC-001',
  version = '01',
  validity = new Date().toISOString().split('T')[0],
  contentHtml,
  history = [],
  reviewers = DEFAULT_REVIEWERS,
  approvers = DEFAULT_APPROVERS,
  layout = 'standard'
}) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert("Por favor habilite las ventanas emergentes (pop-ups) para exportar a PDF.");
    return;
  }

  const allSigners = [...reviewers, ...approvers];

  if (layout === 'strategic') {
    const strategicSignersHtml = allSigners.map(s => `
      <div class="signature-block" style="text-align: center; font-family: 'Arial', sans-serif; line-height: 1.4; min-width: 180px; display: flex; flex-direction: column; align-items: center; justify-content: space-between;">
        <div style="height: 55px; display: flex; align-items: center; justify-content: center; margin-bottom: 4px;">
          ${s.signatureImage ? `<img src="${s.signatureImage}" class="signature-img" style="max-height: 55px; max-width: 100%; object-fit: contain;" alt="Firma ${s.name}" />` : `<span style="font-family: 'Cedarville Cursive', cursive, sans-serif; font-size: 16px; font-style: italic; color: #1e3a8a;">${s.name.split(' ')[0]}</span>`}
        </div>
        <div style="font-weight: bold; font-size: 13px; color: #000; margin-top: 4px;">${s.name}</div>
        <div style="font-size: 11px; color: #333;">${s.role || s.cargo || ''}</div>
        <div style="font-size: 11px; color: #555; margin-top: 4px; text-align: left; border-top: 1.5px solid #334155; padding-top: 4px; padding-left: 8px; width: 100%;">
          <div><strong>Código:</strong> ${code}</div>
          <div><strong>Versión:</strong> ${version}</div>
          <div><strong>Fecha revisión:</strong> ${validity}</div>
        </div>
      </div>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title} - Exportar PDF</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap" rel="stylesheet">
          <style>
            @page {
              size: letter;
              margin: 15mm;
            }
            body {
              font-family: 'Arial', sans-serif;
              color: #000;
              margin: 0;
              padding: 0;
              line-height: 1.6;
              font-size: 14px;
            }
            .strategic-header {
              width: 100%;
              border: 2px solid #000;
              border-collapse: collapse;
              margin-bottom: 25px;
            }
            .strategic-header td {
              border: 1px solid #000;
              padding: 10px;
              vertical-align: middle;
            }
            .strategic-header .logo-container {
              width: 25%;
              text-align: center;
              border-right: 2px solid #000;
            }
            .strategic-header .logo-img {
              max-height: 55px;
              max-width: 120px;
              object-fit: contain;
              display: block;
              margin: 0 auto;
            }
            .strategic-header .doc-title {
              width: 75%;
              text-align: center;
              font-weight: bold;
              font-size: 24px;
              color: #000080;
              text-transform: uppercase;
              font-family: 'Arial', sans-serif;
              letter-spacing: 1px;
            }
            .content-area {
              min-height: 250px;
              margin-bottom: 25px;
              font-size: 15px;
              color: #000;
              text-align: justify;
              padding: 0 10px;
            }
            .content-area p {
              margin-bottom: 1.2rem;
              text-indent: 12px;
            }
            .content-area ol, .content-area ul {
              padding-left: 20px;
              margin-bottom: 1.2rem;
            }
            .content-area li {
              margin-bottom: 8px;
            }
            .strategic-footer {
              display: flex;
              justify-content: flex-end;
              margin-top: 50px;
              page-break-inside: avoid;
            }
            .signature-block {
              text-align: center;
              font-family: 'Arial', sans-serif;
              line-height: 1.4;
              min-width: 200px;
            }
            .signature-img {
              height: 60px;
              max-height: 60px;
              object-fit: contain;
              display: block;
              margin: 0 auto;
            }
            @media print {
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <!-- Strategic Header -->
          <table class="strategic-header">
            <tr>
              <td class="logo-container">
                <img src="/logo.png" class="logo-img" alt="Logo corporativo" />
              </td>
              <td class="doc-title">
                ${title}
              </td>
            </tr>
          </table>

          <!-- Document Content -->
          <div class="content-area">
            ${contentHtml}
          </div>

          <!-- Bottom Right Signature block -->
          <div class="strategic-footer" style="display: flex; justify-content: flex-end; gap: 30px; margin-top: 50px; page-break-inside: avoid; flex-wrap: wrap;">
            ${strategicSignersHtml}
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    return;
  }

  // Generate change control table rows
  const historyRowsHtml = history && history.length > 0 
    ? history.map(h => `
        <tr>
          <td style="border: 1px solid #334155; padding: 6px; text-align: center;">${h.version || '01'}</td>
          <td style="border: 1px solid #334155; padding: 6px; text-align: center;">${h.date || ''}</td>
          <td style="border: 1px solid #334155; padding: 6px;">${h.changes || h.changeReason || ''}</td>
        </tr>
      `).join('')
    : `<tr>
        <td style="border: 1px solid #334155; padding: 6px; text-align: center;">01</td>
        <td style="border: 1px solid #334155; padding: 6px; text-align: center;">2023/01/04</td>
        <td style="border: 1px solid #334155; padding: 6px;">Creación del documento</td>
      </tr>`;

  const standardSignaturesHtml = `
    <div style="display: flex; gap: 25px; flex-wrap: wrap; justify-content: center; margin-top: 15px; width: 100%; page-break-inside: avoid;">
      ${reviewers.map(r => `
        <div style="text-align: center; padding: 10px; min-width: 200px; flex: 1; max-width: 280px; display: flex; flex-direction: column; align-items: center; justify-content: space-between;">
          <div style="font-size: 9px; color: #4f46e5; font-weight: bold; text-transform: uppercase; margin-bottom: 6px;">Revisado por:</div>
          <div style="height: 40px; display: flex; align-items: center; justify-content: center; margin-bottom: 4px; width: 100%;">
            ${r.signatureImage ? `<img src="${r.signatureImage}" style="max-height: 40px; max-width: 100%; object-fit: contain;" />` : `<span style="font-family: 'Cedarville Cursive', cursive, sans-serif; font-size: 14px; font-style: italic; color: #1e3a8a;">${r.name.split(' ')[0]}</span>`}
          </div>
          <div style="font-weight: bold; font-size: 11px; color: #000; border-top: 1.5px solid #334155; width: 100%; padding-top: 4px; margin-top: 4px;">${r.name}</div>
          <div style="font-size: 10px; color: #475569; text-transform: uppercase;">${r.role || r.cargo || ''}</div>
        </div>
      `).join('')}
      
      ${approvers.map(a => `
        <div style="text-align: center; padding: 10px; min-width: 200px; flex: 1; max-width: 280px; display: flex; flex-direction: column; align-items: center; justify-content: space-between;">
          <div style="font-size: 9px; color: #16a34a; font-weight: bold; text-transform: uppercase; margin-bottom: 6px;">Aprobado por:</div>
          <div style="height: 40px; display: flex; align-items: center; justify-content: center; margin-bottom: 4px; width: 100%;">
            ${a.signatureImage ? `<img src="${a.signatureImage}" style="max-height: 40px; max-width: 100%; object-fit: contain;" />` : `<span style="font-family: 'Cedarville Cursive', cursive, sans-serif; font-size: 14px; font-style: italic; color: #1e3a8a;">${a.name.split(' ')[0]}</span>`}
          </div>
          <div style="font-weight: bold; font-size: 11px; color: #000; border-top: 1.5px solid #334155; width: 100%; padding-top: 4px; margin-top: 4px;">${a.name}</div>
          <div style="font-size: 10px; color: #475569; text-transform: uppercase;">${a.role || a.cargo || ''}</div>
        </div>
      `).join('')}
    </div>
  `;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title} - Exportar PDF</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Cedarville+Cursive&family=Outfit:wght@300;400;600;700&display=swap" rel="stylesheet">
        <style>
          @page {
            size: letter;
            margin: 15mm;
            @bottom-right {
              content: counter(page) " de " counter(pages);
            }
          }
          body {
            font-family: 'Arial', sans-serif;
            color: #1e293b;
            margin: 0;
            padding: 0;
            line-height: 1.4;
            font-size: 11px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
          }
          .iso-header {
            width: 100%;
            border: 2px solid #334155;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          .iso-header td {
            border: 1px solid #334155;
            padding: 6px;
            vertical-align: middle;
          }
          .iso-header .logo-container {
            width: 25%;
            text-align: center;
          }
          .iso-header .logo-img {
            max-height: 50px;
            max-width: 120px;
            object-fit: contain;
          }
          .iso-header .doc-title {
            width: 50%;
            text-align: center;
            font-weight: bold;
            font-size: 13px;
            text-transform: uppercase;
          }
          .iso-header .meta-info {
            width: 25%;
            font-size: 9px;
            padding: 3px 6px;
          }
          .content-area {
            min-height: 380px;
            margin-bottom: 25px;
          }
          .footer-section {
            page-break-inside: avoid;
            margin-top: 25px;
          }
          .section-title {
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
            margin-top: 15px;
            margin-bottom: 6px;
            border-bottom: 1.5px solid #334155;
            padding-bottom: 2px;
          }
          .control-table th {
            background-color: #f1f5f9;
            border: 1px solid #334155;
            padding: 5px;
            font-weight: bold;
            text-align: center;
          }
          .control-table td {
            border: 1px solid #334155;
            padding: 5px;
          }
          @media print {
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <!-- Header ISO -->
        <table class="iso-header">
          <tr>
            <td rowspan="3" class="logo-container">
              <img src="/logo.png" class="logo-img" alt="Logo corporativo" />
            </td>
            <td rowspan="3" class="doc-title">
              ${title}
            </td>
            <td class="meta-info"><strong>Página:</strong> 1 de 1</td>
          </tr>
          <tr>
            <td class="meta-info"><strong>Versión:</strong> ${version}</td>
          </tr>
          <tr>
            <td class="meta-info"><strong>Vigencia:</strong> ${validity}</td>
          </tr>
        </table>

        <!-- Document Content -->
        <div class="content-area">
          ${contentHtml}
        </div>

        <!-- Footer: Control de Cambios y Firmas -->
        <div class="footer-section">
          <div class="section-title">CONTROL DE CAMBIO</div>
          <table class="control-table">
            <thead>
              <tr>
                <th style="width: 15%;">VERSIÓN</th>
                <th style="width: 25%;">VIGENCIA</th>
                <th style="width: 60%;">CAMBIOS</th>
              </tr>
            </thead>
            <tbody>
              ${historyRowsHtml}
            </tbody>
          </table>

          <div class="section-title" style="margin-top: 20px;">APROBACIONES Y REVISIÓN</div>
          ${standardSignaturesHtml}
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          }
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};

export const exportToExcel = async ({
  title,
  code = 'SGI-MAT-001',
  version = '01',
  validity = new Date().toISOString().split('T')[0],
  columns = [],
  data = [],
  history = [],
  reviewers = DEFAULT_REVIEWERS,
  approvers = DEFAULT_APPROVERS
}) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(title.substring(0, 31));

  // Enable grid lines
  worksheet.views = [{ showGridLines: true }];

  // Column width configuration (distribute evenly, min width 18)
  const maxCols = Math.max(columns.length, 7);
  const colConfigs = [];
  for (let i = 0; i < maxCols; i++) {
    colConfigs.push({ width: 22 });
  }
  worksheet.columns = colConfigs;

  // 1. CABECERA ISO (Rows 1-3)
  // Merge cells
  worksheet.mergeCells(1, 1, 3, 2); // Logo (A1:B3)
  worksheet.mergeCells(1, 3, 3, 5); // Title (C1:E3)
  
  // Set values for right-hand metadata
  worksheet.getCell(1, 6).value = 'Página:';
  worksheet.getCell(1, 7).value = '1 de 1';
  worksheet.getCell(2, 6).value = 'Versión:';
  worksheet.getCell(2, 7).value = version;
  worksheet.getCell(3, 6).value = 'Vigencia:';
  worksheet.getCell(3, 7).value = validity;

  // Format Header cells
  const borderStyle = {
    top: { style: 'thin', color: { arpGB: 'FF334155' } },
    left: { style: 'thin', color: { arpGB: 'FF334155' } },
    bottom: { style: 'thin', color: { arpGB: 'FF334155' } },
    right: { style: 'thin', color: { arpGB: 'FF334155' } }
  };

  const grayBorder = { style: 'thin', color: { argb: 'FF334155' } };
  const doubleBorder = { style: 'double', color: { argb: 'FF334155' } };

  // Set borders for header cells (row 1 to 3, col 1 to 7)
  for (let r = 1; r <= 3; r++) {
    for (let c = 1; c <= 7; c++) {
      worksheet.getCell(r, c).border = {
        top: r === 1 ? doubleBorder : grayBorder,
        bottom: r === 3 ? doubleBorder : grayBorder,
        left: c === 1 ? doubleBorder : grayBorder,
        right: c === 7 ? doubleBorder : grayBorder
      };
    }
  }

  // Set Title cell properties
  const titleCell = worksheet.getCell(1, 3);
  titleCell.value = title.toUpperCase();
  titleCell.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FF1E293B' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

  // Set right-hand metadata text styles
  for (let r = 1; r <= 3; r++) {
    worksheet.getCell(r, 6).font = { name: 'Arial', size: 9, bold: true };
    worksheet.getCell(r, 6).alignment = { vertical: 'middle', horizontal: 'right' };
    worksheet.getCell(r, 7).font = { name: 'Arial', size: 9 };
    worksheet.getCell(r, 7).alignment = { vertical: 'middle', horizontal: 'left' };
  }

  // Load and embed corporate logo
  try {
    const logoRes = await fetch('/logo.png');
    const logoBlob = await logoRes.blob();
    const logoBuf = await logoBlob.arrayBuffer();
    const logoId = workbook.addImage({
      buffer: logoBuf,
      extension: 'png'
    });
    worksheet.addImage(logoId, {
      tl: { col: 0.1, row: 0.1 },
      ext: { width: 120, height: 48 }
    });
  } catch (err) {
    worksheet.getCell(1, 1).value = 'FSCR INGENIERÍA';
    worksheet.getCell(1, 1).font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF0EA5E9' } };
    worksheet.getCell(1, 1).alignment = { vertical: 'middle', horizontal: 'center' };
  }

  // 2. MATRIZ DATA HEADER (Row 5)
  const headerRowIdx = 5;
  columns.forEach((col, idx) => {
    const cell = worksheet.getCell(headerRowIdx, idx + 1);
    cell.value = col.header || col;
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF1F5F9' }
    };
    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF1E293B' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      top: grayBorder,
      bottom: { style: 'medium', color: { argb: 'FF334155' } },
      left: grayBorder,
      right: grayBorder
    };
  });
  worksheet.getRow(headerRowIdx).height = 28;

  // 3. MATRIZ DATA ROWS (Row 6 onwards)
  let currentRowIdx = 6;
  data.forEach(row => {
    columns.forEach((col, colIdx) => {
      const cell = worksheet.getCell(currentRowIdx, colIdx + 1);
      const field = col.key || col;
      let val = row[field];
      if (val === null || val === undefined) val = '';
      cell.value = val.toString();
      cell.font = { name: 'Arial', size: 10 };
      cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
      cell.border = {
        top: grayBorder,
        bottom: grayBorder,
        left: grayBorder,
        right: grayBorder
      };
    });
    worksheet.getRow(currentRowIdx).height = 24;
    currentRowIdx++;
  });

  // 4. CONTROL DE CAMBIOS SECTION (Below matrix data)
  currentRowIdx += 2; // leave spaces
  const controlTitleCell = worksheet.getCell(currentRowIdx, 1);
  controlTitleCell.value = 'CONTROL DE CAMBIO';
  controlTitleCell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF1E293B' } };
  
  // Merge control title cell across columns
  worksheet.mergeCells(currentRowIdx, 1, currentRowIdx, Math.min(columns.length, 6));
  currentRowIdx++;

  // Control headers
  const controlHeaders = ['VERSIÓN', 'VIGENCIA', 'CAMBIOS'];
  controlHeaders.forEach((ch, idx) => {
    const cell = worksheet.getCell(currentRowIdx, idx === 2 ? 3 : idx + 1);
    cell.value = ch;
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF1F5F9' }
    };
    cell.font = { name: 'Arial', size: 9, bold: true };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = { top: grayBorder, bottom: grayBorder, left: grayBorder, right: grayBorder };
    
    // Merge description cell
    if (idx === 2) {
      worksheet.mergeCells(currentRowIdx, 3, currentRowIdx, Math.max(columns.length, 6));
    }
  });
  currentRowIdx++;

  // Control data rows
  if (history && history.length > 0) {
    history.forEach(h => {
      worksheet.getCell(currentRowIdx, 1).value = h.version || '01';
      worksheet.getCell(currentRowIdx, 2).value = h.date || '';
      worksheet.getCell(currentRowIdx, 3).value = h.changes || h.changeReason || '';
      
      // styles
      for (let c = 1; c <= 3; c++) {
        const cell = worksheet.getCell(currentRowIdx, c);
        cell.font = { name: 'Arial', size: 9 };
        cell.border = { top: grayBorder, bottom: grayBorder, left: grayBorder, right: grayBorder };
        if (c < 3) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        } else {
          cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
          worksheet.mergeCells(currentRowIdx, 3, currentRowIdx, Math.max(columns.length, 6));
        }
      }
      currentRowIdx++;
    });
  } else {
    // Default row
    worksheet.getCell(currentRowIdx, 1).value = '01';
    worksheet.getCell(currentRowIdx, 2).value = '2023/01/04';
    worksheet.getCell(currentRowIdx, 3).value = 'Creación del documento';
    for (let c = 1; c <= 3; c++) {
      const cell = worksheet.getCell(currentRowIdx, c);
      cell.font = { name: 'Arial', size: 9 };
      cell.border = { top: grayBorder, bottom: grayBorder, left: grayBorder, right: grayBorder };
      if (c < 3) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
        worksheet.mergeCells(currentRowIdx, 3, currentRowIdx, Math.max(columns.length, 6));
      }
    }
    currentRowIdx++;
  }

  // 5. APROBACIONES Y REVISIÓN SECTION (Below control)
  currentRowIdx += 2;
  const approvalsTitleCell = worksheet.getCell(currentRowIdx, 1);
  approvalsTitleCell.value = 'APROBACIONES Y REVISIÓN';
  approvalsTitleCell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF1E293B' } };
  worksheet.mergeCells(currentRowIdx, 1, currentRowIdx, Math.min(columns.length, 6));
  currentRowIdx++;

  // Sub headers
  const sigHeaders = ['', 'NOMBRE', 'CARGO', 'FIRMA'];
  sigHeaders.forEach((sh, idx) => {
    const cell = worksheet.getCell(currentRowIdx, idx + 1);
    cell.value = sh;
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF8FAFC' }
    };
    cell.font = { name: 'Arial', size: 9, bold: true };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = { top: grayBorder, bottom: grayBorder, left: grayBorder, right: grayBorder };
  });
  currentRowIdx++;

  // Reviewers rows
  const revStartRow = currentRowIdx;
  for (let i = 0; i < reviewers.length; i++) {
    const r = reviewers[i];
    worksheet.getCell(currentRowIdx, 2).value = r.name;
    worksheet.getCell(currentRowIdx, 3).value = r.role || r.cargo || '';
    
    // Style the name and cargo cells
    for (let c = 1; c <= 4; c++) {
      const cell = worksheet.getCell(currentRowIdx, c);
      cell.font = { name: 'Arial', size: 9 };
      cell.border = { top: grayBorder, bottom: grayBorder, left: grayBorder, right: grayBorder };
      if (c === 2 || c === 3) {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      }
    }
    
    // Embed signature
    if (r.signatureImage) {
      try {
        const sigRes = await fetch(r.signatureImage);
        const sigBlob = await sigRes.blob();
        const sigBuf = await sigBlob.arrayBuffer();
        const sigId = workbook.addImage({
          buffer: sigBuf,
          extension: 'png'
        });
        worksheet.addImage(sigId, {
          tl: { col: 3.1, row: currentRowIdx - 1.1 },
          ext: { width: 90, height: 26 }
        });
      } catch (err) {
        worksheet.getCell(currentRowIdx, 4).value = r.name.split(' ')[0];
        worksheet.getCell(currentRowIdx, 4).font = { name: 'Arial', size: 9, italic: true };
        worksheet.getCell(currentRowIdx, 4).alignment = { vertical: 'middle', horizontal: 'center' };
      }
    }
    worksheet.getRow(currentRowIdx).height = 32;
    currentRowIdx++;
  }
  // Merge "Revisado por:" label
  if (reviewers && reviewers.length > 0) {
    worksheet.getCell(revStartRow, 1).value = 'Revisado por:';
    worksheet.getCell(revStartRow, 1).font = { name: 'Arial', size: 9, bold: true };
    worksheet.getCell(revStartRow, 1).alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.mergeCells(revStartRow, 1, currentRowIdx - 1, 1);
  }

  // Approvers rows
  const appStartRow = currentRowIdx;
  for (let i = 0; i < approvers.length; i++) {
    const a = approvers[i];
    worksheet.getCell(currentRowIdx, 2).value = a.name;
    worksheet.getCell(currentRowIdx, 3).value = a.role || a.cargo || '';
    
    // Style name and cargo cells
    for (let c = 1; c <= 4; c++) {
      const cell = worksheet.getCell(currentRowIdx, c);
      cell.font = { name: 'Arial', size: 9 };
      cell.border = { top: grayBorder, bottom: grayBorder, left: grayBorder, right: grayBorder };
      if (c === 2 || c === 3) {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      }
    }

    // Embed signature
    if (a.signatureImage) {
      try {
        const sigRes = await fetch(a.signatureImage);
        const sigBlob = await sigRes.blob();
        const sigBuf = await sigBlob.arrayBuffer();
        const sigId = workbook.addImage({
          buffer: sigBuf,
          extension: 'png'
        });
        worksheet.addImage(sigId, {
          tl: { col: 3.1, row: currentRowIdx - 1.1 },
          ext: { width: 90, height: 26 }
        });
      } catch (err) {
        worksheet.getCell(currentRowIdx, 4).value = a.name.split(' ')[0];
        worksheet.getCell(currentRowIdx, 4).font = { name: 'Arial', size: 9, italic: true };
        worksheet.getCell(currentRowIdx, 4).alignment = { vertical: 'middle', horizontal: 'center' };
      }
    }
    worksheet.getRow(currentRowIdx).height = 32;
    currentRowIdx++;
  }
  // Merge "Aprobado por:" label
  if (approvers && approvers.length > 0) {
    worksheet.getCell(appStartRow, 1).value = 'Aprobado por:';
    worksheet.getCell(appStartRow, 1).font = { name: 'Arial', size: 9, bold: true };
    worksheet.getCell(appStartRow, 1).alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.mergeCells(appStartRow, 1, currentRowIdx - 1, 1);
  }

  // Write and Save
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `${title.replace(/ /g, '_')}_V${version}.xlsx`);
};

