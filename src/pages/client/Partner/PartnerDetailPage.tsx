import React from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import Container from "@/src/features/showcase/components/ui/Container";
import SEO from "@/src/components/common/SEO";
import { ArrowLeftOutlined } from "@ant-design/icons";

export const partnersData = [
  {
    slug: "aoc-gigabyte-suunto",
    year: "2025",
    title: "AOC, Gigabyte, Suunto",
    description:
      "Digiworld trở thành đối tác chiến lược của các thương hiệu màn hình, laptop nổi tiếng toàn cầu: AOC, Gigabyte",
    image: "https://picsum.photos/id/102/4320/3240",
    content: "Chi tiết về sự hợp tác chiến lược giữa Digiworld và các thương hiệu hàng đầu như AOC, Gigabyte, Suunto. Mở ra kỷ nguyên mới cho các thiết bị công nghệ hiện đại tại thị trường Việt Nam.",
  },
  {
    slug: "poly-msi-versuni-tp-link-younger-farm-kospet",
    year: "2024",
    title: "Poly, MSI, Versuni (Philips), TP-Link, Younger Farm, Kospet",
    description: "Mở rộng danh mục đối tác chiến lược trong năm 2024.",
    image: "https://images.unsplash.com/photo-1531297172868-9f1d1b5380f2?auto=format&fit=crop&q=80",
    content: "Mở rộng danh mục đối tác chiến lược cùng những thương hiệu thiết bị gia dụng và mạng uy tín toàn cầu, đánh dấu bước phát triển mới trong năm 2024.",
  },
  {
    slug: "lotte-chilsung-weeting-house",
    year: "2023",
    title: "Lotte Chilsung, Weeting House",
    description: "Hợp tác thương mại chiến lược.",
    image: "https://images.unsplash.com/photo-1556761175-5973dd0f32e7?auto=format&fit=crop&q=80",
    content: "Đồng hành và phát triển cùng Lotte Chilsung và Weeting House, mang đến các sản phẩm tiêu dùng chất lượng cao.",
  },
  {
    slug: "ab-inbev",
    year: "2022",
    title: "AB Inbev",
    description: "Mở rộng ngành hàng tiêu dùng.",
    image: "https://images.unsplash.com/photo-1600217036496-039162db80ff?auto=format&fit=crop&q=80",
    content: "Thỏa thuận phân phối các sản phẩm đồ uống cao cấp từ AB Inbev vào thị trường Việt Nam.",
  },
  {
    slug: "whirlpool-joyoung",
    year: "2021",
    title: "Whirlpool, Joyoung",
    description: "Đối tác thiết bị gia dụng hàng đầu.",
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80",
    content: "Hợp tác toàn diện cùng Whirlpool và Joyoung để cung cấp các giải pháp gia dụng thông minh cho mọi gia đình.",
  },
  {
    slug: "apple-huawei",
    year: "2020",
    title: "Apple, Huawei",
    description: "Đối tác công nghệ đỉnh cao.",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80",
    content: "Cột mốc đáng nhớ khi trở thành nhà phân phối chính thức cho Apple và Huawei, hai ông lớn công nghệ thế giới.",
  },
  {
    slug: "htc-nestle",
    year: "2019",
    title: "HTC, Nestle",
    description: "Đa dạng hóa danh mục sản phẩm.",
    image: "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&q=80",
    content: "Ký kết đối tác song phương với HTC trong lĩnh vực công nghệ và Nestle trong thị trường FMCG.",
  },
  {
    slug: "nokia-eaton",
    year: "2018",
    title: "Nokia, EATON",
    description: "Giải pháp viễn thông và năng lượng.",
    image: "https://images.unsplash.com/photo-1574406280735-351fc1a7c5e0?auto=format&fit=crop&q=80",
    content: "Phân phối thiết bị mạng Nokia và các giải pháp quản lý năng lượng từ EATON.",
  },
  {
    slug: "xiaomi-infofabrica",
    year: "2017",
    title: "Xiaomi, InfoFabrica",
    description: "Đột phá thiết bị di động.",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80",
    content: "Sự kiện lịch sử đưa thương hiệu Xiaomi đến với đông đảo người tiêu dùng Việt Nam qua kênh phân phối chính hãng.",
  },
];

const PartnerDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const partner = partnersData.find((p) => p.slug === slug);

  if (!partner) {
    return <Navigate to="/doi-tac" replace />;
  }

  return (
    <div className="bg-gray-50 flex flex-col">
      <SEO
        title={`${partner.title} - Đối tác`}
        description={partner.description || partner.title}
      />

      <main className="flex-grow pt-28 pb-20">
        <Container>
          <div className="mb-8">
            <Link
              to="/doi-tac"
              className="inline-flex items-center text-gray-500 hover:text-orange-500 transition-colors font-medium"
            >
              <ArrowLeftOutlined className="mr-2" />
              Quay lại danh sách đối tác
            </Link>
          </div>

          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
            {/* Hero Banner for Detail */}
            <div className="w-full h-[400px] md:h-[500px] relative">
              <img
                src={partner.image}
                alt={partner.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
              
              <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white">
                <span className="inline-block px-4 py-1.5 bg-orange-500 text-white rounded-full font-bold text-sm tracking-wider mb-4">
                  ĐỐI TÁC CHIẾN LƯỢC {partner.year}
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4 shadow-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {partner.title}
                </h1>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-8 md:p-16 max-w-4xl mx-auto">
              {partner.description && (
                <p className="text-2xl text-teal-950 font-semibold mb-8 leading-relaxed">
                  {partner.description}
                </p>
              )}
              
              <div className="w-20 h-1 bg-orange-500 mb-8"></div>
              
              <div className="prose prose-lg max-w-none text-gray-600 leading-loose">
                <p>{partner.content}</p>
                <p className="mt-6">
                  Chúng tôi tin tưởng rằng mối quan hệ hợp tác này sẽ mang lại những giá trị thiết thực và lâu dài. Không chỉ cung cấp các sản phẩm chất lượng cao, hai bên còn hướng tới việc đem đến trải nghiệm người dùng tuyệt vời và các dịch vụ hậu mãi xuất sắc.
                </p>
              </div>

              <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <h3 className="text-sm uppercase tracking-widest text-gray-500 font-bold mb-2">Thương hiệu</h3>
                  <p className="text-xl font-semibold text-teal-950">{partner.title}</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <h3 className="text-sm uppercase tracking-widest text-gray-500 font-bold mb-2">Năm hợp tác</h3>
                  <p className="text-xl font-semibold text-orange-500">{partner.year}</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </main>
    </div>
  );
};

export default PartnerDetailPage;
