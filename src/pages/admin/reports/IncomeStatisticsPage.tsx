import React, { useState, useEffect, useMemo } from 'react';
import { DatePicker, Spin, Typography, Space, Empty, Row, Col, Card, Grid, Button } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
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
const { RangePicker } = DatePicker;

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

  // Mặc định: từ đầu tháng hiện tại đến hôm nay
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().startOf('month'),
    dayjs(),
  ]);

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
    if (!payments.length || !dateRange) return [];

    const [startDate, endDate] = dateRange;

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

    // Tạo map các ngày trong khoảng chọn
    const dataMap = new Map<string, any>();
    let cursor = startDate.startOf('day');
    const end = endDate.startOf('day');
    while (cursor.isSameOrBefore(end, 'day')) {
      const key = cursor.format('DD/MM/YYYY');
      dataMap.set(key, {
        key,
        name: key,
        baseAmount: 0,
        bonusAmount: 0,
        penaltyAmount: 0,
        advanceAmount: 0,
        totalAmount: 0,
      });
      cursor = cursor.add(1, 'day');
    }

    // Điền dữ liệu vào các ngày
    payments.forEach((p) => {
      const parsed = parsePayment(p);
      if (
        parsed.date.isSameOrAfter(startDate, 'day') &&
        parsed.date.isSameOrBefore(endDate, 'day')
      ) {
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

    // Chỉ hiển thị những ngày có phát sinh
    return Array.from(dataMap.values()).filter((item) => item.totalAmount > 0);
  }, [payments, dateRange]);

  const summary = useMemo(() => {
    return tableData.reduce(
      (acc, curr) => ({
        baseAmount: acc.baseAmount + curr.baseAmount,
        bonusAmount: acc.bonusAmount + curr.bonusAmount,
        penaltyAmount: acc.penaltyAmount + curr.penaltyAmount,
        advanceAmount: acc.advanceAmount + curr.advanceAmount,
        totalAmount: acc.totalAmount + curr.totalAmount,
      }),
      { baseAmount: 0, bonusAmount: 0, penaltyAmount: 0, advanceAmount: 0, totalAmount: 0 }
    );
  }, [tableData]);

  // Các preset nhanh
  const presets: { label: string; value: [Dayjs, Dayjs] }[] = [
    { label: 'Hôm nay', value: [dayjs(), dayjs()] },
    { label: 'Tuần này', value: [dayjs().startOf('isoWeek'), dayjs().endOf('isoWeek')] },
    { label: 'Tháng này', value: [dayjs().startOf('month'), dayjs().endOf('month')] },
    { label: 'Tháng trước', value: [dayjs().subtract(1, 'month').startOf('month'), dayjs().subtract(1, 'month').endOf('month')] },
    { label: '3 tháng gần đây', value: [dayjs().subtract(2, 'month').startOf('month'), dayjs().endOf('month')] },
  ];

  return (
    <div style={{ padding: '0 0 24px 0' }}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <ProCard headerBordered>
          {/* Bộ lọc khoảng ngày */}
          <div
            style={{
              padding: '20px 0',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <Text strong style={{ fontSize: 14 }}>Chọn khoảng thời gian:</Text>
            <RangePicker
              value={dateRange}
              onChange={(vals) => {
                if (vals && vals[0] && vals[1]) {
                  setDateRange([vals[0], vals[1]]);
                }
              }}
              format="DD/MM/YYYY"
              allowClear={false}
              presets={presets}
              style={{ height: 40, minWidth: screens.md ? 280 : '100%' }}
              placeholder={['Từ ngày', 'Đến ngày']}
            />
          </div>

          {/* Hiển thị khoảng chọn */}
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Đang xem: <Text strong>{dateRange[0].format('DD/MM/YYYY')}</Text> → <Text strong>{dateRange[1].format('DD/MM/YYYY')}</Text>
            </Text>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 50 }}>
              <Spin size="large" />
            </div>
          ) : tableData.length === 0 ? (
            <Empty description="Không có phát sinh thanh toán trong khoảng thời gian này" style={{ margin: '40px 0' }} />
          ) : (
            <div style={{ marginTop: 24 }}>
              <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={8} lg={4}>
                  <Card size="small" title="Tổng lương">
                    <Text strong style={{ fontSize: 18, paddingLeft: !screens.md ? 24 : 0, color: '#1890ff' }}>
                      {formatCurrency(summary.baseAmount)}
                    </Text>
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={4}>
                  <Card size="small" title="Tổng thưởng">
                    <Text strong style={{ fontSize: 18, paddingLeft: !screens.md ? 24 : 0 }} type="success">
                      {formatCurrency(summary.bonusAmount)}
                    </Text>
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={4}>
                  <Card size="small" title="Tổng phạt">
                    <Text strong style={{ fontSize: 18, paddingLeft: !screens.md ? 24 : 0 }} type="danger">
                      {formatCurrency(summary.penaltyAmount)}
                    </Text>
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={5}>
                  <Card size="small" title="Đã ứng">
                    <Text strong style={{ fontSize: 18, paddingLeft: !screens.md ? 24 : 0 }} type="warning">
                      {formatCurrency(summary.advanceAmount)}
                    </Text>
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={7}>
                  <Card size="small" title="Tổng tiền lương">
                    <Text strong style={{ fontSize: 24, paddingLeft: !screens.md ? 24 : 0 }}>
                      {formatCurrency(summary.totalAmount)}
                    </Text>
                  </Card>
                </Col>
              </Row>
            </div>
          )}
        </ProCard>
      </Space>
    </div>
  );
};

export default IncomeStatisticsPage;
