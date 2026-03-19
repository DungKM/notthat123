import React, { useRef, useState } from 'react';
import { Button, Tag, message } from 'antd';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ModalForm, ProFormText, ProTable } from '@ant-design/pro-components';
import { useAuth } from '@/src/auth/hooks/useAuth';

interface CategoryItem {
  id: string;
  name: string;
  description: string;
  status: 'ACTIVE' | 'INACTIVE';
}

const mockCategories: CategoryItem[] = [
  { id: '1', name: 'Phần mềm', description: 'Nhóm sản phẩm phần mềm', status: 'ACTIVE' },
  { id: '2', name: 'Dịch vụ', description: 'Nhóm dịch vụ triển khai', status: 'ACTIVE' },
];

const CategoryManagementPage: React.FC = () => {
  const { user } = useAuth();
  const actionRef = useRef<ActionType | undefined>(undefined);
  const [data, setData] = useState<CategoryItem[]>(mockCategories);
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const columns: ProColumns<CategoryItem>[] = [
    { title: 'Tên danh mục', dataIndex: 'name' },
    { title: 'Mô tả', dataIndex: 'description' },
    {
      title: 'Trạng thái',
      render: (_, record) =>
        record.status === 'ACTIVE' ? <Tag color="green">Hoạt động</Tag> : <Tag color="red">Ngưng</Tag>,
    },
  ];

  return (
    <>
      <ProTable<CategoryItem>
        columns={columns}
        actionRef={actionRef}
        rowKey="id"
        headerTitle="Quản lý danh mục"
        request={async () => ({ data, success: true })}
        toolBarRender={() => [
          <Button key="create" type="primary" onClick={() => setOpen(true)}>
            Thêm danh mục
          </Button>,
        ]}
      />

      <ModalForm
        title="Thêm danh mục"
        open={open}
        modalProps={{ destroyOnClose: true, onCancel: () => setOpen(false) }}
        onFinish={async (values) => {
          setData((prev) => [
            {
              id: Date.now().toString(),
              name: values.name,
              description: values.description,
              status: 'ACTIVE',
            },
            ...prev,
          ]);
          message.success('Thêm danh mục thành công');
          setOpen(false);
          actionRef.current?.reload();
          return true;
        }}
      >
        <ProFormText name="name" label="Tên danh mục" rules={[{ required: true }]} />
        <ProFormText name="description" label="Mô tả danh mục" rules={[{ required: true }]} />
      </ModalForm>
    </>
  );
};

export default CategoryManagementPage;