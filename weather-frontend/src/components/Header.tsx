interface HeaderProps {
  onLogout: () => void;
  currentPage: string;
  onNavigate: (path: string) => void;
}

export const Header = ({ onLogout, currentPage, onNavigate }: HeaderProps) => {
  const navItems = [
    { path: '/', label: '天气查询', icon: '🌤️' },
    { path: '/favorites', label: '收藏城市', icon: '⭐' },
    { path: '/settings', label: '设置', icon: '⚙️' },
  ];

  return (
    <header className="header" style={{ padding: '18px 20px', marginBottom: '20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={() => onNavigate('/')}
          style={{ 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <span style={{ fontSize: '28px' }}>🌤️</span>
          <h1 style={{ fontSize: '22px', fontWeight: '700', margin: 0 }}>天气查询</h1>
        </button>
        
        <nav style={{ display: 'flex', gap: '25px' }}>
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => onNavigate(item.path)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '16px',
                cursor: 'pointer',
                fontWeight: currentPage === item.path ? '700' : '500',
                color: currentPage === item.path ? '#2196F3' : '#444',
                padding: '8px 15px',
                borderRadius: '20px',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        
        <button
          onClick={onLogout}
          className="btn-danger"
          style={{ padding: '8px 20px', fontSize: '14px' }}
        >
          退出登录
        </button>
      </div>
    </header>
  );
};