const fs = require('fs');
const path = require('path');

const filePath = 'C:\\Users\\franc\\.gemini\\antigravity\\brain\\81a74828-032f-408d-9a2d-93d0ff463b87\\walkthrough.md';
let content = fs.readFileSync(filePath, 'utf8');

const targetText = `# Resolución de Ventana Duplicada / Flotante de Configuración de Cookies

Hemos resuelto un problema visual donde el cuadro/modal de configuración de cookies del menú de navegación superior (\`FaustNavbar\`) se renderizaba de forma visible e inline en el flujo de la página al cargar la landing page, dando la apariencia de una ventana duplicada flotando sobre el sitio.

## Cambios Realizados

1. **Añadido de Estilos CSS para el Dropdown de Cookies en el Navbar**:
   - Identificamos que el contenedor \`.nav-cookie-dropdown\` y el botón \`.nav-cookie-btn\` agregados recientemente en \`FaustNavbar\` carecían por completo de estilos CSS que los ocultaran y posicionaran correctamente de forma análoga al menú de idiomas.
   - Añadimos las reglas CSS detalladas para el selector de cookies en el navbar:
     - **Ocultamiento por defecto**: \`.nav-cookie-dropdown\` ahora tiene \`visibility: hidden; pointer-events: none; position: absolute;\` por defecto y se desplaza ligeramente en el eje Y (\`transform: translateY(-8px)\`).
     - **Micro-animación en hover**: El botón de cookies \`.nav-cookie-btn\` ahora se colapsa para mostrar sólo el ícono SVG por defecto, y al pasar el cursor (o cuando el menú está abierto) se expande mostrando el texto \*"Cookies"\* de forma fluida con una transición css premium.
     - **Visualización en click**: Al alternar la clase \`.is-open\` en la interacción, la propiedad \`visibility\` cambia a \`visible\`, \`pointer-events\` a \`auto\` y se desplaza a su posición final con un efecto premium y un desenfoque de fondo de vidrio esmerilado (\`backdrop-filter: blur(20px)\`), eliminando por completo su renderizado visible inicial al cargar la página.
     - **Responsividad**: Ocultamos el selector de cookies del navbar en pantallas de ancho $\\le 980px$ para evitar colisiones móviles, delegando la gestión al botón del pie de página.

## Plan de Verificación

### Verificación Manual
1. Cargue la landing page en su navegador.
2. Compruebe que al cargar la página **ya no hay ninguna ventana flotando o cuadro fuera de lugar** en la sección superior o en el cuerpo de la página.
3. En la versión de escritorio, verifique el botón de "Cookies" en el navbar:
   - Al entrar, sólo debe ser visible el ícono de la galleta (cookie) en formato esférico minimalista.
   - Al pasar el cursor sobre el botón, debe expandirse suavemente para mostrar la palabra \*"Cookies"\*.
   - Al hacer clic, debe desplegarse el menú flotante premium "Configuración de cookies" con sus toggles.
   - Al hacer clic fuera de él, debe cerrarse y volver a su estado oculto.`;

const replacementText = `# Eliminación del Botón de Cookies del Navbar

Hemos removido por completo el botón y menú de cookies de la barra de navegación superior (\`FaustNavbar\`) de modo que no interfiera visualmente con la navegación del usuario ni añada elementos innecesarios al encabezado del sitio. La configuración de cookies permanece de manera segura en el pie de página (\`FaustFooter\`).

## Cambios Realizados

1. **Remoción de FaustNavbar**:
   - Eliminamos el marcado HTML del selector de cookies (\`navCookieHtml\`), sus estilos CSS asociados y la inyección en el DOM de la barra de navegación.
   - Eliminamos los escuchadores de eventos y el control JS de interacción del botón de cookies en el navbar (\`navCookieBtn\`, \`navCookieDropdown\`).
   - Actualizamos el \`outsideClickListener\` y el comportamiento del botón de idioma (\`navLangBtn\`) para que no hagan referencia al selector de cookies.
   - Modificamos la sección 4 de la Política de Privacidad (\`privacy.html\`) para retirar la mención del menú de cookies en la barra de navegación superior, haciendo referencia únicamente al enlace de "Gestionar cookies" del pie de página.

## Plan de Verificación

### Verificación Manual
1. Cargue la landing page en su navegador.
2. Compruebe que la barra de navegación superior (\`FaustNavbar\`) contiene únicamente el logotipo de Faust Partners, los enlaces de navegación ("Estrategia", "Resultados", etc.), el selector de idioma (en caso de no ser LATAM), y el botón "Aplicar", **sin ningún botón o selector de cookies**.
3. Navegue a las páginas de privacidad (\`privacy.html\`) o de términos (\`terms.html\`):
   - Confirme que el menú de cookies tampoco se muestra en el navbar superior de estas páginas.
   - Compruebe que al desplazarse al final de la página y hacer clic en el enlace "Gestionar cookies" del pie de página (\`FaustFooter\`), el menú modal \`#cookie-menu-overlay\` se abre y cierra correctamente permitiendo guardar las preferencias analíticas.`;

// Replace content normalizing newlines
const normalizedContent = content.replace(/\r\n/g, '\n');
const normalizedTargetText = targetText.replace(/\r\n/g, '\n');

if (normalizedContent.includes(normalizedTargetText)) {
  const updatedContent = normalizedContent.replace(normalizedTargetText, replacementText);
  fs.writeFileSync(filePath, updatedContent, 'utf8');
  console.log("Successfully updated walkthrough.md");
} else {
  console.error("Target text not found in walkthrough.md!");
  // Try replacement by splitting into paragraphs to be more robust
  const firstHeader = "# Resolución de Ventana Duplicada / Flotante de Configuración de Cookies";
  const index = normalizedContent.indexOf(firstHeader);
  if (index !== -1) {
    const updatedContent = normalizedContent.substring(0, index) + replacementText;
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log("Successfully truncated and updated walkthrough.md from the header onwards.");
  } else {
    process.exit(1);
  }
}
