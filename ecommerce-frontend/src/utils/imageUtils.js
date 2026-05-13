
import { BACKEND_URL } from "../constants";

export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
 
  if (imagePath.startsWith('http')) return imagePath;
  
  
  if (imagePath.startsWith('/uploads/')) {
    return `${BACKEND_URL}${imagePath}`;
  }
  
  
  return `${BACKEND_URL}/uploads/${imagePath}`;
};