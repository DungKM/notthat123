import React, { useRef, useState } from 'react';
import { Select, Tag, message, Typography, Space, Dropdown, Button, Popconfirm, Switch } from 'antd';
import { DeleteOutlined, DownOutlined, SettingOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable, ModalForm, ProFormText, ProFormTextArea, ProFormSwitch } from '@ant-design/pro-components';
import type { ProFormInstance } from '@ant-design/pro-components';
import { useApplicationService } from '@/src/api/services';

interface ApplicationItem {
  _id: string;
  id: string;
  position: string;
  fullName: string;
  phone: string;
  gender: string;
  address: string;
  age: number;
  experience: number;
  note: string;
  status: string;
  createdAt: string;
}

const STATUS_OPTIONS = [
  { label: 'Chờ xử lý', value: 'Chờ xử lý', color: 'default' },
  { label: 'Đã liên hệ', value: 'Đã liên hệ', color: 'processing' },
  { label: 'Từ chối', value: 'Từ chối', color: 'error' },
];

const RecruitmentManagementPage: React.FC = () => {
  const actionRef = useRef<ActionType>(null);
  const { request, remove } = useApplicationService();
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const infoFormRef = useRef<ProFormInstance>();

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await request('PATCH', `/${id}`, { status: newStatus });
      message.success('Cập nhật trạng thái thành công');
      actionRef.current?.reload();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await remove(id);
      message.success('Xóa hồ sơ thành công');
      actionRef.current?.reload();
    } catch (error) {
      console.error(error);
    }
  };

  const columns: ProColumns<ApplicationItem>[] = [
    {
      title: 'Thời gian nộp',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      sorter: true,
      width: 150,
    },
    {
      title: 'Vị trí ứng tuyển',
      dataIndex: 'position',
      width: 150,
    },
    {
      title: 'Họ và tên',
      dataIndex: 'fullName',
      copyable: true,
      width: 150,
      render: (_, record) => (
        <div>
          <div className="font-semibold">{record.fullName}</div>
          <div className="text-xs text-gray-500">{record.gender} • {record.age} tuổi</div>
        </div>
      ),
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      copyable: true,
      width: 120,
    },
    {
      title: 'Kinh nghiệm',
      dataIndex: 'experience',
      width: 120,
      renderText: (val) => `${val} năm`,
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      ellipsis: true,
      width: 200,
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      ellipsis: true,
      width: 200,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 160,
      filters: true,
      onFilter: true,
      valueEnum: STATUS_OPTIONS.reduce((acc, curr) => {
        acc[curr.value] = { text: curr.label, status: curr.color };
        return acc;
      }, {} as any),
      render: (_, record) => {
        const option = STATUS_OPTIONS.find((opt) => opt.value === record.status);
        if (!option) return <Tag color="default">{record.status}</Tag>;
        return <Tag color={option.color}>{option.label}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      valueType: 'option',
      width: 150,
      render: (_, record) => (
        <Space>
          <Dropdown
            menu={{
              items: STATUS_OPTIONS.map((opt) => ({
                key: opt.value,
                label: opt.label,
                disabled: record.status === opt.value,
              })),
              onClick: ({ key }) => handleStatusChange(record._id || record.id, key),
            }}
            trigger={['click']}
          >
            <Button type="link" size="small">
              Trạng thái <DownOutlined />
            </Button>
          </Dropdown>
          <Popconfirm
            title="Bạn chắc chắn muốn xóa hồ sơ này?"
            onConfirm={() => handleDelete(record._id || record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="link" size="large" danger icon={<DeleteOutlined />} title="Xóa" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="mb-6">
        <Typography.Title level={4} style={{ margin: 0 }}>
          Quản lý Hồ sơ ứng tuyển
        </Typography.Title>
        <Typography.Text type="secondary">
          Theo dõi và cập nhật trạng thái các ứng viên ứng tuyển từ Website
        </Typography.Text>
      </div>

      <ProTable<ApplicationItem>
        columns={columns}
        actionRef={actionRef}
        rowKey={(record) => record._id || record.id}
        search={false}
        scroll={{ x: 'max-content' }}
        toolBarRender={() => [
          <Button
            key="config"
            icon={<SettingOutlined />}
            type="primary"
            onClick={() => setInfoModalOpen(true)}
          >
            Cấu hình thông tin tuyển dụng
          </Button>,
        ]}
        request={async (params) => {
          try {
            const apiParams = {
              page: params.current || 1,
              limit: params.pageSize || 10,
            };
            const response = await request('GET', '', null, apiParams);

            return {
              data: response.data || [],
              success: true,
              total: response.meta?.total || 0,
            };
          } catch (error) {
            console.error(error);
            return {
              data: [],
              success: false,
              total: 0,
            };
          }
        }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
        }}
        dateFormatter="string"
        headerTitle="Danh sách ứng viên"
      />

      {/* Modal cấu hình thông tin tuyển dụng */}
      <ModalForm
        title="Cấu hình thông tin tuyển dụng"
        open={infoModalOpen}
        formRef={infoFormRef}
        width={640}
        modalProps={{ destroyOnClose: true }}
        onOpenChange={async (open) => {
          setInfoModalOpen(open);
          if (open) {
            try {
              const res: any = await request('GET', '/info');
              if (res?.data) {
                infoFormRef.current?.setFieldsValue({
                  title: res.data.title || '',
                  content: res.data.content || '',
                  position: res.data.position || '',
                  required: Array.isArray(res.data.required)
                    ? res.data.required.join('\n')
                    : res.data.required || '',
                  isActive: res.data.isActive ?? true,
                });
              }
            } catch {
              // Chưa có dữ liệu
            }
          }
        }}
        onFinish={async (values) => {
          try {
            const payload = {
              title: values.title,
              content: values.content,
              position: values.position,
              required: (values.required as string)
                .split('\n')
                .map((s: string) => s.trim())
                .filter(Boolean),
              isActive: values.isActive ?? true,
            };
            await request('PATCH', '/info', payload);
            message.success('Cập nhật thông tin tuyển dụng thành công!');
            setInfoModalOpen(false);
            return true;
          } catch {
            message.error('Cập nhật thất bại, vui lòng thử lại.');
            return false;
          }
        }}
      >
        <div style={{ padding: '12px 16px', background: '#f0f9ff', borderRadius: 8, marginBottom: 16, border: '1px solid #bae6fd', fontSize: 13, color: '#0369a1' }}>
          Thông tin này sẽ hiển thị trên trang tuyển dụng ngoài website khi bật <b>Hiển thị</b>.
        </div>

        <ProFormSwitch
          name="isActive"
          label="Hiển thị trang tuyển dụng"
          fieldProps={{ checkedChildren: 'Hiện', unCheckedChildren: 'Ẩn' }}
        />
        <ProFormText
          name="title"
          label="Tiêu đề"
          placeholder="VD: GIA NHẬP ĐỘI NGŨ HOCHI"
          rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
        />
        <ProFormText
          name="position"
          label="Vị trí ứng tuyển"
          placeholder="VD: Kiến trúc sư nội thất"
        />
        <ProFormTextArea
          name="content"
          label="Mô tả chung"
          placeholder="Mô tả ngắn về cơ hội nghề nghiệp..."
          fieldProps={{ autoSize: { minRows: 3, maxRows: 15 } }}
        />
        <ProFormTextArea
          name="required"
          label="Danh sách yêu cầu / quyền lợi"
          placeholder={"Mỗi dòng là một mục, ví dụ:\nQuy trình làm việc chuyên nghiệp.\nSử dụng vật liệu cao cấp."}
          fieldProps={{ autoSize: { minRows: 6, maxRows: 25 } }}
          extra="Mỗi dòng tương ứng một mục hiển thị (nhấn Enter để xuống dòng)."
        />
      </ModalForm>
    </div>
  );
};
export default RecruitmentManagementPage;