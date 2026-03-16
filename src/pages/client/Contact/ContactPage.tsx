import React from 'react';
import Container from '@/src/features/showcase/components/ui/Container';
import {
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import Button from '@/src/features/showcase/components/ui/Button';
import SEO from '@/src/components/common/SEO';

const ContactPage: React.FC = () => {
  return (
    <div className="bg-white">
      <SEO
        title="Liên hệ"
        description="Liên hệ với Nội Thất Hochi để được tư vấn thiết kế và thi công nội thất gỗ óc chó cao cấp. Địa chỉ showroom tại Hà Nội, Quảng Ninh và Quảng Bình."
      />

      {/* Page Header */}
      <section className="relative h-[400px] flex items-center pt-20">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1600"
            alt="Contact Office"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60"></div>
        </div>
        <Container className="relative z-10 text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-widest" style={{ fontFamily: "'Inter', sans-serif" }}>LIÊN HỆ</h1>
        </Container>
      </section>

      {/* Contact Content */}
      <section className="py-24">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Info Column */}
            <div className="space-y-12">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-teal-950 uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>NỘI THẤT 102</h2>
                <div className="w-20 h-1 bg-[#C5A059]"></div>
              </div>

              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-teal-900 border border-gray-100 shadow-sm">
                    <EnvironmentOutlined className="text-xl" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1 leading-snug">Showroom: Tầng 3 Tòa nhà 31 Nguyễn Xiển - Thanh Xuân - Hà Nội</h4>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-teal-900 border border-gray-100 shadow-sm">
                    <EnvironmentOutlined className="text-xl" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1 leading-snug">Chi Nhánh Quảng Ninh : BIỆT THỰ BT05 KHU ĐÔ THỊ GREEN PARK - TP MÓNG CÁI - TỈNH QUẢNG NINH.</h4>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-teal-900 border border-gray-100 shadow-sm">
                    <EnvironmentOutlined className="text-xl" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1 leading-snug">Chi Nhánh Quảng Bình : 57 NGUYỄN ĐÌNH CHIỂU - THÀNH PHỐ ĐỒNG HỚI - TỈNH QUẢNG BÌNH</h4>
                  </div>
                </div>
              </div>

              <div className="pt-8 space-y-4 border-t border-gray-100">
                <div className="flex items-center gap-3 text-lg">
                  <PhoneOutlined className="text-[#C5A059]" />
                  <span className="font-bold">Hotline: <span className="text-teal-700">091.1972.789</span></span>
                </div>
                <div className="flex items-center gap-3 text-lg">
                  <MailOutlined className="text-[#C5A059]" />
                  <span className="font-bold">Email: <span className="text-teal-700">NOITHAT102.VN@GMAIL.COM</span></span>
                </div>
                <div className="flex items-center gap-3 text-lg">
                  <GlobalOutlined className="text-[#C5A059]" />
                  <span className="font-bold">Website: <a href="https://noithat102.vn" className="text-teal-700 hover:underline">https://noithat102.vn</a></span>
                </div>
              </div>
            </div>

            {/* Form Column */}
            <div className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-50 space-y-8">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-teal-950 uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>LIÊN HỆ</h3>
                <p className="text-gray-500 text-sm leading-relaxed">Nhận ngay ưu đãi đặc biệt từ Showroom & tư vấn miễn phí từ đội ngũ kiến trúc sư của chúng tôi</p>
              </div>

              <form className="space-y-6">
                <input type="text" placeholder="Họ tên" className="w-full px-4 py-3 border border-gray-200 rounded-md focus:border-teal-700 outline-none transition-colors" />
                <input type="tel" placeholder="Số điện thoại" className="w-full px-4 py-3 border border-gray-200 rounded-md focus:border-teal-700 outline-none transition-colors" />
                <input type="email" placeholder="Email" className="w-full px-4 py-3 border border-gray-200 rounded-md focus:border-teal-700 outline-none transition-colors" />
                <input type="text" placeholder="Địa chỉ căn hộ" className="w-full px-4 py-3 border border-gray-200 rounded-md focus:border-teal-700 outline-none transition-colors" />
                <textarea rows={4} placeholder="Lời nhắn của bạn" className="w-full px-4 py-3 border border-gray-200 rounded-md focus:border-teal-700 outline-none transition-colors resize-none"></textarea>
                <Button className="bg-teal-900 border-none px-12 py-4 uppercase font-bold tracking-widest hover:bg-black transition-all">ĐĂNG KÝ</Button>
              </form>
            </div>
          </div>
        </Container>
      </section>

      {/* Map Section */}
      <div className="h-[350px] md:h-[500px] w-full bg-gray-100 grayscale hover:grayscale-0 transition-all duration-700">
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
  );
};

export default ContactPage;
