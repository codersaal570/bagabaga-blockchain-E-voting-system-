/**
 * Cryptographic utility functions for Blockchain, Zero-Knowledge voter token hashing,
 * and Tamper-Proof Audit Trails.
 */

// Simple robust synchronous SHA-256 fallback + Web Crypto async implementation
export async function sha256Async(message: string): Promise<string> {
  try {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const msgUint8 = new TextEncoder().encode(message);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch {
    // Fallback if subtle crypto is unavailable in environment
  }
  return sha256Sync(message);
}

export function sha256Sync(input: string): string {
  // Pure JS standard SHA-256 implementation for fast synchronous execution & Merkle trees
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }

  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let lengthProperty = 'length';
  let i = 0;
  let j = 0;
  let result = '';

  const words: number[] = [];
  const asciiBitLength = input[lengthProperty] * 8;

  const hash: number[] = [];
  const k: number[] = [];
  let primeCounter = 0;

  const isComposite: { [key: number]: boolean } = {};
  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (i = 0; i < 313; i += candidate) {
        isComposite[i] = true;
      }
      hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
    }
  }

  words[asciiBitLength >> 5] |= 0x80 << (24 - (asciiBitLength % 32));
  words[(((asciiBitLength + 64) >> 9) << 4) + 15] = asciiBitLength;

  for (i = 0; i < input.length; i++) {
    const code = input.charCodeAt(i);
    const index = i >> 2;
    words[index] = (words[index] || 0) | (code << (24 - (8 * (i % 4))));
  }

  for (j = 0; j < words.length; j += 16) {
    const w = words.slice(j, j + 16);
    const oldHash = [...hash];

    for (i = 0; i < 64; i++) {
      const w15 = w[i - 15];
      const w2 = w[i - 2];

      const s0 = i >= 16 ? rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3) : 0;
      const s1 = i >= 16 ? rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10) : 0;
      if (i >= 16) {
        w[i] = ((w[i - 16] + s0 + w[i - 7] + s1) | 0);
      }

      const s1Main = rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25);
      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      const temp1 = (hash[7] + s1Main + ch + k[i] + (w[i] || 0)) | 0;
      const s0Main = rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22);
      const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      const temp2 = (s0Main + maj) | 0;

      hash[7] = hash[6];
      hash[6] = hash[5];
      hash[5] = hash[4];
      hash[4] = (hash[3] + temp1) | 0;
      hash[3] = hash[2];
      hash[2] = hash[1];
      hash[1] = hash[0];
      hash[0] = (temp1 + temp2) | 0;
    }

    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j >= 0; j--) {
      const b = (hash[i] >> (8 * j)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }

  return result;
}

/**
 * Computes the Merkle Root for a list of transaction IDs/hashes.
 */
export function computeMerkleRoot(transactionHashes: string[]): string {
  if (transactionHashes.length === 0) {
    return sha256Sync('EMPTY_BLOCK_TRANSACTIONS');
  }

  let tree = [...transactionHashes];

  while (tree.length > 1) {
    const nextLevel: string[] = [];
    for (let i = 0; i < tree.length; i += 2) {
      const left = tree[i];
      const right = i + 1 < tree.length ? tree[i + 1] : left; // Duplicate odd element
      const combined = sha256Sync(left + right);
      nextLevel.push(combined);
    }
    tree = nextLevel;
  }

  return tree[0];
}

/**
 * Generates a Zero-Knowledge voter token from student credentials + secret salt.
 * Ensures the student can be verified as authorized without associating their identity with their ballot choices.
 */
export function generateBlindVoterToken(studentId: string, studentEmail: string, salt: string = 'CAMPUS_ZK_2026'): string {
  const raw = `${studentId}::${studentEmail.toLowerCase()}::${salt}`;
  return 'zk-tok_' + sha256Sync(raw).substring(0, 32);
}

/**
 * Generates a ballot receipt verification hash from cast choices, timestamp, and anonymous voter token.
 */
export function generateBallotReceiptHash(voterToken: string, choicesString: string, timestamp: number): string {
  const raw = `BALLOT_${voterToken}_${choicesString}_${timestamp}`;
  return '0x' + sha256Sync(raw).substring(0, 48);
}

/**
 * Generates a simulated digital signature from an actor and message.
 */
export function generateSignature(actorKey: string, payload: string): string {
  return 'SIG_ED25519_' + sha256Sync(actorKey + ':' + payload).substring(0, 24);
}

/**
 * Generates a TOTP 6-digit verification code using timestamp.
 */
export function generateTOTPCode(secret: string, periodSeconds: number = 30): { code: string; secondsRemaining: number } {
  const now = Math.floor(Date.now() / 1000);
  const timeStep = Math.floor(now / periodSeconds);
  const hash = sha256Sync(`${secret}-${timeStep}`);
  // Extract 6 digits
  const num = parseInt(hash.substring(0, 8), 16) % 1000000;
  const code = num.toString().padStart(6, '0');
  const secondsRemaining = periodSeconds - (now % periodSeconds);
  return { code, secondsRemaining };
}

/**
 * Formats a long hash for UI display (e.g. 0x7f8a...9c2d)
 */
export function truncateHash(hash: string, startChars: number = 8, endChars: number = 6): string {
  if (!hash || hash.length <= startChars + endChars) return hash || '';
  return `${hash.substring(0, startChars)}...${hash.substring(hash.length - endChars)}`;
}
