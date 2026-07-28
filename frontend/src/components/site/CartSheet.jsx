import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useStore } from "@/context/StoreContext";

export default function CartSheet() {
  const {
    cart,
    cartOpen,
    setCartOpen,
    updateQty,
    removeFromCart,
    cartTotal,
    cartCount,
  } = useStore();
  const nav = useNavigate();

  return (
    <>
      {/* Overlay */}
      <div
        onClick={() => setCartOpen(false)}
        className={`fixed inset-0 bg-maroon-950/40 z-50 transition-opacity ${
          cartOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />
      {/* Panel */}
      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-cream-50 z-50 flex flex-col transition-transform ${
          cartOpen ? "translate-x-0" : "translate-x-full"
        }`}
        data-testid="cart-sheet"
      >
        <div className="flex items-center justify-between px-6 h-16 border-b border-cream-200">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} className="text-maroon-900" />
            <h3 className="font-display text-xl text-maroon-900">
              Your Bag ({cartCount})
            </h3>
          </div>
          <button
            onClick={() => setCartOpen(false)}
            aria-label="Close cart"
            data-testid="close-cart-btn"
            className="p-2 hover:bg-cream-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 && (
            <div className="text-center py-16 text-stone-500 text-sm">
              Your bag is empty. Explore our collection.
            </div>
          )}

          {cart.map(({ product, qty }) => (
            <div
              key={product.id}
              className="flex gap-4 border-b border-cream-200 pb-4"
              data-testid={`cart-item-${product.id}`}
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-20 h-24 object-cover"
              />
              <div className="flex-1">
                <div className="text-[13px] text-stone-800 leading-snug">{product.name}</div>
                <div className="text-maroon-900 font-semibold text-sm mt-1">
                  ₹{(product.price * qty).toLocaleString("en-IN")}
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-cream-200">
                    <button
                      onClick={() => updateQty(product.id, qty - 1)}
                      className="w-8 h-8 grid place-items-center hover:bg-cream-100"
                      aria-label="Decrease"
                      data-testid={`cart-decrease-${product.id}`}
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-8 text-center text-sm">{qty}</span>
                    <button
                      onClick={() => updateQty(product.id, qty + 1)}
                      className="w-8 h-8 grid place-items-center hover:bg-cream-100"
                      aria-label="Increase"
                      data-testid={`cart-increase-${product.id}`}
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(product.id)}
                    className="text-[11px] tracking-widest text-stone-500 hover:text-maroon-900 uppercase"
                    data-testid={`cart-remove-${product.id}`}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-cream-200 p-6 space-y-4 bg-white">
            <div className="flex items-center justify-between">
              <span className="text-sm text-stone-600">Subtotal</span>
              <span className="font-display text-xl text-maroon-900">
                ₹{cartTotal.toLocaleString("en-IN")}
              </span>
            </div>
            <p className="text-xs text-stone-500">Shipping and taxes calculated at checkout.</p>
          <button
            className="w-full h-12 bg-maroon-900 text-cream-50 text-[11px] tracking-[0.28em] font-semibold hover:bg-maroon-700 transition-colors"
            data-testid="checkout-btn"
            onClick={() => { setCartOpen(false); nav("/checkout"); }}
          >
            PROCEED TO CHECKOUT
          </button>
          </div>
        )}
      </aside>
    </>
  );
}
