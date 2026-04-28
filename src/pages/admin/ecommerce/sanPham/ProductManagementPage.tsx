import React, { useRef, useState, useEffect } from 'react';
import { Button, Space, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { ActionType } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useApi } from '@/src/api';

import { ProductItem, CategoryItem } from './types';
import { useProductColumns } from './components/useProductColumns';
import { CreateProductModal } from './components/CreateProductModal';
import { EditProductModal } from './components/EditProductModal';

const ProductManagementPage: React.FC = () => {
  const actionRef = useRef<ActionType | undefined>(undefined);
  const { getAll: getCategories } = useApi<CategoryItem>('/categories');

  const [createOpen, setCreateOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<ProductItem | null>(null);
  
  const [filterCategoryId, setFilterCategoryId] = useState<string | undefined>(undefined);
  const [filterName, setFilterName] = useState<string>('');
  const [productCategoryList, setProductCategoryList] = useState<CategoryItem[]>([]);

  useEffect(() => {
    getCategories({ limit: 200 }).then(res => {
      if (Array.isArray(res)) setProductCategoryList(res);
    }).catch(() => { });
  }, []);

  useEffect(() => {
    actionRef.current?.reload();
  }, [filterCategoryId]);

  const columns = useProductColumns({ actionRef, setEditRecord });

  return (
    <>
      <ProTable<ProductItem>
        columns={columns}
        actionRef={actionRef}
        rowKey="id"
        headerTitle="Quản lý sản phẩm"
        toolBarRender={() => [
          <Space key="filters" size="small" wrap>
            <input
              type="text"
              placeholder="Tên sản phẩm..."
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
              options={productCategoryList.map(parent => {
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
            onClick={() => setCreateOpen(true)}
            type="primary"
          >
            Thêm sản phẩm
          </Button>,
        ]}
        request={async (params) => {
          const { current, pageSize } = params;
          try {
            const res = await (await import('@/src/api/axiosInstance')).default.get('/products', {
              params: {
                page: current,
                limit: pageSize,
                search: filterName.trim() || undefined,
                categoryId: filterCategoryId || undefined,
              },
            }) as any;
            return {
              data: res.data || [],
              success: true,
              total: res.meta?.total ?? 0,
            };
          } catch {
            return { data: [], success: false, total: 0 };
          }
        }}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          showTotal: (total) => `Tổng ${total} bài viết`,
        }}
        search={false}
        dateFormatter="string"
        scroll={{ x: 'max-content' }}
      />

      <CreateProductModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={() => {
          setCreateOpen(false);
          actionRef.current?.reload();
        }}
      />

      <EditProductModal
        editRecord={editRecord}
        onClose={() => setEditRecord(null)}
        onSuccess={() => {
          setEditRecord(null);
          actionRef.current?.reload();
        }}
      />
    </>
  );
};

export default ProductManagementPage;