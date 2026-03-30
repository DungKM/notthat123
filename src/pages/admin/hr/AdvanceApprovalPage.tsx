import React, { useState, useRef } from 'react';
import { ProTable, ProColumns, ModalForm, ProFormTextArea, ProFormUploadButton as RawProFormUploadButton, ActionType } from '@ant-design/pro-components';

// Workaround: ProFormUploadButton bị export sai type
const SafeUploadButton = RawProFormUploadButton as unknown as React.FC<any>;
import { User, AdvanceRequest } from '@/src/types';
import { Tag, Button, Space, Typography, Badge, message, Descriptions, Popconfirm } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, FileImageOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { formatCurrency, formatDateTime } from '@/src/utils/format';
import { useAdvanceRequestService } from '@/src/api/services';

const { Text } = Typography;

interface AdvanceApprovalProps {
  currentUser: User;
}

const AdvanceApprovalPage: React.FC<AdvanceApprovalProps> = ({ currentUser }) => {
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<AdvanceRequest | null>(null);

  const actionRef = useRef<ActionType>(null);
  const { request, patch, remove } = useAdvanceRequestService();
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
      hideInSearch: true,
      render: (_, record) => (
        <Text strong style={{ fontSize: 14 }}>
          {formatCurrency(Number(record.amount))}
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
        const deleteBtn = (
          <Popconfirm
            key="delete"
            title="Xóa yêu cầu"
            description="Bạn có chắc chắn muốn xóa yêu cầu này không?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button
              danger
              size="large"
              icon={<DeleteOutlined />}
              title='Xóa'
            />
          </Popconfirm>
        );

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
              title="Duyệt"
            />,
            <Button
              key="reject"
              danger
              size="large"
              icon={<CloseCircleOutlined />}
              onClick={() => {
                setSelectedRequest(record);
                setRejectModalVisible(true);
              }}
              title="Từ chối"
            />,
            // Ẩn nút Xóa đối với role GIÁM ĐỐC (DIRECTOR)
            currentUser?.role !== 'DIRECTOR' ? deleteBtn : null,
          ].filter(Boolean); // Bỏ các element null/falsy
        }
        return [];
      },
    },
  ];

  const handleApprove = async (values: any) => {
    if (!selectedRequest) return false;

    try {
      const formData = new FormData();
      formData.append('status', 'Đã duyệt');
      formData.append('approvedBy', currentUser.name);
      formData.append('approvedDate', dayjs().toISOString());
      if (values.note) {
        formData.append('note', values.note);
      }

      // Giữ lại các ảnh cũ của employee (nếu có)
      const existingImages = (selectedRequest as any).images || [];
      existingImages.forEach((img: any) => {
        const id = img.id || img._id;
        if (id) {
          formData.append('keepImageIds', id);
        }
      });

      // Thêm ảnh chứng từ chuyển khoản mới
      if (values.transferProof && values.transferProof.length > 0) {
        values.transferProof.forEach((file: any) => {
          if (file.originFileObj) {
            formData.append('images', file.originFileObj);
          }
        });
      }

      await patch(selectedRequest.id, formData as any);

      setApproveModalVisible(false);
      setSelectedRequest(null);
      actionRef.current?.reload();
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleRejectSubmit = async (values: any) => {
    if (!selectedRequest) return false;
    try {
      await patch(selectedRequest.id, {
        status: 'Từ chối',
        approvedBy: currentUser.name,
        approvedDate: dayjs().toISOString(),
        note: values.reason,
      });
      setRejectModalVisible(false);
      setSelectedRequest(null);
      actionRef.current?.reload();
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await remove(id);
      actionRef.current?.reload();
      return true;
    } catch (e) {
      return false;
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
          max={4}
          fieldProps={{
            listType: 'picture-card',
            accept: 'image/*',
          }}
          extra="Hỗ trợ: JPG, PNG. Tối đa 5MB. Upload tối đa 4 ảnh."
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

      <ModalForm
        title={`Từ chối ứng tiền - ${selectedRequest?.employeeName || ''}`}
        open={rejectModalVisible}
        onOpenChange={setRejectModalVisible}
        onFinish={handleRejectSubmit}
        width={500}
      >
        <ProFormTextArea
          name="reason"
          label="Lý do từ chối"
          placeholder="Nhập lý do từ chối yêu cầu ứng tiền này..."
          rules={[{ required: true, message: 'Vui lòng nhập lý do từ chối' }]}
          fieldProps={{
            rows: 4,
          }}
        />
      </ModalForm>
    </div>
  );
};

export default AdvanceApprovalPage;
