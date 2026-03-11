/**
 * Advanced Notification Management System for المؤذن العالمي
 * Handles push notifications, local notifications, smart reminders, and alarm system
 */

import { toast } from 'sonner';

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  actions?: NotificationAction[];
  data?: Record<string, any>;
  vibrate?: number[];
  silent?: boolean;
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum NotificationType {
  PRAYER_TIME = 'prayer_time',
  REMINDER = 'reminder',
  ALERT = 'alert',
  MESSAGE = 'message',
  ACHIEVEMENT = 'achievement',
  SMART_NOTE = 'smart_note',
  ALARM = 'alarm',
}

// Prayer notification icons
const PRAYER_ICONS: Record<string, string> = {
  fajr: '/icons/fajr.png',
  sunrise: '/icons/sunrise.png',
  dhuhr: '/icons/dhuhr.png',
  asr: '/icons/asr.png',
  maghrib: '/icons/maghrib.png',
  isha: '/icons/isha.png',
};

// Notification queue for offline support
class NotificationQueue {
  private queue: NotificationPayload[] = [];
  private maxQueueSize = 100;

  constructor() {
    this.loadFromLocalStorage();
  }

  add(notification: NotificationPayload): void {
    this.queue.push(notification);
    if (this.queue.length > this.maxQueueSize) {
      this.queue.shift();
    }
    this.saveToLocalStorage();
  }

  getAll(): NotificationPayload[] {
    return [...this.queue];
  }

  getRecent(count: number = 20): NotificationPayload[] {
    return this.queue.slice(-count);
  }

  clear(): void {
    this.queue = [];
    localStorage.removeItem('notification_queue');
  }

  private saveToLocalStorage(): void {
    try {
      localStorage.setItem('notification_queue', JSON.stringify(this.queue));
    } catch (error) {
      console.error('Failed to save notification queue:', error);
    }
  }

  private loadFromLocalStorage(): void {
    try {
      const saved = localStorage.getItem('notification_queue');
      if (saved) {
        this.queue = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load notification queue:', error);
    }
  }
}

// Scheduled notifications manager
class ScheduledNotificationsManager {
  private timers: Map<string, ReturnType<typeof setTimeout>> = new Map();

  schedule(id: string, payload: NotificationPayload, delayMs: number, priority: NotificationPriority = NotificationPriority.NORMAL): void {
    // Cancel existing timer with same id
    this.cancel(id);

    const timer = setTimeout(() => {
      sendPushNotification(payload, priority);
      this.timers.delete(id);
      this.saveState();
    }, delayMs);

    this.timers.set(id, timer);
    this.saveState();
  }

  cancel(id: string): void {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
  }

  cancelAll(): void {
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
    localStorage.removeItem('scheduled_notifications');
  }

  getScheduledCount(): number {
    return this.timers.size;
  }

  private saveState(): void {
    try {
      localStorage.setItem('scheduled_notifications_count', String(this.timers.size));
    } catch {}
  }
}

// Global instances
const notificationQueue = new NotificationQueue();
const scheduledManager = new ScheduledNotificationsManager();

/**
 * Send a local notification using the Notification API
 */
export async function sendLocalNotification(
  payload: NotificationPayload,
  priority: NotificationPriority = NotificationPriority.NORMAL
): Promise<void> {
  try {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return;
    }

    if (Notification.permission !== 'granted') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('Notification permission denied');
        return;
      }
    }

    const vibrationPattern = priority === NotificationPriority.URGENT
      ? [200, 100, 200, 100, 200]
      : priority === NotificationPriority.HIGH
      ? [200, 100, 200]
      : [100];

    const notification = new Notification(payload.title, {
      body: payload.body,
      icon: payload.icon || '/icon-192x192.png',
      badge: payload.badge || '/badge-72x72.png',
      tag: payload.tag || 'default',
      requireInteraction: priority === NotificationPriority.URGENT || priority === NotificationPriority.HIGH,
      silent: payload.silent || false,
      data: {
        ...payload.data,
        priority,
        timestamp: Date.now(),
      },
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
      if (payload.data?.action) {
        window.location.href = payload.data.action;
      }
    };

    notificationQueue.add(payload);
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
}

/**
 * Send a push notification via service worker
 */
export async function sendPushNotification(
  payload: NotificationPayload,
  priority: NotificationPriority = NotificationPriority.NORMAL
): Promise<void> {
  try {
    if (!('serviceWorker' in navigator)) {
      return sendLocalNotification(payload, priority);
    }

    const registration = await navigator.serviceWorker.ready;
    
    const vibrationPattern = priority === NotificationPriority.URGENT
      ? [200, 100, 200, 100, 200]
      : priority === NotificationPriority.HIGH
      ? [200, 100, 200]
      : [100];

    await registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon || '/icon-192x192.png',
      badge: payload.badge || '/badge-72x72.png',
      tag: payload.tag || 'default',
      requireInteraction: priority === NotificationPriority.URGENT || priority === NotificationPriority.HIGH,
      vibrate: payload.vibrate || vibrationPattern,
      silent: payload.silent || false,
      actions: payload.actions,
      data: {
        ...payload.data,
        priority,
        timestamp: Date.now(),
      },
    } as any);

    notificationQueue.add(payload);
  } catch (error) {
    console.error('Failed to send push notification:', error);
    await sendLocalNotification(payload, priority);
  }
}

/**
 * Send a prayer time notification with custom icon
 */
export async function sendPrayerNotification(
  prayerName: string,
  prayerTime: string,
  prayerKey?: string,
  priority: NotificationPriority = NotificationPriority.HIGH
): Promise<void> {
  const prayerMessages: Record<string, string> = {
    'الفجر': 'الصلاة خير من النوم - حان وقت صلاة الفجر',
    'الشروق': 'أشرقت الشمس - وقت الإشراق',
    'الظهر': 'حان وقت صلاة الظهر - بادر بالصلاة',
    'العصر': 'حان وقت صلاة العصر - لا تفوتها',
    'المغرب': 'حان وقت صلاة المغرب - أفطر وصلِّ',
    'العشاء': 'حان وقت صلاة العشاء - اختم يومك بالصلاة',
  };

  const payload: NotificationPayload = {
    title: `المؤذن العالمي - ${prayerName}`,
    body: prayerMessages[prayerName] || `حان وقت ${prayerName} الساعة ${prayerTime}`,
    icon: (prayerKey && PRAYER_ICONS[prayerKey]) || '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: `prayer-${prayerKey || prayerName}`,
    requireInteraction: true,
    vibrate: [300, 100, 300, 100, 300],
    data: {
      type: NotificationType.PRAYER_TIME,
      prayer: prayerName,
      prayerKey,
      time: prayerTime,
      action: '/?athan_prayer=' + (prayerKey || prayerName),
    },
  };

  await sendPushNotification(payload, priority);
}

/**
 * Send a smart note reminder notification
 */
export async function sendSmartNoteNotification(
  title: string,
  description: string,
  priority: NotificationPriority = NotificationPriority.HIGH
): Promise<void> {
  const payload: NotificationPayload = {
    title: `تذكير ذكي - ${title}`,
    body: description || 'حان موعدك! جهز نفسك',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: `note-${Date.now()}`,
    requireInteraction: true,
    vibrate: [200, 100, 200],
    data: {
      type: NotificationType.SMART_NOTE,
      title,
      description,
    },
  };

  await sendPushNotification(payload, priority);
}

/**
 * Send a reminder notification
 */
export async function sendReminderNotification(
  title: string,
  description: string,
  priority: NotificationPriority = NotificationPriority.NORMAL
): Promise<void> {
  const payload: NotificationPayload = {
    title: `تذكير: ${title}`,
    body: description,
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: `reminder-${Date.now()}`,
    data: {
      type: NotificationType.REMINDER,
      title,
      description,
    },
  };

  await sendPushNotification(payload, priority);
}

/**
 * Send an achievement notification
 */
export async function sendAchievementNotification(
  achievement: string,
  description: string
): Promise<void> {
  const payload: NotificationPayload = {
    title: `إنجاز جديد!`,
    body: `${achievement}\n${description}`,
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: `achievement-${Date.now()}`,
    data: {
      type: NotificationType.ACHIEVEMENT,
      achievement,
      description,
    },
  };

  await sendPushNotification(payload, NotificationPriority.NORMAL);
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    if (!('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  } catch (error) {
    console.error('Failed to request notification permission:', error);
    return false;
  }
}

/**
 * Check if notifications are enabled
 */
export function areNotificationsEnabled(): boolean {
  return 'Notification' in window && Notification.permission === 'granted';
}

/**
 * Get all pending notifications
 */
export function getPendingNotifications(): NotificationPayload[] {
  return notificationQueue.getAll();
}

/**
 * Get recent notifications
 */
export function getRecentNotifications(count: number = 20): NotificationPayload[] {
  return notificationQueue.getRecent(count);
}

/**
 * Clear all pending notifications
 */
export function clearPendingNotifications(): void {
  notificationQueue.clear();
}

/**
 * Schedule a notification for a specific time
 */
export function scheduleNotification(
  id: string,
  payload: NotificationPayload,
  delayMs: number,
  priority: NotificationPriority = NotificationPriority.NORMAL
): void {
  scheduledManager.schedule(id, payload, delayMs, priority);
}

/**
 * Cancel a scheduled notification
 */
export function cancelScheduledNotification(id: string): void {
  scheduledManager.cancel(id);
}

/**
 * Cancel all scheduled notifications
 */
export function cancelAllScheduledNotifications(): void {
  scheduledManager.cancelAll();
}

/**
 * Get count of scheduled notifications
 */
export function getScheduledNotificationsCount(): number {
  return scheduledManager.getScheduledCount();
}

/**
 * Schedule a recurring notification
 */
export function scheduleRecurringNotification(
  payload: NotificationPayload,
  intervalMs: number,
  priority: NotificationPriority = NotificationPriority.NORMAL,
  maxOccurrences?: number
): ReturnType<typeof setInterval> {
  let occurrences = 0;

  const interval = setInterval(() => {
    if (maxOccurrences && occurrences >= maxOccurrences) {
      clearInterval(interval);
      return;
    }
    sendPushNotification(payload, priority);
    occurrences++;
  }, intervalMs);

  return interval;
}

/**
 * Initialize notification system
 */
export async function initializeNotificationSystem(): Promise<void> {
  try {
    // Request permission if not already granted
    if ('Notification' in window && Notification.permission === 'default') {
      // Don't auto-request, wait for user interaction
      console.log('Notification permission not yet requested');
    }

    // Register service worker for push notifications
    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', reg.scope);
      } catch (err) {
        console.warn('Service Worker registration failed:', err);
      }
    }

    // Listen for notification clicks from service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'NOTIFICATION_CLICK') {
          const { action } = event.data;
          if (action) {
            window.location.href = action;
          }
        }
      });
    }

    console.log('المؤذن العالمي - Notification system initialized');
  } catch (error) {
    console.error('Failed to initialize notification system:', error);
  }
}
