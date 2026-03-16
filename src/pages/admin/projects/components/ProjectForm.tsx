import React from 'react';
import {
  ModalForm,
  ProFormText,
  ProFormSelect,
} from '@ant-design/pro-components';
import { Role } from '@/src/auth/types';
import { mockUsers } from '@/src/auth/mockUsers';

interface ProjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFinish: (values: any) => Promise<boolean>;
  initialValues?: any;
  title: string;
  role: Role;
}

const ProjectForm: React.FC<ProjectFormProps> = ({
  open,
  onOpenChange,
  onFinish,
  initialValues,
  title,
  role,
}) => {
  const isSiteManager = role === Role.SITE_MANAGER;

  const managerOptions = mockUsers
    .filter(u => u.role === Role.SITE_MANAGER || u.role === Role.STAFF)
    .map(u => ({ label: u.name, value: u.id }));

  return (
    <ModalForm
      title={title}
      open={open}
      onOpenChange={onOpenChange}
      onFinish={onFinish}
      initialValues={initialValues}
      modalProps={{ destroyOnClose: true }}
    >
      <ProFormText
        name="name"
        label="Tên dự án"
        rules={[{ required: true }]}
      />
      <ProFormText
        name="address"
        label="Địa chỉ"
        rules={[{ required: true }]}
      />
      <ProFormText
        name="ownerName"
        label="Chủ nhà"
        rules={[{ required: true }]}
      />
      <ProFormText
        name="ownerPhone"
        label="Số điện thoại"
        rules={[{ required: true }]}
      />
      <ProFormText
        name="estimatedTime"
        label="Ước lượng thời gian hoàn thành"
        rules={[{ required: true }]}
      />

      {/* Ẩn các trường chỉnh sửa cao cấp với Công trình */}
      {!isSiteManager && (
        <>

          <ProFormSelect
            name="status"
            label="Trạng thái"
            options={['Chờ duyệt', 'Duyệt']}
            initialValue="Chờ duyệt"
          />
        </>
      )}
    </ModalForm>
  );
};

export default ProjectForm;
