import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Thumbs, Zoom, Keyboard } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';
import 'swiper/css/zoom';
import { getAllImageUrls } from '../../../utils/imageUtils';

export default function ProductGallery({ product }) {
  const images = getAllImageUrls(product);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Handle ESC key to close fullscreen
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isFullscreen]);

  if (!images.length) {
    return (
      <div className="aspect-square bg-gradient-to-br from-brand-100 to-brand-200 rounded-lg flex items-center justify-center">
        <span className="text-brand-600 text-7xl">🎨</span>
      </div>
    );
  }

  const handleFullscreen = (index) => {
    setCurrentIndex(index);
    setIsFullscreen(true);
  };

  return (
    <div className="w-full">
      {/* Main Swiper */}
      <div className="relative">
        <Swiper
          modules={[Navigation, Pagination, Thumbs, Zoom, Keyboard]}
          navigation
          pagination={{ clickable: true }}
          thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
          zoom={true}
          keyboard={{ enabled: true }}
          onSlideChange={(swiper) => setCurrentIndex(swiper.activeIndex)}
          className="rounded-lg aspect-square bg-slate-100 mb-4"
        >
          {images.map((img, idx) => (
            <SwiperSlide key={idx}>
              <div className="swiper-zoom-container">
                <img
                  src={img.url}
                  alt={img.alt}
                  className="w-full h-full object-cover rounded-lg cursor-zoom-in"
                  loading="lazy"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Fullscreen Button */}
        <button
          onClick={() => handleFullscreen(currentIndex)}
          className="absolute top-4 right-4 z-10 bg-white bg-opacity-80 hover:bg-opacity-100 p-2 rounded-lg shadow-lg transition-all"
          title="Xem toàn màn hình"
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
      </div>

      {/* Thumbnails Swiper */}
      {images.length > 1 && (
        <Swiper
          onSwiper={setThumbsSwiper}
          modules={[Thumbs]}
          spaceBetween={10}
          slidesPerView={4}
          watchSlidesProgress
          className="thumbs-swiper"
        >
          {images.map((img, idx) => (
            <SwiperSlide key={idx}>
              <img
                src={img.url}
                alt={img.alt}
                className="w-full h-20 object-cover rounded cursor-pointer border-2 border-transparent hover:border-brand-500 transition-all"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      )}

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center">
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 p-2 bg-black bg-opacity-50 rounded-lg"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="w-full h-full max-w-6xl max-h-screen p-8">
            <Swiper
              modules={[Navigation, Pagination, Zoom, Keyboard]}
              navigation
              pagination={{ clickable: true }}
              zoom={true}
              keyboard={{ enabled: true }}
              initialSlide={currentIndex}
              className="h-full"
            >
              {images.map((img, idx) => (
                <SwiperSlide key={idx}>
                  <div className="swiper-zoom-container flex items-center justify-center h-full">
                    <img
                      src={img.url}
                      alt={img.alt}
                      className="max-w-full max-h-full object-contain"
                      loading="lazy"
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            <div className="text-center mt-4 text-white text-sm">
              <p>Nhấn phím ← → để chuyển ảnh | Nhấn ESC để đóng | Click vào ảnh để zoom</p>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .thumbs-swiper .swiper-slide-thumb-active img {
          border-color: #0066cc;
        }
      `}</style>
    </div>
  );
}
