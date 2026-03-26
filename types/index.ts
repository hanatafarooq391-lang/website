// types/index.ts — shared TypeScript types for VIAURA

export interface Product {
  id: string
  name: string
  slug: string
  collection: string
  gender: 'men' | 'women' | 'kids' | 'unisex'
  description: string
  long_desc?: string
  price: number
  bottle_color: string
  bg_color: string
  neck_color?: string
  notes: string[]
  sizes: string[]
  stock: number
  status: 'active' | 'draft' | 'archived'
  featured: boolean
  image_url?: string
  created_at: string
  updated_at: string
  // joined from product_ratings view
  avg_rating?: number
  review_count?: number
}

export interface Order {
  id: string
  order_number: string
  user_id?: string
  customer_name: string
  customer_email: string
  customer_phone?: string
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  subtotal: number
  shipping: number
  gift_wrap: number
  total: number
  stripe_payment_intent?: string
  stripe_session_id?: string
  shipping_address?: ShippingAddress
  notes?: string
  is_first_order: boolean
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id?: string
  product_name: string
  size?: string
  quantity: number
  unit_price: number
  total_price: number
  product?: Product
}

export interface Review {
  id: string
  product_id: string
  user_id?: string
  author_name: string
  rating: number
  title: string
  body: string
  verified: boolean
  approved: boolean
  created_at: string
  product?: { name: string; gender: string }
}

export interface Profile {
  id: string
  full_name?: string
  email: string
  phone?: string
  role: 'customer' | 'admin'
  created_at: string
}

export interface ShippingAddress {
  line1: string
  line2?: string
  city: string
  state?: string
  postal_code: string
  country: string
}

export interface CartItem {
  product: Product
  size: string
  quantity: number
}

export interface SiteSetting {
  key: string
  value: Record<string, unknown>
  updated_at: string
}

// API Response wrapper
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}
