// lib/stripe.ts — Stripe removed, using Cash on Delivery
// Yeh file future mein Stripe add karne ke liye hai
// Abhi COD use ho raha hai

export async function createCheckoutSession() {
  throw new Error('Stripe not configured — using Cash on Delivery')
}
