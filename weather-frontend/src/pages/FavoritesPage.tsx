import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { weatherAPI, favoritesAPI, WeatherData, FavoriteCity } from '../api';
import { Header } from '../components/Header';

const getWeatherIcon = (weather: string): string => {
  const weatherLower = weather.toLowerCase();
  if (weatherLower.includes('clear')) return '☀️';
  if (weatherLower.includes('cloud')) return '☁️';
  if (weatherLower.includes('rain')) return '🌧️';
  if (weatherLower.includes('thunder')) return '⛈️';
  if (weatherLower.includes('snow')) return '❄️';
  return '🌤️';
};

export const FavoritesPage = () => {
  const [favorites, setFavorites] = useState<FavoriteCity[]>([]);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const response = await favoritesAPI.getCities();
      setFavorites(response.data);
    } catch (err) {
      console.error('Failed to load favorites');
    }
  };

  const handleCityClick = async (cityName: string) => {
    setSelectedCity(cityName);
    setLoading(true);
    try {
      const response = await weatherAPI.getWeather(cityName);
      setWeatherData(response.data);
    } catch (err) {
      console.error('Failed to get weather');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (cityName: string) => {
    try {
      await favoritesAPI.deleteCity(cityName);
      await loadFavorites();
      if (selectedCity === cityName) {
        setSelectedCity(null);
        setWeatherData(null);
      }
    } catch (err) {
      console.error('Failed to remove favorite');
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '20px' }}>
      <Header onLogout={handleBack} currentPage="/favorites" onNavigate={navigate} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <div className="card">
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⭐</span> 我的收藏
          </h2>

          {favorites.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <span style={{ fontSize: '64px', display: 'block', marginBottom: '20px' }}>⭐</span>
              <p style={{ fontSize: '18px', color: '#64748b' }}>暂无收藏城市</p>
              <p style={{ color: '#94a3b8', marginTop: '8px' }}>查询天气后点击收藏按钮添加</p>
              <button onClick={handleBack} className="btn-primary" style={{ marginTop: '20px' }}>
                去查询天气
              </button>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
                {favorites.map((item) => (
                  <div 
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: selectedCity === item.city_name ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.1)',
                      borderRadius: '20px',
                      padding: '10px 18px',
                      border: selectedCity === item.city_name ? '2px solid #6366f1' : 'none'
                    }}
                  >
                    <button
                      onClick={() => handleCityClick(item.city_name)}
                      style={{ 
                        background: 'none', 
                        border: 'none',
                        fontSize: '16px',
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
                        width: '26px',
                        height: '26px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ef4444',
                        fontSize: '14px'
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              {selectedCity && weatherData && !loading && (
                <div style={{ 
                  background: 'rgba(0,0,0,0.03)', 
                  borderRadius: '16px', 
                  padding: '25px',
                  marginTop: '20px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '25px', marginBottom: '20px' }}>
                    <span style={{ fontSize: '80px' }}>{getWeatherIcon(weatherData.current.weather)}</span>
                    <div>
                      <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b' }}>{weatherData.city_name}</h3>
                      <p style={{ fontSize: '56px', fontWeight: 'bold', color: '#1e293b', lineHeight: '1' }}>
                        {Math.round(weatherData.current.temperature)}°
                      </p>
                      <p style={{ fontSize: '16px', color: '#64748b' }}>{weatherData.current.weather_description}</p>
                    </div>
                  </div>

                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(4, 1fr)', 
                    gap: '15px',
                    marginBottom: '20px'
                  }}>
                    <div style={{ 
                      background: 'rgba(99, 102, 241, 0.1)', 
                      borderRadius: '12px', 
                      padding: '15px',
                      textAlign: 'center'
                    }}>
                      <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#6366f1' }}>{weatherData.current.humidity}%</p>
                      <p style={{ fontSize: '12px', color: '#64748b' }}>湿度</p>
                    </div>
                    <div style={{ 
                      background: 'rgba(52, 211, 153, 0.1)', 
                      borderRadius: '12px', 
                      padding: '15px',
                      textAlign: 'center'
                    }}>
                      <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#34d399' }}>{weatherData.current.wind_speed} m/s</p>
                      <p style={{ fontSize: '12px', color: '#64748b' }}>风速</p>
                    </div>
                    <div style={{ 
                      background: 'rgba(251, 191, 36, 0.1)', 
                      borderRadius: '12px', 
                      padding: '15px',
                      textAlign: 'center'
                    }}>
                      <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#fbbf24' }}>{weatherData.current.visibility} km</p>
                      <p style={{ fontSize: '12px', color: '#64748b' }}>能见度</p>
                    </div>
                    <div style={{ 
                      background: 'rgba(239, 68, 68, 0.1)', 
                      borderRadius: '12px', 
                      padding: '15px',
                      textAlign: 'center'
                    }}>
                      <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#ef4444' }}>{weatherData.current.pressure} hPa</p>
                      <p style={{ fontSize: '12px', color: '#64748b' }}>气压</p>
                    </div>
                  </div>

                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: '#334155', marginBottom: '12px' }}>📅 未来6天预报</h4>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      {weatherData.forecast.slice(1).map((day, index) => (
                        <div 
                          key={index}
                          style={{ 
                            flex: 1,
                            background: 'rgba(0,0,0,0.05)', 
                            borderRadius: '10px', 
                            padding: '12px',
                            textAlign: 'center'
                          }}
                        >
                          <p style={{ fontSize: '11px', color: '#64748b' }}>
                            {index === 0 ? '明天' : new Date(day.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                          </p>
                          <span style={{ fontSize: '28px' }}>{getWeatherIcon(day.weather)}</span>
                          <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e293b', marginTop: '8px' }}>{Math.round(day.temperature_max)}°</p>
                          <p style={{ fontSize: '11px', color: '#64748b' }}>{Math.round(day.temperature_min)}°</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {selectedCity && loading && (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <div className="loading-spinner" style={{ margin: '0 auto' }} />
                  <p style={{ color: '#64748b', marginTop: '15px' }}>加载天气中...</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};