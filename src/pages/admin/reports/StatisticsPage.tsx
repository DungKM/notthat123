import React, { useState } from "react";
import {
  ProTable,
  ProColumns,
  ProCard,
  ModalForm,
  ProFormDatePicker,
  ProFormDigit,
  ProFormSelect,
  ProFormUploadButton as RawProFormUploadButton,
  ProFormTextArea,
} from "@ant-design/pro-components";
import { AttendanceRecord, AdvanceRequest } from "@/src/types";
import {
  MOCK_ATTENDANCE,
  MOCK_ADVANCE_REQUESTS,
  MOCK_EMPLOYEES,
} from "@/src/mockData";
import {
  Card,
  Row,
  Col,
  Statistic,
  Tag,
  Descriptions,
  Button,
  message,
  Image,
} from "antd";
import {
  DollarOutlined,
  CheckCircleOutlined,
  FieldTimeOutlined,
  WalletOutlined,
  PlusOutlined,
  FileImageOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  formatCurrency,
  formatDateTime,
  toSafeNumber,
} from "@/src/utils/format";
import { useAuth } from "@/src/auth/hooks/useAuth";
import { useAdvanceRequestService } from "@/src/api/services";
import { useRef } from "react";
import type { ActionType } from "@ant-design/pro-components";

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
  {
    label: "Thi công nội thất Vinhomes Grand Park",
    value: "p1",
    dailyRate: 400000,
    otRate: 600000,
  },
  {
    label: "Cải tạo văn phòng Quận 1",
    value: "p2",
    dailyRate: 450000,
    otRate: 650000,
  },
  {
    label: "Lắp đặt showroom Thủ Đức",
    value: "p3",
    dailyRate: 500000,
    otRate: 700000,
  },
];

const MOCK_ATTENDANCE_WORK: AttendanceWorkRecord[] = [
  {
    id: "1",
    staffId: "4",
    date: "2024-03-01",
    startTime: "08:00",
    endTime: "17:00",
    workDay: 1,
    projectId: "p1",
    projectName: "Thi công nội thất Vinhomes Grand Park",
    workingDays: 1,
    otDays: 0.25,
    amount: 550000,
  },
  {
    id: "2",
    staffId: "4",
    date: "2024-03-02",
    startTime: "08:00",
    endTime: "17:00",
    workDay: 1,
    projectId: "p2",
    projectName: "Cải tạo văn phòng Quận 1",
    workingDays: 0.75,
    otDays: 0.1,
    amount: 350000,
  },
];

const StatisticsPage: React.FC = () => {
  const { user } = useAuth();
  const advanceActionRef = useRef<ActionType>(null);
  const { request, create } = useAdvanceRequestService();
  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [advanceOpen, setAdvanceOpen] = useState(false);
  const [records, setRecords] = useState<AttendanceWorkRecord[]>(
    user
      ? MOCK_ATTENDANCE_WORK.filter(
        (r) => String(r.staffId) === String(user.id),
      )
      : [],
  );
  if (!user) return null;

  const employeeInfo = MOCK_EMPLOYEES.find((e) => e.id === user.id) || {
    id: user.id,
    name: user.name,
    baseSalary: 12000000,
    bonus: 0,
    penalty: 0,
    advance: 0,
  };

  const myRecords = MOCK_ATTENDANCE.filter((r) => r.staffId === user.id);
  const myAdvanceRequests = MOCK_ADVANCE_REQUESTS.filter(
    (r) => r.employeeId === user.id,
  ) as AdvanceRequest[];
  const totalWorkDays = myRecords.reduce((sum, r) => sum + (r.workDay ?? 0), 0);
  const totalOTHours = myRecords.reduce((sum, r) => sum + (r.otDays ?? 0), 0);

  const totalDays = totalWorkDays + totalOTHours;

  const workHours = totalWorkDays * 8;
  const otHours = totalOTHours * 8;
  const totalHours = totalDays * 8;

  const baseSalary = toSafeNumber(employeeInfo.baseSalary);
  const bonus = toSafeNumber(employeeInfo.bonus);
  const penalty = toSafeNumber(employeeInfo.penalty);
  const advance = toSafeNumber(employeeInfo.advance);
  const estimatedSalary = baseSalary + bonus - penalty - advance;

  const handleCreateRequest = async (values: any) => {
    try {
      await create({
        amount: Number(values.amount),
        reason: values.reason,
      });
      message.success("Yêu cầu ứng tiền đã được gửi thành công");
      advanceActionRef.current?.reload();
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmitAttendance = async (values: any) => {
    const selectedProject = MOCK_PROJECT_OPTIONS.find(
      (p) => p.value === values.projectId,
    );

    if (!selectedProject) {
      message.error("Không tìm thấy dự án");
      return false;
    }

    const workingDays = Number(values.workingDays || 0);
    const otDays = Number(values.otDays || 0);

    const amount =
      workingDays * selectedProject.dailyRate + otDays * selectedProject.otRate;

    const newRecord: AttendanceWorkRecord = {
      id: Math.random().toString(36).slice(2, 11),
      staffId: String(user.id),
      date: dayjs(values.date).format("YYYY-MM-DD"),
      startTime: "",
      endTime: "",
      workDay: 0,
      projectId: selectedProject.value,
      projectName: selectedProject.label,
      workingDays,
      otDays,
      amount,
    };

    setRecords((prev) => [newRecord, ...prev]);
    message.success("Chấm công thành công");
    return true;
  };

  const monthlyAttendanceColumns: ProColumns<AttendanceRecord>[] = [
    {
      title: "Ngày",
      dataIndex: "dateFilter",
      valueType: "date",
      hideInTable: true,
      search: {
        transform: (value) => ({
          dateFilter: value?.format("YYYY-MM-DD"),
        }),
      },
    },
    {
      title: "Ngày",
      dataIndex: "date",
      valueType: "date",
      hideInSearch: true,
      render: (_, record) => dayjs(record.date).format("DD/MM/YYYY"),
    },
    {
      title: "Số công hành chính",
      dataIndex: "workDay",
      hideInSearch: true,
    },
    {
      title: "Tăng ca",
      dataIndex: "otDays",
      hideInSearch: true,
      render: (_, record) =>
        (record.otDays ?? 0) > 0 ? (
          <Tag color="blue" icon={<FieldTimeOutlined />}>
            {record.otDays} công
          </Tag>
        ) : (
          "-"
        ),
    },
    {
      title: "Thành tiền",
      dataIndex: "amount",
      hideInSearch: true,
      render: (_, record) => (
        <span style={{ fontWeight: 700, color: "#52c41a" }}>
          {new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(Number(record.workDay || 0))}
        </span>
      ),
    },
  ];

  const advanceColumns: ProColumns<AdvanceRequest>[] = [
    {
      title: "Ngày yêu cầu",
      dataIndex: "requestDateFilter",
      valueType: "date",
      hideInTable: true,
      search: {
        transform: (value) => ({
          requestDateFilter: value?.format("YYYY-MM-DD"),
        }),
      },
    },
    {
      title: "Ngày yêu cầu",
      dataIndex: "createdAt",
      valueType: "dateTime",
      hideInSearch: true,
      render: (_, record) => formatDateTime((record as any).createdAt || record.requestDate),
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      hideInSearch: true,
      render: (_, record) => (
        <strong style={{ color: "#1890ff" }}>
          {formatCurrency(record.amount)}
        </strong>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      hideInSearch: true,
      render: (_, record) => {
        const color =
          record.status === "Đã duyệt"
            ? "green"
            : record.status === "Từ chối"
              ? "red"
              : "orange";

        return <Tag color={color}>{record.status}</Tag>;
      },
    },
    {
      title: "File thanh toán",
      dataIndex: "transferProof",
      hideInSearch: true,
      render: (_, record) =>
        record.transferProof ? (
          <Image src={record.transferProof} fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QardG0sPDwMBx0YEhT18TA4PUeBXtIHBYlD0wGMzlJuU1A9IMDBQCsIiC4IOCfRKDbyAUG3hYWboKAfYDYi6IA8gViA7H8thwBjglIHbCkLtRJgGYJ3oGBISERBZBiKfyLMlAzGRgYIhh4GBgZUBi0UGA8MlQIol+RKjIIEO0GBgS0iwMDMwgBV0QWBfhmEQSKRKDgYGt4YGBpYoBhC7AcY3R0YGBrYJxklEOViYGBIBov+/8//UYaBAuJQYMDwL/p+BgYWBvjNAABBelRYdFhNTDpjb20uYWRvYmUueG1wAAAAAAA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/Pgo8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIj4KICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIvPgogIDwvcmRmOlJERj4KPC94OnhtcG1ldGE+Cjw/eHBhY2tldCBlbmQ9InIiPz4L+5JfAAAAn0lEQVR42u3BAQ0AAADCoPdPbQ43oAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOBtwYEAAUFsJp0AAAAASUVORK5CYII=" width={50} height={50} style={{ objectFit: 'cover', borderRadius: 4 }} />
        ) : (
          <span style={{ color: '#aaa' }}>Không có ảnh</span>
        )
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Card
        title="Tổng quan"
        bordered
        styles={{ body: { padding: "12px 16px" } }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={4}>
            <ProCard style={{ background: "#e6f7ff" }} bordered>
              <Statistic
                title="Tổng công"
                value={totalWorkDays}
                suffix="công"
                prefix={<CheckCircleOutlined style={{ color: "#1890ff" }} />}
              />
              <div style={{ marginTop: 8, fontSize: 12, color: "#888" }}>
                ≈ {workHours} giờ
              </div>
            </ProCard>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <ProCard style={{ background: "#fff7e6" }} bordered>
              <Statistic
                title="Công OT"
                value={totalOTHours}
                suffix="công"
                prefix={<FieldTimeOutlined style={{ color: "#fa8c16" }} />}
              />
              <div style={{ marginTop: 8, fontSize: 12, color: "#888" }}>
                ≈ {otHours} giờ
              </div>
            </ProCard>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <ProCard style={{ background: "#fff7e6" }} bordered>
              <Statistic
                title="Tổng công hành chính và OT"
                value={totalDays}
                suffix="công"
                prefix={<FieldTimeOutlined style={{ color: "#fa8c16" }} />}
              />
              <div style={{ marginTop: 8, fontSize: 12, color: "#888" }}>
                ≈ {totalHours} giờ
              </div>
            </ProCard>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <ProCard style={{ background: "#f6ffed" }} bordered>
              <Statistic
                title="Lương cơ bản"
                value={baseSalary}
                formatter={(val) => formatCurrency(val)}
                prefix={<DollarOutlined style={{ color: "#52c41a" }} />}
              />
            </ProCard>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <ProCard style={{ background: "#fff1f0" }} bordered>
              <Statistic
                title="Đã ứng"
                value={advance}
                formatter={(val) => formatCurrency(val)}
                prefix={<WalletOutlined style={{ color: "#ff4d4f" }} />}
              />
            </ProCard>
          </Col>
        </Row>
      </Card>

      <ProCard title="Lương tạm tính (Dự kiến)" bordered headerBordered>
        <Descriptions column={{ xs: 1, sm: 2 }} bordered>
          <Descriptions.Item label="Lương cơ bản">
            {formatCurrency(baseSalary)}
          </Descriptions.Item>
          <Descriptions.Item label="Thưởng">
            +{formatCurrency(bonus)}
          </Descriptions.Item>
          <Descriptions.Item label="Phạt">
            -{formatCurrency(penalty)}
          </Descriptions.Item>
          <Descriptions.Item label="Đã ứng">
            -{formatCurrency(advance)}
          </Descriptions.Item>
          <Descriptions.Item label="Thực lĩnh" span={2}>
            <strong
              style={{
                color: estimatedSalary >= 0 ? "#52c41a" : "#ff4d4f",
                fontSize: 18,
              }}
            >
              {formatCurrency(estimatedSalary)}
            </strong>
          </Descriptions.Item>
        </Descriptions>
      </ProCard>

      <Card
        title="Lịch sử ứng tiền"
        bordered
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setAdvanceOpen(true)}
          >
            Tạo ứng tiền
          </Button>
        }
      >

        <ProTable<AdvanceRequest>
          actionRef={advanceActionRef}
          columns={advanceColumns}
          rowKey={(record) => record.id || (record as any)._id}
          search={{ labelWidth: "auto", defaultCollapsed: false }}
          request={async (params) => {
            try {
              const res = await request('GET', '', null, {
                page: params.current || 1,
                limit: params.pageSize || 10,
              });
              let data = res.data || [];
              if (params.requestDateFilter) {
                data = data.filter((item: AdvanceRequest) =>
                  dayjs((item as any).createdAt || item.requestDate).isSame(params.requestDateFilter, "day"),
                );
              }
              return {
                data,
                success: true,
                total: res.meta?.total || 0,
              };
            } catch {
              return { data: [], success: false, total: 0 };
            }
          }}
          pagination={{ pageSize: 5 }}
          options={false}
          scroll={{ x: 500 }}
        />
      </Card>

      <Card
        title="Chi tiết công"
        bordered
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setAttendanceOpen(true)}
          >
            Chấm công hôm nay
          </Button>
        }
      >
        <ProTable<AttendanceRecord>
          columns={monthlyAttendanceColumns}
          rowKey="id"
          search={{ labelWidth: "auto", defaultCollapsed: false }}
          request={async (params) => {
            let data = myRecords;

            if (params.dateFilter) {
              data = data.filter((item) =>
                dayjs(item.date).isSame(params.dateFilter, "day"),
              );
            }

            return {
              data,
              success: true,
            };
          }}
          pagination={{ pageSize: 5 }}
          options={false}
        />
      </Card>

      <Card
        title="Lịch sử thanh toán lương"
        bordered
      >
        <ProTable
          rowKey="id"
          search={false}
          options={false}
          pagination={{ pageSize: 5 }}
          scroll={{ x: 600 }}
          dataSource={[
            // Dữ liệu mẫu tạm thời, có thể kết nối API sau
            { id: '1', paymentDate: '2024-03-05', amount: 8500000, note: 'Lương tháng 2/2024', imageUrl: '' },
            { id: '2', paymentDate: '2024-02-05', amount: 9200000, note: 'Lương tháng 1/2024', imageUrl: 'https://images.unsplash.com/photo-1544390041-3e5f2a967f1b?auto=format&fit=crop&q=80&w=200' },
            { id: '3', paymentDate: '2024-01-05', amount: 8800000, note: 'Lương tháng 12/2023', imageUrl: '' },
          ]}
          columns={[
            {
              title: "Ngày thanh toán",
              dataIndex: "paymentDate",
              valueType: "date",
              render: (_, record: any) => dayjs(record.paymentDate).format("DD/MM/YYYY"),
            },
            {
              title: "Số tiền thanh toán",
              dataIndex: "amount",
              render: (_, record: any) => (
                <strong style={{ color: "#52c41a" }}>
                  {formatCurrency(record.amount)}
                </strong>
              ),
            },
            {
              title: "Ghi chú",
              dataIndex: "note",
            },
            {
              title: "Ảnh chứng từ",
              dataIndex: "imageUrl",
              render: (_, record: any) =>
                record.imageUrl ? (
                  <Image src={record.imageUrl} fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QardG0sPDwMBx0YEhT18TA4PUeBXtIHBYlD0wGMzlJuU1A9IMDBQCsIiC4IOCfRKDbyAUG3hYWboKAfYDYi6IA8gViA7H8thwBjglIHbCkLtRJgGYJ3oGBISERBZBiKfyLMlAzGRgYIhh4GBgZUBi0UGA8MlQIol+RKjIIEO0GBgS0iwMDMwgBV0QWBfhmEQSKRKDgYGt4YGBpYoBhC7AcY3R0YGBrYJxklEOViYGBIBov+/8//UYaBAuJQYMDwL/p+BgYWBvjNAABBelRYdFhNTDpjb20uYWRvYmUueG1wAAAAAAA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/Pgo8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIj4KICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIvPgogIDwvcmRmOlJERj4KPC94OnhtcG1ldGE+Cjw/eHBhY2tldCBlbmQ9InIiPz4L+5JfAAAAn0lEQVR42u3BAQ0AAADCoPdPbQ43oAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOBtwYEAAUFsJp0AAAAASUVORK5CYII=" width={50} height={50} style={{ objectFit: 'cover', borderRadius: 4 }} />
                ) : (
                  <span style={{ color: '#aaa' }}>Không có ảnh</span>
                )
            }
          ]}
        />
      </Card>
      {/* ModalForm tạo yêu cầu ứng tiền */}
      <ModalForm
        key="add"
        title="Tạo yêu cầu ứng tiền mới"
        open={advanceOpen}
        modalProps={{
          destroyOnClose: true,
          onCancel: () => setAdvanceOpen(false),
        }}
        onOpenChange={setAdvanceOpen}
        onFinish={handleCreateRequest}
        width={500}
      >
        <ProFormDigit
          label="Số tiền muốn ứng"
          name="amount"
          min={0}
          fieldProps={{
            formatter: (value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ","),
            parser: (value) => value ? Number(value.replace(/\$\s?|,*/g, "")) : 0,
            addonAfter: "đ",
          }}
          rules={[{ required: true, message: "Vui lòng nhập số tiền" }]}
        />
        <ProFormTextArea
          label="Lý do ứng tiền"
          name="reason"
          placeholder="Ví dụ: Ứng tiền mua vật tư gấp, ứng lương đợt 1..."
          rules={[{ required: true, message: "Vui lòng nhập lý do" }]}
        />

      </ModalForm>
      <ModalForm
        title="Thêm chấm công"
        open={attendanceOpen}
        modalProps={{
          destroyOnClose: true,
          onCancel: () => setAttendanceOpen(false),
        }}
        onOpenChange={setAttendanceOpen}
        onFinish={handleSubmitAttendance}
      >
        <ProFormDatePicker
          name="date"
          label="Ngày tháng năm"
          rules={[{ required: true, message: "Vui lòng chọn ngày" }]}
        />

        <ProFormSelect
          name="projectId"
          label="Dự án"
          options={MOCK_PROJECT_OPTIONS}
          rules={[{ required: true, message: "Vui lòng chọn dự án" }]}
        />

        <ProFormDigit
          name="workingDays"
          label="số giờ hành chính làm được"
          min={0}
          max={1}
          fieldProps={{ precision: 2 }}
          rules={[{ required: true, message: "Vui lòng nhập số giờ làm" }]}
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

export default StatisticsPage;
