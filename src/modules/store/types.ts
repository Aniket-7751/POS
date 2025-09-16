export interface Store {
  _id?: string;
  storeId: string;
  storeName: string;
  storeLocation: string;
  storeAddress: string;
  contactPersonName: string;
  contactNumber: string;
  email: string;
  storePicture?: string;
  status: 'active' | 'inactive';
  organizationId: string;
  createdAt?: string;
  updatedAt?: string;
  gstRate?: number;
  discountRate?: number;
  theme?: 'light' | 'dark';
}
