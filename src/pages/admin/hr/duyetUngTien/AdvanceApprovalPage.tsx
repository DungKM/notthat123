import React, { useState, useRef } from 'react';
import { ProTable, ProColumns, ModalForm, ProFormTextArea, ProFormUploadButton as RawProFormUploadButton, ActionType } from '@ant-design/pro-components';

// Workaround: ProFormUploadButton bị export sai type
const SafeUploadButton = RawProFormUploadButton as unknown as React.FC<any>;
import { User, AdvanceRequest } from '@/src/types';
import { Tag, Button, Space, Typography, Badge, Modal, Descriptions, Popconfirm, Image } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, FileImageOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { formatCurrency, formatDateTime } from '@/src/utils/format';
import { useAdvanceRequestService } from '@/src/api/services';

const { Text } = Typography;

interface AdvanceApprovalProps {
  currentUser: User;
}

const statusConfig: Record<string, { color: string; icon: React.ReactNode; badgeColor: string }> = {
  'Chờ duyệt': { color: 'orange', icon: <ClockCircleOutlined />, badgeColor: '#fa8c16' },
  'Đã duyệt': { color: 'green', icon: <CheckCircleOutlined />, badgeColor: '#52c41a' },
  'Từ chối': { color: 'red', icon: <CloseCircleOutlined />, badgeColor: '#ff4d4f' },
};

const AdvanceApprovalPage: React.FC<AdvanceApprovalProps> = ({ currentUser }) => {
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<AdvanceRequest | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailData, setDetailData] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const actionRef = useRef<ActionType>(null);
  const { request, patch, remove, getById } = useAdvanceRequestService();
  const [pendingCount, setPendingCount] = useState(0);

  const handleViewDetail = async (id: string) => {
    setDetailLoading(true);
    setDetailModalVisible(true);
    try {
      const res = await getById(id);
      setDetailData((res as any)?.data ?? res);
    } catch {
      setDetailData(null);
    } finally {
      setDetailLoading(false);
    }
  };

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
      hideInSearch: true
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
        const cfg = statusConfig[record.status as keyof typeof statusConfig];
        return <Tag color={cfg?.color} icon={cfg?.icon}>{record.status}</Tag>;
      },
      width: 120,
    },
    {
      title: 'Thao tác',
      valueType: 'option',
      width: 180,
      render: (_, record) => {
        const viewBtn = (
          <Button
            key="view"
            size="large"
            icon={<EyeOutlined />}
            title="Xem chi tiết"
            style={{ color: '#1890ff', borderColor: '#1890ff' }}
            onClick={() => handleViewDetail(record.id || (record as any)._id)}
          />
        );

        const deleteBtn = (
          <Popconfirm
            key="delete"
            title="Xóa yêu cầu"
            description="Bạn có chắc chắn muốn xóa yêu cầu này không?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button danger size="large" icon={<DeleteOutlined />} title="Xóa" />
          </Popconfirm>
        );

        if (record.status === 'Chờ duyệt') {
          return [
            viewBtn,
            <Button
              key="approve"
              type="primary"
              size="large"
              icon={<CheckCircleOutlined />}
              onClick={() => { setSelectedRequest(record); setApproveModalVisible(true); }}
              title="Duyệt"
            />,
            <Button
              key="reject"
              danger
              size="large"
              icon={<CloseCircleOutlined />}
              onClick={() => { setSelectedRequest(record); setRejectModalVisible(true); }}
              title="Từ chối"
            />,
            currentUser?.role !== 'DIRECTOR' ? deleteBtn : null,
          ].filter(Boolean);
        }
        return [viewBtn];
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
      if (values.note) formData.append('note', values.note);

      const existingImages = (selectedRequest as any).images || [];
      existingImages.forEach((img: any) => {
        const id = img.id || img._id;
        if (id) formData.append('keepImageIds', id);
      });

      if (values.transferProof?.length > 0) {
        values.transferProof.forEach((file: any) => {
          if (file.originFileObj) formData.append('images', file.originFileObj);
        });
      }

      await patch(selectedRequest.id, formData as any);
      setApproveModalVisible(false);
      setSelectedRequest(null);
      actionRef.current?.reload();
      return true;
    } catch {
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
    } catch {
      return false;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await remove(id);
      actionRef.current?.reload();
      return true;
    } catch {
      return false;
    }
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
            if (params.employeeName) queryParams.search = params.employeeName;
            if (params.reason) queryParams.reason = params.reason;
            if (params.status) queryParams.status = params.status;

            const res = await request('GET', '', null, queryParams);
            return {
              data: res.data || [],
              success: true,
              total: res.meta?.total || 0,
            };
          } catch {
            return { data: [], success: false, total: 0 };
          }
        }}
        rowKey="id"
        search={{ labelWidth: 'auto' }}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1200 }}
      />

      {/* ── Modal xem chi tiết ── */}
      <Modal
        open={detailModalVisible}
        onCancel={() => { setDetailModalVisible(false); setDetailData(null); }}
        footer={null}
        width={620}
        title="Chi tiết yêu cầu ứng tiền"
      >
        {detailLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#aaa' }}>Đang tải...</div>
        ) : detailData ? (
          <div>
            {/* Status badge */}
            <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'flex-end' }}>
              {(() => {
                const cfg = statusConfig[detailData.status] ?? statusConfig['Chờ duyệt'];
                return <Tag color={cfg.color} icon={cfg.icon} style={{ fontSize: 13, padding: '4px 12px' }}>{detailData.status}</Tag>;
              })()}
            </div>

            <Descriptions column={1} bordered size="middle" labelStyle={{ fontWeight: 600, width: 160, background: '#fafafa' }}>
              <Descriptions.Item label="Nhân viên">
                <Text strong>{detailData.employeeId?.name || detailData.employeeId || '-'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Số tiền">
                <Text strong style={{ fontSize: 18, color: '#1890ff' }}>
                  {formatCurrency(detailData.amount)}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Lý do">{detailData.reason || '-'}</Descriptions.Item>
              <Descriptions.Item label="Ngày yêu cầu">{formatDateTime(detailData.createdAt)}</Descriptions.Item>
              {detailData.approvedDate && (
                <Descriptions.Item label="Ngày duyệt">{formatDateTime(detailData.approvedDate)}</Descriptions.Item>
              )}
              {detailData.note && (
                <Descriptions.Item label="Ghi chú">{detailData.note}</Descriptions.Item>
              )}
            </Descriptions>

            {/* Ảnh đính kèm */}
            {detailData.images?.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <Text strong style={{ display: 'block', marginBottom: 10, color: '#555' }}>Ảnh đính kèm / Chứng từ</Text>
                <Image.PreviewGroup>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {detailData.images.map((img: any) => (
                      <Image
                        key={img.id || img._id}
                        src={img.url}
                        width={110}
                        height={110}
                        style={{ objectFit: 'cover', borderRadius: 8, border: '1px solid #f0f0f0' }}
                      />
                    ))}
                  </div>
                </Image.PreviewGroup>
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#aaa' }}>Không có dữ liệu</div>
        )}
      </Modal>

      {/* ── Modal phê duyệt ── */}
      <ModalForm
        title={`Phê duyệt ứng tiền - ${(selectedRequest as any)?.employeeId?.name || ''}`}
        open={approveModalVisible}
        onOpenChange={setApproveModalVisible}
        onFinish={handleApprove}
        width={600}
      >
        {selectedRequest && (
          <Descriptions column={1} bordered style={{ marginBottom: 16 }}>
            <Descriptions.Item label="Nhân viên">{(selectedRequest as any).employeeId?.name}</Descriptions.Item>
            <Descriptions.Item label="Số tiền">
              <Text strong style={{ fontSize: 16, color: '#1890ff' }}>{formatCurrency(selectedRequest.amount)}</Text>
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
          fieldProps={{ listType: 'picture-card', accept: 'image/*' }}
          extra="Hỗ trợ: JPG, PNG. Tối đa 5MB. Upload tối đa 4 ảnh."
        />

        <ProFormTextArea
          name="note"
          label="Ghi chú"
          placeholder="Nhập ghi chú (không bắt buộc)"
          fieldProps={{ rows: 3 }}
        />
      </ModalForm>

      {/* ── Modal từ chối ── */}
      <ModalForm
        title={`Từ chối ứng tiền - ${(selectedRequest as any)?.employeeId?.name || ''}`}
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
          fieldProps={{ rows: 4 }}
        />
      </ModalForm>
    </div>
  );
};

export default AdvanceApprovalPage;
