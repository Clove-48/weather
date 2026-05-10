import { useState, useEffect, useRef } from 'react';

interface StreamAdviceProps {
  city: string;
}

const getTypingSpeed = () => {
  const speeds = [20, 25, 30, 15, 28];
  return speeds[Math.floor(Math.random() * speeds.length)];
};

export const StreamAdvice = ({ city }: StreamAdviceProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [sections, setSections] = useState<{ clothing: string[]; travel: string[]; health: string[] }>({
    clothing: [],
    travel: [],
    health: []
  });
  const [currentTyping, setCurrentTyping] = useState('');
  const [typingSection, setTypingSection] = useState<'clothing' | 'travel' | 'health' | null>(null);
  const fetchRef = useRef<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setIsComplete(false);
    setSections({ clothing: [], travel: [], health: [] });
    setCurrentTyping('');
    setTypingSection(null);

    let isMounted = true;
    const currentFetchId = Date.now().toString();
    fetchRef.current = currentFetchId;

    const typeText = async (text: string) => {
      for (let j = 0; j <= text.length; j++) {
        if (!isMounted || fetchRef.current !== currentFetchId) return;
        setCurrentTyping(text.slice(0, j));
        await new Promise(resolve => setTimeout(resolve, getTypingSpeed()));
      }
    };

    const fetchAdvice = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/weather/advice?city=${encodeURIComponent(city)}`);
        const data = await response.json();
        
        if (!isMounted || fetchRef.current !== currentFetchId) return;
        
        if (data.structured_advice) {
          const seen = { clothing: new Set<string>(), travel: new Set<string>(), health: new Set<string>() };
          const structured = data.structured_advice;
          
          const sectionOrder: Array<{ key: 'clothing' | 'travel' | 'health'; label: string }> = [
            { key: 'clothing', label: 'clothing' },
            { key: 'travel', label: 'travel' },
            { key: 'health', label: 'health' }
          ];
          
          for (const { key } of sectionOrder) {
            if (!isMounted || fetchRef.current !== currentFetchId) return;
            
            const items = structured[key];
            if (!items || items.length === 0) continue;
            
            setTypingSection(key);
            await new Promise(resolve => setTimeout(resolve, 500));
            
            for (let i = 0; i < items.length; i++) {
              if (!isMounted || fetchRef.current !== currentFetchId) return;
              
              const item = items[i];
              const normalized = item.trim();
              
              if (seen[key].has(normalized)) continue;
              seen[key].add(normalized);
              
              await typeText(item);
              
              await new Promise(resolve => setTimeout(resolve, 300));
              if (!isMounted || fetchRef.current !== currentFetchId) return;
              setSections(prev => ({
                ...prev,
                [key]: [...prev[key], item]
              }));
              setCurrentTyping('');
              
              await new Promise(resolve => setTimeout(resolve, 200));
            }
          }
          
          setIsComplete(true);
          setIsLoading(false);
          setTypingSection(null);
        }
      } catch (error) {
        console.error('Error fetching advice:', error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchAdvice();

    return () => {
      isMounted = false;
      fetchRef.current = null;
    };
  }, [city]);

  if (isLoading && !isComplete) {
    return (
      <div style={{ textAlign: 'center', padding: '30px' }}>
        <div className="loading-spinner" style={{ margin: '0 auto 15px' }} />
        <p style={{ color: '#64748b', fontSize: '16px' }}>
          AI 正在分析天气数据
          <span style={{ animation: 'blink 1s infinite' }}>.</span>
          <span style={{ animation: 'blink 1s infinite 0.2s' }}>.</span>
          <span style={{ animation: 'blink 1s infinite 0.4s' }}>.</span>
        </p>
      </div>
    );
  }

  const renderSection = (key: 'clothing' | 'travel' | 'health', icon: string, title: string, color: string) => {
    const isActive = typingSection === key;
    const items = sections[key];
    const hasItems = items.length > 0;
    const isTypingHere = isActive && !isComplete;
    
    const uniqueItems = [...new Set(items)];

    return (
      <div style={{ marginBottom: '24px', animation: 'fadeIn 0.5s ease-out' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <span style={{ fontSize: '28px', animation: 'bounce 1s infinite' }}>{icon}</span>
          <h4 style={{ fontSize: '18px', fontWeight: 'bold', color: color }}>{title}</h4>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {hasItems && uniqueItems.map((item, index) => (
            <div 
              key={`${key}-${index}-${item.substring(0, 20)}`}
              style={{
                animation: `slideIn 0.4s ease-out ${index * 0.1}s both`,
                opacity: 0,
                transform: 'translateX(-20px)'
              }}
            >
              <p style={{ 
                fontSize: '15px', 
                color: '#334155', 
                lineHeight: '1.8',
                padding: '14px 18px',
                background: `linear-gradient(135deg, ${color}0d 0%, ${color}15 100%)`,
                borderRadius: '12px',
                margin: 0,
                position: 'relative',
                paddingLeft: '40px',
                borderLeft: `3px solid ${color}`
              }}>
                <span style={{ 
                  position: 'absolute', 
                  left: '14px', 
                  color: color,
                  fontWeight: 'bold',
                  fontSize: '16px'
                }}>✓</span>
                {item}
              </p>
            </div>
          ))}
          {isTypingHere && (
            <div style={{ animation: 'slideIn 0.3s ease-out both' }}>
              <p style={{ 
                fontSize: '15px', 
                color: '#334155', 
                padding: '14px 18px',
                background: `linear-gradient(135deg, ${color}0d 0%, ${color}15 100%)`,
                borderRadius: '12px',
                margin: 0,
                paddingLeft: '40px',
                position: 'relative',
                borderLeft: `3px solid ${color}`,
                borderStyle: 'dashed'
              }}>
                <span style={{ 
                  position: 'absolute', 
                  left: '14px', 
                  color: color,
                  fontWeight: 'bold',
                  fontSize: '16px'
                }}>✓</span>
                {currentTyping}
                <span style={{ 
                  animation: 'blink 0.8s infinite', 
                  color: color,
                  fontWeight: 'bold'
                }}>|</span>
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      {renderSection('clothing', '👕', '穿衣建议', '#6366f1')}
      {renderSection('travel', '🚶', '出行建议', '#34d399')}
      {renderSection('health', '❤️', '健康提示', '#ef4444')}
    </div>
  );
};