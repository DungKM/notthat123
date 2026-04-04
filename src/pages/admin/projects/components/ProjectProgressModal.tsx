import React, { useState } from "react";
import { Modal, Button, Select, Input, Space, Table, message, Typography, DatePicker } from "antd";
import {
  PlusOutlined,
  SaveOutlined,
  HistoryOutlined,
  DeleteOutlined,
  UnorderedListOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { ModalForm, ProFormSelect, ProFormText, ProFormDigit } from "@ant-design/pro-components";
import type { ProFormInstance } from "@ant-design/pro-components";
import { ProjectProgress, ProjectStatus } from "@/src/types";
import { Role } from "@/src/auth/types";
import dayjs from "dayjs";
import { useUserService, useProjectStageService } from "@/src/api/services";
import { useAuth } from "@/src/auth/hooks/useAuth";
import StageManagerModal from "./StageManagerModal";
const { Title } = Typography;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  progress: ProjectProgress[];
  historyProgress?: ProjectProgress[];
  onLoadHistory?: () => void;
  onUpdate: (data: ProjectProgress[]) => void;
  onSaveTasks?: (stage: string, tasks: any[]) => Promise<boolean>;
  onDeleteTask?: (taskId: string) => Promise<boolean>;
  onTaskAssigned?: (task: { employeeId: string; employeeName: string; work: string }) => void;
  onLoadTasksByStage?: (stage: string) => Promise<ProjectProgress | null>;
}

const ProjectProgressModal: React.FC<Props> = ({
  open,
  onOpenChange,
  progress,
  historyProgress,
  onLoadHistory,
  onUpdate,
  onSaveTasks,
  onDeleteTask,
  onTaskAssigned,
  onLoadTasksByStage,
}) => {
  const [currentStatus, setCurrentStatus] = useState<ProjectProgress | null>(
    null

  );
  const [historyOpen, setHistoryOpen] = useState(false);
  const [stageManagerOpen, setStageManagerOpen] = useState(false);
  const [addUserOpen, setAddUserOpen] = useState(false);
  const userFormRef = React.useRef<ProFormInstance>(null);
  const [stageOptions, setStageOptions] = useState<string[]>([]);
  const { user } = useAuth();
  const { list: users, getAll, create: createUser } = useUserService();
  const { request: stageRequest } = useProjectStageService();

  const isStaff = user?.role === Role.STAFF;

  const fetchStages = () => {
    stageRequest('GET', '', null, { page: 1, limit: 100 })
      .then((res) => {
        const raw: any[] = res.data || [];
        const names = raw.map((item: any) =>
          typeof item === 'string' ? item : item.name
        ).filter(Boolean);
        setStageOptions(names);
      })
      .catch(() => { });
  };

  React.useEffect(() => {
    if (open) {
      // Fetch user list
      getAll({ page: 1, limit: 1000 }).catch(console.error);
      // Fetch stage options từ API
      fetchStages();
    } else {
      setCurrentStatus(null);
    }
  }, [open, getAll, stageRequest]);

  // Luôn lấy trạng thái mới nhất từ server/props đưa vào UI để tiếp tục (nếu chưa có hoặc nếu vừa lưu xong)
  React.useEffect(() => {
    if (open && progress && progress.length > 0) {
      const lastProgress = progress[progress.length - 1];
      // Chỉ tự động điền nếu đang không làm việc nháp trên trạng thái khác
      // Hoặc nếu nó là kết quả vừa nạp mới từ việc Save (project.progress thay đổi)
      if (!currentStatus || currentStatus.id === lastProgress.id) {
        setCurrentStatus(lastProgress);
      }
    }
  }, [open, progress]);

  // Lấy danh sách nhân viên có thể giao việc lấy hết (Staff + Site Manager)
  const assignableEmployees = (users || []).filter(
    (u: any) => u.role === Role.STAFF || u.role === Role.SITE_MANAGER
  );

  const archiveCurrentStatus = () => {
    if (!currentStatus) return;

    // We no longer rely on patching the full array here if onSaveTasks is provided
    // Data is saved to backend progressively via saveStatus.
    // So we just visually reset currentStatus locally or rely on the parent to update the project
    setCurrentStatus(null);
  };

  // Thêm trạng thái mới — nếu đang có trạng thái thì cảnh báo trước
  const addStatus = () => {
    if (currentStatus) {
      Modal.confirm({
        title: <span style={{ fontSize: 18 }}>Thêm trạng thái mới</span>,
        width: 500,
        content: (
          <div style={{ fontSize: 16, lineHeight: 1.8, marginTop: 8 }}>
            <p>Trạng thái hiện tại <strong>"{currentStatus.status}"</strong> sẽ được lưu vào <strong>lịch sử tiến độ</strong>.</p>
            <p style={{ marginTop: 12, color: '#000', fontStyle: 'italic' }}>Bạn có muốn tạo trạng thái mới không?</p>
          </div>
        ),
        okText: "Tạo mới",
        cancelText: "Hủy",
        okButtonProps: { style: { backgroundColor: '#13d855ff', borderColor: '#13d855ff' } },
        icon: <HistoryOutlined style={{ color: '#faad14' }} />,
        onOk: () => {
          // Lưu trạng thái hiện tại vào lịch sử
          archiveCurrentStatus();

          // Tạo trạng thái mới
          const newStatus: ProjectProgress = {
            id: Math.random().toString(36).slice(2),
            status: stageOptions[0] || '' as any,
            tasks: [],
          };
          setCurrentStatus(newStatus);
          message.success("Trạng thái cũ đã lưu vào lịch sử. Đã tạo trạng thái mới.");
        },
      });
      return;
    }

    // Chưa có trạng thái nào → tạo mới luôn
    const newStatus: ProjectProgress = {
      id: Math.random().toString(36).slice(2),
      status: stageOptions[0] || '' as any,
      tasks: [],
    };
    setCurrentStatus(newStatus);
  };

  // Lưu — chỉ cập nhật thông tin đang nhập (không đẩy vào lịch sử)
  const saveStatus = async () => {
    if (!currentStatus) {
      message.warning("Không có trạng thái để lưu");
      return;
    }

    const unsavedTasks = currentStatus.tasks.filter(t => !(t as any).isSaved && t.work);

    if (unsavedTasks.length === 0) {
      // Just update updatedAt if needed locally
      message.success("Lưu thành công. Vui lòng thêm công việc mới nếu muốn lưu lên hệ thống.");
      onOpenChange(false);
      return;
    }

    if (onSaveTasks) {
      const resolvedTasks = unsavedTasks.map((t) => {
        let emp = t.employee as any;
        if (emp && typeof emp === "object") emp = emp.id || emp._id;
        if (emp && typeof emp === "string" && emp.length !== 24) {
          const matched = users?.find(u => u.name === emp);
          if (matched) emp = matched.id;
        }
        return { ...t, employee: emp };
      });
      const success = await onSaveTasks(currentStatus.status as string, resolvedTasks);
      if (success) {
        const updated: ProjectProgress = {
          ...currentStatus,
          tasks: currentStatus.tasks.map((t) =>
            unsavedTasks.some(ut => ut.id === t.id)
              ? { ...t, isSaved: true, updatedAt: dayjs().toISOString() } as any
              : t
          ),
        };
        setCurrentStatus(updated);
        message.success("Lưu tiến độ dự án thành công!");
        onOpenChange(false);

        // Gửi notification
        if (onTaskAssigned) {
          unsavedTasks.forEach(task => {
            if (task.employee) {
              const matchedUser = users?.find(u => u.id === task.employee);
              if (matchedUser) {
                onTaskAssigned({
                  employeeId: matchedUser.id,
                  employeeName: matchedUser.name,
                  work: task.work
                });
              }
            }
          });
        }

      } else {
        message.error("Có lỗi xảy ra khi lưu tiến độ!");
      }
    } else {
      // Fallback local update
      const updated: ProjectProgress = {
        ...currentStatus,
        tasks: currentStatus.tasks.map((t) => ({
          ...t,
          updatedAt: dayjs().toISOString(),
          isSaved: true
        })),
      };

      onUpdate([...progress, updated]);
      setCurrentStatus(null);
      message.success("Đã lưu tiến độ vào lịch sử");
      onOpenChange(false);
    }
  };

  const addTask = () => {
    if (!currentStatus) return;

    const updated = {
      ...currentStatus,
      tasks: [
        ...currentStatus.tasks,
        {
          id: Math.random().toString(36).slice(2),
          work: "",
          employee: "",
          updatedAt: dayjs().toISOString(),
        },
      ],
    };

    setCurrentStatus(updated);
  };

  const updateTask = (taskId: string, field: string, value: string) => {
    if (!currentStatus) return;

    const updated = {
      ...currentStatus,
      tasks: currentStatus.tasks.map((t) =>
        t.id === taskId ? { ...t, [field]: value, isSaved: false } : t
      ),
    };

    setCurrentStatus(updated);
  };

  return (
    <>
      <Modal
        title="Tiến độ dự án"
        open={open}
        width={900}
        onCancel={() => onOpenChange(false)}
        footer={
          !isStaff ? [
            <Button key="save" type="primary" icon={<SaveOutlined />} onClick={saveStatus}>
              Lưu
            </Button>,
          ] : null
        }
      >
        <Space direction="vertical" style={{ width: "100%" }} size={24}>
          <Space>
            {!isStaff && (
              <Button type="primary" icon={<PlusOutlined />} onClick={addStatus}>
                Thêm trạng thái
              </Button>
            )}

            <Button
              icon={<HistoryOutlined />}
              onClick={() => {
                if (onLoadHistory) onLoadHistory();
                setHistoryOpen(true);
              }}
            >
              Lịch sử tiến độ
            </Button>

            {!isStaff && (
              <Button
                icon={<UnorderedListOutlined />}
                onClick={() => setStageManagerOpen(true)}
              >
                Danh mục tiến độ
              </Button>
            )}

            {(user?.role === Role.DIRECTOR || user?.role === Role.ACCOUNTANT) && (
              <Button
                icon={<UserAddOutlined />}
                onClick={() => setAddUserOpen(true)}
              >
                Thêm thành viên
              </Button>
            )}
          </Space>

          {currentStatus && (
            <div
              style={{
                border: "1px solid #eee",
                padding: 16,
                borderRadius: 8,
              }}
            >
              <Space style={{ marginBottom: 12 }}>
                <Select
                  style={{ width: 300 }}
                  value={currentStatus.status}
                  options={(stageOptions.length > 0 ? stageOptions : []).map((s) => ({
                    label: s,
                    value: s,
                  }))}
                  onChange={async (value) => {
                    if (onLoadTasksByStage) {
                      const stageTasks = await onLoadTasksByStage(value as string);
                      if (stageTasks) {
                        setCurrentStatus(stageTasks);
                        return;
                      }
                    }
                    
                    // Fallback
                    setCurrentStatus({
                      ...currentStatus,
                      status: value,
                      tasks: [],
                    });
                  }}
                  disabled={isStaff}
                />

                {!isStaff && (
                  <Button
                    icon={<PlusOutlined />}
                    type="dashed"
                    onClick={addTask}
                  >
                    Thêm công việc
                  </Button>
                )}
              </Space>

              <Table
                dataSource={currentStatus.tasks}
                rowKey="id"
                pagination={false}
                columns={[
                  {
                    title: "Công việc",
                    dataIndex: "work",
                    render: (_, record) => (
                      <Input
                        value={record.work}
                        placeholder="Nhập công việc"
                        onChange={(e) =>
                          updateTask(record.id, "work", e.target.value)
                        }
                        disabled={isStaff}
                      />
                    ),
                  },
                  {
                    title: "Nhân viên",
                    dataIndex: "employee",
                    width: 200,
                    render: (_, record) => (
                      <Select
                        value={record.employee}
                        style={{ width: "100%" }}
                        placeholder="Chọn nhân viên"
                        showSearch
                        optionFilterProp="label"
                        popupMatchSelectWidth={false}
                        listHeight={256}
                        filterOption={(input, option) =>
                          (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                        }
                        options={assignableEmployees.map((e) => {
                          const roleLabel = e.role === Role.STAFF ? 'Nhân viên' : e.role === Role.SITE_MANAGER ? 'Quản lý công trình' : e.role;
                          return {
                            label: `${e.name} (${roleLabel})`,
                            value: e.id,
                          };
                        })}
                        onChange={(value) =>
                          updateTask(record.id, "employee", value)
                        }
                        disabled={isStaff}
                      />
                    ),
                  },
                  {
                    title: "Ngày giao",
                    dataIndex: "assignedDate",
                    width: 150,
                    render: (_, record: any) => (
                      <DatePicker
                        value={record.assignedDate ? dayjs(record.assignedDate) : undefined}
                        format="DD/MM/YYYY"
                        placeholder="Chọn ngày"
                        onChange={(date) =>
                          updateTask(record.id, "assignedDate", date ? date.toISOString() : "")
                        }
                        disabled={isStaff}
                        style={{ width: "100%" }}
                      />
                    ),
                  },
                  {
                    title: "Cập nhật",
                    dataIndex: "updatedAt",
                    width: 150,
                    render: (_, record) =>
                      dayjs(record.updatedAt).format("HH:mm DD/MM"),
                  },
                  ...(isStaff ? [] : [{
                    title: "Thao tác",
                    width: 100,
                    render: (_, record: any) => (
                      <Space size="small">
                        {!record.isSaved && (
                          <Button
                            type="text"
                            style={{ color: '#1890ff' }}
                            icon={<SaveOutlined />}
                            onClick={async () => {
                              if (!record.work) {
                                message.warning("Vui lòng nhập công việc");
                                return;
                              }
                              let resolvedRecord = { ...record };
                              let emp = resolvedRecord.employee as any;
                              if (emp && typeof emp === "object") emp = emp.id || emp._id;
                              if (emp && typeof emp === "string" && emp.length !== 24) {
                                const matched = users?.find(u => u.name === emp);
                                if (matched) emp = matched.id;
                              }
                              resolvedRecord.employee = emp;

                              if (onSaveTasks) {
                                const success = await onSaveTasks(currentStatus.status as string, [resolvedRecord]);
                                if (success) {
                                  message.success("Cập nhật công việc thành công");
                                  setCurrentStatus({
                                    ...currentStatus,
                                    tasks: currentStatus.tasks.map((t) =>
                                      t.id === record.id ? { ...t, isSaved: true, updatedAt: dayjs().toISOString() } : t
                                    )
                                  });
                                }
                              }
                            }}
                          />
                        )}
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={async () => {
                            const isNew = !record.id || String(record.id).length !== 24;
                            if (isNew) {
                              setCurrentStatus({
                                ...currentStatus,
                                tasks: currentStatus.tasks.filter((t) => t.id !== record.id),
                              });
                            } else {
                              if (onDeleteTask) {
                                const success = await onDeleteTask(record.id);
                                if (success) {
                                  message.success("Xóa công việc thành công");
                                  setCurrentStatus({
                                    ...currentStatus,
                                    tasks: currentStatus.tasks.filter((t) => t.id !== record.id),
                                  });
                                }
                              }
                            }
                          }}
                        />
                      </Space>
                    ),
                  }])
                ]}
              />
            </div>
          )}
        </Space>
      </Modal>

      {/* Popup lịch sử */}
      <Modal
        title="Lịch sử tiến độ"
        open={historyOpen}
        width={900}
        footer={null}
        onCancel={() => setHistoryOpen(false)}
      >
        {(historyProgress || progress).map((p) => (
          <div
            key={p.id}
            style={{
              border: "1px solid #eee",
              padding: 16,
              borderRadius: 8,
              marginBottom: 16,
            }}
          >
            {/* <h4 className="text-lg font-semibold italic text">{p.status}</h4>
             */}

            <Title level={4} style={{ color: "red" }}>{p.status}</Title>


            <Table
              dataSource={p.tasks}
              rowKey="id"
              pagination={false}
              columns={[
                { title: "Công việc", dataIndex: "work" },
                { title: "Nhân viên", dataIndex: "employee" },
                {
                  title: "Ngày giao",
                  dataIndex: "assignedDate",
                  render: (v) => v ? dayjs(v).format("DD/MM/YYYY") : "-",
                },
                {
                  title: "Cập nhật",
                  dataIndex: "updatedAt",
                  render: (v) => dayjs(v).format("HH:mm DD/MM/YYYY"),
                },
              ]}
            />
          </div>
        ))}
      </Modal>

      <StageManagerModal
        open={stageManagerOpen}
        onCancel={() => setStageManagerOpen(false)}
        onRefresh={() => fetchStages()}
      />

      <ModalForm
        formRef={userFormRef}
        title="Tạo tài khoản người dùng"
        open={addUserOpen}
        onOpenChange={(visible) => {
          if (!visible) {
            setAddUserOpen(false);
            userFormRef.current?.resetFields();
          }
        }}
        modalProps={{
          destroyOnClose: true,
          onCancel: () => {
            setAddUserOpen(false);
            userFormRef.current?.resetFields();
          },
        }}
        onFinish={async (values: any) => {
          try {
            const payload = {
              name: values.name,
              account: values.account,
              password: values.password,
              role: values.role,
              ...(values.phone && { phone: values.phone }),
              ...(values.baseSalary !== undefined && { baseSalary: values.baseSalary }),
            };
            await createUser(payload);
            setAddUserOpen(false);
            userFormRef.current?.resetFields();
            getAll({ page: 1, limit: 1000 }).catch(console.error);
            return true;
          } catch (error) {
            return false;
          }
        }}
      >
        <ProFormText
          name="name"
          label="Họ tên"
          placeholder="Nhập họ tên"
          rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
        />
        <ProFormText
          name="account"
          label="Tên đăng nhập"
          placeholder="Nhập tên đăng nhập"
          rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
        />
        <ProFormText
          name="phone"
          label="Số điện thoại"
          placeholder="Nhập số điện thoại"
          rules={[
            { required: false, message: 'Vui lòng nhập số điện thoại' },
            { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ' }
          ]}
        />
        <ProFormDigit
          name="baseSalary"
          label="Lương cơ bản"
          placeholder="Nhập lương cơ bản"
          fieldProps={{
            formatter: (value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
            parser: (value) => value ? Number(value.replace(/\$\s?|(,*)/g, '')) : 0,
            addonAfter: 'VND'
          }}
        />
        <ProFormText.Password
          name="password"
          label="Mật khẩu"
          placeholder="Nhập mật khẩu"
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
        />
        <ProFormSelect
          name="role"
          label="Vai trò"
          placeholder="Chọn vai trò"
          options={[
            { label: 'Giám đốc', value: Role.DIRECTOR },
            { label: 'Kế toán', value: Role.ACCOUNTANT },
            { label: 'Nhân viên', value: Role.STAFF },
            { label: 'Quản lý công trình', value: Role.SITE_MANAGER },
            { label: 'Khách hàng', value: Role.CUSTOMER }
          ]}
          rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
        />
      </ModalForm>
    </>
  );
};

export default ProjectProgressModal;