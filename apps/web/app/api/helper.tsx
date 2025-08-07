const encoder = new TextEncoder();
const decoder = new TextDecoder();

const SALT_LENGTH = 16;
const ITERATIONS = 100_000;
const KEY_LENGTH = 32; // 256 bits
const DIGEST = "SHA-256";
const IV_LENGTH = 16;
const PASSPHRASE = process.env.SECRET_PASSPHRASE || "default-passphrase";

// --- Helpers ---
function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBuffer(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.match(/.{1,2}/g)!.map((b) => parseInt(b, 16)));
  return bytes.buffer;
}

function hexToUint8Array(hex: string): Uint8Array {
  return new Uint8Array(hex.match(/.{1,2}/g)!.map((b) => parseInt(b, 16)));
}

// --- PBKDF2 Password Hashing ---
export async function solaceEncrypt(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const baseKey = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: ITERATIONS,
      hash: DIGEST,
    },
    baseKey,
    KEY_LENGTH * 8
  );

  return `${bufferToHex(salt as any)}:${bufferToHex(derivedBits)}`;
}

export async function solaceVerify(password: string, stored: string): Promise<boolean> {
  if (!stored.includes(":")) return false;

  const [saltHex, storedHashHex] = stored.split(":");
  const salt = hexToUint8Array(saltHex);

  const baseKey = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: ITERATIONS,
      hash: DIGEST,
    },
    baseKey,
    KEY_LENGTH * 8
  );

  const derivedHex = bufferToHex(derivedBits);
  return derivedHex === storedHashHex.toLowerCase();
}

// --- AES-CBC Encryption/Decryption ---
async function deriveAesKey(secret: string): Promise<CryptoKey> {
  const hash = await crypto.subtle.digest("SHA-256", encoder.encode(secret));
  return crypto.subtle.importKey("raw", hash, { name: "AES-CBC" }, false, ["encrypt", "decrypt"]);
}

export async function encrypt(data: string): Promise<string> {
  const iv: any = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const key = await deriveAesKey(PASSPHRASE);

  const encrypted = await crypto.subtle.encrypt({ name: "AES-CBC", iv }, key, encoder.encode(data));

  return `${bufferToHex(iv)}:${bufferToHex(encrypted)}`;
}

export async function decrypt(ciphertext: string): Promise<any> {
  if (!ciphertext.includes(":")) return null;

  const [ivHex, encryptedHex] = ciphertext.split(":");
  const iv = hexToUint8Array(ivHex);
  const encryptedBytes = hexToUint8Array(encryptedHex);
  const key = await deriveAesKey(PASSPHRASE);

  try {
    const decrypted = await crypto.subtle.decrypt({ name: "AES-CBC", iv }, key, encryptedBytes);

    const text = decoder.decode(decrypted);
    try {
      return JSON.parse(text); // If JSON, return parsed
    } catch {
      return text; // Else return plain string
    }
  } catch (err) {
    console.error("Edge AES decryption failed:", err);
    return null;
  }
}
