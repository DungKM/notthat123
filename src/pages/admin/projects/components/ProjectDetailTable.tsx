import React, { useState, useMemo } from "react";
import {
  EditableProTable,
  ProColumns,
  ProTable,
  EditableFormInstance,
} from "@ant-design/pro-components";
import { Button, Space, Typography, message, InputNumber, Input, Modal, Select, Upload, Checkbox, Dropdown, AutoComplete, Form } from "antd";
import {
  DownloadOutlined,
  AppstoreOutlined,
  UploadOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { ProjectDetail, Role, Project } from "@/src/types";
import { formatCurrency } from "@/src/utils/format";
import { exportProjectDetailToExcel } from "@/src/utils/excelExport";
import { useProductionCategoryService } from "@/src/api/services";

const { Text } = Typography;

const numberToRoman = (num: number): string => {
  const map: Record<string, number> = { M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1 };
  let result = '';
  for (const key in map) {
    while (num >= map[key]) {
      result += key;
      num -= map[key];
    }
  }
  return result;
};


// ─── Modal Chọn Danh Mục Gốc ────────────────────────────────────────────────
const SelectCategoryModal: React.FC<{
  open: boolean;
  onCancel: () => void;
  onSelect: (category: any) => void;
}> = ({ open, onCancel, onSelect }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rootCategories, setRootCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const svc = useProductionCategoryService();

  React.useEffect(() => {
    if (open && rootCategories.length === 0) {
      const fetchCategories = async () => {
        setLoading(true);
        try {
          const res = await svc.request<any>('GET', '/hierarchy');
          const data = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
          const roots = data.filter((c: any) => c.type === 'category' || !c.parentId);
          setRootCategories(roots);
        } catch (e) {
          message.error("Lỗi lấy danh sách danh mục");
        } finally {
          setLoading(false);
        }
      };
      fetchCategories();
    }
  }, [open, rootCategories.length, svc]);

  const handleOk = () => {
    // Hỗ trợ cả id (frontend) và _id (MongoDB ObjectId từ server)
    const selectedItem = rootCategories.find(c => (c.id || c._id) === selectedId);
    if (!selectedItem) {
      message.warning("Vui lòng chọn một danh mục");
      return;
    }
    onSelect(selectedItem);
    setSelectedId(null);
  };

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <AppstoreOutlined style={{ color: "#10b981" }} />
          <span>Chọn danh mục nội thất</span>
        </div>
      }
      open={open}
      onCancel={() => { setSelectedId(null); onCancel(); }}
      onOk={handleOk}
      okText="Thêm danh mục"
      cancelText="Hủy"
    >
      <div style={{ marginTop: 12, marginBottom: 24 }}>
        <div style={{ marginBottom: 4, fontSize: 12, color: '#6b7280' }}>
          Danh mục cha <span style={{ color: '#ef4444' }}>*</span>
        </div>
        <Select
          style={{ width: "100%" }}
          placeholder="VD: Nội thất phòng ngủ, Nội thất bếp..."
          showSearch
          allowClear
          value={selectedId}
          onChange={setSelectedId}
          loading={loading}
          filterOption={(input, option) =>
            String(option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
          options={rootCategories.map(c => ({ value: c._id || c.id, label: c.name }))}
          size="large"
        />
      </div>
    </Modal>
  );
};


// ─── AutoComplete Component Cho Tên Hạng Mục ────────────────────────────────
const CategoryItemAutoComplete: React.FC<{
  record: any;
  form: any;
  config: any;
  value?: string;
  onChange?: (val: string) => void;
}> = ({ record, form, config, value, onChange }) => {
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const svc = useProductionCategoryService();

  const fetchItems = async () => {
    if (fetched || loading) return;

    // Lấy parentId từ group hiện tại
    const parentId = record?.parentCategoryId || record?.categoryId;
    if (!parentId) return;

    setLoading(true);
    try {
      const res = await svc.request<any>('GET', `?parentId=${parentId}&type=item&page=1&limit=50`);
      const items = res?.data || [];

      const newOptions: any[] = [];
      items.forEach((item: any) => {
        const hasChildren = item.children && item.children.length > 0;
        
        if (hasChildren) {
          const childOptions = item.children.map((child: any) => ({
            label: <span>{child.name}</span>,
            value: child.name, // Khi chọn, giá trị text sẽ là tên của biến thể
            rawData: child,
            searchStr: `${child.name} ${(item.name || '')}`.toLowerCase()
          }));
          newOptions.push({
            label: <span style={{ fontWeight: 'bold', color: '#888' }}>{item.name}</span>,
            options: childOptions
          });
        } else {
          newOptions.push({
            label: <span style={{ fontWeight: 500 }}>{item.name}</span>,
            value: item.name,
            rawData: item,
            searchStr: (item.name || "").toLowerCase()
          });
        }
      });
      setOptions(newOptions);
      setFetched(true);
    } catch (error) {
      console.error("Failed to fetch category items", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AutoComplete
      allowClear
      value={value !== undefined ? value : config?.value}
      onChange={(val) => {
        if (onChange) onChange(val);
        if (config?.onChange) config.onChange(val);
        if (form) {
          if (config?.isFlatForm) {
            form.setFieldValue('name', val);
          } else if (config?.recordKey) {
            form.setFieldValue([config.recordKey, 'name'], val);
          }
        }
      }}
      options={options}
      placeholder="Nhập tên hạng mục..."
      onFocus={fetchItems}
      onClick={fetchItems}
      filterOption={(inputValue, option) => {
        const currentValue = value !== undefined ? value : config?.value;
        // Nếu người dùng vừa click vào (chữ đang bằng đúng value đã chọn), hiển thị toàn bộ list
        if (inputValue === currentValue) return true;
        
        return (option?.searchStr || "").includes(inputValue.toLowerCase());
      }}
      onSelect={(val, option: any) => {
        // Đảm bảo value name được update
        if (onChange) onChange(val);
        if (config?.onChange) config.onChange(val);

        const itemData = option?.rawData;
        if (itemData && form) {
          if (config?.isFlatForm) {
            form.setFieldsValue({
              name: val,
              ...(itemData.size !== undefined && { size: itemData.size }),
              ...(itemData.material !== undefined && { material: itemData.material }),
              ...(itemData.origin !== undefined && { origin: itemData.origin }),
              ...(itemData.unit !== undefined && { unit: itemData.unit }),
              ...(itemData.price !== undefined && { price: itemData.price }),
              ...(itemData.costPrice !== undefined && { costPrice: itemData.costPrice }),
            });
          } else if (config?.recordKey) {
            form.setFieldValue([config.recordKey, 'name'], val);
            if (itemData.size !== undefined) form.setFieldValue([config.recordKey, 'size'], itemData.size);
            if (itemData.material !== undefined) form.setFieldValue([config.recordKey, 'material'], itemData.material);
            if (itemData.origin !== undefined) form.setFieldValue([config.recordKey, 'origin'], itemData.origin);
            if (itemData.unit !== undefined) form.setFieldValue([config.recordKey, 'unit'], itemData.unit);
            if (itemData.price !== undefined) form.setFieldValue([config.recordKey, 'price'], itemData.price);
            if (itemData.costPrice !== undefined) form.setFieldValue([config.recordKey, 'costPrice'], itemData.costPrice);
          }
        }
      }}
    />
  );
};


// ─── Component hiển thị Thành tiền trực tiếp khi đang Edit ────────────────────
const AmountDisplay: React.FC<{ recordKey: React.Key, form: any }> = ({ recordKey, form }) => {
  const quantity = Form.useWatch([recordKey, 'quantity'], form);
  const price = Form.useWatch([recordKey, 'price'], form);
  const total = (quantity || 0) * (price || 0);
  return <span>{formatCurrency(total)}</span>;
};


// ─── Main Table Component ─────────────────────────────────────────────────────
interface ProjectDetailTableProps {
  projectId: string;
  project?: Project; // Bổ sung thông tin project để lấy Tên chủ đầu tư, địa chỉ
  details: ProjectDetail[];
  onUpdate: (details: ProjectDetail[], saveToServer?: boolean, singleRowData?: ProjectDetail, action?: 'save' | 'delete') => Promise<boolean> | void;
  role: Role;
  nameColumnTitle?: string;
}
const ProjectDetailTable: React.FC<ProjectDetailTableProps> = ({
  projectId,
  project,
  details,
  onUpdate,
  role,
  nameColumnTitle,
}) => {
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
  const [manualTotal, setManualTotal] = useState<number | null>(null);
  const [manualProfit, setManualProfit] = useState<number | null>(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ProjectDetail | null>(null);
  const [editForm] = Form.useForm();
  const editableFormRef = React.useRef<EditableFormInstance>(null);

  const isAdmin = role === Role.DIRECTOR || role === Role.ACCOUNTANT;

  // Compute STT mappings
  const indexMapping = React.useMemo(() => {
    let groupIndex = 0;
    let itemIndex = 0;
    const mapping: Record<string, string> = {};
    details.forEach((row) => {
      if (row.type === 'group') {
        groupIndex++;
        itemIndex = 0; // reset
        mapping[row.id!] = numberToRoman(groupIndex);
      } else {
        itemIndex++;
        mapping[row.id!] = itemIndex.toString();
      }
    });
    return mapping;
  }, [details]);


  const columns: ProColumns<ProjectDetail>[] = [
    {
      title: "STT",
      dataIndex: "stt",
      width: 50,
      align: "center",
      editable: false,
      render: (_, record) => <strong>{indexMapping[record.id!]}</strong>,
    },
    {
      title: "Bộ phận thương mại",
      dataIndex: "isExternalPurchase",
      align: "center",
      width: 80,
      render: (_, record) => record.rowType === 'group' ? null : (
        <Checkbox
          checked={record.type === 'external'}
          onChange={(e) => {
            const checked = e.target.checked;
            const newType = checked ? 'external' : 'company';
            const updatedRow = { ...record, type: newType };
            const newData = details.map(d => d.id === record.id ? updatedRow : d);
            onUpdate(newData, true, updatedRow, 'save');
          }}
        />
      ),
      renderFormItem: (_, config: any, form: any) => {
        if (!config.recordKey || !form) return null;
        const currentType = form.getFieldValue([config.recordKey, 'type']);
        return (
          <Checkbox
            checked={currentType === 'external'}
            onChange={(e) => {
              const checked = e.target.checked;
              form.setFieldValue([config.recordKey, 'type'], checked ? 'external' : 'company');
            }}
          />
        );
      },
    },
    {
      title: "SP Thương mại",
      dataIndex: "isCommercialProduct",
      align: "center",
      width: 100,
      render: (_, record) => record.rowType === 'group' ? null : (
        <Checkbox
          checked={record.type === 'commercial'}
          onChange={(e) => {
            const checked = e.target.checked;
            const newType = checked ? 'commercial' : 'company';
            const updatedRow = { ...record, type: newType };
            const newData = details.map(d => d.id === record.id ? updatedRow : d);
            onUpdate(newData, true, updatedRow, 'save');
          }}
        />
      ),
      renderFormItem: (_, config: any, form: any) => {
        if (!config.recordKey || !form) return null;
        const currentType = form.getFieldValue([config.recordKey, 'type']);
        return (
          <Checkbox
            checked={currentType === 'commercial'}
            onChange={(e) => {
              const checked = e.target.checked;
              form.setFieldValue([config.recordKey, 'type'], checked ? 'commercial' : 'company');
            }}
          />
        );
      },
    },
    {
      title: "SP Công ty",
      dataIndex: "isCompanyProduct",
      align: "center",
      width: 100,
      render: (_, record) => record.rowType === 'group' ? null : (
        <Checkbox
          checked={record.type === 'company' || (!record.type)} // Default is company
          onChange={(e) => {
            const checked = e.target.checked;
            const newType = checked ? 'company' : 'external'; // fallback if unmarked
            const updatedRow = { ...record, type: newType };
            const newData = details.map(d => d.id === record.id ? updatedRow : d);
            onUpdate(newData, true, updatedRow, 'save');
          }}
        />
      ),
      renderFormItem: (_, config: any, form: any) => {
        if (!config.recordKey || !form) return null;
        const currentType = form.getFieldValue([config.recordKey, 'type']);
        return (
          <Checkbox
            checked={currentType === 'company' || (!currentType)}
            onChange={(e) => {
              const checked = e.target.checked;
              form.setFieldValue([config.recordKey, 'type'], checked ? 'company' : 'external');
            }}
          />
        );
      },
    },
    {
      title: nameColumnTitle || "Hạng mục",
      dataIndex: "name",
      width: "25%",
      renderFormItem: (_, config: any, form: any) => {
        // Nhóm header (group) không cho sửa tên trực tiếp
        if (config.record?.rowType === 'group') return <Input disabled style={{ fontWeight: 'bold' }} />;
        // Hạng mục thường/biến thể → fetch từ API qua AutoComplete
        return <CategoryItemAutoComplete record={config.record} form={form} config={config} />;
      },
      render: (_, record) => {
        if (record.rowType === 'group') {
          return <span style={{ textTransform: 'uppercase' }}>{record.name}</span>;
        }
        return <span>{record.name}</span>;
      }
    },
    {
      title: "Kích thước (DxRxC mm)",
      dataIndex: "size",
      width: 150,
      render: (_, record) => record.rowType === 'group' ? null : <span>{record.size}</span>,
      editable: (_, record) => record.rowType !== 'group',
    },
    {
      title: "Chất liệu",
      dataIndex: "material",
      render: (_, record) => record.rowType === 'group' ? null : <span>{record.material}</span>,
      editable: (_, record) => record.rowType !== 'group',
    },
    {
      title: "Sản xuất",
      dataIndex: "origin",
      render: (_, record) => record.rowType === 'group' ? null : <span>{record.origin}</span>,
      editable: (_, record) => record.rowType !== 'group',
    },
    {
      title: "Đơn vị",
      dataIndex: "unit",
      width: 80,
      align: "center",
      render: (_, record) => record.rowType === 'group' ? null : <span>{record.unit}</span>,
      editable: (_, record) => record.rowType !== 'group',
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      valueType: "digit",
      width: 80,
      align: "center",
      render: (_, record) => record.rowType === 'group' ? null : <span>{record.quantity}</span>,
      editable: (_, record) => record.rowType !== 'group',
    },
    {
      title: "Đơn giá (VND)",
      dataIndex: "price",
      valueType: "digit",
      align: "right",
      render: (_, record) => record.rowType === 'group' ? null : <span>{formatCurrency(record.price)}</span>,
      editable: (_, record) => record.rowType !== 'group',
      fieldProps: {
        formatter: (value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ","),
        parser: (value: any) => value.replace(/\$\s?|(,*)/g, ""),
      },
    },
    {
      title: "Thành tiền (VND)",
      dataIndex: "amount",
      valueType: "digit",
      align: "right",
      editable: (_, record) => record.rowType !== 'group',
      renderFormItem: (_, config, form) => {
        if (!config.recordKey || !form) return null;
        return <AmountDisplay recordKey={config.recordKey} form={form} />;
      },
      render: (_, record) => {
        if (record.rowType === 'group') {
          let subtotal = 0;
          let foundGroup = false;
          for (const d of details) {
            if (d.id === record.id) foundGroup = true;
            else if (foundGroup && d.rowType === 'group') break;
            else if (foundGroup && d.rowType === 'item') subtotal += (d.quantity * d.price || 0);
          }
          return <strong>{formatCurrency(subtotal)}</strong>;
        }
        return <span>{formatCurrency(record.quantity * record.price)}</span>;
      },
      fieldProps: {
        formatter: (value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ","),
        parser: (value: any) => value.replace(/\$\s?|(,*)/g, ""),
      },
    },
    {
      title: "Giá vốn",
      dataIndex: "costPrice",
      valueType: "digit",
      align: "right",
      hideInTable: !isAdmin,
      hideInForm: !isAdmin,
      render: (_, record) => record.rowType === 'group' ? null : <span>{formatCurrency(record.costPrice || 0)}</span>,
      editable: (_, record) => record.rowType !== 'group',
      fieldProps: {
        formatter: (value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ","),
        parser: (value: any) => value.replace(/\$\s?|(,*)/g, ""),
      },
    },
    {
      title: "Thao tác",
      valueType: "option",
      width: 140,
      hideInTable: !isAdmin,
      render: (text, record, _, action) => {
        if (record.rowType === 'group') {
          return (
            <Space>
              <Button type="link" size="small" icon={<PlusOutlined />} onClick={() => handleAddItemToGroup(record.id!)} title="Thêm dòng" />
              <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => {
                let toDelete = [record.id];
                let foundGroup = false;
                for (const d of details) {
                  if (d.id === record.id) foundGroup = true;
                  else if (foundGroup && d.rowType === 'group') break;
                  else if (foundGroup && d.rowType === 'item') toDelete.push(d.id);
                }
                const newDetails = details.filter(d => !toDelete?.includes(d.id));
                onUpdate(newDetails, true, record, 'delete');
                message.success("Đã xóa danh mục");
              }} title="Xóa" />
            </Space>
          );
        }
        return (
          <Space>
            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => {
              setEditingRecord(record);
              editForm.setFieldsValue(record);
              setEditModalOpen(true);
            }} title="Sửa" />
            <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => {
              onUpdate(details.filter((item) => item.id !== record.id), true, record, 'delete');
              message.success("Đã xóa dòng");
            }} title="Xóa" />
          </Space>
        );
      },
    },
  ];

  // Logic tổng kết
  // Using direct variables from backend `project` response instead of recalculating
  const summaryData = useMemo(() => {
    let computedAmount = 0;
    let computedCost = 0;

    details.forEach(item => {
      if (item.rowType !== 'group') {
        const qty = item.quantity || 0;
        const price = item.price || 0;
        const costPrice = item.costPrice || 0;

        computedAmount += qty * price;
        computedCost += costPrice; // Giá vốn người dùng nhập là TỔNG giá vốn, không nhân với số lượng nữa
      }
    });

    const profit = computedAmount - computedCost;

    return {
      totalCompanyProduct: project?.companyProductsTotal || 0,
      totalCommercialProduct: project?.commercialProductsTotal || 0,
      totalExternalPurchase: project?.externalProductsTotal || 0,
      totalAmount: computedAmount,
      profit
    };
  }, [details, project]);

  // Khi chọn danh mục từ modal → gọi API trước, chỉ toast khi thành công
  const handleCategorySelect = async (category: any) => {
    const newId = (Math.random() * 1000000).toFixed(0);
    // Ưu tiên _id từ MongoDB, fallback về id (local/static data)
    const realCategoryId = (category as any)._id || category.id;
    const newRow: ProjectDetail = {
      id: newId,
      projectId,
      rowType: 'group',
      categoryId: realCategoryId,
      name: category.name,
      material: "",
      size: "",
      unit: "",
      quantity: 1,
      price: 0,
      amount: 0,
      costPrice: 0,
      type: 'company',
      note: "",
    };
    setCategoryModalOpen(false);
    // ✅ Đợi API xong mới hiện toast — nếu fail, handleUpdateDetails sẽ hiện error
    const success = await onUpdate([...details, newRow], true, newRow, 'save');
    if (success) {
      message.success(`Đã thêm danh mục "${category.name}"`);
    }
  };

  const handleAddItemToGroup = (groupId: string) => {
    const groupIndex = details.findIndex(d => d.id === groupId);
    if (groupIndex === -1) return;

    const parentCategory = details[groupIndex];
    let insertIndex = groupIndex + 1;
    while (insertIndex < details.length && details[insertIndex].rowType === 'item') {
      insertIndex++;
    }

    const newId = (Math.random() * 1000000).toFixed(0);
    const newRow: ProjectDetail = {
      id: newId,
      projectId,
      rowType: 'item',
      // ✅ Lưu categoryId của group cha để khi POST lên server biết nhóm vào đâu
      categoryId: parentCategory.categoryId,
      parentCategoryId: parentCategory.categoryId,
      name: "",
      material: "",
      size: "",
      unit: "Chiếc",
      quantity: 1,
      price: 0,
      amount: 0,
      costPrice: 0,
      type: 'company',
      note: "",
    };

    const newDetails = [...details];
    newDetails.splice(insertIndex, 0, newRow);
    onUpdate(newDetails, false);
    setEditableRowKeys([...editableKeys, newId]);
  };

  const handleExportExcel = async () => {
    try {
      await exportProjectDetailToExcel(project, projectId, details, indexMapping);
      message.success("Xuất file Excel thành công");
    } catch (error) {
      console.error("Export error:", error);
      message.error("Có lỗi khi xuất file Excel");
    }
  };

  return (
    <div className="project-detail-table">
      <Space style={{ marginBottom: 16 }} wrap>
        {isAdmin && (
          <>
            {/* Nút chọn từ danh sách hạng mục */}
            <Button
              type="primary"
              icon={<AppstoreOutlined />}
              onClick={() => setCategoryModalOpen(true)}
            >
              Chọn danh mục
            </Button>
            {/* Nút Import Excel */}
            {/* <Upload showUploadList={false} beforeUpload={() => { message.info('Tính năng Import Excel đang được phát triển'); return false; }}>
              <Button icon={<UploadOutlined />}>
                Import Excel
              </Button>
            </Upload> */}
          </>
        )}
        <Button type="default" icon={<DownloadOutlined />} onClick={handleExportExcel}>
          Xuất Excel
        </Button>
      </Space>

      <EditableProTable<ProjectDetail>
        rowKey="id"
        editableFormRef={editableFormRef}
        headerTitle="Danh sách chi tiết vật tư"
        maxLength={100}
        recordCreatorProps={false}
        columns={columns}
        onRow={(record) => ({
          style: record.rowType === 'group' ? { backgroundColor: '#d9d2a6', fontWeight: 'bold' } : {}
        })}
        value={details}
        onChange={(newDetails) => onUpdate(newDetails as ProjectDetail[], false)}
        editable={{
          type: "multiple",
          editableKeys,
          deletePopconfirmMessage: "Bạn có chắc chắn muốn xóa mục này?",
          onChange: setEditableRowKeys,
          onSave: async (rowKey, data) => {
            // Lấy lại dòng hiện tại để không bị mất cắc thuộc tính ẩn (type, categoryId, parentCategoryId...)
            const currentRow = details.find(d => d.id === rowKey) || {};
            // Tự động tính amount khi lưu
            const newData = { ...currentRow, ...data, amount: (data.quantity || 0) * (data.price || 0) };
            const updatedDetails = details.map((item) =>
              item.id === rowKey ? newData : item,
            );
            onUpdate(updatedDetails, true, newData, 'save');
          },
          onDelete: async (rowKey, row) => {
            const updatedDetails = details.filter((item) => item.id !== rowKey);
            const deletedRow = details.find((item) => item.id === rowKey) || (row as ProjectDetail);
            onUpdate(updatedDetails, true, deletedRow, 'delete');
          },
          actionRender: (row, config, defaultDoms) => {
            return [defaultDoms.save, defaultDoms.delete, defaultDoms.cancel];
          },
        }}
        summary={() => (
          <ProTable.Summary fixed>
            <ProTable.Summary.Row style={{ backgroundColor: "#fafafa", fontWeight: "bold" }}>
              <ProTable.Summary.Cell index={0} colSpan={isAdmin ? 14 : 12}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingRight: 24 }}>
                  <Text style={{ fontSize: 16 }}>Tổng tiền SP công ty:</Text>
                  <Text strong style={{ fontSize: 16, color: '#1677ff' }}>{formatCurrency(summaryData.totalCompanyProduct)}</Text>
                </div>
              </ProTable.Summary.Cell>
            </ProTable.Summary.Row>


            <ProTable.Summary.Row style={{ backgroundColor: "#fafafa", fontWeight: "bold" }}>
              <ProTable.Summary.Cell index={0} colSpan={isAdmin ? 14 : 12}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingRight: 24 }}>
                  <Text style={{ fontSize: 16 }}>Tổng tiền SP thương mại:</Text>
                  <Text strong style={{ fontSize: 16, color: '#eb2f96' }}>{formatCurrency(summaryData.totalCommercialProduct)}</Text>
                </div>
              </ProTable.Summary.Cell>
            </ProTable.Summary.Row>

            <ProTable.Summary.Row style={{ backgroundColor: "#fafafa", fontWeight: "bold" }}>
              <ProTable.Summary.Cell index={0} colSpan={isAdmin ? 14 : 12}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingRight: 24 }}>
                  <Text style={{ fontSize: 16 }}>Tổng tiền bộ phận thương mại:</Text>
                  <Text strong style={{ fontSize: 16, color: '#fa8c16' }}>{formatCurrency(summaryData.totalExternalPurchase)}</Text>
                </div>
              </ProTable.Summary.Cell>
            </ProTable.Summary.Row>

            <ProTable.Summary.Row style={{ backgroundColor: "#ffff00", fontWeight: "bold" }}>
              <ProTable.Summary.Cell index={0} colSpan={isAdmin ? 14 : 12}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingRight: 24 }}>
                  <Text style={{ fontSize: 16, color: '#000' }}>TỔNG GIÁ CHƯA VAT (VNĐ):</Text>
                  <Text strong style={{ fontSize: 16, color: '#000' }}>
                    {formatCurrency(summaryData.totalAmount)}
                  </Text>
                </div>
              </ProTable.Summary.Cell>
            </ProTable.Summary.Row>

            {isAdmin && (
              <ProTable.Summary.Row style={{ backgroundColor: "#e6f7ff", fontWeight: "bold" }}>
                <ProTable.Summary.Cell index={0} colSpan={14}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingRight: 24 }}>
                    <Text style={{ fontSize: 16, color: '#096dd9' }}>LỢI NHUẬN (VNĐ):</Text>
                    <Text strong style={{ fontSize: 16, color: '#096dd9' }}>
                      {formatCurrency(summaryData.profit)}
                    </Text>
                  </div>
                </ProTable.Summary.Cell>
              </ProTable.Summary.Row>
            )}
          </ProTable.Summary>
        )}
      />
      <style>{`
        .project-detail-table .ant-pro-table-list-toolbar {
          display: none;
        }
        .project-detail-table .ant-btn-primary {
          box-shadow: none;
        }
        
        /* Căn phải cho số */
        .align-right-input .ant-input-number-input {
          text-align: right !important;
        }

        /* CSS tạo viền cho ô Input để nhận biết có thể nhập */
        .editable-summary-input {
          border-bottom: 1px dashed #d9d9d9 !important; /* Viền gạch đứt mờ ở dưới */
          border-radius: 0 !important;
          transition: all 0.3s;
          padding-right: 4px;
        }
        
        /* Hiệu ứng khi di chuột hoặc đang click vào để gõ */
        .editable-summary-input:hover,
        .editable-summary-input.ant-input-number-focused {
          border-bottom: 1px solid #1677ff !important; /* Viền xanh đậm hơn khi focus */
          background-color: #f0f5ff; /* Đổi màu nền nhẹ cho dễ nhìn */
        }
      `}</style>

      {/* Modal chọn hạng mục */}
      <SelectCategoryModal
        open={categoryModalOpen}
        onCancel={() => setCategoryModalOpen(false)}
        onSelect={handleCategorySelect}
      />
      {/* Edit Modal */}
      <Modal
        title="Chỉnh sửa chi tiết"
        open={editModalOpen}
        onCancel={() => {
          setEditModalOpen(false);
          setEditingRecord(null);
          editForm.resetFields();
        }}
        onOk={async () => {
          try {
            const values = await editForm.validateFields();
            if (editingRecord) {
              const updatedRow = {
                ...editingRecord,
                ...values,
                amount: (values.quantity || 0) * (values.price || 0)
              };
              const newDetails = details.map(d => d.id === editingRecord.id ? updatedRow : d);
              await onUpdate(newDetails, true, updatedRow, 'save');
              message.success("Cập nhật thành công");
              setEditModalOpen(false);
              setEditingRecord(null);
            }
          } catch (e) {
            console.error(e);
          }
        }}
        okText="Lưu"
        cancelText="Hủy"
        width={600}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item name="name" label="Hạng mục" rules={[{ required: true, message: 'Vui lòng nhập hạng mục' }]}>
            <CategoryItemAutoComplete 
               record={editingRecord} 
               form={editForm} 
               config={{ isFlatForm: true }} 
               value={editForm.getFieldValue('name')} 
               onChange={(val) => editForm.setFieldValue('name', val)} 
            />
          </Form.Item>
          <Space style={{ display: 'flex', width: '100%', gap: 12 }} size="small" align="start">
            <Form.Item name="size" label="Kích thước (DxRxC mm)" style={{ flex: 2 }}>
              <Input />
            </Form.Item>
            <Form.Item name="material" label="Chất liệu" style={{ flex: 2 }}>
              <Input />
            </Form.Item>
            <Form.Item name="origin" label="Sản xuất" style={{ flex: 2 }}>
              <Input />
            </Form.Item>
            <Form.Item name="unit" label="Đơn vị" style={{ flex: 1 }}>
              <Input />
            </Form.Item>
          </Space>
          <Space style={{ display: 'flex' }} size="large">
            <Form.Item name="quantity" label="Số lượng">
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
            <Form.Item name="price" label="Đơn giá (VND)">
              <InputNumber
                style={{ width: '100%' }}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value: any) => value.replace(/\$\s?|(,*)/g, '')}
              />
            </Form.Item>
            {isAdmin && (
              <Form.Item name="costPrice" label="Giá vốn">
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value: any) => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            )}
          </Space>
        </Form>
      </Modal>
    </div>
  );
};

export default ProjectDetailTable;
