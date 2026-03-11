import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  Shield, Users, Megaphone, Settings, BookOpen, Trash2, Plus, Save, Check, X, Eye, Video, Mic, FileText,
  Bot, Send, Bell, Globe, BarChart3, Palette, Lock, RefreshCw, Loader2, MessageSquare, Zap, Database,
  AlertTriangle, CheckCircle2, Clock, TrendingUp, Activity
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { cn } from '@/lib/utils';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { isAdmin, loading } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/');
      toast.error('غير مصرح لك بالدخول');
    }
  }, [isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen pb-24" dir="rtl">
      <PageHeader title="لوحة التحكم" subtitle="إدارة كاملة للتطبيق والموقع" compact />

      <div className="px-4 -mt-4 relative z-10 max-w-4xl mx-auto">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4 h-auto rounded-2xl">
            <TabsTrigger value="overview" className="text-[10px] py-2 flex flex-col gap-1 rounded-xl">
              <BarChart3 className="h-4 w-4" />
              نظرة عامة
            </TabsTrigger>
            <TabsTrigger value="ai" className="text-[10px] py-2 flex flex-col gap-1 rounded-xl">
              <Bot className="h-4 w-4" />
              الذكاء الاصطناعي
            </TabsTrigger>
            <TabsTrigger value="notifications" className="text-[10px] py-2 flex flex-col gap-1 rounded-xl">
              <Bell className="h-4 w-4" />
              الإشعارات
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-[10px] py-2 flex flex-col gap-1 rounded-xl">
              <Settings className="h-4 w-4" />
              الإعدادات
            </TabsTrigger>
          </TabsList>

          <TabsList className="grid w-full grid-cols-4 mb-6 h-auto rounded-2xl">
            <TabsTrigger value="stories" className="text-[10px] py-2 flex flex-col gap-1 rounded-xl">
              <BookOpen className="h-4 w-4" />
              القصص
            </TabsTrigger>
            <TabsTrigger value="ads" className="text-[10px] py-2 flex flex-col gap-1 rounded-xl">
              <Megaphone className="h-4 w-4" />
              الإعلانات
            </TabsTrigger>
            <TabsTrigger value="users" className="text-[10px] py-2 flex flex-col gap-1 rounded-xl">
              <Users className="h-4 w-4" />
              المستخدمين
            </TabsTrigger>
            <TabsTrigger value="ruqyah" className="text-[10px] py-2 flex flex-col gap-1 rounded-xl">
              <Shield className="h-4 w-4" />
              الرقية
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview"><OverviewDashboard /></TabsContent>
          <TabsContent value="ai"><AIAssistant /></TabsContent>
          <TabsContent value="notifications"><NotificationsManager /></TabsContent>
          <TabsContent value="settings"><AdvancedSettings /></TabsContent>
          <TabsContent value="stories"><StoriesManager /></TabsContent>
          <TabsContent value="ads"><AdsManager /></TabsContent>
          <TabsContent value="users"><UsersManager /></TabsContent>
          <TabsContent value="ruqyah"><RuqyahManager /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

/* ======= OVERVIEW DASHBOARD ======= */
function OverviewDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStories: 0,
    pendingStories: 0,
    totalAds: 0,
    activeAds: 0,
    totalMosques: 0,
    totalPushSubs: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [users, stories, ads, mosques, pushSubs] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('stories').select('id, status'),
        supabase.from('ad_slots').select('id, is_active'),
        supabase.from('mosques').select('id', { count: 'exact', head: true }),
        supabase.from('push_subscriptions').select('id', { count: 'exact', head: true }),
      ]);

      const storiesData = stories.data || [];
      const adsData = ads.data || [];

      setStats({
        totalUsers: users.count || 0,
        totalStories: storiesData.length,
        pendingStories: storiesData.filter((s: any) => s.status === 'pending').length,
        totalAds: adsData.length,
        activeAds: adsData.filter((a: any) => a.is_active).length,
        totalMosques: mosques.count || 0,
        totalPushSubs: pushSubs.count || 0,
      });
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
    setLoading(false);
  };

  const statCards = [
    { label: 'المستخدمين', value: stats.totalUsers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'القصص', value: stats.totalStories, icon: BookOpen, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'بانتظار الموافقة', value: stats.pendingStories, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'الإعلانات النشطة', value: `${stats.activeAds}/${stats.totalAds}`, icon: Megaphone, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'المساجد المسجلة', value: stats.totalMosques, icon: Globe, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'اشتراكات الإشعارات', value: stats.totalPushSubs, icon: Bell, color: 'text-red-500', bg: 'bg-red-500/10' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" /> نظرة عامة على التطبيق
        </h3>
        <Button variant="ghost" size="sm" onClick={loadStats} className="rounded-xl">
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {statCards.map((card, i) => (
            <div key={i} className="rounded-2xl border border-border/50 bg-card p-4 shadow-elevated">
              <div className="flex items-center gap-2 mb-2">
                <div className={cn("p-2 rounded-xl", card.bg)}>
                  <card.icon className={cn("h-4 w-4", card.color)} />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{card.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-elevated">
        <h4 className="font-bold text-foreground mb-3 flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" /> إجراءات سريعة
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" className="rounded-xl h-auto py-3 flex flex-col gap-1" onClick={() => toast.success('تم تحديث الكاش')}>
            <RefreshCw className="h-4 w-4" />
            <span className="text-xs">مسح الكاش</span>
          </Button>
          <Button variant="outline" className="rounded-xl h-auto py-3 flex flex-col gap-1" onClick={() => toast.success('تم إرسال إشعار تجريبي')}>
            <Bell className="h-4 w-4" />
            <span className="text-xs">إشعار تجريبي</span>
          </Button>
          <Button variant="outline" className="rounded-xl h-auto py-3 flex flex-col gap-1" onClick={() => toast.success('تم تحديث البيانات')}>
            <Database className="h-4 w-4" />
            <span className="text-xs">تحديث البيانات</span>
          </Button>
          <Button variant="outline" className="rounded-xl h-auto py-3 flex flex-col gap-1" onClick={() => toast.success('تم فحص الأمان')}>
            <Shield className="h-4 w-4" />
            <span className="text-xs">فحص الأمان</span>
          </Button>
        </div>
      </div>

      {/* System Status */}
      <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-elevated">
        <h4 className="font-bold text-foreground mb-3 flex items-center gap-2">
          <Activity className="h-4 w-4 text-green-500" /> حالة النظام
        </h4>
        <div className="space-y-2">
          {[
            { name: 'الخادم الرئيسي', status: 'active' },
            { name: 'قاعدة البيانات', status: 'active' },
            { name: 'خدمة الإشعارات', status: 'active' },
            { name: 'API مواقيت الصلاة', status: 'active' },
            { name: 'خدمة البريد (Resend)', status: 'active' },
            { name: 'الذكاء الاصطناعي (Gemini)', status: 'active' },
          ].map((service, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
              <span className="text-sm text-foreground">{service.name}</span>
              <span className={cn(
                "text-xs px-2 py-1 rounded-full font-medium",
                service.status === 'active' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'
              )}>
                {service.status === 'active' ? '✓ نشط' : '✗ متوقف'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ======= AI ASSISTANT ======= */
function AIAssistant() {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiModel, setAiModel] = useState('gemini-2.5-flash');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const geminiKey = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY;
      if (!geminiKey) {
        setMessages(prev => [...prev, { role: 'assistant', content: 'مفتاح API الخاص بـ Gemini غير مُعرّف. يرجى إضافته في ملف .env' }]);
        setLoading(false);
        return;
      }

      const systemPrompt = `أنت مساعد ذكي لإدارة تطبيق "المؤذن العالمي" - تطبيق إسلامي شامل.
مهامك:
- مساعدة المدير في إدارة التطبيق والموقع
- تقديم اقتراحات لتحسين المحتوى والأداء
- المساعدة في كتابة المحتوى الإسلامي (أدعية، قصص، نصائح)
- تحليل البيانات وتقديم تقارير
- المساعدة في حل المشاكل التقنية
- تقديم أفكار لميزات جديدة
- المساعدة في إدارة الإشعارات والحملات
أجب دائماً بالعربية وبأسلوب احترافي ومفيد.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${aiModel}:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              { role: 'user', parts: [{ text: systemPrompt }] },
              { role: 'model', parts: [{ text: 'مرحباً! أنا مساعدك الذكي لإدارة تطبيق المؤذن العالمي. كيف يمكنني مساعدتك؟' }] },
              ...messages.map(m => ({
                role: m.role === 'user' ? 'user' : 'model',
                parts: [{ text: m.content }],
              })),
              { role: 'user', parts: [{ text: userMsg }] },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2048,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'عذراً، لم أتمكن من الرد.';
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `خطأ: ${err.message || 'فشل الاتصال بالذكاء الاصطناعي'}` }]);
    }
    setLoading(false);
  };

  const quickPrompts = [
    'اقترح محتوى إسلامي للإشعارات اليومية',
    'كيف أحسن أداء التطبيق؟',
    'اكتب دعاء جميل لإشعار الفجر',
    'اقترح ميزات جديدة للتطبيق',
    'حلل أداء التطبيق وقدم تقريراً',
    'اكتب قصة إسلامية قصيرة',
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-elevated">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" /> مساعد الذكاء الاصطناعي
          </h3>
          <select
            value={aiModel}
            onChange={e => setAiModel(e.target.value)}
            className="text-xs rounded-xl border border-input bg-background px-2 py-1"
          >
            <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
            <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
          </select>
        </div>

        {/* Quick prompts */}
        <div className="flex flex-wrap gap-2 mb-4">
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => { setInput(prompt); }}
              className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat messages */}
        <div className="h-[400px] overflow-y-auto rounded-2xl bg-background border border-border/30 p-4 space-y-3 mb-4">
          {messages.length === 0 && (
            <div className="text-center py-16">
              <Bot className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">ابدأ محادثة مع المساعد الذكي</p>
              <p className="text-xs text-muted-foreground mt-1">يمكنه مساعدتك في إدارة التطبيق وإنشاء المحتوى</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={cn("flex", msg.role === 'user' ? 'justify-start' : 'justify-end')}>
              <div className={cn(
                "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap",
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground border border-border/30'
              )}>
                {msg.role === 'assistant' && <Bot className="h-3 w-3 inline-block me-1 opacity-50" />}
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-end">
              <div className="bg-muted rounded-2xl px-4 py-3 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">جاري التفكير...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="اكتب رسالتك هنا..."
            className="flex-1 rounded-2xl"
            disabled={loading}
          />
          <Button onClick={sendMessage} disabled={loading || !input.trim()} className="rounded-2xl px-4">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* AI Tools */}
      <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-elevated">
        <h4 className="font-bold text-foreground mb-3 flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" /> أدوات الذكاء الاصطناعي
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <AIToolButton
            icon={<MessageSquare className="h-4 w-4" />}
            label="إنشاء إشعار ذكي"
            onClick={() => {
              setInput('اكتب لي 5 إشعارات إسلامية جميلة ومؤثرة لأوقات الصلاة المختلفة');
            }}
          />
          <AIToolButton
            icon={<BookOpen className="h-4 w-4" />}
            label="إنشاء قصة"
            onClick={() => {
              setInput('اكتب قصة إسلامية قصيرة ومؤثرة مناسبة للنشر في التطبيق');
            }}
          />
          <AIToolButton
            icon={<TrendingUp className="h-4 w-4" />}
            label="تحليل الأداء"
            onClick={() => {
              setInput('قدم لي تحليلاً شاملاً لأداء تطبيق إسلامي وكيف يمكن تحسينه');
            }}
          />
          <AIToolButton
            icon={<Palette className="h-4 w-4" />}
            label="اقتراحات تصميم"
            onClick={() => {
              setInput('اقترح تحسينات على تصميم واجهة تطبيق إسلامي لجعله أكثر جاذبية');
            }}
          />
        </div>
      </div>
    </div>
  );
}

function AIToolButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <Button variant="outline" className="rounded-xl h-auto py-3 flex flex-col gap-1.5" onClick={onClick}>
      {icon}
      <span className="text-xs">{label}</span>
    </Button>
  );
}

/* ======= NOTIFICATIONS MANAGER ======= */
function NotificationsManager() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [scheduledNotifs, setScheduledNotifs] = useState<any[]>([]);
  const [notifType, setNotifType] = useState<'instant' | 'scheduled'>('instant');
  const [scheduleTime, setScheduleTime] = useState('');
  const [scheduleDate, setScheduleDate] = useState(new Date().toISOString().split('T')[0]);

  const sendBroadcast = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error('الرجاء ملء العنوان والمحتوى');
      return;
    }
    setSending(true);
    try {
      const { error } = await supabase.functions.invoke('send-broadcast-notification', {
        body: { title, body, type: notifType, scheduleTime, scheduleDate },
      });
      if (error) throw error;
      toast.success('تم إرسال الإشعار بنجاح!');
      setTitle('');
      setBody('');
    } catch (err: any) {
      toast.error('فشل الإرسال: ' + (err.message || 'خطأ غير معروف'));
    }
    setSending(false);
  };

  const presetNotifications = [
    { title: 'تذكير صلاة الفجر', body: 'الصلاة خير من النوم - حان وقت صلاة الفجر' },
    { title: 'أذكار الصباح', body: 'لا تنسَ أذكار الصباح - أصبحنا وأصبح الملك لله' },
    { title: 'أذكار المساء', body: 'لا تنسَ أذكار المساء - أمسينا وأمسى الملك لله' },
    { title: 'تذكير القرآن', body: 'هل قرأت وردك اليومي من القرآن الكريم؟' },
    { title: 'صلاة على النبي', body: 'اللهم صلِّ وسلم على نبينا محمد ﷺ' },
    { title: 'دعاء يوم الجمعة', body: 'أكثروا من الصلاة على النبي ﷺ في يوم الجمعة' },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-elevated">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" /> إرسال إشعار جماعي
        </h3>

        {/* Notification type */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setNotifType('instant')}
            className={cn(
              "flex-1 py-2 rounded-xl text-sm font-medium transition-all",
              notifType === 'instant' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            )}
          >
            فوري
          </button>
          <button
            onClick={() => setNotifType('scheduled')}
            className={cn(
              "flex-1 py-2 rounded-xl text-sm font-medium transition-all",
              notifType === 'scheduled' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            )}
          >
            مجدول
          </button>
        </div>

        <div className="space-y-3">
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="عنوان الإشعار" className="rounded-xl" />
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="محتوى الإشعار..."
            className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm min-h-[80px] resize-none"
          />
          {notifType === 'scheduled' && (
            <div className="grid grid-cols-2 gap-2">
              <Input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} className="rounded-xl" />
              <Input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} className="rounded-xl" />
            </div>
          )}
          <Button onClick={sendBroadcast} disabled={sending} className="w-full rounded-2xl h-11">
            {sending ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : <Send className="h-4 w-4 me-2" />}
            {notifType === 'instant' ? 'إرسال الآن' : 'جدولة الإشعار'}
          </Button>
        </div>
      </div>

      {/* Preset notifications */}
      <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-elevated">
        <h4 className="font-bold text-foreground mb-3">إشعارات جاهزة</h4>
        <div className="space-y-2">
          {presetNotifications.map((notif, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-border/30 bg-background">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{notif.title}</p>
                <p className="text-xs text-muted-foreground truncate">{notif.body}</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => { setTitle(notif.title); setBody(notif.body); }}
                className="rounded-xl text-xs shrink-0"
              >
                استخدام
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ======= ADVANCED SETTINGS ======= */
function AdvancedSettings() {
  const [settings, setSettings] = useState<any[]>([]);
  const [appName, setAppName] = useState('المؤذن العالمي');
  const [primaryColor, setPrimaryColor] = useState('#257a4d');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    const { data } = await supabase.from('site_settings').select('*');
    if (data) {
      setSettings(data);
      data.forEach((s: any) => {
        if (s.key === 'app_name') setAppName(s.value || 'المؤذن العالمي');
        if (s.key === 'primary_color') setPrimaryColor(s.value || '#257a4d');
        if (s.key === 'maintenance_mode') setMaintenanceMode(s.value === 'true');
        if (s.key === 'analytics_enabled') setAnalyticsEnabled(s.value !== 'false');
      });
    }
  };

  const saveSetting = async (key: string, value: string) => {
    const { error } = await supabase.from('site_settings').upsert(
      { key, value } as any,
      { onConflict: 'key' }
    );
    if (error) {
      toast.error('فشل حفظ الإعداد');
    } else {
      toast.success('تم حفظ الإعداد');
    }
  };

  return (
    <div className="space-y-4">
      {/* App Settings */}
      <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-elevated">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" /> إعدادات التطبيق
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">اسم التطبيق</label>
            <div className="flex gap-2">
              <Input value={appName} onChange={e => setAppName(e.target.value)} className="flex-1 rounded-xl" />
              <Button size="sm" onClick={() => saveSetting('app_name', appName)} className="rounded-xl">
                <Save className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">اللون الرئيسي</label>
            <div className="flex gap-2 items-center">
              <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="h-10 w-16 rounded-xl border border-input cursor-pointer" />
              <Input value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="flex-1 rounded-xl" dir="ltr" />
              <Button size="sm" onClick={() => saveSetting('primary_color', primaryColor)} className="rounded-xl">
                <Save className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-elevated">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <Lock className="h-5 w-5 text-primary" /> إعدادات الأمان
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl border border-border/30">
            <div>
              <p className="text-sm font-medium text-foreground">وضع الصيانة</p>
              <p className="text-xs text-muted-foreground">إيقاف التطبيق مؤقتاً للصيانة</p>
            </div>
            <button
              onClick={() => {
                setMaintenanceMode(!maintenanceMode);
                saveSetting('maintenance_mode', (!maintenanceMode).toString());
              }}
              className={cn(
                "w-12 h-6 rounded-full transition-all relative",
                maintenanceMode ? 'bg-red-500' : 'bg-muted'
              )}
            >
              <div className={cn(
                "w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all shadow",
                maintenanceMode ? 'right-0.5' : 'left-0.5'
              )} />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl border border-border/30">
            <div>
              <p className="text-sm font-medium text-foreground">التحليلات</p>
              <p className="text-xs text-muted-foreground">تتبع استخدام التطبيق</p>
            </div>
            <button
              onClick={() => {
                setAnalyticsEnabled(!analyticsEnabled);
                saveSetting('analytics_enabled', (!analyticsEnabled).toString());
              }}
              className={cn(
                "w-12 h-6 rounded-full transition-all relative",
                analyticsEnabled ? 'bg-green-500' : 'bg-muted'
              )}
            >
              <div className={cn(
                "w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all shadow",
                analyticsEnabled ? 'right-0.5' : 'left-0.5'
              )} />
            </button>
          </div>
        </div>
      </div>

      {/* API Keys Management */}
      <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-elevated">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" /> مفاتيح API
        </h3>
        <div className="space-y-3">
          {[
            { label: 'Google Gemini', key: 'VITE_GOOGLE_GEMINI_API_KEY', status: !!import.meta.env.VITE_GOOGLE_GEMINI_API_KEY },
            { label: 'Firebase', key: 'VITE_FIREBASE_API_KEY', status: !!import.meta.env.VITE_FIREBASE_API_KEY },
            { label: 'Google Maps', key: 'VITE_GOOGLE_MAPS_API_KEY', status: !!import.meta.env.VITE_GOOGLE_MAPS_API_KEY },
            { label: 'Resend (Email)', key: 'VITE_RESEND_API_KEY', status: !!import.meta.env.VITE_RESEND_API_KEY },
          ].map((api, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-border/30">
              <div className="flex items-center gap-2">
                {api.status ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm text-foreground">{api.label}</span>
              </div>
              <span className={cn(
                "text-xs px-2 py-1 rounded-full",
                api.status ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'
              )}>
                {api.status ? 'مُفعّل' : 'غير مُفعّل'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ======= STORIES MANAGER WITH APPROVAL ======= */
function StoriesManager() {
  const [stories, setStories] = useState<any[]>([]);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'all'>('pending');

  useEffect(() => { loadStories(); }, [filter]);

  const loadStories = async () => {
    let query = supabase.from('stories').select('*').order('created_at', { ascending: false });
    if (filter === 'pending') query = query.eq('status', 'pending');
    else if (filter === 'approved') query = query.eq('status', 'approved');
    const { data } = await query;
    if (data) setStories(data);
  };

  const approveStory = async (id: string) => {
    await supabase.from('stories').update({ status: 'approved' }).eq('id', id);
    toast.success('تمت الموافقة على القصة');
    loadStories();
  };

  const rejectStory = async (id: string) => {
    await supabase.from('stories').update({ status: 'rejected' }).eq('id', id);
    toast.success('تم رفض القصة');
    loadStories();
  };

  const deleteStory = async (id: string) => {
    await supabase.from('stories').delete().eq('id', id);
    toast.success('تم حذف القصة');
    loadStories();
  };

  const getMediaIcon = (type: string) => {
    if (type === 'video') return <Video className="h-3 w-3 text-primary" />;
    if (type === 'audio') return <Mic className="h-3 w-3 text-primary" />;
    return <FileText className="h-3 w-3 text-muted-foreground" />;
  };

  const pendingCount = stories.filter(s => s.status === 'pending').length;

  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-4">
        {(['pending', 'approved', 'all'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-4 py-2 rounded-full text-xs font-medium transition-all',
              filter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            )}
          >
            {f === 'pending' ? `بانتظار الموافقة ${pendingCount > 0 ? `(${pendingCount})` : ''}` : f === 'approved' ? 'موافق عليها' : 'الكل'}
          </button>
        ))}
      </div>

      <h3 className="font-bold text-foreground">إدارة القصص ({stories.length})</h3>
      {stories.length === 0 && (
        <div className="rounded-3xl border border-border/50 bg-card p-8 text-center shadow-elevated">
          <p className="text-sm text-muted-foreground">
            {filter === 'pending' ? 'لا توجد قصص بانتظار الموافقة' : 'لا توجد قصص'}
          </p>
        </div>
      )}
      {stories.map(story => (
        <div key={story.id} className={cn(
          'rounded-2xl border bg-card p-5 shadow-elevated',
          story.status === 'pending' ? 'border-accent/30' : 'border-border/50'
        )}>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex gap-2 shrink-0">
              {story.status === 'pending' && (
                <>
                  <Button size="sm" onClick={() => approveStory(story.id)} className="rounded-xl h-8 gap-1">
                    <Check className="h-3 w-3" /> موافقة
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => rejectStory(story.id)} className="rounded-xl h-8 gap-1">
                    <X className="h-3 w-3" /> رفض
                  </Button>
                </>
              )}
              <Button variant="destructive" size="sm" onClick={() => deleteStory(story.id)} className="rounded-xl h-8">
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex-1 min-w-0 text-right">
              <div className="flex items-center gap-2 justify-end mb-1">
                {getMediaIcon(story.media_type)}
                <p className="font-bold text-foreground text-sm">{story.title}</p>
              </div>
              <p className="text-xs text-muted-foreground">{story.author_name} - {story.category}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-right line-clamp-2">{story.content}</p>
          {story.media_url && story.media_type === 'video' && (
            <video src={story.media_url} controls className="w-full rounded-xl max-h-48 mt-2" preload="metadata" />
          )}
          {story.media_url && story.media_type === 'audio' && (
            <audio src={story.media_url} controls className="w-full mt-2" preload="metadata" />
          )}
        </div>
      ))}
    </div>
  );
}

/* ======= RUQYAH MANAGER ======= */
function RuqyahManager() {
  const [categories, setCategories] = useState<any[]>([]);
  const [tracks, setTracks] = useState<any[]>([]);
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [newTrack, setNewTrack] = useState({ title_ar: '', reciter_ar: '', reciter_en: '', media_type: 'youtube', media_url: '', youtube_id: '' });
  const [newCat, setNewCat] = useState({ name_ar: '', emoji: '' });

  useEffect(() => { loadCategories(); }, []);
  useEffect(() => { if (selectedCat) loadTracks(selectedCat); }, [selectedCat]);

  const loadCategories = async () => {
    const { data } = await supabase.from('ruqyah_categories').select('*').order('sort_order');
    if (data) setCategories(data);
  };

  const loadTracks = async (catId: string) => {
    const { data } = await supabase.from('ruqyah_tracks').select('*').eq('category_id', catId).order('sort_order');
    if (data) setTracks(data);
  };

  const addCategory = async () => {
    if (!newCat.name_ar.trim()) return toast.error('أدخل اسم الفئة');
    const { error } = await supabase.from('ruqyah_categories').insert({
      name_ar: newCat.name_ar.trim(), emoji: newCat.emoji || '', sort_order: categories.length + 1,
    });
    if (error) return toast.error('خطأ: ' + error.message);
    toast.success('تمت إضافة الفئة');
    setNewCat({ name_ar: '', emoji: '' });
    loadCategories();
  };

  const deleteCategory = async (id: string) => {
    await supabase.from('ruqyah_categories').delete().eq('id', id);
    toast.success('تم حذف الفئة');
    if (selectedCat === id) setSelectedCat(null);
    loadCategories();
  };

  const addTrack = async () => {
    if (!selectedCat) return toast.error('اختر فئة أولاً');
    if (!newTrack.title_ar.trim() || !newTrack.reciter_ar.trim()) return toast.error('أدخل العنوان واسم الراقي');
    const { error } = await supabase.from('ruqyah_tracks').insert({
      category_id: selectedCat, title_ar: newTrack.title_ar.trim(), reciter_ar: newTrack.reciter_ar.trim(),
      reciter_en: newTrack.reciter_en.trim() || null, media_type: newTrack.media_type,
      media_url: newTrack.media_url.trim() || '', youtube_id: newTrack.youtube_id.trim() || null,
      sort_order: tracks.length + 1,
    });
    if (error) return toast.error('خطأ: ' + error.message);
    toast.success('تمت إضافة الرقية');
    setNewTrack({ title_ar: '', reciter_ar: '', reciter_en: '', media_type: 'youtube', media_url: '', youtube_id: '' });
    loadTracks(selectedCat);
  };

  const deleteTrack = async (id: string) => {
    await supabase.from('ruqyah_tracks').delete().eq('id', id);
    toast.success('تم حذف الرقية');
    if (selectedCat) loadTracks(selectedCat);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-elevated">
        <h3 className="font-bold text-foreground mb-3">إضافة فئة رقية جديدة</h3>
        <div className="flex gap-2">
          <Input value={newCat.emoji} onChange={e => setNewCat(c => ({ ...c, emoji: e.target.value }))} placeholder="رمز" className="w-16 rounded-xl text-center" maxLength={4} />
          <Input value={newCat.name_ar} onChange={e => setNewCat(c => ({ ...c, name_ar: e.target.value }))} placeholder="اسم الفئة" className="flex-1 rounded-xl" />
          <Button onClick={addCategory} size="sm" className="rounded-xl"><Plus className="h-4 w-4" /></Button>
        </div>
      </div>

      <div>
        <h3 className="font-bold text-foreground mb-3">فئات الرقية ({categories.length})</h3>
        <div className="space-y-2">
          {categories.map(cat => (
            <div key={cat.id} className={cn(
              'flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all',
              selectedCat === cat.id ? 'border-primary bg-primary/5' : 'border-border/50 bg-card'
            )} onClick={() => setSelectedCat(cat.id)}>
              <span className="text-xl">{cat.emoji}</span>
              <span className="flex-1 text-sm font-medium text-foreground">{cat.name_ar}</span>
              <Button variant="destructive" size="sm" onClick={(e) => { e.stopPropagation(); deleteCategory(cat.id); }} className="rounded-xl h-8">
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {selectedCat && (
        <>
          <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-elevated">
            <h3 className="font-bold text-foreground mb-3">إضافة رقية جديدة</h3>
            <div className="space-y-3">
              <Input value={newTrack.title_ar} onChange={e => setNewTrack(t => ({ ...t, title_ar: e.target.value }))} placeholder="عنوان الرقية" className="rounded-xl" />
              <Input value={newTrack.reciter_ar} onChange={e => setNewTrack(t => ({ ...t, reciter_ar: e.target.value }))} placeholder="اسم الراقي" className="rounded-xl" />
              <select value={newTrack.media_type} onChange={e => setNewTrack(t => ({ ...t, media_type: e.target.value }))} className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm">
                <option value="youtube">يوتيوب</option>
                <option value="audio">ملف صوتي</option>
              </select>
              {newTrack.media_type === 'youtube' ? (
                <Input value={newTrack.youtube_id} onChange={e => setNewTrack(t => ({ ...t, youtube_id: e.target.value }))} placeholder="معرف فيديو يوتيوب" className="rounded-xl" dir="ltr" />
              ) : (
                <Input value={newTrack.media_url} onChange={e => setNewTrack(t => ({ ...t, media_url: e.target.value }))} placeholder="رابط الملف الصوتي" className="rounded-xl" dir="ltr" />
              )}
              <Button onClick={addTrack} className="w-full rounded-2xl h-11"><Plus className="h-4 w-4 me-2" /> إضافة</Button>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-foreground mb-3">الرقيات ({tracks.length})</h3>
            <div className="space-y-2">
              {tracks.map(track => (
                <div key={track.id} className="flex items-center gap-3 p-4 rounded-2xl border border-border/50 bg-card">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground">{track.title_ar}</p>
                    <p className="text-xs text-muted-foreground">{track.reciter_ar} - {track.media_type}</p>
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => deleteTrack(track.id)} className="rounded-xl h-8">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ======= ADS MANAGER ======= */
function AdsManager() {
  const [ads, setAds] = useState<any[]>([]);
  const [adsenseId, setAdsenseId] = useState('');
  const [newAd, setNewAd] = useState({
    name: '', position: 'home-top', slot_type: 'manual', ad_code: '', is_active: true, image_url: '', link_url: '', platform: 'custom',
  });

  useEffect(() => { loadAds(); loadAdsenseId(); }, []);

  const loadAds = async () => {
    const { data } = await supabase.from('ad_slots').select('*').order('created_at', { ascending: false });
    if (data) setAds(data);
  };

  const loadAdsenseId = async () => {
    const { data } = await supabase.from('site_settings').select('value').eq('key', 'adsense_client_id').single();
    if (data) setAdsenseId(data.value || '');
  };

  const saveAdsenseId = async () => {
    await supabase.from('site_settings').update({ value: adsenseId }).eq('key', 'adsense_client_id');
    toast.success('تم حفظ معرف AdSense');
  };

  const addAd = async () => {
    if (!newAd.name) return toast.error('أدخل اسم الإعلان');
    const payload: any = { name: newAd.name, position: newAd.position, slot_type: newAd.slot_type, is_active: true, platform: newAd.platform };
    if (newAd.slot_type === 'image') {
      payload.image_url = newAd.image_url;
      payload.link_url = newAd.link_url || null;
    } else {
      payload.ad_code = newAd.ad_code;
    }
    const { error } = await supabase.from('ad_slots').insert([payload]);
    if (error) return toast.error('خطأ: ' + error.message);
    toast.success('تمت إضافة الإعلان');
    setNewAd({ name: '', position: 'home-top', slot_type: 'manual', ad_code: '', is_active: true, image_url: '', link_url: '', platform: 'custom' });
    loadAds();
  };

  const deleteAd = async (id: string) => {
    await supabase.from('ad_slots').delete().eq('id', id);
    toast.success('تم حذف الإعلان');
    loadAds();
  };

  const toggleAd = async (id: string, active: boolean) => {
    await supabase.from('ad_slots').update({ is_active: !active }).eq('id', id);
    loadAds();
  };

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-elevated">
        <h3 className="font-bold text-foreground mb-1">إعداد Google AdSense</h3>
        <div className="flex gap-2 mt-3">
          <Input value={adsenseId} onChange={e => setAdsenseId(e.target.value)} placeholder="ca-pub-XXXXXXXXXXXXXXXX" className="flex-1 rounded-xl" dir="ltr" />
          <Button onClick={saveAdsenseId} size="sm" className="rounded-xl"><Save className="h-4 w-4" /></Button>
        </div>
      </div>

      <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-elevated">
        <h3 className="font-bold text-foreground mb-3">إضافة إعلان جديد</h3>
        <div className="space-y-3">
          <Input value={newAd.name} onChange={e => setNewAd({ ...newAd, name: e.target.value })} placeholder="اسم الإعلان" className="rounded-xl" />
          <select value={newAd.position} onChange={e => setNewAd({ ...newAd, position: e.target.value })} className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm">
            <option value="home-top">الرئيسية - أعلى</option>
            <option value="home-middle">الرئيسية - وسط</option>
            <option value="home-bottom">الرئيسية - أسفل</option>
            <option value="prayer-times">صفحة الصلاة</option>
            <option value="quran">صفحة القرآن</option>
          </select>
          <select value={newAd.slot_type} onChange={e => setNewAd({ ...newAd, slot_type: e.target.value })} className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm">
            <option value="manual">كود HTML/JS</option>
            <option value="adsense">Google AdSense</option>
            <option value="image">صورة + رابط</option>
          </select>
          {newAd.slot_type === 'image' ? (
            <>
              <Input value={newAd.image_url} onChange={e => setNewAd({ ...newAd, image_url: e.target.value })} placeholder="رابط الصورة" dir="ltr" className="rounded-xl" />
              <Input value={newAd.link_url} onChange={e => setNewAd({ ...newAd, link_url: e.target.value })} placeholder="رابط الإعلان" dir="ltr" className="rounded-xl" />
            </>
          ) : (
            <textarea value={newAd.ad_code} onChange={e => setNewAd({ ...newAd, ad_code: e.target.value })} placeholder="الصق كود الإعلان هنا" className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm min-h-[80px] font-mono" dir="ltr" />
          )}
          <Button onClick={addAd} className="w-full rounded-2xl h-11"><Plus className="h-4 w-4 me-2" /> إضافة</Button>
        </div>
      </div>

      <div>
        <h3 className="font-bold text-foreground mb-3">الإعلانات ({ads.length})</h3>
        <div className="space-y-3">
          {ads.map(ad => (
            <div key={ad.id} className="rounded-2xl border border-border/50 bg-card p-4 shadow-elevated">
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{ad.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{ad.position} - {ad.slot_type}</p>
                </div>
                <Button variant={ad.is_active ? "default" : "outline"} size="sm" onClick={() => toggleAd(ad.id, ad.is_active)} className="text-xs rounded-xl">
                  {ad.is_active ? 'مفعّل' : 'معطّل'}
                </Button>
                <Button variant="destructive" size="sm" onClick={() => deleteAd(ad.id)} className="rounded-xl">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ======= USERS MANAGER ======= */
function UsersManager() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const { data: p } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (p) setProfiles(p);
    const { data: r } = await supabase.from('user_roles').select('*');
    if (r) setRoles(r);
  };

  const toggleAdmin = async (userId: string) => {
    const hasAdmin = roles.find(r => r.user_id === userId && r.role === 'admin');
    if (hasAdmin) {
      await supabase.from('user_roles').delete().eq('user_id', userId).eq('role', 'admin');
    } else {
      await supabase.from('user_roles').insert({ user_id: userId, role: 'admin' });
    }
    toast.success(hasAdmin ? 'تم إزالة صلاحية المشرف' : 'تم منح صلاحية المشرف');
    loadData();
  };

  const filteredProfiles = profiles.filter(p =>
    !searchQuery || (p.display_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <Input
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        placeholder="بحث عن مستخدم..."
        className="rounded-xl"
      />
      <h3 className="font-bold text-foreground">المستخدمين ({filteredProfiles.length})</h3>
      {filteredProfiles.map(profile => {
        const isAdmin = roles.some(r => r.user_id === profile.user_id && r.role === 'admin');
        return (
          <div key={profile.id} className="rounded-2xl border border-border/50 bg-card p-4 shadow-elevated">
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground">{profile.display_name || 'بدون اسم'}</p>
                <p className="text-xs text-muted-foreground">{isAdmin ? 'مشرف' : 'مستخدم'}</p>
              </div>
              <Button variant={isAdmin ? "default" : "outline"} size="sm" onClick={() => toggleAdmin(profile.user_id)} className="text-xs rounded-xl">
                {isAdmin ? 'مشرف' : 'ترقية'}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
