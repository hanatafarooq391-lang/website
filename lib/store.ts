// lib/store.ts — Global state with Zustand
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem, Product, Profile } from '@/types'

// ── CART STORE ────────────────────────────────────────────────
interface CartStore {
  items: CartItem[]
  addItem:    (product: Product, size: string, qty?: number) => void
  removeItem: (productId: string, size: string) => void
  updateQty:  (productId: string, size: string, qty: number) => void
  clearCart:  () => void
  total:      () => number
  itemCount:  () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, size, qty = 1) => {
        set(state => {
          const existing = state.items.find(
            i => i.product.id === product.id && i.size === size
          )
          if (existing) {
            return {
              items: state.items.map(i =>
                i.product.id === product.id && i.size === size
                  ? { ...i, quantity: i.quantity + qty }
                  : i
              )
            }
          }
          return { items: [...state.items, { product, size, quantity: qty }] }
        })
      },

      removeItem: (productId, size) => {
        set(state => ({
          items: state.items.filter(
            i => !(i.product.id === productId && i.size === size)
          )
        }))
      },

      updateQty: (productId, size, qty) => {
        if (qty <= 0) {
          get().removeItem(productId, size)
          return
        }
        set(state => ({
          items: state.items.map(i =>
            i.product.id === productId && i.size === size
              ? { ...i, quantity: qty }
              : i
          )
        }))
      },

      clearCart: () => set({ items: [] }),

      total: () =>
        get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),

      itemCount: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: 'viaura-cart',
      // Only persist items array
      partialize: state => ({ items: state.items }),
    }
  )
)

// ── AUTH STORE ────────────────────────────────────────────────
interface AuthStore {
  user:    Profile | null
  loading: boolean
  setUser:    (user: Profile | null) => void
  setLoading: (loading: boolean) => void
  logout:     () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    set => ({
      user:    null,
      loading: true,
      setUser:    user    => set({ user, loading: false }),
      setLoading: loading => set({ loading }),
      logout:     ()      => set({ user: null }),
    }),
    {
      name: 'viaura-auth',
      partialize: state => ({ user: state.user }),
    }
  )
)

// ── UI STORE (no persistence) ─────────────────────────────────
interface UIStore {
  cartOpen:    boolean
  searchOpen:  boolean
  mobileNavOpen: boolean
  toggleCart:    () => void
  closeCart:     () => void
  toggleSearch:  () => void
  toggleMobileNav: () => void
}

export const useUIStore = create<UIStore>()(set => ({
  cartOpen:      false,
  searchOpen:    false,
  mobileNavOpen: false,
  toggleCart:    () => set(s => ({ cartOpen: !s.cartOpen })),
  closeCart:     () => set({ cartOpen: false }),
  toggleSearch:  () => set(s => ({ searchOpen: !s.searchOpen })),
  toggleMobileNav: () => set(s => ({ mobileNavOpen: !s.mobileNavOpen })),
}))
