import React, { useRef, useState } from 'react';
import { Button, Popconfirm, Space, Tag, Image, Tooltip, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
  ModalForm,
  ProFormDigit,
  ProFormText,
  ProFormTextArea,
  ProFormSelect,
  ProFormUploadButton,
  ProTable,
} from '@ant-design/pro-components';
import { useApi } from '../../../hooks/useApi';
import { message as antMessage } from 'antd';

// ─── Types ───────────────────────────────────────────────────────────────────
interface ProductImage {
  url: string;
  id: string;
}

interface ProductItem {
  id: string;
  name: string;
  slug?: string;
  price: number;
  stockQuantity?: number;
  description?: string;
  warranty?: string;
  style?: string;
  material?: string;
  createdAt?: string;
  categoryId?: {
    id: string;
    name: string;
  } | string;
  images?: ProductImage[] | string[];
}

interface CategoryItem {
  id: string;
  name: string;
  children?: CategoryItem[];
}

// ─── Component ───────────────────────────────────────────────────────────────
const ProductManagementPage: React.FC = () => {
  const actionRef = useRef<ActionType | undefined>(undefined);
  const { getAll, remove, getById, request } = useApi<ProductItem>('/products');
  // Lấy API categories (endpoint giả định là /categories)
  const { getAll: getCategories } = useApi<CategoryItem>('/categories');

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<ProductItem | null>(null);

  // ─── Columns ─────────────────────────────────────────────────────────────
  const columns: ProColumns<ProductItem>[] = [
    {
      title: 'Ảnh',
      dataIndex: 'images',
      width: 80,
      search: false,
      render: (_, record) => {
        const firstImg = record.images?.[0];
        const imgUrl = typeof firstImg === 'string' ? firstImg : firstImg?.url;

        return imgUrl ? (
          <Image
            src={imgUrl}
            width={56}
            height={56}
            style={{ objectFit: 'cover', borderRadius: 6 }}
            preview={{ mask: false }}
          />
        ) : (
          <div
            style={{
              width: 56,
              height: 56,
              background: '#f0f0f0',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              color: '#bbb',
            }}
          >
            📦
          </div>
        );
      },
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      ellipsis: true,
    },
    // {
    //   title: 'Slug',
    //   dataIndex: 'slug',
    //   search: false,
    //   render: (val) =>
    //     val ? (
    //       <Tag color="blue" style={{ fontFamily: 'monospace' }}>
    //         {val as string}
    //       </Tag>
    //     ) : (
    //       '—'
    //     ),
    // },
    {
      title: 'Danh mục',
      dataIndex: ['categoryId', 'name'],
      search: false,
      render: (_, record) => {
        const catName = typeof record.categoryId === 'object' ? record.categoryId?.name : undefined;
        return catName ? (
          <Tag color="purple">{catName}</Tag>
        ) : (
          '—'
        );
      }
    },
    {
      title: 'Giá (VNĐ)',
      dataIndex: 'price',
      search: false,
      sorter: true,
      render: (_, record) => (
        <span style={{ fontWeight: 600 }}>
          {record.price?.toLocaleString('vi-VN')} ₫
        </span>
      ),
      width: 120
    },
    // {
    //   title: 'Tồn kho',
    //   dataIndex: 'stockQuantity',
    //   search: false,
    //   render: (val) => val ?? '—'
    // },
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
            icon={<EditOutlined />}
            onClick={async () => {
              const hide = message.loading('Đang tải dữ liệu sản phẩm...', 0);
              try {
                const data = await getById(record.id);
                setEditRecord(data);
                setEditOpen(true);
              } catch (err) {
                // Lỗi đã được xử lý trong hook
              } finally {
                hide();
              }
            }}
            size="large"
            title="Sửa"
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xoá sản phẩm này?"
            description="Hành động này không thể hoàn tác."
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
            onConfirm={async () => {
              await remove(record.id);
              actionRef.current?.reload();
            }}
          >
            <Button type="link" danger size='large' icon={<DeleteOutlined />} title="Xóa" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Common form fields cho cả form Thêm và form Sửa
  const renderFormFields = () => (
    <>
      <ProFormSelect
        name="categoryId"
        label="Danh mục"
        rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
        request={async () => {
          try {
            const list = await getCategories({ limit: 1000 });
            const options: { label: string; value: string }[] = [];
            const flatten = (items: CategoryItem[], prefix = '') => {
              items.forEach(item => {
                options.push({ label: `${prefix}${item.name}`, value: item.id });
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
        showSearch
      />
      <ProFormText
        name="name"
        label="Tên sản phẩm"
        rules={[{ required: true, message: 'Nhập tên sản phẩm' }]}
      />
      <ProFormDigit
        name="price"
        label="Giá (VNĐ)"
        min={0}
        fieldProps={{ formatter: (v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') }}
        rules={[{ required: true, message: 'Nhập giá sản phẩm' }]}
      />
      <ProFormDigit
        name="stockQuantity"
        label="Số lượng tồn kho"
        min={0}
      />
      {/* @ts-ignore */}
      <ProFormUploadButton
        name="images"
        label="Hình ảnh (Tối đa 4 ảnh)"
        title="Thêm ảnh"
        max={4}
        fieldProps={{
          multiple: true,
          accept: 'image/*',
          listType: 'picture-card',
          beforeUpload: () => false,
        }}
        extra="Hỗ trợ tải lên nhiều ảnh. Ảnh đầu tiên được chọn sẽ làm ảnh bìa."
      />
      <ProFormText
        name="warranty"
        label="Bảo hành"
        placeholder="VD: 12 tháng"
      />
      <ProFormText
        name="style"
        label="Phong cách"
        placeholder="VD: Hiện đại, Cổ điển"
      />
      <ProFormText
        name="material"
        label="Chất liệu"
        placeholder="VD: Gỗ Sồi, Gỗ Óc chó"
      />
      <ProFormTextArea
        name="description"
        label="Mô tả"
      />
    </>
  );

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <ProTable<ProductItem>
        columns={columns}
        actionRef={actionRef}
        rowKey="id"
        headerTitle="Quản lý sản phẩm"
        toolBarRender={() => [
          <Button
            key="button"
            icon={<PlusOutlined />}
            onClick={() => setCreateOpen(true)}
            type="primary"
          >
            Thêm sản phẩm
          </Button>,
        ]}
        request={async (params) => {
          const { current, pageSize, name, ...rest } = params;
          const list = await getAll({
            page: current,
            limit: pageSize,
            name,
            ...rest,
          });
          return { data: list, success: true };
        }}
        pagination={{ pageSize: 10, showSizeChanger: true }}
        search={{ labelWidth: 'auto' }}
        dateFormatter="string"
        scroll={{ x: 'max-content' }}
      />

      {/* ─── Modal Thêm sản phẩm ─── */}
      <ModalForm<Partial<ProductItem>>
        title="Thêm sản phẩm mới"
        open={createOpen}
        modalProps={{
          destroyOnClose: true,
          onCancel: () => setCreateOpen(false),
        }}
        onFinish={async (values) => {
          const formData = new FormData();
          formData.append('name', values.name);
          formData.append('categoryId', values.categoryId);
          if (values.price) formData.append('price', values.price.toString());
          if (values.stockQuantity) formData.append('stockQuantity', values.stockQuantity.toString());
          if (values.warranty) formData.append('warranty', values.warranty);
          if (values.style) formData.append('style', values.style);
          if (values.material) formData.append('material', values.material);
          if (values.description) formData.append('description', values.description);

          if (values.images && values.images.length > 0) {
            values.images.slice(0, 4).forEach((fileItem: any) => {
              if (fileItem.originFileObj) {
                formData.append('images', fileItem.originFileObj);
              }
            });
          }

          await request('POST', '', formData);
          setCreateOpen(false);
          actionRef.current?.reload();
          return true;
        }}
      >
        {renderFormFields()}
      </ModalForm>

      {/* ─── Modal Sửa sản phẩm ─── */}
      <ModalForm<Partial<ProductItem>>
        title={`Sửa: ${editRecord?.name ?? ''}`}
        open={editOpen}
        modalProps={{
          destroyOnClose: true,
          onCancel: () => {
            setEditOpen(false);
            setEditRecord(null);
          },
        }}
        initialValues={{
          ...editRecord,
          categoryId: typeof editRecord?.categoryId === 'object' ? editRecord.categoryId?.id : editRecord?.categoryId,
          images: editRecord?.images?.map((img: any, i: number) => {
            const urlStr = typeof img === 'string' ? img : img.url;
            return {
              uid: img._id || img.id || `-img-${i}`,
              name: urlStr.split('/').pop() || `image-${i}`,
              status: 'done',
              url: urlStr,
              thumbUrl: urlStr,
              type: 'image/png',
            };
          }) || [],
        }}
        onFinish={async (values) => {
          if (!editRecord) return false;
          const formData = new FormData();
          formData.append('name', values.name);
          formData.append('categoryId', values.categoryId);
          if (values.price) formData.append('price', values.price.toString());
          if (values.stockQuantity) formData.append('stockQuantity', values.stockQuantity.toString());
          if (values.warranty) formData.append('warranty', values.warranty);
          if (values.style) formData.append('style', values.style);
          if (values.material) formData.append('material', values.material);
          if (values.description) formData.append('description', values.description);

          if (values.images && values.images.length > 0) {
            values.images.slice(0, 4).forEach((fileItem: any) => {
              if (fileItem.originFileObj) {
                formData.append('images', fileItem.originFileObj);
              } else {
                const imageId = fileItem.uid?.startsWith('-') ? null : (fileItem.uid || fileItem.id || fileItem._id);
                if (imageId) {
                  formData.append('keepImageIds', imageId);
                }
              }
            });
          }

          await request('PATCH', `/${editRecord.id}`, formData);
          message.success('Cập nhật sản phẩm thành công');
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

export default ProductManagementPage;