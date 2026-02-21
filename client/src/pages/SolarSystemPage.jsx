import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import { Physics } from '@react-three/cannon';
import SolarSystem from '../components/solar-system/SolarSystem';
import PlanetInfo from '../components/solar-system/PlanetInfo';
import Controls from '../components/solar-system/Controls';
import Loader from '../components/common/Loader';
import { motion } from 'framer-motion';

const SolarSystemPage = () => {
  const [selectedPlanet, setSelectedPlanet] = React.useState(null);
  const [orbitSpeed, setOrbitSpeed] = React.useState(1);
  const [autoRotate, setAutoRotate] = React.useState(true);
  const [showLabels, setShowLabels] = React.useState(true);
  const [showOrbits, setShowOrbits] = React.useState(true);

  return (
    <div className="relative w-full h-screen bg-black">
      {/* Header Overlay */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-4 left-4 z-10 text-white bg-black/50 backdrop-blur-sm p-4 rounded-lg"
      >
        <h1 className="text-2xl font-orbitron font-bold bg-gradient-to-r from-cosmic-primary to-cosmic-accent bg-clip-text text-transparent">
          3D Solar System Simulator
        </h1>
        <p className="text-sm text-gray-300">Explore the cosmos in real-time 3D</p>
      </motion.div>

      {/* 3D Canvas */}
      <Suspense fallback={<Loader />}>
        <Canvas
          camera={{ position: [0, 30, 80], fov: 45 }}
          style={{ background: 'black' }}
        >
          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <pointLight position={[0, 0, 0]} intensity={2} />
          
          {/* Stars Background */}
          <Stars
            radius={300}
            depth={60}
            count={20000}
            factor={7}
            saturation={0}
            fade
          />

          {/* Physics */}
          <Physics gravity={[0, 0, 0]}>
            <SolarSystem
              orbitSpeed={orbitSpeed}
              showLabels={showLabels}
              showOrbits={showOrbits}
              onPlanetClick={setSelectedPlanet}
            />
          </Physics>

          {/* Controls */}
          <OrbitControls
            enableZoom={true}
            enablePan={true}
            enableRotate={autoRotate}
            autoRotate={autoRotate}
            autoRotateSpeed={orbitSpeed * 0.5}
            maxDistance={200}
            minDistance={20}
          />
        </Canvas>
      </Suspense>

      {/* UI Controls */}
      <Controls
        orbitSpeed={orbitSpeed}
        setOrbitSpeed={setOrbitSpeed}
        autoRotate={autoRotate}
        setAutoRotate={setAutoRotate}
        showLabels={showLabels}
        setShowLabels={setShowLabels}
        showOrbits={showOrbits}
        setShowOrbits={setShowOrbits}
      />

      {/* Planet Info Panel */}
      {selectedPlanet && (
        <PlanetInfo
          planet={selectedPlanet}
          onClose={() => setSelectedPlanet(null)}
        />
      )}

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-4 left-4 text-xs text-gray-500 bg-black/30 p-2 rounded"
      >
        <p>🖱️ Drag to rotate • Scroll to zoom • Click planets for info</p>
      </motion.div>
    </div>
  );
};

export default SolarSystemPage;
