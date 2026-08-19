import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Django backend manzili
const BACKEND_URL = "https://rest-production-388c.up.railway.app/";

// Rasm URL'ini to'g'ri formatlovchi funksiya
export const getAvatarUrl = (avatarPath?: string | null) => {
  if (!avatarPath) return "/default-avatar.png"; // Rasm bo'lmasa ko'rsatiladigan fayl
  if (avatarPath.startsWith("http")) return avatarPath;
  
  const cleanPath = avatarPath.startsWith("/") ? avatarPath : `/${avatarPath}`;
  return `${BACKEND_URL}${cleanPath}`;
};