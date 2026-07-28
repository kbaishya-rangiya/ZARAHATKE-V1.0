import { useEffect, useRef, useState } from "react";
import { X, Upload, Save } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { API } from "@/lib/api";

const CATEGORY_OPTIONS = [
  "Sarees", "Kurtis", "Kurta Sets", "Lehengas",
  "Dupattas", "Co-ord Sets", "Wedding Collection", "Dresses",
];

export default function EditProductModal({ product, token, onClose, onSaved }) {
  const [form, setForm] = useState(() => ({
    name: product.name || "",
    price: String(product.price || ""),
    original_price: product.original_price ? String(product.original_price) : "",
    category: product.category || CATEGORY_OPTIONS[0],
    section: product.section || "new_arrivals",
    tag: product.tag || "",
    description: product.description || "",
    image: product.image || "",
  }));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const previewSrc = form.image?.startsWith("/api/")
    ? `${process.env.REACT_APP_BACKEND_URL}${form.image}`
    : form.image;

  const handleReupload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await axios.post(`${API}/admin/upload`, fd, {
        headers: { ...headers, "Content-Type": "multipart/form-data" },
      });
      setForm((f) => ({ ...f, image: res.data.url }));
      toast.success("New image uploaded");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        price: parseInt(form.price, 10),
        category: form.category,
        section: form.section,
        image: form.image,
        description: form.description || null,
        tag: form.tag || null,
        original_price: form.original_price ? parseInt(form.original_price, 10) : null,
      };
      await axios.patch(`${API}/admin/products/${product.id}`, payload, { headers });
      toast.success("Product updated");
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Could not save changes");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-maroon-950/70 z-[60] flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
      data-testid="edit-product-modal"
    >
      <div
        className="bg-cream-50 w-full max-w-3xl max-h-[92vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-cream-50 z-10 flex items-center justify-between px-6 h-14 border-b border-cream-200">
          <div>
            <div className="text-[10px] tracking-[0.28em] text-gold-600 uppercase">Editing</div>
            <div className="font-display text-lg text-maroon-900 leading-tight">{product.name}</div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 grid place-items-center hover:bg-cream-100"
            data-testid="edit-close-btn"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
          {/* Image column */}
          <div>
            <div className="text-[11px] tracking-[0.2em] uppercase text-stone-600 mb-2">Photo</div>
            <div className="relative aspect-[3/4] bg-cream-100 overflow-hidden border border-cream-200">
              {previewSrc && (
                <img src={previewSrc} alt="preview" className="w-full h-full object-cover" data-testid="edit-image-preview" />
              )}
            </div>
            <label className="mt-3 h-10 px-3 border border-maroon-900 text-maroon-900 hover:bg-maroon-900 hover:text-cream-50 transition-colors text-[11px] tracking-widest font-semibold flex items-center justify-center gap-2 cursor-pointer">
              <Upload size={13} />
              {uploading ? "UPLOADING…" : "REPLACE PHOTO"}
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleReupload}
                className="hidden"
                disabled={uploading}
                data-testid="edit-reupload-input"
              />
            </label>
          </div>

          {/* Fields column */}
          <div className="space-y-3">
            <Row label="Name">
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full h-10 px-3 bg-white border border-cream-200 text-sm outline-none focus:border-maroon-900"
                data-testid="edit-name"
              />
            </Row>
            <div className="grid grid-cols-2 gap-3">
              <Row label="Price (₹)">
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                  className="w-full h-10 px-3 bg-white border border-cream-200 text-sm outline-none focus:border-maroon-900"
                  data-testid="edit-price"
                />
              </Row>
              <Row label="Compare price (₹)">
                <input
                  type="number"
                  value={form.original_price}
                  onChange={(e) => setForm({ ...form, original_price: e.target.value })}
                  placeholder="Optional"
                  className="w-full h-10 px-3 bg-white border border-cream-200 text-sm outline-none focus:border-maroon-900"
                  data-testid="edit-original-price"
                />
              </Row>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Row label="Category">
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full h-10 px-3 bg-white border border-cream-200 text-sm outline-none focus:border-maroon-900"
                  data-testid="edit-category"
                >
                  {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Row>
              <Row label="Section">
                <select
                  value={form.section}
                  onChange={(e) => setForm({ ...form, section: e.target.value })}
                  className="w-full h-10 px-3 bg-white border border-cream-200 text-sm outline-none focus:border-maroon-900"
                  data-testid="edit-section"
                >
                  <option value="new_arrivals">New Arrivals</option>
                  <option value="best_sellers">Best Sellers</option>
                </select>
              </Row>
            </div>
            <Row label="Tag">
              <select
                value={form.tag}
                onChange={(e) => setForm({ ...form, tag: e.target.value })}
                className="w-full h-10 px-3 bg-white border border-cream-200 text-sm outline-none focus:border-maroon-900"
                data-testid="edit-tag"
              >
                <option value="">None</option>
                <option value="NEW">NEW</option>
                <option value="SALE">SALE</option>
              </select>
            </Row>
            <Row label="Description">
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 bg-white border border-cream-200 text-sm outline-none focus:border-maroon-900 resize-none"
                data-testid="edit-description"
              />
            </Row>

            <div className="flex items-center gap-3 pt-4 border-t border-cream-200 mt-4">
              <button
                type="button"
                onClick={onClose}
                className="h-11 px-6 border border-cream-200 text-stone-700 text-[11px] tracking-widest font-semibold hover:border-maroon-900 hover:text-maroon-900 transition-colors"
                data-testid="edit-cancel-btn"
              >
                CANCEL
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 h-11 bg-maroon-900 text-cream-50 text-[11px] tracking-widest font-semibold hover:bg-maroon-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                data-testid="edit-save-btn"
              >
                <Save size={13} /> {saving ? "SAVING…" : "SAVE CHANGES"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <label className="block">
      <span className="text-[11px] tracking-[0.2em] uppercase text-stone-600 mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}
