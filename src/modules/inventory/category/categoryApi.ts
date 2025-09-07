import { categoryAPI } from '../../../api';

export const getCategories = () => categoryAPI.getAll();
export const getCategoryById = (id: string) => categoryAPI.getById(id);
export const createCategory = (data: any) => categoryAPI.create(data);
export const updateCategory = (id: string, data: any) => categoryAPI.update(id, data);
export const deleteCategory = (id: string) => categoryAPI.delete(id);
