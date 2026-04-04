import React, { useState, useMemo } from "react";
import {
  EditableProTable,
  ProColumns,
  ProTable,
  EditableFormInstance,
} from "@ant-design/pro-components";
import { Button, Space, Typography, message, InputNumber, Input, Modal, Select, Tag, Upload } from "antd";
import {
  PlusOutlined,
  DownloadOutlined,
  AppstoreOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { ProjectDetail, Role } from "@/src/types";
import { formatCurrency } from "@/src/utils/format";
import { getRootCategories, getAllChildCategories, getMinPrice } from "@/src/data/itemCategories";
import type { ItemCategory, ItemVariant } from "@/src/data/itemCategories";
import * as XLSX from "xlsx";
import { Dropdown } from "antd";

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

// ─── Component AutoComplete chọn Hạng Mục ────────────────────────────────────
const ItemNameAutoComplete: React.FC<{
  value?: string;
  onChange?: (val: string) => void;
  parentCategoryId?: string;
  onAutofill?: (item: ItemCategory, variant?: ItemVariant) => void;
  allChildren: ItemCategory[];
}> = ({ value, onChange, parentCategoryId, onAutofill, allChildren }) => {
  const [open, setOpen] = useState(false);

  const availableItems = React.useMemo(() =>
    allChildren.filter(c => c.parentId === parentCategoryId),
    [allChildren, parentCategoryId]);

  const filteredItems = React.useMemo(() => {
    const valStr = (value || '').toLowerCase();
    const isExactMatch = availableItems.some(i => i.name.toLowerCase() === valStr);
    if (isExactMatch || !valStr) return availableItems;

    return availableItems.filter(item =>
      item.name.toLowerCase().includes(valStr) ||
      item.variants?.some(v => v.label.toLowerCase().includes(valStr))
    );
  }, [availableItems, value]);

  const menuItems = React.useMemo(() => {
    return filteredItems.map(item => {
      // Dùng children để tạo SubMenu cho biến thể
      if (item.variants && item.variants.length > 0) {
        return {
          key: item.id,
          label: item.name,
          children: item.variants.map((v, idx) => ({
            key: `${item.id}_${idx}`,
            label: v.label,
            onClick: () => {
              onChange?.(item.name);
              onAutofill?.(item, v);
              setOpen(false);
            }
          }))
        };
      }
      return {
        key: item.id,
        label: item.name,
        onClick: () => {
          onChange?.(item.name);
          onAutofill?.(item);
          setOpen(false);
        }
      };
    });
  }, [filteredItems, onChange, onAutofill]);

  return (
    <Dropdown
      menu={{ items: menuItems.length > 0 ? menuItems : [{ key: 'empty', label: <span style={{ color: '#aaa', fontStyle: 'italic' }}>Không có dữ liệu</span>, disabled: true }] }}
      open={open}
      onOpenChange={setOpen}
      trigger={['click']}
    >
      <Input
        value={value}
        onChange={(e) => {
          onChange?.(e.target.value);
          if (!open) setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Nhập tên hạng mục..."
      />
    </Dropdown>
  );
};

// ─── Modal Chọn Danh Mục Gốc ────────────────────────────────────────────────
const SelectCategoryModal: React.FC<{
  open: boolean;
  onCancel: () => void;
  onSelect: (category: ItemCategory) => void;
}> = ({ open, onCancel, onSelect }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const rootCategories = getRootCategories();

  const handleOk = () => {
    const selectedItem = rootCategories.find(c => c.id === selectedId);
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
          filterOption={(input, option) =>
            String(option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
          options={rootCategories.map(c => ({ value: c.id, label: c.name }))}
          size="large"
        />
      </div>
    </Modal>
  );
};


// ─── Main Table Component ─────────────────────────────────────────────────────
interface ProjectDetailTableProps {
  projectId: string;
  details: ProjectDetail[];
  onUpdate: (details: ProjectDetail[], saveToServer?: boolean, singleRowData?: ProjectDetail, action?: 'save' | 'delete') => void;
  role: Role;
  nameColumnTitle?: string;
}
const ProjectDetailTable: React.FC<ProjectDetailTableProps> = ({
  projectId,
  details,
  onUpdate,
  role,
  nameColumnTitle,
}) => {
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
  const [manualTotal, setManualTotal] = useState<number | null>(null);
  const [manualProfit, setManualProfit] = useState<number | null>(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const editableFormRef = React.useRef<EditableFormInstance>(null);

  const isAdmin = role === Role.DIRECTOR || role === Role.ACCOUNTANT;
  const allChildren = React.useMemo(() => getAllChildCategories(), []);

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

  const handleAutofill = (rowKey: React.Key, category: ItemCategory, variant?: ItemVariant) => {
    const resolvedDesc = variant?.description || category.description || "";
    const resolvedUnit = variant?.unit || category.unit || "Chiếc";
    const resolvedPrice = variant?.price ?? category.price ?? 0;
    const resolvedDim = variant?.dimensions || category.dimensions || "";
    const displayName = category.name;

    // Cập nhật giá trị trực tiếp cho Form đang edit của ProTable
    editableFormRef.current?.setRowData?.(rowKey as string | number, {
      material: resolvedDesc,
      unit: resolvedUnit,
      price: resolvedPrice,
      dimensions: resolvedDim,
    });

    const currentRow = details.find(d => d.id === rowKey);
    if (!currentRow) return;

    const newData: ProjectDetail = {
      ...currentRow,
      name: displayName,
      material: resolvedDesc,
      unit: resolvedUnit,
      dimensions: resolvedDim,
      price: resolvedPrice,
      amount: resolvedPrice * (currentRow.quantity || 1),
    };
    onUpdate(details.map(d => d.id === rowKey ? newData : d), false);
  };

  const columns: ProColumns<ProjectDetail>[] = [
    {
      title: "STT",
      dataIndex: "stt",
      width: 60,
      editable: false,
      render: (_, record) => <strong>{indexMapping[record.id!]}</strong>,
    },
    {
      title: nameColumnTitle || "Tên dự án",
      dataIndex: "name",
      width: "25%",
      renderFormItem: (_, { record }) => {
        if (record?.type === 'group') return <Input disabled style={{ fontWeight: 'bold' }} />;
        return <ItemNameAutoComplete
          parentCategoryId={record?.parentCategoryId}
          allChildren={allChildren}
          onAutofill={(cat, v) => handleAutofill(record!.id!, cat, v)}
        />;
      },
      render: (_, record) => {
        if (record.type === 'group') {
          return <strong style={{ color: '#ce7c10', textTransform: 'uppercase' }}>{record.name}</strong>;
        }
        return <span>{record.name}</span>;
      }
    },
    {
      title: "Chất liệu",
      dataIndex: "material",
      render: (_, record) => record.type === 'group' ? null : <span>{record.material}</span>,
      editable: (_, record) => record.type !== 'group',
    },
    {
      title: "Kích thước",
      dataIndex: "dimensions",
      width: 120,
      render: (_, record) => record.type === 'group' ? null : <span>{record.dimensions}</span>,
      editable: (_, record) => record.type !== 'group',
    },
    {
      title: "Đơn vị",
      dataIndex: "unit",
      width: 80,
      render: (_, record) => record.type === 'group' ? null : <span>{record.unit}</span>,
      editable: (_, record) => record.type !== 'group',
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      valueType: "digit",
      width: 80,
      render: (_, record) => record.type === 'group' ? null : <span>{record.quantity}</span>,
      editable: (_, record) => record.type !== 'group',
    },
    {
      title: "Đơn giá",
      dataIndex: "price",
      valueType: "digit",
      render: (_, record) => record.type === 'group' ? null : <span>{formatCurrency(record.price)}</span>,
      editable: (_, record) => record.type !== 'group',
      fieldProps: {
        formatter: (value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ","),
        parser: (value: any) => value.replace(/\$\s?|(,*)/g, ""),
      },
    },
    {
      title: "Thành tiền",
      dataIndex: "amount",
      valueType: "digit",
      editable: false,
      render: (_, record) => {
        if (record.type === 'group') {
          let subtotal = 0;
          let foundGroup = false;
          for (const d of details) {
            if (d.id === record.id) foundGroup = true;
            else if (foundGroup && d.type === 'group') break;
            else if (foundGroup && d.type === 'item') subtotal += (d.quantity * d.price || 0);
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
      hideInTable: !isAdmin,
      hideInForm: !isAdmin,
      render: (_, record) => record.type === 'group' ? null : <span>{formatCurrency(record.costPrice || 0)}</span>,
      editable: (_, record) => record.type !== 'group',
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
        if (record.type === 'group') {
          return [
            <Button type="link" size="small" key="add" onClick={() => handleAddItemToGroup(record.id!)}>Thêm dòng</Button>,
            <Button type="link" size="small" danger key="delete" onClick={() => {
              let toDelete = [record.id];
              let foundGroup = false;
              for (const d of details) {
                if (d.id === record.id) foundGroup = true;
                else if (foundGroup && d.type === 'group') break;
                else if (foundGroup && d.type === 'item') toDelete.push(d.id);
              }
              const newDetails = details.filter(d => !toDelete?.includes(d.id));
              onUpdate(newDetails, true, record, 'delete');
              message.success("Đã xóa danh mục");
            }}>Xóa</Button>
          ];
        }
        return [
          <Button type="link" size="small" key="edit" onClick={() => action?.startEditable?.(record.id)}>Sửa</Button>,
          <Button type="link" size="small" danger key="delete" onClick={() => {
            onUpdate(details.filter((item) => item.id !== record.id), true, record, 'delete');
            message.success("Đã xóa dòng");
          }}>Xóa</Button>,
        ];
      },
    },
  ];

  // Logic tổng kết
  const summaryData = useMemo(() => {
    const totalCalculated = details.reduce(
      (acc, curr) => acc + (curr.type !== 'group' ? (curr.quantity * curr.price || 0) : 0),
      0
    );
    const totalCost = details.reduce(
      (acc, curr) => acc + (curr.type !== 'group' ? (Number(curr.costPrice) || 0) : 0),
      0,
    );
    const profit = (manualTotal ?? totalCalculated) - totalCost;

    return {
      totalCalculated,
      totalCost,
      profit,
    };
  }, [details, manualTotal]);

  // Khi chọn danh mục từ modal → tạo dòng danh mục mới
  const handleCategorySelect = (category: ItemCategory) => {
    const newId = (Math.random() * 1000000).toFixed(0);
    const newRow: ProjectDetail = {
      id: newId,
      projectId,
      type: 'group',
      categoryId: category.id,
      name: category.name,
      material: "",
      dimensions: "",
      unit: "",
      quantity: 1,
      price: 0,
      amount: 0,
      costPrice: 0,
      isCompanyProduct: true,
      note: "",
    };
    onUpdate([...details, newRow], false);
    setCategoryModalOpen(false);
    message.success(`Đã thêm danh mục "${category.name}"`);
  };

  const handleAddItemToGroup = (groupId: string) => {
    const groupIndex = details.findIndex(d => d.id === groupId);
    if (groupIndex === -1) return;

    const parentCategory = details[groupIndex];
    let insertIndex = groupIndex + 1;
    while (insertIndex < details.length && details[insertIndex].type === 'item') {
      insertIndex++;
    }

    const newId = (Math.random() * 1000000).toFixed(0);
    const newRow: ProjectDetail = {
      id: newId,
      projectId,
      type: 'item',
      parentCategoryId: parentCategory.categoryId,
      name: "",
      material: "",
      dimensions: "",
      unit: "Chiếc",
      quantity: 1,
      price: 0,
      amount: 0,
      costPrice: 0,
      isCompanyProduct: true,
      note: "",
    };

    const newDetails = [...details];
    newDetails.splice(insertIndex, 0, newRow);
    onUpdate(newDetails, false);
    setEditableRowKeys([...editableKeys, newId]);
  };

  const handleExportExcel = () => {
    try {
      const detailRows = details.map((item) => {
        const isGroup = item.type === 'group';
        const row: Record<string, any> = {
          STT: indexMapping[item.id!],
          [nameColumnTitle || "Tên dự án"]: isGroup ? item.name.toUpperCase() : item.name,
          "Chất liệu": isGroup ? "" : item.material,
          "Kích thước": isGroup ? "" : item.dimensions,
          "Đơn vị": isGroup ? "" : item.unit,
          "Số lượng": isGroup ? "" : item.quantity,
          "Đơn giá (đ)": isGroup ? "" : item.price,
          "Thành tiền (đ)": isGroup ? "" : (item.quantity * item.price),
          "Ghi chú": item.note || "",
        };

        if (isAdmin) {
          row["Giá vốn (đ)"] = isGroup ? "" : item.costPrice;
        }

        return row;
      });

      const summaryRows: Record<string, any>[] = [
        {},
        {
          [nameColumnTitle || "Tên dự án"]: "TỔNG KẾT",
        },
        {
          [nameColumnTitle || "Tên dự án"]: "Tổng số tiền sản phẩm",
          "Thành tiền (đ)": summaryData.totalCalculated,
        },
        {
          [nameColumnTitle || "Tên dự án"]: "DOANH THU",
          "Thành tiền (đ)": manualTotal ?? summaryData.totalCalculated,
        },
        ...(isAdmin
          ? [
            {
              [nameColumnTitle || "Tên dự án"]: "LỢI NHUẬN",
              "Thành tiền (đ)": manualProfit ?? summaryData.profit,
            },
          ]
          : []),
      ];

      const exportData = [...detailRows, ...summaryRows];

      const ws = XLSX.utils.json_to_sheet(exportData);

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Chi tiết dự án");

      XLSX.writeFile(wb, `Chi_tiet_du_an_${projectId}.xlsx`);
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
              style={{ background: "#10b981", borderColor: "#10b981" }}
            >
              Chọn danh mục
            </Button>
            {/* Nút Import Excel */}
            <Upload showUploadList={false} beforeUpload={() => { message.info('Tính năng Import Excel đang được phát triển'); return false; }}>
              <Button icon={<UploadOutlined />}>
                Import Excel
              </Button>
            </Upload>
          </>
        )}
        <Button icon={<DownloadOutlined />} onClick={handleExportExcel}>
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
        value={details}
        onChange={(newDetails) => onUpdate(newDetails as ProjectDetail[], false)}
        editable={{
          type: "multiple",
          editableKeys,
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
            {/* Dòng 1: Tổng số tiền sản phẩm */}
            <ProTable.Summary.Row style={{ backgroundColor: "#fafafa", fontWeight: "bold" }}>
              <ProTable.Summary.Cell index={0} colSpan={isAdmin ? 9 : 5}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingRight: 24 }}>
                  <Text style={{ fontSize: 16 }}>Tổng số tiền sản phẩm:</Text>
                  <Text strong style={{ fontSize: 16 }}>{formatCurrency(summaryData.totalCalculated)}</Text>
                </div>
              </ProTable.Summary.Cell>
            </ProTable.Summary.Row>

            {/* Dòng 2: DOANH THU */}
            <ProTable.Summary.Row style={{ backgroundColor: "#fafafa", fontWeight: "bold" }}>
              <ProTable.Summary.Cell index={0} colSpan={isAdmin ? 9 : 5}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingRight: 24 }}>
                  <Text style={{ fontSize: 16 }}>DOANH THU:</Text>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <InputNumber
                      value={manualTotal ?? summaryData.totalCalculated}
                      onChange={(val) => setManualTotal(val ? Number(val) : null)}
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                      parser={(value) => value!.replace(/\$\s?|(,*)/g, "") as unknown as number}
                      style={{
                        width: 200,
                        fontWeight: "bold",
                        fontSize: 16,
                        color: "#d4380d",
                      }}
                      bordered={false}
                      controls={false}
                      disabled={!isAdmin}
                      className="align-right-input editable-summary-input"
                    />
                    <Text>đ</Text>
                  </div>
                </div>
              </ProTable.Summary.Cell>
            </ProTable.Summary.Row>

            {/* Dòng 4: LỢI NHUẬN */}
            {isAdmin && (
              <ProTable.Summary.Row style={{ backgroundColor: "#fafafa", fontWeight: "bold" }}>
                <ProTable.Summary.Cell index={0} colSpan={9}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingRight: 24 }}>
                    <Text style={{ fontSize: 16 }}>LỢI NHUẬN:</Text>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <InputNumber
                        value={manualProfit ?? summaryData.profit}
                        onChange={(val) => setManualProfit(val ? Number(val) : null)}
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        parser={(value) => value!.replace(/\$\s?|(,*)/g, "") as unknown as number}
                        style={{
                          width: 200,
                          fontWeight: "bold",
                          fontSize: 16,
                          color: "#d4380d",
                        }}
                        bordered={false}
                        controls={false}
                        className="align-right-input editable-summary-input"
                      />
                      <Text>đ</Text>
                    </div>
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
    </div>
  );
};

export default ProjectDetailTable;
