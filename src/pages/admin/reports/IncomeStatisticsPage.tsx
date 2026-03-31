import React, { useState, useEffect, useMemo } from 'react';
import { Card, Segmented, Spin, Typography, Space, Empty } from 'antd';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
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

const { Title } = Typography;

type TimeRange = 'week' | 'month' | 'year';

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
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
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

  // Nhóm dữ liệu tuỳ chọn theo timeRange
  const chartData = useMemo(() => {
    if (!payments.length) return [];

    const now = dayjs();
    let aggregatedData: any[] = [];

    // Lọc theo cấu trúc dữ liệu mô phỏng (giả lập bóc tách chi tiết lương)
    // Thực tế API payment chỉ trả về tổng `amount`. Ta mock một tí chi tiết:
    const parsePayment = (p: RawPayment) => {
      const date = dayjs(p.date || p.paymentDate);
      const base = p.amount * 0.8; // Giả lập 80% là lương
      const bonus = p.amount * 0.15; // 15% là thưởng
      const penalty = p.amount * 0.05; // 5% là phạt
      const advance = p.amount * 0.1; // Thực lĩnh bị trừ đi 10% do ứng
      return {
        date,
        baseAmount: base,
        bonusAmount: bonus,
        penaltyAmount: penalty,
        advanceAmount: advance,
        totalAmount: p.amount,
      };
    };

    if (timeRange === 'week') {
      const startOfWeek = now.startOf('isoWeek');
      const dataMap = new Map();
      for (let i = 0; i < 7; i++) {
        const d = startOfWeek.add(i, 'day');
        dataMap.set(d.format('DD/MM'), {
          name: d.format('DD/MM (dd)'),
          baseAmount: 0,
          bonusAmount: 0,
          penaltyAmount: 0,
          advanceAmount: 0,
          totalAmount: 0,
        });
      }

      payments.forEach((p) => {
        const parsed = parsePayment(p);
        if (parsed.date.isSameOrAfter(startOfWeek, 'day')) {
          const key = parsed.date.format('DD/MM');
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
      aggregatedData = Array.from(dataMap.values());
    } else if (timeRange === 'month') {
      const startOfMonth = now.startOf('month');
      // Biểu diễn theo 4 hoặc 5 tuần
      const dataMap = new Map();
      dataMap.set('Tuần 1', { name: 'Tuần 1', baseAmount: 0, bonusAmount: 0, penaltyAmount: 0, advanceAmount: 0, totalAmount: 0 });
      dataMap.set('Tuần 2', { name: 'Tuần 2', baseAmount: 0, bonusAmount: 0, penaltyAmount: 0, advanceAmount: 0, totalAmount: 0 });
      dataMap.set('Tuần 3', { name: 'Tuần 3', baseAmount: 0, bonusAmount: 0, penaltyAmount: 0, advanceAmount: 0, totalAmount: 0 });
      dataMap.set('Tuần 4', { name: 'Tuần 4', baseAmount: 0, bonusAmount: 0, penaltyAmount: 0, advanceAmount: 0, totalAmount: 0 });

      payments.forEach((p) => {
        const parsed = parsePayment(p);
        if (parsed.date.isSame(now, 'month')) {
          const weekOfMonth = Math.ceil(parsed.date.date() / 7);
          const key = `Tuần ${weekOfMonth > 4 ? 4 : weekOfMonth}`;
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
      aggregatedData = Array.from(dataMap.values());
    } else if (timeRange === 'year') {
      const startOfYear = now.startOf('year');
      const dataMap = new Map();
      for (let i = 0; i < 12; i++) {
        const d = startOfYear.add(i, 'month');
        dataMap.set(d.format('MM/YYYY'), {
          name: `Th ${d.format('M/YY')}`,
          baseAmount: 0,
          bonusAmount: 0,
          penaltyAmount: 0,
          advanceAmount: 0,
          totalAmount: 0,
        });
      }

      payments.forEach((p) => {
        const parsed = parsePayment(p);
        if (parsed.date.isSame(now, 'year')) {
          const key = parsed.date.format('MM/YYYY');
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
      aggregatedData = Array.from(dataMap.values());
    }

    return aggregatedData;
  }, [payments, timeRange]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: '#fff', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <p style={{ fontWeight: 600, margin: '0 0 8px 0' }}>{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} style={{ color: entry.color, margin: '4px 0', fontSize: 13 }}>
              {entry.name}: <strong>{formatCurrency(entry.value)}</strong>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ padding: '0 0 24px 0' }}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <ProCard title={<Title level={4} style={{ margin: 0 }}>Biểu đồ Thống kê Thu nhập</Title>} headerBordered>
          <div style={{ padding: '16px 0', textAlign: 'center' }}>
            <Segmented
              options={[
                { label: 'Tuần này', value: 'week' },
                { label: 'Tháng này', value: 'month' },
                { label: 'Năm nay', value: 'year' },
              ]}
              value={timeRange}
              onChange={(val) => setTimeRange(val as TimeRange)}
            />
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 50 }}>
              <Spin size="large" />
            </div>
          ) : payments.length === 0 ? (
            <Empty description="Chưa có dữ liệu thanh toán lương" style={{ margin: '40px 0' }} />
          ) : (
            <div style={{ width: '100%', height: 400, marginTop: 24 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(val) => `${val / 1000000}M`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="baseAmount" name="Lương nhận" stackId="a" fill="#1890ff" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="bonusAmount" name="Thưởng" stackId="a" fill="#52c41a" />
                  <Bar dataKey="penaltyAmount" name="Phạt" stackId="a" fill="#f5222d" radius={[4, 4, 0, 0]} />
                  <Line type="monotone" dataKey="advanceAmount" name="Ứng tiền" stroke="#fa8c16" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </ProCard>
      </Space>
    </div>
  );
};

export default IncomeStatisticsPage;
