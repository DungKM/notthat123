import React, { useState, useRef } from 'react';
import { ProTable, ProColumns, ModalForm, ProFormTextArea, ProFormUploadButton as RawProFormUploadButton, ActionType } from '@ant-design/pro-components';

// Workaround: ProFormUploadButton bị export sai type
const SafeUploadButton = RawProFormUploadButton as unknown as React.FC<any>;
import { User, AdvanceRequest } from '@/src/types';
import { Tag, Button, Space, Typography, Badge, message, Descriptions } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, FileImageOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { formatCurrency, formatDateTime } from '@/src/utils/format';
import { useAdvanceRequestService } from '@/src/api/services';

const { Text } = Typography;

interface AdvanceApprovalProps {
  currentUser: User;
}

const AdvanceApprovalPage: React.FC<AdvanceApprovalProps> = ({ currentUser }) => {
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<AdvanceRequest | null>(null);
  
  const actionRef = useRef<ActionType>(null);
  const { request, patch } = useAdvanceRequestService();
  // State pendingCount dùng để đếm số lượng chờ duyệt trên màn hình
  const [pendingCount, setPendingCount] = useState(0);

  const advanceColumns: ProColumns<AdvanceRequest>[] = [
    {
      title: 'Nhân viên',
      dataIndex: 'employeeName',
      width: 150,
      render: (_, record: any) => record.employeeId?.name || record.employeeName || 'Unknown',
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
      width: 200,

    },
    {
      title: 'Lý do',
      dataIndex: 'reason',
      ellipsis: true,
      width: 200,

    },
    {
      title: 'Ngày yêu cầu',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      hideInSearch: true,
      render: (_, record: any) => formatDateTime(String(record.createdAt || record.requestDate)),
      width: 200,

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
      width: 100,


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
              size="large"
              icon={<CheckCircleOutlined />}
              onClick={() => {
                setSelectedRequest(record);
                setApproveModalVisible(true);
              }}
              title='Duyệt'
            />
            ,
            <Button
              key="reject"
              danger
              size="large"
              icon={<CloseCircleOutlined />}
              onClick={() => handleReject(record.id)}
              title='Từ chối'
            />,
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

    try {
      await patch(selectedRequest.id, {
        status: 'Đã duyệt',
        approvedBy: currentUser.name,
        approvedDate: dayjs().toISOString(),
        transferProof: values.transferProof?.[0]?.url || values.transferProof?.[0]?.response?.url,
        note: values.note,
      });

      message.success('Đã duyệt yêu cầu ứng tiền!');
      setApproveModalVisible(false);
      setSelectedRequest(null);
      actionRef.current?.reload();
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleReject = async (id: string) => {
    try {
      await patch(id, {
        status: 'Từ chối',
        approvedBy: currentUser.name,
        approvedDate: dayjs().toISOString(),
        note: 'Yêu cầu không được chấp nhận',
      });
      message.info('Đã từ chối yêu cầu');
      actionRef.current?.reload();
    } catch (e) {
      // error handled by api hook
    }
  };

  const viewRequestDetail = (record: any) => {
    message.info(`Chi tiết yêu cầu: ${record.employeeId?.name || record.employeeName} - ${formatCurrency(record.amount)}`);
  };

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
        actionRef={actionRef}
        request={async (params) => {
          try {
            const queryParams: any = {
              page: params.current || 1,
              limit: params.pageSize || 10,
            };
            
            if (params.employeeName) queryParams.employeeName = params.employeeName;
            if (params.reason) queryParams.reason = params.reason;
            if (params.status) queryParams.status = params.status;

            const res = await request('GET', '', null, queryParams);
            
            // Xóa pendingCount vì api không trả về tổng số lượng record chờ duyệt mà chỉ trả về page hiện tại
            // Hoặc lấy từ meta data
            
            return {
              data: res.data || [],
              success: true,
              total: res.meta?.total || 0,
            };
          } catch (e) {
            return { data: [], success: false, total: 0 };
          }
        }}
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
            <Descriptions.Item label="Nhân viên">{(selectedRequest as any).employeeId?.name || selectedRequest.employeeName}</Descriptions.Item>
            <Descriptions.Item label="Số tiền">
              <Text strong style={{ fontSize: 16, color: '#1890ff' }}>
                {formatCurrency(selectedRequest.amount)}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Lý do">{selectedRequest.reason}</Descriptions.Item>
            <Descriptions.Item label="Ngày yêu cầu">
              {formatDateTime((selectedRequest as any).createdAt || selectedRequest.requestDate)}
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
