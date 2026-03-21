import React, { useState } from 'react';
import Container from '../ui/Container';
import Button from '../ui/Button';
import { PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { message } from 'antd';
import { useContactService } from '@/src/api/services';
import toast from 'react-hot-toast';

const CTA: React.FC = () => {
  const { t } = useTranslation();
  const { create, loading } = useContactService();
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    projectType: '',
    message: ''
  });
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone) {
      message.warning('Vui lòng nhập họ tên và số điện thoại!');
      return;
    }

    try {
      await create({
        fullName: formData.fullName,
        phone: formData.phone,
        email: '',
        address: formData.projectType, // Map project type to address or just pass it
        content: formData.projectType ? `[Loại công trình: ${formData.projectType}] - ${formData.message}` : formData.message
      });
      setFormData({ fullName: '', phone: '', projectType: '', message: '' });
      toast.success('Đăng ký tư vấn thành công. Chúng tôi sẽ sớm liên lạc với bạn!');
    } catch (error) {
      console.error('Submit contact error:', error);
    }
  };

  return (
    <section id="tu-van-ngay-form" className="py-24 bg-gray-50">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* FAQ Column */}
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-teal-950 uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>{t('cta.faq_title')}</h2>
            <div className="space-y-4">
              {[
                { q: t('cta.faq_q1'), a: t('cta.faq_a1') },
                { q: t('cta.faq_q2'), a: t('cta.faq_a2') },
                { q: t('cta.faq_q3'), a: t('cta.faq_a3') }
              ].map((item, i) => (
                <div 
                  key={i} 
                  className="border-b border-gray-200 pb-4 cursor-pointer"
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                >
                  <div className="flex justify-between items-center py-2 group">
                    <h5 className={`font-bold text-sm transition-colors ${activeFaq === i ? 'text-teal-900' : 'text-gray-800 group-hover:text-teal-900'}`}>{item.q}</h5>
                    <PlusOutlined className={`transition-all duration-300 ${activeFaq === i ? 'text-teal-900 rotate-45' : 'text-gray-400 group-hover:text-teal-900'}`} />
                  </div>
                  {activeFaq === i && (
                    <p className="text-gray-500 text-sm animate-fadeIn mt-2 leading-relaxed">
                      {item.a}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form Column */}
          <div className="bg-teal-950 rounded-2xl p-8 shadow-2xl space-y-6">
            <div className="text-center text-white space-y-2">
              <h3 className="text-2xl font-bold italic" style={{ fontFamily: "'Inter', sans-serif" }}>{t('cta.form_title')}</h3>
              <p className="text-xs text-gray-400 font-light">{t('cta.form_desc')}</p>
            </div>
            
            <form className="space-y-4" onSubmit={handleSubmit}>
              <input 
                type="text" 
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder={t('cta.form_name')} 
                className="w-full bg-white text-gray-900 px-4 py-3 rounded-md focus:ring-2 focus:ring-showcase-primary outline-none text-sm" 
                required
              />
              <input 
                type="tel" 
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder={t('cta.form_phone')} 
                className="w-full bg-white text-gray-900 px-4 py-3 rounded-md focus:ring-2 focus:ring-showcase-primary outline-none text-sm" 
                required
              />
              <select 
                name="projectType"
                value={formData.projectType}
                onChange={handleChange}
                className="w-full bg-white text-gray-500 px-4 py-3 rounded-md shadow-sm focus:ring-2 focus:ring-showcase-primary outline-none text-sm"
              >
                <option value="" disabled>{t('cta.form_select')}</option>
                <option value={t('cta.form_villa')}>{t('cta.form_villa')}</option>
                <option value={t('cta.form_apartment')}>{t('cta.form_apartment')}</option>
                <option value={t('cta.form_townhouse')}>{t('cta.form_townhouse')}</option>
              </select>
              <textarea 
                rows={3} 
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder={t('cta.form_content')} 
                className="w-full bg-white text-gray-900 px-4 py-3 rounded-md focus:ring-2 focus:ring-showcase-primary outline-none text-sm resize-none"
              ></textarea>
              <Button 
                type="submit" 
                disabled={loading} 
                fullWidth 
                className="bg-showcase-primary border-none py-4 text-xs font-bold tracking-widest hover:scale-[1.02] hover:bg-showcase-hover disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {loading ? 'ĐANG GỬI...' : t('cta.form_submit')}
              </Button>
            </form>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default CTA;
