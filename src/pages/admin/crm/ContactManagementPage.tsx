import React, { useRef } from 'react';
import { Button, Tag, Popconfirm, message, Space } from 'antd';
import { DeleteOutlined, CheckCircleOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useContactService } from '@/src/api/services';

interface ContactItem {
  _id: string;
  fullName: string;
  phone: string;
  email: string;
  content: string;
  status: string;
  createdAt: string;
}

const statusMap: Record<string, { text: string; color: string }> = {
  pending: { text: 'Chưa xử lý', color: 'orange' },
  processed: { text: 'Đã xử lý', color: 'green' },
};

const ContactManagementPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const { request } = useContactService();

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await request('PATCH', `/${id}`, { status: newStatus });
      message.success('Cập nhật trạng thái liên hệ thành công');
      actionRef.current?.reload();
    } catch (err) {
      message.error('Cập nhật trạng thái thất bại');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await request('DELETE', `/${id}`);
      message.success('Xóa liên hệ thành công');
      actionRef.current?.reload();
    } catch (err) {
      message.error('Xóa liên hệ thất bại');
    }
  };

  const columns: ProColumns<ContactItem>[] = [
    {
      title: 'Họ tên',
      dataIndex: 'fullName',
      copyable: true,
      ellipsis: true,
      width: 150,
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      copyable: true,
      width: 120,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      copyable: true,
      width: 150,
    },
    {
      title: 'Nội dung',
      dataIndex: 'content',
      ellipsis: true,
      width: 200,
      search: false,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 120,
      filters: true,
      valueEnum: {
        pending: { text: 'Chưa xử lý', status: 'Warning' },
        processed: { text: 'Đã xử lý', status: 'Success' },
      },
      render: (_, record) => {
        const st = statusMap[record.status] || statusMap['pending'];
        return <Tag color={st.color}>{st.text}</Tag>;
      },
    },
    {
      title: 'Ngày gửi',
      dataIndex: 'createdAt',
      search: false,
      width: 150,
      render: (_, record) => new Date(record.createdAt).toLocaleString('vi-VN'),
    },
    {
      title: 'Thao tác',
      valueType: 'option',
      width: 150,
      render: (_, record) => (
        <Space>
          {record.status !== 'processed' && (
            <Popconfirm
              title="Đánh dấu đã tư vấn / xử lý liên hệ này?"
              onConfirm={() => handleUpdateStatus(record._id, 'processed')}
              okText="Xác nhận"
              cancelText="Hủy"
            >
              <Button type="link" icon={<CheckCircleOutlined />} title="Đánh dấu đã xử lý" />
            </Popconfirm>
          )}
          <Popconfirm
            title="Bạn chắc chắn muốn xóa liên hệ này?"
            onConfirm={() => handleDelete(record._id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="link" danger icon={<DeleteOutlined />} title="Xóa" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <ProTable<ContactItem>
      columns={columns}
      actionRef={actionRef}
      rowKey="_id"
      headerTitle="Quản lý khách hàng liên hệ"
      search={{ labelWidth: 'auto' }}
      pagination={{ pageSize: 10 }}
      request={async (params) => {
        try {
          const res = await request('GET', '/list', null, {
            page: params.current || 1,
            limit: params.pageSize || 10,
          });
          return {
            data: res?.data || [],
            total: res?.meta?.total || 0,
            success: true,
          };
        } catch (err) {
          message.error('Không thể tải danh sách liên hệ');
          return { data: [], total: 0, success: false };
        }
      }}
    />
  );
};

export default ContactManagementPage;
