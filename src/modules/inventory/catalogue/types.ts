export interface NutritionValue {
  calories?: number;
  protein?: number;
  fat?: number;
  carbs?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}

export interface Catalogue {
  _id?: string;
  itemId: string;
  sku: string;
  itemName: string;
  categoryId: string;
  volumeOfMeasurement: string;
  sourceOfOrigin?: string;
  nutritionValue?: NutritionValue;
  certification?: string;
  price: number;
  stock: number;
  barcode?: string;
  status: 'active' | 'inactive';
  image?: string;
  thumbnail?: string;
  instructions?: string;
  expiry?: string;
  organizationId?: string;
  createdAt?: string;
  updatedAt?: string;
}
