import { catalogueAPI } from '../../../api';

export const getCatalogues = () => catalogueAPI.getAll();
export const getCatalogueById = (id: string) => catalogueAPI.getById(id);
export const createCatalogue = (data: any) => catalogueAPI.create(data);
export const updateCatalogue = (id: string, data: any) => catalogueAPI.update(id, data);
export const deleteCatalogue = (id: string) => catalogueAPI.delete(id);
export const getCatalogueBySKU = (sku: string) => catalogueAPI.getBySKU(sku);
export const getCatalogueByBarcode = (barcode: string) => catalogueAPI.getByBarcode(barcode);
