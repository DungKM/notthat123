import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Container from '@/src/features/showcase/components/ui/Container';
import SEO from '@/src/components/common/SEO';
import Badge from '@/src/features/showcase/components/ui/Badge';
import ProductCard from '@/src/features/showcase/components/ui/ProductCard';
import { ArrowLeftOutlined, ArrowRightOutlined, EnvironmentOutlined, CalendarOutlined, FullscreenOutlined, UserOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons';
import { useArchitectureService } from '@/src/api/services';
import { Image } from 'antd';
import InterestModal from '@/src/components/common/InterestModal';
import toast from 'react-hot-toast';

const ArchitectureDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { request, loading } = useArchitectureService();

  const [project, setProject] = useState<any>(null);
  const [relatedProjects, setRelatedProjects] = useState<any[]>([]);
  const [error, setError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [isInterestModalOpen, setIsInterestModalOpen] = useState(false);

  useEffect(() => {
    if (!slug) return;

    window.scrollTo({ top: 0, behavior: 'smooth' });

    const fetchDetail = async () => {
      try {
        const res = await request('GET', `/${slug}`);
        if (res?.data) {
          setProject(res.data);
          // Fetch related projects by category
          if (res.data.categoryId?._id || res.data.categoryId?.id) {
            const catId = res.data.categoryId._id || res.data.categoryId.id;
            const relatedRes = await request('GET', '', null, { categoryId: catId, limit: 3 });
            if (relatedRes?.data) {
              setRelatedProjects(relatedRes.data.filter((p: any) => (p._id || p.id) !== (res.data._id || res.data.id)));
            }
          }
        } else {
          setError(true);
        }
      } catch (e) {
        console.error('Failed to fetch architecture detail:', e);
        setError(true);
      }
    };

    fetchDetail();
  }, [slug, request]);

  if (loading && !project) {
    return (
      <div className="bg-white min-h-screen pt-40 pb-20 text-center">
        <p className="text-gray-400 animate-pulse text-lg">Đang tải thông tin chi tiết...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="bg-white min-h-screen pt-40 pb-20 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Không tìm thấy thiết kế kiến trúc</h2>
        <Link to="/thiet-ke-kien-truc" className="text-showcase-primary hover:underline flex items-center justify-center gap-2">
          <ArrowLeftOutlined /> Quay lại danh sách thiết kế
        </Link>
      </div>
    );
  }

  const categoryName = project.categoryId?.name || 'Thiết kế kiến trúc';
  const allImages = project.images && project.images.length > 0 ? project.images : [{ url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80' }];
  const currentImage = allImages[currentImageIndex].url;
  const coverImage = allImages[0].url;

  const gallery = project.images && project.images.length > 0 ? project.images : [];

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  return (
    <div className="bg-white">
      <SEO
        title={project.name}
        description={project.description || `Thiết kế ${project.name} - Thiết kế kiến trúc cao cấp bởi Nội Thất Hochi. Xem ảnh và thông tin chi tiết.`}
        canonicalPath={`/thiet-ke-kien-truc/${slug}`}
        ogImage={coverImage}
        ogImageAlt={project.name}
        keywords={`${project.name}, ${categoryName}, thiết kế kiến trúc hochi, kiến trúc${project.location ? ', ' + project.location : ''}`}
        breadcrumbs={[
          { name: 'Trang chủ', url: '/' },
          { name: 'Thiết kế kiến trúc', url: '/thiet-ke-kien-truc' },
          { name: categoryName, url: '/thiet-ke-kien-truc' },
          { name: project.name, url: `/thiet-ke-kien-truc/${slug}` },
        ]}
      />

      <main className="pt-28 pb-20">
        <Container>
          {/* BREADCRUMB */}
          <div className="text-[13px] !text-gray-500 mb-6 font-medium">
            <Link to="/" className="hover:text-showcase-primary !text-gray-500">Trang chủ</Link>
            <span className="mx-2">/</span>
            <Link to="/thiet-ke-kien-truc" className="hover:text-showcase-primary !text-gray-500">Thiết kế kiến trúc</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{project.name}</span>
          </div>

          <div className="max-w-6xl mx-auto">
            {/* Top layout */}
            <div className="grid grid-cols-1 gap-12 xl:gap-16">
              {/* Main content */}
              <article className="bg-white shadow-sm border border-gray-100">
                <Image.PreviewGroup>

                  {/* Slider Ảnh */}
                  <div className="p-4 sm:p-6 lg:p-8 bg-gray-50/50 border-b border-gray-100 rounded-t-xl">
                    <div className="relative w-full max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-md group border border-gray-200">
                      <div className="w-full aspect-[4/3] md:aspect-[16/9] relative flex items-center justify-center bg-gray-100 [&_.ant-image]:!flex [&_.ant-image]:!justify-center [&_.ant-image]:!w-full [&_.ant-image]:!h-full [&_.ant-image-img]:!w-full [&_.ant-image-img]:!h-full [&_.ant-image-img]:!object-cover">
                        <Image
                          src={currentImage}
                          alt={project.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>

                      {allImages.length > 1 && (
                        <>
                          <button
                            onClick={prevImage}
                            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/90 hover:bg-showcase-primary hover:text-white text-gray-800 rounded-full shadow-lg z-10 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <ArrowLeftOutlined />
                          </button>
                          <button
                            onClick={nextImage}
                            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/90 hover:bg-showcase-primary hover:text-white text-gray-800 rounded-full shadow-lg z-10 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <ArrowRightOutlined />
                          </button>
                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium tracking-widest shadow-sm">
                            {currentImageIndex + 1} / {allImages.length}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="p-6 sm:px-10 sm:pt-8 sm:pb-2">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <Badge variant="gold">{categoryName}</Badge>
                      {project.year && (
                        <span className="inline-flex items-center text-xs font-semibold uppercase tracking-widest bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                          <CalendarOutlined className="mr-1 text-[10px]" />
                          {project.year}
                        </span>
                      )}
                      {project.area && (
                        <span className="inline-flex items-center text-xs font-semibold uppercase tracking-widest bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                          <FullscreenOutlined className="mr-1 text-[10px]" />
                          {project.area} m²
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mt-2">
                      <div className="flex-1">
                        <h1
                          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-gray-900"
                          style={{ fontFamily: "'Inter', sans-serif" }}
                        >
                          {project.name}
                        </h1>
                        {project.location && (
                          <p className="mt-3 flex items-center text-xs sm:text-sm text-gray-500">
                            <EnvironmentOutlined className="mr-2 text-xs" />
                            {project.location}
                          </p>
                        )}
                      </div>
                      <div className="shrink-0 mt-2 sm:mt-1 relative inline-flex self-start">
                        <div className="absolute inset-0 bg-[#cca32e] rounded opacity-40 animate-ping" style={{ animationDuration: '2s' }}></div>
                        <button
                          onClick={() => setIsInterestModalOpen(true)}
                          className="relative h-10 px-8 bg-white border-2 border-[#cca32e] text-[#cca32e] hover:bg-[#cca32e] hover:text-white font-bold rounded transition-colors text-[13px] tracking-wide cursor-pointer inline-flex items-center uppercase"
                        >
                          Quan tâm
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6 sm:px-10 sm:pb-10 space-y-10">
                    {/* Excerpt */}
                    {project.description && (
                      <p className="text-base sm:text-lg text-gray-700 leading-relaxed border-l-4 border-showcase-primary pl-4 sm:pl-6 whitespace-pre-line">
                        {project.description}
                      </p>
                    )}

                    {/* Gallery */}
                    {gallery && gallery.length > 0 && (
                      <section className="space-y-4 pt-6">
                        <div className="flex items-center justify-between">
                          <h2
                            className="text-lg sm:text-xl font-bold uppercase tracking-[0.25em] text-teal-950"
                            style={{ fontFamily: "'Inter', sans-serif" }}
                          >
                            GALLERY THIẾT KẾ
                          </h2>
                          <span className="text-xs text-gray-400 font-medium">
                            {gallery.length + 1} hình ảnh
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 [&_.ant-image]:!w-full [&_.ant-image]:!h-full [&_.ant-image-img]:!w-full [&_.ant-image-img]:!h-full [&_.ant-image-img]:!object-cover">
                          {gallery.map((image: any, index: number) => (
                            <div
                              key={image._id || image.id || index}
                              className="relative aspect-4/3 overflow-hidden group border border-gray-100 bg-gray-100 cursor-pointer"
                            >
                              <Image
                                src={image.url}
                                alt={`${project.name} ${index + 2}`}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            </div>
                          ))}
                        </div>
                      </section>
                    )}
                  </div>
                </Image.PreviewGroup>
              </article>
            </div>

            {/* Related projects */}
            {relatedProjects.length > 0 && (
              <section className="mt-20 md:mt-24 border-t border-gray-100 pt-12 md:pt-16">
                <div className="text-center mb-10 space-y-4">
                  <Badge variant="gold">THIẾT KẾ LIÊN QUAN</Badge>
                  <h2
                    className="text-2xl md:text-3xl font-bold uppercase tracking-[0.25em] text-teal-950"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    GỢI Ý DÀNH CHO BẠN
                  </h2>
                  <div className="w-16 h-1 bg-showcase-primary mx-auto" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {relatedProjects.map((p) => {
                    const pCatName = p.categoryId?.name || 'Thiết kế kiến trúc';
                    const pCover = p.images && p.images.length > 0 ? p.images[0].url : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80';
                    return (
                      <ProductCard
                        key={p._id || p.id}
                        basePath="/thiet-ke-kien-truc"
                        slug={p.slug || String(p._id || p.id)}
                        title={p.name}
                        category={pCatName}
                        image={pCover}
                        tag={pCatName.toUpperCase()}
                        likes={p.likeCount || p.likes}
                      />
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        </Container>
      </main>

      <InterestModal
        isOpen={isInterestModalOpen}
        onClose={() => setIsInterestModalOpen(false)}
        entityName={project?.name || ''}
        entityTypeText="thiết kế"
        entityId={String(project?.id || project?._id || '')}
        entityType="Architecture"
      />

    </div>
  );
};

export default ArchitectureDetailPage;
