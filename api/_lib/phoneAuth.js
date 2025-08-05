// Simple phone auth for local development
export function sendOTP(phoneNumber) {
  console.log(`Demo OTP for ${phoneNumber}: 123456`);
  return { success: true, message: 'Demo mode: Use OTP 123456' };
}

export function verifyOTP(phoneNumber, otp) {
  if (otp === '123456') {
    return { success: true, message: 'OTP verified' };
  }
  return { success: false, message: 'Invalid OTP' };
}

export function isPhoneAuthenticated(req) {
  return true; // Simplified for local dev
}

export function isPhoneAdmin(req) {
  return true; // Simplified for local dev
}