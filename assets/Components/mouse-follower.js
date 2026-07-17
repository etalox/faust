(function() {
  class FaustMouseFollower extends HTMLElement {
    connectedCallback() {
      this.style.display = 'none';
      const parent = this.parentElement;
      if (!parent) return;

      const text = this.getAttribute('text') || 'Conocer más';
      const playIcon = this.hasAttribute('play-icon');
      const className = this.getAttribute('class-name') || 'perk-mouse-follower';

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
      let lastHitTarget = null;

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
        if (!lastHitTarget || !lastHitTarget.closest) return;
        follower.classList.toggle(
          'is-over-blue',
          Boolean(lastHitTarget.closest('.revenue-layer, .auto-accent, .evidence-accent, .infra-top'))
        );
        follower.classList.toggle('is-over-light', Boolean(lastHitTarget.closest('.perk-mobile-visual')));
      };

      const updateFollowerPosition = () => {
        if (!follower) return;

        // Stop this animation loop if this instance is no longer the active owner
        if (follower.activeParent !== parent && follower.activeParent !== null) {
          isFollowing = false;
          return;
        }

        updateTarget();
        updateHoverAppearance();

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

        lerpFrameId = requestAnimationFrame(updateFollowerPosition);
      };

      const onMouseEnter = (e) => {
        if (window.innerWidth > 980) {
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
          }
          htmlContent += `<span style="vertical-align: middle; display: inline-block;">${text}</span>`;
          follower.innerHTML = htmlContent;

          lastMouseX = e.clientX;
          lastMouseY = e.clientY;
          lastHitTarget = e.target;
          metricsDirty = true;
          updateTarget();
          updateHoverAppearance();

          const timeSinceActive = Date.now() - (follower.lastActiveTime || 0);
          const wasRecentlyActive = timeSinceActive < 350; // 350ms matching the transition duration

          // Only snap if not recently active and not already visible (to avoid jarring jumps between cards)
          if (!follower.classList.contains('is-visible') && !wasRecentlyActive) {
            currentX = targetX;
            currentY = targetY;
            writePosition();
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
        if (window.innerWidth > 980) {
          // Reclaim ownership in case of fast movements crossing boundaries
          follower.activeParent = parent;

          lastMouseX = e.clientX;
          lastMouseY = e.clientY;
          lastHitTarget = e.target;

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

      const markMetricsDirty = () => {
        metricsDirty = true;
      };
      const resizeObserver = typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(markMetricsDirty)
        : null;
      if (resizeObserver) resizeObserver.observe(parent);

      parent.addEventListener('mouseenter', onMouseEnter);
      parent.addEventListener('mouseleave', onMouseLeave);
      parent.addEventListener('mousemove', onMouseMove);
      window.addEventListener('resize', markMetricsDirty);
      window.addEventListener('scroll', markMetricsDirty, { passive: true });

      this._cleanup = () => {
        if (lerpFrameId) {
          cancelAnimationFrame(lerpFrameId);
        }
        parent.removeEventListener('mouseenter', onMouseEnter);
        parent.removeEventListener('mouseleave', onMouseLeave);
        parent.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('resize', markMetricsDirty);
        window.removeEventListener('scroll', markMetricsDirty);
        if (resizeObserver) resizeObserver.disconnect();
        
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
