import { X, Heart, ShoppingBag } from "lucide-react";
import { useStore } from "@/context/StoreContext";

export default function WishlistSheet() {
  const {
    wishlist,
    wishlistOpen,
    setWishlistOpen,
    toggleWishlist,
    addToCart,
  } = useStore();

  return (
    <>
      <div
        onClick={() => setWishlistOpen(false)}
        className={`fixed inset-0 bg-maroon-950/40 z-50 transition-opacity ${
          wishlistOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />
      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-cream-50 z-50 flex flex-col transition-transform ${
          wishlistOpen ? "translate-x-0" : "translate-x-full"
        }`}
        data-testid="wishlist-sheet"
      >
        <div className="flex items-center justify-between px-6 h-16 border-b border-cream-200">
          <div className="flex items-center gap-2">
            <Heart size={18} className="text-maroon-900" />
            <h3 className="font-display text-xl text-maroon-900">
              Wishlist ({wishlist.length})
            </h3>
          </div>
          <button
            onClick={() => setWishlistOpen(false)}
            aria-label="Close wishlist"
            data-testid="close-wishlist-btn"
            className="p-2 hover:bg-cream-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {wishlist.length === 0 && (
            <div className="text-center py-16 text-stone-500 text-sm">
              Your wishlist is empty. Tap the heart on any product to save it.
            </div>
          )}
          {wishlist.map((p) => (
            <div
              key={p.id}
              className="flex gap-4 border-b border-cream-200 pb-4"
              data-testid={`wishlist-item-${p.id}`}
            >
              <img src={p.image} alt={p.name} className="w-20 h-24 object-cover" />
              <div className="flex-1">
                <div className="text-[13px] text-stone-800 leading-snug">{p.name}</div>
                <div className="text-maroon-900 font-semibold text-sm mt-1">
                  ₹{p.price.toLocaleString("en-IN")}
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <button
                    onClick={() => {
                      addToCart(p);
                      toggleWishlist(p);
                    }}
                    className="flex items-center gap-2 h-9 px-3 bg-maroon-900 text-cream-50 text-[10px] tracking-widest font-semibold hover:bg-maroon-700 transition-colors"
                    data-testid={`wishlist-move-to-cart-${p.id}`}
                  >
                    <ShoppingBag size={12} /> MOVE TO BAG
                  </button>
                  <button
                    onClick={() => toggleWishlist(p)}
                    className="text-[11px] tracking-widest text-stone-500 hover:text-maroon-900 uppercase"
                    data-testid={`wishlist-remove-${p.id}`}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}
