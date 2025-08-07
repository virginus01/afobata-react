export function checkCookie(): void {
  document.cookie.split(';').forEach((cookie) => {
    console.info('Individual cookie:', cookie.trim());
  });
}
