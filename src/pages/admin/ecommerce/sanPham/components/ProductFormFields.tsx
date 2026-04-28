import React from 'react';
import {
  ProFormDigit,
  ProFormText,
  ProFormTextArea,
  ProFormSelect,
  ProFormList
} from '@ant-design/pro-components';
import { Upload, Input } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useApi } from '@/src/api';
import { CategoryItem } from '../types';

interface ProductFormFieldsProps {
  imageFiles: any[];
  setImageFiles: React.Dispatch<React.SetStateAction<any[]>>;
  imageDescriptions: string[];
  setImageDescriptions: React.Dispatch<React.SetStateAction<string[]>>;
}

export const ProductFormFields: React.FC<ProductFormFieldsProps> = ({
  imageFiles,
  setImageFiles,
  imageDescriptions,
  setImageDescriptions,
}) => {
  const { getAll: getCategories } = useApi<CategoryItem>('/categories');

  return (
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
                if (item.children && item.children.length > 0) {
                  flatten(item.children, `${prefix}${item.name} > `);
                } else {
                  if (prefix !== '') {
                    options.push({ label: `${prefix}${item.name}`, value: item.id || item._id as string });
                  }
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
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Hình ảnh (Tối đa 4 ảnh)</label>
        <Upload
          listType="picture-card"
          fileList={imageFiles}
          beforeUpload={() => false}
          accept="image/*"
          multiple
          onChange={({ fileList }) => {
            const limited = fileList.slice(0, 4);
            setImageFiles(limited);
            setImageDescriptions(prev => {
              const next = [...prev];
              while (next.length < limited.length) next.push('');
              return next.slice(0, limited.length);
            });
          }}
          onRemove={(file) => {
            const idx = imageFiles.findIndex(f => f.uid === file.uid);
            if (idx >= 0) {
              setImageDescriptions(prev => {
                const next = [...prev];
                next.splice(idx, 1);
                return next;
              });
            }
          }}
          itemRender={(originNode, file, currFileList) => {
            const idx = currFileList.findIndex(f => f.uid === file.uid);
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {originNode}
                <Input
                  size="small"
                  placeholder={`Mô tả ảnh ${idx + 1}`}
                  value={imageDescriptions[idx] || ''}
                  onChange={(e) => {
                    setImageDescriptions(prev => {
                      const next = [...prev];
                      next[idx] = e.target.value;
                      return next;
                    });
                  }}
                  style={{ width: 104 }}
                />
              </div>
            );
          }}
        >
          {imageFiles.length >= 4 ? null : (
            <div>
              <PlusOutlined />
              <div style={{ marginTop: 4, fontSize: 12 }}>Thêm ảnh</div>
            </div>
          )}
        </Upload>
        <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>Hỗ trợ tải lên nhiều ảnh. Ảnh đầu tiên được chọn sẽ làm ảnh bìa.</div>
      </div>
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
      <ProFormTextArea
        name="material"
        label="Chất liệu"
        placeholder="VD: Gỗ Sồi, Gỗ Óc chó"
        fieldProps={{ autoSize: { minRows: 3, maxRows: 6 } }}
      />
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Kích thước sản phẩm</label>
        <ProFormList
          name="sizeList"
          creatorButtonProps={{
            position: 'bottom',
            creatorButtonText: 'Thêm kích thước',
            icon: <PlusOutlined />,
          }}
          deleteIconProps={{
            tooltipText: 'Xóa',
          }}
          copyIconProps={false}
          itemRender={({ listDom, action }) => {
            return (
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>{listDom}</div>
                <div style={{ marginTop: 6 }}>{action}</div>
              </div>
            );
          }}
        >
          <ProFormText
            name="val"
            placeholder="Nhập kích thước (VD: 1800x900)"
            rules={[{ message: 'Nhập kích thước hoặc xóa dòng này' }]}
            formItemProps={{ style: { marginBottom: 8 } }}
          />
        </ProFormList>
      </div>
      <ProFormTextArea
        name="description"
        label="Mô tả"
        fieldProps={{ autoSize: { minRows: 3, maxRows: 6 } }}

      />
    </>
  );
};
