import React, { useRef, useState } from 'react';
import { Button, Tag, Popconfirm, Space } from 'antd';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
  ModalForm,
  ProFormText,
  ProFormSwitch,
  ProTable,
} from '@ant-design/pro-components';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useProjectStageService } from '@/src/api/services';

interface StageItem {
  id: string;
  name: string;
  order?: number;
  createdAt?: string;
}

type StageFormValues = {
  name: string;
};

const ProjectStagesPage: React.FC = () => {
  const actionRef = useRef<ActionType>(null);
  const [open, setOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<StageItem | null>(null);
  const { request, patch, remove, create } = useProjectStageService();

  const resetModal = () => {
    setOpen(false);
    setEditingStage(null);
  };

  const handleOpenCreate = () => {
    setEditingStage(null);
    setOpen(true);
  };

  const handleOpenEdit = (stage: StageItem) => {
    setEditingStage(stage);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await remove(id);
      actionRef.current?.reload();
    } catch {
      // handled by hook
    }
  };

  const columns: ProColumns<StageItem>[] = [
    {
      title: 'STT',
      valueType: 'index',
      width: 60,
    },
    {
      title: 'Tên giai đoạn',
      dataIndex: 'name',
      ellipsis: true,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      width: 130,
      search: false,
      render: (_, record) =>
        record.createdAt
          ? new Date(record.createdAt).toLocaleDateString('vi-VN')
          : '—',
    },
    {
      title: 'Thao tác',
      valueType: 'option',
      width: 160,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleOpenEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa giai đoạn này?"
            description="Hành động này không thể hoàn tác."
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <ProTable<StageItem>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        rowKey="id"
        headerTitle="Danh mục giai đoạn tiến độ dự án"
        scroll={{ x: 600 }}
        search={false}
        request={async (params) => {
          try {
            const res = await request('GET', '', null, {
              page: params.current || 1,
              limit: params.pageSize || 20,
              ...(params.name ? { name: params.name } : {}),
            });
            // API trả về data là mảng string hoặc mảng object
            const raw: any[] = res.data || [];
            const data: StageItem[] = raw.map((item: any, idx: number) =>
              typeof item === 'string'
                ? { id: String(idx), name: item }
                : {
                  id: item.id || item._id || String(idx),
                  name: item.name,
                  order: item.order,
                  createdAt: item.createdAt,
                }
            );
            return {
              data,
              success: true,
              total: res.meta?.total || data.length,
            };
          } catch {
            return { data: [], success: false, total: 0 };
          }
        }}
        pagination={{ pageSize: 20, showSizeChanger: true }}
        toolBarRender={() => [
          <Button
            key="create"
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenCreate}
          >
            Thêm giai đoạn
          </Button>,
        ]}
      />

      <ModalForm<StageFormValues>
        title={editingStage ? 'Sửa giai đoạn' : 'Thêm giai đoạn mới'}
        open={open}
        initialValues={
          editingStage
            ? { name: editingStage.name }
            : {}
        }
        modalProps={{ destroyOnClose: true, onCancel: resetModal }}
        onOpenChange={(visible) => { if (!visible) resetModal(); }}
        onFinish={async (values) => {
          try {
            const payload = { name: values.name };
            if (editingStage) {
              await patch(editingStage.id, payload);
            } else {
              await create(payload);
            }
            resetModal();
            actionRef.current?.reload();
            return true;
          } catch {
            return false;
          }
        }}
      >
        <ProFormText
          name="name"
          label="Tên giai đoạn"
          placeholder="Ví dụ: Tư vấn + gặp khách"
          rules={[{ required: true, message: 'Vui lòng nhập tên giai đoạn' }]}
        />
      </ModalForm>
    </>
  );
};

export default ProjectStagesPage;
