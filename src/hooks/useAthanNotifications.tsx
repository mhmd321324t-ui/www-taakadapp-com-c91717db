import { useEffect, useRef, useCallback } from 'react';
import { PrayerTime } from './usePrayerTimes';

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

/**
 * Send a browser notification
 */
function sendNotification(title: string, body: string) {
  if (Notification.permission !== 'granted') return;
  
  const notification = new Notification(title, {
    body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'athan-notification',
    requireInteraction: true,
    silent: false,
  });

  // Auto close after 30 seconds
  setTimeout(() => notification.close(), 30000);
}

/**
 * Hook: monitors prayer times and sends notifications at athan time
 */
export function useAthanNotifications(prayers: PrayerTime[], enabled: boolean = true) {
  const notifiedRef = useRef<Set<string>>(new Set());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const checkPrayerTimes = useCallback(() => {
    if (!enabled || prayers.length === 0) return;

    const now = new Date();
    const currentH = now.getHours();
    const currentM = now.getMinutes();
    const todayKey = now.toISOString().split('T')[0];

    for (const prayer of prayers) {
      if (prayer.key === 'sunrise') continue;

      const [h, m] = prayer.time24.split(':').map(Number);

      // Notify at exact prayer time (within 1 minute window)
      if (currentH === h && currentM === m) {
        const notifKey = `${todayKey}-${prayer.key}`;
        if (!notifiedRef.current.has(notifKey)) {
          notifiedRef.current.add(notifKey);

          const prayerNames: Record<string, string> = {
            fajr: '🌅 الفجر - Fajr',
            dhuhr: '🌞 الظهر - Dhuhr',
            asr: '🌤️ العصر - Asr',
            maghrib: '🌅 المغرب - Maghrib',
            isha: '🌙 العشاء - Isha',
          };

          sendNotification(
            'حان وقت الصلاة 🕌',
            `${prayerNames[prayer.key] || prayer.key} - ${prayer.time}`
          );
        }
      }
    }

    // Reset notifications at midnight
    if (currentH === 0 && currentM === 0) {
      notifiedRef.current.clear();
    }
  }, [prayers, enabled]);

  useEffect(() => {
    if (!enabled) return;

    // Check every 30 seconds
    checkPrayerTimes();
    intervalRef.current = setInterval(checkPrayerTimes, 30000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [checkPrayerTimes, enabled]);
}
