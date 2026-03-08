// Athan audio sources - verified working URLs
export interface AthanOption {
  id: string;
  name: string;
  nameAr: string;
  url: string;
  fajrUrl?: string;
}

export const ATHAN_OPTIONS: AthanOption[] = [
  {
    id: 'makkah',
    name: 'Makkah',
    nameAr: 'أذان مكة المكرمة',
    url: 'https://www.islamcan.com/audio/adhan/azan1.mp3',
  },
  {
    id: 'madinah',
    name: 'Madinah',
    nameAr: 'أذان المدينة المنورة',
    url: 'https://www.islamcan.com/audio/adhan/azan2.mp3',
  },
  {
    id: 'nufais',
    name: 'Ahmed Al-Nufais',
    nameAr: 'أحمد النفيس',
    url: 'https://cdn.aladhan.com/audio/adhans/a1.mp3',
  },
  {
    id: 'turkish',
    name: 'Mustafa Ozcan (Turkish)',
    nameAr: 'مصطفى أوزجان (تركي)',
    url: 'https://cdn.aladhan.com/audio/adhans/a2.mp3',
  },
  {
    id: 'mishary1',
    name: 'Mishary Rashid (Dubai)',
    nameAr: 'مشاري راشد العفاسي (دبي)',
    url: 'https://cdn.aladhan.com/audio/adhans/a4.mp3',
  },
  {
    id: 'mishary2',
    name: 'Mishary Rashid (2)',
    nameAr: 'مشاري راشد العفاسي (٢)',
    url: 'https://cdn.aladhan.com/audio/adhans/a7.mp3',
  },
  {
    id: 'mishary3',
    name: 'Mishary Rashid (3)',
    nameAr: 'مشاري راشد العفاسي (٣)',
    url: 'https://cdn.aladhan.com/audio/adhans/a9.mp3',
  },
  {
    id: 'zahrani',
    name: 'Mansour Al-Zahrani',
    nameAr: 'منصور الزهراني',
    url: 'https://cdn.aladhan.com/audio/adhans/a11-mansour-al-zahrani.mp3',
  },
  {
    id: 'default',
    name: 'Simple Beep',
    nameAr: 'تنبيه بسيط',
    url: '',
  },
];

export function getSelectedAthan(): AthanOption {
  const id = localStorage.getItem('athan-sound') || 'makkah';
  return ATHAN_OPTIONS.find(a => a.id === id) || ATHAN_OPTIONS[0];
}

export function setSelectedAthan(id: string) {
  localStorage.setItem('athan-sound', id);
}

let currentAudio: HTMLAudioElement | null = null;

export function playAthan(prayerKey?: string): HTMLAudioElement | null {
  stopAthan();
  
  const athan = getSelectedAthan();
  if (!athan.url) return null;
  
  const url = (prayerKey === 'fajr' && athan.fajrUrl) ? athan.fajrUrl : athan.url;
  
  currentAudio = new Audio(url);
  currentAudio.volume = parseFloat(localStorage.getItem('athan-volume') || '0.8');
  currentAudio.play().catch(() => {});
  
  currentAudio.addEventListener('error', () => {
    console.warn('Athan audio failed to load:', url);
    currentAudio = null;
  });
  
  return currentAudio;
}

export function stopAthan() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
}

export function previewAthan(id: string): HTMLAudioElement | null {
  stopAthan();
  const athan = ATHAN_OPTIONS.find(a => a.id === id);
  if (!athan?.url) return null;
  
  currentAudio = new Audio(athan.url);
  currentAudio.volume = parseFloat(localStorage.getItem('athan-volume') || '0.8');
  
  currentAudio.addEventListener('error', () => {
    console.warn('Preview failed for:', athan.url);
    currentAudio = null;
  });
  
  currentAudio.play().catch(() => {});
  
  setTimeout(() => stopAthan(), 15000);
  return currentAudio;
}
