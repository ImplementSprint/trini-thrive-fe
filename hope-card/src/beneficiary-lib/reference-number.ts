function cryptoSuffix(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(4)))
    .map(b => b.toString(36))
    .join('')
    .substring(0, 5)
    .toUpperCase();
}

export function generateTxnRef(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `TXN-${date}-${cryptoSuffix()}`;
}

export function generateWdRef(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `WD-${date}-${cryptoSuffix()}`;
}
