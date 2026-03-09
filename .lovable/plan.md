

## Plan: Fix Mosque Prayer Times to Match Mawaqit

### Problem
The edge function `fetch-mosque-times` times out constantly (logs show endless "shutdown" events). When it times out, the client falls back to Aladhan calculated times which differ from the actual mosque iqamah/athan times on Mawaqit. The Mawaqit API **does** return correct data (verified: Tawba returns `["05:11","06:53","12:45","15:45","18:28","20:13"]` with iqama offsets), but the function is too slow to respond before the edge function gets killed.

### Root Cause
The edge function tries too many things sequentially: Mawaqit slug scrape, Mawaqit API with multiple search variants, website AI extraction, then Aladhan. Each step has its own timeout but the total exceeds the edge function limit.

### Solution: Rewrite edge function to be fast and Mawaqit-first

#### 1. Rewrite `supabase/functions/fetch-mosque-times/index.ts`
- Strip out slug scraping, AI website extraction, and multi-variant search
- Single Mawaqit API call with ONE search term + coordinates (3s timeout)
- If Mawaqit returns results, return the **first match** immediately (no `namesMatch` filtering that might miss)
- Include `iqama` offsets and `jumua` in the response
- Aladhan fallback only if Mawaqit returns nothing (3s timeout)
- Total function execution: under 6 seconds guaranteed

#### 2. Update `src/hooks/useSavedMosqueTimes.tsx`
- Accept and display iqama data from Mawaqit
- Remove the redundant direct Aladhan fallback (edge function handles it)
- Keep hourly cache refresh

#### 3. Update `src/pages/MosquePrayerTimes.tsx`
- Same: simplify `loadTimesForMosque` to trust edge function result
- Remove redundant `fetchAladhanTimes` fallback
- Display iqama offsets if available from Mawaqit
- Show Jumua time from Mawaqit data

### Key Data Point
Mawaqit API response includes:
- `times`: array of 6 athan times [fajr, sunrise, dhuhr, asr, maghrib, isha]
- `iqama`: array of 5 offsets ["+0", "+10", "+10", "+0", "+20"]
- `jumua`: "13:15"
- `iqamaEnabled`: true/false

The edge function will return all of this so the client can display both athan and iqamah times.

