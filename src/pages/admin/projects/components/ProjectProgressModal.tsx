import React, { useState } from "react";
import { Modal, Button, Select, Input, Space, Table, message } from "antd";
import {
  PlusOutlined,
  SaveOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import { ProjectProgress, ProjectStatus } from "@/src/types";
import { mockUsers } from "@/src/auth/mockUsers";
import { Role } from "@/src/auth/types";
import dayjs from "dayjs";

// Lấy danh sách nhân viên có thể giao việc (Staff + Site Manager)
const assignableEmployees = mockUsers.filter(
  (u) => u.role === Role.STAFF || u.role === Role.SITE_MANAGER
);
const statusOptions: ProjectStatus[] = [
  'Tư vấn + gặp khách + khảo sát',
  'Lập dự toán ngân sách',
  'Duyệt hợp đồng',
  'Thi công sản xuất',
  'Bàn giao thanh lý hợp đồng',
  'Phát sinh hợp đồng',
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  progress: ProjectProgress[];
  onUpdate: (data: ProjectProgress[]) => void;
  onTaskAssigned?: (task: { employeeId: string; employeeName: string; work: string }) => void;
}

const ProjectProgressModal: React.FC<Props> = ({
  open,
  onOpenChange,
  progress,
  onUpdate,
  onTaskAssigned,
}) => {
  const [currentStatus, setCurrentStatus] = useState<ProjectProgress | null>(
    null
  );
  const [historyOpen, setHistoryOpen] = useState(false);

  // thêm trạng thái (chỉ cho phép 1)
  const addStatus = () => {
    if (currentStatus) {
      message.warning("Bạn cần lưu trạng thái hiện tại trước");
      return;
    }

    const newStatus: ProjectProgress = {
      id: Math.random().toString(36).slice(2),
      status: statusOptions[0],
      tasks: [],
    };

    setCurrentStatus(newStatus);
  }; 
      
  // lưu trạng thái
  const saveStatus = () => {
    if (!currentStatus) {
      message.warning("Không có trạng thái để lưu");
      return;
    }

    onUpdate([...progress, currentStatus]);

    // Tạo thông báo cho từng task được giao
    if (onTaskAssigned) {
      currentStatus.tasks.forEach((task) => {
        if (task.employee) {
          // Tìm user ID từ tên nhân viên
          const matchedUser = assignableEmployees.find((u) => u.id === task.employee || u.name === task.employee);
          if (matchedUser) {
            onTaskAssigned({
              employeeId: matchedUser.id,
              employeeName: matchedUser.name,
              work: task.work,
            });
          }
        }
      });
    }

    setCurrentStatus(null);
    message.success("Đã lưu tiến độ và giao việc");
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
              onClick={() => setHistoryOpen(true)}
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
                    width: 180,
                    render: (_, record) =>
                      dayjs(record.updatedAt).format("HH:mm DD/MM/YYYY"),
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
        {progress.map((p) => (
          <div
            key={p.id}
            style={{
              border: "1px solid #eee",
              padding: 16,
              borderRadius: 8,
              marginBottom: 16,
            }}
          >
            <h4>{p.status}</h4>

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