import React, { useEffect, useRef } from 'react'
import { useTheme } from '../contexts/ThemeContext'

function FuturisticBackground() {
  const canvasRef = useRef(null)
  const { isDark } = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animationId

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Particle system
    const particles = []
    const particleCount = 50

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.vx = (Math.random() - 0.5) * 0.5
        this.vy = (Math.random() - 0.5) * 0.5
        this.size = Math.random() * 2 + 1
        this.opacity = Math.random() * 0.5 + 0.2
        this.pulse = Math.random() * Math.PI * 2
      }

      update() {
        this.x += this.vx
        this.y += this.vy
        this.pulse += 0.02

        // Wrap around edges
        if (this.x < 0) this.x = canvas.width
        if (this.x > canvas.width) this.x = 0
        if (this.y < 0) this.y = canvas.height
        if (this.y > canvas.height) this.y = 0

        // Pulse opacity
        this.opacity = 0.2 + Math.sin(this.pulse) * 0.3
      }

      draw() {
        ctx.save()
        ctx.globalAlpha = this.opacity
        const color = isDark ? '#60a5fa' : '#3b82f6'
        ctx.fillStyle = color
        ctx.shadowColor = color
        ctx.shadowBlur = 10
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }
    }

    // Grid system
    class Grid {
      constructor() {
        this.spacing = 60
        this.opacity = 0.1
        this.pulse = 0
      }

      update() {
        this.pulse += 0.01
        this.opacity = 0.05 + Math.sin(this.pulse) * 0.05
      }

      draw() {
        ctx.save()
        const gridColor = isDark ? '#818cf8' : '#6366f1'
        ctx.strokeStyle = gridColor
        ctx.globalAlpha = this.opacity
        ctx.lineWidth = 1

        // Vertical lines
        for (let x = 0; x <= canvas.width; x += this.spacing) {
          ctx.beginPath()
          ctx.moveTo(x, 0)
          ctx.lineTo(x, canvas.height)
          ctx.stroke()
        }

        // Horizontal lines
        for (let y = 0; y <= canvas.height; y += this.spacing) {
          ctx.beginPath()
          ctx.moveTo(0, y)
          ctx.lineTo(canvas.width, y)
          ctx.stroke()
        }
        ctx.restore()
      }
    }

    // Connection lines
    class ConnectionLines {
      draw() {
        ctx.save()
        const lineColor = isDark ? '#60a5fa' : '#3b82f6'
        ctx.strokeStyle = lineColor
        ctx.globalAlpha = 0.1
        ctx.lineWidth = 1

        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x
            const dy = particles[i].y - particles[j].y
            const distance = Math.sqrt(dx * dx + dy * dy)

            if (distance < 100) {
              ctx.globalAlpha = (100 - distance) / 100 * 0.1
              ctx.beginPath()
              ctx.moveTo(particles[i].x, particles[i].y)
              ctx.lineTo(particles[j].x, particles[j].y)
              ctx.stroke()
            }
          }
        }
        ctx.restore()
      }
    }

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle())
    }

    const grid = new Grid()
    const connections = new ConnectionLines()

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw grid
      grid.update()
      grid.draw()

      // Draw connections
      connections.draw()

      // Update and draw particles
      particles.forEach(particle => {
        particle.update()
        particle.draw()
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationId)
    }
  }, [isDark])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        background: isDark 
          ? 'radial-gradient(ellipse at center, rgba(96, 165, 250, 0.05) 0%, rgba(129, 140, 248, 0.02) 50%, transparent 100%)'
          : 'radial-gradient(ellipse at center, rgba(59, 130, 246, 0.05) 0%, rgba(99, 102, 241, 0.02) 50%, transparent 100%)'
      }}
    />
  )
}

export default FuturisticBackground
