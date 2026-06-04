class FaustApplyModal extends HTMLElement {
  connectedCallback() {
    this.style.display = 'contents';
    this.innerHTML = `
  <div class="apply-overlay" id="apply-overlay">
    <div class="wrap apply-overlay-wrap">
      <div class="apply-modal-container">
        <div class="apply-modal">
          <div class="apply-modal-header">
            <div class="apply-modal-title-row">
              <span>Aplicar</span>
            </div>
            <!-- Progress Line Indicator -->
            <div class="apply-progress-bar" id="apply-progress-bar"></div>
          </div>
          <div class="apply-modal-body" id="apply-modal-body">
            <!-- Dynamic step contents -->
          </div>
          <div class="apply-modal-footer">
            <button class="btn btn-secondary btn-apply-back" id="apply-btn-back" style="display: none;">Anterior</button>
            <button class="btn btn-primary btn-apply-next" id="apply-btn-next">Siguiente</button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="message-overlay" id="message-overlay">
    <div class="wrap message-overlay-wrap">
      <div class="message-modal-container">
        <div class="message-modal">
          <div class="message-modal-header">
            <div class="message-modal-title-row">
              <span>Escribir un mensaje</span>
            </div>
          </div>
          <div class="message-modal-body" id="message-modal-body">
            <!-- Form or Success contents -->
          </div>
          <div class="message-modal-footer" id="message-modal-footer">
            <!-- Buttons Cancelar / Enviar -->
          </div>
        </div>
      </div>
    </div>
  </div>
`;

    // Initialize overlay controllers
      (function() {
    const overlay = document.getElementById('apply-overlay');
    const modalBody = document.getElementById('apply-modal-body');
    const progressBar = document.getElementById('apply-progress-bar');
    const btnBack = document.getElementById('apply-btn-back');
    const btnNext = document.getElementById('apply-btn-next');
    const modalFooter = document.querySelector('.apply-modal-footer');

    if (!overlay || !modalBody || !progressBar || !btnBack || !btnNext || !modalFooter) return;

    let currentStep = 0;
    let pendingBackHeight = null;
    let mobileBackTimeout = null;

    function triggerPendingBackHeightAdjustment() {
      if (pendingBackHeight === null) return;
      const h = pendingBackHeight;
      pendingBackHeight = null;
      if (mobileBackTimeout) {
        clearTimeout(mobileBackTimeout);
        mobileBackTimeout = null;
      }
      adjustModalHeight(h);
    }

    function cancelPendingBackHeightAdjustment() {
      pendingBackHeight = null;
      if (mobileBackTimeout) {
        clearTimeout(mobileBackTimeout);
        mobileBackTimeout = null;
      }
    }

    const formData = {
      name: '',
      role: '',
      company: '',
      revenue: '',
      teams: [],
      contact: '',
      date: ''
    };
    window.confirmedCompany = '';

    let calendarYear = new Date().getFullYear();
    let calendarMonth = new Date().getMonth();

    function buildCalendarHTML(year, month, selectedDateStr) {
      const today = new Date();
      today.setHours(0,0,0,0);
      
      const monthNames = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
      ];
      
      const firstDayIndex = new Date(year, month, 1).getDay();
      const startDay = firstDayIndex;
      
      const totalDays = new Date(year, month + 1, 0).getDate();

      // Limit navigation: block month prior to current, and more than 3 months in the future
      const now = new Date();
      const curYear = now.getFullYear();
      const curMonth = now.getMonth();
      
      const maxDate = new Date(curYear, curMonth + 3, 1);
      const maxYear = maxDate.getFullYear();
      const maxMonth = maxDate.getMonth();

      const isPrevDisabled = (year < curYear) || (year === curYear && month <= curMonth);
      const isNextDisabled = (year > maxYear) || (year === maxYear && month >= maxMonth);
      
      let html = `
        <div class="apply-calendar">
          <div class="calendar-header">
            <button type="button" class="calendar-nav-btn prev-month" id="calendar-prev-btn" ${isPrevDisabled ? 'disabled' : ''}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            <span class="calendar-month-title">${monthNames[month]} ${year}</span>
            <button type="button" class="calendar-nav-btn next-month" id="calendar-next-btn" ${isNextDisabled ? 'disabled' : ''}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>
          <div class="calendar-weekdays">
            <div>D</div><div>L</div><div>M</div><div>M</div><div>J</div><div>V</div><div>S</div>
          </div>
          <div class="calendar-days">
      `;
      
      for (let i = 0; i < startDay; i++) {
        html += `<div class="calendar-day-empty"></div>`;
      }
      
      for (let day = 1; day <= totalDays; day++) {
        const currentDate = new Date(year, month, day);
        const isPast = currentDate < today;
        const dayOfWeek = currentDate.getDay();
        const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);
        
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isSelected = selectedDateStr === dateStr;
        
        html += `
          <div class="calendar-day ${isPast ? 'is-past' : ''} ${isWeekend ? 'is-weekend' : ''} ${isSelected ? 'is-selected' : ''}" 
               data-date="${dateStr}">
            <span>${day}</span>
          </div>
        `;
      }
      
      html += `
          </div>
        </div>
      `;
      return html;
    }

    function validateFullName(name) {
      if (!name) return false;
      const nameVal = name.trim();
      const activeLang = (localStorage.getItem('faust-lang-selection-code') || '').toLowerCase();
      const isChinese = activeLang.startsWith('zh');
      if (isChinese) {
        return nameVal.length >= 1;
      } else {
        const words = nameVal.split(/\s+/).filter(Boolean);
        return words.length >= 2 && words[0].length >= 3;
      }
    }

    const steps = [
      {
        // Step 1: Name and Cargo
        render: (data) => `
          <div class="apply-group">
            <label class="apply-label" for="apply-name">¿Cuál es su nombre?*</label>
            <input type="text" id="apply-name" class="apply-input" placeholder="Nombre completo" value="${data.name || ''}">
          </div>
          <div class="apply-group" id="apply-role-container" style="margin-top: 24px; display: none;">
            <label class="apply-label" for="apply-role">Por favor, seleccione su cargo.</label>
            <select id="apply-role" class="apply-input">
              <option value="" disabled ${!data.role ? 'selected' : ''}>Seleccione su cargo...</option>
              <option value="Director General / CEO" ${data.role === 'Director General / CEO' ? 'selected' : ''}>Director General / CEO</option>
              <option value="Director de Tecnología / CTO" ${data.role === 'Director de Tecnología / CTO' ? 'selected' : ''}>Director de Tecnología / CTO</option>
              <option value="Director de Marketing / CMO" ${data.role === 'Director de Marketing / CMO' ? 'selected' : ''}>Director de Marketing / CMO</option>
              <option value="Socio / Partner" ${data.role === 'Socio / Partner' ? 'selected' : ''}>Socio / Partner</option>
              <option value="Otro" ${data.role === 'Otro' ? 'selected' : ''}>Otro</option>
            </select>
          </div>
        `,
        validate: (data) => {
          return validateFullName(data.name);
        },
        bind: (data, updateValid) => {
          const nameInput = document.getElementById('apply-name');
          const roleSelect = document.getElementById('apply-role');
          const roleContainer = document.getElementById('apply-role-container');

          function checkRoleVisibility(forceNoTransition) {
            if (!roleContainer) return;
            const isNameValid = validateFullName(data.name);

            const shouldShow = isNameValid || (data.role && data.role !== '');
            const currentlyVisible = roleContainer.style.display !== 'none';

            if (shouldShow && !currentlyVisible) {
              const container = document.querySelector('.apply-modal-container');
              const prevHeight = container ? container.offsetHeight : 0;
              roleContainer.style.display = 'block';
              if (!forceNoTransition) {
                adjustModalHeight(prevHeight);
              }
            } else if (!shouldShow && currentlyVisible) {
              const container = document.querySelector('.apply-modal-container');
              const prevHeight = container ? container.offsetHeight : 0;
              roleContainer.style.display = 'none';
              if (!forceNoTransition) {
                adjustModalHeight(prevHeight);
              }
            }
          }

          if (nameInput) {
            nameInput.addEventListener('input', () => {
              data.name = nameInput.value;
              checkRoleVisibility();
              updateValid();
            });
            nameInput.addEventListener('keydown', (e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const isNameValid = validateFullName(data.name);
                
                if (isNameValid) {
                  if (roleContainer && roleContainer.style.display !== 'none' && roleSelect) {
                    roleSelect.focus();
                  } else {
                    navigateNext();
                  }
                }
              }
            });
          }
          if (roleSelect) {
            roleSelect.addEventListener('change', () => {
              data.role = roleSelect.value;
              updateValid();
            });
            roleSelect.addEventListener('keydown', (e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                navigateNext();
              }
            });
          }

          checkRoleVisibility(true);
        }
      },
      {
        // Step 2: Company Name
        render: (data) => `
          <div class="apply-group">
            <label class="apply-label" for="apply-company">¿Cuál es el nombre de su empresa?*</label>
            <input type="text" id="apply-company" class="apply-input" placeholder="Nombre de la empresa" value="${data.company || ''}">
          </div>
        `,
        validate: (data) => {
          return data.company && data.company.trim().length > 0;
        },
        bind: (data, updateValid) => {
          const companyInput = document.getElementById('apply-company');
          if (companyInput) {
            companyInput.addEventListener('input', () => {
              data.company = companyInput.value;
              updateValid();
            });
            companyInput.addEventListener('keydown', (e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                navigateNext();
              }
            });
          }
        }
      },
      {
        // Step 3: Gross Monthly Revenue
        render: (data) => {
          const options = [
            "Menos de $1M",
            "De $1M a $5M",
            "De $5M a $10M",
            "De $10M a $50M",
            "Más de $50M"
          ];
          return `
            <div class="apply-group">
              <label class="apply-label" style="margin-bottom: 8px;">Seleccione los ingresos brutos mensuales de su empresa (MXN).*</label>
              <div class="apply-options-list">
                ${options.map(opt => {
                  const selected = data.revenue === opt;
                  return `
                    <div class="apply-option-item ${selected ? 'is-selected' : ''}" data-value="${opt}">
                      <span>${opt}</span>
                      <div class="apply-option-checkmark">✓</div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          `;
        },
        validate: (data) => {
          return !!data.revenue;
        },
        bind: (data, updateValid) => {
          const items = document.querySelectorAll('.apply-option-item');
          items.forEach(item => {
            item.addEventListener('click', () => {
              items.forEach(el => el.classList.remove('is-selected'));
              item.classList.add('is-selected');
              data.revenue = item.getAttribute('data-value');
              updateValid();
              setTimeout(() => {
                if (currentStep === 2) {
                  navigateNext();
                }
              }, 200);
            });
          });
        }
      },
      {
        // Step 4: Available Teams (optional)
        render: (data) => {
          const options = [
            "Diseño UX/UI",
            "Desarrollo Front-End",
            "Marketing Digital",
            "Análisis de Datos"
          ];
          const selectedTeams = data.teams || [];
          return `
            <div class="apply-group">
              <label class="apply-label" style="margin-bottom: 8px;">Seleccione los equipos de su empresa con disponibilidad para colaborar con el nuestro (opcional)</label>
              <div class="apply-options-list">
                ${options.map(opt => {
                  const selected = selectedTeams.includes(opt);
                  return `
                    <div class="apply-option-item ${selected ? 'is-selected' : ''}" data-value="${opt}">
                      <span>${opt}</span>
                      <div class="apply-option-checkmark">✓</div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          `;
        },
        validate: (data) => {
          return true;
        },
        bind: (data, updateValid) => {
          const items = document.querySelectorAll('.apply-option-item');
          if (!data.teams) data.teams = [];
          items.forEach(item => {
            item.addEventListener('click', () => {
              const val = item.getAttribute('data-value');
              const idx = data.teams.indexOf(val);
              if (idx > -1) {
                data.teams.splice(idx, 1);
                item.classList.remove('is-selected');
              } else {
                data.teams.push(val);
                item.classList.add('is-selected');
              }
              updateValid();
            });
          });
        }
      },
      {
        // Step 5: Contact Info
        render: (data) => `
          <div class="apply-group">
            <label class="apply-label" for="apply-contact">Por favor, ingrese un correo electrónico o número de contacto.</label>
            <input type="text" id="apply-contact" class="apply-input" placeholder="${buildContactPlaceholder(data)}" value="${data.contact || ''}">
            <div id="apply-contact-error" style="color: #ff4a4a; font-size: 14px; margin-top: 8px; display: none;">Por favor, verifique que el medio de contacto es válido.</div>
          </div>
        `,
        validate: (data) => {
          return true;
        },
        bind: (data, updateValid) => {
          const contactInput = document.getElementById('apply-contact');
          const errorMsg = document.getElementById('apply-contact-error');

          function checkContactValidity() {
            const val = contactInput ? contactInput.value : '';
            data.contact = val;
            if (errorMsg) {
              if (val.trim() === '') {
                errorMsg.style.display = 'none';
              } else {
                const isValid = validateContactMethod(val);
                if (isValid) {
                  errorMsg.style.display = 'none';
                } else {
                  errorMsg.style.display = 'block';
                }
              }
            }
          }

          if (contactInput) {
            contactInput.addEventListener('input', () => {
              checkContactValidity();
              updateValid();
            });
            contactInput.addEventListener('keydown', (e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                navigateNext();
              }
            });
          }

          checkContactValidity();
        }
      },
      {
        // Step 6: Date (optional)
        render: (data) => `
          <div class="apply-group">
            <label class="apply-label" style="margin-bottom: 8px;">Seleccione una fecha para agendar una llamada o videoconferencia (opcional).</label>
            <div id="apply-calendar-mount"></div>
          </div>
        `,
        validate: (data) => {
          return true;
        },
        bind: (data, updateValid) => {
          function renderCalendarView(entryDirection) {
            const mount = document.getElementById('apply-calendar-mount');
            if (!mount) return;
            mount.innerHTML = buildCalendarHTML(calendarYear, calendarMonth, data.date);
            
            const prevBtn = document.getElementById('calendar-prev-btn');
            const nextBtn = document.getElementById('calendar-next-btn');
            if (prevBtn) {
              prevBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                const now = new Date();
                const curYear = now.getFullYear();
                const curMonth = now.getMonth();
                if (calendarYear < curYear || (calendarYear === curYear && calendarMonth <= curMonth)) {
                  return;
                }
                const container = document.querySelector('.apply-modal-container');
                const prevHeight = container ? container.offsetHeight : 0;
                calendarMonth--;
                if (calendarMonth < 0) {
                  calendarMonth = 11;
                  calendarYear--;
                }
                renderCalendarView('left');
                adjustModalHeight(prevHeight);
              });
            }
            if (nextBtn) {
              nextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                const now = new Date();
                const curYear = now.getFullYear();
                const curMonth = now.getMonth();
                const maxDate = new Date(curYear, curMonth + 3, 1);
                const maxYear = maxDate.getFullYear();
                const maxMonth = maxDate.getMonth();
                if (calendarYear > maxYear || (calendarYear === maxYear && calendarMonth >= maxMonth)) {
                  return;
                }
                const container = document.querySelector('.apply-modal-container');
                const prevHeight = container ? container.offsetHeight : 0;
                calendarMonth++;
                if (calendarMonth > 11) {
                  calendarMonth = 0;
                  calendarYear++;
                }
                renderCalendarView('right');
                adjustModalHeight(prevHeight);
              });
            }
            
            const dayCells = mount.querySelectorAll('.calendar-day:not(.is-past):not(.is-weekend)');
            dayCells.forEach(cell => {
              cell.addEventListener('click', (e) => {
                e.stopPropagation();
                const selectedDate = cell.getAttribute('data-date');
                if (data.date === selectedDate) {
                  data.date = '';
                  cell.classList.remove('is-selected');
                } else {
                  data.date = selectedDate;
                  mount.querySelectorAll('.calendar-day').forEach(el => el.classList.remove('is-selected'));
                  cell.classList.add('is-selected');
                }
                updateValid();
              });
            });

            // Slide entry transition
            const newDays = mount.querySelector('.calendar-days');
            if (newDays && entryDirection) {
              newDays.style.transition = 'none';
              if (entryDirection === 'left') {
                newDays.style.transform = 'translateX(-100%)';
              } else if (entryDirection === 'right') {
                newDays.style.transform = 'translateX(100%)';
              }
              newDays.offsetHeight; // force reflow
              newDays.style.transition = 'transform 0.25s cubic-bezier(0.25, 1, 0.5, 1)';
              newDays.style.transform = 'translateX(0)';
            }
          }
          
          renderCalendarView();

          const mount = document.getElementById('apply-calendar-mount');
          if (mount) {
            let touchStartX = 0;
            let touchStartY = 0;
            let startTranslateX = 0;
            let touchStartTime = 0;
            let lastTouchX = 0;
            let lastTouchTime = 0;
            let velocity = 0;
            let daysContainer = null;
            let isDragging = false;
            let monthChangeTimeout = null;

            function getTranslateX(element) {
              const style = window.getComputedStyle(element);
              const transform = style.transform || style.webkitTransform;
              if (!transform || transform === 'none') {
                return 0;
              }
              const matrix = transform.match(/^matrix\((.+)\)$/);
              if (matrix) {
                const values = matrix[1].split(',').map(Number);
                return values[4] || 0;
              }
              const matrix3d = transform.match(/^matrix3d\((.+)\)$/);
              if (matrix3d) {
                const values = matrix3d[1].split(',').map(Number);
                return values[12] || 0;
              }
              return 0;
            }

            mount.addEventListener('touchstart', (e) => {
              const target = e.target.closest('.calendar-days');
              if (target) {
                daysContainer = target;
                if (monthChangeTimeout) {
                  clearTimeout(monthChangeTimeout);
                  monthChangeTimeout = null;
                }
                
                const prevBtn = document.getElementById('calendar-prev-btn');
                const nextBtn = document.getElementById('calendar-next-btn');
                
                const currentTx = getTranslateX(daysContainer);
                daysContainer.style.transition = 'none';
                daysContainer.style.transform = `translateX(${currentTx}px)`;
                
                if (currentTx > 0 && (!prevBtn || prevBtn.disabled)) {
                  startTranslateX = currentTx / 0.25;
                } else if (currentTx < 0 && (!nextBtn || nextBtn.disabled)) {
                  startTranslateX = currentTx / 0.25;
                } else {
                  startTranslateX = currentTx;
                }
                
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
                touchStartTime = Date.now();
                lastTouchX = touchStartX;
                lastTouchTime = touchStartTime;
                velocity = 0;
                isDragging = true;
              }
            }, { passive: true });

            mount.addEventListener('touchmove', (e) => {
              if (!isDragging || !daysContainer) return;
              const currentX = e.touches[0].clientX;
              const currentY = e.touches[0].clientY;
              const diffX = currentX - touchStartX;
              const diffY = currentY - touchStartY;

              if (Math.abs(diffX) > Math.abs(diffY)) {
                const now = Date.now();
                const dt = now - lastTouchTime;
                if (dt > 0) {
                  velocity = (currentX - lastTouchX) / dt;
                }
                lastTouchX = currentX;
                lastTouchTime = now;

                let dragDistance = startTranslateX + diffX;
                const prevBtn = document.getElementById('calendar-prev-btn');
                const nextBtn = document.getElementById('calendar-next-btn');

                const canGoPrev = prevBtn && !prevBtn.disabled;
                const canGoNext = nextBtn && !nextBtn.disabled;

                if (dragDistance > 0 && !canGoPrev) {
                  dragDistance = dragDistance * 0.25; // resistance
                } else if (dragDistance < 0 && !canGoNext) {
                  dragDistance = dragDistance * 0.25; // resistance
                }

                // Automatic threshold check: if dragged past 140px and navigation is enabled,
                // trigger the transition immediately and end dragging.
                const autoTriggerThreshold = 140; // pixels
                if (dragDistance > autoTriggerThreshold && canGoPrev) {
                  isDragging = false;
                  daysContainer.style.transition = 'transform 0.25s cubic-bezier(0.25, 1, 0.5, 1)';
                  daysContainer.style.transform = 'translateX(100%)';
                  monthChangeTimeout = setTimeout(() => {
                    if (prevBtn) prevBtn.click();
                  }, 200);
                  daysContainer = null;
                  return;
                } else if (dragDistance < -autoTriggerThreshold && canGoNext) {
                  isDragging = false;
                  daysContainer.style.transition = 'transform 0.25s cubic-bezier(0.25, 1, 0.5, 1)';
                  daysContainer.style.transform = 'translateX(-100%)';
                  monthChangeTimeout = setTimeout(() => {
                    if (nextBtn) nextBtn.click();
                  }, 200);
                  daysContainer = null;
                  return;
                }

                daysContainer.style.transform = `translateX(${dragDistance}px)`;
              }
            }, { passive: true });

            mount.addEventListener('touchend', (e) => {
              if (!isDragging || !daysContainer) return;
              isDragging = false;

              const touchEndX = e.changedTouches[0].clientX;
              const touchEndY = e.changedTouches[0].clientY;
              const diffX = touchEndX - touchStartX;
              const diffY = touchEndY - touchStartY;
              const now = Date.now();

              if (now - lastTouchTime > 80) {
                velocity = 0;
              }

              daysContainer.style.transition = 'transform 0.25s cubic-bezier(0.25, 1, 0.5, 1)';

              const prevBtn = document.getElementById('calendar-prev-btn');
              const nextBtn = document.getElementById('calendar-next-btn');
              
              const flickThresholdVelocity = 0.4; // px/ms
              const flickThresholdDistance = 30; // px
              const dragThresholdDistance = 120; // px
              
              const finalTx = startTranslateX + diffX;
              const absVelocity = Math.abs(velocity);
              const absDiffX = Math.abs(diffX);
              const isHorizontal = absDiffX > Math.abs(diffY);

              let action = 'snap';

              if (isHorizontal) {
                if (absVelocity > flickThresholdVelocity && absDiffX > flickThresholdDistance) {
                  if (velocity > 0) {
                    action = 'prev';
                  } else {
                    action = 'next';
                  }
                } else {
                  if (finalTx > dragThresholdDistance) {
                    action = 'prev';
                  } else if (finalTx < -dragThresholdDistance) {
                    action = 'next';
                  }
                }
              }

              if (action === 'prev' && prevBtn && !prevBtn.disabled) {
                daysContainer.style.transform = 'translateX(100%)';
                monthChangeTimeout = setTimeout(() => {
                  if (prevBtn) prevBtn.click();
                }, 200);
              } else if (action === 'next' && nextBtn && !nextBtn.disabled) {
                daysContainer.style.transform = 'translateX(-100%)';
                monthChangeTimeout = setTimeout(() => {
                  if (nextBtn) nextBtn.click();
                }, 200);
              } else {
                daysContainer.style.transform = 'translateX(0)';
              }

              daysContainer = null;
            }, { passive: true });
          }
        }
      }
    ];

    progressBar.innerHTML = '';
    for (let i = 0; i < steps.length; i++) {
      const line = document.createElement('div');
      line.className = 'apply-step-line';
      progressBar.appendChild(line);
    }

    function updateProgressBar() {
      const lines = progressBar.querySelectorAll('.apply-step-line');
      lines.forEach((line, idx) => {
        line.classList.remove('is-active', 'is-completed');
        if (idx < currentStep) {
          line.classList.add('is-completed');
        } else if (idx === currentStep) {
          line.classList.add('is-active');
        }
      });
    }

    const DRAFT_KEY = 'faust-apply-draft';

    function saveFormDraft() {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({
          formData: formData,
          currentStep: currentStep
        }));
      } catch (e) {
        console.warn("Failed to save draft:", e);
      }
    }

    function loadFormDraft() {
      try {
        const draft = localStorage.getItem(DRAFT_KEY);
        if (draft) {
          const parsed = JSON.parse(draft);
          if (parsed && parsed.formData) {
            Object.assign(formData, parsed.formData);
            if (typeof parsed.currentStep === 'number' && parsed.currentStep >= 0 && parsed.currentStep < steps.length) {
              currentStep = parsed.currentStep;
            }
            if (formData.company && currentStep > 1) {
              window.confirmedCompany = formData.company;
            }
            if (formData.date) {
              const parts = formData.date.split('-');
              if (parts.length === 3) {
                const y = parseInt(parts[0], 10);
                const m = parseInt(parts[1], 10) - 1;
                if (!isNaN(y) && !isNaN(m)) {
                  calendarYear = y;
                  calendarMonth = m;
                }
              }
            }
            return true;
          }
        }
      } catch (e) {
        console.warn("Failed to load draft:", e);
      }
      return false;
    }

    function clearFormDraft() {
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch (e) {
        console.warn("Failed to clear draft:", e);
      }
    }

    function checkValidation() {
      const current = steps[currentStep];
      const isValid = current.validate(formData);
      if (isValid) {
        btnNext.removeAttribute('disabled');
      } else {
        btnNext.setAttribute('disabled', 'true');
      }

      if (currentStep === steps.length - 1) {
        if (formData.date && formData.date.trim() !== '') {
          btnNext.textContent = 'Enviar';
        } else {
          btnNext.textContent = 'Omitir y enviar';
        }
      } else if (currentStep === 3) {
        if (formData.teams && formData.teams.length > 0) {
          btnNext.textContent = 'Siguiente';
        } else {
          btnNext.textContent = 'Omitir';
        }
      } else if (currentStep === 4) {
        if (formData.contact && formData.contact.trim() !== '') {
          btnNext.textContent = 'Siguiente';
        } else {
          btnNext.textContent = 'Omitir';
        }
      } else {
        btnNext.textContent = 'Siguiente';
      }

      saveFormDraft();
    }

    let heightTransitionTimeout = null;

    function adjustModalHeight(prevHeight) {
      const container = document.querySelector('.apply-modal-container');
      if (!container) return;
      
      if (heightTransitionTimeout) {
        clearTimeout(heightTransitionTimeout);
        heightTransitionTimeout = null;
      }
      
      if (prevHeight === undefined) {
        prevHeight = container.offsetHeight;
      }
      
      container.style.height = 'auto';
      const targetHeight = container.offsetHeight;
      
      if (prevHeight === 0 || prevHeight === targetHeight) {
        container.style.height = 'auto';
        return;
      }
      
      container.style.height = prevHeight + 'px';
      container.offsetHeight; // force reflow
      container.style.height = targetHeight + 'px';
      
      heightTransitionTimeout = setTimeout(() => {
        container.style.height = 'auto';
      }, 350);
    }

    function renderStep(isOpening, isBack) {
      const container = document.querySelector('.apply-modal-container');
      const prevHeight = (container && !isOpening) ? container.offsetHeight : 0;
      const step = steps[currentStep];

      if (prevHeight === 0) {
        modalBody.innerHTML = step.render(formData);
        step.bind(formData, checkValidation);
        updateProgressBar();

        if (currentStep === 0) {
          btnBack.style.display = 'none';
        } else {
          btnBack.style.display = 'block';
        }

        // btnNext text content is handled by checkValidation()

        checkValidation();
        if (!isBack) {
          adjustModalHeight(prevHeight);
        }
        
        const firstInput = modalBody.querySelector('input, select');
        if (firstInput) {
          firstInput.focus();
        }
        modalBody.style.opacity = '1';
        saveFormDraft();
        return;
      }

      modalBody.style.opacity = '0';
      
      setTimeout(() => {
        modalBody.innerHTML = step.render(formData);
        step.bind(formData, checkValidation);
        updateProgressBar();

        if (currentStep === 0) {
          btnBack.style.display = 'none';
        } else {
          btnBack.style.display = 'block';
        }

        // btnNext text content is handled by checkValidation()

        checkValidation();
        if (!isBack) {
          adjustModalHeight(prevHeight);
        }
        
        const firstInput = modalBody.querySelector('input, select');
        if (firstInput) {
          firstInput.focus();
        }
        
        modalBody.style.opacity = '1';
        saveFormDraft();
      }, 150);
    }

    function navigateNext() {
      const current = steps[currentStep];
      if (!current.validate(formData)) return;

      cancelPendingBackHeightAdjustment();

      if (currentStep === 1) {
        window.confirmedCompany = formData.company || '';
        window.dispatchEvent(new CustomEvent('faust-company-confirmed', { detail: window.confirmedCompany }));
      }

      if (currentStep === steps.length - 1) {
        submitForm();
      } else {
        currentStep++;
        renderStep();
      }
    }

    function navigateBack() {
      if (currentStep > 0) {
        const container = document.querySelector('.apply-modal-container');
        if (container && pendingBackHeight === null) {
          pendingBackHeight = container.offsetHeight;
          container.style.height = pendingBackHeight + 'px';
        }

        currentStep--;
        renderStep(false, true);

        if (mobileBackTimeout) {
          clearTimeout(mobileBackTimeout);
          mobileBackTimeout = null;
        }

        const isMobile = window.innerWidth <= 980 || ('ontouchstart' in window);
        if (isMobile) {
          mobileBackTimeout = setTimeout(triggerPendingBackHeightAdjustment, 1000);
        }
      }
    }

    async function ensureIpDetected() {
      let cached = localStorage.getItem('faust-detected-ip');
      let cachedData = localStorage.getItem('faust-detected-ip-data');
      if (cached && cachedData) return cached;

      const services = [
        'https://ipapi.co/json/',
        'https://ipinfo.io/json',
        'https://api.ipify.org?format=json'
      ];
      for (const service of services) {
        try {
          const response = await fetch(service);
          if (response.ok) {
            const data = await response.json();
            const ip = data.ip;
            if (ip) {
              localStorage.setItem('faust-detected-ip', ip);
              if (data.city || data.country_name || data.country) {
                localStorage.setItem('faust-detected-ip-data', JSON.stringify(data));
              }
              return ip;
            }
          }
        } catch (e) {
          console.warn("Failed fetching IP from " + service, e);
        }
      }
      return cached || null;
    }

    function buildContactPlaceholder(data) {
      const nameParts = (data.name || '').trim().toLowerCase().split(/\s+/).filter(Boolean);
      const companyVal = (data.company || '').trim().toLowerCase().replace(/\s+/g, '');
      
      let emailPrefix = 'correo';
      if (nameParts.length >= 2) {
        emailPrefix = `${nameParts[0].charAt(0)}.${nameParts[1]}`;
      } else if (nameParts.length === 1) {
        emailPrefix = nameParts[0];
      }
      
      let domain = 'empresa';
      if (companyVal) {
        domain = companyVal;
      }
      
      return `${emailPrefix}@${domain}.com`;
    }

    function validateContactMethod(val) {
      if (!val || val.trim() === '') {
        return true;
      }
      const text = val.trim();
      
      if (text.includes('@')) {
        // 1. Correo: [texto] + @ + [texto] + [.] + [texto]
        const emailRegex = /[^\s@]+@[^\s@]+\.[^\s@]+/;
        return emailRegex.test(text);
      }
      
      // 2. Num. de teléfono: 10 dígitos sin texto intermedio, permitiendo únicamente espacios entre ellos
      const phoneRegex = /\d(?:\s*\d){9}/;
      if (phoneRegex.test(text)) return true;
      
      // 3. Un sitio web: [texto] + [.] + [texto]
      const webRegex = /[^\s.@]+\.[^\s.@]+/;
      if (webRegex.test(text)) return true;
      
      return false;
    }

    function checkBlockedState() {
      const ninetyDays = 90 * 24 * 60 * 60 * 1000;
      let blockedIps = {};
      try {
        blockedIps = JSON.parse(localStorage.getItem('faust-blocked-ips') || '{}');
      } catch (e) {}

      let changed = false;
      const now = Date.now();
      for (const ip in blockedIps) {
        if (now - blockedIps[ip] >= ninetyDays) {
          delete blockedIps[ip];
          changed = true;
        }
      }
      if (changed) {
        localStorage.setItem('faust-blocked-ips', JSON.stringify(blockedIps));
      }

      const localBlockTime = parseInt(localStorage.getItem('faust-local-blocked-at') || '0', 10);
      if (localBlockTime) {
        if (now - localBlockTime >= ninetyDays) {
          localStorage.removeItem('faust-local-blocked-at');
          localStorage.setItem('faust-submission-count', '0');
        } else {
          return true;
        }
      }

      const submissionCount = parseInt(localStorage.getItem('faust-submission-count') || '0', 10);
      if (submissionCount >= 2) {
        return true;
      }

      const clientIp = localStorage.getItem('faust-detected-ip');
      if (clientIp && blockedIps[clientIp]) {
        return true;
      }

      return false;
    }

    async function recordSubmission() {
      const newCount = parseInt(localStorage.getItem('faust-submission-count') || '0', 10) + 1;
      localStorage.setItem('faust-submission-count', newCount);

      const contactVal = formData.contact || '';
      const isContactValid = validateContactMethod(contactVal);
      const limit = isContactValid ? 2 : 1;

      if (newCount >= limit) {
        localStorage.setItem('faust-local-blocked-at', Date.now().toString());
        
        let clientIp = localStorage.getItem('faust-detected-ip');
        if (!clientIp) {
          clientIp = await ensureIpDetected();
        }
        
        if (clientIp) {
          let blockedIps = {};
          try {
            blockedIps = JSON.parse(localStorage.getItem('faust-blocked-ips') || '{}');
          } catch (e) {}
          blockedIps[clientIp] = Date.now();
          localStorage.setItem('faust-blocked-ips', JSON.stringify(blockedIps));
        }
      }
    }

    // Run IP detection as early as possible
    ensureIpDetected();

    // Run block cleanup on load
    checkBlockedState();

    function getAutomaticCollectionData() {
      const ip = localStorage.getItem('faust-detected-ip') || 'No detectada';
      
      let visitedPages = 'Ninguna';
      try {
        const pages = JSON.parse(localStorage.getItem('faust-visited-pages') || '[]');
        if (pages.length > 0) {
          visitedPages = pages.join(' -> ');
        }
      } catch (e) {
        console.error("Error parsing visited pages", e);
      }

      const lang = localStorage.getItem('faust-lang-native') || localStorage.getItem('faust-lang') || document.documentElement.lang || navigator.language || 'No detectado';
      
      const countryCode = localStorage.getItem('faust-detected-country-code') || 'Desconocido';
      const countryName = localStorage.getItem('faust-lang-country') || '';
      const countryStr = countryName ? `${countryName} (${countryCode})` : countryCode;
      
      const ua = navigator.userAgent;
      let os = "Otro OS";
      if (ua.includes("Windows")) os = "Windows";
      else if (ua.includes("Macintosh")) os = "macOS";
      else if (ua.includes("iPhone")) os = "iOS (iPhone)";
      else if (ua.includes("iPad")) os = "iOS (iPad)";
      else if (ua.includes("Android")) os = "Android";
      else if (ua.includes("Linux")) os = "Linux";
      
      let type = "Desktop";
      if (/mobile|android|iphone|ipod|phone/i.test(ua)) {
        type = "Mobile";
      } else if (/ipad|tablet/i.test(ua)) {
        type = "Tablet";
      }
      const deviceStr = `${type} - ${os}`;
      
      const totalSeconds = parseInt(localStorage.getItem('faust-cumulative-session-time') || '0', 10);
      let sessionTimeStr = '';
      if (totalSeconds < 60) {
        sessionTimeStr = `${totalSeconds}s`;
      } else {
        const minutes = Math.floor(totalSeconds / 60);
        const remainingSeconds = totalSeconds % 60;
        if (minutes < 60) {
          sessionTimeStr = `${minutes}m ${remainingSeconds}s`;
        } else {
          const hours = Math.floor(minutes / 60);
          const remainingMinutes = minutes % 60;
          sessionTimeStr = `${hours}h ${remainingMinutes}m ${remainingSeconds}s`;
        }
      }
      
      return `IP: ${ip} | Páginas Visitadas: ${visitedPages} | Idioma: ${lang} | País: ${countryStr} | Dispositivo: ${deviceStr} | Tiempo: ${sessionTimeStr}`;
    }

    function getDetailedAutomaticCollectionData() {
      const ip = localStorage.getItem('faust-detected-ip') || 'No detectada';
      
      let ipData = {};
      try {
        const rawIpData = localStorage.getItem('faust-detected-ip-data');
        if (rawIpData) {
          ipData = JSON.parse(rawIpData);
        }
      } catch (e) {
        console.error("Error parsing ip data", e);
      }

      // 1. IP & Geo Location
      const city = ipData.city || '';
      const region = ipData.region || ipData.region_name || '';
      const country = ipData.country_name || ipData.country || '';
      const countryCode = ipData.country_code || ipData.country || '';
      const postal = ipData.postal || ipData.zip || '';
      
      let ipLocation = 'Desconocida';
      if (city || region || country) {
        ipLocation = `${city}${city && region ? ', ' : ''}${region}${(city || region) && country ? ' - ' : ''}${country}`;
        if (postal) ipLocation += ` (${postal})`;
      }
      
      const ipLat = ipData.latitude || '';
      const ipLon = ipData.longitude || '';
      const ipCoords = (ipLat && ipLon) ? `${ipLat}, ${ipLon}` : '';
      if (ipCoords && ipLocation !== 'Desconocida') {
        ipLocation += ` [Coords: ${ipCoords}]`;
      }

      // 3. ISP / Org
      const isp = ipData.org || ipData.asn || 'Desconocido';

      // 4. Device & OS
      const ua = navigator.userAgent;
      let os = "Otro OS";
      if (ua.includes("Windows")) os = "Windows";
      else if (ua.includes("Macintosh")) os = "macOS";
      else if (ua.includes("iPhone")) os = "iOS (iPhone)";
      else if (ua.includes("iPad")) os = "iOS (iPad)";
      else if (ua.includes("Android")) os = "Android";
      else if (ua.includes("Linux")) os = "Linux";
      
      let deviceType = "Desktop";
      if (/mobile|android|iphone|ipod|phone/i.test(ua)) {
        deviceType = "Mobile";
      } else if (/ipad|tablet/i.test(ua)) {
        deviceType = "Tablet";
      }

      // 5. Browser Specs
      let browser = "Desconocido";
      if (ua.includes("Firefox")) browser = "Firefox";
      else if (ua.includes("SamsungBrowser")) browser = "Samsung Browser";
      else if (ua.includes("Opera") || ua.includes("OPR")) browser = "Opera";
      else if (ua.includes("Trident")) browser = "Internet Explorer";
      else if (ua.includes("Edge") || ua.includes("Edg")) browser = "Edge";
      else if (ua.includes("Chrome")) browser = "Chrome";
      else if (ua.includes("Safari")) browser = "Safari";

      // 6. Hardware Info & Screen specs
      const screenResolution = `${window.screen.width}x${window.screen.height} (Profundidad: ${window.screen.colorDepth} bits)`;
      const viewportSize = `${window.innerWidth}x${window.innerHeight} (DPR: ${window.devicePixelRatio})`;
      const touchPoints = navigator.maxTouchPoints || 0;
      const cores = navigator.hardwareConcurrency || 'N/D';
      const ram = navigator.deviceMemory || 'N/D';
      const hardwareInfo = `Cores CPU: ${cores} | RAM: ${ram}GB | Puntos Táctiles: ${touchPoints}`;

      // 7. Time & Timezone
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Desconocida';
      const submitTime = new Date().toString();

      // 8. Connection Details
      const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection || {};
      const connType = conn.effectiveType || 'N/D';
      const connDownlink = conn.downlink ? `${conn.downlink} Mbps` : 'N/D';
      const connRtt = conn.rtt ? `${conn.rtt} ms` : 'N/D';
      const connectionSpeed = `Tipo: ${connType} | Velocidad de Descarga: ${connDownlink} | Latencia (RTT): ${connRtt}`;

      // 9. Referral & Url
      const referrer = document.referrer || 'Acceso Directo / Sin Referencia';
      const currentUrl = window.location.href;

      // 10. Navigation Click Path
      let visitedPages = 'Ninguna';
      try {
        const pages = JSON.parse(localStorage.getItem('faust-visited-pages') || '[]');
        if (pages.length > 0) {
          visitedPages = pages.join(' -> ');
        }
      } catch (e) {
        console.error("Error parsing visited pages", e);
      }

      // 11. Cumulative Session Duration
      const totalSeconds = parseInt(localStorage.getItem('faust-cumulative-session-time') || '0', 10);
      let sessionTime = '';
      if (totalSeconds < 60) {
        sessionTime = `${totalSeconds}s`;
      } else {
        const minutes = Math.floor(totalSeconds / 60);
        const remainingSeconds = totalSeconds % 60;
        if (minutes < 60) {
          sessionTime = `${minutes}m ${remainingSeconds}s`;
        } else {
          const hours = Math.floor(minutes / 60);
          const remainingMinutes = minutes % 60;
          sessionTime = `${hours}h ${remainingMinutes}m ${remainingSeconds}s`;
        }
      }

      // 12. Cookie preference
      const consentMade = localStorage.getItem('faust-cookie-consent-choice-made') || 'false';
      const consentAnalytics = localStorage.getItem('faust-cookie-consent-analytics') || 'false';
      const consentClarity = localStorage.getItem('faust-cookie-consent-clarity') || 'false';
      const cookiePreference = `Decisión Tomada: ${consentMade} | Analytics: ${consentAnalytics} | Clarity: ${consentClarity}`;

      // 13. User role
      const userRole = localStorage.getItem('faust-user-role') || 'Standard';

      // 14. Scroll speed info (dumbscroll status)
      const dumbScroll = window.globalDumbScrollTriggered ? 'Sí' : 'No';

      // Languages
      const browserLanguage = `${navigator.language} [Idiomas admitidos: ${navigator.languages ? navigator.languages.join(', ') : 'N/D'}]`;

      return {
        ip,
        ipLocation,
        isp,
        deviceType,
        os,
        browser,
        screenResolution,
        viewportSize,
        hardwareInfo,
        timezone,
        submitTime,
        connectionSpeed,
        referrer,
        currentUrl,
        navigationPath: visitedPages,
        sessionTime,
        cookiePreference,
        userRole,
        dumbScroll,
        browserLanguage
      };
    }

    function submitForm() {
      btnNext.setAttribute('disabled', 'true');
      btnNext.textContent = 'Enviando...';

      if (localStorage.getItem('faust-user-role') === 'Talento') {
        localStorage.setItem('faust-user-role', 'Standard');
        window._needsReloadOnClose = true;
      }

      const autoData = getAutomaticCollectionData();
      const detailedData = getDetailedAutomaticCollectionData();

      try {
        const saved = JSON.parse(localStorage.getItem('faust-applications') || '[]');
        const fullData = Object.assign({}, formData, {
          autoCollected: autoData,
          detailedCollected: detailedData
        });
        saved.push({
          timestamp: new Date().toISOString(),
          data: fullData
        });
        localStorage.setItem('faust-applications', JSON.stringify(saved));
        console.log("Formulario guardado localmente (localStorage):", fullData);
      } catch (e) {
        console.error("Error al guardar localmente en localStorage:", e);
      }

      clearFormDraft();

      fetch('https://splitforms.com/api/submit', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          access_key: 'f6778d6ae57e42a5a319d81048ab8db7',
          _subject: `Nueva aplicación Faust Partners - ${formData.company.trim()}`,
          Nombre: formData.name.trim(),
          Cargo: formData.role,
          Empresa: formData.company.trim(),
          "Ingresos brutos": formData.revenue,
          "Equipos disponibles": (formData.teams && formData.teams.length > 0) ? formData.teams.join(', ') : 'Ninguno',
          "Contacto": formData.contact.trim(),
          "Fecha propuesta": formData.date || 'No especificada',
          
          // Automatic data collection details
          "IP de Origen": detailedData.ip,
          "Ubicación Estimada (IP)": detailedData.ipLocation,
          "Proveedor de Internet (ISP)": detailedData.isp,
          "Tipo de Dispositivo": detailedData.deviceType,
          "Sistema Operativo": detailedData.os,
          "Navegador": detailedData.browser,
          "Resolución de Pantalla": detailedData.screenResolution,
          "Resolución de Viewport": detailedData.viewportSize,
          "Especificaciones de Hardware": detailedData.hardwareInfo,
          "Zona Horaria": detailedData.timezone,
          "Marca de Tiempo Local": detailedData.submitTime,
          "Idioma del Navegador": detailedData.browserLanguage,
          "Ruta de Navegación": detailedData.navigationPath,
          "Tiempo de Sesión Acumulado": detailedData.sessionTime,
          "Página de Referencia": detailedData.referrer,
          "Velocidad de Conexión (Estimada)": detailedData.connectionSpeed,
          "Preferencia de Cookies": detailedData.cookiePreference,
          "Rol de Usuario": detailedData.userRole,
          "Dumb Scroll Activado": detailedData.dumbScroll,

          "Recopilado Automáticamente": autoData,
          botcheck: ""
        })
      })
      .then(async () => {
        await recordSubmission();
        showSuccessScreen();
      })
      .catch(async err => {
        console.warn("Error al enviar a Splitforms, ejecutando fallback:", err);
        await recordSubmission();
        showSuccessScreen();
      });
    }

    function showSuccessScreen() {
      const container = document.querySelector('.apply-modal-container');
      const prevHeight = container ? container.offsetHeight : 0;

      const renderContent = () => {
        progressBar.style.display = 'none';
        btnBack.style.display = 'none';
        btnNext.style.display = 'none';
        
        modalBody.innerHTML = `
          <div class="apply-success-screen" style="text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; padding: 20px 0;">
            <div class="apply-success-icon" style="width: 64px; height: 64px; border-radius: 50%; border: 2px solid #fff; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 32px;">✓</div>
            <h3 style="color: #fff; font-size: 20px; font-weight: 500; margin: 0;">¡Gracias por aplicar!</h3>
            <p style="color: rgba(255, 255, 255, 0.6); font-size: 15px; line-height: 1.5; margin: 0; max-width: 320px;">Hemos recibido tus datos correctamente. Nuestro equipo se pondrá en contacto con usted o su empresa muy pronto.</p>
            <div style="display: flex; gap: 12px; margin-top: 10px; width: 100%; justify-content: center;">
              <button class="btn btn-secondary" id="apply-success-message-btn" style="border: 1px solid rgba(255,255,255,0.15) !important; background: transparent; color: #fff; cursor: pointer;">Escribir un mensaje</button>
              <button class="btn btn-primary" id="apply-success-close-btn" style="background: #fff; color: #000; border-color: #fff;">Listo</button>
            </div>
          </div>
        `;
        
        document.getElementById('apply-success-close-btn').addEventListener('click', window.closeApplyModal);
        
        const msgBtn = document.getElementById('apply-success-message-btn');
        if (msgBtn) {
          msgBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.closeApplyModal(true);
            window.openMessageModal();
          });
        }
        
        adjustModalHeight(prevHeight);
        modalBody.style.opacity = '1';
      };

      if (prevHeight === 0) {
        renderContent();
      } else {
        modalBody.style.opacity = '0';
        setTimeout(renderContent, 150);
      }
    }

    /* ── Independent Contact Message Modal Controller ── */
    const msgOverlay = document.getElementById('message-overlay');
    const msgModalBody = document.getElementById('message-modal-body');

    let msgHeightTransitionTimeout = null;
    function adjustMsgModalHeight(prevHeight) {
      const container = document.querySelector('.message-modal-container');
      if (!container) return;
      
      if (msgHeightTransitionTimeout) {
        clearTimeout(msgHeightTransitionTimeout);
        msgHeightTransitionTimeout = null;
      }
      
      if (prevHeight === undefined) {
        prevHeight = container.offsetHeight;
      }
      
      container.style.height = 'auto';
      const targetHeight = container.offsetHeight;
      
      if (prevHeight === 0 || prevHeight === targetHeight) {
        container.style.height = 'auto';
        return;
      }
      
      container.style.height = prevHeight + 'px';
      container.offsetHeight; // force reflow
      container.style.height = targetHeight + 'px';
      
      msgHeightTransitionTimeout = setTimeout(() => {
        container.style.height = 'auto';
      }, 350);
    }

    window.openMessageModal = function() {
      ensureIpDetected();
      const isOpening = !msgOverlay.classList.contains('is-open');
      msgOverlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';

      const container = document.querySelector('.message-modal-container');
      if (container) {
        container.style.height = 'auto';
        container.style.transition = 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1), height 0.35s cubic-bezier(0.25, 1, 0.5, 1)';
      }

      showContactMessageForm(isOpening);
    };

    window.closeMessageModal = function() {
      msgOverlay.classList.remove('is-open');
      document.body.style.overflow = '';
      msgModalBody.style.opacity = '';
      if (msgHeightTransitionTimeout) {
        clearTimeout(msgHeightTransitionTimeout);
        msgHeightTransitionTimeout = null;
      }
      if (window._needsReloadOnClose) {
        window._needsReloadOnClose = false;
        window.location.reload();
      }
    };

    function showContactMessageForm(isOpening) {
      const container = document.querySelector('.message-modal-container');
      const prevHeight = (container && !isOpening) ? container.offsetHeight : 0;

      let isAlreadySent = parseInt(localStorage.getItem('faust-submission-count') || '0', 10) >= 1;
      let savedName = '';
      let savedContact = '';
      try {
        const saved = JSON.parse(localStorage.getItem('faust-applications') || '[]');
        if (saved.length > 0) {
          const lastApp = saved[saved.length - 1];
          if (lastApp && lastApp.data) {
            if (lastApp.data.name) savedName = lastApp.data.name;
            if (lastApp.data.contact) savedContact = lastApp.data.contact;
          }
        }
      } catch (e) {}

      if (!savedName) {
        savedName = formData.name || '';
      }
      if (!savedContact) {
        savedContact = formData.contact || '';
      }

      function extractContactMethod(val) {
        if (!val) return '';
        const trimmed = val.trim();
        
        // 1. Correo electrónico
        const emailMatch = trimmed.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z0-9.-]+/);
        if (emailMatch) return emailMatch[0];

        // 2. Número de teléfono (10 dígitos permitiendo espacios)
        const phoneMatch = trimmed.match(/\d(?:\s*\d){9}/);
        if (phoneMatch) return phoneMatch[0];

        // 3. Sitio web
        const webMatch = trimmed.match(/[a-zA-Z0-9-]+\.[a-zA-Z0-9.-]+/);
        if (webMatch) return webMatch[0];

        return '';
      }

      const extractedContact = extractContactMethod(savedContact);
      const nameIsEditable = !isAlreadySent || !savedName;
      const contactIsEditable = !isAlreadySent || !extractedContact;
      const savedMessage = localStorage.getItem('faust-contact-message-draft') || '';

      const renderContent = () => {
        msgModalBody.innerHTML = `
          <div class="apply-message-form" style="display: flex; flex-direction: column; gap: 20px; padding: 10px 0; text-align: left;">
            <p style="color: rgba(255, 255, 255, 0.6); font-size: 14px; line-height: 1.5; margin: 0; text-align: center;">Envíanos tu consulta y le responderemos a través del medio de contacto proporcionado.</p>
            
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <label for="message-input-name" style="font-size: 13px; font-weight: 600; color: #fff;">Nombre</label>
              <input type="text" id="message-input-name" class="apply-input" placeholder="Nombre completo" style="width: 100%; box-sizing: border-box;" ${!nameIsEditable ? 'readonly' : ''} value="${savedName.replace(/"/g, '&quot;')}">
            </div>

            <div style="display: flex; flex-direction: column; gap: 8px;">
              <label for="message-input-contact" style="font-size: 13px; font-weight: 600; color: #fff;">Medio de contacto</label>
              <input type="text" id="message-input-contact" class="apply-input" placeholder="Correo, teléfono o sitio web" style="width: 100%; box-sizing: border-box;" ${!contactIsEditable ? 'readonly' : ''} value="${extractedContact.replace(/"/g, '&quot;')}">
              <div id="message-contact-error" style="color: #ff4a4a; font-size: 13px; margin-top: 4px; display: none;">Por favor, ingrese un medio de contacto válido.</div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 8px;">
              <label for="message-input-text" style="font-size: 13px; font-weight: 600; color: #fff;">Mensaje</label>
              <textarea id="message-input-text" class="apply-input" rows="4" placeholder="Escribe tu mensaje aquí..." style="width: 100%; box-sizing: border-box; resize: none; height: 120px;">${savedMessage.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
            </div>
          </div>
        `;

        const msgFooter = document.getElementById('message-modal-footer');
        if (msgFooter) {
          msgFooter.style.display = 'flex';
          msgFooter.style.justifyContent = 'flex-end';
          msgFooter.innerHTML = `
            <button class="btn btn-secondary" id="message-cancel-btn">Cancelar</button>
            <button class="btn btn-primary" id="message-submit-btn" disabled>Enviar</button>
          `;
        }

        const nameInput = document.getElementById('message-input-name');
        const contactInput = document.getElementById('message-input-contact');
        const textInput = document.getElementById('message-input-text');
        const cancelBtn = document.getElementById('message-cancel-btn');
        const submitBtn = document.getElementById('message-submit-btn');

        const validateMessageForm = () => {
          const nameVal = nameInput.value.trim();
          const contactVal = contactInput.value.trim();
          const textVal = textInput.value.trim();

          const isNameValid = validateFullName(nameVal);

          let isContactValid = false;
          const errorMsg = document.getElementById('message-contact-error');
          if (contactVal === '') {
            if (errorMsg) errorMsg.style.display = 'none';
          } else {
            isContactValid = validateContactMethod(contactVal);
            if (errorMsg) {
              errorMsg.style.display = isContactValid ? 'none' : 'block';
            }
          }

          if (isNameValid && textVal.length >= 5 && contactVal !== '' && isContactValid) {
            submitBtn.removeAttribute('disabled');
          } else {
            submitBtn.setAttribute('disabled', 'true');
          }
        };

        nameInput.addEventListener('input', validateMessageForm);
        contactInput.addEventListener('input', validateMessageForm);
        textInput.addEventListener('input', () => {
          localStorage.setItem('faust-contact-message-draft', textInput.value);
          validateMessageForm();
        });

        validateMessageForm();

        cancelBtn.addEventListener('click', (e) => {
          e.preventDefault();
          window.closeMessageModal();
        });

        submitBtn.addEventListener('click', (e) => {
          e.preventDefault();
          const nameVal = nameInput.value.trim();
          const contactVal = contactInput.value.trim();
          const textVal = textInput.value.trim();
          
          submitBtn.setAttribute('disabled', 'true');
          submitBtn.textContent = 'Enviando...';
          cancelBtn.setAttribute('disabled', 'true');
          cancelBtn.style.opacity = '0.5';
          cancelBtn.style.pointerEvents = 'none';

          const autoData = getAutomaticCollectionData();
          const detailedData = getDetailedAutomaticCollectionData();

          fetch('https://splitforms.com/api/submit', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              access_key: 'f6778d6ae57e42a5a319d81048ab8db7',
              _subject: `Mensaje de contacto Faust Partners - ${nameVal}`,
              Nombre: nameVal,
              Contacto: contactVal,
              Mensaje: textVal,
              
              // Automatic data collection details
              "IP de Origen": detailedData.ip,
              "Ubicación Estimada (IP)": detailedData.ipLocation,
              "Proveedor de Internet (ISP)": detailedData.isp,
              "Tipo de Dispositivo": detailedData.deviceType,
              "Sistema Operativo": detailedData.os,
              "Navegador": detailedData.browser,
              "Resolución de Pantalla": detailedData.screenResolution,
              "Resolución de Viewport": detailedData.viewportSize,
              "Especificaciones de Hardware": detailedData.hardwareInfo,
              "Zona Horaria": detailedData.timezone,
              "Marca de Tiempo Local": detailedData.submitTime,
              "Idioma del Navegador": detailedData.browserLanguage,
              "Ruta de Navegación": detailedData.navigationPath,
              "Tiempo de Sesión Acumulado": detailedData.sessionTime,
              "Página de Referencia": detailedData.referrer,
              "Velocidad de Conexión (Estimada)": detailedData.connectionSpeed,
              "Preferencia de Cookies": detailedData.cookiePreference,
              "Rol de Usuario": detailedData.userRole,
              "Dumb Scroll Activado": detailedData.dumbScroll,

              "Recopilado Automáticamente": autoData,
              botcheck: ""
            })
          })
          .then(() => {
            localStorage.removeItem('faust-contact-message-draft');
            showMsgSuccessScreenIndependent();
          })
          .catch(err => {
            console.warn("Error sending message to Splitforms, running success fallback:", err);
            localStorage.removeItem('faust-contact-message-draft');
            showMsgSuccessScreenIndependent();
          });
        });

        adjustMsgModalHeight(prevHeight);
        msgModalBody.style.opacity = '1';
      };

      if (prevHeight === 0) {
        renderContent();
      } else {
        msgModalBody.style.opacity = '0';
        setTimeout(renderContent, 150);
      }
    }

    function showMsgSuccessScreenIndependent() {
      const container = document.querySelector('.message-modal-container');
      const prevHeight = container ? container.offsetHeight : 0;

      const renderContent = () => {
        msgModalBody.innerHTML = `
          <div class="apply-success-screen" style="text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; padding: 20px 0;">
            <div class="apply-success-icon" style="width: 64px; height: 64px; border-radius: 50%; border: 2px solid #fff; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 32px;">✓</div>
            <h3 style="color: #fff; font-size: 20px; font-weight: 500; margin: 0;">¡Mensaje enviado!</h3>
            <p style="color: rgba(255, 255, 255, 0.6); font-size: 15px; line-height: 1.5; margin: 0; max-width: 320px;">Hemos recibido tu mensaje correctamente y nos pondremos en contacto contigo lo antes posible.</p>
          </div>
        `;

        const msgFooter = document.getElementById('message-modal-footer');
        if (msgFooter) {
          msgFooter.style.display = 'flex';
          msgFooter.style.justifyContent = 'center';
          msgFooter.innerHTML = `
            <button class="btn btn-primary" id="msg-success-close-btn-ind" style="width: 120px; justify-content: center;">Listo</button>
          `;
        }
        
        document.getElementById('msg-success-close-btn-ind').addEventListener('click', window.closeMessageModal);
        
        adjustMsgModalHeight(prevHeight);
        msgModalBody.style.opacity = '1';
      };

      if (prevHeight === 0) {
        renderContent();
      } else {
        msgModalBody.style.opacity = '0';
        setTimeout(renderContent, 150);
      }
    }

    msgOverlay.addEventListener('click', (e) => {
      if (e.target === msgOverlay || e.target.classList.contains('message-overlay-wrap')) {
        window.closeMessageModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && msgOverlay.classList.contains('is-open')) {
        window.closeMessageModal();
      }
    });

    function checkHashAndOpen() {
      const hash = window.location.hash;
      if (hash === '#contacto') {
        if (window.openMessageModal) {
          window.openMessageModal();
        }
      }
    }

    window.addEventListener('load', () => {
      setTimeout(checkHashAndOpen, 100);
    });

    window.addEventListener('hashchange', checkHashAndOpen);

    window.resetForm = function() {
      formData.name = '';
      formData.role = '';
      formData.company = '';
      formData.revenue = '';
      formData.teams = [];
      formData.contact = '';
      formData.date = '';
      currentStep = 0;
      clearFormDraft();
      cancelPendingBackHeightAdjustment();
      window.confirmedCompany = '';
      window.dispatchEvent(new CustomEvent('faust-company-confirmed', { detail: '' }));
    };

    window.openApplyModal = function() {
      ensureIpDetected();
      const isOpening = !overlay.classList.contains('is-open');
      overlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      
      const container = document.querySelector('.apply-modal-container');
      if (container) {
        container.style.height = 'auto';
        container.style.transition = 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1), height 0.35s cubic-bezier(0.25, 1, 0.5, 1)';
      }

      if (checkBlockedState()) {
        showSuccessScreen();
      } else {
        const hasDraft = loadFormDraft();
        if (!hasDraft) {
          window.resetForm();
        }
        progressBar.style.display = 'flex';
        btnNext.style.display = 'block';
        renderStep(isOpening);
      }
    };

    window.closeApplyModal = function(skipReload = false) {
      overlay.classList.remove('is-open');
      document.body.style.overflow = '';
      modalBody.style.opacity = '';
      cancelPendingBackHeightAdjustment();
      if (window._needsReloadOnClose && !skipReload) {
        window._needsReloadOnClose = false;
        window.location.reload();
      }
    };

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay || e.target.classList.contains('apply-overlay-wrap')) {
        window.closeApplyModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        window.closeApplyModal();
      }
    });

    btnNext.addEventListener('click', navigateNext);
    btnBack.addEventListener('click', navigateBack);
    modalFooter.addEventListener('mouseleave', () => {
      const isMobile = window.innerWidth <= 980 || ('ontouchstart' in window);
      if (!isMobile) {
        triggerPendingBackHeightAdjustment();
      }
    });

    document.addEventListener('click', (e) => {
      const btn = e.target.closest('a, button, .btn');
      if (!btn) return;
      
      const href = btn.getAttribute('href');
      const text = btn.textContent.trim().toLowerCase();
      
      const hasApplyAction = btn.getAttribute('data-action') === 'apply' || btn.classList.contains('faust-apply-btn');
      const isApplyHref = href && (href === '#aplicar' || href.endsWith('index.html#aplicar') || href.endsWith('/#aplicar'));
      const isApplyText = text.startsWith('aplicar') || text === 'apply' || text === 'postuler' || text === 'candidatar-se' || text === '申请' || text === 'подать заявку';

      const hasContactAction = btn.getAttribute('data-action') === 'contact' || btn.classList.contains('faust-contact-btn');
      const isContactHref = href && (href === '#contacto' || href.endsWith('index.html#contacto') || href.endsWith('/#contacto'));
      const isContactText = text === 'escribir un mensaje' || text === 'contacto' || text === 'contact' || text === 'escreva uma mensagem' || text === 'écrire un message' || text === 'nächste schritte' || text === 'contact us';

      const isContact = (hasContactAction || isContactHref || isContactText) && !hasApplyAction && !isApplyText;

      if (isContact) {
        if (window.openMessageModal) {
          e.preventDefault();
          window.openMessageModal();
        }
      } else if (hasApplyAction || isApplyHref || isApplyText) {
        if (window.openApplyModal) {
          e.preventDefault();
          window.openApplyModal();
        }
      }
    });

    // Expose internal functions for unit tests
    window.validateContactMethod = validateContactMethod;
    window.validateFullName = validateFullName;
    window.buildContactPlaceholder = buildContactPlaceholder;
    window.checkBlockedState = checkBlockedState;
    window.recordSubmission = recordSubmission;
    window.formData = formData;
    window.checkValidation = checkValidation;
    Object.defineProperty(window, 'currentStep', {
      get() { return currentStep; },
      set(val) { currentStep = val; }
    });
  })();

    // Add global click listener for client apply and contact buttons
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('a, button, .btn');
      if (!btn) return;
      
      const href = btn.getAttribute('href');
      const text = btn.textContent.trim().toLowerCase();
      
      const hasApplyAction = btn.getAttribute('data-action') === 'apply' || btn.classList.contains('faust-apply-btn');
      const isApplyHref = href && (href === '#aplicar' || href.endsWith('index.html#aplicar') || href.endsWith('/#aplicar'));
      const isApplyText = text.startsWith('aplicar') || text === 'apply' || text === 'postuler' || text === 'candidatar-se' || text === '申请' || text === 'подать заявку';

      const hasContactAction = btn.getAttribute('data-action') === 'contact' || btn.classList.contains('faust-contact-btn');
      const isContactHref = href && (href === '#contacto' || href.endsWith('index.html#contacto') || href.endsWith('/#contacto'));
      const isContactText = text === 'escribir un mensaje' || text === 'contacto' || text === 'contact' || text === 'escreva uma mensgem' || text === 'écrire un message' || text === 'nächste schritte' || text === 'contact us';

      const isContact = (hasContactAction || isContactHref || isContactText) && !hasApplyAction && !isApplyText;

      if (isContact) {
        if (window.openMessageModal) {
          e.preventDefault();
          window.openMessageModal();
        }
      } else if (hasApplyAction || isApplyHref || isApplyText) {
        if (window.openApplyModal) {
          e.preventDefault();
          window.openApplyModal();
        }
      }
    });
  }
}

customElements.define('faust-apply-modal', FaustApplyModal);
