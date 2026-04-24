import React, { useState } from 'react';
import Container from '@/src/features/showcase/components/ui/Container';
import {
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import Button from '@/src/features/showcase/components/ui/Button';
import SEO from '@/src/components/common/SEO';
import { useTranslation } from 'react-i18next';
import { message } from 'antd';
import { useContactService } from '@/src/api/services';
import toast from 'react-hot-toast';
import { useCompanyInfoQuery } from '@/src/hooks/useCompanyInfoQuery';

const ContactPage: React.FC = () => {
  const { t } = useTranslation();
  const { create, loading } = useContactService();
  const { data: companyInfo } = useCompanyInfoQuery();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    message: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    let { name, value } = e.target;

    if (name === 'fullName') {
      value = value.replace(/[^\p{L}\s]/gu, '');
    }

    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ tên!';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại!';
    } else {
      const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
      if (!phoneRegex.test(formData.phone.trim())) {
        newErrors.phone = 'Số điện thoại không hợp lệ!';
      }
    }

    if (formData.email.trim()) {
      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'Email không hợp lệ!';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        await create({
          ...formData,
          content: formData.message // Mapping to content if backend expects it
        });
        setFormData({ fullName: '', phone: '', email: '', address: '', message: '' });
      } catch (error) {
        console.error('Submit contact error:', error);
      }
    } else {
      setTimeout(() => {
        const errorElement = document.querySelector('.border-red-500') as HTMLElement;
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          errorElement.focus();
        }
      }, 100);
    }
  };

  return (
    <div className="bg-white">
      <SEO
        title="Liên hệ - Nội Thất Hochi"
        description="Liên hệ với Nội Thất Hochi. Trụ sở: Toà nhà VIMECO, Phạm Hùng, Cầu Giấy, Hà Nội. Hotline: 0326 908 884. Tư vấn thiết kế nội thất miễn phí."
        canonicalPath="/lien-he"
        keywords="liên hệ nội thất hochi, hotline nội thất, tư vấn nội thất hà nội, showroom nội thất cầu giấy"
        breadcrumbs={[
          { name: 'Trang chủ', url: '/' },
          { name: 'Liên hệ', url: '/lien-he' },
        ]}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'ContactPage',
          name: 'Liên hệ Nội Thất Hochi',
          description: 'Trang liên hệ và tư vấn nội thất',
          url: 'https://www.noithathochi.vn/lien-he',
          mainEntity: {
            '@type': 'Organization',
            name: 'Nội Thất Hochi',
            telephone: '+84326908884',
            address: {
              '@type': 'PostalAddress',
              streetAddress: 'Toà nhà VIMECO, Phạm Hùng, Cầu Giấy',
              addressLocality: 'Hà Nội',
              addressCountry: 'VN',
            },
          },
        }}
      />

      {/* Page Header */}
      <section className="relative h-60 md:h-75 flex items-center pt-20">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1600"
            alt="Contact Office"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60"></div>
        </div>
        <Container className="relative z-10 text-center text-white">
          <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-widest mt-4" style={{ fontFamily: "'Inter', sans-serif" }}>{t('contact.page_title')}</h1>
        </Container>
      </section>

      {/* Contact Content */}
      <section className="py-24">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Info Column */}
            <div className="space-y-12">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-teal-950 uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {companyInfo?.name || "Nội Thất HOCHI"}
                </h2>
                <div className="w-20 h-1 bg-[#C5A059]"></div>
              </div>

              <div className="space-y-8">
                {(companyInfo?.branches || []).map((branch: any, idx: number) => (
                  <div className="flex items-center gap-4" key={idx}>
                    <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-teal-900 border border-gray-100 shrink-0">
                      <EnvironmentOutlined className="text-xl" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 leading-snug m-0">{branch.name}: {branch.address}</h4>
                      {(branch.phones && branch.phones.length > 0) && (
                        <div className="text-sm text-gray-500 mt-1">
                          {branch.phones.map((p: any, pIdx: number) => (
                            <span key={pIdx} className="mr-3">
                              <PhoneOutlined className="mr-1" /> {p.number} {p.label ? `(${p.label})` : ''}
                            </span>
                          ))}
                        </div>
                      )}
                      {branch.email && (
                        <div className="text-sm text-gray-500 mt-1">
                          <MailOutlined className="mr-1" /> {branch.email}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-8 space-y-4 border-t border-gray-100">
                {companyInfo?.socialLinks?.website && (
                  <div className="flex items-center gap-3 text-lg">
                    <GlobalOutlined className="text-[#C5A059]" />
                    <span className="font-bold">Website: <a href={companyInfo.socialLinks.website} target="_blank" rel="noopener noreferrer" className="text-teal-700 hover:underline">{companyInfo.socialLinks.website}</a></span>
                  </div>
                )}
                {companyInfo?.email && (
                  <div className="flex items-center gap-3 text-lg">
                    <MailOutlined className="text-[#C5A059]" />
                    <span className="font-bold">Email: <span className="text-teal-700">{companyInfo.email}</span></span>
                  </div>
                )}
              </div>
            </div>

            {/* Form Column */}
            <div className="bg-white p-8 rounded-2xl border border-gray-50 space-y-8">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-teal-950 uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>{t('contact.form_title')}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{t('contact.form_desc')}</p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder={t('contact.name')}
                    className={`w-full px-4 py-3 border rounded-md outline-none transition-colors ${errors.fullName ? 'border-red-500' : 'border-gray-200 focus:border-teal-700'}`}
                  />
                  {errors.fullName && <p className="mt-1 text-[10px] text-red-500 uppercase tracking-wider">{errors.fullName}</p>}
                </div>
                <div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder={t('contact.phone')}
                    className={`w-full px-4 py-3 border rounded-md outline-none transition-colors ${errors.phone ? 'border-red-500' : 'border-gray-200 focus:border-teal-700'}`}
                  />
                  {errors.phone && <p className="mt-1 text-[10px] text-red-500 uppercase tracking-wider">{errors.phone}</p>}
                </div>
                <div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={t('contact.email')}
                    className={`w-full px-4 py-3 border rounded-md outline-none transition-colors ${errors.email ? 'border-red-500' : 'border-gray-200 focus:border-teal-700'}`}
                  />
                  {errors.email && <p className="mt-1 text-[10px] text-red-500 uppercase tracking-wider">{errors.email}</p>}
                </div>
                <div>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder={t('contact.address')}
                    className="w-full px-4 py-3 border border-gray-200 rounded-md focus:border-teal-700 outline-none transition-colors"
                  />
                </div>
                <div>
                  <textarea
                    rows={4}
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder={t('contact.message')}
                    className="w-full px-4 py-3 border border-gray-200 rounded-md focus:border-teal-700 outline-none transition-colors resize-none"
                  ></textarea>
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-teal-900 border-none px-12 py-4 uppercase font-bold tracking-widest hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Đang gửi...' : t('contact.submit')}
                </Button>
              </form>
            </div>
          </div>
        </Container>
      </section>

    </div>
  );
};

export default ContactPage;
