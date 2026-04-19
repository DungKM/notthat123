import React, { useRef, useState, useEffect } from 'react';
import { Button, Tag, Popconfirm, message, Modal, Descriptions, Space, Select, Upload, Image, Drawer, Tabs, Table, Switch, Form, Input } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, SettingOutlined, UploadOutlined, PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable, ModalForm, ProFormText, ProFormSelect, ProFormTextArea } from '@ant-design/pro-components';
import { useOrderService, useSettingService } from '@/src/api/services';

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

// --- CHILDS COMPONENTS FOR SETTINGS DRAWER ---

const PaymentMethodsTab: React.FC<{ requestSetting: any }> = ({ requestSetting }) => {
  const [methods, setMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();

  const fetchMethods = async () => {
    setLoading(true);
    try {
      const res: any = await requestSetting('GET', '/payment-methods/all');
      setMethods(res?.data || []);
    } catch {
      message.error('Lỗi khi tải phương thức thanh toán');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMethods();
  }, [requestSetting]);

  const handleToggle = async (checked: boolean, id: string) => {
    try {
      await requestSetting('PATCH', `/payment-methods/${id}`, { isActive: checked });
      message.success('Cập nhật trạng thái thành công');
      fetchMethods();
    } catch {
      message.error('Cập nhật thất bại');
      fetchMethods(); // reset state on fail
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await requestSetting('DELETE', `/payment-methods/${id}`);
      message.success('Đã xóa phương thức thanh toán');
      fetchMethods();
    } catch {
      message.error('Xóa thất bại');
    }
  };

  const handleSave = async (values: any) => {
    try {
      if (editingId) {
        await requestSetting('PATCH', `/payment-methods/${editingId}`, values);
        message.success('Cập nhật thành công');
      } else {
        await requestSetting('POST', '/payment-methods', { ...values, isActive: true });
        message.success('Thêm mới thành công');
      }
      setEditModalOpen(false);
      fetchMethods();
    } catch {
      message.error('Lưu thất bại');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#666', fontSize: 13 }}>Danh sách các phương thức thanh toán hiển thị cho khách hàng.</span>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingId(null); form.resetFields(); setEditModalOpen(true); }}>
          Thêm phương thức
        </Button>
      </div>
      <Table
        dataSource={methods}
        rowKey="id"
        loading={loading}
        pagination={false}
        bordered
        size="small"
        columns={[
          { title: 'Tên phương thức', dataIndex: 'name', render: (val) => <strong>{val}</strong> },
          { title: 'Mô tả', dataIndex: 'description' },
          { 
            title: 'Kích hoạt', 
            dataIndex: 'isActive',
            align: 'center',
            width: 100,
            render: (val, record) => <Switch checked={val} onChange={(c) => handleToggle(c, record.id)} />
          },
          {
            title: 'Thao tác',
            align: 'center',
            width: 120,
            render: (_, record) => (
              <Space>
                <Button type="text" icon={<EditOutlined />} onClick={() => {
                  setEditingId(record.id);
                  form.setFieldsValue({ name: record.name, description: record.description });
                  setEditModalOpen(true);
                }} />
                <Popconfirm title="Xóa phương thức này?" onConfirm={() => handleDelete(record.id)} okText="Xóa" cancelText="Hủy" okButtonProps={{danger: true}}>
                  <Button type="text" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              </Space>
            )
          }
        ]}
      />
      <Modal
        title={
          <div className="font-bold text-lg text-gray-800">
            {editingId ? 'Sửa phương thức thanh toán' : 'Thêm phương thức mới'}
          </div>
        }
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        onOk={() => form.submit()}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSave} className="mt-4">
          <Form.Item name="name" label="Tên phương thức" rules={[{ required: true, message: 'Vui lòng nhập tên phương thức' }]}>
            <Input placeholder="Ví dụ: Thanh toán tiền mặt, Quẹt thẻ..." size="large" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} placeholder="Mô tả ngắn gọn về phương thức" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

const BankTransferTab: React.FC<{ requestSetting: any }> = ({ requestSetting }) => {
  const [form] = Form.useForm();
  const [qrBase64, setQrBase64] = useState<string>('');
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchInfo = async () => {
      setLoading(true);
      try {
        const res: any = await requestSetting('GET', '/shop-info');
        if (res?.data) {
          setQrBase64(res.data.qrCodeUrl || '');
          form.setFieldsValue({
            bankName: res.data.bankName || '',
            accountNumber: res.data.accountNumber || '',
            accountHolder: res.data.accountHolder || '',
          });
        }
      } catch (e) {
      } finally {
        setLoading(false);
      }
    };
    fetchInfo();
  }, [requestSetting, form]);

  const onFinish = async (values: any) => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('bankName', values.bankName || '');
      formData.append('accountNumber', values.accountNumber || '');
      formData.append('accountHolder', values.accountHolder || '');
      if (qrFile) formData.append('image', qrFile);

      await requestSetting('PATCH', '/shop-info', formData, undefined, {
        'Content-Type': 'multipart/form-data',
      });
      message.success('Đã cấu hình thông tin ngân hàng thành công.');
    } catch {
      message.error('Cấu hình thất bại, vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      {loading && <div style={{ position: 'absolute', inset: 0, zIndex: 10, background: 'rgba(255,255,255,0.7)' }}></div>}
      <div style={{ padding: '16px', background: '#e6f7ff', borderRadius: '8px', marginBottom: '16px', border: '1px solid #91d5ff' }}>
        <p style={{ margin: 0, fontSize: '13px', color: '#0050b3' }}>
          Cập nhật các thông tin ngân hàng bên dưới, dữ liệu sẽ được hiển thị khi khách hàng chọn thanh toán chuyển khoản.
        </p>
      </div>

      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item name="bankName" label="Tên ngân hàng" rules={[{ required: true, message: 'Vui lòng nhập tên ngân hàng' }]}>
          <Input placeholder="VD: Vietcombank, TPBank" />
        </Form.Item>
        <Form.Item name="accountNumber" label="Số tài khoản" rules={[{ required: true, message: 'Vui lòng nhập số tài khoản' }]}>
          <Input placeholder="VD: 123456789" />
        </Form.Item>
        <Form.Item name="accountHolder" label="Tên chủ tài khoản" rules={[{ required: true, message: 'Vui lòng nhập tên chủ tài khoản' }]}>
          <Input placeholder="VD: NGUYEN VAN A" />
        </Form.Item>

        <div style={{ textAlign: 'center', padding: '10px 0 20px' }}>
          {qrBase64 ? (
            <div style={{ display: 'inline-block' }}>
              <div
                className="qr-preview-box"
                style={{ position: 'relative', width: 128, height: 128, borderRadius: 8, overflow: 'hidden', border: '1px solid #d9d9d9', cursor: 'default' }}
              >
                <Image src={qrBase64} width={128} height={128} style={{ objectFit: 'contain' }} preview={{ mask: false }} />
                <div
                  className="qr-hover-overlay"
                  style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(0,0,0,0.55)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
                    opacity: 0, transition: 'opacity 0.2s',
                    borderRadius: 8,
                  }}
                >
                  <EyeOutlined
                    style={{ fontSize: 24, color: '#fff', cursor: 'pointer' }}
                    onClick={() => document.querySelector<HTMLElement>('.qr-preview-box .ant-image-img')?.click()}
                  />
                  <DeleteOutlined
                    style={{ fontSize: 24, color: '#ff4d4f', cursor: 'pointer' }}
                    onClick={() => { setQrBase64(''); setQrFile(null); }}
                  />
                </div>
                <style>{`.qr-preview-box:hover .qr-hover-overlay { opacity: 1 !important; }`}</style>
              </div>

              <div style={{ marginTop: 10 }}>
                <input
                  id="qr-file-input"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => setQrBase64(ev.target?.result as string);
                    reader.readAsDataURL(file);
                    setQrFile(file);
                    e.target.value = '';
                  }}
                />
                <Button icon={<UploadOutlined />} size="small" onClick={() => document.getElementById('qr-file-input')?.click()}>Thay ảnh</Button>
              </div>
            </div>
          ) : (
            <Upload
              accept="image/*"
              listType="picture-card"
              showUploadList={false}
              beforeUpload={(file) => {
                const reader = new FileReader();
                reader.onload = (e) => setQrBase64(e.target?.result as string);
                reader.readAsDataURL(file);
                setQrFile(file);
                return false;
              }}
            >
              <div>
                <UploadOutlined style={{ fontSize: '24px', color: '#999' }} />
                <div style={{ marginTop: 8, color: '#666' }}>Tải QR Code lên</div>
              </div>
            </Upload>
          )}
          {!qrBase64 && <div style={{ color: '#ff4d4f', fontSize: '13px', marginTop: '12px' }}>Chưa có mã QR nào được tải lên</div>}
        </div>

        <div style={{ textAlign: 'right' }}>
          <Button type="primary" htmlType="submit" loading={saving}>Lưu cấu hình chuyển khoản</Button>
        </div>
      </Form>
    </div>
  );
};


// --- MAIN PAGE COMPONENT ---

const OrderManagementPage: React.FC = () => {
  const actionRef = useRef<ActionType>(null);
  const { request } = useOrderService();
  const { request: requestSetting } = useSettingService();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<OrderItem | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('');
  
  // Drawer state replacing separated modals
  const [settingsDrawerOpen, setSettingsDrawerOpen] = useState(false);

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
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontWeight: 600, fontSize: 14, color: '#555' }}>Lọc trạng thái:</span>
        <Select
          allowClear
          placeholder="Tất cả trạng thái"
          style={{ width: 200 }}
          value={filterStatus || undefined}
          onChange={(val) => {
            setFilterStatus(val || '');
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
            onClick={() => setSettingsDrawerOpen(true)}
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
        <ProFormText name="fullName" label="Họ tên Khách hàng" rules={[{ required: true }]} />
        <ProFormText name="phone" label="Số điện thoại" rules={[{ required: true }]} />
        <ProFormText name="email" label="Email" />
        <ProFormTextArea name="address" label="Địa chỉ giao hàng" rules={[{ required: true }]} />
        <ProFormSelect
          name="deliveryTime"
          label="Thời gian giao hàng"
          rules={[{ required: true }]}
          options={[
            { label: 'Trong giờ hành chính (08:00 - 17:00)', value: 'business_hours' },
            { label: 'Ngoài giờ hành chính (Sau 17:00)', value: 'outside_business_hours' },
          ]}
        />
      </ModalForm>

      {/* Drawer Cấu hình Thanh toán tổng hợp */}
      <Drawer
        title={<div className="font-bold text-lg">Cấu hình Thanh toán</div>}
        width={750}
        open={settingsDrawerOpen}
        onClose={() => setSettingsDrawerOpen(false)}
        destroyOnClose
      >
        <Tabs
          defaultActiveKey="1"
          type="card"
          items={[
            {
              key: '1',
              label: 'Phương thức thanh toán',
              children: <PaymentMethodsTab requestSetting={requestSetting} />
            },
            {
              key: '2',
              label: 'Thông tin chuyển khoản (QR)',
              children: <BankTransferTab requestSetting={requestSetting} />
            }
          ]}
        />
      </Drawer>
    </>
  );
};

export default OrderManagementPage;