import { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

interface PetModelProps {
  mousePosition: { x: number; y: number };
  modelName: string;
}

const MODEL_PATHS: Record<string, string> = {
  Nick: '/models/Nick.glb',
  Cat: '/models/cat.glb'
};

function PetModel({ mousePosition, modelName }: PetModelProps) {
  const modelRef = useRef<THREE.Object3D>(null);
  const previousModel = useRef<string>('');

  useEffect(() => {
    if (!modelRef.current || modelName === previousModel.current) return;
    
    while (modelRef.current.children.length > 0) {
      modelRef.current.remove(modelRef.current.children[0]);
    }

    const loader = new GLTFLoader();
    const modelPath = MODEL_PATHS[modelName] || MODEL_PATHS.Nick;
    
    loader.load(modelPath, (gltf) => {
      if (modelRef.current) {
        modelRef.current.add(gltf.scene);
        gltf.scene.scale.set(2.5, 2.5, 2.5);
        gltf.scene.position.set(0, -0.8, 0);
      }
    });
    
    previousModel.current = modelName;
  }, [modelName]);

  useFrame(() => {
    if (modelRef.current) {
      const targetRotationX = (mousePosition.y - 0.5) * 0.8;
      const targetRotationY = (mousePosition.x - 0.5) * 0.8;

      modelRef.current.rotation.x = THREE.MathUtils.lerp(
        modelRef.current.rotation.x,
        targetRotationX,
        0.15
      );
      modelRef.current.rotation.y = THREE.MathUtils.lerp(
        modelRef.current.rotation.y,
        targetRotationY,
        0.15
      );
    }
  });

  return <group ref={modelRef} />;
}

function CameraController({ mousePosition }: { mousePosition: { x: number; y: number } }) {
  const { camera } = useThree();

  useFrame(() => {
    const targetX = (mousePosition.x - 0.5) * 1.5;
    const targetY = (mousePosition.y - 0.5) * 1.5;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX + 3, 0.08);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY + 2, 0.08);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

interface DesktopPet3DProps {
  weather?: string;
  temperature?: number;
}

export const DesktopPet3D = ({ weather: _weather, temperature: _temperature }: DesktopPet3DProps) => {
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const [position, setPosition] = useState({ x: typeof window !== 'undefined' ? window.innerWidth - 150 : 100, y: typeof window !== 'undefined' ? window.innerHeight - 200 : 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [currentModel, setCurrentModel] = useState<string>('Nick');

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: Math.max(0, Math.min(window.innerWidth - 250, e.clientX - dragOffset.x)),
          y: Math.max(0, Math.min(window.innerHeight - 250, e.clientY - dragOffset.y))
        });
      } else {
        setMousePosition({
          x: e.clientX / window.innerWidth,
          y: e.clientY / window.innerHeight
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const toggleModel = () => {
    setCurrentModel(prev => prev === 'Nick' ? 'Cat' : 'Nick');
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        width: '280px',
        height: '280px',
        cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: 1000,
        touchAction: 'none'
      }}
    >
      <Canvas
        shadows
        camera={{ position: [3, 1.5, 4.5], fov: 45 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[5, 10, 5]}
          intensity={1}
          castShadow
        />
        <pointLight position={[-5, 5, -5]} intensity={0.4} color="#ffd4a3" />

        <Suspense fallback={null}>
          <PetModel mousePosition={mousePosition} modelName={currentModel} />
        </Suspense>

        <CameraController mousePosition={mousePosition} />
        <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
      </Canvas>

      <div
        style={{
          position: 'absolute',
          bottom: '5px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '6px 14px',
          borderRadius: '12px',
          fontSize: '11px',
          whiteSpace: 'nowrap'
        }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleModel();
          }}
          style={{
            background: '#6366f1',
            border: 'none',
            color: 'white',
            padding: '5px 12px',
            borderRadius: '8px',
            fontSize: '11px',
            cursor: 'pointer'
          }}
        >
          切换模型 ({currentModel})
        </button>
      </div>
    </div>
  );
};

export default DesktopPet3D;
