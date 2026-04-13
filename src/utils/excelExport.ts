import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { ProjectDetail, Project } from "@/src/types";
import HOCHI_LOGO from "@/src/statics/HOCHI.png";

const styles = {
  headerBackground: "FF582C24", // ARGB for Nâu đen
  headerText: "FFFFFFFF",       // ARGB for Trắng
  groupBackground: "FFD1CDB3",  // ARGB for Khaki nhạt (I, II...)
  totalBackground: "FFFFFF00",  // ARGB for Vàng (TỔNG KẾT)
  borderProps: { style: 'thin', color: { argb: 'FF000000' } } as any,
  dottedBorderProps: { style: 'dotted', color: { argb: 'FF000000' } } as any
};

const getBorderAll = () => ({
  top: styles.borderProps,
  left: styles.borderProps,
  bottom: styles.borderProps,
  right: styles.borderProps
});

const getBorderDotted = () => ({
  top: styles.dottedBorderProps,
  bottom: styles.dottedBorderProps,
  left: styles.borderProps,
  right: styles.borderProps
});

// Since we are not using getExcelHtmlPreview anymore (or it's dummy), I will make a dummy for it just in case:
export const getExcelHtmlPreview = (
  project: Project | undefined,
  projectId: string,
  details: ProjectDetail[],
  indexMapping: Record<string, string>
) => {
  return "<div>Tính năng Preview bằng HTML không khả dụng khi xuất bằng ExcelJS có chèn ảnh. Khách hàng vui lòng xuất file để xem chi tiết.</div>";
};

export const exportProjectDetailToExcel = async (
  project: Project | undefined,
  projectId: string,
  details: ProjectDetail[],
  indexMapping: Record<string, string>
) => {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Báo giá', {
    views: [{ showGridLines: false }]
  });

  // Setup Column Widths
  ws.columns = [
    { width: 7 },   // A - STT
    { width: 33 },  // B - Hạng mục
    { width: 22 },  // C - Kích thước
    { width: 68 },  // D - Chất liệu
    { width: 13 },  // E - Sản xuất
    { width: 10 },  // F - Đơn vị
    { width: 10 },  // G - Số lượng
    { width: 17 },  // H - Đơn giá
    { width: 19 },  // I - Thành tiền
  ];

  // Font Helper
  const fontTimes = (size: number, bold: boolean = false, italic: boolean = false, color?: string) => ({
    name: 'Times New Roman',
    size,
    bold,
    italic,
    color: color ? { argb: color } : undefined
  });

  // Alignment Helper
  const alignCenter = { vertical: 'middle', horizontal: 'center', wrapText: true } as any;
  const alignLeft = { vertical: 'middle', horizontal: 'left', wrapText: true } as any;
  const alignRight = { vertical: 'middle', horizontal: 'right', wrapText: true } as any;

  let currentRow = 1;

  // Row 1: Logo & Date
  const r1 = ws.getRow(currentRow);
  r1.height = 60;
  
  // Date string
  const today = new Date();
  const dateStr = `Date: ${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
  ws.getCell(`I${currentRow}`).value = dateStr;
  ws.getCell(`I${currentRow}`).font = fontTimes(11, false, true);
  ws.getCell(`I${currentRow}`).alignment = alignRight;

  // Embedded Image
  try {
    const response = await fetch(HOCHI_LOGO);
    if(response.ok) {
      const buffer = await response.arrayBuffer();
      const logoId = wb.addImage({
        buffer,
        extension: 'png',
      });
      // Thêm ảnh bao chọn khu vực cột A và B
      ws.addImage(logoId, 'A1:B1');
    }
  } catch (e) {
    console.error("Failed to load logo image", e);
  }

  // Chừa cột cho ảnh bằng cách merge
  ws.mergeCells(`A${currentRow}:B${currentRow}`);
  currentRow++;

  // Row 2: Header Info
  const r2 = ws.getRow(currentRow);
  r2.height = 20;

  const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: styles.headerBackground } } as any;
  const headerFont = fontTimes(11, true, false, styles.headerText);

  // Set background for entire row A-I
  for(let c = 1; c <= 9; c++) {
    const cell = r2.getCell(c);
    cell.fill = headerFill;
  }
  
  ws.getCell(`A${currentRow}`).value = 'Text name';
  ws.getCell(`A${currentRow}`).font = headerFont;
  ws.getCell(`A${currentRow}`).alignment = alignCenter;
  ws.mergeCells(`A${currentRow}:C${currentRow}`);

  ws.getCell(`D${currentRow}`).value = 'From';
  ws.getCell(`D${currentRow}`).font = headerFont;
  ws.getCell(`D${currentRow}`).alignment = alignCenter;
  ws.mergeCells(`D${currentRow}:F${currentRow}`);

  ws.getCell(`G${currentRow}`).value = 'To';
  ws.getCell(`G${currentRow}`).font = headerFont;
  ws.getCell(`G${currentRow}`).alignment = alignCenter;
  ws.mergeCells(`G${currentRow}:I${currentRow}`);

  currentRow++;

  // Row 3, 4, 5: Info Box
  for(let r=0; r<3; r++) {
    ws.getRow(currentRow + r).height = 35;
  }

  // Set borders for the info box area
  for (let r=0; r<3; r++) {
    for (let c=1; c<=9; c++) {
      ws.getCell(currentRow + r, c).border = getBorderAll();
    }
  }

  const rInfo = currentRow;
  // BÁO GIÁ
  ws.mergeCells(`A${rInfo}:C${rInfo+2}`);
  ws.getCell(`A${rInfo}`).value = 'BÁO GIÁ';
  ws.getCell(`A${rInfo}`).font = fontTimes(20, true);
  ws.getCell(`A${rInfo}`).alignment = alignCenter;

  ws.mergeCells(`D${rInfo}:F${rInfo+2}`);
  ws.getCell(`D${rInfo}`).value = "CÔNG TY CỔ PHẦN HOCHI VIỆT NAM\nOffice: Tầng 4 tòa nhà Vimeco - Phạm Hùng, Yên Hòa, Hà Nội\nFactory: Ngõ 41 Đường Tả Thanh Oai - Đại Thanh - TP. Hà Nội\nPhone: 0326908884. Hotline: 0917087055\nWebsite: noithathochi.com               Email: noithathochi@gmail.com";
  ws.getCell(`D${rInfo}`).font = fontTimes(10);
  ws.getCell(`D${rInfo}`).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };

  ws.mergeCells(`G${rInfo}:I${rInfo+2}`);
  ws.getCell(`G${rInfo}`).value = `Add: ${project?.ownerName || ''}`;
  ws.getCell(`G${rInfo}`).font = fontTimes(11, true);
  ws.getCell(`G${rInfo}`).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };

  currentRow += 3;

  // Row 6: Table Headers
  const rHeaders = ws.getRow(currentRow);
  rHeaders.height = 35;
  const headers = ["STT", "Hạng mục", "Kích thước\n(DxRxC mm)", "Chất liệu", "Sản xuất", "Đơn vị", "Số lượng", "Đơn giá\n(VNĐ)", "Thành tiền\n(VNĐ)"];
  
  for(let i=0; i<9; i++) {
    const cell = rHeaders.getCell(i+1);
    cell.value = headers[i];
    cell.fill = headerFill;
    cell.font = fontTimes(12, true, false, styles.headerText);
    cell.alignment = alignCenter;
    cell.border = getBorderAll();
  }
  currentRow++;

  // Rows 7+: Items
  let totalVal = 0;
  details.forEach((item, index) => {
    const isGroup = item.rowType === 'group';
    let rowSubtotal = 0;

    if (isGroup) {
      let foundGroup = false;
      for (const d of details) {
        if (d.id === item.id) foundGroup = true;
        else if (foundGroup && d.rowType === 'group') break;
        else if (foundGroup && d.rowType === 'item') rowSubtotal += (d.quantity * d.price || 0);
      }
    } else {
      rowSubtotal = (item.quantity || 0) * (item.price || 0);
    }
    
    if (!isGroup) totalVal += rowSubtotal;

    const row = ws.getRow(currentRow);
    row.height = isGroup ? 30 : 55;

    const groupFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: styles.groupBackground } } as any;

    const values = [
      indexMapping[item.id!] || "",
      isGroup ? item.name.toUpperCase() : item.name,
      isGroup ? "" : (item.size || ""),
      isGroup ? "" : (item.material || ""),
      isGroup ? "" : "Việt Nam",
      isGroup ? "" : (item.unit || ""),
      isGroup ? "" : (item.quantity || 0),
      isGroup ? "" : (item.price || 0),
      rowSubtotal || 0
    ];

    for(let c=1; c<=9; c++) {
      const cell = row.getCell(c);
      
      // Xử lý value rỗng thì exceljs nên truyền null hoặc '' 
      cell.value = values[c-1] === "" ? null : values[c-1] as any;
      
      cell.border = isGroup ? getBorderAll() : getBorderDotted();
      
      if (isGroup) {
        cell.fill = groupFill;
        cell.font = fontTimes(11, true);
        cell.alignment = (c===8 || c===9) ? alignRight : alignCenter;
      } else {
        cell.font = fontTimes(11);
        if (c===1 || c===5 || c===6) cell.alignment = alignCenter;
        else if (c===7) cell.alignment = alignCenter;
        else if (c===8 || c===9) cell.alignment = alignRight;
        else cell.alignment = alignLeft;
      }

      if (c === 7 && !isGroup) cell.numFmt = '#,##0.00';
      if (c === 8 && !isGroup) cell.numFmt = '#,##0';
      if (c === 9) cell.numFmt = '#,##0';
    }

    currentRow++;
  });

  // Tổng cộng
  const rTotal = ws.getRow(currentRow);
  rTotal.height = 35;
  const sumFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: styles.totalBackground } } as any;

  for(let c=1; c<=9; c++) {
    const cell = rTotal.getCell(c);
    cell.fill = sumFill;
    cell.font = fontTimes(11, true);
    cell.border = getBorderAll();
    if(c === 9) {
      cell.value = totalVal;
      cell.numFmt = '#,##0';
      cell.alignment = alignRight;
    }
  }
  
  ws.mergeCells(`A${currentRow}:H${currentRow}`);
  ws.getCell(`A${currentRow}`).value = 'TỔNG GIÁ CHƯA VAT (VNĐ):';
  ws.getCell(`A${currentRow}`).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
  currentRow += 2;

  // Notes
  const _note = (val: string, h: number, b: boolean=false) => {
    const r = ws.getRow(currentRow);
    r.height = h;
    const cell = r.getCell(1);
    cell.value = val;
    cell.font = fontTimes(11, b);
    currentRow++;
  };

  _note("Note", 20, true);
  _note("1. Đơn giá trên chưa bao gồm thuế VAT", 20);
  _note("2. Đơn giá trên bao gồm chi phí vận chuyển lắp đặt hoàn thiện", 20);
  _note("3. Khối lượng quyết toán dựa trên khối lượng thi công nghiệm thu thực tế tại công trình", 20);
  _note("4. Thời gian hoàn thành công trình: 05 - 7 ngày kể từ ngày xác nhận đặt hàng và tạm ứng.", 20);
  _note("5. Điều kiện thanh toán: Thanh toán tiền mặt hoặc chuyển khoản", 20);
  _note("Lần 1: Tạm ứng 50% giá trị đơn hàng ngay sau khi ký đặt hàng", 20);
  _note("Lần 2: Quyết toán phần còn lại ngay sau khi ký nghiệm thu quyết toán", 20);
  currentRow++;

  const rSign = ws.getRow(currentRow);
  rSign.height = 30;
  ws.getCell(`A${currentRow}`).value = "    ĐẠI DIỆN CHỦ ĐẦU TƯ";
  ws.getCell(`A${currentRow}`).font = fontTimes(11, true);
  ws.getCell(`H${currentRow}`).value = "CÔNG TY CỔ PHẦN HOCHI VIỆT NAM";
  ws.getCell(`H${currentRow}`).font = fontTimes(11, true);
  ws.mergeCells(`A${currentRow}:C${currentRow}`);
  ws.mergeCells(`H${currentRow}:I${currentRow}`);

  // Create file
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `Bao_gia_${projectId}.xlsx`);
};
