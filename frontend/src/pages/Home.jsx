
import HeroSlider from '../components/Home/HeroSlider';
import CategorySection from '../components/Home/CategorySection';
import FeaturedProducts from '../components/Home/FeaturedProducts';
import FeaturedProjects from '../components/Home/FeaturedProjects';
import FeaturedPosts from '../components/Home/FeaturedPosts';
import { useEffect } from 'react';
import AOS from 'aos';

export default function Home() {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      offset: 100
    });
  }, []);

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-2 md:px-4">
        <div data-aos="fade-up" data-aos-delay="0">
          <HeroSlider />
        </div>
        <div data-aos="fade-up" data-aos-delay="200">
          <CategorySection />
        </div>
        <div data-aos="fade-up" data-aos-delay="400">
          <FeaturedProducts />
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-2 md:px-4">
        <div data-aos="fade-up" data-aos-delay="600">
          <FeaturedProjects />
        </div>
        <div data-aos="fade-up" data-aos-delay="800">
          <FeaturedPosts />
        </div>
      </div>
    </div>
  );
}
