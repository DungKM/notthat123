import React, { useRef, useState } from 'react';
import { Button, Tag, message } from 'antd';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ModalForm, ProFormSelect, ProFormText, ProTable } from '@ant-design/pro-components';

interface OrderItem {
  id: string;
  orderCode: string;
  customerName: string;
  phone: string;
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
}

const mockOrders: OrderItem[] = [
  {
    id: '1',
    orderCode: 'DH001',
    customerName: 'Nguyễn Văn A',
    phone: '0900000001',
    totalAmount: 15000000,
    status: 'PENDING',
  },
  {
    id: '2',
    orderCode: 'DH002',
    customerName: 'Trần Thị B',
    phone: '0900000002',
    totalAmount: 22000000,
    status: 'CONFIRMED',
  },
];

const OrderManagementPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [data, setData] = useState<OrderItem[]>(mockOrders);
  const [open, setOpen] = useState(false);

  const columns: ProColumns<OrderItem>[] = [
    { title: 'Mã đơn', dataIndex: 'orderCode' },
    { title: 'Khách hàng', dataIndex: 'customerName' },
    { title: 'SĐT', dataIndex: 'phone' },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      render: (_, record) => `${record.totalAmount.toLocaleString()} VNĐ`,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (_, record) => {
        const map = {
          PENDING: <Tag color="orange">Chờ xử lý</Tag>,
          CONFIRMED: <Tag color="blue">Đã xác nhận</Tag>,
          COMPLETED: <Tag color="green">Hoàn thành</Tag>,
          CANCELLED: <Tag color="red">Đã hủy</Tag>,
        };
        return map[record.status];
      },
    },
  ];

  return (
    <>
      <ProTable<OrderItem>
        columns={columns}
        actionRef={actionRef}
        rowKey="id"
        headerTitle="Quản lý đơn hàng"
        request={async () => ({ data, success: true })}
        toolBarRender={() => [
          <Button key="create" type="primary" onClick={() => setOpen(true)}>
            Tạo đơn hàng
          </Button>,
        ]}
      />

      <ModalForm
        title="Tạo đơn hàng"
        open={open}
        modalProps={{ destroyOnClose: true, onCancel: () => setOpen(false) }}
        onFinish={async (values) => {
          setData((prev) => [
            {
              id: Date.now().toString(),
              orderCode: values.orderCode,
              customerName: values.customerName,
              phone: values.phone,
              totalAmount: Number(values.totalAmount),
              status: values.status,
            },
            ...prev,
          ]);
          message.success('Tạo đơn hàng thành công');
          setOpen(false);
          actionRef.current?.reload();
          return true;
        }}
      >
        <ProFormText name="orderCode" label="Mã đơn hàng" rules={[{ required: true }]} />
        <ProFormText name="customerName" label="Tên khách hàng" rules={[{ required: true }]} />
        <ProFormText name="phone" label="Số điện thoại" rules={[{ required: true }]} />
        <ProFormText name="totalAmount" label="Tổng tiền" rules={[{ required: true }]} />
        <ProFormSelect
          name="status"
          label="Trạng thái"
          rules={[{ required: true }]}
          options={[
            { label: 'Chờ xử lý', value: 'PENDING' },
            { label: 'Đã xác nhận', value: 'CONFIRMED' },
            { label: 'Hoàn thành', value: 'COMPLETED' },
            { label: 'Đã hủy', value: 'CANCELLED' },
          ]}
        />
      </ModalForm>
    </>
  );
};

export default OrderManagementPage;