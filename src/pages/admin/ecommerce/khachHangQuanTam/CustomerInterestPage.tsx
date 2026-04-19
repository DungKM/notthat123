import React, { useRef, useState } from 'react';
import { ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { Tag, Button, Tooltip, message, Popconfirm, Modal, Form, Select, Input, Descriptions, Space } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useInterestesService } from '@/src/api/services';

interface CustomerInterest {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  entityType: string;
  entityId: { name: string; slug: string; id: string } | string;
  createdAt: string;
  status: string;
  note?: string;
}

const typeMap: Record<string, string> = {
  'Product': 'Sản phẩm',
  'Architecture': 'Kiến trúc',
  'Construction': 'Công trình',
  'Production': 'Nội thất',
};

const typeColors: Record<string, string> = {
  'Product': 'blue',
  'Architecture': 'magenta',
  'Construction': 'cyan',
  'Production': 'cyan',
};

const CustomerInterestPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const { request, patch, remove, getById } = useInterestesService();

  // Detail Modal State
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailData, setDetailData] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Update Status Modal State
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<CustomerInterest | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateForm] = Form.useForm();

  // Actions
  const handleViewDetail = async (id: string) => {
    setDetailModalOpen(true);
    setLoadingDetail(true);
    try {
      const data = await getById(id);
      setDetailData(data);
    } catch (e) {
      setDetailModalOpen(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await remove(id);
      actionRef.current?.reload();
    } catch (e) {
      // already handled in useApi
    }
  };

  const handleUpdateStatus = async (values: any) => {
    if (!currentRecord) return;
    setUpdateLoading(true);
    try {
      await patch(currentRecord.id, { status: values.status, note: values.note });
      setUpdateModalOpen(false);
      actionRef.current?.reload();
    } catch (e) {
      // already handled in useApi
    } finally {
      setUpdateLoading(false);
    }
  };

  const columns: ProColumns<CustomerInterest>[] = [
    {
      title: 'Tên khách hàng',
      dataIndex: 'fullName',
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
      dataIndex: 'entityType',
      filters: true,
      onFilter: true,
      valueEnum: {
        'Product': { text: 'Sản phẩm' },
        'Architecture': { text: 'Kiến trúc' },
        'Construction': { text: 'Công trình' },
        'Production': { text: 'Nội thất' },
      },
      render: (_, record) => {
        const typeName = typeMap[record.entityType] || record.entityType;
        return <Tag color={typeColors[record.entityType] || 'default'}>{typeName}</Tag>;
      },
    },
    {
      title: 'Tên (Sản phẩm/Bài viết)',
      dataIndex: 'entityId',
      ellipsis: true,
      render: (_, record) => {
        if (typeof record.entityId === 'object' && record.entityId !== null) {
          return record.entityId.name;
        }
        return '---';
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      filters: true,
      onFilter: true,
      valueEnum: {
        'Chờ xử lý': { text: 'Chờ xử lý', status: 'Warning' },
        'Đã liên hệ': { text: 'Đã liên hệ', status: 'Success' },
        'Đã hủy': { text: 'Đã hủy', status: 'Error' },
      },
      render: (_, record) => {
        let color = 'default';
        if (record.status === 'Chờ xử lý') color = 'warning';
        else if (record.status === 'Đã liên hệ') color = 'success';
        else if (record.status === 'Đã hủy') color = 'error';
        return <Tag color={color}>{record.status}</Tag>;
      },
    },
    {
      title: 'Ngày gửi',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
      search: false,
    },
    {
      title: 'Thao tác',
      valueType: 'option',
      key: 'option',
      width: 150,
      align: 'center',
      render: (text, record, _, action) => [
        <Tooltip key="view" title="Xem chi tiết">
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleViewDetail(record.id)} />
        </Tooltip>,
        <Tooltip key="edit" title="Cập nhật trạng thái">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => {
              setCurrentRecord(record);
              updateForm.setFieldsValue({ status: record.status, note: record.note || '' });
              setUpdateModalOpen(true);
            }}
          />
        </Tooltip>,
        <Popconfirm
          key="delete"
          title="Xóa thông tin?"
          description="Bạn có chắc muốn xóa thông tin khách hàng ?"
          onConfirm={() => handleDelete(record.id)}
          okText="Xóa"
          cancelText="Hủy"
          okButtonProps={{ danger: true }}
        >
          <Tooltip title="Xóa">
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Tooltip>
        </Popconfirm>
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
          const apiParams: any = {
            page: params.current || 1,
            limit: params.pageSize || 10,
          };

          if (params.fullName) {
            apiParams.search = params.fullName;
          }
          if (params.phone) {
            apiParams.search = params.phone;
          }

          if (filter.entityType) {
            apiParams.entityType = Array.isArray(filter.entityType) ? filter.entityType.join(',') : filter.entityType;
          }
          if (filter.status) {
            apiParams.status = Array.isArray(filter.status) ? filter.status.join(',') : filter.status;
          }

          try {
            const res: any = await request('GET', '', undefined, apiParams);
            return {
              data: res?.data || [],
              success: true,
              total: res?.meta?.total || 0,
            };
          } catch (e) {
            return { data: [], success: false, total: 0 };
          }
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

      {/* Chi tiết Modal */}
      <Modal
        title={
          <div className="font-bold text-lg text-gray-800">
            Chi tiết Thông tin Quan tâm
          </div>
        }
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalOpen(false)}>Đóng</Button>
        ]}
        width={700}
        destroyOnClose
      >
        {loadingDetail ? (
          <div className="py-10 text-center text-gray-500">Đang tải dữ liệu...</div>
        ) : detailData ? (
          <Descriptions bordered column={1} className="mt-4">
            <Descriptions.Item label="Họ và tên">{detailData.fullName || detailData.name}</Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">{detailData.phone}</Descriptions.Item>
            <Descriptions.Item label="Email">{detailData.email || 'Không có'}</Descriptions.Item>
            <Descriptions.Item label="Loại quan tâm">
              <Tag color={typeColors[detailData.entityType] || 'default'}>
                {typeMap[detailData.entityType] || detailData.entityType}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Sản phẩm/Bài viết">
              <span className="font-medium">
                {typeof detailData.entityId === 'object' && detailData.entityId ? detailData.entityId.name : detailData.entityId}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={detailData.status === 'Chờ xử lý' ? 'warning' : detailData.status === 'Đã liên hệ' ? 'success' : 'error'}>
                {detailData.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Ghi chú">
              {detailData.note ? <span className="whitespace-pre-wrap">{detailData.note}</span> : <span className="text-gray-400 italic">Không có</span>}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày gửi">
              {dayjs(detailData.createdAt).format('DD/MM/YYYY HH:mm')}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <div className="py-10 text-center text-red-500">Không tải được dữ liệu chi tiết</div>
        )}
      </Modal>

      {/* Cập nhật Trạng thái Modal */}
      <Modal
        title={
          <div className="font-bold text-lg text-gray-800">
            Cập nhật Trạng thái
          </div>
        }
        open={updateModalOpen}
        onCancel={() => setUpdateModalOpen(false)}
        onOk={() => updateForm.submit()}
        confirmLoading={updateLoading}
        destroyOnClose
      >
        <Form
          form={updateForm}
          layout="vertical"
          onFinish={handleUpdateStatus}
          className="mt-4"
        >
          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
          >
            <Select size="large">
              <Select.Option value="Chờ xử lý">Chờ xử lý</Select.Option>
              <Select.Option value="Đã liên hệ">Đã liên hệ</Select.Option>
              <Select.Option value="Đã hủy">Đã hủy</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="note"
            label="Ghi chú thêm"
          >
            <Input.TextArea
              rows={4}
              placeholder="Ghi chú tình trạng liên hệ (ví dụ: Khách hẹn gọi lại vào sáng mai...)"
            />
          </Form.Item>
        </Form>
      </Modal>

    </div>
  );
};

export default CustomerInterestPage;
