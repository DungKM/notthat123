import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppProviders } from './app/providers';
import AppRouter from './app/router/router';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import { ConfigProvider, App as AntdApp } from 'antd';
import locale from 'antd/locale/vi_VN';
import { Toaster } from 'react-hot-toast';

dayjs.locale('vi');

export default function App() {
  return (
    <ConfigProvider locale={locale}>
      <AntdApp> {/* QUAN TRỌNG */}
        <BrowserRouter>
          <AppProviders>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  fontSize: '13px',
                  padding: '12px 16px',
                  fontWeight: '600',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                }
              }}
              containerStyle={{
                top: 70,
                zIndex: 9999
              }}
            />

            <AppRouter />

          </AppProviders>
        </BrowserRouter>
      </AntdApp>
    </ConfigProvider>
  );
}