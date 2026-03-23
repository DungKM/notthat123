import React, { useRef, useState } from 'react';
import { Button, Popconfirm, Space, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ModalForm, ProFormText, ProFormTextArea, ProTable, ProFormSelect } from '@ant-design/pro-components';
import { useAuth } from '../../../auth/hooks/useAuth';
import { useApi } from '../../../hooks/useApi';

// ─── Types ───────────────────────────────────────────────────────────────────
interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  parentSlug?: string | null;
  description: string;
  createdAt?: string;
  updatedAt?: string;
  children?: CategoryItem[];
}

// ─── Component ───────────────────────────────────────────────────────────────
const CategoryManagementPage: React.FC = () => {
  const { user } = useAuth();
  const actionRef = useRef<ActionType | undefined>(undefined);

  // Hook gọi API cho danh mục
  const { getAll, create, patch, remove } = useApi<CategoryItem>('/categories');

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<CategoryItem | null>(null);

  if (!user) return null;

  // ─── Columns ─────────────────────────────────────────────────────────────
  const columns: ProColumns<CategoryItem>[] = [
    {
      title: 'Tên danh mục',
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
            title="Xoá danh mục này?"
            description="Hành động này không thể hoàn tác."
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
            onConfirm={async () => {
              await remove(record.id);
              actionRef.current?.reload();
            }}
          >
            <Button type="link" size='large' danger icon={<DeleteOutlined />} title="Xóa" />
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
      <ProFormSelect
        name="parentSlug"
        label="Danh mục cha"
        tooltip="Chỉ chọn nếu muốn tạo danh mục con"
        request={async () => {
          try {
            const list = await getAll({ limit: 100 });
            const options: { label: string; value: string }[] = [];
            const flatten = (items: CategoryItem[], prefix = '') => {
              items.forEach(item => {
                options.push({ label: `${prefix}${item.name}`, value: item.slug });
                if (item.children && item.children.length > 0) {
                  flatten(item.children, `${prefix}${item.name} > `);
                }
              });
            };
            if (Array.isArray(list)) flatten(list);
            return options;
          } catch (error) {
            return [];
          }
        }}
        placeholder="Không chọn (Tạo danh mục gốc)"
        showSearch
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
      <ProTable<CategoryItem>
        columns={columns}
        actionRef={actionRef}
        rowKey="id"
        headerTitle="Quản lý danh mục sản phẩm"
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
        expandable={{ defaultExpandAllRows: true }}
      />

      {/* ─── Modal Thêm ─── */}
      <ModalForm<Partial<CategoryItem>>
        title="Thêm danh mục"
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
      <ModalForm<Partial<CategoryItem>>
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
          parentSlug: editRecord?.parentSlug,
          description: editRecord?.description,
        }}
        onFinish={async (values) => {
          if (!editRecord) return false;
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

export default CategoryManagementPage;