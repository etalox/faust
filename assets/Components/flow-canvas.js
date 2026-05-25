(function injectStyles() {
  if (typeof document === 'undefined') return;
  const styleId = 'faust-flow-animations-style';
  if (document.getElementById(styleId)) return;

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    /* ==========================================================================
       CANVAS ENTRY ANIMATION STYLES
       ========================================================================== */

    /* Global Transition Reset when not active */
    faust-flow-canvas.has-animations * {
      transition: none;
    }

    /* Vector grid background */
    faust-flow-canvas.has-animations .Vector {
      opacity: 0;
    }
    faust-flow-canvas.has-animations.animating .Vector {
      opacity: 1;
      transition: opacity 1.2s ease;
    }

    /* --- CANVAS 1 (CRO STRATEGY) --- */

    /* Frame13 (User Icon + Arrow 1) */
    faust-flow-canvas.has-animations .Frame13 {
      width: 80px !important;
    }
    faust-flow-canvas.has-animations.animating .Frame13 {
      width: 152px !important;
      transition: width 0.7s cubic-bezier(0.25, 1, 0.5, 1) 0.8s;
    }

    /* Arrow 1 inside Frame13 (stretches) */
    faust-flow-canvas.has-animations .Frame13 faust-flow-arrow {
      opacity: 0;
      transform: scaleX(0);
      transform-origin: left;
    }
    faust-flow-canvas.has-animations.animating .Frame13 faust-flow-arrow {
      opacity: 1;
      transform: scaleX(1);
      transition: opacity 0.4s ease 0.8s, transform 0.7s cubic-bezier(0.25, 1, 0.5, 1) 0.8s;
    }

    /* Frame199 (Card A + Arrow 2) */
    faust-flow-canvas.has-animations .Frame199 {
      width: 0px !important;
      visibility: hidden;
    }
    faust-flow-canvas.has-animations.animating .Frame199 {
      width: 312px !important;
      visibility: visible;
      transition: width 0.7s cubic-bezier(0.25, 1, 0.5, 1) 1.5s, 
                  visibility 0s 1.5s;
    }

    /* Card A inside Frame199 (zoom + focus fade) */
    faust-flow-canvas.has-animations .Frame199 faust-flow-card {
      opacity: 0;
      filter: blur(8px);
      transform: scale(0.92);
    }
    faust-flow-canvas.has-animations.animating .Frame199 faust-flow-card {
      opacity: 1;
      filter: blur(0);
      transform: scale(1);
      transition: opacity 0.5s ease 1.5s, 
                  filter 0.5s ease 1.5s, 
                  transform 0.6s cubic-bezier(0.25, 1, 0.5, 1) 1.5s;
    }

    /* Arrow 2 inside Frame199 (stretches) */
    faust-flow-canvas.has-animations .Frame199 faust-flow-arrow {
      opacity: 0;
      transform: scaleX(0);
      transform-origin: left;
    }
    faust-flow-canvas.has-animations.animating .Frame199 faust-flow-arrow {
      opacity: 1;
      transform: scaleX(1);
      transition: opacity 0.4s ease 2.3s, transform 0.7s cubic-bezier(0.25, 1, 0.5, 1) 2.3s;
    }

    /* Frame198 (Database Flat + Arrow 3 reverse) */
    faust-flow-canvas.has-animations .Frame198 {
      width: 0px !important;
      visibility: hidden;
    }
    faust-flow-canvas.has-animations.animating .Frame198 {
      width: 152px !important;
      visibility: visible;
      transition: width 0.7s cubic-bezier(0.25, 1, 0.5, 1) 3.0s, 
                  visibility 0s 3.0s;
    }

    /* Database Flat Icon inside Frame198 (zoom + focus fade) */
    faust-flow-canvas.has-animations .Frame198 faust-flow-icon {
      opacity: 0;
      filter: blur(8px);
      transform: scale(0.9);
    }
    faust-flow-canvas.has-animations.animating .Frame198 faust-flow-icon {
      opacity: 1;
      filter: blur(0);
      transform: scale(1);
      transition: opacity 0.5s ease 3.0s, 
                  filter 0.5s ease 3.0s, 
                  transform 0.6s cubic-bezier(0.25, 1, 0.5, 1) 3.0s;
    }

    /* Arrow 3 (reverse) inside Frame198 (stretches) */
    faust-flow-canvas.has-animations .Frame198 faust-flow-arrow {
      opacity: 0;
      transform: scaleX(0);
      transform-origin: right;
    }
    faust-flow-canvas.has-animations.animating .Frame198 faust-flow-arrow {
      opacity: 1;
      transform: scaleX(1);
      transition: opacity 0.4s ease 3.8s, transform 0.7s cubic-bezier(0.25, 1, 0.5, 1) 3.8s;
    }

    /* Frame201 (Card B - Blue) */
    faust-flow-canvas.has-animations .Frame201 {
      width: 0px !important;
      visibility: hidden;
    }
    faust-flow-canvas.has-animations.animating .Frame201 {
      width: 240px !important;
      visibility: visible;
      transition: width 0.7s cubic-bezier(0.25, 1, 0.5, 1) 4.5s, 
                  visibility 0s 4.5s;
    }

    /* Card B inside Frame201 (zoom + focus fade) */
    faust-flow-canvas.has-animations .Frame201 faust-flow-card {
      opacity: 0;
      filter: blur(8px);
      transform: scale(0.92);
    }
    faust-flow-canvas.has-animations.animating .Frame201 faust-flow-card {
      opacity: 1;
      filter: blur(0);
      transform: scale(1);
      transition: opacity 0.5s ease 4.5s, 
                  filter 0.5s ease 4.5s, 
                  transform 0.6s cubic-bezier(0.25, 1, 0.5, 1) 4.5s;
    }

    /* Blue Card B Glow effect inside Frame201 */
    faust-flow-canvas.has-animations .Frame201 faust-flow-card[bg="blue"] .Frame {
      box-shadow: 0 0 0px rgba(0, 48, 255, 0) !important;
      filter: brightness(0.6);
    }
    faust-flow-canvas.has-animations.animating .Frame201 faust-flow-card[bg="blue"] .Frame {
      box-shadow: 0px 4px 160px rgba(0, 48, 255, 0.90) !important;
      filter: brightness(1) !important;
      transition: box-shadow 1.0s cubic-bezier(0.25, 1, 0.5, 1) 5.2s, 
                  filter 1.0s cubic-bezier(0.25, 1, 0.5, 1) 5.2s;
    }


    /* --- CANVAS 2 (A/B TESTING) --- */

    /* FlowDetails layout alignment - Center content dynamically */
    faust-flow-canvas.has-animations .FlowDetails {
      justify-content: center !important;
    }

    /* FlowMetricsContainer */
    faust-flow-canvas.has-animations .FlowMetricsContainer {
      width: 80px !important;
    }
    faust-flow-canvas.has-animations.animating .FlowMetricsContainer {
      width: 232px !important;
      transition: width 0.7s cubic-bezier(0.25, 1, 0.5, 1) 0.8s;
    }

    /* Split-down arrow inside FlowMetricsContainer (stretches) */
    faust-flow-canvas.has-animations .FlowMetricsContainer faust-flow-arrow-split-down {
      opacity: 0;
      transform: scale(0);
      transform-origin: top left;
    }
    faust-flow-canvas.has-animations.animating .FlowMetricsContainer faust-flow-arrow-split-down {
      opacity: 1;
      transform: scale(1);
      transition: opacity 0.5s ease 0.8s, transform 0.7s cubic-bezier(0.25, 1, 0.5, 1) 0.8s;
    }

    /* Percentages inside FlowMetricsContainer (zoom + fade) */
    faust-flow-canvas.has-animations .FlowMetricsContainer .FlowArrowContainer2,
    faust-flow-canvas.has-animations .FlowMetricsContainer .FlowPercentage1 {
      opacity: 0;
      transform: scale(0.7);
    }
    faust-flow-canvas.has-animations.animating .FlowMetricsContainer .FlowArrowContainer2,
    faust-flow-canvas.has-animations.animating .FlowMetricsContainer .FlowPercentage1 {
      opacity: 1;
      transform: scale(1);
      transition: opacity 0.5s ease 1.3s, transform 0.5s cubic-bezier(0.25, 1, 0.5, 1) 1.3s;
    }

    /* Column AB */
    faust-flow-canvas.has-animations .AB {
      width: 0px !important;
      visibility: hidden;
    }
    faust-flow-canvas.has-animations.animating .AB {
      width: 80px !important;
      visibility: visible;
      transition: width 0.7s cubic-bezier(0.25, 1, 0.5, 1) 2.0s, 
                  visibility 0s 2.0s;
    }

    /* Control A and Variant B Icons inside AB (zoom + focus fade) */
    faust-flow-canvas.has-animations .AB faust-flow-icon {
      opacity: 0;
      filter: blur(8px);
      transform: scale(0.9);
    }
    faust-flow-canvas.has-animations.animating .AB faust-flow-icon {
      opacity: 1;
      filter: blur(0);
      transform: scale(1);
      transition: opacity 0.5s ease 2.0s, 
                  filter 0.5s ease 2.0s, 
                  transform 0.6s cubic-bezier(0.25, 1, 0.5, 1) 2.0s;
    }

    /* Variant B Glow effect inside AB */
    faust-flow-canvas.has-animations .AB faust-flow-icon[bg="blue"] .Frame {
      box-shadow: 0 0 0px rgba(0, 48, 255, 0) !important;
      filter: brightness(0.6);
    }
    faust-flow-canvas.has-animations.animating .AB faust-flow-icon[bg="blue"] .Frame {
      box-shadow: 0px 4px 160px rgba(0, 48, 255, 0.90) !important;
      filter: brightness(1) !important;
      transition: box-shadow 1.0s cubic-bezier(0.25, 1, 0.5, 1) 2.7s, 
                  filter 1.0s cubic-bezier(0.25, 1, 0.5, 1) 2.7s;
    }

    /* Container (Testing canvas third block) */
    faust-flow-canvas.has-animations .FlowDetails .Container {
      width: 0px !important;
      visibility: hidden;
    }
    faust-flow-canvas.has-animations.animating .FlowDetails .Container {
      width: 793px !important;
      visibility: visible;
      transition: width 1.8s cubic-bezier(0.25, 1, 0.5, 1) 3.2s, 
                  visibility 0s 3.2s;
    }

    /* Merge Arrow inside Container (stretches) */
    faust-flow-canvas.has-animations .FlowDetails .Container faust-flow-arrow-merge-right {
      opacity: 0;
      transform: scaleX(0);
      transform-origin: left;
    }
    faust-flow-canvas.has-animations.animating .FlowDetails .Container faust-flow-arrow-merge-right {
      opacity: 1;
      transform: scaleX(1);
      transition: opacity 0.4s ease 3.2s, transform 0.7s cubic-bezier(0.25, 1, 0.5, 1) 3.2s;
    }

    /* Database Icon inside Container (zoom + focus fade) */
    faust-flow-canvas.has-animations .FlowDetails .Container faust-flow-icon {
      opacity: 0;
      filter: blur(8px);
      transform: scale(0.9);
    }
    faust-flow-canvas.has-animations.animating .FlowDetails .Container faust-flow-icon {
      opacity: 1;
      filter: blur(0);
      transform: scale(1);
      transition: opacity 0.5s ease 3.8s, 
                  filter 0.5s ease 3.8s, 
                  transform 0.6s cubic-bezier(0.25, 1, 0.5, 1) 3.8s;
    }

    /* Linear Arrow inside Container (stretches) */
    faust-flow-canvas.has-animations .FlowDetails .Container faust-flow-arrow {
      opacity: 0;
      transform: scaleX(0);
      transform-origin: left;
    }
    faust-flow-canvas.has-animations.animating .FlowDetails .Container faust-flow-arrow {
      opacity: 1;
      transform: scaleX(1);
      transition: opacity 0.4s ease 4.4s, transform 0.7s cubic-bezier(0.25, 1, 0.5, 1) 4.4s;
    }

    /* Card Metrics inside Container (zoom + focus fade) */
    faust-flow-canvas.has-animations .FlowDetails .Container faust-flow-card {
      opacity: 0;
      filter: blur(8px);
      transform: scale(0.95);
    }
    faust-flow-canvas.has-animations.animating .FlowDetails .Container faust-flow-card {
      opacity: 1;
      filter: blur(0);
      transform: scale(1);
      transition: opacity 0.6s ease 5.0s, 
                  filter 0.6s ease 5.0s, 
                  transform 0.7s cubic-bezier(0.25, 1, 0.5, 1) 5.0s;
    }
  `;
  document.head.appendChild(style);
})();

/* ==========================================================================
   ATOMS (ÁTOMOS)
   ========================================================================== */

/**
 * FaustFlowCubeSvg: Atom component that renders only the vector 3D cube SVG.
 * Supports size="small" (20x22 viewBox) and size="large" (22x25 viewBox).
 */
class FaustFlowCubeSvg extends HTMLElement {
  connectedCallback() {
    const size = this.getAttribute('size') || 'small';
    let width = 20;
    let height = 22;
    let viewBox = '0 0 20 22';
    let pathD = "M0.900024 5.8999V15.8999L9.78891 20.8999L18.6778 15.8999V5.8999L9.78891 0.899902L0.900024 5.8999ZM18.6778 5.8999L9.78881 10.8997L0.900024 5.8999M9.78891 20.8999L9.78881 10.8997M0.900024 5.8999L9.78881 10.8997";

    if (size === 'large') {
      width = 22;
      height = 25;
      viewBox = '0 0 22 25';
      pathD = "M20.8679 6.51602L10.8839 0.900024L0.899902 6.51602M20.8679 6.51602V17.748L10.8839 23.364M20.8679 6.51602L10.8838 12.1317M10.8839 23.364L0.899902 17.748V6.51602M10.8839 23.364L10.8838 12.1317M0.899902 6.51602L10.8838 12.1317";
    }

    this.style.display = 'inline-flex';
    this.style.alignItems = 'center';
    this.style.justifyContent = 'center';
    this.style.width = width + 'px';
    this.style.height = height + 'px';

    this.innerHTML = `
      <svg width="${width}" height="${height}" viewBox="${viewBox}" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: block;">
        <path d="${pathD}" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
  }
}

/**
 * FaustFlowArrow: Atom component that renders a linear gradient arrow.
 */
class FaustFlowArrow extends HTMLElement {
  connectedCallback() {
    const left = this.getAttribute('left') || '0';
    const top = this.getAttribute('top') || '0';
    const fromColor = this.getAttribute('from-color') || '#D3D7D6';
    const toColor = this.getAttribute('to-color') || '#191919';
    const fromOpacity = this.getAttribute('from-opacity') || '1';
    const toOpacity = this.getAttribute('to-opacity') || '1';
    const reverse = this.getAttribute('reverse') === 'true';

    const x1 = reverse ? 72 : 0;
    const x2 = reverse ? 0 : 72;
    const gradId = 'arrow-grad-' + Math.random().toString(36).substr(2, 9);

    const pathD = reverse
      ? "M72.7071 6.65691C73.0976 7.04743 73.0976 7.6806 72.7071 8.07112L66.3431 14.4351C65.9526 14.8256 65.3195 14.8256 64.9289 14.4351C64.5384 14.0446 64.5384 13.4114 64.9289 13.0209L70.5858 7.36401L64.9289 1.70716C64.5384 1.31664 64.5384 0.68347 64.9289 0.292946C65.3195 -0.0975785 65.9526 -0.0975785 66.3431 0.292946L72.7071 6.65691ZM72 7.36401V8.36401H0V7.36401V6.36401H72V7.36401Z"
      : "M72.7071 8.07112C73.0976 7.6806 73.0976 7.04743 72.7071 6.65691L66.3431 0.292946C65.9526 -0.0975785 65.3195 -0.0975785 64.9289 0.292946C64.5384 0.68347 64.5384 1.31664 64.9289 1.70716L70.5858 7.36401L64.9289 13.0209C64.5384 13.4114 64.5384 14.0446 64.9289 14.4351C65.3195 14.8256 65.9526 14.8256 66.3431 14.4351L72.7071 8.07112ZM0 7.36401V8.36401H72V7.36401V6.36401H0V7.36401Z";

    this.style.left = left + 'px';
    this.style.top = top + 'px';
    this.style.position = 'absolute';
    this.style.display = 'block';

    this.innerHTML = `
      <svg width="73" height="15" viewBox="0 0 73 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="${pathD}" fill="url(#${gradId})"/>
        <defs>
          <linearGradient id="${gradId}" x1="${x1}" y1="8.86401" x2="${x2}" y2="8.86401" gradientUnits="userSpaceOnUse">
            <stop stop-color="${fromColor}" stop-opacity="${fromOpacity}"/>
            <stop offset="1" stop-color="${toColor}" stop-opacity="${toOpacity}"/>
          </linearGradient>
        </defs>
      </svg>
    `;
  }
}

/**
 * FaustFlowArrowSplitDown: Atom component that renders the split-down arrow vector.
 */
class FaustFlowArrowSplitDown extends HTMLElement {
  connectedCallback() {
    const left = this.getAttribute('left') || '0';
    const top = this.getAttribute('top') || '0';
    const gradId = 'split-down-grad';

    this.style.left = left + 'px';
    this.style.top = top + 'px';
    this.style.position = 'absolute';
    this.style.display = 'block';

    this.innerHTML = `
      <svg width="153" height="155" viewBox="0 0 153 155" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M152.707 148.102C153.098 147.712 153.098 147.079 152.707 146.688L146.343 140.324C145.953 139.934 145.319 139.934 144.929 140.324C144.538 140.715 144.538 141.348 144.929 141.738L150.586 147.395L144.929 153.052C144.538 153.443 144.538 154.076 144.929 154.466C145.319 154.857 145.953 154.857 146.343 154.466L152.707 148.102ZM152.707 8.07112C153.098 7.6806 153.098 7.04743 152.707 6.65691L146.343 0.292946C145.953 -0.0975785 145.319 -0.0975785 144.929 0.292946C144.538 0.68347 144.538 1.31664 144.929 1.70716L150.586 7.36401L144.929 13.0209C144.538 13.4114 144.538 14.0446 144.929 14.4351C145.319 14.8256 145.953 14.8256 146.343 14.4351L152.707 8.07112ZM0 77.3953V78.3953H44.9375V77.3953V76.3953H0V77.3953ZM114.938 147.395V148.395H152V147.395V146.395H114.938V147.395ZM79.9375 112.395H78.9375C78.9375 132.278 95.0553 148.395 114.938 148.395V147.395V146.395C96.1598 146.395 80.9375 131.173 80.9375 112.395H79.9375ZM44.9375 77.3953V78.3953C63.7152 78.3953 78.9375 93.6176 78.9375 112.395H79.9375H80.9375C80.9375 92.513 64.8197 76.3953 44.9375 76.3953V77.3953ZM0 77.364V78.364H44.9375V77.364V76.364H0V77.364ZM114.938 7.36401V8.36401H152V7.36401V6.36401H114.938V7.36401ZM79.9375 42.364H80.9375C80.9375 23.5863 96.1598 8.36401 114.938 8.36401V7.36401V6.36401C95.0553 6.36401 78.9375 22.4818 78.9375 42.364H79.9375ZM44.9375 77.364V78.364C64.8197 78.364 80.9375 62.2463 80.9375 42.364H79.9375H78.9375C78.9375 61.1417 63.7152 76.364 44.9375 76.364V77.364Z" fill="url(#${gradId})"/>
        <defs>
          <linearGradient id="${gradId}" x1="0" y1="37.3328" x2="152" y2="37.3328" gradientUnits="userSpaceOnUse">
            <stop stop-color="#D3D7D6" stop-opacity="0"/>
            <stop offset="1" stop-color="#D3D7D6" stop-opacity="1"/>
          </linearGradient>
        </defs>
      </svg>
    `;
  }
}

/**
 * FaustFlowArrowMergeRight: Atom component that renders the merge-right arrow vector.
 */
class FaustFlowArrowMergeRight extends HTMLElement {
  connectedCallback() {
    const left = this.getAttribute('left') || '0';
    const top = this.getAttribute('top') || '0';
    const gradId = 'merge-right-grad';

    this.style.left = left + 'px';
    this.style.top = top + 'px';
    this.style.position = 'absolute';
    this.style.display = 'block';

    this.innerHTML = `
      <svg width="66" height="42" viewBox="0 0 66 42" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M65.2345 21.5567C65.625 21.1662 65.625 20.533 65.2345 20.1425L58.8705 13.7785C58.48 13.388 57.8468 13.388 57.4563 13.7785C57.0658 14.1691 57.0658 14.8022 57.4563 15.1928L63.1131 20.8496L57.4563 26.5065C57.0658 26.897 57.0658 27.5302 57.4563 27.9207C57.8468 28.3112 58.48 28.3112 58.8705 27.9207L65.2345 21.5567ZM26.9356 17.241L26.4083 18.0906V18.0906L26.9356 17.241ZM26.9356 24.4582L26.4083 23.6086V23.6086L26.9356 24.4582ZM64.5273 20.8496V19.8496H39.5924V20.8496V21.8496H64.5273V20.8496ZM26.9356 17.241L27.463 16.3913L1.05471 -3.0756e-05L0.527344 0.849609L-1.91331e-05 1.69925L26.4083 18.0906L26.9356 17.241ZM39.5924 20.8496V19.8496C35.306 19.8496 31.1049 18.6518 27.463 16.3913L26.9356 17.241L26.4083 18.0906C30.3668 20.5477 34.9333 21.8496 39.5924 21.8496V20.8496ZM26.9356 24.4582L26.4083 23.6086L-1.91331e-05 40L0.527344 40.8496L1.05471 41.6992L27.463 25.3079L26.9356 24.4582ZM26.9356 24.4582L27.463 25.3079C31.1049 23.0474 35.306 21.8496 39.5924 21.8496V20.8496V19.8496C34.9333 19.8496 30.3668 21.1516 26.4083 23.6086L26.9356 24.4582Z" fill="url(#${gradId})"/>
        <defs>
          <linearGradient id="${gradId}" x1="64.5273" y1="50.8496" x2="0.527344" y2="50.8496" gradientUnits="userSpaceOnUse">
            <stop stop-color="#D3D7D6" stop-opacity="1"/>
            <stop offset="1" stop-color="#D3D7D6" stop-opacity="0"/>
          </linearGradient>
        </defs>
      </svg>
    `;
  }
}

/**
 * FaustFlowLabel: Atom component that renders text labels inside the flow.
 */
class FaustFlowLabel extends HTMLElement {
  connectedCallback() {
    const left = this.getAttribute('left') || '0';
    const top = this.getAttribute('top') || '0';
    const width = this.getAttribute('width') || '400';

    this.style.width = width + 'px';
    this.style.left = left + 'px';
    this.style.top = top + 'px';
    this.style.position = 'absolute';
    this.style.display = 'block';

    this.innerHTML = `
      <div data-layer="Label" class="Label" style="width: 100%; text-box-trim: trim-both; text-box-edge: cap alphabetic; text-align: center">
        ${this.innerHTML}
      </div>
    `;
  }
}


/* ==========================================================================
   MOLECULES (MOLÉCULAS)
   ========================================================================== */

/**
 * FaustFlowCube: Molecule component that wraps `<faust-flow-cube-svg>`
 * and a letter, aligning them with pixel-perfect visual vertical centering.
 */
class FaustFlowCube extends HTMLElement {
  connectedCallback() {
    const letter = this.getAttribute('letter') || '';
    const size = this.getAttribute('size') || 'small';

    this.style.display = 'inline-flex';
    this.style.alignItems = 'center';
    this.style.justifyContent = 'center';
    this.style.gap = '3.78px';

    // To center the capital letters (A/B) visually with the SVG cube center,
    // we shift the letter container up by exactly 1px. This resolves BDO Grotesk's
    // baseline layout offsets, yielding perfect vertical alignment.
    this.innerHTML = `
      <faust-flow-cube-svg size="${size}"></faust-flow-cube-svg>
      ${letter ? `<span class="CubeText" style="color: white; font-size: 17px; font-family: 'BDO Grotesk', sans-serif; font-weight: 400; line-height: 1; letter-spacing: 0.17px; display: inline-flex; align-items: center; transform: translateY(-1px); margin: 0;">${letter}</span>` : ''}
    `;
  }
}

/**
 * FaustFlowIcon: Molecule component representing a themed round icon container.
 * Composes internal SVGs or `<faust-flow-cube>` inside its circular frame.
 */
class FaustFlowIcon extends HTMLElement {
  connectedCallback() {
    const left = this.getAttribute('left') || '0';
    const top = this.getAttribute('top') || '0';
    const type = this.getAttribute('type') || 'user';
    const bg = this.getAttribute('bg') || 'gray';
    const radius = this.getAttribute('radius') || '40';
    const letter = this.getAttribute('letter') || '';
    const absolute = this.getAttribute('absolute') !== 'false';

    let bgStyle = '';
    let extraClass = '';
    if (bg === 'gray') {
      bgStyle = 'background: #D3D7D6;';
    } else if (bg === 'dark') {
      bgStyle = 'background: #1A1A1A;';
      extraClass = 'gradient-border';
    } else if (bg === 'blue') {
      bgStyle = 'background: #0030FF; box-shadow: 0px 4px 160px rgba(0, 48, 255, 0.80);';
      extraClass = 'gradient-border gradient-border-blue';
    }

    const svgs = {
      'user': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.68517 19.8344C4.98086 18.8502 5.58591 17.9876 6.41057 17.3745C7.23522 16.7614 8.23554 16.4305 9.26313 16.4308H14.0418C15.0707 16.4304 16.0723 16.7622 16.8975 17.3767C17.7228 17.9912 18.3276 18.8557 18.6222 19.8415M22.404 11.6519C22.404 17.5901 17.5902 22.4039 11.652 22.4039C5.71386 22.4039 0.900024 17.5901 0.900024 11.6519C0.900024 5.71374 5.71386 0.899902 11.652 0.899902C17.5902 0.899902 22.404 5.71374 22.404 11.6519ZM15.2352 9.26251C15.2352 11.2419 13.6306 12.8465 11.6512 12.8465C9.67182 12.8465 8.0672 11.2419 8.0672 9.26251C8.0672 7.28312 9.67182 5.67851 11.6512 5.67851C13.6306 5.67851 15.2352 7.28312 15.2352 9.26251Z" stroke="#1A1A1A" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      'users': `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0.899902 20.9001V18.6779C0.899902 17.4991 1.36815 16.3687 2.20165 15.5352C3.03514 14.7017 4.16561 14.2334 5.34445 14.2334H9.78879C10.9675 14.2334 12.098 14.7017 12.9315 15.5352C13.765 16.3687 14.2332 17.4991 14.2332 18.6779V20.9001M15.3443 1.04445C16.3003 1.28923 17.1477 1.84523 17.7528 2.6248C18.3579 3.40436 18.6863 4.36315 18.6863 5.35001C18.6863 6.33686 18.3579 7.29565 17.7528 8.07521C17.1477 8.85478 16.3003 9.41078 15.3443 9.65556M20.9001 20.9V18.6778C20.8944 17.6968 20.5644 16.7453 19.9615 15.9715C19.3585 15.1978 18.5165 14.6452 17.5667 14.4M12.0112 5.34447C12.0112 7.79907 10.0214 9.78892 7.5668 9.78892C5.1122 9.78892 3.12235 7.79907 3.12235 5.34447C3.12235 2.88987 5.1122 0.900024 7.5668 0.900024C10.0214 0.900024 12.0112 2.88987 12.0112 5.34447Z" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      'database': `<svg width="20" height="22" viewBox="0 0 20 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18.2332 4.15002C18.2332 5.94495 14.353 7.40002 9.56657 7.40002C4.7801 7.40002 0.899902 5.94495 0.899902 4.15002M18.2332 4.15002C18.2332 2.3551 14.353 0.900024 9.56657 0.900024C4.7801 0.900024 0.899902 2.3551 0.899902 4.15002M18.2332 4.15002V10.65M0.899902 4.15002V10.65M0.899902 10.65C0.899902 11.512 1.813 12.3386 3.43831 12.9481C5.06363 13.5576 7.26803 13.9 9.56657 13.9C11.8651 13.9 14.0695 13.5576 15.6948 12.9481C17.3201 12.3386 18.2332 11.512 18.2332 10.65M0.899902 10.65V17.15C0.899902 18.012 1.813 18.8386 3.43831 19.4481C5.06363 20.0576 7.26803 20.4 9.56657 20.4C11.8651 20.4 14.0695 20.0576 15.6948 19.4481C17.3201 18.8385 18.2332 18.012 18.2332 17.15V10.65" stroke="#1A1A1A" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      'database-flat': `<svg width="30" height="23" viewBox="0 0 30 23" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 7.1875V11.5L30 4.3125V0L0 7.1875Z" fill="#1A1A1A"/><path d="M2.42541 13.7939C1.00305 14.1347 0 15.4064 0 16.869V23H3.57143V17.9688L30 11.5V7.1875L2.42541 13.7939Z" fill="#1A1A1A"/></svg>`
    };

    // Extract label node if present in child DOM to preserve translation
    let labelHtml = '';
    const labelNode = this.querySelector('.icon-label, [slot="label"]');
    if (labelNode) {
      labelHtml = `
        <div data-layer="Label" class="Label" style="left: 0px; width: 80px; top: 104px; position: absolute; text-box-trim: trim-both; text-box-edge: cap alphabetic; text-align: center; color: rgba(255, 255, 255, 0.50); font-size: 14px; font-family: BDO Grotesk, sans-serif; font-weight: 500; line-height: 19.60px; letter-spacing: 0.28px; word-wrap: break-word">
          ${labelNode.innerHTML}
        </div>
      `;
      labelNode.remove();
    } else {
      const labelAttr = this.getAttribute('label') || '';
      if (labelAttr) {
        labelHtml = `
          <div data-layer="Label" class="Label" style="left: 0px; width: 80px; top: 104px; position: absolute; text-box-trim: trim-both; text-box-edge: cap alphabetic; text-align: center; color: rgba(255, 255, 255, 0.50); font-size: 14px; font-family: BDO Grotesk, sans-serif; font-weight: 500; line-height: 19.60px; letter-spacing: 0.28px; word-wrap: break-word">
            ${labelAttr}
          </div>
        `;
      }
    }

    let innerContent = '';
    if (type === 'cube-split' || type === 'cube') {
      innerContent = `<faust-flow-cube size="large" letter="${letter}"></faust-flow-cube>`;
    } else {
      innerContent = svgs[type];
    }

    if (absolute) {
      this.style.width = '80px';
      this.style.height = '80px';
      this.style.left = left + 'px';
      this.style.top = top + 'px';
      this.style.position = 'absolute';
      this.style.display = 'block';
    } else {
      this.style.display = 'inline-flex';
      this.style.position = 'relative';
      this.style.width = '80px';
      this.style.height = '80px';
    }

    this.innerHTML = `
      <div data-layer="Icon Container" class="IconContainer" style="width: 80px; height: 80px; left: 0px; top: 0px; position: absolute">
        <div data-layer="Frame" class="Frame ${extraClass}" style="width: 80px; height: 80px; left: 0px; top: 0px; position: absolute; ${bgStyle} overflow: hidden; border-radius: ${radius}px; display: flex; align-items: center; justify-content: center;">
          ${innerContent}
        </div>
      </div>
      ${labelHtml}
    `;
  }
}


/* ==========================================================================
   ORGANISMS (ORGANISMOS)
   ========================================================================== */

/**
 * FaustFlowCard: Organism component representing a metric card display inside the canvas.
 * Composes `<faust-flow-cube>` and translatable numbers.
 */
class FaustFlowCard extends HTMLElement {
  connectedCallback() {
    const left = this.getAttribute('left') || '0';
    const top = this.getAttribute('top') || '0';
    const width = parseInt(this.getAttribute('width') || '240', 10);
    const height = parseInt(this.getAttribute('height') || '64', 10);
    const bg = this.getAttribute('bg') || 'dark';
    const shadow = this.getAttribute('shadow') === 'true';
    const letter = this.getAttribute('letter') || '';
    const value = this.getAttribute('value') || '';
    const period = this.getAttribute('period') || '';

    // Extract description node if present in child DOM to preserve translation
    let descHtml = '';
    const descNode = this.querySelector('.Description, [slot="desc"]');
    if (descNode) {
      descHtml = descNode.outerHTML;
      descNode.remove();
    } else {
      const descAttr = this.getAttribute('desc') || '';
      if (descAttr) {
        descHtml = `
          <div data-layer="Description" class="Description" style="width: ${width}px; left: 0px; top: 124px; position: absolute; text-box-trim: trim-both; text-box-edge: cap alphabetic; text-align: center; color: rgba(255, 255, 255, 0.50); font-size: 14px; font-family: BDO Grotesk, sans-serif; font-weight: 500; line-height: 19.60px; letter-spacing: 0.28px; word-wrap: break-word">${descAttr}</div>
        `;
      }
    }

    let bgStyle = '';
    let extraClass = 'gradient-border';
    if (bg === 'dark') {
      bgStyle = 'background: #141414;';
    } else if (bg === 'blue') {
      bgStyle = 'background: #0022FF;';
      extraClass = 'gradient-border gradient-border-blue';
    } else if (bg === 'gray-dark') {
      bgStyle = 'background: #171819;';
    }

    let shadowStyle = shadow ? 'box-shadow: 0px 4px 200px rgba(0, 48, 255, 0.80);' : '';
    let radius = width > 400 ? '30px' : '40px';

    this.style.width = width + 'px';
    this.style.height = height + 'px';
    this.style.left = left + 'px';
    this.style.top = top + 'px';
    this.style.position = 'absolute';
    this.style.display = 'block';

    // Build the content HTML, supporting both translatable children (preferred) and attributes
    let contentHtml = '';
    if (this.innerHTML.trim()) {
      contentHtml = this.innerHTML;
    } else if (value || period) {
      contentHtml = `<span style="color: white; font-size: 16px; font-family: BDO Grotesk, sans-serif; font-weight: 400; line-height: 22.40px; letter-spacing: 0.32px; word-wrap: break-word">${value}</span><span style="color: rgba(255, 255, 255, 0.50); font-size: 16px; font-family: BDO Grotesk, sans-serif; font-weight: 400; line-height: 22.40px; letter-spacing: 0.32px; word-wrap: break-word">${period}</span>`;
    }

    let innerContent = '';
    if (letter) {
      innerContent = `
        <div data-layer="Frame 229" class="Frame229" style="height: 22px; left: 29.11px; top: 21px; position: absolute; display: flex; align-items: center;">
          <faust-flow-cube size="small" letter="${letter}"></faust-flow-cube>
        </div>
        <div data-layer="Amount" class="Amount" style="left: 75.89px; top: 26px; position: absolute; text-box-trim: trim-both; text-box-edge: cap alphabetic">
          ${contentHtml}
        </div>
      `;
    } else {
      innerContent = `
        <div data-layer="Amount" class="Amount" style="width: 497px; left: 32px; top: 32px; position: absolute; text-box-trim: trim-both; text-box-edge: cap alphabetic">
          ${contentHtml}
        </div>
      `;
    }

    const frameHeight = bg === 'gray-dark' ? height - 2 : height;

    this.innerHTML = `
      <div data-layer="Item Details" class="ItemDetails" style="width: ${width}px; height: ${height}px; left: 0px; top: 0px; position: absolute">
        <div data-layer="Frame" class="Frame ${extraClass}" style="width: ${width}px; height: ${frameHeight}px; left: 0px; top: 0px; position: absolute; ${bgStyle} ${shadowStyle} overflow: hidden; border-radius: ${radius};">
          ${innerContent}
        </div>
      </div>
      ${descHtml}
    `;
  }
}

/**
 * FaustFlowCanvas: Organism representing the SVG background grid and responsive viewport.
 * Controls scaled rendering for desktop and mobile devices.
 */
class FaustFlowCanvas extends HTMLElement {
  connectedCallback() {
    const width = parseInt(this.getAttribute('width') || '1640', 10);
    const height = parseInt(this.getAttribute('height') || '450', 10);
    const mobileWidth = parseInt(this.getAttribute('mobile-width') || '1040', 10);
    const mobileShift = parseInt(this.getAttribute('mobile-shift') || '-140', 10);
    const frameLeft = parseInt(this.getAttribute('frame-left') || '140', 10);
    const frameTop = parseInt(this.getAttribute('frame-top') || '80', 10);
    const frameWidth = parseInt(this.getAttribute('frame-width') || '1040', 10);
    const frameHeight = parseInt(this.getAttribute('frame-height') || '320', 10);
    const gridLines = parseInt(this.getAttribute('grid-lines') || '14', 10);
    const gridId = this.getAttribute('grid-id') || 'grid-grad';

    let pathD = `M0.5 ${frameHeight}L0.5 0`;
    for (let i = 1; i < gridLines; i++) {
      const x = i * 80 + 0.5;
      pathD += `M${x} ${frameHeight}V0`;
    }

    // Extract legend element from children if present to preserve translation
    const legendNode = this.querySelector('.canvas-legend, [slot="legend"]');
    let legendHtml = '';
    if (legendNode) {
      legendHtml = legendNode.outerHTML;
      legendNode.remove();
    } else {
      const legendAttr = this.getAttribute('legend') || '';
      if (legendAttr) {
        legendHtml = `<div class="canvas-legend">${legendAttr}</div>`;
      }
    }

    const children = Array.from(this.childNodes);

    this.innerHTML = `
      <div class="flow-wrapper">
        <div class="flow-scaler" style="--base-width: ${width}px; --mobile-width: ${mobileWidth}px; --mobile-shift: ${mobileShift}px; --base-height: ${height}px;">
          <div data-layer="Flow" class="Flow" style="width: ${width}px; height: ${height}px; position: relative;">
            <div data-layer="Frame 1" class="Frame1" style="width: ${frameWidth}px; height: ${frameHeight}px; left: ${frameLeft}px; top: ${frameTop}px; position: absolute">
              <div data-svg-wrapper data-layer="Vector" class="Vector" style="left: 0px; top: 0px; position: absolute">
                <svg width="${frameWidth + 1}" height="${frameHeight}" viewBox="0 0 ${frameWidth + 1} ${frameHeight}" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path opacity="0.4" d="${pathD}" stroke="url(#${gridId})"/>
                  <defs>
                    <linearGradient id="${gridId}" x1="${frameWidth + 1}.44" y1="0" x2="${frameWidth + 1}.44" y2="${frameHeight}" gradientUnits="userSpaceOnUse">
                      <stop stop-color="white" stop-opacity="0.1"/>
                      <stop offset="0.4" stop-color="white" stop-opacity="0.15"/>
                      <stop offset="1" stop-color="white" stop-opacity="0.05"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div class="flow-content-mount" style="display: contents;"></div>
            </div>
          </div>
        </div>
      </div>
      ${legendHtml}
    `;

    const mount = this.querySelector('.flow-content-mount');
    children.forEach(child => mount.appendChild(child));

    // Setup intersection observer to toggle the animation class
    this.classList.add('has-animations');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.classList.remove('animating');
          void this.offsetWidth; // Force reflow to reset CSS transitions
          this.classList.add('animating');
        } else {
          this.classList.remove('animating');
        }
      });
    }, {
      threshold: 0.05 // Trigger early
    });
    observer.observe(this);
  }
}


/* ==========================================================================
   REGISTRATION (REGISTRO)
   ========================================================================== */

customElements.define('faust-flow-cube-svg', FaustFlowCubeSvg);
customElements.define('faust-flow-canvas', FaustFlowCanvas);
customElements.define('faust-flow-icon', FaustFlowIcon);
customElements.define('faust-flow-cube', FaustFlowCube);
customElements.define('faust-flow-arrow', FaustFlowArrow);
customElements.define('faust-flow-card', FaustFlowCard);
customElements.define('faust-flow-arrow-split-down', FaustFlowArrowSplitDown);
customElements.define('faust-flow-arrow-merge-right', FaustFlowArrowMergeRight);
customElements.define('faust-flow-label', FaustFlowLabel);
