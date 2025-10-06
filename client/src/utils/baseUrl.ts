const BASE_URL = 'http://localhost:3000';

export const API_ENDPOINTS = {
  // Register endpoints
  auth: {
    register: `${BASE_URL}/api/auth/register`,
    verifyOtp: `${BASE_URL}/api/auth/verify-otp`,
  },
  
  // Song Endponts
  song: {
    updateDetails: `${BASE_URL}/api/song/update-details`,
    generateLyrics: `${BASE_URL}/api/song/generate-lyrics`,
    generateAudio: `${BASE_URL}/api/song/generate-audio`,
  }
};

// Custome Endpoint
export { BASE_URL };


