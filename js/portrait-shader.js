/**
 * ADRIAN SETH TABOTABO — WEBGL LIQUID PORTRAIT SHADER
 * Interactive liquid silk ripple, chromatic aberration split, and click shockwave displacement.
 */

(function () {
  'use strict';

  const canvas = document.getElementById('portraitCanvas');
  const fallbackImg = document.getElementById('portraitFallbackImg');
  if (!canvas) return;

  const gl = canvas.getContext('webgl', { alpha: true, antialias: true }) ||
             canvas.getContext('experimental-webgl', { alpha: true, antialias: true });

  if (!gl) {
    if (fallbackImg) fallbackImg.style.display = 'block';
    return;
  }

  // Set sizing
  function updateCanvasSize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round((rect.width > 0 ? rect.width : 190) * dpr);
    const h = Math.round((rect.height > 0 ? rect.height : 190) * dpr);
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  updateCanvasSize();
  window.addEventListener('resize', updateCanvasSize);
  window.addEventListener('portfolioLoaded', updateCanvasSize);

  // Shaders
  const vsSource = `
    attribute vec2 aPosition;
    varying vec2 vUv;
    void main() {
      vUv = aPosition * 0.5 + 0.5;
      vUv.y = 1.0 - vUv.y; // Correct texture flip
      gl_Position = vec4(aPosition, 0.0, 1.0);
    }
  `;

  const fsSource = `
    precision highp float;
    varying vec2 vUv;
    uniform sampler2D uTexture;
    uniform vec2 uMouse;
    uniform float uHover;
    uniform float uTime;
    uniform vec2 uShockwaveCenter;
    uniform float uShockwaveTime;
    uniform float uShockwaveParams; // Intensity

    void main() {
      vec2 uv = vUv;

      // 1. Mouse Liquid Ripple Displacement
      vec2 mouseDist = uv - uMouse;
      float d = length(mouseDist);
      float ripple = sin(d * 24.0 - uTime * 3.5) * exp(-d * 4.5) * uHover * 0.025;
      vec2 rippleOffset = normalize(mouseDist + 0.0001) * ripple;

      // 2. Click Shockwave Ring Displacement
      if (uShockwaveTime > 0.0) {
        float waveDist = length(uv - uShockwaveCenter);
        float waveRadius = uShockwaveTime * 0.85;
        float diff = abs(waveDist - waveRadius);
        if (diff < 0.12) {
          float diffPow = (0.12 - diff) / 0.12;
          float shockDisplace = sin(diff * 35.0) * diffPow * (1.0 - uShockwaveTime) * 0.045;
          rippleOffset += normalize(uv - uShockwaveCenter + 0.0001) * shockDisplace;
        }
      }

      vec2 distortedUv = uv + rippleOffset;

      // 3. Chromatic Aberration RGB Split
      float aberration = (length(rippleOffset) * 1.8 + uHover * 0.006);
      vec4 rCol = texture2D(uTexture, distortedUv + vec2(aberration, 0.0));
      vec4 gCol = texture2D(uTexture, distortedUv);
      vec4 bCol = texture2D(uTexture, distortedUv - vec2(aberration, 0.0));

      vec4 finalColor = vec4(rCol.r, gCol.g, bCol.b, gCol.a);

      // 4. Subtle Specular Highlight across ripples
      float specular = max(0.0, ripple * 3.5);
      finalColor.rgb += vec3(specular * 0.45, specular * 0.25, specular * 0.35);

      gl_FragColor = finalColor;
    }
  `;

  function compileShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
  }

  const program = gl.createProgram();
  gl.attachShader(program, compileShader(gl.VERTEX_SHADER, vsSource));
  gl.attachShader(program, compileShader(gl.FRAGMENT_SHADER, fsSource));
  gl.linkProgram(program);
  gl.useProgram(program);

  // Quad Geometry
  const quadBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);

  const aPosition = gl.getAttribLocation(program, 'aPosition');
  gl.enableVertexAttribArray(aPosition);
  gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

  // Uniforms
  const uTexture = gl.getUniformLocation(program, 'uTexture');
  const uMouse = gl.getUniformLocation(program, 'uMouse');
  const uHover = gl.getUniformLocation(program, 'uHover');
  const uTime = gl.getUniformLocation(program, 'uTime');
  const uShockwaveCenter = gl.getUniformLocation(program, 'uShockwaveCenter');
  const uShockwaveTime = gl.getUniformLocation(program, 'uShockwaveTime');

  // Load Texture
  const texture = gl.createTexture();
  const image = new Image();
  image.src = 'assets/profile.png';
  let isTextureLoaded = false;

  function initTexture() {
    if (isTextureLoaded) return;
    isTextureLoaded = true;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    // Hide static fallback once loaded
    if (fallbackImg) fallbackImg.style.display = 'none';
    requestAnimationFrame(render);
  }

  image.onload = initTexture;
  if (image.complete && image.naturalWidth !== 0) {
    initTexture();
  }
  image.onerror = () => {
    if (fallbackImg) fallbackImg.style.display = 'block';
  };

  // State
  let targetHover = 0;
  let currentHover = 0;
  const mousePos = { x: 0.5, y: 0.5 };
  const targetMouse = { x: 0.5, y: 0.5 };
  let shockwaveTime = -1;
  const shockwaveCenter = { x: 0.5, y: 0.5 };

  const interactTarget = canvas.parentElement || canvas;

  interactTarget.addEventListener('mouseenter', () => {
    targetHover = 1.0;
  });

  interactTarget.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      targetMouse.x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      targetMouse.y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    }
  });

  interactTarget.addEventListener('mouseleave', () => {
    targetHover = 0.0;
  });

  interactTarget.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      shockwaveCenter.x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      shockwaveCenter.y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
      shockwaveTime = 0.001;
    }

    // Trigger procedural audio pop if sound enabled
    if (window.playHarmonicChime) {
      window.playHarmonicChime(5, 0.15);
    }
  });

  // Render Loop
  let startTime = performance.now();

  function render(time) {
    const elapsed = (time - startTime) * 0.001;

    // Lerp hover & mouse
    currentHover += (targetHover - currentHover) * 0.1;
    mousePos.x += (targetMouse.x - mousePos.x) * 0.15;
    mousePos.y += (targetMouse.y - mousePos.y) * 0.15;

    // Progress shockwave
    if (shockwaveTime >= 0.0) {
      shockwaveTime += 0.024;
      if (shockwaveTime > 1.0) shockwaveTime = -1.0;
    }

    gl.useProgram(program);
    gl.uniform1i(uTexture, 0);
    gl.uniform2f(uMouse, mousePos.x, mousePos.y);
    gl.uniform1f(uHover, currentHover);
    gl.uniform1f(uTime, elapsed);
    gl.uniform2f(uShockwaveCenter, shockwaveCenter.x, shockwaveCenter.y);
    gl.uniform1f(uShockwaveTime, shockwaveTime);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    requestAnimationFrame(render);
  }

})();
