import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, EffectFade, Parallax, Keyboard } from 'swiper/modules';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';

export default function HeroSlider() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const swiperRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSliders = async () => {
      try {
        const response = await api.get('/sliders');
        setSlides(Array.isArray(response.data) ? response.data : (response.data.sliders || []));
      } catch (error) {
        console.error('Error fetching sliders:', error);
        setSlides([
          {
            image: '/assets/hero1.jpg',
            title: 'Sơn Công Nghiệp Alkana',
            subtitle: 'Chất lượng quốc tế, bảo vệ công trình Việt',
            description: 'Giải pháp sơn chuyên nghiệp cho mọi công trình',
            button_text: 'Khám phá ngay',
            button_style: 'primary',
            text_position: 'left',
            overlay_opacity: 60,
            media_type: 'image',
            link: '/san-pham',
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchSliders();
  }, []);

  // Progress bar animation
  useEffect(() => {
    if (swiperRef.current && slides.length > 1) {
      const autoplayDelay = 5000; // Match with Swiper autoplay delay
      const interval = 50; // Update every 50ms
      const increment = (interval / autoplayDelay) * 100;

      progressIntervalRef.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) return 0;
          return prev + increment;
        });
      }, interval);

      return () => {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
      };
    }
  }, [slides.length]);

  const handleSlideChange = (swiper) => {
    setActiveIndex(swiper.realIndex);
    setProgress(0);
  };

  const getTextPositionClass = (position) => {
    switch (position) {
      case 'center':
        return 'items-center text-center';
      case 'right':
        return 'items-end text-right pr-6 sm:pr-8 md:pr-16';
      default:
        return 'items-start text-left pl-6 sm:pl-8 md:pl-16';
    }
  };

  const getButtonStyleClass = (style) => {
    switch (style) {
      case 'secondary':
        return 'bg-white text-brand-600 hover:bg-gray-100 border-2 border-white';
      case 'outline':
        return 'bg-transparent text-white border-2 border-white hover:bg-white hover:text-brand-600';
      default:
        return 'bg-brand-500 hover:bg-brand-600 text-white';
    }
  };

  if (loading) {
    return (
      <div className="relative w-full h-[420px] md:h-[520px] lg:h-[600px] overflow-hidden rounded-2xl shadow-xl mb-10 bg-gray-200 animate-pulse">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
        </div>
      </div>
    );
  }

  if (!slides || slides.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full h-[420px] md:h-[520px] lg:h-[600px] overflow-hidden rounded-2xl shadow-2xl mb-10 group" data-aos="fade-in">
      <Swiper
        ref={swiperRef}
        modules={[Autoplay, Pagination, Navigation, EffectFade, Parallax, Keyboard]}
        effect="fade"
        speed={1000}
        parallax={true}
        loop={slides.length > 1}
        autoplay={slides.length > 1 ? {
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true
        } : false}
        pagination={{
          clickable: true,
          dynamicBullets: slides.length > 5,
          renderBullet: (index, className) => {
            return `<span class="${className} !bg-white !w-3 !h-3 !opacity-50 hover:!opacity-100 transition-opacity"></span>`;
          }
        }}
        navigation={{
          nextEl: '.slider-button-next',
          prevEl: '.slider-button-prev',
        }}
        keyboard={{
          enabled: true,
          onlyInViewport: true,
        }}
        onSlideChange={handleSlideChange}
        className="w-full h-full"
      >
        {slides.map((slide, idx) => (
          <SwiperSlide key={idx}>
            <div className="w-full h-full relative">
              {/* Media Background */}
              {slide.media_type === 'video' && slide.video_url ? (
                <video
                  src={slide.video_url}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover absolute inset-0 z-0"
                  data-swiper-parallax="-100"
                />
              ) : (
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover object-center absolute inset-0 z-0 scale-105 transition-transform duration-[10000ms] ease-out group-hover:scale-110"
                  loading={idx === 0 ? 'eager' : 'lazy'}
                  data-swiper-parallax="-200"
                />
              )}

              {/* Gradient Overlay with dynamic opacity */}
              <div
                className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10"
                style={{ opacity: (slide.overlay_opacity || 60) / 100 }}
              />

              {/* Content */}
              <div className={`relative z-20 flex flex-col justify-center h-full ${getTextPositionClass(slide.text_position || 'left')} max-w-4xl ${slide.text_position === 'center' ? 'mx-auto px-6' : ''}`}>
                {/* Animated Title */}
                <h2
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-white drop-shadow-2xl transform transition-all duration-700 opacity-0 translate-y-8"
                  data-swiper-parallax="-300"
                  style={{
                    animation: activeIndex === idx ? 'slideInUp 0.8s ease-out 0.2s forwards' : 'none'
                  }}
                >
                  {slide.title}
                </h2>

                {/* Animated Subtitle */}
                <p
                  className="text-lg sm:text-xl md:text-2xl lg:text-3xl mb-3 font-medium text-white/95 drop-shadow-lg transform transition-all duration-700 opacity-0 translate-y-8"
                  data-swiper-parallax="-250"
                  style={{
                    animation: activeIndex === idx ? 'slideInUp 0.8s ease-out 0.4s forwards' : 'none'
                  }}
                >
                  {slide.subtitle}
                </p>

                {/* Animated Description */}
                {slide.description && (
                  <p
                    className="text-base sm:text-lg md:text-xl mb-6 text-white/90 max-w-2xl drop-shadow transform transition-all duration-700 opacity-0 translate-y-8"
                    data-swiper-parallax="-200"
                    style={{
                      animation: activeIndex === idx ? 'slideInUp 0.8s ease-out 0.6s forwards' : 'none'
                    }}
                  >
                    {slide.description}
                  </p>
                )}

                {/* Animated Button */}
                {(slide.link || slide.category_id) && (
                  <button
                    onClick={() => {
                      if (slide.category_id) {
                        navigate(`/san-pham?category=${slide.category_id}`);
                      } else if (slide.link) {
                        navigate(slide.link);
                      }
                    }}
                    className={`inline-flex items-center gap-2 ${getButtonStyleClass(slide.button_style || 'primary')} font-semibold px-8 py-4 rounded-full shadow-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl opacity-0 translate-y-8 cursor-pointer`}
                    data-swiper-parallax="-150"
                    style={{
                      animation: activeIndex === idx ? 'slideInUp 0.8s ease-out 0.8s forwards' : 'none'
                    }}
                  >
                    {slide.button_text || 'Khám phá ngay'}
                    <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Navigation Buttons */}
      {slides.length > 1 && (
        <>
          <button
            className="slider-button-prev absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 md:w-14 md:h-14 bg-white/20 backdrop-blur-sm hover:bg-white/40 text-white rounded-full flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 shadow-lg"
            aria-label="Previous slide"
          >
            <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            className="slider-button-next absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 md:w-14 md:h-14 bg-white/20 backdrop-blur-sm hover:bg-white/40 text-white rounded-full flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 shadow-lg"
            aria-label="Next slide"
          >
            <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Progress Bar */}
      {slides.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-30">
          <div
            className="h-full bg-brand-500 transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Slide Counter */}
      {slides.length > 1 && (
        <div className="absolute top-6 right-6 z-30 bg-black/40 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
          {activeIndex + 1} / {slides.length}
        </div>
      )}

      {/* Keyframes for animations */}
      <style>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
