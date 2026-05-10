import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { settingsAPI } from '../api';
import { Header } from '../components/Header';

export const SettingsPage = () => {
  const [temperatureUnit, setTemperatureUnit] = useState('metric');
  const [theme, setTheme] = useState('light');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { settings, updateSettings } = useSettings();

  useEffect(() => {
    if (settings) {
      setTemperatureUnit(settings.temperature_unit);
      setTheme(settings.theme);
    }
  }, [settings]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await settingsAPI.updateSettings({ temperature_unit: temperatureUnit, theme });
      updateSettings({ temperature_unit: temperatureUnit, theme });
      setMessage('设置已保存');
      setTimeout(() => setMessage(''), 2000);
    } catch (err) {
      setMessage('保存失败');
      setTimeout(() => setMessage(''), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '20px' }}>
      <Header onLogout={handleLogout} currentPage="/settings" onNavigate={navigate} />

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        <div className="card">
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', marginBottom: '30px' }}>
            ⚙️ 设置
          </h2>

          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#334155', marginBottom: '15px' }}>
              🌡️ 温度单位
            </h3>
            <div style={{ display: 'flex', gap: '15px' }}>
              <button
                onClick={() => setTemperatureUnit('metric')}
                className="btn-primary"
                style={{
                  flex: 1,
                  background: temperatureUnit === 'metric' 
                    ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' 
                    : 'rgba(99, 102, 241, 0.1)',
                  color: temperatureUnit === 'metric' ? 'white' : '#6366f1'
                }}
              >
                °C (摄氏度)
              </button>
              <button
                onClick={() => setTemperatureUnit('imperial')}
                className="btn-primary"
                style={{
                  flex: 1,
                  background: temperatureUnit === 'imperial' 
                    ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' 
                    : 'rgba(99, 102, 241, 0.1)',
                  color: temperatureUnit === 'imperial' ? 'white' : '#6366f1'
                }}
              >
                °F (华氏度)
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#334155', marginBottom: '15px' }}>
              🎨 主题模式
            </h3>
            <div style={{ display: 'flex', gap: '15px' }}>
              <button
                onClick={() => setTheme('light')}
                className="btn-primary"
                style={{
                  flex: 1,
                  background: theme === 'light' 
                    ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' 
                    : 'rgba(99, 102, 241, 0.1)',
                  color: theme === 'light' ? 'white' : '#6366f1'
                }}
              >
                ☀️ 亮色
              </button>
              <button
                onClick={() => setTheme('dark')}
                className="btn-primary"
                style={{
                  flex: 1,
                  background: theme === 'dark' 
                    ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' 
                    : 'rgba(99, 102, 241, 0.1)',
                  color: theme === 'dark' ? 'white' : '#6366f1'
                }}
              >
                🌙 暗色
              </button>
            </div>
          </div>

          {message && (
            <div style={{ 
              background: message === '设置已保存' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
              color: message === '设置已保存' ? '#4CAF50' : '#f44336',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              {message}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%' }}
          >
            {loading ? '保存中...' : '保存设置'}
          </button>

          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              marginTop: '15px',
              padding: '14px',
              borderRadius: '12px',
              border: 'none',
              background: 'rgba(244, 67, 54, 0.1)',
              color: '#f44336',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            🚪 退出登录
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: '30px', color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
          <p>天气查询 v1.0.0</p>
          <p style={{ marginTop: '5px' }}>支持全国300+城市</p>
        </div>
      </div>
    </div>
  );
};