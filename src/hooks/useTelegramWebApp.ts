import { useEffect, useState } from 'react';

declare global {
  interface Window {
    Telegram?: {
      WebApp?: any;
    };
  }
}

export function useTelegramWebApp() {
  const [isTelegram, setIsTelegram] = useState(false);
  const [tgUser, setTgUser] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();

      if (tg.initDataUnsafe?.user) {
        setIsTelegram(true);
        setTgUser(tg.initDataUnsafe.user);
      } else if (tg.platform && tg.platform !== 'unknown') {
        setIsTelegram(true);
      }
    }
  }, []);

  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'medium') => {
    try {
      if (window.Telegram?.WebApp?.HapticFeedback) {
        const hf = window.Telegram.WebApp.HapticFeedback;
        if (type === 'success' || type === 'warning' || type === 'error') {
          hf.notificationOccurred(type);
        } else {
          hf.impactOccurred(type);
        }
      }
    } catch {
      // Haptics unavailable
    }
  };

  return {
    isTelegram,
    tgUser,
    tgWebApp: typeof window !== 'undefined' ? window.Telegram?.WebApp : null,
    triggerHaptic
  };
}
