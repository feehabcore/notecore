function randomBytes(len: number) {
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  return arr;
}

function toBase64Url(bytes: Uint8Array) {
  const bin = String.fromCharCode(...bytes);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(base64url: string) {
  const pad = '='.repeat((4 - (base64url.length % 4)) % 4);
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/') + pad;
  const bin = atob(base64);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

export function isBiometricAvailable() {
  return typeof window !== 'undefined' && 'PublicKeyCredential' in window && !!navigator.credentials;
}

export async function registerBiometricCredential(): Promise<string | null> {
  if (!isBiometricAvailable()) return null;
  try {
    const publicKey: PublicKeyCredentialCreationOptions = {
      challenge: randomBytes(32),
      rp: { name: 'Notecore' },
      user: {
        id: randomBytes(16),
        name: 'notecore-user',
        displayName: 'Notecore User',
      },
      pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
      timeout: 60000,
      authenticatorSelection: {
        userVerification: 'required',
        residentKey: 'preferred',
      },
      attestation: 'none',
    };
    const cred = (await navigator.credentials.create({ publicKey })) as PublicKeyCredential | null;
    if (!cred) return null;
    return toBase64Url(new Uint8Array(cred.rawId));
  } catch {
    return null;
  }
}

export async function verifyBiometricCredential(credentialId: string): Promise<boolean> {
  if (!isBiometricAvailable()) return false;
  try {
    const publicKey: PublicKeyCredentialRequestOptions = {
      challenge: randomBytes(32),
      timeout: 60000,
      userVerification: 'required',
      allowCredentials: [
        {
          id: fromBase64Url(credentialId),
          type: 'public-key',
        },
      ],
    };
    const assertion = await navigator.credentials.get({ publicKey });
    return !!assertion;
  } catch {
    return false;
  }
}

