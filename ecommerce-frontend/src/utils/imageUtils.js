// src/utils/imageUtils.js
import { BACKEND_URL } from "../constants";

export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // If already a full URL (ImageKit CDN), return as is
  if (imagePath.startsWith('http')) return imagePath;
  
  // If path starts with /uploads/, add backend URL
  if (imagePath.startsWith('/uploads/')) {
    return `${BACKEND_URL}${imagePath}`;
  }
  
  // Default case
  return `${BACKEND_URL}/uploads/${imagePath}`;
};