

# إعادة تصميم شاملة بأسلوب حديث مستوحى من التصميم المرفق

## الفكرة
المستخدم أرفق تصميم HTML بطابع إسلامي فاخر (خلفية داكنة، ألوان ذهبية، تأثيرات زجاجية، إطارات أنيقة). سأطبق هذا الطابع على جميع صفحات التطبيق مع إنشاء مكوّنات موحّدة.

## ما سيتم إنشاؤه

### 1. مكوّن `SectionHeader.tsx` (جديد)
عنوان كل قسم داخل إطار أنيق مع أيقونة وشريط جانبي ملوّن:
```text
┌─────────────────────────────────┐
│  ▌ [🔵] اختر الذكر              │
└─────────────────────────────────┘
```
- شريط `border-r-3 border-primary` على اليمين
- أيقونة داخل دائرة `rounded-xl bg-primary/10`
- خلفية `bg-gradient-to-l from-primary/5 to-transparent`
- `rounded-2xl p-3`

### 2. مكوّن `PageHeader.tsx` (جديد)
هيدر موحّد يستبدل الكود المتكرر في كل صفحة:
- يقبل: `title`, `subtitle`, `emoji?`, `actions?` (أزرار)
- نفس التصميم الحالي (`gradient-islamic` + `islamic-pattern`) لكن مع العنوان داخل badge

### 3. تحديث كل الصفحات (12 ملف)

| الصفحة | التغييرات |
|--------|-----------|
| **Tasbeeh** | PageHeader + SectionHeader "📿 اختر الذكر" + بطاقة النص العربي بإطار مزخرف `border-primary/20` مع gradient خفيف |
| **PrayerTimes** | PageHeader + SectionHeader "🕌 أوقات الصلاة اليوم" + إبقاء التصميم الحالي للبطاقات |
| **PrayerTracker** | PageHeader + SectionHeader "✅ صلوات اليوم" و "📊 تقدم اليوم" |
| **Quran** | PageHeader + تبويبات محسّنة |
| **Duas** | PageHeader + SectionHeader لكل فئة (يومي/أذكار/أخرى/متقطع) بأيقونات مختلفة |
| **Stories** | PageHeader + SectionHeader "📂 اختر الفئة" + بانر تحفيزي محسّن |
| **ZakatCalculator** | PageHeader + SectionHeader "💰 العملة" و "📋 أصولك ومدخراتك" |
| **Qibla** | PageHeader + SectionHeader "📋 كيف تستخدم البوصلة" |
| **Account** | PageHeader + SectionHeader "ℹ️ معلومات الحساب" |
| **AdminDashboard** | PageHeader |
| **Index** | SectionHeader لأقسام: مواقيت الصلاة، وصول سريع، دعاء اليوم، إتمام القرآن، التقويم الهجري |

### 4. تفاصيل التصميم

**SectionHeader** — النمط الموحّد:
```
rounded-2xl bg-gradient-to-l from-primary/5 via-card to-card
border border-border/50 border-r-[3px] border-r-primary
p-3 flex items-center gap-3 mb-4
```
- أيقونة: `h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center`
- عنوان: `text-sm font-bold text-foreground`
- عنوان فرعي اختياري: `text-xs text-muted-foreground`

**PageHeader** — بديل الهيدر المتكرر:
- يستقبل props ويُخرج نفس الهيكل الحالي
- يقلل تكرار ~20 سطر في كل صفحة

### 5. الملفات

**ملفات جديدة:**
- `src/components/SectionHeader.tsx`
- `src/components/PageHeader.tsx`

**ملفات معدّلة:**
- `src/pages/Tasbeeh.tsx`
- `src/pages/PrayerTimes.tsx`
- `src/pages/PrayerTracker.tsx`
- `src/pages/Quran.tsx`
- `src/pages/Duas.tsx`
- `src/pages/Stories.tsx`
- `src/pages/ZakatCalculator.tsx`
- `src/pages/Qibla.tsx`
- `src/pages/Account.tsx`
- `src/pages/AdminDashboard.tsx`
- `src/pages/Index.tsx`

التغييرات ستكون بصرية فقط — لن يتم تعديل أي منطق أو وظائف.

