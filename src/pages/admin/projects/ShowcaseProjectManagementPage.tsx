import React, { useState } from 'react';
import {
  ProTable,
  ActionType,
  ProColumns,
  ModalForm,
  ProFormText,
  ProFormSelect,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { ShowcaseProject, ShowcaseProjectCategory } from '@/src/types';
import { MOCK_SHOWCASE_PROJECTS } from '@/src/mockData';
import { Button, Space, message, Popconfirm, Image, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FileTextOutlined } from '@ant-design/icons';
import { useRef } from 'react';

const ShowcaseProjectManagementPage: React.FC = () => {
  const actionRef = useRef<ActionType | undefined>(undefined);
  const [projects, setProjects] = useState<ShowcaseProject[]>(MOCK_SHOWCASE_PROJECTS);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentProject, setCurrentProject] = useState<ShowcaseProject | null>(null);

  const categories: ShowcaseProjectCategory[] = ['Nhà ở', 'Thương mại', 'Công nghiệp'];

  const handleDelete = (id: string) => {
    setProjects(projects.filter(p => p.id !== id));
    message.success('Đã xóa bài viết công trình');
  };

  const handleFinish = async (values: any) => {
    const generateSlug = (text: string) => {
      return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[đĐ]/g, "d")
        .replace(/([^0-9a-z-\s])/g, "")
        .replace(/(\s+)/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");
    };

    if (currentProject) {
      // Update
      const updated = projects.map(p =>
        p.id === currentProject.id
          ? {
            ...p,
            ...values,
            slug: generateSlug(values.title),
            content: typeof values.content === 'string' ? values.content.split('\n') : values.content,
            gallery: typeof values.gallery === 'string' ? values.gallery.split('\n') : values.gallery
          }
          : p
      );
      setProjects(updated);
      message.success('Cập nhật thành công');
    } else {
      // Create
      const newProject: ShowcaseProject = {
        id: Math.random().toString(36).substr(2, 9),
        ...values,
        slug: generateSlug(values.title),
        content: typeof values.content === 'string' ? values.content.split('\n') : values.content,
        gallery: typeof values.gallery === 'string' ? values.gallery.split('\n').filter(Boolean) : []
      };
      setProjects([newProject, ...projects]);
      message.success('Tạo bài viết mới thành công');
    }
    setModalVisible(false);
    return true;
  };

  const columns: ProColumns<ShowcaseProject>[] = [
    {
      title: 'Ảnh bìa',
      dataIndex: 'coverImage',
      hideInSearch: true,
      render: (img) => <Image src={img as string} width={80} height={50} style={{ objectFit: 'cover', borderRadius: 4 }} />,
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      copyable: true,
      ellipsis: true,
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      valueType: 'select',
      valueEnum: {
        'Nhà ở': { text: 'Nhà ở' },
        'Thương mại': { text: 'Thương mại' },
        'Công nghiệp': { text: 'Công nghiệp' },
      },
      render: (_, record) => (
        <Tag color={record.category === 'Nhà ở' ? 'blue' : record.category === 'Thương mại' ? 'green' : 'orange'}>
          {record.category}
        </Tag>
      )
    },
    {
      title: 'Địa điểm',
      dataIndex: 'location',
      ellipsis: true,
    },
    {
      title: 'Năm',
      dataIndex: 'year',
      width: 80,
    },
    {
      title: 'Thao tác',
      valueType: 'option',
      width: 120,
      render: (_, record) => [
        <a key="edit" onClick={() => {
          setCurrentProject(record);
          setModalVisible(true);
        }}>
          <EditOutlined /> Sửa
        </a>,
        <Popconfirm key="delete" title="Xóa bài viết này?" onConfirm={() => handleDelete(record.id)}>
          <a style={{ color: 'red' }}><DeleteOutlined /></a>
        </Popconfirm>,
      ],
    },
  ];

  return (
    <>
      <ProTable<ShowcaseProject>
        headerTitle="Quản lý bài viết công trình (Showcase)"
        actionRef={actionRef}
        rowKey="id"
        search={{ labelWidth: 'auto' }}
        toolBarRender={() => [
          <Button
            key="button"
            icon={<PlusOutlined />}
            onClick={() => {
              setCurrentProject(null);
              setModalVisible(true);
            }}
            type="primary"
          >
            Thêm bài viết
          </Button>,
        ]}
        dataSource={projects}
        columns={columns}
      />

      <ModalForm
        title={currentProject ? 'Sửa bài viết công trình' : 'Thêm bài viết công trình mới'}
        open={modalVisible}
        onOpenChange={setModalVisible}
        onFinish={handleFinish}
        initialValues={currentProject ? {
          ...currentProject,
          content: currentProject.content.join('\n'),
          gallery: currentProject.gallery?.join('\n')
        } : {}}
        modalProps={{
          destroyOnClose: true,
        }}
        width={800}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div className="grid grid-cols-2 gap-4">
            <ProFormText
              name="title"
              label="Tiêu đề bài viết"
              placeholder="VD: Biệt thự Vinhomes Harmony"
              rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
            />
            <ProFormSelect
              name="category"
              label="Danh mục"
              options={categories.map(c => ({ label: c, value: c }))}
              rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <ProFormText name="location" label="Địa điểm" placeholder="VD: Long Biên, Hà Nội" />
            <ProFormText name="year" label="Năm thực hiện" placeholder="VD: 2025" />
            <ProFormText name="area" label="Diện tích" placeholder="VD: 320 m²" />
          </div>

          <ProFormText
            name="coverImage"
            label="Link ảnh bìa"
            placeholder="Nhập URL hình ảnh"
            rules={[{ required: true, message: 'Vui lòng nhập link ảnh' }]}
          />

          <ProFormTextArea
            name="excerpt"
            label="Mô tả ngắn (Excerpt)"
            placeholder="Mô tả ngắn gọn về dự án"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả ngắn' }]}
            fieldProps={{ rows: 2 }}
          />

          <ProFormTextArea
            name="content"
            label="Nội dung chi tiết (Mỗi đoạn 1 dòng)"
            placeholder="Nhập nội dung bài viết..."
            rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
            fieldProps={{ rows: 6 }}
          />

          <ProFormTextArea
            name="gallery"
            label="Gallery ảnh (Mỗi link 1 dòng)"
            placeholder="Nhập các URL hình ảnh gallery..."
            fieldProps={{ rows: 4 }}
          />
        </Space>
      </ModalForm>
    </>
  );
};

export default ShowcaseProjectManagementPage;
