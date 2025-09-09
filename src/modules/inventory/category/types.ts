export interface Category {
  _id?: string;
  categoryId: string;
  categoryName: string;
  categoryDescription?: string;
  status: 'active' | 'inactive';
  organizationId: string;
  createdAt?: string;
  updatedAt?: string;
}
