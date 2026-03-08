

# 🕌 تطبيق إسلامي شامل - Comprehensive Islamic App

A full-featured Islamic web application inspired by Athan, with multilingual support (auto-detecting user's device language) and a modern teal/green design matching the Athan app style.

---

## 🎨 Design & Theme
- **Color scheme**: Teal/green primary (#00897B), dark navy backgrounds, gold accents for Islamic motifs
- **Typography**: Arabic-friendly fonts (Amiri for Arabic, Inter for English)
- **Layout**: Mobile-first responsive design with bottom tab navigation (like a native app)
- **Language**: Auto-detect device language, support Arabic (RTL), English, French, Turkish, Urdu, and more

---

## 📱 Core Pages & Features

### 1. Home Dashboard
- Current prayer time highlighted with countdown to next prayer
- Today's Hijri & Gregorian date
- Location name with auto-detection
- Quick access cards: Qibla, Quran, Tasbeeh, Duas

### 2. Prayer Times (مواقيت الصلاة)
- Full daily prayer schedule (Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha)
- Weekly/monthly prayer timetable view
- Multiple calculation methods (Muslim World League, ISNA, Egypt, Makkah, etc.)
- Athan sound selection & browser notification alerts
- Location auto-detect + manual city search

### 3. Qibla Finder (القبلة)
- Compass UI pointing toward Kaaba using device orientation API
- Distance to Makkah display
- Fallback for devices without compass (map-based direction)

### 4. Quran Reader (القرآن الكريم)
- Full Quran text (114 Surahs) via API
- Arabic text with translations (multiple languages)
- Audio recitation with multiple reciters
- Surah list with search
- Bookmarking & last-read position tracking
- Juz/Para navigation

### 5. Prayer Tracker (متتبع الصلاة)
- Daily prayer checklist (mark prayers as completed)
- Streak counter & weekly/monthly stats
- Visual progress charts (using Recharts)
- Motivational reminders

### 6. Tasbeeh Counter (مسبحة)
- Digital counter with tap/click
- Preset dhikr options (SubhanAllah, Alhamdulillah, Allahu Akbar)
- Custom dhikr input
- Daily/total count tracking
- Vibration feedback

### 7. Islamic Calendar (التقويم الهجري)
- Hijri calendar with important Islamic dates highlighted
- Ramadan countdown & tools (Suhoor/Iftar times)
- Event reminders for Islamic holidays

### 8. Duas & Adhkar (الأدعية والأذكار)
- Morning & evening adhkar
- Categorized duas (travel, food, sleep, etc.)
- Audio playback for each dua
- Favorites system

### 9. User Profile & Settings
- Account management (signup/login via Supabase auth)
- Calculation method preferences
- Notification settings
- Language selection
- Dark/light mode toggle
- Sync settings across devices

---

## 🔧 Technical Approach

- **Prayer Times**: Aladhan.com free API
- **Quran Data**: Al-Quran Cloud API (free)
- **Authentication**: Supabase Auth (email + social login)
- **Database**: Supabase for user preferences, prayer tracking, bookmarks
- **Notifications**: Browser Notification API for athan alerts
- **Qibla**: Device Orientation API + geolocation
- **Offline**: Service worker for cached Quran data

---

## 🚀 Unique 2026 Features (Standing Out)
- **AI Dua Generator**: Personalized duas based on user's situation (using Lovable AI)
- **Community Prayer Map**: See nearby mosques and prayer rooms
- **Quran Progress Gamification**: Badges and achievements for reading milestones
- **Live Makkah/Madinah Stream Embed**: Embedded video of Haramain
- **Zakat Calculator**: Calculate Zakat on wealth, gold, silver, stocks

