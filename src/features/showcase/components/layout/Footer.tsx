import React from 'react';
import Container from '../ui/Container';
import {
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12 border-b border-gray-100 pb-12">
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
              <a href="https://www.facebook.com/profile.php?id=61575740525417" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-gray-200 rounded-full flex items-center justify-center bg-white shadow-sm hover:shadow hover:scale-110 transition-all duration-300 overflow-hidden">
                <img src="/assets/images/logo_fb.png" alt="Facebook" className="w-full h-full object-cover" />
              </a>
              <a href="https://zalo.me/0326908884" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-gray-200 rounded-full flex items-center justify-center bg-white shadow-sm hover:shadow hover:scale-110 transition-all duration-300 overflow-hidden">
                <img src="/assets/images/zalo-logo.png" alt="Zalo" className="w-8 h-8 object-contain" />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-gray-200 rounded-full flex items-center justify-center bg-white shadow-sm hover:shadow hover:scale-110 transition-all duration-300 overflow-hidden">
                <img src="/assets/images/logo-tt.png" alt="Tiktok" className="w-full h-full object-cover" />
              </a>
            </div>
          </div>

          {/* Trụ sở chính */}
          <div className="flex flex-col h-full gap-4">
            <div>
              <h4 className="font-bold uppercase tracking-widest text-sm text-showcase-primary mb-4">TRỤ SỞ CHÍNH</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-3"><EnvironmentOutlined className="mt-1 text-showcase-primary shrink-0" /> Toà nhà VIMECO, Phạm Hùng, Cầu Giấy, Hà Nội</li>
                <li className="flex items-center gap-3"><PhoneOutlined className="text-showcase-primary shrink-0" /> 0326 908 884</li>
              </ul>
            </div>
            <div className="border border-gray-100 rounded overflow-hidden flex-1 min-h-[180px] w-full shadow-sm transition-all duration-500">
              <iframe
                title="Map Trụ sở chính"
                src="https://www.google.com/maps?q=To%C3%A0+nh%C3%A0+VIMECO,+Ph%E1%BA%A1m+H%C3%B9ng,+C%E1%BA%A7u+Gi%E1%BA%A5y,+H%C3%A0+N%E1%BB%99i&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
              ></iframe>
            </div>
          </div>

          {/* Văn phòng giao dịch */}
          <div className="flex flex-col h-full gap-4">
            <div>
              <h4 className="font-bold uppercase tracking-widest text-sm text-showcase-primary mb-4">VĂN PHÒNG GIAO DỊCH</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-3"><EnvironmentOutlined className="mt-1 text-showcase-primary shrink-0" /> Ngõ 21 Tả Thanh Oai, Đại Thanh, Hà Nội</li>
                <li className="flex items-center gap-3"><PhoneOutlined className="text-showcase-primary shrink-0" /> 0326 908 884</li>
              </ul>
            </div>
            <div className="border border-gray-100 rounded overflow-hidden flex-1 min-h-[180px] w-full shadow-sm transition-all duration-500">
              <iframe
                title="Map Văn phòng giao dịch"
                src="https://www.google.com/maps?q=Ng%C3%B5+21+T%E1%BA%A3+Thanh+Oai,+%C4%90%E1%BA%A1i+Thanh,+H%C3%A0+N%E1%BB%99i&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
              ></iframe>
            </div>
          </div>

          {/* Xưởng sản xuất */}
          <div className="flex flex-col h-full gap-4">
            <div>
              <h4 className="font-bold uppercase tracking-widest text-sm text-showcase-primary mb-4">XƯỞNG SẢN XUẤT</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-3"><EnvironmentOutlined className="mt-1 text-showcase-primary shrink-0" /> Ngõ 41 Tả Thanh Oai, Đại Thanh, Hà Nội</li>
                <li className="flex items-center gap-3"><PhoneOutlined className="text-showcase-primary shrink-0" /> 0326 908 884</li>
              </ul>
            </div>
            <div className="border border-gray-100 rounded overflow-hidden flex-1 min-h-[180px] w-full shadow-sm transition-all duration-500">
              <iframe
                title="Map Xưởng sản xuất"
                src="https://www.google.com/maps?q=Ng%C3%B5+41+T%E1%BA%A3+Thanh+Oai,+%C4%90%E1%BA%A1i+Thanh,+H%C3%A0+N%E1%BB%99i&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
              ></iframe>
            </div>
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
