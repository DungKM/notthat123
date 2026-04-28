import React, { useState, useEffect } from 'react';
import { ModalForm } from '@ant-design/pro-components';
import { message } from 'antd';
import { ProductFormFields } from './ProductFormFields';
import { useApi } from '@/src/api';
import { ProductItem } from '../types';
import { compressImageFile } from '@/src/utils/imageCompression';

interface EditProductModalProps {
  editRecord: ProductItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditProductModal: React.FC<EditProductModalProps> = ({ editRecord, onClose, onSuccess }) => {
  const [imageFiles, setImageFiles] = useState<any[]>([]);
  const [imageDescriptions, setImageDescriptions] = useState<string[]>([]);
  const { request } = useApi<ProductItem>('/products');

  useEffect(() => {
    if (editRecord) {
      const existingImages = (editRecord.images || []).map((img: any, i: number) => {
        const urlStr = typeof img === 'string' ? img : img.url;
        return {
          uid: img._id || img.id || `-img-${i}`,
          name: urlStr.split('/').pop() || `image-${i}`,
          status: 'done',
          url: urlStr,
          thumbUrl: urlStr,
          type: 'image/png',
        };
      });
      setImageFiles(existingImages);
      setImageDescriptions((editRecord.images || []).map((img: any) => img.description || ''));
    } else {
      setImageFiles([]);
      setImageDescriptions([]);
    }
  }, [editRecord]);

  return (
    <ModalForm<Partial<ProductItem>>
      title={`Sửa: ${editRecord?.name ?? ''}`}
      open={!!editRecord}
      modalProps={{
        destroyOnClose: true,
        onCancel: onClose,
      }}
      initialValues={
        editRecord ? {
          ...editRecord,
          categoryId: typeof editRecord.categoryId === 'object' ? editRecord.categoryId?.id : editRecord.categoryId,
          sizeList: Array.isArray(editRecord.size) ? editRecord.size.map(s => ({ val: s })) : [],
        } : {}
      }
      onFinish={async (values: any) => {
        if (!editRecord) return false;
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

        let keepImageCount = 0;

        if (imageFiles.length > 0) {
          const existingMap: Record<string, string> = {};

          let idx = 0;
          for (const fileItem of imageFiles.slice(0, 4)) {
            const desc = imageDescriptions[idx] || '';
            idx++;

            if (fileItem.originFileObj) {
              const compressedFile = await compressImageFile(fileItem.originFileObj as File);
              formData.append('images', compressedFile);
              formData.append('imageDescriptions', desc);
            } else {
              const imageId = fileItem.uid?.startsWith('-') ? null : (fileItem.uid || fileItem.id || fileItem._id);
              if (imageId) {
                formData.append('keepImageIds', imageId);
                existingMap[imageId] = desc;
                keepImageCount++;
              }
            }
          }

          if (Object.keys(existingMap).length > 0) {
            formData.append('existingImageDescriptions', JSON.stringify(existingMap));
          }
        }

        if (keepImageCount === 0) {
          formData.append('keepImageIds', '[]');
        }

        await request('PATCH', `/${editRecord.id}`, formData);
        message.success('Cập nhật sản phẩm thành công');
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
