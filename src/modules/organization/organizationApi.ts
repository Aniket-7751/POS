import { organizationAPI } from '../../api';

export const getOrganizations = () => organizationAPI.getAll();
export const getOrganizationById = (id: string) => organizationAPI.getById(id);
export const createOrganization = (data: any) => organizationAPI.create(data);
export const updateOrganization = (id: string, data: any) => organizationAPI.update(id, data);
export const deleteOrganization = (id: string) => organizationAPI.delete(id);
