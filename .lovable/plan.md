

# تحويل التطبيق إلى تطبيق أصلي للآيفون والأندرويد

المشروع جاهز بالفعل مع إعداد Capacitor الأساسي. التطبيق حالياً يعمل كـ PWA (تطبيق ويب قابل للتثبيت). لتشغيله كتطبيق أصلي حقيقي على الآيفون والأندرويد، تحتاج تنفيذ الخطوات التالية على جهازك المحلي:

## الخطوات المطلوبة

### 1. نقل المشروع إلى GitHub
- اضغط زر **"Export to GitHub"** من Lovable لنقل الكود لحسابك

### 2. تحميل المشروع وتثبيت المكتبات
```bash
git clone <رابط المشروع>
cd qibla-guidance-hub
npm install
```

### 3. إضافة منصات iOS و Android
```bash
npx cap add ios
npx cap add android
```

### 4. بناء المشروع ومزامنته
```bash
npm run build
npx cap sync
```

### 5. تشغيل التطبيق
- **أندرويد**: تحتاج Android Studio مثبت
```bash
npx cap run android
```
- **آيفون**: تحتاج Mac مع Xcode مثبت
```bash
npx cap run ios
```

## ملاحظات مهمة
- إعدادات Capacitor موجودة مسبقاً في `capacitor.config.ts`
- التطبيق حالياً يستخدم Hot Reload من سيرفر Lovable للتطوير
- عند نشر التطبيق على المتاجر، يجب تغيير `server.url` في `capacitor.config.ts` ليشير إلى الرابط المنشور أو إزالته ليعمل من الملفات المحلية
- لنشره على **Google Play** تحتاج حساب مطور ($25 مرة واحدة)
- لنشره على **App Store** تحتاج حساب Apple Developer ($99/سنة)
- بعد كل تحديث من Lovable، اعمل `git pull` ثم `npx cap sync`

## ما يمكن تنفيذه من Lovable
يمكنني تحسين التطبيق ليعمل بشكل أفضل كتطبيق أصلي مثل:
- إضافة Splash Screen مخصص
- تحسين أيقونات التطبيق لكل منصة
- إضافة إشعارات Push أصلية باستخدام Capacitor plugins

