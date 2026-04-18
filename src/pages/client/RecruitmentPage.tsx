import React, { useState } from 'react';
import Container from '@/src/features/showcase/components/ui/Container';
import Button from '@/src/features/showcase/components/ui/Button';
import Badge from '@/src/features/showcase/components/ui/Badge';
import SEO from '@/src/components/common/SEO';
import { message } from 'antd';
import {
  PlusOutlined,
  CrownOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  CheckCircleFilled
} from '@ant-design/icons';
import { useApplicationService } from '@/src/api/services';
import toast from 'react-hot-toast';

const RecruitmentPage: React.FC = () => {
  const { create: submitApplication, loading, request: appRequest } = useApplicationService();
  const [recruitmentInfo, setRecruitmentInfo] = React.useState<{
    title?: string;
    content?: string;
    position?: string;
    required?: string[];
    isActive?: boolean;
  } | null>(null);

  React.useEffect(() => {
    appRequest('GET', '/info')
      .then((res: any) => { if (res?.data) setRecruitmentInfo(res.data); })
      .catch(() => { });
  }, []);
  const [formData, setFormData] = useState({
    position: '', // default empty
    fullName: '',
    phone: '',
    gender: 'Nam', // map directly for backend ENUM
    address: '',
    age: '',
    experience: '',
    note: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.position.trim()) newErrors.position = 'Vui lòng nhập vị trí ứng tuyển';
    if (!formData.fullName.trim()) newErrors.fullName = 'Vui lòng nhập họ tên';
    if (!formData.phone.trim()) newErrors.phone = 'Vui lòng nhập số điện thoại';
    else if (!/^\d{10,11}$/.test(formData.phone)) newErrors.phone = 'Số điện thoại không hợp lệ';
    if (!formData.address.trim()) newErrors.address = 'Vui lòng nhập địa chỉ';
    if (!formData.age) newErrors.age = 'Vui lòng nhập độ tuổi';
    if (!formData.experience) newErrors.experience = 'Vui lòng nhập số năm kinh nghiệm';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      try {
        await submitApplication({
          ...formData,
          age: Number(formData.age),
          experience: Number(formData.experience)
        });
        toast.success('Cảm ơn bạn đã ứng tuyển! Chúng tôi sẽ liên hệ lại sớm nhất.');
        setFormData({
          position: '',
          fullName: '',
          phone: '',
          gender: 'Nam',
          address: '',
          age: '',
          experience: '',
          note: ''
        });
      } catch (err) {
        // error handled by useApi interceptor usually
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
        title="Tuyển dụng - Việc làm Nội Thất Hochi"
        description="Nội Thất Hochi tuyển dụng: kiến trúc sư, thợ mộc, nhân viên kinh doanh, thiết kế nội thất. Môi trường chuyên nghiệp, lương cao, thưởng xứng đáng."
        canonicalPath="/tuyen-dung"
        keywords="tuyển dụng nội thất, việc làm thiết kế nội thất, tuyển kiến trúc sư, tuyển thợ mộc, tìm việc nội thất hà nội"
        breadcrumbs={[
          { name: 'Trang chủ', url: '/' },
          { name: 'Tuyển dụng', url: '/tuyen-dung' },
        ]}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'JobPosting',
          title: 'Nhiều vị trí tuyển dụng',
          description: 'Nội Thất Hochi tuyển dụng nhiều vị trí: kiến trúc sư, thợ mộc, nhân viên kinh doanh nội thất.',
          hiringOrganization: {
            '@type': 'Organization',
            name: 'Nội Thất Hochi',
            sameAs: 'https://www.noithathochi.vn',
          },
          jobLocation: {
            '@type': 'Place',
            address: {
              '@type': 'PostalAddress',
              addressLocality: 'Hà Nội',
              addressCountry: 'VN',
            },
          },
          employmentType: 'FULL_TIME',
          datePosted: new Date().toISOString().split('T')[0],
        }}
      />

      {/* Premium Hero Section */}
      <section className="relative h-125 flex items-center pt-20">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=2000"
            alt="Interior Luxury Office"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/70"></div>
        </div>
        <Container className="relative z-10 text-center text-white">
          <Badge variant="gold" className="mb-6 uppercase tracking-[0.3em]">CƠ HỘI NGHỀ NGHIỆP</Badge>
          <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-widest leading-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
            KIẾN TẠO <br /> GIÁ TRỊ NGHỆ THUẬT
          </h1>
          <p className="mt-6 text-gray-300 max-w-2xl mx-auto font-light leading-relaxed">
            Nội Thất Hochi tìm kiếm những đồng nghiệp tài năng để cùng xây dựng những không gian sống đẳng cấp nhất Việt Nam.
          </p>
        </Container>
      </section>

      {/* Recruitment Info Section — trước Tại sao chọn Hochi */}
      {recruitmentInfo?.isActive && (
        <section className="py-20 bg-white border-b border-gray-100">
          <Container>
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <Badge variant="gold" className="uppercase tracking-[0.2em]">CƠ HỘI NGHỀ NGHIỆP</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-teal-950 uppercase leading-snug" style={{ fontFamily: "'Inter', sans-serif" }}>
                {recruitmentInfo.title}
              </h2>
              <div className="w-20 h-1 bg-showcase-primary mx-auto" />
              {recruitmentInfo.content && (
                <p className="text-gray-500 leading-relaxed text-lg max-w-2xl mx-auto">
                  {recruitmentInfo.content}
                </p>
              )}
              {recruitmentInfo.position && (
                <p className="inline-block bg-showcase-primary/10 text-showcase-primary font-semibold px-5 py-2 rounded-full text-sm">
                  {recruitmentInfo.position}
                </p>
              )}
              {recruitmentInfo.required && recruitmentInfo.required.length > 0 && (
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 text-left">
                  {recruitmentInfo.required.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <CheckCircleFilled className="text-showcase-primary mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600 text-sm leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-10 pt-4">
                <button
                  onClick={() => {
                    document.getElementById('recruitment-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="bg-[#cca32e] cursor-pointer   text-white font-bold uppercase tracking-widest px-10 py-4 rounded-full hover:bg-teal-950 transition-colors shadow-lg hover:shadow-xl"
                >
                  Ứng tuyển ngay
                </button>
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* Benefits Section */}
      <section className="py-24 bg-gray-50 border-b border-gray-100">
        <Container>
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl font-bold text-teal-950 uppercase tracking-widest" style={{ fontFamily: "'Inter', sans-serif" }}>TẠI SAO CHỌN HOCHI?</h2>
            <div className="w-20 h-1 bg-showcase-primary mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <CrownOutlined />, title: 'Môi trường Chuyên nghiệp', desc: 'Làm việc trong không gian hiện đại, quy trình chuẩn, tiếp xúc với khách hàng cao cấp và tác phong chuyên nghiệp.' },
              { icon: <ThunderboltOutlined />, title: 'Sáng tạo không giới hạn', desc: 'Mọi ý tưởng kiến trúc độc bản luôn được tôn trọng và hiện thực hóa.' },
              { icon: <TeamOutlined />, title: 'Đội ngũ chuyên gia', desc: 'Đồng hành cùng những nghệ nhân và kiến trúc sư hàng đầu trong nghề nội thất.' },
              { icon: <PlusOutlined />, title: 'Chế độ đãi ngộ', desc: 'Thưởng xứng đáng theo năng lực và các kỳ nghỉ dưỡng cao cấp hàng năm.' }
            ].map((benefit, i) => (
              <div key={i} className="bg-white p-10 rounded-2xl shadow-sm hover:shadow-xl transition-all border border-transparent hover:border-showcase-primary/20 group">
                <div className="text-4xl text-showcase-primary mb-6 transition-transform group-hover:scale-110 duration-300">
                  {benefit.icon}
                </div>
                <h3 className="text-lg font-bold text-teal-950 mb-3">{benefit.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Form Section */}
      <section id="recruitment-form" className="py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-showcase-light opacity-50 -z-10 skew-x-12 transform translate-x-1/2"></div>
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
            {/* Form Info */}
            <div className="space-y-10 py-6">
              <div className="space-y-4">
                <Badge variant="gold">ỨNG TUYỂN NGAY</Badge>
                <h2 className="text-4xl font-bold text-teal-950 uppercase leading-snug" style={{ fontFamily: "'Inter', sans-serif" }}>GIA NHẬP <br />ĐỘI NGŨ HOCHI</h2>
                <div className="w-20 h-1 bg-showcase-primary"></div>
              </div>

              <div className="prose prose-gray">
                <p className="text-gray-600 leading-relaxed text-lg">
                  {recruitmentInfo?.content || 'Chúng tôi tìm kiếm những cá nhân đam mê thiết kế và nội thất cao cấp, khao khát kiến tạo những không gian sống mang dấu ấn riêng và giá trị thẩm mỹ khác biệt.'}
                </p>
                <ul className="space-y-4 mt-8">
                  {(recruitmentInfo?.required || [
                    'Quy trình làm việc chuyên nghiệp, minh bạch và chuẩn mực.',
                    'Sử dụng vật liệu cao cấp, được tuyển chọn theo tiêu chuẩn chất lượng khắt khe.',
                    'Tham gia các dự án biệt thự, penthouse đẳng cấp trên toàn quốc.',
                    'Môi trường phát triển toàn diện về tư duy thiết kế và kỹ năng nghề nghiệp.'
                  ]).map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-500">
                      <CheckCircleFilled className="text-showcase-primary" /> {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-teal-950 p-8 rounded-2xl text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <h4 className="text-showcase-primary font-bold uppercase tracking-widest text-sm mb-2">Hotline Tuyển dụng</h4>
                <p className="text-2xl font-bold">032.690.8884</p>
                <p className="text-xs text-gray-400 mt-2">Hỗ trợ 24/7 cho các ứng viên</p>
              </div>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-8 md:p-12 border-t-8 border-showcase-primary">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-2">Vị trí ứng tuyển *</label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    placeholder="VD: Kiến trúc sư..."
                    className={`w-full px-5 py-4 bg-gray-50 rounded-xl border ${errors.position ? 'border-red-500' : 'border-transparent focus:border-showcase-primary'} outline-none transition-all placeholder:text-gray-300`}
                  />
                  {errors.position && <p className="mt-1 text-[10px] text-red-500 uppercase tracking-wider">{errors.position}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-2">Họ và tên *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Nhập đầy đủ họ tên"
                    className={`w-full px-5 py-4 bg-gray-50 rounded-xl border ${errors.fullName ? 'border-red-500' : 'border-transparent focus:border-showcase-primary'} outline-none transition-all placeholder:text-gray-300`}
                  />
                  {errors.fullName && <p className="mt-1 text-[10px] text-red-500 uppercase tracking-wider">{errors.fullName}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-2">Số điện thoại *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Số điện thoại"
                      className={`w-full px-5 py-4 bg-gray-50 rounded-xl border ${errors.phone ? 'border-red-500' : 'border-transparent focus:border-showcase-primary'} outline-none transition-all placeholder:text-gray-300`}
                    />
                    {errors.phone && <p className="mt-1 text-[10px] text-red-500 uppercase tracking-wider">{errors.phone}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-2">Giới tính</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-5 py-4 bg-gray-50 rounded-xl border border-transparent focus:border-showcase-primary outline-none transition-all bg-white font-medium"
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-2">Địa chỉ hiện tại *</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Số nhà, đường, tỉnh/thành phố"
                    className={`w-full px-5 py-4 bg-gray-50 rounded-xl border ${errors.address ? 'border-red-500' : 'border-transparent focus:border-showcase-primary'} outline-none transition-all placeholder:text-gray-300`}
                  />
                  {errors.address && <p className="mt-1 text-[10px] text-red-500 uppercase tracking-wider">{errors.address}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-2">Độ tuổi *</label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      placeholder="Số tuổi"
                      className={`w-full px-5 py-4 bg-gray-50 rounded-xl border ${errors.age ? 'border-red-500' : 'border-transparent focus:border-showcase-primary'} outline-none transition-all placeholder:text-gray-300`}
                    />
                    {errors.age && <p className="mt-1 text-[10px] text-red-500 uppercase tracking-wider">{errors.age}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-2">Kinh nghiệm (năm) *</label>
                    <input
                      type="number"
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      placeholder="Ví dụ: 3"
                      className={`w-full px-5 py-4 bg-gray-50 rounded-xl border ${errors.experience ? 'border-red-500' : 'border-transparent focus:border-showcase-primary'} outline-none transition-all placeholder:text-gray-300`}
                    />
                    {errors.experience && <p className="mt-1 text-[10px] text-red-500 uppercase tracking-wider">{errors.experience}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-2">Ghi chú thêm</label>
                  <textarea
                    name="note"
                    value={formData.note}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Thông tin thêm..."
                    className="w-full px-5 py-4 bg-gray-50 rounded-xl border border-transparent focus:border-showcase-primary outline-none transition-all placeholder:text-gray-300 resize-none"
                  ></textarea>
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-teal-950 text-white py-5 rounded-xl font-bold uppercase tracking-[0.3em] hover:bg-showcase-primary transition-all shadow-xl hover:shadow-showcase-primary/20 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? 'ĐANG GỬI...' : 'GỬI HỒ SƠ ỨNG TUYỂN'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default RecruitmentPage;
