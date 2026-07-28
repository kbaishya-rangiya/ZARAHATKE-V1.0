import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Heart, ShoppingBag, Star, Truck, RefreshCcw, ShieldCheck, ChevronRight } from "lucide-react";
import { fetchProduct, fetchProducts } from "@/lib/api";
import { useStore } from "@/context/StoreContext";
import ProductCard from "@/components/site/ProductCard";

export default function ProductDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [product, setProduct] = useState(null);
  const [size, setSize] = useState("");
  const [qty, setQty] = useState(1);
  const [related, setRelated] = useState([]);
  const { addToCart, toggleWishlist, inWishlist, setCartOpen } = useStore();

  useEffect(() => {
    setProduct(null);
    setSize("");
    setQty(1);
    window.scrollTo(0, 0);
    fetchProduct(id).then((p) => {
      setProduct(p);
      fetchProducts({ category: p.category }).then((r) =>
        setRelated(r.filter((x) => x.id !== p.id).slice(0, 4))
      );
    }).catch(() => nav("/"));
  }, [id, nav]);

  if (!product) return <div className="max-w-[1400px] mx-auto px-6 py-24 text-center text-stone-500">Loading…</div>;

  const wished = inWishlist(product.id);

  const handleAdd = (buyNow = false) => {
    if (!size) {
      alert("Please select a size");
      return;
    }
    for (let i = 0; i < qty; i++) addToCart({ ...product, size });
    if (buyNow) nav("/checkout");
    else setCartOpen(true);
  };

  return (
    <section className="max-w-[1400px] mx-auto px-6 py-10" data-testid="product-detail">
      {/* Breadcrumbs */}
      <nav className="text-[11px] tracking-widest text-stone-500 mb-8 flex items-center gap-2">
        <Link to="/" className="hover:text-maroon-900">HOME</Link>
        <ChevronRight size={12} />
        <Link to={`/category/${product.category.toLowerCase().replace(/\s+/g, "-")}`} className="hover:text-maroon-900 uppercase">
          {product.category}
        </Link>
        <ChevronRight size={12} />
        <span className="text-maroon-900 truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
        {/* Gallery */}
        <div className="grid grid-cols-1 gap-3">
          <div className="aspect-[3/4] bg-cream-100 overflow-hidden border border-cream-200">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" data-testid="product-main-image" />
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="aspect-square bg-cream-100 border border-cream-200 overflow-hidden">
                <img src={product.image} alt="" className="w-full h-full object-cover opacity-90" />
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="max-w-md">
          <div className="text-[11px] tracking-[0.28em] text-gold-600 uppercase mb-2">
            {product.category}
          </div>
          <h1 className="font-display text-3xl md:text-4xl text-maroon-900 leading-tight" data-testid="product-title">
            {product.name}
          </h1>

          <div className="flex items-center gap-2 mt-3">
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map((s) => (
                <Star key={s} size={14} className={s <= Math.round(product.rating) ? "fill-gold-500 text-gold-500" : "text-cream-200"} />
              ))}
            </div>
            <span className="text-xs text-stone-500">{product.rating} · {product.reviews_count} reviews</span>
          </div>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="font-display text-3xl text-maroon-900" data-testid="product-price">
              ₹{product.price.toLocaleString("en-IN")}
            </span>
            {product.original_price && (
              <>
                <span className="text-stone-400 text-lg line-through">
                  ₹{product.original_price.toLocaleString("en-IN")}
                </span>
                <span className="text-xs bg-gold-500 text-maroon-950 px-2 py-1 font-semibold tracking-widest">
                  {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% OFF
                </span>
              </>
            )}
          </div>
          <div className="text-xs text-stone-500 mt-1">Inclusive of all taxes</div>

          {/* Sizes */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <label className="text-[11px] tracking-[0.28em] uppercase text-maroon-900 font-semibold">Select size</label>
              <button className="text-[11px] tracking-widest text-stone-500 hover:text-maroon-900 underline underline-offset-4">Size guide</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`w-12 h-12 border text-sm font-medium transition-colors ${
                    size === s
                      ? "bg-maroon-900 text-cream-50 border-maroon-900"
                      : "bg-white text-stone-800 border-cream-200 hover:border-maroon-900"
                  }`}
                  data-testid={`size-${s}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Qty */}
          <div className="mt-6">
            <label className="text-[11px] tracking-[0.28em] uppercase text-maroon-900 font-semibold">Quantity</label>
            <div className="flex items-center border border-cream-200 w-fit mt-3">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-10 h-10 hover:bg-cream-100"
                data-testid="pdp-qty-decrease"
              >−</button>
              <span className="w-12 text-center" data-testid="pdp-qty">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(10, q + 1))}
                className="w-10 h-10 hover:bg-cream-100"
                data-testid="pdp-qty-increase"
              >+</button>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => handleAdd(false)}
              className="flex-1 h-12 bg-maroon-900 text-cream-50 text-[11px] tracking-[0.28em] font-semibold hover:bg-maroon-700 transition-colors flex items-center justify-center gap-2"
              data-testid="pdp-add-to-cart"
            >
              <ShoppingBag size={14} /> ADD TO BAG
            </button>
            <button
              onClick={() => handleAdd(true)}
              className="flex-1 h-12 border border-maroon-900 text-maroon-900 text-[11px] tracking-[0.28em] font-semibold hover:bg-maroon-900 hover:text-cream-50 transition-colors"
              data-testid="pdp-buy-now"
            >
              BUY IT NOW
            </button>
            <button
              onClick={() => toggleWishlist(product)}
              className="h-12 w-12 border border-cream-200 grid place-items-center hover:border-maroon-900 transition-colors"
              aria-label="Wishlist"
              data-testid="pdp-wishlist"
            >
              <Heart size={16} className={wished ? "fill-maroon-900 text-maroon-900" : "text-stone-700"} />
            </button>
          </div>

          {/* Description */}
          <div className="mt-10 pt-8 border-t border-cream-200">
            <div className="text-[11px] tracking-[0.28em] uppercase text-gold-600 font-semibold mb-3">
              About this piece
            </div>
            <p className="text-sm text-stone-700 leading-relaxed">{product.description}</p>
          </div>

          {/* Perks */}
          <ul className="mt-8 space-y-3 text-sm text-stone-700">
            <li className="flex items-center gap-3"><Truck size={16} className="text-maroon-900" /> Free shipping on orders above ₹1999</li>
            <li className="flex items-center gap-3"><RefreshCcw size={16} className="text-maroon-900" /> Easy 7-day returns & exchanges</li>
            <li className="flex items-center gap-3"><ShieldCheck size={16} className="text-maroon-900" /> Authentic products, quality assured</li>
          </ul>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="mt-20 pt-10 border-t border-cream-200">
          <h2 className="font-display text-2xl md:text-3xl text-maroon-900 mb-8">You may also love</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </section>
  );
}
