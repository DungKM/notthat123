import React, { useRef, useState } from 'react';
import { Button, Popconfirm, Space, Rate, message } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable, ModalForm, ProFormText, ProFormTextArea, ProForm } from '@ant-design/pro-components';
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

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingReview, setEditingReview] = useState<ReviewItem | null>(null);

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
      render: (_, record) => <Rate disabled value={record.rating || 0} style={{ fontSize: 14 }} />,
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
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="large"
            icon={<EditOutlined />}
            title="Sửa"
            onClick={() => {
              setEditingReview(record);
              setEditModalVisible(true);
            }}
          />
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
    <>
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

      <ModalForm<ReviewItem>
        title="Sửa Đánh Giá"
        open={editModalVisible}
        onOpenChange={setEditModalVisible}
        initialValues={editingReview || {}}
        modalProps={{ destroyOnClose: true }}
        onFinish={async (values) => {
          if (!editingReview) return false;
          try {
            await request('PATCH', `/${editingReview.id}`, values);
            message.success('Cập nhật đánh giá thành công');
            actionRef.current?.reload();
            return true;
          } catch (error) {
            message.error('Có lỗi xảy ra khi cập nhật đánh giá');
            return false;
          }
        }}
      >
        <ProFormText
          name="fullName"
          label="Tên khách hàng"
          rules={[{ required: true, message: 'Vui lòng nhập tên khách hàng' }]}
        />
        <ProFormText
          name="phone"
          label="Số điện thoại"
          rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
        />
        <ProForm.Item
          name="rating"
          label="Đánh giá (Số sao)"
          rules={[{ required: true, message: 'Vui lòng chọn số sao' }]}
        >
          <Rate />
        </ProForm.Item>
        <ProFormTextArea
          name="description"
          label="Nội dung"
          rules={[{ required: true, message: 'Vui lòng nhập nội dung đánh giá' }]}
        />
      </ModalForm>
    </>
  );
};

export default ReviewManagementPage;
