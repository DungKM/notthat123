import React, { useState } from 'react';
import Container from '../ui/Container';
import { StarFilled, UserOutlined } from '@ant-design/icons';
import { message } from 'antd';
import { useTranslation } from 'react-i18next';
import { useReviewService } from '@/src/api/services';

interface FeedbackItem {
  id: string | number;
  name: string;
  avatar: string;
  rating: number;
  content: string;
  date: string;
}

const Feedback: React.FC = () => {
  const { t } = useTranslation();
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const { create, request } = useReviewService();

  React.useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const res = await request('GET', '', null, { page: 1, limit: 10 });
        if (res.data) {
          const formatted = res.data.map((r: any) => ({
            id: r.id || r._id,
            name: r.fullName,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(r.fullName)}&background=random`,
            rating: r.rating || 5,
            content: r.description,
            date: new Date(r.createdAt || Date.now()).toLocaleDateString('vi-VN'),
          }));
          setFeedbacks(formatted);
        }
      } catch (error) {
        console.error('Lỗi khi tải danh sách đánh giá', error);
      }
    };
    fetchFeedbacks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // State cho form đánh giá
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    rating: 5,
    content: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleRatingClick = (ratingValue: number) => {
    setFormData((prev) => ({ ...prev, rating: ratingValue }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    let { name, value } = e.target;
    
    if (name === 'name') {
      value = value.replace(/[^\p{L}\s]/gu, '');
    }

    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error if user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = t('feedback.error_name');
    if (!formData.phone.trim()) {
      newErrors.phone = t('feedback.error_phone');
    } else if (!/^\d{10,11}$/.test(formData.phone)) {
      newErrors.phone = t('feedback.error_phone_invalid');
    }
    if (!formData.content.trim()) newErrors.content = t('feedback.error_content');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      try {
        const payload = {
          fullName: formData.name,
          phone: formData.phone,
          description: formData.content,
          rating: formData.rating,
        };

        await create(payload);

        // Hiển thị ngay feedback mới lên UI
        const newFeedback: FeedbackItem = {
          id: Date.now(),
          name: formData.name,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`,
          rating: formData.rating,
          content: formData.content,
          date: new Date().toLocaleDateString('vi-VN'),
        };

        setFeedbacks([newFeedback, ...feedbacks]);

        // Reset form
        setFormData({
          name: '',
          phone: '',
          rating: 5,
          content: '',
        });
      } catch (error) {
        // error msg handled by hook
      }
    } else {
      message.error(t('feedback.error_fill'));
    }
  };

  // Hàm render số lượng sao tương ứng
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, idx) => (
      <StarFilled
        key={idx}
        style={{
          fontSize: 24,
          color: idx < rating ? "#facc15" : "#e5e7eb"
        }}
      />
    ));
  };

  return (
    <section className="py-10 lg:py-24 bg-gray-50 border-t border-gray-100">
      <Container>
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-teal-950 uppercase tracking-widest mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>
            {t('feedback.title')}
          </h2>
          <div className="w-24 h-1 bg-[#C5A059] mx-auto rounded-full"></div>
          <p className="mt-6 text-gray-500 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            {t('feedback.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Cột hiển thị danh sách đánh giá */}
          <div className="lg:col-span-7 space-y-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {feedbacks.map((fb) => (
              <div key={fb.id} className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden flex-shrink-0 border-2 border-[#C5A059]/30">
                    <img src={fb.avatar} alt={fb.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h4 className="font-bold text-gray-900 text-base">{fb.name}</h4>
                        <span className="text-xs text-gray-400">{fb.date}</span>
                      </div>
                      <div className="flex gap-1">
                        {renderStars(fb.rating)}
                      </div>
                    </div>
                    <p className="text-gray-600 mt-3 text-sm md:text-base leading-relaxed">
                      "{fb.content}"
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Cột Form đánh giá */}
          <div className="lg:col-span-5 relative">
            <div className="sticky top-28 bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100/50 relative overflow-hidden">
              {/* Trang trí góc */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-showcase-primary/5 rounded-bl-full -z-10"></div>

              <div className="mb-8">
                <h3 className="text-2xl font-bold text-teal-950 mb-2">{t('feedback.form_title')}</h3>
                <p className="text-gray-500 text-sm">{t('feedback.form_desc')}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Rating Selector */}
                <div className="mb-6">
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-2">{t('feedback.rating_label')}</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRatingClick(star)}
                        className="focus:outline-none transition-transform hover:scale-110"
                      >
                        <StarFilled
                          style={{
                            fontSize: 24,
                            color: star <= formData.rating ? "#facc15" : "#e5e7eb"
                          }}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder={t('feedback.name_placeholder')}
                      className={`w-full px-4 py-3.5 bg-gray-50 rounded-xl border ${errors.name ? 'border-red-500' : 'border-transparent focus:border-showcase-primary'} outline-none transition-all placeholder:text-gray-400 text-sm font-medium`}
                    />
                    {errors.name && <p className="mt-1 text-[10px] text-red-500 uppercase tracking-widest">{errors.name}</p>}
                  </div>

                  <div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder={t('feedback.phone_placeholder')}
                      className={`w-full px-4 py-3.5 bg-gray-50 rounded-xl border ${errors.phone ? 'border-red-500' : 'border-transparent focus:border-showcase-primary'} outline-none transition-all placeholder:text-gray-400 text-sm font-medium`}
                    />
                    {errors.phone && <p className="mt-1 text-[10px] text-red-500 uppercase tracking-widest">{errors.phone}</p>}
                  </div>
                </div>

                <div>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    rows={4}
                    placeholder={t('feedback.content_placeholder')}
                    className={`w-full px-4 py-3.5 bg-gray-50 rounded-xl border ${errors.content ? 'border-red-500' : 'border-transparent focus:border-showcase-primary'} outline-none transition-all placeholder:text-gray-400 text-sm font-medium resize-none`}
                  ></textarea>
                  {errors.content && <p className="mt-1 text-[10px] text-red-500 uppercase tracking-widest">{errors.content}</p>}
                </div>

                <button
                  type="submit"
                  className="w-full bg-teal-950 text-white py-4 rounded-xl font-bold uppercase tracking-[0.2em] text-sm hover:bg-[#C5A059] transition-all shadow-lg hover:shadow-[#C5A059]/30"
                >
                  {t('feedback.submit')}
                </button>
              </form>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Feedback;
