(function () {
  const panel = document.getElementById('side-panel');
  const panelContent = document.getElementById('side-panel-content');
  const mount = document.getElementById('plan-builder-mount');
  const stage = document.getElementById('figma-stage');
  const panelCta = document.getElementById('whatsapp-plan-cta');
  const closeBtn = document.querySelector('.side-panel-close');
  let builder = mount.querySelector('.plan-builder');
  const DESKTOP_TRANSITION_MS = 600;
  let closeSyncTimer = null;
  let closeTransitionHandler = null;
  let panelCtaAnchor = null;
  let ctaFollowRaf = 0;
  let ctaBlueTimer = null;
  let ctaBlueTransitionHandler = null;

  const navbar = document.getElementById('desktop-navbar');
  const navbarTalkBtn = document.querySelector('#desktop-navbar .navbar-talk-btn');
  const heroSection = document.querySelector('.hero-viewport');

  function isSidebarClosed() {
    return !document.body.classList.contains('pushed-layout')
      && !document.body.classList.contains('sidebar-closing');
  }

  function isHeroFocused() {
    if (!heroSection) return false;
    const rect = heroSection.getBoundingClientRect();
    const viewportH = window.innerHeight || document.documentElement.clientHeight || 0;
    if (!viewportH) return false;
    if (rect.bottom <= 0 || rect.top >= viewportH) return false;
    const heroCenter = rect.top + (rect.height / 2);
    const viewportCenter = viewportH / 2;
    return Math.abs(heroCenter - viewportCenter) <= (viewportH * 0.28);
  }

  function syncNavbarTalkBlueState() {
    if (!navbarTalkBtn) return;
    if (window.innerWidth < 1024) {
      navbarTalkBtn.classList.remove('navbar-talk-blue');
      return;
    }
    const shouldBeBlue = isSidebarClosed() && !isHeroFocused();
    navbarTalkBtn.classList.toggle('navbar-talk-blue', shouldBeBlue);
  }

  function clearCloseSyncState() {
    if (closeSyncTimer) {
      clearTimeout(closeSyncTimer);
      closeSyncTimer = null;
    }
    if (closeTransitionHandler) {
      panel.removeEventListener('transitionend', closeTransitionHandler);
      closeTransitionHandler = null;
    }
    document.body.classList.remove('sidebar-closing');
  }

  function clearCtaBlueSchedule() {
    if (ctaBlueTimer) {
      clearTimeout(ctaBlueTimer);
      ctaBlueTimer = null;
    }
    if (ctaBlueTransitionHandler) {
      panel.removeEventListener('transitionend', ctaBlueTransitionHandler);
      ctaBlueTransitionHandler = null;
    }
  }

  function activateFloatingCtaBlue() {
    if (!panelCta) return;
    if (!panelCta.classList.contains('side-panel-floating-cta')) return;
    if (!document.body.classList.contains('pushed-layout')) return;
    if (document.body.classList.contains('sidebar-closing')) return;
    panelCta.classList.add('is-blue');
  }

  function scheduleFloatingCtaBlueAfterOpen() {
    if (!panelCta) return;
    clearCtaBlueSchedule();

    ctaBlueTransitionHandler = function (event) {
      if (event.target !== panel || event.propertyName !== 'transform') return;
      activateFloatingCtaBlue();
      clearCtaBlueSchedule();
    };
    panel.addEventListener('transitionend', ctaBlueTransitionHandler);

    ctaBlueTimer = setTimeout(function () {
      activateFloatingCtaBlue();
      clearCtaBlueSchedule();
    }, DESKTOP_TRANSITION_MS + 80);
  }

  function updateFloatingCtaPosition() {
    if (!panelCta || !panelCta.classList.contains('side-panel-floating-cta')) return;
    const rect = panel.getBoundingClientRect();
    const right = (window.innerWidth - rect.right) + 32;
    const bottom = Math.max(0, window.innerHeight - rect.bottom) + 24;
    const width = Math.max(0, rect.width - 64);
    panelCta.style.setProperty('--side-cta-right', right + 'px');
    panelCta.style.setProperty('--side-cta-bottom', bottom + 'px');
    panelCta.style.setProperty('--side-cta-width', width + 'px');
  }

  function shouldFollowCta() {
    return panelCta
      && panelCta.classList.contains('side-panel-floating-cta')
      && (document.body.classList.contains('pushed-layout') || document.body.classList.contains('sidebar-closing'));
  }

  function stopFollowingCta() {
    if (!ctaFollowRaf) return;
    cancelAnimationFrame(ctaFollowRaf);
    ctaFollowRaf = 0;
  }

  function followCtaFrame() {
    if (!shouldFollowCta()) {
      ctaFollowRaf = 0;
      return;
    }
    updateFloatingCtaPosition();
    ctaFollowRaf = requestAnimationFrame(followCtaFrame);
  }

  function startFollowingCta() {
    if (ctaFollowRaf) return;
    ctaFollowRaf = requestAnimationFrame(followCtaFrame);
  }

  function mountFloatingCta() {
    if (!panelCta || window.innerWidth < 1024) return;
    const wasFloating = panelCta.classList.contains('side-panel-floating-cta');
    if (panelCta.parentNode !== document.body) {
      panelCtaAnchor = document.createElement('span');
      panelCtaAnchor.style.display = 'none';
      panelCta.parentNode.insertBefore(panelCtaAnchor, panelCta);
      document.body.appendChild(panelCta);
    }
    if (!wasFloating) {
      panelCta.classList.add('side-panel-floating-cta');
      panelCta.classList.remove('is-blue');
      scheduleFloatingCtaBlueAfterOpen();
    }
    updateFloatingCtaPosition();
    startFollowingCta();
  }

  function unmountFloatingCta() {
    if (!panelCta) return;
    clearCtaBlueSchedule();
    stopFollowingCta();
    panelCta.classList.remove('is-blue');
    panelCta.classList.remove('side-panel-floating-cta');
    panelCta.style.removeProperty('--side-cta-right');
    panelCta.style.removeProperty('--side-cta-bottom');
    panelCta.style.removeProperty('--side-cta-width');
    if (panelCta.parentNode === document.body) {
      if (panelCtaAnchor && panelCtaAnchor.parentNode) {
        panelCtaAnchor.parentNode.insertBefore(panelCta, panelCtaAnchor);
      } else if (builder) {
        builder.appendChild(panelCta);
      } else if (mount) {
        mount.appendChild(panelCta);
      }
    }
    if (panelCtaAnchor) {
      panelCtaAnchor.remove();
      panelCtaAnchor = null;
    }
  }

  function syncFloatingCta() {
    const isDesktop = window.innerWidth >= 1024;
    const isSidebarOpen = document.body.classList.contains('pushed-layout') || document.body.classList.contains('sidebar-closing');
    if (isDesktop && isSidebarOpen) {
      mountFloatingCta();
    } else {
      unmountFloatingCta();
    }
  }

  function positionNavbar() {
    if (!navbar) return;
    navbar.style.removeProperty('left');
    navbar.style.removeProperty('width');
    navbar.style.removeProperty('transform');
  }

  function syncLayout() {
    const isDesktop = window.innerWidth >= 1024;
    if (isDesktop) {
      if (!panelContent.contains(builder)) {
        panelContent.appendChild(builder);
      }
    } else {
      if (!mount.contains(builder)) {
        mount.appendChild(builder);
      }
      clearCloseSyncState();
      document.body.classList.remove('pushed-layout');
    }
    positionNavbar();
    syncFloatingCta();
    syncNavbarTalkBlueState();
  }

  function scrollToForm() {
    const target = document.getElementById('comienza-aqui');
    if (!target) return;
    smoothScrollTo(target);
  }

  function getWindowScrollTop() {
    return window.pageYOffset || document.documentElement.scrollTop || 0;
  }

  function setWindowScrollTopInstant(top) {
    window.scrollTo({
      top: top,
      left: 0,
      behavior: 'auto'
    });
  }

  function openSidebar() {
    if (window.innerWidth >= 1024) {
      unlockDesktopSnap();
      clearCloseSyncState();
      const usingStageScroll = isStageScrollMode();
      const scrollPos = usingStageScroll
        ? stage.scrollTop
        : getWindowScrollTop();
      document.body.classList.add('pushed-layout');
      requestAnimationFrame(() => {
        setWindowScrollTopInstant(0);
        stage.scrollTop = scrollPos;
        positionNavbar();
        syncFloatingCta();
        syncNavbarTalkBlueState();
      });
      return;
    }
    scrollToForm();
  }

  function closeSidebar() {
    if (document.body.classList.contains('pushed-layout')) {
      unlockDesktopSnap();
      const scrollPos = stage.scrollTop;
      clearCloseSyncState();
      document.body.classList.add('sidebar-closing');
      document.body.classList.remove('pushed-layout');
      requestAnimationFrame(() => {
        stage.scrollTop = scrollPos;
      });

      const finalizeClose = () => {
        if (!document.body.classList.contains('sidebar-closing')) return;
        clearCloseSyncState();
        setWindowScrollTopInstant(scrollPos);
        positionNavbar();
        syncFloatingCta();
        syncNavbarTalkBlueState();
      };

      closeTransitionHandler = (event) => {
        if (event.target !== panel || event.propertyName !== 'transform') return;
        finalizeClose();
      };

      panel.addEventListener('transitionend', closeTransitionHandler);
      closeSyncTimer = setTimeout(finalizeClose, DESKTOP_TRANSITION_MS + 120);
    }
    positionNavbar();
    syncFloatingCta();
    syncNavbarTalkBlueState();
  }

  // Forward scroll events from stage to window if they are needed for animations
  stage.addEventListener('scroll', function() {
    if (window.innerWidth >= 1024 || document.body.classList.contains('pushed-layout') || document.body.classList.contains('sidebar-closing')) {
      // Create a fake scroll event on window so reveal animations etc still work if they listen on window
      window.dispatchEvent(new Event('scroll'));
    }
  });

  // Initial sync
  syncLayout();
  window.addEventListener('resize', syncLayout);
  window.addEventListener('resize', updateFloatingCtaPosition);
  window.addEventListener('resize', syncNavbarTalkBlueState);
  window.addEventListener('scroll', syncNavbarTalkBlueState, { passive: true });

  // Intercept CTA clicks: desktop opens sidebar, mobile/tablet smooth-scrolls to form
  document.querySelectorAll('a[href="#comienza-aqui"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      openSidebar();
    });
  });

  closeBtn.addEventListener('click', closeSidebar);

  // Close on ESC
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeSidebar();
  });

  // Existing smooth scroll for OTHER anchors
  function smoothScrollTo(targetEl) {
    if (!targetEl) return;
    var headerOffset = 120;
    var elementPosition = targetEl.getBoundingClientRect().top;
    var offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    if (anchor.getAttribute('href') === '#comienza-aqui') return; // handled above
    anchor.addEventListener('click', function (e) {
      var id = this.getAttribute('href');
      if (id === '#') return;
      var target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        smoothScrollTo(target);
      }
    });
  });

  // Desktop section snap fallback (stabilized)
  const DESKTOP_SNAP_BREAKPOINT = 1024;
  const DESKTOP_SNAP_LOCK_MS = 540;
  const DESKTOP_SNAP_TOP_OFFSET_PX = 176;
  const DESKTOP_SNAP_EDGE_TOLERANCE_PX = 6;
  let desktopSnapLocked = false;
  let desktopSnapLockTimer = null;

  function isDesktopSnapEnabled() {
    return window.innerWidth >= DESKTOP_SNAP_BREAKPOINT;
  }

  function isStageScrollMode() {
    return window.innerWidth >= DESKTOP_SNAP_BREAKPOINT;
  }

  function getActiveSnapScroller() {
    return isStageScrollMode() ? stage : window;
  }

  function getScrollerTop(scroller) {
    return scroller === window
      ? (window.pageYOffset || document.documentElement.scrollTop || 0)
      : scroller.scrollTop;
  }

  function getScrollerViewportHeight(scroller) {
    return scroller === window ? window.innerHeight : scroller.clientHeight;
  }

  function getDesktopSnapSections() {
    return Array.from(document.querySelectorAll('.hero-viewport, .desktop-flow-section, .desktop-tail-snap-start'))
      .filter(section => section && section.offsetParent !== null);
  }

  function getSectionTop(section, scroller) {
    if (scroller === window) {
      return section.getBoundingClientRect().top + (window.pageYOffset || document.documentElement.scrollTop || 0);
    }
    const scrollerRect = scroller.getBoundingClientRect();
    const sectionRect = section.getBoundingClientRect();
    return (sectionRect.top - scrollerRect.top) + scroller.scrollTop;
  }

  function getSectionSnapTop(section, scroller) {
    const rawTop = getSectionTop(section, scroller);
    return Math.max(0, rawTop - DESKTOP_SNAP_TOP_OFFSET_PX);
  }

  function getActiveSectionIndex(sections, scroller) {
    const currentTop = getScrollerTop(scroller);
    const reference = currentTop + DESKTOP_SNAP_TOP_OFFSET_PX + 1;
    let activeIndex = 0;

    for (let index = 0; index < sections.length; index += 1) {
      const sectionTop = getSectionTop(sections[index], scroller);
      if (sectionTop <= reference) {
        activeIndex = index;
        continue;
      }
      break;
    }

    return activeIndex;
  }

  function smoothScrollScrollerTo(scroller, top) {
    if (scroller === window) {
      window.scrollTo({
        top: top,
        behavior: 'smooth'
      });
      return;
    }
    scroller.scrollTo({
      top: top,
      behavior: 'smooth'
    });
  }

  function unlockDesktopSnap() {
    if (desktopSnapLockTimer) {
      clearTimeout(desktopSnapLockTimer);
      desktopSnapLockTimer = null;
    }
    desktopSnapLocked = false;
  }

  function lockDesktopSnapTemporarily() {
    unlockDesktopSnap();
    desktopSnapLocked = true;
    desktopSnapLockTimer = setTimeout(unlockDesktopSnap, DESKTOP_SNAP_LOCK_MS);
  }

  function shouldSkipSnapForTarget(target) {
    const element = target && target.nodeType === 1
      ? target
      : (target && target.parentElement ? target.parentElement : null);
    if (!element || typeof element.closest !== 'function') return false;
    return !!element.closest('input, textarea, select, [contenteditable="true"], .ab-flow-main, .side-panel');
  }

  function handleDesktopSnapWheel(event) {
    if (event.defaultPrevented) return;
    if (!isDesktopSnapEnabled()) return;
    if (event.ctrlKey || event.metaKey) return;
    if (shouldSkipSnapForTarget(event.target)) return;
    if (Math.abs(event.deltaY) < 2) return;

    const scroller = getActiveSnapScroller();
    const sections = getDesktopSnapSections();
    if (sections.length < 2) return;

    const direction = event.deltaY > 0 ? 1 : -1;
    const activeIndex = getActiveSectionIndex(sections, scroller);
    const activeSection = sections[activeIndex];
    const currentTop = getScrollerTop(scroller);
    const viewportH = getScrollerViewportHeight(scroller);
    const activeTop = getSectionTop(activeSection, scroller);
    const activeBottom = activeTop + activeSection.offsetHeight;
    const sectionNeedsInternalScroll = activeSection.offsetHeight > (viewportH + DESKTOP_SNAP_EDGE_TOLERANCE_PX);

    if (sectionNeedsInternalScroll) {
      if (direction > 0) {
        const viewportBottom = currentTop + viewportH;
        const reachedSectionEnd = viewportBottom >= (activeBottom - DESKTOP_SNAP_EDGE_TOLERANCE_PX);
        if (!reachedSectionEnd) return;
      } else {
        const reachedSectionStart = currentTop <= (activeTop - DESKTOP_SNAP_TOP_OFFSET_PX + DESKTOP_SNAP_EDGE_TOLERANCE_PX);
        if (!reachedSectionStart) return;
      }
    }

    const targetIndex = activeIndex + direction;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    if (desktopSnapLocked) return;
    event.preventDefault();
    const targetTop = getSectionSnapTop(sections[targetIndex], scroller);
    lockDesktopSnapTemporarily();
    smoothScrollScrollerTo(scroller, targetTop);
  }

  window.addEventListener('wheel', handleDesktopSnapWheel, { passive: false, capture: true });
  window.addEventListener('resize', unlockDesktopSnap);
})();
