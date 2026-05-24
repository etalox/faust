const fs = require('fs');
const path = require('path');

const filePath = 'C:\\Users\\franc\\.gemini\\antigravity\\brain\\81a74828-032f-408d-9a2d-93d0ff463b87\\walkthrough.md';
let content = fs.readFileSync(filePath, 'utf8');

const normalizedContent = content.replace(/\r\n/g, '\n');
const targetHeader = "# Integración del Banner de Consentimiento de Cookies & Acuerdo Legal (Primer Ingreso)";
const index = normalizedContent.indexOf(targetHeader);

const newWalkthroughSection = `# Integración del Banner de Consentimiento de Cookies & Acuerdo Legal (Primer Ingreso)

Hemos integrado un banner de consentimiento de cookies responsivo, de vidrio esmerilado premium que aparece automáticamente al ingresar por primera vez a cualquier página del sitio web (a través de la inyección global desde \`components.js\`), el cual ahora incluye la aceptación explícita de los Términos de Servicio y la Política de Privacidad y el bloqueo de traducción automática.

## Detalles del Diseño y Comportamiento

1. **Estética Premium**:
   - Diseñado con fondo de vidrio esmerilado translúcido (\`rgba(20, 21, 23, 0.85)\`), bordes sutiles y desenfoque por hardware (\`backdrop-filter: blur(20px)\`).
   - Se muestra mediante una suave animación de deslizamiento y fade-in desde la parte inferior de la pantalla (\`translateY\` y \`opacity\`).
   - El botón de acción está centrado, con forma de píldora, fondo blanco y tipografía seminegrilla, con efectos de hover que cambian su color al azul corporativo (\`#0022ff\`) e interactividad táctil/escala al hacer clic.

2. **Integración con Términos de Servicio y Política de Privacidad**:
   - Al texto explicativo de cookies analíticas se le añade una cláusula legal: *"Al hacer clic en Aceptar, aceptas nuestra Política de Privacidad y nuestros Términos y Condiciones."* (o su traducción correspondiente).
   - Las palabras **Política de Privacidad** y **Términos y Condiciones** son enlaces directos e interactivos que abren las páginas correspondientes (\`./privacy.html\` y \`./terms.html\`) en una pestaña nueva del navegador (\`target="_blank"\`).

3. **Bloqueo de Google Translate**:
   - Para proteger nuestras traducciones manuales nativas altamente precisas (disponibles en Español, Inglés, Portugués, Francés, Ruso y Chino) y evitar que sean distorsionadas por los traductores automáticos de los navegadores, agregamos la clase \`notranslate\` y el atributo \`translate="no"\` al contenedor principal del banner.

4. **Botón de Cerrado Temporal y Persistencia**:
   - Para no forzar la aceptación inmediata y permitir una navegación libre y sin obstáculos, agregamos un botón de cierre con forma de "X" en la esquina superior derecha del banner.
   - **Comportamiento Temporal**: Hacer clic en el botón de cierre oculta y remueve el banner temporalmente de la vista de la página actual, pero **no** guarda el estado de cerrado ni de inhabilitado en la memoria persistente (\`localStorage\`). 
   - El banner se volverá a desplegar al ingresar a cualquier otra página o al recargar la actual mientras no se haya otorgado consentimiento explícito (es decir, mientras el valor de \`faust-cookie-consent-analytics\` en \`localStorage\` no sea \`true\`). Si el usuario configura las cookies como inhabilitadas en el footer, el banner se volverá a mostrar en el siguiente ingreso de página.

## Plan de Verificación

### Verificación Manual
1. Borre el almacenamiento local de su navegador (ej. ejecutando \`localStorage.clear()\` en la consola de herramientas de desarrollo).
2. Recargue cualquier página del sitio (ej. \`index.html\`, \`privacy.html\` o \`terms.html\`).
3. Compruebe que el banner de cookies aparece y muestra los enlaces legales.
4. Verifique la inhabilitación de traducción:
   - Traduzca la página usando Google Translate del navegador. Verifique que el banner de consentimiento **permanece inalterado en su traducción nativa**, sin cambios de Google.
5. Haga clic en la **"X"** en la esquina superior derecha del banner:
   - El banner debe cerrarse y removerse.
   - Compruebe que no se ha creado ninguna clave en \`localStorage\`.
6. Recargue la página o navegue a otra página:
   - El banner debe volver a desplegarse, demostrando el comportamiento de cerrado temporal.
7. Haga clic en **"Aceptar"**:
   - El banner debe removerse permanentemente y registrar la aceptación en \`localStorage\`.
`;

if (index !== -1) {
  const updatedContent = normalizedContent.substring(0, index) + newWalkthroughSection;
  fs.writeFileSync(filePath, updatedContent, 'utf8');
  console.log("Successfully updated walkthrough.md");
} else {
  console.error("Target header not found in walkthrough.md!");
  process.exit(1);
}
