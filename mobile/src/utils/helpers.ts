import { Platform, AccessibilityInfo } from 'react-native';

export function countryFlag(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return '\u{1F3F3}\uFE0F';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 0x1f1e6 + char.charCodeAt(0) - 65);
  return String.fromCodePoint(...codePoints);
}

export function isMinor(birthYear: number): boolean {
  const age = new Date().getFullYear() - birthYear;
  return age >= 13 && age < 18;
}

export function isTooYoung(birthYear: number): boolean {
  const age = new Date().getFullYear() - birthYear;
  return age < 13;
}

export function birthYearOptions(): number[] {
  const maxYear = new Date().getFullYear() - 13;
  const years: number[] = [];
  for (let y = maxYear; y >= 1950; y--) {
    years.push(y);
  }
  return years;
}

export function stampIcon(type: string): string {
  switch (type) {
    case 'spot': return '\u{1F3DB}\uFE0F';
    case 'city': return '\u{1F3D9}\uFE0F';
    case 'region': return '\u{1F5FA}\uFE0F';
    case 'country': return '\u{1F30D}';
    default: return '\u{1F4CD}';
  }
}

export function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d`;
  return date.toLocaleDateString();
}

export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

export async function prefersReducedMotion(): Promise<boolean> {
  return AccessibilityInfo.isReduceMotionEnabled();
}

export function distanceMeters(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
