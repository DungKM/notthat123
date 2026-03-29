import React, { useState, useEffect } from "react";
import { Modal, Table, Button, Input, Space, Popconfirm, message } from "antd";
import { PlusOutlined, DeleteOutlined, EditOutlined, SaveOutlined, CloseOutlined } from "@ant-design/icons";
import { useProjectStageService } from "@/src/api/services";

interface StageManagerModalProps {
  open: boolean;
  onCancel: () => void;
  onRefresh: () => void;
}

const StageManagerModal: React.FC<StageManagerModalProps> = ({ open, onCancel, onRefresh }) => {
  const [stages, setStages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newStageName, setNewStageName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  
  const { request } = useProjectStageService();

  const fetchStages = async () => {
    setLoading(true);
    try {
      const res = await request('GET', '', null, { page: 1, limit: 100 });
      setStages(res?.data || []);
    } catch (err) {
      console.error("Fetch stages failed:", err);
      message.error("Không thể lấy danh sách tiến độ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchStages();
    } else {
      setNewStageName("");
      setEditingId(null);
    }
  }, [open]);

  const handleAdd = async () => {
    if (!newStageName.trim()) {
      message.warning("Vui lòng nhập tên danh mục");
      return;
    }
    try {
      await request('POST', '', { name: newStageName.trim() });
      message.success("Thêm thành công");
      setNewStageName("");
      fetchStages();
      onRefresh();
    } catch (err) {
      message.error("Lỗi khi thêm danh mục");
    }
  };

  const handleEdit = async (id: string) => {
    if (!editName.trim()) {
      message.warning("Tên không được để trống");
      return;
    }
    try {
      // Backend có thể dùng PUT hoặc PATCH, thử PUT trước, thường API auto-gen hỗ trợ PATCH/PUT
      await request('PATCH', `/${id}`, { name: editName.trim() });
      message.success("Cập nhật thành công");
      setEditingId(null);
      fetchStages();
      onRefresh();
    } catch (err) {
      // Nếu PATCH không hỗ trợ (chẳng hạn 404), fallback PUT
      try {
        await request('PUT', `/${id}`, { name: editName.trim() });
        message.success("Cập nhật thành công");
        setEditingId(null);
        fetchStages();
        onRefresh();
      } catch (err2) {
        message.error("Lỗi cập nhật danh mục");
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await request('DELETE', `/${id}`);
      message.success("Xóa thành công");
      fetchStages();
      onRefresh();
    } catch (err) {
      message.error("Lỗi khi xóa. Có thể danh mục này đang được sử dụng.");
    }
  };

  const columns = [
    {
      title: 'Tên trạng thái / tiến độ',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => {
        if (editingId === record.id || editingId === record._id) {
          return (
            <Input 
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onPressEnter={() => handleEdit(record.id || record._id)}
              autoFocus
            />
          );
        }
        return text;
      }
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 150,
      render: (_, record: any) => {
        const id = record.id || record._id;
        if (editingId === id) {
          return (
            <Space>
              <Button 
                type="text" 
                style={{ color: '#1890ff' }} 
                icon={<SaveOutlined />} 
                onClick={() => handleEdit(id)} 
              />
              <Button 
                type="text" 
                icon={<CloseOutlined />} 
                onClick={() => setEditingId(null)} 
              />
            </Space>
          );
        }
        return (
          <Space>
            <Button 
              type="text" 
              icon={<EditOutlined style={{ color: '#faad14' }} />} 
              onClick={() => {
                setEditingId(id);
                setEditName(record.name);
              }} 
            />
            <Popconfirm title="Bạn có muốn xóa danh mục này?" onConfirm={() => handleDelete(id)}>
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        );
      }
    }
  ];

  return (
    <Modal
      title="Danh mục trạng thái tiến độ"
      open={open}
      onCancel={onCancel}
      footer={null}
    >
      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <Input 
          placeholder="Tên tiến độ mới (ví dụ: Phát sinh hợp đồng)" 
          value={newStageName}
          onChange={(e) => setNewStageName(e.target.value)}
          onPressEnter={handleAdd}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Thêm</Button>
      </div>
      <Table 
        loading={loading}
        dataSource={stages}
        columns={columns}
        rowKey={(r: any) => r.id || r._id}
        pagination={false}
        size="small"
        bordered
      />
    </Modal>
  );
};

export default StageManagerModal;
