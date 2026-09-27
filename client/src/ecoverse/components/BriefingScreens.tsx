"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

interface BriefingScreensProps {
  onComplete: () => void;
}

export default function BriefingScreens({ onComplete }: BriefingScreensProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const slideRef = useRef<HTMLDivElement>(null);
  const [currentStep, setCurrentStep] = useState(0);

  // محتوى شاشات الإحاطة الاستراتيجية للمشروع
  const steps = [
    {
      tag: "الرؤية الأساسية[cite: 1]",
      title: "AI launches your data into orbit.",
      subtitle: "تحويل الاستدامة والذكاء الاصطناعي من مفاهيم نظرية إلى ثقافة مؤسسية عملية[cite: 5]."
    },
    {
      tag: "الأمن والتحكم[cite: 1]",
      title: "Cyera secures every landing.",
      subtitle: "حماية البيانات الحساسة وإدارتها بأعلى معايير الحوكمة والأمان الرقمي."
    },
    {
      tag: "مهمة المستقبل[cite: 1]",
      title: "Your Mission: Build Tomorrow",
      subtitle: "استعراض الابتكارات الطلابية والمشاريع الخضراء عبر منصة تفاعلية متكاملة[cite: 1]."
    }
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // حركة دخول تفاعلية متسلسلة للشاشة الحالية
      gsap.fromTo(
        slideRef.current,
        { opacity: 0, y: 40, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out" }
      );
      
      gsap.fromTo(
        ".brief-element",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: "power2.out", delay: 0.2 }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      // حركة خروج سلسة قبل الانتقال للشاشة التالية
      gsap.to(slideRef.current, {
        opacity: 0,
        y: -30,
        duration: 0.4,
        ease: "power2.in",
        onComplete: () => {
          setCurrentStep((prev) => prev + 1);
        }
      });
    } else {
      // إنهاء مرحلة الإحاطة والانتقال لقمرة القيادة (Cockpit)
      gsap.to(containerRef.current, {
        opacity: 0,
        duration: 0.6,
        onComplete
      });
    }
  };

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#11052C]/90 backdrop-blur-md text-white px-6 select-none cursor-pointer"
      onClick={handleNext}
    >
      <div ref={slideRef} className="max-w-3xl text-center">
        <span className="brief-element inline-block px-4 py-1 mb-4 text-xs font-semibold tracking-widest text-purple-300 uppercase bg-purple-900/40 border border-purple-700/50 rounded-full">
          {steps[currentStep].tag}
        </span>
        
        <h2 className="brief-element text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
          {steps[currentStep].title}
        </h2>
        
        <p className="brief-element text-lg md:text-xl text-gray-300 font-light max-w-2xl mx-auto">
          {steps[currentStep].subtitle}
        </p>
      </div>

      {/* مؤشر التقدم وأزرار التنقل السفلية */}
      <div className="absolute bottom-12 flex flex-col items-center gap-4">
        <div className="flex gap-2">
          {steps.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-1.5 rounded-full transition-all duration-500 ${
                idx === currentStep ? "w-8 bg-white" : "w-2 bg-white/30"
              }`}
            />
          ))}
        </div>
        <span className="text-xs text-gray-400 tracking-wider">
          انقر في أي مكان للمتابعة ←
        </span>
      </div>
    </div>
  );
}