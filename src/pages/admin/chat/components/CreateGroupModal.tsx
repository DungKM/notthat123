import React from 'react';
import { Modal, Form, Input, Select } from 'antd';
import { User } from '@/src/auth/types';
import { useAuth } from '@/src/auth/hooks/useAuth';

const roleLabels: Record<string, string> = {
  DIRECTOR: 'Giám đốc',
  ACCOUNTANT: 'Kế toán',
  STAFF: 'Nhân viên',
  SITE_MANAGER: 'Quản lý công trình',
  CUSTOMER: 'Khách hàng',
};

interface CreateGroupModalProps {
    open: boolean;
    onCancel: () => void;
    onCreate: (name: string, members: string[]) => void;
    allUsers: User[];
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ open, onCancel, onCreate, allUsers }) => {
    const [form] = Form.useForm();
    const { user } = useAuth();

    const handleOk = () => {
        form.validateFields().then(values => {
            onCreate(values.name, values.members);
            form.resetFields();
        });
    };

    // Filter out current user from member selection
    const memberOptions = allUsers
        .filter(u => u.id !== user?.id)
        .map(u => ({
            label: `${u.name} (${roleLabels[u.role] || u.role})`,
            value: u.id
        }));

    return (
        <Modal
            title="Tạo nhóm chat mới"
            open={open}
            onOk={handleOk}
            onCancel={onCancel}
            destroyOnClose
            okText="Tạo nhóm"
            cancelText="Hủy"
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="name"
                    label="Tên nhóm"
                    rules={[{ required: true, message: 'Vui lòng nhập tên nhóm' }]}
                >
                    <Input placeholder="Nhập tên nhóm chat" />
                </Form.Item>
                <Form.Item
                    name="members"
                    label="Thành viên"
                    rules={[{ required: true, message: 'Vui lòng chọn ít nhất một thành viên' }]}
                >
                    <Select
                        mode="multiple"
                        placeholder="Chọn thành viên tham gia"
                        options={memberOptions}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CreateGroupModal;
