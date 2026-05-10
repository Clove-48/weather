import { useState, useEffect, useRef } from 'react';

interface WeatherBackgroundProps {
  weather: string;
  temperature?: number;
  children: React.ReactNode;
}

const getGradient = (weather: string, temperature?: number): string => {
  const w = weather.toLowerCase();
  const temp = temperature || 20;
  
  if (w.includes('clear') || w.includes('sunny') || w.includes('晴')) {
    if (temp >= 35) return 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 50%, #ff7675 100%)';
    if (temp >= 28) return 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 50%, #ff9a9e 100%)';
    if (temp >= 20) return 'linear-gradient(135deg, #a8edea 0%, #fed6e3 50%, #ff9a9e 100%)';
    if (temp >= 10) return 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #a8edea 100%)';
    return 'linear-gradient(135deg, #a8edea 0%, #fed6e3 50%, #667eea 100%)';
  }
  
  if (w.includes('cloud') || w.includes('多云') || w.includes('少云')) {
    if (temp >= 25) return 'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 30%, #a29bfe 70%, #6c5ce7 100%)';
    return 'linear-gradient(135deg, #74b9ff 0%, #0984e3 30%, #6c5ce7 70%, #a29bfe 100%)';
  }
  
  if (w.includes('overcast') || w.includes('阴')) {
    return 'linear-gradient(135deg, #636e72 0%, #2d3436 50%, #485563 100%)';
  }
  
  if (w.includes('rain') || w.includes('雨')) {
    if (w.includes('thunder') || w.includes('雷')) {
      return 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 30%, #16213e 70%, #0f3460 100%)';
    }
    return 'linear-gradient(135deg, #2c3e50 0%, #34495e 30%, #74b9ff 70%, #0984e3 100%)';
  }
  
  if (w.includes('snow') || w.includes('雪')) {
    if (temp < -5) return 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%)';
    return 'linear-gradient(135deg, #e8e8e8 0%, #c8c8c8 30%, #a8d8ea 70%, #74b9ff 100%)';
  }
  
  if (w.includes('fog') || w.includes('mist') || w.includes('雾') || w.includes('霾')) {
    return 'linear-gradient(135deg, #dfe6e9 0%, #b2bec3 30%, #636e72 70%, #dfe6e9 100%)';
  }
  
  return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
};

const getParticleType = (weather: string): string => {
  const w = weather.toLowerCase();
  
  if (w.includes('clear') || w.includes('sunny') || w.includes('晴')) {
    return 'sunny';
  }
  
  if (w.includes('cloud') || w.includes('多云') || w.includes('少云')) {
    return 'clouds';
  }
  
  if (w.includes('overcast') || w.includes('阴')) {
    return 'darkclouds';
  }
  
  if (w.includes('rain') || w.includes('雨')) {
    return 'rain';
  }
  
  if (w.includes('snow') || w.includes('雪')) {
    return 'snow';
  }
  
  if (w.includes('fog') || w.includes('mist') || w.includes('雾') || w.includes('霾')) {
    return 'fog';
  }
  
  return 'none';
};

const RainCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    interface Raindrop {
      x: number;
      y: number;
      length: number;
      speed: number;
      opacity: number;
      thickness: number;
    }

    const raindrops: Raindrop[] = [];
    const count = 200;

    for (let i = 0; i < count; i++) {
      raindrops.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        length: 15 + Math.random() * 25,
        speed: 8 + Math.random() * 12,
        opacity: 0.2 + Math.random() * 0.5,
        thickness: 1 + Math.random() * 1.5
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      raindrops.forEach((drop) => {
        const gradient = ctx.createLinearGradient(drop.x, drop.y, drop.x + 3, drop.y + drop.length);
        gradient.addColorStop(0, `rgba(174, 194, 224, ${drop.opacity})`);
        gradient.addColorStop(1, `rgba(174, 194, 224, ${drop.opacity * 0.3})`);
        
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x + 3, drop.y + drop.length);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = drop.thickness;
        ctx.lineCap = 'round';
        ctx.stroke();

        drop.y += drop.speed;
        drop.x += drop.speed * 0.3;

        if (drop.y > canvas.height) {
          drop.y = -drop.length;
          drop.x = Math.random() * canvas.width;
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
        opacity: 0.8
      }}
    />
  );
};

const SnowCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    interface Snowflake {
      x: number;
      y: number;
      size: number;
      speed: number;
      opacity: number;
      wobble: number;
      wobbleSpeed: number;
    }

    const snowflakes: Snowflake[] = [];
    const count = 120;

    for (let i = 0; i < count; i++) {
      snowflakes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 2 + Math.random() * 6,
        speed: 0.5 + Math.random() * 1.5,
        opacity: 0.4 + Math.random() * 0.6,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.02 + Math.random() * 0.03
      });
    }

    let time = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.016;

      snowflakes.forEach((flake, i) => {
        const gradient = ctx.createRadialGradient(flake.x, flake.y, 0, flake.x, flake.y, flake.size);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${flake.opacity})`);
        gradient.addColorStop(0.5, `rgba(255, 255, 255, ${flake.opacity * 0.6})`);
        gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);

        ctx.beginPath();
        ctx.arc(flake.x, flake.y, flake.size, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        flake.y += flake.speed;
        flake.x += Math.sin(time * 2 + flake.wobble + i) * flake.wobbleSpeed * 20;
        flake.wobble += flake.wobbleSpeed;

        if (flake.y > canvas.height) {
          flake.y = -flake.size;
          flake.x = Math.random() * canvas.width;
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
        opacity: 0.9
      }}
    />
  );
};

const SunnyCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    interface Sunray {
      x: number;
      y: number;
      size: number;
      opacity: number;
      shimmer: number;
    }

    const rays: Sunray[] = [];
    const count = 50;

    for (let i = 0; i < count; i++) {
      rays.push({
        x: canvas.width * (0.7 + Math.random() * 0.3),
        y: Math.random() * canvas.height * 0.25,
        size: 3 + Math.random() * 6,
        opacity: 0.1 + Math.random() * 0.25,
        shimmer: Math.random() * Math.PI * 2
      });
    }

    let time = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.016;

      rays.forEach((ray, i) => {
        const shimmer = Math.sin(time * 2 + ray.shimmer + i) * 0.3 + 0.7;
        const gradient = ctx.createRadialGradient(ray.x, ray.y, 0, ray.x, ray.y, ray.size);
        gradient.addColorStop(0, `rgba(255, 253, 208, ${ray.opacity * shimmer})`);
        gradient.addColorStop(1, 'rgba(255, 253, 208, 0)');

        ctx.beginPath();
        ctx.arc(ray.x, ray.y, ray.size, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        ray.y += 0.3 + Math.random() * 0.5;
        ray.x -= 0.1 + Math.random() * 0.2;

        if (ray.y > canvas.height || ray.x < 0) {
          ray.x = canvas.width * (0.7 + Math.random() * 0.3);
          ray.y = Math.random() * canvas.height * 0.1;
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
        opacity: 0.7
      }}
    />
  );
};

const CloudsCanvas = ({ isDark }: { isDark: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    interface Cloud {
      x: number;
      y: number;
      size: number;
      speed: number;
      opacity: number;
      wobble: number;
    }

    const clouds: Cloud[] = [];
    const count = isDark ? 8 : 12;

    for (let i = 0; i < count; i++) {
      clouds.push({
        x: Math.random() * canvas.width,
        y: canvas.height * (0.1 + Math.random() * 0.3),
        size: 60 + Math.random() * 100,
        speed: 0.03 + Math.random() * 0.08,
        opacity: isDark ? (0.15 + Math.random() * 0.2) : (0.08 + Math.random() * 0.12),
        wobble: Math.random() * Math.PI * 2
      });
    }

    let time = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.016;

      clouds.forEach((cloud) => {
        const wobbleX = Math.sin(time * 0.2 + cloud.wobble) * 20;
        const color = isDark ? 'rgba(60, 60, 70' : 'rgba(255, 255, 255';
        
        ctx.fillStyle = `${color}, ${cloud.opacity})`;
        ctx.beginPath();
        ctx.ellipse(cloud.x + wobbleX, cloud.y, cloud.size, cloud.size * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.ellipse(cloud.x + wobbleX - cloud.size * 0.4, cloud.y - cloud.size * 0.1, cloud.size * 0.5, cloud.size * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.ellipse(cloud.x + wobbleX + cloud.size * 0.4, cloud.y - cloud.size * 0.1, cloud.size * 0.5, cloud.size * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();

        cloud.x += cloud.speed;
        if (cloud.x > canvas.width + cloud.size) {
          cloud.x = -cloud.size;
          cloud.y = canvas.height * (0.1 + Math.random() * 0.3);
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
        opacity: 0.8
      }}
    />
  );
};

const FogCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    interface FogLayer {
      x: number;
      y: number;
      width: number;
      height: number;
      speed: number;
      opacity: number;
      wobble: number;
    }

    const fogLayers: FogLayer[] = [];
    const count = 15;

    for (let i = 0; i < count; i++) {
      fogLayers.push({
        x: Math.random() * canvas.width,
        y: canvas.height * (0.3 + Math.random() * 0.7),
        width: 150 + Math.random() * 200,
        height: 80 + Math.random() * 120,
        speed: 0.02 + Math.random() * 0.04,
        opacity: 0.05 + Math.random() * 0.1,
        wobble: Math.random() * Math.PI * 2
      });
    }

    let time = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.016;

      fogLayers.forEach((layer) => {
        const wobbleX = Math.sin(time * 0.15 + layer.wobble) * 30;
        const wobbleY = Math.cos(time * 0.1 + layer.wobble) * 15;

        const gradient = ctx.createRadialGradient(
          layer.x + wobbleX, layer.y + wobbleY, 0,
          layer.x + wobbleX, layer.y + wobbleY, layer.width * 0.8
        );
        gradient.addColorStop(0, `rgba(200, 200, 200, ${layer.opacity})`);
        gradient.addColorStop(1, 'rgba(200, 200, 200, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.ellipse(layer.x + wobbleX, layer.y + wobbleY, layer.width, layer.height, 0, 0, Math.PI * 2);
        ctx.fill();

        layer.x += layer.speed;
        if (layer.x > canvas.width + layer.width) {
          layer.x = -layer.width;
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
        opacity: 0.9
      }}
    />
  );
};

const ParticleEffect = ({ type }: { type: string }) => {
  switch (type) {
    case 'rain':
      return <RainCanvas />;
    case 'snow':
      return <SnowCanvas />;
    case 'sunny':
      return <SunnyCanvas />;
    case 'clouds':
      return <CloudsCanvas isDark={false} />;
    case 'darkclouds':
      return <CloudsCanvas isDark={true} />;
    case 'fog':
      return <FogCanvas />;
    default:
      return null;
  }
};

export const WeatherBackground = ({ weather, temperature, children }: WeatherBackgroundProps) => {
  const [gradient, setGradient] = useState(getGradient(weather, temperature));
  const [particleType, setParticleType] = useState(getParticleType(weather));

  useEffect(() => {
    setGradient(getGradient(weather, temperature));
    setParticleType(getParticleType(weather));
  }, [weather, temperature]);

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        paddingBottom: '20px',
        background: gradient,
        transition: 'background 2s ease-in-out',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {particleType === 'sunny' && (
        <>
          <div
            style={{
              position: 'fixed',
              top: -150,
              right: -150,
              width: 600,
              height: 600,
              background: 'radial-gradient(circle, rgba(255,253,208,0.5) 0%, rgba(255,253,208,0.2) 30%, rgba(255,253,208,0.05) 50%, transparent 70%)',
              pointerEvents: 'none',
              zIndex: 0
            }}
          />
          <div
            style={{
              position: 'fixed',
              top: -50,
              right: -50,
              width: 400,
              height: 400,
              background: 'radial-gradient(circle, rgba(255,248,220,0.3) 0%, transparent 60%)',
              pointerEvents: 'none',
              zIndex: 0,
              animation: 'sunPulse 5s ease-in-out infinite'
            }}
          />
        </>
      )}

      <ParticleEffect type={particleType} />

      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.1) 100%)',
          pointerEvents: 'none',
          zIndex: 2
        }}
      />

      <div style={{ position: 'relative', zIndex: 100 }}>
        {children}
      </div>
    </div>
  );
};
