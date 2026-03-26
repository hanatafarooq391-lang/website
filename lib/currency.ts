// lib/currency.ts — PKR Currency formatting
// Prices are stored and entered in PKR directly

export function toPKR(pkrPrice: number): number {
  return Math.round(pkrPrice)
}

export function formatPKR(pkrPrice: number): string {
  return 'Rs.' + Math.round(pkrPrice).toLocaleString('en-PK')
}

// Use this everywhere to format prices
export function price(pkrPrice: number | null | undefined): string {
  if (!pkrPrice) return 'Rs.0'
  return formatPKR(pkrPrice)
}

// Kept for backward compatibility — no conversion needed
export const USD_TO_PKR = 1
