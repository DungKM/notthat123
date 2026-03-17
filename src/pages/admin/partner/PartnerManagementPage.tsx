import React, { useState } from 'react';
import {
  ProTable,
  ActionType,
  ProColumns,
  ModalForm,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Partner } from '@/src/types';
import { usePartners } from '@/src/hooks/usePartners';
import { Button, Space, message, Popconfirm, Image } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useRef } from 'react';

const PartnerManagementPage: React.FC = () => {
  const actionRef = useRef<ActionType>(null);
  const { partners, setPartners, isLoaded } = usePartners();
  const [modalVisible, setModalVisible] = useState(false);
  const [currentPartner, setCurrentPartner] = useState<Partner | null>(null);

  const handleDelete = (slug: string) => {
    setPartners(partners.filter((p) => p.slug !== slug));
    message.success('Đã xóa đối tác');
  };

  const handleFinish = async (values: any) => {
    const generateSlug = (text: string) => {
      return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .replace(/([^0-9a-z-\s])/g, '')
        .replace(/(\s+)/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
    };

    if (currentPartner) {
      // Update
      const updated = partners.map((p) =>
        p.slug === currentPartner.slug
          ? {
              ...p,
              ...values,
              // If title changed, update slug
              slug: p.title !== values.title ? generateSlug(values.title) : p.slug,
            }
          : p
      );
      setPartners(updated);
      message.success('Cập nhật thành công');
    } else {
      // Create
      const newPartner: Partner = {
        ...values,
        slug: generateSlug(values.title),
      };
      setPartners([newPartner, ...partners]);
      message.success('Thêm đối tác thành công');
    }
    setModalVisible(false);
    return true;
  };

  const columns: ProColumns<Partner>[] = [
    {
      title: 'Hình ảnh',
      dataIndex: 'image',
      hideInSearch: true,
      render: (img) => (
        <Image
          src={img as string}
          fallback="https://via.placeholder.com/80x50"
          width={80}
          height={50}
          style={{ objectFit: 'cover', borderRadius: 4 }}
        />
      ),
    },
    {
      title: 'Thương hiệu',
      dataIndex: 'title',
      copyable: true,
      ellipsis: true,
    },
    {
      title: 'Năm',
      dataIndex: 'year',
      width: 100,
    },
    {
      title: 'Mô tả ngắn',
      dataIndex: 'description',
      ellipsis: true,
    },
    {
      title: 'Thao tác',
      valueType: 'option',
      width: 120,
      render: (_, record) => [
        <a
          key="edit"
          onClick={() => {
            setCurrentPartner(record);
            setModalVisible(true);
          }}
        >
          <EditOutlined /> Sửa
        </a>,
        <Popconfirm
          key="delete"
          title="Xóa đối tác này?"
          onConfirm={() => handleDelete(record.slug)}
        >
          <a style={{ color: 'red' }}>
            <DeleteOutlined />
          </a>
        </Popconfirm>,
      ],
    },
  ];

  if (!isLoaded) return <div style={{ padding: 24 }}>Đang tải dữ liệu...</div>;

  return (
    <>
      <ProTable<Partner>
        headerTitle="Quản lý đối tác"
        actionRef={actionRef}
        rowKey="slug"
        search={{ labelWidth: 'auto' }}
        toolBarRender={() => [
          <Button
            key="button"
            icon={<PlusOutlined />}
            onClick={() => {
              setCurrentPartner(null);
              setModalVisible(true);
            }}
            type="primary"
          >
            Thêm đối tác
          </Button>,
        ]}
        dataSource={partners}
        columns={columns}
      />

      <ModalForm
        title={currentPartner ? 'Sửa thông tin đối tác' : 'Thêm đối tác mới'}
        open={modalVisible}
        onOpenChange={setModalVisible}
        onFinish={handleFinish}
        initialValues={currentPartner || {}}
        modalProps={{
          destroyOnClose: true,
        }}
        width={700}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div className="grid grid-cols-2 gap-4">
            <ProFormText
              name="title"
              label="Tên thương hiệu"
              placeholder="VD: Apple, Huawei"
              rules={[{ required: true, message: 'Vui lòng nhập tên thương hiệu' }]}
            />
            <ProFormText
              name="year"
              label="Năm hợp tác"
              placeholder="VD: 2025"
              rules={[{ required: true, message: 'Vui lòng nhập năm' }]}
            />
          </div>

          <ProFormText
            name="image"
            label="Link hình ảnh Đại diện"
            placeholder="Nhập URL hình ảnh"
            rules={[{ required: true, message: 'Vui lòng nhập link ảnh' }]}
          />

          <ProFormTextArea
            name="description"
            label="Mô tả ngắn"
            placeholder="Hiển thị ở trang danh sách..."
            rules={[{ required: true, message: 'Vui lòng nhập mô tả ngắn' }]}
            fieldProps={{ rows: 2 }}
          />

          <ProFormTextArea
            name="content"
            label="Nội dung chi tiết"
            placeholder="Hiển thị ở trang chi tiết đối tác..."
            rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
            fieldProps={{ rows: 6 }}
          />
        </Space>
      </ModalForm>
    </>
  );
};

export default PartnerManagementPage;
