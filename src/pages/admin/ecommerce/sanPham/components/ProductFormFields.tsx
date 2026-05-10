import React, { useEffect, useState } from 'react';
import {
  ProFormDigit, ProFormText, ProFormTextArea, ProFormSelect, ProFormList, ProFormUploadButton,
} from '@ant-design/pro-components';
import { Upload, Divider, Tag, Segmented } from 'antd';
import { PlusOutlined, AppstoreOutlined, ShoppingOutlined, BranchesOutlined } from '@ant-design/icons';
import { useApi } from '@/src/api';
import { CategoryItem } from '../types';
import api from '@/src/api/axiosInstance';

interface ProductFormFieldsProps {
  imageFiles: any[];
  setImageFiles: React.Dispatch<React.SetStateAction<any[]>>;
  imageDescriptions: string[];
  setImageDescriptions: React.Dispatch<React.SetStateAction<string[]>>;
  productType: 'simple' | 'variant';
  onProductTypeChange: (type: 'simple' | 'variant') => void;
}

export const ProductFormFields: React.FC<ProductFormFieldsProps> = ({
  imageFiles, setImageFiles, imageDescriptions, setImageDescriptions,
  productType, onProductTypeChange,
}) => {
  const { getAll: getCategories } = useApi<CategoryItem>('/categories');

  // Chuẩn hóa chuỗi: bỏ dấu tiếng Việt, đ→d, lowercase
  const normalizeText = (str: string) =>
    str
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'd');
  const [colorOptions, setColorOptions] = useState<{ label: string; value: string }[]>([]);
  const [sizeOptions, setSizeOptions] = useState<{ label: string; value: string }[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');

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
        fieldProps={{
          filterOption: (input: string, option: any) => {
            const label = option?.label ?? '';
            const normalized = normalizeText(label);
            const normalizedInput = normalizeText(input);
            return normalized.includes(normalizedInput) || label.toLowerCase().includes(input.toLowerCase());
          },
          onChange: async (catId: string) => {
            setSelectedCategoryId(catId || '');
            if (!catId) { setSizeOptions([]); return; }
            try {
              const res: any = await api.get(`/products/sizes/${catId}`);
              const sizes: string[] = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
              setSizeOptions(sizes.map((s) => ({ label: s, value: s })));
            } catch {
              setSizeOptions([]);
            }
          },
        }}
      />

      <ProFormText name="name" label="Tên sản phẩm" rules={[{ required: true, message: 'Nhập tên sản phẩm' }]} />

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

      {/* Toggle Simple / Variant */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
          Loại sản phẩm
        </label>
        <Segmented
          value={productType}
          onChange={(val) => onProductTypeChange(val as 'simple' | 'variant')}
          options={[
            {
              label: (
                <div style={{ padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ShoppingOutlined />
                  <span>Sản phẩm đơn giản</span>
                </div>
              ),
              value: 'simple',
            },
            {
              label: (
                <div style={{ padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <BranchesOutlined />
                  <span>Sản phẩm có biến thể</span>
                </div>
              ),
              value: 'variant',
            },
          ]}
          style={{ width: '100%' }}
          block
        />
        <div style={{ marginTop: 8, padding: '6px 12px', borderRadius: 6, fontSize: 12, background: productType === 'simple' ? '#f6ffed' : '#e6f4ff', border: `1px solid ${productType === 'simple' ? '#b7eb8f' : '#91caff'}`, color: productType === 'simple' ? '#389e0d' : '#0958d9' }}>
          {productType === 'simple'
            ? 'Sản phẩm đơn giản: 1 mức giá.'
            : 'Sản phẩm biến thể: nhiều kích thước, màu sắc, mỗi biến thể có giá và tồn kho riêng.'}
        </div>
      </div>

      {/* === SIMPLE MODE === */}
      {productType === 'simple' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <ProFormDigit name="price" label="Giá (VNĐ)" min={0}
            fieldProps={{ formatter: (v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') }} />
          <ProFormDigit name="stockQuantity" label="Tồn kho" min={0} />
        </div>
      )}

      {/* === VARIANT MODE === */}
      {productType === 'variant' && (
        <>
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
            <ProFormSelect
              name="size"
              label="Kích thước"
              placeholder={sizeOptions.length ? 'Chọn hoặc gõ kích thước...' : 'VD: 140x60, 1800x900'}
              options={sizeOptions}
              rules={[{ required: true, message: 'Chọn hoặc nhập kích thước' }]}
              formItemProps={{ style: { marginBottom: 10 } }}
              fieldProps={{
                mode: 'tags',
                maxCount: 1,
                maxTagCount: 1,
                tokenSeparators: [','],
                allowClear: true,
                open: sizeOptions.length > 0 ? undefined : false,
                notFoundContent: selectedCategoryId
                  ? 'Gõ kích thước rồi nhấn Enter'
                  : 'Chọn danh mục trước để gợi ý',
              }}
            />

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
        </>
      )}

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
