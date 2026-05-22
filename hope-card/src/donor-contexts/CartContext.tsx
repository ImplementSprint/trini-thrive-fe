"use client";

import React, {
  createContext, useContext, useState, useCallback, useEffect, ReactNode
} from 'react';
import { supabase, getDonorTokenPayload } from '@/donor-lib/supabase-client';

export interface CartItem {
  id: string;           // cart_items.id (DB row id)
  campaign_id: string;
  title: string;
  price: number;        // face_value
  currency: string;
  quantity: number;
  imageSrc: string;
  imageAlt: string;
  category?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: { campaign_id: string; title: string; price: number; imageSrc: string; imageAlt: string; category?: string }) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  loading: boolean;
  processingFee: number;
  apiTotal: number;
  checkout: () => Promise<string>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface ApiCartItem {
  id: string;
  campaign_id: string;
  title: string;
  category: string;
  cover_image_url: string | null;
  face_value: number;
  quantity: number;
}

interface ApiCartResponse {
  cart: {
    id: string;
    items: ApiCartItem[];
    subtotal: number;
    processing_fee: number;
    total: number;
  };
}

function toCartItem(item: ApiCartItem): CartItem {
  return {
    id: item.id,
    campaign_id: item.campaign_id,
    title: item.title,
    price: item.face_value,
    currency: '₱',
    quantity: item.quantity,
    imageSrc: item.cover_image_url ?? 'https://placehold.co/400x300?text=Campaign',
    imageAlt: item.title,
    category: item.category,
  };
}

async function parseJsonResponse(res: Response) {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch (e) {
    return { message: text || `HTTP ${res.status} ${res.statusText}` };
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingFee, setProcessingFee] = useState(0);
  const [apiTotal, setApiTotal] = useState(0);

  const applyCartResponse = useCallback((data: ApiCartResponse) => {
    setCart(data.cart.items.map(toCartItem));
    setProcessingFee(data.cart.processing_fee);
    setApiTotal(data.cart.total);
  }, []);

  // Load cart from DB on mount and sync with auth state changes
  useEffect(() => {
    async function fetchCart(session: any) {
      setAuthUserId(session.user.id);
      const donorToken = localStorage.getItem('donor_token') ?? session.access_token;
      setAccessToken(donorToken);
      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_DONOR_BACKEND_URL}/api/v1/hopecard/donor/cart?authUserId=${session.user.id}`, {
          headers: { Authorization: `Bearer ${donorToken}` },
        });
        const data: ApiCartResponse = await parseJsonResponse(res);
        if (res.ok) applyCartResponse(data);
        else {
          setCart([]); setApiTotal(0); setProcessingFee(0);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }

    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchCart(session);
        return;
      }

      // Supabase session gone (e.g. expired during PayMongo redirect).
      // Recover from our custom 24-hour donor_token JWT.
      const payload = getDonorTokenPayload();
      if (payload?.sub) {
        const donorToken = localStorage.getItem('donor_token')!;
        setAuthUserId(payload.sub);
        setAccessToken(donorToken);
        setLoading(true);
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_DONOR_BACKEND_URL}/api/v1/hopecard/donor/cart?authUserId=${payload.sub}`,
            { headers: { Authorization: `Bearer ${donorToken}` } },
          );
          const data: ApiCartResponse = await parseJsonResponse(res);
          if (res.ok) applyCartResponse(data);
          else { setCart([]); setApiTotal(0); setProcessingFee(0); }
        } catch { /* silently fail */ }
        finally { setLoading(false); }
        return;
      }

      setAuthUserId(null);
      setAccessToken(null);
      setLoading(false);
    }

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchCart(session);
      } else {
        setAuthUserId(null);
        setAccessToken(null);
        setCart([]);
        setApiTotal(0);
        setProcessingFee(0);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [applyCartResponse]);

  const addToCart = useCallback(async (item: {
    campaign_id: string; title: string; price: number;
    imageSrc: string; imageAlt: string; category?: string;
  }) => {
    if (!authUserId) throw new Error('Please log in to manage your cart');
    const res = await fetch(`${process.env.NEXT_PUBLIC_DONOR_BACKEND_URL}/api/v1/hopecard/donor/cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({
        authUserId,
        campaign_id: item.campaign_id,
        face_value: item.price,
        quantity: 1,
      }),
    });
    const data = await parseJsonResponse(res);
    if (!res.ok) throw new Error((data as { message?: string; error?: string }).message ?? (data as { error?: string }).error ?? 'Failed to add to cart');
    applyCartResponse(data);
  }, [authUserId, accessToken, applyCartResponse]);

  const removeFromCart = useCallback(async (cartItemId: string) => {
    if (!authUserId) throw new Error('Please log in to manage your cart');
    const res = await fetch(`${process.env.NEXT_PUBLIC_DONOR_BACKEND_URL}/api/v1/hopecard/donor/cart`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ authUserId, cart_item_id: cartItemId }),
    });
    const data = await parseJsonResponse(res);
    if (!res.ok) throw new Error((data as { message?: string; error?: string }).message ?? (data as { error?: string }).error ?? 'Failed to remove from cart');
    applyCartResponse(data);
  }, [authUserId, accessToken, applyCartResponse]);

  const updateQuantity = useCallback(async (cartItemId: string, quantity: number) => {
    if (!authUserId) throw new Error('Please log in to manage your cart');
    const res = await fetch(`${process.env.NEXT_PUBLIC_DONOR_BACKEND_URL}/api/v1/hopecard/donor/cart`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ authUserId, cart_item_id: cartItemId, quantity }),
    });
    const data = await parseJsonResponse(res);
    if (!res.ok) throw new Error((data as { message?: string; error?: string }).message ?? (data as { error?: string }).error ?? 'Failed to update cart');
    applyCartResponse(data);
  }, [authUserId, accessToken, applyCartResponse]);

  const clearCart = useCallback(() => {
    setCart([]);
    setApiTotal(0);
    setProcessingFee(0);
  }, []);

  const checkout = useCallback(async (): Promise<string> => {
    if (!authUserId) throw new Error('Not authenticated');
    if (cart.length === 0) throw new Error('Cart is empty');

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin;
    const res = await fetch(`${process.env.NEXT_PUBLIC_DONOR_BACKEND_URL}/api/v1/hopecard/donor/purchases/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({
        buyerAuthId: authUserId,
        successBaseUrl: `${appUrl}/donor/payment/success`,
        cancelUrl: `${appUrl}/donor/payment/cancel`,
      }),
    });
    const data = await parseJsonResponse(res);
    if (!res.ok) throw new Error((data as any).message ?? (data as any).error ?? 'Failed to create checkout session');
    const { checkoutUrl } = data as { checkoutUrl: string };
    if (!checkoutUrl) throw new Error('No checkout URL returned from server');
    return checkoutUrl;
  }, [authUserId, accessToken, cart]);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart, addToCart, removeFromCart, updateQuantity, clearCart,
      cartCount, cartTotal, loading, processingFee, apiTotal, checkout,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) throw new Error('useCart must be used within a CartProvider');
  return context;
}
