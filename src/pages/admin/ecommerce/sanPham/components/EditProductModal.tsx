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
  const [productType, setProductType] = useState<'simple' | 'variant'>('simple');
  const { request } = useApi<ProductItem>('/products');

  useEffect(() => {
    if (editRecord) {
      // Detect loại sản phẩm từ dữ liệu API
      const variants = (editRecord as any).variants || [];
      setProductType(variants.length > 0 ? 'variant' : 'simple');

      const existingImages = (editRecord.images || []).map((img: any, i: number) => {
        const urlStr = typeof img === 'string' ? img : img.url;
        return { uid: img._id || img.id || `-img-${i}`, name: urlStr.split('/').pop() || `image-${i}`, status: 'done', url: urlStr, thumbUrl: urlStr };
      });
      setImageFiles(existingImages);
      setImageDescriptions((editRecord.images || []).map((img: any) => img.description || ''));
    } else {
      setImageFiles([]);
      setImageDescriptions([]);
      setProductType('simple');
    }
  }, [editRecord]);

  const getInitialValues = () => {
    if (!editRecord) return {};
    const variants = (editRecord as any).variants || [];
    return {
      ...editRecord,
      categoryId: typeof editRecord.categoryId === 'object' ? editRecord.categoryId?.id : editRecord.categoryId,
      variants: variants.map((v: any, i: number) => {
        const imgUrl = typeof v.image === 'string' ? v.image : v.image?.url || '';
        const variantImage = imgUrl ? [{
          uid: `-variant-img-${i}`,
          name: `variant-${i}.jpg`,
          status: 'done',
          url: imgUrl,
          thumbUrl: imgUrl,
        }] : [];
        return {
          // size có thể là string hoặc mảng — normalize về string để hiển thị
          size: Array.isArray(v.size) ? v.size : [v.size || ''],
          colorId: v.colorId?.id || v.colorId || '',
          price: v.price ?? '',
          stockQuantity: v.stockQuantity ?? '',
          variantImage,
        };
      }),
    };
  };

  return (
    <ModalForm<Partial<ProductItem>>
      title={`Sửa: ${editRecord?.name ?? ''}`}
      open={!!editRecord}
      modalProps={{ destroyOnClose: true, onCancel: onClose, width: 720 }}
      initialValues={getInitialValues()}
      onFinish={async (values: any) => {
        if (!editRecord) return false;
        const formData = new FormData();
        formData.append('name', values.name);
        formData.append('categoryId', values.categoryId);
        if (values.warranty) formData.append('warranty', values.warranty);
        if (values.style) formData.append('style', values.style);
        if (values.material) formData.append('material', values.material);
        if (values.description) formData.append('description', values.description);

        // Ảnh sản phẩm
        let keepImageCount = 0;
        const existingMap: Record<string, string> = {};
        let idx = 0;
        for (const fileItem of imageFiles.slice(0, 4)) {
          const desc = imageDescriptions[idx++] || '';
          if (fileItem.originFileObj) {
            formData.append('images', await compressImageFile(fileItem.originFileObj));
            formData.append('imageDescriptions', desc);
          } else {
            const imageId = fileItem.uid?.startsWith('-') ? null : fileItem.uid;
            if (imageId) { formData.append('keepImageIds', imageId); existingMap[imageId] = desc; keepImageCount++; }
          }
        }
        if (Object.keys(existingMap).length > 0) formData.append('existingImageDescriptions', JSON.stringify(existingMap));
        if (keepImageCount === 0) formData.append('keepImageIds', '[]');

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

        await request('PATCH', `/${editRecord.id}`, formData);
        message.success('Cập nhật sản phẩm thành công');
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
