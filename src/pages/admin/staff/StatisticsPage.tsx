import React from 'react';
import { ProTable, ProColumns, ProCard } from '@ant-design/pro-components';
import { AttendanceRecord, AdvanceRequest } from '@/src/types';
import { MOCK_ATTENDANCE, MOCK_ADVANCE_REQUESTS, MOCK_EMPLOYEES } from '@/src/mockData';
import { Card, Row, Col, Statistic, Tag, Descriptions } from 'antd';
import {
  DollarOutlined,
  CheckCircleOutlined,
  FieldTimeOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { formatCurrency, formatDateTime, toSafeNumber } from '@/src/utils/format';
import { useAuth } from '@/src/auth/hooks/useAuth';

const StatisticsPage: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  const employeeInfo = MOCK_EMPLOYEES.find((e) => e.id === user.id) || {
    id: user.id,
    name: user.name,
    baseSalary: 12000000,
    bonus: 0,
    penalty: 0,
    advance: 0,
  };

  const myRecords = MOCK_ATTENDANCE.filter((r) => r.staffId === user.id);
  const myAdvanceRequests = MOCK_ADVANCE_REQUESTS.filter((r) => r.employeeId === user.id) as AdvanceRequest[];

  const totalWorkDays = myRecords.reduce((sum, r) => sum + (r.workDay ?? 0), 0);
  const totalOTHours = myRecords.reduce((sum, r) => sum + (r.otDays ?? 0), 0);

  const baseSalary = toSafeNumber(employeeInfo.baseSalary);
  const bonus = toSafeNumber(employeeInfo.bonus);
  const penalty = toSafeNumber(employeeInfo.penalty);
  const advance = toSafeNumber(employeeInfo.advance);
  const estimatedSalary = baseSalary + bonus - penalty - advance;

  const monthlyAttendanceColumns: ProColumns<AttendanceRecord>[] = [
    {
      title: 'Ngày',
      dataIndex: 'dateFilter',
      valueType: 'date',
      hideInTable: true,
      search: {
        transform: (value) => ({
          dateFilter: value?.format('YYYY-MM-DD'),
        }),
      },
    },
    {
      title: 'Ngày',
      dataIndex: 'date',
      valueType: 'date',
      hideInSearch: true,
      render: (_, record) => dayjs(record.date).format('DD/MM/YYYY'),
    },
    {
      title: 'Số công hành chính',
      dataIndex: 'workDay',
      hideInSearch: true,
    },
    {
      title: 'Tăng ca',
      dataIndex: 'otDays',
      hideInSearch: true,
      render: (_, record) =>
        (record.otDays ?? 0) > 0 ? (
          <Tag color="blue" icon={<FieldTimeOutlined />}>
            {record.otDays} công
          </Tag>
        ) : (
          '-'
        ),
    },
    {
      title: 'Thành tiền',
      dataIndex: 'amount',
      hideInSearch: true,
      render: (_, record) => (
        <span style={{ fontWeight: 700, color: '#52c41a' }}>
          {new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
          }).format(Number(record.workDay || 0))}
        </span>
      ),
    },
  ];

  const advanceColumns: ProColumns<AdvanceRequest>[] = [
    {
      title: 'Ngày yêu cầu',
      dataIndex: 'requestDateFilter',
      valueType: 'date',
      hideInTable: true,
      search: {
        transform: (value) => ({
          requestDateFilter: value?.format('YYYY-MM-DD'),
        }),
      },
    },
    {
      title: 'Ngày yêu cầu',
      dataIndex: 'requestDate',
      valueType: 'dateTime',
      hideInSearch: true,
      render: (_, record) => formatDateTime(record.requestDate),
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      hideInSearch: true,
      render: (_, record) => (
        <strong style={{ color: '#1890ff' }}>
          {formatCurrency(record.amount)}
        </strong>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      hideInSearch: true,
      render: (_, record) => {
        const color =
          record.status === 'Đã duyệt'
            ? 'green'
            : record.status === 'Từ chối'
              ? 'red'
              : 'orange';

        return <Tag color={color}>{record.status}</Tag>;
      },
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <Card title="Tổng quan" bordered styles={{ body: { padding: '12px 16px' } }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <ProCard style={{ background: '#e6f7ff' }} bordered>
              <Statistic
                title="Tổng công"
                value={totalWorkDays}
                suffix="công"
                prefix={<CheckCircleOutlined style={{ color: '#1890ff' }} />}
              />
            </ProCard>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <ProCard style={{ background: '#fff7e6' }} bordered>
              <Statistic
                title="Công OT"
                value={totalOTHours}
                suffix="công"
                prefix={<FieldTimeOutlined style={{ color: '#fa8c16' }} />}
              />
            </ProCard>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <ProCard style={{ background: '#f6ffed' }} bordered>
              <Statistic
                title="Lương cơ bản"
                value={baseSalary}
                formatter={(val) => formatCurrency(val)}
                prefix={<DollarOutlined style={{ color: '#52c41a' }} />}
              />
            </ProCard>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <ProCard style={{ background: '#fff1f0' }} bordered>
              <Statistic
                title="Đã ứng"
                value={advance}
                formatter={(val) => formatCurrency(val)}
                prefix={<WalletOutlined style={{ color: '#ff4d4f' }} />}
              />
            </ProCard>
          </Col>
        </Row>
      </Card>

      <ProCard title="Lương tạm tính (Dự kiến)" bordered headerBordered>
        <Descriptions column={{ xs: 1, sm: 2 }} bordered>
          <Descriptions.Item label="Lương cơ bản">{formatCurrency(baseSalary)}</Descriptions.Item>
          <Descriptions.Item label="Thưởng">+{formatCurrency(bonus)}</Descriptions.Item>
          <Descriptions.Item label="Phạt">-{formatCurrency(penalty)}</Descriptions.Item>
          <Descriptions.Item label="Đã ứng">-{formatCurrency(advance)}</Descriptions.Item>
          <Descriptions.Item label="Thực lĩnh" span={2}>
            <strong
              style={{
                color: estimatedSalary >= 0 ? '#52c41a' : '#ff4d4f',
                fontSize: 18,
              }}
            >
              {formatCurrency(estimatedSalary)}
            </strong>
          </Descriptions.Item>
        </Descriptions>
      </ProCard>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Lịch sử ứng tiền" bordered styles={{ body: { padding: '0' } }}>
            <ProTable<AdvanceRequest>
              columns={advanceColumns}
              rowKey="id"
              search={{ labelWidth: 'auto', defaultCollapsed: false }}
              request={async (params) => {
                let data = myAdvanceRequests;

                if (params.requestDateFilter) {
                  data = data.filter((item) =>
                    dayjs(item.requestDate).isSame(params.requestDateFilter, 'day')
                  );
                }

                return {
                  data,
                  success: true,
                };
              }}
              pagination={{ pageSize: 5 }}
              options={false}
              scroll={{ x: 500 }}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Chi tiết công" bordered styles={{ body: { padding: '0' } }}>
            <ProTable<AttendanceRecord>
              columns={monthlyAttendanceColumns}
              rowKey="id"
              search={{ labelWidth: 'auto', defaultCollapsed: false }}
              request={async (params) => {
                let data = myRecords;

                if (params.dateFilter) {
                  data = data.filter((item) =>
                    dayjs(item.date).isSame(params.dateFilter, 'day')
                  );
                }

                return {
                  data,
                  success: true,
                };
              }}
              pagination={{ pageSize: 5 }}
              options={false}
              scroll={{ x: 500 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default StatisticsPage;