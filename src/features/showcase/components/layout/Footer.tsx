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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12 border-b border-gray-100 pb-12">
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

          {/* Showroom/Branches */}
          <div className="space-y-6">
            <h4 className="font-bold uppercase tracking-widest text-sm text-showcase-primary">{t('footer.branches')}</h4>
            <ul className="space-y-4 text-sm text-gray-600">
              <li>TP. Hà Nội: Quận Cầu Giấy</li>
              <li>TP. Đà Nẵng: Quận Hải Châu</li>
              <li>TP. HCM: Quận 2</li>
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
