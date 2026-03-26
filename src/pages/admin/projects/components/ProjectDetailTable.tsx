import React, { useState, useMemo } from "react";
import {
  EditableProTable,
  ProColumns,
  ProTable,
} from "@ant-design/pro-components";
import { Button, Space, Typography, message, InputNumber, Input, Modal } from "antd";
import {
  PlusOutlined,
  DownloadOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import { ProjectDetail, Role } from "@/src/types";
import { formatCurrency } from "@/src/utils/format";
import * as XLSX from "xlsx";

const { Text } = Typography;

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
}) => {
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [manualTotal, setManualTotal] = useState<number | null>(null);
  const [manualProfit, setManualProfit] = useState<number | null>(null);
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [nameColumnTitle, setNameColumnTitle] = useState(
    localStorage.getItem(`project-column-title-${projectId}`) || "Tên dự án"
  );
  const [tempColumnTitle, setTempColumnTitle] = useState(nameColumnTitle);

  const handleOpenColumnModal = () => {
    setTempColumnTitle(nameColumnTitle);
    setIsColumnModalOpen(true);
  };

  const handleSaveColumnTitle = () => {
    const finalTitle = tempColumnTitle.trim() || "Tên dự án";
    setNameColumnTitle(finalTitle);
    localStorage.setItem(`project-column-title-${projectId}`, finalTitle);
    setIsColumnModalOpen(false);
    message.success("Đổi tên cột thành công");
  };
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
    const totalSelected = details
      .filter((item) => selectedRowKeys.includes(item.id))
      .reduce((acc, curr) => acc + (curr.quantity * curr.price || 0), 0);

    const totalUnselected = details
      .filter((item) => !selectedRowKeys.includes(item.id))
      .reduce((acc, curr) => acc + (curr.quantity * curr.price || 0), 0);

    const totalCalculated = totalSelected + totalUnselected;
    const totalCost = details.reduce(
      (acc, curr) => acc + (Number(curr.costPrice) || 0),
      0,
    );
    const profit = (manualTotal ?? totalCalculated) - totalCost;

    return {
      totalSelected,
      totalUnselected,
      totalCalculated,
      totalCost,
      profit,
    };
  }, [details, selectedRowKeys, manualTotal]);

  const handleAddRow = () => {
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
    onUpdate([newRow, ...details], false); // Chỉ cập nhật UI, không gọi API patch toàn bộ
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
          [nameColumnTitle || "Tên dự án"]: "Tổng số tiền sản phẩm của công ty",
          "Thành tiền (đ)": summaryData.totalSelected,
        },
        {
          [nameColumnTitle || "Tên dự án"]: "Tổng số tiền sản phẩm chưa có",
          "Thành tiền (đ)": summaryData.totalUnselected,
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
      <h3 style={{ color: 'red', margin: '16px 0' }}>Lưu ý: Tích vào những sản phẩm của công ty có sẵn</h3>
      <Modal
        title="Đổi tên cột đầu"
        open={isColumnModalOpen}
        onOk={handleSaveColumnTitle}
        onCancel={() => setIsColumnModalOpen(false)}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Input
          value={tempColumnTitle}
          onChange={(e) => setTempColumnTitle(e.target.value)}
          placeholder="Ví dụ: Tên hạng mục"
          onPressEnter={handleSaveColumnTitle}
        />
      </Modal>
      <Space style={{ marginBottom: 16 }}>
        {isAdmin && (
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddRow}>
            Thêm dòng chi tiết
          </Button>
        )}
        <Button icon={<DownloadOutlined />} onClick={handleExportExcel}>
          Xuất Excel
        </Button>
        <Button onClick={handleOpenColumnModal}>
          Tên dự án
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
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
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
            {/* Dòng 1: Sản phẩm đã có (Selected) */}
            <ProTable.Summary.Row style={{ backgroundColor: "#fafafa", fontWeight: "bold" }}>
              <ProTable.Summary.Cell index={0} colSpan={isAdmin ? 9 : 5}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingRight: 24 }}>
                  <Text style={{ fontSize: 16 }}>Tổng số tiền sản phẩm của công ty:</Text>
                  <Text strong style={{ fontSize: 16 }}>{formatCurrency(summaryData.totalSelected)}</Text>
                </div>
              </ProTable.Summary.Cell>
            </ProTable.Summary.Row>

            {/* Dòng 2: Sản phẩm chưa có (Unselected) */}
            <ProTable.Summary.Row style={{ backgroundColor: "#fafafa", fontWeight: "bold" }}>
              <ProTable.Summary.Cell index={0} colSpan={isAdmin ? 9 : 5}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingRight: 24 }}>
                  <Text style={{ fontSize: 16 }}>Tổng số tiền sản phẩm chưa có:</Text>
                  <Text strong style={{ fontSize: 16 }}>{formatCurrency(summaryData.totalUnselected)}</Text>
                </div>
              </ProTable.Summary.Cell>
            </ProTable.Summary.Row>

            {/* Dòng 3: DOANH THU */}
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
                      // Thêm class này (gộp với class align-right-input ở bước trước)
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
                    {/* Đã bổ sung thẻ div bọc InputNumber và Text ở đây giống hệt dòng Doanh Thu */}
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
                        // Thêm class này (gộp với class align-right-input ở bước trước)
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
    </div>
  );
};

export default ProjectDetailTable;
