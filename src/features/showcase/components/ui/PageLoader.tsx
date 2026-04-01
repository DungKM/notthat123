import React from 'react';

/* ════════════════════════════════════════
   PageLoader — Loading component bán hàng
   Usage:
     <PageLoader />                    // Full-page spinner
     <PageLoader variant="spinner" />  // Spinner nhỏ
     <PageLoader variant="dots" />     // 3 chấm nhảy
     <PageLoader variant="bar" />      // Progress bar trên đầu
     <SectionSkeleton lines={4} />     // Skeleton block
   ════════════════════════════════════════ */

const styles = `
  @keyframes pl-spin {
    to { transform: rotate(360deg); }
  }
  @keyframes pl-bounce {
    0%, 80%, 100% { transform: scale(0); opacity: 0.3; }
    40%           { transform: scale(1); opacity: 1;   }
  }
  @keyframes pl-bar {
    0%   { left: -35%; right: 100%; }
    60%  { left: 100%; right: -90%; }
    100% { left: 100%; right: -90%; }
  }
  @keyframes pl-bar2 {
    0%   { left: -200%; right: 100%; }
    60%  { left: 107%;  right: -8%;  }
    100% { left: 107%;  right: -8%;  }
  }
  @keyframes pl-shimmer {
    0%   { background-position: -800px 0; }
    100% { background-position: 800px 0;  }
  }
  .pl-spin {
    animation: pl-spin 0.8s linear infinite;
  }
  .pl-dot {
    animation: pl-bounce 1.4s ease-in-out infinite both;
  }
  .pl-dot:nth-child(1) { animation-delay: -0.32s; }
  .pl-dot:nth-child(2) { animation-delay: -0.16s; }
  .pl-bar-inner {
    position: absolute; top: 0; bottom: 0; border-radius: 4px;
    background: var(--pl-color, #c8a96e);
  }
  .pl-bar-inner:first-child { animation: pl-bar  2.1s cubic-bezier(0.65,0.815,0.735,0.395) infinite; }
  .pl-bar-inner:last-child  { animation: pl-bar2 2.1s cubic-bezier(0.165,0.84,0.44,1) 1.15s infinite; }
  .pl-shimmer {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 800px 100%;
    animation: pl-shimmer 1.5s infinite linear;
    border-radius: 6px;
  }
`;

/* ─── Spinner tròn ─── */
const Spinner: React.FC<{ size?: number; color?: string }> = ({
  size = 80,
  color = '#c8a96e',
}) => (
  <svg
    className="pl-spin"
    width={size}
    height={size}
    viewBox="0 0 36 36"
    fill="none"
  >
    <circle cx="18" cy="18" r="15" stroke="#f0ece4" strokeWidth="4" />
    <path
      d="M18 3 A15 15 0 0 1 33 18"
      stroke={color}
      strokeWidth="4"
      strokeLinecap="round"
    />
  </svg>
);

/* ─── 3 chấm nhảy ─── */
const Dots: React.FC<{ color?: string }> = ({ color = '#c8a96e' }) => (
  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="pl-dot"
        style={{
          display: 'inline-block',
          width: 10,
          height: 10,
          borderRadius: '50%',
          backgroundColor: color,
        }}
      />
    ))}
  </div>
);

/* ─── Progress bar ─── */
const Bar: React.FC<{ color?: string }> = ({ color = '#c8a96e' }) => (
  <div
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: 3,
      zIndex: 9999,
      overflow: 'hidden',
      background: `${color}33`,
    }}
  >
    {/* @ts-ignore */}
    <div className="pl-bar-inner" style={{ '--pl-color': color } as any} />
    {/* @ts-ignore */}
    <div className="pl-bar-inner" style={{ '--pl-color': color } as any} />
  </div>
);

/* ─── PageLoader main ─── */
type Variant = 'fullpage' | 'spinner' | 'dots' | 'bar' | 'inline';

interface PageLoaderProps {
  variant?: Variant;
  color?: string;
  size?: number;
  /** Hiện label text phía dưới khi fullpage */
  label?: string;
}


const PageLoader: React.FC<PageLoaderProps> = ({
  variant = 'fullpage',
  color = '#c8a96e',
  size = 80,
  label = 'Đang tải...',
}) => {
  return (
    <>
      <style>{styles}</style>
      {variant === 'bar' && <Bar color={color} />}

      {variant === 'fullpage' && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9998,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(6px)',
            gap: 16,
          }}
        >
          <Spinner size={size} color={color} />
          {label && (
            <p style={{ fontSize: 15, color: '#aaa', fontWeight: 500, letterSpacing: '0.08em', marginTop: 4 }}>
              {label}
            </p>
          )}
        </div>
      )}

      {variant === 'spinner' && <Spinner size={size} color={color} />}
      {variant === 'dots' && <Dots color={color} />}

      {variant === 'inline' && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
          <Dots color={color} />
        </div>
      )}
    </>
  );
};

/* ─── Skeleton block (nhiều dòng) ─── */
export const SectionSkeleton: React.FC<{
  lines?: number;
  gap?: number;
  heights?: number[];
}> = ({ lines = 3, gap = 12, heights }) => (
  <>
    <style>{styles}</style>
    <div style={{ display: 'flex', flexDirection: 'column', gap }}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="pl-shimmer"
          style={{
            height: heights?.[i] ?? (i === 0 ? 24 : i === lines - 1 ? 14 : 18),
            width: i === lines - 1 ? '60%' : '100%',
          }}
        />
      ))}
    </div>
  </>
);

/* ─── Card skeleton grid ─── */
export const CardGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => (
  <>
    <style>{styles}</style>
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: 24,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ borderRadius: 12, overflow: 'hidden' }}>
          <div className="pl-shimmer" style={{ height: 220 }} />
          <div style={{ padding: '12px 4px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="pl-shimmer" style={{ height: 16, width: '80%' }} />
            <div className="pl-shimmer" style={{ height: 14, width: '50%' }} />
          </div>
        </div>
      ))}
    </div>
  </>
);

export default PageLoader;
