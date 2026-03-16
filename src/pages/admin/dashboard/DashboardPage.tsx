import React from 'react';
import { Row, Col, Statistic } from 'antd';
import { ProCard } from '@ant-design/pro-components';
import { ArrowUpOutlined, ArrowDownOutlined, UserOutlined, ProjectOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Role } from '@/src/auth/types';
import { useAuth } from '@/src/auth/hooks/useAuth';

const data = [
  { name: 'Tháng 1', profit: 4000, cost: 2400 },
  { name: 'Tháng 2', profit: 3000, cost: 1398 },
  { name: 'Tháng 3', profit: 2000, cost: 9800 },
  { name: 'Tháng 4', profit: 2780, cost: 3908 },
  { name: 'Tháng 5', profit: 1890, cost: 4800 },
  { name: 'Tháng 6', profit: 2390, cost: 3800 },
];

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const isDirector = user?.role === Role.DIRECTOR;

  return (
    <div className="space-y-6">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <ProCard ghost style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)' }}>
            <Statistic
              title="Lợi nhuận"
              value={11.28}
              precision={2}
              valueStyle={{ color: '#3f8600' }}
              prefix={<ArrowUpOutlined />}
              suffix="%"
            />
          </ProCard>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <ProCard ghost style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)' }}>
            <Statistic
              title="Chi phí"
              value={9.3}
              precision={2}
              valueStyle={{ color: '#cf1322' }}
              prefix={<ArrowDownOutlined />}
              suffix="%"
            />
          </ProCard>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <ProCard ghost style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)' }}>
            <Statistic title="Dự án" value={12} prefix={<ProjectOutlined />} />
          </ProCard>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <ProCard ghost style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)' }}>
            <Statistic title="Nhân sự" value={45} prefix={<UserOutlined />} />
          </ProCard>
        </Col>
      </ Row>

      {isDirector && (
        <ProCard title="Biểu đồ lợi nhuận & Chi phí (Dành cho Giám đốc)" headerBordered ghost style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)' }}>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="profit" fill="#13EC5B" name="Lợi nhuận" />
                <Bar dataKey="cost" fill="#ff4d4f" name="Chi phí" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ProCard>
      )}

      <ProCard title="Xu hướng tăng trưởng" headerBordered ghost style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)' }}>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="profit" stroke="#13EC5B" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ProCard>
    </div>
  );
};

export default DashboardPage;
