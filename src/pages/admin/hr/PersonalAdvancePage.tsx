import React, { useState, useRef } from 'react';
import {
  ProTable,
  ProColumns,
  ModalForm,
  ProFormDigit,
  ProFormTextArea,
  ProFormUploadButton as RawProFormUploadButton,
  ActionType
} from '@ant-design/pro-components';

// Workaround: ProFormUploadButton bị export sai type
const SafeUploadButton = RawProFormUploadButton as unknown as React.FC<any>;
import { AdvanceRequest, User } from '@/src/types';
import { MOCK_ADVANCE_REQUESTS } from '@/src/mockData';
import { Badge, Button, Tag, Space, Typography, Image } from 'antd';
import { PlusOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, FileImageOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { formatCurrency, formatDateTime } from '@/src/utils/format';
import { useAdvanceRequestService } from '@/src/api/services';

const { Text } = Typography;

interface PersonalAdvancePageProps {
  currentUser: User;
}

const PersonalAdvancePage: React.FC<PersonalAdvancePageProps> = ({ currentUser }) => {
  const { request: apiRequest } = useAdvanceRequestService();
  const actionRef = useRef<ActionType>(null);

  const columns: ProColumns<AdvanceRequest>[] = [
    {
      title: 'Ngày yêu cầu',
      dataIndex: 'requestDate',
      valueType: 'dateTime',
      hideInSearch: true,
      render: (val, record: any) => formatDateTime(String(record.createdAt || val)),
      width: 180,
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      render: (_, record: any) => (
        <Text strong style={{ color: '#1890ff' }}>
          {formatCurrency(Number(record.amount))}
        </Text>
      ),
      width: 150,
    },
    {
      title: 'Lý do',
      dataIndex: 'reason',
      ellipsis: true,
    },
    {
      title: 'Minh chứng',
      dataIndex: 'images',
      hideInSearch: true,
      render: (_, record: any) => {
        const images = record.images || [];
        const firstImg = images.length > 0 ? images[0].url : (record.transferProof || null);

        if (!firstImg) return '-';

        return (
          <Image.PreviewGroup>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <Image
                src={firstImg}
                width={40}
                height={40}
                style={{ borderRadius: 4, objectFit: 'cover' }}
              />
              {images.length > 1 && (
                <Badge count={images.length} size="small" style={{ position: 'absolute', top: -8, right: -8 }} />
              )}
              <div style={{ display: 'none' }}>
                {images.slice(1).map((img: any, idx: number) => (
                  <Image key={img.id || img._id || idx} src={img.url} />
                ))}
              </div>
            </div>
          </Image.PreviewGroup>
        );
      },
      width: 100,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      valueEnum: {
        'Chờ duyệt': { text: 'Chờ duyệt', status: 'Processing' },
        'Đã duyệt': { text: 'Đã duyệt', status: 'Success' },
        'Từ chối': { text: 'Từ chối', status: 'Error' },
      },
      render: (_, record) => {
        const config = {
          'Chờ duyệt': { color: 'orange', icon: <ClockCircleOutlined /> },
          'Đã duyệt': { color: 'green', icon: <CheckCircleOutlined /> },
          'Từ chối': { color: 'red', icon: <CloseCircleOutlined /> },
        };
        const item = config[record.status];
        return (
          <Tag color={item.color} icon={item.icon}>
            {record.status}
          </Tag>
        );
      },
      width: 120,
    },
    {
      title: 'Phản hồi/Ghi chú',
      dataIndex: 'note',
      ellipsis: true,
    }
  ];

  const handleCreateRequest = async (values: any) => {
    try {
      const formData = new FormData();
      formData.append('amount', String(values.amount));
      formData.append('reason', values.reason);

      if (values.image && values.image.length > 0) {
        values.image.forEach((file: any) => {
          if (file.originFileObj) {
            formData.append('images', file.originFileObj);
          }
        });
      }

      await apiRequest('POST', '', formData);
      actionRef.current?.reload();
      return true;
    } catch (e) {
      return false;
    }
  };

  return (
    <div style={{ padding: '0 0 24px 0' }}>
      <ProTable<AdvanceRequest>
        headerTitle="Lịch sử ứng tiền cá nhân"
        columns={columns}
        actionRef={actionRef}
        request={async (params) => {
          try {
            const queryParams: any = {
              page: params.current || 1,
              limit: params.pageSize || 10,
              employeeId: currentUser.id, // Lọc theo nhân viên hiện tại
            };
            const res = await apiRequest('GET', '', null, queryParams);
            return {
              data: res.data || [],
              success: true,
              total: res.meta?.total || 0,
            };
          } catch (e) {
            return { data: [], success: false, total: 0 };
          }
        }}
        rowKey="id"
        search={false}
        pagination={{ pageSize: 10 }}
        toolBarRender={() => [
          <ModalForm
            key="add"
            title="Tạo yêu cầu ứng tiền mới"
            trigger={
              <Button type="primary" icon={<PlusOutlined />}>
                Tạo yêu cầu
              </Button>
            }
            onFinish={handleCreateRequest}
            width={500}
            modalProps={{
              destroyOnClose: true,
            }}
          >
            <ProFormDigit
              label="Số tiền muốn ứng"
              name="amount"
              min={0}
              fieldProps={{
                formatter: (value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
                parser: (value) => value!.replace(/\$\s?|(,*)/g, ''),
                addonAfter: 'đ',
                style: { width: '100%' },
              }}
              rules={[{ required: true, message: 'Vui lòng nhập số tiền' }]}
            />
            <ProFormTextArea
              label="Lý do ứng tiền"
              name="reason"
              placeholder="Ví dụ: Ứng tiền mua vật tư gấp, ứng lương đợt 1..."
              rules={[{ required: true, message: 'Vui lòng nhập lý do' }]}
            />
            <SafeUploadButton
              label="Hình ảnh minh chứng (nếu có)"
              name="image"
              max={1}
              fieldProps={{
                listType: 'picture-card',
                accept: 'image/*',
              }}
              icon={<FileImageOutlined />}
            />
          </ModalForm>
        ]}
      />
    </div>
  );
};

export default PersonalAdvancePage;
