// Service Worker notification helper for prayer times
import { playAthan } from './athanAudio';

const PRAYER_NAMES: Record<string, string> = {
  fajr: '🌅 الفجر',
  dhuhr: '🌞 الظهر',
  asr: '🌤️ العصر',
  maghrib: '🌅 المغرب',
  isha: '🌙 العشاء',
};

export async function schedulePrayerNotifications(
  prayers: { key: string; time24: string; time: string }[]
) {
  if (!('serviceWorker' in navigator)) return;
  if (Notification.permission !== 'granted') return;

  const reg = await navigator.serviceWorker.ready;

  // Cancel any previously scheduled notifications
  const existingTimers = (window as any).__prayerTimers as number[] | undefined;
  if (existingTimers) {
    existingTimers.forEach(clearTimeout);
  }
  const timers: number[] = [];

  const now = new Date();
  const currentMs = now.getTime();

  for (const prayer of prayers) {
    if (prayer.key === 'sunrise') continue;

    const [h, m] = prayer.time24.split(':').map(Number);
    const prayerDate = new Date(now);
    prayerDate.setHours(h, m, 0, 0);

    const diff = prayerDate.getTime() - currentMs;
    if (diff <= 0) continue;

    const timer = window.setTimeout(() => {
      // Play athan audio
      playAthan(prayer.key);

      // Show notification
      reg.showNotification('حان وقت الصلاة 🕌', {
        body: `${PRAYER_NAMES[prayer.key] || prayer.key} - ${prayer.time}`,
        icon: '/pwa-icon-192.png',
        badge: '/pwa-icon-192.png',
        tag: `prayer-${prayer.key}`,
        requireInteraction: true,
        silent: true, // We play our own audio
        data: { url: '/' },
      } as NotificationOptions);
    }, diff) as unknown as number;

    timers.push(timer);

    // 15-min reminder (no athan, just notification)
    const reminderDiff = diff - 15 * 60 * 1000;
    if (reminderDiff > 0) {
      const reminderTimer = window.setTimeout(() => {
        reg.showNotification('تذكير بالصلاة 🔔', {
          body: `${PRAYER_NAMES[prayer.key] || prayer.key} بعد 15 دقيقة`,
          icon: '/pwa-icon-192.png',
          badge: '/pwa-icon-192.png',
          tag: `prayer-reminder-${prayer.key}`,
          silent: false,
          data: { url: '/' },
        } as NotificationOptions);
      }, reminderDiff) as unknown as number;

      timers.push(reminderTimer);
    }
  }

  (window as any).__prayerTimers = timers;
}
