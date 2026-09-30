import { useEffect, useRef } from 'react';

const CONFETTI_COLORS = [
  '#279cc9', // Fodd Blue
  '#ffdc52', // Egg Yolk Yellow
  '#b8fb3c', // Lime Green
  '#ff6b6b', // Coral
  '#8b5cf6', // Purple
  '#38bdf8', // Sky Blue
  '#ffffff', // Crisp White
  '#fbbf24', // Amber
];

export default function Confetti({ active = false, onComplete }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particleCount = Math.min(240, Math.max(140, Math.floor(window.innerWidth / 6)));
    const particles = [];

    // Dual-cannon side bursts from left and right edges
    for (let i = 0; i < particleCount; i++) {
      const fromLeft = i % 2 === 0;

      // Positioned right at the left and right margins of the viewport
      const originX = fromLeft
        ? Math.random() * 25
        : width - Math.random() * 25;

      // Staggered along the lower-middle sides (50% - 85% of screen height)
      const originY = height * 0.65 + (Math.random() - 0.5) * (height * 0.3);

      // Left cannon fires up-right (approx 35° to 75° above horizontal)
      // Right cannon fires up-left (approx 105° to 145° above horizontal)
      const angle = fromLeft
        ? -Math.PI * (0.20 + Math.random() * 0.28)
        : -Math.PI * (0.52 + Math.random() * 0.28);

      const speed = 16 + Math.random() * 24;

      particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed + (fromLeft ? Math.random() * 3 : -Math.random() * 3),
        vy: Math.sin(angle) * speed - Math.random() * 3,
        size: 7 + Math.random() * 8,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 14,
        wobble: Math.random() * 10,
        wobbleSpeed: 0.12 + Math.random() * 0.1,
        gravity: 0.32 + Math.random() * 0.12,
        drag: 0.962 + Math.random() * 0.016,
        opacity: 1,
        shape: Math.random() > 0.25 ? 'rect' : 'circle',
      });
    }

    let startTime = Date.now();
    const duration = 3500; // 3.5 seconds

    const render = () => {
      const elapsed = Date.now() - startTime;
      ctx.clearRect(0, 0, width, height);

      let aliveParticles = 0;

      for (let p of particles) {
        p.vx *= p.drag;
        p.vy = p.vy * p.drag + p.gravity;
        p.x += p.vx;
        p.y += p.vy;

        p.rotation += p.rotationSpeed;
        p.wobble += p.wobbleSpeed;

        if (elapsed > 2000) {
          p.opacity = Math.max(0, 1 - (elapsed - 2000) / 1500);
        }

        if (p.opacity > 0 && p.y < height + 50) {
          aliveParticles++;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.scale(Math.sin(p.wobble), 1);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.opacity;

          if (p.shape === 'rect') {
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
          } else {
            ctx.beginPath();
            ctx.arc(0, 0, p.size * 0.4, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.restore();
        }
      }

      if (aliveParticles > 0 && elapsed < duration) {
        animationFrameId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, width, height);
        if (onComplete) onComplete();
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [active, onComplete]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        pointerEvents: 'none',
        width: '100vw',
        height: '100vh',
      }}
    />
  );
}
