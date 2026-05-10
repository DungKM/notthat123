import React, { useState } from 'react';
import { ModalForm } from '@ant-design/pro-components';
import { ProductFormFields } from './ProductFormFields';
import { useApi } from '@/src/api';
import { ProductItem } from '../types';
import { compressImageFile } from '@/src/utils/imageCompression';

interface CreateProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const CreateProductModal: React.FC<CreateProductModalProps> = ({ open, onOpenChange, onSuccess }) => {
  const [imageFiles, setImageFiles] = useState<any[]>([]);
  const [imageDescriptions, setImageDescriptions] = useState<string[]>([]);
  const [productType, setProductType] = useState<'simple' | 'variant'>('simple');
  const { request } = useApi<ProductItem>('/products');

  const resetState = () => {
    setImageFiles([]);
    setImageDescriptions([]);
    setProductType('simple');
  };

  return (
    <ModalForm<Partial<ProductItem>>
      title="Thêm sản phẩm mới"
      open={open}
      modalProps={{ destroyOnClose: true, onCancel: () => { onOpenChange(false); resetState(); }, width: 720 }}
      onFinish={async (values: any) => {
        const formData = new FormData();
        formData.append('name', values.name);
        formData.append('categoryId', values.categoryId);
        if (values.warranty) formData.append('warranty', values.warranty);
        if (values.style) formData.append('style', values.style);
        if (values.material) formData.append('material', values.material);
        if (values.description) formData.append('description', values.description);

        // Ảnh sản phẩm
        for (const fileItem of imageFiles.slice(0, 4)) {
          if (fileItem.originFileObj) {
            formData.append('images', await compressImageFile(fileItem.originFileObj));
          }
        }
        imageDescriptions.slice(0, imageFiles.length).forEach(d => formData.append('imageDescriptions', d || ''));

        if (productType === 'simple') {
          // Simple: 1 giá, 1 tồn kho
          if (values.price) formData.append('price', values.price.toString());
          if (values.stockQuantity) formData.append('stockQuantity', values.stockQuantity.toString());
        } else {
          // Variant: nhiều biến thể
          const variantList: any[] = values.variants || [];
          if (variantList.length > 0) {
            const variantsPayload = variantList.map(v => ({
              size: Array.isArray(v.size) ? (v.size[0] ?? '') : (v.size || ''),
              colorId: v.colorId || '',
              price: v.price ?? 0,
              stockQuantity: v.stockQuantity ?? 0,
            }));
            formData.append('variants', JSON.stringify(variantsPayload));

            for (let i = 0; i < variantList.length; i++) {
              const imgList: any[] = variantList[i].variantImage || [];
              const newFile = imgList.find((f: any) => f.originFileObj);
              if (newFile?.originFileObj) {
                formData.append(`variant_image_${i}`, await compressImageFile(newFile.originFileObj));
              }
            }
          }
        }

        await request('POST', '', formData);
        resetState();
        onSuccess();
        return true;
      }}
    >
      <ProductFormFields
        imageFiles={imageFiles} setImageFiles={setImageFiles}
        imageDescriptions={imageDescriptions} setImageDescriptions={setImageDescriptions}
        productType={productType}
        onProductTypeChange={setProductType}
      />
    </ModalForm>
  );
};
