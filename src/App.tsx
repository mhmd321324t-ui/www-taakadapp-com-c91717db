import { lazy, Suspense, useState, useCallback, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LocaleProvider } from "@/hooks/useLocale";
import { AuthProvider } from "@/hooks/useAuth";
import { AppLayout } from "@/components/layout/AppLayout";
import { useSEO } from "@/hooks/useSEO";
import { usePrefetch } from "@/hooks/usePrefetch";
import SplashScreen from "@/components/SplashScreen";
import ScrollToTop from "@/components/ScrollToTop";
import AppErrorBoundary from "@/components/AppErrorBoundary";
import Index from "./pages/Index";
import { initializeSecurity } from "@/lib/securityConfig";
import { initializeNotificationSystem } from "@/lib/notificationManager";
import { safeSessionGet, safeSessionRemove, safeSessionSet } from "@/lib/safeStorage";

const PrayerTimes = lazy(() => import("./pages/PrayerTimes"));
const Qibla = lazy(() => import("./pages/Qibla"));
const Quran = lazy(() => import("./pages/Quran"));
const SurahView = lazy(() => import("./pages/SurahView"));
const Tasbeeh = lazy(() => import("./pages/Tasbeeh"));
const Duas = lazy(() => import("./pages/Duas"));
const More = lazy(() => import("./pages/More"));
const PrayerTracker = lazy(() => import("./pages/PrayerTracker"));
const ZakatCalculator = lazy(() => import("./pages/ZakatCalculator"));
const Auth = lazy(() => import("./pages/Auth"));
const Stories = lazy(() => import("./pages/Stories"));
const Install = lazy(() => import("./pages/Install"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const Account = lazy(() => import("./pages/Account"));
const DailyDuas = lazy(() => import("./pages/DailyDuas"));
const MosquePrayerTimes = lazy(() => import("./pages/MosquePrayerTimes"));
const RamadanChallenge = lazy(() => import("./pages/RamadanChallenge"));
const RamadanCalendar = lazy(() => import("./pages/RamadanCalendar"));
const QuranGoal = lazy(() => import("./pages/QuranGoal"));
const DhikrSettings = lazy(() => import("./pages/DhikrSettings"));
const NotificationSettings = lazy(() => import("./pages/NotificationSettings"));
const Ruqyah = lazy(() => import("./pages/Ruqyah"));
const RamadanCards = lazy(() => import("./pages/RamadanCards"));
const RamadanBook = lazy(() => import("./pages/RamadanBook"));
const PeriodTracker = lazy(() => import("./pages/PeriodTracker"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();
const SPLASH_KEY = "splash_shown";
const CHUNK_RELOAD_GUARD_KEY = "chunk_reload_guard";
const BOT_UA_REGEX = /bot|crawl|spider|slurp|googlebot|bingbot|yandex|baidu|duckduck/i;

function SEOWrapper({ children }: { children: React.ReactNode }) {
  useSEO();
  usePrefetch();
  return <>{children}</>;
}

function getInitialSplashDone() {
  const isBot = typeof navigator !== "undefined" && BOT_UA_REGEX.test(navigator.userAgent);
  if (isBot) return true;
  return safeSessionGet(SPLASH_KEY) === "1";
}

const App = () => {
  const [splashDone, setSplashDone] = useState(getInitialSplashDone);

  // Initialize security and notifications on app load
  useEffect(() => {
    initializeSecurity();
    initializeNotificationSystem();
  }, []);

  // Recover once from stale chunk/service-worker publish mismatches
  useEffect(() => {
    const isChunkError = (message: string) =>
      /Failed to fetch dynamically imported module|Loading chunk [\d]+ failed|ChunkLoadError/i.test(message);

    const reloadOnce = () => {
      if (safeSessionGet(CHUNK_RELOAD_GUARD_KEY) === "1") return;
      safeSessionSet(CHUNK_RELOAD_GUARD_KEY, "1");
      window.location.reload();
    };

    const onWindowError = (event: ErrorEvent) => {
      if (isChunkError(event.message || "")) {
        reloadOnce();
      }
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason as { message?: string } | string | null;
      const message = typeof reason === "string" ? reason : reason?.message ?? "";
      if (isChunkError(message)) {
        reloadOnce();
      }
    };

    window.addEventListener("error", onWindowError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);

    // Clear guard after successful runtime stability window
    const clearGuardTimer = window.setTimeout(() => {
      safeSessionRemove(CHUNK_RELOAD_GUARD_KEY);
    }, 15000);

    return () => {
      window.removeEventListener("error", onWindowError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
      window.clearTimeout(clearGuardTimer);
    };
  }, []);

  const handleSplashComplete = useCallback(() => {
    safeSessionSet(SPLASH_KEY, "1");
    setSplashDone(true);
  }, []);

  return (
    <AppErrorBoundary>
      {!splashDone ? (
        <SplashScreen onComplete={handleSplashComplete} />
      ) : (
        <QueryClientProvider client={queryClient}>
          <LocaleProvider>
            <AuthProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <ScrollToTop />
                  <SEOWrapper>
                    <AppLayout>
                      <Suspense fallback={<div className="min-h-screen" />}>
                        <Routes>
                          <Route path="/" element={<Index />} />
                          <Route path="/prayer-times" element={<PrayerTimes />} />
                          <Route path="/qibla" element={<Qibla />} />
                          <Route path="/quran" element={<Quran />} />
                          <Route path="/quran/:id" element={<SurahView />} />
                          <Route path="/tasbeeh" element={<Tasbeeh />} />
                          <Route path="/duas" element={<Duas />} />
                          <Route path="/more" element={<More />} />
                          <Route path="/tracker" element={<PrayerTracker />} />
                          <Route path="/zakat" element={<ZakatCalculator />} />
                          <Route path="/stories" element={<Stories />} />
                          <Route path="/auth" element={<Auth />} />
                          <Route path="/account" element={<Account />} />
                          <Route path="/admin" element={<AdminDashboard />} />
                          <Route path="/install" element={<Install />} />
                          <Route path="/daily-duas" element={<DailyDuas />} />
                          <Route path="/mosque-times" element={<MosquePrayerTimes />} />
                          <Route path="/ramadan-challenge" element={<RamadanChallenge />} />
                          <Route path="/ramadan-calendar" element={<RamadanCalendar />} />
                          <Route path="/quran-goal" element={<QuranGoal />} />
                          <Route path="/dhikr-settings" element={<DhikrSettings />} />
                          <Route path="/notifications" element={<NotificationSettings />} />
                          <Route path="/ruqyah" element={<Ruqyah />} />
                          <Route path="/ramadan-cards" element={<RamadanCards />} />
                          <Route path="/ramadan-book" element={<RamadanBook />} />
                          <Route path="/period-tracker" element={<PeriodTracker />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </Suspense>
                    </AppLayout>
                  </SEOWrapper>
                </BrowserRouter>
              </TooltipProvider>
            </AuthProvider>
          </LocaleProvider>
        </QueryClientProvider>
      )}
    </AppErrorBoundary>
  );
};

export default App;
