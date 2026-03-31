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
import { useAdvanceRequestService, useSalaryActionService, useAttendanceService, useProjectService } from "@/src/api/services";
import { useRef, useEffect } from "react";
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
  const { request: salaryRequest } = useSalaryActionService();
  const { create: createAttendance, request: attendanceRequest } = useAttendanceService();
  const { request: projectRequest } = useProjectService();
  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [advanceOpen, setAdvanceOpen] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [projectOptions, setProjectOptions] = useState<{ label: string; value: string }[]>([]);
  const [attendanceSummary, setAttendanceSummary] = useState({
    totalWorkUnits: 0,
    totalOTUnits: 0,
    totalWorkHours: 0,
    totalOTHours: 0,
  });
  const [records, setRecords] = useState<AttendanceWorkRecord[]>(
    user
      ? MOCK_ATTENDANCE_WORK.filter(
        (r) => String(r.staffId) === String(user.id),
      )
      : [],
  );
  if (!user) return null;

  useEffect(() => {
    if (user) {
      setLoadingHistory(true);
      salaryRequest('GET', '/my-history')
        .then((res: any) => {
          if (res.success && res.data && res.data.payments) {
            setPaymentHistory(res.data.payments);
          }
        })
        .catch((err: any) => {
          console.error("Lỗi lấy lịch sử lương:", err);
        })
        .finally(() => {
          setLoadingHistory(false);
        });
    }
  }, [user, salaryRequest]);

  useEffect(() => {
    projectRequest('GET', '', null, { status: 'APPROVED', limit: 1000 })
      .then((res: any) => {
        const data: any[] = res.data || [];
        setProjectOptions(data.map((p) => ({
          label: p.name || p.title || p.code || 'Dự án',
          value: p.id || p._id,
        })));
      })
      .catch(() => { });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const employeeInfo = MOCK_EMPLOYEES.find((e) => e.id === user.id) || {
    id: user.id,
    name: user.name,
    baseSalary: 12000000,
    bonus: 0,
    penalty: 0,
    advance: 0,
  };

  const myAdvanceRequests = MOCK_ADVANCE_REQUESTS.filter(
    (r) => r.employeeId === user.id,
  ) as AdvanceRequest[];

  const totalDays = attendanceSummary.totalWorkUnits + attendanceSummary.totalOTUnits;
  const totalHours = attendanceSummary.totalWorkHours + attendanceSummary.totalOTHours;

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
      advanceActionRef.current?.reload();
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmitAttendance = async (values: any) => {
    try {
      await createAttendance({
        date: dayjs(values.date).format("YYYY-MM-DD"),
        projectId: values.projectId,
        workHours: Number(values.workingDays || 0),
        otHours: Number(values.otDays || 0)
      } as any);
      return true;
    } catch (error) {
      message.error("Có lỗi xảy ra khi chấm công");
      return false;
    }
  };

  const monthlyAttendanceColumns: ProColumns<any>[] = [
    {
      title: "Từ ngày - Đến ngày",
      dataIndex: "dateRange",
      valueType: "dateRange",
      hideInTable: true,
      search: {
        transform: (value) => {
          return {
            startDate: value?.[0] ? dayjs(value[0]).format('YYYY-MM-DD') : undefined,
            endDate: value?.[1] ? dayjs(value[1]).format('YYYY-MM-DD') : undefined,
          };
        },
      },
    },
    {
      title: "Ngày",
      dataIndex: "date",
      hideInSearch: true,
      render: (_, record) => dayjs(record.date).format("DD/MM/YYYY"),
    },
    {
      title: "Số công hành chính",
      dataIndex: "workUnits",
      hideInSearch: true,
    },
    {
      title: "Tăng ca",
      dataIndex: "otUnits",
      hideInSearch: true,
      render: (_, record) =>
        (record.otUnits ?? 0) > 0 ? (
          <Tag color="blue" icon={<FieldTimeOutlined />}>
            {record.otUnits} công ({record.otHours}h)
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
        record.amount ? (
          <span style={{ fontWeight: 700, color: "#52c41a" }}>
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(Number(record.amount || 0))}
          </span>
        ) : (
          <span style={{ color: '#aaa' }}>-</span>
        )
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

        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-start" }}>
            <Tag color={color} style={{ margin: 0 }}>{record.status}</Tag>
            {record.status === "Từ chối" && record.note && (
              <span style={{ fontSize: 12, color: "#ff4d4f", whiteSpace: "nowrap" }}>
                Lý do: {record.note}
              </span>
            )}
          </div>
        );
      },
    },
    {
      title: "File thanh toán",
      dataIndex: "images",
      hideInSearch: true,
      render: (_, record: any) => {
        const images = record.images || [];
        const firstImg = images.length > 0 ? images[0].url : (record.transferProof || null);

        if (!firstImg) {
          return <span style={{ color: '#aaa' }}>Không có ảnh</span>;
        }

        return (
          <Image.PreviewGroup>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <Image
                src={firstImg}
                width={50}
                height={50}
                style={{ borderRadius: 4, objectFit: 'cover' }}
              />
              {images.length > 1 && (
                <div style={{
                  position: 'absolute', top: -5, right: -5,
                  background: '#1890ff', color: 'white', borderRadius: '50%',
                  width: 20, height: 20, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 10, fontWeight: 'bold'
                }}>
                  +{images.length - 1}
                </div>
              )}
              {/* Vẫn render các ảnh còn lại nhưng giấu đi để PreviewGroup có thể next được */}
              <div style={{ display: 'none' }}>
                {images.slice(1).map((img: any, idx: number) => (
                  <Image key={img.id || img._id || idx} src={img.url} />
                ))}
              </div>
            </div>
          </Image.PreviewGroup>
        );
      }
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Card
        title="Số công tháng này"
        bordered
        styles={{ body: { padding: "12px 16px" } }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <ProCard style={{ background: "#e6f7ff" }} bordered>
              <Statistic
                title="Tổng công"
                value={attendanceSummary.totalWorkUnits}
                suffix={`công ≈ ${attendanceSummary.totalWorkHours} tiếng`}
                prefix={<CheckCircleOutlined style={{ color: "#1890ff" }} />}
              />
            </ProCard>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <ProCard style={{ background: "#fff7e6" }} bordered>
              <Statistic
                title="Công OT"
                value={attendanceSummary.totalOTUnits}
                suffix={`công ≈ ${attendanceSummary.totalOTHours} tiếng`}
                prefix={<FieldTimeOutlined style={{ color: "#fa8c16" }} />}
              />
            </ProCard>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <ProCard style={{ background: "#fff7e6" }} bordered>
              <Statistic
                title="Tổng công hành chính và OT"
                value={totalDays}
                suffix={`công = ${totalHours} tiếng`}
                prefix={<FieldTimeOutlined style={{ color: "#fa8c16" }} />}
              />
            </ProCard>
          </Col>

        </Row>
      </Card>

      <ProCard title="Lương tạm tính (Dự kiến)" bordered headerBordered>
        <Descriptions column={{ xs: 1, sm: 2 }} bordered>
          <Descriptions.Item label="Lương cơ bản/ngày">
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
          <Descriptions.Item label="Số tiền đang có" span={2}>
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

      <ProCard
        title="Lịch sử ứng tiền"
        bordered
        headerBordered
        collapsible
        defaultCollapsed
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
      </ProCard>

      <ProCard
        title="Chi tiết công"
        bordered
        headerBordered
        collapsible
        defaultCollapsed
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
        <ProTable<any>
          columns={monthlyAttendanceColumns}
          rowKey={(record: any) => record.id || Math.random().toString()}
          search={{ labelWidth: "auto", defaultCollapsed: false }}
          request={async (params) => {
            try {
              const res = await attendanceRequest('GET', '/my-history', null, {
                startDate: params.startDate,
                endDate: params.endDate
              });

              if (res.success && res.data) {
                setAttendanceSummary(res.data.summary || {
                  totalWorkUnits: 0,
                  totalOTUnits: 0,
                  totalWorkHours: 0,
                  totalOTHours: 0,
                });
                return {
                  data: res.data.records || [],
                  success: true
                };
              }
              return { data: [], success: true };
            } catch (error) {
              return { data: [], success: false };
            }
          }}
          pagination={{ pageSize: 5 }}
          options={false}
        />
      </ProCard>

      <ProCard
        title="Lịch sử thanh toán lương"
        bordered
        headerBordered
        collapsible
        defaultCollapsed
      >
        <ProTable
          rowKey={(record: any) => record.id || record._id || Math.random().toString(36)}
          search={false}
          options={false}
          pagination={{ pageSize: 5 }}
          scroll={{ x: 600 }}
          loading={loadingHistory}
          dataSource={paymentHistory}
          columns={[
            {
              title: "Ngày thanh toán",
              dataIndex: "date",
              valueType: "date",
              render: (_, record: any) => dayjs(record.date || record.paymentDate).format("DD/MM/YYYY"),
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
              dataIndex: "billImage",
              render: (_, record: any) =>
                record.billImage ? (
                  <Image src={record.billImage} fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QardG0sPDwMBx0YEhT18TA4PUeBXtIHBYlD0wGMzlJuU1A9IMDBQCsIiC4IOCfRKDbyAUG3hYWboKAfYDYi6IA8gViA7H8thwBjglIHbCkLtRJgGYJ3oGBISERBZBiKfyLMlAzGRgYIhh4GBgZUBi0UGA8MlQIol+RKjIIEO0GBgS0iwMDMwgBV0QWBfhmEQSKRKDgYGt4YGBpYoBhC7AcY3R0YGBrYJxklEOViYGBIBov+/8//UYaBAuJQYMDwL/p+BgYWBvjNAABBelRYdFhNTDpjb20uYWRvYmUueG1wAAAAAAA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/Pgo8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIj4KICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIvPgogIDwvcmRmOlJERj4KPC94OnhtcG1ldGE+Cjw/eHBhY2tldCBlbmQ9InIiPz4L+5JfAAAAn0lEQVR42u3BAQ0AAADCoPdPbQ43oAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOBtwYEAAUFsJp0AAAAASUVORK5CYII=" width={50} height={50} style={{ objectFit: 'cover', borderRadius: 4 }} />
                ) : (
                  <span style={{ color: '#aaa' }}>Không có ảnh</span>
                )
            }
          ]}
        />
      </ProCard>
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
          options={projectOptions}
          rules={[{ required: true, message: "Vui lòng chọn dự án" }]}
        />

        <ProFormDigit
          name="workingDays"
          label="Số giờ hành chính làm được"
          min={0}
          max={24}
          fieldProps={{ precision: 1 }}
          rules={[{ required: true, message: "Vui lòng nhập số giờ làm" }]}
        />

        <ProFormDigit
          name="otDays"
          label="Số giờ tăng ca"
          min={0}
          max={24}
          initialValue={0}
          fieldProps={{ precision: 1 }}
        />
      </ModalForm>
    </div>
  );
};

export default StatisticsPage;
