import React, { useState, useRef, useEffect } from 'react';
import {
  ProTable,
  ActionType,
  ProColumns,
  ModalForm,
  ProFormText,
  ProFormTextArea,
  ProFormDigit,
  ProFormUploadButton,
} from '@ant-design/pro-components';
import { Button, Space, message, Popconfirm, Image, Tag, Form, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useArchitectureService, useArchitectureCategoryService } from '@/src/api/services';
import { compressImageFile } from '@/src/utils/imageCompression';

interface Architecture {
  id: string;
  name: string;
  categoryId: string | { id?: string; _id?: string; name: string };
  category?: { id: string; name: string };
  location: string;
  year: number;
  area: number;
  description: string;
  thumbnail?: string;
  images?: any[];
}

interface CategoryChild {
  _id: string;
  id?: string;
  name: string;
  slug: string;
}

interface CategoryItem {
  _id: string;
  id?: string;
  name: string;
  children?: CategoryChild[];
}

const ArchitectureManagementPage: React.FC = () => {
  const actionRef = useRef<ActionType | undefined>(undefined);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState<Architecture | null>(null);
  const [form] = Form.useForm();

  const { request: architectureRequest } = useArchitectureService();
  const { getAll: getCategories } = useArchitectureCategoryService();

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [filterCategoryId, setFilterCategoryId] = useState<string | undefined>(undefined);
  const [filterName, setFilterName] = useState<string>('');

  useEffect(() => {
    getCategories({ limit: 200 }).then(res => setCategories(res || []));
  }, [getCategories]);

  useEffect(() => {
    actionRef.current?.reload();
  }, [filterCategoryId]);

  const categorySelectOptions = categories.map(parent => {
    const parentId = parent._id || parent.id;
    if (parent.children && parent.children.length > 0) {
      return {
        label: parent.name,
        options: parent.children.map(child => ({
          label: child.name,
          value: child._id || child.id,
        })),
      };
    }
    return { label: parent.name, value: parentId };
  });

  const handleDelete = async (id: string) => {
    try {
      await architectureRequest('DELETE', `/${id}`);
      message.success('Đã xóa thiết kế kiến trúc');
      actionRef.current?.reload();
    } catch (err) {
      // Error handled by useApi
    }
  };

  const handleFinish = async (values: any) => {
    try {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('categoryId', values.categoryId);
      if (values.location) formData.append('location', values.location);
      if (values.year) formData.append('year', values.year.toString());
      if (values.area) formData.append('area', values.area.toString());
      if (values.description) formData.append('description', values.description);

      const isUpdate = !!currentItem;
      let keepImageCount = 0;

      if (values.images && values.images.length > 0) {
        const imageFiles = values.images.slice(0, 4);
        for (const fileItem of imageFiles) {
          if (fileItem.originFileObj) {
            const compressedFile = await compressImageFile(fileItem.originFileObj as File);
            formData.append('images', compressedFile);
          } else if (isUpdate && (fileItem.uid || fileItem.id || fileItem._id)) {
            const imageId = fileItem.uid?.startsWith('-') ? null : (fileItem.uid || fileItem.id || fileItem._id);
            if (imageId) {
              formData.append('keepImageIds', imageId);
              keepImageCount++;
            }
          }
        }
      }

      if (isUpdate && keepImageCount === 0) {
        formData.append('keepImageIds', '[]');
      }

      if (isUpdate) {
        await architectureRequest('PATCH', `/${currentItem.id || (currentItem as any)._id}`, formData);
        message.success('Cập nhật thiết kế kiến trúc thành công');
      } else {
        await architectureRequest('POST', '', formData);
        message.success('Tạo thiết kế kiến trúc mới thành công');
      }

      setModalVisible(false);
      actionRef.current?.reload();
      return true;
    } catch (err) {
      return false;
    }
  };

  const columns: ProColumns<Architecture>[] = [
    {
      title: 'Ảnh',
      dataIndex: 'images',
      hideInSearch: true,
      render: (_, record) => {
        const url = record.images && record.images.length > 0 ? record.images[0].url : null;
        return url ? <Image src={url} width={80} height={50} style={{ objectFit: 'cover', borderRadius: 4 }} /> : 'Không có ảnh';
      },
    },
    {
      title: 'Tên thiết kế',
      dataIndex: 'name',
      copyable: true,
      ellipsis: true,
    },
    {
      title: 'Danh mục',
      dataIndex: 'categoryId',
      hideInSearch: true,
      render: (_, record) => {
        let catName = record.category?.name;
        if (!catName && record.categoryId && typeof record.categoryId === 'object') {
          catName = (record.categoryId as any).name;
        }
        if (!catName && typeof record.categoryId === 'string') {
          for (const parent of categories) {
            if ((parent.id || parent._id) === record.categoryId) { catName = parent.name; break; }
            if (parent.children) {
              const child = parent.children.find(c => (c.id || c._id) === record.categoryId);
              if (child) { catName = child.name; break; }
            }
          }
        }
        return <Tag color="purple">{catName || 'Khác'}</Tag>;
      }
    },
    {
      title: 'Địa điểm',
      dataIndex: 'location',
      search: false,
      ellipsis: true,
    },
    {
      title: 'Năm',
      dataIndex: 'year',
      search: false,
      width: 80,
    },
    {
      title: 'Thao tác',
      valueType: 'option',
      width: 120,
      render: (_, record) => [
        <Button
          type="link"
          size="large"
          icon={<EditOutlined />}
          key="edit"
          onClick={async () => {
            const hide = message.loading('Đang tải dữ liệu...', 0);
            try {
              const res = await architectureRequest('GET', `/${record.id || (record as any)._id}`);
              if (res?.data) {
                setCurrentItem(res.data);
                setModalVisible(true);
              } else {
                message.error('Dữ liệu trống');
              }
            } catch (error) {
              message.error('Không thể tải chi tiết');
            } finally {
              hide();
            }
          }}
        >
          Sửa
        </Button>,
        <Popconfirm
          title="Xoá thiết kế này?"
          description="Hành động này không thể hoàn tác."
          okText="Xóa"
          cancelText="Hủy"
          okButtonProps={{ danger: true }}
          onConfirm={() => handleDelete(record.id)}
        >
          <Button type="link" size="large" danger icon={<DeleteOutlined />} />
        </Popconfirm>,
      ],
    },
  ];

  const getInitialValues = () => {
    if (!currentItem) return {};
    return {
      ...currentItem,
      categoryId: typeof currentItem.categoryId === 'object' && currentItem.categoryId !== null
        ? (currentItem.categoryId as any)._id || (currentItem.categoryId as any).id
        : currentItem.categoryId,
      images: currentItem.images?.map((img: any, i: number) => {
        const urlStr = typeof img === 'string' ? img : img.url;
        return {
          uid: img._id || img.id || `-img-${i}`,
          name: urlStr.split('/').pop() || `image-${i}`,
          status: 'done',
          url: urlStr,
          thumbUrl: urlStr,
          type: 'image/png',
        };
      }) || []
    };
  };

  useEffect(() => {
    if (modalVisible) {
      if (currentItem) {
        form.setFieldsValue(getInitialValues());
      } else {
        form.resetFields();
      }
    } else {
      setTimeout(() => form.resetFields(), 200);
    }
  }, [modalVisible, currentItem, form]);

  return (
    <>
      <ProTable<Architecture>
        headerTitle="Quản lý bài viết thiết kế kiến trúc"
        actionRef={actionRef}
        rowKey="id"
        search={false}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          showTotal: (total) => `Tổng ${total} thiết kế`,
        }}

        scroll={{ x: 'max-content' }}
        request={async (params) => {
          const { current, pageSize } = params;
          const queryParams: any = { page: current, limit: pageSize };
          if (filterCategoryId) queryParams.categoryId = filterCategoryId;
          if (filterName.trim()) queryParams.search = filterName.trim();
          try {
            const res = await architectureRequest('GET', '', null, queryParams);
            return {
              data: res.data || [],
              success: true,
              total: res.meta?.total || 0,
            };
          } catch (e) {
            return { data: [], success: false, total: 0 };
          }
        }}
        toolBarRender={() => [
          <Space key="filters" size="small" wrap>
            <input
              type="text"
              placeholder="Tên thiết kế..."
              value={filterName}
              onChange={e => setFilterName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') actionRef.current?.reload(); }}
              style={{
                padding: '5px 12px',
                border: '1px solid #d9d9d9',
                borderRadius: 6,
                outline: 'none',
                fontSize: 14,
                height: 32,
                width: '100%',
                maxWidth: 200,
              }}
            />
            <Select
              allowClear
              placeholder="Lọc danh mục"
              showSearch
              optionFilterProp="label"
              style={{ width: '100%', maxWidth: 220, minWidth: 150 }}
              onChange={(val) => setFilterCategoryId(val)}
              options={categories.map(parent => {
                const parentId = parent._id || parent.id;
                if (parent.children && parent.children.length > 0) {
                  return {
                    label: parent.name,
                    options: parent.children.map(child => ({
                      label: child.name,
                      value: child._id || child.id,
                    })),
                  };
                }
                return { label: parent.name, value: parentId };
              })}
            />
            <Button type="primary" onClick={() => actionRef.current?.reload()}>
              Tìm kiếm
            </Button>
          </Space>,
          <Button
            key="add"
            icon={<PlusOutlined />}
            onClick={() => {
              setCurrentItem(null);
              form.resetFields();
              setModalVisible(true);
            }}
            type="primary"
          >
            Thêm thiết kế
          </Button>,
        ]}
        columns={columns}
      />

      <ModalForm
        title={currentItem ? 'Sửa thiết kế kiến trúc' : 'Thêm thiết kế kiến trúc mới'}
        open={modalVisible}
        onOpenChange={(visible) => {
          if (!visible) {
            setModalVisible(false);
            setTimeout(() => form.resetFields(), 300);
          } else {
            setModalVisible(true);
          }
        }}
        onFinish={handleFinish}
        form={form}
        modalProps={{ destroyOnClose: true }}
        width={800}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ProFormText
              name="name"
              label="Tên thiết kế / Công trình"
              placeholder="VD: Biệt thự Vinhomes"
              rules={[{ required: true, message: 'Vui lòng nhập tên thiết kế' }]}
            />
            <Form.Item
              name="categoryId"
              label="Danh mục"
              rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
            >
              <Select
                placeholder="Vui lòng chọn"
                options={categorySelectOptions}
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ProFormText name="location" label="Địa điểm" placeholder="VD: Quận 1, TP.HCM" />
            <ProFormDigit name="year" label="Năm thực hiện" placeholder="VD: 2023" fieldProps={{ controls: false }} />
            <ProFormDigit name="area" label="Diện tích (m²)" placeholder="VD: 500" />
          </div>

          <ProFormTextArea
            name="description"
            label="Mô tả thiết kế"
            placeholder="Mô tả ngắn gọn về dự án..."
            fieldProps={{ rows: 4 }}
          />

          {/* @ts-ignore */}
          <ProFormUploadButton
            name="images"
            label="Hình ảnh (Tối đa 4 ảnh)"
            title="Thêm ảnh"
            max={4}
            formItemProps={{
              getValueFromEvent: (e: any) => {
                let fileList = Array.isArray(e) ? e : e?.fileList;
                if (fileList && fileList.length > 4) {
                  return fileList.slice(0, 4);
                }
                return fileList;
              }
            }}
            fieldProps={{
              multiple: true,
              accept: 'image/*',
              listType: 'picture-card',
              beforeUpload: () => false,
            }}
            extra="Hỗ trợ tải lên nhiều ảnh. Ảnh đầu tiên sẽ làm ảnh bìa (thumbnail)."
          />
        </Space>
      </ModalForm>
    </>
  );
};

export default ArchitectureManagementPage;
