'use client'
import { useRef, useEffect, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import dynamic from 'next/dynamic'

const NeuralGrid = dynamic(() => import('./NeuralGrid'), { ssr: false })

function ClearBackground() {
  const { gl, scene } = useThree()
  useEffect(() => {
    gl.setClearColor(0x000000, 0)
    gl.setClearAlpha(0)
  }, [gl])
  return null
}

export default function NeuralGridWrapper({ isSending = false }) {
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 })
  const [scrollProgress, setScrollProgress] = useState(0)
  const containerRef = useRef(null)

  useEffect(() => {
    let ticking = false
    const handleMouseMove = (e) => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight })
        ticking = false
      })
    }

    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      setScrollProgress(maxScroll > 0 ? window.scrollY / maxScroll : 0)
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, premultipliedAlpha: false, antialias: true }}
        style={{ background: 'transparent' }}
      >
        <ClearBackground />
        <NeuralGrid mousePos={mousePos} scrollProgress={scrollProgress} isSending={isSending} />
      </Canvas>
    </div>
  )
}
