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
import { AdvanceRequest } from "@/src/types";
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
  CheckCircleOutlined,
  FieldTimeOutlined,
  PlusOutlined,
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



const StatisticsPage: React.FC = () => {
  const { user } = useAuth();
  const advanceActionRef = useRef<ActionType>(null);
  const attendanceActionRef = useRef<ActionType>(null);
  const { request, create } = useAdvanceRequestService();
  const { request: salaryRequest } = useSalaryActionService();
  const { create: createAttendance, request: attendanceRequest } = useAttendanceService();
  const { request: projectRequest } = useProjectService();
  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [advanceOpen, setAdvanceOpen] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [projectOptions, setProjectOptions] = useState<{ label: string; value: string }[]>([]);
  const [myStats, setMyStats] = useState<{
    userId?: any;
    bonus: number;
    penalty: number;
    advance: number;
    currentAmount: number;
    companyDebt: number;
    workDays: number;
    otHours: number;
    totalWorkHours: number;
    totalOTHours: number;
    netSalary: number;
  } | null>(null);
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

  const fetchStats = () => {
    setLoadingStats(true);
    const startDate = dayjs().startOf('month').format('YYYY-MM-DD');
    const endDate = dayjs().endOf('month').format('YYYY-MM-DD');
    salaryRequest('GET', `/my-salary`)
      .then((res: any) => {
        if (res.success && res.data) setMyStats(res.data);
      })
      .catch((err: any) => console.error('Lỗi lấy thống kê lương:', err))
      .finally(() => setLoadingStats(false));
  };

  useEffect(() => {
    if (!user) return;
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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

  const totalDays = (myStats?.workDays || 0) + (myStats?.otHours || 0);
  const totalHours = (myStats?.totalWorkHours || 0) + (myStats?.totalOTHours || 0);

  const baseSalary = toSafeNumber(myStats?.currentAmount);
  const bonus = toSafeNumber(myStats?.bonus);
  const penalty = toSafeNumber(myStats?.penalty);
  const advance = toSafeNumber(myStats?.advance);
  const companyDebt = toSafeNumber(myStats?.companyDebt);
  const estimatedSalary = toSafeNumber(myStats?.netSalary);

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
      // Reload bảng chi tiết công và cập nhật lại thống kê lương
      attendanceActionRef.current?.reload();
      fetchStats();
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
      initialValue: [dayjs().startOf('month'), dayjs().endOf('month')],
      fieldProps: {
        format: 'DD/MM/YYYY',
      },
      search: {
        transform: (value) => {
          const toYMD = (v: any) => {
            if (!v) return undefined;
            // Nếu đã là dayjs object thì format trực tiếp
            if (dayjs.isDayjs(v)) return v.format('YYYY-MM-DD');
            // Nếu là string DD/MM/YYYY (do fieldProps format) thì parse đúng format
            return dayjs(v, 'DD/MM/YYYY').format('YYYY-MM-DD');
          };
          return {
            startDate: toYMD(value?.[0]),
            endDate: toYMD(value?.[1]),
          };
        },
      },
    },
    {
      title: "Ngày",
      dataIndex: "date",
      hideInSearch: true,
      render: (_, record) => dayjs((record as any).date || record.createdAt).format("DD/MM/YYYY HH:mm"),
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
      dataIndex: "totalAmount",
      hideInSearch: true,
      render: (_, record) => (
        record.totalAmount ? (
          <span style={{ fontWeight: 700, color: "#52c41a" }}>
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(Number(record.totalAmount || 0))}
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
        title="Số công tính đến thời điểm hiện tại"
        bordered
        styles={{ body: { padding: "12px 16px" } }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <ProCard style={{ background: "#e6f7ff" }} bordered>
              <Statistic
                title="Tổng công hành chính"
                value={myStats?.workDays || 0}
                suffix={`công ≈ ${myStats?.totalWorkHours || 0} tiếng`}
                prefix={<CheckCircleOutlined style={{ color: "#1890ff" }} />}
              />
            </ProCard>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <ProCard style={{ background: "#fff7e6" }} bordered>
              <Statistic
                title="Tổng công tăng ca"
                value={myStats?.otHours || 0}
                suffix={`công ≈ ${myStats?.totalOTHours || 0} tiếng`}
                prefix={<FieldTimeOutlined style={{ color: "#fa8c16" }} />}
              />
            </ProCard>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <ProCard style={{ background: "#fff7e6" }} bordered>
              <Statistic
                title="Tổng công hành chính và và tăng ca"
                value={totalDays}
                suffix={`công = ${totalHours} tiếng`}
                prefix={<FieldTimeOutlined style={{ color: "#fa8c16" }} />}
              />
            </ProCard>
          </Col>

        </Row>
      </Card>

      <ProCard
        title={`Lương tạm tính (Dự kiến)`}
        bordered
        headerBordered
        loading={loadingStats}
      >
        <Descriptions column={{ xs: 1, sm: 2, md: 3 }} bordered>
          <Descriptions.Item label="Số tiền đang có">
            {formatCurrency(baseSalary)}
          </Descriptions.Item>
          <Descriptions.Item label="Số tiền công ty đang nợ">
            {formatCurrency(companyDebt)}
          </Descriptions.Item>
          <Descriptions.Item label="Tổng tiền công ty phải thanh toán">
            <strong
              style={{
                color: estimatedSalary >= 0 ? "#52c41a" : "#ff4d4f",
                fontSize: 16,
              }}
            >
              {formatCurrency(estimatedSalary)}
            </strong>
          </Descriptions.Item>
          <Descriptions.Item label="Thưởng">
            <span style={{ color: '#52c41a' }}>+{formatCurrency(bonus)}</span>
          </Descriptions.Item>
          <Descriptions.Item label="Phạt">
            <span style={{ color: '#ff4d4f' }}>-{formatCurrency(penalty)}</span>
          </Descriptions.Item>
          <Descriptions.Item label="Đã ứng">
            <span style={{ color: '#fa8c16' }}>-{formatCurrency(advance)}</span>
          </Descriptions.Item>
        </Descriptions>
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
            size="large"
          >
            Chấm công
          </Button>
        }
      >
        <ProTable<any>
          actionRef={attendanceActionRef}
          columns={monthlyAttendanceColumns}
          rowKey={(record: any) => record.id || Math.random().toString()}
          search={{ labelWidth: "auto", defaultCollapsed: false }}
          request={async (params) => {
            try {
              // startDate/endDate đã được transform đảm bảo format YYYY-MM-DD
              const startDate = params.startDate || dayjs().startOf('month').format('YYYY-MM-DD');
              const endDate = params.endDate || dayjs().endOf('month').format('YYYY-MM-DD');
              const res = await attendanceRequest('GET', '/my-history', null, {
                startDate,
                endDate
              });

              if (res.success && res.data) {
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
          max={8}
          fieldProps={{
            precision: 1,
            onKeyDown: (e) => {
              if (e.ctrlKey || e.metaKey || e.key.length > 1) return;
              if (!/^[0-9.]$/.test(e.key)) e.preventDefault();
            }
          }}
          rules={[{ required: true, message: "Vui lòng nhập số giờ làm" }]}
        />

        <ProFormDigit
          name="otDays"
          label="Số giờ tăng ca"
          min={0}
          max={24}
          fieldProps={{
            precision: 1,
            onKeyDown: (e) => {
              if (e.ctrlKey || e.metaKey || e.key.length > 1) return;
              if (!/^[0-9.]$/.test(e.key)) e.preventDefault();
            }
          }}
        />
      </ModalForm>
    </div>
  );
};

export default StatisticsPage;
