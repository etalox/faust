(function() {
  class FaustMouseFollower extends HTMLElement {
    connectedCallback() {
      this.style.display = 'contents';
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
      let isFollowing = false;
      let lerpFrameId = null;

      const updateFollowerPosition = () => {
        if (!follower) return;

        // Stop this animation loop if this instance is no longer the active owner
        if (follower.activeParent !== parent && follower.activeParent !== null) {
          isFollowing = false;
          return;
        }

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

        follower.style.left = currentX + 'px';
        follower.style.top = currentY + 'px';

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

          const zoom = getZoom();
          const halfW = follower.offsetWidth / 2;
          const halfH = follower.offsetHeight / 2;

          targetX = e.clientX / zoom - halfW;
          targetY = e.clientY / zoom - halfH;

          const timeSinceActive = Date.now() - (follower.lastActiveTime || 0);
          const wasRecentlyActive = timeSinceActive < 350; // 350ms matching the transition duration

          // Only snap if not recently active and not already visible (to avoid jarring jumps between cards)
          if (!follower.classList.contains('is-visible') && !wasRecentlyActive) {
            currentX = targetX;
            currentY = targetY;
            follower.style.left = currentX + 'px';
            follower.style.top = currentY + 'px';
          } else {
            // Seed current position from actual style coordinates of the shared follower
            const styleLeft = parseFloat(follower.style.left);
            const styleTop = parseFloat(follower.style.top);
            if (!isNaN(styleLeft) && !isNaN(styleTop)) {
              currentX = styleLeft;
              currentY = styleTop;
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

          const zoom = getZoom();
          const halfW = follower.offsetWidth / 2;
          const halfH = follower.offsetHeight / 2;

          targetX = e.clientX / zoom - halfW;
          targetY = e.clientY / zoom - halfH;

          if (!isFollowing) {
            // Seed current position from actual style coordinates of the shared follower
            const styleLeft = parseFloat(follower.style.left);
            const styleTop = parseFloat(follower.style.top);
            if (!isNaN(styleLeft) && !isNaN(styleTop)) {
              currentX = styleLeft;
              currentY = styleTop;
            } else {
              currentX = targetX;
              currentY = targetY;
            }
            isFollowing = true;
            updateFollowerPosition();
          }

          // Hit test to detect underlying colors
          const hit = document.elementFromPoint(e.clientX, e.clientY);
          if (hit) {
            if (hit.closest('.revenue-layer, .auto-accent, .evidence-accent, .infra-top')) {
              follower.classList.add('is-over-blue');
            } else {
              follower.classList.remove('is-over-blue');
            }

            if (hit.closest('.perk-mobile-visual')) {
              follower.classList.add('is-over-light');
            } else {
              follower.classList.remove('is-over-light');
            }
          }
        }
      };

      parent.addEventListener('mouseenter', onMouseEnter);
      parent.addEventListener('mouseleave', onMouseLeave);
      parent.addEventListener('mousemove', onMouseMove);

      this._cleanup = () => {
        if (lerpFrameId) {
          cancelAnimationFrame(lerpFrameId);
        }
        parent.removeEventListener('mouseenter', onMouseEnter);
        parent.removeEventListener('mouseleave', onMouseLeave);
        parent.removeEventListener('mousemove', onMouseMove);
        
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
