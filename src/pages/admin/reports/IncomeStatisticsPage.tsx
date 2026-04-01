import React, { useState, useEffect } from 'react';
import { Button, DatePicker, Spin, Typography, Space, Empty, Row, Col, Card, Grid } from 'antd';
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

  const isMobile = !screens.md;

  return (
    <div style={{ padding: '0 0 24px 0' }}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <ProCard headerBordered>
          {/* Bộ lọc khoảng ngày */}
          <div
            style={{
              padding: isMobile ? '16px 0 8px' : '20px 0',
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: isMobile ? 'flex-start' : 'center',
              alignItems: isMobile ? 'stretch' : 'center',
              gap: isMobile ? 10 : 12,
            }}
          >
            <Text strong style={{ fontSize: 14, textAlign: isMobile ? 'left' : 'center' }}>
              Chọn khoảng thời gian:
            </Text>

            {isMobile ? (
              /* Mobile: 2 DatePicker riêng biệt, full width */
              <Row gutter={[8, 8]}>
                <Col xs={24}>
                  <DatePicker
                    value={dateRange[0]}
                    onChange={(val) => {
                      if (val) setDateRange([val, dateRange[1]]);
                    }}
                    format="DD/MM/YYYY"
                    allowClear={false}
                    placeholder="Từ ngày"
                    style={{ width: '100%', height: 40 }}
                    disabledDate={(d) => d.isAfter(dateRange[1])}
                  />
                </Col>
                <Col xs={24}>
                  <DatePicker
                    value={dateRange[1]}
                    onChange={(val) => {
                      if (val) setDateRange([dateRange[0], val]);
                    }}
                    format="DD/MM/YYYY"
                    allowClear={false}
                    placeholder="Đến ngày"
                    style={{ width: '100%', height: 40 }}
                    disabledDate={(d) => d.isBefore(dateRange[0])}
                  />
                </Col>
                {/* Preset nhanh cho mobile */}
                <Col xs={24}>
                  <Row gutter={[6, 6]}>
                    {presets.map((p) => (
                      <Col key={p.label}>
                        <Button
                          size="small"
                          type={
                            dateRange[0].isSame(p.value[0], 'day') &&
                            dateRange[1].isSame(p.value[1], 'day')
                              ? 'primary'
                              : 'default'
                          }
                          onClick={() => setDateRange(p.value)}
                          style={{ borderRadius: 16, whiteSpace: 'nowrap', height: 28 }}
                        >
                          {p.label}
                        </Button>
                      </Col>
                    ))}
                  </Row>
                </Col>
              </Row>
            ) : (
              /* Desktop: giữ nguyên RangePicker */
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
                style={{ height: 40, minWidth: 280 }}
                placeholder={['Từ ngày', 'Đến ngày']}
              />
            )}
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
