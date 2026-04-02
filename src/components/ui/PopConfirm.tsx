import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';

interface PopConfirmProps {
  title: string;
  description?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  okText?: string;
  cancelText?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactElement;
}

const PopConfirm: React.FC<PopConfirmProps> = ({
  title,
  description,
  onConfirm,
  onCancel,
  okText = 'Xác nhận',
  cancelText = 'Hủy',
  placement = 'top',
  children,
}) => {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const POP_W = 230;

  const calcPosition = () => {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    const sy = window.scrollY, sx = window.scrollX;
    switch (placement) {
      case 'bottom': setCoords({ top: r.bottom + sy + 10, left: r.left + sx + r.width / 2 - POP_W / 2 }); break;
      case 'left':   setCoords({ top: r.top + sy + r.height / 2, left: r.left + sx - POP_W - 10 }); break;
      case 'right':  setCoords({ top: r.top + sy + r.height / 2, left: r.right + sx + 10 }); break;
      default:       setCoords({ top: r.top + sy - 10, left: r.left + sx + r.width / 2 - POP_W / 2 });
    }
  };

  useEffect(() => {
    if (visible) calcPosition();
  }, [visible]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target as Node) &&
        !(e.target as Element)?.closest?.('#custom-popconfirm')
      ) setVisible(false);
    };
    if (visible) document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [visible]);

  const handleConfirm = (e: React.MouseEvent) => {
    e.stopPropagation();
    setVisible(false);
    onConfirm();
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setVisible(false);
    onCancel?.();
  };

  const transformOrigin =
    placement === 'bottom' ? 'top center' :
    placement === 'left'   ? 'right center' :
    placement === 'right'  ? 'left center' : 'bottom center';

  const translateOffset =
    placement === 'bottom' ? 'translateY(-6px)' :
    placement === 'left'   ? 'translateX(6px)'  :
    placement === 'right'  ? 'translateX(-6px)' : 'translateY(6px)';

  const portal = visible ? ReactDOM.createPortal(
    <>
      <style>{`
        @keyframes pcIn {
          from { opacity:0; transform: ${translateOffset} scale(0.9); }
          to   { opacity:1; transform: translateY(0) translateX(0) scale(1); }
        }
        #custom-popconfirm {
          animation: pcIn 0.18s cubic-bezier(0.34,1.56,0.64,1);
        }
        .pc-cancel:hover { background: #f3f4f6 !important; }
        .pc-ok:hover { filter: brightness(1.08); }
      `}</style>
      <div
        id="custom-popconfirm"
        style={{
          position: 'absolute',
          top: coords.top,
          left: coords.left,
          width: POP_W,
          zIndex: 99999,
          transformOrigin,
          /* Glassmorphism card */
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderRadius: 14,
          boxShadow: '0 12px 40px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid rgba(255,255,255,0.7)',
          padding: '14px 16px',
          fontFamily: "'Inter', system-ui, sans-serif",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Icon + title */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
          {/* Custom trash icon */}
          <div style={{
            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
            background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(238,90,36,0.35)',
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4h6v2" />
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#111', lineHeight: 1.3 }}>{title}</div>
            {description && (
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 3, lineHeight: 1.5 }}>{description}</div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(0,0,0,0.07)', margin: '10px 0' }} />

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            className="pc-cancel"
            onClick={handleCancel}
            style={{
              padding: '5px 14px', borderRadius: 8,
              border: '1px solid #e5e7eb', background: '#fff',
              fontSize: 12, fontWeight: 600, color: '#374151',
              cursor: 'pointer', transition: 'background 0.15s',
            }}
          >
            {cancelText}
          </button>
          <button
            className="pc-ok"
            onClick={handleConfirm}
            style={{
              padding: '5px 14px', borderRadius: 8, border: 'none',
              background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
              fontSize: 12, fontWeight: 700, color: '#fff',
              cursor: 'pointer', transition: 'filter 0.15s',
              boxShadow: '0 4px 12px rgba(238,90,36,0.3)',
            }}
          >
            {okText}
          </button>
        </div>
      </div>
    </>,
    document.body
  ) : null;

  return (
    <div ref={triggerRef} style={{ position: 'relative', display: 'inline-flex' }}>
      {React.cloneElement(children, {
        onClick: (e: React.MouseEvent) => {
          e.stopPropagation();
          setVisible(v => !v);
        },
      } as any)}
      {portal}
    </div>
  );
};

export default PopConfirm;
