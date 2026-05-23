import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { weatherAPI, favoritesAPI, roleplayAPI, WeatherData, FavoriteCity, RoleplayCharacter, RoleplayResponse } from '../api';
import { Header } from '../components/Header';
import { StreamAdvice } from '../components/StreamAdvice';
import { WeatherBackground } from '../components/WeatherBackground';
import { DesktopPet3D } from '../components/DesktopPet3D';

const getWeatherIcon = (weather: string, weatherDescription?: string): string => {
  const weatherLower = weather.toLowerCase();
  const descLower = weatherDescription?.toLowerCase() || '';
  
  if (weatherLower.includes('clear') || descLower.includes('晴')) return '☀️';
  if (weatherLower.includes('snow') || descLower.includes('雪')) return '❄️';
  if (weatherLower.includes('thunder') || descLower.includes('雷')) return '⛈️';
  if (weatherLower.includes('rain') || descLower.includes('雨')) return '🌧️';
  if (weatherLower.includes('cloud') || descLower.includes('云') || descLower.includes('阴')) return '☁️';
  return '🌤️';
};

export const WeatherPage = () => {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [favorites, setFavorites] = useState<FavoriteCity[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAddingFavorite, setIsAddingFavorite] = useState(false);
  
  const [characters, setCharacters] = useState<RoleplayCharacter[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<string>('cat');
  const [roleplayResponse, setRoleplayResponse] = useState<RoleplayResponse | null>(null);
  const [roleplayLoading, setRoleplayLoading] = useState(false);
  const [customRoleplay, setCustomRoleplay] = useState('');
  
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    loadFavorites();
    loadCharacters();
  }, []);

  const loadFavorites = async () => {
    try {
      const response = await favoritesAPI.getCities();
      setFavorites(response.data);
    } catch (err) {
      console.error('Failed to load favorites');
    }
  };

  const loadCharacters = async () => {
    try {
      const response = await roleplayAPI.getCharacters();
      setCharacters(response.data);
    } catch (err) {
      console.error('Failed to load characters');
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim()) return;
    
    setError('');
    setLoading(true);
    setWeatherData(null);
    setRoleplayResponse(null);

    try {
      const response = await weatherAPI.getWeather(city.trim());
      const weatherData = response.data;
      setWeatherData(weatherData);
      
      await handleRoleplayWithCharacter('cat', weatherData.city_name);
    } catch (err) {
      setError('无法获取天气数据，请检查城市名称是否正确');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFavorite = async () => {
    if (!weatherData) return;
    
    setIsAddingFavorite(true);
    try {
      await favoritesAPI.addCity(weatherData.city_name);
      await loadFavorites();
    } catch (err) {
      console.error('Failed to add favorite');
    } finally {
      setIsAddingFavorite(false);
    }
  };

  const handleRemoveFavorite = async (cityName: string) => {
    try {
      await favoritesAPI.deleteCity(cityName);
      await loadFavorites();
    } catch (err) {
      console.error('Failed to remove favorite');
    }
  };

  const handleFavoriteClick = async (cityName: string) => {
    setCity(cityName);
    setError('');
    setLoading(true);
    setWeatherData(null);
    setRoleplayResponse(null);

    try {
      const response = await weatherAPI.getWeather(cityName.trim());
      const weatherData = response.data;
      setWeatherData(weatherData);
      
      await handleRoleplayWithCharacter('cat', weatherData.city_name);
    } catch (err) {
      setError('无法获取天气数据，请检查城市名称是否正确');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleplay = async () => {
    if (!weatherData) return;
    
    setRoleplayLoading(true);
    try {
      const response = await roleplayAPI.getRoleplay({
        city: weatherData.city_name,
        character: customRoleplay || selectedCharacter
      });
      setRoleplayResponse(response.data);
    } catch (err) {
      console.error('Failed to get roleplay');
    } finally {
      setRoleplayLoading(false);
    }
  };

  const handleRoleplayWithCharacter = async (characterId: string, cityName?: string) => {
    const city = cityName || weatherData?.city_name;
    if (!city) return;
    
    setRoleplayLoading(true);
    try {
      const response = await roleplayAPI.getRoleplay({
        city: city,
        character: characterId
      });
      setRoleplayResponse(response.data);
      setSelectedCharacter(characterId);
    } catch (err) {
      console.error('Failed to get roleplay');
    } finally {
      setRoleplayLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <WeatherBackground 
      weather={weatherData?.current.weather || 'clear'} 
      temperature={weatherData?.current.temperature}
    >
      <Header onLogout={handleLogout} currentPage="/" onNavigate={navigate} />
      
      {weatherData && (
        <DesktopPet3D 
          weather={weatherData.current.weather_description}
          temperature={weatherData.current.temperature}
        />
      )}

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
            🌤️ 智能天气查询
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)' }}>
            支持全国300+城市，AI为您提供专业的生活建议
          </p>
        </div>

        <form onSubmit={handleSearch} className="animate-fadeIn" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '12px', maxWidth: '600px', margin: '0 auto' }}>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="输入城市名或省份名..."
              style={{ flex: 1, fontSize: '18px' }}
            />
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? '查询中...' : '查询天气'}
            </button>
          </div>
        </form>

        {error && (
          <div style={{ 
            background: 'rgba(244, 67, 54, 0.9)', 
            color: 'white', 
            padding: '16px 20px', 
            borderRadius: '12px',
            maxWidth: '600px',
            margin: '0 auto 20px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {favorites.length > 0 && (
          <div className="card animate-fadeIn" style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>⭐</span> 我的收藏
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {favorites.filter((item, index, self) => {
                const baseName = item.city_name.toLowerCase().replace(/\s+city$/i, '');
                return self.findIndex(f => 
                  f.city_name.toLowerCase().replace(/\s+city$/i, '') === baseName
                ) === index;
              }).map((item) => (
                <div 
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'rgba(99, 102, 241, 0.1)',
                    borderRadius: '20px',
                    padding: '8px 16px'
                  }}
                >
                  <button
                    onClick={() => handleFavoriteClick(item.city_name)}
                    style={{ 
                      background: 'none', 
                      border: 'none',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#6366f1'
                    }}
                  >
                    {item.city_name}
                  </button>
                  <button
                    onClick={() => handleRemoveFavorite(item.city_name)}
                    style={{ 
                      background: 'rgba(239, 68, 68, 0.1)', 
                      border: 'none',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ef4444',
                      fontSize: '12px'
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {weatherData && (
          <div className="card animate-fadeIn" style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
              <div>
                <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1e293b' }}>
                  {weatherData.city_name}
                </h2>
                <p style={{ color: '#64748b', marginTop: '5px' }}>
                  {new Date().toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <button
                onClick={handleAddFavorite}
                disabled={isAddingFavorite || favorites.some(f => f.city_name === weatherData.city_name)}
                className="btn-secondary"
                style={{
                  background: favorites.some(f => f.city_name === weatherData.city_name) 
                    ? 'rgba(200, 200, 200, 0.3)' 
                    : 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
                  color: favorites.some(f => f.city_name === weatherData.city_name) ? '#999' : 'white'
                }}
              >
                {favorites.some(f => f.city_name === weatherData.city_name) ? '★ 已收藏' : '☆ 收藏城市'}
              </button>
            </div>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '30px', 
              padding: '30px',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)',
              borderRadius: '16px',
              marginBottom: '30px'
            }}>
              <span style={{ fontSize: '100px' }}>{getWeatherIcon(weatherData.current.weather, weatherData.current.weather_description)}</span>
              <div>
                <p className="temperature" style={{ fontSize: '80px', fontWeight: 'bold', color: '#1e293b', lineHeight: '1' }}>
                  {Math.round(weatherData.current.temperature)}°
                </p>
                <p style={{ fontSize: '20px', color: '#475569', marginTop: '10px' }}>
                  {weatherData.current.weather_description}
                </p>
              </div>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(4, 1fr)', 
              gap: '20px',
              marginBottom: '30px'
            }}>
              <div style={{ 
                background: 'rgba(99, 102, 241, 0.1)', 
                borderRadius: '16px', 
                padding: '20px',
                textAlign: 'center'
              }}>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#6366f1' }}>
                  {weatherData.current.humidity}%
                </p>
                <p style={{ fontSize: '14px', color: '#64748b', marginTop: '5px' }}>湿度</p>
              </div>
              <div style={{ 
                background: 'rgba(52, 211, 153, 0.1)', 
                borderRadius: '16px', 
                padding: '20px',
                textAlign: 'center'
              }}>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#34d399' }}>
                  {weatherData.current.wind_speed} m/s
                </p>
                <p style={{ fontSize: '14px', color: '#64748b', marginTop: '5px' }}>风速</p>
              </div>
              <div style={{ 
                background: 'rgba(251, 191, 36, 0.1)', 
                borderRadius: '16px', 
                padding: '20px',
                textAlign: 'center'
              }}>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#fbbf24' }}>
                  {weatherData.current.visibility} km
                </p>
                <p style={{ fontSize: '14px', color: '#64748b', marginTop: '5px' }}>能见度</p>
              </div>
              <div style={{ 
                background: 'rgba(239, 68, 68, 0.1)', 
                borderRadius: '16px', 
                padding: '20px',
                textAlign: 'center'
              }}>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#ef4444' }}>
                  {weatherData.current.pressure} hPa
                </p>
                <p style={{ fontSize: '14px', color: '#64748b', marginTop: '5px' }}>气压</p>
              </div>
            </div>

            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📅</span> 未来6天预报
              </h3>
              <div style={{ display: 'flex', gap: '15px' }}>
                {weatherData.forecast.slice(0, 7).map((day, index) => (
                  <div 
                    key={index}
                    style={{ 
                      flex: 1,
                      background: 'rgba(0,0,0,0.05)', 
                      borderRadius: '12px', 
                      padding: '15px',
                      textAlign: 'center'
                    }}
                  >
                    <p style={{ fontSize: '12px', color: '#64748b' }}>
                      {index === 0 ? '今天' : index === 1 ? '明天' : new Date(day.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                    </p>
                    <span style={{ fontSize: '32px' }}>{getWeatherIcon(day.weather, day.weather_description)}</span>
                    <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e293b', marginTop: '10px' }}>
                      {Math.round(day.temperature_max)}°
                    </p>
                    <p style={{ fontSize: '12px', color: '#64748b' }}>
                      {Math.round(day.temperature_min)}°
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="ai-advice-card">
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🤖</span> AI 智能建议
              </h3>
              <StreamAdvice city={weatherData.city_name} />
            </div>

            <div style={{ marginTop: '30px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🎭</span> 天气角色扮演播报
              </h3>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '15px' }}>
                {characters.map((char) => (
                  <button
                    key={char.id}
                    onClick={() => {
                      setSelectedCharacter(char.id);
                      setCustomRoleplay('');
                      handleRoleplayWithCharacter(char.id);
                    }}
                    disabled={roleplayLoading}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '25px',
                      border: 'none',
                      background: selectedCharacter === char.id && !customRoleplay
                        ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                        : 'rgba(99, 102, 241, 0.1)',
                      color: selectedCharacter === char.id && !customRoleplay ? 'white' : '#6366f1',
                      fontSize: '14px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      opacity: roleplayLoading ? 0.6 : 1,
                      cursor: roleplayLoading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <span>{char.emoji}</span>
                    {char.name}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '12px', marginBottom: '15px' }}>
                <input
                  type="text"
                  value={customRoleplay}
                  onChange={(e) => {
                    setCustomRoleplay(e.target.value);
                    setSelectedCharacter('custom');
                  }}
                  placeholder="输入自定义角色描述..."
                  style={{ flex: 1 }}
                />
                <button onClick={handleRoleplay} disabled={roleplayLoading} className="btn-primary">
                  {roleplayLoading ? '生成中...' : '生成播报'}
                </button>
              </div>

              {roleplayResponse && (
                <div style={{ 
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
                  borderRadius: '16px',
                  padding: '20px',
                  borderLeft: '4px solid #6366f1'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '28px' }}>
                      {characters.find(c => c.id === roleplayResponse.character)?.emoji || '🎭'}
                    </span>
                    <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: '#6366f1' }}>
                      {characters.find(c => c.id === roleplayResponse.character)?.name || '自定义角色'}
                    </h4>
                  </div>
                  <p style={{ fontSize: '16px', color: '#334155', lineHeight: '1.8' }}>
                    {roleplayResponse.response}
                  </p>
                </div>
              )}
            </div>

            </div>
        )}
      </div>
    </WeatherBackground>
  );
};