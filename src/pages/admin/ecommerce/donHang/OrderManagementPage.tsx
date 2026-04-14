import React, { useRef, useState } from 'react';
import { Button, Tag, Popconfirm, message, Modal, Descriptions, Space, Select, Upload } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, SettingOutlined, UploadOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable, ModalForm, ProFormText, ProFormSelect, ProFormTextArea } from '@ant-design/pro-components';
import { useOrderService } from '@/src/api/services';

interface OrderItemProduct {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  subtotal: number;
}

interface OrderItem {
  id: string;
  items: OrderItemProduct[];
  totalAmount: number;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  deliveryTime: string;
  status: string;
  sessionId?: string;
  createdAt: string;
  updatedAt: string;
}

const statusMap: Record<string, { text: string; color: string }> = {
  pending: { text: 'Chờ xử lý', color: 'orange' },
  confirmed: { text: 'Đã xác nhận', color: 'blue' },
  shipping: { text: 'Đang giao hàng', color: 'cyan' },
  delivered: { text: 'Đã giao hàng', color: 'green' },
  cancelled: { text: 'Đã hủy', color: 'red' },
};

const deliveryTimeMap: Record<string, string> = {
  business_hours: 'Trong giờ hành chính (08:00 - 17:00)',
  outside_business_hours: 'Ngoài giờ hành chính (Sau 17:00)',
};

const OrderManagementPage: React.FC = () => {
  const actionRef = useRef<ActionType>(null);
  const { request } = useOrderService();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<OrderItem | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const defaultPaymentSettings = JSON.parse(localStorage.getItem('paymentSettings') || '{"qrImage": ""}');
  const [qrBase64, setQrBase64] = useState<string>(defaultPaymentSettings.qrImage || '');

  // Xem chi tiết đơn hàng
  // Xem chi tiết đơn hàng
  const handleView = async (record: OrderItem) => {
    const hide = message.loading('Đang tải chi tiết đơn hàng...', 0);
    try {
      const res = await request('GET', `/${record.id}`);
      const data = res.data;
      hide();

      Modal.info({
        title: `Chi tiết đơn hàng`,
        width: 700,
        content: (
          <div style={{ marginTop: 16 }}>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Khách hàng" span={1}>{data.fullName}</Descriptions.Item>
              <Descriptions.Item label="SĐT" span={1}>{data.phone}</Descriptions.Item>
              <Descriptions.Item label="Email" span={1}>{data.email}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái" span={1}>
                <Tag color={statusMap[data.status]?.color || 'default'}>
                  {statusMap[data.status]?.text || data.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ" span={2}>{data.address}</Descriptions.Item>
              <Descriptions.Item label="Thời gian giao" span={2}>
                {deliveryTimeMap[data.deliveryTime] || data.deliveryTime}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo" span={1}>
                {new Date(data.createdAt).toLocaleString('vi-VN')}
              </Descriptions.Item>
              <Descriptions.Item label="Tổng tiền" span={1}>
                <span style={{ fontWeight: 'bold', color: '#cf1322' }}>
                  {data.totalAmount.toLocaleString('vi-VN')} VNĐ
                </span>
              </Descriptions.Item>
            </Descriptions>

            <h4 style={{ marginTop: 16, marginBottom: 8 }}>Sản phẩm trong đơn:</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#fafafa' }}>
                  <th style={{ border: '1px solid #f0f0f0', padding: '8px', textAlign: 'left' }}>Tên sản phẩm</th>
                  <th style={{ border: '1px solid #f0f0f0', padding: '8px', textAlign: 'right' }}>Đơn giá</th>
                  <th style={{ border: '1px solid #f0f0f0', padding: '8px', textAlign: 'center' }}>SL</th>
                  <th style={{ border: '1px solid #f0f0f0', padding: '8px', textAlign: 'right' }}>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {(data.items || []).map((item: any, idx: number) => (
                  <tr key={idx}>
                    <td style={{ border: '1px solid #f0f0f0', padding: '8px' }}>{item.productName}</td>
                    <td style={{ border: '1px solid #f0f0f0', padding: '8px', textAlign: 'right' }}>
                      {item.price.toLocaleString('vi-VN')} đ
                    </td>
                    <td style={{ border: '1px solid #f0f0f0', padding: '8px', textAlign: 'center' }}>{item.quantity}</td>
                    <td style={{ border: '1px solid #f0f0f0', padding: '8px', textAlign: 'right' }}>
                      {item.subtotal.toLocaleString('vi-VN')} đ
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ),
        okText: 'Đóng',
      });
    } catch (err) {
      hide();
      message.error('Không thể tải chi tiết đơn hàng!');
    }
  };

  // Mở modal sửa (lấy chi tiết từ API)
  const handleEdit = async (record: OrderItem) => {
    const hide = message.loading('Đang tải dữ liệu đơn hàng...', 0);
    try {
      const res = await request('GET', `/${record.id}`);
      setCurrentRecord(res.data);
      setEditModalOpen(true);
    } catch (err) {
      message.error('Không thể tải dữ liệu đơn hàng!');
    } finally {
      hide();
    }
  };

  // Xóa đơn hàng
  const handleDelete = async (id: string) => {
    try {
      await request('DELETE', `/${id}`);
      message.success('Xóa đơn hàng thành công');
      actionRef.current?.reload();
    } catch (err) {
      message.error('Xóa đơn hàng thất bại');
    }
  };

  const columns: ProColumns<OrderItem>[] = [
    {
      title: 'STT',
      dataIndex: 'index',
      valueType: 'index',
      width: 48,
    },
    {
      title: 'Khách hàng',
      dataIndex: 'fullName',
      ellipsis: true,
      width: 200,

    },
    {
      title: 'SĐT',
      dataIndex: 'phone',
      width: 130,
      search: false,
    },

    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      search: false,
      width: 140,
      render: (_, record) => (
        <span style={{ fontWeight: 600, color: '#cf1322' }}>
          {record.totalAmount.toLocaleString('vi-VN')} đ
        </span>
      ),
    },

    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 120,
      search: false,
      render: (_, record) => {
        const st = statusMap[record.status];
        return <Tag color={st?.color || 'default'}>{st?.text || record.status}</Tag>;
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      search: false,
      width: 160,
      render: (_, record) => new Date(record.createdAt).toLocaleString('vi-VN'),
    },
    {
      title: 'Thao tác',
      valueType: 'option',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
            title="Xem chi tiết"
            size='large'
          />
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            title="Sửa"
            size='large'
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn chắc chắn muốn xóa đơn hàng này?"
            description="Hành động này không thể hoàn tác."

            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}


          >
            <Button type="link" danger icon={<DeleteOutlined />} title="Xóa" size="large" />
          </Popconfirm>
        </Space>
      ),
    },
  ];
  return (
    <>
      {/* Filter bar trạng thái */}
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontWeight: 600, fontSize: 14, color: '#555' }}>Lọc trạng thái:</span>
        <Select
          allowClear
          placeholder="Tất cả trạng thái"
          style={{ width: 200 }}
          value={filterStatus || undefined}
          onChange={(val) => {
            setFilterStatus(val || '');
            // Đảm bảo ProTable tự load lại
            actionRef.current?.reload();
          }}
          options={[
            { label: 'Chờ xử lý', value: 'pending' },
            { label: 'Đã xác nhận', value: 'confirmed' },
            { label: 'Đang giao hàng', value: 'shipping' },
            { label: 'Đã giao hàng', value: 'delivered' },
            { label: 'Đã hủy', value: 'cancelled' },
          ]}
        />
      </div>

      <ProTable<OrderItem>
        columns={columns}
        actionRef={actionRef}
        rowKey="id"
        headerTitle="Quản lý đơn hàng"
        search={{ labelWidth: 'auto' }}
        pagination={{ pageSize: 10 }}
        toolBarRender={() => [
          <Button
            key="setting"
            icon={<SettingOutlined />}
            type="primary"
            onClick={() => setQrModalOpen(true)}
          >
            Cấu hình thanh toán
          </Button>,
        ]}
        scroll={{ x: 'max-content' }}
        request={async (params) => {
          try {
            const queryParams: Record<string, any> = {
              page: params.current || 1,
              limit: params.pageSize || 10,
            };
            if (params.fullName) queryParams.search = params.fullName;
            if (filterStatus) queryParams.status = filterStatus;

            const res = await request('GET', '/list', null, queryParams);
            return {
              data: res?.data || [],
              total: res?.meta?.total || 0,
              success: true,
            };
          } catch (err) {
            message.error('Không thể tải danh sách đơn hàng');
            return { data: [], total: 0, success: false };
          }
        }}
      />

      <ModalForm
        title="Sửa thông tin đơn hàng"
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        initialValues={currentRecord || {}}
        modalProps={{
          destroyOnClose: true,
        }}
        onFinish={async (values) => {
          try {
            if (!currentRecord) return false;
            // Gọi api PATCH /orders/{id}
            await request('PATCH', `/${currentRecord.id}`, values);
            message.success('Cập nhật đơn hàng thành công');
            setEditModalOpen(false);
            actionRef.current?.reload();
            return true;
          } catch (error) {
            message.error('Cập nhật thất bại');
            return false;
          }
        }}
      >
        <ProFormSelect
          name="status"
          label="Trạng thái đơn hàng"
          rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
          options={[
            { label: 'Chờ xử lý', value: 'pending' },
            { label: 'Đã xác nhận', value: 'confirmed' },
            { label: 'Đang giao hàng', value: 'shipping' },
            { label: 'Đã giao hàng', value: 'delivered' },
            { label: 'Đã hủy', value: 'cancelled' },
          ]}
        />
        <ProFormText
          name="fullName"
          label="Họ tên Khách hàng"
          rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
        />
        <ProFormText
          name="phone"
          label="Số điện thoại"
          rules={[{ required: true, message: 'Vui lòng nhập SĐT!' }]}
        />
        <ProFormText
          name="email"
          label="Email"
        />
        <ProFormTextArea
          name="address"
          label="Địa chỉ giao hàng"
          rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
        />
        <ProFormSelect
          name="deliveryTime"
          label="Thời gian giao hàng"
          rules={[{ required: true, message: 'Vui lòng chọn thời gian!' }]}
          options={[
            { label: 'Trong giờ hành chính (08:00 - 17:00)', value: 'business_hours' },
            { label: 'Ngoài giờ hành chính (Sau 17:00)', value: 'outside_business_hours' },
          ]}
        />
      </ModalForm>

      <ModalForm
        title="Cấu hình thông tin thanh toán chuyển khoản"
        open={qrModalOpen}
        onOpenChange={(open) => {
          setQrModalOpen(open);
          if (open) {
            setQrBase64(JSON.parse(localStorage.getItem('paymentSettings') || '{"qrImage": ""}').qrImage || '');
          }
        }}
        onFinish={async () => {
          localStorage.setItem('paymentSettings', JSON.stringify({ qrImage: qrBase64 }));
          message.success('Đã lưu cấu hình thanh toán. Thông tin mới sẽ áp dụng ngoài trang Khách.');
          setQrModalOpen(false);
          return true;
        }}
        modalProps={{ destroyOnClose: true }}
      >
        <div style={{ padding: '16px', background: '#e6f7ff', borderRadius: '8px', marginBottom: '16px', border: '1px solid #91d5ff' }}>
          <p style={{ margin: 0, fontSize: '13px', color: '#0050b3' }}>
            💡 Cấu hình thanh toán này sẽ hiển thị bên ngoài trang thanh toán ở website.<br/>
            - Vui lòng tải lên (upload) ảnh mã QR tĩnh của bạn tại đây để khách hàng tự quét.
          </p>
        </div>
        
        <div style={{ textAlign: 'center', padding: '10px 0 20px' }}>
          <Upload
            accept="image/*"
            listType="picture-card"
            showUploadList={false}
            beforeUpload={(file) => {
              const reader = new FileReader();
              reader.onload = (e) => setQrBase64(e.target?.result as string);
              reader.readAsDataURL(file);
              return false; // Ngăn chặn tự động upload
            }}
          >
            {qrBase64 ? (
              <img src={qrBase64} alt="qr" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }} />
            ) : (
              <div>
                <UploadOutlined style={{ fontSize: '24px', color: '#999' }} />
                <div style={{ marginTop: 8, color: '#666' }}>Tải ảnh lên</div>
              </div>
            )}
          </Upload>
          {!qrBase64 && <div style={{ color: '#ff4d4f', fontSize: '13px', marginTop: '12px' }}>Chưa có ảnh QR nào được tải lên</div>}
        </div>
      </ModalForm>
    </>
  );
};

export default OrderManagementPage;