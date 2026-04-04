import React, { useState, useMemo } from "react";
import {
  EditableProTable,
  ProColumns,
  ProTable,
} from "@ant-design/pro-components";
import { Button, Space, Typography, message, InputNumber, Input, Modal, Select, Tag } from "antd";
import {
  PlusOutlined,
  DownloadOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { ProjectDetail, Role } from "@/src/types";
import { formatCurrency } from "@/src/utils/format";
import { getCategoriesGrouped, getMinPrice } from "@/src/data/itemCategories";
import type { ItemCategory, ItemVariant } from "@/src/data/itemCategories";
import * as XLSX from "xlsx";

const { Text } = Typography;

// ─── Modal chọn hạng mục từ danh sách ────────────────────────────────────────
const SelectCategoryModal: React.FC<{
  open: boolean;
  onCancel: () => void;
  onSelect: (category: ItemCategory, variant?: ItemVariant) => void;
}> = ({ open, onCancel, onSelect }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const grouped = getCategoriesGrouped();

  const allChildren = grouped.flatMap(g => g.options);
  const selectedItem = allChildren.find(c => c.id === selectedId);
  const hasVariants = (selectedItem?.variants?.length ?? 0) > 0;
  const selectedVariant = hasVariants
    ? selectedItem?.variants?.find(v => v.id === selectedVariantId)
    : undefined;

  const handleOk = () => {
    if (!selectedItem) {
      message.warning("Vui lòng chọn một hạng mục");
      return;
    }
    if (hasVariants && !selectedVariant) {
      message.warning("Vui lòng chọn loại cụ thể");
      return;
    }
    onSelect(selectedItem, selectedVariant);
    setSelectedId(null);
    setSelectedVariantId(null);
  };

  // Khi đổi item, reset variant
  const handleItemChange = (id: string | null) => {
    setSelectedId(id);
    setSelectedVariantId(null);
  };

  // Preview info để hiển thị
  const previewDesc = selectedVariant?.description || selectedItem?.description;
  const previewDimensions = selectedVariant?.dimensions || selectedItem?.dimensions;
  const previewUnit = selectedVariant?.unit || selectedItem?.unit;
  const previewPrice = selectedVariant?.price ?? selectedItem?.price;

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <AppstoreOutlined style={{ color: "#10b981" }} />
          <span>Chọn hạng mục nội thất</span>
        </div>
      }
      open={open}
      onCancel={() => { setSelectedId(null); setSelectedVariantId(null); onCancel(); }}
      onOk={handleOk}
      okText="Thêm vào danh sách"
      cancelText="Hủy"
      width={580}
    >
      <div style={{ marginTop: 12 }}>
        {/* Bước 1: Chọn hạng mục */}
        <div style={{ marginBottom: 4, fontSize: 12, color: '#6b7280' }}>Hạng mục</div>
        <Select
          style={{ width: "100%" }}
          placeholder="Tìm và chọn hạng mục..."
          showSearch
          allowClear
          value={selectedId}
          onChange={handleItemChange}
          filterOption={(input, option) =>
            String(option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
          optionLabelProp="label"
          size="large"
        >
          {grouped.map(group => (
            <Select.OptGroup key={group.label} label={group.label}>
              {group.options.map(item => (
                <Select.Option key={item.id} value={item.id} label={item.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 14 }}>
                        {item.name}
                        {(item.variants?.length ?? 0) > 0 && (
                          <Tag color="blue" style={{ marginLeft: 6, fontSize: 10 }}>
                            {item.variants!.length} loại
                          </Tag>
                        )}
                      </div>
                      {!(item.variants?.length) && item.description && (
                        <div style={{ fontSize: 12, color: "#9ca3af", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 260 }}>
                          {item.description}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 8 }}>
                      {!(item.variants?.length) && item.dimensions && (
                        <div style={{ fontSize: 11, color: "#6366f1", fontFamily: "monospace" }}>{item.dimensions} mm</div>
                      )}
                      {!(item.variants?.length) && item.price != null && (
                        <div style={{ fontSize: 12, color: "#d97706", fontWeight: 600 }}>
                          {item.price.toLocaleString("vi-VN")}₫
                        </div>
                      )}
                      {(item.variants?.length ?? 0) > 0 && (() => {
                        const min = getMinPrice(item);
                        return min != null ? <div style={{ fontSize: 12, color: "#d97706" }}>từ {min.toLocaleString('vi-VN')}₫</div> : null;
                      })()}
                    </div>
                  </div>
                </Select.Option>
              ))}
            </Select.OptGroup>
          ))}
        </Select>

        {/* Bước 2: Chọn loại/biến thể (nếu có) */}
        {selectedItem && hasVariants && (
          <div style={{ marginTop: 12 }}>
            <div style={{ marginBottom: 4, fontSize: 12, color: '#6b7280' }}>
              Loại cụ thể <span style={{ color: '#ef4444' }}>*</span>
            </div>
            <Select
              style={{ width: "100%" }}
              placeholder="Chọn loại/biến thể..."
              size="large"
              value={selectedVariantId}
              onChange={setSelectedVariantId}
              allowClear
            >
              {selectedItem.variants!.map(v => (
                <Select.Option key={v.id} value={v.id}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontWeight: 500 }}>{v.label}</div>
                      {v.description && (
                        <div style={{ fontSize: 12, color: '#9ca3af', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 220 }}>
                          {v.description}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 8 }}>
                      {v.dimensions && <div style={{ fontSize: 11, color: '#6366f1', fontFamily: 'monospace' }}>{v.dimensions} mm</div>}
                      {v.price != null && <div style={{ fontSize: 12, color: '#d97706', fontWeight: 600 }}>{v.price.toLocaleString('vi-VN')}₫/{v.unit || selectedItem.unit}</div>}
                    </div>
                  </div>
                </Select.Option>
              ))}
            </Select>
          </div>
        )}

        {/* Preview */}
        {selectedItem && (!hasVariants || selectedVariant) && (
          <div style={{
            marginTop: 16, padding: "12px 16px",
            background: "#f0fdf4", borderRadius: 8, border: "1px solid #bbf7d0",
          }}>
            <div style={{ fontWeight: 600, fontSize: 15, color: "#111827", marginBottom: 6 }}>
              {selectedItem.name}
              {selectedVariant && (
                <Tag color="blue" style={{ marginLeft: 8, fontSize: 12 }}>{selectedVariant.label}</Tag>
              )}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 16px", fontSize: 13, color: "#374151" }}>
              {previewDesc && <div><span style={{ color: "#9ca3af" }}>Chất liệu: </span>{previewDesc}</div>}
              {previewDimensions && <div><span style={{ color: "#9ca3af" }}>Kích thước: </span><b style={{ fontFamily: "monospace" }}>{previewDimensions} mm</b></div>}
              {previewUnit && <div><span style={{ color: "#9ca3af" }}>Đơn vị: </span>{previewUnit}</div>}
              {previewPrice != null && <div><span style={{ color: "#9ca3af" }}>Đơn giá: </span><b style={{ color: "#d97706" }}>{previewPrice.toLocaleString("vi-VN")}₫</b></div>}
            </div>
          </div>
        )}
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

  const isAdmin = role === Role.DIRECTOR || role === Role.ACCOUNTANT;

  const columns: ProColumns<ProjectDetail>[] = [
    {
      title: nameColumnTitle || "Tên dự án",
      dataIndex: "name",
      width: "20%",
      formItemProps: {
        rules: [{ required: true, message: "Vui lòng nhập tên" }],
      },
    },
    {
      title: "Chất liệu",
      dataIndex: "material",
      formItemProps: {
        rules: [{ required: true, message: "Vui lòng nhập chất liệu" }],
      },
    },
    {
      title: "Đơn vị",
      dataIndex: "unit",
      width: 80,
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      valueType: "digit",
      width: 80,
    },
    {
      title: "Đơn giá",
      dataIndex: "price",
      valueType: "digit",
      fieldProps: {
        formatter: (value: any) =>
          `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ","),
        parser: (value: any) => value.replace(/\$\s?|(,*)/g, ""),
      },
    },
    {
      title: "Thành tiền",
      dataIndex: "amount",
      valueType: "digit",
      editable: false,
      fieldProps: {
        formatter: (value: any) =>
          `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ","),
        parser: (value: any) => value.replace(/\$\s?|(,*)/g, ""),
      },
      render: (_, record) => (
        <span>{formatCurrency(record.quantity * record.price)}</span>
      ),
    },
    {
      title: "Giá vốn",
      dataIndex: "costPrice",
      valueType: "digit",
      hideInTable: !isAdmin,
      hideInForm: !isAdmin,
      fieldProps: {
        formatter: (value: any) =>
          `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ","),
        parser: (value: any) => value.replace(/\$\s?|(,*)/g, ""),
      },
    },
    {
      title: "Thao tác",
      valueType: "option",
      width: 100,
      hideInTable: !isAdmin,
      render: (text, record, _, action) => [
        <Button type="link" size="large" key="edit" onClick={() => action?.startEditable?.(record.id)}>
          Sửa
        </Button>,
        <Button
          type="link"
          size="large"
          danger
          key="delete"
          onClick={() => {
            onUpdate(details.filter((item) => item.id !== record.id), true, record, 'delete');
            message.success("Đã xóa dòng");
          }}
        >
          Xóa
        </Button>,
      ],
    },
  ];

  // Logic tổng kết
  const summaryData = useMemo(() => {
    const totalCalculated = details.reduce(
      (acc, curr) => acc + (curr.quantity * curr.price || 0),
      0
    );
    const totalCost = details.reduce(
      (acc, curr) => acc + (Number(curr.costPrice) || 0),
      0,
    );
    const profit = (manualTotal ?? totalCalculated) - totalCost;

    return {
      totalCalculated,
      totalCost,
      profit,
    };
  }, [details, manualTotal]);

  // Khi chọn hạng mục từ modal → tạo dòng mới tự điền data
  const handleCategorySelect = (category: ItemCategory, variant?: ItemVariant) => {
    const newId = (Math.random() * 1000000).toFixed(0);
    // Ưu tiên dùng thông tin từ variant nếu có, khảng không dùng thước item
    const resolvedDesc = variant?.description || category.description || "";
    const resolvedUnit = variant?.unit || category.unit || "Chiếc";
    const resolvedPrice = variant?.price ?? category.price ?? 0;
    const resolvedDim = variant?.dimensions || category.dimensions;
    const displayName = variant ? `${category.name} - ${variant.label}` : category.name;

    const newRow: ProjectDetail = {
      id: newId,
      projectId,
      name: displayName,
      material: resolvedDesc,
      unit: resolvedUnit,
      quantity: 1,
      price: resolvedPrice,
      amount: resolvedPrice,
      costPrice: 0,
      isCompanyProduct: true,
      note: resolvedDim ? `Kích thước: ${resolvedDim} mm` : "",
    };
    onUpdate([newRow, ...details], false);
    setEditableRowKeys([newId]);
    setCategoryModalOpen(false);
    message.success(`Đã thêm "${displayName}" vào danh sách`);
  };

  // Thêm dòng trống (nhập tay)
  const handleAddEmptyRow = () => {
    const newId = (Math.random() * 1000000).toFixed(0);
    const newRow: ProjectDetail = {
      id: newId,
      projectId,
      name: "",
      material: "",
      unit: "Cái",
      quantity: 1,
      price: 0,
      amount: 0,
      costPrice: 0,
      isCompanyProduct: true,
      note: "",
    };
    onUpdate([newRow, ...details], false);
    setEditableRowKeys([newId]);
  };

  const handleExportExcel = () => {
    try {
      const detailRows = details.map((item, index) => {
        const row: Record<string, any> = {
          STT: index + 1,
          [nameColumnTitle || "Tên dự án"]: item.name,
          "Chất liệu": item.material,
          "Đơn vị": item.unit,
          "Số lượng": item.quantity,
          "Đơn giá (đ)": item.price,
          "Thành tiền (đ)": item.quantity * item.price,
          "Ghi chú": item.note || "",
        };

        if (isAdmin) {
          row["Giá vốn (đ)"] = item.costPrice;
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
              Chọn hạng mục
            </Button>
            {/* Nút thêm dòng nhập tay */}
            <Button icon={<PlusOutlined />} onClick={handleAddEmptyRow}>
              Thêm dòng thủ công
            </Button>
          </>
        )}
        <Button icon={<DownloadOutlined />} onClick={handleExportExcel}>
          Xuất Excel
        </Button>
      </Space>

      <EditableProTable<ProjectDetail>
        rowKey="id"
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
            // Tự động tính amount khi lưu
            const newData = { ...data, amount: data.quantity * data.price };
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
