import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { fetchHeroSlides } from "@/lib/api";

export default function Hero() {
  const [slides, setSlides] = useState([]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    fetchHeroSlides().then(setSlides).catch(() => setSlides([]));
  }, []);

  useEffect(() => {
    if (!slides.length) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, [slides]);

  if (!slides.length) {
    return <div className="h-[520px] bg-cream-100" data-testid="hero-loading" />;
  }

  const s = slides[idx];

  const prev = () => setIdx((i) => (i - 1 + slides.length) % slides.length);
  const next = () => setIdx((i) => (i + 1) % slides.length);

  return (
    <section className="relative overflow-hidden bg-maroon-950" data-testid="hero-carousel">
      <div className="relative h-[440px] md:h-[560px] lg:h-[620px]">
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-out ${
              i === idx ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            aria-hidden={i !== idx}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-maroon-950/85 via-maroon-950/40 to-transparent" />
          </div>
        ))}

        {/* Content */}
        <div className="relative h-full max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16 flex items-center">
          <div key={s.id} className="max-w-xl animate-fade-up">
            <div className="text-[11px] tracking-[0.4em] text-gold-400 mb-4 uppercase">
              Editorial No. 07
            </div>
            <h1 className="font-display text-cream-50 text-4xl md:text-6xl lg:text-7xl leading-[0.95] tracking-tight">
              {s.title}
            </h1>
            <div className="font-display italic text-gold-500 text-5xl md:text-7xl mt-1 mb-6">
              {s.year}
            </div>
            <p className="text-cream-50/85 text-base md:text-lg font-light max-w-md leading-relaxed">
              {s.subtitle}
            </p>
            <button
              className="mt-8 h-12 px-9 bg-cream-50 text-maroon-900 text-xs tracking-[0.28em] font-semibold hover:bg-gold-500 hover:text-maroon-950 transition-colors"
              data-testid="hero-shop-now-btn"
            >
              {s.cta}
            </button>
          </div>
        </div>

        {/* Arrows */}
        <button
          onClick={prev}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 grid place-items-center border border-cream-50/40 text-cream-50 hover:bg-cream-50 hover:text-maroon-900 transition-colors"
          aria-label="Previous slide"
          data-testid="hero-prev-btn"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={next}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 grid place-items-center border border-cream-50/40 text-cream-50 hover:bg-cream-50 hover:text-maroon-900 transition-colors"
          aria-label="Next slide"
          data-testid="hero-next-btn"
        >
          <ChevronRight size={20} />
        </button>

        {/* Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`h-1.5 transition-all ${
                i === idx ? "w-8 bg-gold-500" : "w-4 bg-cream-50/50"
              }`}
              aria-label={`Go to slide ${i + 1}`}
              data-testid={`hero-dot-${i}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
