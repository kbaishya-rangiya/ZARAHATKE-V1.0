import { useEffect, useState } from "react";
import { ChevronRight, Sparkles, Palette, Tag, RefreshCcw, Users } from "lucide-react";
import { fetchProducts } from "@/lib/api";
import ProductCard from "./ProductCard";

const whys = [
  { icon: Sparkles, text: "Premium Quality Fabric" },
  { icon: Palette, text: "Trendy & Exclusive Designs" },
  { icon: Tag, text: "Affordable Prices" },
  { icon: RefreshCcw, text: "Easy Exchange & Returns" },
  { icon: Users, text: "Happy Customers All Over India" },
];

export default function NewArrivalsAndAside() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchProducts("new_arrivals").then(setItems).catch(() => setItems([]));
  }, []);

  return (
    <section
      className="max-w-[1400px] mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8"
      data-testid="new-arrivals-section"
    >
      {/* Main: products */}
      <div>
        <SectionHeader title="New Arrivals" testId="new-arrivals-header" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
          {items.slice(0, 8).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>

      {/* Aside */}
      <aside className="flex flex-col gap-6">
        {/* Festive Edit CTA */}
        <div
          className="relative overflow-hidden aspect-[4/5] group"
          data-testid="festive-edit-card"
        >
          <img
            src="https://images.unsplash.com/photo-1710967074868-2041e4f44c17?w=800&q=80"
            alt="Festive Edit"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-maroon-950/80 via-maroon-950/20 to-transparent" />
          <div className="absolute inset-0 p-6 flex flex-col justify-end text-cream-50">
            <div className="text-[10px] tracking-[0.35em] text-gold-400 uppercase mb-2">
              Editorial
            </div>
            <h3 className="font-display text-3xl leading-tight">Festive Edit</h3>
            <p className="text-xs mt-2 text-cream-50/85 leading-relaxed">
              Handpicked styles for every celebration
            </p>
            <button
              className="mt-5 self-start h-10 px-6 bg-cream-50 text-maroon-900 text-[11px] tracking-[0.24em] font-semibold hover:bg-gold-500 hover:text-maroon-950 transition-colors"
              data-testid="festive-edit-cta"
            >
              EXPLORE NOW
            </button>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="border border-cream-200 bg-white p-6" data-testid="why-choose-us">
          <div className="text-[11px] tracking-[0.28em] text-gold-600 uppercase mb-4">
            Why Choose Us
          </div>
          <ul className="space-y-3">
            {whys.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-[13px] text-stone-700">
                <Icon size={16} strokeWidth={1.6} className="text-maroon-900 mt-0.5 shrink-0" />
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </section>
  );
}

export function SectionHeader({ title, testId }) {
  return (
    <div className="flex items-end justify-between mb-8" data-testid={testId}>
      <div>
        <div className="text-[11px] tracking-[0.28em] text-gold-600 uppercase mb-1">
          Explore
        </div>
        <h2 className="font-display text-2xl md:text-3xl text-maroon-900">{title}</h2>
      </div>
      <a
        href="#"
        className="text-[11px] tracking-[0.24em] font-semibold text-maroon-900 hover:text-gold-600 transition-colors flex items-center gap-1"
      >
        VIEW ALL <ChevronRight size={14} />
      </a>
    </div>
  );
}
