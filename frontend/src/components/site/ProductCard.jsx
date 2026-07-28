import { Heart, ShoppingBag } from "lucide-react";
import { useStore } from "@/context/StoreContext";

export default function ProductCard({ product, compact = false }) {
  const { addToCart, toggleWishlist, inWishlist } = useStore();
  const wished = inWishlist(product.id);

  return (
    <div
      className="group relative flex flex-col"
      data-testid={`product-card-${product.id}`}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-cream-100 border border-cream-200">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {product.tag && (
          <span
            className={`absolute top-3 left-3 px-2 py-1 text-[10px] tracking-widest font-semibold ${
              product.tag === "SALE"
                ? "bg-gold-500 text-maroon-950"
                : "bg-maroon-900 text-cream-50"
            }`}
            data-testid={`product-tag-${product.id}`}
          >
            {product.tag}
          </span>
        )}
        <button
          onClick={() => toggleWishlist(product)}
          className="absolute top-3 right-3 w-9 h-9 grid place-items-center rounded-full bg-cream-50/95 hover:bg-cream-50 shadow-sm transition-colors"
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          data-testid={`wishlist-toggle-${product.id}`}
        >
          <Heart
            size={16}
            strokeWidth={1.6}
            className={wished ? "text-maroon-900 fill-maroon-900" : "text-stone-700"}
          />
        </button>

        {/* Hover Add to bag */}
        <button
          onClick={() => addToCart(product)}
          className="absolute inset-x-3 bottom-3 h-10 bg-maroon-900 text-cream-50 text-[11px] tracking-[0.22em] font-semibold flex items-center justify-center gap-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-maroon-700"
          data-testid={`add-to-cart-${product.id}`}
        >
          <ShoppingBag size={14} strokeWidth={1.8} />
          ADD TO BAG
        </button>
      </div>
      <div className="mt-3">
        <div
          className={`text-stone-800 leading-snug line-clamp-2 ${
            compact ? "text-[12px]" : "text-[13px]"
          }`}
        >
          {product.name}
        </div>
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="text-maroon-900 font-semibold text-sm">
            ₹{product.price.toLocaleString("en-IN")}
          </span>
          {product.original_price && (
            <span className="text-stone-400 text-xs line-through">
              ₹{product.original_price.toLocaleString("en-IN")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
