import React, { useState, useRef } from 'react';
import {
  ProTable,
  ActionType,
  ProColumns,
  ProCard,
  ModalForm,
  ProFormText,
  ProFormTextArea,
  ProFormSelect,
} from '@ant-design/pro-components';
import { Project, Role } from '@/src/types';
import { MOCK_PROJECTS } from '@/src/mockData';
import { mockUsers } from '@/src/auth/mockUsers';
import { Tag, Button, Space, message, Row, Col, Statistic, Popconfirm } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, ToolOutlined, PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAuth } from '@/src/auth/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const ProjectManagementPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const actionRef = useRef<ActionType>(null);
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);

  if (!user) return null;

  const isSiteManager = user.role === Role.SITE_MANAGER;

  const displayProjects = isSiteManager
    ? projects.filter(p => p.managerId === user.id)
    : projects;

  const activeProjects = displayProjects.filter(p => p.status === 'Duyệt');

  const managerOptions = mockUsers
    .filter(u => u.role === Role.SITE_MANAGER || u.role === Role.STAFF)
    .map(u => ({ label: u.name, value: u.id }));

  const handleCreate = async (values: any) => {
    const newProject: Project = {
      id: Math.random().toString(36).substr(2, 9),
      name: values.name,
      address: values.address,
      ownerName: values.ownerName,
      ownerPhone: values.ownerPhone,
      managerId: values.managerId,
      status: values.status,
      createdAt: dayjs().toISOString(),
      details: [],
    };

    setProjects([newProject, ...projects]);
    message.success('Tạo dự án thành công!');
    setCreateModalVisible(false);
    return true;
  };

  const handleUpdate = async (values: any) => {
    if (!selectedProject) return false;

    const updatedProjects = projects.map(p =>
      p.id === selectedProject.id
        ? {
          ...p,
          ...values
        }
        : p
    );

    setProjects(updatedProjects);
    message.success('Cập nhật dự án thành công!');
    setEditModalVisible(false);
    setSelectedProject(null);
    return true;
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
    },
    {
      title: 'Chủ nhà',
      dataIndex: 'ownerName',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'ownerPhone',
    },
    {
      title: 'Người đảm nhiệm',
      dataIndex: 'managerId',
      valueType: 'select',
      valueEnum: mockUsers.reduce((acc, u) => {
        if (u.role === Role.SITE_MANAGER || u.role === Role.STAFF) {
          acc[u.id] = { text: u.name };
        }
        return acc;
      }, {} as any),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      valueType: 'date',
      render: (_, record) => dayjs(record.createdAt).format('DD/MM/YYYY'),
    },
    {
      title: 'Thao tác',
      valueType: 'option',
      width: 150,
      render: (_, record) => {
        const actions = [];

        actions.push(
          <Button key="view" type="link" size="small" icon={<EyeOutlined />} onClick={() => navigate(`/quan-tri/cong-trinh/${record.id}`)} />
        );

        const canEdit = user.role === Role.DIRECTOR || user.role === Role.ACCOUNTANT || isSiteManager;

        if (canEdit && !isSiteManager) {
          actions.push(
            <Button type="link" size="large" key="edit" icon={<EditOutlined />} onClick={() => {
              setSelectedProject(record);
              setEditModalVisible(true);
            }}>
              Sửa
            </Button>,
            <Popconfirm
              key="delete"
              title="Xác nhận xóa?"
              onConfirm={() => {
                setProjects(projects.filter(p => p.id !== record.id));
                message.success('Đã xóa');
              }}
            >
              <a style={{ color: '#ff4d4f' }}><DeleteOutlined /></a>
            </Popconfirm>
          );
        }

        return <Space>{actions}</Space>;
      },
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <ProCard bordered>
            <Statistic title="Số lượng dự án đang theo dõi" value={displayProjects.length} prefix={<ToolOutlined />} />
          </ProCard>
        </Col>
        <Col xs={24} sm={12}>
          <ProCard bordered>
            <Statistic title="Đang thi công / Duyệt" value={activeProjects.length} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#52c41a' }} />
          </ProCard>
        </Col>
      </Row> */}

      <ProTable<Project>
        headerTitle="Danh sách công trình / dự án"
        columns={columns}
        search={false}
        actionRef={actionRef}
        dataSource={displayProjects}
        rowKey="id"
        // search={{ labelWidth: 'auto' }}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1000 }}
        toolBarRender={() => {
          const canCreate = user.role === Role.DIRECTOR || user.role === Role.ACCOUNTANT || isSiteManager;
          return canCreate ? [
            <Button key="create" type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalVisible(true)}>
              Tạo dự án mới
            </Button>,
          ] : [];
        }}
      />

      <ModalForm
        title="Tạo dự án mới"
        open={createModalVisible}
        onOpenChange={setCreateModalVisible}
        onFinish={handleCreate}
        modalProps={{ destroyOnClose: true }}
      >
        <ProFormText name="name" label="Tên dự án" rules={[{ required: true }]} />
        <ProFormText name="address" label="Địa chỉ" rules={[{ required: true }]} />
        <ProFormText name="ownerName" label="Chủ nhà" rules={[{ required: true }]} />
        <ProFormText name="ownerPhone" label="Số điện thoại" rules={[{ required: true }]} />
        <ProFormSelect
          name="managerId"
          label="Người đảm nhiệm"
          options={managerOptions}
          rules={[{ required: true }]}
        />
        <ProFormSelect
          name="status"
          label="Trạng thái"
          options={['Chưa duyệt', 'Duyệt']}
          initialValue="Chưa duyệt"
        />
      </ModalForm>

      <ModalForm
        title="Chỉnh sửa dự án / công trình"
        open={editModalVisible}
        onOpenChange={setEditModalVisible}
        onFinish={handleUpdate}
        params={{ id: selectedProject?.id }}
        initialValues={selectedProject || {}}
        modalProps={{ destroyOnClose: true }}
      >
        <ProFormText name="name" label="Tên dự án" rules={[{ required: true }]} />
        <ProFormText name="address" label="Địa chỉ" rules={[{ required: true }]} />
        <ProFormText name="ownerName" label="Chủ nhà" rules={[{ required: true }]} />
        <ProFormText name="ownerPhone" label="Số điện thoại" rules={[{ required: true }]} />
        <ProFormSelect
          name="managerId"
          label="Người đảm nhiệm"
          options={managerOptions}
          rules={[{ required: true }]}
        />
        <ProFormSelect
          name="status"
          label="Trạng thái"
          options={['Chưa duyệt', 'Duyệt']}
        />
      </ModalForm>
    </div>
  );
};

export default ProjectManagementPage;
