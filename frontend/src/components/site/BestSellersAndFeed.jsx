import { useEffect, useState } from "react";
import { Instagram, Star, ChevronRight } from "lucide-react";
import { fetchProducts, fetchReviews, fetchInstagram, subscribeNewsletter } from "@/lib/api";
import { toast } from "sonner";
import ProductCard from "./ProductCard";
import { SectionHeader } from "./NewArrivalsAndAside";

export default function BestSellersAndFeed() {
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [feed, setFeed] = useState([]);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewIdx, setReviewIdx] = useState(0);

  useEffect(() => {
    fetchProducts("best_sellers").then(setProducts).catch(() => {});
    fetchReviews().then(setReviews).catch(() => {});
    fetchInstagram().then(setFeed).catch(() => {});
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    try {
      await subscribeNewsletter(email);
      toast.success("Subscribed! Check your inbox for your 10% off code.");
      setEmail("");
    } catch (err) {
      toast.error("Could not subscribe. Please try a valid email.");
    } finally {
      setSubmitting(false);
    }
  };

  const activeReview = reviews[reviewIdx];

  return (
    <section
      className="max-w-[1400px] mx-auto px-6 py-14 grid grid-cols-1 lg:grid-cols-[1fr_1fr_320px] gap-8"
      data-testid="best-sellers-section"
    >
      {/* Best sellers */}
      <div>
        <SectionHeader title="Best Sellers" testId="best-sellers-header" />
        <div className="grid grid-cols-2 md:grid-cols-2 gap-5 md:gap-6">
          {products.slice(0, 6).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>

      {/* Instagram Feed */}
      <div data-testid="instagram-feed">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="text-[11px] tracking-[0.28em] text-gold-600 uppercase mb-1">
              Instagram
            </div>
            <h2 className="font-display text-2xl md:text-3xl text-maroon-900">
              @zarahatke_official
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {feed.map((f) => (
            <a
              key={f.id}
              href="#"
              className="relative aspect-square overflow-hidden group"
              data-testid={`insta-${f.id}`}
            >
              <img
                src={f.image}
                alt="Instagram"
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-maroon-950/0 group-hover:bg-maroon-950/40 transition-colors grid place-items-center">
                <Instagram
                  size={22}
                  className="text-cream-50 opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
            </a>
          ))}
        </div>
        <button
          className="mt-4 w-full h-11 border border-maroon-900 text-maroon-900 text-[11px] tracking-[0.24em] font-semibold hover:bg-maroon-900 hover:text-cream-50 transition-colors flex items-center justify-center gap-2"
          data-testid="follow-instagram-btn"
        >
          <Instagram size={14} /> FOLLOW US ON INSTAGRAM
        </button>
      </div>

      {/* Reviews + Newsletter */}
      <div className="flex flex-col gap-6">
        {/* Reviews */}
        <div className="border border-cream-200 bg-white p-6 min-h-[240px]" data-testid="customer-reviews">
          <div className="flex items-end justify-between mb-5">
            <div>
              <div className="text-[11px] tracking-[0.28em] text-gold-600 uppercase mb-1">
                Reviews
              </div>
              <h3 className="font-display text-xl text-maroon-900">Customer Love</h3>
            </div>
            <a href="#" className="text-[11px] tracking-[0.24em] font-semibold text-maroon-900 flex items-center gap-1">
              VIEW ALL <ChevronRight size={12} />
            </a>
          </div>

          {activeReview && (
            <div className="animate-fade-up" key={activeReview.id}>
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={activeReview.avatar}
                  alt={activeReview.name}
                  className="w-10 h-10 rounded-full object-cover border border-cream-200"
                />
                <div className="flex gap-0.5">
                  {Array.from({ length: activeReview.rating }).map((_, i) => (
                    <Star key={i} size={12} className="fill-gold-500 text-gold-500" />
                  ))}
                </div>
              </div>
              <p className="text-sm text-stone-700 leading-relaxed italic">
                &ldquo;{activeReview.text}&rdquo;
              </p>
              <div className="mt-3 text-[12px] text-maroon-900 font-semibold">
                — {activeReview.name}, {activeReview.location}
              </div>
            </div>
          )}

          {reviews.length > 1 && (
            <div className="flex gap-1.5 mt-4">
              {reviews.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setReviewIdx(i)}
                  className={`h-1 transition-all ${
                    i === reviewIdx ? "w-6 bg-maroon-900" : "w-3 bg-cream-200"
                  }`}
                  aria-label={`Review ${i + 1}`}
                  data-testid={`review-dot-${i}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Newsletter */}
        <div
          className="bg-cream-100 border border-cream-200 p-6 text-center"
          data-testid="newsletter-card"
        >
          <div className="text-[11px] tracking-[0.28em] text-gold-600 uppercase mb-2">
            Subscribe
          </div>
          <h3 className="font-display text-3xl text-maroon-900 leading-tight">
            GET 10% OFF
          </h3>
          <div className="text-xs text-stone-600 mt-1">ON YOUR FIRST ORDER</div>
          <p className="text-xs text-stone-500 mt-3 leading-relaxed">
            Subscribe to our newsletter for exclusive offers & updates.
          </p>
          <form onSubmit={handleSubscribe} className="mt-4 space-y-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full h-11 px-4 bg-white border border-cream-200 text-sm outline-none focus:border-maroon-900 transition-colors placeholder:text-stone-400"
              data-testid="newsletter-email-input"
            />
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-11 bg-maroon-900 text-cream-50 text-[11px] tracking-[0.28em] font-semibold hover:bg-maroon-700 transition-colors disabled:opacity-70"
              data-testid="newsletter-submit-btn"
            >
              {submitting ? "SUBSCRIBING..." : "SUBSCRIBE"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
