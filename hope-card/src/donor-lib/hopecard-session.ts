const BUYER_AUTH_ID_STORAGE_KEY = 'hopecard_buyer_auth_id';

export function getOrCreateBuyerAuthId(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const existingId = window.localStorage.getItem(BUYER_AUTH_ID_STORAGE_KEY);
  if (existingId) {
    return existingId;
  }

  const buyerAuthId = crypto.randomUUID();
  window.localStorage.setItem(BUYER_AUTH_ID_STORAGE_KEY, buyerAuthId);
  return buyerAuthId;
}

export function getBuyerAuthId(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage.getItem(BUYER_AUTH_ID_STORAGE_KEY);
}
