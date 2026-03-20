import React, { useRef, useState } from 'react';
import { Button, Popconfirm, Space, Typography } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ModalForm, ProFormText, ProTable } from '@ant-design/pro-components';
import { useAuth } from '@/src/auth/hooks/useAuth';
import { useVideoService } from '@/src/api/services';

// ─── Types ───────────────────────────────────────────────────────────────────
interface VideoItem {
  id: string;
  title: string;
  url: string;
  createdAt?: string;
  updatedAt?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────
const VideoManagementPage: React.FC = () => {
  const { user } = useAuth();
  const actionRef = useRef<ActionType | undefined>(undefined);

  // Hook gọi API cho video
  const { getAll, create, patch, remove } = useVideoService();

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<VideoItem | null>(null);

  if (!user) return null;

  // ─── Columns ─────────────────────────────────────────────────────────────
  const columns: ProColumns<VideoItem>[] = [
    {
      title: 'STT',
      dataIndex: 'index',
      valueType: 'index',
      width: 48,
      align: 'center',
    },
    {
      title: 'Tiêu đề video',
      dataIndex: 'title',
      ellipsis: true,
    },
    {
      title: 'Đường dẫn URL',
      dataIndex: 'url',
      ellipsis: true,
      render: (_, record) => (
        <Space>
          <a href={record.url} target="_blank" rel="noopener noreferrer">
            {record.url}
          </a>
          <Typography.Text copyable={{ text: record.url }} />
        </Space>
      ),
    },

    {
      title: 'Thao tác',
      valueType: 'option',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="large"
            icon={<EditOutlined />}
            onClick={() => {
              setEditRecord(record);
              setEditOpen(true);
            }}
            title="Sửa"
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xoá video này?"
            description="Hành động này không thể hoàn tác."
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
            onConfirm={async () => {
              if (record.id) {
                await remove(record.id);
                actionRef.current?.reload();
              }
            }}
          >
            <Button type="link" size="large" danger icon={<DeleteOutlined />} title="Xóa" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Các trường form dùng chung
  const renderFormFields = () => (
    <>
      <ProFormText
        name="title"
        label="Tiêu đề video"
        rules={[{ required: true, message: 'Vui lòng nhập tiêu đề video' }]}
      />
      <ProFormText
        name="url"
        label="Đường dẫn URL (Youtube)"
        rules={[
          { required: true, message: 'Vui lòng nhập đường dẫn URL' },
          { type: 'url', message: 'Đường dẫn không hợp lệ' },
        ]}
      />
    </>
  );

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <ProTable<VideoItem>
        columns={columns}
        actionRef={actionRef}
        rowKey="id"
        headerTitle="Quản lý Video"
        request={async (params) => {
          const { current, pageSize, title, ...rest } = params;
          const list = await getAll({
            page: current,
            limit: pageSize,
            title,
            ...rest
          });
          return { data: list, success: true };
        }}
        toolBarRender={() => [
          <Button
            key="create"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateOpen(true)}
          >
            Thêm video
          </Button>,
        ]}
        pagination={{ pageSize: 15, showSizeChanger: true }}
        search={{ labelWidth: 'auto' }}
        scroll={{ x: 'max-content' }}
      />

      {/* ─── Modal Thêm ─── */}
      <ModalForm<Partial<VideoItem>>
        title="Thêm video mới"
        open={createOpen}
        modalProps={{
          destroyOnClose: true,
          onCancel: () => setCreateOpen(false)
        }}
        onFinish={async (values) => {
          await create(values);
          setCreateOpen(false);
          actionRef.current?.reload();
          return true;
        }}
      >
        {renderFormFields()}
      </ModalForm>

      {/* ─── Modal Sửa ─── */}
      <ModalForm<Partial<VideoItem>>
        title={`Sửa video: ${editRecord?.title ?? ''}`}
        open={editOpen}
        modalProps={{
          destroyOnClose: true,
          onCancel: () => {
            setEditOpen(false);
            setEditRecord(null);
          }
        }}
        initialValues={{
          title: editRecord?.title,
          url: editRecord?.url,
        }}
        onFinish={async (values) => {
          if (!editRecord || !editRecord.id) return false;

          await patch(editRecord.id, values);
          setEditOpen(false);
          setEditRecord(null);
          actionRef.current?.reload();
          return true;
        }}
      >
        {renderFormFields()}
      </ModalForm>
    </>
  );
};

export default VideoManagementPage;
