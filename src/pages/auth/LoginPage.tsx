import React, { useState } from 'react';
import {
  LockOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  LoginForm,
  ProFormCheckbox,
  ProFormText,
} from '@ant-design/pro-components';
import { message, Tabs, theme } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/src/auth/hooks/useAuth';
import { Role } from '@/src/auth/types';
import { ROUTES } from '@/src/routes/index';

type LoginType = 'account' | 'mobile';

const LoginPage: React.FC = () => {
  const [loginType, setLoginType] = useState<LoginType>('account');
  const { login } = useAuth();
  const navigate = useNavigate();
  const { token } = theme.useToken();

  const handleSubmit = async (values: any) => {
    try {
      const user = await login(values.account, values.password);
      if (user) {
        message.success(`Chào mừng trở lại, ${user.name}!`);
        // Điều hướng dựa trên role
        switch (user.role) {
          case Role.DIRECTOR:
          case Role.ACCOUNTANT:
            navigate(ROUTES.ADMIN_TONG_QUAN);
            break;
          case Role.SITE_MANAGER:
            navigate(ROUTES.ADMIN_CONG_TRINH);
            break;
          case Role.STAFF:
            navigate(ROUTES.ADMIN_CHAM_CONG_CA_NHAN);
            break;
          case Role.CUSTOMER:
            navigate(ROUTES.TRO_CHUYEN);
            break;
          default:
            navigate(ROUTES.TRANG_CHU);
        }
      } else {
        message.error('Tên đăng nhập hoặc mật khẩu không đúng!');
      }
    } catch (error: any) {
      console.error(error);
      message.error(error.message || 'Đã xảy ra lỗi khi đăng nhập!');
    }
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    overflow: 'auto',
    backgroundImage: "url('https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/V-_oS6r-i7wAAAAAAAAAAAAAFl94AQBr')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  return (
    <div style={containerStyle}>
      <div style={{ flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
        <LoginForm
          contentStyle={{
            minWidth: 280,
            maxWidth: 328,
            width: '100%',
          }}
          title="HỆ THỐNG NỘI BỘ"
          subTitle="Giải pháp quản lý doanh nghiệp toàn diện"
          initialValues={{
            autoLogin: true,
          }}
          onFinish={handleSubmit}
          submitter={{
            searchConfig: {
              submitText: 'Đăng nhập',
            },
            submitButtonProps: {
              size: 'large',
              style: {
                width: '100%',
              },
            },
          }}
        >
          <Tabs
            activeKey={loginType}
            onChange={(activeKey) => setLoginType(activeKey as LoginType)}
            centered
            items={[
              {
                key: 'account',
                label: 'Tài khoản mật khẩu',
              },
            ]}
          />

          {loginType === 'account' && (
            <>
              <ProFormText
                name="account"
                fieldProps={{
                  size: 'large',
                  prefix: <UserOutlined style={{ color: token.colorPrimary }} />,
                }}
                placeholder="Tên đăng nhập"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập tên đăng nhập!',
                  },
                ]}
              />
              <ProFormText.Password
                name="password"
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined style={{ color: token.colorPrimary }} />,
                }}
                placeholder="Mật khẩu"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập mật khẩu!',
                  },
                ]}
              />
            </>
          )}

          <div style={{ marginBottom: 24 }}>
            <ProFormCheckbox noStyle name="autoLogin">
              Ghi nhớ đăng nhập
            </ProFormCheckbox>
            <a style={{ float: 'right' }}>Quên mật khẩu?</a>
          </div>
        </LoginForm>
      </div>
      <div style={{ padding: '24px 0', textAlign: 'center', color: 'rgba(0, 0, 0, 0.45)' }}>
        © 2026 Bản quyền thuộc về Đội ngũ Phát triển
      </div>
    </div>
  );
};

export default LoginPage;
