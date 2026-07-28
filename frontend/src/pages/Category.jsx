import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { fetchCategoryDetail } from "@/lib/api";
import ProductCard from "@/components/site/ProductCard";

const SORTS = [
  { key: "featured", label: "Featured" },
  { key: "price_low", label: "Price: Low to High" },
  { key: "price_high", label: "Price: High to Low" },
  { key: "newest", label: "Newest" },
];

const PRICE_RANGES = [
  { key: "all", label: "All prices", min: 0, max: Infinity },
  { key: "under_1500", label: "Under ₹1,500", min: 0, max: 1500 },
  { key: "1500_3000", label: "₹1,500 – ₹3,000", min: 1500, max: 3000 },
  { key: "3000_6000", label: "₹3,000 – ₹6,000", min: 3000, max: 6000 },
  { key: "above_6000", label: "Above ₹6,000", min: 6000, max: Infinity },
];

export default function Category() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [sort, setSort] = useState("featured");
  const [range, setRange] = useState("all");

  useEffect(() => {
    setData(null);
    window.scrollTo(0, 0);
    fetchCategoryDetail(slug).then(setData).catch(() => setData({ category: null, products: [] }));
  }, [slug]);

  const products = useMemo(() => {
    if (!data) return [];
    const r = PRICE_RANGES.find((x) => x.key === range);
    let list = data.products.filter((p) => p.price >= r.min && p.price <= r.max);
    if (sort === "price_low") list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === "price_high") list = [...list].sort((a, b) => b.price - a.price);
    else if (sort === "newest") list = [...list].sort((a, b) => (a.section === "new_arrivals" ? -1 : 1));
    return list;
  }, [data, sort, range]);

  if (!data) return <div className="max-w-[1400px] mx-auto px-6 py-24 text-center text-stone-500">Loading…</div>;

  if (!data.category) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-24 text-center">
        <div className="font-display text-3xl text-maroon-900">Category not found</div>
        <Link to="/" className="mt-6 inline-block text-[11px] tracking-widest text-maroon-900 border-b border-maroon-900 pb-1">
          BACK TO HOME
        </Link>
      </div>
    );
  }

  const cat = data.category;

  return (
    <section className="max-w-[1400px] mx-auto px-6 py-10" data-testid="category-page">
      <nav className="text-[11px] tracking-widest text-stone-500 mb-8 flex items-center gap-2">
        <Link to="/" className="hover:text-maroon-900">HOME</Link>
        <ChevronRight size={12} />
        <span className="text-maroon-900 uppercase">{cat.name}</span>
      </nav>

      {/* Header */}
      <div className="relative overflow-hidden bg-maroon-950 mb-10 h-56 md:h-72">
        <img src={cat.image} alt={cat.name} className="absolute inset-0 w-full h-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-r from-maroon-950/80 to-transparent" />
        <div className="relative h-full flex flex-col justify-center px-8 md:px-14 text-cream-50">
          <div className="text-[11px] tracking-[0.4em] text-gold-400 mb-3 uppercase">Collection</div>
          <h1 className="font-display text-4xl md:text-6xl" data-testid="category-title">{cat.name}</h1>
        </div>
      </div>

      {/* Filter/Sort bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 pb-4 border-b border-cream-200">
        <div className="text-sm text-stone-600" data-testid="products-count">
          Showing <span className="text-maroon-900 font-semibold">{products.length}</span> of {data.products.length} products
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="h-10 px-4 border border-cream-200 bg-white text-sm outline-none focus:border-maroon-900"
            data-testid="filter-price"
          >
            {PRICE_RANGES.map((r) => (
              <option key={r.key} value={r.key}>{r.label}</option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-10 px-4 border border-cream-200 bg-white text-sm outline-none focus:border-maroon-900"
            data-testid="filter-sort"
          >
            {SORTS.map((s) => (
              <option key={s.key} value={s.key}>Sort: {s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      {products.length === 0 ? (
        <div className="py-24 text-center text-stone-500">
          No products match your filters. Try adjusting the price range.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </section>
  );
}
