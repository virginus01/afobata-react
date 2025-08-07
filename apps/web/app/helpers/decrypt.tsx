export async function decrypt(ciphertext: string) {
  if (!ciphertext || typeof ciphertext !== 'string') {
    // console.error("Invalid ciphertext");
    return ciphertext;
  }

  const SECRET_PASSPHRASE = process.env.SECRET_PASSPHRASE as string;

  try {
    // Expect format: iv:ciphertext
    const [ivHex, encryptedHex] = ciphertext.split(':');

    if (!ivHex || !encryptedHex) {
      console.error('Invalid format for encrypted text');
      return ciphertext;
    }

    const iv = CryptoJS.enc.Hex.parse(ivHex);
    const encrypted = CryptoJS.enc.Hex.parse(encryptedHex);

    const encryptedBase64 = CryptoJS.enc.Base64.stringify(encrypted);

    const decrypted = CryptoJS.AES.decrypt(
      encryptedBase64,
      CryptoJS.enc.Utf8.parse(SECRET_PASSPHRASE),
      {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      },
    );

    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);

    // If it's JSON, try to parse it
    try {
      return JSON.parse(decryptedText);
    } catch {
      return decryptedText;
    }
  } catch (err) {
    console.error('Decryption failed:', err);
    return ciphertext; // fallback if decryption fails
  }
}
