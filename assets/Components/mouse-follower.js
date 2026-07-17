(function() {
  class FaustMouseFollower extends HTMLElement {
    connectedCallback() {
      this.style.display = 'none';
      const parent = this.parentElement;
      if (!parent) return;

      const text = this.getAttribute('text') || 'Conocer más';
      const playIcon = this.hasAttribute('play-icon');
      const openIcon = this.hasAttribute('open-icon');
      const className = this.getAttribute('class-name') || 'perk-mouse-follower';
      const activeClass = this.getAttribute('active-class') || '';
      const inactiveClass = this.getAttribute('inactive-class') || '';
      const isEnabled = () =>
        (!activeClass || parent.classList.contains(activeClass)) &&
        (!inactiveClass || !parent.classList.contains(inactiveClass));

      // Create mouse follower directly in body to avoid transform clipping context from ancestors
      let follower = document.body.querySelector(`.${className}`);
      if (!follower) {
        follower = document.createElement('div');
        follower.className = className;
        document.body.appendChild(follower);
      }

      // Track active followers globally to safely handle lifecycle cleanups
      if (!window.__activeFollowers) {
        window.__activeFollowers = {};
      }
      window.__activeFollowers[className] = (window.__activeFollowers[className] || 0) + 1;

      const getZoom = () => {
        let zoom = 1;
        if (window.innerWidth > 980) {
          const rootStyle = getComputedStyle(document.documentElement);
          const cssVar = parseFloat(rootStyle.getPropertyValue('--zoom-factor'));
          if (!isNaN(cssVar)) {
            zoom = cssVar;
          }
        }
        return zoom;
      };

      let targetX = 0;
      let targetY = 0;
      let currentX = 0;
      let currentY = 0;
      let lastMouseX = 0;
      let lastMouseY = 0;
      let isFollowing = false;
      let lerpFrameId = null;
      let zoom = getZoom();
      let parentRect = null;
      let halfW = 0;
      let halfH = 0;
      let metricsDirty = true;
      let lastColorSampleX = NaN;
      let lastColorSampleY = NaN;

      const refreshMetrics = () => {
        zoom = getZoom();
        parentRect = parent.getBoundingClientRect();
        halfW = follower.offsetWidth / 2;
        halfH = follower.offsetHeight / 2;
        metricsDirty = false;
      };

      const updateTarget = () => {
        if (metricsDirty || !parentRect) refreshMetrics();

        const parentLeft = parentRect.left / zoom;
        const parentRight = parentRect.right / zoom;
        const parentTop = parentRect.top / zoom;
        const parentBottom = parentRect.bottom / zoom;
        const pointerX = lastMouseX / zoom - halfW;
        const pointerY = lastMouseY / zoom - halfH;

        targetX = Math.max(parentLeft - halfW, Math.min(pointerX, parentRight - halfW));
        targetY = Math.max(parentTop - halfH, Math.min(pointerY, parentBottom - halfH));
      };

      const writePosition = () => {
        follower.style.setProperty('--follower-x', currentX + 'px');
        follower.style.setProperty('--follower-y', currentY + 'px');
        follower._positionX = currentX;
        follower._positionY = currentY;
      };

      const updateHoverAppearance = () => {
        // The follower lags behind the pointer, so sample the surface under the
        // follower itself rather than using the pointer event's target.
        const sampleX = (currentX + halfW) * zoom;
        const sampleY = (currentY + halfH) * zoom;
        if (
          Math.abs(sampleX - lastColorSampleX) < 0.5 &&
          Math.abs(sampleY - lastColorSampleY) < 0.5
        ) return;

        lastColorSampleX = sampleX;
        lastColorSampleY = sampleY;
        const hit = document.elementFromPoint(sampleX, sampleY);
        if (!hit || !hit.closest) return;
        follower.classList.toggle(
          'is-over-blue',
          Boolean(hit.closest('.revenue-layer, .auto-accent, .evidence-accent, .infra-top'))
        );
        follower.classList.toggle('is-over-light', Boolean(hit.closest('.perk-mobile-visual')));
      };

      const updateFollowerPosition = () => {
        if (!follower) return;

        // Stop this animation loop if this instance is no longer the active owner
        if (follower.activeParent !== parent && follower.activeParent !== null) {
          isFollowing = false;
          return;
        }

        updateTarget();

        const isVisible = follower.classList.contains('is-visible');
        const dx = targetX - currentX;
        const dy = targetY - currentY;
        if (!isVisible && Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) {
          isFollowing = false;
          return;
        }

        const ease = 0.05; // Slightly slower tracking speed for premium feel
        currentX += dx * ease;
        currentY += dy * ease;

        writePosition();
        updateHoverAppearance();

        lerpFrameId = requestAnimationFrame(updateFollowerPosition);
      };

      const onMouseEnter = (e) => {
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        if (window.innerWidth > 980 && isEnabled()) {
          // Claim ownership of the shared follower
          follower.activeParent = parent;

          // Set follower content
          let htmlContent = '';
          if (playIcon) {
            htmlContent += `
              <svg width="14" height="16" viewBox="0 0 20 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 8px; vertical-align: middle; display: inline-block; margin-top: -2px;">
                <path d="M1 2.69141V21.3086C1 22.1133 1.89844 22.5938 2.56641 22.1406L19.25 10.832C19.8281 10.4414 19.8281 9.55859 19.25 9.16797L2.56641 0.859375C1.89844 0.40625 1 0.886719 1 2.69141Z" fill="currentColor"/>
              </svg>
            `;
          } else if (openIcon) {
            htmlContent += `
              <svg width="12" height="12" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 8px; vertical-align: middle; display: inline-block; margin-top: -2px;">
                <path d="M0.658125 0.834188C0.658125 0.612947 0.746012 0.400769 0.902453 0.244328C1.05889 0.0878875 1.27107 0 1.49231 0H9.16581C9.38705 0 9.59923 0.0878875 9.75567 0.244328C9.91211 0.400769 10 0.612947 10 0.834188V8.50769C10 8.72893 9.91211 8.94111 9.75567 9.09755C9.59923 9.25399 9.38705 9.34188 9.16581 9.34188C8.94457 9.34188 8.73239 9.25399 8.57595 9.09755C8.41951 8.94111 8.33162 8.72893 8.33162 8.50769V2.84792L1.41371 9.76583C1.25638 9.91779 1.04566 10.0019 0.826939 9.99997C0.608218 9.99807 0.398993 9.91034 0.244328 9.75567C0.089663 9.60101 0.00193216 9.39178 3.15343e-05 9.17306C-0.00186909 8.95434 0.0822127 8.74362 0.234167 8.58629L7.15208 1.66838H1.49231C1.27107 1.66838 1.05889 1.58049 0.902453 1.42405C0.746012 1.26761 0.658125 1.05543 0.658125 0.834188Z" fill="currentColor"/>
              </svg>
            `;
          }
          htmlContent += `<span style="vertical-align: middle; display: inline-block;">${text}</span>`;
          follower.innerHTML = htmlContent;

          metricsDirty = true;
          updateTarget();
          lastColorSampleX = NaN;
          lastColorSampleY = NaN;

          const timeSinceActive = Date.now() - (follower.lastActiveTime || 0);
          const wasRecentlyActive = timeSinceActive < 350; // 350ms matching the transition duration

          // Only snap if not recently active and not already visible (to avoid jarring jumps between cards)
          if (!follower.classList.contains('is-visible') && !wasRecentlyActive) {
            // Commit the initial position before enabling the visible-state transition.
            // Without this frame, browsers interpolate from the default (0, 0) transform.
            follower.style.setProperty('transition', 'none', 'important');
            currentX = targetX;
            currentY = targetY;
            writePosition();
            void follower.offsetWidth;
            follower.style.removeProperty('transition');
          } else {
            // Reuse the shared follower's compositor position when moving between cards.
            if (Number.isFinite(follower._positionX) && Number.isFinite(follower._positionY)) {
              currentX = follower._positionX;
              currentY = follower._positionY;
            } else {
              currentX = targetX;
              currentY = targetY;
            }
          }

          follower.classList.add('is-visible');

          if (!isFollowing) {
            isFollowing = true;
            updateFollowerPosition();
          }
        }
      };

      const onMouseLeave = () => {
        // Only hide if this instance is still the owner
        if (follower.activeParent === parent) {
          follower.classList.remove('is-visible');
          follower.classList.remove('is-over-light');
          follower.classList.remove('is-over-blue');
          follower.activeParent = null;
          follower.lastActiveTime = Date.now(); // Record deactivation timestamp to avoid jump when transitioning to neighboring cards
        }
      };

      const onMouseMove = (e) => {
        // Keep the latest pointer coordinates even while this follower is gated.
        // This lets it appear immediately if its activation class is added mid-hover.
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        if (window.innerWidth > 980 && isEnabled()) {
          // Reclaim ownership in case of fast movements crossing boundaries
          follower.activeParent = parent;

          if (!isFollowing) {
            if (Number.isFinite(follower._positionX) && Number.isFinite(follower._positionY)) {
              currentX = follower._positionX;
              currentY = follower._positionY;
            } else {
              currentX = targetX;
              currentY = targetY;
            }
            isFollowing = true;
            updateFollowerPosition();
          }

        }
      };

      // Keep a real pointer position even while the follower is gated or hidden.
      // A gated follower can then become visible mid-hover without starting at (0, 0).
      const onWindowPointerMove = (e) => {
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
      };

      const markMetricsDirty = () => {
        metricsDirty = true;
      };
      const resizeObserver = typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(markMetricsDirty)
        : null;
      if (resizeObserver) resizeObserver.observe(parent);

      const activeClassObserver = activeClass && typeof MutationObserver !== 'undefined'
        ? new MutationObserver(() => {
          if (window.innerWidth > 980 && isEnabled() && parent.matches(':hover')) {
            onMouseEnter({ clientX: lastMouseX, clientY: lastMouseY });
          }
        })
        : null;
      if (activeClassObserver) {
        activeClassObserver.observe(parent, { attributes: true, attributeFilter: ['class'] });
      }

      parent.addEventListener('mouseenter', onMouseEnter);
      parent.addEventListener('mouseleave', onMouseLeave);
      parent.addEventListener('mousemove', onMouseMove);
      window.addEventListener('pointermove', onWindowPointerMove, { passive: true });
      window.addEventListener('resize', markMetricsDirty);
      window.addEventListener('scroll', markMetricsDirty, { passive: true });

      this._cleanup = () => {
        if (lerpFrameId) {
          cancelAnimationFrame(lerpFrameId);
        }
        parent.removeEventListener('mouseenter', onMouseEnter);
        parent.removeEventListener('mouseleave', onMouseLeave);
        parent.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('pointermove', onWindowPointerMove);
        window.removeEventListener('resize', markMetricsDirty);
        window.removeEventListener('scroll', markMetricsDirty);
        if (resizeObserver) resizeObserver.disconnect();
        if (activeClassObserver) activeClassObserver.disconnect();
        
        window.__activeFollowers[className]--;
        if (window.__activeFollowers[className] === 0 && follower) {
          follower.remove();
        }
      };
    }

    disconnectedCallback() {
      if (this._cleanup) {
        this._cleanup();
      }
    }
  }

  customElements.define('faust-mouse-follower', FaustMouseFollower);
})();
