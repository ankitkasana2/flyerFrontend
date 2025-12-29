# Complete Fix: Host, Sponsors, and Temp File Cleanup

## Issues Fixed

### 1. ✅ Host Data Format Issue
**Problem:** Host was being sent as an object `{}` instead of an array `[]`

**Before:**
```typescript
formData.append('host', JSON.stringify(formDataObj.host || {}))  // ❌ Wrong!
```

**After:**
```typescript
formData.append('host', JSON.stringify(formDataObj.host || []))  // ✅ Correct!
```

### 2. ✅ Host Image Field Mapping
**Problem:** First host image was sent as `host_0` but backend expects `host`

**Mapping:**
- `host_0` → `host` (first host image)
- `host_1` → `host_1` (second host image)
- `host_2` → `host_2` (third host image)

### 3. ✅ Sponsor Image Field Mapping
**Problem:** Sponsor images had incorrect field names

**Mapping:**
- `sponsor_0` → `sponsor_sponsor1`
- `sponsor_1` → `sponsor_sponsor2`
- `sponsor_2` → `sponsor_sponsor3`

### 4. ✅ Temp File Cleanup
**Problem:** Temp files were not being deleted after successful order creation

**Solution:** Added proper cleanup logic that:
- Tracks all uploaded temp files
- Deletes files ONLY after successful order creation
- Attempts to remove empty temp directory
- Handles errors gracefully

## Complete Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER SUBMITS CHECKOUT                                    │
│    • Host data: [{ name: "John", image: File }]             │
│    • Sponsor data: [{ name: "Sponsor1", image: File }]      │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. IMAGES UPLOADED TO TEMP                                  │
│    • host_0 → tmp/uploads/checkout_xxx/host_0-photo.jpg     │
│    • sponsor_0 → tmp/uploads/checkout_xxx/sponsor_0-logo.png│
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. STRIPE SESSION CREATED                                   │
│    • temp_files: { "host_0": "tmp/.../file.jpg" }           │
│    • host: [{ name: "John", image_url: "tmp/.../file.jpg" }]│
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. PAYMENT SUCCESSFUL → /api/checkout/success               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. PREPARE ORDER DATA                                       │
│    • Read temp files from filesystem                        │
│    • Map field names:                                       │
│      - host_0 → host                                        │
│      - sponsor_0 → sponsor_sponsor1                         │
│    • Create FormData with:                                  │
│      - JSON: host: [{ name: "John", image_url: "..." }]     │
│      - FILE: host (the actual image file)                   │
│      - FILE: sponsor_sponsor1 (the actual image file)       │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. SEND TO BACKEND API                                      │
│    POST /api/orders with FormData containing:               │
│    • host (JSON array)                                      │
│    • host (image file for first host)                       │
│    • host_1 (image file for second host, if any)            │
│    • sponsor_sponsor1 (image file)                          │
│    • dj_0, dj_1, etc. (image files)                         │
│    • venue_logo (image file)                                │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. ORDER CREATED SUCCESSFULLY                               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 8. CLEANUP TEMP FILES                                       │
│    • Delete: tmp/uploads/checkout_xxx/host_0-photo.jpg      │
│    • Delete: tmp/uploads/checkout_xxx/sponsor_0-logo.png    │
│    • Delete: tmp/uploads/checkout_xxx/dj_0-photo.jpg        │
│    • Remove: tmp/uploads/checkout_xxx/ (if empty)           │
└─────────────────────────────────────────────────────────────┘
```

## Backend Receives

### FormData Fields:

**Text Fields:**
```
presenting: "DJ Night"
event_title: "Summer Party"
event_date: "2024-01-15"
flyer_info: "Join us for..."
address_phone: "123 Main St, 555-1234"
venue_text: "Club XYZ"
venue_logo_url: "tmp/uploads/.../venue_logo.png"
delivery_time: "24hours"
custom_notes: "Please make it colorful"
flyer_is: "123"
category_id: "5"
user_id: "user_abc"
web_user_id: "user_abc"
email: "user@example.com"
total_price: "15"
subtotal: "15"
image_url: "https://..."
story_size_version: "false"
custom_flyer: "false"
animated_flyer: "false"
instagram_post_size: "true"
```

**JSON Fields:**
```json
djs: [
  { "name": "DJ Mike", "image_url": "tmp/uploads/.../dj_0.jpg" },
  { "name": "DJ Sarah", "image_url": "tmp/uploads/.../dj_1.jpg" }
]

host: [
  { "name": "John Doe", "image_url": "tmp/uploads/.../host_0.jpg" },
  { "name": "Jane Smith", "image_url": "tmp/uploads/.../host_1.jpg" }
]

sponsors: [
  { "name": "Sponsor A", "image_url": "tmp/uploads/.../sponsor_0.png" },
  { "name": "Sponsor B", "image_url": "tmp/uploads/.../sponsor_1.png" }
]
```

**File Fields:**
```
venue_logo: [Blob] (venue logo image)
dj_0: [Blob] (DJ 1 image)
dj_1: [Blob] (DJ 2 image)
host: [Blob] (Host 1 image) ⚠️ Note: First host is "host", not "host_0"
host_1: [Blob] (Host 2 image)
sponsor_sponsor1: [Blob] (Sponsor 1 image)
sponsor_sponsor2: [Blob] (Sponsor 2 image)
```

## Key Changes in `/app/api/checkout/success/route.ts`

### 1. Fixed Host Data Type
```typescript
// Line 125
formData.append('host', JSON.stringify(formDataObj.host || []))  // Array, not object
```

### 2. Added Temp File Tracking
```typescript
const tempFilesToCleanup: string[] = [];

// During file processing
tempFilesToCleanup.push(filepath);
```

### 3. Enhanced Logging
```typescript
console.log('📋 Order details:', {
  presenting: formDataObj.presenting,
  event_title: formDataObj.event_title,
  total_price: formDataObj.total_price,
  user_id: formDataObj.user_id,
  host_count: (formDataObj.host || []).length,      // NEW
  dj_count: (formDataObj.djs || []).length,          // NEW
  temp_files_count: tempFilesToCleanup.length        // NEW
})
```

### 4. Proper Cleanup After Success
```typescript
// ✅ CLEANUP TEMP FILES AFTER SUCCESSFUL ORDER CREATION
if (tempFilesToCleanup.length > 0) {
  console.log('🧹 Cleaning up temp files...');
  const { unlink, rmdir } = await import('fs/promises');
  const { dirname } = await import('path');
  
  // Delete each file
  for (const filepath of tempFilesToCleanup) {
    try {
      await unlink(filepath);
      console.log(`✅ Deleted temp file: ${filepath}`);
    } catch (err) {
      console.warn(`⚠️ Could not delete temp file ${filepath}:`, err);
    }
  }
  
  // Try to delete empty directory
  try {
    const uploadDir = dirname(tempFilesToCleanup[0]);
    await rmdir(uploadDir);
    console.log(`✅ Deleted empty temp directory: ${uploadDir}`);
  } catch (err) {
    console.log('ℹ️ Temp directory not deleted (may contain other files)');
  }
}
```

## Testing Checklist

- [ ] Create order with 1 host + image
- [ ] Create order with 2 hosts + images
- [ ] Create order with sponsors + images
- [ ] Verify host JSON is array format in backend
- [ ] Verify first host image sent as `host` field
- [ ] Verify second host image sent as `host_1` field
- [ ] Verify sponsor images sent as `sponsor_sponsor1`, `sponsor_sponsor2`
- [ ] Verify temp files are deleted after successful order
- [ ] Verify temp directory is deleted if empty
- [ ] Check console logs for cleanup messages
- [ ] Test failed payment (temp files should remain)

## Console Output Example

```
📂 Processing temp files: ['venue_logo', 'host_0', 'host_1', 'dj_0', 'sponsor_0']
✅ Attached file venue_logo → venue_logo from tmp/uploads/checkout_1735459362123/venue_logo-logo.png
✅ Attached file host_0 → host from tmp/uploads/checkout_1735459362123/host_0-photo.jpg
✅ Attached file host_1 → host_1 from tmp/uploads/checkout_1735459362123/host_1-photo.jpg
✅ Attached file dj_0 → dj_0 from tmp/uploads/checkout_1735459362123/dj_0-photo.jpg
✅ Attached file sponsor_0 → sponsor_sponsor1 from tmp/uploads/checkout_1735459362123/sponsor_0-logo.png
📤 Submitting REAL order to backend API...
📋 Order details: {
  presenting: 'DJ Night',
  event_title: 'Summer Party',
  total_price: 15,
  user_id: 'user_abc',
  host_count: 2,
  dj_count: 1,
  temp_files_count: 5
}
📬 Backend API response status: 200
🎉 Order created successfully: { orderId: '12345', ... }
🧹 Cleaning up temp files...
✅ Deleted temp file: tmp/uploads/checkout_1735459362123/venue_logo-logo.png
✅ Deleted temp file: tmp/uploads/checkout_1735459362123/host_0-photo.jpg
✅ Deleted temp file: tmp/uploads/checkout_1735459362123/host_1-photo.jpg
✅ Deleted temp file: tmp/uploads/checkout_1735459362123/dj_0-photo.jpg
✅ Deleted temp file: tmp/uploads/checkout_1735459362123/sponsor_0-logo.png
✅ Deleted empty temp directory: tmp/uploads/checkout_1735459362123
📋 Order ID: 12345
```

## Summary

✅ **Host names and images** - Now correctly sent as array with proper field mapping
✅ **Sponsor images** - Correctly mapped to `sponsor_sponsor1`, `sponsor_sponsor2`, etc.
✅ **Venue logo** - Sent with both file and URL
✅ **Temp file cleanup** - Files deleted ONLY after successful order creation
✅ **Directory cleanup** - Empty temp directories removed automatically
✅ **Error handling** - Graceful handling of cleanup errors
✅ **Enhanced logging** - Better visibility into what's being sent and cleaned up
