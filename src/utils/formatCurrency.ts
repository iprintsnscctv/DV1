/**
 * Utility functions for formatting Philippine Peso (PHP / ₱)
 */

export const formatPHP = (amount: number): string => {
  return `₱${Math.round(amount).toLocaleString('en-PH')}`;
};

export const formatPHPWithDecimals = (amount: number): string => {
  return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
