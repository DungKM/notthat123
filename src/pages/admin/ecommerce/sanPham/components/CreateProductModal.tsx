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
  const { request } = useApi<ProductItem>('/products');

  return (
    <ModalForm<Partial<ProductItem>>
      title="Thêm sản phẩm mới"
      open={open}
      modalProps={{
        destroyOnClose: true,
        onCancel: () => onOpenChange(false),
      }}
      onFinish={async (values: any) => {
        const formData = new FormData();
        formData.append('name', values.name);
        formData.append('categoryId', values.categoryId);
        if (values.price) formData.append('price', values.price.toString());
        if (values.stockQuantity) formData.append('stockQuantity', values.stockQuantity.toString());
        if (values.warranty) formData.append('warranty', values.warranty);
        if (values.style) formData.append('style', values.style);
        if (values.material) formData.append('material', values.material);
        if (values.description) formData.append('description', values.description);
        if (values.sizeList && values.sizeList.length > 0) {
          values.sizeList.forEach((s: any) => {
            if (s && s.val) formData.append('size[]', s.val);
          });
        }

        if (imageFiles.length > 0) {
          for (const fileItem of imageFiles.slice(0, 4)) {
            if (fileItem.originFileObj) {
              const compressedFile = await compressImageFile(fileItem.originFileObj as File);
              formData.append('images', compressedFile);
            }
          }
          imageDescriptions.slice(0, imageFiles.length).forEach((desc) => {
            formData.append('imageDescriptions', desc || '');
          });
        }

        await request('POST', '', formData);
        setImageFiles([]);
        setImageDescriptions([]);
        onSuccess();
        return true;
      }}
    >
      <ProductFormFields 
        imageFiles={imageFiles}
        setImageFiles={setImageFiles}
        imageDescriptions={imageDescriptions}
        setImageDescriptions={setImageDescriptions}
      />
    </ModalForm>
  );
};
