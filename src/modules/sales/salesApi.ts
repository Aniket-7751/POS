import axios from 'axios';

export interface Sale {
  _id: string;
  transactionId: string;
  dateTime: string;
  items: any[];
  paymentMethod: string;
  customerDetails?: {
    name?: string;
    phone?: string;
    email?: string;
  };
  grandTotal: number;
  subTotal: number;
  gstTotal: number;
  discountTotal: number;
}

const getAll = (storeId?: string) =>
  axios.get('/sales', { params: { storeId } });

const getTodaysSales = (storeId?: string) =>
  axios.get('/sales/today', { params: { storeId } });

const getByPaymentMethod = (method: string, storeId?: string) =>
  axios.get('/sales/payment-method', { params: { method, storeId } });

const getByDate = (date: string, storeId?: string) =>
  axios.get('/sales/by-date', { params: { date, storeId } });

const getByDay = (day: string, storeId?: string) =>
  axios.get('/sales/by-day', { params: { day, storeId } });

export default {
  getAll,
  getTodaysSales,
  getByPaymentMethod,
  getByDate,
  getByDay,
};
