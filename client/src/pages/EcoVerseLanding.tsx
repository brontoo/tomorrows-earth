"use client";

import { useRef, useEffect, useState } from "react";
import gsap from "gsap";

export default function EcoVerseLanding() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  
  // مراحل التطبيق المطابقة للفيديو الأصلي
  // phases: 'landing' -> 'briefing-1' -> 'briefing-2' -> 'briefing-3' -> 'briefing-4' -> 'cockpit'
  const [phase, setPhase] = useState<string>("landing");

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        stageRef.current,
        { opacity: 0, scale: 0.97 },
        { opacity: 1, scale: 1, duration: 0.8, ease: "power3.out" }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [phase]);

  const handleNext = (nextPhase: string) => {
    gsap.to(stageRef.current, {
      opacity: 0,
      y: -20,
      duration: 0.4,
      onComplete: () => {
        setPhase(nextPhase);
      }
    });
  };

  return (
    <main
      ref={containerRef}
      className="relative w-full h-screen bg-[#1b0b2e] overflow-hidden flex flex-col justify-between text-white select-none font-sans"
    >
      {/* الخلفية الفضائية الغنية بالكويكبات والمكعبات الخضراء المتوهجة */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#381566] via-[#1b0b2e] to-[#0a0312] z-0 pointer-events-none">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:28px_28px]"></div>

        {/* صخور وكويكبات فضائية عائمة مطابقة للفيديو */}
        <div className="absolute top-16 right-1/4 w-32 h-24 bg-[#120521] rounded-full blur-[1px] opacity-75 transform rotate-12 shadow-2xl"></div>
        <div className="absolute bottom-12 left-10 w-56 h-36 bg-[#10031a] rounded-3xl opacity-85 transform -rotate-6"></div>
        <div className="absolute top-1/3 left-12 w-20 h-16 bg-[#180829] rounded-2xl opacity-60"></div>
        
        {/* المكعبات الخضراء المضيئة (Data Particles) */}
        <div className="absolute top-28 left-1/3 w-6 h-6 bg-[#39ff14] shadow-[0_0_20px_#39ff14] transform rotate-45 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/5 w-5 h-5 bg-[#39ff14] shadow-[0_0_20px_#39ff14] transform -rotate-12 animate-bounce"></div>
      </div>

      {/* الشريط العلوي الثابت */}
      <header className="relative z-30 flex items-center justify-between w-full px-8 py-6">
        <div className="text-sm font-semibold tracking-wide flex items-center gap-2">
          <span className="w-4 h-4 border border-white rounded-sm block"></span>
          cyera <span className="font-light text-purple-300">AI Guardian</span>
        </div>
        <div className="flex items-center gap-6">
          <button className="text-sm text-gray-300 hover:text-white transition-colors cursor-pointer">
            Visit our website
          </button>
          <button className="px-4 py-2 text-sm bg-white text-[#1b0b2e] rounded-md font-medium hover:bg-gray-100 transition-colors cursor-pointer shadow-md">
            Request a demo
          </button>
        </div>
      </header>

      {/* المحتوى التفاعلي المتغير حسب مرحلة الفيديو */}
      <div ref={stageRef} className="relative z-20 flex-1 flex flex-col items-center justify-center w-full max-w-7xl mx-auto px-6">
        
        {/* 1. الصفحة الرئيسية (Landing) */}
        {phase === "landing" && (
          <div className="flex flex-col items-center text-center max-w-4xl">
            {/* محطة الفضاء الكبسولة في الخلفية */}
            <div className="absolute -top-20 w-48 h-48 bg-gradient-to-tr from-purple-700 to-indigo-500 rounded-full blur-2xl opacity-25 animate-pulse"></div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-8">
              Know Your Data. Control Your AI. <br />
              <span className="text-white">Secure the Unknown.</span>
            </h1>

            <button
              onClick={() => handleNext("briefing-1")}
              className="mt-4 px-7 py-4 flex items-center gap-3 bg-[#11051c] hover:bg-[#25103a] text-white rounded-full font-medium border border-purple-500/40 transition-all shadow-2xl cursor-pointer group"
            >
              Begin Your Mission
              <span className="w-6 h-6 flex items-center justify-center bg-white text-black rounded-full font-bold text-xs group-hover:translate-x-1 transition-transform">
                →
              </span>
            </button>
          </div>
        )}

        {/* 2. مرحلة الإحاطة 1: الكبسولة بالمنتصف وحلقات المدار مع النصين الجانبيين */}
        {phase === "briefing-1" && (
          <div className="grid grid-cols-1 md:grid-cols-3 items-center w-full text-center md:text-left gap-8">
            <div className="text-2xl md:text-3xl font-semibold tracking-tight text-white/90">
              AI launches your data into orbit.
            </div>

            {/* دوائر المدار والكبسولة الفضائية بالمنتصف */}
            <div className="flex items-center justify-center relative py-12">
              <div className="absolute w-72 h-72 border border-dashed border-purple-400/30 rounded-full animate-[spin_30s_linear_infinite]"></div>
              <div className="absolute w-52 h-52 border border-purple-500/50 rounded-full flex items-center justify-center">
                <div className="w-14 h-14 rounded-full border border-green-400/70 absolute -top-3 bg-green-500/20 animate-pulse"></div>
              </div>
              <div className="w-36 h-36 bg-gradient-to-br from-purple-500/50 to-indigo-950 rounded-full border border-purple-300/50 flex items-center justify-center shadow-[0_0_40px_rgba(168,85,247,0.4)]">
                <div className="w-24 h-14 bg-purple-950 rounded-lg border border-purple-400/60 flex items-center justify-center">
                  <div className="w-14 h-6 bg-purple-800/80 rounded"></div>
                </div>
              </div>
            </div>

            <div className="text-2xl md:text-3xl font-semibold tracking-tight text-white/90 text-center md:text-right">
              Cyera secures every landing.
            </div>
          </div>
        )}

        {/* 3. مرحلة الإحاطة 2: الكبسولة على اليمين والنص على اليسار */}
        {phase === "briefing-2" && (
          <div className="flex flex-col md:flex-row-reverse items-center justify-center w-full gap-16">
            <div className="w-52 h-52 bg-gradient-to-br from-purple-600/60 to-indigo-950 rounded-full border border-purple-400/50 flex items-center justify-center shadow-[0_0_50px_rgba(168,85,247,0.5)]">
              <div className="w-32 h-18 bg-purple-950 rounded-xl border border-purple-400/70 flex items-center justify-center">
                <div className="w-20 h-8 bg-purple-800/80 rounded-md"></div>
              </div>
            </div>
            <div className="max-w-xl text-center md:text-left">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                AI is uncharted territory.
              </h2>
              <p className="text-lg md:text-xl text-gray-300 font-light leading-relaxed">
                The race to adopt AI models, agents, and workflows is exposing sensitive data like ever before.
              </p>
            </div>
          </div>
        )}

        {/* 4. مرحلة الإحاطة 3: الكبسولة على اليسار والنص على اليمين */}
        {phase === "briefing-3" && (
          <div className="flex flex-col md:flex-row items-center justify-center w-full gap-16">
            <div className="w-52 h-52 bg-gradient-to-br from-purple-600/60 to-indigo-950 rounded-full border border-purple-400/50 flex items-center justify-center shadow-[0_0_50px_rgba(168,85,247,0.5)]">
              <div className="w-32 h-18 bg-purple-950 rounded-xl border border-purple-400/70 flex items-center justify-center">
                <div className="w-20 h-8 bg-purple-800/80 rounded-md"></div>
              </div>
            </div>
            <div className="max-w-xl text-center md:text-left">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                Your Mission
              </h2>
              <p className="text-lg md:text-xl text-gray-300 font-light leading-relaxed">
                Secure your organization's AI future.
              </p>
            </div>
          </div>
        )}

        {/* 5. مرحلة الإحاطة 4: With AI Guardian */}
        {phase === "briefing-4" && (
          <div className="flex flex-col md:flex-row items-center justify-center w-full gap-16">
            <div className="w-52 h-52 bg-gradient-to-br from-purple-600/60 to-indigo-950 rounded-full border border-purple-400/50 flex items-center justify-center shadow-[0_0_50px_rgba(168,85,247,0.5)]">
              <div className="w-32 h-18 bg-purple-950 rounded-xl border border-purple-400/70 flex items-center justify-center">
                <div className="w-20 h-8 bg-purple-800/80 rounded-md"></div>
              </div>
            </div>
            <div className="max-w-xl text-center md:text-left">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                With AI Guardian
              </h2>
              <p className="text-lg md:text-xl text-gray-300 font-light leading-relaxed">
                you can confidently navigate every part of this journey.
              </p>
            </div>
          </div>
        )}

        {/* 6. نافذة قمرة القيادة (Cockpit Window) مطابقة للدقيقة 00:16 في الفيديو */}
        {phase === "cockpit" && (
          <div className="flex flex-col items-center text-center max-w-4xl w-full">
            <div className="w-full h-80 bg-gradient-to-b from-indigo-900/80 to-green-900/40 rounded-3xl border-4 border-purple-500/40 relative overflow-hidden flex flex-col items-center justify-center shadow-2xl p-8">
              {/* منظر الكوكب والأفق والتلال */}
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-emerald-950 to-emerald-800/60 rounded-t-full"></div>
              
              <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
                  Discover
                </h2>
                <p className="text-lg text-purple-200 mb-6">
                  AI security starts with visibility
                </p>
                <button
                  onClick={() => alert("جاري الدخول إلى لوحة استكشاف البيانات والمكعبات...")}
                  className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-full shadow-lg transition-all cursor-pointer"
                >
                  Explore
                </button>
              </div>
            </div>
            <button
              onClick={() => handleNext("landing")}
              className="mt-6 text-sm text-gray-400 hover:text-white underline cursor-pointer"
            >
              العودة للبداية
            </button>
          </div>
        )}

      </div>

      {/* التذييل السفلي: أزرار النقر للتقدم والـ Skip */}
      <footer className="relative z-30 w-full px-8 py-6 flex justify-between items-center text-sm text-gray-400">
        <div>39°C Sunny</div>
        
        {phase !== "landing" && phase !== "cockpit" && (
          <div className="flex items-center gap-8">
            <button
              onClick={() => {
                if (phase === "briefing-1") handleNext("briefing-2");
                else if (phase === "briefing-2") handleNext("briefing-3");
                else if (phase === "briefing-3") handleNext("briefing-4");
                else if (phase === "briefing-4") handleNext("cockpit");
              }}
              className="hover:text-white tracking-widest uppercase text-xs cursor-pointer font-medium bg-purple-900/30 px-4 py-2 rounded-full border border-purple-700/50"
            >
              Next →
            </button>
            <button
              onClick={() => handleNext("landing")}
              className="hover:text-white tracking-widest uppercase text-xs cursor-pointer"
            >
              Skip
            </button>
          </div>
        )}

        {phase === "landing" && <div className="opacity-0">placeholder</div>}
        {phase === "cockpit" && <div>Swipe to explore the worlds</div>}
      </footer>
    </main>
  );
}