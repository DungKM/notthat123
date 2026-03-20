import React, { useState, useRef } from 'react';
import {
  ProTable,
  ActionType,
  ProColumns,
} from '@ant-design/pro-components';
import { Project, Role } from '@/src/types';
import { Button, Space, message, Popconfirm, Tag, Badge } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, CheckSquareOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAuth } from '@/src/auth/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useProjectService } from '@/src/api/services';
import ProjectForm from './components/ProjectForm';
import ProjectApprovalModal from './components/ProjectApprovalModal';

const ProjectListPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const actionRef = useRef<ActionType>(null);
  const { request, create, patch, remove } = useProjectService();
  const [modalVisible, setModalVisible] = useState(false);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [pendingProjects, setPendingProjects] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('approved');

  if (!user) return null;

  const isDirectorOrAccountant = user.role === Role.DIRECTOR || user.role === Role.ACCOUNTANT;
  const isSiteManager = user.role === Role.SITE_MANAGER || user.role === Role.STAFF;

  const handleCreate = async (values: any) => {
    try {
      const statusValue = values.status === 'Duyệt' ? 'approved' : 'pending';
      const payload = {
        ...values,
        managerId: isSiteManager ? user.id : values.managerId,
        status: isSiteManager ? 'pending' : statusValue,
      };
      await create(payload);
      actionRef.current?.reload();
      if (isSiteManager) {
        message.success('Đã gửi yêu cầu duyệt dự án');
      }
      setModalVisible(false);
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
      setModalVisible(false);
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
    } catch {
      // handled
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await request('PATCH', `/${id}/approve`);
      actionRef.current?.reload();
      message.success('Đã duyệt dự án');
    } catch { }
  };

  const handleReject = async (id: string, reason: string) => {
    try {
      await request('PATCH', `/${id}/reject`, { reason });
      actionRef.current?.reload();
      message.success('Đã từ chối dự án');
    } catch { }
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
      render: (_, record) => {
        const isApproved = record.status === 'approved' || record.status === 'Duyệt';
        const isPending = record.status === 'pending' || record.status === 'Chờ duyệt';
        const isReject = record.status === 'reject' || record.status === 'Từ chối';

        let color = 'default';
        let label = record.status;
        if (isApproved) { color = 'green'; label = 'Duyệt'; }
        if (isPending) { color = 'orange'; label = 'Chờ duyệt'; }
        if (isReject) { color = 'red'; label = 'Từ chối'; }

        return (
          <Space direction="vertical" size={0}>
            <Tag color={color}>
              {label}
            </Tag>
            {record.status === 'Từ chối' && record.rejectReason && (
              <Tag color="error" style={{ fontSize: '11px', marginTop: '4px' }}>
                Lý do: {record.rejectReason}
              </Tag>
            )}
          </Space>
        );
      }
    },
    {
      title: 'Hành động',
      valueType: 'option',
      width: 150,
      render: (_, record) => {
        const isPending = record.status === 'pending' || record.status === 'Chờ duyệt';
        const canViewDetail = !(isDirectorOrAccountant && isPending);

        return [
          canViewDetail ? (
            <Button type="link" size="large" key="view" icon={<EyeOutlined />} onClick={() => navigate(`/quan-tri/du-an/${record.id || (record as any)._id}`)} />
          ) : (
            <span key="view-disabled" style={{ color: '#ccc', cursor: 'not-allowed', padding: '4px 15px' }} title="Vui lòng duyệt dự án trước khi xem chi tiết">
              <EyeOutlined />
            </span>
          ),
          isDirectorOrAccountant && (
            <Popconfirm key="delete" title="Xóa dự án này?" onConfirm={() => handleDelete(record.id || (record as any)._id)}>
              <Button type="link" size="large" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          ),
        ];
      },
    },
  ];

  return (
    <>
      <ProTable<any>
        headerTitle="Danh sách dự án"
        columns={columns as ProColumns<any>[]}
        actionRef={actionRef}
        rowKey={(record) => record.id || record._id}
        request={async (params) => {
          try {
            const queryParams: any = {
              page: params.current || 1,
              limit: params.pageSize || 10,
              status: activeTab, // Dùng giá trị tab đang chọn để lọc API
            };

            // Lọc theo text search (tên dự án mặc định)
            if (params.name) queryParams.search = params.name;
            if (params.ownerName) queryParams.ownerName = params.ownerName;

            if (isSiteManager) {
              queryParams.managerId = user.id;
            }

            // Gọi API ngầm lấy danh sách "Chờ duyệt" nạp vào Badge / Modal phê duyệt (chỉ dành cho QL)
            if (isDirectorOrAccountant) {
              request('GET', '', null, { status: 'pending', limit: 50 })
                .then(resP => { if (resP.data) setPendingProjects(resP.data); })
                .catch(() => { });
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
        search={{ labelWidth: 'auto' }}
        scroll={{ x: 'max-content' }}

        pagination={{ pageSize: 10, showSizeChanger: true }}
        toolbar={{
          menu: {
            type: 'tab',
            activeKey: activeTab,
            items: [
              {
                key: 'approved',
                label: 'Dự án đã duyệt',
              },
              {
                key: 'reject',
                label: 'Dự án bị từ chối',
              },
            ],
            onChange: (key) => {
              setActiveTab(key as string);
              setTimeout(() => actionRef.current?.reload(), 0);
            },
          },
        }}
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