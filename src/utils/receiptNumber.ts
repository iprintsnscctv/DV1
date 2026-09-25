import { Reservation } from '../types';

/**
 * Generates a standard receipt number in the format DV-SSYY where:
 * - DV is the prefix for Diversion Vigan
 * - SS represents the 2-digit sequence number (e.g. 01, 02, 03...)
 * - YY represents the 2-digit year (e.g. 26 for 2026)
 * Example: DV-0126
 */
export function generateReceiptNumber(existingReservations: Reservation[] = []): string {
  const currentYear = new Date().getFullYear().toString().slice(-2); // e.g. "26"
  
  let maxSeq = 0;
  for (const res of existingReservations) {
    if (res.confirmationCode) {
      // Match DV-0126, DV-0226, or any DV-(\d+)(\d{2})
      const match = res.confirmationCode.match(/^DV-(\d{2,})(\d{2})$/i);
      if (match) {
        const seq = parseInt(match[1], 10);
        if (!isNaN(seq) && seq > maxSeq) {
          maxSeq = seq;
        }
      }
    }
  }

  const nextSeq = maxSeq > 0 ? maxSeq + 1 : Math.max(1, existingReservations.length + 1);
  const paddedSeq = String(nextSeq).padStart(2, '0');
  return `DV-${paddedSeq}${currentYear}`;
}

/**
 * Normalizes or validates receipt numbers into the canonical DV-SSYY format
 */
export function normalizeReceiptNumber(code?: string, fallbackIndex = 1): string {
  if (!code) {
    const currentYear = new Date().getFullYear().toString().slice(-2);
    return `DV-${String(fallbackIndex).padStart(2, '0')}${currentYear}`;
  }
  
  // If already standard DV-0126 format
  if (/^DV-\d{4,}$/i.test(code)) {
    return code.toUpperCase();
  }

  // Convert older mock codes if encountered
  const currentYear = new Date().getFullYear().toString().slice(-2);
  return `DV-${String(fallbackIndex).padStart(2, '0')}${currentYear}`;
}
