import React, { useEffect } from 'react';
import Container from '@/src/features/showcase/components/ui/Container';
import { PlayCircleFilled, CloseOutlined } from '@ant-design/icons';
import { Modal } from 'antd';
import SEO from '@/src/components/common/SEO';
import { useVideoService } from '@/src/api/services';

const getYoutubeId = (url: string) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const getYoutubeThumb = (url: string) => {
  const id = getYoutubeId(url);
  if (id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  return 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&q=80&w=800';
};

const VideoCardSkeleton = () => (
  <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm animate-pulse">
    <div className="relative aspect-video overflow-hidden bg-gray-200" />
    <div className="p-6 space-y-4">
      <div className="h-4 w-3/4 bg-gray-200 rounded" />
      <div className="h-3 w-1/3 bg-gray-200 rounded" />
    </div>
  </div>
);

const VideoPage: React.FC = () => {
  const { list: videos, getAll, loading } = useVideoService();
  const [selectedVideoUrl, setSelectedVideoUrl] = React.useState<string | null>(null);
  const [limit, setLimit] = React.useState(9);

  useEffect(() => {
    getAll({ limit });
  }, [getAll, limit]);

  const handleLoadMore = () => {
    setLimit(prev => prev + 9);
  };

  const hasMore = videos.length >= limit;

  return (
    <div className="bg-white">
      <SEO
        title="Video thi công nội thất thực tế - Nội Thất Hochi"
        description="Xem video thực tế thi công nội thất gỗ cao cấp của Nội Thất Hochi: biệt thự, căn hộ, penthouse. Xem kết quả rực rỡ từ những công trình thực tế."
        canonicalPath="/video"
        keywords="video nội thất, video thi công nội thất, youtube nội thất hochi, video thiết kế nội thất"
        breadcrumbs={[
          { name: 'Trang chủ', url: '/' },
          { name: 'Video', url: '/video' },
        ]}
      />

      {/* Page Header */}
      <section className="relative h-60 md:h-75 flex items-center pt-20">
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
          <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-widest mt-4" style={{ fontFamily: "'Inter', sans-serif" }}>VIDEO</h1>
        </Container>
      </section>

      {/* Video Grid */}
      <section className="py-20 bg-gray-50">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <VideoCardSkeleton key={i} />)
            ) : videos.map((v, i) => (
              <div
                key={v.id || i}
                onClick={() => setSelectedVideoUrl(v.url)}
                className="group cursor-pointer bg-white rounded-2xl overflow-hidden  transition-all duration-500"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img src={getYoutubeThumb(v.url)} alt={v.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 flex items-center justify-center transition-all">
                    <svg
                      width="64"
                      height="64"
                      viewBox="0 0 64 64"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="drop-shadow-lg transition-transform duration-300 group-hover:scale-110"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M32 64C49.673 64 64 49.673 64 32C64 14.327 49.673 0 32 0C14.327 0 0 14.327 0 32C0 49.673 14.327 64 32 64ZM26 20V44L44 32L26 20Z"
                        fill="rgba(255, 255, 255, 0.95)"
                      />
                    </svg>
                  </div>
                </div>
                <div className="p-6 space-y-2">
                  <h2 className="font-bold text-amber-700 group-hover:text-amber-800 transition-colors uppercase text-sm tracking-wide" style={{ fontFamily: "'Inter', sans-serif" }}>{v.title}</h2>
                  <p className="text-gray-500 text-xs font-light leading-relaxed">Video công trình</p>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="mt-16 text-center">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="px-12 py-4 border-2 border-teal-900 text-teal-900 font-bold text-xs uppercase tracking-[0.3em] hover:bg-teal-900 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Đang tải...' : 'TẢI THÊM VIDEO'}
              </button>
            </div>
          )}
        </Container>
      </section>

      {/* Video Modal */}
      <Modal
        open={!!selectedVideoUrl}
        onCancel={() => setSelectedVideoUrl(null)}
        footer={null}
        width={1000}
        centered
        destroyOnClose
        closeIcon={<CloseOutlined style={{ color: '#fff', fontSize: '24px', position: 'absolute', right: '-40px', top: '0px' }} />}
        styles={{
          body: { padding: 0, backgroundColor: '#000' },
          content: { padding: 0, overflow: 'visible', backgroundColor: 'transparent', boxShadow: 'none' }
        }}
      >
        {selectedVideoUrl && (
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}> {/* 16:9 Aspect Ratio */}
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src={`https://www.youtube.com/embed/${getYoutubeId(selectedVideoUrl)}?autoplay=1&rel=0`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default VideoPage;
