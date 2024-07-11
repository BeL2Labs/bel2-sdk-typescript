/**
 * Reverses the byte order of a given hexadecimal string.
 *
 * This function takes a hexadecimal string prefixed with "0x", validates it,
 * and returns a new hexadecimal string with the byte order reversed. It expects
 * the hexadecimal string to have an even length (excluding the "0x" prefix) to
 * ensure bytes can be correctly reversed.
 *
 * @param hexString The hexadecimal string to be reversed, must start with "0x".
 * @returns A new hexadecimal string with the byte order reversed.
 * @throws Error if the input is not a valid hexadecimal string or if its length (excluding "0x") is odd.
 */
export const reverseHexString = (hexString: string): string => {
  // Validate the input as a valid hexadecimal string
  if (!/^0x[0-9A-Fa-f]+$/.test(hexString)) {
    throw new Error('Invalid hex string');
  }

  // Remove the "0x" prefix
  const cleanHexString = hexString.slice(2);

  // Ensure the string has an even length for correct byte reversal
  if (cleanHexString.length % 2 !== 0) {
    throw new Error('Invalid hex string length, expecting an even number of characters');
  }

  // Convert the string into an array of byte pairs
  const byteArray: string[] = [];
  for (let i = 0; i < cleanHexString.length; i += 2) {
    byteArray.push(cleanHexString.substr(i, 2));
  }

  // Reverse the byte array and rejoin into a string
  const reversedHexString = "0x" + byteArray.reverse().join('');

  return reversedHexString;
}