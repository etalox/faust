# faust

[![Deploy status](https://github.com/etalox/faust/actions/workflows/deploy.yml/badge.svg)](https://github.com/etalox/faust/actions/workflows/deploy.yml)

Descripción
-----------

Sitio estático minimal que sirve como demo del proyecto **faust**. Contiene una página principal `index.html` y activos estáticos en la raíz.

Demo en vivo
------------

Sitio (puede tardar unos minutos en propagarse): https://etalox.github.io/faust/

Uso local
---------

Clona el repo y abre `index.html` en tu navegador, o sirve el directorio con un servidor local:

```bash
git clone https://github.com/etalox/faust.git
cd faust
# servir con Python 3
python -m http.server 8000
# abrir http://localhost:8000
```

Nano Banana (miniaturas)
-------------------------

1. Abre el archivo `.env` de la raíz y pega la clave después de `GEMINI_API_KEY=`.
2. Genera una miniatura nueva:

```bash
node scripts/nano-banana.js --prompt "Miniatura editorial de alto contraste para un video sobre ..." --out assets/Thumbnails/Thumbnail_nueva.png
```

3. Para modificar una existente, añade una referencia:

```bash
node scripts/nano-banana.js --input assets/Thumbnails/Thumbnail_78294.png --prompt "Conserva la composición y crea una variante con ..." --out assets/Thumbnails/Thumbnail_variante.png
```

El comando actualiza automáticamente la galería de Brucolastic.

Despliegue
---------

Este repo incluye un workflow de GitHub Actions (`.github/workflows/deploy.yml`) que permite desplegar a GitHub Pages con un **clic** desde la pestaña **Actions → Deploy to GitHub Pages → Run workflow** y también se ejecuta automáticamente al hacer `git push` a `main`.

Si prefieres usar la rama `gh-pages` (ya existe en el repo), en **Settings → Pages** puedes seleccionar **Branch: gh-pages** como fuente.

Cómo actualizar el sitio:

- Haz cambios en `index.html` u otros archivos.
- `git add . && git commit -m "Actualiza sitio" && git push origin main` → el workflow desplegará automáticamente.

Contribuir
---------

PRs y sugerencias son bienvenidas. Abre un issue o envía un pull request.

Licencia
--------

MIT — si quieres otro tipo de licencia, dime y lo actualizo.

Contacto
--------

Repo: https://github.com/etalox/faust
