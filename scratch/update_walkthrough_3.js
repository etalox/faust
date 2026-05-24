const fs = require('fs');
const path = require('path');

const filePath = 'C:\\Users\\franc\\.gemini\\antigravity\\brain\\81a74828-032f-408d-9a2d-93d0ff463b87\\walkthrough.md';
let content = fs.readFileSync(filePath, 'utf8');

// Normalize newlines
const normalizedContent = content.replace(/\r\n/g, '\n');

// Update banner details
const targetHeader = "# Integración del Banner de Consentimiento de Cookies (Primer Ingreso)";
const index = normalizedContent.indexOf(targetHeader);

const newWalkthroughSection = `# Integración del Banner de Consentimiento de Cookies & Acuerdo Legal (Primer Ingreso)

Hemos integrado un banner de consentimiento de cookies responsivo, minimalista y con diseño esmerilado premium que aparece automáticamente al ingresar por primera vez a cualquier página del sitio web (a través de la inyección global desde \`components.js\`), el cual ahora incluye la aceptación explícita de los Términos de Servicio y la Política de Privacidad.

## Detalles del Diseño y Comportamiento

1. **Estética Premium**:
   - Diseñado con fondo de vidrio esmerilado translúcido (\`rgba(20, 21, 23, 0.85)\`), bordes sutiles y desenfoque por hardware (\`backdrop-filter: blur(20px)\`).
   - Se muestra mediante una suave animación de deslizamiento y fade-in desde la parte inferior de la pantalla (\`translateY\` y \`opacity\`).
   - El botón de acción está centrado, con forma de píldora, fondo blanco y tipografía seminegrilla, con efectos de hover que cambian su color al azul corporativo (\`#0022ff\`) e interactividad táctil/escala al hacer clic.

2. **Integración con Términos de Servicio y Política de Privacidad**:
   - Al texto explicativo de cookies analíticas se le añade una cláusula legal: *"Al hacer clic en Aceptar, aceptas nuestra Política de Privacidad y nuestros Términos y Condiciones."* (o su traducción correspondiente).
   - Las palabras **Política de Privacidad** y **Términos y Condiciones** son enlaces directos e interactivos que abren las páginas correspondientes (\`./privacy.html\` y \`./terms.html\`) en una pestaña nueva del navegador (\`target="_blank"\`).

3. **Detección Dinámica de Idiomas**:
   - Resuelve de manera inmediata la traducción del título, texto legal y botón a partir del idioma seleccionado en la sesión del visitante (soportando Español, Inglés, Portugués, Francés, Ruso y Chino) antes del renderizado, previniendo cualquier parpadeo de texto en otro idioma.

4. **Sin Opciones Secundarias**:
   - Únicamente incluye el botón **"Aceptar"**, sin opciones directas de rechazo o configuración manual dentro del propio banner para mantener un flujo de aceptación directa rápido y limpio.
   - El usuario que desee cambiar su configuración posteriormente puede seguir utilizando el enlace "Gestionar cookies" en el pie de página global.

5. **Persistencia e Inicialización de Scripts**:
   - El banner se muestra únicamente si la marca de consentimiento no existe en \`localStorage\` (\`faust-cookie-consent-analytics === null\`).
   - Al presionar "Aceptar", se almacena el consentimiento en \`localStorage\`, se remueve el banner con un efecto de desvanecimiento, y se ejecutan dinámicamente los scripts de Google Analytics y Clarity correspondientes al consentimiento otorgado.

---

# Depuración del Formulario "Aplicar" (Remoción de Texto Legal en Formulario)

Para evitar duplicidad en el flujo de consentimiento (ya que el banner principal del sitio recopila la aceptación legal de manera centralizada y global en el primer ingreso), removimos el texto redundante que decía: *"Al hacer click en Siguiente aceptas nuestros Términos y Condiciones de servicio y nuestra Política de Privacidad"* del Paso 1 del asistente de postulación en [index.html](file:///c:/Users/franc/Workspace/Faust%20Partners/index.html#L1521). Esto despeja visualmente la primera pantalla de postulación y optimiza la legibilidad del campo de cargo.

## Plan de Verificación

### Verificación Manual
1. Borre el almacenamiento local de su navegador (ej. ejecutando \`localStorage.clear()\` en la consola de herramientas de desarrollo).
2. Recargue cualquier página del sitio (ej. \`index.html\`, \`privacy.html\` o \`terms.html\`).
3. Compruebe que aparece el banner de consentimiento flotando suavemente en el borde inferior.
4. Verifique la presencia de los enlaces legales dentro del texto:
   - Deben verse los enlaces con estilo subrayado blanco.
   - Haga clic en ellos y verifique que abren las páginas de privacidad o términos en pestañas nuevas sin interferir con la navegación activa.
5. Haga clic en **"Aceptar"**:
   - El banner debe desaparecer y guardarse el estado de consentimiento.
6. Abra el modal de **"Aplicar"** en la página principal:
   - Verifique que la pantalla del Paso 1 (nombre) ya no contiene el texto de aceptación legal en la parte inferior, viéndose más limpia y alineada.
`;

if (index !== -1) {
  const updatedContent = normalizedContent.substring(0, index) + newWalkthroughSection;
  fs.writeFileSync(filePath, updatedContent, 'utf8');
  console.log("Successfully updated walkthrough.md");
} else {
  console.error("Target header not found in walkthrough.md!");
  process.exit(1);
}
