import React from 'react';
import { ConfigProvider } from 'antd';
import { ProConfigProvider } from '@ant-design/pro-components';
import viVN from 'antd/locale/vi_VN';
import viVNIntl from '../../locales/vi-VN';
import { AuthProvider } from '../../auth/hooks/useAuth';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,    // 5 phút
      gcTime: 10 * 60 * 1000,      // 10 phút giữ trong memory
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Lưu cache vào localStorage — tồn tại qua reload
const localStoragePersister = createSyncStoragePersister({
  storage: window.localStorage,
  key: 'hochi-query-cache',
  throttleTime: 1000, // ghi localStorage tối đa 1 lần/giây
});

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: localStoragePersister,
        maxAge: 10 * 60 * 1000, // cache localStorage tồn tại tối đa 10 phút
        buster: '1',            // đổi số này khi muốn xóa toàn bộ cache cũ
      }}
    >
      <ConfigProvider
        locale={viVN}
        theme={{
          token: {
            colorPrimary: '#13d855ff',
            borderRadius: 8,
          },
        }}
      >
        <ProConfigProvider
          dark={false}
          hashed={false}
          intl={{
            locale: 'vi_VN',
            getMessage: (id: string, defaultMessage: string) => {
              const keys = id.split('.');
              let result: any = viVNIntl;
              for (const key of keys) {
                result = result?.[key];
              }
              return result || defaultMessage;
            },
          }}
        >
          <AuthProvider>
            {children}
          </AuthProvider>
        </ProConfigProvider>
      </ConfigProvider>
    </PersistQueryClientProvider>
  );
};

