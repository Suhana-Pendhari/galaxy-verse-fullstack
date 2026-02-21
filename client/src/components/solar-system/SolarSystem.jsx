import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Text } from '@react-three/drei';
import * as THREE from 'three';
import Planet from './Planet';

const SolarSystem = ({ orbitSpeed, showLabels, showOrbits, onPlanetClick }) => {
  const groupRef = useRef();

  // Planet data
  const planets = useMemo(() => [
    {
      name: 'Sun',
      size: 5,
      distance: 0,
      color: '#ffaa00',
      rotationSpeed: 0.004,
      atmosphere: '#ffaa00',
      description: 'The Sun is the star at the center of the Solar System. It is a nearly perfect sphere of hot plasma, heated to incandescence by nuclear fusion reactions in its core.',
      facts: [
        'Diameter: 1.39 million km',
        'Temperature: 5,500°C (surface)',
        'Age: 4.6 billion years',
        'Composition: 73% hydrogen, 25% helium',
      ],
    },
    {
      name: 'Mercury',
      size: 0.4,
      distance: 8,
      color: '#8c8c8c',
      rotationSpeed: 0.02,
      orbitSpeed: 0.04,
      description: 'Mercury is the smallest and innermost planet in the Solar System. It has no natural satellites and a heavily cratered surface.',
      facts: [
        'Diameter: 4,879 km',
        'Temperature: -173°C to 427°C',
        'Day length: 59 Earth days',
        'Year length: 88 Earth days',
      ],
    },
    {
      name: 'Venus',
      size: 0.9,
      distance: 12,
      color: '#e6b800',
      rotationSpeed: 0.015,
      orbitSpeed: 0.015,
      atmosphere: '#ffd700',
      description: 'Venus is the second planet from the Sun. It has a thick, toxic atmosphere that traps heat, making it the hottest planet.',
      facts: [
        'Diameter: 12,104 km',
        'Temperature: 462°C',
        'Day length: 243 Earth days',
        'Year length: 225 Earth days',
      ],
    },
    {
      name: 'Earth',
      size: 1,
      distance: 16,
      color: '#4d88ff',
      rotationSpeed: 0.01,
      orbitSpeed: 0.01,
      atmosphere: '#4d88ff',
      description: 'Earth is the third planet from the Sun and the only astronomical object known to harbor life.',
      facts: [
        'Diameter: 12,742 km',
        'Temperature: -88°C to 58°C',
        'Day length: 24 hours',
        'Year length: 365 days',
        'Moons: 1',
      ],
    },
    {
      name: 'Mars',
      size: 0.5,
      distance: 20,
      color: '#ff4d4d',
      rotationSpeed: 0.008,
      orbitSpeed: 0.008,
      atmosphere: '#ff6666',
      description: 'Mars is the fourth planet from the Sun. It has a thin atmosphere and a surface featuring iron oxide, giving it a reddish appearance.',
      facts: [
        'Diameter: 6,779 km',
        'Temperature: -60°C',
        'Day length: 24.6 hours',
        'Year length: 687 days',
        'Moons: 2',
      ],
    },
    {
      name: 'Jupiter',
      size: 2.5,
      distance: 28,
      color: '#ff9933',
      rotationSpeed: 0.005,
      orbitSpeed: 0.005,
      atmosphere: '#ffaa66',
      description: 'Jupiter is the fifth planet from the Sun and the largest in the Solar System. It is a gas giant with a Great Red Spot.',
      facts: [
        'Diameter: 139,820 km',
        'Temperature: -110°C',
        'Day length: 9.9 hours',
        'Year length: 12 Earth years',
        'Moons: 79',
      ],
    },
    {
      name: 'Saturn',
      size: 2.1,
      distance: 36,
      color: '#ffcc66',
      rotationSpeed: 0.003,
      orbitSpeed: 0.003,
      hasRings: true,
      description: 'Saturn is the sixth planet from the Sun and the second-largest. It has a prominent ring system composed of ice and rock.',
      facts: [
        'Diameter: 116,460 km',
        'Temperature: -140°C',
        'Day length: 10.7 hours',
        'Year length: 29 Earth years',
        'Moons: 82',
      ],
    },
    {
      name: 'Uranus',
      size: 1.8,
      distance: 44,
      color: '#66ccff',
      rotationSpeed: 0.002,
      orbitSpeed: 0.002,
      atmosphere: '#88ddff',
      description: 'Uranus is the seventh planet from the Sun. It has a unique tilt, rotating on its side, and is classified as an ice giant.',
      facts: [
        'Diameter: 50,724 km',
        'Temperature: -195°C',
        'Day length: 17.2 hours',
        'Year length: 84 Earth years',
        'Moons: 27',
      ],
    },
    {
      name: 'Neptune',
      size: 1.8,
      distance: 52,
      color: '#3366ff',
      rotationSpeed: 0.001,
      orbitSpeed: 0.001,
      atmosphere: '#4488ff',
      description: 'Neptune is the eighth and farthest planet from the Sun. It is a gas giant with strong winds and storms.',
      facts: [
        'Diameter: 49,244 km',
        'Temperature: -200°C',
        'Day length: 16.1 hours',
        'Year length: 165 Earth years',
        'Moons: 14',
      ],
    },
  ], []);

  // Create orbit paths
  const orbitPaths = useMemo(() => {
    return planets.filter(p => p.distance > 0).map(planet => {
      const points = [];
      const segments = 128;
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        points.push(
          new THREE.Vector3(
            Math.cos(angle) * planet.distance,
            0,
            Math.sin(angle) * planet.distance
          )
        );
      }
      return { planet, points };
    });
  }, [planets]);

  // Animation frame for orbits
  useFrame(({ clock }) => {
    if (groupRef.current) {
      // Rotate the entire system slightly for dynamic feel
      groupRef.current.rotation.y += 0.0001;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Sun glow effect */}
      <pointLight position={[0, 0, 0]} intensity={2} distance={100} decay={2} />
      
      {/* Orbit paths */}
      {showOrbits && orbitPaths.map(({ planet, points }) => (
        <line key={`orbit-${planet.name}`}>
          <bufferGeometry attach="geometry" setFromPoints={points} />
          <lineBasicMaterial attach="material" color="#ffffff" opacity={0.2} transparent />
        </line>
      ))}

      {/* Planets */}
      {planets.map((planet, index) => (
        <Planet
          key={planet.name}
          planet={planet}
          index={index}
          orbitSpeed={orbitSpeed}
          showLabel={showLabels}
          onClick={() => onPlanetClick(planet)}
        />
      ))}
    </group>
  );
};

export default SolarSystem;
