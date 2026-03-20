import React, { useRef } from 'react';
import { Select, Tag, message, Typography, Space, Dropdown, Button, Popconfirm } from 'antd';
import { DeleteOutlined, DownOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useApplicationService } from '@/src/api/services';

interface ApplicationItem {
  _id: string;
  id: string;
  position: string;
  fullName: string;
  phone: string;
  gender: string;
  address: string;
  age: number;
  experience: number;
  note: string;
  status: string;
  createdAt: string;
}

const STATUS_OPTIONS = [
  { label: 'Chờ xử lý', value: 'Chờ xử lý', color: 'default' },
  { label: 'Đã liên hệ', value: 'Đã liên hệ', color: 'processing' },
  { label: 'Từ chối', value: 'Từ chối', color: 'error' },
];

const RecruitmentManagementPage: React.FC = () => {
  const actionRef = useRef<ActionType>(null);
  const { request, update, remove } = useApplicationService();

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await request('PATCH', `/${id}`, { status: newStatus });
      message.success('Cập nhật trạng thái thành công');
      actionRef.current?.reload();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await remove(id);
      message.success('Xóa hồ sơ thành công');
      actionRef.current?.reload();
    } catch (error) {
      console.error(error);
    }
  };

  const columns: ProColumns<ApplicationItem>[] = [
    {
      title: 'Thời gian nộp',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      sorter: true,
      width: 150,
    },
    {
      title: 'Vị trí ứng tuyển',
      dataIndex: 'position',
      width: 150,
    },
    {
      title: 'Họ và tên',
      dataIndex: 'fullName',
      copyable: true,
      width: 150,
      render: (_, record) => (
        <div>
          <div className="font-semibold">{record.fullName}</div>
          <div className="text-xs text-gray-500">{record.gender} • {record.age} tuổi</div>
        </div>
      ),
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      copyable: true,
      width: 120,
    },
    {
      title: 'Kinh nghiệm',
      dataIndex: 'experience',
      width: 120,
      renderText: (val) => `${val} năm`,
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      ellipsis: true,
      width: 200,
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      ellipsis: true,
      width: 200,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 160,
      filters: true,
      onFilter: true,
      valueEnum: STATUS_OPTIONS.reduce((acc, curr) => {
        acc[curr.value] = { text: curr.label, status: curr.color };
        return acc;
      }, {} as any),
      render: (_, record) => {
        const option = STATUS_OPTIONS.find((opt) => opt.value === record.status);
        if (!option) return <Tag color="default">{record.status}</Tag>;
        return <Tag color={option.color}>{option.label}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      valueType: 'option',
      width: 150,
      render: (_, record) => (
        <Space>
          <Dropdown
            menu={{
              items: STATUS_OPTIONS.map((opt) => ({
                key: opt.value,
                label: opt.label,
                disabled: record.status === opt.value,
              })),
              onClick: ({ key }) => handleStatusChange(record._id || record.id, key),
            }}
            trigger={['click']}
          >
            <Button type="link" size="small">
              Trạng thái <DownOutlined />
            </Button>
          </Dropdown>
          <Popconfirm
            title="Bạn chắc chắn muốn xóa hồ sơ này?"
            onConfirm={() => handleDelete(record._id || record.id)}
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
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="mb-6">
        <Typography.Title level={4} style={{ margin: 0 }}>
          Quản lý Hồ sơ ứng tuyển
        </Typography.Title>
        <Typography.Text type="secondary">
          Theo dõi và cập nhật trạng thái các ứng viên ứng tuyển từ Website
        </Typography.Text>
      </div>

      <ProTable<ApplicationItem>
        columns={columns}
        actionRef={actionRef}
        rowKey={(record) => record._id || record.id}
        search={false} // API /applications doesn't support complex search by default unless implemented, turning off for simplicity
        scroll={{ x: 'max-content' }}
        request={async (params) => {
          try {
            const apiParams = {
              page: params.current || 1,
              limit: params.pageSize || 10,
            };
            const response = await request('GET', '', null, apiParams);
            
            return {
              data: response.data || [],
              success: true,
              total: response.meta?.total || 0,
            };
          } catch (error) {
            console.error(error);
            return {
              data: [],
              success: false,
              total: 0,
            };
          }
        }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
        }}
        dateFormatter="string"
        headerTitle="Danh sách ứng viên"
      />
    </div>
  );
};

export default RecruitmentManagementPage;