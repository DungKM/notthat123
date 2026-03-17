import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProCard, PageContainer, ModalForm, ProFormSelect, ProFormTextArea } from '@ant-design/pro-components';
import { Button, Descriptions, Tag, Row, Col, message, Spin, Typography, Card, List, Space } from 'antd';
import { EditOutlined, ArrowLeftOutlined, PlusOutlined, SendOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { Project, Role, TaskNotification } from '@/src/types';
import { MOCK_PROJECTS } from '@/src/mockData';
import { useAuth } from '@/src/auth/hooks/useAuth';
import { useNotifications } from '@/src/hooks/useNotifications';
import { mockUsers } from '@/src/auth/mockUsers';
import ProjectDetailTable from './components/ProjectDetailTable';
import ProjectForm from './components/ProjectForm';
import ProjectProgressModal from './components/ProjectProgressModal';
import dayjs from 'dayjs';

const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [progressModalVisible, setProgressModalVisible] = useState(false);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const { addNotification, allNotifications } = useNotifications(user?.id);

  // Lọc thông báo thuộc dự án hiện tại (tất cả, không chỉ của user)
  const projectNotifications = allNotifications.filter((n: TaskNotification) => n.projectId === id);

  useEffect(() => {
    // Giả lập load dữ liệu từ mock data
    const found = MOCK_PROJECTS.find(p => p.id === id);
    if (found) {
      setProject(found);
    } else {
      message.error('Không tìm thấy dự án');
      navigate('/quan-tri/cong-trinh');
    }
    setLoading(false);
  }, [id, navigate]);

  if (loading || !project || !user) {
    return <div className="p-10 text-center"><Spin size="large" /></div>;
  }

  const isDirector = user.role === Role.DIRECTOR || user.role === Role.ACCOUNTANT;
  const isSiteManager = user.role === Role.SITE_MANAGER;

  // Danh sách nhân viên có thể giao việc
  const assignableUsers = mockUsers.filter(
    (u) => u.role === Role.STAFF || u.role === Role.SITE_MANAGER
  );

  const handleAssignTask = async (values: any) => {
    const assignee = mockUsers.find((u) => u.id === values.assigneeId);
    if (!assignee || !project) return false;

    addNotification({
      projectId: project.id,
      projectName: project.name,
      assigneeId: assignee.id,
      assigneeName: assignee.name,
      assignedById: user.id,
      assignedByName: user.name,
      taskDescription: values.taskDescription,
    });

    message.success(`Đã giao việc cho ${assignee.name}`);
    setAssignModalVisible(false);
    return true;
  };

  const handleUpdateProject = async (values: any) => {
    const updated = { ...project, ...values };
    setProject(updated);
    message.success('Cập nhật thông tin dự án thành công');
    setEditModalVisible(false);
    return true;
  };

  const handleUpdateDetails = (newDetails: any[]) => {
    if (!project) return;
    setProject({ ...project, details: newDetails });
  };

  const handleUpdateProgress = (newProgress: any[]) => {
    if (!project) return;
    setProject({ ...project, progress: newProgress });
  };

  return (
    <PageContainer
      header={{
        title: `Chi tiết dự án: ${project.name}`,
        onBack: () => navigate(-1),
        extra: [
          isDirector && (
            <Button
              key="edit"
              icon={<EditOutlined />}
              onClick={() => setEditModalVisible(true)}
            >
              Cập nhật dự án
            </Button>
          ),
        ],
      }}
    >
      <Row gutter={[16, 16]}>
        {/* Thông tin chung */}
        <Col span={24}>
          <ProCard
            title={<Typography.Text strong style={{ fontSize: '18px' }}>Thông tin dự án</Typography.Text>}
            bordered
            headerBordered
          >
            <Row gutter={[48, 16]}>
              <Col xs={24} md={12}>
                <div style={{ marginBottom: '16px' }}>
                  <Typography.Text type="secondary" style={{ display: 'block', marginBottom: '4px' }}>Tên dự án</Typography.Text>
                  <Typography.Text strong style={{ fontSize: '16px' }}>{project.name}</Typography.Text>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <Typography.Text type="secondary" style={{ display: 'block', marginBottom: '4px' }}>Địa chỉ</Typography.Text>
                  <Typography.Text style={{ fontSize: '16px' }}>{project.address}</Typography.Text>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <Typography.Text type="secondary" style={{ display: 'block', marginBottom: '4px' }}>Chủ nhà</Typography.Text>
                  <Typography.Text style={{ fontSize: '16px' }}>{project.ownerName} - {project.ownerPhone}</Typography.Text>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <Typography.Text type="secondary" style={{ display: 'block', marginBottom: '4px' }}>Người tạo dự án</Typography.Text>
                  <Typography.Text strong style={{ fontSize: '16px', color: '#1890ff' }}>{project.createdBy || 'N/A'}</Typography.Text>
                </div>
              </Col>
              <Col xs={24} md={12}>
                <div style={{ marginBottom: '16px' }}>
                  <Typography.Text type="secondary" style={{ display: 'block', marginBottom: '4px' }}>Ngày tạo</Typography.Text>
                  <Typography.Text style={{ fontSize: '16px' }}>{dayjs(project.createdAt).format('DD/MM/YYYY')}</Typography.Text>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <Typography.Text type="secondary" style={{ display: 'block', marginBottom: '4px' }}>Trạng thái</Typography.Text>
                  <div>
                    <Tag color={project.status === 'Duyệt' ? 'green' : project.status === 'Chờ duyệt' ? 'orange' : 'default'} style={{ fontSize: '14px' }}>
                      {project.status}
                    </Tag>
                  </div>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <Typography.Text type="secondary" style={{ display: 'block', marginBottom: '4px', }}>Tiến độ hiện tại</Typography.Text>
                  <Button
                    type="link"
                    onClick={() => {
                      if (project.status === 'Chờ duyệt') {
                        message.warning('Vui lòng duyệt dự án trước khi xem/cập nhật tiến độ');
                        return;
                      }
                      setProgressModalVisible(true);
                    }}
                    style={{ 
                      padding: 0, 
                      fontSize: '16px', 
                      fontWeight: 500, 
                      height: 'auto', 
                      textDecoration: project.status === 'Chờ duyệt' ? 'none' : 'underline', 
                      color: project.status === 'Chờ duyệt' ? '#ccc' : 'red',
                      cursor: project.status === 'Chờ duyệt' ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {project.status === 'Chờ duyệt' ? 'Chưa thể xem tiến độ' : (
                      project.progress && project.progress.length > 0
                        ? project.progress[project.progress.length - 1].status
                        : 'Chưa có tiến độ'
                    )}
                  </Button>
                </div>
              </Col>
            </Row>
          </ProCard>
        </Col>

        {/* Ẩn phần chi tiết với Công trình */}
        {!isSiteManager && (
          <Col span={24}>
            <ProCard
              title={<Typography.Text strong style={{ fontSize: '18px' }}>Chi tiết nội thất & hạch toán</Typography.Text>}
              bordered
              headerBordered
            >
              <ProjectDetailTable
                projectId={project.id}
                details={project.details}
                onUpdate={handleUpdateDetails}
                role={user.role}
              />
            </ProCard>
          </Col>
        )}

        {/* Section Giao việc - chỉ hiển cho Giám đốc/Kế toán */}
        {isDirector && (
          <Col span={24}>
            <Card
              title={
                <Typography.Text strong style={{ fontSize: '18px' }}>
                  📌 Giao việc cho nhân viên
                </Typography.Text>
              }
              bordered
              extra={
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setAssignModalVisible(true)}
                >
                  Giao việc mới
                </Button>
              }
            >
              {projectNotifications.length === 0 ? (
                <Typography.Text type="secondary">Chưa có công việc nào được giao cho dự án này.</Typography.Text>
              ) : (
                <List
                  dataSource={projectNotifications}
                  renderItem={(item: TaskNotification) => (
                    <List.Item>
                      <List.Item.Meta
                        title={
                          <Space>
                            <Typography.Text strong>{item.taskDescription}</Typography.Text>
                            <Tag color={item.isRead ? 'default' : 'blue'}>
                              {item.isRead ? 'Đã đọc' : 'Chưa đọc'}
                            </Tag>
                          </Space>
                        }
                        description={
                          <Space>
                            <ClockCircleOutlined />
                            <span>{dayjs(item.createdAt).format('DD/MM/YYYY HH:mm')}</span>
                            <span>—</span>
                            <span>Giao cho: <strong>{item.assigneeName}</strong></span>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              )}
            </Card>
          </Col>
        )}
      </Row>

      <ProjectForm
        title="Sửa thông tin dự án"
        open={editModalVisible}
        onOpenChange={setEditModalVisible}
        onFinish={handleUpdateProject}
        initialValues={project}
        role={user.role}
      />

      <ProjectProgressModal
        open={progressModalVisible}
        onOpenChange={setProgressModalVisible}
        progress={project.progress || []}
        onUpdate={handleUpdateProgress}
        onTaskAssigned={(task) => {
          addNotification({
            projectId: project.id,
            projectName: project.name,
            assigneeId: task.employeeId,
            assigneeName: task.employeeName,
            assignedById: user.id,
            assignedByName: user.name,
            taskDescription: task.work,
          });
        }}
      />

      {/* Modal giao việc */}
      <ModalForm
        title="Giao việc mới"
        open={assignModalVisible}
        modalProps={{
          destroyOnClose: true,
          onCancel: () => setAssignModalVisible(false),
        }}
        onOpenChange={setAssignModalVisible}
        onFinish={handleAssignTask}
        width={500}
      >
        <ProFormSelect
          name="assigneeId"
          label="Chọn nhân viên"
          options={assignableUsers.map((u) => ({
            label: `${u.name} (${u.role})`,
            value: u.id,
          }))}
          rules={[{ required: true, message: 'Vui lòng chọn nhân viên' }]}
          placeholder="Chọn nhân viên để giao việc..."
        />
        <ProFormTextArea
          name="taskDescription"
          label="Mô tả công việc"
          placeholder="Ví dụ: Khảo sát hiện trạng căn hộ, lắp đặt tủ bếp..."
          rules={[{ required: true, message: 'Vui lòng nhập mô tả công việc' }]}
          fieldProps={{ rows: 3 }}
        />
      </ModalForm>
    </PageContainer>
  );
};

export default ProjectDetailPage;
