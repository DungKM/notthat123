import React, { useRef, useState } from 'react';
import { Button, Tag, message } from 'antd';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ModalForm, ProFormSelect, ProFormText, ProTable } from '@ant-design/pro-components';

interface ProductItem {
  id: string;
  name: string;
  category: string;
  price: number;
  status: 'ACTIVE' | 'INACTIVE';
}

const mockProducts: ProductItem[] = [
  { id: '1', name: 'Hồ sơ điện tử A', category: 'Phần mềm', price: 12000000, status: 'ACTIVE' },
  { id: '2', name: 'Dịch vụ lưu trữ B', category: 'Dịch vụ', price: 8000000, status: 'ACTIVE' },
];

const ProductManagementPage: React.FC = () => {
  const actionRef = useRef<ActionType | undefined>(undefined);
  const [data, setData] = useState<ProductItem[]>(mockProducts);
  const [open, setOpen] = useState(false);

  const columns: ProColumns<ProductItem>[] = [
    { title: 'Tên sản phẩm', dataIndex: 'name' },
    { title: 'Danh mục', dataIndex: 'category' },
    {
      title: 'Giá',
      dataIndex: 'price',
      render: (_, record) => `${record.price.toLocaleString()} VNĐ`,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (_, record) =>
        record.status === 'ACTIVE' ? <Tag color="green">Đang bán</Tag> : <Tag color="red">Ngưng bán</Tag>,
    },
  ];

  return (
    <>
      <ProTable<ProductItem>
        columns={columns}
        actionRef={actionRef}
        rowKey="id"
        headerTitle="Quản lý sản phẩm"
        request={async () => ({ data, success: true })}
        toolBarRender={() => [
          <Button key="create" type="primary" onClick={() => setOpen(true)}>
            Thêm sản phẩm
          </Button>,
        ]}
      />

      <ModalForm
        title="Thêm sản phẩm"
        open={open}
        modalProps={{ destroyOnClose: true, onCancel: () => setOpen(false) }}
        onFinish={async (values) => {
          setData((prev) => [
            {
              id: Date.now().toString(),
              name: values.name,
              category: values.category,
              price: Number(values.price),
              status: values.status,
            },
            ...prev,
          ]);
          message.success('Thêm sản phẩm thành công');
          setOpen(false);
          actionRef.current?.reload();
          return true;
        }}
      >
        <ProFormText name="name" label="Tên sản phẩm" rules={[{ required: true }]} />
        <ProFormText name="category" label="Danh mục" rules={[{ required: true }]} />
        <ProFormText name="price" label="Giá sản phẩm" rules={[{ required: true }]} />
        <ProFormSelect
          name="status"
          label="Trạng thái"
          rules={[{ required: true }]}
          options={[
            { label: 'Đang bán', value: 'ACTIVE' },
            { label: 'Ngưng bán', value: 'INACTIVE' },
          ]}
        />
      </ModalForm>
    </>
  );
};

export default ProductManagementPage;