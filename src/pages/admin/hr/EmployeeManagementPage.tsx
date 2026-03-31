import React, { useMemo, useRef, useState } from 'react';
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
import { MOCK_ATTENDANCE } from '@/src/mockData';
import { Tag, Button, Space, Typography, Modal, message, DatePicker, Card, Statistic, Row, Col, Image } from 'antd';
import { useSalaryService, useSalaryActionService, useProjectService, useSettingService, useAttendanceService } from '@/src/api/services';
import type { ActionType } from '@ant-design/pro-components';
import dayjs from 'dayjs';
import { HistoryOutlined, CreditCardOutlined, PlusOutlined, EyeOutlined, EditOutlined, SettingOutlined } from '@ant-design/icons';

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
  const actionRef = useRef<ActionType>(null);
  const [month, setMonth] = useState(dayjs().format('YYYY-MM'));
  const { request: salaryRequest } = useSalaryService();
  const { request: salaryActionRequest } = useSalaryActionService();
  const { request: projectRequest } = useProjectService();
  const { request: settingRequest } = useSettingService();
  const { request: attendanceRequest } = useAttendanceService();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [projectOptions, setProjectOptions] = useState<{ label: string; value: string }[]>([]);

  // Load danh sách dự án đã duyệt
  React.useEffect(() => {
    projectRequest('GET', '', null, { status: 'APPROVED', limit: 1000 })
      .then((res) => {
        const data: any[] = res.data || [];
        setProjectOptions(data.map((p) => ({
          label: p.name || p.title || p.code || 'Dự án',
          value: p.id || p._id,
        })));
      })
      .catch(() => { });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [rewardPenaltyRecords, setRewardPenaltyRecords] = useState<RewardPenaltyRecord[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [detailVisible, setDetailVisible] = useState(false);
  const [rewardPenaltyVisible, setRewardPenaltyVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [paymentVisible, setPaymentVisible] = useState(false);
  const [editSalaryVisible, setEditSalaryVisible] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [historyRange, setHistoryRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>([
    dayjs().startOf('month'),
    dayjs().endOf('month'),
  ]);

  React.useEffect(() => {
    if (detailVisible && selectedEmployee) {
      setLoadingHistory(true);
      salaryActionRequest('GET', `/history/${selectedEmployee.id}`)
        .then((res: any) => {
          if (res.success && res.data) {
            const mappedAdjustments = (res.data.adjustments || []).map((item: any, idx: number) => ({
              id: `adj-${idx}-${item.date}`,
              employeeId: selectedEmployee.id,
              employeeName: selectedEmployee.name,
              position: getPosition(selectedEmployee),
              type: item.type,
              amount: item.amount,
              projectId: '',
              projectName: item.projectName,
              content: item.content,
              createdAt: item.date ? dayjs(item.date).format('DD/MM/YYYY HH:mm') : '',
            }));

            const mappedPayments = (res.data.payments || []).map((item: any, idx: number) => ({
              id: `pay-${idx}-${item.date}`,
              employeeId: selectedEmployee.id,
              employeeName: selectedEmployee.name,
              amountPaid: item.amount,
              paymentDate: item.date,
              note: item.note,
              proof: item.billImage,
            }));

            setRewardPenaltyRecords(mappedAdjustments);
            setPaymentHistory(mappedPayments);
          }
        })
        .catch((err: any) => {
          console.error("Lỗi lấy lịch sử:", err);
        })
        .finally(() => {
          setLoadingHistory(false);
        });
    }
  }, [detailVisible, selectedEmployee, salaryActionRequest]);

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
      title: 'Số tiền đang có',
      key: 'currentAmount',
      hideInSearch: true,
      render: (_, record) => {
        const total = record.currentAmount ?? 0;

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
        // <Button
        //   key="edit-salary"
        //   type="link"
        //   size="large"
        //   title="Cập nhật lương cơ bản"
        //   icon={<EditOutlined />}
        //   style={{ color: '#1890ff' }}
        //   onClick={() => {
        //     setSelectedEmployee(record);
        //     setEditSalaryVisible(true);
        //   }}
        // />,
        <Button
          key="payment"
          type="link"
          size="large"
          title="Thanh toán"
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

  const [attendanceHistory, setAttendanceHistory] = useState<{
    list: any[];
    totalWorkDays: number;
    totalOTDays: number;
  }>({ list: [], totalWorkDays: 0, totalOTDays: 0 });
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  React.useEffect(() => {
    if (historyVisible && selectedEmployee && historyRange && historyRange[0] && historyRange[1]) {
      setLoadingAttendance(true);
      attendanceRequest('GET', '/history', null, {
        userId: selectedEmployee.id,
        startDate: historyRange[0].format('YYYY-MM-DD'),
        endDate: historyRange[1].format('YYYY-MM-DD'),
      })
        .then((res: any) => {
          if (res.success && res.data) {
            setAttendanceHistory({
              list: res.data.records || [],
              totalWorkDays: res.data.summary?.totalWorkUnits || 0,
              totalOTDays: res.data.summary?.totalOTUnits || 0,
            });
          }
        })
        .finally(() => {
          setLoadingAttendance(false);
        });
    }
  }, [historyVisible, selectedEmployee, historyRange, attendanceRequest]);

  const handleUpdateBaseSalary = async (values: any) => {
    if (!selectedEmployee) return false;
    try {
      // PATCH /salary/base-salary - Cập nhật lương cơ bản
      await salaryActionRequest('PATCH', '/base-salary', {
        userId: selectedEmployee.id,
        baseSalary: Number(values.baseSalary || 0),
      });
      message.success(`Đã cập nhật lương cơ bản cho ${selectedEmployee.name}`);
      setEditSalaryVisible(false);
      actionRef.current?.reload();
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmitRewardPenalty = async (values: any) => {
    const employee = employees.find((item) => String(item.id) === String(values.employeeId));
    if (!employee) {
      message.error('Không tìm thấy nhân viên');
      return false;
    }
    try {
      // POST /salary - Thêm thưởng/phạt/tạm ứng vào lịch sử
      await salaryActionRequest('POST', '', {
        userId: employee.id,
        month,
        type: values.type,
        amount: Number(values.amount || 0),
        content: values.content,
        projectId: values.projectId,
      });
      message.success(`${values.type} thành công`);
      actionRef.current?.reload();
      return true;
    } catch {
      return false;
    }
  };

  const handleFinishPayment = async (values: any) => {
    if (!selectedEmployee) return false;

    try {
      const amount = Number(values.amount || 0);
      const fileList = values.billImage || [];
      const billFile = fileList[0]?.originFileObj || fileList[0];

      if (billFile instanceof File) {
        const formData = new FormData();
        formData.append('userId', String(selectedEmployee.id));
        formData.append('month', month);

        // Gửi amount ở dạng nguyên thuỷ để Axios serialize với paramsSerializer hoặc BE middleware tự bóc
        formData.append('amount', amount as any);

        if (values.date) {
          formData.append('date', dayjs(values.date).format('YYYY-MM-DD'));
        }
        if (values.note) {
          formData.append('note', values.note);
        }
        formData.append('billImage', billFile);

        // Bỏ set headers cứng, để axios wrapper tự fill boundary của form-data
        await salaryActionRequest('POST', '/pay', formData);
      } else {
        await salaryActionRequest('POST', '/pay', {
          userId: selectedEmployee.id,
          month,
          amount,
          date: values.date ? dayjs(values.date).format('YYYY-MM-DD') : undefined,
          note: values.note,
        });
      }

      message.success(`Đã thanh toán lương cho ${selectedEmployee.name}`);
      setPaymentVisible(false);
      actionRef.current?.reload();
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div>
      <ProTable<Employee>
        actionRef={actionRef}
        headerTitle="Bảng lương & Thưởng phạt"
        columns={employeeColumns}
        rowKey="id"
        search={false}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1200 }}
        request={async () => {
          try {
            const res = await salaryRequest('GET', '', null, { month });
            const raw: any[] = res.data || [];
            const mapped: Employee[] = raw.map((r: any) => ({
              id: r.userId?.id || r.userId,
              name: r.userId?.name || '',
              role: r.userId?.role || '',
              baseSalary: r.userId?.baseSalary || 0,
              bonus: r.bonus || 0,
              penalty: r.penalty || 0,
              advance: r.advance || 0,
              totalSalary: r.netSalary || 0,
              currentAmount: r.currentAmount || 0,
            }));
            setEmployees(mapped);
            return { data: mapped, success: true, total: mapped.length };
          } catch {
            return { data: [], success: false, total: 0 };
          }
        }}
        toolBarRender={() => [
          <DatePicker
            key="month"
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
          />,
          <Button key="settings" onClick={() => setSettingsVisible(true)} icon={<SettingOutlined />}>
            Cài đặt giờ công
          </Button>,
          <Button key="reward-penalty" type="primary" onClick={() => setRewardPenaltyVisible(true)}>
            Thêm thưởng / phạt
          </Button>,
        ]}
      />

      <ModalForm
        title="Cài đặt hệ số giờ công"
        open={settingsVisible}
        onOpenChange={setSettingsVisible}
        modalProps={{ destroyOnClose: true }}
        request={async () => {
          try {
            const res = await settingRequest('GET', '/work-hours');
            if (res && res.success && res.data) {
              return res.data;
            }
            return { hoursPerWorkUnit: 8, hoursPerOTUnit: 4 };
          } catch {
            return { hoursPerWorkUnit: 8, hoursPerOTUnit: 4 };
          }
        }}
        onFinish={async (values) => {
          try {
            await settingRequest('PATCH', '/work-hours', {
              hoursPerWorkUnit: Number(values.hoursPerWorkUnit),
              hoursPerOTUnit: Number(values.hoursPerOTUnit),
            });
            message.success('Cập nhật cài đặt giờ công thành công');
            setSettingsVisible(false);
            return true;
          } catch {
            message.error('Có lỗi xảy ra khi cập nhật cài đặt');
            return false;
          }
        }}
      >
        <ProFormDigit
          name="hoursPerWorkUnit"
          label="Số giờ / 1 công chuẩn"
          min={1}
          max={24}
          fieldProps={{ precision: 1 }}
          rules={[{ required: true, message: 'Vui lòng nhập số giờ' }]}
        />
        <ProFormDigit
          name="hoursPerOTUnit"
          label="Số giờ / 1 công OT"
          min={1}
          max={24}
          fieldProps={{ precision: 1 }}
          rules={[{ required: true, message: 'Vui lòng nhập số giờ' }]}
        />
      </ModalForm>

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
            loading={loadingHistory}
            columns={detailColumns}
            dataSource={selectedEmployeeHistory}
            rowKey="id"
            search={false}
            pagination={{ pageSize: 5 }}
            options={false}
          />

          <ProTable<PaymentHistoryRecord>
            loading={loadingHistory}
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
          fieldProps={{
            precision: 0,
            addonAfter: 'VNĐ',
            formatter: (val) => val ? String(val).replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '',
            parser: (val) => val ? Number(val.replace(/\./g, '')) : 0,
          }}
          rules={[{ required: true, message: 'Vui lòng nhập số tiền' }]}
        />

        <ProFormSelect
          name="projectId"
          label="Dự án"
          options={projectOptions}
          placeholder="Chọn dự án đã duyệt"
          showSearch
          rules={[{ required: true, message: 'Vui lòng chọn dự án' }]}
        />

        <ProFormTextArea
          name="content"
          label="Nội dung thưởng / phạt"
          rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
        />
      </ModalForm>

      {/* Modal Cập nhật lương cơ bản */}
      <ModalForm
        title={`Cập nhật lương cơ bản - ${selectedEmployee?.name ?? ''}`}
        open={editSalaryVisible}
        modalProps={{
          destroyOnClose: true,
          onCancel: () => setEditSalaryVisible(false),
        }}
        initialValues={{ baseSalary: selectedEmployee?.baseSalary }}
        onOpenChange={setEditSalaryVisible}
        onFinish={handleUpdateBaseSalary}
      >
        <ProFormDigit
          name="baseSalary"
          label="Lương cơ bản (VNĐ)"
          min={0}
          fieldProps={{
            precision: 0,
            addonAfter: 'VNĐ',
            formatter: (val) => val ? String(val).replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '',
            parser: (val) => val ? Number(val.replace(/\./g, '')) : 0,
          }}
          rules={[{ required: true, message: 'Vui lòng nhập lương cơ bản' }]}
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

          <ProTable<any>
            loading={loadingAttendance}
            columns={[
              {
                title: 'Ngày',
                dataIndex: 'date',
                render: (_, record: any) => dayjs(record.date).format('DD/MM/YYYY')
              },
              {
                title: 'Dự án',
                dataIndex: 'projectName',
                render: (_, record: any) => record.projectId?.name || '-'
              },
              {
                title: 'Giờ làm / OT',
                render: (_, record: any) => `${record.workHours || 0}h / ${record.otHours || 0}h`
              },
              {
                title: 'Công chính',
                dataIndex: 'workUnits',
                render: (_, record: any) => record.workUnits || 0
              },
              {
                title: 'Công OT',
                dataIndex: 'otUnits',
                render: (_, record: any) => record.otUnits || 0
              }
            ]}
            dataSource={attendanceHistory.list}
            rowKey={(record: any) => record.id || Math.random().toString()}
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
              title="Số tiền đang có"
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
              name="amount"
              label="Số tiền thanh toán"
              rules={[{ required: true }]}
              fieldProps={{
                precision: 0,
                addonAfter: 'VNĐ',
                formatter: (val: any) => val ? String(val).replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '',
                parser: (val: any) => val ? Number(val.replace(/\./g, '')) : 0,
              }}
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
          name="date"
          label="Ngày thanh toán"
          rules={[{ required: true }]}
          initialValue={dayjs()}
        />
        <ProFormTextArea name="note" label="Ghi chú" placeholder="Ví dụ: Chuyển khoản lương tháng 3" />
        <SafeUploadButton
          name="billImage"
          label="Ảnh chứng từ / bill chuyển khoản"
          title="Tải ảnh lên"
          max={1}
          fieldProps={{
            beforeUpload: () => false,
          }}
        />
        <Text type="secondary" style={{ fontStyle: 'italic' }}>
          * Lưu ý: Khi xác nhận thanh toán, các khoản Thưởng, Phạt và Tiền ứng sẽ được đưa về 0.
        </Text>
      </ModalForm>
    </div>
  );
};

export default EmployeeManagementPage;