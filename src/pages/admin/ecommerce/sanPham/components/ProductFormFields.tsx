import React, { useEffect, useState } from 'react';
import {
  ProFormDigit, ProFormText, ProFormTextArea, ProFormSelect, ProFormList, ProFormUploadButton,
} from '@ant-design/pro-components';
import { Upload, Divider, Tag } from 'antd';
import { PlusOutlined, AppstoreOutlined } from '@ant-design/icons';
import { useApi } from '@/src/api';
import { CategoryItem } from '../types';
import api from '@/src/api/axiosInstance';



interface ProductFormFieldsProps {
  imageFiles: any[];
  setImageFiles: React.Dispatch<React.SetStateAction<any[]>>;
  imageDescriptions: string[];
  setImageDescriptions: React.Dispatch<React.SetStateAction<string[]>>;
}

export const ProductFormFields: React.FC<ProductFormFieldsProps> = ({
  imageFiles, setImageFiles, imageDescriptions, setImageDescriptions,
}) => {
  const { getAll: getCategories } = useApi<CategoryItem>('/categories');
  const [colorOptions, setColorOptions] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    api.get('/colors', { params: { limit: 200 } })
      .then((res: any) => {
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setColorOptions(list.map((c: any) => ({ label: c.name, value: c.id || c._id })));
      })
      .catch(() => setColorOptions([]));
  }, []);

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
                if (item.children?.length) flatten(item.children, `${prefix}${item.name} > `);
                else if (prefix) options.push({ label: `${prefix}${item.name}`, value: item.id || item._id as string });
              });
            };
            if (Array.isArray(list)) flatten(list);
            return options;
          } catch { return []; }
        }}
        showSearch
      />

      <ProFormText name="name" label="Tên sản phẩm" rules={[{ required: true, message: 'Nhập tên sản phẩm' }]} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <ProFormDigit name="price" label="Giá mặc định (VNĐ)" min={0}
          fieldProps={{ formatter: (v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') }}
          tooltip="Khi có biến thể, giá từng biến thể được dùng thay thế" />
        <ProFormDigit name="stockQuantity" label="Tồn kho mặc định" min={0} />
      </div>

      {/* Ảnh sản phẩm */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Hình ảnh (Tối đa 4 ảnh)</label>
        <Upload
          listType="picture-card" fileList={imageFiles} beforeUpload={() => false}
          accept="image/*" multiple
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
            if (idx >= 0) setImageDescriptions(prev => { const n = [...prev]; n.splice(idx, 1); return n; });
          }}
        >
          {imageFiles.length >= 4 ? null : <div><PlusOutlined /><div style={{ marginTop: 4, fontSize: 12 }}>Thêm ảnh</div></div>}
        </Upload>
      </div>

      {/* Biến thể */}
      <Divider orientation="left" orientationMargin={0}>
        <span style={{ fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
          <AppstoreOutlined /> Biến thể sản phẩm
        </span>
      </Divider>

      <div style={{ marginBottom: 12, padding: '8px 12px', background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 6, fontSize: 12, color: '#389e0d' }}>
        💡 Mỗi biến thể gồm: kích thước, màu sắc, giá, tồn kho và ảnh riêng (tuỳ chọn).
      </div>

      <ProFormList
        name="variants"
        creatorButtonProps={{ position: 'bottom', creatorButtonText: 'Thêm biến thể', icon: <PlusOutlined /> }}
        deleteIconProps={{ tooltipText: 'Xóa biến thể' }}
        copyIconProps={false}
        itemRender={({ listDom, action }, { index }) => (
          <div style={{ border: '1px solid #e8e8e8', borderRadius: 8, padding: '16px 16px 8px', marginBottom: 12, background: '#fafafa', position: 'relative' }}>
            <Tag color="blue" style={{ position: 'absolute', top: -10, left: 12, fontSize: 11 }}>
              Biến thể #{index + 1}
            </Tag>
            <div style={{ marginTop: 8 }}>{listDom}</div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>{action}</div>
          </div>
        )}
      >
        <ProFormText name="size" label="Kích thước" placeholder="VD: 140x60, 1800x900"
          rules={[{ required: true, message: 'Nhập kích thước' }]}
          formItemProps={{ style: { marginBottom: 10 } }} />

        <ProFormSelect name="colorId" label="Màu sắc" placeholder="Chọn màu sắc..."
          options={colorOptions} showSearch allowClear
          rules={[{ required: true, message: 'Chọn màu sắc' }]}
          formItemProps={{ style: { marginBottom: 10 } }}
          fieldProps={{ optionFilterProp: 'label' }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <ProFormDigit name="price" label="Giá (VNĐ)" min={0}
            rules={[{ required: true, message: 'Nhập giá' }]}
            fieldProps={{ formatter: (v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') }}
            formItemProps={{ style: { marginBottom: 10 } }} />
          <ProFormDigit name="stockQuantity" label="Tồn kho" min={0}
            rules={[{ required: true, message: 'Nhập tồn kho' }]}
            formItemProps={{ style: { marginBottom: 10 } }} />
        </div>

        {/* ✅ ProFormUploadButton tự scope theo ProFormList context — mỗi biến thể có ảnh riêng */}
        <ProFormUploadButton
          name="variantImage"
          label="Ảnh biến thể (tuỳ chọn)"
          max={1}
          fieldProps={{
            listType: 'picture-card',
            beforeUpload: () => false,
            accept: 'image/*',
            maxCount: 1,
          }}
          formItemProps={{ style: { marginBottom: 10 } }}
          title="Chọn ảnh"
        />
      </ProFormList>

      <Divider style={{ margin: '8px 0 20px' }} />

      <ProFormText name="warranty" label="Bảo hành" placeholder="VD: 12 tháng" />
      <ProFormText name="style" label="Phong cách" placeholder="VD: Hiện đại, Cổ điển" />
      <ProFormTextArea name="material" label="Chất liệu"
        fieldProps={{ autoSize: { minRows: 3, maxRows: 6 } }} />
      <ProFormTextArea name="description" label="Mô tả"
        fieldProps={{ autoSize: { minRows: 3, maxRows: 6 } }} />
    </>
  );
};
