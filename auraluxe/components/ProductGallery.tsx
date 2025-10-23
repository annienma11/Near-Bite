'use client';

import { useState } from 'react';

interface ProductGalleryProps {
  images: string[];
  productName: string;
  youtubeUrl?: string | null;
  view360Images?: string[] | null;
}

export default function ProductGallery({ images, productName, youtubeUrl, view360Images }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'images' | 'video' | '360'>('images');
  const [view360Index, setView360Index] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [zoomEnabled, setZoomEnabled] = useState(false);
  const [lensPosition, setLensPosition] = useState({ x: 0, y: 0, percentX: 0, percentY: 0 });
  const [showLens, setShowLens] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(300);

  const handleDragStart = (e: React.MouseEvent) => {
    if (zoomEnabled) return;
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleDragMove = (e: React.MouseEvent) => {
    if (zoomEnabled) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const percentX = (x / rect.width) * 100;
      const percentY = (y / rect.height) * 100;
      setLensPosition({ x, y, percentX, percentY });
      setShowLens(true);
      return;
    }
    if (!isDragging || !view360Images) return;
    const diff = e.clientX - startX;
    if (Math.abs(diff) > 20) {
      const direction = diff > 0 ? -1 : 1;
      setView360Index((prev) => {
        const next = prev + direction;
        if (next < 0) return view360Images.length - 1;
        if (next >= view360Images.length) return 0;
        return next;
      });
      setStartX(e.clientX);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    setShowLens(false);
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
    return `https://www.youtube.com/embed/${videoId}`;
  };

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-cream-100 dark:bg-brown-800 border border-brown-200 dark:border-brown-700 flex items-center justify-center">
        <span className="text-6xl text-gold-500">◇</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-4 border-b border-brown-200 dark:border-brown-700">
        <button
          onClick={() => setActiveTab('images')}
          className={`pb-2 px-4 text-sm transition-colors ${
            activeTab === 'images'
              ? 'text-gold-600 dark:text-gold-400 border-b-2 border-gold-600 dark:border-gold-400'
              : 'text-brown-600 dark:text-cream-300 hover:text-gold-600'
          }`}
        >
          Images
        </button>
        {youtubeUrl && (
          <button
            onClick={() => setActiveTab('video')}
            className={`pb-2 px-4 text-sm transition-colors ${
              activeTab === 'video'
                ? 'text-gold-600 dark:text-gold-400 border-b-2 border-gold-600 dark:border-gold-400'
                : 'text-brown-600 dark:text-cream-300 hover:text-gold-600'
            }`}
          >
            Video
          </button>
        )}
        {view360Images && view360Images.length > 0 && (
          <button
            onClick={() => setActiveTab('360')}
            className={`pb-2 px-4 text-sm transition-colors ${
              activeTab === '360'
                ? 'text-gold-600 dark:text-gold-400 border-b-2 border-gold-600 dark:border-gold-400'
                : 'text-brown-600 dark:text-cream-300 hover:text-gold-600'
            }`}
          >
            360° View
          </button>
        )}
      </div>

      {/* Content */}
      {activeTab === 'images' && (
        <>
          <div className="aspect-square bg-cream-100 dark:bg-brown-800 border border-brown-200 dark:border-brown-700 overflow-hidden group">
            <img
              src={images[activeIndex]}
              alt={`${productName} - Image ${activeIndex + 1}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`aspect-square border transition-all ${
                    idx === activeIndex
                      ? 'border-gold-600 dark:border-gold-400'
                      : 'border-brown-200 dark:border-brown-700 hover:border-gold-500'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'video' && youtubeUrl && (
        <div className="aspect-video bg-cream-100 dark:bg-brown-800 border border-brown-200 dark:border-brown-700">
          <iframe
            src={getYouTubeEmbedUrl(youtubeUrl)}
            title={`${productName} Video`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {activeTab === '360' && view360Images && view360Images.length > 0 && (
        <>
          <div className="relative">
            <div
              className={`aspect-square bg-cream-100 dark:bg-brown-800 border border-brown-200 dark:border-brown-700 overflow-hidden ${zoomEnabled ? 'cursor-none' : 'cursor-grab active:cursor-grabbing'}`}
              onMouseDown={handleDragStart}
              onMouseMove={handleDragMove}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleMouseLeave}
            >
              <img
                src={view360Images[view360Index]}
                alt={`${productName} - 360° View ${view360Index + 1}`}
                className="w-full h-full object-cover select-none"
                draggable={false}
              />
              {zoomEnabled && showLens && (
                <div
                  className="absolute w-40 h-40 rounded-full border-4 border-gold-500 pointer-events-none bg-white dark:bg-brown-900"
                  style={{
                    left: `${lensPosition.x}px`,
                    top: `${lensPosition.y}px`,
                    transform: 'translate(-50%, -50%)',
                    backgroundImage: `url(${view360Images[view360Index]})`,
                    backgroundSize: `${zoomLevel}%`,
                    backgroundPosition: `${lensPosition.percentX}% ${lensPosition.percentY}%`,
                    boxShadow: '0 0 30px rgba(0,0,0,0.6)',
                    zIndex: 20
                  }}
                />
              )}
            </div>
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
              <button
                onClick={() => setZoomEnabled(!zoomEnabled)}
                className={`p-2 border transition-colors ${
                  zoomEnabled
                    ? 'bg-yellow-400 border-yellow-500 hover:bg-yellow-500'
                    : 'bg-white dark:bg-brown-900 border-brown-200 dark:border-brown-700 hover:bg-brown-50 dark:hover:bg-brown-800'
                }`}
                title={zoomEnabled ? 'Disable zoom' : 'Enable zoom'}
              >
                <svg className={`w-5 h-5 ${zoomEnabled ? 'text-brown-900' : 'text-brown-900 dark:text-cream-50'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                </svg>
              </button>
              {zoomEnabled && (
                <>
                  <button
                    onClick={() => setZoomLevel(prev => Math.min(prev + 50, 500))}
                    disabled={zoomLevel >= 500}
                    className="bg-white dark:bg-brown-900 border border-brown-200 dark:border-brown-700 p-2 hover:bg-brown-50 dark:hover:bg-brown-800 transition-colors disabled:opacity-50"
                    title="Zoom in"
                  >
                    <svg className="w-4 h-4 text-brown-900 dark:text-cream-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setZoomLevel(prev => Math.max(prev - 50, 150))}
                    disabled={zoomLevel <= 150}
                    className="bg-white dark:bg-brown-900 border border-brown-200 dark:border-brown-700 p-2 hover:bg-brown-50 dark:hover:bg-brown-800 transition-colors disabled:opacity-50"
                    title="Zoom out"
                  >
                    <svg className="w-4 h-4 text-brown-900 dark:text-cream-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="text-center text-sm text-brown-600 dark:text-cream-300">
            <p>{zoomEnabled ? 'Hover to zoom • Click lens to disable' : 'Drag left or right to rotate'} • {view360Index + 1} / {view360Images.length}</p>
          </div>
        </>
      )}
    </div>
  );
}
