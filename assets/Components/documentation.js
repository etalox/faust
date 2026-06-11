(function() {
  const assetsManifest = {
    'canvas_1.svg': '../assets/Canvas/Canvas_1.svg',
    'canvas_2.svg': '../assets/Canvas/Canvas_2.svg',
    'hero.mp4': '../assets/Hero.mp4',
    'cubenew.svg': '../assets/Icons/Cubenew.svg',
    'databasenew.svg': '../assets/Icons/Databasenew.svg',
    'globe.svg': '../assets/Icons/Globe.svg',
    'left_arrow.svg': '../assets/Icons/Left_Arrow.svg',
    'right_arrow.svg': '../assets/Icons/Right_Arrow.svg',
    'svg100.svg': '../assets/Icons/SVG100.svg',
    'svg101.svg': '../assets/Icons/SVG101.svg',
    'svg102.svg': '../assets/Icons/SVG102.svg',
    'svg1new.svg': '../assets/Icons/SVG1new.svg',
    'svg2new.svg': '../assets/Icons/SVG2new.svg',
    'svg3new.svg': '../assets/Icons/SVG3new.svg',
    'usersnew.svg': '../assets/Icons/Usersnew.svg',
    'bg_line.svg': '../assets/Icons/bg_line.svg',
    'button_arrow.svg': '../assets/Icons/button_arrow.svg',
    'check.svg': '../assets/Icons/check.svg',
    'cross.svg': '../assets/Icons/cross.svg',
    'dash.svg': '../assets/Icons/dash.svg',
    'divider.svg': '../assets/Icons/divider.svg',
    'open.svg': '../assets/Icons/open.svg',
    'plus.svg': '../assets/Icons/plus.svg',
    'tab_icon.png': '../assets/Icons/tab_icon.png',
    'faust logo.svg': '../assets/Logotypes/Faust Logo.svg',
    'finsus.svg': '../assets/Logotypes/finsus.svg',
    'herdez.svg': '../assets/Logotypes/herdez.svg',
    'mc.svg': '../assets/Logotypes/mc.svg',
    'earth.glb': '../assets/earth.glb',
    'fibonacci_sphere.glb': '../assets/fibonacci_sphere.glb',
    '3dsvg.glb': '../assets/Logotypes/3dsvg.glb'
  };

  function resolveAssetPath(filename) {
    const key = filename.toLowerCase().trim();
    if (assetsManifest[key]) {
      return assetsManifest[key];
    }
    return '../assets/' + filename;
  }

  class FaustDocumentation extends HTMLElement {
    connectedCallback() {
      this.style.display = 'contents';
      
      const page = this.getAttribute('page') || 'introduccion';
      
      this.innerHTML = `
        <div class="wrap">
          <!-- Título de la Guía Activa (Estilo Editorial Premium) -->
          <div id="doc-title-container">
            <div class="pill reveal-item">/ Documentación</div>
            <h1 class="doc-title reveal-item">Cargando Documentación...</h1>
            <div class="doc-subtitle reveal-item">Cargando descripción...</div>
          </div>
          
          <div class="doc-split-container">
            <!-- Columna Izquierda: Menú de Documentos y Capítulos (TOC) -->
            <div class="doc-sidebar">
              <h3>Documentación</h3>
              <ul class="doc-menu" id="doc-menu">
                <li class="doc-menu-item"><span style="color: rgba(255,255,255,0.4); font-size: 14px; padding-left: 16px;">Cargando documentos...</span></li>
              </ul>
            </div>
            
            <!-- Columna Derecha: Contenido Principal -->
            <div class="doc-body-content" id="doc-content">
              <p class="doc-paragraph reveal-item">Por favor, espera mientras se recupera el contenido dinámico.</p>
            </div>
          </div>
        </div>
      `;

      this.init(page);
    }

    init(currentPage) {
      const self = this;
      const menuContainer = this.querySelector('#doc-menu');
      const contentContainer = this.querySelector('#doc-content');
      const titleContainer = this.querySelector('#doc-title-container');

      if (!menuContainer || !contentContainer || !titleContainer) return;

      let docsList = [];
      let chapters = [];
      let scrollListener = null;
      let scrollSpeedListener = null;
      let revealObserver = null;
      let hideObserver = null;
      let scrollTimeout = null;

      // Helper to generate slugs
      function generateSlug(text) {
        return text
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9\s-]/g, '')
          .trim()
          .replace(/\s+/g, '-');
      }

      function escapeHtml(str) {
        return str
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;');
      }

      // 1. Cargar el índice de guías (docs.txt)
      fetch('./docs.txt')
        .then(function(res) {
          if (!res.ok) throw new Error('No se pudo cargar el índice de documentos');
          return res.text();
        })
        .then(function(text) {
          var lines = text.split('\n');
          docsList = [];
          lines.forEach(function(line) {
            var trimmed = line.trim();
            if (!trimmed || trimmed.indexOf('#') === 0) return;
            
            var pipeIdx = trimmed.indexOf('|');
            if (pipeIdx === -1) return;
            
            var key = trimmed.substring(0, pipeIdx).trim();
            var title = trimmed.substring(pipeIdx + 1).trim();
            docsList.push({ key: key, title: title });
          });
          
          loadActiveDocument();
        })
        .catch(function(err) {
          console.error('Error al cargar docs.txt:', err);
          menuContainer.innerHTML = '<li class="doc-menu-item"><span style="color: #ff4a4a; font-size: 14px; padding-left: 16px;">Error al cargar índice de guías.</span></li>';
          document.body.classList.add('is-ready');
        });

      // 2. Cargar el contenido específico de la página activa
      function loadActiveDocument() {
        if (window.location.protocol === 'file:') {
          titleContainer.innerHTML = 
            '<div class="pill reveal-item">/ Documentación</div>' +
            '<h1 class="doc-title reveal-item">Error de Protocolo</h1>' +
            '<div class="doc-subtitle reveal-item">Protocolo Local Detectado</div>';
          contentContainer.innerHTML = 
            '<p class="doc-paragraph reveal-item">La carga dinámica de documentación requiere ser ejecutada a través de un servidor HTTP local (ej. <code>python -m http.server</code>). Por favor, ejecuta la plataforma mediante un servidor web local para visualizar el contenido dinámico.</p>';
          renderSidebarMenu();
          setupRevealSystem();
          document.body.classList.add('is-ready');
        } else {
          fetch('./' + currentPage + '.txt')
            .then(function(res) {
              if (!res.ok) {
                if (res.status === 404) {
                  throw new Error('Documento no encontrado: ' + currentPage);
                }
                throw new Error('Error al cargar documento');
              }
              return res.text();
            })
            .then(function(text) {
              chapters = [];
              var parsedHtml = parseDocTextAndExtractChapters(text);
              contentContainer.innerHTML = parsedHtml;
              
              renderSidebarMenu();
              setupScrollSpy();
              setupRevealSystem();
              document.body.classList.add('is-ready');
            })
            .catch(function(err) {
              console.error(err);
              titleContainer.innerHTML = 
                '<div class="pill reveal-item">/ Documentación</div>' +
                '<h1 class="doc-title reveal-item">Documento No Encontrado</h1>' +
                '<div class="doc-subtitle reveal-item">Guía Inexistente</div>';
              contentContainer.innerHTML = 
                '<p class="doc-paragraph reveal-item">El documento solicitado no existe o no se pudo cargar. Por favor, selecciona una guía válida en el menú lateral.</p>';
              renderSidebarMenu();
              setupRevealSystem();
              document.body.classList.add('is-ready');
            });
        }
      }

      // Parser
      function parseDocTextAndExtractChapters(text) {
        var lines = text.split('\n');
        var html = '';
        var titleText = '';
        var subtitleText = '';
        var firstParagraphExtracted = false;
        var inList = false;
        var isFirstLine = true;
        
        function isQuoted(str) {
          if (str.length < 2) return false;
          var startChars = ['"', "'", '“', '‘', '«'];
          var endChars = ['"', "'", '”', '’', '»'];
          var first = str.charAt(0);
          var last = str.charAt(str.length - 1);
          var startIdx = startChars.indexOf(first);
          if (startIdx !== -1) {
            return endChars.indexOf(last) !== -1;
          }
          return false;
        }
        
        for (var i = 0; i < lines.length; i++) {
          var line = lines[i].trim();
          if (!line || line.indexOf('#') === 0) continue;
          
          // First non-empty line is H1 (Title)
          if (isFirstLine) {
            titleText = line;
            isFirstLine = false;
            continue;
          }
          
          // Check for List Item
          if (line.indexOf('-') === 0) {
            if (!inList) {
              html += '<ul class="doc-list reveal-item">';
              inList = true;
            }
            var content = line.substring(1).trim();
            html += '<li>' + escapeHtml(content) + '</li>';
            continue;
          }
          
          // If we were in a list but this line is not a list item, close the list
          if (inList) {
            html += '</ul>';
            inList = false;
          }
          
          // Check for asset tag: [filename.ext]
          var fileMatch = line.match(/^\[(.*?\.(jpg|jpeg|png|gif|svg|webp|mp4|webm|ogg|pdf|zip|glb))\]$/i);
          if (fileMatch) {
            var filename = fileMatch[1].trim();
            var resolvedPath = resolveAssetPath(filename);
            var ext = filename.split('.').pop().toLowerCase();
            
            if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].indexOf(ext) !== -1) {
              html += '<div class="doc-media-container reveal-item"><img src="' + resolvedPath + '" alt="' + escapeHtml(filename) + '" class="doc-media" /></div>';
            } else if (['mp4', 'webm', 'ogg'].indexOf(ext) !== -1) {
              html += '<div class="doc-media-container reveal-item"><video src="' + resolvedPath + '" controls class="doc-media"></video></div>';
            } else {
              html += '<a href="' + resolvedPath + '" target="_blank" class="doc-file-link reveal-item">' +
                      '<span class="doc-file-icon"></span>' +
                      '<span class="doc-file-name">Visualizar ' + escapeHtml(filename) + '</span>' +
                      '</a>';
            }
            continue;
          }
          
          // Check for quote (Cuerpo / Paragraph)
          if (isQuoted(line)) {
            var content = line.substring(1, line.length - 1).trim();
            if (!firstParagraphExtracted && titleText) {
              subtitleText = content;
              firstParagraphExtracted = true;
            } else {
              html += '<p class="doc-paragraph reveal-item">' + escapeHtml(content) + '</p>';
            }
            continue;
          }
          
          // Otherwise, H2 (Subheader)
          var slug = generateSlug(line);
          chapters.push({ id: slug, title: line });
          html += '<h2 id="' + slug + '" class="doc-section-title reveal-item">' + escapeHtml(line) + '</h2>';
        }
        
        if (inList) {
          html += '</ul>';
        }

        if (titleContainer) {
          var activeTitle = titleText || 'Documentación';
          var activeSubtitle = subtitleText || 'Guías operativas y metodológicas de Faust Partners.';
          titleContainer.innerHTML = 
            '<div class="pill reveal-item">/ Documentación</div>' +
            '<h1 class="doc-title reveal-item">' + escapeHtml(activeTitle) + '</h1>' +
            '<div class="doc-subtitle reveal-item">' + escapeHtml(activeSubtitle) + '</div>';
        }

        return html;
      }

      // Sidebar Menu Builder
      function renderSidebarMenu() {
        menuContainer.innerHTML = '';
        if (docsList.length === 0) {
          menuContainer.innerHTML = '<li class="doc-menu-item"><span style="color: rgba(255,255,255,0.3); font-size: 14px; padding-left: 16px;">Sin documentos</span></li>';
          return;
        }

        docsList.forEach(function(doc) {
          var li = document.createElement('li');
          li.className = 'doc-menu-item' + (doc.key === currentPage ? ' is-active' : '');
          
          var a = document.createElement('a');
          a.href = doc.key + '.html';
          a.textContent = doc.title;
          a.className = 'doc-menu-link';
          li.appendChild(a);

          if (doc.key === currentPage && chapters.length > 0) {
            var subUl = document.createElement('ul');
            subUl.className = 'doc-submenu';
            
            chapters.forEach(function(chap) {
              var subLi = document.createElement('li');
              subLi.className = 'doc-submenu-item';
              
              var subA = document.createElement('a');
              subA.href = '#' + chap.id;
              subA.textContent = chap.title;
              subA.className = 'doc-submenu-link';
              
              subA.addEventListener('click', function(e) {
                e.preventDefault();
                var targetEl = document.getElementById(chap.id);
                if (targetEl) {
                  targetEl.scrollIntoView({ behavior: 'smooth' });
                  history.pushState(null, null, '#' + chap.id);
                  
                  subUl.querySelectorAll('.doc-submenu-item').forEach(function(item) {
                    item.classList.remove('is-active');
                  });
                  subLi.classList.add('is-active');
                }
              });

              subLi.appendChild(subA);
              subUl.appendChild(subLi);
            });
            
            li.appendChild(subUl);
          }

          menuContainer.appendChild(li);
        });
      }

      // Scroll Spy
      function setupScrollSpy() {
        if (scrollListener) {
          window.removeEventListener('scroll', scrollListener);
        }

        var h2Elements = [];
        chapters.forEach(function(chap) {
          var el = document.getElementById(chap.id);
          if (el) h2Elements.push(el);
        });

        scrollListener = function() {
          var activeSectionId = null;
          var scrollPos = window.scrollY + 180; // margin for navbar + header spacing

          var isAtBottom = (window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 15;

          if (isAtBottom && h2Elements.length > 0) {
            activeSectionId = h2Elements[h2Elements.length - 1].getAttribute('id');
          } else {
            h2Elements.forEach(function(section) {
              var sectionTop = section.getBoundingClientRect().top + window.scrollY;
              if (scrollPos >= sectionTop) {
                activeSectionId = section.getAttribute('id');
              }
            });
          }

          var submenuItems = menuContainer.querySelectorAll('.doc-submenu-item');
          if (activeSectionId) {
            submenuItems.forEach(function(item) {
              var link = item.querySelector('a');
              if (link && link.getAttribute('href') === '#' + activeSectionId) {
                item.classList.add('is-active');
              } else {
                item.classList.remove('is-active');
              }
            });
          } else {
            submenuItems.forEach(function(item, index) {
              if (index === 0) item.classList.add('is-active');
              else item.classList.remove('is-active');
            });
          }
        };

        window.addEventListener('scroll', scrollListener, { passive: true });
        scrollListener();
      }

      // Scroll Reveal System
      function setupRevealSystem() {
        var scrollSpeed = 0;
        var lastScroll = window.scrollY;
        var lastTime = Date.now();

        scrollSpeedListener = function() {
          var currentScroll = window.scrollY;
          var currentTime = Date.now();
          var deltaY = Math.abs(currentScroll - lastScroll);
          var deltaTime = currentTime - lastTime;

          if (deltaTime > 0) {
            var instantSpeed = deltaY / deltaTime;
            scrollSpeed = scrollSpeed * 0.65 + instantSpeed * 0.35;
          }

          lastScroll = currentScroll;
          lastTime = currentTime;

          var duration = 1.6 - Math.min(1.1, scrollSpeed / 3.2) * 1.0;
          document.documentElement.style.setProperty('--reveal-duration', duration.toFixed(2) + 's');

          if (scrollTimeout) clearTimeout(scrollTimeout);
          scrollTimeout = setTimeout(function () {
            scrollSpeed = 0;
            document.documentElement.style.setProperty('--reveal-duration', '1.6s');
          }, 150);
        };

        document.documentElement.style.setProperty('--reveal-duration', '1.6s');
        window.addEventListener('scroll', scrollSpeedListener, { passive: true });

        var revealObserverOptions = {
          root: null,
          rootMargin: '-120px 0px -180px 0px',
          threshold: 0.02
        };

        revealObserver = new IntersectionObserver(function (entries) {
          var groupsToReveal = {};

          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              var groupId = entry.target.getAttribute('data-reveal-group');
              groupsToReveal[groupId] = true;
            }
          });

          var enteringElements = [];
          Object.keys(groupsToReveal).forEach(function (groupId) {
            var groupElements = document.querySelectorAll('[data-reveal-group="' + groupId + '"]');
            groupElements.forEach(function (el) {
              if (!el.classList.contains('reveal-visible')) {
                enteringElements.push(el);
              }
            });
          });

          if (enteringElements.length > 0) {
            if (!document.body.classList.contains('is-ready')) {
              setTimeout(function () {
                var stillEntering = enteringElements.filter(function (el) {
                  return !el.classList.contains('reveal-visible');
                });
                if (stillEntering.length > 0) {
                  revealElements(stillEntering);
                }
              }, 550);
            } else {
              revealElements(enteringElements);
            }
          }
        }, revealObserverOptions);

        var hideObserverOptions = {
          root: null,
          rootMargin: '0px 0px 0px 0px',
          threshold: 0
        };

        hideObserver = new IntersectionObserver(function (entries) {
          var groupsToHide = {};

          entries.forEach(function (entry) {
            if (!entry.isIntersecting) {
              var groupId = entry.target.getAttribute('data-reveal-group');
              groupsToHide[groupId] = true;
            }
          });

          Object.keys(groupsToHide).forEach(function (groupId) {
            var groupElements = Array.from(document.querySelectorAll('[data-reveal-group="' + groupId + '"]'));
            var isAnyVisible = groupElements.some(function (el) {
              var rect = el.getBoundingClientRect();
              return rect.bottom > 0 && rect.top < window.innerHeight;
            });

            if (!isAnyVisible) {
              var isBelowViewport = groupElements.every(function (el) {
                var rect = el.getBoundingClientRect();
                return rect.top >= window.innerHeight;
              });

              if (isBelowViewport) {
                groupElements.forEach(function (el) {
                  el.classList.remove('reveal-visible');
                  el.style.transitionDelay = '0ms';
                });
              }
            }
          });
        }, hideObserverOptions);

        function revealElements(elements) {
          elements.sort(function (a, b) {
            var rectA = a.getBoundingClientRect();
            var rectB = b.getBoundingClientRect();
            if (Math.abs(rectA.top - rectB.top) < 10) {
              return rectA.left - rectB.left;
            }
            return rectA.top - rectB.top;
          });

          var currentDelay = 0;
          var isHero = elements.length > 0 && elements[0].closest('#doc-title-container') !== null;
          var baseStagger = isHero ? 150 : 100;

          elements.forEach(function (el, index) {
            if (index > 0) {
              var prevEl = elements[index - 1];
              var isPrevHeader = prevEl.tagName === 'H1' || prevEl.tagName === 'H2' ||
                prevEl.classList.contains('headline') || prevEl.classList.contains('lead');
              var isCurrentHeader = el.tagName === 'H1' || el.tagName === 'H2' ||
                el.classList.contains('headline') || el.classList.contains('lead');

              if (isPrevHeader) {
                currentDelay += 160;
              } else if (isCurrentHeader) {
                currentDelay += 160;
              } else {
                currentDelay += baseStagger;
              }
            }
            el.style.transitionDelay = currentDelay + 'ms';
            el.classList.add('reveal-visible');

            (function (element, delay) {
              setTimeout(function () {
                element.style.transitionDelay = '';
              }, delay + 1200);
            })(el, currentDelay);
          });
        }

        function initReveal() {
          var revealItems = self.querySelectorAll('.reveal-item:not([data-reveal-observed])');
          if (revealItems.length === 0) return;

          var sectionsMap = {};
          revealItems.forEach(function (item) {
            item.setAttribute('data-reveal-observed', 'true');
            var section = item.closest('section') || item.closest('footer') || item.closest('.doc-split-container') || item.closest('#doc-title-container') || document.body;
            var sectionId = section.id || section.className || 'default-section';
            var cleanId = sectionId.replace(/[\s,#]/g, '-');
            if (!sectionsMap[cleanId]) {
              sectionsMap[cleanId] = [];
            }
            sectionsMap[cleanId].push(item);
          });

          Object.keys(sectionsMap).forEach(function (sectionId) {
            var section = document.getElementById(sectionId) || document.querySelector('.' + sectionId) || document.body;
            var groupIndex = section.getAttribute('data-reveal-group-idx');
            if (!groupIndex) {
              window.globalGroupIndex = (window.globalGroupIndex || 0) + 1;
              groupIndex = 'rg-' + window.globalGroupIndex;
              section.setAttribute('data-reveal-group-idx', groupIndex);
            }

            sectionsMap[sectionId].forEach(function (el) {
              el.setAttribute('data-reveal-group', groupIndex);
              revealObserver.observe(el);
              hideObserver.observe(el);
            });
          });
        }

        initReveal();
        window.initReveal = initReveal;
      }

      this._cleanup = () => {
        if (scrollListener) window.removeEventListener('scroll', scrollListener);
        if (scrollSpeedListener) window.removeEventListener('scroll', scrollSpeedListener);
        if (revealObserver) revealObserver.disconnect();
        if (hideObserver) hideObserver.disconnect();
        if (scrollTimeout) clearTimeout(scrollTimeout);
      };
    }

    disconnectedCallback() {
      if (this._cleanup) {
        this._cleanup();
      }
    }
  }

  customElements.define('faust-documentation', FaustDocumentation);
})();
