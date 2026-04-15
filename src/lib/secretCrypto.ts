export type EncryptedSecretV1 = {
  v: 1;
  alg: 'AES-GCM';
  kdf: 'PBKDF2';
  hash: 'SHA-256';
  iter: number;
  salt: string;
  iv: string;
  ct: string;
};

function bytesToB64(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function b64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function deriveAesKey(passphrase: string, salt: Uint8Array, iterations: number): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey('raw', enc.encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptSecret(plain: string, passphrase: string, iterations = 150_000): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveAesKey(passphrase, salt, iterations);
  const enc = new TextEncoder();
  const ctBuf = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(plain));

  const payload: EncryptedSecretV1 = {
    v: 1,
    alg: 'AES-GCM',
    kdf: 'PBKDF2',
    hash: 'SHA-256',
    iter: iterations,
    salt: bytesToB64(salt),
    iv: bytesToB64(iv),
    ct: bytesToB64(new Uint8Array(ctBuf)),
  };

  return JSON.stringify(payload);
}

export async function decryptSecret(encrypted: string, passphrase: string): Promise<string> {
  let payload: EncryptedSecretV1;
  try {
    payload = JSON.parse(encrypted);
  } catch {
    throw new Error('密文格式不正确');
  }

  if (!payload || payload.v !== 1 || payload.alg !== 'AES-GCM' || payload.kdf !== 'PBKDF2') {
    throw new Error('不支持的密文版本');
  }

  const salt = b64ToBytes(payload.salt);
  const iv = b64ToBytes(payload.iv);
  const ct = b64ToBytes(payload.ct);
  const key = await deriveAesKey(passphrase, salt, payload.iter);
  const ptBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
  return new TextDecoder().decode(ptBuf);
}

