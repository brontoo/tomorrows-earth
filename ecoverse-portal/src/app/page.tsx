"use client";

import { Suspense, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import gsap from "gsap";

export default function Home() {
  const textRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // حركة دخول النصوص للأعلى
    gsap.fromTo(
      textRef.current,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.5, ease: "power3.out", delay: 0.3 }
    );
    gsap.fromTo(
      btnRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.8 }
    );
  }, []);

  return (
    <main className="relative w-full h-screen bg-[#11052C] overflow-hidden">
      {/* مشهد الفضاء الثلاثي الأبعاد */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.6} color="#592b8c" />
            <Stars radius={100} depth={50} count={6000} factor={4} saturation={0} fade speed={1.2} />
          </Suspense>
        </Canvas>
      </div>

      {/* واجهة المستخدم */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full text-white pointer-events-none select-none">
        
        {/* الشريط العلوي */}
        <header className="absolute top-0 flex items-center justify-between w-full p-8 pointer-events-auto">
          <div className="text-xl font-bold tracking-widest flex items-center gap-2">
            <span className="w-5 h-5 border-2 border-white rounded block"></span>
            ECOVERSE
          </div>
          <div className="flex gap-4">
            <button className="text-sm text-gray-300 hover:text-white transition-colors">
              Visit our website
            </button>
            <button className="px-4 py-2 text-sm text-[#11052C] bg-white rounded-md font-semibold hover:bg-gray-200 transition-colors">
              Request a demo
            </button>
          </div>
        </header>

        {/* العنوان المركزي */}
        <div ref={textRef} className="text-center max-w-4xl px-4 pointer-events-auto">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
            Know Your Data. Control Your AI. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-gray-400">
              Secure the Unknown.
            </span>
          </h1>
        </div>

        {/* زر بدء المهمة */}
        <button
          ref={btnRef}
          onClick={() => console.log("Begin Mission Clicked")}
          className="mt-12 px-7 py-3 flex items-center gap-3 bg-[#1A1A24] text-white rounded-full font-medium hover:bg-purple-900/40 hover:border-purple-500 transition-all duration-300 border border-gray-700 pointer-events-auto"
        >
          Begin Your Mission
          <span className="w-7 h-7 flex items-center justify-center bg-white text-black rounded-full text-base font-bold">
            →
          </span>
        </button>

      </div>
    </main>
  );
}