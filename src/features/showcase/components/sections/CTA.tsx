import React from 'react';
import Container from '../ui/Container';
import Button from '../ui/Button';
import { PlusOutlined } from '@ant-design/icons';

const CTA: React.FC = () => {
  return (
    <section className="py-24 bg-gray-50">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* FAQ Column */}
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-teal-950 uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>CÂU HỎI THƯỜNG GẶP</h2>
            <div className="space-y-4">
              {[
                { q: 'Dịch vụ thiết kế thi công trọn gói gồm những gì?', a: 'Bao gồm khảo sát hiện trạng, lên ý tưởng 3D, bản vẽ kĩ thuật và thi công lắp đặt hoàn thiện.' },
                { q: 'Thời gian thi công một công trình biệt thự là bao lâu?', a: 'Thông thường khoảng 45-60 ngày tùy thuộc vào quy mô và mức độ chi tiết của thiết kế.' },
                { q: 'Tại sao nên chọn Nội Thất 102?', a: 'Chúng tôi cam kết chất lượng gỗ chuẩn quốc tế, bảo hành 5 năm và đội ngũ chuyên gia tận tâm.' }
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
              <h3 className="text-2xl font-bold italic" style={{ fontFamily: "'Inter', sans-serif" }}>ĐĂNG KÝ NHẬN TƯ VẤN</h3>
              <p className="text-xs text-gray-400 font-light">Ưu đãi ngay 10% phí thiết kế cho khách hàng mới</p>
            </div>
            
            <form className="space-y-4">
              <input 
                type="text" 
                placeholder="Họ và tên của bạn" 
                className="w-full bg-white text-gray-900 px-4 py-3 rounded-md focus:ring-2 focus:ring-showcase-primary outline-none text-sm" 
              />
              <input 
                type="tel" 
                placeholder="Số điện thoại liên hệ" 
                className="w-full bg-white text-gray-900 px-4 py-3 rounded-md focus:ring-2 focus:ring-showcase-primary outline-none text-sm" 
              />
              <select className="w-full bg-white text-gray-500 px-4 py-3 rounded-md shadow-sm focus:ring-2 focus:ring-showcase-primary outline-none text-sm">
                <option>Chọn loại công trình</option>
                <option>Biệt thự</option>
                <option>Chung cư</option>
                <option>Nhà phố</option>
              </select>
              <textarea 
                rows={3} 
                placeholder="Nội dung cần tư vấn" 
                className="w-full bg-white text-gray-900 px-4 py-3 rounded-md focus:ring-2 focus:ring-showcase-primary outline-none text-sm resize-none"
              ></textarea>
              <Button fullWidth className="bg-showcase-primary border-none py-4 text-xs font-bold tracking-widest hover:scale-[1.02] hover:bg-showcase-hover">ĐĂNG KÝ NGAY</Button>
            </form>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default CTA;
