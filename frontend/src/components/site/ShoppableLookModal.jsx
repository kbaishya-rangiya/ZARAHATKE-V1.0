import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { X, ShoppingBag } from "lucide-react";
import { fetchInstagramLook } from "@/lib/api";
import { useStore } from "@/context/StoreContext";

export default function ShoppableLookModal({ lookId, onClose }) {
  const [data, setData] = useState(null);
  const { addToCart, setCartOpen } = useStore();

  useEffect(() => {
    if (!lookId) return;
    setData(null);
    fetchInstagramLook(lookId).then(setData).catch(() => setData({ look: null, products: [] }));
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [lookId]);

  if (!lookId) return null;

  return (
    <div
      className="fixed inset-0 bg-maroon-950/70 z-[60] flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
      data-testid="shoppable-modal"
    >
      <div
        className="bg-cream-50 w-full max-w-4xl max-h-[90vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 z-10 w-10 h-10 grid place-items-center bg-cream-50/95 hover:bg-cream-100"
          data-testid="close-shoppable-modal"
        >
          <X size={18} />
        </button>

        {data && data.look && (
          <>
            <div className="aspect-square md:aspect-auto md:min-h-[500px] relative">
              <img src={data.look.image} alt={data.look.caption} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-maroon-950/85 to-transparent text-cream-50">
                <div className="text-[11px] tracking-[0.28em] text-gold-400 uppercase">The Look</div>
                <div className="font-display text-2xl mt-1">{data.look.caption}</div>
              </div>
            </div>
            <div className="p-6 md:p-8">
              <div className="text-[11px] tracking-[0.28em] text-gold-600 uppercase mb-2">Shop the look</div>
              <div className="font-display text-2xl text-maroon-900 mb-6">Curated by our editors</div>
              <div className="space-y-4">
                {data.products.map((p) => (
                  <div key={p.id} className="flex gap-4 border-b border-cream-200 pb-4" data-testid={`shoppable-product-${p.id}`}>
                    <Link to={`/product/${p.id}`} onClick={onClose}>
                      <img src={p.image} alt={p.name} className="w-20 h-24 object-cover" />
                    </Link>
                    <div className="flex-1">
                      <Link to={`/product/${p.id}`} onClick={onClose} className="text-sm text-stone-800 leading-snug hover:text-maroon-900">
                        {p.name}
                      </Link>
                      <div className="text-maroon-900 font-semibold text-sm mt-1">
                        ₹{p.price.toLocaleString("en-IN")}
                      </div>
                      <button
                        onClick={() => { addToCart(p); onClose(); setCartOpen(true); }}
                        className="mt-2 h-9 px-3 bg-maroon-900 text-cream-50 text-[10px] tracking-widest font-semibold hover:bg-maroon-700 transition-colors inline-flex items-center gap-2"
                        data-testid={`shoppable-add-${p.id}`}
                      >
                        <ShoppingBag size={12} /> ADD TO BAG
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        {!data && (
          <div className="col-span-2 py-24 text-center text-stone-500">Loading look…</div>
        )}
      </div>
    </div>
  );
}
