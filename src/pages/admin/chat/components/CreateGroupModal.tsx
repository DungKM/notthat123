import React from 'react';
import { Modal, Form, Input, Select } from 'antd';
import { mockUsers } from '@/src/auth/mockUsers';
import { useAuth } from '@/src/auth/hooks/useAuth';

interface CreateGroupModalProps {
    open: boolean;
    onCancel: () => void;
    onCreate: (name: string, members: string[]) => void;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ open, onCancel, onCreate }) => {
    const [form] = Form.useForm();
    const { user } = useAuth();

    const handleOk = () => {
        form.validateFields().then(values => {
            onCreate(values.name, values.members);
            form.resetFields();
        });
    };

    // Filter out current user from member selection
    const memberOptions = mockUsers
        .filter(u => u.id !== user?.id)
        .map(u => ({
            label: `${u.name} (${u.role})`,
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
