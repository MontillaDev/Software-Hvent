/**
 * Helper functions for currency conversion
 * These can be used independently of the React context
 */

/**
 * Convert USD to VES using the provided rate
 * @param usd - Amount in USD
 * @param rate - BCV exchange rate (VES per USD)
 * @returns Amount in VES
 */
export function convertToVES(usd: number, rate: number): number {
  return usd * rate;
}

/**
 * Convert VES to USD using the provided rate
 * @param ves - Amount in VES
 * @param rate - BCV exchange rate (VES per USD)
 * @returns Amount in USD
 */
export function convertToUSD(ves: number, rate: number): number {
  return ves / rate;
}

/**
 * Format amount as USD currency
 * @param amount - Amount to format
 * @returns Formatted USD string
 */
export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format amount as VES currency
 * @param amount - Amount to format
 * @returns Formatted VES string
 */
export function formatVES(amount: number): string {
  return new Intl.NumberFormat('es-VE', {
    style: 'currency',
    currency: 'VES',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format amount showing both USD and VES
 * @param usd - Amount in USD
 * @param rate - BCV exchange rate
 * @returns Formatted dual price string
 */
export function formatDualPrice(usd: number, rate: number): string {
  const ves = convertToVES(usd, rate);
  return `${formatUSD(usd)} / ${formatVES(ves)}`;
}

/**
 * Calculate profit margin based on cost and price in USD
 * This ensures profitability is protected from inflation
 * @param costUSD - Cost in USD
 * @param priceUSD - Selling price in USD
 * @returns Profit margin as a percentage
 */
export function calculateProfitMargin(costUSD: number, priceUSD: number): number {
  if (costUSD <= 0) return 0;
  return ((priceUSD - costUSD) / costUSD) * 100;
}

/**
 * Calculate consolidated total in USD from mixed payments
 * @param usdAmount - Amount paid in USD
 * @param vesAmount - Amount paid in VES
 * @param rate - BCV exchange rate
 * @returns Total consolidated in USD
 */
export function calculateConsolidatedUSD(usdAmount: number, vesAmount: number, rate: number): number {
  return usdAmount + convertToUSD(vesAmount, rate);
}

/**
 * Calculate consolidated total in VES from mixed payments
 * @param usdAmount - Amount paid in USD
 * @param vesAmount - Amount paid in VES
 * @param rate - BCV exchange rate
 * @returns Total consolidated in VES
 */
export function calculateConsolidatedVES(usdAmount: number, vesAmount: number, rate: number): number {
  return convertToVES(usdAmount, rate) + vesAmount;
}
