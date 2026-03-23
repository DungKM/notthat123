import React, { useState } from "react";
import { Modal, Button, Select, Input, Space, Table, message, Typography } from "antd";
import {
  PlusOutlined,
  SaveOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import { ProjectProgress, ProjectStatus } from "@/src/types";
import { Role } from "@/src/auth/types";
import dayjs from "dayjs";
import { useUserService } from "@/src/api/services";
const statusOptions: ProjectStatus[] = [
  'Tư vấn + gặp khách + khảo sát',
  'Lập dự toán ngân sách',
  'Duyệt hợp đồng',
  'Thi công sản xuất',
  'Bàn giao thanh lý hợp đồng',
  'Phát sinh hợp đồng',
];
const { Title } = Typography;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  progress: ProjectProgress[];
  historyProgress?: ProjectProgress[];
  onLoadHistory?: () => void;
  onUpdate: (data: ProjectProgress[]) => void;
  onSaveTasks?: (stage: string, tasks: any[]) => Promise<boolean>;
  onTaskAssigned?: (task: { employeeId: string; employeeName: string; work: string }) => void;
}

const ProjectProgressModal: React.FC<Props> = ({
  open,
  onOpenChange,
  progress,
  historyProgress,
  onLoadHistory,
  onUpdate,
  onSaveTasks,
  onTaskAssigned,
}) => {
  const [currentStatus, setCurrentStatus] = useState<ProjectProgress | null>(
    null
  );
  const [historyOpen, setHistoryOpen] = useState(false);
  const { list: users, getAll } = useUserService();

  React.useEffect(() => {
    if (open) {
      // Fetch user list when modal opens with limit to ensure we get a sufficient list of assignable employees
      getAll({ page: 1, limit: 1000 }).catch(console.error);
    } else {
      // Reset khi đóng phòng trường hợp mở lại dự án khác
      setCurrentStatus(null);
    }
  }, [open, getAll]);

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

  // Lấy danh sách nhân viên có thể giao việc (Staff + Site Manager)
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
            status: statusOptions[0],
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
      status: statusOptions[0],
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

    const unsavedTasks = currentStatus.tasks.filter(t => !(t as any).isSaved && t.work && t.employee);

    if (unsavedTasks.length === 0) {
      // Just update updatedAt if needed locally
      message.success("Đã ghi nhận ở giao diện. Vui lòng thêm công việc mới nếu muốn lưu lên hệ thống.");
      return;
    }

    if (onSaveTasks) {
      const success = await onSaveTasks(currentStatus.status as string, unsavedTasks);
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
        t.id === taskId ? { ...t, [field]: value } : t
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
        footer={[
          <Button key="close" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>,
        ]}
      >
        <Space direction="vertical" style={{ width: "100%" }} size={24}>
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={addStatus}>
              Thêm trạng thái
            </Button>

            <Button danger icon={<SaveOutlined />} onClick={saveStatus}>
              Lưu
            </Button>

            <Button
              icon={<HistoryOutlined />}
              onClick={() => {
                if (onLoadHistory) onLoadHistory();
                setHistoryOpen(true);
              }}
            >
              Lịch sử tiến độ
            </Button>
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
                  options={statusOptions.map((s) => ({
                    label: s,
                    value: s,
                  }))}
                  onChange={(value) =>
                    setCurrentStatus({ ...currentStatus, status: value })
                  }
                />

                <Button
                  icon={<PlusOutlined />}
                  type="dashed"
                  onClick={addTask}
                >
                  Thêm công việc
                </Button>
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
                        options={assignableEmployees.map((e) => ({
                          label: `${e.name} (${e.role})`,
                          value: e.id,
                        }))}
                        onChange={(value) =>
                          updateTask(record.id, "employee", value)
                        }
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
                  title: "Cập nhật",
                  dataIndex: "updatedAt",
                  render: (v) => dayjs(v).format("HH:mm DD/MM/YYYY"),
                },
              ]}
            />
          </div>
        ))}
      </Modal>
    </>
  );
};

export default ProjectProgressModal;