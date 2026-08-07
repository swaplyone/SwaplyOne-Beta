import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import MorphBar from '../components/MorphBar';

const MorphBarContext = createContext(null);

export function MorphBarProvider({ children }) {
  const [notificationNotice, setNotificationNotice] = useState(null);
  const [notificationType, setNotificationType] = useState('success'); // 'success' | 'error' | 'warning' | 'info' | 'loading'
  const timerRef = useRef(null);

  const dismiss = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setNotificationNotice(null);
  }, []);

  const showMorphBar = useCallback(({ type = 'success', title, message, duration = 4500 }) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const noticeText = title ? `${title}: ${message || ''}` : message;
    setNotificationType(type);
    setNotificationNotice(noticeText);

    if (duration > 0) {
      timerRef.current = setTimeout(() => {
        setNotificationNotice(null);
        timerRef.current = null;
      }, duration);
    }
  }, []);

  return (
    <MorphBarContext.Provider value={{ showMorphBar, dismissMorphBar: dismiss }}>
      {children}
      <MorphBar notificationNotice={notificationNotice} notificationType={notificationType} />
    </MorphBarContext.Provider>
  );
}

export function useMorphBar() {
  const context = useContext(MorphBarContext);
  if (!context) {
    throw new Error('useMorphBar must be used within a MorphBarProvider');
  }
  return context;
}
