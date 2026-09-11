# Revisión de Seguridad (SAST) — SGI Enterprise / HSEQ APP

**Alcance:** análisis estático manual del código fuente en `src/` del repositorio, enfocado en autenticación/autorización, manejo de credenciales, generación de HTML/exportables y almacenamiento en cliente.
**Metodología:** revisión línea por línea de los módulos de autenticación (`AuthContext`, `App.jsx`), servicios externos (`supabase.js`, `oneDriveService.js`) y utilidades de exportación (`exportUtils.js`), correlacionada con búsquedas dirigidas (`document.write`, `localStorage`, `dangerouslySetInnerHTML`, rutas protegidas por rol).

---

### 🔴 ALTAS

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

* **Auto-asignación de rol "Administrador General" por correo hardcodeado (Authentication/Authorization Bypass)**
  - **Archivo y Línea:** `src/context/AuthContext.jsx:34, 57, 164-165`
  - **Descripción breve:** El código concede el rol `Administrador General` automáticamente a cualquier sesión cuyo email (normalizado) coincida con una dirección de correo personal específica hardcodeada en el bundle (ver `isJairo` en `getProfileAndSetUser` y en `signUp`). Esta lógica de autorización vive en el JavaScript del cliente, visible para cualquiera que inspeccione el código fuente.
  - **Impacto:** Un atacante que logre registrar o tomar control de esa cuenta de correo específica en el proveedor de autenticación obtiene privilegios de administrador total automáticamente. Además, exponer la regla de negocio ("quién es el admin") en el frontend facilita que cualquiera localice ese correo en el propio código fuente e intente atacarlo puntualmente (phishing, password spraying, recuperación de cuenta), sabiendo que garantiza control total del sistema. *(Por tratarse de una dirección de correo personal real, se omite deliberadamente de este informe público; el equipo puede ubicarla en el archivo/línea indicados.)*
  - **Remediación:** Eliminar el hardcode de correo del cliente. Definir el rol de administrador exclusivamente en el backend (columna `role` en `profiles`, gestionada por un admin existente o por una migración inicial `seed`), nunca inferido desde el email en tiempo de ejecución del navegador:
    ```js
    // Eliminar por completo esta comparación de email hardcodeado en el cliente.
    // El rol debe venir únicamente de data.role (columna en Supabase, protegida por RLS),
    // nunca de una comparación de string contra un correo específico en el bundle.
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

---

## Resumen Ejecutivo

| Severidad | Cantidad |
|---|---|
| 🔴 Altas | 3 |
| 🟡 Medias | 4 |
| 🟢 Bajas | 3 |
| **Total** | **10** |

**Recomendación general:** el riesgo más urgente de este repositorio es que **la autorización (quién es admin, quién puede cambiar roles) se decide en el navegador**, no en el servidor — las tres vulnerabilidades ALTAS son variaciones del mismo problema raíz (control de acceso no verificado / *broken access control*, OWASP A01:2021). Antes de cualquier otro esfuerzo de hardening, el equipo debe: (1) auditar y reforzar las políticas RLS de Supabase para que repliquen server-side cada regla de autorización hoy solo presente en React, (2) eliminar el correo de administrador hardcodeado del bundle del cliente, y (3) sanitizar/escapar cualquier dato de usuario antes de interpolarlo en HTML exportable. Las MEDIAS (tokens en `localStorage`, fallback silencioso de configuración, inyección de fórmulas, ausencia de rate-limiting explícito) deben planificarse para el próximo sprint de seguridad. Las BAJAS no bloquean un release pero conviene resolverlas como parte de la limpieza técnica general.

---

*Análisis generado mediante revisión estática manual (SAST) del código fuente del repositorio, correlacionado con búsquedas dirigidas por patrones de riesgo (control de acceso, manejo de secretos, sumideros de HTML/exportación).*
