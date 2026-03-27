import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProCard, PageContainer } from '@ant-design/pro-components';
import { Button, Tag, Row, Col, message, Spin, Typography } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { Project, Role } from '@/src/types';
import { useAuth } from '@/src/auth/hooks/useAuth';
import { useProjectService } from '@/src/api/services';
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
  const [historyProgress, setHistoryProgress] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const { request, patch } = useProjectService();
  const { addNotification } = useNotifications(user?.id);

  useEffect(() => {
    if (!id) return;
    const fetchProject = async () => {
      try {
        setLoading(true);
        const res = await request('GET', `/${id}`);
        if (res.data) {
          setProject(res.data);
        } else {
          message.error('Không tìm thấy dự án');
          navigate('/quan-tri/cong-trinh');
        }
      } catch (err) {
        message.error('Không tìm thấy dự án');
        navigate('/quan-tri/cong-trinh');
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id, navigate]);

  if (loading || !project || !user) {
    return <div className="p-10 text-center"><Spin size="large" /></div>;
  }

  const isDirector = user.role === Role.DIRECTOR || user.role === Role.ACCOUNTANT;
  const isSiteManager = user.role === Role.SITE_MANAGER;

  const loadHistoryProgress = async () => {
    if (!project) return;
    try {
      const res = await request('GET', `/${project.id || (project as any)._id}/progress`);
      if (res.data) setHistoryProgress(res.data);
    } catch {
      message.error('Lỗi lấy lịch sử tiến độ');
    }
  };

  const handleUpdateProject = async (values: any) => {
    if (!project) return false;
    try {
      await patch(project.id || (project as any)._id, values);
      const updated = { ...project, ...values };
      setProject(updated);
      setEditModalVisible(false);
      return true;
    } catch {
      return false;
    }
  };

  const handleUpdateDetails = async (newDetails: any[], saveToServer = true, singleRowData?: any, action?: 'save' | 'delete') => {
    if (!project) return;
    setProject({ ...project, details: newDetails });

    if (saveToServer) {
      try {
        if (singleRowData) {
          const projectId = project.id || (project as any)._id;
          const detailId = singleRowData.id || singleRowData._id;
          const isNew = String(detailId).length !== 24;

          if (action === 'delete') {
            if (!isNew) {
              await request('DELETE', `/${projectId}/details/${detailId}`);
            }
          } else {
            if (isNew) {
              await request('POST', `/${projectId}/details`, singleRowData);
              const res = await request('GET', `/${projectId}`);
              if (res.data) setProject(res.data);
            } else {
              await request('PATCH', `/${projectId}/details/${detailId}`, singleRowData);
            }
          }
        } else {
          await patch(project.id || (project as any)._id, { details: newDetails });
        }
      } catch (e) {
        message.error('Lỗi khi cập nhật chi tiết');
      }
    }
  };

  const handleUpdateProgress = async (newProgress: any[]) => {
    if (!project) return;
    try {
      const backendProgress = newProgress.map(p => ({
        stage: p.status || p.stage,
        updates: (p.tasks || p.updates || []).map((t: any) => ({
          name: t.work || t.name,
          user: t.employee || t.user,
          updatedAt: t.updatedAt
        }))
      }));

      const currentProgStr = backendProgress.length > 0 ? backendProgress[backendProgress.length - 1].stage : project.currentProgress;

      await patch(project.id || (project as any)._id, { progress: backendProgress, currentProgress: currentProgStr });
      setProject({ ...project, progress: backendProgress, currentProgress: currentProgStr });
    } catch (e) {
      // lỗi api
    }
  };

  const handleSaveProgressTasks = async (stage: string, tasks: any[]) => {
    if (!project) return false;
    const projectId = project.id || (project as any)._id;
    try {
      for (const task of tasks) {
        const taskId = task.id || task._id;
        // Trích xuất string ID từ task.employee (có thể là string hoặc object từ server)
        const userId = task.employee
          ? (typeof task.employee === 'object'
              ? task.employee.id || task.employee._id
              : task.employee)
          : undefined;
        // Task có MongoDB ObjectId (24 ký tự) là task đã có trên server → PATCH để cập nhật
        const isExisting = taskId && String(taskId).length === 24;

        if (isExisting) {
          // PATCH /projects/{id}/progress/{progressId} - chỉ cập nhật name và userId
          await request('PATCH', `/${projectId}/progress/${taskId}`, {
            name: task.work,
            userId,
          });
        } else {
          // Task mới tạo ở frontend → POST để tạo mới
          await request('POST', `/${projectId}/progress`, {
            stage: stage,
            name: task.work,
            userId,
          });
        }
      }

      // Refresh project to get the newly updated progress from server
      const res = await request('GET', `/${projectId}`);
      if (res.data) setProject(res.data);

      return true;
    } catch (e) {
      return false;
    }
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
                  <Typography.Text strong style={{ fontSize: '16px', color: '#1890ff' }}>{project.createdById?.name || (typeof project.createdById === 'string' ? project.createdById : 'N/A')}</Typography.Text>
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
                        ? (project.progress[project.progress.length - 1].status || project.progress[project.progress.length - 1].stage)
                        : (project.currentProgress || 'Chưa có tiến độ')
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
        progress={(project.progress || []).map(p => ({
          id: p.id || Math.random().toString(),
          status: (p.status || p.stage) as any,
          tasks: (p.tasks || p.updates || []).map((t: any) => ({
            ...t,
            id: t.id || Math.random().toString(),
            work: t.work || t.name,
            employee: t.employee || t.userId || t.user, // Add userId to support fallback Name
            updatedAt: t.updatedAt,
            isSaved: true
          }))
        }))}
        historyProgress={(historyProgress || []).map(p => ({
          id: p.id || Math.random().toString(),
          status: (p.status || p.stage) as any,
          tasks: (p.tasks || p.updates || []).map((t: any) => ({
            ...t,
            id: t.id || Math.random().toString(),
            work: t.work || t.name,
            employee: t.user || t.employee,
            updatedAt: t.updatedAt,
            isSaved: true
          }))
        }))}
        onLoadHistory={loadHistoryProgress}
        onUpdate={handleUpdateProgress}
        onSaveTasks={handleSaveProgressTasks}
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
