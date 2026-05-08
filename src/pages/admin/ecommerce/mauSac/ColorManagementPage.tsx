import React, { useCallback, useEffect, useState } from 'react';
import {
  Button, Popconfirm, Space, Spin, Input, message as antMessage,
} from 'antd';
import {
  EditOutlined, DeleteOutlined, PlusOutlined, BgColorsOutlined,
} from '@ant-design/icons';
import { ModalForm, ProFormText } from '@ant-design/pro-components';
import { useAuth } from '@/src/auth/hooks/useAuth';
import api from '@/src/api/axiosInstance';

// ─── Types ───────────────────────────────────────────────────────────────────
interface ColorItem {
  id: string;
  name: string;
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

  // ─── Load ─────────────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await api.get('/colors', { params: { limit: 200 } });
      // res đã được interceptor unwrap → { success, message, data: [...] }
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
      await api.post('/colors', { name: values.name });
      antMessage.success('Thêm màu sắc thành công!');
      setCreateOpen(false);
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
      await api.patch(`/colors/${editRecord.id}`, { name: values.name });
      antMessage.success('Cập nhật màu sắc thành công!');
      setEditOpen(false);
      setEditRecord(null);
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
                <col style={{ width: 60 }} />
                <col />
                <col style={{ width: 160 }} />
                <col style={{ width: 160 }} />
              </colgroup>
              <thead>
                <tr style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 500, fontSize: 14, color: 'rgba(0,0,0,0.85)' }}>#</th>
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
                          onClick={() => { setEditRecord(item); setEditOpen(true); }}
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
        modalProps={{ destroyOnClose: true, onCancel: () => setCreateOpen(false) }}
        onFinish={handleCreate}
      >
        <ProFormText
          name="name"
          label="Tên màu sắc"
          placeholder="VD: Trắng, Đen, Đỏ, Xanh lá..."
          rules={[{ required: true, message: 'Vui lòng nhập tên màu' }]}
          fieldProps={{ prefix: <BgColorsOutlined style={{ color: '#bbb' }} /> }}
        />
      </ModalForm>

      {/* Modal Sửa */}
      <ModalForm<{ name: string }>
        title={`Sửa màu: ${editRecord?.name ?? ''}`}
        open={editOpen}
        modalProps={{
          destroyOnClose: true,
          onCancel: () => { setEditOpen(false); setEditRecord(null); }
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
      </ModalForm>
    </div>
  );
};

export default ColorManagementPage;
