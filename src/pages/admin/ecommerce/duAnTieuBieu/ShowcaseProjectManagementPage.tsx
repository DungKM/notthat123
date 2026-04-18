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
import { useConstructionService, useConstructionCategoryService } from '@/src/api/services';
import { compressImageFile } from '@/src/utils/imageCompression';


interface ShowcaseProject {
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

interface CategoryProjectItem {
  _id: string;
  id?: string;
  name: string;
  children?: CategoryChild[];
}

const ShowcaseProjectManagementPage: React.FC = () => {
  const actionRef = useRef<ActionType | undefined>(undefined);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentProject, setCurrentProject] = useState<ShowcaseProject | null>(null);
  const [form] = Form.useForm();

  const { request: constructionRequest } = useConstructionService();
  const { getAll: getCategories } = useConstructionCategoryService();

  const [categories, setCategories] = useState<CategoryProjectItem[]>([]);
  const [filterCategoryId, setFilterCategoryId] = useState<string | undefined>(undefined);
  const [filterName, setFilterName] = useState<string>('');

  useEffect(() => {
    getCategories({ limit: 200 }).then(res => setCategories(res || []));
  }, [getCategories]);

  // Reload bảng khi đổi danh mục lọc
  useEffect(() => {
    actionRef.current?.reload();
  }, [filterCategoryId]);

  // Tạo options grouped: nếu cha có con → nhóm children, nếu không có con → hiện cha như leaf
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
    // Cha không có con → hiện cha luôn
    return { label: parent.name, value: parentId };
  });

  const handleDelete = async (id: string) => {
    try {
      await constructionRequest('DELETE', `/${id}`);
      message.success('Đã xóa bài viết công trình');
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

      // Xử lý ảnh — tối đa 4 ảnh
      const isUpdate = !!currentProject;
      let keepImageCount = 0;

      if (values.images && values.images.length > 0) {
        const imageFiles = values.images.slice(0, 4); // Giới hạn tối đa 4 ảnh
        for (const fileItem of imageFiles) {
          if (fileItem.originFileObj) {
            // Ảnh mới được chọn từ máy tính, upload trực tiếp
            const compressedFile = await compressImageFile(fileItem.originFileObj as File);
            formData.append('images', compressedFile);
          } else if (isUpdate && (fileItem.uid || fileItem.id || fileItem._id)) {
            // Ảnh cũ đã có trên server → gửi ID để Backend biết giữ lại
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

      // In Axios, useApi.request accepts (method, url, payload, params)
      // We pass the formData as payload.
      if (isUpdate) {
        await constructionRequest('PATCH', `/${currentProject.id || (currentProject as any)._id}`, formData);
        message.success('Cập nhật thành công');
      } else {
        await constructionRequest('POST', '', formData);
        message.success('Tạo bài viết mới thành công');
      }

      setModalVisible(false);
      actionRef.current?.reload();
      return true;
    } catch (err) {
      return false;
    }
  };

  const columns: ProColumns<ShowcaseProject>[] = [
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
      title: 'Tên công trình',
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
        return <Tag color="blue">{catName || 'Khác'}</Tag>;
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
            const hide = message.loading('Đang tải dữ liệu công trình...', 0);
            try {
              const res = await constructionRequest('GET', `/${record.id || (record as any)._id}`);
              if (res?.data) {
                setCurrentProject(res.data);
                setModalVisible(true);
              } else {
                message.error('Dữ liệu công trình trống');
              }
            } catch (error) {
              console.error(error);
              message.error('Không thể tải chi tiết công trình');
            } finally {
              hide();
            }
          }}
        >
          Sửa
        </Button>,
        <Popconfirm title="Xoá bài viết này?"
          description="Hành động này không thể hoàn tác."
          okText="Xóa"
          cancelText="Hủy"
          okButtonProps={{ danger: true }} onConfirm={() => handleDelete(record.id)}>
          <Button type="link" size="large" danger icon={<DeleteOutlined />} />
        </Popconfirm>,
      ],
    },
  ];

  const getInitialValues = () => {
    if (!currentProject) return {};
    return {
      ...currentProject,
      categoryId: typeof currentProject.categoryId === 'object' && currentProject.categoryId !== null
        ? (currentProject.categoryId as any)._id || (currentProject.categoryId as any).id
        : currentProject.categoryId,
      // Hiển thị ảnh cũ trong trường upload edit nếu có API load ảnh
      images: currentProject.images?.map((img: any, i: number) => {
        const urlStr = typeof img === 'string' ? img : img.url;
        return {
          uid: img._id || img.id || `-img-${i}`,
          name: urlStr.split('/').pop() || `image-${i}`,
          status: 'done',
          url: urlStr,
          thumbUrl: urlStr, // Bắt buộc để fallback hiển thị thumbnail
          type: 'image/png', // <--- Ép Ant Design nhận dạng đây là file ảnh!
        };
      }) || []
    };
  };

  useEffect(() => {
    if (modalVisible) {
      if (currentProject) {
        form.setFieldsValue(getInitialValues());
      } else {
        form.resetFields();
      }
    } else {
      // Delay resetting to prevent visual flickering while modal is closing
      setTimeout(() => form.resetFields(), 200);
    }
  }, [modalVisible, currentProject, form]);

  return (
    <>
      <ProTable<ShowcaseProject>
        headerTitle="Quản lý bài viết thiết kế nội thất"
        actionRef={actionRef}
        rowKey="id"
        search={false}
        scroll={{ x: 'max-content' }}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          showTotal: (total) => `Tổng ${total} bài viết`,
        }}


        request={async (params) => {
          const { current, pageSize } = params;
          const queryParams: any = { page: current, limit: pageSize };
          if (filterCategoryId) queryParams.categoryId = filterCategoryId;
          if (filterName.trim()) queryParams.search = filterName.trim();

          try {
            const res = await constructionRequest('GET', '', null, queryParams);
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
          // Ô tìm kiếm tên
          <Space key="filters" size="small" wrap>
            <input
              type="text"
              placeholder="Tên công trình..."
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
            <Button
              type="primary"
              onClick={() => actionRef.current?.reload()}
            >
              Tìm kiếm
            </Button>
          </Space>,
          <Button
            key="add"
            icon={<PlusOutlined />}
            onClick={() => {
              setCurrentProject(null);
              form.resetFields();
              setModalVisible(true);
            }}
            type="primary"
          >
            Thêm bài viết
          </Button>,
        ]}
        columns={columns}
      />

      <ModalForm
        title={currentProject ? 'Sửa bài viết công trình' : 'Thêm bài viết công trình mới'}
        open={modalVisible}
        onOpenChange={(visible) => {
          if (!visible) {
            setModalVisible(false);
            // Delay reset to avoid flickering during close animation
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
              label="Tên bài viết / Công trình"
              placeholder="VD: Văn phòng Techcombank"
              rules={[{ required: true, message: 'Vui lòng nhập tên công trình' }]}
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
            label="Mô tả công trình"
            placeholder="Mô tả ngắn gọn về dự án..."
            rules={[{ message: 'Vui lòng nhập mô tả' }]}
            fieldProps={{ rows: 4 }}
          />

          {/* @ts-ignore - type mismatch from ProComponents */}
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
              accept: 'image/*', // Giúp Ant Design nhận diện đây là ảnh và tự động tạo thumbnail base64 khi chọn file
              listType: 'picture-card',
              beforeUpload: () => false, // Ngăn form tự động upload
            }}
            extra="Hỗ trợ tải lên nhiều ảnh. Ảnh đầu tiên được chọn sẽ làm ảnh bìa (thumbnail)."
          />
        </Space>
      </ModalForm>
    </>
  );
};

export default ShowcaseProjectManagementPage;
