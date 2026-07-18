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
      transition: opacity 1.0s ease;
    }

    /* --- CANVAS 1 (CRO STRATEGY) --- */

    /* Frame13 (User Icon + Arrow 1) */
    faust-flow-canvas.has-animations .Frame13 {
      width: 80px !important;
    }
    faust-flow-canvas.has-animations.animating .Frame13 {
      width: 152px !important;
      transition: width 0.8s cubic-bezier(0.25, 1, 0.5, 1) 1.0s;
    }

    /* First User Icon inside Frame13 (starts scaled and returns to normal size immediately) */
    faust-flow-canvas.has-animations .Frame13 faust-flow-icon {
      transform: scale(1.25) !important;
      transform-origin: center;
      transition: transform 0.8s cubic-bezier(0.25, 1, 0.5, 1);
    }
    faust-flow-canvas.has-animations.animating .Frame13 faust-flow-icon {
      transform: scale(1) !important;
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
      transition: opacity 0.4s ease 1.0s, transform 0.8s cubic-bezier(0.25, 1, 0.5, 1) 1.0s;
    }

    /* Frame199 (Card A + Arrow 2) */
    faust-flow-canvas.has-animations .Frame199 {
      width: 0px !important;
      visibility: hidden;
    }
    faust-flow-canvas.has-animations.animating .Frame199 {
      width: 312px !important;
      visibility: visible;
      transition: width 0.8s cubic-bezier(0.25, 1, 0.5, 1) 1.35s, 
                  visibility 0s 1.35s;
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
      transition: opacity 0.7s ease 1.35s, 
                  filter 0.7s ease 1.35s, 
                  transform 0.8s cubic-bezier(0.25, 1, 0.5, 1) 1.35s;
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
      transition: opacity 0.4s ease 2.15s, transform 0.8s cubic-bezier(0.25, 1, 0.5, 1) 2.15s;
    }

    /* Frame198 (Database Flat + Arrow 3 reverse) */
    faust-flow-canvas.has-animations .Frame198 {
      width: 0px !important;
      visibility: hidden;
    }
    faust-flow-canvas.has-animations.animating .Frame198 {
      width: 152px !important;
      visibility: visible;
      transition: width 0.8s cubic-bezier(0.25, 1, 0.5, 1) 2.5s, 
                  visibility 0s 2.5s;
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
      transition: opacity 0.7s ease 2.5s, 
                  filter 0.7s ease 2.5s, 
                  transform 0.8s cubic-bezier(0.25, 1, 0.5, 1) 2.5s;
    }

    /* Arrow 3 (reverse) inside Frame198 (stretches) */
    faust-flow-canvas.has-animations .Frame198 faust-flow-arrow {
      opacity: 0;
      transform: scaleX(0);
      transform-origin: left;
    }
    faust-flow-canvas.has-animations.animating .Frame198 faust-flow-arrow {
      opacity: 1;
      transform: scaleX(1);
      transition: opacity 0.4s ease 3.3s, transform 0.8s cubic-bezier(0.25, 1, 0.5, 1) 3.3s;
    }

    /* Frame201 (Card B - Blue) */
    faust-flow-canvas.has-animations .Frame201 {
      width: 0px !important;
      visibility: hidden;
    }
    faust-flow-canvas.has-animations.animating .Frame201 {
      width: 240px !important;
      visibility: visible;
      transition: width 0.8s cubic-bezier(0.25, 1, 0.5, 1) 3.65s, 
                  visibility 0s 3.65s;
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
      transition: opacity 0.7s ease 3.65s, 
                  filter 0.7s ease 3.65s, 
                  transform 0.8s cubic-bezier(0.25, 1, 0.5, 1) 3.65s;
    }

    /* Blue Card B Glow effect inside Frame201 */
    faust-flow-canvas.has-animations .Frame201 faust-flow-card[bg="blue"] {
      box-shadow: 0 0 0px rgba(0, 48, 255, 0) !important;
    }
    faust-flow-canvas.has-animations.animating .Frame201 faust-flow-card[bg="blue"] {
      box-shadow: 0px 4px 160px rgba(0, 48, 255, 0.90) !important;
      transition: box-shadow 1.0s cubic-bezier(0.25, 1, 0.5, 1) 4.45s;
    }
    faust-flow-canvas.has-animations .Frame201 faust-flow-card[bg="blue"] .Frame {
      filter: brightness(0.6);
    }
    faust-flow-canvas.has-animations.animating .Frame201 faust-flow-card[bg="blue"] .Frame {
      filter: brightness(1) !important;
      transition: filter 1.0s cubic-bezier(0.25, 1, 0.5, 1) 4.45s;
    }

    /* Labels inside Canvas 1 (fade, slide up and blur transition) */
    faust-flow-canvas.has-animations faust-flow-label[left="80"] {
      opacity: 0;
      filter: blur(6px);
      transform: translateY(10px);
    }
    faust-flow-canvas.has-animations.animating faust-flow-label[left="80"] {
      opacity: 1;
      filter: blur(0);
      transform: translateY(0);
      transition: opacity 0.7s ease 1.35s, 
                  filter 0.7s ease 1.35s, 
                  transform 0.8s cubic-bezier(0.25, 1, 0.5, 1) 1.35s;
    }

    faust-flow-canvas.has-animations faust-flow-label[left="560"] {
      opacity: 0;
      filter: blur(6px);
      transform: translateY(10px);
    }
    faust-flow-canvas.has-animations.animating faust-flow-label[left="560"] {
      opacity: 1;
      filter: blur(0);
      transform: translateY(0);
      transition: opacity 0.7s ease 3.65s, 
                  filter 0.7s ease 3.65s, 
                  transform 0.8s cubic-bezier(0.25, 1, 0.5, 1) 3.65s;
    }


    /* --- CANVAS 2 (A/B TESTING) --- */

    /* FlowDetails layout alignment - keep flex-start to align perfectly with the grid background */

    /* FlowMetricsContainer */
    faust-flow-canvas.has-animations .FlowMetricsContainer {
      width: 80px !important;
    }
    faust-flow-canvas.has-animations.animating .FlowMetricsContainer {
      width: 232px !important;
      transition: width 0.8s cubic-bezier(0.25, 1, 0.5, 1) 1.0s;
    }

    /* Split-down arrow inside FlowMetricsContainer (stretches) */
    faust-flow-canvas.has-animations .FlowMetricsContainer faust-flow-arrow-split-down {
      opacity: 0;
      transform: scale(0);
      transform-origin: left;
    }
    faust-flow-canvas.has-animations.animating .FlowMetricsContainer faust-flow-arrow-split-down {
      opacity: 1;
      transform: scale(1);
      transition: opacity 0.4s ease 1.0s, transform 0.8s cubic-bezier(0.25, 1, 0.5, 1) 1.0s;
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
      transition: opacity 0.6s ease 1.4s, transform 0.6s cubic-bezier(0.25, 1, 0.5, 1) 1.4s;
    }

    /* Column AB */
    faust-flow-canvas.has-animations .AB {
      width: 0px !important;
      visibility: hidden;
    }
    faust-flow-canvas.has-animations.animating .AB {
      width: 80px !important;
      visibility: visible;
      transition: width 0.8s cubic-bezier(0.25, 1, 0.5, 1) 1.35s, 
                  visibility 0s 1.35s;
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
      transition: opacity 0.7s ease 1.35s, 
                  filter 0.7s ease 1.35s, 
                  transform 0.8s cubic-bezier(0.25, 1, 0.5, 1) 1.35s;
    }

    /* Variant B Glow effect inside AB */
    faust-flow-canvas.has-animations .AB faust-flow-icon[bg="blue"] {
      box-shadow: 0 0 0px rgba(0, 48, 255, 0) !important;
    }
    faust-flow-canvas.has-animations.animating .AB faust-flow-icon[bg="blue"] {
      box-shadow: 0px 4px 160px rgba(0, 48, 255, 0.90) !important;
      transition: box-shadow 1.0s cubic-bezier(0.25, 1, 0.5, 1) 2.15s;
    }
    faust-flow-canvas.has-animations .AB faust-flow-icon[bg="blue"] .Frame {
      filter: brightness(0.6);
    }
    faust-flow-canvas.has-animations.animating .AB faust-flow-icon[bg="blue"] .Frame {
      filter: brightness(1) !important;
      transition: filter 1.0s cubic-bezier(0.25, 1, 0.5, 1) 2.15s;
    }

    /* FrameMergeDb (Testing canvas third block) */
    faust-flow-canvas.has-animations .FrameMergeDb {
      width: 0px !important;
      visibility: hidden;
    }
    faust-flow-canvas.has-animations.animating .FrameMergeDb {
      width: 152px !important;
      visibility: visible;
      transition: width 0.8s cubic-bezier(0.25, 1, 0.5, 1) 2.15s, 
                  visibility 0s 2.15s;
    }

    /* Merge Arrow inside FrameMergeDb (stretches) */
    faust-flow-canvas.has-animations .FrameMergeDb faust-flow-arrow-merge-right {
      opacity: 0;
      transform: scaleX(0);
      transform-origin: left;
    }
    faust-flow-canvas.has-animations.animating .FrameMergeDb faust-flow-arrow-merge-right {
      opacity: 1;
      transform: scaleX(1);
      transition: opacity 0.4s ease 2.15s, transform 0.8s cubic-bezier(0.25, 1, 0.5, 1) 2.15s;
    }

    /* Database Icon inside FrameMergeDb (zoom + focus fade) */
    faust-flow-canvas.has-animations .FrameMergeDb faust-flow-icon {
      opacity: 0;
      filter: blur(8px);
      transform: scale(0.9);
    }
    faust-flow-canvas.has-animations.animating .FrameMergeDb faust-flow-icon {
      opacity: 1;
      filter: blur(0);
      transform: scale(1);
      transition: opacity 0.7s ease 2.5s, 
                  filter 0.7s ease 2.5s, 
                  transform 0.8s cubic-bezier(0.25, 1, 0.5, 1) 2.5s;
    }

    /* FrameCardMetrics (Testing canvas fourth block) */
    faust-flow-canvas.has-animations .FrameCardMetrics {
      width: 0px !important;
      visibility: hidden;
      margin-left: -8px !important;
    }
    faust-flow-canvas.has-animations.animating .FrameCardMetrics {
      width: 641px !important;
      visibility: visible;
      margin-left: -8px !important;
      transition: width 0.8s cubic-bezier(0.25, 1, 0.5, 1) 3.3s, 
                  visibility 0s 3.3s;
    }

    /* Linear Arrow inside FrameCardMetrics (stretches) */
    faust-flow-canvas.has-animations .FrameCardMetrics faust-flow-arrow {
      opacity: 0;
      transform: scaleX(0);
      transform-origin: left;
    }
    faust-flow-canvas.has-animations.animating .FrameCardMetrics faust-flow-arrow {
      opacity: 1;
      transform: scaleX(1);
      transition: opacity 0.4s ease 3.3s, transform 0.8s cubic-bezier(0.25, 1, 0.5, 1) 3.3s;
    }

    /* Card Metrics inside FrameCardMetrics (zoom + focus fade) */
    faust-flow-canvas.has-animations .FrameCardMetrics faust-flow-card {
      opacity: 0;
      filter: blur(8px);
      transform: scale(0.95);
    }
    faust-flow-canvas.has-animations.animating .FrameCardMetrics faust-flow-card {
      opacity: 1;
      filter: blur(0);
      transform: scale(1);
      transition: opacity 0.8s ease 3.65s, 
                  filter 0.8s ease 3.65s, 
                  transform 0.8s cubic-bezier(0.25, 1, 0.5, 1) 3.65s;
    }

    /* Mobile specific overrides: prevent centering alignment during entrance animations */
    @media (max-width: 980px) {
      faust-flow-canvas.has-animations .ContentRow {
        justify-content: flex-start !important;
      }
    }

    /* --- FAST REPLAY OVERRIDES (WITHOUT INITIAL PAUSE & CONTINUOUS FLOW) --- */

    /* Canvas 1 Fast Replay */
    faust-flow-canvas.has-animations.animating.fast-replay .Vector {
      transition: opacity 1.0s ease;
    }
    faust-flow-canvas.has-animations.animating.fast-replay .Frame13 {
      transition: width 0.6s cubic-bezier(0.25, 1, 0.5, 1) 0s;
    }
    faust-flow-canvas.has-animations.animating.fast-replay .Frame13 faust-flow-icon {
      transition: transform 0.5s cubic-bezier(0.25, 1, 0.5, 1) 0s;
    }
    faust-flow-canvas.has-animations.animating.fast-replay .Frame13 faust-flow-arrow {
      transition: opacity 0.3s ease 0s, transform 0.6s cubic-bezier(0.25, 1, 0.5, 1) 0s;
    }
    faust-flow-canvas.has-animations.animating.fast-replay .Frame199 {
      transition: width 0.6s cubic-bezier(0.25, 1, 0.5, 1) 0.125s, visibility 0s 0.125s;
    }
    faust-flow-canvas.has-animations.animating.fast-replay .Frame199 faust-flow-card {
      transition: opacity 0.5s ease 0.125s, filter 0.5s ease 0.125s, transform 0.6s cubic-bezier(0.25, 1, 0.5, 1) 0.125s;
    }
    faust-flow-canvas.has-animations.animating.fast-replay .Frame199 faust-flow-arrow {
      transition: opacity 0.3s ease 0.5s, transform 0.6s cubic-bezier(0.25, 1, 0.5, 1) 0.5s;
    }
    faust-flow-canvas.has-animations.animating.fast-replay .Frame198 {
      transition: width 0.6s cubic-bezier(0.25, 1, 0.5, 1) 0.625s, visibility 0s 0.625s;
    }
    faust-flow-canvas.has-animations.animating.fast-replay .Frame198 faust-flow-icon {
      transition: opacity 0.5s ease 0.625s, filter 0.5s ease 0.625s, transform 0.6s cubic-bezier(0.25, 1, 0.5, 1) 0.625s;
    }
    faust-flow-canvas.has-animations.animating.fast-replay .Frame198 faust-flow-arrow {
      transition: opacity 0.3s ease 1.0s, transform 0.6s cubic-bezier(0.25, 1, 0.5, 1) 1.0s;
    }
    faust-flow-canvas.has-animations.animating.fast-replay .Frame201 {
      transition: width 0.6s cubic-bezier(0.25, 1, 0.5, 1) 1.125s, visibility 0s 1.125s;
    }
    faust-flow-canvas.has-animations.animating.fast-replay .Frame201 faust-flow-card {
      transition: opacity 0.5s ease 1.125s, filter 0.5s ease 1.125s, transform 0.6s cubic-bezier(0.25, 1, 0.5, 1) 1.125s;
    }
    faust-flow-canvas.has-animations.animating.fast-replay .Frame201 faust-flow-card[bg="blue"] {
      transition: box-shadow 0.8s cubic-bezier(0.25, 1, 0.5, 1) 1.6s;
    }
    faust-flow-canvas.has-animations.animating.fast-replay .Frame201 faust-flow-card[bg="blue"] .Frame {
      transition: filter 0.8s cubic-bezier(0.25, 1, 0.5, 1) 1.6s;
    }

    /* Canvas 1 Labels Fast Replay */
    faust-flow-canvas.has-animations.animating.fast-replay faust-flow-label[left="80"] {
      transition: opacity 0.5s ease 0.125s, filter 0.5s ease 0.125s, transform 0.6s cubic-bezier(0.25, 1, 0.5, 1) 0.125s;
    }
    faust-flow-canvas.has-animations.animating.fast-replay faust-flow-label[left="560"] {
      transition: opacity 0.5s ease 1.125s, filter 0.5s ease 1.125s, transform 0.6s cubic-bezier(0.25, 1, 0.5, 1) 1.125s;
    }

    /* Canvas 2 Fast Replay */
    faust-flow-canvas.has-animations.animating.fast-replay .FlowMetricsContainer {
      transition: width 0.6s cubic-bezier(0.25, 1, 0.5, 1) 0s;
    }
    faust-flow-canvas.has-animations.animating.fast-replay .FlowMetricsContainer faust-flow-arrow-split-down {
      transition: opacity 0.3s ease 0s, transform 0.6s cubic-bezier(0.25, 1, 0.5, 1) 0s;
    }
    faust-flow-canvas.has-animations.animating.fast-replay .FlowMetricsContainer .FlowArrowContainer2,
    faust-flow-canvas.has-animations.animating.fast-replay .FlowMetricsContainer .FlowPercentage1 {
      transition: opacity 0.45s ease 0.4s, transform 0.45s cubic-bezier(0.25, 1, 0.5, 1) 0.4s;
    }
    faust-flow-canvas.has-animations.animating.fast-replay .AB {
      transition: width 0.6s cubic-bezier(0.25, 1, 0.5, 1) 0.125s, visibility 0s 0.125s;
    }
    faust-flow-canvas.has-animations.animating.fast-replay .AB faust-flow-icon {
      transition: opacity 0.5s ease 0.125s, filter 0.5s ease 0.125s, transform 0.6s cubic-bezier(0.25, 1, 0.5, 1) 0.125s;
    }
    faust-flow-canvas.has-animations.animating.fast-replay .AB faust-flow-icon[bg="blue"] {
      transition: box-shadow 0.8s cubic-bezier(0.25, 1, 0.5, 1) 0.625s;
    }
    faust-flow-canvas.has-animations.animating.fast-replay .AB faust-flow-icon[bg="blue"] .Frame {
      transition: filter 0.8s cubic-bezier(0.25, 1, 0.5, 1) 0.625s;
    }
    faust-flow-canvas.has-animations.animating.fast-replay .FrameMergeDb {
      transition: width 0.6s cubic-bezier(0.25, 1, 0.5, 1) 0.5s, visibility 0s 0.5s;
    }
    faust-flow-canvas.has-animations.animating.fast-replay .FrameMergeDb faust-flow-arrow-merge-right {
      transition: opacity 0.3s ease 0.5s, transform 0.6s cubic-bezier(0.25, 1, 0.5, 1) 0.5s;
    }
    faust-flow-canvas.has-animations.animating.fast-replay .FrameMergeDb faust-flow-icon {
      transition: opacity 0.5s ease 0.625s, filter 0.5s ease 0.625s, transform 0.6s cubic-bezier(0.25, 1, 0.5, 1) 0.625s;
    }
    faust-flow-canvas.has-animations.animating.fast-replay .FrameCardMetrics {
      transition: width 0.6s cubic-bezier(0.25, 1, 0.5, 1) 1.0s, visibility 0s 1.0s;
    }
    faust-flow-canvas.has-animations.animating.fast-replay .FrameCardMetrics faust-flow-arrow {
      transition: opacity 0.3s ease 1.0s, transform 0.6s cubic-bezier(0.25, 1, 0.5, 1) 1.0s;
    }
    faust-flow-canvas.has-animations.animating.fast-replay .FrameCardMetrics faust-flow-card {
      transition: opacity 0.6s ease 1.125s, filter 0.6s ease 1.125s, transform 0.6s cubic-bezier(0.25, 1, 0.5, 1) 1.125s;
    }

    /* --- PROJECTOR GLOW SWEEP EFFECT --- */

    faust-flow-card .Frame::before,
    faust-flow-icon .Frame::before {
      content: '';
      position: absolute;
      top: 0;
      left: -70%;
      width: 240%;
      height: 100%;
      background: linear-gradient(
        115deg,
        rgba(255, 255, 255, 0) 0%,
        rgba(255, 255, 255, 0.01) 30%,
        rgba(255, 255, 255, 0.08) 45%,
        rgba(255, 255, 255, 0.20) 50%,
        rgba(255, 255, 255, 0.08) 55%,
        rgba(255, 255, 255, 0.01) 70%,
        rgba(255, 255, 255, 0) 100%
      );
      transform: translate3d(-100%, 0, 0) skewX(-20deg);
      pointer-events: none;
      opacity: 0;
      z-index: 10;
      mix-blend-mode: screen;
      filter: blur(12px);
    }

    /* Special tinted gradient for blue cards and icons */
    faust-flow-card[bg="blue"] .Frame::before,
    faust-flow-icon[bg="blue"] .Frame::before {
      background: linear-gradient(
        115deg,
        rgba(0, 48, 255, 0) 0%,
        rgba(100, 150, 255, 0.03) 30%,
        rgba(170, 210, 255, 0.15) 45%,
        rgba(255, 255, 255, 0.40) 50%,
        rgba(170, 210, 255, 0.15) 55%,
        rgba(100, 150, 255, 0.03) 70%,
        rgba(0, 48, 255, 0) 100%
      );
      mix-blend-mode: screen;
      filter: blur(12px);
    }

    faust-flow-card.sweep-active .Frame::before,
    faust-flow-icon.sweep-active .Frame::before {
      animation: projector-sweep-local var(--sweep-duration, 1s) linear forwards;
    }

    /* Loop the projector light sweep when hovered */
    faust-flow-card.hover-active .Frame::before,
    faust-flow-icon.hover-active .Frame::before {
      animation: projector-sweep-local var(--sweep-duration, 1s) linear infinite !important;
    }

    /* Slow replay: remove the one-second introduction while preserving every
       subsequent interval of the original sequence. These are CSS rules (not
       post-start JS mutations), so the browser schedules them from frame zero. */
    faust-flow-canvas.is-restarting.has-animations.animating .Frame13,
    faust-flow-canvas.is-restarting.has-animations.animating .Frame13 faust-flow-arrow,
    faust-flow-canvas.is-restarting.has-animations.animating .FlowMetricsContainer,
    faust-flow-canvas.is-restarting.has-animations.animating .FlowMetricsContainer faust-flow-arrow-split-down { transition-delay: 0s; }

    faust-flow-canvas.is-restarting.has-animations.animating .Frame199,
    faust-flow-canvas.is-restarting.has-animations.animating .Frame199 faust-flow-card,
    faust-flow-canvas.is-restarting.has-animations.animating faust-flow-label[left="80"],
    faust-flow-canvas.is-restarting.has-animations.animating .AB,
    faust-flow-canvas.is-restarting.has-animations.animating .AB faust-flow-icon { transition-delay: .35s; }

    faust-flow-canvas.is-restarting.has-animations.animating .FlowMetricsContainer .FlowArrowContainer2,
    faust-flow-canvas.is-restarting.has-animations.animating .FlowMetricsContainer .FlowPercentage1 { transition-delay: .4s; }

    faust-flow-canvas.is-restarting.has-animations.animating .Frame199 faust-flow-arrow,
    faust-flow-canvas.is-restarting.has-animations.animating .AB faust-flow-icon[bg="blue"],
    faust-flow-canvas.is-restarting.has-animations.animating .AB faust-flow-icon[bg="blue"] .Frame,
    faust-flow-canvas.is-restarting.has-animations.animating .FrameMergeDb,
    faust-flow-canvas.is-restarting.has-animations.animating .FrameMergeDb faust-flow-arrow-merge-right { transition-delay: 1.15s; }

    faust-flow-canvas.is-restarting.has-animations.animating .Frame198,
    faust-flow-canvas.is-restarting.has-animations.animating .Frame198 faust-flow-icon,
    faust-flow-canvas.is-restarting.has-animations.animating .FrameMergeDb faust-flow-icon { transition-delay: 1.5s; }

    faust-flow-canvas.is-restarting.has-animations.animating .Frame198 faust-flow-arrow,
    faust-flow-canvas.is-restarting.has-animations.animating .FrameCardMetrics,
    faust-flow-canvas.is-restarting.has-animations.animating .FrameCardMetrics faust-flow-arrow { transition-delay: 2.3s; }

    faust-flow-canvas.is-restarting.has-animations.animating .Frame201,
    faust-flow-canvas.is-restarting.has-animations.animating .Frame201 faust-flow-card,
    faust-flow-canvas.is-restarting.has-animations.animating faust-flow-label[left="560"],
    faust-flow-canvas.is-restarting.has-animations.animating .FrameCardMetrics faust-flow-card { transition-delay: 2.65s; }

    faust-flow-canvas.is-restarting.has-animations.animating .Frame201 faust-flow-card[bg="blue"],
    faust-flow-canvas.is-restarting.has-animations.animating .Frame201 faust-flow-card[bg="blue"] .Frame { transition-delay: 3.45s; }

    @keyframes projector-sweep-local {
      0% {
        transform: translate3d(-70%, 0, 0) skewX(-20deg);
        opacity: 0;
      }
      5% {
        opacity: 1;
      }
      95% {
        opacity: 1;
      }
      100% {
        transform: translate3d(70%, 0, 0) skewX(-20deg);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
})();

// Global scroll speed tracker for flow canvases
let globalScrollSpeed = 0;
let lastScrollY = typeof window !== 'undefined' ? window.scrollY : 0;
let lastScrollTime = Date.now();
let globalScrollTimeout = null;
let globalDumbScrollTriggered = false;

if (typeof window !== 'undefined') {
  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY || 0;
    const currentTime = Date.now();
    const deltaY = Math.abs(currentScrollY - lastScrollY);
    const deltaTime = currentTime - lastScrollTime;

    if (deltaTime > 0) {
      const instantSpeed = deltaY / deltaTime; // px/ms
      globalScrollSpeed = globalScrollSpeed * 0.65 + instantSpeed * 0.35;
    }

    lastScrollY = currentScrollY;
    lastScrollTime = currentTime;

    if (globalScrollTimeout) clearTimeout(globalScrollTimeout);
    globalScrollTimeout = setTimeout(() => {
      globalScrollSpeed = 0;
    }, 150);
  }, { passive: true });
}

/* ==========================================================================
   ATOMS (ÁTOMOS)
   ========================================================================== */

/**
 * FaustFlowCubeSvg: Atom component that renders only the vector 3D cube SVG.
 * Supports size="small" (20x22 viewBox) and size="large" (22x25 viewBox).
 */
class FaustFlowCubeSvg extends HTMLElement {
  connectedCallback() {
    if (this._initialized) return;
    this._initialized = true;
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
    if (this._initialized) return;
    this._initialized = true;
    const left = this.getAttribute('left') || '0';
    const top = this.getAttribute('top') || '0';
    const fromColor = this.getAttribute('from-color') || '#D3D7D6';
    const toColor = this.getAttribute('to-color') || '#191919';
    const fromOpacity = this.getAttribute('from-opacity') || '1';
    const toOpacity = this.getAttribute('to-opacity') || '1';
    const reverse = this.getAttribute('reverse') === 'true';
    const length = Math.max(73, Number.parseFloat(this.getAttribute('length')) || 73);

    const x1 = reverse ? length - 1 : 0;
    const x2 = reverse ? 0 : length - 1;
    const gradId = 'arrow-grad-' + Math.random().toString(36).substr(2, 9);

    const headD = reverse
      ? "M72.7071 6.65691C73.0976 7.04743 73.0976 7.6806 72.7071 8.07112L66.3431 14.4351C65.9526 14.8256 65.3195 14.8256 64.9289 14.4351C64.5384 14.0446 64.5384 13.4114 64.9289 13.0209L70.5858 7.36401L64.9289 1.70716C64.5384 1.31664 64.5384 0.68347 64.9289 0.292946C65.3195 -0.0975785 65.9526 -0.0975785 66.3431 0.292946L72.7071 6.65691Z"
      : "M72.7071 8.07112C73.0976 7.6806 73.0976 7.04743 72.7071 6.65691L66.3431 0.292946C65.9526 -0.0975785 65.3195 -0.0975785 64.9289 0.292946C64.5384 0.68347 64.5384 1.31664 64.9289 1.70716L70.5858 7.36401L64.9289 13.0209C64.5384 13.4114 64.5384 14.0446 64.9289 14.4351C65.3195 14.8256 65.9526 14.8256 66.3431 14.4351L72.7071 8.07112Z";
    const leftHeadD = "M0.2929 8.07112C-0.0976 7.6806 -0.0976 7.04743 0.2929 6.65691L6.6569 0.292946C7.0474 -0.0975785 7.6805 -0.0975785 8.0711 0.292946C8.4616 0.68347 8.4616 1.31664 8.0711 1.70716L2.4142 7.36401L8.0711 13.0209C8.4616 13.4114 8.4616 14.0446 8.0711 14.4351C7.6805 14.8256 7.0474 14.8256 6.6569 14.4351L0.2929 8.07112Z";

    this.style.left = left + 'px';
    this.style.top = top + 'px';
    this.style.position = 'absolute';
    this.style.display = 'block';

    const stemD = `M 0 7.364 H ${length}`;
    const pulseLineD = `M 0 7.364 H ${length}`;
    const headTransform = length === 73 ? '' : `translate(${length - 73} 0)`;

    this.innerHTML = `
      <svg width="${length}" height="15" viewBox="0 0 ${length} 15" data-base-width="${length}" data-base-viewbox="0 0 ${length} 15" data-base-stem="${stemD}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path class="elastic-arrow-stem" d="${stemD}" stroke="url(#${gradId})" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path class="elastic-arrow-head" d="${headD}" data-base-d="${headD}" data-base-transform="${headTransform}" data-right-d="${headD}" data-left-d="${leftHeadD}"${headTransform ? ` transform="${headTransform}"` : ''} fill="url(#${gradId})"/>
        <path d="${pulseLineD}" stroke="rgba(255, 255, 255, 0.45)" stroke-width="1.5" class="flow-line-pulse" stroke-linecap="round" stroke-linejoin="round"/>
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
    if (this._initialized) return;
    this._initialized = true;
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
        <path d="M 0 77.364 H 44.9375 C 64.8197 77.364 80.9375 61.2463 80.9375 42.364 C 80.9375 23.5863 96.1598 8.36401 114.938 8.36401 H 152" stroke="rgba(255, 255, 255, 0.45)" stroke-width="1.5" class="flow-line-pulse" stroke-linecap="round" fill="none"/>
        <path d="M 0 77.3953 H 44.9375 C 63.7152 77.3953 78.9375 92.6176 78.9375 112.395 C 78.9375 131.173 96.1598 147.395 114.938 147.395 H 152" stroke="rgba(255, 255, 255, 0.45)" stroke-width="1.5" class="flow-line-pulse" stroke-linecap="round" fill="none"/>
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
    if (this._initialized) return;
    this._initialized = true;
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
        <path d="M 0 0.849609 L 26.4083 17.241 C 30.3668 19.6983 34.9333 20.8496 39.5924 20.8496 H 64.5273" stroke="rgba(255, 255, 255, 0.45)" stroke-width="1.5" class="flow-line-pulse" stroke-linecap="round" fill="none"/>
        <path d="M 0 40.8496 L 26.4083 24.4582 C 30.3668 22.0011 34.9333 20.8496 39.5924 20.8496 H 64.5273" stroke="rgba(255, 255, 255, 0.45)" stroke-width="1.5" class="flow-line-pulse" stroke-linecap="round" fill="none"/>
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

    if (!this._originalHTML) {
      const existingLabel = this.querySelector('.Label');
      if (existingLabel) {
        this._originalHTML = existingLabel.innerHTML;
      } else {
        this._originalHTML = this.innerHTML;
      }
    }

    this.innerHTML = `
      <div data-layer="Label" class="Label" style="width: 100%; text-box-trim: trim-both; text-box-edge: cap alphabetic; text-align: center">
        ${this._originalHTML}
      </div>
    `;

    if (this._handleCompanyChange) {
      window.removeEventListener('faust-company-confirmed', this._handleCompanyChange);
      this._handleCompanyChange = null;
    }

    if (left === '80') {
      this._handleCompanyChange = (e) => {
        this.updateText(e.detail);
      };
      window.addEventListener('faust-company-confirmed', this._handleCompanyChange);

      if (window.confirmedCompany) {
        this.updateText(window.confirmedCompany);
      }
    }
  }

  updateText(companyName) {
    const labelDiv = this.querySelector('.Label');
    if (!labelDiv || !this._originalHTML) return;

    if (companyName && companyName.trim() !== '' && companyName.length <= 24) {
      const nameEscaped = companyName.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      const spanReplacement = `<span class="notranslate" translate="no" style="color: white;">${nameEscaped}</span>`;
      const newHTML = this._originalHTML.replace(/Tu\s+empresa/gi, spanReplacement);
      labelDiv.innerHTML = newHTML;
    } else {
      labelDiv.innerHTML = this._originalHTML;
    }
  }

  disconnectedCallback() {
    if (this._handleCompanyChange) {
      window.removeEventListener('faust-company-confirmed', this._handleCompanyChange);
      this._handleCompanyChange = null;
    }
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
    if (this._initialized) return;
    this._initialized = true;
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
    if (this._initialized) return;
    this._initialized = true;
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
      bgStyle = 'background: #0030FF;';
      extraClass = 'gradient-border gradient-border-blue';
      this.style.boxShadow = '0px 4px 160px rgba(0, 48, 255, 0.80)';
      this.style.borderRadius = radius + 'px';
    }

    const svgs = {
      'user': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.68517 19.8344C4.98086 18.8502 5.58591 17.9876 6.41057 17.3745C7.23522 16.7614 8.23554 16.4305 9.26313 16.4308H14.0418C15.0707 16.4304 16.0723 16.7622 16.8975 17.3767C17.7228 17.9912 18.3276 18.8557 18.6222 19.8415M22.404 11.6519C22.404 17.5901 17.5902 22.4039 11.652 22.4039C5.71386 22.4039 0.900024 17.5901 0.900024 11.6519C0.900024 5.71374 5.71386 0.899902 11.652 0.899902C17.5902 0.899902 22.404 5.71374 22.404 11.6519ZM15.2352 9.26251C15.2352 11.2419 13.6306 12.8465 11.6512 12.8465C9.67182 12.8465 8.0672 11.2419 8.0672 9.26251C8.0672 7.28312 9.67182 5.67851 11.6512 5.67851C13.6306 5.67851 15.2352 7.28312 15.2352 9.26251Z" stroke="#1A1A1A" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      'users': `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0.899902 20.9001V18.6779C0.899902 17.4991 1.36815 16.3687 2.20165 15.5352C3.03514 14.7017 4.16561 14.2334 5.34445 14.2334H9.78879C10.9675 14.2334 12.098 14.7017 12.9315 15.5352C13.765 16.3687 14.2332 17.4991 14.2332 18.6779V20.9001M15.3443 1.04445C16.3003 1.28923 17.1477 1.84523 17.7528 2.6248C18.3579 3.40436 18.6863 4.36315 18.6863 5.35001C18.6863 6.33686 18.3579 7.29565 17.7528 8.07521C17.1477 8.85478 16.3003 9.41078 15.3443 9.65556M20.9001 20.9V18.6778C20.8944 17.6968 20.5644 16.7453 19.9615 15.9715C19.3585 15.1978 18.5165 14.6452 17.5667 14.4M12.0112 5.34447C12.0112 7.79907 10.0214 9.78892 7.5668 9.78892C5.1122 9.78892 3.12235 7.79907 3.12235 5.34447C3.12235 2.88987 5.1122 0.900024 7.5668 0.900024C10.0214 0.900024 12.0112 2.88987 12.0112 5.34447Z" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      'database': `<svg width="20" height="22" viewBox="0 0 20 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18.2332 4.15002C18.2332 5.94495 14.353 7.40002 9.56657 7.40002C4.7801 7.40002 0.899902 5.94495 0.899902 4.15002M18.2332 4.15002C18.2332 2.3551 14.353 0.900024 9.56657 0.900024C4.7801 0.900024 0.899902 2.3551 0.899902 4.15002M18.2332 4.15002V10.65M0.899902 4.15002V10.65M0.899902 10.65C0.899902 11.512 1.813 12.3386 3.43831 12.9481C5.06363 13.5576 7.26803 13.9 9.56657 13.9C11.8651 13.9 14.0695 13.5576 15.6948 12.9481C17.3201 12.3386 18.2332 11.512 18.2332 10.65M0.899902 10.65V17.15C0.899902 18.012 1.813 18.8386 3.43831 19.4481C5.06363 20.0576 7.26803 20.4 9.56657 20.4C11.8651 20.4 14.0695 20.0576 15.6948 19.4481C17.3201 18.8385 18.2332 18.012 18.2332 17.15V10.65" stroke="#1A1A1A" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      'database-flat': `<svg width="30" height="23" viewBox="0 0 30 23" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 7.1875V11.5L30 4.3125V0L0 7.1875Z" fill="#1A1A1A"/><path d="M2.42541 13.7939C1.00305 14.1347 0 15.4064 0 16.869V23H3.57143V17.9688L30 11.5V7.1875L2.42541 13.7939Z" fill="#1A1A1A"/></svg>`
    };

    // Extract label node if present in child DOM to preserve translation
    let labelText = '';
    const labelNode = this.querySelector('.icon-label, [slot="label"]');
    if (labelNode) {
      labelText = labelNode.innerHTML;
      labelNode.remove();
    } else {
      labelText = this.getAttribute('label') || '';
    }

    let labelHtml = '';
    if (labelText) {
      const labelWidth = parseInt(this.getAttribute('label-width') || '80', 10);
      const labelLeft = (80 - labelWidth) / 2;
      labelHtml = `
        <div data-layer="Label" class="Label" style="left: ${labelLeft}px; width: ${labelWidth}px; top: 104px; position: absolute; text-box-trim: trim-both; text-box-edge: cap alphabetic; text-align: center; color: rgba(255, 255, 255, 0.50); font-size: 14px; font-family: BDO Grotesk, sans-serif; line-height: 19.60px; letter-spacing: 0.28px; word-wrap: break-word">
          ${labelText}
        </div>
      `;
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

    const overflowVal = 'hidden';

    this.innerHTML = `
      <div data-layer="Icon Container" class="IconContainer" style="width: 80px; height: 80px; left: 0px; top: 0px; position: absolute">
        <div data-layer="Frame" class="Frame ${extraClass}" style="width: 80px; height: 80px; left: 0px; top: 0px; position: absolute; ${bgStyle} overflow: ${overflowVal}; border-radius: ${radius}px; display: flex; align-items: center; justify-content: center;">
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
    if (this._initialized) return;
    this._initialized = true;
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
          <div data-layer="Description" class="Description" style="width: ${width}px; left: 0px; top: 124px; position: absolute; text-box-trim: trim-both; text-box-edge: cap alphabetic; text-align: center; color: rgba(255, 255, 255, 0.50); font-size: 14px; font-family: BDO Grotesk, sans-serif; line-height: 19.60px; letter-spacing: 0.28px; word-wrap: break-word">${descAttr}</div>
        `;
      }
    }

    let bgStyle = '';
    let extraClass = 'gradient-border';
    if (bg === 'dark') {
      bgStyle = 'background: #171819;';
    } else if (bg === 'blue') {
      bgStyle = 'background: #0022FF;';
      extraClass = 'gradient-border gradient-border-blue';
    } else if (bg === 'gray-dark') {
      bgStyle = 'background: #171819;';
    }

    let radius = width > 400 ? '30px' : '40px';

    this.style.width = width + 'px';
    this.style.height = height + 'px';
    this.style.left = left + 'px';
    this.style.top = top + 'px';
    this.style.position = 'absolute';
    this.style.display = 'block';

    if (bg === 'blue' || shadow) {
      this.style.boxShadow = '0px 4px 200px rgba(0, 48, 255, 0.80)';
      this.style.borderRadius = radius;
    }

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
    const overflowVal = 'hidden';

    this.innerHTML = `
      <div data-layer="Item Details" class="ItemDetails" style="width: ${width}px; height: ${height}px; left: 0px; top: 0px; position: absolute">
        <div data-layer="Frame" class="Frame ${extraClass}" style="width: ${width}px; height: ${frameHeight}px; left: 0px; top: 0px; position: absolute; ${bgStyle} overflow: ${overflowVal}; border-radius: ${radius};">
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
  refreshSweepGeometry() {
    const flow = this.querySelector('.Flow');
    if (!flow) return [];

    const beamWidth = 300;
    const beamVelocity = 250;
    this._sweepGeometry = Array.from(
      this.querySelectorAll('faust-flow-card, faust-flow-icon')
    ).map((comp) => {
      let left = 0;
      let current = comp;
      while (current && current !== flow) {
        left += current.offsetLeft || 0;
        current = current.offsetParent;
      }

      const width = comp.offsetWidth || 80;
      const duration = (width + beamWidth) / beamVelocity;
      comp.style.setProperty('--sweep-duration', `${duration.toFixed(4)}s`);
      return { comp, start: left / beamVelocity, duration };
    });

    return this._sweepGeometry;
  }

  stopSweepLoop() {
    if (this._sweepInterval) {
      clearInterval(this._sweepInterval);
      this._sweepInterval = null;
    }
    const components = this._sweepGeometry
      ? this._sweepGeometry.map(({ comp }) => comp)
      : this.querySelectorAll('faust-flow-card, faust-flow-icon');
    components.forEach(comp => {
      if (comp._sweepTimeout) {
        clearTimeout(comp._sweepTimeout);
        comp._sweepTimeout = null;
      }
      if (comp._sweepEndTimeout) {
        clearTimeout(comp._sweepEndTimeout);
        comp._sweepEndTimeout = null;
      }
      comp.classList.remove('sweep-active');
    });
  }

  startSweepLoop() {
    this.stopSweepLoop();
    this.classList.remove('is-restarting');
    this.classList.add('animation-complete');
    
    const runSweep = () => {
      const geometry = this._sweepGeometry || this.refreshSweepGeometry();
      geometry.forEach(({ comp, start, duration }) => {
        
        // Trigger the sweep class after t_start delay
        comp._sweepTimeout = setTimeout(() => {
          comp.classList.add('sweep-active');
          
          comp._sweepEndTimeout = setTimeout(() => {
            comp.classList.remove('sweep-active');
          }, duration * 1000);
        }, start * 1000);
      });
    };
    
    runSweep();
  }

  clearTimers() {
    if (this._seenTimeout) {
      clearTimeout(this._seenTimeout);
      this._seenTimeout = null;
    }
    if (this._playTimeout) {
      clearTimeout(this._playTimeout);
      this._playTimeout = null;
    }
    if (this._replayTimeout) {
      clearTimeout(this._replayTimeout);
      this._replayTimeout = null;
    }
    this.stopSweepLoop();
  }

  checkAndTriggerAnimation(enteredFromBelow) {
    const parentReveal = this.closest('.reveal-item');
    const isParentVisible = !parentReveal || parentReveal.classList.contains('reveal-visible');
    
    if (this._isIntersecting && isParentVisible) {
      if (this.classList.contains('animating')) {
        // Animation was already triggered but we might have scrolled it off-screen and back in.
        // Check if the animation has finished visually (time elapsed >= duration).
        const elapsed = this._animationStartTime ? (Date.now() - this._animationStartTime) : 99999;
        const duration = this._animationDuration || 5500;

        if (elapsed >= duration) {
          // Animation finished while off-screen
          this._hasPlayed = true;
          this.clearTimers();
          this.stopLabelTracking();
          this.alignLabelsOnce();
          this.startSweepLoop();
        } else {
          // Animation is still running, resume tracking and recreate the remaining completion timer
          this.startLabelTracking();
          
          const remaining = duration - elapsed;
          const isReplay = this.classList.contains('fast-replay');
          
          this.clearTimers(); // Clear any stale timers first
          if (isReplay) {
            this._replayTimeout = setTimeout(() => {
              this._hasPlayed = true;
              this._replayTimeout = null;
              this.stopLabelTracking();
              this.alignLabelsOnce();
              this.startSweepLoop();
            }, remaining);
          } else {
            this._playTimeout = setTimeout(() => {
              this._hasPlayed = true;
              this._playTimeout = null;
              this.stopLabelTracking();
              this.alignLabelsOnce();
              this.startSweepLoop();
            }, remaining);
          }
        }
        return;
      }
      this.triggerActualAnimation(enteredFromBelow);
    }
  }

  triggerActualAnimation(enteredFromBelow, forceSlow = false) {
    const width = parseInt(this.getAttribute('width') || '1640', 10);
    const isCanvas2 = width > 1300;
    const normalDuration = isCanvas2 ? 4500 : 5500;
    const replayDuration = isCanvas2 ? 1800 : 2400;

    if (!this._hasPlayed || forceSlow) {
      // If user scrolls fast (dumb scroll) before canvas enters, or if dumb scroll was triggered globally, trigger fast animation immediately
      const isFastScroll = !forceSlow && (globalScrollSpeed > 1.5 || globalDumbScrollTriggered);
      if (isFastScroll) {
        globalDumbScrollTriggered = true;
        this.classList.remove('animating', 'fast-replay');
        void this.offsetWidth; // Force reflow
        this.classList.add('animating', 'fast-replay');

        this._animationStartTime = Date.now();
        this._animationDuration = replayDuration;

        this.startLabelTracking();
        this.clearTimers();

        this._replayTimeout = setTimeout(() => {
          this._hasPlayed = true;
          this._replayTimeout = null;
          this.stopLabelTracking();
          this.alignLabelsOnce();
          this.startSweepLoop();
        }, replayDuration);
        return;
      }

      // First play: normal animation
      this.classList.remove('fast-replay');
      this.classList.remove('animating');
      void this.offsetWidth; // Force reflow
      this.classList.add('animating');
      const animationDuration = forceSlow && this.classList.contains('is-restarting')
        ? normalDuration - 1000
        : normalDuration;
      
      this._animationStartTime = Date.now();
      this._animationDuration = animationDuration;

      this.startLabelTracking();
      this.clearTimers();

      // Start continuous seen timer (3 seconds of continuous play)
      this._seenTimeout = setTimeout(() => {
        this._hasPlayed = true;
        this._seenTimeout = null;
      }, Math.min(3000, animationDuration));

      // Set completion timer
      this._playTimeout = setTimeout(() => {
        this._hasPlayed = true;
        this._playTimeout = null;
        this.stopLabelTracking();
        this.alignLabelsOnce();
        this.startSweepLoop();
      }, animationDuration);
    } else if (enteredFromBelow) {
      // Subsequent play from below: fast-replay animation
      this.classList.remove('animating', 'fast-replay');
      void this.offsetWidth; // Force reflow
      this.classList.add('animating', 'fast-replay');

      this._animationStartTime = Date.now();
      this._animationDuration = replayDuration;

      this.startLabelTracking();
      this.clearTimers();

      this._replayTimeout = setTimeout(() => {
        this._hasPlayed = true;
        this._replayTimeout = null;
        this.stopLabelTracking();
        this.alignLabelsOnce();
        this.startSweepLoop();
      }, replayDuration);
    }
  }

  restartSlowAnimation() {
    // Keep a brief visual acknowledgement while the next frame starts immediately.
    // The class is also used to remove the artificial one-second lead-in of the
    // first visible connection in each canvas.
    this.classList.add('is-restarting', 'is-replay-feedback');
    if (this._replayFeedbackTimeout) clearTimeout(this._replayFeedbackTimeout);
    this._replayFeedbackTimeout = setTimeout(() => {
      this.classList.remove('is-replay-feedback');
      this._replayFeedbackTimeout = null;
    }, 340);
    this.classList.remove('animation-complete', 'animating', 'fast-replay');
    this.hideCanvasFollower();
    this._hasPlayed = false;
    this.clearTimers();
    this.stopLabelTracking();
    void this.offsetWidth;
    this.triggerActualAnimation(false, true);
  }

  hideCanvasFollower() {
    const follower = document.body.querySelector('.canvas-mouse-follower');
    if (follower && follower.activeParent === this) {
      follower.classList.remove('is-visible');
      follower.activeParent = null;
    }
  }

  restartFastAnimation() {
    this.classList.remove('animation-complete', 'animating', 'fast-replay');
    this.hideCanvasFollower();
    this._hasPlayed = true;
    this.clearTimers();
    this.stopLabelTracking();
    void this.offsetWidth;
    this.triggerActualAnimation(true);
  }

  openExpandedView() {
    const isPhone = window.innerWidth <= 767;
    const canvasOuter = this.closest('.canvas-outer');
    if (!canvasOuter) return;
    const sourceRect = canvasOuter.getBoundingClientRect();

    const activeOuter = document.querySelector('.canvas-outer.is-expanded');
    if (activeOuter && activeOuter !== canvasOuter) {
      activeOuter.classList.remove('is-expanded');
    }
    canvasOuter.classList.add('is-expanded');
    if (isPhone) {
      canvasOuter.classList.add('is-mobile-presentation');
      this.updateMobilePresentationOrientation();
      this.resetMobilePresentationLabels();
    }
    this.classList.add('is-expanded-view');
    document.body.classList.add('has-expanded-canvas');
    if (!isPhone) document.body.classList.add('has-canvas-window');
    this.restartFastAnimation();
    if (isPhone) {
      this.openMobilePresentation(canvasOuter);
      requestAnimationFrame(() => this._scheduleScaleAndCenter?.());
    } else {
      this.resetWindowNavigation();
      this.animateWindowGeometry(canvasOuter, sourceRect, () => this.enableWindowNavigation());
      requestAnimationFrame(() => this._scheduleScaleAndCenter?.());
    }
  }

  closeExpandedView() {
    const canvasOuter = this.closest('.canvas-outer');
    const isPhonePresentation = canvasOuter?.classList.contains('is-mobile-presentation');
    if (canvasOuter && document.fullscreenElement === canvasOuter) {
      document.exitFullscreen?.();
    }
    if (!canvasOuter || isPhonePresentation) {
      if (canvasOuter) canvasOuter.classList.remove('is-expanded', 'is-mobile-presentation');
      this.classList.remove('is-expanded-view');
      document.body.classList.remove('has-expanded-canvas');
      document.body.classList.remove('has-canvas-window');
      this.unlockPresentationOrientation();
      return;
    }

    const sourceRect = canvasOuter.getBoundingClientRect();
    this.disableWindowNavigation();
    canvasOuter.classList.remove('is-expanded');
    this.classList.remove('is-expanded-view');
    this.animateWindowGeometry(canvasOuter, sourceRect, () => {
      document.body.classList.remove('has-expanded-canvas');
      document.body.classList.remove('has-canvas-window');
      this._scheduleScaleAndCenter?.();
    });
  }

  animateWindowGeometry(canvasOuter, sourceRect, onComplete = null) {
    const targetRect = canvasOuter.getBoundingClientRect();
    if (!sourceRect.width || !sourceRect.height || !targetRect.width || !targetRect.height) {
      onComplete?.();
      return;
    }

    const translateX = sourceRect.left - targetRect.left;
    const translateY = sourceRect.top - targetRect.top;
    const scaleX = sourceRect.width / targetRect.width;
    const scaleY = sourceRect.height / targetRect.height;
    const finish = () => {
      canvasOuter.style.removeProperty('transition');
      canvasOuter.style.removeProperty('transform');
      canvasOuter.style.removeProperty('transform-origin');
      canvasOuter.classList.remove('is-window-transitioning');
      document.body.classList.remove('canvas-window-transitioning');
      onComplete?.();
    };

    canvasOuter.classList.add('is-window-transitioning');
    document.body.classList.add('canvas-window-transitioning');
    canvasOuter.style.transformOrigin = 'top left';
    canvasOuter.style.transition = 'none';
    canvasOuter.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`;
    void canvasOuter.offsetWidth;

    requestAnimationFrame(() => {
      canvasOuter.style.transition = 'transform 440ms cubic-bezier(0.25, 1, 0.5, 1)';
      canvasOuter.style.transform = 'translate(0, 0) scale(1, 1)';
    });

    const fallback = setTimeout(finish, 500);
    canvasOuter.addEventListener('transitionend', (event) => {
      if (event.target !== canvasOuter || event.propertyName !== 'transform') return;
      clearTimeout(fallback);
      finish();
    }, { once: true });
  }

  connectedCallback() {
    if (this._hasPlayed === undefined) {
      this._hasPlayed = false;
    }
    this.lockMobileNavigationPortrait();
    this._isIntersecting = false;
    this._enteredFromBelow = false;

    if (!this._initialized) {
      this._initialized = true;

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
      const canvasTitle = this.getAttribute('canvas-title') || (width > 1300 ? 'Testing' : 'Optimización');
      const isTestingCanvas = canvasTitle === 'Testing';
      const explainer = isTestingCanvas
        ? {
            title: 'Cómo funciona el testing',
            body: 'El tráfico se distribuye entre la experiencia actual y una variante experimental. Medimos la respuesta de cada grupo para identificar cambios que mejoran la conversión de forma consistente.',
            steps: ['Distribución gradual del tráfico', 'Medición de comportamiento y conversión', 'Escalamiento de la variante ganadora']
          }
        : {
            title: 'Cómo funciona la optimización',
            body: 'Partimos de la experiencia actual, identificamos los puntos de mayor impacto y construimos una versión optimizada enfocada en elevar la conversión.',
            steps: ['Diagnóstico de la experiencia actual', 'Priorización de oportunidades', 'Implementación y medición continua']
          };

      // The expanded grid is centered. With an even number of lines, the
      // canvas center falls between two grid lines, so shift it half a cell.
      this.style.setProperty('--expanded-grid-phase', gridLines % 2 === 0 ? '40px' : '0px');

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
          <div class="flow-scaler" style="--base-width: ${frameWidth}px; --mobile-width: ${frameWidth}px; --mobile-shift: 0px; --base-height: ${height}px;">
            <div data-layer="Flow" class="Flow" style="width: ${frameWidth}px; height: ${height}px; position: relative;">
              <div data-layer="Frame 1" class="Frame1" style="width: ${frameWidth}px; height: ${frameHeight}px; left: 0px; top: ${frameTop}px; position: absolute">
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
        <div class="canvas-edge-fade" aria-hidden="true"></div>
        <div class="canvas-grain" aria-hidden="true"></div>
        <div class="canvas-foreground-blur" aria-hidden="true"></div>
        <div class="canvas-plate-depth" aria-hidden="true"></div>
        <div class="canvas-window-breadcrumb" aria-label="Ruta del Canvas">
          <span>FaustPartners&nbsp; / &nbsp;Canvas&nbsp; / &nbsp;</span><strong>${canvasTitle}</strong>
        </div>
        <faust-mouse-follower text="Abrir" open-icon class-name="canvas-mouse-follower" active-class="animation-complete" inactive-class="is-expanded-view"></faust-mouse-follower>
        <div class="canvas-expanded-controls">
          <button class="canvas-replay-button" type="button" aria-label="Reproducir animación nuevamente" title="Reproducir nuevamente">
            <svg class="canvas-play-icon" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M4.5 2.9L10.5 7L4.5 11.1V2.9Z" fill="currentColor"/></svg>
            <svg class="canvas-pause-icon" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M4.5 3.25H6.25V10.75H4.5V3.25ZM7.75 3.25H9.5V10.75H7.75V3.25Z" fill="currentColor"/></svg>
          </button>
          <div class="canvas-replay-protection" aria-hidden="true"></div>
          <button class="canvas-expanded-fullscreen" type="button" aria-label="Abrir modo presentación" title="Abrir modo presentación">
            <svg class="canvas-fullscreen-enter-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3H3v5M16 3h5v5M21 16v5h-5M3 16v5h5"/></svg>
            <svg class="canvas-fullscreen-exit-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3v5H3M16 3v5h5M21 16h-5v5M3 16h5v5"/></svg>
          </button>
          <button class="canvas-expanded-close" type="button" aria-label="Minimizar vista de Canvas" title="Minimizar Canvas">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M6 12h12"/></svg>
          </button>
        </div>
        <aside class="canvas-explainer-panel" aria-label="${explainer.title}">
          <div class="canvas-explainer-header">
            <span>${explainer.title}</span>
          </div>
          <p>${explainer.body}</p>
          <ol>${explainer.steps.map((step) => `<li>${step}</li>`).join('')}</ol>
        </aside>
        <div class="canvas-explainer-resize-handle" role="separator" aria-orientation="vertical" aria-label="Ajustar ancho del panel de explicación" aria-hidden="true"></div>
        <button class="canvas-explainer-toggle gradient-border" type="button" aria-label="Abrir explicación del Canvas" title="Ver explicación" aria-expanded="false">
          <svg class="canvas-explainer-open-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>
          <svg class="canvas-explainer-close-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        ${legendHtml}
      `;

      this._onCanvasReplayClick = (event) => {
        if (event.target.closest('.canvas-expanded-close')) {
          event.stopPropagation();
          this.closeExpandedView();
          return;
        }
        if (event.target.closest('.canvas-expanded-fullscreen')) {
          event.stopPropagation();
          this.togglePresentationMode();
          return;
        }
        if (event.target.closest('.canvas-explainer-toggle')) {
          event.stopPropagation();
          this.toggleExplainerPanel();
          return;
        }
        if (!this.classList.contains('animation-complete')) return;
        if (event.target.closest('.canvas-replay-button')) {
          event.stopPropagation();
          this.restartSlowAnimation();
        } else if (!this.classList.contains('is-expanded-view')) {
          this.openExpandedView();
        }
      };
      this.addEventListener('click', this._onCanvasReplayClick);
      this._replayButton = this.querySelector('.canvas-replay-button');
      this._onReplayButtonEnter = () => this.hideCanvasFollower();
      this._onReplayButtonMove = (event) => {
        this.hideCanvasFollower();
        event.stopPropagation();
      };
      this._replayButton.addEventListener('mouseenter', this._onReplayButtonEnter);
      this._replayButton.addEventListener('mousemove', this._onReplayButtonMove);
      this._replayProtection = this.querySelector('.canvas-replay-protection');
      this._onReplayProtectionEnter = () => this.hideCanvasFollower();
      this._onReplayProtectionMove = (event) => {
        this.hideCanvasFollower();
        event.stopPropagation();
      };
      this._onReplayProtectionLeave = (event) => {
        requestAnimationFrame(() => {
          if (window.innerWidth > 980 && this.classList.contains('animation-complete') && this.matches(':hover') && !this._replayButton.matches(':hover')) {
            this.dispatchEvent(new MouseEvent('mouseenter', {
              clientX: event.clientX,
              clientY: event.clientY
            }));
          }
        });
      };
      this._onReplayProtectionClick = (event) => event.stopPropagation();
      this._replayProtection.addEventListener('mouseenter', this._onReplayProtectionEnter);
      this._replayProtection.addEventListener('mousemove', this._onReplayProtectionMove);
      this._replayProtection.addEventListener('mouseleave', this._onReplayProtectionLeave);
      this._replayProtection.addEventListener('click', this._onReplayProtectionClick);
      this._onReplayButtonLeave = (event) => {
        requestAnimationFrame(() => {
          if (window.innerWidth > 980 && this.classList.contains('animation-complete') && this.matches(':hover')) {
            this.dispatchEvent(new MouseEvent('mouseenter', {
              clientX: event.clientX,
              clientY: event.clientY
            }));
          }
        });
      };
      this._replayButton.addEventListener('mouseleave', this._onReplayButtonLeave);
      this._closeButton = this.querySelector('.canvas-expanded-close');
      this._closeButton.addEventListener('mouseenter', this._onReplayButtonEnter);
      this._fullscreenButton = this.querySelector('.canvas-expanded-fullscreen');
      this._fullscreenButton.addEventListener('mouseenter', this._onReplayButtonEnter);
      this._explainerPanel = this.querySelector('.canvas-explainer-panel');
      this._explainerToggle = this.querySelector('.canvas-explainer-toggle');
      this._explainerResizeHandle = this.querySelector('.canvas-explainer-resize-handle');
      this._canvasPlateDepth = this.querySelector('.canvas-plate-depth');
      this._canvasForegroundBlur = this.querySelector('.canvas-foreground-blur');
      this.initializeExplainerResize();
      this.initializePresentationExplainerProximity();
      this._onCanvasFullscreenChange = () => {
        const canvasOuter = this.closest('.canvas-outer');
        const isPresentation = document.fullscreenElement === canvasOuter;
        canvasOuter?.classList.toggle('is-presentation', isPresentation);
        this._fullscreenButton?.setAttribute('aria-label', isPresentation ? 'Salir del modo presentación' : 'Abrir modo presentación');
        this._fullscreenButton?.setAttribute('title', isPresentation ? 'Salir del modo presentación' : 'Abrir modo presentación');
        if (!isPresentation) {
          this.unlockPresentationOrientation();
          this.toggleExplainerPanel(false);
        }
        if (isPresentation) this.disableWindowNavigation();
        else if (this.classList.contains('is-expanded-view') && !this.isMobilePresentation()) this.enableWindowNavigation();
        this.updateMobilePresentationOrientation();
        this._scheduleScaleAndCenter?.();
      };
      document.addEventListener('fullscreenchange', this._onCanvasFullscreenChange);
      this._onExpandedKeydown = (event) => {
        if (event.key === 'Escape' && this.closest('.canvas-outer')?.classList.contains('is-expanded')) {
          this.closeExpandedView();
        }
      };
      document.addEventListener('keydown', this._onExpandedKeydown);

      const mount = this.querySelector('.flow-content-mount');
      children.forEach(child => mount.appendChild(child));
      this.initializePieceDragging();
    }

    // Geometry is static between layout changes. Batch its measurements into one frame.
    let geometryFrame = null;
    const scheduleSweepGeometry = () => {
      if (geometryFrame !== null) return;
      geometryFrame = requestAnimationFrame(() => {
        geometryFrame = null;
        if (this.isConnected) this.refreshSweepGeometry();
      });
    };
    this._scheduleSweepGeometry = scheduleSweepGeometry;
    this._cancelSweepGeometry = () => {
      if (geometryFrame !== null) cancelAnimationFrame(geometryFrame);
      geometryFrame = null;
    };
    scheduleSweepGeometry();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(scheduleSweepGeometry);
    }

    // Setup interactive hover listeners with loop completion tracking
    const setupHoverListeners = () => {
      const components = this.querySelectorAll('faust-flow-card, faust-flow-icon');
      components.forEach(comp => {
        if (comp._hoverListenersAttached) return;
        comp._hoverListenersAttached = true;

        comp._isMouseOver = false;
        
        comp.addEventListener('mouseenter', () => {
          comp._isMouseOver = true;
          comp.classList.add('hover-active');
        });
        
        comp.addEventListener('mouseleave', () => {
          comp._isMouseOver = false;
        });
        
        const frame = comp.querySelector('.Frame');
        if (frame) {
          frame.addEventListener('animationiteration', (e) => {
            if (e.animationName === 'projector-sweep-local') {
              if (!comp._isMouseOver) {
                comp.classList.remove('hover-active');
              }
            }
          });
        }
      });
    };
    setTimeout(setupHoverListeners, 200);

    // Setup intersection observer to toggle the animation class
    this.classList.add('has-animations');

    const parentReveal = this.closest('.reveal-item');
    if (parentReveal) {
      this._revealObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === 'class') {
            if (parentReveal.classList.contains('reveal-visible')) {
              this.checkAndTriggerAnimation(this._enteredFromBelow !== false);
            }
          }
        });
      });
      this._revealObserver.observe(parentReveal, { attributes: true, attributeFilter: ['class'] });
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this._isIntersecting = true;
          this._enteredFromBelow = entry.boundingClientRect.top > 0;
          this.checkAndTriggerAnimation(this._enteredFromBelow);
        } else {
          this._isIntersecting = false;
          const leftToBelow = entry.boundingClientRect.top > 0;
          if (leftToBelow) {
            // Re-hide element when scrolled out of view to the bottom
            this.classList.remove('animating', 'fast-replay', 'is-restarting', 'is-replay-feedback');
          } else {
            // Scrolled out of view to the top (hidden behind upper edge of viewport)
            if (!this._hasPlayed) {
              this._hasPlayed = true;
            }
          }
          this.clearTimers();
          this.stopLabelTracking();
        }
      });
    }, {
      threshold: 0.05 // Trigger early
    });
    observer.observe(this);
    this._intersectionObserver = observer;

    // Centrar scroll horizontal por defecto y al redimensionar la ventana
    const wrapper = this.querySelector('.flow-wrapper');
    const updateScaleAndCenter = () => {
      const w = window.innerWidth;
      let scale = 1.0;
      const isMobilePresentation = w <= 980 && this.classList.contains('is-expanded-view');
      if (isMobilePresentation) {
        // CSS emulators do not rotate their viewport when orientation.lock()
        // succeeds or is mocked. Fit the native horizontal Canvas into either
        // viewport shape so its complete horizontal composition is preserved.
        const isPortraitViewport = window.innerHeight > window.innerWidth;
        const availableWidth = Math.max(1, (isPortraitViewport ? window.innerHeight : w) - 32);
        const availableHeight = Math.max(1, (isPortraitViewport ? w : window.innerHeight) - 96);
        scale = Math.min(1, availableWidth / frameWidth, availableHeight / height);
      } else if (w <= 980) {
        scale = 0.6;
      } else if (w >= 1440) {
        scale = 1.0;
      } else {
        const t = (w - 980) / (1440 - 980);
        // Curva de aceleración pronunciada (Power of 12 Ease-Out) para favorecer tamaños más grandes en tablet.
        const tEased = 1 - Math.pow(1 - t, 12);
        scale = 0.90 + 0.10 * tEased;
      }
      this.style.setProperty('--canvas-scale', scale.toFixed(4));
      
      if (wrapper && (w > 980 || isMobilePresentation)) {
        wrapper.scrollLeft = (wrapper.scrollWidth - wrapper.clientWidth) / 2;
      }
    };

    let scaleFrame = null;
    const scheduleScaleAndCenter = () => {
      if (scaleFrame !== null) return;
      scaleFrame = requestAnimationFrame(() => {
        scaleFrame = null;
        updateScaleAndCenter();
        if (this._scheduleSweepGeometry) this._scheduleSweepGeometry();
        if (!this._trackingActive) this.alignLabelsOnce();
      });
    };
    this._cancelScaleAndCenter = () => {
      if (scaleFrame !== null) cancelAnimationFrame(scaleFrame);
      scaleFrame = null;
    };
    this._scheduleScaleAndCenter = scheduleScaleAndCenter;
    updateScaleAndCenter();
    scheduleScaleAndCenter();

    this._onResize = () => {
      this.updateMobilePresentationOrientation();
      scheduleScaleAndCenter();
    };
    window.addEventListener('resize', this._onResize);

    // Revertir scroll manual al centro suavemente después de 400ms de inactividad (solo tablet/no-mobile)
    if (wrapper) {
      let revertTimeout = null;
      let isReverting = false;

      const clearRevert = () => {
        if (revertTimeout) {
          clearTimeout(revertTimeout);
          revertTimeout = null;
        }
        isReverting = false;
        if (this._revertAnimationFrame) {
          cancelAnimationFrame(this._revertAnimationFrame);
          this._revertAnimationFrame = null;
        }
      };

      const scheduleRevert = () => {
        clearRevert();
        if (window.innerWidth <= 980) return;

        const target = (wrapper.scrollWidth - wrapper.clientWidth) / 2;
        if (Math.abs(wrapper.scrollLeft - target) <= 5) return;

        revertTimeout = setTimeout(() => {
          const currentTarget = (wrapper.scrollWidth - wrapper.clientWidth) / 2;
          if (Math.abs(wrapper.scrollLeft - currentTarget) > 5) {
            isReverting = true;

            // Animación suave personalizada usando requestAnimationFrame y Ease-Out Quartic para máxima fluidez
            const startLeft = wrapper.scrollLeft;
            const change = currentTarget - startLeft;
            const duration = 1600; // Duración de la transición en ms (más lenta y suave)
            const startTime = performance.now();

            const animate = (currentTime) => {
              if (!isReverting) return;

              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);
              const ease = 1 - Math.pow(1 - progress, 4); // Ease-Out Quartic

              wrapper.scrollLeft = startLeft + change * ease;

              if (progress < 1) {
                this._revertAnimationFrame = requestAnimationFrame(animate);
              } else {
                isReverting = false;
                this._revertAnimationFrame = null;
              }
            };

            this._revertAnimationFrame = requestAnimationFrame(animate);
          }
        }, 400); // 400ms de inactividad
      };

      const scrollHandler = () => {
        if (isReverting) return;
        scheduleRevert();
      };

      const interruptHandler = () => {
        clearRevert();
      };

      wrapper.addEventListener('scroll', scrollHandler, { passive: true });
      wrapper.addEventListener('touchstart', interruptHandler, { passive: true });
      wrapper.addEventListener('wheel', interruptHandler, { passive: true });
      wrapper.addEventListener('mousedown', interruptHandler, { passive: true });

      // Guardar referencias para desmontar y evitar fugas de memoria
      this._scrollHandler = scrollHandler;
      this._interruptHandler = interruptHandler;
      this._clearRevert = clearRevert;
      this.initializeWindowNavigation(wrapper);
    }
  }

  isWindowInteractionActive() {
    return this.classList.contains('is-expanded-view')
      && !this.isMobilePresentation()
      && document.fullscreenElement !== this.closest('.canvas-outer');
  }

  initializeWindowNavigation(wrapper) {
    if (this._windowNavigationReady || !wrapper) return;
    this._windowNavigationReady = true;
    this._windowNavigation = { zoom: 1, rawZoom: 1, panX: 0, panY: 0, rawPanX: 0, rawPanY: 0, pointers: new Map() };

    const ZOOM_MIN = 0.88;
    const ZOOM_MAX = 1.22;
    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
    const distance = ([a, b]) => Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
    const applyResistance = (value, threshold) => {
      const magnitude = Math.abs(value);
      if (magnitude <= threshold) return value;
      const overflow = magnitude - threshold;
      // A progressive rubber-band: never hard-stops the drag, but increasingly
      // reduces the response as it moves farther from the centered state.
      return Math.sign(value) * (threshold + overflow / (1 + overflow / 900));
    };
    const applyZoomResistance = (value) => {
      if (value < ZOOM_MIN) return ZOOM_MIN - (ZOOM_MIN - value) / (1 + (ZOOM_MIN - value) * 5);
      if (value > ZOOM_MAX) return ZOOM_MAX + (value - ZOOM_MAX) / (1 + (value - ZOOM_MAX) * 5);
      return value;
    };
    const apply = () => {
      const state = this._windowNavigation;
      const baseScale = Number.parseFloat(getComputedStyle(this).getPropertyValue('--canvas-scale')) || 1;
      this.style.setProperty('--canvas-view-zoom', state.zoom.toFixed(3));
      this.style.setProperty('--canvas-pan-x', `${state.panX.toFixed(1)}px`);
      this.style.setProperty('--canvas-pan-y', `${state.panY.toFixed(1)}px`);
      this.style.setProperty('--canvas-grid-step', `${(80 * baseScale * state.zoom).toFixed(2)}px`);
      this.style.setProperty('--canvas-grid-offset', `${state.panX.toFixed(1)}px`);
    };
    this._applyWindowNavigation = apply;
    this._returnCanvasToCenter = () => {
      const state = this._windowNavigation;
      this.classList.add('is-window-navigating');
      if (this._windowReturnFrame) {
        cancelAnimationFrame(this._windowReturnFrame);
        this._windowReturnFrame = null;
      }
      if (this._windowZoomSettleTimeout) {
        clearTimeout(this._windowZoomSettleTimeout);
        this._windowZoomSettleTimeout = null;
      }
      if (this._windowCenterSettleTimeout) {
        clearTimeout(this._windowCenterSettleTimeout);
        this._windowCenterSettleTimeout = null;
      }
      const startX = state.panX;
      const startY = state.panY;
      const startZoom = state.zoom;
      const targetZoom = clamp(state.rawZoom, ZOOM_MIN, ZOOM_MAX);
      const startTime = performance.now();
      const duration = 2200;
      const animate = (now) => {
        const progress = Math.min(1, (now - startTime) / duration);
        // Extiende levemente la entrada antes de una cola exponencial larga,
        // para que el retorno tome impulso de forma más natural.
        const easedProgress = progress * progress * (3 - 2 * progress);
        const ease = progress === 1
          ? 1
          : (1 - Math.pow(2, -9 * easedProgress)) / (1 - Math.pow(2, -9));
        state.panX = startX * (1 - ease);
        state.panY = startY * (1 - ease);
        state.zoom = startZoom + (targetZoom - startZoom) * ease;
        state.rawPanX = state.panX;
        state.rawPanY = state.panY;
        apply();
        if (progress < 1) this._windowReturnFrame = requestAnimationFrame(animate);
        else {
          state.rawZoom = targetZoom;
          this._windowReturnFrame = null;
          this.classList.remove('is-window-navigating');
        }
      };
      this._windowReturnFrame = requestAnimationFrame(animate);
    };

    this._onCanvasPointerDown = (event) => {
      if (!this.isWindowInteractionActive()) return;
      this.classList.add('is-window-navigating');
      if (this._windowReturnFrame) {
        cancelAnimationFrame(this._windowReturnFrame);
        this._windowReturnFrame = null;
      }
      if (this._windowZoomSettleTimeout) {
        clearTimeout(this._windowZoomSettleTimeout);
        this._windowZoomSettleTimeout = null;
      }
      if (this._windowCenterSettleTimeout) {
        clearTimeout(this._windowCenterSettleTimeout);
        this._windowCenterSettleTimeout = null;
      }
      wrapper.setPointerCapture?.(event.pointerId);
      const state = this._windowNavigation;
      state.pointers.set(event.pointerId, event);
      if (state.pointers.size === 1) {
        state.dragStart = { x: event.clientX, y: event.clientY, panX: state.rawPanX, panY: state.rawPanY };
        wrapper.classList.add('is-panning');
      } else if (state.pointers.size === 2) {
        state.pinchStart = { distance: distance([...state.pointers.values()]), zoom: state.rawZoom };
      }
      event.preventDefault();
    };

    this._onCanvasPointerMove = (event) => {
      const state = this._windowNavigation;
      if (!this.isWindowInteractionActive() || !state.pointers.has(event.pointerId)) return;
      state.pointers.set(event.pointerId, event);
      if (state.pointers.size === 1 && state.dragStart) {
        state.rawPanX = state.dragStart.panX + event.clientX - state.dragStart.x;
        state.rawPanY = state.dragStart.panY + event.clientY - state.dragStart.y;
        state.panX = applyResistance(state.rawPanX, 180);
        state.panY = applyResistance(state.rawPanY, 140);
      } else if (state.pointers.size === 2 && state.pinchStart) {
        const nextDistance = distance([...state.pointers.values()]);
        state.rawZoom = state.pinchStart.zoom * (nextDistance / state.pinchStart.distance);
        state.zoom = applyZoomResistance(state.rawZoom);
      }
      apply();
      event.preventDefault();
    };

    this._onCanvasPointerUp = (event) => {
      const state = this._windowNavigation;
      state.pointers.delete(event.pointerId);
      if (state.pointers.size < 2) state.pinchStart = null;
      if (state.pointers.size === 0) {
        state.dragStart = null;
        wrapper.classList.remove('is-panning');
        if (this._windowCenterSettleTimeout) clearTimeout(this._windowCenterSettleTimeout);
        this._windowCenterSettleTimeout = setTimeout(() => {
          this._windowCenterSettleTimeout = null;
          this._returnCanvasToCenter?.();
        }, 70);
      } else if (state.pointers.size === 1) {
        const [remainingPointer] = state.pointers.values();
        state.dragStart = {
          x: remainingPointer.clientX,
          y: remainingPointer.clientY,
          panX: state.rawPanX,
          panY: state.rawPanY
        };
      }
    };

    this._onCanvasWheel = (event) => {
      if (!this.isWindowInteractionActive()) return;
      this.classList.add('is-window-navigating');
      const state = this._windowNavigation;
      state.rawZoom *= Math.exp(-event.deltaY * 0.0012);
      state.zoom = applyZoomResistance(state.rawZoom);
      apply();
      if (this._windowZoomSettleTimeout) clearTimeout(this._windowZoomSettleTimeout);
      this._windowZoomSettleTimeout = setTimeout(() => this._returnCanvasToCenter?.(), 140);
      event.preventDefault();
    };

    wrapper.addEventListener('pointerdown', this._onCanvasPointerDown);
    wrapper.addEventListener('pointermove', this._onCanvasPointerMove);
    wrapper.addEventListener('pointerup', this._onCanvasPointerUp);
    wrapper.addEventListener('pointercancel', this._onCanvasPointerUp);
    wrapper.addEventListener('wheel', this._onCanvasWheel, { passive: false });
  }

  initializePieceDragging() {
    if (this._pieceDraggingReady) return;
    this._pieceDraggingReady = true;
    const pieces = Array.from(this.querySelectorAll('faust-flow-card, faust-flow-icon'));
    const arrows = Array.from(this.querySelectorAll('faust-flow-arrow, faust-flow-arrow-split-down, faust-flow-arrow-merge-right'));
    arrows.forEach((arrow) => arrow.classList.add('canvas-elastic-arrow'));
    const centerOf = (element) => {
      const rect = element.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, rect };
    };
    const portAnchor = (item, port) => {
      if (port === 'left') return { x: item.rect.left, y: item.rect.top + item.rect.height / 2 };
      if (port === 'right') return { x: item.rect.right, y: item.rect.top + item.rect.height / 2 };
      if (port === 'top') return { x: item.rect.left + item.rect.width / 2, y: item.rect.top };
      return { x: item.rect.left + item.rect.width / 2, y: item.rect.bottom };
    };
    // Intersect the ray towards the counterpart with the piece's rectangle.
    // Unlike fixed left/right ports, this produces a continuous attachment
    // point that glides around the perimeter as pieces cross each other.
    const visibleCornerRadius = (item) => {
      const frame = item.piece.querySelector('.Frame');
      const renderedRadius = frame ? Number.parseFloat(getComputedStyle(frame).borderTopLeftRadius) : NaN;
      if (Number.isFinite(renderedRadius)) {
        const frameScale = frame.offsetWidth ? frame.getBoundingClientRect().width / frame.offsetWidth : 1;
        return renderedRadius * frameScale;
      }
      const iconRadius = Number.parseFloat(item.piece.getAttribute('radius'));
      const scale = item.piece.offsetWidth ? item.rect.width / item.piece.offsetWidth : 1;
      return Number.isFinite(iconRadius) ? iconRadius * scale : 0;
    };
    const interpolatedPort = (item, offset, counterpart, counterpartOffset) => {
      const center = { x: item.x + offset.x, y: item.y + offset.y };
      const otherCenter = { x: counterpart.x + counterpartOffset.x, y: counterpart.y + counterpartOffset.y };
      const deltaX = otherCenter.x - center.x;
      const deltaY = otherCenter.y - center.y;
      const halfWidth = item.rect.width / 2;
      const halfHeight = item.rect.height / 2;
      const horizontalRatio = Math.abs(deltaX) / halfWidth;
      const verticalRatio = Math.abs(deltaY) / halfHeight;
      const boundaryScale = Math.max(horizontalRatio, verticalRatio);
      if (!Number.isFinite(boundaryScale) || boundaryScale < 0.0001) return center;
      const radius = Math.min(visibleCornerRadius(item), halfWidth, halfHeight);
      const isCircle = Math.abs(halfWidth - halfHeight) < 0.5 && radius >= halfWidth - 0.5;
      let localX = deltaX / boundaryScale;
      let localY = deltaY / boundaryScale;
      if (isCircle) {
        const ellipseScale = Math.hypot(deltaX / halfWidth, deltaY / halfHeight);
        localX = deltaX / ellipseScale;
        localY = deltaY / ellipseScale;
      } else if (radius > 0 && Math.abs(localX) > halfWidth - radius && Math.abs(localY) > halfHeight - radius) {
        const cornerX = Math.sign(deltaX) * (halfWidth - radius);
        const cornerY = Math.sign(deltaY) * (halfHeight - radius);
        const rayLengthSquared = deltaX * deltaX + deltaY * deltaY;
        const projection = deltaX * cornerX + deltaY * cornerY;
        const circleOffset = cornerX * cornerX + cornerY * cornerY - radius * radius;
        const intersection = (projection + Math.sqrt(Math.max(0, projection * projection - rayLengthSquared * circleOffset))) / rayLengthSquared;
        localX = deltaX * intersection;
        localY = deltaY * intersection;
      }
      const side = horizontalRatio >= verticalRatio
        ? (deltaX >= 0 ? 'right' : 'left')
        : (deltaY >= 0 ? 'bottom' : 'top');
      return {
        x: center.x + localX,
        y: center.y + localY,
        side
      };
    };
    const smoothConnectorPath = ([start, sourceControl, targetControl, end]) => (
      `M ${start.x.toFixed(1)} ${start.y.toFixed(1)} C ${sourceControl.x.toFixed(1)} ${sourceControl.y.toFixed(1)} ${targetControl.x.toFixed(1)} ${targetControl.y.toFixed(1)} ${end.x.toFixed(1)} ${end.y.toFixed(1)}`
    );

    const getArrowLinks = (centers) => arrows.map((arrow) => {
      const rect = arrow.getBoundingClientRect();
      const parent = arrow.parentElement;
      let sourcePiece = null;
      let targetPiece = null;
      if (parent?.classList.contains('Frame13')) {
        sourcePiece = parent.querySelector('faust-flow-icon');
        targetPiece = parent.nextElementSibling?.querySelector('faust-flow-card');
      } else if (parent?.classList.contains('Frame199')) {
        sourcePiece = parent.querySelector('faust-flow-card');
        targetPiece = parent.nextElementSibling?.querySelector('faust-flow-icon');
      } else if (parent?.classList.contains('Frame198')) {
        sourcePiece = parent.querySelector('faust-flow-icon');
        targetPiece = parent.nextElementSibling?.querySelector('faust-flow-card');
      } else if (parent?.classList.contains('FrameCardMetrics')) {
        sourcePiece = parent.closest('.FlowDetails')?.querySelector('.FrameMergeDb faust-flow-icon');
        targetPiece = parent.querySelector('faust-flow-card');
      }
      // Las flechas ramificadas/fusionadas se excluyen hasta poder deformar
      // sus múltiples trayectorias SVG de forma independiente.
      if (!sourcePiece || !targetPiece) return null;
      const source = centers.find(({ piece }) => piece === sourcePiece);
      const target = centers.find(({ piece }) => piece === targetPiece);
      if (!source || !target) return null;
      const baseStart = source && target ? portAnchor(source, 'right') : null;
      const baseEnd = source && target ? portAnchor(target, 'left') : null;
      return {
        arrow,
        source: source?.piece,
        target: target?.piece,
        sourceCenter: source,
        targetCenter: target,
        baseStart,
        baseEnd,
        restStart: { x: rect.left, y: rect.top + rect.height / 2 },
        restEnd: { x: rect.right, y: rect.top + rect.height / 2 },
        visualLength: Math.max(rect.width, 1),
        scale: arrow.offsetWidth ? rect.width / arrow.offsetWidth : 1
      };
    }).filter(Boolean);

    pieces.forEach((piece) => {
      piece.classList.add('canvas-piece-draggable');
      piece.addEventListener('pointerdown', (event) => {
        if (!this.isWindowInteractionActive() || !this.classList.contains('animation-complete')) return;
        event.preventDefault();
        event.stopPropagation();
        const centers = pieces.map((item) => ({ piece: item, ...centerOf(item) }));
        const activeCenter = centers.find(({ piece: item }) => item === piece);
        const scale = piece.offsetWidth ? activeCenter.rect.width / piece.offsetWidth : 1;
        const arrowLinks = getArrowLinks(centers);
        const start = { x: event.clientX, y: event.clientY };
        piece.classList.add('is-piece-dragging');
        this.classList.add('is-piece-field-active');
        piece.setPointerCapture?.(event.pointerId);
        let lastDx = 0;
        let lastDy = 0;
        let curveSettlingFrame = null;
        let isReturningPiece = false;
        const interactionStartedAt = performance.now();
        let restTransitionStartedAt = null;
        const applyPieceResistance = (value, threshold) => {
          const magnitude = Math.abs(value);
          if (magnitude <= threshold) return value;
          const overflow = magnitude - threshold;
          // A soft, progressive weight: it remains responsive but needs
          // increasingly more pointer travel as the piece moves farther away.
          return Math.sign(value) * (threshold + overflow / (1 + overflow / 210));
        };
        const applyDragState = (dx, dy) => {
          const displacements = new Map();
          let curveNeedsSettling = false;
          centers.forEach((item) => {
            const influence = item.piece === piece ? 1 : 0;
            const itemScale = item.piece.offsetWidth ? item.rect.width / item.piece.offsetWidth : scale;
            const displacement = { x: dx * influence, y: dy * influence, scale: itemScale };
            displacements.set(item.piece, displacement);
            item.piece.style.setProperty('--canvas-piece-drag-x', `${(displacement.x / itemScale).toFixed(1)}px`);
            item.piece.style.setProperty('--canvas-piece-drag-y', `${(displacement.y / itemScale).toFixed(1)}px`);
          });
          arrowLinks.forEach(({ arrow, source, target, sourceCenter, targetCenter, baseStart, baseEnd, restStart, restEnd, visualLength, scale: arrowScale }) => {
            const from = displacements.get(source) || { x: 0, y: 0 };
            const to = displacements.get(target) || { x: 0, y: 0 };
            if (!sourceCenter || !targetCenter || !baseStart || !baseEnd) return;
            const dynamicStart = interpolatedPort(sourceCenter, from, targetCenter, to);
            const targetPort = interpolatedPort(targetCenter, to, sourceCenter, from);
            const targetPortNormal = {
              left: { x: -1, y: 0 },
              right: { x: 1, y: 0 },
              top: { x: 0, y: -1 },
              bottom: { x: 0, y: 1 }
            }[targetPort.side] || { x: 0, y: 0 };
            const dynamicEnd = {
              ...targetPort,
              x: targetPort.x + targetPortNormal.x * 8 * arrowScale,
              y: targetPort.y + targetPortNormal.y * 8 * arrowScale
            };
            const phaseProgress = restTransitionStartedAt === null
              ? Math.min(1, (performance.now() - interactionStartedAt) / 180)
              : Math.max(0, 1 - (performance.now() - restTransitionStartedAt) / 180);
            const modeBlend = phaseProgress * phaseProgress * (3 - 2 * phaseProgress);
            const currentStart = {
              x: restStart.x + (dynamicStart.x - restStart.x) * modeBlend,
              y: restStart.y + (dynamicStart.y - restStart.y) * modeBlend,
              side: dynamicStart.side
            };
            const currentEnd = {
              x: restEnd.x + (dynamicEnd.x - restEnd.x) * modeBlend,
              y: restEnd.y + (dynamicEnd.y - restEnd.y) * modeBlend,
              side: dynamicEnd.side
            };
            const currentVectorX = currentEnd.x - currentStart.x;
            const currentVectorY = currentEnd.y - currentStart.y;
            const sourceNormalBySide = {
              left: { x: -1, y: 0 },
              right: { x: 1, y: 0 },
              top: { x: 0, y: -1 },
              bottom: { x: 0, y: 1 }
            };
            const targetHeadingBySide = {
              left: { x: 1, y: 0, angle: 0 },
              right: { x: -1, y: 0, angle: 180 },
              top: { x: 0, y: 1, angle: 90 },
              bottom: { x: 0, y: -1, angle: -90 }
            };
            const sourceNormal = sourceNormalBySide[currentStart.side]
              || (currentVectorX >= 0 ? sourceNormalBySide.right : sourceNormalBySide.left);
            const targetHeading = targetHeadingBySide[currentEnd.side]
              || (currentVectorX >= 0 ? targetHeadingBySide.left : targetHeadingBySide.right);
            const connectorDistance = Math.hypot(currentVectorX, currentVectorY);
            const lead = Math.min(46 * arrowScale, Math.max(22 * arrowScale, connectorDistance * 0.18));
            const sourceLead = {
              x: currentStart.x + sourceNormal.x * lead,
              y: currentStart.y + sourceNormal.y * lead
            };
            const targetLead = {
              x: currentEnd.x - targetHeading.x * lead,
              y: currentEnd.y - targetHeading.y * lead
            };
            const restingSourceControl = {
              x: restStart.x + (restEnd.x - restStart.x) * 0.34,
              y: restStart.y + (restEnd.y - restStart.y) * 0.34
            };
            const restingTargetControl = {
              x: restStart.x + (restEnd.x - restStart.x) * 0.66,
              y: restStart.y + (restEnd.y - restStart.y) * 0.66
            };
            const desiredSourceControl = {
              x: restingSourceControl.x + (sourceLead.x - restingSourceControl.x) * modeBlend,
              y: restingSourceControl.y + (sourceLead.y - restingSourceControl.y) * modeBlend
            };
            const desiredTargetControl = {
              x: restingTargetControl.x + (targetLead.x - restingTargetControl.x) * modeBlend,
              y: restingTargetControl.y + (targetLead.y - restingTargetControl.y) * modeBlend
            };
            // The endpoints stay locked to their ports. Only the Bézier control
            // points ease towards a new route, avoiding visible snaps when a
            // connector changes the side it uses on either piece.
            const curveState = arrow._elasticCurveState || {
              source: { ...desiredSourceControl },
              target: { ...desiredTargetControl },
              updatedAt: performance.now()
            };
            const elapsed = Math.min(48, performance.now() - curveState.updatedAt);
            const controlBlend = 1 - Math.exp(-elapsed / 82);
            curveState.source.x += (desiredSourceControl.x - curveState.source.x) * controlBlend;
            curveState.source.y += (desiredSourceControl.y - curveState.source.y) * controlBlend;
            curveState.target.x += (desiredTargetControl.x - curveState.target.x) * controlBlend;
            curveState.target.y += (desiredTargetControl.y - curveState.target.y) * controlBlend;
            curveState.updatedAt = performance.now();
            arrow._elasticCurveState = curveState;
            curveNeedsSettling ||= Math.hypot(desiredSourceControl.x - curveState.source.x, desiredSourceControl.y - curveState.source.y) > 0.15
              || Math.hypot(desiredTargetControl.x - curveState.target.x, desiredTargetControl.y - curveState.target.y) > 0.15;
            // Reach the tip, not merely the arrowhead base: this is the same
            // continuous center stroke used by the original combined SVG path.
            const routePoints = [currentStart, curveState.source, curveState.target, currentEnd];

            const minX = Math.min(...routePoints.map((point) => point.x), currentEnd.x);
            const minY = Math.min(...routePoints.map((point) => point.y), currentEnd.y);
            const maxX = Math.max(...routePoints.map((point) => point.x), currentEnd.x);
            const maxY = Math.max(...routePoints.map((point) => point.y), currentEnd.y);
            const padding = 12;
            const localWidth = Math.max(48, (maxX - minX) / arrowScale + padding * 2);
            const localHeight = Math.max(15, (maxY - minY) / arrowScale + padding * 2);
            const localPoints = routePoints.map((point) => ({
              x: (point.x - minX) / arrowScale + padding,
              y: (point.y - minY) / arrowScale + padding
            }));
            const endX = (currentEnd.x - minX) / arrowScale + padding;
            const endY = (currentEnd.y - minY) / arrowScale + padding;
            const translateX = ((minX - baseStart.x) / arrowScale - padding).toFixed(1);
            const translateY = ((minY - baseStart.y) / arrowScale - padding + 7.364).toFixed(1);
            arrow.style.setProperty('--canvas-arrow-x', `${translateX}px`);
            arrow.style.setProperty('--canvas-arrow-y', `${translateY}px`);
            arrow.style.setProperty('transform', `translate3d(${translateX}px, ${translateY}px, 0)`, 'important');

            // Keep the arrowhead rigid: only redraw the long SVG stem to the
            // actual distance between its two attachment ports.
            const svg = arrow.querySelector('svg');
            const stem = svg?.querySelector('.elastic-arrow-stem');
            const pulse = svg?.querySelector('.flow-line-pulse');
            const head = svg?.querySelector('.elastic-arrow-head');
            if (!svg || !stem || !pulse || !head) return;

            const connectorPath = smoothConnectorPath(localPoints);
            svg.setAttribute('width', localWidth.toFixed(1));
            svg.setAttribute('height', localHeight.toFixed(1));
            svg.setAttribute('viewBox', `0 0 ${localWidth.toFixed(1)} ${localHeight.toFixed(1)}`);
            stem.setAttribute('d', connectorPath);
            pulse.setAttribute('d', connectorPath);
            head.setAttribute(
              'transform',
              `translate(${endX.toFixed(1)} ${endY.toFixed(1)}) rotate(${targetHeading.angle}) translate(-73 -7.364)`
            );
            head.setAttribute('d', head.dataset.rightD);
          });
          if (curveNeedsSettling && !isReturningPiece && curveSettlingFrame === null) {
            curveSettlingFrame = requestAnimationFrame(() => {
              curveSettlingFrame = null;
              applyDragState(lastDx, lastDy);
            });
          }
        };
        const move = (moveEvent) => {
          lastDx = applyPieceResistance(moveEvent.clientX - start.x, 82);
          lastDy = applyPieceResistance(moveEvent.clientY - start.y, 70);
          applyDragState(lastDx, lastDy);
        };
        const resetArrowGeometry = () => {
          arrows.forEach((arrow) => {
            arrow.style.setProperty('--canvas-arrow-x', '0px');
            arrow.style.setProperty('--canvas-arrow-y', '0px');
            arrow.style.setProperty('--canvas-arrow-stretch', '1');
            arrow.style.removeProperty('transform');
            const svg = arrow.querySelector('svg');
            const stem = svg?.querySelector('.elastic-arrow-stem');
            const pulse = svg?.querySelector('.flow-line-pulse');
            const head = svg?.querySelector('.elastic-arrow-head');
            if (!svg || !stem || !pulse || !head) return;

            const reverse = arrow.getAttribute('reverse') === 'true';
            const originalStem = svg.dataset.baseStem || 'M 0 7.364 H 73';
            svg.setAttribute('width', svg.dataset.baseWidth || '73');
            svg.setAttribute('height', '15');
            svg.setAttribute('viewBox', svg.dataset.baseViewbox || '0 0 73 15');
            stem.setAttribute('d', originalStem);
            pulse.setAttribute('d', originalStem);
            if (head.dataset.baseTransform) head.setAttribute('transform', head.dataset.baseTransform);
            else head.removeAttribute('transform');
            head.setAttribute('d', head.dataset.baseD || head.getAttribute('d'));
            delete arrow._elasticCurveState;
          });
        };
        const release = () => {
          piece.classList.remove('is-piece-dragging');
          isReturningPiece = true;
          if (curveSettlingFrame !== null) {
            cancelAnimationFrame(curveSettlingFrame);
            curveSettlingFrame = null;
          }
          const releaseStartedAt = performance.now();
          const releaseDuration = 620;
          const animateRelease = (now) => {
            const progress = Math.min(1, (now - releaseStartedAt) / releaseDuration);
            const eased = 1 - Math.pow(1 - progress, 3);
            applyDragState(lastDx * (1 - eased), lastDy * (1 - eased));
            if (progress < 1) {
              this._pieceReturnFrame = requestAnimationFrame(animateRelease);
              return;
            }
            restTransitionStartedAt = performance.now();
            const animateRestGeometry = (restNow) => {
              applyDragState(0, 0);
              if (restNow - restTransitionStartedAt < 180) {
                this._pieceReturnFrame = requestAnimationFrame(animateRestGeometry);
                return;
              }
              this._pieceReturnFrame = null;
              this.classList.remove('is-piece-field-active');
              resetArrowGeometry();
              isReturningPiece = false;
            };
            this._pieceReturnFrame = requestAnimationFrame(animateRestGeometry);
          };
          if (this._pieceReturnFrame) cancelAnimationFrame(this._pieceReturnFrame);
          this._pieceReturnFrame = requestAnimationFrame(animateRelease);
          document.removeEventListener('pointermove', move);
          document.removeEventListener('pointerup', release);
          document.removeEventListener('pointercancel', release);
        };
        // Start from the exact resting SVG geometry, then morph into the
        // dynamic connector while keeping the intentional resting gaps.
        applyDragState(0, 0);
        document.addEventListener('pointermove', move);
        document.addEventListener('pointerup', release);
        document.addEventListener('pointercancel', release);
      });
    });
  }

  resetWindowNavigation() {
    if (!this._windowNavigation) return;
    Object.assign(this._windowNavigation, { zoom: 1, rawZoom: 1, panX: 0, panY: 0, rawPanX: 0, rawPanY: 0 });
    this.style.setProperty('--canvas-grid-offset', '0px');
    this._applyWindowNavigation?.();
  }

  enableWindowNavigation() {
    if (!this.isWindowInteractionActive()) return;
    this.classList.add('is-window-interactive');
    this._applyWindowNavigation?.();
  }

  disableWindowNavigation() {
    this.classList.remove('is-window-interactive');
    this.classList.remove('is-window-navigating');
    if (this._windowReturnFrame) {
      cancelAnimationFrame(this._windowReturnFrame);
      this._windowReturnFrame = null;
    }
    if (this._windowZoomSettleTimeout) {
      clearTimeout(this._windowZoomSettleTimeout);
      this._windowZoomSettleTimeout = null;
    }
    if (this._windowCenterSettleTimeout) {
      clearTimeout(this._windowCenterSettleTimeout);
      this._windowCenterSettleTimeout = null;
    }
    const wrapper = this.querySelector('.flow-wrapper');
    wrapper?.classList.remove('is-panning');
    if (this._windowNavigation) this._windowNavigation.pointers.clear();
  }

  togglePresentationMode() {
    const canvasOuter = this.closest('.canvas-outer');
    if (!canvasOuter) return;
    if (document.fullscreenElement === canvasOuter) {
      document.exitFullscreen?.();
    } else {
      canvasOuter.requestFullscreen?.().catch(() => {});
    }
  }

  toggleExplainerPanel(forceOpen) {
    if (!this.classList.contains('is-expanded-view')) return;
    const isOpen = forceOpen === undefined
      ? !this._explainerPanel.classList.contains('is-open')
      : forceOpen;
    this._explainerPanel.classList.toggle('is-open', isOpen);
    this.classList.toggle('has-explainer-open', isOpen);
    this.syncExplainerLayout();
    this._explainerToggle?.setAttribute('aria-expanded', String(isOpen));
    this._explainerToggle?.setAttribute('aria-label', isOpen ? 'Cerrar explicación del Canvas' : 'Abrir explicación del Canvas');
    this._explainerToggle?.setAttribute('title', isOpen ? 'Cerrar explicación' : 'Ver explicación');
  }

  initializeExplainerResize() {
    if (this._explainerResizeReady || !this._explainerResizeHandle) return;
    this._explainerResizeReady = true;
    const handle = this._explainerResizeHandle;
    const MIN_WIDTH = 280;
    const getMaxWidth = () => {
      const outerWidth = this.closest('.canvas-outer')?.getBoundingClientRect().width || 0;
      return Math.max(MIN_WIDTH, outerWidth - 56);
    };
    const stopResize = () => {
      this.classList.remove('is-resizing-explainer');
      document.removeEventListener('pointermove', this._onExplainerResizeMove);
      document.removeEventListener('pointerup', this._onExplainerResizeEnd);
      document.removeEventListener('pointercancel', this._onExplainerResizeEnd);
    };
    this._stopExplainerResize = stopResize;
    this._onExplainerResizeMove = (event) => {
      const nextWidth = Math.min(getMaxWidth(), Math.max(MIN_WIDTH, this._explainerResizeStartWidth + event.clientX - this._explainerResizeStartX));
      this.style.setProperty('--canvas-explainer-width', `${nextWidth}px`);
      this.syncExplainerLayout(nextWidth);
    };
    this._onExplainerResizeEnd = () => stopResize();
    this._onExplainerResizeStart = (event) => {
      if (window.innerWidth < 768 || !this._explainerPanel.classList.contains('is-open')) return;
      event.preventDefault();
      event.stopPropagation();
      this._explainerResizeStartX = event.clientX;
      this._explainerResizeStartWidth = this._explainerPanel.getBoundingClientRect().width;
      this.classList.add('is-resizing-explainer');
      document.addEventListener('pointermove', this._onExplainerResizeMove);
      document.addEventListener('pointerup', this._onExplainerResizeEnd);
      document.addEventListener('pointercancel', this._onExplainerResizeEnd);
    };
    handle.addEventListener('pointerdown', this._onExplainerResizeStart);
  }

  initializePresentationExplainerProximity() {
    if (this._presentationExplainerReady) return;
    const canvasOuter = this.closest('.canvas-outer');
    if (!canvasOuter) return;
    this._presentationExplainerReady = true;
    this._presentationExplainerOuter = canvasOuter;
    this._onPresentationExplainerPointerMove = (event) => {
      if (!canvasOuter.classList.contains('is-presentation') || window.innerWidth <= 980) return;
      const outerRect = canvasOuter.getBoundingClientRect();
      const panelIsOpen = this._explainerPanel?.classList.contains('is-open');
      const panelRect = panelIsOpen ? this._explainerPanel.getBoundingClientRect() : null;
      const isNearLeftEdge = event.clientX - outerRect.left <= 24;
      const isInsidePanel = panelRect
        && event.clientX >= panelRect.left
        && event.clientX <= panelRect.right
        && event.clientY >= panelRect.top
        && event.clientY <= panelRect.bottom;
      if (isNearLeftEdge || isInsidePanel) {
        if (!panelIsOpen) this.toggleExplainerPanel(true);
      } else if (panelIsOpen) {
        this.toggleExplainerPanel(false);
      }
    };
    canvasOuter.addEventListener('pointermove', this._onPresentationExplainerPointerMove);
  }

  syncExplainerLayout(panelWidth) {
    if (!this._explainerPanel?.classList.contains('is-open')) {
      this.style.removeProperty('--canvas-panel-offset');
      this.style.removeProperty('--canvas-workspace-left');
      this._canvasPlateDepth?.style.setProperty('--canvas-vignette-center-shift', '0px');
      this._canvasForegroundBlur?.style.setProperty('--canvas-vignette-center-shift', '0px');
      return;
    }
    const width = panelWidth ?? this._explainerPanel.getBoundingClientRect().width;
    const workspaceLeft = width + 8;
    const centerOffset = workspaceLeft / 2;
    this.style.setProperty('--canvas-panel-offset', `${centerOffset.toFixed(1)}px`);
    this.style.setProperty('--canvas-workspace-left', `${workspaceLeft.toFixed(1)}px`);
    this._canvasPlateDepth?.style.setProperty('--canvas-vignette-center-shift', `${centerOffset.toFixed(1)}px`);
    this._canvasForegroundBlur?.style.setProperty('--canvas-vignette-center-shift', `${centerOffset.toFixed(1)}px`);
  }

  openMobilePresentation(canvasOuter) {
    const lockLandscape = () => {
      const lockRequest = screen.orientation?.lock?.('landscape');
      lockRequest?.then(() => {
        this._presentationOrientationLocked = true;
      }).catch(() => {});
    };

    const fullscreenRequest = canvasOuter.requestFullscreen?.();
    if (fullscreenRequest?.then) fullscreenRequest.then(lockLandscape).catch(lockLandscape);
    else lockLandscape();
  }

  updateMobilePresentationOrientation() {
    const canvasOuter = this.closest('.canvas-outer');
    if (!canvasOuter?.classList.contains('is-mobile-presentation')) return;
    canvasOuter.classList.toggle('is-portrait-presentation', window.innerHeight > window.innerWidth);
  }

  isMobilePresentation() {
    return this.closest('.canvas-outer')?.classList.contains('is-mobile-presentation');
  }

  resetMobilePresentationLabels() {
    this.querySelectorAll('faust-flow-label[left]').forEach((label) => {
      label.style.left = `${label.getAttribute('left')}px`;
    });
  }

  unlockPresentationOrientation() {
    if (this._presentationOrientationLocked) screen.orientation?.unlock?.();
    this._presentationOrientationLocked = false;
    this.lockMobileNavigationPortrait();
  }

  lockMobileNavigationPortrait() {
    if (window.innerWidth > 767 || this.isMobilePresentation()) return;
    screen.orientation?.lock?.('portrait')?.catch(() => {});
  }

  disconnectedCallback() {
    this.clearTimers();
    if (this._replayFeedbackTimeout) {
      clearTimeout(this._replayFeedbackTimeout);
      this._replayFeedbackTimeout = null;
    }
    this.stopLabelTracking();
    if (this._cancelSweepGeometry) this._cancelSweepGeometry();
    if (this._cancelScaleAndCenter) this._cancelScaleAndCenter();
    if (this._clearRevert) {
      this._clearRevert();
    }
    if (this._revealObserver) {
      this._revealObserver.disconnect();
      this._revealObserver = null;
    }
    if (this._intersectionObserver) {
      this._intersectionObserver.disconnect();
      this._intersectionObserver = null;
    }
    if (this._onResize) {
      window.removeEventListener('resize', this._onResize);
      this._onResize = null;
    }

    if (this._onCanvasReplayClick) {
      this.removeEventListener('click', this._onCanvasReplayClick);
      this._onCanvasReplayClick = null;
    }
    if (this._replayButton && this._onReplayButtonEnter) {
      this._replayButton.removeEventListener('mouseenter', this._onReplayButtonEnter);
      this._replayButton.removeEventListener('mousemove', this._onReplayButtonMove);
      this._replayButton.removeEventListener('mouseleave', this._onReplayButtonLeave);
      if (this._closeButton) this._closeButton.removeEventListener('mouseenter', this._onReplayButtonEnter);
      if (this._fullscreenButton) this._fullscreenButton.removeEventListener('mouseenter', this._onReplayButtonEnter);
      this._onReplayButtonEnter = null;
    }
    if (this._replayProtection) {
      this._replayProtection.removeEventListener('mouseenter', this._onReplayProtectionEnter);
      this._replayProtection.removeEventListener('mousemove', this._onReplayProtectionMove);
      this._replayProtection.removeEventListener('mouseleave', this._onReplayProtectionLeave);
      this._replayProtection.removeEventListener('click', this._onReplayProtectionClick);
    }
    if (this._onExpandedKeydown) {
      document.removeEventListener('keydown', this._onExpandedKeydown);
      this._onExpandedKeydown = null;
    }
    if (this._onCanvasFullscreenChange) {
      document.removeEventListener('fullscreenchange', this._onCanvasFullscreenChange);
      this._onCanvasFullscreenChange = null;
    }
    if (this._explainerResizeHandle && this._onExplainerResizeStart) {
      this._explainerResizeHandle.removeEventListener('pointerdown', this._onExplainerResizeStart);
    }
    this._stopExplainerResize?.();
    if (this._presentationExplainerOuter && this._onPresentationExplainerPointerMove) {
      this._presentationExplainerOuter.removeEventListener('pointermove', this._onPresentationExplainerPointerMove);
    }

    // Quitar listeners de revert scroll
    const wrapper = this.querySelector('.flow-wrapper');
    if (wrapper) {
      if (this._scrollHandler) {
        wrapper.removeEventListener('scroll', this._scrollHandler);
      }
      if (this._interruptHandler) {
        wrapper.removeEventListener('touchstart', this._interruptHandler);
        wrapper.removeEventListener('wheel', this._interruptHandler);
        wrapper.removeEventListener('mousedown', this._interruptHandler);
      }
      if (this._onCanvasPointerDown) {
        wrapper.removeEventListener('pointerdown', this._onCanvasPointerDown);
        wrapper.removeEventListener('pointermove', this._onCanvasPointerMove);
        wrapper.removeEventListener('pointerup', this._onCanvasPointerUp);
        wrapper.removeEventListener('pointercancel', this._onCanvasPointerUp);
        wrapper.removeEventListener('wheel', this._onCanvasWheel);
      }
    }
  }

  startLabelTracking() {
    this.stopLabelTracking(); // Avoid duplicate loops
    if (this.isMobilePresentation()) return;
    this._trackingActive = true;

    const labelLeft = this.querySelector('faust-flow-label[left="80"]');
    const compLeft1 = this.querySelector('.Frame13 faust-flow-icon');
    const compLeft2 = this.querySelector('.Frame199 faust-flow-card');

    const labelRight = this.querySelector('faust-flow-label[left="560"]');
    const compRight1 = this.querySelector('.Frame198 faust-flow-icon');
    const compRight2 = this.querySelector('.Frame201 faust-flow-card');

    const measureLabel = (label, comp1, comp2, frame1Rect, scale) => {
      if (!label || !comp1 || !comp2) return;
      const rect1 = comp1.getBoundingClientRect();
      const rect2 = comp2.getBoundingClientRect();
      
      const x1Rel = (rect1.left - frame1Rect.left) / scale;
      const x2Rel = (rect2.right - frame1Rect.left) / scale;
      const targetRelCenter = (x1Rel + x2Rel) / 2;
      
      const labelWidth = parseFloat(label.getAttribute('width')) || 400;
      return { label, left: targetRelCenter - labelWidth / 2 };
    };

    const updatePositions = () => {
      if (!this._trackingActive) return;

      const canvasRect = this.getBoundingClientRect();
      if (canvasRect.width === 0) {
        this._trackingFrame = requestAnimationFrame(updatePositions);
        return;
      }

      const frame1 = this.querySelector('.Frame1');
      const frame1Rect = frame1 ? frame1.getBoundingClientRect() : canvasRect;
      const frameWidth = parseInt(this.getAttribute('frame-width') || '1040', 10);
      const scale = frame1Rect.width / frameWidth || 1;

      const updates = [
        measureLabel(labelLeft, compLeft1, compLeft2, frame1Rect, scale),
        measureLabel(labelRight, compRight1, compRight2, frame1Rect, scale)
      ];
      updates.forEach((update) => {
        if (update) update.label.style.left = update.left + 'px';
      });

      this._trackingFrame = requestAnimationFrame(updatePositions);
    };

    updatePositions();
  }

  stopLabelTracking() {
    this._trackingActive = false;
    if (this._trackingFrame) {
      cancelAnimationFrame(this._trackingFrame);
      this._trackingFrame = null;
    }
  }

  alignLabelsOnce() {
    if (this.isMobilePresentation()) return;
    const labelLeft = this.querySelector('faust-flow-label[left="80"]');
    const compLeft1 = this.querySelector('.Frame13 faust-flow-icon');
    const compLeft2 = this.querySelector('.Frame199 faust-flow-card');

    const labelRight = this.querySelector('faust-flow-label[left="560"]');
    const compRight1 = this.querySelector('.Frame198 faust-flow-icon');
    const compRight2 = this.querySelector('.Frame201 faust-flow-card');

    const measureLabel = (label, comp1, comp2, frame1Rect, scale) => {
      if (!label || !comp1 || !comp2) return;
      const rect1 = comp1.getBoundingClientRect();
      const rect2 = comp2.getBoundingClientRect();
      
      const x1Rel = (rect1.left - frame1Rect.left) / scale;
      const x2Rel = (rect2.right - frame1Rect.left) / scale;
      const targetRelCenter = (x1Rel + x2Rel) / 2;
      
      const labelWidth = parseFloat(label.getAttribute('width')) || 400;
      return { label, left: targetRelCenter - labelWidth / 2 };
    };

    const canvasRect = this.getBoundingClientRect();
    if (canvasRect.width === 0) return;

    const frame1 = this.querySelector('.Frame1');
    const frame1Rect = frame1 ? frame1.getBoundingClientRect() : canvasRect;
    const frameWidth = parseInt(this.getAttribute('frame-width') || '1040', 10);
    const scale = frame1Rect.width / frameWidth || 1;

    const updates = [
      measureLabel(labelLeft, compLeft1, compLeft2, frame1Rect, scale),
      measureLabel(labelRight, compRight1, compRight2, frame1Rect, scale)
    ];
    updates.forEach((update) => {
      if (update) update.label.style.left = update.left + 'px';
    });
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
