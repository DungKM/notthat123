import React, { useCallback, useEffect, useState } from 'react';
import {
  Button, Popconfirm, Space, Spin, Tag, Tooltip, Input, Select, Empty,
  Modal, Form, message as antMessage, InputNumber, Divider, AutoComplete,
} from 'antd';
import {
  EditOutlined, DeleteOutlined, PlusOutlined,
  CaretRightOutlined, CaretDownOutlined, FolderOutlined, FileOutlined,
  SearchOutlined, InboxOutlined, BranchesOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../../../auth/hooks/useAuth';
import { ITEM_CATEGORIES_MOCK, getMinPrice } from '../../../../data/itemCategories';
import type { ItemCategory, ItemVariant } from '../../../../data/itemCategories';

const { TextArea } = Input;
const { Option } = Select;

// ─── Form Values ──────────────────────────────────────────────────────────────
interface FormValues {
  name: string;
  description?: string;
  unit?: string;
  parentId?: string | null;
}

let mockIdCounter = 100;
let mockVariantCounter = 1000;

// ─── Variant Row (depth 2) ────────────────────────────────────────────────────
const VariantRow: React.FC<{
  variant: ItemVariant;
  parentUnit?: string;
  onEdit: (v: ItemVariant) => void;
  onDelete: (id: string) => void;
}> = ({ variant, parentUnit, onEdit, onDelete }) => (
  <tr style={{ background: '#fafeff', borderBottom: '1px solid #f0f9ff' }}>
    {/* Tên loại */}
    <td style={{ padding: '8px 16px', paddingLeft: 88 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ color: '#93c5fd', fontSize: 12 }}>└</span>
        <Tag color="blue" style={{ margin: 0, fontSize: 12 }}>{variant.label}</Tag>
      </div>
    </td>
    {/* Mô tả */}
    <td style={{ padding: '8px 16px', color: '#6b7280', fontSize: 12, maxWidth: 200 }}>
      <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {variant.description || <span style={{ color: '#d1d5db' }}>—</span>}
      </span>
    </td>
    {/* Kích thước */}
    <td style={{ padding: '8px 16px', textAlign: 'center' }}>
      {variant.dimensions
        ? <Tag color="geekblue" style={{ margin: 0, fontFamily: 'monospace', fontSize: 11 }}>{variant.dimensions}</Tag>
        : <span style={{ color: '#d1d5db' }}>—</span>}
    </td>
    {/* Đơn vị */}
    <td style={{ padding: '8px 16px', textAlign: 'center' }}>
      {(variant.unit || parentUnit)
        ? <Tag style={{ margin: 0, fontSize: 12 }}>{variant.unit || parentUnit}</Tag>
        : <span style={{ color: '#d1d5db' }}>—</span>}
    </td>
    {/* Đơn giá */}
    <td style={{ padding: '8px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
      {variant.price != null
        ? <span style={{ fontWeight: 600, color: '#d97706', fontSize: 13 }}>{variant.price.toLocaleString('vi-VN')}₫</span>
        : <span style={{ color: '#d1d5db' }}>—</span>}
    </td>
    {/* Ngày tạo (trống) */}
    <td />
    {/* Thao tác */}
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

// ─── Category Row (depth 0 & 1) ───────────────────────────────────────────────
const CategoryRow: React.FC<{
  item: ItemCategory;
  depth: number;
  expanded: boolean;
  hasChildren: boolean;
  variantsExpanded: boolean;
  onToggle: () => void;
  onToggleVariants: () => void;
  onEdit: (item: ItemCategory) => void;
  onDelete: (id: string) => void;
  onAddChild: (parentId: string) => void;
}> = ({ item, depth, expanded, hasChildren, variantsExpanded, onToggle, onToggleVariants, onEdit, onDelete, onAddChild }) => {
  const isParent = depth === 0;
  const hasVariants = (item.variants?.length ?? 0) > 0;
  const minPrice = getMinPrice(item);

  return (
    <tr style={{
      background: isParent ? '#fafafa' : '#ffffff',
      borderBottom: '1px solid #f0f0f0',
      transition: 'background 0.15s',
    }}>
      {/* Tên */}
      <td style={{ padding: '12px 16px', paddingLeft: depth * 28 + 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Toggle expand children (parent) hoặc toggle variants (child) */}
          <span
            onClick={isParent ? onToggle : (hasVariants ? onToggleVariants : undefined)}
            style={{
              width: 20,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              cursor: (isParent && hasChildren) || (!isParent && hasVariants) ? 'pointer' : 'default',
              color: '#8c8c8c', flexShrink: 0,
            }}
          >
            {isParent && hasChildren
              ? (expanded ? <CaretDownOutlined /> : <CaretRightOutlined />)
              : !isParent && hasVariants
                ? (variantsExpanded ? <CaretDownOutlined style={{ color: '#60a5fa' }} /> : <CaretRightOutlined style={{ color: '#60a5fa' }} />)
                : <span style={{ width: 16 }} />}
          </span>

          {/* Icon */}
          <span style={{ color: isParent ? '#f59e0b' : '#6b7280', fontSize: 16, flexShrink: 0 }}>
            {isParent ? <FolderOutlined /> : <FileOutlined />}
          </span>

          {/* Tên + badge */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontWeight: isParent ? 600 : 400, fontSize: 14, color: isParent ? '#111827' : '#374151' }}>
                {depth > 0 && <span style={{ color: '#d1d5db', marginRight: 6 }}>└</span>}
                {item.name}
              </span>
              {!isParent && hasVariants && (
                <Tag
                  icon={<BranchesOutlined />}
                  color="blue"
                  style={{ margin: 0, fontSize: 11, cursor: 'pointer' }}
                  onClick={onToggleVariants}
                >
                  {item.variants!.length} loại
                </Tag>
              )}
            </div>
            {isParent && (
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
                {(item.children?.length || 0)} hạng mục
              </div>
            )}
          </div>
        </div>
      </td>

      {/* Mô tả */}
      <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: 13, maxWidth: 220 }}>
        <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {hasVariants
            ? <span style={{ color: '#6366f1', fontStyle: 'italic', fontSize: 12 }}>Xem {item.variants!.length} biến thể bên dưới</span>
            : (item.description || <span style={{ color: '#d1d5db' }}>—</span>)}
        </span>
      </td>

      {/* Kích thước */}
      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
        {hasVariants
          ? <span style={{ color: '#d1d5db', fontSize: 12 }}>nhiều loại</span>
          : item.dimensions
            ? <Tag color="geekblue" style={{ margin: 0, fontFamily: 'monospace', fontSize: 12 }}>{item.dimensions}</Tag>
            : <span style={{ color: '#d1d5db' }}>—</span>}
      </td>

      {/* Đơn vị */}
      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
        {item.unit ? <Tag style={{ margin: 0 }}>{item.unit}</Tag> : <span style={{ color: '#d1d5db' }}>—</span>}
      </td>

      {/* Đơn giá */}
      <td style={{ padding: '12px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
        {hasVariants && minPrice != null
          ? <span style={{ color: '#d97706', fontSize: 12 }}>từ <b>{minPrice.toLocaleString('vi-VN')}₫</b></span>
          : item.price != null
            ? <span style={{ fontWeight: 600, color: '#d97706', fontSize: 13 }}>{item.price.toLocaleString('vi-VN')}₫</span>
            : <span style={{ color: '#d1d5db' }}>—</span>}
      </td>


      {/* Thao tác */}
      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
        <Space size={4}>
          {isParent && (
            <Tooltip title="Thêm hạng mục">
              <Button type="text" size="small" icon={<PlusOutlined />} style={{ color: '#10b981' }} onClick={() => onAddChild(item.id)}>
                Thêm
              </Button>
            </Tooltip>
          )}
          <Button type="text" size="small" icon={<EditOutlined />} style={{ color: '#3b82f6' }} onClick={() => onEdit(item)}>
            Sửa
          </Button>
          <Popconfirm
            title="Xoá mục này?"
            description={hasChildren ? 'Các hạng mục bên trong cũng sẽ bị ảnh hưởng.' : 'Hành động này không thể hoàn tác.'}
            okText="Xóa" cancelText="Hủy"
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

// ─── Variant Editor (dùng trong form modal) ───────────────────────────────────
const VariantEditor: React.FC<{
  variants: ItemVariant[];
  parentUnit?: string;
  onChange: (variants: ItemVariant[]) => void;
}> = ({ variants, parentUnit, onChange }) => {
  const addVariant = () => {
    onChange([...variants, {
      id: `new-${++mockVariantCounter}`,
      label: '',
      description: '',
      dimensions: '',
      price: undefined,
      unit: parentUnit,
    }]);
  };

  const updateVariant = (index: number, field: keyof ItemVariant, value: any) => {
    const updated = variants.map((v, i) => i === index ? { ...v, [field]: value } : v);
    onChange(updated);
  };

  const removeVariant = (index: number) => {
    onChange(variants.filter((_, i) => i !== index));
  };

  return (
    <div>
      {variants.length === 0 && (
        <div style={{ textAlign: 'center', padding: '16px 0', color: '#9ca3af', fontSize: 13 }}>
          Chưa có biến thể nào. Nhấn "+ Thêm" để bắt đầu.
        </div>
      )}
      {variants.map((v, i) => (
        <div key={v.id} style={{
          padding: '10px 12px', marginBottom: 8,
          background: '#f9fafb', borderRadius: 8,
          border: '1px solid #e5e7eb',
        }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>Tên loại *</div>
              <Input
                size="small"
                placeholder="VD: Loại 1.8m, Gỗ tự nhiên..."
                value={v.label}
                onChange={e => updateVariant(i, 'label', e.target.value)}
              />
            </div>
            <div style={{ flex: 1.5 }}>
              <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>Chất liệu / Mô tả</div>
              <Input
                size="small"
                placeholder="VD: Gỗ MDF xanh chống ẩm..."
                value={v.description}
                onChange={e => updateVariant(i, 'description', e.target.value)}
              />
            </div>
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => removeVariant(i)}
              style={{ flexShrink: 0, marginTop: 18 }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>Kích thước (mm)</div>
              <Input
                size="small"
                placeholder="1800x2000x950"
                value={v.dimensions}
                onChange={e => updateVariant(i, 'dimensions', e.target.value)}
                addonAfter={<span style={{ fontSize: 10 }}>mm</span>}
              />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>Đơn giá (VNĐ)</div>
              <InputNumber
                size="small"
                style={{ width: '100%' }}
                placeholder="5.500.000"
                min={0}
                value={v.price}
                formatter={val => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                parser={val => Number(val!.replace(/\./g, '')) as unknown as 0}
                onChange={val => updateVariant(i, 'price', val)}
                addonAfter="₫"
              />
            </div>
            <div style={{ width: 120 }}>
              <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>Đơn vị (nếu khác)</div>
              <AutoComplete
                size="small"
                style={{ width: '100%' }}
                allowClear
                placeholder={parentUnit || 'Đơn vị'}
                value={v.unit !== parentUnit ? v.unit : undefined}
                onChange={val => updateVariant(i, 'unit', val || parentUnit)}
                options={['Chiếc', 'Bộ', 'm2', 'm', 'md', 'Cái', 'Kg'].map(u => ({ value: u, label: u }))}
                filterOption={(input, option) =>
                  String(option?.value ?? '').toLowerCase().includes(input.toLowerCase())
                }
              />
            </div>
          </div>
        </div>
      ))}
      <Button size="small" type="dashed" icon={<PlusOutlined />} onClick={addVariant} block>
        Thêm biến thể
      </Button>
    </div>
  );
};

// ─── Modal Form ───────────────────────────────────────────────────────────────
const CategoryFormModal: React.FC<{
  open: boolean;
  mode: 'create' | 'edit';
  initialValues?: Partial<FormValues>;
  initialVariants?: ItemVariant[];
  parentOptions: ItemCategory[];
  onCancel: () => void;
  onFinish: (values: FormValues, variants: ItemVariant[]) => Promise<void>;
  defaultParentId?: string | null;
}> = ({ open, mode, initialValues, initialVariants, parentOptions, onCancel, onFinish, defaultParentId }) => {
  const [form] = Form.useForm<FormValues>();
  const [submitting, setSubmitting] = useState(false);
  const [hasParent, setHasParent] = useState(false);
  const [variants, setVariants] = useState<ItemVariant[]>([]);
  const currentUnit = Form.useWatch('unit', form);

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && initialValues) {
        form.setFieldsValue(initialValues);
        setHasParent(!!initialValues.parentId);
        setVariants(initialVariants || []);
      } else {
        form.resetFields();
        form.setFieldValue('parentId', defaultParentId || null);
        setHasParent(!!defaultParentId);
        setVariants([]);
      }
    }
  }, [open, mode, initialValues, initialVariants, defaultParentId, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      await onFinish(values, variants);
    } catch {
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {mode === 'create' ? <PlusOutlined style={{ color: '#10b981' }} /> : <EditOutlined style={{ color: '#3b82f6' }} />}
          <span>{mode === 'create' ? 'Thêm mục mới' : 'Chỉnh sửa'}</span>
        </div>
      }
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText={mode === 'create' ? 'Tạo mới' : 'Lưu thay đổi'}
      cancelText="Hủy"
      confirmLoading={submitting}
      destroyOnClose
      width={640}
    >
      <Form
        form={form}
        layout="vertical"
        style={{ marginTop: 16 }}
      >
        {/* Tên — luôn hiện */}
        <Form.Item
          name="name"
          label="Tên"
          rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
        >
          <Input placeholder={hasParent ? 'VD: Giường ngủ, Tủ áo...' : 'VD: Nội thất phòng ngủ, Nội thất bếp...'} />
        </Form.Item>

        {/* Đơn vị — chỉ hiện khi là hạng mục (có parentId) */}
        {hasParent && (
          <Form.Item name="unit" label="Đơn vị tính">
            <AutoComplete
              allowClear
              placeholder="VD: Chiếc, Bộ, m2..."
              options={[
                'Chiếc', 'Bộ', 'm2', 'm', 'md', 'Cái', 'Phòng', 'Kg', 'Tấm', 'Cụm'
              ].map(u => ({ value: u, label: u }))}
              filterOption={(input, option) =>
                String(option?.value ?? '').toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>
        )}

        {/* Phần biến thể — chỉ hiện khi là hạng mục con */}
        {hasParent && (
          <>
            <Divider orientation="left" style={{ margin: '12px 0', fontSize: 13, color: '#4b5563' }}>
              <BranchesOutlined style={{ marginRight: 6 }} />
              Các biến thể (loại)
              <span style={{ marginLeft: 8, fontSize: 11, color: '#9ca3af', fontWeight: 400 }}>
                — Nếu hạng mục có nhiều loại kích thước/chất liệu/giá khác nhau
              </span>
            </Divider>
            <VariantEditor
              variants={variants}
              parentUnit={currentUnit}
              onChange={setVariants}
            />
          </>
        )}
      </Form>
    </Modal>
  );
};

// ─── Variant Edit Modal ───────────────────────────────────────────────────────
const VariantEditModal: React.FC<{
  open: boolean;
  variant: ItemVariant | null;
  parentUnit?: string;
  onCancel: () => void;
  onSave: (v: ItemVariant) => void;
}> = ({ open, variant, parentUnit, onCancel, onSave }) => {
  const [data, setData] = useState<ItemVariant | null>(null);

  useEffect(() => {
    if (open && variant) setData({ ...variant });
  }, [open, variant]);

  if (!data) return null;

  const update = (field: keyof ItemVariant, value: any) => setData(d => d ? { ...d, [field]: value } : d);

  return (
    <Modal
      title={<><EditOutlined style={{ color: '#3b82f6', marginRight: 8 }} />Sửa biến thể</>}
      open={open}
      onCancel={onCancel}
      onOk={() => { if (data) onSave(data); }}
      okText="Lưu"
      cancelText="Hủy"
      width={500}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
        <div>
          <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Tên loại *</div>
          <Input placeholder="Loại 1.8m, Gỗ tự nhiên..." value={data.label} onChange={e => update('label', e.target.value)} />
        </div>
        <div>
          <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Chất liệu / Mô tả</div>
          <Input placeholder="Gỗ MDF xanh chống ẩm..." value={data.description} onChange={e => update('description', e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Kích thước (mm)</div>
            <Input placeholder="1800x2000x950" value={data.dimensions} onChange={e => update('dimensions', e.target.value)} addonAfter="mm" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Đơn giá</div>
            <InputNumber
              style={{ width: '100%' }} min={0}
              value={data.price}
              formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
              parser={v => Number(v!.replace(/\./g, '')) as unknown as 0}
              onChange={val => update('price', val)}
              addonAfter="₫"
            />
          </div>
          <div style={{ width: 110 }}>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Đơn vị</div>
            <Select style={{ width: '100%' }} allowClear placeholder={parentUnit} value={data.unit} onChange={v => update('unit', v || parentUnit)}>
              {['Chiếc', 'Bộ', 'm2', 'm', 'md', 'Cái', 'Kg'].map(u => <Option key={u} value={u}>{u}</Option>)}
            </Select>
          </div>
        </div>
      </div>
    </Modal>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const ItemCategoryManagementPage: React.FC = () => {
  const { user } = useAuth();

  const [rootItems, setRootItems] = useState<ItemCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [expandedVariantIds, setExpandedVariantIds] = useState<Set<string>>(new Set());
  const [searchText, setSearchText] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editRecord, setEditRecord] = useState<ItemCategory | null>(null);
  const [defaultParentId, setDefaultParentId] = useState<string | null>(null);

  // Variant edit modal
  const [variantEditOpen, setVariantEditOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<{ variant: ItemVariant; itemId: string } | null>(null);

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    setRootItems(JSON.parse(JSON.stringify(ITEM_CATEGORIES_MOCK)));
    setExpandedIds(new Set(ITEM_CATEGORIES_MOCK.map(r => r.id)));
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const toggleExpand = (id: string) => setExpandedIds(prev => {
    const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next;
  });

  const toggleVariantExpand = (id: string) => setExpandedVariantIds(prev => {
    const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next;
  });

  const openCreate = () => { setModalMode('create'); setEditRecord(null); setDefaultParentId(null); setModalOpen(true); };
  const openAddChild = (parentId: string) => { setModalMode('create'); setEditRecord(null); setDefaultParentId(parentId); setModalOpen(true); };
  const openEdit = (item: ItemCategory) => { setModalMode('edit'); setEditRecord(item); setDefaultParentId(null); setModalOpen(true); };

  const handleDelete = async (id: string) => {
    setRootItems(prev => {
      const withoutRoot = prev.filter(r => r.id !== id);
      return withoutRoot.map(r => ({ ...r, children: (r.children || []).filter(c => c.id !== id) }));
    });
    antMessage.success('Đã xoá hạng mục');
  };

  const handleDeleteVariant = (itemId: string, variantId: string) => {
    setRootItems(prev => prev.map(r => ({
      ...r,
      children: (r.children || []).map(c =>
        c.id === itemId ? { ...c, variants: (c.variants || []).filter(v => v.id !== variantId) } : c
      ),
    })));
    antMessage.success('Đã xoá biến thể');
  };

  const handleSaveVariant = (itemId: string, updatedVariant: ItemVariant) => {
    setRootItems(prev => prev.map(r => ({
      ...r,
      children: (r.children || []).map(c =>
        c.id === itemId
          ? { ...c, variants: (c.variants || []).map(v => v.id === updatedVariant.id ? updatedVariant : v) }
          : c
      ),
    })));
    setVariantEditOpen(false);
    setEditingVariant(null);
    antMessage.success('Đã cập nhật biến thể');
  };

  const handleSubmit = async (values: FormValues, variants: ItemVariant[]) => {
    const newId = String(++mockIdCounter);

    if (modalMode === 'create') {
      const newItem: ItemCategory = {
        _id: newId, id: newId,
        name: values.name,
        description: (values as any).description,
        unit: values.unit,
        dimensions: (values as any).dimensions,
        price: (values as any).price,
        variants: variants.length > 0 ? variants : undefined,
        parentId: values.parentId || null,
        priority: 0,
        createdAt: new Date().toISOString(),
        children: [],
      };

      setRootItems(prev => {
        if (!values.parentId) return [...prev, { ...newItem, children: [] }];
        return prev.map(r =>
          r.id === values.parentId ? { ...r, children: [...(r.children || []), newItem] } : r
        );
      });
      antMessage.success('Tạo hạng mục thành công');
    } else if (editRecord) {
      setRootItems(prev => prev.map(r => {
        if (r.id === editRecord.id) return { ...r, ...values, variants: variants.length > 0 ? variants : undefined, children: r.children };
        return {
          ...r,
          children: (r.children || []).map(c =>
            c.id === editRecord.id
              ? { ...c, ...values, variants: variants.length > 0 ? variants : undefined }
              : c
          ),
        };
      }));
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
          Quản lý danh mục và hạng mục bên trong. Hỗ trợ nhiều biến thể (loại) cho mỗi hạng mục.
        </div>
        <Space wrap>
          <Input
            placeholder="Tìm kiếm hạng mục..."
            prefix={<SearchOutlined style={{ color: '#d1d5db' }} />}
            value={searchText} onChange={e => setSearchText(e.target.value)}
            allowClear style={{ width: 240 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Thêm danh mục</Button>
        </Space>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <Tag color="gold" style={{ fontSize: 13, padding: '4px 10px' }}>
          <FolderOutlined style={{ marginRight: 4 }} />{rootItems.length} danh mục
        </Tag>
        <Tag color="blue" style={{ fontSize: 13, padding: '4px 10px' }}>
          <FileOutlined style={{ marginRight: 4 }} />{rootItems.reduce((acc, r) => acc + (r.children?.length || 0), 0)} hạng mục
        </Tag>
        <Tag color="purple" style={{ fontSize: 13, padding: '4px 10px' }}>
          <BranchesOutlined style={{ marginRight: 4 }} />{rootItems.reduce((acc, r) => acc + (r.children || []).reduce((a, c) => a + (c.variants?.length || 0), 0), 0)} biến thể
        </Tag>
      </div>

      {/* Table */}
      <Spin spinning={loading} tip="Đang tải...">
        <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', overflowX: 'auto', minHeight: 200 }}>
          <table style={{ width: '100%', minWidth: 900, borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '25%' }} />
              <col style={{ width: 'auto' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: 170 }} />
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
                        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} style={{ background: '#059669' }}>
                          Thêm danh mục đầu tiên
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
                    {/* Dòng cha */}
                    <CategoryRow
                      item={root} depth={0}
                      expanded={isExpanded} hasChildren={children.length > 0}
                      variantsExpanded={false} onToggle={() => toggleExpand(root.id)} onToggleVariants={() => { }}
                      onEdit={openEdit} onDelete={handleDelete} onAddChild={openAddChild}
                    />

                    {/* Dòng con */}
                    {isExpanded && children.map(child => {
                      const childVariantsExpanded = expandedVariantIds.has(child.id);
                      const hasVariants = (child.variants?.length ?? 0) > 0;

                      return (
                        <React.Fragment key={child.id}>
                          <CategoryRow
                            item={child} depth={1}
                            expanded={false} hasChildren={false}
                            variantsExpanded={childVariantsExpanded}
                            onToggle={() => { }} onToggleVariants={() => toggleVariantExpand(child.id)}
                            onEdit={openEdit} onDelete={handleDelete} onAddChild={openAddChild}
                          />
                          {/* Dòng biến thể */}
                          {hasVariants && childVariantsExpanded && (child.variants || []).map(variant => (
                            <VariantRow
                              key={variant.id}
                              variant={variant}
                              parentUnit={child.unit}
                              onEdit={(v) => { setEditingVariant({ variant: v, itemId: child.id }); setVariantEditOpen(true); }}
                              onDelete={(vid) => handleDeleteVariant(child.id, vid)}
                            />
                          ))}
                        </React.Fragment>
                      );
                    })}

                    <tr>
                      <td colSpan={7} style={{ height: 2, background: '#f3f4f6', padding: 0 }} />
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
        initialValues={editRecord ? {
          name: editRecord.name,
          description: editRecord.description,
          unit: editRecord.unit,
          parentId: editRecord.parentId || null,
        } : undefined}
        initialVariants={editRecord?.variants}
        parentOptions={parentOptions}
        defaultParentId={defaultParentId}
        onCancel={() => { setModalOpen(false); setEditRecord(null); }}
        onFinish={handleSubmit}
      />

      {/* Variant Edit Modal */}
      <VariantEditModal
        open={variantEditOpen}
        variant={editingVariant?.variant || null}
        parentUnit={editingVariant ? rootItems.flatMap(r => r.children || []).find(c => c.id === editingVariant.itemId)?.unit : undefined}
        onCancel={() => { setVariantEditOpen(false); setEditingVariant(null); }}
        onSave={(v) => { if (editingVariant) handleSaveVariant(editingVariant.itemId, v); }}
      />
    </div>
  );
};

export default ItemCategoryManagementPage;
