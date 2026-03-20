import React, { useRef, useState } from 'react';
import { Button, message, Popconfirm, Space } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ModalForm, ProFormText, ProFormTextArea, ProTable } from '@ant-design/pro-components';
import { useAuth } from '@/src/auth/hooks/useAuth';
import { useApi } from '@/src/hooks/useApi';

// ─── Types ───────────────────────────────────────────────────────────────────
interface CategoryProjectItem {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────
const CategoryProjectManagementPage: React.FC = () => {
  const { user } = useAuth();
  const actionRef = useRef<ActionType | undefined>(undefined);

  // Hook gọi API cho danh mục công trình
  const { getAll, create, patch, remove } = useApi<CategoryProjectItem>('/constructions/categories');

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<CategoryProjectItem | null>(null);

  if (!user) return null;

  // ─── Columns ─────────────────────────────────────────────────────────────
  const columns: ProColumns<CategoryProjectItem>[] = [
    {
      title: 'Tên danh mục công trình',
      dataIndex: 'name',
      ellipsis: true,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      ellipsis: true,
      search: false,
      render: (val) => val || '—'
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      search: false,
      render: (val) =>
        val
          ? new Date(val as string).toLocaleDateString('vi-VN')
          : '—',
    },
    {
      title: 'Thao tác',
      valueType: 'option',
      width: 100,
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
            title="Xoá danh mục công trình này?"
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
            <Button type="link" danger icon={<DeleteOutlined />} title="Xóa" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Các trường form dùng chung
  const renderFormFields = () => (
    <>
      <ProFormText
        name="name"
        label="Tên danh mục"
        rules={[{ required: true, message: 'Nhập tên danh mục' }]}
      />
      <ProFormTextArea
        name="description"
        label="Mô tả danh mục"
      />
    </>
  );

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <ProTable<CategoryProjectItem>
        columns={columns}
        actionRef={actionRef}
        rowKey="id"
        headerTitle="Quản lý danh mục công trình"
        request={async (params) => {
          const { current, pageSize, name, ...rest } = params;
          const list = await getAll({
            page: current,
            limit: pageSize,
            name,
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
            Thêm danh mục
          </Button>,
        ]}
        pagination={{ pageSize: 15, showSizeChanger: true }}
        search={{ labelWidth: 'auto' }}
        scroll={{ x: 'max-content' }}

      />

      {/* ─── Modal Thêm ─── */}
      <ModalForm<Partial<CategoryProjectItem>>
        title="Thêm danh mục công trình"
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
      <ModalForm<Partial<CategoryProjectItem>>
        title={`Sửa: ${editRecord?.name ?? ''}`}
        open={editOpen}
        modalProps={{
          destroyOnClose: true,
          onCancel: () => {
            setEditOpen(false);
            setEditRecord(null);
          }
        }}
        initialValues={{
          name: editRecord?.name,
          description: editRecord?.description,
        }}
        onFinish={async (values) => {
          if (!editRecord || !editRecord.id) return false;

          await patch(editRecord.id, values);
          message.success('Cập nhật danh mục công trình thành công');
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

export default CategoryProjectManagementPage;
