

# مسح التصميم الحالي وتطبيق تصميم مستقبلي جديد

## الملخص
مسح `PageHeader` و `SectionHeader` من جميع الصفحات، وتطبيق تصميم مستقبلي داكن مستوحى من HTML المرفق: خلفية سوداء عميقة، ألوان سيان وذهبي نيون، تأثيرات زجاجية، حدود مضيئة.

## التغييرات

### 1. تحديث الألوان والثيم (`src/index.css`)
- **Light mode يصبح داكن أيضاً** (التطبيق كله وضع ليلي ثابت)
- خلفية: `#030514` (أسود عميق)
- Primary: سيان `#00ffff`
- Accent: ذهبي `#ffd966`
- Card: `rgba(10, 20, 30, 0.7)` شفاف مع blur
- Border: `rgba(0, 255, 255, 0.3)` سيان شفاف
- إضافة utility classes جديدة: `.glass-futuristic`, `.glow-cyan`, `.glow-gold-neon`, `.border-neon`

### 2. حذف المكوّنات
- حذف `src/components/PageHeader.tsx`
- حذف `src/components/SectionHeader.tsx`

### 3. إنشاء مكوّنات بديلة بالتصميم الجديد
- **`FuturisticHeader.tsx`**: هيدر شفاف مع gradient من أعلى، اسم الصفحة بـ gradient ذهبي، backdrop-blur
- **`SectionTitle.tsx`**: عنوان بسيط مع خط سيان متوهج وبدون إطار ثقيل

### 4. تحديث كل الصفحات (11 ملف)
استبدال `PageHeader` بـ `FuturisticHeader` و `SectionHeader` بـ `SectionTitle` في:
- `Index.tsx`, `PrayerTimes.tsx`, `Tasbeeh.tsx`, `PrayerTracker.tsx`
- `Quran.tsx`, `Duas.tsx`, `Stories.tsx`, `ZakatCalculator.tsx`
- `Qibla.tsx`, `Account.tsx`, `AdminDashboard.tsx`

تحديث البطاقات في كل صفحة لتستخدم:
- `bg-[rgba(10,20,30,0.7)] backdrop-blur-xl border border-cyan-500/30`
- `shadow-[0_0_50px_rgba(0,255,255,0.2)]`
- نصوص ذهبية للقيم المهمة

### 5. تحديث `BottomNav.tsx`
- خلفية داكنة شفافة مع backdrop-blur
- أيقونات بلون سيان

### 6. تحديث `AppLayout.tsx`
- إزالة أي ربط بالمكونات المحذوفة

### التصميم الجديد — النمط الموحّد

**هيدر الصفحة:**
```text
┌────────────────────────────────────┐
│  مـأذن • الحديثة          التاريخ  │
│  (gradient ذهبي)     (badge سيان)  │
└────────────────────────────────────┘
  ← gradient من أسود لشفاف
```

**بطاقة:**
```text
╭─── border: cyan/30 ───────────────╮
│  backdrop-blur-xl                  │
│  bg: rgba(10,20,30,0.7)          │
│  border-left: 5px solid cyan     │
│  shadow: 0 0 50px cyan/20        │
╰───────────────────────────────────╯
```

**عنوان قسم:**
```text
✦ أوقات الصلاة ✦
───── (خط سيان متوهج) ─────
```

### الملفات

**تُحذف:** `PageHeader.tsx`, `SectionHeader.tsx`
**تُنشأ:** `FuturisticHeader.tsx`, `SectionTitle.tsx`
**تُعدّل:** `index.css`, `BottomNav.tsx`, + 11 صفحة

