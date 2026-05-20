"use client";

import React, {
  createContext, useContext, useState, useCallback, useEffect, ReactNode
} from 'react';
import { supabase } from '../lib/supabase-client';

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
  checkout: (paymentMethod: string) => Promise<void>;
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
      setAccessToken(session.access_token);
      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/api/cart?authUserId=${session.user.id}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
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
      } else {
        setAuthUserId(null);
        setAccessToken(null);
        setLoading(false);
      }
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
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/api/cart`, {
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
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/api/cart`, {
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
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/api/cart`, {
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

  const checkout = useCallback(async (paymentMethod: string) => {
    if (!authUserId) throw new Error('Not authenticated');
    if (cart.length === 0) throw new Error('Cart is empty');

    // Map frontend method names to DB enum values
    const methodMap: Record<string, string> = { card: 'card', wallet: 'gcash', bank: 'bank' };
    const method = methodMap[paymentMethod] ?? 'card';
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');

    // Insert purchase records (one per cart item)
    const purchases = cart.map((item) => ({
      buyer_auth_id: authUserId,
      hopecard_id: item.campaign_id,
      amount_paid: item.price * item.quantity,
      payment_method: method,
      payment_reference: `${method.slice(0, 3).toUpperCase()}-HC-${datePart}-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
      status: 'paid',
      purchased_at: new Date().toISOString(),
    }));

    const { error: purchaseErr } = await supabase.from('hopecard_purchases').insert(purchases);
    if (purchaseErr) throw new Error(purchaseErr.message || 'Failed to record purchase');

    // Atomically increment collected_amount via RPC (bypasses RLS safely)
    for (const item of cart) {
      const { error: rpcErr } = await supabase.rpc('increment_campaign_collected_amount', {
        campaign_id: item.campaign_id,
        amount: item.price * item.quantity,
      });
      if (rpcErr) console.error('Failed to update collected_amount:', rpcErr.message);
    }

    // Remove purchased items from cart in DB
    const { data: cartRows } = await supabase
      .from('carts')
      .select('id')
      .eq('auth_user_id', authUserId)
      .eq('status', 'active')
      .limit(1);
    const cartId = (cartRows as any)?.[0]?.id;
    if (cartId) {
      const campaignIds = cart.map((item) => item.campaign_id);
      await supabase.from('cart_items').delete().eq('cart_id', cartId).in('campaign_id', campaignIds);
    }

    clearCart();
  }, [authUserId, cart, clearCart]);

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
