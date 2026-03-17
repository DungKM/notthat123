import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProCard, PageContainer } from '@ant-design/pro-components';
import { Button, Tag, Row, Col, message, Spin, Typography } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { Project, Role } from '@/src/types';
import { MOCK_PROJECTS } from '@/src/mockData';
import { useAuth } from '@/src/auth/hooks/useAuth';
import { useNotifications } from '@/src/hooks/useNotifications';

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

  const [loading, setLoading] = useState(true);
  const { addNotification } = useNotifications(user?.id);

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


    </PageContainer>
  );
};

export default ProjectDetailPage;
