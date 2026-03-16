import React from 'react';
import { ConfigProvider } from 'antd';
import { ProConfigProvider } from '@ant-design/pro-components';
import viVN from 'antd/locale/vi_VN';
import viVNIntl from '../../locales/vi-VN';
import { AuthProvider } from '../../auth/hooks/useAuth';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
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
  );
};
