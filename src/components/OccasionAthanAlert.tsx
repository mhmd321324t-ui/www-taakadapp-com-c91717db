import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2 } from 'lucide-react';
import { stopAthan } from '@/lib/athanAudio';
import { IslamicOccasion } from '@/data/islamicOccasions';
import RamadanCannon from './RamadanCannon';

const PRAYER_INFO: Record<string, { name: string; icon: string }> = {
  fajr: { name: 'الفجر', icon: '🌅' },
  dhuhr: { name: 'الظهر', icon: '🌞' },
  asr: { name: 'العصر', icon: '🌤️' },
  maghrib: { name: 'المغرب', icon: '🌅' },
  isha: { name: 'العشاء', icon: '🌙' },
};

interface OccasionAthanAlertProps {
  prayerKey: string | null;
  prayerTime: string;
  occasion: IslamicOccasion | null;
  onDismiss: () => void;
}

export default function OccasionAthanAlert({ prayerKey, prayerTime, occasion, onDismiss }: OccasionAthanAlertProps) {
  const [visible, setVisible] = useState(false);
  const [showCannon, setShowCannon] = useState(false);
  const [cannonDone, setCannonDone] = useState(false);

  useEffect(() => {
    if (prayerKey) {
      // If Ramadan + Maghrib, show cannon first
      if (occasion?.hasCannon && prayerKey === 'maghrib') {
        setShowCannon(true);
      } else {
        setVisible(true);
      }
    }
  }, [prayerKey, occasion]);

  const handleCannonComplete = useCallback(() => {
    setCannonDone(true);
    setShowCannon(false);
    setVisible(true);
  }, []);

  const handleDismiss = useCallback(() => {
    setVisible(false);
    stopAthan();
    setTimeout(onDismiss, 400);
  }, [onDismiss]);

  // Auto-dismiss after 5 minutes
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(handleDismiss, 5 * 60 * 1000);
    return () => clearTimeout(timer);
  }, [visible, handleDismiss]);

  const info = prayerKey ? PRAYER_INFO[prayerKey] : null;
  if (!info) return null;

  const gradient = occasion?.gradient || getDefaultGradient(prayerKey!);
  const isTakbirat = occasion?.takbirat;
  const isIftar = occasion?.hasCannon && prayerKey === 'maghrib';

  return (
    <>
      {/* Cannon animation for Ramadan Maghrib */}
      <RamadanCannon show={showCannon} onComplete={handleCannonComplete} />

      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-b ${gradient}`}
            dir="rtl"
          >
            {/* Islamic pattern overlay */}
            <div className="absolute inset-0 islamic-pattern opacity-10" />

            {/* Animated particles for occasions */}
            {occasion && Array.from({ length: 15 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 100 }}
                animate={{
                  opacity: [0, 0.6, 0],
                  y: [-20, -200],
                  x: [0, (Math.random() - 0.5) * 100],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  delay: i * 0.3,
                  repeat: Infinity,
                }}
                className="absolute bottom-0 text-2xl"
                style={{ left: `${Math.random() * 100}%` }}
              >
                {occasion.emoji}
              </motion.div>
            ))}

            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-8 left-6 p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 transition-all active:scale-95 z-10"
            >
              <X className="h-5 w-5 text-white" />
            </button>

            {/* Content */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: cannonDone ? 0 : 0.2, type: 'spring', damping: 20 }}
              className="flex flex-col items-center text-center px-8 relative z-10"
            >
              {/* Occasion badge */}
              {occasion && (
                <motion.div
                  initial={{ y: -30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-4"
                >
                  <span className="text-white/90 text-xs font-medium">{occasion.nameAr}</span>
                </motion.div>
              )}

              {/* Prayer icon */}
              <motion.span
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="text-7xl mb-6"
              >
                {isIftar ? '🌙' : info.icon}
              </motion.span>

              {/* Title */}
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-white/60 text-lg font-medium mb-2"
              >
                {isIftar ? 'حان وقت الإفطار' : isTakbirat ? 'اللّهُ أَكْبَرُ' : 'حان وقت الصلاة'}
              </motion.p>

              {/* Prayer name */}
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-white text-5xl font-bold mb-4"
              >
                {isIftar ? 'الإفطار' : `صلاة ${info.name}`}
              </motion.h1>

              {/* Time */}
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-white/80 text-3xl font-light tabular-nums mb-6"
              >
                {prayerTime}
              </motion.p>

              {/* Iftar dua */}
              {isIftar && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/15 px-6 py-4 mb-6 max-w-xs"
                >
                  <p className="text-white text-base font-arabic leading-[2] text-center">
                    {occasion?.duaAr}
                  </p>
                  <p className="text-white/40 text-xs mt-2">دعاء الإفطار</p>
                </motion.div>
              )}

              {/* Audio indicator */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-5 py-3 border border-white/20 mb-10"
              >
                <Volume2 className="h-4 w-4 text-white/70 animate-pulse" />
                <span className="text-white/70 text-sm">
                  {isTakbirat ? 'جاري تشغيل التكبيرات...' : 'جاري تشغيل الأذان...'}
                </span>
              </motion.div>

              {/* Decorative verse / occasion message */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-white/30 text-sm font-arabic leading-relaxed max-w-xs"
              >
                {occasion?.message || 'حَافِظُوا عَلَى الصَّلَوَاتِ وَالصَّلَاةِ الْوُسْطَىٰ وَقُومُوا لِلَّهِ قَانِتِينَ'}
              </motion.p>
            </motion.div>

            {/* Dismiss button at bottom */}
            <motion.button
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              onClick={handleDismiss}
              className="absolute bottom-12 bg-white/15 backdrop-blur-sm border border-white/25 text-white font-semibold rounded-2xl px-10 py-4 text-base transition-all active:scale-95 z-10"
            >
              إغلاق
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function getDefaultGradient(prayerKey: string): string {
  const gradients: Record<string, string> = {
    fajr: 'from-indigo-900 via-purple-900 to-slate-900',
    dhuhr: 'from-amber-700 via-orange-800 to-yellow-900',
    asr: 'from-sky-800 via-blue-900 to-indigo-900',
    maghrib: 'from-orange-800 via-red-900 to-purple-900',
    isha: 'from-slate-900 via-indigo-950 to-black',
  };
  return gradients[prayerKey] || gradients.isha;
}
