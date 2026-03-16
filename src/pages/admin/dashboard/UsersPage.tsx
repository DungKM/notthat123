import React, { useRef, useState } from 'react';
import { Button, Tag, message, Popconfirm, Space } from 'antd';
import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import {
  ModalForm,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProTable,
} from '@ant-design/pro-components';
import { Role } from '@/src/auth/types';
import { useAuth } from '@/src/auth/hooks/useAuth';

interface UserItem {
  id: string;
  fullName: string;
  username: string;
  baseSalary: number;
  phone: string;
  role: Role;
  status: 'ACTIVE' | 'INACTIVE';
}

const initialUsers: UserItem[] = [
  {
    id: '1',
    fullName: 'Nguyễn Giám Đốc',
    username: 'giamdoc',
    baseSalary: 500000,
    phone: '0900000001',
    role: Role.DIRECTOR,
    status: 'ACTIVE',
  },
  {
    id: '2',
    fullName: 'Trần Kế Toán',
    username: 'ketoan',
    baseSalary: 600000,
    phone: '0900000002',
    role: Role.ACCOUNTANT,
    status: 'ACTIVE',
  },
  {
    id: '4',
    fullName: 'Phạm Nhân Viên',
    username: 'nhanvien',
    baseSalary: 500000,
    phone: '0900000004',
    role: Role.STAFF,
    status: 'ACTIVE',
  },
];

const roleLabels: Record<Role, string> = {
  [Role.DIRECTOR]: 'Giám đốc',
  [Role.ACCOUNTANT]: 'Kế toán',
  [Role.STAFF]: 'Nhân viên',
  [Role.SITE_MANAGER]: 'Quản lý công trình',
};

type UserFormValues = {
  fullName: string;
  username: string;
  baseSalary: number;
  phone: string;
  password?: string;
  role: Role;
};

const UsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const actionRef = useRef<ActionType>(null);
  const formRef = useRef<ProFormInstance<UserFormValues>>();
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);

  const resetModal = () => {
    setOpen(false);
    setEditingUser(null);
    formRef.current?.resetFields();
  };

  const handleOpenCreate = () => {
    setEditingUser(null);
    setOpen(true);
  };

  const handleOpenEdit = (user: UserItem) => {
    setEditingUser(user);
    setOpen(true);
  };

  const handleToggleStatus = (id: string) => {
    if (id === currentUser?.id) {
      message.error('Bạn không thể tự khóa tài khoản của chính mình!');
      return;
    }
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, status: u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }
          : u
      )
    );
    message.success('Cập nhật trạng thái thành công');
  };

  const columns: ProColumns<UserItem>[] = [
    {
      title: 'Họ tên',
      dataIndex: 'fullName',
      width: 180,
    },
    {
      title: 'Tên đăng nhập',
      dataIndex: 'username',
      width: 140,
    },
    {
      title: 'Lương cơ bản',
      dataIndex: 'baseSalary',
      width: 180,
      render: (_, record) => {
        const salary = Number(record.baseSalary ?? 0);
        return `${salary.toLocaleString('vi-VN')} VNĐ`;
      },
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      width: 140,
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      width: 160,
      render: (_, record) => <Tag>{roleLabels[record.role]}</Tag>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 130,
      render: (_, record) =>
        record.status === 'ACTIVE' ? (
          <Tag color="green">Hoạt động</Tag>
        ) : (
          <Tag color="red">Ngưng hoạt động</Tag>
        ),
    },
    {
      title: 'Thao tác',
      valueType: 'option',
      width: 260,
    
      render: (_, record) => {
  const isSelf = record.id === currentUser?.id;

  // kế toán không được thao tác với giám đốc
  const isAccountantEditDirector =
    currentUser?.role === Role.ACCOUNTANT && record.role === Role.DIRECTOR;

  const disabled = isSelf || isAccountantEditDirector;

  return (
    <Space>
      {!isAccountantEditDirector && (
        <a onClick={() => handleOpenEdit(record)}>Sửa</a>
      )}

      {!disabled && (
        <a
          onClick={() => handleToggleStatus(record.id)}
          style={{ cursor: 'pointer' }}
        >
          {record.status === 'ACTIVE'
            ? 'Đóng băng tài khoản'
            : 'Mở khóa'}
        </a>
      )}
         {/* {!isSelf && (
              <Popconfirm
                title="Bạn có chắc chắn muốn xóa tài khoản này không?"
                onConfirm={() => handleDelete(record.id)}
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
              >
                <a style={{ color: '#ff4d4f' }}>Xóa</a>
              </Popconfirm>
            )} */}
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
        search={{ labelWidth: 100 }}
        dataSource={users}
        toolBarRender={() => [
          <Button key="create" type="primary" onClick={handleOpenCreate}>
            Tạo tài khoản
          </Button>,
        ]}
      />

      <ModalForm<UserFormValues>
        key={editingUser?.id || 'create'}
        formRef={formRef}
        title={editingUser ? 'Sửa thông tin người dùng' : 'Tạo tài khoản người dùng'}
        open={open}
        initialValues={
          editingUser
            ? {
              fullName: editingUser.fullName,
              username: editingUser.username,
              baseSalary: editingUser.baseSalary,
              phone: editingUser.phone,
              role: editingUser.role,
              password: '',
            }
            : {
              fullName: '',
              username: '',
              baseSalary: 0,
              phone: '',
              password: '',
              role: undefined,
            }
        }
        modalProps={{
          destroyOnClose: true,
          onCancel: resetModal,
        }}
        onFinish={async (values) => {
          if (editingUser) {
            setUsers((prev) =>
              prev.map((u) =>
                u.id === editingUser.id
                  ? {
                    ...u,
                    fullName: values.fullName,
                    username: values.username,
                    baseSalary: Number(values.baseSalary || 0),
                    phone: values.phone,
                    role: values.role,
                  }
                  : u
              )
            );

            message.success('Cập nhật tài khoản thành công');
          } else {
            const newUser: UserItem = {
              id: Date.now().toString(),
              fullName: values.fullName,
              username: values.username,
              baseSalary: Number(values.baseSalary || 0),
              phone: values.phone,
              role: values.role,
              status: 'ACTIVE',
            };

            setUsers((prev) => [newUser, ...prev]);
            message.success('Tạo tài khoản thành công');
          }

          resetModal();
          return true;
        }}
      >
        <ProFormText
          name="fullName"
          label="Họ tên"
          placeholder="Nhập họ tên"
          rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
        />

        <ProFormText
          name="username"
          label="Tên đăng nhập"
          placeholder="Nhập tên đăng nhập"
          rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
        />

        <ProFormDigit
          name="baseSalary"
          label="Lương cơ bản"
          placeholder="Nhập lương cơ bản"
          min={0}
          fieldProps={{
            style: { width: '100%' },
            formatter: (value) =>
              value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '',
            parser: (value) => (value ? Number(value.replace(/\./g, '')) : 0),
          }}
          rules={[{ required: true, message: 'Vui lòng nhập lương cơ bản' }]}
        />

        <ProFormText
          name="phone"
          label="Số điện thoại"
          placeholder="Nhập số điện thoại"
          rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
        />

        <ProFormText.Password
          name="password"
          label="Mật khẩu"
          placeholder={editingUser ? 'Để trống nếu không đổi mật khẩu' : 'Nhập mật khẩu'}
          rules={
            editingUser
              ? []
              : [{ required: true, message: 'Vui lòng nhập mật khẩu' }]
          }
        />

        <ProFormSelect
          name="role"
          label="Vai trò"
          placeholder="Chọn vai trò"
          options={[
            { label: 'Giám đốc', value: Role.DIRECTOR },
            { label: 'Kế toán', value: Role.ACCOUNTANT },
            { label: 'Nhân viên', value: Role.STAFF },
            { label: 'Quản lý công trình', value: Role.SITE_MANAGER },
          ]}
          rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
        />
      </ModalForm>
    </>
  );
};

export default UsersPage;