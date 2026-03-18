import React from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import Container from '@/src/features/showcase/components/ui/Container';
import SEO from '@/src/components/common/SEO';
import Badge from '@/src/features/showcase/components/ui/Badge';
import ProductCard from '@/src/features/showcase/components/ui/ProductCard';
import { ArrowLeftOutlined, EnvironmentOutlined, CalendarOutlined, FullscreenOutlined } from '@ant-design/icons';
import { MOCK_SHOWCASE_PROJECTS } from '@/src/mockData';

const projectsData = MOCK_SHOWCASE_PROJECTS;

const ProjectDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const project = projectsData.find((p) => p.slug === slug);

  if (!project) {
    return <Navigate to="/cong-trinh" replace />;
  }

  const relatedProjects = projectsData.filter(
    (p) => p.slug !== project.slug && (p.category === project.category || !project.category),
  );

  return (
    <div className="bg-white">
      <SEO title={project.title} description={project.excerpt} />

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
              <span className="text-gray-800 line-clamp-1">{project.title}</span>
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
                    src={project.coverImage}
                    alt={project.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 text-white">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <Badge variant="gold">{project.category}</Badge>
                      {project.year && (
                        <span className="inline-flex items-center text-xs font-semibold uppercase tracking-widest bg-black/40 px-3 py-1 rounded-full">
                          <CalendarOutlined className="mr-1 text-[10px]" />
                          {project.year}
                        </span>
                      )}
                      {project.area && (
                        <span className="inline-flex items-center text-xs font-semibold uppercase tracking-widest bg-black/40 px-3 py-1 rounded-full">
                          <FullscreenOutlined className="mr-1 text-[10px]" />
                          {project.area}
                        </span>
                      )}
                    </div>
                    <h1
                      className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      {project.title}
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
                  <p className="text-base sm:text-lg text-gray-700 leading-relaxed border-l-4 border-showcase-primary pl-4 sm:pl-6">
                    {project.excerpt}
                  </p>

                  {/* Info grid
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-gray-50 rounded-2xl p-5 sm:p-6 border border-gray-100">
                  {project.location && (
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.25em] text-gray-400 font-semibold mb-1">Địa điểm</p>
                      <p className="text-sm font-semibold text-gray-900">{project.location}</p>
                    </div>
                  )}
                  {project.year && (
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.25em] text-gray-400 font-semibold mb-1">Năm thực hiện</p>
                      <p className="text-sm font-semibold text-gray-900">{project.year}</p>
                    </div>
                  )}
                  {project.area && (
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.25em] text-gray-400 font-semibold mb-1">Diện tích</p>
                      <p className="text-sm font-semibold text-gray-900">{project.area}</p>
                    </div>
                  )}
                </div> */}

                  {/* Content paragraphs */}
                  <div className="space-y-6">
                    {project.content.map((paragraph, index) => (
                      <p key={index} className="text-sm sm:text-base text-gray-700 leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>

                  {/* Gallery */}
                  {project.gallery && project.gallery.length > 0 && (
                    <section className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h2
                          className="text-lg sm:text-xl font-bold uppercase tracking-[0.25em] text-teal-950"
                          style={{ fontFamily: "'Inter', sans-serif" }}
                        >
                          GALLERY CÔNG TRÌNH
                        </h2>
                        <span className="text-xs text-gray-400 font-medium">
                          {project.gallery.length} hình ảnh thực tế
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {project.gallery.map((image, index) => (
                          <div
                            key={index}
                            className="relative aspect-4/3 rounded-2xl overflow-hidden group border border-gray-100 bg-gray-100"
                          >
                            <img
                              src={image}
                              alt={`${project.title} ${index + 1}`}
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
                  {relatedProjects.map((p) => (
                    <ProductCard
                      key={p.slug}
                      basePath="/cong-trinh"
                      slug={p.slug}
                      title={p.title}
                      category={p.category}
                      image={p.coverImage}
                      tag={p.category === 'Nhà ở' ? 'NHÀ Ở' : p.category === 'Thương mại' ? 'THƯƠNG MẠI' : 'CÔNG NGHIỆP'}
                    />
                  ))}
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

