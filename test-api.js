// Test script to verify API endpoint
// Run this in the browser console or as a simple fetch test

async function testOrderAPI() {
  try {
    // Create a minimal test FormData
    const formData = new FormData();
    
    // Add required fields
    formData.append('presenting', 'Test Venue');
    formData.append('event_title', 'Test Event');
    formData.append('event_date', '2024-12-31');
    formData.append('address_phone', '123 Test St | 555-0123');
    formData.append('flyer_info', 'Test event info');
    formData.append('custom_notes', 'Test notes');
    formData.append('delivery_time', '24hours');
    formData.append('email', 'test@example.com');
    formData.append('story_size_version', 'false');
    formData.append('custom_flyer', 'false');
    formData.append('animated_flyer', 'false');
    formData.append('instagram_post_size', 'true');
    formData.append('flyer_is', '1');
    formData.append('total_price', '50');
    
    // Add JSON fields
    formData.append('djs', JSON.stringify([{ name: 'Test DJ' }]));
    formData.append('host', JSON.stringify({ name: 'Test Host' }));
    formData.append('sponsors', JSON.stringify([]));
    
    for (let [key, value] of formData.entries()) {
    }
    
    const response = await fetch('http://193.203.161.174:3007/api/orders', {
      method: 'POST',
      body: formData
    });
    
    
    const data = await response.json();
    
    if (response.ok) {
    } else {
    }
  } catch (error) {
    console.error('❌ API test error:', error);
  }
}

// Run the test
testOrderAPI();
