// Legal content is loaded from each document's versioned text file.
const legalPdfModuleUrl = new URL('./legal-pdf.js?v=legal-pdf-hash-20261019', document.currentScript.src).href;
const legalArchiveModuleUrl = new URL('./legal-archive.js?v=legal-archive-20261020', document.currentScript.src).href;
const legalTextModuleUrl = new URL('./legal-text.js?v=legal-anchors-20261021', document.currentScript.src).href;
const legalRootUrl = new URL('../', document.currentScript.src);

// Compare numeric components so v1-10 comes after v1-9, regardless of index order.
function compareLegalVersionIds(left, right) {
  const leftParts = left.slice(1).split('-').map(BigInt);
  const rightParts = right.slice(1).split('-').map(BigInt);
  for (let i = 0; i < Math.max(leftParts.length, rightParts.length); i++) {
    const a = leftParts[i] ?? 0n;
    const b = rightParts[i] ?? 0n;
    if (a !== b) return a > b ? 1 : -1;
  }
  return left.localeCompare(right);
}

function normalizeLegalVersionId(value) {
  if (typeof value !== 'string') return null;
  const match = /^v(\d+(?:[.-]\d+)+)$/i.exec(value.trim());
  return match ? `v${match[1].replace(/\./g, '-')}` : null;
}

// A hash has only one fragment. The compact canonical form therefore keeps
// the version and optional target together: #v1.0/6.3.
function parseLegalFragment(hash) {
  const raw = hash.replace(/^#/, '');
  let decoded;
  try {
    decoded = decodeURIComponent(raw);
  } catch (error) {
    return { version: null, target: null };
  }
  const match = /^(v\d+(?:[.-]\d+)+)(?:\/(.+))?$/i.exec(decoded);
  if (match) return { version: normalizeLegalVersionId(match[1]), target: match[2] || null };
  return { version: null, target: decoded || null };
}

function versionFragment(id, target = null) {
  return `${id.replace(/-/g, '.')}${target ? `/${target}` : ''}`;
}

class FaustLegalDocument extends HTMLElement {
  connectedCallback() {
    // Protect document content individually so the explanatory notice can be translated.
    this.protectDocumentContents();
    this.languageChangeHandler ||= () => this.addTranslationNotice();
    window.addEventListener('faust-language-changed', this.languageChangeHandler);
    this.hashChangeHandler ||= () => {
      const { version } = parseLegalFragment(window.location.hash);
      if (version && version !== this.selectedVersion) this.loadText();
      else this.activateFragmentTarget();
    };
    window.addEventListener('hashchange', this.hashChangeHandler);
    const pageTitle = document.head.querySelector('title');
    if (pageTitle && !this.protectedPageTitle) {
      this.protectedPageTitle = {
        element: pageTitle,
        hadNotranslate: pageTitle.classList.contains('notranslate'),
        translate: pageTitle.getAttribute('translate')
      };
      pageTitle.classList.add('notranslate');
      pageTitle.setAttribute('translate', 'no');
    }
    if ((this.hasAttribute('src') || this.hasAttribute('versioned')) && !this.querySelector(':scope > header')) {
      this.loadText();
      return;
    }
    this.addTranslationNotice();
    this.addControls();
  }

  protectDocumentContents() {
    for (const child of this.children) {
      if (child.classList.contains('legal-document__translation-notice')) continue;
      child.classList.add('notranslate');
      child.setAttribute('translate', 'no');
    }
    // The initial shell is protected until the component is ready.
    this.classList.remove('notranslate');
    this.removeAttribute('translate');
  }

  addTranslationNotice() {
    const header = this.querySelector(':scope > header');
    const article = this.querySelector(':scope > article');
    const existing = this.querySelector(':scope > .legal-document__translation-notice');
    const isSpanish = typeof window.getSelectedCode === 'function' && typeof window.getTranslateCodeForSelection === 'function'
      ? window.getTranslateCodeForSelection(window.getSelectedCode()) === 'es'
      : (document.documentElement.lang || 'es').toLowerCase().split('-')[0] === 'es';
    if (isSpanish) {
      existing?.remove();
      return;
    }
    if (!header || !article || existing) return;
    const notice = document.createElement('p');
    notice.className = 'legal-document__translation-notice';
    notice.setAttribute('lang', 'es');
    notice.textContent = 'El contenido de esta página no se ha traducido para mantener precisión legal.';
    header.after(notice);
  }

  disconnectedCallback() {
    window.removeEventListener('faust-language-changed', this.languageChangeHandler);
    window.removeEventListener('hashchange', this.hashChangeHandler);
    window.removeEventListener('scroll', this.fragmentScrollHandler);
    window.removeEventListener('wheel', this.fragmentUserIntentHandler);
    window.removeEventListener('touchmove', this.fragmentUserIntentHandler);
    window.removeEventListener('pointerdown', this.fragmentUserIntentHandler);
    window.removeEventListener('keydown', this.fragmentKeyIntentHandler);
    window.removeEventListener('keydown', this.printShortcutHandler, true);
    if (this.pdfDownloadUrl) URL.revokeObjectURL(this.pdfDownloadUrl);
    if (this.archiveDownloadUrl) URL.revokeObjectURL(this.archiveDownloadUrl);
    if (this.hashOutsideHandler) document.removeEventListener('click', this.hashOutsideHandler);
    if (this.hashEscapeHandler) document.removeEventListener('keydown', this.hashEscapeHandler);
    if (!this.protectedPageTitle) return;
    const { element, hadNotranslate, translate } = this.protectedPageTitle;
    if (!hadNotranslate) element.classList.remove('notranslate');
    if (translate === null) element.removeAttribute('translate');
    else element.setAttribute('translate', translate);
    this.protectedPageTitle = null;
  }

  completePageLoading() {
    if (!this.hasAttribute('versioned')) return;
    document.body.classList.remove('legal-page-loading');
    document.body.classList.add('is-ready');
    const overlay = document.querySelector('.page-fade-overlay');
    overlay?.style.removeProperty('opacity');
    overlay?.style.removeProperty('pointer-events');
    overlay?.style.removeProperty('transition');
    overlay?.style.removeProperty('z-index');
    document.dispatchEvent(new Event('faust-legal-document-ready'));
  }

  activateFragmentTarget() {
    const { target: id } = parseLegalFragment(window.location.hash);
    if (!id) return;
    const target = document.getElementById(id);
    if (!target || !this.contains(target)) return;
    this.clearFragmentTarget();
    target.classList.add('legal-document__anchor-target');
    target.setAttribute('tabindex', '-1');
    target.dataset.legalFragmentFocus = '';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      target.scrollIntoView({ block: 'center' });
      target.focus({ preventScroll: true });
      requestAnimationFrame(() => {
        this.fragmentScrollTarget = target;
        this.fragmentScrollEnabled = true;
        this.fragmentUserScrollIntent = false;
        this.fragmentScrollSettlingUntil = performance.now() + 450;
      });
    }));
  }

  clearFragmentTarget() {
    this.fragmentScrollEnabled = false;
    this.fragmentUserScrollIntent = false;
    this.fragmentScrollTarget = null;
    this.fragmentScrollSettlingUntil = 0;
    this.querySelectorAll('.legal-document__anchor-target').forEach(element => {
      element.classList.remove('legal-document__anchor-target');
      if (element.dataset.legalFragmentFocus !== undefined) {
        element.removeAttribute('data-legal-fragment-focus');
        element.removeAttribute('tabindex');
      }
      if (document.activeElement === element) element.blur();
    });
  }

  observeFragmentScroll() {
    this.fragmentScrollHandler ||= () => {
      if (!this.fragmentScrollEnabled || !this.fragmentUserScrollIntent || !this.fragmentScrollTarget) return;
      if (performance.now() < this.fragmentScrollSettlingUntil) {
        return;
      }
      const bounds = this.fragmentScrollTarget.getBoundingClientRect();
      const upperBound = window.innerHeight * .25;
      const lowerBound = window.innerHeight * .75;
      const isEntirelyAboveFocusArea = bounds.bottom <= upperBound;
      const isEntirelyBelowFocusArea = bounds.top >= lowerBound;
      if (isEntirelyAboveFocusArea || isEntirelyBelowFocusArea) this.clearFragmentTarget();
    };
    this.fragmentUserIntentHandler ||= () => { this.fragmentUserScrollIntent = true; };
    this.fragmentKeyIntentHandler ||= event => {
      if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) {
        this.fragmentUserScrollIntent = true;
      }
    };
    window.addEventListener('scroll', this.fragmentScrollHandler, { passive: true });
    window.addEventListener('wheel', this.fragmentUserIntentHandler, { passive: true });
    window.addEventListener('touchmove', this.fragmentUserIntentHandler, { passive: true });
    window.addEventListener('pointerdown', this.fragmentUserIntentHandler, { passive: true });
    window.addEventListener('keydown', this.fragmentKeyIntentHandler);
  }

  revealHeader() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const header = this.querySelector(':scope > header');
    if (!header) return;
    const elements = [
      header.querySelector('h1'),
      header.querySelector('.legal-document__metadata'),
      header.querySelector('.legal-document__actions')
    ].filter(Boolean);
    elements.forEach((element, index) => {
      element.classList.add('legal-document__intro-item');
      element.style.transitionDelay = (index === 0 ? 0 : index * 160) + 'ms';
    });
    requestAnimationFrame(() => requestAnimationFrame(() => {
      elements.forEach(element => element.classList.add('is-visible'));
    }));
  }

  async loadText() {
    if (this.loadingText) return;
    this.loadingText = true;
    this.setAttribute('aria-busy', 'true');
    if (this.hasAttribute('versioned')) document.title = '';
    try {
      let source = this.getAttribute('src');
      let selectedVersion = null;
      if (this.hasAttribute('versioned')) {
        const pageUrl = new URL(window.location.href);
        const slug = document.documentElement.dataset.legalDocument;
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(slug || '')) {
          throw new Error('No se indicó un identificador válido para el documento.');
        }
        const folder = new URL('./' + slug + '/', legalRootUrl);
        const indexResponse = await fetch(new URL('versiones.json', folder), { cache: 'no-cache' });
        if (!indexResponse.ok) throw new Error('No se pudo cargar la lista de versiones.');
        const index = await indexResponse.json();
        const validId = id => typeof id === 'string' && /^v\d+(?:-\d+)+$/.test(id);
        if (!index || !Array.isArray(index.versiones) || !index.versiones.length ||
            !index.versiones.every(validId) || new Set(index.versiones).size !== index.versiones.length) {
          throw new Error('La lista de versiones no es válida.');
        }
        const requestedVersions = pageUrl.searchParams.getAll('version');
        if (requestedVersions.length > 1) throw new Error('Se indicó más de una versión.');
        const queryVersion = requestedVersions.length ? normalizeLegalVersionId(requestedVersions[0]) : null;
        const fragmentVersion = parseLegalFragment(pageUrl.hash).version;
        if (requestedVersions.length && !queryVersion) throw new Error('La versión solicitada no es válida.');
        if (queryVersion && fragmentVersion && queryVersion !== fragmentVersion) {
          throw new Error('La versión solicitada es contradictoria.');
        }
        const latestVersion = index.versiones.reduce((latest, id) =>
          compareLegalVersionIds(id, latest) > 0 ? id : latest
        );
        selectedVersion = queryVersion || fragmentVersion || latestVersion;
        if (!index.versiones.includes(selectedVersion)) throw new Error('La versión solicitada no está disponible.');
        source = new URL(selectedVersion + '.txt', folder).href;
        this.availableVersions = index.versiones;
        this.selectedVersion = selectedVersion;
        this.setAttribute('pdf-name', slug + '-' + selectedVersion + '.pdf');
      }
      if (!source) throw new Error('No se indicó el archivo de texto del documento.');
      const [response, { parseLegalText }] = await Promise.all([
        fetch(source, { cache: 'no-cache' }),
        import(legalTextModuleUrl)
      ]);
      if (!response.ok) throw new Error('No se pudo cargar el archivo de texto.');
      const sourceBytes = await response.arrayBuffer();
      const parsed = parseLegalText(new TextDecoder().decode(sourceBytes), {
        groupIntro: this.hasAttribute('group-intro')
      });
      if (selectedVersion && parsed.version.toLowerCase().replace(/\./g, '-') !== selectedVersion) {
        throw new Error('La versión del archivo no coincide con la versión solicitada.');
      }
      let sourceHash = null;
      try {
        if (!window.crypto?.subtle) throw new Error('SHA-256 no está disponible en este contexto.');
        const digest = await window.crypto.subtle.digest('SHA-256', sourceBytes);
        sourceHash = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
      } catch (error) {
        console.error('No se pudo calcular el hash del archivo legal:', error);
      }
      if (!this.isConnected) return;
      const titleElement = parsed.header.querySelector('h1').cloneNode(true);
      titleElement.querySelectorAll('br').forEach(br => br.replaceWith(' '));
      const title = titleElement.textContent.replace(/\s+/g, ' ').trim();
      const versions = this.querySelector(':scope > template[data-legal-versions]');
      this.replaceChildren(parsed.header, parsed.article, ...(versions ? [versions] : []));
      const version = parsed.header.querySelector('.legal-document__metadata-version');
      const versionLabel = this.getAttribute('version-label');
      if (versionLabel !== null && version) version.textContent = versionLabel;
      if (this.hasAttribute('hide-marco')) {
        const marco = parsed.header.querySelector('.legal-document__metadata-marco');
        marco?.nextSibling?.remove();
        marco?.remove();
      }
      if (this.hasAttribute('date-first')) {
        const meta = parsed.header.querySelector('.legal-document__metadata');
        const date = meta?.querySelector('.legal-document__metadata-date');
        const brand = meta?.querySelector('.legal-document__metadata-brand');
        if (meta && version && date && brand) {
          meta.replaceChildren(
            date,
            document.createTextNode(' | '),
            version,
            document.createTextNode(' | '),
            brand
          );
        }
      }
      if (this.hasAttribute('hide-version')) {
        version?.nextSibling?.remove();
        version?.remove();
      }
      this.protectDocumentContents();
      this.addTranslationNotice();
      this.setAttribute('version', parsed.version.replace(/^V/, 'v'));
      if (this.hasAttribute('versioned')) {
        document.title = 'Faust Partners™ | ' + title;
      }
      this.addControls();
      this.revealHeader();
      this.completePageLoading();
      this.observeFragmentScroll();
      this.activateFragmentTarget();
      const snapshot = this.cloneNode(true);
      this.preparePdf = async () => {
        this.updatePdfHash?.(null, true);
        const { createLegalPdf } = await import(legalPdfModuleUrl);
        const pdfBytes = await createLegalPdf(snapshot, { fileId: sourceHash?.slice(0, 32), emission: parsed.emission });
        let pdfHash = null;
        try {
          if (!window.crypto?.subtle) throw new Error('SHA-256 no está disponible en este contexto.');
          const digest = await window.crypto.subtle.digest('SHA-256', pdfBytes);
          pdfHash = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
        } catch (error) {
          console.error('No se pudo calcular el hash del PDF legal:', error);
        }
        this.updatePdfHash?.(pdfHash, false);
        return new Blob([pdfBytes], { type: 'application/pdf' });
      };
      this.pdfDataPromise = this.preparePdf();
      this.pdfDataPromise.then(pdfBlob => this.setPdfDownload?.(pdfBlob)).catch(error => {
        this.updatePdfHash?.(null, false);
        console.error('No se pudo generar el PDF legal:', error);
      });
      this.archiveDataPromise = this.pdfDataPromise.then(async pdfBlob => {
        if (!this.pdfHash) throw new Error('No fue posible calcular el SHA-256 del PDF.');
        const { createLegalArchive } = await import(legalArchiveModuleUrl);
        return createLegalArchive(pdfBlob, this.getAttribute('pdf-name'), this.pdfHash);
      });
      this.archiveDataPromise.then(archiveBlob => this.setArchiveDownload?.(archiveBlob)).catch(error => {
        console.error('No fue posible preparar el archivo de verificación:', error);
      });
      window.faustInitResponsiveBreaks?.();
    } catch (error) {
      console.error('No se pudo cargar el documento legal:', error);
      if (this.isConnected) {
        if (this.hasAttribute('versioned')) document.title = 'Faust Partners™ | No se pudo cargar el documento';
        const notice = document.createElement('p');
        notice.className = 'legal-document__notice';
        notice.classList.add('notranslate');
        notice.setAttribute('translate', 'no');
        notice.setAttribute('role', 'alert');
        notice.textContent = 'No fue posible cargar el documento. Recarga la página para intentarlo de nuevo.';
        this.replaceChildren(notice);
        this.completePageLoading();
      }
    } finally {
      this.loadingText = false;
      this.removeAttribute('aria-busy');
    }
  }

  addControls() {
    if (!this.hasAttribute('controls')) return;
    const header = this.querySelector(':scope > header');
    if (!header || header.querySelector('.legal-document__actions')) return;

    const version = this.getAttribute('version');
    const pdfName = this.getAttribute('pdf-name');
    if (!version && !pdfName) return;

    const actions = document.createElement('div');
    actions.className = 'legal-document__actions';

    if (version) {
      const versions = document.createElement('details');
      versions.className = 'legal-document__versions';
      const summary = document.createElement('summary');
      summary.className = 'btn btn-secondary legal-document__version';
      const label = document.createElement('span');
      label.textContent = version + ' - Última versión';
      summary.append(label);
      summary.insertAdjacentHTML('beforeend', '<svg width="14" height="8" viewBox="0 0 14 8" fill="none" aria-hidden="true"><path d="M11.6912.2363 6.6025 4.88 1.5139.2363C1.1614-.0854.6195-.0778.2762.2538c-.3682.3555-.3682.9455 0 1.301l5.6317 5.4384c.3875.3743 1.0018.3743 1.3893 0l5.6317-5.4384c.3682-.3555.3682-.9455 0-1.301-.3433-.3315-.8852-.3392-1.2377-.0175Z" fill="currentColor"/></svg>');

      const menu = document.createElement('div');
      menu.className = 'legal-document__version-menu';
      // Optional: provide links inside <template data-legal-versions> when
      // the document has more than one published version.
      const otherVersions = this.querySelector(':scope > template[data-legal-versions]');
      if (this.availableVersions) {
        for (const id of this.availableVersions) {
          const label = id.replace(/-/g, '.');
          if (id === this.selectedVersion) {
            const current = document.createElement('span');
            current.textContent = label;
            current.setAttribute('aria-current', 'page');
            menu.append(current);
          } else {
            const link = document.createElement('a');
            const url = new URL(window.location.href);
            const { target } = parseLegalFragment(url.hash);
            url.searchParams.delete('version');
            url.hash = versionFragment(id, target);
            link.href = url.href;
            link.textContent = label;
            // Switching a fragment version is handled by hashchange above.
            link.addEventListener('click', event => event.stopPropagation());
            menu.append(link);
          }
        }
      } else if (otherVersions) {
        menu.append(otherVersions.content.cloneNode(true));
      } else {
        const current = document.createElement('span');
        current.textContent = version;
        current.setAttribute('aria-current', 'page');
        menu.append(current);
      }
      summary.addEventListener('click', event => {
        if (!versions.open || menu.classList.contains('is-closing')) {
          if (menu.classList.contains('is-closing')) event.preventDefault();
          return;
        }
        event.preventDefault();
        menu.classList.add('is-closing');
        const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 110;
        window.setTimeout(() => {
          versions.open = false;
          menu.classList.remove('is-closing');
        }, delay);
      });
      versions.append(summary, menu);
      actions.append(versions);
    }

    if (pdfName) {
      // The hash is packaged alongside the PDF; retain it in memory solely
      // to build that verification file, without exposing a separate control.
      this.updatePdfHash = value => { this.pdfHash = value; };

      const download = document.createElement('a');
      download.setAttribute('role', 'button');
      download.className = 'btn btn-primary legal-document__download';
      // The global press-delay is intentionally bypassed here: a native link
      // needs the original user gesture to start a direct download.
      download.dataset.pressDelay = 'off';
      download.setAttribute('aria-disabled', 'true');
      download.tabIndex = -1;
      const label = document.createElement('span');
      label.className = 'legal-document__download-label';
      label.textContent = 'Descargar';
      download.append(label);
      download.addEventListener('click', async event => {
        // Once prepared, this is a native download link. Keeping the direct
        // click preserves browser user activation and avoids a save-as flow.
        if (!download.hasAttribute('aria-disabled')) return;
        event.preventDefault();
        download.setAttribute('aria-disabled', 'true');
        download.setAttribute('aria-busy', 'true');
        download.setAttribute('aria-label', 'Generando PDF…');
        const indicator = document.createElement('span');
        indicator.className = 'legal-document__download-indicator';
        indicator.setAttribute('aria-hidden', 'true');
        const icon = document.createElement('span');
        icon.className = 'legal-document__loading-icon';
        indicator.append(icon);
        download.append(indicator);
        try {
          let archiveBlob;
          try {
            archiveBlob = await this.archiveDataPromise;
          } catch (error) {
            this.pdfDataPromise = this.preparePdf();
            this.archiveDataPromise = this.pdfDataPromise.then(async pdfBlob => {
              if (!this.pdfHash) throw new Error('No fue posible calcular el SHA-256 del PDF.');
              const { createLegalArchive } = await import(legalArchiveModuleUrl);
              return createLegalArchive(pdfBlob, this.getAttribute('pdf-name'), this.pdfHash);
            });
            archiveBlob = await this.archiveDataPromise;
          }
          this.setArchiveDownload?.(archiveBlob);
          download.click();
        } catch (error) {
          this.updatePdfHash?.(null, false);
          console.error('No se pudo generar el PDF:', error);
          window.alert('No fue posible generar el PDF. Por favor, inténtalo de nuevo.');
        } finally {
          indicator.remove();
          download.removeAttribute('aria-busy');
          download.removeAttribute('aria-label');
        }
      });
      this.setPdfDownload = pdfBlob => {
        if (this.pdfDownloadUrl) URL.revokeObjectURL(this.pdfDownloadUrl);
        this.pdfDownloadUrl = URL.createObjectURL(pdfBlob);
      };
      this.setArchiveDownload = archiveBlob => {
        if (this.archiveDownloadUrl) URL.revokeObjectURL(this.archiveDownloadUrl);
        this.archiveDownloadUrl = URL.createObjectURL(archiveBlob);
        download.href = this.archiveDownloadUrl;
        download.download = pdfName.replace(/\.pdf$/i, '') + '.zip';
        download.removeAttribute('aria-disabled');
        download.removeAttribute('tabindex');
      };
      // Deliver the pre-generated PDF instead of opening the browser print UI.
      this.printShortcutHandler = event => {
        const isPrintShortcut = (event.ctrlKey || event.metaKey) && !event.altKey && !event.shiftKey &&
          (event.key === 'p' || event.key === 'P');
        if (!isPrintShortcut || event.repeat) return;
        const target = event.target;
        if (target instanceof Element && target.closest('input, textarea, select, [contenteditable="true"]')) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        if (this.pdfDownloadUrl) {
          const pdfDownload = document.createElement('a');
          pdfDownload.href = this.pdfDownloadUrl;
          pdfDownload.download = pdfName;
          pdfDownload.click();
        } else {
          download.click();
        }
      };
      window.addEventListener('keydown', this.printShortcutHandler, true);
      actions.append(download);
    }

    header.append(actions);
  }
}

customElements.define('faust-legal-document', FaustLegalDocument);
