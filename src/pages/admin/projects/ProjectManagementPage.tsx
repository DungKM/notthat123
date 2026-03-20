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
  ProFormDatePicker,
  ProFormGroup,
} from '@ant-design/pro-components';
import { Project, Role } from '@/src/types';
import { mockUsers } from '@/src/auth/mockUsers';
import { Tag, Button, Space, message, Row, Col, Statistic, Popconfirm } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, ToolOutlined, PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAuth } from '@/src/auth/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useProjectService } from '@/src/api/services';

const ProjectManagementPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const actionRef = useRef<ActionType>(null);
  const { request, create, patch, remove } = useProjectService();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);

  if (!user) return null;

  const isSiteManager = user.role === Role.SITE_MANAGER;

  const managerOptions = mockUsers
    .filter(u => u.role === Role.SITE_MANAGER || u.role === Role.STAFF)
    .map(u => ({ label: u.name, value: u.id }));

  const handleCreate = async (values: any) => {
    try {
      const payload = {
        ...values,
        managerId: isSiteManager ? user.id : values.managerId,
        status: isSiteManager ? 'Chờ duyệt' : (values.status || 'Duyệt'),
      };
      await create(payload);
      actionRef.current?.reload();
      message.success('Tạo dự án thành công!');
      setCreateModalVisible(false);
      return true;
    } catch {
      return false;
    }
  };

  const handleUpdate = async (values: any) => {
    if (!selectedProject) return false;
    try {
      await patch(selectedProject.id || selectedProject._id, values);
      actionRef.current?.reload();
      message.success('Cập nhật dự án thành công!');
      setEditModalVisible(false);
      setSelectedProject(null);
      return true;
    } catch {
      return false;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await remove(id);
      actionRef.current?.reload();
      message.success('Đã xóa dự án');
    } catch {
      // handled
    }
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
              title="Xóa dự án này?"
              onConfirm={() => handleDelete(record.id || (record as any)._id)}
            >
              <Button type="link" size="large" danger icon={<DeleteOutlined />} />
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

      <ProTable<any>
        headerTitle="Danh sách công trình / dự án"
        columns={columns as ProColumns<any>[]}
        search={false}
        actionRef={actionRef}
        rowKey={(record) => record.id || record._id}
        request={async (params) => {
          try {
            const queryParams: any = {
              page: params.current || 1,
              limit: params.pageSize || 10,
            };
            if (isSiteManager) {
              queryParams.managerId = user.id;
            }
            const res = await request('GET', '', null, queryParams);
            return {
              data: res.data || [],
              success: true,
              total: res.meta?.total || 0,
            };
          } catch (e) {
            return { data: [], success: false, total: 0 };
          }
        }}
        pagination={{ pageSize: 10, showSizeChanger: true }}
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
        <ProFormGroup>
          <ProFormDatePicker
            name="startDate"
            label="Ngày bắt đầu"
            rules={[{ required: true }]}
            transform={(value) => ({ startDate: value ? new Date(value).toISOString() : value })}
          />
          <ProFormDatePicker
            name="endDate"
            label="Ngày kết thúc"
            rules={[{ required: true }]}
            transform={(value) => ({ endDate: value ? new Date(value).toISOString() : value })}
          />
        </ProFormGroup>
        <ProFormSelect
          name="managerId"
          label="Người đảm nhiệm"
          options={managerOptions}
          rules={[{ required: true }]}
        />
        <ProFormSelect
          name="status"
          label="Trạng thái"
          options={['Chờ duyệt', 'Duyệt']}
          initialValue="Chờ duyệt"
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
        <ProFormGroup>
          <ProFormDatePicker
            name="startDate"
            label="Ngày bắt đầu"
            rules={[{ required: true }]}
            transform={(value) => ({ startDate: value ? new Date(value).toISOString() : value })}
          />
          <ProFormDatePicker
            name="endDate"
            label="Ngày kết thúc"
            rules={[{ required: true }]}
            transform={(value) => ({ endDate: value ? new Date(value).toISOString() : value })}
          />
        </ProFormGroup>
        <ProFormSelect
          name="managerId"
          label="Người đảm nhiệm"
          options={managerOptions}
          rules={[{ required: true }]}
        />
        <ProFormSelect
          name="status"
          label="Trạng thái"
          options={['Chờ duyệt', 'Duyệt']}
        />
      </ModalForm>
    </div>
  );
};

export default ProjectManagementPage;
