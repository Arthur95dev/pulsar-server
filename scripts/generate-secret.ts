const secret = Buffer.from(crypto.getRandomValues(new Uint8Array(64))).toString(
  'hex',
);

console.log(`JWT_SECRET=${secret}`);
