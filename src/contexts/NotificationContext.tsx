import React, { createContext, useContext, useState } from 'react';

interface NotificationContextType {
  soundEnabled: boolean;
  toggleSound: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    // Get initial state from localStorage
    const saved = localStorage.getItem('chatSoundEnabled');
    return saved ? JSON.parse(saved) : true;
  });

  const toggleSound = () => {
    setSoundEnabled((prev: boolean) => {
      const newValue = !prev;
      localStorage.setItem('chatSoundEnabled', JSON.stringify(newValue));
      return newValue;
    });
  };

  return (
    <NotificationContext.Provider value={{ soundEnabled, toggleSound }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};