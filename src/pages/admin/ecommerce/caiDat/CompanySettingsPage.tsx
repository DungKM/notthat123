import React, { useEffect, useState } from 'react';
import {
  Form, Input, Button, Upload, Image, message, Card, Spin, Typography, Row, Col, Divider, Space,
} from 'antd';
import {
  UploadOutlined, SaveOutlined, PlusOutlined, DeleteOutlined,
  GlobalOutlined, MailOutlined, PhoneOutlined, EnvironmentOutlined,
  FacebookOutlined, YoutubeOutlined, InfoCircleOutlined,
} from '@ant-design/icons';
import { useApi } from '@/src/hooks/useApi';
import { useCompanyInfoService } from '@/src/api';
import api from '@/src/api/axiosInstance';

const { Title, Text } = Typography;
const { TextArea } = Input;


interface Branch {
  name: string;
  address: string;
  phone: string;
  email: string;
}

interface SocialLinks {
  facebook: string;
  zalo: string;
  youtube: string;
  instagram: string;
  tiktok: string;
  website: string;
}

const defaultBranch = (): Branch => ({ name: '', address: '', phone: '', email: '' });
const defaultSocial = (): SocialLinks => ({ facebook: '', zalo: '', youtube: '', instagram: '', tiktok: '', website: '' });

const CompanySettingsPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [branches, setBranches] = useState<Branch[]>([
    { name: 'Chi nhánh Q1', address: '123 Nguyễn Huệ', phone: '0909123456', email: '' },
    { name: 'Chi nhánh Thủ Đức', address: '456 Võ Văn Ngân', phone: '0909987654', email: '' },
  ]);
  const [social, setSocial] = useState<SocialLinks>({
    facebook: 'https://facebook.com/tuduong',
    zalo: '',
    youtube: '',
    instagram: 'https://instagram.com/tuduong',
    tiktok: 'https://tiktok.com/@tuduong',
    website: '',
  });

  const { request } = useCompanyInfoService();

  const fetchCompanyInfo = async () => {
    setLoading(true);
    try {
      const res = await request('GET', '');
      const data = res?.data || res || {};
      if (data.logo) setLogoUrl(data.logo);

      form.setFieldsValue({
        name: data.name || 'Trà Sữa Tú Dương',
        slogan: data.slogan || 'Ngon từ tâm',
        description: data.description || 'Chuỗi trà sữa sạch',
        email: data.email || 'tuduong@gmail.com',
      });

      if (Array.isArray(data.branches) && data.branches.length > 0) {
        setBranches(data.branches.map((b: any) => ({
          name: b.name || '',
          address: b.address || '',
          phone: b.phone || '',
          email: b.email || '',
        })));
      }

      if (data.socialLinks && typeof data.socialLinks === 'object') {
        setSocial({
          facebook: data.socialLinks.facebook || '',
          zalo: data.socialLinks.zalo || '',
          youtube: data.socialLinks.youtube || '',
          instagram: data.socialLinks.instagram || '',
          tiktok: data.socialLinks.tiktok || '',
          website: data.socialLinks.website || '',
        });
      }
    } catch {
      message.error('Không thể tải thông tin công ty');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCompanyInfo(); }, []);

  // Branch helpers
  const updateBranch = (idx: number, field: keyof Branch, value: string) => {
    setBranches(prev => prev.map((b, i) => i === idx ? { ...b, [field]: value } : b));
  };
  const addBranch = () => setBranches(prev => [...prev, defaultBranch()]);
  const removeBranch = (idx: number) => setBranches(prev => prev.filter((_, i) => i !== idx));

  const handleSave = async () => {
    try { await form.validateFields(); } catch { return; }
    setSaving(true);
    try {
      const values = form.getFieldsValue();
      const formData = new FormData();
      if (logoFile) formData.append('logo', logoFile);
      if (values.name) formData.append('name', values.name);
      if (values.slogan) formData.append('slogan', values.slogan);
      if (values.description) formData.append('description', values.description);
      if (values.email) formData.append('email', values.email);
      formData.append('branches', JSON.stringify(branches));
      formData.append('socialLinks', JSON.stringify(social));

      await api.patch('/company-info', formData);
      message.success('Cập nhật thông tin công ty thành công!');
      setLogoFile(null);
      await fetchCompanyInfo();
    } catch (e: any) {
      message.error(e?.message || 'Có lỗi xảy ra khi lưu');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: '0 8px' }}>
      {/* Header */}
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Cài đặt thông tin công ty</Title>
          <Text type="secondary" style={{ fontSize: 13 }}>Quản lý thông tin hiển thị trên website</Text>
        </div>
        <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSave}>
          Lưu thay đổi
        </Button>
      </div>

      <Spin spinning={loading}>
        <Form form={form} layout="vertical" disabled={saving}>

          {/* ── Logo ── */}
          <Card size="small" title=" Logo công ty" style={{ marginBottom: 12 }}>
            <Row gutter={16} align="middle">
              <Col flex="120px">
                {logoUrl
                  ? <Image src={logoUrl} alt="Logo" style={{ width: 100, height: 80, objectFit: 'contain', border: '1px solid #f0f0f0', borderRadius: 8, padding: 4 }} />
                  : <div style={{ width: 100, height: 80, background: '#fafafa', border: '1px dashed #d9d9d9', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#999' }}>Chưa có logo</div>
                }
              </Col>
              <Col flex="auto">
                <Upload accept="image/*" showUploadList={false} beforeUpload={file => { setLogoFile(file); setLogoUrl(URL.createObjectURL(file)); return false; }}>
                  <Button icon={<UploadOutlined />}>Chọn ảnh logo</Button>
                </Upload>
                <div style={{ fontSize: 12, color: '#888', marginTop: 6 }}>Khuyến nghị: PNG nền trong suốt, tỷ lệ ngang</div>
                {logoFile && <Text type="success" style={{ fontSize: 12 }}>✓ Đã chọn: {logoFile.name}</Text>}
              </Col>
            </Row>
          </Card>

          {/* ── Thông tin cơ bản ── */}
          <Card size="small" title="Thông tin cơ bản" style={{ marginBottom: 12 }}>
            <Row gutter={12}>
              <Col xs={24} sm={12}>
                <Form.Item name="name" label="Tên công ty" rules={[{ required: true, message: 'Vui lòng nhập tên công ty' }]} style={{ marginBottom: 12 }}>
                  <Input placeholder="VD: Nội Thất Hochi" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="email" label="Email liên hệ" style={{ marginBottom: 12 }}>
                  <Input placeholder="VD: contact@hochi.vn" prefix={<MailOutlined />} />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item name="slogan" label="Slogan (câu khẩu hiệu)" style={{ marginBottom: 12 }}>
                  <Input placeholder="VD: Kiến tạo không gian sống đẳng cấp" />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item name="description" label="Mô tả công ty" style={{ marginBottom: 0 }}>
                  <TextArea rows={3} placeholder="Mô tả ngắn về công ty, sứ mệnh, giá trị cốt lõi..." showCount maxLength={500} />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* ── Chi nhánh ── */}
          <Card
            size="small"
            title=" Chi nhánh / Showroom"
            style={{ marginBottom: 12 }}
            extra={
              <Button size="small" type="dashed" icon={<PlusOutlined />} onClick={addBranch}>
                Thêm chi nhánh
              </Button>
            }
          >
            {branches.length === 0 && (
              <Text type="secondary" style={{ fontSize: 13 }}>Chưa có chi nhánh nào. Nhấn "Thêm chi nhánh" để bắt đầu.</Text>
            )}
            {branches.map((branch, idx) => (
              <div key={idx} style={{ background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: 8, padding: '12px 12px 4px', marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text strong style={{ fontSize: 13 }}>Chi nhánh {idx + 1}</Text>
                  {branches.length > 1 && (
                    <Button size="small" danger type="text" icon={<DeleteOutlined />} onClick={() => removeBranch(idx)}>Xoá</Button>
                  )}
                </div>
                <Row gutter={10}>
                  <Col xs={24} sm={12}>
                    <Form.Item label="Tên chi nhánh" style={{ marginBottom: 10 }}>
                      <Input
                        placeholder="VD: Trụ sở chính"
                        value={branch.name}
                        onChange={e => updateBranch(idx, 'name', e.target.value)}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item label="Số điện thoại" style={{ marginBottom: 10 }}>
                      <Input
                        placeholder="VD: 0901 234 567"
                        prefix={<PhoneOutlined />}
                        value={branch.phone}
                        onChange={e => updateBranch(idx, 'phone', e.target.value)}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item label="Địa chỉ" style={{ marginBottom: 10 }}>
                      <Input
                        placeholder="VD: 123 Đường Lê Lợi, Q.1, TP.HCM"
                        prefix={<EnvironmentOutlined />}
                        value={branch.address}
                        onChange={e => updateBranch(idx, 'address', e.target.value)}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item label="Email chi nhánh" style={{ marginBottom: 10 }}>
                      <Input
                        placeholder="VD: hcm@hochi.vn"
                        prefix={<MailOutlined />}
                        value={branch.email}
                        onChange={e => updateBranch(idx, 'email', e.target.value)}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </div>
            ))}
          </Card>

          {/* ── Mạng xã hội ── */}
          <Card size="small" title="🌐 Mạng xã hội & Liên kết" style={{ marginBottom: 16 }}>
            <Row gutter={12}>
              <Col xs={24} sm={12}>
                <Form.Item label="Website" style={{ marginBottom: 12 }}>
                  <Input
                    prefix={<GlobalOutlined />}
                    placeholder="https://hochi.vn"
                    value={social.website}
                    onChange={e => setSocial(s => ({ ...s, website: e.target.value }))}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="Facebook" style={{ marginBottom: 12 }}>
                  <Input
                    prefix={<FacebookOutlined />}
                    placeholder="https://facebook.com/hochi"
                    value={social.facebook}
                    onChange={e => setSocial(s => ({ ...s, facebook: e.target.value }))}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="Zalo" style={{ marginBottom: 12 }}>
                  <Input
                    prefix={<PhoneOutlined />}
                    placeholder="https://zalo.me/... hoặc số điện thoại Zalo"
                    value={social.zalo}
                    onChange={e => setSocial(s => ({ ...s, zalo: e.target.value }))}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="YouTube" style={{ marginBottom: 12 }}>
                  <Input
                    prefix={<YoutubeOutlined />}
                    placeholder="https://youtube.com/@hochi"
                    value={social.youtube}
                    onChange={e => setSocial(s => ({ ...s, youtube: e.target.value }))}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="Instagram" style={{ marginBottom: 12 }}>
                  <Input
                    prefix={<GlobalOutlined />}
                    placeholder="https://instagram.com/hochi"
                    value={social.instagram}
                    onChange={e => setSocial(s => ({ ...s, instagram: e.target.value }))}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="TikTok" style={{ marginBottom: 12 }}>
                  <Input
                    prefix={<GlobalOutlined />}
                    placeholder="https://tiktok.com/@hochi"
                    value={social.tiktok}
                    onChange={e => setSocial(s => ({ ...s, tiktok: e.target.value }))}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

        </Form>
      </Spin>

      <div style={{ textAlign: 'right', paddingBottom: 24 }}>
        <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSave} size="large">
          Lưu thay đổi
        </Button>
      </div>
    </div>
  );
};

export default CompanySettingsPage;
