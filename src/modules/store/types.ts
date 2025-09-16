export interface Store {
  _id?: string;
  storeId?: string; // Optional since it's auto-generated
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
}

// New interface for the enhanced store creation response
export interface StoreCreationResponse {
  success: boolean;
  message: string;
  store: {
    storeId: string;
    storeName: string;
    storeLocation: string;
    contactPersonName: string;
    email: string;
    status: string;
  };
  user: {
    userId: string;
    name: string;
    email: string;
    status: string;
    role: string;
  };
  signupLink: string;
  emailSent: boolean;
}
