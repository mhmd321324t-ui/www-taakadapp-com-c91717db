import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const PRAYER_NAMES: Record<string, string> = {
  Fajr: '🌅 الفجر',
  Dhuhr: '🌞 الظهر',
  Asr: '🌤️ العصر',
  Maghrib: '🌅 المغرب',
  Isha: '🌙 العشاء',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get VAPID keys from site_settings
    const { data: settings } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['vapid_public_key', 'vapid_private_key']);

    const publicKey = settings?.find((s: any) => s.key === 'vapid_public_key')?.value;
    const privateKey = settings?.find((s: any) => s.key === 'vapid_private_key')?.value;

    if (!publicKey || !privateKey) {
      return new Response(JSON.stringify({ error: 'VAPID keys not configured. Call setup-push first.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    webpush.setVapidDetails('mailto:noreply@taakadapp.com', publicKey, privateKey);

    // Get all push subscriptions
    const { data: subs } = await supabase.from('push_subscriptions').select('*');
    if (!subs || subs.length === 0) {
      return new Response(JSON.stringify({ sent: 0, reason: 'no subscriptions' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Group subscriptions by location (rounded to 0.1°) + calculation method
    const groups = new Map<string, { lat: number; lng: number; method: number; subs: any[] }>();
    for (const sub of subs) {
      if (!sub.latitude || !sub.longitude) continue;
      const key = `${Math.round(sub.latitude * 10) / 10},${Math.round(sub.longitude * 10) / 10},${sub.calculation_method || 2}`;
      if (!groups.has(key)) {
        groups.set(key, { lat: sub.latitude, lng: sub.longitude, method: sub.calculation_method || 2, subs: [] });
      }
      groups.get(key)!.subs.push(sub);
    }

    let totalSent = 0;
    const expiredEndpoints: string[] = [];

    for (const [_, group] of groups) {
      try {
        const now = new Date();
        const dd = String(now.getDate()).padStart(2, '0');
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const yyyy = now.getFullYear();

        const res = await fetch(
          `https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}?latitude=${group.lat}&longitude=${group.lng}&method=${group.method}`
        );
        const json = await res.json();
        if (json.code !== 200) continue;

        const timings = json.data.timings;
        const timezone = json.data.meta.timezone;

        // Get current local time for this timezone
        const localTimeStr = new Date().toLocaleString('en-US', { timeZone: timezone, hour12: false });
        const localDate = new Date(localTimeStr);
        const currentHH = String(localDate.getHours()).padStart(2, '0');
        const currentMM = String(localDate.getMinutes()).padStart(2, '0');
        const currentHHMM = `${currentHH}:${currentMM}`;

        for (const [prayerKey, prayerName] of Object.entries(PRAYER_NAMES)) {
          const rawTime = timings[prayerKey];
          if (!rawTime) continue;
          const prayerTime = rawTime.replace(/\s*\(.*\)$/, '').trim();

          if (prayerTime !== currentHHMM) continue;

          // Match! Send push to all subscribers in this location group
          const payload = JSON.stringify({
            title: 'حان وقت الصلاة 🕌',
            body: `${prayerName} - ${prayerTime}`,
            prayer: prayerKey.toLowerCase(),
            time: prayerTime,
            url: '/',
          });

          for (const sub of group.subs) {
            try {
              await webpush.sendNotification(
                {
                  endpoint: sub.endpoint,
                  keys: { p256dh: sub.p256dh, auth: sub.auth_key },
                },
                payload
              );
              totalSent++;
            } catch (err: any) {
              if (err.statusCode === 410 || err.statusCode === 404) {
                expiredEndpoints.push(sub.endpoint);
              }
              console.error(`Push failed for ${sub.endpoint}:`, err.message);
            }
          }
        }
      } catch (err) {
        console.error('Error processing location group:', err);
      }
    }

    // Clean up expired subscriptions
    if (expiredEndpoints.length > 0) {
      await supabase.from('push_subscriptions').delete().in('endpoint', expiredEndpoints);
    }

    return new Response(
      JSON.stringify({ sent: totalSent, total_subs: subs.length, cleaned: expiredEndpoints.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('send-prayer-push error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
