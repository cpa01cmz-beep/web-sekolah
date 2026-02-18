export async function generateSignature(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = encoder.encode(secret);
  const data = encoder.encode(payload);

  const importedKey = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', importedKey, data);
  const hash = new Uint8Array(signature);
  const hexArray = Array.from(hash).map(b => b.toString(16).padStart(2, '0'));
  return `sha256=${hexArray.join('')}`;
}

function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  const aBuffer = new TextEncoder().encode(a);
  const bBuffer = new TextEncoder().encode(b);
  
  let result = 0;
  for (let i = 0; i < aBuffer.length; i++) {
    result |= aBuffer[i] ^ bBuffer[i];
  }
  return result === 0;
}

export async function verifySignature(payload: string, signature: string, secret: string): Promise<boolean> {
  try {
    const expectedSignature = await generateSignature(payload, secret);

    return constantTimeCompare(signature, expectedSignature);
  } catch {
    return false;
  }
}
