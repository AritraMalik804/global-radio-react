import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useAppStore } from '../store';
import type { Station } from '../store';
import { fetchInitialStations } from '../services/radio';

// Helper to convert lat/lng to 3D vector
const latLongToVector3 = (lat: number, lng: number, radius: number) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = (radius * Math.sin(phi) * Math.sin(theta));
  const y = (radius * Math.cos(phi));
  
  return new THREE.Vector3(x, y, z);
};

const Marker = ({ station, isActive, onClick }: { station: Station, isActive: boolean, onClick: () => void }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHover] = useState(false);
  
  // Basic validation for geo coordinates
  if (typeof station.geo_lat !== 'number' || typeof station.geo_long !== 'number') return null;
  
  const position = useMemo(() => {
    return latLongToVector3(station.geo_lat!, station.geo_long!, 2.05); // slightly above radius 2
  }, [station.geo_lat, station.geo_long]);

  useFrame((state) => {
    if (meshRef.current) {
      if (isActive || hovered) {
        const scale = 1 + Math.sin(state.clock.elapsedTime * 5) * 0.2;
        meshRef.current.scale.set(scale, scale, scale);
      } else {
        meshRef.current.scale.set(1, 1, 1);
      }
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onPointerOver={(e) => { e.stopPropagation(); setHover(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHover(false); document.body.style.cursor = 'auto'; }}
    >
      <sphereGeometry args={[isActive ? 0.04 : 0.02, 16, 16]} />
      <meshBasicMaterial color={isActive ? "#c44d48" : (hovered ? "#e07a5f" : "#4a4a4a")} />
      
      {hovered && !isActive && (
        <Html position={[0, 0.1, 0]} center style={{ pointerEvents: 'none' }}>
          <div style={{ background: 'rgba(0,0,0,0.8)', padding: '4px 8px', borderRadius: '4px', color: 'white', fontSize: '12px', whiteSpace: 'nowrap' }}>
            {station.name}
          </div>
        </Html>
      )}
    </mesh>
  );
};

const Earth = () => {
  const earthRef = useRef<THREE.Mesh>(null);
  const { currentStation, setStation, setLoading, stations, setStations, theme } = useAppStore();

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const initial = await fetchInitialStations();
      setStations(initial);
      setLoading(false);
    };
    if (stations.length === 0) {
      init();
    }
  }, [setLoading, setStations, stations.length]);

  // Optional: load more when clicking on country, but for now we just show initial

  // Load earth textures
  const earthTextureLight = useMemo(() => new THREE.TextureLoader().load('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg'), []);
  const earthTextureDark = useMemo(() => new THREE.TextureLoader().load('https://unpkg.com/three-globe/example/img/earth-dark.jpg'), []);
  
  const activeTexture = theme === 'dark' ? earthTextureDark : earthTextureLight;

  useFrame(() => {
    if (earthRef.current && !currentStation) {
      earthRef.current.rotation.y += 0.0005; // Slow idle spin
    }
  });

  return (
    <group ref={earthRef}>
      <Sphere args={[2, 64, 64]}>
        <meshStandardMaterial 
          map={activeTexture}
          roughness={theme === 'dark' ? 0.8 : 1.0}
          metalness={theme === 'dark' ? 0.2 : 0.0}
          color="#ffffff"
        />
      </Sphere>
      
      {/* Atmosphere glow */}
      <Sphere args={[2.08, 32, 32]}>
        <meshBasicMaterial 
          color={theme === 'dark' ? "#1a457b" : "#e8f0fe"} 
          transparent 
          opacity={theme === 'dark' ? 0.15 : 0.2} 
          side={THREE.BackSide} 
          blending={theme === 'dark' ? THREE.AdditiveBlending : THREE.NormalBlending} 
        />
      </Sphere>

      {stations.map((station) => (
        <Marker 
          key={station.id} 
          station={station} 
          isActive={currentStation?.id === station.id}
          onClick={() => setStation(station)}
        />
      ))}
    </group>
  );
};

const Globe = () => {
  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={1.5} />
        <directionalLight position={[5, 3, 5]} intensity={2.0} />
        <Earth />
        <OrbitControls 
          enablePan={false} 
          enableZoom={true} 
          minDistance={2.5} 
          maxDistance={8} 
          dampingFactor={0.05}
          rotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
};

export default Globe;
