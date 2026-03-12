# App: المؤذن العالمي (Al Muezzin Al Alami)

## Design System
- Primary: Teal #00897B (HSL 174 100% 27%)
- Accent: Islamic Gold (HSL 43 90% 55%)
- Islamic Green: HSL 150 60% 35%
- Navy dark bg: HSL 220 40% 13%
- Fonts: Amiri (Arabic), Inter (Latin)
- RTL support with auto-detection
- Mobile-first with bottom tab nav

## Architecture
- Prayer times: Aladhan.com API
- Quran: Al-Quran Cloud API
- i18n: Auto-detect device language, Google Translate API for all languages
- Google Translate API Key: AIzaSyBwFHv3bkEEWemeykzLK8oqB-ps6OrO5po (publishable)
- State: Supabase DB for logged-in users, localStorage fallback
- Auth: Supabase + Google OAuth via Lovable Cloud

## Branding
- App name: المؤذن العالمي (NOT تأكد - changed March 2026)
- Icon: Teal mosque dome with golden crescent moon
- Notification title: 🕌 المؤذن العالمي

## User Preferences
- Language: AUTO-DETECT from device (NO manual selector)
- All UI strings defined in Arabic, translated via Google Translate API

## DB Tables
- profiles, prayer_tracking, quran_bookmarks, push_subscriptions, etc.
