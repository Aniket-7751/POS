import { catalogueAPI } from '../../../api';

export const getCatalogues = () => catalogueAPI.getAll();
export const getCatalogueById = (id: string) => catalogueAPI.getById(id);
export const createCatalogue = (data: any) => catalogueAPI.create(data);
export const updateCatalogue = (id: string, data: any) => catalogueAPI.update(id, data);
export const deleteCatalogue = (id: string) => catalogueAPI.delete(id);
export const getCatalogueBySKU = (sku: string) => catalogueAPI.getBySKU(sku);
export const getCatalogueByBarcode = (barcode: string) => catalogueAPI.getByBarcode(barcode);

// File upload methods
export const createCatalogueWithFiles = (data: FormData) => catalogueAPI.createWithFiles(data);
export const updateCatalogueWithFiles = (id: string, data: FormData) => catalogueAPI.updateWithFiles(id, data);

// Helper function to create FormData for file uploads
export const buildFormData = (formData: any, imageFile?: File, thumbnailFile?: File) => {
  const data = new FormData();
  
  // Add all form fields
  Object.keys(formData).forEach(key => {
    if (formData[key] !== null && formData[key] !== undefined) {
      if (typeof formData[key] === 'object') {
        data.append(key, JSON.stringify(formData[key]));
      } else {
        data.append(key, formData[key]);
      }
    }
  });
  
  // Add image files if present
  if (imageFile) {
    data.append('image', imageFile);
  }
  if (thumbnailFile) {
    data.append('thumbnail', thumbnailFile);
  }
  
  return data;
};
