# Debug Guide: Host and Sponsors Not Sending

## Current Status
Added extensive logging to track exactly what's being sent to the backend API.

## How to Debug

### Step 1: Fill Out Form
1. Open any flyer form
2. Add at least 1 host with name and image
3. Add at least 1 sponsor image
4. Click "Checkout Now"

### Step 2: Check Browser Console (Frontend)
Look for these debug logs:

```
🔍 DEBUG - Host data from store: [{name: "John", image: File}]
🔍 DEBUG - Sponsors from store: {sponsor1: "logo.png", sponsor2: null, sponsor3: null}
🔍 DEBUG - Processed sponsor data: [{name: "logo.png", image_url: "tmp/..."}]
🔍 DEBUG - Hosts with URLs: [{name: "John", image_url: "tmp/..."}]
🔍 DEBUG - Complete API Body: {...}
```

**What to check:**
- ✅ Host array should have entries with names
- ✅ Sponsor array should have entries with filenames as names
- ✅ image_url should be temp file paths

### Step 3: Complete Payment
Go through Stripe checkout and complete payment

### Step 4: Check Server Console (Backend)
After payment success, look for these logs:

```
🔍 DEBUG - formDataObj.host: [{name: "John", image_url: "tmp/..."}]
🔍 DEBUG - formDataObj.sponsors: [{name: "logo.png", image_url: "tmp/..."}]
🔍 DEBUG - formDataObj.djs: [{name: "DJ Mike", image_url: "tmp/..."}]
🔍 DEBUG - JSON stringified host: [{"name":"John","image_url":"tmp/..."}]
🔍 DEBUG - JSON stringified sponsors: [{"name":"logo.png","image_url":"tmp/..."}]
🔍 DEBUG - FormData keys being sent:
  - presenting
  - event_title
  - event_date
  - flyer_info
  - address_phone
  - story_size_version
  - custom_flyer
  - animated_flyer
  - instagram_post_size
  - delivery_time
  - custom_notes
  - flyer_is
  - category_id
  - user_id
  - web_user_id
  - email
  - total_price
  - subtotal
  - image_url
  - djs          ← Should be here
  - host         ← Should be here
  - sponsors     ← Should be here
  - venue_text
  - venue_logo_url
  - venue_logo   ← File
  - host         ← File (first host image)
  - host_1       ← File (second host image, if any)
  - sponsor_sponsor1  ← File
  - sponsor_sponsor2  ← File
  - dj_0         ← File
  - dj_1         ← File
```

**What to check:**
- ✅ `host` should appear TWICE (once as JSON string, once as File)
- ✅ `sponsors` should appear as JSON string
- ✅ `sponsor_sponsor1`, `sponsor_sponsor2` should appear as Files
- ✅ Host and sponsor JSON should have actual data, not empty arrays

### Step 5: Check Database
After order creation, check the database:

**Expected:**
```json
{
  "host": [
    {"name": "John Doe", "image_url": "http://..."}
  ],
  "sponsors": [
    {"name": "logo.png", "image_url": "http://..."},
    {"name": "", "image_url": ""},
    {"name": "", "image_url": ""}
  ]
}
```

**NOT:**
```json
{
  "host": {"name":"","image":null},
  "sponsors": [{"name":null,"image":null}]
}
```

## Possible Issues & Solutions

### Issue 1: Frontend logs show empty data
**Problem:** Host/sponsor data not being captured in form
**Solution:** Check form components (host-block.tsx, sponser.tsx)

### Issue 2: Frontend logs show data, but backend logs show empty
**Problem:** Data not being passed through Stripe metadata correctly
**Solution:** Check Stripe metadata size limits (500 chars per key)

### Issue 3: Backend logs show data, but FormData keys missing
**Problem:** Data not being added to FormData
**Solution:** Check success route FormData.append() calls

### Issue 4: FormData has keys, but database shows empty
**Problem:** Backend API not parsing FormData correctly
**Solution:** Check backend API endpoint for FormData parsing

### Issue 5: Host appears once in FormData keys
**Problem:** File is overwriting JSON data (or vice versa)
**Solution:** Backend needs to handle both JSON field AND file field with same name

## Common Backend Issue

The backend might be receiving:
- `host` (JSON): `[{"name":"John","image_url":"tmp/..."}]`
- `host` (File): `[Blob]` (first host image)

If the backend only reads one of these, it might miss the data. The backend needs to:
1. Read `host` as JSON string for names and metadata
2. Read `host` as File for the first host's image
3. Read `host_1` as File for the second host's image (if any)

Same for sponsors:
1. Read `sponsors` as JSON string for names
2. Read `sponsor_sponsor1`, `sponsor_sponsor2`, `sponsor_sponsor3` as Files

## Next Steps

1. Run a test checkout
2. Copy all console logs (both frontend and backend)
3. Share the logs to identify where the data is being lost
4. Check if backend is properly handling duplicate field names (JSON + File)
