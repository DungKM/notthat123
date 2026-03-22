import React from 'react';
import Container from '../ui/Container';
import {
  FacebookOutlined,
  YoutubeOutlined,
  InstagramOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import FloatingSocials from '@/src/components/FloatingSocials';
import { useTranslation } from 'react-i18next';

const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-white text-gray-800 pt-16 pb-8 border-t border-gray-100">
      <Container>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_2fr] gap-8 mb-12 border-b border-gray-100 pb-12">
          {/* Brand Column */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2 group cursor-pointer">
              <div className="w-[100px] sm:w-[120px] md:w-[140px] lg:w-[160px] xl:w-[180px]">
                <img
                  src="/assets/images/image-logo.png"
                  alt="Nội Thất Hochi"
                  className="w-full h-auto object-contain"
                />
              </div>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed">
              {t('footer.brand_desc')}
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 border border-gray-200 rounded-full flex items-center justify-center !text-gray-400 hover:bg-showcase-primary hover:border-showcase-primary hover:text-white transition-all"><FacebookOutlined /></a>
              <a href="#" className="w-10 h-10 border border-gray-200 rounded-full flex items-center justify-center !text-gray-400 hover:bg-showcase-primary hover:border-showcase-primary hover:text-white transition-all"><YoutubeOutlined /></a>
              <a href="#" className="w-10 h-10 border border-gray-200 rounded-full flex items-center justify-center !text-gray-400 hover:bg-showcase-primary hover:border-showcase-primary hover:text-white transition-all"><InstagramOutlined /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="font-bold uppercase tracking-widest text-sm text-showcase-primary">{t('footer.contact_info')}</h4>
            <ul className="space-y-4 text-sm text-gray-600">
              <li className="flex items-start gap-3"><EnvironmentOutlined className="mt-1 text-showcase-primary" /> TT Chàm, TP. Vinh, Nghệ An</li>
              <li className="flex items-center gap-3"><PhoneOutlined className="text-showcase-primary" /> 0123 456 789</li>
              <li className="flex items-center gap-3"><MailOutlined className="text-showcase-primary" /> info@noithathochi.com</li>
            </ul>
          </div>



          {/* Newsletter */}
          <div className="space-y-6">
            <h4 className="font-bold uppercase tracking-widest text-sm text-showcase-primary">{t('footer.about_us')}</h4>
            <ul className="space-y-4 text-sm text-gray-600">
              <li><a href="#" className="hover:text-showcase-primary !text-gray-600 transition-colors">{t('footer.real_projects')}</a></li>
              <li><a href="#" className="hover:text-showcase-primary !text-gray-600 transition-colors">{t('footer.quote')}</a></li>
              <li><a href="#" className="hover:text-showcase-primary !text-gray-600 transition-colors">{t('footer.process')}</a></li>
              <li><a href="#" className="hover:text-showcase-primary !text-gray-600 transition-colors">{t('footer.warranty')}</a></li>
            </ul>
          </div>

          {/* Map Column */}
          <div className="space-y-6 border border-gray-100 rounded-lg overflow-hidden h-[200px] shadow-sm transition-all duration-500">
            <iframe
              title="Google Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3725.326265744883!2d105.8037340760463!3d20.979555689471587!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ace4443722a5%3A0xe5a3c26cb7f06bad!2zMzEgTmd1eeG7hW4gWGnhu4NuLCBUaGFuaCBYdcOibiBOYW0sIFRoYW5oIFh1w6JuLCBIw6AgTuG7mWksIFZp4buHdCBOYW0!5e0!3m2!1svi!2s!4v1710000000000!5m2!1svi!2s"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
            ></iframe>
          </div>
        </div>
        <FloatingSocials />
        <div className="text-center text-gray-400 text-xs">
          {t('footer.copyright')}
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
