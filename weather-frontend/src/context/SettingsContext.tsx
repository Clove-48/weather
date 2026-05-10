import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { settingsAPI, UserSettings } from '../api';

interface SettingsContextType {
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<UserSettings>({
    temperature_unit: 'metric',
    theme: 'light',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      setLoading(true);
      settingsAPI.getSettings()
        .then((response) => {
          setSettings(response.data);
        })
        .catch(() => {})
        .finally(() => {
          setLoading(false);
        });
    }
  }, []);

  useEffect(() => {
    document.body.className = settings.theme;
  }, [settings.theme]);

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    const response = await settingsAPI.updateSettings(newSettings);
    setSettings(response.data);
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        loading,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};