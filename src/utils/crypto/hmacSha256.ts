/**
 * Generates a base64-encoded HMAC-SHA256 signature.
 *
 * This function takes a message and a secret key and uses the Web Crypto API to generate
 * an HMAC-SHA256 signature. The output is then converted to a base64 string, which can be
 * used in authentication headers for API requests that require HMAC signatures.
 *
 * @param {string} message - The message to be signed, typically consisting of timestamp,
 *                           HTTP method, and the endpoint URL.
 * @param {string} secret - The secret key used to create the HMAC signature.
 * @returns {Promise<string>} A promise that resolves to the base64-encoded HMAC signature.
 */
export async function hmacSha256(message: string, secret: string) {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const algorithm = { name: 'HMAC', hash: { name: 'SHA-256' } };
  const key = await crypto.subtle.importKey('raw', keyData, algorithm, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  return btoa(String.fromCharCode(...new Uint8Array(signature))); // Convert the ArrayBuffer to base64
}