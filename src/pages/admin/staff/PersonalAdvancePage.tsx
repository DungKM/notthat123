import React, { useState } from 'react';
import { 
  ProTable, 
  ProColumns, 
  ModalForm, 
  ProFormDigit, 
  ProFormTextArea, 
  ProFormUploadButton 
} from '@ant-design/pro-components';
import { AdvanceRequest, User } from '@/src/types';
import { MOCK_ADVANCE_REQUESTS } from '@/src/mockData';
import { Button, Tag, Space, Typography, message, Image } from 'antd';
import { PlusOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, FileImageOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { formatCurrency, formatDateTime } from '@/src/utils/format';

const { Text } = Typography;

interface PersonalAdvancePageProps {
  currentUser: User;
}

const PersonalAdvancePage: React.FC<PersonalAdvancePageProps> = ({ currentUser }) => {
  const [requests, setRequests] = useState<AdvanceRequest[]>(
    MOCK_ADVANCE_REQUESTS.filter(r => r.employeeId === currentUser.id) as AdvanceRequest[]
  );

  const columns: ProColumns<AdvanceRequest>[] = [
    {
      title: 'Ngày yêu cầu',
      dataIndex: 'requestDate',
      valueType: 'dateTime',
      hideInSearch: true,
      render: (val) => formatDateTime(String(val)),
      width: 180,
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      render: (val) => (
        <Text strong style={{ color: '#1890ff' }}>
          {formatCurrency(Number(val))}
        </Text>
      ),
      width: 150,
    },
    {
      title: 'Lý do',
      dataIndex: 'reason',
      ellipsis: true,
    },
    {
      title: 'Minh chứng',
      dataIndex: 'transferProof',
      hideInSearch: true,
      render: (val) => val ? (
        <Image src={String(val)} width={40} height={40} style={{ borderRadius: 4, objectFit: 'cover' }} />
      ) : '-',
      width: 100,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      valueEnum: {
        'Chờ duyệt': { text: 'Chờ duyệt', status: 'Processing' },
        'Đã duyệt': { text: 'Đã duyệt', status: 'Success' },
        'Từ chối': { text: 'Từ chối', status: 'Error' },
      },
      render: (_, record) => {
        const config = {
          'Chờ duyệt': { color: 'orange', icon: <ClockCircleOutlined /> },
          'Đã duyệt': { color: 'green', icon: <CheckCircleOutlined /> },
          'Từ chối': { color: 'red', icon: <CloseCircleOutlined /> },
        };
        const item = config[record.status];
        return (
          <Tag color={item.color} icon={item.icon}>
            {record.status}
          </Tag>
        );
      },
      width: 120,
    },
    {
      title: 'Phản hồi/Ghi chú',
      dataIndex: 'note',
      ellipsis: true,
    }
  ];

  const handleCreateRequest = async (values: any) => {
    const newRequest: AdvanceRequest = {
      id: Math.random().toString(36).substr(2, 9),
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      amount: Number(values.amount),
      reason: values.reason,
      requestDate: dayjs().toISOString(),
      status: 'Chờ duyệt' as const,
      // Giả lập preview ảnh
      transferProof: values.image?.[0]?.thumbUrl || values.image?.[0]?.url,
    };

    setRequests([newRequest, ...requests]);
    message.success('Gửi yêu cầu ứng tiền thành công!');
    return true;
  };

  return (
    <div style={{ padding: '0 0 24px 0' }}>
      <ProTable<AdvanceRequest>
        headerTitle="Lịch sử ứng tiền cá nhân"
        columns={columns}
        dataSource={requests}
        rowKey="id"
        search={false}
        pagination={{ pageSize: 10 }}
        toolBarRender={() => [
          <ModalForm
            key="add"
            title="Tạo yêu cầu ứng tiền mới"
            trigger={
              <Button type="primary" icon={<PlusOutlined />}>
                Tạo yêu cầu
              </Button>
            }
            onFinish={handleCreateRequest}
            width={500}
            modalProps={{
              destroyOnClose: true,
            }}
          >
            <ProFormDigit
              label="Số tiền muốn ứng"
              name="amount"
              min={0}
              fieldProps={{
                formatter: (value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
                parser: (value) => value!.replace(/\$\s?|(,*)/g, ''),
                addonAfter: 'đ',
                style: { width: '100%' },
              }}
              rules={[{ required: true, message: 'Vui lòng nhập số tiền' }]}
            />
            <ProFormTextArea
              label="Lý do ứng tiền"
              name="reason"
              placeholder="Ví dụ: Ứng tiền mua vật tư gấp, ứng lương đợt 1..."
              rules={[{ required: true, message: 'Vui lòng nhập lý do' }]}
            />
            <ProFormUploadButton
              label="Hình ảnh minh chứng (nếu có)"
              name="image"
              max={1}
              fieldProps={{
                listType: 'picture-card',
                accept: 'image/*',
              }}
              icon={<FileImageOutlined />}
            />
          </ModalForm>
        ]}
      />
    </div>
  );
};

export default PersonalAdvancePage;
