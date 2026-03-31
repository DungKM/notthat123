import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Statistic, Select, Typography, Spin } from 'antd';
import { ProCard } from '@ant-design/pro-components';
import { BankOutlined, TeamOutlined, RiseOutlined } from '@ant-design/icons';
import {
  Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Line, AreaChart, Area, LineChart, ComposedChart,
} from 'recharts';
import { Role } from '@/src/auth/types';
import { useAuth } from '@/src/auth/hooks/useAuth';
import { useStatsService } from '@/src/api/services';

const { Text } = Typography;

/** ─── Helpers ─────────────────────────────── */
const formatCurrency = (value: number) => {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)} Tỷ`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)} Tr`;
  return value.toLocaleString('vi-VN');
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-100 rounded-xl shadow-xl">
        <p className="font-bold text-gray-800 mb-2 border-b pb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-6 mb-1">
            <span style={{ color: entry.color }} className="font-medium">{entry.name}:</span>
            <span className="font-bold text-gray-900">
              {Number(entry.value).toLocaleString('vi-VN')} đ
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

/** ─── Types ───────────────────────────────── */
interface OverviewSummary {
  totalRevenue: number;
  totalProfit: number;
  totalStaffPayment: number;
  staffCount: number;
  projectCount: number;
}

interface MonthlyItem {
  month: string;
  revenue: number;
  profit: number;
  staffPayment: number;
  profitMargin: number;
}

/** ─── Component ───────────────────────────── */
const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const isDirectorOrAccountant = user?.role === Role.DIRECTOR || user?.role === Role.ACCOUNTANT;
  const [selectedYear, setSelectedYear] = useState<string>(String(new Date().getFullYear()));

  const { request } = useStatsService();
  const [summary, setSummary] = useState<OverviewSummary | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOverview = useCallback(async (year: string) => {
    setLoading(true);
    try {
      const res: any = await request('GET', `/overview?year=${year}`);
      if (res?.success && res?.data) {
        setSummary(res.data.summary);
        setMonthlyData(res.data.monthlyData ?? []);
      }
    } catch (err) {
      console.error('Lỗi lấy thống kê tổng quan:', err);
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => {
    fetchOverview(selectedYear);
  }, [selectedYear, fetchOverview]);

  return (
    <div className="space-y-6">
      {/* ── Header / Year picker ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div className="flex items-center gap-3">
          <Text className="font-medium text-gray-600">Năm thống kê:</Text>
          <Select
            value={selectedYear}
            onChange={setSelectedYear}
            options={[
              { value: '2026', label: 'Năm 2026' },
              { value: '2025', label: 'Năm 2025' },
              { value: '2024', label: 'Năm 2024' },
            ]}
            className="w-32 shadow-sm"
            size="large"
          />
        </div>
      </div>

      {/* ── Summary cards ── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {/* Doanh thu */}
            <div>
              <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 p-5 rounded-2xl h-full"
                style={{ boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03),0 1px 6px -1px rgba(0,0,0,0.02),0 2px 4px 0 rgba(0,0,0,0.02)' }}>
                <Statistic
                  title={<span className="text-gray-500 font-semibold text-xs uppercase tracking-wider">Tổng Doanh Thu</span>}
                  value={summary?.totalRevenue ?? 0}
                  valueStyle={{ color: '#1677ff', fontWeight: 800, fontSize: '24px' }}
                  prefix={<RiseOutlined className="mr-2" />}
                  formatter={(val) => Number(val).toLocaleString('vi-VN')}
                  suffix="₫"
                />
              </div>
            </div>

            {/* Lợi nhuận */}
            <div>
              <div className="bg-gradient-to-br from-green-50 to-white border border-green-100 p-5 rounded-2xl h-full"
                style={{ boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03),0 1px 6px -1px rgba(0,0,0,0.02),0 2px 4px 0 rgba(0,0,0,0.02)' }}>
                <Statistic
                  title={<span className="text-gray-500 font-semibold text-xs uppercase tracking-wider">Tổng Lợi Nhuận</span>}
                  value={summary?.totalProfit ?? 0}
                  valueStyle={{ color: '#3f8600', fontWeight: 800, fontSize: '24px' }}
                  prefix={<BankOutlined className="mr-2" />}
                  formatter={(val) => Number(val).toLocaleString('vi-VN')}
                  suffix="₫"
                />
              </div>
            </div>

            {/* Nhân sự */}
            <div>
              <div className="bg-gradient-to-br from-orange-50 to-white border border-orange-100 p-5 rounded-2xl h-full"
                style={{ boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03),0 1px 6px -1px rgba(0,0,0,0.02),0 2px 4px 0 rgba(0,0,0,0.02)' }}>
                <Statistic
                  title={<span className="text-gray-500 font-semibold text-xs uppercase tracking-wider">Thanh toán nhân sự</span>}
                  value={summary?.totalStaffPayment ?? 0}
                  valueStyle={{ color: '#fa8c16', fontWeight: 800, fontSize: '24px' }}
                  prefix={<TeamOutlined className="mr-2" />}
                  formatter={(val) => Number(val).toLocaleString('vi-VN')}
                  suffix="₫"
                />
              </div>
            </div>

            {/* Số nhân sự */}
            <div>
              <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-100 p-5 rounded-2xl h-full"
                style={{ boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03),0 1px 6px -1px rgba(0,0,0,0.02),0 2px 4px 0 rgba(0,0,0,0.02)' }}>
                <Statistic
                  title={<span className="text-gray-500 font-semibold text-xs uppercase tracking-wider">Số lượng nhân sự</span>}
                  value={summary?.staffCount ?? 0}
                  valueStyle={{ color: '#722ed1', fontWeight: 800, fontSize: '24px' }}
                  prefix={<TeamOutlined className="mr-2" />}
                />
              </div>
            </div>

            {/* Dự án */}
            <div>
              <div className="bg-gradient-to-br from-cyan-50 to-white border border-cyan-100 p-5 rounded-2xl h-full"
                style={{ boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03),0 1px 6px -1px rgba(0,0,0,0.02),0 2px 4px 0 rgba(0,0,0,0.02)' }}>
                <Statistic
                  title={<span className="text-gray-500 font-semibold text-xs uppercase tracking-wider">Dự án hiện có</span>}
                  value={summary?.projectCount ?? 0}
                  valueStyle={{ color: '#13c2c2', fontWeight: 800, fontSize: '24px' }}
                  formatter={(val) => Number(val).toLocaleString('vi-VN')}
                />
              </div>
            </div>
          </div>

          {/* ── Charts (chỉ Giám đốc & Kế toán) ── */}
          {isDirectorOrAccountant ? (
            <>
              {/* Doanh thu & Lợi nhuận */}
              <ProCard
                title={<span className="font-bold text-gray-800">Biểu đồ Doanh thu &amp; Lợi nhuận hàng tháng</span>}
                headerBordered ghost className="bg-white"
                style={{ boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03),0 1px 6px -1px rgba(0,0,0,0.02),0 2px 4px 0 rgba(0,0,0,0.02)' }}
              >
                <div style={{ width: '100%', height: 400, marginTop: 16 }}>
                  <ResponsiveContainer>
                    <ComposedChart data={monthlyData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 13 }} dy={10} />
                      <YAxis yAxisId="left" tickFormatter={formatCurrency} axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dx={-10} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ paddingTop: '20px' }} />
                      <Bar yAxisId="left" dataKey="revenue" name="Doanh thu" fill="#1677ff" radius={[4, 4, 0, 0]} maxBarSize={40} />
                      <Line yAxisId="left" type="monotone" dataKey="profit" name="Lợi nhuận" stroke="#3f8600" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </ProCard>

              <Row gutter={[16, 16]}>
                {/* Thanh toán nhân viên */}
                <Col xs={24} lg={12}>
                  <ProCard
                    title={<span className="font-bold text-gray-800">Biểu đồ Thanh toán Nhân Viên</span>}
                    headerBordered ghost className="bg-white h-full"
                    style={{ boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03),0 1px 6px -1px rgba(0,0,0,0.02),0 2px 4px 0 rgba(0,0,0,0.02)' }}
                  >
                    <div style={{ width: '100%', height: 320, marginTop: 16 }}>
                      <ResponsiveContainer>
                        <AreaChart data={monthlyData} margin={{ top: 10, right: 10, bottom: 0, left: 10 }}>
                          <defs>
                            <linearGradient id="colorSalary" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#fa8c16" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#fa8c16" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                          <YAxis tickFormatter={formatCurrency} axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend wrapperStyle={{ paddingTop: '20px' }} />
                          <Area type="monotone" dataKey="staffPayment" name="Thanh toán" stroke="#fa8c16" strokeWidth={3} fillOpacity={1} fill="url(#colorSalary)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </ProCard>
                </Col>

                {/* Tỷ suất lợi nhuận */}
                <Col xs={24} lg={12}>
                  <ProCard
                    title={<span className="font-bold text-gray-800">Tỷ trọng Lợi nhuận trên Doanh thu</span>}
                    headerBordered ghost className="bg-white h-full"
                    style={{ boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03),0 1px 6px -1px rgba(0,0,0,0.02),0 2px 4px 0 rgba(0,0,0,0.02)' }}
                  >
                    <div style={{ width: '100%', height: 320, marginTop: 16 }}>
                      <ResponsiveContainer>
                        <LineChart data={monthlyData} margin={{ top: 10, right: 10, bottom: 0, left: 10 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                          <YAxis
                            tickFormatter={(val) => `${val}%`}
                            axisLine={false} tickLine={false}
                            domain={[0, 100]}
                            tick={{ fill: '#6B7280', fontSize: 11 }}
                          />
                          <Tooltip
                            content={({ active, payload, label }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="bg-white p-3 border border-gray-100 rounded-lg shadow-lg">
                                    <p className="font-bold text-gray-800 mb-1">{label}</p>
                                    <p className="text-[#8b5cf6] font-semibold">
                                      Tỷ suất: {Number(payload[0].value).toFixed(2)}%
                                    </p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Legend wrapperStyle={{ paddingTop: '20px' }} />
                          <Line
                            type="monotone"
                            dataKey="profitMargin"
                            name="Tỷ suất lợi nhuận (%)"
                            stroke="#8b5cf6"
                            strokeWidth={3}
                            dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </ProCard>
                </Col>
              </Row>
            </>
          ) : (
            <div className="bg-orange-50 p-6 rounded-xl border border-orange-100 text-center">
              <Typography.Title level={4} className="!text-orange-600 !mb-2">Hạn chế quyền truy cập</Typography.Title>
              <Typography.Text className="text-orange-800">
                Bạn không có quyền xem biểu đồ thống kê tài chính chi tiết. Vui lòng liên hệ Ban Giám Đốc.
              </Typography.Text>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DashboardPage;
