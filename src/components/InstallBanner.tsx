import { useState, useEffect, useMemo } from 'react';
import { X, Download, Share } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
}

function isInStandaloneMode() {
  return window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as any).standalone === true;
}

export default function InstallBanner() {
  const [show, setShow] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const ios = useMemo(() => isIOS(), []);

  useEffect(() => {
    if (isInStandaloneMode()) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);

    const showTimer = setTimeout(() => setShow(true), 5000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      clearTimeout(showTimer);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShow(false);
    }
    setDeferredPrompt(null);
  };

  const dismiss = () => setShow(false);

  if (typeof window !== 'undefined' && isInStandaloneMode()) {
    return null;
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="install-banner"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-20 left-4 right-4 z-[70] rounded-2xl bg-card border border-border p-4 shadow-2xl"
          dir="rtl"
        >
          <button
            onClick={dismiss}
            className="absolute top-3 left-3 p-1 rounded-full hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>

          <div className="flex items-center gap-3">
            <img src="/pwa-icon-192.png" alt="تأكد" className="h-12 w-12 rounded-xl shadow" />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-foreground">ثبّت تطبيق تأكد 📲</h3>
              {ios ? (
                <p className="text-xs text-muted-foreground mt-0.5">
                  اضغط <Share className="inline h-3.5 w-3.5 mx-0.5 -mt-0.5" /> ثم "إضافة للشاشة الرئيسية"
                </p>
              ) : (
                <p className="text-xs text-muted-foreground mt-0.5">وصول سريع بدون متصفح</p>
              )}
            </div>
            {!ios && (
              <button
                onClick={deferredPrompt ? handleInstall : dismiss}
                className="shrink-0 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow active:scale-95 transition-transform flex items-center gap-1.5"
              >
                <Download className="h-4 w-4" />
                تثبيت
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
