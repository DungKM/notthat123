import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Button, Popconfirm, Space, Tag, message as antMessage, Spin, Tooltip, Upload, Image, Input,
} from 'antd';
import type { UploadFile } from 'antd';
import {
  EditOutlined, DeleteOutlined, PlusOutlined, HolderOutlined, CaretRightOutlined, CaretDownOutlined, UploadOutlined,
} from '@ant-design/icons';
import {
  ModalForm, ProFormText, ProFormTextArea, ProFormSelect, ProFormDependency,
} from '@ant-design/pro-components';

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { useAuth } from '@/src/auth/hooks/useAuth';
import { useApi } from '@/src/hooks/useApi';
import api from '@/src/api/axiosInstance';

// ─── Types ────────────────────────────────────────────────────────────────────
interface CategoryProjectItem {
  id: string;
  _id?: string;
  name: string;
  slug: string;
  parentSlug?: string | null;
  description?: string;
  priority?: number;
  image?: string;
  createdAt?: string;
  children?: CategoryProjectItem[];
}

// ─── Sortable Row ─────────────────────────────────────────────────────────────
const SortableRow: React.FC<{
  item: CategoryProjectItem;
  depth: number;
  expanded: boolean;
  onToggle: () => void;
  hasChildren: boolean;
  onEdit: (item: CategoryProjectItem) => void;
  onDelete: (id: string) => void;
}> = ({ item, depth, expanded, onToggle, hasChildren, onEdit, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={isDragging ? 'dragging-row' : ''}
    >
      {/* Kéo thả handle */}
      <td style={{ width: 36, textAlign: 'center', cursor: 'grab', color: '#bbb' }} {...attributes} {...listeners}>
        <HolderOutlined />
      </td>

      {/* Priority (Thứ tự) */}
      <td style={{ width: 80, textAlign: 'center', color: depth === 0 ? '#ff4d4f' : 'rgba(0, 0, 0, 0.65)', fontWeight: depth === 0 ? 600 : 500, fontSize: 16 }}>
        {item.priority ?? 0}
      </td>

      {/* Tên */}
      <td style={{ paddingLeft: depth * 24 + 12 }}>
        <span
          onClick={onToggle}
          style={{
            cursor: hasChildren ? 'pointer' : 'default',
            marginRight: 6,
            color: '#8c8c8c',
            fontSize: 15,
            display: 'inline-block',
            width: 15,
          }}
        >
          {hasChildren ? (expanded ? <CaretDownOutlined /> : <CaretRightOutlined />) : null}
        </span>
        <span style={{ fontWeight: depth === 0 ? 500 : 400, fontSize: 15, color: 'rgba(0, 0, 0, 0.85)' }}>
          {depth > 0 && <span style={{ color: '#cbd5e1', marginRight: 4 }}>└</span>}
          {item.name}
        </span>
      </td>

      {/* Mô tả */}
      <td style={{ color: 'rgba(0, 0, 0, 0.65)', fontSize: 15, maxWidth: 260 }}>
        <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.description || '—'}
        </span>
      </td>

      {/* Ngày tạo */}
      <td style={{ color: 'rgba(0, 0, 0, 0.65)', fontSize: 15 }}>
        {item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : '—'}
      </td>

      {/* Thao tác */}
      <td style={{ textAlign: 'right', paddingRight: 32 }}>
        <Space>
          <Button type="text" style={{ color: '#1890ff', fontSize: 16 }} icon={<EditOutlined />} onClick={() => onEdit(item)}>Sửa</Button>
          <Popconfirm
            title="Xoá danh mục này?"
            description="Hành động này không thể hoàn tác."
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
            onConfirm={() => onDelete(item.id)}
          >
            <Button type="text" danger style={{ fontSize: 16 }} icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      </td>
    </tr>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const CategoryProjectManagementPage: React.FC = () => {
  const { user } = useAuth();
  const { getAll, create, patch, remove } = useApi<CategoryProjectItem>('/constructions/categories');

  const [rootItems, setRootItems] = useState<CategoryProjectItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const [searchText, setSearchText] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<CategoryProjectItem | null>(null);
  const [imageFile, setImageFile] = useState<UploadFile | null>(null);

  // Scope: đang kéo trong danh mục gốc hay trong children của parent nào
  const [dragScope, setDragScope] = useState<'root' | string>('root');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  // ─── Load ────────────────────────────────────────────────────────────────
  const loadData = useCallback(async (search?: string) => {
    setLoading(true);
    try {
      const params: any = { limit: 200 };
      if (search) params.search = search;
      const list = await getAll(params);
      if (Array.isArray(list)) {
        const mapped = list.map((i: any) => ({
          ...i,
          id: i.id || i._id,
        }));
        setRootItems(mapped);
        // Mở rộng tất cả mặc định
        setExpandedIds(new Set(mapped.map((i: CategoryProjectItem) => i.id)));
      }
    } finally {
      setLoading(false);
    }
  }, [getAll]);

  useEffect(() => { loadData(); }, [loadData]);

  // ─── Toggle expand ───────────────────────────────────────────────────────
  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ─── Drag handlers ───────────────────────────────────────────────────────
  const handleDragStart = (event: DragStartEvent) => {
    const id = event.active.id as string;
    setActiveId(id);

    // Phát hiện xem id này thuộc root hay children của parent nào
    const isRoot = rootItems.some(r => r.id === id);
    if (isRoot) {
      setDragScope('root');
    } else {
      const parent = rootItems.find(r => r.children?.some(c => c.id === id));
      setDragScope(parent?.id ?? 'root');
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over || active.id === over.id) return;

    if (dragScope === 'root') {
      // Sắp xếp lại root
      const oldIndex = rootItems.findIndex(r => r.id === active.id);
      const newIndex = rootItems.findIndex(r => r.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      // Lưu lại priority cũ trước khi move
      const oldPriorityMap = new Map(rootItems.map((r, idx) => [r.id, r.priority ?? idx]));

      const reordered = arrayMove(rootItems, oldIndex, newIndex).map((item, idx) => ({
        ...item,
        priority: idx,
      }));
      setRootItems(reordered);

      // Chỉ patch những item thực sự thay đổi priority
      const changed = reordered.filter(r => oldPriorityMap.get(r.id) !== r.priority);
      if (changed.length > 0) {
        await saveOrder(changed.map(r => ({ id: r.id, priority: r.priority! })));
      }
    } else {
      // Sắp xếp trong children của parent
      const parentId = dragScope;
      let changedChildren: { id: string; priority: number }[] = [];

      const newRoots = rootItems.map(root => {
        if (root.id !== parentId) return root;
        const children = root.children || [];
        const oldIdx = children.findIndex(c => c.id === active.id);
        const newIdx = children.findIndex(c => c.id === over.id);
        if (oldIdx === -1 || newIdx === -1) return root;

        const oldPriorityMap = new Map(children.map((c, i) => [c.id, c.priority ?? i]));

        const reordered = arrayMove(children, oldIdx, newIdx).map((c, i) => ({
          ...c,
          priority: i,
        }));

        changedChildren = reordered
          .filter(c => oldPriorityMap.get(c.id) !== c.priority)
          .map(c => ({ id: c.id, priority: c.priority! }));

        return { ...root, children: reordered };
      });
      setRootItems(newRoots);

      if (changedChildren.length > 0) {
        await saveOrder(changedChildren);
      }
    }
  };

  const saveOrder = async (items: { id: string; priority: number }[]) => {
    setSavingOrder(true);
    try {
      // Dùng axios trực tiếp để tránh useApi.patch tự show toast mỗi lần
      await Promise.all(
        items.map(({ id, priority }) =>
          api.patch(`/constructions/categories/${id}`, { priority })
        )
      );
    } catch {
      antMessage.error('Lỗi khi lưu thứ tự');
    } finally {
      setSavingOrder(false);
    }
  };

  // ─── Delete ──────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    await remove(id);
    loadData();
  };

  // ─── Edit ────────────────────────────────────────────────────────────────
  const handleEdit = (item: CategoryProjectItem) => {
    setEditRecord(item);
    setEditOpen(true);
  };

  // ─── Form fields ─────────────────────────────────────────────────────────
  const renderFormFields = (currentImage?: string) => (
    <>
      <div style={{ padding: '12px 16px', marginBottom: 20, backgroundColor: '#fff2f0', border: '1px solid #ffccc7', borderRadius: 8, color: '#cf1322', fontSize: 13, lineHeight: '1.6' }}>
        <strong style={{ display: 'block', marginBottom: 4, fontSize: 14 }}> Hướng dẫn tạo danh mục công trình:</strong>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>Để tạo <b>Danh mục gốc (cha)</b>: Vui lòng chỉ nhập "TÊN DANH MỤC" và "MÔ TẢ DANH MỤC".</li>
          <li>Để tạo <b>Danh mục con</b>: Vui lòng nhập đầy đủ "TÊN DANH MỤC", "MÔ TẢ DANH MỤC" và chọn "DANH MỤC CHA".</li>
        </ul>
      </div>
      <ProFormText name="name" label="Tên danh mục" rules={[{ required: true, message: 'Nhập tên danh mục' }]} />
      <ProFormSelect
        name="parentSlug"
        label="Danh mục cha"
        tooltip="Chỉ chọn nếu muốn tạo danh mục con"
        request={async () => {
          const list = await getAll({ limit: 100 });
          if (!Array.isArray(list)) return [];
          return list.map(i => ({ label: i.name, value: i.slug }));
        }}
        placeholder="Không chọn (Tạo danh mục gốc)"
        showSearch
      />
      <ProFormTextArea name="description" label="Mô tả danh mục" />

      {/* Ảnh đại diện — chỉ hiện khi chọn danh mục cha (tạo danh mục con) */}
      <ProFormDependency name={['parentSlug']}>
        {({ parentSlug }) => {
          if (!parentSlug) return null;
          return (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Ảnh đại diện cho danh mục</label>
              {currentImage && !imageFile && (
                <div style={{ marginBottom: 8 }}>
                  <Image src={currentImage} width={120} height={80} style={{ objectFit: 'cover', borderRadius: 6, border: '1px solid #d9d9d9' }} />
                  <p style={{ fontSize: 12, color: '#8c8c8c', margin: '4px 0 0' }}>Ảnh hiện tại (chọn ảnh mới để thay thế)</p>
                </div>
              )}
              <Upload
                maxCount={1}
                accept="image/*"
                beforeUpload={(file) => {
                  const previewFile = file as any;
                  previewFile.url = URL.createObjectURL(file);
                  previewFile.status = 'done';
                  setImageFile(previewFile);
                  return false;
                }}
                onRemove={() => setImageFile(null)}
                fileList={imageFile ? [imageFile] : []}
                listType="picture-card"
                showUploadList={{ showPreviewIcon: true, showRemoveIcon: true }}
              >
                {imageFile ? null : (
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8, fontSize: 12 }}>Chọn ảnh</div>
                  </div>
                )}
              </Upload>
            </div>
          );
        }}
      </ProFormDependency>
    </>
  );

  // ─── Flatten to renderable rows ──────────────────────────────────────────
  const activeItem = activeId
    ? rootItems.find(r => r.id === activeId) ||
    rootItems.flatMap(r => r.children || []).find(c => c.id === activeId)
    : null;

  if (!user) return null;

  return (
    <div style={{ padding: '0 0 40px' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>Quản lý danh mục công trình</h2>
          <p style={{ margin: '4px 0 0', color: 'rgba(0, 0, 0, 0.45)', fontSize: 14 }}>
            Kéo thả ☰ để sắp xếp thứ tự hiển thị — thay đổi được lưu tự động
          </p>
        </div>
        <Space style={{ flexWrap: 'wrap' }}>
          <Input.Search
            placeholder="Tìm kiếm danh mục..."
            allowClear
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            onSearch={val => loadData(val)}
            onClear={() => loadData('')}
            style={{ width: 240 }}
          />
          {savingOrder && <Spin size="small" />}
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
            Thêm danh mục
          </Button>
        </Space>
      </div>

      <Spin spinning={loading} tip="Đang tải dữ liệu...">
        <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #f0f0f0', overflowX: 'auto', overflowY: 'hidden', minHeight: 200, WebkitOverflowScrolling: 'touch' }}>
          {/* Table header */}
          <table style={{ width: '100%', minWidth: 900, borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: 36 }} />
              <col style={{ width: 80 }} />
              <col />
              <col style={{ width: '30%' }} />
              <col style={{ width: 120 }} />
              <col style={{ width: 140 }} />
            </colgroup>
            <thead>
              <tr style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                <th style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 500, fontSize: 15, color: 'rgba(0,0,0,0.85)' }}></th>
                <th style={{ padding: '12px 12px', textAlign: 'center', fontWeight: 500, fontSize: 15, color: 'rgba(0,0,0,0.85)' }}>Thứ tự</th>
                <th style={{ padding: '12px 12px', textAlign: 'left', fontWeight: 500, fontSize: 15, color: 'rgba(0,0,0,0.85)' }}>Tên danh mục</th>
                <th style={{ padding: '12px 12px', textAlign: 'left', fontWeight: 500, fontSize: 15, color: 'rgba(0,0,0,0.85)' }}>Mô tả</th>
                <th style={{ padding: '12px 12px', textAlign: 'left', fontWeight: 500, fontSize: 15, color: 'rgba(0,0,0,0.85)' }}>Ngày tạo</th>
                <th style={{ padding: '12px 24px 12px 12px', textAlign: 'right', fontWeight: 500, fontSize: 15, color: 'rgba(0,0,0,0.85)' }}>Thao tác</th>
              </tr>
            </thead>

            {/* Root-level drag context */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={rootItems.map(r => r.id)} strategy={verticalListSortingStrategy}>
                <tbody>
                  {rootItems.map(root => {
                    const isExpanded = expandedIds.has(root.id);
                    const children = root.children || [];

                    return (
                      <React.Fragment key={root.id}>
                        {/* Root row */}
                        <SortableRow
                          item={root}
                          depth={0}
                          expanded={isExpanded}
                          hasChildren={children.length > 0}
                          onToggle={() => toggleExpand(root.id)}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                        />

                        {/* Children rows — nested DndContext */}
                        {isExpanded && children.length > 0 && (
                          <tr>
                            <td colSpan={6} style={{ padding: 0 }}>
                              <table style={{ width: '100%', minWidth: 900, borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                                <colgroup>
                                  <col style={{ width: 36 }} />
                                  <col style={{ width: 80 }} />
                                  <col />
                                  <col style={{ width: '30%' }} />
                                  <col style={{ width: 120 }} />
                                  <col style={{ width: 140 }} />
                                </colgroup>
                                <tbody>
                                  <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragStart={handleDragStart}
                                    onDragEnd={handleDragEnd}
                                  >
                                    <SortableContext items={children.map(c => c.id)} strategy={verticalListSortingStrategy}>
                                      {children.map(child => (
                                        <SortableRow
                                          key={child.id}
                                          item={child}
                                          depth={1}
                                          expanded={false}
                                          hasChildren={false}
                                          onToggle={() => { }}
                                          onEdit={handleEdit}
                                          onDelete={handleDelete}
                                        />
                                      ))}
                                    </SortableContext>
                                  </DndContext>
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        )}

                        {/* Separator */}
                        <tr><td colSpan={6} style={{ height: 1, background: '#f0f0f0' }} /></tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </SortableContext>

              {/* Drag overlay */}
              <DragOverlay>
                {activeItem ? (
                  <table style={{ width: '100%', background: '#ede9fe', borderRadius: 8, opacity: 0.9 }}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '8px 12px', fontWeight: 600, color: '#6366f1' }}>
                          ☰ {activeItem.name}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                ) : null}
              </DragOverlay>
            </DndContext>
          </table>
        </div>
      </Spin>

      {/* Modal Thêm */}
      <ModalForm<Partial<CategoryProjectItem>>
        title="Thêm danh mục công trình"
        open={createOpen}
        modalProps={{ destroyOnClose: true, onCancel: () => { setCreateOpen(false); setImageFile(null); } }}
        onFinish={async (values) => {
          const formData = new FormData();
          formData.append('name', values.name || '');
          if (values.parentSlug) formData.append('parentSlug', values.parentSlug);
          if (values.description) formData.append('description', values.description);
          if (imageFile) formData.append('image', imageFile as any);

          await api.post('/constructions/categories', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          antMessage.success('Tạo danh mục thành công!');
          setCreateOpen(false);
          setImageFile(null);
          loadData();
          return true;
        }}
      >
        {renderFormFields()}
      </ModalForm>

      {/* Modal Sửa */}
      <ModalForm<Partial<CategoryProjectItem>>
        title={`Sửa: ${editRecord?.name ?? ''}`}
        open={editOpen}
        modalProps={{
          destroyOnClose: true,
          onCancel: () => { setEditOpen(false); setEditRecord(null); setImageFile(null); }
        }}
        initialValues={{
          name: editRecord?.name,
          parentSlug: editRecord?.parentSlug,
          description: editRecord?.description,
        }}
        onFinish={async (values) => {
          if (!editRecord) return false;
          const formData = new FormData();
          formData.append('name', values.name || '');
          if (values.parentSlug) formData.append('parentSlug', values.parentSlug);
          if (values.description) formData.append('description', values.description);
          if (imageFile) formData.append('image', imageFile as any);

          await api.patch(`/constructions/categories/${editRecord.id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          antMessage.success('Cập nhật danh mục thành công!');
          setEditOpen(false);
          setEditRecord(null);
          setImageFile(null);
          loadData();
          return true;
        }}
      >
        {renderFormFields(editRecord?.image)}
      </ModalForm>
    </div>
  );
};

export default CategoryProjectManagementPage;
