import React, { useRef, useState } from 'react';
import { Button, Tag, message, Popconfirm, Space } from 'antd';
import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import {
  ModalForm,
  ProFormSelect,
  ProFormText,
  ProFormDigit,
  ProTable,
} from '@ant-design/pro-components';
import { Role } from '@/src/auth/types';
import { useAuth } from '@/src/auth/hooks/useAuth';
import { EditOutlined, LockOutlined, UnlockOutlined, DeleteOutlined } from '@ant-design/icons';
import { useUserService } from '@/src/api/services';

interface UserItem {
  id: string;
  name: string;
  account: string;
  role: Role;
  status: 'ACTIVE' | 'INACTIVE';
  phone?: string;
  baseSalary: number;
  createdAt?: string;
  updatedAt?: string;
}

const roleLabels: Record<Role, string> = {
  [Role.DIRECTOR]: 'Giám đốc',
  [Role.ACCOUNTANT]: 'Kế toán',
  [Role.STAFF]: 'Nhân viên',
  [Role.SITE_MANAGER]: 'Quản lý công trình',
  [Role.CUSTOMER]: 'Khách hàng',
};

type UserFormValues = {
  name: string;
  account: string;
  password?: string;
  phone?: string;
  baseSalary?: number;
  role: Role;
  status?: 'ACTIVE' | 'INACTIVE';
};

const UsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const actionRef = useRef<ActionType>(null);
  const formRef = useRef<ProFormInstance<UserFormValues>>(undefined);
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const { request, patch, remove, create } = useUserService();

  const resetModal = () => {
    setOpen(false);
    setEditingUser(null);
    formRef.current?.resetFields();
  };

  const handleOpenCreate = () => {
    setEditingUser(null);
    formRef.current?.resetFields();
    setOpen(true);
  };

  const handleOpenEdit = (user: UserItem) => {
    setEditingUser(user);
    setOpen(true);
  };

  const handleToggleStatus = async (user: UserItem) => {
    if (user.id === currentUser?.id) {
      message.error('Bạn không thể tự khóa tài khoản của chính mình!');
      return;
    }

    try {
      const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await patch(user.id, { status: newStatus });
      actionRef.current?.reload();
    } catch (error) {
      // handled by hook
    }
  };

  const handleDelete = async (id: string) => {
    if (id === currentUser?.id) {
      message.error('Bạn không thể tự xóa tài khoản của chính mình!');
      return;
    }
    try {
      await remove(id);
      actionRef.current?.reload();
    } catch (error) {
      // handled by hook
    }
  };

  const columns: ProColumns<UserItem>[] = [
    {
      title: 'Họ tên',
      dataIndex: 'name',
      width: 200,
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      width: 150,
      search: false,
    },
    {
      title: 'Lương cơ bản',
      dataIndex: 'baseSalary',
      width: 150,
      search: false,
      render: (_, record) => record.baseSalary ? `${record.baseSalary.toLocaleString('vi-VN')} đ` : '—',
    },
    {
      title: 'Tên đăng nhập',
      dataIndex: 'account',
      width: 180,
      search: false,
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      search: false,
      render: (_, record) => <Tag>{roleLabels[record.role]}</Tag>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 130,
      search: false,
      render: (_, record) =>
        record.status === 'ACTIVE' ? (
          <Tag color="green">Hoạt động</Tag>
        ) : (
          <Tag color="red">Ngưng hoạt động</Tag>
        ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      width: 120,
      search: false,
      render: (_, record) => record.createdAt ? new Date(record.createdAt).toLocaleDateString('vi-VN') : '—',
    },
    {
      title: 'Thao tác',
      valueType: 'option',
      width: 250,
      render: (_, record) => {
        const isSelf = record.id === currentUser?.id;

        // kế toán không được thao tác với giám đốc
        const isAccountantEditDirector =
          currentUser?.role === Role.ACCOUNTANT && record.role === Role.DIRECTOR;

        const disabled = isSelf || isAccountantEditDirector;

        return (
          <Space>
            {!isAccountantEditDirector && (
              <Button type="link" icon={<EditOutlined />} size="large" onClick={() => handleOpenEdit(record)} title='Sửa'>
                Sửa
              </Button>
            )}

            {!disabled && (
              <>
                <Popconfirm
                  title={`Bạn có chắc muốn ${record.status === 'ACTIVE' ? 'khóa' : 'mở khóa'} tài khoản này?`}
                  onConfirm={async () => await handleToggleStatus(record)}
                  okText="Đồng ý"
                  cancelText="Hủy"
                >
                  <Button
                    type="link"
                    size="large"
                    danger={record.status === 'ACTIVE'}
                    icon={record.status === 'ACTIVE' ? <LockOutlined /> : <UnlockOutlined />}
                    title={record.status === 'ACTIVE' ? 'Khóa/mở khóa' : 'Mở khóa'}
                  >
                  </Button>
                </Popconfirm>
                {/* 
                <Popconfirm
                  title="Xóa người dùng này?"
                  description="Hành động này không thể hoàn tác."
                  okText="Xóa"
                  cancelText="Hủy"
                  okButtonProps={{ danger: true }}
                  onConfirm={() => handleDelete(record.id)}
                >
                  <Button type="link" size="large" danger icon={<DeleteOutlined />} title="Xóa" />
                </Popconfirm>
                */}
              </>
            )}
          </Space>
        );
      }
    },
  ];

  return (
    <>
      <ProTable<UserItem>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        rowKey="id"
        headerTitle="Danh sách người dùng"
        scroll={{ x: 1000 }}
        search={{ labelWidth: 'auto' }}
        request={async (params) => {
          try {
            const queryParams: any = {
              page: params.current || 1,
              limit: params.pageSize || 10,
            };

            if (params.name) queryParams.name = params.name;
            if (params.phone) queryParams.phone = params.phone;
            if (params.account) queryParams.account = params.account;
            if (params.role) queryParams.role = params.role;
            if (params.status) queryParams.status = params.status;

            const res = await request('GET', '', null, queryParams);
            return {
              data: res.data || [],
              success: true,
              total: res.meta?.total || 0,
            };
          } catch (e) {
            return { data: [], success: false, total: 0 };
          }
        }}
        pagination={{ pageSize: 10, showSizeChanger: true }}
        toolBarRender={() => [
          <Button key="create" type="primary" onClick={handleOpenCreate}>
            Tạo tài khoản
          </Button>,
        ]}
      />

      <ModalForm<UserFormValues>
        formRef={formRef}
        title={editingUser ? 'Sửa thông tin người dùng' : 'Tạo tài khoản người dùng'}
        open={open}
        initialValues={editingUser || {}}
        onOpenChange={(visible) => {
          if (!visible) resetModal();
        }}
        modalProps={{
          destroyOnClose: true,
          onCancel: resetModal,
        }}
        onFinish={async (values) => {
          try {
            const payload: any = {
              name: values.name,
              account: values.account,
              role: values.role,
              ...(values.phone && { phone: values.phone }),
              ...(values.status && { status: values.status }),
              ...(values.baseSalary !== undefined && { baseSalary: values.baseSalary }),
            };
            if (values.password) {
              payload.password = values.password;
            }

            if (editingUser) {
              await patch(editingUser.id, payload);
            } else {
              await create(payload);
            }

            resetModal();
            actionRef.current?.reload();
            return true;
          } catch (error) {
            return false;
          }
        }}
      >
        <ProFormText
          name="name"
          label="Họ tên"
          placeholder="Nhập họ tên"
          rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
        />

        <ProFormText
          name="account"
          label="Tên đăng nhập"
          placeholder="Nhập tên đăng nhập"
          rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
        />

        <ProFormText
          name="phone"
          label="Số điện thoại"
          placeholder="Nhập số điện thoại"
          rules={[{ required: false, message: 'Vui lòng nhập số điện thoại' }, { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ' }]}
        />

        <ProFormDigit
          name="baseSalary"
          label="Lương cơ bản"
          placeholder="Nhập lương cơ bản"
          fieldProps={{
            formatter: (value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
            parser: (value) => value ? (value.replace(/\$\s?|(,*)/g, '') as unknown as number) : ('' as unknown as number),
            addonAfter: 'VND'
          }}
        />

        {!editingUser && (
          <ProFormText.Password
            name="password"
            label="Mật khẩu"
            placeholder="Nhập mật khẩu"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
          />
        )}

        <ProFormSelect
          name="role"
          label="Vai trò"
          placeholder="Chọn vai trò"
          options={[
            { label: 'Giám đốc', value: Role.DIRECTOR },
            { label: 'Kế toán', value: Role.ACCOUNTANT },
            { label: 'Nhân viên', value: Role.STAFF },
            { label: 'Quản lý công trình', value: Role.SITE_MANAGER },
            { label: 'Khách hàng', value: Role.CUSTOMER }
          ]}
          rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
        />

        {editingUser && (
          <ProFormSelect
            name="status"
            label="Trạng thái"
            placeholder="Chọn trạng thái"
            options={[
              { label: 'Hoạt động', value: 'ACTIVE' },
              { label: 'Ngưng hoạt động', value: 'INACTIVE' },
            ]}
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
          />
        )}
      </ModalForm>
    </>
  );
};

export default UsersPage;