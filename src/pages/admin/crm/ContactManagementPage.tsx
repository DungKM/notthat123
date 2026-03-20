import React, { useRef } from 'react';
import { Button, Tag, Popconfirm, message, Space, Dropdown } from 'antd';
import { DeleteOutlined, DownOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useContactService } from '@/src/api/services';

interface ContactItem {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  message: string;
  status: string;
  createdAt: string;
}

const statusMap: Record<string, { text: string; color: string }> = {
  'Chờ xử lý': { text: 'Chờ xử lý', color: 'orange' },
  'Đã liên hệ': { text: 'Đã liên hệ', color: 'green' },
  'Đã hủy': { text: 'Đã hủy', color: 'red' },
};

const ContactManagementPage: React.FC = () => {
  const actionRef = useRef<ActionType>(null);
  const { request, remove } = useContactService();

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
      await remove(id);
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
      title: 'Địa chỉ',
      dataIndex: 'address',
      ellipsis: true,
      width: 150,
      search: false,
    },
    {
      title: 'Nội dung',
      dataIndex: 'message',
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
        'Chờ xử lý': { text: 'Chờ xử lý', status: 'Warning' },
        'Đã liên hệ': { text: 'Đã liên hệ', status: 'Success' },
        'Đã hủy': { text: 'Đã hủy', status: 'Error' },
      },
      render: (_, record) => {
        const st = statusMap[record.status] || statusMap['Chờ xử lý'];
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
          <Dropdown
            menu={{
              items: [
                { key: 'Chờ xử lý', label: 'Chờ xử lý', disabled: record.status === 'Chờ xử lý' },
                { key: 'Đã liên hệ', label: 'Đã liên hệ', disabled: record.status === 'Đã liên hệ' },
                { key: 'Đã hủy', label: 'Đã hủy', disabled: record.status === 'Đã hủy' },
              ],
              onClick: ({ key }) => handleUpdateStatus(record.id, key),
            }}
            trigger={['click']}
          >
            <Button type="link" size="small">
              Trạng thái <DownOutlined />
            </Button>
          </Dropdown>
          <Popconfirm
            title="Bạn chắc chắn muốn xóa liên hệ này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="link" size="large" danger icon={<DeleteOutlined />} title="Xóa" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <ProTable<ContactItem>
      columns={columns}
      actionRef={actionRef}
      rowKey="id"
      headerTitle="Quản lý khách hàng liên hệ"
      search={{ labelWidth: 'auto' }}
      pagination={{ pageSize: 10 }}
      request={async (params) => {
        try {
          const res = await request('GET', '', null, {
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
