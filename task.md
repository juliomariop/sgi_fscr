# Checklist: Análisis HSEQ y Determinación Manual de Cumplimiento ✅📝

- [x] **Fase 1: Modificaciones en Bsc.jsx**
  - [x] Añadir campo `analysis: ''` al inicializador de `measurementData`.
  - [x] Modificar el modal de "Registrar Medición" para incluir la casilla `<textarea>` de "Breve Análisis del Resultado".
  - [x] Actualizar la función `handleSubmitMeasurement` para usar el valor de `qualitative` elegido por el usuario como el nuevo estado del objetivo (`status = measurementData.qualitative`) y adjuntar `analysis` en el registro.
  - [x] Renderizar el análisis del resultado en la lista del "Historial de Mediciones" en cada tarjeta.

- [x] **Fase 2: Modificaciones en IntegratedObjectives.jsx**
  - [x] Añadir campo `analysis: ''` al inicializador de `measurementData`.
  - [x] Modificar el modal de "Registrar Medición" para incluir la casilla `<textarea>` de "Breve Análisis del Resultado".
  - [x] Actualizar la función `handleSubmitMeasurement` para usar el valor de `qualitative` elegido por el usuario como el nuevo estado del objetivo (`status = measurementData.qualitative`) y adjuntar `analysis` en el registro.
  - [x] Renderizar el análisis del resultado en la lista del "Historial de Mediciones" en cada tarjeta.

- [x] **Fase 25: Habilitación de Servicios y Certificados HSEQ de Contratistas**
  - [x] Declarar estados locales de pestaña y lista de habilitaciones en `Vendors.jsx`.
  - [x] Crear interfaz de pestaña para agregar servicios, ARL, vehículo, permisos e inducción.
  - [x] Implementar validador de estatus e interactividad para rellenar/editar los links de soportes.
  - [x] Diseñar el modal interactivo de Certificado de Habilitación HSEQ con sello de aprobación y QR.
  - [x] Compilar localmente y desplegar a Vercel.

- [x] **Fase 3: Compilación y Despliegue**
  - [x] Validar la compilación del proyecto localmente (`npm run build`).
  - [x] Desplegar en producción mediante Vercel.

- [x] **Fase 26: Módulo de Inducciones y Reinducciones**
  - [x] Implementar la vista administrativa principal `Inductions.jsx` con material didáctico y estadísticas.
  - [x] Crear el formulario público de asistencia `PublicInductionAttendance.jsx` con firma digital canvas.
  - [x] Crear la evaluación pública `PublicInductionEvaluation.jsx` con cuestionarios condicionales y certificado digital.
  - [x] Registrar las nuevas rutas en `App.jsx` y el enlace en `Sidebar.jsx`.
  - [x] Compilar localmente y desplegar a Vercel.

- [x] **Fase 27: Mejoras y Parametrización de Inducción**
  - [x] Implementar scroll contenedor en las vistas públicas de asistencia y evaluación.
  - [x] Añadir pantalla intermedia de agradecimiento con estatus del resultado (Aprobado/Perdido) en la evaluación pública.
  - [x] Implementar la parametrización de exámenes HSEQ en el tablero administrativo de inducciones.
  - [x] Cargar los exámenes parametrizados en la vista pública de evaluación.
  - [x] Compilar localmente y desplegar a Vercel.

- [x] **Fase 28: Mejoras en Investigación de Accidentes HSEQ**
  - [x] Actualizar el esquema de datos y añadir soporte para enlace FURAT en el reporte nuevo.
  - [x] Implementar la geolocalización (proyecto, ciudad) y cargo en el modal de reporte.
  - [x] Crear el panel detallado de gestión del accidente con tabs interactivos.
  - [x] Permitir subir/editar el informe técnico una vez creado el accidente.
  - [x] Implementar el gestor de planes de acción con agregación de tareas en la vista del accidente.
  - [x] Implementar la asociación y creación automática de capacitaciones de lecciones aprendidas.
  - [x] Validar la compilación y realizar el despliegue a Vercel.

- [x] **Fase 29: Mejoras en Carga de FURAT e Informe Técnico**
  - [x] Cambiar el campo de FURAT a carga de archivo (File Input) en el reporte de accidente y modal de gestión.
  - [x] Trasladar el Informe Técnico del Accidente de la pestaña "Investigación" a la pestaña "Plan de Acción de Cierre".
  - [x] Cambiar el campo de Informe Técnico a carga de archivo (File Input).
  - [x] Actualizar los badges de evidencia en la tabla para reflejar la presencia del archivo adjunto.
  - [x] Compilar localmente y desplegar a Vercel.

- [x] **Fase 30: Parametrización de Exportación en Elementos Estratégicos**
  - [x] Crear un nuevo diseño de plantilla PDF (`strategic`) en `exportUtils.js` que replique la imagen provista.
  - [x] Implementar cabecera simplificada (Logo a la izquierda y Título en azul oscuro itálico centrado).
  - [x] Ubicar los metadatos (Código, Versión, Fecha de revisión) y la firma de Francisco Collavini en la parte inferior derecha.
  - [x] Integrar y habilitar el nuevo formato para las descargas de Misión, Visión y Políticas.
  - [x] Compilar localmente y realizar el despliegue a Vercel.

- [x] **Fase 31: Personalización y Alineación de Firmas en Exportaciones**
  - [x] Añadir checkboxes de selección interactiva de firmantes en `ExportModal.jsx` para Revisores y Aprobadores.
  - [x] Filtrar dinámicamente los firmantes en las llamadas a `exportToPDF` y `exportToExcel`.
  - [x] Modificar la maquetación de firmas en el PDF (`standard` and `strategic`) para ser flexible, auto-centrada y libre de bordes de celdas.
  - [x] Compilar localmente y realizar el despliegue a Vercel.

- [x] **Fase 32: Actualización de Firmas HSEQ Autorizadas**
  - [x] Reemplazar los archivos de firma física en la carpeta `public` del proyecto con las nuevas imágenes en el orden correcto.
  - [x] Compilar localmente y realizar el despliegue a Vercel.

- [x] **Fase 33: Exportación en una Sola Hoja del Organigrama**
  - [x] Instalar la librería `html2canvas` para renderizar el árbol de nodos DOM a lienzo.
  - [x] Ocultar los botones administrativos del organigrama (editar/eliminar) en el lienzo usando `data-html2canvas-ignore`.
  - [x] Forzar la desactivación temporal de zooms y transiciones para capturar a resolución real 1:1, asegurando que todo quepa en una sola hoja.
  - [x] Compilar y desplegar a Vercel.

- [x] **Fase 34: Reestructuración y Estandarización de Exportación en Matriz de Aspectos e Impactos Ambientales**
  - [x] Importar e integrar `ExportModal` en `EnvAspects.jsx`.
  - [x] Crear mapeado de columnas y datos estructurando cada ítem con su respectiva medida de control, responsable, estado y seguimiento.
  - [x] Compilar localmente y realizar el despliegue a Vercel.

- [x] **Fase 35: Estandarización de Exportación en Matriz Legal y Objetivos HSEQ**
  - [x] Reemplazar la descarga de CSV antigua en `LegalMatrix.jsx` por `ExportModal` dividiendo la parametrización en columnas específicas: Categoría, Norma, Año de Emisión y Artículos Aplicables.
  - [x] Añadir columna "Política Integral" como primera columna en la exportación de `IntegratedObjectives.jsx`.
  - [x] Vincular la selección y visualización de la política en el formulario y tarjetas del dashboard de objetivos.
  - [x] Compilar localmente y realizar el despliegue a Vercel.

- [x] **Fase 36: Consolidación y Unificación de Matriz de Proveedores y Contratistas**
  - [x] Integrar `ExportModal` en `Vendors.jsx`.
  - [x] Implementar mapeo que combine los datos de control operativo (NIT, Nombre, Servicio, Riesgo, PILA, Inducción, ARL) con el último registro de evaluación de desempeño (Fecha, Próxima Reevaluación, Evaluador, Puntajes por dimensión, Promedio, Clasificación y Observaciones) en una sola matriz unificada.
  - [x] Compilar localmente y realizar el despliegue a Vercel.

- [x] **Fase 37: Reporte Ecoeficiente y de Residuos con Gráficos e Históricos**
  - [x] Integrar `ExportModal` en `WasteManagement.jsx`.
  - [x] Construir generador dinámico de código HTML (`contentHtml`) que inserte gráficos de distribución de residuos (Diagrama de barras SVG) y de evolución mensual de consumo de agua y energía (Gráfico de líneas doble SVG).
  - [x] Agregar tablas de historial de medición de entregas de residuos e histórico de consumos en la exportación en PDF.
  - [x] Compilar localmente y realizar el despliegue a Vercel.

- [x] **Fase 38: Estandarización de Exportaciones en Mantenimiento y Formación**
  - [x] Integrar `ExportModal` en `Maintenances.jsx` y parametrizar las columnas del cronograma Excel: Categoría, Equipo, Fecha Programada, Fecha de Ejecución, Responsable, ¿Se Cumplió? (SÍ/NO), Observaciones de Ejecución y Requerimientos / Acciones de Mejora.
  - [x] Integrar `ExportModal` en `Trainings.jsx` y parametrizar las columnas del plan Excel: Fecha Programada, Tema, Categoría, Facilitador, ¿Se Realizó? (SÍ/NO), Asistentes Registrados, Promedio de Asistencia (%) y Promedio de Calificación (%) si la tiene.
  - [x] Compilar localmente y realizar el despliegue a Vercel.

- [x] **Fase 39: Matriz de Comunicaciones HSEQ**
  - [x] Crear el componente de página `Communications.jsx` con persistencia en localStorage, carga de procesos dinámicos y datos semilla realistas.
  - [x] Implementar la interfaz con pestañas por proceso, tabla de registros de comunicación y modal de creación/edición de registros.
  - [x] Integrar `ExportModal` en `Communications.jsx` para soportar descargas en Excel and PDF (tanto del proceso activo como consolidadas).
  - [x] Registrar la ruta `/communications` en `App.jsx`.
  - [x] Agregar el enlace del menú en `Sidebar.jsx` bajo Planeación Estratégica.
  - [x] Verificar el correcto funcionamiento de las operaciones, la navegación por pestañas y las exportaciones a PDF/Excel.
  - [x] Compilar y desplegar a producción en Vercel.

- [x] **Fase 40: Encuesta Pública y Parámetros de Satisfacción de Clientes**
  - [x] Crear el portal público `/encuesta-cliente` en `PublicCustomerSurvey.jsx` con formulario móvil adaptativo, cálculo automático de NPS (1-10) sobre 100 y guardado en local storage.
  - [x] Implementar la pestaña "Parámetros del Formulario" en `CustomerSatisfaction.jsx` que represente visualmente la matriz provista por el usuario con todas sus ponderaciones y preguntas.
  - [x] Incorporar el generador de enlace y código QR de satisfacción del cliente en la sección principal del módulo.
  - [x] Configurar la ruta `/encuesta-cliente` en `App.jsx`.
  - [x] Compilar y desplegar a producción en Vercel.

- [x] **Fase 41: Exportación con Gráfico de Análisis por Tipo de Proyecto**
  - [x] Integrar `ExportModal` en `CustomerSatisfaction.jsx`.
  - [x] Diseñar y programar un gráfico SVG dinámico que compare el promedio de satisfacción NPS por cada tipo de proyecto (Eléctrico, Telecomunicaciones, Civil, Ambiental, Industrial).
  - [x] Renderizar el gráfico SVG y el resumen ejecutivo dentro de la exportación PDF.
  - [x] Compilar y desplegar a producción en Vercel.
