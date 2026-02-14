"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Environment } from "@react-three/drei";
import * as THREE from "three";

/**
 * Real 3D mask loaded from .glb file (Meshy AI generated).
 * Applies chrome material override and rotates continuously.
 */
function ChromeMask() {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF("/models/mask.glb");

  // Override all mesh materials with chrome finish
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.material = new THREE.MeshPhysicalMaterial({
        color: 0xcccccc,
        metalness: 0.98,
        roughness: 0.03,
        envMapIntensity: 2.5,
        clearcoat: 1.0,
        clearcoatRoughness: 0.02,
        reflectivity: 1,
      });
      child.castShadow = true;
    }
  });

  // Slow continuous Y rotation
  useFrame((_state, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.3;
  });

  return (
    <group ref={groupRef} position={[0, 0.3, 0]} scale={[0.8, 0.8, 0.8]}>
      <primitive object={scene} />
    </group>
  );
}

// Preload the model
useGLTF.preload("/models/mask.glb");

export default function MaskScene() {
  return (
    <div className="absolute inset-0 z-[1]">
      <Canvas
        camera={{ position: [0, 0, 4], fov: 40 }}
        dpr={[1, Math.min(typeof window !== "undefined" ? window.devicePixelRatio : 2, 2)]}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
        style={{ background: "transparent" }}
      >
        {/* Studio lighting for chrome reflections */}
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <directionalLight position={[-4, -2, 3]} intensity={0.5} />
        <spotLight position={[0, 6, 4]} intensity={1} angle={0.5} penumbra={0.5} />

        {/* HDR environment for realistic chrome reflections */}
        <Environment preset="studio" />

        <ChromeMask />
      </Canvas>
    </div>
  );
}
