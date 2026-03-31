import React, { useState, useEffect, useMemo } from 'react';
import { DatePicker, Spin, Typography, Space, Empty, Table, Row, Col, Card, Select, Grid } from 'antd';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isoWeek from 'dayjs/plugin/isoWeek';

import { useAuth } from '@/src/auth/hooks/useAuth';
import { useSalaryActionService } from '@/src/api/services';
import { formatCurrency } from '@/src/utils/format';
import { ProCard } from '@ant-design/pro-components';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(isoWeek);

const { Title, Text } = Typography;

interface RawPayment {
  id?: string;
  _id?: string;
  amount: number;
  date?: string;
  paymentDate?: string;
  note?: string;
  [key: string]: any;
}

const IncomeStatisticsPage: React.FC = () => {
  const screens = Grid.useBreakpoint();
  const [selectedMonth, setSelectedMonth] = useState<dayjs.Dayjs | null>(dayjs());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [payments, setPayments] = useState<RawPayment[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { request } = useSalaryActionService();

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    request('GET', '/my-history')
      .then((res: any) => {
        if (res.success && res.data && res.data.payments) {
          setPayments(res.data.payments);
        }
      })
      .catch((err: any) => {
        console.error('Lỗi lấy lịch sử lương:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user, request]);

  const tableData = useMemo(() => {
    if (!payments.length || !selectedMonth) return [];

    let aggregatedData: any[] = [];

    const parsePayment = (p: RawPayment) => {
      const date = dayjs(p.date || p.paymentDate);
      const base = p.amount * 0.8;
      const bonus = p.amount * 0.15;
      const penalty = p.amount * 0.05;
      const advance = p.amount * 0.1;
      return {
        date,
        baseAmount: base,
        bonusAmount: bonus,
        penaltyAmount: penalty,
        advanceAmount: advance,
        totalAmount: p.amount,
      };
    };

    const daysInMonth = selectedMonth.daysInMonth();
    const dataMap = new Map();
    for (let i = 1; i <= daysInMonth; i++) {
      const d = selectedMonth.date(i);
      dataMap.set(d.format('DD/MM/YYYY'), {
        key: d.format('DD/MM/YYYY'),
        name: d.format('DD/MM/YYYY'),
        baseAmount: 0,
        bonusAmount: 0,
        penaltyAmount: 0,
        advanceAmount: 0,
        totalAmount: 0,
      });
    }

    payments.forEach((p) => {
      const parsed = parsePayment(p);
      if (parsed.date.isSame(selectedMonth, 'month')) {
        const key = parsed.date.format('DD/MM/YYYY');
        if (dataMap.has(key)) {
          const item = dataMap.get(key);
          item.baseAmount += parsed.baseAmount;
          item.bonusAmount += parsed.bonusAmount;
          item.penaltyAmount += parsed.penaltyAmount;
          item.advanceAmount += parsed.advanceAmount;
          item.totalAmount += parsed.totalAmount;
        }
      }
    });

    // Chỉ hiển thị những ngày có phát sinh giao dịch cho gọn nếu cần, ở đây hiện hết hoặc chỉ những ngày > 0
    let finalData = Array.from(dataMap.values()).filter(item => item.totalAmount > 0);

    if (selectedDay !== null && selectedDay !== undefined) {
      const selectedDateString = selectedMonth.date(selectedDay).format('DD/MM/YYYY');
      finalData = finalData.filter(item => item.key === selectedDateString);

      // Nếu lọc riêng ngày mà không có dữ liệu (totalAmount = 0), vẫn hiển thị 1 dòng trống
      if (finalData.length === 0) {
        finalData = [dataMap.get(selectedDateString)!];
      }
    }

    return finalData;
  }, [payments, selectedMonth, selectedDay]);

  const summary = useMemo(() => {
    return tableData.reduce((acc, curr) => ({
      baseAmount: acc.baseAmount + curr.baseAmount,
      bonusAmount: acc.bonusAmount + curr.bonusAmount,
      penaltyAmount: acc.penaltyAmount + curr.penaltyAmount,
      advanceAmount: acc.advanceAmount + curr.advanceAmount,
      totalAmount: acc.totalAmount + curr.totalAmount,
    }), { baseAmount: 0, bonusAmount: 0, penaltyAmount: 0, advanceAmount: 0, totalAmount: 0 });
  }, [tableData]);

  const columns = [
    {
      title: 'Ngày',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (text: string) => <Text strong>{text}</Text>
    },
    {
      title: 'Lương nhận',
      dataIndex: 'baseAmount',
      key: 'baseAmount',
      render: (val: number) => <Text style={{ color: '#1890ff' }}>{formatCurrency(val)}</Text>
    },
    {
      title: 'Thưởng',
      dataIndex: 'bonusAmount',
      key: 'bonusAmount',
      render: (val: number) => <Text type="success">{formatCurrency(val)}</Text>
    },
    {
      title: 'Phạt',
      dataIndex: 'penaltyAmount',
      key: 'penaltyAmount',
      render: (val: number) => <Text type="danger">{formatCurrency(val)}</Text>
    },
    {
      title: 'Ứng tiền',
      dataIndex: 'advanceAmount',
      key: 'advanceAmount',
      render: (val: number) => <Text type="warning">{formatCurrency(val)}</Text>
    },
    {
      title: 'Tổng cộng',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (val: number) => <Text strong>{formatCurrency(val)}</Text>
    },
  ];

  return (
    <div style={{ padding: '0 0 24px 0' }}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <ProCard headerBordered>
          <div style={{ padding: '24px 0', textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <span
              onClick={() => {
                setSelectedMonth(prev => prev ? prev.subtract(1, 'month') : dayjs().subtract(1, 'month'));
                setSelectedDay(null);
              }}
              style={{
                cursor: 'pointer',
                padding: '8px 16px',
                background: '#f0f0f0',
                borderRadius: '8px',
                fontWeight: 'bold',
                userSelect: 'none'
              }}
            >
              &lt; Tháng trước
            </span>

            <Select
              value={selectedDay}
              onChange={(val) => setSelectedDay(val)}
              style={{ width: 120, height: 40 }}
              options={[
                { label: 'Cả tháng', value: null },
                ...Array.from({ length: selectedMonth?.daysInMonth() || 31 }, (_, i) => ({
                  label: `Ngày ${i + 1}`,
                  value: i + 1,
                }))
              ]}
            />

            <Select
              value={selectedMonth?.month()}
              onChange={(val) => setSelectedMonth(prev => prev ? prev.month(val) : dayjs().month(val))}
              style={{ width: 120, height: 40 }}
              options={Array.from({ length: 12 }, (_, i) => ({
                label: `Tháng ${i + 1}`,
                value: i,
              }))}
            />

            <Select
              value={selectedMonth?.year()}
              onChange={(val) => setSelectedMonth(prev => prev ? prev.year(val) : dayjs().year(val))}
              style={{ width: 120, height: 40 }}
              options={Array.from({ length: 10 }, (_, i) => ({
                label: `Năm ${dayjs().year() - 5 + i}`,
                value: dayjs().year() - 5 + i,
              }))}
            />

            {!(selectedMonth?.isSame(dayjs(), 'month')) && (
              <span
                onClick={() => {
                  setSelectedMonth(prev => prev ? prev.add(1, 'month') : dayjs().add(1, 'month'));
                  setSelectedDay(null);
                }}
                style={{
                  cursor: 'pointer',
                  padding: '8px 16px',
                  background: '#f0f0f0',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  userSelect: 'none'
                }}
              >
                Tháng sau &gt;
              </span>
            )}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 50 }}>
              <Spin size="large" />
            </div>
          ) : tableData.length === 0 ? (
            <Empty description="Không có phát sinh thanh toán trong tháng này" style={{ margin: '40px 0' }} />
          ) : (
            <div style={{ marginTop: 24 }}>
              <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={8} lg={4}>
                  <Card size="small" title="Tổng lương">
                    <Text strong style={{ fontSize: 18, paddingLeft: !screens.md ? 24 : 0, color: '#1890ff' }}>{formatCurrency(summary.baseAmount)}</Text>
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={4}>
                  <Card size="small" title="Tổng thưởng">
                    <Text strong style={{ fontSize: 18, paddingLeft: !screens.md ? 24 : 0 }} type="success">{formatCurrency(summary.bonusAmount)}</Text>
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={4}>
                  <Card size="small" title="Tổng phạt">
                    <Text strong style={{ fontSize: 18, paddingLeft: !screens.md ? 24 : 0 }} type="danger">{formatCurrency(summary.penaltyAmount)}</Text>
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={5}>
                  <Card size="small" title="Đã ứng">
                    <Text strong style={{ fontSize: 18, paddingLeft: !screens.md ? 24 : 0 }} type="warning">{formatCurrency(summary.advanceAmount)}</Text>
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={7}>
                  <Card size="small" title="Tổng tiền lương">
                    <Text strong style={{ fontSize: 24, paddingLeft: !screens.md ? 24 : 0 }}>{formatCurrency(summary.totalAmount)}</Text>
                  </Card>
                </Col>
              </Row>

              {/* <Table
                columns={columns}
                dataSource={tableData}
                pagination={false}
                bordered
                summary={() => (
                  <Table.Summary fixed>
                    <Table.Summary.Row style={{ background: '#fafafa' }}>
                      <Table.Summary.Cell index={0}><Text strong>TỔNG THÁNG</Text></Table.Summary.Cell>
                      <Table.Summary.Cell index={1}><Text strong style={{ color: '#1890ff' }}>{formatCurrency(summary.baseAmount)}</Text></Table.Summary.Cell>
                      <Table.Summary.Cell index={2}><Text strong type="success">{formatCurrency(summary.bonusAmount)}</Text></Table.Summary.Cell>
                      <Table.Summary.Cell index={3}><Text strong type="danger">{formatCurrency(summary.penaltyAmount)}</Text></Table.Summary.Cell>
                      <Table.Summary.Cell index={4}><Text strong type="warning">{formatCurrency(summary.advanceAmount)}</Text></Table.Summary.Cell>
                      <Table.Summary.Cell index={5}><Text strong>{formatCurrency(summary.totalAmount)}</Text></Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                )}
              /> */}
            </div>
          )}
        </ProCard>
      </Space>
    </div>
  );
};

export default IncomeStatisticsPage;
