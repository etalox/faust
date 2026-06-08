function arcToSegments(x1, y1, rx, ry, phi, fa, fs, x2, y2) {
  if (rx === 0 || ry === 0) {
    return [{x: x2, y: y2}];
  }
  rx = Math.abs(rx);
  ry = Math.abs(ry);
  phi = (phi * Math.PI) / 180;
  
  const cosPhi = Math.cos(phi);
  const sinPhi = Math.sin(phi);
  
  const dx = (x1 - x2) / 2;
  const dy = (y1 - y2) / 2;
  const x1p = cosPhi * dx + sinPhi * dy;
  const y1p = -sinPhi * dx + cosPhi * dy;
  
  let rxSq = rx * rx;
  let rySq = ry * ry;
  const x1pSq = x1p * x1p;
  const y1pSq = y1p * y1p;
  
  let radicand = (rxSq * rySq - rxSq * y1pSq - rySq * x1pSq) / (rxSq * y1pSq + rySq * x1pSq);
  if (radicand < 0) radicand = 0;
  let coef = (fa === fs ? -1 : 1) * Math.sqrt(radicand);
  
  const cxp = coef * ((rx * y1p) / ry);
  const cyp = coef * -((ry * x1p) / rx);
  
  const cx = cosPhi * cxp - sinPhi * cyp + (x1 + x2) / 2;
  const cy = sinPhi * cxp + cosPhi * cyp + (y1 + y2) / 2;
  
  const ux = (x1p - cxp) / rx;
  const uy = (y1p - cyp) / ry;
  const vx = (-x1p - cxp) / rx;
  const vy = (-y1p - cyp) / ry;
  
  const angleBetween = (ux, uy, vx, vy) => {
    const dot = ux * vx + uy * vy;
    const len = Math.sqrt(ux * ux + uy * uy) * Math.sqrt(vx * vx + vy * vy);
    let angle = Math.acos(Math.max(-1, Math.min(1, dot / len)));
    if (ux * vy - uy * vx < 0) angle = -angle;
    return angle;
  };
  
  let theta1 = angleBetween(1, 0, ux, uy);
  let dTheta = angleBetween(ux, uy, vx, vy);
  
  if (fs === 0 && dTheta > 0) {
    dTheta -= 2 * Math.PI;
  } else if (fs === 1 && dTheta < 0) {
    dTheta += 2 * Math.PI;
  }
  
  const points = [];
  const numSegments = 16;
  for (let i = 1; i <= numSegments; i++) {
    const theta = theta1 + (dTheta * i) / numSegments;
    const x = cosPhi * rx * Math.cos(theta) - sinPhi * ry * Math.sin(theta) + cx;
    const y = sinPhi * rx * Math.cos(theta) + cosPhi * ry * Math.sin(theta) + cy;
    points.push({ x, y });
  }
  return points;
}

function convertArcsToLines(d) {
  const commands = d.trim().split(/(?=[MLAZza])/);
  let currentPoint = { x: 0, y: 0 };
  let startPoint = null;
  let newD = "";
  
  for (let cmd of commands) {
    cmd = cmd.trim();
    if (!cmd) continue;
    const type = cmd[0];
    const coords = cmd.slice(1).trim().split(/[\s,]+/).map(Number).filter(n => !isNaN(n));
    
    if (type === 'M' || type === 'm') {
      let x = coords[0];
      let y = coords[1];
      if (type === 'm') {
        x += currentPoint.x;
        y += currentPoint.y;
      }
      currentPoint = { x, y };
      startPoint = currentPoint;
      newD += `M ${x.toFixed(2)},${y.toFixed(2)} `;
    } else if (type === 'L' || type === 'l') {
      let x = coords[0];
      let y = coords[1];
      if (type === 'l') {
        x += currentPoint.x;
        y += currentPoint.y;
      }
      currentPoint = { x, y };
      newD += `L ${x.toFixed(2)},${y.toFixed(2)} `;
    } else if (type === 'A' || type === 'a') {
      const rx = coords[0];
      const ry = coords[1];
      const xAxisRotation = coords[2];
      const largeArcFlag = coords[3];
      const sweepFlag = coords[4];
      let x = coords[5];
      let y = coords[6];
      if (type === 'a') {
        x += currentPoint.x;
        y += currentPoint.y;
      }
      
      const pts = arcToSegments(currentPoint.x, currentPoint.y, rx, ry, xAxisRotation, largeArcFlag, sweepFlag, x, y);
      for (let pt of pts) {
        newD += `L ${pt.x.toFixed(2)},${pt.y.toFixed(2)} `;
      }
      currentPoint = { x, y };
    } else if (type === 'Z' || type === 'z') {
      if (startPoint) {
        currentPoint = startPoint;
      }
      newD += "Z ";
    }
  }
  return newD;
}

function roundPath(d, r) {
  const points = [];
  const commands = d.trim().split(/(?=[MLZz])/);
  let startPoint = null;
  let currentPoint = null;

  for (let cmd of commands) {
    cmd = cmd.trim();
    if (!cmd) continue;
    const type = cmd[0];
    const coords = cmd.slice(1).trim().split(/[\s,]+/).map(Number).filter(n => !isNaN(n));
    if (type === 'M' || type === 'm') {
      currentPoint = { x: coords[0], y: coords[1] };
      startPoint = currentPoint;
      points.push(currentPoint);
    } else if (type === 'L' || type === 'l') {
      currentPoint = { x: coords[0], y: coords[1] };
      points.push(currentPoint);
    }
  }

  const uniquePoints = [];
  for (let p of points) {
    if (uniquePoints.length === 0) {
      uniquePoints.push(p);
    } else {
      const last = uniquePoints[uniquePoints.length - 1];
      if (Math.abs(last.x - p.x) > 0.01 || Math.abs(last.y - p.y) > 0.01) {
        uniquePoints.push(p);
      }
    }
  }
  if (uniquePoints.length > 1) {
    const first = uniquePoints[0];
    const last = uniquePoints[uniquePoints.length - 1];
    if (Math.abs(last.x - first.x) < 0.01 && Math.abs(last.y - first.y) < 0.01) {
      uniquePoints.pop();
    }
  }

  if (uniquePoints.length < 3) return d;

  let newD = "";
  const len = uniquePoints.length;

  for (let i = 0; i < len; i++) {
    const p1 = uniquePoints[(i - 1 + len) % len];
    const p2 = uniquePoints[i];
    const p3 = uniquePoints[(i + 1) % len];

    const dx1 = p1.x - p2.x;
    const dy1 = p1.y - p2.y;
    const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);

    const dx2 = p3.x - p2.x;
    const dy2 = p3.y - p2.y;
    const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

    const cosAngle = (dx1 * dx2 + dy1 * dy2) / (len1 * len2);

    if (cosAngle < -0.80) {
      if (i === 0) {
        newD += `M ${p2.x.toFixed(2)},${p2.y.toFixed(2)} `;
      } else {
        newD += `L ${p2.x.toFixed(2)},${p2.y.toFixed(2)} `;
      }
      continue;
    }

    const actualR = Math.min(r, len1 / 2.1, len2 / 2.1);

    const ax = p2.x + (dx1 / len1) * actualR;
    const ay = p2.y + (dy1 / len1) * actualR;

    const bx = p2.x + (dx2 / len2) * actualR;
    const by = p2.y + (dy2 / len2) * actualR;

    if (i === 0) {
      newD += `M ${ax.toFixed(2)},${ay.toFixed(2)} `;
    } else {
      newD += `L ${ax.toFixed(2)},${ay.toFixed(2)} `;
    }
    newD += `Q ${p2.x.toFixed(2)},${p2.y.toFixed(2)} ${bx.toFixed(2)},${by.toFixed(2)} `;
  }
  newD += "Z";
  return newD;
}

class FaustIllustrationRevenue extends HTMLElement {
  connectedCallback() {
    this.style.display = 'contents';
    this.innerHTML = `
      <svg viewBox="0 0 240 160" class="perk-technical-svg">
        <!-- Revenue Share: 3D Donut Chart with 25% slice floating -->
        
        <!-- 1. Static 75% Donut Chart Base -->
        <g class="revenue-base">
          <!-- Inner Wall of the hole (back) -->
          <path d="M 100,80 A 28 14 0 1 1 140 80 L 140,100 A 28 14 0 1 0 100,100 Z" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.7" stroke-opacity="0.12"/>
          <!-- Left outer wall -->
          <path d="M 48,70 A 72 36 0 0 0 69 95.5 L 69,115.5 A 72 36 0 0 1 48,90 Z" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.7" stroke-opacity="0.12"/>
          <!-- Right outer wall -->
          <path d="M 171,95.5 A 72 36 0 0 0 192 70 L 192,90 A 72 36 0 0 1 171,115.5 Z" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.7" stroke-opacity="0.12"/>
          <!-- Cut Face 1 (Right) -->
          <path d="M 140,80 L 171,95.5 L 171,115.5 L 140,100 Z" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.7" stroke-opacity="0.12"/>
          <!-- Cut Face 2 (Left) -->
          <path d="M 69,95.5 L 100,80 L 100,100 L 69,115.5 Z" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.7" stroke-opacity="0.12"/>
          <!-- Top Face -->
          <path d="M 100,80 L 69,95.5 A 72 36 0 1 1 171 95.5 L 140,80 A 28 14 0 1 0 100 80 Z" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.7" stroke-opacity="0.12"/>
        </g>

        <!-- 2. Floating 25% Slice (floats together) -->
        <g class="revenue-layer">
          <!-- Cut Face 1 (Right) -->
          <path d="M 140,80 L 171,95.5 L 171,115.5 L 140,100 Z" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.7" stroke-opacity="0.38"/>
          <!-- Cut Face 2 (Left) -->
          <path d="M 69,95.5 L 100,80 L 100,100 L 69,115.5 Z" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.7" stroke-opacity="0.38"/>
          <!-- Outer Wall -->
          <path d="M 171,95.5 A 72 36 0 0 1 69 95.5 L 69,115.5 A 72 36 0 0 0 171 115.5 Z" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.7" stroke-opacity="0.38"/>
          <!-- Top Face -->
          <path d="M 140,80 L 171,95.5 A 72 36 0 0 1 69 95.5 L 100,80 A 28 14 0 0 0 140 80 Z" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.8" stroke-opacity="0.38"/>
        </g>
      </svg>
    `;
  }
}
customElements.define('faust-illustration-revenue', FaustIllustrationRevenue);

class FaustIllustrationAutonomy extends HTMLElement {
  connectedCallback() {
    this.style.display = 'contents';
    const r = 1.0; // Rounding radius in SVG pixels
    this.innerHTML = `
      <svg viewBox="0 0 240 160" class="perk-technical-svg">
        <!-- Autonomy: Independent isometric cubes with asynchronous rotating timeline dials -->
        <g transform="translate(30, 80)"><g class="auto-module">
          <ellipse class="auto-dial dial-left" cx="25" cy="27" rx="32" ry="16" fill="none" stroke="currentColor" stroke-width="0.6" stroke-opacity="0.2" stroke-dasharray="3 5"/>
          <path d="${roundPath("M 0,0 L 25,-12 L 50,0 L 25,12 Z", r)}" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.7" stroke-opacity="0.3"/>
          <path d="${roundPath("M 50,0 L 50,29 L 25,41 L 25,12 Z", r)}" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.7" stroke-opacity="0.18"/>
          <path d="${roundPath("M 0,0 L 0,29 L 25,41 L 25,12 Z", r)}" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.7" stroke-opacity="0.22"/>
        </g></g>
        <g transform="translate(95, 55)"><g class="auto-module auto-accent">
          <ellipse class="auto-dial dial-center" cx="25" cy="27" rx="32" ry="16" fill="none" stroke="currentColor" stroke-width="0.6" stroke-opacity="0.3" stroke-dasharray="3 5"/>
          <path d="${roundPath("M 0,0 L 25,-12 L 50,0 L 25,12 Z", r)}" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.7" stroke-opacity="0.4"/>
          <path d="${roundPath("M 50,0 L 50,29 L 25,41 L 25,12 Z", r)}" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.7" stroke-opacity="0.22"/>
          <path d="${roundPath("M 0,0 L 0,29 L 25,41 L 25,12 Z", r)}" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.7" stroke-opacity="0.28"/>
        </g></g>
        <g transform="translate(160, 75)"><g class="auto-module">
          <ellipse class="auto-dial dial-right" cx="25" cy="27" rx="32" ry="16" fill="none" stroke="currentColor" stroke-width="0.6" stroke-opacity="0.2" stroke-dasharray="3 5"/>
          <path d="${roundPath("M 0,0 L 25,-12 L 50,0 L 25,12 Z", r)}" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.7" stroke-opacity="0.3"/>
          <path d="${roundPath("M 50,0 L 50,29 L 25,41 L 25,12 Z", r)}" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.7" stroke-opacity="0.18"/>
          <path d="${roundPath("M 0,0 L 0,29 L 25,41 L 25,12 Z", r)}" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.7" stroke-opacity="0.22"/>
        </g></g>
        <line class="auto-connector" x1="80" y1="86" x2="95" y2="73" stroke="currentColor" stroke-width="0.5" opacity="0.12"/>
        <line class="auto-connector" x1="145" y1="73" x2="160" y2="81" stroke="currentColor" stroke-width="0.5" opacity="0.12"/>
      </svg>
    `;
  }
}
customElements.define('faust-illustration-autonomy', FaustIllustrationAutonomy);

class FaustIllustrationEvidence extends HTMLElement {
  connectedCallback() {
    this.style.display = 'contents';
    const r = 1.0; // Rounding radius in SVG pixels
    this.innerHTML = `
      <svg viewBox="0 0 240 160" class="perk-technical-svg">
        <!-- Evidence: Isometric bar chart — parallel 3D aligned bars -->
        <!-- Bar width: (+22,-11), depth: (-22,+11), height: (0,-N) -->

        <!-- Bar 3: Tall — height 50, base translated to Y=101 (back-most, drawn first) -->
        <g class="evidence-bar-iso evidence-accent" transform="translate(-12, -18)">
          <path d="${roundPath("M 146,69 L 168,80 L 168,130 L 146,119 Z", r)}" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.7" stroke-opacity="0.35"/>
          <path d="${roundPath("M 168,80 L 190,69 L 190,119 L 168,130 Z", r)}" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.7" stroke-opacity="0.25"/>
          <path d="${roundPath("M 168,58 L 190,69 L 168,80 L 146,69 Z", r)}" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.7" stroke-opacity="0.42"/>
        </g>

        <!-- Bar 2: Medium — height 32, base at Y=119 (middle, drawn second) -->
        <g class="evidence-bar-iso">
          <path d="${roundPath("M 98,87 L 120,98 L 120,130 L 98,119 Z", r)}" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.6" stroke-opacity="0.28"/>
          <path d="${roundPath("M 120,98 L 142,87 L 142,119 L 120,130 Z", r)}" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.6" stroke-opacity="0.2"/>
          <path d="${roundPath("M 120,76 L 142,87 L 120,98 L 98,87 Z", r)}" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.6" stroke-opacity="0.35"/>
        </g>

        <!-- Bar 1: Short — height 18 (cube), base translated to Y=137 (front-most, drawn last) -->
        <g class="evidence-bar-iso" transform="translate(12, 18)">
          <path d="${roundPath("M 50,101 L 72,112 L 72,130 L 50,119 Z", r)}" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.6" stroke-opacity="0.2"/>
          <path d="${roundPath("M 72,112 L 94,101 L 94,119 L 72,130 Z", r)}" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.6" stroke-opacity="0.15"/>
          <path d="${roundPath("M 72,90 L 94,101 L 72,112 L 50,101 Z", r)}" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.6" stroke-opacity="0.25"/>
        </g>
      </svg>
    `;
  }
}
customElements.define('faust-illustration-evidence', FaustIllustrationEvidence);

class FaustIllustrationHighTicket extends HTMLElement {
  connectedCallback() {
    this.style.display = 'contents';
    const r = 1.0; // Rounding radius in SVG pixels
    this.innerHTML = `
      <svg viewBox="0 0 240 160" class="perk-technical-svg">
        <!-- High-Ticket: Isometric server layers receding -->
        <g transform="translate(40, 128)"><g class="infra-layer">
          <path d="${roundPath("M 0,0 L 80,-24 L 160,0 L 80,24 Z", r)}" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.5" stroke-opacity="0.07"/>
          <path d="${roundPath("M 0,0 L 80,24 L 160,0 L 160,8 L 80,32 L 0,8 Z", r)}" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.5" stroke-opacity="0.07"/>
        </g></g>
        <g transform="translate(45, 114)"><g class="infra-layer">
          <path d="${roundPath("M 0,0 L 75,-22 L 150,0 L 75,22 Z", r)}" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.5" stroke-opacity="0.1"/>
          <path d="${roundPath("M 0,0 L 75,22 L 150,0 L 150,8 L 75,30 L 0,8 Z", r)}" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.5" stroke-opacity="0.1"/>
        </g></g>
        <g transform="translate(50, 100)"><g class="infra-layer">
          <path d="${roundPath("M 0,0 L 70,-20 L 140,0 L 70,20 Z", r)}" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.5" stroke-opacity="0.14"/>
          <path d="${roundPath("M 0,0 L 70,20 L 140,0 L 140,8 L 70,28 L 0,8 Z", r)}" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.5" stroke-opacity="0.14"/>
        </g></g>
        <g transform="translate(55, 86)"><g class="infra-layer">
          <path d="${roundPath("M 0,0 L 65,-18 L 130,0 L 65,18 Z", r)}" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.5" stroke-opacity="0.18"/>
          <path d="${roundPath("M 0,0 L 65,18 L 130,0 L 130,8 L 65,26 L 0,8 Z", r)}" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.5" stroke-opacity="0.18"/>
        </g></g>
        <g transform="translate(60, 72)"><g class="infra-layer">
          <path d="${roundPath("M 0,0 L 60,-16 L 120,0 L 60,16 Z", r)}" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.5" stroke-opacity="0.23"/>
          <path d="${roundPath("M 0,0 L 60,16 L 120,0 L 120,8 L 60,24 L 0,8 Z", r)}" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.5" stroke-opacity="0.23"/>
        </g></g>
        <g transform="translate(65, 58)"><g class="infra-top">
          <path d="${roundPath("M 0,0 L 55,-14 L 110,0 L 55,14 Z", r)}" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.7" stroke-opacity="0.38"/>
          <path d="${roundPath("M 0,0 L 55,14 L 110,0 L 110,8 L 55,22 L 0,8 Z", r)}" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.7" stroke-opacity="0.38"/>
          <ellipse cx="55" cy="0" rx="20" ry="5" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.18"/>
        </g></g>
      </svg>
    `;
  }
}
customElements.define('faust-illustration-highticket', FaustIllustrationHighTicket);
