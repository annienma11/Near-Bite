import Link from 'next/link';
import ProductShowcase from '@/components/ProductShowcase';
import AIRecommendedGallery from '@/components/AIRecommendedGallery';

export default function Home() {
  return (
    <div className="overflow-x-hidden">
      {/* Hero Section - 2 Column */}
      <section className="min-h-screen w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen w-full">
          {/* Left Column - Content */}
          <div className="flex flex-col justify-center px-6 md:px-16 py-12 md:py-20 lg:border-r border-brown-200 dark:border-brown-700">
            <div className="space-y-8">
              <div className="space-y-2">
                <p className="text-xs md:text-sm tracking-widest text-brown-600 dark:text-cream-300">LUXURY JEWELRY</p>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-light tracking-tight text-brown-900 dark:text-cream-50">
                  Timeless
                  <br />
                  <span className="text-gold-600 dark:text-gold-400">Elegance</span>
                </h1>
              </div>
              <p className="text-base md:text-lg text-brown-600 dark:text-cream-300 max-w-md leading-relaxed">
                Discover exquisite pieces crafted with precision and passion. Each creation tells a story of artistry and excellence.
              </p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
                <Link href="/shop" className="btn-primary text-base md:text-lg pb-2">
                  Explore Collection
                </Link>
                <Link href="/style-advisor" className="btn-secondary text-base md:text-lg pb-2">
                  Style Advisor
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column - Product Showcase */}
          <div className="relative h-[40vh] lg:h-screen overflow-hidden bg-cream-100 dark:bg-brown-900 w-full">
            <ProductShowcase />
            <div className="absolute inset-0 bg-gradient-to-t from-cream-100/50 dark:from-brown-900/50 to-transparent pointer-events-none" />
          </div>
        </div>
      </section>

      {/* Features - Minimalist */}
      <section className="border-t border-brown-200 dark:border-brown-700 w-full">
        <div className="container mx-auto px-6 md:px-8 py-12 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16">
            <div className="space-y-3">
              <div className="w-px h-12 bg-gold-500 mb-4" />
              <h3 className="text-lg md:text-xl font-light text-gold-600 dark:text-gold-400">Premium Quality</h3>
              <p className="text-brown-600 dark:text-cream-300 text-sm leading-relaxed">Handcrafted with the finest materials and meticulous attention to detail</p>
            </div>
            <div className="space-y-3">
              <div className="w-px h-12 bg-gold-500 mb-4" />
              <h3 className="text-xl font-light text-gold-600 dark:text-gold-400">AI Style Advisor</h3>
              <p className="text-brown-600 dark:text-cream-300 text-sm leading-relaxed">Personalized recommendations powered by advanced technology</p>
            </div>
            <div className="space-y-3">
              <div className="w-px h-12 bg-gold-500 mb-4" />
              <h3 className="text-xl font-light text-gold-600 dark:text-gold-400">Complimentary Shipping</h3>
              <p className="text-brown-600 dark:text-cream-300 text-sm leading-relaxed">Free worldwide delivery on orders over $200</p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Recommended Gallery */}
      <AIRecommendedGallery />

      {/* Categories - Minimalist Text */}
      <section className="border-t border-brown-200 dark:border-brown-700 w-full">
        <div className="container mx-auto px-6 md:px-8 py-12 md:py-20">
          <h2 className="text-3xl md:text-4xl font-light mb-8 md:mb-16 text-brown-900 dark:text-cream-50">
            Collections
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[
              { name: 'Rings', icon: '○' },
              { name: 'Necklaces', icon: '◇' },
              { name: 'Bracelets', icon: '◎' },
              { name: 'Earrings', icon: '◈' }
            ].map((category) => (
              <Link
                key={category.name}
                href={`/shop?category=${category.name.toLowerCase()}`}
                className="group border border-brown-200 dark:border-brown-700 p-8 hover:border-gold-500 dark:hover:border-gold-400 transition-all duration-300"
              >
                <div className="text-4xl text-gold-600 dark:text-gold-400 mb-4 transition-all duration-700 group-hover:scale-125 group-hover:translate-x-8" style={{ transformStyle: 'preserve-3d' }}>
                  <span className="inline-block transition-transform duration-700 group-hover:[transform:rotateY(360deg)]">{category.icon}</span>
                </div>
                <h3 className="text-xl font-light text-brown-900 dark:text-cream-50 group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors">
                  {category.name}
                </h3>
                <div className="w-12 h-px bg-brown-300 dark:bg-brown-600 mt-4 group-hover:w-full group-hover:bg-gold-500 transition-all duration-300" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-brown-200 dark:border-brown-700 w-full">
        <div className="container mx-auto px-6 md:px-8 py-16 md:py-32 text-center">
          <h2 className="text-3xl md:text-5xl font-light mb-6 text-brown-900 dark:text-cream-50">
            Discover Your <span className="text-gold-600 dark:text-gold-400">Perfect Style</span>
          </h2>
          <p className="text-base md:text-lg text-brown-600 dark:text-cream-300 mb-8 md:mb-12 max-w-2xl mx-auto">
            Let our AI-powered style advisor guide you to pieces that complement your unique aesthetic
          </p>
          <Link href="/style-advisor" className="btn-primary text-base md:text-lg pb-2">
            Begin Your Journey
          </Link>
        </div>
      </section>
    </div>
  );
}
