import React, { useState, useMemo } from 'react';
import { Row, Col, Statistic, Select, Typography, Space, Card } from 'antd';
import { ProCard } from '@ant-design/pro-components';
import { ArrowUpOutlined, ArrowDownOutlined, DollarOutlined, BankOutlined, TeamOutlined, RiseOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area, ComposedChart } from 'recharts';
import { Role } from '@/src/auth/types';
import { useAuth } from '@/src/auth/hooks/useAuth';

const { Title, Text } = Typography;

// Mock data generator
const generateData = (year: number) => {
  return Array.from({ length: 12 }).map((_, i) => {
    const month = i + 1;
    // Tweak to have some realistic looking trends
    const baseRevenue = 200000000 + (Math.random() * 100000000);
    const revenue = year === 2026 ? baseRevenue * 1.2 : baseRevenue;
    const salary = 80000000 + (Math.random() * 20000000); // Fixed base + variable
    const profit = revenue * (0.2 + (Math.random() * 0.1)); // 20-30% profit margin

    return {
      name: `T${month}/${year}`,
      month: `Tháng ${month}`,
      revenue: Math.round(revenue),
      profit: Math.round(profit),
      salary: Math.round(salary),
    };
  });
};

const historicalData: Record<string, any[]> = {
  '2026': generateData(2026),
  '2025': generateData(2025),
  '2024': generateData(2024),
};

const formatCurrency = (value: number) => {
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)} Tỷ`;
  }
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(0)} Tr`;
  }
  return value.toLocaleString('vi-VN');
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-100 rounded-xl shadow-xl">
        <p className="font-bold text-gray-800 mb-2 border-b pb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-6 mb-1">
            <span style={{ color: entry.color }} className="font-medium">
              {entry.name}:
            </span>
            <span className="font-bold text-gray-900">
              {entry.value.toLocaleString('vi-VN')} đ
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const isDirectorOrAccountant = user?.role === Role.DIRECTOR || user?.role === Role.ACCOUNTANT;
  const [selectedYear, setSelectedYear] = useState<string>('2026');

  const currentData = useMemo(() => historicalData[selectedYear] || [], [selectedYear]);

  // Tính tổng
  const totals = useMemo(() => {
    return currentData.reduce((acc, curr) => ({
      revenue: acc.revenue + curr.revenue,
      profit: acc.profit + curr.profit,
      salary: acc.salary + curr.salary,
    }), { revenue: 0, profit: 0, salary: 0 });
  }, [currentData]);

  return (
    <div className="space-y-6">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <div>
          <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 p-5 rounded-2xl h-full" style={{ boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03), 0 1px 6px -1px rgba(0,0,0,0.02), 0 2px 4px 0 rgba(0,0,0,0.02)' }}>
            <Statistic
              title={<span className="text-gray-500 font-semibold text-xs uppercase tracking-wider">Tổng Doanh Thu</span>}
              value={totals.revenue}
              precision={0}
              valueStyle={{ color: '#1677ff', fontWeight: 800, fontSize: '24px' }}
              prefix={<RiseOutlined className="mr-2" />}
              formatter={(val) => Number(val).toLocaleString('vi-VN')}
              suffix="₫"
            />
          </div>
        </div>
        <div>
          <div className="bg-gradient-to-br from-green-50 to-white border border-green-100 p-5 rounded-2xl h-full" style={{ boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03), 0 1px 6px -1px rgba(0,0,0,0.02), 0 2px 4px 0 rgba(0,0,0,0.02)' }}>
            <Statistic
              title={<span className="text-gray-500 font-semibold text-xs uppercase tracking-wider">Tổng Lợi Nhuận</span>}
              value={totals.profit}
              precision={0}
              valueStyle={{ color: '#3f8600', fontWeight: 800, fontSize: '24px' }}
              prefix={<BankOutlined className="mr-2" />}
              formatter={(val) => Number(val).toLocaleString('vi-VN')}
              suffix="₫"
            />
          </div>
        </div>
        <div>
          <div className="bg-gradient-to-br from-orange-50 to-white border border-orange-100 p-5 rounded-2xl h-full" style={{ boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03), 0 1px 6px -1px rgba(0,0,0,0.02), 0 2px 4px 0 rgba(0,0,0,0.02)' }}>
            <Statistic
              title={<span className="text-gray-500 font-semibold text-xs uppercase tracking-wider">Thanh toán nhân sự</span>}
              value={totals.salary}
              precision={0}
              valueStyle={{ color: '#fa8c16', fontWeight: 800, fontSize: '24px' }}
              prefix={<TeamOutlined className="mr-2" />}
              formatter={(val) => Number(val).toLocaleString('vi-VN')}
              suffix="₫"
            />
          </div>
        </div>
        <div>
          <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-100 p-5 rounded-2xl h-full" style={{ boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03), 0 1px 6px -1px rgba(0,0,0,0.02), 0 2px 4px 0 rgba(0,0,0,0.02)' }}>
            <Statistic
              title={<span className="text-gray-500 font-semibold text-xs uppercase tracking-wider">Số lượng nhân sự</span>}
              value={45}
              precision={0}
              valueStyle={{ color: '#722ed1', fontWeight: 800, fontSize: '24px' }}
              prefix={<TeamOutlined className="mr-2" />}
            />
          </div>
        </div>
        <div>
          <div className="bg-gradient-to-br from-cyan-50 to-white border border-cyan-100 p-5 rounded-2xl h-full" style={{ boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03), 0 1px 6px -1px rgba(0,0,0,0.02), 0 2px 4px 0 rgba(0,0,0,0.02)' }}>
            <Statistic
              title={<span className="text-gray-500 font-semibold text-xs uppercase tracking-wider">Dự án hiện có</span>}
              value={12}
              precision={0}
              valueStyle={{ color: '#13c2c2', fontWeight: 800, fontSize: '24px' }}
              formatter={(val) => Number(val).toLocaleString('vi-VN')}
            />
          </div>
        </div>
      </div>

      {isDirectorOrAccountant ? (
        <>
          <ProCard
            title={<span className="font-bold text-gray-800">Biểu đồ Doanh thu & Lợi nhuận hàng tháng</span>}
            headerBordered
            ghost
            className="bg-white"
            style={{ boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03), 0 1px 6px -1px rgba(0,0,0,0.02), 0 2px 4px 0 rgba(0,0,0,0.02)' }}
          >
            <div style={{ width: '100%', height: 400, marginTop: 16 }}>
              <ResponsiveContainer>
                <ComposedChart data={currentData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 13 }} dy={10} />
                  <YAxis
                    yAxisId="left"
                    tickFormatter={formatCurrency}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                    dx={-10}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar yAxisId="left" dataKey="revenue" name="Doanh thu" fill="#1677ff" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Line yAxisId="left" type="monotone" dataKey="profit" name="Lợi nhuận" stroke="#3f8600" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </ProCard>

          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <ProCard
                title={<span className="font-bold text-gray-800">Biểu đồ Thanh toán Nhân Viên</span>}
                headerBordered
                ghost
                className="bg-white h-full"
                style={{ boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03), 0 1px 6px -1px rgba(0,0,0,0.02), 0 2px 4px 0 rgba(0,0,0,0.02)' }}
              >
                <div style={{ width: '100%', height: 320, marginTop: 16 }}>
                  <ResponsiveContainer>
                    <AreaChart data={currentData} margin={{ top: 10, right: 10, bottom: 0, left: 10 }}>
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
                      <Area type="monotone" dataKey="salary" name="Thanh toán" stroke="#fa8c16" strokeWidth={3} fillOpacity={1} fill="url(#colorSalary)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </ProCard>
            </Col>

            <Col xs={24} lg={12}>
              <ProCard
                title={<span className="font-bold text-gray-800">Tỷ trọng Lợi nhuận trên Doanh thu</span>}
                headerBordered
                ghost
                className="bg-white h-full"
                style={{ boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03), 0 1px 6px -1px rgba(0,0,0,0.02), 0 2px 4px 0 rgba(0,0,0,0.02)' }}
              >
                <div style={{ width: '100%', height: 320, marginTop: 16 }}>
                  <ResponsiveContainer>
                    <LineChart data={currentData} margin={{ top: 10, right: 10, bottom: 0, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                      <YAxis
                        tickFormatter={(val) => `${val}%`}
                        axisLine={false}
                        tickLine={false}
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
                        dataKey={(row) => ((row.profit / row.revenue) * 100).toFixed(2)}
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
          <Typography.Text className="text-orange-800">Bạn không có quyền xem biểu đồ thống kê tài chính chi tiết. Vui lòng liên hệ Ban Giám Đốc.</Typography.Text>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
