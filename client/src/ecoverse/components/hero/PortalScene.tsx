// @ts-nocheck
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

interface PortalSceneProps {
  isEntering: boolean;
  onTransitionComplete: () => void;
}

export const PortalScene: React.FC<PortalSceneProps> = ({ isEntering, onTransitionComplete }) => {
  const portalRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<any>(null);
  const particlesRef = useRef<THREE.Points>(null);

  // إعداد مواقع الجزيئات (Particles) لتشكل سحابة حول البوابة
  const particlesCount = 2000;
  const positions = useMemo(() => {
    const pos = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 15;     // X
      pos[i * 3 + 1] = (Math.random() - 0.5) * 15; // Y
      pos[i * 3 + 2] = (Math.random() - 0.5) * 15; // Z
    }
    return pos;
  }, [particlesCount]);

  useFrame((state, delta) => {
    if (!isEntering) {
      // الدوران الهادئ قبل الدخول
      if (portalRef.current) {
        portalRef.current.rotation.x += delta * 0.2;
        portalRef.current.rotation.y += delta * 0.3;
      }
    } else {
      // 1. تسريع دوران وتشوه البوابة (Pulse Effect)
      if (materialRef.current) {
        materialRef.current.distort = THREE.MathUtils.lerp(materialRef.current.distort, 1.5, 0.1);
        materialRef.current.opacity = THREE.MathUtils.lerp(materialRef.current.opacity, 0, 0.05);
      }

      // 2. توسيع البوابة لتتفكك
      if (portalRef.current) {
        portalRef.current.scale.lerp(new THREE.Vector3(5, 5, 5), 0.05);
      }

      // 3. حركة الجزيئات نحو الكاميرا لتبدو كبيانات وأوراق متطايرة
      if (particlesRef.current) {
        particlesRef.current.position.z += delta * 15; 
      }

      // 4. اندفاع الكاميرا داخل النفق
      state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, -10, 0.08);

      // 5. إنهاء الانتقال عند وصول الكاميرا لنقطة معينة
      if (state.camera.position.z < -8) {
        onTransitionComplete();
      }
    }
  });

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 5, 5]} intensity={2} />
      <pointLight position={[0, 0, 2]} color="#0ea5e9" intensity={5} distance={10} />

      <Sphere ref={portalRef} args={[1.5, 64, 64]}>
        <MeshDistortMaterial
          ref={materialRef}
          color="#0f766e"
          emissive="#064e3b"
          emissiveIntensity={0.5}
          distort={0.4}
          speed={2}
          roughness={0.2}
          transparent
          opacity={1}
        />
      </Sphere>

      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particlesCount}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
          color="#38bdf8"
          transparent
          opacity={isEntering ? 1 : 0.3}
          blending={THREE.AdditiveBlending}
        />
      </points>

      <Sparkles count={500} scale={10} size={2} speed={isEntering ? 10 : 1} opacity={0.5} color="#10b981" />
    </>
  );
};