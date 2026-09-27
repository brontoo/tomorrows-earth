import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import { PortalScene } from './PortalScene';
// import { UAEAdventureMap } from './UAEAdventureMap'; 

export const HeroSection = () => {
  const [isEntering, setIsEntering] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const handleEnterClick = () => {
    setIsEntering(true); // تبدأ حركة الـ 3D والكاميرا
  };

  const handleTransitionComplete = () => {
    setShowMap(true); // تفعيل مكون خريطة الإمارات بعد انتهاء الاندفاع
  };

  return (
    <div className="relative w-full h-screen bg-midnight-navy overflow-hidden">
      
      {/* طبقة الـ 3D خلفية الواجهة */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 6], fov: 60 }}>
          {!showMap && (
             <PortalScene 
               isEntering={isEntering} 
               onTransitionComplete={handleTransitionComplete} 
             />
          )}
        </Canvas>
      </div>

      {/* طبقة واجهة المستخدم (UI Layer) */}
      <AnimatePresence>
        {!isEntering && (
          <motion.div 
            className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center pointer-events-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }} // تأثير التلاشي الزجاجي
            transition={{ duration: 1 }}
          >
            <h1 className="text-7xl md:text-9xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-ocean-teal to-emerald-green drop-shadow-lg">
              ECOVERSE
            </h1>
            <p className="mt-4 text-2xl text-electric-aqua font-light tracking-wide">
              Explore. Act. Make an Impact.
            </p>
            
            <div className="mt-12 flex gap-6">
              {/* يمكن تفعيل هذا الزر أيضاً عبر إيماءة (Pinch) من الـ GestureController */}
              <button 
                onClick={handleEnterClick}
                className="px-10 py-5 bg-ocean-teal hover:bg-emerald-green text-white text-xl font-bold rounded-full transition-all hover:scale-105 shadow-[0_0_30px_rgba(15,118,110,0.6)] cursor-pointer"
              >
                ENTER ECOVERSE
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* عرض خريطة مغامرة الإمارات بعد انتهاء الغوص (The Reveal) */}
      <AnimatePresence>
        {showMap && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, delay: 0.2 }}
            className="absolute inset-0 z-20 flex items-center justify-center bg-midnight-navy/80 backdrop-blur-md"
          >
            {/* مكون خريطة الإمارات (UAE Adventure Map) سيوضع هنا */}
            <h2 className="text-5xl text-white font-bold">YOUR FIRST WORLD AWAITS</h2>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};