import { useState, useEffect, useRef } from 'react';

interface DesktopPetProps {
  weather: string;
  temperature?: number;
}

interface PetState {
  mood: string;
  action: string;
  baseEmoji: string;
}

const getPetState = (weather: string, temperature?: number): PetState => {
  const w = weather.toLowerCase();
  const temp = temperature || 20;

  if (w.includes('clear') || w.includes('sunny') || w.includes('晴')) {
    if (temp >= 35) return { mood: 'hot', action: 'panting', baseEmoji: '😸' };
    if (temp >= 30) return { mood: 'warm', action: 'relaxing', baseEmoji: '😺' };
    if (temp >= 20) return { mood: 'happy', action: 'playing', baseEmoji: '😻' };
    return { mood: 'content', action: 'sitting', baseEmoji: '😽' };
  }

  if (w.includes('cloud') || w.includes('多云') || w.includes('阴')) {
    return { mood: 'bored', action: 'looking', baseEmoji: '😿' };
  }

  if (w.includes('rain') || w.includes('雨')) {
    if (w.includes('thunder') || w.includes('雷')) {
      return { mood: 'scared', action: 'hiding', baseEmoji: '🙀' };
    }
    return { mood: 'sad', action: 'waiting', baseEmoji: '😹' };
  }

  if (w.includes('snow') || w.includes('雪')) {
    return { mood: 'excited', action: 'playing_in_snow', baseEmoji: '😼' };
  }

  if (w.includes('fog') || w.includes('雾') || w.includes('霾')) {
    return { mood: 'confused', action: 'sniffing', baseEmoji: '🐱' };
  }

  return { mood: 'normal', action: 'idle', baseEmoji: '🐱' };
};

const getActionAnimation = (action: string) => {
  switch (action) {
    case 'playing':
      return { animation: 'petBounce 0.6s ease-in-out infinite' };
    case 'panting':
      return { animation: 'petPulse 0.3s ease-in-out infinite' };
    case 'relaxing':
      return { animation: 'petSwing 3s ease-in-out infinite' };
    case 'looking':
      return { animation: 'petHeadBob 2s ease-in-out infinite' };
    case 'waiting':
      return { animation: 'petTailWag 1s ease-in-out infinite' };
    case 'hiding':
      return { animation: 'petShake 0.4s ease-in-out infinite' };
    case 'playing_in_snow':
      return { animation: 'petSnowJump 1.2s ease-in-out infinite' };
    case 'sniffing':
      return { animation: 'petSniff 0.7s ease-in-out infinite' };
    case 'sitting':
      return { animation: 'petBreath 3s ease-in-out infinite' };
    default:
      return { animation: 'petIdle 4s ease-in-out infinite' };
  }
};

const getWeatherAccessory = (weather: string) => {
  const w = weather.toLowerCase();
  if (w.includes('rain') || w.includes('雨')) return { emoji: '☂️', name: '雨伞', color: '#3b82f6' };
  if (w.includes('snow') || w.includes('雪')) return { emoji: '🎿', name: '滑雪板', color: '#8b5cf6' };
  if (w.includes('thunder') || w.includes('雷')) return { emoji: '🧣', name: '围巾', color: '#ef4444' };
  if (w.includes('clear') || w.includes('sunny') || w.includes('晴')) return { emoji: '🕶️', name: '墨镜', color: '#1e293b' };
  if (w.includes('fog') || w.includes('雾')) return { emoji: '🔍', name: '放大镜', color: '#f59e0b' };
  return null;
};

const getMoodColors = (mood: string) => {
  const colors: Record<string, { bg: string; glow: string; border: string }> = {
    happy: { bg: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', glow: 'rgba(251, 191, 36, 0.5)', border: '#f59e0b' },
    warm: { bg: 'linear-gradient(135deg, #fed7aa 0%, #fdba74 100%)', glow: 'rgba(251, 146, 60, 0.5)', border: '#fb923c' },
    hot: { bg: 'linear-gradient(135deg, #fecaca 0%, #f87171 100%)', glow: 'rgba(239, 68, 68, 0.5)', border: '#ef4444' },
    content: { bg: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)', glow: 'rgba(34, 197, 94, 0.5)', border: '#22c55e' },
    bored: { bg: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)', glow: 'rgba(148, 163, 184, 0.5)', border: '#94a3b8' },
    sad: { bg: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', glow: 'rgba(59, 130, 246, 0.5)', border: '#3b82f6' },
    scared: { bg: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)', glow: 'rgba(236, 72, 153, 0.5)', border: '#ec4899' },
    excited: { bg: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)', glow: 'rgba(99, 102, 241, 0.5)', border: '#6366f1' },
    confused: { bg: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', glow: 'rgba(251, 191, 36, 0.5)', border: '#f59e0b' },
    normal: { bg: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)', glow: 'rgba(148, 163, 184, 0.5)', border: '#94a3b8' }
  };
  return colors[mood] || colors.normal;
};

const getMoodMessage = (mood: string, weather: string, temperature?: number) => {
  const messages: Record<string, string[]> = {
    happy: ['今天天气真好！☀️', '好想出去玩~', '主人陪我玩吧！', '阳光太温暖啦！'],
    warm: ['有点热呢...', '找个阴凉处乘凉吧', '想喝冰水~'],
    hot: ['好热啊！💦', '快融化了...', '空调在哪里？'],
    content: ['今天心情不错', '晒太阳真舒服', '喵~', '生活真美好'],
    bored: ['有点无聊...', '什么时候出太阳呢？', '发呆中...', '好无趣啊'],
    sad: ['下雨了，不能出去玩', '好想出去踩水', '🌧️', '下雨天好寂寞'],
    scared: ['好可怕的雷声！', '躲起来躲起来', '主人保护我！', '害怕...'],
    excited: ['下雪啦！❄️', '堆雪人去！', '好开心！', '打雪仗吧！'],
    confused: ['雾好大啊...', '看不见路了', '谁在那里？', '迷路了...'],
    normal: ['喵~', '今天也很可爱', '主人好~', '咕噜咕噜']
  };
  const moodMessages = messages[mood] || messages.normal;
  const msg = moodMessages[Math.floor(Math.random() * moodMessages.length)];
  
  if (temperature && (mood === 'hot' || mood === 'warm')) {
    return `${msg} 当前温度: ${temperature}°C`;
  }
  if (weather.includes('雨') || weather.includes('rain')) {
    return `${msg} 记得带伞哦！`;
  }
  if (weather.includes('雪') || weather.includes('snow')) {
    return `${msg} 注意保暖！`;
  }
  return msg;
};

const petCharacters = [
  { id: 'cat', emoji: '🐱', name: '小猫', description: '可爱的小猫咪' },
  { id: 'dog', emoji: '🐶', name: '小狗', description: '忠诚的小狗' },
  { id: 'rabbit', emoji: '🐰', name: '兔子', description: '萌萌的小兔子' },
  { id: 'fox', emoji: '🦊', name: '狐狸', description: '聪明的小狐狸' },
  { id: 'bear', emoji: '🐻', name: '小熊', description: '憨厚的小熊' },
  { id: 'panda', emoji: '🐼', name: '熊猫', description: '国宝大熊猫' },
  { id: 'koala', emoji: '🐨', name: '考拉', description: '懒懒的考拉' },
  { id: 'lion', emoji: '🦁', name: '狮子', description: '威武的狮子' },
  { id: 'tiger', emoji: '🐯', name: '老虎', description: '凶猛的老虎' },
  { id: 'cow', emoji: '🐮', name: '奶牛', description: '萌萌的奶牛' },
  { id: 'frog', emoji: '🐸', name: '青蛙', description: '可爱的青蛙' },
  { id: 'monkey', emoji: '🐵', name: '猴子', description: '调皮的猴子' }
];

export const DesktopPet = ({ weather, temperature }: DesktopPetProps) => {
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showDialog, setShowDialog] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState(petCharacters[0]);
  const [isDoubleClick, setIsDoubleClick] = useState(false);
  const lastClickTime = useRef(0);
  const petRef = useRef<HTMLDivElement>(null);

  const petState = getPetState(weather, temperature);
  const animation = getActionAnimation(petState.action);
  const accessory = getWeatherAccessory(weather);
  const moodColors = getMoodColors(petState.mood);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      setIsDoubleClick(false);
      setPosition({
        x: Math.max(20, Math.min(window.innerWidth - 100, e.clientX - dragOffset.x)),
        y: Math.max(20, Math.min(window.innerHeight - 140, e.clientY - dragOffset.y))
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const currentTime = Date.now();
    const timeSinceLastClick = currentTime - lastClickTime.current;
    
    if (timeSinceLastClick < 300) {
      setIsDoubleClick(true);
    } else {
      setIsDoubleClick(false);
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
    
    lastClickTime.current = currentTime;
    e.preventDefault();
  };

  const handleDoubleClick = () => {
    if (!isDragging && isDoubleClick) {
      setShowDialog(true);
    }
  };

  const handleCustomize = () => {
    setShowDialog(false);
  };

  return (
    <>
      <style>{`
        @keyframes petBounce {
          0%, 100% { transform: translateY(0) rotate(-5deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes petPulse {
          0%, 100% { transform: scale(1); filter: brightness(1); }
          50% { transform: scale(1.05); filter: brightness(1.1); }
        }
        @keyframes petSwing {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }
        @keyframes petHeadBob {
          0%, 100% { transform: rotate(-8deg) translateY(0); }
          50% { transform: rotate(8deg) translateY(-5px); }
        }
        @keyframes petTailWag {
          0%, 100% { transform: rotate(-15deg); }
          50% { transform: rotate(15deg); }
        }
        @keyframes petShake {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          25% { transform: translateX(-8px) rotate(-5deg); }
          75% { transform: translateX(8px) rotate(5deg); }
        }
        @keyframes petSnowJump {
          0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
          25% { transform: translateY(-25px) rotate(-15deg) scale(1.1); }
          50% { transform: translateY(-15px) rotate(15deg) scale(0.95); }
          75% { transform: translateY(-20px) rotate(-10deg) scale(1.05); }
        }
        @keyframes petSniff {
          0%, 100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.1) translateY(-3px); }
        }
        @keyframes petBreath {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.98); }
        }
        @keyframes petIdle {
          0%, 100% { transform: rotate(-3deg) translateY(0); }
          50% { transform: rotate(3deg) translateY(-3px); }
        }
        @keyframes speechBubble {
          0% { opacity: 0; transform: translateX(-50%) translateY(10px) scale(0.8); }
          30% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
          70% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-5px) scale(0.9); }
        }
        @keyframes accessoryFloat {
          0%, 100% { transform: rotate(-10deg) translateX(0); }
          50% { transform: rotate(10deg) translateX(5px); }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 20px var(--glow-color), 0 0 40px var(--glow-color); }
          50% { box-shadow: 0 0 30px var(--glow-color), 0 0 60px var(--glow-color); }
        }
      `}</style>

      <div
        ref={petRef}
        onClick={handleDoubleClick}
        onMouseDown={handleMouseDown}
        style={{
          position: 'fixed',
          left: position.x,
          top: position.y,
          zIndex: 1000,
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: moodColors.bg,
            borderRadius: '25px',
            padding: '20px 25px',
            boxShadow: `0 10px 40px ${moodColors.glow}, 0 4px 15px rgba(0,0,0,0.1)`,
            border: `3px solid ${moodColors.border}`,
            transform: 'perspective(1000px) rotateX(5deg)',
            transition: 'all 0.3s ease',
            minWidth: '80px',
            ...animation
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-15px',
              right: '-15px',
              fontSize: '32px',
              animation: accessory ? 'accessoryFloat 2s ease-in-out infinite' : 'none',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
            }}
          >
            {accessory?.emoji}
          </div>

          <div
            style={{
              fontSize: '60px',
              lineHeight: '1',
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
              transform: 'translateZ(20px)'
            }}
          >
            {selectedCharacter.emoji}
          </div>

          <div
            style={{
              marginTop: '-5px',
              fontSize: '13px',
              fontWeight: '700',
              color: '#374151',
              textTransform: 'capitalize',
              letterSpacing: '0.5px'
            }}
          >
            {petState.mood === 'happy' && '😊 开心'}
            {petState.mood === 'warm' && '🥵 微热'}
            {petState.mood === 'hot' && '🔥 炎热'}
            {petState.mood === 'content' && '🥰 满足'}
            {petState.mood === 'bored' && '😴 无聊'}
            {petState.mood === 'sad' && '😢 悲伤'}
            {petState.mood === 'scared' && '😱 害怕'}
            {petState.mood === 'excited' && '🤩 兴奋'}
            {petState.mood === 'confused' && '😕 困惑'}
            {petState.mood === 'normal' && '🐾 平常'}
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: '-60px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '25px',
            fontSize: '14px',
            fontWeight: '500',
            whiteSpace: 'nowrap',
            boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
            animation: 'speechBubble 4s ease-in-out infinite',
            maxWidth: '200px',
            wordBreak: 'break-word'
          }}
        >
          <span style={{ fontSize: '16px', marginRight: '5px' }}>💬</span>
          {getMoodMessage(petState.mood, weather, temperature)}
          <div
            style={{
              position: 'absolute',
              top: '-8px',
              left: '50%',
              transform: 'translateX(-50%) rotate(45deg)',
              width: '12px',
              height: '12px',
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)'
            }}
          />
        </div>
      </div>

      {showDialog && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            backdropFilter: 'blur(8px)'
          }}
          onClick={() => setShowDialog(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '24px',
              padding: '35px',
              minWidth: '400px',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 25px 80px rgba(0,0,0,0.35)',
              animation: 'fadeIn 0.3s ease'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px' }}>
              <div style={{ fontSize: '32px' }}>🐾</div>
              <div>
                <h3 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e293b', margin: '0' }}>
                  选择你的宠物伙伴
                </h3>
                <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0 0' }}>
                  双击宠物即可更换形象
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '25px' }}>
              {petCharacters.map((character) => (
                <button
                  key={character.id}
                  onClick={() => setSelectedCharacter(character)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '15px',
                    borderRadius: '16px',
                    border: selectedCharacter.id === character.id 
                      ? '3px solid #6366f1' 
                      : '2px solid #e2e8f0',
                    background: selectedCharacter.id === character.id 
                      ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)' 
                      : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    transform: selectedCharacter.id === character.id ? 'scale(1.05)' : 'scale(1)'
                  }}
                >
                  <span style={{ fontSize: '36px', marginBottom: '8px' }}>{character.emoji}</span>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>{character.name}</span>
                </button>
              ))}
            </div>

            <div
              style={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                borderRadius: '12px',
                padding: '15px',
                marginBottom: '25px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '28px' }}>{selectedCharacter.emoji}</span>
                <div>
                  <p style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', margin: '0' }}>
                    {selectedCharacter.name}
                  </p>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: '3px 0 0 0' }}>
                    {selectedCharacter.description}
                  </p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
              <button
                onClick={() => setShowDialog(false)}
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '14px',
                  border: '2px solid #e2e8f0',
                  background: 'white',
                  color: '#64748b',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                取消
              </button>
              <button
                onClick={handleCustomize}
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '14px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  color: 'white',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
                  transition: 'all 0.2s'
                }}
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
