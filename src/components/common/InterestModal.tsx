import React from 'react';
import { Modal, Form, Input } from 'antd';
import { UserOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons';
import { useInterestesService } from '@/src/api/services';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
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
      toast.success(t('interest_modal.toast_success'));
      onClose();
      form.resetFields();
    } catch (error) {
      toast.error(t('interest_modal.toast_error'));
    }
  };

  return (
    <Modal
      title={
        <div className="text-center font-bold text-lg text-gray-800">
          {t('interest_modal.title')}
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
        {t('interest_modal.description_prefix')} {entityTypeText} <strong className="text-gray-800">{entityName}</strong> {t('interest_modal.description_suffix')}
        <br />
        <span className="text-red-500 font-medium italic mt-2 inline-block">{t('interest_modal.free_note')}</span>
      </p>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
      >
        <Form.Item
          name="name"
          rules={[{ required: true, message: t('interest_modal.errors.name_required') }]}
        >
          <Input prefix={<UserOutlined className="text-gray-400" />} placeholder={t('interest_modal.name_placeholder')} size="large" />
        </Form.Item>
        <Form.Item
          name="phone"
          rules={[
            { required: true, message: t('interest_modal.errors.phone_required') },
            { pattern: /^[0-9]{10}$/, message: t('interest_modal.errors.phone_invalid') },
          ]}
        >
          <Input prefix={<PhoneOutlined className="text-gray-400" />} placeholder={t('interest_modal.phone_placeholder')} size="large" maxLength={10} minLength={10} />
        </Form.Item>
        <Form.Item
          name="email"
          rules={[{ type: 'email', message: t('interest_modal.errors.email_invalid') }]}
        >
          <Input prefix={<MailOutlined className="text-gray-400" />} placeholder={t('interest_modal.email_placeholder')} size="large" />
        </Form.Item>
        <Form.Item className="mb-0 mt-6">
          <button
            type="submit"
            className="w-full bg-[#cca32e] text-white font-bold py-3 rounded hover:bg-[#b08c27] transition-colors"
          >
            {t('interest_modal.submit')}
          </button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default InterestModal;
