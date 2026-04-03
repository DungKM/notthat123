import React, { useCallback, useEffect, useState } from 'react';
import {
  Button, Popconfirm, Space, Spin, Tag, Tooltip, Input, Select, Empty,
  Modal, Form, message as antMessage,
} from 'antd';
import {
  EditOutlined, DeleteOutlined, PlusOutlined,
  CaretRightOutlined, CaretDownOutlined, FolderOutlined, FileOutlined,
  SearchOutlined, InboxOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../../auth/hooks/useAuth';
// import api from '../../../api/axiosInstance'; // Bỏ comment khi có backend

const { TextArea } = Input;
const { Option } = Select;

// ─── Mock Data (xoá khi có API thật) ─────────────────────────────────────────
interface ItemCategory {
  _id: string;
  id: string;
  name: string;
  description?: string;
  unit?: string;
  parentId?: string | null;
  priority?: number;
  children?: ItemCategory[];
  createdAt?: string;
}

interface FormValues {
  name: string;
  description?: string;
  unit?: string;
  parentId?: string | null;
}

const INITIAL_MOCK_DATA: ItemCategory[] = [
  {
    _id: '1', id: '1',
    name: 'Nội thất phòng ngủ',
    description: 'Giường, tủ, bàn trang điểm và đồ nội thất phòng ngủ cao cấp',
    unit: undefined, parentId: null, priority: 0,
    createdAt: '2024-01-10T00:00:00Z',
    children: [
      { _id: '1-1', id: '1-1', name: 'Giường ngủ', description: 'Gỗ MDF xanh chống ẩm phủ Melamin màu ghi đậm', unit: 'Chiếc', parentId: '1', priority: 0, createdAt: '2024-01-11T00:00:00Z', children: [] },
      { _id: '1-2', id: '1-2', name: 'Tab ngăn kéo', description: 'Gỗ MDF xanh chống ẩm phủ Melamin màu ghi đậm', unit: 'Chiếc', parentId: '1', priority: 1, createdAt: '2024-01-12T00:00:00Z', children: [] },
      { _id: '1-3', id: '1-3', name: 'Bàn trang điểm', description: 'Gỗ MDF xanh chống ẩm phủ Melamin màu ghi đậm', unit: 'Chiếc', parentId: '1', priority: 2, createdAt: '2024-01-13T00:00:00Z', children: [] },
      { _id: '1-4', id: '1-4', name: 'Gương trang điểm', description: 'Gương tròn có led hắt sáng mặt dạng treo dây', unit: 'Chiếc', parentId: '1', priority: 3, createdAt: '2024-01-14T00:00:00Z', children: [] },
      { _id: '1-5', id: '1-5', name: 'Tủ áo', description: 'Gỗ MDF xanh chống ẩm phủ Melamin màu ghi đậm', unit: 'm2', parentId: '1', priority: 4, createdAt: '2024-01-15T00:00:00Z', children: [] },
    ],
  },
  {
    _id: '2', id: '2',
    name: 'Nội thất phòng khách',
    description: 'Sofa, bàn trà, kệ tivi và đồ nội thất phòng khách',
    unit: undefined, parentId: null, priority: 1,
    createdAt: '2024-01-20T00:00:00Z',
    children: [
      { _id: '2-1', id: '2-1', name: 'Sofa góc chữ L', description: 'Khung gỗ tự nhiên, bọc vải nhung cao cấp', unit: 'Bộ', parentId: '2', priority: 0, createdAt: '2024-01-21T00:00:00Z', children: [] },
      { _id: '2-2', id: '2-2', name: 'Bàn trà', description: 'Mặt kính cường lực, chân inox mạ vàng', unit: 'Chiếc', parentId: '2', priority: 1, createdAt: '2024-01-22T00:00:00Z', children: [] },
      { _id: '2-3', id: '2-3', name: 'Kệ tivi', description: 'Gỗ công nghiệp An Cường, sơn PU trắng bóng', unit: 'Chiếc', parentId: '2', priority: 2, createdAt: '2024-01-23T00:00:00Z', children: [] },
    ],
  },
  {
    _id: '3', id: '3',
    name: 'Nội thất phòng bếp',
    description: 'Tủ bếp, đảo bếp và thiết bị bếp',
    unit: undefined, parentId: null, priority: 2,
    createdAt: '2024-02-01T00:00:00Z',
    children: [
      { _id: '3-1', id: '3-1', name: 'Tủ bếp trên', description: 'Cánh Acrylic bóng, chống ẩm, dễ vệ sinh', unit: 'm2', parentId: '3', priority: 0, createdAt: '2024-02-02T00:00:00Z', children: [] },
      { _id: '3-2', id: '3-2', name: 'Tủ bếp dưới', description: 'Khung tủ Melamine chống ẩm, ray âm 45kg', unit: 'm2', parentId: '3', priority: 1, createdAt: '2024-02-03T00:00:00Z', children: [] },
      { _id: '3-3', id: '3-3', name: 'Đảo bếp', description: 'Mặt đá tự nhiên Marble, chân sắt sơn tĩnh điện', unit: 'Chiếc', parentId: '3', priority: 2, createdAt: '2024-02-04T00:00:00Z', children: [] },
    ],
  },
  {
    _id: '4', id: '4',
    name: 'Hạng mục khác',
    description: 'Sàn gỗ, phào chỉ và các hạng mục hoàn thiện khác',
    unit: undefined, parentId: null, priority: 3,
    createdAt: '2024-02-10T00:00:00Z',
    children: [
      { _id: '4-1', id: '4-1', name: 'Sàn gỗ', description: 'Sàn gỗ công nghiệp chống ẩm cao cấp', unit: 'm2', parentId: '4', priority: 0, createdAt: '2024-02-11T00:00:00Z', children: [] },
      { _id: '4-2', id: '4-2', name: 'Phào nẹp kết thúc', description: 'Phào nẹp nhựa kết thúc', unit: 'md', parentId: '4', priority: 1, createdAt: '2024-02-12T00:00:00Z', children: [] },
      { _id: '4-3', id: '4-3', name: 'Trần thạch cao', description: 'Trần phẳng khung xương chìm 300x300', unit: 'm2', parentId: '4', priority: 2, createdAt: '2024-02-13T00:00:00Z', children: [] },
    ],
  },
];

let mockIdCounter = 100;

// ─── Category Row ─────────────────────────────────────────────────────────────
const CategoryRow: React.FC<{
  item: ItemCategory;
  depth: number;
  expanded: boolean;
  hasChildren: boolean;
  onToggle: () => void;
  onEdit: (item: ItemCategory) => void;
  onDelete: (id: string) => void;
  onAddChild: (parentId: string) => void;
}> = ({ item, depth, expanded, hasChildren, onToggle, onEdit, onDelete, onAddChild }) => {
  const isParent = depth === 0;

  return (
    <tr
      style={{
        background: isParent ? '#fafafa' : '#ffffff',
        borderBottom: '1px solid #f0f0f0',
        transition: 'background 0.15s',
      }}
    >
      {/* Cột tên */}
      <td style={{ padding: '12px 16px', paddingLeft: depth * 28 + 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Toggle expand */}
          <span
            onClick={onToggle}
            style={{
              width: 20,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: hasChildren ? 'pointer' : 'default',
              color: '#8c8c8c',
              flexShrink: 0,
            }}
          >
            {hasChildren ? (
              expanded ? <CaretDownOutlined /> : <CaretRightOutlined />
            ) : (
              <span style={{ width: 16 }} />
            )}
          </span>

          {/* Icon folder/file */}
          <span style={{ color: isParent ? '#f59e0b' : '#6b7280', fontSize: 16, flexShrink: 0 }}>
            {isParent ? <FolderOutlined /> : <FileOutlined />}
          </span>

          {/* Tên */}
          <div>
            <span style={{ fontWeight: isParent ? 600 : 400, fontSize: 14, color: isParent ? '#111827' : '#374151' }}>
              {depth > 0 && <span style={{ color: '#d1d5db', marginRight: 6 }}>└</span>}
              {item.name}
            </span>
            {isParent && (
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
                {(item.children?.length || 0)} hạng mục con
              </div>
            )}
          </div>
        </div>
      </td>

      {/* Mô tả */}
      <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: 13, maxWidth: 240 }}>
        <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.description || <span style={{ color: '#d1d5db' }}>—</span>}
        </span>
      </td>

      {/* Đơn vị */}
      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
        {item.unit ? (
          <Tag style={{ margin: 0 }}>{item.unit}</Tag>
        ) : (
          <span style={{ color: '#d1d5db' }}>—</span>
        )}
      </td>

      {/* Ngày tạo */}
      <td style={{ padding: '12px 16px', color: '#9ca3af', fontSize: 13, whiteSpace: 'nowrap' }}>
        {item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : '—'}
      </td>

      {/* Thao tác */}
      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
        <Space size={4}>
          {isParent && (
            <Tooltip title="Thêm hạng mục con">
              <Button
                type="text"
                size="small"
                icon={<PlusOutlined />}
                style={{ color: '#10b981' }}
                onClick={() => onAddChild(item.id)}
              >
                Thêm con
              </Button>
            </Tooltip>
          )}
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            style={{ color: '#3b82f6' }}
            onClick={() => onEdit(item)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xoá hạng mục này?"
            description={hasChildren ? 'Các hạng mục con cũng sẽ bị ảnh hưởng.' : 'Hành động này không thể hoàn tác.'}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
            onConfirm={() => onDelete(item.id)}
          >
            <Button type="text" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      </td>
    </tr>
  );
};

// ─── Modal Form ───────────────────────────────────────────────────────────────
const CategoryFormModal: React.FC<{
  open: boolean;
  mode: 'create' | 'edit';
  initialValues?: Partial<FormValues>;
  parentOptions: ItemCategory[];
  onCancel: () => void;
  onFinish: (values: FormValues) => Promise<void>;
  defaultParentId?: string | null;
}> = ({ open, mode, initialValues, parentOptions, onCancel, onFinish, defaultParentId }) => {
  const [form] = Form.useForm<FormValues>();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && initialValues) {
        form.setFieldsValue(initialValues);
      } else {
        form.resetFields();
        form.setFieldValue('parentId', defaultParentId || null);
      }
    }
  }, [open, mode, initialValues, defaultParentId, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      await onFinish(values);
    } catch {
      // Validation error
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {mode === 'create' ? <PlusOutlined style={{ color: '#10b981' }} /> : <EditOutlined style={{ color: '#3b82f6' }} />}
          <span>{mode === 'create' ? 'Thêm hạng mục mới' : 'Chỉnh sửa hạng mục'}</span>
        </div>
      }
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText={mode === 'create' ? 'Tạo mới' : 'Lưu thay đổi'}
      cancelText="Hủy"
      confirmLoading={submitting}
      destroyOnClose
      width={520}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        {/* Hạng mục cha */}
        <Form.Item
          name="parentId"
          label="Hạng mục cha"
          tooltip="Để trống nếu đây là hạng mục gốc"
        >
          <Select
            allowClear
            placeholder="Không chọn (Hạng mục gốc)"
            showSearch
            optionFilterProp="label"
          >
            {parentOptions.map(p => (
              <Option key={p.id} value={p.id} label={p.name}>
                <FolderOutlined style={{ color: '#f59e0b', marginRight: 6 }} />
                {p.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Tên hạng mục */}
        <Form.Item
          name="name"
          label="Tên hạng mục"
          rules={[{ required: true, message: 'Vui lòng nhập tên hạng mục' }]}
        >
          <Input placeholder="VD: Nội thất phòng ngủ, Giường ngủ..." />
        </Form.Item>

        {/* Đơn vị */}
        <Form.Item name="unit" label="Đơn vị tính">
          <Select allowClear placeholder="Chọn đơn vị" showSearch optionFilterProp="label">
            {['Chiếc', 'Bộ', 'm2', 'm', 'md', 'Cái', 'Phòng', 'Kg', 'Tấm', 'Cụm'].map(u => (
              <Option key={u} value={u} label={u}>{u}</Option>
            ))}
          </Select>
        </Form.Item>

        {/* Mô tả */}
        <Form.Item name="description" label="Mô tả">
          <TextArea
            placeholder="Mô tả ngắn về hạng mục này..."
            autoSize={{ minRows: 2, maxRows: 5 }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const ItemCategoryManagementPage: React.FC = () => {
  const { user } = useAuth();

  const [rootItems, setRootItems] = useState<ItemCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [searchText, setSearchText] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editRecord, setEditRecord] = useState<ItemCategory | null>(null);
  const [defaultParentId, setDefaultParentId] = useState<string | null>(null);

  // ─── Load data (mock) ─────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    setRootItems(JSON.parse(JSON.stringify(INITIAL_MOCK_DATA)));
    setExpandedIds(new Set(INITIAL_MOCK_DATA.map(r => r.id)));
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const openCreate = () => {
    setModalMode('create');
    setEditRecord(null);
    setDefaultParentId(null);
    setModalOpen(true);
  };

  const openAddChild = (parentId: string) => {
    setModalMode('create');
    setEditRecord(null);
    setDefaultParentId(parentId);
    setModalOpen(true);
  };

  const openEdit = (item: ItemCategory) => {
    setModalMode('edit');
    setEditRecord(item);
    setDefaultParentId(null);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    setRootItems(prev => {
      const withoutRoot = prev.filter(r => r.id !== id);
      return withoutRoot.map(r => ({
        ...r,
        children: (r.children || []).filter(c => c.id !== id),
      }));
    });
    antMessage.success('Đã xoá hạng mục');
  };

  const handleSubmit = async (values: FormValues) => {
    const newId = String(++mockIdCounter);

    if (modalMode === 'create') {
      const newItem: ItemCategory = {
        _id: newId, id: newId,
        name: values.name,
        description: values.description,
        unit: values.unit,
        parentId: values.parentId || null,
        priority: 0,
        createdAt: new Date().toISOString(),
        children: [],
      };

      setRootItems(prev => {
        if (!values.parentId) {
          return [...prev, { ...newItem, children: [] }];
        } else {
          return prev.map(r =>
            r.id === values.parentId
              ? { ...r, children: [...(r.children || []), newItem] }
              : r
          );
        }
      });
      antMessage.success('Tạo hạng mục thành công');
    } else if (editRecord) {
      setRootItems(prev =>
        prev.map(r => {
          if (r.id === editRecord.id) return { ...r, ...values, children: r.children };
          return {
            ...r,
            children: (r.children || []).map(c =>
              c.id === editRecord.id ? { ...c, ...values } : c
            ),
          };
        })
      );
      antMessage.success('Cập nhật hạng mục thành công');
    }

    setModalOpen(false);
    setEditRecord(null);
  };

  const filtered = searchText.trim()
    ? rootItems.filter(r =>
      r.name.toLowerCase().includes(searchText.toLowerCase()) ||
      r.children?.some(c => c.name.toLowerCase().includes(searchText.toLowerCase()))
    )
    : rootItems;

  const parentOptions = rootItems;

  if (!user) return null;

  return (
    <div style={{ padding: '0 0 40px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ color: '#6b7280', fontSize: 13 }}>
          Quản lý hạng mục cha và hạng mục con. Hỗ trợ đơn vị tính riêng cho từng hạng mục.
        </div>
        <Space wrap>
          <Input
            placeholder="Tìm kiếm hạng mục..."
            prefix={<SearchOutlined style={{ color: '#d1d5db' }} />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            allowClear
            style={{ width: 240 }}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreate}
          >
            Thêm hạng mục
          </Button>
        </Space>
      </div>

      {/* Stats chips */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <Tag color="gold" style={{ fontSize: 13, padding: '4px 10px' }}>
          <FolderOutlined style={{ marginRight: 4 }} />
          {rootItems.length} hạng mục cha
        </Tag>
        <Tag color="blue" style={{ fontSize: 13, padding: '4px 10px' }}>
          <FileOutlined style={{ marginRight: 4 }} />
          {rootItems.reduce((acc, r) => acc + (r.children?.length || 0), 0)} hạng mục con
        </Tag>
      </div>

      {/* Table */}
      <Spin spinning={loading} tip="Đang tải...">
        <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', overflow: 'hidden', minHeight: 200 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ minWidth: 220 }} />
              <col style={{ width: '30%' }} />
              <col style={{ width: 90 }} />
              <col style={{ width: 110 }} />
              <col style={{ width: 200 }} />
            </colgroup>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: 13, color: '#374151' }}>Tên hạng mục</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: 13, color: '#374151' }}>Mô tả</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, fontSize: 13, color: '#374151' }}>Đơn vị</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: 13, color: '#374151' }}>Ngày tạo</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, fontSize: 13, color: '#374151', paddingRight: 20 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && !loading && (
                <tr>
                  <td colSpan={5}>
                    <Empty
                      image={<InboxOutlined style={{ fontSize: 48, color: '#d1d5db' }} />}
                      description={searchText ? 'Không tìm thấy hạng mục phù hợp' : 'Chưa có hạng mục nào'}
                      style={{ padding: '40px 0' }}
                    >
                      {!searchText && (
                        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} style={{ background: '#059669' }}>
                          Thêm hạng mục đầu tiên
                        </Button>
                      )}
                    </Empty>
                  </td>
                </tr>
              )}

              {filtered.map(root => {
                const isExpanded = expandedIds.has(root.id);
                const children = root.children || [];

                return (
                  <React.Fragment key={root.id}>
                    <CategoryRow
                      item={root}
                      depth={0}
                      expanded={isExpanded}
                      hasChildren={children.length > 0}
                      onToggle={() => toggleExpand(root.id)}
                      onEdit={openEdit}
                      onDelete={handleDelete}
                      onAddChild={openAddChild}
                    />

                    {isExpanded && children.map(child => (
                      <CategoryRow
                        key={child.id}
                        item={child}
                        depth={1}
                        expanded={false}
                        hasChildren={false}
                        onToggle={() => { }}
                        onEdit={openEdit}
                        onDelete={handleDelete}
                        onAddChild={openAddChild}
                      />
                    ))}

                    <tr>
                      <td colSpan={5} style={{ height: 2, background: '#f3f4f6', padding: 0 }} />
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </Spin>

      {/* Form Modal */}
      <CategoryFormModal
        open={modalOpen}
        mode={modalMode}
        initialValues={
          editRecord
            ? {
              name: editRecord.name,
              description: editRecord.description,
              unit: editRecord.unit,
              parentId: editRecord.parentId || null,
            }
            : undefined
        }
        parentOptions={parentOptions}
        defaultParentId={defaultParentId}
        onCancel={() => {
          setModalOpen(false);
          setEditRecord(null);
        }}
        onFinish={handleSubmit}
      />
    </div>
  );
};

export default ItemCategoryManagementPage;
