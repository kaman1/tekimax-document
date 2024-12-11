import { CURRENCIES } from "@v1/backend/convex/schema";

/**
 * Locales.
 */
export function getLocaleCurrency() {
  if (typeof window === 'undefined') {
    return CURRENCIES.USD;
  }
  
  return navigator.languages.includes("en-US")
    ? CURRENCIES.USD
    : // Only support USD for now due to Polar limitations.
      CURRENCIES.USD;
}
