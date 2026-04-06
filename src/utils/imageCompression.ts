import imageCompression from 'browser-image-compression';

/**
 * Nén file hình ảnh với chất lượng cao trước khi gửi lên server.
 * Cố gắng giữ mức chất lượng ~90% và kích thước chuẩn Full HD, tối đa dưới 2MB.
 * Lỗi sẽ fallback trả về lại ảnh gốc.
 * 
 * @param file File hình ảnh dượng originFileObj
 * @returns File đã được nén
 */
export const compressImageFile = async (file: File): Promise<File> => {
  // Chỉ xử lý những file là image
  if (!file.type.startsWith('image/')) {
    return file;
  }

  const options = {
    maxSizeMB: 2,           // Dung lượng mục tiêu tối đa 2MB
    maxWidthOrHeight: 1920, // Kích thước chiều cao/rộng tối đa là Full HD
    useWebWorker: true,     // Chạy đa luồng nền tránh đơ giao diện
    initialQuality: 0.9,    // Initial chất lượng cực tốt
  };

  try {
    const compressedBlob = await imageCompression(file, options);
    // Convert Blob lại thành dạng File gốc (để giữ nguyên tên và type)
    const compressedFile = new File([compressedBlob], file.name, {
      type: file.type,
      lastModified: Date.now(),
    });
    return compressedFile;
  } catch (error) {
    console.error("Lỗi trong quá trình nén ảnh, sẽ trở về file gốc:", error);
    return file;
  }
};
