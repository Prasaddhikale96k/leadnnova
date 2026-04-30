'use client'
import { useRef, useEffect } from 'react'

const vertexShaderSource = `
  attribute vec2 a_position;
  varying vec2 v_uv;
  void main() {
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`

const fragmentShaderSource = `
  precision highp float;
  varying vec2 v_uv;
  uniform float u_time;
  uniform float u_scrollProgress;
  uniform vec2 u_mouse;
  uniform vec2 u_resolution;
  uniform float u_brightness;
  uniform float u_warpIntensity;

  vec3 cyan = vec3(0.0, 1.0, 1.0);
  vec3 purple = vec3(0.5, 0.0, 1.0);
  vec3 white = vec3(1.0);

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = rot * p * 2.0 + shift;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = v_uv;
    vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
    vec2 p = (uv - 0.5) * aspect;

    float scroll = u_scrollProgress;
    float warp = u_warpIntensity;

    vec2 mouseInfluence = (u_mouse - 0.5) * 0.3;
    float mouseDist = length((uv - u_mouse) * aspect);
    float mouseDip = smoothstep(0.4, 0.0, mouseDist) * 0.15 * warp;

    float n1 = fbm(p * 2.0 + u_time * 0.1 + mouseInfluence) * warp;
    float n2 = fbm(p * 3.0 - u_time * 0.08 + vec2(5.2, 1.3)) * warp * 0.5;
    float n3 = fbm(p * 1.5 + scroll * 2.0 + u_time * 0.05) * warp * 0.3;

    vec2 warped = p + vec2(n1, n2) + mouseDip;

    float gridX = abs(fract(warped.x * 12.0) - 0.5);
    float gridY = abs(fract(warped.y * 12.0 + scroll * 0.5) - 0.5);

    float lineX = smoothstep(0.02, 0.0, gridX);
    float lineY = smoothstep(0.02, 0.0, gridY);
    float grid = max(lineX, lineY);

    float glowX = smoothstep(0.06, 0.0, gridX) * 0.3;
    float glowY = smoothstep(0.06, 0.0, gridY) * 0.3;
    float glow = max(glowX, glowY);

    float gridFade = smoothstep(1.2, 0.2, length(p)) * smoothstep(0.0, 0.3, length(p));

    float colorMix = fbm(p * 1.5 + u_time * 0.05 + scroll) ;
    vec3 gridColor = mix(cyan, purple, colorMix);

    float nodeSize = 0.03 + mouseDip * 0.5;
    vec2 gridCell = floor(warped * 12.0);
    vec2 cellCenter = (gridCell + 0.5) / 12.0 / aspect;
    cellCenter.y -= scroll * 0.5 / 12.0;
    float nodeDist = length((uv - 0.5 - (cellCenter - 0.5 * aspect)) * aspect);
    float node = smoothstep(nodeSize, 0.0, nodeDist);

    float nodePulse = sin(u_time * 2.0 + hash(gridCell) * 6.28) * 0.5 + 0.5;
    node *= nodePulse;

    float nodeGlow = smoothstep(nodeSize * 4.0, 0.0, nodeDist) * 0.15 * nodePulse;

    float scanline = sin(warped.y * 80.0 + u_time * 1.5) * 0.02;

    float finalGrid = grid + glow + scanline;
    finalGrid *= gridFade;
    finalGrid *= u_brightness;

    vec3 finalColor = gridColor * finalGrid;
    finalColor += white * node * u_brightness * 0.8;
    finalColor += gridColor * nodeGlow * u_brightness;

    float vignette = 1.0 - smoothstep(0.3, 1.4, length(p * 1.2));
    finalColor *= vignette;

    float depthFade = 0.15 + scroll * 0.85;
    finalColor *= depthFade;

    gl_FragColor = vec4(finalColor, 1.0);
  }
`

export default function NeuralMeshBackground({ brightness = 0.1, warpIntensity = 0.6 }) {
  const canvasRef = useRef(null)
  const glRef = useRef(null)
  const uniformsRef = useRef(null)
  const animFrameRef = useRef(null)
  const mouseRef = useRef({ x: 0.5, y: 0.5 })
  const scrollRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl', { alpha: false, antialias: false, preserveDrawingBuffer: false })
    if (!gl) return
    glRef.current = gl

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2)
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resize()
    window.addEventListener('resize', resize)

    const vs = gl.createShader(gl.VERTEX_SHADER)
    gl.shaderSource(vs, vertexShaderSource)
    gl.compileShader(vs)

    const fs = gl.createShader(gl.FRAGMENT_SHADER)
    gl.shaderSource(fs, fragmentShaderSource)
    gl.compileShader(fs)

    const program = gl.createProgram()
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    gl.useProgram(program)

    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1])
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)

    const aPos = gl.getAttribLocation(program, 'a_position')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    const uniforms = {
      u_time: gl.getUniformLocation(program, 'u_time'),
      u_scrollProgress: gl.getUniformLocation(program, 'u_scrollProgress'),
      u_mouse: gl.getUniformLocation(program, 'u_mouse'),
      u_resolution: gl.getUniformLocation(program, 'u_resolution'),
      u_brightness: gl.getUniformLocation(program, 'u_brightness'),
      u_warpIntensity: gl.getUniformLocation(program, 'u_warpIntensity'),
    }
    uniformsRef.current = uniforms

    const handleMouseMove = (e) => {
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: 1.0 - e.clientY / window.innerHeight,
      }
    }
    window.addEventListener('mousemove', handleMouseMove)

    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      scrollRef.current = maxScroll > 0 ? window.scrollY / maxScroll : 0
    }
    window.addEventListener('scroll', handleScroll, { passive: true })

    const startTime = performance.now()
    const render = () => {
      if (!gl || !uniformsRef.current) return
      const u = uniformsRef.current
      const elapsed = (performance.now() - startTime) / 1000

      gl.uniform1f(u.u_time, elapsed)
      gl.uniform1f(u.u_scrollProgress, scrollRef.current)
      gl.uniform2f(u.u_mouse, mouseRef.current.x, mouseRef.current.y)
      gl.uniform2f(u.u_resolution, canvas.width, canvas.height)
      gl.uniform1f(u.u_brightness, brightness)
      gl.uniform1f(u.u_warpIntensity, warpIntensity)

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      animFrameRef.current = requestAnimationFrame(render)
    }
    render()

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('scroll', handleScroll)
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [brightness, warpIntensity])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none select-none"
      style={{ zIndex: -200, width: '100vw', height: '100vh' }}
    />
  )
}
