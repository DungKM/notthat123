import { useState, useCallback, useRef } from 'react';
import api from '../api/axiosInstance';
import { message } from 'antd';

// ─── Types ───
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: { total: number; page: number; pageSize: number };
  message?: string;
}

export interface QueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  [key: string]: any;
}

export interface UseApiReturn<T> {
  data: T | null;
  list: T[];
  loading: boolean;
  error: string | null;
  meta: { total: number; page: number; pageSize: number } | null;

  // CRUD methods
  getAll: (params?: QueryParams) => Promise<T[]>;
  getById: (id: string) => Promise<T>;
  create: (payload: Partial<T>) => Promise<T>;
  update: (id: string, payload: Partial<T>) => Promise<T>;
  remove: (id: string) => Promise<void>;

  // Custom request
  request: <R = any>(method: string, url: string, payload?: any) => Promise<R>;
}

// ─── Generic CRUD Hook ───
export function useApi<T = any>(basePath: string): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [list, setList] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ total: number; page: number; pageSize: number } | null>(null);

  // Tránh race condition
  const requestIdRef = useRef(0);

  const handleError = useCallback((err: any) => {
    const msg = err?.message || 'Lỗi không xác định';
    setError(msg);
    message.error(msg);
    throw err;
  }, []);

  // ─── GET ALL ───
  const getAll = useCallback(async (params?: QueryParams): Promise<T[]> => {
    const id = ++requestIdRef.current;
    setLoading(true);
    setError(null);
    try {
      const res: ApiResponse<T[]> = await api.get(basePath, { params });
      if (id !== requestIdRef.current) return []; // Stale request
      setList(res.data);
      if (res.meta) setMeta(res.meta);
      return res.data;
    } catch (err: any) {
      if (id === requestIdRef.current) handleError(err);
      return [];
    } finally {
      if (id === requestIdRef.current) setLoading(false);
    }
  }, [basePath, handleError]);

  // ─── GET BY ID ───
  const getById = useCallback(async (id: string): Promise<T> => {
    setLoading(true);
    setError(null);
    try {
      const res: ApiResponse<T> = await api.get(`${basePath}/${id}`);
      setData(res.data);
      return res.data;
    } catch (err: any) {
      handleError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [basePath, handleError]);

  // ─── CREATE ───
  const create = useCallback(async (payload: Partial<T>): Promise<T> => {
    setLoading(true);
    setError(null);
    try {
      const res: ApiResponse<T> = await api.post(basePath, payload);
      message.success(res.message || 'Tạo thành công!');
      return res.data;
    } catch (err: any) {
      handleError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [basePath, handleError]);

  // ─── UPDATE ───
  const update = useCallback(async (id: string, payload: Partial<T>): Promise<T> => {
    setLoading(true);
    setError(null);
    try {
      const res: ApiResponse<T> = await api.put(`${basePath}/${id}`, payload);
      message.success(res.message || 'Cập nhật thành công!');
      return res.data;
    } catch (err: any) {
      handleError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [basePath, handleError]);

  // ─── DELETE ───
  const remove = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const res: ApiResponse<null> = await api.delete(`${basePath}/${id}`);
      message.success(res.message || 'Xóa thành công!');
    } catch (err: any) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, [basePath, handleError]);

  // ─── CUSTOM REQUEST (cho API đặc biệt) ───
  const request = useCallback(async <R = any>(method: string, url: string, payload?: any): Promise<R> => {
    setLoading(true);
    setError(null);
    try {
      const res = await api({ method, url: `${basePath}${url}`, data: payload });
      return res as R;
    } catch (err: any) {
      handleError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [basePath, handleError]);

  return {
    data, list, loading, error, meta,
    getAll, getById, create, update, remove, request,
  };
}
