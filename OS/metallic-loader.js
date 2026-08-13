(function () {
  'use strict';

  var canvas = document.querySelector('[data-metallic-paint]');
  if (!canvas || !window.WebGL2RenderingContext) return;
  var gl = canvas.getContext('webgl2', { alpha: true, antialias: true, premultipliedAlpha: false });
  if (!gl) return;

  // Adaptación nativa del tratamiento MetallicPaint: conserva su máscara de
  // profundidad, líquido animado, bandas metálicas y tintado cromático.
  var vertexSource = '#version 300 es\nprecision highp float;\nin vec2 a_position;\nout vec2 vP;\nvoid main(){vP=a_position*.5+.5;gl_Position=vec4(a_position,0.,1.);}';
  var fragmentSource = '#version 300 es\nprecision highp float;\nin vec2 vP;out vec4 oC;\nuniform sampler2D u_tex;\nuniform float u_time,u_ratio,u_imgRatio,u_seed,u_scale,u_refract,u_blur,u_liquid,u_bright,u_contrast,u_angle,u_fresnel,u_sharp,u_wave,u_noise,u_chroma,u_distort,u_contour;\nuniform vec3 u_lightColor,u_darkColor,u_tint;\nvec3 sC,sM;\nvec3 pW(vec3 v){vec3 i=floor(v),f=fract(v),s=sign(fract(v*.5)-.5),h=fract(sM*i+i.yzx),c=f*(f-1.);return s*c*((h*16.-4.)*c-1.);}\nvec3 aF(vec3 b,vec3 c){return pW(b+c.zxy-pW(b.zxy+c.yzx)+pW(b.yzx+c.xyz));}\nvec3 lM(vec3 s,vec3 p){return(p+aF(s,p))*.5;}\nvec2 fA(){vec2 c=vP-.5;c.x*=u_ratio>u_imgRatio?u_ratio/u_imgRatio:1.;c.y*=u_ratio>u_imgRatio?1.:u_imgRatio/u_ratio;return vec2(c.x+.5,.5-c.y);}\nvec2 rot(vec2 p,float r){float c=cos(r),s=sin(r);return vec2(p.x*c+p.y*s,p.y*c-p.x*s);}\nfloat bM(vec2 c,float t){vec2 l=smoothstep(vec2(0.),vec2(t),c),u=smoothstep(vec2(0.),vec2(t),1.-c);return l.x*l.y*u.x*u.y;}\nfloat mG(float hi,float lo,float t,float sh,float cv){sh*=(2.-u_sharp);float ci=smoothstep(.15,.85,cv),r=lo,e1=.08/u_scale;r=mix(r,hi,smoothstep(0.,sh*1.5,t));r=mix(r,lo,smoothstep(e1-sh,e1+sh,t));float e2=e1+.05/u_scale*(1.-ci*.35);r=mix(r,hi,smoothstep(e2-sh,e2+sh,t));float e3=e2+.025/u_scale*(1.-ci*.45);r=mix(r,lo,smoothstep(e3-sh,e3+sh,t));float e4=e1+.1/u_scale;float rm=1.-e4,gT=clamp((t-e4)/rm,0.,1.);r=mix(r,mix(hi,lo,smoothstep(0.,1.,gT)),smoothstep(e4-sh*.5,e4+sh*.5,t));return r;}\nvoid main(){sC=fract(vec3(.7548,.5698,.4154)*(u_seed+17.31))+.5;sM=fract(sC.zxy-sC.yzx*1.618);vec2 sc=vec2(vP.x*u_ratio,1.-vP.y);float ar=u_angle*3.14159/180.;sc=rot(sc-.5,ar)+.5;sc=clamp(sc,0.,1.);float sl=sc.x-sc.y,an=u_time*.001;vec2 iC=fA();vec4 texSample=texture(u_tex,iC);float dp=texSample.r,shapeMask=texSample.a;vec3 hi=u_lightColor*u_bright,lo=u_darkColor*(2.-u_bright);lo.b+=smoothstep(.6,1.4,sc.x+sc.y)*.08;vec2 fC=sc-.5;float rd=length(fC+vec2(0.,sl*.15));vec2 ag=rot(fC,(.22-sl*.18)*3.14159);float cv=1.-pow(rd*1.65,1.15);cv*=pow(sc.y,.35);float vs=shapeMask;vs*=bM(iC,.01);float fr=pow(1.-cv,u_fresnel)*.3;vs=min(vs+fr*vs,1.);float mT=an*.0625;vec3 wO=vec3(-1.05,1.35,1.55);vec3 wA=aF(vec3(31.,73.,56.),mT+wO)*.22*u_wave,wB=aF(vec3(24.,64.,42.),mT-wO.yzx)*.22*u_wave;vec2 nC=sc*45.*u_noise;nC+=aF(sC.zxy,an*.17*sC.yzx-sc.yxy*.35).xy*18.*u_wave;vec3 tC=vec3(.00041,.00053,.00076)*mT+wB*nC.x+wA*nC.y;tC=lM(sC,tC);tC=lM(sC+1.618,tC);float tb=sin(tC.x*3.14159)*.5+.5;tb=tb*2.-1.;float noiseVal=pW(vec3(sc*8.+an,an*.5)).x;float edgeFactor=smoothstep(0.,.5,dp)*smoothstep(1.,.5,dp);float lD=dp+(1.-dp)*u_liquid*tb;lD+=noiseVal*u_distort*.15*edgeFactor;float rB=clamp(1.-cv,0.,1.);float fl=ag.x+sl;fl+=noiseVal*sl*u_distort*edgeFactor;fl*=mix(1.,1.-dp*.5,u_contour);fl-=dp*u_contour*.8;float eI=smoothstep(0.,1.,lD)*smoothstep(1.,0.,lD);fl-=tb*sl*1.8*eI;float cA=cv*clamp(pow(sc.y,.12),.25,1.);fl*=.12+(1.05-lD)*cA;fl*=smoothstep(1.,.65,lD);float vA1=smoothstep(.08,.18,sc.y)*smoothstep(.38,.18,sc.y),vA2=smoothstep(.08,.18,1.-sc.y)*smoothstep(.38,.18,1.-sc.y);fl+=vA1*.16+vA2*.025;fl*=.45+pow(sc.y,2.)*.55;fl*=u_scale;fl-=an;float rO=rB+cv*tb*.025;float vM1=smoothstep(-.12,.18,sc.y)*smoothstep(.48,.08,sc.y),cM1=smoothstep(.35,.55,cv)*smoothstep(.95,.35,cv);rO+=vM1*cM1*4.5;rO-=sl;float bO=rB*1.25;float vM2=smoothstep(-.02,.35,sc.y)*smoothstep(.75,.08,sc.y),cM2=smoothstep(.35,.55,cv)*smoothstep(.75,.35,cv);bO+=vM2*cM2*.9;bO-=lD*.18;rO*=u_refract*u_chroma;bO*=u_refract*u_chroma;float sf=u_blur;float rC=mG(hi.r,lo.r,fract(fl+rO),sf+.018+u_refract*cv*.025,cv);float gC=mG(hi.g,lo.g,fract(fl),sf+.008/max(.01,1.-sl),cv);float bC=mG(hi.b,lo.b,fract(fl-bO),sf+.008,cv);vec3 col=vec3(rC,gC,bC);col=(col-.5)*u_contrast+.5;col=clamp(col,0.,1.);col=mix(col,1.-min(vec3(1.),(1.-col)/max(u_tint,vec3(.001))),length(u_tint-1.)*.5);oC=vec4(clamp(col,0.,1.)*vs,vs);}\n';

  function compile(source, type) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
  }

  var vertex = compile(vertexSource, gl.VERTEX_SHADER);
  var fragment = compile(fragmentSource, gl.FRAGMENT_SHADER);
  if (!vertex || !fragment) return;
  var program = gl.createProgram();
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

  function processLogo(image) {
    var sourceWidth = image.naturalWidth || image.width;
    var sourceHeight = image.naturalHeight || image.height;
    var scale = Math.min(2048 / Math.max(sourceWidth, sourceHeight), Math.max(1, 768 / Math.min(sourceWidth, sourceHeight)));
    var width = Math.round(sourceWidth * scale);
    var height = Math.round(sourceHeight * scale);
    var work = document.createElement('canvas');
    work.width = width;
    work.height = height;
    var context = work.getContext('2d', { willReadFrequently: true });
    context.drawImage(image, 0, 0, width, height);
    var source = context.getImageData(0, 0, width, height);
    var size = width * height;
    var alpha = new Float32Array(size);
    var edge = new Uint8Array(size);
    var depth = new Float32Array(size);

    // El asset de FaustOS es blanco sobre transparencia. A diferencia del
    // ejemplo de React Bits, blanco sigue siendo parte de la forma.
    for (var index = 0; index < size; index++) alpha[index] = source.data[index * 4 + 3] / 255;
    for (var y = 0; y < height; y++) {
      for (var x = 0; x < width; x++) {
        var pixel = y * width + x;
        if (alpha[pixel] < .1) continue;
        if (x === 0 || y === 0 || x === width - 1 || y === height - 1 || alpha[pixel - 1] < .1 || alpha[pixel + 1] < .1 || alpha[pixel - width] < .1 || alpha[pixel + width] < .1) edge[pixel] = 1;
      }
    }
    for (var iteration = 0; iteration < 100; iteration++) {
      for (var row = 1; row < height - 1; row++) {
        for (var column = 1; column < width - 1; column++) {
          var current = row * width + column;
          if (alpha[current] < .1 || edge[current]) continue;
          depth[current] = (depth[current - 1] + depth[current + 1] + depth[current - width] + depth[current + width] + .018) * .25;
        }
      }
    }
    var maximum = 0;
    for (var valueIndex = 0; valueIndex < size; valueIndex++) maximum = Math.max(maximum, depth[valueIndex]);
    var output = context.createImageData(width, height);
    for (var outputIndex = 0; outputIndex < size; outputIndex++) {
      var offset = outputIndex * 4;
      output.data[offset] = output.data[offset + 1] = output.data[offset + 2] = Math.round(255 * (1 - (depth[outputIndex] / Math.max(maximum, .0001))));
      output.data[offset + 3] = Math.round(alpha[outputIndex] * 255);
    }
    return output;
  }

  var vertices = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertices);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  gl.useProgram(program);
  var position = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  var uniforms = {
    time: gl.getUniformLocation(program, 'u_time'),
    ratio: gl.getUniformLocation(program, 'u_ratio'),
    imageRatio: gl.getUniformLocation(program, 'u_imgRatio'),
    texture: gl.getUniformLocation(program, 'u_tex')
  };
  function uniform1(name, value) { gl.uniform1f(gl.getUniformLocation(program, name), value); }
  function uniform3(name, value) { gl.uniform3f(gl.getUniformLocation(program, name), value[0], value[1], value[2]); }
  function paletteValue(value, fallback) {
    if (!value) return fallback;
    var parsed = value.split(',').map(function (component) { return Number.parseFloat(component.trim()); });
    return parsed.length === 3 && parsed.every(Number.isFinite) ? parsed : fallback;
  }
  var animationSpeed = Number.parseFloat(canvas.dataset.metallicSpeed);
  animationSpeed = Number.isFinite(animationSpeed) && animationSpeed >= 0 ? animationSpeed : 1;
  // Valores del ejemplo MetallicPaint proporcionado para FaustOS.
  uniform1('u_seed', 42);
  uniform1('u_scale', 4);
  uniform1('u_refract', .01);
  uniform1('u_blur', .015);
  uniform1('u_liquid', .75);
  uniform1('u_bright', 2);
  uniform1('u_contrast', .5);
  uniform1('u_angle', 0);
  uniform1('u_fresnel', 1);
  uniform1('u_sharp', 1);
  uniform1('u_wave', 1);
  uniform1('u_noise', .5);
  uniform1('u_chroma', 2);
  uniform1('u_distort', 1);
  uniform1('u_contour', .2);
  uniform3('u_lightColor', paletteValue(canvas.dataset.metallicLight, [1, 1, 1]));
  uniform3('u_darkColor', paletteValue(canvas.dataset.metallicDark, [0, .30196, 1]));
  uniform3('u_tint', paletteValue(canvas.dataset.metallicTint, [0.996, .702, 1]));

  var image = new Image();
  image.onload = function () {
    var pixels = processLogo(image);
    var texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, pixels.width, pixels.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels.data);
    gl.uniform1i(uniforms.texture, 0);
    gl.uniform1f(uniforms.imageRatio, pixels.width / pixels.height);
    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var width = Math.max(1, Math.round(canvas.clientWidth * dpr));
      var height = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; gl.viewport(0, 0, width, height); }
      gl.uniform1f(uniforms.ratio, width / height);
    }
    function render(time) {
      if (!document.documentElement.classList.contains('os-loading') && !document.documentElement.classList.contains('fatisa-loading')) return;
      resize();
      gl.uniform1f(uniforms.time, time * animationSpeed);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      window.requestAnimationFrame(render);
    }
    render(window.performance.now());
    gl.finish();
    window.requestAnimationFrame(function () {
      canvas.classList.add('is-ready');
    });
  };
  image.src = canvas.dataset.metallicSource || '../assets/FaustOS_logo.svg';
})();
