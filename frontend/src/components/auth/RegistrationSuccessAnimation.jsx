import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export const RegistrationSuccessAnimation = ({ onComplete }) => {
  const [modalActive, setModalActive] = useState(false);       // 0.0s: Modal fades in
  const [headingActive, setHeadingActive] = useState(false);   // 0.15s: Heading animates
  const [quoteActive, setQuoteActive] = useState(false);     // 0.3s: Quote fades in
  const [fireworksActive, setFireworksActive] = useState(false); // 0.2s: Fireworks/crackers launch continuously
  const [isExiting, setIsExiting] = useState(false);           // 2.6s - 3.0s: Modal & blur fade out

  const canvasRef = useRef(null);

  useEffect(() => {
    // Disable all user interactions while animation plays
    const originalPointerEvents = document.body.style.pointerEvents;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // 0.0s: Modal fades in
    setModalActive(true);

    // 0.15s: Heading animates
    const headingTimer = setTimeout(() => setHeadingActive(true), 150);

    // 0.3s: Quote fades in
    const quoteTimer = setTimeout(() => setQuoteActive(true), 300);

    // 0.2s: Explosive fireworks & crackers launch early and play throughout
    const fireworksTimer = setTimeout(() => setFireworksActive(true), 200);

    // 2.6s: Smooth fade out starts so it cleanly finishes at 3.0s
    const exitTimer = setTimeout(() => setIsExiting(true), 2600);

    // 3.0s: Complete animation & trigger immediate redirect to Dashboard
    const completeTimer = setTimeout(() => {
      document.body.style.overflow = originalOverflow;
      document.body.style.pointerEvents = originalPointerEvents;
      if (onComplete) {
        onComplete();
      }
    }, 3000);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.pointerEvents = originalPointerEvents;
      clearTimeout(headingTimer);
      clearTimeout(quoteTimer);
      clearTimeout(fireworksTimer);
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  // High-Density Fireworks & Crackers Engine
  useEffect(() => {
    if (!fireworksActive) return;

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

    // Vibrant celebration palette: Emeralds, Golds, Crimson, Cyan, Violet & Sparkle Whites
    const colors = [
      '#4ADE80', '#22C55E', '#10B981', '#86EFAC', // Emerald & Mint Green
      '#FBBF24', '#F59E0B', '#FFD700', '#FE0000', // Gold & Vibrant Red
      '#00F5D4', '#9D4EDD', '#FF6B6B', '#FF9F1C', // Neon Cyan, Violet, Coral, Orange
      '#FFFFFF', '#FEF9C3', '#E0F2FE'              // Brilliant White & Ice
    ];

    class Firework {
      constructor() {
        // Launch from across the bottom edge
        this.x = Math.random() * (canvas.width * 0.88) + canvas.width * 0.06;
        this.y = canvas.height;
        
        // Target launch altitude (upper & side regions for maximum coverage)
        this.targetX = this.x + (Math.random() * 160 - 80);
        this.targetY = Math.random() * (canvas.height * 0.45) + canvas.height * 0.08;
        
        this.speed = 16 + Math.random() * 6;
        this.angle = Math.atan2(this.targetY - this.y, this.targetX - this.x);
        this.vx = Math.cos(this.angle) * this.speed;
        this.vy = Math.sin(this.angle) * this.speed;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.trail = [];
        this.exploded = false;
      }

      update() {
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 6) this.trail.shift();

        this.x += this.vx;
        this.y += this.vy;

        const dist = Math.hypot(this.targetX - this.x, this.targetY - this.y);
        if (dist < 18 || this.vy >= 0) {
          this.exploded = true;
          this.explode();
        }
      }

      explode() {
        // Massive burst of 80-130 cracker particles per explosion
        const particleCount = 80 + Math.floor(Math.random() * 50);
        const secondaryColor = colors[Math.floor(Math.random() * colors.length)];
        
        for (let i = 0; i < particleCount; i++) {
          const angle = (Math.PI * 2 * i) / particleCount + (Math.random() * 0.3 - 0.15);
          const speed = 2.5 + Math.random() * 7.5;
          const pColor = i % 2 === 0 ? this.color : secondaryColor;
          particles.push(new Particle(this.x, this.y, angle, speed, pColor));
        }
      }

      draw() {
        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2.8;
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
        this.friction = 0.94;
        this.gravity = 0.14;
        this.color = color;
        this.alpha = 1;
        this.decay = 0.025 + Math.random() * 0.025;
        this.size = 2.2 + Math.random() * 2.5;
        this.sparkle = Math.random() > 0.3;
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

        if (this.sparkle && Math.random() > 0.2) {
          ctx.shadowBlur = 12;
          ctx.shadowColor = this.color;
        }

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    let lastLaunch = 0;
    const render = (time) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Frequent rocket launches for dense continuous cracker celebration (up to 12 active rockets)
      if (time - lastLaunch > 75 && fireworks.length < 12) {
        fireworks.push(new Firework());
        // Double burst launch chance
        if (Math.random() > 0.45 && fireworks.length < 12) {
          fireworks.push(new Firework());
        }
        lastLaunch = time;
      }

      for (let i = fireworks.length - 1; i >= 0; i--) {
        fireworks[i].update();
        if (!fireworks[i].exploded) {
          fireworks[i].draw();
        } else {
          fireworks.splice(i, 1);
        }
      }

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
  }, [fireworksActive]);

  const content = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[99999] flex items-center justify-center font-poppins select-none overflow-hidden"
    >
      {/* Background Overlay over Real Dashboard */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isExiting ? 0 : 1 }}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
        className="absolute inset-0 bg-black/15 backdrop-blur-[18px] backdrop-brightness-[92%] pointer-events-none"
      />

      {/* Floating Leaf Particles */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {[...Array(18)].map((_, i) => {
          const size = 14 + (i % 4) * 5;
          const initialX = (i * 5.8) % 100;
          const duration = 2.8 + (i % 3) * 0.8;

          return (
            <motion.div
              key={`leaf-${i}`}
              initial={{ y: -30, x: `${initialX}vw`, rotate: 0, opacity: 0 }}
              animate={{
                y: '105vh',
                x: [`${initialX}vw`, `${initialX + (i % 2 === 0 ? 5 : -5)}vw`, `${initialX}vw`],
                rotate: [0, 180, 360],
                opacity: [0, 0.75, 0.75, 0],
              }}
              transition={{
                duration: duration,
                repeat: Infinity,
                delay: i * 0.12,
                ease: 'linear',
              }}
              className="absolute text-emerald-500/50"
            >
              <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
                <path d="M17,8C8,10 59,16.17 3.82,21.34L5.23,22.75C10.4,17.58 16.58,15 18.58,6C18.58,6 22,2 22,2C22,2 18,5.42 17,8Z" />
              </svg>
            </motion.div>
          );
        })}

        {/* Soft Sparkle Particles */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={`sparkle-${i}`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 0.85, 0],
              scale: [0, 1.2, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.15,
              ease: 'easeInOut',
            }}
            className="absolute text-amber-300/75"
            style={{
              top: `${10 + (i * 6) % 80}%`,
              left: `${5 + (i * 7) % 88}%`,
            }}
          >
            <Sparkles className="w-4 h-4" />
          </motion.div>
        ))}
      </div>

      {/* Fireworks Canvas (Explodes high-density fireworks across screen) */}
      {fireworksActive && (
        <canvas
          ref={canvasRef}
          className="fixed inset-0 pointer-events-none z-10"
        />
      )}

      {/* Popup Container */}
      <AnimatePresence>
        {modalActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-20 w-full max-w-[620px] mx-4 p-7 sm:p-9 rounded-[24px] bg-white border border-[#E5E7EB] shadow-[0_30px_80px_rgba(0,0,0,0.18)] text-center overflow-hidden flex flex-col items-center"
          >
            {/* Top Floating Badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.05 }}
              className="w-[72px] h-[72px] rounded-full bg-white border-2 border-[#DCFCE7] flex items-center justify-center mb-4 shadow-[0_15px_35px_rgba(22,163,74,0.18)] relative z-10"
            >
              <span className="text-4xl drop-shadow-sm">🌱</span>
            </motion.div>

            {/* Title */}
            {headingActive && (
              <motion.h1
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="text-3xl sm:text-[40px] font-[800] leading-tight tracking-tight text-[#111827] mb-5 font-poppins"
              >
                🌱 100 Seed Balls{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#16A34A] to-[#22C55E]">
                  Planted!
                </span>
              </motion.h1>
            )}

            {/* Quote Card */}
            {quoteActive && (
              <div className="relative p-5 sm:p-7 rounded-[18px] bg-[#F8FAFC] border border-[#E2E8F0] w-full mb-6 text-center shadow-xs">
                <motion.p
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: 0.0 }}
                  className="text-xl sm:text-[26px] font-bold text-[#1F2937] leading-[1.5] mb-3"
                >
                  "You didn't just create an account...
                </motion.p>

                <motion.p
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: 0.1 }}
                  className="text-base sm:text-[19px] font-medium text-[#4B5563] leading-[1.7]"
                >
                  Today, 100 seed balls have been planted because of you.
                </motion.p>

                <motion.p
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: 0.2 }}
                  className="text-base sm:text-[19px] font-medium text-[#4B5563] leading-[1.7] mt-2"
                >
                  Every seed is a promise. <br />
                  Every tree is a future.
                </motion.p>

                <motion.p
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: 0.3 }}
                  className="mt-3 text-base sm:text-[19px] font-bold text-[#16A34A] leading-[1.7] flex items-center justify-center gap-1.5"
                >
                  <span>Thank you for making our Earth a little greener.</span>
                  <span>💚</span>
                </motion.p>
              </div>
            )}

            {/* Progress Bar */}
            <div className="w-full h-[8px] bg-[#E5E7EB] rounded-full overflow-hidden relative z-10">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 3.0, ease: 'linear' }}
                className="h-full bg-gradient-to-r from-[#16A34A] via-[#22C55E] to-[#84CC16] rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  return ReactDOM.createPortal(content, document.body);
};

export default RegistrationSuccessAnimation;

