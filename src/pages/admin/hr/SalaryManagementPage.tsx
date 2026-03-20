import React, { useState } from 'react';
import {
  ProTable,
  ProColumns,
  EditableProTable,
} from '@ant-design/pro-components';
import { Employee, Role } from '@/src/types';
import { MOCK_EMPLOYEES } from '@/src/mockData';
import { Card, Tag, message, Popconfirm, Button } from 'antd';
import { DollarOutlined, EditOutlined } from '@ant-design/icons';
import { useAuth } from '@/src/auth/hooks/useAuth';

const SalaryManagementPage: React.FC = () => {
  const { user } = useAuth();
  const [dataSource, setDataSource] = useState<Employee[]>(MOCK_EMPLOYEES);

  if (!user || (user.role !== Role.DIRECTOR && user.role !== Role.ACCOUNTANT)) {
    return <div>Bạn không có quyền truy cập trang này.</div>;
  }

  const handleDelete = (id: string) => {
    setDataSource(dataSource.filter((item) => item.id !== id));
    message.success('Đã xóa nhân viên');
  };

  const columns: ProColumns<Employee>[] = [
    {
      title: 'Tên nhân viên',
      dataIndex: 'name',
      editable: false,
    },
    {
      title: 'Lương cơ bản',
      dataIndex: 'baseSalary',
      valueType: 'digit',
      fieldProps: {
        formatter: (value: any) =>
          new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
          }).format(Number(value || 0)),
      },
      render: (_, record) => (
        <span style={{ fontWeight: 700, color: '#1890ff' }}>
          {new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
          }).format(Number(record.baseSalary || 0))}
        </span>
      ),
    },
    {
      title: 'Thưởng',
      dataIndex: 'bonus',
      valueType: 'digit',
      render: (_, record) => (
        <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(record.bonus)}</span>
      )
    },
    {
      title: 'Phạt',
      dataIndex: 'penalty',
      valueType: 'digit',
      render: (_, record) => (
        <span style={{ color: 'red' }}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(record.penalty)}</span>
      )
    },
    {
      title: 'Hành động',
      valueType: 'option',
      width: 200,
      render: (text, record, _, action) => {
        const isSelf = String(record.id) === String(user.id);
        return [
          <Button
            type="link"
            size="large"
            key="editable"
            icon={<EditOutlined />}
            onClick={() => {
              action?.startEditable?.(record.id);
            }}
          >
            Sửa
          </Button>,
          <Popconfirm
            key="delete"
            title="Bạn có chắc chắn muốn xóa tài khoản này không?"
            disabled={isSelf}
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button type="link" size="large" danger disabled={isSelf}>
              Xóa
            </Button>
          </Popconfirm>
        ];
      },
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <EditableProTable<Employee>
        headerTitle="Quản lý Lương Cơ Bản Nhân Viên"
        rowKey="id"
        scroll={{
          x: 'max-content',
        }}
        recordCreatorProps={false}
        loading={false}
        columns={columns}
        request={async () => ({
          data: dataSource,
          total: dataSource.length,
          success: true,
        })}
        value={dataSource}
        onChange={(value) => setDataSource(value as Employee[])}
        editable={{
          type: 'multiple',
          onSave: async (_rowKey, data, _row) => {
            setDataSource((prev) => prev.map((e) => (e.id === data.id ? { ...e, ...data } : e)));
            message.success('Cập nhật lương thành công');
          },
        }}
      />
    </div>
  );
};

export default SalaryManagementPage;
