export function getClientCookie(name: string): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const escapedName = name.replace(/([.*+?^=!:${}()|[\]/\\])/g, '\\$1');
    const match = document.cookie.match(new RegExp('(?:^|;\\s*)' + escapedName + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  } catch (error) {
    console.error('Error reading cookie:', error);
    return null;
  }
}
