import React, { useRef, useState } from 'react';
import { ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, DatePicker, Space, Tag, message, Modal, Form, InputNumber, Select, Input } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useAuth } from '@/src/auth/hooks/useAuth';
import { useSalaryService } from '@/src/api/services';
import dayjs from 'dayjs';

const roleLabels: Record<string, string> = {
  DIRECTOR: 'Giám đốc',
  ACCOUNTANT: 'Kế toán',
  STAFF: 'Nhân viên',
  SITE_MANAGER: 'Quản lý công trình',
};

const fmt = (v: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v || 0);

interface SalaryRow {
  userId: { id: string; name: string; role: string; baseSalary: number };
  month: string;
  bonus: number;
  penalty: number;
  advance: number;
  netSalary: number;
  totalWorkDays: number;
  totalOTDays: number;
}

const SalaryManagementPage: React.FC = () => {
  const { user } = useAuth();
  const actionRef = useRef<ActionType>(null);
  const [month, setMonth] = useState(dayjs().format('YYYY-MM'));
  const [adjustModal, setAdjustModal] = useState(false);
  const [adjustForm] = Form.useForm();
  const [rows, setRows] = useState<SalaryRow[]>([]);
  const { request } = useSalaryService();

  const handleAddAdjustment = async (values: any) => {
    try {
      await request('POST', '', {
        userId: values.userId,
        month,
        type: values.type,
        amount: values.amount,
        content: values.content,
      });
      message.success('Đã ghi nhận thành công!');
      setAdjustModal(false);
      adjustForm.resetFields();
      actionRef.current?.reload();
    } catch {
      message.error('Có lỗi xảy ra!');
    }
  };

  const columns: ProColumns<SalaryRow>[] = [
    {
      title: 'Nhân viên',
      dataIndex: ['userId', 'name'],
      render: (_, r) => <strong>{r.userId?.name}</strong>,
    },
    {
      title: 'Vai trò',
      dataIndex: ['userId', 'role'],
      render: (_, r) => <Tag>{roleLabels[r.userId?.role] || r.userId?.role}</Tag>,
    },
    {
      title: 'Lương cơ bản',
      dataIndex: ['userId', 'baseSalary'],
      render: (_, r) => <span style={{ color: '#1890ff', fontWeight: 600 }}>{fmt(r.userId?.baseSalary)}</span>,
    },
    {
      title: 'Thưởng',
      dataIndex: 'bonus',
      render: (_, r) => <span style={{ color: '#52c41a' }}>{fmt(r.bonus)}</span>,
    },
    {
      title: 'Phạt',
      dataIndex: 'penalty',
      render: (_, r) => <span style={{ color: 'red' }}>{fmt(r.penalty)}</span>,
    },
    {
      title: 'Tạm ứng',
      dataIndex: 'advance',
      render: (_, r) => <span>{fmt(r.advance)}</span>,
    },
    {
      title: 'Ngày công',
      dataIndex: 'totalWorkDays',
      width: 110,
    },
    {
      title: 'Ngày OT',
      dataIndex: 'totalOTDays',
      width: 100,
    },
    {
      title: 'Số tiền đang có',
      dataIndex: 'nextSalary',
      render: (_, r) => (
        <span style={{ fontWeight: 700, fontSize: 15, color: '#13c55a' }}>{fmt(r.netSalary)}</span>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <ProTable<SalaryRow>
        actionRef={actionRef}
        headerTitle="Bảng lương nhân sự"
        rowKey={(r) => r.userId?.id || Math.random().toString()}
        search={false}
        scroll={{ x: 900 }}
        columns={columns}
        toolbar={{
          actions: [
            <Space key="month-picker">
              <DatePicker
                picker="month"
                value={dayjs(month, 'YYYY-MM')}
                format="MM/YYYY"
                allowClear={false}
                onChange={(d) => {
                  if (d) {
                    setMonth(d.format('YYYY-MM'));
                    setTimeout(() => actionRef.current?.reload(), 100);
                  }
                }}
              />
            </Space>,
            <Button
              key="adjust"
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setAdjustModal(true)}
            >
              Thêm thưởng / phạt / ứng
            </Button>,
          ],
        }}
        request={async () => {
          try {
            const res = await request('GET', '', null, { month });
            const data: SalaryRow[] = res.data || [];
            setRows(data);
            return { data, success: true, total: data.length };
          } catch {
            return { data: [], success: false, total: 0 };
          }
        }}
        pagination={false}
      />

      <Modal
        title="Thêm thưởng / phạt / tạm ứng"
        open={adjustModal}
        onCancel={() => { setAdjustModal(false); adjustForm.resetFields(); }}
        onOk={() => adjustForm.submit()}
        okText="Lưu"
        cancelText="Hủy"
        destroyOnClose
      >
        <Form form={adjustForm} layout="vertical" onFinish={handleAddAdjustment}>
          <Form.Item name="userId" label="Nhân viên" rules={[{ required: true }]}>
            <Select
              placeholder="Chọn nhân viên"
              options={rows.map((r) => ({ label: r.userId?.name, value: r.userId?.id }))}
            />
          </Form.Item>
          <Form.Item name="type" label="Loại" rules={[{ required: true }]}>
            <Select
              options={[
                { label: 'Thưởng', value: 'thưởng' },
                { label: 'Phạt', value: 'phạt' },
                { label: 'Tạm ứng', value: 'tạm ứng' },
              ]}
            />
          </Form.Item>
          <Form.Item name="amount" label="Số tiền (VND)" rules={[{ required: true }]}>
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(v) => v?.replace(/,/g, '') as any}
              addonAfter="VND"
            />
          </Form.Item>
          <Form.Item name="content" label="Ghi chú">
            <Input.TextArea placeholder="Ví dụ: Thưởng hoàn thành dự án đúng hạn" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SalaryManagementPage;
