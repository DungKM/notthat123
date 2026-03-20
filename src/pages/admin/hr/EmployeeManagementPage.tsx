import React, { useMemo, useState } from 'react';
import {
  ProTable,
  ProColumns,
  ModalForm,
  ProFormDigit,
  ProFormSelect,
  ProFormTextArea,
  ProFormDateRangePicker,
  ProFormDatePicker,
  ProFormUploadButton as RawProFormUploadButton,
} from '@ant-design/pro-components';

// Workaround: ProFormUploadButton bị export sai type (ForwardRefRenderFunction thay vì JSX component)
const SafeUploadButton = RawProFormUploadButton as unknown as React.FC<any>;
import { Employee, User, AttendanceRecord } from '@/src/types';
import { MOCK_EMPLOYEES, MOCK_ATTENDANCE } from '@/src/mockData';
import { Tag, Button, Space, Typography, Modal, message, DatePicker, Card, Statistic, Row, Col, Image } from 'antd';
import dayjs from 'dayjs';
import { HistoryOutlined, CreditCardOutlined, PlusOutlined, EyeOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface EmployeeManagementProps {
  currentUser: User;
}

interface RewardPenaltyRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  position: string;
  type: 'Thưởng' | 'Phạt';
  amount: number;
  projectId: string;
  projectName: string;
  content: string;
  createdAt: string;
}

interface PaymentHistoryRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  amountPaid: number;
  paymentDate: string;
  note?: string;
  proof?: string;
}

const MOCK_PROJECT_OPTIONS = [
  { label: 'Dự án 1 - Thi công nội thất Vinhomes Grand Park', value: 'p1' },
  { label: 'Dự án 2 - Cải tạo văn phòng Quận 1', value: 'p2' },
  { label: 'Dự án 3 - Showroom Thủ Đức', value: 'p3' },
];

const MOCK_REWARD_PENALTY: RewardPenaltyRecord[] = [
  {
    id: 'rp-1',
    employeeId: '1',
    employeeName: 'Nguyễn Văn A',
    position: 'Bộ phận công trình',
    type: 'Thưởng',
    amount: 1000000,
    projectId: 'p1',
    projectName: 'Dự án 1 - Thi công nội thất Vinhomes Grand Park',
    content: 'Hoàn thành dự án đúng tiến độ',
    createdAt: '2024-03-01 09:00:00',
  },
  {
    id: 'rp-2',
    employeeId: '1',
    employeeName: 'Nguyễn Văn A',
    position: 'Bộ phận công trình',
    type: 'Phạt',
    amount: 300000,
    projectId: 'p2',
    projectName: 'Dự án 2 - Cải tạo văn phòng Quận 1',
    content: 'Đi trễ nhiều lần khi triển khai công việc',
    createdAt: '2024-03-05 14:00:00',
  },
  {
    id: 'rp-3',
    employeeId: '2',
    employeeName: 'Trần Thị B',
    position: 'Kế toán',
    type: 'Thưởng',
    amount: 500000,
    projectId: 'p1',
    projectName: 'Dự án 1 - Thi công nội thất Vinhomes Grand Park',
    content: 'Hỗ trợ hồ sơ quyết toán nhanh và chính xác',
    createdAt: '2024-03-02 10:30:00',
  },
];

const EmployeeManagementPage: React.FC<EmployeeManagementProps> = ({ currentUser }) => {
  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [rewardPenaltyRecords, setRewardPenaltyRecords] =
    useState<RewardPenaltyRecord[]>(MOCK_REWARD_PENALTY);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryRecord[]>([]);

  const [detailVisible, setDetailVisible] = useState(false);
  const [rewardPenaltyVisible, setRewardPenaltyVisible] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [paymentVisible, setPaymentVisible] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [historyRange, setHistoryRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>([
    dayjs().startOf('month'),
    dayjs().endOf('month'),
  ]);

  const employeeOptions = useMemo(
    () =>
      employees.map((item) => ({
        label: item.name,
        value: String(item.id),
      })),
    [employees]
  );

  const getPosition = (employee: Employee) => {
    return (employee as any).position || (employee as any).department || 'Nhân viên';
  };

  const employeeColumns: ProColumns<Employee>[] = [
    {
      title: 'Nhân viên',
      dataIndex: 'name',
      copyable: true,
      fixed: 'left',
      width: 180,
    },
    {
      title: 'Chức vụ',
      key: 'position',
      hideInSearch: true,
      render: (_, record) => getPosition(record),
    },
    {
      title: 'Lương cơ bản',
      dataIndex: 'baseSalary',
      hideInSearch: true,
      render: (_, record) => (
        <Text>
          {new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
          }).format(record.baseSalary ?? 0)}
        </Text>
      ),
    },
    {
      title: 'Thưởng',
      dataIndex: 'bonus',
      hideInSearch: true,
      render: (_, record) => (
        <Text type="success">
          +{new Intl.NumberFormat('vi-VN').format(record.bonus ?? 0)}
        </Text>
      ),
    },
    {
      title: 'Phạt',
      dataIndex: 'penalty',
      hideInSearch: true,
      render: (_, record) => (
        <Text type="danger">
          -{new Intl.NumberFormat('vi-VN').format(record.penalty ?? 0)}
        </Text>
      ),
    },
    {
      title: 'Tổng ứng',
      dataIndex: 'advance',
      hideInSearch: true,
      render: (_, record) => (
        <Space>
          <Text type="warning">
            {new Intl.NumberFormat('vi-VN').format(record.advance ?? 0)}
          </Text>
          {(record.advance ?? 0) > 0 && <Tag color="orange">Đã ứng</Tag>}
        </Space>
      ),
    },
    {
      title: 'Thực lĩnh',
      key: 'totalSalary',
      hideInSearch: true,
      render: (_, record) => {
        const total =
          (record.baseSalary ?? 0) +
          (record.bonus ?? 0) -
          (record.penalty ?? 0) -
          (record.advance ?? 0);

        return (
          <Text strong style={{ fontSize: 16, color: total >= 0 ? '#52c41a' : '#ff4d4f' }}>
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
            }).format(total)}
          </Text>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      valueType: 'option',
      width: 250,
      render: (_, record) => [
        <Button
          key="detail"
          type="link"
          size="large"
          title='Xem chi tiết'
          icon={<EyeOutlined />}
          onClick={() => {
            setSelectedEmployee(record);
            setDetailVisible(true);
          }}
        />,
        <Button
          key="history"
          type="link"
          size="large"
          title='Xem lịch sử'
          icon={<HistoryOutlined />}
          onClick={() => {
            setSelectedEmployee(record);
            setHistoryVisible(true);
          }}
        />,
        <Button
          key="payment"
          type="link"
          size="large"
          title='Thanh toán'
          icon={<CreditCardOutlined />}
          style={{ color: '#faad14' }}
          onClick={() => {
            setSelectedEmployee(record);
            setPaymentVisible(true);
          }}
        />,
      ],
    },
  ];

  const detailColumns: ProColumns<RewardPenaltyRecord>[] = [
    {
      title: 'Ngày',
      dataIndex: 'createdAt',
      hideInSearch: true,
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      hideInSearch: true,
      render: (_, record) =>
        record.type === 'Thưởng' ? (
          <Tag color="green">Thưởng</Tag>
        ) : (
          <Tag color="red">Phạt</Tag>
        ),
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      hideInSearch: true,
      render: (_, record) => (
        <Text type={record.type === 'Thưởng' ? 'success' : 'danger'}>
          {record.type === 'Thưởng' ? '+' : '-'}
          {new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
          }).format(record.amount)}
        </Text>
      ),
    },
    {
      title: 'Dự án',
      dataIndex: 'projectName',
      hideInSearch: true,
    },
    {
      title: 'Nội dung',
      dataIndex: 'content',
      hideInSearch: true,
    },
  ];

  const selectedEmployeeHistory = useMemo(() => {
    if (!selectedEmployee) return [];
    return rewardPenaltyRecords.filter(
      (item) => String(item.employeeId) === String(selectedEmployee.id)
    );
  }, [rewardPenaltyRecords, selectedEmployee]);

  const paymentHistoryColumns: ProColumns<PaymentHistoryRecord>[] = [
    {
      title: 'Ngày thanh toán',
      dataIndex: 'paymentDate',
      hideInSearch: true,
      render: (_, record) => dayjs(record.paymentDate).format('DD/MM/YYYY'),
    },
    {
      title: 'Số tiền thanh toán',
      dataIndex: 'amountPaid',
      hideInSearch: true,
      render: (_, record) => (
        <Text strong style={{ color: '#1890ff' }}>
          {new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
          }).format(record.amountPaid)}
        </Text>
      ),
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      hideInSearch: true,
    },
    {
      title: 'Ảnh chứng từ',
      dataIndex: 'proof',
      hideInSearch: true,
      render: (val) =>
        val ? (
          <Image
            src={String(val)}
            width={40}
            height={40}
            style={{ borderRadius: 4, objectFit: 'cover' }}
          />
        ) : (
          '-'
        ),
    },
  ];

  const selectedEmployeePaymentHistory = useMemo(() => {
    if (!selectedEmployee) return [];
    return paymentHistory.filter(
      (item) => String(item.employeeId) === String(selectedEmployee.id)
    );
  }, [paymentHistory, selectedEmployee]);

  // Logic tính toán Lịch sử chấm công (Công & OT)
  const attendanceHistory = useMemo(() => {
    if (!selectedEmployee || !historyRange) return { list: [], totalWorkDays: 0, totalOTDays: 0 };

    const list = MOCK_ATTENDANCE.filter((item) => {
      const isEmployee = String(item.staffId) === String(selectedEmployee.id);
      if (!isEmployee) return false;

      const date = dayjs(item.date);
      return date.isAfter(historyRange[0].subtract(1, 'day')) &&
        date.isBefore(historyRange[1].add(1, 'day'));
    });

    const totalWorkDays = list.reduce((sum, item) => sum + (item.workDay || 0), 0);
    const totalOTDays = list.reduce((sum, item) => sum + (item.otDays || 0), 0);

    return { list, totalWorkDays, totalOTDays };
  }, [selectedEmployee, historyRange]);

  const handleSubmitRewardPenalty = async (values: any) => {
    const employee = employees.find((item) => String(item.id) === String(values.employeeId));
    const project = MOCK_PROJECT_OPTIONS.find((item) => item.value === values.projectId);

    if (!employee || !project) {
      message.error('Không tìm thấy nhân viên hoặc dự án');
      return false;
    }

    const amount = Number(values.amount || 0);
    const type = values.type as 'Thưởng' | 'Phạt';

    const newRecord: RewardPenaltyRecord = {
      id: Math.random().toString(36).slice(2, 11),
      employeeId: String(employee.id),
      employeeName: employee.name,
      position: getPosition(employee),
      type,
      amount,
      projectId: project.value,
      projectName: project.label,
      content: values.content,
      createdAt: new Date().toLocaleString('vi-VN'),
    };

    setRewardPenaltyRecords((prev) => [newRecord, ...prev]);

    setEmployees((prev) =>
      prev.map((item) => {
        if (String(item.id) !== String(employee.id)) return item;

        if (type === 'Thưởng') {
          return {
            ...item,
            bonus: Number(item.bonus ?? 0) + amount,
          };
        }

        return {
          ...item,
          penalty: Number(item.penalty ?? 0) + amount,
        };
      })
    );

    message.success(`${type} thành công`);
    return true;
  };

  const handleFinishPayment = async (values: any) => {
    if (!selectedEmployee) return false;

    const amountPaid = Number(values.amountPaid || 0);
    const paymentDate: string = values.paymentDate
      ? (values.paymentDate as dayjs.Dayjs).toISOString()
      : new Date().toISOString();
    const note: string | undefined = values.note;
    const proof: string | undefined =
      values.proof?.[0]?.url ||
      values.proof?.[0]?.thumbUrl ||
      values.proof?.[0]?.response?.url;

    const newPayment: PaymentHistoryRecord = {
      id: Math.random().toString(36).slice(2, 11),
      employeeId: String(selectedEmployee.id),
      employeeName: selectedEmployee.name,
      amountPaid,
      paymentDate,
      note,
      proof,
    };

    setPaymentHistory((prev) => [newPayment, ...prev]);

    // Cập nhật state nhân viên: reset về 0
    setEmployees((prev) =>
      prev.map((item) => {
        if (item.id === selectedEmployee.id) {
          return {
            ...item,
            bonus: 0,
            penalty: 0,
            advance: 0,
          };
        }
        return item;
      })
    );

    message.success(`Đã thanh toán lương cho ${selectedEmployee.name}`);
    setPaymentVisible(false);
    return true;
  };

  return (
    <div>
      <ProTable<Employee>
        headerTitle="Bảng lương & Thưởng phạt"
        columns={employeeColumns}
        dataSource={employees}
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1200 }}
        toolBarRender={() => [
          <Button key="reward-penalty" type="primary" onClick={() => setRewardPenaltyVisible(true)}>
            Thêm thưởng / phạt
          </Button>,
        ]}
      />

      <Modal
        title={`Lịch sử thưởng / phạt - ${selectedEmployee?.name ?? ''}`}
        open={detailVisible}
        onCancel={() => {
          setDetailVisible(false);
          setSelectedEmployee(null);
        }}
        footer={null}
        width={900}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <ProTable<RewardPenaltyRecord>
            columns={detailColumns}
            dataSource={selectedEmployeeHistory}
            rowKey="id"
            search={false}
            pagination={{ pageSize: 5 }}
            options={false}
          />

          <ProTable<PaymentHistoryRecord>
            columns={paymentHistoryColumns}
            dataSource={selectedEmployeePaymentHistory}
            rowKey="id"
            search={false}
            pagination={{ pageSize: 5 }}
            options={false}
            headerTitle="Lịch sử thanh toán lương"
          />
        </Space>
      </Modal>

      <ModalForm
        title="Thêm thưởng / phạt"
        open={rewardPenaltyVisible}
        modalProps={{
          destroyOnClose: true,
          onCancel: () => setRewardPenaltyVisible(false),
        }}
        onOpenChange={setRewardPenaltyVisible}
        onFinish={handleSubmitRewardPenalty}
      >
        <ProFormSelect
          name="employeeId"
          label="Nhân viên"
          options={employeeOptions}
          rules={[{ required: true, message: 'Vui lòng chọn nhân viên' }]}
        />

        <ProFormSelect
          name="type"
          label="Loại"
          options={[
            { label: 'Thưởng', value: 'Thưởng' },
            { label: 'Phạt', value: 'Phạt' },
          ]}
          rules={[{ required: true, message: 'Vui lòng chọn loại' }]}
        />

        <ProFormDigit
          name="amount"
          label="Số tiền"
          min={0}
          fieldProps={{ precision: 0 }}
          rules={[{ required: true, message: 'Vui lòng nhập số tiền' }]}
        />

        <ProFormSelect
          name="projectId"
          label="Dự án"
          options={MOCK_PROJECT_OPTIONS}
          rules={[{ required: true, message: 'Vui lòng chọn dự án' }]}
        />

        <ProFormTextArea
          name="content"
          label="Nội dung thưởng / phạt"
          rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
        />
      </ModalForm>

      {/* Modal Lịch sử Chấm công */}
      <Modal
        title={`Lịch sử công & OT - ${selectedEmployee?.name ?? ''}`}
        open={historyVisible}
        onCancel={() => {
          setHistoryVisible(false);
          setSelectedEmployee(null);
        }}
        footer={null}
        width={800}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Card size="small">
            <Row gutter={16} align="middle">
              <Col span={12}>
                <Text strong>Chọn khoảng thời gian:</Text>
                <br />
                <DatePicker.RangePicker
                  value={historyRange}
                  onChange={(val) => setHistoryRange(val as any)}
                  style={{ width: '100%', marginTop: 8 }}
                  format="DD/MM/YYYY"
                />
              </Col>
              <Col span={6}>
                <Statistic title="Tổng Công" value={attendanceHistory.totalWorkDays} precision={2} suffix="công" />
              </Col>
              <Col span={6}>
                <Statistic title="Tổng OT" value={attendanceHistory.totalOTDays} precision={2} suffix="công" />
              </Col>
            </Row>
          </Card>

          <ProTable<AttendanceRecord>
            columns={[
              { title: 'Ngày', dataIndex: 'date', valueType: 'date' },
              { title: 'Công chính', dataIndex: 'workDay' },
              { title: 'Tăng ca (OT)', dataIndex: 'otDays' },
              {
                title: 'Chi tiết',
                render: (_, record) => `${record.startTime} - ${record.endTime}`
              }
            ]}
            dataSource={attendanceHistory.list}
            rowKey="id"
            search={false}
            pagination={{ pageSize: 5 }}
            options={false}
          />
        </Space>
      </Modal>

      {/* Modal Thanh toán Lương */}
      <ModalForm
        title={`Thanh toán lương - ${selectedEmployee?.name ?? ''}`}
        open={paymentVisible}
        onOpenChange={setPaymentVisible}
        onFinish={handleFinishPayment}
        modalProps={{ destroyOnClose: true }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Statistic
              title="Thực lĩnh hiện tại"
              value={
                (selectedEmployee?.baseSalary ?? 0) +
                (selectedEmployee?.bonus ?? 0) -
                (selectedEmployee?.penalty ?? 0) -
                (selectedEmployee?.advance ?? 0)
              }
              suffix="VND"
            />
          </Col>
          <Col span={12}>
            <ProFormDigit
              name="amountPaid"
              label="Số tiền thanh toán"
              rules={[{ required: true }]}
              fieldProps={{ precision: 0 }}
              initialValue={
                (selectedEmployee?.baseSalary ?? 0) +
                (selectedEmployee?.bonus ?? 0) -
                (selectedEmployee?.penalty ?? 0) -
                (selectedEmployee?.advance ?? 0)
              }
            />
          </Col>
        </Row>
        <ProFormDatePicker
          name="paymentDate"
          label="Ngày thanh toán"
          rules={[{ required: true }]}
          initialValue={dayjs()}
        />
        <ProFormTextArea name="note" label="Ghi chú" placeholder="Ví dụ: Chuyển khoản lương tháng 3" />
        <SafeUploadButton
          name="proof"
          label="Ảnh chứng từ / bill chuyển khoản"
          title="Tải ảnh lên"
          max={1}
          action="/api/upload" // Giả lập
        />
        <Text type="secondary" style={{ fontStyle: 'italic' }}>
          * Lưu ý: Khi xác nhận thanh toán, các khoản Thưởng, Phạt và Tiền ứng sẽ được đưa về 0.
        </Text>
      </ModalForm>
    </div>
  );
};

export default EmployeeManagementPage;