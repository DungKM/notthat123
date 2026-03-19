import React, { useMemo, useState } from 'react';
import {
  ProTable,
  ProColumns,
  ModalForm,
  ProFormDatePicker,
  ProFormDigit,
  ProFormSelect,
} from '@ant-design/pro-components';
import { AttendanceRecord } from '@/src/types';
import { Button, Card, Col, Row, Statistic, Tag, message } from 'antd';
import { PlusOutlined, FieldTimeOutlined, DollarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAuth } from '@/src/auth/hooks/useAuth';

interface ProjectOption {
  label: string;
  value: string;
  dailyRate: number; // tiền 1 công hành chính
  otRate: number; // tiền 1 công tăng ca
}

interface AttendanceWorkRecord extends AttendanceRecord {
  projectId: string;
  projectName: string;
  workingDays: number;
  otDays: number;
  amount: number;
}

const MOCK_PROJECT_OPTIONS: ProjectOption[] = [
  { label: 'Thi công nội thất Vinhomes Grand Park', value: 'p1', dailyRate: 400000, otRate: 600000 },
  { label: 'Cải tạo văn phòng Quận 1', value: 'p2', dailyRate: 450000, otRate: 650000 },
  { label: 'Lắp đặt showroom Thủ Đức', value: 'p3', dailyRate: 500000, otRate: 700000 },
];

const MOCK_ATTENDANCE_WORK: AttendanceWorkRecord[] = [
  {
    id: '1',
    staffId: '4',
    date: '2024-03-01',
    startTime: '08:00',
    endTime: '17:00',
    workDay: 1,
    projectId: 'p1',
    projectName: 'Thi công nội thất Vinhomes Grand Park',
    workingDays: 1,
    otDays: 0.25,
    amount: 550000,
  },
  {
    id: '2',
    staffId: '4',
    date: '2024-03-02',
    startTime: '08:00',
    endTime: '17:00',
    workDay: 1,
    projectId: 'p2',
    projectName: 'Cải tạo văn phòng Quận 1',
    workingDays: 0.75,
    otDays: 0.1,
    amount: 350000,
  },
];

const AttendancePage: React.FC = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<AttendanceWorkRecord[]>(
    user ? MOCK_ATTENDANCE_WORK.filter((r) => String(r.staffId) === String(user.id)) : []
  );
  const [open, setOpen] = useState(false);

  const totalWorkingHours = useMemo(
    () => records.reduce((sum, item) => sum + Number(item.workingDays || 0), 0),
    [records]
  );

  const totalOtHours = useMemo(
    () => records.reduce((sum, item) => sum + Number(item.otDays || 0), 0),
    [records]
  );

  const totalAmount = useMemo(
    () => records.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [records]
  );

  if (!user) return null;

  const attendanceColumns: ProColumns<AttendanceWorkRecord>[] = [
    {
      title: 'Ngày tháng năm',
      dataIndex: 'date',
      valueType: 'date',
      render: (_, record) => dayjs(record.date).format('DD/MM/YYYY'),
    },
    {
      title: 'Công hành chính',
      dataIndex: 'workingDays',
      hideInSearch: true,
      render: (_, record) => (
        <Tag color="green" icon={<FieldTimeOutlined />}>
          {record.workingDays} công
        </Tag>
      ),
    },
    {
      title: 'Công tăng ca',
      dataIndex: 'otDays',
      hideInSearch: true,
      render: (_, record) =>
        Number(record.otDays || 0) > 0 ? (
          <Tag color="orange" icon={<FieldTimeOutlined />}>
            {record.otDays} công
          </Tag>
        ) : (
          '-'
        ),
    },
    {
      title: 'Thành tiền',
      dataIndex: 'amount',
      hideInSearch: true,
      render: (_, record) => (
        <span style={{ fontWeight: 700, color: '#52c41a' }}>
          {new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
          }).format(Number(record.amount || 0))}
        </span>
      ),
    },
  ];

  const handleSubmitAttendance = async (values: any) => {
    const selectedProject = MOCK_PROJECT_OPTIONS.find((p) => p.value === values.projectId);

    if (!selectedProject) {
      message.error('Không tìm thấy dự án');
      return false;
    }

    const workingDays = Number(values.workingDays || 0);
    const otDays = Number(values.otDays || 0);

    const amount = workingDays * selectedProject.dailyRate + otDays * selectedProject.otRate;

    const newRecord: AttendanceWorkRecord = {
      id: Math.random().toString(36).slice(2, 11),
      staffId: String(user.id),
      date: dayjs(values.date).format('YYYY-MM-DD'),
      startTime: '',
      endTime: '',
      workDay: 0,
      projectId: selectedProject.value,
      projectName: selectedProject.label,
      workingDays,
      otDays,
      amount,
    };

    setRecords((prev) => [newRecord, ...prev]);
    message.success('Chấm công thành công');
    return true;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Card
        title="Chấm công theo ngày"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>
            Chấm công hôm nay
          </Button>
        }
        styles={{ body: { padding: '12px 16px' } }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Statistic title="Tổng công hành chính" value={totalWorkingHours} />
          </Col>
          <Col xs={24} sm={8}>
            <Statistic title="Tổng công OT" value={totalOtHours} />
          </Col>
          <Col xs={24} sm={8}>
            <Statistic
              title="Tổng công đạt được"
              value={totalWorkingHours + totalOtHours}
            />
          </Col>
        </Row>
      </Card>

      <Card title="Lịch sử chấm công" styles={{ body: { padding: 0 } }}>
        <ProTable<AttendanceWorkRecord>
          columns={attendanceColumns}
          dataSource={records}
          rowKey="id"
          search={false}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 'max-content' }}
          options={{
            density: false,
            fullScreen: false,
            reload: false,
            setting: false,
          }}
        />
      </Card>

      <ModalForm
        title="Thêm chấm công"
        open={open}
        modalProps={{
          destroyOnClose: true,
          onCancel: () => setOpen(false),
        }}
        onOpenChange={setOpen}
        onFinish={handleSubmitAttendance}
      >
        <ProFormDatePicker
          name="date"
          label="Ngày tháng năm"
          rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
        />

        <ProFormSelect
          name="projectId"
          label="Dự án"
          options={MOCK_PROJECT_OPTIONS}
          rules={[{ required: true, message: 'Vui lòng chọn dự án' }]}
        />

        <ProFormDigit
          name="workingDays"
          label="số giờ hành chính làm được"
          min={0}
          max={1}
          fieldProps={{ precision: 2 }}
          rules={[{ required: true, message: 'Vui lòng nhập số giờ làm' }]}
        />

        <ProFormDigit
          name="otDays"
          label="số giờ tăng ca"
          min={0}
          max={1}
          initialValue={0}
          fieldProps={{ precision: 2 }}
        />
      </ModalForm>
    </div>
  );
};

export default AttendancePage;