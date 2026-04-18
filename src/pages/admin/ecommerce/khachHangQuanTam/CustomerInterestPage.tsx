import React, { useRef } from 'react';
import { ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { Tag, Space, Button, Tooltip, message } from 'antd';
import { CheckOutlined, CheckCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

interface CustomerInterest {
  id: string;
  name: string;
  phone: string;
  email: string;
  type: 'Sản phẩm' | 'Kiến trúc' | 'Nội thất';
  targetName: string;
  createdAt: string;
  status: 'Chưa liên hệ' | 'Đã liên hệ';
}

const mockData: CustomerInterest[] = [
  {
    id: '1',
    name: 'Nguyễn Văn A',
    phone: '0901234567',
    email: 'nguyenvana@example.com',
    type: 'Sản phẩm',
    targetName: 'Sofa Da Cao Cấp Ý',
    createdAt: dayjs().subtract(2, 'hour').toISOString(),
    status: 'Chưa liên hệ',
  },
  {
    id: '2',
    name: 'Trần Thị B',
    phone: '0987654321',
    email: 'tranthib@example.com',
    type: 'Kiến trúc',
    targetName: 'Biệt Thự Vườn Tân Cổ Điển',
    createdAt: dayjs().subtract(1, 'day').toISOString(),
    status: 'Đã liên hệ',
  },
  {
    id: '3',
    name: 'Lê Văn C',
    phone: '0912345678',
    email: '',
    type: 'Nội thất',
    targetName: 'Penthouse Landmark 81',
    createdAt: dayjs().subtract(3, 'day').toISOString(),
    status: 'Chưa liên hệ',
  },
  {
    id: '4',
    name: 'Phạm Thị D',
    phone: '0934567890',
    email: 'phamthid@example.com',
    type: 'Sản phẩm',
    targetName: 'Bàn Ăn Gỗ Sồi Nguyên Khối',
    createdAt: dayjs().subtract(5, 'hour').toISOString(),
    status: 'Chưa liên hệ',
  },
];

const typeColors: Record<string, string> = {
  'Sản phẩm': 'blue',
  'Kiến trúc': 'magenta',
  'Nội thất': 'cyan',
};

const CustomerInterestPage: React.FC = () => {
  const actionRef = useRef<ActionType>();

  const columns: ProColumns<CustomerInterest>[] = [
    {
      title: 'Tên khách hàng',
      dataIndex: 'name',
      render: (dom) => <strong>{dom}</strong>,
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      copyable: true,
    },
    {
      title: 'Email',
      dataIndex: 'email',
    },
    {
      title: 'Loại quan tâm',
      dataIndex: 'type',
      filters: true,
      onFilter: true,
      valueEnum: {
        'Sản phẩm': { text: 'Sản phẩm' },
        'Kiến trúc': { text: 'Kiến trúc' },
        'Nội thất': { text: 'Nội thất' },
      },
      render: (_, record) => (
        <Tag color={typeColors[record.type]}>{record.type}</Tag>
      ),
    },
    {
      title: 'Tên (Sản phẩm/Bài viết)',
      dataIndex: 'targetName',
      ellipsis: true,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      filters: true,
      onFilter: true,
      valueEnum: {
        'Chưa liên hệ': { text: 'Chưa liên hệ', status: 'Error' },
        'Đã liên hệ': { text: 'Đã liên hệ', status: 'Success' },
      },
      render: (_, record) => (
        <Tag color={record.status === 'Chưa liên hệ' ? 'error' : 'success'}>
          {record.status}
        </Tag>
      ),
    },
    {
      title: 'Ngày gửi',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
    },
    {
      title: 'Thao tác',
      valueType: 'option',
      key: 'option',
      width: 100,
      align: 'center',
      render: (text, record, _, action) => [
        <Tooltip 
          key="contact" 
          title={record.status === 'Chưa liên hệ' ? 'Đánh dấu đã liên hệ' : 'Đã xử lý xong'}
        >
          <Button
            type="text"
            icon={record.status === 'Chưa liên hệ' ? <CheckOutlined /> : <CheckCircleOutlined />}
            style={{ color: record.status === 'Chưa liên hệ' ? '#1890ff' : '#52c41a' }}
            onClick={() => {
              if (record.status === 'Chưa liên hệ') {
                message.success(`Đã cập nhật trạng thái liên hệ cho ${record.name}`);
              } else {
                message.info('Khách hàng này đã được liên hệ!');
              }
            }}
          />
        </Tooltip>
      ],
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <ProTable<CustomerInterest>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={async (params, sort, filter) => {
          // Fake delay to simulate network request
          await new Promise((resolve) => setTimeout(resolve, 500));
          
          let data = [...mockData];
          
          if (params.name) {
            data = data.filter(item => item.name.toLowerCase().includes((params.name as string).toLowerCase()));
          }
          if (params.phone) {
            data = data.filter(item => item.phone.includes(params.phone as string));
          }
          if (filter.type) {
            data = data.filter(item => filter.type?.includes(item.type));
          }
          if (filter.status) {
            data = data.filter(item => filter.status?.includes(item.status));
          }
          
          return {
            data: data,
            success: true,
            total: data.length,
          };
        }}
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
        options={{
          setting: {
            listsHeight: 400,
          },
        }}
        pagination={{
          pageSize: 10,
        }}
        dateFormatter="string"
        headerTitle="Danh sách Khách hàng quan tâm"
      />
    </div>
  );
};

export default CustomerInterestPage;
