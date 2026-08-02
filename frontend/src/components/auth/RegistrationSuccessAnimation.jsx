import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart } from 'lucide-react';

export const RegistrationSuccessAnimation = ({ onComplete }) => {
  const [stage, setStage] = useState(1); // Stage 1: 0-2s (Eco theme), Stage 2: 2-5s (Fireworks & Welcome)
  const canvasRef = useRef(null);

  // Set up 5-second timer & stage transition at 2 seconds
  useEffect(() => {
    // Transition to Stage 2 (Fireworks & Welcome message) at 2.0s
    const stageTimer = setTimeout(() => {
      setStage(2);
    }, 2000);

    // Complete animation and trigger navigation at 5.0s
    const completeTimer = setTimeout(() => {
      if (onComplete) {
        onComplete();
      }
    }, 5000);

    return () => {
      clearTimeout(stageTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  // Cinematic Fireworks Engine (Stage 2: Green, Gold & White)
  useEffect(() => {
    if (stage < 2) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const particles = [];
    const fireworks = [];

    // Colors: Emerald Green, Vibrant Gold, Pure White
    const colors = [
      '#4ADE80', '#22C55E', '#10B981', '#86EFAC', '#A7F3D0', // Greens
      '#FBBF24', '#F59E0B', '#FFD700', '#FEF08A', '#FDE047', // Golds
      '#FFFFFF', '#F8FAFC', '#E2E8F0'                      // Whites
    ];

    class Firework {
      constructor(targetX, targetY) {
        this.x = Math.random() * canvas.width * 0.8 + canvas.width * 0.1;
        this.y = canvas.height;
        this.targetX = targetX || Math.random() * canvas.width * 0.8 + canvas.width * 0.1;
        this.targetY = targetY || Math.random() * (canvas.height * 0.45) + canvas.height * 0.1;
        this.speed = 12 + Math.random() * 6;
        this.angle = Math.atan2(this.targetY - this.y, this.targetX - this.x);
        this.vx = Math.cos(this.angle) * this.speed;
        this.vy = Math.sin(this.angle) * this.speed;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.trail = [];
        this.exploded = false;
      }

      update() {
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 5) this.trail.shift();

        this.x += this.vx;
        this.y += this.vy;

        // Check if rocket reached destination
        const dist = Math.hypot(this.targetX - this.x, this.targetY - this.y);
        if (dist < 15 || this.vy >= 0) {
          this.exploded = true;
          this.explode();
        }
      }

      explode() {
        const particleCount = 60 + Math.floor(Math.random() * 40);
        for (let i = 0; i < particleCount; i++) {
          const angle = (Math.PI * 2 * i) / particleCount + (Math.random() * 0.2 - 0.1);
          const speed = 2 + Math.random() * 7;
          particles.push(new Particle(this.x, this.y, angle, speed, this.color));
        }
      }

      draw() {
        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2.5;
        if (this.trail.length > 0) {
          ctx.moveTo(this.trail[0].x, this.trail[0].y);
          for (let p of this.trail) {
            ctx.lineTo(p.x, p.y);
          }
        }
        ctx.stroke();
      }
    }

    class Particle {
      constructor(x, y, angle, speed, color) {
        this.x = x;
        this.y = y;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.friction = 0.96;
        this.gravity = 0.12;
        this.color = color;
        this.alpha = 1;
        this.decay = 0.012 + Math.random() * 0.015;
        this.size = 2 + Math.random() * 2.5;
        this.sparkle = Math.random() > 0.4;
      }

      update() {
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.decay;
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.fillStyle = this.color;

        if (this.sparkle && Math.random() > 0.3) {
          ctx.shadowBlur = 12;
          ctx.shadowColor = this.color;
        }

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // Launch fireworks periodically
    let lastLaunch = 0;
    const render = (time) => {
      // Clear with trailing translucent background for light trail effect
      ctx.fillStyle = 'rgba(4, 18, 12, 0.25)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (time - lastLaunch > 220) {
        fireworks.push(new Firework());
        // Occasionally launch a double burst
        if (Math.random() > 0.5) {
          setTimeout(() => fireworks.push(new Firework()), 100);
        }
        lastLaunch = time;
      }

      // Update & draw fireworks rockets
      for (let i = fireworks.length - 1; i >= 0; i--) {
        fireworks[i].update();
        if (!fireworks[i].exploded) {
          fireworks[i].draw();
        } else {
          fireworks.splice(i, 1);
        }
      }

      // Update & draw explosion particles
      for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw();
        if (particles[i].alpha <= 0) {
          particles.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [stage]);

  const content = (
    <div className="fixed inset-0 z-[99999] bg-[#04120c] overflow-hidden font-poppins flex items-center justify-center select-none">
      {/* 1. Eco-themed Ambient Background Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#062419] via-[#0b3826] to-[#03130d] z-0" />
      
      {/* Soft Glow Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-emerald-500/15 rounded-full blur-[130px] pointer-events-none z-0 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-green-400/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-400/5 rounded-full blur-[160px] pointer-events-none z-0" />

      {/* Soft Ambient Smoke / Fog Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent opacity-60 z-0 pointer-events-none mix-blend-screen" />

      {/* 2. Floating Leaves & Glowing Sparkles (0–5 seconds) */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {[...Array(18)].map((_, i) => {
          const size = 16 + (i % 5) * 6;
          const initialX = (i * 5.8) % 100;
          const duration = 4 + (i % 4) * 1.5;
          const delay = (i % 6) * 0.3;

          return (
            <motion.div
              key={`leaf-${i}`}
              initial={{ y: -60, x: `${initialX}vw`, rotate: 0, opacity: 0 }}
              animate={{
                y: '110vh',
                x: [`${initialX}vw`, `${initialX + (i % 2 === 0 ? 8 : -8)}vw`, `${initialX}vw`],
                rotate: [0, 180, 360],
                opacity: [0, 0.85, 0.85, 0],
              }}
              transition={{
                duration: duration,
                repeat: Infinity,
                delay: delay,
                ease: 'linear',
              }}
              className="absolute text-emerald-400/70"
            >
              <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
                <path d="M17,8C8,10 59,16.17 3.82,21.34L5.23,22.75C10.4,17.58 16.58,15 18.58,6C18.58,6 22,2 22,2C22,2 18,5.42 17,8Z" />
              </svg>
            </motion.div>
          );
        })}

        {/* Ambient Sparkles */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={`sparkle-${i}`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1.2, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.4,
              ease: 'easeInOut',
            }}
            className="absolute text-amber-300/80"
            style={{
              top: `${15 + (i * 7) % 70}%`,
              left: `${10 + (i * 8) % 80}%`,
            }}
          >
            <Sparkles className="w-5 h-5" />
          </motion.div>
        ))}
      </div>

      {/* 3. Fireworks Canvas (Stage 2: 2–5 seconds - Remains BEHIND content at z-10) */}
      {stage >= 2 && (
        <canvas
          ref={canvasRef}
          className="fixed inset-0 pointer-events-none z-10"
        />
      )}

      {/* 4. Premium Glassmorphism Main Card (z-20 foreground content) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-20 max-w-xl w-full mx-4 p-8 md:p-12 rounded-3xl bg-emerald-950/45 backdrop-blur-2xl border border-emerald-400/30 shadow-[0_0_90px_rgba(16,185,129,0.25)] text-center text-white overflow-hidden flex flex-col items-center border-t-emerald-300/40"
      >
        {/* Subtle Card Background Highlight */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        {/* Floating Plant / Seed Ball Icon Badge */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
          className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-green-600/20 border border-emerald-400/40 flex items-center justify-center mb-6 shadow-lg shadow-emerald-900/40 relative z-10"
        >
          <span className="text-4xl drop-shadow-md">🌱</span>
        </motion.div>

        {/* Large Title: 🌱 100 Seed Balls Planted! */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-3xl md:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-emerald-100 to-amber-200 mb-6 drop-shadow-sm font-poppins"
        >
          🌱 100 Seed Balls Planted!
        </motion.h1>

        {/* Emotional Quote */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="relative px-4 py-4 md:px-6 md:py-5 rounded-2xl bg-white/5 border border-white/10 max-w-lg mb-6 backdrop-blur-sm"
        >
          <p className="text-emerald-100/90 text-sm md:text-base font-medium leading-relaxed italic">
            "You came here to join Cocoveera...<br />
            But today, you've also become part of nature's story.<br />
            100 seed balls have been planted because of you. 💚"
          </p>
        </motion.div>

        {/* Stage 2 (2–5 seconds): Welcome Banner & Celebration */}
        <AnimatePresence>
          {stage >= 2 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 220, damping: 18 }}
              className="mt-2 flex flex-col items-center"
            >
              <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-emerald-500/30 via-green-500/40 to-amber-500/30 border border-emerald-400/50 shadow-md shadow-emerald-950/50">
                <span className="text-xl">🎉</span>
                <span className="text-lg md:text-xl font-extrabold tracking-wide text-white drop-shadow-md">
                  Welcome to Cocoveera!
                </span>
                <span className="text-xl">🎉</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Smooth 5-Second Progress Bar */}
        <div className="w-full max-w-md h-1.5 bg-emerald-950/80 rounded-full mt-8 overflow-hidden border border-emerald-500/20 relative z-10">
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 5.0, ease: 'linear' }}
            className="h-full bg-gradient-to-r from-emerald-400 via-green-300 to-amber-300 shadow-[0_0_12px_rgba(52,211,153,0.8)]"
          />
        </div>
      </motion.div>
    </div>
  );

  return ReactDOM.createPortal(content, document.body);
};

export default RegistrationSuccessAnimation;
