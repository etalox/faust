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

  if (points.length < 3) return d;

  let newD = "";
  const len = points.length;

  for (let i = 0; i < len; i++) {
    const p1 = points[(i - 1 + len) % len];
    const p2 = points[i];
    const p3 = points[(i + 1) % len];

    const dx1 = p1.x - p2.x;
    const dy1 = p1.y - p2.y;
    const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);

    const dx2 = p3.x - p2.x;
    const dy2 = p3.y - p2.y;
    const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

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

const r = 1.0;

const paths = {
  growBar1Left_0: 'M 50,101 L 72,112 L 72,130 L 50,119 Z',
  growBar1Left_50: 'M 50,89 L 72,100 L 72,130 L 50,119 Z',
  growBar1Right_0: 'M 72,112 L 94,101 L 94,119 L 72,130 Z',
  growBar1Right_50: 'M 72,100 L 94,89 L 94,119 L 72,130 Z',
  growBar1Top_0: 'M 72,90 L 94,101 L 72,112 L 50,101 Z',
  growBar1Top_50: 'M 72,78 L 94,89 L 72,100 L 50,89 Z',

  growBar2Left_0: 'M 98,87 L 120,98 L 120,130 L 98,119 Z',
  growBar2Left_50: 'M 98,71 L 120,82 L 120,130 L 98,119 Z',
  growBar2Right_0: 'M 120,98 L 142,87 L 142,119 L 120,130 Z',
  growBar2Right_50: 'M 120,82 L 142,71 L 142,119 L 120,130 Z',
  growBar2Top_0: 'M 120,76 L 142,87 L 120,98 L 98,87 Z',
  growBar2Top_50: 'M 120,60 L 142,71 L 120,82 L 98,71 Z',

  growBar3Left_0: 'M 146,69 L 168,80 L 168,130 L 146,119 Z',
  growBar3Left_50: 'M 146,49 L 168,60 L 168,130 L 146,119 Z',
  growBar3Right_0: 'M 168,80 L 190,69 L 190,119 L 168,130 Z',
  growBar3Right_50: 'M 168,60 L 190,49 L 190,119 L 168,130 Z',
  growBar3Top_0: 'M 168,58 L 190,69 L 168,80 L 146,69 Z',
  growBar3Top_50: 'M 168,38 L 190,49 L 168,60 L 146,49 Z'
};

for (const [name, d] of Object.entries(paths)) {
  console.log(`${name}: "${roundPath(d, r)}",`);
}
