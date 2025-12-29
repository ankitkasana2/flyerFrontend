# Temp Upload Implementation Summary

## Overview
Successfully implemented temporary file storage during checkout across all flyer form types. Images are now stored in `tmp/uploads` during checkout and sent with the order creation API after successful Stripe payment.

## Changes Made

### 1. **flyer-form.tsx** (Default Form)
- ✅ Updated `handleSubmit` to use `saveToTemp()` instead of `saveToLibrary()`
- ✅ Added `saveToTemp` import from `@/lib/uploads`
- ✅ Created `tempFiles` object to track all uploaded file paths
- ✅ Added `temp_files` to API body sent to Stripe

**Files uploaded to temp:**
- Venue Logo → `venue_logo`
- DJs → `dj_0`, `dj_1`, `dj_2`, `dj_3`
- Hosts → `host_0`, `host_1`
- Sponsors → `sponsor_0`, `sponsor_1`, `sponsor_2`

### 2. **birthday-form.tsx**
- ✅ Updated `handleCheckout` to use `saveToTemp()`
- ✅ Added `saveToTemp` import
- ✅ Added `temp_files` to API body

**Files uploaded to temp:**
- Birthday Person Photo (stored as venue_logo) → `venue_logo`

### 3. **photo-10-form.tsx**
- ✅ Already implemented (no changes needed)
- Uses temp storage pattern correctly

### 4. **photo-15-form.tsx**
- ✅ Updated `handleCheckout` to use `saveToTemp()`
- ✅ Added `saveToTemp` import
- ✅ Added missing `useEffect` import
- ✅ Added `temp_files` to API body

**Files uploaded to temp:**
- Venue Logo → `venue_logo`
- All 4 DJs → `dj_0`, `dj_1`, `dj_2`, `dj_3`
- All 2 Hosts → `host_0`, `host_1`
- Sponsors → `sponsor_0`, `sponsor_1`, `sponsor_2`

## How It Works

### Checkout Flow:

1. **User clicks "Checkout Now"**
   ```
   User fills form → Clicks checkout
   ```

2. **Images uploaded to temp storage**
   ```typescript
   const tempFiles: Record<string, string> = {};
   const res = await saveToTemp(file, "venue_logo");
   if (res) tempFiles['venue_logo'] = res.filepath;
   ```
   - Files saved to: `tmp/uploads/{uploadId}/{fieldName}-{filename}`
   - Example: `tmp/uploads/checkout_1735459362123/venue_logo-logo.png`

3. **Temp file paths sent with Stripe metadata**
   ```typescript
   const apiBody = {
     // ... other order data
     temp_files: tempFiles // e.g., { "venue_logo": "tmp/uploads/.../file.png" }
   };
   ```

4. **Stripe session created**
   - Order data (including temp_files) encoded in base64
   - Stored in Stripe session metadata

5. **User completes payment**
   - Redirected to Stripe
   - Completes payment
   - Stripe redirects to `/api/checkout/success`

6. **Success handler processes order**
   ```typescript
   // In /api/checkout/success/route.ts
   if (formDataObj.temp_files) {
     for (const [fieldName, filepath] of Object.entries(formDataObj.temp_files)) {
       const buffer = await readFile(filepath);
       const blob = new Blob([buffer]);
       formData.append(fieldName, blob, filename);
     }
   }
   ```

7. **Order created with images**
   - Backend receives FormData with actual files
   - Order created successfully
   - Temp files cleaned up

## Backend Integration

The `/api/checkout/success/route.ts` already handles:
- ✅ Reading temp files from filesystem
- ✅ Attaching files to FormData
- ✅ Sending to backend API
- ✅ Cleaning up temp files after submission

## File Structure

```
tmp/
└── uploads/
    └── checkout_{timestamp}/
        ├── venue_logo-{filename}
        ├── dj_0-{filename}
        ├── dj_1-{filename}
        ├── host_0-{filename}
        ├── sponsor_0-{filename}
        └── ...
```

## Benefits

1. **No wasted storage**: Images only saved permanently if payment succeeds
2. **Better UX**: Faster checkout (no permanent upload delays)
3. **Cleaner architecture**: Separation of concerns (temp vs permanent)
4. **Automatic cleanup**: Temp files deleted after order creation
5. **Consistent pattern**: All forms now use the same approach

## Testing Checklist

- [ ] Test Default Form checkout with images
- [ ] Test Birthday Form checkout with photo
- [ ] Test Photo-10 Form checkout
- [ ] Test Photo-15 Form checkout
- [ ] Verify temp files are created in `tmp/uploads`
- [ ] Verify temp files are sent to backend API
- [ ] Verify temp files are cleaned up after success
- [ ] Test failed payment scenario (temp files should remain until retry)
- [ ] Verify order creation with all images

## Notes

- The `saveToTemp` function in `lib/uploads.ts` creates a unique `uploadId` for each checkout session
- Temp files are stored with descriptive field names for easy backend mapping
- The success handler reads files server-side (Node.js) and converts to Blob for FormData
- All forms now follow the same pattern for consistency
