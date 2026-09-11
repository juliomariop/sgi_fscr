# Revisión de Seguridad (SAST) — SGI Enterprise / HSEQ APP

**Alcance:** análisis estático manual del código fuente en `src/` del repositorio, enfocado en autenticación/autorización, manejo de credenciales, generación de HTML/exportables y almacenamiento en cliente.
**Metodología:** revisión línea por línea de los módulos de autenticación (`AuthContext`, `App.jsx`), servicios externos (`supabase.js`, `oneDriveService.js`) y utilidades de exportación (`exportUtils.js`), correlacionada con búsquedas dirigidas (`document.write`, `localStorage`, `dangerouslySetInnerHTML`, rutas protegidas por rol).

**Adenda — revisión ampliada (2026-09-10):** segunda pasada cubriendo el resto de `src/` (los 7 formularios públicos, todas las páginas administrativas, hooks de datos, componentes compartidos), la configuración de ESLint/Vite y un escaneo de dependencias (`npm audit`). Se agregan 15 hallazgos nuevos, verificados uno por uno directamente en el código (no solo referidos por herramienta automática), y se amplía un hallazgo existente con ubicaciones adicionales.

---

### 🔴 ALTAS

* **Control de acceso roto: lectura y escritura completa sin autenticación sobre datasets de toda la organización (IDOR masivo)**
  - **Archivo y Línea:** `src/hooks/useLocalStorage.js:25-26, 30-34, 129-149`
  - **Descripción breve:** Toda la aplicación persiste sus datos en una única tabla Supabase `app_data` (columnas `key`, `data` JSON, `updated_at`); cada fila contiene el **arreglo completo** de una categoría (todos los reportes, todas las encuestas, todos los registros de inducción), no un registro individual. Para las claves marcadas como "públicas" en el arreglo `isPublicKey` (`sgi_customer_surveys`, `sgi_trainings`, `sgi_unsafe_reports`, `sgi_inducciones_records`), tanto el `select` (líneas 30-34) como el `upsert` (líneas 140-149) se ejecutan **sin exigir `user`/`user.id`** — es decir, sin sesión alguna.
  - **Impacto:** Cualquier visitante anónimo que abra cualquiera de los formularios públicos (`PublicUnsafeReport.jsx:126`, `PublicCustomerSurvey.jsx:91`, `PublicEvaluation.jsx`, `PublicInductionAttendance.jsx:147`, `PublicInductionEvaluation.jsx`) descarga al navegador el historial **completo** de esa categoría para toda la organización — no solo lo relacionado con su propio envío — incluyendo datos personales (nombre, cédula, cargo, ciudad) de todos los empleados/contratistas que hayan usado ese formulario. Al enviar el formulario, el `upsert` reemplaza la fila entera: un envío malicioso (o simplemente un bug del cliente) puede borrar o corromper el historial completo de reportes/capacitaciones/inducciones de toda la empresa, no solo agregar un registro propio. Como la clave anónima de Supabase ya viaja en el bundle público, esto es ejecutable directamente contra la API de Supabase sin pasar por la interfaz de la aplicación. Nota arquitectónica: esto no se corrige solo ajustando RLS por fila, porque "agregar un registro" y "reemplazar el historial de todos" son, hoy, la misma operación (`upsert` de la fila completa) — se requiere rediseñar el almacenamiento a una fila por registro.
  - **Remediación:** Migrar cada clave "pública" de un blob JSON único a una tabla con una fila por registro (p. ej. `unsafe_reports(id, description, worker, created_at, ...)`), con políticas RLS que permitan `insert` a `anon` pero **nunca** `select`/`update`/`delete` masivo:
    ```sql
    create policy "anon can insert own report"
    on unsafe_reports for insert
    to anon
    with check (true); -- valida solo forma/tamaño de los campos, nunca ownership total

    -- Sin policy de SELECT/UPDATE/DELETE para `anon`: por defecto, denegado.
    ```
    Mientras se migra, como mitigación inmediata: mover la escritura pública detrás de una Supabase Edge Function que reciba solo el registro nuevo, lo valide, y haga el `insert`/`upsert` internamente con la service role — nunca exponer al cliente un `upsert` directo sobre la fila completa.

* **Control de acceso administrativo delegado al cliente (Broken Access Control)**
  - **Archivo y Línea:** `src/App.jsx:59-65`
  - **Descripción breve:** `AdminRoute` decide si un usuario puede acceder a `AdminSettings` comparando `user.role !== 'Administrador General'` usando el objeto `user` que vive en el estado de React y en `localStorage` (`sgi_current_user`, ver `AuthContext.jsx:219`). No hay ninguna verificación de rol del lado servidor (RLS de Supabase) confirmada en el código para las operaciones sensibles de esta pantalla (cambio de rol, reseteo de contraseña).
  - **Impacto:** Cualquier usuario autenticado puede editar `sgi_current_user` en `localStorage` (o interceptar la respuesta de `profiles`) para fijar `role: "Administrador General"` y recargar la aplicación, obteniendo acceso a la gestión de usuarios, cambio de roles de terceros (`AdminSettings.jsx:190-208`) y disparo de reseteos de contraseña para cualquier correo. Si las políticas RLS de Supabase no replican exactamente esta misma regla en el backend, el atacante obtiene escalamiento de privilegios real, no solo cosmético.
  - **Remediación:** Tratar el rol del cliente como una sugerencia de UI únicamente. Aplicar Row Level Security en Supabase sobre la tabla `profiles` (y cualquier RPC de cambio de rol) que verifique `auth.uid()` contra una tabla de administradores gestionada en el servidor, y rechazar el `update` si el solicitante no es admin en el backend:
    ```sql
    create policy "only admins can update roles"
    on profiles for update
    using (
      exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'Administrador General')
    );
    ```
    Adicionalmente, no fiar el gate de `AdminRoute` solo al `role` cacheado: revalidar contra `supabase.auth.getSession()` + una consulta fresca de `profiles` antes de renderizar acciones destructivas.

* **Auto-asignación de rol "Administrador General" por correo hardcodeado, duplicado en 4 archivos (Authentication/Authorization Bypass)**
  - **Archivo y Línea:** `src/context/AuthContext.jsx:34, 57, 164-165`; **reimplementado de forma independiente** en `src/pages/Dashboard.jsx:12`, `src/pages/SystemDocs.jsx:42` y `src/pages/AdminSettings.jsx:459`.
  - **Descripción breve:** El mismo patrón (`email?.toLowerCase().trim() === '<correo hardcodeado>'`) aparece copiado en cuatro archivos distintos, no solo en `AuthContext.jsx` como se reportó inicialmente. Cada copia concede el rol `Administrador General` (o el flag `isAdmin` local) automáticamente a cualquier sesión cuyo email coincida con esa dirección personal específica hardcodeada en el bundle. Esta lógica de autorización vive en el JavaScript del cliente, visible para cualquiera que inspeccione el código fuente.
  - **Impacto:** Un atacante que logre registrar o tomar control de esa cuenta de correo específica obtiene privilegios de administrador total automáticamente. El impacto es mayor de lo reportado originalmente: en `src/pages/SystemDocs.jsx:208,701,708` ese mismo flag (`isAdmin`) gatea directamente la aprobación y **eliminación permanente de documentos oficiales del sistema de gestión** (mover a "Obsoletos", aprobar/rechazar bajas), y en `AdminSettings.jsx:459` protege — de forma puramente cosmética — la fila de esa cuenta en el selector de cambio de rol. Al estar duplicada en 4 lugares, una futura corrección parcial (arreglar solo `AuthContext.jsx`) dejaría 3 puertas traseras funcionando igual. Exponer la regla de negocio ("quién es el admin") en el frontend también facilita que cualquiera localice ese correo en el propio código fuente e intente atacarlo puntualmente (phishing, password spraying, recuperación de cuenta). *(Por tratarse de una dirección de correo personal real, se omite deliberadamente de este informe público; el equipo puede ubicarla en los archivo/línea indicados.)*
  - **Remediación:** Eliminar las 4 comparaciones de email hardcodeado del cliente. Definir el rol de administrador exclusivamente en el backend (columna `role` en `profiles`, gestionada por un admin existente o por una migración inicial `seed`), nunca inferido desde el email en tiempo de ejecución del navegador:
    ```js
    // Eliminar por completo esta comparación de email hardcodeado, en las 4 ubicaciones.
    // El rol/isAdmin debe derivarse únicamente de data.role (columna en Supabase,
    // protegida por RLS), nunca de una comparación de string contra un correo
    // específico repetida en cada componente que la necesite.
    ```

* **Cross-Site Scripting (XSS) almacenado vía `document.write` sin sanitizar (Stored/DOM XSS)**
  - **Archivo y Línea:** `src/utils/exportUtils.js:285-320` (y ocurrencias equivalentes en líneas `403` y `580`)
  - **Descripción breve:** Los campos `docData.description`, `docData.worker`, `docData.location`, `docData.approvalRemarks`, `docData.activity`, `docData.team`, `docData.checklist?.fireWatcher`, entre otros —que provienen de formularios internos y, en varios flujos, de formularios **públicos** sin autenticación (`PublicUnsafeReport`, `PublicEvaluation`, etc.)— se interpolan directamente dentro de una plantilla HTML que luego se inyecta con `printWindow.document.write(...)` sin ningún escape ni sanitización.
  - **Impacto:** Si un usuario (interno o externo, según el formulario de origen) introduce `<script>` o atributos `on*` en campos de texto libre como "descripción" u "observaciones", ese payload se ejecuta en el contexto de la ventana de impresión/exportación cuando otro usuario (potencialmente un administrador) genera el reporte, permitiendo robo de sesión, pivote a acciones administrativas o exfiltración de datos vía `document.cookie` / llamadas a la API con la sesión del admin.
  - **Remediación:** Escapar todo valor dinámico antes de interpolarlo en HTML, o construir el DOM con `textContent` en lugar de strings HTML:
    ```js
    const escapeHtml = (str) =>
      String(str ?? '').replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
      }[c]));

    // ...
    <td>${escapeHtml(docData.description)}</td>
    ```
    Aplicar `escapeHtml` a **todo** campo proveniente de `docData` (y de sus sub-objetos `checklist`/`epccChecklist`) antes de construir cualquiera de las tres plantillas de impresión.

* **Respuestas correctas del examen de inducción SST embebidas en el bundle del cliente**
  - **Archivo y Línea:** `src/pages/PublicInductionEvaluation.jsx:10-231` (objeto `DEFAULT_CUESTIONARIOS`, campo `correct` en cada pregunta)
  - **Descripción breve:** El banco de preguntas del examen de inducción de seguridad industrial, incluyendo cuál opción es la correcta para cada pregunta, se define como un objeto JavaScript plano que se envía completo al navegador de cualquier visitante.
  - **Impacto:** Cualquiera puede leer el código fuente servido (basta abrir las herramientas de desarrollador) y obtener el 100% de aciertos sin conocer nada de seguridad industrial. El resultado alimenta un certificado de inducción "vigente por 1 año" (`:399-401`), es decir, la aplicación puede certificar formalmente que una persona conoce los protocolos de seguridad del sitio cuando en realidad nunca los leyó — riesgo directo de seguridad laboral, no solo informático.
  - **Remediación:** Mover el banco de preguntas y la corrección a una función server-side (Supabase Edge Function/RPC). El cliente debe recibir únicamente el texto de la pregunta y las opciones, nunca cuál es la correcta; el servidor calcula el puntaje y devuelve solo el resultado (aprobado/reprobado + puntaje).

* **Resultado de evaluación (aprobado/reprobado y puntaje) calculado 100% en el cliente, sin revalidación en servidor**
  - **Archivo y Línea:** `src/pages/PublicEvaluation.jsx:92-116`, `src/pages/PublicInductionEvaluation.jsx:373-419`
  - **Descripción breve:** Ambos flujos de evaluación pública calculan `finalScore`/`finalPassed` comparando las respuestas del usuario contra `q.correct` enteramente en JavaScript del navegador, y luego escriben ese resultado directamente en el dataset compartido (ver hallazgo de acceso no autenticado, arriba).
  - **Impacto:** Incluso si se ocultara el banco de respuestas (hallazgo anterior), nada impide construir directamente una petición que fije `passed: true, score: 100` para cualquier número de documento, falsificando una certificación de cumplimiento HSEQ sin siquiera abrir el formulario de preguntas.
  - **Remediación:** El servidor debe ser la única fuente de verdad del resultado: el cliente envía `{ documento, respuestas }`, una función server-side (que mantiene las respuestas correctas fuera del alcance del cliente) calcula el puntaje y persiste el resultado; el cliente solo recibe de vuelta aprobado/reprobado y, si aplica, el código de certificado.

* **Códigos de certificado secuenciales y predecibles + endpoint público de verificación que expone PII por enumeración**
  - **Archivo y Línea:** `src/pages/PublicInductionEvaluation.jsx:394` (generación del código), `:278-291` (lookup público vía parámetro `?verify=`)
  - **Descripción breve:** El código de certificado se construye como `IND-2026-<contador secuencial derivado de records.length>`, sin firma ni componente aleatorio. El parámetro de URL `?verify=<código>` hace una búsqueda directa (`records.find(...)`) sobre el mismo arreglo completo y sin autenticación del hallazgo de acceso no autenticado, y si encuentra coincidencia muestra nombre, cédula, cargo, ciudad y proyecto del titular sin ningún control de acceso.
  - **Impacto:** Al ser una secuencia corta y predecible, es viable iterar códigos (`IND-2026-101`, `102`, `103`, ...) desde la URL pública de verificación y extraer datos personales del historial completo de inducciones de la organización, sin necesidad de conocer ningún dato previo de la víctima.
  - **Remediación:** Generar el código con un componente no predecible y firmado (HMAC sobre el id del registro, o directamente un UUID), y mover la verificación a una función server-side que devuelva únicamente "válido/no válido" + nombre (sin cédula ni demás PII), con rate-limiting sobre ese endpoint.

---

### 🟡 MEDIAS

* **Tokens OAuth de Microsoft Graph almacenados en `localStorage` en texto plano (Insecure Storage of Sensitive Data)**
  - **Archivo y Línea:** `src/services/oneDriveService.js:43-49, 96-102`
  - **Descripción breve:** `accessToken` y `refreshToken` de Microsoft Graph (con scope `Files.ReadWrite offline_access user.read`) se guardan sin cifrar en `localStorage` bajo la clave `sgi_onedrive_tokens`.
  - **Impacto:** Cualquier XSS (incluida la de la sección ALTAS) o extensión de navegador maliciosa puede leer `localStorage` y exfiltrar el `refreshToken`, obteniendo acceso persistente de lectura/escritura sobre los archivos de OneDrive/SharePoint de la cuenta corporativa conectada, incluso después de que el usuario cierre sesión en la app.
  - **Remediación:** Mover el intercambio y almacenamiento de tokens a un backend (BFF) que mantenga los tokens en una cookie `httpOnly`/`secure`, exponiendo al frontend solo un token de sesión de corta duración. Si no es viable a corto plazo, al menos reducir el scope solicitado al mínimo necesario y documentar la exposición como riesgo aceptado mientras se planifica la migración.

* **Fallback silencioso a credenciales Supabase embebidas cuando la configuración falta (Security Misconfiguration)**
  - **Archivo y Línea:** `src/services/supabase.js:20-24`
  - **Descripción breve:** Si `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` no están configuradas, el cliente construye igual una instancia de Supabase apuntando a una URL de proyecto real y específica hardcodeada en el archivo, junto con una clave marcada como `.invalid`, en lugar de fallar de forma explícita o deshabilitar por completo las llamadas de red.
  - **Impacto:** Un despliegue mal configurado (variables de entorno ausentes en un entorno nuevo, staging, o fork del proyecto) no falla de forma visible: intentará conectarse silenciosamente a ese proyecto Supabase específico, generando errores de red confusos en producción y dificultando detectar el problema real de configuración. Además, tener esa URL de proyecto real hardcodeada como "fallback" (en vez de solo en variables de entorno) la deja fija en el código fuente de forma innecesaria. *(Se omite la URL literal de este informe público; ver `supabase.js:21`.)*
  - **Remediación:** Fallar rápido y explícito cuando falte configuración crítica, en lugar de sustituir por un valor "casi válido":
    ```js
    if (!isSupabaseConfigured) {
      console.error('Supabase no está configurado: defina VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.');
    }
    export const supabase = isSupabaseConfigured
      ? createClient(url, key)
      : null; // y manejar el caso null explícitamente en cada consumidor / modo mock
    ```

* **Inyección de fórmulas CSV / Excel (CSV Formula Injection)**
  - **Archivo y Línea:** `src/utils/exportUtils.js:14-28` (`downloadCSV`) y las escrituras de celdas en `exportUtils.js:857` (`cell.value = val.toString()`) dentro de la generación de `.xlsx` con ExcelJS
  - **Descripción breve:** Los valores de las filas exportadas se escriben tal cual (solo se escapan comillas dobles para el formato CSV), sin neutralizar un prefijo `=`, `+`, `-` o `@` al inicio del valor. Excel/LibreOffice interpretan esas celdas como fórmulas al abrir el archivo.
  - **Impacto:** Si un campo de texto libre (por ejemplo, un nombre de proveedor, una observación de incidente, o cualquier dato ingresado por un formulario público) comienza con `=`, `+`, `-` o `@`, al exportar y abrir el archivo en Excel/LibreOffice esa celda se interpreta como fórmula en lugar de texto plano. Según la función usada, esto permite desde enlaces engañosos tipo `HYPERLINK(...)` (phishing) hasta fuga de datos de otras celdas de la hoja, o —en configuraciones antiguas con DDE habilitado— ejecución de comandos del sistema operativo al abrir el archivo.
  - **Remediación:** Neutralizar el primer carácter de celdas que comiencen con `=`, `+`, `-`, `@`, `\t` o `\r` anteponiendo un apóstrofe antes de exportar:
    ```js
    const sanitizeForSpreadsheet = (val) => {
      const s = String(val ?? '');
      return /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
    };
    ```
    Aplicar `sanitizeForSpreadsheet` tanto en `downloadCSV` como antes de cada `cell.value = ...` que reciba texto proveniente de datos de usuario en `exportUtils.js`.

* **Ausencia de límite de tasa / bloqueo de fuerza bruta en login (Improper Restriction of Authentication Attempts)**
  - **Archivo y Línea:** `src/pages/Login.jsx:18-74`, `src/context/AuthContext.jsx:142-161`
  - **Descripción breve:** El flujo de `login` reenvía cada intento directamente a `supabase.auth.signInWithPassword` sin ningún throttling, CAPTCHA ni bloqueo progresivo del lado de la aplicación; toda la mitigación depende exclusivamente de la configuración del proyecto Supabase (fuera de este código).
  - **Impacto:** Si el rate-limiting de Supabase Auth no está explícitamente configurado de forma estricta, la aplicación no aporta ninguna capa adicional de defensa contra ataques de fuerza bruta o credential stuffing contra las cuentas registradas.
  - **Remediación:** Habilitar y verificar el rate limiting nativo de Supabase Auth para el proyecto, y añadir en el cliente un backoff progresivo simple (deshabilitar el botón de envío incrementalmente tras fallos consecutivos) como defensa en profundidad, documentando la dependencia de la configuración del backend.

* **Directorio completo de usuarios (email, nombre, rol) expuesto a cualquier cuenta autenticada, sin filtrar por rol**
  - **Archivo y Línea:** `src/hooks/useAppUsers.js:36-39, 57-66`
  - **Descripción breve:** `useAppUsers` hace `select('email, name, role')` sobre la tabla `profiles` sin ninguna cláusula `.eq()`/filtro, y además suscribe a **todos** los cambios en tiempo real de esa tabla — para cualquier usuario autenticado, sea cual sea su rol.
  - **Impacto:** Cualquier cuenta, incluida la de menor privilegio, puede enumerar el correo, nombre y rol exacto de cada persona registrada en el sistema, incluyendo quién es administrador — información útil para dirigir ingeniería social o phishing selectivo contra las cuentas más privilegiadas.
  - **Remediación:** Restringir vía RLS qué columnas/filas de `profiles` puede leer un usuario no-admin (por ejemplo, exponer solo `name` para el directorio general, y reservar `email`/`role` completo a administradores), o servir el directorio a través de una vista/función que ya aplique ese recorte.

* **Condición de carrera "último en escribir gana" sin bloqueo optimista en la sincronización local/remota**
  - **Archivo y Línea:** `src/hooks/useLocalStorage.js:46-68, 129-154`
  - **Descripción breve:** La sincronización compara marcas de tiempo (`updated_at` remoto vs. `_local_updated_at`) para decidir si sobrescribe, pero `setValue` siempre sube el snapshot local **completo** sin fusionar cambios ni verificar que nadie más haya escrito esa misma clave entre la lectura y la escritura.
  - **Impacto:** Dos usuarios editando la misma clave de forma concurrente (p. ej. dos personas actualizando la matriz de riesgos al mismo tiempo) pueden perder silenciosamente los cambios del otro, sin ningún aviso ni conflicto reportado. Esto aplica también a las claves "públicas" del hallazgo de acceso no autenticado, agravando el riesgo de pérdida de datos allí.
  - **Remediación:** Migrar a filas individuales por registro (ver remediación del primer hallazgo ALTO), donde Postgres/Supabase maneja la concurrencia a nivel de fila; si se mantiene el esquema de blob JSON en el corto plazo, agregar una verificación de versión/ETag que rechace la escritura si el remoto cambió desde la última lectura, en vez de sobrescribir ciegamente.

* **Mensajes de error crudos del backend expuestos directamente al usuario final**
  - **Archivo y Línea:** `src/components/ExportModal.jsx:107`; `src/pages/AdminSettings.jsx:208,228`; `src/pages/LegalMatrix.jsx:218`; `src/pages/RisksSst.jsx:385`; `src/pages/SystemDocs.jsx:179,263,437,548`
  - **Descripción breve:** Nueve ocurrencias del mismo patrón (`alert('...' + err.message)`) muestran directamente al usuario el mensaje de error crudo devuelto por Supabase/PostgREST o por la API de OneDrive.
  - **Impacto:** Estos mensajes pueden filtrar detalles internos (nombres de tabla/columna, restricciones de base de datos, códigos de error del proveedor) útiles para un atacante en fase de reconocimiento, además de dar una experiencia de usuario poco profesional ante fallos comunes.
  - **Remediación:** Registrar el error crudo solo en consola/telemetría interna, y mostrar al usuario un mensaje genérico y traducido; si se necesita detalle para soporte, ofrecerlo en una sección "ver detalle técnico" plegada, no en el `alert` principal.

* **Protección contra auto-escalación de rol basada únicamente en el atributo HTML `disabled`**
  - **Archivo y Línea:** `src/pages/AdminSettings.jsx:187-210` (`handleRoleChange`), `:459` (`<select disabled={...}>`)
  - **Descripción breve:** El selector de rol se deshabilita en el DOM para la cuenta fija de administrador y para la propia sesión, pero `handleRoleChange` —la función que realmente ejecuta el cambio— no repite ninguna validación equivalente: es el mismo código que se dispararía si el `<select>` no estuviera deshabilitado.
  - **Impacto:** Cualquier usuario autenticado que ya haya llegado a esta pantalla puede disparar manualmente el evento `onChange` (o llamar directamente a la actualización de Supabase que usa la misma ruta) para cambiar el rol de cualquier perfil, incluido el propio, sin que el `disabled` cosmético lo impida.
  - **Remediación:** Agregar la verificación real en el backend (política RLS o una función `SECURITY DEFINER` que confirme que quien llama ya es administrador antes de permitir el `update` de `role`), de modo que la protección no dependa de que el botón esté deshabilitado en el navegador.

* **Auto-registro de asistencia/inducción sin verificar la identidad real del participante**
  - **Archivo y Línea:** `src/pages/PublicEvaluation.jsx:63-70,118-141`; `src/pages/PublicInductionAttendance.jsx` (formulario completo); `src/pages/PublicInductionEvaluation.jsx:329-359` (`showManualForm`)
  - **Descripción breve:** Estos formularios públicos permiten crear un registro nuevo de asistencia/inducción con cualquier número de documento escrito a mano, sin verificar contra ninguna fuente que esa persona/cédula exista realmente en la organización.
  - **Impacto:** Cualquiera puede generar registros falsos de asistencia a comités, capacitaciones o inducciones de seguridad para una cédula inventada (o la de un tercero), lo que en un sistema HSEQ equivale a poder falsificar evidencia de cumplimiento normativo en seguridad y salud en el trabajo.
  - **Remediación:** Exigir que el registro ya exista (creado previamente por un proceso interno/RRHH) antes de permitir que el formulario público lo complete/actualice, en lugar de permitir que un formulario público cree identidades nuevas libremente.

* **Datos personales de identificación (cédula) sin cifrado de campo ni política de retención documentada**
  - **Archivo y Línea:** mecanismo general en `src/hooks/useLocalStorage.js`; campo de cédula recolectado en `PublicAttendance.jsx`, `PublicInductionAttendance.jsx`, `PublicInductionEvaluation.jsx`, `PublicEvaluation.jsx`, `PublicCommitteeAttendance.jsx`
  - **Descripción breve:** El número de documento de identidad se guarda en texto plano, indefinidamente, dentro de un blob JSON genérico, sin ninguna protección a nivel de campo ni una política de retención/purga documentada.
  - **Impacto:** Independientemente de que se corrija el control de acceso (hallazgo ALTO), mantener un identificador nacional en texto plano sin límite de retención aumenta la exposición ante cualquier otro incidente futuro (respaldo mal asegurado, herramienta de soporte, otro bug) — relevante bajo la Ley 1581 de 2012 de Protección de Datos Personales en Colombia.
  - **Remediación:** Definir y documentar un período de retención, enmascarar/tokenizar el número de documento en cualquier vista exportada o registrada en logs, y evaluar cifrado a nivel de columna en Postgres para ese campo específico.

* **Dependencia de producción `react-router-dom` con múltiples vulnerabilidades conocidas**
  - **Archivo y Línea:** `package.json` (`"react-router-dom": "^7.16.0"`, resuelve dentro del rango vulnerable según `npm audit`)
  - **Descripción breve:** La versión instalada cae dentro del rango afectado por varios advisories públicos: open redirect vía `<Link>`/`useNavigate`, XSS por validación de protocolo insuficiente en el manejo de errores de RSC, denegación de servicio por matching de rutas ineficiente, y un bypass de CSRF en modo RSC.
  - **Impacto:** A diferencia de otras dependencias vulnerables solo en tiempo de desarrollo, `react-router-dom` se ejecuta en el navegador de cada usuario final en producción, por lo que estas fallas (especialmente el open redirect y el XSS) son explotables directamente contra usuarios reales de la aplicación desplegada.
  - **Remediación:** Ejecutar `npm update react-router-dom` a la versión parcheada más reciente compatible y agregar `npm audit --audit-level=high` (o equivalente) como paso de CI para bloquear regresiones futuras.

* **Dependencias de la cadena de build (`vite`/`esbuild`) con vulnerabilidades del servidor de desarrollo**
  - **Archivo y Línea:** `package.json` (`"vite": "^5.2.0"`, resuelve dentro del rango vulnerable `<=6.4.2` según `npm audit`)
  - **Descripción breve:** El servidor de desarrollo de Vite en esta versión es vulnerable a path traversal en el manejo de archivos `.map` de dependencias optimizadas y a un bypass de `server.fs.deny` en Windows.
  - **Impacto:** El impacto se limita principalmente al entorno de desarrollo/CI (`npm run dev`), no al build de producción servido por Vercel; aun así, si algún desarrollador expone `vite dev`/`vite preview` en una red no confiable, un atacante en esa red podría leer archivos fuera de la raíz del proyecto.
  - **Remediación:** Actualizar a la última versión estable de Vite que corrija estos advisories (`npm audit fix` o actualización manual de mayor versión), y evitar exponer los servidores de desarrollo/preview en interfaces de red no confiables.

---

### 🟢 BAJAS

* **Manejo de sesión "fail-open" ante errores de inicialización de Auth (Error Handling / Defensa en Profundidad)**
  - **Archivo y Línea:** `src/context/AuthContext.jsx:92-101`
  - **Descripción breve:** Si `supabase.auth.getSession()` lanza una excepción, el código cae a "retener la sesión local cacheada" y solo limpia el usuario si no había nada guardado en `localStorage`; el comentario del propio código ("Retaining local cached session") documenta la decisión de negocio de priorizar disponibilidad sobre re-verificación.
  - **Impacto:** En un escenario de error transitorio del backend, un usuario cuya sesión ya fue revocada en el servidor podría seguir viendo la UI autenticada con datos cacheados hasta el siguiente refresh exitoso; es un riesgo menor porque las llamadas a datos reales seguirán pasando por la validación de Supabase, pero prolonga la ventana de una sesión que debería haber expirado.
  - **Remediación:** Documentar explícitamente este trade-off como decisión aceptada, o acortar la ventana revalidando la sesión activamente (`getSession` con reintento corto) antes de confiar en el cache más allá de unos segundos.

* **Lógica de negocio (reglas de roles reservados) expuesta en el frontend**
  - **Archivo y Línea:** `src/pages/Login.jsx:153-160`
  - **Descripción breve:** La validación "el cargo 'Administrador General' está reservado" vive como un `alert()` en el formulario de registro del cliente, revelando en el bundle público la existencia de un rol privilegiado reservado y su nombre exacto, sin que exista (según lo revisado) una validación equivalente en el servidor.
  - **Impacto:** No es explotable por sí sola (ver hallazgo ALTO relacionado sobre `isJairo`), pero facilita a un atacante mapear la lógica de privilegios de la aplicación con solo leer el JavaScript servido.
  - **Remediación:** Mantener la validación en el cliente solo como mejora de UX, pero mover la fuente de verdad y el rechazo real de "roles reservados" a una validación server-side (trigger o política en Supabase) al insertar/actualizar `profiles.role`.

* **Simulación de progreso de subida no representa el estado real de la operación**
  - **Archivo y Línea:** `src/services/oneDriveService.js:186-196`
  - **Descripción breve:** La barra de progreso de subida a OneDrive se simula con `Math.random()` en un `setInterval`, desconectada del progreso real de la petición `fetch` subyacente.
  - **Impacto:** No es una vulnerabilidad de seguridad explotable, pero es una desviación de buenas prácticas que puede inducir a error al usuario sobre el estado real de una operación que maneja documentos corporativos sensibles (p. ej., mostrar "90%" mientras la subida real ya falló silenciosamente si no se maneja bien la carrera entre el intervalo y el `fetch`).
  - **Remediación:** Usar `XMLHttpRequest` con el evento `upload.onprogress`, o `fetch` con `ReadableStream`, para reflejar el progreso real en lugar de simularlo.

* **Generación de identificadores con `Date.now()`/`Math.random()` en vez de un generador criptográfico**
  - **Archivo y Línea:** `src/utils/activityLogger.js:21,48`; `src/pages/Bsc.jsx:132`; `src/pages/Committees.jsx:149,181,238,255`; `src/pages/SystemDocs.jsx:270`; `src/pages/PublicInductionEvaluation.jsx:340`
  - **Descripción breve:** Múltiples registros usan `Date.now()`, `Math.random()` o su combinación como identificador único, en vez de un generador criptográficamente seguro.
  - **Impacto:** En la mayoría de estos casos son solo IDs internos de registros (impacto bajo). El caso a vigilar es `Committees.jsx:181`: ese mismo id (`Date.now()`, predecible) es el único "token" usado en la URL pública sin autenticación `/asistencia-comite/:id` (QR de firma de asistencia). Hoy ese flujo específico parece no funcionar para un visitante anónimo genuino en otro dispositivo (la clave `sgi_committees` no está en la lista de claves "públicas" de `useLocalStorage.js`, así que nunca sincroniza sin sesión), lo que limita la explotabilidad actual — pero conviene corregir el esquema de ID antes de que alguien "arregle" ese bug de sincronización sin arreglar también esto.
  - **Remediación:** Usar `crypto.randomUUID()` para cualquier identificador, y especialmente para los que además funcionan como token de acceso en una URL pública.

* **Registro verboso de payloads completos (incluye datos de otros usuarios) en la consola del navegador de producción**
  - **Archivo y Línea:** `src/hooks/useLocalStorage.js:52,84,91,110`
  - **Descripción breve:** Cada actualización en tiempo real y cada decisión de sincronización se imprime con `console.log`, incluyendo el payload completo recibido (que puede contener nombres, cédulas, descripciones de otros usuarios).
  - **Impacto:** Cualquiera con las herramientas de desarrollador abiertas (o una extensión de navegador maliciosa) puede leer en la consola datos de otros usuarios que no debería ver, durante el uso normal de la aplicación.
  - **Remediación:** Eliminar estos `console.log`, o condicionarlos a `import.meta.env.DEV` para que nunca se ejecuten en producción.

* **Regla de lint de seguridad desactivada explícitamente + instancias reales sin la protección que evitaría**
  - **Archivo y Línea:** `.eslintrc.cjs` (`'react/jsx-no-target-blank': 'off'`); `src/pages/Inductions.jsx:588,607` (`target="_blank"` sin `rel="noopener noreferrer"`)
  - **Descripción breve:** El proyecto desactiva explícitamente la regla de ESLint que exige `rel="noopener noreferrer"` en enlaces `target="_blank"`, y efectivamente hay dos enlaces en el código que no la llevan.
  - **Impacto:** Bajo hoy, porque ambos `href` son rutas internas fijas, no URLs controladas por el usuario (no hay reverse tabnabbing real en estos dos casos concretos). El problema es que, al estar la regla apagada a nivel de proyecto, cualquier enlace futuro con una URL dinámica/de usuario y `target="_blank"` quedaría igual de desprotegido sin que el linter lo detecte.
  - **Remediación:** Reactivar `'react/jsx-no-target-blank': 'error'` en `.eslintrc.cjs` y agregar `rel="noopener noreferrer"` a los dos enlaces señalados.

---

## Resumen Ejecutivo

| Severidad | Cantidad |
|---|---|
| 🔴 Altas | 7 |
| 🟡 Medias | 12 |
| 🟢 Bajas | 6 |
| **Total** | **25** |

**Recomendación general:** la revisión ampliada confirma y agrava el diagnóstico original — este sistema decide casi toda su seguridad (quién es admin, qué datos puede leer/escribir un visitante anónimo, si un examen de cumplimiento HSEQ fue aprobado) **en el navegador**, no en el servidor. El hallazgo más severo de esta segunda pasada es que cuatro claves de datos (encuestas de clientes, capacitaciones, reportes de actos inseguros y registros de inducción) son legibles y **escribibles por completo, sin ninguna autenticación**, a través de `useLocalStorage.js` — esto no es una falla puntual sino un patrón arquitectónico que también compromete la integridad de esos mismos datos (condición de carrera) y, combinado con el examen de inducción cuyas respuestas viajan al cliente y cuyo resultado se calcula sin revalidación en el servidor, permite falsificar certificaciones de seguridad industrial de principio a fin sin tocar la interfaz de la aplicación. Prioridad inmediata para el equipo: (1) migrar las 4 claves "públicas" de blobs JSON a tablas con una fila por registro y RLS real, (2) mover el banco de respuestas y el cálculo de aprobado/reprobado de los exámenes a una función server-side, (3) eliminar las 4 copias del correo de administrador hardcodeado, y (4) sanitizar/escapar cualquier dato de usuario antes de interpolarlo en HTML exportable. Las MEDIAS (directorio de usuarios sin filtrar, mensajes de error crudos, protección de rol basada solo en atributo `disabled`, dependencias con CVEs conocidas, entre otras) deben entrar al próximo sprint de seguridad. Las BAJAS no bloquean un release pero conviene resolverlas como limpieza técnica general, y varias de ellas (IDs predecibles, lint de seguridad desactivado) son exactamente el tipo de "detalle menor" que suele convertirse en la puerta de entrada de la siguiente vulnerabilidad si se deja acumular.

---

*Análisis generado mediante revisión estática manual (SAST) del código fuente del repositorio (segunda pasada ampliada a la totalidad de `src/`, configuración de build/lint y dependencias vía `npm audit`), correlacionado con búsquedas dirigidas por patrones de riesgo (control de acceso, manejo de secretos, sumideros de HTML/exportación, generación de identificadores).*
