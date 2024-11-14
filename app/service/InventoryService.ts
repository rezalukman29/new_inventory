/* eslint-disable no-extra-boolean-cast */
import {
  APIResponse,
  BaseResponsePagination,
} from '../interfaces/BaseApiResponse';
import {
  BarangGudangI,
  InventoryFilterPropsI,
  InventoryHistoryI,
  InventoryImage,
  PayloadAddEventI,
  PayloadUploadImageI,
} from '../interfaces/InventoryInterface';

import ax from './axios';

const URL = 'barang';
const URL_WAREHOUSE = 'barang-with-gudang';
const URL_BARANG_GUDANG = 'barang-gudang';
const URL_BARANG_FILTER = 'barang-filter?';
const URL_CATEGORY = 'kategori-barang';
const URL_HISTORY_ITEM = 'barang-gudang-history';
const URL_BARANG_IMAGE = 'barang-image';
const URL_AREA = 'area';

export const InventoryService = {
  getById: async (barangId: string) => {
    const response = await ax.get(`${URL}/${barangId}`);
    return response.data.data;
  },
  getDetailById: async (barangId: string) => {
    const response = await ax.get(`${URL_WAREHOUSE}/${barangId}`);
    return response.data.data;
  },
  getDetailBarangGudang: async (
    barangGudangId: number | null,
  ): Promise<APIResponse<any>> => {
    const response = await ax.get(`/v1/${URL_BARANG_GUDANG}/${barangGudangId}`);
    return response.data;
  },
  getScanEventBarang: async (
    barangGudangId: number | null,
    fixListItemId: number,
  ): Promise<APIResponse<any>> => {
    const response = await ax.get(
      `scanInAPI?barang_gudang_id=${barangGudangId}&fix_list_item_id=${fixListItemId}`,
    );
    return response.data;
  },
  getInventory: async (
    filter: InventoryFilterPropsI,
  ): Promise<BaseResponsePagination<any>> => {
    const response = await ax.get(
      `/v1/${URL_BARANG_FILTER}${
        filter.category ? `kategori=${filter.category}&` : ''
      }page=${filter.page}&limit=${filter.limit}&order=${filter.order}${
        filter.search ? `&search=${filter.search}` : ''
      }`,
    );
    return response.data;
  },
  getCategory: async (page: number): Promise<Array<any>> => {
    const response = await ax.get(`${URL_CATEGORY}/event/page/${page}`);
    return response.data.data;
  },
  getHistoryItem: async (
    barangGudangId: number | null,
  ): Promise<APIResponse<Array<InventoryHistoryI>>> => {
    const response = await ax.get(`${URL_HISTORY_ITEM}/${barangGudangId}`);
    return response.data;
  },
  getInventoryImages: async (
    barangId: number,
  ): Promise<APIResponse<Array<InventoryImage>>> => {
    const response = await ax.get(`${URL_BARANG_IMAGE}/${barangId}`);
    return response.data;
  },
  uploadInventoryImage: async (
    data: PayloadUploadImageI,
  ): Promise<APIResponse<any>> => {
    const response = await ax.post(`${URL_BARANG_IMAGE}`, {
      barang_id: data.id,
      detail: data.description,
      photo: data.photo,
    });
    return response.data;
  },
  getListArea: async (page: number): Promise<APIResponse<Array<any>>> => {
    const response = await ax.get(`${URL_AREA}/page/${page}`);
    return response.data;
  },
  getBarangGudang: async (
    gudangId: number | string,
    page: number,
    search: string,
    limit: number,
  ): Promise<BaseResponsePagination<BarangGudangI[]>> => {
    const response = await ax.get(
      `v1/barang-gudang/detail?${gudangId === 'All' || gudangId === null ? "" : `gudang_id=${gudangId}&`}page=${page}&limit=${limit}${
        search ? `&search=${search}` : ''
      }`,
    );
    return response.data.data;
  },
  getItemInventory: async ({
    params,
  }: {
    params: InventoryFilterPropsI;
  }): Promise<BaseResponsePagination<any>> => {
    const response = await ax.get(
      `${URL_BARANG_FILTER}${
        !!params.category ? `kategori=${params.category}&` : ''
      }page=${params.page}&limit=${params.limit}&order=${params.order}${
        !!params.search ? `&search=${params.search}` : ''
      }`,
    );
    return response.data.data;
  },
  addEvent: async (data: PayloadAddEventI): Promise<APIResponse<any>> => {
    const response = await ax.post(`/v1/event/create`, data);
    return response.data;
  },
  editEvent: async (data: PayloadAddEventI): Promise<APIResponse<any>> => {
    const response = await ax.put(`/v1/event/update`, data);
    return response.data;
  },
  deleteEvent: async ({
    id,
  }: {
    id: string;
  }): Promise<any> => {
    const response = await ax.delete(`/v1/event/${id}`
    );
    return response.data;
  },
  getInventoryList: async (page: number): Promise<APIResponse<Array<any>>> => {
    const response = await ax.get(`/v1/${URL}/page/${page}?limit=20`);
    return response.data;
  },
  getSatuan: async () => {
    const response = await ax.get(`/v1/satuan`);
    return response.data;
  },
  getItemCategory: async () => {
    const response = await ax.get(`/v1/kategori-barang-all`);
    return response.data;
  },
  addBarang: async (data: any): Promise<APIResponse<any>> => {
    const response = await ax.post(`/v1/barang`, data);
    return response.data;
  },
  editBarang: async (data: any): Promise<APIResponse<any>> => {
    const response = await ax.put(`/v1/barang`, data);
    return response.data;
  },
  deleteBarang: async (id: any): Promise<APIResponse<any>> => {
    const response = await ax.delete(`/v1/barang/${id}`);
    return response.data;
  },
  deleteBarangGudang: async (id: any): Promise<APIResponse<any>> => {
    const response = await ax.delete(`/v1/barang-gudang/${id}`);
    return response.data;
  },
  addBarangGudang: async (data: any): Promise<APIResponse<any>> => {
    const response = await ax.post(`/v1/barang-gudang`, data);
    return response.data;
  },
  editBarangGudang: async (data: any): Promise<APIResponse<any>> => {
    const response = await ax.put(`/v1/barang-gudang`, data);
    return response.data;
  },
  getArea: async (): Promise<APIResponse<Array<any>>> => {
    const response = await ax.get(`/v1/area`);
    return response.data;
  },
  addArea: async (data: any): Promise<APIResponse<any>> => {
    const response = await ax.post(`/v1/area`, data);
    return response.data;
  },
  editArea: async (data: any): Promise<APIResponse<any>> => {
    const response = await ax.put(`/v1/area`, data);
    return response.data;
  },
  deleteArea: async (id: any): Promise<APIResponse<any>> => {
    const response = await ax.delete(`/v1/area/${id}`);
    return response.data;
  },
  deleteFixItem: async (id: any): Promise<APIResponse<any>> => {
    const response = await ax.delete(`/v1/fix-list-item/${id}`);
    return response.data;
  },
  getSubArea: async (): Promise<APIResponse<Array<any>>> => {
    const response = await ax.get(`/v1/sub-area`);
    return response.data;
  },
  addSubArea: async (data: any): Promise<APIResponse<any>> => {
    const response = await ax.post(`/v1/sub-area`, data);
    return response.data;
  },
  editSubArea: async (data: any): Promise<APIResponse<any>> => {
    const response = await ax.put(`/v1/sub-area`, data);
    return response.data;
  },
  deleteSubArea: async (id: any): Promise<APIResponse<any>> => {
    const response = await ax.delete(`/v1/sub-area/${id}`);
    return response.data;
  },
  postLogin: async (data: any): Promise<APIResponse<any>> => {
    const response = await ax.post(`/v1/login`, data);
    return response.data;
  },
  loginFetch: async (body: any): Promise<APIResponse<any>> => {
    const result = await fetch('https://emi-backend-staging.emi-project.my.id/v1/login', {
      method: 'POST',
      body: JSON.stringify({
        email: body.email,
        password: body.password,
      }),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    });
    const data = await result.json();
    return data;
  },
  postRegister: async (body: any): Promise<APIResponse<any>> => {
    const result = await fetch('https://emi-backend-staging.emi-project.my.id/v1/register', {
      method: 'POST',
      body: JSON.stringify({
        fullname: body.name,
        email: body.email,
        password: body.password,
      }),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    });
    const data = await result.json();
    return data;
  },
  getEmiUser: async () => {
    const response = await ax.get(`/user/get-a11-d4t4-us3r`);
    return response.data;
  },
  getGudang: async () => {
    const response = await ax.get(`/v1/gudang`);
    return response.data;
  },
};
