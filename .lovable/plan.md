

# إصلاح دالة daily-duas لإرجاع الأذكار بشكل صحيح

## المشكلة
الدالة ترجع `{"duas": []}` — مصفوفة فارغة. السبب المرجح:
1. صيغة `tool_choice: { type: "function", function: { name: "return_duas" } }` غير مدعومة من Lovable AI Gateway
2. النموذج يرد بمحتوى نصي بدل tool calls، والتحليل يفشل صامتاً ويرجع `{}`
3. الصفحة لا تعرض الأذكار المحلية (fallback) لأن `data.duas` موجود كمصفوفة فارغة

## الحل

### 1. تبسيط Edge Function — إزالة tools واستخدام JSON مباشر
- إزالة `tools` و `tool_choice` من طلب AI
- الاعتماد على system prompt لإرجاع JSON فقط
- إضافة `console.log` للتشخيص
- إضافة تحقق: إذا `duas` فارغة → إرجاع خطأ ليعمل fallback

### 2. إصلاح منطق Fallback في الصفحة
- تعديل الشرط: إذا `duas` فارغة أو غير موجودة → استخدام الأذكار المحلية
- تغيير `data?.duas?.length > 0` ليشمل حالة المصفوفة الفارغة

### الملفات المعدّلة
- `supabase/functions/daily-duas/index.ts` — تبسيط الطلب وإزالة tools
- `src/pages/DailyDuas.tsx` — تحسين منطق fallback

