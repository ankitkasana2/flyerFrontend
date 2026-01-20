// Test function to demonstrate user-not-found error handling
export const testUserNotFoundErrorHandling = async () => {
  
  const testEmails = [
    'nonexistent@example.com',
    'wrongemail@domain.com', 
    'fake@user.com',
    'notregistered@email.org',
    'unknown@account.net'
  ];
  
  for (const email of testEmails) {
    try {
      // This would trigger the comprehensive user-not-found error handling
      // await authStore.login({ email, password: 'wrongpassword' });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    }
  }
  
  for (const email of testEmails) {
    try {
      // This would trigger the comprehensive user-not-found error handling
      // await authStore.sendOTP(email);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    }
  }
  
  
  
};
