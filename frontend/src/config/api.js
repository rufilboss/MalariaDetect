// API Configuration based on environment
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://malariadetect-47ad.onrender.com'
  : 'http://localhost:8000';

export const API_ENDPOINTS = {
  // Single image classification
  CLASSIFY: `${API_BASE_URL}/classify`,
  
  // Batch classification
  BATCH_CLASSIFY: `${API_BASE_URL}/classify/batch`,
  
  // Model status and statistics
  MODEL_STATUS: `${API_BASE_URL}/model/status`,
  STATISTICS: `${API_BASE_URL}/stats`,
  
  // Health check
  HEALTH: `${API_BASE_URL}/`,
};

export default API_BASE_URL; 