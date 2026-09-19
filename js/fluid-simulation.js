/**
 * ADRIAN SETH TABOTABO — REAL-TIME WEBGL FLUID SIMULATION
 * Inspired by Lusion.co & Navier-Stokes fluid physics.
 * Pure Vanilla JavaScript & WebGL (Zero external libraries, 100% GPU-accelerated).
 */

(function () {
  'use strict';

  const canvas = document.getElementById('fluidCanvas');
  if (!canvas) return;

  // Configuration tuned for silky soft pink aesthetics
  const config = {
    SIM_RESOLUTION: 128,
    DYE_RESOLUTION: 512,
    DENSITY_DISSIPATION: 0.97,
    VELOCITY_DISSIPATION: 0.98,
    PRESSURE: 0.8,
    PRESSURE_ITERATIONS: 20,
    CURL: 30,
    SPLAT_RADIUS: 0.25,
    SPLAT_FORCE: 6000,
    COLOR_UPDATE_SPEED: 10,
    PAUSED: false
  };

  // Color Palette: Petal Rose & Iridescent Twilight
  const PALETTE = [
    { r: 0.98, g: 0.44, b: 0.52 }, // Petal Rose (#FB7185)
    { r: 0.99, g: 0.72, b: 0.45 }, // Warm Peach Gold
    { r: 0.95, g: 0.45, b: 0.71 }, // Soft Magenta
    { r: 0.85, g: 0.55, b: 0.95 }, // Orchid Violet
    { r: 0.99, g: 0.60, b: 0.68 }  // Blush Rose
  ];

  let colorIndex = 0;

  function getNextColor() {
    colorIndex = (colorIndex + 1) % PALETTE.length;
    const base = PALETTE[colorIndex];
    return {
      r: base.r * 1.5,
      g: base.g * 1.5,
      b: base.b * 1.5
    };
  }

  // WebGL Context Setup
  let gl = canvas.getContext('webgl2', { alpha: true, depth: false, antialias: false });
  const isWebGL2 = !!gl;
  if (!isWebGL2) {
    gl = canvas.getContext('webgl', { alpha: true, depth: false, antialias: false }) ||
         canvas.getContext('experimental-webgl', { alpha: true, depth: false, antialias: false });
  }
  if (!gl) return;

  // Texture format extensions
  let halfFloatTexType;
  let supportLinearFiltering;

  if (isWebGL2) {
    gl.getExtension('EXT_color_buffer_float');
    supportLinearFiltering = gl.getExtension('OES_texture_float_linear');
    halfFloatTexType = gl.HALF_FLOAT;
  } else {
    const halfFloat = gl.getExtension('OES_texture_half_float');
    supportLinearFiltering = gl.getExtension('OES_texture_half_float_linear');
    halfFloatTexType = halfFloat ? halfFloat.HALF_FLOAT_OES : gl.UNSIGNED_BYTE;
  }

  gl.clearColor(0.0, 0.0, 0.0, 0.0);

  // GLSL Shader Sources
  const baseVertexShader = `
    precision highp float;
    attribute vec2 aPosition;
    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform vec2 texelSize;
    void main () {
      vUv = aPosition * 0.5 + 0.5;
      vL = vUv - vec2(texelSize.x, 0.0);
      vR = vUv + vec2(texelSize.x, 0.0);
      vT = vUv + vec2(0.0, texelSize.y);
      vB = vUv - vec2(0.0, texelSize.y);
      gl_Position = vec4(aPosition, 0.0, 1.0);
    }
  `;

  const clearShader = `
    precision mediump float;
    varying vec2 vUv;
    uniform sampler2D uTexture;
    uniform float value;
    void main () {
      gl_FragColor = value * texture2D(uTexture, vUv);
    }
  `;

  const displayShader = `
    precision highp float;
    varying vec2 vUv;
    uniform sampler2D uTexture;
    void main () {
      vec4 c = texture2D(uTexture, vUv);
      // Soft saturation and subtle luminous bloom
      float a = max(c.r, max(c.g, c.b));
      gl_FragColor = vec4(c.rgb, a * 0.45);
    }
  `;

  const splatShader = `
    precision highp float;
    varying vec2 vUv;
    uniform sampler2D uTarget;
    uniform float aspectRatio;
    uniform vec3 color;
    uniform vec2 point;
    uniform float radius;
    void main () {
      vec2 p = vUv - point.xy;
      p.x *= aspectRatio;
      vec3 splat = exp(-dot(p, p) / radius) * color;
      vec3 base = texture2D(uTarget, vUv).xyz;
      gl_FragColor = vec4(base + splat, 1.0);
    }
  `;

  const advectionShader = `
    precision highp float;
    varying vec2 vUv;
    uniform sampler2D uVelocity;
    uniform sampler2D uSource;
    uniform vec2 texelSize;
    uniform float dt;
    uniform float dissipation;
    void main () {
      vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
      gl_FragColor = dissipation * texture2D(uSource, coord);
      gl_FragColor.a = 1.0;
    }
  `;

  const divergenceShader = `
    precision mediump float;
    varying highp vec2 vUv;
    varying highp vec2 vL;
    varying highp vec2 vR;
    varying highp vec2 vT;
    varying highp vec2 vB;
    uniform sampler2D uVelocity;
    void main () {
      float L = texture2D(uVelocity, vL).x;
      float R = texture2D(uVelocity, vR).x;
      float T = texture2D(uVelocity, vT).y;
      float B = texture2D(uVelocity, vB).y;
      vec2 C = texture2D(uVelocity, vUv).xy;
      if (vL.x < 0.0) L = -C.x;
      if (vR.x > 1.0) R = -C.x;
      if (vT.y > 1.0) T = -C.y;
      if (vB.y < 0.0) B = -C.y;
      float div = 0.5 * (R - L + T - B);
      gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
    }
  `;

  const curlShader = `
    precision mediump float;
    varying highp vec2 vUv;
    varying highp vec2 vL;
    varying highp vec2 vR;
    varying highp vec2 vT;
    varying highp vec2 vB;
    uniform sampler2D uVelocity;
    void main () {
      float L = texture2D(uVelocity, vL).y;
      float R = texture2D(uVelocity, vR).y;
      float T = texture2D(uVelocity, vT).x;
      float B = texture2D(uVelocity, vB).x;
      float vorticity = R - L - T + B;
      gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
    }
  `;

  const vorticityShader = `
    precision highp float;
    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uVelocity;
    uniform sampler2D uCurl;
    uniform float curl;
    uniform float dt;
    void main () {
      float L = texture2D(uCurl, vL).x;
      float R = texture2D(uCurl, vR).x;
      float T = texture2D(uCurl, vT).x;
      float B = texture2D(uCurl, vB).x;
      float C = texture2D(uCurl, vUv).x;
      vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
      force /= length(force) + 0.0001;
      force *= curl * C;
      force.y *= -1.0;
      vec2 vel = texture2D(uVelocity, vUv).xy;
      gl_FragColor = vec4(vel + force * dt, 0.0, 1.0);
    }
  `;

  const pressureShader = `
    precision mediump float;
    varying highp vec2 vUv;
    varying highp vec2 vL;
    varying highp vec2 vR;
    varying highp vec2 vT;
    varying highp vec2 vB;
    uniform sampler2D uPressure;
    uniform sampler2D uDivergence;
    void main () {
      float L = texture2D(uPressure, vL).x;
      float R = texture2D(uPressure, vR).x;
      float T = texture2D(uPressure, vT).x;
      float B = texture2D(uPressure, vB).x;
      float C = texture2D(uPressure, vUv).x;
      float divergence = texture2D(uDivergence, vUv).x;
      float pressure = (L + R + B + T - divergence) * 0.25;
      gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
    }
  `;

  const gradientSubtractShader = `
    precision mediump float;
    varying highp vec2 vUv;
    varying highp vec2 vL;
    varying highp vec2 vR;
    varying highp vec2 vT;
    varying highp vec2 vB;
    uniform sampler2D uPressure;
    uniform sampler2D uVelocity;
    void main () {
      float L = texture2D(uPressure, vL).x;
      float R = texture2D(uPressure, vR).x;
      float T = texture2D(uPressure, vT).x;
      float B = texture2D(uPressure, vB).x;
      vec2 velocity = texture2D(uVelocity, vUv).xy;
      velocity.xy -= vec2(R - L, T - B);
      gl_FragColor = vec4(velocity, 0.0, 1.0);
    }
  `;

  // Shader compilation helper
  class Program {
    constructor(vertexShader, fragmentShader) {
      this.program = gl.createProgram();
      const vs = this.compile(gl.VERTEX_SHADER, vertexShader);
      const fs = this.compile(gl.FRAGMENT_SHADER, fragmentShader);
      gl.attachShader(this.program, vs);
      gl.attachShader(this.program, fs);
      gl.linkProgram(this.program);
      this.uniforms = {};
    }

    compile(type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    }

    bind() {
      gl.useProgram(this.program);
    }
  }

  // Double-buffered FBO helper
  function createFBO(w, h, internalFormat, format, type, param) {
    gl.activeTexture(gl.TEXTURE0);
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);

    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.viewport(0, 0, w, h);
    gl.clear(gl.COLOR_BUFFER_BIT);

    return {
      texture,
      fbo,
      width: w,
      height: h,
      attach(id) {
        gl.activeTexture(gl.TEXTURE0 + id);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        return id;
      }
    };
  }

  function createDoubleFBO(w, h, internalFormat, format, type, param) {
    let fbo1 = createFBO(w, h, internalFormat, format, type, param);
    let fbo2 = createFBO(w, h, internalFormat, format, type, param);
    return {
      width: w,
      height: h,
      texelSizeX: 1.0 / w,
      texelSizeY: 1.0 / h,
      get read() { return fbo1; },
      set read(val) { fbo1 = val; },
      get write() { return fbo2; },
      set write(val) { fbo2 = val; },
      swap() {
        const temp = fbo1;
        fbo1 = fbo2;
        fbo2 = temp;
      }
    };
  }

  // Compile programs
  const filterParam = supportLinearFiltering ? gl.LINEAR : gl.NEAREST;
  const internalFormat = isWebGL2 ? gl.RGBA16F : gl.RGBA;
  const format = gl.RGBA;
  const texType = halfFloatTexType;

  const progClear = new Program(baseVertexShader, clearShader);
  const progDisplay = new Program(baseVertexShader, displayShader);
  const progSplat = new Program(baseVertexShader, splatShader);
  const progAdvection = new Program(baseVertexShader, advectionShader);
  const progDivergence = new Program(baseVertexShader, divergenceShader);
  const progCurl = new Program(baseVertexShader, curlShader);
  const progVorticity = new Program(baseVertexShader, vorticityShader);
  const progPressure = new Program(baseVertexShader, pressureShader);
  const progGradSubtract = new Program(baseVertexShader, gradientSubtractShader);

  // Geometry
  const quadBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);

  function blit(target) {
    if (!target) {
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    } else {
      gl.viewport(0, 0, target.width, target.height);
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
  }

  let density, velocity, divergence, curl, pressure;

  function initFramebuffers() {
    const simRes = config.SIM_RESOLUTION;
    const dyeRes = config.DYE_RESOLUTION;

    density = createDoubleFBO(dyeRes, dyeRes, internalFormat, format, texType, filterParam);
    velocity = createDoubleFBO(simRes, simRes, internalFormat, format, texType, filterParam);
    divergence = createFBO(simRes, simRes, internalFormat, format, texType, gl.NEAREST);
    curl = createFBO(simRes, simRes, internalFormat, format, texType, gl.NEAREST);
    pressure = createDoubleFBO(simRes, simRes, internalFormat, format, texType, gl.NEAREST);
  }

  function resizeCanvas() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      return true;
    }
    return false;
  }

  initFramebuffers();
  resizeCanvas();
  window.addEventListener('resize', () => {
    resizeCanvas();
  });

  // Splat injection function
  function splat(x, y, dx, dy, color) {
    // Splat velocity
    progSplat.bind();
    gl.uniform1i(gl.getUniformLocation(progSplat.program, 'uTarget'), velocity.read.attach(0));
    gl.uniform1f(gl.getUniformLocation(progSplat.program, 'aspectRatio'), canvas.width / canvas.height);
    gl.uniform2f(gl.getUniformLocation(progSplat.program, 'point'), x, y);
    gl.uniform3f(gl.getUniformLocation(progSplat.program, 'color'), dx, dy, 0.0);
    gl.uniform1f(gl.getUniformLocation(progSplat.program, 'radius'), config.SPLAT_RADIUS / 100.0);
    blit(velocity.write);
    velocity.swap();

    // Splat dye
    gl.uniform1i(gl.getUniformLocation(progSplat.program, 'uTarget'), density.read.attach(0));
    gl.uniform3f(gl.getUniformLocation(progSplat.program, 'color'), color.r, color.g, color.b);
    blit(density.write);
    density.swap();
  }

  window.triggerFluidSplat = function (clientX, clientY, intensity = 1.0) {
    const x = clientX / canvas.width;
    const y = 1.0 - clientY / canvas.height;
    const color = getNextColor();
    const dx = (Math.random() - 0.5) * 8000 * intensity;
    const dy = (Math.random() - 0.5) * 8000 * intensity;
    splat(x, y, dx, dy, color);
  };

  // Multiple initial splats on load
  function initialBurst() {
    for (let i = 0; i < 4; i++) {
      setTimeout(() => {
        const x = 0.2 + Math.random() * 0.6;
        const y = 0.2 + Math.random() * 0.6;
        const color = getNextColor();
        splat(x, y, (Math.random() - 0.5) * 4000, (Math.random() - 0.5) * 4000, color);
      }, i * 250);
    }
  }

  // Pointer Interaction
  const pointer = {
    x: 0,
    y: 0,
    dx: 0,
    dy: 0,
    moved: false
  };

  window.addEventListener('pointermove', (e) => {
    const newX = e.clientX / canvas.width;
    const newY = 1.0 - e.clientY / canvas.height;
    pointer.dx = (newX - pointer.x) * config.SPLAT_FORCE;
    pointer.dy = (newY - pointer.y) * config.SPLAT_FORCE;
    pointer.x = newX;
    pointer.y = newY;
    pointer.moved = true;
  });

  window.addEventListener('pointerdown', (e) => {
    window.triggerFluidSplat(e.clientX, e.clientY, 1.5);
  });

  // Scroll Velocity interaction
  let lastScrollY = window.pageYOffset;
  window.addEventListener('scroll', () => {
    const currentScrollY = window.pageYOffset;
    const delta = currentScrollY - lastScrollY;
    lastScrollY = currentScrollY;

    if (Math.abs(delta) > 5) {
      const x = Math.random();
      const y = 0.5;
      const color = getNextColor();
      splat(x, y, (Math.random() - 0.5) * 2000, -delta * 80, color);
    }
  }, { passive: true });

  // Main Render Loop
  let lastUpdateTime = performance.now();

  function update() {
    const now = performance.now();
    let dt = (now - lastUpdateTime) / 1000;
    dt = Math.min(dt, 0.033);
    lastUpdateTime = now;

    if (pointer.moved) {
      pointer.moved = false;
      splat(pointer.x, pointer.y, pointer.dx, pointer.dy, getNextColor());
    }

    // 1. Curl / Vorticity
    progCurl.bind();
    gl.uniform2f(gl.getUniformLocation(progCurl.program, 'texelSize'), velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(gl.getUniformLocation(progCurl.program, 'uVelocity'), velocity.read.attach(0));
    blit(curl);

    progVorticity.bind();
    gl.uniform2f(gl.getUniformLocation(progVorticity.program, 'texelSize'), velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(gl.getUniformLocation(progVorticity.program, 'uVelocity'), velocity.read.attach(0));
    gl.uniform1i(gl.getUniformLocation(progVorticity.program, 'uCurl'), curl.attach(1));
    gl.uniform1f(gl.getUniformLocation(progVorticity.program, 'curl'), config.CURL);
    gl.uniform1f(gl.getUniformLocation(progVorticity.program, 'dt'), dt);
    blit(velocity.write);
    velocity.swap();

    // 2. Divergence
    progDivergence.bind();
    gl.uniform2f(gl.getUniformLocation(progDivergence.program, 'texelSize'), velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(gl.getUniformLocation(progDivergence.program, 'uVelocity'), velocity.read.attach(0));
    blit(divergence);

    // 3. Clear pressure
    progClear.bind();
    gl.uniform1i(gl.getUniformLocation(progClear.program, 'uTexture'), pressure.read.attach(0));
    gl.uniform1f(gl.getUniformLocation(progClear.program, 'value'), config.PRESSURE);
    blit(pressure.write);
    pressure.swap();

    // 4. Pressure Poisson Solver
    progPressure.bind();
    gl.uniform2f(gl.getUniformLocation(progPressure.program, 'texelSize'), velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(gl.getUniformLocation(progPressure.program, 'uDivergence'), divergence.attach(0));
    for (let i = 0; i < config.PRESSURE_ITERATIONS; i++) {
      gl.uniform1i(gl.getUniformLocation(progPressure.program, 'uPressure'), pressure.read.attach(1));
      blit(pressure.write);
      pressure.swap();
    }

    // 5. Gradient Subtract
    progGradSubtract.bind();
    gl.uniform2f(gl.getUniformLocation(progGradSubtract.program, 'texelSize'), velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(gl.getUniformLocation(progGradSubtract.program, 'uPressure'), pressure.read.attach(0));
    gl.uniform1i(gl.getUniformLocation(progGradSubtract.program, 'uVelocity'), velocity.read.attach(1));
    blit(velocity.write);
    velocity.swap();

    // 6. Advect Velocity
    progAdvection.bind();
    gl.uniform2f(gl.getUniformLocation(progAdvection.program, 'texelSize'), velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(gl.getUniformLocation(progAdvection.program, 'uVelocity'), velocity.read.attach(0));
    gl.uniform1i(gl.getUniformLocation(progAdvection.program, 'uSource'), velocity.read.attach(0));
    gl.uniform1f(gl.getUniformLocation(progAdvection.program, 'dt'), dt);
    gl.uniform1f(gl.getUniformLocation(progAdvection.program, 'dissipation'), config.VELOCITY_DISSIPATION);
    blit(velocity.write);
    velocity.swap();

    // 7. Advect Dye (Color)
    gl.uniform2f(gl.getUniformLocation(progAdvection.program, 'texelSize'), density.texelSizeX, density.texelSizeY);
    gl.uniform1i(gl.getUniformLocation(progAdvection.program, 'uVelocity'), velocity.read.attach(0));
    gl.uniform1i(gl.getUniformLocation(progAdvection.program, 'uSource'), density.read.attach(1));
    gl.uniform1f(gl.getUniformLocation(progAdvection.program, 'dissipation'), config.DENSITY_DISSIPATION);
    blit(density.write);
    density.swap();

    // 8. Render to screen with bloom & transparency
    progDisplay.bind();
    gl.uniform1i(gl.getUniformLocation(progDisplay.program, 'uTexture'), density.read.attach(0));
    blit(null);

    requestAnimationFrame(update);
  }

  initialBurst();
  requestAnimationFrame(update);
})();
