

## Plan: Fix Mosque Prayer Times Accuracy

### Root Cause Analysis
The prayer times for mosques are inaccurate because:
1. **Edge function timing out**: The `fetch-mosque-times` function tries Mawaqit API search with multiple variants, which is slow and often times out (all logs show "shutdown").
2. **Coordinate mismatch**: When the edge function fails, the Aladhan fallback uses the **mosque's** GPS coordinates instead of the **user's** coordinates. Even a small difference (e.g., 100m) can cause 1-3 minute differences in calculated prayer times.
3. **Rejecting calculated times**: `useSavedMosqueTimes` explicitly rejects `source === 'calculated'` from the edge function, causing it to make a separate Aladhan call with different parameters.
4. **No hourly refresh**: Times are cached daily with no periodic update mechanism.
5. **Stale localStorage caches**: Old cached times from previous days persist and may be served.

### Changes

#### 1. Fix `useSavedMosqueTimes.tsx`
- **Accept `calculated` source** from edge function instead of rejecting it
- **Use USER's coordinates** (from `cached-location`) for the Aladhan fallback instead of mosque coordinates -- this ensures mosque page times match the main prayer times exactly
- **Add hourly refresh**: Change the refresh interval from daily to hourly (clear live cache every hour)
- **Clear stale caches**: On each load, remove previous day's live cache entries

#### 2. Fix `MosquePrayerTimes.tsx`
- Same Aladhan fallback fix: use user's coordinates when mosque has no real Mawaqit/website data
- Add hourly re-fetch for selected mosque times
- Ensure `loadTimesForMosque` accepts `calculated` source from edge function

#### 3. Simplify Edge Function `fetch-mosque-times/index.ts`
- Reduce search variants to max 3 (instead of 6) to prevent timeouts
- Add a 5-second timeout on Mawaqit API calls
- Always return Aladhan calculated times as fallback (don't let it fail silently)

#### 4. Clear stale caches
- On app load, clear any `mosque_live_*`, `mosque_api_*` keys from previous days to prevent serving stale data

### Technical Details

**Coordinate fix** (the main accuracy fix):
```
// BEFORE (wrong - uses mosque coords, causing 1-3 min drift)
fetch(`...?latitude=${mosque.latitude}&longitude=${mosque.longitude}...`)

// AFTER (correct - uses user's coords for consistency)  
const userLoc = JSON.parse(localStorage.getItem('cached-location'));
fetch(`...?latitude=${userLoc.latitude}&longitude=${userLoc.longitude}...`)
```

**Hourly refresh** in `useSavedMosqueTimes`:
- Track last fetch timestamp
- Re-fetch if more than 60 minutes since last fetch
- This ensures times stay accurate throughout the day

**Edge function timeout protection**:
```
// Add AbortController with 5s timeout on Mawaqit calls
const controller = new AbortController();
setTimeout(() => controller.abort(), 5000);
fetch(url, { signal: controller.signal, ... })
```

