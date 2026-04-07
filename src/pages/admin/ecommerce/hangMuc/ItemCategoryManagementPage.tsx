import React, { useCallback, useEffect, useState } from 'react';
import {
  Button, Popconfirm, Space, Spin, Tag, Tooltip, Input, Select, Empty,
  Modal, Form, message as antMessage, InputNumber, Divider, AutoComplete,
} from 'antd';
import {
  EditOutlined, DeleteOutlined, PlusOutlined,
  CaretRightOutlined, CaretDownOutlined, FolderOutlined, FileOutlined,
  SearchOutlined, InboxOutlined, BranchesOutlined, ReloadOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../../../auth/hooks/useAuth';
import { useProductionCategoryService } from '../../../../api/services';

const { Option } = Select;

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ProductionNode {
  id: string;
  name: string;
  description?: string;
  size?: string;
  unit?: string;
  price?: number;
  type: 'category' | 'item' | 'variant';
  parentId: string | null;
  createdAt?: string;
  updatedAt?: string;
  children?: ProductionNode[];
}

// ─── Form Values ──────────────────────────────────────────────────────────────
interface FormValues {
  name: string;
  description?: string;
  size?: string;
  unit?: string;
  price?: number;
  parentId?: string | null;
  type?: 'category' | 'item' | 'variant';
}

// ─── Util ──────────────────────────────────────────────────────────────────
const fmtPrice = (p?: number) =>
  p != null ? p.toLocaleString('vi-VN') + '₫' : null;

const getMinPrice = (node: ProductionNode): number | null => {
  if (!node.children?.length) return node.price ?? null;
  const prices = node.children
    .map(c => getMinPrice(c))
    .filter((p): p is number => p !== null);
  return prices.length ? Math.min(...prices) : null;
};

const countByType = (nodes: ProductionNode[], type: ProductionNode['type']): number => {
  let count = 0;
  const walk = (arr: ProductionNode[]) => {
    for (const n of arr) {
      if (n.type === type) count++;
      if (n.children?.length) walk(n.children);
    }
  };
  walk(nodes);
  return count;
};

// ─── Variant Row (depth 2) ────────────────────────────────────────────────────
const VariantRow: React.FC<{
  variant: ProductionNode;
  parentUnit?: string;
  onEdit: (v: ProductionNode) => void;
  onDelete: (id: string) => void;
}> = ({ variant, parentUnit, onEdit, onDelete }) => (
  <tr style={{ background: '#fafeff', borderBottom: '1px solid #f0f9ff' }}>
    <td style={{ padding: '8px 16px', paddingLeft: 96 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ color: '#93c5fd', fontSize: 12 }}>└</span>
        <Tag color="blue" style={{ margin: 0, fontSize: 12 }}>{variant.name}</Tag>
      </div>
    </td>
    <td style={{ padding: '8px 16px', color: '#6b7280', fontSize: 12, maxWidth: 200 }}>
      <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {variant.description || <span style={{ color: '#d1d5db' }}>—</span>}
      </span>
    </td>
    <td style={{ padding: '8px 16px', textAlign: 'center' }}>
      {variant.size
        ? <Tag color="geekblue" style={{ margin: 0, fontFamily: 'monospace', fontSize: 11 }}>{variant.size}</Tag>
        : <span style={{ color: '#d1d5db' }}>—</span>}
    </td>
    <td style={{ padding: '8px 16px', textAlign: 'center' }}>
      {(variant.unit || parentUnit)
        ? <Tag style={{ margin: 0, fontSize: 12 }}>{variant.unit || parentUnit}</Tag>
        : <span style={{ color: '#d1d5db' }}>—</span>}
    </td>
    <td style={{ padding: '8px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
      {variant.price != null
        ? <span style={{ fontWeight: 600, color: '#d97706', fontSize: 13 }}>{fmtPrice(variant.price)}</span>
        : <span style={{ color: '#d1d5db' }}>—</span>}
    </td>
    <td style={{ padding: '8px 16px', textAlign: 'right' }}>
      <Space size={4}>
        <Button type="text" size="small" icon={<EditOutlined />} style={{ color: '#3b82f6', fontSize: 12 }} onClick={() => onEdit(variant)}>Sửa</Button>
        <Popconfirm title="Xóa biến thể này?" okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }} onConfirm={() => onDelete(variant.id)}>
          <Button type="text" size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      </Space>
    </td>
  </tr>
);

// ─── Category / Item Row ──────────────────────────────────────────────────────
const CategoryRow: React.FC<{
  node: ProductionNode;
  depth: number;
  expanded: boolean;
  onToggle: () => void;
  onEdit: (n: ProductionNode) => void;
  onDelete: (id: string) => void;
  onAddChild: (parentId: string, parentType: ProductionNode['type']) => void;
}> = ({ node, depth, expanded, onToggle, onEdit, onDelete, onAddChild }) => {
  const isCategory = node.type === 'category';
  const isItem = node.type === 'item';
  const hasChildren = (node.children?.length ?? 0) > 0;
  const minPrice = getMinPrice(node);
  const childCount = node.children?.length ?? 0;

  const paddingLeft = depth * 28 + 16;

  return (
    <tr style={{
      background: isCategory ? '#fafafa' : '#ffffff',
      borderBottom: '1px solid #f0f0f0',
      transition: 'background 0.15s',
    }}>
      {/* Tên */}
      <td style={{ padding: '12px 16px', paddingLeft }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            onClick={hasChildren ? onToggle : undefined}
            style={{
              width: 20,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              cursor: hasChildren ? 'pointer' : 'default',
              color: '#8c8c8c', flexShrink: 0,
            }}
          >
            {hasChildren
              ? (expanded ? <CaretDownOutlined /> : <CaretRightOutlined />)
              : <span style={{ width: 16 }} />}
          </span>

          <span style={{ color: isCategory ? '#f59e0b' : '#6b7280', fontSize: 16, flexShrink: 0 }}>
            {isCategory ? <FolderOutlined /> : <FileOutlined />}
          </span>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontWeight: isCategory ? 600 : 400, fontSize: 14, color: isCategory ? '#111827' : '#374151' }}>
                {depth > 0 && <span style={{ color: '#d1d5db', marginRight: 6 }}>└</span>}
                {node.name}
              </span>
              {isItem && hasChildren && (
                <Tag
                  icon={<BranchesOutlined />}
                  color="blue"
                  style={{ margin: 0, fontSize: 11, cursor: 'pointer' }}
                  onClick={onToggle}
                >
                  {childCount} loại
                </Tag>
              )}
            </div>
            {isCategory && (
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
                {childCount} hạng mục
              </div>
            )}
          </div>
        </div>
      </td>

      {/* Mô tả */}
      <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: 13, maxWidth: 220 }}>
        <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {isItem && hasChildren
            ? <span style={{ color: '#6366f1', fontStyle: 'italic', fontSize: 12 }}>Xem {childCount} biến thể bên dưới</span>
            : (node.description || <span style={{ color: '#d1d5db' }}>—</span>)}
        </span>
      </td>

      {/* Kích thước */}
      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
        {isItem && hasChildren
          ? <span style={{ color: '#d1d5db', fontSize: 12 }}>nhiều loại</span>
          : node.size
            ? <Tag color="geekblue" style={{ margin: 0, fontFamily: 'monospace', fontSize: 12 }}>{node.size}</Tag>
            : <span style={{ color: '#d1d5db' }}>—</span>}
      </td>

      {/* Đơn vị */}
      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
        {node.unit ? <Tag style={{ margin: 0 }}>{node.unit}</Tag> : <span style={{ color: '#d1d5db' }}>—</span>}
      </td>

      {/* Đơn giá */}
      <td style={{ padding: '12px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
        {isItem && hasChildren && minPrice != null
          ? <span style={{ color: '#d97706', fontSize: 12 }}>từ <b>{fmtPrice(minPrice)}</b></span>
          : node.price != null
            ? <span style={{ fontWeight: 600, color: '#d97706', fontSize: 13 }}>{fmtPrice(node.price)}</span>
            : <span style={{ color: '#d1d5db' }}>—</span>}
      </td>

      {/* Thao tác */}
      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
        <Space size={4}>
          {(isCategory || isItem) && (
            <Tooltip title={isCategory ? 'Thêm hạng mục' : 'Thêm biến thể'}>
              <Button
                type="text" size="small" icon={<PlusOutlined />}
                style={{ color: '#10b981' }}
                onClick={() => onAddChild(node.id, node.type)}
              >
                Thêm
              </Button>
            </Tooltip>
          )}
          <Button type="text" size="small" icon={<EditOutlined />} style={{ color: '#3b82f6' }} onClick={() => onEdit(node)}>
            Sửa
          </Button>
          <Popconfirm
            title="Xoá mục này?"
            description={hasChildren ? 'Các mục bên trong cũng sẽ bị xóa.' : 'Hành động này không thể hoàn tác.'}
            okText="Xóa" cancelText="Hủy"
            okButtonProps={{ danger: true }}
            onConfirm={() => onDelete(node.id)}
          >
            <Button type="text" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      </td>
    </tr>
  );
};

// ─── Category Form Modal ───────────────────────────────────────────────────────
const CategoryFormModal: React.FC<{
  open: boolean;
  mode: 'create' | 'edit';
  nodeType: ProductionNode['type'];
  initialValues?: Partial<FormValues>;
  categoryOptions: ProductionNode[];
  itemOptions: ProductionNode[];
  onCancel: () => void;
  onFinish: (values: FormValues) => Promise<void>;
  defaultParentId?: string | null;
}> = ({ open, mode, nodeType, initialValues, categoryOptions, itemOptions, onCancel, onFinish, defaultParentId }) => {
  const [form] = Form.useForm<FormValues>();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && initialValues) {
        form.setFieldsValue(initialValues);
      } else {
        form.resetFields();
        if (defaultParentId) form.setFieldValue('parentId', defaultParentId);
        form.setFieldValue('type', nodeType);
      }
    }
  }, [open, mode, initialValues, defaultParentId, form, nodeType]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      await onFinish(values);
    } catch {
      // validation errors
    } finally {
      setSubmitting(false);
    }
  };

  const titleMap: Record<ProductionNode['type'], string> = {
    category: 'danh mục',
    item: 'hạng mục',
    variant: 'biến thể',
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {mode === 'create' ? <PlusOutlined style={{ color: '#10b981' }} /> : <EditOutlined style={{ color: '#3b82f6' }} />}
          <span>{mode === 'create' ? `Thêm ${titleMap[nodeType]}` : `Chỉnh sửa ${titleMap[nodeType]}`}</span>
        </div>
      }
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText={mode === 'create' ? 'Tạo mới' : 'Lưu thay đổi'}
      cancelText="Hủy"
      confirmLoading={submitting}
      destroyOnClose
      width={580}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        {/* Tên */}
        <Form.Item
          name="name"
          label="Tên"
          rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
        >
          <Input
            placeholder={
              nodeType === 'category' ? 'VD: Nội thất phòng khách...'
                : nodeType === 'item' ? 'VD: Ghế Sofa, Bàn ăn...'
                  : 'VD: Sofa nỉ 3 chỗ...'
            }
          />
        </Form.Item>

        {/* Mô tả (category & item) */}
        {nodeType !== 'variant' && !(mode === 'edit' && nodeType === 'category') && (
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={2} placeholder="Mô tả ngắn (tuỳ chọn)" />
          </Form.Item>
        )}

        {/* Kích thước */}
        {(nodeType === 'item' || nodeType === 'variant') && (
          <Form.Item name="size" label="Kích thước (mm)">
            <Input placeholder="VD: 2400x900" addonAfter="mm" />
          </Form.Item>
        )}

        {/* Đơn vị */}
        {(nodeType === 'item' || nodeType === 'variant') && (
          <Form.Item name="unit" label="Đơn vị tính">
            <AutoComplete
              allowClear
              placeholder="VD: Chiếc, Bộ, m2..."
              options={['Chiếc', 'Bộ', 'm2', 'm', 'md', 'Cái', 'Phòng', 'Kg', 'Tấm', 'Cụm'].map(u => ({ value: u, label: u }))}
              filterOption={(input, option) =>
                String(option?.value ?? '').toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>
        )}

        {/* Đơn giá */}
        {(nodeType === 'item' || nodeType === 'variant') && (
          <Form.Item name="price" label="Đơn giá (VNĐ)">
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              placeholder="VD: 15000000"
              formatter={val => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
              parser={val => Number(val!.replace(/\./g, '')) as unknown as 0}
              addonAfter="₫"
            />
          </Form.Item>
        )}

        {/* Parent (chỉ khi tạo mới item hoặc variant) */}
        {mode === 'create' && nodeType === 'item' && (
          <Form.Item name="parentId" label="Thuộc danh mục">
            <Select placeholder="Chọn danh mục cha" allowClear>
              {categoryOptions.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
            </Select>
          </Form.Item>
        )}
        {mode === 'create' && nodeType === 'variant' && (
          <Form.Item name="parentId" label="Thuộc hạng mục">
            <Select placeholder="Chọn hạng mục cha" allowClear>
              {itemOptions.map(i => <Option key={i.id} value={i.id}>{i.name}</Option>)}
            </Select>
          </Form.Item>
        )}

        {/* type ẩn */}
        <Form.Item name="type" hidden><Input /></Form.Item>
      </Form>
    </Modal>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const ItemCategoryManagementPage: React.FC = () => {
  const { user } = useAuth();
  const svc = useProductionCategoryService();

  const [treeData, setTreeData] = useState<ProductionNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [searchText, setSearchText] = useState('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [modalNodeType, setModalNodeType] = useState<ProductionNode['type']>('category');
  const [editRecord, setEditRecord] = useState<ProductionNode | null>(null);
  const [defaultParentId, setDefaultParentId] = useState<string | null>(null);

  // ─── Load hierarchy ─────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await svc.request<any>('GET', '/hierarchy');
      // API trả { success, message, data: [...] } — cần unwrap
      const data: ProductionNode[] = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : [];
      setTreeData(data);
      // Auto expand tất cả category
      const ids = new Set<string>();
      const walkExpand = (nodes: ProductionNode[]) => {
        for (const n of nodes) {
          if (n.type === 'category') ids.add(n.id);
          if (n.children?.length) walkExpand(n.children);
        }
      };
      walkExpand(data);
      setExpandedIds(ids);
    } catch {
      setTreeData([]);
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line

  useEffect(() => { loadData(); }, [loadData]);

  // ─── Expand toggle ──────────────────────────────────────────────────────────
  const toggleExpand = (id: string) => setExpandedIds(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  // ─── Open modals ────────────────────────────────────────────────────────────
  const openCreate = (type: ProductionNode['type'] = 'category', parentId?: string) => {
    setModalMode('create');
    setModalNodeType(type);
    setEditRecord(null);
    setDefaultParentId(parentId ?? null);
    setModalOpen(true);
  };

  const openEdit = (node: ProductionNode) => {
    setModalMode('edit');
    setModalNodeType(node.type);
    setEditRecord(node);
    setDefaultParentId(null);
    setModalOpen(true);
  };

  // ─── CRUD ───────────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    try {
      await svc.remove(id);
      await loadData();
    } catch {
      // error handled
    }
  };

  const handleSubmit = async (values: FormValues) => {
    try {
      const nodeType = values.type ?? modalNodeType;

      if (modalMode === 'create') {
        // POST: gửi đầy đủ theo API spec
        const payload: Record<string, any> = {
          name: values.name,
          type: nodeType,
          parentId: nodeType === 'category' ? null : (values.parentId ?? null),
        };
        if (values.description) payload.description = values.description;
        if (values.size) payload.size = values.size;
        if (values.unit) payload.unit = values.unit;
        if (values.price != null) payload.price = values.price;

        await svc.create(payload);
      } else if (editRecord) {
        // PATCH: chỉ gửi price & size
        const patchPayload: Record<string, any> = {};
        if (values.price != null) patchPayload.price = values.price;
        if (values.size) patchPayload.size = values.size;

        await svc.patch(editRecord.id, patchPayload);
      }

      setModalOpen(false);
      setEditRecord(null);
      await loadData();
    } catch {
      // error handled by hook (antd message)
    }
  };

  // ─── Helpers lấy flat list theo type (cho select options) ────────────────────
  const getAllByType = (type: ProductionNode['type']): ProductionNode[] => {
    const result: ProductionNode[] = [];
    const walk = (nodes: ProductionNode[]) => {
      for (const n of nodes) {
        if (n.type === type) result.push(n);
        if (n.children?.length) walk(n.children);
      }
    };
    walk(treeData);
    return result;
  };

  // ─── Filter search ───────────────────────────────────────────────────────────
  const filterTree = (nodes: ProductionNode[], q: string): ProductionNode[] => {
    if (!q) return nodes;
    const lq = q.toLowerCase();
    return nodes
      .map(n => {
        const match = n.name.toLowerCase().includes(lq);
        const filteredChildren = filterTree(n.children ?? [], q);
        if (match || filteredChildren.length > 0) {
          return { ...n, children: filteredChildren };
        }
        return null;
      })
      .filter(Boolean) as ProductionNode[];
  };

  const filtered = filterTree(treeData, searchText.trim());

  // Stats
  const totalCategory = countByType(treeData, 'category');
  const totalItem = countByType(treeData, 'item');
  const totalVariant = countByType(treeData, 'variant');

  // ─── Recursive renderer ──────────────────────────────────────────────────────
  const renderRows = (nodes: ProductionNode[], depth: number): React.ReactNode[] => {
    const rows: React.ReactNode[] = [];

    for (const node of nodes) {
      const isExpanded = expandedIds.has(node.id);
      const hasChildren = (node.children?.length ?? 0) > 0;

      if (node.type === 'variant') {
        // Render as variant row
        const parentItem = getAllByType('item').find(i => i.id === node.parentId);
        rows.push(
          <VariantRow
            key={node.id}
            variant={node}
            parentUnit={parentItem?.unit}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
        );
      } else {
        rows.push(
          <CategoryRow
            key={node.id}
            node={node}
            depth={depth}
            expanded={isExpanded}
            onToggle={() => toggleExpand(node.id)}
            onEdit={openEdit}
            onDelete={handleDelete}
            onAddChild={(parentId, parentType) => {
              const childType: ProductionNode['type'] = parentType === 'category' ? 'item' : 'variant';
              openCreate(childType, parentId);
            }}
          />
        );

        if (isExpanded && hasChildren) {
          rows.push(...renderRows(node.children!, depth + 1));
        }
      }
    }
    return rows;
  };

  if (!user) return null;

  return (
    <div style={{ padding: '0 0 40px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ color: '#6b7280', fontSize: 13 }}>
          Quản lý danh mục và hạng mục bên trong. Hỗ trợ nhiều biến thể (loại) cho mỗi hạng mục.
        </div>
        <Space wrap>
          <Input
            placeholder="Tìm kiếm hạng mục..."
            prefix={<SearchOutlined style={{ color: '#d1d5db' }} />}
            value={searchText} onChange={e => setSearchText(e.target.value)}
            allowClear style={{ width: 240 }}
          />
          <Tooltip title="Tải lại dữ liệu">
            <Button icon={<ReloadOutlined />} onClick={loadData} loading={loading} />
          </Tooltip>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openCreate('category')}
          >
            Thêm danh mục
          </Button>
        </Space>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <Tag color="gold" style={{ fontSize: 13, padding: '4px 10px' }}>
          <FolderOutlined style={{ marginRight: 4 }} />{totalCategory} danh mục
        </Tag>
        <Tag color="blue" style={{ fontSize: 13, padding: '4px 10px' }}>
          <FileOutlined style={{ marginRight: 4 }} />{totalItem} hạng mục
        </Tag>
        <Tag color="purple" style={{ fontSize: 13, padding: '4px 10px' }}>
          <BranchesOutlined style={{ marginRight: 4 }} />{totalVariant} biến thể
        </Tag>
      </div>

      {/* Table */}
      <Spin spinning={loading} tip="Đang tải...">
        <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', overflowX: 'auto', minHeight: 200 }}>
          <table style={{ width: '100%', minWidth: 900, borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '27%' }} />
              <col style={{ width: 'auto' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: 180 }} />
            </colgroup>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: 13, color: '#374151' }}>Tên</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: 13, color: '#374151' }}>Mô tả</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, fontSize: 13, color: '#374151' }}>Kích thước (mm)</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, fontSize: 13, color: '#374151' }}>Đơn vị</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, fontSize: 13, color: '#d97706' }}>Đơn giá (VNĐ)</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, fontSize: 13, color: '#374151', paddingRight: 20 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && !loading && (
                <tr>
                  <td colSpan={6}>
                    <Empty
                      image={<InboxOutlined style={{ fontSize: 48, color: '#d1d5db' }} />}
                      description={searchText ? 'Không tìm thấy phù hợp' : 'Chưa có mục nào'}
                      style={{ padding: '40px 0' }}
                    >
                      {!searchText && (
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => openCreate('category')}>
                          Thêm danh mục đầu tiên
                        </Button>
                      )}
                    </Empty>
                  </td>
                </tr>
              )}

              {/* Render rows */}
              {filtered.map(root => (
                <React.Fragment key={root.id}>
                  {renderRows([root], 0)}
                  <tr>
                    <td colSpan={6} style={{ height: 2, background: '#f3f4f6', padding: 0 }} />
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </Spin>

      {/* Form Modal */}
      <CategoryFormModal
        open={modalOpen}
        mode={modalMode}
        nodeType={modalNodeType}
        initialValues={editRecord ? {
          name: editRecord.name,
          description: editRecord.description,
          size: editRecord.size,
          unit: editRecord.unit,
          price: editRecord.price,
          parentId: editRecord.parentId,
          type: editRecord.type,
        } : undefined}
        categoryOptions={getAllByType('category')}
        itemOptions={getAllByType('item')}
        defaultParentId={defaultParentId}
        onCancel={() => { setModalOpen(false); setEditRecord(null); }}
        onFinish={handleSubmit}
      />
    </div>
  );
};

export default ItemCategoryManagementPage;
