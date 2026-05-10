import React, { useCallback, useEffect, useState } from 'react';
import {
  Button, Popconfirm, Space, Spin, Input, message as antMessage, Upload,
} from 'antd';
import {
  EditOutlined, DeleteOutlined, PlusOutlined, BgColorsOutlined, PictureOutlined,
} from '@ant-design/icons';
import { ModalForm, ProFormText } from '@ant-design/pro-components';
import { useAuth } from '@/src/auth/hooks/useAuth';
import api from '@/src/api/axiosInstance';
import type { UploadFile } from 'antd';

// ─── Types ───────────────────────────────────────────────────────────────────
interface ColorItem {
  id: string;
  name: string;
  imageUrl?: string;
  createdAt?: string;
}

// ─── Main Component ───────────────────────────────────────────────────────────
const ColorManagementPage: React.FC = () => {
  const { user } = useAuth();

  const [items, setItems] = useState<ColorItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<ColorItem | null>(null);

  // upload state cho từng modal riêng
  const [createImageFile, setCreateImageFile] = useState<UploadFile | null>(null);
  const [editImageFile, setEditImageFile] = useState<UploadFile | null>(null);

  // ─── Load ─────────────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await api.get('/colors', { params: { limit: 200 } });
      const rawList = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      const mapped = rawList.map((i: any) => ({
        ...i,
        id: i.id || i._id,
      }));
      setItems(mapped);
    } catch (err: any) {
      antMessage.error(err?.message || 'Lỗi khi tải danh sách màu sắc');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ─── Filtered ─────────────────────────────────────────────────────────────
  const filtered = React.useMemo(() => {
    if (!searchText.trim()) return items;
    const lower = searchText.trim().toLowerCase();
    return items.filter(i => i.name.toLowerCase().includes(lower));
  }, [items, searchText]);

  // ─── Create ───────────────────────────────────────────────────────────────
  const handleCreate = async (values: { name: string }) => {
    try {
      const formData = new FormData();
      formData.append('name', values.name);
      if (createImageFile?.originFileObj) {
        formData.append('image', createImageFile.originFileObj);
      }
      await api.post('/colors', formData);
      antMessage.success('Thêm màu sắc thành công!');
      setCreateOpen(false);
      setCreateImageFile(null);
      loadData();
      return true;
    } catch (err: any) {
      antMessage.error(err?.message || 'Lỗi khi thêm màu sắc');
      return false;
    }
  };

  // ─── Update ───────────────────────────────────────────────────────────────
  const handleUpdate = async (values: { name: string }) => {
    if (!editRecord) return false;
    try {
      const formData = new FormData();
      formData.append('name', values.name);
      if (editImageFile?.originFileObj) {
        formData.append('image', editImageFile.originFileObj);
      }
      await api.patch(`/colors/${editRecord.id}`, formData);
      antMessage.success('Cập nhật màu sắc thành công!');
      setEditOpen(false);
      setEditRecord(null);
      setEditImageFile(null);
      loadData();
      return true;
    } catch (err: any) {
      antMessage.error(err?.message || 'Lỗi khi cập nhật màu sắc');
      return false;
    }
  };

  // ─── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/colors/${id}`);
      antMessage.success('Xóa màu sắc thành công!');
      loadData();
    } catch (err: any) {
      antMessage.error(err?.message || 'Lỗi khi xóa màu sắc');
    }
  };

  // ─── Upload slot component ─────────────────────────────────────────────────
  const UploadImageField = ({
    file,
    onChange,
    previewUrl,
  }: {
    file: UploadFile | null;
    onChange: (f: UploadFile | null) => void;
    previewUrl?: string;
  }) => {
    const preview = file ? URL.createObjectURL(file.originFileObj as File) : previewUrl;
    return (
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, fontSize: 14, color: 'rgba(0,0,0,0.85)' }}>
          Ảnh màu / vân gỗ <span style={{ color: '#8c8c8c', fontWeight: 400 }}>(tuỳ chọn)</span>
        </label>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          {/* Preview box */}
          <div style={{
            width: 80, height: 80, borderRadius: 8, border: '1px dashed #d9d9d9',
            overflow: 'hidden', background: '#fafafa', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {preview
              ? <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <PictureOutlined style={{ fontSize: 28, color: '#d9d9d9' }} />
            }
          </div>

          {/* Upload controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Upload
              accept="image/*"
              showUploadList={false}
              beforeUpload={(rawFile) => {
                const uploadFile: UploadFile = {
                  uid: `${Date.now()}`,
                  name: rawFile.name,
                  originFileObj: rawFile,
                  status: 'done',
                };
                onChange(uploadFile);
                return false; // không auto upload
              }}
            >
              <Button icon={<PlusOutlined />} size="small">
                {preview ? 'Đổi ảnh' : 'Chọn ảnh'}
              </Button>
            </Upload>
            {(file || previewUrl) && (
              <Button
                size="small"
                danger
                onClick={() => onChange(null)}
              >
                Xóa ảnh
              </Button>
            )}
            <span style={{ fontSize: 12, color: '#8c8c8c' }}>
              PNG, JPG · Tối đa 5MB
            </span>
          </div>
        </div>
      </div>
    );
  };

  if (!user) return null;

  return (
    <div style={{ padding: '0 0 40px' }}>
      {/* Header */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 16,
        justifyContent: 'space-between', alignItems: 'center', marginBottom: 20
      }}>
        <p style={{ margin: 0, color: 'rgba(0,0,0,0.45)', fontSize: 14 }}>
          Quản lý bảng màu sản phẩm — thêm, sửa, xóa màu sắc
        </p>
        <Space wrap>
          <Input.Search
            placeholder="Tìm kiếm màu sắc..."
            allowClear
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 240 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
            Thêm màu mới
          </Button>
        </Space>
      </div>

      <Spin spinning={loading} tip="Đang tải dữ liệu...">
        {filtered.length === 0 && !loading ? (
          <div style={{
            textAlign: 'center', padding: '60px 0',
            background: '#fff', borderRadius: 8, border: '1px solid #f0f0f0'
          }}>
            <BgColorsOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 12 }} />
            <p style={{ color: '#8c8c8c', fontSize: 15, margin: 0 }}>
              {searchText ? 'Không tìm thấy màu phù hợp' : 'Chưa có màu sắc nào. Hãy thêm màu đầu tiên!'}
            </p>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #f0f0f0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: 50 }} />
                <col style={{ width: 80 }} />
                <col />
                <col style={{ width: 140 }} />
                <col style={{ width: 150 }} />
              </colgroup>
              <thead>
                <tr style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 500, fontSize: 14, color: 'rgba(0,0,0,0.85)' }}>#</th>
                  <th style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 500, fontSize: 14, color: 'rgba(0,0,0,0.85)' }}>Ảnh</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500, fontSize: 14, color: 'rgba(0,0,0,0.85)' }}>Tên màu</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500, fontSize: 14, color: 'rgba(0,0,0,0.85)' }}>Ngày tạo</th>
                  <th style={{ padding: '12px 24px 12px 12px', textAlign: 'right', fontWeight: 500, fontSize: 14, color: 'rgba(0,0,0,0.85)' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, index) => (
                  <tr
                    key={item.id}
                    style={{ borderBottom: '1px solid #f5f5f5', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '14px 16px', textAlign: 'center', color: '#8c8c8c', fontSize: 14 }}>
                      {index + 1}
                    </td>
                    <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 6, border: '1px solid #f0f0f0' }}
                        />
                      ) : (
                        <div style={{
                          width: 44, height: 44, borderRadius: 6, border: '1px dashed #e0e0e0',
                          background: '#fafafa', display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          <PictureOutlined style={{ color: '#ccc', fontSize: 18 }} />
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 15, fontWeight: 500, color: 'rgba(0,0,0,0.85)' }}>
                      {item.name}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'rgba(0,0,0,0.55)', fontSize: 14 }}>
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : '—'}
                    </td>
                    <td style={{ padding: '14px 24px 14px 12px', textAlign: 'right' }}>
                      <Space>
                        <Button
                          type="text"
                          icon={<EditOutlined />}
                          style={{ color: '#1890ff', fontSize: 14 }}
                          onClick={() => {
                            setEditRecord(item);
                            setEditImageFile(null);
                            setEditOpen(true);
                          }}
                        >
                          Sửa
                        </Button>
                        <Popconfirm
                          title="Xóa màu sắc này?"
                          description="Hành động này không thể hoàn tác."
                          okText="Xóa"
                          cancelText="Hủy"
                          okButtonProps={{ danger: true }}
                          onConfirm={() => handleDelete(item.id)}
                        >
                          <Button type="text" danger icon={<DeleteOutlined />} style={{ fontSize: 14 }} />
                        </Popconfirm>
                      </Space>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Footer count */}
            <div style={{ padding: '10px 20px', borderTop: '1px solid #f0f0f0', color: '#8c8c8c', fontSize: 13 }}>
              Tổng: <strong>{filtered.length}</strong> màu sắc
              {searchText && ` (lọc từ ${items.length} màu)`}
            </div>
          </div>
        )}
      </Spin>

      {/* Modal Thêm */}
      <ModalForm<{ name: string }>
        title="Thêm màu sắc mới"
        open={createOpen}
        modalProps={{
          destroyOnClose: true,
          onCancel: () => { setCreateOpen(false); setCreateImageFile(null); }
        }}
        onFinish={handleCreate}
      >
        <ProFormText
          name="name"
          label="Tên màu sắc"
          placeholder="VD: Trắng, Đen, Đỏ, Xanh lá..."
          rules={[{ required: true, message: 'Vui lòng nhập tên màu' }]}
          fieldProps={{ prefix: <BgColorsOutlined style={{ color: '#bbb' }} /> }}
        />
        <UploadImageField
          file={createImageFile}
          onChange={setCreateImageFile}
        />
      </ModalForm>

      {/* Modal Sửa */}
      <ModalForm<{ name: string }>
        title={`Sửa màu: ${editRecord?.name ?? ''}`}
        open={editOpen}
        modalProps={{
          destroyOnClose: true,
          onCancel: () => { setEditOpen(false); setEditRecord(null); setEditImageFile(null); }
        }}
        initialValues={{ name: editRecord?.name }}
        onFinish={handleUpdate}
      >
        <ProFormText
          name="name"
          label="Tên màu sắc"
          placeholder="VD: Trắng, Đen, Đỏ, Xanh lá..."
          rules={[{ required: true, message: 'Vui lòng nhập tên màu' }]}
          fieldProps={{ prefix: <BgColorsOutlined style={{ color: '#bbb' }} /> }}
        />
        <UploadImageField
          file={editImageFile}
          onChange={setEditImageFile}
          previewUrl={editRecord?.imageUrl}
        />
      </ModalForm>
    </div>
  );
};

export default ColorManagementPage;
