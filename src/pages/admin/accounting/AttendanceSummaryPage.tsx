import React from 'react';
import { ProTable, ProColumns } from '@ant-design/pro-components';
import { User, AttendanceSummary as AttendanceSummaryType } from '@/src/types';
import { MOCK_ATTENDANCE_SUMMARY } from '@/src/mockData';
import { Button, Badge, Typography, message } from 'antd';

const { Text } = Typography;

interface AttendanceSummaryProps {
  currentUser: User;
}

const AttendanceSummaryPage: React.FC<AttendanceSummaryProps> = ({ currentUser }) => {
  const attendanceColumns: ProColumns<AttendanceSummaryType>[] = [
    {
      title: 'Nhân viên',
      dataIndex: 'staffName',
      fixed: 'left',
      width: 150,
    },
    {
      title: 'Tháng',
      dataIndex: 'month',
      valueType: 'dateMonth',
      hideInSearch: true,
    },
    {
      title: 'Tổng công',
      dataIndex: 'totalWorkDays',
      hideInSearch: true,
      render: (val) => (
        <Badge count={Number(val)} showZero color="#52c41a" style={{ fontSize: 14 }}>
          <span />
        </Badge>
      ),
    },
    {
      title: 'Giờ OT',
      dataIndex: 'totalOTHours',
      hideInSearch: true,
      render: (val) => <Text type="warning">{val}h</Text>,
    },
    {
      title: 'Số lần trễ',
      dataIndex: 'totalLate',
      hideInSearch: true,
      render: (val) => {
        const num = Number(val);
        return num > 0 ? (
          <Badge count={num} showZero color="#ff4d4f" />
        ) : (
          <Text type="success">0</Text>
        );
      },
    },
    {
      title: 'Thao tác',
      valueType: 'option',
      render: (_, record) => [
        <Button key="detail" type="link" onClick={() => viewAttendanceDetail(record)}>
          Xem chi tiết
        </Button>,
      ],
    },
  ];

  const viewAttendanceDetail = (record: AttendanceSummaryType) => {
    message.info(`Xem chi tiết chấm công: ${record.staffName} - Tháng ${record.month}`);
  };

  return (
    <div>
      <ProTable<AttendanceSummaryType>
        headerTitle="Bảng tổng hợp chấm công tháng"
        columns={attendanceColumns}
        dataSource={MOCK_ATTENDANCE_SUMMARY}
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1000 }}
        toolBarRender={() => [
          <Button key="export" type="primary">
            Xuất báo cáo chấm công
          </Button>,
        ]}
      />
    </div>
  );
};

export default AttendanceSummaryPage;
