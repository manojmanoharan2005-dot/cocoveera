import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { Palmtree, Factory, Truck, Ship, Home, CheckCircle, ChevronRight } from 'lucide-react';
import { HologramNode, EnergyRoute } from './SceneElements';

const STAGES = [
  { id: 0, title: 'Born in Nature', subtitle: 'Premium Sourcing', duration: 2500, Icon: Palmtree, pos: [0, 0, 0] },
  { id: 1, title: 'Precision Tested', subtitle: 'Export Quality Assured', duration: 2500, Icon: Factory, pos: [5, 2, -5] },
  { id: 2, title: 'Ready for Global Delivery', subtitle: 'Dispatched to Seaport', duration: 2500, Icon: Truck, pos: [10, 0, -10] },
  { id: 3, title: 'Connecting Growers Worldwide', subtitle: 'Global Export Network', duration: 2500, Icon: Ship, pos: [15, -2, -5] },
  { id: 4, title: 'Delivered with Excellence', subtitle: 'Straight to Your Farm', duration: 2500, Icon: Home, pos: [20, 0, 0] },
];

const FINAL_POS = [25, 1, -2];

const CameraController = ({ currentStage, isFinal }) => {
  const { camera } = useThree();

  useFrame((state, delta) => {
    let targetPos = new THREE.Vector3();
    let targetLook = new THREE.Vector3();

    if (isFinal) {
      // Pull way back to see everything
      targetPos.set(12, 8, 25);
      targetLook.set(12, 0, -5);
    } else {
      const stage = STAGES[currentStage];
      
      const offset = new THREE.Vector3(-2, 1, 4); // Camera offset from the node
      targetPos.set(stage.pos[0] + offset.x, stage.pos[1] + offset.y, stage.pos[2] + offset.z);
      
      // Slight panning effect
      targetPos.x += Math.sin(state.clock.elapsedTime * 0.5) * 0.5;
      
      targetLook.set(...stage.pos);
    }

    camera.position.lerp(targetPos, delta * 2.5);
    
    // Smooth lookAt
    const currentLookAt = new THREE.Vector3(0,0,-1).applyQuaternion(camera.quaternion).add(camera.position);
    currentLookAt.lerp(targetLook, delta * 3);
    camera.lookAt(currentLookAt);
  });

  return null;
};

const SuccessAnimation = ({ onComplete, type = 'login' }) => {
  const [currentStage, setCurrentStage] = useState(0);
  const [isFinal, setIsFinal] = useState(false);
  const [showSkip, setShowSkip] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);

  // local storage check
  useEffect(() => {
    const lastPlayedStr = localStorage.getItem('cocoveera_animation_last_played');
    const now = Date.now();
    const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000; // 14 days in milliseconds

    // Clear old legacy key if it exists
    localStorage.removeItem('cocoveera_animation_played');

    // Always play for new registrations, otherwise check the 2-week cooldown
    if (type !== 'register' && lastPlayedStr && (now - parseInt(lastPlayedStr, 10) < TWO_WEEKS_MS)) {
      // Skip if played within the last 2 weeks (for logins/checkouts)
      setShouldRender(false);
      onComplete();
    } else {
      // Play animation and update timestamp
      localStorage.setItem('cocoveera_animation_last_played', now.toString());
    }
  }, [onComplete, type]);

  // Timer logic
  useEffect(() => {
    if (isFinal || !shouldRender) return;

    const timer = setTimeout(() => {
      if (currentStage < STAGES.length - 1) {
        setCurrentStage(prev => prev + 1);
      } else {
        setIsFinal(true);
        setTimeout(() => onComplete(), 4000); // 4s finale
      }
    }, STAGES[currentStage].duration);

    return () => clearTimeout(timer);
  }, [currentStage, isFinal, onComplete, shouldRender]);

  useEffect(() => {
    const skipTimer = setTimeout(() => setShowSkip(true), 2000);
    return () => clearTimeout(skipTimer);
  }, []);

  if (!shouldRender) return null;

  const routePoints = [...STAGES.map(s => s.pos), FINAL_POS];

  const content = (
    <div className="fixed inset-0 z-[99999] bg-stone-950 overflow-hidden font-poppins">
      {/* 3D Canvas */}
      <div className="absolute inset-0">
        <Canvas camera={{ position: [-2, 1, 4], fov: 60 }}>
          <color attach="background" args={['#0a0a0a']} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} color="#4ade80" />
          <spotLight position={[-5, 5, 5]} intensity={0.8} color="#fff" penumbra={1} />
          
          <Sparkles count={400} scale={30} size={2} speed={0.4} color="#4ade80" />
          
          <CameraController currentStage={currentStage} isFinal={isFinal} />
          
          {STAGES.map((stage, idx) => (
            <HologramNode 
              key={stage.id} 
              position={stage.pos} 
              Icon={stage.Icon} 
              active={currentStage === idx && !isFinal}
            />
          ))}

          {/* Final Logo Node */}
          <HologramNode 
            position={FINAL_POS}
            isFinal={true}
            active={isFinal}
          />
          
          <EnergyRoute points={routePoints} activeProgress={isFinal ? 1 : (currentStage + 1) / STAGES.length} />
        </Canvas>
      </div>

      {/* Cinematic HUD Overlay */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 md:p-16">
        
        {/* Top bar */}
        <div className="flex justify-between items-start w-full">
          <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="flex items-center gap-3"
          >
            <img src="/logo.webp" alt="Cocoveera" className="w-8 h-8 object-contain opacity-80" />
            <span className="text-stone-400 font-poppins text-xs uppercase tracking-[0.2em] font-bold">Secure Portal</span>
          </motion.div>
          
          <AnimatePresence>
            {showSkip && !isFinal && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => {
                  setIsFinal(true);
                  setTimeout(() => onComplete(), 3000);
                }}
                className="pointer-events-auto flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md px-5 py-2.5 rounded-full text-stone-300 text-xs font-bold uppercase tracking-widest transition-all"
              >
                Skip <ChevronRight className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Dynamic Center Text */}
        <div className="flex flex-col items-center justify-center text-center">
          <AnimatePresence mode="wait">
            {!isFinal ? (
              <motion.div
                key={currentStage}
                initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center"
              >
                <h2 className="text-4xl md:text-6xl font-poppins font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-stone-400 mb-4 tracking-tight drop-shadow-2xl">
                  {STAGES[currentStage].title}
                </h2>
                <div className="px-6 py-2 rounded-full bg-primary/20 border border-primary/30 backdrop-blur-md">
                  <p className="text-primary-light text-sm font-bold uppercase tracking-[0.2em]">
                    {STAGES[currentStage].subtitle}
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="finale"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="flex flex-col items-center"
              >
                <motion.div 
                  initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.5 }}
                  className="w-20 h-20 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center mb-6 backdrop-blur-md shadow-[0_0_40px_rgba(46,125,50,0.4)]"
                >
                  <CheckCircle className="w-10 h-10 text-primary-light" />
                </motion.div>
                <h1 className="text-5xl md:text-7xl font-poppins font-black text-white mb-6 drop-shadow-2xl text-center">
                  {type === 'register' ? 'Account Created Successfully' : 'Login Successful'}
                </h1>
                <p className="text-stone-400 text-lg md:text-xl font-medium tracking-wide">
                  Welcome to Cocoveera
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-3xl mx-auto">
          <div className="h-1 bg-stone-800/50 rounded-full overflow-hidden backdrop-blur-sm">
            <motion.div 
              className="h-full bg-gradient-to-r from-[#2E5E35] to-[#4ade80]"
              initial={{ width: '0%' }}
              animate={{ width: isFinal ? '100%' : `${((currentStage) / STAGES.length) * 100}%` }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(content, document.body);
};

export default SuccessAnimation;
