const { createHash } = require("crypto-browserify"); // TODO: browser vs nodejs

export function sha256(data: Buffer): Buffer {
  const hash = createHash('sha256');
  hash.update(data);
  const hashValue = hash.digest();
  return hashValue;
}

export function doubleSha256(str: Buffer): Buffer {
  const firstHash = sha256(str);
  const secondHash = sha256(firstHash);
  return secondHash;
}
