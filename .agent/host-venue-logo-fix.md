# Fix: Host and Venue Logo Not Sent in Order API

## Problem
Host images and venue logo were not being sent correctly in the order creation API request because of incorrect field name mapping.

## Root Cause
The temp files were being stored with generic names (`host_0`, `host_1`, `sponsor_0`, etc.) but the backend API expects specific field names:

### Backend Expected Field Names:
- **Venue Logo**: `venue_logo` ✅
- **Venue Logo URL**: `venue_logo_url` ✅
- **Venue Text**: `venue_text` ✅
- **DJ Images**: `dj_0`, `dj_1`, `dj_2`, `dj_3` ✅
- **Host Images**: 
  - First host: `host` (NOT `host_0`!) ❌ **This was the bug**
  - Second host: `host_1` ✅
  - Third host: `host_2` ✅
- **Sponsor Images**: 
  - `sponsor_sponsor1` (NOT `sponsor_0`!) ❌ **This was the bug**
  - `sponsor_sponsor2` (NOT `sponsor_1`!) ❌ **This was the bug**
  - `sponsor_sponsor3` (NOT `sponsor_2`!) ❌ **This was the bug**

## Solution

Updated `/app/api/checkout/success/route.ts` to properly map temp file field names:

```typescript
// Map field names to what backend expects
let backendFieldName = fieldName;

// Host mapping: host_0 → host, host_1 → host_1, host_2 → host_2
if (fieldName === 'host_0') {
  backendFieldName = 'host';
}
// Sponsor mapping: sponsor_0 → sponsor_sponsor1, sponsor_1 → sponsor_sponsor2, etc.
else if (fieldName.startsWith('sponsor_')) {
  const sponsorIndex = parseInt(fieldName.split('_')[1]);
  backendFieldName = `sponsor_sponsor${sponsorIndex + 1}`;
}
// DJ and venue_logo stay as is: dj_0, dj_1, venue_logo

formData.append(backendFieldName, blob as any, filepath.split(/[\\\/]/).pop());
console.log(`✅ Attached file ${fieldName} → ${backendFieldName} from ${filepath}`);
```

## Changes Made

### 1. Added Field Name Mapping Logic
- Host images now correctly map: `host_0` → `host`, `host_1` → `host_1`
- Sponsor images now correctly map: `sponsor_0` → `sponsor_sponsor1`, etc.
- DJ images remain as is: `dj_0`, `dj_1`, etc.
- Venue logo remains as is: `venue_logo`

### 2. Added Missing Fields
- Added `venue_text` field to FormData
- Added `venue_logo_url` field to FormData

### 3. Enhanced Logging
- Now logs the field name transformation: `host_0 → host`
- Helps debug any future mapping issues

## Complete Field Mapping Table

| Temp File Name | Backend Field Name | Description |
|----------------|-------------------|-------------|
| `venue_logo` | `venue_logo` | Venue logo image file |
| `dj_0` | `dj_0` | First DJ image |
| `dj_1` | `dj_1` | Second DJ image |
| `dj_2` | `dj_2` | Third DJ image |
| `dj_3` | `dj_3` | Fourth DJ image |
| `host_0` | **`host`** ⚠️ | First host image (special mapping!) |
| `host_1` | `host_1` | Second host image |
| `host_2` | `host_2` | Third host image |
| `sponsor_0` | **`sponsor_sponsor1`** ⚠️ | First sponsor image |
| `sponsor_1` | **`sponsor_sponsor2`** ⚠️ | Second sponsor image |
| `sponsor_2` | **`sponsor_sponsor3`** ⚠️ | Third sponsor image |

## Testing

To verify the fix works:

1. Fill out a form with:
   - Venue logo
   - At least 1 host with image
   - At least 1 sponsor with image
   - At least 1 DJ with image

2. Click "Checkout Now"

3. Complete Stripe payment

4. Check backend logs for:
   ```
   ✅ Attached file host_0 → host from tmp/uploads/...
   ✅ Attached file sponsor_0 → sponsor_sponsor1 from tmp/uploads/...
   ✅ Attached file venue_logo → venue_logo from tmp/uploads/...
   ```

5. Verify order is created with all images in the database

## Files Modified

- ✅ `/app/api/checkout/success/route.ts` - Added field name mapping logic
