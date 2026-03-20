import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Container from '@/src/features/showcase/components/ui/Container';
import SEO from '@/src/components/common/SEO';
import Badge from '@/src/features/showcase/components/ui/Badge';
import ProductCard from '@/src/features/showcase/components/ui/ProductCard';
import { ArrowLeftOutlined, EnvironmentOutlined, CalendarOutlined, FullscreenOutlined } from '@ant-design/icons';
import { useConstructionService } from '@/src/api/services';

const ProjectDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { request, loading } = useConstructionService();

  const [project, setProject] = useState<any>(null);
  const [relatedProjects, setRelatedProjects] = useState<any[]>([]);
  const [error, setError] = useState(false);

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
        console.error('Failed to fetch project detail:', e);
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
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Không tìm thấy công trình</h2>
        <Link to="/cong-trinh" className="text-showcase-primary hover:underline flex items-center justify-center gap-2">
          <ArrowLeftOutlined /> Quay lại danh sách công trình
        </Link>
      </div>
    );
  }

  const categoryName = project.categoryId?.name || 'Công trình';
  const coverImage = project.images && project.images.length > 0 ? project.images[0].url : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80';
  const gallery = project.images && project.images.length > 1 ? project.images.slice(1) : [];

  return (
    <div className="bg-white">
      <SEO title={project.name} description={project.description || 'Chi tiết công trình Thiết kế Nội thất Hochi'} />

      <main className="pt-28 pb-20">
        <Container>
          {/* Breadcrumb + Back */}
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="text-xs md:text-sm text-gray-500 font-medium flex flex-wrap items-center gap-1">
              <Link to="/" className="hover:text-showcase-primary transition-colors">
                Trang chủ
              </Link>
              <span className="text-gray-400">/</span>
              <Link to="/cong-trinh" className="hover:text-showcase-primary transition-colors">
                Công trình
              </Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-800 line-clamp-1">{project.name}</span>
            </div>

            <Link
              to="/cong-trinh"
              className="inline-flex items-center gap-2 text-xs md:text-sm text-gray-500 hover:text-showcase-primary transition-colors"
            >
              <ArrowLeftOutlined className="text-xs" />
              Quay lại danh sách công trình
            </Link>
          </div>

          <div className="max-w-6xl mx-auto">
            {/* Top layout */}
            <div className="grid grid-cols-1 gap-12 xl:gap-16">
              {/* Main content */}
              <article className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Cover image */}
                <div className="relative h-[260px] sm:h-[340px] md:h-[420px]">
                  <img
                    src={coverImage}
                    alt={project.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 text-white">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <Badge variant="gold">{categoryName}</Badge>
                      {project.year && (
                        <span className="inline-flex items-center text-xs font-semibold uppercase tracking-widest bg-black/40 px-3 py-1 rounded-full">
                          <CalendarOutlined className="mr-1 text-[10px]" />
                          {project.year}
                        </span>
                      )}
                      {project.area && (
                        <span className="inline-flex items-center text-xs font-semibold uppercase tracking-widest bg-black/40 px-3 py-1 rounded-full">
                          <FullscreenOutlined className="mr-1 text-[10px]" />
                          {project.area} m²
                        </span>
                      )}
                    </div>
                    <h1
                      className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      {project.name}
                    </h1>
                    {project.location && (
                      <p className="mt-3 flex items-center text-xs sm:text-sm text-gray-100">
                        <EnvironmentOutlined className="mr-2 text-xs" />
                        {project.location}
                      </p>
                    )}
                  </div>
                </div>

                {/* Body */}
                <div className="p-6 sm:p-10 space-y-10">
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
                          GALLERY CÔNG TRÌNH
                        </h2>
                        <span className="text-xs text-gray-400 font-medium">
                          {gallery.length + 1} hình ảnh
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {gallery.map((image: any, index: number) => (
                          <div
                            key={image._id || image.id || index}
                            className="relative aspect-4/3 rounded-2xl overflow-hidden group border border-gray-100 bg-gray-100"
                          >
                            <img
                              src={image.url}
                              alt={`${project.name} ${index + 2}`}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              </article>
            </div>

            {/* Related projects */}
            {relatedProjects.length > 0 && (
              <section className="mt-20 md:mt-24 border-t border-gray-100 pt-12 md:pt-16">
                <div className="text-center mb-10 space-y-4">
                  <Badge variant="gold">CÔNG TRÌNH LIÊN QUAN</Badge>
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
                    const pCatName = p.categoryId?.name || 'Công trình';
                    const pCover = p.images && p.images.length > 0 ? p.images[0].url : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80';
                    return (
                      <ProductCard
                        key={p._id || p.id}
                        basePath="/cong-trinh"
                        slug={p.slug || String(p._id || p.id)}
                        title={p.name}
                        category={pCatName}
                        image={pCover}
                        tag={pCatName.toUpperCase()}
                      />
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        </Container>
      </main>
    </div>
  );
};

export default ProjectDetailPage;
