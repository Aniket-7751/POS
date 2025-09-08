import { salesAPI } from '../../api';

export interface SaleItem {
  sku: string;
  itemName: string;
  quantity: number;
  pricePerUnit: number;
  gst: number;
  discount: number;
  totalAmount: number;
}

export interface CustomerDetails {
  name?: string;
  phone?: string;
  email?: string;
}

export interface Sale {
  _id: string;
  transactionId: string;
  storeId: string;
  items: SaleItem[];
  subTotal: number;
  gstTotal: number;
  discountTotal: number;
  grandTotal: number;
  paymentMethod: 'cash' | 'card' | 'UPI';
  dateTime: string;
  customerDetails: CustomerDetails;
  cashier: string;
  createdAt: string;
  updatedAt: string;
}

export default salesAPI;
