// form.js
document.addEventListener('DOMContentLoaded', () => {
  const intro = document.getElementById('content-intro');
  const step1 = document.getElementById('content-step1');
  const step2 = document.getElementById('content-step2');
  const step3 = document.getElementById('content-step3');
  const step4 = document.getElementById('content-step4');
  const step5 = document.getElementById('content-step5');
  const loader = document.getElementById('content-loader');
  
  const progressSeg1 = document.getElementById('seg-1');
  const progressSeg2 = document.getElementById('seg-2');
  const progressSeg3 = document.getElementById('seg-3');
  const progressSeg4 = document.getElementById('seg-4');
  const progressSeg5 = document.getElementById('seg-5');

  // Shared Next button (lives outside any animated step container)
  let btn = document.getElementById('btn-next');
  let isTransitioning = false;

  // Replace the button node to clear previous listeners, then bind a new one
  function rebind(visible, handler) {
    const fresh = btn.cloneNode(true);
    btn.parentNode.replaceChild(fresh, btn);
    btn = fresh;
    btn.style.display = visible ? 'flex' : 'none';
    if (visible) {
      btn.classList.remove('is-visible');
      void btn.offsetWidth;
      setTimeout(() => btn.classList.add('is-visible'), 40);
    }
    if (handler) btn.addEventListener('click', handler);
  }

  function stageStep(step, handler) {
    isTransitioning = true;
    step.classList.remove('title-settled', 'options-revealed');
    step.classList.add('title-staged', 'active');
    setTimeout(() => {
      step.classList.add('title-settled');
    }, 2000);
    setTimeout(() => {
      step.classList.add('options-revealed');
    }, 2700);
    const optionCount = step.querySelectorAll('.form-option').length;
    const revealButtonAt = 2900 + Math.max(0, optionCount - 1) * 70;
    setTimeout(() => {
      if (!step.classList.contains('active')) return;
      isTransitioning = false;
      rebind(true, handler);
    }, revealButtonAt);
  }

  // 1. Auto-transition: Intro text -> Step 1 content
  setTimeout(() => {
    intro.classList.remove('active');
    setTimeout(() => {
      stageStep(step1, goStep2);
    }, 600);
  }, 2000);

  // 2. Select option helper
  function setupOptionsSelector(stepContainerSelector) {
    const container = document.querySelector(stepContainerSelector);
    if (!container) return;

    const options = container.querySelectorAll('.form-option');
    options.forEach(opt => {
      opt.addEventListener('click', () => {
        // Clear active styles
        options.forEach(b => {
          b.classList.remove('form-option--selected');
          const check = b.querySelector('.form-option-check');
          if (check) check.remove();
        });

        // Activate clicked option
        opt.classList.add('form-option--selected');

        // Create & append check SVG
        const checkSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        checkSVG.setAttribute("class", "form-option-check");
        checkSVG.setAttribute("width", "17");
        checkSVG.setAttribute("height", "12");
        checkSVG.setAttribute("viewBox", "0 0 17 12");
        checkSVG.setAttribute("fill", "none");
        checkSVG.innerHTML = '<path d="M0.707031 5.70715L5.70703 10.7072L15.707 0.707153" stroke="#FC2600" stroke-width="2" stroke-linejoin="round"/>';
        opt.appendChild(checkSVG);
      });
    });
  }

  setupOptionsSelector('#content-step1');
  setupOptionsSelector('#content-step2');
  setupOptionsSelector('#content-step3');
  setupOptionsSelector('#content-step4');
  setupOptionsSelector('#content-step5');

  // Generic transition between two steps
  function transition(fromStep, toStep, seg, nextHandler) {
    if (isTransitioning || !fromStep.classList.contains('active')) return;
    isTransitioning = true;
    rebind(false, null);
    if (seg) seg.classList.add('active');
    fromStep.classList.remove('active');
    setTimeout(() => {
      stageStep(toStep, nextHandler);
    }, 600);
  }

  function goStep2() { transition(step1, step2, progressSeg1, goStep3); }
  function goStep3() { transition(step2, step3, progressSeg2, goStep4); }
  function goStep4() { transition(step3, step4, progressSeg3, goStep5); }
  function goStep5() { transition(step4, step5, progressSeg4, goLoader); }
  function goLoader() {
    if (isTransitioning || !step5.classList.contains('active')) return;
    isTransitioning = true;
    rebind(false, null);
    if (progressSeg5) progressSeg5.classList.add('active');
    step5.classList.remove('active');
    // Fade out progress bar
    const progress = document.querySelector('.form-progress');
    if (progress) {
      progress.style.opacity = '0';
      setTimeout(() => { progress.style.display = 'none'; }, 400);
    }
    setTimeout(() => {
      loader.classList.add('active');
      runLoaderTimeline();
    }, 600);
  }

  // Helper to create subprogress bar inside an active block
  function addSubprogressBar(itemElement, durationSeconds) {
    const subprogress = document.createElement('div');
    subprogress.className = 'loader-subprogress';
    const fill = document.createElement('div');
    fill.className = 'loader-subprogress-fill';
    fill.style.transition = `width ${durationSeconds}s cubic-bezier(0.2, 1, 0.55, 1)`; // fast start, visible ease-out over last ~30%
    subprogress.appendChild(fill);
    itemElement.appendChild(subprogress);
    
    // Trigger fill animation after append
    setTimeout(() => {
      subprogress.classList.add('is-visible');
      fill.style.width = '100%';
    }, 50);
  }

  // Loader stage sequence animation
  function runLoaderTimeline() {
    const item1 = document.getElementById('loader-item-1');
    const item2 = document.getElementById('loader-item-2');
    const item3 = document.getElementById('loader-item-3');

    // --- STAGE 1: Block 1 Starts Loading (Duration: 1.6s) ---
    setTimeout(() => {
      item1.classList.add('loading');
      addSubprogressBar(item1, 1.6);
    }, 400);

    // --- STAGE 2: Block 1 Completed & Block 2 Starts Loading (Duration: 2.2s) ---
    setTimeout(() => {
      item1.classList.remove('loading');
      item1.querySelector('.loader-subprogress')?.remove();
      item1.classList.add('completed');
      const label1 = item1.querySelector('.form-option-label');
      if (label1) label1.textContent = "Preferencias analizadas.";

      item2.classList.add('loading');
      addSubprogressBar(item2, 2.2);
    }, 2600); // 400 + 1600 + 600

    // --- STAGE 3: Block 2 Completed & Block 3 Starts Loading (Duration: 3.0s) ---
    setTimeout(() => {
      item2.classList.remove('loading');
      item2.querySelector('.loader-subprogress')?.remove();
      item2.classList.add('completed');
      const label2 = item2.querySelector('.form-option-label');
      if (label2) label2.textContent = "Recomendaciones ajustadas.";

      item3.classList.add('loading');
      addSubprogressBar(item3, 3.0);
    }, 5400); // 2600 + 2200 + 600

    // --- STAGE 4: Block 3 Completed & Redirection ---
    setTimeout(() => {
      item3.classList.remove('loading');
      item3.querySelector('.loader-subprogress')?.remove();
      item3.classList.add('completed');
      const label3 = item3.querySelector('.form-option-label');
      if (label3) label3.textContent = "Feed organizado.";

      setTimeout(() => {
        sessionStorage.setItem('skipLoader', '1');
        window.location.href = 'index.html';
      }, 800);
    }, 9000); // 5400 + 3000 + 600
  }
});
