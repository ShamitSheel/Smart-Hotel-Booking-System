export interface Coupon {
  id: number;
  code: string;
  discount: number; 
  minAmount: number;
  valid: boolean;
}
