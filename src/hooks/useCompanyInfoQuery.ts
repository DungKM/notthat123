import { useQuery } from '@tanstack/react-query';
import api from '../api/axiosInstance';
import { message } from 'antd';

export const useCompanyInfoQuery = () => {
  return useQuery({
    queryKey: ['company-info'],
    queryFn: async () => {
      try {
        const res: any = await api.get('/company-info');
        return res?.data || res;
      } catch (err: any) {
        console.error('Failed to load company info:', err);
        return null;
      }
    },
    staleTime: 1000 * 60 * 10, // Cache for 1 hour
    gcTime: 1000 * 60 * 60 * 24, // Keep in garbage collector for 24 hours
    refetchOnWindowFocus: false, // Do not refetch on window focus
  });
};
