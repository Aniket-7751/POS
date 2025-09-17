// import { storeAPI } from '../../api';

// export const getStores = () => storeAPI.getAll();
// export const getStoreById = (id: string) => storeAPI.getById(id);
// export const createStore = (data: any) => storeAPI.create(data);
// export const updateStore = (id: string, data: any) => storeAPI.update(id, data);
// export const deleteStore = (id: string) => storeAPI.delete(id);

// src/modules/store/storeApi.ts
import { api } from '../../api';

export interface Store {
  _id: string;
  storeId: string;
  storeName: string;
}

// Instead of exporting functions individually, group them into one object
const storeAPI = {
  getAll: () => api.get('/stores'),
  getById: (id: string) => api.get(`/stores/${id}`),
  create: (data: any) => api.post('/stores', data),
  update: (id: string, data: any) => api.put(`/stores/${id}`, data),
  delete: (id: string) => api.delete(`/stores/${id}`),
};

export default storeAPI; // ✅ add default export

