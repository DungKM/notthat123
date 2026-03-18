import React from 'react';
import Container from '../ui/Container';
import Button from '../ui/Button';
import { PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const CTA: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="py-24 bg-gray-50">
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
                <div key={i} className="border-b border-gray-200 pb-4 group cursor-pointer">
                  <div className="flex justify-between items-center py-2">
                    <h5 className="font-bold text-gray-800 text-sm">{item.q}</h5>
                    <PlusOutlined className="text-gray-400 group-hover:text-teal-900 transition-colors" />
                  </div>
                  <p className="text-gray-500 text-sm hidden group-hover:block animate-fadeIn mt-2 leading-relaxed">
                    {item.a}
                  </p>
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
            
            <form className="space-y-4">
              <input 
                type="text" 
                placeholder={t('cta.form_name')} 
                className="w-full bg-white text-gray-900 px-4 py-3 rounded-md focus:ring-2 focus:ring-showcase-primary outline-none text-sm" 
              />
              <input 
                type="tel" 
                placeholder={t('cta.form_phone')} 
                className="w-full bg-white text-gray-900 px-4 py-3 rounded-md focus:ring-2 focus:ring-showcase-primary outline-none text-sm" 
              />
              <select className="w-full bg-white text-gray-500 px-4 py-3 rounded-md shadow-sm focus:ring-2 focus:ring-showcase-primary outline-none text-sm">
                <option>{t('cta.form_select')}</option>
                <option>{t('cta.form_villa')}</option>
                <option>{t('cta.form_apartment')}</option>
                <option>{t('cta.form_townhouse')}</option>
              </select>
              <textarea 
                rows={3} 
                placeholder={t('cta.form_content')} 
                className="w-full bg-white text-gray-900 px-4 py-3 rounded-md focus:ring-2 focus:ring-showcase-primary outline-none text-sm resize-none"
              ></textarea>
              <Button fullWidth className="bg-showcase-primary border-none py-4 text-xs font-bold tracking-widest hover:scale-[1.02] hover:bg-showcase-hover">{t('cta.form_submit')}</Button>
            </form>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default CTA;
