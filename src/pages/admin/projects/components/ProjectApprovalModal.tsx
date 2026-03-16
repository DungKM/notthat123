import React, { useState } from 'react';
import { Modal, List, Button, Tag, Space, Typography, Input, message } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { Project } from '@/src/types';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;
const { TextArea } = Input;

interface ProjectApprovalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pendingProjects: Project[];
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  showViewButton?: boolean;
}

const ProjectApprovalModal: React.FC<ProjectApprovalModalProps> = ({
  open,
  onOpenChange,
  pendingProjects,
  onApprove,
  onReject,
  showViewButton = true,
}) => {
  const navigate = useNavigate();

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectProjectId, setRejectProjectId] = useState<string | null>(null);

  const openRejectModal = (id: string) => {
    setRejectProjectId(id);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = () => {
    if (!rejectReason.trim()) {
      message.warning('Vui lòng nhập lý do từ chối');
      return;
    }

    if (rejectProjectId) {
      onReject(rejectProjectId, rejectReason);
    }

    setRejectModalOpen(false);
  };

  return (
    <>
      <Modal
        title="Danh sách dự án chờ duyệt"
        open={open}
        onCancel={() => onOpenChange(false)}
        footer={null}
        width={800}
      >
        <List
          dataSource={pendingProjects}
          renderItem={(project) => (
            <List.Item
              actions={[
                showViewButton && (
                  <Button
                    key="view"
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => {
                      navigate(`/quan-tri/du-an/${project.id}`);
                      onOpenChange(false);
                    }}
                  >
                    Xem
                  </Button>
                ),

                <Button
                  key="approve"
                  type="link"
                  icon={<CheckCircleOutlined />}
                  style={{ color: '#52c41a' }}
                  onClick={() => onApprove(project.id)}
                >
                  Duyệt
                </Button>,

                <Button
                  key="reject"
                  type="link"
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={() => openRejectModal(project.id)}
                >
                  Từ chối
                </Button>,
              ].filter(Boolean)}
            >
              <List.Item.Meta
                title={<Text strong>{project.name}</Text>}
                description={
                  <Space direction="vertical" size={0}>
                    <Text type="secondary">{project.address}</Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Người tạo: <Text strong>{project.createdBy || 'N/A'}</Text>
                    </Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Yêu cầu lúc:{' '}
                      {dayjs(project.createdAt).format('HH:mm DD/MM/YYYY')}
                    </Text>
                  </Space>
                }
              />

              <Tag color="orange">Chờ duyệt</Tag>
            </List.Item>
          )}
          locale={{ emptyText: 'Không có dự án nào chờ duyệt' }}
        />
      </Modal>

      {/* Modal nhập lý do từ chối */}
      <Modal
        title="Nhập lý do từ chối"
        open={rejectModalOpen}
        onCancel={() => setRejectModalOpen(false)}
        onOk={handleConfirmReject}
        okText="Xác nhận từ chối"
        cancelText="Hủy"
      >
        <TextArea
          rows={4}
          placeholder="Nhập lý do từ chối dự án..."
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
        />
      </Modal>
    </>
  );
};

export default ProjectApprovalModal;