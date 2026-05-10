import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  responseType: 'json',
  responseEncoding: 'utf8',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export interface User {
  id: number;
  username: string;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface FavoriteCity {
  id: number;
  city_name: string;
  city_code: string | null;
  created_at: string;
}

export interface WeatherCurrent {
  temperature: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  wind_direction: number;
  weather: string;
  weather_description: string;
  icon: string;
  sunrise: string;
  sunset: string;
  visibility: number;
  pressure: number;
}

export interface WeatherForecastDay {
  date: string;
  temperature_min: number;
  temperature_max: number;
  weather: string;
  weather_description: string;
  icon: string;
  humidity: number;
  wind_speed: number;
}

export interface WeatherData {
  city_name: string;
  country: string;
  current: WeatherCurrent;
  forecast: WeatherForecastDay[];
}

export interface WeatherAdvice {
  city: string;
  advice: string;
  structured_advice: StructuredAdvice;
}

export interface StructuredAdvice {
  clothing: string[];
  travel: string[];
  health: string[];
}

export interface RoleplayCharacter {
  id: string;
  name: string;
  emoji: string;
}

export interface RoleplayResponse {
  city: string;
  character: string;
  response: string;
}

export interface UserSettings {
  temperature_unit: string;
  theme: string;
}

export const authAPI = {
  register: (username: string, password: string) =>
    api.post<User>('/register', { username, password }),
  
  login: (username: string, password: string) =>
    api.post<TokenResponse>('/login', new URLSearchParams({ username, password })),
  
  getUserInfo: () => api.get<User>('/user/info'),
};

export const weatherAPI = {
  getWeather: (city: string) => api.get<WeatherData>('/weather/current', { params: { city } }),
  getAdvice: (city: string) => api.get<WeatherAdvice>('/weather/advice', { params: { city } }),
};

export const roleplayAPI = {
  getCharacters: () => api.get<RoleplayCharacter[]>('/weather/roleplay/characters'),
  getRoleplay: (params: { city: string; character: string }) => 
    api.get<RoleplayResponse>('/weather/roleplay', { params }),
};

export interface PosterStyle {
  id: string;
  name: string;
  description: string;
}

export interface PosterResponse {
  city: string;
  style: string;
  image_base64: string;
  image_url: string;
}

export const posterAPI = {
  getStyles: () => api.get<PosterStyle[]>('/weather/poster/styles'),
  generatePoster: (params: { city: string; style: string }) => 
    api.get<PosterResponse>('/weather/poster', { params }),
};

export const favoritesAPI = {
  addCity: (cityName: string, cityCode?: string) =>
    api.post<FavoriteCity>('/city/add', { city_name: cityName, city_code: cityCode }),
  
  deleteCity: (cityName: string) => api.delete(`/city/delete/${cityName}`),
  
  getCities: () => api.get<FavoriteCity[]>('/city/list'),
};

export const settingsAPI = {
  getSettings: () => api.get<UserSettings>('/setting/'),
  
  updateSettings: (settings: Partial<UserSettings>) =>
    api.put<UserSettings>('/setting/update', settings),
};

export default api;