import React, { useRef, useState } from 'react';
import { Button, Tag, message } from 'antd';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ModalForm, ProFormSelect, ProFormText, ProTable } from '@ant-design/pro-components';

interface RecruitmentItem {
  id: string;
  position: string;
  department: string;
  quantity: number;
  status: 'OPENING' | 'CLOSED';
}

const mockRecruitments: RecruitmentItem[] = [
  { id: '1', position: 'Nhân viên kinh doanh', department: 'Kinh doanh', quantity: 3, status: 'OPENING' },
  { id: '2', position: 'Kế toán tổng hợp', department: 'Kế toán', quantity: 1, status: 'CLOSED' },
];

const RecruitmentManagementPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [data, setData] = useState<RecruitmentItem[]>(mockRecruitments);
  const [open, setOpen] = useState(false);

  const columns: ProColumns<RecruitmentItem>[] = [
    { title: 'Vị trí tuyển dụng', dataIndex: 'position' },
    { title: 'Phòng ban', dataIndex: 'department' },
    { title: 'Số lượng', dataIndex: 'quantity' },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (_, record) =>
        record.status === 'OPENING' ? <Tag color="green">Đang tuyển</Tag> : <Tag color="red">Đã đóng</Tag>,
    },
  ];

  return (
    <>
      <ProTable<RecruitmentItem>
        columns={columns}
        actionRef={actionRef}
        rowKey="id"
        headerTitle="Quản lý tuyển dụng"
        request={async () => ({ data, success: true })}
        toolBarRender={() => [
          <Button key="create" type="primary" onClick={() => setOpen(true)}>
            Thêm tin tuyển dụng
          </Button>,
        ]}
      />

      <ModalForm
        title="Thêm tuyển dụng"
        open={open}
        modalProps={{ destroyOnClose: true, onCancel: () => setOpen(false) }}
        onFinish={async (values) => {
          setData((prev) => [
            {
              id: Date.now().toString(),
              position: values.position,
              department: values.department,
              quantity: Number(values.quantity),
              status: values.status,
            },
            ...prev,
          ]);
          message.success('Tạo tin tuyển dụng thành công');
          setOpen(false);
          actionRef.current?.reload();
          return true;
        }}
      >
        <ProFormText name="position" label="Vị trí" rules={[{ required: true }]} />
        <ProFormText name="department" label="Phòng ban" rules={[{ required: true }]} />
        <ProFormText name="quantity" label="Số lượng tuyển" rules={[{ required: true }]} />
        <ProFormSelect
          name="status"
          label="Trạng thái"
          rules={[{ required: true }]}
          options={[
            { label: 'Đang tuyển', value: 'OPENING' },
            { label: 'Đã đóng', value: 'CLOSED' },
          ]}
        />
      </ModalForm>
    </>
  );
};

export default RecruitmentManagementPage;