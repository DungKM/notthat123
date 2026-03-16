import React, { useState, useRef } from 'react';
import {
  ProTable,
  ActionType,
  ProColumns,
} from '@ant-design/pro-components';
import { Project, Role } from '@/src/types';
import { MOCK_PROJECTS } from '@/src/mockData';
import { Button, Space, message, Popconfirm, Tag, Badge } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, CheckSquareOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAuth } from '@/src/auth/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import ProjectForm from './components/ProjectForm';
import ProjectApprovalModal from './components/ProjectApprovalModal';

const ProjectListPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const actionRef = useRef<ActionType>(null);
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [modalVisible, setModalVisible] = useState(false);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  if (!user) return null;

  const isDirectorOrAccountant = user.role === Role.DIRECTOR || user.role === Role.ACCOUNTANT;
  const isSiteManager = user.role === Role.SITE_MANAGER || user.role === Role.STAFF ;

  // Danh sách dự án chờ duyệt (cho admin/kế toán)
  const pendingProjects = projects.filter(p => p.status === 'Chờ duyệt');

  // Lọc dự án theo quyền
  const displayProjects = isSiteManager
    ? projects.filter(p => p.managerId === user.id)
    : projects;

  const handleCreate = async (values: any) => {
    const newProject: Project = {
      id: Math.random().toString(36).substr(2, 9),
      ...values,
      managerId: isSiteManager ? user.id : values.managerId,
      createdBy: user.name,
      status: isSiteManager ? 'Chờ duyệt' : (values.status || 'Duyệt'),
      createdAt: dayjs().toISOString(),
      details: [],
    };
    setProjects([newProject, ...projects]);
    if (isSiteManager) {
      message.success('Đã gửi yêu cầu duyệt dự án');
    } else {
      message.success('Tạo dự án thành công');
    }
    setModalVisible(false);
    return true;
  };

  const handleUpdate = async (values: any) => {
    if (!selectedProject) return false;
    const updated = projects.map(p =>
      p.id === selectedProject.id ? { ...p, ...values } : p
    );
    setProjects(updated);
    message.success('Cập nhật thành công');
    setModalVisible(false);
    setSelectedProject(null);
    return true;
  };

  const handleDelete = (id: string) => {
    setProjects(projects.filter(p => p.id !== id));
    message.success('Đã xóa dự án');
  };

  const handleApprove = (id: string) => {
    setProjects(projects.map(p => p.id === id ? { ...p, status: 'Duyệt' } : p));
    message.success('Đã duyệt dự án');
  };

  const handleReject = (id: string, reason: string) => {
    setProjects(projects.map(p => p.id === id ? { ...p, status: 'Từ chối', rejectReason: reason } : p));
    message.success('Đã từ chối dự án');
  };

  const columns: ProColumns<Project>[] = [
    {
      title: 'Tên dự án',
      dataIndex: 'name',
      copyable: true,
      ellipsis: true,
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: 'Chủ nhà',
      dataIndex: 'ownerName',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'ownerPhone',
      hideInSearch: true,
    },
    {
      title: 'Tiến độ dự án',
      dataIndex: 'progress',
      hideInSearch: true,
      render: (_, record) => {
        const latestProgress = record.progress && record.progress.length > 0
          ? record.progress[record.progress.length - 1].status
          : 'Chưa có tiến độ';

        // Chọn màu dựa trên tiến độ
        let color = 'default';
        if (latestProgress.includes('Khảo sát')) color = 'blue';
        if (latestProgress.includes('Hợp đồng')) color = 'cyan';
        if (latestProgress.includes('Thi công')) color = 'orange';
        if (latestProgress.includes('Bàn giao')) color = 'green';
        if (latestProgress.includes('Phát sinh')) color = 'red';

        return <Tag color={color}>{latestProgress}</Tag>;
      }
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      valueType: 'date',
      sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      hideInSearch: true,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Tag color={
            record.status === 'Duyệt' ? 'green' :
              record.status === 'Chờ duyệt' ? 'orange' :
                record.status === 'Từ chối' ? 'red' : 'default'
          }>
            {record.status}
          </Tag>
          {record.status === 'Từ chối' && record.rejectReason && (
            <Tag color="error" style={{ fontSize: '11px', marginTop: '4px' }}>
              Lý do: {record.rejectReason}
            </Tag>
          )}
        </Space>
      )
    },
    {
      title: 'Hành động',
      valueType: 'option',
      width: 150,
      render: (_, record) => {
        const isPending = record.status === 'Chờ duyệt';
        const canViewDetail = !(isDirectorOrAccountant && isPending);

        return [
          canViewDetail ? (
            <a key="view" onClick={() => navigate(`/quan-tri/du-an/${record.id}`)}>
              <EyeOutlined /> Chi tiết
            </a>
          ) : (
            <span key="view-disabled" style={{ color: '#ccc', cursor: 'not-allowed' }} title="Vui lòng duyệt dự án trước khi xem chi tiết">
              <EyeOutlined /> Chi tiết
            </span>
          ),
          isDirectorOrAccountant && (
            <a key="edit" onClick={() => {
              setSelectedProject(record);
              setModalVisible(true);
            }}>
              <EditOutlined />
            </a>
          ),
          isDirectorOrAccountant && (
            <Popconfirm key="delete" title="Xóa dự án này?" onConfirm={() => handleDelete(record.id)}>
              <a style={{ color: 'red' }}><DeleteOutlined /></a>
            </Popconfirm>
          ),
        ];
      },
    },
  ];

  return (
    <>
      <ProTable<Project>
        search={false}
        headerTitle="Danh sách dự án"
        columns={columns}
        actionRef={actionRef}
        dataSource={displayProjects}
        rowKey="id"
        // search={{ labelWidth: 'auto' }}
        toolBarRender={() => [
          isDirectorOrAccountant && (
            <Badge key="pending" count={pendingProjects.length} size="small" offset={[-5, 5]}>
              <Button
                icon={<CheckSquareOutlined />}
                onClick={() => setApprovalModalOpen(true)}
              >
                Duyệt dự án
              </Button>
            </Badge>
          ),
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setSelectedProject(null);
              setModalVisible(true);
            }}
          >
            Tạo dự án mới
          </Button>,
        ]}
      />

      <ProjectForm
        title={selectedProject ? 'Sửa dự án' : 'Tạo dự án mới'}
        open={modalVisible}
        onOpenChange={setModalVisible}
        onFinish={selectedProject ? handleUpdate : handleCreate}
        initialValues={selectedProject || {}}
        role={user.role}
      />

      <ProjectApprovalModal
        open={approvalModalOpen}
        onOpenChange={setApprovalModalOpen}
        pendingProjects={pendingProjects}
        onApprove={handleApprove}
        onReject={handleReject}
        showViewButton={false} // Ẩn nút "Xem" trong modal này
      />
    </>
  );
};

export default ProjectListPage;