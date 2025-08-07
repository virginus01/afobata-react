export function randomNumber(length = 16): string {
  const charset = '0123456789';
  const codeArray = new Uint8Array(length);
  globalThis.crypto.getRandomValues(codeArray);
  return Array.from(codeArray, (byte) => charset[byte % charset.length]).join('');
}
