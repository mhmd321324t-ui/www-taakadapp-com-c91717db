

## Plan: Fix Build Errors (3 issues)

### Error 1: Unicode escape in `send-prayer-push/index.ts` line 49
The line has escaped quotes `\'mailto:...\'` instead of normal quotes. Fix: `'mailto:noreply@almuezzin.com'`

### Error 2: `npm:web-push@3.6.7` not found in `setup-push/index.ts`
Both edge functions import `web-push` the same way but setup-push fails. Need to add a `deno.json` with the npm import map, or use a direct ESM import. Since `send-prayer-push` has the same import and works, we need to ensure both have consistent `deno.json` files.

### Error 3: TypeScript errors in `SmartNotes.tsx`
`formData.priority` is typed as `'medium' as const` (line 28), making it always `"medium"`. When assigning `note.priority` (which is `'low' | 'medium' | 'high'`) it fails. Fix: type as `'low' | 'medium' | 'high'`.

### Error 4: `vibrate` not in `NotificationOptions` type in `notificationManager.ts`
TypeScript's `NotificationOptions` doesn't include `vibrate`. Fix: cast options or extend the type.

### Changes

1. **`supabase/functions/send-prayer-push/index.ts` line 49** — Fix escaped quotes to normal quotes
2. **`supabase/functions/setup-push/index.ts`** — Add deno.json or verify import works
3. **`src/components/SmartNotes.tsx` line 28** — Change type from `'medium' as const` to `'low' | 'medium' | 'high'`
4. **`src/lib/notificationManager.ts` line 232** — Cast notification options to `any` to allow `vibrate`

