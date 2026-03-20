import React, { useRef } from 'react';
import { Button, Popconfirm, Space, Rate } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useReviewService } from '@/src/api/services';

interface ReviewItem {
  id: string;
  fullName: string;
  phone: string;
  description: string;
  rating: number;
  createdAt: string;
}

const ReviewManagementPage: React.FC = () => {
  const actionRef = useRef<ActionType>(null);
  const { request, remove } = useReviewService();

  const columns: ProColumns<ReviewItem>[] = [
    {
      title: 'Khách hàng',
      dataIndex: 'fullName',
      copyable: true,
      ellipsis: true,
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      copyable: true,
      width: 130,
    },
    {
      title: 'Số sao',
      dataIndex: 'rating',
      width: 150,
      search: false,
      render: (_, record) => <Rate disabled defaultValue={record.rating || 0} style={{ fontSize: 14 }} />,
    },
    {
      title: 'Nội dung đánh giá',
      dataIndex: 'description',
      ellipsis: true,
      search: false,
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
      width: 100,
      render: (_, record) => (
        <Space>
          <Popconfirm
            title="Xóa đánh giá này?"
            description="Hành động này không thể hoàn tác."
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
            onConfirm={async () => {
              try {
                await remove(record.id);
                actionRef.current?.reload();
              } catch (error) {
                // handled by hook
              }
            }}
          >
            <Button type="link" danger size="large" icon={<DeleteOutlined />} title="Xóa" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <ProTable<ReviewItem>
      headerTitle="Quản lý Đánh giá"
      actionRef={actionRef}
      rowKey="id"
      search={{ labelWidth: 'auto' }}
      request={async (params) => {
        try {
          const queryParams: any = {
            page: params.current || 1,
            limit: params.pageSize || 10,
          };
          if (params.fullName) queryParams.search = params.fullName;
          if (params.phone) queryParams.phone = params.phone;

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
      columns={columns}
      pagination={{ pageSize: 10, showSizeChanger: true }}
      scroll={{ x: 'max-content' }}
    />
  );
};

export default ReviewManagementPage;
