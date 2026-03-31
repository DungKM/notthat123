import React, { useState, useEffect } from 'react';
import { DatePicker, Spin, Typography, Space, Empty, Row, Col, Card, Grid } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

import { useAuth } from '@/src/auth/hooks/useAuth';
import { useStatsService } from '@/src/api/services';
import { formatCurrency } from '@/src/utils/format';
import { ProCard } from '@ant-design/pro-components';

dayjs.extend(isoWeek);

const { Text } = Typography;
const { RangePicker } = DatePicker;

interface StatsSummary {
  totalSalary: number;
  totalBonus: number;
  totalPenalty: number;
  totalAdvance: number;
  totalTotal: number;
  startDate?: string;
  endDate?: string;
}

const IncomeStatisticsPage: React.FC = () => {
  const screens = Grid.useBreakpoint();

  // Mặc định: từ đầu tháng hiện tại đến hôm nay
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().startOf('month'),
    dayjs(),
  ]);

  const [stats, setStats] = useState<StatsSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { request } = useStatsService();

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const startDate = dateRange[0].format('YYYY-MM-DD');
    const endDate = dateRange[1].format('YYYY-MM-DD');
    request('GET', `/my-stats?startDate=${startDate}&endDate=${endDate}`)
      .then((res: any) => {
        if (res.success && res.data) {
          setStats(res.data);
        }
      })
      .catch((err: any) => {
        console.error('Lỗi lấy thống kê lương:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user, dateRange]);

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
          ) : !stats ? (
            <Empty description="Không có dữ liệu thống kê trong khoảng thời gian này" style={{ margin: '40px 0' }} />
          ) : (
            <div style={{ marginTop: 24 }}>
              <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={8} lg={4}>
                  <Card size="small" title="Tổng lương">
                    <Text strong style={{ fontSize: 18, paddingLeft: !screens.md ? 24 : 0, color: '#1890ff' }}>
                      {formatCurrency(stats.totalSalary)}
                    </Text>
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={4}>
                  <Card size="small" title="Tổng thưởng">
                    <Text strong style={{ fontSize: 18, paddingLeft: !screens.md ? 24 : 0 }} type="success">
                      {formatCurrency(stats.totalBonus)}
                    </Text>
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={4}>
                  <Card size="small" title="Tổng phạt">
                    <Text strong style={{ fontSize: 18, paddingLeft: !screens.md ? 24 : 0 }} type="danger">
                      {formatCurrency(stats.totalPenalty)}
                    </Text>
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={5}>
                  <Card size="small" title="Đã ứng">
                    <Text strong style={{ fontSize: 18, paddingLeft: !screens.md ? 24 : 0 }} type="warning">
                      {formatCurrency(stats.totalAdvance)}
                    </Text>
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={7}>
                  <Card size="small" title="Tổng tiền thực nhận">
                    <Text strong style={{ fontSize: 24, paddingLeft: !screens.md ? 24 : 0 }}>
                      {formatCurrency(stats.totalTotal)}
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
