// shader-background.jsx — WebGL plasma/sound-wave fondo para el hero.
// Adaptado a React vanilla (UMD) para este proyecto, NO usa imports.
// Expone window.ShaderBackground.

(function () {
  const { useEffect, useRef } = React;

  const VS = `
    attribute vec4 aVertexPosition;
    void main() { gl_Position = aVertexPosition; }
  `;

  // Fragment shader. Acepta uniforms para color de líneas y de fondo
  // así el hero puede sincronizarlo con el accent de la banda.
  const FS = `
    precision highp float;
    uniform vec2  iResolution;
    uniform float iTime;
    uniform vec3  uLineColor;
    uniform vec3  uBgColorA;
    uniform vec3  uBgColorB;
    uniform float uIntensity;

    const float overallSpeed = 0.2;
    const float gridSmoothWidth = 0.015;
    const float minLineWidth = 0.01;
    const float maxLineWidth = 0.2;
    const float lineSpeed = 1.0 * overallSpeed;
    const float lineAmplitude = 1.0;
    const float lineFrequency = 0.2;
    const float warpSpeed = 0.2 * overallSpeed;
    const float warpFrequency = 0.5;
    const float warpAmplitude = 1.0;
    const float offsetFrequency = 0.5;
    const float offsetSpeed = 1.33 * overallSpeed;
    const float minOffsetSpread = 0.6;
    const float maxOffsetSpread = 2.0;
    const int   linesPerGroup = 16;
    const float scale = 5.0;

    #define drawCircle(pos, radius, coord) smoothstep(radius + gridSmoothWidth, radius, length(coord - (pos)))
    #define drawSmoothLine(pos, halfWidth, t) smoothstep(halfWidth, 0.0, abs(pos - (t)))
    #define drawCrispLine(pos, halfWidth, t) smoothstep(halfWidth + gridSmoothWidth, halfWidth, abs(pos - (t)))

    float random(float t) {
      return (cos(t) + cos(t * 1.3 + 1.3) + cos(t * 1.4 + 1.4)) / 3.0;
    }
    float getPlasmaY(float x, float horizontalFade, float offset) {
      return random(x * lineFrequency + iTime * lineSpeed) * horizontalFade * lineAmplitude + offset;
    }

    void main() {
      vec2 fragCoord = gl_FragCoord.xy;
      vec2 uv = fragCoord.xy / iResolution.xy;
      vec2 space = (fragCoord - iResolution.xy / 2.0) / iResolution.x * 2.0 * scale;

      float horizontalFade = 1.0 - (cos(uv.x * 6.28) * 0.5 + 0.5);
      float verticalFade   = 1.0 - (cos(uv.y * 6.28) * 0.5 + 0.5);

      space.y += random(space.x * warpFrequency + iTime * warpSpeed) * warpAmplitude * (0.5 + horizontalFade);
      space.x += random(space.y * warpFrequency + iTime * warpSpeed + 2.0) * warpAmplitude * horizontalFade;

      vec3 lines = vec3(0.0);

      for (int l = 0; l < linesPerGroup; l++) {
        float normalizedLineIndex = float(l) / float(linesPerGroup);
        float offsetTime = iTime * offsetSpeed;
        float offsetPosition = float(l) + space.x * offsetFrequency;
        float rand = random(offsetPosition + offsetTime) * 0.5 + 0.5;
        float halfWidth = mix(minLineWidth, maxLineWidth, rand * horizontalFade) / 2.0;
        float offset = random(offsetPosition + offsetTime * (1.0 + normalizedLineIndex)) * mix(minOffsetSpread, maxOffsetSpread, horizontalFade);
        float linePosition = getPlasmaY(space.x, horizontalFade, offset);
        float line = drawSmoothLine(linePosition, halfWidth, space.y) / 2.0
                   + drawCrispLine(linePosition, halfWidth * 0.15, space.y);

        float circleX = mod(float(l) + iTime * lineSpeed, 25.0) - 12.0;
        vec2 circlePosition = vec2(circleX, getPlasmaY(circleX, horizontalFade, offset));
        float circle = drawCircle(circlePosition, 0.01, space) * 4.0;

        line += circle;
        lines += line * uLineColor * rand;
      }

      vec3 bg = mix(uBgColorA, uBgColorB, uv.x) * verticalFade;
      vec3 col = bg + lines * uIntensity;
      gl_FragColor = vec4(col, 1.0);
    }
  `;

  function loadShader(gl, type, source) {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, source);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', gl.getShaderInfoLog(sh));
      gl.deleteShader(sh);
      return null;
    }
    return sh;
  }

  function initProgram(gl) {
    const vs = loadShader(gl, gl.VERTEX_SHADER, VS);
    const fs = loadShader(gl, gl.FRAGMENT_SHADER, FS);
    const p = gl.createProgram();
    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(p));
      return null;
    }
    return p;
  }

  // hex "#rrggbb" → [r,g,b] en 0..1
  function hexToRgb(hex) {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '');
    if (!m) return [1, 0.18, 0.18];
    return [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255];
  }

  function ShaderBackground({
    lineColor = '#ff2d2d',
    bgColorA = '#0a0010',
    bgColorB = '#1a0020',
    intensity = 1.0,
    opacity = 1.0,
  }) {
    const canvasRef = useRef(null);
    // refs para uniforms dinámicos sin re-crear el ciclo de render
    const uniformsRef = useRef({ lineColor, bgColorA, bgColorB, intensity });

    useEffect(() => {
      uniformsRef.current = { lineColor, bgColorA, bgColorB, intensity };
    }, [lineColor, bgColorA, bgColorB, intensity]);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const gl = canvas.getContext('webgl', { antialias: true, premultipliedAlpha: false });
      if (!gl) {
        console.warn('WebGL no soportado.');
        return;
      }

      const program = initProgram(gl);
      if (!program) return;

      const positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
        gl.STATIC_DRAW
      );

      const loc = {
        vertex: gl.getAttribLocation(program, 'aVertexPosition'),
        resolution: gl.getUniformLocation(program, 'iResolution'),
        time: gl.getUniformLocation(program, 'iTime'),
        lineColor: gl.getUniformLocation(program, 'uLineColor'),
        bgA: gl.getUniformLocation(program, 'uBgColorA'),
        bgB: gl.getUniformLocation(program, 'uBgColorB'),
        intensity: gl.getUniformLocation(program, 'uIntensity'),
      };

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const resize = () => {
        const w = Math.floor(window.innerWidth * dpr);
        const h = Math.floor(window.innerHeight * dpr);
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
        }
        gl.viewport(0, 0, canvas.width, canvas.height);
      };
      window.addEventListener('resize', resize);
      resize();

      let raf = 0;
      const start = Date.now();
      const render = () => {
        const t = (Date.now() - start) / 1000;
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(program);

        const u = uniformsRef.current;
        gl.uniform2f(loc.resolution, canvas.width, canvas.height);
        gl.uniform1f(loc.time, t);
        gl.uniform3fv(loc.lineColor, hexToRgb(u.lineColor));
        gl.uniform3fv(loc.bgA, hexToRgb(u.bgColorA));
        gl.uniform3fv(loc.bgB, hexToRgb(u.bgColorB));
        gl.uniform1f(loc.intensity, u.intensity);

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.vertexAttribPointer(loc.vertex, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(loc.vertex);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        raf = requestAnimationFrame(render);
      };
      raf = requestAnimationFrame(render);

      return () => {
        cancelAnimationFrame(raf);
        window.removeEventListener('resize', resize);
        gl.deleteBuffer(positionBuffer);
        gl.deleteProgram(program);
      };
    }, []);

    return (
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          opacity,
          pointerEvents: 'none',
          transition: 'opacity 0.8s ease',
        }}
      />
    );
  }

  window.ShaderBackground = ShaderBackground;
})();
