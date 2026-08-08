/**
 * Swaply Launch Countdown & Site Access Guard Configuration
 * Target Launch: August 9, 2026 at 10:00:00 AM IST (+05:30)
 */

export const LAUNCH_CONFIG = {
  // Target Launch Date ISO String (August 9, 2026 at 10:00 AM IST)
  TARGET_DATE: '2026-08-09T10:00:00+05:30',
  
  // Master toggle for launch lock screen
  ENABLE_LOCK: true,
  
  // Query parameters that allow bypassing the lock for admin / VIP previews
  BYPASS_PARAMS: ['preview', 'bypass', 'admin', 'key'],
  
  // Routes that should always bypass the lock screen
  UNLOCKED_PATHS: ['/admin', '/login']
};

/**
 * Returns target Date object
 */
export function getLaunchTargetDate() {
  const envTarget = import.meta.env.VITE_LAUNCH_TARGET_DATE;
  return new Date(envTarget || LAUNCH_CONFIG.TARGET_DATE);
}

/**
 * Checks whether site access is unlocked
 * Returns true if launch time reached, lock is disabled, bypass query parameter is present, or path is admin
 */
export function isSiteUnlocked() {
  if (!LAUNCH_CONFIG.ENABLE_LOCK) return true;
  
  // Check location parameters (browser only)
  if (typeof window !== 'undefined') {
    const searchParams = new URLSearchParams(window.location.search);
    const hasBypassParam = LAUNCH_CONFIG.BYPASS_PARAMS.some((param) => {
      const val = searchParams.get(param);
      return val === 'true' || val === '1' || val === 'swaply';
    });
    
    if (hasBypassParam) return true;

    const pathname = window.location.pathname;
    if (LAUNCH_CONFIG.UNLOCKED_PATHS.some((path) => pathname.startsWith(path))) {
      return true;
    }
  }

  const targetDate = getLaunchTargetDate();
  const now = new Date();
  
  return now >= targetDate;
}

/**
 * Calculates remaining time until launch
 */
export function getTimeRemaining() {
  const target = getLaunchTargetDate().getTime();
  const now = new Date().getTime();
  const total = Math.max(0, target - now);

  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));

  return {
    total,
    days,
    hours,
    minutes,
    seconds,
    isComplete: total <= 0
  };
}
