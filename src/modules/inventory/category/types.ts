export interface Category {
  _id?: string;
  categoryId: string;
  categoryName: string;
  categoryDescription?: string;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}
