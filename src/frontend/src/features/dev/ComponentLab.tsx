import React, { useMemo, useState, useEffect } from 'react';
import { useResponsive } from '@common';
import { VibeInfoPopup } from '@features/vibes';
import type { Pin } from '@features/map/types/map';

function makeMockPin(opts?: Partial<Pin>): Pin {
  const base: Pin = {
    id: 'demo-1' as any,
    name: 'Demo Memory',
    description: 'A short demo description for the popup refactor. Resize to test responsive layouts.',
    musicLink: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    isOwner: true,
    isPrivate: false,
    lat: 0,
    lng: 0,
    owner: null as any,
    timestamp: Date.now(),
  };
  return { ...base, ...opts } as Pin;
}

const InfoPill: React.FC<{ label: string; value: string | number | boolean }> = ({ label, value }) => (
  <div className="px-2 py-1 text-xs rounded-full bg-white/10 border border-white/20 text-white/90">
    <span className="font-semibold">{label}:</span> <span>{String(value)}</span>
  </div>
);

const ComponentLab: React.FC = () => {
  const device = useResponsive();
  const [showPinPopup, setShowPinPopup] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [canReopenControls, setCanReopenControls] = useState(true);

  // Controls for the VibeInfoPopup demo
  const [hasMedia, setHasMedia] = useState(true);
  const [hasDescription, setHasDescription] = useState(true);
  const [isOwner, setIsOwner] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);

  const demoPin = useMemo(() => {
    return makeMockPin({
      isOwner,
      isPrivate,
      musicLink: hasMedia ? 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' : undefined,
      description: hasDescription ? 'This is a long description to test line wrapping and layout across breakpoints.' : undefined,
    });
  }, [hasMedia, hasDescription, isOwner, isPrivate]);

  // No popup dragging — component controls its own layout

  // Close on Escape key
  useEffect(() => {
    if (!showPinPopup) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowPinPopup(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showPinPopup]);

  return (
    <div className="h-full w-full flex flex-col">
      {/* Top bar with responsive info */}
      <div className="sticky top-0 z-10 w-full bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 border-b border-white/10 text-white">
        <div className="max-w-[1400px] mx-auto px-3 py-2 flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold mr-1">Responsive Info</span>
          <InfoPill label="device" value={device.deviceType} />
          <InfoPill label="layout" value={device.layoutType} />
          <InfoPill label="orientation" value={device.orientation} />
          <InfoPill label="width" value={device.screenWidth} />
          <InfoPill label="height" value={device.screenHeight} />
          <div className="ml-auto flex items-center gap-2">
            <button
              className="px-3 py-1.5 rounded-lg bg-indigo-500/90 hover:bg-indigo-600/90 border border-indigo-400/50 text-white text-sm shadow cursor-pointer"
              onClick={() => {
                setShowControls(true);
                setCanReopenControls(true);
                setShowPinPopup(true);
              }}
            >
              Open VibeInfoPopup
            </button>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-[1400px] mx-auto w-full px-3 py-3">
        <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
          <div className="text-sm font-semibold mb-2">VibeInfoPopup Controls</div>
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={hasMedia} onChange={(e) => setHasMedia(e.target.checked)} />
              Has media (musicLink)
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={hasDescription} onChange={(e) => setHasDescription(e.target.checked)} />
              Has description
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={isOwner} onChange={(e) => setIsOwner(e.target.checked)} />
              Is owner (can edit/delete)
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} />
              Is private
            </label>
          </div>
        </div>
      </div>

      {/* Playground area */}
      <div className="flex-1 min-h-0 p-4 grid place-items-center">
        <div className="text-gray-600 text-sm">Resize the window to see the current layout above. Click the button to open the VibeInfoPopup demo.</div>
      </div>

      {/* Overlay for the component under test */}
      {showPinPopup && (
        <div
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px] grid place-items-center p-2"
          onClick={() => setShowPinPopup(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <VibeInfoPopup
              vibe={demoPin}
              onViewProfile={() => alert('View profile')}
              onEdit={() => alert('Edit')}
              onDelete={() => alert('Delete')}
              onClose={() => setShowPinPopup(false)}
              showPrivacy
              showTimestamp
              modalLayout
            />
          </div>
        </div>
      )}

      {/* Floating controls panel (always above everything) */}
      {showPinPopup && showControls && (
        <FloatingControls
          isOpen={showPinPopup}
          hasMedia={hasMedia}
          setHasMedia={setHasMedia}
          hasDescription={hasDescription}
          setHasDescription={setHasDescription}
          isOwner={isOwner}
          setIsOwner={setIsOwner}
          isPrivate={isPrivate}
          setIsPrivate={setIsPrivate}
          openPopup={() => {
            setShowControls(true);
            setCanReopenControls(true);
            setShowPinPopup(true);
          }}
          closePopup={() => setShowPinPopup(false)}
          onHide={() => {
            setShowControls(false);
            setCanReopenControls(true);
          }}
          onCloseControls={() => {
            setShowControls(false);
            setCanReopenControls(false);
          }}
        />
      )}

      {/* Reopen controls button when panel is hidden but popup is open */}
      {showPinPopup && !showControls && canReopenControls && (
        <button
          className="fixed z-[100] top-3 right-3 px-3 py-1.5 rounded-lg bg-white/90 border border-gray-200 shadow text-sm cursor-pointer hover:bg-white"
          onClick={() => setShowControls(true)}
          title="Show controls panel"
        >
          Show Controls
        </button>
      )}
    </div>
  );
};

export default ComponentLab;

// Floating controls component
const FloatingControls: React.FC<{
  isOpen: boolean;
  hasMedia: boolean;
  setHasMedia: (v: boolean) => void;
  hasDescription: boolean;
  setHasDescription: (v: boolean) => void;
  isOwner: boolean;
  setIsOwner: (v: boolean) => void;
  isPrivate: boolean;
  setIsPrivate: (v: boolean) => void;
  openPopup: () => void;
  closePopup: () => void;
  onHide: () => void;
  onCloseControls: () => void;
}> = ({
  isOpen,
  hasMedia,
  setHasMedia,
  hasDescription,
  setHasDescription,
  isOwner,
  setIsOwner,
  isPrivate,
  setIsPrivate,
  openPopup,
  closePopup,
  onHide,
  onCloseControls,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  // Draggable control panel position
  const [pos, setPos] = useState<{ x: number; y: number }>(() => ({
    x: typeof window !== 'undefined' ? window.innerWidth - 360 : 980,
    y: 16,
  }));
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState<{ dx: number; dy: number }>({ dx: 0, dy: 0 });

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const nx = Math.max(8, Math.min(w - 320 - 8, e.clientX - offset.dx));
      const ny = Math.max(8, Math.min(h - 200, e.clientY - offset.dy));
      setPos({ x: nx, y: ny });
    };
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const nx = Math.max(8, Math.min(w - 320 - 8, t.clientX - offset.dx));
      const ny = Math.max(8, Math.min(h - 200, t.clientY - offset.dy));
      setPos({ x: nx, y: ny });
    };
    const stop = () => setDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', stop);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', stop);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', stop);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', stop);
    };
  }, [dragging, offset.dx, offset.dy]);

  return (
    <div className="fixed z-[100] max-w-xs w-[320px]" style={{ left: pos.x, top: pos.y }}>
      <div className="rounded-xl border border-gray-200 bg-white/95 shadow-xl overflow-hidden">
        <div
          className="flex items-center justify-between px-3 py-2 border-b border-gray-100 bg-gray-50/70"
          style={{ cursor: 'grab' }}
          onMouseDown={(e) => {
            setDragging(true);
            const rect = (e.currentTarget.parentElement?.parentElement as HTMLElement)?.getBoundingClientRect?.();
            setOffset({ dx: e.clientX - (rect?.left ?? pos.x), dy: e.clientY - (rect?.top ?? pos.y) });
          }}
          onTouchStart={(e) => {
            const t = e.touches[0];
            if (!t) return;
            setDragging(true);
            const rect = (e.currentTarget.parentElement?.parentElement as HTMLElement)?.getBoundingClientRect?.();
            setOffset({ dx: t.clientX - (rect?.left ?? pos.x), dy: t.clientY - (rect?.top ?? pos.y) });
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900">VibeInfoPopup Controls</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${isOpen ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-700 border-slate-200'}`}>{isOpen ? 'OPEN' : 'CLOSED'}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              className="px-2 py-1 rounded-md text-xs bg-white border border-gray-200 hover:bg-gray-50 cursor-pointer"
              onClick={onCloseControls}
              title="Close controls (remove)"
              aria-label="Close controls"
            >
              ✕
            </button>
            <button
              className="px-2 py-1 rounded-md text-xs bg-white border border-gray-200 hover:bg-gray-50 cursor-pointer"
              onClick={onHide}
              title="Hide panel (reopen available)"
            >
              Hide
            </button>
            <button
              className="px-2 py-1 rounded-md text-xs bg-white border border-gray-200 hover:bg-gray-50 cursor-pointer"
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? 'Expand panel' : 'Collapse panel'}
            >
              {collapsed ? 'Expand' : 'Collapse'}
            </button>
          </div>
        </div>

        {!collapsed && (
          <div className="p-3 space-y-3">
            <div className="grid grid-cols-1 gap-2 text-sm">
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" checked={hasMedia} onChange={(e) => setHasMedia(e.target.checked)} />
                Has media (musicLink)
              </label>
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" checked={hasDescription} onChange={(e) => setHasDescription(e.target.checked)} />
                Has description
              </label>
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" checked={isOwner} onChange={(e) => setIsOwner(e.target.checked)} />
                Is owner (can edit/delete)
              </label>
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} />
                Is private
              </label>
            </div>

            <div className="flex items-center gap-2">
              {!isOpen ? (
                <button
                  className="flex-1 px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 cursor-pointer"
                  onClick={openPopup}
                >
                  Open Popup
                </button>
              ) : (
                <button
                  className="flex-1 px-3 py-2 rounded-lg bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 cursor-pointer"
                  onClick={closePopup}
                >
                  Close Popup
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
