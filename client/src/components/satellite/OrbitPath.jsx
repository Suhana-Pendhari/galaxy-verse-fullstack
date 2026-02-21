import React, { useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Line, Html } from '@react-three/drei';
import * as THREE from 'three';

const OrbitPath = ({ satellite }) => {
  const earthRef = useRef();
  const satelliteRef = useRef();

  useFrame(({ clock }) => {
    if (satelliteRef.current && satellite.orbitDetails) {
      // Simplified orbital motion for visualization
      const time = clock.getElapsedTime() * 0.1;
      const period = satellite.orbitDetails.period || 90; // minutes
      const angle = (time / period) * Math.PI * 2;
      
      const radius = (satellite.orbitDetails.apogee + 6371) / 1000; // Scale for visualization
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      satelliteRef.current.position.set(x, 0, z);
    }
  });

  // Generate orbit path points
  const orbitPoints = [];
  if (satellite.orbitDetails) {
    const radius = (satellite.orbitDetails.apogee + 6371) / 1000;
    const segments = 128;
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      orbitPoints.push(
        new THREE.Vector3(
          Math.cos(angle) * radius,
          0,
          Math.sin(angle) * radius
        )
      );
    }
  }

  return (
    <group>
      {/* Earth */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[6.371, 64, 64]} />
        <meshStandardMaterial
          color="#2a6f97"
          emissive="#1a4b6e"
          emissiveIntensity={0.2}
          roughness={0.5}
          metalness={0.1}
        />
      </mesh>

      {/* Atmosphere glow */}
      <mesh>
        <sphereGeometry args={[6.5, 64, 64]} />
        <meshPhongMaterial
          color="#4d88ff"
          transparent
          opacity={0.1}
          emissive="#4d88ff"
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Orbit path */}
      {orbitPoints.length > 0 && (
        <Line
          points={orbitPoints}
          color="#f59e0b"
          lineWidth={1}
          opacity={0.3}
          transparent
        />
      )}

      {/* Satellite */}
      {satellite.currentPosition && (
        <mesh ref={satelliteRef}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.5} />
          <Html distanceFactor={10}>
            <div className="px-2 py-1 bg-black/80 text-white text-xs rounded-lg whitespace-nowrap">
              {satellite.name}
            </div>
          </Html>
        </mesh>
      )}
    </group>
  );
};

export default OrbitPath;
