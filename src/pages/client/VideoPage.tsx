import React from 'react';
import Container from '@/src/features/showcase/components/ui/Container';
import { PlayCircleFilled } from '@ant-design/icons';
import SEO from '@/src/components/common/SEO';

const VideoPage: React.FC = () => {
  const videos = [
    {
      title: 'Biệt thự Gamuda Gardens',
      desc: 'Thi công hoàn thiện nội thất Gỗ Óc Chó',
      image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=800'
    },
    {
      title: 'Căn hộ Penthouse Skylake',
      desc: 'Thiết kế sang trọng phong cách hiện đại',
      image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=800'
    },
    {
      title: 'Biệt thự Vinhomes Riverside',
      desc: 'Nội thất tân cổ điển đẳng cấp',
      image: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&q=80&w=800'
    },
    {
      title: 'Thi công Showroom 102 Hà Nội',
      desc: 'Không gian trưng bày đẳng cấp',
      image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=800'
    },
    {
      title: 'Nội thất phòng khách gỗ óc chó',
      desc: 'Sự tinh tế trong từng đường nét',
      image: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&q=80&w=800'
    },
    {
      title: 'Phòng ngủ Master ấm cúng',
      desc: 'Kiến tạo không gian nghỉ ngơi lý tưởng',
      image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=800'
    },
  ];

  return (
    <div className="bg-white">
      <SEO 
        title="Video" 
        description="Tổng hợp các video thực tế thi công nội thất gỗ óc chó tại các công trình tiêu biểu của Hochi."
      />

      {/* Page Header */}
      <section className="relative h-[400px] flex items-center pt-20">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1600"
            alt="Contact Office"
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/60"></div>
        </div>
        <Container className="relative z-10 text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-widest" style={{ fontFamily: "'Inter', sans-serif" }}>VIDEO</h1>
        </Container>
      </section>

      {/* Video Grid */}
      <section className="py-20 bg-gray-50">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videos.map((v, i) => (
              <div key={i} className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500">
                <div className="relative aspect-video overflow-hidden">
                  <img src={v.image} alt={v.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 flex items-center justify-center transition-all">
                    <PlayCircleFilled className="text-5xl text-white/90 drop-shadow-lg" />
                  </div>
                </div>
                <div className="p-6 space-y-2">
                  <h3 className="font-bold text-gray-900 group-hover:text-teal-900 transition-colors uppercase text-sm tracking-wide" style={{ fontFamily: "'Inter', sans-serif" }}>{v.title}</h3>
                  <p className="text-gray-500 text-xs font-light leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Button */}
          <div className="mt-16 text-center">
            <button className="px-12 py-4 border-2 border-teal-900 text-teal-900 font-bold text-xs uppercase tracking-[0.3em] hover:bg-teal-900 hover:text-white transition-all">TẢI THÊM VIDEO</button>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default VideoPage;
