import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, RotateCcw, Smartphone, Info, Map, Compass, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface QiblaEnhancedProps {
  latitude: number;
  longitude: number;
}

function calculateQiblaDirection(lat: number, lng: number): number {
  const makkahLat = 21.4225 * (Math.PI / 180);
  const makkahLng = 39.8262 * (Math.PI / 180);
  const userLat = lat * (Math.PI / 180);
  const userLng = lng * (Math.PI / 180);
  const dLng = makkahLng - userLng;
  const x = Math.sin(dLng);
  const y = Math.cos(userLat) * Math.tan(makkahLat) - Math.sin(userLat) * Math.cos(dLng);
  let qibla = Math.atan2(x, y) * (180 / Math.PI);
  return (qibla + 360) % 360;
}

function calculateDistance(lat1: number, lng1: number): number {
  const R = 6371;
  const dLat = (21.4225 - lat1) * (Math.PI / 180);
  const dLng = (39.8262 - lng1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(21.4225 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const compassDirections = [
  { label: 'N', angle: 0 },
  { label: 'NE', angle: 45 },
  { label: 'E', angle: 90 },
  { label: 'SE', angle: 135 },
  { label: 'S', angle: 180 },
  { label: 'SW', angle: 225 },
  { label: 'W', angle: 270 },
  { label: 'NW', angle: 315 },
];

function useEnhancedCompass() {
  const [heading, setHeading] = useState(0);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [hasCompass, setHasCompass] = useState<boolean | null>(null);
  const [permissionNeeded, setPermissionNeeded] = useState(false);
  const headingBuffer = useRef<number[]>([]);
  const BUFFER_SIZE = 12;

  const smoothHeading = useCallback((raw: number) => {
    const buf = headingBuffer.current;
    buf.push(raw);
    if (buf.length > BUFFER_SIZE) buf.shift();

    let sinSum = 0, cosSum = 0;
    for (const h of buf) {
      sinSum += Math.sin(h * Math.PI / 180);
      cosSum += Math.cos(h * Math.PI / 180);
    }
    const avg = Math.atan2(sinSum / buf.length, cosSum / buf.length) * 180 / Math.PI;
    return ((avg % 360) + 360) % 360;
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof DeviceOrientationEvent !== 'undefined' &&
      typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const r = await (DeviceOrientationEvent as any).requestPermission();
        if (r === 'granted') {
          setPermissionNeeded(false);
          startListening();
        }
      } catch {
        setHasCompass(false);
      }
    }
  }, []);

  const startListening = useCallback(() => {
    const handler = (e: DeviceOrientationEvent) => {
      let raw: number | null = null;

      if ((e as any).webkitCompassHeading != null) {
        raw = (e as any).webkitCompassHeading;
        if ((e as any).webkitCompassAccuracy != null) {
          setAccuracy((e as any).webkitCompassAccuracy);
        }
      } else if (e.alpha != null) {
        raw = (360 - e.alpha) % 360;
        if ((e as any).absolute === false) {
          setAccuracy(null);
        } else {
          setAccuracy(5);
        }
      }

      if (raw != null) {
        setHasCompass(true);
        setHeading(smoothHeading(raw));
      }
    };

    window.addEventListener('deviceorientation', handler, true);
    
    const timeout = setTimeout(() => {
      if (headingBuffer.current.length === 0) {
        setHasCompass(false);
      }
    }, 3000);

    return () => {
      window.removeEventListener('deviceorientation', handler, true);
      clearTimeout(timeout);
    };
  }, [smoothHeading]);

  useEffect(() => {
    if (typeof DeviceOrientationEvent !== 'undefined' &&
      typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      setPermissionNeeded(true);
    } else {
      const cleanup = startListening();
      return cleanup;
    }
  }, [startListening]);

  return { heading, accuracy, hasCompass, permissionNeeded, requestPermission };
}

export default function QiblaEnhanced({ latitude, longitude }: QiblaEnhancedProps) {
  const { heading: compass, accuracy, hasCompass, permissionNeeded, requestPermission } = useEnhancedCompass();
  const [calibrating, setCalibrating] = useState(false);

  const qiblaAngle = calculateQiblaDirection(latitude, longitude);
  const distance = calculateDistance(latitude, longitude);
  const rotation = qiblaAngle - compass;
  const normalizedRotation = ((rotation % 360) + 360) % 360;
  const isAligned = normalizedRotation < 5 || normalizedRotation > 355;
  const isLowAccuracy = accuracy != null && accuracy > 15;
  const isNoLocation = latitude === 0 && longitude === 0;

  const calibrate = () => {
    setCalibrating(true);
    toast.success('حرّك الهاتف بشكل رقم 8 لمعايرة البوصلة');
    setTimeout(() => setCalibrating(false), 3000);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* iOS Permission request */}
      {permissionNeeded && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={requestPermission}
          className="w-full rounded-2xl border border-primary bg-primary/10 p-4 flex items-center gap-3 justify-center"
        >
          <Smartphone className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-primary">اضغط لتفعيل البوصلة</span>
        </motion.button>
      )}

      {/* No compass warning */}
      {hasCompass === false && (
        <div className="w-full rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
          <div className="flex items-center gap-2 justify-end mb-2">
            <p className="text-sm font-bold text-destructive">البوصلة غير متاحة</p>
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <p className="text-xs text-muted-foreground text-right">
            جهازك لا يدعم البوصلة. استخدم الزاوية: {Math.round(qiblaAngle)}°
          </p>
        </div>
      )}

      {/* Low accuracy warning */}
      <AnimatePresence>
        {isLowAccuracy && !calibrating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-4 flex items-center justify-between"
          >
            <button
              onClick={calibrate}
              className="flex items-center gap-1 rounded-full bg-yellow-500/20 px-3 py-1.5 text-xs font-medium text-yellow-600"
            >
              <RotateCcw className="h-3 w-3" />
              معايرة
            </button>
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">دقة منخفضة - حرّك الهاتف بشكل ∞</p>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Calibration animation */}
      <AnimatePresence>
        {calibrating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full rounded-xl bg-primary/5 border border-primary/20 p-5 text-center"
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
              className="text-3xl inline-block mb-2"
            >
              ♾️
            </motion.div>
            <p className="text-sm text-primary font-medium">حرّك هاتفك بشكل رقم 8...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compass Display */}
      <div className="relative w-full aspect-square max-w-[320px]">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-2 border-border" />
        
        {/* Tick marks */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 300">
          {Array.from({ length: 72 }).map((_, i) => {
            const angle = i * 5;
            const isMajor = angle % 45 === 0;
            const r1 = isMajor ? 138 : 142;
            const r2 = 148;
            const rad = (angle - 90) * (Math.PI / 180);
            return (
              <line
                key={i}
                x1={150 + r1 * Math.cos(rad)}
                y1={150 + r1 * Math.sin(rad)}
                x2={150 + r2 * Math.cos(rad)}
                y2={150 + r2 * Math.sin(rad)}
                className={cn(
                  isMajor ? 'stroke-foreground/40' : 'stroke-muted-foreground/20'
                )}
                strokeWidth={isMajor ? 2 : 1}
              />
            );
          })}
        </svg>

        {/* Rotating compass body */}
        <motion.div
          className="absolute inset-3 rounded-full bg-card border border-border shadow-lg"
          animate={{ rotate: -compass }}
          transition={{ type: 'spring', stiffness: 80, damping: 25 }}
        >
          {/* Cardinal directions */}
          {compassDirections.map(({ label, angle }) => {
            const rad = (angle - 90) * (Math.PI / 180);
            const r = label.length === 1 ? 105 : 108;
            const isPrimary = label.length === 1;
            return (
              <motion.span
                key={label}
                className={cn(
                  'absolute text-center font-bold',
                  isPrimary ? 'text-sm text-foreground' : 'text-[9px] text-muted-foreground',
                  label === 'N' && 'text-primary'
                )}
                style={{
                  left: `calc(50% + ${r * Math.cos(rad)}px)`,
                  top: `calc(50% + ${r * Math.sin(rad)}px)`,
                  transform: `translate(-50%, -50%)`,
                }}
                animate={{ rotate: compass }}
                transition={{ type: 'spring', stiffness: 80, damping: 25 }}
              >
                {label}
              </motion.span>
            );
          })}

          {/* Qibla indicator */}
          <div
            className="absolute inset-0"
            style={{ transform: `rotate(${qiblaAngle}deg)` }}
          >
            <div className="absolute left-1/2 -translate-x-1/2 top-3 flex flex-col items-center">
              <motion.div
                animate={isAligned ? { scale: [1, 1.4, 1] } : { scale: 1 }}
                transition={{ repeat: isAligned ? Infinity : 0, duration: 1 }}
                className="text-4xl"
                style={{ transform: `rotate(${-qiblaAngle + compass}deg)` }}
              >
                🕋
              </motion.div>
            </div>
          </div>

          {/* Inner circle */}
          <div className="absolute inset-6 rounded-full border border-border/30" />
        </motion.div>

        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-3 w-3 rounded-full bg-primary" />
        </div>
      </div>

      {/* Status Info */}
      <div className="w-full space-y-2">
        <div className={cn(
          'rounded-2xl p-4 text-center transition-all',
          isAligned
            ? 'bg-green-500/10 border border-green-500/30'
            : 'bg-card border border-border/50'
        )}>
          <p className={cn(
            'text-sm font-bold',
            isAligned ? 'text-green-600' : 'text-foreground'
          )}>
            {isAligned ? '✓ أنت متجه نحو القبلة!' : `الاتجاه: ${Math.round(normalizedRotation)}°`}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            المسافة إلى الكعبة: {distance.toFixed(0)} كم
          </p>
        </div>

        {accuracy !== null && (
          <div className="rounded-2xl bg-card border border-border/50 p-3 text-center">
            <p className="text-xs text-muted-foreground">
              دقة البوصلة: ±{Math.round(accuracy)}°
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
