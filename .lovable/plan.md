

# خطة: تفعيل جميع الأزرار والميزات كتطبيق الأذان

## ما سيتم بناؤه

تحويل جميع العناصر الوهمية إلى ميزات تفاعلية حقيقية مطابقة لتطبيق Athan.

## الميزات الخمس

### 1. عدّاد الأذكار (Bottom Sheet)
عند الضغط على أي ذكر (قوّي إيمانك 0/7، ثواب ثلث القرآن 0/3، للتوبة 0/11) يفتح Drawer من الأسفل يحتوي:
- عنوان الذكر
- النص العربي بخط كبير
- النقل الحرفي (transliteration)
- زر دائري كبير "اضغط" للعد
- عداد (0/7) يتحدث مع كل ضغطة
- عند الإكمال يغلق تلقائياً ويحدّث التقدم

### 2. دعاء اليوم التفاعلي (Bottom Sheet)
عند الضغط على بطاقة "دعاء اليوم" يفتح Drawer يعرض:
- عنوان الدعاء (للمساعدة والحماية من الله)
- النص العربي كاملاً (آية الكرسي مثلاً)
- النقل الحرفي
- زر تحديد كبير دائري (✓) برتقالي
- بيانات الأدعية من `src/data/duas.ts` — دعاء مختلف كل يوم

### 3. صفحة تحدي رمضان (`/ramadan-challenge`)
صفحة كاملة جديدة بتابَين:
- **صيام**: 30 يوم مع دائرة تحديد + أوقات السحور والإفطار لكل يوم (من prayer times API)
- **أعمال**: 30 عمل صالح يومي (تناول سحوراً صحياً، تعلم دعاءً جديداً، علّم طفلاً عملاً صالحاً...)
- بطاقة تقدم علوية: X/60 مع شريط + عداد صيام 0/30 + أعمال 0/30
- حفظ في DB للمسجلين وlocalStorage للضيوف

### 4. صفحة حدّد هدف القرآن (`/quran-goal`)
صفحة جديدة تحتوي:
- اختيار المدة: 5 دقائق، 10، 20، 30، ساعة (radio buttons مع ✓)
- تبديل تذكير (switch)
- اختيار وقت التذكير (time picker بسيط)
- زر "أنشئ هدفاً" أخضر كبير
- حفظ الإعدادات في localStorage

### 5. صفحة إعدادات الأذكار اليومية (`/dhikr-settings`)
صفحة جديدة تحتوي:
- عنوان "حدد الأذكار اليومية"
- لكل ذكر: switch تفعيل/إلغاء + النص العربي + النقل الحرفي + العد المطلوب مع أسهم تعديل
- حفظ التفضيلات في localStorage

## الملفات

| ملف | عملية |
|-----|-------|
| `src/components/DhikrCounterDrawer.tsx` | جديد — drawer عداد الأذكار |
| `src/components/DuaOfDayDrawer.tsx` | جديد — drawer دعاء اليوم |
| `src/pages/RamadanChallenge.tsx` | جديد — صفحة تحدي رمضان |
| `src/pages/QuranGoal.tsx` | جديد — صفحة هدف القرآن |
| `src/pages/DhikrSettings.tsx` | جديد — صفحة إعدادات الأذكار |
| `src/components/DailyGoals.tsx` | تعديل — فتح drawer عند الضغط على الذكر |
| `src/pages/Index.tsx` | تعديل — دعاء اليوم يفتح drawer + ربط أزرار بالصفحات |
| `src/App.tsx` | تعديل — إضافة routes جديدة |
| `src/data/ramadanDeeds.ts` | جديد — بيانات 30 عمل يومي لرمضان |

## قاعدة البيانات
جدول `ramadan_challenge` لحفظ تقدم رمضان:
```sql
CREATE TABLE ramadan_challenge (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  year integer NOT NULL,
  day_number integer NOT NULL,
  fasting_completed boolean DEFAULT false,
  deed_completed boolean DEFAULT false,
  UNIQUE(user_id, year, day_number)
);
-- + RLS policies
```

