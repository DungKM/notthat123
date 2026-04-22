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
import { useCompanyInfoQuery } from '@/src/hooks/useCompanyInfoQuery';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const { data: companyInfo } = useCompanyInfoQuery();

  return (
    <footer className="bg-white text-gray-800 pt-8 sm:pt-16 pb-6 sm:pb-8 border-t border-gray-100">
      <Container>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12 border-b border-gray-100 pb-8 sm:pb-12">
          {/* Brand Column */}
          <div className="space-y-4 sm:space-y-6">
            <Link to="/" className="flex items-start gap-2 group cursor-pointer -mt-2">
              <div className="w-[100px] sm:w-[120px] md:w-[140px] lg:w-[160px] xl:w-[180px]">
                <img
                  src={companyInfo?.logo || "/assets/images/image-logo.png"}
                  alt={companyInfo?.name || "Nội Thất Hochi"}
                  className="w-full h-auto object-contain"
                />
              </div>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed">
              {companyInfo?.description || t('footer.brand_desc')}
            </p>
            <div className="flex gap-4">
              {companyInfo?.socialLinks?.facebook && (
                <a href={companyInfo.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-gray-200 rounded-full flex items-center justify-center bg-white shadow-sm hover:shadow hover:scale-110 transition-all duration-300 overflow-hidden">
                  <img src="/assets/images/logo_fb.png" alt="Facebook" className="w-full h-full object-cover" />
                </a>
              )}
              {companyInfo?.socialLinks?.zalo && (
                <a href={companyInfo.socialLinks.zalo} target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-gray-200 rounded-full flex items-center justify-center bg-white shadow-sm hover:shadow hover:scale-110 transition-all duration-300 overflow-hidden">
                  <img src="/assets/images/zalo-logo.png" alt="Zalo" className="w-8 h-8 object-contain" />
                </a>
              )}
              {companyInfo?.socialLinks?.tiktok && (
                <a href={companyInfo.socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-gray-200 rounded-full flex items-center justify-center bg-white shadow-sm hover:shadow hover:scale-110 transition-all duration-300 overflow-hidden">
                  <img src="/assets/images/logo-tt.png" alt="Tiktok" className="w-full h-full object-cover" />
                </a>
              )}
              {companyInfo?.socialLinks?.youtube && (
                <a href={companyInfo.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-gray-200 rounded-full flex items-center justify-center bg-white shadow-sm hover:shadow hover:scale-110 transition-all duration-300 overflow-hidden">
                  <img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" alt="Youtube" className="w-6 h-6 object-cover" />
                </a>
              )}
            </div>
          </div>

          {/* Dynamic Branches */}
          {(companyInfo?.branches || []).map((branch: any, idx: number) => (
            <div key={idx} className="flex flex-col h-full gap-2 sm:gap-0">
              <h4 className="font-bold uppercase tracking-widest text-sm text-showcase-primary mb-1 sm:mb-4">{branch.name}</h4>
              <div className="flex flex-row sm:flex-col items-start sm:items-stretch gap-4 sm:gap-0 flex-1">
                <div className="flex-1">
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-3">
                      <EnvironmentOutlined className="mt-1 text-showcase-primary shrink-0" /> {branch.address}
                    </li>
                    {(branch.phones && branch.phones.length > 0) && (
                      <li className="flex items-start gap-3">
                        <PhoneOutlined className="mt-1 text-showcase-primary shrink-0" />
                        <div className="flex flex-col gap-1">
                          {branch.phones.map((p: any, pIdx: number) => (
                            <span key={pIdx}>
                              {p.number} {p.label ? `(${p.label})` : ''}
                            </span>
                          ))}
                        </div>
                      </li>
                    )}
                  </ul>
                </div>
                <div className="border border-gray-100 rounded overflow-hidden w-[80px] h-[80px] sm:w-full sm:h-[180px] shrink-0 shadow-sm transition-all duration-500 sm:mt-4">
                  <iframe
                    title={`Map ${branch.name}`}
                    src={`https://www.google.com/maps?q=${encodeURIComponent(branch.address)}&output=embed`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={true}
                    loading="lazy"
                  ></iframe>
                </div>
              </div>
            </div>
          ))}
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
