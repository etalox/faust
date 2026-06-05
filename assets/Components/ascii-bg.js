(() => {
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        if (existing.getAttribute('data-loaded') === 'true') {
          resolve();
        } else {
          existing.addEventListener('load', () => resolve());
          existing.addEventListener('error', (e) => reject(e));
        }
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.setAttribute('data-loaded', 'false');
      script.onload = () => {
        script.setAttribute('data-loaded', 'true');
        resolve();
      };
      script.onerror = (e) => reject(e);
      document.head.appendChild(script);
    });
  }

  let loadingPromise = null;
  function loadDependencies() {
    if (loadingPromise) return loadingPromise;
    loadingPromise = (async () => {
      if (!window.THREE) {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js');
      }
      if (!window.THREE.STLLoader) {
        await loadScript('https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/js/loaders/STLLoader.js');
      }
    })();
    return loadingPromise;
  }

  class FaustAsciiBg extends HTMLElement {
    async connectedCallback() {
      // Determine the root prefix dynamically based on path
      const path = window.location.pathname.toLowerCase();
      const rootPrefix = (path.includes('/start/') || path.endsWith('/start') || path.includes('/careers/') || path.endsWith('/careers') || path.includes('/about/') || path.endsWith('/about')) ? '../' : './';
      
      try {
        await loadDependencies();
      } catch (e) {
        console.error("Failed to load Three.js dependencies for ASCII background:", e);
        return;
      }

      this.initScene(rootPrefix);
    }

    disconnectedCallback() {
      this.cleanup();
    }

    initScene(rootPrefix) {
      const container = this;

      // Custom high-performance ASCII Effect that renders to a single <pre> element
      class CustomAsciiEffect {
        constructor(renderer, charSet = ' .:-+/*=%', options = {}) {
          const resolution = options.resolution || 0.15;
          const domElement = document.createElement('pre');
          domElement.style.margin = '0';
          domElement.style.padding = '0';
          domElement.style.fontFamily = 'monospace';
          domElement.style.whiteSpace = 'pre';
          domElement.style.cursor = 'default';
          domElement.style.textShadow = 'none';

          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          let width = 0;
          let height = 0;
          let cols = 0;
          let rows = 0;

          this.domElement = domElement;

          this.setSize = function(w, h) {
            width = w;
            height = h;
            
            // Calculate cols and rows (rows adjusted by 0.6 for monospace aspect ratio)
            cols = Math.round(width * resolution);
            rows = Math.round(height * resolution * 0.6);
            
            canvas.width = cols;
            canvas.height = rows;
            
            renderer.setSize(w, h);
            
            // Font sizing dynamically based on width and cols to cover container
            const charWidth = width / cols;
            domElement.style.fontSize = `${charWidth * 1.65}px`;
            domElement.style.lineHeight = `${charWidth * 1.65}px`;
          };

          this.render = function(scene, camera) {
            renderer.render(scene, camera);
            ctx.clearRect(0, 0, cols, rows);
            ctx.drawImage(renderer.domElement, 0, 0, cols, rows);
            
            try {
              const imgData = ctx.getImageData(0, 0, cols, rows).data;
              let asciiStr = '';
              const len = charSet.length;
              
              for (let y = 0; y < rows; y++) {
                for (let x = 0; x < cols; x++) {
                  const idx = (y * cols + x) * 4;
                  const r = imgData[idx];
                  const g = imgData[idx + 1];
                  const b = imgData[idx + 2];
                  // Relative luminance formula
                  const brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;
                  const charIdx = Math.floor((brightness / 255) * (len - 1));
                  asciiStr += charSet[charIdx];
                }
                asciiStr += '\n';
              }
              domElement.textContent = asciiStr;
            } catch (e) {
              console.warn("Could not read WebGL canvas pixels:", e);
            }
          };
        }
      }

      const scene = new THREE.Scene();
      
      const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
      camera.position.y = 80;
      camera.position.z = 240;
      camera.lookAt(scene.position);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      
      // Render smaller and denser ASCII characters (approx 17px, matching body text) with a transparent background
      const effect = new CustomAsciiEffect(renderer, ' .:-+/*=%', { 
        resolution: 0.1176
      });
      effect.domElement.style.color = 'var(--fg)';
      effect.domElement.style.backgroundColor = 'transparent';
      container.appendChild(effect.domElement);

      function updateEffectSize() {
        effect.setSize(window.innerWidth, window.innerHeight);
      }
      updateEffectSize();

      const ambientLight = new THREE.AmbientLight(0x333333);
      scene.add(ambientLight);

      const pointLight1 = new THREE.PointLight(0xffffff, 1.8);
      pointLight1.position.set(120, 250, 180);
      scene.add(pointLight1);

      const pointLight2 = new THREE.PointLight(0xffffff, 0.6);
      pointLight2.position.set(-120, -150, 100);
      scene.add(pointLight2);

      const group = new THREE.Group();
      scene.add(group);

      let mesh = null;

      function createMesh(geometry) {
        const material = new THREE.MeshPhongMaterial({ 
          color: 0xffffff, 
          specular: 0x222222, 
          shininess: 120,
          flatShading: true
        });
        
        mesh = new THREE.Mesh(geometry, material);
        geometry.center();
        geometry.computeVertexNormals();
        
        geometry.computeBoundingSphere();
        const sphere = geometry.boundingSphere;
        const radius = sphere.radius;
        
        const scaleFactor = 100 / radius;
        mesh.scale.set(scaleFactor, scaleFactor, scaleFactor);
        
        // Tilt forward slightly for a nice 3D presentation angle
        mesh.rotation.x = -Math.PI / 4.5;
        
        group.add(mesh);
      }

      const loader = new THREE.STLLoader();
      if (window.location.protocol === 'file:') {
        // Fallback geometry if opened locally via file:// due to CORS
        const geometry = new THREE.TorusKnotGeometry(12, 3.5, 120, 16);
        createMesh(geometry);
      } else {
        loader.load(rootPrefix + 'assets/Logotypes/3dsvg.stl', function (geometry) {
          createMesh(geometry);
        }, undefined, function (error) {
          console.warn("Could not load STL, loading TorusKnot fallback:", error);
          const geometry = new THREE.TorusKnotGeometry(12, 3.5, 120, 16);
          createMesh(geometry);
        });
      }

      let mouseX = 0;
      let mouseY = 0;
      let targetRotationX = 0;
      let targetRotationY = 0;
      let lastMouseMoveTime = 0;

      this._onMouseMove = (e) => {
        mouseX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
        mouseY = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
        lastMouseMoveTime = performance.now();
      };
      window.addEventListener('mousemove', this._onMouseMove);

      this._onResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        updateEffectSize();
      };
      window.addEventListener('resize', this._onResize);

      let autoTime = 0;
      let isVisible = false;
      let animFrameId = null;
      let lastTime = 0;
      const fps = 24; // Cap frame rate at 24fps for low CPU overhead
      const fpsInterval = 1000 / fps;

      function animate(now) {
        if (!isVisible || document.hidden) {
          animFrameId = null;
          return;
        }
        animFrameId = requestAnimationFrame(animate);

        const elapsed = now - lastTime;

        if (elapsed > fpsInterval) {
          lastTime = now - (elapsed % fpsInterval);

          const timeDeltaFactor = elapsed / 16.67; // Normalize speeds based on 60fps frame duration

          const nowTime = performance.now();
          const idleTime = lastMouseMoveTime > 0 ? (nowTime - lastMouseMoveTime) : Infinity;

          // Smoothly interpolate mouse influence from 1 (active) to 0 (idle after 1s of no movement)
          let mouseInfluence = 0;
          if (lastMouseMoveTime > 0) {
            if (idleTime < 1000) {
              mouseInfluence = 1;
            } else if (idleTime < 3000) {
              // Fade out over 2 seconds
              mouseInfluence = 1 - (idleTime - 1000) / 2000;
            }
          }

          autoTime += 0.004 * timeDeltaFactor;

          // Continuous Y rotation: baseline rotation plus mouse influence offset
          targetRotationY = autoTime + (mouseX * 2.5) * mouseInfluence;

          // X rotation transitions smoothly back to idle sinusoidal tilt when idle
          const idleTiltX = -Math.PI / 9 + Math.sin(autoTime * 0.5) * 0.08;
          const mouseTiltX = mouseY * 0.15 - Math.PI / 9;
          targetRotationX = mouseTiltX * mouseInfluence + idleTiltX * (1 - mouseInfluence);

          group.rotation.x += (targetRotationX - group.rotation.x) * 0.02 * timeDeltaFactor;
          group.rotation.y += (targetRotationY - group.rotation.y) * 0.02 * timeDeltaFactor;
          
          if (mesh) {
            mesh.rotation.y = 0;
          }

          effect.render(scene, camera);
        }
      }

      const handleVisibilityChange = () => {
        if (!document.hidden && isVisible && !animFrameId) {
          lastTime = performance.now();
          animate(lastTime);
        }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          isVisible = entry.isIntersecting;
          if (isVisible && !document.hidden && !animFrameId) {
            lastTime = performance.now();
            animate(lastTime);
          }
        });
      }, { threshold: 0.01 });
      observer.observe(container);

      this._cleanup = () => {
        isVisible = false;
        if (animFrameId) {
          cancelAnimationFrame(animFrameId);
          animFrameId = null;
        }
        window.removeEventListener('mousemove', this._onMouseMove);
        window.removeEventListener('resize', this._onResize);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        observer.disconnect();
        try {
          renderer.dispose();
        } catch (e) {}
      };
    }

    cleanup() {
      if (this._cleanup) {
        this._cleanup();
      }
    }
  }

  customElements.define('faust-ascii-bg', FaustAsciiBg);
})();
