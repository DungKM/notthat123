import React, { useState } from 'react';
import { ProTable, ProColumns, ModalForm, ProFormTextArea, ProFormUploadButton as RawProFormUploadButton } from '@ant-design/pro-components';

// Workaround: ProFormUploadButton bị export sai type
const SafeUploadButton = RawProFormUploadButton as unknown as React.FC<any>;
import { User, AdvanceRequest } from '@/src/types';
import { MOCK_ADVANCE_REQUESTS } from '@/src/mockData';
import { Tag, Button, Space, Typography, Badge, message, Descriptions } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, FileImageOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { formatCurrency, formatDateTime } from '@/src/utils/format';

const { Text } = Typography;

interface AdvanceApprovalProps {
  currentUser: User;
}

const AdvanceApprovalPage: React.FC<AdvanceApprovalProps> = ({ currentUser }) => {
  const [advanceRequests, setAdvanceRequests] = useState<AdvanceRequest[]>(MOCK_ADVANCE_REQUESTS as AdvanceRequest[]);
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<AdvanceRequest | null>(null);

  const advanceColumns: ProColumns<AdvanceRequest>[] = [
    {
      title: 'Nhân viên',
      dataIndex: 'employeeName',
      width: 150,
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      valueType: 'money',
      hideInSearch: true,
      render: (val) => (
        <Text strong style={{ fontSize: 14 }}>
          {formatCurrency(Number(val))}
        </Text>
      ),
    },
    {
      title: 'Lý do',
      dataIndex: 'reason',
      ellipsis: true,
      width: 200,
    },
    {
      title: 'Ngày yêu cầu',
      dataIndex: 'requestDate',
      valueType: 'dateTime',
      hideInSearch: true,
      render: (val) => formatDateTime(String(val)),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      valueType: 'select',
      valueEnum: {
        'Chờ duyệt': { text: 'Chờ duyệt', status: 'Processing' },
        'Đã duyệt': { text: 'Đã duyệt', status: 'Success' },
        'Từ chối': { text: 'Từ chối', status: 'Error' },
      },
      render: (_, record) => {
        const statusConfig = {
          'Chờ duyệt': { color: 'orange', icon: <ClockCircleOutlined /> },
          'Đã duyệt': { color: 'green', icon: <CheckCircleOutlined /> },
          'Từ chối': { color: 'red', icon: <CloseCircleOutlined /> },
        };
        const config = statusConfig[record.status as keyof typeof statusConfig];
        return (
          <Tag color={config.color} icon={config.icon}>
            {record.status}
          </Tag>
        );
      },
    },
    {
      title: 'Thao tác',
      valueType: 'option',
      width: 150,
      render: (_, record) => {
        if (record.status === 'Chờ duyệt') {
          return [
            <Button
              key="approve"
              type="primary"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => {
                setSelectedRequest(record);
                setApproveModalVisible(true);
              }}
            >
              Duyệt
            </Button>,
            <Button
              key="reject"
              danger
              size="small"
              icon={<CloseCircleOutlined />}
              onClick={() => handleReject(record.id)}
            >
              Từ chối
            </Button>,
          ];
        }
        return [
          // <Button key="view" size="small" onClick={() => viewRequestDetail(record)}>
          //   Chi tiết
          // </Button>,
        ];
      },
    },
  ];

  const handleApprove = async (values: any) => {
    if (!selectedRequest) return false;

    const updatedRequests = advanceRequests.map((req) =>
      req.id === selectedRequest.id
        ? {
            ...req,
            status: 'Đã duyệt' as const,
            approvedBy: currentUser.name,
            approvedDate: dayjs().toISOString(),
            transferProof: values.transferProof?.[0]?.url || values.transferProof?.[0]?.response?.url,
            note: values.note,
          }
        : req
    );

    setAdvanceRequests(updatedRequests);
    message.success('Đã duyệt yêu cầu ứng tiền!');
    setApproveModalVisible(false);
    setSelectedRequest(null);
    return true;
  };

  const handleReject = (id: string) => {
    const updatedRequests = advanceRequests.map((req) =>
      req.id === id
        ? {
            ...req,
            status: 'Từ chối' as const,
            approvedBy: currentUser.name,
            approvedDate: dayjs().toISOString(),
            note: 'Yêu cầu không được chấp nhận',
          }
        : req
    );
    setAdvanceRequests(updatedRequests);
    message.info('Đã từ chối yêu cầu');
  };

  const viewRequestDetail = (record: AdvanceRequest) => {
    message.info(`Chi tiết yêu cầu: ${record.employeeName} - ${formatCurrency(record.amount)}`);
  };

  const pendingCount = advanceRequests.filter(r => r.status === 'Chờ duyệt').length;

  return (
    <div>
      <ProTable<AdvanceRequest>
        headerTitle={
          <Space>
            <span>Danh sách yêu cầu ứng tiền</span>
            {pendingCount > 0 && (
              <Badge count={pendingCount} style={{ backgroundColor: '#ff4d4f' }} />
            )}
          </Space>
        }
        columns={advanceColumns}
        dataSource={advanceRequests}
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1200 }}
      />

      <ModalForm
        title={`Phê duyệt ứng tiền - ${selectedRequest?.employeeName}`}
        open={approveModalVisible}
        onOpenChange={setApproveModalVisible}
        onFinish={handleApprove}
        width={600}
      >
        {selectedRequest && (
          <Descriptions column={1} bordered style={{ marginBottom: 16 }}>
            <Descriptions.Item label="Nhân viên">{selectedRequest.employeeName}</Descriptions.Item>
            <Descriptions.Item label="Số tiền">
              <Text strong style={{ fontSize: 16, color: '#1890ff' }}>
                {formatCurrency(selectedRequest.amount)}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Lý do">{selectedRequest.reason}</Descriptions.Item>
            <Descriptions.Item label="Ngày yêu cầu">
              {formatDateTime(selectedRequest.requestDate)}
            </Descriptions.Item>
          </Descriptions>
        )}

        <SafeUploadButton
          name="transferProof"
          label="Tải lên chứng từ chuyển khoản"
          title="Tải ảnh"
          icon={<FileImageOutlined />}
          max={1}
          fieldProps={{
            listType: 'picture-card',
            accept: 'image/*',
          }}
          extra="Hỗ trợ: JPG, PNG. Tối đa 5MB"
        />

        <ProFormTextArea
          name="note"
          label="Ghi chú"
          placeholder="Nhập ghi chú (không bắt buộc)"
          fieldProps={{
            rows: 3,
          }}
        />
      </ModalForm>
    </div>
  );
};

export default AdvanceApprovalPage;
