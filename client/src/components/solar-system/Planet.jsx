import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Html, Text } from '@react-three/drei';
import * as THREE from 'three';

const Planet = ({ planet, index, orbitSpeed, showLabel, onClick }) => {
  const meshRef = useRef();
  const ringRef = useRef();
  const labelRef = useRef();

  // Create texture or use color
  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: planet.color,
      emissive: planet.name === 'Sun' ? planet.color : 'black',
      emissiveIntensity: planet.name === 'Sun' ? 2 : 0,
      roughness: 0.4,
      metalness: 0.1,
    });
  }, [planet]);

  // Animation
  useFrame(({ clock }) => {
    if (planet.name === 'Sun') {
      // Sun rotates
      meshRef.current.rotation.y += planet.rotationSpeed;
    } else {
      // Planets orbit around sun
      const time = clock.getElapsedTime() * orbitSpeed;
      const angle = time * planet.orbitSpeed * 10 + index;
      const x = Math.cos(angle) * planet.distance;
      const z = Math.sin(angle) * planet.distance;
      
      meshRef.current.position.set(x, 0, z);
      meshRef.current.rotation.y += planet.rotationSpeed;

      // Rotate rings if they exist
      if (ringRef.current) {
        ringRef.current.position.set(x, 0, z);
        ringRef.current.rotation.y += 0.01;
      }

      // Update label position
      if (labelRef.current) {
        labelRef.current.position.set(x, planet.size + 1, z);
      }
    }
  });

  return (
    <group>
      {/* Planet */}
      <mesh
        ref={meshRef}
        onClick={onClick}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[planet.size, 64, 64]} />
        <primitive object={material} attach="material" />
      </mesh>

      {/* Rings for Saturn */}
      {planet.hasRings && (
        <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[planet.size * 1.8, 0.2, 16, 100]} />
          <meshStandardMaterial color="#ffcc99" opacity={0.6} transparent emissive="#442200" />
        </mesh>
      )}

      {/* Atmosphere glow for planets with atmosphere */}
      {planet.atmosphere && planet.name !== 'Sun' && (
        <mesh position={meshRef.current?.position}>
          <sphereGeometry args={[planet.size * 1.05, 32, 32]} />
          <meshPhongMaterial
            color={planet.atmosphere}
            transparent
            opacity={0.1}
            emissive={planet.atmosphere}
            emissiveIntensity={0.2}
          />
        </mesh>
      )}

      {/* Label */}
      {showLabel && (
        <Html ref={labelRef} position={[0, planet.size + 1, 0]} center>
          <div className="px-3 py-1 bg-black/80 backdrop-blur-sm rounded-full border border-cosmic-accent text-white text-sm whitespace-nowrap">
            {planet.name}
          </div>
        </Html>
      )}
    </group>
  );
};

export default Planet;
