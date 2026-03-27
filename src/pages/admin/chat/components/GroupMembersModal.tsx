import React, { useState } from 'react';
import { Modal, List, Avatar, Button, Select, Space, Typography, Popconfirm, message } from 'antd';
import { UserOutlined, UserAddOutlined, DeleteOutlined } from '@ant-design/icons';
import { ChatGroup } from '@/src/features/chat/types';
import { User } from '@/src/auth/types';

const { Text } = Typography;

const roleLabels: Record<string, string> = {
  DIRECTOR: 'Giám đốc',
  ACCOUNTANT: 'Kế toán',
  STAFF: 'Nhân viên',
  SITE_MANAGER: 'Quản lý công trình',
  CUSTOMER: 'Khách hàng',
};

interface GroupMembersModalProps {
    open: boolean;
    group: ChatGroup | undefined;
    allUsers: User[];
    currentUser: User | null;
    isAdmin: boolean;
    onCancel: () => void;
    onAddMembers: (memberIds: string[]) => void;
    onRemoveMember: (memberId: string) => void;
    onDeleteGroup: (groupId: string) => void;
}

const GroupMembersModal: React.FC<GroupMembersModalProps> = ({
    open,
    group,
    allUsers,
    currentUser,
    isAdmin,
    onCancel,
    onAddMembers,
    onRemoveMember,
    onDeleteGroup
}) => {
    const [selectedNewMembers, setSelectedNewMembers] = useState<string[]>([]);

    if (!group) return null;

    const currentMembers = allUsers.filter(u => group.members.includes(u.id));
    const nonMembers = allUsers.filter(u => !group.members.includes(u.id));

    const handleAdd = () => {
        if (selectedNewMembers.length > 0) {
            onAddMembers(selectedNewMembers);
            setSelectedNewMembers([]);
        }
    };

    return (
        <Modal
            title="Quản lý thành viên nhóm"
            open={open}
            onCancel={onCancel}
            footer={null}
            width={500}
        >
            {isAdmin && (
                <div style={{ marginBottom: 20, padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
                    <Text strong style={{ display: 'block', marginBottom: 8 }}>Thêm thành viên mới</Text>
                    <Space.Compact style={{ width: '100%' }}>
                        <Select
                            mode="multiple"
                            style={{ width: 'calc(100% - 100px)' }}
                            placeholder="Chọn nhân viên"
                            value={selectedNewMembers}
                            onChange={setSelectedNewMembers}
                            options={nonMembers.map(u => ({ label: `${u.name} (${roleLabels[u.role] || u.role})`, value: u.id }))}
                            showSearch
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            maxTagCount="responsive"
                        />
                        <Button 
                            type="primary" 
                            icon={<UserAddOutlined />} 
                            onClick={handleAdd}
                            disabled={selectedNewMembers.length === 0}
                            style={{ width: 100 }}
                        >
                            Thêm
                        </Button>
                    </Space.Compact>
                </div>
            )}

            <Text strong>Danh sách thành viên ({currentMembers.length})</Text>
            <List
                style={{ marginTop: 8, maxHeight: 300, overflowY: 'auto' }}
                dataSource={currentMembers}
                renderItem={member => (
                    <List.Item
                        actions={
                            isAdmin && member.id !== currentUser?.id
                                ? [
                                    <Popconfirm
                                        title="Kick thành viên"
                                        description={`Bạn có chắc muốn xóa ${member.name} khỏi nhóm?`}
                                        onConfirm={() => onRemoveMember(member.id)}
                                        okText="Có"
                                        cancelText="Không"
                                    >
                                        <Button type="text" danger icon={<DeleteOutlined />}>Xóa</Button>
                                    </Popconfirm>
                                ]
                                : undefined
                        }
                    >
                        <List.Item.Meta
                            avatar={<Avatar src={member.avatar} icon={<UserOutlined />} />}
                            title={<Text>{member.name} {member.id === currentUser?.id && <Text type="secondary">(Bạn)</Text>}</Text>}
                            description={<Text type="secondary" style={{ fontSize: 12 }}>{roleLabels[member.role] || member.role}</Text>}
                        />
                    </List.Item>
                )}
            />

            {isAdmin && (
                <div style={{ marginTop: 24, textAlign: 'center', borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
                    <Popconfirm
                        title="Xóa nhóm chat"
                        description="Hành động này không thể hoàn tác. Bạn có chắc chắn xóa?"
                        onConfirm={() => onDeleteGroup(group.id)}
                        okText="Xóa luôn"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Button danger icon={<DeleteOutlined />} block>
                            Xóa toàn bộ nhóm chat này
                        </Button>
                    </Popconfirm>
                </div>
            )}
        </Modal>
    );
};

export default GroupMembersModal;
