import { expect } from '@playwright/test';
import { FINANCIAL_RULES } from '../../test-data/users';

export interface OrderFinancialBreakdown {
  grossPrice: number;
  escrowHeld: number;
  platformFee: number;
  sellerNet: number;
}

export class FinancialAssertionHelper {
  /**
   * Asserts standard order creation and escrow locking math
   */
  static assertOrderCreationMath(grossPrice: number): OrderFinancialBreakdown {
    const fee = FINANCIAL_RULES.calculatePlatformFee(grossPrice);
    const sellerNet = FINANCIAL_RULES.calculateSellerNetPayout(grossPrice);

    expect(fee).toBeCloseTo(Number((grossPrice * 0.15).toFixed(2)), 2);
    expect(sellerNet).toBeCloseTo(Number((grossPrice * 0.85).toFixed(2)), 2);
    expect(Number((sellerNet + fee).toFixed(2))).toBe(Number(grossPrice.toFixed(2)));

    return {
      grossPrice,
      escrowHeld: grossPrice,
      platformFee: fee,
      sellerNet,
    };
  }

  /**
   * Asserts Full Buyer Refund math (100% to Buyer, $0 to Seller, Order Cancelled)
   */
  static assertFullBuyerRefund(grossPrice: number, actualBuyerRefund: number, actualSellerPayout: number) {
    const expected = FINANCIAL_RULES.calculateFullBuyerRefund(grossPrice);
    expect(Number(actualBuyerRefund.toFixed(2))).toBe(expected.buyerRefund);
    expect(Number(actualSellerPayout.toFixed(2))).toBe(0);
  }

  /**
   * Asserts Full Seller Release math (85% net to Seller, 15% platform fee deducted, $0 to Buyer)
   */
  static assertFullSellerRelease(grossPrice: number, actualBuyerRefund: number, actualSellerPayout: number) {
    const expected = FINANCIAL_RULES.calculateFullSellerRelease(grossPrice);
    expect(Number(actualBuyerRefund.toFixed(2))).toBe(0);
    expect(actualSellerPayout).toBeCloseTo(expected.sellerPayout, 2);
  }

  /**
   * Asserts Custom Split math:
   * - Buyer gets exact $X
   * - Seller gets $(gross - X) minus 15% platform charge on their portion
   */
  static assertCustomSplit(
    grossPrice: number,
    buyerRefundDollars: number,
    actualBuyerRefund: number,
    actualSellerPayout: number
  ) {
    const expected = FINANCIAL_RULES.calculateCustomSplit(grossPrice, buyerRefundDollars);
    expect(Number(actualBuyerRefund.toFixed(2))).toBe(expected.buyerRefund);
    expect(actualSellerPayout).toBeCloseTo(expected.sellerNetPayout, 2);
  }
}
