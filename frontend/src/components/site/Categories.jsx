import { useEffect, useState } from "react";
import { fetchCategories } from "@/lib/api";

export default function Categories() {
  const [cats, setCats] = useState([]);

  useEffect(() => {
    fetchCategories().then(setCats).catch(() => setCats([]));
  }, []);

  return (
    <section className="max-w-[1400px] mx-auto px-6 py-14" data-testid="categories-section">
      <div className="flex items-end justify-between mb-10">
        <div>
          <div className="text-[11px] tracking-[0.28em] text-gold-600 uppercase mb-2">
            Shop by category
          </div>
          <h2 className="font-display text-3xl md:text-4xl text-maroon-900">
            Curated for every occasion
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-9 gap-6 md:gap-8">
        {cats.map((c) => (
          <a
            key={c.name}
            href="#"
            className="group flex flex-col items-center"
            data-testid={`category-${c.name.toLowerCase().replace(/\s+/g, "-")}`}
          >
            <div className="w-full aspect-square rounded-full overflow-hidden border border-cream-200 group-hover:border-gold-500 transition-colors">
              <img
                src={c.image}
                alt={c.name}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            <div className="mt-4 text-[13px] tracking-wide text-stone-800 group-hover:text-maroon-900 transition-colors text-center font-medium">
              {c.name}
            </div>
          </a>
        ))}

        {/* Sale bubble */}
        <a
          href="#"
          className="group flex flex-col items-center"
          data-testid="category-sale"
        >
          <div className="w-full aspect-square rounded-full bg-maroon-900 text-cream-50 grid place-items-center transition-transform duration-500 group-hover:scale-105">
            <div className="text-center leading-tight">
              <div className="font-display italic text-lg">SALE</div>
              <div className="text-[9px] tracking-[0.2em] mt-1">UP TO</div>
              <div className="text-gold-400 text-lg font-semibold">50% OFF</div>
            </div>
          </div>
          <div className="mt-4 text-[13px] tracking-wide text-maroon-900 font-semibold">
            Sale
          </div>
        </a>
      </div>
    </section>
  );
}
