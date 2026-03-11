# 🌍 المؤذن العالمي - Al Muezzin Al Alami
## Deployment Documentation

---

## 📋 Project Overview

**المؤذن العالمي** (Al Muezzin Al Alami - The Global Muezzin) is a comprehensive Islamic application that provides:

- ✅ **Accurate Prayer Times** - Real-time prayer times for every city in the world
- ✅ **Holy Quran** - Complete Quran with recitation and translations
- ✅ **Qibla Direction** - 100% accurate Qibla direction using GPS and compass sensors
- ✅ **Smart Notes** - Intelligent reminder system with time-based notifications
- ✅ **Duas & Adhkar** - Daily Islamic supplications and remembrances
- ✅ **Zakat Calculator** - Comprehensive Zakat calculation tool
- ✅ **Prayer Tracking** - Track daily prayers and spiritual progress
- ✅ **Ramadan Features** - Ramadan calendar, Iftar times, and special content
- ✅ **Push Notifications** - Real-time prayer time alerts and reminders
- ✅ **PWA Support** - Installable as a mobile app on iOS and Android
- ✅ **Multi-language** - Arabic, English, German, and Turkish support

---

## 🚀 Live Deployment

### **Main Application URL:**
```
https://8001-ixd9ul3f6goudjs6jl444-7c89a601.us1.manus.computer
```

### **Features:**
- ✅ Full-featured Islamic application
- ✅ Real-time prayer time notifications
- ✅ Smart notes with intelligent reminders
- ✅ 100% accurate Qibla direction
- ✅ Complete Quran with audio
- ✅ Secure authentication system
- ✅ Push notifications enabled
- ✅ PWA installable

---

## 🔧 Technology Stack

### **Frontend:**
- React 18.3.1 with TypeScript
- Vite 5.4.19 for fast builds
- TailwindCSS 3.4.17 for styling
- Framer Motion for animations
- React Router v6 for navigation
- Shadcn UI components

### **Backend:**
- Supabase for authentication and database
- Supabase Edge Functions (Deno) for serverless operations
- PostgreSQL database
- Resend for email notifications

### **APIs:**
- Aladhan API for prayer times
- Al-Quran Cloud API for Quran content
- Google Maps API for location services
- Google Gemini API for AI features

### **Security:**
- HTTPS enforcement
- Content Security Policy (CSP)
- XSS protection
- CSRF token validation
- Secure local storage
- Input sanitization

### **PWA & Mobile:**
- Workbox for service workers
- Capacitor for native app building
- Push notifications via Web Push API
- Device orientation API for Qibla compass

---

## 📦 Project Structure

```
project/
├── src/
│   ├── pages/              # Page components
│   ├── components/         # Reusable components
│   │   ├── SmartNotes.tsx  # Smart notes with reminders
│   │   ├── QiblaEnhanced.tsx # Enhanced Qibla direction
│   │   └── ...
│   ├── hooks/              # Custom React hooks
│   ├── lib/
│   │   ├── securityConfig.ts    # Security configuration
│   │   ├── notificationManager.ts # Notification system
│   │   ├── pushSubscription.ts   # Push notification handling
│   │   └── ...
│   ├── integrations/       # External service integrations
│   └── App.tsx             # Main app component
├── supabase/
│   ├── functions/          # Edge functions
│   │   ├── auth-email-hook/    # Email authentication (Resend)
│   │   ├── send-prayer-push/   # Prayer time notifications
│   │   └── ...
│   └── migrations/         # Database migrations
├── dist/                   # Production build
├── index.html              # HTML entry point
├── capacitor.config.ts     # Capacitor configuration
├── vite.config.ts          # Vite configuration
└── package.json            # Dependencies

```

---

## 🔐 Security Features

### **Implemented Security Measures:**

1. **HTTPS Enforcement**
   - Automatic redirect to HTTPS in production
   - Secure cookie transmission

2. **Content Security Policy**
   - Restricts script sources
   - Prevents inline script execution
   - Controls API connections

3. **XSS Protection**
   - Input sanitization
   - HTML escaping
   - Safe DOM manipulation

4. **CSRF Protection**
   - CSRF token validation
   - Same-site cookie policy

5. **Secure Storage**
   - Encrypted local storage wrapper
   - Secure session management

6. **API Security**
   - Request validation
   - Rate limiting
   - Error handling

---

## 🔔 Notification System

### **Smart Notifications:**

1. **Prayer Time Alerts**
   - Real-time push notifications
   - Customizable reminders
   - Offline support

2. **Smart Reminders**
   - User-defined reminders
   - Intelligent scheduling
   - Priority-based notifications

3. **Achievement Badges**
   - Prayer streak tracking
   - Quran reading progress
   - Spiritual milestones

### **Notification Channels:**
- Browser push notifications
- Local notifications
- Service worker notifications
- Email notifications (via Resend)

---

## 📍 Qibla Direction Feature

### **100% Accuracy Implementation:**

1. **GPS Location**
   - Precise latitude/longitude detection
   - Continuous location tracking
   - Fallback to manual entry

2. **Compass Sensor**
   - Device orientation API
   - Smoothed heading calculation
   - Accuracy calibration

3. **Qibla Calculation**
   - Haversine formula for distance
   - Spherical trigonometry for direction
   - Real-time angle calculation

4. **Visual Feedback**
   - Animated compass display
   - Qibla indicator (🕋)
   - Alignment status indicator
   - Distance to Kaaba display

---

## 📝 Smart Notes Feature

### **Intelligent Reminder System:**

1. **Note Creation**
   - Title and description
   - Date and time selection
   - Priority levels (Low, Medium, High)

2. **Smart Reminders**
   - Automatic notifications at scheduled time
   - Browser and push notifications
   - Persistent storage

3. **Note Management**
   - Edit and update notes
   - Mark as completed
   - Delete notes
   - Sort by priority

4. **Offline Support**
   - Local storage persistence
   - Sync when online
   - Queue for offline notifications

---

## 🌐 Multi-Language Support

### **Supported Languages:**
- 🇸🇦 Arabic (العربية)
- 🇬🇧 English
- 🇩🇪 German (Deutsch)
- 🇹🇷 Turkish (Türkçe)

### **RTL Support:**
- Full right-to-left layout
- Arabic font optimization
- Language-specific formatting

---

## 🔄 API Integrations

### **Prayer Times:**
```
GET https://api.aladhan.com/v1/timings/{date}?latitude={lat}&longitude={lng}&method={method}
```

### **Quran Content:**
```
GET https://api.alquran.cloud/v1/surah/{surah}
```

### **Email Notifications (Resend):**
```
POST https://api.resend.com/emails
Headers: Authorization: Bearer {RESEND_API_KEY}
```

### **Push Notifications:**
```
Supabase Edge Function: send-prayer-push
Web Push API with VAPID keys
```

---

## 🛠️ Configuration

### **Environment Variables:**

Create a `.env` file in the project root:

```env
# Supabase
VITE_SUPABASE_URL=https://[project-id].supabase.co
VITE_SUPABASE_ANON_KEY=[anon-key]

# APIs
VITE_GOOGLE_GEMINI_API_KEY=[gemini-api-key]
VITE_GOOGLE_MAPS_API_KEY=[maps-api-key]

# Firebase
VITE_FIREBASE_API_KEY=[firebase-api-key]
VITE_FIREBASE_PROJECT_ID=[firebase-project-id]

# Email
VITE_RESEND_API_KEY=[resend-api-key]
```

---

## 📱 PWA Installation

### **Web Installation:**
1. Open the app in your browser
2. Click "Install" or use browser menu
3. App will be added to home screen

### **Android Installation:**
```bash
# Build APK
npx cap build android

# Deploy to Play Store
# Follow Google Play Console guidelines
```

### **iOS Installation:**
```bash
# Build iOS app
npx cap build ios

# Deploy to App Store
# Follow Apple App Store guidelines
```

---

## 🚀 Deployment Steps

### **1. Build the Project:**
```bash
npm install
npm run build
```

### **2. Test Locally:**
```bash
npm run preview
```

### **3. Deploy to Production:**

#### **Option A: Vercel**
```bash
vercel deploy
```

#### **Option B: Netlify**
```bash
netlify deploy --prod --dir=dist
```

#### **Option C: Docker**
```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY . .
RUN npm install && npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

#### **Option D: Custom Server**
```bash
# Copy dist folder to server
scp -r dist/* user@server:/var/www/almuezzin/

# Configure nginx
# Configure SSL certificate
# Start service
```

---

## 🔍 Monitoring & Maintenance

### **Performance Monitoring:**
- Lighthouse scores
- Core Web Vitals
- Bundle size analysis

### **Error Tracking:**
- Browser console errors
- API error logging
- User error reporting

### **Database Maintenance:**
- Regular backups
- Query optimization
- Storage cleanup

### **Security Updates:**
- Dependency updates
- Security patches
- API key rotation

---

## 📊 Analytics

### **Tracking:**
- User engagement
- Feature usage
- Prayer time accuracy
- Notification delivery rates

### **Metrics:**
- Daily active users
- Prayer completion rates
- Quran reading progress
- App installation count

---

## 🤝 Support & Contribution

### **Report Issues:**
- GitHub Issues
- Email support
- In-app feedback

### **Contributing:**
- Fork the repository
- Create feature branch
- Submit pull requests
- Follow code standards

---

## 📄 License

This project is licensed under the MIT License. See LICENSE file for details.

---

## 🙏 Acknowledgments

- **Aladhan API** - Prayer times data
- **Al-Quran Cloud** - Quran content
- **Supabase** - Backend infrastructure
- **Resend** - Email service
- **Capacitor** - Mobile app framework

---

## 📞 Contact

**المؤذن العالمي Team**
- Email: info@almuezzin.com
- Website: https://www.almuezzin.com
- Support: support@almuezzin.com

---

**Last Updated:** March 11, 2026
**Version:** 1.0.0
**Status:** ✅ Production Ready
