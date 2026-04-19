import React from 'react';
import { Modal, Form, Input } from 'antd';
import { UserOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons';
import { useInterestesService } from '@/src/api/services';
import toast from 'react-hot-toast';

interface InterestModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityName: string;
  entityTypeText: string; 
  entityId: string;
  entityType: string;
}

const InterestModal: React.FC<InterestModalProps> = ({
  isOpen,
  onClose,
  entityName,
  entityTypeText,
  entityId,
  entityType,
}) => {
  const [form] = Form.useForm();
  const { request: requestInterest } = useInterestesService();

  const handleFinish = async (values: any) => {
    try {
      if (entityId) {
        await requestInterest('POST', '', {
          fullName: values.name,
          phone: values.phone,
          email: values.email || '',
          entityId: String(entityId),
          entityType: entityType,
        });
      }
      toast.success('Ghi nhận thông tin thành công. Chúng tôi sẽ sớm liên hệ!');
      onClose();
      form.resetFields();
    } catch (error) {
      toast.error('Có lỗi xảy ra, vui lòng thử lại!');
    }
  };

  return (
    <Modal
      title={
        <div className="text-center font-bold text-lg text-gray-800">
          Đăng ký nhận tư vấn
        </div>
      }
      open={isOpen}
      onCancel={() => {
        onClose();
        form.resetFields();
      }}
      footer={null}
      destroyOnClose
    >
      <p className="text-center text-gray-500 mb-6 text-sm">
        Vui lòng để lại thông tin, chúng tôi sẽ liên hệ tư vấn chi tiết về {entityTypeText} <strong className="text-gray-800">{entityName}</strong> cho bạn.
        <br />
        <span className="text-red-500 font-medium italic mt-2 inline-block">* Lưu ý: Quá trình tư vấn là hoàn toàn miễn phí!</span>
      </p>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
      >
        <Form.Item
          name="name"
          rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
        >
          <Input prefix={<UserOutlined className="text-gray-400" />} placeholder="Họ và tên *" size="large" />
        </Form.Item>
        <Form.Item
          name="phone"
          rules={[
            { required: true, message: 'Vui lòng nhập số điện thoại' },
            { pattern: /^[0-9]{10}$/, message: 'Số điện thoại phải có 10 số' },
          ]}
        >
          <Input prefix={<PhoneOutlined className="text-gray-400" />} placeholder="Số điện thoại *" size="large" maxLength={10} minLength={10} />
        </Form.Item>
        <Form.Item
          name="email"
          rules={[{ type: 'email', message: 'Email không hợp lệ' }]}
        >
          <Input prefix={<MailOutlined className="text-gray-400" />} placeholder="Email (Tùy chọn)" size="large" />
        </Form.Item>
        <Form.Item className="mb-0 mt-6">
          <button
            type="submit"
            className="w-full bg-[#cca32e] text-white font-bold py-3 rounded hover:bg-[#b08c27] transition-colors"
          >
            Gửi thông tin
          </button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default InterestModal;
