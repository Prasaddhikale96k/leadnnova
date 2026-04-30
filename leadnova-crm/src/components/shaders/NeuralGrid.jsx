'use client'
import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const vertexShader = `
  uniform float u_time;
  uniform vec2 u_mouse;
  uniform float u_scroll;
  uniform float u_sending;
  varying vec2 vUv;
  varying float vElevation;

  void main() {
    vUv = uv;
    vec3 newPosition = position;

    float sendPulse = u_sending * sin(u_time * 3.0) * 0.5;
    float wave1 = sin(position.x * 1.2 + u_time * 0.4 + u_scroll * 12.0) * 0.4;
    float wave2 = cos(position.y * 0.8 + u_time * 0.6) * 0.2;
    float wave3 = sin((position.x + position.y) * 0.6 + u_time * 0.3 + u_scroll * 8.0) * 0.15;
    float wave = wave1 + wave2 + wave3 + sendPulse;

    vec2 toMouse = u_mouse - position.xy;
    float dist = length(toMouse);
    float influence = smoothstep(2.0, 0.0, dist);
    wave += influence * sin(dist * 4.0 - u_time * 2.0) * 0.3;

    float ripple = sin(u_scroll * 20.0 + position.x * 3.0 + position.y * 2.0) * 0.2 * u_scroll;
    wave += ripple;

    newPosition.z += wave;
    vElevation = wave;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`

const fragmentShader = `
  uniform float u_time;
  uniform float u_scroll;
  uniform float u_sending;
  uniform vec3 u_colorCyan;
  uniform vec3 u_colorPurple;
  varying vec2 vUv;
  varying float vElevation;

  void main() {
    float gridLine = 0.0;
    float lineWidth = 0.015;

    float gridX = step(1.0 - lineWidth, fract(vUv.x * 50.0));
    float gridY = step(1.0 - lineWidth, fract(vUv.y * 50.0));
    gridLine = max(gridX, gridY);

    float pulse = sin(u_time * 0.8 + vUv.x * 6.28 + vUv.y * 6.28) * 0.5 + 0.5;
    float scrollWave = sin(u_scroll * 15.0 + vUv.y * 10.0) * 0.5 + 0.5;
    float sendPulse = u_sending * (sin(u_time * 4.0 + vUv.x * 12.0 + vUv.y * 12.0) * 0.5 + 0.5) * 0.4;

    vec3 color = mix(u_colorCyan, u_colorPurple, vUv.y + sin(u_time * 0.3) * 0.2);
    color = mix(color, vec3(1.0), smoothstep(0.1, 0.6, vElevation) * 0.5);

    float baseAlpha = gridLine * (0.12 + pulse * 0.06 + scrollWave * 0.08 + sendPulse);
    float elevationGlow = smoothstep(0.0, 0.5, abs(vElevation)) * 0.25;
    float alpha = baseAlpha + elevationGlow * gridLine;

    float vignette = smoothstep(0.0, 0.25, vUv.x) * smoothstep(1.0, 0.75, vUv.x);
    vignette *= smoothstep(0.0, 0.25, vUv.y) * smoothstep(1.0, 0.75, vUv.y);
    alpha *= vignette;

    gl_FragColor = vec4(color, alpha);
  }
`

export default function NeuralGrid({ mousePos, scrollProgress, isSending = false }) {
  const meshRef = useRef(null)

  const uniforms = useMemo(() => ({
    u_time: { value: 0 },
    u_mouse: { value: new THREE.Vector2(0, 0) },
    u_scroll: { value: 0 },
    u_sending: { value: 0 },
    u_colorCyan: { value: new THREE.Color('#FFFFFF') },
    u_colorPurple: { value: new THREE.Color('#808080') },
  }), [])

  useFrame((state) => {
    if (!meshRef.current) return
    const { clock } = state
    meshRef.current.material.uniforms.u_time.value = clock.getElapsedTime()
    meshRef.current.material.uniforms.u_mouse.value.lerp(
      new THREE.Vector2(mousePos.x * 2 - 1, -(mousePos.y * 2 - 1)), 0.05
    )
    meshRef.current.material.uniforms.u_scroll.value = scrollProgress
    meshRef.current.material.uniforms.u_sending.value = isSending ? 1 : 0
  })

  useEffect(() => {
    if (!meshRef.current) return
    meshRef.current.material.uniforms.u_mouse.value.set(0, 0)
  }, [])

  return (
    <mesh ref={meshRef} position={[0, 0, -2]} rotation={[-0.3, 0, 0]}>
      <planeGeometry args={[10, 10, 60, 60]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}
