import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getDriveFileUrl(linkOrId: string | null | undefined): string {
  if (!linkOrId || linkOrId.trim() === '#' || linkOrId.trim() === '') return "#";

  const clean = linkOrId.trim();

  // Case 1: Already a URL
  if (clean.startsWith('http')) {
    // If it's already a correct view/preview link, keep it.
    // If it's a 'view?usp=drivesdk' style, it's also file.
    // We can optionally enforce /view if needed, but Google handles mixed formats well.
    return clean;
  }

  // Case 2: It is likely an ID (alphanumeric, sometimes with - or _)
  // Basic check: length > 10 and no slashes (except maybe partial path if dirty)
  // Assume it's an ID if no http
  return `https://drive.google.com/file/d/${clean}/view?usp=sharing`;
}
