import React, { useState, useRef } from 'react';
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
import { Button, Space, message, Popconfirm, Image } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { usePartnerService } from '@/src/api/services';

interface PartnerItem {
  id: string;
  _id: string;
  title: string;
  brandName: string;
  cooperationYear: number;
  description: string;
  images: any[];
  createdAt: string;
}

const PartnerManagementPage: React.FC = () => {
  const actionRef = useRef<ActionType>(null);
  const { request, remove } = usePartnerService();
  const [modalVisible, setModalVisible] = useState(false);
  const [currentPartner, setCurrentPartner] = useState<any>(null);

  const handleDelete = async (id: string) => {
    try {
      await remove(id);
      // message.success('Đã xóa đối tác');
      actionRef.current?.reload();
    } catch (err) {
      // Error handled by useApi
    }
  };

  const handleFinish = async (values: any) => {
    try {
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('brandName', values.brandName);
      if (values.cooperationYear) formData.append('cooperationYear', values.cooperationYear.toString());
      if (values.description) formData.append('description', values.description);

      // Xử lý ảnh upload
      if (values.images && values.images.length > 0) {
        values.images.forEach((fileItem: any) => {
          if (fileItem.originFileObj) {
            // Ảnh mới upload
            formData.append('images', fileItem.originFileObj);
          } else if (currentPartner) {
            // Ảnh cũ giữ lại (khi sửa)
            const imageId = fileItem.uid?.startsWith('-') ? null : (fileItem.uid || fileItem.id || fileItem._id);
            if (imageId) {
              formData.append('keepImageIds', imageId);
            }
          }
        });
      }

      if (currentPartner) {
        await request('PATCH', `/${currentPartner.id || currentPartner._id}`, formData);
        message.success('Cập nhật đối tác thành công');
      } else {
        await request('POST', '', formData);
        message.success('Thêm đối tác thành công');
      }

      setModalVisible(false);
      actionRef.current?.reload();
      return true;
    } catch (err) {
      return false;
    }
  };

  const columns: ProColumns<PartnerItem>[] = [
    {
      title: 'Ảnh',
      dataIndex: 'images',
      hideInSearch: true,
      width: 100,
      render: (_, record) => {
        const imgUrl = record.images && record.images.length > 0 ? record.images[0].url || record.images[0] : null;
        return imgUrl ? (
          <Image
            src={imgUrl}
            fallback="https://via.placeholder.com/80x50"
            width={80}
            height={50}
            style={{ objectFit: 'contain', borderRadius: 4 }}
          />
        ) : 'Không có ảnh';
      },
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      copyable: true,
      ellipsis: true,
    },
    {
      title: 'Thương hiệu',
      dataIndex: 'brandName',
      ellipsis: true,
    },
    {
      title: 'Năm hợp tác',
      dataIndex: 'cooperationYear',
      width: 120,
      search: false,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      ellipsis: true,
      search: false,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      search: false,
      width: 120,
      render: (_, record) => record.createdAt ? new Date(record.createdAt).toLocaleDateString('vi-VN') : '—',
    },
    {
      title: 'Thao tác',
      valueType: 'option',
      width: 120,
      render: (_, record) => [
        <Button
          type="link"
          size="large"
          key="edit"
          onClick={async () => {
            const hide = message.loading('Đang tải dữ liệu đối tác...', 0);
            try {
              const res = await request('GET', `/${record.id || record._id}`);
              setCurrentPartner(res.data || res);
              setModalVisible(true);
            } catch (err) {
              message.error('Không thể tải chi tiết đối tác');
            } finally {
              hide();
            }
          }}
          icon={<EditOutlined />}
        >
          Sửa
        </Button>,
        <Popconfirm
          key="delete"
          title="Xóa đối tác này?"
          onConfirm={() => handleDelete(record.id || record._id)}
          okText="Xóa"
          cancelText="Hủy"
        >
          <Button type="link" size="large" danger icon={<DeleteOutlined />} />
        </Popconfirm>,
      ],
    },
  ];

  const getInitialValues = () => {
    if (!currentPartner) return {};
    return {
      ...currentPartner,
      images: currentPartner.images?.map((img: any, i: number) => {
        const urlStr = typeof img === 'string' ? img : img.url;
        return {
          uid: img._id || img.id || `-img-${i}`,
          name: urlStr?.split('/').pop() || `image-${i}`,
          status: 'done',
          url: urlStr,
          thumbUrl: urlStr,
          type: 'image/png',
        };
      }) || [],
    };
  };

  return (
    <>
      <ProTable<PartnerItem>
        headerTitle="Quản lý đối tác"
        actionRef={actionRef}
        rowKey={(record) => record.id || record._id}
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
        request={async (params) => {
          try {
            const queryParams: any = {
              page: params.current || 1,
              limit: params.pageSize || 10,
            };
            if (params.title) queryParams.search = params.title;

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
        pagination={{ pageSize: 10, showSizeChanger: true }}
        columns={columns}
        scroll={{ x: 'max-content' }}

      />

      <ModalForm
        title={currentPartner ? 'Sửa thông tin đối tác' : 'Thêm đối tác mới'}
        open={modalVisible}
        onOpenChange={setModalVisible}
        onFinish={handleFinish}
        initialValues={getInitialValues()}
        modalProps={{
          destroyOnClose: true,
        }}
        width={700}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div className="grid grid-cols-2 gap-4">
            <ProFormText
              name="title"
              label="Tiêu đề"
              placeholder="VD: Đối tác Hafele"
              rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
            />
            <ProFormText
              name="brandName"
              label="Tên thương hiệu"
              placeholder="VD: Hafele, Samsung"
              rules={[{ required: true, message: 'Vui lòng nhập tên thương hiệu' }]}
            />
          </div>

          <ProFormDigit
            name="cooperationYear"
            label="Năm hợp tác"
            placeholder="VD: 2023"
            fieldProps={{ controls: false }}
            rules={[{ required: true, message: 'Vui lòng nhập năm hợp tác' }]}
          />

          <ProFormTextArea
            name="description"
            label="Mô tả"
            placeholder="Mô tả ngắn gọn về đối tác..."
            fieldProps={{ rows: 3 }}
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
            extra="Upload hình ảnh đối tác"
          />
        </Space>
      </ModalForm>
    </>
  );
};

export default PartnerManagementPage;
