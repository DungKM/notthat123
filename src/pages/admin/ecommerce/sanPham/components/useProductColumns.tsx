import React from 'react';
import { Space, Button, Popconfirm, Tag, Image, message } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { ProductItem } from '../types';
import { useApi } from '@/src/api';

interface UseProductColumnsProps {
  actionRef: React.MutableRefObject<ActionType | undefined>;
  setEditRecord: (record: ProductItem | null) => void;
}

export const useProductColumns = ({ actionRef, setEditRecord }: UseProductColumnsProps) => {
  const { remove, getById } = useApi<ProductItem>('/products');

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
    {
      title: 'Danh mục',
      dataIndex: ['categoryId', 'name'],
      hideInSearch: true,
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
              } catch (err) {
                // Handle error if needed
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

  return columns;
};
