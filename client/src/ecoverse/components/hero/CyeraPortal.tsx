"use client";

import { useRef, useEffect, useState } from "react";
import gsap from "gsap";

export default function CyeraPortal() {
  const textRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [phase, setPhase] = useState<"landing" | "briefing">("landing");

  useEffect(() => {
    if (phase === "landing") {
      gsap.fromTo(
        textRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, ease: "power3.out" }
      );
      gsap.fromTo(
        btnRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.3 }
      );
    }
  }, [phase]);

  return (
    <div className="relative w-full h-screen bg-[#11052C] overflow-hidden flex flex-col items-center justify-center text-white select-none">
      
      {/* خلفية فضاء تفاعلية ونقية تماثل تصميم Cyera */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#2a1352] via-[#11052C] to-[#05010d] z-0 pointer-events-none">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]"></div>
      </div>

      {/* الشريط العلوي */}
      <header className="absolute top-0 z-20 flex items-center justify-between w-full p-8">
        <div className="text-xl font-bold tracking-widest flex items-center gap-2">
          <span className="w-5 h-5 border-2 border-white rounded block"></span>
          ECOVERSE
        </div>
        <div className="flex gap-4">
          <button className="text-sm text-gray-300 hover:text-white transition-colors cursor-pointer">
            Visit our website
          </button>
          <button className="px-4 py-2 text-sm bg-white text-[#11052C] rounded-md font-semibold hover:bg-gray-200 transition-colors cursor-pointer">
            Request a demo
          </button>
        </div>
      </header>

      {/* الشاشة الرئيسية أو شاشة البريف */}
      {phase === "landing" ? (
        <div className="relative z-10 flex flex-col items-center text-center max-w-4xl px-4">
          <div ref={textRef}>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-6">
              Know Your Data. Control Your AI. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-gray-400">
                Secure the Unknown.
              </span>
            </h1>
          </div>
          
          <button
            ref={btnRef}
            onClick={() => setPhase("briefing")}
            className="mt-8 px-8 py-4 flex items-center gap-3 bg-[#1A1A24] text-white rounded-full font-medium hover:bg-purple-900/40 border border-gray-700 transition-all shadow-2xl cursor-pointer"
          >
            Begin Your Mission
            <span className="w-7 h-7 flex items-center justify-center bg-white text-black rounded-full font-bold">
              →
            </span>
          </button>
        </div>
      ) : (
        <div className="relative z-10 text-center max-w-2xl px-4 animate-fade-in">
          <h2 className="text-4xl font-bold mb-4">AI launches your data into orbit.</h2>
          <p className="text-xl text-gray-300 mb-8">
            Cyera secures every landing across uncharted AI territories.
          </p>
          <button 
            onClick={() => setPhase("landing")}
            className="px-6 py-2.5 bg-purple-600 rounded-full text-white font-medium hover:bg-purple-700 transition-colors cursor-pointer"
          >
            Back to Home
          </button>
        </div>
      )}

    </div>
  );
}